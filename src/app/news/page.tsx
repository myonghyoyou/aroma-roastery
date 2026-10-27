import type { Metadata } from 'next';
import { CardFeed } from '@/components/news/CardFeed';
import { toFeed } from '@/components/news/types';
import { SubPage } from '@/components/site/SubPage';
import { getPosts, getSiteSettings } from '@/lib/content';
import { openGraphFor } from '@/lib/site';
import '@/components/news/news.css';

export const metadata: Metadata = {
  title: '소식',
  description: '아로마 로스터리의 원두 입고, 영업시간, 휴무, 행사 소식입니다.',
  alternates: { canonical: '/news' },
  openGraph: openGraphFor('/news'),
};

/* News: concept C (card feed), chosen in review. Posts come from Instagram (posts with written captions), see instagram.ts. */
export default async function NewsPage() {
  const [posts, settings] = await Promise.all([getPosts('news'), getSiteSettings()]);
  const cards = toFeed(posts);
  return (
    <SubPage current="news">
      <div className="nws">
        <header className="nws-head">
          <div className="nws-head-row">
            <h1>소식</h1>
            {posts.some((p) => p.sample) && <span className="tag-sample">예시</span>}
          </div>
          <p className="nws-lead">영업시간, 휴무, 원두 입고, 매장 행사</p>
          <p className="nws-insta">
            <a href={settings.instagram.url} target="_blank" rel="noopener">인스타그램 {settings.instagram.handle}</a>
          </p>
        </header>
        <CardFeed cards={cards} />
      </div>
    </SubPage>
  );
}
