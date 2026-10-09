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

    
  const body = await request.json();
  const base64Image = body?.base64Image;
  const mimeType = body?.mimeType;
  
  if (
    typeof base64Image !== "string" ||
    typeof mimeType !== "string"
  ) {
    return NextResponse.json(
      { error: "Photo data is missing." },
      { status: 400 }
    );
  }
  
  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG, or WebP image." },
      { status: 400 }
    );
  }
  
  const base64Data = base64Image.replace(
    /^data:image\/[^;]+;base64,/,
    ""
  );
  
  if (!base64Data || base64Data.length > 12_000_000) {
    return NextResponse.json(
      { error: "Image is missing or too large." },
      { status: 413 }
    );
  }

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Identify the foods visibly present in this photo.

Return only a valid JSON array of food names.
Example: ["rice", "chicken", "broccoli"]

Only include foods you can reasonably recognize.
Do not guess hidden ingredients.
Do not estimate calories, portion sizes, or nutrition.
If no food is recognizable, return [].`,
            },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.text?.trim();

    if (!responseText) {
      throw new Error("The AI returned an empty response.");
    }

    const foods: unknown = JSON.parse(responseText);

    if (
      !Array.isArray(foods) ||
      !foods.every((food) => typeof food === "string")
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



