import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type Lenis from "lenis";

/* ------------------------------------------------------------------ */
/*  math                                                               */
/* ------------------------------------------------------------------ */
export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/* ------------------------------------------------------------------ */
/*  global RAF loop                                                    */
/* ------------------------------------------------------------------ */
type Cb = (t: number) => void;
const subs = new Set<Cb>();
let started = false;

function loop(t: number) {
  subs.forEach((cb) => cb(t));
  requestAnimationFrame(loop);
}
function start() {
  if (!started) {
    started = true;
    requestAnimationFrame(loop);
  }
}

export function useRaf(cb: Cb, active = true) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (!active) return;
    const fn: Cb = (t) => ref.current(t);
    subs.add(fn);
    start();
    return () => {
      subs.delete(fn);
    };
  }, [active]);
}

/* ------------------------------------------------------------------ */
/*  Lenis context                                                      */
/* ------------------------------------------------------------------ */
const LenisCtx = createContext<Lenis | null>(null);
export const LenisProvider = LenisCtx.Provider;
export const useLenis = () => useContext(LenisCtx);

/* ------------------------------------------------------------------ */
/*  scroll progress                                                    */
/* ------------------------------------------------------------------ */
export type ProgressMode = "stick" | "through" | "enter";

/**
 * stick   — 0 -> 1 while an element taller than the viewport scrolls past
 * through — 0 when top enters bottom of vp, 1 when bottom leaves vp top
 * enter   — 0 -> 1 as element top travels from vp bottom to vp top
 */
export function useSectionProgress(
  ref: React.RefObject<HTMLElement | null>,
  mode: ProgressMode = "stick",
) {
  const [p, setP] = useState(0);
  useRaf(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    let v = 0;
    if (mode === "stick") {
      v = clamp(-r.top / Math.max(1, r.height - vh));
    } else if (mode === "through") {
      v = clamp((vh - r.top) / (vh + r.height));
    } else {
      v = clamp((vh - r.top) / vh);
    }
    setP((prev) => (Math.abs(prev - v) > 0.0005 ? v : prev));
  });
  return p;
}

/* ------------------------------------------------------------------ */
/*  in-view hook                                                       */
/* ------------------------------------------------------------------ */
export function useInView<T extends HTMLElement>(
  opts?: { threshold?: number; rootMargin?: string; once?: boolean },
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const once = opts?.once ?? true;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            if (once) ob.unobserve(el);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      {
        threshold: opts?.threshold ?? 0.2,
        rootMargin: opts?.rootMargin ?? "0px 0px -8% 0px",
      },
    );
    ob.observe(el);
    return () => ob.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ref, inView };
}

/* ------------------------------------------------------------------ */
/*  split text                                                         */
/* ------------------------------------------------------------------ */
export const countChars = (s: string) => s.replace(/\s/g, "").length;

/** Renders text split into word > char spans with --i char index custom prop */
export function Chars({
  text,
  startIndex = 0,
  className = "sp-char",
}: {
  text: string;
  startIndex?: number;
  className?: string;
}) {
  let i = startIndex;
  const words = text.split(" ");
  return (
    <>
      {words.map((word, wi) => (
        <React.Fragment key={wi}>
          <span className="sp-word">
            {word.split("").map((c, ci) => {
              const idx = i++;
              return (
                <span key={ci} className={className} style={{ ["--i" as string]: idx }}>
                  {c}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 && " "}
        </React.Fragment>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Reveal — chars cascade up when scrolled into view                   */
/* ------------------------------------------------------------------ */
export function Reveal({
  text,
  className = "",
  delay = 0,
  step = 22,
  once = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
  once?: boolean;
}) {
  const { ref, inView } = useInView<HTMLParagraphElement>({ once });
  return (
    <p
      ref={ref}
      className={`rv ${inView ? "-in" : ""} ${className}`}
      aria-label={text}
      style={{ "--rv-delay": `${delay}ms`, "--rv-step": `${step}ms` } as React.CSSProperties}
    >
      <Chars text={text} />
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Spotlight button                                                   */
/* ------------------------------------------------------------------ */
export function Button({
  children,
  variant = "",
  className = "",
  href,
  onClick,
  icon,
  small,
}: {
  children?: React.ReactNode;
  variant?: "" | "-red" | "-prime" | "-icon";
  className?: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  small?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty(
      "--glare-x",
      `${((e.clientX - r.left) / r.width) * 100}%`,
    );
    el.style.setProperty(
      "--glare-y",
      `${((e.clientY - r.top) / r.height) * 100}%`,
    );
  }, []);
  const cls = `button ${variant} ${small ? "-icon" : ""} ${className}`;
  const content = (
    <>
      <span className="glare" />
      {icon}
      {children}
    </>
  );
  if (href) {
    return (
      <a
        ref={ref}
        className={cls}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
        onMouseMove={onMove}
        data-cursor
      >
        {content}
      </a>
    );
  }
  return (
    <button ref={ref} className={cls} onClick={onClick} onMouseMove={onMove} data-cursor>
      {content}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  12-point star (signature polygon)                                  */
/* ------------------------------------------------------------------ */
export function Star12({
  className = "",
  stroke = "var(--c-grey-dark)",
  style,
}: {
  className?: string;
  stroke?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 8 8"
      preserveAspectRatio="none"
      className={className}
      style={style}
      aria-hidden
    >
      <polygon
        points="4 0 6 0.535898385 7.46410162 2 8 4 7.46410162 6 6 7.46410162 4 8 2 7.46410162 0.535898385 6 0 4 0.535898385 2 2 0.535898385"
        vectorEffect="non-scaling-stroke"
        fill="none"
        stroke={stroke}
        strokeWidth={1}
      />
    </svg>
  );
}

/* compass cross lines (8 directions) */
export function CompassLines({
  className = "",
  stroke = "var(--c-grey-dark)",
  style,
}: {
  className?: string;
  stroke?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 280 280"
      preserveAspectRatio="none"
      className={className}
      style={style}
      aria-hidden
    >
      <line x1="140" y1="0" x2="140" y2="280" vectorEffect="non-scaling-stroke" stroke={stroke} strokeWidth={1} />
      <line x1="239" y1="41" x2="41" y2="239" vectorEffect="non-scaling-stroke" stroke={stroke} strokeWidth={1} />
      <line x1="280" y1="140" x2="0" y2="140" vectorEffect="non-scaling-stroke" stroke={stroke} strokeWidth={1} />
      <line x1="239" y1="239" x2="41" y2="41" vectorEffect="non-scaling-stroke" stroke={stroke} strokeWidth={1} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  misc                                                               */
/* ------------------------------------------------------------------ */
export function useMedia(query: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const fn = () => setM(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [query]);
  return m;
}
