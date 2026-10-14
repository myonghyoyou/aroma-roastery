import Link from 'next/link';
import type { SiteSettings } from '@/lib/content';

/**
 * Footer shared by every page: address, hours and links. The large gradient wordmark closes the home
 * page only; subpages (archive, news) leave it out.
 */
export function SiteFooter({ settings, mark = true }: { settings: SiteSettings; mark?: boolean }) {
  const { address, hours, instagram, storeUrl } = settings;
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
          <li><Link href="/archive">아카이브</Link></li>
          <li><Link href="/news">소식</Link></li>
          <li><a href={storeUrl} target="_blank" rel="noopener">스토어</a></li>
          <li><a href={instagram.url} target="_blank" rel="noopener">Instagram</a></li>
        </ul>
      </div>
      <p className="copyright">© 2026 aroma roastery</p>
    </footer>
  );
}
