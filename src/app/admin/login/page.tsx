import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignInForm } from '@/components/admin/SignInForm';
import { SubPage } from '@/components/site/SubPage';
import '@/components/admin/admin.css';

/* The one door to /admin: the key once, then this device stays signed in for a year (lib/admin-session.ts). */
export const metadata: Metadata = { title: { absolute: 'aroma 관리' } };

export default function AdminLogin() {
  return (
    <SubPage>
      <div className="adm adm--narrow">
        <header className="page-head adm-head">
          <h1>관리</h1>
        </header>
        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
    </SubPage>
  );
}
