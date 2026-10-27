import { useEffect, useRef } from "react";
import { Icon } from "./Icon";

export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current(), 3200);
    return () => window.clearTimeout(timer);
  }, [message]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 z-[120] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 animate-fade-up items-center gap-2.5 rounded-full border border-white/10 bg-ink py-2.5 pr-4 pl-2.5 text-[12.5px] font-medium text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] dark:border-lime/30 dark:bg-lime dark:text-ink"
    >
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-lime text-ink dark:bg-ink dark:text-lime">
        <Icon name="check" className="size-3.5" strokeWidth={2.4} />
      </span>
      <span className="line-clamp-2">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="ml-1 grid size-5 shrink-0 place-items-center rounded-full text-white/60 hover:text-white dark:text-ink/60 dark:hover:text-ink"
      >
        <Icon name="x" className="size-3.5" />
      </button>
    </div>
  );
}
