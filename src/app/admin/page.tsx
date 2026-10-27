import type { Metadata } from 'next';
import Link from 'next/link';
import { captionOf, newWords } from '@/components/admin/data';
import { CupNoteTags } from '@/components/cupnote/CupNoteTag';
import { findNotes } from '@/components/cupnote/notes';
import { cardHref } from '@/components/news/types';
import { SubPage } from '@/components/site/SubPage';
import { readOverrides } from '@/lib/cupnotes-store';
import { getPosts } from '@/lib/content';
import { formatDate } from '@/lib/post-utils';
import '@/components/admin/admin.css';
import { signOut } from './actions';

/*
 * The owner's way in (/admin, by URL only, behind the sign-in in proxy.ts): what is waiting on the cup notes, one button to it, and
 * the latest bean arrivals with the notes their posts came out as, to look over at a glance.
 */
export const metadata: Metadata = { title: { absolute: 'aroma 관리' } };

const RECENT = 6;
const SHOWN_WORDS = 8;

export default async function AdminHome() {
  const [news, archive, overrides] = await Promise.all([getPosts('news'), getPosts('archive'), readOverrides()]);
  const waiting = newWords([...news, ...archive], overrides);
  const beans = news.filter((p) => p.topic === 'beans').slice(0, RECENT);

  return (
    <SubPage>
      <div className="adm">
        <header className="page-head adm-head">
          <div className="adm-head-row">
            <h1>관리</h1>
            <form action={signOut}><button type="submit" className="adm-btn">나가기</button></form>
          </div>
        </header>

        <section className="adm-todo" aria-labelledby="adm-todo">
          <div>
            <h2 id="adm-todo">{waiting.length ? `분류할 새 단어 ${waiting.length}개` : '분류할 새 단어가 없습니다'}</h2>
            {waiting.length > 0 && (
              <ul className="adm-todo-words">
                {waiting.slice(0, SHOWN_WORDS).map((w) => <li key={w.word}>{w.word}</li>)}
                {waiting.length > SHOWN_WORDS && <li>외 {waiting.length - SHOWN_WORDS}개</li>}
              </ul>
            )}
          </div>
          <Link href="/admin/cupnotes" className={waiting.length ? 'adm-btn adm-btn--solid' : 'adm-btn'}>
            {waiting.length ? '분류하러 가기' : '컵 노트 분류 보기'}
          </Link>
        </section>

        <section className="adm-sec" aria-labelledby="adm-beans">
          <h2 id="adm-beans">최근 원두 소식의 컵 노트</h2>
          {beans.length ? (
            <ol className="adm-beans">
              {beans.map((p) => {
                const notes = findNotes(captionOf(p.body), overrides);
                return (
                  <li key={p.slug}>
                    <Link href={cardHref(p.slug)} className="adm-bean">{p.title}</Link>
                    <time dateTime={p.date}>{formatDate(p.date)}</time>
                    {notes.length ? <CupNoteTags notes={notes} /> : <span className="adm-empty">찾은 컵 노트 없음</span>}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="adm-empty">아직 원두 소식이 없습니다.</p>
          )}
        </section>
      </div>
    </SubPage>
  );
}
