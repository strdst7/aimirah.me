import { ArrowUp, Heart, Trophy } from 'lucide-react';
import { MYFlag, Reveal } from './ui';

export function Footer() {
  return (
    <footer className="relative border-t border-line overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 w-[700px] h-[380px] rounded-full bg-neon-amber/10 blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-20 pb-10">
        <Reveal>
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-mute mb-4">
            // end of transmission
          </p>
          <h2 className="font-display uppercase leading-[0.85] text-[15vw] md:text-8xl">
            <span className="text-white">TERIMA</span>{' '}
            <span className="text-outline">KASIH</span>
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-10 grid md:grid-cols-3 gap-8 items-start">
            <div className="flex items-start gap-3">
              <MYFlag className="w-9 h-[22px] mt-0.5" />
              <p className="font-mono text-[11px] leading-relaxed text-mute max-w-[240px]">
                PASAR.DATA — a night-market of Malaysian open data. Every number on this page is
                pulled live, no API key needed.
              </p>
            </div>

            <div className="font-mono text-[11px] space-y-2.5">
              <p className="text-mute tracking-[0.25em] text-[9px] mb-3">FEEDS CONSUMED</p>
              {[
                ['data.gov.my', 'fuelprice · exchangerates · births'],
                ['data.gov.my', 'population_state · hies_state'],
                ['pasarapi.xyz', '/api/catalogue'],
              ].map(([host, what]) => (
                <p key={what} className="text-white/70">
                  <span className="text-neon-green">{host}</span>
                  <span className="text-mute"> / {what}</span>
                </p>
              ))}
            </div>

            <div className="font-mono text-[11px] md:text-right space-y-2.5">
              <p className="text-mute tracking-[0.25em] text-[9px] mb-3">ENTRY</p>
              <a
                href="https://krackeddevs.com/code/bounty/pasarapi-bounty"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-neon-amber hover:text-white transition-colors"
              >
                <Trophy className="w-3.5 h-3.5" /> KRACKED DEVS × PASARAPI BOUNTY
              </a>
              <p className="text-mute">data · CC BY 4.0 · data.gov.my</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-14 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-[10px] tracking-[0.2em] text-mute inline-flex items-center gap-2">
              BUILT WITH <Heart className="w-3 h-3 text-neon-pink fill-neon-pink" /> + REACT + RECHARTS
              <span className="text-white/20">·</span>
              <span className="text-white/60">MALAYSIA BOLEH</span>
            </p>
            <a
              href="#top"
              className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-mute hover:text-neon-green transition-colors"
            >
              BACK TO TOP <ArrowUp className="w-3 h-3" />
            </a>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
