import Link from 'next/link';
import type { Post } from '@/lib/content';
import { formatDate } from '@/lib/post-utils';
import { labHref } from './concepts';
import { TextBlocks, type PostView } from './shared';
import { Zoomable } from './Zoomable';

/*
 * B: the bean card and its description laid open side by side at one height, like a spread in a
 * magazine, with a short caption under them. One row at the foot: the newer post, the list, the
 * older post.
 */
export function ConceptB({ v }: { v: PostView }) {
  const { post, items, heading, newer, older } = v;
  return (
    <article className="apl-b">
      <p className="apl-crumb">
        <Link href="/archive">아카이브</Link>
        <span aria-hidden="true">/</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </p>

      <Zoomable items={items} title={heading} listClassName="apl-b-spread" itemClassName="apl-b-page" mediaClassName="apl-b-img" />

      <header className="apl-b-cap">
        <h1 className="apl-b-title">{heading}</h1>
        <p className="apl-meta">
          {!post.untitled && <time dateTime={post.date}>{formatDate(post.date)}</time>}
          <span>사진 {items.length}장</span>
          {post.permalink && <a href={post.permalink} target="_blank" rel="noopener">인스타그램 원문</a>}
        </p>
      </header>

      <TextBlocks blocks={post.body} className="apl-text apl-b-text" />

      <nav className="apl-b-nav" aria-label="다른 기록">
        <Side post={newer} label="최근 기록" dir="newer" />
        <Link href="/archive" className="apl-btn apl-b-list">목록</Link>
        <Side post={older} label="이전 기록" dir="older" />
      </nav>
    </article>
  );
}

function Side({ post, label, dir }: { post: Post | null; label: string; dir: 'newer' | 'older' }) {
  const cls = `apl-b-side apl-b-side--${dir}`;
  if (!post) return <span className={`${cls} is-off`}><span className="apl-b-side-label">{label}</span><span>없음</span></span>;
  return (
    <Link href={labHref('b', post.slug)} className={cls}>
      <span className="apl-b-side-label">{dir === 'newer' ? '‹ ' : ''}{label}{dir === 'older' ? ' ›' : ''}</span>
      <span className="apl-b-side-title">{post.untitled ? formatDate(post.date) : post.title}</span>
    </Link>
  );
}
