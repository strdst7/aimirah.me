import { ChevronDown, Database, Heart, Radio, Zap } from 'lucide-react';
import { useKLTime } from '../hooks/useFx';
import { Reveal } from './ui';

export function Hero() {
  const { date } = useKLTime();

  return (
    <div id="top" className="relative overflow-hidden">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-neon-amber/20 blur-[140px]" />
      <div className="pointer-events-none absolute top-10 -right-40 w-[520px] h-[520px] rounded-full bg-neon-pink/15 blur-[160px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-[420px] h-[420px] rounded-full bg-neon-cyan/10 blur-[140px]" />
      <div className="absolute inset-0 bg-blueprint" />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-32 md:pt-40 pb-16 md:pb-24">
        <Reveal>
            <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-neon-amber border border-neon-amber/30 rounded-full px-3.5 py-1.5 bg-neon-amber/5">
              <Zap className="w-3 h-3" /> KRACKED DEVS × PASARAPI
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-mute border border-line rounded-full px-3.5 py-1.5">
              {date} · KUALA LUMPUR
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-neon-pink border border-neon-pink/30 rounded-full px-3.5 py-1.5 bg-neon-pink/5">
              <Heart className="w-3 h-3 fill-neon-pink" /> kdmirah
            </span>
          </div>
        </Reveal>

        <h1 className="relative font-display uppercase leading-[0.83] tracking-tight select-none">
          <Reveal delay={80}>
            <span className="block text-outline text-[19vw] md:text-[9.5rem]">PASAR</span>
          </Reveal>
          <Reveal delay={180}>
            <span className="block text-[19vw] md:text-[9.5rem] text-white">
              DATA<span className="text-neon-amber glow-amber">.</span>
            </span>
          </Reveal>
          {/* ghost word behind */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -left-2 font-display uppercase text-[20vw] md:text-[10rem] leading-none text-outline-faint -z-10"
          >
            MALAYSIA
          </span>
        </h1>

        <div className="mt-12 md:mt-16 grid md:grid-cols-2 gap-8 items-end">
          <Reveal delay={260}>
            <p className="text-mute font-mono text-sm leading-relaxed max-w-md">
              Live government open data, styled like a{' '}
              <span className="text-neon-pink">pasar malam</span> after dark — petrol boards,
              money-changer LEDs and census stalls. Six feeds from{' '}
              <span className="text-white">data.gov.my</span>, discovered via{' '}
              <a
                href="https://pasarapi.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-amber underline decoration-neon-amber/40 underline-offset-4 hover:decoration-neon-amber"
              >
                PasarAPI.xyz
              </a>
              .
            </p>
          </Reveal>

          <Reveal delay={340}>
            <div className="flex md:justify-end gap-6 md:gap-10">
              {[
                { icon: Radio, big: '06', small: 'LIVE FEEDS' },
                { icon: Database, big: '958', small: 'APIS IN DIRECTORY' },
                { icon: Zap, big: '0', small: 'API KEYS REQUIRED' },
              ].map(s => (
                <div key={s.small} className="text-left md:text-right">
                  <s.icon className="w-3.5 h-3.5 text-mute mb-2 md:ml-auto" />
                  <p className="font-display text-2xl md:text-3xl text-white tabular-nums">{s.big}</p>
                  <p className="font-mono text-[9px] tracking-[0.25em] text-mute mt-1">{s.small}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={420}>
          <div className="mt-14 flex items-center gap-3 text-mute">
            <ChevronDown className="w-4 h-4 animate-bounce" />
            <span className="font-mono text-[10px] tracking-[0.35em] uppercase">
              Scroll into the pasar
            </span>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
