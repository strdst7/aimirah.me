import { useEffect, useRef, useState } from "react";
import { ChevronsLeftRight, MousePointer2 } from "lucide-react";
import type { Experiment } from "../lib/data";

interface Props {
  exp: Experiment;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** Full-screen pair: raw inspiration on the left, finished output clipped on
 *  the right, split by a draggable seam with a scripted intro tease. */
export default function ExperimentSection({ exp }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const clipRef = useRef<HTMLDivElement | null>(null);
  const dividerRef = useRef<HTMLDivElement | null>(null);

  // pos = seam position in % of panel width
  const pos = useRef(50);
  const target = useRef(50);
  const dragging = useRef(false);
  const teased = useRef(false);

  const [side, setSide] = useState<"in" | "out" | "mid">("mid");
  const [interacted, setInteracted] = useState(false);
  const [entered, setEntered] = useState(false);

  /** paint the seam without re-rendering react */
  const paint = () => {
    const p = pos.current;
    if (clipRef.current) {
      clipRef.current.style.clipPath = `inset(0 0 0 ${p}%)`;
    }
    if (dividerRef.current) {
      dividerRef.current.style.left = `${p}%`;
    }
  };

  /** smooth pursuit loop */
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const diff = target.current - pos.current;
      if (Math.abs(diff) > 0.01) {
        pos.current += diff * (dragging.current ? 0.35 : 0.09);
        paint();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    paint();
    return () => cancelAnimationFrame(raf);
  }, []);

