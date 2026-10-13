import type { Block } from '@/lib/content';

/*
 * Body blocks for concept D. No hooks and no content.ts runtime import, so it renders on the
 * server and its output can be handed to the client disclosure as children.
 * 'compact' is the inline reading inside the timeline: text blocks only, headings one level down.
 */
export function Blocks({ blocks, compact = false }: { blocks: Block[]; compact?: boolean }) {
  const Heading = compact ? 'h4' : 'h2';
  return (
    <div className={`nl-d-prose${compact ? ' nl-d-prose--compact' : ''}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return <p key={i}>{block.text}</p>;
          case 'heading':
            return <Heading key={i}>{block.text}</Heading>;
          case 'quote':
            return (
              <blockquote key={i}>
                <p>{block.text}</p>
              </blockquote>
            );
          case 'list':
            return (
              <ul key={i}>
                {block.items.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            );
          case 'media':
            // stills only: the lab never plays video, and the compact reading stays text
            if (compact || block.media.kind !== 'image') return null;
            return (
              <figure key={i} className="nl-d-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.media.src} alt={block.media.alt} loading="lazy" decoding="async" />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            );
          case 'gallery':
            if (compact) return null;
            return (
              <div key={i} className={`nl-d-gallery nl-d-gallery--${block.layout}`}>
                {block.photos.map((ph) => (
                  <figure key={ph.src} className="nl-d-figure">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ph.src} alt={ph.alt} width={ph.w} height={ph.h} loading="lazy" decoding="async" />
                    {ph.caption && <figcaption>{ph.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
