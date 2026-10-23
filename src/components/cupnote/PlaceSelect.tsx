'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { PlaceOption } from '@/components/cupnote/notes';
import { nameOf, searchPlaces, splitName, type Hit } from '@/components/cupnote/placeSearch';

export type { PlaceOption };

/** what the closed field shows: the place, and the word whose colour is borrowed */
const shown = (o: PlaceOption) => (o.word ? `${o.place} > ${o.word} 색` : o.label);

function Name({ hit }: { hit: Hit }) {
  const [a, b, c] = splitName(nameOf(hit.option), hit.range);
  return <span className="psel-name">{a}{b && <mark>{b}</mark>}{c}</span>;
}

/*
 * The place picker on /admin/cupnotes (design B of the 2026-10-23 picker study): the field itself
 * is the search. Focused with no query, the list is grouped by the wheel's 대분류, each
 * 2차 분류 over its table words; typing filters it by placeSearch.ts (words, other spellings, 초성,
 * place names), best first, each row naming its place. A combobox by the ARIA pattern: arrows move,
 * Home/End jump, Enter picks, Esc or a click outside closes, × clears the choice.
 */
export function PlaceSelect({ value, options, onChange, label, placeholder = '분류 검색 또는 선택' }: {
  value: string;
  options: PlaceOption[];
  onChange: (key: string) => void;
  label: string;
  placeholder?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => searchPlaces(options, query), [options, query]);
  const picked = options.find((o) => o.key === value);

  const close = () => { setOpen(false); setQuery(''); };

  // close on a click outside
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) { setOpen(false); setQuery(''); } };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // keep the active option in view
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const show = () => {
    // with no query the list starts at the current choice
    setActive(Math.max(0, options.findIndex((o) => o.key === value)));
    setOpen(true);
  };
  const pick = (i: number) => {
    const o = hits[i]?.option;
    if (o) onChange(o.key);
    close();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const last = hits.length - 1;
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); show(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(last, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (open && e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (open && e.key === 'End') { e.preventDefault(); setActive(last); }
    else if (open && e.key === 'Enter') { e.preventDefault(); if (hits.length) pick(active); }
    else if (e.key === 'Escape') { if (open) { e.preventDefault(); close(); } }
    else if (e.key === 'Tab') close();
  };

  const rows: ReactNode[] = [];
  let lastGroup = '';
  hits.forEach((h, n) => {
    const o = h.option;
    if (!query && o.group !== lastGroup) {
      lastGroup = o.group;
      rows.push(<li key={`g-${lastGroup}`} className="psel-group" role="presentation">{lastGroup}</li>);
    }
    rows.push(
      <li
        key={o.key}
        id={`${listId}-${n}`}
        data-i={n}
        role="option"
        aria-selected={n === active}
        className={`psel-option${o.word && !query ? ' is-word' : ''}${n === active ? ' is-active' : ''}${o.key === value ? ' is-picked' : ''}`}
        onPointerEnter={() => setActive(n)}
        onPointerDown={(e) => e.preventDefault()}
        onClick={() => pick(n)}
      >
        <span className="psel-swatch" style={{ background: o.color }} aria-hidden="true" />
        {query || o.word ? <Name hit={h} /> : <span className="psel-name">{o.label}</span>}
        {query && <span className="psel-ctx">{h.via && h.via !== o.place ? `${h.via} · ` : ''}{o.word ? o.place : o.group}</span>}
      </li>,
    );
  });

  return (
    <div className="psel" ref={root}>
      <div className={`psel-field${open ? ' is-open' : ''}`} onClick={() => { input.current?.focus(); if (!open) show(); }}>
        {!open && picked && <span className="psel-swatch" style={{ background: picked.color }} aria-hidden="true" />}
        <input
          ref={input}
          className="psel-input"
          role="combobox"
          aria-label={label}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && hits.length ? `${listId}-${active}` : undefined}
          placeholder={picked ? shown(picked) : placeholder}
          value={open ? query : picked ? shown(picked) : ''}
          onFocus={show}
          onChange={(e) => { setQuery(e.target.value); setActive(0); setOpen(true); }}
          onKeyDown={onKey}
        />
        {picked && !open && (
          <button type="button" className="psel-clear" aria-label={`${label} 선택 지우기`} onClick={(e) => { e.stopPropagation(); onChange(''); input.current?.focus(); }}>×</button>
        )}
      </div>
      {open && (
        <div className="psel-panel">
          {hits.length ? (
            <ul ref={list} id={listId} className="psel-list" role="listbox" aria-label={label}>{rows}</ul>
          ) : (
            <p className="psel-empty" role="status">&lsquo;{query}&rsquo;에 맞는 분류가 없습니다. 다른 이름이나 초성(예: ㄸㄱ)으로 찾아보세요.</p>
          )}
        </div>
      )}
    </div>
  );
}
