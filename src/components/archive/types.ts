import type { ArchiveCategory, Photo, Post } from '@/lib/content';

/** One photo of the contact sheet, carrying enough of its post to label it and link back. */
export type SheetItem = {
  key: string;
  photo: Photo;
  slug: string;
  title: string;
  /** the post had no caption words: its title is only its date, so the sheet shows the date alone */
  untitled: boolean;
  category: ArchiveCategory | null;
  date: string;
  /** 1-based position of the photo inside its post */
  frame: number;
  /** order of the post in the archive, newest first; used for "기록 n건" */
  postIndex: number;
};

/** Flatten posts into photo items, in a fixed order (newest post first, photos in reading order). */
export function toSheetItems(posts: Post[]): SheetItem[] {
  return posts.flatMap((post, postIndex) =>
    (post.photos ?? []).map((photo, i) => ({
      key: `${post.slug}-${i}`,
      photo,
      slug: post.slug,
      title: post.title,
      untitled: !!post.untitled,
      category: post.category ?? null,
      date: post.date,
      frame: i + 1,
      postIndex,
    })),
  );
}

export const LIST_HREF = '/archive';

export function sheetHref(slug: string): string {
  return `${LIST_HREF}/${slug}`;
}
