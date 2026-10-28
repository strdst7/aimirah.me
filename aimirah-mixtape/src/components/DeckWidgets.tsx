import React, { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ *
 *  Phillips screw head — four corners of every faceplate
 * ------------------------------------------------------------------ */
export const Screw: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`screw ${className}`} aria-hidden="true" />
);

export const ScrewsOnPanel: React.FC = () => (
  <>
    <span className="absolute top-1.5 left-1.5"><Screw /></span>
    <span className="absolute top-1.5 right-1.5"><Screw /></span>
    <span className="absolute bottom-1.5 left-1.5"><Screw /></span>
    <span className="absolute bottom-1.5 right-1.5"><Screw /></span>
  </>
);

/* ------------------------------------------------------------------ *
 *  REC lamp — lit whenever the dubbing stack holds at least one track
 * ------------------------------------------------------------------ */
export const RecLamp: React.FC<{ on: boolean; label?: string }> = ({ on, label = 'REC' }) => (
  <span className="inline-flex items-center gap-2 select-none">
    <span
      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
        on ? 'rec-led' : ''
      }`}
      style={{
        background: on ? 'var(--color-led)' : 'var(--color-surface-4)',
        boxShadow: on
          ? '0 0 10px var(--color-led)'
          : 'inset 0 1px 2px rgba(0,0,0,.5)',
        border: '1px solid rgba(0,0,0,.35)',
      }}
      aria-hidden="true"
    />
    <span
      className="legend"
      style={{
        fontSize: 9,
        // printed label stays ink (4.7:1); the lamp itself carries the glow
        color: on ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
        transition: 'color .3s',
      }}
    >
      {label}
    </span>
  </span>
);

/* ------------------------------------------------------------------ *
 *  Analog VU meter — ballistic needle driven by rAF
 *  Needle rests at the left, kicked by "signal", falls back with
 *  ~300ms damping, spikes into the red past -3dB.
 * ------------------------------------------------------------------ */
const VU_W = 132;
const VU_H = 78;
const PIVOT_X = VU_W / 2;
const PIVOT_Y = VU_H + 16;
const RADIUS = 74;
const A0 = -52; // degrees at rest (full left)
const A1 = 52; // degrees at full scale

function polar(deg: number, r: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: PIVOT_X + r * Math.cos(rad), y: PIVOT_Y + r * Math.sin(rad) };
}

function arcPath(from: number, to: number, r: number) {
  const a = polar(from, r);
  const b = polar(to, r);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

export const VUMeter: React.FC<{
  channel: string;
  /** 0..1 activity from the app; needle target scales with it */
  drive: number;
  peakHold?: boolean;
}> = ({ channel, drive, peakHold = true }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const angleRef = useRef(A0);
  const velRef = useRef(0);
  const targetRef = useRef(A0);
  const peakRef = useRef(A0);
  const rafRef = useRef<number | null>(null);
  const [needleAngle, setNeedleAngle] = useState(A0);
  const [peakAngle, setPeakAngle] = useState(A0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      const rest = A0 + (A1 - A0) * Math.min(1, Math.max(0, drive)) * 0.72;
      angleRef.current = rest;
      setNeedleAngle(rest);
      setPeakAngle(rest);
      return;
    }

    let phase = 0;

    const tick = () => {
      phase += 0.045;
      // signal: drive raises the ceiling, plus a little music-like wobble
      const wobble = 0.16 * Math.abs(Math.sin(phase)) + 0.08 * Math.abs(Math.sin(phase * 2.7));
      const mag = Math.min(1, Math.max(0, drive)) * (0.62 + wobble) + wobble * 0.18;
      targetRef.current = A0 + (A1 - A0) * Math.min(1, mag);

      // ballistic integrator: underdamped spring toward target
      const k = 0.055;
      const damp = 0.72;
      velRef.current += (targetRef.current - angleRef.current) * k;
      velRef.current *= damp;
      angleRef.current += velRef.current;
      angleRef.current = Math.max(A0 - 3, Math.min(A1 + 3, angleRef.current));

      if (angleRef.current > peakRef.current) peakRef.current = angleRef.current;
      else peakRef.current -= 0.35; // peak falls back slowly

      setNeedleAngle(angleRef.current);
      if (peakHold) setPeakAngle(Math.max(A0, peakRef.current));

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drive, peakHold]);

  const arcEnd = A0 + (A1 - A0) * 0.58; // black scale ends here
  const redStart = arcEnd;

  return (
    <div className="relative overflow-hidden rounded-[3px] vu-face border border-black/30">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VU_W} ${VU_H + 20}`}
        className="w-full block"
        aria-label={`${channel} VU meter`}
        role="img"
      >
        {/* scale arcs */}
        <path d={arcPath(A0, arcEnd, RADIUS - 4)} fill="none" stroke="#1a1a1a" strokeWidth="1.3" />
        <path d={arcPath(redStart, A1, RADIUS - 4)} fill="none" stroke="#c8341a" strokeWidth="2.4" />

        {/* tick marks */}
        {Array.from({ length: 11 }, (_, i) => {
          const t = i / 10;
          const deg = A0 + (A1 - A0) * t;
          const major = i % 2 === 0;
          const inner = polar(deg, RADIUS - (major ? 11 : 7));
          const outer = polar(deg, RADIUS - 4);
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={t >= 0.58 ? '#c8341a' : '#1a1a1a'}
              strokeWidth={major ? 1.4 : 0.8}
            />
          );
        })}

        {/* dB scale numerals */}
        {[
          { t: 0, label: '-20' },
          { t: 0.28, label: '-10' },
          { t: 0.56, label: '-5' },
          { t: 0.74, label: '-3' },
          { t: 1, label: '+3' },
        ].map((m) => {
          const pos = polar(A0 + (A1 - A0) * m.t, RADIUS - 19);
          return (
            <text
              key={m.label}
              x={pos.x}
              y={pos.y + 3}
              textAnchor="middle"
              fontFamily="Geist Mono, monospace"
              fontSize="7.5"
              fontWeight="600"
              fill={m.t >= 0.58 ? '#c8341a' : '#1a1a1a'}
            >
              {m.label}
            </text>
          );
        })}

        {/* VU legend + channel */}
        <text
          x={PIVOT_X}
          y={VU_H - 6}
          textAnchor="middle"
          fontFamily="Geist Mono, monospace"
          fontSize="8.5"
          fontWeight="700"
          letterSpacing="2.4"
          fill="#1a1a1a"
        >
          VU {channel}
        </text>

        {/* peak-hold flag */}
        {peakHold && (
          <line
            {...(() => {
              const a = polar(peakAngle, RADIUS - 4);
              const b = polar(peakAngle, RADIUS - 13);
              return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
            })()}
            stroke="#c8341a"
            strokeWidth="2"
          />
        )}

        {/* the needle */}
        <g transform={`rotate(${needleAngle.toFixed(2)} ${PIVOT_X} ${PIVOT_Y})`}>
          <line
            x1={PIVOT_X}
            y1={PIVOT_Y}
            x2={PIVOT_X}
            y2={PIVOT_Y - (RADIUS - 3)}
            stroke="#141414"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
        <circle cx={PIVOT_X} cy={PIVOT_Y} r="6" fill="#2a2a2a" />
        <circle cx={PIVOT_X} cy={PIVOT_Y} r="2.4" fill="#6f6f6f" />
      </svg>

      {/* glass reflection */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(255,255,255,.42) 0%, rgba(255,255,255,.06) 34%, transparent 46%)',
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ *
 *  4-digit mechanical tape counter with rolling digits
 * ------------------------------------------------------------------ */
