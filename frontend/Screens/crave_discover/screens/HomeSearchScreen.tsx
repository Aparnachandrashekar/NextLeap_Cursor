"use client";

import { useCallback, useMemo, useState } from "react";

import { TRENDING_IMAGES, HERO_FOOD } from "../lib/stitchImageUrls";
import { SiteFooter } from "../components/SiteFooter";

const PRESET_CUISINES = [
  "Italian",
  "Japanese",
  "Indian",
  "Mexican",
  "French",
  "Thai",
] as const;

type LocationStatus = "loading" | "ok" | "error";

type Props = {
  location: string;
  onLocation: (v: string) => void;
  locationOptions: string[];
  locationStatus: LocationStatus;
  maxCost: string;
  onMaxCost: (v: string) => void;
  minRating: string;
  onMinRating: (v: string) => void;
  cuisines: string;
  onCuisines: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

function parseCuisineList(s: string): string[] {
  return s
    .split(/[,;]+/)
    .map((c) => c.trim())
    .filter(Boolean);
}

function joinCuisineList(list: string[]) {
  return list.join(", ");
}

export function HomeSearchScreen({
  location,
  onLocation,
  locationOptions,
  locationStatus,
  maxCost,
  onMaxCost,
  minRating,
  onMinRating,
  cuisines,
  onCuisines,
  onSubmit,
}: Props) {
  const [budgetTier, setBudgetTier] = useState(0);
  const selectedCuisines = useMemo(() => {
    return parseCuisineList(cuisines);
  }, [cuisines]);

  const syncCuisines = useCallback(
    (next: string[]) => onCuisines(joinCuisineList(next)),
    [onCuisines],
  );

  const toggleCuisine = useCallback(
    (c: string) => {
      const s = c.trim();
      if (!s) return;
      if (selectedCuisines.map((x) => x.toLowerCase()).includes(s.toLowerCase())) {
        syncCuisines(selectedCuisines.filter((x) => x.toLowerCase() !== s.toLowerCase()));
        return;
      }
      syncCuisines([...selectedCuisines, s]);
    },
    [selectedCuisines, syncCuisines],
  );

  const addCuisine = useCallback(() => {
    const t = window.prompt("Add a cuisine (e.g. Chinese)");
    if (t && t.trim()) {
      const s = t.trim();
      if (!selectedCuisines.map((x) => x.toLowerCase()).includes(s.toLowerCase())) {
        syncCuisines([...selectedCuisines, s]);
      }
    }
  }, [selectedCuisines, syncCuisines]);

  const rVal = (() => {
    const n = parseFloat(minRating);
    if (Number.isFinite(n)) return n;
    return 4.5;
  })();

  const minRatingText = rVal % 1 === 0 ? `${rVal.toFixed(1)}+ Stars` : `${rVal}+ Stars`;

  const inputLocClass =
    "w-full border-outline-variant bg-surface-container-lowest rounded-xl border px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary";

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black tracking-tighter text-orange-600 dark:text-orange-500">
              AIroma
            </span>
            <div className="hidden items-center gap-6 md:flex">
              <a
                className="font-epilogue border-b-2 border-orange-600 pb-1 text-base font-bold text-orange-600 dark:text-orange-500"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Discover
              </a>
              <a
                className="font-epilogue rounded-lg px-2 py-1 text-base font-medium text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-orange-500 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-900"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Trending
              </a>
              <a
                className="font-epilogue rounded-lg px-2 py-1 text-base font-medium text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-orange-500 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-900"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Collections
              </a>
              <a
                className="font-epilogue rounded-lg px-2 py-1 text-base font-medium text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-orange-500 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-900"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Nearby
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="rounded-full p-2 text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-900"
              type="button"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button
              className="rounded-full p-2 text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-900"
              type="button"
            >
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </nav>
      <main>
        <section className="relative overflow-hidden px-4 pb-24 pt-16">
          <div className="absolute inset-0 z-0">
            <div className="to-transparent absolute inset-0 bg-gradient-to-br from-primary-container/10" />
            <img
              className="h-full w-full object-cover opacity-20"
              src={HERO_FOOD}
              alt=""
            />
          </div>
          <div className="relative z-10 mx-auto mb-12 max-w-5xl text-center">
            <h1 className="mb-4 text-on-surface font-display-lg text-display-lg">
              Find your next favorite meal
            </h1>
            <p className="font-body-md text-body-md mx-auto max-w-2xl text-on-surface-variant">
              Discover AI-curated dining experiences tailored to your taste, budget, and mood.
            </p>
          </div>
          <div
            id="search-form-card"
            className="relative z-10 mx-auto max-w-4xl rounded-2xl border border-outline-variant bg-white/80 p-6 shadow-xl backdrop-blur-xl md:p-8"
          >
            <form
              onSubmit={onSubmit}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              <div className="space-y-2 lg:col-span-2">
                <label className="font-label-caps text-label-caps flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">location_on</span> LOCATION
                </label>
                {locationStatus === "loading" && locationOptions.length === 0 ? (
                  <select className={inputLocClass} disabled>
                    <option>Loading…</option>
                  </select>
                ) : locationOptions.length > 0 ? (
                  <select
                    className={inputLocClass + " text-body-sm font-body"}
                    value={location}
                    onChange={(e) => onLocation(e.target.value)}
                    required
                  >
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={inputLocClass + " text-body-sm font-body"}
                    value={location}
                    onChange={(e) => onLocation(e.target.value)}
                    required
                    placeholder="Enter neighborhood or city"
                    type="text"
                  />
                )}
                {locationStatus === "error" && locationOptions.length === 0 && (
                  <p className="text-body-sm text-amber-800 dark:text-amber-200">
                    Could not load areas. Enter a location or start the API and re-open this page.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-on-surface-variant font-label-caps text-label-caps">BUDGET</label>
                <div className="border-outline-variant bg-surface-container-lowest flex rounded-xl border p-1">
                  <button
                    className={
                      (budgetTier === 0
                        ? "bg-primary-container text-white"
                        : "text-on-surface-variant hover:bg-surface-variant") +
                      " font-title-sm flex-1 rounded-lg py-2 text-sm font-bold"
                    }
                    type="button"
                    onClick={() => {
                      setBudgetTier(0);
                    }}
                  >
                    $
                  </button>
                  <button
                    className={
                      (budgetTier === 1
                        ? "bg-primary-container text-white"
                        : "text-on-surface-variant hover:bg-surface-variant") +
                      " font-title-sm flex-1 rounded-lg py-2 text-sm font-bold"
                    }
                    type="button"
                    onClick={() => {
                      setBudgetTier(1);
                    }}
                  >
                    $$
                  </button>
                  <button
                    className={
                      (budgetTier === 2
                        ? "bg-primary-container text-white"
                        : "text-on-surface-variant hover:bg-surface-variant") +
                      " font-title-sm flex-1 rounded-lg py-2 text-sm font-bold"
                    }
                    type="button"
                    onClick={() => {
                      setBudgetTier(2);
                    }}
                  >
                    $$$
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-on-surface-variant font-label-caps text-label-caps">
                  MAX COST (PP)
                </label>
                <div className="relative">
                  <span className="text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2">
                    $
                  </span>
                  <input
                    className="border-outline-variant bg-surface-container-lowest w-full rounded-xl border py-3 pl-8 pr-4 outline-none transition-all focus:ring-2 focus:ring-primary"
                    placeholder="2000"
                    type="number"
                    min={0}
                    value={maxCost}
                    onChange={(e) => onMaxCost(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-3 lg:col-span-4">
                <label className="text-on-surface-variant font-label-caps text-label-caps flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">restaurant_menu</span> CUISINE
                  TYPE
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_CUISINES.map((c) => {
                    const on = selectedCuisines.map((s) => s.toLowerCase()).includes(c.toLowerCase());
                    return (
                      <button
                        key={c}
                        className={
                          (on
                            ? "bg-primary-container text-white"
                            : "text-on-surface-variant bg-surface-container-highest hover:bg-primary-container/10") +
                          " font-title-sm rounded-full px-4 py-2 text-[14px] transition-colors"
                        }
                        type="button"
                        onClick={() => {
                          toggleCuisine(c);
                        }}
                      >
                        {c}
                      </button>
                    );
                  })}
                  <button
                    className="border-outline-variant text-on-surface-variant hover:bg-surface-variant rounded-full border px-4 py-2 transition-colors"
                    type="button"
                    onClick={addCuisine}
                    title="Add cuisine"
                  >
                    <span className="material-symbols-outlined text-[20px] align-middle">add</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-on-surface-variant font-label-caps text-label-caps">
                    MINIMUM RATING
                  </label>
                  <span className="text-primary font-bold">{minRatingText}</span>
                </div>
                <input
                  className="accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-variant"
                  max={5}
                  min={1}
                  step="0.5"
                  type="range"
                  value={rVal}
                  onChange={(e) => onMinRating(e.target.value)}
                />
              </div>
              <div className="lg:col-span-2 flex items-end">
                <button
                  className="text-headline-md font-headline-md flex w-full -translate-y-0 transform items-center justify-center gap-2 rounded-xl bg-[#FF4F00] py-4 text-white shadow-lg transition-all active:translate-y-0.5 hover:-translate-y-0.5 hover:shadow-xl"
                  type="submit"
                >
                  <span className="material-symbols-outlined">search</span>
                  Find Restaurants
                </button>
              </div>
            </form>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-on-surface font-headline-md text-display-lg">Trending nearby</h2>
              <p className="text-on-surface-variant font-body-md text-body-md">
                What&apos;s hot in your area right now
              </p>
            </div>
            <button
              className="text-primary font-title-sm hidden items-center gap-2 md:flex"
              type="button"
            >
              View all <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
              <div className="relative h-64 overflow-hidden">
                <img
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={TRENDING_IMAGES.a}
                  alt=""
                />
                <span className="bg-primary absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold text-white font-epilogue shadow-lg">
                  Trending
                </span>
                <button
                  className="absolute right-4 top-4 rounded-full bg-white/80 p-2 backdrop-blur-md transition-colors hover:bg-white"
                  type="button"
                >
                  <span className="text-on-surface material-symbols-outlined">favorite</span>
                </button>
              </div>
              <div className="space-y-3 p-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-on-surface font-title-sm text-title-sm">Lumina Dining Lab</h3>
                  <div className="bg-surface-container-low flex items-center gap-1 rounded-lg px-2 py-1">
                    <span
                      className="text-orange-500 material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-sm font-bold">4.9</span>
                  </div>
                </div>
                <p className="text-on-surface-variant flex items-center gap-1 text-sm">
                  <span className="material-symbols-outlined text-[16px]">location_on</span> Near you •
                  local pick
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="bg-surface-variant text-on-surface-variant rounded-full px-3 py-1 text-xs font-bold">
                    Modern French
                  </span>
                  <span className="bg-surface-variant text-on-surface-variant rounded-full px-3 py-1 text-xs font-bold">
                    $$$
                  </span>
                </div>
              </div>
            </div>
            <div className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
              <div className="relative h-64 overflow-hidden">
                <img
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={TRENDING_IMAGES.b}
                  alt=""
                />
                <span className="bg-tertiary-container absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold text-white font-epilogue shadow-lg">
                  Top Rated
                </span>
                <button
                  className="absolute right-4 top-4 rounded-full bg-white/80 p-2 backdrop-blur-md transition-colors hover:bg-white"
                  type="button"
                >
                  <span className="text-on-surface material-symbols-outlined">favorite</span>
                </button>
              </div>
              <div className="space-y-3 p-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-on-surface font-title-sm text-title-sm">Umami Kaze</h3>
                  <div className="bg-surface-container-low flex items-center gap-1 rounded-lg px-2 py-1">
                    <span
                      className="text-orange-500 material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-sm font-bold">4.8</span>
                  </div>
                </div>
                <p className="text-on-surface-variant flex items-center gap-1 text-sm">
                  <span className="material-symbols-outlined text-[16px]">location_on</span> Near you •
                  top picks
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="bg-surface-variant text-on-surface-variant rounded-full px-3 py-1 text-xs font-bold">
                    Japanese
                  </span>
                  <span className="bg-surface-variant text-on-surface-variant rounded-full px-3 py-1 text-xs font-bold">
                    $$
                  </span>
                </div>
              </div>
            </div>
            <div className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
              <div className="relative h-64 overflow-hidden">
                <img
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={TRENDING_IMAGES.c}
                  alt=""
                />
                <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white font-epilogue shadow-lg">
                  New Arrival
                </span>
                <button
                  className="absolute right-4 top-4 rounded-full bg-white/80 p-2 backdrop-blur-md transition-colors hover:bg-white"
                  type="button"
                >
                  <span className="text-on-surface material-symbols-outlined">favorite</span>
                </button>
              </div>
              <div className="space-y-3 p-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-on-surface font-title-sm text-title-sm">The Olive Branch</h3>
                  <div className="bg-surface-container-low flex items-center gap-1 rounded-lg px-2 py-1">
                    <span
                      className="text-orange-500 material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-sm font-bold">4.7</span>
                  </div>
                </div>
                <p className="text-on-surface-variant flex items-center gap-1 text-sm">
                  <span className="material-symbols-outlined text-[16px]">location_on</span> Near you •
                  hidden gem
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="bg-surface-variant text-on-surface-variant rounded-full px-3 py-1 text-xs font-bold">
                    Mediterranean
                  </span>
                  <span className="bg-surface-variant text-on-surface-variant rounded-full px-3 py-1 text-xs font-bold">
                    $$
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <button
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 -translate-y-0 transform items-center justify-center rounded-full bg-[#FF4F00] text-white shadow-2xl transition-transform active:scale-95 md:hidden"
        type="button"
        onClick={() => {
          document.getElementById("search-form-card")?.scrollIntoView({ behavior: "smooth" });
        }}
        aria-label="Search"
      >
        <span className="material-symbols-outlined text-[28px]">search</span>
      </button>
    </div>
  );
}
