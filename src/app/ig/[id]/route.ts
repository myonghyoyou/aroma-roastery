import { getInstagramPosts } from '@/lib/instagram';

/*
 * One Instagram photo at a fixed address (/ig/<media id>). Instagram's own link changes on every
 * read of the feed, so the site points here instead: this looks up the current link in the cached
 * feed and passes the file through. A media id's photo never changes, so browsers and Vercel's CDN
 * keep it, and the image resizer keeps its sizes of it across the hourly refreshes.
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = /^\d+$/.test(id) ? (await getInstagramPosts()).media[id] : undefined;
  if (!url) return new Response('Not found', { status: 404 });
  const res = await fetch(url);
  if (!res.ok || !res.body) return new Response('Photo unavailable', { status: 502 });
  return new Response(res.body, {
    headers: {
      'Content-Type': res.headers.get('content-type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable',
    },
  });
}
