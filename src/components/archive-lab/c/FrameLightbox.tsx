'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import type { Photo } from '@/lib/content';
import { frameLabel } from './shared';

/*
 * Wraps the server-rendered detail body. Any element with data-lab-c-frame="<index>" opens that photo.
 * The viewer is a modal dialog: focus moves in and is kept inside, Esc closes, arrow keys move,
 * the page behind does not scroll, and focus returns to the photo that opened it.
 */
export function FrameLightbox({ photos, title, children }: { photos: Photo[]; title: string; children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const total = photos.length;
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + total) % total)), [total]);

  function onClick(e: MouseEvent<HTMLDivElement>) {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-lab-c-frame]');
    if (!el) return;
    const i = Number(el.dataset.labCFrame);
    if (Number.isNaN(i)) return;
    returnTo.current = el;
    setIndex(i);
  }

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const back = returnTo.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      back?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
      } else if (e.key === 'Tab') {
        const items = dialogRef.current?.querySelectorAll<HTMLElement>('button');
        if (!items || items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close, step]);

  const ph = index !== null ? photos[index] : null;

  return (
    <div onClick={onClick}>
      {children}
      {ph && index !== null && (
        <div
          ref={dialogRef}
          className="lab-c-lb"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} 사진 보기`}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="lab-c-lb-bar">
            <p className="lab-c-lb-count" aria-live="polite">{frameLabel(index, total)}</p>
            <button type="button" ref={closeRef} className="lab-c-lb-btn" onClick={close}>
              닫기
            </button>
          </div>
          <figure className="lab-c-lb-fig">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={ph.src + index} src={ph.src} width={ph.w} height={ph.h} alt={ph.alt} className="lab-c-lb-img" />
            <figcaption className="lab-c-lb-cap">{ph.caption ?? ph.alt}</figcaption>
          </figure>
          <button type="button" className="lab-c-lb-btn lab-c-lb-prev" aria-label="이전 사진" onClick={() => step(-1)}>
            <span aria-hidden="true">&larr;</span>
          </button>
          <button type="button" className="lab-c-lb-btn lab-c-lb-next" aria-label="다음 사진" onClick={() => step(1)}>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      )}
    </div>
  );
}
