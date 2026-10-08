'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAMES: Record<string, string> = { a: '로스팅 로그', b: '연도 타임라인', c: '필름 스트립', d: '컨택트 시트', e: '저널 스프레드' };

/**
 * Fixed "back to the concept list" button on every archive concept page (list and post), so a
 * reviewer can always return to the hub. Hidden on the hub itself.
 */
export function LabBack() {
  const pathname = usePathname();
  const key = /^\/archive-lab\/([a-e])(?:\/|$)/.exec(pathname)?.[1];
  if (!key) return null;
  return (
    <Link href="/archive-lab" className="lab-back" aria-label={`아카이브 시안 목록으로 돌아가기, 지금 보는 시안: ${key.toUpperCase()} ${NAMES[key]}`}>
      <b>{key.toUpperCase()}</b>
      <span>시안 목록</span>
    </Link>
  );
}
