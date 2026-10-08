'use client';

import { useEffect, useRef, useState } from 'react';
import { Lightbox } from './Lightbox';
import type { SheetItem } from './types';

/* The photos of one post as a regular contact sheet with frame numbers; each opens the lightbox. */
export function PostSheet({ items, title }: { items: SheetItem[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const focusIndex = useRef<number | null>(null);

  useEffect(() => {
    if (open !== null || focusIndex.current === null) return;
    cells.current[focusIndex.current]?.focus();
    focusIndex.current = null;
  }, [open]);

  return (
    <>
      <ol className="lab-d-post-grid">
        {items.map((item, i) => (
          <li key={item.key} className="lab-d-post-cell">
            <button
              ref={(el) => {
                cells.current[i] = el;
              }}
              type="button"
              className="lab-d-post-shot"
              aria-haspopup="dialog"
              onClick={() => setOpen(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.photo.src}
                width={item.photo.w}
                height={item.photo.h}
                alt={item.photo.alt}
                loading={i < 6 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </button>
            <p className="lab-d-post-frame">
              <span className="lab-d-post-no">{String(item.frame).padStart(2, '0')}</span>
              {item.photo.caption && <span className="lab-d-post-cap">{item.photo.caption}</span>}
            </p>
          </li>
        ))}
      </ol>

      {open !== null && (
        <Lightbox
          items={items}
          index={open}
          onIndexChange={setOpen}
          onClose={(i) => {
            focusIndex.current = i;
            setOpen(null);
          }}
          showPostLink={false}
          label={`${title} 사진 크게 보기`}
        />
      )}
    </>
  );
}
