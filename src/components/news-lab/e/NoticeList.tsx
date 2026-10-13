'use client';

import Link from 'next/link';
import { formatDate, TOPIC_LABEL } from '@/lib/post-utils';
import { nlEHref, type NlENotice } from './shared';
import { useSeoulNow } from './useSeoulNow';

function Headline({ n, lead }: { n: NlENotice; lead?: boolean }) {
  return (
    <Link href={nlEHref(n.slug)} className={lead ? 'nl-e-row nl-e-row--lead' : 'nl-e-row'}>
      <span className="nl-e-row-meta">
        {lead && <span className="nl-e-pin">고정 공지</span>}
        <span className="nl-e-topic" data-topic={n.topic}>{TOPIC_LABEL[n.topic]}</span>
        <time dateTime={n.date}>{formatDate(n.date)}</time>
      </span>
      <span className="nl-e-row-title">{n.title}</span>
      <span className="nl-e-row-summary">{n.summary}</span>
    </Link>
  );
}

/*
 * The notices as a calm headline list: the pinned notice first and larger, then "이번 달" and
 * "지난 소식". The month is the visitor's current month in Seoul once hydrated; before that it is
 * the newest post's month, so the prerendered page already reads sensibly.
 */
export function NoticeList({ notices }: { notices: NlENotice[] }) {
  const now = useSeoulNow();
  const month = now?.month ?? notices[0]?.date.slice(0, 7) ?? '';
  const pinned = notices.find((n) => n.pinned);
  const rest = notices.filter((n) => n !== pinned);
  const thisMonth = rest.filter((n) => n.date.slice(0, 7) === month);
  const past = rest.filter((n) => n.date.slice(0, 7) !== month);
  const [, mm] = month.split('-').map(Number);

  return (
    <div className="nl-e-notices">
      {pinned && (
        <section aria-label="고정 공지" className="nl-e-group nl-e-group--pinned">
          <Headline n={pinned} lead />
        </section>
      )}
      {thisMonth.length > 0 && (
        <section aria-labelledby="nl-e-g-now" className="nl-e-group">
          <h2 id="nl-e-g-now" className="nl-e-group-title">
            이번 달<span className="nl-e-group-sub">{mm ? `${mm}월` : ''} · {thisMonth.length}건</span>
          </h2>
          <ul className="nl-e-rows">
            {thisMonth.map((n) => (
              <li key={n.slug}><Headline n={n} /></li>
            ))}
          </ul>
        </section>
      )}
      {past.length > 0 && (
        <section aria-labelledby="nl-e-g-past" className="nl-e-group">
          <h2 id="nl-e-g-past" className="nl-e-group-title">
            지난 소식<span className="nl-e-group-sub">{past.length}건</span>
          </h2>
          <ul className="nl-e-rows">
            {past.map((n) => (
              <li key={n.slug}><Headline n={n} /></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
