import { cacheLife, cacheTag } from 'next/cache';
import type { ArchiveCategory, NewsTopic, Photo, Post } from '@/lib/content';
import { MOCK_INSTAGRAM } from '@/lib/mock-instagram';
import { readToken } from '@/lib/instagram-token';

/*
 * The archive and the news are the store's Instagram feed. Each Instagram post becomes one post.
 * The store does not tag its posts, so the caption itself decides (see fileByText):
 *   - a bean arrival (first sentence "... 입고됐습니다") is news about beans; a notice (휴무, 운영시간,
 *     배송, 할인, 이벤트 ...) is news, filed by its words: closure, hours, event, else notice
 *   - everything else goes to the archive: bean introductions, the owner's notes, emoji-only photos
 * Hashtags still win when a post has them, to correct a post the caption rule files wrongly:
 *   - #소식 makes it news (#영업시간 #휴무 #원두 #행사 #공지 pick the topic, #고정 keeps it first)
 *   - #아카이브, or an archive tag (#로스팅 #커핑 #행사 #협업 #매장, see CATEGORY_TAGS), makes it archive
 *   - #아카이브제외 keeps a post off the site
 *   - title: the caption's first line with words (hashtags removed); a bean arrival is titled by the
 *     bean ("과테말라 엘 소코로 게이샤 워시드 입고"); a post without words by its date
 *   - body: the remaining caption, paragraph by paragraph
 *   - photos: every image of the post (a carousel's children); a video shows its cover image
 * Once the store account is connected (/api/instagram/connect saves its token, see instagram-auth.ts)
 * the feed is read from Instagram; until then the sample feed stands in, tagged "예시".
 * INSTAGRAM_TOKEN can supply a token by hand instead.
 */

/** A post as the Instagram API returns it (the fields this site asks for). */
export type IgMedia = {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  /** ISO time, e.g. 2026-09-27T10:12:00+0000 */
  timestamp: string;
  children?: { data: IgChild[] };
};

export type IgChild = {
  id: string;
  media_type: 'IMAGE' | 'VIDEO';
  media_url?: string;
  thumbnail_url?: string;
  /** not sent by Instagram: the sample feed carries the size, the live feed measures the file */
  width?: number;
  height?: number;
  alt?: string;
};

export const CATEGORY_TAGS: Record<string, ArchiveCategory> = {
  로스팅: 'roasting',
  커핑: 'cupping',
  행사: 'event',
  협업: 'event',
  매장: 'store',
};
export const EXCLUDE_TAG = '아카이브제외';
/** a post with this tag is news, not archive */
export const NEWS_TAG = '소식';
/** a post with this tag is archive, whatever its caption says */
export const ARCHIVE_TAG = '아카이브';
export const TOPIC_TAGS: Record<string, NewsTopic> = {
  영업시간: 'hours',
  휴무: 'closure',
  원두: 'beans',
  행사: 'event',
  공지: 'notice',
};
/** keeps a news post first in the list */
export const PIN_TAG = '고정';
/** cache tag of everything read from Instagram: connecting the account expires it */
export const INSTAGRAM_TAG = 'instagram';

const TITLE_MAX = 40;
const SUMMARY_MAX = 80;
const HASHTAG = /#[^\s#]+/g;

// counted in characters, not UTF-16 units, so a cut never splits an emoji into a broken glyph
const clip = (s: string, max: number) => {
  const chars = Array.from(s);
  return chars.length > max ? `${chars.slice(0, max - 1).join('').trimEnd()}…` : s;
};
const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Some captions arrive with replacement characters (U+FFFD) or half an emoji: both show as a broken glyph. */
const sane = (s: string) =>
  s.replace(/�|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '');

