import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { fetchCatalogue, useAsyncData } from '../lib/api';
import { useInView, useAnimatedNumber } from '../hooks/useFx';
import { ErrorPanel, Panel, SectionShell, Skeleton } from './ui';
import { cn } from '@aimirah/shared/cn';

interface PopRow {
  date: string;
  state: string;
  sex: string;
  age: string;
  ethnicity: string;
  population: number; // thousands
}

const shorten = (s: string) =>
  s.replace('W.P. ', '').replace('Pulau Pinang', 'P. Pinang').replace('Negeri Sembilan', 'N. Sembilan');

export function PopulationSection() {
  const { data, loading, error, retry } = useAsyncData(async () => {
    // Primary: documented server-side filters (17 overall rows per date).
    const rows = await fetchCatalogue<PopRow>({
      id: 'population_state',
      limit: 220,
      sort: '-date',
      filters: { sex: 'overall_sex', age: 'overall_age', ethnicity: 'overall_ethnicity' },
    });
    // Normalise client-side regardless (in case filters were ignored).
    return rows.filter(
      r => r.sex === 'overall_sex' && r.age === 'overall_age' && r.ethnicity === 'overall_ethnicity'
    );
  });

  const { states, national, year } = useMemo(() => {
    const rows = data ?? [];
    if (!rows.length) return { states: [] as PopRow[], national: null as PopRow | null, year: '' };
    const latestDate = rows.map(r => r.date).sort().reverse()[0];
    const atDate = rows.filter(r => r.date === latestDate);
    const nat = atDate.find(r => r.state === 'Malaysia') ?? null;
    const st = atDate
      .filter(r => r.state !== 'Malaysia')
      .sort((a, b) => b.population - a.population);
    return { states: st, national: nat, year: new Date(latestDate + 'T00:00:00').getFullYear().toString() };
  }, [data]);

  return (
    <SectionShell
      id="census"
      no="03"
      kicker="DOSM Population Estimates"
      title={['BANCI', 'RAKYAT']}
      accent="#2dd4ee"
      blurb="// Department of Statistics Malaysia · current population estimates by state, in thousands"
      right={
        national && (
          <div className="text-right">
            <NationalTotal value={national.population} />
            <p className="font-mono text-[9px] tracking-[0.3em] text-mute mt-1">MALAYSIA · '000 · {year}</p>
          </div>
        )
      }
    >
      {loading && <Skeleton label="Enumerating rakyat" height="h-[560px]" />}
      {error && <ErrorPanel label="Census feed" code={error} onRetry={retry} height="h-[560px]" />}
      {!loading && !error && states.length === 0 && (
        <ErrorPanel label="Census feed" code="NO_OVERALL_ROWS" onRetry={retry} height="h-[560px]" />
      )}

      {!loading && !error && states.length > 0 && <StateBars states={states} national={national} />}
    </SectionShell>
  );
}

function NationalTotal({ value }: { value: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.5);
  const animated = useAnimatedNumber(value, inView, 1600);
  return (
    <span ref={ref} className="font-display text-4xl md:text-5xl text-neon-cyan glow-cyan tabular-nums">
      {(animated / 1000).toFixed(2)}
      <span className="text-xl md:text-2xl text-white/60">M</span>
    </span>
  );
}

function StateBars({ states, national }: { states: PopRow[]; national: PopRow | null }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.1);
  const max = states[0]?.population ?? 1;
  const natTotal = national?.population ?? null;

  return (
    <div ref={ref}>
      <Panel accent="#2dd4ee" className="p-5 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-3.5 h-3.5 text-neon-cyan" />
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-mute">
            16 states &amp; territories · ranked · hover for share
          </p>
        </div>

        <div className="space-y-[13px]">
          {states.map((s, i) => {
            const pct = (s.population / max) * 100;
            const share = natTotal ? (s.population / natTotal) * 100 : null;
            return (
              <div key={s.state} className="group relative">
                <div className="grid grid-cols-[2rem_minmax(6rem,9rem)_1fr_auto] md:grid-cols-[2.5rem_10rem_1fr_auto] items-center gap-x-3">
                  <span className="font-mono text-[10px] text-mute tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-[11px] uppercase tracking-wider truncate transition-colors',
                      i < 3 ? 'text-white' : 'text-mute group-hover:text-white'
                    )}
                  >
                    {shorten(s.state)}
                  </span>
                  <div className="h-[18px] bg-white/[0.04] rounded-sm overflow-hidden relative">
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width: inView ? `${pct}%` : '0%',
                        transition: `width 1.1s cubic-bezier(0.22,1,0.36,1) ${i * 45}ms`,
                        background:
                          i < 3
                            ? 'linear-gradient(90deg, rgba(45,212,238,0.35), #2dd4ee)'
                            : 'linear-gradient(90deg, rgba(45,212,238,0.16), rgba(45,212,238,0.45))',
                        boxShadow: i < 3 ? '0 0 12px rgba(45,212,238,0.35)' : undefined,
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs md:text-sm font-bold tabular-nums text-white/85 w-20 md:w-24 text-right">
                    {s.population.toLocaleString('en-MY', { minimumFractionDigits: 1 })}
                    <span className="text-mute text-[9px] ml-0.5">K</span>
                  </span>
                </div>
                {/* share tooltip */}
                {share != null && (
                  <div className="pointer-events-none absolute -top-7 right-0 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[9px] tracking-[0.15em] text-neon-cyan bg-black/80 border border-neon-cyan/30 rounded px-2 py-1">
                    {share.toFixed(1)}% OF MALAYSIA
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-6 pt-4 border-t border-line font-mono text-[9px] tracking-[0.2em] text-mute text-right">
          TOPOGRAPHY IN THOUSANDS ('000) · DOSM VIA DATA.GOV.MY
        </p>
      </Panel>
    </div>
  );
}
