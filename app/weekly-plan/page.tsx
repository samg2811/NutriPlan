import type { Metadata } from "next";
import Link from "next/link";
import WeeklyMealPlan from "@/components/WeeklyMealPlan";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "Weekly Meal Plan | NutraGoal",
  description:
    "Generate a weekly meal plan that fits your dietary restrictions, time and budget.",
};

export default function WeeklyPlanPage() {
  return (
    <main className="container">
      {/* NAVBAR (same look as the home page) */}
      <nav className="navbar">
        <Link
          href="/"
          className="logo"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          🍽️ NutraGoal
        </Link>

        <div className="nav-links">
          <Link href="/#planner">Meal Planner</Link>
          <Link href="/weekly-plan" aria-current="page">
            Weekly Plan
          </Link>
          <Link href="/#camera">Analyze Food</Link>
          <Link href="/food-log">Food Log</Link>
        </div>
      </nav>

      <WeeklyMealPlan />

      <MobileNav />

      <footer>
        <strong>NutraGoal</strong>
        <span>Plan smarter. Eat better. Waste less.</span>
      </footer>
    </main>
  );
}
