"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MobileNav.module.css";

type Tab = {
  key: string;
  label: string;
  icon: string;
  href: string;
  section?: string; // id of a section on the home page
};

const TABS: Tab[] = [
  { key: "home", label: "Home", icon: "🏠", href: "/" },
  { key: "plan", label: "Plan", icon: "🥘", href: "/#planner", section: "planner" },
  { key: "scan", label: "Scan", icon: "📸", href: "/#camera", section: "camera" },
  { key: "log", label: "Log", icon: "📝", href: "/#food-log", section: "food-log" },
  { key: "pantry", label: "Pantry", icon: "🥫", href: "/pantry" },
];

function smooth(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export default function MobileNav() {
  const pathname = usePathname();
  const [homeSection, setHomeSection] = useState("home");

  const onHome = pathname === "/";

  // On the home page, highlight whichever section is in view
  useEffect(() => {
    if (!onHome) return;
    function onScroll() {
      const probe = window.innerHeight * 0.4;
      let current = "home";
      for (const t of TABS) {
        if (!t.section) continue;
        const el = document.getElementById(t.section);
        if (el && el.getBoundingClientRect().top <= probe) current = t.key;
      }
      setHomeSection(current);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onHome]);

  // No tab bar on the login page
  if (pathname.startsWith("/login")) return null;

  function isActive(t: Tab) {
    if (onHome) return homeSection === t.key;
    if (t.key === "pantry") return pathname.startsWith("/pantry");
    if (t.key === "log") return pathname.startsWith("/food-log");
    return false;
  }

  // On the home page, scroll instead of reloading
  function handleClick(e: React.MouseEvent, t: Tab) {
    if (!onHome) return;
    if (t.key === "home") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: smooth() });
    } else if (t.section) {
      const el = document.getElementById(t.section);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: smooth(), block: "start" });
      }
    }
  }

  return (
    <>
      <div className={styles.spacer} aria-hidden />
      <nav className={styles.bar} aria-label="Quick navigation">
        {TABS.map((t) => {
          const active = isActive(t);
          return (
            <Link
              key={t.key}
              href={t.href}
              className={active ? styles.active : styles.tab}
              aria-current={active ? "page" : undefined}
              onClick={(e) => handleClick(e, t)}
            >
              <span aria-hidden className={styles.icon}>{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
