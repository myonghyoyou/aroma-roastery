import Link from 'next/link';
import type { SiteSettings } from '@/lib/content';

/** Footer shared by every page: the gradient wordmark, address, hours and links. */
export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const { address, hours, instagram } = settings;
  return (
    <footer className="site-footer">
      <div className="footer-mark" role="img" aria-label="aroma" />
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
          <li><a href={instagram.url} target="_blank" rel="noopener">Instagram</a></li>
        </ul>
      </div>
      <p className="copyright">© 2026 aroma roastery</p>
    </footer>
  );
}
