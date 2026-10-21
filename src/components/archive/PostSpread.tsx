import Link from 'next/link';
import type { Post } from '@/lib/content';
import { formatDate } from '@/lib/post-utils';
import { TextBlocks } from './TextBlocks';
import { LIST_HREF, type SheetItem } from './types';
import { Zoomable } from './Zoomable';

/** A post's heading: its title, or the date for a post whose caption had no words. */
export const postHeading = (post: Post) => (post.untitled ? `${formatDate(post.date)}의 기록` : post.title);

/*
 * An archive post (concept B "카드 펼침면", chosen 2026-10-21): the bean card and its description
 * laid open side by side at one height like a magazine spread, a short caption under them, the
 * caption text in a reading column, and one row at the foot: the newer post, the list, the older.
 * `hrefOf` makes the neighbours' links, so the design study can keep its own addresses.
 */
export function PostSpread({
  post, items, newer, older, hrefOf,
}: {
  post: Post;
  items: SheetItem[];
  newer: Post | null;
  older: Post | null;
  hrefOf: (slug: string) => string;
}) {
  const heading = postHeading(post);
  return (
    <article className="arc-sp">
      <p className="arc-sp-crumb">
        <Link href={LIST_HREF}>아카이브</Link>
        <span aria-hidden="true">/</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </p>

      <Zoomable items={items} title={heading} listClassName="arc-sp-spread" itemClassName="arc-sp-page" mediaClassName="arc-sp-img" />

      <header className="arc-sp-cap">
        <h1 className="arc-sp-title">{heading}</h1>
        <p className="arc-sp-meta">
          {!post.untitled && <time dateTime={post.date}>{formatDate(post.date)}</time>}
          <span>사진 {items.length}장</span>
          {post.permalink && <a href={post.permalink} target="_blank" rel="noopener">인스타그램 원문</a>}
          {post.sample && <span className="tag-sample">예시</span>}
        </p>
      </header>

      <TextBlocks blocks={post.body} className="arc-sp-text" />

      <nav className="arc-sp-nav" aria-label="다른 기록">
        <Side post={newer} label="최근 기록" dir="newer" hrefOf={hrefOf} />
        <Link href={LIST_HREF} className="arc-sp-list">목록</Link>
        <Side post={older} label="이전 기록" dir="older" hrefOf={hrefOf} />
      </nav>
    </article>
  );
}

function Side({ post, label, dir, hrefOf }: { post: Post | null; label: string; dir: 'newer' | 'older'; hrefOf: (slug: string) => string }) {
  const cls = `arc-sp-side arc-sp-side--${dir}`;
  if (!post) {
    return (
      <span className={`${cls} is-off`}>
        <span className="arc-sp-side-label">{label}</span>
        <span>없음</span>
      </span>
    );
  }
  return (
    <Link href={hrefOf(post.slug)} className={cls}>
      <span className="arc-sp-side-label">
        {dir === 'newer' && <span aria-hidden="true">‹ </span>}
        {label}
        {dir === 'older' && <span aria-hidden="true"> ›</span>}
      </span>
      <span className="arc-sp-side-title">{post.untitled ? formatDate(post.date) : post.title}</span>
    </Link>
  );
}
