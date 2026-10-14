
const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  fat: 1004,
  carbs: 1005,
  fiber: 1079,
  sugar: 2000,
  sodium: 1093,
} as const;

export type IngredientNutrition = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  sodium: number;
};

type USDAFood = {
  fdcId: number;
  description: string;
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

async function usdaFetch(path: string, init?: RequestInit) {
  const apiKey = process.env.USDA_API_KEY;

  if (!apiKey) {
    throw new Error("USDA_API_KEY is missing from the server environment.");
  }

  const separator = path.includes("?") ? "&" : "?";
  const url =
    `https://api.nal.usda.gov/fdc/v1/${path}` +
    `${separator}api_key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    ...init,
    next: { revalidate: 2592000 },
  } as RequestInit);

  if (!response.ok) {
    throw new Error(`USDA request failed (${response.status}).`);
  }

  return response.json();
}

async function searchIngredient(name: string): Promise<number> {
  const data = await usdaFetch("foods/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: name,
      dataType: ["Foundation", "SR Legacy"],
      pageSize: 10,
    }),
  });

  const foods: USDAFood[] = data.foods ?? [];

  if (!foods.length) {
    throw new Error(`No USDA match found for "${name}".`);
  }

  const query = normalize(name);

  // Prefer an exact description match when available.
  const exact = foods.find(
    (food) => normalize(food.description) === query
  );

  if (exact) return exact.fdcId;

  // Otherwise prefer a result whose description contains the query.
  const closeMatch = foods.find((food) =>
    normalize(food.description).includes(query)
  );

  return (closeMatch ?? foods[0]).fdcId;
}

async function getNutrientsPer100g(
  fdcId: number
): Promise<IngredientNutrition> {
  const data = await usdaFetch(`food/${fdcId}`);

  const nutrients: IngredientNutrition = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };

  for (const item of data.foodNutrients ?? []) {
    const id = item.nutrient?.id;
    const amount = item.amount;

    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      continue;
    }

    for (const [key, nutrientId] of Object.entries(NUTRIENT_IDS)) {
      if (id === nutrientId) {
        nutrients[key as keyof IngredientNutrition] = amount;
      }
    }
  }

  return nutrients;
}

export async function getIngredientNutritionPer100g(
  name: string,
  fdcId?: number
): Promise<IngredientNutrition> {
  const id = fdcId ?? (await searchIngredient(name));
  return getNutrientsPer100g(id);
}
