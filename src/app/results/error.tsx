"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// Note: Button used only for onClick (reset), Link is styled manually

export default function ResultsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center py-20">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Could not load results
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your session may have expired.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button variant="outline" onClick={reset}>
            Try again
          </Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Start over
          </Link>
        </div>
      </div>
    </main>
  );
}
