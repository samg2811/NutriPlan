import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { recipes } from "@/data/recipes"; // Import your existing recipe data

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { base64Image, mimeType } = await req.json();

    // 1. Send image to Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: base64Image,
          },
        },
        {
          text: "Scan this image and list all recognizable food items or raw ingredients present.",
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of normalized ingredient names detected.",
            },
          },
          required: ["ingredients"],
        },
      },
    });

    if (!response.text) {
      return NextResponse.json({ ingredients: [], matchedRecipes: [] });
    }

    const { ingredients } = JSON.parse(response.text) as { ingredients: string[] };

    // 2. Match detected ingredients against your existing recipes
    const normalizedDetected = ingredients.map((i) => i.toLowerCase());

    const matchedRecipes = recipes
      .map((recipe) => {
        const matchCount = recipe.ingredients.reduce((count: number, ing: string) => {
          const isMatch = normalizedDetected.some(
            (detected) => ing.toLowerCase().includes(detected) || detected.includes(ing.toLowerCase())
          );
          return isMatch ? count + 1 : count;
        }, 0);
        return { ...recipe, matchCount };
      })
      .filter((recipe) => recipe.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);

    return NextResponse.json({
      detectedIngredients: ingredients,
      matchedRecipes,
    });
  } catch (error) {
    console.error("Error analyzing food:", error);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
