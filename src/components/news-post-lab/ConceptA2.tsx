import Link from 'next/link';
import { TextBlocks } from '@/components/archive/TextBlocks';
import { Zoomable } from '@/components/archive/Zoomable';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import { PostNav } from './PostNav';
import { FactList, type NewsView } from './shared';

/*
 * A2, A as a roaster's product page (Coffee Collective, Kurasu, Tim Wendelboe): the bean card and its
 * description on the left; on the right one sticky column read top down: the origin, the bean's
 * name, the tasting notes in large type before anything else, the profile as quiet rows, one or two
 * large tiles for the people and the process, the way to buy, then the caption.
 */
export function ConceptA2({ v }: { v: NewsView }) {
  const { post, items, bean, rows, lead, rest, newer, older, settings } = v;
  const topic = post.topic ?? 'notice';
  const tiles = bean ? [bean.farm && { value: bean.farm, label: '함께한 농장' }, bean.process && { value: bean.process, label: '가공 방식' }].filter(Boolean) as { value: string; label: string }[] : [];
  return (
    <article className="npl-a2" data-topic={topic}>
      <p className="npl-crumb"><Link href="/news">소식</Link><span aria-hidden="true">/</span><span>{TOPIC_LABEL[topic]}</span></p>
      <div className="npl-a2-split">
        {items.length > 0 ? (
          <Zoomable items={items} title={post.title} listClassName="npl-a2-photos" mediaClassName="npl-img" />
        ) : (
          <div className="npl-a2-field" aria-hidden="true"><span className="nws-field" /></div>
        )}
        <div className="npl-a2-info">
          <p className="npl-a2-over">{bean?.origin ?? TOPIC_LABEL[topic]} <span>· {bean ? '입고' : '소식'} {formatDate(post.date)}</span></p>
          <h1 className="npl-a2-title">{bean ? bean.name : post.title}</h1>
          {bean && bean.notes.length > 0 ? (
            <p className="npl-a2-notes"><span className="npl-sr">맛 표현: </span>{bean.notes.join(', ')}</p>
          ) : (
            lead && <p className="npl-a2-lead">{lead}</p>
          )}
          <FactList facts={rows} className="npl-rows" />
          {tiles.length > 0 && (
            <ul className="npl-a2-tiles">
              {tiles.map((t) => <li key={t.label}><b>{t.value}</b><span>{t.label}</span></li>)}
            </ul>
          )}
          {bean && bean.store !== 'store-only' && (
            <a className="npl-btn npl-btn--solid npl-a2-buy" href={settings.storeUrl} target="_blank" rel="noopener">온라인 스토어에서 보기</a>
          )}
          {bean && (
            <div className="npl-a2-story">
              <h2>매장에서 전하는 말</h2>
              {lead && <p className="npl-a2-story-lead">{lead}</p>}
              <TextBlocks blocks={rest} className="npl-text" />
            </div>
          )}
          {!bean && <TextBlocks blocks={rest} className="npl-text npl-a2-text" />}
        </div>
      </div>
      <PostNav k="a2" newer={newer} older={older} />
    </article>
  );
}
