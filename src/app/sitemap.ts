import type { MetadataRoute } from 'next';
import { cardHref } from '@/components/news/types';
import { sheetHref } from '@/components/archive/types';
import { ARCHIVE_IN_MENU } from '@/components/site/SiteHeader';
import { getPosts } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

const abs = (path: string) => `${SITE_URL}${path}`;
const stillOf = (p: Awaited<ReturnType<typeof getPosts>>[number]) => (p.cover?.kind === 'image' ? p.cover.src : p.cover?.poster);

/* /sitemap.xml: the home page, the news and every news post with its photo; the archive only while it is in the menu. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, archive] = await Promise.all([getPosts('news'), ARCHIVE_IN_MENU ? getPosts('archive') : Promise.resolve([])]);
  const posts = (list: typeof news, href: (slug: string) => string) => list.filter((p) => !p.sample).map((p) => {
    const still = stillOf(p);
    return { url: abs(href(p.slug)), lastModified: p.date, ...(still ? { images: [abs(still)] } : {}) };
  });
  return [
    { url: abs('/'), changeFrequency: 'monthly', priority: 1 },
    { url: abs('/news'), lastModified: news[0]?.date, changeFrequency: 'weekly', priority: 0.8 },
    ...posts(news, cardHref),
    ...(ARCHIVE_IN_MENU ? [{ url: abs('/archive'), lastModified: archive[0]?.date }, ...posts(archive, sheetHref)] : []),
  ];
}
