
export type ParsedItem = {
  name: string;       // what to show the user
  searchTerm: string; // what to search USDA for
  quantity: number;
  unit: string;
  grams: number;      // estimated total grams eaten
};

// Use the same model name your existing photo route uses.
const GEMINI_MODEL = "gemini-2.5-flash";

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

export async function parseMeal(text: string): Promise<ParsedItem[]> {
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
    }
  );

  if (!res.ok) throw new Error("Gemini request failed: " + res.status);

  const data = await res.json();
  const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  const json = JSON.parse(cleaned);
  return Array.isArray(json.items) ? json.items : [];
}
