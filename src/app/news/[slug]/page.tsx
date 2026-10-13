import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NewsCard } from '@/components/news/NewsCard';
import { LIST_HREF, formatPeriod, pickRelated, toCard } from '@/components/news/types';
import { SubPage } from '@/components/site/SubPage';
import { getPost, getPosts, type Block } from '@/lib/content';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import '@/components/news/news.css';

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

/* Text blocks only: the concept shows one still at the top and never plays video. */
function TextBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return <p>{block.text}</p>;
    case 'heading':
      return <h2>{block.text}</h2>;
    case 'quote':
      return (
        <blockquote>
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

export default async function NewsPost({ params }: Params) {
  const post = await getPost('news', (await params).slug);
  if (!post) notFound();
  const posts = await getPosts('news');
  const related = pickRelated(post, posts);
  const card = toCard(post);
  const topic = card.topic;

  return (
    <SubPage current="news">
      <article className="nws nws-post" data-topic={topic}>
        <p className="nws-crumb nws-post-crumb">
          <Link href={LIST_HREF}>소식</Link>
          <span aria-hidden="true">/</span>
          <span>{TOPIC_LABEL[topic]}</span>
        </p>

        {card.cover ? (
          <figure className="nws-hero">
            {/* eslint-disable-next-line @next/next/no-img-element -- plain still, sized by the frame */}
            <img className="nws-img" src={card.cover.src} alt={card.cover.alt} fetchPriority="high" decoding="async" />
          </figure>
        ) : (
          <div className="nws-hero nws-hero--field">
            <span className="nws-field" aria-hidden="true" />
            <h1 className="nws-hero-title">{post.title}</h1>
          </div>
        )}

        <header className="nws-post-head">
          <p className="nws-post-meta">
            {post.pinned && <span className="nws-pin">고정</span>}
            <span className="nws-topic">{TOPIC_LABEL[topic]}</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.period && (
              <span className="nws-period">
                해당 날짜 <strong>{formatPeriod(post.period)}</strong>
              </span>
            )}
            {post.sample && <span className="tag-sample">예시</span>}
          </p>
          {card.cover && <h1 className="nws-post-title">{post.title}</h1>}
          <p className="nws-post-summary">{post.summary}</p>
        </header>

        <div className="nws-body">
          {post.body.map((block, i) => (
            <TextBlock key={i} block={block} />
          ))}
        </div>

        {/* where the reading ends: back to the list, or on to the post on Instagram */}
        <p className="nws-back">
          <Link href={LIST_HREF}>소식 목록으로</Link>
          {post.permalink && (
            <a href={post.permalink} target="_blank" rel="noopener">인스타그램에서 보기</a>
          )}
        </p>

        {related.length > 0 && (
          <section className="nws-related" aria-labelledby="nws-related-h">
            <div className="nws-related-head">
              <h2 id="nws-related-h">다른 소식</h2>
              <Link href={LIST_HREF} className="nws-more">
                소식 전체 보기
              </Link>
            </div>
            <ul className="nws-grid nws-grid--related">
              {related.map((c) => (
                <li key={c.slug} className="nws-cell">
                  <NewsCard card={c} idPrefix="nws-rel" headingLevel={3} />
                </li>
              ))}
            </ul>
          </section>
        )}

      </article>
    </SubPage>
  );
}
