import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getIngredientNutritionPer100g } from "@/lib/usda";

export const runtime = "nodejs";

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

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY in Vercel settings." },
        { status: 500 }
      );
    }

    if (!process.env.USDA_API_KEY) {
      return NextResponse.json(
        { error: "Missing USDA_API_KEY in Vercel settings." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const base64Image = body?.base64Image;
    const mimeType = body?.mimeType;

    if (
      typeof base64Image !== "string" ||
      typeof mimeType !== "string"
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
      /^data:image\/[^;]+;base64,/,
      ""
    );

    if (!base64Data || base64Data.length > 12_000_000) {
      return NextResponse.json(
        { error: "Image is missing or too large." },
        { status: 413 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      // Verify that this model ID is available to your Gemini API key.
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Inspect this photo of food. Identify each distinct food item that is visibly present and estimate the edible portion size in grams for each item. Use reasonable visual estimates; do not claim exact measurements. Do not include hidden ingredients, drinks, plates, or utensils. If the photo contains a mixed dish, list visible components separately only when reasonably distinguishable. Return only a valid JSON array, with each item shaped like {"name":"cooked white rice","grams":150}. Use specific descriptions when visible (for example, cooked chicken breast rather than just chicken). Grams must be a number from 1 to 2000. If no food is recognizable, return [].`,
            },
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

    const responseText = result.text?.trim();

    if (!responseText) {
      throw new Error("The AI returned an empty response.");
    }

    const parsed: unknown = JSON.parse(responseText);

    if (!Array.isArray(parsed)) {
      throw new Error("The AI returned an invalid food list.");
    }

    const portions: { name: string; grams: number }[] = parsed
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

    // A failed USDA lookup for one food won't stop the other lookups.
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

          return { ...food, nutrition: null };
        }
      })
    );

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
        "Foods were identified, but USDA nutrition data could not be matched. Try a clearer photo or review the food names.";
    } else if (nutritionMatchedCount < foodPortions.length) {
      nutritionNote =
        "Nutrition totals include only foods matched to USDA data. One or more items could not be matched.";
    } else {
      nutritionNote =
        "Portion sizes are visual estimates. Nutrition values depend on the USDA food matches and may differ from the actual meal.";
    }

    return NextResponse.json({
      // Preserve the existing frontend response fields.
      foods: foodPortions.map((food) => food.name),
      detectedIngredients: foodPortions.map((food) => food.name),
      foodPortions,
      nutrition: roundedNutrition,
      nutritionMatchedCount,
      nutritionNote,
    });
    } catch (error) {
    console.error("Food analyzer error:", error);

    const details =
      error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: "Food analysis failed.",
        details,
      },
      { status: 500 }
    );
  }
}
