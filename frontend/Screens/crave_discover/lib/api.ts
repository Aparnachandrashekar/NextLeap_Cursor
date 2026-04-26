import type { RecommendResponse } from "../types";

async function readErrorBody(res: Response): Promise<string> {
  const t = await res.text();
  try {
    const j = JSON.parse(t) as { error?: string; detail?: string; hint?: string };
    if (j.error) {
      return j.hint ? `${j.error} (${j.hint})` : j.error;
    }
    if (j.detail) return String(j.detail);
  } catch {
    /* not JSON */
  }
  return t || res.statusText;
}

export async function fetchLocations(): Promise<string[]> {
  const res = await fetch("/api/locations");
  if (!res.ok) {
    throw new Error(await readErrorBody(res));
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
    throw new Error(await readErrorBody(res));
  }
  return (await res.json()) as RecommendResponse;
}
