import { revalidateTag } from 'next/cache';
import { PLACES, isWordAt } from '@/components/cupnote/notes';
import { CUPNOTES_TAG, cupnotesStoreReady, saveOverride, type PlaceKey } from '@/lib/cupnotes-store';

/*
 * Saves one cup-note placement from /admin/cupnotes:
 *   POST { word, place }   place: a wheel place key, optionally "|word" to take a table word's colour
 *                          ("fruit/grape|적포도"), "ignore" (not a flavour) or "reset" (back to the table)
 * Needs the header x-admin-key equal to NOTES_ADMIN_KEY. Every page that shows cup notes reads the
 * placements through a cache tagged "cupnotes", which this expires.
 */
export async function POST(request: Request) {
  const key = process.env.NOTES_ADMIN_KEY;
  if (!key) return Response.json({ error: '관리 키가 설정되지 않았습니다 (NOTES_ADMIN_KEY).' }, { status: 503 });
  if (request.headers.get('x-admin-key') !== key) return Response.json({ error: '관리 키가 맞지 않습니다.' }, { status: 401 });
  if (!cupnotesStoreReady()) return Response.json({ error: '저장소가 연결되지 않았습니다.' }, { status: 503 });

  let body: { word?: unknown; place?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '요청 형식이 잘못되었습니다.' }, { status: 400 });
  }
  const word = typeof body.word === 'string' ? body.word.trim() : '';
  const place = typeof body.place === 'string' ? body.place : '';
  if (!/^[가-힣A-Za-z0-9 ]{1,20}$/.test(word)) return Response.json({ error: '단어가 올바르지 않습니다.' }, { status: 400 });

  if (place === 'reset') await saveOverride(word, null);
  else if (place === 'ignore') await saveOverride(word, { ignore: true });
  else {
    const [at, like] = place.split('|') as [PlaceKey, string | undefined];
    if (!PLACES.some((p) => p.key === at) || (like !== undefined && !isWordAt(at, like))) {
      return Response.json({ error: '분류가 올바르지 않습니다.' }, { status: 400 });
    }
    await saveOverride(word, like ? { place: at, like } : { place: at });
  }

  revalidateTag(CUPNOTES_TAG, { expire: 0 });
  return Response.json({ ok: true, word, place });
}
