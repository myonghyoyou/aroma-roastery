import type { Metadata } from 'next';
import { JournalList } from '@/components/archive-lab/e/JournalList';
import { toLabEItem } from '@/components/archive-lab/e/shared';
import { SubPage } from '@/components/site/SubPage';
import { getPosts } from '@/lib/content';
import '@/components/archive-lab/e/e.css';

export const metadata: Metadata = {
  title: '아카이브 (시안 E) | aroma roastery',
  description: '로스팅, 커핑, 행사, 매장의 기록을 모읍니다.',
};

/* Concept E, "저널 스프레드": the archive as a magazine feature spread. */
export default async function ArchiveLabE() {
  const posts = await getPosts('archive');
  const items = posts.map(toLabEItem);
  return (
    <SubPage current="archive">
      <header className="lab-e-head">
        <p className="lab-e-eyebrow">Journal</p>
        <div className="lab-e-head-row">
          <h1>아카이브</h1>
          {posts.some((p) => p.sample) && <span className="tag-sample">예시</span>}
        </div>
        <p className="lab-e-lead">로스팅, 커핑, 행사, 매장에서 남긴 기록과 사진을 모읍니다.</p>
      </header>
      <JournalList items={items} />
    </SubPage>
  );
}
