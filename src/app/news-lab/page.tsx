import type { Metadata } from 'next';
import Link from 'next/link';
import { NEWS_LAB_CONCEPTS } from '@/components/news-lab/concepts';
import { SubPage } from '@/components/site/SubPage';

// design study hub: five news concepts built on the same sample notices, to compare and choose one
export const metadata: Metadata = { title: '소식 시안 비교 | aroma roastery' };

export default function NewsLab() {
  return (
    <SubPage current="news">
      <header className="page-head">
        <div className="page-head-row">
          <h1>소식 시안</h1>
          <span className="tag-sample">예시</span>
        </div>
        <p>같은 예시 소식 14건으로 만든 다섯 가지 구성입니다. 목록과 상세를 함께 비교해 보세요.</p>
      </header>
      <ol className="lab-hub">
        {NEWS_LAB_CONCEPTS.map((c, i) => (
          <li key={c.key}>
            <Link href={`/news-lab/${c.key}`} className="lab-hub-row">
              <span className="lab-hub-no">{String(i + 1).padStart(2, '0')}</span>
              <span className="lab-hub-text">
                <span className="lab-hub-name">{c.name}</span>
                <span className="lab-hub-desc">{c.desc}</span>
                <span className="lab-hub-ref">{c.ref}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </SubPage>
  );
}
