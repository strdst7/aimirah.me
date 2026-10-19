import { useCallback, useEffect, useState } from "react";
import Starfield from "./components/Starfield";
import Cursor from "./components/Cursor";
import Preloader from "./components/Preloader";
import Nav, { MenuOverlay, useMenu } from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Manifesto from "./components/Manifesto";
import ChapterIntro from "./components/ChapterIntro";
import ExperimentSection from "./components/ExperimentSection";
import IndexSection from "./components/IndexSection";
import Footer from "./components/Footer";
import { EXPERIMENTS } from "./lib/data";
import { initLenis, startScroll, stopScroll } from "./lib/scroll";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

export default function App() {
  const [ready, setReady] = useState(false);
  const [menuOpen, toggleMenu, navigate] = useMenu();

  useEffect(() => {
    initLenis();
    stopScroll();
  }, []);

  const handleLoaded = useCallback(() => {
    setReady(true);
    startScroll();
  }, []);

  useEffect(() => {
    if (menuOpen) stopScroll();
    else if (ready) startScroll();
  }, [menuOpen, ready]);

  return (
    <div className="relative min-h-screen bg-ink text-bone">
      <Starfield />
      <Cursor />
      <Preloader onDone={handleLoaded} />
      <Nav open={menuOpen} onToggle={toggleMenu} ready={ready} />
      <MenuOverlay open={menuOpen} onNavigate={navigate} />

      <main className="relative z-10">
        <Hero active={ready} />

        <Marquee
          items={[
            "Inspiration",
            "Output",
            "kdmirah everywhere",
            "Drag the seam",
          ]}
        />

        <Manifesto />

        <div id="lab" className="pt-10 md:pt-16">
          <ChapterIntro kicker="02 — The experiments" title="FOUR SPARKS, FOUR MUTATIONS" />
          <p className="mt-4 max-w-md px-5 font-sans text-sm leading-relaxed text-bone/60 md:px-10">
            Each pair places a raw source beside the work it provoked. Pull the
            seam left and right — the distance between the two images is the
            whole subject of this lab.
          </p>
          <div className="mt-10">
            {EXPERIMENTS.map((exp) => (
              <ExperimentSection key={exp.id} exp={exp} />
            ))}
          </div>
        </div>

        <Marquee
          reverse
          items={["Source", "Result", "The distance", "Is the subject"]}
        />

        <IndexSection />
      </main>

      <div className="relative z-10">
        <Marquee
          items={["See", "Make", "Repeat", "kdmirah"]}
          className="border-b-0"
        />
        <Footer />
      </div>

      {/* film grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[105] opacity-[0.06] mix-blend-soft-light"
        style={{ backgroundImage: GRAIN }}
      />
    </div>
  );
}
