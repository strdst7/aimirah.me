import { useEffect, useMemo, useRef, useState } from "react";
import {
  clamp,
  countChars,
  Chars,
  useMedia,
  useRaf,
  useSectionProgress,
} from "../lib/ui";
const cloudUrl = "/images/cloud.jpg";
const treeUrl = "/images/tree.webp";
const bamboo1 = "/images/bamboo-1.webp";
const bamboo2 = "/images/bamboo-2.webp";
const bamboo3 = "/images/bamboo-3.webp";
const bamboo4 = "/images/bamboo-4.webp";

/* ================================================================== */
/*  Falling maple leaves canvas                                        */
/* ================================================================== */
const LEAF_PALETTE = ["#e0392c", "#d52f25", "#c22924", "#e8553f", "#b31e1e", "#dd4837"];

function makeLeafSprite(color: string) {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const x = c.getContext("2d")!;
  x.translate(s / 2, s / 2 - 4);
  x.fillStyle = color;
  // fuller maple leaf — 5 lobes with rounded notches
  const pts: [number, number][] = [
    [0, -24], // top spike
    [4, -12],
    [16, -17], // upper-right spike
    [13, -6],
    [25, -5], // right spike
    [15, 3],
    [19, 12], // lower-right spike
    [7, 9],
    [4, 18], // bottom-right bump
    [1.5, 11],
    [0, 11],
    [-1.5, 11],
    [-4, 18], // bottom-left bump
    [-7, 9],
    [-19, 12], // lower-left spike
    [-15, 3],
    [-25, -5], // left spike
    [-13, -6],
    [-16, -17], // upper-left spike
    [-4, -12],
  ];
  x.beginPath();
  x.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [cx, cy] = pts[i];
    const [px, py] = pts[(i + 1) % pts.length];
    x.quadraticCurveTo(cx, cy, (cx + px) / 2, (cy + py) / 2);
  }
  x.closePath();
  x.fill();
  // soft inner shading
  const g = x.createRadialGradient(0, -6, 2, 0, -2, 26);
  g.addColorStop(0, "rgba(255,255,255,.16)");
  g.addColorStop(0.65, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(60,8,4,.22)");
  x.fillStyle = g;
  x.globalCompositeOperation = "source-atop";
  x.fillRect(-30, -30, 60, 60);
  // veins + stem
  x.globalCompositeOperation = "source-over";
  x.strokeStyle = "rgba(70,14,8,.4)";
  x.lineWidth = 1.4;
  x.beginPath();
  x.moveTo(0, -20);
  x.lineTo(0, 12);
  x.moveTo(0, -8);
  x.lineTo(12, -13);
  x.moveTo(0, -8);
  x.lineTo(-12, -13);
  x.moveTo(0, 1);
  x.lineTo(18, -2);
  x.moveTo(0, 1);
  x.lineTo(-18, -2);
  x.stroke();
  x.beginPath();
  x.moveTo(0, 10);
  x.lineTo(2.5, 27);
  x.stroke();
  return c;
}

type Leaf = {
  x: number;
  y: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  swayA: number;
  swayF: number;
  phase: number;
  sprite: number;
  kick: number;
};

