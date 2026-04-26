"use client";

import { useState } from "react";

type RecommendResponse = {
  recommendations: Array<{
    restaurant_id: string;
    name: string;
    cuisine: string;
    rating: number | null;
    estimated_cost: number | null;
    explanation: string;
  }>;
  summary: string | null;
  warnings: string[];
  meta: Record<string, unknown>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [location, setLocation] = useState("Bellandur");
  const [maxCost, setMaxCost] = useState("2000");
  const [minRating, setMinRating] = useState("4");
  const [cuisines, setCuisines] = useState("Italian, Chinese");
  const [topK, setTopK] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RecommendResponse | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    const cuisineList = cuisines
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const body = {
      preferences: {
        location: location.trim(),
        max_cost: maxCost ? parseInt(maxCost, 10) : undefined,
        min_rating: minRating ? parseFloat(minRating) : undefined,
        cuisines: cuisineList,
      },
      top_k: Math.min(100, Math.max(1, parseInt(topK, 10) || 5)),
    };
    try {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      const json = (await res.json()) as RecommendResponse;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Restaurant recommender
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Connects to the FastAPI backend at <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">{API_BASE}</code>
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Location</span>
              <input
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Max cost (INR)</span>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                value={maxCost}
                onChange={(e) => setMaxCost(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Min rating</span>
              <input
                type="number"
                step="0.1"
                min={0}
                max={5}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Top K</span>
              <input
                type="number"
                min={1}
                max={100}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                value={topK}
                onChange={(e) => setTopK(e.target.value)}
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium">Cuisines (comma-separated)</span>
              <input
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                value={cuisines}
                onChange={(e) => setCuisines(e.target.value)}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? "Loading…" : "Get recommendations"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {data && (
          <div className="mt-8 space-y-4">
            {data.summary && (
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{data.summary}</p>
            )}
            {data.warnings.length > 0 && (
              <ul className="list-inside list-disc rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                {data.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
            <ol className="space-y-3">
              {data.recommendations.map((r, i) => (
                <li
                  key={r.restaurant_id + i}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-zinc-500">#{i + 1}</p>
                      <h2 className="text-lg font-semibold">{r.name}</h2>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{r.cuisine}</p>
                    </div>
                    <div className="text-right text-sm text-zinc-600 dark:text-zinc-400">
                      <p>★ {r.rating ?? "—"}</p>
                      <p>₹ {r.estimated_cost ?? "—"}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                    {r.explanation}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
