import type { CSSProperties } from 'react';
import { FAMILY_COLOR, type NoteFamily } from '@/components/cupnote/notes';
import './cupnote.css';

/*
 * A cup note: the word on a wash of its own colour from the flavour wheel (its outer-ring segment, see
 * notes.ts). Text and colour only; the logo mark that led the tag was dropped on 2026-10-23. The
 * wheel's darkest colours (초콜렛, 블랙베리, 건포도 ...) would vanish on the roast background, so those
 * tags take a stronger wash and a milk outline. The note's place on the wheel shows on hover or
 * keyboard focus, and is read out with the word.
 */

/** "#E8604C" -> "232, 96, 76", for rgba() in the stylesheet */
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ');

/** a colour, or a colour group's colour, as the --tone variable */
export const toneStyle = (c: NoteFamily | string) => ({ '--tone': rgb(c.startsWith('#') ? c : FAMILY_COLOR[c as NoteFamily]) }) as CSSProperties;

/** True for a colour too dark to show on the roast background (relative luminance under 0.06). */
export function isDark(color: string): boolean {
  const lin = [1, 3, 5].map((i) => {
    const c = parseInt(color.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2] < 0.06;
}

export function CupNoteTag({ word, color, place }: { word: string; color: string; place: string }) {
  return (
    <span className={isDark(color) ? 'cnt is-dark' : 'cnt'} style={toneStyle(color)} tabIndex={0}>
      <span className="cnt-word">{word}</span>
      <span className="cnt-sr">, 플레이버 휠 {place}</span>
      <span className="cnt-tip" aria-hidden="true">{place}</span>
    </span>
  );
}

/** A row of tags, as a list. */
export function CupNoteTags({ notes, label = '컵 노트' }: { notes: { word: string; color: string; place: string }[]; label?: string }) {
  return (
    <ul className="cnt-list" aria-label={label}>
      {notes.map((n) => (
        <li key={n.word}><CupNoteTag word={n.word} color={n.color} place={n.place} /></li>
      ))}
    </ul>
  );
}
