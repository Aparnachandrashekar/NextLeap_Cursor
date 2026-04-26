import { NextResponse } from "next/server";

import { getStreamlitConfigHint, resolveBackendBase } from "@/lib/backendProxy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const r = resolveBackendBase();
  if (r.kind === "missing") {
    return NextResponse.json(
      {
        error: "Backend URL not configured. Set BACKEND_API_URL in Vercel. See /api/health for diagnostics.",
      },
      { status: 503 },
    );
  }
  if (r.kind === "rejected" && r.reason === "streamlit") {
    return NextResponse.json(
      { error: getStreamlitConfigHint() },
      { status: 503 },
    );
  }
  if (r.kind === "rejected" && r.reason === "loopback") {
    return NextResponse.json(
      {
        error: "On Vercel, localhost/127.0.0.1 is not a valid API URL. Set BACKEND_API_URL to your public FastAPI deployment.",
      },
      { status: 503 },
    );
  }
  if (r.kind !== "ok") {
    return NextResponse.json({ error: "No valid BACKEND_API_URL in environment." }, { status: 503 });
  }
  const base = r.base;
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
