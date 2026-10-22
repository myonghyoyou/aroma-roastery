import type { NoteFamily } from '@/components/news-post-lab/notes';
import './cupnote.css';

/*
 * A cup note, drawn with the brand's own mark. The aroma symbol is four leaves, green, yellow, orange
 * and red; a note's family lights its leaf and leaves the other three as outlines, so the tag says
 * "this part of the cup" in the logo's own shapes. The note's place on the SCA flavour wheel shows on
 * hover or keyboard focus, and is read out with the word.
 */

// the four leaves of public/assets/logo/aroma-symbol.svg, one path each
const LEAVES: { family: NoteFamily; d: string }[] = [
  { family: 'yellow', d: 'M257.576 269.676 315.66 184.595C365.022 194.261 402.588 243.485 402.588 302.755 402.588 308.988 402.646 313.32 402.09 318.37 369.444 318.342 313.241 311.232 257.576 269.676' },
  { family: 'green', d: 'M193.167 302.755C193.167 236.546 240.047 182.874 297.878 182.874 329.436 182.874 357.737 198.861 376.935 224.144 362.784 238.038 343.765 254.703 318.476 273.582 275.19 305.895 227.832 316.903 194.282 320.306 193.548 314.577 193.167 308.717 193.167 302.755' },
  { family: 'orange', d: 'M249.764 217.698 270.769 186.93C279.415 184.284 288.503 182.874 297.878 182.874 344.438 182.874 383.901 217.669 397.514 265.783 365.966 265.376 304.593 258.629 249.764 217.698' },
  { family: 'red', d: 'M297.878 182.874C315.54 182.874 332.177 187.878 346.773 196.719 338.352 203.739 328.95 211.18 318.476 219 276.931 250.014 231.626 261.402 198.386 265.276 212.131 217.423 251.48 182.874 297.878 182.874' },
];

/** The symbol with one leaf lit (or all four, for a key). */
export function LeafMark({ lit, className = 'cnt-mark' }: { lit: NoteFamily | 'all'; className?: string }) {
  return (
    <svg className={className} viewBox="190 68 216 144" aria-hidden="true" focusable="false">
      {LEAVES.map((l) => (
        <path
          key={l.family}
          d={l.d}
          transform="matrix(1,0,0,-1,0,391)"
          className={lit === 'all' || lit === l.family ? `cnt-leaf is-on is-${l.family}` : 'cnt-leaf'}
        />
      ))}
    </svg>
  );
}

export function CupNoteTag({ word, family, place }: { word: string; family: NoteFamily; place: string }) {
  return (
    <span className="cnt" data-family={family} tabIndex={0}>
      <LeafMark lit={family} />
      <span className="cnt-word">{word}</span>
      <span className="cnt-sr">, SCA 플레이버 휠 {place}</span>
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
