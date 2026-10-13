'use client';

import { useMemo, useState } from 'react';
import type { NewsTopic } from '@/lib/content';
import { TOPIC_LABEL } from '@/lib/post-utils';
import { NewsCard } from './NewsCard';
import { TOPIC_ORDER, type NewsCardData } from './types';

type Filter = 'all' | NewsTopic;

/* Topic chips over the card grid. The first card of whatever is shown spans two columns. */
export function CardFeed({ cards }: { cards: NewsCardData[] }) {
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const c = Object.fromEntries(TOPIC_ORDER.map((t) => [t, 0])) as Record<NewsTopic, number>;
    for (const card of cards) c[card.topic] += 1;
    return c;
  }, [cards]);

  const shown = filter === 'all' ? cards : cards.filter((c) => c.topic === filter);
  const chips: { key: Filter; label: string; n: number }[] = [
    { key: 'all', label: '전체', n: cards.length },
    ...TOPIC_ORDER.map((t) => ({ key: t, label: TOPIC_LABEL[t], n: counts[t] })),
  ];

  return (
    <div className="nws-feed">
      <div className="nws-controls">
        <div className="nws-chips" role="group" aria-label="분류로 보기">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="nws-chip"
              data-topic={chip.key}
              aria-pressed={filter === chip.key}
              onClick={() => setFilter(chip.key)}
            >
              <span>{chip.label}</span>
              <span className="nws-chip-n">{chip.n}</span>
            </button>
          ))}
        </div>
        <p className="nws-count" aria-live="polite">
          {filter === 'all' ? '전체' : TOPIC_LABEL[filter]} 소식 {shown.length}건
        </p>
      </div>

      {shown.length > 0 ? (
        <ul className="nws-grid">
          {shown.map((card, i) => (
            <li key={card.slug} className={i === 0 ? 'nws-cell nws-cell--wide' : 'nws-cell'}>
              <NewsCard card={card} idPrefix="nws-feed" wide={i === 0} eager={i < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="nws-empty">
          <p>{filter === 'all' ? '아직 올라온 소식이 없습니다.' : `${TOPIC_LABEL[filter]} 소식이 아직 없습니다.`}</p>
          {filter !== 'all' && (
            <button type="button" className="nws-chip" onClick={() => setFilter('all')}>
              전체 소식 보기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
