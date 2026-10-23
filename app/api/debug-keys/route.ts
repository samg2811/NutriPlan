import { NextResponse } from "next/server";

// TEMPORARY: delete this file once the food log works again.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Use the same model name as lib/parseMeal.ts
const GEMINI_MODEL = "gemini-3.8-flash";

type TestResult = {
  ok: boolean;
  status?: number;
  ms: number;
  message?: string;
};

async function testGemini(): Promise<TestResult> {
  const started = Date.now();
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY ?? "",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Reply with the single word OK." }] }],
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    const data = await res.json().catch(() => null);

    return {
      ok: res.ok,
      status: res.status,
      ms: Date.now() - started,
      message: res.ok
        ? "Gemini answered."
        : String(data?.error?.message ?? "No error message").slice(0, 200),
    };
  } catch (err) {
    return {
      ok: false,
      ms: Date.now() - started,
      message:
        err instanceof Error ? `${err.name}: ${err.message}`.slice(0, 200) : "Unknown error",
    };
  }
}

async function testUsda(): Promise<TestResult> {
  const started = Date.now();
  try {
    const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
    url.searchParams.set("query", "apple");
    url.searchParams.set("pageSize", "1");
    url.searchParams.set("api_key", process.env.USDA_API_KEY ?? "");

    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await res.json().catch(() => null);

    return {
      ok: res.ok,
      status: res.status,
      ms: Date.now() - started,
      message: res.ok
        ? `USDA answered with ${data?.foods?.length ?? 0} result(s).`
        : String(data?.error?.message ?? data?.message ?? "No error message").slice(0, 200),
    };
  } catch (err) {
    return {
      ok: false,
      ms: Date.now() - started,
      message:
        err instanceof Error ? `${err.name}: ${err.message}`.slice(0, 200) : "Unknown error",
    };
  }
}

export async function GET() {
  const keysPresent = {
    GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY),
    USDA_API_KEY: Boolean(process.env.USDA_API_KEY),
  };

  const [gemini, usda] = await Promise.all([testGemini(), testUsda()]);

  return NextResponse.json({ keysPresent, gemini, usda, model: GEMINI_MODEL });
}
