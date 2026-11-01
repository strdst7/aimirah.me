import { fbm, type ModId } from "./dream";

// A very small wireframe engine: every collectable is a handful of polylines in 3D, turned slowly and projected
// orthographically with a touch of perspective. The storage grid and the notification icon share these models.

export type Poly = { pts: [number, number, number][]; closed?: boolean; w?: number; a?: number };

const seg = (n: number) => (i: number) => (i / n) * Math.PI * 2;

function sphere(rings = 5, meridians = 9, squash = 1, wob = 0, seed = 0): Poly[] {
  const R = (th: number, ph: number) =>
    1 - (wob > 0 ? wob * fbm(Math.cos(th) * 2 + seed, Math.cos(ph) * 2 + seed, 2) : 0);
  const out: Poly[] = [];
  for (let i = 1; i < rings; i++) {
    const th = (i / rings) * Math.PI;
    const rr = Math.sin(th);
    const p: [number, number, number][] = [];
    const n = 40;
    for (let j = 0; j <= n; j++) {
      const ph = seg(n)(j);
      const k = R(th, ph);
      p.push([rr * Math.cos(ph) * k, Math.cos(th) * squash * k, rr * Math.sin(ph) * k]);
    }
    out.push({ pts: p, closed: true, a: 0.38 });
  }
  for (let i = 0; i < meridians; i++) {
    const ph = (i / meridians) * Math.PI * 2;
    const p: [number, number, number][] = [];
    const n = 22;
    for (let j = 0; j <= n; j++) {
      const th = (j / n) * Math.PI;
      const k = R(th, ph);
      p.push([Math.sin(th) * Math.cos(ph) * k, Math.cos(th) * squash * k, Math.sin(th) * Math.sin(ph) * k]);
    }
    out.push({ pts: p, a: 0.22 });
  }
  return out;
}

const line = (a: [number, number, number], b: [number, number, number], w = 1, alpha = 0.5): Poly => ({ pts: [a, b], w, a: alpha });
const box = (x: number, y: number, z: number, w: number, h: number, d: number, alpha = 0.55): Poly[] => {
  const c: [number, number, number][] = [
    [x - w / 2, y - h / 2, z - d / 2],
    [x + w / 2, y - h / 2, z - d / 2],
    [x + w / 2, y + h / 2, z - d / 2],
    [x - w / 2, y + h / 2, z - d / 2],
    [x - w / 2, y - h / 2, z + d / 2],
    [x + w / 2, y - h / 2, z + d / 2],
    [x + w / 2, y + h / 2, z + d / 2],
    [x - w / 2, y + h / 2, z + d / 2],
  ];
  const e: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  return e.map(([a, b]) => ({ pts: [c[a], c[b]], a: alpha }));
};
const circle3 = (cx: number, cy: number, cz: number, r: number, axis: "y" | "z" = "y", n = 32, alpha = 0.5): Poly => {
  const p: [number, number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = seg(n + 1)(i);
    p.push(axis === "y" ? [cx + Math.cos(a) * r, cy, cz + Math.sin(a) * r] : [cx + Math.cos(a) * r, cy + Math.sin(a) * r, cz]);
  }
  return { pts: p, closed: true, a: alpha };
};

