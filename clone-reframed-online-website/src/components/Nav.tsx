import { useCallback, useState } from "react";
import { useVisibleInterval } from "@aimirah/shared/useMotion";
import { scrollToId, scrollToTop } from "../lib/scroll";

export const NAV_LINKS = [
  { label: "The Idea", id: "idea" },
  { label: "The Experiments", id: "lab" },
  { label: "The Index", id: "index" },
  { label: "The Outro", id: "contact" },
];

interface Props {
  open: boolean;
  onToggle: () => void;
  ready: boolean;
}

/** Fixed bar in difference blend so it survives both stars and imagery. */
export default function Nav({ open, onToggle, ready }: Props) {
  const [time, setTime] = useState("");

  // Ticks only while the tab is visible (CONCERNS.md #18).
  useVisibleInterval(
    useCallback(() => {
      const d = new Date();
      setTime(
        `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`
      );
    }, []),
    1000
  );

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[90] flex items-center justify-between px-5 py-4 mix-blend-difference transition-transform duration-700 md:px-10 ${
        ready ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        data-hover
        className="font-display text-lg uppercase leading-none tracking-wide text-bone"
        aria-label="Back to top"
      >
        kdmirah<span className="text-[0.55em] align-super">®</span>
      </button>

      <div className="hidden items-center gap-8 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/60 md:flex">
        <span>Digital inspiration lab</span>
        <span className="text-bone/30">·</span>
        <span className="tabular-nums">Local {time}</span>
      </div>

      <button
        type="button"
        data-hover
        onClick={onToggle}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="group flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone"
      >
        <span className="hidden sm:block">{open ? "Close" : "Menu"}</span>
        <span className="relative flex h-8 w-8 items-center justify-center">
          <span
            className={`absolute h-px w-5 bg-bone transition-all duration-300 ${
              open ? "rotate-45" : "-translate-y-1 group-hover:w-3.5"
            }`}
          />
          <span
            className={`absolute h-px w-5 bg-bone transition-all duration-300 ${
              open ? "-rotate-45" : "translate-y-1 group-hover:w-3.5"
            }`}
          />
        </span>
      </button>
    </nav>
  );
}

export function MenuOverlay({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate: (id: string) => void;
}) {
  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[80] flex flex-col justify-between bg-ink/80 px-5 pb-8 pt-28 backdrop-blur-xl transition-all duration-500 md:px-10 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal">
        Navigation / The lab directory
      </p>
      <ul className="flex flex-col gap-2">
        {NAV_LINKS.map((link, i) => (
          <li key={link.id} className="overflow-hidden">
            <button
              type="button"
              disabled={!open}
              onClick={() => {
                onNavigate(link.id);
              }}
              className="group flex w-full items-baseline gap-6 text-left transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: open ? "translateY(0)" : "translateY(110%)",
                transitionDelay: `${120 + i * 70}ms`,
              }}
            >
              <span className="font-mono text-[10px] tracking-[0.25em] text-smoke">
                0{i + 1}
              </span>
              <span
                className="text-outline font-display uppercase leading-[1.02] tracking-tight transition-all duration-500 group-hover:translate-x-4 group-hover:text-bone"
                style={{
                  fontSize: "clamp(2.4rem, 8vw, 7rem)",
                  WebkitTextStroke: undefined,
                }}
              >
                {link.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-smoke">
        <button
          type="button"
          disabled={!open}
          onClick={() => onNavigate("top")}
          className="text-left text-bone/70 underline-offset-4 hover:text-signal hover:underline"
        >
          Back to the surface ↑
        </button>
        <span>004 pairs — MMXXVI</span>
      </div>
    </div>
  );
}

export function useMenu(): [
  boolean,
  () => void,
  (id: string) => void
] {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);
  const navigate = (id: string) => {
    setOpen(false);
    window.setTimeout(() => {
      if (id === "top") scrollToTop();
      else scrollToId(id);
    }, 350);
  };
  return [open, toggle, navigate];
}
