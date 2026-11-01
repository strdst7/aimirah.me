import { useCallback, useEffect, useRef, useState } from "react";
import Loader from "./components/Loader";
import Titles from "./components/Titles";
import Hud, { type HudHandle } from "./components/Hud";
import Cursor, { type CursorHandle } from "./components/Cursor";
import { createDream, CHAPTERS, type Dream } from "./lib/scene";
import { createSound, type SoundEngine } from "./lib/sound";

/* ————————————————————————————————————————————————————————————
   NOCTURNAL — a lucid dream you scroll through.
   Loader (the room before sleep) → one continuous camera path:
   sky, lake, crow, under the surface, the floor of the dream,
   the pull of the moon, waking. Or DREAM AGAIN.
   built by aimirah - kdmirah lab
———————————————————————————————————————————————————————————— */

const SCROLL_SPAN = 5200; // px of wheel for one full dream — heavy and slow

export default function App() {
  const [phase, setPhase] = useState<"loading" | "dream">("loading");
  const [chapter, setChapter] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [webglFailed, setWebglFailed] = useState<string | null>(null);
  const [warm, setWarm] = useState<Promise<void> | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dreamRef = useRef<Dream | null>(null);
  const soundRef = useRef<SoundEngine | null>(null);
  const progressRef = useRef(0);
  const targetRef = useRef(0);
  const hudRef = useRef<HudHandle>(null);
  const cursorRef = useRef<CursorHandle | null>(null);
  const blinkRef = useRef<HTMLDivElement>(null);
  const enteredRef = useRef(false);

  const finePointer =
    typeof window !== "undefined" && typeof matchMedia !== "undefined" && matchMedia("(pointer: fine)").matches;

  /* ————— build the dream once ————— */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sound = createSound();
    soundRef.current = sound;
    try {
      sound.setMuted((() => {
        try { return sessionStorage.getItem("nocturnal-snd") !== "1"; } catch { return true; }
      })());
    } catch { /* private mode */ }

    let dream: Dream;
    try {
      dream = createDream(canvas, {
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
        events: {
          onChapter(i) {
            setChapter(i);
            hudRef.current?.setChapterLabel(i);
            // crossing the waterline, either way, has a sound
            const prev = chapterRefPrev(i);
            if ((i >= 2 && prev < 2) || (i < 2 && prev >= 2)) {
              sound.whoosh(i >= 2);
            }
          },
          onProgress(p) {
            progressRef.current = p;
            hudRef.current?.setDepthText(p);
          },
          onDepth(under, surface) {
            sound.setDepth(under);
            sound.setSurface(surface);
          },
          onCrowHover(h) {
            cursorRef.current?.setLabel(h ? "click. it remembers sound." : null);
            canvas.style.cursor = h ? "pointer" : "";
          },
          onCrowClick() {
            sound.caw();
          },
          onReady() {
            /* first frame rendered — the loader lifts its ceiling */
          },
        },
      });
    } catch (err) {
      setWebglFailed(err instanceof Error ? err.message : String(err));
      setWarm(Promise.resolve()); // don't strand the loader if the dream can't render
      return;
    }
    dreamRef.current = dream;
    setWarm(dream.warm);

    const onVis = () => dream.pause(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      dream.dispose();
      dreamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // track previous chapter without stale closures
  const prevChapter = useRef(0);
  function chapterRefPrev(next: number) {
    const v = prevChapter.current;
    prevChapter.current = next;
    return v;
  }

  /* ————— virtual scroll: wheel, touch, keys ————— */
  useEffect(() => {
    if (phase !== "dream") return;
    const push = (d: number, mul = 1) => {
      targetRef.current = Math.min(1, Math.max(0, targetRef.current + (d * mul) / SCROLL_SPAN));
      dreamRef.current?.setTarget(targetRef.current);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      push(e.deltaY + e.deltaX);
    };
    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY == null) return;
      e.preventDefault();
      const y = e.touches[0].clientY;
      push((touchY - y) * 2.6);
      touchY = y;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        push(e.key === " " ? 640 : 320);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        push(-320);
      }
      if (e.key === "Home") {
        targetRef.current = 0;
        dreamRef.current?.setTarget(0);
      }
      if (e.key === "End") {
        targetRef.current = 1;
        dreamRef.current?.setTarget(1);
      }
      if (e.key === "s" || e.key === "S" || e.key === "m" || e.key === "M") toggleSound();
      if ((e.key === "r" || e.key === "R") && targetRef.current > 0.9) restart();
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, soundOn]);

  /* ————— crow pointer: hover + click ————— */
  useEffect(() => {
    if (phase !== "dream") return;
    let moveT = 0;
    const move = (e: PointerEvent) => {
      const now = performance.now();
      if (now - moveT < 50) return;
      moveT = now;
      dreamRef.current?.hitCrow((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    };
    const click = (e: PointerEvent) => {
      const hit = dreamRef.current?.hitCrow((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
      if (hit) dreamRef.current?.scareCrow();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", click);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", click);
    };
  }, [phase]);

  /* ————— the blink — every so often the eyelids close ————— */
  useEffect(() => {
    if (phase !== "dream") return;
    let alive = true;
    const loop = () => {
      if (!alive) return;
      setTimeout(() => {
        if (!alive) return;
        const el = blinkRef.current;
        if (el && !document.hidden) {
          el.animate(
            [{ opacity: 0 }, { opacity: 0.8, offset: 0.45 }, { opacity: 0 }],
            { duration: 480 + Math.random() * 120, easing: "ease-in-out" }
          );
        }
        loop();
      }, 6400 + Math.random() * 7200);
    };
    loop();
    return () => {
      alive = false;
    };
  }, [phase]);

  /* ————— actions ————— */
  const enter = useCallback((on: boolean) => {
    setSoundOn(on);
    const s = soundRef.current;
    if (s) {
      s.setMuted(!on);
      if (on) s.resume();
    }
    try { sessionStorage.setItem("nocturnal-snd", on ? "1" : "0"); } catch { /* fine */ }
    setPhase("dream");
    enteredRef.current = true;
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      const next = !v;
      soundRef.current?.setMuted(!next);
      if (next) soundRef.current?.resume();
      try { sessionStorage.setItem("nocturnal-snd", next ? "1" : "0"); } catch { /* fine */ }
      if (next) soundRef.current?.blip(720);
      return next;
    });
  }, []);

  const restart = useCallback(() => {
    soundRef.current?.blip(340);
    targetRef.current = 0;
    dreamRef.current?.setTarget(0);
  }, []);

  const blip = useCallback(() => soundRef.current?.blip(880), []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#030302" }}>
      {/* the dream itself */}
      <canvas ref={canvasRef} className="fixed inset-0 block h-full w-full" />

      {/* atmosphere overlays */}
      <div className="fx-vignette" />
      <div className="fx-vignette-breath" />
      <div ref={blinkRef} className="fx-blink" />
      <div className="fx-grain" />

      {/* the whispered chapters */}
      <Titles index={chapter} progressRef={progressRef} entered={phase === "dream"} />

      {/* chrome */}
      <Hud
        ref={hudRef}
        visible={phase === "dream"}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onRestart={restart}
        onBlip={blip}
      />

      {/* webgl refused to dream */}
      {webglFailed && (
        <pre
          className="fixed bottom-4 left-4 z-[70] max-w-[80vw] whitespace-pre-wrap text-xs"
          style={{ color: "#ffb4a8", fontFamily: "ui-monospace, monospace" }}
        >
          {`the dream wouldn't render:\n${webglFailed}`}
        </pre>
      )}

      {/* the room before sleep */}
      <Loader warm={warm} onEnter={enter} onPreviewBlip={blip} />

      {/* the cursor */}
      <Cursor enabled={finePointer && phase === "dream"} handleRef={cursorRef} />

      {/* chapter index readout for screen readers */}
      <div className="sr-only" aria-live="polite">
        {CHAPTERS[chapter].label}
      </div>
    </div>
  );
}
