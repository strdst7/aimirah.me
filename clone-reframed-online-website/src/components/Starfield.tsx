import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  depth: number;
  phase: number;
  speed: number;
}

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

/** Fixed canvas of slowly twinkling stars with mouse parallax + rare comets. */
export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: Star[] = [];
    let comets: Comet[] = [];
    let raf = 0;
    let last = 0;
    let cometTimer = 2500;
    // Motion/visibility gating: honour prefers-reduced-motion by drawing a
    // static frame, and stop looping while the tab is hidden (CONCERNS #8, #18).
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionQuery.matches;
    let hidden = document.visibilityState === "hidden";

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(260, Math.floor((w * h) / 6500));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.2,
        depth: Math.random(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.4,
      }));
    };

    const onMouse = (e: MouseEvent) => {
      mouse.tx = (e.clientX / w - 0.5) * 2;
      mouse.ty = (e.clientY / h - 0.5) * 2;
    };

    const spawnComet = () => {
      const fromTop = Math.random() > 0.4;
      const x = Math.random() * w * 0.7 + w * 0.15;
      const y = fromTop ? -20 : Math.random() * h * 0.3;
      comets.push({
        x,
        y,
        vx: -(3 + Math.random() * 3),
        vy: 2.5 + Math.random() * 2.2,
        life: 0,
        maxLife: 90 + Math.random() * 50,
      });
    };

    const tick = (t: number) => {
      if (hidden) {
        raf = 0;
        last = t;
        return;
      }
      const dt = reduced ? 0 : Math.min(50, t - last);
      last = t;
      cometTimer -= dt;
      if (cometTimer <= 0) {
        spawnComet();
        cometTimer = 4500 + Math.random() * 5500;
      }

      mouse.x += (mouse.tx - mouse.x) * 0.03;
      mouse.y += (mouse.ty - mouse.y) * 0.03;

      ctx.clearRect(0, 0, w, h);

      const time = t * 0.001;
      for (const s of stars) {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * s.speed + s.phase));
        const px = s.x - mouse.x * 14 * s.depth;
        const py = s.y - mouse.y * 14 * s.depth + Math.sin(time * 0.2 + s.phase) * 2;
        ctx.globalAlpha = tw * (0.25 + s.depth * 0.65);
        ctx.fillStyle = "#ece9e2";
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();

        // occasional glow cross on the biggest stars
        if (s.r > 1.05) {
          ctx.globalAlpha = tw * 0.18 * s.depth;
          ctx.strokeStyle = "#ece9e2";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(px - s.r * 6, py);
          ctx.lineTo(px + s.r * 6, py);
          ctx.moveTo(px, py - s.r * 6);
          ctx.lineTo(px, py + s.r * 6);
          ctx.stroke();
        }
      }

      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.x += c.vx;
        c.y += c.vy;
        c.life++;
        const fade =
          Math.min(1, c.life / 14) * Math.max(0, 1 - c.life / c.maxLife);
        const grad = ctx.createLinearGradient(
          c.x,
          c.y,
          c.x - c.vx * 22,
          c.y - c.vy * 22
        );
        grad.addColorStop(0, `rgba(236,233,226,${0.8 * fade})`);
        grad.addColorStop(1, "rgba(236,233,226,0)");
        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - c.vx * 22, c.y - c.vy * 22);
        ctx.stroke();

        if (c.life > c.maxLife || c.x < -80 || c.y > h + 80) {
          comets.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;
      // Reduced motion: paint a single static frame instead of looping.
      raf = reduced ? 0 : requestAnimationFrame(tick);
    };

    const onMotionChange = () => {
      reduced = motionQuery.matches;
      if (!raf && !hidden) raf = requestAnimationFrame(tick);
    };
    const onVisibility = () => {
      hidden = document.visibilityState === "hidden";
      if (!hidden && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);
    motionQuery.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", onVisibility);
    if (!hidden) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      motionQuery.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
