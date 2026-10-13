import type { Metadata } from 'next';
import Link from 'next/link';
import { CardFeed } from '@/components/news-lab/c/CardFeed';
import { toFeed } from '@/components/news-lab/c/types';
import { SubPage } from '@/components/site/SubPage';
import { getPosts } from '@/lib/content';
import '@/components/news-lab/c/c.css';

export const metadata: Metadata = {
  title: '소식 (시안 C: 카드 피드) | aroma roastery',
  description: '영업시간, 휴무, 원두 입고, 행사 소식을 카드 한 장씩 모았습니다.',
};

export default async function NewsLabC() {
  const posts = await getPosts('news');
  const cards = toFeed(posts);
  return (
    <SubPage current="news">
      <div className="nl-c">
        <header className="nl-c-head">
          <p className="nl-c-crumb">
            <Link href="/news-lab">소식 시안</Link>
            <span aria-hidden="true">/</span>
            <span>C 카드 피드</span>
          </p>
          <div className="nl-c-head-row">
            <h1>소식</h1>
            {posts.some((p) => p.sample) && <span className="tag-sample">예시</span>}
          </div>
          <p className="nl-c-lead">영업시간과 휴무, 새로 들어온 원두, 매장 행사를 알려 드립니다.</p>
        </header>
        <CardFeed cards={cards} />
      </div>
    </SubPage>
  );
}
