import { NextRequest, NextResponse } from "next/server";
import { getIngredientNutritionPer100g } from "@/lib/usda";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const ingredients: { name: string; grams: number; fdcId?: number }[] =
    body.ingredients ?? [];

  try {
    const results = await Promise.all(
      ingredients.map(async (ing) => {
        const per100g = await getIngredientNutritionPer100g(
          ing.name,
          ing.fdcId
        );
        const factor = ing.grams / 100;
        return {
          calories: per100g.calories * factor,
          protein: per100g.protein * factor,
          carbs: per100g.carbs * factor,
          fat: per100g.fat * factor,
        };
      })
    );

    const totals = results.reduce(
      (acc, r) => ({
        calories: acc.calories + r.calories,
        protein: acc.protein + r.protein,
        carbs: acc.carbs + r.carbs,
        fat: acc.fat + r.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return NextResponse.json({
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
