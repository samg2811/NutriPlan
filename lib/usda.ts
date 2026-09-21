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

export async function getIngredientNutritionPer100g(
  name: string,
  fdcId?: number
) {
  const id = fdcId ?? (await searchIngredient(name));
  return getNutrientsPer100g(id);
}
