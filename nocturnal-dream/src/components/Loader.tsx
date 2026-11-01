import { useEffect, useRef, useState } from "react";
import { LOADER_TITLE, CREDIT } from "../lib/dream";
import { SND } from "../lib/sound";
import { Sticker, Logo } from "./Sticker";

// ------------------------------------------------------------------ the way in
// Nine hairline circles over the night, the title stuck on with tape, a line of instruction, a counter and a
// 2px bar. Nothing opens until the dream is warm AND you have said whether it makes a sound — then the title
// peels off and the loader burns away from every circle line at once, outwards, into the world behind it.

const CIRCLES: [number, number][] = [
  [540, 540],
  [1380, 540],
  [960, 540],
  [960, 960],
  [960, 120],
  [1257, 837],
  [663, 243],
  [663, 837],
  [1257, 243],
];
const CREAM = "#daceb0";
const BG = "#030302";

const lineDist = (x: number, y: number, W: number, H: number) => {
  const sc = Math.max(W / 1920, H / 1080);
  const dx = (x - W / 2) / sc + 960;
  const dy = (y - H / 2) / sc + 540;
  let best = 1e9;
  for (const [cx, cy] of CIRCLES) {
    const d = Math.abs(Math.hypot(dx - cx, dy - cy) - 540);
    if (d < best) best = d;
  }
  return best;
};
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const num = useRef<HTMLDivElement>(null);
  const outAt = useRef(0);
  const [ready, setReady] = useState(false);
  const [chosen, setChosen] = useState<boolean | null>(null);

  // ---- the counter: files and fonts first, then the warm-up pass, and only then it may reach 100
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    let shown = 0;
    let warm = 0;
    const tick = () => {
      const el = performance.now() - t0;
      // the fonts are worth waiting for (the graffiti handstyle especially), but never forever
      const loaded = el > 6500 || !document.fonts || document.fonts.status === "loaded";
      let p: number;
      if (outAt.current) p = 100;
      else if (loaded && el > 1100) {
        warm = Math.min(1, warm + 0.02);
        p = 62 + warm * 38;
      } else p = 15 * (1 - Math.exp(-el / 900)) + (loaded ? 30 : 0);
      shown += (p - shown) * 0.1;
      if (num.current) num.current.textContent = String(Math.floor(shown));
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, shown / 100)})`;
      if (shown > 99.4) setReady(true);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ---- let go when the dream is warm and the sound is decided
  useEffect(() => {
    if (ready && chosen === null) {
      const t = setTimeout(() => setChosen((c) => (c === null ? (SND.muted = true, false) : c)), 13000);
      return () => clearTimeout(t);
    }
  }, [ready, chosen]);

  useEffect(() => {
    if (ready && chosen !== null && !outAt.current) {
      root.current?.classList.add("out");
      SND.play("tape");
      setTimeout(() => (outAt.current = performance.now()), 720);
    }
  }, [ready, chosen]);

  // ---- the picture: night, the lattice of nine, then the burn that eats it from the lines outwards
  useEffect(() => {
    const c = cvs.current;
    if (!c) return;
    const ctx = c.getContext("2d", { alpha: true });
    if (!ctx) return;
    const hole = document.createElement("canvas");
    const glow = document.createElement("canvas");
    const hc = hole.getContext("2d")!;
    const gc = glow.getContext("2d")!;
    let W = 0;
    let H = 0;
    let seeds: { x: number; y: number; d: number; r: number }[] = [];
    let si = 0;

    const layout = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = innerWidth;
      H = innerHeight;
      for (const cv of [c, hole, glow]) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      for (const g of [ctx, hc, gc]) g.setTransform(dpr, 0, 0, dpr, 0, 0);
      seeds = [];
      const sc = Math.max(W / 1920, H / 1080);
      const gap = 34 * sc;
      for (let y = -gap; y < H + gap; y += gap) {
        for (let x = -gap; x < W + gap; x += gap) {
          const jx = x + (Math.random() - 0.5) * gap * 1.5;
          const jy = y + (Math.random() - 0.5) * gap * 1.5;
          const d = Math.pow(Math.min(1, lineDist(jx, jy, W, H) / (170 * sc)), 0.75) * 0.84;
          seeds.push({ x: jx, y: jy, d: d + Math.random() * 0.13, r: gap * (1.9 + Math.random() * 1.4) });
        }
      }
      seeds.sort((a, b) => a.d - b.d);
      si = 0;
    };
    layout();
    addEventListener("resize", layout);

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let started = 0;

    const burnPass = (k: number) => {
      const ease = k * k * (3 - 2 * k);
      const front = ease * 1.1;
      while (si < seeds.length && seeds[si].d <= front) {
        const s = seeds[si++];
        const grow = clamp01((front - s.d) * 7);
        const rr = s.r * (0.35 + grow * 2.7);
        const g = hc.createRadialGradient(s.x, s.y, 0, s.x, s.y, rr);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.68, "rgba(0,0,0,0.88)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        hc.fillStyle = g;
        hc.beginPath();
        hc.arc(s.x, s.y, rr, 0, Math.PI * 2);
        hc.fill();
        const gg = gc.createRadialGradient(s.x, s.y, rr * 0.5, s.x, s.y, rr * 1.2);
        gg.addColorStop(0, "rgba(253,244,223,0)");
        gg.addColorStop(0.6, `rgba(253,244,223,${0.14 * (1 - k * 0.6)})`);
        gg.addColorStop(1, "rgba(253,244,223,0)");
        gc.fillStyle = gg;
        gc.beginPath();
        gc.arc(s.x, s.y, rr * 1.2, 0, Math.PI * 2);
        gc.fill();
      }
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.9;
      ctx.drawImage(glow, 0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(hole, 0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    };

    const frame = () => {
      const now = performance.now();
      if (!started) started = now;
      const el = (now - started) / 1000;
      root.current?.classList.add("live");
      const dpr = Math.min(2, devicePixelRatio || 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);
      // the lattice of nine
      const sc = Math.max(W / 1920, H / 1080);
      for (let i = 0; i < CIRCLES.length; i++) {
        const [cx, cy] = CIRCLES[i];
        const x = (cx - 960) * sc + W / 2;
        const y = (cy - 540) * sc + H / 2;
        const pulse = 0.05 + 0.05 * Math.max(0, Math.sin(el * 0.7 + i * 1.7));
        ctx.strokeStyle = `rgba(218,206,176,${pulse})`;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.arc(x, y, 540 * sc, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(253,244,223,${0.09 + 0.09 * Math.sin(el + i)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 540 * sc, el * 0.5 + i, el * 0.5 + i + 0.55);
        ctx.stroke();
      }

      if (outAt.current) {
        const k = clamp01((now - outAt.current) / 1900 - 0);
        if (reduced) {
          const fade = clamp01((now - outAt.current) / 700);
          if (root.current) root.current.style.opacity = String(1 - fade);
          if (fade >= 1) {
            onDone();
            return;
          }
        } else {
          burnPass(k);
          if (k >= 1) {
            onDone();
            return;
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", layout);
    };
  }, [onDone]);

  const pick = (on: boolean) => {
    if (outAt.current) return;
    SND.setMuted(!on);
    setChosen(on);
  };

  return (
    <div ref={root} id="loader" className={ready ? "" : "u-fast"} style={{ background: ready ? "transparent" : BG }}>
      <canvas ref={cvs} className="absolute inset-0 block h-full w-full" />
      <div className="ldr-t ldr-top u-mono">nocturnal · a lucid dream in one page</div>
      {ready && (
        <div className="ldr-title">
          <Logo size={0.82} />
          <Sticker lines={LOADER_TITLE} size={0.6} show seed={2} style={{ marginTop: "calc(9px * var(--s))" }} />
        </div>
      )}
      <div className="ldr-t ldr-sub">
        {chosen === null
          ? ready
            ? "the dream is warm. choose your sound — it changes everything."
            : "close your eyes slowly. the dream is still loading, don't wake up yet."
          : chosen
            ? "good. the lake has a sound now."
            : "silence. the dream will have to whisper."}
      </div>
      <div className="ldr-t ldr-snd">
        <SndBtn label="sound on" k="on" active={chosen === true} onPick={() => pick(true)} />
        <SndBtn label="sound off" k="off" active={chosen === false} onPick={() => pick(false)} />
      </div>
      <div className="ldr-t ldr-n u-mono" ref={num} style={{ color: CREAM, opacity: 0.6 }}>
        0
      </div>
      <div className="ldr-t ldr-credit u-mono">
        code — {CREDIT}
        <br />
        paper &amp; ink · nine circles · one crow
      </div>
      <div className="ldr-bar">
        <i ref={bar as React.RefObject<HTMLSpanElement>} />
      </div>
    </div>
  );
}

function SndBtn({ label, k, active, onPick }: { label: string; k: string; active: boolean; onPick: () => void }) {
  return (
    <button className={`btn ${active ? "sel" : ""}`} onClick={onPick} type="button">
      <span className="key">
        <i />
        <b>{k}</b>
      </span>
      <span>{label}</span>
    </button>
  );
}
