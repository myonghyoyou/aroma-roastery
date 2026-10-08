'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { getLenis } from '@/components/site/SmoothScroll';
import { monthLabel, type RailMonth } from './calendar';

/*
 * The month rail. On desktop it is a sticky vertical list beside the timeline; under 760px the same
 * list turns into a sticky row of chips at the top. The month in view is found with an
 * IntersectionObserver (no scroll listeners) and highlighted with a thin leaf-colour mark.
 */
export function MonthRail({ months }: { months: RailMonth[] }) {
  const [active, setActive] = useState(months[0]?.id ?? '');
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const sections = months
      .map((m) => document.getElementById(m.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        // the first month (in page order) that crosses the upper band of the screen wins
        const first = months.find((m) => visible.has(m.id));
        if (first) setActive(first.id);
      },
      { rootMargin: '-15% 0px -60% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [months]);

  // in the chip row, keep the active chip inside the visible part of the row
  useEffect(() => {
    const list = listRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const chip = list.querySelector<HTMLElement>(`[data-month="${active}"]`);
    if (!chip) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const left = chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' });
  }, [active]);

  function go(e: MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target);
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
    setActive(id);
    target.querySelector<HTMLElement>('[data-month-label]')?.focus({ preventScroll: true });
  }

  return (
    <nav className="lab-b-rail" aria-label="월별 이동">
      <ol className="lab-b-rail-list" ref={listRef}>
        {months.map((m, i) => {
          const showYear = months[i - 1]?.year !== m.year;
          const isActive = m.id === active;
          return (
            <li key={m.id} className="lab-b-rail-item" data-month={m.id}>
              {showYear && <span className="lab-b-rail-year">{m.year}</span>}
              <a
                href={`#${m.id}`}
                className={isActive ? 'lab-b-rail-link is-active' : 'lab-b-rail-link'}
                aria-current={isActive ? 'location' : undefined}
                onClick={(e) => go(e, m.id)}
              >
                <span className="lab-b-rail-month">{monthLabel(m.month)}</span>
                <span className="lab-b-rail-count">{m.count}<span className="lab-b-sr">건</span></span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