function LeavesCanvas({
  front = false,
  gustRef,
}: {
  front?: boolean;
  gustRef: React.MutableRefObject<number>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const sprites = useMemo<HTMLCanvasElement[]>(() => [], []);
  const leaves = useRef<Leaf[]>([]);
  const dpr = useRef(1);

  useEffect(() => {
    LEAF_PALETTE.forEach((col, i) => (sprites[i] = makeLeafSprite(col)));
  }, [sprites]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const parent = cv.parentElement!;
    const resize = () => {
      dpr.current = Math.min(2, window.devicePixelRatio || 1);
      cv.width = parent.clientWidth * dpr.current;
      cv.height = parent.clientHeight * dpr.current;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const count = front ? 12 : 52;
    const make = (first: boolean): Leaf => {
      const vy = (front ? 78 : 52) + Math.random() * (front ? 70 : 62);
      return {
        x: Math.random() * (cv.clientWidth || 1200),
        // start just above the viewport — proportional to speed so the
        // whole flock is visible within ~1.5s, then recycles continuously
        y: first ? -vy * (0.2 + Math.random() * 1.3) : -20 - Math.random() * 80,
        vy,
        size: front ? 26 + Math.random() * 34 : 9 + Math.random() * 13,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 2.2,
        swayA: 14 + Math.random() * 40,
        swayF: 0.4 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        sprite: Math.floor(Math.random() * LEAF_PALETTE.length),
        kick: 0,
      };
    };
    leaves.current = Array.from({ length: count }, () => make(true));
    // keep mixing: respawn one leaf at a time
    const iv = window.setInterval(() => {
      const i = Math.floor(Math.random() * leaves.current.length);
      leaves.current[i] = make(false);
    }, front ? 900 : 480);
    return () => window.clearInterval(iv);
  }, [front]);

  useRaf((t) => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const d = dpr.current;
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    const dt = 1 / 60;
    const time = t / 1000;
    gustRef.current *= 0.965;
    const gust = gustRef.current;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (const l of leaves.current) {
      l.y += l.vy * dt * (1 + gust * 2.4);
      l.rot += l.vr * dt + gust * 0.05;
      const sway =
        Math.sin(time * l.swayF + l.phase) * (l.swayA + gust * 90) + gust * 30;
      const px = l.x + sway;
      if (l.y - l.size > H + 40) {
        l.y = -40 - Math.random() * H * 0.35;
        l.x = Math.random() * W;
      }
      const spr = sprites[l.sprite];
      if (!spr) continue;
      ctx.save();
      ctx.translate(px, l.y);
      ctx.rotate(l.rot);
      const sc = l.size / 32;
      ctx.scale(sc * (0.85 + Math.sin(time * l.swayF * 1.7 + l.phase) * 0.14), sc);
      ctx.translate(0, -32);
      ctx.drawImage(spr, -32, 0, 64, 64);
      ctx.restore();
    }
  });

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={front ? { filter: "blur(1.1rem)", zIndex: 30 } : undefined}
      aria-hidden
    />
  );
}

