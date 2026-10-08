import type { Block, Photo } from '@/lib/content';

/* The body of a post for concept B, block by block in the order the post gives them. */

function Img({ photo, className }: { photo: Photo; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- plain img by brief
    <img className={className} src={photo.src} alt={photo.alt} width={photo.w} height={photo.h} loading="lazy" />
  );
}

function Gallery({ layout, photos }: { layout: 'pair' | 'grid' | 'full'; photos: Photo[] }) {
  const captions = photos.filter((p) => p.caption).map((p) => p.caption);
  const caption = captions.length > 0 ? <figcaption className="lab-b-caption">{captions.join(' / ')}</figcaption> : null;

  if (layout === 'full') {
    return (
      <figure className="lab-b-gallery is-full">
        {photos.map((ph) => (
          <span key={ph.src} className="lab-b-full-ph" style={{ ['--r' as string]: ph.w / ph.h }}>
            <Img photo={ph} className="lab-b-fill" />
          </span>
        ))}
        {caption}
      </figure>
    );
  }

  if (layout === 'pair') {
    // one shared height: each photo grows by its own ratio, so both keep their natural shape
    return (
      <figure className="lab-b-gallery is-pair">
        <div className="lab-b-pair">
          {photos.map((ph) => (
            <span key={ph.src} className="lab-b-pair-ph" style={{ flexGrow: ph.w / ph.h, aspectRatio: `${ph.w} / ${ph.h}` }}>
              <Img photo={ph} className="lab-b-fill" />
            </span>
          ))}
        </div>
        {caption}
      </figure>
    );
  }

  return (
    <figure className="lab-b-gallery is-grid">
      <div className="lab-b-grid">
        {photos.map((ph) => (
          <span key={ph.src} className="lab-b-grid-ph">
            <Img photo={ph} className="lab-b-fill" />
          </span>
        ))}
      </div>
      {caption}
    </figure>
  );
}

function BodyBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="lab-b-p">{block.text}</p>;
    case 'heading':
      return <h2 className="lab-b-h">{block.text}</h2>;
    case 'quote':
      return <blockquote className="lab-b-quote">{block.text}</blockquote>;
    case 'list':
      return (
        <ul className="lab-b-list">
          {block.items.map((t) => <li key={t}>{t}</li>)}
        </ul>
      );
    case 'gallery':
      return <Gallery layout={block.layout} photos={block.photos} />;
    case 'media': {
      // photos only: a clip shows its poster still
      const src = block.media.kind === 'image' ? block.media.src : block.media.poster;
      if (!src) return null;
      return (
        <figure className="lab-b-gallery is-media">
          <span className="lab-b-media-ph">
            {/* eslint-disable-next-line @next/next/no-img-element -- plain img by brief */}
            <img className="lab-b-fill" src={src} alt={block.media.alt} loading="lazy" />
          </span>
          {block.caption && <figcaption className="lab-b-caption">{block.caption}</figcaption>}
        </figure>
      );
    }
  }
}

export function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="lab-b-body">
      {blocks.map((b, i) => <BodyBlock key={i} block={b} />)}
    </div>
  );
}
