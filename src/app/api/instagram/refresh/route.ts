import { connection } from 'next/server';
import { renewToken } from '@/lib/instagram-auth';
import { readToken, saveToken } from '@/lib/instagram-token';

const DAY = 24 * 3600 * 1000;

/*
 * Daily cron (vercel.json). The token lasts 60 days; it is renewed once it is a week old, which keeps
 * it far from expiry and respects Instagram's rule that a token must be at least a day old to renew.
 */
export async function GET(request: Request) {
  await connection(); // run on every call, never prerendered
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  const saved = await readToken();
  if (!saved) return Response.json({ renewed: false, reason: 'not connected' });
  if (Date.now() - saved.updatedAt < 7 * DAY) return Response.json({ renewed: false, reason: 'recent' });
  try {
    const t = await renewToken(saved.token);
    const now = Date.now();
    await saveToken({ ...saved, token: t.access_token, expiresAt: now + t.expires_in * 1000, updatedAt: now });
    return Response.json({ renewed: true, expiresAt: new Date(now + t.expires_in * 1000).toISOString() });
  } catch (err) {
    console.error('[instagram] renewal failed:', err);
    return Response.json({ renewed: false, reason: 'error' }, { status: 502 });
  }
}
