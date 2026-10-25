"use client";

import { useState } from "react";
import { RESTRICTIONS } from "@/lib/restrictions";
import { useRestrictions } from "./useRestrictions";
import styles from "./RestrictionsPanel.module.css";

export default function RestrictionsPanel() {
  const { prefs, update } = useRestrictions();
  const [draft, setDraft] = useState("");
  const count = prefs.ids.length + prefs.avoid.length;

  function toggle(id: string) {
    update({
      ...prefs,
      ids: prefs.ids.includes(id)
        ? prefs.ids.filter((x) => x !== id)
        : [...prefs.ids, id],
    });
  }

  function addAvoid() {
    const term = draft.trim().toLowerCase().slice(0, 40);
    setDraft("");
    if (term.length < 2 || prefs.avoid.includes(term) || prefs.avoid.length >= 20) return;
    update({ ...prefs, avoid: [...prefs.avoid, term] });
  }

  function removeAvoid(term: string) {
    update({ ...prefs, avoid: prefs.avoid.filter((x) => x !== term) });
  }

  return (
    <details className={styles.box}>
      <summary className={styles.summary}>
        <span>🥗 Dietary restrictions &amp; allergies</span>
        <span className={count > 0 ? styles.badgeOn : styles.badge}>
          {count > 0 ? `${count} active` : "None set"}
        </span>
      </summary>

      <div className={styles.body}>
        <p className={styles.help}>
          Pick anything you avoid. NutraGoal will hide recipes that contain it.
        </p>

        <div className={styles.chips} role="group" aria-label="Dietary restrictions">
          {RESTRICTIONS.map((r) => {
            const on = prefs.ids.includes(r.id);
            return (
              <button
                key={r.id}
                type="button"
                className={on ? styles.chipOn : styles.chip}
                aria-pressed={on}
                onClick={() => toggle(r.id)}
              >
                {on ? "✓ " : ""}
                {r.label}
              </button>
            );
          })}
        </div>

        <label className={styles.label} htmlFor="avoid-input">
          Other ingredients to avoid
        </label>
        <div className={styles.row}>
          <input
            id="avoid-input"
            className={styles.input}
            type="text"
            value={draft}
            maxLength={40}
            placeholder="e.g. mushrooms, cilantro"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAvoid();
              }
            }}
          />
          <button type="button" className={styles.add} onClick={addAvoid}>
            Add
          </button>
        </div>

        {prefs.avoid.length > 0 && (
          <ul className={styles.tags}>
            {prefs.avoid.map((t) => (
              <li key={t} className={styles.tag}>
                {t}
                <button
                  type="button"
                  className={styles.tagX}
                  onClick={() => removeAvoid(t)}
                  aria-label={`Stop avoiding ${t}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {count > 0 && (
          <button type="button" className={styles.clear} onClick={() => update({ ids: [], avoid: [] })}>
            Clear all
          </button>
        )}

        <p className={styles.note}>
          This checks ingredient names and is not a guarantee. If you have an
          allergy, always read the food label and double-check every ingredient.
          Your choices are saved on this device.
        </p>
      </div>
    </details>
  );
}
