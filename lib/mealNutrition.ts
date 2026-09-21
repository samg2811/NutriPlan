import { getIngredientNutritionPer100g } from "./usda";
import { meals as allMeals, ingredientNames, type Meal } from "./meals";

export interface Macros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

/**
 * Search-query overrides for ingredients where the bare name is ambiguous
 * (usda.ts takes the top search hit, which can be the raw/dry entry).
 * These are best guesses: run scripts/check-usda-matches.ts and adjust,
 * or pin an fdcId directly on the ingredient in meals.ts.
 */
export const USDA_QUERY_OVERRIDES: Record<string, string> = {
  "white rice": "rice white long-grain regular enriched cooked",
  "brown rice": "rice brown long-grain cooked",
  pasta: "pasta cooked enriched",
  quinoa: "quinoa cooked",
  lentils: "lentils mature seeds cooked boiled",
  "black beans": "beans black mature seeds cooked boiled",
  chickpeas: "chickpeas mature seeds cooked boiled",
};

// Cache by query/fdcId so each distinct ingredient is only fetched once per process.
const cache = new Map<string, Promise<Macros>>();

function per100g(name: string, fdcId?: number): Promise<Macros> {
  const query = USDA_QUERY_OVERRIDES[name] ?? name;
  const key = fdcId ? `id:${fdcId}` : `q:${query}`;

  let p = cache.get(key);
  if (!p) {
    p = getIngredientNutritionPer100g(query, fdcId).catch((err) => {
      cache.delete(key); // don't cache failures
      throw err;
    });
    cache.set(key, p);
  }
  return p;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Total macros for one serving of a meal. */
export async function getMealNutrition(meal: Meal): Promise<Macros> {
  const parts = await Promise.all(
    meal.ingredients.map(async (ing) => {
      const n = await per100g(ing.name, ing.fdcId);
      const f = ing.grams / 100;
      return {
        calories: n.calories * f,
        protein: n.protein * f,
        fat: n.fat * f,
        carbs: n.carbs * f,
      };
    })
  );

  const total = parts.reduce(
    (a, p) => ({
      calories: a.calories + p.calories,
      protein: a.protein + p.protein,
      fat: a.fat + p.fat,
      carbs: a.carbs + p.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  return {
    calories: Math.round(total.calories),
    protein: round1(total.protein),
    fat: round1(total.fat),
    carbs: round1(total.carbs),
  };
}

/**
 * Nutrition for every meal. Warms the ~72 distinct ingredients in small
 * batches first so we don't fire hundreds of USDA requests at once.
 */
export async function getAllMealsNutrition(
  list: Meal[] = allMeals
): Promise<Array<Meal & { nutrition: Macros }>> {
  const BATCH = 8;
  for (let i = 0; i < ingredientNames.length; i += BATCH) {
    await Promise.all(ingredientNames.slice(i, i + BATCH).map((n) => per100g(n)));
  }

  return Promise.all(
    list.map(async (m) => ({ ...m, nutrition: await getMealNutrition(m) }))
  );
}
