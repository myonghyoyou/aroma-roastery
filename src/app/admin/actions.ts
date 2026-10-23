'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, ADMIN_MAX_AGE, adminKeySet, keyMatches, newSession, safeNext } from '@/lib/admin-session';

/** Signs this device in for a year; returns the message to show when it cannot. */
export async function signIn(_: string | null, form: FormData): Promise<string | null> {
  if (!adminKeySet()) return '관리 키가 설정되어 있지 않습니다. Vercel 환경 변수 NOTES_ADMIN_KEY를 확인해 주세요.';
  if (!keyMatches(String(form.get('key') ?? ''))) {
    // a short wait makes guessing the key slow
    await new Promise((r) => setTimeout(r, 800));
    return '관리 키가 맞지 않습니다.';
  }
  (await cookies()).set(ADMIN_COOKIE, newSession()!, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: ADMIN_MAX_AGE,
  });
  redirect(safeNext(form.get('next')));
}

export async function signOut() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect('/admin/login');
}
