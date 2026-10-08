'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { ArchiveCategory, Photo } from '@/lib/content';
import { CATEGORY_LABEL, formatDate } from '@/lib/post-utils';
import { frameLabel, LAB_C_LEAF, labCHref } from './shared';

export type LabCStripPost = {
  slug: string;
  title: string;
  date: string;
  category?: ArchiveCategory;
  photos: Photo[];
};

const PAGE = 6;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/*
 * One post as one strip of film: a title card, then every photo at the same height and its own width.
 * Native horizontal scrolling with scroll-snap; on wide screens two small buttons move the strip by one view.
 * The ends of the strip are watched with IntersectionObserver (no scroll listeners).
 */
function Strip({ post, roll, eager, titleRef }: { post: LabCStripPost; roll: number; eager: boolean; titleRef?: (el: HTMLAnchorElement | null) => void }) {
  const reelRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLLIElement>(null);
  const endRef = useRef<HTMLLIElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const total = post.photos.length;
  const headingId = `lab-c-strip-${post.slug}`;

  useEffect(() => {
    const reel = reelRef.current;
    const start = startRef.current;
    const end = endRef.current;
    if (!reel || !start || !end) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const visible = e.intersectionRatio > 0.9;
          if (e.target === start) setAtStart(visible);
          if (e.target === end) setAtEnd(visible);
        }
      },
      { root: reel, threshold: [0, 0.9, 1] },
    );
    io.observe(start);
    io.observe(end);
    return () => io.disconnect();
  }, []);

  function move(dir: -1 | 1) {
    const reel = reelRef.current;
    if (!reel) return;
    if ((dir === -1 && atStart) || (dir === 1 && atEnd)) return;
    reel.scrollBy({ left: dir * reel.clientWidth * 0.86, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  return (
    <section className="lab-c-strip" aria-labelledby={headingId}>
      <div className="lab-c-reel" ref={reelRef} tabIndex={0} role="group" aria-label={`${post.title}, 사진 ${total}장, 옆으로 넘겨 보기`}>
        <ol className="lab-c-cells">
          <li className="lab-c-card" ref={startRef}>
            <p className="lab-c-card-meta">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.category && (
                <span className="lab-c-cat">
                  <i className="lab-c-dot" style={{ background: LAB_C_LEAF[post.category] }} aria-hidden="true" />
                  {CATEGORY_LABEL[post.category]}
                </span>
              )}
            </p>
            <h2 className="lab-c-card-title" id={headingId}>
              <Link href={labCHref(post.slug)} ref={titleRef} className="lab-c-card-link">{post.title}</Link>
            </h2>
            <p className="lab-c-card-count">
              <span className="lab-c-roll">ROLL {String(roll).padStart(2, '0')}</span>
              <span>사진 {total}장</span>
            </p>
          </li>
          {post.photos.map((ph, i) => (
            <li key={`${ph.src}-${i}`} className="lab-c-frame" ref={i === total - 1 ? endRef : undefined}>
              <Link href={`${labCHref(post.slug)}#lab-c-f${i + 1}`} tabIndex={-1} className="lab-c-frame-link">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ph.src}
                  width={ph.w}
                  height={ph.h}
                  alt={ph.alt}
                  loading={eager && i < 4 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="lab-c-frame-img"
                />
              </Link>
              <span className="lab-c-frame-no" aria-hidden="true">{frameLabel(i, total)}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="lab-c-strip-ctrl">
        <button type="button" className="lab-c-nav" aria-label={`${post.title}: 앞 사진`} aria-disabled={atStart} onClick={() => move(-1)}>
          <span aria-hidden="true">&larr;</span>
        </button>
        <button type="button" className="lab-c-nav" aria-label={`${post.title}: 다음 사진`} aria-disabled={atEnd} onClick={() => move(1)}>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </section>
  );
}

/** The whole list: six strips first, then six more per "더 보기". Focus moves to the first new strip. */
export function FilmStrips({ posts }: { posts: LabCStripPost[] }) {
  const [shown, setShown] = useState(Math.min(PAGE, posts.length));
  const focusIndex = useRef<number | null>(null);
  const titles = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (focusIndex.current !== null) {
      titles.current[focusIndex.current]?.focus();
      focusIndex.current = null;
    }
  }, [shown]);

  function more() {
    focusIndex.current = shown;
    setShown((n) => Math.min(n + PAGE, posts.length));
  }

  return (
    <>
      <div className="lab-c-strips">
        {posts.slice(0, shown).map((p, i) => (
          <Strip
            key={p.slug}
            post={p}
            roll={i + 1}
            eager={i === 0}
            titleRef={(el) => {
              titles.current[i] = el;
            }}
          />
        ))}
      </div>
      <div className="lab-c-more">
        <p className="lab-c-more-count" aria-live="polite">
          {shown} / {posts.length}
        </p>
        {shown < posts.length && (
          <button type="button" className="lab-c-more-btn" onClick={more}>
            더 보기
          </button>
        )}
      </div>
    </>
  );
}
