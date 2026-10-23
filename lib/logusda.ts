export type Per100g = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type Hit = { description: string; per100g: Per100g } | null;

async function fetchPer100g(term: string): Promise<Hit> {
  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("query", term);
  url.searchParams.set("dataType", "Foundation,SR Legacy");
  url.searchParams.set("pageSize", "1");
  url.searchParams.set("api_key", process.env.USDA_API_KEY!);

  // Next.js keeps this response for 30 days, shared across server instances.
  const res = await fetch(url, { next: { revalidate: 2592000 } });
  if (!res.ok) throw new Error(`USDA search failed (${res.status})`);

  const data = await res.json();
  const food = data.foods?.[0];
  if (!food) return null;

  // Nutrient numbers: 208 = energy (kcal), 203 = protein, 204 = fat, 205 = carbs
  const get = (num: string) =>
    food.foodNutrients?.find((n: any) => String(n.nutrientNumber) === num)?.value ?? 0;

  return {
    description: food.description as string,
    per100g: {
      calories: get("208"),
      protein: get("203"),
      carbs: get("205"),
      fat: get("204"),
    },
  };
}

// Cache the in-flight promise (not just the result), so when many meals ask for the
// same food at once, only one request goes to USDA. Failures are not remembered.
const cache = new Map<string, Promise<Hit>>();

export function lookupPer100g(term: string): Promise<Hit> {
  const key = term.toLowerCase().trim();
  let pending = cache.get(key);
  if (!pending) {
    pending = fetchPer100g(term).catch(() => {
      cache.delete(key);
      return null;
    });
    cache.set(key, pending);
  }
  return pending;
}
