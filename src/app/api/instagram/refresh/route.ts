import { connection } from 'next/server';
import { renewToken, tokenAccount } from '@/lib/instagram-auth';
import { readToken, saveToken } from '@/lib/instagram-token';

const DAY = 24 * 3600 * 1000;

/*
 * Daily cron (vercel.json). The token lasts 60 days; it is renewed once it is a week old, which keeps
 * it far from expiry and respects Instagram's rule that a token must be at least a day old to renew.
 * A token set by hand (INSTAGRAM_TOKEN, e.g. made with "Generate token" in the Meta dashboard) is
 * taken into the store on the first run, so it is renewed from then on like a connected one.
 */
export async function GET(request: Request) {
  await connection(); // run on every call, never prerendered
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  const saved = await readToken();
  if (!saved) {
    const manual = process.env.INSTAGRAM_TOKEN;
    if (!manual) return Response.json({ renewed: false, reason: 'not connected' });
    try {
      const account = await tokenAccount(manual);
      // its real age is unknown: count it as made today, and renew it a week from now
      const now = Date.now();
      await saveToken({ token: manual, ...account, updatedAt: now, expiresAt: now + 60 * DAY });
      return Response.json({ renewed: false, adopted: account.username });
    } catch (err) {
      console.error('[instagram] INSTAGRAM_TOKEN does not work:', err);
      return Response.json({ renewed: false, reason: 'manual token rejected' }, { status: 502 });
    }
  }
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
