import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Fuel } from 'lucide-react';
import { fetchCatalogue, fmtDay, fmtDayYear, useAsyncData } from '../lib/api';
import { useInView, useAnimatedNumber } from '../hooks/useFx';
import { ChartTip, ErrorPanel, Panel, Reveal, SectionShell, Skeleton } from './ui';

interface FuelRow {
  date: string;
  series_type: string;
  ron95: number | null;
  ron97: number | null;
  diesel: number | null;
  ron95_budi95: number | null;
  ron95_skps: number | null;
}

const PUMPS = [
  { key: 'ron95' as const, label: 'RON 95', color: '#ffb020', ace: 'text-neon-amber', glow: 'glow-amber' },
  { key: 'ron97' as const, label: 'RON 97', color: '#2dd4ee', ace: 'text-neon-cyan', glow: 'glow-cyan' },
  { key: 'diesel' as const, label: 'DIESEL', color: '#ff2e88', ace: 'text-neon-pink', glow: 'glow-pink' },
];

function PumpBoard({
  label,
  color,
  ace,
  glow,
  price,
  delta,
  date,
  delay,
}: {
  label: string;
  color: string;
  ace: string;
  glow: string;
  price: number;
  delta: number | null;
  date: string;
  delay: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const animated = useAnimatedNumber(price, inView, 1500);
  const up = (delta ?? 0) > 0;
  const flat = delta == null || Math.abs(delta) < 1e-9;

  return (
    <Reveal delay={delay}>
      <div ref={ref}>
        <Panel accent={color} className="p-6 md:p-7 text-center group">
          {/* screw heads */}
          <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-white/15" />
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-white/15" />

          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-mute">{label}</p>
          <div className="mt-3 relative">
            <span className="font-mono text-[10px] text-mute absolute -left-1 top-1.5">RM</span>
            <p
              className={`font-mono font-extrabold tabular-nums tracking-tight text-5xl md:text-6xl ${ace} ${glow}`}
            >
              {animated.toFixed(2)}
            </p>
          </div>
          <p className="font-mono text-[10px] text-mute mt-1 tracking-[0.3em]">PER LITRE</p>

          <div className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tabular-nums">
            <span className={flat ? 'text-mute' : up ? 'text-neon-pink' : 'text-neon-green'}>
              {flat ? '■' : up ? '▲' : '▼'} {flat ? '0.00' : Math.abs(delta!).toFixed(2)}
            </span>
            <span className="text-mute font-normal">/ WK</span>
          </div>

          <div className="mt-4 pt-4 border-t border-line font-mono text-[9px] tracking-[0.25em] text-mute">
            W.E. {date.toUpperCase()}
          </div>
        </Panel>
      </div>
    </Reveal>
  );
}

export function FuelSection() {
  const { data, loading, error, retry } = useAsyncData(() =>
    fetchCatalogue<FuelRow>({ id: 'fuelprice', limit: 104, sort: '-date' })
  );

  const { levels, chart, latest, prev } = useMemo(() => {
    const lv = (data ?? [])
      .filter(r => r.series_type === 'level')
      .sort((a, b) => a.date.localeCompare(b.date));
    const ch = lv.slice(-52).map(r => ({
      date: fmtDay(r.date),
      RON95: r.ron95,
      RON97: r.ron97,
      DIESEL: r.diesel,
    }));
    return { levels: lv, chart: ch, latest: lv[lv.length - 1], prev: lv[lv.length - 2] };
  }, [data]);

  return (
    <SectionShell
      id="fuel"
      no="01"
      kicker="Weekly Retail Price Board"
      title={['STESEN', 'MINYAK']}
      accent="#ffb020"
      blurb="// Ministry of Finance · automatic pricing mechanism · RON95 / RON97 / diesel, per litre, every week since 2017"
      right={
        latest && (
          <div className="font-mono text-[10px] tracking-[0.25em] text-mute text-right">
            <p>NEXT REVIEW: WED</p>
            <p className="text-neon-amber mt-1">W.E. {fmtDayYear(latest.date).toUpperCase()}</p>
          </div>
        )
      }
    >
      {loading && <Skeleton label="Pumping MOF feed" height="h-96" />}
      {error && <SkeletonError code={error} retry={retry} />}
      {!loading && !error && !latest && <SkeletonError code="NO_LEVEL_ROWS" retry={retry} />}

      {!loading && !error && latest && (
        <>
          {/* pump boards */}
          <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
            {PUMPS.map((p, i) => (
              <PumpBoard
                key={p.key}
                label={p.label}
                color={p.color}
                ace={p.ace}
                glow={p.glow}
                price={(latest[p.key] ?? 0) as number}
                delta={prev ? ((latest[p.key] ?? 0) as number) - ((prev[p.key] ?? 0) as number) : null}
                date={fmtDay(latest.date)}
                delay={i * 120}
              />
            ))}
          </div>

          {/* subsidy chips */}
          <Reveal delay={200}>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {latest.ron95_budi95 != null && (
                <span className="font-mono text-[10px] tracking-[0.2em] border border-neon-violet/40 text-neon-violet rounded-full px-3.5 py-1.5 bg-neon-violet/5">
                  BUDI95 · RM {latest.ron95_budi95.toFixed(2)}
                </span>
              )}
              {latest.ron95_skps != null && (
                <span className="font-mono text-[10px] tracking-[0.2em] border border-neon-cyan/40 text-neon-cyan rounded-full px-3.5 py-1.5 bg-neon-cyan/5">
                  SKPS FLEET · RM {latest.ron95_skps.toFixed(2)}
                </span>
              )}
              <span className="font-mono text-[10px] tracking-[0.2em] border border-line text-mute rounded-full px-3.5 py-1.5">
                52-WEEK TAPE BELOW
              </span>
            </div>
          </Reveal>

          {/* chart */}
          <Reveal delay={280}>
            <Panel className="mt-6 p-4 md:p-6" accent="#ffb020">
              <div className="flex items-center gap-2 mb-4">
                <Fuel className="w-3.5 h-3.5 text-neon-amber" />
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-mute">
                  Weekly tape · RM / litre
                </p>
              </div>
              <div className="h-72 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chart} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#6b6b7d', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      axisLine={false}
                      tickLine={false}
                      interval={Math.max(1, Math.floor(chart.length / 7))}
                    />
                    <YAxis
                      tick={{ fill: '#6b6b7d', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      axisLine={false}
                      tickLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(v: number) => v.toFixed(2)}
                    />
                    <Tooltip content={(p: any) => <ChartTip {...p} unit="RM" />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
                    <Line type="monotone" dataKey="RON95" stroke="#ffb020" strokeWidth={2.25} dot={false} />
                    <Line type="monotone" dataKey="RON97" stroke="#2dd4ee" strokeWidth={2.25} dot={false} />
                    <Line type="monotone" dataKey="DIESEL" stroke="#ff2e88" strokeWidth={2.25} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 font-mono text-[9px] tracking-[0.2em] text-mute text-right">
                {levels.length} WEEKS ON RECORD · MOF VIA DATA.GOV.MY
              </p>
            </Panel>
          </Reveal>
        </>
      )}
    </SectionShell>
  );
}

function SkeletonError({ code, retry }: { code: string | null; retry: () => void }) {
  return <ErrorPanel label="Fuel feed" code={code} onRetry={retry} height="h-96" />;
}
