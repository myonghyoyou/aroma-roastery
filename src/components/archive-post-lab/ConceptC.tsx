import Link from 'next/link';
import { CATEGORY_LABEL, formatDate } from '@/lib/post-utils';
import { labHref } from './concepts';
import { TextBlocks, type PostView } from './shared';
import { Specimen } from './Specimen';

/*
 * C: laid out like a product page of a coffee roaster. One large photo with the others as small
 * frames to switch it; beside it the facts in a short table (date, photos, original); the caption
 * under the table. The neighbouring posts follow as a row of small covers.
 */
export function ConceptC({ v }: { v: PostView }) {
  const { post, items, heading, around } = v;
  return (
    <article className="apl-c">
      <p className="apl-crumb">
        <Link href="/archive">아카이브</Link>
        <span aria-hidden="true">/</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </p>

      <div className="apl-c-split">
        <Specimen items={items} title={heading} />
        <div className="apl-c-info">
          <h1 className="apl-c-title">{heading}</h1>
          <dl className="apl-c-facts">
            <div><dt>날짜</dt><dd><time dateTime={post.date}>{formatDate(post.date)}</time></dd></div>
            {post.category && <div><dt>분류</dt><dd>{CATEGORY_LABEL[post.category]}</dd></div>}
            <div><dt>사진</dt><dd>{items.length}장</dd></div>
            {post.permalink && (
              <div><dt>원문</dt><dd><a href={post.permalink} target="_blank" rel="noopener">인스타그램에서 보기</a></dd></div>
            )}
          </dl>
          <TextBlocks blocks={post.body} className="apl-text apl-c-text" />
          <Link href="/archive" className="apl-btn apl-c-list">아카이브 목록</Link>
        </div>
      </div>

      <nav className="apl-c-more" aria-label="앞뒤 기록">
        <h2>앞뒤 기록</h2>
        <ol>
          {around.filter((p) => p.slug !== post.slug).map((p) => {
            const cover = p.photos?.[0] ?? p.cover;
            return (
              <li key={p.slug}>
                <Link href={labHref('c', p.slug)} className="apl-c-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {cover && <img src={cover.src} alt="" loading="lazy" decoding="async" />}
                  <span className="apl-c-card-title">{p.untitled ? `${formatDate(p.date)}의 기록` : p.title}</span>
                  <time dateTime={p.date}>{formatDate(p.date)}</time>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </article>
  );
}
