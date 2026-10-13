import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPeriod, NL_E_BASE, nlEHref } from '@/components/news-lab/e/shared';
import { SubPage } from '@/components/site/SubPage';
import { getAdjacentPosts, getPost, getPosts, type Block, type Post } from '@/lib/content';
import { formatDate, TOPIC_LABEL } from '@/lib/post-utils';
import '@/components/news-lab/e/e.css';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts('news');
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPost('news', (await params).slug);
  if (!post) return {};
  return { title: `${post.title} | aroma roastery`, description: post.summary };
}

/* Body blocks of the letter. Stills only: a video block shows its poster or nothing. */
function LetterBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return <p>{block.text}</p>;
    case 'heading':
      return <h2 className="nl-e-letter-h">{block.text}</h2>;
    case 'quote':
      return (
        <blockquote className="nl-e-letter-quote">
          <p>{block.text}</p>
        </blockquote>
      );
    case 'list':
      return (
        <ul className="nl-e-letter-list">
          {block.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      );
    case 'media': {
      const src = block.media.kind === 'image' ? block.media.src : block.media.poster;
      if (!src) return null;
      return (
        <figure className="nl-e-letter-figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={block.media.alt} loading="lazy" decoding="async" />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    }
    case 'gallery':
      return (
        <div className={`nl-e-letter-gallery nl-e-letter-gallery--${block.layout}`}>
          {block.photos.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.src} src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" />
          ))}
        </div>
      );
    default:
      return null;
  }
}

function AdjacentLink({ post, dir }: { post: Post | null; dir: 'newer' | 'older' }) {
  const label = dir === 'newer' ? '다음 소식' : '이전 소식';
  if (!post) {
    return (
      <div className={`nl-e-adj nl-e-adj--${dir} nl-e-adj--none`}>
        <span className="nl-e-adj-label">{label}</span>
        <span className="nl-e-adj-title">없음</span>
      </div>
    );
  }
  return (
    <Link href={nlEHref(post.slug)} className={`nl-e-adj nl-e-adj--${dir}`}>
      <span className="nl-e-adj-label">{label}</span>
      <span className="nl-e-adj-title">{post.title}</span>
      <time className="nl-e-adj-date" dateTime={post.date}>{formatDate(post.date)}</time>
    </Link>
  );
}

export default async function NewsLabEPost({ params }: Params) {
  const post = await getPost('news', (await params).slug);
  if (!post) notFound();
  const { newer, older } = await getAdjacentPosts(post);
  const topic = post.topic ?? 'notice';
  const cover = post.cover && (post.cover.kind === 'image' ? post.cover.src : post.cover.poster);

  return (
    <SubPage current="news">
      <article className="nl-e nl-e-letter-page">
        <p className="nl-e-crumb nl-e-letter-crumb">
          <Link href={NL_E_BASE}>소식</Link>
          <span aria-hidden="true">/</span>
          <span>E 매장 알림판</span>
        </p>

        <div className="nl-e-letter">
          <header className="nl-e-letter-head">
            <p className="nl-e-stamp">
              <time dateTime={post.date} className="nl-e-stamp-date">{formatDate(post.date)}</time>
              <span className="nl-e-topic" data-topic={topic}>{TOPIC_LABEL[topic]}</span>
              {post.sample && <span className="tag-sample">예시</span>}
            </p>
            <p className="nl-e-greeting">안녕하세요, 아로마로스터리입니다.</p>
            <h1 className="nl-e-subject">{post.title}</h1>
          </header>

          {post.period && (
            <aside className="nl-e-period" aria-label="해당 날짜" data-topic={topic}>
              <span className="nl-e-period-label">해당 날짜</span>
              <span className="nl-e-period-value">{formatPeriod(post.period)}</span>
            </aside>
          )}

          {cover && (
            <figure className="nl-e-letter-cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt={post.cover!.alt} decoding="async" />
            </figure>
          )}

          <div className="nl-e-letter-body">
            {post.body.map((block, i) => (
              <LetterBlock key={i} block={block} />
            ))}
          </div>

          <footer className="nl-e-signoff">
            <span className="nl-e-signoff-rule" aria-hidden="true" />
            <p className="nl-e-signoff-thanks">늘 찾아 주셔서 고맙습니다.</p>
            <p className="nl-e-signoff-name">아로마로스터리 드림</p>
          </footer>
        </div>

        <nav className="nl-e-adjs" aria-label="다른 소식">
          <AdjacentLink post={older} dir="older" />
          <AdjacentLink post={newer} dir="newer" />
        </nav>
        <p className="nl-e-back">
          <Link href={NL_E_BASE}>소식 목록으로</Link>
        </p>
      </article>
    </SubPage>
  );
}
