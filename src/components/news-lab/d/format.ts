import type { Post } from '@/lib/content';

/* Plain helpers for concept D, safe on server and client. */

export const LIST_HREF = '/news-lab/d';

export function detailHref(slug: string): string {
  return `${LIST_HREF}/${slug}`;
}

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

/** 2026-10-21 -> 수 */
function weekday(iso: string): string {
  return WEEKDAY[new Date(`${iso}T00:00:00Z`).getUTCDay()];
}

/** 2026-10-21 -> 2026.10.21 (수), or 10.21 (수) when short */
function day(iso: string, short: boolean): string {
  const [y, m, d] = iso.split('-');
  return `${short ? '' : `${y}.`}${m}.${d} (${weekday(iso)})`;
}

/** The day or days a notice is about, with "~" for a range. */
export function formatPeriod(period: NonNullable<Post['period']>, short = false): string {
  const start = day(period.start, short);
  if (!period.end || period.end === period.start) return start;
  return `${start} ~ ${day(period.end, short)}`;
}

/** 2026-10 -> 2026년 10월 */
export function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  return `${y}년 ${Number(m)}월`;
}

/** Posts (already newest first) grouped by the month they were published. */
export function groupByMonth<T extends Pick<Post, 'date'>>(posts: T[]): { key: string; posts: T[] }[] {
  const groups: { key: string; posts: T[] }[] = [];
  for (const p of posts) {
    const key = p.date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.posts.push(p);
    else groups.push({ key, posts: [p] });
  }
  return groups;
}
