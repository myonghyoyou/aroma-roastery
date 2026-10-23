'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { PlaceOption } from '@/components/news-post-lab/notes';

export type { PlaceOption };

/** what the button shows: the place, and the word whose colour is borrowed */
const shown = (o: PlaceOption) => (o.word ? `${o.place} > ${o.word} 색` : o.label);

/*
 * The assign page's place picker: a button that opens a list grouped by the wheel's 대분류
 * ("과일", then "과일 > 귤", "과일 > 열대과일" ...); under each 2차 분류 its table words, so a word
 * can take an existing word's colour. Each option is led by a square of the colour it gives. A listbox by the ARIA pattern: arrows move, Home/End jump, Enter or Space picks, Esc or a
 * click outside closes, and typing a letter jumps to the next option starting with it.
 */
export function PlaceSelect({ value, options, onChange, label, placeholder = '분류 선택' }: {
  value: string;
  options: PlaceOption[];
  onChange: (key: string) => void;
  label: string;
  placeholder?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  const groups = useMemo(() => {
    const out: { name: string; items: PlaceOption[] }[] = [];
    for (const o of options) {
      const g = out.find((x) => x.name === o.group);
      if (g) g.items.push(o);
      else out.push({ name: o.group, items: [o] });
    }
    return out;
  }, [options]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const picked = flat.find((o) => o.key === value);

  // close on a click outside
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // keep the active option in view
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const show = () => {
    setActive(Math.max(0, flat.findIndex((o) => o.key === value)));
    setOpen(true);
    requestAnimationFrame(() => list.current?.focus());
  };
  const pick = (i: number) => {
    const o = flat[i];
    if (o) onChange(o.key);
    setOpen(false);
    button.current?.focus();
  };

  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const last = flat.length - 1;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(last, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(last); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(active); }
    else if (e.key === 'Escape' || e.key === 'Tab') { setOpen(false); if (e.key === 'Escape') button.current?.focus(); }
    else if (e.key.length === 1) {
      const from = (active + 1) % flat.length;
      const order = [...flat.slice(from), ...flat.slice(0, from)];
      const hit = order.find((o) => (o.word ?? o.label.split(' > ').pop()!).startsWith(e.key));
      if (hit) setActive(flat.indexOf(hit));
    }
  };

  let i = -1;
  return (
    <div className="psel" ref={root}>
      <button
        ref={button}
        type="button"
        className={picked ? 'psel-button' : 'psel-button is-empty'}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`${label}: ${picked ? shown(picked) : placeholder}`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); show(); } }}
      >
        {picked && <span className="psel-swatch" style={{ background: picked.color }} aria-hidden="true" />}
        <span className="psel-value">{picked ? shown(picked) : placeholder}</span>
        <span className="psel-caret" aria-hidden="true" />
      </button>
      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          className="psel-list"
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${id}-o${active}`}
          onKeyDown={onListKey}
        >
          {groups.map((g) => (
            <li key={g.name} role="presentation">
              <p className="psel-group" id={`${id}-g-${g.name}`} aria-hidden="true">{g.name}</p>
              <ul role="group" aria-labelledby={`${id}-g-${g.name}`} className="psel-items">
                {g.items.map((o) => {
                  i += 1;
                  const n = i;
                  return (
                    <li
                      key={o.key}
                      id={`${id}-o${n}`}
                      data-i={n}
                      role="option"
                      aria-selected={o.key === value}
                      className={`psel-option${o.word ? ' is-word' : ''}${n === active ? ' is-active' : ''}`}
                      onPointerEnter={() => setActive(n)}
                      onClick={() => pick(n)}
                    >
                      <span className="psel-swatch" style={{ background: o.color }} aria-hidden="true" />
                      <span>{o.label}</span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
