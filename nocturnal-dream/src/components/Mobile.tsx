import { useEffect, useRef } from "react";
import { D, layoutVars } from "../lib/dream";
import { startLoop, subscribe } from "../lib/engine";
import { createPainter } from "../lib/painter";
import { Sticker } from "./Sticker";
import { SND } from "../lib/sound";

// The phone page. The dream itself is built for a cursor and a wheel, so a small screen gets the poster instead:
// the lake, drifting on its own, the title stuck on it, and one bar of facts at the bottom — plus a way in.

export default function Mobile({ onEnter }: { onEnter: () => void }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [w, h] = [typeof innerWidth !== "undefined" ? innerWidth : 390, typeof innerHeight !== "undefined" ? innerHeight : 780];

  useEffect(() => {
    layoutVars();
    startLoop();
    const p = cvs.current ? createPainter(cvs.current) : null;
    const off = subscribe((dt) => {
      // an idle drift between the lake and the pier, so the poster is never a still
      D.target = 0.055 + 0.05 * (0.5 + 0.5 * Math.sin(D.t * 0.18));
      D.depth += (D.target - D.depth) * Math.min(1, dt * 2);
      D.px = Math.sin(D.t * 0.22) * 0.4;
      D.py = Math.cos(D.t * 0.17) * 0.25;
      D.mix = 0;
      D.flow = 0.03;
      p?.render();
    });
    addEventListener("resize", layoutVars);
    return () => {
      off();
      p?.dispose();
      removeEventListener("resize", layoutVars);
    };
  }, []);

  return (
    <div id="mobile">
      <canvas ref={cvs} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", objectPosition: "50% 100%" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(205,196,169,.55), transparent 26% 62%, rgba(205,196,169,.7))" }} />

      <div className="absolute left-0 right-0" style={{ top: "max(18px, env(safe-area-inset-top))", display: "flex", justifyContent: "center" }}>
        <Sticker lines={["do you", "remember your", "last dream?"]} size={0.44} show seed={5} style={{ position: "relative", left: 0, top: 0, transform: "none" }} />
      </div>

      <div className="absolute left-0 right-0 flex flex-col items-center gap-3" style={{ bottom: "calc(74px + env(safe-area-inset-bottom))" }}>
        <div className="u-mono" style={{ color: "#0b0a08", opacity: 0.66, textAlign: "center", maxWidth: "76vw", lineHeight: 1.8 }}>
          this dream is built for a cursor
          <br />
          and a scroll wheel
        </div>
        <button className="btn" type="button" style={{ background: "#0a0908" }} onClick={onEnter}>
          <span className="key">
            <i />
            <b>go</b>
          </span>
          <span>try it anyway</span>
        </button>
      </div>

      <div
        className="absolute flex items-center"
        style={{ left: 10, right: 10, bottom: "calc(10px + env(safe-area-inset-bottom))", gap: 5, padding: "3px 6px 3px 3px", background: "#0a0908", border: "1px solid #0a0908" }}
      >
        <span className="grid flex-none place-items-center overflow-hidden" style={{ width: 32, height: 32, border: "1px solid #ccc3a9", background: "#fdf4df" }}>
          <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden>
            <path d="M5 22c0-6 4.4-10.4 9.6-10.4 3 0 4.8 1.2 6.2 3L28 11l-2 4.6c.6 4.4-3 10.6-9 10.6-5.4 0-12-2-12-4.2z" fill="#0b0a08" />
            <circle cx="15.6" cy="15.4" r="1.2" fill="#fdf4df" />
          </svg>
        </span>
        <span className="u-mono flex min-w-0 flex-col gap-[5px] uppercase" style={{ color: "#fdf4df", fontSize: 10, lineHeight: 1, gap: 5 }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>nocturnal — a lucid dream in one page</span>
          <span style={{ opacity: 0.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {Math.round(w)}×{Math.round(h)} · scroll deeper, look closer · code — aimirah - kdmirah lab
          </span>
        </span>
        <button
          className="btn"
          type="button"
          style={{ marginLeft: "auto", background: "transparent", padding: "6px 7px" }}
          onClick={() => {
            SND.setMuted(false);
            SND.play("caw");
          }}
          aria-label="make the dream caw"
        >
          <span className="key">
            <i />
            <b>caw</b>
          </span>
        </button>
      </div>
    </div>
  );
}
