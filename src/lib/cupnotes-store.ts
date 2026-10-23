import { cacheLife, cacheTag } from 'next/cache';

/*
 * Cup-note placements chosen on /admin/cupnotes, kept in Upstash Redis next to the
 * Instagram token: for each word, a place on the flavour wheel (Manufact Coffee Ver. 2) (which sets its colour), or
 * "not a flavour". They extend and correct the built-in table (components/cupnote/notes.ts).
 * Server only. Writes need NOTES_ADMIN_KEY (see /api/cupnotes).
 */

export type PlaceKey =
  | 'fruit/citrus' | 'fruit/tropical' | 'fruit/berry' | 'fruit/grape' | 'fruit/stone'
  | 'flowerTea/tea' | 'flowerTea/flower' | 'herbVeg/spice' | 'herbVeg/herb' | 'herbVeg/veg'
  | 'nutty/grain' | 'nutty/nut' | 'sweet/sugar' | 'sweet/milk' | 'sweet/cacao'
  | 'fermented/alcohol' | 'other/chemical' | 'other/wood' | 'other/smoky';

/** a place, and optionally the table word whose colour the placed word takes */
export type NoteOverride = { place: PlaceKey; like?: string } | { ignore: true };
export type NoteOverrides = Record<string, NoteOverride>;

export const CUPNOTES_TAG = 'cupnotes';
const KEY = 'cupnotes:overrides';

function redis() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

export const cupnotesStoreReady = () => redis() !== null;

async function command(args: string[]): Promise<unknown> {
  const r = redis();
  if (!r) throw new Error('Cup-note store is not connected: add Upstash Redis to the Vercel project.');
  const res = await fetch(r.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${r.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Cup-note store ${res.status}`);
  return ((await res.json()) as { result: unknown }).result;
}

/** Every saved placement; none while the store is not connected (local development). */
export async function readOverrides(): Promise<NoteOverrides> {
  'use cache';
  cacheLife('hours');
  cacheTag(CUPNOTES_TAG);
  if (!redis()) return {};
  const flat = (await command(['HGETALL', KEY])) as string[] | null;
  const out: NoteOverrides = {};
  for (let i = 0; flat && i < flat.length; i += 2) {
    try {
      out[flat[i]] = JSON.parse(flat[i + 1]) as NoteOverride;
    } catch {}
  }
  return out;
}

export async function saveOverride(word: string, value: NoteOverride | null): Promise<void> {
  if (value) await command(['HSET', KEY, word, JSON.stringify(value)]);
  else await command(['HDEL', KEY, word]);
}
