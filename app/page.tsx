"use client";

import { useState } from "react";
import { meals, Meal } from "@/data/meals";

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
      .toLowerCase()
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const rankedMeals = meals
      .map((meal) => {
        let score = 0;

        const matchedIngredients = meal.ingredients
          .filter((ingredient) =>
            userIngredients.includes(ingredient.name.toLowerCase())
          )
          .map((ingredient) => ingredient.name);

        score += matchedIngredients.length * 5;

        if (meal.cookingTime <= maxTime) score += 3;
        else score -= 2;

        if (meal.cost <= budget) score += 3;
        else score -= 2;

        return { meal, score, matchedIngredients };
      })
      .filter((item) => item.matchedIngredients.length > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => ({ ...item, nutritionLoading: true } as RankedMeal));

    setResults(rankedMeals);

    // Fetch real nutrition for each result, updating as each resolves
    rankedMeals.forEach(async (item, index) => {
      const nutrition = await fetchNutrition(item.meal);
      setResults((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = { ...next[index], nutrition, nutritionLoading: false };
        }
        return next;
      });
    });
  }

  // ... rest of your component stays the same, but in the meal-card render,
  // swap the hardcoded meal.protein/meal.carbs/meal.fat for:
  //
  // {item.nutritionLoading ? (
  //   <p>Loading nutrition…</p>
  // ) : item.nutrition ? (
  //   <div className="nutrition">
  //     <div><strong>{item.nutrition.protein}g</strong><small>Protein</small></div>
  //     <div><strong>{item.nutrition.carbs}g</strong><small>Carbs</small></div>
  //     <div><strong>{item.nutrition.fat}g</strong><small>Fat</small></div>
  //   </div>
  // ) : (
  //   <p>Nutrition unavailable</p>
  // )}
}
