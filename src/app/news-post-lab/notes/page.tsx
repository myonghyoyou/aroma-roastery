import type { Metadata } from 'next';
import Link from 'next/link';
import { newsLabHref } from '@/components/news-post-lab/concepts';
import { FAMILY_LABEL, findNotes, noteTable, unknownFlavours, type NoteFamily } from '@/components/news-post-lab/notes';
import { SubPage } from '@/components/site/SubPage';
import { getPosts, type Block, type Post } from '@/lib/content';
import { formatDate } from '@/lib/post-utils';
import '@/components/news-post-lab/lab.css';
import '@/components/news-post-lab/lab-f.css';
import '@/components/news-post-lab/notes.css';

/*
 * The cup-note check (2026-10-22): which words the store's captions use as flavours that the table
 * does not know yet (to add to notes.ts), what each bean arrival's notes came out as, and the whole
 * table with each word's place on the SCA flavour wheel and its colour. Reachable by URL only.
 */
export const metadata: Metadata = { title: '컵 노트 점검 | aroma roastery' };

const captionOf = (blocks: Block[]) => blocks.map((b) => ('text' in b ? b.text : 'items' in b ? b.items.join(' ') : '')).join(' ');
const FAMILIES: NoteFamily[] = ['green', 'yellow', 'orange', 'red'];

export default async function NotesCheck() {
  const [news, archive] = await Promise.all([getPosts('news'), getPosts('archive')]);
  const all: Post[] = [...news, ...archive];

  // words to add, with the posts that use them
  const unknown = new Map<string, Post[]>();
  for (const p of all) for (const w of unknownFlavours(captionOf(p.body))) unknown.set(w, [...(unknown.get(w) ?? []), p]);
  const toAdd = [...unknown.entries()].sort((a, b) => b[1].length - a[1].length);

  const beans = news.filter((p) => p.topic === 'beans');
  const table = noteTable();

  return (
    <SubPage current="news">
      <div className="nws npl npl-f ncheck">
        <header className="page-head ncheck-head">
          <h1>컵 노트 점검</h1>
          <p>
            매장 글에서 맛 표현으로 쓰였는데 분류표에 없는 단어, 원두 소식마다 뽑힌 컵 노트, 그리고 분류표 전체입니다.
            분류는 SCA 커피 테이스터 플레이버 휠을 따르고, 색은 그 큰 분류에 맞춘 로고의 네 색입니다.
          </p>
        </header>

        <section className="ncheck-sec" aria-labelledby="ncheck-add">
          <h2 id="ncheck-add">분류표에 없는 단어 <span>{toAdd.length}개</span></h2>
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
              const notes = findNotes(captionOf(p.body));
              return (
                <li key={p.slug}>
                  <Link href={newsLabHref('f', p.slug)} className="ncheck-bean">{p.title}</Link>
                  <time dateTime={p.date}>{formatDate(p.date)}</time>
                  {notes.length ? (
                    <ul className="npl-f-tags">
                      {notes.map((n) => <li key={n.word} data-family={n.family} title={`SCA 플레이버 휠: ${n.place}`}>{n.word}</li>)}
                    </ul>
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
            {FAMILIES.map((f) => (
              <div key={f} className="ncheck-family" data-family={f}>
                <h3>{FAMILY_LABEL[f]}</h3>
                <ul>
                  {table.filter((t) => t.family === f).map((t) => (
                    <li key={t.word}>
                      <b>{t.word}</b>
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
