import { useMemo, useState } from 'react';
import { Wallet } from 'lucide-react';
import { fetchCatalogue, fmtInt, useAsyncData } from '../lib/api';
import { useInView } from '../hooks/useFx';
import { ErrorPanel, Panel, Reveal, SectionShell, Skeleton } from './ui';
import { cn } from '../utils/cn';

interface HiesRow {
  date: string;
  state: string;
  income_mean: number;
  income_median: number;
  expenditure_mean: number;
  gini: number;
  poverty: number;
}

type Metric = 'income_median' | 'income_mean' | 'poverty' | 'gini';

const METRICS: { key: Metric; label: string; color: string; fmt: (v: number) => string }[] = [
  { key: 'income_median', label: 'MEDIAN', color: '#2dd4ee', fmt: v => 'RM ' + fmtInt(v) },
  { key: 'income_mean', label: 'MEAN', color: '#a78bfa', fmt: v => 'RM ' + fmtInt(v) },
  { key: 'poverty', label: 'POVERTY %', color: '#ff2e88', fmt: v => v.toFixed(1) + '%' },
  { key: 'gini', label: 'GINI', color: '#ffb020', fmt: v => v.toFixed(3) },
];

const shorten = (s: string) =>
  s.replace('W.P. ', '').replace('Pulau Pinang', 'P. Pinang').replace('Negeri Sembilan', 'N. Sembilan');

export function IncomeSection() {
  const { data, loading, error, retry } = useAsyncData(() =>
    fetchCatalogue<HiesRow>({ id: 'hies_state', limit: 40, sort: '-date' })
  );
  const [metric, setMetric] = useState<Metric>('income_median');

  const { states, national } = useMemo(() => {
    const rows = data ?? [];
    const nat = rows.find(r => r.state === 'Malaysia') ?? null;
    const st = rows.filter(r => r.state !== 'Malaysia');
    return { states: st, national: nat };
  }, [data]);

  const m = METRICS.find(x => x.key === metric)!;

  return (
    <SectionShell
      id="income"
      no="05"
      kicker="HIES 2022 Household Survey"
      title={['PENDAPATAN', 'ISI RUMAH']}
      accent="#a78bfa"
      blurb="// DOSM Household Income & Expenditure Survey 2022 · who earns what, state by state · toggle the lens"
      right={
        <div className="flex flex-wrap gap-1.5">
          {METRICS.map(x => (
            <button
              key={x.key}
              onClick={() => setMetric(x.key)}
              className={cn(
                'font-mono text-[10px] font-bold tracking-[0.2em] px-3.5 py-1.5 rounded-full border transition-all',
                metric === x.key
                  ? 'text-ink'
                  : 'border-white/10 text-mute hover:text-white hover:border-white/25'
              )}
              style={metric === x.key ? { background: x.color, borderColor: x.color } : undefined}
            >
              {x.label}
            </button>
          ))}
        </div>
      }
    >
      {loading && <Skeleton label="Opening pay envelopes" height="h-[560px]" />}
      {error && <ErrorPanel label="HIES feed" code={error} onRetry={retry} height="h-[560px]" />}

      {!loading && !error && states.length > 0 && (
        <>
          {/* national headline chips */}
          {national && (
            <Reveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <NatChip label="MY MEDIAN / MO" value={'RM ' + fmtInt(national.income_median)} color="#2dd4ee" />
                <NatChip label="MY MEAN / MO" value={'RM ' + fmtInt(national.income_mean)} color="#a78bfa" />
                <NatChip label="POVERTY RATE" value={national.poverty.toFixed(1) + '%'} color="#ff2e88" />
                <NatChip label="GINI INDEX" value={national.gini.toFixed(3)} color="#ffb020" />
              </div>
            </Reveal>
          )}
          <MetricBars key={metric} states={states} metric={metric} color={m.color} fmt={m.fmt} />
        </>
      )}
    </SectionShell>
  );
}

function NatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border border-line rounded-xl p-4 bg-panel/60 relative overflow-hidden">
      <div className="absolute left-0 inset-y-0 w-[3px]" style={{ background: color }} />
      <p className="font-mono text-[9px] tracking-[0.25em] text-mute">{label}</p>
      <p className="font-mono text-xl font-bold tabular-nums text-white mt-1.5">{value}</p>
    </div>
  );
}

function MetricBars({
  states,
  metric,
  color,
  fmt,
}: {
  states: HiesRow[];
  metric: Metric;
  color: string;
  fmt: (v: number) => string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.08);
  const sorted = useMemo(
    () => [...states].sort((a, b) => b[metric] - a[metric]),
    [states, metric]
  );
  const max = sorted[0]?.[metric] ?? 1;

  return (
    <div ref={ref}>
      <Reveal>
        <Panel accent={color} className="p-5 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="w-3.5 h-3.5" />
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-mute">
              {metric === 'gini'
                ? 'Higher = more unequal · 0 perfect equality'
                : metric === 'poverty'
                  ? 'Share of households below the poverty line'
                  : 'Gross monthly household income · ranked'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-10 gap-y-[13px]">
            {sorted.map((s, i) => {
              const v = s[metric];
              const pct = (v / max) * 100;
              const isTop = i === 0;
              return (
                <div key={s.state} className="group">
                  <div className="flex items-baseline justify-between mb-1">
                    <span
                      className={cn(
                        'font-mono text-[10.5px] uppercase tracking-wider truncate transition-colors',
                        isTop ? 'text-white' : 'text-mute group-hover:text-white'
                      )}
                    >
                      <span className="text-white/30 mr-1.5 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      {shorten(s.state)}
                    </span>
                    <span className="font-mono text-xs font-bold tabular-nums text-white/90 ml-3">
                      {fmt(v)}
                    </span>
                  </div>
                  <div className="h-[14px] bg-white/[0.04] rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width: inView ? `${pct}%` : '0%',
                        transition: `width 1s cubic-bezier(0.22,1,0.36,1) ${(i % 8) * 45}ms`,
                        background: isTop
                          ? `linear-gradient(90deg, ${color}44, ${color})`
                          : `linear-gradient(90deg, ${color}22, ${color}66)`,
                        boxShadow: isTop ? `0 0 12px ${color}55` : undefined,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-6 pt-4 border-t border-line font-mono text-[9px] tracking-[0.2em] text-mute text-right">
            HIES 2022 · DOSM VIA DATA.GOV.MY
          </p>
        </Panel>
      </Reveal>
    </div>
  );
}
