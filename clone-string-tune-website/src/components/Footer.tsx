import { ArrowUpRight } from "lucide-react";
import { Button, Reveal, Star12 } from "../lib/ui";
const polygonUrl = "/images/polygon.jpg";

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden>
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <path d="m2.5 5.5 7.5 6 7.5-6" />
    </svg>
  );
}
function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M18.9 5.3A16.4 16.4 0 0 0 14.9 4l-.2.4c1.5.4 2.7 1 3.8 1.8a13 13 0 0 0-11 0c1.1-.8 2.4-1.4 3.8-1.8L11.1 4a16.4 16.4 0 0 0-4 1.3C4.5 9.1 3.8 12.8 4.1 16.4c1.7 1.3 3.3 2 4.9 2.6l.6-1a10 10 0 0 1-1.6-.8l.4-.3c3 1.4 6.3 1.4 9.2 0l.4.3c-.5.3-1 .6-1.6.8l.6 1c1.6-.5 3.2-1.3 4.9-2.6.4-4.2-.7-7.8-3-11.1ZM9.7 14c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7Zm4.6 0c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7Z" />
    </svg>
  );
}

const STATEMENTS = [
  "No JS until you truly need it.",
  "Captivating websites with ease.",
  "Build your own modules to extend its power.",
];

export default function Footer() {
  return (
    <footer className="relative overflow-clip bg-[var(--c-black)]" id="footer">
      {/* faint giant star */}
      <Star12
        className="pointer-events-none absolute -right-[12%] top-[4%] h-[46rem] w-[46rem] opacity-35"
        stroke="var(--c-grey-dark)"
        style={{ animation: "rot360 90s linear infinite" }}
      />

      <div className="w gt relative z-10 items-start pt-[var(--h0)]">
        {/* statements column */}
        <div className="order-3 col-span-6 mt-[var(--h3)] lg:order-1 lg:col-span-4 lg:mt-0">
          {STATEMENTS.map((s, i) => (
            <Reveal
              key={s}
              text={s}
              className={`fsi-h6 mb-[var(--h5)] max-w-[20em] ${
                i === 0 ? "text-[var(--c-white)]" : "text-[var(--c-purple)]"
              }`}
              step={7}
              delay={i * 120}
            />
          ))}
        </div>

        {/* headings */}
        <div className="order-1 col-span-6 lg:order-2 lg:col-span-7">
          <Reveal
            text="Attribute"
            className="sans fsi-h2 text-[var(--c-white)]"
            step={22}
          />
          <Reveal
            text="driven."
            className="sans fsi-h2 ml-[2.2em] text-[var(--c-red)]"
            step={22}
            delay={180}
          />
          <div className="mt-[var(--h4)]">
            <a
              href="https://mi4inc.com"
              target="_blank"
              rel="noreferrer"
              className="fsi-mm up inline-flex items-center gap-[.5rem] text-[var(--c-purple)] transition-colors duration-300 hover:text-[var(--c-red)]"
              data-cursor
            >
              Learn how
              <ArrowUpRight className="h-[1.1em] w-[1.1em]" />
            </a>
          </div>
        </div>

        {/* nav buttons */}
        <nav className="order-2 col-span-6 mt-[var(--h5)] flex flex-wrap items-center gap-[var(--g-gap)] lg:order-3 lg:col-span-3 lg:mt-0 lg:justify-end">
          <Button variant="-prime" href="https://mi4inc.com" className="!bg-[var(--c-white)] !text-[var(--c-black)]">
            mi4inc.com
          </Button>
          <Button
            variant="-prime"
            small
            href="mailto:hello@mi4inc.com"
            icon={<MailIcon />}
          >
            Contact
          </Button>
          <Button
            variant="-prime"
            small
            href="https://mi4inc.com"
            icon={<DiscordIcon />}
          >
            Community
          </Button>
        </nav>
      </div>

      {/* giant name with tree backdrop */}
      <div className="relative mt-[var(--h1)]">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[130%] bg-cover bg-[50%_30%] opacity-60"
          style={{
            backgroundImage: `url(${polygonUrl})`,
            maskImage: "linear-gradient(180deg, transparent 0%, #000 55%)",
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 55%)",
          }}
          aria-hidden
        />
        <div className="w relative z-10 overflow-clip">
          <p
            className="sans fsi-lrg select-none whitespace-nowrap text-center text-[var(--c-white)]"
            style={{ transform: "translateY(12%)" }}
            aria-label="MI4Inc."
          >
            MI4<span className="text-[var(--c-red)]">Inc.</span>
            <span className="align-top text-[.18em] text-[var(--c-purple)]">®</span>
          </p>
        </div>
      </div>

      {/* bottom bar */}
      <div className="relative z-10 border-t border-[rgba(var(--c-grey-dark-rgb),.4)] bg-[var(--c-black)]/70 backdrop-blur-sm">
        <div className="w gt items-center py-[var(--p)]">
          <p className="fsi-mm up col-span-6 flex items-center gap-[.5rem] text-[var(--c-purple)] lg:col-span-3">
            <span className="inline-block h-[.45rem] w-[.45rem] rounded-full bg-[var(--c-red)]" />
            © MI4Inc. — mi4inc.com
          </p>
          <p className="fsi-mm up col-span-6 mt-[.4rem] text-[var(--c-grey-dark)] lg:col-span-5 lg:mt-0 lg:text-center">
            For smooth scrolling and core web animations
          </p>
          <p className="fsi-mm up col-span-6 mt-[.4rem] text-[var(--c-grey-dark)] lg:col-span-4 lg:mt-0">
            CSS-First. JS-Light
          </p>
          <p className="fsi-mm up col-span-6 mt-[.4rem] text-right text-[var(--c-purple)] lg:col-span-2 lg:mt-0">
            ‘26
          </p>
        </div>
      </div>
    </footer>
  );
}
