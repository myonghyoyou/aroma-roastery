import Link from 'next/link';
import type { Post } from '@/lib/content';
import { formatDate, postHref } from '@/lib/post-utils';
import { CoverMedia } from './CoverMedia';

/*
 * Archive, layout A: an index of rows, date and title first, with the cover kept small at the end
 * of the row. Nothing plays behind the page: the list stays on the still field.
 */
export function ArchiveIndex({ posts }: { posts: Post[] }) {
  return (
    <ol className="index-list">
      {posts.map((p) => (
        <li key={p.slug}>
          <Link href={postHref(p)} className="index-row">
            <time dateTime={p.date}>{formatDate(p.date)}</time>
            <span className="index-text">
              <span className="index-title">{p.title}</span>
              <span className="index-summary">{p.summary}</span>
            </span>
            <span className="index-thumb">
              {p.cover ? <CoverMedia media={p.cover} className="cover-fill" /> : <span className="cover-empty" />}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
