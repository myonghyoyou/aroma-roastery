/*
 * Cup notes, filed by the SCA Coffee Taster's Flavor Wheel (SCA and World Coffee Research, 2016),
 * the coffee trade's common vocabulary. Every word the store uses sits at its place on the wheel
 * (inner ring > middle ring), and the inner ring decides the colour, one of the logo's four leaf
 * colours in the order of its gradient:
 *   green   floral, green/vegetative            (꽃, 차, 허브)
 *   yellow  fruity > citrus, fruity > other fruit (시트러스, 사과, 복숭아, 열대 과일 ...)
 *   orange  sweet, nutty/cocoa, spices, roasted (단맛, 견과, 초콜릿, 향신료)
 *   red     fruity > berry, fruity > dried fruit, sour/fermented (베리, 말린 과일, 와인)
 * The wheel files cherry, pomegranate and grape under "other fruit", so they are yellow here too.
 * Words the wheel does not name (리치, 망고, 고구마 ...) go to the nearest place, marked "near".
 * A word the store uses that is not in this table is listed on /news-post-lab/notes/assign, where it
 * can be placed (saved in Redis, applied on top of this table).
 */

import type { NoteOverrides, PlaceKey } from '@/lib/cupnotes-store';

export type Wheel = 'floral' | 'green' | 'fruity' | 'sour' | 'sweet' | 'nutty' | 'spices' | 'roasted';
export type NoteFamily = 'green' | 'yellow' | 'orange' | 'red';

export const WHEEL_LABEL: Record<Wheel, string> = {
  floral: '꽃', green: '풋내·식물', fruity: '과일', sour: '시큼·발효', sweet: '단맛', nutty: '견과·코코아', spices: '향신료', roasted: '로스팅',
};
export const FAMILY_LABEL: Record<NoteFamily, string> = { green: '꽃과 허브', yellow: '밝은 과일', orange: '단맛과 고소함', red: '베리와 발효' };

type Entry = {
  /** the word as shown */
  word: string;
  /** other ways the store writes it */
  aka?: string[];
  wheel: Wheel;
  /** the middle ring, where there is one */
  sub?: 'berry' | 'dried' | 'other' | 'citrus' | 'tea' | 'flower' | 'brown-sugar' | 'nut' | 'cocoa' | 'alcohol' | 'sour';
  /** not named on the wheel: filed at the nearest place */
  near?: boolean;
  /** a stricter match, for words that hide inside others ("럼" in "처럼", "꿀" in "꿀꺽") */
  re?: RegExp;
};

