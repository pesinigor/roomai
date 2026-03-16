"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Zap, Crown, Cpu, Loader2 } from "lucide-react";
import type { DesignProposal, ProposalTier } from "@/types";

const TIER_CONFIG: Record<ProposalTier, { label: string; Icon: typeof Zap; color: string }> = {
  basic: { label: "Basic", Icon: Zap, color: "text-emerald-600" },
  premium: { label: "Premium", Icon: Crown, color: "text-amber-600" },
  smart: { label: "Smart", Icon: Cpu, color: "text-blue-600" },
};

interface RenderProgressProps {
  proposals: DesignProposal[];
  progress: Record<string, "pending" | "done" | "failed">;
}

export function RenderProgress({ proposals, progress }: RenderProgressProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const doneCount = Object.values(progress).filter((s) => s === "done").length;
  const totalCount = proposals.length;
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8 text-center px-6 max-w-sm w-full">
        {/* Header */}
        <div>
          <p className="text-xl font-semibold text-foreground">
            Generating your designs
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            AI is rendering each room —{" "}
            <span className="font-medium text-foreground">
              {doneCount} of {totalCount}
            </span>{" "}
            complete
          </p>
        </div>

        {/* Per-tier progress cards */}
        <div className="w-full space-y-3">
          {proposals.map((p) => {
            const tier = TIER_CONFIG[p.tier] ?? TIER_CONFIG.basic;
            const status = progress[p.id] ?? "pending";
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left"
              >
                <tier.Icon className={`h-4 w-4 shrink-0 ${tier.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {tier.label}
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {p.styleName}
                  </p>
                </div>
                {status === "pending" && (
                  <Loader2 className="h-4 w-4 shrink-0 text-muted-foreground animate-spin" />
                )}
                {status === "done" && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                )}
                {status === "failed" && (
                  <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>

        {/* Timer */}
        <p className="text-xs text-muted-foreground">
          Elapsed: {formatTime(elapsed)} · AI renders typically take 2–4 minutes
        </p>
      </div>
    </div>
  );
}
