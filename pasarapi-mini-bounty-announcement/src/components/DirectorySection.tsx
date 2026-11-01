import { useMemo, useState } from 'react';
import { ExternalLink, Search, Lock, Unlock } from 'lucide-react';
import { fetchJson, useAsyncData } from '../lib/api';
import { FALLBACK_APIS, ApiEntry } from '../data/fallbackApis';
import { Panel, Reveal, SectionShell, Skeleton } from './ui';
import { cn } from '@aimirah/shared/cn';

interface CatalogueResponse {
  updated: string;
  count: number;
  apis: ApiEntry[];
}

const COUNTRIES = ['ALL', 'MY', 'SG', 'TH', 'ID', 'VN'] as const;

export function DirectorySection() {
  const { data, loading } = useAsyncData(async () => {
    try {
      const json = await fetchJson<CatalogueResponse>('https://pasarapi.xyz/api/catalogue');
      return { apis: json.apis, live: true, count: json.count };
    } catch (error) {
      // CORS or offline — serve the curated snapshot instead. Log it so the
      // failure is diagnosable; previously this was swallowed silently
      // (CONCERNS.md #24). The UI already shows a "CACHED SNAPSHOT" badge.
      console.warn('[DirectorySection] live catalogue unavailable, using snapshot:', error);
      return { apis: FALLBACK_APIS, live: false, count: FALLBACK_APIS.length };
    }
  });

  const [query, setQuery] = useState('');
  const [country, setCountry] = useState<(typeof COUNTRIES)[number]>('MY');
  const [openOnly, setOpenOnly] = useState(false);

  const filtered = useMemo(() => {
    const apis = data?.apis ?? [];
    return apis.filter(a => {
      const q = query.trim().toLowerCase();
      const hitQ =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.provider.toLowerCase().includes(q);
      const hitC = country === 'ALL' || a.country.includes(country);
      const hitT = !openOnly || a.tier === 'open';
      return hitQ && hitC && hitT;
    });
  }, [data, query, country, openOnly]);

  const shown = filtered.slice(0, 60);

  return (
    <SectionShell
      id="directory"
      no="06"
      kicker="The API Directory Itself"
      title={['DIREKTORI', 'PASAR']}
      accent="#ff2e88"
      blurb="// pasarapi.xyz/api/catalogue — every API listed on PasarAPI, searchable from this very page"
      right={
        data && (
          <div className="font-mono text-[10px] tracking-[0.25em] text-right">
            <p className={data.live ? 'text-neon-green' : 'text-neon-amber'}>
              {data.live ? '● LIVE CATALOGUE' : '● CACHED SNAPSHOT'}
            </p>
            <p className="text-mute mt-1">{data.count} ENTRIES INDEXED</p>
          </div>
        )
      }
    >
      {loading && <Skeleton label="Unrolling the directory scroll" height="h-[520px]" />}

      {data && (
        <Reveal>
          <Panel accent="#ff2e88">
            {/* control bar */}
            <div className="p-4 md:p-5 border-b border-line flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mute" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="grep pasar*  (fuel, payment, weather…)"
                  className="w-full bg-black/40 border border-line rounded-lg pl-10 pr-4 py-2.5 font-mono text-xs text-white placeholder:text-mute/70 outline-none focus:border-neon-pink/50 focus:shadow-[0_0_20px_rgba(255,46,136,0.15)] transition-all caret-[#3dff8f]"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {COUNTRIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCountry(c)}
                    className={cn(
                      'font-mono text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-md border transition-colors',
                      country === c
                        ? 'bg-white text-ink border-white'
                        : 'border-white/10 text-mute hover:text-white hover:border-white/25'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setOpenOnly(v => !v)}
                className={cn(
                  'font-mono text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-md border transition-colors inline-flex items-center gap-1.5',
                  openOnly
                    ? 'bg-neon-green text-ink border-neon-green'
                    : 'border-white/10 text-mute hover:text-white'
                )}
              >
                <Unlock className="w-3 h-3" /> NO-KEY ONLY
              </button>
            </div>

            {/* header row */}
            <div className="hidden md:grid grid-cols-[1fr_8rem_7rem_6rem_5rem_2rem] gap-x-4 px-5 md:px-6 py-2.5 border-b border-line font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
              <span>API / Provider</span>
              <span>Category</span>
              <span>Tier</span>
              <span>Auth</span>
              <span>Region</span>
              <span />
            </div>

            {/* rows */}
            <div className="max-h-[520px] overflow-y-auto">
              {shown.map(a => (
                <a
                  key={a.id}
                  href={a.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-[1fr_2rem] md:grid-cols-[1fr_8rem_7rem_6rem_5rem_2rem] gap-x-4 items-center px-5 md:px-6 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] hover:pl-7 transition-all"
                >
                  <span className="min-w-0">
                    <span className="block font-mono text-xs font-bold text-white/90 group-hover:text-neon-pink transition-colors truncate">
                      {a.title}
                    </span>
                    <span className="block font-mono text-[9px] text-mute truncate mt-0.5">
                      {a.provider}
                    </span>
                  </span>
                  <span className="hidden md:block font-mono text-[9px] uppercase tracking-wider text-white/60 truncate">
                    {a.category}
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1.5">
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        a.tier === 'open' ? 'bg-neon-green' : 'bg-neon-amber'
                      )}
                    />
                    <span
                      className={cn(
                        'font-mono text-[9px] uppercase tracking-wider',
                        a.tier === 'open' ? 'text-neon-green' : 'text-neon-amber'
                      )}
                    >
                      {a.tier}
                    </span>
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-mute">
                    {a.auth === 'none' ? (
                      <Unlock className="w-2.5 h-2.5 text-neon-green" />
                    ) : (
                      <Lock className="w-2.5 h-2.5 text-neon-amber" />
                    )}
                    {a.auth === 'none' ? 'none' : a.auth}
                  </span>
                  <span className="hidden md:flex gap-1">
                    {a.country.map(c => (
                      <span
                        key={c}
                        className="font-mono text-[8.5px] font-bold text-white/60 border border-white/10 rounded px-1 py-px"
                      >
                        {c}
                      </span>
                    ))}
                  </span>
                  <ExternalLink className="w-3 h-3 text-mute group-hover:text-neon-pink transition-colors justify-self-end" />
                </a>
              ))}

              {shown.length === 0 && (
                <div className="px-6 py-14 text-center">
                  <p className="font-mono text-xs text-mute">// zero matches — the pasar is closed for that query</p>
                  <button
                    onClick={() => { setQuery(''); setCountry('ALL'); setOpenOnly(false); }}
                    className="mt-3 font-mono text-[10px] tracking-[0.2em] text-neon-pink hover:underline"
                  >
                    RESET FILTERS
                  </button>
                </div>
              )}
            </div>

            <div className="px-5 md:px-6 py-3 border-t border-line flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[9px] tracking-[0.2em] text-mute">
                SHOWING {shown.length} / {filtered.length} MATCHES
              </p>
              <a
                href="https://pasarapi.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[9px] tracking-[0.2em] text-neon-pink hover:underline"
              >
                PASARAPI.XYZ ↗
              </a>
            </div>
          </Panel>
        </Reveal>
      )}
    </SectionShell>
  );
}
