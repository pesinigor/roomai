import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompts";
import type { AnalyzeResponse, APIError, BudgetRange, StyleTag } from "@/types";

export const maxDuration = 60;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function errorResponse(
  error: APIError,
  status: number
): NextResponse<APIError> {
  return NextResponse.json(error, { status });
}

function validateProposals(data: unknown): data is AnalyzeResponse {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.proposals) || d.proposals.length !== 3) return false;
  if (typeof d.roomDescription !== "string") return false;
  if (typeof d.analysisId !== "string") return false;

  for (const p of d.proposals as unknown[]) {
    if (!p || typeof p !== "object") return false;
    const proposal = p as Record<string, unknown>;
    const required = [
      "id",
      "tier",
      "styleName",
      "tagline",
      "description",
      "keyChanges",
      "colorPalette",
      "furnitureItems",
      "budgetBreakdown",
      "moodKeywords",
    ];
    for (const field of required) {
      if (!(field in proposal)) return false;
    }
    if (!Array.isArray(proposal.colorPalette) || !Array.isArray(proposal.furnitureItems)) return false;
  }
  return true;
}


export async function POST(request: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(
      { error: "Invalid form data", code: "UNKNOWN" },
      400
    );
  }

  const imageFile = formData.get("image") as File | null;
  if (!imageFile) {
    return errorResponse(
      { error: "No image provided. Please upload a room photo.", code: "MISSING_IMAGE" },
      400
    );
  }

  if (!ALLOWED_TYPES.includes(imageFile.type)) {
    return errorResponse(
      { error: "Only JPEG, PNG, and WEBP images are supported.", code: "INVALID_IMAGE_TYPE" },
      400
    );
  }

  if (imageFile.size > MAX_SIZE_BYTES) {
    return errorResponse(
      { error: "Image must be under 10 MB.", code: "IMAGE_TOO_LARGE" },
      400
    );
  }

  const budgetRange = (formData.get("budgetRange") as BudgetRange) || undefined;
  let stylePreferences: StyleTag[] = [];
  const stylePrefsRaw = formData.get("stylePrefs") as string | null;
  if (stylePrefsRaw) {
    try {
      stylePreferences = JSON.parse(stylePrefsRaw) as StyleTag[];
    } catch {
      // ignore malformed style prefs
    }
  }

  let notes = (formData.get("notes") as string) || "";
  if (notes.length > 500) notes = notes.slice(0, 500);

  // Convert image to base64
  const buffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = imageFile.type;

  const userMessage = buildUserMessage({
    budgetRange,
    stylePreferences,
    additionalNotes: notes || undefined,
  });

  // Shared messages payload — same for primary and fallback model
  const messages: Parameters<typeof openai.chat.completions.create>[0]["messages"] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        { type: "text", text: userMessage },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64}`,
            detail: "auto",
          },
        },
      ],
    },
  ];

  const callOpenAI = (model: string) =>
    openai.chat.completions.create({
      model,
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
      messages,
    });

  try {
    // Primary: gpt-5.4 — fallback to gpt-4o on rate-limit
    let completion;
    try {
      completion = await callOpenAI("gpt-5.4");
    } catch (primaryErr) {
      const pe = primaryErr as { status?: number };
      if (pe.status === 429 || pe.status === 404) {
        console.warn(`[RoomAI] ${pe.status} on gpt-5.4, falling back to gpt-4o`);
        completion = await callOpenAI("gpt-4o");
      } else {
        throw primaryErr;
      }
    }

    const choice = completion.choices[0];
    const content = choice?.message?.content;
    if (!content) {
      console.error(
        "[RoomAI] Empty content from OpenAI. finish_reason:",
        choice?.finish_reason,
        "| usage:",
        completion.usage
      );
      return errorResponse(
        { error: "AI returned an empty response. Please try again.", code: "OPENAI_ERROR" },
        502
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse OpenAI response:", content.slice(0, 500));
      return errorResponse(
        { error: "AI response could not be parsed. Please try again.", code: "PARSE_ERROR" },
        422
      );
    }

    if (!validateProposals(parsed)) {
      console.error("Invalid proposal structure from OpenAI");
      return errorResponse(
        { error: "AI returned an unexpected format. Please try again.", code: "PARSE_ERROR" },
        422
      );
    }

    // Return proposals immediately — renders are fetched client-side via /api/render
    return NextResponse.json(parsed as AnalyzeResponse, { status: 200 });
  } catch (err) {
    const error = err as { status?: number; message?: string; name?: string; code?: string };
    console.error("[RoomAI] Outer catch:", error.message, "| status:", error.status, "| code:", error.code);

    if (error.name === "AbortError") {
      return errorResponse(
        { error: "Analysis timed out. Please try again with a smaller image.", code: "OPENAI_ERROR" },
        504
      );
    }
    if (error.status === 429) {
      // Distinguish quota exhausted (billing issue) from rate limit (slow down)
      if (error.code === "insufficient_quota" || error.message?.includes("quota")) {
        return errorResponse(
          { error: "OpenAI API quota exceeded. Please add credits at platform.openai.com/settings/billing.", code: "RATE_LIMITED" },
          429
        );
      }
      return errorResponse(
        { error: "Service is busy. Please wait a moment and try again.", code: "RATE_LIMITED" },
        429
      );
    }
    if (error.status === 404) {
      console.error("[RoomAI] Model not found. Check model name.");
      return errorResponse(
        { error: "AI model not found. Please contact support.", code: "OPENAI_ERROR" },
        502
      );
    }
    if (error.status === 504) {
      return errorResponse(
        { error: "Analysis timed out. Try a smaller or lower-resolution photo.", code: "OPENAI_ERROR" },
        504
      );
    }
    if (error.status && error.status >= 500) {
      return errorResponse(
        { error: "AI service is temporarily unavailable. Please try again.", code: "OPENAI_ERROR" },
        502
      );
    }

    console.error("Unexpected API error:", error.message, "| status:", error.status, "| name:", error.name);
    return errorResponse(
      { error: `An unexpected error occurred: ${error.message ?? "unknown"}. Please try again.`, code: "UNKNOWN" },
      500
    );
  }
}
