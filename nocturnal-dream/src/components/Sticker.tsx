import type { CSSProperties } from "react";

// The sticker sheet: one ink block per line, a couple of pieces of tape, a printing that never quite lined up.
// `show` peels them on (rotateX from the top edge); off they lift and curl.

const rot = (i: number, seed = 0) => ((((i * 37 + seed * 91) % 13) / 13) - 0.5) * 1.5;

export function Sticker({
  lines,
  size,
  show,
  align = "center",
  seed = 0,
  className = "",
  style,
  ghost = true,
}: {
  lines: string[];
  size: number; // 1 = the opening card
  show: boolean;
  align?: "left" | "center" | "right";
  seed?: number;
  className?: string;
  style?: CSSProperties;
  ghost?: boolean;
}) {
  const fs = `clamp(${Math.round(11 + size * 13)}px, ${(size * 4.3).toFixed(2)}vw, ${Math.round(size * 104)}px)`;
  return (
    <div
      className={`stk-wrap ${className}`}
      style={{
        alignItems: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
        ...style,
      }}
    >
      {lines.map((l, i) => {
        const r = rot(i, seed);
        return (
          <div
            key={i}
            className="stk"
            style={{
              opacity: show ? 1 : 0,
              transform: show
                ? `rotate(${r.toFixed(2)}deg)`
                : `rotate(${(r * 2).toFixed(2)}deg) translateY(${(-30 - i * 14).toFixed(0)}px) rotateX(-72deg)`,
              transition: `opacity .45s ${show ? i * 0.075 : 0}s ease, transform .75s ${show ? i * 0.075 : 0}s cubic-bezier(.2,.7,.2,1)`,
              fontSize: fs,
            }}
          >
            <span className="stk-line" data-t={ghost ? l : undefined}>
              {l}
            </span>
            <i className="tape" style={{ left: `${12 + ((i * 29 + seed * 13) % 40)}%`, top: "calc(-6px * var(--s))", transform: `rotate(${(-4 + r * 2).toFixed(1)}deg)` }} />
            {l.length > 12 && (
              <i
                className="tape"
                style={{
                  right: `${6 + ((i * 17 + seed * 7) % 22)}%`,
                  top: "calc(50% - 7px * var(--s))",
                  width: "calc(34px * var(--s))",
                  transform: `rotate(${(78 + r).toFixed(1)}deg)`,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** the wordmark: a small ink can with two folded wings and the name under it */
export function Logo({ size = 1, tone = "#f1e8d0" }: { size?: number; tone?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        background: "#0b0a08",
        color: tone,
        padding: "calc(5px * var(--s)) calc(10px * var(--s))",
        width: `calc(${Math.round(74 * size)}px * var(--s))`,
        height: `calc(${Math.round(58 * size)}px * var(--s))`,
      }}
    >
      <svg viewBox="0 0 40 16" style={{ width: `calc(46px * var(--s) * ${size})` }} aria-hidden>
        <path d="M1 14 L15 3 L20 9 L25 3 L39 14 Z" fill={tone} opacity="0.92" />
      </svg>
      <span className="u-mono-tight" style={{ marginTop: "calc(2px * var(--s))", letterSpacing: "0.14em" }}>
        nocturnal
      </span>
    </div>
  );
}
