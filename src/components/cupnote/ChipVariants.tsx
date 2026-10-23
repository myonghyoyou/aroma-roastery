import type { CSSProperties } from 'react';
import { FAMILY_COLOR, FAMILY_LABEL, FAMILY_ORDER, type CupNote } from '@/components/cupnote/notes';
import './chips.css';

/*
 * Five ways to show a coffee's cup notes, drawn for the chip study (/news-post-lab/notes/chips).
 * The current tag (a tinted pill, an outline, a logo icon and a hover bubble) read as a generic UI
 * chip; each of these takes its form from something real instead: the flavour wheel's own segments,
 * a roaster's prose line, a printed bag label, a paint swatch card, the wheel as a map.
 */

const lum = (hex: string) => {
  const lin = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
};
/** text that reads on a block of this colour */
const inkOn = (color: string) => (lum(color) > 0.3 ? 'var(--char)' : 'var(--milk)');
const toneVars = (color: string) => ({ '--c': color, '--ink': inkOn(color) }) as CSSProperties;

/** 1. The wheel's outer ring: solid square blocks in the wheel's colour, set edge to edge like its segments. */
export function WheelSegments({ notes }: { notes: CupNote[] }) {
  return (
    <ul className="chv-seg" aria-label="컵 노트">
      {notes.map((n) => (
        <li key={n.word} style={toneVars(n.color)}>
          <span className="chv-seg-word">{n.word}</span>
          <span className="chv-seg-place">{FAMILY_LABEL[n.family]}</span>
        </li>
      ))}
    </ul>
  );
}

/** 2. A roaster's line (Coffee Collective, Tim Wendelboe): the notes as one sentence, each underlined in its colour. */
export function ProseLine({ notes }: { notes: CupNote[] }) {
  return (
    <p className="chv-prose">
      {notes.map((n, i) => (
        <span key={n.word}>
          <span className="chv-prose-word" style={toneVars(n.color)} title={n.place}>{n.word}</span>
          {i < notes.length - 1 ? ', ' : ''}
        </span>
      ))}
    </p>
  );
}

/** 3. A bag label: a small heading, the notes set with slashes, and one bar split into the notes' colours. */
export function BagLabel({ notes }: { notes: CupNote[] }) {
  return (
    <div className="chv-label">
      <p className="chv-label-head">컵 노트</p>
      <p className="chv-label-words">{notes.map((n) => n.word).join(' / ')}</p>
      <p className="chv-label-bar" aria-hidden="true">
        {notes.map((n) => <span key={n.word} style={toneVars(n.color)} />)}
      </p>
    </div>
  );
}

/** 4. Paint swatch cards: a colour block over the word and its place, square, in a row. */
export function SwatchCards({ notes }: { notes: CupNote[] }) {
  return (
    <ul className="chv-swatch" aria-label="컵 노트">
      {notes.map((n) => (
        <li key={n.word}>
          <span className="chv-swatch-chip" style={toneVars(n.color)} aria-hidden="true" />
          <span className="chv-swatch-word">{n.word}</span>
          <span className="chv-swatch-place">{FAMILY_LABEL[n.family]}</span>
        </li>
      ))}
    </ul>
  );
}

/** 5. The wheel as a map: a ring of the eleven colour groups, the ones this coffee touches lit, the notes beside it. */
export function WheelMap({ notes }: { notes: CupNote[] }) {
  const lit = new Set(notes.map((n) => n.family));
  const r = 42, w = 14, c = 2 * Math.PI * r;
  const step = c / FAMILY_ORDER.length;
  return (
    <div className="chv-map">
      <svg className="chv-map-ring" viewBox="0 0 100 100" aria-hidden="true">
        {FAMILY_ORDER.map((f, i) => (
          <circle
            key={f}
            cx="50" cy="50" r={r} fill="none"
            stroke={FAMILY_COLOR[f]} strokeWidth={w}
            strokeDasharray={`${step - 1.2} ${c - step + 1.2}`}
            strokeDashoffset={-i * step}
            opacity={lit.has(f) ? 1 : 0.14}
            transform="rotate(-90 50 50)"
          />
        ))}
      </svg>
      <ul className="chv-map-list" aria-label="컵 노트">
        {notes.map((n) => (
          <li key={n.word}>
            <span className="chv-map-dot" style={toneVars(n.color)} aria-hidden="true" />
            <span className="chv-map-word">{n.word}</span>
            <span className="chv-map-place">{FAMILY_LABEL[n.family]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
