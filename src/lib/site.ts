import type { Metadata } from 'next';
import type { Post, SiteSettings } from '@/lib/content';

/*
 * What search engines and AI assistants read about the store: the site's address and names, the
 * share preview defaults, and the structured data (schema.org JSON-LD) for the store and its posts.
 */
export const SITE_URL = 'https://www.aroma-roastery.com';
export const SITE_NAME = '아로마 로스터리';
/** other names people search the store by */
export const SITE_ALT_NAMES = ['aroma roastery', '아로마로스터리', 'aroma coffee roastery & showroom'];
export const SITE_DESCRIPTION = '서울 강서구 마곡의 스페셜티 커피 로스터리 & 쇼룸, 아로마 로스터리입니다. 새로 들어온 원두와 영업시간, 휴무 소식을 전합니다.';

/** Share preview fields every page starts from; a page's own openGraph replaces the layout's whole. */
export function openGraphFor(path: string, extra: NonNullable<Metadata['openGraph']> = {}): Metadata['openGraph'] {
  return { type: 'website', locale: 'ko_KR', siteName: SITE_NAME, url: path, ...extra };
}

const abs = (path: string) => new URL(path, SITE_URL).toString();

/** "08:00-18:00" -> ["08:00", "18:00"] */
const span = (value: string) => value.split(/\s*[-~]\s*/);

/** The store as schema.org sees it, and the site itself (its name in search results). */
export function storeJsonLd(s: SiteSettings) {
  const [weekday, weekend] = s.hours;
  const hours = [
    weekday && { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], value: weekday.value },
    weekend && { days: ['Saturday', 'Sunday'], value: weekend.value },
  ].flatMap((h) => {
    if (!h) return [];
    const [opens, closes] = span(h.value);
    return opens && closes ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens, closes }] : [];
  });
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        inLanguage: 'ko-KR',
      },
      {
        '@type': 'CafeOrCoffeeShop',
        '@id': `${SITE_URL}/#store`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        description: SITE_DESCRIPTION,
        url: `${SITE_URL}/`,
        image: abs('/opengraph-image.jpg'),
        logo: abs('/assets/logo/aroma-symbol.svg'),
        telephone: s.phone.replace(/^0/, '+82-'),
        address: {
          '@type': 'PostalAddress',
          streetAddress: `${s.address.line2} ${s.address.building}`,
          addressLocality: '강서구',
          addressRegion: '서울특별시',
          addressCountry: 'KR',
        },
        openingHoursSpecification: hours,
        servesCuisine: '커피',
        hasMap: s.mapUrl,
        sameAs: [s.instagram.url, s.mapUrl, s.kakaoMapUrl, s.storeUrl],
      },
    ],
  };
}

/** A news post as an article from the store. */
export function postJsonLd(post: Post, path: string) {
  const image = post.cover?.kind === 'image' ? post.cover.src : post.cover?.poster;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    url: abs(path),
    mainEntityOfPage: abs(path),
    inLanguage: 'ko-KR',
    ...(image ? { image: abs(image) } : {}),
    author: { '@id': `${SITE_URL}/#store` },
    publisher: { '@id': `${SITE_URL}/#store` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
}

/** A JSON-LD script; "<" is escaped so a caption can never close the tag. */
export function jsonLdHtml(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
