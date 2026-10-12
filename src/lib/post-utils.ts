import type { ArchiveCategory, NewsTopic, Post, PostType } from '@/lib/content';

/* Plain helpers safe for both server and client components (content.ts itself is server only). */

export const TYPE_LABEL: Record<PostType, string> = { archive: '아카이브', news: '소식' };

export const CATEGORY_LABEL: Record<ArchiveCategory, string> = { roasting: '로스팅', cupping: '커핑', event: '행사·협업', store: '매장' };

export const TOPIC_LABEL: Record<NewsTopic, string> = { hours: '영업시간', closure: '휴무', beans: '원두', event: '행사', notice: '공지' };

/** 2026-09-27 -> 2026.09.27 */
export function formatDate(iso: string): string {
  return iso.replaceAll('-', '.');
}

export function postHref(post: Pick<Post, 'type' | 'slug'>): string {
  return `/${post.type}/${post.slug}`;
}
