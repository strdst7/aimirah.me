import { useMemo, useState } from 'react';
import { ArrowLeftRight, Banknote } from 'lucide-react';
import { fetchCatalogue, fmtRate, fmtDayYear, useAsyncData } from '../lib/api';
import { ErrorPanel, Panel, Reveal, SectionShell, Skeleton } from './ui';
import { cn } from '@aimirah/shared/cn';

interface FxRow {
  date: string;
  rate_type: string;
  [k: string]: unknown;
}

const BOARD = ['usd', 'sgd', 'eur', 'gbp', 'aud', 'cny', 'jpy', 'thb', 'twd', 'hkd'] as const;

const NAMES: Record<string, string> = {
  usd: 'US DOLLAR', sgd: 'SINGAPORE DOLLAR', eur: 'EURO', gbp: 'POUND STERLING',
  aud: 'AUSTRALIAN DOLLAR', cny: 'RENMINBI', jpy: 'JAPANESE YEN', thb: 'THAI BAHT',
  twd: 'NEW TAIWAN DOLLAR', hkd: 'HONG KONG DOLLAR',
};

export function ForexSection() {
  const { data, loading, error, retry } = useAsyncData(() =>
    fetchCatalogue<FxRow>({ id: 'exchangerates_daily_1200', limit: 12, sort: '-date' })
  );
  const [selected, setSelected] = useState<string>('usd');
  const [amount, setAmount] = useState('100');

  const rows = useMemo(() => {
    if (!data) return null;
    const dates = [...new Set(data.map(r => r.date))].sort().reverse();
    const find = (d: string, t: string) => data.find(r => r.date === d && r.rate_type === t);
    const d0 = dates[0];
    return {
      date: d0,
      mid: find(d0, 'middle'),
      buy: find(d0, 'buying'),
      sell: find(d0, 'selling'),
      prevMid: dates[1] ? find(dates[1], 'middle') : undefined,
    };
  }, [data]);

  const amt = parseFloat(amount) || 0;
  const selRate = rows?.mid ? (rows.mid[selected] as number | null) : null;
  const converted = selRate != null ? amt * selRate : null;
  const inverse = selRate != null && selRate !== 0 ? 1 / selRate : null;

  return (
    <SectionShell
      id="forex"
      no="02"
      kicker="TT Board — BNM 12:00 Noon"
      title={['MONEY', 'CHANGER']}
      accent="#3dff8f"
      blurb="// Bank Negara Malaysia · middle rates vs ringgit, published every business day at noon · tap a row to convert"
      right={
        rows && (
          <div className="font-mono text-[10px] tracking-[0.25em] text-mute text-right">
            <p>SESSION 12:00</p>
            <p className="text-neon-green mt-1">{fmtDayYear(rows.date).toUpperCase()}</p>
          </div>
        )
      }
    >
      {loading && <Skeleton label="Counting notes" height="h-[480px]" />}
      {error && <ErrorPanel label="Forex board" code={error} onRetry={retry} height="h-[480px]" />}
      {!loading && !error && !rows?.mid && (
        <ErrorPanel label="Forex board" code="NO_MIDDLE_ROW" onRetry={retry} height="h-[480px]" />
      )}

      {!loading && !error && rows?.mid && (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* ------- LED board ------- */}
          <Reveal className="lg:col-span-3">
            <Panel accent="#3dff8f" className="h-full">
              <div className="led-mask relative p-4 md:p-6 bg-black/40 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Banknote className="w-3.5 h-3.5 text-neon-green" />
                  <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-mute">
                    MYR per 1 unit · middle rate
                  </p>
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse-dot" />
                </div>

                <div className="font-mono text-[9px] tracking-[0.25em] text-mute grid grid-cols-[1fr_auto_auto] gap-x-4 pb-2 border-b border-line uppercase">
                  <span>Currency</span>
                  <span className="text-right w-24">Rate</span>
                  <span className="text-right w-20">Δ 1D</span>
                </div>

                <div>
                  {BOARD.map(code => {
                    const v = rows.mid![code] as number | null;
                    const pv = rows.prevMid ? (rows.prevMid[code] as number | null) : null;
                    const d = v != null && pv != null && pv !== 0 ? (v - pv) / pv : null;
                    const up = (d ?? 0) > 0;
                    const flat = d == null || Math.abs(d) < 1e-9;
                    const active = selected === code;
                    return (
                      <button
                        key={code}
                        onClick={() => setSelected(code)}
                        className={cn(
                          'w-full grid grid-cols-[1fr_auto_auto] gap-x-4 items-center py-2.5 border-b border-white/[0.04] transition-all text-left',
                          active ? 'bg-neon-green/[0.06] -mx-2 px-2 rounded' : 'hover:bg-white/[0.03] -mx-2 px-2 rounded'
                        )}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span
                            className={cn(
                              'font-mono text-[10px] font-bold w-8 text-center py-0.5 rounded border',
                              active ? 'border-neon-green/50 text-neon-green' : 'border-white/10 text-white/70'
                            )}
                          >
                            {code.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="truncate">
                            <span className="font-mono text-xs font-bold text-white">{code.toUpperCase()}</span>
                            <span className="hidden md:inline font-mono text-[9px] text-mute ml-2">
                              {NAMES[code]}
                            </span>
                          </span>
                        </span>
                        <span className="font-mono text-sm font-bold tabular-nums text-neon-green glow-green w-24 text-right">
                          {v != null ? fmtRate(v) : '—'}
                        </span>
                        <span
                          className={cn(
                            'font-mono text-[10px] font-bold tabular-nums w-20 text-right',
                            flat ? 'text-mute' : up ? 'text-neon-green' : 'text-neon-pink'
                          )}
                        >
                          {flat ? '■ —' : `${up ? '▲' : '▼'} ${d != null ? Math.abs(d * 100).toFixed(2) : '0.00'}%`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-4 font-mono text-[9px] tracking-[0.2em] text-mute">
                  GREEN = FOREIGN CURRENCY FIRMED vs MYR · BNM MIDDLE 12:00
                </p>
              </div>
            </Panel>
          </Reveal>

          {/* ------- converter ------- */}
          <Reveal delay={140} className="lg:col-span-2">
            <Panel accent="#3dff8f" className="p-6 md:p-7 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-neon-green" />
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-mute">
                  Kaunter Tukaran · Converter
                </p>
              </div>

              <p className="font-mono text-[9px] tracking-[0.3em] text-mute mb-2">YOU HAND OVER</p>
              <div className="flex items-baseline gap-3 border-b border-neon-green/30 pb-2 focus-within:border-neon-green transition-colors">
                <input
                  value={amount}
                  onChange={e => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
                  inputMode="decimal"
                  className="w-full bg-transparent font-mono text-4xl font-extrabold tabular-nums text-white outline-none placeholder:text-white/20"
                  placeholder="100"
                />
                <span className="font-mono text-sm font-bold text-neon-green">{selected.toUpperCase()}</span>
              </div>

              {/* currency chips */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {BOARD.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelected(c)}
                    className={cn(
                      'font-mono text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border transition-colors',
                      selected === c
                        ? 'border-neon-green text-ink bg-neon-green'
                        : 'border-white/10 text-mute hover:border-neon-green/40 hover:text-white'
                    )}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="my-6 flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-mute">
                <span className="h-px flex-1 bg-white/10" />
                YOU RECEIVE
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <p className="font-mono font-extrabold tabular-nums tracking-tight text-4xl md:text-5xl text-neon-green glow-green">
                RM{' '}
                {converted != null
                  ? converted.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : '--'}
              </p>

              {inverse != null && (
                <p className="mt-2 font-mono text-[11px] text-mute tabular-nums">
                  1 MYR = {selected === 'jpy' || inverse >= 100 ? inverse.toFixed(2) : fmtRate(inverse)}{' '}
                  {selected.toUpperCase()}
                </p>
              )}

              <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                <div className="border border-line rounded-xl p-3">
                  <p className="font-mono text-[9px] tracking-[0.25em] text-mute">BUYING TT</p>
                  <p className="font-mono text-sm font-bold text-white tabular-nums mt-1">
                    {rows.buy?.[selected] != null ? fmtRate(rows.buy[selected] as number) : '—'}
                  </p>
                </div>
                <div className="border border-line rounded-xl p-3">
                  <p className="font-mono text-[9px] tracking-[0.25em] text-mute">SELLING TT</p>
                  <p className="font-mono text-sm font-bold text-white tabular-nums mt-1">
                    {rows.sell?.[selected] != null ? fmtRate(rows.sell[selected] as number) : '—'}
                  </p>
                </div>
              </div>
            </Panel>
          </Reveal>
        </div>
      )}
    </SectionShell>
  );
}
