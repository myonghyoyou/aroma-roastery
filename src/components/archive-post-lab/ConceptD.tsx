import { formatDate } from '@/lib/post-utils';
import { labHref } from './concepts';
import type { PostView } from './shared';
import { Viewer } from './Viewer';

/* D: a full-screen viewer; see Viewer for the layout and the keys. */
export function ConceptD({ v }: { v: PostView }) {
  const { post, heading, newer, older, index, total } = v;
  const label = (p: NonNullable<typeof newer>) => (p.untitled ? formatDate(p.date) : p.title);
  return (
    <Viewer
      photos={post.photos ?? []}
      heading={heading}
      date={post.date}
      place={`${index + 1} / ${total}`}
      blocks={post.body}
      permalink={post.permalink}
      newer={newer && { href: labHref('d', newer.slug), label: label(newer) }}
      older={older && { href: labHref('d', older.slug), label: label(older) }}
    />
  );
}
