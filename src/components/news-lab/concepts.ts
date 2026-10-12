/* The five news concepts of the design study: shared by the hub and the "back to the list" button. */

export const NEWS_LAB_CONCEPTS = [
  {
    key: 'a', name: '공지 게시판', ref: '참고: 국내 로스터리와 프랜차이즈 커피 브랜드의 공지사항 게시판',
    desc: '번호, 분류, 제목, 날짜가 한 줄씩 놓인 익숙한 게시판입니다. 고정 공지가 맨 위에 있고 분류 탭과 검색으로 찾습니다. 상세는 글 아래 이전 글과 다음 글 목록이 이어집니다.',
  },
  {
    key: 'b', name: '운영 달력', ref: '참고: 서점과 호텔의 이벤트 캘린더, 매장 운영 일정표',
    desc: '한 달 달력에 휴무일과 행사일이 표시되고, 그 달의 소식이 아래에 이어집니다. 달을 넘겨 지난 소식을 봅니다. 상세는 해당 날짜를 작은 달력 위에 짚어 보여줍니다.',
  },
  {
    key: 'c', name: '카드 피드', ref: '참고: 커피 브랜드의 새소식 카드 목록, 인스타그램 그리드',
    desc: '소식마다 카드 한 장입니다. 사진이 있는 소식은 사진으로, 없는 소식은 분류 색 면 위의 글로 보여줍니다. 상세는 위쪽에 사진 또는 색 면이 크게 놓입니다.',
  },
  {
    key: 'd', name: '타임라인', ref: '참고: 브랜드 뉴스룸, 서비스 업데이트 기록(체인지로그)',
    desc: '세로선을 따라 달별로 소식이 쌓이고, 목록에서 바로 본문을 펼쳐 읽습니다. 상세는 뉴스룸 기사처럼 요약 문단, 정보, 링크 복사가 있습니다.',
  },
  {
    key: 'e', name: '매장 알림판', ref: '참고: 동네 가게의 손글씨 공지, 매장 안내 배너',
    desc: '맨 위에 지금 영업 중인지와 다가오는 휴무, 행사가 한눈에 보이고, 아래로 소식이 이어집니다. 상세는 매장이 손님께 보내는 편지처럼 구성합니다.',
  },
] as const;

export const NEWS_LAB_NAMES: Record<string, string> = Object.fromEntries(NEWS_LAB_CONCEPTS.map((c) => [c.key, c.name]));
