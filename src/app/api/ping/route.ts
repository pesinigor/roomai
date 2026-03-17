import { NextResponse } from "next/server";
import openai from "@/lib/openai";

export const maxDuration = 30;

// Quick diagnostic — visit /api/ping to test OpenAI connectivity
export async function GET() {
  // Test 1: Check API key is set
  const hasKey = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "missing");
  if (!hasKey) {
    return NextResponse.json({ ok: false, error: "OPENAI_API_KEY is not set in environment variables" }, { status: 500 });
  }

  // Test 2: Make a minimal OpenAI call with gpt-4o-mini (cheapest, high rate limit)
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 10,
      messages: [{ role: "user", content: "Say: ok" }],
    });
    return NextResponse.json({
      ok: true,
      model: res.model,
      message: "OpenAI API key is working correctly",
    });
  } catch (err) {
    const e = err as { status?: number; message?: string; code?: string; type?: string };
    return NextResponse.json({
      ok: false,
      status: e.status,
      code: e.code,
      type: e.type,
      message: e.message,
    }, { status: 200 }); // always 200 so browser shows the JSON
  }
}
