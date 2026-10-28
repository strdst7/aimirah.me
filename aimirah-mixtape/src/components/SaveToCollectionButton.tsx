import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ComponentTypePlural, MixtapeCollection, SavedComponentRef } from '../types/catalog';

export const SaveToCollectionButton: React.FC<{
  item: SavedComponentRef;
  collections: MixtapeCollection[];
  onToggleInCollection: (collectionId: string, item: SavedComponentRef) => void;
  onCreateCollection: (name: string, initialItem?: SavedComponentRef) => void;
}> = ({ item, collections, onToggleInCollection, onCreateCollection }) => {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const isSavedAnywhere = collections.some((col) =>
    col.items.some((i) => i.path === item.path && i.typePlural === item.typePlural)
  );

  useEffect(() => {
    if (!open) return;
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const width = 256;
      const left = Math.max(8, Math.min(r.right - width, window.innerWidth - width - 12));
      const top =
        window.innerHeight - r.bottom > 260 ? r.bottom + 6 : Math.max(12, r.top - 245);
      setPos({ top, left });
    }
    const handleOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateCollection(newName.trim(), item);
    setNewName('');
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        title={isSavedAnywhere ? 'Saved to Mixtape Collection' : 'Save to Mixtape Collection'}
        aria-label="Save to Mixtape Collection"
        className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-150 ${
          isSavedAnywhere
            ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/12 border border-[var(--color-accent)]/40 opacity-100'
            : 'text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] border border-transparent hover:border-[var(--color-border)]'
        }`}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill={isSavedAnywhere ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-[1000] w-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] shadow-2xl overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-[var(--color-border)] flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Save to Mixtape
              </span>
              <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">
                {collections.length} tapes
              </span>
            </div>
            <div className="max-h-44 overflow-y-auto py-1">
              {collections.map((col) => {
                const checked = col.items.some(
                  (i: { path: string; typePlural: ComponentTypePlural }) =>
                    i.path === item.path && i.typePlural === item.typePlural
                );
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => onToggleInCollection(col.id, item)}
                    className="w-full px-3 py-2 flex items-center gap-2.5 text-left text-[12px] hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        checked
                          ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                          : 'border-[var(--color-border)] bg-[var(--color-surface-0)]'
                      }`}
                    >
                      {checked && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="truncate flex-1 font-medium text-[var(--color-text-primary)]">
                      {col.name}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">
                      {col.items.length}
                    </span>
                  </button>
                );
              })}
            </div>
            <form
              onSubmit={handleCreate}
              className="p-2 border-t border-[var(--color-border)] bg-[var(--color-surface-0)] flex gap-1.5"
            >
              <input
                type="text"
                placeholder="New mixtape name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 min-w-0 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded px-2 py-1 text-[11px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-accent)]"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-mono text-[11px] font-semibold shrink-0"
              >
                Add
              </button>
            </form>
          </div>,
          document.body
        )}
    </>
  );
};
