import Link from 'next/link';
import type { SiteSettings } from '@/lib/content';
import { ARCHIVE_IN_MENU } from './SiteHeader';

/**
 * Footer shared by every page: address, hours and links, the same places as the top menu. The large
 * gradient wordmark closes the home page only; subpages (archive, news) leave it out. On the home page
 * 홈 and 매장 정보 are its own panels, reached by hash like the top menu does.
 */
export function SiteFooter({ settings, mark = true, home = false }: { settings: SiteSettings; mark?: boolean; home?: boolean }) {
  const { address, hours, instagram, storeUrl } = settings;
  // links to the archive and news carry the type the page transitions key on
  const types = ['tx-nav'];
  return (
    <footer className="site-footer">
      {mark && <div className="footer-mark-wrap"><div className="footer-mark" role="img" aria-label="aroma" /></div>}
      <div className="footer-grid">
        <p>
          aroma coffee roastery &amp; showroom
          <br />
          {address.line1} {address.line2} {address.building}
        </p>
        <p>
          {hours.map((h, i) => (
            <span key={h.label}>
              {i > 0 && <br />}
              {h.label} {h.value}
            </span>
          ))}
        </p>
        <ul>
          <li>{home ? <a href="#top">홈</a> : <Link href="/" transitionTypes={types}>홈</Link>}</li>
          <li>{home ? <a href="#store">매장 정보</a> : <Link href="/#store" transitionTypes={types}>매장 정보</Link>}</li>
          {ARCHIVE_IN_MENU && <li><Link href="/archive" transitionTypes={types}>아카이브</Link></li>}
          <li><Link href="/news" transitionTypes={types}>소식</Link></li>
          <li><a href={storeUrl} target="_blank" rel="noopener">스토어</a></li>
          <li><a href={instagram.url} target="_blank" rel="noopener">Instagram</a></li>
        </ul>
      </div>
      <p className="copyright">© 2026 aroma roastery</p>
    </footer>
  );
}
