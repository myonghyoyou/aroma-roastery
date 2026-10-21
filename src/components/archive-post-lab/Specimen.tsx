'use client';

import { useState } from 'react';
import { Lightbox } from '@/components/archive/Lightbox';
import type { SheetItem } from '@/components/archive/types';
import { MediaView } from '@/components/archive/MediaView';

/* C's photo block: one large frame, the post's photos as small frames below to switch it. */
export function Specimen({ items, title }: { items: SheetItem[]; title: string }) {
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const item = items[at];
  if (!item) return null;

  return (
    <div className="apl-c-specimen">
      <div className="apl-c-main">
        {item.photo.video ? (
          <MediaView key={item.key} photo={item.photo} className="apl-c-img" eager />
        ) : (
          <button type="button" className="arc-zoom" aria-haspopup="dialog" aria-label={`${at + 1}번째 사진 크게 보기`} onClick={() => setOpen(at)}>
            <MediaView key={item.key} photo={item.photo} className="apl-c-img" eager />
          </button>
        )}
      </div>
      {items.length > 1 && (
        <div className="apl-c-thumbs" role="group" aria-label="사진 고르기">
          {items.map((it, i) => (
            <button
              key={it.key}
              type="button"
              className="apl-c-thumb"
              aria-pressed={i === at}
              aria-label={`${i + 1}번째 사진`}
              onClick={() => setAt(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.photo.src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
      {open !== null && (
        <Lightbox items={items} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} showPostLink={false} label={`${title} 사진 크게 보기`} />
      )}
    </div>
  );
}
