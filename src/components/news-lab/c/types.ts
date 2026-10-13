import type { NewsTopic, Post } from '@/lib/content';

/* Plain card data, safe to pass from the server pages into the client feed. */

export const LIST_HREF = '/news-lab/c';

export function cardHref(slug: string): string {
  return `${LIST_HREF}/${slug}`;
}

export type NewsCardData = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  topic: NewsTopic;
  pinned: boolean;
  sample: boolean;
  /** a still only: video covers are never shown in this concept */
  cover: { src: string; alt: string } | null;
};

export const TOPIC_ORDER: NewsTopic[] = ['hours', 'closure', 'beans', 'event', 'notice'];

export function toCard(post: Post): NewsCardData {
  const still = post.cover && post.cover.kind === 'image' ? post.cover : post.cover?.poster ? { src: post.cover.poster, alt: post.cover.alt } : null;
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    summary: post.summary,
    topic: post.topic ?? 'notice',
    pinned: Boolean(post.pinned),
    sample: post.sample,
    cover: still ? { src: still.src, alt: still.alt } : null,
  };
}

/** Pinned notices first, then newest first (the content layer already sorts by date). */
export function toFeed(posts: Post[]): NewsCardData[] {
  const cards = posts.map(toCard);
  return [...cards.filter((c) => c.pinned), ...cards.filter((c) => !c.pinned)];
}

/** Three other notices: same topic first, then the newest of the rest. */
export function pickRelated(post: Post, posts: Post[]): NewsCardData[] {
  const others = posts.filter((p) => p.slug !== post.slug);
  const same = others.filter((p) => p.topic === post.topic);
  const rest = others.filter((p) => p.topic !== post.topic);
  return [...same, ...rest].slice(0, 3).map(toCard);
}

/** 2026-09-24 .. 2026-09-27 -> "2026.09.24 ~ 09.27"; one day -> "2026.10.21" */
export function formatPeriod(period: { start: string; end?: string }): string {
  const start = period.start.replaceAll('-', '.');
  if (!period.end || period.end === period.start) return start;
  const [sy] = period.start.split('-');
  const [ey, em, ed] = period.end.split('-');
  return sy === ey ? `${start} ~ ${em}.${ed}` : `${start} ~ ${period.end.replaceAll('-', '.')}`;
}
