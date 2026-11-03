import { useEffect, useRef, useState } from "react";

/** Custom trailing cursor: a dot + elastic ring. Reads [data-cursor] labels. */
export default function Cursor() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    setEnabled(true);
    document.body.classList.add("custom-cursor");

    const pos = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let scale = 1;
    let targetScale = 1;
    let raf = 0;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        ring.x = pos.x;
        ring.y = pos.y;
      }
      const el = (e.target as Element | null)?.closest?.("[data-cursor]");
      const label = el?.getAttribute("data-cursor") ?? "";
      const interactive = (e.target as Element | null)?.closest?.(
        "a, button, [role='slider'], [data-hover]"
      );
      targetScale = label ? 2.6 : interactive ? 1.9 : 1;
      if (labelRef.current) {
        labelRef.current.textContent = label;
      }
    };

    const loop = () => {
      ring.x += (pos.x - ring.x) * 0.16;
      ring.y += (pos.y - ring.y) * 0.16;
      scale += (targetScale - scale) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      }
      raf = requestAnimationFrame(loop);
    };

    const onLeave = () => {
      visible = false;
      pos.x = -100;
      pos.y = -100;
      ring.x = -100;
      ring.y = -100;
    };

    // Pause the trailing animation while the tab is hidden (CONCERNS.md #18).
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = requestAnimationFrame(loop);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(raf);
      document.body.classList.remove("custom-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[120] h-1.5 w-1.5 rounded-full bg-signal"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[119] flex h-9 w-9 items-center justify-center rounded-full border border-bone/50 mix-blend-difference"
      >
        <span
          ref={labelRef}
          className="font-mono text-[4px] font-bold uppercase tracking-[0.18em] text-bone"
        />
      </div>
    </>
  );
}
