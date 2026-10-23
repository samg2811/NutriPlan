import { NextResponse } from "next/server";
import { parseMeal } from "@/lib/parseMeal";
import { lookupPer100g } from "@/lib/logusda";

export const maxDuration = 30;

export async function POST(req: Request) {
  const started = Date.now();

  try {
    const { text } = await req.json();
    if (typeof text !== "string" || !text.trim() || text.length > 500) {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    // 1. AI turns the sentence into foods + gram amounts
    const parsed = await parseMeal(text);
    console.log(`parseMeal done in ${Date.now() - started}ms`);

    if (parsed.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // 2. Look up each food in USDA (in parallel)
    const results = await Promise.all(
      parsed.map(async (p) => {
        const match = await lookupPer100g(p.searchTerm);
        if (!match) return null;
        return {
          name: p.name,
          quantity: p.quantity,
          unit: p.unit,
          grams: p.grams,
          matchedFood: match.description,
          per100g: match.per100g,
        };
      })
    );
    console.log(`USDA lookups done in ${Date.now() - started}ms`);

    const items = results.filter(Boolean);

    // Foods were found but none could be matched: likely USDA is slow or down
    if (items.length === 0) {
      return NextResponse.json(
        { error: "Couldn't reach the nutrition database. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ items });
  } catch (err) {
    console.error("analyze-meal-text error:", err);

    const e = err as { status?: number; name?: string };
    const busy =
      e?.status === 503 ||
      e?.status === 429 ||
      e?.name === "TimeoutError" ||
      e?.name === "AbortError";

    if (busy) {
      return NextResponse.json(
        { error: "The AI is busy right now. Please try again in a moment." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
