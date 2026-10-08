import Link from 'next/link';

type Section = 'archive' | 'news';

const NAV: { href: string; label: string; section: Section }[] = [
  { href: '/archive', label: '아카이브', section: 'archive' },
  { href: '/news', label: '소식', section: 'news' },
];

/** Top bar shared by every page. On the home page the symbol scrolls back to the top instead of navigating. */
export function SiteHeader({ current, instagramUrl, home = false }: { current?: Section; instagramUrl: string; home?: boolean }) {
  const symbol = (
    // eslint-disable-next-line @next/next/no-img-element -- small inline SVG logo
    <img className="symbol" src="/assets/logo/aroma-symbol.svg" alt="" />
  );
  return (
    <header className="topbar">
      {home ? (
        <a className="brand" href="#top" aria-label="aroma 처음으로">{symbol}</a>
      ) : (
        <Link className="brand" href="/" aria-label="aroma 처음으로">{symbol}</Link>
      )}
      <nav aria-label="주요 메뉴">
        <ul>
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={n.href} aria-current={current === n.section ? 'page' : undefined}>{n.label}</Link>
            </li>
          ))}
          <li><a href={instagramUrl} target="_blank" rel="noopener">Instagram</a></li>
        </ul>
      </nav>
    </header>
  );
}
