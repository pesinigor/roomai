import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { APIError } from "@/types";

const ERROR_MESSAGES: Record<APIError["code"], string> = {
  MISSING_IMAGE: "Please select a room photo to analyze.",
  IMAGE_TOO_LARGE: "Your image is too large. Please use an image under 10 MB.",
  INVALID_IMAGE_TYPE: "Only JPEG, PNG, and WEBP images are supported.",
  INVALID_INPUT: "Some of your input is invalid. Please check and try again.",
  OPENAI_ERROR:
    "Our AI service is temporarily unavailable. Please try again in a moment.",
  PARSE_ERROR:
    "The AI returned an unexpected response. Please try again.",
  RATE_LIMITED:
    "We're experiencing high demand. Please wait a moment and try again.",
  UNKNOWN: "Something went wrong. Please try again.",
};

interface ErrorMessageProps {
  code: APIError["code"];
  message?: string;
  onRetry: () => void;
}

export function ErrorMessage({ code, message, onRetry }: ErrorMessageProps) {
  const displayMessage = message || ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN;

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
      <div className="flex gap-3">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-destructive">
            Analysis failed
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{displayMessage}</p>
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="mt-3 gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
