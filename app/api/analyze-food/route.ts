import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const base64Data = image.split(",")[1];

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
      {
        text: `
Analyze this food photo.

Identify the foods that are visibly present.

Only identify foods that you can reasonably recognize.
Do not estimate calories, portion sizes, or nutrition.

Return ONLY a JSON array of food names.

Example:
["chicken", "rice", "broccoli"]
        `,
      },
    ]);

    const response = result.response.text();

    return NextResponse.json({
      foods: response,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Food analysis failed." },
      { status: 500 }
    );
  }
}
