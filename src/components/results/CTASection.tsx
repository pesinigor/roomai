"use client";

import { Mail, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@youragency.com";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/90 backdrop-blur-sm px-4 py-3 shadow-lg no-print">
      <div className="mx-auto max-w-6xl flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Love one of these designs?
          </p>
          <p className="text-xs text-muted-foreground">
            Our team can bring it to life — from contractor sourcing to furniture shopping.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Save as PDF
          </Button>
          <Button
            size="sm"
            className="gap-2"
            asChild
          >
            <a href={`mailto:${contactEmail}?subject=Interior Design Inquiry&body=Hi! I just used RoomAI and would love to move forward with one of my design proposals.`}>
              <Mail className="h-4 w-4" />
              Talk to a Designer
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
