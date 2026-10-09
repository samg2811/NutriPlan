export type Per100g = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

// Simple in-memory cache (resets when the server restarts)
const cache = new Map<string, { description: string; per100g: Per100g } | null>();

export async function lookupPer100g(term: string) {
  const key = term.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key)!;

  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("query", term);
  url.searchParams.set("dataType", "Foundation,SR Legacy");
  url.searchParams.set("pageSize", "1");
  url.searchParams.set("api_key", process.env.USDA_API_KEY!);

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const food = data.foods?.[0];
  if (!food) {
    cache.set(key, null);
    return null;
  }

  // Nutrient numbers: 208 = energy (kcal), 203 = protein, 204 = fat, 205 = carbs
  const get = (num: string) =>
    food.foodNutrients?.find((n: any) => String(n.nutrientNumber) === num)?.value ?? 0;

  const result = {
    description: food.description as string,
    per100g: {
      calories: get("208"),
      protein: get("203"),
      carbs: get("205"),
      fat: get("204"),
    },
  };
  cache.set(key, result);
  return result;
}
