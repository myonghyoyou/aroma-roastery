/*
 * Cup notes, filed by the Coffee Flavor Wheel Ver. 2 (Manufact Coffee, 2026.01), a Korean wheel
 * the client chose on 2026-10-22 (data/images/플레이버 휠 ver.2 가로.jpg). Every word the store uses
 * sits where that wheel puts it (대분류 > 2차 분류), and its colour is the wheel's own, sampled from
 * the image: the 대분류's colour, except fruit, which takes its 2차 분류's colour (귤, 열대과일,
 * 베리, 포도, 핵과류), since fruit is where the store's notes sit most.
 * (Before: the SCA wheel, and before that the logo's four leaf colours, which put grape in yellow.)
 * Words the wheel does not name (한라봉, 금귤, 파파야 ...) go to the nearest place, marked "near".
 * A word the store uses that is not in this table is listed on /news-post-lab/notes/assign, where it
 * can be placed (saved in Redis, applied on top of this table).
 */

import type { NoteOverrides, PlaceKey } from '@/lib/cupnotes-store';

export type Wheel = 'fruit' | 'flowerTea' | 'herbVeg' | 'nutty' | 'sweet' | 'fermented' | 'other';
type Sub =
  | 'citrus' | 'tropical' | 'berry' | 'grape' | 'stone'
  | 'tea' | 'flower'
  | 'spice' | 'herb' | 'veg'
  | 'grain' | 'nut'
  | 'sugar' | 'milk' | 'cacao'
  | 'alcohol'
  | 'chemical' | 'wood' | 'smoky';

export const WHEEL_LABEL: Record<Wheel, string> = {
  fruit: '과일', flowerTea: '꽃과 차', herbVeg: '허브와 채소', nutty: '고소한', sweet: '단맛', fermented: '발효된', other: '그 밖에',
};
const SUB_LABEL: Record<Sub, string> = {
  citrus: '귤', tropical: '열대과일', berry: '베리', grape: '포도', stone: '핵과류',
  tea: '차', flower: '꽃',
  spice: '향신료', herb: '풀', veg: '채소',
  grain: '곡류', nut: '견과',
  sugar: '사탕수수', milk: '밀크', cacao: '카카오',
  alcohol: '알코올/발효',
  chemical: '화학', wood: '나무/흙', smoky: '그을린',
};

/** the colour group of a note: the wheel's 대분류, split into its 2차 분류 for fruit */
export type NoteFamily = 'citrus' | 'tropical' | 'berry' | 'grape' | 'stone' | 'flowerTea' | 'herbVeg' | 'nutty' | 'sweet' | 'fermented' | 'other';
/** in the wheel's own order, clockwise from fruit */
export const FAMILY_ORDER: NoteFamily[] = ['citrus', 'tropical', 'berry', 'grape', 'stone', 'flowerTea', 'herbVeg', 'nutty', 'sweet', 'fermented', 'other'];
export const FAMILY_LABEL: Record<NoteFamily, string> = {
  citrus: '과일 > 귤', tropical: '과일 > 열대과일', berry: '과일 > 베리', grape: '과일 > 포도', stone: '과일 > 핵과류',
  flowerTea: '꽃과 차', herbVeg: '허브와 채소', nutty: '고소한', sweet: '단맛', fermented: '발효된', other: '그 밖에',
};
// sampled from the wheel image (median of a patch inside each ring segment)
export const FAMILY_COLOR: Record<NoteFamily, string> = {
  citrus: '#FC940D', tropical: '#CDB700', berry: '#7B04D0', grape: '#2700A5', stone: '#F79E2A',
  flowerTea: '#FCE051', herbVeg: '#1D9C00', nutty: '#A77651', sweet: '#25100F', fermented: '#F7FBD6', other: '#060808',
};

type Entry = {
  /** the word as shown */
  word: string;
  /** other ways the store writes it */
  aka?: string[];
  wheel: Wheel;
  sub: Sub;
  /** not named on the wheel: filed at the nearest place */
  near?: boolean;
  /** a stricter match, for words that hide inside others ("럼" in "처럼", "꿀" in "꿀꺽") */
  re?: RegExp;
};

const f = (sub: Sub) => ({ wheel: 'fruit' as const, sub });

