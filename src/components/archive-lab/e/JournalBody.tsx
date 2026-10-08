import type { Block, Photo } from '@/lib/content';

/*
 * The long form body. Text keeps to a reading column; every gallery is cut into rows, and each row
 * has a narrow side column that holds its captions (sticky while the row is on screen). On a phone
 * the side column goes away and each photo shows its own caption underneath.
 */

type NumberedPhoto = { photo: Photo; n: number };

const pad = (n: number) => String(n).padStart(2, '0');

/** A grid gallery goes in rows of three, ending with rows of two so no row holds a single photo. */
function chunk(list: NumberedPhoto[]): NumberedPhoto[][] {
  const rows: NumberedPhoto[][] = [];
  let rest = list;
  while (rest.length) {
    const take = rest.length === 4 || rest.length === 2 ? 2 : rest.length === 1 ? 1 : 3;
    rows.push(rest.slice(0, take));
    rest = rest.slice(take);
  }
  return rows;
}

function PhotoRow({ row, layout }: { row: NumberedPhoto[]; layout: 'pair' | 'grid' | 'full' }) {
  const single = row.length === 1;
  return (
    <div className={`lab-e-prow lab-e-prow--${row.length} ${layout === 'full' ? 'is-full' : ''}`}>
      <div className="lab-e-side" aria-hidden="true">
        <ol className="lab-e-side-list">
          {row.map(({ photo, n }, i) => (
            <li key={n}>
              <span className="lab-e-num">{pad(n)}</span>
              {!single && <span className="lab-e-pos">{row.length === 2 ? (i === 0 ? '왼쪽' : '오른쪽') : ['왼쪽', '가운데', '오른쪽'][i]}</span>}
              <span className="lab-e-side-text">{photo.caption ?? photo.alt}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="lab-e-photos">
        {row.map(({ photo, n }) => (
          <figure
            key={n}
            className="lab-e-photo"
            style={single ? { ['--lab-e-ratio' as string]: `${photo.w / photo.h}` } : { flexGrow: photo.w / photo.h }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt={photo.alt} width={photo.w} height={photo.h} loading="lazy" decoding="async" />
            <figcaption>
              <span className="lab-e-num">{pad(n)}</span>
              <span className="lab-e-cap-text">{photo.caption ?? photo.alt}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

type Piece =
  | { kind: 'block'; block: Exclude<Block, { type: 'gallery' } | { type: 'media' }> }
  | { kind: 'photos'; layout: 'pair' | 'grid' | 'full'; rows: NumberedPhoto[][] };

/** Numbers every photo in reading order (the cover is 01) and cuts galleries into rows. */
function toPieces(blocks: Block[], startAt: number): Piece[] {
  let n = startAt;
  const pieces: Piece[] = [];
  for (const b of blocks) {
    if (b.type === 'gallery') {
      const numbered = b.photos.map((photo) => ({ photo, n: n++ }));
      pieces.push({ kind: 'photos', layout: b.layout, rows: b.layout === 'full' ? numbered.map((p) => [p]) : chunk(numbered) });
    } else if (b.type === 'media') {
      if (b.media.kind !== 'image') continue; // no video in this concept
      const photo: Photo = { ...b.media, kind: 'image', w: 1600, h: 1200, caption: b.caption };
      pieces.push({ kind: 'photos', layout: 'full', rows: [[{ photo, n: n++ }]] });
    } else {
      pieces.push({ kind: 'block', block: b });
    }
  }
  return pieces;
}

export function JournalBody({ blocks, startAt }: { blocks: Block[]; startAt: number }) {
  const pieces = toPieces(blocks, startAt);
  return (
    <div className="lab-e-body">
      {pieces.map((piece, i) => {
        if (piece.kind === 'photos') {
          return (
            <div key={i} className={`lab-e-gallery lab-e-gallery--${piece.layout}`}>
              {piece.rows.map((row) => <PhotoRow key={row[0].n} row={row} layout={piece.layout} />)}
            </div>
          );
        }
        const b = piece.block;
        switch (b.type) {
          case 'paragraph':
            return <p key={i} className="lab-e-text lab-e-p">{b.text}</p>;
          case 'heading':
            return <h2 key={i} className="lab-e-text lab-e-h2">{b.text}</h2>;
          case 'list':
            return (
              <ul key={i} className="lab-e-text lab-e-ul">
                {b.items.map((t) => <li key={t}>{t}</li>)}
              </ul>
            );
          case 'quote':
            return (
              <blockquote key={i} className="lab-e-quote">
                <p>{b.text}</p>
              </blockquote>
            );
        }
      })}
    </div>
  );
}
