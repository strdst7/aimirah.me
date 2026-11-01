import { D, SCENES, clamp, layoutVars, sceneAt, smoothstep } from "./dream";
import { SND } from "./sound";

// ------------------------------------------------------------------ one loop for the whole dream
// depth easing, pointer smoothing, the ink the cursor leaves behind, scene bookkeeping — then every subscriber
// paints / reads. The loader's frames and the HUD readouts ride the same rAF so nothing runs twice.

type Frame = (dt: number) => void;
const subs = new Set<Frame>();
export const subscribe = (f: Frame) => {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
};

let running = false;
let last = 0;

export function startLoop() {
  if (running) return;
  running = true;
  D.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const step = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    D.t += dt;
    D.dt = dt;

    // ---- depth: the wheel/drag/key target, chased with a little inertia
    const prev = D.depth;
    D.depth += (D.target - D.depth) * (1 - Math.exp(-dt * (D.reduced ? 14 : 6.2)));
    const moved = Math.abs(D.depth - prev);
    D.flow += (moved * 26 - D.flow) * (1 - Math.exp(-dt * 5));
    D.flow = clamp(D.flow, 0, 1);
    D.depth = clamp(D.depth);

    // ---- pointer: smoothed for parallax, raw for the corner readouts
    const k = 1 - Math.exp(-dt * 7);
    D.px += (D.ptx - D.px) * k;
    D.py += (D.pty - D.py) * k;
    D.ink = D.ink.filter((p) => now - p.t < 1500);

    // ---- which scene, and how far we are from its calm centre
    const { i, local } = sceneAt(D.depth);
    if (i !== D.scene) {
      D.scene = i;
      SND.play("whoosh");
    }
    D.s = i + local;
    D.mix = clamp(Math.abs(local - 0.5) * 2 * 0.9 + D.flow * 0.5);
    D.wake = smoothstep(0.965, 1, D.depth);
    D.intro = clamp(D.intro + dt * 0.5);

    SND.space(D.depth, D.flow);
    for (const f of subs) f(dt);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function addScroll(delta: number) {
  D.target = clamp(D.target + delta);
}

// ------------------------------------------------------------------ input: wheel, drag, touch, keys
export function bindInputs(root: HTMLElement) {
  const SENS = 0.00028;
  let dragging = false;
  let lastY = 0;
  let touchY = 0;

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    addScroll(e.deltaY * (e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? root.clientHeight : 1) * SENS);
  };
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true;
    lastY = e.clientY;
    root.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    D.mx = e.clientX;
    D.my = e.clientY;
    D.ptx = (e.clientX / innerWidth) * 2 - 1;
    D.pty = (e.clientY / innerHeight) * 2 - 1;
    const now = performance.now();
    const l = D.ink[D.ink.length - 1];
    if (!l || Math.hypot(l.x - e.clientX, l.y - e.clientY) > 9 || now - l.t > 55)
      D.ink.push({ x: e.clientX, y: e.clientY, t: now });
    if (D.ink.length > 70) D.ink.shift();
    if (dragging) {
      addScroll((lastY - e.clientY) * 0.0016);
      lastY = e.clientY;
    } else if (e.pointerType === "touch") {
      addScroll((touchY - e.clientY) * 0.0016);
      touchY = e.clientY;
    }
  };
  const onTouchStart = (e: TouchEvent) => {
    touchY = e.touches[0].clientY;
  };
  const onPointerUp = () => {
    dragging = false;
  };
  const onKey = (e: KeyboardEvent) => {
    const step = 0.055;
    switch (e.key) {
      case "ArrowDown":
      case "PageDown":
      case " ":
        e.preventDefault();
        addScroll(step * (e.key === " " ? 1.4 : 1));
        break;
      case "ArrowUp":
      case "PageUp":
        e.preventDefault();
        addScroll(-step);
        break;
      case "Home":
        D.target = 0;
        break;
      case "End":
        D.target = 1;
        break;
    }
  };
  const onResize = () => layoutVars();

  addEventListener("wheel", onWheel, { passive: false });
  addEventListener("pointerdown", onPointerDown);
  addEventListener("pointermove", onPointerMove, { passive: true });
  addEventListener("pointerup", onPointerUp);
  addEventListener("pointercancel", onPointerUp);
  addEventListener("touchstart", onTouchStart, { passive: true });
  addEventListener("keydown", onKey);
  addEventListener("resize", onResize);
  layoutVars();

  return () => {
    removeEventListener("wheel", onWheel);
    removeEventListener("pointerdown", onPointerDown);
    removeEventListener("pointermove", onPointerMove);
    removeEventListener("pointerup", onPointerUp);
    removeEventListener("pointercancel", onPointerUp);
    removeEventListener("touchstart", onTouchStart);
    removeEventListener("keydown", onKey);
    removeEventListener("resize", onResize);
  };
}

/** jump to a scene from the HUD strip (the site's chapter rail) */
export function gotoScene(i: number) {
  const sc = SCENES[clamp(i, 0, SCENES.length - 1)];
  D.target = clamp(sc.a + (sc.b - sc.a) * 0.5);
  SND.play("tape");
}
