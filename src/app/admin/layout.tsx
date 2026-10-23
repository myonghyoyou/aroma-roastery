import type { Metadata } from 'next';

// the owner's pages: reachable by URL only, kept out of search; a home-screen shortcut is named "aroma 관리"
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  appleWebApp: { title: 'aroma 관리' },
};

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return children;
}
