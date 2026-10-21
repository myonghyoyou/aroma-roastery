/* The five archive post concepts of the design study: shared by the hub and the "back to the list" button. */

export const POST_LAB_CONCEPTS = [
  {
    key: 'a', name: '게시물 분할', ref: '참고: 인스타그램 웹의 게시물 보기, Are.na 블록 상세',
    desc: '왼쪽에 사진이 크게, 오른쪽에 날짜와 글, 이전과 다음, 인스타그램 링크가 한 기둥으로 모입니다. 글 기둥은 스크롤해도 따라옵니다. 이동 버튼이 모두 위쪽 한 줄에 있습니다.',
  },
  {
    key: 'b', name: '카드 펼침면', ref: '참고: Kinfolk, Cereal 매거진의 펼침면, 매장의 실물 원두 카드',
    desc: '원두 카드와 설명을 펼친 책처럼 같은 높이로 나란히 놓고, 아래에 날짜와 제목을 짧게 답니다. 이전, 목록, 다음이 맨 아래 한 줄에 있습니다.',
  },
  {
    key: 'c', name: '원두 카드 상세', ref: '참고: Onyx Coffee Lab, Aesop의 상품 상세',
    desc: '큰 사진 하나와 그 아래 작은 사진들로 바꿔 보고, 오른쪽에 날짜, 사진 수, 원문 같은 정보가 표처럼 정리됩니다. 아래에는 앞뒤 기록이 작은 사진으로 이어집니다.',
  },
  {
    key: 'd', name: '사진 뷰어', ref: '참고: Unsplash 사진 페이지, Google Arts & Culture 뷰어',
    desc: '화면 전체가 사진을 보는 자리입니다. 위에 닫기와 날짜, 양옆 화살표로 앞뒤 기록을 넘기고(키보드 좌우 키도 됩니다), 글은 아래에 한 줄로 두었다가 펼칩니다.',
  },
  {
    key: 'e', name: '기록 노트', ref: '참고: 브런치와 Kurasu 저널의 한 단 읽기, 필름 밀착 인화지',
    desc: '가운데 한 단에 사진, 글, 이동이 위에서 아래로 차례로 놓입니다. 맨 아래 앞뒤 기록이 필름처럼 한 줄로 이어져 지금 위치를 보여주고 바로 넘어갑니다.',
  },
] as const;

export type PostLabKey = (typeof POST_LAB_CONCEPTS)[number]['key'];

export const POST_LAB_NAMES: Record<string, string> = Object.fromEntries(POST_LAB_CONCEPTS.map((c) => [c.key, c.name]));

export const labHref = (key: string, slug: string) => `/archive-post-lab/${key}/${slug}`;
