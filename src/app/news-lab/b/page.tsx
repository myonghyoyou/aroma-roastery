import type { Metadata } from 'next';
import Link from 'next/link';
import { OpsCalendar } from '@/components/news-lab/b/OpsCalendar';
import { monthOf, monthRange, toItem } from '@/components/news-lab/b/cal';
import { SubPage } from '@/components/site/SubPage';
import { getPosts } from '@/lib/content';
import '@/components/news-lab/b/b.css';

export const metadata: Metadata = {
  title: '소식 (시안 B: 운영 달력) | aroma roastery',
  description: '휴무일과 행사일, 영업시간 변경을 한 달 달력으로 확인합니다.',
};

export default async function NewsLabB() {
  const posts = await getPosts('news');
  const items = posts.map(toItem);
  const months = monthRange(items);
  const initial = items[0] ? monthOf(items[0].date) : months[months.length - 1] ?? '2026-10';

  return (
    <SubPage current="news">
      <div className="nl-b">
        <header className="nl-b-head">
          <p className="nl-b-crumb">
            <Link href="/news-lab">소식 시안</Link>
            <span aria-hidden="true">/</span>
            <span>B 운영 달력</span>
          </p>
          <div className="nl-b-head-row">
            <h1>소식</h1>
            {posts.some((p) => p.sample) && <span className="tag-sample">예시</span>}
          </div>
          <p className="nl-b-lead">매장이 쉬는 날, 행사가 열리는 날, 영업시간이 바뀌는 날을 달력에 표시했습니다. 달을 넘기면 지난 소식을 볼 수 있습니다.</p>
        </header>
        {items.length === 0 ? (
          <p className="nl-b-empty">아직 소식이 없습니다.</p>
        ) : (
          <OpsCalendar items={items} months={months} initialMonth={initial} />
        )}
      </div>
    </SubPage>
  );
}
