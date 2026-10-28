import React from 'react';
import { ComponentTypePlural } from '../types/catalog';

export const TYPE_META: Record<
  ComponentTypePlural,
  {
    label: string;
    singular: string;
    color: string;
    flag: string;
    installDir: string;
    ext: string;
  }
> = {
  skills: {
    label: 'Skills',
    singular: 'skill',
    color: '#f59e0b',
    flag: '--skill',
    installDir: '.claude/skills',
    ext: 'SKILL.md',
  },
  agents: {
    label: 'Agents',
    singular: 'agent',
    color: '#3b82f6',
    flag: '--agent',
    installDir: '.claude/agents',
    ext: '.md',
  },
  commands: {
    label: 'Commands',
    singular: 'command',
    color: '#10b981',
    flag: '--command',
    installDir: '.claude/commands',
    ext: '.md',
  },
  settings: {
    label: 'Settings',
    singular: 'setting',
    color: '#8b5cf6',
    flag: '--setting',
    installDir: '.claude/settings.json',
    ext: '.json',
  },
  hooks: {
    label: 'Hooks',
    singular: 'hook',
    color: '#f97316',
    flag: '--hook',
    installDir: '.claude/settings.json',
    ext: '.json',
  },
  mcps: {
    label: 'MCPs',
    singular: 'mcp',
    color: '#06b6d4',
    flag: '--mcp',
    installDir: '.mcp.json',
    ext: '.json',
  },
  mods: {
    label: 'Mods',
    singular: 'mod',
    color: '#a3e635',
    flag: '--mod',
    installDir: '.claude/skills',
    ext: 'hooks.json',
  },
  loops: {
    label: 'Loops',
    singular: 'loop',
    color: '#ec4899',
    flag: '--loop',
    installDir: '.claude/loops',
    ext: '.md',
  },
};

export const TypeIcon: React.FC<{
  type: ComponentTypePlural;
  size?: number;
  className?: string;
}> = ({ type, size = 16, className = '' }) => {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };

  switch (type) {
    case 'skills':
      return (
        <svg {...props}>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    case 'agents':
      return (
        <svg {...props}>
          <rect x="4" y="4" width="16" height="16" rx="4" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <path d="M9 17h6" />
          <path d="M12 2v2" />
          <path d="M2 10h2" />
          <path d="M20 10h2" />
        </svg>
      );
    case 'commands':
      return (
        <svg {...props}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...props}>
          <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'hooks':
      return (
        <svg {...props}>
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      );
    case 'mcps':
      return (
        <svg {...props}>
          <path d="M4 14.899A7 7 0 1115.71 8h1.79a4.5 4.5 0 012.5 8.242" />
          <path d="M12 12v9" />
          <path d="M8 17l4 4 4-4" />
        </svg>
      );
    case 'mods':
      return (
        <svg {...props}>
          <path d="M8 4H6a2 2 0 00-2 2v3c0 1.1-.9 2-2 2 1.1 0 2 .9 2 2v3a2 2 0 002 2h2" />
          <path d="M16 4h2a2 2 0 012 2v3c0 1.1.9 2 2 2-1.1 0-2 .9-2 2v3a2 2 0 01-2 2h-2" />
          <path d="M10 15l2-6 2 6" />
        </svg>
      );
    case 'loops':
      return (
        <svg {...props}>
          <path d="M21 12a9 9 0 11-2.64-6.36" />
          <polyline points="21 3 21 8 16 8" />
        </svg>
      );
  }
};

/**
 * Custom Pixel-Art Terracotta Cassette / Claude Mascot for aimirah.mixtape
 * Keeps the iconic terracotta pixel silhouette of aitmpl.com while adding dual spinning magnetic tape reels
 */
