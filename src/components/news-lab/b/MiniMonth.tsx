import type { NewsTopic } from '@/lib/content';
import { TOPIC_LABEL } from '@/lib/post-utils';
import { WEEKDAYS, monthParts, monthWeeks, spokenDay } from './cal';

/* A small static month for the detail page: the notice's days filled with its topic colour. */
export function MiniMonth({ ym, days, topic }: { ym: string; days: string[]; topic: NewsTopic }) {
  const { year, month } = monthParts(ym);
  const marked = new Set(days);
  const id = `nl-b-mini-${ym}`;
  return (
    <figure className="nl-b-mini" data-topic={topic}>
      <figcaption className="nl-b-mini-cap" id={id}>
        <span className="nl-b-mini-year">{year}</span>
        <span className="nl-b-mini-month">{month}월</span>
      </figcaption>
      <table className="nl-b-mini-grid" aria-labelledby={id}>
        <thead>
          <tr>
            {WEEKDAYS.map((w) => (
              <th key={w} scope="col"><abbr title={`${w}요일`}>{w}</abbr></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthWeeks(ym).map((week, wi) => (
            <tr key={wi}>
              {week.map((iso, di) => {
                if (!iso) return <td key={di} />;
                const on = marked.has(iso);
                return (
                  <td key={di} className={on ? 'is-on' : undefined}>
                    {on ? (
                      <span className="nl-b-mini-day" aria-label={`${spokenDay(iso)}, ${TOPIC_LABEL[topic]}`}>
                        {Number(iso.slice(8, 10))}
                      </span>
                    ) : (
                      <span className="nl-b-mini-day">{Number(iso.slice(8, 10))}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
