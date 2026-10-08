import type { ArchiveCategory } from '@/lib/content';

/* Small helpers for concept C (film strip). Safe for server and client components. */

export const LAB_C_LIST = '/archive-lab/c';

export function labCHref(slug: string): string {
  return `${LAB_C_LIST}/${slug}`;
}

/** Leaf colour used only as a small dot next to the category name. */
export const LAB_C_LEAF: Record<ArchiveCategory, string> = {
  roasting: '#EF7000',
  cupping: '#07913B',
  event: '#C10110',
  store: '#EDBE00',
};

/** Frame number like a film edge: 3 of 10 -> "03 / 10". */
export function frameLabel(index: number, total: number): string {
  return `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}
