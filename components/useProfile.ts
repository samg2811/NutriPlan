"use client";

import { useCallback, useEffect, useState } from "react";

// What the personalization quiz learns about the user (saved on this device)
export type Profile = {
  done: boolean; // finished the quiz
  dismissed: boolean; // clicked "Not now"
  likes: string[]; // foods they enjoy
  maxTime: number; // minutes per meal, 0 = no limit
  budget: number; // dollars per meal, 0 = no limit
  variety: "never" | "ok"; // avoid repeating meals?
};

export const DEFAULT_PROFILE: Profile = {
  done: false,
  dismissed: false,
  likes: [],
  maxTime: 0,
  budget: 0,
  variety: "never",
};

const KEY = "nutrigoal.profile.v1";
const EVENT = "nutrigoal:profile";

function clean(raw: unknown): Profile {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const num = (v: unknown, max: number) =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max ? v : 0;
  return {
    done: r.done === true,
    dismissed: r.dismissed === true,
    likes: Array.isArray(r.likes)
      ? r.likes
          .filter((x): x is string => typeof x === "string")
          .map((x) => x.toLowerCase().slice(0, 40))
          .slice(0, 30)
      : [],
    maxTime: num(r.maxTime, 600),
    budget: num(r.budget, 1000),
    variety: r.variety === "ok" ? "ok" : "never",
  };
}

function read(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? clean(JSON.parse(raw)) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(read());
    setReady(true);
    const sync = () => setProfile(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((next: Profile) => {
    const safe = clean(next);
    setProfile(safe);
    try {
      localStorage.setItem(KEY, JSON.stringify(safe));
    } catch {
      // Storage can be blocked (private mode); the choice still works until reload
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { profile, update, ready };
}
