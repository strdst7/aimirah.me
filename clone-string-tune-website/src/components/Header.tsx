import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Globe } from "lucide-react";
import { Button, useLenis } from "../lib/ui";

/* MI4 monogram */
function MI4Mark() {
  return (
    <svg
      viewBox="0 0 76 96"
      className="block w-[1.5rem]"
      fill="var(--c-purple)"
      aria-hidden
    >
      <path d="M6 90V14L38 62 70 14v76H56.5V46L38 78 19.5 46v44H6Z" />
      <rect x="60" y="86" width="14" height="4" fill="var(--c-red)" />
    </svg>
  );
}

export default function Header() {
  const lenis = useLenis();
  const [hidden, setHidden] = useState(false);
  const [min, setMin] = useState(false);
  const [light, setLight] = useState(true);
  const [progress, setProgress] = useState(0);
  const last = useRef(0);
  const ready = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => (ready.current = true), 100);
    let raf = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const doc = document.documentElement.scrollHeight - vh;
      setProgress(doc > 0 ? Math.min(1, y / doc) : 0);
      setMin(y > 40);
      setHidden(y > last.current && y > vh * 1.2);
      last.current = y;
      // hero is the light grey section; use its measured end
      const hero = document.getElementById("c-tree");
      if (hero) {
        const r = hero.getBoundingClientRect();
        setLight(r.bottom > 80);
      }
    };
    const tick = () => {
      onScroll();
      raf = requestAnimationFrame(tick);
    };
    if (lenis) lenis.on("scroll", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    onScroll();
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [lenis]);

  return (
    <header
      id="site-header"
      className={`fixed inset-x-0 top-0 z-[102] pointer-events-none transition-transform duration-[600ms] ease-[var(--f-cubic)] ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${light ? "-light" : ""}`}
      style={{
        opacity: ready.current ? 1 : 0,
        transitionProperty: "transform, opacity",
        paddingTop: "var(--h4)",
      }}
    >
      {/* soft scrim over light hero */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-[200%] w-full transition-opacity duration-[900ms]"
        style={{
          opacity: light ? 1 : 0,
          background:
            "linear-gradient(180deg, rgba(16,18,20,.12), rgba(16,18,20,.05) 40%, transparent 85%)",
        }}
      />
      <div className="w gt items-center relative">
        {/* MI4 mark — center-left, fades out on scroll (desktop) */}
        <a
          href="https://mi4inc.com"
          target="_blank"
          rel="noreferrer"
          data-cursor
          className="pointer-events-auto relative hidden lg:flex justify-self-center items-end h-[1.6rem] transition-all duration-[600ms] ease-[var(--f-cubic)]"
          style={{
            gridColumn: "1 / span 1",
            opacity: min ? 0 : 1,
            translate: min ? "0 calc(var(--h5) * -1)" : "0 0",
          }}
          aria-label="mi4inc.com"
        >
          <MI4Mark />
          <span
            className="absolute left-full bottom-full"
            style={{ color: "var(--c-purple)", fontSize: "var(--mm)" }}
          >
            ®
          </span>
        </a>

        {/* symbol */}
        <a
          href="#top"
          data-cursor
          aria-label="MI4Inc."
          onClick={(e) => {
            e.preventDefault();
            lenis?.scrollTo(0);
          }}
          className="pointer-events-auto relative flex h-[1.6rem] justify-self-start group"
          style={{ gridColumn: "2 / span 1" }}
        >
          <span
            className="absolute inset-0 rounded-[var(--mm)] transition-all duration-[600ms] ease-[var(--f-cubic-in)]"
            style={{ boxShadow: "0 .4rem 1.2rem rgba(84,77,86,.35)" }}
          />
          <span
            className="relative flex rounded-[calc(var(--mm)*.8)] overflow-hidden transition-[clip-path] duration-[600ms] ease-[var(--f-cubic-in)] bg-[var(--c-red)]"
            style={{
              clipPath: min
                ? "inset(0 50% 0 0 round calc(var(--mm)*.8))"
                : "inset(0 0 0 0 round calc(var(--mm)*.8))",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.clipPath =
                "inset(0 0 0 0 round calc(var(--mm)*.8))";
            }}
          >
            <span className="grid aspect-square h-[1.6rem] w-[1.6rem] place-items-center">
              <ArrowUpRight className="h-[1.1rem] w-[1.1rem] text-white" strokeWidth={2.4} />
            </span>
          </span>
        </a>

        {/* wordmark */}
        <a
          href="#top"
          data-cursor
          onClick={(e) => {
            e.preventDefault();
            lenis?.scrollTo(0);
          }}
          className="pointer-events-auto sans whitespace-nowrap justify-self-start transition-all duration-[600ms] ease-[var(--f-cubic)] fsi-p"
          style={{
            gridColumn: "3 / span 4",
            opacity: min ? 1 : 0,
            translate: min ? "0 0" : "calc(var(--h5) * -1) 0",
            pointerEvents: min ? "auto" : "none",
          }}
        >
          MI4Inc.
          <span
            className="align-super"
            style={{ fontSize: "var(--m)", lineHeight: 0 }}
          >
            ©
          </span>
        </a>

        {/* right — buttons */}
        <div
          className="pointer-events-auto flex items-center justify-end gap-[var(--g-gap)] col-span-3 lg:col-span-4 col-end-[-1]"
        >
          <Button
            variant="-prime"
            small
            className="hidden sm:inline-flex"
            href="https://mi4inc.com"
            icon={<Globe className="h-4 w-4" strokeWidth={2} />}
            aria-label="mi4inc.com"
          />
          <Button
            className="hidden xs:inline-flex sm:inline-flex"
            href="https://mi4inc.com"
          >
            Get Started
          </Button>
        </div>

        {/* scroll progress */}
        <div
          className="pointer-events-none hidden lg:flex items-center justify-self-end"
          style={{ gridColumn: "14 / span 1" }}
        >
          <span className="relative block h-[1.6rem] w-[2px] overflow-hidden rounded-full bg-white/10">
            <span
              className="absolute inset-x-0 top-0 origin-top rounded-full bg-[var(--c-red)]"
              style={{ height: "100%", transform: `scaleY(${progress})` }}
            />
          </span>
        </div>
      </div>
    </header>
  );
}
