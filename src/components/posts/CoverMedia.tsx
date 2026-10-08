'use client';

import { useEffect, useRef } from 'react';
import type { Media } from '@/lib/content';

type Play = 'hover' | 'view';

/*
 * A post cover as plain DOM media. Videos stay light: no download until needed, then they play
 *   hover: while the pointer is over the closest [data-cover-host] ancestor (fine pointers),
 *          falling back to 'view' on touch screens
 *   view:  while at least half of it is on screen
 * Clips that need the pillarbox crop (media.crop) show their still instead: that crop only exists
 * in the WebGL path on the home page. Reduced motion always shows the still.
 */
export function CoverMedia({ media, play = 'view', className }: { media: Media; play?: Play; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const still = media.kind === 'image' ? media.src : media.poster;
  const asVideo = media.kind === 'video' && !media.crop;
  // trimBottom: the element is made taller than its (overflow hidden) frame, so the trimmed band
  // (a generator watermark) falls below the frame edge
  const style = {
    objectPosition: `50% ${Math.round((media.focusY ?? 0.5) * 100)}%`,
    ...(media.trimBottom ? { height: `${(100 / (1 - media.trimBottom)).toFixed(2)}%` } : {}),
  };

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = () => { v.preload = 'auto'; v.play().catch(() => {}); };
    const stop = () => v.pause();
    if (play === 'hover' && window.matchMedia('(hover: hover)').matches) {
      const host = v.closest<HTMLElement>('[data-cover-host]') ?? v;
      host.addEventListener('pointerenter', start);
      host.addEventListener('pointerleave', stop);
      host.addEventListener('focusin', start);
      host.addEventListener('focusout', stop);
      return () => {
        host.removeEventListener('pointerenter', start);
        host.removeEventListener('pointerleave', stop);
        host.removeEventListener('focusin', start);
        host.removeEventListener('focusout', stop);
        stop();
      };
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.5 });
    io.observe(v);
    return () => { io.disconnect(); stop(); };
  }, [play]);

  if (asVideo) {
    return (
      <video
        ref={ref}
        className={className}
        src={media.src}
        poster={media.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={media.alt}
        style={style}
      />
    );
  }
  if (!still) return null;
  // eslint-disable-next-line @next/next/no-img-element -- local assets today, Notion-proxied files later
  return <img className={className} src={still} alt={media.alt} loading="lazy" style={style} />;
}
