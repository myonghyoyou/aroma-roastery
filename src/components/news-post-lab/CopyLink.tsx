'use client';

import { useState } from 'react';

/** Copies the page's address; says so for a moment, or that it could not. */
export function CopyLink({ className }: { className?: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'fail'>('idle');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState('done');
    } catch {
      setState('fail');
    }
    setTimeout(() => setState('idle'), 2000);
  };
  return (
    <button type="button" className={className} onClick={copy} aria-live="polite">
      {state === 'done' ? '링크를 복사했습니다' : state === 'fail' ? '복사하지 못했습니다' : '링크 복사'}
    </button>
  );
}
