/* The news post concepts: A and E (kept on 2026-10-21; B, C, D dropped) and their developments A2, A3, E2, E3 of the design study: shared by the hub and the "back to the list" button. */

export const NEWS_POST_CONCEPTS = [
  {
    key: 'a', name: '원두 프로필', ref: '참고: Kurasu(교토) 저널의 원두 소개 글, Stumptown 뉴스',
    desc: '제목과 한 줄 요약 바로 아래에 정보 상자(분류, 날짜, 해당 기간, 원두 이름, 구입처, 원문)를 둡니다. 그 아래 글과 사진이 이어지고, 이전과 다음 소식은 맨 위 경로 옆에 있습니다.',
  },
  {
    key: 'a2', name: 'A 발전 1: 원두 상품 페이지', ref: '참고: Coffee Collective, Kurasu, Tim Wendelboe의 원두 상품 페이지',
    desc: '왼쪽에 원두 카드와 설명 사진, 오른쪽에 따라오는 정보 기둥입니다. 산지, 원두 이름 다음에 맛 표현을 가장 먼저 크게 두고, 산지, 농장, 품종, 가공을 조용한 표로, 농장과 가공은 큰 칸으로 한 번 더 보여줍니다. 그 아래 스토어 버튼과 매장의 글이 이어집니다.',
  },
  {
    key: 'a3', name: 'A 발전 2: 컵 노트 타일', ref: '참고: Onyx Coffee Lab의 원두 상품 페이지',
    desc: '제목 아래 맛 표현을 태그로 놓고, 산지, 농장, 품종, 가공을 값은 크게 이름은 작게 한 칸씩 보여줍니다. 원두 카드와 설명 사진은 아카이브 상세처럼 나란히 펼치고, 글과 스토어, 앞뒤 소식이 차례로 이어집니다.',
  },
  {
    key: 'e', name: '이미지 넘기기', ref: '참고: 테라로사 LIBRARY의 소식지 보기, 인스타그램 여러 장 게시물',
    desc: '인스타그램에 올린 사진들을 그대로 한 장씩 넘겨 보는 화면이 중심입니다(화살표, 쪽수, 키보드 좌우 키). 옆에 제목과 글, 정보가 붙고, 아래에 이전과 다음 소식이 있습니다.',
  },
  {
    key: 'e2', name: 'E 발전 1: 넘겨 보는 사진 + 글', ref: '참고: 테라로사 LIBRARY 보기의 화살표와 쪽수, Coffee Collective의 사진 넘기기',
    desc: '제목을 위에 두고, 사진은 한 장씩 보이되 다음 사진이 옆에 살짝 보여 넘길 수 있다는 것을 알려줍니다. 둥근 화살표는 사진 위, 쪽수는 사진 아래입니다. 글은 사진 아래 읽기 좋은 폭으로 두고, 앞뒤 소식은 사진과 떨어진 따로 줄에 둡니다.',
  },
  {
    key: 'e3', name: 'E 발전 2: 큰 사진 + 작은 사진', ref: '참고: La Cabra의 원두 상품 페이지(큰 사진과 작은 사진, 접는 정보)',
    desc: '왼쪽 큰 사진을 아래 작은 사진으로 바꿔 보고(휴대폰에서는 밀어서 넘깁니다), 오른쪽 따라오는 기둥에 산지, 제목, 맛 표현을 두고 글과 원두 정보를 접었다 펼치는 칸으로 정리합니다.',
  },
] as const;

export type NewsPostLabKey = (typeof NEWS_POST_CONCEPTS)[number]['key'];

export const NEWS_POST_NAMES: Record<string, string> = Object.fromEntries(NEWS_POST_CONCEPTS.map((c) => [c.key, c.name]));

export const newsLabHref = (key: string, slug: string) => `/news-post-lab/${key}/${slug}`;
