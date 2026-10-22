import FoodLogSection from "@/components/FoodLogSection";

export default function FoodLogPage() {
  return (
    <main className="container">
      <a href="/" style={{ display: "inline-block", marginTop: 16, color: "#66726b", textDecoration: "none" }}>
        ← Back to NutraGoal
      </a>
      <FoodLogSection />
    </main>
  );
}
