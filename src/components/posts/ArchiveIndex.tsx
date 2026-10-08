'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Post } from '@/lib/content';
import { formatDate, postHref } from '@/lib/post-utils';
import { CoverMedia } from './CoverMedia';

/*
 * Archive, layout A: an index of rows. On fine pointers, the hovered (or focused) row's cover
 * rises behind the whole list, the way covers surface through the colour field on the home page;
 * the other rows step back. Touch screens get a small cover inside each row instead.
 */
export function ArchiveIndex({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className={`index${active ? ' has-active' : ''}`} onPointerLeave={() => setActive(null)}>
      <div className="index-backdrop" aria-hidden="true">
        {posts.map((p) => p.cover && (
          <div key={p.slug} className={`index-backdrop-item${active === p.slug ? ' is-on' : ''}`}>
            <CoverMedia media={p.cover} play="controlled" active={active === p.slug} className="cover-fill" />
          </div>
        ))}
      </div>
      <ol className="index-list">
        {posts.map((p) => (
          <li key={p.slug} className={active === p.slug ? 'is-active' : undefined}>
            <Link
              href={postHref(p)}
              className="index-row"
              onPointerEnter={() => setActive(p.slug)}
              onFocus={() => setActive(p.slug)}
              onBlur={() => setActive(null)}
            >
              <time dateTime={p.date}>{formatDate(p.date)}</time>
              <span className="index-text">
                <span className="index-title">{p.title}</span>
                <span className="index-summary">{p.summary}</span>
              </span>
              {p.cover && (
                <span className="index-thumb">
                  <CoverMedia media={p.cover} play="view" className="cover-fill" />
                </span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
