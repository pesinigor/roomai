"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const MESSAGES = [
  "Analyzing your room layout...",
  "Identifying design opportunities...",
  "Crafting 3 unique concepts...",
  "Calculating budget estimates...",
  "Selecting color palettes...",
  "Finalizing your proposals...",
];

export function LoadingSpinner() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 text-center px-6">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-primary" />
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">
            Designing your space
          </p>
          <p
            key={messageIndex}
            className="mt-1 text-sm text-muted-foreground animate-fade-in"
          >
            {MESSAGES[messageIndex]}
          </p>
        </div>
        <p className="text-xs text-muted-foreground max-w-xs">
          We are analyzing your room and creating personalized design
          concepts. This usually takes 20–40 seconds.
        </p>
      </div>
    </div>
  );
}
