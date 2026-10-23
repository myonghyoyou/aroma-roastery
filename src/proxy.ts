import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, validSession } from '@/lib/admin-session';

/* The /admin pages open only to a signed-in device; anyone else lands on /admin/login and comes back after. */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const signedIn = validSession(request.cookies.get(ADMIN_COOKIE)?.value);
  if (pathname === '/admin/login') return signedIn ? NextResponse.redirect(new URL('/admin', request.url)) : NextResponse.next();
  if (signedIn) return NextResponse.next();
  const to = new URL('/admin/login', request.url);
  if (pathname !== '/admin') to.searchParams.set('next', pathname + search);
  return NextResponse.redirect(to);
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
