import { ArrowUp, Asterisk } from "lucide-react";
import { scrollToTop } from "../lib/scroll";
import { useReveal } from "../hooks/useReveal";

export default function Footer() {
  const { ref, visible } = useReveal<HTMLDivElement>(0.3);

  return (
    <footer id="contact" className="relative border-t border-bone/10">
      <div
        ref={ref}
        className="flex min-h-[80svh] flex-col justify-between px-5 pb-6 pt-24 md:px-10 md:pt-32"
      >
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-smoke">
          <span className="text-signal">04 — The outro</span>
          <span>Transmission ends</span>
        </div>

        <div className="py-14 text-center">
          <p
            className={`font-mono text-[10px] uppercase tracking-[0.35em] text-signal transition-all duration-700 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            Nothing here is finished
          </p>
          <h2
            className="mt-4 overflow-hidden font-display uppercase leading-[0.9] tracking-tight"
            style={{ fontSize: "clamp(2.8rem, 11vw, 12rem)" }}
          >
            <span
              className={`block transition-transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                visible ? "translate-y-0" : "translate-y-full"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              <span className="text-bone">kdmirah</span>{" "}
              <span className="text-outline">EVERYWHERE</span>
            </span>
          </h2>
          <p
            className={`mx-auto mt-8 flex max-w-xs items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-smoke transition-all delay-300 duration-700 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            <Asterisk size={12} className="text-signal" />
            An independent study of inspiration
            <Asterisk size={12} className="text-signal" />
          </p>
        </div>

        <div className="grid grid-cols-2 items-end gap-6 border-t border-bone/10 pt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-smoke md:grid-cols-4">
          <span>
            kdmirah<span className="align-super text-[0.6em] text-signal">®</span>
            <br />
            Inspiration lab
          </span>
          <span className="hidden md:block">
            Field study — 004 pairs
            <br />
            Dark field mode
          </span>
          <span className="hidden md:block">
            Built as a design exercise
            <br />
            MMXXVI
          </span>
          <button
            type="button"
            data-hover
            onClick={scrollToTop}
            className="group col-span-2 flex items-center justify-end gap-3 text-right text-bone/80 transition-colors hover:text-signal md:col-span-1"
          >
            Back to top
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-bone/30 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-signal">
              <ArrowUp size={14} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
