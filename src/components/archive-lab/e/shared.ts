import type { ArchiveCategory, Photo, Post } from '@/lib/content';

/* Plain data handed from the server pages to the client list (no functions, no Date objects). */

export type LabECover = { src: string; alt: string; w: number; h: number };

export type LabEItem = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: ArchiveCategory;
  cover: LabECover | null;
  photoCount: number;
};

export const LAB_E_BASE = '/archive-lab/e';

/** The cover is a Media without a pixel size; take the size from the matching photo when there is one. */
export function coverOf(post: Post): LabECover | null {
  if (!post.cover) return null;
  const match: Photo | undefined = post.photos?.find((p) => p.src === post.cover?.src);
  return { src: post.cover.src, alt: post.cover.alt, w: match?.w ?? 1600, h: match?.h ?? 1200 };
}

export function toLabEItem(post: Post): LabEItem {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    summary: post.summary,
    category: post.category ?? 'store',
    cover: coverOf(post),
    photoCount: post.photos?.length ?? 0,
  };
}
