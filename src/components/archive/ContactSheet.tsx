'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { ArchiveCategory } from '@/lib/content';
import { CATEGORY_LABEL, formatDate } from '@/lib/post-utils';
import { sheetHref, type SheetItem } from './types';

const PAGE = 48;
const CATEGORIES: ArchiveCategory[] = ['roasting', 'cupping', 'event', 'store'];
type CatFilter = 'all' | ArchiveCategory;
type YearFilter = 'all' | string;

const yearOf = (item: SheetItem) => item.date.slice(0, 4);
const inYear = (item: SheetItem, y: YearFilter) => y === 'all' || yearOf(item) === y;
const inCat = (item: SheetItem, c: CatFilter) => c === 'all' || item.category === c;

/** One cell: a post's first photo, and its second shown over it on hover (a bean card and its note). */
type Cell = { first: SheetItem; second?: SheetItem };

/*
 * Every archive post on one sheet, one cell a post, newest first. The store posts a bean card with a
 * second picture describing it, so the cell shows the card and turns to the description on hover or
 * focus. A click goes straight to the post's page (a lightbox in between was dropped 2026-10-21).
 * (A shuffled deal on every visit was tried and dropped too: the dates read as random.) After mount
 * the cells are dealt in once, in that order.
 */
export function ContactSheet({ items }: { items: SheetItem[] }) {
  const [dealt, setDealt] = useState(false);
  const [cat, setCat] = useState<CatFilter>('all');
  const [year, setYear] = useState<YearFilter>('all');
  const [visible, setVisible] = useState(PAGE);
  const cells = useRef(new Map<string, HTMLAnchorElement>());
  const focusKey = useRef<string | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setDealt(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const years = useMemo(() => [...new Set(items.map(yearOf))].sort((a, b) => b.localeCompare(a)), [items]);
  // categories come from hashtags; the store's feed has none, and a row of empty chips says nothing
  const hasCategories = useMemo(() => items.some((i) => i.category), [items]);

  const filtered = useMemo(
    () => items.filter((item) => inCat(item, cat) && inYear(item, year)),
    [items, cat, year],
  );
  const postCount = useMemo(() => new Set(filtered.map((i) => i.slug)).size, [filtered]);
  const catCount = (c: CatFilter) => items.filter((i) => inCat(i, c) && inYear(i, year)).length;
  const yearCount = (y: YearFilter) => items.filter((i) => inYear(i, y) && inCat(i, cat)).length;

  // posts as cells, in the order of their first photo
  const groups = useMemo(() => {
    const out: Cell[] = [];
    const bySlug = new Map<string, Cell>();
    filtered.forEach((item) => {
      const cell = bySlug.get(item.slug);
      if (!cell) {
        const next: Cell = { first: item };
        bySlug.set(item.slug, next);
        out.push(next);
      } else if (!cell.second) {
        cell.second = item;
      }
    });
    return out;
  }, [filtered]);

  const shown = groups.slice(0, visible);

  // after "더 보기" adds a batch, focus moves to the first new cell
  useEffect(() => {
    if (!focusKey.current) return;
    cells.current.get(focusKey.current)?.focus();
    focusKey.current = null;
  }, [visible]);

  const pickCat = (c: CatFilter) => {
    setCat(c);
    setVisible(PAGE);
  };
  const pickYear = (y: YearFilter) => {
    setYear(y);
    setVisible(PAGE);
  };

  const more = () => {
    focusKey.current = groups[visible]?.first.key ?? null;
    setVisible((v) => v + PAGE);
  };

  return (
    <>
      <div className="arc-filters">
        {hasCategories && <div className="arc-chips" role="group" aria-label="분류">
          <button type="button" className="arc-chip" aria-pressed={cat === 'all'} onClick={() => pickCat('all')}>
            전체 <span className="arc-chip-n">{catCount('all')}</span>
          </button>
          {CATEGORIES.map((c) => {
            const n = catCount(c);
            // only the store's own tags show: a category nobody tagged is left out, not shown as 0
            if (!items.some((i) => i.category === c)) return null;
            return (
              <button
                key={c}
                type="button"
                className="arc-chip"
                data-cat={c}
                aria-pressed={cat === c}
                disabled={n === 0 && cat !== c}
                onClick={() => pickCat(c)}
              >
                {CATEGORY_LABEL[c]} <span className="arc-chip-n">{n}</span>
              </button>
            );
          })}
        </div>}
        <div className="arc-chips" role="group" aria-label="연도">
          <button type="button" className="arc-chip" aria-pressed={year === 'all'} onClick={() => pickYear('all')}>
            모든 연도 <span className="arc-chip-n">{yearCount('all')}</span>
          </button>
          {years.map((y) => (
            <button key={y} type="button" className="arc-chip" aria-pressed={year === y} onClick={() => pickYear(y)}>
              {y} <span className="arc-chip-n">{yearCount(y)}</span>
            </button>
          ))}
        </div>
        <p className="arc-status" aria-live="polite">
          <span>사진 {filtered.length}장</span>
          <span>기록 {postCount}건</span>
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="arc-empty">이 조건에 맞는 사진이 없습니다.</p>
      ) : (
        <ul className="arc-grid" data-dealt={dealt || undefined}>
          {shown.map(({ first: item, second }, i) => (
            <li key={item.key} className="arc-cell" style={{ '--i': i % PAGE } as CSSProperties}>
              <Link
                ref={(el) => {
                  if (el) cells.current.set(item.key, el);
                  else cells.current.delete(item.key);
                }}
                href={sheetHref(item.slug)}
                className={second ? 'arc-shot has-alt' : 'arc-shot'}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.photo.src}
                  width={item.photo.w}
                  height={item.photo.h}
                  alt={item.photo.alt}
                  loading={i < 12 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                {second && (
                  // eslint-disable-next-line @next/next/no-img-element -- the description, shown on hover; the post page names it
                  <img
                    className="arc-shot-alt"
                    src={second.photo.src}
                    width={second.photo.w}
                    height={second.photo.h}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                )}
                {item.photo.fromVideo && <span className="arc-video">영상</span>}
                {/* the description picture carries its own text, so a two-photo cell has no band over it */}
                {!second && (
                  <span className="arc-shot-info">
                    {!item.untitled && <span className="arc-shot-title">{item.title}</span>}
                    <time dateTime={item.date}>{formatDate(item.date)}</time>
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {groups.length > visible && (
        <div className="arc-more-row">
          <button type="button" className="arc-more" onClick={more}>
            더 보기
            <span className="arc-more-n">
              {visible} / {groups.length}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
