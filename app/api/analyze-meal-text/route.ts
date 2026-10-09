
import { NextResponse } from "next/server";
import { parseMeal } from "@/lib/parseMeal";
import { lookupPer100g } from "@/lib/usda";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (typeof text !== "string" || !text.trim() || text.length > 500) {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    // 1. LLM turns the sentence into foods + gram amounts
    const parsed = await parseMeal(text);

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

    return NextResponse.json({ items: results.filter(Boolean) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
