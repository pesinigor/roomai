"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { ProposalGrid } from "@/components/results/ProposalGrid";
import { CTASection } from "@/components/results/CTASection";
import { ProgressIndicator } from "@/components/shared/ProgressIndicator";
import { loadSession } from "@/lib/session-storage";
import { getRenderCache, setRenderCache } from "@/lib/render-cache";
import type { RoomAISession, DesignProposal } from "@/types";

export default function ResultsPage() {
  const router = useRouter();
  const [session, setSession] = useState<RoomAISession | null>(null);
  const [renderUrls, setRenderUrls] = useState<Record<string, string | undefined>>({});
  const [retryingIds, setRetryingIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadSession();
    if (!stored) {
      router.replace("/");
      return;
    }
    setSession(stored);
    setRenderUrls(getRenderCache());
    setLoading(false);
  }, [router]);

  const retryRender = useCallback(async (proposalId: string) => {
    if (!session) return;
    const proposal = session.analysisResult.proposals.find(
      (p: DesignProposal) => p.id === proposalId
    );
    if (!proposal) return;

    setRetryingIds((prev) => ({ ...prev, [proposalId]: true }));
    try {
      const imageBlob = await fetch(session.originalImageDataUrl).then((r) => r.blob());
      const fd = new FormData();
      fd.append("image", imageBlob, "room.png");
      fd.append("proposal", JSON.stringify({
        tier: proposal.tier,
        styleName: proposal.styleName,
        description: proposal.description,
        colorPalette: proposal.colorPalette,
        furnitureItems: proposal.furnitureItems,
        moodKeywords: proposal.moodKeywords,
        roomDescription: session.analysisResult.roomDescription,
      }));
      const res = await fetch("/api/render", { method: "POST", body: fd });
      const data = (await res.json()) as { imageUrl?: string };
      if (data.imageUrl) {
        setRenderUrls((prev) => {
          const updated = { ...prev, [proposalId]: data.imageUrl };
          setRenderCache(updated);
          return updated;
        });
      }
    } catch {
      // stays undefined — button stays visible for another retry
    } finally {
      setRetryingIds((prev) => ({ ...prev, [proposalId]: false }));
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (!session) return null;

  const { analysisResult, originalImageDataUrl } = session;

  return (
    <>
      <main className="flex-1 pb-32">
        {/* Progress */}
        <div className="border-b border-border bg-muted/30 py-4 no-print">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <ProgressIndicator currentStep={2} />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
          {/* Room photo + summary */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            {originalImageDataUrl && (
              <div className="shrink-0">
                <div className="h-32 w-44 overflow-hidden rounded-xl border border-border shadow-sm bg-muted sm:h-36 sm:w-52">
                  <img
                    src={originalImageDataUrl}
                    alt="Your room"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Your design proposals
              </h1>
              {analysisResult.roomDescription && (
                <div className="mt-3 flex gap-2 rounded-lg border border-border bg-muted/50 p-3">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysisResult.roomDescription}
                  </p>
                </div>
              )}
            </div>
          </div>

          <ProposalGrid
            proposals={analysisResult.proposals}
            renderUrls={renderUrls}
            onRetryRender={retryRender}
            retryingIds={retryingIds}
          />
        </div>
      </main>

      <CTASection />
    </>
  );
}
