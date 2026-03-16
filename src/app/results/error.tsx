"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
          <Button asChild>
            <Link href="/">Start over</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
