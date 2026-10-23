import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { exchangeCode, page, redirectUri, STATE_COOKIE } from '@/lib/instagram-auth';
import { saveToken } from '@/lib/instagram-token';
import { INSTAGRAM_TAG } from '@/lib/instagram';

/* Where Instagram sends the store owner back after "allow" (or "cancel"). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value;
  jar.delete({ name: STATE_COOKIE, path: '/api/instagram' });

  if (url.searchParams.get('error')) {
    return page('연결하지 않았습니다', '허용하지 않아 연결되지 않았습니다. 연결 링크를 다시 열어 주세요.');
  }
  // Instagram appends "#_" to the code; the fragment never reaches the server, but strip it anyway
  const code = url.searchParams.get('code')?.replace(/#_$/, '');
  if (!code || !expected || url.searchParams.get('state') !== expected) {
    return page('연결하지 못했습니다', '연결 링크가 만료되었거나 다른 브라우저에서 열렸습니다. 같은 브라우저에서 다시 열어 주세요.', 400);
  }

  try {
    const t = await exchangeCode(code, redirectUri(url.origin));
    const want = process.env.INSTAGRAM_USERNAME?.replace(/^@/, '').toLowerCase();
    if (want && t.username.toLowerCase() !== want) {
      return page('다른 계정입니다', `@${t.username} 계정으로 로그인되었습니다. 매장 계정(@${want})으로 다시 로그인해 주세요.`, 400);
    }
    const now = Date.now();
    await saveToken({ token: t.token, expiresAt: now + t.expiresIn * 1000, updatedAt: now, userId: t.userId, username: t.username });
    revalidateTag(INSTAGRAM_TAG, { expire: 0 });
    return page('연결되었습니다', `@${t.username} 계정이 홈페이지에 연결되었습니다. 게시물은 몇 분 안에 나타납니다.`);
  } catch (err) {
    console.error('[instagram] connect failed:', err);
    return page('연결하지 못했습니다', '잠시 후 연결 링크를 다시 열어 주세요. 계속 안 되면 담당자에게 알려 주세요.', 500);
  }
}