const NOTES: Entry[] = [
  // 과일 > 귤
  { word: '감귤', aka: ['귤'], ...f('citrus'), re: /감귤|(?<![가-힣])귤/ },
  { word: '오렌지', ...f('citrus') },
  { word: '라임', ...f('citrus') },
  { word: '레몬', ...f('citrus'), re: /레몬(?!그라스)/ },
  { word: '베르가못', ...f('citrus') },
  { word: '자몽', ...f('citrus') },
  { word: '한라봉', ...f('citrus'), near: true },
  { word: '금귤', ...f('citrus'), near: true },
  { word: '유자', ...f('citrus'), near: true },
  // 과일 > 열대과일
  { word: '파인애플', ...f('tropical') },
  { word: '리치', ...f('tropical') },
  { word: '키위', ...f('tropical') },
  { word: '바나나', ...f('tropical') },
  { word: '코코넛', ...f('tropical') },
  { word: '망고', ...f('tropical') },
  { word: '패션프룻', aka: ['패션후르츠', '패션 프룻'], ...f('tropical') },
  { word: '석류', ...f('tropical') },
  { word: '용과', ...f('tropical') },
  { word: '수박', ...f('tropical') },
  { word: '멜론', aka: ['메론'], ...f('tropical') },
  { word: '열대과일', ...f('tropical') },
  { word: '파파야', ...f('tropical'), near: true },
  { word: '구아바', ...f('tropical'), near: true },
  // 과일 > 베리
  { word: '딸기', ...f('berry') },
  { word: '산딸기', ...f('berry') },
  { word: '라즈베리', ...f('berry') },
  { word: '블루베리', ...f('berry') },
  { word: '블랙베리', ...f('berry') },
  { word: '크랜베리', aka: ['크렌베리'], ...f('berry') },
  { word: '블랙커런트', ...f('berry'), near: true },
  // 과일 > 포도
  { word: '청포도', aka: ['샤인머스캣', '머스캣'], ...f('grape') },
  { word: '포도', aka: ['적포도'], ...f('grape'), re: /(?<!건|청)포도/ },
  { word: '건포도', ...f('grape') },
  // 과일 > 핵과류 (the wheel files apple, pear, fig and persimmon here too)
  { word: '복숭아', aka: ['백도', '천도', '황도'], ...f('stone') },
  { word: '무화과', ...f('stone') },
  { word: '청사과', aka: ['그린애플'], ...f('stone') },
  { word: '사과', aka: ['적사과'], ...f('stone'), re: /(?<!청)사과|적사과/ },
  { word: '배', ...f('stone'), re: /(?<![가-힣])배(?=[,\s와과의])/ },
  { word: '감', ...f('stone'), re: /(?<![가-힣])감(?=[,\s와과의])/ },
  { word: '자두', ...f('stone'), re: /(?<!건)자두/ },
  { word: '건자두', ...f('stone') },
  { word: '살구', ...f('stone') },
  { word: '체리', aka: ['블랙체리'], ...f('stone') },

  // 꽃과 차 > 차
  { word: '루이보스', wheel: 'flowerTea', sub: 'tea' },
  { word: '우롱차', aka: ['우롱'], wheel: 'flowerTea', sub: 'tea' },
  { word: '국화차', wheel: 'flowerTea', sub: 'tea' },
  { word: '백차', wheel: 'flowerTea', sub: 'tea' },
  { word: '녹차', wheel: 'flowerTea', sub: 'tea' },
  { word: '홍차', wheel: 'flowerTea', sub: 'tea' },
  { word: '얼그레이', wheel: 'flowerTea', sub: 'tea', near: true },
  { word: '꽃차', wheel: 'flowerTea', sub: 'tea', near: true },
  // 꽃과 차 > 꽃
  { word: '장미', aka: ['로즈'], wheel: 'flowerTea', sub: 'flower', re: /장미|로즈(?!마리|와인)/ },
  { word: '히비스커스', wheel: 'flowerTea', sub: 'flower' },
  { word: '재스민', aka: ['자스민', '쟈스민'], wheel: 'flowerTea', sub: 'flower' },
  { word: '꽃향', aka: ['플로럴'], wheel: 'flowerTea', sub: 'flower', near: true },
  { word: '라일락', wheel: 'flowerTea', sub: 'flower', near: true },

  // 허브와 채소 > 향신료
  { word: '고수', wheel: 'herbVeg', sub: 'spice' },
  { word: '카레', wheel: 'herbVeg', sub: 'spice' },
  { word: '바닐라', wheel: 'herbVeg', sub: 'spice' },
  { word: '깨', wheel: 'herbVeg', sub: 'spice', re: /(?<![가-힣])깨(?![가-힣])/ },
  { word: '생강', wheel: 'herbVeg', sub: 'spice' },
  { word: '후추', wheel: 'herbVeg', sub: 'spice' },
  { word: '시나몬', aka: ['계피'], wheel: 'herbVeg', sub: 'spice' },
  { word: '팔각', wheel: 'herbVeg', sub: 'spice' },
  { word: '정향', wheel: 'herbVeg', sub: 'spice', near: true },
  // 허브와 채소 > 풀 (lavender, acacia and chamomile are here on this wheel, not under flowers)
  { word: '레몬그라스', wheel: 'herbVeg', sub: 'herb' },
  { word: '아카시아', wheel: 'herbVeg', sub: 'herb' },
  { word: '라벤더', wheel: 'herbVeg', sub: 'herb' },
  { word: '캐모마일', wheel: 'herbVeg', sub: 'herb' },
  { word: '로즈마리', wheel: 'herbVeg', sub: 'herb' },
  { word: '바질', wheel: 'herbVeg', sub: 'herb' },
  { word: '페퍼민트', aka: ['민트', '스피아민트'], wheel: 'herbVeg', sub: 'herb' },
  { word: '애플민트', wheel: 'herbVeg', sub: 'herb' },
  { word: '허브', wheel: 'herbVeg', sub: 'herb', near: true },
  { word: '유칼립투스', wheel: 'herbVeg', sub: 'herb', near: true },
  // 허브와 채소 > 채소
  { word: '인삼', wheel: 'herbVeg', sub: 'veg' },
  { word: '건초', wheel: 'herbVeg', sub: 'veg' },
  { word: '토마토', wheel: 'herbVeg', sub: 'veg' },
  { word: '오이', wheel: 'herbVeg', sub: 'veg' },
  { word: '파프리카', wheel: 'herbVeg', sub: 'veg' },

  // 고소한 > 곡류
  { word: '현미', wheel: 'nutty', sub: 'grain' },
  { word: '보리', wheel: 'nutty', sub: 'grain' },
  { word: '쌀', wheel: 'nutty', sub: 'grain', re: /(?<![가-힣])쌀(?![가-힣])/ },
  { word: '옥수수', wheel: 'nutty', sub: 'grain' },
  { word: '감자', wheel: 'nutty', sub: 'grain' },
  { word: '시리얼', wheel: 'nutty', sub: 'grain' },
  { word: '누룽지', wheel: 'nutty', sub: 'grain' },
  { word: '숭늉', wheel: 'nutty', sub: 'grain' },
  { word: '토스트', wheel: 'nutty', sub: 'grain' },
  { word: '빵', wheel: 'nutty', sub: 'grain', re: /(?<![가-힣])빵/ },
  { word: '통밀', wheel: 'nutty', sub: 'grain' },
  { word: '팝콘', wheel: 'nutty', sub: 'grain' },
  { word: '고구마', wheel: 'nutty', sub: 'grain' },
  { word: '호박', wheel: 'nutty', sub: 'grain', near: true },
  // 고소한 > 견과
  { word: '견과', wheel: 'nutty', sub: 'nut' },
  { word: '땅콩', wheel: 'nutty', sub: 'nut' },
  { word: '호두', wheel: 'nutty', sub: 'nut' },
  { word: '아몬드', wheel: 'nutty', sub: 'nut' },
  { word: '헤이즐넛', wheel: 'nutty', sub: 'nut' },
  { word: '피칸', wheel: 'nutty', sub: 'nut' },
  { word: '마카다미아', wheel: 'nutty', sub: 'nut' },
  { word: '피스타치오', wheel: 'nutty', sub: 'nut' },
  { word: '밤', wheel: 'nutty', sub: 'nut', re: /(?<![가-힣])밤(?=[,\s이과와의])/ },
  { word: '캐슈넛', wheel: 'nutty', sub: 'nut' },

  // 단맛 > 사탕수수 (설탕, 시럽, 캐러멜 ...)
  { word: '사탕수수', wheel: 'sweet', sub: 'sugar' },
  { word: '백설탕', wheel: 'sweet', sub: 'sugar' },
  { word: '황설탕', wheel: 'sweet', sub: 'sugar' },
  { word: '흑설탕', aka: ['머스코바도'], wheel: 'sweet', sub: 'sugar' },
  { word: '당밀', wheel: 'sweet', sub: 'sugar' },
  { word: '메이플시럽', aka: ['메이플'], wheel: 'sweet', sub: 'sugar' },
  { word: '꿀', aka: ['벌꿀'], wheel: 'sweet', sub: 'sugar', re: /꿀(?!꺽)/ },
  { word: '캐러멜', aka: ['카라멜'], wheel: 'sweet', sub: 'sugar' },
  { word: '토피', wheel: 'sweet', sub: 'sugar' },
  { word: '달고나', wheel: 'sweet', sub: 'sugar' },
  { word: '조청', wheel: 'sweet', sub: 'sugar', near: true },
  // 단맛 > 밀크
  { word: '크림', wheel: 'sweet', sub: 'milk', re: /(?<!아이스)크림/ },
  { word: '버터', wheel: 'sweet', sub: 'milk' },
  { word: '연유', wheel: 'sweet', sub: 'milk', near: true },
  // 단맛 > 카카오
  { word: '초콜렛', aka: ['초콜릿', '초콜레티'], wheel: 'sweet', sub: 'cacao' },
  { word: '밀크초콜렛', aka: ['밀크초콜릿'], wheel: 'sweet', sub: 'cacao' },
  { word: '다크초콜렛', aka: ['다크초콜릿'], wheel: 'sweet', sub: 'cacao' },
  { word: '코코아', wheel: 'sweet', sub: 'cacao' },
  { word: '카카오', wheel: 'sweet', sub: 'cacao' },

  // 발효된 > 알코올/발효
  { word: '위스키', wheel: 'fermented', sub: 'alcohol' },
  { word: '와인', aka: ['레드와인', '화이트와인', '로제와인', '뱅쇼'], wheel: 'fermented', sub: 'alcohol', re: /와인|뱅쇼/ },
  { word: '샴페인', wheel: 'fermented', sub: 'alcohol' },
  { word: '럼', wheel: 'fermented', sub: 'alcohol', near: true, re: /(?<![가-힣])럼/ },
  { word: '요거트', wheel: 'fermented', sub: 'alcohol' },
  { word: '치즈', wheel: 'fermented', sub: 'alcohol' },

  // 그 밖에
  { word: '흙', wheel: 'other', sub: 'wood', re: /(?<![가-힣])흙/ },
  { word: '나무', wheel: 'other', sub: 'wood', re: /(?<![가-힣])나무(?=\s?(?:향|같은|느낌))/ },
  { word: '스모키', aka: ['스모크'], wheel: 'other', sub: 'smoky' },
];

