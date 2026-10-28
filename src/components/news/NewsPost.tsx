import Link from 'next/link';
import { TextBlocks } from '@/components/archive/TextBlocks';
import type { BeanProfile } from '@/components/cupnote/bean';
import { CupNoteTags } from '@/components/cupnote/CupNoteTag';
import type { Block, Photo, Post } from '@/lib/content';
import { formatDate } from '@/lib/post-utils';
import { Flipbook } from './Flipbook';
import { LIST_HREF, formatPeriod } from './types';
import './post.css';

/*
 * A news post (concept F of the post study, chosen 2026-10-23): the posted photos turned one at a
 * time on the left, large; beside them, read top down, the origin and date, the bean's name, its cup
 * notes (each in its own colour from the flavour wheel), the profile as value/label tiles, the store's
 * words and the way to buy. A notice keeps the same frame with its date and period as tiles.
 * The newer post, the list and the older post close the page on one band, apart from the photos'
 * own arrows. `hrefOf` makes the neighbours' links, so the design study keeps its own addresses.
 */
export function NewsPost({
  post, photos, bean, lead, rest, newer, older, storeUrl, hrefOf,
}: {
  post: Post;
  photos: Photo[];
  bean: BeanProfile | null;
  lead: string | null;
  rest: Block[];
  newer: Post | null;
  older: Post | null;
  storeUrl: string;
  hrefOf: (slug: string) => string;
}) {
  const topic = post.topic ?? 'notice';
  const tiles = (bean
    ? [
        bean.origin && { value: bean.origin, label: '산지' },
        (bean.farm || bean.lot) && { value: (bean.farm ?? bean.lot)!, label: bean.farm ? '농장' : '이름' },
        bean.variety && { value: bean.variety, label: '품종' },
        bean.process && { value: bean.process, label: '가공' },
      ]
    : [
        { value: formatDate(post.date), label: '올린 날' },
        post.period && { value: formatPeriod(post.period), label: '해당 기간' },
      ]
  ).filter(Boolean) as { value: string; label: string }[];

  return (
    <article className="nwp" data-topic={topic}>
      <p className="nwp-crumb">
        <Link href={LIST_HREF}>소식</Link>
      </p>

      <div className="nwp-split">
        {photos.length > 0 ? (
          <Flipbook photos={photos} />
        ) : (
          // a notice without a photo: the topic's colour field, as on the news cards
          <div className="nwp-book nwp-field" aria-hidden="true"><span className="nws-field" /></div>
        )}

        <div className="nwp-info">
          <p className="nwp-over">
            {bean?.origin && <span className="nwp-origin">{bean.origin}</span>}
            <time dateTime={post.date}>{bean ? '입고 ' : ''}{formatDate(post.date)}</time>
            {post.sample && <span className="tag-sample">예시</span>}
          </p>
          <h1 className="nwp-title">{bean ? bean.name : post.title}</h1>

          {bean && bean.notes.length > 0 && (
            <div className="nwp-cup">
              <h2 className="nwp-cup-h">컵 노트</h2>
              <CupNoteTags notes={bean.notes} />
            </div>
          )}

          {tiles.length > 0 && (
            <ul className={`nwp-tiles is-${Math.min(tiles.length, 4)}`}>
              {tiles.map((t) => <li key={t.label}><span>{t.label}</span><b>{t.value}</b></li>)}
            </ul>
          )}

          <div className="nwp-text">
            {lead && <p className="nwp-lead">{lead}</p>}
            <TextBlocks blocks={rest} className="nwp-body" />
          </div>

          <p className="nwp-links">
            {bean && bean.store !== 'store-only' && <a className="nwp-btn nwp-btn--solid" href={storeUrl} target="_blank" rel="noopener">온라인 스토어에서 보기</a>}
            {bean?.store === 'store-only' && <span className="nwp-only">소량 입고되어 매장에서만 맛볼 수 있습니다</span>}
            {post.permalink && <a className="nwp-btn" href={post.permalink} target="_blank" rel="noopener">인스타그램 원문</a>}
          </p>
        </div>
      </div>

      <nav className="nwp-nav" aria-label="앞뒤 소식">
        <Side post={newer} label="최근 소식" dir="newer" hrefOf={hrefOf} />
        <Link href={LIST_HREF} className="nwp-btn">목록</Link>
        <Side post={older} label="이전 소식" dir="older" hrefOf={hrefOf} />
      </nav>
    </article>
  );
}

function Side({ post, label, dir, hrefOf }: { post: Post | null; label: string; dir: 'newer' | 'older'; hrefOf: (slug: string) => string }) {
  const cls = `nwp-side nwp-side--${dir}`;
  if (!post) return <span className={`${cls} is-off`}><span className="nwp-side-label">{label}</span><span>없음</span></span>;
  return (
    <Link href={hrefOf(post.slug)} className={cls}>
      <span className="nwp-side-label">
        {dir === 'newer' && <span aria-hidden="true">‹ </span>}
        {label}
        {dir === 'older' && <span aria-hidden="true"> ›</span>}
      </span>
      <span className="nwp-side-title">{post.title}</span>
    </Link>
  );
}
