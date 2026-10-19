import { useReveal } from "../hooks/useReveal";

export default function ChapterIntro({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className="px-5 md:px-10">
      <p
        className={`font-mono text-[10px] uppercase tracking-[0.3em] text-signal transition-all duration-700 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        {kicker}
      </p>
      <h2 className="mt-3 overflow-hidden">
        <span
          className={`block font-display leading-[1.02] tracking-tight text-bone transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            visible ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ fontSize: "clamp(2.4rem, 7vw, 6.5rem)", transitionDelay: "80ms" }}
        >
          {title}
        </span>
      </h2>
    </div>
  );
}
