import Link from 'next/link';
import type { Post } from '@/lib/content';
import { formatDate, postHref } from '@/lib/post-utils';
import { CoverMedia } from './CoverMedia';

/*
 * Archive, layout B: a staggered journal grid. Covers lead; wide and tall frames alternate across
 * the two columns, and every second row drops a little so the page reads like a contact sheet
 * rather than a card grid.
 */
export function ArchiveGrid({ posts }: { posts: Post[] }) {
  return (
    <ol className="journal">
      {posts.map((p, i) => (
        <li key={p.slug} className={`journal-item journal-item--${i % 4}`}>
          <Link href={postHref(p)} className="journal-link">
            <span className="journal-cover">
              {p.cover ? <CoverMedia media={p.cover} className="cover-fill" /> : <span className="cover-empty" />}
            </span>
            <span className="journal-meta">
              <time dateTime={p.date}>{formatDate(p.date)}</time>
            </span>
            <span className="journal-title">{p.title}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
