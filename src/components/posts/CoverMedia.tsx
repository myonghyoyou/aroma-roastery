import type { Media } from '@/lib/content';

/*
 * A post cover on the archive and news pages: always a still. Posts carry photos; where a cover
 * entry is a clip (the home page plays those through its colour field), its original photo is shown.
 */
export function CoverMedia({ media, className }: { media: Media; className?: string }) {
  const src = media.kind === 'image' ? media.src : media.poster;
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element -- local assets today, Notion-proxied files later
  return <img className={className} src={src} alt={media.alt} loading="lazy" />;
}
