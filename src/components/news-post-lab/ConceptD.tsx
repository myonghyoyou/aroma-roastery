import Link from 'next/link';
import { TextBlocks } from '@/components/archive/TextBlocks';
import { Zoomable } from '@/components/archive/Zoomable';
import { formatPeriod } from '@/components/news/types';
import type { Post } from '@/lib/content';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import { newsLabHref } from './concepts';
import type { NewsView } from './shared';

/*
 * D, the Korean notice board (Coffee Libre, Fritz): the board's name, a title row over a small
 * table of topic, date and period, the post itself, then one block at the foot with the next and
 * previous posts as rows and the list button.
 */
export function ConceptD({ v }: { v: NewsView }) {
  const { post, items, lead, rest, newer, older } = v;
  const topic = post.topic ?? 'notice';
  return (
    <article className="npl-d" data-topic={topic}>
      <p className="npl-d-board">소식</p>
      <header className="npl-d-head">
        <h1 className="npl-d-title"><span className="npl-d-tag">{TOPIC_LABEL[topic]}</span>{post.title}</h1>
        <dl className="npl-d-info">
          <div><dt>분류</dt><dd>{TOPIC_LABEL[topic]}</dd></div>
          <div><dt>날짜</dt><dd><time dateTime={post.date}>{formatDate(post.date)}</time></dd></div>
          {post.period && <div><dt>기간</dt><dd>{formatPeriod(post.period)}</dd></div>}
          {post.permalink && <div><dt>원문</dt><dd><a href={post.permalink} target="_blank" rel="noopener">인스타그램</a></dd></div>}
        </dl>
      </header>

      <div className="npl-d-body">
        {items.length > 0 && <Zoomable items={items} title={post.title} listClassName="npl-d-photos" mediaClassName="npl-img" />}
        {lead && <p className="npl-d-lead">{lead}</p>}
        <TextBlocks blocks={rest} className="npl-text" />
      </div>

      <nav className="npl-d-nav" aria-label="앞뒤 글">
        <Row post={newer} label="다음 글" mark="▲" />
        <Row post={older} label="이전 글" mark="▼" />
      </nav>
      <p className="npl-d-btns"><Link href="/news" className="npl-btn">목록</Link></p>
    </article>
  );
}

function Row({ post, label, mark }: { post: Post | null; label: string; mark: string }) {
  return (
    <div className="npl-d-row">
      <span className="npl-d-row-label"><span aria-hidden="true">{mark}</span> {label}</span>
      {post ? (
        <>
          <Link href={newsLabHref('d', post.slug)} className="npl-d-row-title">{post.title}</Link>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </>
      ) : (
        <span className="npl-d-row-title is-off">{label}이 없습니다</span>
      )}
    </div>
  );
}
