import Link from 'next/link';
import type { Block, Post } from '@/lib/content';
import { formatDate, postHref, TYPE_LABEL } from '@/lib/post-utils';
import { CoverMedia } from './CoverMedia';

function BodyBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return <p>{block.text}</p>;
    case 'heading':
      return <h2>{block.text}</h2>;
    case 'quote':
      return <blockquote>{block.text}</blockquote>;
    case 'list':
      return <ul>{block.items.map((t) => <li key={t}>{t}</li>)}</ul>;
    case 'gallery':
      return (
        <div className={`article-gallery is-${block.layout}`}>
          {block.photos.map((ph) => (
            <span key={ph.src} className="article-media"><CoverMedia media={ph} className="cover-fill" /></span>
          ))}
        </div>
      );
    case 'media':
      return (
        <figure>
          <span className="article-media"><CoverMedia media={block.media} className="cover-fill" /></span>
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
  }
}

/*
 * One post: the title on the still field, then the cover photo, then the body in a reading column.
 */
export function PostArticle({ post, newer, older }: { post: Post; newer: Post | null; older: Post | null }) {
  const list = `/${post.type}`;
  return (
    <article className="article">
      <header className="article-head">
        <div className="article-title">
          <p className="article-meta">
            <Link href={list}>{TYPE_LABEL[post.type]}</Link>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.sample && <span className="tag-sample">예시</span>}
          </p>
          <h1>{post.title}</h1>
        </div>
      </header>

      {post.cover && (
        <figure className="article-figure">
          <CoverMedia media={post.cover} className="cover-fill" />
        </figure>
      )}

      <div className="article-body">
        {post.body.map((b, i) => <BodyBlock key={i} block={b} />)}
      </div>

      <nav className="article-nav" aria-label="다른 글">
        {newer ? (
          <Link href={postHref(newer)} className="article-nav-item" rel="prev">
            <span>다음 글</span>
            <strong>{newer.title}</strong>
          </Link>
        ) : <span />}
        {older ? (
          <Link href={postHref(older)} className="article-nav-item is-older" rel="next">
            <span>이전 글</span>
            <strong>{older.title}</strong>
          </Link>
        ) : <span />}
      </nav>
      <p className="article-back"><Link href={list}>{TYPE_LABEL[post.type]} 목록</Link></p>
    </article>
  );
}
