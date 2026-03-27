const PROD_API_BASE = "https://anchordoc-backend.onrender.com";

/**
 * In dev, use same-origin `/api` so the Vite dev server can proxy to the backend
 * (see `vite.config.ts`). That avoids CORS and bad `VITE_API_BASE` copies.
 * Production builds use `VITE_API_BASE` or the Render URL.
 */
const API_BASE = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || PROD_API_BASE);

export function buildUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export async function handleJson<T>(res: Response): Promise<T> {
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error || "Request failed");
  }

  return json as T;
}
