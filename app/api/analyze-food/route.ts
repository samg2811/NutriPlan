import { NextResponse } from "next/server";
import { getIngredientNutritionPer100g } from "@/lib/usda";

export const maxDuration = 30;

type FoodItem = {
  name: string;
  grams: number;
};

const EMPTY_NUTRITION = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { base64Image, mimeType } = body ?? {};

    if (
      typeof base64Image !== "string" ||
      !base64Image.trim() ||
      base64Image.length > 10_000_000 ||
      !["image/jpeg", "image/png", "image/webp"].includes(mimeType)
    ) {
      return NextResponse.json(
        { error: "Please upload a valid food photo." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");
      return NextResponse.json(
        { error: "Food analysis is not configured on the server." },
        { status: 500 }
      );
    }

    // Ask Gemini to identify foods and estimate edible portion weights.
    const prompt = `
Identify the distinct foods visible in this meal photo.
Return ONLY valid JSON in this format:
{"foods":[{"name":"Cooked white rice","grams":150}]}

Rules:
- Include recognizable foods, not plates, utensils, or decorations.
- Estimate the edible portion in grams for each food.
- Use simple, specific food names suitable for USDA FoodData Central searches.
- Use positive gram estimates no greater than 2000 per item.
- Include up to 15 distinct foods.
- Do not invent ingredients that cannot reasonably be identified.
`;

    const aiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!aiResponse.ok) {
      const details = await aiResponse.text();
      console.error("Gemini food analysis failed:", aiResponse.status, details);

      if (aiResponse.status === 429 || aiResponse.status === 503) {
        return NextResponse.json(
          { error: "The AI is busy right now. Please try again shortly." },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: "The AI could not analyze this photo. Please try again." },
        { status: 502 }
      );
    }

    const aiData = await aiResponse.json();
    const rawText =
      aiData.candidates?.[0]?.content?.parts?.find(
        (part: { text?: string }) => typeof part.text === "string"
      )?.text ?? "";

    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    let parsed: { foods?: unknown };

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Gemini returned invalid JSON:", rawText);
      return NextResponse.json(
        { error: "The AI returned an unreadable result. Please try again." },
        { status: 502 }
      );
    }

    const foods: FoodItem[] = Array.isArray(parsed.foods)
      ? parsed.foods
          .filter(
            (food): food is FoodItem =>
              typeof food?.name === "string" &&
              food.name.trim().length > 0 &&
              typeof food.grams === "number" &&
              Number.isFinite(food.grams) &&
              food.grams > 0 &&
              food.grams <= 2000
          )
          .slice(0, 15)
          .map((food) => ({
            name: food.name.trim(),
            grams: food.grams,
          }))
      : [];

    if (foods.length === 0) {
      return NextResponse.json({
        detectedIngredients: [],
        foodPortions: [],
        nutrition: null,
        nutritionNote:
          "No identifiable foods were found. Try a clearer photo.",
      });
    }

    // Look up each identified food in USDA and scale values to its portion.
    const foodPortions = await Promise.all(
      foods.map(async (food) => {
        try {
          const per100g = await getIngredientNutritionPer100g(food.name);
          const factor = food.grams / 100;

          return {
            name: food.name,
            grams: food.grams,
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
          console.error(`USDA lookup failed for "${food.name}":`, error);
          return {
            name: food.name,
            grams: food.grams,
            nutrition: null,
          };
        }
      })
    );

    const successful = foodPortions.filter(
      (food) => food.nutrition !== null
    );

    if (successful.length === 0) {
      return NextResponse.json(
        {
          error:
            "Foods were identified, but nutrition data could not be found. Please try another photo.",
        },
        { status: 422 }
      );
    }

    const totals = successful.reduce(
      (sum, food) => {
        const n = food.nutrition!;

        return {
          calories: sum.calories + n.calories,
          protein: sum.protein + n.protein,
          carbs: sum.carbs + n.carbs,
          fat: sum.fat + n.fat,
          fiber: sum.fiber + n.fiber,
          sugar: sum.sugar + n.sugar,
          sodium: sum.sodium + n.sodium,
        };
      },
      { ...EMPTY_NUTRITION }
    );

    return NextResponse.json({
      detectedIngredients: successful.map((food) => food.name),
      foodPortions: successful,
      nutrition: {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        fiber: Math.round(totals.fiber * 10) / 10,
        sugar: Math.round(totals.sugar * 10) / 10,
        sodium: Math.round(totals.sodium),
      },
      nutritionNote:
        "Nutrition estimates use USDA FoodData Central matches and AI-estimated portions. Actual ingredients and amounts may differ.",
    });
  } catch (error) {
    console.error("Food photo analysis error:", error);

    const err = error as { name?: string };

    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return NextResponse.json(
        { error: "Analysis took too long. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Food analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
