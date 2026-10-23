import { createHmac, timingSafeEqual } from 'node:crypto';

/*
 * The owner's sign-in for /admin. The key (NOTES_ADMIN_KEY) is typed once on /admin/login; the device
 * then keeps an httpOnly cookie holding an expiry and its HMAC under that key, never the key itself.
 * Checked by proxy.ts for every /admin page and by /api/cupnotes for every save. Changing the key
 * on Vercel signs every device out.
 */
export const ADMIN_COOKIE = 'aroma_admin';
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 365;

const secret = () => process.env.NOTES_ADMIN_KEY || null;
const sign = (exp: string, key: string) => createHmac('sha256', key).update(`aroma-admin:${exp}`).digest('base64url');

function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const adminKeySet = () => secret() !== null;

export function keyMatches(input: string): boolean {
  const key = secret();
  return key !== null && same(input, key);
}

/** A cookie value good for ADMIN_MAX_AGE, or null when no key is set. */
export function newSession(): string | null {
  const key = secret();
  if (!key) return null;
  const exp = String(Math.floor(Date.now() / 1000) + ADMIN_MAX_AGE);
  return `${exp}.${sign(exp, key)}`;
}

export function validSession(value: string | undefined): boolean {
  const key = secret();
  if (!key || !value) return false;
  const [exp, sig] = value.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) * 1000 < Date.now()) return false;
  return same(sig, sign(exp, key));
}

/** Where to go after signing in: only an /admin page, so the link cannot send the owner elsewhere. */
export function safeNext(next: unknown): string {
  return typeof next === 'string' && /^\/admin(\/[\w/-]*)?(\?[^\\]*)?$/.test(next) && !next.startsWith('/admin/login') ? next : '/admin';
}
