import type { NewsTopic, Post } from '@/lib/content';
import { formatDate } from '@/lib/post-utils';

/* Plain data for the notice board: safe to hand from the server pages to the client list. */

export const LIST_HREF = '/news-lab/a';
export const PER_PAGE = 8;
export const TOPICS: NewsTopic[] = ['hours', 'closure', 'beans', 'event', 'notice'];

export type BoardRow = {
  slug: string;
  /** board number: the oldest notice is 1, counting up to the newest */
  no: number;
  title: string;
  summary: string;
  date: string;
  topic?: NewsTopic;
  pinned: boolean;
};

export function rowHref(slug: string): string {
  return `${LIST_HREF}/${slug}`;
}

/** posts arrive newest first, so the board number counts down the list */
export function toRows(posts: Post[]): BoardRow[] {
  return posts.map((p, i) => ({
    slug: p.slug,
    no: posts.length - i,
    title: p.title,
    summary: p.summary,
    date: p.date,
    topic: p.topic,
    pinned: Boolean(p.pinned),
  }));
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 2026-10-21 -> 2026.10.21(수) */
export function dateWithDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${formatDate(iso)}(${WEEKDAYS[day]})`;
}
