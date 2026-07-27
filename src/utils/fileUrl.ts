const API_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

/**
 * Turn API document paths into absolute URLs for <img> / iframe / window.open.
 * Absolute http(s)/data URLs are returned unchanged.
 */
export function resolveFileUrl(url?: string | null): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  if (!API_URL) return trimmed;
  return `${API_URL}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}
