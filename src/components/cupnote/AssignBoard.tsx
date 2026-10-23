'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { NoteFamily } from '@/components/cupnote/notes';
import { CupNoteTag } from './CupNoteTag';
import { PlaceSelect, type PlaceOption } from './PlaceSelect';

export type AssignRow = {
  word: string;
  /** new: not in the table yet; table: the built-in table; assigned: placed here before; ignored: marked not a flavour */
  status: 'new' | 'table' | 'assigned' | 'ignored';
  count: number;
  context?: string;
  family?: NoteFamily;
  color?: string;
  place?: string;
  placeKey?: string;
};
type Place = PlaceOption;

const TABS: { key: AssignRow['status']; label: string }[] = [
  { key: 'new', label: '새 단어' },
  { key: 'assigned', label: '배치한 단어' },
  { key: 'table', label: '기본 분류표' },
  { key: 'ignored', label: '제외한 단어' },
];
// the admin key a device kept before the sign-in moved to /admin/login, removed on sight
const OLD_KEY_STORE = 'aroma-notes-admin-key';

/*
 * The assign page's board: a tab per kind of word, and for each word a choice of place on the flavour
 * wheel with a live preview of the tag it will become, saved one word at a time. Saving needs the /admin sign-in.
 */
export function AssignBoard({ rows, places, storeReady }: { rows: AssignRow[]; places: Place[]; storeReady: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<AssignRow['status']>(rows.some((r) => r.status === 'new') ? 'new' : 'table');
  const [busy, setBusy] = useState<string | null>(null);
  const [said, setSaid] = useState<Record<string, string>>({});

  useEffect(() => {
    try { localStorage.removeItem(OLD_KEY_STORE); sessionStorage.removeItem(OLD_KEY_STORE); } catch {}
  }, []);

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.key, rows.filter((r) => r.status === t.key).length])), [rows]);
  const shown = rows.filter((r) => r.status === tab);

  const save = async (word: string, place: string) => {
    setBusy(word);
    try {
      const res = await fetch('/api/cupnotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word, place }) });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      // signed out (the key changed, or a year passed): back through the sign-in to this page
      if (res.status === 401) { router.push('/admin/login?next=/admin/cupnotes'); return; }
      if (!res.ok) throw new Error(json.error ?? `저장하지 못했습니다 (${res.status})`);
      setSaid((s) => ({ ...s, [word]: place === 'ignore' ? '제외했습니다.' : place === 'reset' ? '기본으로 되돌렸습니다.' : '저장했습니다.' }));
      router.refresh();
    } catch (e) {
      setSaid((s) => ({ ...s, [word]: e instanceof Error ? e.message : '저장하지 못했습니다.' }));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="cnab">
      {!storeReady && <p className="cnab-warn">이 환경에는 저장소가 연결되어 있지 않아 저장할 수 없습니다. 실제 사이트에서 사용해 주세요.</p>}

      <div className="cnab-tabs" role="tablist" aria-label="단어 종류">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className="adm-btn cnab-tab" onClick={() => setTab(t.key)}>
            {t.label} <span>{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="adm-empty">{tab === 'new' ? '배치할 새 단어가 없습니다.' : '해당하는 단어가 없습니다.'}</p>
      ) : (
        <ul className="cnab-rows">
          {shown.map((r) => <Row key={r.word} row={r} places={places} busy={busy === r.word} said={said[r.word]} onSave={save} />)}
        </ul>
      )}
    </div>
  );
}

function Row({ row, places, busy, said, onSave }: { row: AssignRow; places: Place[]; busy: boolean; said?: string; onSave: (word: string, place: string) => void }) {
  const [choice, setChoice] = useState(row.placeKey ?? '');
  const picked = places.find((p) => p.key === choice);
  return (
    <li className="cnab-row">
      <div className="cnab-word">
        <b>{row.word}</b>
        <span className="cnab-count">{row.count > 0 ? `${row.count}회` : ''}</span>
        {row.context && <p className="cnab-context">{row.context}</p>}
      </div>
      <div className="cnab-now">
        {picked ? (
          <CupNoteTag word={row.word} color={picked.color} place={picked.place} />
        ) : row.color && row.place ? (
          <CupNoteTag word={row.word} color={row.color} place={row.place} />
        ) : (
          <span className="cnab-none">{row.status === 'ignored' ? '맛 아님' : '미분류'}</span>
        )}
      </div>
      <div className="cnab-act">
        <PlaceSelect value={choice} options={places} onChange={setChoice} label={`${row.word} 분류`} />
        <button type="button" className="adm-btn adm-btn--solid" disabled={!choice || busy} onClick={() => onSave(row.word, choice)}>저장</button>
        {row.status !== 'ignored' && <button type="button" className="adm-btn" disabled={busy} onClick={() => onSave(row.word, 'ignore')}>맛 아님</button>}
        {(row.status === 'assigned' || row.status === 'ignored') && <button type="button" className="adm-btn" disabled={busy} onClick={() => onSave(row.word, 'reset')}>되돌리기</button>}
      </div>
      {said && <p className="cnab-said" role="status">{said}</p>}
    </li>
  );
}
