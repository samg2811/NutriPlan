"use client";

import { useState } from "react";
import { meals, Meal } from "@/data/meals";

type RankedMeal = {
  meal: Meal;
  score: number;
  matchedIngredients: string[];
};

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [budget, setBudget] = useState(10);
  const [maxTime, setMaxTime] = useState(30);
  const [results, setResults] = useState<RankedMeal[]>([]);

  // AI Food Analysis
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [detectedFoods, setDetectedFoods] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  function findMeals() {
    const userIngredients = ingredients
      .toLowerCase()
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const rankedMeals = meals
      .map((meal) => {
        let score = 0;

        const matchedIngredients = meal.ingredients.filter(
          (ingredient) =>
            userIngredients.includes(ingredient.name.toLowerCase())
        );

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

        return {
          meal,
          score,
          matchedIngredients,
        };
      })
      .filter((item) => item.matchedIngredients.length > 0)
      .sort((a, b) => b.score - a.score);

    setResults(rankedMeals.slice(0, 3));
  }

  // Handle photo upload
  function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAnalysisError("Please upload an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setDetectedFoods([]);
      setAnalysisError("");
    };

    reader.readAsDataURL(file);
  }

  // Send photo to Gemini
  async function analyzeFood() {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisError("");
    setDetectedFoods([]);

    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: selectedImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Food analysis failed."
        );
      }

      let foods: string[] = [];

      try {
        foods = JSON.parse(data.foods);
      } catch {
        const cleaned = data.foods
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        foods = JSON.parse(cleaned);
      }

      setDetectedFoods(foods);
    } catch (error) {
      console.error(error);

      setAnalysisError(
        "We couldn't analyze that photo. Please try another image."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Use detected foods in recipe finder
  function useDetectedFoods() {
    if (detectedFoods.length === 0) return;

    setIngredients(detectedFoods.join(", "));

    setTimeout(() => {
      const userIngredients = detectedFoods.map((food) =>
        food.toLowerCase().trim()
      );

      const rankedMeals = meals
        .map((meal) => {
          let score = 0;

          const matchedIngredients = meal.ingredients.filter(
            (ingredient) =>
              userIngredients.includes(
                ingredient.name.toLowerCase()
              )
          );

          score += matchedIngredients.length * 5;

          if (meal.cookingTime <= maxTime) {
            score += 3;
          }

          if (meal.cost <= budget) {
            score += 3;
          }

          return {
            meal,
            score,
            matchedIngredients,
          };
        })
        .filter(
          (item) => item.matchedIngredients.length > 0
        )
        .sort((a, b) => b.score - a.score);

      setResults(rankedMeals.slice(0, 3));
    }, 100);
  }

  return (
    <main className="container">
      <nav className="navbar">
        <div className="logo">🍽️ NutriPlan</div>

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
          NutriPlan uses your ingredients, budget, and
          available time to help you find meals that fit
          your needs.
        </p>
      </section>

      <section className="planner" id="planner">
        <h2>Find Your Meal</h2>

        <p className="section-description">
          Tell us what you have and we'll find meals that
          match.
        </p>

        <div className="form-card">
          <label>What ingredients do you have?</label>

          <input
            type="text"
            placeholder="chicken, rice, broccoli"
            value={ingredients}
            onChange={(e) =>
              setIngredients(e.target.value)
            }
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
            Meals ranked using your ingredients, budget,
            and cooking time.
          </p>

          <div className="meal-grid">
            {results.map(
              ({
                meal,
                matchedIngredients,
              }) => (
                <div
                  className="meal-card"
                  key={meal.id}
                >
                  <div className="meal-icon">🍽️</div>

                  <h3>{meal.name}</h3>

                  <p>{meal.description}</p>

                  <div className="match-info">
                    ✓ {matchedIngredients.length} ingredient
                    {matchedIngredients.length !== 1
                      ? "s"
                      : ""}{" "}
                    match
                    {matchedIngredients.length !== 1
                      ? ""
                      : "es"}
                  </div>

                  <div className="meal-info">
                    <span>
                      ⏱️ {meal.cookingTime} min
                    </span>

                    <span>
                      💰 ${meal.cost.toFixed(2)}
                    </span>
                  </div>

                  <div className="nutrition">
                    <div>
                      <strong>{meal.protein}g</strong>
                      <small>Protein</small>
                    </div>

                    <div>
                      <strong>{meal.carbs}g</strong>
                      <small>Carbs</small>
                    </div>

                    <div>
                      <strong>{meal.fat}g</strong>
                      <small>Fat</small>
                    </div>
                  </div>

                  <button className="secondary-button">
                    View Meal
                  </button>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* AI FOOD ANALYSIS */}
      <section className="camera-section" id="camera">
        <div>
          <p className="eyebrow">AI FOOD ANALYSIS</p>

          <h2>
            What's in your
            <br />
            meal? 📸
          </h2>

          <p>
            Upload a photo of your food and our AI will
            identify the foods it can recognize.
          </p>

          <label className="upload-button">
            📷 Choose Food Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              hidden
            />
          </label>

          {selectedImage && (
            <button
              className="primary-button analyze-button"
              onClick={analyzeFood}
              disabled={isAnalyzing}
            >
              {isAnalyzing
                ? "🤖 Analyzing..."
                : "🤖 Analyze Food"}
            </button>
          )}

          {analysisError && (
            <p className="error-message">
              {analysisError}
            </p>
          )}
        </div>

        <div className="camera-card">
          {!selectedImage && (
            <div className="empty-camera">
              <div className="camera-icon">📸</div>

              <h3>Upload a food photo</h3>

              <p>
                We'll use AI to identify what's on your
                plate.
              </p>
            </div>
          )}

          {selectedImage && (
            <div className="image-preview">
              <img
                src={selectedImage}
                alt="Uploaded food"
              />
            </div>
          )}
        </div>
      </section>

      {/* AI RESULTS */}
      {detectedFoods.length > 0 && (
        <section className="ai-results">
          <p className="eyebrow">AI RESULTS</p>

          <h2>We found these foods</h2>

          <p className="section-description">
            Gemini identified the following foods in your
            photo.
          </p>

          <div className="food-list">
            {detectedFoods.map((food, index) => (
              <div className="food-item" key={index}>
                <span>✓</span>
                {food}
              </div>
            ))}
          </div>

          <p className="confirmation-text">
            AI identification can make mistakes. Check the
            results before continuing.
          </p>

          <button
            className="primary-button"
            onClick={useDetectedFoods}
          >
            🍽️ Find Recipes With These Foods →
          </button>
        </section>
      )}

      <footer>
        <strong>NutriPlan</strong>

        <span>
          Plan smarter. Eat better. Waste less.
        </span>
      </footer>
    </main>
  );
}
