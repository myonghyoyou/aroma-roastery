'use client';

import Link from 'next/link';
import { TOPIC_LABEL } from '@/lib/post-utils';
import {
  addDays, daysBetween, formatDay, hoursLineFor, inPeriod, nlEHref, parseRange, weekdayOf,
  type NlEHours, type NlENotice,
} from './shared';
import { useSeoulNow, type SeoulNow } from './useSeoulNow';

type Status = {
  kind: 'open' | 'before' | 'after' | 'closed';
  headline: string;
  detail: string;
  numeral?: string;
  numeralLabel?: string;
  closure?: NlENotice;
};

function closureOn(day: string, notices: NlENotice[]): NlENotice | undefined {
  return notices.find((n) => n.topic === 'closure' && n.period && inPeriod(day, n.period));
}

function statusAt(now: SeoulNow, hours: NlEHours, notices: NlENotice[]): Status {
  const closure = closureOn(now.day, notices);
  if (closure) return { kind: 'closed', headline: '오늘 휴무', detail: closure.title, closure };

  const range = parseRange(hoursLineFor(hours, now.weekday)?.value ?? '');
  if (!range) return { kind: 'closed', headline: '오늘 휴무', detail: '영업시간 안내를 확인해 주세요.' };
  if (now.minutes < range.open) {
    return { kind: 'before', headline: '영업 전', detail: `${range.openText}에 열어요`, numeral: range.openText, numeralLabel: '여는 시간' };
  }
  if (now.minutes < range.close) {
    return { kind: 'open', headline: '지금 영업 중', detail: `${range.closeText}까지`, numeral: range.closeText, numeralLabel: '닫는 시간' };
  }

  const tomorrow = addDays(now.day, 1);
  if (closureOn(tomorrow, notices)) return { kind: 'after', headline: '오늘 영업 종료', detail: '내일은 휴무입니다.' };
  const next = parseRange(hoursLineFor(hours, weekdayOf(tomorrow))?.value ?? '');
  return {
    kind: 'after',
    headline: '오늘 영업 종료',
    detail: next ? `내일 ${next.openText}에 열어요` : '내일 영업시간은 안내를 확인해 주세요.',
    numeral: next?.openText,
    numeralLabel: next ? '내일 여는 시간' : undefined,
  };
}

function dday(today: string, start: string): string {
  const n = daysBetween(today, start);
  return n === 0 ? '오늘' : `D-${n}`;
}

/*
 * "지금 알아둘 것": today's opening status and the dated notices still ahead.
 * Before hydration (and in the prerendered HTML) it shows the plain hours and the dated notices
 * from the newest post on, without D-day; the client then swaps in the real status once.
 */
export function StatusStrip({ hours, notices, fallbackFrom }: { hours: NlEHours; notices: NlENotice[]; fallbackFrom: string }) {
  const now = useSeoulNow();
  const status = now ? statusAt(now, hours, notices) : null;
  const todayLine = now ? hoursLineFor(hours, now.weekday) : null;

  const from = now?.day ?? fallbackFrom;
  const upcoming = notices
    .filter((n) => n.period && n.period.start >= from && (n.topic === 'closure' || n.topic === 'event' || n.topic === 'hours'))
    .sort((a, b) => (a.period!.start < b.period!.start ? -1 : 1));

  return (
    <section className="nl-e-strip" aria-labelledby="nl-e-strip-title">
      <h2 id="nl-e-strip-title" className="nl-e-strip-title">지금 알아둘 것</h2>

      <div className="nl-e-panel nl-e-today" data-state={status?.kind ?? 'unknown'}>
        <h3 className="nl-e-panel-label">오늘 영업</h3>
        {status ? (
          <>
            <p className="nl-e-state">
              <span className="nl-e-dot" aria-hidden="true" />
              <span className="nl-e-state-text">
                {status.headline}
                <span className="nl-e-state-sep" aria-hidden="true"> · </span>
                <span className="nl-e-visually-hidden">, </span>
                {status.closure ? (
                  <Link href={nlEHref(status.closure.slug)} className="nl-e-state-link">{status.detail}</Link>
                ) : (
                  status.detail
                )}
              </span>
            </p>
            {status.numeral && (
              <p className="nl-e-numeral" aria-hidden="true">
                <span className="nl-e-numeral-label">{status.numeralLabel}</span>
                <span className="nl-e-numeral-value">{status.numeral}</span>
              </p>
            )}
          </>
        ) : (
          <p className="nl-e-state">
            <span className="nl-e-dot" aria-hidden="true" />
            <span className="nl-e-state-text">영업시간을 확인해 주세요</span>
          </p>
        )}
        <dl className="nl-e-hours">
          {hours.map((h) => {
            const isToday = todayLine?.label === h.label;
            return (
              <div key={h.label} className={isToday ? 'nl-e-hours-row is-today' : 'nl-e-hours-row'}>
                <dt>
                  {h.label}
                  {isToday && <span className="nl-e-hours-today">오늘</span>}
                </dt>
                <dd>{h.value.replace('-', ' ~ ')}</dd>
              </div>
            );
          })}
        </dl>
      </div>

      <div className="nl-e-panel nl-e-ahead">
        <h3 className="nl-e-panel-label">다가오는 일정</h3>
        {upcoming.length === 0 ? (
          <p className="nl-e-empty">예정된 휴무나 행사가 없습니다.</p>
        ) : (
          <ul className="nl-e-ahead-list">
            {upcoming.map((n) => (
              <li key={n.slug}>
                <Link href={nlEHref(n.slug)} className="nl-e-ahead-row" data-topic={n.topic}>
                  <span className="nl-e-dday" data-today={now && n.period!.start === now.day ? 'true' : undefined}>
                    {now ? dday(now.day, n.period!.start) : formatDay(n.period!.start).replace(/\(.+\)/, '')}
                  </span>
                  <span className="nl-e-ahead-text">
                    <span className="nl-e-ahead-meta">
                      <span className="nl-e-topic" data-topic={n.topic}>{TOPIC_LABEL[n.topic]}</span>
                      <time dateTime={n.period!.start}>{formatDay(n.period!.start)}</time>
                    </span>
                    <span className="nl-e-ahead-title">{n.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
