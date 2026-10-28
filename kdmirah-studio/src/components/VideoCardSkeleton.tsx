import { Icon } from "./Icon";
import type { Video } from "../lib/content";

export function VideoCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video rounded-2xl bg-fg/[0.06]" />
      <div className="mt-2 flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-fg/[0.06]" />
        <div className="h-4 w-16 rounded bg-fg/[0.06]" />
      </div>
    </div>
  );
}

export function VideoCardPosterFallback({ video }: { video: Video }) {
  return (
    <div className="absolute inset-0">
      <img src={video.img} alt="" className="size-full object-cover" />
      <span className="absolute inset-0 grid place-items-center bg-black/25">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-black/55 px-3 text-[11px] font-semibold text-white backdrop-blur-sm">
          <Icon name="play" className="size-3" />
          Preview
        </span>
      </span>
    </div>
  );
}
