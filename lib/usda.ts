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
  }
}

main();
