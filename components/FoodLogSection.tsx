
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import styles from "./FoodLogSection.module.css";

// Change these to whatever daily targets you want
const GOALS = { calories: 2000, protein: 100 };

type Per100g = { calories: number; protein: number; carbs: number; fat: number };
type Item = {
  name: string;
  quantity?: number;
  unit?: string;
  grams: number;
  matchedFood?: string;
  per100g: Per100g;
};
type LogRow = {
  id: string;
  created_at: string;
  meal_text: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};
type Suggestion = {
  id: string | number;
  name: string;
  description: string;
  cookingTime: number;
  cost: number;
  macros: { calories: number; protein: number; carbs: number; fat: number };
};

const scale = (item: Item, key: keyof Per100g) => item.per100g[key] * (item.grams / 100);

export default function FoodLogSection() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [text, setText] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [today, setToday] = useState<LogRow[]>([]);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestNote, setSuggestNote] = useState("");
  const [suggesting, setSuggesting] = useState(false);

  // ---- Load today's saved meals ----
  const loadToday = useCallback(async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from("food_logs")
      .select("id, created_at, meal_text, calories, protein, carbs, fat")
      .gte("created_at", start.toISOString())
      .order("created_at", { ascending: false });
    if (!error && data) setToday(data as LogRow[]);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      setLoggedIn(!!data.user);
      if (data.user) loadToday();
    }
    init();

    // Keep the section in sync when someone logs in or out on the same page
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        const isIn = !!session?.user;
        setLoggedIn(isIn);
        if (isIn) loadToday();
        else setToday([]);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, loadToday]);

  const eaten = today.reduce(
    (t, r) => ({
      calories: t.calories + Number(r.calories),
      protein: t.protein + Number(r.protein),
      carbs: t.carbs + Number(r.carbs),
      fat: t.fat + Number(r.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // ---- Analyze typed meal ----
  async function analyze() {
    setError("");
    setMessage("");
    if (!text.trim()) {
      setError("Type what you ate first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/analyze-meal-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.status === 401) throw new Error("login");
      if (!res.ok) throw new Error("Status " + res.status);
      const data = await res.json();
      if (!data.items?.length) {
        setError("No foods recognized. Try listing each food with a rough amount.");
        setItems([]);
      } else {
        setItems(data.items);
      }
    } catch (err) {
      console.error("analyze failed:", err);
      setError(
        err instanceof Error && err.message === "login"
          ? "Please log in to use the food log."
          : "Couldn't get nutrition facts. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateGrams(i: number, grams: number) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, grams } : it)));
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  const totals = items.reduce(
    (t, it) => ({
      calories: t.calories + scale(it, "calories"),
      protein: t.protein + scale(it, "protein"),
      carbs: t.carbs + scale(it, "carbs"),
      fat: t.fat + scale(it, "fat"),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // ---- Save to Supabase ----
  async function save() {
    if (!loggedIn) {
      setError("Log in to save meals to your food log.");
      return;
    }
    setSaving(true);
    setError("");
    const { error } = await supabase.from("food_logs").insert({
      meal_text: text,
      items,
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
    });
    setSaving(false);

    if (error) {
      console.error("save failed:", error);
      setError("Couldn't save this meal. Try again.");
      return;
    }
    setMessage("Saved to your food log.");
    setItems([]);
    setText("");
    setSuggestions([]);
    setSuggestNote("");
    loadToday();
  }

  async function deleteLog(id: string) {
    const { error } = await supabase.from("food_logs").delete().eq("id", id);
    if (!error) {
      setSuggestions([]);
      setSuggestNote("");
      loadToday();
    }
  }

  // ---- What should I eat next? ----
  async function getNextMeal() {
    setSuggesting(true);
    setSuggestNote("");
    setSuggestions([]);
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
      setSuggestions(data.suggestions ?? []);
      if (data.note) setSuggestNote(data.note);
      else if (!data.suggestions?.length) setSuggestNote("No meals found that fit right now.");
    } catch (err) {
      console.error("next meal failed:", err);
      setSuggestNote("Couldn't get suggestions. Try again.");
    } finally {
      setSuggesting(false);
    }
  }

  const calPct = Math.min(100, (eaten.calories / GOALS.calories) * 100);
  const proPct = Math.min(100, (eaten.protein / GOALS.protein) * 100);

  return (
    <section className={styles.section} id="food-log">
      <p className={styles.eyebrow}>FOOD LOG</p>
      <h2 className={styles.title}>Track what you eat</h2>
      <p className={styles.sub}>
        Describe your meal in plain words and get calories and macros in seconds.
      </p>

      {loggedIn === false && (
        <div className={styles.loginCard}>
          <strong>Log in to use your food log</strong>
          <p>Your meals are saved to your account so you can see your day at a glance.</p>
          <button className="primary-button" onClick={() => router.push("/login")}>
            Log in or sign up →
          </button>
        </div>
      )}

      {loggedIn && (
        <>
          <div className={styles.today}>
            <h3 className={styles.heading} style={{ marginTop: 0 }}>Today so far</h3>

            <div className={styles.goalRow}>
              <span>Calories</span>
              <span>{Math.round(eaten.calories)} / {GOALS.calories}</span>
            </div>
            <div className={styles.track}><div className={styles.fill} style={{ width: calPct + "%" }} /></div>

            <div className={styles.goalRow}>
              <span>Protein</span>
              <span>{Math.round(eaten.protein)} / {GOALS.protein} g</span>
            </div>
            <div className={styles.track}><div className={styles.fill} style={{ width: proPct + "%" }} /></div>

            {today.length > 0 && (
              <ul className={styles.todayList}>
                {today.map((r) => (
                  <li key={r.id}>
                    <span>
                      {new Date(r.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      {" · "}
                      {r.meal_text || "Meal"}
                      {" · "}
                      {Math.round(Number(r.calories))} cal
                    </span>
                    <button className={styles.remove} onClick={() => deleteLog(r.id)} aria-label="Delete this entry">×</button>
                  </li>
                ))}
              </ul>
            )}

            <button className="primary-button" onClick={getNextMeal} disabled={suggesting} style={{ marginTop: 14 }}>
              {suggesting ? "Finding meals…" : "What should I eat next? →"}
            </button>
            {suggestNote && <p className={styles.sub} style={{ marginTop: 10 }}>{suggestNote}</p>}

            {suggestions.length > 0 && (
              <ul className={styles.suggestions}>
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <div className={styles.name}>{s.name}</div>
                    <div className={styles.detail}>{s.description}</div>
                    <div className={styles.detail}>
                      {s.macros.calories} cal · {s.macros.protein}g protein · {s.macros.carbs}g carbs · {s.macros.fat}g fat
                      {" · "}⏱️ {s.cookingTime} min · 💰 ${Number(s.cost).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <h3 className={styles.heading}>What did you eat?</h3>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. 2 scrambled eggs, a slice of toast and a banana"
            aria-label="Foods you ate"
          />

          <div className={styles.actions}>
            <button className="primary-button" onClick={analyze} disabled={loading}>
              Get nutrition facts
            </button>
            <span className={styles.status} role="status">
              {loading ? "Looking up your foods…" : message}
            </span>
          </div>
          {error && <div className={styles.error} role="alert">{error}</div>}

          {items.length > 0 && (
            <div>
              <div className={styles.totals}>
                <div className={styles.kcal}>
                  {Math.round(totals.calories)} <small>calories</small>
                </div>
                <div className={styles.macros}>
                  <div><b>{totals.protein.toFixed(1)} g</b><span>Protein</span></div>
                  <div><b>{totals.carbs.toFixed(1)} g</b><span>Carbs</span></div>
                  <div><b>{totals.fat.toFixed(1)} g</b><span>Fat</span></div>
                </div>
              </div>

              <h3 className={styles.heading}>Items found</h3>
              <p className={styles.sub} style={{ margin: 0 }}>Change a portion size and the totals update.</p>

              <ul className={styles.items}>
                {items.map((it, i) => (
                  <li key={i} className={styles.item}>
                    <div className={styles.name}>
                      {it.name}
                      {it.quantity ? ` (${it.quantity} ${it.unit ?? ""})` : ""}
                    </div>
                    <div className={styles.detail}>
                      {Math.round(scale(it, "calories"))} cal · {scale(it, "protein").toFixed(1)}g protein ·{" "}
                      {scale(it, "carbs").toFixed(1)}g carbs · {scale(it, "fat").toFixed(1)}g fat
                    </div>
                    <div className={styles.grams}>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        value={Math.round(it.grams)}
                        onChange={(e) => updateGrams(i, Math.max(0, parseFloat(e.target.value) || 0))}
                        aria-label={`Grams of ${it.name}`}
                      />
                      <span>g</span>
                      <button className={styles.remove} onClick={() => removeItem(i)} aria-label={`Remove ${it.name}`}>
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <button className={`primary-button ${styles.save}`} onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save to my food log"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
