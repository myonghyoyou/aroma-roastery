import type { Photo } from '@/lib/content';

/** A photo, or the video of a video post (sound off until the viewer turns it on). */
export function MediaView({ photo, className, eager, autoPlay }: { photo: Photo; className?: string; eager?: boolean; autoPlay?: boolean }) {
  if (photo.video) {
    return (
      <video
        className={className}
        src={photo.video}
        poster={photo.src}
        width={photo.w}
        height={photo.h}
        aria-label={photo.alt}
        controls
        muted
        loop
        playsInline
        autoPlay={autoPlay}
        preload="metadata"
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- plain stills sized by their frame
  return <img className={className} src={photo.src} width={photo.w} height={photo.h} alt={photo.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />;
}
