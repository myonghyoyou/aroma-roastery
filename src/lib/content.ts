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
  /** vertical point (0 top, 1 bottom) a wide screen centres on when it crops a tall clip */
  focusY?: number;
  /** share of the frame height cut from the bottom, e.g. to drop a generator watermark */
  trimBottom?: number;
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

/** Post body, block by block. The Notion renderer will map Notion blocks onto these. */
export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'media'; media: Media; caption?: string };

export type Post = {
  slug: string;
  type: PostType;
  title: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  /** one line for lists and the page description */
  summary: string;
  /** optional: notices often have no picture */
  cover?: Media;
  body: Block[];
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
  passageMedia: { src: '/assets/video/barista-pouring.mp4', kind: 'video', alt: '바리스타가 드리퍼에 물을 붓는 모습', poster: '/assets/img/photo-barista-pourover-bar.jpg' },
  storeMedia: { src: '/assets/video/coffee-pour-glass.mp4', kind: 'video', alt: '커피 탭에서 유리잔으로 커피가 내려지는 모습', poster: '/assets/img/photo-coffee-tap-bar.jpg' },
};

const V = {
  serverSteam: { src: '/assets/video/server-steaming.mp4', kind: 'video', alt: '김이 오르는 서버와 원두 카드', crop: 9 / 16, poster: '/assets/img/photo-kainamui-card-steam.jpg' },
  dripper: { src: '/assets/video/dripper-pour.mp4', kind: 'video', alt: '드리퍼에 물을 붓는 모습', poster: '/assets/img/photo-pourover-dripper-closeup.jpg', focusY: 0.38, trimBottom: 0.12 },
  serverVapor: { src: '/assets/video/server-vapor.mp4', kind: 'video', alt: '김이 오르는 유리 서버와 바리스타', poster: '/assets/img/photo-server-barista-bokeh.jpg', focusY: 0.6, trimBottom: 0.12 },
  cupPour: { src: '/assets/video/cup-pour.mp4', kind: 'video', alt: '서버에서 잔으로 커피를 따르는 모습', poster: '/assets/img/photo-coffee-pour-cup.jpg', focusY: 0.55, trimBottom: 0.12 },
  tapPour: { src: '/assets/video/coffee-pour-glass.mp4', kind: 'video', alt: '커피 탭에서 유리잔으로 커피가 내려지는 모습', poster: '/assets/img/photo-coffee-tap-bar.jpg' },
} satisfies Record<string, Media>;
const P = {
  bar: { src: '/assets/img/photo-barista-pourover-bar.jpg', kind: 'image', alt: '원두 카드가 놓인 브루 바에서 핸드드립을 내리는 바리스타' },
  tap: { src: '/assets/img/photo-coffee-tap-bar.jpg', kind: 'image', alt: '원두 그림 카드가 달린 커피 탭' },
  card: { src: '/assets/img/photo-kainamui-card-steam.jpg', kind: 'image', alt: '김이 오르는 서버와 카이나무이 원두 카드' },
  dripper: { src: '/assets/img/photo-pourover-dripper-closeup.jpg', kind: 'image', alt: '드리퍼에 물을 붓는 근접 사진' },
} satisfies Record<string, Media>;

