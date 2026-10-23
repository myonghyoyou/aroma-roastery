'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { PlaceOption } from './notes';
import { nameOf, searchPlaces, splitName, type Hit } from './placeSearch';

/*
 * Searchable place picker study (/news-post-lab/notes/picker): four designs over the same options
 * and the same search (placeSearch.ts), so they can be compared by hand. Each takes the picker's
 * contract: value, options, onChange, label.
 */

type Props = { value: string; options: PlaceOption[]; onChange: (key: string) => void; label: string };

/** what a closed picker shows: the place, and the word whose colour is borrowed */
export const shownLabel = (o: PlaceOption) => (o.word ? `${o.place} > ${o.word} 색` : o.label);

function Swatch({ color, size = 12 }: { color: string; size?: number }) {
  return <span className="pks-swatch" style={{ background: color, width: size, height: size }} aria-hidden="true" />;
}

function Name({ hit }: { hit: Hit }) {
  const [a, b, c] = splitName(nameOf(hit.option), hit.range);
  return <span className="pks-name">{a}{b && <mark>{b}</mark>}{c}</span>;
}

/** open state, closed by a click outside or Esc */
function usePopover() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);
  return { open, setOpen, root };
}

/** arrow keys over a flat list of hits; Enter picks, Esc closes */
function useListKeys(count: number, pick: (i: number) => void, close: () => void) {
  const [active, setActive] = useState(0);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(count - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (count) pick(active); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  };
  return { active, setActive, onKeyDown };
}

/*
 * The result list both list designs share: with no query, grouped by 대분류 with each place over
 * its words; with a query, a flat list best first, each row naming its place on the right and why
 * it matched when the name does not show it.
 */
