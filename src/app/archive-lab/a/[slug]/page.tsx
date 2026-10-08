import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LeafDot } from '@/components/archive-lab/a/LeafDot';
import { SubPage } from '@/components/site/SubPage';
import { getAdjacentPosts, getPost, getPosts, type Block, type Post } from '@/lib/content';
import { formatDate } from '@/lib/post-utils';
import '@/components/archive-lab/a/a.css';

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

const pad = (n: number) => String(n).padStart(2, '0');

/* Text blocks only: the photos of the post are all shown in the right column, in order. */
function TextBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return <p>{block.text}</p>;
    case 'heading':
      return <h2 className="lab-a-body-h">{block.text}</h2>;
    case 'quote':
      return <blockquote className="lab-a-quote">{block.text}</blockquote>;
    case 'list':
      return (
        <ul className="lab-a-body-list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

function Neighbour({ post, rel }: { post: Post | null; rel: 'newer' | 'older' }) {
  const label = rel === 'newer' ? '최근 기록' : '이전 기록';
  if (!post) {
    return (
      <div className={`lab-a-nb lab-a-nb--${rel} lab-a-nb--empty`}>
        <span className="lab-a-nb-label">{label}</span>
        <span className="lab-a-nb-none">없음</span>
      </div>
    );
  }
  const photo = post.photos?.find((p) => p.src === post.cover?.src) ?? post.photos?.[0];
  return (
    <Link className={`lab-a-nb lab-a-nb--${rel}`} href={`/archive-lab/a/${post.slug}`}>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="lab-a-nb-img" src={photo.src} width={photo.w} height={photo.h} alt="" loading="lazy" />
      )}
      <span className="lab-a-nb-text">
        <span className="lab-a-nb-label">{label}</span>
        <span className="lab-a-nb-meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.category && <LeafDot category={post.category} />}
        </span>
        <span className="lab-a-nb-title">{post.title}</span>
      </span>
    </Link>
  );
}

export default async function ArchiveLabAPost({ params }: Params) {
  const post = await getPost('archive', (await params).slug);
  if (!post) notFound();
  const { newer, older } = await getAdjacentPosts(post);
  const photos = post.photos ?? [];
  const total = pad(photos.length);

  return (
    <SubPage current="archive">
      <article className="lab-a-post">
        <div className="lab-a-post-text">
          <div className="lab-a-sticky" tabIndex={0} role="region" aria-label="기록 내용">
            <Link className="lab-a-back" href="/archive-lab/a">
              아카이브 목록
            </Link>
            <div className="lab-a-post-meta">
              {post.category && <LeafDot category={post.category} />}
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.sample && <span className="tag-sample">예시</span>}
            </div>
            <h1 className="lab-a-post-title">{post.title}</h1>
            <p className="lab-a-post-summary">{post.summary}</p>
            <dl className="lab-a-spec">
              <div>
                <dt>사진</dt>
                <dd>{photos.length}장</dd>
              </div>
              <div>
                <dt>기록일</dt>
                <dd>{formatDate(post.date)}</dd>
              </div>
            </dl>
            <div className="lab-a-body">
              {post.body.map((block, i) => (
                <TextBlock key={i} block={block} />
              ))}
            </div>
          </div>
        </div>

        <ol className="lab-a-photos" aria-label={`사진 ${photos.length}장`}>
          {photos.map((p, i) => (
            <li key={`${p.src}-${i}`} className="lab-a-photo">
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} width={p.w} height={p.h} alt={p.alt} loading={i < 2 ? 'eager' : 'lazy'} />
                <figcaption>
                  <span className="lab-a-photo-num">
                    {pad(i + 1)} / {total}
                  </span>
                  <span className="lab-a-photo-cap">{p.caption ?? p.alt}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </article>

      <nav className="lab-a-adjacent" aria-label="다른 기록">
        <Neighbour post={newer} rel="newer" />
        <Neighbour post={older} rel="older" />
      </nav>
    </SubPage>
  );
}
