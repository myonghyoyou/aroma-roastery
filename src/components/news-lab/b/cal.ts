import type { NewsTopic, Post } from '@/lib/content';
import { formatDate } from '@/lib/post-utils';

/*
 * Calendar helpers for news concept B (operating calendar). Pure functions on yyyy-mm-dd strings,
 * every weekday computed in UTC so the server and the browser never disagree. Safe on both sides.
 */

/** The plain slice of a post the client calendar needs (no body, no media). */
export type NewsItem = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  topic: NewsTopic;
  pinned: boolean;
  sample: boolean;
  period: { start: string; end: string } | null;
};

export const LIST_HREF = '/news-lab/b';
export const itemHref = (slug: string) => `${LIST_HREF}/${slug}`;

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const WEEKDAY_LONG = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

/** Drawing order on a day cell: a closure outranks everything else that day. */
export const TOPIC_ORDER: NewsTopic[] = ['closure', 'event', 'hours', 'beans', 'notice'];

export function toItem(post: Post): NewsItem {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    summary: post.summary,
    topic: post.topic ?? 'notice',
    pinned: post.pinned ?? false,
    sample: post.sample,
    period: post.period ? { start: post.period.start, end: post.period.end ?? post.period.start } : null,
  };
}

function utc(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function isoOf(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function weekday(iso: string): string {
  return WEEKDAYS[utc(iso).getUTCDay()];
}

/** "2026-10-21" to "2026.10.21(수)" */
export function dayLabel(iso: string): string {
  return `${formatDate(iso)}(${weekday(iso)})`;
}

/** "10.21(수)" */
export function shortDayLabel(iso: string): string {
  return `${iso.slice(5, 7)}.${iso.slice(8, 10)}(${weekday(iso)})`;
}

/** "2026년 10월 21일 수요일" */
export function spokenDay(iso: string): string {
  const d = utc(iso);
  return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${WEEKDAY_LONG[d.getUTCDay()]}`;
}

/** single day, or "start ~ end" */
export function rangeLabel(period: { start: string; end: string }): string {
  return period.start === period.end ? dayLabel(period.start) : `${dayLabel(period.start)} ~ ${dayLabel(period.end)}`;
}

export function shortRangeLabel(period: { start: string; end: string }): string {
  return period.start === period.end
    ? shortDayLabel(period.start)
    : `${shortDayLabel(period.start)} ~ ${shortDayLabel(period.end)}`;
}

/** every day of a period, inclusive */
export function periodDays(period: { start: string; end: string } | null): string[] {
  if (!period) return [];
  const out: string[] = [];
  const end = utc(period.end).getTime();
  for (let d = utc(period.start); d.getTime() <= end && out.length < 400; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(isoOf(d));
  }
  return out;
}

/** "2026-10" */
export const monthOf = (iso: string) => iso.slice(0, 7);

export function monthParts(ym: string): { year: number; month: number } {
  const [y, m] = ym.split('-').map(Number);
  return { year: y, month: m };
}

/** Weeks of a month, Sunday first; days outside the month are null. */
export function monthWeeks(ym: string): (string | null)[][] {
  const { year, month } = monthParts(ym);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from({ length: first.getUTCDay() }, () => null);
  for (let d = 1; d <= days; d++) cells.push(`${ym}-${String(d).padStart(2, '0')}`);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Every month from the oldest to the newest date the notices touch (posting dates and periods). */
export function monthRange(items: NewsItem[]): string[] {
  const all = items.flatMap((it) => [it.date, ...(it.period ? [it.period.start, it.period.end] : [])]).sort();
  if (all.length === 0) return [];
  const out: string[] = [];
  const last = monthOf(all[all.length - 1]);
  let { year, month } = monthParts(monthOf(all[0]));
  for (let guard = 0; guard < 240; guard++) {
    const ym = `${year}-${String(month).padStart(2, '0')}`;
    out.push(ym);
    if (ym === last) break;
    month += 1;
    if (month > 12) { month = 1; year += 1; }
  }
  return out;
}

/** The day a notice is filed under inside a month: its period's first day there, else its posting date. */
export function keyDayIn(item: NewsItem, ym: string): string {
  const inMonth = periodDays(item.period).find((d) => monthOf(d) === ym);
  return inMonth ?? item.date;
}

/** Notices whose posting date or period falls in the month; pinned first, then by key day. */
export function itemsInMonth(items: NewsItem[], ym: string): NewsItem[] {
  return items
    .filter((it) => monthOf(it.date) === ym || periodDays(it.period).some((d) => monthOf(d) === ym))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return keyDayIn(a, ym).localeCompare(keyDayIn(b, ym)) || b.date.localeCompare(a.date);
    });
}

/** day to the notices that are about that day */
export function dayIndex(items: NewsItem[]): Map<string, NewsItem[]> {
  const map = new Map<string, NewsItem[]>();
  for (const it of items) {
    for (const d of periodDays(it.period)) {
      const list = map.get(d) ?? [];
      list.push(it);
      map.set(d, list);
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => TOPIC_ORDER.indexOf(a.topic) - TOPIC_ORDER.indexOf(b.topic));
  }
  return map;
}

/** distinct topics of a day, closure first */
export function topicsOf(list: NewsItem[] | undefined): NewsTopic[] {
  if (!list) return [];
  return TOPIC_ORDER.filter((t) => list.some((it) => it.topic === t));
}
