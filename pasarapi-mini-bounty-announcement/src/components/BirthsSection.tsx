import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Baby } from 'lucide-react';
import { fetchCatalogue, fmtDay, fmtInt, useAsyncData } from '../lib/api';
import { useInView, useAnimatedNumber } from '../hooks/useFx';
import { ChartTip, ErrorPanel, Panel, Reveal, SectionShell, Skeleton } from './ui';

interface BirthRow {
  date: string;
  state: string;
  births: number;
}

export function BirthsSection() {
  const { data, loading, error, retry } = useAsyncData(async () => {
    const rows = await fetchCatalogue<BirthRow>({
      id: 'births',
      limit: 1600,
      sort: '-date',
      filters: { state: 'Malaysia' },
    });
    return rows.filter(r => r.state === 'Malaysia');
  });

  const computed = useMemo(() => {
    const rows = [...(data ?? [])].sort((a, b) => a.date.localeCompare(b.date));
    if (!rows.length) return null;
    const chart = rows.slice(-90).map(r => ({ date: fmtDay(r.date), births: r.births }));
    const avg = rows.reduce((s, r) => s + r.births, 0) / rows.length;
    const peak = [...rows].sort((a, b) => b.births - a.births)[0];
    const quiet = [...rows].sort((a, b) => a.births - b.births)[0];
    const latest = rows[rows.length - 1];
    return { chart, avg, peak, quiet, latest };
  }, [data]);

  return (
    <SectionShell
      id="births"
      no="04"
      kicker="JPN Registration Feed"
      title={['KELAHIRAN', 'HARIAN']}
      accent="#ff2e88"
      blurb="// Jabatan Pendaftaran Negara · daily live births registered across Malaysia"
      right={
        computed && (
          <div className="font-mono text-[10px] tracking-[0.25em] text-mute text-right">
            <p>DAILY REGISTRY</p>
            <p className="text-neon-pink mt-1">LAST 90 DAYS PLOTTED</p>
          </div>
        )
      }
    >
      {loading && <Skeleton label="Warming up the nursery" height="h-[420px]" />}
      {error && <ErrorPanel label="Births feed" code={error} onRetry={retry} height="h-[420px]" />}
      {!loading && !error && !computed && (
        <ErrorPanel label="Births feed" code="NO_ROWS" onRetry={retry} height="h-[420px]" />
      )}

      {!loading && !error && computed && (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* big counter */}
          <Reveal className="lg:col-span-2">
            <Panel accent="#ff2e88" className="p-6 md:p-8 h-full flex flex-col justify-between">
              <div>
                <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-mute">
                  New Malaysians registered
                </p>
                <p className="font-mono text-[10px] tracking-[0.2em] text-mute mt-0.5">
                  {fmtDay(computed.latest.date)}
                </p>
              </div>
              <BigBirths value={computed.latest.births} />
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Stat label="AVG / DAY" value={fmtInt(computed.avg)} tone="text-white" />
                <Stat label="PER HOUR" value={'~' + Math.round(computed.avg / 24)} tone="text-neon-pink" />
                <Stat label={`PEAK · ${fmtDay(computed.peak.date).toUpperCase()}`} value={fmtInt(computed.peak.births)} tone="text-white" />
                <Stat label={`QUIET · ${fmtDay(computed.quiet.date).toUpperCase()}`} value={fmtInt(computed.quiet.births)} tone="text-white" />
              </div>
            </Panel>
          </Reveal>

          {/* sparkline */}
          <Reveal delay={140} className="lg:col-span-3">
            <Panel accent="#ff2e88" className="p-5 md:p-6 h-full">
              <div className="flex items-center gap-2 mb-3">
                <Baby className="w-3.5 h-3.5 text-neon-pink" />
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-mute">
                  Registrations per day
                </p>
              </div>
              <div className="h-64 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={computed.chart} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                    <defs>
                      <linearGradient id="birthGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff2e88" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#ff2e88" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#6b6b7d', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                      axisLine={false}
                      tickLine={false}
                      interval={Math.max(1, Math.floor(computed.chart.length / 6))}
                    />
                    <YAxis
                      tick={{ fill: '#6b6b7d', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip content={(p: any) => <ChartTip {...p} unit="babies" />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
                    <Area type="monotone" dataKey="births" stroke="#ff2e88" strokeWidth={2.25} fill="url(#birthGlow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 font-mono text-[9px] tracking-[0.2em] text-mute text-right">
                WEEKEND DIPS VISIBLE · REGISTRATIONS LAG DELIVERY DATES
              </p>
            </Panel>
          </Reveal>
        </div>
      )}
    </SectionShell>
  );
}

function BigBirths({ value }: { value: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const animated = useAnimatedNumber(value, inView, 1600);
  return (
    <div ref={ref} className="my-8">
      <p className="font-mono font-extrabold tabular-nums tracking-tight text-6xl md:text-7xl text-neon-pink glow-pink">
        {fmtInt(animated)}
      </p>
      <p className="font-mono text-[10px] tracking-[0.4em] text-mute mt-2">BABIES</p>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="border border-line rounded-xl p-3">
      <p className="font-mono text-[9px] tracking-[0.2em] text-mute">{label}</p>
      <p className={`font-mono text-lg font-bold tabular-nums mt-1 ${tone}`}>{value}</p>
    </div>
  );
}
