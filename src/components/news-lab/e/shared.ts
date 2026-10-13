import type { NewsTopic, Post } from '@/lib/content';

/*
 * News lab, concept E: "매장 알림판".
 * Plain data and pure helpers shared by the server pages and the client strip/list.
 * Nothing here reads the clock: callers pass "today" in, so prerendered HTML never depends on it.
 */

export const NL_E_BASE = '/news-lab/e';

export type NlENotice = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  topic: NewsTopic;
  pinned: boolean;
  period: { start: string; end?: string } | null;
  sample: boolean;
};

export type NlEHours = { label: string; value: string }[];

export function toNlENotice(post: Post): NlENotice {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    summary: post.summary,
    topic: post.topic ?? 'notice',
    pinned: Boolean(post.pinned),
    period: post.period ?? null,
    sample: post.sample,
  };
}

export function nlEHref(slug: string): string {
  return `${NL_E_BASE}/${slug}`;
}

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

/** day of week (0 = Sunday) of a yyyy-mm-dd string, independent of any time zone */
export function weekdayOf(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** 2026-10-21 -> 10월 21일(수) */
export function formatDay(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${m}월 ${d}일(${WEEKDAY[weekdayOf(iso)]})`;
}

/** a period as one line: "10월 21일(수)" or "9월 24일(목)부터 9월 27일(일)까지" */
export function formatPeriod(period: { start: string; end?: string }): string {
  if (!period.end || period.end === period.start) return formatDay(period.start);
  return `${formatDay(period.start)}부터 ${formatDay(period.end)}까지`;
}

/** whole days from a to b, both yyyy-mm-dd */
export function daysBetween(a: string, b: string): number {
  const toUtc = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** "08:00-18:00" -> minutes since midnight; null when the line is not a time range */
export function parseRange(value: string): { open: number; close: number; openText: string; closeText: string } | null {
  const m = value.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const pad = (h: string, mm: string) => `${h.padStart(2, '0')}:${mm}`;
  return {
    open: Number(m[1]) * 60 + Number(m[2]),
    close: Number(m[3]) * 60 + Number(m[4]),
    openText: pad(m[1], m[2]),
    closeText: pad(m[3], m[4]),
  };
}

/** the hours line that applies on a weekday: '평일' Monday to Friday, '주말' Saturday and Sunday */
export function hoursLineFor(hours: NlEHours, weekday: number): { label: string; value: string } | null {
  const weekend = weekday === 0 || weekday === 6;
  const line = hours.find((h) => (weekend ? h.label.includes('주말') : h.label.includes('평일')));
  return line ?? hours[0] ?? null;
}

export function inPeriod(day: string, period: { start: string; end?: string }): boolean {
  return day >= period.start && day <= (period.end ?? period.start);
}
