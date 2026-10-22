import { redirect } from "next/navigation";

// The food log now lives on the home page, next to the planner and the analyzer.
export default function FoodLogPage() {
  redirect("/#food-log");
}
