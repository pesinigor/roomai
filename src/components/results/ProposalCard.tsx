import { CheckCircle2, Sparkles, Zap, Crown, Cpu } from "lucide-react";
import { ColorPalette } from "./ColorPalette";
import { BudgetBreakdown } from "./BudgetBreakdown";
import { FurnitureList } from "./FurnitureList";
import { Badge } from "@/components/ui/badge";
import type { DesignProposal, ProposalTier } from "@/types";

const TIER_CONFIG: Record<ProposalTier, { label: string; Icon: typeof Zap; className: string }> = {
  basic: {
    label: "Basic",
    Icon: Zap,
    className: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
  },
  premium: {
    label: "Premium",
    Icon: Crown,
    className: "bg-amber-500/15 text-amber-600 border border-amber-500/30",
  },
  smart: {
    label: "Smart",
    Icon: Cpu,
    className: "bg-blue-500/15 text-blue-600 border border-blue-500/30",
  },
};

interface ProposalCardProps {
  proposal: DesignProposal;
  index: number;
  // null = loading, string = image URL, undefined = failed/not available
  renderUrl: string | null | undefined;
  onRetryRender?: () => void;
  isRetrying?: boolean;
}

export function ProposalCard({ proposal, index, renderUrl, onRetryRender, isRetrying }: ProposalCardProps) {
  const tier = TIER_CONFIG[proposal.tier] ?? TIER_CONFIG.basic;
  const TierIcon = tier.Icon;
  return (
    <div className="animate-fade-in">
      {/* AI-generated room render */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
        {renderUrl === null ? (
          /* Loading skeleton */
          <div className="relative flex aspect-video w-full items-center justify-center bg-muted">
            <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer bg-[length:200%_100%]" />
            {/* Tier badge */}
            <div className={`absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tier.className}`}>
              <TierIcon className="h-3 w-3" />
              {tier.label}
            </div>
            <div className="relative flex flex-col items-center gap-2 text-muted-foreground">
              <Sparkles className="h-6 w-6 animate-pulse" />
              <p className="text-sm">Generating render…</p>
            </div>
          </div>
        ) : renderUrl ? (
          /* Render ready */
          <div className="relative">
            <img
              src={renderUrl}
              alt={`${proposal.styleName} room render`}
              className="w-full object-cover"
              style={{ maxHeight: "480px" }}
            />
            {/* Tier badge */}
            <div className={`absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${tier.className}`}>
              <TierIcon className="h-3 w-3" />
              {tier.label}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent px-5 py-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                    <h2 className="text-lg font-bold text-white">{proposal.styleName}</h2>
                  </div>
                  <p className="text-sm text-white/80">{proposal.tagline}</p>
                </div>
                <p className="text-xs text-white/50 shrink-0 ml-4">AI render</p>
              </div>
            </div>
          </div>
        ) : (
          /* Failed — show text header + retry button */
          <div className="px-5 py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{proposal.styleName}</h2>
                  <p className="text-sm text-primary">{proposal.tagline}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tier.className}`}>
                  <TierIcon className="h-3 w-3" />
                  {tier.label}
                </div>
                {onRetryRender && (
                  <button
                    onClick={onRetryRender}
                    disabled={isRetrying}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
                  >
                    {isRetrying ? (
                      <><Sparkles className="h-3 w-3 animate-pulse" />Generating…</>
                    ) : (
                      <><Sparkles className="h-3 w-3" />Generate render</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Show text header only when render loaded (it's overlaid on image when ready) */}
      {renderUrl === undefined && null /* header shown in the failed block above */}

      {/* Mood keywords */}
      {proposal.moodKeywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {proposal.moodKeywords.map((kw) => (
            <Badge key={kw} variant="muted" className="capitalize">
              {kw}
            </Badge>
          ))}
        </div>
      )}

      <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
        {proposal.description}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Key design changes
            </h3>
            <ul className="space-y-2">
              {proposal.keyChanges.map((change, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{change}</span>
                </li>
              ))}
            </ul>
          </div>

          <ColorPalette swatches={proposal.colorPalette} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <BudgetBreakdown breakdown={proposal.budgetBreakdown} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <FurnitureList items={proposal.furnitureItems} />
      </div>
    </div>
  );
}
