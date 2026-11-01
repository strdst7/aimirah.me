import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { CREDIT, D, MODULES, SCENES, clamp, layoutVars, loadSave, writeSave, type ModId } from "./lib/dream";
import { bindInputs, startLoop, subscribe } from "./lib/engine";
import { createPainter } from "./lib/painter";
import { SND } from "./lib/sound";
import Loader from "./components/Loader";
import Titles from "./components/Titles";
import Hud from "./components/Hud";
import Tags from "./components/Tags";
import Storage from "./components/Storage";
import Mobile from "./components/Mobile";
import { Sticker } from "./components/Sticker";

// ---------------------------------------------------------------- NOCTURNAL — a lucid dream in one page
// Scroll is depth: eight scenes painted over each other on one canvas, the notes stuck on with tape, six objects
// hiding modules under the ink of your cursor, and a sound built out of nothing but oscillators.

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

export default function App() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [found, setFound] = useState<ModId[]>([]);
  const [storageOpen, setStorageOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [note, setNote] = useState<ModId | null>(null);
  const [won, setWon] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  const isMobile = useMemo(
    () =>
      (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 700) ||
      /Android.*Mobile|iPhone|iPad|iPod/i.test(navigator.userAgent),
    [],
  );
  const [phone, setPhone] = useState(false);

  useEffect(() => {
    layoutVars();
    setPhone(isMobile && !new URLSearchParams(location.search).has("desktop"));
    try {
      const s = loadSave();
      if (s.found.length) setFound(s.found);
      if (s.dream) D.depth = D.target = 0.001;
    } catch {
      /* ignore */
    }
  }, [isMobile]);

  // ---- the loop: one painter, one store, everything else reads from them
  const kept = useRef(0);
  kept.current = found.length;
  useEffect(() => {
    if (phone) return;
    startLoop();
    const p = canvas.current ? createPainter(canvas.current) : null;
    const offs = [
      p ? subscribe(() => p!.render()) : () => {},
      subscribe((dt) => {
        const want = kept.current >= MODULES.length ? 1 : 0;
        D.lift += (want - D.lift) * Math.min(1, dt * 1.4);
        const end = D.depth > 0.965;
        setAtEnd((v) => (v === end ? v : end));
      }),
    ];
    return () => {
      for (const o of offs) o();
      p?.dispose();
    };
  }, [phone]);

  // ---- the page only takes input once the loader has burnt away
  useEffect(() => {
    if (phone || !live) return;
    return bindInputs(root.current!);
  }, [phone, live]);

  useEffect(() => {
    writeSave({ found, dream: found.length >= MODULES.length || D.depth > 0.96 });
  }, [found]);

  const markFound = useCallback((id: ModId) => {
    setFound((f) => {
      if (f.includes(id)) return f;
      const next = [...f, id];
      if (next.length === MODULES.length) {
        setWon(true);
        SND.play("win");
      } else SND.play("blip");
      setNote(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 5200);
    return () => clearTimeout(t);
  }, [note]);

  const toggleSound = useCallback(() => {
    const next = !SND.muted;
    SND.setMuted(next);
    setMuted(next);
    if (!next) SND.play("tape");
  }, []);

  // ---- the keyboard of the dream
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!live || phone) return;
      const k = e.key.toLowerCase();
      if (k === "f") setStorageOpen((v) => !v);
      else if (k === "r") D.target = 0;
      else if (k === "escape") setStorageOpen(false);
      else if (k === "s") toggleSound();
      else if (k === "t") {
        const first = MODULES.find((m) => !found.includes(m.id));
        if (first && storageOpen) markFound(first.id);
      } else if (k === "arrowleft" || k === "arrowright") {
        const i = clamp(D.scene + (k === "arrowright" ? 1 : -1), 0, SCENES.length - 1);
        D.target = clamp(SCENES[i].a + (SCENES[i].b - SCENES[i].a) * 0.5);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [live, phone, toggleSound, found, markFound, storageOpen]);

  // the crow caws now and then, when the lake is in view
  useEffect(() => {
    if (phone || !live || muted) return;
    let raf = 0;
    let next = performance.now() + 6000;
    const tick = () => {
      if (performance.now() > next) {
        next = performance.now() + 9000 + Math.random() * 14000;
        if (D.scene < 2) SND.play("caw");
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phone, live, muted]);

  const grain = useMemo(() => ({ ["--noise" as string]: NOISE }), []);

  if (phone) return <Mobile onEnter={() => setPhone(false)} />;

  return (
    <div ref={root} id="site" className="fixed inset-0 overflow-hidden" style={{ background: "#020203", ...grain }}>
      <canvas ref={canvas} id="gl" />

      <Titles live={live} />
      {live && <Tags live={live} found={found} onFound={markFound} />}
      {live && <Hud live={live} found={found} storageOpen={storageOpen} onOpenStorage={() => setStorageOpen((v) => !v)} muted={muted} onToggleSound={toggleSound} />}

      {/* the notification of a discovery */}
      <div className={`m-note u-mono ${note ? "on" : ""}`} onClick={() => setStorageOpen(true)}>
        <span className="grid place-items-center" style={{ width: "calc(26px*var(--k))", height: "calc(26px*var(--k))", background: "#f1e8d0", color: "#0b0a08" }}>
          <Check size={11} strokeWidth={2.4} />
        </span>
        <span>
          module has been found
          <br />
          <span style={{ color: "#8f8876" }}>press f to open storage</span>
        </span>
      </div>

      {/* the last card, before you wake up */}
      {atEnd && (
        <div className="pointer-events-none fixed inset-0 z-[7] flex flex-col items-center justify-center gap-[calc(14px*var(--k))]">
          <Sticker lines={["you made it to the bottom", "of the dream"]} size={0.5} show seed={9} style={{ position: "relative", left: 0, top: 0, transform: "none" }} />
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-[calc(6px*var(--k))]">
            <button className="btn" type="button" onClick={() => (D.target = 0)}>
              <span className="key">
                <i />
                <b>r</b>
              </span>
              <span>fall in again</span>
            </button>
            <button className="btn" type="button" onClick={() => setStorageOpen(true)}>
              <span className="key">
                <i />
                <b>f</b>
              </span>
              <span>
                what you collected — {found.length}/{MODULES.length}
              </span>
            </button>
            <button className="btn" type="button" onClick={() => (D.target = clamp(D.target - 0.4))}>
              <span className="key">
                <i />
                <b>←</b>
              </span>
              <span>not yet</span>
            </button>
          </div>
          {won && (
            <div className="u-mono" style={{ color: "#0b0a08", background: "#f2c12e", padding: "calc(5px*var(--k)) calc(9px*var(--k))" }}>
              every page kept — the crow lets you keep this one
            </div>
          )}
        </div>
      )}

      {/* the screen pass: grain, scanlines, the print that never quite lined up */}
      <div id="fx-grain" style={grain} />
      <div id="fx-scan" />
      <div id="fx-vig" />

      {storageOpen && <Storage open={storageOpen} found={found} onClose={() => setStorageOpen(false)} onFound={markFound} />}

      {/* the attribution, kept where the reference keeps its own */}
      <div className="u-mono pointer-events-none fixed bottom-[calc(34px*var(--k))] left-[calc(14px*var(--k))] z-[10]" style={{ color: "rgba(203,194,168,.34)" }}>
        code — <span style={{ color: "rgba(241,232,208,.6)" }}>{CREDIT}</span>
      </div>

      {loading && (
        <Loader
          onDone={() => {
            setLoading(false);
            setLive(true);
            setMuted(SND.muted);
          }}
        />
      )}
    </div>
  );
}
