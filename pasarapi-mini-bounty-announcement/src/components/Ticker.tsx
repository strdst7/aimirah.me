import { useMemo } from 'react';
import { fetchCatalogue, fmtRate } from '../lib/api';
import { useAsyncData } from '../lib/api';

interface FuelRow {
  date: string;
  series_type: string;
  ron95: number | null;
  ron97: number | null;
  diesel: number | null;
}
interface FxRow {
  date: string;
  rate_type: string;
  [k: string]: unknown;
}

interface Tick {
  label: string;
  value: string;
  delta?: number; // signed fraction or absolute
  pct?: boolean;
  badWhenUp?: boolean; // fuel prices: up = pink (bad for your wallet)
}

export function Ticker() {
  const { data } = useAsyncData(async () => {
    const [fuel, fx] = await Promise.all([
      // Same spec as FuelSection so the shared request cache reuses one call.
      fetchCatalogue<FuelRow>({ id: 'fuelprice', limit: 104, sort: '-date' }),
      fetchCatalogue<FxRow>({ id: 'exchangerates_daily_1200', limit: 12, sort: '-date' }),
    ]);
    return { fuel, fx };
  });

  const ticks = useMemo<Tick[]>(() => {
    if (!data) return placeholder;
    const out: Tick[] = [];

    // fuel: latest two 'level' rows
    const levels = data.fuel
      .filter(f => f.series_type === 'level')
      .sort((a, b) => b.date.localeCompare(a.date));
    const cur = levels[0];
    const prev = levels[1];
    if (cur) {
      const push = (label: string, v: number | null, pv: number | null) => {
        if (v == null) return;
        out.push({
          label,
          value: 'RM ' + v.toFixed(2),
          delta: prev != null && pv != null ? v - pv : undefined,
          badWhenUp: true,
        });
      };
      push('RON95', cur.ron95, prev?.ron95 ?? null);
      push('RON97', cur.ron97, prev?.ron97 ?? null);
      push('DIESEL', cur.diesel, prev?.diesel ?? null);
    }

    // forex: latest middle vs previous-day middle
    const dates = [...new Set(data.fx.map(r => r.date))].sort().reverse();
    const mid = (d: string) => data.fx.find(r => r.date === d && r.rate_type === 'middle');
    const d0 = mid(dates[0]);
    const d1 = dates[1] ? mid(dates[1]) : undefined;
    if (d0) {
      (['usd', 'sgd', 'eur', 'gbp', 'aud', 'cny', 'jpy', 'thb'] as const).forEach(code => {
        const v = d0[code] as number | null;
        const pv = d1 ? (d1[code] as number | null) : null;
        if (v == null) return;
        out.push({
          label: code.toUpperCase() + '/MYR',
          value: code === 'jpy' ? fmtRate(v * 100) + '†' : fmtRate(v),
          delta: v != null && pv != null && pv !== 0 ? (v - pv) / pv : undefined,
          pct: true,
        });
      });
    }
    return out.length ? out : placeholder;
  }, [data]);

  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {ticks.map((t, i) => (
        <div key={i} className="flex items-center gap-3 px-6 whitespace-nowrap">
          <span className="font-mono text-[10px] tracking-[0.25em] text-mute uppercase">{t.label}</span>
          <span className="font-mono text-sm font-bold text-white tabular-nums">{t.value}</span>
          {t.delta != null && (
            <span
              className={
                'font-mono text-[10px] font-bold tabular-nums ' +
                (Math.abs(t.delta) < 1e-9
                  ? 'text-mute'
                  : (t.delta > 0) !== !!t.badWhenUp
                    ? 'text-neon-green'
                    : 'text-neon-pink')
              }
            >
              {Math.abs(t.delta) < 1e-9 ? '■' : t.delta > 0 ? '▲' : '▼'}
              {t.pct
                ? Math.abs(t.delta * 100).toFixed(2) + '%'
                : Math.abs(t.delta).toFixed(2)}
            </span>
          )}
          <span className="text-white/15 pl-3">✦</span>
        </div>
      ))}
      <div className="flex items-center gap-3 px-6 whitespace-nowrap">
        <span className="font-mono text-[10px] tracking-[0.25em] text-neon-amber uppercase">
          SOURCE · DATA.GOV.MY VIA PASARAPI
        </span>
        <span className="text-white/15 pl-3">✦</span>
      </div>
    </div>
  );

  return (
    <div className="marquee relative border-y border-line bg-black/50 backdrop-blur overflow-hidden py-3">
      <div className="marquee-track flex w-max animate-marquee">
        {row(false)}
        {row(true)}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink to-transparent" />
    </div>
  );
}

const placeholder: Tick[] = [
  { label: 'RON95', value: 'RM --.--' },
  { label: 'RON97', value: 'RM --.--' },
  { label: 'DIESEL', value: 'RM --.--' },
  { label: 'USD/MYR', value: '—' },
  { label: 'SGD/MYR', value: '—' },
  { label: 'EUR/MYR', value: '—' },
];
