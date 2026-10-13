'use client';

import { useSyncExternalStore } from 'react';

/*
 * The current time in Asia/Seoul, read on the client only. The server snapshot is null, so the
 * prerendered HTML holds the fallback and the real status appears right after hydration.
 * The snapshot is a minute-precision string, so React re-renders only when the minute changes.
 */

export type SeoulNow = { day: string; weekday: number; minutes: number; month: string };

const FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  weekday: 'short',
  hourCycle: 'h23',
});
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function readKey(): string {
  const parts = Object.fromEntries(FORMAT.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}|${WEEKDAYS.indexOf(parts.weekday)}|${parts.hour}:${parts.minute}`;
}

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(id);
}

export function useSeoulNow(): SeoulNow | null {
  const key = useSyncExternalStore(subscribe, readKey, () => null);
  if (!key) return null;
  const [day, weekday, time] = key.split('|');
  const [h, m] = time.split(':').map(Number);
  return { day, weekday: Number(weekday), minutes: h * 60 + m, month: day.slice(0, 7) };
}
