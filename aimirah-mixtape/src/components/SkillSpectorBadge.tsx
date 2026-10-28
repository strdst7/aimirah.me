import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SkillSpectorResult } from '../types/catalog';

const DOTS = [
  { key: 'LOW', color: '#22c55e' },
  { key: 'MEDIUM', color: '#f59e0b' },
  { key: 'HIGH', color: '#ef4444' },
];

const SEVERITY_COLORS: Record<string, string> = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  CRITICAL: '#dc2626',
};

const REC_LABELS: Record<string, string> = {
  SAFE: 'Safe to install',
  CAUTION: 'Review before installing',
  DO_NOT_INSTALL: 'Do not install without review',
};

export const SkillSpectorBadge: React.FC<{
  result?: SkillSpectorResult;
  size?: 'sm' | 'md';
}> = ({ result, size = 'sm' }) => {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 16);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    if (window.innerHeight - rect.bottom > 280 || rect.top < window.innerHeight - rect.bottom) {
      setCoords({ top: rect.bottom + 6, left, width });
    } else {
      setCoords({ bottom: window.innerHeight - rect.top + 6, left, width });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onScroll = (e: Event) => {
      if (tooltipRef.current && e.target instanceof Node && tooltipRef.current.contains(e.target)) {
        return;
      }
      close();
    };
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', close);
    };
  }, [open]);

  if (!result) return null;

  const severity = (result.severity || 'LOW').toUpperCase();
  const activeDot = severity === 'LOW' ? 0 : severity === 'MEDIUM' ? 1 : 2;
  const color = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.LOW;
  const isMd = size === 'md';

  const handleOpen = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleClose = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 140);
  };

  return (
    <>
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-label={`NVIDIA SkillSpector Scanner: ${severity} risk, score ${result.score} of 100`}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className={`inline-flex items-center gap-1.5 font-mono font-semibold border cursor-help select-none whitespace-nowrap transition-opacity hover:opacity-95 ${
          isMd ? 'text-xs px-3 py-1.5 rounded-full shadow-sm' : 'text-[10px] px-2 py-0.5 rounded'
        }`}
        style={{
          color,
          borderColor: `${color}55`,
          backgroundColor: `${color}14`,
        }}
      >
        <span className="inline-flex items-center gap-[3px]" aria-hidden="true">
          {DOTS.map((d, idx) => (
            <span
              key={d.key}
              className={`${isMd ? 'w-2 h-2' : 'w-1.5 h-1.5'} rounded-full`}
              style={
                idx === activeDot
                  ? { backgroundColor: d.color, boxShadow: `0 0 6px ${d.color}` }
                  : { backgroundColor: 'var(--color-text-tertiary)', opacity: 0.28 }
              }
            />
          ))}
        </span>
        NVIDIA SkillSpector Scanner
      </span>

      {open &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[1000] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] shadow-2xl text-left"
            style={{
              top: coords.top,
              bottom: coords.bottom,
              left: coords.left,
              width: coords.width,
            }}
          >
            <div className="px-4 pt-3 pb-2.5 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  NVIDIA SkillSpector Scanner
                </span>
                <span
                  className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ color, backgroundColor: `${color}1f` }}
                >
                  {severity}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold" style={{ color }}>
                  {result.score}
                </span>
                <span className="font-mono text-[11px] text-[var(--color-text-tertiary)]">
                  / 100 risk score
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(4, result.score)}%`, backgroundColor: color }}
                />
              </div>
              <p className="mt-2 text-[12px] text-[var(--color-text-primary)]">
                {REC_LABELS[result.recommendation] ?? result.recommendation}
                {result.analysis === 'partial' && (
                  <span className="text-[var(--color-text-tertiary)]"> (partial analysis)</span>
                )}
                <span className="text-[var(--color-text-tertiary)]">
                  {' '}
                  · {result.issueCount} {result.issueCount === 1 ? 'finding' : 'findings'}
                </span>
              </p>
            </div>

            {result.findings && result.findings.length > 0 && (
              <ul className="px-4 py-2.5 space-y-2 max-h-[160px] overflow-y-auto">
                {result.findings.map((f, i) => (
                  <li key={i} className="flex gap-2 text-[11px] leading-snug">
                    <span
                      className="mt-[5px] w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: SEVERITY_COLORS[f.severity] ?? SEVERITY_COLORS.LOW }}
                    />
                    <span className="min-w-0">
                      <span className="text-[var(--color-text-primary)]">{f.title}</span>
                      {(f.count ?? 0) > 1 && (
                        <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">
                          {' '}
                          ×{f.count}
                        </span>
                      )}
                      <span className="block font-mono text-[10px] text-[var(--color-text-tertiary)] truncate">
                        {f.category} · {f.file}
                        {f.line ? `:${f.line}` : ''}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="px-4 py-2 border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-tertiary)] leading-relaxed">
              Static analysis (no LLM) verified for aimirah.mixtape
              {result.version ? ` · v${result.version}` : ''}
              {result.scannedAt ? ` · ${result.scannedAt.slice(0, 10)}` : ''}. Bands: 0–20 low, 21–50 medium, 51+ high.
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
