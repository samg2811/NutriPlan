
const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  fat: 1004,
  carbs: 1005,
export type Per100g = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

async function searchIngredient(name: string): Promise<number> {
  const apiKey = process.env.USDA_API_KEY;
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
    name
  )}&dataType=Foundation,SR%20Legacy&pageSize=1&api_key=${apiKey}`;
// Simple in-memory cache (resets when the server restarts)
const cache = new Map<string, { description: string; per100g: Per100g } | null>();

  const res = await fetch(url, { next: { revalidate: 2592000 } }); // cache 30 days
  if (!res.ok) throw new Error(`USDA search failed for "${name}"`);
export async function lookupPer100g(term: string) {
  const key = term.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key)!;

  const data = await res.json();
  const food = data.foods?.[0];
  if (!food) throw new Error(`No USDA match found for "${name}"`);

  return food.fdcId as number;
}

async function getNutrientsPer100g(fdcId: number) {
  const apiKey = process.env.USDA_API_KEY;
  const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 2592000 } });
  if (!res.ok) throw new Error(`USDA lookup failed for fdcId ${fdcId}`);
  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("query", term);
  url.searchParams.set("dataType", "Foundation,SR Legacy");
  url.searchParams.set("pageSize", "1");
  url.searchParams.set("api_key", process.env.USDA_API_KEY!);

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const nutrients = { calories: 0, protein: 0, fat: 0, carbs: 0 };

  for (const n of data.foodNutrients ?? []) {
    const id = n.nutrient?.id;
    const amount = n.amount ?? 0;
    if (id === NUTRIENT_IDS.calories) nutrients.calories = amount;
    if (id === NUTRIENT_IDS.protein) nutrients.protein = amount;
    if (id === NUTRIENT_IDS.fat) nutrients.fat = amount;
    if (id === NUTRIENT_IDS.carbs) nutrients.carbs = amount;
  const food = data.foods?.[0];
  if (!food) {
    cache.set(key, null);
    return null;
  }

  return nutrients;
}

export async function getIngredientNutritionPer100g(
  name: string,
  fdcId?: number
) {
  const id = fdcId ?? (await searchIngredient(name));
  return getNutrientsPer100g(id);
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
