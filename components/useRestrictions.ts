"use client";

import { useCallback, useEffect, useState } from "react";
import { cleanPrefs, type Prefs } from "@/lib/restrictions";

const KEY = "nutrigoal.restrictions.v1";
const EVENT = "nutrigoal:restrictions";
const EMPTY: Prefs = { ids: [], avoid: [] };

function read(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return cleanPrefs(parsed?.ids, parsed?.avoid);
  } catch {
    return EMPTY;
  }
}

// Saved on this device. Every component using this hook stays in sync.
export function useRestrictions() {
  const [prefs, setPrefs] = useState<Prefs>(EMPTY);

  useEffect(() => {
    setPrefs(read());
    const sync = () => setPrefs(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync); // other tabs
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((next: Prefs) => {
    const safe = cleanPrefs(next.ids, next.avoid);
    setPrefs(safe);
    try {
      localStorage.setItem(KEY, JSON.stringify(safe));
    } catch {
      // Storage can be blocked (private mode). The choice still works until reload.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { prefs, update };
}
