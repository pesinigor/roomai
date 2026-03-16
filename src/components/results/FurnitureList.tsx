import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { FurnitureItem } from "@/types";

interface FurnitureListProps {
  items: FurnitureItem[];
}

const PRIORITY_ORDER = { essential: 0, recommended: 1, optional: 2 };

export function FurnitureList({ items }: FurnitureListProps) {
  const sorted = [...items].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Furniture & decor
      </h3>
      <div className="space-y-3">
        {sorted.map((item, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground truncate">
                  {item.name}
                </span>
                <Badge
                  variant={
                    item.priority === "essential"
                      ? "essential"
                      : item.priority === "recommended"
                      ? "recommended"
                      : "optional"
                  }
                  className="shrink-0 text-[10px]"
                >
                  {item.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {item.category} · {item.description}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(item.estimatedPrice)}
              </p>
              {item.priceRange.low !== item.priceRange.high && (
                <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatCurrency(item.priceRange.low)}–
                  {formatCurrency(item.priceRange.high)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
