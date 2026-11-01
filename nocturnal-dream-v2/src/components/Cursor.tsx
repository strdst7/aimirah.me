import { useEffect, useRef, useState } from "react";

/* A ring and a dot traveling in difference blend — it grows over anything
   willing to be clicked, and carries a whisper of a label. */

export interface CursorHandle {
  setLabel(text: string | null): void;
}

interface Props {
  enabled: boolean;
  handleRef: React.MutableRefObject<CursorHandle | null>;
}

export default function Cursor({ enabled, handleRef }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    handleRef.current = { setLabel };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef]);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("cursor-none-root");
    const el = rootRef.current!;
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;
    let hovering = false;

    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const t = e.target as HTMLElement | null;
      const h = !!t?.closest?.("button, a, [data-cursor]");
      if (h !== hovering) {
        hovering = h;
        el.classList.toggle("big", h || !!el.dataset.forced);
        const dc = h ? t?.closest("[data-cursor]")?.getAttribute("data-cursor") : null;
        if (!el.dataset.forced) setLabel(dc ?? (h ? "" : null));
      }
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      root.classList.remove("cursor-none-root");
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  // label forced from the engine (e.g. the crow)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (label !== null && !el.classList.contains("big")) el.classList.add("big");
    el.dataset.forced = label ? "1" : "";
  }, [label]);

  if (!enabled) return null;

  return (
    <div id="cursor" ref={rootRef}>
      <div className="c-ring" />
      <div className="c-dot" />
      <div className="c-label">{label}</div>
    </div>
  );
}
