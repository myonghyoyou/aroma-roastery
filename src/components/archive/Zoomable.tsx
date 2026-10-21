'use client';

import { useRef, useState } from 'react';
import { Lightbox } from './Lightbox';
import type { SheetItem } from './types';
import { MediaView } from './MediaView';

/*
 * A post's photos as a list, each opening the archive lightbox. Each concept lays the list out with
 * its own classes; a video is not wrapped in a button, so its own controls keep working.
 */
export function Zoomable({
  items,
  title,
  listClassName,
  itemClassName,
  mediaClassName,
  numbered = false,
}: {
  items: SheetItem[];
  title: string;
  listClassName: string;
  itemClassName?: string;
  mediaClassName?: string;
  /** a small frame number under each photo */
  numbered?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <>
      <ol className={listClassName}>
        {items.map((item, i) => (
          <li key={item.key} className={itemClassName}>
            {item.photo.video ? (
              <MediaView photo={item.photo} className={mediaClassName} eager={i < 2} />
            ) : (
              <button
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                type="button"
                className="arc-zoom"
                aria-haspopup="dialog"
                aria-label={`${i + 1}번째 사진 크게 보기`}
                onClick={() => setOpen(i)}
              >
                <MediaView photo={item.photo} className={mediaClassName} eager={i < 2} />
              </button>
            )}
            {numbered && <span className="arc-no">{String(i + 1).padStart(2, '0')}</span>}
          </li>
        ))}
      </ol>
      {open !== null && (
        <Lightbox
          items={items}
          index={open}
          onIndexChange={setOpen}
          onClose={(i) => {
            setOpen(null);
            requestAnimationFrame(() => buttons.current[i]?.focus());
          }}
          showPostLink={false}
          label={`${title} 사진 크게 보기`}
        />
      )}
    </>
  );
}
