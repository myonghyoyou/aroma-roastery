/*
 * A bean's profile read from its arrival post. The store writes every arrival the same way:
 * "[산지] [농장명] 농장의 [품종] [가공] 커피가 입고됐습니다. [맛 표현] ...", so the title (the bean's
 * name) gives the origin, farm, variety and process, and the caption's tasting words give the cup
 * notes. Anything not found is left out; nothing is guessed.
 */

const ORIGINS = ['에티오피아', '케냐', '르완다', '부룬디', '콜롬비아', '과테말라', '코스타리카', '파나마', '브라질', '온두라스', '엘살바도르', '니카라과', '페루', '볼리비아', '에콰도르', '멕시코', '인도네시아', '예멘'];
// longest first, so "블랙허니" wins over "허니" and "옐로우 버번" over "버번"
const PROCESSES = ['더블 무산소', '무산소 발효', '무산소', '공동발효', '블랙허니', '화이트허니', '레드허니', '허니', '워시드', '내추럴', '펠라네그라'].sort((a, b) => b.length - a.length);
const VARIETIES = ['옐로우 카투라', '옐로우 버번', '레드 버번', '핑크 버번', '아히 버번', '카스티요', '카투라', '카투아이', '게이샤', '게샤', '버번', '티피카', '파카마라', '파라이네마', '시드라', '74158', 'SL28', 'SL34'].sort((a, b) => b.length - a.length);
// tasting words the store uses, as they appear in its captions
const NOTES = ['청사과', '사과', '감귤', '한라봉', '오렌지', '자몽', '레몬그라스', '레몬', '라임', '복숭아', '살구', '자두', '건자두', '체리', '딸기', '라즈베리', '블루베리', '블랙베리', '크랜베리', '석류', '포도', '청포도', '건포도', '리치', '망고', '파인애플', '패션프룻', '열대과일', '장미', '재스민', '자스민', '라벤더', '아카시아', '꽃향', '바닐라', '카라멜', '초콜렛', '흑설탕', '꿀', '메이플', '견과', '헤이즐넛', '아몬드', '홍차', '얼그레이', '와인', '허브'];
// '럼' is left out: it also matches "처럼", which nearly every caption uses

/*
 * Each cup note belongs to one of four families, and each family wears one of the logo's four leaf
 * colours in the order of its gradient: floral and herbal green, bright fruit yellow, sweetness
 * orange, red fruit and wine red. The colours then say something (where in the cup a note sits)
 * instead of decorating.
 */
export type NoteFamily = 'floral' | 'bright' | 'sweet' | 'red';
const FAMILY: Record<NoteFamily, string[]> = {
  floral: ['장미', '재스민', '자스민', '라벤더', '아카시아', '꽃향', '허브', '레몬그라스', '홍차', '얼그레이'],
  bright: ['청사과', '사과', '감귤', '한라봉', '오렌지', '자몽', '레몬', '라임', '복숭아', '살구', '망고', '파인애플', '패션프룻', '열대과일', '리치', '청포도'],
  sweet: ['바닐라', '카라멜', '초콜렛', '흑설탕', '꿀', '메이플', '견과', '헤이즐넛', '아몬드'],
  red: ['자두', '건자두', '체리', '딸기', '라즈베리', '블루베리', '블랙베리', '크랜베리', '석류', '포도', '건포도', '와인'],
};
export const NOTE_FAMILY_LABEL: Record<NoteFamily, string> = { floral: '꽃과 허브', bright: '밝은 과일', sweet: '단맛', red: '붉은 과일' };
export function noteFamily(note: string): NoteFamily {
  return (Object.keys(FAMILY) as NoteFamily[]).find((f) => FAMILY[f].includes(note)) ?? 'sweet';
}

export type BeanProfile = {
  name: string;
  /** what is left of the name once origin, farm, variety and process are read: the lot's own name */
  lot?: string;
  origin?: string;
  farm?: string;
  variety?: string;
  process?: string;
  notes: string[];
  /** where it can be bought, from the caption's own words */
  store: 'online' | 'store-only' | 'unknown';
};

export function beanProfile(title: string, caption: string): BeanProfile {
  // "X 입고" from an arrival caption, or a hand-written "원두 입고 안내: X"
  const name = title.replace(/^원두\s*입고\s*(?:안내)?\s*:\s*/, '').replace(/\s*입고$/, '').trim();
  let rest = ` ${name} `;
  const take = (list: string[]) => {
    const hit = list.find((w) => rest.includes(` ${w} `) || rest.includes(` ${w}`) && rest.trimEnd().endsWith(w));
    if (hit) rest = rest.replace(hit, ' ');
    return hit;
  };
  const origin = ORIGINS.find((o) => name.startsWith(o)) ?? ORIGINS.find((o) => name.includes(o));
  if (origin) rest = rest.replace(origin, ' ');
  const farm = name.match(/(?:^|\s)([^\s]+(?:\s[^\s]+){0,2})\s*농장/)?.[1]?.replace(origin ?? '', '').trim() || undefined;
  if (farm) rest = rest.replace(new RegExp(`${farm}\\s*농장의?`), ' ');
  const process = take(PROCESSES);
  const variety = take(VARIETIES);
  const lot = rest.replace(/\s+/g, ' ').trim() || undefined;

  // notes in the order the caption names them, each once, a more specific word over its part
  const found = NOTES.map((n) => ({ n, at: caption.indexOf(n) })).filter((x) => x.at >= 0);
  const notes = found
    .filter((x) => !found.some((y) => y !== x && y.n.includes(x.n) && y.at <= x.at && x.at < y.at + y.n.length))
    .sort((a, b) => a.at - b.at)
    .map((x) => x.n)
    .slice(0, 6);

  const store = /스토어\s*판매\s*계획은\s*없|매장에서만/.test(caption) ? 'store-only' : /온라인\s*스토어|스토어에서/.test(caption) ? 'online' : 'unknown';
  return { name, lot, origin, farm, variety, process, notes, store };
}
