import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./Icon";
import { CATEGORIES, videos, type CategoryKey, type Video } from "../lib/content";
import { lockScroll, unlockScroll } from "../lib/scrollLock";
import { cn } from "@aimirah/shared/cn";

export function SearchDialog({
  onClose,
  onSelect,
  onCategory,
}: {
  onClose: () => void;
  onSelect: (video: Video) => void;
  onCategory: (key: CategoryKey) => void;
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    lockScroll();
    inputRef.current?.focus();
    return () => unlockScroll();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return videos.slice(0, 7);
    return videos
      .filter(
        (video) =>
          video.author.toLowerCase().includes(q) ||
          video.category.toLowerCase().includes(q) ||
          video.prompt.toLowerCase().includes(q) ||
          video.tags.some((tag) => tag.toLowerCase().includes(q))
      )
      .slice(0, 9);
  }, [query]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setCursor((c) => Math.min(c + 1, Math.max(results.length - 1, 0)));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      }
      if (event.key === "Enter" && results[cursor]) {
        event.preventDefault();
        onSelect(results[cursor]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onSelect, results, cursor]);

  return (
    <div
      className="fixed inset-0 z-[95] flex items-start justify-center bg-ink/55 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Search videos and prompts"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="animate-scale-in mt-[6vh] w-full max-w-[640px] overflow-hidden rounded-2xl border border-line bg-bg shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Icon name="search" className="size-[18px] text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search 418 videos, prompts, creators…"
            aria-label="Search videos, prompts and creators"
            className="min-w-0 flex-1 bg-transparent text-[14.5px] text-fg outline-none placeholder:text-muted"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="grid size-7 place-items-center rounded-full text-muted hover:bg-soft hover:text-fg"
            >
              <Icon name="x" className="size-3.5" />
            </button>
          ) : (
            <span className="hidden items-center gap-1 rounded-md border border-line bg-card px-1.5 py-0.5 text-[10.5px] font-medium text-muted sm:inline-flex">
              <Icon name="keyboard" className="size-3" /> ⌘K
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="grid size-7 place-items-center rounded-full border border-line text-muted hover:bg-soft hover:text-fg"
            aria-label="Close search"
          >
            <Icon name="x" className="size-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 px-3 pt-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                onCategory(cat.key);
                onClose();
                requestAnimationFrame(() =>
                  document.getElementById("videos")?.scrollIntoView({ behavior: "smooth" })
                );
              }}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-line bg-card/60 px-2.5 text-[11.5px] font-medium text-fg/70 transition-colors hover:bg-card hover:text-fg"
            >
              <Icon name={cat.icon} className="size-3" />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="thin-scrollbar max-h-[52vh] overflow-y-auto p-2">
          <p className="px-2.5 py-2 text-[10.5px] font-semibold tracking-[0.09em] text-muted uppercase">
            {query.trim() ? `${results.length} matches` : "Trending prompts"}
          </p>

          {results.length === 0 ? (
            <div className="grid place-items-center px-6 py-12 text-center">
              <span className="grid size-10 place-items-center rounded-full bg-soft text-muted">
                <Icon name="search" className="size-4" />
              </span>
              <p className="mt-3 text-[14px] font-semibold">No videos found for “{query}”</p>
              <p className="mt-1 text-[12.5px] text-muted">Try a creator, a tool like “Three.js”, or a category.</p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 h-8 rounded-full border border-line bg-card px-3 text-[12px] font-semibold"
              >
                Clear search
              </button>
            </div>
          ) : (
            results.map((video, i) => (
              <button
                key={video.slug}
                type="button"
                onMouseEnter={() => setCursor(i)}
                onClick={() => onSelect(video)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors",
                  cursor === i ? "bg-soft" : "hover:bg-soft/70"
                )}
              >
                <span className="relative h-11 w-[74px] shrink-0 overflow-hidden rounded-lg bg-thumb">
                  <img src={video.img} alt="" loading="lazy" className="size-full object-cover" />
                  <span className="absolute right-1 bottom-1 rounded bg-black/65 px-1 text-[8.5px] font-semibold text-white tabular-nums">
                    {video.duration}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[12.5px] font-semibold">@{video.author}</span>
                    <span className="shrink-0 rounded-full border border-line px-1.5 py-0.5 text-[9.5px] font-medium text-muted">
                      {video.category}
                    </span>
                  </span>
                  <span className="mt-0.5 line-clamp-1 block text-[11.5px] leading-snug text-muted">
                    {video.prompt}
                  </span>
                </span>
                <Icon name="arrow-up-right" className="size-3.5 shrink-0 text-muted" />
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-card/40 px-4 py-2.5 text-[10.5px] font-medium text-muted">
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-line bg-bg px-1 py-0.5">↑</kbd>
              <kbd className="rounded border border-line bg-bg px-1 py-0.5">↓</kbd> to navigate
            </span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <kbd className="rounded border border-line bg-bg px-1 py-0.5">↵</kbd> to open
            </span>
          </span>
          <span>Prompts free to copy</span>
        </div>
      </div>
    </div>
  );
}
