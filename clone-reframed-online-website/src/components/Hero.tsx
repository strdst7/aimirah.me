import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";

interface Props {
  active: boolean;
}

const WORD = "kdmirah";
const GLYPHS = "kdmirahxz:/#%&0147";

function ScrambleLetter({
  char,
  delay,
  active,
}: {
  char: string;
  delay: number;
  active: boolean;
}) {
  const [display, setDisplay] = useState(char);
  const timerRef = useRef<number | null>(null);

  const scramble = useCallback(() => {
    if (timerRef.current) return;
    let ticks = 0;
    timerRef.current = window.setInterval(() => {
      ticks++;
      if (ticks > 7) {
        setDisplay(char);
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
      } else {
        setDisplay(GLYPHS[Math.floor(Math.random() * GLYPHS.length)]);
      }
    }, 45);
  }, [char]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    },
    []
  );

  return (
    <span
      className="inline-block overflow-hidden align-bottom"
      onMouseEnter={scramble}
      data-hover
    >
      <span
        className={`inline-block transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          char === "i" ? "text-signal" : ""
        }`}
        style={{
          transitionDelay: `${delay}ms`,
          transform: active ? "translateY(0)" : "translateY(112%)",
        }}
      >
        {display}
      </span>
    </span>
  );
}

export default function Hero({ active }: Props) {
  return (
    <header
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 pt-24 md:px-10"
    >
      {/* faint vertical rules */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-full w-px bg-bone/[0.045]" />
        <div className="absolute left-2/4 top-0 h-full w-px bg-bone/[0.045]" />
        <div className="absolute left-3/4 top-0 h-full w-px bg-bone/[0.045]" />
      </div>

      {/* top meta */}
      <div
        className={`relative flex items-start justify-between font-mono text-[10px] uppercase leading-relaxed tracking-[0.25em] text-smoke transition-all duration-700 ${
          active ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
        style={{ transitionDelay: "550ms" }}
      >
        <p>
          // A digital laboratory
          <br />
          for borrowed light
        </p>
        <p className="hidden text-center sm:block">
          Inspiration
          <span className="mx-2 text-signal">→</span>
          Output
        </p>
        <p className="text-right">
          Field study 004
          <br />
          <span className="text-bone/70">MMXXVI</span>
        </p>
      </div>

      {/* giant wordmark */}
      <div className="relative py-10">
        <h1
          className="no-select font-display leading-[0.86] tracking-[-0.01em] text-bone"
          style={{ fontSize: "clamp(3rem, 19vw, 22rem)" }}
          aria-label="kdmirah"
        >
          {WORD.split("").map((ch, i) => (
            <ScrambleLetter key={i} char={ch} delay={120 + i * 55} active={active} />
          ))}
        </h1>

        <div
          className={`mt-6 flex flex-col gap-6 transition-all delay-[900ms] duration-700 md:mt-8 md:flex-row md:items-end md:justify-between ${
            active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <p className="max-w-md font-sans text-sm leading-relaxed text-bone/75 md:text-base">
            We study the space between what we see and what we make — collecting
            raw sparks of the physical world and tracing how they mutate into
            finished pixels.
          </p>
          <ul className="grid grid-cols-2 gap-x-10 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em] text-smoke md:text-right">
            <li>Pairs — 004</li>
            <li>Seam — Draggable</li>
            <li>Mode — Dark Field</li>
            <li>Status — Ongoing</li>
          </ul>
        </div>
      </div>

      {/* bottom row */}
      <div
        className={`relative flex items-center justify-between pb-6 font-mono text-[10px] uppercase tracking-[0.25em] transition-all duration-700 ${
          active ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: "1200ms" }}
      >
        <span className="flex items-center gap-3 text-bone/80">
          Scroll to enter the lab
          <ArrowDown size={13} className="animate-bounce text-signal" />
        </span>
        <span className="hidden text-smoke sm:block">
          See / Compare / Repeat
        </span>
        <span className="text-smoke">
          <span className="text-signal">●</span> Live
        </span>
      </div>

      {/* oversized ghost text down the right edge */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 select-none lg:block ${
          active ? "opacity-100" : "opacity-0"
        } transition-opacity delay-[1400ms] duration-1000`}
      >
        <span
          className="text-outline-faint font-display"
          style={{
            writingMode: "vertical-rl",
            fontSize: "clamp(3rem, 7vw, 7rem)",
            letterSpacing: "0.06em",
          }}
        >
          LAB—004
        </span>
      </div>
    </header>
  );
}
