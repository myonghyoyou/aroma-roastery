import { NewsCard } from './NewsCard';
import type { NewsCardData } from './types';

/* Every notice on one card grid, newest first, with no sorting into kinds; every card has the same shape, photo over text. */
export function CardFeed({ cards }: { cards: NewsCardData[] }) {
  if (cards.length === 0) {
    return <div className="nws-empty"><p>아직 올라온 소식이 없습니다.</p></div>;
  }
  return (
    <ul className="nws-grid">
      {cards.map((card, i) => (
        <li key={card.slug} className="nws-cell">
          <NewsCard card={card} idPrefix="nws-feed" eager={i < 3} />
        </li>
      ))}
    </ul>
  );
}
