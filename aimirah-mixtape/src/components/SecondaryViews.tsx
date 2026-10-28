import React, { useMemo, useState } from 'react';
import {
  CLI_PACKAGE,
  formatComponentTitle,
  JOBS_DATA,
  lookupCatalogItem,
  PLUGIN_MARKETPLACES,
  stripExt,
  TRENDING_DATA,
} from '../data/catalog';
import {
  CatalogItem,
  ComponentTypePlural,
  JobPosting,
  MixtapeCollection,
} from '../types/catalog';
import { CountryFlag, TYPE_META, TypeIcon } from './Icons';

const SOURCE_BADGES: Record<string, string> = {
  HackerNews: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  RemoteOK: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  WeWorkRemotely: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Anthropic: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

export const JobsSidebar: React.FC<{
  onViewAllJobs: () => void;
  onSelectJob: (job: JobPosting) => void;
}> = ({ onViewAllJobs, onSelectJob }) => {
  const jobs = (JOBS_DATA?.jobs ?? []).slice(0, 12);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-0)] sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
              Jobs
            </span>
            <span className="font-mono text-[9px] font-medium bg-orange-500/15 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20">
              {JOBS_DATA?.totalJobs ?? jobs.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onViewAllJobs}
            className="font-mono text-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
          >
            view all →
          </button>
        </div>
        <p className="font-mono text-[9px] text-[var(--color-text-tertiary)] mt-0.5">
          Teams building with Claude Code
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2">
        {jobs.map((job) => (
          <button
            key={job.id}
            type="button"
            onClick={() => onSelectJob(job)}
            className="w-full text-left flex items-start gap-2.5 p-2.5 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-card-bg)] hover:bg-[var(--color-card-hover)] transition-all group cursor-pointer"
          >
            <div className="w-6 h-6 rounded shrink-0 bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center font-mono text-[10px] font-bold text-[var(--color-accent)] mt-0.5">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10.5px] font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2 leading-tight mb-1">
                {job.position}
              </p>
              <p className="font-mono text-[9.5px] text-[var(--color-text-tertiary)] truncate mb-1.5">
                {job.company} · {job.location}
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                {job.remote && (
                  <span className="text-[8px] font-mono font-medium bg-blue-500/15 text-blue-400 px-1 py-0.5 rounded border border-blue-500/20">
                    Remote
                  </span>
                )}
                {job.salary && (
                  <span className="text-[8px] font-mono font-medium bg-emerald-500/15 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/20">
                    {job.salary}
                  </span>
                )}
                <span
                  className={`text-[8px] font-mono font-medium px-1 py-0.5 rounded border ${
                    SOURCE_BADGES[job.source] ||
                    'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                  }`}
                >
                  {job.source}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export const JobsView: React.FC<{
  onSelectJob: (job: JobPosting) => void;
}> = ({ onSelectJob }) => {
  const [query, setQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const jobs = useMemo(() => {
    return (JOBS_DATA?.jobs ?? []).filter((j) => {
      if (remoteOnly && !j.remote) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        j.position.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, remoteOnly]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in-up">
      <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface-1)] to-[var(--color-surface-2)] p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-orange-500/15 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
              AI Native Engineering Roles · {JOBS_DATA?.totalJobs ?? jobs.length} Open
            </div>
            <h1 className="text-2xl font-mono font-bold text-[var(--color-text-primary)]">
              Jobs Using Claude Code &amp; Agentic Workflows
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Curated roles from engineering teams building with AI agents, MCP servers, and modern developer tooling.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRemoteOnly((v) => !v)}
            className={`px-3.5 py-2 rounded-lg font-mono text-xs font-semibold border transition-colors cursor-pointer ${
              remoteOnly
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                : 'bg-[var(--color-surface-0)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
            }`}
          >
            {remoteOnly ? '✓ Remote Only' : 'Filter Remote Only'}
          </button>
        </div>

        <div className="mt-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by role, company, location, or skill (Rust, TypeScript, AWS, Applied AI)..."
            className="w-full bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-xs font-mono text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => onSelectJob(job)}
            className="p-5 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all cursor-pointer group flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center font-mono text-sm font-bold text-[var(--color-accent)]">
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold text-[var(--color-text-primary)]">
                      {job.company}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--color-text-tertiary)]">
                      {job.location}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                    SOURCE_BADGES[job.source] ||
                    'bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] border-[var(--color-border)]'
                  }`}
                >
                  {job.source}
                </span>
              </div>

              <h3 className="font-mono text-[14px] font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors mb-2">
                {job.position}
              </h3>

              <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                {job.description}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--color-border)]/50">
              <div className="flex flex-wrap gap-1.5">
                {job.remote && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
                    Remote
                  </span>
                )}
                {job.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] border border-[var(--color-border)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs font-mono text-[var(--color-accent)] shrink-0">
                Inspect →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrendingView: React.FC<{
  onSelectComponent: (item: CatalogItem) => void;
  onToggleStack: (item: CatalogItem) => void;
  isInStack: (item: CatalogItem) => boolean;
}> = ({ onSelectComponent, onToggleStack, isInStack }) => {
  const [selectedTab, setSelectedTab] = useState<'all' | ComponentTypePlural>('all');
  const [chartType, setChartType] = useState<ComponentTypePlural>('skills');

  const stats = TRENDING_DATA?.globalStats ?? {
    totalComponents: 2182,
    totalDownloads: 1618534,
    monthlyDownloads: 99850,
    weeklyDownloads: 21371,
    todayDownloads: 132,
    totalCountries: 190,
  };

  const rankings = (TRENDING_DATA?.trending?.[selectedTab] ?? []).slice(0, 20);
  const countries = TRENDING_DATA?.topCountries ?? [];
  const dates = TRENDING_DATA?.chartData?.dates ?? [];
  const series = TRENDING_DATA?.chartData?.series?.[chartType] ?? [];

  const svgPoints = useMemo(() => {
    if (series.length < 2) return { polyline: '', area: '', min: 0, max: 0 };
    const min = Math.min(...series);
    const max = Math.max(...series);
    const span = Math.max(1, max - min);
    const w = 640;
    const h = 160;
    const coords = series.map((val, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - ((val - min) / span) * (h - 24) - 12;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return {
      polyline: coords.join(' '),
      area: `0,${h} ${coords.join(' ')} ${w},${h}`,
      min,
      max,
    };
  }, [series]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in-up space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-mono font-bold text-[var(--color-text-primary)]">
            aimirah.mixtape Live Telemetry &amp; Charts
          </h1>
          <p className="text-xs font-mono text-[var(--color-text-secondary)] mt-1">
            Real-time CLI installations across {stats.totalCountries} countries
          </p>
        </div>
        <span className="hot-badge">● Live Telemetry Active</span>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'All-Time CLI Downloads', val: stats.totalDownloads.toLocaleString(), color: '#d57455' },
          { label: '30-Day Installs', val: stats.monthlyDownloads.toLocaleString(), color: '#3fb950' },
          { label: '7-Day Velocity', val: stats.weeklyDownloads.toLocaleString(), color: '#3b82f6' },
          { label: 'Indexed Components', val: stats.totalComponents.toLocaleString(), color: '#f59e0b' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="p-4 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)]"
          >
            <div className="font-mono text-2xl font-bold" style={{ color: kpi.color }}>
              {kpi.val}
            </div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-tertiary)] mt-1">
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* 30-Day Cumulative Download Curve */}
      {series.length > 1 && (
        <div className="p-5 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
                30-Day Cumulative Install Trajectory — {TYPE_META[chartType].label}
              </h2>
              <p className="font-mono text-[11px] text-[var(--color-text-tertiary)]">
                {dates[0]} → {dates[dates.length - 1]} ({svgPoints.min.toLocaleString()} to{' '}
                {svgPoints.max.toLocaleString()} installs)
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['skills', 'agents', 'commands', 'mcps', 'hooks', 'settings'] as ComponentTypePlural[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setChartType(t)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold cursor-pointer ${
                      chartType === t
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {TYPE_META[t].label}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="w-full overflow-hidden rounded-lg bg-[var(--color-surface-0)] p-3 border border-[var(--color-border)]">
            <svg viewBox="0 0 640 160" className="w-full h-40">
              <defs>
                <linearGradient id="mixtapeChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TYPE_META[chartType].color} stopOpacity="0.32" />
                  <stop offset="100%" stopColor={TYPE_META[chartType].color} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon points={svgPoints.area} fill="url(#mixtapeChartGrad)" />
              <polyline
                fill="none"
                stroke={TYPE_META[chartType].color}
                strokeWidth="2.5"
                points={svgPoints.polyline}
              />
            </svg>
          </div>
        </div>
      )}

      {/* Main Split: Top Leaderboard + Top Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
              Top Installed Tracks
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'skills', 'agents', 'commands', 'mcps', 'hooks', 'settings'] as const).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTab(t)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold cursor-pointer ${
                      selectedTab === t
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {t === 'all' ? 'All' : TYPE_META[t].label}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="divide-y divide-[var(--color-border)]/50">
            {rankings.map((row, idx) => {
              const matched = lookupCatalogItem(
                row.name,
                selectedTab === 'all' ? undefined : selectedTab
              );
              const medalClass =
                idx === 0
                  ? 'medal-gold'
                  : idx === 1
                  ? 'medal-silver'
                  : idx === 2
                  ? 'medal-bronze'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]';

              return (
                <div
                  key={`${row.id}-${idx}`}
                  onClick={() => matched && onSelectComponent(matched)}
                  className={`px-4 py-3 flex items-center gap-3.5 hover:bg-[var(--color-card-hover)] transition-colors ${
                    matched ? 'cursor-pointer' : ''
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${medalClass}`}
                  >
                    {idx + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] font-bold text-[var(--color-text-primary)] truncate">
                        {formatComponentTitle(row.name)}
                      </span>
                      {row.downloadsWeek > 50 && <span className="hot-badge">HOT</span>}
                    </div>
                    <span className="font-mono text-[11px] text-[var(--color-text-tertiary)]">
                      {row.category} · +{row.downloadsWeek.toLocaleString()} this week
                    </span>
                  </div>

                  <span className="badge-download shrink-0">
                    ↓ {row.downloadsTotal.toLocaleString()}
                  </span>

                  {matched && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStack(matched);
                      }}
                      className={`w-7 h-7 rounded flex items-center justify-center font-mono text-xs shrink-0 cursor-pointer ${
                        isInStack(matched)
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
                      }`}
                    >
                      {isInStack(matched) ? '✓' : '+'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Countries Breakdown */}
        <div className="rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)] overflow-hidden h-fit">
          <div className="p-4 border-b border-[var(--color-border)]">
            <h2 className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
              Top Countries
            </h2>
            <p className="font-mono text-[11px] text-[var(--color-text-tertiary)]">
              Global share of CLI installs
            </p>
          </div>
          <div className="p-4 space-y-3.5">
            {countries.map((c) => (
              <div key={c.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--color-text-primary)] font-medium inline-flex items-center gap-2">
                    <CountryFlag code={c.code} />
                    <span>{c.name}</span>
                  </span>
                  <span className="text-[var(--color-text-secondary)] tabular-nums">
                    {c.downloads.toLocaleString()} ({c.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)]"
                    style={{ width: `${Math.min(100, c.percentage * 6)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PluginsView: React.FC<{
  onNotify: (msg: string) => void;
}> = ({ onNotify }) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return PLUGIN_MARKETPLACES;
    const q = search.toLowerCase();
    return PLUGIN_MARKETPLACES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in-up">
      <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface-1)] to-[var(--color-surface-2)] p-6 mb-6">
        <h1 className="text-2xl font-mono font-bold text-[var(--color-text-primary)] mb-2">
          Claude Code Plugin Marketplaces
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)] max-w-2xl mb-4">
          Discover community and official plugin registries indexed by aimirah.mixtape. Copy any slash command below and paste it inside an active Claude Code session.
        </p>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search plugin marketplaces (security, postgres, frontend, rust, official)..."
          className="w-full max-w-lg bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-lg px-3.5 py-2 text-xs font-mono text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((plugin) => (
          <div
            key={plugin.id}
            className="p-5 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <h3 className="font-mono text-sm font-bold text-[var(--color-text-primary)] break-all">
                  {plugin.name}
                </h3>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25 shrink-0">
                  ★ {plugin.stars.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
                {plugin.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                  {plugin.pluginCount} plugins
                </span>
                {plugin.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] border border-[var(--color-border)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--color-border)]/60 space-y-2">
              <code className="block text-[11px] font-mono text-[var(--color-accent)] bg-[var(--color-surface-0)] px-3 py-2 rounded border border-[var(--color-border)] truncate">
                {plugin.installCmd}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(plugin.installCmd);
                  setCopiedId(plugin.id);
                  onNotify(`Copied ${plugin.name} marketplace command!`);
                  setTimeout(() => setCopiedId(null), 1800);
                }}
                className="w-full py-2 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] hover:text-white border border-[var(--color-border)] hover:border-[var(--color-accent)] font-mono text-xs font-semibold transition-colors cursor-pointer"
              >
                {copiedId === plugin.id ? '✓ Copied Slash Command' : 'Copy Marketplace Command'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MyMixtapesView: React.FC<{
  collections: MixtapeCollection[];
  onCreateCollection: (name: string) => void;
  onDeleteCollection: (id: string) => void;
  onRemoveFromCollection: (collectionId: string, path: string, typePlural: ComponentTypePlural) => void;
  onLoadCollectionToStack: (col: MixtapeCollection) => void;
  onSelectComponent: (item: CatalogItem) => void;
  onNotify: (msg: string) => void;
}> = ({
  collections,
  onCreateCollection,
  onDeleteCollection,
  onRemoveFromCollection,
  onLoadCollectionToStack,
  onSelectComponent,
  onNotify,
}) => {
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateCollection(newTitle.trim());
    setNewTitle('');
  };

  const buildCollectionCmd = (col: MixtapeCollection) => {
    const grouped: Partial<Record<ComponentTypePlural, string[]>> = {};
    for (const item of col.items) {
      grouped[item.typePlural] = [...(grouped[item.typePlural] ?? []), stripExt(item.path)];
    }
    let cmd = CLI_PACKAGE;
    for (const [t, paths] of Object.entries(grouped) as [ComponentTypePlural, string[]][]) {
      if (paths.length > 0) cmd += ` ${TYPE_META[t].flag} ${paths.join(',')}`;
    }
    return cmd;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in-up space-y-6">
      <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface-1)] to-[var(--color-surface-2)] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
            Workplace · Saved Cassettes
          </span>
          <h1 className="text-2xl font-mono font-bold text-[var(--color-text-primary)] mt-1">
            My Mixtapes &amp; Saved Stacks
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Organize reusable sets of skills, subagents, slash commands, and MCP servers into single-command mixtapes.
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            placeholder="New cassette name..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-lg px-3.5 py-2 text-xs font-mono text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-mono text-xs font-semibold shrink-0 cursor-pointer"
          >
            + New Mixtape
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {collections.map((col) => {
          const cmd = buildCollectionCmd(col);
          return (
            <div
              key={col.id}
              className="rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-border)] overflow-hidden flex flex-col justify-between shadow-md"
            >
              <div>
                {/* Cassette Top Label Strip */}
                <div
                  className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between"
                  style={{ borderTop: `3px solid ${col.accentColor}` }}
                >
                  <div>
                    <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--color-text-tertiary)]">
                      {col.sideLabel}
                    </span>
                    <h2 className="font-mono text-base font-bold text-[var(--color-text-primary)]">
                      {col.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onLoadCollectionToStack(col)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-mono text-xs font-semibold cursor-pointer"
                    >
                      ▶ Load in Stack
                    </button>
                    {collections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteCollection(col.id)}
                        title="Delete mixtape"
                        className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <p className="px-5 pt-3 text-xs text-[var(--color-text-secondary)]">
                  {col.description}
                </p>

                {/* Tracks */}
                <div className="p-4 space-y-2">
                  {col.items.length === 0 ? (
                    <div className="p-6 text-center text-xs font-mono text-[var(--color-text-tertiary)] border border-dashed border-[var(--color-border)] rounded-lg">
                      No tracks saved yet — bookmark any component card with the ribbon icon!
                    </div>
                  ) : (
                    col.items.map((ref, idx) => {
                      const meta = TYPE_META[ref.typePlural];
                      const fullItem = lookupCatalogItem(ref.path, ref.typePlural);
                      return (
                        <div
                          key={`${ref.typePlural}-${ref.path}`}
                          onClick={() => fullItem && onSelectComponent(fullItem)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--color-surface-0)] border border-[var(--color-border)] hover:border-[var(--color-accent)] cursor-pointer group"
                        >
                          <span className="font-mono text-[11px] text-[var(--color-text-tertiary)] w-5">
                            0{idx + 1}
                          </span>
                          <span style={{ color: meta.color }}>
                            <TypeIcon type={ref.typePlural} size={15} />
                          </span>
                          <span className="font-mono text-xs font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] flex-1 truncate">
                            {formatComponentTitle(ref.name)}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">
                            {meta.label}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromCollection(col.id, ref.path, ref.typePlural);
                            }}
                            className="text-xs text-[var(--color-text-tertiary)] hover:text-red-400 px-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {col.items.length > 0 && (
                <div className="px-5 py-3.5 bg-[var(--color-surface-0)] border-t border-[var(--color-border)] flex items-center gap-2">
                  <code className="text-[11px] font-mono text-[var(--color-accent)] truncate flex-1">
                    {cmd}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(cmd);
                      onNotify(`Copied CLI command for "${col.name}"!`);
                    }}
                    className="px-3 py-1.5 rounded bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-text-primary)] shrink-0 cursor-pointer"
                  >
                    Copy CLI
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SpecModal: React.FC<{
  kind: 'llms' | 'openapi' | 'docs' | null;
  onClose: () => void;
  onNotify: (msg: string) => void;
}> = ({ kind, onClose, onNotify }) => {
  if (!kind) return null;

  const contentMap = {
    docs: {
      title: 'aimirah.mixtape — CLI & Batch Installation Guide',
      body: `# Quick Start with aimirah-mixtape CLI

# 1. Interactive Picker (browse all 1,910+ tracks in terminal)
${CLI_PACKAGE}

# 2. Install a single component by flag
${CLI_PACKAGE} --skill ai-maestro/agent-management
${CLI_PACKAGE} --agent development-team/frontend-developer
${CLI_PACKAGE} --command testing/generate-tests
${CLI_PACKAGE} --mcp database/postgres-mcp
${CLI_PACKAGE} --hook security/pre-commit-secrets
${CLI_PACKAGE} --setting permissions/strict-production

# 3. Mix multiple components into one project command
${CLI_PACKAGE} \\
  --skill ai-maestro/agent-management \\
  --agent development-team/frontend-developer \\
  --command testing/generate-tests

All files are plain Markdown (.md) or JSON (.json) written directly to .claude/ and .mcp.json.`,
    },
    llms: {
      title: '/llms.txt — Machine-Readable Agent Discovery Index',
      body: `# aimirah.mixtape (Open-Source Claude Code Catalog)

> Open-source catalog and CLI of 1,910+ ready-to-use components for Claude Code: skills, subagents, slash commands, hooks, MCP server configurations, settings, loops, and mods.

## How an AI Agent Should Use aimirah.mixtape
1. Inspect plain-file source directly in the UI or via /openapi.json endpoints.
2. Verify static risk score from NVIDIA SkillSpector Scanner before installing hooks or MCP servers.
3. Install into workspace root with one command:
   \`${CLI_PACKAGE} --skill <category>/<name> --agent <category>/<name>\`

## Catalog Counts
- Skills: 891 (--skill)
- Agents: 422 (--agent)
- Slash Commands: 288 (--command)
- MCP Servers: 107 (--mcp)
- Settings: 77 (--setting)
- Hooks: 63 (--hook)
- Mods: 44 (--mod)
- Loops: 18 (--loop)`,
    },
    openapi: {
      title: '/openapi.json — OpenAPI 3.1 Catalog Specification',
      body: JSON.stringify(
        {
          openapi: '3.1.0',
          info: {
            title: 'aimirah.mixtape Catalog API',
            version: '2.4.0',
            description: 'Read-only JSON endpoints for searching and reading Claude Code components.',
          },
          servers: [{ url: 'https://aimirah.mixtape' }],
          paths: {
            '/search-index.json': {
              get: { summary: 'List all 1,910+ catalog components with metadata and categories' },
            },
            '/components/{type}.json': {
              get: { summary: 'Retrieve full array for skills, agents, commands, mcps, hooks, settings, mods, loops' },
            },
            '/trending-data.json': {
              get: { summary: 'Global CLI installation metrics, 30-day curves, and country breakdowns' },
            },
          },
        },
        null,
        2
      ),
    },
  }[kind];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] shadow-2xl overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-surface-0)] flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-[var(--color-text-primary)]">
            {contentMap.title}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(contentMap.body);
                onNotify(`Copied ${contentMap.title}`);
              }}
              className="px-2.5 py-1 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-accent)] cursor-pointer"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-1 text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] cursor-pointer"
            >
              ESC
            </button>
          </div>
        </div>
        <pre className="p-5 max-h-[70vh] overflow-auto font-mono text-xs leading-relaxed text-[var(--color-text-primary)] whitespace-pre-wrap">
          {contentMap.body}
        </pre>
      </div>
    </div>
  );
};
