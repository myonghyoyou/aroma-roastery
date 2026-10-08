import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostBody } from '@/components/archive-lab/b/PostBody';
import { CATEGORY_DOT, dayParts } from '@/components/archive-lab/b/calendar';
import { SubPage } from '@/components/site/SubPage';
import { getAdjacentPosts, getPost, getPosts } from '@/lib/content';
import { CATEGORY_LABEL, formatDate } from '@/lib/post-utils';
import '@/components/archive-lab/b/b.css';

type Props = { params: Promise<{ slug: string }> };

const LIST = '/archive-lab/b';

export async function generateStaticParams() {
  const posts = await getPosts('archive');
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost('archive', (await params).slug);
  if (!post) return {};
  return { title: `${post.title} | aroma roastery`, description: post.summary };
}

/*
 * One archive post, concept B: the cover across the gutter, the date line and title beneath it, the
 * body in order, then the other posts of the same year and the newer and older posts.
 */
export default async function ArchiveLabBPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost('archive', slug);
  if (!post) notFound();

  const [all, { newer, older }] = await Promise.all([getPosts('archive'), getAdjacentPosts(post)]);
  const year = post.date.slice(0, 4);
  const sameYear = all.filter((p) => p.slug !== post.slug && p.date.startsWith(year)).slice(0, 6);
  const { weekday } = dayParts(post.date);
  const photoCount = post.photos?.length ?? 0;
  const coverSrc = post.cover ? (post.cover.kind === 'image' ? post.cover.src : post.cover.poster) : undefined;

  return (
    <SubPage current="archive">
      <article className="lab-b-post">
        <p className="lab-b-back">
          <Link href={LIST}>아카이브 목록</Link>
        </p>

        {post.cover && coverSrc && (
          <figure className="lab-b-cover">
            {/* eslint-disable-next-line @next/next/no-img-element -- plain img by brief */}
            <img className="lab-b-fill" src={coverSrc} alt={post.cover.alt} width={1600} height={900} loading="eager" />
          </figure>
        )}

        <header className="lab-b-post-head">
          <p className="lab-b-post-meta">
            <time dateTime={post.date}>
              {formatDate(post.date)} <span className="lab-b-muted">{weekday}요일</span>
            </time>
            {post.category && (
              <span className="lab-b-cat">
                <span className="lab-b-dot" style={{ background: CATEGORY_DOT[post.category] }} aria-hidden="true" />
                {CATEGORY_LABEL[post.category]}
              </span>
            )}
            {photoCount > 0 && <span className="lab-b-muted">사진 {photoCount}장</span>}
            {post.sample && <span className="tag-sample">예시</span>}
          </p>
          <h1 className="lab-b-post-title">{post.title}</h1>
          <p className="lab-b-post-summary">{post.summary}</p>
        </header>

        <PostBody blocks={post.body} />

        {sameYear.length > 0 && (
          <section className="lab-b-year-more" aria-labelledby="lab-b-year-more-h">
            <h2 id="lab-b-year-more-h" className="lab-b-section-h">
              같은 해의 다른 기록 <span className="lab-b-year-more-y">{year}</span>
            </h2>
            <ol className="lab-b-year-list">
              {sameYear.map((p) => (
                <li key={p.slug}>
                  <Link href={`${LIST}/${p.slug}`} className="lab-b-year-row">
                    <time dateTime={p.date}>{formatDate(p.date).slice(5)}</time>
                    <span className="lab-b-year-row-title">{p.title}</span>
                    {p.category && <span className="lab-b-year-row-cat">{CATEGORY_LABEL[p.category]}</span>}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        <nav className="lab-b-adj" aria-label="이웃한 기록">
          {newer ? (
            <Link href={`${LIST}/${newer.slug}`} className="lab-b-adj-item" rel="prev">
              <span className="lab-b-adj-dir">최근 기록</span>
              <span className="lab-b-adj-date">{formatDate(newer.date)}</span>
              <strong>{newer.title}</strong>
            </Link>
          ) : <span />}
          {older ? (
            <Link href={`${LIST}/${older.slug}`} className="lab-b-adj-item is-older" rel="next">
              <span className="lab-b-adj-dir">지난 기록</span>
              <span className="lab-b-adj-date">{formatDate(older.date)}</span>
              <strong>{older.title}</strong>
            </Link>
          ) : <span />}
        </nav>

        <p className="lab-b-back is-end">
          <Link href={LIST}>아카이브 목록으로</Link>
        </p>
      </article>
    </SubPage>
  );
}
