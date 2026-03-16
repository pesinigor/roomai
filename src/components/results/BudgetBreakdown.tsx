import { formatCurrency } from "@/lib/utils";
import type { BudgetBreakdown as BudgetBreakdownType } from "@/types";

interface BudgetBreakdownProps {
  breakdown: BudgetBreakdownType;
}

const CATEGORIES = [
  { key: "furniture" as const, label: "Furniture", color: "bg-primary" },
  { key: "labor" as const, label: "Labor", color: "bg-secondary" },
  { key: "decorAndAccessories" as const, label: "Decor & Accessories", color: "bg-accent" },
  { key: "contingency" as const, label: "Contingency", color: "bg-muted-foreground" },
] as const;

export function BudgetBreakdown({ breakdown }: BudgetBreakdownProps) {
  // Recalculate total from parts in case GPT math is slightly off
  const calculatedTotal =
    breakdown.furniture +
    breakdown.labor +
    breakdown.decorAndAccessories +
    breakdown.contingency;
  const total = calculatedTotal || breakdown.total;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Budget breakdown</h3>
        <span className="text-lg font-bold text-primary">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted mb-4">
        {CATEGORIES.map(({ key, color }) => {
          const pct = total > 0 ? (breakdown[key] / total) * 100 : 0;
          return pct > 0 ? (
            <div
              key={key}
              className={`${color} h-full first:rounded-l-full last:rounded-r-full transition-all`}
              style={{ width: `${pct}%` }}
            />
          ) : null;
        })}
      </div>

      {/* Itemized table */}
      <div className="space-y-2">
        {CATEGORIES.map(({ key, label, color }) => {
          const amount = breakdown[key];
          const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
          return (
            <div key={key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                <span className="text-muted-foreground">{label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {pct}%
                </span>
                <span className="font-medium text-foreground w-20 text-right">
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between text-sm border-t border-border pt-2 mt-2">
          <span className="font-semibold text-foreground">Total estimate</span>
          <span className="font-bold text-foreground">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
