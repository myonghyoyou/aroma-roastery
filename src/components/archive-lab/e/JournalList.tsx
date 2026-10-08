'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ArchiveCategory } from '@/lib/content';
import { CATEGORY_LABEL, formatDate } from '@/lib/post-utils';
import { LAB_E_BASE, type LabEItem } from './shared';

const PAGE = 7;
const CATEGORIES: ArchiveCategory[] = ['roasting', 'cupping', 'event', 'store'];

/* ---------- the remembered grid/list view: localStorage behind useSyncExternalStore ---------- */
type View = 'grid' | 'list';
const VIEW_KEY = 'lab-e-view';
const viewListeners = new Set<() => void>();
let viewMemory: View | null = null;

function readView(): View {
  if (viewMemory) return viewMemory;
  try {
    return window.localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
}
function writeView(v: View) {
  viewMemory = v;
  try {
    window.localStorage.setItem(VIEW_KEY, v);
  } catch {
    /* storage blocked: the choice still holds for this visit */
  }
  viewListeners.forEach((l) => l());
}
function subscribeView(l: () => void) {
  viewListeners.add(l);
  return () => {
    viewListeners.delete(l);
  };
}

/* ---------- pieces ---------- */
function Meta({ item }: { item: LabEItem }) {
  return (
    <span className="lab-e-meta">
      <span>{CATEGORY_LABEL[item.category]}</span>
      <span><time dateTime={item.date}>{formatDate(item.date)}</time></span>
    </span>
  );
}

function Cover({ item, eager, className }: { item: LabEItem; eager?: boolean; className: string }) {
  return (
    <span className={className}>
      {item.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.cover.src}
          alt={item.cover.alt}
          width={item.cover.w}
          height={item.cover.h}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="lab-e-fill"
        />
      )}
    </span>
  );
}

/*
 * The archive list: a feature for the newest post, then a two column flow whose crops follow a
 * fixed four step rhythm (wide, tall / tall, wide), filter chips, a grid/list toggle and "더 보기".
 */
export function JournalList({ items }: { items: LabEItem[] }) {
  const [filter, setFilter] = useState<'all' | ArchiveCategory>('all');
  const [visible, setVisible] = useState(PAGE);
  const view = useSyncExternalStore(subscribeView, readView, () => 'grid' as View);
  const rootRef = useRef<HTMLDivElement>(null);
  const focusFrom = useRef<number | null>(null);

  const filtered = filter === 'all' ? items : items.filter((p) => p.category === filter);
  const shown = filtered.slice(0, visible);
  const [feature, ...rest] = shown;

  // after "더 보기", move keyboard focus to the first newly shown post
  useEffect(() => {
    const from = focusFrom.current;
    if (from === null) return;
    focusFrom.current = null;
    rootRef.current?.querySelector<HTMLAnchorElement>(`[data-idx="${from}"] a`)?.focus();
  }, [visible, view]);

  const pick = (f: 'all' | ArchiveCategory) => {
    setFilter(f);
    setVisible(PAGE);
  };
  const more = () => {
    focusFrom.current = visible;
    setVisible((v) => v + PAGE);
  };

  return (
    <div className="lab-e-list" ref={rootRef}>
      <div className="lab-e-controls">
        <div className="lab-e-chips" role="group" aria-label="분류">
          <button type="button" className="lab-e-chip" aria-pressed={filter === 'all'} onClick={() => pick('all')}>
            전체 <span className="lab-e-chip-n">{items.length}</span>
          </button>
          {CATEGORIES.map((c) => {
            const n = items.filter((p) => p.category === c).length;
            if (!n) return null;
            return (
              <button key={c} type="button" className={`lab-e-chip lab-e-chip--${c}`} aria-pressed={filter === c} onClick={() => pick(c)}>
                {CATEGORY_LABEL[c]} <span className="lab-e-chip-n">{n}</span>
              </button>
            );
          })}
        </div>
        <div className="lab-e-views" role="group" aria-label="보기 방식">
          <button type="button" className="lab-e-view" aria-pressed={view === 'grid'} onClick={() => writeView('grid')}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="0" y="0" width="6" height="6" /><rect x="8" y="0" width="6" height="6" /><rect x="0" y="8" width="6" height="6" /><rect x="8" y="8" width="6" height="6" /></svg>
            사진
          </button>
          <button type="button" className="lab-e-view" aria-pressed={view === 'list'} onClick={() => writeView('list')}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="0" y="1" width="14" height="2" /><rect x="0" y="6" width="14" height="2" /><rect x="0" y="11" width="14" height="2" /></svg>
            목록
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <>
          {feature && (
            <article className="lab-e-feature" data-idx={0}>
              <Link href={`${LAB_E_BASE}/${feature.slug}`} className="lab-e-feature-link">
                <Cover item={feature} eager className="lab-e-feature-cover" />
                <span className="lab-e-feature-text">
                  <span className="lab-e-feature-label">최근 기록</span>
                  <Meta item={feature} />
                  <span className="lab-e-feature-title">{feature.title}</span>
                  <span className="lab-e-summary">{feature.summary}</span>
                  <span className="lab-e-count">사진 {feature.photoCount}장</span>
                </span>
              </Link>
            </article>
          )}
          {rest.length > 0 && (
            <ul className="lab-e-flow">
              {rest.map((item, i) => {
                const step = i % 4; // 0 wide left, 1 tall right, 2 tall left, 3 wide right
                const shape = step === 0 || step === 3 ? 'wide' : 'tall';
                return (
                  <li key={item.slug} className={`lab-e-flow-item lab-e-step-${step} is-${shape}`} data-idx={i + 1}>
                    <Link href={`${LAB_E_BASE}/${item.slug}`} className="lab-e-card">
                      <Cover item={item} eager={i < 2} className="lab-e-card-cover" />
                      <Meta item={item} />
                      <span className="lab-e-card-title">{item.title}</span>
                      <span className="lab-e-summary">{item.summary}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <ol className="lab-e-rows">
          {shown.map((item, i) => (
            <li key={item.slug} data-idx={i}>
              <Link href={`${LAB_E_BASE}/${item.slug}`} className="lab-e-row">
                <time dateTime={item.date}>{formatDate(item.date)}</time>
                <span className="lab-e-row-cat">{CATEGORY_LABEL[item.category]}</span>
                <span className="lab-e-row-title">{item.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      <div className="lab-e-more">
        <p className="lab-e-status" aria-live="polite">
          {filtered.length}개 중 {shown.length}개
        </p>
        {shown.length < filtered.length && (
          <button type="button" className="lab-e-more-btn" onClick={more}>
            더 보기
          </button>
        )}
      </div>
    </div>
  );
}
