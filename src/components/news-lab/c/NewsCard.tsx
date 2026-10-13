import Link from 'next/link';
import { TOPIC_LABEL, formatDate } from '@/lib/post-utils';
import { cardHref, type NewsCardData } from './types';

/*
 * One notice, one card. With a still it shows the photo; without one it shows a soft field tinted
 * with the topic colour and the title set large on it. The whole card is a single link, named by
 * its title and its meta line.
 */
export function NewsCard({
  card,
  idPrefix,
  wide = false,
  eager = false,
  headingLevel = 2,
}: {
  card: NewsCardData;
  idPrefix: string;
  wide?: boolean;
  eager?: boolean;
  headingLevel?: 2 | 3;
}) {
  const Title = headingLevel === 2 ? 'h2' : 'h3';
  const titleId = `${idPrefix}-${card.slug}-t`;
  const metaId = `${idPrefix}-${card.slug}-m`;
  const isField = !card.cover;

  return (
    <Link
      href={cardHref(card.slug)}
      className={`nl-c-card${wide ? ' nl-c-card--wide' : ''}${isField ? ' nl-c-card--field' : ''}`}
      data-topic={card.topic}
      aria-labelledby={`${titleId} ${metaId}`}
    >
      <span className="nl-c-visual">
        {card.cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- plain still, sized by the frame
          <img
            className="nl-c-img"
            src={card.cover.src}
            alt=""
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <span className="nl-c-field" aria-hidden="true" />
        )}
        {isField && (
          <Title className="nl-c-field-title" id={titleId}>
            {card.title}
          </Title>
        )}
      </span>
      <span className="nl-c-text">
        <span className="nl-c-meta" id={metaId}>
          {card.pinned && <span className="nl-c-pin">고정</span>}
          <span className="nl-c-topic">{TOPIC_LABEL[card.topic]}</span>
          <time dateTime={card.date}>{formatDate(card.date)}</time>
        </span>
        {!isField && (
          <Title className="nl-c-title" id={titleId}>
            {card.title}
          </Title>
        )}
        <span className="nl-c-summary">{card.summary}</span>
      </span>
    </Link>
  );
}
