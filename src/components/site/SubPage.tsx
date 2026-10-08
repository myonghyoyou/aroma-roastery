import type { ReactNode } from 'react';
import { getSiteSettings } from '@/lib/content';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { SmoothScroll } from './SmoothScroll';

/*
 * Shell for every page other than home: the same top bar and footer, on a still version of the
 * home page's field (the four leaf colours glowing at the top of a deep roast, plus film grain),
 * so leaving the home page does not feel like leaving the brand.
 */
export async function SubPage({ current, children }: { current?: 'archive' | 'news'; children: ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <div className="sub">
      <SmoothScroll />
      <div className="sub-field" aria-hidden="true" />
      <SiteHeader current={current} instagramUrl={settings.instagram.url} />
      <main className="sub-main">{children}</main>
      <SiteFooter settings={settings} mark={false} />
    </div>
  );
}