/* ================================================================== */
/*  Plucked string — wave equation + pointer pluck                     */
/* ================================================================== */
function StringImpulse({
  powerRef,
}: {
  powerRef: React.MutableRefObject<number>;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const N = 42;
  const ys = useMemo(() => new Float32Array(N), [N]);
  const vs = useMemo(() => new Float32Array(N), [N]);
  const pointer = useRef({ x: 0.5, y: 0.5, near: false, lastMove: 0 });
  const nextAuto = useRef(2.2);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onMove = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      const near = nx > -0.08 && nx < 1.08 && ny > 0 && ny < 1;
      pointer.current = { x: nx, y: ny, near, lastMove: performance.now() };
    };
    const onLeave = () => (pointer.current.near = false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useRaf((t) => {
    const path = pathRef.current;
    const glow = glowRef.current;
    if (!path || !glow) return;
    const p = pointer.current;
    const time = t / 1000;

    // pointer pluck: pull points toward the cursor when near the string
    if (p.near) {
      const sigma = 0.055;
      for (let i = 0; i < N; i++) {
        const x = i / (N - 1);
        const d = (x - p.x) / sigma;
        const w = Math.exp(-d * d);
        const target = (p.y - 0.5) * 1.15;
        vs[i] += (target - ys[i]) * w * 0.34;
      }
    } else if (time > nextAuto.current) {
      // idle auto pluck
      nextAuto.current = time + 4.2;
      const cx = 0.25 + Math.random() * 0.5;
      for (let i = 0; i < N; i++) {
        const x = i / (N - 1);
        const d = (x - cx) / 0.09;
        vs[i] += Math.exp(-d * d) * 0.065 * (Math.random() > 0.5 ? 1 : -1);
      }
    }

    // wave propagation
    const TENSION = 0.82;
    const FRICTION = 0.0735 / 10;
    let energy = 0;
    for (let i = 0; i < N; i++) {
      const l = ys[Math.max(0, i - 1)];
      const r = ys[Math.min(N - 1, i + 1)];
      const acc = TENSION * (l + r - 2 * ys[i]) - ys[i] * 0.012;
      vs[i] += acc;
      vs[i] *= 1 - FRICTION;
      ys[i] += vs[i] * 0.16;
      ys[i] = clamp(ys[i], -0.49, 0.49);
      const a = Math.abs(ys[i]);
      if (a > energy) energy = a;
    }
    ys[0] = ys[N - 1] = 0;

    powerRef.current = powerRef.current * 0.9 + energy * 1.6;

    // build smooth path
    let d = `M 0 0.5`;
    for (let i = 0; i < N - 1; i++) {
      const x1 = i / (N - 1);
      const x2 = (i + 1) / (N - 1);
      const xm = (x1 + x2) / 2;
      d += ` Q ${x1.toFixed(4)} ${(0.5 + ys[i]).toFixed(4)} ${xm.toFixed(4)} ${(
        0.5 +
        (ys[i] + ys[i + 1]) / 2
      ).toFixed(4)}`;
    }
    d += ` L 1 ${(0.5 + ys[N - 1]).toFixed(4)}`;
    path.setAttribute("d", d);
    glow.setAttribute("d", d);
    glow.style.opacity = String(clamp(energy * 3));
  });

  return (
    <div className="relative w-full" style={{ cursor: "crosshair" }} data-cursor>
      <svg
        ref={svgRef}
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        className="block w-full overflow-visible"
        style={{
          height: "clamp(140px, 30vh, 300px)",
          WebkitMaskImage:
            "linear-gradient(90deg, rgba(0,0,0,.35) 0, #000 50%, rgba(0,0,0,.35))",
          maskImage:
            "linear-gradient(90deg, rgba(0,0,0,.35) 0, #000 50%, rgba(0,0,0,.35))",
        }}
      >
        <path
          ref={glowRef}
          d="M 0 0.5 L 1 0.5"
          vectorEffect="non-scaling-stroke"
          fill="none"
          stroke="var(--c-red)"
          strokeWidth={5}
          opacity={0}
          style={{ filter: "blur(6px)" }}
        />
        <path
          ref={pathRef}
          d="M 0 0.5 L 1 0.5"
          vectorEffect="non-scaling-stroke"
          fill="none"
          stroke="var(--c-grey-dark)"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
}

/* ================================================================== */
/*  Headline char driven by scroll progress                            */
/* ================================================================== */
function FadeChars({
  text,
  p,
  from,
  span = 0.34,
  revealed,
  revealDelay = 0,
  className = "",
}: {
  text: string;
  p: number;
  from: number;
  span?: number;
  revealed: boolean;
  revealDelay?: number;
  className?: string;
}) {
  const n = countChars(text);
  return (
    <span className={`block whitespace-nowrap ${className}`} aria-label={text}>
      {(() => {
        let idx = 0;
        return text.split(" ").map((word, wi, arr) => (
          <span key={wi}>
            <span className="sp-word inline-block overflow-hidden pb-[.08em] -mb-[.08em] align-top">
              {word.split("").map((c, ci) => {
                const i = idx++;
                const out = clamp((p - from - (i / n) * span) / 0.22);
                const dir = i % 2 === 0 ? 1 : -1;
                return (
                  <span
                    key={ci}
                    className="sp-char"
                    style={{
                      opacity: (revealed ? 1 : 0) * (1 - out),
                      transform: revealed
                        ? `translateY(${(-out * 0.55 * dir).toFixed(3)}em) scale(${1 - out * 0.08})`
                        : "translateY(1.1em)",
                      filter: out > 0.02 ? `blur(${(out * 6).toFixed(1)}px)` : undefined,
                      transition: revealed
                        ? "transform .65s var(--f-cubic), opacity .5s linear"
                        : `transform 1s var(--f-cubic) ${revealDelay + i * 34}ms, opacity 1s var(--f-cubic) ${revealDelay + i * 34}ms`,
                    }}
                  >
                    {c}
                  </span>
                );
              })}
            </span>
            {wi < arr.length - 1 && " "}
          </span>
        ));
      })()}
    </span>
  );
}

/* ================================================================== */
/*  Hero — c-tree                                                      */
/* ================================================================== */
const BAMBOO = [
  { src: bamboo1, rot: -2, riseF: 48, z: 20, scale: 1, x: "-2%" },
  { src: bamboo2, rot: -8, riseF: 60, z: 10, scale: 0.8, x: "26%" },
  { src: bamboo3, rot: 0, riseF: 40, z: 10, scale: 0.85, x: "54%" },
  { src: bamboo4, rot: 10, riseF: 55, z: 5, scale: 0.75, x: "80%" },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const compRef = useRef<HTMLDivElement>(null);
  const bambooRef = useRef<HTMLDivElement>(null);
  const treeWrapRef = useRef<HTMLDivElement>(null);
  const p = useSectionProgress(sectionRef, "stick");
  const isDesktop = useMedia("(min-width: 1024px)");
  const powerRef = useRef(0);
  const gustRef = useRef(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 350);
    return () => clearTimeout(t);
  }, []);

  // string power -> bamboo push-rotation + leaf gusts
  useRaf(() => {
    const pw = powerRef.current;
    if (bambooRef.current) {
      bambooRef.current.style.setProperty(
        "--push-rotation",
        (pw * 9).toFixed(3),
      );
    }
    gustRef.current = Math.max(gustRef.current, Math.min(1, pw * 0.55));
  });

  // composition parallax rise driven by global hero progress
  useRaf(() => {
    const rp = clamp((p - 0.28) / 0.42);
    const tree = treeWrapRef.current;
    if (tree) {
      tree.style.transform = `translate3d(0, ${((1 - rp) * 16).toFixed(2)}vh, 0)`;
    }
    const bamboo = bambooRef.current;
    if (bamboo) {
      bamboo.style.setProperty("--rise", (1 - rp).toFixed(3));
    }
  });

  return (
    <section
      id="c-tree"
      ref={sectionRef}
      className="relative"
      style={{
        background: "var(--c-grey)",
        borderBottom: "var(--g-gap) solid var(--c-black)",
        contain: "paint",
      }}
    >
      {/* sticky sky: clouds + leaves */}
      <div className="pointer-events-none sticky top-0 z-0 h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-bottom bg-no-repeat"
          style={{
            backgroundImage: `url(${cloudUrl})`,
            backgroundSize: "115% auto",
            backgroundPosition: "50% 108%",
            opacity: 0.9,
          }}
        />
        <LeavesCanvas gustRef={gustRef} />
        {/* soft vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(230,223,228,.5), transparent 22%, transparent 70%, rgba(230,223,228,.4))",
          }}
        />
      </div>

      {/* sticky headline */}
      <div className="pointer-events-none sticky top-0 z-20 -mt-[100vh] grid h-screen place-items-center">
        <h2
          className="sans w text-center text-[var(--c-black)]"
          style={{ fontSize: "min(var(--h0), 14.5vw)", lineHeight: 0.95 }}
        >
          <FadeChars
            text="Take it…"
            p={p}
            from={0.05}
            revealed={revealed}
            revealDelay={100}
          />
          <FadeChars
            text="And listen…"
            p={p}
            from={0.22}
            revealed={revealed}
            revealDelay={500}
            className="lg:ml-[9%]"
          />
        </h2>
      </div>

      {/* composition: tree, bamboo, string */}
      <div
        ref={compRef}
        className="relative isolate"
        style={{
          marginTop: isDesktop ? "75vh" : "55vh",
          minHeight: "120vh",
          zIndex: 10,
        }}
      >
        {/* tree */}
        <div
          ref={treeWrapRef}
          className="pointer-events-none absolute bottom-[-4vh] right-[-6%] z-[5] will-change-transform lg:right-[-3%]"
        >
          <img
            src={treeUrl}
            alt=""
            width={1500}
            height={1409}
            decoding="async"
            fetchPriority="high"
            className="h-[46vh] w-auto lg:h-[64vh]"
            style={{ transform: "scaleX(-1)", mixBlendMode: "multiply" }}
            draggable={false}
          />
        </div>

        {/* bamboo cluster */}
        <div
          ref={bambooRef}
          className="pointer-events-none absolute bottom-[4vh] left-[6%] z-[6] hidden h-[58vh] w-[24vw] max-w-[24rem] md:block lg:left-[12%]"
          style={{ ["--push-rotation" as string]: 0, ["--rise" as string]: 1 }}
        >
          {BAMBOO.map((b, i) => (
            <img
              key={i}
              src={b.src}
              alt=""
              width={560}
              height={2000}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="absolute bottom-0 h-full w-auto will-change-transform"
              style={{
                zIndex: b.z,
                left: b.x,
                transformOrigin: "50% 100%",
                scale: String(b.scale),
                mixBlendMode: "multiply",
                transform: `translateY(calc(var(--rise) * ${b.riseF}vh)) rotate(calc(${b.rot}deg + var(--push-rotation) * 0.25deg))`,
              }}
            />
          ))}
        </div>

        {/* string + statement */}
        <div className="relative z-[10] mx-auto w-full max-w-none px-[var(--g-margin)] pt-[12vh]">
          <p
            className="sans mx-auto max-w-[19em] text-center text-[var(--c-black)] fsi-h3 lg:max-w-none"
            style={{ lineHeight: "var(--h3-lh)" }}
          >
            <span className="block">
              <Chars text="Animate with Elegance," />
            </span>
            <span className="block" style={{ color: "var(--c-red)" }}>
              <Chars text="Not Overhead." />
            </span>
          </p>
          <div className="mx-auto mt-[1.5vh] w-full max-w-[110rem]">
            <StringImpulse powerRef={powerRef} />
          </div>
          <p
            className="mt-[1rem] flex items-center justify-center gap-[.5rem] text-center up fsi-mm"
            style={{ color: "var(--c-grey-dark)" }}
          >
            <span
              className="inline-block h-[.45rem] w-[.45rem] rounded-full bg-[var(--c-red)]"
              style={{ animation: "pulseDot 2.4s infinite" }}
            />
            Grab the string
          </p>
        </div>

        {/* front blurred leaves */}
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <LeavesCanvas front gustRef={gustRef} />
        </div>
      </div>
    </section>
  );
}
