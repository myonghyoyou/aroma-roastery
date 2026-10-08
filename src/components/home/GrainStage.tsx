'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import type { Media } from '@/lib/content';
import { mountGrainField } from '@/lib/grain-field/engine';

/*
 * Client shell for the home page: the fixed grain field canvas behind server-rendered content.
 * The content stays server-rendered (passed as children); this only mounts the WebGL field and the
 * scroll choreography once the DOM is in place, and tears them down when the page is left.
 */
export function GrainStage({ slots, children }: { slots: Media[]; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // remount only when the media actually change, not on every render
  const slotKey = slots.map((s) => `${s.kind}:${s.src}:${s.crop ?? ''}`).join('|');

  useEffect(() => {
    if (!rootRef.current || !canvasRef.current) return;
    return mountGrainField(rootRef.current, canvasRef.current, slots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotKey]);

  return (
    <div ref={rootRef}>
      <canvas id="field" ref={canvasRef} aria-hidden="true" />
      <div className="fallback" aria-hidden="true" />
      {children}
    </div>
  );
}
