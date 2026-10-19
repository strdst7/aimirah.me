import { useEffect, useMemo, useRef } from "react";

const TEXT =
  "Every design has an ancestor — a crack in concrete, ink drowning in water, light splitting through fibre. We collect those sparks and trace how raw inspiration mutates into finished work.";

const ACCENTS = new Set(["ancestor", "sparks", "mutates"]);

/** Paragraph that illuminates word-by-word as it travels through the viewport. */
export default function Manifesto() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const words = useMemo(() => TEXT.split(" "), []);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = sectionRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const start = vh * 0.88;
        const end = vh * 0.25;
        const p = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
        const lit = Math.floor(p * 1.15 * words.length);
        wordRefs.current.forEach((w, i) => {
          if (!w) return;
          const on = i < lit;
          w.style.opacity = on ? "1" : "0.12";
          w.style.transform = on ? "translateY(0)" : "translateY(0.18em)";
        });
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [words.length]);

  return (
    <section
      id="idea"
      ref={sectionRef}
      className="relative px-5 py-32 md:px-10 md:py-48"
    >
      <div className="mb-10 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-smoke">
        <span className="text-signal">01 — The idea</span>
        <span className="hidden sm:block">Read as you descend</span>
      </div>

      <p
        className="max-w-6xl font-display uppercase leading-[1.06] tracking-tight text-bone"
        style={{ fontSize: "clamp(1.75rem, 4.6vw, 4.4rem)" }}
      >
        {words.map((word, i) => {
          const clean = word.toLowerCase().replace(/[^a-z]/g, "");
          const accent = ACCENTS.has(clean);
          return (
            <span key={i} className="inline-block">
              <span
                ref={(n) => {
                  wordRefs.current[i] = n;
                }}
                className={`inline-block opacity-[0.12] transition-colors duration-300 ${
                  accent ? "text-signal" : ""
                }`}
                style={{ transition: "opacity 0.35s ease, transform 0.35s ease" }}
              >
                {word}
              </span>
              {i < words.length - 1 ? "\u00A0" : ""}
            </span>
          );
        })}
      </p>

      <div className="mt-14 grid gap-10 border-t border-bone/10 pt-8 md:grid-cols-3">
        {[
          ["Collect", "Hunt the physical world for texture, light and rhythm worth stealing."],
          ["Compare", "Place source and result side by side. Drag the seam. Judge the distance."],
          ["Repeat", "Every output becomes somebody else's input. The loop never closes."],
        ].map(([t, d], i) => (
          <div key={t}>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal">
              0{i + 1} / {t}
            </p>
            <p className="mt-3 max-w-xs font-sans text-sm leading-relaxed text-bone/65">
              {d}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
