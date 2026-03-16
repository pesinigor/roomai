"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { AnalyzeRequest, BudgetRange, StyleTag } from "@/types";

const STYLE_OPTIONS: { value: StyleTag; label: string }[] = [
  { value: "modern", label: "Modern" },
  { value: "scandinavian", label: "Scandinavian" },
  { value: "industrial", label: "Industrial" },
  { value: "bohemian", label: "Bohemian" },
  { value: "traditional", label: "Traditional" },
  { value: "minimalist", label: "Minimalist" },
  { value: "maximalist", label: "Maximalist" },
  { value: "coastal", label: "Coastal" },
  { value: "mid_century", label: "Mid-Century" },
];

interface PreferencesFormProps {
  value: AnalyzeRequest;
  onChange: (v: AnalyzeRequest) => void;
}

export function PreferencesForm({ value, onChange }: PreferencesFormProps) {
  const [open, setOpen] = useState(false);
  const hasPrefs =
    value.budgetRange ||
    (value.stylePreferences && value.stylePreferences.length > 0) ||
    value.additionalNotes;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <span className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            Preferences
            {hasPrefs && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-semibold">
                set
              </span>
            )}
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 rounded-lg border border-border bg-card p-5 space-y-5">
        {/* Budget Range */}
        <div className="space-y-2">
          <Label>Budget range</Label>
          <Select
            value={value.budgetRange || ""}
            onValueChange={(v) =>
              onChange({ ...value, budgetRange: v as BudgetRange || undefined })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under_5k">Under $5,000</SelectItem>
              <SelectItem value="5k_to_15k">$5,000 – $15,000</SelectItem>
              <SelectItem value="15k_to_30k">$15,000 – $30,000</SelectItem>
              <SelectItem value="over_30k">Over $30,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Style preferences */}
        <div className="space-y-2">
          <Label>Style preferences (optional — pick any)</Label>
          <ToggleGroup
            type="multiple"
            value={value.stylePreferences || []}
            onValueChange={(v) =>
              onChange({ ...value, stylePreferences: v as StyleTag[] })
            }
          >
            {STYLE_OPTIONS.map((style) => (
              <ToggleGroupItem key={style.value} value={style.value}>
                {style.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="e.g. Keep the existing sofa. Need more storage. Family with young kids."
            value={value.additionalNotes || ""}
            onChange={(e) =>
              onChange({ ...value, additionalNotes: e.target.value.slice(0, 500) })
            }
            rows={3}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(value.additionalNotes || "").length}/500
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
