"use client";

import { useCallback, useEffect, useState } from "react";

import { type RecommendResponse } from "./types";
import { fetchLocations, fetchRecommendations } from "./lib/api";
import { HomeSearchScreen } from "./screens/HomeSearchScreen";
import { FindingFlavorScreen } from "./screens/FindingFlavorScreen";
import { RecommendationsScreen } from "./screens/RecommendationsScreen";
import { NoResultsScreen } from "./screens/NoResultsScreen";
import { ErrorScreen } from "./screens/ErrorScreen";

const TOP_K = 5;

type Phase = "search" | "finding" | "results" | "empty" | "error";

type LocationStatus = "loading" | "ok" | "error";

function buildSearchSubtitle(
  area: string,
  cuisineCsv: string,
  minR: string,
  max: string,
) {
  const cuisineList = cuisineCsv
    .split(/[,;]+/)
    .map((c) => c.trim())
    .filter(Boolean);
  const cPart = cuisineList.length ? cuisineList.join(", ") : "your cuisines";
  const m = max.trim() ? `₹${max}` : "any budget";
  return `Showing AI-curated matches for "${cPart}" in ${area}, min ${minR}★, under ${m} (top ${TOP_K})`;
}

export function CraveDiscoverApp() {
  const [location, setLocation] = useState("Bellandur");
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("loading");
  const [maxCost, setMaxCost] = useState("2000");
  const [minRating, setMinRating] = useState("4.5");
  const [cuisines, setCuisines] = useState("Italian");
  const [phase, setPhase] = useState<Phase>("search");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [searchSubtitle, setSearchSubtitle] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchLocations();
        if (cancelled) return;
        setLocationOptions(list);
        if (list.length) {
          setLocation((prev) => (list.includes(prev) ? prev : list[0]!));
        }
        setLocationStatus("ok");
      } catch {
        if (!cancelled) {
          setLocationStatus("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const goSearch = useCallback(() => {
    setPhase("search");
    setError(null);
  }, []);

  const doRecommend = useCallback(async () => {
    setError(null);
    setData(null);
    setPhase("finding");
    setSearchSubtitle(buildSearchSubtitle(location, cuisines, minRating, maxCost));
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
      top_k: Math.min(100, Math.max(1, TOP_K)),
    };
    try {
      const res = await fetchRecommendations(body);
      setData(res);
      if (!res.recommendations || res.recommendations.length === 0) {
        setPhase("empty");
      } else {
        setPhase("results");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setPhase("error");
    }
  }, [location, maxCost, minRating, cuisines]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      void doRecommend();
    },
    [doRecommend],
  );

  return (
    <div>
      {phase === "search" && (
        <HomeSearchScreen
          location={location}
          onLocation={setLocation}
          locationOptions={locationOptions}
          locationStatus={locationStatus}
          maxCost={maxCost}
          onMaxCost={setMaxCost}
          minRating={minRating}
          onMinRating={setMinRating}
          cuisines={cuisines}
          onCuisines={setCuisines}
          onSubmit={onSubmit}
        />
      )}
      {phase === "finding" && <FindingFlavorScreen />}
      {phase === "results" && data && (
        <RecommendationsScreen
          data={data}
          onBack={goSearch}
          areaLabel={location}
          searchSubtitle={searchSubtitle}
        />
      )}
      {phase === "empty" && <NoResultsScreen onBack={goSearch} />}
      {phase === "error" && error && (
        <ErrorScreen
          message={error}
          onBack={goSearch}
          onRetry={() => {
            void doRecommend();
          }}
        />
      )}
    </div>
  );
}