const WHEEL_FAMILY = (e: { wheel: Wheel; sub: Sub }): NoteFamily =>
  e.wheel === 'fruit' ? (e.sub as Extract<NoteFamily, 'citrus' | 'tropical' | 'berry' | 'grape' | 'stone'>) : e.wheel;

export type CupNote = { word: string; family: NoteFamily; place: string };

/** Where a note sits: "과일 > 핵과류", with "(가까운 분류)" for words the wheel does not name. */
function placeOf(e: { wheel: Wheel; sub: Sub; near?: boolean }): string {
  return `${WHEEL_LABEL[e.wheel]} > ${SUB_LABEL[e.sub]}${e.near ? ' (가까운 분류)' : ''}`;
}

/*
 * Placements chosen on the assign page (stored in Redis, see lib/cupnotes-store.ts) on top of the
 * table: a word moved to another place, a new word placed, or a word marked "not a flavour".
 */
const PLACE_ENTRY: Record<PlaceKey, { wheel: Wheel; sub: Sub }> = {
  'fruit/citrus': f('citrus'), 'fruit/tropical': f('tropical'), 'fruit/berry': f('berry'), 'fruit/grape': f('grape'), 'fruit/stone': f('stone'),
  'flowerTea/tea': { wheel: 'flowerTea', sub: 'tea' }, 'flowerTea/flower': { wheel: 'flowerTea', sub: 'flower' },
  'herbVeg/spice': { wheel: 'herbVeg', sub: 'spice' }, 'herbVeg/herb': { wheel: 'herbVeg', sub: 'herb' }, 'herbVeg/veg': { wheel: 'herbVeg', sub: 'veg' },
  'nutty/grain': { wheel: 'nutty', sub: 'grain' }, 'nutty/nut': { wheel: 'nutty', sub: 'nut' },
  'sweet/sugar': { wheel: 'sweet', sub: 'sugar' }, 'sweet/milk': { wheel: 'sweet', sub: 'milk' }, 'sweet/cacao': { wheel: 'sweet', sub: 'cacao' },
  'fermented/alcohol': { wheel: 'fermented', sub: 'alcohol' },
  'other/chemical': { wheel: 'other', sub: 'chemical' }, 'other/wood': { wheel: 'other', sub: 'wood' }, 'other/smoky': { wheel: 'other', sub: 'smoky' },
};

