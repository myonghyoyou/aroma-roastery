import type { Metadata } from 'next';
import { ContactSheet } from '@/components/archive/ContactSheet';
import { toSheetItems } from '@/components/archive/types';
import { SubPage } from '@/components/site/SubPage';
import { getPosts, getSiteSettings } from '@/lib/content';
import '@/components/archive/archive.css';

export const metadata: Metadata = {
  title: '아카이브 | aroma roastery',
  description: '로스팅, 커핑, 행사, 매장의 기록을 사진 한 장 단위로 모아 봅니다.',
};

export default async function ArchivePage() {
  const [posts, settings] = await Promise.all([getPosts('archive'), getSiteSettings()]);
  const items = toSheetItems(posts);
  return (
    <SubPage current="archive">
      <div className="arc">
        <header className="arc-head">
          <div className="arc-head-row">
            <h1>아카이브</h1>
            {posts.some((p) => p.sample) && <span className="tag-sample">예시</span>}
          </div>
          <p className="arc-lead">
            인스타그램에 올린 기록의 사진을 한 장씩 모았습니다. 사진을 누르면 크게 보고 원래 기록으로 이동할 수 있습니다.
          </p>
          <p className="arc-insta">
            <a href={settings.instagram.url} target="_blank" rel="noopener">인스타그램 {settings.instagram.handle}</a>
          </p>
        </header>
        <ContactSheet items={items} />
      </div>
    </SubPage>
  );
}
