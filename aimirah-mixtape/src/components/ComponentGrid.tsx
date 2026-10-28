import React, { useMemo, useState, useEffect } from 'react';
import {
  buildSingleInstallCmd,
  CATALOG_BY_TYPE,
  CATALOG_COUNTS,
  CLI_PACKAGE,
  formatComponentTitle,
} from '../data/catalog';
import {
  CatalogItem,
  ComponentTypePlural,
  MixtapeCollection,
  SavedComponentRef,
} from '../types/catalog';
import { TYPE_META, TypeIcon } from './Icons';
import { SkillSpectorBadge } from './SkillSpectorBadge';
import { SaveToCollectionButton } from './SaveToCollectionButton';

const PAGE_SIZE = 24;

export const ComponentGrid: React.FC<{
  activeType: ComponentTypePlural;
  onSelectComponent: (item: CatalogItem) => void;
  isInStack: (item: CatalogItem) => boolean;
  onToggleStack: (item: CatalogItem) => void;
  onAddManyToStack: (items: CatalogItem[]) => void;
  collections: MixtapeCollection[];
  onToggleInCollection: (collectionId: string, item: SavedComponentRef) => void;
  onCreateCollection: (name: string, initialItem?: SavedComponentRef) => void;
  onLoadCollectionToStack: (col: MixtapeCollection) => void;
  onOpenSpecModal: (kind: 'llms' | 'openapi' | 'docs') => void;
  onNotify: (msg: string) => void;
}> = ({
  activeType,
  onSelectComponent,
  isInStack,
  onToggleStack,
  onAddManyToStack,
  collections,
  onToggleInCollection,
  onCreateCollection,
  onLoadCollectionToStack,
  onOpenSpecModal,
  onNotify,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [multiCategories, setMultiCategories] = useState<string[]>([]);
  const [minDownloads, setMinDownloads] = useState(0);
  const [sortBy, setSortBy] = useState<'downloads' | 'name'>('downloads');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  useEffect(() => {
    setCategory('all');
    setMultiCategories([]);
    setPage(1);
  }, [activeType]);

  const rawItems = CATALOG_BY_TYPE[activeType] ?? [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const item of rawItems) {
      if (item.category) set.add(item.category);
    }
    return Array.from(set).sort();
  }, [rawItems]);

  const filtered = useMemo(() => {
    let list = rawItems;
    if (multiCategories.length > 0) {
      list = list.filter((i) => multiCategories.includes(i.category));
    } else if (category !== 'all') {
      list = list.filter((i) => i.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.content?.toLowerCase().includes(q) ?? false)
      );
    }

    if (minDownloads > 0) {
      list = list.filter((i) => i.downloads >= minDownloads);
    }

    const sorted = [...list];
    if (sortBy === 'downloads') {
      sorted.sort((a, b) => b.downloads - a.downloads);
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [rawItems, category, multiCategories, search, minDownloads, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [category, multiCategories, search, minDownloads]);

  const hasActiveFilters =
    Boolean(search.trim()) || category !== 'all' || multiCategories.length > 0 || minDownloads > 0;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const meta = TYPE_META[activeType];

  const handleToggleMultiCat = (cat: string) => {
    setMultiCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearAllFilters = () => {
    setSearch('');
    setCategory('all');
    setMultiCategories([]);
    setMinDownloads(0);
  };

  const handleCopyCmd = (e: React.MouseEvent, item: CatalogItem) => {
    e.stopPropagation();
    const cmd = buildSingleInstallCmd(item);
    navigator.clipboard?.writeText(cmd);
    setCopiedPath(item.path);
    onNotify(`Copied CLI command for ${formatComponentTitle(item.name)}`);
    setTimeout(() => setCopiedPath(null), 1800);
  };

  const displayCount = hasActiveFilters
    ? filtered.length
    : CATALOG_COUNTS[activeType] ?? filtered.length;

  return (
    <div>
      {/* Sticky Filter & Search Bar */}
      <div className="brushed bg-[var(--color-surface-1)] border-b-2 border-[var(--color-border-strong)] backdrop-blur-sm sticky top-14 z-10 shadow-[0_2px_6px_rgba(0,0,0,.12)]">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 px-6 py-3.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-auto sm:flex-1 sm:min-w-[160px] sm:max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={`Search ${meta.label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] pl-9 pr-8 py-2 outline-none focus:bg-[var(--color-surface-3)] focus:border-[var(--color-accent)] transition-all hover:border-[var(--color-border-hover)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)]"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Dropdown + Filters Toggle */}
          <div className="flex items-center gap-2.5 sm:contents">
            <select
              value={category}
              onChange={(e) => {
                setMultiCategories([]);
                setCategory(e.target.value);
              }}
              aria-label="Filter by category"
              className="flex-1 sm:flex-none min-w-0 appearance-none bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[13px] text-[var(--color-text-secondary)] font-medium px-3.5 py-2 pr-9 outline-none focus:border-[var(--color-accent)] cursor-pointer hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%237d8590%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.2rem] bg-[right_0.5rem_center] bg-no-repeat"
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 text-[13px] font-mono font-semibold rounded border transition-all cursor-pointer ${
                filtersOpen || hasActiveFilters
                  ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            </button>
          </div>

          {/* Grid / List Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[var(--color-surface-4)] text-[var(--color-text-primary)] shadow-xs'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="List view"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[var(--color-surface-4)] text-[var(--color-text-primary)] shadow-xs'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
            <span className="text-[11px] text-[var(--color-text-tertiary)] font-medium hidden sm:inline">
              Sort by
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'downloads' | 'name')}
              aria-label="Sort components"
              className="flex-1 sm:flex-none appearance-none font-mono bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded text-[13px] text-[var(--color-text-secondary)] font-medium px-3 py-2 pr-9 outline-none focus:border-[var(--color-accent)] cursor-pointer hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%237d8590%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.2rem] bg-[right_0.5rem_center] bg-no-repeat"
            >
              <option value="downloads">Most Popular</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {filtersOpen && (
          <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-1)] animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1">
                <label className="text-[11px] font-mono font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2.5 block">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 12).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleToggleMultiCat(cat)}
                      className={`px-3 py-1 text-[11px] font-mono font-semibold rounded border transition-all cursor-pointer ${
                        multiCategories.includes(cat)
                          ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                          : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-64">
                <label className="text-[11px] font-mono font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2.5 block">
                  Min Downloads: {minDownloads}+
                </label>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={50}
                  value={minDownloads}
                  onChange={(e) => setMinDownloads(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--color-surface-3)] rounded-lg cursor-pointer accent-[var(--color-accent)]"
                />
                <div className="flex justify-between text-[10px] font-mono text-[var(--color-text-tertiary)] mt-1">
                  <span>0</span>
                  <span>500</span>
                  <span>1000+</span>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-3.5 py-2 text-[12px] font-mono font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all self-start cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Featured Mixtape Quick-Load Strip */}
      <div className="px-6 pt-5 pb-1">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] px-3.5 py-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
            Featured Mixtapes:
          </span>
          {collections.slice(0, 3).map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => onLoadCollectionToStack(col)}
              title={`Load all ${col.items.length} tracks from "${col.name}" into your Mixtape Stack Builder`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[11px] font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
            >
              <span className="text-[var(--color-accent)]">▶</span>
              <span>{col.name}</span>
              <span className="text-[10px] text-[var(--color-text-tertiary)]">
                ({col.items.length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Summary Bar */}
      <div className="px-6 pt-4 pb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-mono text-[var(--color-text-secondary)] font-medium">
              {displayCount.toLocaleString()} {displayCount === 1 ? 'component' : 'components'}
            </span>
            {search && (
              <span className="text-[12px] text-[var(--color-text-tertiary)]">
                matching <span className="font-mono text-[var(--color-text-primary)]">&ldquo;{search}&rdquo;</span>
              </span>
            )}
            {category !== 'all' && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] border border-[var(--color-border)]">
                {category}
              </span>
            )}
          </div>

          {pagedItems.length > 0 && (
            <button
              type="button"
              onClick={() => onAddManyToStack(pagedItems)}
              title="Add all visible components on this page to your Mixtape Stack"
              className="text-[11px] font-mono font-semibold px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all active:scale-95 cursor-pointer"
            >
              + Add Page to Stack
            </button>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-[var(--color-text-tertiary)]">
          <kbd className="px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            ⌘K
          </kbd>
          <span>to search all 1,910+ tracks</span>
        </div>
      </div>

      {/* Cards Grid / List */}
      {pagedItems.length === 0 ? (
        <div className="px-6 py-20 text-center">
          <p className="font-mono text-sm text-[var(--color-text-primary)] mb-2">
            No {meta.label.toLowerCase()} matched your current filter settings.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-mono font-semibold hover:bg-[var(--color-accent-hover)] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5 px-6 pb-6'
              : 'flex flex-col gap-3.5 px-6 pb-6'
          }
        >
          {pagedItems.map((item) => {
            const added = isInStack(item);
            const isCopied = copiedPath === item.path;

            if (viewMode === 'list') {
              return (
              <div
                key={`${item.typePlural}-${item.path}`}
                onClick={() => onSelectComponent(item)}
                className="jcard group relative flex items-center gap-4 pl-7 pr-4 py-4 rounded-[5px] cursor-pointer"
              >
                <span className="jcard-spine absolute left-0 top-0 bottom-0 w-[3px]" aria-hidden="true" />
                <div
                  className="w-10 h-10 rounded-[3px] flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,.45),inset_0_-1px_2px_rgba(0,0,0,.18)]"
                    style={{
                      backgroundColor: `${meta.color}16`,
                      color: meta.color,
                      border: `1px solid ${meta.color}34`,
                    }}
                  >
                    <TypeIcon type={activeType} size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-mono text-[14px] font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors mb-1 truncate">
                      {formatComponentTitle(item.name)}
                    </h3>
                    <p className="text-[12px] text-[var(--color-text-secondary)] line-clamp-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    {item.category && (
                      <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]">
                        {item.category}
                      </span>
                    )}
                    {item.downloads > 0 && (
                      <span className="badge-download">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        {item.downloads.toLocaleString()}
                      </span>
                    )}
                    <SkillSpectorBadge result={item.skillspector} />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleCopyCmd(e, item)}
                      title="Copy npx install command"
                      className="w-8 h-8 rounded flex items-center justify-center text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] border border-transparent hover:border-[var(--color-border)] transition-all"
                    >
                      {isCopied ? (
                        <span className="text-[var(--color-success)] text-xs font-bold">✓</span>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                      )}
                    </button>

                    <SaveToCollectionButton
                      item={{
                        name: item.name,
                        path: item.path,
                        category: item.category,
                        typePlural: item.typePlural,
                      }}
                      collections={collections}
                      onToggleInCollection={onToggleInCollection}
                      onCreateCollection={onCreateCollection}
                    />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStack(item);
                      }}
                      title={added ? 'Remove from Mixtape Stack' : 'Add to Mixtape Stack'}
                      className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-150 cursor-pointer ${
                        added
                          ? 'bg-[var(--color-accent)] text-white border border-[var(--color-accent)]'
                          : 'text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-2)] border border-transparent hover:border-[var(--color-border)]'
                      }`}
                    >
                      {added ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`${item.typePlural}-${item.path}`}
                onClick={() => onSelectComponent(item)}
                className="jcard group relative flex items-start gap-4 pl-7 pr-5 py-5 rounded-[5px] cursor-pointer"
              >
                {/* printed spine down the left edge of the track */}
                <span className="jcard-spine absolute left-0 top-0 bottom-0 w-[3px]" aria-hidden="true" />

                {/* Left Type Icon */}
                <div
                  className="w-10 h-10 rounded-[3px] flex items-center justify-center shrink-0 mt-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,.45),inset_0_-1px_2px_rgba(0,0,0,.18)]"
                  style={{
                    backgroundColor: `${meta.color}16`,
                    color: meta.color,
                    border: `1px solid ${meta.color}34`,
                  }}
                >
                  <TypeIcon type={activeType} size={20} />
                </div>

                {/* Card Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-mono text-[14px] font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-tight mb-1.5 break-words">
                      {formatComponentTitle(item.name)}
                    </h3>

                    {/* Top-right Actions */}
                    <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-1">
                      <button
                        type="button"
                        onClick={(e) => handleCopyCmd(e, item)}
                        title="Copy npx install command"
                        aria-label="Copy install command"
                        className="w-8 h-8 rounded flex items-center justify-center text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] border border-transparent hover:border-[var(--color-border)] transition-all cursor-pointer"
                      >
                        {isCopied ? (
                          <span className="text-[var(--color-success)] text-xs font-bold">✓</span>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        )}
                      </button>

                      <SaveToCollectionButton
                        item={{
                          name: item.name,
                          path: item.path,
                          category: item.category,
                          typePlural: item.typePlural,
                        }}
                        collections={collections}
                        onToggleInCollection={onToggleInCollection}
                        onCreateCollection={onCreateCollection}
                      />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStack(item);
                        }}
                        title={added ? 'Remove from Mixtape Stack' : 'Add to Mixtape Stack'}
                        aria-label={added ? 'Remove from stack' : 'Add to stack'}
                        className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-150 cursor-pointer ${
                          added
                            ? 'bg-[var(--color-accent)] text-white border border-[var(--color-accent)]'
                            : 'text-[var(--color-text-tertiary)] opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-2)] border border-transparent hover:border-[var(--color-border)]'
                        }`}
                      >
                        {added ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[12px] text-[var(--color-text-secondary)] line-clamp-2 leading-[1.6]">
                    {item.description}
                  </p>

                  {/* Badges Footer */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {item.category && (
                      <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]">
                        {item.category}
                      </span>
                    )}

                    {item.downloads > 0 && (
                      <span className="badge-download">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        {item.downloads.toLocaleString()}
                      </span>
                    )}

                    <SkillSpectorBadge result={item.skillspector} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-center gap-2 border-t border-[var(--color-border)]/60">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs font-mono text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPage(num)}
              className={`w-8 h-8 rounded-lg font-mono text-xs font-semibold border transition-colors cursor-pointer ${
                page === num
                  ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
              }`}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs font-mono text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Plain-HTML Summary & Open-Source Footer */}
      <section className="px-6 pt-8 pb-12 max-w-3xl text-[13px] leading-relaxed text-[var(--color-text-secondary)] border-t border-[var(--color-border)]/50">
        <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-2 font-mono">
          What is aimirah.mixtape?
        </h2>
        <p className="mb-2.5">
          <strong className="text-[var(--color-text-primary)]">aimirah.mixtape</strong> is an open-source catalog and mixtape builder of 1,910+ components for Claude Code: subagents, slash commands, skills, hooks, MCP server configurations, settings, loops, and mods. Every component is a plain text file you can audit before installing, with full source available on{' '}
          <a
            href="https://github.com/aimirah/mixtape"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[var(--color-accent)]"
          >
            GitHub
          </a>
          .
        </p>
        <p>
          Install any single track into your repository with the CLI, for example{' '}
          <code className="font-mono text-[12px] px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-accent)]">
            {CLI_PACKAGE} --agent development-team/frontend-developer
          </code>
          , or mix several flags into one command with the Stack Builder. AI agents can bootstrap directly from{' '}
          <button
            type="button"
            onClick={() => onOpenSpecModal('llms')}
            className="underline hover:text-[var(--color-accent)] font-mono cursor-pointer"
          >
            /llms.txt
          </button>{' '}
          and the machine-readable catalog specification in{' '}
          <button
            type="button"
            onClick={() => onOpenSpecModal('openapi')}
            className="underline hover:text-[var(--color-accent)] font-mono cursor-pointer"
          >
            /openapi.json
          </button>
          .
        </p>
      </section>
    </div>
  );
};
