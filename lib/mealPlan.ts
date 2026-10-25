
import { isMealAllowed } from "@/lib/restrictions";
import type { Meal } from "@/data/meals";

/**
 * Returns common ingredients from meals that match
 * the user's dietary restrictions and foods to avoid.
 */
export function topIngredients(
  meals: Meal[],
  restrictionIds: string[],
  avoid: string[] = [],
  limit = 18
): string[] {
  if (!Number.isFinite(limit) || limit <= 0) return [];

  const counts = new Map<string, number>();

  for (const meal of meals) {
    if (!isMealAllowed(meal, restrictionIds, avoid)) continue;

    const ingredients = new Set(
      meal.ingredients
        .map((ingredient) => ingredient.name.trim().toLowerCase())
        .filter(Boolean)
    );

    for (const ingredient of ingredients) {
      counts.set(
        ingredient,
        (counts.get(ingredient) ?? 0) + 1
      );
    }
  }

  return Array.from(counts.entries())
    .sort(([nameA, countA], [nameB, countB]) => {
      if (countA !== countB) return countB - countA;
      return nameA.localeCompare(nameB);
    })
    .slice(0, Math.floor(limit))
    .map(([name]) => name);
}
