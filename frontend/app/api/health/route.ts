import { NextResponse } from "next/server";

import { resolveBackendBaseUrl } from "@/lib/backendProxy";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = resolveBackendBaseUrl();
  if (!base) {
    return NextResponse.json(
      {
        next: "ok",
        backendConfigured: false,
        backendReachable: false,
        hint: "Set BACKEND_API_URL in Vercel to your public FastAPI base URL. Do not use 127.0.0.1/localhost in production.",
      },
      { status: 200 },
    );
  }
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
