import { meals, type Meal } from "@/data/meals";

export type PantryItem = { id: string; name: string; expires_on: string | null };
export type Freshness = "expired" | "today" | "soon" | "fresh" | "none";
export type Match = { ingredient: string; item: PantryItem; kind: Freshness };
export type Ranked = { meal: Meal; matched: Match[]; missing: string[]; urgent: number; score: number };

// Same simplifications the meal finder uses, so "chicken" matches "chicken breast".
const ALIASES: Record<string, string> = {
  "chicken breast": "chicken", "chicken thigh": "chicken", "ground chicken": "chicken",
  "white rice": "rice", "brown rice": "rice", "corn tortilla": "tortilla",
  "cheddar cheese": "cheese", "parmesan cheese": "cheese", "mozzarella cheese": "cheese",
  "feta cheese": "cheese", "whole wheat bread": "bread", "ground beef": "beef",
  "beef steak": "beef", "ground turkey": "turkey", "turkey breast": "turkey",
  "greek yogurt": "yogurt", "bell pepper": "pepper", "olive oil": "oil", "egg white": "egg",
};

// Light singularising so "eggs" = "egg" and "tomatoes" = "tomato".
export function norm(s: string): string {
  const t = s.toLowerCase().trim().replace(/\s+/g, " ");
  if (t.endsWith("ies")) return t.slice(0, -3) + "y";
  if (t.endsWith("oes")) return t.slice(0, -2);
  if (t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  return t;
}

export const INGREDIENT_NAMES: string[] = Array.from(
  new Set(meals.flatMap((m) => m.ingredients.map((i) => i.name.toLowerCase())))
).sort();

export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / 86_400_000);
}

export function freshness(date: string | null): Freshness {
  const d = daysUntil(date);
  if (d === null) return "none";
  if (d < 0) return "expired";
  if (d === 0) return "today";
  return d <= 3 ? "soon" : "fresh";
}

export function freshnessLabel(date: string | null): string {
  const d = daysUntil(date);
  if (d === null) return "No date";
  if (d < 0) return d === -1 ? "Expired yesterday" : `Expired ${-d} days ago`;
  if (d === 0) return "Use today";
  if (d === 1) return "Use by tomorrow";
  return d <= 3 ? `Use within ${d} days` : `${d} days left`;
}

// Soonest-expiring first, items without a date last.
export function sortByExpiry<T extends { expires_on: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.expires_on ?? "9999-12-31").localeCompare(b.expires_on ?? "9999-12-31"));
}

export function rankMeals(items: PantryItem[]): { useItUp: Ranked[]; bestFit: Ranked[] } {
  // Expired food is never suggested.
  const usable = sortByExpiry(items).filter((i) => freshness(i.expires_on) !== "expired");

  const ranked: Ranked[] = meals.map((meal) => {
    const matched: Match[] = [];
    const missing: string[] = [];
    for (const ing of meal.ingredients) {
      const full = norm(ing.name);
      const simple = norm(ALIASES[ing.name.toLowerCase()] ?? ing.name);
      const item = usable.find((u) => [full, simple].includes(norm(u.name)));
      if (item) matched.push({ ingredient: ing.name, item, kind: freshness(item.expires_on) });
      else missing.push(ing.name);
    }
    const urgent = matched.filter((m) => m.kind === "today" || m.kind === "soon").length;
    const coverage = matched.length / meal.ingredients.length;
    return { meal, matched, missing, urgent, score: urgent * 10 + matched.length * 4 + coverage * 6 - missing.length };
  }).filter((r) => r.matched.length > 0);

  const byScore = (a: Ranked, b: Ranked) => b.score - a.score;
  return {
    useItUp: ranked.filter((r) => r.urgent > 0).sort(byScore).slice(0, 5),
    bestFit: ranked.filter((r) => r.urgent === 0).sort(byScore).slice(0, 5),
  };
}

// Which pantry items does a list of recipe ingredients use? One item per ingredient,
// never an expired one.
export function pantryIdsForIngredients(items: PantryItem[], names: string[]): string[] {
  const usable = sortByExpiry(items).filter((i) => freshness(i.expires_on) !== "expired");
  const ids = new Set<string>();
  for (const name of names) {
    const full = norm(name);
    const simple = norm(ALIASES[name.toLowerCase()] ?? name);
    const item = usable.find((u) => !ids.has(u.id) && [full, simple].includes(norm(u.name)));
    if (item) ids.add(item.id);
  }
  return Array.from(ids);
}
