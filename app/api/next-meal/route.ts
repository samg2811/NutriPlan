import { NextResponse } from "next/server";
import { meals } from "@/data/meals";
import { lookupPer100g } from "@/lib/logusda";

export const maxDuration = 30;

type Macros = { calories: number; protein: number; carbs: number; fat: number };

// Meal macros are cached after the first calculation (resets on server restart)
const mealCache = new Map<string, Macros | null>();

async function mealMacros(meal: (typeof meals)[number]): Promise<Macros | null> {
  const key = String(meal.id);
  if (mealCache.has(key)) return mealCache.get(key)!;

  const total: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  let found = 0;

  for (const ing of meal.ingredients) {
    const match = await lookupPer100g(ing.name);
    if (!match) continue;
    found++;
    const f = ing.grams / 100;
    total.calories += match.per100g.calories * f;
    total.protein += match.per100g.protein * f;
    total.carbs += match.per100g.carbs * f;
    total.fat += match.per100g.fat * f;
  }

  const result = found > 0 ? total : null;
  mealCache.set(key, result);
  return result;
}

export async function POST(req: Request) {
  try {
    const { remainingCalories, remainingProtein, hour } = await req.json();

    if (
      typeof remainingCalories !== "number" ||
      typeof remainingProtein !== "number" ||
      typeof hour !== "number"
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (remainingCalories < 150) {
      return NextResponse.json({
        suggestions: [],
        note: "You've reached your calorie goal for today. Nice work!",
      });
    }

    // Roughly how many meals are left today
    const mealsLeft = hour < 11 ? 3 : hour < 16 ? 2 : 1;
    const targetCal = remainingCalories / mealsLeft;
    const targetProtein = Math.max(remainingProtein, 0) / mealsLeft;

    // Calculate macros for every meal (in small parallel batches)
    const withMacros: { meal: (typeof meals)[number]; macros: Macros }[] = [];
    for (let i = 0; i < meals.length; i += 8) {
      const batch = meals.slice(i, i + 8);
      const results = await Promise.all(batch.map((m) => mealMacros(m)));
      batch.forEach((meal, idx) => {
        const macros = results[idx];
        if (macros) withMacros.push({ meal, macros });
      });
    }

    // Lower score = better fit
    const ranked = withMacros
      .map(({ meal, macros }) => {
        const calGap = Math.abs(macros.calories - targetCal) / targetCal;
        const proteinGap =
          targetProtein > 0
            ? Math.max(0, targetProtein - macros.protein) / targetProtein
            : 0;
        return { meal, macros, score: calGap + 0.5 * proteinGap };
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    const suggestions = ranked.map(({ meal, macros }) => ({
      id: meal.id,
      name: meal.name,
      description: meal.description,
      cookingTime: meal.cookingTime,
      cost: meal.cost,
      macros: {
        calories: Math.round(macros.calories),
        protein: Math.round(macros.protein),
        carbs: Math.round(macros.carbs),
        fat: Math.round(macros.fat),
      },
    }));

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("next-meal error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