  /** scripted tease the first time the panel enters */
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !teased.current) {
          teased.current = true;
          setEntered(true);
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches;
          if (reduce) {
            target.current = 50;
            pos.current = 50;
            paint();
            io.disconnect();
            return;
          }
          const start = performance.now();
          const KF = [
            { at: 0, v: 84 },
            { at: 950, v: 18 },
            { at: 2100, v: 62 },
            { at: 3000, v: 50 },
          ];
          const tease = (t: number) => {
            const el2 = t - start;
            let a = KF[0];
            let b = KF[KF.length - 1];
            for (let i = 0; i < KF.length - 1; i++) {
              if (el2 >= KF[i].at && el2 <= KF[i + 1].at) {
                a = KF[i];
                b = KF[i + 1];
                break;
              }
            }
            const span = Math.max(1, b.at - a.at);
            const lp = clamp((el2 - a.at) / span, 0, 1);
            const eased = 1 - Math.pow(1 - lp, 3);
            if (!dragging.current) {
              target.current = a.v + (b.v - a.v) * eased;
            }
            if (el2 < KF[KF.length - 1].at) {
              raf = requestAnimationFrame(tease);
            }
          };
          raf = requestAnimationFrame(tease);
          io.disconnect();
        }
      },
      { threshold: 0.45 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  /** label emphasis derived from seam side */
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = pos.current;
      const s = p > 56 ? "in" : p < 44 ? "out" : "mid";
      setSide((prev) => (prev === s ? prev : s));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const posFromClient = (clientX: number) => {
    const el = panelRef.current;
    if (!el) return 50;
    const rect = el.getBoundingClientRect();
    return clamp(((clientX - rect.left) / rect.width) * 100, 4, 96);
  };

  const onDragStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    setInteracted(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    target.current = posFromClient(e.clientX);
  };

  const onDragMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    target.current = posFromClient(e.clientX);
  };

  const onDragEnd = () => {
    dragging.current = false;
  };

  const onPanelTap = (e: React.PointerEvent) => {
    // gentle shift when tapping either half (mouse only; touch scrolls)
    if (e.pointerType === "touch") return;
    setInteracted(true);
    target.current = posFromClient(e.clientX);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setInteracted(true);
      target.current = clamp(target.current - 5, 4, 96);
    } else if (e.key === "ArrowRight") {
      setInteracted(true);
      target.current = clamp(target.current + 5, 4, 96);
    }
  };

  const pill = (state: "in" | "out") => {
    const active = side === state;
    return `pointer-events-none border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.22em] backdrop-blur-sm transition-all duration-300 md:text-[10px] ${
      active
        ? "border-bone bg-bone text-ink"
        : "border-bone/35 bg-ink/30 text-bone/70"
    }`;
  };

  return (
    <section id={exp.id} className="relative bg-ink py-8 first:pt-10 md:py-12">
      <div
        ref={panelRef}
        data-cursor="DRAG"
        onPointerDown={onPanelTap}
        className="no-select relative mx-3 h-[88svh] touch-pan-y overflow-hidden border border-bone/10 bg-coal md:mx-6 md:h-[100svh]"
      >
        {/* INSPIRATION — base layer */}
        <img
          src={exp.inspiration.img}
          alt={exp.inspiration.caption}
          draggable={false}
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            entered ? "scale-100" : "scale-[1.08]"
          }`}
        />
        <div className="vignette pointer-events-none absolute inset-0" />

        {/* OUTPUT — clipped layer */}
        <div
          ref={clipRef}
          className="absolute inset-0"
          style={{ clipPath: "inset(0 0 0 50%)" }}
        >
          <img
            src={exp.output.img}
            alt={exp.output.caption}
            draggable={false}
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              entered ? "scale-100" : "scale-[1.08]"
            }`}
          />
          <div className="vignette pointer-events-none absolute inset-0" />
        </div>

        {/* label pills */}
        <div className="absolute left-4 top-4 md:left-8 md:top-8">
          <div className={pill("in")}>
            Inspiration <span className="opacity-50">/ {exp.inspiration.code}</span>
          </div>
        </div>
        <div className="absolute right-4 top-4 md:right-8 md:top-8">
          <div className={pill("out")}>
            {exp.output.code} <span className="opacity-50">/</span> Output
          </div>
        </div>

        {/* captions under pills */}
        <div className="pointer-events-none absolute left-4 top-14 hidden font-mono text-[9px] uppercase tracking-[0.22em] text-bone/50 md:left-8 md:top-[4.4rem] md:block">
          {exp.inspiration.caption}
        </div>
        <div className="pointer-events-none absolute right-4 top-14 hidden text-right font-mono text-[9px] uppercase tracking-[0.22em] text-bone/50 md:right-8 md:top-[4.4rem] md:block">
          {exp.output.caption}
        </div>

        {/* seam */}
        <div
          ref={dividerRef}
          className="absolute bottom-0 top-0 z-10"
          style={{ left: "50%" }}
        >
          <div className="absolute bottom-0 top-0 w-px -translate-x-1/2 bg-bone/90 shadow-[0_0_18px_rgba(236,233,226,0.45)]" />
          <div
            role="slider"
            tabIndex={0}
            aria-label={`${exp.title} — comparison seam`}
            aria-valuemin={4}
            aria-valuemax={96}
            aria-valuenow={Math.round(target.current)}
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
            onKeyDown={onKey}
            className="absolute top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-full border border-bone/60 bg-ink/60 text-bone backdrop-blur-md transition-colors duration-200 hover:border-signal hover:text-signal focus:outline-none focus-visible:border-signal"
          >
            <ChevronsLeftRight size={18} strokeWidth={1.5} />
          </div>
        </div>

        {/* bottom meta — experiment identity */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4 md:p-8">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-signal">
              Nº {exp.index} — {exp.year}
            </p>
            <h3
              className="font-display leading-[0.92] text-bone drop-shadow-[0_2px_18px_rgba(0,0,0,0.7)]"
              style={{ fontSize: "clamp(2.1rem, 6vw, 5.5rem)" }}
            >
              {exp.title}
            </h3>
          </div>
          <ul className="hidden gap-2 sm:flex">
            {exp.tags.map((t) => (
              <li
                key={t}
                className="border border-bone/25 bg-ink/40 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-bone/70 backdrop-blur-sm"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* central drag hint until the user takes over */}
        <div
          className={`pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 transition-opacity duration-500 md:top-20 ${
            interacted ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex animate-drift items-center gap-2 border border-bone/25 bg-ink/50 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-bone/80 backdrop-blur-md">
            <MousePointer2 size={11} className="text-signal" />
            Drag the seam
          </div>
        </div>
      </div>
    </section>
  );
}
