import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostSheet } from '@/components/archive/PostSheet';
import { LIST_HREF, sheetHref, toSheetItems } from '@/components/archive/types';
import { SubPage } from '@/components/site/SubPage';
import { getAdjacentPosts, getPost, getPosts, type Block, type Post } from '@/lib/content';
import { CATEGORY_LABEL, formatDate } from '@/lib/post-utils';
import '@/components/archive/archive.css';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts('archive');
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPost('archive', (await params).slug);
  if (!post) return {};
  return { title: `${post.title} | aroma roastery`, description: post.summary };
}

/* Text blocks only: the photos are already on the sheet above, and the archive never shows video. */
function TextBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return <p>{block.text}</p>;
    case 'heading':
      return <h2>{block.text}</h2>;
    case 'quote':
      return (
        <blockquote className="arc-quote">
          <p>{block.text}</p>
        </blockquote>
      );
    case 'list':
      return (
        <ul>
          {block.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

function AdjacentLink({ post, dir }: { post: Post | null; dir: 'newer' | 'older' }) {
  const label = dir === 'newer' ? '최근 기록' : '이전 기록';
  if (!post) {
    return (
      <div className={`arc-adj arc-adj--${dir} arc-adj--none`}>
        <span className="arc-adj-label">{label}</span>
        <span className="arc-adj-title">없음</span>
      </div>
    );
  }
  return (
    <Link href={sheetHref(post.slug)} className={`arc-adj arc-adj--${dir}`}>
      <span className="arc-adj-label">
        {label}
      </span>
      <span className="arc-adj-title">{post.title}</span>
      <time className="arc-adj-date" dateTime={post.date}>
        {formatDate(post.date)}
      </time>
    </Link>
  );
}

export default async function ArchivePost({ params }: Params) {
  const post = await getPost('archive', (await params).slug);
  if (!post) notFound();
  const { newer, older } = await getAdjacentPosts(post);
  const items = toSheetItems([post]);

  return (
    <SubPage current="archive">
      <article className="arc arc-post">
        <header className="arc-post-head">
          <p className="arc-post-meta">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.category && (
              <span className="arc-cat" data-cat={post.category}>
                {CATEGORY_LABEL[post.category]}
              </span>
            )}
            <span>사진 {items.length}장</span>
            {post.sample && <span className="tag-sample">예시</span>}
          </p>
          <h1 className="arc-post-title">{post.title}</h1>
        </header>

        {items.length > 0 && (
          <section aria-label="사진">
            <PostSheet items={items} title={post.title} />
          </section>
        )}

        <div className="arc-body">
          {post.body.map((block, i) => (
            <TextBlock key={i} block={block} />
          ))}
        </div>

        <nav className="arc-adjs" aria-label="다른 기록">
          <AdjacentLink post={newer} dir="newer" />
          <AdjacentLink post={older} dir="older" />
        </nav>
        <p className="arc-back">
          <Link href={LIST_HREF}>아카이브 목록으로</Link>
          {post.permalink && (
            <>
              {' '}
              <a href={post.permalink} target="_blank" rel="noopener">인스타그램에서 보기</a>
            </>
          )}
        </p>
      </article>
    </SubPage>
  );
}
