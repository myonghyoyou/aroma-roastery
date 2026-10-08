import type { Metadata } from 'next';
import { FilmStrips, type LabCStripPost } from '@/components/archive-lab/c/FilmStrips';
import { SubPage } from '@/components/site/SubPage';
import { getPosts } from '@/lib/content';
import '@/components/archive-lab/c/c.css';

export const metadata: Metadata = {
  title: '아카이브 | aroma roastery',
  description: '로스팅, 커핑, 행사, 매장의 기록을 모읍니다.',
};

/* Concept C, film strip: every post is one sideways roll of its photos. */
export default async function LabCArchivePage() {
  const posts = await getPosts('archive');
  const strips: LabCStripPost[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    category: p.category,
    photos: p.photos ?? [],
  }));
  return (
    <SubPage current="archive">
      <header className="lab-c-head">
        <div className="lab-c-head-row">
          <h1>아카이브</h1>
          {posts.some((p) => p.sample) && <span className="tag-sample">예시</span>}
        </div>
        <p>로스팅, 커핑, 행사, 매장의 기록을 모읍니다.</p>
      </header>
      <FilmStrips posts={strips} />
    </SubPage>
  );
}
