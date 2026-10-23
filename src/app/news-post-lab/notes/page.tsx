import type { Metadata } from 'next';
import Link from 'next/link';
import { CupNoteTags, toneStyle } from '@/components/cupnote/CupNoteTag';
import { newsLabHref } from '@/components/news-post-lab/concepts';
import { FAMILY_COLOR, FAMILY_LABEL, FAMILY_ORDER, findNotes, noteTable, unknownFlavours } from '@/components/cupnote/notes';
import { SubPage } from '@/components/site/SubPage';
import { readOverrides } from '@/lib/cupnotes-store';
import { getPosts, type Block, type Post } from '@/lib/content';
import { formatDate } from '@/lib/post-utils';
import '@/components/news-post-lab/lab.css';
import '@/components/news-post-lab/notes.css';

/*
 * The cup-note check (2026-10-22): which words the store's captions use as flavours that the table
 * does not know yet (to add to notes.ts), what each bean arrival's notes came out as, and the whole
 * table with each word's place on the flavour wheel (Manufact Coffee Ver. 2) and its colour. Reachable by URL only.
 */
export const metadata: Metadata = { title: '컵 노트 점검 | aroma roastery' };

const captionOf = (blocks: Block[]) => blocks.map((b) => ('text' in b ? b.text : 'items' in b ? b.items.join(' ') : '')).join(' ');

export default async function NotesCheck() {
  const [news, archive, overrides] = await Promise.all([getPosts('news'), getPosts('archive'), readOverrides()]);
  const all: Post[] = [...news, ...archive];

  // words to add, with the posts that use them
  const unknown = new Map<string, Post[]>();
  for (const p of all) for (const w of unknownFlavours(captionOf(p.body), overrides)) unknown.set(w, [...(unknown.get(w) ?? []), p]);
  const toAdd = [...unknown.entries()].sort((a, b) => b[1].length - a[1].length);

  const beans = news.filter((p) => p.topic === 'beans');
  const table = noteTable(overrides);

  return (
    <SubPage current="news">
      <div className="nws npl ncheck">
        <header className="page-head ncheck-head">
          <h1>컵 노트 점검</h1>
          <p>
            매장 글에서 맛 표현으로 쓰였는데 분류표에 없는 단어, 원두 소식마다 뽑힌 컵 노트, 그리고 분류표 전체입니다.
            분류와 색은 커피 플레이버 휠 Ver.2(Manufact Coffee, 2026.01)를 따릅니다. 색은 휠 바깥 고리에서 그 단어 칸의 색이고, 휠에 없는 단어는 맛이 가장 가까운 단어의 색을 씁니다.
          </p>
        </header>

        <section className="ncheck-sec" aria-labelledby="ncheck-add">
          <h2 id="ncheck-add">분류표에 없는 단어 <span>{toAdd.length}개</span></h2>
          <p className="ncheck-note"><Link href="/news-post-lab/notes/assign" className="npl-btn">분류 배치하기</Link> <Link href="/news-post-lab/notes/chips" className="npl-btn">표시 시안 보기</Link> <Link href="/news-post-lab/notes/picker" className="npl-btn">분류 선택 검색 시안</Link></p>
          <p className="ncheck-note">글 {all.length}개에서 &lsquo;같은&rsquo;, &lsquo;향&rsquo;, &lsquo;처럼&rsquo; 앞에 온 낱말 가운데 표에 없는 것입니다. 맛이면 표에 더하고, 비유(상표 이름 등)면 그대로 둡니다.</p>
          {toAdd.length === 0 ? (
            <p className="ncheck-empty">새로 더할 단어가 없습니다.</p>
          ) : (
            <ul className="ncheck-add">
              {toAdd.map(([w, posts]) => (
                <li key={w}>
                  <b>{w}</b>
                  <span>{posts.length}회</span>
                  <span className="ncheck-in">{posts.slice(0, 2).map((p) => `${formatDate(p.date)} ${p.untitled ? '' : p.title}`).join(', ')}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ncheck-sec" aria-labelledby="ncheck-beans">
          <h2 id="ncheck-beans">원두 소식별 컵 노트 <span>{beans.length}건</span></h2>
          <ol className="ncheck-beans">
            {beans.map((p) => {
              const notes = findNotes(captionOf(p.body), overrides);
              return (
                <li key={p.slug}>
                  <Link href={newsLabHref('f', p.slug)} className="ncheck-bean">{p.title}</Link>
                  <time dateTime={p.date}>{formatDate(p.date)}</time>
                  {notes.length ? (
                    <CupNoteTags notes={notes} />
                  ) : (
                    <span className="ncheck-none">찾은 컵 노트 없음</span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <section className="ncheck-sec" aria-labelledby="ncheck-table">
          <h2 id="ncheck-table">분류표 <span>{table.length}단어</span></h2>
          <div className="ncheck-table">
            {FAMILY_ORDER.filter((f) => table.some((t) => t.family === f)).map((f) => (
              <div key={f} className="ncheck-family" style={toneStyle(f)}>
                <h3><span className="ncheck-swatch" style={{ background: FAMILY_COLOR[f] }} aria-hidden="true" />{FAMILY_LABEL[f]}</h3>
                <ul>
                  {table.filter((t) => t.family === f).map((t) => (
                    <li key={t.word}>
                      <b><span className="ncheck-swatch" style={{ background: t.color }} aria-hidden="true" />{t.word}</b>
                      {t.aka.length > 0 && <span className="ncheck-aka">{t.aka.join(', ')}</span>}
                      <span className="ncheck-place">{t.place}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SubPage>
  );
}
