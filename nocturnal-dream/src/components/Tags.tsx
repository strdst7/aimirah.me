import { useEffect, useRef } from "react";
import { D, MODULES, clamp, type Mod, type ModId } from "../lib/dream";
import { subscribe } from "../lib/engine";
import { SND } from "../lib/sound";

// Six objects in the dream are hiding something. You find them the way the reference has it: move the cursor over
// an object, the black ink you leave behind bleeds a small tag out of it, press and hold for a second — discovered.

const HOLD_MS = 1000;

const hotAmount = (m: Mod) => {
  const hx = m.at[0] * innerWidth;
  const hy = m.at[1] * innerHeight;
  const rad = m.r * (innerHeight / 1080) * 1.15;
  let best = 0;
  for (const p of D.ink) {
    const age = clamp(1 - (performance.now() - p.t) / 1400);
    const d = Math.hypot(p.x - hx, p.y - hy) / rad;
    best = Math.max(best, (1 - clamp(d)) * age);
  }
  const dNow = Math.hypot(D.mx - hx, D.my - hy) / (rad * 1.5);
  return clamp(Math.max(best, (1 - clamp(dNow)) * 0.75));
};

export default function Tags({ live, found, onFound }: { live: boolean; found: ModId[]; onFound: (id: ModId) => void }) {
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const hold = useRef(MODULES.map(() => ({ t: 0, down: false })));

  useEffect(() => {
    if (!live) return;
    return subscribe((dt) => {
      MODULES.forEach((m, i) => {
        const el = els.current[i];
        if (!el) return;
        const done = found.includes(m.id);
        const near = D.scene === m.scene && !done ? hotAmount(m) : 0;
        const vis = clamp(near * 1.5 - 0.18);
        const st = hold.current[i];
        if (st.down && vis > 0.35) {
          st.t += (dt * 1000) / HOLD_MS;
          if (st.t >= 1) {
            st.t = 0;
            st.down = false;
            SND.play("blip");
            onFound(m.id);
          }
        } else if (!st.down) st.t = Math.max(0, st.t - dt * 1.6);
        const hx = m.at[0] * innerWidth;
        const hy = m.at[1] * innerHeight;
        el.style.transform = `translate3d(${hx}px, ${hy + 26}px, 0) translate(-50%, 0) rotate(${(vis - 0.5) * 1.6}deg)`;
        el.style.opacity = String(done ? 0 : vis);
        el.style.pointerEvents = vis > 0.55 ? "auto" : "none";
        const b = el.querySelector<HTMLElement>(".bar");
        if (b) b.style.width = `${(st.t * 100).toFixed(1)}%`;
      });
    });
  }, [live, found, onFound]);

  return (
    <>
      {MODULES.map((m, i) => (
        <div
          key={m.id}
          ref={(e) => {
            els.current[i] = e;
          }}
          className="m-tag u-mono"
          style={{ color: "#f1e8d0" }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            hold.current[i].down = true;
            SND.play("tape");
          }}
          onPointerUp={(e) => {
            (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
            hold.current[i].down = false;
          }}
          onPointerCancel={() => (hold.current[i].down = false)}
        >
          <span className="flex flex-col items-center justify-center gap-[1px]" style={{ width: "calc(26px*var(--k))", height: "calc(26px*var(--k))", background: "#f1e8d0", color: "#0b0a08" }}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="star" style={{ width: `calc(${Math.round(8 / (m.rarity + 0.4))}px*var(--k))`, height: `calc(${Math.round(8 / (m.rarity + 0.4))}px*var(--k))`, background: i < m.rarity ? "#0b0a08" : "#c3b99d" }} />
            ))}
          </span>
          <span>
            <span style={{ color: "#8f8876" }}>{m.name}</span>
            <br />
            press and hold to discover
          </span>
          <span className="bar" />
        </div>
      ))}
    </>
  );
}
