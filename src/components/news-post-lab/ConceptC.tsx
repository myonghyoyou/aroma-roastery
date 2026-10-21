import Link from 'next/link';
import { TextBlocks } from '@/components/archive/TextBlocks';
import { Zoomable } from '@/components/archive/Zoomable';
import { NewsCard } from '@/components/news/NewsCard';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import { CopyLink } from './CopyLink';
import type { NewsView } from './shared';

/*
 * C, after Proud Mary: one column read top to bottom, then the classic blog footer, stacked: share
 * (copy the link, the original on Instagram), back to all the news, and two other notices.
 */
export function ConceptC({ v }: { v: NewsView }) {
  const { post, items, lead, rest, related } = v;
  const topic = post.topic ?? 'notice';
  return (
    <article className="npl-c" data-topic={topic}>
      <p className="npl-crumb">
        <Link href="/">홈</Link>
        <span aria-hidden="true">›</span>
        <Link href="/news">소식</Link>
        <span aria-hidden="true">›</span>
        <span className="npl-c-crumb-here">{post.title}</span>
      </p>
      <h1 className="npl-c-title">{post.title}</h1>
      <p className="npl-meta"><span className="npl-topic">{TOPIC_LABEL[topic]}</span><time dateTime={post.date}>{formatDate(post.date)}</time></p>

      {items.length > 0 && <Zoomable items={items} title={post.title} listClassName="npl-c-photos" mediaClassName="npl-img" />}

      {lead && <p className="npl-c-lead">{lead}</p>}
      <TextBlocks blocks={rest} className="npl-text npl-c-text" />

      <div className="npl-c-foot">
        <div className="npl-c-share">
          <span className="npl-c-foot-label">공유</span>
          <CopyLink className="npl-btn" />
          {post.permalink && <a className="npl-btn" href={post.permalink} target="_blank" rel="noopener">인스타그램</a>}
        </div>
        <Link href="/news" className="npl-c-all">소식 전체 보기</Link>
      </div>

      {related.length > 0 && (
        <section className="npl-related" aria-labelledby="npl-c-rel">
          <h2 id="npl-c-rel">다른 소식</h2>
          <ul className="nws-grid nws-grid--related npl-c-related">
            {related.slice(0, 2).map((c) => (
              <li key={c.slug} className="nws-cell"><NewsCard card={c} idPrefix="npl-c" headingLevel={3} /></li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
