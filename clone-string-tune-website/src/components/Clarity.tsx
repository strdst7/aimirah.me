import { useRef } from "react";
import { clamp, Reveal, useSectionProgress } from "../lib/ui";

const ITEMS = [
  "Uses native scroll, refined by a precision smoothing formula.",
  "Designed with a lightweight, modular architecture that lets you import only what you need.",
  "Configure behavior directly in your markup with attribute‑based controls – no extra JavaScript required… Until you really need it.",
  "Built for core web animation, yet open to any prop or pattern your setup requires.",
];

/* words fill from grey to white with scroll progress */
function WordFill({ text, p }: { text: string; p: number }) {
  const words = text.split(" ");
  const n = words.length;
  return (
    <span>
      {words.map((w, i) => {
        const lit = clamp(p * (n + 1.5) - i, 0, 1);
        return (
          <span
            key={i}
            style={{
              color: `color-mix(in srgb, var(--c-grey-dark) ${Math.round(
                (1 - lit) * 100,
              )}%, var(--c-white))`,
              transition: "color .18s linear",
            }}
          >
            {w}
            {i < n - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
}

function ClarityItem({ text, index }: { text: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const raw = useSectionProgress(ref, "enter");
  const p = clamp((raw - 0.12) / 0.66);
  return (
    <div
      ref={ref}
      className="grid grid-cols-6 items-baseline gap-[var(--g-gap)] py-[var(--h6)] lg:grid-cols-14"
      style={{
        borderTop: "1px solid rgba(var(--c-grey-dark-rgb), .4)",
      }}
    >
      <p className="fsi-mm up col-span-1 text-[var(--c-red)] lg:col-span-2">
        ({index + 1})
      </p>
      <p className="fsi-h6 sans col-span-5 max-w-[24em] lg:col-span-10">
        <WordFill text={text} p={p} />
      </p>
      <p className="fsi-mm up col-span-6 hidden text-right text-[var(--c-grey-dark)] lg:col-span-2 lg:block">
        0{index + 1} / 0{ITEMS.length}
      </p>
    </div>
  );
}

export default function Clarity() {
  return (
    <section id="clarity" className="relative bg-[var(--c-black)] pb-[var(--h1)] pt-[var(--h1)]">
      <div className="w">
        <div className="gt items-end">
          <div className="col-span-6 lg:col-span-10">
            <Reveal
              text="Code With Clarity"
              className="sans fsi-h0 max-w-[8em] text-[var(--c-white)]"
              step={18}
            />
          </div>
          <p className="fsi-m col-span-6 mt-[var(--h5)] max-w-[22em] text-[var(--c-purple)] lg:col-span-4 lg:mt-0">
            Built to tune your animations,{" "}
            <span className="text-[var(--c-white)]">not fight your DOM</span>
          </p>
        </div>
        <div className="mt-[var(--h2)]">
          {ITEMS.map((t, i) => (
            <ClarityItem key={i} text={t} index={i} />
          ))}
          <div style={{ borderTop: "1px solid rgba(var(--c-grey-dark-rgb), .4)" }} />
        </div>
      </div>
    </section>
  );
}
