import { cacheLife } from 'next/cache';

/*
 * Content layer. Every page reads store info and posts through these functions only.
 * Today they return the sample content from the approved draft; the Notion source
 * (a "posts" database and a "site settings" page, see the PRD) plugs in here later
 * without the pages changing.
 */

export type Media = {
  src: string;
  kind: 'image' | 'video';
  alt: string;
  /** a centred crop to this width/height ratio, for clips shot vertically inside a 16:9 frame */
  crop?: number;
  /** still shown instead of a video where WebGL is unavailable */
  poster?: string;
};

export type SiteSettings = {
  address: { line1: string; line2: string; building: string; storeName: string };
  hours: { label: string; value: string }[];
  mapUrl: string;
  instagram: { handle: string; url: string };
  /** media surfaced behind the hero passage and the store section */
  passageMedia: Media;
  storeMedia: Media;
};

export type PostType = 'archive' | 'news';

export type Post = {
  slug: string;
  type: PostType;
  title: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  cover: Media;
  /** true while the post is placeholder content, shown with a "예시" tag and not linked */
  sample: boolean;
};

const SAMPLE_SETTINGS: SiteSettings = {
  address: {
    line1: '서울시 강서구',
    line2: '마곡중앙8로 5길 63',
    building: '디엠프라자 107호',
    storeName: '아로마로스터리',
  },
  hours: [
    { label: '평일', value: '08:00-18:00' },
    { label: '주말·공휴일', value: '12:00-18:00' },
  ],
  mapUrl: 'https://naver.me/GoDXYZG3',
  instagram: { handle: '@aroma_roastery', url: 'https://instagram.com/aroma_roastery' },
  passageMedia: { src: '/assets/video/barista-pouring.mp4', kind: 'video', alt: '바리스타가 드리퍼에 물을 붓는 모습', poster: '/assets/img/photo-barista-pourover-bar.jpg' },
  storeMedia: { src: '/assets/video/coffee-pour-glass.mp4', kind: 'video', alt: '커피 탭에서 유리잔으로 커피가 내려지는 모습', poster: '/assets/img/photo-coffee-tap-bar.jpg' },
};

const SAMPLE_POSTS: Post[] = [
  {
    slug: 'autumn-cupping-session',
    type: 'archive',
    title: '가을 커핑 세션 기록',
    date: '2026-09-27',
    cover: { src: '/assets/video/server-steaming.mp4', kind: 'video', alt: '김이 오르는 서버와 원두 카드', crop: 9 / 16, poster: '/assets/img/photo-kainamui-card-steam.jpg' },
    sample: true,
  },
  {
    slug: 'roasting-profile-kenya',
    type: 'archive',
    title: '로스팅 프로파일 노트: 케냐',
    date: '2026-09-12',
    cover: { src: '/assets/img/photo-pourover-dripper-closeup.jpg', kind: 'image', alt: '드리퍼 근접 사진' },
    sample: true,
  },
  {
    slug: 'october-store-hours',
    type: 'news',
    title: '10월 매장 운영 안내',
    date: '2026-09-30',
    cover: { src: '/assets/img/photo-server-barista-bokeh.jpg', kind: 'image', alt: '유리 서버와 바리스타' },
    sample: true,
  },
  {
    slug: 'brew-bar-september',
    type: 'archive',
    title: '브루 바 9월 기록',
    date: '2026-09-05',
    cover: { src: '/assets/img/photo-coffee-pour-cup.jpg', kind: 'image', alt: '서버에서 잔으로 커피를 따르는 모습' },
    sample: true,
  },
];

export async function getSiteSettings(): Promise<SiteSettings> {
  'use cache';
  cacheLife('hours');
  return SAMPLE_SETTINGS;
}

/** Posts in display order. The home page shows the first four. */
export async function getPosts(type?: PostType): Promise<Post[]> {
  'use cache';
  cacheLife('hours');
  return type ? SAMPLE_POSTS.filter((p) => p.type === type) : SAMPLE_POSTS;
}

export const TYPE_LABEL: Record<PostType, string> = { archive: '아카이브', news: '소식' };

/** 2026-09-27 -> 2026.09.27 */
export function formatDate(iso: string): string {
  return iso.replaceAll('-', '.');
}
