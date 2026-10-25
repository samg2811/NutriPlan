"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GOALS } from "@/lib/goals";
import styles from "./TodaySummary.module.css";
import { meals } from "@/data/meals";
import { recipes } from "@/data/recipes";

type Totals = { calories: number; protein: number; carbs: number; fat: number };
type Suggestion = {
  id: string | number;
  name: string;
  cookingTime: number;
  macros: Totals;
};

const EMPTY: Totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
const pct = (v: number, goal: number) => Math.max(0, Math.min(100, (v / goal) * 100));

const RADIUS = 52;
const CIRC = 2 * Math.PI * RADIUS;

export default function TodaySummary() {
  const [supabase] = useState(() => createClient());
  const rootRef = useRef<HTMLElement>(null);
  const lastLoad = useRef(0);

  const [loggedIn, setLoggedIn] = useState(false);
  const [eaten, setEaten] = useState<Totals>(EMPTY);
  const [greeting, setGreeting] = useState("Hello");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState("");
  const [loadingNext, setLoadingNext] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState(false);

  const load = useCallback(async () => {
    lastLoad.current = Date.now();
    const { data: auth } = await supabase.auth.getUser();
    setLoggedIn(!!auth.user);
    if (!auth.user) return;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from("food_logs")
      .select("calories, protein, carbs, fat")
      .gte("created_at", start.toISOString());
    if (error || !data) return;

    const rows = data as Totals[];
    setEaten(
      rows.reduce(
        (t, r) => ({
          calories: t.calories + Number(r.calories),
          protein: t.protein + Number(r.protein),
          carbs: t.carbs + Number(r.carbs),
          fat: t.fat + Number(r.fat),
        }),
        { ...EMPTY }
      )
    );
  }, [supabase]);

  // Time-of-day greeting (set after mount so server and browser agree)
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);

  // Load now, then refresh whenever the card comes back into view or the tab regains focus,
  // so meals saved further down the page show up here.
  useEffect(() => {
    load();

    function refresh() {
      if (Date.now() - lastLoad.current > 2000) load();
    }
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };

    window.addEventListener("focus", refresh);
    window.addEventListener("foodlog:changed", refresh);
    document.addEventListener("visibilitychange", onVisible);

    let observer: IntersectionObserver | undefined;
    if (rootRef.current) {
      observer = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) refresh(); }, { threshold: 0.3 });
      observer.observe(rootRef.current);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("foodlog:changed", refresh);
      document.removeEventListener("visibilitychange", onVisible);
      observer?.disconnect();
      subscription.unsubscribe();
    };
  }, [load, supabase]);

  // What was suggested is stale once the day's totals change.
  useEffect(() => {
    setSuggestions([]); setIndex(0); setNote("");
  }, [eaten.calories, eaten.protein]);

  async function getNext() {
    // Already have suggestions: just show the next one.
    if (suggestions.length > 1) {
      setIndex((i) => (i + 1) % suggestions.length);
      return;
    }
    setLoadingNext(true); setNote("");
    try {
      const res = await fetch("/api/next-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remainingCalories: GOALS.calories - eaten.calories,
          remainingProtein: GOALS.protein - eaten.protein,
          hour: new Date().getHours(),
        }),
      });
      if (!res.ok) throw new Error("Status " + res.status);
      const data = await res.json();
      const list: Suggestion[] = data.suggestions ?? [];
      setSuggestions(list); setIndex(0);
      if (data.note) setNote(data.note);
      else if (!list.length) setNote("No meals fit what you have left right now.");
    } catch {
      setNote("Couldn't get a suggestion. Try again.");
    } finally {
      setLoadingNext(false);
    }
  }

  if (!loggedIn) return <section ref={rootRef} aria-hidden />;

  const calPct = pct(eaten.calories, GOALS.calories);
  const left = Math.round(GOALS.calories - eaten.calories);
  const current = suggestions[index];
  const suggestedMeal = current
    ? meals.find((meal) => String(meal.id) === String(current.id))
    : undefined;
  
  const recipeSteps = current
    ? recipes[Number(current.id)] ?? []
    : [];
  const bars = [
    { label: "Protein", v: eaten.protein, goal: GOALS.protein },
    { label: "Carbs", v: eaten.carbs, goal: GOALS.carbs },
    { label: "Fat", v: eaten.fat, goal: GOALS.fat },
  ];

  return (
    <section className={styles.section} ref={rootRef} aria-label="Today so far">
      <p className={styles.hello}>{greeting} 👋</p>
      <h2 className={styles.title}>Today so far</h2>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.ringWrap} role="img"
            aria-label={`${Math.round(eaten.calories)} of ${GOALS.calories} calories eaten`}>
            <svg viewBox="0 0 120 120" className={styles.ring} aria-hidden>
              <circle cx="60" cy="60" r={RADIUS} className={styles.ringBg} />
              <circle cx="60" cy="60" r={RADIUS} className={styles.ringFg}
                strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - calPct / 100)} />
            </svg>
            <div className={styles.ringText}>
              <b>{Math.round(eaten.calories).toLocaleString()}</b>
              <small>/ {GOALS.calories.toLocaleString()} cal</small>
            </div>
          </div>

          <div className={styles.bars}>
            {bars.map((b) => (
              <div key={b.label}>
                <div className={styles.barHead}>
                  <span>{b.label}</span>
                  <span>{Math.round(b.v)} / {b.goal} g</span>
                </div>
                <div className={styles.track}>
                  <div className={styles.fill} style={{ width: pct(b.v, b.goal) + "%" }} />
                </div>
              </div>
            ))}
            <p className={styles.left}>
              {left > 0 ? `${left.toLocaleString()} cal left today` : "Calorie goal reached 🎉"}
            </p>
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.small}>Suggested next</p>
          <div aria-live="polite">
            {current ? (
              <>
                <strong className={styles.meal}>{current.name}</strong>
                <p className={styles.small}>
                  {current.macros.calories} cal · {current.macros.protein}g protein · ⏱️ {current.cookingTime} min
                </p>
                
                <button
                  type="button"
                  className={styles.cta}
                  onClick={() => setRecipeOpen((open) => !open)}
                >
                  {recipeOpen ? "Hide recipe ↑" : "View recipe →"}
                </button>
                {recipeOpen && (
                  <div className={styles.recipeDetails}>
                    <h3>Ingredients</h3>
                    {suggestedMeal ? (
                      <ul>
                        {suggestedMeal.ingredients.map((ingredient) => (
                          <li key={ingredient.name}>
                            {ingredient.grams} g {ingredient.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Ingredients unavailable.</p>
                    )}
                
                    <h3>Instructions</h3>
                    {recipeSteps.length > 0 ? (
                      <ol>
                        {recipeSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    ) : (
                      <p>Instructions are not available for this meal yet.</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className={styles.prompt}>
                {note || "Not sure what to eat? Get a meal that fits what you have left today."}
              </p>
            )}
          </div>
          <button type="button" className={styles.cta} onClick={getNext} disabled={loadingNext}>
            {loadingNext ? "Finding a meal…" : suggestions.length > 1 ? "Show another →" : "What should I eat next? →"}
          </button>
        </div>
      </div>
    </section>
  );
}
