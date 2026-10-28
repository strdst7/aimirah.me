import React, { useState } from 'react';
import {
  buildSingleInstallCmd,
  CATALOG_BY_TYPE,
  formatComponentTitle,
  stripExt,
} from '../data/catalog';
import {
  CatalogItem,
  ComponentTypePlural,
  MixtapeCollection,
  SavedComponentRef,
} from '../types/catalog';
import { TYPE_META, TypeIcon } from './Icons';
import { SkillSpectorBadge } from './SkillSpectorBadge';
import { ComponentTerminal } from './ComponentTerminal';
import { SaveToCollectionButton } from './SaveToCollectionButton';

export const ComponentDetailView: React.FC<{
  item: CatalogItem;
  fromType: ComponentTypePlural;
  onBack: () => void;
  onSelectComponent: (item: CatalogItem) => void;
  isInStack: boolean;
  onToggleStack: () => void;
  collections: MixtapeCollection[];
  onToggleInCollection: (collectionId: string, item: SavedComponentRef) => void;
  onCreateCollection: (name: string, initialItem?: SavedComponentRef) => void;
  onNotify: (msg: string) => void;
}> = ({
  item,
  fromType,
  onBack,
  onSelectComponent,
  isInStack,
  onToggleStack,
  collections,
  onToggleInCollection,
  onCreateCollection,
  onNotify,
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);

  const meta = TYPE_META[item.typePlural];
  const installCmd = buildSingleInstallCmd(item);
  const title = formatComponentTitle(item.name);
  const fileName =
    item.typePlural === 'skills'
      ? `${stripExt(item.name)}/SKILL.md`
      : item.typePlural === 'mcps' || item.typePlural === 'settings' || item.typePlural === 'hooks'
      ? `${stripExt(item.name)}.json`
      : `${stripExt(item.name)}.md`;

  const related = (CATALOG_BY_TYPE[item.typePlural] ?? [])
    .filter((c) => c.path !== item.path)
    .sort((a, b) => {
      const sameCatA = a.category === item.category ? 1 : 0;
      const sameCatB = b.category === item.category ? 1 : 0;
      if (sameCatA !== sameCatB) return sameCatB - sameCatA;
      return b.downloads - a.downloads;
    })
    .slice(0, 3);

  const handleCopyCmd = () => {
    navigator.clipboard?.writeText(installCmd);
    setCopiedCmd(true);
    onNotify('Copied install command to clipboard!');
    setTimeout(() => setCopiedCmd(false), 1800);
  };

  const handleCopyRaw = () => {
    navigator.clipboard?.writeText(item.content ?? '');
    setCopiedFile(true);
    onNotify(`Copied ${fileName} contents!`);
    setTimeout(() => setCopiedFile(false), 1800);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([item.content ?? ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.split('/').pop() || 'component.md';
    a.click();
    URL.revokeObjectURL(url);
    onNotify(`Downloaded ${fileName}`);
  };

  const rawLines = (item.content ?? '').split('\n');

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 animate-fade-in-up">
      {/* Back Breadcrumb */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[13px] font-mono font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-7 group px-3.5 py-2 rounded-lg hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all cursor-pointer"
      >
        <svg
          className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to {TYPE_META[fromType].label}
      </button>

      {/* Top Two-Column Hero + Live Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-stretch">
        {/* Left: Metadata & CLI Install Card */}
        <div className="flex flex-col gap-5 min-w-0">
          <div className="panel-raised relative overflow-hidden rounded-[5px] border border-[var(--color-border)] p-6">
            <div className="flex items-start gap-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg animate-float"
                style={{
                  background: `linear-gradient(135deg, ${meta.color}26 0%, ${meta.color}12 100%)`,
                  color: meta.color,
                  border: `2px solid ${meta.color}44`,
                }}
              >
                <TypeIcon type={item.typePlural} size={30} />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-bold font-mono text-[var(--color-text-primary)] mb-3 tracking-tight break-words">
                  {title}
                </h1>
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                    {meta.label}
                  </span>
                  <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                    {item.category}
                  </span>
                  {item.downloads > 0 && (
                    <span className="badge-download py-1 px-3 text-xs">
                      ↓ {item.downloads.toLocaleString()}
                    </span>
                  )}
                  <SkillSpectorBadge result={item.skillspector} size="md" />
                </div>
              </div>
            </div>

            <p className="mt-5 text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
              {item.description}
            </p>
          </div>

          {/* Install Command Box */}
          <div className="bg-gradient-to-br from-[var(--color-surface-1)] to-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/35 flex items-center justify-center text-[var(--color-accent)]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Install Command
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCmd}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold text-white bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] rounded-lg transition-all cursor-pointer"
                >
                  {copiedCmd ? '✓ Copied' : 'Copy Command'}
                </button>

                <button
                  type="button"
                  onClick={onToggleStack}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                    isInStack
                      ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                      : 'bg-[var(--color-surface-3)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                  }`}
                >
                  {isInStack ? '✓ In Mixtape Stack' : '+ Add to Stack'}
                </button>

                <div className="group">
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
                </div>
              </div>
            </div>

            <code
              className="counter-window text-[13px] font-mono break-all leading-relaxed block px-4 py-3 rounded-[3px]"
              style={{
                color: 'var(--color-display-amber)',
                textShadow: '0 0 8px rgba(255,180,84,.45)',
              }}
            >
              {installCmd}
            </code>

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-[11.5px] font-mono text-[var(--color-text-tertiary)]">
              <span>
                Target path: <strong className="text-[var(--color-text-secondary)]">{meta.installDir}/{fileName}</strong>
              </span>
              <span>License: {item.license || 'MIT'}</span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Terminal Simulator */}
        <ComponentTerminal
          typePlural={item.typePlural}
          title={title}
          path={stripExt(item.path)}
          installCmd={installCmd}
        />
      </div>

      {/* Plain-File Source Inspector — recessed display window */}
      <div className="rounded-[5px] border-2 border-black/60 bg-[var(--color-surface-1)] overflow-hidden shadow-[0_3px_14px_rgba(0,0,0,.22)] mb-10">
        <div className="px-5 py-3.5 border-b-2 border-[var(--color-border-strong)] brushed flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <span className="text-[var(--color-accent)] font-bold">FILE</span>
            <span className="text-[var(--color-text-primary)] font-semibold">{fileName}</span>
            <span className="text-[var(--color-text-tertiary)]">({rawLines.length} lines · plain readable source)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyRaw}
              className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] hover:border-[var(--color-accent)] text-xs font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
            >
              {copiedFile ? '✓ Copied Raw' : 'Copy Raw'}
            </button>
            <button
              type="button"
              onClick={handleDownloadFile}
              className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] hover:border-[var(--color-accent)] text-xs font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
            >
              ↓ Download File
            </button>
          </div>
        </div>

        <div
          className="max-h-[460px] overflow-auto p-4 font-mono text-[12.5px] leading-relaxed"
          style={{
            background: 'var(--color-display)',
            color: 'var(--color-display-amber)',
            textShadow: '0 0 6px rgba(255,180,84,.28)',
          }}
        >
          {rawLines.map((line, i) => (
            <div key={i} className="flex gap-4 hover:bg-white/[0.05] px-2 rounded">
              <span className="w-8 shrink-0 text-right select-none opacity-50" style={{ color: 'var(--color-display-dim)' }}>
                {i + 1}
              </span>
              <span className="whitespace-pre-wrap break-words flex-1">{line || ' '}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tracks */}
      {related.length > 0 && (
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-4">
            More {meta.label} in Catalog
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((rel) => (
              <div
                key={rel.path}
                onClick={() => onSelectComponent(rel)}
                className="p-4 rounded-lg bg-[var(--color-card-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] cursor-pointer transition-all group"
              >
                <div className="font-mono text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] mb-1">
                  {formatComponentTitle(rel.name)}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-3">
                  {rel.description}
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-text-tertiary)]">
                  <span>{rel.category}</span>
                  <span className="text-[var(--color-success)]">↓ {rel.downloads.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
