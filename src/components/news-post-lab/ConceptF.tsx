import Link from 'next/link';
import { TextBlocks } from '@/components/archive/TextBlocks';
import { formatPeriod } from '@/components/news/types';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import { CupNoteTags, LeafMark } from '@/components/cupnote/CupNoteTag';
import { FAMILY_LABEL } from './notes';
import { Flipbook } from './Flipbook';
import { PostNav } from './PostNav';
import type { NewsView } from './shared';

/*
 * F, A3's cup notes on E's large photo (chosen direction, 2026-10-22). The posted photos turn one
 * at a time on the left, large; the column beside them reads: origin and date, the bean's name, the
 * cup notes as tags in the SCA flavour wheel's own colours (notes.ts), the profile as value/label tiles, the
 * store's words, the way to buy. A notice keeps the same frame with its date and period as tiles.
 */
export function ConceptF({ v }: { v: NewsView }) {
  const { post, photos, bean, lead, rest, newer, older, settings } = v;
  const topic = post.topic ?? 'notice';
  const tiles = (bean
    ? [
        bean.origin && { value: bean.origin, label: '산지' },
        (bean.farm || bean.lot) && { value: bean.farm ?? bean.lot!, label: bean.farm ? '농장' : '이름' },
        bean.variety && { value: bean.variety, label: '품종' },
        bean.process && { value: bean.process, label: '가공' },
      ]
    : [
        { value: TOPIC_LABEL[topic], label: '분류' },
        { value: formatDate(post.date), label: '올린 날' },
        post.period && { value: formatPeriod(post.period), label: '해당 기간' },
      ]
  ).filter(Boolean) as { value: string; label: string }[];
  const families = bean ? [...new Set(bean.notes.map((n) => n.family))] : [];

  return (
    <article className="npl-f" data-topic={topic}>
      <p className="npl-crumb"><Link href="/news">소식</Link><span aria-hidden="true">/</span><span>{TOPIC_LABEL[topic]}</span></p>
      <div className="npl-f-split">
        {photos.length > 0 ? (
          <Flipbook photos={photos} />
        ) : (
          <div className="npl-e-book npl-e-field" aria-hidden="true"><span className="nws-field" /></div>
        )}

        <div className="npl-f-info">
          <p className="npl-f-over">
            {bean?.origin ? <span className="npl-f-origin">{bean.origin}</span> : <span className="npl-topic">{TOPIC_LABEL[topic]}</span>}
            <time dateTime={post.date}>{bean ? '입고 ' : ''}{formatDate(post.date)}</time>
          </p>
          <h1 className="npl-f-title">{bean ? bean.name : post.title}</h1>

          {bean && bean.notes.length > 0 && (
            <div className="npl-f-cup">
              <h2 className="npl-f-cup-h">컵 노트</h2>
              <CupNoteTags notes={bean.notes} />
              <p className="cnt-key" aria-label="색의 뜻">
                {families.map((f) => <span key={f} className="cnt-key-item"><LeafMark family={f} />{FAMILY_LABEL[f]}</span>)}
              </p>
            </div>
          )}

          {tiles.length > 0 && (
            <ul className={`npl-f-tiles is-${Math.min(tiles.length, 4)}`}>
              {tiles.map((t) => <li key={t.label}><b>{t.value}</b><span>{t.label}</span></li>)}
            </ul>
          )}

          <div className="npl-f-text">
            {lead && <p className="npl-f-lead">{lead}</p>}
            <TextBlocks blocks={rest} className="npl-text" />
          </div>

          <p className="npl-f-links">
            {bean && bean.store !== 'store-only' && <a className="npl-btn npl-btn--solid" href={settings.storeUrl} target="_blank" rel="noopener">온라인 스토어에서 보기</a>}
            {bean?.store === 'store-only' && <span className="npl-f-only">소량 입고되어 매장에서만 맛볼 수 있습니다</span>}
            {post.permalink && <a className="npl-btn" href={post.permalink} target="_blank" rel="noopener">인스타그램 원문</a>}
          </p>
        </div>
      </div>
      <PostNav k="f" newer={newer} older={older} />
    </article>
  );
}
