import { appConfig, page, redirectUri, SCOPE, STATE_COOKIE } from '@/lib/instagram-auth';
import { tokenStoreReady } from '@/lib/instagram-token';

/* The link sent to the store owner: it goes straight to Instagram's login and permission screen. */
export async function GET(request: Request) {
  if (!tokenStoreReady()) return page('연결 준비 중', '홈페이지 쪽 설정이 아직 끝나지 않았습니다. 담당자에게 알려 주세요.', 503);
  const { appId } = appConfig();
  const origin = new URL(request.url).origin;
  const state = crypto.randomUUID();
  const url = new URL('https://www.instagram.com/oauth/authorize');
  url.search = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri(origin),
    response_type: 'code',
    scope: SCOPE,
    state,
    // the store account may already be logged in on this browser: always show which account is used
    force_reauth: 'true',
    // log in with the Instagram account itself: "continue with Facebook" checks the Facebook user's
    // role on the app instead, which fails with "insufficient developer role" while the app is in testing
    enable_fb_login: 'false',
  }).toString();
  const res = Response.redirect(url.toString(), 302);
  const headers = new Headers(res.headers);
  headers.append('Set-Cookie', `${STATE_COOKIE}=${state}; Path=/api/instagram; Max-Age=900; HttpOnly; Secure; SameSite=Lax`);
  return new Response(null, { status: 302, headers });
}
