"use client";

import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">
        Nutrition Analytics
      </h1>

      <p className="mt-3 text-gray-600">
        Your food analysis results and nutrition summaries will appear here.
      </p>

      <div className="mt-6 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">
          Ready to track your nutrition?
        </h2>

        <p className="mt-2 text-gray-600">
          Analyze a meal to get started.
        </p>

        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Analyze food
        </Link>
      </div>
    </main>
  );
}
