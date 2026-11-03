import { useRef } from "react";
import { ArrowUp } from "lucide-react";
import {
  clamp,
  CompassLines,
  countChars,
  Reveal,
  Star12,
  useSectionProgress,
} from "../lib/ui";
const techniqueImg = "/images/technique.jpg";
const aikaSprite = "/images/aika.webp";
const ojiSprite = "/images/oji.webp";
const flashUrl = "/images/flash.webp";

/* ------------------------------------------------------------------ */
/*  giant word whose chars fill in with scroll progress                */
/* ------------------------------------------------------------------ */
export function GiantWord({
  text,
  from = 0.1,
  to = 0.75,
  className = "",
  redSub,
}: {
  text: string;
  from?: number;
  to?: number;
  className?: string;
  redSub?: number[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const p = useSectionProgress(ref, "through");
  const n = countChars(text);
  const lp = clamp((p - from) / (to - from));
  let i = 0;
  return (
    <div
      ref={ref}
      className={`fsi-lrg sans whitespace-nowrap ${className}`}
      aria-label={text}
    >
      {text.split(" ").map((word, wi, arr) => (
        <span key={wi}>
          <span className="sp-word">
            {word.split("").map((c, ci) => {
              const idx = i++;
              const lit = clamp((lp * (n + 3) - idx) / 1.6);
              const isRed = redSub?.includes(idx);
              const col =
                lit >= 1
                  ? isRed
                    ? "var(--c-red)"
                    : "var(--c-white)"
                  : `color-mix(in srgb, var(--c-grey-dark) ${Math.round(
                      (1 - lit) * 100,
                    )}%, ${isRed ? "var(--c-red)" : "var(--c-white)"})`;
              return (
                <span
                  key={ci}
                  className="sp-char"
                  style={{
                    color: col,
                    transform: `translateY(${((1 - Math.min(1, lit * 1.4)) * -0.0).toFixed(3)}em)`,
                  }}
                >
                  {c}
                </span>
              );
            })}
          </span>
          {wi < arr.length - 1 && " "}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  statement with two tones                                            */
/* ------------------------------------------------------------------ */
function StatementInline({
  a,
  b,
  className = "",
}: {
  a: string;
  b: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Reveal
        text={a}
        className="sans fsi-h1 text-[var(--c-white)] max-w-[13em]"
        step={15}
      />
      <Reveal
        text={b}
        className="sans fsi-h1 text-[var(--c-purple)] max-w-[13em]"
        step={15}
        delay={260}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  compass / sword composition                                        */
/* ------------------------------------------------------------------ */
function SwordCompass({ progress }: { progress: number }) {
  return (
    <div className="relative mx-auto grid h-[88vh] max-h-[58rem] min-h-[30rem] place-items-center lg:h-[96vh]">
      {/* star field */}
      <Star12
        className="pointer-events-none absolute left-1/2 top-1/2 h-[118%] w-[118%] -translate-x-1/2 -translate-y-1/2 opacity-60"
        stroke="var(--c-grey-dark)"
        style={{
          transform: `translate(-50%,-50%) rotate(${progress * 90}deg)`,
          transition: "transform .1s linear",
        }}
      />
      <Star12
        className="pointer-events-none absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 opacity-40"
        stroke="var(--c-grey-dark)"
        style={{
          transform: `translate(-50%,-50%) rotate(${-45 - progress * 60}deg)`,
        }}
      />

      {/* core */}
      <div className="relative aspect-square w-[min(72vw,44vh,30rem)]">
        <CompassLines
          className="absolute inset-[-16%] opacity-70"
          stroke="var(--c-grey-dark)"
          style={{ transform: `rotate(${progress * 45}deg)` }}
        />
        <div
          className="absolute inset-0 overflow-hidden rounded-full"
          style={{
            transform: `scale(${0.82 + clamp(progress * 1.6) * 0.18})`,
            transition: "transform .2s var(--f-cubic)",
          }}
        >
          <img
            src={techniqueImg}
            alt="Aimirah — the atelier"
            width={768}
            height={768}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            style={{ transform: `scale(1.14) translateY(${(progress - 0.5) * -8}%)` }}
            draggable={false}
          />
        </div>

        {/* compass letters */}
        <span className="absolute left-1/2 top-[-13%] -translate-x-1/2 text-[var(--c-purple)]">
          <ArrowUp className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <span className="mono up fsi-m absolute bottom-[-12%] left-1/2 -translate-x-1/2 text-[var(--c-purple)]">
          S
        </span>
        <span className="mono up fsi-m absolute left-[-9%] top-1/2 -translate-y-1/2 text-[var(--c-purple)]">
          W
        </span>
        <span className="mono up fsi-m absolute right-[-9%] top-1/2 -translate-y-1/2 text-[var(--c-purple)]">
          E
        </span>
      </div>

      {/* Flow / Control flanking */}
      <p className="sans pointer-events-none absolute left-[3%] top-[16%] fsi-h2 text-[var(--c-white)] lg:left-[9%]">
        <Reveal text="Flow" step={26} />
      </p>
      <p className="sans pointer-events-none absolute bottom-[14%] right-[3%] fsi-h2 text-[var(--c-white)] lg:right-[9%] lg:top-auto">
        <Reveal text="Control" step={26} delay={120} />
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  principles                                                         */
/* ------------------------------------------------------------------ */
type Principle = {
  title: string;
  kicker: string;
  body: string;
  pos: string; // grid column placement desktop
  sprites?: boolean;
};

const PRINCIPLES: Principle[] = [
  {
    title: "Modular Architecture",
    kicker: "Craft only what you need.",
    body: "Every piece stands alone — or flows as one.",
    pos: "lg:col-start-1 lg:col-span-5",
  },
  {
    title: "Attribute-Based Integration",
    kicker: "No learning curve. Just a signal.",
    body: "Use simple attributes to activate power directly in HTML.",
    pos: "lg:col-start-8 lg:col-span-6",
  },
  {
    title: "Effortless Initialization",
    kicker: "No ceremony. No bloat.",
    body: "Import, set the tune — done.",
    pos: "lg:col-start-2 lg:col-span-5",
  },
  {
    title: "Wide Range of Effects",
    kicker: "From calm ripples to sharp strikes.",
    body: "Control motion, depth, and presence across scroll, hover, visibility, and more.",
    pos: "lg:col-start-9 lg:col-span-5",
  },
  {
    title: "Performance Oriented",
    kicker: "Fast as a cut. Light as breath.",
    body: "Engineered for speed. Low memory, zero layout shifts, native-friendly.",
    pos: "lg:col-start-3 lg:col-span-10",
    sprites: true,
  },
];

function SpriteStage() {
  return (
    <div className="pointer-events-none relative mt-[var(--h6)] h-[7rem] w-full overflow-hidden md:h-[9rem]">
      <img
        src={flashUrl}
        alt=""
        aria-hidden
        width={183}
        height={183}
        loading="lazy"
        decoding="async"
        className="absolute left-1/2 top-1/2 h-[150%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-40 mix-blend-screen"
        style={{ animation: "pulseDot 1.6s infinite" }}
      />
      <div
        className="sprite absolute bottom-0 left-[14%] aspect-[560/720] h-full"
        style={{
          backgroundImage: `url(${aikaSprite})`,
          imageRendering: "pixelated",
        }}
      />
      <div
        className="sprite absolute bottom-0 right-[14%] aspect-[560/720] h-full -scale-x-100"
        style={{
          backgroundImage: `url(${ojiSprite})`,
          imageRendering: "pixelated",
          animationDelay: ".45s",
        }}
      />
      {/* ground line */}
      <span className="absolute bottom-0 left-0 h-px w-full bg-[var(--c-grey-dark)] opacity-40" />
    </div>
  );
}

function PrincipleItem({ item, index }: { item: Principle; index: number }) {
  return (
    <article className={`col-span-6 ${item.pos}`} data-cursor>
      <p className="fsi-mm up flex items-center gap-[.6rem] text-[var(--c-greydark)]">
        <span className="inline-block h-[.4rem] w-[.4rem] rounded-full bg-[var(--c-red)]" />
        ({String(index + 1).padStart(2, "0")})
      </p>
      <Reveal
        text={item.title}
        className="sans fsi-h3 mt-[var(--p)] max-w-[12em] text-[var(--c-white)]"
        step={13}
      />
      <Reveal
        text={item.kicker}
        className="fsi-h6 mt-[var(--h5)] max-w-[20em] text-[var(--c-purple)]"
        step={8}
        delay={140}
        once
      />
      <p className="fsi-m mt-[var(--m)] max-w-[30em] text-[var(--c-greydark)] opacity-90 [color:var(--c-purple)]">
        {item.body}
      </p>
      {item.sprites && <SpriteStage />}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  section                                                            */
/* ------------------------------------------------------------------ */
export default function Techniques() {
  const swordRef = useRef<HTMLDivElement>(null);
  const swordP = useSectionProgress(swordRef, "through");

  return (
    <section id="techniques" className="relative bg-[var(--c-black)]">
      {/* intro statement */}
      <div className="w gt pt-[var(--h1)] lg:pt-[var(--h0)]">
        <div className="col-span-6 lg:col-span-11">
          <StatementInline
            a="To master the sword is to master the self…"
            b=""
          />
        </div>
      </div>

      {/* compass */}
      <div ref={swordRef}>
        <SwordCompass progress={swordP} />
      </div>

      {/* second statement */}
      <div className="w gt">
        <div className="col-span-6 col-start-1 lg:col-span-11 lg:col-start-4">
          <StatementInline
            a="To master the craft…"
            b="is to master the code."
          />
        </div>
      </div>

      {/* giant fill */}
      <div className="mt-[var(--h0)] overflow-clip px-[var(--g-margin)]">
        <GiantWord
          text="Aimirah"
          className="text-center"
          from={0.18}
          to={0.68}
          redSub={[0, 4]}
        />
      </div>
      <div className="w gt mt-[var(--h4)]">
        <p className="fsi-mm up col-span-6 flex items-center gap-[.6rem] text-[var(--c-purple)] lg:col-span-3">
          <span className="inline-block h-[.4rem] w-[.4rem] rounded-full bg-[var(--c-red)]" />
          Principles
        </p>
      </div>

      {/* principles */}
      <div className="w gt mt-[var(--h2)] gap-y-[var(--h2)]">
        {PRINCIPLES.map((item, i) => (
          <PrincipleItem key={item.title} item={item} index={i} />
        ))}
      </div>

      <div className="w gt pb-[var(--h1)] pt-[var(--h1)]">
        <Reveal
          text="It's minimal, expressive, and performance-first."
          className="sans fsi-h2 col-span-6 ml-auto max-w-[13em] text-right text-[var(--c-white)] lg:col-span-9 lg:col-start-6"
          step={13}
        />
      </div>
    </section>
  );
}
