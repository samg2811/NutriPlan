"use client";

import { useEffect, useMemo, useState } from "react";
import { meals } from "@/data/meals";
import { RESTRICTIONS } from "@/lib/restrictions";
import { topIngredients } from "@/lib/mealPlan";
import { useRestrictions } from "./useRestrictions";
import { useProfile, type Profile } from "./useProfile";
import styles from "./PersonalizeQuiz.module.css";

const OPEN_EVENT = "nutragoal:open-quiz";
const TOTAL_STEPS = 6;

export function openQuiz() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

const TIME_OPTIONS = [
  { label: "15 minutes or less", value: 15 },
  { label: "About 30 minutes", value: 30 },
  { label: "Up to 45 minutes", value: 45 },
  { label: "No limit", value: 0 },
];
const BUDGET_OPTIONS = [
  { label: "Under $5", value: 5 },
  { label: "Under $10", value: 10 },
  { label: "Under $15", value: 15 },
  { label: "No limit", value: 0 },
];
const VARIETY_OPTIONS: { label: string; value: Profile["variety"] }[] = [
  { label: "Mix it up: avoid repeating meals", value: "never" },
  { label: "Repeats are fine (meal prep or leftovers)", value: "ok" },
];

// Several pages can include the quiz. Only one copy shows the pop-up.
let owner: symbol | null = null;
function useIsOwner() {
  const [isOwner, setIsOwner] = useState(false);
  useEffect(() => {
    const me = Symbol("quiz");
    if (owner === null) {
      owner = me;
      setIsOwner(true);
    }
    return () => {
      if (owner === me) owner = null;
    };
  }, []);
  return isOwner;
}

// ---------- the invitation card shown near the top of a page ----------
export function QuizBanner() {
  const { profile, update, ready } = useProfile();
  if (!ready || profile.done || profile.dismissed) return null;

  return (
    <section className={styles.banner} aria-label="Personalize NutraGoal">
      <div>
        <strong>✨ Make NutraGoal yours</strong>
        <p>Answer 6 quick questions and we&rsquo;ll tailor your meals and weekly plan.</p>
      </div>
      <div className={styles.bannerBtns}>
        <button className="primary-button" onClick={openQuiz}>
          Take the quiz
        </button>
        <button
          type="button"
          className={styles.later}
          onClick={() => update({ ...profile, dismissed: true })}
        >
          Not now
        </button>
      </div>
    </section>
  );
}

