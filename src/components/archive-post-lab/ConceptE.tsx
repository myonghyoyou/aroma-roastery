import Link from 'next/link';
import { formatDate } from '@/lib/post-utils';
import { labHref } from './concepts';
import { TextBlocks, type PostView } from './shared';
import { Zoomable } from '@/components/archive/Zoomable';

/*
 * E: one reading column, top to bottom: the way back and the date, the heading, the photos at the
 * column's width, the caption. At the foot the neighbouring posts run in one strip like a contact
 * print, the current one marked, so the place in the archive is seen and the next step is one click.
 */
export function ConceptE({ v }: { v: PostView }) {
  const { post, items, heading, around } = v;
  return (
    <article className="apl-e">
      <div className="apl-e-top">
        <Link href="/archive" className="apl-e-back"><span aria-hidden="true">‹</span> 아카이브</Link>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </div>
      <h1 className="apl-e-title">{heading}</h1>

      <Zoomable items={items} title={heading} listClassName="apl-e-photos" itemClassName="apl-e-photo" mediaClassName="apl-e-img" numbered={items.length > 1} />

      <TextBlocks blocks={post.body} className="apl-text apl-e-text" />
      {post.permalink && (
        <p className="apl-e-insta"><a href={post.permalink} target="_blank" rel="noopener">인스타그램에서 보기</a></p>
      )}

      <nav className="apl-e-strip" aria-label="앞뒤 기록">
        <p className="apl-e-strip-head"><span>최근</span><span>이전</span></p>
        <ol>
          {around.map((p) => {
            const here = p.slug === post.slug;
            const cover = p.photos?.[0] ?? p.cover;
            return (
              <li key={p.slug}>
                <Link href={labHref('e', p.slug)} className="apl-e-frame" aria-current={here ? 'page' : undefined}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {cover && <img src={cover.src} alt="" loading="lazy" decoding="async" />}
                  <time dateTime={p.date}>{formatDate(p.date).slice(2)}</time>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </article>
  );
}