/** The places a word can be put, in the wheel's order, for the assign page's choices. */
export const PLACES: { key: PlaceKey; label: string; family: NoteFamily }[] = (Object.keys(PLACE_ENTRY) as PlaceKey[]).map((key) => ({
  key, label: placeOf(PLACE_ENTRY[key]), family: WHEEL_FAMILY(PLACE_ENTRY[key]),
}));

type Placed = Entry & { assigned?: boolean };

function tableWith(o: NoteOverrides = {}): Placed[] {
  const out: Placed[] = [];
  for (const e of NOTES) {
    const v = o[e.word];
    if (v && 'ignore' in v) continue;
    out.push(v && 'place' in v && PLACE_ENTRY[v.place] ? { ...e, ...PLACE_ENTRY[v.place], near: false, assigned: true } : e);
  }
  for (const [word, v] of Object.entries(o)) {
    if ('place' in v && PLACE_ENTRY[v.place] && !NOTES.some((e) => e.word === word || e.aka?.includes(word))) out.push({ word, ...PLACE_ENTRY[v.place], assigned: true });
  }
  return out;
}

const placeLabel = (e: Placed) => `${placeOf(e)}${e.assigned ? ' (직접 배치)' : ''}`;

/** The caption's cup notes, in the order it names them, each once, at most six. */
export function findNotes(caption: string, overrides?: NoteOverrides): CupNote[] {
  const hits: { e: Placed; at: number; len: number }[] = [];
  for (const e of tableWith(overrides)) {
    const re = e.re ?? new RegExp([e.word, ...(e.aka ?? [])].sort((a, b) => b.length - a.length).join('|'));
    const m = re.exec(caption);
    if (m) hits.push({ e, at: m.index, len: m[0].length });
  }
  // a longer word wins over one inside it ("레몬그라스" over "레몬", "블랙체리" kept as "체리")
  const kept = hits.filter((h) => !hits.some((o) => o !== h && o.len > h.len && o.at <= h.at && h.at + h.len <= o.at + o.len));
  return kept.sort((a, b) => a.at - b.at).slice(0, 6).map(({ e }) => ({ word: e.word, family: WHEEL_FAMILY(e), place: placeLabel(e) }));
}

