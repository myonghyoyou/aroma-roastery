import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactSheet } from '@/components/archive-lab/d/ContactSheet';
import { toSheetItems } from '@/components/archive-lab/d/types';
import { SubPage } from '@/components/site/SubPage';
import { getPosts } from '@/lib/content';
import '@/components/archive-lab/d/d.css';

export const metadata: Metadata = {
  title: '아카이브 (시안 D: 컨택트 시트) | aroma roastery',
  description: '로스팅, 커핑, 행사, 매장의 기록을 사진 한 장 단위로 모아 봅니다.',
};

export default async function ArchiveLabD() {
  const posts = await getPosts('archive');
  const items = toSheetItems(posts);
  return (
    <SubPage current="archive">
      <div className="lab-d">
        <header className="lab-d-head">
          <p className="lab-d-crumb">
            <Link href="/archive-lab">아카이브 시안</Link>
            <span aria-hidden="true">/</span>
            <span>D 컨택트 시트</span>
          </p>
          <div className="lab-d-head-row">
            <h1>아카이브</h1>
            {posts.some((p) => p.sample) && <span className="tag-sample">예시</span>}
          </div>
          <p className="lab-d-lead">기록에 담긴 사진을 한 장씩 모았습니다. 사진을 누르면 크게 보고 원래 기록으로 이동할 수 있습니다.</p>
        </header>
        <ContactSheet items={items} />
      </div>
    </SubPage>
  );
}
