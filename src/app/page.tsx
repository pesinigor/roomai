"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Zap, Palette, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload/UploadZone";
import { PreferencesForm } from "@/components/upload/PreferencesForm";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { RenderProgress } from "@/components/shared/RenderProgress";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ProgressIndicator } from "@/components/shared/ProgressIndicator";
import { saveSession, clearSession } from "@/lib/session-storage";
import { setRenderCache, clearRenderCache } from "@/lib/render-cache";
import { fileToDataUrl } from "@/lib/image-utils";
import type { AnalyzeRequest, AnalyzeResponse, APIError } from "@/types";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant analysis",
    description: "AI reads your room's layout, lighting, and current style.",
  },
  {
    icon: Palette,
    title: "3 design concepts",
    description: "Basic refresh, full premium renovation, and smart minimalist.",
  },
  {
    icon: Calculator,
    title: "Budget breakdown",
    description: "Itemized estimates for furniture, labor, and accessories.",
  },
];

type Phase = "idle" | "analyzing" | "rendering";

export default function HomePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preferences, setPreferences] = useState<AnalyzeRequest>({});
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<APIError | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [renderProgress, setRenderProgress] = useState<
    Record<string, "pending" | "done" | "failed">
  >({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || phase !== "idle") return;

    setError(null);
    setPhase("analyzing");
    clearSession();
    clearRenderCache();

    try {
      // ── Phase 1: Analyze room ──────────────────────────────────────────────
      const formData = new FormData();
      formData.append("image", selectedFile);
      if (preferences.budgetRange)
        formData.append("budgetRange", preferences.budgetRange);
      if (preferences.stylePreferences?.length)
        formData.append("stylePrefs", JSON.stringify(preferences.stylePreferences));
      if (preferences.additionalNotes)
        formData.append("notes", preferences.additionalNotes);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data as APIError);
        setPhase("idle");
        return;
      }

      const analysisData = data as AnalyzeResponse;

      // Convert image to data URL + Blob once; reuse for all 3 renders
      const imageDataUrl = await fileToDataUrl(selectedFile);
      const imageBlob = await fetch(imageDataUrl).then((r) => r.blob());

      // ── Phase 2: Generate renders ──────────────────────────────────────────
      const initial: Record<string, "pending"> = {};
      analysisData.proposals.forEach((p) => { initial[p.id] = "pending"; });
      setRenderProgress(initial);
      setAnalysisResult(analysisData);
      setPhase("rendering");

      const collectedUrls: Record<string, string | undefined> = {};
      let completedCount = 0;
      const total = analysisData.proposals.length;

      // Stagger renders 3 s apart to avoid rate-limit spikes
      analysisData.proposals.forEach((proposal, idx) => {
        setTimeout(async () => {
          try {
            const fd = new FormData();
            fd.append("image", imageBlob, "room.png");
            fd.append(
              "proposal",
              JSON.stringify({
                tier: proposal.tier,
                styleName: proposal.styleName,
                description: proposal.description,
                colorPalette: proposal.colorPalette,
                furnitureItems: proposal.furnitureItems,
                moodKeywords: proposal.moodKeywords,
                roomDescription: analysisData.roomDescription,
              })
            );

            const renderRes = await fetch("/api/render", {
              method: "POST",
              body: fd,
            });
            const renderData = (await renderRes.json()) as { imageUrl?: string };
            collectedUrls[proposal.id] = renderData.imageUrl;
            setRenderProgress((prev) => ({
              ...prev,
              [proposal.id]: renderData.imageUrl ? "done" : "failed",
            }));
          } catch {
            collectedUrls[proposal.id] = undefined;
            setRenderProgress((prev) => ({
              ...prev,
              [proposal.id]: "failed",
            }));
          }

          completedCount++;
          if (completedCount >= total) {
            // All renders done or failed — navigate to results
            setRenderCache(collectedUrls);
            saveSession({
              analysisResult: analysisData,
              originalImageDataUrl: imageDataUrl,
              preferences,
              timestamp: Date.now(),
            });
            router.push("/results");
          }
        }, idx * 3000);
      });
    } catch {
      setError({
        error: "Network error. Please check your connection and try again.",
        code: "UNKNOWN",
      });
      setPhase("idle");
    }
  };

  return (
    <>
      {phase === "analyzing" && <LoadingSpinner />}
      {phase === "rendering" && analysisResult && (
        <RenderProgress proposals={analysisResult.proposals} progress={renderProgress} />
      )}

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-14 sm:py-20">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <div className="mb-4">
              <ProgressIndicator currentStep={1} />
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Transform your room{" "}
              <span className="text-primary">with AI design</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Upload a photo of any room and get 3 professional interior design
              proposals — complete with color palettes and budget estimates —
              in under a minute.
            </p>
          </div>
        </section>

        {/* Upload form */}
        <section className="mx-auto max-w-2xl px-4 sm:px-6 pb-20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <UploadZone
              selectedFile={selectedFile}
              onFileSelected={(file) => {
                setSelectedFile(file);
                setError(null);
              }}
              onRemove={() => setSelectedFile(null)}
            />

            <PreferencesForm value={preferences} onChange={setPreferences} />

            {error && (
              <ErrorMessage
                code={error.code}
                message={error.error}
                onRetry={() => setError(null)}
              />
            )}

            <Button
              type="submit"
              size="lg"
              disabled={!selectedFile || phase !== "idle"}
              className="w-full gap-2 text-base"
            >
              Analyze My Room
              <ArrowRight className="h-5 w-5" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Your photo is used only for this analysis and is not stored.
            </p>
          </form>
        </section>

        {/* Feature grid */}
        <section className="border-t border-border bg-muted/30 py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-center text-xl font-semibold text-foreground mb-8">
              What you get
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center text-center gap-3 p-5 rounded-xl bg-card border border-border"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
