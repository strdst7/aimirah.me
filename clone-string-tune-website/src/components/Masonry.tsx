import React, { useEffect, useRef } from "react";
import { MousePointer2 } from "lucide-react";
import { Chars, useInView, useRaf } from "../lib/ui";
const atelierImg = "/images/fidoru.jpg";
const controlImg = "/images/control.jpg";
const ultraImg = "/images/ultra.jpg";

const ROW_H = "clamp(8.5rem, 23vh, 13rem)";

/* ------------------------------------------------------------------ */
/*  bubble-in tile                                                     */
/* ------------------------------------------------------------------ */
function Tile({
  children,
  className = "",
  style,
  index = 0,
  tone = "-light",
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  index?: number;
  tone?: "-light" | "-dark";
}) {
  const { ref, inView } = useInView<HTMLDivElement>({
    threshold: 0.15,
    rootMargin: "0px 0px -4% 0px",
  });
  return (
    <div
      ref={ref}
      className={`masonry-item ${tone} ${className}`}
      style={{
        ...style,
        transformOrigin: "50% 100%",
        opacity: inView ? 1 : 0,
        transform: inView ? "scale(1)" : "scale(.72) translateY(9rem)",
        transition: `transform 1s cubic-bezier(.19,1.35,.32,1) ${index * 80}ms, opacity .55s var(--f-cubic) ${index * 80}ms`,
      }}
      data-cursor
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  detail labels strip                                                */
/* ------------------------------------------------------------------ */
function DetailsStrip({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 });
  return (
    <div
      ref={ref}
      className={`flex flex-wrap items-center gap-[var(--g-gap)] py-[var(--h6)] ${className}`}
    >
      {items.map((t, i) => (
        <span
          key={t}
          className="details-label"
          style={{
            transformOrigin: "50% 100%",
            opacity: inView ? 1 : 0,
            transform: inView ? "scale(1)" : "scale(.55) translateY(3.5rem)",
            transition: `transform .9s cubic-bezier(.19,1.35,.32,1) ${i * 90}ms, opacity .5s var(--f-cubic) ${i * 90}ms`,
            marginLeft: i === 0 ? 0 : "auto",
            marginRight: i === items.length - 1 ? 0 : "auto",
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  easing curve with traveling dot                                    */
/* ------------------------------------------------------------------ */
function EasingCurve() {
  const dotRef = useRef<SVGCircleElement>(null);
  useRaf((t) => {
    const dot = dotRef.current;
    if (!dot) return;
    const cyc = (t / 2600) % 2;
    const tt = cyc < 1 ? cyc : 2 - cyc;
    const e = tt < 0.5 ? 4 * tt * tt * tt : 1 - Math.pow(-2 * tt + 2, 3) / 2;
    dot.setAttribute("cx", String(12 + e * 76));
    dot.setAttribute("cy", String(88 - e * 72));
  });
  return (
    <svg viewBox="0 0 100 96" className="mt-auto w-full" aria-hidden>
      <line x1="12" y1="88" x2="88" y2="88" stroke="var(--c-black)" strokeOpacity=".14" strokeWidth="1" />
      <line x1="12" y1="16" x2="88" y2="16" stroke="var(--c-black)" strokeOpacity=".14" strokeWidth="1" />
      <path
        d="M 12 88 C 30 88 30 16 88 16"
        fill="none"
        stroke="var(--c-red)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle ref={dotRef} cx="12" cy="88" r="3.4" fill="var(--c-black)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  split text wave tile                                               */
/* ------------------------------------------------------------------ */
function WaveRun({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const { inView } = useInView<HTMLSpanElement>({ threshold: 0.4, once: false });
  useEffect(() => {
    inner.current?.classList.toggle("-run", inView);
  }, [inView]);
  return (
    <span ref={ref}>
      <span ref={inner} className={`wave ${className}`} aria-label={text}>
        <Chars text={text} />
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  grid row helper                                                    */
/* ------------------------------------------------------------------ */
function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid grid-cols-1 gap-[var(--g-gap)] lg:grid-cols-6"
      style={{ gridAutoRows: ROW_H }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  the masonry section                                                */
/* ------------------------------------------------------------------ */
export default function Masonry() {
  return (
    <section className="relative bg-[var(--c-black)] pb-[var(--h1)]">
      <style>{`
        .wave .sp-char { display:inline-block; }
        .wave.-run .sp-char {
          animation: waveChar 2.6s var(--f-smooth) infinite;
          animation-delay: calc(var(--i) * 55ms);
        }
        @keyframes waveChar {
          0%,100% { transform: translateY(0) }
          30% { transform: translateY(-.16em) }
          60% { transform: translateY(.05em) }
        }
      `}</style>

      <div className="w">
        {/* ————— ROW 1 */}
        <Row>
          <Tile
            tone="-light"
            className="bg-[var(--c-white)] p-[var(--h5)] lg:col-span-4"
          >
            <div className="flex h-full flex-col justify-between">
              <p className="fsi-h6 sans max-w-[12em] text-[var(--c-black)]">
                Use Scroll Container.
              </p>
              <p className="fsi-h5 sans self-end text-[var(--c-purple)]">
                If you want
              </p>
            </div>
          </Tile>
          <Tile
            tone="-light"
            index={1}
            className="bg-[var(--c-grey)] lg:col-span-2 lg:col-start-5"
          >
            <div className="flex h-full flex-col p-[var(--h5)]">
              <p className="fsi-h6 sans text-[var(--c-black)]">
                Performance
                <br />
                Supervision
              </p>
              <img
                src={atelierImg}
                alt="Aimirah project — atelier"
                width={1280}
                height={640}
                loading="lazy"
                decoding="async"
                className="mt-auto h-[44%] w-full rounded-[var(--m)] object-cover object-top"
                draggable={false}
              />
            </div>
          </Tile>
        </Row>

        <DetailsStrip items={["Granular control of each module — on, off, or in reverse."]} />

        {/* ————— ROW 2 */}
        <Row>
          <Tile tone="-light" className="bg-[var(--c-red)] lg:col-span-3">
            <div className="flex h-full flex-col justify-between p-[var(--h5)]">
              <p className="fsi-h6 sans max-w-[11em] text-[var(--c-black)]">
                Safe natural kerning
                <br />
                when Splitting
              </p>
              <p
                className="sans self-end pr-[.1em] text-[var(--c-black)]"
                style={{
                  fontSize: "min(var(--h0), 9rem)",
                  lineHeight: 0.82,
                  letterSpacing: "-0.09em",
                }}
                aria-hidden
              >
                Tu
              </p>
            </div>
          </Tile>
          <Tile
            tone="-dark"
            index={1}
            className="bg-[var(--c-greydark)] lg:col-span-3 lg:col-start-4"
          >
            <div className="flex h-full flex-col justify-between p-[var(--h5)]">
              <MousePointer2
                className="h-[1.4rem] w-[1.4rem] text-[var(--c-red)]"
                strokeWidth={2}
                style={{ animation: "floatY 3.4s var(--f-smooth) infinite" }}
              />
              <p className="fsi-h6 sans max-w-[12em] text-[var(--c-white)]">
                Cursor Tracking
                <span className="text-[var(--c-purple)]"> of any kind</span>
              </p>
            </div>
          </Tile>
        </Row>

        <DetailsStrip
          items={[
            "Scroll containers work out of the box.",
            "Automatic clean-up in view.",
            "CSS-first, JS-light.",
          ]}
        />

        {/* ————— ROW 3 */}
        <Row>
          <Tile tone="-dark" className="bg-[#16181b] lg:col-span-5">
            <div className="relative flex h-full">
              <div className="relative z-10 flex w-[58%] min-w-0 flex-col justify-between p-[var(--h5)]">
                <p className="fsi-mm up text-[var(--c-purple)]">
                  Progress, unpiped
                </p>
                <div>
                  <p className="fsi-h6 sans max-w-[11em] text-[var(--c-white)]">
                    Control your Progress Data
                  </p>
                  <p className="fsi-m mt-[var(--p)] hidden max-w-[24em] text-[var(--c-purple)] sm:block">
                    Break it apart, apply to any element across the page, pass
                    it through JS.
                  </p>
                </div>
              </div>
              <img
                src={controlImg}
                alt="Aimirah showcase site on a phone"
                width={2401}
                height={2401}
                loading="lazy"
                decoding="async"
                className="absolute right-0 top-0 h-full w-[50%] object-cover object-left"
                draggable={false}
                style={{
                  maskImage: "linear-gradient(90deg, transparent, #000 26%)",
                  WebkitMaskImage: "linear-gradient(90deg, transparent, #000 26%)",
                }}
              />
            </div>
          </Tile>
          <Tile
            tone="-dark"
            index={1}
            className="bg-[#16181b] max-lg:hidden lg:col-span-1 lg:col-start-6"
          >
            <div className="relative grid h-full place-items-center overflow-hidden">
              <span
                className="whitespace-nowrap rounded-full bg-[var(--c-red)] px-[1rem] py-[.5rem] text-[var(--c-white)] fsi-mm up"
                style={{ transform: "rotate(-90deg)" }}
              >
                Scroll Smoothly
              </span>
            </div>
          </Tile>
        </Row>

        <DetailsStrip
          items={["Native scroll, tuned by a precision smoothing formula."]}
        />

        {/* ————— ROW 4 */}
        <Row>
          <Tile tone="-light" className="bg-[var(--c-white)] lg:col-span-3">
            <div className="flex h-full flex-col p-[var(--h5)]">
              <p className="fsi-h6 sans text-[var(--c-black)]">Progress Easing</p>
              <EasingCurve />
            </div>
          </Tile>
          <Tile
            tone="-light"
            index={1}
            className="bg-[var(--c-yellow)] lg:col-span-3 lg:col-start-4"
          >
            <div className="flex h-full flex-col justify-end p-[var(--h5)]">
              <div className="fsi-h5 sans max-w-[12em] text-[var(--c-black)]">
                <WaveRun text="Blend your HTML with Splitted Text" />
              </div>
              <p className="fsi-mm up mt-[var(--p)] text-[var(--c-black)] opacity-60">
                split lines · words · chars
              </p>
            </div>
          </Tile>
        </Row>

        <DetailsStrip
          items={[
            "True vanilla, no lock-in.",
            "Every module stands alone.",
            "Tiny footprint, massive range.",
            "Apply progress anywhere.",
          ]}
        />

        {/* ————— ROW 5 */}
        <Row>
          <Tile tone="-dark" className="bg-[#16181b] lg:col-span-2">
            <div className="flex h-full flex-col justify-center p-[var(--h5)]">
              <p className="fsi-h4 sans" style={{ lineHeight: 0.9 }}>
                <span className="mono fsi-mm up block text-[var(--c-purple)]">
                  for
                </span>
                <span className="text-[var(--c-white)]">Developers</span>
                <span className="text-[var(--c-red)]"> &</span>
                <br />
                <span className="text-[var(--c-white)]">Designers</span>
              </p>
            </div>
          </Tile>
          <Tile
            tone="-light"
            index={1}
            className="bg-[var(--c-grey)] lg:col-span-2 lg:col-start-3"
          >
            <div className="flex h-full flex-col p-[var(--h5)]">
              <p className="fsi-h6 sans text-[var(--c-black)]">Ultra Optimized</p>
              <img
                src={ultraImg}
                alt="Ultra optimized — aimirah"
                width={800}
                height={784}
                loading="lazy"
                decoding="async"
                className="mt-auto h-[42%] w-full rounded-[var(--m)] object-cover grayscale"
                draggable={false}
              />
            </div>
          </Tile>
          <Tile
            tone="-light"
            index={2}
            className="bg-[var(--c-white)] lg:col-span-2 lg:col-start-5"
          >
            <div className="flex h-full flex-col justify-between p-[var(--h5)]">
              <p className="fsi-h6 sans text-[var(--c-black)]">Position Sticky?</p>
              <p className="fsi-h4 sans self-end text-[var(--c-purple)]">
                Of course
              </p>
            </div>
          </Tile>
        </Row>
      </div>
    </section>
  );
}
