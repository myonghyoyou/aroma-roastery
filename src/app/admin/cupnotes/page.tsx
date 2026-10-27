import type { Metadata } from 'next';
import Link from 'next/link';
import { captionOf, newWords } from '@/components/admin/data';
import { AssignBoard, type AssignRow } from '@/components/cupnote/AssignBoard';
import { PLACES, findNotes, ignoredWords, noteTable } from '@/components/cupnote/notes';
import { SubPage } from '@/components/site/SubPage';
import { cupnotesStoreReady, readOverrides } from '@/lib/cupnotes-store';
import { getPosts, type Post } from '@/lib/content';
import { formatDate } from '@/lib/post-utils';
import '@/components/admin/admin.css';

/*
 * Placing cup notes: the words the captions use as flavours that the table does not know, each with
 * the sentence it came from, to put at a place on the flavour wheel (Manufact Coffee Ver. 2) (which
 * sets its colour) or mark as not a flavour; and every word already placed, to move. Saved to Redis
 * through /api/cupnotes with the admin key.
 */
export const metadata: Metadata = { title: { absolute: '컵 노트 분류 | aroma 관리' } };

export default async function AdminCupNotes() {
  const [news, archive, overrides] = await Promise.all([getPosts('news'), getPosts('archive'), readOverrides()]);
  const all: Post[] = [...news, ...archive];

  // how often each placed word appears, so the common ones come first
  const uses = new Map<string, number>();
  for (const p of all) for (const n of findNotes(captionOf(p.body), overrides)) uses.set(n.word, (uses.get(n.word) ?? 0) + 1);

  const rows: AssignRow[] = [
    ...newWords(all, overrides).map((u) => ({
      word: u.word, status: 'new' as const, count: u.count, context: `${formatDate(u.date)} ${u.context}`,
    })),
    ...noteTable(overrides).map((t) => ({
      word: t.word, status: t.assigned ? ('assigned' as const) : ('table' as const), count: uses.get(t.word) ?? 0,
      family: t.family, color: t.color, place: t.place, placeKey: (() => { const v = overrides[t.word]; return v && 'place' in v ? (v.like ? `${v.place}|${v.like}` : v.place) : undefined; })(),
    })).sort((a, b) => b.count - a.count),
    ...ignoredWords(overrides).map((word) => ({ word, status: 'ignored' as const, count: 0 })),
  ];

  return (
    <SubPage>
      <div className="adm">
        <header className="page-head adm-head">
          <p className="adm-crumb"><Link href="/admin">관리</Link><span aria-hidden="true">/</span><span>컵 노트 분류</span></p>
          <h1>컵 노트 분류</h1>
          <p>분류표에 없는 맛 표현을 플레이버 휠에 배치합니다.</p>
        </header>
        <AssignBoard rows={rows} places={PLACES} storeReady={cupnotesStoreReady()} />
      </div>
    </SubPage>
  );
}
