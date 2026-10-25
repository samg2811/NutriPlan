"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./PhoneDemo.module.css";

// Order here must match the order of the <section>s below
const SCREENS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "plan", label: "Plan", icon: "🥘" },
  { id: "week", label: "Week", icon: "🗓️" },
  { id: "pantry", label: "Pantry", icon: "🧺" },
  { id: "scan", label: "Scan", icon: "📸" },
  { id: "log", label: "Log", icon: "📝" },
];

function smooth(): ScrollBehavior {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "auto";
  }
  return "smooth";
}

export default function PhoneDemo({ onOpen }: { onOpen?: () => void }) {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [active, setActive] = useState("home");

  // Jump the real page: "#planner" scrolls on this page, "/food-log" navigates
  function open(target: string) {
    // Used on the login page: tapping a card sends the visitor to the login form
    if (onOpen) {
      onOpen();
      return;
    }
    if (target.startsWith("#")) {
      document.getElementById(target.slice(1))?.scrollIntoView({ behavior: smooth(), block: "start" });
    } else {
      router.push(target);
    }
  }

  // Tabs scroll the inside of the phone
  function showScreen(id: string) {
    const scroller = scrollerRef.current;
    const section = sectionRefs.current[id];
    if (!scroller || !section) return;
    scroller.scrollTo({ top: section.offsetTop - 8, behavior: smooth() });
  }

  // Highlight the tab for whichever screen is in view
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    function onScroll() {
      const el = scrollerRef.current!;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
        setActive(SCREENS[SCREENS.length - 1].id);
        return;
      }
      let current = SCREENS[0].id;
      for (const s of SCREENS) {
        const node = sectionRefs.current[s.id];
        if (node && node.offsetTop - 60 <= el.scrollTop) current = s.id;
      }
      setActive(current);
    }
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  function cardProps(target: string, label: string) {
    return {
      role: "button" as const,
      tabIndex: 0,
      "aria-label": label,
      onClick: () => open(target),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(target);
        }
      },
    };
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.phone}>
        <div className={styles.notch} />
        <div className={styles.screen}>
          <div className={styles.statusBar}>
            <span>9:41</span>
            <span className={styles.brand}>🍽️ NutriGoal</span>
            <span>●●●</span>
          </div>

          <div className={styles.scroller} ref={scrollerRef}>
            {/* HOME */}
            <section ref={(el) => { sectionRefs.current.home = el; }} className={styles.section}>
              <p className={styles.hello}>Good day 👋</p>
              <h3 className={styles.h}>Today so far</h3>
              <div className={styles.card}>
                <div className={styles.ringRow}>
                  <div className={styles.ring}><span>1,240<small>/ 2,000 cal</small></span></div>
                  <div className={styles.bars}>
                    <div><label>Protein</label><i><b style={{ width: "62%" }} /></i></div>
                    <div><label>Carbs</label><i><b style={{ width: "48%" }} /></i></div>
                    <div><label>Fat</label><i><b style={{ width: "70%" }} /></i></div>
                  </div>
                </div>
              </div>
              <div className={`${styles.card} ${styles.tap}`} {...cardProps("/food-log", "Open what to eat next")}>
                <p className={styles.small}>Suggested next</p>
                <strong>Chicken &amp; Rice Bowl</strong>
                <p className={styles.small}>520 cal · 38g protein · ⏱️ 25 min</p>
                <span className={styles.cta}>What should I eat next? →</span>
              </div>
            </section>

            {/* PLAN */}
            <section ref={(el) => { sectionRefs.current.plan = el; }} className={styles.section}>
              <h3 className={styles.h}>Find Your Meal</h3>
              <div className={`${styles.card} ${styles.tap}`} {...cardProps("#planner", "Open the meal planner")}>
                <p className={styles.small}>Ingredients you have</p>
                <div className={styles.fakeInput}>chicken, rice, broccoli</div>
                <div className={styles.twoCol}>
                  <div><p className={styles.small}>Budget</p><div className={styles.fakeInput}>$10</div></div>
                  <div><p className={styles.small}>Max time</p><div className={styles.fakeInput}>30 min</div></div>
                </div>
                <p className={styles.small}>Dietary restrictions</p>
                <div className={`${styles.chips} ${styles.chipsGap}`}>
                  <span>🌱 Vegetarian</span><span>🥜 Nut-free</span><span>＋ Add</span>
                </div>
                <div className={styles.result}>
                  <strong>Chicken &amp; Broccoli Rice</strong>
                  <span>✓ 3 ingredients match · ⏱️ 25 min · 💰 $6.40</span>
                </div>
                <span className={styles.cta}>Open Meal Planner →</span>
              </div>
            </section>

            {/* WEEKLY PLAN */}
            <section ref={(el) => { sectionRefs.current.week = el; }} className={styles.section}>
              <h3 className={styles.h}>Weekly Meal Plan</h3>
              <div className={`${styles.card} ${styles.tap}`} {...cardProps("/weekly-plan", "Open the weekly meal plan")}>
                <span className={styles.generate}>✨ Generate my week</span>
                <p className={`${styles.small} ${styles.using}`}>Using: vegetarian · 30 min or less</p>

                <div className={styles.day}>
                  <strong>Mon</strong>
                  <ul>
                    <li><em>B</em>Greek yogurt bowl</li>
                    <li><em>L</em>Veggie wrap</li>
                    <li><em>D</em>Lentil curry</li>
                  </ul>
                </div>
                <div className={styles.day}>
                  <strong>Tue</strong>
                  <ul>
                    <li><em>B</em>Oats &amp; berries</li>
                    <li><em>L</em>Quinoa salad</li>
                    <li><em>D</em>Veggie stir-fry</li>
                  </ul>
                </div>
                <p className={`${styles.small} ${styles.more}`}>+ 5 more days · swap any meal</p>

                <div className={styles.shopRow}>
                  <span>🛒 Shopping list</span>
                  <b>14 items</b>
                </div>
                <span className={styles.cta}>Open Weekly Plan →</span>
              </div>
            </section>

            {/* PANTRY */}
            <section ref={(el) => { sectionRefs.current.pantry = el; }} className={styles.section}>
              <h3 className={styles.h}>Your Pantry</h3>
              <div className={`${styles.card} ${styles.tap}`} {...cardProps("#planner", "Open your pantry")}>
                <p className={styles.small}>Staples you keep on hand</p>
                <div className={styles.pantryGrid}>
                  <span>🍚 Rice</span>
                  <span>🥚 Eggs</span>
                  <span>🧅 Onions</span>
                  <span>🫒 Olive oil</span>
                  <span>🍗 Chicken</span>
                  <span>🥦 Broccoli</span>
                </div>
                <div className={styles.result}>
                  <strong>6 items ready to cook with</strong>
                  <span>Tap to use them in the meal finder</span>
                </div>
                <span className={styles.cta}>Open Pantry →</span>
              </div>
            </section>

            {/* SCAN */}
            <section ref={(el) => { sectionRefs.current.scan = el; }} className={styles.section}>
              <h3 className={styles.h}>Analyze Food</h3>
              <div className={`${styles.card} ${styles.tap}`} {...cardProps("#camera", "Open food photo analysis")}>
                <div className={styles.photo}>📸<span>Upload a food photo</span></div>
                <p className={styles.small}>We found:</p>
                <div className={styles.chips}>
                  <span>✓ rice</span><span>✓ chicken</span><span>✓ broccoli</span>
                </div>
                <span className={styles.cta}>Open Food Analysis →</span>
              </div>
            </section>

            {/* LOG */}
            <section ref={(el) => { sectionRefs.current.log = el; }} className={`${styles.section} ${styles.last}`}>
              <h3 className={styles.h}>Food Log</h3>
              <div className={`${styles.card} ${styles.tap}`} {...cardProps("/food-log", "Open the food log")}>
                <p className={styles.small}>What did you eat?</p>
                <div className={styles.fakeInput}>2 eggs, toast and a banana</div>
                <div className={styles.macroRow}>
                  <div><b>412</b><span>cal</span></div>
                  <div><b>22g</b><span>protein</span></div>
                  <div><b>46g</b><span>carbs</span></div>
                  <div><b>15g</b><span>fat</span></div>
                </div>
                <span className={styles.cta}>Open Food Log →</span>
              </div>
            </section>
          </div>

          <nav className={styles.tabs} aria-label="Phone preview sections">
            {SCREENS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={active === s.id ? styles.tabActive : styles.tab}
                onClick={() => showScreen(s.id)}
                aria-current={active === s.id}
              >
                <span aria-hidden>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <p className={styles.hint}>
        {onOpen
          ? "👆 Scroll inside the phone, then tap a card to log in and open it."
          : "👆 Scroll inside the phone, then tap a card to jump to that part of the app."}
      </p>
    </div>
  );
}
