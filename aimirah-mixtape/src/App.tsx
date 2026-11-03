import React, { useCallback, useEffect, useState } from 'react';
import {
  ASCII_BANNER,
  CATALOG_COUNTS,
  CATALOG_TOTAL_LABEL,
  INITIAL_COLLECTIONS,
} from './data/catalog';
import {
  ActiveRoute,
  CartState,
  CatalogItem,
  ComponentTypePlural,
  JobPosting,
  MixtapeCollection,
  SavedComponentRef,
} from './types/catalog';
import { AimirahMascot, TYPE_META, TypeIcon } from './components/Icons';
import {
  hasStringFields,
  isArrayOf,
  isObject,
  safeJsonParse,
} from '@aimirah/shared/storage';
import {
  CassetteWindow,
  Faceplate,
  LegendChip,
  RecLamp,
  Screw,
  TapeCounter,
  VUMeter,
  useVUDrive,
} from './components/DeckWidgets';
import { HomeStats } from './components/HomeStats';
import { ComponentGrid } from './components/ComponentGrid';
import { ComponentDetailView } from './components/ComponentDetailView';
import { StackBuilderSidebar } from './components/StackBuilderSidebar';
import { SearchModal } from './components/SearchModal';
import {
  JobsSidebar,
  JobsView,
  MyMixtapesView,
  PluginsView,
  SpecModal,
  TrendingView,
} from './components/SecondaryViews';

const EMPTY_CART: CartState = {
  skills: [],
  agents: [],
  commands: [],
  settings: [],
  hooks: [],
  mcps: [],
  mods: [],
  loops: [],
};

const SIDEBAR_BROWSE_ORDER: ComponentTypePlural[] = [
  'skills',
  'agents',
  'commands',
  'settings',
  'hooks',
  'mcps',
  'mods',
  'loops',
];

