import { ViewTransition } from 'react';
import { GrainStage } from '@/components/home/GrainStage';
import { SiteFooter } from '@/components/site/SiteFooter';
import { BrandLink } from '@/components/site/BrandLink';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getSiteSettings, type Media } from '@/lib/content';
import { SLOT_COUNT } from '@/lib/grain-field/engine';

// filler for the slots after the passage and the store: never surfaced, because no zone on the page
// points at it. The news entries that used them (each with its own clip) left the home page on
// 2026-10-27: the news has its own page, and four fewer videos load here
const EMPTY_SLOT: Media = { src: '/assets/img/photo-barista-pourover-bar.jpg', kind: 'image', alt: '' };

function FallbackImage({ media }: { media: Media }) {
  const src = media.kind === 'video' ? media.poster : media.src;
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element -- shown only where WebGL is unavailable
  return <img className="ph-fallback" src={src} alt={media.alt} loading="lazy" />;
}

export default async function Home() {
  const settings = await getSiteSettings();
  const slots: Media[] = [settings.passageMedia, settings.storeMedia];
  while (slots.length < SLOT_COUNT) slots.push(EMPTY_SLOT);

  return (
    // on a 'tx-nav' navigation the page fades in and out over the field (page-transition.css)
    <ViewTransition
      enter={{ 'tx-nav': 'tx-in', default: 'none' }}
      exit={{ 'tx-nav': 'tx-out', default: 'none' }}
      default="none"
    >
    <GrainStage slots={slots}>
      <SiteHeader home />

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
            <span>아래로 스크롤</span>
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
              <dd className="store-links">
                <BrandLink href={settings.mapUrl} brand="naver-map" label="네이버 지도">네이버</BrandLink>
                <BrandLink href={settings.kakaoMapUrl} brand="kakao-map" label="카카오맵">카카오</BrandLink>
              </dd>
            </div>
            <div>
              <dt>온라인 스토어</dt>
              <dd><BrandLink href={settings.storeUrl} brand="store" label="네이버 스토어">스토어</BrandLink></dd>
            </div>
          </dl>
          <FallbackImage media={settings.storeMedia} />
          </div>
        </section>
      </main>

      <SiteFooter settings={settings} home />
    </GrainStage>
    </ViewTransition>
  );
}
