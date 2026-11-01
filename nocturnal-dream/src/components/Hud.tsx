import { useEffect, useRef, useState } from "react";
import { Archive, Volume2, VolumeX, Keyboard, X } from "lucide-react";
import { CREDIT, D, MODULES, SCENES, TASKS, clamp, type ModId } from "../lib/dream";
import { gotoScene, subscribe } from "../lib/engine";

// The chrome of the dream: the two buttons on the top left, the axes of the cursor on the bottom corners, the
// chapter rail you can jump along, and a tag that follows the pointer the way the reference's does.
// Live numbers go straight to the DOM — 60 fps of setState would only make the stickers stutter.

interface Props {
  live: boolean;
  found: ModId[];
  storageOpen: boolean;
  onOpenStorage: () => void;
  muted: boolean;
  onToggleSound: () => void;
}

export default function Hud({ live, found, storageOpen, onOpenStorage, muted, onToggleSound }: Props) {
  const xRef = useRef<HTMLSpanElement>(null);
  const yRef = useRef<HTMLSpanElement>(null);
  const dRef = useRef<HTMLSpanElement>(null);
  const sRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState(0);
  const [credits, setCredits] = useState(false);
  const [touch, setTouch] = useState(false);
  const [wake, setWake] = useState(false);

  useEffect(() => {
    if (!live) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "g") setTouch((v) => !v);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [live]);

  useEffect(() => {
    if (!live) return;
    let tx = 0;
    let ty = 0;
    return subscribe((dt) => {
      const k = 1 - Math.exp(-dt * 12);
      tx += (D_mx() - tx) * k;
      ty += (D_my() - ty) * k;
      if (xRef.current) xRef.current.textContent = (D_nx() * 1000).toFixed(0).padStart(4, "0");
      if (yRef.current) yRef.current.textContent = (D_ny() * 1000).toFixed(0).padStart(4, "0");
      if (dRef.current) dRef.current.textContent = (clamp(D_depth()) * 100).toFixed(1);
      if (hintRef.current) hintRef.current.style.opacity = String(D_depth() < 0.012 ? 0.75 - clamp(D_flowAbs()) * 0.7 : 0);
      if (tagRef.current) {
        tagRef.current.style.transform = `translate3d(${tx + 14}px, ${ty - 10}px, 0) rotate(${clamp(D_flowAbs()) * 3 - 1.5}deg)`;
        const near = D_depth() < 0.05 || muted;
        tagRef.current.style.opacity = near && !storageOpen ? "1" : "0";
      }
      const sc = D_scene();
      if (sc !== scene) setScene(sc);
      const w = D_depth() > 0.965;
      if (w !== wake) setWake(w);
    });
  }, [live, scene, wake, storageOpen, muted]);

  const cur = SCENES[scene];

  return (
    <>
      <div id="reg" aria-hidden>
        <span className="tl" />
        <span className="tr" />
        <span className="bl" />
        <span className="br" />
      </div>

      {/* ---- top left: the storage + the way out */}
      <div className="pointer-events-none fixed left-0 top-0 z-[13] flex flex-col gap-[calc(5px*var(--k))] p-[calc(14px*var(--k))]" style={{ opacity: live ? 1 : 0, transition: "opacity .6s ease" }}>
        <div className="pointer-events-auto flex flex-col gap-[calc(5px*var(--k))] sm:flex-row">
          <button className={`btn ${storageOpen ? "sel" : ""}`} type="button" onClick={onOpenStorage} title="open the storage (F)">
            <span className="key">
              <i />
              <b>F</b>
            </span>
            <span className="flex items-center gap-[calc(5px*var(--k))]">
              <Archive size={11} strokeWidth={1.6} />
              to open storage
            </span>
            <span className="ml-[calc(2px*var(--k))] flex items-center gap-[2px] opacity-70">
              {MODULES.map((m) => (
                <span
                  key={m.id}
                  className="block"
                  style={{
                    width: "calc(4px * var(--k))",
                    height: "calc(4px * var(--k))",
                    background: found.includes(m.id) ? "#f1e8d0" : "#4a463c",
                  }}
                />
              ))}
            </span>
          </button>
          <button className={`btn ${touch ? "sel" : ""}`} type="button" onClick={() => setTouch((v) => !v)} title="who built this dream (G)">
            <span className="key">
              <i />
              <b>G</b>
            </span>
            <span>get in touch</span>
          </button>
        </div>

        {/* the three goals of the hunt */}
        <div className="mt-[calc(6px*var(--k))] flex flex-col gap-[calc(4px*var(--k))]">
          {TASKS.map((t, i) => {
            const done = (i === 0 && found.length > 0) || (i === 1 && D_depth() > 0.9) || (i === 2 && found.length >= MODULES.length);
            return (
              <div key={t} className="u-mono flex items-center gap-[calc(8px*var(--k))]" style={{ color: done ? "#f1e8d0" : "#8f8876" }}>
                <span
                  className="grid place-items-center"
                  style={{
                    width: "calc(11px * var(--k))",
                    height: "calc(11px * var(--k))",
                    boxShadow: `inset 0 0 0 1px ${done ? "#f1e8d0" : "#5a564a"}`,
                  }}
                >
                  {done && <span className="block" style={{ width: "calc(5px*var(--k))", height: "calc(5px*var(--k))", background: "#f1e8d0" }} />}
                </span>
                {t}
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- top right: sound, keys, credit */}
      <div className="fixed right-0 top-0 z-[13] flex items-start gap-[calc(5px*var(--k))] p-[calc(14px*var(--k))]" style={{ opacity: live ? 1 : 0, transition: "opacity .6s ease" }}>
        <button className={`btn ${muted ? "" : "on"}`} type="button" onClick={onToggleSound} title="the sound of the lake (S)">
          <span className="key">
            <i />
            <b>S</b>
          </span>
          {muted ? <VolumeX size={12} strokeWidth={1.7} /> : <Volume2 size={12} strokeWidth={1.7} />}
          <span className="dot" />
          <span>{muted ? "sound off" : "sound on"}</span>
        </button>
        <button className={`btn ${credits ? "sel" : ""}`} type="button" onClick={() => setCredits((c) => !c)} title="the keys of the dream">
          <Keyboard size={12} strokeWidth={1.7} />
          <span>credits</span>
        </button>
      </div>

      {touch && (
        <div className="fixed left-[calc(14px*var(--k))] top-[calc(96px*var(--k))] z-[13] w-[min(88vw,340px)]" style={{ background: "#0b0a08", color: "#f1e8d0" }}>
          <div className="flex items-center justify-between border-b border-[#26241d] px-[calc(9px*var(--k))] py-[calc(6px*var(--k))]">
            <span className="u-mono">the hands behind it</span>
            <button className="pointer-events-auto" onClick={() => setTouch(false)} aria-label="close">
              <X size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-[calc(8px*var(--k))] px-[calc(9px*var(--k))] py-[calc(10px*var(--k))]">
            <div className="font-disp uppercase leading-[0.92]" style={{ fontSize: "clamp(20px, 2.4vw, 34px)" }}>
              aimirah
              <span className="block" style={{ color: "#8f8876", fontSize: "0.44em", letterSpacing: "0.18em" }}>
                kdmirah lab
              </span>
            </div>
            <p className="u-mono leading-[1.9]" style={{ color: "#8f8876" }}>
              a study in paper &amp; ink: one canvas, eight scenes, six things hiding in the dark. say hello if you
              found all six.
            </p>
            <div className="flex flex-wrap gap-[calc(5px*var(--k))]">
              <a className="btn" style={{ background: "#f1e8d0", color: "#0b0a08" }} href="mailto:aimirah@kdmirah.lab">
                <span>write to aimirah</span>
              </a>
              <a className="btn" style={{ background: "#1a1813" }} href="https://kdmirah.lab" target="_blank" rel="noopener noreferrer">
                <span>kdmirah lab</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {credits && (
        <div className="fixed right-[calc(14px*var(--k))] top-[calc(52px*var(--k))] z-[13] w-[min(84vw,330px)]" style={{ background: "#0b0a08", color: "#f1e8d0" }}>
          <div className="flex items-center justify-between border-b border-[#26241d] px-[calc(9px*var(--k))] py-[calc(6px*var(--k))]">
            <span className="u-mono">keys · credits</span>
            <button className="u-mono pointer-events-auto" onClick={() => setCredits(false)} aria-label="close">
              <X size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-[calc(5px*var(--k))] px-[calc(9px*var(--k))] py-[calc(8px*var(--k))]">
            {[
              ["scroll / drag", "deeper into the dream"],
              ["f", "open the storage"],
              ["g", "get in touch"],
              ["s", "sound on / off"],
              ["hold on a tag", "discover a hidden module"],
              ["esc", "leave the storage"],
            ].map(([k, v]) => (
              <div key={k} className="u-mono flex items-center justify-between gap-3">
                <span className="text-[#f1e8d0]">{k}</span>
                <span className="u-mono text-right" style={{ color: "#8f8876" }}>{v}</span>
              </div>
            ))}
            <div className="mt-[calc(6px*var(--k))] border-t border-[#26241d] pt-[calc(7px*var(--k))] u-mono leading-[1.7]">
              <div className="text-[#8f8876]">code</div>
              <div className="text-[11px] text-[#f1e8d0]">{CREDIT}</div>
            </div>
          </div>
        </div>
      )}

      {/* ---- right rail: the chapters you can jump between */}
      <div className="pointer-events-none fixed right-0 top-1/2 z-[12] hidden -translate-y-1/2 flex-col items-end gap-[calc(3px*var(--k))] pr-[calc(10px*var(--k))] lg:flex" style={{ opacity: live ? 1 : 0, transition: "opacity .8s ease" }}>
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className="pointer-events-auto u-mono group flex items-center justify-end gap-[calc(7px*var(--k))]"
            style={{ color: i === scene ? "#f1e8d0" : "#5f5a4e", cursor: "pointer" }}
            onClick={() => gotoScene(i)}
          >
            <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ opacity: i === scene ? 1 : undefined }}>
              {s.n} · {s.place}
            </span>
            <span
              className="block transition-all duration-500"
              style={{ width: `calc(${i === scene ? 26 : 12}px * var(--k))`, height: "1px", background: "currentColor" }}
            />
          </button>
        ))}
      </div>

      {/* ---- bottom corners: the axes of the cursor, and where you got to */}
      <div className="u-mono fixed bottom-[calc(12px*var(--k))] left-[calc(14px*var(--k))] z-[12] flex gap-[calc(10px*var(--k))]" style={{ color: "#8f8876", opacity: live ? 1 : 0, transition: "opacity .6s" }}>
        <span>
          x <span ref={xRef} style={{ color: "#cbc2a8" }}>0000</span>
        </span>
        <span>
          y <span ref={yRef} style={{ color: "#cbc2a8" }}>0000</span>
        </span>
      </div>
      <div className="u-mono fixed bottom-[calc(12px*var(--k))] right-[calc(14px*var(--k))] z-[12] flex items-end gap-[calc(10px*var(--k))]" style={{ color: "#8f8876", opacity: live ? 1 : 0, transition: "opacity .6s" }}>
        <span>
          depth <span ref={dRef} style={{ color: "#cbc2a8" }}>0.0</span>
        </span>
        <span className="text-right">
          <span ref={sRef} style={{ color: "#cbc2a8" }}>
            {cur.n}
          </span>{" "}
          · {wake ? "wake up" : cur.place}
        </span>
      </div>

      {/* ---- the scroll hint and the tag that trails the cursor */}
      <div ref={hintRef} className="u-mono pointer-events-none fixed bottom-[calc(26px*var(--k))] left-1/2 z-[11] -translate-x-1/2 tracking-[0.3em]" style={{ opacity: 0, transition: "opacity .5s ease", color: "#cbc2a8" }}>
        scroll
      </div>
      <div ref={tagRef} className="u-mono pointer-events-none fixed left-0 top-0 z-[11] whitespace-nowrap" style={{ background: "#030302", color: "#cbc2a8", padding: "calc(4px*var(--k)) calc(6px*var(--k))", boxShadow: "inset 0 0 0 1px rgba(203,194,168,.18)", opacity: 0, transition: "opacity .4s ease" }}>
        {muted ? "click — to enable sound" : "scroll to wake up"}
      </div>
    </>
  );
}

// ---- the live reads (small helpers keep the loop allocation-free)
const D_mx = () => (D.mx < 0 ? innerWidth / 2 : D.mx);
const D_my = () => (D.my < 0 ? innerHeight / 2 : D.my);
const D_nx = () => clamp(D.mx / Math.max(1, innerWidth), 0, 1);
const D_ny = () => clamp(D.my / Math.max(1, innerHeight), 0, 1);
const D_depth = () => D.depth;
const D_scene = () => D.scene;
const D_flowAbs = () => D.flow;
