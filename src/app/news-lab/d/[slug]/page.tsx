import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Blocks } from '@/components/news-lab/d/Blocks';
import { CopyLink } from '@/components/news-lab/d/CopyLink';
import { detailHref, formatPeriod, LIST_HREF } from '@/components/news-lab/d/format';
import { SubPage } from '@/components/site/SubPage';
import { getPost, getPosts } from '@/lib/content';
import { formatDate, TOPIC_LABEL } from '@/lib/post-utils';
import '@/components/news-lab/d/d.css';

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

export default async function NewsLabDPost({ params }: Params) {
  const post = await getPost('news', (await params).slug);
  if (!post) notFound();
  const recent = (await getPosts('news')).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <SubPage current="news">
      <div className="nl-d">
        <article className="nl-d-article" data-topic={post.topic}>
          <span className="nl-d-dot nl-d-article-dot" aria-hidden="true" />
          <header>
            <p className="nl-d-crumb">
              <Link href={LIST_HREF}>소식</Link>
              <span aria-hidden="true">/</span>
              <span>D 타임라인</span>
            </p>
            <p className="nl-d-meta nl-d-art-meta">
              {post.topic && (
                <>
                  <span>{TOPIC_LABEL[post.topic]}</span>
                  <span className="nl-d-sep" aria-hidden="true">·</span>
                </>
              )}
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.sample && <span className="tag-sample">예시</span>}
            </p>
            <h1 className="nl-d-art-title">{post.title}</h1>
            <p className="nl-d-art-lead">{post.summary}</p>
          </header>

          {post.period && (
            <dl className="nl-d-info">
              <dt>해당 날짜</dt>
              <dd>
                <time dateTime={post.period.start}>{formatPeriod(post.period)}</time>
              </dd>
            </dl>
          )}

          {post.cover?.kind === 'image' && (
            <figure className="nl-d-cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover.src} alt={post.cover.alt} decoding="async" />
            </figure>
          )}

          <div className="nl-d-art-body">
            <Blocks blocks={post.body} />
          </div>

          <div className="nl-d-tools">
            <CopyLink />
            <Link href={LIST_HREF} className="nl-d-more">
              <span aria-hidden="true">←</span>
              소식 목록으로
            </Link>
          </div>
        </article>

        {recent.length > 0 && (
          <section className="nl-d-recent" aria-labelledby="nl-d-recent-h">
            <h2 id="nl-d-recent-h" className="nl-d-side-label">최근 소식</h2>
            <ol className="nl-d-recent-list">
              {recent.map((p) => (
                <li key={p.slug} data-topic={p.topic}>
                  <Link href={detailHref(p.slug)} className="nl-d-recent-row">
                    <span className="nl-d-meta">
                      <span className="nl-d-dot nl-d-dot--inline" aria-hidden="true" />
                      <time dateTime={p.date}>{formatDate(p.date)}</time>
                      {p.topic && (
                        <>
                          <span className="nl-d-sep" aria-hidden="true">·</span>
                          <span>{TOPIC_LABEL[p.topic]}</span>
                        </>
                      )}
                    </span>
                    <span className="nl-d-recent-title">{p.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </SubPage>
  );
}
