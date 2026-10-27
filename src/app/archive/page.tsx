import type { Metadata } from 'next';
import { ContactSheet } from '@/components/archive/ContactSheet';
import { toSheetItems } from '@/components/archive/types';
import { ARCHIVE_IN_MENU } from '@/components/site/SiteHeader';
import { SubPage } from '@/components/site/SubPage';
import { getPosts, getSiteSettings } from '@/lib/content';
import '@/components/archive/archive.css';

export const metadata: Metadata = {
  title: '아카이브',
  description: '아로마 로스터리가 인스타그램에 남긴 원두 카드와 매장의 기록을 모아 봅니다.',
  alternates: { canonical: '/archive' },
  // out of search while the archive is out of the menu
  ...(ARCHIVE_IN_MENU ? {} : { robots: { index: false, follow: true } }),
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
            인스타그램에 올린 기록을 모았습니다.
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