export const AimirahMascot: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 select-none ${className}`}
    aria-label="aimirah.mixtape pixel mascot"
  >
    {/* Pixel antenna & top bevel */}
    <rect x="14" y="10" width="52" height="6" rx="1" fill="#e38d6e" />
    <rect x="8" y="16" width="64" height="44" rx="4" fill="#d57455" />
    {/* Inner dark studio cassette deck window */}
    <rect x="14" y="23" width="52" height="24" rx="2" fill="#14100e" />
    {/* Top mixtape label strip */}
    <rect x="16" y="18" width="48" height="3" rx="1" fill="#fbd6c6" fillOpacity="0.65" />
    {/* Left spinning tape reel */}
    <g className="animate-reel" style={{ transformOrigin: '27px 35px' }}>
      <circle cx="27" cy="35" r="7.5" fill="#d57455" />
      <circle cx="27" cy="35" r="3.2" fill="#14100e" />
      <rect x="26" y="26.5" width="2" height="3" fill="#14100e" />
      <rect x="26" y="40.5" width="2" height="3" fill="#14100e" />
      <rect x="18.5" y="34" width="3" height="2" fill="#14100e" />
      <rect x="32.5" y="34" width="3" height="2" fill="#14100e" />
    </g>
    {/* Magnetic tape bridge */}
    <rect x="36" y="32" width="8" height="6" rx="1" fill="#2a211d" stroke="#e38d6e" strokeWidth="1" />
    {/* Right spinning tape reel */}
    <g className="animate-reel" style={{ transformOrigin: '53px 35px' }}>
      <circle cx="53" cy="35" r="7.5" fill="#d57455" />
      <circle cx="53" cy="35" r="3.2" fill="#14100e" />
      <rect x="52" y="26.5" width="2" height="3" fill="#14100e" />
      <rect x="52" y="40.5" width="2" height="3" fill="#14100e" />
      <rect x="44.5" y="34" width="3" height="2" fill="#14100e" />
      <rect x="58.5" y="34" width="3" height="2" fill="#14100e" />
    </g>
    {/* Bottom cassette trapezoid bridge */}
    <path d="M22 59L26 51H54L58 59H22Z" fill="#b35c3e" />
    <circle cx="32" cy="55" r="1.5" fill="#14100e" />
    <circle cx="48" cy="55" r="1.5" fill="#14100e" />
    {/* Iconic pixel feet matching Claude Code mascot silhouette */}
    <rect x="13" y="60" width="8" height="11" rx="1.5" fill="#d57455" />
    <rect x="27" y="60" width="8" height="9" rx="1.5" fill="#c46648" />
    <rect x="45" y="60" width="8" height="9" rx="1.5" fill="#c46648" />
    <rect x="59" y="60" width="8" height="11" rx="1.5" fill="#d57455" />
  </svg>
);

export const AimirahTerminalMascot: React.FC = () => (
  <svg width="32" height="23" viewBox="0 0 21 15" aria-hidden="true" className="mt-0.5 shrink-0">
    <g fill="#cd8a6d">
      <rect x="0" y="0" width="21" height="10" rx="1" />
      <rect x="1" y="9.5" width="2.2" height="4.8" rx="0.5" />
      <rect x="6.2" y="9.5" width="2.2" height="4.2" rx="0.5" />
      <rect x="11.9" y="9.5" width="2.2" height="4.2" rx="0.5" />
      <rect x="16.9" y="9.5" width="2.2" height="4.8" rx="0.5" />
    </g>
    <g fill="#14100e">
      <circle cx="6.2" cy="5" r="2.2" />
      <circle cx="14.8" cy="5" r="2.2" />
      <rect x="9.3" y="4.2" width="2.4" height="1.6" rx="0.3" />
    </g>
    <g fill="#e38d6e">
      <circle cx="6.2" cy="5" r="0.8" />
      <circle cx="14.8" cy="5" r="0.8" />
    </g>
  </svg>
);

const FLAG_PALETTES: Record<string, [string, string, string]> = {
  US: ['#0052b4', '#d80027', '#eeeeee'],
  BR: ['#6da544', '#ffda44', '#0052b4'],
  KR: ['#eeeeee', '#d80027', '#0052b4'],
  CN: ['#d80027', '#ffda44', '#d80027'],
  ES: ['#d80027', '#ffda44', '#d80027'],
  GB: ['#0052b4', '#eeeeee', '#d80027'],
  DE: ['#222222', '#d80027', '#ffda44'],
  FR: ['#0052b4', '#eeeeee', '#d80027'],
  IN: ['#ff9811', '#eeeeee', '#6da544'],
  JP: ['#eeeeee', '#d80027', '#eeeeee'],
  CA: ['#d80027', '#eeeeee', '#d80027'],
  AU: ['#0052b4', '#d80027', '#eeeeee'],
  IT: ['#6da544', '#eeeeee', '#d80027'],
  TR: ['#d80027', '#eeeeee', '#d80027'],
  MX: ['#6da544', '#eeeeee', '#d80027'],
};

export const CountryFlag: React.FC<{ code: string }> = ({ code }) => {
  const upper = (code || 'GL').toUpperCase();
  const [c1, c2, c3] = FLAG_PALETTES[upper] ?? ['#21262d', '#d57455', '#5e6ad2'];
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full overflow-hidden border border-[var(--color-border)] shrink-0">
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="0" y="0" width="24" height="8" fill={c1} />
        <rect x="0" y="8" width="24" height="8" fill={c2} />
        <rect x="0" y="16" width="24" height="8" fill={c3} />
      </svg>
    </span>
  );
};
