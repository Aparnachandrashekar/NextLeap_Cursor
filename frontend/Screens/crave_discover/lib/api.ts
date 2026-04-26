import type { RecommendResponse } from "../types";

export async function fetchLocations(): Promise<string[]> {
  const res = await fetch("/api/locations");
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  const j = (await res.json()) as { locations: string[] };
  return j.locations ?? [];
}

export async function fetchRecommendations(
  body: unknown,
): Promise<RecommendResponse> {
  const res = await fetch("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  return (await res.json()) as RecommendResponse;
}
