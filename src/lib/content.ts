import { cacheLife } from 'next/cache';
import { getInstagramArchive } from '@/lib/instagram';

/*
 * Content layer. Every page reads store info and posts through these functions only.
 * Archive posts come from the store's Instagram (see instagram.ts); store info and news are
 * still the sample content from the approved draft until their source is connected.
 */

export type Media = {
  src: string;
  kind: 'image' | 'video';
  alt: string;
  /** a centred crop to this width/height ratio, for clips shot vertically inside a 16:9 frame */
  crop?: number;
  /** still shown instead of a video where WebGL is unavailable */
  poster?: string;
  /** point (0 to 1) the crop centres on when the screen shows only part of the frame */
  focusX?: number;
  focusY?: number;
  /** shares of the frame cut from the bottom and right edges, e.g. to drop a generator watermark */
  trimBottom?: number;
  trimRight?: number;
  /** seconds the clip sinks into the field around its loop point: for clips whose camera never
      returns to its first framing, so the restart is hidden instead of seen as a jump */
  loopDip?: number;
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

/** Archive posts are filed under one of these. */
export type ArchiveCategory = 'roasting' | 'cupping' | 'event' | 'store';

/** A still photo with its pixel size, so layouts can reserve space and keep the ratio. */
export type Photo = Media & {
  kind: 'image'; w: number; h: number; caption?: string;
  /** the cover image of a video post: the site shows stills only, the video plays on Instagram */
  fromVideo?: boolean;
};

/** Post body, block by block. The Notion renderer will map Notion blocks onto these. */
export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'media'; media: Media; caption?: string }
  /** consecutive photos: 'pair' two side by side, 'grid' three or more, 'full' one across */
  | { type: 'gallery'; layout: 'pair' | 'grid' | 'full'; photos: Photo[] };

export type Post = {
  slug: string;
  type: PostType;
  /** archive posts only */
  category?: ArchiveCategory;
  title: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  /** one line for lists and the page description */
  summary: string;
  /** a photo; optional because notices often have none */
  cover?: Media;
  /** every photo of the post in reading order (archive posts carry many) */
  photos?: Photo[];
  body: Block[];
  /** a clip for the home page's colour field; list and post pages always show photos */
  homeClip?: Media;
  /** the post on Instagram, for archive posts read from the live feed */
  permalink?: string;
  /** true while the post is placeholder content, shown with a "예시" tag */
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
  // both clips carry a generator mark in the lower right corner: trimmed off, never shown
  passageMedia: { src: '/assets/video/barista-pouring.mp4', kind: 'video', alt: '바리스타가 드리퍼에 물을 붓는 모습', poster: '/assets/img/photo-barista-pourover-bar.jpg', trimRight: 0.05, trimBottom: 0.06 },
  storeMedia: { src: '/assets/video/coffee-pour-glass.mp4', kind: 'video', alt: '커피 탭에서 유리잔으로 커피가 내려지는 모습', poster: '/assets/img/photo-coffee-tap-bar.jpg', trimRight: 0.16, focusX: 0.68, focusY: 0.6, loopDip: 0.9 },
};

// clips the home page plays for its four featured posts
const CLIP = {
  serverSteam: { src: '/assets/video/server-steaming.mp4', kind: 'video', alt: '김이 오르는 서버와 원두 카드', crop: 9 / 16, poster: '/assets/img/photo-kainamui-card-steam.jpg' },
  dripper: { src: '/assets/video/dripper-pour.mp4', kind: 'video', alt: '드리퍼에 물을 붓는 모습', poster: '/assets/img/photo-pourover-dripper-closeup.jpg', focusY: 0.38, trimBottom: 0.12 },
  serverVapor: { src: '/assets/video/server-vapor.mp4', kind: 'video', alt: '김이 오르는 유리 서버와 바리스타', poster: '/assets/img/photo-server-barista-bokeh.jpg', focusY: 0.6, trimBottom: 0.12 },
  cupPour: { src: '/assets/video/cup-pour.mp4', kind: 'video', alt: '서버에서 잔으로 커피를 따르는 모습', poster: '/assets/img/photo-coffee-pour-cup.jpg', focusY: 0.55, trimBottom: 0.12, loopDip: 0.9 },
} satisfies Record<string, Media>;
const HOME_CLIPS: Record<string, Media> = {
  'october-store-hours': CLIP.serverVapor,
  'autumn-cupping-session': CLIP.serverSteam,
  'roasting-profile-kenya': CLIP.dripper,
  'brew-bar-september': CLIP.cupPour,
};

