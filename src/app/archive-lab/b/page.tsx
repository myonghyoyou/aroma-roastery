import type { Metadata } from 'next';
import { MonthRail } from '@/components/archive-lab/b/MonthRail';
import { TimelineEntry } from '@/components/archive-lab/b/TimelineEntry';
import { groupByYearMonth, monthLabel, type RailMonth } from '@/components/archive-lab/b/calendar';
import { SubPage } from '@/components/site/SubPage';
import { getPosts } from '@/lib/content';
import '@/components/archive-lab/b/b.css';

export const metadata: Metadata = {
  title: '아카이브 | aroma roastery',
  description: '로스팅, 커핑, 행사, 매장의 기록을 모읍니다.',
};

/*
 * Archive, concept B: a calm editorial calendar. Posts are filed under a year, then a month; the
 * month label sticks while its posts scroll past, and a rail of months jumps between them.
 */
export default async function ArchiveLabB() {
  const posts = await getPosts('archive');
  const years = groupByYearMonth(posts);
  const rail: RailMonth[] = years.flatMap((y) =>
    y.months.map((m) => ({ id: m.id, year: m.year, month: m.month, count: m.posts.length })),
  );
  const sample = posts.some((p) => p.sample);
  const firstScreen = new Set(posts.slice(0, 2).map((p) => p.slug));

  return (
    <SubPage current="archive">
      <header className="lab-b-head">
        <div className="lab-b-head-row">
          <h1>아카이브</h1>
          {sample && <span className="tag-sample">예시</span>}
        </div>
        <p>로스팅, 커핑, 행사, 매장의 기록을 모읍니다.</p>
      </header>

      <div className="lab-b-layout">
        <MonthRail months={rail} />

        <div className="lab-b-timeline">
          {years.map((y) => (
            <section key={y.year} className="lab-b-year" aria-labelledby={`lab-b-y-${y.year}`}>
              <h2 id={`lab-b-y-${y.year}`} className="lab-b-year-label">{y.year}</h2>
              {y.months.map((m) => (
                <section key={m.id} id={m.id} className="lab-b-month" aria-labelledby={`${m.id}-label`}>
                  <div className="lab-b-month-side">
                    <h3 id={`${m.id}-label`} className="lab-b-month-label" tabIndex={-1} data-month-label>
                      <span className="lab-b-month-num" aria-hidden="true">{m.month}</span>
                      <span className="lab-b-month-name">
                        {y.year}년 {monthLabel(m.month)}
                      </span>
                    </h3>
                  </div>
                  <ol className="lab-b-entries">
                    {m.posts.map((p) => (
                      <li key={p.slug}>
                        <TimelineEntry post={p} eager={firstScreen.has(p.slug)} />
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </section>
          ))}
        </div>
      </div>
    </SubPage>
  );
}
