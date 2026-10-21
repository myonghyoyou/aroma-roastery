import type { Metadata } from 'next';
import Link from 'next/link';
import { POST_LAB_CONCEPTS, labHref } from '@/components/archive-post-lab/concepts';
import { pickExamples } from '@/components/archive-post-lab/shared';
import { SubPage } from '@/components/site/SubPage';
import '@/components/archive-post-lab/lab.css';

// design study hub: five archive post layouts on the real archive, each opened on the same examples
export const metadata: Metadata = { title: '아카이브 상세 시안 비교 | aroma roastery' };

export default async function ArchivePostLab() {
  const examples = await pickExamples();
  return (
    <SubPage current="archive">
      <header className="page-head">
        <div className="page-head-row">
          <h1>아카이브 상세 시안</h1>
        </div>
        <p>실제 아카이브 기록으로 만든 다섯 가지 상세 화면입니다. 시안마다 같은 기록을 열어 비교해 보세요.</p>
      </header>
      <ol className="lab-hub">
        {POST_LAB_CONCEPTS.map((c, i) => (
          <li key={c.key}>
            <div className="lab-hub-row">
              <span className="lab-hub-no">{String(i + 1).padStart(2, '0')}</span>
              <span className="lab-hub-text">
                {examples[0] ? (
                  <Link href={labHref(c.key, examples[0].slug)} className="lab-hub-name apl-hub-name">{c.name}</Link>
                ) : (
                  <span className="lab-hub-name">{c.name}</span>
                )}
                <span className="lab-hub-desc">{c.desc}</span>
                <span className="lab-hub-ref">{c.ref}</span>
                <span className="apl-hub-examples" aria-label={`${c.name}으로 열어 볼 기록`}>
                  {examples.map((ex) => (
                    <Link key={ex.slug} href={labHref(c.key, ex.slug)} className="apl-btn">{ex.label}</Link>
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
