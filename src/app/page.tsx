import { GrainStage } from '@/components/home/GrainStage';
import { formatDate, getPosts, getSiteSettings, TYPE_LABEL, type Media } from '@/lib/content';
import { SLOT_COUNT } from '@/lib/grain-field/engine';

const HOME_ENTRIES = SLOT_COUNT - 2; // slots 0 and 1 belong to the passage and the store

// filler for unused slots: never surfaced, because no zone on the page points at it
const EMPTY_SLOT: Media = { src: '/assets/img/photo-barista-pourover-bar.jpg', kind: 'image', alt: '' };

function FallbackImage({ media }: { media: Media }) {
  const src = media.kind === 'video' ? media.poster : media.src;
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element -- shown only where WebGL is unavailable
  return <img className="ph-fallback" src={src} alt={media.alt} loading="lazy" />;
}

export default async function Home() {
  const [settings, posts] = await Promise.all([getSiteSettings(), getPosts()]);
  const entries = posts.slice(0, HOME_ENTRIES);
  const slots: Media[] = [settings.passageMedia, settings.storeMedia, ...entries.map((p) => p.cover)];
  while (slots.length < SLOT_COUNT) slots.push(EMPTY_SLOT);
  const hasSample = entries.some((p) => p.sample);
  const [weekday, weekend] = settings.hours;

  return (
    <GrainStage slots={slots}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="aroma 처음으로">
          {/* eslint-disable-next-line @next/next/no-img-element -- small inline SVG logo */}
          <img className="symbol" src="/assets/logo/aroma-symbol.svg" alt="" />
        </a>
        <nav aria-label="주요 메뉴">
          <ul>
            <li><a href="#archive">아카이브</a></li>
            <li><a href="#archive">소식</a></li>
            <li><a href={settings.instagram.url} target="_blank" rel="noopener">Instagram</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section className="hero" id="top">
          <h1 className="hero-sentence" lang="en">
            <span className="l">Aroma Roastery roasts</span>
            <span className="l">specialty coffee</span>
            <span className="l">that persuades.</span>
          </h1>
        </section>

        {/* scroll room for the colour-to-video passage; the picture itself is drawn by the shader */}
        <div className="passage" aria-hidden="true" />

        <section className="store" id="store" aria-labelledby="store-title" data-photo="1">
          <h2 id="store-title">매장 정보</h2>
          <address className="store-address">
            {settings.address.line1}
            <br />
            {settings.address.line2}
            <small>{settings.address.building} {settings.address.storeName}</small>
          </address>
          <dl className="store-facts">
            {settings.hours.map((h) => (
              <div key={h.label}><dt>{h.label}</dt><dd>{h.value}</dd></div>
            ))}
            <div>
              <dt>지도</dt>
              <dd><a href={settings.mapUrl} target="_blank" rel="noopener">네이버 지도에서 보기</a></dd>
            </div>
          </dl>
          <FallbackImage media={settings.storeMedia} />
        </section>

        <section className="archive" id="archive" aria-labelledby="archive-title">
          <div className="archive-head">
            <h2 id="archive-title">기록과 소식</h2>
            {hasSample && <span className="tag-sample">예시</span>}
          </div>
          {/* each entry's cover is surfaced by the shader while the entry crosses the middle of the screen.
              Sample entries are placeholders, so they are not links. */}
          <ol className="entries">
            {entries.map((p, i) => (
              <li key={p.slug} data-photo={i + 2}>
                <div className="meta">
                  <span>{TYPE_LABEL[p.type]}</span>
                  <time dateTime={p.date}>{formatDate(p.date)}</time>
                </div>
                <h3>{p.title}</h3>
                <FallbackImage media={p.cover} />
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-mark" role="img" aria-label="aroma" />
        <div className="footer-grid">
          <p>
            aroma coffee roastery &amp; showroom
            <br />
            {settings.address.line1} {settings.address.line2} {settings.address.building}
          </p>
          <p>
            {weekday.label} {weekday.value}
            <br />
            {weekend.label} {weekend.value}
          </p>
          <ul>
            <li><a href="#archive">아카이브</a></li>
            <li><a href="#archive">소식</a></li>
            <li><a href={settings.instagram.url} target="_blank" rel="noopener">Instagram</a></li>
          </ul>
        </div>
        <p className="copyright">© 2026 aroma roastery</p>
      </footer>
    </GrainStage>
  );
}
