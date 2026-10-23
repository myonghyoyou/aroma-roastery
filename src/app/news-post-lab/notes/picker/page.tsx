import type { Metadata } from 'next';
import Link from 'next/link';
import { PickerDemo } from '@/components/cupnote/PickerDemo';
import { PLACES } from '@/components/cupnote/notes';
import { SubPage } from '@/components/site/SubPage';
import '@/components/news-post-lab/lab.css';
import '@/components/news-post-lab/notes.css';
// numbered headings and reference lines, shared with the chip study
import '@/components/cupnote/chips.css';

/*
 * Searchable place picker: the plan and four designs (2026-10-23), each working on the real options
 * with the same search (components/cupnote/placeSearch.ts). Reachable by URL only.
 */
export const metadata: Metadata = { title: '분류 선택 검색 시안 | aroma roastery' };

const DESIGNS = [
  {
    key: 'a' as const, name: '검색 팝오버', ref: '참고: Linear, Slack의 선택 메뉴',
    desc: '지금처럼 버튼을 누르면 목록이 열리고, 맨 위 검색 칸에 바로 입력할 수 있습니다. 검색어가 없으면 대분류별 목록, 있으면 잘 맞는 순서의 한 줄 목록에 각 결과의 분류가 오른쪽에 붙습니다. 맨 아래 키보드 안내가 있습니다.',
  },
  {
    key: 'b' as const, name: '입력형 콤보박스', ref: '참고: GitHub 라벨 선택, Notion 속성 선택',
    desc: '선택 칸 자체가 검색 칸입니다. 눌러서 바로 입력하면 아래로 결과가 펼쳐집니다. 고른 뒤에는 칸에 색 견본과 분류가 보이고, 오른쪽 ×로 지울 수 있습니다. 단계가 가장 적습니다.',
  },
  {
    key: 'c' as const, name: '2단 탐색', ref: '참고: macOS Finder 열 보기, 디자인 도구의 글꼴 선택',
    desc: '왼쪽에 2차 분류, 오른쪽에 그 분류의 노트가 나와 휠의 구조를 따라 훑어볼 수 있습니다. 검색어를 넣으면 한 줄 결과 목록으로 바뀝니다. 무엇을 고를지 모를 때 둘러보기 좋습니다.',
  },
  {
    key: 'd' as const, name: '색 팔레트', ref: '참고: Notion 색 선택, Figma 색 견본',
    desc: '분류마다 색 견본 칸이 격자로 놓여, 이름보다 색을 보고 고릅니다. 다른 노트의 색을 빌릴 때 가장 직관적입니다. 검색하면 맞는 칸만 남고, Enter는 첫 결과를 고릅니다.',
  },
];

export default function PickerStudyPage() {
  return (
    <SubPage current="news">
      <div className="nws npl ncheck">
        <header className="page-head ncheck-head">
          <p className="npl-crumb"><Link href="/news-post-lab/notes">컵 노트 점검</Link><span aria-hidden="true">/</span><span>분류 선택 검색 시안</span></p>
          <h1>분류 선택 검색 시안</h1>
          <p>분류 선택 메뉴에서 분류와 노트를 검색할 수 있도록 하는 기획과 네 가지 디자인입니다. 네 시안 모두 실제 선택지(분류 19개, 노트 약 130개)와 같은 검색 규칙으로 동작합니다.</p>
        </header>

        <section className="ncheck-sec" aria-labelledby="pk-plan">
          <h2 id="pk-plan">검색 규칙</h2>
          <ul className="pk-rules">
            <li><b>단어</b> &lsquo;딸기&rsquo; → 딸기, 산딸기 (일치하는 부분 굵게)</li>
            <li><b>다른 표기</b> &lsquo;적포도&rsquo; → 포도, &lsquo;그린애플&rsquo; → 청사과</li>
            <li><b>초성</b> &lsquo;ㄸㄱ&rsquo; → 딸기, &lsquo;ㅂㄹ&rsquo; → 블루베리, 블랙베리, 보리 …</li>
            <li><b>철자가 달라도 초성이 같으면</b> &lsquo;초코&rsquo; → 초콜렛, &lsquo;캬라멜&rsquo; → 캐러멜 (다른 결과가 없을 때만)</li>
            <li><b>분류 이름</b> &lsquo;핵과&rsquo; → 과일 &gt; 핵과류와 그 안의 노트 전부, &lsquo;과일&rsquo; → 과일 전체</li>
            <li><b>순서</b> 완전히 같은 단어 → 앞부분 일치 → 다른 표기 → 중간 일치 → 초성 → 분류 이름. 같은 점수는 휠 순서</li>
            <li><b>결과 없음</b> &ldquo;&lsquo;그레이프&rsquo;에 맞는 분류가 없습니다&rdquo;와 다른 이름이나 초성으로 찾아보라는 안내</li>
            <li><b>키보드</b> 위아래 화살표로 이동, Enter로 선택, Esc로 닫기. 화면 낭독기는 콤보박스와 목록으로 읽음</li>
          </ul>
        </section>

        {DESIGNS.map((d) => (
          <section key={d.key} className="ncheck-sec" aria-labelledby={`pk-${d.key}`}>
            <h2 id={`pk-${d.key}`}><span className="chv-no">{d.key.toUpperCase()}</span>{d.name}</h2>
            <p className="ncheck-note">{d.desc}</p>
            <p className="chv-ref">{d.ref}</p>
            <PickerDemo design={d.key} options={PLACES} />
          </section>
        ))}
      </div>
    </SubPage>
  );
}
