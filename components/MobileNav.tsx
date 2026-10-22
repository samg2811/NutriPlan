"use client";

import { useEffect, useState } from "react";
import styles from "./MobileNav.module.css";

const TABS = [
  { id: "top", label: "Home", icon: "🏠" },
  { id: "planner", label: "Plan", icon: "🥘" },
  { id: "camera", label: "Scan", icon: "📸" },
  { id: "food-log", label: "Log", icon: "📝" },
];

function smooth(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export default function MobileNav() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    function onScroll() {
      const probe = window.innerHeight * 0.4;
      let current = "top";
      for (const t of TABS) {
        if (t.id === "top") continue;
        const el = document.getElementById(t.id);
        if (el && el.getBoundingClientRect().top <= probe) current = t.id;
      }
      setActive(current);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function go(id: string) {
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: smooth() });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: smooth(), block: "start" });
  }

  return (
    <>
      <div className={styles.spacer} aria-hidden />
      <nav className={styles.bar} aria-label="Quick navigation">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={active === t.id ? styles.active : styles.tab}
            onClick={() => go(t.id)}
            aria-current={active === t.id ? "page" : undefined}
          >
            <span aria-hidden className={styles.icon}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
