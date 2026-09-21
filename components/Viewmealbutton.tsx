"use client";

import { useRef } from "react";
import type { Meal } from "@/data/meals";
import { getRecipe } from "@/data/recipes";

interface Props {
  meal: Meal;
  /** Button text. */
  label?: string;
  /** Pass your existing button classes here so it keeps its current look. */
  className?: string;
}

export default function ViewMealButton({
  meal,
  label = "View meal",
  className,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const steps = getRecipe(meal.id);

  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => dialogRef.current?.showModal()}
      >
        {label}
      </button>

      {/* Native <dialog>: overlay, Esc-to-close and focus trapping for free. */}
      <dialog
        ref={dialogRef}
        // Clicking the dark backdrop (the dialog element itself) closes it.
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        style={{
          width: "min(560px, 92vw)",
          maxHeight: "85vh",
          padding: 0,
          border: "none",
          borderRadius: 12,
          overflowY: "auto",
        }}
      >
        <div style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22 }}>{meal.name}</h2>
            <button type="button" onClick={close} aria-label="Close">
              ✕
            </button>
          </div>

          <p style={{ margin: "8px 0", opacity: 0.8 }}>{meal.description}</p>
          <p style={{ margin: "0 0 16px", fontSize: 14, opacity: 0.8 }}>
            ⏱ {meal.cookingTime} min &nbsp;·&nbsp; 💲{meal.cost.toFixed(2)} per serving
          </p>

          <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>Ingredients</h3>
          <ul style={{ margin: "0 0 16px", paddingLeft: 20 }}>
            {meal.ingredients.map((ing) => (
              <li key={ing.name}>
                <span style={{ textTransform: "capitalize" }}>{ing.name}</span>{" "}
                — {ing.grams} g
              </li>
            ))}
          </ul>

          <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>Recipe</h3>
          {steps.length > 0 ? (
            <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          ) : (
            <p>No recipe available for this meal yet.</p>
          )}
        </div>
      </dialog>
    </>
  );
}
