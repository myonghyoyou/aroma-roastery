import { cacheLife, cacheTag } from 'next/cache';
import { getInstagramPosts, INSTAGRAM_TAG } from '@/lib/instagram';

/*
 * Content layer. Every page reads store info and posts through these functions only.
 * Archive and news posts both come from the store's Instagram (see instagram.ts: #소식 makes a post
 * news). Until the account is connected the sample feed and the sample notices below stand in, and
 * store info stays the sample content from the approved draft.
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
  /** Naver Map */
  mapUrl: string;
  kakaoMapUrl: string;
  /** the online shop (Naver Smart Store) */
  storeUrl: string;
  instagram: { handle: string; url: string };
  /** media surfaced behind the hero passage and the store section */
  passageMedia: Media;
  storeMedia: Media;
};

export type PostType = 'archive' | 'news';

/** Archive posts are filed under one of these. */
export type ArchiveCategory = 'roasting' | 'cupping' | 'event' | 'store';

/** News posts are filed under one of these. */
export type NewsTopic = 'hours' | 'closure' | 'beans' | 'event' | 'notice';

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
  /** news posts only */
  topic?: NewsTopic;
  /** news only: kept at the top of the list while it matters */
  pinned?: boolean;
  /** news only: the day (or days) the notice is about, e.g. a closure or an event; yyyy-mm-dd */
  period?: { start: string; end?: string };
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
  kakaoMapUrl: 'https://place.map.kakao.com/927360490',
  storeUrl: 'https://smartstore.naver.com/aroma_roastery',
  instagram: { handle: '@aroma_roastery', url: 'https://instagram.com/aroma_roastery' },
  // both clips carry a generator mark in the lower right corner: trimmed off, never shown
  passageMedia: { src: '/assets/video/barista-pouring.mp4', kind: 'video', alt: '바리스타가 드리퍼에 물을 붓는 모습', poster: '/assets/img/photo-barista-pourover-bar.jpg', trimRight: 0.05, trimBottom: 0.06 },
  storeMedia: { src: '/assets/video/coffee-pour-tap.mp4', kind: 'video', alt: '커피 탭에서 유리잔으로 커피가 내려지는 모습', poster: '/assets/img/photo-coffee-tap-bar.jpg', focusY: 0.62, trimBottom: 0.13 },
};

