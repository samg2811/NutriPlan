
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY in Vercel settings." },
        { status: 500 }
      );
    }

    const { image } = await request.json();

    if (typeof image !== "string") {
      return NextResponse.json(
        { error: "Please upload a photo." },
        { status: 400 }
      );
    }

    const match = image.match(
      /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/
    );

    if (!match) {
      return NextResponse.json(
        { error: "Use a JPEG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    const [, mimeType, base64Data] = match;

    if (base64Data.length > 12_000_000) {
      return NextResponse.json(
        { error: "Image is too large. Please upload a smaller photo." },
        { status: 413 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: [
        {
          type: "image",
          mime_type: mimeType,
          data: base64Data,
        },
        {
          type: "text",
          text: `
Identify the foods visibly present in this photo.

Return only a valid JSON array of food names.
Example: ["rice", "chicken", "broccoli"]

Only include foods you can reasonably recognize.
Do not guess hidden ingredients.
Do not estimate calories, portion sizes, or nutrition.
If no food is recognizable, return [].
`,
        },
      ],
    });

    const responseText = result.output_text.trim();
    const cleanedText = responseText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");

    const foods: unknown = JSON.parse(cleanedText);

    if (
      !Array.isArray(foods) ||
      !foods.every(
        (food) => typeof food === "string"
      )
    ) {
      throw new Error("The AI returned an invalid food list.");
    }

    return NextResponse.json({
      foods: foods.map((food) => food.trim()).filter(Boolean),
    });
  } catch (error) {
    console.error("Food analyzer error:", error);

    return NextResponse.json(
      { error: "Food analysis failed. Please try another photo." },
      { status: 500 }
    );
  }
}


