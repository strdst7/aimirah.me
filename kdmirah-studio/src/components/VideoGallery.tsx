import { Fragment, useEffect, useState } from "react";
import { Icon } from "./Icon";
import { VideoCard } from "./VideoCard";
import { MidPromo } from "./MidPromo";
import {
  CATEGORIES,
  PAGE_SIZE,
  TOTAL_VIDEOS,
  type CategoryKey,
  type Skill,
  type Video,
} from "../lib/content";
import { cn } from "../utils/cn";

function pageItems(current: number, total: number): (number | "start" | "end")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "start" | "end")[] = [1];
  if (current > 3) items.push("start");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p += 1) items.push(p);
  if (current < total - 2) items.push("end");
  items.push(total);
  return items;
}

type GalleryProps = {
  videos: Video[];
  page: number;
  category: CategoryKey;
  compare: boolean;
  sort: string;
  onPageChange: (page: number) => void;
  onCategory: (key: CategoryKey) => void;
  onCompare: (value: boolean) => void;
  onSort: (value: string) => void;
  onOpen: (video: Video) => void;
  onCopy: (video: Video) => void;
  onOpenSkill: (skill: Skill) => void;
};

export function VideoGallery({
  videos,
  page,
  category,
  compare,
  sort,
  onPageChange,
  onCategory,
  onCompare,
  onSort,
  onOpen,
  onCopy,
  onOpenSkill,
}: GalleryProps) {
  const totalPages = Math.max(1, Math.ceil(videos.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const [extra, setExtra] = useState(0);

  useEffect(() => {
    setExtra(0);
  }, [page, category, sort]);

  const pageVideos = videos.slice(start, start + PAGE_SIZE + extra);
  const remaining = videos.length - (start + PAGE_SIZE + extra);
  const items = pageItems(safePage, totalPages);

  function goTo(next: number) {
    onPageChange(next);
    requestAnimationFrame(() => {
      document.getElementById("videos")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <section
      id="videos"
      aria-labelledby="gallery-title"
      className="mx-auto w-full max-w-[1500px] scroll-mt-28 px-4 pt-6 pb-8 sm:px-6 lg:px-8"
      data-testid="videos-section"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2
          id="gallery-title"
          className="text-[clamp(1.5rem,2.4vw,1.875rem)] font-semibold tracking-[-0.035em]"
        >
          Browse {TOTAL_VIDEOS} Opus 5.5 videos
        </h2>
        <p className="pb-1 text-[12.5px] font-medium text-muted">
          {videos.length.toLocaleString()} prompts free to copy
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <nav aria-label="Video categories" className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const active = category === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onCategory(cat.key)}
                aria-pressed={active}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:outline-none",
                  active
                    ? "border-transparent bg-lime text-ink"
                    : "border-line bg-card/60 text-fg/70 hover:bg-card hover:text-fg"
                )}
              >
                <Icon name={cat.icon} className="size-4" />
                {cat.label}
                <span className={cn("tabular-nums", active ? "opacity-70" : "opacity-65")}>{cat.count}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            role="switch"
            aria-checked={compare}
            onClick={() => onCompare(!compare)}
            title="Show original and remake side by side"
            className="inline-flex h-9 items-center gap-2.5 rounded-full border border-line bg-card/60 pr-2.5 pl-3.5 text-[13px] font-medium text-fg/80 transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:outline-none"
          >
            Compare
            <span
              className={cn(
                "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                compare ? "bg-lime" : "bg-fg/15"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 size-4 rounded-full transition-transform duration-200",
                  compare ? "translate-x-4 bg-ink" : "bg-white shadow-sm dark:bg-cream"
                )}
              />
            </span>
          </button>

          <div className="relative">
            <select
              aria-label="Sort videos"
              value={sort}
              onChange={(event) => onSort(event.target.value)}
              className="h-9 cursor-pointer appearance-none rounded-full border border-line bg-card/60 pr-8 pl-3.5 text-[13px] font-medium text-fg/80 transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:outline-none"
            >
              <option value="trending">Trending</option>
              <option value="newest">Newest</option>
              <option value="az">A–Z</option>
              <option value="shortest">Shortest</option>
              <option value="longest">Longest</option>
            </select>
            <Icon
              name="chevron-down"
              className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted"
            />
          </div>
        </div>
      </div>

      {pageVideos.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-line-strong px-6 py-20 text-center">
          <span className="grid size-12 place-items-center rounded-full border border-line bg-card text-muted">
            <Icon name="search" className="size-5" />
          </span>
          <h3 className="mt-4 text-lg font-semibold">No videos in this collection yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Try a different category, or browse every video people have shared.
          </p>
          <button
            type="button"
            onClick={() => onCategory("all")}
            className="mt-5 inline-flex h-10 items-center rounded-full bg-fg px-4 text-[13px] font-semibold text-bg"
          >
            Show all {TOTAL_VIDEOS} videos
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 items-stretch gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageVideos.map((video, index) => (
            <Fragment key={video.slug}>
              <li className="min-w-0">
                <VideoCard
                  video={video}
                  compare={compare}
                  index={index}
                  onOpen={onOpen}
                  onCopy={onCopy}
                />
              </li>
              {safePage === 1 && index === 23 && (
                <li className="col-span-full py-1 sm:py-2">
                  <MidPromo onOpenSkill={onOpenSkill} />
                </li>
              )}
            </Fragment>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <div className="mt-7 flex justify-center">
          <button
            type="button"
            onClick={() => setExtra((value) => value + PAGE_SIZE)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-card/60 px-4 text-[13px] font-semibold transition-colors hover:border-fg/30 hover:bg-card"
          >
            Show {Math.min(PAGE_SIZE, remaining)} more videos
            <Icon name="chevron-down" className="size-4" />
          </button>
        </div>
      )}

      <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
        <p className="text-[12.5px] font-medium text-muted">
          Showing{" "}
          <span className="tabular-nums text-fg/80">
            {videos.length === 0 ? 0 : start + 1}–{Math.min(start + pageVideos.length, videos.length)}
          </span>{" "}
          of <span className="tabular-nums text-fg/80">{videos.length}</span>{" "}
          {videos.length === 1 ? "video" : "videos"}
          {compare && <span className="ml-2 hidden text-fg/50 sm:inline">· comparing originals and remakes</span>}
        </p>

        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={safePage <= 1}
            onClick={() => goTo(safePage - 1)}
            className="grid size-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-fg/[0.06] hover:text-fg disabled:pointer-events-none disabled:opacity-35"
          >
            <Icon name="chevron-left" className="size-4" />
          </button>

          {items.map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === safePage ? "page" : undefined}
                onClick={() => goTo(item)}
                className={cn(
                  "inline-flex h-9 min-w-9 items-center justify-center rounded-[10px] px-2.5 text-[13px] font-medium tabular-nums transition-colors",
                  item === safePage
                    ? "bg-fg font-semibold text-bg"
                    : "text-muted hover:bg-fg/[0.06] hover:text-fg"
                )}
              >
                {item}
              </button>
            ) : (
              <span
                key={item}
                aria-hidden="true"
                className="inline-flex h-9 w-7 items-center justify-center text-[13px] text-muted"
              >
                …
              </span>
            )
          )}

          <button
            type="button"
            aria-label="Next page"
            disabled={safePage >= totalPages}
            onClick={() => goTo(safePage + 1)}
            className="grid size-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-fg/[0.06] hover:text-fg disabled:pointer-events-none disabled:opacity-35"
          >
            <Icon name="chevron-right" className="size-4" />
          </button>
        </nav>
      </div>
    </section>
  );
}
