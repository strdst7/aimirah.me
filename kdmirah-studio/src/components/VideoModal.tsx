import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import {
  POPULAR_SKILLS,
  profileUrl,
  SITE,
  type Skill,
  type Video,
} from "../lib/content";
import { lockScroll, unlockScroll } from "../lib/scrollLock";
import { cn } from "@aimirah/shared/cn";

export function VideoModal({
  video,
  index,
  count,
  onClose,
  onNavigate,
  onCopy,
  onOpenSkill,
}: {
  video: Video;
  index: number;
  count: number;
  onClose: () => void;
  onNavigate: (direction: 1 | -1) => void;
  onCopy: (video: Video) => void;
  onOpenSkill: (skill: Skill) => void;
}) {
  const originalRef = useRef<HTMLVideoElement>(null);
  const remakeRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [originalFailed, setOriginalFailed] = useState(false);
  const [remakeFailed, setRemakeFailed] = useState(false);

  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNavigate(1);
      if (event.key === "ArrowLeft") onNavigate(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNavigate]);

  useEffect(() => {
    const refs = [originalRef.current, remakeRef.current];
    refs.forEach((el) => {
      if (!el) return;
      el.muted = true;
      el.currentTime = 0;
      void el.play().catch(() => setPlaying(false));
    });
    setPlaying(true);
    setOriginalFailed(false);
    setRemakeFailed(false);
  }, [video.slug]);

  function togglePlay() {
    const refs = [originalRef.current, remakeRef.current];
    if (playing) {
      refs.forEach((el) => el?.pause());
      setPlaying(false);
    } else {
      refs.forEach((el) => {
        if (el) void el.play().catch(() => undefined);
      });
      setPlaying(true);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Video by @${video.author}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="animate-scale-in relative my-0 w-full max-w-[1180px] overflow-hidden bg-bg shadow-[0_40px_120px_rgba(0,0,0,0.45)] sm:my-auto sm:rounded-[26px] sm:border sm:border-line">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/92 px-4 py-3 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-card/60 pr-3 pl-2 text-[12.5px] font-semibold text-fg/75 transition-colors hover:bg-card sm:gap-2 sm:pl-2.5"
          >
            <Icon name="arrow-left" className="size-4" />
            <span className="hidden sm:inline">All Opus 5.5 videos</span>
            <span className="sm:hidden">Back</span>
          </button>

          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-muted">
            @{video.author} <span className="mx-1 opacity-50">/</span> {video.category}
          </span>

          <span className="hidden text-[11.5px] font-medium text-muted tabular-nums sm:inline">
            {index + 1} / {count}
          </span>

          <button
            type="button"
            onClick={() => onCopy(video)}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-lime px-3.5 text-[12.5px] font-semibold text-ink transition-colors hover:bg-[#e8432b]"
          >
            <Icon name="copy" className="size-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">Copy prompt</span>
            <span className="sm:hidden">Copy</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:bg-soft hover:text-fg"
          >
            <Icon name="x" className="size-4" />
          </button>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-gradient-to-br from-[#ff4f36] to-[#ffb199] text-[13px] font-bold text-ink">
              {video.author.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-[19px] font-semibold tracking-[-0.03em] sm:text-[22px]">
                  @{video.author}
                </h2>
                <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-line bg-card px-2 text-[11px] font-medium text-muted">
                  <Icon name="movie" className="size-3" />
                  {video.category}
                </span>
                <span className="inline-flex h-6 items-center gap-1 rounded-full border border-line bg-card px-2 text-[11px] font-medium text-muted tabular-nums">
                  <Icon name="clock" className="size-3" />
                  {video.duration}
                </span>
              </div>
              <p className="mt-0.5 text-[12.5px] text-muted">
                Prompt shared by the creator · remake generated with Claude Opus 5.5
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-card/70 px-3.5 text-[12.5px] font-semibold transition-colors hover:bg-card"
              >
                <Icon name={playing ? "pause" : "play"} className="size-3.5" />
                {playing ? "Pause both" : "Play both"}
              </button>
              <a
                href={profileUrl(video.author)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-card/70 px-3.5 text-[12.5px] font-semibold transition-colors hover:bg-card"
              >
                View original post
                <Icon name="external" className="size-3.5" />
              </a>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-line bg-thumb">
              <div className="flex h-10 items-center gap-2 border-b border-white/10 bg-[#161716] px-3 text-white">
                <span className="grid size-5 place-items-center rounded-full bg-white/15">
                  <Icon name="play" className="size-2.5" />
                </span>
                <span className="text-[12px] font-semibold">Original</span>
                <span className="text-[11.5px] text-white/55">@{video.author}</span>
                <span className="ml-auto text-[10.5px] text-white/55 tabular-nums">{video.duration}</span>
              </div>
              {video.video && !originalFailed ? (
                <video
                  ref={originalRef}
                  src={video.video}
                  poster={video.img}
                  controls
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onError={() => setOriginalFailed(true)}
                  className="aspect-video w-full bg-black object-cover"
                />
              ) : (
                <div className="relative aspect-video w-full bg-black">
                  <img src={video.img} alt="" className="size-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 text-[11px] text-white/80">
                    <Icon name="external" className="size-3.5" />
                    Preview unavailable in this browser —{" "}
                    <a
                      href={profileUrl(video.author)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-lime underline underline-offset-2"
                    >
                      view the original post
                    </a>
                  </span>
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-thumb">
              <div className="flex h-10 items-center gap-2 border-b border-white/10 bg-[#161716] px-3 text-white">
                <span className="grid size-5 place-items-center rounded-full bg-lime/25 text-lime">
                  <Icon name="sparkles" className="size-2.5" />
                </span>
                <span className="text-[12px] font-semibold">Remake</span>
                <span className="text-[11.5px] text-white/55">{SITE.handle}</span>
                <span className="ml-auto rounded-full bg-lime px-1.5 py-0.5 text-[9.5px] font-bold tracking-wide text-ink uppercase">
                  Live
                </span>
              </div>
              {video.remakeVideo && !remakeFailed ? (
                <video
                  ref={remakeRef}
                  src={video.remakeVideo}
                  poster={video.remakeImg || video.img}
                  controls
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onError={() => setRemakeFailed(true)}
                  className="aspect-video w-full bg-black object-cover"
                />
              ) : (
                <div className="relative aspect-video w-full bg-black">
                  <img
                    src={video.remakeImg || video.img}
                    alt=""
                    className="size-full object-cover"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 text-[11px] text-white/80">
                    <Icon name="sparkles" className="size-3.5 text-lime" />
                    Remade with Claude Opus 5.5 by {SITE.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-card">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
                <Icon name="code" className="size-4 text-muted" />
                Prompt
              </span>
              <span className="rounded-full bg-fg/[0.06] px-2 py-0.5 text-[10.5px] font-semibold text-muted">
                Free to copy
              </span>
              <button
                type="button"
                onClick={() => onCopy(video)}
                className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-bg/60 px-3 text-[12px] font-semibold transition-colors hover:bg-bg"
              >
                <Icon name="copy" className="size-3.5" />
                Copy prompt
              </button>
            </div>
            <div className="thin-scrollbar max-h-[19rem] overflow-y-auto p-4 sm:p-5">
              <p className="text-[13.5px] leading-[1.7] whitespace-pre-wrap text-fg/80">{video.prompt}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.09em] text-muted uppercase">Keep creating</p>
                <h3 className="mt-1 text-[19px] font-semibold tracking-[-0.03em]">
                  Make videos like this with your agent
                </h3>
              </div>
              <a
                href="#skills"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-fg/75 hover:text-fg"
              >
                All video Skills
                <Icon name="arrow-right" className="size-3.5" />
              </a>
            </div>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {POPULAR_SKILLS.map((skill) => (
                <button
                  key={skill.slug}
                  type="button"
                  onClick={() => onOpenSkill(skill)}
                  className="group/skill overflow-hidden rounded-xl border border-line bg-card/70 text-left transition-colors hover:bg-card"
                >
                  <span className="relative block aspect-video overflow-hidden">
                    <img
                      src={skill.image}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 group-hover/skill:scale-[1.04]"
                    />
                    <span className="absolute top-1.5 left-1.5 inline-flex h-5 items-center gap-1 rounded-full bg-white/85 px-1.5 text-[9.5px] font-bold text-ink backdrop-blur-sm">
                      <Icon name="download" className="size-2.5" />
                      {skill.installs}
                    </span>
                  </span>
                  <span className="block truncate px-2.5 py-2 text-[11.5px] font-semibold">{skill.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => onNavigate(-1)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-card/60 px-3.5 text-[12.5px] font-semibold transition-colors hover:bg-card"
            >
              <Icon name="chevron-left" className="size-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={onClose}
              className="hidden text-[12px] font-medium text-muted hover:text-fg sm:inline"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onNavigate(1)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border border-line bg-card/60 px-3.5 text-[12.5px] font-semibold transition-colors hover:bg-card"
              )}
            >
              Next
              <Icon name="chevron-right" className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