export function modelFor(id: ModId): Poly[] {
  switch (id) {
    case "crow": {
      const body = sphere(4, 7, 0.62).map((o) => ({
        ...o,
        pts: o.pts.map(([x, y, z]) => [x * 1.35, y * 0.9 - 0.05, z * 0.95] as [number, number, number]),
      }));
      const head = sphere(3, 5, 0.9).map((o) => ({
        ...o,
        pts: o.pts.map(([x, y, z]) => [x * 0.4 + 0.95, y * 0.4 + 0.42, z * 0.4] as [number, number, number]),
      }));
      const beak: Poly[] = [
        { pts: [[1.3, 0.42, 0], [1.72, 0.3, 0.03], [1.3, 0.24, 0]], closed: true, a: 0.7 },
        line([1.3, 0.42, 0], [1.3, 0.24, 0], 1, 0.5),
      ];
      const tail: Poly[] = [
        { pts: [[-1.25, -0.05, 0], [-1.95, 0.28, 0.1], [-1.9, 0.16, -0.12], [-1.2, -0.22, 0]], closed: true, a: 0.7 },
        line([-1.95, 0.28, 0.1], [-1.9, 0.16, -0.12], 1, 0.4),
      ];
      const legs: Poly[] = [line([0.1, -0.55, 0.1], [0.14, -1.05, 0.16], 1, 0.6), line([-0.2, -0.55, -0.08], [-0.16, -1.05, -0.02], 1, 0.6)];
      const wing: Poly[] = [{ pts: [[-0.5, 0.2, -0.55], [0.45, 0.35, -0.7], [0.9, 0.1, -0.4], [-0.2, -0.1, -0.6]], closed: true, a: 0.5 }];
      return [...body, ...head, ...beak, ...tail, ...legs, ...wing];
    }
    case "sphere":
      return [...sphere(6, 12, 1), { ...circle3(0, -0.02, 0, 1.02, "y", 40, 0.8) }, line([0, -1.02, 0], [0, -1.4, 0], 1, 0.4)];
    case "earth": {
      const w = sphere(6, 12, 1, 0.1, 3.2);
      return [...w, circle3(0, 0, 0, 1.06, "y", 44, 0.35), circle3(0, 0, 0, 1.16, "y", 44, 0.18)];
    }
    case "chandelier": {
      const out: Poly[] = [circle3(0, -0.35, 0, 1, "y", 36, 0.8), circle3(0, -0.42, 0, 0.62, "y", 30, 0.4), line([0, 1.4, 0], [0, -0.35, 0], 1, 0.35)];
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const x = Math.cos(a);
        const z = Math.sin(a);
        out.push(line([x, -0.35, z], [x, 0.05, z], 1, 0.6));
        out.push(circle3(x, 0.08, z, 0.09, "y", 12, 0.5));
        out.push(line([x * 0.62, -0.4, z * 0.62], [x, -0.35, z], 1, 0.22));
      }
      for (let i = 0; i < 4; i++) out.push(line([0, 1.4, 0], [Math.cos(i * 1.6) * 0.3, 0.7, Math.sin(i * 1.6) * 0.3], 1, 0.15));
      return out;
    }
    case "door": {
      const frame = box(0, 0, 0, 1.35, 2.1, 0.22, 0.6);
      const panels = [...box(0, 0.45, 0.13, 0.85, 0.7, 0.02, 0.3), ...box(0, -0.5, 0.13, 0.85, 0.7, 0.02, 0.3)];
      const key: Poly[] = [circle3(0, 0.05, 0.14, 0.12, "z", 16, 0.9), { pts: [[-0.07, -0.02, 0.14], [0.07, -0.02, 0.14], [0.13, -0.34, 0.14], [-0.13, -0.34, 0.14]], closed: true, a: 0.9 }];
      const arch: Poly[] = [{ pts: Array.from({ length: 17 }, (_, i) => { const a = Math.PI - (i / 16) * Math.PI; return [Math.cos(a) * 0.68, 1.05 + Math.sin(a) * 0.42, 0.11] as [number, number, number]; }), a: 0.5 }];
      return [...frame, ...panels, ...key, ...arch];
    }
    case "car": {
      const body = box(0, -0.15, 0, 2.5, 0.62, 1.05, 0.7);
      const cabin = box(-0.05, 0.42, 0, 1.35, 0.55, 0.9, 0.5);
      const wheels = [circle3(-0.82, -0.46, 0.52, 0.32, "z", 20, 0.8), circle3(0.82, -0.46, 0.52, 0.32, "z", 20, 0.8), circle3(-0.82, -0.46, -0.52, 0.32, "z", 20, 0.3), circle3(0.82, -0.46, -0.52, 0.32, "z", 20, 0.3)];
      const lights = [circle3(1.26, -0.05, 0.3, 0.14, "z", 12, 0.9), circle3(1.26, -0.05, -0.3, 0.14, "z", 12, 0.4)];
      const beams = [line([1.26, -0.05, 0.3], [2.5, 0.2, 0.9], 1, 0.16), line([1.26, -0.05, 0.3], [2.5, -0.3, 0.5], 1, 0.16)];
      return [...body, ...cabin, ...wheels, ...lights, ...beams];
    }
  }
}

const cache = new Map<string, Poly[]>();
export const model = (id: ModId) => {
  let m = cache.get(id);
  if (!m) cache.set(id, (m = modelFor(id)));
  return m!;
};

/** paint a model into a 2D context, turned `rot` radians around Y */
export function drawModel(
  ctx: CanvasRenderingContext2D,
  id: ModId,
  cx: number,
  cy: number,
  size: number,
  rot: number,
  col: string,
  o: { tilt?: number; alpha?: number; lw?: number } = {},
) {
  const polys = model(id);
  const ry = rot;
  const rx = o.tilt ?? 0.34;
  const A = Math.cos(ry);
  const B = Math.sin(ry);
  const C = Math.cos(rx);
  const S = Math.sin(rx);
  const sc = size / 2;
  const proj = ([x, y, z]: [number, number, number]) => {
    const x1 = x * A + z * B;
    const z1 = -x * B + z * A;
    const y1 = y * C - z1 * S;
    const z2 = y * S + z1 * C;
    const p = 1 / (1 + z2 * 0.16);
    return [cx + x1 * sc * p, cy - y1 * sc * p] as [number, number];
  };
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  for (const pl of polys) {
    ctx.strokeStyle = col;
    ctx.globalAlpha = (o.alpha ?? 1) * (pl.a ?? 0.5);
    ctx.lineWidth = o.lw ?? 1;
    ctx.beginPath();
    pl.pts.forEach((pt, i) => {
      const [x, y] = proj(pt);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    if (pl.closed) ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}
