'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Link from 'next/link';
import type { ArchiveCategory } from '@/lib/content';
import { CATEGORY_LABEL, formatDate } from '@/lib/post-utils';
import { LeafDot } from './LeafDot';

export type LogPhoto = { src: string; w: number; h: number; alt: string };
export type LogItem = {
  slug: string;
  title: string;
  date: string;
  category: ArchiveCategory;
  cover: LogPhoto;
  /** the cover plus a few more photos, cycled in the hover preview */
  preview: LogPhoto[];
  photoCount: number;
};

type Filter = 'all' | ArchiveCategory;
/** mode: where the preview sits (following the cursor, or a fixed spot); via: what opened it */
type Active = { slug: string; mode: 'pointer' | 'focus'; via: 'pointer' | 'key' } | null;

const CATEGORIES: ArchiveCategory[] = ['roasting', 'cupping', 'event', 'store'];
const FIRST_PAGE = 8;
const CYCLE_MS = 1200;
const PREVIEW_W = 260;

/*
 * The log index. A dense list of rows; on a mouse, a preview photo follows the cursor and the
 * other rows dim. Keyboard focus shows the same preview at a fixed spot. Touch and narrow screens
 * get a small cover in each row instead (CSS decides, so nothing depends on hover).
 */
export function ArchiveLog({ items }: { items: LogItem[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState<Active>(null);
  const [frame, setFrame] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<string, HTMLAnchorElement>());
  const focusAfterExpand = useRef<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: items.length, roasting: 0, cupping: 0, event: 0, store: 0 };
    for (const it of items) c[it.category] += 1;
    return c;
  }, [items]);

  const filtered = useMemo(() => (filter === 'all' ? items : items.filter((it) => it.category === filter)), [items, filter]);
  const shown = expanded ? filtered : filtered.slice(0, FIRST_PAGE);
  const remaining = filtered.length - shown.length;

  const years = useMemo(() => {
    const groups: { year: string; rows: LogItem[] }[] = [];
    for (const it of shown) {
      const year = it.date.slice(0, 4);
      const last = groups[groups.length - 1];
      if (last && last.year === year) last.rows.push(it);
      else groups.push({ year, rows: [it] });
    }
    return groups;
  }, [shown]);

  const activeItem = active ? items.find((it) => it.slug === active.slug) ?? null : null;
  const frames = activeItem?.preview ?? [];

  // Cycle the preview photos slowly while a row is active (cover only under reduced motion).
  useEffect(() => {
    if (!active || frames.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setFrame((f) => f + 1), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [active, frames.length]);

  // After "더 보기", move focus to the first newly shown row.
  useEffect(() => {
    const slug = focusAfterExpand.current;
    if (!slug) return;
    focusAfterExpand.current = null;
    rowRefs.current.get(slug)?.focus();
  }, [expanded]);

  function placePreview(e: ReactPointerEvent) {
    const el = previewRef.current;
    if (!el) return;
    const right = e.clientX + 28 + PREVIEW_W < window.innerWidth;
    const x = right ? e.clientX + 28 : e.clientX - 28 - PREVIEW_W;
    el.style.setProperty('--lab-a-x', `${Math.round(x)}px`);
    el.style.setProperty('--lab-a-y', `${Math.round(e.clientY)}px`);
  }

  function cursorPreviewAllowed(e: ReactPointerEvent) {
    if (e.pointerType !== 'mouse') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)').matches;
  }

  function onRowEnter(e: ReactPointerEvent, slug: string) {
    if (!cursorPreviewAllowed(e)) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    placePreview(e);
    if (active?.slug !== slug) setFrame(0);
    setActive({ slug, mode: still ? 'focus' : 'pointer', via: 'pointer' });
  }

  function onRowFocus(el: HTMLAnchorElement, slug: string) {
    if (!el.matches(':focus-visible')) return;
    if (!window.matchMedia('(min-width: 761px)').matches) return;
    if (active?.slug !== slug) setFrame(0);
    setActive({ slug, mode: 'focus', via: 'key' });
  }

  function chooseFilter(f: Filter) {
    setFilter(f);
    setExpanded(false);
    setActive(null);
  }

  function showMore() {
    const next = filtered[FIRST_PAGE];
    focusAfterExpand.current = next ? next.slug : null;
    setExpanded(true);
  }

  const filterLabel = filter === 'all' ? '전체' : CATEGORY_LABEL[filter];

  return (
    <div className="lab-a-log">
      <div className="lab-a-filters" role="group" aria-label="분류로 거르기">
        {(['all', ...CATEGORIES] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            className="lab-a-chip"
            aria-pressed={filter === f}
            onClick={() => chooseFilter(f)}
            disabled={counts[f] === 0}
          >
            {f !== 'all' && <span className={`lab-a-dot lab-a-dot--${f}`} aria-hidden="true" />}
            <span>{f === 'all' ? '전체' : CATEGORY_LABEL[f]}</span>
            <span className="lab-a-chip-count">{counts[f]}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {filterLabel} {filtered.length}건 중 {shown.length}건 표시
      </p>

      <div className="lab-a-colhead" aria-hidden="true">
        <span>날짜</span>
        <span>분류</span>
        <span>제목</span>
        <span className="lab-a-colhead-num">사진</span>
      </div>

      <div
        className="lab-a-index"
        data-active={active ? '' : undefined}
        onPointerMove={(e) => active?.mode === 'pointer' && placePreview(e)}
        onPointerLeave={() => active?.via === 'pointer' && setActive(null)}
      >
        {years.map((g) => (
          <section key={g.year} className="lab-a-year" aria-labelledby={`lab-a-year-${g.year}`}>
            <h2 id={`lab-a-year-${g.year}`} className="lab-a-year-label">
              {g.year}
              <span className="lab-a-year-count">{g.rows.length}건</span>
            </h2>
            <ol className="lab-a-rows">
              {g.rows.map((it, i) => (
                <li key={it.slug} className="lab-a-item">
                  <Link
                    href={`/archive-lab/a/${it.slug}`}
                    className="lab-a-row"
                    data-active={active?.slug === it.slug ? '' : undefined}
                    ref={(el) => {
                      if (el) rowRefs.current.set(it.slug, el);
                      else rowRefs.current.delete(it.slug);
                    }}
                    onPointerEnter={(e) => onRowEnter(e, it.slug)}
                    onFocus={(e) => onRowFocus(e.currentTarget, it.slug)}
                    onBlur={() => setActive((a) => (a?.via === 'key' && a.slug === it.slug ? null : a))}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="lab-a-thumb"
                      src={it.cover.src}
                      width={it.cover.w}
                      height={it.cover.h}
                      alt=""
                      loading={i < 4 && g === years[0] ? 'eager' : 'lazy'}
                    />
                    <time className="lab-a-date" dateTime={it.date}>
                      {formatDate(it.date)}
                    </time>
                    <LeafDot category={it.category} />
                    <span className="lab-a-title">{it.title}</span>
                    <span className="lab-a-count">사진 {it.photoCount}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      {remaining > 0 && (
        <div className="lab-a-more">
          <button type="button" className="lab-a-more-btn" onClick={showMore}>
            더 보기 <span className="lab-a-more-num">{remaining}건</span>
          </button>
          <span className="lab-a-more-meta">
            {filtered.length}건 중 {shown.length}건
          </span>
        </div>
      )}

      <div
        ref={previewRef}
        className="lab-a-preview"
        data-mode={active?.mode}
        data-on={activeItem ? '' : undefined}
        aria-hidden="true"
      >
        {activeItem && (
          <>
            {frames.map((p, n) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${activeItem.slug}-${n}`}
                src={p.src}
                width={p.w}
                height={p.h}
                alt=""
                className="lab-a-preview-img"
                data-on={n === frame % frames.length ? '' : undefined}
              />
            ))}
            <span className="lab-a-preview-cap">
              {String((frame % frames.length) + 1).padStart(2, '0')} / {String(frames.length).padStart(2, '0')}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
