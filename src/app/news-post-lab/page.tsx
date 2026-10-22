import type { Metadata } from 'next';
import Link from 'next/link';
import { NEWS_POST_CONCEPTS, newsLabHref } from '@/components/news-post-lab/concepts';
import { pickNewsExamples } from '@/components/news-post-lab/shared';
import { SubPage } from '@/components/site/SubPage';
import '@/components/news-post-lab/lab.css';

// design study hub: the news post layouts kept (A, E) on the real news, each opened on the same examples
export const metadata: Metadata = { title: '소식 상세 시안 비교 | aroma roastery' };

export default async function NewsPostLab() {
  const examples = await pickNewsExamples();
  return (
    <SubPage current="news">
      <header className="page-head">
        <div className="page-head-row">
          <h1>소식 상세 시안</h1>
        </div>
        <p>카페 브랜드들의 소식 상세를 참고해 실제 소식으로 만든 화면 시안입니다. 남긴 두 가지(A, E)와 각각을 다른 로스터리의 상품 페이지와 사진 보기 화면을 참고해 발전시킨 안(A 발전 1, 2와 E 발전 1, 2)입니다. 시안마다 같은 소식을 열어 비교해 보세요.</p>
      </header>
      <ol className="lab-hub">
        {NEWS_POST_CONCEPTS.map((c) => (
          <li key={c.key}>
            <div className="lab-hub-row">
              <span className="lab-hub-no">{c.key.toUpperCase()}</span>
              <span className="lab-hub-text">
                {examples[0] ? (
                  <Link href={newsLabHref(c.key, examples[0].slug)} className="lab-hub-name npl-hub-name">{c.name}</Link>
                ) : (
                  <span className="lab-hub-name">{c.name}</span>
                )}
                <span className="lab-hub-desc">{c.desc}</span>
                <span className="lab-hub-ref">{c.ref}</span>
                <span className="npl-hub-examples" aria-label={`${c.name}으로 열어 볼 소식`}>
                  {examples.map((ex) => (
                    <Link key={ex.slug} href={newsLabHref(c.key, ex.slug)} className="npl-btn">{ex.label}</Link>
                  ))}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </SubPage>
  );
}
