import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side route for the AI Assistant chat. This is a REAL API call,
 * not a canned demo — it requires an ANTHROPIC_API_KEY in .env.local to
 * actually run, same as Estimating's "Generate from Drawing" feature.
 * Without one, it returns a clear setup error rather than pretending to work.
 *
 * Setup:
 *   1. Get a key from https://console.anthropic.com
 *   2. Add ANTHROPIC_API_KEY=sk-ant-... to a .env.local file in the project root
 *   3. Restart `npm run dev`
 */

const SYSTEM_PROMPT_PREFIX = `You are the internal operations assistant for Nice & Weird Group, a real estate company that manages and renovates its own properties (not a general contractor bidding external client work). You'll be given a snapshot of their real current business data — properties, projects, budgets, actual spend, open maintenance tasks, change orders, invoices, and contacts — followed by a question.

Answer using ONLY the data provided below. If the answer isn't in the data, say so plainly rather than guessing or inventing numbers. Keep answers concise and in plain language — the person you're talking to is not a construction or software expert. When you cite a number, make sure it actually appears in the data below.

CURRENT DATA SNAPSHOT:
`;

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

  const body = await req.json();
  const { messages, dataDigest } = body as {
    messages: { role: "user" | "assistant"; content: string }[];
    dataDigest: string;
  };

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: "No messages were provided." }, { status: 400 });
  }

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
        max_tokens: 1200,
        system: SYSTEM_PROMPT_PREFIX + dataDigest,
        messages,
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
    const text =
      data.content
        ?.filter((block: { type: string }) => block.type === "text")
        .map((block: { text: string }) => block.text)
        .join("\n") ?? "";

    return NextResponse.json({ reply: text });
  } catch (err) {
    return NextResponse.json(
      { error: `Something went wrong reaching the Anthropic API: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
