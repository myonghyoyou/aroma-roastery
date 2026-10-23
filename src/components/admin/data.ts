import { unknownFlavours } from '@/components/cupnote/notes';
import type { NoteOverrides } from '@/lib/cupnotes-store';
import type { Block, Post } from '@/lib/content';

/* What the admin pages read from the posts: each caption as one string, and the flavour words the table does not know. */

export const captionOf = (blocks: Block[]) => blocks.map((b) => ('text' in b ? b.text : 'items' in b ? b.items.join(' ') : '')).join(' ');

/** The sentence a word stands in, shortened around it. */
function contextOf(caption: string, word: string): string {
  const at = caption.indexOf(word);
  if (at < 0) return '';
  const from = Math.max(0, at - 24);
  return `${from > 0 ? '…' : ''}${caption.slice(from, at + word.length + 24).replace(/\s+/g, ' ').trim()}…`;
}

export type NewWord = { word: string; count: number; context: string; date: string };

/** Words the captions use as flavours that are neither in the table nor placed or ignored, most used first. */
export function newWords(posts: Post[], overrides: NoteOverrides): NewWord[] {
  const seen = new Map<string, NewWord>();
  for (const p of posts) {
    const caption = captionOf(p.body);
    for (const w of unknownFlavours(caption, overrides)) {
      const s = seen.get(w);
      seen.set(w, s ? { ...s, count: s.count + 1 } : { word: w, count: 1, context: contextOf(caption, w), date: p.date });
    }
  }
  return [...seen.values()].sort((a, b) => b.count - a.count);
}
