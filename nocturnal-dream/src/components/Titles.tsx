import { useEffect, useRef, useState } from "react";
import { D, TITLES, sceneAt } from "../lib/dream";
import { subscribe } from "../lib/engine";
import { Sticker } from "./Sticker";

// The notes of the dream, stuck on with tape: one card per scene. It peels on a beat after the world arrives and
// peels off before the world leaves, so the paper always feels like it is lying in the room with you.

const POS: Record<string, React.CSSProperties> = {
  top: { left: "50%", top: "7.5%", transform: "translateX(-50%)", alignItems: "center" },
  center: { left: "50%", top: "50%", transform: "translate(-50%,-50%)", alignItems: "center" },
  "bottom-left": { left: "5%", bottom: "15%", alignItems: "flex-start" },
  bottom: { left: "50%", bottom: "9%", transform: "translateX(-50%)", alignItems: "center" },
  lower: { left: "50%", bottom: "23%", transform: "translateX(-50%)", alignItems: "center" },
  upper: { left: "50%", top: "16%", transform: "translateX(-50%)", alignItems: "center" },
};

export default function Titles({ live }: { live: boolean }) {
  const [shown, setShown] = useState(-1);
  const lastShown = useRef(-2);

  useEffect(() => {
    if (!live) {
      lastShown.current = -2;
      setShown(-1);
      return;
    }
    return subscribe(() => {
      const { i, local } = sceneAt(D.depth);
      const first = i === 0;
      const last = i === TITLES.length - 1;
      const on = (first || local > 0.1) && (last || local < 0.93);
      const want = on ? i : -1;
      if (want !== lastShown.current) {
        lastShown.current = want;
        setShown(want);
      }
    });
  }, [live]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[4]">
      {TITLES.map((t, i) => (
        <Sticker
          key={i}
          lines={t.lines}
          size={t.size}
          show={shown === i}
          seed={i + 1}
          align={t.pos === "bottom-left" ? "left" : "center"}
          style={POS[t.pos]}
        />
      ))}
    </div>
  );
}
