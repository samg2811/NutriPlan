"use client";

import { useState } from "react";
import { meals, Meal } from "@/data/meals";
import ViewMealButton from "@/components/ViewMealButton";

type Nutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type RankedMeal = {
  meal: Meal;
  score: number;
  matchedIngredients: string[];
  nutrition?: Nutrition;
  nutritionLoading: boolean;
};

// Rough singular form so "eggs" matches "egg" and "tomatoes" matches "tomato".
// It is applied to both what the user types and the ingredient names, so they always agree.
function singular(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("oes")) return word.slice(0, -2);
  if (word.endsWith("ss") || word.endsWith("us")) return word;
  if (word.endsWith("s")) return word.slice(0, -1);
  return word;
}

function toWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean)
    .map(singular);
}

// A typed term matches an ingredient when every word in the term appears in the
// ingredient's name: "chicken" -> "chicken breast", "rice" -> "white rice".
// Words of 4+ letters can also match the end of a word: "berry" -> "blueberry".
function termMatchesIngredient(term: string, ingredientName: string): boolean {
  const termWords = toWords(term);
  if (termWords.length === 0) return false;
  const ingredientWords = toWords(ingredientName);

  const wordMatches = (t: string, i: string) =>
    t === i || (t.length >= 4 && i.endsWith(t));

  return termWords.every((t) => ingredientWords.some((i) => wordMatches(t, i)));
}

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [budget, setBudget] = useState(10);
  const [maxTime, setMaxTime] = useState(30);
  const [results, setResults] = useState<RankedMeal[]>([]);

  async function fetchNutrition(meal: Meal): Promise<Nutrition | undefined> {
    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: meal.ingredients }),
      });

      if (!res.ok) return undefined;
      return await res.json();
    } catch {
      return undefined;
    }
  }

  async function findMeals() {
    const userIngredients = ingredients
      .split(/,|;|\n|\band\b/i)
      .map((item) => item.trim())
      .filter(Boolean);

    const rankedMeals: RankedMeal[] = meals
      .map((meal) => {
        let score = 0;

        const matchedIngredients = meal.ingredients
          .filter((ingredient) =>
            userIngredients.some((term) =>
              termMatchesIngredient(term, ingredient.name)
            )
          )
          .map((ingredient) => ingredient.name);

        score += matchedIngredients.length * 5;

        if (meal.cookingTime <= maxTime) {
          score += 3;
        } else {
          score -= 2;
        }

        if (meal.cost <= budget) {
          score += 3;
        } else {
          score -= 2;
        }

        return { meal, score, matchedIngredients };
      })
      .filter((item) => item.matchedIngredients.length > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => ({ ...item, nutritionLoading: true }));

    setResults(rankedMeals);
