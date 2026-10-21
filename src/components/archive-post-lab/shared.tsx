import { toSheetItems, type SheetItem } from '@/components/archive/types';
import { getPosts, type Post } from '@/lib/content';
import { formatDate } from '@/lib/post-utils';

/** Everything a concept page needs about one archive post and where it sits in the archive. */
export type PostView = {
  post: Post;
  items: SheetItem[];
  /** the heading: the title, or the date for a post whose caption had no words */
  heading: string;
  newer: Post | null;
  older: Post | null;
  /** 0-based place in the archive (newest first) and the archive's size */
  index: number;
  total: number;
  /** a few posts on each side, for the concepts that show neighbours */
  around: Post[];
};

export async function loadPostView(slug: string, span = 3): Promise<PostView | null> {
  const list = await getPosts('archive');
  const index = list.findIndex((p) => p.slug === slug);
  if (index < 0) return null;
  const post = list[index];
  const from = Math.max(0, Math.min(index - span, list.length - span * 2 - 1));
  return {
    post,
    items: toSheetItems([post]),
    heading: post.untitled ? `${formatDate(post.date)}의 기록` : post.title,
    newer: list[index - 1] ?? null,
    older: list[index + 1] ?? null,
    index,
    total: list.length,
    around: list.slice(from, from + span * 2 + 1),
  };
}

/** The first post of each shape the archive holds, so the hub can open every concept on each. */
export async function pickExamples(): Promise<{ label: string; slug: string }[]> {
  const list = await getPosts('archive');
  const textLength = (p: Post) => p.body.reduce((n, b) => n + ('text' in b ? b.text.length : 0), 0);
  const pick = [
    { label: '원두 카드 2장', post: list.find((p) => (p.photos?.length ?? 0) === 2) },
    { label: '사진 1장', post: list.find((p) => (p.photos?.length ?? 0) === 1) },
    { label: '글이 긴 기록', post: [...list].sort((a, b) => textLength(b) - textLength(a))[0] },
    { label: '영상', post: list.find((p) => p.photos?.some((ph) => ph.video)) },
    { label: '사진 여러 장', post: list.find((p) => (p.photos?.length ?? 0) > 2) },
  ];
  const seen = new Set<string>();
  return pick.flatMap(({ label, post }) => {
    if (!post || seen.has(post.slug)) return [];
    seen.add(post.slug);
    return [{ label, slug: post.slug }];
  });
}

/*
 * Only the hub's examples are built ahead; any other post (reached by the arrows) is drawn on its
 * first visit. Building every post for every concept made about 2,500 pages and broke the build
 * ("RangeError: Invalid string length" while writing them out).
 */
export async function postLabParams() {
  return (await pickExamples()).map(({ slug }) => ({ slug }));
}

export { TextBlocks } from '@/components/archive/TextBlocks';
