'use client';

import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { signIn } from '@/app/admin/actions';

/* The key field on /admin/login; after signing in it goes back to the page that asked (?next=). */
export function SignInForm() {
  const next = useSearchParams().get('next') ?? '/admin';
  const [error, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="adm-login">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="adm-key">관리 키</label>
      <div className="adm-login-row">
        <input
          id="adm-key" name="key" type="password" required autoFocus autoComplete="current-password"
          aria-invalid={error ? true : undefined} aria-describedby={error ? 'adm-key-error' : undefined}
        />
        <button type="submit" className="adm-btn adm-btn--solid" disabled={pending}>{pending ? '확인 중' : '들어가기'}</button>
      </div>
      {error && <p id="adm-key-error" className="adm-login-error" role="alert">{error}</p>}
    </form>
  );
}