const NOTES: Entry[] = [
  // floral
  { word: '홍차', wheel: 'floral', sub: 'tea' },
  { word: '얼그레이', wheel: 'floral', sub: 'tea' },
  { word: '녹차', wheel: 'floral', sub: 'tea', near: true },
  { word: '꽃차', wheel: 'floral', sub: 'tea', near: true },
  { word: '캐모마일', wheel: 'floral', sub: 'flower' },
  { word: '장미', aka: ['로즈'], wheel: 'floral', sub: 'flower', re: /장미|로즈(?!마리|와인)/ },
  { word: '재스민', aka: ['자스민', '쟈스민'], wheel: 'floral', sub: 'flower' },
  { word: '라벤더', wheel: 'floral', sub: 'flower', near: true },
  { word: '라일락', wheel: 'floral', sub: 'flower', near: true },
  { word: '아카시아', wheel: 'floral', sub: 'flower', near: true },
  { word: '히비스커스', wheel: 'floral', sub: 'flower', near: true },
  { word: '꽃향', aka: ['플로럴'], wheel: 'floral', sub: 'flower' },
  // green / vegetative
  { word: '허브', wheel: 'green' },
  { word: '레몬그라스', wheel: 'green', near: true },
  { word: '로즈마리', wheel: 'green', near: true },
  { word: '바질', wheel: 'green', near: true },
  { word: '유칼립투스', wheel: 'green', near: true },
  { word: '민트', aka: ['스피아민트'], wheel: 'green', near: true },
  // fruity > berry
  { word: '딸기', wheel: 'fruity', sub: 'berry' },
  { word: '라즈베리', wheel: 'fruity', sub: 'berry' },
  { word: '블루베리', wheel: 'fruity', sub: 'berry' },
  { word: '블랙베리', wheel: 'fruity', sub: 'berry' },
  { word: '크랜베리', aka: ['크렌베리'], wheel: 'fruity', sub: 'berry', near: true },
  { word: '블랙커런트', wheel: 'fruity', sub: 'berry', near: true },
  // fruity > dried fruit
  { word: '건포도', wheel: 'fruity', sub: 'dried' },
  { word: '건자두', wheel: 'fruity', sub: 'dried' },
  { word: '무화과', wheel: 'fruity', sub: 'dried', near: true },
  // fruity > other fruit
  { word: '체리', aka: ['블랙체리'], wheel: 'fruity', sub: 'other' },
  { word: '석류', wheel: 'fruity', sub: 'other' },
  { word: '포도', wheel: 'fruity', sub: 'other', re: /(?<!건|청)포도/ },
  { word: '청포도', aka: ['머스캣'], wheel: 'fruity', sub: 'other' },
  { word: '청사과', aka: ['그린애플'], wheel: 'fruity', sub: 'other' },
  { word: '사과', aka: ['적사과'], wheel: 'fruity', sub: 'other', re: /(?<!청)사과|적사과/ },
  { word: '복숭아', aka: ['백도', '황도'], wheel: 'fruity', sub: 'other' },
  { word: '배', wheel: 'fruity', sub: 'other', re: /(?<![가-힣])배(?=[,\s와과의])/ },
  { word: '파인애플', wheel: 'fruity', sub: 'other' },
  { word: '코코넛', wheel: 'fruity', sub: 'other' },
  { word: '살구', wheel: 'fruity', sub: 'other', near: true },
  { word: '자두', wheel: 'fruity', sub: 'other', near: true, re: /(?<!건)자두/ },
  { word: '망고', wheel: 'fruity', sub: 'other', near: true },
  { word: '리치', wheel: 'fruity', sub: 'other', near: true },
  { word: '패션프룻', aka: ['패션 프룻', '패션후르츠'], wheel: 'fruity', sub: 'other', near: true },
  { word: '열대과일', wheel: 'fruity', sub: 'other', near: true },
  { word: '멜론', aka: ['메론'], wheel: 'fruity', sub: 'other', near: true },
  { word: '수박', wheel: 'fruity', sub: 'other', near: true },
  { word: '파파야', wheel: 'fruity', sub: 'other', near: true },
  { word: '구아바', wheel: 'fruity', sub: 'other', near: true },
  { word: '키위', wheel: 'fruity', sub: 'other', near: true },
  // fruity > citrus
  { word: '레몬', wheel: 'fruity', sub: 'citrus', re: /레몬(?!그라스)/ },
  { word: '라임', wheel: 'fruity', sub: 'citrus' },
  { word: '오렌지', wheel: 'fruity', sub: 'citrus' },
  { word: '자몽', wheel: 'fruity', sub: 'citrus' },
  { word: '감귤', aka: ['귤'], wheel: 'fruity', sub: 'citrus', re: /감귤|(?<![가-힣])귤/ },
  { word: '한라봉', wheel: 'fruity', sub: 'citrus', near: true },
  { word: '금귤', wheel: 'fruity', sub: 'citrus', near: true },
  { word: '베르가못', wheel: 'fruity', sub: 'citrus', near: true },
  // sour / fermented
  { word: '와인', aka: ['레드와인', '로제와인', '화이트와인', '뱅쇼'], wheel: 'sour', sub: 'alcohol', re: /와인|뱅쇼/ },
  { word: '럼', wheel: 'sour', sub: 'alcohol', re: /(?<![가-힣])럼/ },
  { word: '요거트', wheel: 'sour', sub: 'sour', near: true },
  // sweet
  { word: '바닐라', wheel: 'sweet' },
  { word: '꿀', aka: ['벌꿀'], wheel: 'sweet', sub: 'brown-sugar', re: /꿀(?!꺽)/ },
  { word: '메이플', aka: ['메이플시럽'], wheel: 'sweet', sub: 'brown-sugar' },
  { word: '카라멜', aka: ['캐러멜'], wheel: 'sweet', sub: 'brown-sugar' },
  { word: '흑설탕', aka: ['머스코바도'], wheel: 'sweet', sub: 'brown-sugar' },
  { word: '황설탕', wheel: 'sweet', sub: 'brown-sugar' },
  { word: '사탕수수', wheel: 'sweet', sub: 'brown-sugar', near: true },
  { word: '조청', wheel: 'sweet', sub: 'brown-sugar', near: true },
  { word: '연유', wheel: 'sweet', near: true },
  { word: '버터', wheel: 'sweet', near: true },
  { word: '고구마', wheel: 'sweet', near: true },
  { word: '호박', wheel: 'sweet', near: true },
  // nutty / cocoa
  { word: '견과', wheel: 'nutty', sub: 'nut' },
  { word: '헤이즐넛', wheel: 'nutty', sub: 'nut' },
  { word: '아몬드', wheel: 'nutty', sub: 'nut' },
  { word: '땅콩', wheel: 'nutty', sub: 'nut' },
  { word: '캐슈넛', wheel: 'nutty', sub: 'nut', near: true },
  { word: '마카다미아', wheel: 'nutty', sub: 'nut', near: true },
  { word: '초콜렛', aka: ['초콜릿', '초콜레티'], wheel: 'nutty', sub: 'cocoa' },
  { word: '카카오', wheel: 'nutty', sub: 'cocoa' },
  // spices
  { word: '시나몬', aka: ['계피'], wheel: 'spices' },
  { word: '정향', wheel: 'spices' },
];

