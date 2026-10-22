import Link from 'next/link';
import { TextBlocks } from '@/components/archive/TextBlocks';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import { PeekTrack } from './PeekTrack';
import { PostNav } from './PostNav';
import { FactList, type NewsView } from './shared';

/*
 * E2, E with Terarosa's controls: the title above, the photos one a view with the next peeking
 * (round arrows on the photo, a page pill under it), then the caption as text in a reading column
 * (Terarosa keeps all its words inside the images; here they stay readable and searchable), the
 * facts as one row, and the way to the neighbours in its own band, never on the photos.
 */
export function ConceptE2({ v }: { v: NewsView }) {
  const { post, photos, bean, rows, lead, rest, newer, older } = v;
  const topic = post.topic ?? 'notice';
  return (
    <article className="npl-e2" data-topic={topic}>
      <header className="npl-e2-head">
        <p className="npl-crumb"><Link href="/news">소식</Link><span aria-hidden="true">/</span><span>{TOPIC_LABEL[topic]}</span><span aria-hidden="true">/</span><time dateTime={post.date}>{formatDate(post.date)}</time></p>
        <h1 className="npl-e2-title">{post.title}</h1>
        {bean && bean.notes.length > 0 && <p className="npl-e2-notes">{bean.notes.join(' · ')}</p>}
      </header>

      {photos.length > 0 ? <PeekTrack photos={photos} /> : <div className="npl-e2-field" aria-hidden="true"><span className="nws-field" /></div>}

      <div className="npl-e2-col">
        {lead && <p className="npl-e2-lead">{lead}</p>}
        <TextBlocks blocks={rest} className="npl-text" />
        <FactList facts={rows} className="npl-e2-facts" />
      </div>
      <PostNav k="e2" newer={newer} older={older} />
    </article>
  );
}
