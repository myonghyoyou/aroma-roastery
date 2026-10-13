'use client';

import Link from 'next/link';
import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import type { NewsTopic } from '@/lib/content';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import { PER_PAGE, TOPICS, rowHref, type BoardRow } from './rows';

type TopicFilter = 'all' | NewsTopic;

/** wraps the first match of the query in <mark>, so a search shows why a row is listed */
function highlight(text: string, q: string): ReactNode {
  if (!q) return text;
  const at = text.toLowerCase().indexOf(q);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark className="nl-a-mark">{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  );
}

function Row({ row, q }: { row: BoardRow; q: string }) {
  return (
    <li className={row.pinned ? 'nl-a-row nl-a-row--pinned' : 'nl-a-row'}>
      <Link href={rowHref(row.slug)} className="nl-a-row-link">
        <span className="nl-a-col-no">
          {row.pinned ? <span className="nl-a-pin">고정</span> : row.no}
        </span>
        <span className="nl-a-col-topic">
          {row.topic && (
            <span className="nl-a-topic" data-topic={row.topic}>
              {TOPIC_LABEL[row.topic]}
            </span>
          )}
        </span>
        <span className="nl-a-col-title">
          <span className="nl-a-row-title">{highlight(row.title, q)}</span>
          {q && !row.title.toLowerCase().includes(q) && (
            <span className="nl-a-row-hit">{highlight(row.summary, q)}</span>
          )}
        </span>
        <time className="nl-a-col-date" dateTime={row.date}>
          {formatDate(row.date)}
        </time>
      </Link>
    </li>
  );
}

/*
 * The board itself: topic tabs, a search box and numbered pages. Pinned notices that match the
 * current tab and search sit above the numbered rows on every page.
 */
export function NoticeBoard({ rows }: { rows: BoardRow[] }) {
  const [topic, setTopic] = useState<TopicFilter>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const boardRef = useRef<HTMLDivElement>(null);
  const searchId = useId();
  const q = query.trim().toLowerCase();

  const searched = useMemo(
    () => (q ? rows.filter((r) => `${r.title} ${r.summary}`.toLowerCase().includes(q)) : rows),
    [rows, q],
  );
  const countOf = (t: TopicFilter) => (t === 'all' ? searched.length : searched.filter((r) => r.topic === t).length);
  const filtered = topic === 'all' ? searched : searched.filter((r) => r.topic === topic);
  const pinned = filtered.filter((r) => r.pinned);
  const regular = filtered.filter((r) => !r.pinned);
  const pages = Math.max(1, Math.ceil(regular.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = regular.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const pickTopic = (t: TopicFilter) => {
    setTopic(t);
    setPage(1);
  };
  const changeQuery = (v: string) => {
    setQuery(v);
    setPage(1);
  };
  const resetAll = () => {
    setQuery('');
    setTopic('all');
    setPage(1);
  };
  const goTo = (p: number) => {
    setPage(p);
    // bring the reader back to the top of the board, with focus on it for keyboard and screen readers
    requestAnimationFrame(() => boardRef.current?.focus());
  };

  const scope = topic === 'all' ? '전체' : TOPIC_LABEL[topic];
  const status = q ? `'${query.trim()}' 검색 결과 ${scope} ${filtered.length}건` : `${scope} ${filtered.length}건`;

  return (
    <div className="nl-a-board-wrap">
      <div className="nl-a-tools">
        <div className="nl-a-tabs" role="group" aria-label="분류">
          {(['all', ...TOPICS] as TopicFilter[]).map((t) => {
            const n = countOf(t);
            const on = topic === t;
            return (
              <button
                key={t}
                type="button"
                className="nl-a-tab"
                data-topic={t === 'all' ? undefined : t}
                aria-pressed={on}
                disabled={!on && n === 0}
                onClick={() => pickTopic(t)}
              >
                <span>{t === 'all' ? '전체' : TOPIC_LABEL[t]}</span>
                <span className="nl-a-tab-n">{n}</span>
              </button>
            );
          })}
        </div>
        <form className="nl-a-search" role="search" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor={searchId} className="nl-a-sr">
            소식 검색
          </label>
          <input
            id={searchId}
            type="search"
            className="nl-a-search-input"
            placeholder="제목이나 내용으로 찾기"
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button type="button" className="nl-a-search-clear" onClick={() => changeQuery('')}>
              지우기
            </button>
          )}
        </form>
      </div>

      <div className="nl-a-board" ref={boardRef} tabIndex={-1} aria-labelledby={`${searchId}-status`}>
        <p className="nl-a-status" id={`${searchId}-status`} aria-live="polite">
          <span>{status}</span>
          {regular.length > PER_PAGE && (
            <span className="nl-a-status-page">
              {current} / {pages}쪽
            </span>
          )}
        </p>

        <div className="nl-a-head" aria-hidden="true">
          <span className="nl-a-col-no">번호</span>
          <span className="nl-a-col-topic">분류</span>
          <span className="nl-a-col-title">제목</span>
          <span className="nl-a-col-date">날짜</span>
        </div>

        {filtered.length === 0 ? (
          <div className="nl-a-empty">
            <p className="nl-a-empty-title">찾는 소식이 없습니다.</p>
            <p className="nl-a-empty-text">다른 낱말로 찾아보거나 분류를 전체로 바꿔 보세요.</p>
            <button type="button" className="nl-a-btn" onClick={resetAll}>
              전체 소식 보기
            </button>
          </div>
        ) : (
          <ul className="nl-a-rows">
            {pinned.map((r) => (
              <Row key={r.slug} row={r} q={q} />
            ))}
            {shown.map((r) => (
              <Row key={r.slug} row={r} q={q} />
            ))}
          </ul>
        )}
      </div>

      {pages > 1 && (
        <nav className="nl-a-pager" aria-label="쪽 이동">
          <button type="button" className="nl-a-pager-step" onClick={() => goTo(current - 1)} disabled={current === 1}>
            이전
          </button>
          <ol className="nl-a-pager-list">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <li key={p}>
                <button
                  type="button"
                  className="nl-a-pager-num"
                  aria-label={`${p}쪽`}
                  aria-current={p === current ? 'page' : undefined}
                  onClick={() => goTo(p)}
                >
                  {p}
                </button>
              </li>
            ))}
          </ol>
          <button type="button" className="nl-a-pager-step" onClick={() => goTo(current + 1)} disabled={current === pages}>
            다음
          </button>
        </nav>
      )}
    </div>
  );
}
