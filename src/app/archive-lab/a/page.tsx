import type { Metadata } from 'next';
import { ArchiveLog, type LogItem, type LogPhoto } from '@/components/archive-lab/a/ArchiveLog';
import { SubPage } from '@/components/site/SubPage';
import { getPosts, type Post } from '@/lib/content';
import '@/components/archive-lab/a/a.css';

export const metadata: Metadata = {
  title: '아카이브 | aroma roastery',
  description: '로스팅, 커핑, 행사, 매장의 기록을 모읍니다.',
};

function toLogPhoto(p: { src: string; alt: string; w?: number; h?: number }): LogPhoto {
  return { src: p.src, alt: p.alt, w: p.w ?? 1600, h: p.h ?? 1200 };
}

/* Only what the index needs crosses to the client: no body text, at most four preview photos. */
function toLogItem(post: Post): LogItem | null {
  if (!post.category) return null;
  const photos = post.photos ?? [];
  // the cover is a plain Media; take its pixel size from the same photo in the post when present
  const coverPhoto = post.cover ? photos.find((p) => p.src === post.cover?.src) : photos[0];
  const cover = coverPhoto ? toLogPhoto(coverPhoto) : post.cover ? toLogPhoto(post.cover) : null;
  if (!cover) return null;
  const rest = photos.filter((p) => p.src !== cover.src).slice(0, 3).map(toLogPhoto);
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    category: post.category,
    cover,
    preview: [cover, ...rest],
    photoCount: photos.length,
  };
}

export default async function ArchiveLabA() {
  const posts = await getPosts('archive');
  const items = posts.map(toLogItem).filter((it): it is LogItem => it !== null);
  return (
    <SubPage current="archive">
      <header className="lab-a-head">
        <p className="lab-a-kicker">Archive log</p>
        <div className="lab-a-head-row">
          <h1 className="lab-a-h1">아카이브</h1>
          {posts.some((p) => p.sample) && <span className="tag-sample">예시</span>}
        </div>
        <p className="lab-a-lead">로스팅, 커핑, 행사, 매장의 기록을 모읍니다.</p>
      </header>
      <ArchiveLog items={items} />
    </SubPage>
  );
}
