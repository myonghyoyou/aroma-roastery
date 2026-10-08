import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JournalBody } from '@/components/archive-lab/e/JournalBody';
import { coverOf, LAB_E_BASE } from '@/components/archive-lab/e/shared';
import { SubPage } from '@/components/site/SubPage';
import { getAdjacentPosts, getPost, getPosts } from '@/lib/content';
import { CATEGORY_LABEL, formatDate } from '@/lib/post-utils';
import '@/components/archive-lab/e/e.css';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts('archive');
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost('archive', (await params).slug);
  if (!post) return {};
  return { title: `${post.title} (시안 E) | aroma roastery`, description: post.summary };
}

/* Concept E detail: a long form feature. Title block, full bleed cover, then text and photo rows. */
export default async function ArchiveLabEPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost('archive', slug);
  if (!post) notFound();
  const { newer, older } = await getAdjacentPosts(post);
  const all = await getPosts('archive');
  const related = all.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const cover = coverOf(post);
  const category = post.category ? CATEGORY_LABEL[post.category] : '기록';
  const photoCount = post.photos?.length ?? 0;

  return (
    <SubPage current="archive">
      <article className="lab-e-article">
        <header className="lab-e-title">
          <p className="lab-e-meta lab-e-title-meta">
            <Link href={LAB_E_BASE}>아카이브</Link>
            <span>{category}</span>
            <span><time dateTime={post.date}>{formatDate(post.date)}</time></span>
            {post.sample && <span className="tag-sample">예시</span>}
          </p>
          <h1>{post.title}</h1>
          <p className="lab-e-dek">{post.summary}</p>
          <p className="lab-e-credit">
            <span>사진 {photoCount}장</span>
            <span>글·사진 아로마 로스터리 (예시)</span>
          </p>
        </header>

        {cover && (
          <figure className="lab-e-bleed">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover.src} alt={cover.alt} width={cover.w} height={cover.h} loading="eager" fetchPriority="high" />
            <figcaption>
              <span className="lab-e-num">01</span>
              <span>{cover.alt}</span>
            </figcaption>
          </figure>
        )}

        <JournalBody blocks={post.body} startAt={cover ? 2 : 1} />
      </article>

      {related.length > 0 && (
        <section className="lab-e-related" aria-labelledby="lab-e-related-h">
          <h2 id="lab-e-related-h">같은 카테고리의 기록</h2>
          <ul>
            {related.map((p) => {
              const c = coverOf(p);
              return (
                <li key={p.slug}>
                  <Link href={`${LAB_E_BASE}/${p.slug}`} className="lab-e-card">
                    <span className="lab-e-card-cover lab-e-related-cover">
                      {c && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.src} alt={c.alt} width={c.w} height={c.h} loading="lazy" decoding="async" className="lab-e-fill" />
                      )}
                    </span>
                    <span className="lab-e-meta">
                      <span>{category}</span>
                      <span><time dateTime={p.date}>{formatDate(p.date)}</time></span>
                    </span>
                    <span className="lab-e-card-title">{p.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <nav className="lab-e-nav" aria-label="다른 기록">
        {newer ? (
          <Link href={`${LAB_E_BASE}/${newer.slug}`} className="lab-e-nav-item" rel="prev">
            <span>다음 기록</span>
            <strong>{newer.title}</strong>
          </Link>
        ) : <span />}
        {older ? (
          <Link href={`${LAB_E_BASE}/${older.slug}`} className="lab-e-nav-item is-older" rel="next">
            <span>이전 기록</span>
            <strong>{older.title}</strong>
          </Link>
        ) : <span />}
      </nav>
      <p className="lab-e-back"><Link href={LAB_E_BASE}>아카이브 목록</Link></p>
    </SubPage>
  );
}
