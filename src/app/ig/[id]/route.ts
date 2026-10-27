import { getInstagramPosts, igMediaUrl } from '@/lib/instagram';

/*
 * One Instagram photo at a fixed address (/ig/<media id>). Instagram's own link changes on every
 * read of the feed, so the site points here instead: this asks Instagram for that photo's current
 * link (or, failing that, looks it up in the cached feed) and passes the file through. Only the
 * store's own photos answer, since the token is the store's. A media id's photo never changes, so
 * browsers and Vercel's CDN keep it, and the image resizer keeps its sizes of it across the hourly
 * refreshes.
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = /^\d+$/.test(id) ? (await igMediaUrl(id)) ?? (await getInstagramPosts()).media[id] : undefined;
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
