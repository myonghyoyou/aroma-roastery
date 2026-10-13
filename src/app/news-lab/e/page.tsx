import type { Metadata } from 'next';
import Link from 'next/link';
import { NoticeList } from '@/components/news-lab/e/NoticeList';
import { toNlENotice } from '@/components/news-lab/e/shared';
import { StatusStrip } from '@/components/news-lab/e/StatusStrip';
import { SubPage } from '@/components/site/SubPage';
import { getPosts, getSiteSettings } from '@/lib/content';
import '@/components/news-lab/e/e.css';

export const metadata: Metadata = {
  title: '소식 (시안 E: 매장 알림판) | aroma roastery',
  description: '오늘 영업 여부와 다가오는 휴무, 행사, 그리고 아로마로스터리의 소식을 모아 봅니다.',
};

export default async function NewsLabE() {
  const [posts, settings] = await Promise.all([getPosts('news'), getSiteSettings()]);
  const notices = posts.map(toNlENotice);
  return (
    <SubPage current="news">
      <div className="nl-e">
        <header className="nl-e-head">
          <p className="nl-e-crumb">
            <Link href="/news-lab">소식 시안</Link>
            <span aria-hidden="true">/</span>
            <span>E 매장 알림판</span>
          </p>
          <div className="nl-e-head-row">
            <h1>소식</h1>
            {notices.some((n) => n.sample) && <span className="tag-sample">예시</span>}
          </div>
          <p className="nl-e-lead">매장에 오시기 전에 영업 여부와 다가오는 일정을 확인해 주세요.</p>
        </header>
        <StatusStrip hours={settings.hours} notices={notices} fallbackFrom={notices[0]?.date ?? ''} />
        <NoticeList notices={notices} />
      </div>
    </SubPage>
  );
}
