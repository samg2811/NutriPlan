
import { NextRequest, NextResponse } from "next/server";
import { getIngredientNutritionPer100g } from "@/lib/usda";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ingredients = body.ingredients;

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

    for (const ingredient of ingredients) {
      if (
        typeof ingredient.name !== "string" ||
        !ingredient.name.trim() ||
        typeof ingredient.grams !== "number" ||
        !Number.isFinite(ingredient.grams) ||
        ingredient.grams <= 0 ||
        (ingredient.fdcId !== undefined &&
          (!Number.isInteger(ingredient.fdcId) ||
            ingredient.fdcId <= 0))
      ) {
        return NextResponse.json(
          { error: "Each ingredient needs a name and positive gram amount." },
          { status: 400 }
        );
      }
    }

    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    const ingredientResults = await Promise.all(
      ingredients.map(async (ingredient) => {
        const per100g = await getIngredientNutritionPer100g(
          ingredient.name,
          ingredient.fdcId
        );

        const factor = ingredient.grams / 100;

        const nutrition = {
          calories: per100g.calories * factor,
          protein: per100g.protein * factor,
          carbs: per100g.carbs * factor,
          fat: per100g.fat * factor,
          fiber: per100g.fiber * factor,
          sugar: per100g.sugar * factor,
          sodium: per100g.sodium * factor,
        };

        for (const key of Object.keys(totals) as (keyof typeof totals)[]) {
          totals[key] += nutrition[key];
        }

        return {
          name: ingredient.name,
          grams: ingredient.grams,
          nutrition,
        };
      })
    );

    const roundedTotals = Object.fromEntries(
      Object.entries(totals).map(([key, value]) => [
        key,
        Math.round(value * 10) / 10,
      ])
    );

    return NextResponse.json({
      ...roundedTotals,
      ingredients: ingredientResults,
      source: "USDA FoodData Central",
    });
  } catch (err) {
    console.error("Nutrition calculation failed:", err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Unable to calculate nutrition.",
      },
      { status: 500 }
    );
  }
}
