import type { Metadata } from 'next';
import Link from 'next/link';
import { AssignBoard, type AssignRow } from '@/components/cupnote/AssignBoard';
import { PLACES, findNotes, ignoredWords, noteTable, unknownFlavours } from '@/components/news-post-lab/notes';
import { SubPage } from '@/components/site/SubPage';
import { cupnotesStoreReady, readOverrides } from '@/lib/cupnotes-store';
import { getPosts, type Block, type Post } from '@/lib/content';
import { formatDate } from '@/lib/post-utils';
import '@/components/news-post-lab/lab.css';
import '@/components/news-post-lab/notes.css';

/*
 * Placing cup notes (2026-10-22): the words the captions use as flavours that the table does not
 * know, each with the sentence it came from, to put at a place on the flavour wheel (Manufact Coffee Ver. 2) (which sets
 * its colour) or mark as not a flavour; and every word already placed, to move. Saved to Redis
 * through /api/cupnotes with the admin key. Reachable by URL only.
 */
export const metadata: Metadata = { title: '컵 노트 분류 배치 | aroma roastery' };

const captionOf = (blocks: Block[]) => blocks.map((b) => ('text' in b ? b.text : 'items' in b ? b.items.join(' ') : '')).join(' ');

/** The sentence a word stands in, shortened around it. */
function contextOf(caption: string, word: string): string {
  const at = caption.indexOf(word);
  if (at < 0) return '';
  const from = Math.max(0, at - 24);
  return `${from > 0 ? '…' : ''}${caption.slice(from, at + word.length + 24).replace(/\s+/g, ' ').trim()}…`;
}

export default async function AssignNotes() {
  const [news, archive, overrides] = await Promise.all([getPosts('news'), getPosts('archive'), readOverrides()]);
  const all: Post[] = [...news, ...archive];

  const unknown = new Map<string, { count: number; context: string; date: string }>();
  for (const p of all) {
    const caption = captionOf(p.body);
    for (const w of unknownFlavours(caption, overrides)) {
      const seen = unknown.get(w);
      unknown.set(w, { count: (seen?.count ?? 0) + 1, context: seen?.context ?? contextOf(caption, w), date: seen?.date ?? p.date });
    }
  }
  // how often each placed word appears, so the common ones come first
  const uses = new Map<string, number>();
  for (const p of all) for (const n of findNotes(captionOf(p.body), overrides)) uses.set(n.word, (uses.get(n.word) ?? 0) + 1);

  const rows: AssignRow[] = [
    ...[...unknown.entries()].sort((a, b) => b[1].count - a[1].count).map(([word, u]) => ({
      word, status: 'new' as const, count: u.count, context: `${formatDate(u.date)} ${u.context}`,
    })),
    ...noteTable(overrides).map((t) => ({
      word: t.word, status: t.assigned ? ('assigned' as const) : ('table' as const), count: uses.get(t.word) ?? 0,
      family: t.family, color: t.color, place: t.place, placeKey: (() => { const v = overrides[t.word]; return v && 'place' in v ? (v.like ? `${v.place}|${v.like}` : v.place) : undefined; })(),
    })).sort((a, b) => b.count - a.count),
    ...ignoredWords(overrides).map((word) => ({ word, status: 'ignored' as const, count: 0 })),
  ];

  return (
    <SubPage current="news">
      <div className="nws npl ncheck">
        <header className="page-head ncheck-head">
          <p className="npl-crumb"><Link href="/news-post-lab/notes">컵 노트 점검</Link><span aria-hidden="true">/</span><span>분류 배치</span></p>
          <h1>컵 노트 분류 배치</h1>
          <p>
            매장 글에서 맛 표현으로 쓰였지만 분류표에 없는 단어를 플레이버 휠에 배치하거나, 맛이 아니면 제외합니다.
            이미 있는 단어도 분류를 바꿀 수 있습니다. 저장하면 소식 상세의 컵 노트 색에 바로 반영됩니다.
          </p>
        </header>
        <AssignBoard rows={rows} places={PLACES} storeReady={cupnotesStoreReady()} />
      </div>
    </SubPage>
  );
}
