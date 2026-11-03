import { useState } from "react";
import { Icon } from "./Icon";
import { PROMO_SKILLS, SITE, type Skill } from "../lib/content";
import { cn } from "@aimirah/shared/cn";

export function MidPromo({ onOpenSkill }: { onOpenSkill: (skill: Skill) => void }) {
  const [active, setActive] = useState(0);
  const skill = PROMO_SKILLS[active];

  return (
    <aside
      className="relative isolate overflow-hidden rounded-[28px] bg-ink p-6 text-white sm:p-9 lg:p-10"
      data-testid="skills-promo"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)] [background-size:22px_22px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 size-80 rounded-full bg-lime/25 blur-[90px]"
      />
      <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-12">
        <div className="flex flex-col items-start gap-4">
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-lime px-2.5 text-[12px] font-semibold text-ink">
            <Icon name="sparkles" className="size-3.5" />
            {SITE.name}
          </span>
          <p className="max-w-[24ch] text-[clamp(1.625rem,2.8vw,2.25rem)] leading-[1.08] font-semibold tracking-[-0.04em]">
            More than videos. Skills for everything you make.
          </p>
          <p className="max-w-[48ch] text-[14.5px] leading-[1.55] text-white/70">
            Browse ready-made Skills for videos, slides, web pages and images. Install one and your agent does
            the rest.
          </p>
          <a
            href="#skills"
            className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-lime px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-white active:translate-y-px focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
          >
            Browse all Skills
            <Icon name="arrow-right" className="size-4" />
          </a>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <button
            type="button"
            onClick={() => onOpenSkill(skill)}
            className="group/ad relative block aspect-video w-full overflow-hidden rounded-[18px] border border-white/15 bg-[#1b1c1c] shadow-[0_18px_44px_rgba(0,0,0,0.45)] focus-visible:ring-2 focus-visible:ring-lime focus-visible:outline-none"
          >
            <img
              key={skill.image}
              src={skill.image}
              alt={`${skill.title} preview`}
              loading="lazy"
              className="absolute inset-0 size-full animate-fade-up object-cover transition-transform duration-500 group-hover/ad:scale-[1.03]"
            />
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-4 pt-12">
              <span className="min-w-0">
                <span className="mb-1 block text-[10.5px] font-semibold tracking-[0.09em] text-lime uppercase">
                  Skill preview
                </span>
                <span className="block truncate text-[14px] font-semibold">{skill.title}</span>
              </span>
              <Icon
                name="arrow-right"
                className="size-4 shrink-0 transition-transform group-hover/ad:translate-x-0.5"
              />
            </span>
          </button>

          <div className="flex gap-1.5">
            {PROMO_SKILLS.map((item, i) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setActive(i)}
                aria-label={item.title}
                aria-pressed={i === active}
                className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/25 transition-colors hover:bg-white/40 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
              >
                <span
                  key={`${item.slug}-${active === i ? "on" : "off"}`}
                  onAnimationEnd={() => setActive((active + 1) % PROMO_SKILLS.length)}
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full bg-lime",
                    i < active && "w-full",
                    i === active && "promo-progress",
                    i > active && "w-0"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
