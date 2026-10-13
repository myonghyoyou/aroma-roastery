'use client';

import Link from 'next/link';
import { useMemo, useState, useSyncExternalStore } from 'react';
import type { NewsTopic } from '@/lib/content';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import {
  WEEKDAYS, dayIndex, itemHref, itemsInMonth, keyDayIn, monthParts, monthWeeks, periodDays,
  shortRangeLabel, spokenDay, topicsOf, weekday, type NewsItem,
} from './cal';

/*
 * The operating calendar: one month grid with the days the notices are about, then that month's
 * notices. Choosing a marked day (click, or keyboard focus) lights its notices below and the days
 * of a notice light up on the grid while its row is hovered or focused.
 */

const noop = () => () => {};
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shiftDay(iso: string, by: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + by)).toISOString().slice(0, 10);
}

export function OpsCalendar({ items, months, initialMonth }: { items: NewsItem[]; months: string[]; initialMonth: string }) {
  const [month, setMonth] = useState(initialMonth);
  const [selected, setSelected] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [rowHover, setRowHover] = useState<string | null>(null);
  // today is only known in the browser; the server render shows no mark
  const today = useSyncExternalStore(noop, localToday, () => null);

  const byDay = useMemo(() => dayIndex(items), [items]);
  const list = useMemo(() => itemsInMonth(items, month), [items, month]);
  const weeks = useMemo(() => monthWeeks(month), [month]);

  const at = months.indexOf(month);
  const prev = at > 0 ? months[at - 1] : null;
  const next = at >= 0 && at < months.length - 1 ? months[at + 1] : null;
  const { year, month: m } = monthParts(month);

  const activeDay = focused ?? selected;
  const activeItems = activeDay ? byDay.get(activeDay) ?? [] : [];
  const activeSlugs = new Set(activeItems.map((it) => it.slug));
  const hoverDays = new Set(periodDays(items.find((it) => it.slug === rowHover)?.period ?? null));

  function go(ym: string | null) {
    if (!ym) return;
    setMonth(ym);
    setSelected(null);
    setFocused(null);
  }

  const status = activeDay
    ? `${spokenDay(activeDay)}, ${activeItems.map((it) => `${TOPIC_LABEL[it.topic]}: ${it.title}`).join(', ')}`
    : `${year}년 ${m}월 소식 ${list.length}건. 색이 칠해진 날짜를 누르면 그날의 소식을 표시합니다.`;

  return (
    <div className="nl-b-cal">
      <div className="nl-b-cal-head">
        <h2 className="nl-b-month" id="nl-b-month-title">
          <span className="nl-b-month-year">{year}</span>
          <span className="nl-b-month-num">{m}</span>
          <span className="nl-b-month-unit">월</span>
        </h2>
        <div className="nl-b-nav">
          <button
            type="button" className="nl-b-nav-btn" onClick={() => go(prev)} disabled={!prev}
            aria-label={prev ? `이전 달, ${monthParts(prev).month}월` : '이전 달 없음'}
          >
            <span aria-hidden="true">‹</span> 이전 달
          </button>
          <button
            type="button" className="nl-b-nav-btn" onClick={() => go(next)} disabled={!next}
            aria-label={next ? `다음 달, ${monthParts(next).month}월` : '다음 달 없음'}
          >
            다음 달 <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      <ul className="nl-b-legend" aria-label="분류 색">
        {(['closure', 'event', 'hours', 'beans', 'notice'] as NewsTopic[]).map((t) => (
          <li key={t} data-topic={t}>
            <span className="nl-b-swatch" aria-hidden="true" />
            {TOPIC_LABEL[t]}
          </li>
        ))}
      </ul>

      <table className="nl-b-grid" aria-labelledby="nl-b-month-title">
        <thead>
          <tr>
            {WEEKDAYS.map((w, i) => (
              <th key={w} scope="col" className={i === 0 ? 'is-sun' : i === 6 ? 'is-sat' : undefined}>
                <abbr title={`${w}요일`}>{w}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((iso, di) => {
                if (!iso) return <td key={di} className="nl-b-day is-empty" />;
                const dayItems = byDay.get(iso);
                const topics = topicsOf(dayItems);
                const num = Number(iso.slice(8, 10));
                const cls = [
                  'nl-b-day',
                  topics.includes('closure') ? 'is-closed' : '',
                  iso === today ? 'is-today' : '',
                  iso === activeDay ? 'is-active' : '',
                  hoverDays.has(iso) ? 'is-linked' : '',
                ].filter(Boolean).join(' ');
                const bars = topics.map((t) => {
                  const prevSame = di > 0 && topicsOf(byDay.get(shiftDay(iso, -1))).includes(t);
                  const nextSame = di < 6 && topicsOf(byDay.get(shiftDay(iso, 1))).includes(t);
                  return (
                    <span
                      key={t} data-topic={t} aria-hidden="true"
                      className={`nl-b-bar${prevSame ? ' is-cont-l' : ''}${nextSame ? ' is-cont-r' : ''}`}
                    >
                      {!prevSame && <span className="nl-b-bar-label">{TOPIC_LABEL[t]}</span>}
                    </span>
                  );
                });
                return (
                  <td key={di} className={cls}>
                    {topics.length > 0 ? (
                      <button
                        type="button"
                        className="nl-b-day-btn"
                        aria-pressed={selected === iso}
                        aria-label={`${spokenDay(iso)}, ${topics.map((t) => TOPIC_LABEL[t]).join(', ')}`}
                        onClick={() => setSelected((s) => (s === iso ? null : iso))}
                        onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) setFocused(iso); }}
                        onBlur={() => setFocused(null)}
                      >
                        <span className="nl-b-num">{num}</span>
                        <span className="nl-b-bars">{bars}</span>
                      </button>
                    ) : (
                      <span className="nl-b-day-plain">
                        <span className="nl-b-num">{num}</span>
                      </span>
                    )}
                    {iso === today && <span className="nl-b-today">오늘</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="nl-b-status-row">
        <p className="nl-b-status" aria-live="polite">{status}</p>
        {selected && (
          <button type="button" className="nl-b-clear" onClick={() => setSelected(null)}>
            선택 해제
          </button>
        )}
      </div>

      <section className="nl-b-agenda" aria-labelledby="nl-b-agenda-title">
        <h2 className="nl-b-agenda-title" id="nl-b-agenda-title">
          {m}월의 소식 <span className="nl-b-count">{list.length}건</span>
        </h2>
        {list.length === 0 ? (
          <p className="nl-b-empty">이 달에는 소식이 없습니다.</p>
        ) : (
          <ol className={activeDay ? 'nl-b-rows has-active' : 'nl-b-rows'}>
            {list.map((it) => {
              const key = keyDayIn(it, month);
              const hit = activeSlugs.has(it.slug);
              return (
                <li
                  key={it.slug}
                  className={hit ? 'nl-b-row is-hit' : 'nl-b-row'}
                  data-topic={it.topic}
                  onMouseEnter={() => setRowHover(it.slug)}
                  onMouseLeave={() => setRowHover(null)}
                  onFocus={() => setRowHover(it.slug)}
                  onBlur={() => setRowHover(null)}
                >
                  <p className="nl-b-row-day" aria-hidden="true">
                    <span className="nl-b-row-num">{Number(key.slice(8, 10))}</span>
                    <span className="nl-b-row-wd">{weekday(key)}</span>
                  </p>
                  <div className="nl-b-row-main">
                    <p className="nl-b-row-meta">
                      <span className="nl-b-topic" data-topic={it.topic}>
                        <span className="nl-b-dot" aria-hidden="true" />
                        {TOPIC_LABEL[it.topic]}
                      </span>
                      {it.period && <span className="nl-b-row-period">해당 {shortRangeLabel(it.period)}</span>}
                      <span className="nl-b-row-posted">
                        게시 <time dateTime={it.date}>{formatDate(it.date)}</time>
                      </span>
                      {it.pinned && <span className="nl-b-pin">고정</span>}
                      {it.sample && <span className="tag-sample">예시</span>}
                    </p>
                    <h3 className="nl-b-row-title">
                      <Link href={itemHref(it.slug)} className="nl-b-row-link">{it.title}</Link>
                    </h3>
                    <p className="nl-b-row-summary">{it.summary}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
