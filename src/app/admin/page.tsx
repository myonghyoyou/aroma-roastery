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

/*
 * The owner's way in (/admin, by URL only): what is waiting on the cup notes, one button to it, and
 * the latest bean arrivals with the notes their posts came out as, to look over at a glance.
 */
export const metadata: Metadata = { title: 'aroma 관리' };

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
          <h1>관리</h1>
          <p>이 주소를 휴대폰 홈 화면에 추가해 두면 다음부터 바로 들어올 수 있습니다.</p>
        </header>

        <section className="adm-todo" aria-labelledby="adm-todo">
          <div>
            <h2 id="adm-todo">{waiting.length ? `분류할 새 단어 ${waiting.length}개` : '분류할 새 단어가 없습니다'}</h2>
            {waiting.length ? (
              <>
                <p>매장 글에 맛 표현으로 나왔지만 아직 분류표에 없는 단어입니다.</p>
                <ul className="adm-todo-words">
                  {waiting.slice(0, SHOWN_WORDS).map((w) => <li key={w.word}>{w.word}</li>)}
                  {waiting.length > SHOWN_WORDS && <li>외 {waiting.length - SHOWN_WORDS}개</li>}
                </ul>
              </>
            ) : (
              <p>새 글에서 모르는 맛 표현이 나오면 여기에 알려 드립니다.</p>
            )}
          </div>
          <Link href="/admin/cupnotes" className={waiting.length ? 'adm-btn adm-btn--solid' : 'adm-btn'}>
            {waiting.length ? '분류하러 가기' : '컵 노트 분류 보기'}
          </Link>
        </section>

        <section className="adm-sec" aria-labelledby="adm-beans">
          <h2 id="adm-beans">최근 원두 소식의 컵 노트</h2>
          <p>색이 맞지 않으면 컵 노트 분류에서 그 단어의 분류를 바꿀 수 있습니다.</p>
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
