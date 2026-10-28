import { Icon, Logo, Wordmark } from "./Icon";
import { GITHUB_STARS, SITE, TOTAL_VIDEOS } from "../lib/content";

const LINKS = [
  { label: "Videos", href: "#videos" },
  { label: "Skills", href: "#skills" },
  { label: "Learn", href: "#faq" },
  { label: "Archive", href: SITE.archiveUrl, external: true },
  { label: "Support", href: SITE.xUrl, external: true },
];

export function ClosingCta() {
  return (
    <section className="relative isolate overflow-hidden border-t border-line">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_50%_120%,rgba(255,79,54,0.28),transparent_70%)] dark:bg-[radial-gradient(60%_90%_at_50%_120%,rgba(255,79,54,0.14),transparent_70%)]"
      />
      <div className="mx-auto flex w-full max-w-[820px] flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
        <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-card/70 px-2.5 text-[11.5px] font-semibold text-fg/75">
          <Icon name="sparkles" className="size-3.5 text-lime" />
          {TOTAL_VIDEOS} prompts · free to copy · built for agents
        </span>
        <h2 className="mt-5 max-w-[18ch] text-balance text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.05em]">
          Find a Skill for your next project.
        </h2>
        <p className="mt-4 max-w-[38rem] text-[15.5px] leading-[1.6] text-muted">
          {SITE.name} is an independent archive of Opus 5.5 videos and the Agent Skills behind them. Every
          prompt is free to read, copy and install into your own workflow.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a
            href="#skills"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-fg px-5 text-[15px] font-semibold text-bg transition-opacity hover:opacity-85 active:translate-y-px"
          >
            Browse Skills
            <Icon name="arrow-right" className="size-4" />
          </a>
          <a
            href="#videos"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-line-strong px-5 text-[15px] font-semibold transition-colors hover:bg-card/70"
          >
            Browse videos
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer({ onNotify }: { onNotify: (message: string) => void }) {
  return (
    <footer className="border-t border-line bg-panel/60">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <a href="#" className="flex items-center gap-2">
            <Logo />
            <Wordmark className="text-[18px]" />
          </a>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] font-medium text-muted transition-colors hover:text-fg"
                >
                  {link.label}
                </a>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[13px] font-medium text-muted transition-colors hover:text-fg"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-line pt-5 text-[12px] text-muted sm:flex-row sm:items-center">
          <p>© 2026 {SITE.name}. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-lime" />
              {TOTAL_VIDEOS} prompts, free to copy
            </span>
            <a
              href={SITE.archiveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-fg"
            >
              <Icon name="github" className="size-3.5" />
              {(GITHUB_STARS / 1000).toFixed(1)}K stars
            </a>
            <button
              type="button"
              onClick={() => onNotify("Language menu (demo)")}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-fg"
            >
              <Icon name="globe" className="size-3.5" />
              English
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
