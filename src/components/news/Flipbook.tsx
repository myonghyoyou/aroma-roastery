'use client';

import { useEffect, useRef, useState } from 'react';
import { MediaView } from '@/components/archive/MediaView';
import type { Photo } from '@/lib/content';

/*
 * The news post's photo stage (concept E, kept in F): the post's photos one at a time, as they were posted, with arrows, a page count,
 * the arrow keys and a swipe on touch screens.
 */
export function Flipbook({ photos }: { photos: Photo[] }) {
  const [at, setAt] = useState(0);
  const swipeX = useRef<number | null>(null);
  const total = photos.length;
  const go = (step: number) => total > 1 && setAt((i) => (i + step + total) % total);

  useEffect(() => {
    if (total < 2) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'VIDEO' || t.tagName === 'INPUT' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight') setAt((i) => (i + 1) % total);
      else if (e.key === 'ArrowLeft') setAt((i) => (i - 1 + total) % total);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

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
        <MediaView key={photo.src} photo={photo} className="nwp-img" eager />
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
