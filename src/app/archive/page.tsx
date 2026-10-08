import type { Metadata } from 'next';
import { ArchiveIndex } from '@/components/posts/ArchiveIndex';
import { PageHead } from '@/components/posts/PageHead';
import { SubPage } from '@/components/site/SubPage';
import { getPosts } from '@/lib/content';

export const metadata: Metadata = {
  title: '아카이브 | aroma roastery',
  description: '로스팅, 커핑, 행사, 매장의 기록을 모읍니다.',
};

export default async function ArchivePage() {
  const posts = await getPosts('archive');
  return (
    <SubPage current="archive">
      <PageHead title="아카이브" lead="로스팅, 커핑, 행사, 매장의 기록을 모읍니다." sample={posts.some((p) => p.sample)} />
      <ArchiveIndex posts={posts} />
    </SubPage>
  );
}
