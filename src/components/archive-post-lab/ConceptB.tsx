import { PostSpread } from '@/components/archive/PostSpread';
import { labHref } from './concepts';
import type { PostView } from './shared';

/* B: the concept chosen for the archive post page; the study draws the same component. */
export function ConceptB({ v }: { v: PostView }) {
  return <PostSpread post={v.post} items={v.items} newer={v.newer} older={v.older} hrefOf={(slug) => labHref('b', slug)} />;
}
