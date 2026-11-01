import { useCallback, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { EXPERIMENTS } from "../lib/data";
import { STANDALONE_PROJECTS } from "../lib/links";
import { scrollToId } from "../lib/scroll";
import ChapterIntro from "./ChapterIntro";

/** Directory of pairs with a floating preview that chases the pointer. */
export default function IndexSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  const track = useCallback(() => {
    smooth.current.x += (mouse.current.x - smooth.current.x) * 0.12;
    smooth.current.y += (mouse.current.y - smooth.current.y) * 0.12;
    if (previewRef.current) {
      previewRef.current.style.transform = `translate3d(${smooth.current.x}px, ${smooth.current.y}px, 0) translate(-50%, -50%) rotate(3deg)`;
    }
    rafRef.current = requestAnimationFrame(track);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouse.current.x = e.clientX - rect.left;
    mouse.current.y = e.clientY - rect.top;
  };

  return (
    <section
      id="index"
      ref={sectionRef}
      onMouseMove={onMove}
      onMouseEnter={() => {
        cancelAnimationFrame(rafRef.current);
        track();
      }}
      onMouseLeave={() => {
        cancelAnimationFrame(rafRef.current);
        setHovered(null);
      }}
      className="relative border-t border-bone/10 px-5 py-28 md:px-10 md:py-40"
    >
      <ChapterIntro kicker="03 — The index" title="ARCHIVE OF SPARKS" />

      {/* floating preview */}
      <div
        ref={previewRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block"
      >
        <div
          className={`h-72 w-52 overflow-hidden border border-bone/25 bg-coal shadow-[0_30px_80px_rgba(0,0,0,0.7)] transition-all duration-300 ${
            hovered ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        >
          {EXPERIMENTS.map((e) => (
            <img
              key={e.id}
              src={e.output.img}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                hovered === e.id ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </div>

      <ul className="mt-16 md:mt-24">
        {EXPERIMENTS.map((e, i) => (
          <li key={e.id} className="border-t border-bone/10 last:border-b">
            <button
              type="button"
              data-cursor="VIEW"
              onClick={() => scrollToId(e.id)}
              onMouseEnter={() => setHovered(e.id)}
              onMouseLeave={() => setHovered(null)}
              className="group flex w-full items-baseline gap-5 py-5 text-left md:gap-10 md:py-7"
            >
              <span className="font-mono text-[10px] tracking-[0.25em] text-smoke transition-colors duration-300 group-hover:text-signal">
                {e.index}
              </span>
              <span
                className={`font-display uppercase leading-none tracking-tight transition-all duration-500 group-hover:translate-x-3 ${
                  hovered === e.id ? "text-bone" : "text-outline"
                }`}
                style={{ fontSize: "clamp(1.9rem, 5.5vw, 5rem)" }}
              >
                {e.title}
              </span>
              <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.22em] text-smoke md:block">
                {e.tags.join(" / ")}
              </span>
              <span className="hidden font-mono text-[10px] tracking-[0.22em] text-smoke sm:block">
                {e.year}
              </span>
              <ArrowUpRight
                size={18}
                className="shrink-0 text-bone/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-signal"
              />
              <span className="sr-only">Jump to experiment {i + 1}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-right font-mono text-[10px] uppercase tracking-[0.25em] text-smoke">
        004 pairs — more in the pipeline
        <span className="ml-2 inline-block h-1.5 w-1.5 animate-blink rounded-full bg-signal align-middle" />
      </p>

      <div className="mt-24 border-t border-bone/10 pt-12 md:mt-36">
        <h3 className="font-display text-4xl uppercase text-bone md:text-6xl">
          Standalone projects
        </h3>
        <p className="mt-3 max-w-xl font-sans text-sm text-bone/70">
          Separate sites from the kdmirah lab. Each opens its own deployed project.
        </p>
        <ul className="mt-10 border-t border-bone/10">
          {STANDALONE_PROJECTS.map((project) => (
            <li className="border-b border-bone/10" key={project.index}>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 py-6 text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal md:gap-10"
              >
                <span className="font-mono text-xs text-signal">{project.index}</span>
                <span className="font-display text-2xl uppercase group-hover:text-signal md:text-4xl">{project.title}</span>
                <span className="sr-only">(opens in a new tab)</span>
                <ArrowUpRight size={20} aria-hidden className="ml-auto shrink-0" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
