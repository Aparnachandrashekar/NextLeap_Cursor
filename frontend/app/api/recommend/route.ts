import { NextResponse } from "next/server";

import { resolveBackendBaseUrl } from "@/lib/backendProxy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const base = resolveBackendBaseUrl();
  if (!base) {
    return NextResponse.json(
      {
        error:
          "Backend URL not configured. In Vercel, set BACKEND_API_URL to your public API, not 127.0.0.1. See /api/health for diagnostics.",
      },
      { status: 503 },
    );
  }
  try {
    const body = await req.text();
    const res = await fetch(`${base}/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(120_000),
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to reach backend /recommend";
    return NextResponse.json(
      { error: msg, hint: `Tried: ${new URL("/recommend", base + "/").toString()}` },
      { status: 502 },
    );
  }
}
