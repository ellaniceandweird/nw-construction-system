import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side route that sends an uploaded drawing (image or PDF) to
 * Claude's vision-capable API and asks it to draft estimate line items
 * from it. This is a REAL API call, not a canned demo — it requires an
 * ANTHROPIC_API_KEY in your .env.local to actually run. Without one, it
 * returns a clear setup error rather than pretending to work.
 *
 * Setup:
 *   1. Get a key from https://console.anthropic.com
 *   2. Add ANTHROPIC_API_KEY=sk-ant-... to a .env.local file in the project root
 *   3. Restart `npm run dev`
 */

const SYSTEM_PROMPT = `You are assisting a residential construction estimator. You will be shown a construction drawing, floor plan, elevation, or sketch. Identify visible scope of work and draft preliminary estimate line items.

Respond with ONLY a JSON array (no markdown fences, no other text) of objects shaped like:
[{ "description": string, "quantity": number, "unit": string, "estimatedUnitCost": number, "costCodeGuess": string, "confidence": "high" | "medium" | "low", "note": string }]

Rules:
- Base quantities only on what's actually labeled or clearly measurable in the drawing. If a dimension isn't legible, use "confidence": "low" and explain the assumption in "note".
- unit should be a normal construction unit: sf, lf, cy, each, sq, gallons, hours, etc.
- estimatedUnitCost should be a realistic current US residential construction rate for that scope — flag it as an assumption in "note" since you don't have this contractor's actual pricing.
- costCodeGuess should be a short CSI-style guess like "07040" for siding, "085000" for windows, etc.
- Never invent scope that isn't visible in the drawing. If the drawing is unclear or you can't identify actionable scope, return an empty array.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY isn't configured. Add it to a .env.local file in the project root (get a key at console.anthropic.com), then restart `npm run dev`.",
      },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Data = buffer.toString("base64");
  const isPdf = file.type === "application/pdf";

  const contentBlock = isPdf
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64Data } }
    : { type: "image", source: { type: "base64", media_type: file.type || "image/png", data: base64Data } };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              contentBlock,
              { type: "text", text: "Draft estimate line items for the scope of work shown in this drawing." },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Anthropic API returned an error (${response.status}): ${errText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = data.content
      ?.filter((block: { type: string }) => block.type === "text")
      .map((block: { text: string }) => block.text)
      .join("\n") ?? "";

    let lineItems: unknown;
    try {
      const cleaned = text.replace(/```json|```/g, "").trim();
      lineItems = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Claude responded, but not with valid JSON. Try again, or try a clearer drawing." },
        { status: 502 }
      );
    }

    return NextResponse.json({ lineItems });
  } catch (err) {
    return NextResponse.json(
      { error: `Request to Anthropic API failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
