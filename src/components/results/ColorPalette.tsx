"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { sanitizeHex } from "@/lib/utils";
import type { ColorSwatch } from "@/types";

interface ColorPaletteProps {
  swatches: ColorSwatch[];
}

export function ColorPalette({ swatches }: ColorPaletteProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("input");
      el.value = hex;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Color palette
      </h3>
      <div className="flex flex-wrap gap-2">
        {swatches.map((swatch, i) => {
          const hex = sanitizeHex(swatch.hex);
          const isCopied = copied === hex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleCopy(hex)}
              className="group relative flex flex-col items-center gap-1.5 transition-transform hover:scale-105"
              title={`${swatch.name} — ${hex}\nClick to copy`}
            >
              <div
                className="h-12 w-12 rounded-xl shadow-sm border border-black/10 transition-shadow group-hover:shadow-md"
                style={{ backgroundColor: hex }}
              />
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-foreground leading-none">
                  {swatch.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {hex}
                </span>
              </div>
              <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-card border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {isCopied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
