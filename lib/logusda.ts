export type Per100g = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type Match = { description: string; per100g: Per100g };

// Simple in-memory cache (resets when the server restarts)
const cache = new Map<string, Match | null>();

const TIMEOUT_MS = 5000; // give up on one attempt after 5 seconds
const MAX_TRIES = 2;

export async function lookupPer100g(term: string): Promise<Match | null> {
  const key = term.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key)!;

  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("query", term);
  url.searchParams.set("dataType", "Foundation,SR Legacy");
  url.searchParams.set("pageSize", "1");
  url.searchParams.set("api_key", process.env.USDA_API_KEY!);

  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) continue; // try again

      const data = await res.json();
      const food = data.foods?.[0];

      if (!food) {
        cache.set(key, null); // USDA answered: there is no match
        return null;
      }

      // Nutrient numbers: 208 = energy (kcal), 203 = protein, 204 = fat, 205 = carbs
      const get = (num: string) =>
        food.foodNutrients?.find((n: any) => String(n.nutrientNumber) === num)?.value ?? 0;

      const result: Match = {
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
    } catch (err) {
      console.warn(`USDA lookup attempt ${attempt + 1} failed for "${term}":`, err);
    }
  }

  // Not cached, so the next request can try again
  return null;
}
