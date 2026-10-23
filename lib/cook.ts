import type { Meal } from "@/data/meals";

export type Macros = { calories: number; protein: number; carbs: number; fat: number };
export type LogItem = { name: string; grams: number; per100g: Macros };

// Looks up one serving of a recipe's nutrition (same /api/nutrition call the planner uses)
// and returns the totals plus per-ingredient rows in the shape food_logs expects.
export async function fetchMealNutrition(meal: Meal): Promise<{ totals: Macros; items: LogItem[] }> {
  const res = await fetch("/api/nutrition", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients: meal.ingredients }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new Error("Couldn't calculate this meal's nutrition.");

  const keys: (keyof Macros)[] = ["calories", "protein", "carbs", "fat"];
  if (keys.some((k) => typeof data[k] !== "number" || !Number.isFinite(data[k]))) {
    throw new Error("Couldn't calculate this meal's nutrition.");
  }

  const rows: unknown[] = Array.isArray(data.ingredients) ? data.ingredients : [];
  const items: LogItem[] = [];
  for (const row of rows) {
    const r = row as { name?: string; grams?: number; nutrition?: Macros | null };
    if (!r || typeof r.name !== "string" || typeof r.grams !== "number" || r.grams <= 0 || !r.nutrition) continue;
    const f = 100 / r.grams;
    items.push({
      name: r.name,
      grams: r.grams,
      per100g: {
        calories: r.nutrition.calories * f,
        protein: r.nutrition.protein * f,
        carbs: r.nutrition.carbs * f,
        fat: r.nutrition.fat * f,
      },
    });
  }

  return {
    totals: { calories: data.calories, protein: data.protein, carbs: data.carbs, fat: data.fat },
    items,
  };
}

// Tell the rest of the page that food was logged, so the "Today so far" card and the
// Food Log section can refresh.
export function announceFoodLogChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("foodlog:changed"));
}

// Tell the pantry that a recipe was logged, so it can mark the matching ingredients as used.
export function announceMealLogged(ingredientNames: string[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("meal:logged", { detail: { ingredients: ingredientNames } }));
  }
}
