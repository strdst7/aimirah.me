import { useEffect, useRef, useState } from 'react';

/** IntersectionObserver hook — flips true once when the element scrolls into view. */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/** rAF animated counter with ease-out-expo easing. Runs when `start` is true. */
export function useAnimatedNumber(target: number, start: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(2, -10 * p);
      setValue(target * (p === 1 ? 1 : eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, start, duration]);

  return value;
}

/** Live Kuala Lumpur wall clock. */
export function useKLTime() {
  const [now, setNow] = useState('--:--:--');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(
        d.toLocaleTimeString('en-MY', {
          timeZone: 'Asia/Kuala_Lumpur',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setDate(
        d
          .toLocaleDateString('en-MY', {
            timeZone: 'Asia/Kuala_Lumpur',
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
          .toUpperCase()
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { now, date };
}
