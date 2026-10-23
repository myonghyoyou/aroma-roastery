import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignInForm } from '@/components/admin/SignInForm';
import { SubPage } from '@/components/site/SubPage';
import '@/components/admin/admin.css';

/* The one door to /admin: the key once, then this device stays signed in for a year (lib/admin-session.ts). */
export const metadata: Metadata = { title: '관리 | aroma roastery' };

export default function AdminLogin() {
  return (
    <SubPage>
      <div className="adm adm--narrow">
        <header className="page-head adm-head">
          <h1>관리</h1>
          <p>관리 키를 넣어 주세요. 한 번 들어오면 이 기기에서는 1년 동안 다시 묻지 않습니다.</p>
        </header>
        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
    </SubPage>
  );
}
