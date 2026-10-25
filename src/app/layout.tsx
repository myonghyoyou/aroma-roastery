import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
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

export const metadata: Metadata = {
  title: 'aroma roastery',
  description: '아로마 로스터리는 설득력 있는 스페셜티 커피를 로스팅 합니다. 서울시 강서구 마곡중앙8로 5길 63 디엠프라자 107호.',
  // private MVP until the public launch: keep it out of search results
  robots: { index: false, follow: false },
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
