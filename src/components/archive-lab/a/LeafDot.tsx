import type { ArchiveCategory } from '@/lib/content';
import { CATEGORY_LABEL } from '@/lib/post-utils';

/* Category marker of the log: a small dot in the matching leaf colour, then the label. */
export function LeafDot({ category }: { category: ArchiveCategory }) {
  return (
    <span className={`lab-a-cat lab-a-cat--${category}`}>
      <span className="lab-a-dot" aria-hidden="true" />
      {CATEGORY_LABEL[category]}
    </span>
  );
}
