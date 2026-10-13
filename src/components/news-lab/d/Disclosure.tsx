'use client';

import { useState, type ReactNode } from 'react';

/*
 * "내용 펼치기 / 접기" for one timeline entry. The body arrives already rendered on the server as
 * children; this only owns the open state. Closed panels are visibility: hidden, so they leave
 * the tab order and the accessibility tree while the height animates shut.
 */
export function Disclosure({
  panelId,
  titleId,
  extra,
  children,
}: {
  panelId: string;
  titleId: string;
  /** shown next to the button, e.g. the link to the detail page */
  extra?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="nl-d-actions">
        <button
          type="button"
          className="nl-d-btn"
          aria-expanded={open}
          aria-controls={panelId}
          aria-describedby={titleId}
          onClick={() => setOpen((v) => !v)}
        >
          <svg className="nl-d-chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          {open ? '내용 접기' : '내용 펼치기'}
        </button>
        {extra}
      </div>
      <div id={panelId} className="nl-d-panel" data-open={open ? '' : undefined} role="region" aria-labelledby={titleId}>
        <div className="nl-d-panel-inner">
          <div className="nl-d-panel-body">{children}</div>
        </div>
      </div>
    </>
  );
}
