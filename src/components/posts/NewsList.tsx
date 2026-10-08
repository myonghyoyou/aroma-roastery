import Link from 'next/link';
import type { Post } from '@/lib/content';
import { formatDate, postHref } from '@/lib/post-utils';

/** News: notices are read, not browsed, so the list is text first: date, title, one line. */
export function NewsList({ posts }: { posts: Post[] }) {
  return (
    <ol className="news-list">
      {posts.map((p) => (
        <li key={p.slug}>
          <Link href={postHref(p)} className="news-row">
            <time dateTime={p.date}>{formatDate(p.date)}</time>
            <span className="news-title">{p.title}</span>
            <span className="news-summary">{p.summary}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
