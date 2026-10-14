
const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  fat: 1004,
  carbs: 1005,
  fiber: 1079,
  sugar: 2000,
  sodium: 1093,
} as const;

export type NutritionValues = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
};

const EMPTY_NUTRITION: NutritionValues = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
};

type USDAFood = {
  fdcId: number;
  description?: string;
};

type USDANutrient = {
  amount?: number;
  nutrient?: {
    id?: number;
    number?: string;
    name?: string;
    unitName?: string;
  };
};

function getApiKey(): string {
  const apiKey = process.env.USDA_API_KEY;

  if (!apiKey) {
    throw new Error("USDA_API_KEY is missing from environment variables.");
  }

  return apiKey;
}

async function searchIngredient(name: string): Promise<number> {
  const apiKey = getApiKey();

  const url = new URL(
    "https://api.nal.usda.gov/fdc/v1/foods/search"
  );

  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("query", name);
  url.searchParams.set("pageSize", "10");
  url.searchParams.set("dataType", "Foundation,SR Legacy");

  const response = await fetch(url.toString(), {
    next: { revalidate: 2592000 },
  });

  if (!response.ok) {
    throw new Error(`USDA food search failed for "${name}".`);
  }

  const data: { foods?: USDAFood[] } = await response.json();
  const foods = data.foods ?? [];

  if (foods.length === 0) {
    throw new Error(`No USDA match found for "${name}".`);
  }

  const normalizedQuery = name.toLowerCase().trim();

  // Prefer an exact description match when one exists.
  const exactMatch = foods.find(
    (food) =>
      food.description?.toLowerCase().trim() === normalizedQuery
  );

  const selectedFood = exactMatch ?? foods[0];

  if (!selectedFood?.fdcId) {
    throw new Error(`No usable USDA match found for "${name}".`);
  }

  return selectedFood.fdcId;
}

async function getNutrientsPer100g(
  fdcId: number
): Promise<NutritionValues> {
  const apiKey = getApiKey();

  const url = new URL(
    `https://api.nal.usda.gov/fdc/v1/food/${fdcId}`
  );

  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url.toString(), {
    next: { revalidate: 2592000 },
  });

  if (!response.ok) {
    throw new Error(`USDA nutrition lookup failed for food ${fdcId}.`);
  }

  const data: { foodNutrients?: USDANutrient[] } =
    await response.json();

  const nutrients = { ...EMPTY_NUTRITION };

  for (const item of data.foodNutrients ?? []) {
    const id = item.nutrient?.id;
    const amount = item.amount;

    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      continue;
    }

    if (id === NUTRIENT_IDS.calories) nutrients.calories = amount;
    if (id === NUTRIENT_IDS.protein) nutrients.protein = amount;
    if (id === NUTRIENT_IDS.fat) nutrients.fat = amount;
    if (id === NUTRIENT_IDS.carbs) nutrients.carbs = amount;
    if (id === NUTRIENT_IDS.fiber) nutrients.fiber = amount;
    if (id === NUTRIENT_IDS.sugar) nutrients.sugar = amount;
    if (id === NUTRIENT_IDS.sodium) nutrients.sodium = amount;
  }

  return nutrients;
}

export async function getIngredientNutritionPer100g(
  name: string,
  fdcId?: number
): Promise<NutritionValues> {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Ingredient name cannot be empty.");
  }

  const id = fdcId ?? (await searchIngredient(cleanName));

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`Invalid USDA food ID for "${cleanName}".`);
  }

  return getNutrientsPer100g(id);
}
