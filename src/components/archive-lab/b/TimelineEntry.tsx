import Link from 'next/link';
import type { Post } from '@/lib/content';
import { CATEGORY_LABEL } from '@/lib/post-utils';
import { CATEGORY_DOT, dayParts } from './calendar';

const STRIP_COUNT = 4;
const STRIP_HEIGHT = 128;

/*
 * One post on the timeline: the day number on the left, then category, title, summary and a strip of
 * the post's first photos at one shared height, each at its own width. "+n" counts the rest.
 */
export function TimelineEntry({ post, eager }: { post: Post; eager: boolean }) {
  const href = `/archive-lab/b/${post.slug}`;
  const { day, weekday } = dayParts(post.date);
  const photos = post.photos ?? [];
  const strip = photos.slice(0, STRIP_COUNT);
  const more = photos.length - strip.length;

  return (
    <article className="lab-b-entry">
      <p className="lab-b-day">
        <time dateTime={post.date}>
          <span className="lab-b-day-num">{day}</span>
          <span className="lab-b-day-week">{weekday}</span>
        </time>
      </p>
      <div className="lab-b-entry-body">
        {post.category && (
          <p className="lab-b-cat">
            <span className="lab-b-dot" style={{ background: CATEGORY_DOT[post.category] }} aria-hidden="true" />
            {CATEGORY_LABEL[post.category]}
          </p>
        )}
        <h4 className="lab-b-entry-title">
          <Link href={href}>{post.title}</Link>
        </h4>
        <p className="lab-b-entry-summary">{post.summary}</p>
        {strip.length > 0 && (
          <Link
            href={href}
            className="lab-b-strip"
            tabIndex={-1}
            aria-label={`${post.title}, 사진 ${photos.length}장`}
          >
            {strip.map((ph) => (
              <span
                key={ph.src}
                className="lab-b-strip-ph"
                style={{ aspectRatio: `${ph.w} / ${ph.h}` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- plain img by brief */}
                <img
                  src={ph.src}
                  alt={ph.alt}
                  width={Math.round((STRIP_HEIGHT * ph.w) / ph.h)}
                  height={STRIP_HEIGHT}
                  loading={eager ? 'eager' : 'lazy'}
                />
              </span>
            ))}
            {more > 0 && (
              <span className="lab-b-strip-more">
                +{more}
                <span className="lab-b-sr">장 더</span>
              </span>
            )}
          </Link>
        )}
      </div>
    </article>
  );
}
