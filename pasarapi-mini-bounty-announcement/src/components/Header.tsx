import { useEffect, useState } from 'react';
import { MYFlag } from './ui';
import { useKLTime } from '../hooks/useFx';

const NAV = [
  { href: '#fuel', label: '01 FUEL' },
  { href: '#forex', label: '02 FOREX' },
  { href: '#census', label: '03 CENSUS' },
  { href: '#births', label: '04 BIRTHS' },
  { href: '#income', label: '05 INCOME' },
  { href: '#directory', label: 'DIR' },
];

export function Header() {
  const { now } = useKLTime();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? h.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="backdrop-blur-xl bg-ink/70 border-b border-line">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-2.5 group">
            <MYFlag className="w-7 h-[18px]" />
            <span className="font-display text-sm tracking-tight text-white group-hover:text-neon-amber transition-colors">
              PASAR<span className="text-neon-amber group-hover:text-white transition-colors">.DATA</span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-5">
            {NAV.map(n => (
              <a
                key={n.href}
                href={n.href}
                className="font-mono text-[10px] tracking-[0.25em] text-mute hover:text-neon-green transition-colors"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse-dot" />
            <span className="font-mono text-[11px] tracking-[0.2em] text-white/85 tabular-nums">
              {now} <span className="text-mute">MYT</span>
            </span>
          </div>
        </div>
      </div>

      {/* Jalur Gemilang hairline */}
      <div
        className="h-[2px]"
        style={{ background: 'linear-gradient(90deg,#cc0001 0%,#010066 40%,#ffcc00 72%,#ffffff 100%)' }}
      />
      {/* scroll progress */}
      <div className="h-[2px] -mt-[2px]">
        <div
          className="h-full bg-gradient-to-r from-neon-amber via-neon-pink to-neon-green transition-[width] duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </header>
  );
}
