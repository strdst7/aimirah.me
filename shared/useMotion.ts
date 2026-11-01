import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion` and re-renders when the OS setting changes.
 *
 * Sites previously checked the media query ad hoc (or not at all), so the
 * starfield, cursor, and counters kept animating for users who asked for
 * reduced motion (CONCERNS.md #8). Gate every rAF/interval/canvas component
 * on this hook and freeze to a static frame when it returns true.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * True while the tab is visible. Use it to pause rAF loops and setIntervals
 * that would otherwise burn CPU in background tabs (CONCERNS.md #18).
 */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState !== "hidden"
  );

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return visible;
}

/**
 * Runs `callback` on an interval, but only while the tab is visible.
 *
 * Fires once immediately so the initial value is correct, then pauses the
 * timer on `visibilitychange` and resynchronises when the tab returns. Use
 * this instead of a bare setInterval for clocks and counters (CONCERNS #18).
 */
export function useVisibleInterval(callback: () => void, intervalMs: number): void {
  useEffect(() => {
    let id: number | undefined;

    const start = () => {
      callback();
      stop();
      id = window.setInterval(callback, intervalMs);
    };
    const stop = () => {
      if (id !== undefined) {
        window.clearInterval(id);
        id = undefined;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") stop();
      else start();
    };

    if (document.visibilityState !== "hidden") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [callback, intervalMs]);
}
