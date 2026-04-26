import { NextResponse } from "next/server";

import { getStreamlitConfigHint, resolveBackendBase } from "@/lib/backendProxy";

export const dynamic = "force-dynamic";

export async function GET() {
  const r = resolveBackendBase();
  if (r.kind === "missing") {
    return NextResponse.json(
      {
        next: "ok",
        backendConfigured: false,
        backendReachable: false,
        hint: "Set BACKEND_API_URL in Vercel to your public FastAPI base URL. Do not use 127.0.0.1/localhost in production. Do not use a Streamlit app URL.",
      },
      { status: 200 },
    );
  }
  if (r.kind === "rejected" && r.reason === "streamlit") {
    return NextResponse.json(
      {
        next: "ok",
        backendConfigured: false,
        backendReachable: false,
        streamlitUrlRejected: true,
        hint: getStreamlitConfigHint(),
      },
      { status: 200 },
    );
  }
  if (r.kind === "rejected" && r.reason === "loopback") {
    return NextResponse.json(
      {
        next: "ok",
        backendConfigured: false,
        backendReachable: false,
        hint: "On Vercel, do not set the API URL to localhost/127.0.0.1. Use your deployed FastAPI public URL (e.g. Railway/Render) as BACKEND_API_URL.",
      },
      { status: 200 },
    );
  }
  if (r.kind !== "ok") {
    return NextResponse.json(
      { next: "ok", backendConfigured: false, backendReachable: false, hint: "No valid BACKEND_API_URL in environment." },
      { status: 200 },
    );
  }
  const base = r.base;
  const host = (() => {
    try {
      return new URL(base).host;
    } catch {
      return "set";
    }
  })();
  let backendReachable = false;
  try {
    const res = await fetch(`${base}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    backendReachable = res.ok;
  } catch {
    backendReachable = false;
  }
  return NextResponse.json(
    {
      next: "ok",
      backendConfigured: true,
      backendHost: host,
      backendReachable,
    },
    { status: 200 },
  );
}