const WHEEL_FAMILY = (e: Entry): NoteFamily => {
  if (e.wheel === 'floral' || e.wheel === 'green') return 'green';
  if (e.wheel === 'fruity') return e.sub === 'berry' || e.sub === 'dried' ? 'red' : 'yellow';
  if (e.wheel === 'sour') return 'red';
  return 'orange';
};

export type CupNote = { word: string; family: NoteFamily; place: string };

/** Where a note sits: "과일 > 기타 과일", with "(가까운 분류)" for words the wheel does not name. */
const SUB_LABEL: Record<NonNullable<Entry['sub']>, string> = {
  berry: '베리', dried: '말린 과일', other: '기타 과일', citrus: '시트러스', tea: '차', flower: '꽃',
  'brown-sugar': '갈색 설탕', nut: '견과', cocoa: '코코아', alcohol: '알코올', sour: '신맛',
};

function placeOf(e: Entry): string {
  const sub = e.sub && SUB_LABEL[e.sub];
  return `${WHEEL_LABEL[e.wheel]}${sub ? ` > ${sub}` : ''}${e.near ? ' (가까운 분류)' : ''}`;
}

/*
 * Placements chosen on the assign page (stored in Redis, see lib/cupnotes-store.ts) on top of the
 * table: a word moved to another place, a new word placed, or a word marked "not a flavour".
 */
const PLACE_ENTRY: Record<PlaceKey, Pick<Entry, 'wheel' | 'sub'>> = {
  'floral/flower': { wheel: 'floral', sub: 'flower' }, 'floral/tea': { wheel: 'floral', sub: 'tea' }, green: { wheel: 'green' },
  'fruity/berry': { wheel: 'fruity', sub: 'berry' }, 'fruity/dried': { wheel: 'fruity', sub: 'dried' },
  'fruity/other': { wheel: 'fruity', sub: 'other' }, 'fruity/citrus': { wheel: 'fruity', sub: 'citrus' },
  'sour/alcohol': { wheel: 'sour', sub: 'alcohol' }, 'sour/sour': { wheel: 'sour', sub: 'sour' },
  sweet: { wheel: 'sweet' }, 'sweet/brown-sugar': { wheel: 'sweet', sub: 'brown-sugar' },
  'nutty/nut': { wheel: 'nutty', sub: 'nut' }, 'nutty/cocoa': { wheel: 'nutty', sub: 'cocoa' },
  spices: { wheel: 'spices' }, roasted: { wheel: 'roasted' },
};

/** The places a word can be put, in the order of the colours, for the assign page's choices. */
export const PLACES: { key: PlaceKey; label: string; family: NoteFamily }[] = (Object.keys(PLACE_ENTRY) as PlaceKey[])
  .map((key) => {
    const e = { word: '', ...PLACE_ENTRY[key] } as Entry;
    return { key, label: placeOf(e), family: WHEEL_FAMILY(e) };
  })
  .sort((a, b) => ['green', 'yellow', 'orange', 'red'].indexOf(a.family) - ['green', 'yellow', 'orange', 'red'].indexOf(b.family));

type Placed = Entry & { assigned?: boolean };

function tableWith(o: NoteOverrides = {}): Placed[] {
  const out: Placed[] = [];
  for (const e of NOTES) {
    const v = o[e.word];
    if (v && 'ignore' in v) continue;
    out.push(v && 'place' in v ? { ...e, ...PLACE_ENTRY[v.place], sub: PLACE_ENTRY[v.place].sub, near: false, assigned: true } : e);
  }
  for (const [word, v] of Object.entries(o)) {
    if ('place' in v && !NOTES.some((e) => e.word === word || e.aka?.includes(word))) out.push({ word, ...PLACE_ENTRY[v.place], assigned: true });
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
  const known = (w: string) => w in overrides || table.some((e) => [e.word, ...(e.aka ?? [])].some((k) => w.includes(k) || k.includes(w)));
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
