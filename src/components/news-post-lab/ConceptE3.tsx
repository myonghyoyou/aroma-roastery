import Link from 'next/link';
import { TextBlocks } from '@/components/archive/TextBlocks';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import { Gallery } from './Gallery';
import { PostNav } from './PostNav';
import { FactList, type NewsView } from './shared';

/*
 * E3, E as La Cabra lays out a coffee: the large photo with small frames to switch on the left; on
 * the right a sticky column with the origin over the title, the cup notes, and the rest folded
 * into sections (the notice itself open, the profile and the original closed until wanted).
 */
export function ConceptE3({ v }: { v: NewsView }) {
  const { post, photos, bean, rows, lead, rest, newer, older, settings } = v;
  const topic = post.topic ?? 'notice';
  return (
    <article className="npl-e3" data-topic={topic}>
      <p className="npl-crumb"><Link href="/news">소식</Link><span aria-hidden="true">/</span><span>{TOPIC_LABEL[topic]}</span></p>
      <div className="npl-e3-split">
        {photos.length > 0 ? <Gallery photos={photos} /> : <div className="npl-e3-field" aria-hidden="true"><span className="nws-field" /></div>}
        <div className="npl-e3-info">
          <p className="npl-e3-over">{bean?.origin ?? TOPIC_LABEL[topic]}</p>
          <h1 className="npl-e3-title">{post.title}</h1>
          <p className="npl-meta"><time dateTime={post.date}>{formatDate(post.date)}</time></p>
          {bean && bean.notes.length > 0 && <p className="npl-e3-notes">{bean.notes.join(', ')}</p>}

          <details className="npl-e3-fold" open>
            <summary>{bean ? '원두 이야기' : '소식 내용'}</summary>
            {lead && <p className="npl-e3-lead">{lead}</p>}
            <TextBlocks blocks={rest} className="npl-text" />
          </details>
          <details className="npl-e3-fold" open={!bean}>
            <summary>{bean ? '원두 정보' : '안내 정보'}</summary>
            <FactList facts={rows} className="npl-rows" />
          </details>
          {bean && bean.store !== 'store-only' && (
            <a className="npl-btn npl-btn--solid npl-e3-buy" href={settings.storeUrl} target="_blank" rel="noopener">온라인 스토어에서 보기</a>
          )}
        </div>
      </div>
      <PostNav k="e3" newer={newer} older={older} />
    </article>
  );
}
