import { redirect } from "next/navigation";

// The pantry now lives inside the Meal Planner section on the home page.
export default function PantryPage() {
  redirect("/#planner");
}
