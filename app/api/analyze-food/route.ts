
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");
      return NextResponse.json(
        { error: "Food analyzer is not configured. Please contact the app administrator." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const image = body.image;

    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Please upload a valid food photo." },
        { status: 400 }
      );
    }

    const match = image.match(
      /^data:(image\/(?:jpeg|png|webp|heic|heif));base64,(.+)$/
    );

    if (!match) {
      return NextResponse.json(
        { error: "Unsupported image format. Please use a JPEG, PNG, or WebP photo." },
        { status: 400 }
      );
    }

    const mimeType = match[1];
    const base64Data = match[2];

    if (base64Data.length > 12_000_000) {
      return NextResponse.json(
        { error: "Image is too large. Please choose a smaller photo." },
        { status: 413 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
      {
        text: `
Identify the food items clearly visible in this photo.

Return only a JSON array of short food names, for example:
["grilled chicken", "rice", "broccoli"]

Rules:
- Include only foods you can reasonably identify.
- Do not guess ingredients that cannot be seen.
- Do not estimate calories, nutrition, or portion sizes.
- If no food is recognizable, return [].
`,
      },
    ]);

    const responseText = result.response.text();
    const foods: unknown = JSON.parse(responseText);

    if (
      !Array.isArray(foods) ||
      !foods.every((food) => typeof food === "string")
    ) {
      throw new Error("Gemini returned an unexpected response format.");
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

