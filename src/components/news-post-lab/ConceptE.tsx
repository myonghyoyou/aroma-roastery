import Link from 'next/link';
import { TextBlocks } from '@/components/archive/TextBlocks';
import type { Post } from '@/lib/content';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import { newsLabHref } from './concepts';
import { Flipbook } from '@/components/news/Flipbook';
import { FactList, type NewsView } from './shared';

/*
 * E, after Terarosa's newsletter viewer and an Instagram carousel: the photos are the post, turned
 * one at a time on the left; the title, the text and the facts sit beside them; the neighbouring
 * notices close the page.
 */
export function ConceptE({ v }: { v: NewsView }) {
  const { post, photos, lead, rest, facts, newer, older } = v;
  const topic = post.topic ?? 'notice';
  return (
    <article className="npl-e" data-topic={topic}>
      <p className="npl-crumb"><Link href="/news">소식</Link><span aria-hidden="true">/</span><span>{TOPIC_LABEL[topic]}</span></p>
      <div className="npl-e-split">
        {photos.length > 0 ? (
          <Flipbook photos={photos} />
        ) : (
          // a notice without a photo: the topic's colour field, as on the news cards
          <div className="npl-e-book npl-e-field" aria-hidden="true"><span className="nws-field" /></div>
        )}
        <div className="npl-e-info">
          <p className="npl-meta"><span className="npl-topic">{TOPIC_LABEL[topic]}</span><time dateTime={post.date}>{formatDate(post.date)}</time></p>
          <h1 className="npl-e-title">{post.title}</h1>
          {lead && <p className="npl-e-lead">{lead}</p>}
          <TextBlocks blocks={rest} className="npl-text npl-e-text" />
          <FactList facts={facts.filter((f) => f.label !== '분류' && f.label !== '올린 날')} className="npl-e-facts" />
        </div>
      </div>
      <nav className="npl-e-nav" aria-label="앞뒤 소식">
        <Side post={newer} label="최근 소식" dir="newer" />
        <Link href="/news" className="npl-btn">목록</Link>
        <Side post={older} label="이전 소식" dir="older" />
      </nav>
    </article>
  );
}

function Side({ post, label, dir }: { post: Post | null; label: string; dir: 'newer' | 'older' }) {
  const cls = `npl-e-side npl-e-side--${dir}`;
  if (!post) return <span className={`${cls} is-off`}><span className="npl-e-side-label">{label}</span><span>없음</span></span>;
  const cover = post.photos?.[0] ?? (post.cover?.kind === 'image' ? post.cover : undefined);
  return (
    <Link href={newsLabHref('e', post.slug)} className={cls}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {cover && <img src={cover.src} alt="" loading="lazy" decoding="async" />}
      <span className="npl-e-side-text">
        <span className="npl-e-side-label">{dir === 'newer' ? '‹ ' : ''}{label}{dir === 'older' ? ' ›' : ''}</span>
        <span className="npl-e-side-title">{post.title}</span>
      </span>
    </Link>
  );
}
