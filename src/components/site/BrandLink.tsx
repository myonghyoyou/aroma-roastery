import type { CSSProperties, ReactNode } from 'react';

/*
 * An outside link marked with the service's own symbol, in one colour: the Naver Map pin, the Kakao
 * Map pin and the Naver Plus Store "N+", each traced from the service's official icon into a white
 * shape (public/assets/brand). The shape is used as a mask, so it takes the link's own text colour.
 */
const ICON = {
  'naver-map': '/assets/brand/naver-map-white.png',
  'kakao-map': '/assets/brand/kakao-map-white.png',
  store: '/assets/brand/nplus-mono.png',
} as const;

export function BrandLink({ href, brand, label, children }: {
  href: string;
  brand: keyof typeof ICON;
  /** the full name for screen readers when the visible text is short */
  label?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener" aria-label={label} className="brand-link">
      <span className={`brand-icon is-${brand}`} style={{ '--icon': `url(${ICON[brand]})` } as CSSProperties} aria-hidden="true" />
      <span className="brand-text">{children}</span>
    </a>
  );
}
