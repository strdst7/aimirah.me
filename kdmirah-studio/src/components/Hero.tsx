import { Icon, Logo } from "./Icon";
import { GITHUB_STARS, SITE, TOTAL_VIDEOS } from "../lib/content";

export function Hero() {
  return (
    <section data-testid="hero" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hero-glow" />
      <div
        aria-hidden="true"
        className="paper-grain pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(70%_70%_at_50%_35%,black,transparent)]"
      />
      <Logo
        className="pointer-events-none absolute top-16 -left-12 -z-10 size-44 rotate-12 rounded-[28px] opacity-[0.07] blur-[1px] sm:size-56 lg:size-64"
      />
      <Logo
        className="pointer-events-none absolute -right-10 bottom-6 -z-10 size-36 -rotate-12 rounded-[24px] opacity-[0.06] blur-[1px] sm:size-48 lg:size-56"
      />

      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[min(31rem,58svh)] flex-col items-center justify-center gap-5 py-12 text-center sm:gap-6 sm:py-16 lg:py-20">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href={SITE.archiveUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex h-8 items-center gap-2 rounded-full border border-line bg-card/80 pr-1 pl-2.5 text-[12.5px] font-medium transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-sm focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:outline-none"
            >
              <Icon name="github" className="size-4" />
              Star the archive
              <span
                className="inline-flex h-6 items-center gap-1 rounded-full bg-lime px-2 text-[12px] font-semibold tabular-nums text-ink"
                title={`${GITHUB_STARS.toLocaleString()} stars on GitHub`}
              >
                <Icon name="star" className="size-3" />
                <span aria-hidden="true">{(GITHUB_STARS / 1000).toFixed(1)}K</span>
                <span className="sr-only">{GITHUB_STARS.toLocaleString()} stars on GitHub</span>
              </span>
            </a>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-card/60 px-3 text-[12px] font-medium text-muted">
              <span className="size-1.5 rounded-full bg-[#7c8f2f]" />
              An independent archive by {SITE.name}
            </span>
          </div>

          <h1 className="max-w-[16ch] text-balance text-[clamp(2.5rem,5.6vw,4.75rem)] leading-[1] font-semibold tracking-[-0.05em]">
            Viral Opus 5.5 videos, with their prompts.
          </h1>

          <p className="max-w-[40rem] text-pretty text-[16.5px] leading-[1.55] text-muted sm:text-[18px]">
            Every video people made with Claude Opus 5.5, with the exact prompt the creator used and a live
            remake you can compare side by side.
          </p>

          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#videos"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-fg px-5 text-[15px] font-semibold text-bg transition-all hover:opacity-85 active:translate-y-px focus-visible:ring-2 focus-visible:ring-fg/40 focus-visible:outline-none"
            >
              Browse {TOTAL_VIDEOS} videos
              <Icon name="chevron-down" className="size-4" />
            </a>
            <a
              href="#skills"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line-strong px-5 text-[15px] font-semibold transition-colors hover:border-fg/40 hover:bg-card/60 focus-visible:ring-2 focus-visible:ring-fg/40 focus-visible:outline-none"
            >
              See Skills
              <Icon name="arrow-right" className="size-4" />
            </a>
          </div>

          <ul className="mt-1 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-muted">
            <li className="inline-flex items-center gap-1.5">
              <Icon name="check" className="size-3.5 text-fg" strokeWidth={2} />
              Prompts free to copy
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Icon name="check" className="size-3.5 text-fg" strokeWidth={2} />
              Original and remake side by side
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
