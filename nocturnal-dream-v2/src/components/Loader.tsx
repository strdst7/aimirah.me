import { useEffect, useRef, useState } from "react";

/* The room before the dream. Nine pale circles, one quiet line of advice,
   a counter climbing to one hundred, and then — the only question that
   matters: sound on, or sound off. */

const STEPS: Array<[number, string]> = [
  [0, "closing the blinds."],
  [16, "slowing your pulse."],
  [34, "gathering the moonlight."],
  [52, "teaching the water to hold still."],
  [68, "waking the crow, politely."],
  [84, "dimming every last thought."],
  [96, "almost under. don't wake up yet."],
];

interface Props {
  warm: Promise<void> | null; // resolves when the scene can draw
  onEnter(soundOn: boolean): void;
  onPreviewBlip(): void;
}

export default function Loader({ warm, onEnter, onPreviewBlip }: Props) {
  const [n, setN] = useState(0);
  const [ready, setReady] = useState(false);
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);
  const [step, setStep] = useState(STEPS[0][1]);
  const scaleRef = useRef<HTMLDivElement>(null);

  // scale the whole stage like a title card (the dream was composed at 1920)
  useEffect(() => {
    const f = () => {
      const s = Math.max(0.72, Math.min(1.35, window.innerWidth / 1920));
      scaleRef.current?.style.setProperty("--k", String(Math.max(0.8, Math.min(1.6, window.innerWidth / 1440))));
      scaleRef.current?.style.setProperty("--s", s.toFixed(3));
      document.documentElement.style.setProperty("--k", Math.max(0.8, Math.min(1.6, window.innerWidth / 1440)).toFixed(3));
    };
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  // the climb runs once; the warm promise only raises its ceiling
  const warmDone = useRef(false);
  useEffect(() => {
    let done = false;
    warm?.then(() => {
      if (!done) {
        warmDone.current = true;
      }
    });
    return () => {
      done = true;
    };
  }, [warm]);

  useEffect(() => {
    let v = 0;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      // hold at 90 until the scene beneath is truly warm
      const ceiling = warmDone.current ? 100 : 90;
      const gap = ceiling - v;
      v += Math.max(0.35, gap * 0.028) * (0.55 + Math.random());
      if (v >= 100) {
        v = 100;
        setN(100);
        setStep(STEPS[STEPS.length - 1][1]);
        setReady(true);
        return;
      }
      setN(Math.floor(v));
      for (const [at, label] of STEPS) if (v >= at) setStep(label);
      setTimeout(tick, 90 + Math.random() * 130);
    };
    const t = setTimeout(tick, 500);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  const choose = (on: boolean) => {
    if (out) return;
    onPreviewBlip();
    setOut(true);
    onEnter(on);
    setTimeout(() => setGone(true), 1500);
  };

  // keyboard: o = on, f/esc = off
  useEffect(() => {
    if (!ready) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "o" || e.key === "O" || e.key === "Enter") choose(true);
      if (e.key === "f" || e.key === "F" || e.key === "Escape") choose(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, out]);

  if (gone) return null;

  return (
    <div
      ref={scaleRef}
      id="ldr"
      className="fixed inset-0 z-[50] overflow-hidden"
      style={{
        background: out ? "transparent" : "#030302",
        opacity: out ? 0 : 1,
        transition: "opacity 1.3s ease, background 0.8s ease",
        pointerEvents: out ? "none" : "auto",
      }}
      aria-hidden={out}
    >
      {/* nine pale circles — a diagram of sleep */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: out ? 0 : 1, transition: "opacity 0.6s ease" }}
      >
        {[
          [540, 540],
          [1380, 540],
          [960, 540],
          [960, 960],
          [960, 120],
          [1257, 837],
          [663, 243],
          [663, 837],
          [1257, 243],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={539.75} />
        ))}
      </svg>

      {/* the line of advice */}
      <p
        className="mz ldr-in absolute left-1/2 -translate-x-1/2 text-center"
        style={{
          top: "calc(50% + 128px * var(--s))",
          width: "calc(280px * var(--s))",
          fontSize: "calc(10px * var(--s))",
          lineHeight: 1.7,
          color: "var(--bone)",
          opacity: out ? 0 : 0.6,
          transition: "opacity .45s ease",
          animationDelay: "0.7s",
        }}
      >
        close your eyes slowly.
        <br />
        {step} the dream is still loading.
      </p>

      {/* the choice, only once everything is warm */}
      <div
        className="absolute left-1/2 flex -translate-x-1/2 items-center"
        style={{
          top: "calc(50% + 262px * var(--s))",
          gap: "calc(12px * var(--k))",
          opacity: out ? 0 : 1,
          transition: "opacity .45s ease",
          visibility: ready ? "visible" : "hidden",
        }}
      >
        <button
          className={`mz-btn ${ready ? "pop-in" : "opacity-0"}`}
          onClick={() => choose(true)}
          data-cursor="with sound"
          autoFocus
        >
          <span className={`mz-key ${ready && !out ? "fast" : ""}`}>
            <i></i>
            <b>ON</b>
          </span>
          <span>SOUND ON</span>
        </button>
        <button
          className={`mz-btn ${ready ? "pop-in" : "opacity-0"}`}
          style={{ animationDelay: "0.12s" }}
          onClick={() => choose(false)}
          data-cursor="in silence"
        >
          <span className={`mz-key ${ready && !out ? "fast" : ""}`}>
            <i></i>
            <b>OFF</b>
          </span>
          <span>SOUND OFF</span>
        </button>
      </div>

      {/* the counter */}
      <p
        className="mz ldr-in absolute left-1/2 -translate-x-1/2 text-center tabular-nums"
        style={{
          bottom: "calc(22px * var(--s))",
          fontSize: "calc(10px * var(--s))",
          lineHeight: 1.7,
          color: "var(--bone)",
          opacity: out ? 0 : 0.6,
          transition: "opacity .45s ease",
          animationDelay: "0.9s",
        }}
      >
        {n}
      </p>

      {/* the bar */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: 2, background: "rgba(218,206,176,.12)", opacity: out ? 0 : 1, transition: "opacity .45s ease" }}
      >
        <i
          className="absolute inset-0 block"
          style={{
            background: "var(--bone)",
            transform: `scaleX(${n / 100})`,
            transformOrigin: "0 50%",
            transition: "transform .18s linear",
          }}
        />
      </div>
    </div>
  );
}
