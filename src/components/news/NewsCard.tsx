import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/post-utils';
import { cardHref, type NewsCardData } from './types';

/*
 * One notice, one card. With a still it shows the photo; without one it shows a soft field tinted
 * with the topic colour and the title set large on it. The whole card is a single link, named by
 * its title and its meta line.
 */
export function NewsCard({
  card,
  idPrefix,
  eager = false,
  headingLevel = 2,
}: {
  card: NewsCardData;
  idPrefix: string;
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
      className={`nws-card${isField ? ' nws-card--field' : ''}`}
      data-topic={card.topic}
      aria-labelledby={`${titleId} ${metaId}`}
    >
      <span className="nws-visual">
        {card.cover ? (
          // a still filling the frame, at the card's width rather than the original's
          <Image
            className="nws-img"
            src={card.cover.src}
            alt=""
            fill
            sizes="(max-width: 599px) 100vw, (max-width: 999px) 50vw, 34vw"
            loading={eager ? 'eager' : 'lazy'}
          />
        ) : (
          <span className="nws-field" aria-hidden="true" />
        )}
        {isField && (
          <Title className="nws-field-title" id={titleId}>
            {card.title}
          </Title>
        )}
      </span>
      <span className="nws-text">
        <span className="nws-meta" id={metaId}>
          {card.pinned && <span className="nws-pin">고정</span>}
          <time dateTime={card.date}>{formatDate(card.date)}</time>
        </span>
        {!isField && (
          <Title className="nws-title" id={titleId}>
            {card.title}
          </Title>
        )}
        <span className="nws-summary">{card.summary}</span>
      </span>
    </Link>
  );
}
