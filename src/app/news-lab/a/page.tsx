import type { Metadata } from 'next';
import Link from 'next/link';
import { NoticeBoard } from '@/components/news-lab/a/NoticeBoard';
import { toRows } from '@/components/news-lab/a/rows';
import { SubPage } from '@/components/site/SubPage';
import { getPosts } from '@/lib/content';
import '@/components/news-lab/a/a.css';

export const metadata: Metadata = {
  title: '소식 (시안 A: 공지 게시판) | aroma roastery',
  description: '영업시간, 휴무, 원두 입고, 행사 소식을 공지 게시판으로 모아 봅니다.',
};

export default async function NewsLabA() {
  const posts = await getPosts('news');
  return (
    <SubPage current="news">
      <div className="nl-a">
        <header className="nl-a-page-head">
          <p className="nl-a-crumb">
            <Link href="/news-lab">소식 시안</Link>
            <span aria-hidden="true">/</span>
            <span>A 공지 게시판</span>
          </p>
          <div className="nl-a-head-row">
            <h1>소식</h1>
            {posts.some((p) => p.sample) && <span className="tag-sample">예시</span>}
          </div>
          <p className="nl-a-lead">영업시간과 휴무, 원두 입고, 행사 소식을 알려 드립니다. 꼭 확인하실 글은 맨 위에 고정해 두었습니다.</p>
        </header>
        <NoticeBoard rows={toRows(posts)} />
      </div>
    </SubPage>
  );
}
