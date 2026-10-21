'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Block, Photo } from '@/lib/content';
import { MediaView } from './MediaView';

type Step = { href: string; label: string } | null;

/*
 * D: the whole screen is for looking. A bar on top (close, date, place in the archive), the post's
 * photos fitted to the screen's height in the middle, arrows on both sides to the neighbouring
 * posts (the arrow keys too, Esc back to the list), the caption kept to one line below until opened.
 */
export function Viewer({
  photos, heading, date, place, blocks, permalink, newer, older,
}: {
  photos: Photo[]; heading: string; date: string; place: string; blocks: Block[];
  permalink?: string; newer: Step; older: Step;
}) {
  const router = useRouter();
  const [openText, setOpenText] = useState(false);
  const text = blocks.flatMap((b) => ('text' in b ? [b.text] : 'items' in b ? b.items : []));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'VIDEO' || t.tagName === 'INPUT' || t.isContentEditable)) return;
      if (e.key === 'ArrowLeft' && newer) router.push(newer.href);
      else if (e.key === 'ArrowRight' && older) router.push(older.href);
      else if (e.key === 'Escape') router.push('/archive');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router, newer, older]);

  return (
    <section className="apl-d" aria-label={heading}>
      <div className="apl-d-bar">
        <Link href="/archive" className="apl-btn">닫기 <span className="apl-key" aria-hidden="true">Esc</span></Link>
        <p className="apl-d-where"><time dateTime={date}>{date.replaceAll('-', '.')}</time><span>{place}</span></p>
        {permalink ? <a href={permalink} className="apl-btn" target="_blank" rel="noopener">인스타그램</a> : <span />}
      </div>

      <div className="apl-d-stage">
        <Arrow step={newer} dir="newer" />
        <ol className={`apl-d-photos is-${Math.min(photos.length, 3)}`}>
          {photos.map((p, i) => (
            <li key={p.src + i}><MediaView photo={p} className="apl-d-img" eager autoPlay /></li>
          ))}
        </ol>
        <Arrow step={older} dir="older" />
      </div>

      <div className="apl-d-cap">
        <h1 className="apl-d-title">{heading}</h1>
        {text.length > 0 && (
          <>
            <div className={openText ? 'apl-d-text is-open' : 'apl-d-text'} id="apl-d-text">
              {text.map((t, i) => <p key={i}>{t}</p>)}
            </div>
            <button type="button" className="apl-d-more" aria-expanded={openText} aria-controls="apl-d-text" onClick={() => setOpenText((o) => !o)}>
              {openText ? '글 접기' : '글 펼치기'}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function Arrow({ step, dir }: { step: Step; dir: 'newer' | 'older' }) {
  const sign = dir === 'newer' ? '‹' : '›';
  if (!step) return <span className={`apl-d-arrow apl-d-arrow--${dir} is-off`} aria-hidden="true">{sign}</span>;
  return (
    <Link href={step.href} className={`apl-d-arrow apl-d-arrow--${dir}`} aria-label={`${dir === 'newer' ? '최근 기록' : '이전 기록'}: ${step.label}`}>
      <span aria-hidden="true">{sign}</span>
    </Link>
  );
}
