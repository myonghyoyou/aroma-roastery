import type { CSSProperties } from 'react';
import { FAMILY_COLOR, type NoteFamily } from '@/components/news-post-lab/notes';
import './cupnote.css';

/*
 * A cup note, drawn with the brand's own mark: the aroma symbol's four leaves, all four in the
 * note's colour from the flavour wheel (its 대분류, or for fruit its 2차 분류), each leaf a step
 * lighter, so the logo's shape carries the wheel's colour. The wheel's darkest colours (단맛, 그 밖에,
 * 포도) would vanish on the roast background, so those tags get a milk outline on the leaves and the
 * pill. The note's place on the wheel shows on hover or keyboard focus, and is read out with the word.
 */

// the four leaves of public/assets/logo/aroma-symbol.svg, and how strongly each takes the colour
const LEAVES: { d: string; alpha: number }[] = [
  { alpha: 0.55, d: 'M257.576 269.676 315.66 184.595C365.022 194.261 402.588 243.485 402.588 302.755 402.588 308.988 402.646 313.32 402.09 318.37 369.444 318.342 313.241 311.232 257.576 269.676' },
  { alpha: 1, d: 'M193.167 302.755C193.167 236.546 240.047 182.874 297.878 182.874 329.436 182.874 357.737 198.861 376.935 224.144 362.784 238.038 343.765 254.703 318.476 273.582 275.19 305.895 227.832 316.903 194.282 320.306 193.548 314.577 193.167 308.717 193.167 302.755' },
  { alpha: 0.75, d: 'M249.764 217.698 270.769 186.93C279.415 184.284 288.503 182.874 297.878 182.874 344.438 182.874 383.901 217.669 397.514 265.783 365.966 265.376 304.593 258.629 249.764 217.698' },
  { alpha: 0.9, d: 'M297.878 182.874C315.54 182.874 332.177 187.878 346.773 196.719 338.352 203.739 328.95 211.18 318.476 219 276.931 250.014 231.626 261.402 198.386 265.276 212.131 217.423 251.48 182.874 297.878 182.874' },
];

/** "#E8604C" -> "232, 96, 76", for rgba() in the stylesheet */
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ');

export const toneStyle = (family: NoteFamily) => ({ '--tone': rgb(FAMILY_COLOR[family]) }) as CSSProperties;

/** True for a colour too dark to show on the roast background (relative luminance under 0.06). */
export function isDark(family: NoteFamily): boolean {
  const lin = [1, 3, 5].map((i) => {
    const c = parseInt(FAMILY_COLOR[family].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2] < 0.06;
}

/** The symbol in one note colour. */
export function LeafMark({ family, className = 'cnt-mark' }: { family: NoteFamily; className?: string }) {
  return (
    <svg className={className} viewBox="190 68 216 144" aria-hidden="true" focusable="false">
      {LEAVES.map((l, i) => (
        <path
          key={i}
          d={l.d}
          transform="matrix(1,0,0,-1,0,391)"
          fill={FAMILY_COLOR[family]}
          fillOpacity={l.alpha}
          {...(isDark(family) ? { stroke: 'rgba(251, 243, 232, .6)', strokeWidth: 6 } : {})}
        />
      ))}
    </svg>
  );
}

export function CupNoteTag({ word, family, place }: { word: string; family: NoteFamily; place: string }) {
  return (
    <span className={isDark(family) ? 'cnt is-dark' : 'cnt'} style={toneStyle(family)} tabIndex={0}>
      <LeafMark family={family} />
      <span className="cnt-word">{word}</span>
      <span className="cnt-sr">, 플레이버 휠 {place}</span>
      <span className="cnt-tip" aria-hidden="true">{place}</span>
    </span>
  );
}

/** A row of tags, as a list. */
export function CupNoteTags({ notes, label = '컵 노트' }: { notes: { word: string; family: NoteFamily; place: string }[]; label?: string }) {
  return (
    <ul className="cnt-list" aria-label={label}>
      {notes.map((n) => (
        <li key={n.word}><CupNoteTag {...n} /></li>
      ))}
    </ul>
  );
}
