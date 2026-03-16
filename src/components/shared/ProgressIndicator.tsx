import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: 1 | 2;
}

const steps = [
  { number: 1, label: "Upload & Preferences" },
  { number: 2, label: "Your Design Proposals" },
];

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 no-print">
      {steps.map((step, i) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                step.number <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.number}
            </div>
            <span
              className={cn(
                "hidden text-sm sm:block",
                step.number <= currentStep
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "mx-3 h-px w-12 transition-colors",
                currentStep > step.number ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
