import Link from 'next/link';
import { GrainStage } from '@/components/home/GrainStage';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { formatDate, getPosts, getSiteSettings, postHref, TYPE_LABEL, type Media, type Post } from '@/lib/content';
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
  // the newest posts that carry a home clip: each one owns a shader slot
  const entries = posts.filter((p): p is Post & { homeClip: Media } => !!p.homeClip).slice(0, HOME_ENTRIES);
  const slots: Media[] = [settings.passageMedia, settings.storeMedia, ...entries.map((p) => p.homeClip)];
  while (slots.length < SLOT_COUNT) slots.push(EMPTY_SLOT);
  const hasSample = entries.some((p) => p.sample);

  return (
    <GrainStage slots={slots}>
      <SiteHeader home instagramUrl={settings.instagram.url} />

      <main>
        <section className="hero" id="top">
          <h1 className="hero-sentence">
            <span className="l">아로마 로스터리는</span>
            <span className="l">설득력 있는 스페셜티 커피를</span>
            <span className="l">로스팅 합니다.</span>
            <span className="en" lang="en">Aroma Roastery roasts specialty coffee that persuades.</span>
          </h1>
          {/* first-time readers saw one finished screen and never scrolled; this says there is more below */}
          <div className="scroll-cue" aria-hidden="true">
            <span>아래로</span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" />
            </svg>
          </div>
        </section>

        {/* scroll room for the colour-to-video passage; the picture itself is drawn by the shader */}
        <div className="passage" aria-hidden="true" />

        <section className="store" id="store" aria-labelledby="store-title" data-photo="1">
          <div className="panel-copy store-copy" data-panel>
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
          </div>
        </section>

        <section className="archive" id="archive" aria-labelledby="archive-title">
          <div className="archive-head" data-panel>
            <h2 id="archive-title">기록과 소식</h2>
            {hasSample && <span className="tag-sample">예시</span>}
          </div>
          {/* each entry's cover is surfaced by the shader while the entry crosses the middle of the screen */}
          <ol className="entries">
            {entries.map((p, i) => (
              <li key={p.slug} data-photo={i + 2}>
                <div className="panel-copy entry-copy" data-panel>
                <div className="meta">
                  <span>{TYPE_LABEL[p.type]}</span>
                  <time dateTime={p.date}>{formatDate(p.date)}</time>
                </div>
                <h3><Link href={postHref(p)}>{p.title}</Link></h3>
                <FallbackImage media={p.homeClip} />
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <SiteFooter settings={settings} />
    </GrainStage>
  );
}
