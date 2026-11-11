import { useEffect, useMemo, useState } from "react";
import { sectionReferences, type SectionReference } from "../data/sectionReferences";

const categories = ["All", "Portfolio", "Prompt tools", "Page sections", "Pricing", "404 pages", "Experiments"];

export function SectionReferences() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SectionReference | null>(null);
  useEffect(() => {
    if (!selected) return;
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [selected]);
  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return sectionReferences.filter((section) =>
      (category === "All" || section.category === category) &&
      (!search || `${section.title} ${section.category}`.toLocaleLowerCase().includes(search))
    );
  }, [category, query]);

  return (
    <section id="sections" aria-labelledby="sections-title" className="scroll-mt-28 border-t border-line bg-panel/60">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Design references · 70 ideas</p>
            <h2 id="sections-title" className="mt-3 max-w-[19ch] text-[clamp(2rem,4.6vw,3.6rem)] leading-[1.04] tracking-[-0.05em]">
              A library of sections worth studying.
            </h2>
            <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted">
              Explore layouts alongside our videos and prompts. These references belong to Oversight Supply.
              The artwork below is made for this index, not a preview of their products.
            </p>
          </div>
          <a
            href="https://supply.madebyoversight.com/sections"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line-strong px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
          >
            Visit original collection <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="section-search">Search sections</label>
          <input
            id="section-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search section names"
            className="h-11 w-full rounded-full border border-line-strong bg-card px-4 text-sm text-fg outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-fg/40 sm:max-w-xs"
          />
          <span role="status" className="text-xs font-medium tabular-nums text-muted">{filtered.length} references</span>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter section references">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg ${category === item ? "border-fg bg-fg text-bg" : "border-line-strong bg-card/60 text-muted hover:text-fg"}`}
            >
              {item}
            </button>
          ))}
        </div>

        {filtered.length ? (
          <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((section, index) => (
              <li key={section.slug}>
                <button
                  type="button"
                  onClick={() => setSelected(section)}
                  className="group block h-full w-full overflow-hidden rounded-[18px] border border-line-strong bg-card text-left transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-fg/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                  aria-label={`Explore ${section.title} section reference`}
                >
                  <div className={`reference-art reference-art--${index % 6}`} aria-hidden="true">
                    <span className="reference-art__number">{String(sectionReferences.indexOf(section) + 1).padStart(2, "0")}</span>
                    <span className="reference-art__shape" />
                    <span className="reference-art__word">kd.</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 py-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-muted">{section.category} · Oversight Supply</p>
                      <h3 className="mt-1 truncate text-base font-semibold">{section.title}</h3>
                    </div>
                    <span aria-hidden="true" className="text-muted transition-transform group-hover:translate-x-0.5">→</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-7 rounded-2xl border border-line-strong px-6 py-10 text-center text-sm text-muted">
            No matching sections. Try another name or category.
          </p>
        )}
      </div>
      {selected && (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4" role="presentation">
          <button type="button" className="absolute inset-0 bg-ink/70" aria-label="Close section details" onClick={() => setSelected(null)} />
          <div role="dialog" aria-modal="true" aria-labelledby="section-detail-title" className="relative z-10 w-full max-w-lg rounded-[24px] border border-line bg-bg p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">{selected.category} · reference</span>
              <button type="button" autoFocus onClick={() => setSelected(null)} aria-label="Close section details" className="grid size-9 place-items-center rounded-full border border-line text-fg hover:bg-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg">×</button>
            </div>
            <h3 id="section-detail-title" className="mt-6 text-[clamp(2rem,6vw,3.5rem)] leading-none tracking-[-0.05em]">{selected.title}</h3>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Part of a 70-section index for layout research. This kdmirah.studio entry contains original index artwork and a link to its source. It does not include a licensed template or downloadable source code.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href={`https://supply.madebyoversight.com/sections/${encodeURIComponent(selected.slug)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-semibold text-bg hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg">
                View source at Oversight ↗
              </a>
              <button type="button" onClick={() => setSelected(null)} className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-sm font-semibold hover:bg-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg">Back to index</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
