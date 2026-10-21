import Link from 'next/link';
import { TextBlocks } from '@/components/archive/TextBlocks';
import { Zoomable } from '@/components/archive/Zoomable';
import { NewsCard } from '@/components/news/NewsCard';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import { newsLabHref } from './concepts';
import { FactList, type NewsView } from './shared';

/*
 * A, after Kurasu's journal: the facts first. Path and the neighbours on one line at the top, then
 * the title, the date, a one-line lead and a box of facts (topic, date, period, the bean, where to
 * buy, the original), then the text and the photos, then three related notices.
 */
export function ConceptA({ v }: { v: NewsView }) {
  const { post, items, lead, rest, facts, newer, older, related } = v;
  const topic = post.topic ?? 'notice';
  return (
    <article className="npl-a" data-topic={topic}>
      <div className="npl-a-top">
        <p className="npl-crumb">
          <Link href="/news">소식</Link>
          <span aria-hidden="true">/</span>
          <span>{TOPIC_LABEL[topic]}</span>
        </p>
        <nav className="npl-a-steps" aria-label="앞뒤 소식">
          {newer ? <Link href={newsLabHref('a', newer.slug)}><span aria-hidden="true">‹</span> 최근 소식</Link> : <span className="is-off">‹ 최근 소식</span>}
          <span aria-hidden="true" className="npl-a-sep">|</span>
          {older ? <Link href={newsLabHref('a', older.slug)}>이전 소식 <span aria-hidden="true">›</span></Link> : <span className="is-off">이전 소식 ›</span>}
        </nav>
      </div>

      <h1 className="npl-a-title">{post.title}</h1>
      <p className="npl-meta"><span className="npl-topic">{TOPIC_LABEL[topic]}</span><time dateTime={post.date}>{formatDate(post.date)}</time></p>
      {lead && <p className="npl-a-lead">{lead}</p>}

      <FactList facts={facts} className="npl-a-facts" />

      <TextBlocks blocks={rest} className="npl-text npl-a-text" />
      {items.length > 0 && (
        <Zoomable items={items} title={post.title} listClassName={`npl-a-photos is-${Math.min(items.length, 2)}`} mediaClassName="npl-img" />
      )}

      {related.length > 0 && (
        <section className="npl-related" aria-labelledby="npl-a-rel">
          <h2 id="npl-a-rel">다른 소식</h2>
          <ul className="nws-grid nws-grid--related">
            {related.map((c) => (
              <li key={c.slug} className="nws-cell"><NewsCard card={c} idPrefix="npl-a" headingLevel={3} /></li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
