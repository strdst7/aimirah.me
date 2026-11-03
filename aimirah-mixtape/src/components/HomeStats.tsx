import React, { useEffect, useState, useRef } from 'react';
import { JOBS_DATA, TRENDING_DATA } from '../data/catalog';

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
  // Real catalogue metrics. Previously these were invented figures that
  // incremented on a setInterval with Math.random(), which made the site
  // advertise numbers it could not substantiate (see CONCERNS.md #9).
  const downloads = TRENDING_DATA?.globalStats?.totalDownloads ?? 0;
  const prs = JOBS_DATA?.totalJobs ?? 0;
  const npmInstalls = TRENDING_DATA?.globalStats?.monthlyDownloads ?? 0;

  const items: StatConfig[] = [
    {
      key: 'downloads',
      label: 'Downloads',
      base: downloads,
      title: 'All-time component downloads reported in the catalogue snapshot — click to view analytics',
      onClick: onOpenTrending,
    },
    {
      key: 'prs',
      label: 'Open Roles',
      base: prs,
      title: 'Open roles listed in the aimirah.mixtape jobs board',
      href: 'https://github.com/aimirah/mixtape',
    },
    {
      key: 'npm',
      label: 'npm Installs',
      base: npmInstalls,
      title: 'Monthly downloads reported for the aimirah.mixtape catalogue',
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
