import type { Post, PostType } from '@/lib/content';

/* Plain helpers safe for both server and client components (content.ts itself is server only). */

export const TYPE_LABEL: Record<PostType, string> = { archive: '아카이브', news: '소식' };

/** 2026-09-27 -> 2026.09.27 */
export function formatDate(iso: string): string {
  return iso.replaceAll('-', '.');
}

export function postHref(post: Pick<Post, 'type' | 'slug'>): string {
  return `/${post.type}/${post.slug}`;
}
