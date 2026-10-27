import { cardHref } from '@/components/news/types';
import { getPosts, getSiteSettings } from '@/lib/content';
import { formatDate } from '@/lib/post-utils';
import { SITE_ALT_NAMES, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

const LATEST = 20;

/*
 * /llms.txt: the store in plain Markdown for AI assistants (the llms.txt convention), so an answer
 * about it can quote the address, hours and the latest news without reading the animated pages.
 */
export async function GET() {
  const [s, news] = await Promise.all([getSiteSettings(), getPosts('news')]);
  const live = news.filter((p) => !p.sample).slice(0, LATEST);
  const text = [
    `# ${SITE_NAME} (${SITE_ALT_NAMES.join(', ')})`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    '## 매장 정보',
    '',
    `- 주소: 서울특별시 강서구 ${s.address.line2} ${s.address.building} ${s.address.storeName}`,
    `- 영업시간: ${s.hours.map((h) => `${h.label} ${h.value}`).join(', ')}`,
    `- 전화: ${s.phone}`,
    `- 네이버 지도: ${s.mapUrl}`,
    `- 카카오맵: ${s.kakaoMapUrl}`,
    `- 온라인 스토어 (네이버 스마트스토어): ${s.storeUrl}`,
    `- 인스타그램: ${s.instagram.url} (${s.instagram.handle})`,
    `- 홈페이지: ${SITE_URL}/`,
    '',
    '## 최근 소식',
    '',
    ...(live.length
      ? live.map((p) => `- [${p.title}](${SITE_URL}${cardHref(p.slug)}) (${formatDate(p.date)}): ${p.summary}`)
      : ['- 아직 올라온 소식이 없습니다.']),
    '',
    `전체 소식: ${SITE_URL}/news`,
    '',
  ].join('\n');
  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
