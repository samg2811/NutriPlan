"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  INGREDIENT_NAMES, freshness, freshnessLabel, rankMeals, sortByExpiry,
  type PantryItem, type Ranked,
} from "@/lib/pantry";
import styles from "./PantrySection.module.css";

const MAX_ITEMS = 200;

// Lives inside the Meal Planner section. `onUse` fills the planner's ingredient box.
export default function PantrySection({ onUse }: { onUse: (names: string[]) => void }) {
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
  const suggestions = (useItUp.length ? useItUp : bestFit).slice(0, 3);
  const expiredCount = items.filter((i) => freshness(i.expires_on) === "expired").length;
  const expiringCount = items.filter((i) => ["today", "soon"].includes(freshness(i.expires_on))).length;
  const usable = items.filter((i) => freshness(i.expires_on) !== "expired");

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

  // "used" = cooked/eaten, "wasted" = tossed. Both leave the active list.
  async function close(ids: string[], status: "used" | "wasted") {
    setError(""); setNote("");
    const { error: err } = await supabase
      .from("pantry_items")
      .update({ status, closed_at: new Date().toISOString() })
      .in("id", ids);
    if (err) return setError("Couldn't update that. Please try again.");
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
    if (status === "used") {
      setUsed((n) => n + ids.length);
      setNote(`Nice. ${ids.length} item${ids.length > 1 ? "s" : ""} used up.`);
    } else {
      setWasted((n) => n + ids.length);
    }
  }

  function fillPlanner() {
    onUse(usable.map((i) => i.name.toLowerCase()));
    setNote("Planner filled with your pantry. Press “Find My Meals” above.");
    document.getElementById("planner")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    <details className={styles.card} id="pantry">
      <summary className={styles.summary}>
        <span>🧺 My pantry &amp; use-it-up tracker</span>
        <span className={styles.pills}>
          {expiringCount > 0 && <span className={styles.pillWarn}>⚠️ {expiringCount} expiring soon</span>}
          <span className={styles.pill}>{items.length} item{items.length === 1 ? "" : "s"}</span>
        </span>
      </summary>

      <div className={styles.body}>
        <p className={styles.sub}>
          Save what's in your kitchen and when it expires. We'll point you to meals that use up the food closest to spoiling.
        </p>

        <div className={styles.topRow}>
          <button type="button" className={styles.primary} onClick={fillPlanner} disabled={usable.length === 0}>
            Fill the planner with my pantry →
          </button>
          <span className={styles.counts}><b className={styles.good}>{used}</b> used up · <b className={wasted ? styles.bad : undefined}>{wasted}</b> tossed (30 days)</span>
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

        {suggestions.length > 0 && (
          <>
            <h3 className={styles.heading}>{useItUp.length ? "Use it up first" : "Cook with what you have"}</h3>
            <ul className={styles.list}>{suggestions.map((r) => <Card key={r.meal.id} r={r} />)}</ul>
          </>
        )}

        <h3 className={styles.heading}>In your pantry</h3>
        {expiredCount > 0 && (
          <p className={styles.notice}>{expiredCount} item{expiredCount > 1 ? "s are" : " is"} past the date and won't be suggested. If in doubt, throw it out.</p>
        )}
        {loading ? <p className={styles.empty}>Loading…</p> : items.length === 0 ? (
          <p className={styles.empty}>Nothing here yet. Add what you have above.</p>
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
      </div>
    </details>
  );
}
