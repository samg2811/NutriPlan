export type ParsedItem = {
  name: string;       // what to show the user
  searchTerm: string; // what to search USDA for
  quantity: number;
  unit: string;
  grams: number;      // estimated total grams eaten
};

// Use the same model name your photo route uses.
const GEMINI_MODEL = "gemini-3.8-flash";

const TIMEOUT_MS = 9000; // give up on one attempt after 9 seconds
const MAX_TRIES = 2;

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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRetryable(err: unknown): boolean {
  const e = err as { status?: number; name?: string };
  return (
    e?.status === 503 ||
    e?.status === 429 ||
    e?.status === 500 ||
    e?.name === "TimeoutError" ||
    e?.name === "AbortError"
  );
}

async function callGemini(text: string): Promise<ParsedItem[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
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
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }
  );

  if (!res.ok) {
    const err = new Error("Gemini request failed: " + res.status) as Error & {
      status?: number;
    };
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
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    try {
      return await callGemini(text);
    } catch (err) {
      console.error(`parseMeal attempt ${attempt + 1} failed:`, err);
      if (!isRetryable(err) || attempt === MAX_TRIES - 1) throw err;
      await sleep(800 * (attempt + 1));
    }
  }
  return [];
}
