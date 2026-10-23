import { NewsPost } from '@/components/news/NewsPost';
import { newsLabHref } from './concepts';
import type { NewsView } from './shared';

/* F: the concept chosen for the news post page (2026-10-23); the study draws the same component. */
export function ConceptF({ v }: { v: NewsView }) {
  return (
    <NewsPost
      post={v.post}
      photos={v.photos}
      bean={v.bean}
      lead={v.lead}
      rest={v.rest}
      newer={v.newer}
      older={v.older}
      storeUrl={v.settings.storeUrl}
      hrefOf={(slug) => newsLabHref('f', slug)}
    />
  );
}
