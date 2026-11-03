import { useState } from "react";
import { Icon } from "./Icon";
import { SITE } from "../lib/content";
import { cn } from "@aimirah/shared/cn";

const FAQS = [
  {
    q: "Are the prompts really free?",
    a: "Yes. Every prompt the creator shared is free to read and copy, no account needed.",
  },
  {
    q: "Who made these videos?",
    a: "Creators on X made the originals with Claude Opus 5.5. Every video credits its author and links to the original post.",
  },
  {
    q: "How are the remakes made?",
    a: `${SITE.name} recreated each video with Claude Opus 5.5 from the prompt the creator shared, so you can compare the two side by side.`,
  },
  {
    q: "Can I use the prompts in my own work?",
    a: "The prompts are shared for anyone to learn from and reuse. Credit the original creator when you publish something built from their prompt, and check their post if they mention specific terms.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number>(-1);

  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-28 border-t border-line">
      <div className="mx-auto w-full max-w-[900px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[11.5px] font-semibold tracking-[0.1em] text-muted uppercase">Questions</span>
          <h2
            id="faq-title"
            className="text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.04] font-semibold tracking-[-0.045em]"
          >
            Questions about the videos
          </h2>
          <p className="max-w-[34rem] text-[14.5px] leading-relaxed text-muted">
            Short answers about prompts, remakes and sharing. Every prompt stays free to copy.
          </p>
        </div>

        <div className="mt-8 divide-y divide-line overflow-hidden rounded-[20px] border border-line bg-card/55">
          {FAQS.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.q}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:ring-inset focus-visible:outline-none sm:px-5 sm:py-5"
                  >
                    <span className="flex-1 text-[14.5px] font-semibold tracking-[-0.01em]">{item.q}</span>
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full border border-line bg-bg/60 text-muted transition-transform duration-200",
                        isOpen && "rotate-180 border-fg/20 text-fg"
                      )}
                    >
                      <Icon name="chevron-down" className="size-3.5" />
                    </span>
                  </button>
                </h3>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[62ch] px-4 pb-5 text-[13.5px] leading-[1.65] text-muted sm:px-5">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 flex flex-wrap items-center justify-center gap-1.5 text-[12.5px] text-muted">
          Still have a question?
          <a
            href={SITE.xUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-fg/80 underline decoration-[1px] underline-offset-2 hover:text-fg"
          >
            Ask {SITE.handle}
            <Icon name="arrow-up-right" className="size-3.5" />
          </a>
        </p>
      </div>
    </section>
  );
}