function Results({ hits, query, active, setActive, pick, listId }: {
  hits: Hit[]; query: string; active: number; setActive: (i: number) => void; pick: (i: number) => void; listId: string;
}) {
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => { list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' }); }, [active]);
  if (!hits.length) {
    return <p className="pks-empty">&lsquo;{query}&rsquo;에 맞는 분류가 없습니다. 다른 이름이나 초성(예: ㄸㄱ)으로 찾아보세요.</p>;
  }
  const rows: ReactNode[] = [];
  let lastGroup = '';
  hits.forEach((h, i) => {
    if (!query && h.option.group !== lastGroup) {
      lastGroup = h.option.group;
      rows.push(<li key={`g-${lastGroup}`} className="pks-group" role="presentation">{lastGroup}</li>);
    }
    rows.push(
      <li
        key={h.option.key}
        id={`${listId}-${i}`}
        data-i={i}
        role="option"
        aria-selected={i === active}
        className={`pks-row${h.option.word ? ' is-word' : ''}${i === active ? ' is-active' : ''}${query ? ' is-flat' : ''}`}
        onPointerEnter={() => setActive(i)}
        onClick={() => pick(i)}
      >
        <Swatch color={h.option.color} />
        {query || h.option.word ? <Name hit={h} /> : <span className="pks-name">{h.option.label}</span>}
        {query && <span className="pks-ctx">{h.via && h.via !== h.option.place ? `${h.via} · ` : ''}{h.option.word ? h.option.place : h.option.group}</span>}
      </li>,
    );
  });
  return <ul ref={list} id={listId} className="pks-list" role="listbox">{rows}</ul>;
}

/* A. A button opening a panel with a search field on top (Linear, Slack). */
export function PickerPopover({ value, options, onChange, label }: Props) {
  const { open, setOpen, root } = usePopover();
  const [query, setQuery] = useState('');
  const hits = useMemo(() => searchPlaces(options, query), [options, query]);
  const picked = options.find((o) => o.key === value);
  const pick = (i: number) => { onChange(hits[i].option.key); setOpen(false); setQuery(''); };
  const keys = useListKeys(hits.length, pick, () => setOpen(false));
  return (
    <div className="pks pks-a" ref={root}>
      <button type="button" className={picked ? 'pks-trigger' : 'pks-trigger is-empty'} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>
        {picked && <Swatch color={picked.color} />}
        <span className="pks-value">{picked ? shownLabel(picked) : '분류 선택'}</span>
        <span className="pks-caret" aria-hidden="true" />
      </button>
      {open && (
        <div className="pks-panel" role="dialog" aria-label={label}>
          <input
            autoFocus
            className="pks-search"
            role="combobox"
            aria-expanded="true"
            aria-controls="pks-a-list"
            aria-activedescendant={hits.length ? `pks-a-list-${keys.active}` : undefined}
            placeholder="분류나 노트 검색 (초성 가능)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); keys.setActive(0); }}
            onKeyDown={keys.onKeyDown}
          />
          <Results hits={hits} query={query} active={keys.active} setActive={keys.setActive} pick={pick} listId="pks-a-list" />
          <p className="pks-foot">↑↓ 이동 · Enter 선택 · Esc 닫기</p>
        </div>
      )}
    </div>
  );
}

/* B. The field itself is the search: type to filter, the list drops below (GitHub labels, Notion). */
export function PickerCombobox({ value, options, onChange, label }: Props) {
  const { open, setOpen, root } = usePopover();
  const [query, setQuery] = useState('');
  const hits = useMemo(() => searchPlaces(options, query), [options, query]);
  const picked = options.find((o) => o.key === value);
  const input = useRef<HTMLInputElement>(null);
  const pick = (i: number) => { onChange(hits[i].option.key); setOpen(false); setQuery(''); input.current?.blur(); };
  const keys = useListKeys(hits.length, pick, () => { setOpen(false); setQuery(''); });
  return (
    <div className="pks pks-b" ref={root}>
      <div className={`pks-field${open ? ' is-open' : ''}`}>
        {!open && picked && <Swatch color={picked.color} />}
        <input
          ref={input}
          className="pks-input"
          role="combobox"
          aria-label={label}
          aria-expanded={open}
          aria-controls="pks-b-list"
          aria-activedescendant={open && hits.length ? `pks-b-list-${keys.active}` : undefined}
          placeholder={picked ? shownLabel(picked) : '분류 검색 또는 선택'}
          value={open ? query : picked ? shownLabel(picked) : ''}
          onFocus={() => { setOpen(true); keys.setActive(0); }}
          onChange={(e) => { setQuery(e.target.value); keys.setActive(0); setOpen(true); }}
          onKeyDown={keys.onKeyDown}
        />
        {picked && !open && (
          <button type="button" className="pks-clear" aria-label="선택 지우기" onClick={() => onChange('')}>×</button>
        )}
      </div>
      {open && (
        <div className="pks-panel pks-panel--flush">
          <Results hits={hits} query={query} active={keys.active} setActive={keys.setActive} pick={pick} listId="pks-b-list" />
        </div>
      )}
    </div>
  );
}

/* C. Two columns: places on the left, the chosen place's words on the right (Finder, a font picker). */
export function PickerColumns({ value, options, onChange, label }: Props) {
  const { open, setOpen, root } = usePopover();
  const [query, setQuery] = useState('');
  const places = useMemo(() => options.filter((o) => !o.word), [options]);
  const picked = options.find((o) => o.key === value);
  const [at, setAt] = useState(() => places.findIndex((p) => p.place === picked?.place));
  const hits = useMemo(() => searchPlaces(options, query), [options, query]);
  const pickHit = (i: number) => { onChange(hits[i].option.key); setOpen(false); setQuery(''); };
  const keys = useListKeys(hits.length, pickHit, () => setOpen(false));
  const place = places[Math.max(0, at)];
  const words = options.filter((o) => o.word && o.place === place?.place);
  const choose = (o: PlaceOption) => { onChange(o.key); setOpen(false); };
  return (
    <div className="pks pks-c" ref={root}>
      <button type="button" className={picked ? 'pks-trigger' : 'pks-trigger is-empty'} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>
        {picked && <Swatch color={picked.color} />}
        <span className="pks-value">{picked ? shownLabel(picked) : '분류 선택'}</span>
        <span className="pks-caret" aria-hidden="true" />
      </button>
      {open && (
        <div className="pks-panel pks-panel--wide" role="dialog" aria-label={label}>
          <input
            autoFocus className="pks-search" placeholder="분류나 노트 검색 (초성 가능)" value={query}
            role="combobox" aria-expanded={Boolean(query)} aria-controls="pks-c-list"
            aria-activedescendant={query && hits.length ? `pks-c-list-${keys.active}` : undefined}
            onChange={(e) => { setQuery(e.target.value); keys.setActive(0); }} onKeyDown={keys.onKeyDown}
          />
          {query ? (
            <Results hits={hits} query={query} active={keys.active} setActive={keys.setActive} pick={pickHit} listId="pks-c-list" />
          ) : (
            <div className="pks-cols">
              <ul className="pks-col" aria-label="2차 분류">
                {places.map((p, i) => (
                  <li key={p.key}>
                    {(i === 0 || places[i - 1].group !== p.group) && <p className="pks-group">{p.group}</p>}
                    <button type="button" className={`pks-colrow${i === Math.max(0, at) ? ' is-on' : ''}`} onPointerEnter={() => setAt(i)} onFocus={() => setAt(i)} onClick={() => choose(p)}>
                      <Swatch color={p.color} />{p.label.split(' > ').pop()}<span className="pks-chev" aria-hidden="true">›</span>
                    </button>
                  </li>
                ))}
              </ul>
              <ul className="pks-col pks-col--words" aria-label={`${place?.label ?? ''}의 노트`}>
                {place && (
                  <li><button type="button" className="pks-colrow is-base" onClick={() => choose(place)}><Swatch color={place.color} />{place.label} 기본색</button></li>
                )}
                {words.map((w) => (
                  <li key={w.key}><button type="button" className="pks-colrow" onClick={() => choose(w)}><Swatch color={w.color} />{w.word}</button></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* D. A palette: colour tiles under each place, a search on top (Notion colours, Figma swatches). */
export function PickerPalette({ value, options, onChange, label }: Props) {
  const { open, setOpen, root } = usePopover();
  const [query, setQuery] = useState('');
  const hits = useMemo(() => searchPlaces(options, query), [options, query]);
  const picked = options.find((o) => o.key === value);
  const shown = new Set(hits.map((h) => h.option.key));
  const placesShown = options.filter((o) => !o.word && (shown.has(o.key) || options.some((w) => w.word && w.place === o.place && shown.has(w.key))));
  const choose = (o: PlaceOption) => { onChange(o.key); setOpen(false); setQuery(''); };
  return (
    <div className="pks pks-d" ref={root}>
      <button type="button" className={picked ? 'pks-trigger' : 'pks-trigger is-empty'} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>
        {picked && <Swatch color={picked.color} />}
        <span className="pks-value">{picked ? shownLabel(picked) : '분류 선택'}</span>
        <span className="pks-caret" aria-hidden="true" />
      </button>
      {open && (
        <div className="pks-panel pks-panel--wide" role="dialog" aria-label={label}>
          <input
            autoFocus className="pks-search" placeholder="분류나 노트 검색 (초성 가능)" value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false);
              if (e.key === 'Enter' && hits[0]) { e.preventDefault(); choose(hits[0].option); }
            }}
          />
          {placesShown.length === 0 ? (
            <p className="pks-empty">&lsquo;{query}&rsquo;에 맞는 분류가 없습니다.</p>
          ) : (
            <div className="pks-pal">
              {placesShown.map((p) => {
                const tiles = [p, ...options.filter((w) => w.word && w.place === p.place)].filter((o) => !query || shown.has(o.key));
                return (
                  <section key={p.key} className="pks-pal-sec">
                    <p className="pks-group">{p.label}</p>
                    <ul className="pks-tiles">
                      {tiles.map((o) => (
                        <li key={o.key}>
                          <button type="button" className={`pks-tile${o.key === value ? ' is-on' : ''}`} onClick={() => choose(o)} title={shownLabel(o)}>
                            <span className="pks-tile-chip" style={{ background: o.color }} aria-hidden="true" />
                            <span className="pks-tile-name">{o.word ?? '기본색'}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
          <p className="pks-foot">Enter: 첫 번째 결과 선택 · Esc 닫기</p>
        </div>
      )}
    </div>
  );
}
