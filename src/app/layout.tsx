import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { openGraphFor, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import './globals.css';
import './sub.css';
// last: the large-screen sizes (past 1920px) override the page styles above
import './large.css';
import './page-transition.css';

// Korean and body text: SUIT (OFL). The hero slogan: General Sans (Indian Type Foundry, free for
// commercial and web use via Fontshare), the open alternative to the licensed PP Neue Montreal.
const suit = localFont({
  src: './fonts/SUIT-Variable.woff2',
  weight: '100 900',
  variable: '--font-suit',
  display: 'swap',
});
const generalSans = localFont({
  src: './fonts/GeneralSans-Semibold.woff2',
  weight: '600',
  variable: '--font-general-sans',
  display: 'swap',
});

// open to search since 2026-10-27 (the store's own domain); /admin and, while it is out of the menu,
// the archive keep themselves out. Search-console ownership tags come from the environment.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | 마곡 스페셜티 커피 로스터리`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: openGraphFor('/'),
  twitter: { card: 'summary_large_image' },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: {
      ...(process.env.NAVER_SITE_VERIFICATION ? { 'naver-site-verification': process.env.NAVER_SITE_VERIFICATION } : {}),
      ...(process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : {}),
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#1A110D',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className={`${suit.variable} ${generalSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
