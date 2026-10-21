/* The five news post concepts of the design study: shared by the hub and the "back to the list" button. */

export const NEWS_POST_CONCEPTS = [
  {
    key: 'a', name: '원두 프로필', ref: '참고: Kurasu(교토) 저널의 원두 소개 글, Stumptown 뉴스',
    desc: '제목과 한 줄 요약 바로 아래에 정보 상자(분류, 날짜, 해당 기간, 원두 이름, 구입처, 원문)를 둡니다. 그 아래 글과 사진이 이어지고, 이전과 다음 소식은 맨 위 경로 옆에 있습니다.',
  },
  {
    key: 'b', name: '에디토리얼 + 스토어', ref: '참고: Square Mile(런던)의 새 원두 소개와 시즌 프로모션 글',
    desc: '날짜와 제목 아래 사진을 넓게 깔고, 요약은 굵은 첫 문단으로 둡니다. 글 끝에 이전과 다음 소식이 제목과 함께 놓이고, 원두 소식이면 맨 아래 온라인 스토어로 가는 구역이 붙습니다.',
  },
  {
    key: 'c', name: '블로그 스택', ref: '참고: Proud Mary(멜버른) 뉴스',
    desc: '경로, 제목, 날짜, 글이 한 단으로 이어지고, 글이 끝나면 공유(링크 복사, 인스타그램), 같은 분류 보기, 소식 전체 보기, 다른 소식 두 건이 차례로 쌓입니다.',
  },
  {
    key: 'd', name: '공지 게시판', ref: '참고: 커피리브레, 프릳츠의 게시판형 공지',
    desc: '국내 카페에 익숙한 게시판 형식입니다. 제목 줄과 분류, 날짜, 기간을 담은 표 아래 글과 사진이 오고, 맨 아래 이전 글과 다음 글 목록과 목록 버튼이 한 묶음으로 있습니다.',
  },
  {
    key: 'e', name: '이미지 넘기기', ref: '참고: 테라로사 LIBRARY의 소식지 보기, 인스타그램 여러 장 게시물',
    desc: '인스타그램에 올린 사진들을 그대로 한 장씩 넘겨 보는 화면이 중심입니다(화살표, 쪽수, 키보드 좌우 키). 옆에 제목과 글, 정보가 붙고, 아래에 이전과 다음 소식이 있습니다.',
  },
] as const;

export type NewsPostLabKey = (typeof NEWS_POST_CONCEPTS)[number]['key'];

export const NEWS_POST_NAMES: Record<string, string> = Object.fromEntries(NEWS_POST_CONCEPTS.map((c) => [c.key, c.name]));

export const newsLabHref = (key: string, slug: string) => `/news-post-lab/${key}/${slug}`;
