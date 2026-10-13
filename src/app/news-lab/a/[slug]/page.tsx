import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LIST_HREF, dateWithDay, rowHref, toRows } from '@/components/news-lab/a/rows';
import { SubPage } from '@/components/site/SubPage';
import { getAdjacentPosts, getPost, getPosts, type Block, type Post } from '@/lib/content';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import '@/components/news-lab/a/a.css';

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

/* Text blocks, plus photos as still images. News never shows video. */
function BodyBlock({ block }: { block: Block }) {
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
    case 'media':
      if (block.media.kind !== 'image') return null;
      return (
        <figure className="nl-a-figure">
          <span className="nl-a-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.media.src} alt={block.media.alt} loading="lazy" decoding="async" />
          </span>
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case 'gallery':
      return (
        <div className="nl-a-gallery">
          {block.photos.map((ph) => (
            <figure key={ph.src} className="nl-a-figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph.src} alt={ph.alt} width={ph.w} height={ph.h} loading="lazy" decoding="async" />
              {ph.caption && <figcaption>{ph.caption}</figcaption>}
            </figure>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function periodText(period: NonNullable<Post['period']>): string {
  if (!period.end || period.end === period.start) return dateWithDay(period.start);
  return `${dateWithDay(period.start)}부터 ${dateWithDay(period.end)}까지`;
}

function AdjRow({ post, label }: { post: Post | null; label: string }) {
  return (
    <li className="nl-a-adj">
      <span className="nl-a-adj-label">{label}</span>
      {post ? (
        <Link href={rowHref(post.slug)} className="nl-a-adj-link">
          <span className="nl-a-adj-title">{post.title}</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </Link>
      ) : (
        <span className="nl-a-adj-none">{label === '다음 글' ? '가장 최근 글입니다.' : '가장 처음 글입니다.'}</span>
      )}
    </li>
  );
}

export default async function NewsLabAPost({ params }: Params) {
  const post = await getPost('news', (await params).slug);
  if (!post) notFound();
  const [{ newer, older }, all] = await Promise.all([getAdjacentPosts(post), getPosts('news')]);

  // five notices around this one, in board order, with this one marked
  const rows = toRows(all);
  const at = rows.findIndex((r) => r.slug === post.slug);
  const start = Math.max(0, Math.min(at - 2, rows.length - 5));
  const nearby = rows.slice(start, start + 5);
  const self = rows[at];

  return (
    <SubPage current="news">
      <article className="nl-a nl-a-post">
        <p className="nl-a-crumb nl-a-post-crumb">
          <Link href={LIST_HREF}>소식</Link>
          <span aria-hidden="true">/</span>
          <span>A 공지 게시판</span>
        </p>

        <header className="nl-a-post-head">
          <p className="nl-a-post-kicker">
            {post.topic && (
              <span className="nl-a-topic" data-topic={post.topic}>
                {TOPIC_LABEL[post.topic]}
              </span>
            )}
            {post.pinned && <span className="nl-a-pin">고정</span>}
            {post.sample && <span className="tag-sample">예시</span>}
          </p>
          <h1 className="nl-a-post-title">{post.title}</h1>
          <dl className="nl-a-post-meta">
            <div>
              <dt>번호</dt>
              <dd>{self?.no}</dd>
            </div>
            <div>
              <dt>등록일</dt>
              <dd>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </dd>
            </div>
            {post.period && (
              <div className="nl-a-post-period">
                <dt>해당 날짜</dt>
                <dd>{periodText(post.period)}</dd>
              </div>
            )}
          </dl>
        </header>

        <div className="nl-a-post-body">
          {post.cover && post.cover.kind === 'image' && (
            <figure className="nl-a-figure nl-a-cover">
              <span className="nl-a-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.cover.src} alt={post.cover.alt} decoding="async" />
              </span>
            </figure>
          )}
          {post.body.map((block, i) => (
            <BodyBlock key={i} block={block} />
          ))}
        </div>

        <ul className="nl-a-adjs" aria-label="앞뒤 글">
          <AdjRow post={newer} label="다음 글" />
          <AdjRow post={older} label="이전 글" />
        </ul>

        <section className="nl-a-near" aria-labelledby="nl-a-near-title">
          <h2 id="nl-a-near-title" className="nl-a-near-title">
            가까운 소식
          </h2>
          <ol className="nl-a-rows nl-a-near-rows">
            {nearby.map((r) => {
              const isSelf = r.slug === post.slug;
              return (
                <li key={r.slug} className={isSelf ? 'nl-a-row nl-a-row--self' : 'nl-a-row'}>
                  <Link href={rowHref(r.slug)} className="nl-a-row-link" aria-current={isSelf ? 'page' : undefined}>
                    <span className="nl-a-col-no">{isSelf ? <span className="nl-a-here">지금 글</span> : r.no}</span>
                    <span className="nl-a-col-topic">
                      {r.topic && (
                        <span className="nl-a-topic" data-topic={r.topic}>
                          {TOPIC_LABEL[r.topic]}
                        </span>
                      )}
                    </span>
                    <span className="nl-a-col-title">
                      <span className="nl-a-row-title">{r.title}</span>
                    </span>
                    <time className="nl-a-col-date" dateTime={r.date}>
                      {formatDate(r.date)}
                    </time>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        <p className="nl-a-back">
          <Link href={LIST_HREF} className="nl-a-btn">
            목록으로
          </Link>
        </p>
      </article>
    </SubPage>
  );
}
