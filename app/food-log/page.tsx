
"use client";

import { useState } from "react";
import styles from "./food-log.module.css";

type Per100g = { calories: number; protein: number; carbs: number; fat: number };
type Item = {
  name: string;
  quantity?: number;
  unit?: string;
  grams: number;
  matchedFood?: string;
  per100g: Per100g;
};

const scale = (item: Item, key: keyof Per100g) => item.per100g[key] * (item.grams / 100);

export default function LogPage() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      if (!data.items?.length) {
        setError("No foods recognized. Try listing each food with a rough amount.");
        setItems([]);
      } else {
        setItems(data.items);
      }
    } catch {
      setError("Couldn't get nutrition facts. Check your connection and try again.");
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

  function save() {
    // TODO: connect this to however NutriPlan stores data (database, localStorage, etc.)
    console.log("Saving meal:", items);
    setMessage("Saved to your food log.");
    setItems([]);
    setText("");
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

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>What did you eat?</h1>
      <p className={styles.sub}>
        Describe your meal in plain words, like "2 scrambled eggs, a slice of toast and a banana".
      </p>

      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. a bowl of oatmeal with blueberries and a glass of milk"
        aria-label="Foods you ate"
      />

      <div className={styles.actions}>
        <button className={styles.primary} onClick={analyze} disabled={loading}>
          Get nutrition facts
        </button>
        <span className={styles.status} role="status">
          {loading ? "Looking up your foods…" : message}
        </span>
      </div>
      {error && <div className={styles.error} role="alert">{error}</div>}

      {items.length > 0 && (
        <section>
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

          <h2 className={styles.heading}>Items found</h2>
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

          <button className={`${styles.primary} ${styles.save}`} onClick={save}>
            Save to my food log
          </button>
        </section>
      )}
    </main>
  );
}
