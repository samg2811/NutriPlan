"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { meals, type Meal } from "@/data/meals";
import { createClient } from "@/lib/supabase/client";
import { announceFoodLogChanged, announceMealLogged, fetchMealNutrition } from "@/lib/cook";
import { findViolations, describePrefs } from "@/lib/restrictions";
import {
  buildShoppingList,
  eligibleMeals,
  generatePlan,
  swapMeal,
  type Plan as LibPlan,
  type PlanContext,
  type Slot as LibSlot,
} from "@/lib/mealPlan";
import { useRestrictions } from "./useRestrictions";
import { useProfile } from "./useProfile";
import { QuizModal, openQuiz } from "./PersonalizeQuiz";
import styles from "./WeeklyMealPlan.module.css";
import tools from "./WeeklyPlanTools.module.css";

type Slot = "Breakfast" | "Lunch" | "Snack" | "Dinner";
type Planned = { mealId: number; logged: boolean };
type Plan = Record<string, Partial<Record<Slot, Planned>>>;
const SLOTS: Slot[] = ["Breakfast", "Lunch", "Snack", "Dinner"];
// The generator fills these three. Snack stays a manual choice.
const GEN_SLOTS = ["Breakfast", "Lunch", "Dinner"] as const;
const toLib = (s: Slot) => s.toLowerCase() as LibSlot;
const STORAGE_KEY = "nutriplan_weekly_plan_v1";
const keyFor = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const monday = (d: Date) => { const x = new Date(d.getFullYear(),d.getMonth(),d.getDate()); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x; };
const noon = (key: string) => { const [y,m,d]=key.split("-").map(Number); return new Date(y,m-1,d,12).toISOString(); };

