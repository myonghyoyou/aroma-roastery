'use client';

import { useState } from 'react';
import { MediaView } from '@/components/archive/MediaView';
import type { Photo } from '@/lib/content';

/*
 * E3's photos, after La Cabra's product media: one large frame and the post's photos as small
 * frames under it to switch. On a phone the small frames give way to a swipe through the large one.
 */
export function Gallery({ photos }: { photos: Photo[] }) {
  const [at, setAt] = useState(0);
  const photo = photos[at];
  if (!photo) return null;
  return (
    <div className="npl-e3-gallery">
      <div
        className="npl-e3-main"
        onPointerDown={(e) => { (e.currentTarget as HTMLElement).dataset.x = e.pointerType === 'mouse' ? '' : String(e.clientX); }}
        onPointerUp={(e) => {
          const x = Number((e.currentTarget as HTMLElement).dataset.x);
          if (!x || photos.length < 2) return;
          const dx = e.clientX - x;
          if (Math.abs(dx) > 48) setAt((i) => (i + (dx < 0 ? 1 : -1) + photos.length) % photos.length);
        }}
      >
        <MediaView key={photo.src} photo={photo} className="npl-e3-img" eager />
      </div>
      {photos.length > 1 && (
        <div className="npl-e3-thumbs" role="group" aria-label="사진 고르기">
          {photos.map((p, i) => (
            <button key={p.src + i} type="button" className="npl-e3-thumb" aria-pressed={i === at} aria-label={`${i + 1}번째 사진`} onClick={() => setAt(i)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
      {photos.length > 1 && <p className="npl-e3-dots" aria-hidden="true">{photos.map((p, i) => <span key={p.src + i} className={i === at ? 'is-on' : undefined} />)}</p>}
    </div>
  );
}
