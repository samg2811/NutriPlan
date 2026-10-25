import { isMealAllowed } from "@/lib/restrictions";
import type { Meal } from "@/data/meals";

/* -------------------------------------------------------------------------- */
/*  Types used by components/WeeklyMealPlan.tsx                                */
/* -------------------------------------------------------------------------- */

export type Slot = "breakfast" | "lunch" | "dinner";

/** One entry per day (7 total). Each slot holds a meal id, or null if empty. */
export type Plan = Array<Record<Slot, number | null>>;

export interface PlanContext {
  ids: string[]; // dietary restriction ids
  avoid: string[]; // foods to avoid
  likes: readonly string[]; // ingredients the person likes (from the quiz)
  maxTime: number; // max cooking minutes, 0 = no limit
  budget: number; // max cost per meal in dollars, 0 = no limit
  variety: number | string; // how much to avoid repeats (see varietyWeight)
}

const SLOTS: Slot[] = ["breakfast", "lunch", "dinner"];

/* -------------------------------------------------------------------------- */
/*  Existing function (unchanged)                                              */
/* -------------------------------------------------------------------------- */

/**
 * Returns common ingredients from meals that match
 * the user's dietary restrictions and foods to avoid.
 */
export function topIngredients(
  meals: Meal[],
  restrictionIds: string[],
  avoid: string[] = [],
  limit = 18
): string[] {
  if (!Number.isFinite(limit) || limit <= 0) return [];

  const counts = new Map<string, number>();

  for (const meal of meals) {
    if (!isMealAllowed(meal, restrictionIds, avoid)) continue;

    const ingredients = new Set(
      meal.ingredients
        .map((ingredient) => ingredient.name.trim().toLowerCase())
        .filter(Boolean)
    );

    for (const ingredient of ingredients) {
      counts.set(ingredient, (counts.get(ingredient) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort(([nameA, countA], [nameB, countB]) => {
      if (countA !== countB) return countB - countA;
      return nameA.localeCompare(nameB);
    })
    .slice(0, Math.floor(limit))
    .map(([name]) => name);
}

/* -------------------------------------------------------------------------- */
/*  Meal plan generator                                                        */
/* -------------------------------------------------------------------------- */

/** Recipes that fit the person's dietary restrictions (hard rule). */
export function eligibleMeals(meals: Meal[], ctx: PlanContext): Meal[] {
  return meals.filter((m) => isMealAllowed(m, ctx.ids, ctx.avoid));
}

/** Time and budget are soft limits: used when possible, dropped if nothing fits. */
function withinLimits(meal: Meal, ctx: PlanContext): boolean {
  if (ctx.maxTime > 0 && meal.cookingTime > ctx.maxTime) return false;
  if (ctx.budget > 0 && meal.cost > ctx.budget) return false;
  return true;
}

/** How strongly repeats are penalized. Accepts a number or low/medium/high. */
function varietyWeight(v: number | string): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.min(Math.max(v, 0), 10);
  const s = String(v).toLowerCase();
  if (s.includes("low")) return 1;
  if (s.includes("high")) return 6;
  return 3; // medium / unknown
}

/** Number of liked ingredients found in this meal. */
function likeScore(meal: Meal, likes: readonly string[]): number {
  if (likes.length === 0) return 0;
  const names = meal.ingredients.map((i) => i.name.toLowerCase());
  const wanted = likes.map((l) => l.trim().toLowerCase()).filter(Boolean);
  let hits = 0;
  for (const w of wanted) {
    if (names.some((n) => n.includes(w) || w.includes(n))) hits++;
  }
  return hits;
}

function countUses(plan: Plan): Map<number, number> {
  const uses = new Map<number, number>();
  for (const day of plan) {
    for (const s of SLOTS) {
      const id = day[s];
      if (id !== null && id !== undefined) uses.set(id, (uses.get(id) ?? 0) + 1);
    }
  }
  return uses;
}

/** Pick the best-scoring meal id from the pool, or null if the pool is empty. */
function pickBest(
  meals: Meal[],
  ctx: PlanContext,
  uses: Map<number, number>,
  sameDayIds: Set<number>
): number | null {
  if (meals.length === 0) return null;

  const fit = meals.filter((m) => withinLimits(m, ctx));
  const pool = fit.length > 0 ? fit : meals;
  const weight = varietyWeight(ctx.variety);

  let best: Meal | null = null;
  let bestScore = -Infinity;
  for (const m of pool) {
    const score =
      likeScore(m, ctx.likes) * 2 +
      Math.random() - // small random nudge so each generation differs
      (uses.get(m.id) ?? 0) * weight -
      (sameDayIds.has(m.id) ? 100 : 0); // never twice in one day if avoidable
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best ? best.id : null;
}

/** Build a 7-day plan for breakfast, lunch and dinner. */
export function generatePlan(meals: Meal[], ctx: PlanContext, days = 7): Plan {
  const pool = eligibleMeals(meals, ctx);
  const plan: Plan = [];
  const uses = new Map<number, number>();

  for (let d = 0; d < days; d++) {
    const day: Record<Slot, number | null> = {
      breakfast: null,
      lunch: null,
      dinner: null,
    };
    const sameDay = new Set<number>();
    for (const slot of SLOTS) {
      const id = pickBest(pool, ctx, uses, sameDay);
      day[slot] = id;
      if (id !== null) {
        uses.set(id, (uses.get(id) ?? 0) + 1);
        sameDay.add(id);
      }
    }
    plan.push(day);
  }
  return plan;
}

/**
 * Suggest a different recipe id for one slot, or null if nothing else fits.
 * The current meal in that slot is excluded so the swap always changes something.
 */
export function swapMeal(
  meals: Meal[],
  plan: Plan,
  dayIndex: number,
  slot: Slot,
  ctx: PlanContext
): number | null {
  const current = plan[dayIndex]?.[slot] ?? null;
  const pool = eligibleMeals(meals, ctx).filter((m) => m.id !== current);

  const uses = countUses(plan);
  const sameDay = new Set<number>();
  const day = plan[dayIndex];
  if (day) {
    for (const s of SLOTS) {
      const id = day[s];
      if (s !== slot && id !== null && id !== undefined) sameDay.add(id);
    }
  }
  return pickBest(pool, ctx, uses, sameDay);
}

/* -------------------------------------------------------------------------- */
/*  Shopping list                                                              */
/* -------------------------------------------------------------------------- */

/** Reads the ingredient weight in grams. Adjust here if your field is named differently. */
function gramsOf(ingredient: Meal["ingredients"][number]): number {
  const rec = ingredient as unknown as Record<string, unknown>;
  for (const key of ["grams", "amount", "quantity"]) {
    const v = rec[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return 0;
}

/** Combine ingredients from all given meals, summing grams by ingredient name. */
export function buildShoppingList(
  meals: Meal[]
): Array<{ name: string; grams: number }> {
  const totals = new Map<string, { name: string; grams: number }>();

  for (const meal of meals) {
    for (const ingredient of meal.ingredients) {
      const name = ingredient.name.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const entry = totals.get(key);
      const g = gramsOf(ingredient);
      if (entry) entry.grams += g;
      else totals.set(key, { name, grams: g });
    }
  }

  return Array.from(totals.values())
    .map((e) => ({ name: e.name, grams: Math.round(e.grams) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
