import Link from 'next/link';
import type { Post } from '@/lib/content';
import { newsLabHref } from './concepts';

/*
 * The way on, kept apart from the photos' own arrows (the research's E rule): a band of text links
 * with the newer notice, the list, the older notice.
 */
export function PostNav({ k, newer, older, className = 'npl-nav' }: { k: string; newer: Post | null; older: Post | null; className?: string }) {
  return (
    <nav className={className} aria-label="앞뒤 소식">
      <Side k={k} post={newer} label="최근 소식" dir="newer" />
      <Link href="/news" className="npl-btn">목록</Link>
      <Side k={k} post={older} label="이전 소식" dir="older" />
    </nav>
  );
}

function Side({ k, post, label, dir }: { k: string; post: Post | null; label: string; dir: 'newer' | 'older' }) {
  const cls = `npl-nav-side npl-nav-side--${dir}`;
  if (!post) return <span className={`${cls} is-off`}><span className="npl-nav-label">{label}</span><span>없음</span></span>;
  return (
    <Link href={newsLabHref(k, post.slug)} className={cls}>
      <span className="npl-nav-label">{dir === 'newer' ? '‹ ' : ''}{label}{dir === 'older' ? ' ›' : ''}</span>
      <span className="npl-nav-title">{post.title}</span>
    </Link>
  );
}
