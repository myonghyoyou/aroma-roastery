/*
 * Instagram API with Instagram Login: the one-time connection of the store account and the token
 * renewal. The store owner opens /api/instagram/connect, logs in on Instagram and allows read access;
 * Instagram sends them back to /api/instagram/callback with a code, which becomes a 60-day token.
 */

export const SCOPE = 'instagram_business_basic';
export const STATE_COOKIE = 'ig_connect_state';

export function appConfig() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const secret = process.env.INSTAGRAM_APP_SECRET;
  if (!appId || !secret) throw new Error('INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET are not set.');
  return { appId, secret };
}

/** The callback address registered in the Meta app; it must match it exactly. */
export function redirectUri(origin: string) {
  return process.env.INSTAGRAM_REDIRECT_URI ?? `${origin}/api/instagram/callback`;
}

async function json<T>(res: Response, what: string): Promise<T> {
  const body = await res.text();
  if (!res.ok) throw new Error(`${what} ${res.status}: ${body.slice(0, 300)}`);
  return JSON.parse(body) as T;
}

/** Code from the login screen -> short-lived token -> 60-day token, plus the account it belongs to. */
export async function exchangeCode(code: string, redirect: string) {
  const { appId, secret } = appConfig();
  const short = await json<{ access_token: string; user_id: number | string }>(
    await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({ client_id: appId, client_secret: secret, grant_type: 'authorization_code', redirect_uri: redirect, code }),
    }),
    'Code exchange',
  );
  const long = await json<{ access_token: string; expires_in: number }>(
    await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${secret}&access_token=${short.access_token}`),
    'Long-lived token',
  );
  const me = await json<{ user_id: string; username: string }>(
    await fetch(`https://graph.instagram.com/me?fields=user_id,username&access_token=${long.access_token}`),
    'Account lookup',
  );
  return { token: long.access_token, expiresIn: long.expires_in, userId: String(me.user_id), username: me.username };
}

/** The account a token belongs to; also proves the token works. */
export async function tokenAccount(token: string) {
  const me = await json<{ user_id: string; username: string }>(
    await fetch(`https://graph.instagram.com/me?fields=user_id,username&access_token=${token}`),
    'Account lookup',
  );
  return { userId: String(me.user_id), username: me.username };
}

/** A 60-day token renewed for another 60 days (Instagram allows it once the token is a day old). */
export async function renewToken(token: string) {
  return json<{ access_token: string; expires_in: number }>(
    await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`),
    'Token renewal',
  );
}

/** A small Korean status page for the store owner. */
export function page(title: string, message: string, status = 200) {
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title>
<style>body{margin:0;min-height:100svh;display:grid;place-items:center;background:#1a110d;color:#fbf3e8;font:16px/1.7 system-ui,sans-serif;padding:24px;box-sizing:border-box}main{max-width:28em}h1{font-size:22px;margin:0 0 12px}p{margin:0;color:#d9cbb8}</style></head>
<body><main><h1>${title}</h1><p>${message}</p></main></body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
