import type { Metadata } from 'next';
import { NewsList } from '@/components/posts/NewsList';
import { PageHead } from '@/components/posts/PageHead';
import { SubPage } from '@/components/site/SubPage';
import { getPosts } from '@/lib/content';

export const metadata: Metadata = {
  title: '소식 | aroma roastery',
  description: '영업시간, 휴무, 원두 입고 같은 매장 소식을 알립니다.',
};

export default async function NewsPage() {
  const posts = await getPosts('news');
  return (
    <SubPage current="news">
      <PageHead title="소식" lead="영업시간, 휴무, 원두 입고 같은 매장 소식을 알립니다." sample={posts.some((p) => p.sample)} />
      <NewsList posts={posts} />
    </SubPage>
  );
}
