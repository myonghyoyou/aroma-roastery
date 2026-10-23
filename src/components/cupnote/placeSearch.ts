import type { PlaceOption } from './notes';

/*
 * Search over the place picker's options (19 places and about 130 table words), shared by every
 * picker design. What a query matches, best first:
 *   the word itself              "딸기" -> 딸기
 *   its start                    "블루" -> 블루베리
 *   another spelling             "적포도" -> 포도, "그린애플" -> 청사과
 *   inside the word              "베리" -> 라즈베리, 블루베리 ...
 *   its 초성 (initial consonants) "ㄸㄱ" -> 딸기, "ㅂㄹ" -> 블루베리, 바닐라 ...
 *   the same 초성, spelled otherwise "초코" -> 초콜렛, "캬라멜" -> 캐러멜 (only when nothing else matched)
 *   its place or 대분류           "핵과" -> 과일 > 핵과류 and every word in it
 * Spaces and case are ignored. Ties keep the wheel's order.
 */

const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

/** "블루베리" -> "ㅂㄹㅂㄹ"; other characters stay as they are */
export function chosung(s: string): string {
  return [...s].map((ch) => {
    const c = ch.charCodeAt(0) - 0xac00;
    return c >= 0 && c < 11172 ? CHO[Math.floor(c / 588)] : ch;
  }).join('');
}

const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();
const isChosungOnly = (q: string) => /^[ㄱ-ㅎ]+$/.test(q);

/** the option's own name: the word, or the place's last segment ("과일 > 핵과류" -> "핵과류") */
export const nameOf = (o: PlaceOption) => o.word ?? o.label.split(' > ').pop()!;

export type Hit = {
  option: PlaceOption;
  score: number;
  /** where the query sits in the shown name, to highlight; none for a 초성 or context match */
  range?: [number, number];
  /** why it matched when the name itself does not show it: another spelling or the place */
  via?: string;
};

function scoreOf(o: PlaceOption, q: string, loose: boolean): Hit | null {
  const name = nameOf(o);
  const n = norm(name);
  if (n === q) return { option: o, score: 100, range: [0, name.length] };
  if (n.startsWith(q)) return { option: o, score: 80, range: [0, q.length] };
  const akaExact = (o.aka ?? []).find((a) => norm(a) === q);
  if (akaExact) return { option: o, score: 75, via: akaExact };
  const at = n.indexOf(q);
  if (at >= 0) return { option: o, score: 60, range: [at, at + q.length] };
  const aka = (o.aka ?? []).find((a) => norm(a).includes(q));
  if (aka) return { option: o, score: 50, via: aka };
  if (isChosungOnly(q)) {
    const c = chosung(n);
    if (c.startsWith(q)) return { option: o, score: 40 };
    if (c.includes(q)) return { option: o, score: 30 };
  } else if (loose && q.length >= 2 && /[가-힣]/.test(q) && chosung(n).startsWith(chosung(q))) {
    // spelled another way, same consonants: "초코" -> 초콜렛, "캬라멜" -> 캐러멜
    return { option: o, score: 25 };
  }
  // the place or the 대분류: "핵과" lists 과일 > 핵과류 and its words, "과일" every fruit
  if (norm(o.place).includes(q) || norm(o.group).includes(q)) return { option: o, score: o.word ? 10 : 20, via: o.place };
  return null;
}

/** Options matching the query, best first; every option, in order, for an empty query. */
export function searchPlaces(options: PlaceOption[], query: string): Hit[] {
  const q = norm(query);
  if (!q) return options.map((option) => ({ option, score: 0 }));
  const run = (loose: boolean) => options
    .map((o, i) => ({ hit: scoreOf(o, q, loose), i }))
    .filter((x): x is { hit: Hit; i: number } => x.hit !== null)
    .sort((a, b) => b.hit.score - a.hit.score || a.i - b.i)
    .map((x) => x.hit);
  // the loose 초성 comparison only when the letters found nothing, so it never adds noise
  const strict = run(false);
  return strict.length ? strict : run(true);
}

/** The shown name split around the highlighted range, for <mark>. */
export function splitName(name: string, range?: [number, number]): [string, string, string] {
  if (!range) return [name, '', ''];
  return [name.slice(0, range[0]), name.slice(range[0], range[1]), name.slice(range[1])];
}
