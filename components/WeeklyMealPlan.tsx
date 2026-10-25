"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { meals, type Meal } from "@/data/meals";
import { createClient } from "@/lib/supabase/client";
import { announceFoodLogChanged, announceMealLogged, fetchMealNutrition } from "@/lib/cook";
import styles from "./WeeklyMealPlan.module.css";

type Slot = "Breakfast" | "Lunch" | "Snack" | "Dinner";
type Planned = { mealId: number; logged: boolean };
type Plan = Record<string, Partial<Record<Slot, Planned>>>;
const SLOTS: Slot[] = ["Breakfast", "Lunch", "Snack", "Dinner"];
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

  useEffect(() => {
    setWeek(monday(new Date()));
    try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) setPlan(JSON.parse(saved)); } catch {}
    setLoaded(true);
    supabase.auth.getUser().then(({data}) => setLoggedIn(!!data.user));
  }, [supabase]);

  useEffect(() => { if (loaded) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); } catch {} } }, [plan, loaded]);

  const days = useMemo(() => week ? Array.from({length:7},(_,i)=>{const d=new Date(week);d.setDate(d.getDate()+i);return d;}) : [],[week]);
  const today = keyFor(new Date());
  const plannedCount = Object.values(plan).reduce((n,d)=>n+Object.keys(d).length,0);
  const loggedCount = Object.values(plan).reduce((n,d)=>n+Object.values(d).filter(x=>x?.logged).length,0);
  const label = week ? `${week.toLocaleDateString(undefined,{month:"short",day:"numeric"})} – ${new Date(week.getFullYear(),week.getMonth(),week.getDate()+6).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}` : "Loading…";

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
    <div className={styles.summary}><div><strong>{plannedCount}</strong><span>planned slots</span></div><div><strong>{loggedCount}</strong><span>logged as eaten</span></div></div>
    {notice && <p className={styles.success} role="status">{notice}</p>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    {loggedIn===false && <p className={styles.hint}>You can plan without logging in. Log in when you want to add an eaten meal to your tracker.</p>}
    <div className={styles.grid}>{days.map(date=>{
      const day=keyFor(date), dayPlan=plan[day]||{}, future=day>today;
      return <article className={`${styles.card} ${day===today?styles.today:""}`} key={day}>
        <header><span>{date.toLocaleDateString(undefined,{weekday:"short"})}</span><strong>{date.toLocaleDateString(undefined,{month:"short",day:"numeric"})}</strong>{day===today&&<small>Today</small>}</header>
        <div className={styles.slots}>{SLOTS.map(slot=>{
          const planned=dayPlan[slot], meal=planned?meals.find(m=>m.id===planned.mealId):undefined, id=`${day}-${slot}`;
          return <div className={styles.slot} key={slot}><label htmlFor={id}>{slot}</label>
            <select id={id} value={planned?String(planned.mealId):""} onChange={e=>selectMeal(day,slot,e.target.value)}>
              <option value="">Choose a recipe…</option>{meals.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {meal&&<div className={styles.details}><span>{meal.cookingTime} min · ${meal.cost.toFixed(2)}</span>
              <button disabled={!!planned?.logged||future||!!busy} onClick={()=>void logMeal(day,slot,meal)}>
                {planned?.logged?"✓ Logged":busy===id?"Logging…":future?"Log on that day":"＋ Log Meal"}
              </button></div>}
          </div>;
        })}</div>
      </article>;
    })}</div>
    <p className={styles.footer}>Nutrition is estimated from recipe ingredients. Future meals can be planned but not logged as eaten until that date.</p>
  </section>;
}