// words that stand before 향, 같은, 처럼 in a caption but are not flavours
const NOT_FLAVOUR = new Set(['단', '단맛', '과일', '과일향', '꽃', '과', '느낌', '시럽', '쥬스', '주스', '커피', '것', '맛', '향', '산미', '여운', '질감', '발효', '발효가', '술', '젤리', '칵테일', '캔디', '아이스크림', '과실', '과일류', '베리', '베리류', '감귤류', '견과류', '시트러스', '플로럴', '그리니시', '쿰쿰', '음료', '이름', '커피를', '커피의', '아로마', '양천', '탭머신', '이름이']);

/**
 * Words a caption seems to use as flavours ("X 같은", "X 향", "X처럼") that neither the table nor a
 * saved placement knows: the list to place, on the assign page.
 */
export function unknownFlavours(caption: string, overrides: NoteOverrides = {}): string[] {
  const table = tableWith(overrides);
  const known = (w: string) => w in overrides || table.some((e) => [e.word, ...(e.aka ?? [])].some((k) => (k.length > 1 && w.includes(k)) || k.includes(w)));
  const out = new Set<string>();
  for (const m of caption.matchAll(/([가-힣]{2,7})(?:\s?같은|\s?같이|\s?향(?:미|이|과|을|의)?|처럼)/g)) {
    // a particle is dropped ("포도의" -> "포도"); 이 is kept, it ends nouns like 알맹이, 말랭이
    const w = m[1].replace(/(?:의|와|과|가|한|은|는)$/, '');
    // a flavour is a noun: words ending like a verb or an adjective ("놀라운", "이런", "나서") are left out
    if (w.length < 2 || NOT_FLAVOUR.has(w) || /[운인된는런서을를던면고게적지했]$/.test(w) || /^(?:이런|그런|저런|넘치|또렷|오묘|두고|느꼈|달라|마시)/.test(w)
      || /(?:하|되|있|없|좋|높|낮|짙|옅|강|약|선명|깔끔|부드러|새콤|달콤|쌉싸름|고소|향긋|복합|연상|떠오르|느껴)/.test(w) || known(w)) continue;
    out.add(w);
  }
  return [...out];
}

/** The whole table with the saved placements, for the check and assign pages. */
export function noteTable(overrides?: NoteOverrides): (CupNote & { aka: string[]; assigned: boolean })[] {
  return tableWith(overrides).map((e) => ({ word: e.word, aka: e.aka ?? [], family: WHEEL_FAMILY(e), place: placeLabel(e), assigned: Boolean(e.assigned) }));
}

/** Words marked "not a flavour" on the assign page. */
export const ignoredWords = (o: NoteOverrides = {}) => Object.entries(o).filter(([, v]) => 'ignore' in v).map(([w]) => w);
