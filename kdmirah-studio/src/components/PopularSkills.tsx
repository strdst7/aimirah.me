import { Icon } from "./Icon";
import { POPULAR_SKILLS, SITE, type Skill } from "../lib/content";

export function PopularSkills({
  onOpenSkill,
  onNotify,
}: {
  onOpenSkill: (skill: Skill) => void;
  onNotify: (message: string) => void;
}) {
  return (
    <section id="skills" className="scroll-mt-28 border-t border-line">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="flex flex-col gap-2.5">
            <span className="text-[11.5px] font-semibold tracking-[0.1em] text-muted uppercase">
              Popular on {SITE.name}
            </span>
            <h2 className="text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.04] font-semibold tracking-[-0.045em]">
              Popular video Skills
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNotify("Showing all 142 video Skills (demo)")}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-[14px] font-semibold transition-colors hover:border-fg/30 hover:bg-card/60"
          >
            All video Skills
            <Icon name="arrow-right" className="size-4" />
          </button>
        </div>

        <ul className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_SKILLS.map((skill) => (
            <li key={skill.slug} className="min-w-0">
              <article className="group h-full transition-transform duration-300 hover:-translate-y-1">
                <button
                  type="button"
                  onClick={() => onOpenSkill(skill)}
                  className="flex h-full w-full flex-col text-left focus-visible:ring-2 focus-visible:ring-fg/40 focus-visible:ring-offset-4 focus-visible:ring-offset-bg focus-visible:outline-none"
                >
                  <span className="relative block aspect-video w-full overflow-hidden rounded-2xl border border-line bg-thumb">
                    <img
                      src={skill.image}
                      alt={`${skill.title} preview`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                    />
                    <span className="absolute top-2 left-2 z-10 inline-flex h-6 items-center gap-1 rounded-full bg-white/85 px-2 text-[10.5px] font-semibold text-ink backdrop-blur-sm">
                      <Icon name="movie" className="size-3" />
                      {skill.output}
                      <span className="ml-0.5 border-l border-ink/15 pl-1.5 tabular-nums">{skill.installs}</span>
                    </span>
                    <span className="absolute top-2 right-2 z-10 grid size-6 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm">
                      <Icon name="bookmark" className="size-3" />
                    </span>
                    <span className="absolute inset-x-0 bottom-0 flex translate-y-1 items-center justify-between gap-2 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-3 pt-10 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="text-[11px] font-medium text-white/85">Open Skill</span>
                      <span className="inline-flex h-6 items-center gap-1 rounded-full bg-lime px-2 text-[10.5px] font-bold text-ink">
                        <Icon name="download" className="size-3" />
                        {skill.installs}
                      </span>
                    </span>
                  </span>

                  <span className="mt-2.5 flex w-full items-start gap-2">
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold tracking-[-0.01em]">
                      {skill.title}
                    </span>
                    <span className="mt-0.5 shrink-0 rounded-md border border-line bg-card/60 px-1 py-0.5 text-[10px] font-medium text-muted tabular-nums">
                      +{skill.versions}
                    </span>
                  </span>

                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {skill.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex h-5 items-center rounded-full border border-line bg-card/60 px-2 text-[10px] font-medium text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted">
                      <span className="size-1.5 rounded-full bg-[#9fbb3a]" />
                      {SITE.name}
                    </span>
                  </span>
                </button>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
