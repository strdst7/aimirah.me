import { useEffect, useRef, useState } from "react";

interface Props {
  onDone: () => void;
}

const WORD = "kdmirah";

/** Loading shutter: staggered wordmark + eased percentage, then lifts away. */
export default function Preloader({ onDone }: Props) {
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const start = performance.now();
    const DURATION = 2000;
    let raf = 0;

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / DURATION);
      // eased with a couple of dramatic stalls
      const eased = 1 - Math.pow(1 - p, 2.4);
      setCount(Math.round(eased * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        setExiting(true);
        window.setTimeout(() => {
          setGone(true);
          onDone();
        }, 1000);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[110] flex flex-col justify-between bg-ink transition-transform duration-[950ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
        exiting ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* top meta row */}
      <div className="flex items-center justify-between px-5 pt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-smoke md:px-10 md:pt-8">
        <span>Digital Inspiration Lab</span>
        <span className="hidden sm:block">Field Study — 004</span>
        <span className="text-signal">Calibrating</span>
      </div>

      {/* centre wordmark */}
      <div className="flex flex-col items-center gap-6">
        <h1
          className="font-display leading-none tracking-tight text-bone"
          style={{ fontSize: "clamp(3rem, 15vw, 12rem)" }}
          aria-label="kdmirah"
        >
          {WORD.split("").map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <span
                className={`inline-block ${ch === "i" ? "text-signal" : ""}`}
                style={{
                  transform: "translateY(110%)",
                  animation: `preloader-letter 0.9s cubic-bezier(0.16,1,0.3,1) ${
                    0.12 + i * 0.055
                  }s forwards`,
                }}
              >
                {ch}
              </span>
            </span>
          ))}
        </h1>
        <style>{`@keyframes preloader-letter { to { transform: translateY(0); } }`}</style>
        <div className="h-px w-40 overflow-hidden bg-bone/15">
          <div
            className="h-full bg-signal transition-[width] duration-200 ease-linear"
            style={{ width: `${count}%` }}
          />
        </div>
      </div>

      {/* bottom counter */}
      <div className="flex items-end justify-between px-5 pb-5 md:px-10 md:pb-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-smoke">
          From spark / to pixel
        </span>
        <span
          className="font-display leading-none text-bone/90 tabular-nums"
          style={{ fontSize: "clamp(2.2rem, 6vw, 4.5rem)" }}
        >
          {String(count).padStart(3, "0")}
        </span>
      </div>
    </div>
  );
}
