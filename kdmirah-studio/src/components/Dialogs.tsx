import { useEffect, useState, type ReactNode } from "react";
import { Icon, Logo, Wordmark } from "./Icon";
import { SITE, type Skill } from "../lib/content";
import { lockScroll, unlockScroll } from "../lib/scrollLock";
import { cn } from "../utils/cn";

function Overlay({
  children,
  onClose,
  label,
  width = "max-w-[560px]",
}: {
  children: ReactNode;
  onClose: () => void;
  label: string;
  width?: string;
}) {
  useEffect(() => {
    lockScroll();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/60 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "animate-scale-in my-auto w-full overflow-hidden rounded-[24px] border border-line bg-bg shadow-[0_40px_120px_rgba(0,0,0,0.45)]",
          width
        )}
      >
        {children}
      </div>
    </div>
  );
}

function CloseButton({ onClose, light = false }: { onClose: () => void; light?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close dialog"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full transition-colors",
        light
          ? "bg-black/35 text-white backdrop-blur-sm hover:bg-black/55"
          : "border border-line text-muted hover:bg-soft hover:text-fg"
      )}
    >
      <Icon name="x" className="size-4" />
    </button>
  );
}

export function SkillDialog({
  skill,
  onClose,
  onInstall,
}: {
  skill: Skill;
  onClose: () => void;
  onInstall: (skill: Skill) => void;
}) {
  const command = `npx kdmirah add ${skill.slug}`;

  return (
    <Overlay onClose={onClose} label={`${skill.title} Skill`} width="max-w-[720px]">
      <div className="relative aspect-[16/8] overflow-hidden bg-thumb">
        <img src={skill.image} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute top-3 right-3">
          <CloseButton onClose={onClose} light />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-lime px-2.5 text-[10.5px] font-bold tracking-wide text-ink uppercase">
              <Icon name="sparkles" className="size-3" />
              Agent Skill
            </span>
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-white/15 px-2 text-[10.5px] font-semibold text-white backdrop-blur-sm">
              <Icon name="movie" className="size-3" />
              {skill.output}
            </span>
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-white/15 px-2 text-[10.5px] font-semibold text-white backdrop-blur-sm">
              <Icon name="download" className="size-3" />
              {skill.installs} installs
            </span>
          </div>
          <h2 className="mt-2 text-[20px] leading-tight font-semibold tracking-[-0.03em] sm:text-[24px]">
            {skill.title}
          </h2>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-[13.5px] leading-[1.65] text-fg/75">{skill.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {skill.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-line bg-card/70 px-2.5 py-1 text-[11px] font-medium text-muted"
            >
              {tag}
            </span>
          ))}
          <span className="rounded-full border border-line bg-card/70 px-2.5 py-1 text-[11px] font-medium text-muted">
            +{skill.versions} variants
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-panel">
          <div className="flex items-center gap-2 border-b border-line px-3 py-2">
            <Icon name="code" className="size-3.5 text-muted" />
            <span className="text-[11px] font-semibold text-muted">Install with CLI</span>
            <span className="ml-auto rounded-full bg-lime px-2 py-0.5 text-[9.5px] font-bold text-ink">
              Free to install
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-3">
            <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[12px] whitespace-nowrap text-fg/80 no-scrollbar">
              {command}
            </code>
            <button
              type="button"
              onClick={() => onInstall(skill)}
              aria-label="Copy install command"
              className="grid size-7 shrink-0 place-items-center rounded-lg border border-line bg-bg text-muted transition-colors hover:text-fg"
            >
              <Icon name="copy" className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => onInstall(skill)}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-fg text-[13.5px] font-semibold text-bg transition-opacity hover:opacity-85"
          >
            <Icon name="download" className="size-4" />
            Install this Skill
          </button>
          <a
            href={SITE.archiveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line-strong px-4 text-[13.5px] font-semibold transition-colors hover:bg-card"
          >
            <Icon name="github" className="size-3.5" />
            See the archive
          </a>
        </div>

        <p className="mt-3 text-center text-[11px] text-muted">
          Maintained by {SITE.name} · Works with Claude Code, Codex, Cursor and 8 more agents
        </p>
      </div>
    </Overlay>
  );
}

export function AuthDialog({
  onClose,
  onNotify,
}: {
  onClose: () => void;
  onNotify: (message: string) => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const valid = /.+@.+\..+/.test(email) && password.length >= 6;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) {
      setError("Enter a valid email and a password of at least 6 characters.");
      return;
    }
    setError("");
    setDone(true);
    onNotify(mode === "signin" ? "Signed in (demo)" : "Account created (demo)");
  }

  return (
    <Overlay onClose={onClose} label={`Sign in to ${SITE.name}`} width="max-w-[430px]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Logo className="size-9 rounded-xl" />
            <Wordmark className="text-[15px]" />
          </div>
          <CloseButton onClose={onClose} />
        </div>

        {done ? (
          <div className="py-6 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-lime text-ink">
              <Icon name="check" className="size-6" strokeWidth={2.4} />
            </span>
            <h2 className="mt-4 text-[22px] font-semibold tracking-[-0.03em]">
              {mode === "signin" ? "Welcome back" : "You're in"}
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              {mode === "signin" ? "Signed in" : "Account created"} as{" "}
              <span className="font-semibold text-fg">{email}</span>. This is a demo, no account was created.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 h-11 w-full rounded-full bg-fg text-[13.5px] font-semibold text-bg"
            >
              Continue browsing
            </button>
          </div>
        ) : (
          <>
            <h2 className="mt-4 text-[22px] font-semibold tracking-[-0.03em]">
              {mode === "signin" ? `Sign in to ${SITE.name}` : `Create your ${SITE.name} account`}
            </h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
              {mode === "signin"
                ? "Save Skills and sync installs across your agents."
                : "Free account, no card needed. Save Skills and keep your installs in sync."}
            </p>

            <button
              type="button"
              onClick={() => {
                setEmail("creator@kdmirah.studio");
                setPassword("kdmirah-demo");
                onNotify("GitHub OAuth is disabled in this demo");
              }}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line-strong bg-card/60 text-[13px] font-semibold transition-colors hover:bg-card"
            >
              <Icon name="github" className="size-4" />
              Continue with GitHub
            </button>

            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="text-[11px] font-medium text-muted">or</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <form onSubmit={submit} className="grid gap-3">
              <label className="grid gap-1.5 text-[12px] font-semibold">
                Email
                <span className="relative">
                  <Icon name="mail" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@studio.com"
                    className="h-11 w-full rounded-xl border border-line bg-card/60 pr-3 pl-9 text-[13px] font-normal outline-none placeholder:text-muted focus:border-fg/30"
                  />
                </span>
              </label>
              <label className="grid gap-1.5 text-[12px] font-semibold">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  className="h-11 w-full rounded-xl border border-line bg-card/60 px-3 text-[13px] font-normal outline-none placeholder:text-muted focus:border-fg/30"
                />
              </label>
              {error && <p className="text-[11.5px] text-[#b5412c]">{error}</p>}
              <button
                type="submit"
                className="mt-1 h-11 w-full rounded-full bg-fg text-[13.5px] font-semibold text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="mt-4 text-center text-[12px] text-muted">
              {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setError("");
                }}
                className="font-semibold text-fg underline decoration-[1px] underline-offset-2"
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
            <p className="mt-3 text-center text-[10.5px] text-muted">
              Demo experience. No credentials are sent or stored.
            </p>
          </>
        )}
      </div>
    </Overlay>
  );
}
