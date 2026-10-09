
// Prints the USDA entry each ingredient resolves to, so you can spot bad matches
// (raw vs cooked, wrong food, etc.) and pin an fdcId or add a query override.
//
// Run from the project root, e.g.:
//   npx tsx --env-file=.env.local scripts/check-usda-matches.ts
import { ingredientNames } from "../lib/meals";
import { USDA_QUERY_OVERRIDES } from "../lib/mealNutrition";

const apiKey = process.env.USDA_API_KEY;
if (!apiKey) throw new Error("USDA_API_KEY is not set");

async function main() {
  for (const name of ingredientNames) {
    const query = USDA_QUERY_OVERRIDES[name] ?? name;
    // Same query params as searchIngredient() in lib/usda.ts
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
      query
    )}&dataType=Foundation,SR%20Legacy&pageSize=1&api_key=${apiKey}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`${name.padEnd(20)} -> HTTP ${res.status}`);
        continue;
      }
      const food = (await res.json()).foods?.[0];
      console.log(
        `${name.padEnd(20)} -> ${food ? `${food.description} (fdcId ${food.fdcId}, ${food.dataType})` : "NO MATCH"}`
      );
    } catch (e) {
      console.log(`${name.padEnd(20)} -> ERROR ${(e as Error).message}`);
    }
    await new Promise((r) => setTimeout(r, 150)); // stay well under rate limits
const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  fat: 1004,
  carbs: 1005,
};

async function searchIngredient(name: string): Promise<number> {
  const apiKey = process.env.USDA_API_KEY;
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
    name
  )}&dataType=Foundation,SR%20Legacy&pageSize=1&api_key=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 2592000 } }); // cache 30 days
  if (!res.ok) throw new Error(`USDA search failed for "${name}"`);

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

  const data = await res.json();
  const nutrients = { calories: 0, protein: 0, fat: 0, carbs: 0 };

  for (const n of data.foodNutrients ?? []) {
    const id = n.nutrient?.id;
    const amount = n.amount ?? 0;
    if (id === NUTRIENT_IDS.calories) nutrients.calories = amount;
    if (id === NUTRIENT_IDS.protein) nutrients.protein = amount;
    if (id === NUTRIENT_IDS.fat) nutrients.fat = amount;
    if (id === NUTRIENT_IDS.carbs) nutrients.carbs = amount;
  }

  return nutrients;
}

main();
export async function getIngredientNutritionPer100g(
  name: string,
  fdcId?: number
) {
  const id = fdcId ?? (await searchIngredient(name));
  return getNutrientsPer100g(id);
}
