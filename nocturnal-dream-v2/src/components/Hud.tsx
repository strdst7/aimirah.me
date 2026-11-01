import { forwardRef, useImperativeHandle, useRef } from "react";
import { CHAPTERS } from "../lib/scene";

/* Chrome of the dream: the wordmark up top-left, the maker's mark top-right,
   a sound key and a depth meter along the bottom. Everything updates through
   refs — the HUD breathes at 60fps without React ever re-rendering. */

export interface HudHandle {
  setDepthText(p: number): void;
  setChapterLabel(i: number): void;
  flash(): void;
}

interface Props {
  visible: boolean;
  soundOn: boolean;
  onToggleSound(): void;
  onRestart(): void;
  onBlip(): void;
}

const Hud = forwardRef<HudHandle, Props>(function Hud({ visible, soundOn, onToggleSound, onRestart, onBlip }, ref) {
  const depthRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const chapRef = useRef<HTMLSpanElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const wakeRef = useRef<HTMLDivElement>(null);
  const lastChap = useRef(-1);
  const lastP = useRef(0);

  useImperativeHandle(ref, () => ({
    setDepthText(p: number) {
      if (depthRef.current) {
        const v = String(Math.round(p * 100)).padStart(3, "0");
        if (depthRef.current.textContent !== v) depthRef.current.textContent = v;
      }
      if (barRef.current) barRef.current.style.transform = `scaleY(${p})`;
      // the film of the surface, crossed once in each direction
      const lp = lastP.current;
      if ((lp < 0.36 && p >= 0.36) || (lp >= 0.895 && p < 0.895)) flash();
      lastP.current = p;
      // wake card
      if (wakeRef.current) {
        const on = p > 0.965;
        wakeRef.current.style.opacity = on ? "1" : "0";
        wakeRef.current.style.pointerEvents = on ? "auto" : "none";
      }
    },
    setChapterLabel(i: number) {
      if (i !== lastChap.current && chapRef.current) {
        lastChap.current = i;
        chapRef.current.style.opacity = "0";
        setTimeout(() => {
          if (chapRef.current) {
            chapRef.current.textContent = `${String(i + 1).padStart(2, "0")} / ${String(CHAPTERS.length).padStart(2, "0")} — ${CHAPTERS[i].label}`;
            chapRef.current.style.opacity = "0.55";
          }
        }, 220);
      }
    },
    flash,
  }));

  function flash() {
    const el = flashRef.current;
    if (!el) return;
    el.animate(
      [{ opacity: 0 }, { opacity: 0.28, offset: 0.25 }, { opacity: 0 }],
      { duration: 700, easing: "ease-out" }
    );
  }

  return (
    <div
      className="fixed inset-0 z-[30]"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 1.4s ease 0.25s",
        pointerEvents: "none",
      }}
    >
      {/* waterline flash */}
      <div ref={flashRef} className="absolute inset-0 opacity-0" style={{ background: "#e9f4ef" }} />

      {/* wordmark */}
      <div className="absolute left-5 top-5 flex items-baseline gap-3 md:left-8 md:top-7">
        <span className="mz" style={{ fontSize: "calc(11px * var(--k))", color: "var(--bone-hi)", letterSpacing: "0.14em" }}>
          NOCTURNAL
        </span>
        <span className="mz hidden sm:inline" style={{ fontSize: "calc(9px * var(--k))", color: "var(--bone)", opacity: 0.45 }}>
          a lucid dream
        </span>
      </div>

      {/* the maker's mark — aimirah - kdmirah lab */}
      <div className="absolute right-5 top-5 text-right md:right-8 md:top-7" style={{ pointerEvents: "auto" }}>
        <a
          className="mz block"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onBlip();
          }}
          data-cursor="the makers"
          style={{ fontSize: "calc(9px * var(--k))", color: "var(--bone)", opacity: 0.5, lineHeight: 1.7, textDecoration: "none" }}
        >
          dreamt &amp; built by
          <br />
          <span style={{ color: "var(--bone-hi)", opacity: 1 }}>aimirah - kdmirah lab</span>
        </a>
      </div>

      {/* bottom-left: sound key */}
      <div className="absolute bottom-5 left-5 md:bottom-7 md:left-8" style={{ pointerEvents: "auto" }}>
        <button className="mz-btn" onClick={onToggleSound} data-cursor={soundOn ? "go quiet" : "wake the sound"} aria-pressed={soundOn}>
          <span className={`mz-key ${soundOn ? "fast" : ""}`}>
            <i></i>
            <b>{soundOn ? "ON" : "OFF"}</b>
          </span>
          <span>{soundOn ? "SOUND ON" : "SOUND OFF"}</span>
          <span style={{ opacity: 0.45 }}>[S]</span>
        </button>
      </div>

      {/* bottom-center: chapter label */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 md:bottom-7">
        <span
          ref={chapRef}
          className="mz whitespace-nowrap"
          style={{ fontSize: "calc(9px * var(--k))", color: "var(--bone)", opacity: 0.55, transition: "opacity .22s ease" }}
        />
      </div>

      {/* bottom-right: depth */}
      <div
        className="absolute bottom-5 right-5 flex items-center gap-3 md:bottom-7 md:right-8"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        <span className="mz" style={{ fontSize: "calc(9px * var(--k))", color: "var(--bone)", opacity: 0.5 }}>
          depth
        </span>
        <span ref={depthRef} className="mz" style={{ fontSize: "calc(9px * var(--k))", color: "var(--bone-hi)", width: "3ch" }}>
          000
        </span>
        <span className="mz" style={{ fontSize: "calc(9px * var(--k))", color: "var(--bone)", opacity: 0.5 }}>
          %
        </span>
        <div className="relative hidden h-8 w-px sm:block" style={{ background: "rgba(218,206,176,.16)" }}>
          <div
            ref={barRef}
            className="absolute bottom-0 left-0 h-full w-full"
            style={{ background: "var(--bone)", transform: "scaleY(0)", transformOrigin: "50% 100%" }}
          />
        </div>
      </div>

      {/* wake card — the way back */}
      <div
        ref={wakeRef}
        className="absolute inset-0 grid place-items-center opacity-0"
        style={{ transition: "opacity 1.1s ease 0.7s", pointerEvents: "none" }}
      >
        <div className="flex flex-col items-center gap-6" style={{ marginTop: "16vh" }}>
          <button className="mz-btn" onClick={onRestart} data-cursor="fall again" style={{ pointerEvents: "auto" }}>
            <span className="mz-key">
              <i></i>
              <b>R</b>
            </span>
            <span>DREAM AGAIN</span>
          </button>
          <p className="mz text-center" style={{ fontSize: "calc(9px * var(--k))", color: "var(--bone)", opacity: 0.5, lineHeight: 1.9 }}>
            nocturnal — a dream in one sitting
            <br />
            design / motion / sound — aimirah - kdmirah lab
          </p>
        </div>
      </div>
    </div>
  );
});

export default Hud;
