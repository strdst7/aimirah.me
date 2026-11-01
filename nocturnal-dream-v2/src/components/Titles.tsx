import { useEffect, useRef } from "react";

/* The stickers of the dream — graffiti shouted into the dark, lowercase
   mono whispered underneath. Each chapter enters, drifts with your scroll,
   and dissolves. All motion lives on this ref-driven layer: React renders
   once per chapter, physics runs every frame. */

export interface ChapterTitle {
  sticker: string;
  tilt: string;
  sub: string[];
  hint?: string;
  align: "left" | "right" | "center";
  size: number; // vw clamp base
}

export const TITLES: ChapterTitle[] = [
  {
    sticker: "NOCTURNAL",
    tilt: "-2deg",
    sub: ["do you remember your last dream?", "wake up. you're already in it."],
    hint: "scroll to fall asleep",
    align: "center",
    size: 11,
  },
  {
    sticker: "THE LAKE REMEMBERS YOU",
    tilt: "2deg",
    sub: ["someone stayed behind to watch the water.", "it has been waiting for you."],
    hint: "click the crow",
    align: "left",
    size: 8.5,
  },
  {
    sticker: "DON'T HOLD YOUR BREATH",
    tilt: "-2.6deg",
    sub: ["the surface is only a rumor from here.", "keep scrolling. let go."],
    align: "right",
    size: 9,
  },
  {
    sticker: "DREAMS HAVE A FLOOR",
    tilt: "1.6deg",
    sub: ["down here the light forgets where it came from.", "these small moons are other people's dreams."],
    align: "left",
    size: 9.5,
  },
  {
    sticker: "THE MOON PULLS YOU BACK",
    tilt: "-1.8deg",
    sub: ["every dream ends mid-sentence.", "rise. don't look down."],
    align: "center",
    size: 8,
  },
  {
    sticker: "WAKE UP, YOU'RE DREAMING",
    tilt: "-2.2deg",
    sub: ["you were never here. neither was the crow."],
    align: "center",
    size: 9,
  },
];

interface Props {
  index: number; // active chapter
  progressRef: { current: number }; // smoothed global progress 0..1
  entered: boolean; // false until the loader lifts
}

const ALIGN: Record<ChapterTitle["align"], React.CSSProperties> = {
  center: { left: "50%", top: "42%", translate: "-50% -50%", textAlign: "center" },
  left: { left: "7vw", top: "38%", textAlign: "left" },
  right: { right: "7vw", top: "40%", textAlign: "right" },
};

export default function Titles({ index, progressRef, entered }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const prevIndex = useRef(-1);
  const bornAt = useRef(0);
  const chapterAt = useRef(0); // global progress where this chapter took over

  // frame loop: drift, parallax, gentle exit as the next chapter nears
  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const el = wrapRef.current;
      if (!el) return;
      const p = progressRef.current;
      const local = Math.max(0, p - chapterAt.current);
      const age = (now - bornAt.current) / 1000;

      // drift upward as you scroll past, breathe in place
      const drift = -local * 260;
      const bob = Math.sin(now / 1400) * 4;
      const sway = Math.sin(now / 1900) * 0.6;
      el.style.transform = `translateY(${drift + bob}px) rotate(${sway}deg)`;

      // dissolve before the next chapter's boundary takes over
      const fade = Math.max(0, Math.min(1, (local - 0.04) / 0.045));
      const introK = Math.min(1, age / 0.9);
      el.style.opacity = String(Math.max(0, introK * (1 - fade)));
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  useEffect(() => {
    if (prevIndex.current !== index) {
      prevIndex.current = index;
      bornAt.current = performance.now();
      chapterAt.current = progressRef.current;
    }
  }, [index, progressRef]);

  if (!entered) return null;
  const t = TITLES[index];
  const style = ALIGN[t.align];
  const coarse = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
  const hint = t.hint && coarse ? t.hint.replace("scroll", "drag") : t.hint;

  return (
    <div className="pointer-events-none fixed inset-0 z-[20]" aria-hidden>
      <div key={index} ref={wrapRef} className="absolute will-change-transform" style={{ ...style, maxWidth: "86vw" }}>
        <h2
          className="sticker tl-in"
          style={
            {
              "--tilt": t.tilt,
              fontSize: `clamp(38px, ${t.size}vw, ${t.size * 19}px)`,
            } as React.CSSProperties
          }
        >
          {t.sticker}
        </h2>
        <div
          className="mz pop-in mt-5 space-y-2"
          style={{ fontSize: "calc(10px * var(--k))", lineHeight: 1.8, color: "var(--bone)", opacity: 0.62, animationDelay: "0.35s" }}
        >
          {t.sub.map((s, i) => (
            <p key={i}>{s}</p>
          ))}
          {hint && (
            <p className="hint-float inline-flex items-center gap-2 pt-2" style={{ color: "var(--bone-hi)", opacity: 0.85 }}>
              <svg width="10" height="14" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
                <path d="M5 1v11M1.5 8.5 5 12l3.5-3.5" />
              </svg>
              {hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
