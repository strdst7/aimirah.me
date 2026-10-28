import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_CATALOG_ITEMS, formatComponentTitle } from '../data/catalog';
import { CatalogItem, ComponentTypePlural } from '../types/catalog';
import { TYPE_META, TypeIcon } from './Icons';

export const SearchModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSelect: (item: CatalogItem) => void;
  onToggleStack: (item: CatalogItem) => void;
  isInStack: (item: CatalogItem) => boolean;
}> = ({ open, onClose, onSelect, onToggleStack, isInStack }) => {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ComponentTypePlural>('all');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const results = useMemo(() => {
    let pool = ALL_CATALOG_ITEMS;
    if (typeFilter !== 'all') {
      pool = pool.filter((item) => item.typePlural === typeFilter);
    }
    const q = query.trim().toLowerCase();
    if (!q) {
      return [...pool].sort((a, b) => b.downloads - a.downloads).slice(0, 18);
    }
    return pool
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.typePlural.toLowerCase().includes(q)
      )
      .slice(0, 24);
  }, [query, typeFilter]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query, typeFilter]);

  useEffect(() => {
    const child = listRef.current?.children[selectedIdx] as HTMLElement | undefined;
    child?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      e.preventDefault();
      onSelect(results[selectedIdx]);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" />
      <div
        className="relative w-full max-w-2xl bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
          <span className="terminal-prompt text-sm">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search all aimirah.mixtape components (skills, agents, commands, MCPs, hooks)..."
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none font-mono"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] px-1.5"
            >
              Clear
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded text-[var(--color-text-tertiary)]">
            ESC
          </kbd>
        </div>

        {/* Quick Type Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[var(--color-border)] overflow-x-auto bg-[var(--color-surface-1)]">
          {(['all', 'skills', 'agents', 'commands', 'mcps', 'settings', 'hooks', 'mods', 'loops'] as const).map(
            (t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold capitalize whitespace-nowrap transition-colors ${
                  typeFilter === t
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {t === 'all' ? 'All Tracks' : TYPE_META[t].label}
              </button>
            )
          )}
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-88 overflow-y-auto divide-y divide-[var(--color-border)]/40">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <p className="text-[14px] font-medium text-[var(--color-text-primary)] mb-1">
                No components matched &ldquo;{query}&rdquo;
              </p>
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                Try keywords like <code className="font-mono text-[var(--color-accent)]">frontend</code>,{' '}
                <code className="font-mono text-[var(--color-accent)]">postgres</code>,{' '}
                <code className="font-mono text-[var(--color-accent)]">security</code>, or{' '}
                <code className="font-mono text-[var(--color-accent)]">github</code>.
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const meta = TYPE_META[item.typePlural];
              const added = isInStack(item);
              return (
                <div
                  key={`${item.typePlural}-${item.path}`}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                    idx === selectedIdx
                      ? 'bg-[var(--color-accent)]/12'
                      : 'hover:bg-[var(--color-surface-2)]'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${meta.color}18`,
                      color: meta.color,
                      border: `1px solid ${meta.color}35`,
                    }}
                  >
                    <TypeIcon type={item.typePlural} size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] font-semibold text-[var(--color-text-primary)] truncate">
                        {formatComponentTitle(item.name)}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] shrink-0">
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[var(--color-text-secondary)] truncate">
                      {item.description}
                    </p>
                  </div>
                  <span className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] shrink-0">
                    {item.category}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStack(item);
                    }}
                    title={added ? 'Remove from Mixtape Stack' : 'Add to Mixtape Stack'}
                    className={`w-7 h-7 rounded flex items-center justify-center shrink-0 transition-colors ${
                      added
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] border border-[var(--color-border)]'
                    }`}
                  >
                    {added ? '✓' : '+'}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer keyboard hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-surface-0)] text-[10.5px] font-mono text-[var(--color-text-tertiary)]">
          <div className="flex items-center gap-4">
            <span>↑↓ navigate</span>
            <span>↵ inspect track</span>
            <span>+ add to stack</span>
          </div>
          <span>{query.trim() ? `${results.length} matches` : 'Top popular components'}</span>
        </div>
      </div>
    </div>
  );
};
