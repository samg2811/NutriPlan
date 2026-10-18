"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./StatsPhone.module.css";

function smooth(): ScrollBehavior {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "auto";
  }
  return "smooth";
}

const STATE_DOTS = Array.from({ length: 50 }, (_, i) => i);

export default function StatsPhone({ onGetStarted }: { onGetStarted?: () => void }) {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [seen, setSeen] = useState<Record<string, boolean>>({});
  const [loggedIn, setLoggedIn] = useState(false);

  // Check whether the visitor is already logged in
  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setLoggedIn(!!user);
    }
    checkUser();
  }, []);

  // Scroll progress bar at the top of the phone
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    function onScroll() {
      const node = scrollerRef.current!;
      const max = node.scrollHeight - node.clientHeight;
      setProgress(max > 0 ? node.scrollTop / max : 0);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Animate each stat when it scrolls into view inside the phone
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = root.querySelectorAll<HTMLElement>("[data-reveal]");

    if (reduce) {
      const all: Record<string, boolean> = {};
      nodes.forEach((n) => { all[n.dataset.reveal!] = true; });
      setSeen(all);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.reveal!;
            setSeen((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
          }
        });
      },
      { root, threshold: 0.45 }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const on = (id: string) => (seen[id] ? styles.on : "");

  return (
    <section className={styles.section} id="numbers">
      <div className={styles.text}>
        <p className={styles.eyebrow}>THE NUMBERS</p>
        <h2 className={styles.title}>Scroll through why a plan matters.</h2>
        <p className={styles.lead}>
          Swipe through the phone to see the numbers behind NutriPlan. At the end,
          tap Get started to create your account.
        </p>
        <p className={styles.fine}>
          Sources: CDC; Ducrot et al., 2017; USDA. The meal planning result is an
          association, not proof of cause.
        </p>
      </div>

      <div className={styles.wrap}>
        <div className={styles.phone}>
          <div className={styles.notch} />
          <div className={styles.screen}>
            <div className={styles.statusBar}>
              <span>9:41</span>
              <span className={styles.brand}>🍽️ NutriPlan</span>
              <span>●●●</span>
            </div>
            <div className={styles.progressTrack} aria-hidden>
              <div className={styles.progressFill} style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>

            <div className={styles.scroller} ref={scrollerRef}>
              {/* Intro */}
              <div className={`${styles.block} ${styles.intro}`}>
                <p className={styles.kicker}>Why it matters</p>
                <h3>Eating well is harder than it should be.</h3>
                <p className={styles.muted}>Most of us do not lack good intentions. We lack a plan.</p>
                <span className={styles.scrollHint}>Scroll ↓</span>
              </div>

              {/* Stat 1 */}
              <div className={styles.block} data-reveal="s1">
                <div className={styles.big}>~40%</div>
                <p>of US adults have obesity, which raises the risk of heart disease, stroke and type 2 diabetes.</p>
                <div className={styles.bar}><i className={on("s1")} style={{ ["--w" as string]: "40%" }} /></div>
                <p className={styles.src}>CDC, Aug 2021 to Aug 2023</p>
              </div>

              {/* Stat 2 */}
              <div className={styles.block} data-reveal="s2">
                <div className={styles.big}>22 states</div>
                <p>had adult obesity rates of 35% or higher in 2022. A decade earlier, no state did.</p>
                <div className={styles.dots} aria-label="22 of 50 states highlighted">
                  {STATE_DOTS.map((i) => (
                    <span
                      key={i}
                      className={`${styles.dot} ${i < 22 && seen["s2"] ? styles.dotOn : ""}`}
                      style={{ transitionDelay: `${i * 25}ms` }}
                    />
                  ))}
                </div>
                <p className={styles.src}>CDC, 2022 data</p>
              </div>

              {/* Stat 3 */}
              <div className={styles.block} data-reveal="s3">
                <div className={styles.big}>~20% lower</div>
                <p>odds of obesity among people who plan their meals ahead, in a study of 40,554 adults.</p>
                <div className={styles.compare}>
                  <label>Not planning</label>
                  <div className={styles.bar}><i className={on("s3")} style={{ ["--w" as string]: "100%" }} /></div>
                  <label>Meal planners</label>
                  <div className={styles.bar}><i className={`${on("s3")} ${styles.green}`} style={{ ["--w" as string]: "80%" }} /></div>
                </div>
                <p className={styles.src}>
                  <a href="https://pubmed.ncbi.nlm.nih.gov/28153017/" target="_blank" rel="noopener noreferrer">
                    Ducrot et al., 2017
                  </a>{" "}
                  (an association, not proof of cause)
                </p>
              </div>

              {/* Stat 4 */}
              <div className={styles.block} data-reveal="s4">
                <div className={styles.big}>30–40%</div>
                <p>of the US food supply is wasted, which costs families money and fills landfills.</p>
                <div className={styles.bar}>
                  <i className={`${styles.faint} ${on("s4")}`} style={{ ["--w" as string]: "40%" }} />
                  <i className={on("s4")} style={{ ["--w" as string]: "30%" }} />
                </div>
                <p className={styles.src}>
                  <a href="https://www.usda.gov/foodwaste/faqs" target="_blank" rel="noopener noreferrer">USDA</a>
                </p>
              </div>

              {/* How NutriPlan helps */}
              <div className={`${styles.block} ${styles.helps}`}>
                <h3>NutriPlan is here to help</h3>
                <ul>
                  <li><span>🥘</span><div><b>Plan around what you have</b><p>Ingredients, budget and time in. Meals out.</p></div></li>
                  <li><span>📸</span><div><b>Know what is in your food</b><p>Photo or text to calories and macros.</p></div></li>
                  <li><span>➡️</span><div><b>Always know what is next</b><p>See what is left today and get a meal that fits.</p></div></li>
                </ul>
              </div>

              {/* Call to action */}
              <div className={`${styles.block} ${styles.cta}`}>
                <div className={styles.logo}>🍽️</div>
                <h3>Ready to eat smarter?</h3>
                <p className={styles.muted}>Plan smarter. Eat better. Waste less.</p>
                <button
                  type="button"
                  className={styles.start}
                  onClick={() => {
                    // On the login page, "Get started" jumps back up to the login form
                    if (onGetStarted && !loggedIn) {
                      onGetStarted();
                      return;
                    }
                    router.push(loggedIn ? "/food-log" : "/login");
                  }}
                >
                  {loggedIn ? "Open your food log →" : "Get started with NutriPlan →"}
                </button>
                <button
                  type="button"
                  className={styles.top}
                  onClick={() => scrollerRef.current?.scrollTo({ top: 0, behavior: smooth() })}
                >
                  ↑ Back to top
                </button>
              </div>
            </div>
          </div>
        </div>
        <p className={styles.hint}>👆 Scroll inside the phone to see the numbers.</p>
      </div>
    </section>
  );
}
