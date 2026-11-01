import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { CREDIT, D, MODULES, TASKS, type ModId } from "../lib/dream";
import { drawModel } from "../lib/wire";
import { SND } from "../lib/sound";

// The storage: a blurred pane over the dream, the collection as ink-on-paper cards, and the object you picked
// turning slowly in wire on the right, with its note and its rarity. Collected cards are paper; the ones you have
// not bled out of yet are hatched and keep their secret.

const CREAM = "#f1e8d0";
const INK = "#0b0a08";

function Preview({ id, size }: { id: ModId; size: number }) {
  const c = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const loop = () => {
      const cv = c.current;
      if (!cv) return;
      const dpr = Math.min(2, devicePixelRatio || 1);
      if (cv.width !== Math.round(size * dpr)) {
        cv.width = Math.round(size * dpr);
        cv.height = Math.round(size * dpr);
      }
      const ctx = cv.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const rot = (performance.now() - t0) / 2400;
      drawModel(ctx, id, size / 2, size / 2 + size * 0.04, size * 0.72, rot, INK, { alpha: 1, lw: Math.max(0.8, size / 260), tilt: 0.3 + Math.sin(rot * 0.6) * 0.1 });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [id, size]);
  return <canvas ref={c} style={{ width: size, height: size, display: "block" }} />;
}

function Cell({ id, px }: { id: ModId; px: number }) {
  const c = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = c.current;
    if (!cv) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(px * 1.55 * dpr);
    cv.height = Math.round(px * 1.2 * dpr);
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawModel(ctx, id, px * 0.775, px * 0.66, px * 0.74, 0.7, INK, { alpha: 0.95, lw: 1 });
  }, [id, px]);
  return <canvas ref={c} style={{ width: "100%", height: "100%", display: "block" }} />;
}

interface Props {
  open: boolean;
  found: ModId[];
  onClose: () => void;
  onFound: (id: ModId) => void;
}

