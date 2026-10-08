import type { ArchiveCategory, Post } from '@/lib/content';

/* Calendar helpers for concept B: posts filed by year, then by month. Safe on server and client. */

export type MonthGroup = { id: string; year: string; month: string; posts: Post[] };
export type YearGroup = { year: string; months: MonthGroup[] };
export type RailMonth = { id: string; year: string; month: string; count: number };

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

/** Posts arrive newest first; the order is kept inside every year and month. */
export function groupByYearMonth(posts: Post[]): YearGroup[] {
  const years: YearGroup[] = [];
  for (const post of posts) {
    const [year, month] = post.date.split('-');
    let y = years.find((g) => g.year === year);
    if (!y) {
      y = { year, months: [] };
      years.push(y);
    }
    let m = y.months.find((g) => g.month === month);
    if (!m) {
      m = { id: monthId(year, month), year, month, posts: [] };
      y.months.push(m);
    }
    m.posts.push(post);
  }
  return years;
}

export function monthId(year: string, month: string): string {
  return `lab-b-m-${year}-${month}`;
}

/** "09" to "9월" */
export function monthLabel(month: string): string {
  return `${Number(month)}월`;
}

/** "2026-09-27" to { day: "27", weekday: "일" } */
export function dayParts(iso: string): { day: string; weekday: string } {
  const d = new Date(`${iso}T00:00:00Z`);
  return { day: iso.slice(8, 10), weekday: WEEKDAY[d.getUTCDay()] };
}

/** One leaf colour per category, used only for a small dot. */
export const CATEGORY_DOT: Record<ArchiveCategory, string> = {
  roasting: '#EF7000',
  cupping: '#07913B',
  event: '#C10110',
  store: '#EDBE00',
};
