import { Icon } from "./Icon";
import {
  CATEGORY_ICON,
  TOOL_ABBREVIATIONS,
  type Video,
} from "../lib/content";
import { cn } from "../utils/cn";

const CATEGORY_GRADIENT: Record<string, string> = {
  "Motion graphics": "from-[#e59a6f] via-[#b4552f] to-[#3a1f18]",
  Explainers: "from-[#7aa6d8] via-[#33557e] to-[#141d29]",
  "3D scenes": "from-[#9fbf8a] via-[#46663b] to-[#182018]",
  Games: "from-[#c5a0e0] via-[#69467f] to-[#211a29]",
};

export function VideoCard({
  video,
  compare,
  index,
  onOpen,
  onCopy,
}: {
  video: Video;
  compare: boolean;
  index: number;
  onOpen: (video: Video) => void;
  onCopy: (video: Video) => void;
}) {
  const icon = CATEGORY_ICON[video.category] ?? "movie";
  const gradient = CATEGORY_GRADIENT[video.category] ?? CATEGORY_GRADIENT["Motion graphics"];

  return (
    <article className="group relative flex h-full min-w-0 flex-col transition-transform duration-300 group-hover:-translate-y-1">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-thumb">
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
        <div className="absolute inset-0 grid place-items-center text-white/30">
          <Icon name={icon} className="size-10" strokeWidth={1.2} />
        </div>

        {compare ? (
          <div className="absolute inset-0 flex">
            <div className="relative h-full w-1/2 overflow-hidden">
              {video.img && (
                <img
                  src={video.img}
                  alt=""
                  loading={index < 8 ? "eager" : "lazy"}
                  decoding="async"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              )}
              <span className="absolute bottom-2 left-2 z-20 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white/95 backdrop-blur-sm">
                Original
              </span>
            </div>
            <div className="relative h-full w-1/2 overflow-hidden border-l border-white/70">
              {video.remakeImg ? (
                <img
                  src={video.remakeImg}
                  alt=""
                  loading={index < 8 ? "eager" : "lazy"}
                  decoding="async"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <span className="grid size-full place-items-center bg-ink/50 text-[10px] text-white/70">No remake</span>
              )}
              <span className="absolute bottom-2 left-2 z-20 rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-ink">
                Remake
              </span>
            </div>
            <span className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-[2px] -translate-x-1/2 bg-lime" />
            <span className="pointer-events-none absolute top-1/2 left-1/2 z-20 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ink/10 bg-lime text-ink shadow-[0_1px_6px_rgba(0,0,0,0.3)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
                aria-hidden="true"
              >
                <path d="M8 9l-4 3l4 3" />
                <path d="M16 9l4 3l-4 3" />
              </svg>
            </span>
          </div>
        ) : (
          video.img && (
            <img
              src={video.img}
              alt=""
              loading={index < 8 ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          )
        )}

        <button
          type="button"
          onClick={() => onOpen(video)}
          aria-label={`Open ${video.category.toLowerCase()} video by @${video.author}`}
          className="absolute inset-0 z-10 rounded-2xl focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none"
        >
          <span className="sr-only">Open video and its prompt</span>
        </button>

        <span
          title={video.category}
          className="pointer-events-none absolute top-2.5 left-2.5 z-20 grid size-6 place-items-center rounded-full bg-white/85 text-[#121313] shadow-sm backdrop-blur-sm"
        >
          <Icon name={icon} className="size-3.5" />
          <span className="sr-only">{video.category}</span>
        </span>

        <span className="pointer-events-none absolute right-2 bottom-2 z-20 inline-flex h-5 items-center rounded-full bg-black/55 px-1.5 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
          {video.duration}
        </span>

        <span className="pointer-events-none absolute top-1/2 left-1/2 z-20 grid size-11 -translate-x-1/2 -translate-y-1/2 scale-90 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-within:opacity-100">
          <Icon name="play" className="ml-0.5 size-4" />
        </span>

        <span className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex h-3/4 items-end bg-gradient-to-t from-black/85 via-black/35 to-transparent p-3 pr-4 text-[12px] leading-[1.45] text-white/92 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <span className="line-clamp-3">{video.prompt}</span>
        </span>
      </div>

      <div className="mt-1.5 flex h-7 min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onOpen(video)}
          className="min-w-0 truncate text-[13px] font-medium tracking-[-0.01em] text-fg/65 transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:outline-none"
        >
          @{video.author}
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {video.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              title={tag}
              className="grid size-5 place-items-center rounded-md border border-line/70 bg-fg/[0.055] text-[8.5px] font-bold tracking-[-0.02em] text-fg/55"
            >
              {TOOL_ABBREVIATIONS[tag] ?? tag.slice(0, 2).toUpperCase()}
              <span className="sr-only">{tag}</span>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onCopy(video)}
            aria-label={`Copy prompt by @${video.author}`}
            title="Copy prompt"
            className="grid size-7 place-items-center rounded-full text-fg/50 transition-[background-color,color,transform] hover:bg-fg/[0.07] hover:text-fg active:scale-95 focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:outline-none"
          >
            <Icon name="copy" className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
