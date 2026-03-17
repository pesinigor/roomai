"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProposalCard } from "./ProposalCard";
import { formatCurrency } from "@/lib/utils";
import type { DesignProposal } from "@/types";

interface ProposalGridProps {
  proposals: DesignProposal[];
  renderUrls: Record<string, string | null | undefined>;
  onRetryRender?: (proposalId: string) => void;
  retryingIds?: Record<string, boolean>;
}

export function ProposalGrid({ proposals, renderUrls, onRetryRender, retryingIds }: ProposalGridProps) {
  return (
    <Tabs defaultValue="proposal_1" className="w-full">
      <TabsList className="w-full h-auto p-1 grid grid-cols-3 mb-6">
        {proposals.map((proposal, i) => (
          <TabsTrigger
            key={proposal.id}
            value={proposal.id}
            className="flex flex-col gap-0.5 py-2.5 px-2 h-auto data-[state=active]:shadow"
          >
            <span className="text-xs font-semibold">Option {i + 1}</span>
            <span className="text-[11px] text-muted-foreground font-normal hidden sm:block truncate max-w-[120px]">
              {proposal.styleName}
            </span>
            <span className="text-[11px] font-medium text-primary">
              {formatCurrency(proposal.budgetBreakdown.total)}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      {proposals.map((proposal, i) => (
        <TabsContent key={proposal.id} value={proposal.id}>
          <ProposalCard
            proposal={proposal}
            index={i}
            renderUrl={renderUrls[proposal.id]}
            onRetryRender={onRetryRender ? () => onRetryRender(proposal.id) : undefined}
            isRetrying={retryingIds?.[proposal.id] ?? false}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
