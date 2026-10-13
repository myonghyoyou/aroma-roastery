import Link from 'next/link';
import type { Post } from '@/lib/content';
import { formatDate, TOPIC_LABEL } from '@/lib/post-utils';
import { Blocks } from './Blocks';
import { Disclosure } from './Disclosure';
import { detailHref, formatPeriod, groupByMonth, monthLabel } from './format';

/* Server component: the vertical line, month groups with sticky headings, one entry per notice. */

function Meta({ post }: { post: Post }) {
  return (
    <p className="nl-d-meta">
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      {post.topic && (
        <>
          <span className="nl-d-sep" aria-hidden="true">·</span>
          <span>{TOPIC_LABEL[post.topic]}</span>
        </>
      )}
      {post.period && (
        <>
          <span className="nl-d-sep" aria-hidden="true">·</span>
          <span className="nl-d-when">해당 날짜 {formatPeriod(post.period, true)}</span>
        </>
      )}
    </p>
  );
}

export function PinnedSlot({ post }: { post: Post }) {
  return (
    <section className="nl-d-pinned" aria-labelledby="nl-d-pinned-label" data-topic={post.topic}>
      <h2 id="nl-d-pinned-label" className="nl-d-side-label">고정 소식</h2>
      <div className="nl-d-pinned-card">
        <Meta post={post} />
        <p className="nl-d-pinned-title">
          <Link href={detailHref(post.slug)}>{post.title}</Link>
        </p>
        <p className="nl-d-summary">{post.summary}</p>
      </div>
    </section>
  );
}

export function Timeline({ posts }: { posts: Post[] }) {
  const months = groupByMonth(posts);
  return (
    <div className="nl-d-timeline">
      {months.map((m) => (
        <section key={m.key} className="nl-d-month" aria-labelledby={`nl-d-m-${m.key}`}>
          <h2 id={`nl-d-m-${m.key}`} className="nl-d-side-label nl-d-month-label">
            {monthLabel(m.key)}
            <span className="nl-d-month-count">{m.posts.length}건</span>
          </h2>
          <ol className="nl-d-items">
            {m.posts.map((post) => {
              const titleId = `nl-d-t-${post.slug}`;
              return (
                <li key={post.slug} className="nl-d-item" data-topic={post.topic}>
                  <span className="nl-d-dot" aria-hidden="true" />
                  <article className="nl-d-card">
                    <Meta post={post} />
                    <h3 id={titleId} className="nl-d-title">
                      {post.title}
                      {post.pinned && <span className="nl-d-flag">고정</span>}
                    </h3>
                    <p className="nl-d-summary">{post.summary}</p>
                    <Disclosure
                      panelId={`nl-d-b-${post.slug}`}
                      titleId={titleId}
                      extra={
                        <Link href={detailHref(post.slug)} className="nl-d-more" aria-describedby={titleId}>
                          자세히 보기
                          <span aria-hidden="true">→</span>
                        </Link>
                      }
                    >
                      <Blocks blocks={post.body} compact />
                    </Disclosure>
                  </article>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