/** A title without emoji (they stay in the body) and without a "[ ... ]" frame: "[ 🍒 Red Splash ]" → "Red Splash". */
const plainTitle = (s: string) =>
  s.replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}︎️‍﹖]/gu, '')
    .replace(/^\[\s*(.*?)\s*\]$/, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();

/**
 * A line without its trailing run of hashtags; a hashtag inside a sentence keeps its word. A line with
 * no letter or digit (an emoji, a lone dot, which the store often puts first) is dropped.
 */
const cleanLine = (line: string) => {
  const out = line.replace(/(?:\s*#[^\s#]+)+\s*$/, '').replace(/#([^\s#]+)/g, '$1').replace(/[ \t]{2,}/g, ' ').trim();
  return /[\p{L}\p{N}]/u.test(out) ? out : '';
};

/* ---------------- filing by the caption ---------------- */

/*
 * Read over the store's whole feed (229 posts, 2024-04 to 2026-10), the captions fall into:
 *   - bean arrivals, "... 커피가 입고됐습니다." as the first sentence → news
 *   - notices and events: closures, opening-hour changes, delivery dates, sales, renewals → news
 *   - bean introductions ("... 입니다." with tasting notes and the owner's thoughts on coffee), the
 *     2024 bean cards ("[ 🍒 Red Splash ] Colombia ..."), brand notes, emoji-only photos → archive
 * The client chose this split on 2026-10-19: only an arrival or a notice is news.
 */

/** the first sentence says a bean has arrived */
const ARRIVAL = /입고\s?(?:됐|되었|되어|했)/;
/** words only a notice or an event uses; a bean introduction or an essay does not */
const NOTICE_WORDS = /휴무|쉽니다|쉬어\s?갑니다|(?:운영|영업)\s?시간|임시|공지|배송|할인|프로모션|이벤트|리뉴얼|매거진|시음회|클래스|팝업/;
/** news topic of a notice by its words, first match wins (a closure notice often names an event too) */
const TOPIC_WORDS: [RegExp, NewsTopic][] = [
  [/휴무|쉽니다|쉬어\s?갑니다/, 'closure'],
  [/(?:운영|영업)\s?시간/, 'hours'],
  [/할인|프로모션|이벤트|시음회|클래스|팝업/, 'event'],
];

const firstSentence = (line: string) => line.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? line;

/** News or archive from the caption's words alone, for a post that carries no filing tag. */
export function fileByText(caption = ''): { type: 'news'; topic: NewsTopic } | { type: 'archive' } {
  const text = caption.replace(HASHTAG, ' ').replace(/@[\w.]+/g, ' ');
  if (ARRIVAL.test(firstSentence(parseCaption(caption).title))) return { type: 'news', topic: 'beans' };
  if (!NOTICE_WORDS.test(text)) return { type: 'archive' };
  return { type: 'news', topic: TOPIC_WORDS.find(([re]) => re.test(text))?.[1] ?? 'notice' };
}

/**
 * The bean's name from an arrival's first sentence: "과테말라 엘 소코로 게이샤 워시드 커피가
 * 입고됐습니다." gives "과테말라 엘 소코로 게이샤 워시드 입고". Null when the sentence has another shape.
 */
export function beanTitle(sentence: string): string | null {
  const arrived = sentence.match(/^(.{2,40}?)\s*(?:커피|원두)?(?:가|이)?\s*입고\s?(?:됐|되었|되어|했)/);
  return arrived ? `${arrived[1].replace(/\s*의$/, '').trim()} 입고` : null;
}

/** The title: the first line, or its first sentence when the line is too long to be one. */
function titleOf(line: string): string {
  if (line.length <= TITLE_MAX) return line;
  const first = line.match(/^.+?[.!?](?=\s|$)/)?.[0];
  return first && first.length <= TITLE_MAX ? first : clip(line, TITLE_MAX);
}

/** Instagram time to a yyyy-mm-dd date in Korea (UTC+9). */
function kstDate(timestamp: string): string {
  const t = Date.parse(timestamp.replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));
  return new Date(t + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/** The post's short code from its link (instagram.com/p/CODE/), which keeps its page address stable. */
function slugOf(m: IgMedia): string {
  return m.permalink.match(/instagram\.com\/(?:[^/]+\/)?(?:p|reel|tv)\/([^/?#]+)/)?.[1] ?? m.id;
}

type Parsed = { title: string; paragraphs: string[]; tags: string[] };

function parseCaption(caption = ''): Parsed {
  const tags = [...caption.matchAll(HASHTAG)].map((t) => t[0].slice(1));
  // paragraphs are separated by blank lines; lines made only of hashtags are dropped
  const blocks = caption
    .split(/\n\s*\n/)
    .map((b) => b.split('\n').map(cleanLine).filter(Boolean).join('\n'))
    .filter(Boolean);
  const [first = '', ...rest] = blocks;
  const [titleLine = '', ...firstRest] = first.split('\n');
  const paragraphs = firstRest.length ? [firstRest.join('\n'), ...rest] : rest;
  return { title: titleLine, paragraphs, tags };
}

/** The site's own address for a live photo, fixed per Instagram media id (see app/ig/[id]/route.ts). */
export const igPhotoPath = (id: string) => `/ig/${id}`;

function toPhotos(m: IgMedia, size: (c: IgChild) => { w: number; h: number }, live: boolean): Photo[] {
  const parts: IgChild[] = m.media_type === 'CAROUSEL_ALBUM'
    ? m.children?.data ?? []
    : [m as unknown as IgChild];
  return parts.flatMap((c) => {
    const src = c.media_type === 'VIDEO' ? c.thumbnail_url : c.media_url;
    if (!src) return [];
    const isVideo = c.media_type === 'VIDEO';
    return [{
      // Instagram's link changes on every read (a per-request _nc_gid), which made each hourly
      // refresh a new photo to the image resizer; the fixed path keeps its cache
      kind: 'image' as const, src: live ? igPhotoPath(c.id) : src, alt: c.alt ?? '', ...size(c),
      fromVideo: isVideo || undefined,
      video: isVideo ? c.media_url : undefined,
    }];
  });
}

/** One Instagram post as a news or archive post, or null when it is kept off the site. */
export function igToPost(m: IgMedia, size: (c: IgChild) => { w: number; h: number }, sample: boolean): Post | null {
  const caption = sane(m.caption ?? '');
  const { title, paragraphs, tags } = parseCaption(caption);
  if (tags.includes(EXCLUDE_TAG)) return null;
  const photos = toPhotos(m, size, !sample);
  if (!photos.length) return null;
  const date = kstDate(m.timestamp);
  const category = tags.map((t) => CATEGORY_TAGS[t]).find(Boolean);
  // the sample feed stands in for the archive only (SAMPLE_NEWS stands in for the news), so its
  // written captions do not make it news
  const byText = sample ? { type: 'archive' as const } : fileByText(caption);
  // a filing tag wins over the caption; #행사 is both a topic and a category, so #소식 decides
  const tagged = tags.includes(NEWS_TAG);
  const isNews = tagged || (!category && !tags.includes(ARCHIVE_TAG) && byText.type === 'news');
  const topic = (tagged ? tags.map((t) => TOPIC_TAGS[t]).find(Boolean) : undefined)
    ?? (byText.type === 'news' ? byText.topic : 'notice');
  const filing = isNews
    ? { type: 'news' as const, topic, pinned: tags.includes(PIN_TAG) || undefined }
    : { type: 'archive' as const, category };
  const bean = isNews && topic === 'beans' ? beanTitle(firstSentence(title)) : null;
  // a notice tucked into a bean introduction ("📌 9/22-9/30 할인 중입니다") is what makes it news,
  // so that sentence is the title, not the bean
  const notice = isNews && !bean && !NOTICE_WORDS.test(title)
    ? paragraphs.flatMap((p) => p.split(/(?<=[.!?])\s+|\n/)).find((s) => NOTICE_WORDS.test(s))
      ?.replace(/^(?:또한|그리고|그래서|참고로),?\s*/, '')
    : undefined;
  const heading = bean ?? (notice ? titleOf(notice) : title ? titleOf(title) : '');
  const name = plainTitle(heading) || `${date.replaceAll('-', '.')} ${isNews ? '소식' : '기록'}`;
  const alt = (p: Photo, i: number) => p.alt || `${name} 사진 ${i + 1}`;
  const body: { type: 'paragraph'; text: string }[] = [
    // a first line that did not fit the title is kept whole as the opening paragraph
    ...(heading !== title && title ? [{ type: 'paragraph' as const, text: title }] : []),
    ...paragraphs.map((text) => ({ type: 'paragraph' as const, text })),
  ];
  return {
    slug: slugOf(m),
    ...filing,
    title: name,
    date,
    summary: clip(oneLine(body[0]?.text ?? title), SUMMARY_MAX),
    untitled: !title || undefined,
    cover: { ...photos[0], alt: alt(photos[0], 0) },
    photos: photos.map((p, i) => ({ ...p, alt: alt(p, i) })),
    body,
    permalink: sample ? undefined : m.permalink,
    sample,
  };
}

/* ---------------- live feed ---------------- */

const FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{id,media_type,media_url,thumbnail_url}';
const MAX_PAGES = 6; // 50 posts a page; the store had about 230 posts in October 2026

async function fetchFeed(token: string): Promise<IgMedia[]> {
  const out: IgMedia[] = [];
  let url: string | undefined = `https://graph.instagram.com/me/media?fields=${encodeURIComponent(FIELDS)}&limit=50&access_token=${token}`;
  for (let page = 0; url && page < MAX_PAGES; page++) {
    const res: Response = await fetch(url);
    if (!res.ok) throw new Error(`Instagram feed ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json = (await res.json()) as { data: IgMedia[]; paging?: { next?: string } };
    out.push(...json.data);
    url = json.paging?.next;
  }
  return out;
}

/** Pixel size from the first bytes of a JPEG, PNG or WebP file; Instagram does not send it. */
async function measure(url: string): Promise<{ w: number; h: number } | null> {
  try {
    const res = await fetch(url, { headers: { Range: 'bytes=0-131071' } });
    const b = new Uint8Array(await res.arrayBuffer());
    const u16 = (i: number) => (b[i] << 8) | b[i + 1];
    if (b[0] === 0x89 && b[1] === 0x50) return { w: (u16(16) << 16) | u16(18), h: (u16(20) << 16) | u16(22) };
    if (b[0] === 0x52 && b[8] === 0x57) {
      const kind = String.fromCharCode(b[12], b[13], b[14], b[15]);
      if (kind === 'VP8X') return { w: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), h: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
      if (kind === 'VP8 ') return { w: (b[26] | (b[27] << 8)) & 0x3fff, h: (b[28] | (b[29] << 8)) & 0x3fff };
      if (kind === 'VP8L') {
        const n = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
        return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 };
      }
    }
    if (b[0] === 0xff && b[1] === 0xd8) {
      for (let i = 2; i + 9 < b.length; ) {
        if (b[i] !== 0xff) { i++; continue; }
        const marker = b[i + 1];
        // start-of-frame markers carry the size; skip DHT (c4), JPG (c8) and DAC (cc)
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { w: u16(i + 7), h: u16(i + 5) };
        i += 2 + u16(i + 2);
      }
    }
  } catch {}
  return null;
}

// Instagram's usual portrait frame, used when a file cannot be measured
const FALLBACK = { w: 1080, h: 1350 };

async function livePosts(token: string): Promise<{ posts: Post[]; media: Record<string, string> }> {
  const feed = await fetchFeed(token);
  const sizes = new Map<string, { w: number; h: number }>();
  const children = feed.flatMap((m) => (m.media_type === 'CAROUSEL_ALBUM' ? m.children?.data ?? [] : [m as IgChild]));
  for (let i = 0; i < children.length; i += 8) {
    await Promise.all(children.slice(i, i + 8).map(async (c) => {
      const src = c.media_type === 'VIDEO' ? c.thumbnail_url : c.media_url;
      if (src) sizes.set(c.id, (await measure(src)) ?? FALLBACK);
    }));
  }
  // where each fixed photo path reads from right now
  const media: Record<string, string> = {};
  for (const c of children) {
    const src = c.media_type === 'VIDEO' ? c.thumbnail_url : c.media_url;
    if (src) media[c.id] = src;
  }
  return { posts: feed.flatMap((m) => igToPost(m, (c) => sizes.get(c.id) ?? FALLBACK, false) ?? []), media };
}

/**
 * Posts from Instagram, news and archive mixed, with `live` false while the sample feed stands in
 * (the account is not connected yet).
 */
export async function getInstagramPosts(): Promise<{ live: boolean; posts: Post[]; media: Record<string, string> }> {
  'use cache';
  // media links from Instagram expire after a while, so the feed is read again every hour
  cacheLife('hours');
  cacheTag(INSTAGRAM_TAG);
  const token = (await readToken())?.token ?? process.env.INSTAGRAM_TOKEN;
  // a failed read throws on purpose: the site keeps serving the last good copy instead of samples
  if (token) return { live: true, ...(await livePosts(token)) };
  return {
    live: false,
    media: {},
    posts: MOCK_INSTAGRAM.flatMap((m) => igToPost(m, (c) => ({ w: c.width ?? FALLBACK.w, h: c.height ?? FALLBACK.h }), true) ?? []),
  };
}