export default function WeeklyMealPlan() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [week, setWeek] = useState<Date | null>(null);
  const [plan, setPlan] = useState<Plan>({});
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  // NEW: dietary restrictions and quiz answers
  const { prefs } = useRestrictions();
  const { profile } = useProfile();

  useEffect(() => {
    setWeek(monday(new Date()));
    try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) setPlan(JSON.parse(saved)); } catch {}
    setLoaded(true);
    (async () => {
      const { data } = await supabase.auth.getUser();
      setLoggedIn(!!data.user);
    })();
  }, [supabase]);

  useEffect(() => { if (loaded) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); } catch {} } }, [plan, loaded]);

  const days = useMemo(() => week ? Array.from({length:7},(_,i)=>{const d=new Date(week);d.setDate(d.getDate()+i);return d;}) : [],[week]);
  const today = keyFor(new Date());
  const plannedCount = Object.values(plan).reduce((n,d)=>n+Object.keys(d).length,0);
  const loggedCount = Object.values(plan).reduce((n,d)=>n+Object.values(d).filter(x=>x?.logged).length,0);
  const label = week ? `${week.toLocaleDateString(undefined,{month:"short",day:"numeric"})} – ${new Date(week.getFullYear(),week.getMonth(),week.getDate()+6).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}` : "Loading…";

  // ---------- NEW: restrictions, generator, swap, shopping list ----------

  // Settings the generator uses (restrictions + quiz answers)
  const ctx: PlanContext = useMemo(() => ({
    ids: prefs.ids,
    avoid: prefs.avoid,
    likes: profile.likes,
    maxTime: profile.maxTime,
    budget: profile.budget,
    variety: profile.variety,
  }), [prefs, profile]);

  // Recipes that fit the person's restrictions
  const allowed = useMemo(
    () => new Set<number>(meals.filter(m => findViolations(m, prefs.ids, prefs.avoid).length === 0).map(m => m.id)),
    [prefs]
  );

  // Planned meals this week that no longer fit (restrictions may have changed)
  const conflicts = useMemo(() => {
    let n = 0;
    for (const d of days) {
      const dayPlan = plan[keyFor(d)] || {};
      for (const s of SLOTS) {
        const p = dayPlan[s];
        if (p && !p.logged && !allowed.has(p.mealId)) n++;
      }
    }
    return n;
  }, [days, plan, allowed]);

  // Meals still to be eaten this week (used for cost and the shopping list)
  const weekMeals = useMemo(() => {
    const out: Meal[] = [];
    for (const d of days) {
      const dayPlan = plan[keyFor(d)] || {};
      for (const s of SLOTS) {
        const p = dayPlan[s];
        if (!p || p.logged) continue;
        const m = meals.find(x => x.id === p.mealId);
        if (m) out.push(m);
      }
    }
    return out;
  }, [days, plan]);
  const uniqueCount = new Set(weekMeals.map(m => m.id)).size;
  const estCost = weekMeals.reduce((n, m) => n + m.cost, 0);
  const shopping = useMemo(() => buildShoppingList(weekMeals), [weekMeals]);

  const usingParts = [
    ...describePrefs(prefs.ids, prefs.avoid),
    profile.maxTime > 0 ? `${profile.maxTime} min or less` : "",
    profile.budget > 0 ? `under $${profile.budget} per meal` : "",
  ].filter(Boolean);

  function generateWeek() {
    if (!week) return;
    setNotice(""); setError("");

    if (eligibleMeals(meals, ctx).length === 0) {
      setError("None of our recipes fit your dietary restrictions. Try removing one.");
      return;
    }

    const hasUnlogged = days.some(d => GEN_SLOTS.some(s => { const p = plan[keyFor(d)]?.[s]; return p && !p.logged; }));
    if (hasUnlogged && !window.confirm("Replace the meals you planned this week? Meals you already logged are kept.")) return;

    const generated = generatePlan(meals, ctx);
    setPlan(old => {
      const next: Plan = { ...old };
      days.forEach((date, i) => {
        const key = keyFor(date);
        const day = { ...(next[key] || {}) };
        for (const slot of GEN_SLOTS) {
          if (day[slot]?.logged) continue; // keep meals already logged as eaten
          const id = generated[i][toLib(slot)];
          if (id === null) delete day[slot];
          else day[slot] = { mealId: Number(id), logged: false };
        }
        if (Object.keys(day).length) next[key] = day; else delete next[key];
      });
      return next;
    });
    setNotice("Your week is ready! Swap any meal you don't like.");
  }

  function swapSlot(dayKey: string, dayIndex: number, slot: Slot) {
    setNotice(""); setError("");
    // The current week, in the shape the generator understands
    const libPlan: LibPlan = days.map(d => {
      const dayPlan = plan[keyFor(d)] || {};
      return {
        breakfast: dayPlan.Breakfast?.mealId ?? null,
        lunch: dayPlan.Lunch?.mealId ?? null,
        dinner: dayPlan.Dinner?.mealId ?? null,
      };
    });
    const id = swapMeal(meals, libPlan, dayIndex, toLib(slot), ctx);
    if (id === null) { setError("No recipe fits your restrictions for this slot."); return; }
    selectMeal(dayKey, slot, String(id));
  }

  async function copyShoppingList() {
    const text = shopping.map(i => `${i.name} - ${i.grams} g`).join("\n");
    try { await navigator.clipboard.writeText(text); setNotice("Shopping list copied."); }
    catch { setError("Couldn't copy the list. Select it and copy it manually."); }
  }

  // ---------- your original functions (unchanged) ----------

  function moveWeek(amount:number) { if (!week) return; const d=new Date(week); d.setDate(d.getDate()+7*amount); setWeek(d); setNotice(""); setError(""); }
  function selectMeal(day:string,slot:Slot,value:string) {
    setPlan(old => {
      const next:Plan={...old,[day]:{...(old[day]||{})}};
      if (!value) { delete next[day][slot]; if (!Object.keys(next[day]).length) delete next[day]; }
      else { const id=Number(value); next[day][slot]={mealId:id,logged:old[day]?.[slot]?.mealId===id ? old[day]?.[slot]?.logged ?? false : false}; }
      return next;
    });
  }
  async function logMeal(day:string,slot:Slot,meal:Meal) {
    const rowKey=`${day}-${slot}`; if (busy) return;
    setBusy(rowKey); setNotice(""); setError("");
    try {
      const {data:auth,error:authError}=await supabase.auth.getUser();
      if(authError||!auth.user){setLoggedIn(false);router.push("/login");throw new Error("Please log in to save a meal to your Food Tracker.");}
      const n=await fetchMealNutrition(meal);
      if(!n.items.length) throw new Error("Nutrition details weren't available, so this meal wasn't logged.");
      const {error:insertError}=await supabase.from("food_logs").insert({
        meal_text:`Weekly plan (${slot}): ${meal.name}`, items:n.items,
        calories:Math.round(n.totals.calories), protein:Math.round(n.totals.protein*10)/10,
        carbs:Math.round(n.totals.carbs*10)/10, fat:Math.round(n.totals.fat*10)/10,
        created_at:noon(day)
      });
      if(insertError) throw new Error("Couldn't save this meal. Please try again.");
      setPlan(old=>({...old,[day]:{...old[day],[slot]:{mealId:meal.id,logged:true}}}));
      announceFoodLogChanged(); announceMealLogged(meal.ingredients.map(i=>i.name));
      setNotice(`Logged ${meal.name} to your Food Tracker.`);
    } catch(e) { setError(e instanceof Error?e.message:"Couldn't log this meal."); }
    finally { setBusy(""); }
  }

  return <section className={styles.section} id="weekly-plan">
    <div className={styles.heading}>
      <div><p className={styles.eyebrow}>PLAN AHEAD</p><h2>Weekly Meal Plan</h2>
      <p className={styles.subtitle}>Plan meals for the week. A planned meal only enters your Food Tracker after you click Log Meal.</p></div>
      <div className={styles.controls}><button onClick={()=>moveWeek(-1)} aria-label="Previous week">←</button><strong>{label}</strong><button onClick={()=>moveWeek(1)} aria-label="Next week">→</button></div>
    </div>

    {/* NEW: generator toolbar */}
    <div className={tools.toolbar}>
      <button className={tools.generate} onClick={generateWeek}>✨ Generate my week</button>
      <button className={tools.link} onClick={openQuiz}>{profile.done ? "Retake the quiz" : "Personalize with a quick quiz"}</button>
    </div>
    <p className={tools.using}>
      {usingParts.length > 0 ? `Using: ${usingParts.join(" · ")}` : "No dietary restrictions set. Add some in the quiz or in the Meal Planner."}
    </p>
    {conflicts > 0 && (
      <p className={tools.conflict} role="alert">
        ⚠ {conflicts} planned meal{conflicts !== 1 ? "s don't" : " doesn't"} fit your dietary restrictions.
        <button className={tools.conflictBtn} onClick={generateWeek}>Regenerate week</button>
      </p>
    )}
    {weekMeals.length > 0 && (
      <p className={tools.stats}>{weekMeals.length} meals to go · {uniqueCount} different · about ${estCost.toFixed(2)}</p>
    )}

    <div className={styles.summary}><div><strong>{plannedCount}</strong><span>planned slots</span></div><div><strong>{loggedCount}</strong><span>logged as eaten</span></div></div>
    {notice && <p className={styles.success} role="status">{notice}</p>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    {loggedIn===false && <p className={styles.hint}>You can plan without logging in. Log in when you want to add an eaten meal to your tracker.</p>}
    <div className={styles.grid}>{days.map((date, dayIndex)=>{
      const day=keyFor(date), dayPlan=plan[day]||{}, future=day>today;
      return <article className={`${styles.card} ${day===today?styles.today:""}`} key={day}>
        <header><span>{date.toLocaleDateString(undefined,{weekday:"short"})}</span><strong>{date.toLocaleDateString(undefined,{month:"short",day:"numeric"})}</strong>{day===today&&<small>Today</small>}</header>
        <div className={styles.slots}>{SLOTS.map(slot=>{
          const planned=dayPlan[slot], meal=planned?meals.find(m=>m.id===planned.mealId):undefined, id=`${day}-${slot}`;
          const canGenerate = (GEN_SLOTS as readonly Slot[]).includes(slot);
          return <div className={styles.slot} key={slot}><label htmlFor={id}>{slot}</label>
            <select id={id} value={planned?String(planned.mealId):""} onChange={e=>selectMeal(day,slot,e.target.value)}>
              <option value="">Choose a recipe…</option>
              {meals.map(m => {
                const fits = allowed.has(m.id);
                return <option key={m.id} value={m.id} disabled={!fits && planned?.mealId !== m.id}>
                  {m.name}{fits ? "" : " (doesn't fit your restrictions)"}
                </option>;
              })}
            </select>
            {meal&&<div className={styles.details}><span>{meal.cookingTime} min · ${meal.cost.toFixed(2)}</span>
              <button disabled={!!planned?.logged||future||!!busy} onClick={()=>void logMeal(day,slot,meal)}>
                {planned?.logged?"✓ Logged":busy===id?"Logging…":future?"Log on that day":"＋ Log Meal"}
              </button></div>}
            {/* NEW: swap / suggest button and restriction warning */}
            {(canGenerate || (meal && !allowed.has(meal.id))) && (
              <div className={tools.slotActions}>
                {canGenerate && (
                  <button className={tools.swap} disabled={!!planned?.logged} onClick={()=>swapSlot(day, dayIndex, slot)}
                    aria-label={`${planned ? "Swap" : "Suggest"} ${slot.toLowerCase()} for ${date.toLocaleDateString(undefined,{weekday:"long"})}`}>
                    {planned ? "🔄 Swap" : "✨ Suggest"}
                  </button>
                )}
                {meal && !allowed.has(meal.id) && !planned?.logged && <span className={tools.warn}>⚠ Doesn&rsquo;t fit your restrictions</span>}
              </div>
            )}
          </div>;
        })}</div>
      </article>;
    })}</div>

    {/* NEW: shopping list for the meals still to be eaten */}
    {shopping.length > 0 && (
      <details className={tools.shop}>
        <summary>🛒 Shopping list ({shopping.length} items)</summary>
        <ul className={tools.shopList}>
          {shopping.map(i => <li key={i.name}><span>{i.name}</span><span>{i.grams} g</span></li>)}
        </ul>
        <button className={tools.copy} onClick={() => void copyShoppingList()}>Copy list</button>
      </details>
    )}

    <p className={styles.footer}>Nutrition is estimated from recipe ingredients. Future meals can be planned but not logged as eaten until that date.</p>

    {/* NEW: the quiz pop-up (only one copy shows, even if the page has several) */}
    <QuizModal />
  </section>;
}