export default function Storage({ open, found, onClose, onFound }: Props) {
  const [sel, setSel] = useState<ModId>("crow");
  const m = MODULES.find((x) => x.id === sel)!;
  const got = found.includes(m.id);

  useEffect(() => {
    if (!open) return;
    const first = MODULES.find((x) => !found.includes(x.id));
    setSel(first ? first.id : "crow");
  }, [open, found]);

  if (!open) return null;

  return (
    <div id="storage" onClick={onClose}>
      <div
        className="mx-auto flex h-full w-full max-w-[1180px] flex-col gap-[calc(12px*var(--k))] p-[calc(16px*var(--k))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-4" style={{ color: CREAM }}>
          <div className="flex items-center gap-[calc(9px*var(--k))]">
            <span className="u-mono" style={{ color: "#8f8876" }}>
              storage
            </span>
            <span className="u-mono">
              {found.length}/{MODULES.length} modules
            </span>
            <span className="hidden u-mono sm:inline" style={{ color: "#8f8876" }}>
              · {found.length === MODULES.length ? "the crow keeps the pages now" : "hold a tag in the dream to collect"}
            </span>
          </div>
          <button className="btn" type="button" onClick={onClose}>
            <span className="key">
              <i />
              <b>esc</b>
            </span>
            <X size={11} strokeWidth={1.8} />
            <span>close</span>
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-[calc(10px*var(--k))] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* the grid */}
          <div className="grid grid-cols-2 content-start gap-[calc(6px*var(--k))] sm:grid-cols-3">
            {MODULES.map((mod) => {
              const has = found.includes(mod.id);
              return (
                <div
                  key={mod.id}
                  className={`cell ${has ? "got" : ""} ${sel === mod.id ? "sel" : ""}`}
                  style={{ aspectRatio: "1.3" }}
                  onClick={() => {
                    setSel(mod.id);
                    SND.play("ui");
                  }}
                >
                  {has ? (
                    <div className="relative h-full w-full">
                      <Cell id={mod.id} px={Math.min(250, (innerWidth / 3) * 0.72)} />
                      <span className="u-mono absolute left-[calc(10px*var(--k))] bottom-[calc(8px*var(--k))]" style={{ color: INK }}>
                        {mod.name}
                      </span>
                      <span className="u-mono absolute right-[calc(8px*var(--k))] top-[calc(6px*var(--k))] flex gap-[2px]">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className={`star ${i < mod.rarity ? "" : "off"}`} style={{ width: "calc(11px*var(--k))", height: "calc(11px*var(--k))", background: i < mod.rarity ? INK : "#c3b99d" }} />
                        ))}
                      </span>
                    </div>
                  ) : (
                    <span className="u-mono" style={{ color: "#6d6656" }}>
                      · · ·
                      <br />
                      <span style={{ color: "#4f4b40" }}>{mod.place}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* the detail */}
          <div className="flex min-h-0 flex-col justify-between gap-3 overflow-auto scroll-none" style={{ background: "rgba(11,10,8,.82)", color: CREAM, padding: "calc(12px*var(--k))" }}>
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-disp uppercase leading-[0.95]" style={{ fontSize: "calc(10px*var(--k) + 2.1vw)", color: CREAM }}>
                  {m.name}
                </h2>
                <span className="u-mono flex shrink-0 gap-[3px]">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`star ${i < m.rarity ? "" : "off"}`} />
                  ))}
                </span>
              </div>
              <div className="u-mono mt-1" style={{ color: "#8f8876" }}>
                last seen · {m.place} · {got ? m.meta[0].toLowerCase() : "not collected"} · {m.meta[1]}
              </div>
              <div className="mt-[calc(10px*var(--k))] flex gap-[calc(12px*var(--k))]">
                <div className="shrink-0" style={{ background: got ? CREAM : "rgba(241,232,208,.06)", width: "clamp(96px, 13vw, 168px)", height: "clamp(96px, 13vw, 168px)", display: "grid", placeItems: "center" }}>
                  {got ? <Preview id={m.id} size={Math.round(Math.min(168, Math.max(96, innerWidth * 0.11)))} /> : <span className="u-mono" style={{ color: "#4f4b40" }}>no scan yet</span>}
                </div>
                <div className="u-mono leading-[1.9]" style={{ color: got ? CREAM : "#8f8876" }}>
                  {got ? (
                    m.note.map((p, i) => <p key={i} className="mb-2">{p}</p>)
                  ) : (
                    <p>
                      THIS ONE IS STILL HOLDING ITS SHAPE IN THE DARK. FIND IT IN {m.place.toLowerCase()}, BLEED YOUR CURSOR OVER IT, HOLD — and the page will open here.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-[calc(3px*var(--k))]">
                {TASKS.map((t, i) => {
                  const done = (i === 0 && found.length > 0) || (i === 2 && found.length >= MODULES.length) || (i === 1 && D.depth > 0.9);
                  return (
                    <div key={t} className="u-mono flex items-center gap-2" style={{ color: done ? CREAM : "#8f8876" }}>
                      <span className="grid place-items-center" style={{ width: "calc(11px*var(--k))", height: "calc(11px*var(--k))", boxShadow: `inset 0 0 0 1px ${done ? CREAM : "#5a564a"}` }}>
                        {done && <span style={{ width: "calc(5px*var(--k))", height: "calc(5px*var(--k))", background: CREAM }} />}
                      </span>
                      {t}
                    </div>
                  );
                })}
              </div>
              {got ? (
                <div className="btn" style={{ cursor: "default", background: CREAM, color: INK }}>
                  <span className="u-mono">collected</span>
                </div>
              ) : (
                <button
                  className="btn"
                  type="button"
                  style={{ background: "transparent", boxShadow: "inset 0 0 0 1px #3a372e", color: "#8f8876" }}
                  onClick={() => {
                    onFound(m.id);
                    SND.play("blip");
                  }}
                >
                  <span className="key">
                    <i />
                    <b>t</b>
                  </span>
                  <span>take it anyway</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* footer: the attribution, wherever a credit appears on this site */}
        <div className="u-mono flex flex-wrap items-center justify-between gap-2" style={{ color: "#8f8876" }}>
          <span>
            code — <span style={{ color: CREAM }}>{CREDIT}</span>
          </span>
          <span>paper &amp; ink · nine circles · one crow</span>
        </div>
      </div>
    </div>
  );
}