// clips the home page plays for its four featured posts
const CLIP = {
  serverSteam: { src: '/assets/video/server-steaming.mp4', kind: 'video', alt: '김이 오르는 서버와 원두 카드', crop: 9 / 16, poster: '/assets/img/photo-kainamui-card-steam.jpg' },
  dripper: { src: '/assets/video/dripper-pour.mp4', kind: 'video', alt: '드리퍼에 물을 붓는 모습', poster: '/assets/img/photo-pourover-dripper-closeup.jpg', focusY: 0.38, trimBottom: 0.12 },
  serverVapor: { src: '/assets/video/server-vapor.mp4', kind: 'video', alt: '김이 오르는 유리 서버와 바리스타', poster: '/assets/img/photo-server-barista-bokeh.jpg', focusY: 0.6, trimBottom: 0.12 },
  cupPour: { src: '/assets/video/cup-pour.mp4', kind: 'video', alt: '서버에서 잔으로 커피를 따르는 모습', poster: '/assets/img/photo-coffee-pour-cup.jpg', focusY: 0.55, trimBottom: 0.12 },
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
    slug: 'closure-roaster-maintenance', type: 'news', topic: 'closure', title: '로스터 점검 휴무 안내', date: '2026-10-08', period: { start: '2026-10-21' },
    summary: '로스터 정기 점검으로 10월 21일 하루 쉬어 갑니다.', sample: true,
    body: [
      { type: 'paragraph', text: '10월 21일(수)은 로스터 정기 점검으로 매장을 하루 쉽니다.' },
      { type: 'list', items: ['휴무일 2026년 10월 21일(수)', '다음 날부터 평소 영업시간으로 운영합니다'] },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'hand-drip-class-october', type: 'news', topic: 'event', title: '10월 핸드드립 클래스', date: '2026-10-05', period: { start: '2026-10-18' },
    summary: '집에서 내리는 핸드드립을 바리스타와 함께 연습하는 소규모 클래스입니다.', sample: true,
    cover: { src: '/assets/mock/drip-full.jpg', kind: 'image', alt: '스케일 위 드리퍼에 물을 붓는 모습' },
    body: [
      { type: 'paragraph', text: '바리스타와 함께 핸드드립의 분쇄도, 물 온도, 붓는 속도를 차례로 연습합니다.' },
      { type: 'list', items: ['일시 2026년 10월 18일(일) 14:00', '장소 아로마로스터리 매장', '인원 6명'] },
      { type: 'paragraph', text: '참여 신청은 매장에서 받습니다.' },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'cupping-open-session', type: 'news', topic: 'event', title: '오픈 커핑 세션', date: '2026-09-22', period: { start: '2026-09-27' },
    summary: '입고된 원두를 나란히 맛보는 커핑에 함께하실 분을 모십니다.', sample: true,
    cover: { src: '/assets/mock/steam-full.jpg', kind: 'image', alt: '김이 오르는 서버와 원두 카드' },
    body: [
      { type: 'paragraph', text: '최근 입고된 원두를 같은 조건으로 내려 나란히 맛봅니다.' },
      { type: 'list', items: ['일시 2026년 9월 27일(일) 11:00', '장소 아로마로스터리 매장'] },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'closure-september', type: 'news', topic: 'closure', title: '9월 임시 휴무 안내', date: '2026-09-04', period: { start: '2026-09-09' },
    summary: '매장 사정으로 9월 9일 하루 임시 휴무합니다.', sample: true,
    body: [
      { type: 'paragraph', text: '9월 9일(수)은 매장 사정으로 하루 쉽니다. 이용에 참고 부탁드립니다.' },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'new-beans-ethiopia', type: 'news', topic: 'beans', title: '원두 입고 안내: 에티오피아', date: '2026-08-28',
    summary: '에티오피아 원두가 매장에 들어왔습니다.', sample: true,
    cover: { src: '/assets/mock/cup-card.jpg', kind: 'image', alt: '트레이 위 원두 카드' },
    body: [
      { type: 'paragraph', text: '에티오피아 원두가 입고되었습니다. 매장 브루 바에서 맛보실 수 있습니다.' },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'parking-notice', type: 'news', topic: 'notice', title: '주차 안내', date: '2026-08-03',
    summary: '매장 방문 시 주차 이용 방법을 안내합니다.', sample: true,
    body: [
      { type: 'paragraph', text: '매장이 있는 건물의 주차 이용 방법은 매장에 문의해 주세요.' },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'new-beans-colombia', type: 'news', topic: 'beans', title: '원두 입고 안내: 콜롬비아', date: '2026-07-30',
    summary: '콜롬비아 원두가 매장에 들어왔습니다.', sample: true,
    cover: { src: '/assets/mock/bar-cards.jpg', kind: 'image', alt: '진열대에 꽂힌 원두 카드' },
    body: [
      { type: 'paragraph', text: '콜롬비아 원두가 입고되었습니다. 매장 브루 바에서 맛보실 수 있습니다.' },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'summer-hours', type: 'news', topic: 'hours', title: '여름 영업시간 안내', date: '2026-07-01',
    summary: '7월과 8월 영업시간을 안내합니다.', sample: true,
    body: [
      { type: 'paragraph', text: '7월과 8월에는 아래 시간으로 운영합니다.' },
      { type: 'list', items: ['평일 08:00-18:00', '주말·공휴일 12:00-18:00'] },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'payment-notice', type: 'news', topic: 'notice', title: '결제 수단 안내', date: '2026-06-20',
    summary: '매장에서 사용할 수 있는 결제 수단을 안내합니다.', sample: true,
    body: [
      { type: 'paragraph', text: '매장에서 사용할 수 있는 결제 수단은 매장에서 확인해 주세요.' },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'personal-cup-notice', type: 'news', topic: 'notice', title: '개인 컵 사용 안내', date: '2026-06-10',
    summary: '음료를 개인 컵에 담아 드립니다.', sample: true,
    cover: { src: '/assets/mock/cup-close.jpg', kind: 'image', alt: '하얀 잔과 받침' },
    body: [
      { type: 'paragraph', text: '가져오신 개인 컵에 음료를 담아 드립니다. 주문하실 때 말씀해 주세요.' },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'october-store-hours', type: 'news', topic: 'hours', pinned: true, title: '10월 매장 운영 안내', date: '2026-09-30',
    summary: '10월 영업시간과 휴무일을 안내합니다.', sample: true,
    cover: { src: '/assets/img/photo-server-barista-bokeh.jpg', kind: 'image', alt: '유리 서버 너머의 바리스타' },
    body: [
      { type: 'paragraph', text: '10월 매장 운영 시간을 안내합니다. 운영 시간이 바뀌는 날은 이 글과 인스타그램에 함께 알립니다.' },
      { type: 'list', items: ['평일 08:00-18:00', '주말·공휴일 12:00-18:00'] },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'new-beans-kenya-kainamui', type: 'news', topic: 'beans', title: '원두 입고 안내: 케냐 카이나무이', date: '2026-09-08',
    summary: '케냐 카이나무이 원두가 매장에 들어왔습니다.', sample: true,
    cover: { src: '/assets/img/photo-kainamui-card-steam.jpg', kind: 'image', alt: '김이 오르는 서버와 카이나무이 원두 카드' },
    body: [
      { type: 'paragraph', text: '케냐 카이나무이 원두가 입고되었습니다. 매장 브루 바에서 맛보실 수 있습니다.' },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'chuseok-holiday-hours', type: 'news', topic: 'hours', title: '추석 연휴 영업 안내', date: '2026-09-18', period: { start: '2026-09-24', end: '2026-09-27' },
    summary: '추석 연휴 기간의 영업시간을 안내합니다.', sample: true,
    body: [
      { type: 'paragraph', text: '추석 연휴 기간에는 공휴일 영업시간으로 운영합니다.' },
      { type: 'list', items: ['공휴일 12:00-18:00'] },
      { type: 'paragraph', text: '이 글은 소식 페이지 구성을 보여주기 위한 예시입니다.' },
    ],
  },
  {
    slug: 'temporary-closure-august', type: 'news', topic: 'closure', title: '임시 휴무 안내', date: '2026-08-12', period: { start: '2026-08-19' },
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
  cacheTag(INSTAGRAM_TAG);
  // connected, news and archive both come from Instagram; until then the sample notices stand in
  const ig = await getInstagramPosts();
  const posts = (ig.live ? ig.posts : [...SAMPLE_NEWS, ...ig.posts]).sort((a, b) => b.date.localeCompare(a.date));
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
  cacheTag(INSTAGRAM_TAG);
  const posts = await allPosts();
  return type ? posts.filter((p) => p.type === type) : posts;
}

export async function getPost(type: PostType, slug: string): Promise<Post | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(INSTAGRAM_TAG);
  return (await allPosts()).find((p) => p.type === type && p.slug === slug) ?? null;
}

/** The neighbours of a post inside its own type, newest first. */
export async function getAdjacentPosts(post: Post): Promise<{ newer: Post | null; older: Post | null }> {
  const list = await getPosts(post.type);
  const i = list.findIndex((p) => p.slug === post.slug);
  return { newer: list[i - 1] ?? null, older: list[i + 1] ?? null };
}

export { CATEGORY_LABEL, formatDate, postHref, TYPE_LABEL } from '@/lib/post-utils';
