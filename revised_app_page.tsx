"use client";

   import HeroWithPhone from "@/components/HeroWithPhone";
   import StatsSection from "@/components/StatsSection";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { meals, Meal, MealIngredient } from "@/data/meals";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getRecipe } from "@/data/recipes";

type RankedMeal = {
  meal: Meal;
  score: number;
  matchedIngredients: MealIngredient[];
};

type NutritionData = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
};

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [budget, setBudget] = useState(10);
  const [maxTime, setMaxTime] = useState(30);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [mealNutrition, setMealNutrition] = useState<NutritionData | null>(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState("");
  const [nutritionMealId, setNutritionMealId] = useState<number | null>(null);

  const [results, setResults] = useState<RankedMeal[]>([]);

  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserEmail(user?.email ?? null);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        void event;
        setUserEmail(session?.user?.email ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // AI Food Analysis
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [detectedFoods, setDetectedFoods] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  // Open a meal and calculate its estimated nutrition using the USDA endpoint.
  async function openMealDetails(meal: Meal) {
    setSelectedMeal(meal);
    setMealNutrition(null);
    setNutritionError("");
    setNutritionLoading(true);
    setNutritionMealId(meal.id);

    try {
      const response = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: meal.ingredients }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Could not calculate nutrition."
        );
      }

      const nutrientKeys: (keyof NutritionData)[] = [
        "calories",
        "protein",
        "carbs",
        "fat",
        "fiber",
        "sugar",
        "sodium",
      ];

      const missingNutrients = nutrientKeys.filter(
        (key) => typeof data[key] !== "number" || !Number.isFinite(data[key])
      );

      if (missingNutrients.length > 0) {
        throw new Error(
          "The nutrition API is missing: " +
            missingNutrients.join(", ") +
            ". Check app/api/nutrition/route.ts and lib/usda.ts."
        );
      }

      setMealNutrition({
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber,
        sugar: data.sugar,
        sodium: data.sodium,
      });
    } catch (error) {
      console.error("Meal nutrition error:", error);
      setNutritionError(
        error instanceof Error
          ? error.message
          : "Could not load nutrition information."
      );
    } finally {
      setNutritionLoading(false);
    }
  }

  // Find meals using typed ingredients
  function findMeals() {
    const userIngredients = ingredients
      .toLowerCase()
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const rankedMeals = meals
      .map((meal) => {
        let score = 0;

        const ingredientAliases: Record<string, string> = {
          "chicken breast": "chicken",
          "chicken thigh": "chicken",
          "ground chicken": "chicken",
          "white rice": "rice",
          "brown rice": "rice",
          "corn tortilla": "tortilla",
          "cheddar cheese": "cheese",
          "parmesan cheese": "cheese",
          "mozzarella cheese": "cheese",
          "feta cheese": "cheese",
          "whole wheat bread": "bread",
          "ground beef": "beef",
          "beef steak": "beef",
          "ground turkey": "turkey",
          "turkey breast": "turkey",
          "greek yogurt": "yogurt",
          "bell pepper": "pepper",
          "olive oil": "oil",
          "egg white": "egg",
        };

        const matchedIngredients = meal.ingredients.filter((ingredient) => {
          const simplifiedName =
            ingredientAliases[ingredient.name.toLowerCase()] ||
            ingredient.name.toLowerCase();

          return userIngredients.some((userIngredient) => {
            return (
              userIngredient === simplifiedName ||
              userIngredient === ingredient.name.toLowerCase()
            );
          });
        });

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

    setImageMimeType(file.type);

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
      // Clean base64 string by stripping the "data:image/...;base64," prefix
      const base64Data = selectedImage.includes(",")
        ? selectedImage.split(",")[1]
        : selectedImage;

      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64Image: base64Data,
          mimeType: imageMimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Food analysis failed.");
      }

      // Read returned ingredients from API
      const foods: string[] = data.detectedIngredients || data.foods || [];

      if (foods.length === 0) {
        setAnalysisError("No identifiable food items found in this photo.");
      } else {
        setDetectedFoods(foods);
      }
    } catch (error) {
      console.error(error);

      setAnalysisError(
        "We couldn't analyze that photo. Please try another image."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Use AI-detected foods in recipe finder
  function useDetectedFoods() {
    if (detectedFoods.length === 0) return;

    setIngredients(detectedFoods.join(", "));

    const userIngredients = detectedFoods.map((food) =>
      food.toLowerCase().trim()
    );

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

  return (
    <main className="container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">🍽️ NutriPlan</div>

        <div className="nav-links">
          <a href="#planner">Meal Planner</a>
          <a href="#camera">Analyze Food</a>

          {userEmail ? (
            <>
              <a href="/food-log">Food Log</a>

              <button
                className="login-button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.refresh();
                }}
              >
                Log Out
              </button>
            </>
          ) : (
            <button
              className="login-button"
              onClick={() => router.push("/login")}
            >
              Log In
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <HeroWithPhone />
   <StatsSection />

      {/* MEAL PLANNER */}
      <section className="planner" id="planner">
        <h2>Find Your Meal</h2>

        <p className="section-description">
          Tell us what you have and we'll find meals that match.
        </p>

        <div className="form-card">
          <label>What ingredients do you have?</label>

          <input
            type="text"
            placeholder="chicken, rice, broccoli"
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

      {/* RECOMMENDATIONS */}
      {results.length > 0 && (
        <section className="results">
          <h2>Your Recommendations</h2>

          <p className="section-description">
            Meals ranked using your ingredients, budget, and
            cooking time.
          </p>

          <div className="meal-grid">
            {results.map(({ meal, matchedIngredients }) => (
              <div className="meal-card" key={meal.id}>
                <div className="meal-icon">🍽️</div>

                <h3>{meal.name}</h3>

                <p>{meal.description}</p>

                <div className="match-info">
                  ✓ {matchedIngredients.length} ingredient
                  {matchedIngredients.length !== 1 ? "s" : ""}{" "}
                  match
                  {matchedIngredients.length !== 1 ? "" : "es"}
                </div>

                <div className="meal-info">
                  <span>⏱️ {meal.cookingTime} min</span>

                  <span>💰 ${meal.cost.toFixed(2)}</span>
                </div>

                <div className="ingredient-tags">
                  {matchedIngredients.map((ingredient) => (
                    <span key={ingredient.name}>
                      {ingredient.name}
                    </span>
                  ))}
                </div>

                <button
                  className="secondary-button"
                  onClick={() => openMealDetails(meal)}
                >
                  View Meal
                </button>
              </div>
            ))}
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
            Upload a photo of your food and our AI will identify
            the foods it can recognize.
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
                We'll use AI to identify what's on your plate.
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
            Gemini identified the following foods in your photo.
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

      {/* MODAL */}
      {selectedMeal && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedMeal(null)}
        >
          <div
            className="recipe-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setSelectedMeal(null)}
            >
              ✕
            </button>

            <div className="recipe-icon">🍽️</div>

            <p className="eyebrow">NUTRIPLAN RECIPE</p>

            <h2>{selectedMeal.name}</h2>

            <p className="recipe-description">
              {selectedMeal.description}
            </p>

            <div className="recipe-stats">
              <span>⏱️ {selectedMeal.cookingTime} min</span>
              <span>💰 ${selectedMeal.cost.toFixed(2)}</span>
            </div>

            <section className="nutrition-panel" aria-live="polite">
              <h3>Nutrition Information</h3>
              <p className="section-description">
                Estimated nutrition for all listed ingredients.
              </p>

              {nutritionLoading && nutritionMealId === selectedMeal.id && (
                <p>Calculating nutrition from USDA data...</p>
              )}

              {nutritionError && nutritionMealId === selectedMeal.id && (
                <p className="error-message">{nutritionError}</p>
              )}

              {!nutritionLoading &&
                !nutritionError &&
                nutritionMealId === selectedMeal.id &&
                mealNutrition && (
                  <>
                    <div className="nutrition-grid">
                      <div className="nutrition-item">
                        <span>Calories</span>
                        <strong>{Math.round(mealNutrition.calories)} kcal</strong>
                      </div>
                      <div className="nutrition-item">
                        <span>Protein</span>
                        <strong>{mealNutrition.protein.toFixed(1)} g</strong>
                      </div>
                      <div className="nutrition-item">
                        <span>Carbs</span>
                        <strong>{mealNutrition.carbs.toFixed(1)} g</strong>
                      </div>
                      <div className="nutrition-item">
                        <span>Fat</span>
                        <strong>{mealNutrition.fat.toFixed(1)} g</strong>
                      </div>
                      <div className="nutrition-item">
                        <span>Fiber</span>
                        <strong>{mealNutrition.fiber.toFixed(1)} g</strong>
                      </div>
                      <div className="nutrition-item">
                        <span>Sugar</span>
                        <strong>{mealNutrition.sugar.toFixed(1)} g</strong>
                      </div>
                      <div className="nutrition-item">
                        <span>Sodium</span>
                        <strong>{Math.round(mealNutrition.sodium)} mg</strong>
                      </div>
                    </div>
                    <p className="nutrition-note">
                      These are estimates based on USDA food matches and the
                      ingredient amounts listed. Cooking oil, sauces, and other
                      unlisted ingredients are not included. Actual nutrition
                      may differ depending on the exact food and preparation.
                    </p>
                  </>
                )}
            </section>

            <h3>Ingredients</h3>

            <ul className="ingredient-list">
              {selectedMeal.ingredients.map((ingredient) => (
                <li key={ingredient.name}>
                  <span>✓</span>
                  <strong>{ingredient.name}</strong>
                  <span>{ingredient.grams}g</span>
                </li>
              ))}
            </ul>

            
            <h3>How to Make It</h3>

            <ol className="recipe-steps">
              {getRecipe(selectedMeal.id).map((step, index) => (
              <li key={index}>{step}</li>
              ))}
            </ol>

            <button
              className="primary-button"
              onClick={() => setSelectedMeal(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <strong>NutriPlan</strong>

        <span>
          Plan smarter. Eat better. Waste less.
        </span>
      </footer>
    </main>
  );
}