import Link from 'next/link';
import { TextBlocks } from '@/components/archive/TextBlocks';
import { Zoomable } from '@/components/archive/Zoomable';
import { formatPeriod } from '@/components/news/types';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import { PostNav } from './PostNav';
import type { NewsView } from './shared';

/*
 * A3, A after Onyx Coffee Lab: the cup notes as tags under the title, then a grid of tiles with the
 * value large and its label small (origin, farm, variety, process; for a notice the date and the
 * period), then the bean card and its description side by side as in the archive's spread, the
 * caption in a reading column, the way to buy and the band to the neighbours.
 */
export function ConceptA3({ v }: { v: NewsView }) {
  const { post, items, bean, lead, rest, newer, older, settings } = v;
  const topic = post.topic ?? 'notice';
  const tiles = bean
    ? [
        bean.origin && { value: bean.origin, label: '산지' },
        bean.farm && { value: bean.farm, label: '농장' },
        bean.lot && { value: bean.lot, label: '이름' },
        bean.variety && { value: bean.variety, label: '품종' },
        bean.process && { value: bean.process, label: '가공' },
      ]
    : [
        { value: TOPIC_LABEL[topic], label: '분류' },
        { value: formatDate(post.date), label: '올린 날' },
        post.period && { value: formatPeriod(post.period), label: '해당 기간' },
      ];
  const shown = tiles.filter(Boolean) as { value: string; label: string }[];
  return (
    <article className="npl-a3" data-topic={topic}>
      <p className="npl-crumb npl-a3-crumb"><Link href="/news">소식</Link><span aria-hidden="true">/</span><span>{TOPIC_LABEL[topic]}</span><span aria-hidden="true">/</span><time dateTime={post.date}>{formatDate(post.date)}</time></p>
      <header className="npl-a3-head">
        <h1 className="npl-a3-title">{bean ? bean.name : post.title}</h1>
        {bean && bean.notes.length > 0 && (
          <ul className="npl-a3-tags" aria-label="맛 표현">
            {bean.notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        )}
      </header>

      <ul className={`npl-a3-tiles is-${Math.min(shown.length, 5)}`}>
        {shown.map((t) => <li key={t.label}><b>{t.value}</b><span>{t.label}</span></li>)}
      </ul>

      {items.length > 0 && <Zoomable items={items} title={post.title} listClassName="npl-a3-spread" itemClassName="npl-a3-page" mediaClassName="npl-a3-img" />}

      <div className="npl-a3-col">
        {lead && <p className="npl-a3-lead">{lead}</p>}
        <TextBlocks blocks={rest} className="npl-text" />
        <p className="npl-a3-links">
          {bean && bean.store !== 'store-only' && <a className="npl-btn npl-btn--solid" href={settings.storeUrl} target="_blank" rel="noopener">온라인 스토어에서 보기</a>}
          {bean?.store === 'store-only' && <span className="npl-a3-only">소량 입고되어 매장에서만 맛볼 수 있습니다</span>}
          {post.permalink && <a className="npl-btn" href={post.permalink} target="_blank" rel="noopener">인스타그램 원문</a>}
        </p>
      </div>
      <PostNav k="a3" newer={newer} older={older} />
    </article>
  );
}