export const TapeCounter: React.FC<{ value: number; label?: string }> = ({
  value,
  label = 'TAPE COUNTER',
}) => {
  const text = String(Math.max(0, Math.floor(value)) % 10000).padStart(4, '0');
  return (
    <div className="flex flex-col gap-1.5">
      <div className="counter-window flex items-center justify-center gap-[3px] px-3 py-2 rounded-[3px]">
        {text.split('').map((d, i) => (
          <span
            key={i}
            className="font-mono tabular-nums"
            style={{
              fontSize: 26,
              fontWeight: 700,
              lineHeight: 1,
              color: 'var(--color-display-amber)',
              textShadow: '0 0 9px rgba(255,180,84,.75)',
              background: 'rgba(255,255,255,.035)',
              padding: '3px 5px',
              borderRadius: 2,
              minWidth: 19,
              textAlign: 'center',
            }}
          >
            {d}
          </span>
        ))}
      </div>
      <span className="legend text-center" style={{ fontSize: 8.5 }}>
        {label}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 *  Cassette window: two reels that spin faster while recording
 * ------------------------------------------------------------------ */
export const CassetteWindow: React.FC<{
  recording?: boolean;
  title?: string;
  className?: string;
}> = ({ recording = false, title = 'CHROME II · 90', className = '' }) => (
  <div
    className={`relative overflow-hidden rounded-[4px] border border-black/50 ${className}`}
    style={{
      background: 'linear-gradient(180deg, #12181b 0%, #0a0f11 100%)',
      boxShadow: 'inset 0 3px 10px rgba(0,0,0,.8), 0 1px 0 var(--plate-hi)',
    }}
  >
    <div className="flex items-center gap-4 px-5 py-4">
      <svg width="86" height="54" viewBox="0 0 86 54" aria-hidden="true" className="shrink-0">
        {/* shell */}
        <rect x="1" y="1" width="84" height="52" rx="3" fill="none" stroke="#3a4045" strokeWidth="1.4" />
        {/* label strip */}
        <rect x="7" y="5" width="72" height="9" rx="1.5" fill="#e05a34" opacity="0.85" />
        {/* tape path */}
        <path d="M22 34 H64" stroke="#4a4038" strokeWidth="5" strokeLinecap="round" />
        <g className={recording ? 'animate-reel-fast' : 'animate-reel'} style={{ transformOrigin: '25px 34px' }}>
          <circle cx="25" cy="34" r="13" fill="#1c2226" stroke="#4b5257" strokeWidth="1.4" />
          <circle cx="25" cy="34" r="5" fill="#575f65" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <rect
              key={a}
              x="24"
              y="21.5"
              width="2"
              height="6"
              fill="#9aa2a8"
              transform={`rotate(${a} 25 34)`}
            />
          ))}
        </g>
        <g className={recording ? 'animate-reel-fast' : 'animate-reel'} style={{ transformOrigin: '61px 34px' }}>
          <circle cx="61" cy="34" r="13" fill="#1c2226" stroke="#4b5257" strokeWidth="1.4" />
          <circle cx="61" cy="34" r="5" fill="#575f65" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <rect
              key={a}
              x="60"
              y="21.5"
              width="2"
              height="6"
              fill="#9aa2a8"
              transform={`rotate(${a} 61 34)`}
            />
          ))}
        </g>
      </svg>

      <div className="min-w-0 flex-1">
        <div className="legend" style={{ fontSize: 8.5, color: 'var(--color-display-dim)' }}>
          {recording ? '● RECORDING' : 'STOP / PAUSE'}
        </div>
        <div
          className="liner truncate"
          style={{
            fontSize: 19,
            color: recording ? 'var(--color-led)' : '#e8e3d8',
            textShadow: recording ? '0 0 10px rgba(255,92,56,.6)' : 'none',
          }}
        >
          {title}
        </div>
        <div
          className="font-mono"
          style={{ fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--color-display-dim)' }}
        >
          aimirah.mixtape
        </div>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ *
 *  Faceplate wrapper with milled border + corner screws
 * ------------------------------------------------------------------ */
export const Faceplate: React.FC<{
  children: React.ReactNode;
  className?: string;
  screws?: boolean;
}> = ({ children, className = '', screws = true }) => (
  <div
    className={`panel-raised relative rounded-[5px] border border-[var(--color-border)] ${className}`}
  >
    {screws && <ScrewsOnPanel />}
    {children}
  </div>
);

/* ------------------------------------------------------------------ *
 *  Small screen-printed legend chip, e.g. "DOLBY NR", "METAL"
 * ------------------------------------------------------------------ */
export const LegendChip: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}> = ({ children, active = false, className = '' }) => (
  <span
    className={`legend inline-flex items-center px-2 py-[3px] rounded-[2px] border ${className}`}
    style={{
      fontSize: 9,
      borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
      color: active ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
      background: active ? 'var(--color-accent-light)' : 'transparent',
    }}
  >
    {children}
  </span>
);

/**
 * Drives VU activity from the current stack size + a slow drift so the
 * needles look like they are reading a real program signal.
 */
export function useVUDrive(stackCount: number) {
  const [drift, setDrift] = useState(0.14);
  useEffect(() => {
    const id = window.setInterval(() => {
      setDrift(0.1 + Math.random() * 0.28);
    }, 620);
    return () => window.clearInterval(id);
  }, []);
  const base = Math.min(1, stackCount / 6);
  return Math.min(1, base * 0.72 + drift * (0.4 + base));
}
