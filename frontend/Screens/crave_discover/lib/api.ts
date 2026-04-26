import type { RecommendResponse } from "../types";
import { API_BASE } from "../types";

export async function fetchLocations(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/locations`);
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
  const res = await fetch(`${API_BASE}/recommend`, {
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
