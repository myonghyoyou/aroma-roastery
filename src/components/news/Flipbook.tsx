'use client';

import { useEffect, useRef, useState } from 'react';
import { MediaView } from '@/components/archive/MediaView';
import type { Photo } from '@/lib/content';

/*
 * The news post's photo stage (concept E, kept in F): the post's photos one at a time, as they were posted, with arrows, a page count,
 * the arrow keys and a swipe on touch screens. Each turn slides the next photo in from the side it
 * was turned towards; the neighbours are fetched ahead so the photo is there when it slides in.
 */
export function Flipbook({ photos }: { photos: Photo[] }) {
  const [at, setAt] = useState(0);
  const [dir, setDir] = useState<'next' | 'prev' | null>(null);
  const swipeX = useRef<number | null>(null);
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
      <div
        className="nwp-page"
        onPointerDown={(e) => { swipeX.current = e.pointerType === 'mouse' ? null : e.clientX; }}
        onPointerUp={(e) => {
          if (swipeX.current === null) return;
          const dx = e.clientX - swipeX.current;
          swipeX.current = null;
          if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
        }}
      >
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
