import type { Metadata } from 'next';
import { ArchiveGrid } from '@/components/posts/ArchiveGrid';
import { PageHead } from '@/components/posts/PageHead';
import { SubPage } from '@/components/site/SubPage';
import { getPosts } from '@/lib/content';

// design preview only: layout B of the archive list, to compare with /archive (layout A)
export const metadata: Metadata = { title: '아카이브 B안 | aroma roastery' };

export default async function ArchiveGridPreview() {
  const posts = await getPosts('archive');
  return (
    <SubPage current="archive">
      <PageHead title="아카이브" lead="로스팅, 커핑, 행사, 매장의 기록을 모읍니다." sample={posts.some((p) => p.sample)} />
      <ArchiveGrid posts={posts} />
    </SubPage>
  );
}
