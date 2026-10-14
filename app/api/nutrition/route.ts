import { NextResponse } from "next/server";
import { getIngredientNutritionPer100g } from "@/lib/usda";

type IngredientInput = {
  name: string;
  grams: number;
  fdcId?: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ingredients: unknown = body?.ingredients;

    if (
      !Array.isArray(ingredients) ||
      ingredients.length === 0 ||
      ingredients.length > 50
    ) {
      return NextResponse.json(
        { error: "Provide between 1 and 50 ingredients." },
        { status: 400 }
      );
    }

    // Validate every ingredient before making USDA requests.
    const validIngredients: IngredientInput[] = [];

    for (const item of ingredients) {
      if (
        !item ||
        typeof item.name !== "string" ||
        !item.name.trim() ||
        typeof item.grams !== "number" ||
        !Number.isFinite(item.grams) ||
        item.grams <= 0 ||
        (item.fdcId !== undefined &&
          (!Number.isInteger(item.fdcId) || item.fdcId <= 0))
      ) {
        return NextResponse.json(
          {
            error:
              "Each ingredient needs a name, a positive gram amount, and an optional valid USDA food ID.",
          },
          { status: 400 }
        );
      }

      validIngredients.push({
        name: item.name.trim(),
        grams: item.grams,
        ...(item.fdcId !== undefined ? { fdcId: item.fdcId } : {}),
      });
    }

    const results = await Promise.all(
      validIngredients.map(async (ingredient) => {
        try {
          const per100g = await getIngredientNutritionPer100g(
            ingredient.name,
            ingredient.fdcId
          );

          const factor = ingredient.grams / 100;

          return {
            name: ingredient.name,
            grams: ingredient.grams,
            nutrition: {
              calories: per100g.calories * factor,
              protein: per100g.protein * factor,
              carbs: per100g.carbs * factor,
              fat: per100g.fat * factor,
              fiber: per100g.fiber * factor,
              sugar: per100g.sugar * factor,
              sodium: per100g.sodium * factor,
            },
            error: null,
          };
        } catch (error) {
          console.error(
            `Nutrition lookup failed for "${ingredient.name}":`,
            error
          );

          return {
            name: ingredient.name,
            grams: ingredient.grams,
            nutrition: null,
            error: "Could not find nutrition data for this ingredient.",
          };
        }
      })
    );

    const successfulResults = results.filter(
      (result) => result.nutrition !== null
    );

    if (successfulResults.length === 0) {
      return NextResponse.json(
        {
          error:
            "Nutrition data could not be found for these ingredients. Check the ingredient names and USDA_API_KEY.",
          ingredients: results,
        },
        { status: 422 }
      );
    }

    const totals = successfulResults.reduce(
      (acc, result) => {
        const nutrition = result.nutrition!;

        return {
          calories: acc.calories + nutrition.calories,
          protein: acc.protein + nutrition.protein,
          carbs: acc.carbs + nutrition.carbs,
          fat: acc.fat + nutrition.fat,
          fiber: acc.fiber + nutrition.fiber,
          sugar: acc.sugar + nutrition.sugar,
          sodium: acc.sodium + nutrition.sodium,
        };
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      }
    );

    const roundedTotals = {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
      sugar: Math.round(totals.sugar * 10) / 10,
      sodium: Math.round(totals.sodium),
    };

    return NextResponse.json({
      ...roundedTotals,
      ingredients: results,
      unmatchedIngredients: results
        .filter((result) => result.error !== null)
        .map((result) => result.name),
      source: "USDA FoodData Central",
    });
  } catch (error) {
    console.error("Nutrition API error:", error);

    return NextResponse.json(
      { error: "Nutrition calculation failed. Please try again." },
      { status: 500 }
    );
  }
}
