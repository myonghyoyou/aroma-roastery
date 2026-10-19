'use client';

import Link from 'next/link';
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { CATEGORY_LABEL, formatDate } from '@/lib/post-utils';
import { sheetHref, type SheetItem } from './types';

type Props = {
  items: SheetItem[];
  index: number;
  onIndexChange: (index: number) => void;
  /** called with the index shown last, so the caller can return focus to that photo */
  onClose: (index: number) => void;
  /** the list links each photo to its post; inside a post that link would point to the same page */
  showPostLink: boolean;
  label: string;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/*
 * One photo at a time over a solid roast backdrop. Dialog semantics, focus moved in and trapped,
 * Esc closes, left and right arrows (or a horizontal swipe on touch) step through the set.
 */
export function Lightbox({ items, index, onIndexChange, onClose, showPostLink, label }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const swipeX = useRef<number | null>(null);
  const item = items[index];
  const total = items.length;

  const go = (step: number) => {
    if (total < 2) return;
    onIndexChange((index + step + total) % total);
  };

  // focus into the dialog and lock page scroll while it is open
  useEffect(() => {
    closeRef.current?.focus();
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  // warm the neighbours so stepping does not wait on the network
  useEffect(() => {
    if (total < 2) return;
    for (const step of [1, -1]) {
      const next = items[(index + step + total) % total];
      const img = new Image();
      img.src = next.photo.src;
    }
  }, [index, items, total]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose(index);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    } else if (e.key === 'Tab') {
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    swipeX.current = e.pointerType === 'mouse' ? null : e.clientX;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (swipeX.current === null) return;
    const dx = e.clientX - swipeX.current;
    swipeX.current = null;
    if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
  };

  if (!item) return null;
  const { photo } = item;

  return createPortal(
    <div
      ref={dialogRef}
      className="arc-lb"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <div className="arc-lb-bar">
        <p className="arc-lb-count" aria-live="polite" aria-atomic="true">
          <span className="arc-sr">사진 </span>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span className="arc-lb-count-sep" aria-hidden="true">/</span>
          <span className="arc-sr"> 전체 </span>
          <span>{String(total).padStart(2, '0')}</span>
        </p>
        <button ref={closeRef} type="button" className="arc-lb-close" onClick={() => onClose(index)}>
          닫기
          <span className="arc-lb-key" aria-hidden="true">Esc</span>
        </button>
      </div>

      <div className="arc-lb-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        {photo.video ? (
          // a video post plays here, from its cover image, with the sound off until the viewer turns it on
          <video
            key={item.key}
            className="arc-lb-img"
            src={photo.video}
            poster={photo.src}
            width={photo.w}
            height={photo.h}
            aria-label={photo.alt}
            controls
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.key}
            className="arc-lb-img"
            src={photo.src}
            width={photo.w}
            height={photo.h}
            alt={photo.alt}
            draggable={false}
          />
        )}
      </div>

      <div className="arc-lb-foot">
        <button type="button" className="arc-lb-arrow" onClick={() => go(-1)} disabled={total < 2} aria-label="이전 사진">
          <span aria-hidden="true">&larr;</span>
        </button>
        <div className="arc-lb-info">
          <p className="arc-lb-meta">
            {item.category && (
              <span className="arc-cat" data-cat={item.category}>
                {CATEGORY_LABEL[item.category]}
              </span>
            )}
            <time dateTime={item.date}>{formatDate(item.date)}</time>
            <span>{photo.video ? '영상' : '사진'} {item.frame}</span>
          </p>
          {!item.untitled && <p className="arc-lb-title">{item.title}</p>}
          {photo.caption && <p className="arc-lb-caption">{photo.caption}</p>}
          {showPostLink && (
            <Link href={sheetHref(item.slug)} className="arc-lb-link">
              이 기록 보기
            </Link>
          )}
        </div>
        <button type="button" className="arc-lb-arrow" onClick={() => go(1)} disabled={total < 2} aria-label="다음 사진">
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>,
    document.body,
  );
}
