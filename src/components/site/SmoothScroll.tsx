'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';

let current: Lenis | null = null;

/** The page's Lenis instance, or null when reduced motion is on or no subpage is mounted. */
export function getLenis() {
  return current;
}

/*
 * Smooth scroll for every page other than home (home runs its own Lenis inside the field engine,
 * driven by the GSAP ticker). Inner scrollers keep native scrolling (allowNestedScroll), and an open
 * modal dialog is left alone so its own scroll lock holds.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({
      lerp: 0.08,
      autoRaf: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      prevent: (node) => node.getAttribute('aria-modal') === 'true',
    });
    current = lenis;
    return () => {
      if (current === lenis) current = null;
      lenis.destroy();
    };
  }, []);
  return null;
}
