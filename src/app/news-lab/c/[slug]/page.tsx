import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NewsCard } from '@/components/news-lab/c/NewsCard';
import { LIST_HREF, formatPeriod, pickRelated, toCard } from '@/components/news-lab/c/types';
import { SubPage } from '@/components/site/SubPage';
import { getPost, getPosts, type Block } from '@/lib/content';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import '@/components/news-lab/c/c.css';

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

export default async function NewsLabCPost({ params }: Params) {
  const post = await getPost('news', (await params).slug);
  if (!post) notFound();
  const posts = await getPosts('news');
  const related = pickRelated(post, posts);
  const card = toCard(post);
  const topic = card.topic;

  return (
    <SubPage current="news">
      <article className="nl-c nl-c-post" data-topic={topic}>
        <p className="nl-c-crumb nl-c-post-crumb">
          <Link href={LIST_HREF}>소식</Link>
          <span aria-hidden="true">/</span>
          <span>{TOPIC_LABEL[topic]}</span>
        </p>

        {card.cover ? (
          <figure className="nl-c-hero">
            {/* eslint-disable-next-line @next/next/no-img-element -- plain still, sized by the frame */}
            <img className="nl-c-img" src={card.cover.src} alt={card.cover.alt} fetchPriority="high" decoding="async" />
          </figure>
        ) : (
          <div className="nl-c-hero nl-c-hero--field">
            <span className="nl-c-field" aria-hidden="true" />
            <h1 className="nl-c-hero-title">{post.title}</h1>
          </div>
        )}

        <header className="nl-c-post-head">
          <p className="nl-c-post-meta">
            {post.pinned && <span className="nl-c-pin">고정</span>}
            <span className="nl-c-topic">{TOPIC_LABEL[topic]}</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.period && (
              <span className="nl-c-period">
                해당 날짜 <strong>{formatPeriod(post.period)}</strong>
              </span>
            )}
            {post.sample && <span className="tag-sample">예시</span>}
          </p>
          {card.cover && <h1 className="nl-c-post-title">{post.title}</h1>}
          <p className="nl-c-post-summary">{post.summary}</p>
        </header>

        <div className="nl-c-body">
          {post.body.map((block, i) => (
            <TextBlock key={i} block={block} />
          ))}
        </div>

        {related.length > 0 && (
          <section className="nl-c-related" aria-labelledby="nl-c-related-h">
            <div className="nl-c-related-head">
              <h2 id="nl-c-related-h">다른 소식</h2>
              <Link href={LIST_HREF} className="nl-c-more">
                소식 전체 보기
              </Link>
            </div>
            <ul className="nl-c-grid nl-c-grid--related">
              {related.map((c) => (
                <li key={c.slug} className="nl-c-cell">
                  <NewsCard card={c} idPrefix="nl-c-rel" headingLevel={3} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="nl-c-back">
          <Link href={LIST_HREF}>소식 목록으로</Link>
        </p>
      </article>
    </SubPage>
  );
}
