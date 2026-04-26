/**
 * Resolve the public FastAPI base URL for server-side proxy routes.
 * On Vercel, NEXT_PUBLIC_API_URL is often set to http://127.0.0.1:8000 for local
 * dev — that breaks server-side fetches, so we skip loopback in production.
 */
export function resolveBackendBaseUrl(): string {
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
    if (isVercel && (h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0")) {
      continue;
    }
    return s.replace(/\/+$/, "");
  }
  return "";
}
