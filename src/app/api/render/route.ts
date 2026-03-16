import { NextRequest, NextResponse } from "next/server";
import { toFile } from "openai";
import openai from "@/lib/openai";
import type { ColorSwatch, FurnitureItem, ProposalTier } from "@/types";

export const maxDuration = 120;

interface ProposalData {
  tier?: ProposalTier;
  styleName: string;
  description: string;
  colorPalette: ColorSwatch[];
  furnitureItems: FurnitureItem[];
  moodKeywords: string[];
  roomDescription: string;
}

function buildEditPrompt(data: ProposalData): string {
  const colorNames = data.colorPalette
    .slice(0, 4)
    .map((s) => `${s.name} (${s.hex})`)
    .join(", ");

  const essentialItems = data.furnitureItems
    .filter((i) => i.priority === "essential")
    .slice(0, 5)
    .map((i) => i.name)
    .join(", ");

  const tier = data.tier ?? "basic";

  if (tier === "premium") {
    return (
      `Transform this room into a luxury ${data.styleName} design. ` +
      `Keep the same camera viewpoint, room dimensions, windows, and doors. ` +
      `You MAY update: flooring material, wall colors or wallpaper, ceiling fixtures, and built-in elements. ` +
      `Add premium furniture (${essentialItems || "high-end pieces"}), ` +
      `statement lighting, custom window treatments, and upscale decorative accessories. ` +
      `Color palette: ${colorNames}. ` +
      `${data.description} ` +
      `Mood: ${data.moodKeywords.join(", ")}. ` +
      `Result should look like a high-end architectural magazine photo of a fully renovated room.`
    );
  }

  if (tier === "smart") {
    return (
      `Transform this room into a clean, minimalist ${data.styleName} design with smart home integration. ` +
      `IMPORTANT: Keep the exact same room structure — same walls, floors, ceiling height, windows, doors, ` +
      `architectural features, and camera viewpoint. Do NOT change the room's shape or layout. ` +
      `Remove visual clutter. Add: ${essentialItems || "minimal purposeful furniture"}, ` +
      `smart lighting system, neutral palette (${colorNames}), ` +
      `multi-functional furniture, and discreet tech accessories. ` +
      `${data.description} ` +
      `Mood: ${data.moodKeywords.join(", ")}. ` +
      `Result should look like a modern, clutter-free smart home interior design photo.`
    );
  }

  // basic (default)
  return (
    `Give this room a fresh, affordable makeover in ${data.styleName} style. ` +
    `IMPORTANT: Keep the exact same room structure — same walls, floors, ceiling height, windows, doors, ` +
    `architectural features, and camera viewpoint. Do NOT change the room's shape or layout. ` +
    `Only update: furniture (add ${essentialItems || "budget-friendly pieces"}), ` +
    `wall and accent colors (${colorNames}), textiles, soft furnishings, and decorative accessories. ` +
    `${data.description} ` +
    `Mood: ${data.moodKeywords.join(", ")}. ` +
    `Result should look like a practical, cozy room makeover interior photo.`
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const imageFile = formData.get("image") as File | null;
  const proposalRaw = formData.get("proposal") as string | null;

  if (!imageFile || !proposalRaw) {
    return NextResponse.json({ error: "Missing image or proposal data" }, { status: 400 });
  }

  let proposalData: ProposalData;
  try {
    proposalData = JSON.parse(proposalRaw) as ProposalData;
  } catch {
    return NextResponse.json({ error: "Invalid proposal JSON" }, { status: 400 });
  }

  const tier = proposalData.tier ?? "basic";
  // Premium gets the highest resolution; basic/smart use square for speed
  const size = tier === "premium" ? "1536x1024" : "1024x1024";

  try {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const openaiFile = await toFile(buffer, "room.png", { type: "image/png" });

    const prompt = buildEditPrompt(proposalData);
    console.log(`[RoomAI] Rendering ${tier} tier: ${proposalData.styleName}`);

    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: openaiFile,
      prompt,
      n: 1,
      size,
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      console.error("[RoomAI] No image data returned");
      return NextResponse.json({ error: "No image returned" }, { status: 502 });
    }

    console.log(`[RoomAI] Render ready — ${tier}: ${proposalData.styleName}`);
    return NextResponse.json(
      { imageUrl: `data:image/png;base64,${b64}` },
      { status: 200 }
    );
  } catch (err) {
    const error = err as { status?: number; message?: string; code?: string };
    console.error(
      `[RoomAI] Render error — ${tier} (${proposalData.styleName}):`,
      error.message,
      "| status:", error.status,
      "| code:", error.code
    );
    return NextResponse.json(
      { error: error.message || "Render failed" },
      { status: error.status ?? 502 }
    );
  }
}
