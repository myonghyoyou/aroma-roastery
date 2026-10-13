'use client';

import { useEffect, useState } from 'react';

/* Copies the page address. Announces the result in a polite live region; never throws. */
export function CopyLink() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(''), 4000);
    return () => window.clearTimeout(t);
  }, [message]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage('링크를 복사했습니다');
    } catch {
      setMessage('링크를 복사하지 못했습니다. 주소창의 주소를 직접 복사해 주세요.');
    }
  }

  return (
    <div className="nl-d-copy">
      <button type="button" className="nl-d-btn" onClick={copy}>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <rect x="4.5" y="4.5" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M9.5 2.5V1.5h-8v8h1" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        링크 복사
      </button>
      <p className="nl-d-copy-msg" aria-live="polite" role="status">
        {message}
      </p>
    </div>
  );
}
