interface Props {
  items: string[];
  reverse?: boolean;
  className?: string;
  outline?: boolean;
}

/** Seamless typographic ticker used as a section divider. */
export default function Marquee({ items, reverse, className = "", outline = true }: Props) {
  const row = (
    <>
      {items.map((item, i) => (
        <span
          key={i}
          className={`mx-6 whitespace-nowrap font-display uppercase leading-none md:mx-10 ${
            outline ? "text-outline" : "text-bone"
          }`}
          style={{ fontSize: "clamp(2.2rem, 6vw, 5.5rem)" }}
        >
          {item}
          <span
            aria-hidden
            className="ml-6 font-mono text-signal md:ml-10"
            style={{ fontSize: "0.5em", WebkitTextStroke: 0, color: undefined }}
          >
            //
          </span>
        </span>
      ))}
    </>
  );

  return (
    <div
      aria-hidden
      className={`mask-fade-x overflow-hidden border-y border-bone/10 py-4 md:py-6 ${className}`}
    >
      <div className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}>
        {row}
        {row}
      </div>
    </div>
  );
}
