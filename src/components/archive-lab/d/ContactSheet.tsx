'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import type { ArchiveCategory } from '@/lib/content';
import { CATEGORY_LABEL, formatDate } from '@/lib/post-utils';
import { Lightbox } from './Lightbox';
import { sheetHref, type SheetItem } from './types';

const PAGE = 48;
const CATEGORIES: ArchiveCategory[] = ['roasting', 'cupping', 'event', 'store'];
type CatFilter = 'all' | ArchiveCategory;
type YearFilter = 'all' | string;

const yearOf = (item: SheetItem) => item.date.slice(0, 4);
const inYear = (item: SheetItem, y: YearFilter) => y === 'all' || yearOf(item) === y;
const inCat = (item: SheetItem, c: CatFilter) => c === 'all' || item.category === c;

function shuffled<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/*
 * Every photo of every archive post on one sheet. The server sends a fixed order; after mount the
 * sheet is dealt again in a new order so each visit reads like a fresh contact sheet.
 */
export function ContactSheet({ items }: { items: SheetItem[] }) {
  const [order, setOrder] = useState(items);
  const [dealt, setDealt] = useState(false);
  const [cat, setCat] = useState<CatFilter>('all');
  const [year, setYear] = useState<YearFilter>('all');
  const [visible, setVisible] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);
  const cells = useRef(new Map<string, HTMLAnchorElement>());
  const focusKey = useRef<string | null>(null);

  // the signature: shuffle once on the client, never on the server, so markup stays deterministic
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setOrder(shuffled(items));
      setDealt(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [items]);

  const years = useMemo(() => [...new Set(items.map(yearOf))].sort((a, b) => b.localeCompare(a)), [items]);

  const filtered = useMemo(
    () => order.filter((item) => inCat(item, cat) && inYear(item, year)),
    [order, cat, year],
  );
  const postCount = useMemo(() => new Set(filtered.map((i) => i.slug)).size, [filtered]);
  const catCount = (c: CatFilter) => items.filter((i) => inCat(i, c) && inYear(i, year)).length;
  const yearCount = (y: YearFilter) => items.filter((i) => inYear(i, y) && inCat(i, cat)).length;

  const shown = filtered.slice(0, visible);

  // return focus to a photo after the lightbox closes or after "더 보기" adds a batch
  useEffect(() => {
    if (open !== null || !focusKey.current) return;
    cells.current.get(focusKey.current)?.focus();
    focusKey.current = null;
  }, [open, visible]);

  const pickCat = (c: CatFilter) => {
    setCat(c);
    setVisible(PAGE);
  };
  const pickYear = (y: YearFilter) => {
    setYear(y);
    setVisible(PAGE);
  };

  const openAt = (e: MouseEvent<HTMLAnchorElement>, i: number) => {
    // keep new-tab and modifier clicks as plain links to the post
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setOpen(i);
  };

  const close = (i: number) => {
    focusKey.current = filtered[i]?.key ?? null;
    if (i >= visible) setVisible(Math.ceil((i + 1) / PAGE) * PAGE);
    setOpen(null);
  };

  const more = () => {
    focusKey.current = filtered[visible]?.key ?? null;
    setVisible((v) => v + PAGE);
  };

  return (
    <>
      <div className="lab-d-filters">
        <div className="lab-d-chips" role="group" aria-label="분류">
          <button type="button" className="lab-d-chip" aria-pressed={cat === 'all'} onClick={() => pickCat('all')}>
            전체 <span className="lab-d-chip-n">{catCount('all')}</span>
          </button>
          {CATEGORIES.map((c) => {
            const n = catCount(c);
            return (
              <button
                key={c}
                type="button"
                className="lab-d-chip"
                data-cat={c}
                aria-pressed={cat === c}
                disabled={n === 0 && cat !== c}
                onClick={() => pickCat(c)}
              >
                {CATEGORY_LABEL[c]} <span className="lab-d-chip-n">{n}</span>
              </button>
            );
          })}
        </div>
        <div className="lab-d-chips" role="group" aria-label="연도">
          <button type="button" className="lab-d-chip" aria-pressed={year === 'all'} onClick={() => pickYear('all')}>
            모든 연도 <span className="lab-d-chip-n">{yearCount('all')}</span>
          </button>
          {years.map((y) => (
            <button key={y} type="button" className="lab-d-chip" aria-pressed={year === y} onClick={() => pickYear(y)}>
              {y} <span className="lab-d-chip-n">{yearCount(y)}</span>
            </button>
          ))}
        </div>
        <p className="lab-d-status" aria-live="polite">
          <span>사진 {filtered.length}장</span>
          <span>기록 {postCount}건</span>
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="lab-d-empty">이 조건에 맞는 사진이 없습니다.</p>
      ) : (
        <ul className="lab-d-grid" data-dealt={dealt || undefined}>
          {shown.map((item, i) => (
            <li key={item.key} className="lab-d-cell" style={{ '--i': i % PAGE } as CSSProperties}>
              <a
                ref={(el) => {
                  if (el) cells.current.set(item.key, el);
                  else cells.current.delete(item.key);
                }}
                href={sheetHref(item.slug)}
                className="lab-d-shot"
                aria-haspopup="dialog"
                onClick={(e) => openAt(e, i)}
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
                <span className="lab-d-shot-info">
                  <span className="lab-d-shot-title">{item.title}</span>
                  <time dateTime={item.date}>{formatDate(item.date)}</time>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {filtered.length > visible && (
        <div className="lab-d-more-row">
          <button type="button" className="lab-d-more" onClick={more}>
            더 보기
            <span className="lab-d-more-n">
              {visible} / {filtered.length}
            </span>
          </button>
        </div>
      )}

      {open !== null && (
        <Lightbox
          items={filtered}
          index={open}
          onIndexChange={setOpen}
          onClose={close}
          showPostLink
          label="사진 크게 보기"
        />
      )}
    </>
  );
}
