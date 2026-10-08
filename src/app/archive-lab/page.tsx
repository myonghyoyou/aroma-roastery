import type { Metadata } from 'next';
import Link from 'next/link';
import { SubPage } from '@/components/site/SubPage';

// design study hub: five archive concepts built on the same mock photos, to compare and choose one
export const metadata: Metadata = { title: '아카이브 시안 비교 | aroma roastery' };

const CONCEPTS = [
  {
    key: 'a', name: '로스팅 로그', ref: '참고: Kurasu 저널 목록, 스튜디오 사이트의 호버 인덱스',
    desc: '날짜, 카테고리, 제목, 사진 수가 한 줄씩 정리된 기록 목록입니다. 줄에 마우스를 올리면 사진이 커서를 따라 나옵니다. 상세는 왼쪽에 글이 고정되고 오른쪽으로 사진이 이어집니다.',
  },
  {
    key: 'b', name: '연도 타임라인', ref: '참고: Lavazza Calendar, Cereal 연도 필터',
    desc: '연도와 월을 기준으로 기록을 묶고, 옆의 월 목록으로 바로 이동합니다. 글마다 사진 몇 장이 가로로 놓입니다. 상세는 큰 대표 사진 뒤에 본문과 사진 묶음이 이어집니다.',
  },
  {
    key: 'c', name: '필름 스트립', ref: '참고: Cereal의 세로·가로 사진 짝짓기, Counter Culture 리포트 리듬',
    desc: '기록 하나가 필름 한 줄처럼 가로로 넘어갑니다. 사진마다 프레임 번호가 붙습니다. 상세는 사진 두 장과 한 장이 번갈아 놓이고, 누르면 크게 봅니다.',
  },
  {
    key: 'd', name: '컨택트 시트', ref: '참고: Cereal 사진 DB 갤러리, Allpress 개수 표시 필터',
    desc: '글이 아니라 사진 한 장 한 장이 목록의 단위입니다. 모든 기록의 사진이 촘촘한 격자로 깔리고, 누르면 크게 보며 원래 기록으로 이동합니다.',
  },
  {
    key: 'e', name: '저널 스프레드', ref: '참고: Kinfolk, Allpress 저널, Counter Culture 블로그',
    desc: '최신 기록을 크게 싣고 나머지는 두 단으로 엇갈려 놓는 잡지형입니다. 상세는 화면 폭 대표 사진과 사진 옆에 붙어 따라오는 캡션이 특징입니다.',
  },
];

export default function ArchiveLab() {
  return (
    <SubPage current="archive">
      <header className="page-head">
        <div className="page-head-row">
          <h1>아카이브 시안</h1>
          <span className="tag-sample">예시</span>
        </div>
        <p>같은 예시 기록 14건과 모의 사진으로 만든 다섯 가지 구성입니다. 목록과 상세를 함께 비교해 보세요.</p>
      </header>
      <ol className="lab-hub">
        {CONCEPTS.map((c, i) => (
          <li key={c.key}>
            <Link href={`/archive-lab/${c.key}`} className="lab-hub-row">
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
