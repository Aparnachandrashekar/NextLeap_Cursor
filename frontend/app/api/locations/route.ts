import { NextResponse } from "next/server";

function backendBase() {
  const base = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error(
      "Missing backend URL. Set BACKEND_API_URL in Vercel environment variables.",
    );
  }
  return base.replace(/\/+$/, "");
}

export async function GET() {
  try {
    const res = await fetch(`${backendBase()}/locations`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to reach backend /locations";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
