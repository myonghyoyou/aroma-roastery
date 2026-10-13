import type { Metadata } from 'next';
import Link from 'next/link';
import { PinnedSlot, Timeline } from '@/components/news-lab/d/Timeline';
import { SubPage } from '@/components/site/SubPage';
import { getPosts, type NewsTopic } from '@/lib/content';
import { TOPIC_LABEL } from '@/lib/post-utils';
import '@/components/news-lab/d/d.css';

export const metadata: Metadata = {
  title: '소식 (시안 D: 타임라인) | aroma roastery',
  description: '영업시간, 휴무, 원두 입고, 행사 소식을 달별로 모아 봅니다.',
};

const TOPICS = Object.keys(TOPIC_LABEL) as NewsTopic[];

export default async function NewsLabD() {
  const posts = await getPosts('news');
  const pinned = posts.find((p) => p.pinned);
  return (
    <SubPage current="news">
      <div className="nl-d">
        <header className="nl-d-head">
          <p className="nl-d-crumb">
            <Link href="/news-lab">소식 시안</Link>
            <span aria-hidden="true">/</span>
            <span>D 타임라인</span>
          </p>
          <div className="nl-d-head-row">
            <h1>소식</h1>
            {posts.some((p) => p.sample) && <span className="tag-sample">예시</span>}
          </div>
          <p className="nl-d-lead">매장 운영과 원두, 행사 소식을 날짜순으로 기록합니다. 짧은 소식은 목록에서 바로 펼쳐 읽을 수 있습니다.</p>
          <ul className="nl-d-legend" aria-label="분류 색">
            {TOPICS.map((t) => (
              <li key={t} data-topic={t}>
                <span className="nl-d-dot nl-d-dot--inline" aria-hidden="true" />
                {TOPIC_LABEL[t]}
              </li>
            ))}
          </ul>
        </header>
        {pinned && <PinnedSlot post={pinned} />}
        <Timeline posts={posts} />
      </div>
    </SubPage>
  );
}
