import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  Button,
  Reveal,
  Star12,
  useInView,
  useSectionProgress,
} from "../lib/ui";
import { GiantWord } from "./Techniques";

const AUDIENCES = [
  {
    title: "Even Designers",
    body: "Control behavior visually. Prototype or ship — it feels right.",
  },
  {
    title: "Beginner Developers",
    body: "Get started fast. Markup-first. No JS wizardry required.",
  },
  {
    title: "Experienced Developers",
    body: "Compose interactions your way. Break it apart. Extend it. Tune it.",
  },
];

function AudienceCard({
  item,
  index,
}: {
  item: (typeof AUDIENCES)[number];
  index: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  return (
    <div
      ref={ref}
      className="masonry-item -light col-span-6 bg-[var(--c-grey)] p-[var(--h5)] md:col-span-2 lg:col-span-4"
      style={{
        gridColumnStart: index === 1 ? undefined : undefined,
        transformOrigin: "50% 100%",
        opacity: inView ? 1 : 0,
        transform: inView ? "scale(1)" : "scale(.7) translateY(7rem)",
        transition: `transform 1s cubic-bezier(.19,1.35,.32,1) ${index * 110}ms, opacity .55s var(--f-cubic) ${index * 110}ms`,
      }}
      data-cursor
    >
      <p className="fsi-mm up flex items-center gap-[.5rem] text-[var(--c-grey-dark)]">
        <span className="inline-block h-[.4rem] w-[.4rem] rounded-full bg-[var(--c-red)]" />
        0{index + 1}
      </p>
      <p className="fsi-h5 sans mt-[var(--h4)] max-w-[9em] text-[var(--c-black)]">
        {item.title}
      </p>
      <p className="fsi-m mt-[var(--p)] max-w-[26em] text-[var(--c-grey-dark)]">
        {item.body}
      </p>
    </div>
  );
}

export default function WhoItsFor() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const p = useSectionProgress(cardsRef, "through");

  return (
    <section className="relative overflow-clip bg-[var(--c-black)] pb-[var(--h1)]">
      {/* headline */}
      <div className="w gt items-end pt-[var(--h1)]">
        <div className="col-span-6 lg:col-span-9">
          <Reveal
            text="Modular by nature."
            className="sans fsi-h1 max-w-[12em] text-[var(--c-white)]"
            step={14}
          />
          <Reveal
            text="Build small, scale sharp."
            className="sans fsi-h1 max-w-[12em] text-[var(--c-red)]"
            step={14}
            delay={200}
          />
        </div>
        <p className="fsi-m col-span-6 mt-[var(--h5)] max-w-[24em] text-[var(--c-purple)] lg:col-span-4 lg:col-start-11 lg:mt-0">
          Direct, welcoming, with respect for each type of developer.
        </p>
      </div>

      {/* giant fill */}
      <div className="mt-[var(--h1)] overflow-clip px-[var(--g-margin)]">
        <GiantWord
          text="Who It's For"
          from={0.16}
          to={0.7}
          className="text-center"
          redSub={[4, 8]}
        />
      </div>

      {/* cards over rotating star */}
      <div ref={cardsRef} className="relative mt-[var(--h1)]">
        <Star12
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[140%] w-[min(140%,80rem)] -translate-x-1/2 -translate-y-1/2 opacity-45"
          stroke="var(--c-grey-dark)"
          style={{ transform: `translate(-50%,-50%) rotate(${p * 70 - 35}deg)` }}
        />
        <div className="w gt relative z-10 gap-y-[var(--g-gap)]">
          <div className="col-span-6 grid grid-cols-6 gap-[var(--g-gap)] lg:col-span-14 lg:grid-cols-14">
            {AUDIENCES.map((item, i) => (
              <AudienceCard key={item.title} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* closing */}
      <div className="w gt mt-[var(--h1)] items-end">
        <div className="col-span-6 lg:col-span-7">
          <Reveal
            text="For when you need precision."
            className="sans fsi-h3 max-w-[12em] text-[var(--c-white)]"
            step={12}
          />
          <Reveal
            text="Extend, override, and compose."
            className="sans fsi-h3 max-w-[12em] text-[var(--c-purple)]"
            step={12}
            delay={180}
          />
        </div>
        <div className="col-span-6 mt-[var(--h5)] lg:col-span-4 lg:col-start-11 lg:mt-0">
          <p className="fsi-m max-w-[26em] text-[var(--c-purple)]">
            Build custom modules, command advanced flows —{" "}
            <span className="text-[var(--c-white)]">without losing control.</span>
          </p>
          <div className="mt-[var(--h6)]">
            <Button
              variant="-red"
              href="https://mi4inc.com"
              icon={<ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />}
            >
              Learn How
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
