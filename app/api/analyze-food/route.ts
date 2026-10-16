
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getIngredientNutritionPer100g } from "@/lib/usda";

export const runtime = "nodejs";

const MODEL = "gemini-3.8-flash";
const MAX_IMAGE_LENGTH = 12_000_000;
const MAX_RETRIES = 3;

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

function isRetryableError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error);

  return /\b(429|500|502|503|504)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|overloaded|timed out|timeout/i.test(
    message
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function identifyFood(
  apiKey: string,
  mimeType: string,
  base64Data: string
): Promise<DetectedPortion[]> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Inspect this photo of food.

Identify each distinct food item that is visibly present and estimate
the edible portion size in grams for each item. These are visual
estimates, not exact measurements.

Rules:
- Do not include plates, utensils, or non-food objects.
- Do not invent hidden ingredients.
- For mixed dishes, separate components only when reasonably distinguishable.
- Use specific food names when possible, including cooking method.
- Grams must be a number between 1 and 2000.
- Return at most 20 food items.
- If no food is recognizable, return an empty array.

Return only a valid JSON array in this format:
[{"name":"cooked white rice","grams":150}]
`;

  let responseText: string | undefined;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      responseText = result.text?.trim();
      break;
    } catch (error) {
      console.error(
        `Gemini food analysis attempt ${attempt + 1} failed:`,
        error
      );

      if (
        !isRetryableError(error) ||
        attempt === MAX_RETRIES - 1
      ) {
        throw error;
      }

      // Wait 1 second, then 2 seconds before retrying.
      await wait(1000 * (attempt + 1));
    }
  }

  if (!responseText) {
    throw new Error("Gemini returned an empty response.");
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

    // Step 1: Identify the foods and estimate their portions.
    const portions = await identifyFood(
      apiKey,
      mimeType,
      base64Data
    );

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

    // Step 2: Look up nutrition independently for each food.
    const foodPortions: FoodPortion[] = await Promise.all(
      portions.map(async (food) => {
        try {
          const per100g = await getIngredientNutritionPer100g(
            food.name
          );

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

    // Step 3: Total the nutrition values that were matched.
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

    if (isRetryableError(error)) {
      return NextResponse.json(
        {
          error:
            "The food analyzer is temporarily busy. Please try again shortly.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Food analysis failed. Check the photo and try again.",
      },
      { status: 500 }
    );
  }
}
