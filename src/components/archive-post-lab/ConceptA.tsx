import Link from 'next/link';
import { CATEGORY_LABEL, formatDate } from '@/lib/post-utils';
import { labHref } from './concepts';
import { TextBlocks, type PostView } from './shared';
import { Zoomable } from './Zoomable';

/*
 * A: the post split in two, like a post opened on Instagram's web. Photos large on the left; on the
 * right one column holds everything else (date, title, caption, the original, the neighbours) and
 * stays in view while the photos scroll. Every way out sits on one bar above.
 */
export function ConceptA({ v }: { v: PostView }) {
  const { post, items, heading, newer, older, index, total } = v;
  return (
    <article className="apl-a">
      <nav className="apl-bar" aria-label="기록 이동">
        <Link href="/archive" className="apl-btn">목록으로</Link>
        <span className="apl-a-pos" aria-label={`${total}개 중 ${index + 1}번째 기록`}>{index + 1} / {total}</span>
        <span className="apl-a-steps">
          <StepLink to={newer && labHref('a', newer.slug)} label="최근 기록" arrow="‹" />
          <StepLink to={older && labHref('a', older.slug)} label="이전 기록" arrow="›" after />
        </span>
      </nav>

      <div className="apl-a-split">
        <Zoomable items={items} title={heading} listClassName="apl-a-photos" mediaClassName="apl-a-img" />
        <div className="apl-a-info">
          <p className="apl-meta">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.category && <span>{CATEGORY_LABEL[post.category]}</span>}
            <span>사진 {items.length}장</span>
          </p>
          <h1 className="apl-a-title">{heading}</h1>
          <TextBlocks blocks={post.body} className="apl-text apl-a-text" />
          {post.permalink && (
            <a className="apl-a-insta" href={post.permalink} target="_blank" rel="noopener">인스타그램에서 보기</a>
          )}
        </div>
      </div>
    </article>
  );
}

function StepLink({ to, label, arrow, after }: { to: string | null; label: string; arrow: string; after?: boolean }) {
  const text = after ? <>{label} <span aria-hidden="true">{arrow}</span></> : <><span aria-hidden="true">{arrow}</span> {label}</>;
  return to ? <Link href={to} className="apl-btn">{text}</Link> : <span className="apl-btn is-off" aria-disabled="true">{text}</span>;
}