// ---------- the quiz pop-up ----------
export function QuizModal() {
  const isOwner = useIsOwner();
  const { prefs, update: updatePrefs } = useRestrictions();
  const { profile, update: updateProfile } = useProfile();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [ids, setIds] = useState<string[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [maxTime, setMaxTime] = useState(0);
  const [budget, setBudget] = useState(0);
  const [variety, setVariety] = useState<Profile["variety"]>("never");
  const [draft, setDraft] = useState("");

  // Start the quiz with the person's current answers
  useEffect(() => {
    if (!isOwner) return;
    function onOpen() {
      setIds(prefs.ids);
      setAvoid(prefs.avoid);
      setLikes(profile.likes);
      setMaxTime(profile.maxTime);
      setBudget(profile.budget);
      setVariety(profile.variety);
      setStep(0);
      setDraft("");
      setOpen(true);
    }
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [isOwner, prefs, profile]);

  // Escape closes the quiz; the page behind doesn't scroll while it's open
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Foods to pick from, hiding anything the person's restrictions rule out
  const loveOptions = useMemo(() => topIngredients(meals, ids, avoid, 18), [ids, avoid]);

  if (!isOwner || !open) return null;

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  function addAvoid() {
    const term = draft.trim().toLowerCase().slice(0, 40);
    setDraft("");
    if (term.length < 2 || avoid.includes(term) || avoid.length >= 20) return;
    setAvoid([...avoid, term]);
  }

  function finish() {
    updatePrefs({ ids, avoid });
    updateProfile({
      done: true,
      dismissed: true,
      likes: likes.filter((l) => loveOptions.includes(l)),
      maxTime,
      budget,
      variety,
    });
    setOpen(false);
    window.setTimeout(() => {
      document.getElementById("weekly-plan")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }

  function skip() {
    updateProfile({ ...profile, dismissed: true });
    setOpen(false);
  }

  const last = step === TOTAL_STEPS - 1;

  return (
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.top}>
          <span className={styles.step}>
            Question {step + 1} of {TOTAL_STEPS}
          </span>
          <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close quiz">
            ✕
          </button>
        </div>
        <div className={styles.progress} aria-hidden>
          <div className={styles.progressFill} style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
        </div>

        {step === 0 && (
          <>
            <h2 id="quiz-title" className={styles.title}>Do you follow a special diet or have allergies?</h2>
            <p className={styles.help}>Pick all that apply. Recipes with these will never show up.</p>
            <div className={styles.chips} role="group" aria-label="Dietary restrictions">
              {RESTRICTIONS.map((r) => {
                const on = ids.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={on ? styles.chipOn : styles.chip}
                    aria-pressed={on}
                    onClick={() => toggle(ids, setIds, r.id)}
                  >
                    {on ? "✓ " : ""}
                    {r.label}
                  </button>
                );
              })}
            </div>
            <p className={styles.note}>None apply? Just tap Next.</p>
          </>
        )}

        {step === 1 && (
          <>
            <h2 id="quiz-title" className={styles.title}>Anything else you can&rsquo;t or won&rsquo;t eat?</h2>
            <p className={styles.help}>Allergies or foods you just don&rsquo;t like, such as mushrooms or cilantro.</p>
            <div className={styles.row}>
              <input
                className={styles.input}
                type="text"
                value={draft}
                maxLength={40}
                placeholder="Type a food and press Add"
                aria-label="Food to avoid"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAvoid();
                  }
                }}
              />
              <button type="button" className={styles.add} onClick={addAvoid}>Add</button>
            </div>
            {avoid.length > 0 && (
              <ul className={styles.tags}>
                {avoid.map((t) => (
                  <li key={t} className={styles.tag}>
                    {t}
                    <button type="button" className={styles.tagX} aria-label={`Stop avoiding ${t}`} onClick={() => setAvoid(avoid.filter((x) => x !== t))}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className={styles.note}>
              This checks ingredient names and isn&rsquo;t a guarantee. With an allergy, always read the food label too.
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <h2 id="quiz-title" className={styles.title}>Which foods do you enjoy most?</h2>
            <p className={styles.help}>Pick as many as you like. We&rsquo;ll put them in your plan more often.</p>
            {loveOptions.length === 0 ? (
              <p className={styles.note}>No suggestions with your current restrictions. You can skip this one.</p>
            ) : (
              <div className={styles.chips} role="group" aria-label="Foods you enjoy">
                {loveOptions.map((name) => {
                  const on = likes.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      className={on ? styles.chipOn : styles.chip}
                      aria-pressed={on}
                      onClick={() => toggle(likes, setLikes, name)}
                    >
                      {on ? "✓ " : ""}
                      {name}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h2 id="quiz-title" className={styles.title}>How much time do you usually have to cook a meal?</h2>
            <div className={styles.options} role="group" aria-label="Cooking time">
              {TIME_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={maxTime === o.value ? styles.optionOn : styles.option}
                  aria-pressed={maxTime === o.value}
                  onClick={() => setMaxTime(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 id="quiz-title" className={styles.title}>What&rsquo;s your budget per meal?</h2>
            <div className={styles.options} role="group" aria-label="Budget per meal">
              {BUDGET_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={budget === o.value ? styles.optionOn : styles.option}
                  aria-pressed={budget === o.value}
                  onClick={() => setBudget(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 id="quiz-title" className={styles.title}>How do you feel about repeating meals?</h2>
            <div className={styles.options} role="group" aria-label="Variety">
              {VARIETY_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={variety === o.value ? styles.optionOn : styles.option}
                  aria-pressed={variety === o.value}
                  onClick={() => setVariety(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </>
        )}

        <div className={styles.nav}>
          {step > 0 ? (
            <button type="button" className={styles.back} onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          ) : (
            <button type="button" className={styles.skip} onClick={skip}>
              Skip for now
            </button>
          )}
          {last ? (
            <button type="button" className="primary-button" onClick={finish}>
              Finish
            </button>
          ) : (
            <button type="button" className="primary-button" onClick={() => setStep(step + 1)}>
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Convenience for the home page: the card plus the pop-up
export default function PersonalizeQuiz() {
  return (
    <>
      <QuizBanner />
      <QuizModal />
    </>
  );
}
