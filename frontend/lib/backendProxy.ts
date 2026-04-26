/**
 * Resolve the public FastAPI base URL for server-side proxy routes.
 * On Vercel, NEXT_PUBLIC_API_URL is often set to http://127.0.0.1:8000 for local
 * dev — that breaks server-side fetches, so we skip loopback in production.
 * Streamlit Cloud URLs are not FastAPI: they will never serve /health, /locations, or /recommend.
 */

const STREAMLIT_HINT =
  "BACKEND_API_URL must be a FastAPI server (e.g. uvicorn phase4.api:app on Railway/Render), not a Streamlit app URL. Streamlit does not expose the REST API your Next app calls.";

export type BackendResolve =
  | { kind: "ok"; base: string }
  | { kind: "missing" }
  | { kind: "rejected"; reason: "streamlit" | "loopback" };

function isStreamlitHost(host: string): boolean {
  const h = host.toLowerCase();
  return h === "streamlit.app" || h.endsWith(".streamlit.app");
}

export function getStreamlitConfigHint(): string {
  return STREAMLIT_HINT;
}

export function resolveBackendBase(): BackendResolve {
  const isVercel = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);

  const candidates = [
    process.env.BACKEND_API_URL,
    process.env.API_BASE_URL,
    process.env.PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ];

  for (const raw of candidates) {
    if (raw == null || !String(raw).trim()) continue;
    const s = String(raw).trim();
    let url: URL;
    try {
      url = new URL(s);
    } catch {
      continue;
    }
    const h = url.hostname;
    if (isStreamlitHost(h)) {
      return { kind: "rejected", reason: "streamlit" };
    }
    if (isVercel && (h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0")) {
      return { kind: "rejected", reason: "loopback" };
    }
    return { kind: "ok", base: s.replace(/\/+$/, "") };
  }
  return { kind: "missing" };
}

/** @deprecated Prefer resolveBackendBase() for full diagnostics. */
export function resolveBackendBaseUrl(): string {
  const r = resolveBackendBase();
  if (r.kind === "ok") return r.base;
  return "";
}