// placeholder notices: neutral copy only, every one is shown with a "예시" tag until real posts exist
const SAMPLE_NEWS: Post[] = [
  {
    slug: 'october-store-hours', type: 'news', title: '10월 매장 운영 안내', date: '2026-09-30',
    summary: '10월 영업시간과 휴무일을 안내합니다.', sample: true,
    cover: { src: '/assets/img/photo-server-barista-bokeh.jpg', kind: 'image', alt: '유리 서버 너머의 바리스타' },
    body: [
      { type: 'paragraph', text: '10월 매장 운영 시간을 안내합니다. 운영 시간이 바뀌는 날은 이 글과 인스타그램에 함께 알립니다.' },
      { type: 'list', items: ['평일 08:00-18:00', '주말·공휴일 12:00-18:00'] },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'new-beans-kenya-kainamui', type: 'news', title: '원두 입고 안내: 케냐 카이나무이', date: '2026-09-08',
    summary: '케냐 카이나무이 원두가 매장에 들어왔습니다.', sample: true,
    cover: { src: '/assets/img/photo-kainamui-card-steam.jpg', kind: 'image', alt: '김이 오르는 서버와 카이나무이 원두 카드' },
    body: [
      { type: 'paragraph', text: '케냐 카이나무이 원두가 입고되었습니다. 매장 브루 바에서 맛보실 수 있습니다.' },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'chuseok-holiday-hours', type: 'news', title: '추석 연휴 영업 안내', date: '2026-09-18',
    summary: '추석 연휴 기간의 영업시간을 안내합니다.', sample: true,
    body: [
      { type: 'paragraph', text: '추석 연휴 기간에는 공휴일 영업시간으로 운영합니다.' },
      { type: 'list', items: ['공휴일 12:00-18:00'] },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'temporary-closure-august', type: 'news', title: '임시 휴무 안내', date: '2026-08-12',
    summary: '매장 정비로 하루 쉬어 갑니다.', sample: true,
    body: [
      { type: 'paragraph', text: '매장 정비를 위해 하루 임시 휴무합니다. 이용에 참고 부탁드립니다.' },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
];

/**
 * Every post, newest first, with the home page's clips attached. The sample posts have clips picked
 * for them; live posts (whose slugs nobody knows in advance) take the clips in order, newest first.
 */
async function allPosts(): Promise<Post[]> {
  'use cache';
  cacheLife('hours');
  const posts = [...SAMPLE_NEWS, ...(await getInstagramArchive())].sort((a, b) => b.date.localeCompare(a.date));
  if (posts.some((p) => HOME_CLIPS[p.slug])) {
    return posts.map((p) => (HOME_CLIPS[p.slug] ? { ...p, homeClip: HOME_CLIPS[p.slug] } : p));
  }
  const pool = Object.values(HOME_CLIPS);
  return posts.map((p, i) => (i < pool.length ? { ...p, homeClip: pool[i] } : p));
}

export async function getSiteSettings(): Promise<SiteSettings> {
  'use cache';
  cacheLife('hours');
  return SAMPLE_SETTINGS;
}

/** Posts, newest first. */
export async function getPosts(type?: PostType): Promise<Post[]> {
  'use cache';
  cacheLife('hours');
  const posts = await allPosts();
  return type ? posts.filter((p) => p.type === type) : posts;
}

export async function getPost(type: PostType, slug: string): Promise<Post | null> {
  'use cache';
  cacheLife('hours');
  return (await allPosts()).find((p) => p.type === type && p.slug === slug) ?? null;
}

/** The neighbours of a post inside its own type, newest first. */
export async function getAdjacentPosts(post: Post): Promise<{ newer: Post | null; older: Post | null }> {
  const list = await getPosts(post.type);
  const i = list.findIndex((p) => p.slug === post.slug);
  return { newer: list[i - 1] ?? null, older: list[i + 1] ?? null };
}

export { CATEGORY_LABEL, formatDate, postHref, TYPE_LABEL } from '@/lib/post-utils';
