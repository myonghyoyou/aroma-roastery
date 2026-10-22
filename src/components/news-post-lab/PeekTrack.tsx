'use client';

import { useEffect, useRef, useState } from 'react';
import { MediaView } from '@/components/archive/MediaView';
import type { Photo } from '@/lib/content';

/*
 * E2's photo track, after Terarosa's viewer and Coffee Collective's carousel: one photo a view with
 * the next one peeking at the edge (so a swipe is obvious even with two), round arrows over the
 * photo's edges, a "1 / 2" pill under it. Native horizontal scrolling with scroll-snap, so touch,
 * trackpad and the arrow keys all move it; the arrows only step the photos, never the post.
 */
export function PeekTrack({ photos }: { photos: Photo[] }) {
  const track = useRef<HTMLOListElement>(null);
  const [at, setAt] = useState(0);
  const total = photos.length;

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const slides = [...el.children] as HTMLElement[];
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      slides.forEach((s, i) => { if (Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid) < Math.abs(slides[best].offsetLeft + slides[best].offsetWidth / 2 - mid)) best = i; });
      setAt(best);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const go = (i: number) => {
    const el = track.current;
    const slide = el?.children[Math.max(0, Math.min(total - 1, i))] as HTMLElement | undefined;
    if (el && slide) el.scrollTo({ left: slide.offsetLeft - (el.clientWidth - slide.offsetWidth) / 2, behavior: 'smooth' });
  };

  return (
    <div className="npl-e2-viewer">
      <ol
        ref={track}
        className={`npl-e2-track${total === 1 ? ' is-one' : ''}`}
        tabIndex={0}
        aria-label={`사진 ${total}장, 좌우로 넘겨 보세요`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); go(at + 1); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); go(at - 1); }
        }}
      >
        {photos.map((p, i) => (
          <li key={p.src + i} className="npl-e2-slide" aria-current={i === at || undefined}>
            <MediaView photo={p} className="npl-e2-img" eager={i < 2} />
          </li>
        ))}
      </ol>
      {total > 1 && (
        <>
          <button type="button" className="npl-e2-arrow npl-e2-arrow--prev" onClick={() => go(at - 1)} disabled={at === 0} aria-label="이전 사진"><span aria-hidden="true">‹</span></button>
          <button type="button" className="npl-e2-arrow npl-e2-arrow--next" onClick={() => go(at + 1)} disabled={at === total - 1} aria-label="다음 사진"><span aria-hidden="true">›</span></button>
          <p className="npl-e2-pill" aria-live="polite"><b>{at + 1}</b> / {total}</p>
        </>
      )}
    </div>
  );
}
