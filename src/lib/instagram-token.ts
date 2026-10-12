/*
 * The store's Instagram access token, kept in Upstash Redis (Vercel Storage) so the site can renew it
 * on its own. Instagram long-lived tokens last 60 days; a daily cron (/api/instagram/refresh) renews
 * them. Server only: the token never reaches the browser.
 */

export type SavedToken = {
  token: string;
  /** ms since epoch */
  expiresAt: number;
  updatedAt: number;
  userId: string;
  username: string;
};

const KEY = 'instagram:token';

// Vercel's Upstash integration names the variables KV_REST_API_*; a direct Upstash setup uses UPSTASH_*
function redis() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

export const tokenStoreReady = () => redis() !== null;

async function command(args: string[]): Promise<unknown> {
  const r = redis();
  if (!r) throw new Error('Token store is not connected: add Upstash Redis to the Vercel project.');
  const res = await fetch(r.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${r.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Token store ${res.status}`);
  return ((await res.json()) as { result: unknown }).result;
}

export async function readToken(): Promise<SavedToken | null> {
  if (!redis()) return null;
  const raw = await command(['GET', KEY]);
  return typeof raw === 'string' ? (JSON.parse(raw) as SavedToken) : null;
}

export async function saveToken(t: SavedToken): Promise<void> {
  await command(['SET', KEY, JSON.stringify(t)]);
}
