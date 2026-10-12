import { connection } from 'next/server';
import { readToken, tokenStoreReady } from '@/lib/instagram-token';

/* Connection status for the people running the site: never the token itself. */
export async function GET() {
  await connection(); // run on every call, never prerendered
  if (!tokenStoreReady()) return Response.json({ store: false, connected: false });
  const saved = await readToken();
  // a hand-set token is used for the archive right away and moved into the store by the next cron run
  if (!saved) return Response.json({ store: true, connected: false, manualToken: Boolean(process.env.INSTAGRAM_TOKEN) });
  return Response.json({
    store: true,
    connected: true,
    username: saved.username,
    renewedAt: new Date(saved.updatedAt).toISOString(),
    expiresAt: new Date(saved.expiresAt).toISOString(),
  });
}
