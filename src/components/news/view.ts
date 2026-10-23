import { beanProfile, type BeanProfile } from '@/components/cupnote/bean';
import type { NoteOverrides } from '@/lib/cupnotes-store';
import type { Block, Photo, Post } from '@/lib/content';

/** The caption as one string, for reading cup notes and the bean's profile from it. */
export const captionText = (blocks: Block[]) => blocks.map((b) => ('text' in b ? b.text : 'items' in b ? b.items.join(' ') : '')).join(' ');

/** A post's photos; a sample notice carries only a cover, with no size, which stands in as the one photo. */
export function photosOf(post: Post): Photo[] {
  if (post.photos?.length) return post.photos;
  return post.cover?.kind === 'image' ? [{ ...post.cover, kind: 'image', w: 1080, h: 1350 }] : [];
}

/** The first paragraph as the lead, and the blocks after it. */
export function leadOf(post: Post): { lead: string | null; rest: Block[] } {
  const [first, ...after] = post.body;
  if (first && first.type === 'paragraph') return { lead: first.text, rest: after };
  return { lead: post.summary || null, rest: post.body };
}

/** A bean arrival's profile (origin, farm, variety, process, cup notes), or null for another notice. */
export function beanOf(post: Post, overrides?: NoteOverrides): BeanProfile | null {
  return post.topic === 'beans' ? beanProfile(post.title, captionText(post.body), overrides) : null;
}
