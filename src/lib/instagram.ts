import { cacheLife, cacheTag } from 'next/cache';
import type { ArchiveCategory, Block, Photo, Post } from '@/lib/content';
import { MOCK_INSTAGRAM } from '@/lib/mock-instagram';
import { readToken } from '@/lib/instagram-token';

/*
 * The archive is the store's Instagram feed. Each Instagram post becomes one archive post:
 *   - title: the caption's first line (hashtags removed)
 *   - body: the remaining caption, paragraph by paragraph
 *   - category: a hashtag, see CATEGORY_TAGS; #아카이브제외 keeps a post off the site
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
/** cache tag of everything read from Instagram: connecting the account expires it */
export const INSTAGRAM_TAG = 'instagram';

const TITLE_MAX = 40;
const SUMMARY_MAX = 80;
const HASHTAG = /#[^\s#]+/g;

const clip = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);
const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim();

/** A line without its trailing run of hashtags; a hashtag inside a sentence keeps its word. */
const cleanLine = (line: string) =>
  line.replace(/(?:\s*#[^\s#]+)+\s*$/, '').replace(/#([^\s#]+)/g, '$1').replace(/[ \t]{2,}/g, ' ').trim();

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

function toPhotos(m: IgMedia, size: (c: IgChild) => { w: number; h: number }): Photo[] {
  const parts: IgChild[] = m.media_type === 'CAROUSEL_ALBUM'
    ? m.children?.data ?? []
    : [m as unknown as IgChild];
  return parts.flatMap((c) => {
    const src = c.media_type === 'VIDEO' ? c.thumbnail_url : c.media_url;
    if (!src) return [];
    return [{ kind: 'image' as const, src, alt: c.alt ?? '', ...size(c), fromVideo: c.media_type === 'VIDEO' || undefined }];
  });
}

/** One Instagram post as an archive post, or null when it is kept off the site. */
export function igToPost(m: IgMedia, size: (c: IgChild) => { w: number; h: number }, sample: boolean): Post | null {
  const { title, paragraphs, tags } = parseCaption(m.caption);
  if (tags.includes(EXCLUDE_TAG)) return null;
  const photos = toPhotos(m, size);
  if (!photos.length) return null;
  const date = kstDate(m.timestamp);
  const category = tags.map((t) => CATEGORY_TAGS[t]).find(Boolean);
  const name = title ? titleOf(title) : `${date.replaceAll('-', '.')} 기록`;
  const alt = (p: Photo, i: number) => p.alt || `${name} 사진 ${i + 1}`;
  const body: Block[] = [
    // a first line that did not fit the title is kept whole as the opening paragraph
    ...(name !== title && title ? [{ type: 'paragraph' as const, text: title }] : []),
    ...paragraphs.map((text) => ({ type: 'paragraph' as const, text })),
  ];
  return {
    slug: slugOf(m),
    type: 'archive',
    category,
    title: name,
    date,
    summary: clip(oneLine(paragraphs[0] ?? title), SUMMARY_MAX),
    cover: { ...photos[0], alt: alt(photos[0], 0) },
    photos: photos.map((p, i) => ({ ...p, alt: alt(p, i) })),
    body,
    permalink: sample ? undefined : m.permalink,
    sample,
  };
}

/* ---------------- live feed ---------------- */

const FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{id,media_type,media_url,thumbnail_url}';
const MAX_PAGES = 4; // 50 posts a page

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

async function livePosts(token: string): Promise<Post[]> {
  const feed = await fetchFeed(token);
  const sizes = new Map<string, { w: number; h: number }>();
  const children = feed.flatMap((m) => (m.media_type === 'CAROUSEL_ALBUM' ? m.children?.data ?? [] : [m as IgChild]));
  for (let i = 0; i < children.length; i += 8) {
    await Promise.all(children.slice(i, i + 8).map(async (c) => {
      const src = c.media_type === 'VIDEO' ? c.thumbnail_url : c.media_url;
      if (src) sizes.set(c.id, (await measure(src)) ?? FALLBACK);
    }));
  }
  return feed.flatMap((m) => igToPost(m, (c) => sizes.get(c.id) ?? FALLBACK, false) ?? []);
}

/** Archive posts from Instagram (or the sample feed), newest first. */
export async function getInstagramArchive(): Promise<Post[]> {
  'use cache';
  // media links from Instagram expire after a while, so the feed is read again every hour
  cacheLife('hours');
  cacheTag(INSTAGRAM_TAG);
  const token = (await readToken())?.token ?? process.env.INSTAGRAM_TOKEN;
  // a failed read throws on purpose: the site keeps serving the last good copy instead of samples
  if (token) return livePosts(token);
  return MOCK_INSTAGRAM.flatMap((m) => igToPost(m, (c) => ({ w: c.width ?? FALLBACK.w, h: c.height ?? FALLBACK.h }), true) ?? []);
}
