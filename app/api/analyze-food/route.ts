import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getIngredientNutritionPer100g } from "@/lib/usda";

export const runtime = "nodejs";
export const maxDuration = 30;

// Models are tried in order. Add a second model name here (one that is listed
// in Google AI Studio) to use it as a fallback when the first is overloaded.
const GEMINI_MODELS = ["gemini-3.8-flash"];

const MAX_IMAGE_LENGTH = 12_000_000;
const RETRIES_PER_MODEL = 3;

const emptyNutrition = () => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
});

type Nutrition = ReturnType<typeof emptyNutrition>;

type FoodPortion = {
  name: string;
  grams: number;
  nutrition: Nutrition | null;
};

type DetectedPortion = {
  name: string;
  grams: number;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Google is busy (503) or rate limiting (429)
function isBusyError(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  if (status === 503 || status === 429) return true;

  const message = error instanceof Error ? error.message : String(error);
  return /UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|\b503\b|\b429\b/i.test(
    message
  );
}

const PROMPT = `
Identify the foods visible in this photo.

Estimate the edible portion size in grams for each distinct food item.
These are visual estimates, not exact measurements.

Rules:
- Do not include plates, utensils, or other non-food objects.
- Do not invent ingredients that cannot reasonably be identified.
- For mixed dishes, separate components only when distinguishable.
- Use specific food names and cooking methods when possible.
- Grams must be a number from 1 to 2000.
- Return no more than 20 items.
- If no food is recognizable, return an empty array.

Return ONLY a JSON array, with no markdown or explanation:
[{"name":"cooked white rice","grams":150}]
`;

async function identifyFood(
  apiKey: string,
  mimeType: string,
  base64Data: string
): Promise<DetectedPortion[]> {
  const ai = new GoogleGenAI({ apiKey });

  let responseText = "";
  let lastError: unknown;

  outer: for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < RETRIES_PER_MODEL; attempt++) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                { text: PROMPT },
                { inlineData: { mimeType, data: base64Data } },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });

        const text = result.text?.trim();

        if (!text) {
          throw new Error("Gemini returned an empty response.");
        }

        responseText = text;
        break outer;
      } catch (error) {
        lastError = error;
        console.error(
          `Gemini (${model}) attempt ${attempt + 1} failed:`,
          error
        );

        // Only retry when Google is busy; anything else is a real error
        if (!isBusyError(error)) throw error;

        if (attempt < RETRIES_PER_MODEL - 1) {
          await wait(1000 * 2 ** attempt); // 1s, then 2s
        }
      }
    }
  }

  if (!responseText) {
    throw lastError ?? new Error("Gemini returned an empty response.");
  }

  // Remove optional markdown fences and recover a JSON array.
  responseText = responseText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const arrayStart = responseText.indexOf("[");
  const arrayEnd = responseText.lastIndexOf("]");

  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    responseText = responseText.slice(arrayStart, arrayEnd + 1);
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Gemini returned an invalid food list.");
  }

  return parsed
    .filter(
      (item): item is { name: unknown; grams: unknown } =>
        typeof item === "object" &&
        item !== null &&
        "name" in item &&
        "grams" in item
    )
    .map((item) => ({
      name: typeof item.name === "string" ? item.name.trim() : "",
      grams:
        typeof item.grams === "number"
          ? item.grams
          : Number(item.grams),
    }))
    .filter(
      (item) =>
        item.name.length > 0 &&
        Number.isFinite(item.grams) &&
        item.grams >= 1 &&
        item.grams <= 2000
    )
    .slice(0, 20);
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const usdaApiKey = process.env.USDA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing from Vercel settings." },
        { status: 500 }
      );
    }

    if (!usdaApiKey) {
      return NextResponse.json(
        { error: "USDA_API_KEY is missing from Vercel settings." },
        { status: 500 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "The request body must contain valid JSON." },
        { status: 400 }
      );
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Invalid photo request." },
        { status: 400 }
      );
    }

    const base64Image = (body as Record<string, unknown>).base64Image;
    const mimeType = (body as Record<string, unknown>).mimeType;

    if (
      typeof base64Image !== "string" ||
      typeof mimeType !== "string" ||
      !base64Image.trim()
    ) {
      return NextResponse.json(
        { error: "Photo data is missing." },
        { status: 400 }
      );
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
      return NextResponse.json(
        { error: "Use a JPEG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    const base64Data = base64Image.replace(
      /^data:image\/[^;]+;base64,/i,
      ""
    );

    if (
      !base64Data ||
      base64Data.length > MAX_IMAGE_LENGTH ||
      !/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)
    ) {
      return NextResponse.json(
        { error: "The image is invalid or too large." },
        { status: 413 }
      );
    }

    // Step 1: Identify foods and estimate portions with Gemini.
    const portions = await identifyFood(apiKey, mimeType, base64Data);

    if (portions.length === 0) {
      return NextResponse.json({
        foods: [],
        detectedIngredients: [],
        foodPortions: [],
        nutrition: emptyNutrition(),
        nutritionMatchedCount: 0,
        nutritionNote:
          "No recognizable food portions were found in this photo.",
      });
    }

    // Step 2: Look up each food independently using USDA.
    const foodPortions: FoodPortion[] = await Promise.all(
      portions.map(async (food) => {
        try {
          const per100g = await getIngredientNutritionPer100g(food.name);

          const factor = food.grams / 100;

          return {
            ...food,
            nutrition: {
              calories: per100g.calories * factor,
              protein: per100g.protein * factor,
              carbs: per100g.carbs * factor,
              fat: per100g.fat * factor,
              fiber: per100g.fiber * factor,
              sugar: per100g.sugar * factor,
              sodium: per100g.sodium * factor,
            },
          };
        } catch (error) {
          console.warn(
            `USDA nutrition lookup failed for ${food.name}:`,
            error
          );

          return {
            ...food,
            nutrition: null,
          };
        }
      })
    );

    // Step 3: Total only successfully matched nutrition values.
    const totals = foodPortions.reduce((sum, food) => {
      if (!food.nutrition) {
        return sum;
      }

      for (const key of Object.keys(sum) as (keyof Nutrition)[]) {
        sum[key] += food.nutrition[key];
      }

      return sum;
    }, emptyNutrition());

    const nutritionMatchedCount = foodPortions.filter(
      (food) => food.nutrition !== null
    ).length;

    const roundedNutrition = Object.fromEntries(
      Object.entries(totals).map(([key, value]) => [
        key,
        Math.round(value * 10) / 10,
      ])
    ) as Nutrition;

    let nutritionNote: string;

    if (nutritionMatchedCount === 0) {
      nutritionNote =
        "Foods were identified, but nutrition data could not be matched. Try reviewing the food names.";
    } else if (nutritionMatchedCount < foodPortions.length) {
      nutritionNote =
        "Nutrition totals include only foods matched to USDA data. Some items could not be matched.";
    } else {
      nutritionNote =
        "Portion sizes are visual estimates. Actual nutrition may differ from these estimates.";
    }

    // Preserve the existing frontend response fields.
    return NextResponse.json({
      foods: foodPortions.map((food) => food.name),
      detectedIngredients: foodPortions.map((food) => food.name),
      foodPortions,
      nutrition: roundedNutrition,
      nutritionMatchedCount,
      nutritionNote,
    });
  } catch (error) {
    console.error("Food analyzer error:", error);

    if (isBusyError(error)) {
      return NextResponse.json(
        {
          error: "The AI is busy right now. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Food analysis failed. Check the photo and try again.",
      },
      { status: 500 }
    );
  }
}
