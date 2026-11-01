import { D, MODULES, SCENES, clamp, fbm, lerp, nz, sceneAlpha, smoothstep, type Mod } from "./dream";

// ------------------------------------------------------------------ a dream, painted in paper and ink
// The reference world is 3D with a "paper & ink" print pass over it. Here the same art direction is painted
// straight onto a 2D canvas: sun-bleached paper, flat ink silhouettes, hairline ripples, one wet highlight per
// object — plus the printer out of register (ghost copies during a scene change).

type RGB = [number, number, number];
const cache = new Map<string, RGB>();
/** accepts both #rrggbb and the rgb() strings this file produces, so a tone can be mixed again and again */
const rgb = (h: string): RGB => {
  const c = cache.get(h);
  if (c) return c;
  let n: RGB;
  if (h.charCodeAt(0) === 35) {
    const v = h.slice(1);
    n = [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
  } else {
    const m = h.match(/\d+(?:\.\d+)?/g) || ["0", "0", "0"];
    n = [+m[0], +m[1], +m[2]];
  }
  if (Number.isNaN(n[0])) n = [0, 0, 0];
  if (cache.size < 4000) cache.set(h, n);
  return n;
};
const mix = (a: string, b: string, t: number) => {
  const x = rgb(a);
  const y = rgb(b);
  return `rgb(${(x[0] + (y[0] - x[0]) * t) | 0},${(x[1] + (y[1] - x[1]) * t) | 0},${(x[2] + (y[2] - x[2]) * t) | 0})`;
};
const rgba = (h: string, a: number) => {
  const x = rgb(h);
  return `rgba(${x[0]},${x[1]},${x[2]},${a})`;
};

const PAPER = "#ded4b8";
const PAPER_HI = "#efe7d1";
const PAPER_LO = "#a89f88";
const INK = "#0d0c0a";
const WARM = "#ffd9a0";
const NIGHT = "#07070a";

interface Tone {
  sky: string;
  sky2: string;
  hill: string;
  ground: string;
  ink: number; // silhouette strength
  glow: string;
}
const TONES: Tone[] = [
  { sky: PAPER_HI, sky2: PAPER, hill: "#b3aa93", ground: "#cdc3a6", ink: 1, glow: "#fff3d6" }, // lake
  { sky: "#e7dfc7", sky2: "#c9bfa4", hill: "#a49b85", ground: "#c2b89c", ink: 1, glow: "#fff6e2" }, // pier
  { sky: "#9c957f", sky2: "#6d6957", hill: "#5c584a", ground: "#4a4639", ink: 1, glow: WARM }, // church
  { sky: "#3a3629", sky2: "#211f17", hill: "#191712", ground: "#0f0e0b", ink: 1, glow: "#ffcf8a" }, // keyhole
  { sky: "#b7ad92", sky2: "#8e8770", hill: "#6e6958", ground: "#575344", ink: 1, glow: "#ffe6bd" }, // street
  { sky: "#26241c", sky2: "#141310", hill: "#0e0d0b", ground: "#080806", ink: 0.9, glow: "#e8f4ff" }, // portal
  { sky: "#d8cfb6", sky2: "#b9b19a", hill: "#9b9480", ground: "#87816e", ink: 0.8, glow: "#fff8e6" }, // ascent
  { sky: "#06080c", sky2: "#020306", hill: "#0a0c11", ground: "#04050a", ink: 0.7, glow: "#9fc8ff" }, // orbit
];
const toneAt = (s: number): Tone => {
  const i = clamp(Math.floor(s), 0, TONES.length - 1);
  const j = clamp(i + 1, 0, TONES.length - 1);
  const t = clamp(s - i);
  const a = TONES[i];
  const b = TONES[j];
  return {
    sky: mix(a.sky, b.sky, t),
    sky2: mix(a.sky2, b.sky2, t),
    hill: mix(a.hill, b.hill, t),
    ground: mix(a.ground, b.ground, t),
    glow: mix(a.glow, b.glow, t),
    ink: lerp(a.ink, b.ink, t),
  };
};

// ------------------------------------------------------------------ pieces of the world
function ridges(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  baseY: number,
  o: { amp: number; freq: number; seed: number; color: string; alpha: number; shift: number },
) {
  ctx.save();
  ctx.globalAlpha = o.alpha;
  ctx.fillStyle = o.color;
  ctx.beginPath();
  ctx.moveTo(-8, h + 8);
  const step = Math.max(6, w / 150);
  for (let x = -8; x <= w + step; x += step) {
    const u = (x + o.shift) / w;
    const n =
      fbm(u * o.freq + o.seed, o.seed * 1.7, 4) * 0.75 +
      Math.pow(fbm(u * o.freq * 2.3 + o.seed * 3, 9, 3), 1.6) * 0.5;
    ctx.lineTo(x, baseY - n * o.amp);
  }
  ctx.lineTo(w + 8, h + 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function ripples(ctx: CanvasRenderingContext2D, w: number, h: number, y0: number, y1: number, t: number, col: string, dens = 4) {
  ctx.save();
  ctx.lineWidth = Math.max(0.6, h / 1400);
  for (let y = y0; y < y1; y += dens) {
    const k = (y - y0) / Math.max(1, y1 - y0);
    const amp = lerp(0.6, 6.5, k * k) * (h / 900);
    const a = (0.05 + 0.4 * Math.pow(1 - k, 1.6)) * (0.55 + 0.45 * Math.sin(y * 0.6 + t * 1.4));
    ctx.strokeStyle = rgba(col, clamp(a, 0, 0.5));
    ctx.beginPath();
    const step = Math.max(16, w / 46);
    let first = true;
    for (let x = -20; x <= w + step; x += step) {
      const ph = nz(Math.floor(x / step + y * 0.03), Math.floor(t * 6 + y * 0.09)) * 2 - 1;
      const yy = y + ph * amp;
      if (first) {
        ctx.moveTo(x, yy);
        first = false;
      } else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function hatch(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, gap: number, col: string, a = 0.2, ang = -0.34) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = rgba(col, a);
  ctx.lineWidth = Math.max(0.5, gap * 0.14);
  const d = Math.hypot(w, h);
  const cx = x + w / 2;
  const cy = y + h / 2;
  for (let i = -d; i < d; i += gap) {
    ctx.beginPath();
    ctx.moveTo(cx + i * Math.cos(ang) - d * Math.sin(ang), cy + i * Math.sin(ang) + d * Math.cos(ang));
    ctx.lineTo(cx + i * Math.cos(ang) + d * Math.sin(ang), cy + i * Math.sin(ang) - d * Math.cos(ang));
    ctx.stroke();
  }
  ctx.restore();
}

/** the crow: built from flat shapes so it reads as one cut-out silhouette */
function crowPath(ctx: CanvasRenderingContext2D, s: number, flap: number, hx: number, hy: number) {
  const hr = s * 0.155;
  const cx = s * 0.3 + hx * s * 0.045;
  const cy = -s * 0.44 + hy * s * 0.03;
  // body
  ctx.beginPath();
  ctx.moveTo(-s * 0.62, -s * 0.3);
  ctx.bezierCurveTo(-s * 0.34, -s * 0.6, s * 0.14, -s * 0.62, s * 0.34, -s * 0.4);
  ctx.bezierCurveTo(s * 0.42, -s * 0.2, s * 0.24, -s * 0.02, -s * 0.06, 0);
  ctx.bezierCurveTo(-s * 0.34, 0.01 * s, -s * 0.55, -s * 0.14, -s * 0.62, -s * 0.3);
  ctx.closePath();
  ctx.fill();
  // tail
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, -s * 0.36);
  ctx.lineTo(-s * 0.98, -s * 0.2);
  ctx.lineTo(-s * 0.94, -s * 0.02);
  ctx.lineTo(-s * 0.42, -s * 0.12);
  ctx.closePath();
  ctx.fill();
  // wing (lifts when it settles)
  ctx.beginPath();
  ctx.moveTo(-s * 0.26, -s * 0.42);
  ctx.bezierCurveTo(-s * 0.02, -s * (0.6 + flap * 0.22), s * 0.26, -s * (0.5 + flap * 0.1), s * 0.3, -s * 0.32);
  ctx.bezierCurveTo(s * 0.1, -s * 0.24, -s * 0.12, -s * 0.26, -s * 0.26, -s * 0.42);
  ctx.closePath();
  ctx.fill();
  // head + beak
  ctx.beginPath();
  ctx.ellipse(cx, cy, hr * 1.02, hr * 0.92, hx * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + hr * 0.7, cy - hr * 0.24);
  ctx.lineTo(cx + hr * (1.95 + hx * 0.12), cy + hr * (0.16 + hy * 0.1));
  ctx.lineTo(cx + hr * 0.72, cy + hr * 0.56);
  ctx.closePath();
  ctx.fill();
  // legs
  ctx.lineWidth = Math.max(1, s * 0.022);
  ctx.strokeStyle = ctx.fillStyle as string;
  for (const dx of [-s * 0.08, s * 0.06]) {
    ctx.beginPath();
    ctx.moveTo(dx, -s * 0.04);
    ctx.lineTo(dx * 1.2, s * 0.14);
    ctx.moveTo(dx * 1.2, s * 0.14);
    ctx.lineTo(dx * 1.2 + s * 0.07, s * 0.16);
    ctx.stroke();
  }
  return { cx, cy, hr };
}

function crow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  t: number,
  inkCol: string,
  o: { look?: [number, number]; flap?: number; reflect?: () => void } = {},
) {
  const look = o.look ?? [0, 0];
  const flap = o.flap ?? 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = inkCol;
  const breathe = 1 + Math.sin(t * 1.1) * 0.006;
  ctx.save();
  ctx.scale(1, breathe);
  const head = crowPath(ctx, s, flap, look[0], look[1]);
  // the one bright eye
  ctx.fillStyle = PAPER_HI;
  ctx.beginPath();
  ctx.arc(head.cx + s * 0.035, head.cy - s * 0.02, s * 0.032, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba("#9fd7ff", 0.55);
  ctx.beginPath();
  ctx.arc(head.cx + s * 0.035, head.cy - s * 0.02, s * 0.052, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  o.reflect?.();
  ctx.restore();
}

function reeds(ctx: CanvasRenderingContext2D, w: number, h: number, y: number, t: number, col: string, n: number, k: number) {
  ctx.save();
  ctx.strokeStyle = col;
  ctx.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const u = nz(i * 12.9) * w;
    const hgt = (0.06 + nz(i * 3.1) * 0.2) * h * k;
    const swayBase = nz(i * 5.7, Math.floor(t * 0.55)) * 2 - 1;
    const sway = swayBase * hgt * 0.24 * (0.4 + D.flow);
    const a = 0.35 + nz(i * 7.3) * 0.5;
    ctx.globalAlpha = a * (0.75 - nz(i * 2.2) * 0.4);
    ctx.lineWidth = Math.max(0.7, h / 900) * (0.7 + nz(i * 9.1));
    ctx.beginPath();
    ctx.moveTo(u, y + nz(i * 4.4) * h * 0.06);
    ctx.quadraticCurveTo(u + sway * 0.4, y - hgt * 0.6, u + sway, y - hgt);
    ctx.stroke();
    if (nz(i * 8.8) > 0.62) {
      // a seed head
      ctx.beginPath();
      ctx.ellipse(u + sway, y - hgt - hgt * 0.09, hgt * 0.02, hgt * 0.1, sway * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function tower(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, t: number, col: string, accent: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = col;
  ctx.lineWidth = s * 0.035;
  // legs
  for (const [a, b] of [
    [-0.5, -0.28],
    [0.5, 0.28],
    [-0.3, 0.16],
    [0.3, -0.16],
  ]) {
    ctx.beginPath();
    ctx.moveTo(a * s, 0);
    ctx.lineTo(b * s, -s * 1.05);
    ctx.stroke();
  }
  for (let i = 1; i <= 4; i++) {
    const yy = -s * (0.2 * i);
    ctx.beginPath();
    ctx.moveTo(-s * (0.5 - i * 0.04), yy);
    ctx.lineTo(s * (0.5 - i * 0.04), yy - s * 0.1);
    ctx.stroke();
  }
  // tank
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.rect(-s * 0.42, -s * 1.5, s * 0.84, s * 0.46);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-s * 0.52, -s * 1.5);
  ctx.lineTo(0, -s * 1.84);
  ctx.lineTo(s * 0.52, -s * 1.5);
  ctx.closePath();
  ctx.fill();
  // the face it has in the dream
  const blink = nz(Math.floor(t * 0.5) * 3.7) > 0.86 ? 0.12 : 1;
  ctx.fillStyle = accent;
  for (const dx of [-0.18, 0.16]) {
    ctx.beginPath();
    ctx.ellipse(s * dx, -s * 1.3, s * 0.075, s * 0.085 * blink, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.ellipse(s * -0.01, -s * 1.13, s * 0.06, s * 0.075, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.ellipse(s * -0.02, -s * 1.3, s * 0.028, s * 0.04 * blink, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function newspaper(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number, col: string, accent: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(-s, 0);
  ctx.quadraticCurveTo(-s * 0.2, -s * 0.5, s, -s * 0.08);
  ctx.lineTo(s * 0.9, s * 0.42);
  ctx.quadraticCurveTo(-s * 0.1, s * 0.0, -s * 0.94, s * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rgba(col, 0.7);
  ctx.lineWidth = Math.max(0.6, s * 0.045);
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.72 + i * s * 0.05, s * 0.02 - i * s * 0.055);
    ctx.lineTo(s * 0.62 - i * s * 0.03, -s * 0.02 - i * s * 0.055);
    ctx.stroke();
  }
  ctx.restore();
}

function archWindows(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, n: number, glow: string, t: number) {
  ctx.save();
  for (let i = 0; i < n; i++) {
    const fx = x + (i + 0.5) * (w / n) - w * 0.02;
    const f = 0.55 + 0.45 * Math.sin(t * (0.6 + i * 0.17) + i);
    ctx.fillStyle = rgba(glow, 0.28 + f * 0.45);
    ctx.beginPath();
    ctx.moveTo(fx, y + h);
    ctx.lineTo(fx, y + h * 0.3);
    ctx.arc(fx + w * 0.02, y + h * 0.3, w * 0.02, Math.PI, 0);
    ctx.lineTo(fx + w * 0.04, y + h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ the scenes
interface Draw {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  t: number;
  L: number; // local progress in the scene
  a: number; // alpha of this scene
  px: number;
  py: number;
  tone: Tone;
  hot: (m: Mod) => number; // 0..1 "you are close to a hidden module"
}

const S = (n: number, h: number) => (n * h) / 1080; // design-space size → screen

function dLake(o: Draw) {
  const { ctx, w, h, t, L, px, py, tone } = o;
  const hz = h * (0.46 + L * 0.06) + py * S(12, h);
  // water
  ctx.fillStyle = mix(tone.sky2, PAPER, 0.35);
  ctx.fillRect(0, hz, w, h - hz);
  // hills + far shore
  ridges(ctx, w, h, hz, { amp: S(190, h), freq: 3.1, seed: 2.4, color: tone.hill, alpha: 0.5, shift: px * S(24, h) });
  ridges(ctx, w, h, hz + S(14, h), { amp: S(120, h), freq: 5.2, seed: 7.1, color: mix(tone.hill, INK, 0.35), alpha: 0.75, shift: px * S(40, h) });
  // the water tower with its face, on the left hill
  tower(ctx, w * (0.19 - px * 0.01), hz - S(50, h), S(72, h), t, mix(tone.hill, INK, 0.25), PAPER_HI);
  // ripples + reflection band
  ripples(ctx, w, h, hz + S(16, h), h, t, mix(INK, PAPER_HI, 0.5), Math.max(5, S(10, h)));
  ctx.save();
  ctx.globalAlpha = 0.5;
  ripples(ctx, w, h, hz + S(6, h), hz + S(120, h), t * 1.6, PAPER_HI, Math.max(6, S(12, h)));
  ctx.restore();
  // floating papers
  for (let i = 0; i < 4; i++) {
    const u = ((nz(i * 3.3) + t * 0.006 * (1 + i * 0.2) + L * 0.1) % 1.2) * w;
    const y = hz + S(60 + i * 46, h) + Math.sin(t * 0.8 + i) * S(4, h);
    newspaper(ctx, u, y, S(28 + i * 6, h), -0.25 + nz(i * 9) * 0.5, INK, PAPER_HI);
  }
  // the crow, and its reflection cut by ripples
  const cs = S(150, h) * (1 + L * 0.22);
  const cy = h * (0.7 + L * 0.03) + py * S(10, h);
  const cx = w * 0.5 + px * S(20, h);
  crow(ctx, cx, cy, cs, t, INK, {
    look: [clamp(px * 1.6, -1, 1), clamp(py * 1.2, -1, 1)],
    flap: Math.max(0, Math.sin(t * 0.31) - 0.96) * 8,
    reflect: () => {
      ctx.save();
      ctx.globalAlpha = 0.26;
      ctx.fillStyle = INK;
      ctx.translate(0, cs * 0.16);
      ctx.scale(1, -0.52);
      crowPath(ctx, cs, 0, 0, 0);
      ctx.restore();
      // the surface cuts it up again
      ctx.save();
      ctx.fillStyle = mix(tone.sky2, PAPER, 0.35);
      for (let i = 0; i < 8; i++) {
        const yy = cy + cs * 0.18 + i * S(8.5, h);
        ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 1.5 + i * 1.3);
        ctx.fillRect(cx - cs * 1.1, yy + Math.sin(t * 1.6 + i) * S(2, h), cs * 2.2, S(2.6, h));
      }
      ctx.restore();
    },
  });
  reeds(ctx, w, h, h * 0.86, t, rgba(INK, 0.85), 120, 1.1);
  reeds(ctx, w, h, h * 0.99, t * 1.2, rgba(INK, 1), 70, 1.7);
}

function dPier(o: Draw) {
  const { ctx, w, h, t, L, px, py, tone } = o;
  const hz = h * (0.4 - L * 0.04) + py * S(10, h);
  ctx.fillStyle = mix(tone.sky2, PAPER, 0.2);
  ctx.fillRect(0, hz, w, h - hz);
  ridges(ctx, w, h, hz, { amp: S(150, h), freq: 2.4, seed: 5.5, color: tone.hill, alpha: 0.4, shift: px * S(30, h) });
  ripples(ctx, w, h, hz, h, t, mix(INK, PAPER_HI, 0.45), Math.max(6, S(11, h)));
  // the pier: planks running into the water
  ctx.save();
  ctx.fillStyle = INK;
  const py0 = h * (0.72 + L * 0.05);
  ctx.beginPath();
  ctx.moveTo(w * 0.06, h);
  ctx.lineTo(w * 0.3, py0);
  ctx.lineTo(w * 0.72, py0 + S(6, h));
  ctx.lineTo(w * 0.99, h + S(4, h));
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rgba(PAPER_HI, 0.14);
  ctx.lineWidth = S(1.4, h);
  for (let i = 0; i < 16; i++) {
    const k = i / 15;
    ctx.beginPath();
    ctx.moveTo(lerp(w * 0.3, w * 0.06, k), py0 + (h - py0) * k);
    ctx.lineTo(lerp(w * 0.72, w * 0.99, k), py0 + S(6, h) + (h - py0) * k);
    ctx.stroke();
  }
  ctx.restore();
  // crow close up, shaking out its wings
  const cs = S(300, h) * (1 + L * 0.1);
  const flap = smoothstep(0.55, 0.72, L) * Math.max(0, Math.sin(t * 2.1)) * 0.5;
  crow(ctx, w * (0.56 + px * 0.02), h * (0.7 + L * 0.03) + py * S(8, h), cs, t, INK, {
    look: [clamp(-px * 2, -1, 1), clamp(-py, -1, 1)],
    flap,
  });
  // the crown of the win sits on its head once everything is found
  if (D.lift > 0.01) {
    ctx.save();
    ctx.globalAlpha = clamp(D.lift);
    ctx.fillStyle = WARM;
    const cyy = h * (0.7 + L * 0.03) - cs * 0.62;
    ctx.beginPath();
    ctx.moveTo(w * 0.56 - cs * 0.14, cyy);
    for (let i = 0; i < 4; i++) {
      const x0 = w * 0.56 - cs * 0.14 + (i * cs * 0.28) / 4;
      ctx.lineTo(x0 + cs * 0.035, cyy - cs * 0.1);
      ctx.lineTo(x0 + cs * 0.07, cyy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  reeds(ctx, w, h, h * 0.95, t, rgba(INK, 0.9), 90, 1.5);
  hatch(ctx, 0, hz, w, S(90, h), S(9, h), INK, 0.1);
}

function dChurch(o: Draw) {
  const { ctx, w, h, t, L, px, py, tone } = o;
  const g = tone.ground;
  ctx.fillStyle = g;
  ctx.fillRect(0, h * 0.66, w, h * 0.34);
  // the flooded church on the islet
  const bx = w * 0.5 + px * S(30, h);
  const by = h * (0.66 - L * 0.02) + py * S(10, h);
  const s = S(300, h) * (1 + L * 0.16);
  ridges(ctx, w, h, h * 0.66, { amp: S(90, h), freq: 2, seed: 12.7, color: tone.hill, alpha: 0.5, shift: px * 20 });
  ctx.fillStyle = INK;
  // nave + tower
  ctx.beginPath();
  ctx.rect(bx - s * 0.9, by - s * 0.5, s * 1.8, s * 0.5);
  ctx.moveTo(bx - s * 0.95, by - s * 0.5);
  ctx.lineTo(bx, by - s * 0.78);
  ctx.lineTo(bx + s * 0.95, by - s * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.rect(bx - s * 0.24, by - s * 1.4, s * 0.48, s * 0.95);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bx - s * 0.3, by - s * 1.4);
  ctx.lineTo(bx, by - s * 1.78);
  ctx.lineTo(bx + s * 0.3, by - s * 1.4);
  ctx.closePath();
  ctx.fill();
  // the WAKE UP painted on the tower
  ctx.save();
  ctx.translate(bx, by - s * 1.14);
  ctx.rotate(-0.02);
  ctx.fillStyle = rgba(PAPER_HI, 0.82);
  ctx.font = `${s * 0.11}px Anton, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("WAKE UP", 0, 0);
  ctx.restore();
  // windows
  archWindows(ctx, bx - s * 0.8, by - s * 0.4, s * 1.6, s * 0.3, 6, tone.glow, t);
  // water at its feet + reflection
  const wy = by + s * 0.02;
  ctx.fillStyle = mix(g, INK, 0.25);
  ctx.fillRect(0, wy, w, h - wy);
  ctx.save();
  ctx.globalAlpha = 0.24;
  ctx.translate(0, wy * 2 + s * 0.06);
  ctx.scale(1, -0.5);
  ctx.fillStyle = INK;
  ctx.fillRect(bx - s * 0.9, by - s * 0.5, s * 1.8, s * 0.5);
  ctx.fillRect(bx - s * 0.24, by - s * 1.4, s * 0.48, s * 0.95);
  ctx.restore();
  ripples(ctx, w, h, wy, h, t, mix(PAPER_HI, INK, 0.4), Math.max(6, S(13, h)));
  // the fortune teller's sphere, on a cloth in the foreground
  const sx = w * 0.36 + px * S(16, h);
  const sy = h * 0.87;
  const sr = S(66, h);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(sx - sr * 1.7, sy + sr * 1.1);
  ctx.quadraticCurveTo(sx, sy - sr * 0.1, sx + sr * 1.7, sy + sr * 1.1);
  ctx.lineTo(sx + sr * 1.9, h);
  ctx.lineTo(sx - sr * 1.9, h);
  ctx.closePath();
  ctx.fill();
  const grd = ctx.createRadialGradient(sx - sr * 0.3, sy - sr * 0.4, sr * 0.1, sx, sy - sr * 0.35, sr);
  grd.addColorStop(0, rgba(PAPER_HI, 0.95));
  grd.addColorStop(0.5, rgba(PAPER_LO, 0.42));
  grd.addColorStop(1, rgba(INK, 0.9));
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(sx, sy - sr * 0.35, sr, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(PAPER_HI, 0.5);
  ctx.lineWidth = S(1.2, h);
  ctx.beginPath();
  ctx.arc(sx, sy - sr * 0.35, sr * 0.98, -2.4, -1.4);
  ctx.stroke();
  // a sphere inside the sphere, and a room inside that
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = rgba(INK, 0.7);
  ctx.beginPath();
  ctx.arc(sx + sr * 0.2, sy - sr * 0.2, sr * 0.3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(sx - sr * 0.25, sy - sr * 0.5, sr * 0.12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  // the iron chandelier, forty candles, none lit
  const swing = Math.sin(t * 0.62) * 0.05 + clamp(px, -1, 1) * 0.03;
  ctx.save();
  ctx.translate(w * 0.68 + px * S(26, h), -S(10, h));
  ctx.rotate(swing);
  ctx.strokeStyle = rgba(INK, 0.95);
  ctx.lineWidth = S(2.2, h);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, S(150, h));
  ctx.stroke();
  const rr = S(96, h);
  ctx.beginPath();
  ctx.ellipse(0, S(150, h), rr, rr * 0.26, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = S(1.6, h);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const cx2 = Math.cos(a) * rr;
    const cy2 = S(150, h) + Math.sin(a) * rr * 0.26;
    ctx.beginPath();
    ctx.moveTo(cx2, cy2);
    ctx.lineTo(cx2, cy2 - S(20, h));
    ctx.stroke();
    if (Math.sin(a) > -0.2) {
      ctx.fillStyle = rgba(WARM, 0.16 + 0.1 * Math.sin(t * 3 + i));
      ctx.beginPath();
      ctx.ellipse(cx2, cy2 - S(26, h), S(4, h), S(7, h), 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function dDoor(o: Draw) {
  const { ctx, w, h, t, L, px, py, tone } = o;
  // the interior, one crack of light
  const wall = mix(tone.ground, INK, 0.4);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, w, h);
  hatch(ctx, 0, 0, w, h, S(26, h), INK, 0.28);
  const dw = S(300, h) * (1 + L * 0.35);
  const dh = dw * 1.62;
  const dx = w * 0.5 + px * S(18, h);
  const dy = h * 0.9 - py * S(10, h);
  ctx.save();
  // the light that got in through the keyhole
  const lg = ctx.createLinearGradient(dx, dy - dh * 0.5, w, h);
  lg.addColorStop(0, rgba(tone.glow, 0.5));
  lg.addColorStop(1, rgba(tone.glow, 0));
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.moveTo(dx + dw * 0.1, dy - dh * 0.52);
  ctx.lineTo(w * 1.1, h * 0.2);
  ctx.lineTo(w * 1.1, h * 1.1);
  ctx.lineTo(dx + dw * 0.1, dy - dh * 0.36);
  ctx.closePath();
  ctx.fill();
  // the door, ajar by a hair
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(dx - dw / 2, dy);
  ctx.lineTo(dx - dw / 2, dy - dh);
  ctx.quadraticCurveTo(dx, dy - dh - dw * 0.16, dx + dw / 2, dy - dh);
  ctx.lineTo(dx + dw / 2, dy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rgba(PAPER_LO, 0.16);
  ctx.lineWidth = S(1.4, h);
  for (let i = 1; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(dx - dw / 2 + S(10, h), dy - (dh / 6) * i);
    ctx.lineTo(dx + dw / 2 - S(10, h), dy - (dh / 6) * i);
    ctx.stroke();
  }
  // the keyhole, breathing
  const kA = 0.5 + 0.5 * Math.sin(t * 0.9);
  const kr = dw * 0.055 * (1 + kA * 0.12);
  const ky = dy - dh * 0.46;
  ctx.fillStyle = rgba(tone.glow, 0.92);
  ctx.beginPath();
  ctx.arc(dx, ky, kr, 0, Math.PI * 2);
  ctx.moveTo(dx - kr * 0.6, ky + kr * 0.4);
  ctx.lineTo(dx + kr * 0.6, ky + kr * 0.4);
  ctx.lineTo(dx + kr * 1.3, ky + kr * 3.4);
  ctx.lineTo(dx - kr * 1.3, ky + kr * 3.4);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const bg = ctx.createRadialGradient(dx, ky, 0, dx, ky, kr * 22);
  bg.addColorStop(0, rgba(tone.glow, 0.34 + kA * 0.1));
  bg.addColorStop(1, rgba(tone.glow, 0));
  ctx.fillStyle = bg;
  ctx.fillRect(dx - kr * 22, ky - kr * 22, kr * 44, kr * 44);
  ctx.restore();
  ctx.restore();
  // dust in the beam
  ctx.fillStyle = rgba(tone.glow, 0.5);
  for (let i = 0; i < 90; i++) {
    const u = (nz(i * 2.7) + t * 0.02 * (0.4 + nz(i))) % 1;
    const yy = (nz(i * 5.1) + t * 0.01) % 1;
    const x = dx + u * (w - dx);
    const y = dy - dh * 0.5 + yy * h * 0.5 + (x - dx) * 0.28;
    ctx.fillRect(x, y, S(1.7, h), S(1.7, h));
  }
}

function dStreet(o: Draw) {
  const { ctx, w, h, t, L, px, py, tone } = o;
  const gy = h * (0.72 + L * 0.05) + py * S(8, h);
  // brick wall
  const brick = mix(tone.sky2, INK, 0.28);
  ctx.fillStyle = brick;
  ctx.fillRect(0, 0, w, gy);
  ctx.save();
  ctx.strokeStyle = rgba(PAPER_HI, 0.06);
  ctx.lineWidth = S(1.2, h);
  const bs = S(34, h);
  for (let r = 0, y = 0; y < gy; y += bs, r++) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    for (let x = (r % 2) * bs * 0.5; x < w; x += bs) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + bs);
      ctx.stroke();
    }
  }
  ctx.restore();
  // boarded window + a posted page
  ctx.fillStyle = rgba(INK, 0.8);
  ctx.fillRect(w * 0.66 + px * S(10, h), S(150, h), S(190, h), S(240, h));
  hatch(ctx, w * 0.66 + px * S(10, h), S(150, h), S(190, h), S(240, h), S(14, h), PAPER_LO, 0.25, 0.6);
  newspaper(ctx, w * 0.22, h * 0.3, S(74, h), -0.06, INK, rgba(PAPER_HI, 0.9));
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.translate(w * 0.4, h * 0.24);
  ctx.rotate(-0.04);
  ctx.fillStyle = rgba(PAPER_HI, 0.55);
  ctx.font = `${S(46, h)}px "Sedgwick Ave Display", Anton, cursive`;
  ctx.fillText("still here?", 0, 0);
  ctx.restore();
  // wet ground
  ctx.fillStyle = mix(tone.ground, INK, 0.35);
  ctx.fillRect(0, gy, w, h - gy);
  ripples(ctx, w, h, gy + S(6, h), h, t * 0.8, PAPER_LO, Math.max(6, S(12, h)));
  // the sedan that drives itself
  const cx = w * (0.3 - L * 0.16) + px * S(14, h);
  const cs = S(150, h);
  ctx.save();
  ctx.translate(cx, gy + S(16, h));
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(-cs * 1.5, 0);
  ctx.lineTo(-cs * 1.42, -cs * 0.34);
  ctx.quadraticCurveTo(-cs * 1.1, -cs * 0.5, -cs * 0.66, -cs * 0.52);
  ctx.quadraticCurveTo(-cs * 0.3, -cs * 0.92, cs * 0.34, -cs * 0.9);
  ctx.quadraticCurveTo(cs * 0.92, -cs * 0.86, cs * 1.16, -cs * 0.44);
  ctx.lineTo(cs * 1.46, -cs * 0.3);
  ctx.lineTo(cs * 1.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rgba(PAPER_LO, 0.5);
  ctx.beginPath();
  ctx.moveTo(-cs * 0.5, -cs * 0.55);
  ctx.quadraticCurveTo(-cs * 0.22, -cs * 0.84, cs * 0.24, -cs * 0.82);
  ctx.lineTo(cs * 0.3, -cs * 0.55);
  ctx.closePath();
  ctx.fill();
  for (const wx of [-cs * 0.82, cs * 0.72]) {
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(wx, -cs * 0.06, cs * 0.26, 0, Math.PI * 2);
    ctx.fill();
  }
  // headlights, and their long reflection
  const hg = ctx.createLinearGradient(cs * 1.4, 0, cs * 4.2, cs * 0.5);
  hg.addColorStop(0, rgba(WARM, 0.5));
  hg.addColorStop(1, rgba(WARM, 0));
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(cs * 1.4, -cs * 0.3);
  ctx.lineTo(cs * 4.4, -cs * 0.9);
  ctx.lineTo(cs * 4.4, cs * 0.9);
  ctx.lineTo(cs * 1.4, -cs * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rgba(WARM, 0.85);
  ctx.beginPath();
  ctx.ellipse(cs * 1.42, -cs * 0.18, cs * 0.1, cs * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // leaves the wind drags along the street
  ctx.fillStyle = rgba(INK, 0.8);
  for (let i = 0; i < 46; i++) {
    const sp = 0.06 + nz(i * 7.7) * 0.14;
    const u = (nz(i * 1.3) + t * sp) % 1;
    const x = u * w * 1.1 - w * 0.05;
    const y = gy - S(20, h) - Math.abs(Math.sin(u * 9 + i)) * h * 0.16 + nz(i * 4) * h * 0.3;
    const rot = t * (1 + nz(i)) + i;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, S(7, h), S(2.6, h) * (0.4 + Math.abs(Math.cos(rot)) * 0.8), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function dPortal(o: Draw) {
  const { ctx, w, h, t, L, px, py, tone } = o;
  const z = smoothstep(0.35, 1, L);
  ctx.fillStyle = mix(tone.ground, INK, 0.3);
  ctx.fillRect(0, 0, w, h);
  const aw = w * (0.42 + z * 0.5);
  const ah = h * (0.7 + z * 0.4);
  const ax = w * 0.5 + px * S(14, h) * (1 - z);
  const ay = h * 0.98 + py * S(10, h);
  // the wall
  ctx.fillStyle = mix("#2a2620", tone.sky2, 0.35);
  ctx.fillRect(0, 0, w, h);
  hatch(ctx, 0, 0, w, h, S(20, h), INK, 0.4, 0.02);
  // the opening
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ax - aw / 2, ay);
  ctx.lineTo(ax - aw / 2, ay - ah * 0.62);
  ctx.quadraticCurveTo(ax, ay - ah * (0.62 + 0.42), ax + aw / 2, ay - ah * 0.62);
  ctx.lineTo(ax + aw / 2, ay);
  ctx.closePath();
  ctx.fillStyle = INK;
  ctx.fill();
  ctx.clip();
  // what is at the end of it: the same street, half a second late
  const g2 = ctx.createLinearGradient(0, ay - ah, 0, ay);
  g2.addColorStop(0, rgba(PAPER, 0.5 + 0.2 * Math.sin(t * 0.7)));
  g2.addColorStop(1, rgba(PAPER_LO, 0.1));
  ctx.fillStyle = g2;
  ctx.fillRect(ax - aw / 2, ay - ah, aw, ah);
  ctx.fillStyle = rgba(INK, 0.5);
  for (let i = 0; i < 12; i++) {
    const x = ax - aw * 0.4 + nz(i * 3.3) * aw * 0.8;
    ctx.fillRect(x, ay - ah * (0.2 + nz(i) * 0.4), aw * 0.05, ah * 0.4);
  }
  ctx.restore();
  // the tag above the arch, sprayed on the face you walk towards
  ctx.save();
  ctx.translate(ax, ay - ah * 0.78);
  ctx.rotate(-0.012);
  const fs = aw * 0.15;
  ctx.fillStyle = rgba(PAPER_HI, 0.92);
  ctx.font = `${fs}px "Sedgwick Ave Display", Anton, cursive`;
  ctx.textAlign = "center";
  ctx.fillText("WAKE UP,", 0, 0);
  ctx.fillText("YOU'RE DREAMING", 0, fs * 0.92);
  // runs of paint
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 9; i++) {
    const x = -aw * 0.34 + nz(i * 8.1) * aw * 0.68;
    ctx.fillRect(x, fs * 0.1 + nz(i * 2) * fs * 0.2, S(1.6, h), fs * (0.4 + nz(i * 5) * 1.6));
  }
  ctx.restore();
  // 0309 on the left pier
  ctx.save();
  ctx.fillStyle = rgba(PAPER_HI, 0.5);
  ctx.font = `${S(40, h)}px Anton, sans-serif`;
  ctx.translate(ax - aw * 0.36, ay - ah * 0.2);
  ctx.rotate(-0.06);
  ctx.fillText("0309", 0, 0);
  ctx.restore();
  // ground
  ctx.fillStyle = rgba(INK, 0.8);
  ctx.fillRect(0, ay - S(2, h), w, h - ay + S(4, h));
  ripples(ctx, w, ay - S(2, h), h, h, t, PAPER_LO, Math.max(6, S(13, h)));
}

function dAscent(o: Draw) {
  const { ctx, w, h, t, L, px, py, tone } = o;
  // the pull upward: roofs fall away, haze comes in
  ctx.fillStyle = mix(tone.sky, tone.sky2, 0.4);
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) {
    const k = i / 8;
    const y = h * (0.98 - k * 0.62) + L * h * 0.5 + py * S(6 * k, h);
    const a = 0.5 - k * 0.42;
    if (y < -S(60, h)) continue;
    ctx.fillStyle = rgba(INK, clamp(a, 0.02, 0.5));
    ctx.beginPath();
    const step = S(120, h) * (1 + k * 0.7);
    for (let x = -step; x < w + step; x += step) {
      const hh = S(28 + nz(i * 9 + x) * 70, h) * (1 - k * 0.4);
      ctx.moveTo(x + px * S(6 * (1 - k), h), y);
      ctx.lineTo(x + step * 0.5, y - hh);
      ctx.lineTo(x + step, y);
    }
    ctx.fill();
    ctx.fillRect(0, y, w, h);
    ctx.fillStyle = rgba(tone.sky, clamp(0.55 - k * 0.4, 0, 1));
    ctx.fillRect(0, y - S(30, h), w, S(30, h));
  }
  // mist bands
  for (let i = 0; i < 7; i++) {
    const y = h * (0.2 + i * 0.11) + Math.sin(t * 0.2 + i) * S(10, h);
    ctx.fillStyle = rgba(PAPER_HI, 0.09);
    ctx.fillRect(0, y, w, S(26 + i * 12, h));
  }
  // birds that are not birds
  ctx.strokeStyle = rgba(INK, 0.65);
  ctx.lineWidth = S(2, h);
  for (let i = 0; i < 7; i++) {
    const u = (nz(i * 4.4) + t * 0.02) % 1;
    const x = u * w;
    const y = h * (0.16 + nz(i * 7.7) * 0.3) - L * h * 0.1;
    const s = S(9 + nz(i) * 10, h);
    const f = Math.sin(t * 4 + i) * 0.4;
    ctx.beginPath();
    ctx.moveTo(x - s, y + f * s);
    ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.5, x, y);
    ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.5, x + s, y + f * s);
    ctx.stroke();
  }
}

function dOrbit(o: Draw) {
  const { ctx, w, h, t, L, px, py, tone } = o;
  ctx.fillStyle = NIGHT;
  ctx.fillRect(0, 0, w, h);
  // stars
  for (let i = 0; i < 240; i++) {
    const x = nz(i * 1.7) * w;
    const y = nz(i * 3.9, 2) * h;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.4 + nz(i)) + i));
    ctx.fillStyle = rgba(PAPER_HI, 0.09 + tw * 0.5 * (0.3 + nz(i * 6)));
    ctx.fillRect(x, y, S(1.4 + nz(i * 2) * 1.2, h), S(1.4 + nz(i * 2) * 1.2, h));
  }
  // the earth, printed in paper
  const r = Math.min(w, h) * (0.26 - L * 0.05);
  const cx = w * 0.5 + px * S(16, h);
  const cy = h * (0.46 - L * 0.02) + py * S(12, h);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const g = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.5, r * 0.1, cx, cy, r * 1.2);
  g.addColorStop(0, PAPER_HI);
  g.addColorStop(0.6, PAPER);
  g.addColorStop(1, "#7e7660");
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  // continents: value noise, thresholded, drifting west
  const spin = t * 0.02 + L * 0.4;
  for (let i = 0; i < 150; i++) {
    const a = nz(i * 2.3) * Math.PI * 2;
    const rr = Math.sqrt(nz(i * 5.1)) * r;
    const x = cx + Math.cos(a + spin) * rr;
    const y = cy + Math.sin(a) * rr * 0.86;
    const s = S(6 + nz(i * 9.9) * 34, h);
    ctx.fillStyle = rgba(INK, 0.16 + nz(i * 1.1) * 0.5);
    ctx.beginPath();
    ctx.ellipse(x, y, s, s * (0.3 + nz(i * 3.3) * 0.6), nz(i) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // the night side of it
  const ns = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  ns.addColorStop(0, "rgba(4,4,6,0.92)");
  ns.addColorStop(0.5, "rgba(4,4,6,0.28)");
  ns.addColorStop(0.72, "rgba(4,4,6,0)");
  ns.addColorStop(1, "rgba(4,4,6,0.5)");
  ctx.fillStyle = ns;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
  // the rim of the atmosphere
  ctx.strokeStyle = rgba(tone.glow, 0.4);
  ctx.lineWidth = S(1.6, h);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.012, 0, Math.PI * 2);
  ctx.stroke();
  // the pull line you came up on
  ctx.strokeStyle = rgba(PAPER_LO, 0.2);
  ctx.lineWidth = S(1, h);
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 1.5, r * 0.42, -0.3 + px * 0.1, 0, Math.PI * 2);
  ctx.stroke();
  // the page it turns out to be
  ctx.save();
  ctx.globalAlpha = 0.5 + L * 0.4;
  newspaper(ctx, w * (0.5 + 0.32 * Math.sin(t * 0.1)), h * 0.72, S(40, h), 0.3 + Math.sin(t * 0.2) * 0.1, INK, rgba(PAPER_HI, 0.7));
  ctx.restore();
}

const DRAW = [dLake, dPier, dChurch, dDoor, dStreet, dPortal, dAscent, dOrbit];

// ------------------------------------------------------------------ dust that lives in every scene
interface Mote {
  x: number;
  y: number;
  z: number;
  r: number;
}
let motes: Mote[] = [];
let moteKey = "";

function dust(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const key = `${Math.round(w)}x${Math.round(h)}`;
  if (key !== moteKey) {
    moteKey = key;
    motes = Array.from({ length: 260 }, (_, i) => ({
      x: nz(i * 1.7 + 3) * w,
      y: nz(i * 4.3 + 1) * h,
      z: 0.2 + nz(i * 9.1) * 0.8,
      r: 0.4 + nz(i * 6.6) * 1.7,
    }));
  }
  for (const m of motes) {
    const x = (m.x + t * (4 + m.z * 22) + D.px * 40 * m.z) % (w + 40);
    const y = (m.y - t * (2 + m.z * 8) + D.py * 26 * m.z) % (h + 40);
    const tw = 0.5 + 0.5 * Math.sin(t * 2 + m.x * 0.01);
    ctx.fillStyle = rgba(PAPER_HI, 0.05 + tw * 0.3 * m.z);
    ctx.beginPath();
    ctx.arc(x < 0 ? x + w : x, y < 0 ? y + h : y, m.r * (0.7 + m.z), 0, Math.PI * 2);
    ctx.fill();
  }
}

// ------------------------------------------------------------------ the painter
export function createPainter(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: false })!;
  let buf = document.createElement("canvas");
  let bctx = buf.getContext("2d")!;
  let w = 0;
  let h = 0;
  let dpr = 1;

  const resize = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    buf.width = canvas.width;
    buf.height = canvas.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    moteKey = "";
  };
  resize();
  addEventListener("resize", resize);

  const hotAmount = (m: Mod) => {
    // how much the ink of the cursor has bled over this object
    const hx = m.at[0] * w;
    const hy = m.at[1] * h;
    const rad = m.r * (h / 1080) * 1.1;
    let best = 0;
    for (const p of D.ink) {
      const age = clamp(1 - (performance.now() - p.t) / 1400);
      const d = Math.hypot(p.x - hx, p.y - hy) / rad;
      best = Math.max(best, (1 - clamp(d)) * age);
    }
    return best;
  };

  const render = () => {
    const t = D.t;
    const reduced = D.reduced;
    const tone = toneAt(D.s);
    ctx.save();
    // ---- the ground of it all
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, tone.sky);
    bg.addColorStop(1, tone.sky2);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    // paper mottling
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 22; i++) {
      const x = nz(i * 2.2, Math.floor(t * 0.02)) * w;
      const y = (nz(i * 5.5, Math.floor(t * 0.02) + 1) * h + t * 4 * (i % 3)) % h;
      ctx.fillStyle = i % 2 ? INK : PAPER_HI;
      ctx.beginPath();
      ctx.ellipse(x, y, S(120 + i * 30, h), S(60 + i * 14, h), i, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ---- scenes, faded into each other
    const px = clamp(D.px, -1, 1);
    const py = clamp(D.py, -1, 1);
    for (let i = 0; i < SCENES.length; i++) {
      const a = sceneAlpha(i, D.depth);
      if (a < 0.004) continue;
      const local = clamp((D.depth - SCENES[i].a) / (SCENES[i].b - SCENES[i].a));
      ctx.save();
      ctx.globalAlpha = a;
      // the camera drift: a push-in at the start of a scene, a pull back out of it
      const push = 1 + local * 0.05;   // every scene leans a little closer as you pass through it
      const drift = (local - 0.5) * S(30, h) * (i % 2 ? -1 : 1);
      ctx.translate(w / 2, h / 2 + drift);
      ctx.scale(push, push);
      ctx.translate(-w / 2, -h / 2);
      DRAW[i]({ ctx, w, h, t, L: local, a, px, py, tone, hot: hotAmount });
      ctx.restore();
    }

    dust(ctx, w, h, t);

    // ---- the black ink the cursor leaves: it is how you find what is hidden
    if (D.ink.length) {
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      for (const p of D.ink) {
        const age = clamp(1 - (performance.now() - p.t) / 1500);
        if (age <= 0) continue;
        const r = S(66, h) * (0.35 + age * 0.8);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, `rgba(8,7,6,${0.5 * age})`);
        g.addColorStop(0.6, `rgba(11,10,8,${0.2 * age})`);
        g.addColorStop(1, "rgba(11,10,8,0)");
        ctx.fillStyle = g;
        ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
      }
      ctx.restore();
    }
    // the objects themselves, and the shimmer when you are close to one
    for (const m of MODULES) {
      if ((m as Mod & { got?: boolean }).got && !D.lift) {
        /* kept for symmetry: found modules stop asking for you */
      }
      const hv = hotAmount(m);
      if (hv <= 0.02) continue;
      const hx = m.at[0] * w;
      const hy = m.at[1] * h;
      const r = m.r * (h / 1080);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = rgba(PAPER_HI, 0.16 * hv);
      ctx.lineWidth = Math.max(0.7, S(1, h));
      const rr = r * (0.55 + 0.45 * Math.sin(t * 2 + hx));
      ctx.beginPath();
      ctx.arc(hx, hy, rr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(hx, hy, rr * 1.28, 1, 1 + Math.PI * 1.6 * hv);
      ctx.stroke();
      ctx.restore();
    }

    // ---- the end: the paper floods in and the dream is over
    if (D.wake > 0.001) {
      ctx.fillStyle = rgba(PAPER_HI, D.wake * 0.82);
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.globalAlpha = D.wake * 0.5;
      hatch(ctx, 0, 0, w, h, S(9, h), INK, 0.2, -1.2);
      ctx.restore();
    }
    ctx.restore();

    // ---- printing out of register while a scene passes
    const amt = reduced ? 0 : clamp(D.mix - 0.62) * 1.15 + D.flow * 0.16;
    if (amt > 0.02) {
      bctx.clearRect(0, 0, w, h);
      bctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, w, h);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = clamp(amt, 0, 0.4);
      const d = S(2 + amt * 16, h);
      ctx.drawImage(buf, -d, 0, w, h);
      ctx.globalAlpha = clamp(amt * 0.6, 0, 0.25);
      ctx.drawImage(buf, d, d * 0.4, w, h);
      ctx.restore();
    }
  };

  return {
    render,
    dispose() {
      removeEventListener("resize", resize);
      ctx.clearRect(0, 0, w, h);
    },
    size: () => ({ w, h }),
    /** the frame the loader burns through: the world without the UI */
    snapshot: () => {
      buf.width = canvas.width;
      buf.height = canvas.height;
      bctx.drawImage(canvas, 0, 0);
      return buf.toDataURL("image/jpeg", 0.6);
    },
  };
}
