"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  INGREDIENT_NAMES, freshness, freshnessLabel, rankMeals, sortByExpiry,
  type PantryItem, type Ranked,
} from "@/lib/pantry";
import styles from "./pantry.module.css";

const MAX_ITEMS = 200;

export default function PantryPage() {
  const [supabase] = useState(() => createClient());
  const [items, setItems] = useState<PantryItem[]>([]);
  const [used, setUsed] = useState(0);
  const [wasted, setWasted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const [active, closed] = await Promise.all([
      supabase.from("pantry_items").select("id, name, expires_on").eq("status", "active").limit(MAX_ITEMS),
      supabase.from("pantry_items").select("status").in("status", ["used", "wasted"]).gte("closed_at", since),
    ]);
    if (active.error) {
      setError(
        active.error.code === "42P01" || active.error.code === "PGRST205"
          ? "The pantry table isn't set up yet. Run supabase/pantry.sql in your Supabase SQL Editor."
          : "Couldn't load your pantry. Try refreshing."
      );
    } else {
      setItems(sortByExpiry((active.data ?? []) as PantryItem[]));
    }
    const rows = (closed.data ?? []) as { status: string }[];
    setUsed(rows.filter((r) => r.status === "used").length);
    setWasted(rows.filter((r) => r.status === "wasted").length);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const { useItUp, bestFit } = useMemo(() => rankMeals(items), [items]);
  const suggestions = useItUp.length ? useItUp : bestFit;
  const expiredCount = items.filter((i) => freshness(i.expires_on) === "expired").length;

  async function addItem(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const clean = name.trim().replace(/\s+/g, " ");
    setError(""); setNote("");
    if (!clean) return setError("Type an ingredient to add.");
    if (clean.length > 60) return setError("Keep the name under 60 characters.");
    if (items.length >= MAX_ITEMS) return setError("Your pantry is full. Remove something first.");
    if (items.some((i) => i.name.toLowerCase() === clean.toLowerCase())) {
      return setError(`${clean} is already in your pantry.`);
    }
    setBusy(true);
    const { data, error: err } = await supabase
      .from("pantry_items")
      .insert({ name: clean, expires_on: date || null })
      .select("id, name, expires_on")
      .single();
    setBusy(false);
    if (err || !data) return setError("Couldn't add that. Please try again.");
    setItems((prev) => sortByExpiry([...prev, data as PantryItem]));
    setName(""); setDate("");
  }

  // status: "used" = cooked/eaten, "wasted" = tossed. Both leave the active list.
  async function close(ids: string[], status: "used" | "wasted") {
    setError(""); setNote("");
    const { error: err } = await supabase
      .from("pantry_items")
      .update({ status, closed_at: new Date().toISOString() })
      .in("id", ids);
    if (err) return setError("Couldn't update that. Please try again.");
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
    if (status === "used") setUsed((n) => n + ids.length); else setWasted((n) => n + ids.length);
    if (status === "used") setNote(`Nice. ${ids.length} item${ids.length > 1 ? "s" : ""} used up.`);
  }

  function Card({ r }: { r: Ranked }) {
    const ids = Array.from(new Set(r.matched.map((m) => m.item.id)));
    return (
      <li className={styles.meal}>
        <div className={styles.mealHead}>
          <strong>{r.meal.name}</strong>
          <span className={styles.meta}>⏱️ {r.meal.cookingTime} min · 💰 ${r.meal.cost.toFixed(2)}</span>
        </div>
        <div className={styles.tags}>
          {r.matched.map((m) => (
            <span key={m.ingredient} className={m.kind === "today" || m.kind === "soon" ? styles.tagUrgent : styles.tag}>
              ✓ {m.ingredient}{m.kind === "today" || m.kind === "soon" ? ` · ${freshnessLabel(m.item.expires_on).toLowerCase()}` : ""}
            </span>
          ))}
          {r.missing.map((m) => <span key={m} className={styles.tagMissing}>+ {m}</span>)}
        </div>
        <button type="button" className={styles.ghost} onClick={() => close(ids, "used")}>
          I cooked this: mark {ids.length} item{ids.length > 1 ? "s" : ""} used
        </button>
      </li>
    );
  }

  return (
    <main className={styles.main}>
      <a href="/" className={styles.back}>← Back to NutriGoal</a>
      <h1 className={styles.title}>Your Pantry</h1>
      <p className={styles.sub}>Add what you have and when it expires. We'll rank meals that use it up first.</p>

      <div className={styles.stats}>
        <div><b>{items.length}</b><span>in your pantry</span></div>
        <div><b className={styles.good}>{used}</b><span>used up (30 days)</span></div>
        <div><b className={wasted ? styles.bad : undefined}>{wasted}</b><span>tossed (30 days)</span></div>
      </div>

      <form className={styles.add} onSubmit={addItem}>
        <div className={styles.addField}>
          <label htmlFor="pname">Ingredient</label>
          <input id="pname" list="ingredient-options" value={name} maxLength={60} autoComplete="off"
            placeholder="e.g. chicken breast" onChange={(e) => setName(e.target.value)} />
          <datalist id="ingredient-options">
            {INGREDIENT_NAMES.map((n) => <option key={n} value={n} />)}
          </datalist>
        </div>
        <div className={styles.addField}>
          <label htmlFor="pdate">Use by (optional)</label>
          <input id="pdate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <button className={styles.primary} disabled={busy}>{busy ? "Adding…" : "Add"}</button>
      </form>

      <div aria-live="polite">
        {error && <p className={styles.error} role="alert">{error}</p>}
        {note && <p className={styles.noteOk}>{note}</p>}
      </div>

      <h2 className={styles.heading}>{useItUp.length ? "Use it up first" : "Cook with what you have"}</h2>
      {suggestions.length > 0 ? (
        <ul className={styles.list}>{suggestions.map((r) => <Card key={r.meal.id} r={r} />)}</ul>
      ) : (
        <p className={styles.empty}>
          {items.length ? "No meals match your pantry yet. Add a few more ingredients." : "Add ingredients above to get meal ideas."}
        </p>
      )}

      <h2 className={styles.heading}>In your pantry</h2>
      {expiredCount > 0 && (
        <p className={styles.notice}>{expiredCount} item{expiredCount > 1 ? "s are" : " is"} past the date and won't be suggested. If in doubt, throw it out.</p>
      )}
      {loading ? <p className={styles.empty}>Loading…</p> : items.length === 0 ? (
        <p className={styles.empty}>Nothing here yet.</p>
      ) : (
        <ul className={styles.items}>
          {items.map((i) => (
            <li key={i.id} className={styles.item}>
              <div>
                <span className={styles.iname}>{i.name}</span>
                <span className={`${styles.badge} ${styles[freshness(i.expires_on)]}`}>{freshnessLabel(i.expires_on)}</span>
              </div>
              <div className={styles.row}>
                <button type="button" className={styles.small} onClick={() => close([i.id], "used")}>Used</button>
                <button type="button" className={styles.smallDanger} onClick={() => close([i.id], "wasted")}>Toss</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
