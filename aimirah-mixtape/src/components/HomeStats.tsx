import React, { useEffect, useState, useRef } from 'react';

interface StatConfig {
  key: string;
  label: string;
  base: number;
  title: string;
  onClick?: () => void;
  href?: string;
}

const DIGIT_STRIP = Array.from({ length: 40 }, (_, i) => i % 10);

const RollingDigit: React.FC<{ digit: number; spins: number; delay: number }> = ({
  digit,
  spins,
  delay,
}) => {
  const [pos, setPos] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const raf = requestAnimationFrame(() => {
        setPos(spins * 10 + digit);
      });
      return () => cancelAnimationFrame(raf);
    }
    setPos((prev) => {
      const diff = (digit - (prev % 10) + 10) % 10;
      if (diff === 0) return prev;
      const next = prev + diff;
      return next >= 39 ? digit : next;
    });
  }, [digit, spins]);

  return (
    <span className="hs-digit" aria-hidden="true">
      <span
        className="hs-strip"
        style={{
          transform: `translateY(-${pos * 1.15}em)`,
          transition: `transform 720ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        }}
      >
        {DIGIT_STRIP.map((num, idx) => (
          <span className="hs-cell" key={idx}>
            {num}
          </span>
        ))}
      </span>
    </span>
  );
};

const OdometerNumber: React.FC<{ value: number }> = ({ value }) => {
  const formatted = value.toLocaleString('en-US');
  const totalDigits = formatted.replace(/\D/g, '').length;
  let digitIdx = -1;

  return (
    <span className="hs-value">
      <span className="sr-only">{formatted}</span>
      {formatted.split('').map((ch, i) => {
        if (ch < '0' || ch > '9') {
          return (
            <span className="hs-sep" aria-hidden="true" key={i}>
              {ch}
            </span>
          );
        }
        digitIdx += 1;
        const fromRight = totalDigits - 1 - digitIdx;
        return (
          <RollingDigit
            key={i}
            digit={Number(ch)}
            spins={1 + Math.min(fromRight, 2)}
            delay={digitIdx * 35}
          />
        );
      })}
    </span>
  );
};

export const HomeStats: React.FC<{
  onOpenTrending: () => void;
  onOpenDocs: () => void;
}> = ({ onOpenTrending, onOpenDocs }) => {
  const [downloads, setDownloads] = useState(1618534);
  const [prs, setPrs] = useState(284);
  const [npmInstalls, setNpmInstalls] = useState(249812);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDownloads((d) => d + (Math.random() > 0.35 ? 1 : 2));
      if (Math.random() > 0.72) {
        setNpmInstalls((n) => n + 1);
      }
      if (Math.random() > 0.96) {
        setPrs((p) => p + 1);
      }
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  const items: StatConfig[] = [
    {
      key: 'downloads',
      label: 'Downloads',
      base: downloads,
      title: 'Components installed through the aimirah-mixtape CLI, all time — click to view live analytics',
      onClick: onOpenTrending,
    },
    {
      key: 'prs',
      label: 'Mixtape PRs',
      base: prs,
      title: 'Merged community pull requests adding or improving a component',
      href: 'https://github.com/aimirah/mixtape',
    },
    {
      key: 'npm',
      label: 'npm Installs',
      base: npmInstalls,
      title: 'Installs of aimirah-mixtape CLI package on npm',
      onClick: onOpenDocs,
    },
  ];

  return (
    <div className="hs-root">
      {items.map((stat, idx) => (
        <div className="hs-item" key={stat.key}>
          {idx > 0 && <span className="hs-divider" aria-hidden="true" />}
          {stat.href ? (
            <a
              href={stat.href}
              target="_blank"
              rel="noopener noreferrer"
              title={stat.title}
              className="hs-cell-wrap hs-link cursor-pointer"
            >
              <OdometerNumber value={stat.base} />
              <span className="hs-label">{stat.label}</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={stat.onClick}
              title={stat.title}
              className="hs-cell-wrap hs-link cursor-pointer"
            >
              <OdometerNumber value={stat.base} />
              <span className="hs-label">{stat.label}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
