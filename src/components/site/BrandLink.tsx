import type { ReactNode } from 'react';

/*
 * An outside link marked with the service's own icon, the way those services show themselves: the
 * Naver Map and Kakao Map app icons, and the Naver Plus Store "N+" mark in white on a dark tile.
 * The icons are the services' official ones (public/assets/brand), unaltered except for the N+ mark
 * reduced to its white glyphs.
 */
const ICON = {
  'naver-map': { src: '/assets/brand/naver-map.png', tile: false },
  'kakao-map': { src: '/assets/brand/kakao-map.png', tile: false },
  store: { src: '/assets/brand/nplus-mono.png', tile: true },
} as const;

export function BrandLink({ href, brand, label, children, className }: {
  href: string;
  brand: keyof typeof ICON;
  /** the full name for screen readers when the visible text is short */
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  const icon = ICON[brand];
  return (
    <a href={href} target="_blank" rel="noopener" aria-label={label} className={`brand-link${className ? ` ${className}` : ''}`}>
      <span className={`brand-icon${icon.tile ? ' is-tile' : ''}`} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny fixed icon */}
        <img src={icon.src} alt="" />
      </span>
      <span className="brand-text">{children}</span>
    </a>
  );
}
