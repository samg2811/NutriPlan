export type ParsedItem = {
  name: string;       // what to show the user
  searchTerm: string; // what to search USDA for
  quantity: number;
  unit: string;
  grams: number;      // estimated total grams eaten
};

// Tried in order. If one is busy or fails, the next one is used.
// You can reorder these or remove any you don't want.
const MODELS = [
  "gemini-2.5-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.8-flash",
];

const PER_MODEL_TIMEOUT_MS = 7000; // give up on one model after 7 seconds
const TOTAL_BUDGET_MS = 18000;     // never spend more than 18 seconds in total

const PROMPT = `You convert a description of a meal into JSON.
Return ONLY valid JSON in this exact shape:
{"items":[{"name":"Scrambled egg","searchTerm":"egg whole cooked scrambled","quantity":2,"unit":"large","grams":100}]}
Rules:
- One entry per distinct food.
- "grams" is your best estimate of the TOTAL grams eaten of that food.
- "searchTerm" should be a short generic USDA-style food name.
- If an amount is missing, assume a typical single serving.

Meal description:
`;

type HttpError = Error & { status?: number };

// Errors where trying a different model makes sense
function shouldTryNextModel(err: unknown): boolean {
  const e = err as HttpError;
  return (
    e?.status === 503 ||
    e?.status === 429 ||
    e?.status === 500 ||
    e?.status === 404 ||
    e?.name === "TimeoutError" ||
    e?.name === "AbortError" ||
    err instanceof SyntaxError
  );
}

async function callGemini(
  model: string,
  text: string,
  timeoutMs: number
): Promise<ParsedItem[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT + text }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    }
  );

  if (!res.ok) {
    const err = new Error(`Gemini ${model} failed: ${res.status}`) as HttpError;
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  const json = JSON.parse(cleaned);
  return Array.isArray(json.items) ? json.items : [];
}

export async function parseMeal(text: string): Promise<ParsedItem[]> {
  const started = Date.now();
  let lastError: unknown;

  for (const model of MODELS) {
    const remaining = TOTAL_BUDGET_MS - (Date.now() - started);
    if (remaining < 2000) break;

    try {
      const items = await callGemini(
        model,
        text,
        Math.min(PER_MODEL_TIMEOUT_MS, remaining)
      );
      console.log(`parseMeal used ${model} in ${Date.now() - started}ms`);
      return items;
    } catch (err) {
      lastError = err;
      console.error(`parseMeal: ${model} failed:`, err);
      if (!shouldTryNextModel(err)) throw err; // e.g. bad API key: stop now
    }
  }

  throw lastError ?? new Error("No Gemini model was available.");
}