// placeholder posts: neutral copy only, every one is shown with a "예시" tag until real posts exist
const SAMPLE_POSTS: Post[] = [
  {
    slug: 'october-store-hours', type: 'news', title: '10월 매장 운영 안내', date: '2026-09-30',
    summary: '10월 영업시간과 휴무일을 안내합니다.', cover: V.serverVapor, sample: true,
    body: [
      { type: 'paragraph', text: '10월 매장 운영 시간을 안내합니다. 운영 시간이 바뀌는 날은 이 글과 인스타그램에 함께 알립니다.' },
      { type: 'list', items: ['평일 08:00-18:00', '주말·공휴일 12:00-18:00'] },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'autumn-cupping-session', type: 'archive', title: '가을 커핑 세션 기록', date: '2026-09-27',
    summary: '같은 조건으로 내린 원두를 나란히 맛보며 기록했습니다.', cover: V.serverSteam, sample: true,
    body: [
      { type: 'paragraph', text: '커핑은 같은 분쇄도와 물 온도, 같은 시간으로 원두를 우려 향과 맛을 비교하는 과정입니다. 원두마다 다른 점을 기록해 로스팅과 추출에 반영합니다.' },
      { type: 'media', media: P.card, caption: '카이나무이 원두 카드' },
      { type: 'heading', text: '기록한 것' },
      { type: 'list', items: ['마른 향과 젖은 향', '산미와 단맛의 균형', '식으면서 달라지는 맛'] },
      { type: 'paragraph', text: '이 글은 아카이브 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'roasting-profile-kenya', type: 'archive', title: '로스팅 프로파일 노트: 케냐', date: '2026-09-12',
    summary: '케냐 원두의 로스팅 과정을 기록했습니다.', cover: V.dripper, sample: true,
    body: [
      { type: 'paragraph', text: '로스팅 프로파일은 원두에 열을 주는 시간과 온도의 흐름입니다. 같은 원두라도 프로파일에 따라 산미와 단맛이 달라집니다.' },
      { type: 'quote', text: '볶고, 내리고, 맛보고, 다시 볶습니다.' },
      { type: 'media', media: P.dripper },
      { type: 'paragraph', text: '이 글은 아카이브 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'new-beans-kenya-kainamui', type: 'news', title: '원두 입고 안내: 케냐 카이나무이', date: '2026-09-08',
    summary: '케냐 카이나무이 원두가 매장에 들어왔습니다.', cover: P.card, sample: true,
    body: [
      { type: 'paragraph', text: '케냐 카이나무이 원두가 입고되었습니다. 매장 브루 바에서 맛보실 수 있습니다.' },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'brew-bar-september', type: 'archive', title: '브루 바 9월 기록', date: '2026-09-05',
    summary: '9월 브루 바에서 내린 커피를 정리했습니다.', cover: V.cupPour, sample: true,
    body: [
      { type: 'paragraph', text: '브루 바에서는 직접 볶은 원두로 브루 커피와 배치 브루 커피를 내립니다.' },
      { type: 'media', media: P.bar },
      { type: 'paragraph', text: '이 글은 아카이브 페이지 구성을 보여주기 위한 예시입니다.' },
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
    slug: 'colombia-potosi-cupping', type: 'archive', title: '콜롬비아 포토시 커핑 노트', date: '2026-08-21',
    summary: '콜롬비아 포토시를 여러 추출 방식으로 맛본 기록입니다.', cover: P.tap, sample: true,
    body: [
      { type: 'paragraph', text: '한 원두를 여러 방식으로 내려 보면 원두가 가진 맛의 폭을 알 수 있습니다.' },
      { type: 'paragraph', text: '이 글은 아카이브 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'tap-lineup-summer', type: 'archive', title: '커피 탭 라인업 기록', date: '2026-08-02',
    summary: '커피 탭에 올린 커피를 기록했습니다.', cover: V.tapPour, sample: true,
    body: [
      { type: 'paragraph', text: '커피 탭의 그림 카드는 원두마다 하나씩 그려져 있습니다.' },
      { type: 'media', media: P.tap },
      { type: 'paragraph', text: '이 글은 아카이브 페이지 구성을 보여주기 위한 예시입니다.' },
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
  {
    slug: 'batch-brew-notes', type: 'archive', title: '배치 브루 레시피 정리', date: '2026-07-24',
    summary: '배치 브루를 내리는 기준을 정리했습니다.', cover: P.bar, sample: true,
    body: [
      { type: 'paragraph', text: '배치 브루는 한 번에 여러 잔을 일정한 맛으로 내리는 방식입니다.' },
      { type: 'paragraph', text: '이 글은 아카이브 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
];

export async function getSiteSettings(): Promise<SiteSettings> {
  'use cache';
  cacheLife('hours');
  return SAMPLE_SETTINGS;
}

/** Posts, newest first. */
export async function getPosts(type?: PostType): Promise<Post[]> {
  'use cache';
  cacheLife('hours');
  const posts = type ? SAMPLE_POSTS.filter((p) => p.type === type) : SAMPLE_POSTS;
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(type: PostType, slug: string): Promise<Post | null> {
  'use cache';
  cacheLife('hours');
  return SAMPLE_POSTS.find((p) => p.type === type && p.slug === slug) ?? null;
}

/** The neighbours of a post inside its own type, newest first. */
export async function getAdjacentPosts(post: Post): Promise<{ newer: Post | null; older: Post | null }> {
  const list = await getPosts(post.type);
  const i = list.findIndex((p) => p.slug === post.slug);
  return { newer: list[i - 1] ?? null, older: list[i + 1] ?? null };
}

export { formatDate, postHref, TYPE_LABEL } from '@/lib/post-utils';
