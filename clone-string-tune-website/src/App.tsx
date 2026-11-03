import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { LenisProvider } from "./lib/ui";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Techniques from "./components/Techniques";
import Masonry from "./components/Masonry";
import WhoItsFor from "./components/WhoItsFor";
import Clarity from "./components/Clarity";
import Footer from "./components/Footer";

/* ------------------------------------------------------------------ */
/*  preloader                                                          */
/* ------------------------------------------------------------------ */
function Preloader({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);
  const [leave, setLeave] = useState(false);
  // Keep the latest callback in a ref so the timer effect can run once,
  // without a stale-closure suppression comment (CONCERNS.md #37).
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let v = 0;
    const iv = setInterval(() => {
      v += Math.max(1, Math.round((100 - v) * 0.09 + Math.random() * 3));
      if (v >= 100) {
        v = 100;
        clearInterval(iv);
        setTimeout(() => {
          setLeave(true);
          onDoneRef.current();
        }, 260);
      }
      setN(v);
    }, 40);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[300] grid place-items-center bg-[var(--c-black)]"
      style={{
        transform: leave ? "translateY(-100%)" : "translateY(0)",
        transition: "transform .65s var(--f-cubic-in)",
      }}
      aria-hidden
    >
      <div className="flex flex-col items-center gap-[1rem]">
        <span className="grid h-[2.1rem] w-[2.1rem] place-items-center rounded-[.45rem] bg-[var(--c-red)]">
          <svg viewBox="0 0 24 24" className="h-[1.2rem] w-[1.2rem]" fill="#fff" aria-hidden>
            <path d="M4.5 19V5.5L12 15l7.5-9.5V19h-3v-7.6L12 17.6 7.5 11.4V19h-3Z" />
          </svg>
        </span>
        <p className="fsi-mm up text-[var(--c-purple)]">
          mi4inc.com
        </p>
        <p className="sans fsi-h4 tabular-nums text-[var(--c-white)]">
          {String(n).padStart(3, "0")}
        </p>
      </div>
      <span
        className="absolute bottom-[var(--h4)] left-1/2 h-px w-[10rem] -translate-x-1/2 bg-[var(--c-grey-dark)]"
        style={{
          transform: `translateX(-50%) scaleX(${n / 100})`,
          transformOrigin: "50% 50%",
          background: "var(--c-red)",
          transition: "transform .2s var(--f-cubic)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ambient cursor                                                     */
/* ------------------------------------------------------------------ */
function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const cur = useRef({ x: -100, y: -100 });
  const [hot, setHot] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    setEnabled(fine);
    if (!fine) return;
    const move = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const t = e.target as HTMLElement | null;
      setHot(!!t?.closest?.("[data-cursor], a, button"));
    };
    window.addEventListener("pointermove", move, { passive: true });
    let raf = 0;
    const tick = () => {
      cur.current.x += (pos.current.x - cur.current.x) * 0.16;
      cur.current.y += (pos.current.y - cur.current.y) * 0.16;
      if (ring.current) {
        ring.current.style.transform = `translate(${cur.current.x}px, ${cur.current.y}px) translate(-50%,-50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div
      ref={ring}
      className="pointer-events-none fixed left-0 top-0 z-[210] rounded-full border transition-[width,height,background-color,border-color] duration-300"
      style={{
        width: hot ? "3.4rem" : "1.1rem",
        height: hot ? "3.4rem" : "1.1rem",
        borderColor: hot ? "var(--c-red)" : "rgba(255,255,255,.5)",
        backgroundColor: hot ? "rgba(255,79,54,.08)" : "transparent",
        transitionTimingFunction: "var(--f-bounce)",
      }}
      aria-hidden
    />
  );
}

/* ------------------------------------------------------------------ */
/*  app                                                                */
/* ------------------------------------------------------------------ */
export default function App() {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const l = new Lenis({
      duration: 1.12,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    setLenis(l);
    (window as unknown as { __lenis: Lenis }).__lenis = l;
    let raf = 0;
    const loop = (time: number) => {
      l.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = loaded ? "" : "hidden";
    if (loaded) lenis?.start();
    else lenis?.stop();
  }, [loaded, lenis]);

  return (
    <LenisProvider value={lenis}>
      {!loaded && <Preloader onDone={() => setLoaded(true)} />}
      <Cursor />
      <Header />
      <main id="top">
        <Hero />
        <Techniques />
        <Masonry />
        <WhoItsFor />
        <Clarity />
        <Footer />
      </main>
    </LenisProvider>
  );
}
