/* The news post concepts (A and E kept on 2026-10-21; B, C, D dropped) of the design study: shared by the hub and the "back to the list" button. */

export const NEWS_POST_CONCEPTS = [
  {
    key: 'a', name: '원두 프로필', ref: '참고: Kurasu(교토) 저널의 원두 소개 글, Stumptown 뉴스',
    desc: '제목과 한 줄 요약 바로 아래에 정보 상자(분류, 날짜, 해당 기간, 원두 이름, 구입처, 원문)를 둡니다. 그 아래 글과 사진이 이어지고, 이전과 다음 소식은 맨 위 경로 옆에 있습니다.',
  },
  {
    key: 'e', name: '이미지 넘기기', ref: '참고: 테라로사 LIBRARY의 소식지 보기, 인스타그램 여러 장 게시물',
    desc: '인스타그램에 올린 사진들을 그대로 한 장씩 넘겨 보는 화면이 중심입니다(화살표, 쪽수, 키보드 좌우 키). 옆에 제목과 글, 정보가 붙고, 아래에 이전과 다음 소식이 있습니다.',
  },
] as const;

export type NewsPostLabKey = (typeof NEWS_POST_CONCEPTS)[number]['key'];

export const NEWS_POST_NAMES: Record<string, string> = Object.fromEntries(NEWS_POST_CONCEPTS.map((c) => [c.key, c.name]));

export const newsLabHref = (key: string, slug: string) => `/news-post-lab/${key}/${slug}`;
