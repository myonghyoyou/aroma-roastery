'use client';

import { useState } from 'react';
import { CupNoteTag } from './CupNoteTag';
import type { PlaceOption } from './notes';
import { PickerColumns, PickerCombobox, PickerPalette, PickerPopover } from './PickerStudy';
import './pickers.css';

const DESIGNS = {
  a: PickerPopover,
  b: PickerCombobox,
  c: PickerColumns,
  d: PickerPalette,
} as const;

/* One design on the assign page's case: placing "그레이프", with the tag it would become beside it. */
export function PickerDemo({ design, options }: { design: keyof typeof DESIGNS; options: PlaceOption[] }) {
  const Picker = DESIGNS[design];
  const [value, setValue] = useState('');
  const picked = options.find((o) => o.key === value);
  return (
    <div className="pkd-row">
      <b className="pkd-word">그레이프</b>
      <span className="pkd-now">
        {picked ? <CupNoteTag word="그레이프" color={picked.color} place={picked.place} /> : <span className="pkd-none">미분류</span>}
      </span>
      <Picker value={value} options={options} onChange={setValue} label="그레이프 분류" />
    </div>
  );
}
