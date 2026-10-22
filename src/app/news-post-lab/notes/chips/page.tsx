import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BagLabel, ProseLine, SwatchCards, WheelMap, WheelSegments } from '@/components/cupnote/ChipVariants';
import { CupNoteTags } from '@/components/cupnote/CupNoteTag';
import { findNotes, type CupNote } from '@/components/news-post-lab/notes';
import { SubPage } from '@/components/site/SubPage';
import { readOverrides } from '@/lib/cupnotes-store';
import { getPosts, type Block } from '@/lib/content';
import '@/components/news-post-lab/lab.css';
import '@/components/news-post-lab/notes.css';

/*
 * Cup-note chip study (2026-10-23): the current tag was read as a generic UI chip ("slop"). Five
 * forms, each from something real, drawn on the same bean arrivals so they can be compared. URL only.
 */
export const metadata: Metadata = { title: '컵 노트 표시 시안 | aroma roastery' };

const captionOf = (blocks: Block[]) => blocks.map((b) => ('text' in b ? b.text : 'items' in b ? b.items.join(' ') : '')).join(' ');

// used where the live feed is not connected (local development): captions in the store's own words
const DEMO = [
  { title: '에티오피아 무제 메시나 워시드', caption: '풋한 청사과와 감귤의 시트러스한 향미, 깔끔한 카라멜 단맛' },
  { title: '콜롬비아 아나야 농장의 카스티요 공동발효', caption: '장미와 딸기 같은 향과 적당한 산도, 초콜렛 같은 단맛' },
  { title: '콜롬비아 라 카스텔라나 농장의 스파클링 그레이프', caption: '포도향이 진해서 건포도, 흑설탕 같은 단맛과 와인 같은 여운' },
];

const VARIANTS: { key: string; name: string; ref: string; desc: string; draw: (n: CupNote[]) => ReactNode }[] = [
  {
    key: '1', name: '휠 조각', ref: '참고: 커피 플레이버 휠 Ver.2의 바깥 고리, 페인트 색견본 띠',
    desc: '휠의 바깥 고리 칸처럼, 휠 색을 그대로 채운 네모 칸을 2px 틈으로 이어 붙입니다. 칸 안에 단어와 분류를 적고, 글자색은 바탕 밝기에 맞춥니다. 아이콘, 테두리, 둥근 모서리가 없습니다.',
    draw: (n) => <WheelSegments notes={n} />,
  },
  {
    key: '2', name: '한 줄 문장', ref: '참고: Coffee Collective와 Tim Wendelboe의 맛 표현 한 줄',
    desc: '로스터리들이 상품 페이지에 쓰는 것처럼 컵 노트를 큰 글씨 한 문장으로 적고, 단어마다 휠 색의 굵은 밑줄만 긋습니다. 칩 모양이 아예 없습니다.',
    draw: (n) => <ProseLine notes={n} />,
  },
  {
    key: '3', name: '원두 봉투 라벨', ref: '참고: Square Mile, Kurasu 원두 봉투의 인쇄 라벨, 와인 뒷라벨',
    desc: '작은 제목 아래 단어를 빗금으로 잇고, 그 아래 한 줄 막대를 컵 노트 수만큼 나눠 각 색으로 칠합니다. 위아래 가는 선이 라벨처럼 테를 두릅니다.',
    draw: (n) => <BagLabel notes={n} />,
  },
  {
    key: '4', name: '색견본 카드', ref: '참고: 페인트·인쇄 색견본(팬톤 칩)',
    desc: '컵 노트마다 휠 색의 네모 견본을 위에 두고, 아래에 단어와 분류를 적은 카드를 나란히 놓습니다. 색이 가장 크게 보이는 방식입니다.',
    draw: (n) => <SwatchCards notes={n} />,
  },
  {
    key: '5', name: '휠 지도', ref: '참고: 커피 플레이버 휠 Ver.2 전체 구성',
    desc: '휠의 11개 색 묶음을 작은 고리로 그려 이 원두가 닿는 곳만 밝히고, 옆에 컵 노트를 색 점과 분류와 함께 목록으로 둡니다. 휠의 어디쯤인지가 보입니다.',
    draw: (n) => <WheelMap notes={n} />,
  },
];

export default async function ChipStudy() {
  const [news, overrides] = await Promise.all([getPosts('news'), readOverrides()]);
  const live = news
    .filter((p) => p.topic === 'beans')
    .map((p) => ({ title: p.title.replace(/\s*입고$/, ''), notes: findNotes(captionOf(p.body), overrides) }))
    .filter((x) => x.notes.length >= 2)
    .slice(0, 3);
  const examples = live.length ? live : DEMO.map((d) => ({ title: d.title, notes: findNotes(d.caption, overrides) }));

  return (
    <SubPage current="news">
      <div className="nws npl ncheck chv">
        <header className="page-head ncheck-head">
          <p className="npl-crumb"><Link href="/news-post-lab/notes">컵 노트 점검</Link><span aria-hidden="true">/</span><span>표시 시안</span></p>
          <h1>컵 노트 표시 시안</h1>
          <p>
            지금 태그(색이 옅게 깔린 둥근 알약, 테두리, 로고 아이콘, 말풍선)는 흔한 화면 부품처럼 보인다는 의견이 있어,
            실제로 있는 것에서 모양을 가져온 다섯 가지를 같은 원두 소식에 그렸습니다.
          </p>
        </header>

        <section className="ncheck-sec chv-now" aria-labelledby="chv-now">
          <h2 id="chv-now">지금</h2>
          <div className="chv-examples">
            {examples.map((e) => (
              <div key={e.title} className="chv-example"><p className="chv-bean">{e.title}</p><CupNoteTags notes={e.notes} /></div>
            ))}
          </div>
        </section>

        {VARIANTS.map((v) => (
          <section key={v.key} className="ncheck-sec" aria-labelledby={`chv-${v.key}`}>
            <h2 id={`chv-${v.key}`}><span className="chv-no">{v.key}</span>{v.name}</h2>
            <p className="ncheck-note">{v.desc}</p>
            <p className="chv-ref">{v.ref}</p>
            <div className="chv-examples">
              {examples.map((e) => (
                <div key={e.title} className="chv-example"><p className="chv-bean">{e.title}</p>{v.draw(e.notes)}</div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </SubPage>
  );
}
