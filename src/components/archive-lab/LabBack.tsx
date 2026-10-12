'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  /** the hub of the study, e.g. /archive-lab */
  base: string;
  /** what is being compared, for the label: 아카이브, 소식 */
  subject: string;
  /** concept names by key */
  names: Record<string, string>;
};

/**
 * Fixed "back to the concept list" button on every concept page of a design study (list and post),
 * so a reviewer can always return to the hub. Hidden on the hub itself.
 */
export function LabBack({ base, subject, names }: Props) {
  const pathname = usePathname();
  const key = new RegExp(`^${base}/([a-e])(?:/|$)`).exec(pathname)?.[1];
  if (!key) return null;
  return (
    <Link href={base} className="lab-back" aria-label={`${subject} 시안 목록으로 돌아가기, 지금 보는 시안: ${key.toUpperCase()} ${names[key]}`}>
      <b>{key.toUpperCase()}</b>
      <span>시안 목록</span>
    </Link>
  );
}
