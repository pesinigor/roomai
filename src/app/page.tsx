"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Zap, Palette, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload/UploadZone";
import { PreferencesForm } from "@/components/upload/PreferencesForm";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ProgressIndicator } from "@/components/shared/ProgressIndicator";
import { saveSession, clearSession } from "@/lib/session-storage";
import { clearRenderCache } from "@/lib/render-cache";
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

export default function HomePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preferences, setPreferences] = useState<AnalyzeRequest>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isAnalyzing) return;

    setError(null);
    setIsAnalyzing(true);
    clearSession();
    clearRenderCache();

    // Fire warmup GET to pre-heat the render container while analysis runs
    fetch("/api/render").catch(() => {
      /* ignore — this is just a warmup ping */
    });

    try {
      // ── Analyze room ────────────────────────────────────────────────────────
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
        setIsAnalyzing(false);
        return;
      }

      const analysisData = data as AnalyzeResponse;
      const imageDataUrl = await fileToDataUrl(selectedFile);

      saveSession({
        analysisResult: analysisData,
        originalImageDataUrl: imageDataUrl,
        preferences,
        timestamp: Date.now(),
      });

      // Navigate immediately — renders will load progressively on the results page
      router.push("/results");
    } catch {
      setError({
        error: "Network error. Please check your connection and try again.",
        code: "UNKNOWN",
      });
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      {isAnalyzing && <LoadingSpinner />}

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
              disabled={!selectedFile || isAnalyzing}
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
