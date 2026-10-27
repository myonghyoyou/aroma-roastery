import Link from 'next/link';

type Section = 'archive' | 'news';

/** The archive is out of the menus for now (2026-10-27, its photos load too slowly); its pages still open by URL. */
export const ARCHIVE_IN_MENU = false;

const NAV: { href: string; label: string; section: Section }[] = [
  ...(ARCHIVE_IN_MENU ? [{ href: '/archive', label: '아카이브', section: 'archive' as const }] : []),
  { href: '/news', label: '소식', section: 'news' },
];

/** Top bar shared by every page. On the home page the symbol scrolls back to the top instead of navigating. */
export function SiteHeader({ current, home = false }: { current?: Section; home?: boolean }) {
  const symbol = (
    // eslint-disable-next-line @next/next/no-img-element -- small inline SVG logo
    <img className="symbol" src="/assets/logo/aroma-symbol.svg" alt="" />
  );
  return (
    <header className="topbar">
      {home ? (
        <a className="brand" href="#top" aria-label="aroma 처음으로">{symbol}</a>
      ) : (
        <Link className="brand" href="/" aria-label="aroma 처음으로" transitionTypes={['tx-nav']}>{symbol}</Link>
      )}
      <nav aria-label="주요 메뉴">
        <ul>
          {/* the symbol already leads home, but not everyone reads a logo as a button */}
          <li>{home ? <a href="#top">홈</a> : <Link href="/" transitionTypes={['tx-nav']}>홈</Link>}</li>
          {/* store info sits in the middle of the home scroll, so it gets its own way in from every page */}
          <li>{home ? <a href="#store">매장 정보</a> : <Link href="/#store" transitionTypes={['tx-nav']}>매장 정보</Link>}</li>
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={n.href} aria-current={current === n.section ? 'page' : undefined} transitionTypes={['tx-nav']}>{n.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
