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

    const rankedMeals: RankedMeal[] = meals
      .map((meal) => {
        let score = 0;

        const matchedIngredients = meal.ingredients
          .filter((ingredient) =>
            userIngredients.includes(ingredient.name.toLowerCase())
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

  return (
    <main className="container">
      <nav className="navbar">
        <div className="logo">🍽️ MealMind</div>

        <div className="nav-links">
          <a href="#planner">Meal Planner</a>
          <a href="#camera">Analyze Food</a>
        </div>
      </nav>

      <section className="hero">
        <p className="eyebrow">SMARTER MEAL PLANNING</p>

        <h1>
          What should
          <br />
          <span>you eat?</span>
        </h1>

        <p className="hero-text">
          MealMind uses your ingredients, budget, and available
          time to help you find meals that fit your needs.
        </p>
      </section>

      <section className="planner" id="planner">
        <h2>Find Your Meal</h2>

        <p className="section-description">
          Tell us what you have and we'll find meals that match.
        </p>

        <div className="form-card">
          <label>What ingredients do you have?</label>

          <input
            type="text"
            placeholder="chicken breast, white rice, broccoli"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />

          <div className="form-row">
            <div>
              <label>Budget</label>

              <div className="input-with-symbol">
                <span>$</span>

                <input
                  type="number"
                  value={budget}
                  min={1}
                  onChange={(e) =>
                    setBudget(Number(e.target.value))
                  }
                />
              </div>
            </div>

            <div>
              <label>Maximum cooking time</label>

              <div className="input-with-symbol">
                <input
                  type="number"
                  value={maxTime}
                  min={5}
                  onChange={(e) =>
                    setMaxTime(Number(e.target.value))
                  }
                />

                <span>min</span>
              </div>
            </div>
          </div>

          <button
            className="primary-button"
            onClick={findMeals}
          >
            Find My Meals →
          </button>
        </div>
      </section>

      {results.length > 0 && (
        <section className="results">
          <h2>Your Recommendations</h2>

          <p className="section-description">
            Meals ranked using your ingredients, budget, and
            cooking time.
          </p>

          <div className="meal-grid">
            {results.map((item) => (
              <div className="meal-card" key={item.meal.id}>
                <div className="meal-icon">🍽️</div>

                <h3>{item.meal.name}</h3>

                <p>{item.meal.description}</p>

                <div className="match-info">
                  ✓ {item.matchedIngredients.length} ingredient
                  {item.matchedIngredients.length !== 1 ? "s" : ""}{" "}
                  match
                  {item.matchedIngredients.length !== 1 ? "" : "es"}
                </div>

                <div className="meal-info">
                  <span>⏱️ {item.meal.cookingTime} min</span>
                  <span>💰 ${item.meal.cost.toFixed(2)}</span>
                </div>

                {item.nutritionLoading ? (
                  <p style={{ padding: "15px 0", color: "#666" }}>
                    Loading nutrition…
                  </p>
                ) : item.nutrition ? (
                  <div className="nutrition">
                    <div>
                      <strong>{item.nutrition.protein}g</strong>
                      <small>Protein</small>
                    </div>

                    <div>
                      <strong>{item.nutrition.carbs}g</strong>
                      <small>Carbs</small>
                    </div>

                    <div>
                      <strong>{item.nutrition.fat}g</strong>
                      <small>Fat</small>
                    </div>
                  </div>
                ) : (
                  <p style={{ padding: "15px 0", color: "#999" }}>
                    Nutrition unavailable
                  </p>
                )}

                <button className="secondary-button">
                  View Meal
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {results.length === 0 && ingredients && (
        <section className="results">
          <h2>No matching meals yet</h2>

          <p className="section-description">
            Try adding ingredients like chicken breast, white rice,
            broccoli, cheddar cheese, or lettuce.
          </p>
        </section>
      )}

      <section className="camera-section" id="camera">
        <div>
          <p className="eyebrow">COMING NEXT</p>

          <h2>
            Analyze your meal
            <br />
            with AI 📸
          </h2>

          <p>
            Take a picture of your food and MealMind will
            identify likely foods in your meal and provide
            approximate nutritional information.
          </p>
        </div>

        <div className="camera-placeholder">
          <div className="camera-icon">📸</div>

          <h3>AI Food Analysis</h3>

          <p>Coming soon</p>
        </div>
      </section>

      <footer>
        <strong>MealMind</strong>

        <span>
          Plan smarter. Eat better. Waste less.
        </span>
      </footer>
    </main>
  );
}
