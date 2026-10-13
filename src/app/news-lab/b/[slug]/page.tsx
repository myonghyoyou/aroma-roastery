import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MiniMonth } from '@/components/news-lab/b/MiniMonth';
import { LIST_HREF, dayLabel, itemHref, monthOf, periodDays, rangeLabel, toItem } from '@/components/news-lab/b/cal';
import { SubPage } from '@/components/site/SubPage';
import { getAdjacentPosts, getPost, getPosts, type Block, type Post } from '@/lib/content';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import '@/components/news-lab/b/b.css';

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

function BodyBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="nl-b-p">{block.text}</p>;
    case 'heading':
      return <h2 className="nl-b-h">{block.text}</h2>;
    case 'quote':
      return (
        <blockquote className="nl-b-quote">
          <p>{block.text}</p>
        </blockquote>
      );
    case 'list':
      return (
        <ul className="nl-b-list">
          {block.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

function Adjacent({ post, dir }: { post: Post | null; dir: 'newer' | 'older' }) {
  const label = dir === 'newer' ? '다음 소식' : '이전 소식';
  if (!post) {
    return (
      <div className={`nl-b-adj-item is-${dir} is-none`}>
        <span className="nl-b-adj-dir">{label}</span>
        <span className="nl-b-adj-none">없음</span>
      </div>
    );
  }
  return (
    <Link href={itemHref(post.slug)} className={`nl-b-adj-item is-${dir}`}>
      <span className="nl-b-adj-dir">{label}</span>
      <strong>{post.title}</strong>
      <time dateTime={post.date} className="nl-b-adj-date">{formatDate(post.date)}</time>
    </Link>
  );
}

export default async function NewsLabBPost({ params }: Params) {
  const post = await getPost('news', (await params).slug);
  if (!post) notFound();
  const { newer, older } = await getAdjacentPosts(post);
  const item = toItem(post);
  const days = periodDays(item.period);
  const months = [...new Set(days.map(monthOf))];
  const multi = item.period && item.period.start !== item.period.end;

  return (
    <SubPage current="news">
      <article className="nl-b nl-b-post" data-topic={item.topic}>
        <p className="nl-b-crumb">
          <Link href={LIST_HREF}>소식</Link>
          <span aria-hidden="true">/</span>
          <span>B 운영 달력</span>
        </p>

        <header className="nl-b-post-head">
          <p className="nl-b-post-meta">
            <span className="nl-b-topic" data-topic={item.topic}>
              <span className="nl-b-dot" aria-hidden="true" />
              {TOPIC_LABEL[item.topic]}
            </span>
            <span>
              게시 <time dateTime={post.date}>{dayLabel(post.date)}</time>
            </span>
            {post.sample && <span className="tag-sample">예시</span>}
          </p>
          <h1 className="nl-b-post-title">{post.title}</h1>
          <p className="nl-b-post-summary">{post.summary}</p>
        </header>

        <div className={item.period ? 'nl-b-post-layout has-period' : 'nl-b-post-layout'}>
          {item.period && (
            <aside className="nl-b-when" aria-label="해당 날짜">
              <p className="nl-b-when-line">
                <span className="nl-b-when-k">해당 날짜</span>
                <span className="nl-b-when-v">{rangeLabel(item.period)}</span>
                {multi && <span className="nl-b-when-n">{days.length}일간</span>}
              </p>
              {months.map((ym) => (
                <MiniMonth key={ym} ym={ym} days={days} topic={item.topic} />
              ))}
            </aside>
          )}

          <div className="nl-b-post-main">
            {post.cover && post.cover.kind === 'image' && (
              <figure className="nl-b-cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.cover.src} alt={post.cover.alt} />
              </figure>
            )}
            <div className="nl-b-body">
              {post.body.map((block, i) => (
                <BodyBlock key={i} block={block} />
              ))}
            </div>
          </div>
        </div>

        <nav className="nl-b-adj" aria-label="다른 소식">
          <Adjacent post={older} dir="older" />
          <Adjacent post={newer} dir="newer" />
        </nav>
        <p className="nl-b-back">
          <Link href={LIST_HREF}>소식 달력으로</Link>
        </p>
      </article>
    </SubPage>
  );
}
