'use client';

import { useEffect, useRef, useState } from 'react';
import { MediaView } from '@/components/archive/MediaView';
import type { Photo } from '@/lib/content';

/*
 * The news post's photo stage (concept E, kept in F): the post's photos one at a time, as they were posted, with arrows, a page count,
 * the arrow keys and a swipe on touch screens. Each turn slides the next photo in from the side it
 * was turned towards; the neighbours are fetched ahead so the photo is there when it slides in.
 * A swipe counts as a turn when it leans sideways (within 35 degrees of level), and the page does not
 * scroll under it: with the pointer events alone a slanted swipe was taken by the browser as a scroll.
 */
const SWIPE = 48;
const LEVEL = Math.tan((35 * Math.PI) / 180);
export function Flipbook({ photos }: { photos: Photo[] }) {
  const [at, setAt] = useState(0);
  const [dir, setDir] = useState<'next' | 'prev' | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const total = photos.length;
  const go = (step: number) => {
    if (total < 2) return;
    setDir(step > 0 ? 'next' : 'prev');
    setAt((i) => (i + step + total) % total);
  };

  useEffect(() => {
    if (total < 2) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'VIDEO' || t.tagName === 'INPUT' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight') { setDir('next'); setAt((i) => (i + 1) % total); }
      else if (e.key === 'ArrowLeft') { setDir('prev'); setAt((i) => (i - 1 + total) % total); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  // touch listeners added by hand: React's are passive, and a sideways swipe has to stop the scroll
  useEffect(() => {
    const el = pageRef.current;
    if (!el || total < 2) return;
    let start: { x: number; y: number } | null = null;
    let sideways: boolean | null = null;
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) { start = null; return; }
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      sideways = null;
    };
    const onMove = (e: TouchEvent) => {
      if (!start) return;
      const dx = e.touches[0].clientX - start.x;
      const dy = e.touches[0].clientY - start.y;
      if (sideways === null) {
        if (Math.hypot(dx, dy) < 8) return;
        sideways = Math.abs(dy) <= Math.abs(dx) * LEVEL;
      }
      if (sideways && e.cancelable) e.preventDefault();
    };
    const onEnd = (e: TouchEvent) => {
      if (!start || !sideways) { start = null; return; }
      const dx = e.changedTouches[0].clientX - start.x;
      start = null;
      if (Math.abs(dx) > SWIPE) {
        setDir(dx < 0 ? 'next' : 'prev');
        setAt((i) => (i + (dx < 0 ? 1 : -1) + total) % total);
      }
    };
    const onCancel = () => { start = null; };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onCancel);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onCancel);
    };
  }, [total]);

  useEffect(() => {
    if (total < 2) return;
    for (const step of [1, -1]) {
      const p = photos[(at + step + total) % total];
      if (p && !p.video) new Image().src = p.src;
    }
  }, [at, total, photos]);

  const photo = photos[at];
  if (!photo) return null;
  return (
    <div className="nwp-book" aria-roledescription="사진 넘기기" aria-label={`사진 ${total}장`}>
      <div className="nwp-page" ref={pageRef}>
        <div key={photo.src} className="nwp-turn" data-dir={dir ?? undefined}>
          <MediaView photo={photo} className="nwp-img" eager />
        </div>
      </div>
      {total > 1 && (
        <div className="nwp-controls">
          <button type="button" className="nwp-arrow" onClick={() => go(-1)} aria-label="이전 사진"><span aria-hidden="true">‹</span></button>
          <p className="nwp-count" aria-live="polite">{at + 1} / {total}</p>
          <button type="button" className="nwp-arrow" onClick={() => go(1)} aria-label="다음 사진"><span aria-hidden="true">›</span></button>
        </div>
      )}
    </div>
  );
}