const isStoredCollection = (value: unknown): value is MixtapeCollection => {
  if (!isObject(value)) return false;
  if (!hasStringFields(value, ['id', 'name', 'sideLabel', 'description', 'accentColor', 'createdAt'])) {
    return false;
  }
  return isArrayOf(value.items, (item) =>
    hasStringFields(item, ['name', 'path', 'category', 'typePlural'])
  );
};

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aimirah-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'light'; // silver faceplate by default
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [route, setRoute] = useState<ActiveRoute>({ view: 'browse', typePlural: 'skills' });
  const [searchOpen, setSearchOpen] = useState(false);
  const [stackOpen, setStackOpen] = useState(false);
  const [specModal, setSpecModal] = useState<'llms' | 'openapi' | 'docs' | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Storage is untrusted: validate shapes instead of spreading whatever is
  // there into state (CONCERNS.md #23).
  const [cart, setCart] = useState<CartState>(() => {
    const parsed = safeJsonParse(localStorage.getItem('aimirahMixtapeCart'));
    if (!isObject(parsed)) return EMPTY_CART;
    const next = { ...EMPTY_CART };
    for (const type of SIDEBAR_BROWSE_ORDER) {
      const bucket = parsed[type];
      if (Array.isArray(bucket)) {
        next[type] = bucket.filter((item) =>
          hasStringFields(item, ['name', 'path', 'category', 'description', 'typePlural'])
        ) as unknown as CartState[typeof type];
      }
    }
    return next;
  });

  const [collections, setCollections] = useState<MixtapeCollection[]>(() => {
    const parsed = safeJsonParse(localStorage.getItem('aimirahMixtapeCollections'));
    if (isArrayOf(parsed, isStoredCollection) && parsed.length > 0) return parsed;
    if (parsed !== null) {
      console.warn('[mixtape] ignoring malformed saved collections');
    }
    return INITIAL_COLLECTIONS;
  });

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(theme);
    try {
      localStorage.setItem('aimirah-theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('aimirahMixtapeCart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('aimirahMixtapeCollections', JSON.stringify(collections));
    } catch {}
  }, [collections]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const notify = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const isInStack = useCallback(
    (item: CatalogItem) => {
      return cart[item.typePlural]?.some((c) => c.path === item.path) ?? false;
    },
    [cart]
  );

  const handleToggleStack = useCallback(
    (item: CatalogItem) => {
      setCart((prev) => {
        const current = prev[item.typePlural] ?? [];
        const exists = current.some((c) => c.path === item.path);
        const nextList = exists
          ? current.filter((c) => c.path !== item.path)
          : [
              ...current,
              {
                name: item.name,
                path: item.path,
                category: item.category,
                description: item.description,
                typePlural: item.typePlural,
              },
            ];
        return { ...prev, [item.typePlural]: nextList };
      });
    },
    []
  );

  const handleAddManyToStack = useCallback(
    (items: CatalogItem[]) => {
      setCart((prev) => {
        const updated = { ...prev };
        let addedCount = 0;
        for (const item of items) {
          const list = updated[item.typePlural] ?? [];
          if (!list.some((c) => c.path === item.path)) {
            updated[item.typePlural] = [
              ...list,
              {
                name: item.name,
                path: item.path,
                category: item.category,
                description: item.description,
                typePlural: item.typePlural,
              },
            ];
            addedCount += 1;
          }
        }
        notify(
          addedCount > 0
            ? `Added ${addedCount} tracks to Mixtape Stack!`
            : 'All components on this page are already in your Stack'
        );
        return updated;
      });
    },
    [notify]
  );

  const handleRemoveFromStack = useCallback((path: string, typePlural: ComponentTypePlural) => {
    setCart((prev) => ({
      ...prev,
      [typePlural]: (prev[typePlural] ?? []).filter((c) => c.path !== path),
    }));
  }, []);

  const handleClearStack = useCallback(() => {
    setCart(EMPTY_CART);
    notify('Cleared Mixtape Stack');
  }, [notify]);

  const handleToggleInCollection = useCallback(
    (collectionId: string, item: SavedComponentRef) => {
      setCollections((prev) =>
        prev.map((col) => {
          if (col.id !== collectionId) return col;
          const exists = col.items.some(
            (i) => i.path === item.path && i.typePlural === item.typePlural
          );
          return {
            ...col,
            items: exists
              ? col.items.filter((i) => !(i.path === item.path && i.typePlural === item.typePlural))
              : [...col.items, item],
          };
        })
      );
      notify('Updated Mixtape Collection');
    },
    [notify]
  );

  const handleCreateCollection = useCallback(
    (name: string, initialItem?: SavedComponentRef) => {
      const letter = String.fromCharCode(65 + (collections.length % 26));
      const newCol: MixtapeCollection = {
        id: `tape-${Date.now()}`,
        name,
        sideLabel: `SIDE ${letter} · CUSTOM TAPE`,
        description: 'Custom component mixtape curated in your local workspace.',
        accentColor: collections.length % 2 === 0 ? '#d57455' : '#10b981',
        createdAt: new Date().toISOString().slice(0, 10),
        items: initialItem ? [initialItem] : [],
      };
      setCollections((prev) => [newCol, ...prev]);
      notify(`Created mixtape "${name}"`);
    },
    [collections.length, notify]
  );

  const handleSaveStackAsCollection = useCallback(
    (name: string) => {
      const allRefs: SavedComponentRef[] = [];
      for (const [t, list] of Object.entries(cart) as [ComponentTypePlural, CartState[ComponentTypePlural]][]) {
        for (const item of list) {
          allRefs.push({
            name: item.name,
            path: item.path,
            category: item.category,
            typePlural: t,
          });
        }
      }
      const newCol: MixtapeCollection = {
        id: `tape-${Date.now()}`,
        name,
        sideLabel: `CUSTOM MIX · ${allRefs.length} TRACKS`,
        description: `Saved directly from Mixtape Stack Builder (${allRefs.length} components).`,
        accentColor: '#d57455',
        createdAt: new Date().toISOString().slice(0, 10),
        items: allRefs,
      };
      setCollections((prev) => [newCol, ...prev]);
      notify(`Saved stack as "${name}" in My Mixtapes!`);
    },
    [cart, notify]
  );

  const handleLoadCollectionToStack = useCallback(
    (col: MixtapeCollection) => {
      const nextCart: CartState = {
        skills: [],
        agents: [],
        commands: [],
        settings: [],
        hooks: [],
        mcps: [],
        mods: [],
        loops: [],
      };
      for (const item of col.items) {
        nextCart[item.typePlural].push({
          name: item.name,
          path: item.path,
          category: item.category,
          description: '',
          typePlural: item.typePlural,
        });
      }
      setCart(nextCart);
      setStackOpen(true);
      notify(`Loaded "${col.name}" (${col.items.length} tracks) into Stack Builder!`);
    },
    [notify]
  );

  const totalStackCount = Object.values(cart).reduce((acc, list) => acc + list.length, 0);

  /* The deck: VU needles read the stack, counter ticks while recording */
  const vuDrive = useVUDrive(totalStackCount);
  const [tapeCounter, setTapeCounter] = useState(0);
  const counterAnchorRef = React.useRef(0);
  useEffect(() => {
    if (totalStackCount > 0 && counterAnchorRef.current === 0) {
      counterAnchorRef.current = Date.now();
    }
    if (totalStackCount === 0) {
      counterAnchorRef.current = 0;
      return;
    }
    const id = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      setTapeCounter(Math.floor((Date.now() - counterAnchorRef.current) / 420) + 1);
    }, 420);
    return () => window.clearInterval(id);
  }, [totalStackCount]);

  const mainScrollRef = React.useRef<HTMLElement | null>(null);

  const navigate = (next: ActiveRoute) => {
    setRoute(next);
    setMobileMenuOpen(false);
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface-0)] text-[var(--color-text-primary)]">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/55 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`${
          sidebarCollapsed ? 'md:w-[68px]' : 'md:ml-[0] md:w-[220px]'
        } brushed w-[230px] flex flex-col border-r-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] shadow-[2px_0_8px_rgba(0,0,0,.16)] fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="px-3.5 py-4 border-b border-[var(--color-border)] flex items-center justify-between min-h-[56px]">
          <button
            type="button"
            onClick={() => navigate({ view: 'browse', typePlural: 'skills' })}
            className="flex items-center gap-2.5 group min-w-0 overflow-hidden text-left cursor-pointer"
            title="aimirah.mixtape — Home"
          >
            <span className="w-8 h-8 shrink-0 rounded-[3px] border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/12 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,.4)] transition-transform duration-200 group-hover:scale-105 group-hover:border-[var(--color-accent)]">
              <svg
                className="w-4 h-4 text-[var(--color-accent)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <circle cx="8" cy="12" r="2.2" />
                <circle cx="16" cy="12" r="2.2" />
                <path d="M10.2 12h3.6" />
              </svg>
            </span>
            {!sidebarCollapsed && (
              <span className="text-[19px] leading-none text-[var(--color-text-primary)] truncate">
                <span className="liner">aimirah</span>
                <span className="font-mono text-[13px] font-bold text-[var(--color-accent)]">.mixtape</span>
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
            className="hidden md:flex shrink-0 w-7 h-7 items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-transform cursor-pointer"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close mobile menu"
            className="md:hidden shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          {/* WORKPLACE */}
          {!sidebarCollapsed && (
            <div className="px-2 pt-1 pb-1.5">
              <span className="legend" style={{ fontSize: 9 }}>
                Workplace
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate({ view: 'my-mixtapes' })}
            title="My Mixtapes"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-mono transition-all cursor-pointer border ${
              route.view === 'my-mixtapes'
                ? 'bg-[var(--color-accent)]/14 text-[var(--color-accent)] border-[var(--color-accent)]/40 font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] border-transparent hover:border-[var(--color-border)]'
            }`}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            {!sidebarCollapsed && (
              <>
                <span className="truncate">My Mixtapes</span>
                <span className="ml-auto text-[11px] font-mono font-semibold tabular-nums text-[var(--color-text-tertiary)] bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 py-0.5 rounded">
                  {collections.length}
                </span>
              </>
            )}
          </button>

          <div className="my-3 mx-2 border-t border-[var(--color-border)] opacity-60" />

          {/* BROWSE */}
          {!sidebarCollapsed && (
            <div className="px-2 pt-1 pb-1.5">
              <span className="legend" style={{ fontSize: 9 }}>
                Browse
              </span>
            </div>
          )}

          {SIDEBAR_BROWSE_ORDER.map((typeKey) => {
            const meta = TYPE_META[typeKey];
            const isActive =
              (route.view === 'browse' && route.typePlural === typeKey) ||
              (route.view === 'detail' && route.fromType === typeKey);

            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => navigate({ view: 'browse', typePlural: typeKey })}
                title={meta.label}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-mono transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[var(--color-accent)]/14 text-[var(--color-accent)] border-[var(--color-accent)]/40 font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] border-transparent hover:border-[var(--color-border)]'
                }`}
              >
                <span
                  className="w-[18px] h-[18px] shrink-0 inline-flex items-center justify-center"
                  style={{ color: isActive ? meta.color : undefined }}
                >
                  <TypeIcon type={typeKey} size={16} />
                </span>
                {!sidebarCollapsed && (
                  <>
                    <span className="truncate">{meta.label}</span>
                    <span className="ml-auto text-[11px] font-mono font-semibold tabular-nums text-[var(--color-text-tertiary)] bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 py-0.5 rounded min-w-[28px] text-center">
                      {CATALOG_COUNTS[typeKey]}
                    </span>
                  </>
                )}
              </button>
            );
          })}

          {/* Plugins */}
          <button
            type="button"
            onClick={() => navigate({ view: 'plugins' })}
            title="Plugins"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-mono transition-all cursor-pointer border ${
              route.view === 'plugins'
                ? 'bg-[var(--color-accent)]/14 text-[var(--color-accent)] border-[var(--color-accent)]/40 font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] border-transparent hover:border-[var(--color-border)]'
            }`}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
              />
            </svg>
            {!sidebarCollapsed && (
              <>
                <span className="truncate">Plugins</span>
                <span className="ml-auto text-[11px] font-mono font-semibold tabular-nums text-[var(--color-text-tertiary)] bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 py-0.5 rounded min-w-[28px] text-center">
                  {CATALOG_COUNTS.plugins}
                </span>
              </>
            )}
          </button>

          <div className="my-3 mx-2 border-t border-[var(--color-border)] opacity-60" />

          {/* RESOURCES */}
          {!sidebarCollapsed && (
            <div className="px-2 pt-1 pb-1.5">
              <span className="legend" style={{ fontSize: 9 }}>
                Resources
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate({ view: 'trending' })}
            title="Trending"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-mono transition-all cursor-pointer border ${
              route.view === 'trending'
                ? 'bg-[var(--color-accent)]/14 text-[var(--color-accent)] border-[var(--color-accent)]/40 font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] border-transparent'
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            {!sidebarCollapsed && <span className="truncate">Trending</span>}
          </button>

          <button
            type="button"
            onClick={() => navigate({ view: 'jobs' })}
            title="Jobs"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-mono transition-all cursor-pointer border ${
              route.view === 'jobs'
                ? 'bg-[var(--color-accent)]/14 text-[var(--color-accent)] border-[var(--color-accent)]/40 font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] border-transparent'
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
            {!sidebarCollapsed && (
              <>
                <span className="truncate">Jobs</span>
                <span className="ml-auto text-[9px] font-mono font-bold uppercase tracking-wider bg-orange-500/15 text-orange-400 px-1.5 py-0.5 rounded">
                  New
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSpecModal('docs')}
            title="CLI Docs"
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {!sidebarCollapsed && <span className="truncate">Docs</span>}
          </button>

          <a
            href="https://github.com/aimirah/mixtape"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-all"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            {!sidebarCollapsed && <span className="truncate">GitHub</span>}
          </a>
        </nav>

        {/* Bottom Workspace Footer */}
        <div className="px-3 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface-0)]">
          <button
            type="button"
            onClick={() => navigate({ view: 'my-mixtapes' })}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors text-left cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary-500)] flex items-center justify-center font-mono text-[10px] font-bold text-white shrink-0">
              AM
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[11px] font-semibold text-[var(--color-text-primary)] truncate">
                  @aimirah
                </div>
                <div className="font-mono text-[9.5px] text-[var(--color-text-tertiary)] truncate">
                  Mixtape Studio Synced
                </div>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <main
        ref={mainScrollRef}
        className={`flex-1 min-w-0 overflow-y-auto bg-[var(--color-surface-0)] transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[220px]'
        }`}
      >
        {/* Top Sticky Transport Bar */}
        <header className="sticky top-0 z-20 brushed bg-[var(--color-surface-1)] backdrop-blur-sm border-b-2 border-[var(--color-border-strong)] shadow-[0_2px_6px_rgba(0,0,0,.14)]">
          <div className="flex items-center gap-3 justify-between px-5 md:px-6 h-14">
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden shrink-0 p-2 rounded border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Terminal Prompt Global Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 border border-[var(--color-border)] rounded text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-1)] transition-all flex-1 min-w-0 max-w-md group font-mono cursor-pointer"
            >
              <span className="terminal-prompt text-[13px]">&gt;</span>
              <span className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] truncate">
                Search components...
              </span>
              <kbd className="hidden sm:inline-flex ml-auto items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold border border-[var(--color-border)] rounded bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] group-hover:border-[var(--color-accent)]">
                ⌘K
              </kbd>
            </button>

            {/* Right Header Controls */}
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/aimirah/mixtape"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--color-border)] text-[12.5px] font-mono font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-1)] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span className="hidden sm:inline">GitHub</span>
                <span className="flex items-center gap-1 pl-2 border-l border-[var(--color-border)] text-[var(--color-text-tertiary)]">
                  ★ 30.8k
                </span>
              </a>

              {/* Theme Switcher */}
              <button
                type="button"
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                aria-label="Toggle color theme"
                className="p-2 rounded border border-[var(--color-border)] bg-[var(--color-surface-1)] hover:border-[var(--color-accent)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <path
                      strokeLinecap="round"
                      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                    />
                  </svg>
                )}
              </button>

              {/* Header Stack Builder Button */}
              <button
                type="button"
                onClick={() => setStackOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono font-semibold transition-all cursor-pointer ${
                  totalStackCount > 0
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                    : 'bg-[var(--color-surface-1)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span className="hidden sm:inline">Dub&nbsp;Queue</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10.5px] bg-black/20">
                  {totalStackCount}
                </span>
              </button>

              {/* REC lamp rides the transport bar */}
              <div className="hidden lg:flex items-center pl-3 border-l border-[var(--color-border)]">
                <RecLamp on={totalStackCount > 0} />
              </div>
            </div>
          </div>
        </header>

        {/* Active View Content */}
        {route.view === 'browse' && (
          <div className="flex min-h-0">
            <div className="flex-1 min-w-0">
              {/* ── TOP PLATE: engraved wordmark + instrument cluster ── */}
              <div className="px-5 md:px-6 pt-5 pb-2">
                <Faceplate className="brushed overflow-hidden" >
                  <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_312px]">
                    {/* Left: engraved banner, liner note, cassette window */}
                    <div className="px-5 md:px-7 py-6 border-b xl:border-b-0 xl:border-r border-[var(--color-border)]">
                      <div className="flex items-center gap-3 mb-3">
                        <RecLamp on={totalStackCount > 0} />
                        <span className="legend" style={{ fontSize: 9 }}>
                          Dolby&nbsp;NR · Metal · Auto&nbsp;Reverse
                        </span>
                        <span className="hidden sm:inline-flex ml-auto">
                          <LegendChip active>Catalog {CATALOG_TOTAL_LABEL}</LegendChip>
                        </span>
                      </div>

                      <div className="hidden md:flex items-center gap-4 overflow-hidden mb-3">
                        <pre className="ascii-art shrink-0" aria-hidden="true">
                          {ASCII_BANNER}
                        </pre>
                        <AimirahMascot className="w-20 h-20" />
                      </div>

                      {/* Mobile fallback */}
                      <div className="flex md:hidden items-center gap-3 mb-3">
                        <AimirahMascot className="w-14 h-14" />
                        <span className="liner text-3xl text-[var(--color-accent)]">
                          aimirah.mixtape
                        </span>
                      </div>

                      <div className="groove mb-3" />

                      <h1 className="max-w-2xl">
                        <span className="block text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                          <span className="sr-only">aimirah.mixtape: </span>
                          Ready-to-use configurations &amp; agent mixtapes for your Claude Code
                          projects — dub a stack, print one command, record it into your repo.
                        </span>
                      </h1>

                      <div className="mt-4">
                        <CassetteWindow
                          recording={totalStackCount > 0}
                          title={
                            totalStackCount > 0
                              ? `${totalStackCount} track${totalStackCount === 1 ? '' : 's'} queued`
                              : 'Side A · blank tape'
                          }
                          className="max-w-md"
                        />
                      </div>
                    </div>

                    {/* Right: the instrument cluster */}
                    <div className="brushed px-5 py-6 flex flex-col gap-4 justify-center bg-[var(--color-surface-2)]">
                      <div className="flex items-center justify-between">
                        <span className="legend" style={{ fontSize: 9 }}>
                          Output Level
                        </span>
                        <span className="legend" style={{ fontSize: 9 }}>
                          −3&nbsp;dB
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 max-w-[380px] mx-auto xl:mx-0 w-full">
                        <VUMeter channel="L" drive={vuDrive} />
                        <VUMeter channel="R" drive={vuDrive * 0.92} />
                      </div>

                      <div className="groove max-w-[380px] mx-auto xl:mx-0 w-full" />

                      <div className="flex items-end justify-between gap-4 max-w-[380px] mx-auto xl:mx-0 w-full">
                        <TapeCounter value={tapeCounter} />
                        <div className="flex flex-col items-end gap-2 pb-1">
                          <RecLamp on={totalStackCount > 0} />
                          <span className="legend" style={{ fontSize: 8.5 }}>
                            {totalStackCount > 0 ? 'Dubbing' : 'Standby'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Faceplate>

                <HomeStats
                  onOpenTrending={() => navigate({ view: 'trending' })}
                  onOpenDocs={() => setSpecModal('docs')}
                />

                {/* Mobile Quick Category Switcher */}
                <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pt-4 pb-1">
                  {SIDEBAR_BROWSE_ORDER.map((t) => {
                    const active = route.typePlural === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => navigate({ view: 'browse', typePlural: t })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap border ${
                          active
                            ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                            : 'bg-[var(--color-surface-1)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                        }`}
                      >
                        {TYPE_META[t].label} ({CATALOG_COUNTS[t]})
                      </button>
                    );
                  })}
                </div>
              </div>

              <ComponentGrid
                activeType={route.typePlural}
                onSelectComponent={(item) =>
                  navigate({ view: 'detail', item, fromType: route.typePlural })
                }
                isInStack={isInStack}
                onToggleStack={handleToggleStack}
                onAddManyToStack={handleAddManyToStack}
                collections={collections}
                onToggleInCollection={handleToggleInCollection}
                onCreateCollection={handleCreateCollection}
                onLoadCollectionToStack={handleLoadCollectionToStack}
                onOpenSpecModal={(k) => setSpecModal(k)}
                onNotify={notify}
              />
            </div>

            {/* Right Sticky Jobs Rail on XL Screens */}
            <aside className="hidden xl:flex flex-col w-[260px] shrink-0 border-l border-[var(--color-border)] sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto bg-[var(--color-surface-0)]">
              <JobsSidebar
                onViewAllJobs={() => navigate({ view: 'jobs' })}
                onSelectJob={(job) => setSelectedJob(job)}
              />
            </aside>
          </div>
        )}

        {route.view === 'detail' && (
          <ComponentDetailView
            item={route.item}
            fromType={route.fromType}
            onBack={() => navigate({ view: 'browse', typePlural: route.fromType })}
            onSelectComponent={(nextItem) =>
              navigate({ view: 'detail', item: nextItem, fromType: nextItem.typePlural })
            }
            isInStack={isInStack(route.item)}
            onToggleStack={() => handleToggleStack(route.item)}
            collections={collections}
            onToggleInCollection={handleToggleInCollection}
            onCreateCollection={handleCreateCollection}
            onNotify={notify}
          />
        )}

        {route.view === 'my-mixtapes' && (
          <MyMixtapesView
            collections={collections}
            onCreateCollection={(name) => handleCreateCollection(name)}
            onDeleteCollection={(id) => {
              setCollections((prev) => prev.filter((c) => c.id !== id));
              notify('Deleted Mixtape Collection');
            }}
            onRemoveFromCollection={(colId, path, typePlural) =>
              handleToggleInCollection(colId, { name: path, path, category: '', typePlural })
            }
            onLoadCollectionToStack={handleLoadCollectionToStack}
            onSelectComponent={(item) =>
              navigate({ view: 'detail', item, fromType: item.typePlural })
            }
            onNotify={notify}
          />
        )}

        {route.view === 'plugins' && <PluginsView onNotify={notify} />}

        {route.view === 'trending' && (
          <TrendingView
            onSelectComponent={(item) =>
              navigate({ view: 'detail', item, fromType: item.typePlural })
            }
            onToggleStack={handleToggleStack}
            isInStack={isInStack}
          />
        )}

        {route.view === 'jobs' && <JobsView onSelectJob={(job) => setSelectedJob(job)} />}

        {/* ── BOTTOM PLATE: manufacturer nameplate ── */}
        <footer className="brushed bg-[var(--color-surface-1)] border-t-2 border-[var(--color-border-strong)] mt-2 shadow-[0_-2px_8px_rgba(0,0,0,.12)]">
          <div className="groove" />
          <div className="px-5 md:px-7 py-5 flex flex-col lg:flex-row lg:items-center gap-5 justify-between">
            {/* Manufacturer / model plate */}
            <div className="flex items-center gap-4 min-w-0">
              <span className="hidden sm:flex flex-col gap-[7px] pl-1">
                <Screw />
                <Screw />
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-[17px] leading-none text-[var(--color-text-primary)]">
                    <span className="liner">aimirah</span>
                    <span className="font-mono text-[12px] font-bold text-[var(--color-accent)]">
                      .mixtape
                    </span>
                  </span>
                  <span className="legend" style={{ fontSize: 9 }}>
                    Model&nbsp;AM-1910 · Open&nbsp;Source
                  </span>
                </div>
                <p className="legend mt-1.5" style={{ fontSize: 8.5, lineHeight: 1.7 }}>
                  {CATALOG_TOTAL_LABEL}+ Claude Code components · Skills · Agents · Commands · MCPs · Hooks
                </p>
              </div>
            </div>

            {/* Etched reference links */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {[
                { label: '/llms.txt', onClick: () => setSpecModal('llms') },
                { label: '/openapi.json', onClick: () => setSpecModal('openapi') },
                { label: 'CLI Docs', onClick: () => setSpecModal('docs') },
                { label: 'GitHub', href: 'https://github.com/aimirah/mixtape' },
                { label: 'Trending', onClick: () => navigate({ view: 'trending' }) },
              ].map((l) =>
                l.href ? (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="legend legend-link"
                    style={{ fontSize: 9 }}
                  >
                    {l.label} ↗
                  </a>
                ) : (
                  <button
                    key={l.label}
                    type="button"
                    onClick={l.onClick}
                    className="legend legend-link cursor-pointer"
                    style={{ fontSize: 9 }}
                  >
                    {l.label}
                  </button>
                )
              )}
            </div>

            {/* The maker's badge */}
            <div className="flex items-center gap-4">
              <span className="hidden lg:block h-8 w-px bg-[var(--color-border)]" />
              <div className="panel-inset rounded-[3px] px-4 py-2 flex items-center gap-3 border border-[var(--color-border)]">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: 'var(--color-led)', boxShadow: '0 0 7px var(--color-led)' }}
                />
                <span
                  className="font-mono font-bold uppercase whitespace-nowrap"
                  style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--color-text-primary)' }}
                >
                  kdmirah lab<span className="text-[var(--color-accent)] px-1.5">|</span>MI4,Inc
                </span>
              </div>
              <span className="hidden sm:flex flex-col gap-[7px] pr-1">
                <Screw />
                <Screw />
              </span>
            </div>
          </div>
        </footer>
      </main>

      {/* Global Search Palette (⌘K) */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(item) => navigate({ view: 'detail', item, fromType: item.typePlural })}
        onToggleStack={handleToggleStack}
        isInStack={isInStack}
      />

      {/* Right Slide-Over Mixtape Stack Builder */}
      <StackBuilderSidebar
        open={stackOpen}
        onOpen={() => setStackOpen(true)}
        onClose={() => setStackOpen(false)}
        cart={cart}
        onRemoveItem={handleRemoveFromStack}
        onClearAll={handleClearStack}
        onSaveStackAsCollection={handleSaveStackAsCollection}
        onNotify={notify}
      />

      {/* Docs / llms.txt / openapi.json Modal */}
      <SpecModal kind={specModal} onClose={() => setSpecModal(null)} onNotify={notify} />

      {/* Job Detail Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6 shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="font-mono text-xs text-[var(--color-accent)] font-bold">
                  {selectedJob.company} · {selectedJob.location}
                </span>
                <h3 className="font-mono text-lg font-bold text-[var(--color-text-primary)] mt-1">
                  {selectedJob.position}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="text-sm font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5">
              {selectedJob.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {selectedJob.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-xs px-2.5 py-1 rounded bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-xs font-mono text-[var(--color-text-secondary)] cursor-pointer"
              >
                Close
              </button>
              <a
                href={selectedJob.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-mono font-semibold"
              >
                Apply on {selectedJob.source} ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback Banner */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-accent)] shadow-xl font-mono text-xs text-[var(--color-text-primary)] flex items-center gap-2 animate-fade-in-up">
          <span className="text-[var(--color-accent)]">●</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
export default App;
