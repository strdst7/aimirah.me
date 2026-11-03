import { ReactNode } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { useInView } from '../hooks/useFx';
import { cn } from '@aimirah/shared/cn';

/* ------------------------------ Reveal ------------------------------ */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.12);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
        className
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------ Panel ------------------------------- */
export function Panel({
  children,
  className,
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-line bg-panel/90 overflow-hidden',
        className
      )}
    >
      {accent && (
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
      )}
      {children}
    </div>
  );
}

/* --------------------------- SectionShell --------------------------- */
export function SectionShell({
  no,
  kicker,
  title,
  accent = '#ffb020',
  blurb,
  right,
  children,
  id,
}: {
  no: string;
  kicker: string;
  title: [string, string]; // [white part, neon part]
  accent?: string;
  blurb: string;
  right?: ReactNode;
  children: ReactNode;
  id: string;
}) {
  return (
    <section id={id} className="relative scroll-mt-24 border-t border-line">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24 relative">
        {/* ghost numeral */}
        <span
          aria-hidden
          className="pointer-events-none select-none absolute -top-2 right-2 md:right-8 font-display text-[22vw] md:text-[11rem] leading-none text-outline-faint"
        >
          {no}
        </span>

        <Reveal>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="font-mono text-[10px] tracking-[0.3em] uppercase px-2.5 py-1 border border-line rounded-full"
                  style={{ color: accent }}
                >
                  {no}
                </span>
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-mute">
                  {kicker}
                </span>
              </div>
              <h2 className="font-display uppercase leading-[0.95] text-4xl sm:text-5xl md:text-6xl text-white">
                {title[0]} <span style={{ color: accent }}>{title[1]}</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm md:text-[15px] text-mute leading-relaxed font-mono">
                {blurb}
              </p>
            </div>
            {right}
          </div>
        </Reveal>

        <div className="mt-10 md:mt-14">{children}</div>
      </div>
    </section>
  );
}

/* ---------------------------- Load states --------------------------- */
export function Skeleton({ label, height = 'h-64' }: { label: string; height?: string }) {
  return (
    <Panel className={cn('flex flex-col items-center justify-center gap-4', height)}>
      <div className="relative w-40 h-px bg-white/10 overflow-hidden">
        <div className="absolute top-0 h-px w-1/3 bg-neon-green animate-scan" />
      </div>
      <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-mute">
        {label}
        <span className="animate-blink">_</span>
      </p>
    </Panel>
  );
}

export function ErrorPanel({
  label,
  code,
  onRetry,
  height = 'h-64',
}: {
  label: string;
  code: string | null;
  onRetry: () => void;
  height?: string;
}) {
  return (
    <Panel
      className={cn('flex flex-col items-center justify-center gap-3 border-red-500/20', height)}
      accent="#ef4444"
    >
      <TriangleAlert className="w-5 h-5 text-red-400" />
      <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-red-400">{label} — OFFLINE</p>
      <p className="font-mono text-[10px] text-mute">{code ?? 'ERR_UNKNOWN'}</p>
      <button
        onClick={onRetry}
        className="mt-1 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase border border-white/15 rounded-full px-4 py-2 hover:bg-white/5 hover:border-neon-green/40 transition-colors"
      >
        <RefreshCw className="w-3 h-3" /> Retry feed
      </button>
    </Panel>
  );
}

/* ----------------------------- CSS Flag ------------------------------ */
/** Stylised Jalur Gemilang rendered in pure CSS. */
export function MYFlag({ className }: { className?: string }) {
  return (
    <div
      title="Jalur Gemilang"
      className={cn('relative overflow-hidden rounded-[3px] ring-1 ring-white/25 shrink-0', className)}
      style={{
        background:
          'repeating-linear-gradient(180deg, #cc0001 0 14.3%, #ffffff 14.3% 28.6%)',
        backgroundSize: '100% 175%',
      }}
    >
      {/* canton */}
      <div className="absolute left-0 top-0 w-[55%] h-[57%]" style={{ background: '#010066' }}>
        {/* crescent: blue disc punched out of gold disc */}
        <div
          className="absolute rounded-full"
          style={{
            width: '58%',
            aspectRatio: '1',
            left: '14%',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#ffcc00',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '50%',
            aspectRatio: '1',
            left: '30%',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#010066',
          }}
        />
      </div>
    </div>
  );
}

/* --------------------------- Chart tooltip --------------------------- */
export function ChartTip(props: {
  active?: boolean;
  payload?: ReadonlyArray<{ dataKey?: string | number; value?: number | string; color?: string; stroke?: string }>;
  label?: string | number;
  unit?: string;
}) {
  const { active, payload, label, unit = '' } = props;
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0b13]/95 backdrop-blur px-3.5 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute mb-1.5">{label}</p>
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 font-mono text-xs">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: p.color ?? p.stroke ?? '#fff' }}
            />
            <span className="text-white/70 uppercase tracking-wider text-[10px]">
              {String(p.dataKey)}
            </span>
            <span className="ml-auto pl-4 font-bold text-white">
              {typeof p.value === 'number' ? p.value.toLocaleString('en-MY') : p.value}
              {unit && <span className="text-mute text-[10px] ml-1">{unit}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- Delta chip ------------------------------ */
export function Delta({ value, pct, invert = false }: { value: number; pct?: boolean; invert?: boolean }) {
  if (!Number.isFinite(value)) return null;
  const up = value > 0;
  const flat = Math.abs(value) < 1e-9;
  // for rates, "up" = foreign currency stronger. keep neutral green/red.
  const good = invert ? !up : up;
  const color = flat ? 'text-mute' : good ? 'text-neon-green' : 'text-neon-pink';
  return (
    <span className={cn('font-mono text-[10px] font-bold inline-flex items-center gap-1', color)}>
      <span>{flat ? '■' : up ? '▲' : '▼'}</span>
      <span>
        {up ? '+' : ''}
        {pct ? (value * 100).toFixed(2) + '%' : Math.abs(value).toFixed(3)}
      </span>
    </span>
  );
}
