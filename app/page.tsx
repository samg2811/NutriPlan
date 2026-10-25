"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { meals, Meal, MealIngredient } from "@/data/meals";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getRecipe } from "@/data/recipes";
import FoodLogSection from "@/components/FoodLogSection";
import MobileNav from "@/components/MobileNav";
import PantrySection from "@/components/PantrySection";
import TodaySummary from "@/components/TodaySummary";
import { announceFoodLogChanged, announceMealLogged } from "@/lib/cook";
import RestrictionsPanel from "@/components/RestrictionsPanel";
import { useRestrictions } from "@/components/useRestrictions";
import { findViolations } from "@/lib/restrictions";
import WeeklyMealPlan from "@/components/WeeklyMealPlan";

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

type PhotoFoodPortion = {
  name: string;
  grams: number;
  nutrition: NutritionData | null;
};

// Shrinks big photos and screenshots so they upload reliably
function compressImage(file: File, maxSize = 1280, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);

      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }

      // White background so transparent PNG screenshots don't turn black
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };

    img.src = url;
  });
}

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [budget, setBudget] = useState(10);
  const [maxTime, setMaxTime] = useState(30);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [mealNutrition, setMealNutrition] = useState<NutritionData | null>(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState("");
  const [nutritionMealId, setNutritionMealId] = useState<number | null>(null);
  const { prefs } = useRestrictions();
  const [hiddenCount, setHiddenCount] = useState(0);

  const [results, setResults] = useState<RankedMeal[]>([]);

  const router = useRouter();
  const [supabase] = useState(() => createClient());

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
  }, [supabase]);

  // AI Food Analysis
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [detectedFoods, setDetectedFoods] = useState<string[]>([]);
  const [photoFoodPortions, setPhotoFoodPortions] = useState<PhotoFoodPortion[]>([]);
  const [photoNutrition, setPhotoNutrition] = useState<NutritionData | null>(null);
  const [photoNutritionNote, setPhotoNutritionNote] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const [savingPhoto, setSavingPhoto] = useState(false);
  const [photoSaveMessage, setPhotoSaveMessage] = useState("");
  const [photoSaveError, setPhotoSaveError] = useState("");

  const [savingRecipe, setSavingRecipe] = useState(false);
  const [recipeSaveMessage, setRecipeSaveMessage] = useState("");
  const [recipeSaveError, setRecipeSaveError] = useState("");

  const [mealNutritionItems, setMealNutritionItems] = useState<
    {
      name: string;
      grams: number;
      per100g: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
    }[]
  >([]);

  async function saveEntryToFoodTracker(entry: {
    mealText: string;
    items: {
      name: string;
      grams: number;
      per100g: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
    }[];
    nutrition: NutritionData;
  }) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push("/login");
      throw new Error("Please log in to save food to your tracker.");
    }

    const { error } = await supabase.from("food_logs").insert({
      meal_text: entry.mealText,
      items: entry.items,
      calories: Math.round(entry.nutrition.calories),
      protein: Math.round(entry.nutrition.protein * 10) / 10,
      carbs: Math.round(entry.nutrition.carbs * 10) / 10,
      fat: Math.round(entry.nutrition.fat * 10) / 10,
    });

    if (error) {
      console.error("Food Tracker save error:", error);
      throw new Error("Couldn't save this entry. Please try again.");
      announceFoodLogChanged();
    }
  }

  async function savePhotoToTracker() {
    if (!photoNutrition || detectedFoods.length === 0) {
      setPhotoSaveError("Analyze the photo and load nutrition estimates first.");
      return;
    }

    setSavingPhoto(true);
    setPhotoSaveError("");
    setPhotoSaveMessage("");

    try {
      const portions = photoFoodPortions.length
        ? photoFoodPortions
        : detectedFoods.map((name) => ({
            name,
            grams: 100,
            nutrition: null,
          }));

      const items = portions.map((food) => {
        const grams = food.grams;
        const n = food.nutrition;
        const factor = grams > 0 ? 100 / grams : 0;

        return {
          name: food.name,
          grams,
          per100g: {
            calories: n ? n.calories * factor : 0,
            protein: n ? n.protein * factor : 0,
            carbs: n ? n.carbs * factor : 0,
            fat: n ? n.fat * factor : 0,
          },
        };
      });

      await saveEntryToFoodTracker({
        mealText: `Photo scan: ${detectedFoods.join(", ")}`,
        items,
        nutrition: photoNutrition,
      });

      setPhotoSaveMessage("Scanned meal saved to your Food Tracker!");
    } catch (error) {
      setPhotoSaveError(
        error instanceof Error
          ? error.message
          : "Couldn't save the scanned meal."
      );
    } finally {
      setSavingPhoto(false);
    }
  }

  async function saveRecipeToTracker() {
    if (!selectedMeal || !mealNutrition) {
      setRecipeSaveError("Wait for nutrition information to finish loading.");
      return;
    }

    setSavingRecipe(true);
    setRecipeSaveError("");
    setRecipeSaveMessage("");

    try {
      await saveEntryToFoodTracker({
        mealText: `Recipe: ${selectedMeal.name}`,
        items: mealNutritionItems,
        nutrition: mealNutrition,
      });

      setRecipeSaveMessage("Recipe saved to your Food Tracker!");
      announceMealLogged(selectedMeal.ingredients.map((i) => i.name));
    } catch (error) {
      setRecipeSaveError(
        error instanceof Error
          ? error.message
          : "Couldn't save the recipe."
      );
    } finally {
      setSavingRecipe(false);
    }
  }

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

      const ingredientResults = Array.isArray(data.ingredients)
        ? data.ingredients
        : [];

      setMealNutritionItems(
        ingredientResults
          .filter(
            (item: any) =>
              item &&
              typeof item.name === "string" &&
              typeof item.grams === "number" &&
              item.grams > 0 &&
              item.nutrition &&
              typeof item.nutrition.calories === "number" &&
              typeof item.nutrition.protein === "number" &&
              typeof item.nutrition.carbs === "number" &&
              typeof item.nutrition.fat === "number"
          )
          .map((item: any) => {
            const factor = 100 / item.grams;

            return {
              name: item.name,
              grams: item.grams,
              per100g: {
                calories: item.nutrition.calories * factor,
                protein: item.nutrition.protein * factor,
                carbs: item.nutrition.carbs * factor,
                fat: item.nutrition.fat * factor,
              },
            };
          })
      );

      setRecipeSaveMessage("");
      setRecipeSaveError("");
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

    const allowed = rankedMeals.filter(
  (r) => findViolations(r.meal, prefs.ids, prefs.avoid).length === 0
);
setHiddenCount(rankedMeals.length - allowed.length);
setResults(allowed.slice(0, 3));
  }

  // Handle photo / screenshot upload (shrinks the image before it is sent)
  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAnalysisError("Please upload an image file.");
      input.value = "";
      return;
    }

    try {
      const dataUrl = await compressImage(file);

      setImageMimeType("image/jpeg");
      setSelectedImage(dataUrl);
      setDetectedFoods([]);
      setPhotoFoodPortions([]);
      setPhotoNutrition(null);
      setPhotoNutritionNote("");
      setPhotoSaveMessage("");
      setPhotoSaveError("");
      setAnalysisError("");
    } catch {
      setAnalysisError("Couldn't read that image. Try a JPEG or PNG.");
    } finally {
      // Lets the same file be chosen again if the first try fails
      input.value = "";
    }
  }

  // Send photo to Gemini
  async function analyzeFood() {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisError("");
    setDetectedFoods([]);
    setPhotoFoodPortions([]);
    setPhotoNutrition(null);
    setPhotoNutritionNote("");

    try {
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

      const foods: string[] = Array.isArray(data.detectedIngredients)
        ? data.detectedIngredients.filter(
            (food: unknown): food is string =>
              typeof food === "string"
          )
        : Array.isArray(data.foods)
        ? data.foods.filter(
            (food: unknown): food is string =>
              typeof food === "string"
          )
        : [];

      if (foods.length === 0) {
        setAnalysisError(
          "No identifiable food items found in this photo."
        );
        return;
      }

      setDetectedFoods(foods);

      setPhotoFoodPortions(
        Array.isArray(data.foodPortions)
          ? data.foodPortions.filter(
              (food: unknown): food is PhotoFoodPortion =>
                typeof food === "object" &&
                food !== null &&
                "name" in food &&
                typeof food.name === "string" &&
                "grams" in food &&
                typeof food.grams === "number"
            )
          : []
      );

      if (data.nutrition && typeof data.nutrition === "object") {
        const n = data.nutrition;
        const values = [
          n.calories,
          n.protein,
          n.carbs,
          n.fat,
          n.fiber,
          n.sugar,
          n.sodium,
        ];

        if (
          values.every(
            (value: unknown) =>
              typeof value === "number" &&
              Number.isFinite(value)
          )
        ) {
          setPhotoNutrition({
            calories: n.calories,
            protein: n.protein,
            carbs: n.carbs,
            fat: n.fat,
            fiber: n.fiber,
            sugar: n.sugar,
            sodium: n.sodium,
          });
        }
      }

      setPhotoNutritionNote(
        typeof data.nutritionNote === "string"
          ? data.nutritionNote
          : "Portion sizes and nutrition values are estimates."
      );
    } catch (error) {
      console.error(error);

      const message = error instanceof Error ? error.message : "";

      setAnalysisError(
        message.startsWith("Please log in") ||
          message.startsWith("The AI is busy")
          ? message
          : "We couldn't analyze that photo. Please try another image."
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
        const matchedIngredients = meal.ingredients.filter((ingredient) => {
          const name = ingredient.name.toLowerCase();

          return userIngredients.some(
            (food) =>
              food === name ||
              food.includes(name) ||
              name.includes(food)
          );
        });

        let score = matchedIngredients.length * 5;

        score += meal.cookingTime <= maxTime ? 3 : -2;
        score += meal.cost <= budget ? 3 : -2;

        return {
          meal,
          score,
          matchedIngredients,
        };
      })
      .filter((item) => item.matchedIngredients.length > 0)
      .sort((a, b) => b.score - a.score);

    const allowed = rankedMeals.filter(
  (r) => findViolations(r.meal, prefs.ids, prefs.avoid).length === 0
);
setHiddenCount(rankedMeals.length - allowed.length);
setResults(allowed.slice(0, 3));

    window.setTimeout(() => {
      document.getElementById("planner")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  return (
    <main className="container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">🍽️ NutriGoal</div>

        <div className="nav-links">
          <a href="#planner">Meal Planner</a>
          <a href="#camera">Analyze Food</a>
          <a href="#weekly-plan">Weekly Plan</a>

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

      {/* TODAY SO FAR */}
      <TodaySummary />
      <WeeklyMealPlan />

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
        <PantrySection onUse={(names) => setIngredients(names.join(", "))} />
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
            {detectedFoods.map((food, index) => {
              const portion = photoFoodPortions.find(
                (item) => item.name.toLowerCase() === food.toLowerCase()
              );
              return (
                <div className="food-item" key={`${food}-${index}`}>
                  <span>✓</span>
                  <span>{food}</span>
                  {portion && <strong>{Math.round(portion.grams)} g (estimated)</strong>}
                </div>
              );
            })}
          </div>

          {photoNutrition && (
            <section className="nutrition-panel photo-nutrition-panel" aria-live="polite">
              <h3>Estimated Nutrition From Photo</h3>
              <p className="section-description">
                Calculated from estimated portions and USDA FoodData Central matches.
              </p>
              <div className="nutrition-grid">
                <div className="nutrition-item"><span>Calories</span><strong>{Math.round(photoNutrition.calories)} kcal</strong></div>
                <div className="nutrition-item"><span>Protein</span><strong>{photoNutrition.protein.toFixed(1)} g</strong></div>
                <div className="nutrition-item"><span>Carbs</span><strong>{photoNutrition.carbs.toFixed(1)} g</strong></div>
                <div className="nutrition-item"><span>Fat</span><strong>{photoNutrition.fat.toFixed(1)} g</strong></div>
                <div className="nutrition-item"><span>Fiber</span><strong>{photoNutrition.fiber.toFixed(1)} g</strong></div>
                <div className="nutrition-item"><span>Sugar</span><strong>{photoNutrition.sugar.toFixed(1)} g</strong></div>
                <div className="nutrition-item"><span>Sodium</span><strong>{Math.round(photoNutrition.sodium)} mg</strong></div>
              </div>
              <p className="nutrition-note">
                {photoNutritionNote} Photo-based portion sizes can be inaccurate, and sauces, oils, seasonings, or hidden ingredients may not be counted.
              </p>
            </section>
          )}

          <div className="tracker-actions">
            <button
              className="primary-button"
              onClick={savePhotoToTracker}
              disabled={savingPhoto || !photoNutrition}
            >
              {savingPhoto
                ? "Saving..."
                : "＋ Add Scanned Meal to Food Tracker"}
            </button>

            {photoSaveMessage && (
              <p role="status">{photoSaveMessage}</p>
            )}

            {photoSaveError && (
              <p className="error-message" role="alert">
                {photoSaveError}
              </p>
            )}
          </div>

          <p className="confirmation-text">
            AI identification and portion estimates can make mistakes. Review the foods and amounts before relying on the results.
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
              aria-label="Close recipe"
            >
              ✕
            </button>

            <div className="recipe-icon">🍽️</div>

            <p className="eyebrow">NUTRIGOAL RECIPE</p>

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

                    <div className="tracker-actions">
                      <button
                        className="primary-button"
                        onClick={saveRecipeToTracker}
                        disabled={savingRecipe || nutritionLoading || mealNutritionItems.length === 0}
                      >
                        {savingRecipe
                          ? "Saving..."
                          : "＋ Add This Recipe to Food Tracker"}
                      </button>

                      {recipeSaveMessage && (
                        <p role="status">{recipeSaveMessage}</p>
                      )}

                      {recipeSaveError && (
                        <p className="error-message" role="alert">
                          {recipeSaveError}
                        </p>
                      )}

                      {mealNutritionItems.length === 0 && (
                        <p className="nutrition-note">
                          Ingredient-level nutrition data is needed to save this recipe.
                        </p>
                      )}
                    </div>
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

      {/* FOOD LOG */}
      <FoodLogSection />

      <MobileNav />

      {/* FOOTER */}
      <footer>
        <strong>NutriGoal</strong>

        <span>
          Plan smarter. Eat better. Waste less.
        </span>
      </footer>
    </main>
  );
}
