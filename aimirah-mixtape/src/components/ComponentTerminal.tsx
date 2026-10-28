import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ComponentTypePlural } from '../types/catalog';
import { AimirahTerminalMascot } from './Icons';

const TONE_HEX: Record<string, string> = {
  default: '#c9d1d9',
  gray: '#7d8590',
  green: '#3fb950',
  blue: '#58a6ff',
  cyan: '#39c5cf',
  yellow: '#d29922',
  orange: '#d57455',
  magenta: '#bc8cff',
};

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

type ScriptStep =
  | { kind: 'cmd'; text: string }
  | { kind: 'ask'; text: string }
  | { kind: 'out'; text: string; tone?: string }
  | { kind: 'work'; text: string; done: string; tone?: string; ms?: number }
  | { kind: 'welcome'; cwd: string }
  | { kind: 'wait'; ms: number };

function buildTerminalSteps(
  typePlural: ComponentTypePlural,
  title: string,
  path: string,
  installCmd: string
): ScriptStep[] {
  const shortSlug = path.split('/').pop()?.replace(/\.(md|json)$/i, '') ?? path;
  const installSteps: ScriptStep[] = [{ kind: 'cmd', text: installCmd }, { kind: 'out', text: '' }];
  const sessionSteps: ScriptStep[] = [];

  switch (typePlural) {
    case 'skills':
      installSteps.push(
        { kind: 'out', text: `▶ Deck loading skill track: ${path}`, tone: 'orange' },
        { kind: 'out', text: '📥 Pulling plain-file source from aimirah.mixtape registry...', tone: 'gray' },
        { kind: 'work', text: 'Verifying checksum & writing files', done: '✓ Wrote .claude/skills/' + shortSlug + '/SKILL.md', tone: 'green', ms: 650 },
        { kind: 'out', text: `✅ Skill "${shortSlug}" ready in project!`, tone: 'green' }
      );
      sessionSteps.push(
        { kind: 'cmd', text: 'claude' },
        { kind: 'welcome', cwd: '~/projects/my-app' },
        { kind: 'out', text: '' },
        { kind: 'ask', text: `Apply the ${shortSlug} skill to optimize this module` },
        { kind: 'out', text: `⏺ Skill(${shortSlug})`, tone: 'magenta' },
        { kind: 'out', text: `  ⎿  Loaded .claude/skills/${shortSlug}/SKILL.md`, tone: 'gray' },
        { kind: 'work', text: `Running ${title}`, done: '  ⎿  Updated 3 project files cleanly', tone: 'green', ms: 900 }
      );
      break;

    case 'agents':
      installSteps.push(
        { kind: 'out', text: `🤖 Installing subagent: ${path}`, tone: 'blue' },
        { kind: 'work', text: 'Downloading agent definition', done: `✓ Saved to .claude/agents/${shortSlug}.md`, tone: 'cyan', ms: 650 },
        { kind: 'out', text: `✅ Agent "${title}" installed!`, tone: 'green' }
      );
      sessionSteps.push(
        { kind: 'cmd', text: 'claude' },
        { kind: 'welcome', cwd: '~/projects/my-app' },
        { kind: 'out', text: '' },
        { kind: 'ask', text: `Delegate architecture review to @${shortSlug}` },
        { kind: 'out', text: `⏺ Task(${shortSlug})`, tone: 'magenta' },
        { kind: 'work', text: 'Subagent analyzing repository', done: '  ⎿  Completed (12 tool uses · 24.8k tokens)', tone: 'green', ms: 950 }
      );
      break;

    case 'commands':
      installSteps.push(
        { kind: 'out', text: `⚡ Installing slash command: ${path}`, tone: 'blue' },
        { kind: 'work', text: 'Writing command prompt', done: `✓ Installed .claude/commands/${shortSlug}.md`, tone: 'cyan', ms: 600 },
        { kind: 'out', text: `✅ Slash command "/${shortSlug}" active!`, tone: 'green' }
      );
      sessionSteps.push(
        { kind: 'cmd', text: 'claude' },
        { kind: 'welcome', cwd: '~/projects/my-app' },
        { kind: 'out', text: '' },
        { kind: 'ask', text: `/${shortSlug}` },
        { kind: 'out', text: `⏺ Command(/${shortSlug})`, tone: 'magenta' },
        { kind: 'work', text: 'Executing workflow', done: '  ⎿  Completed in 4.1s', tone: 'green', ms: 850 }
      );
      break;

    case 'mcps':
      installSteps.push(
        { kind: 'out', text: `🔌 Configuring MCP server: ${path}`, tone: 'blue' },
        { kind: 'out', text: '📝 Merging server entry into .mcp.json...', tone: 'yellow' },
        { kind: 'work', text: 'Validating transport handshake', done: `✅ MCP "${shortSlug}" merged into .mcp.json`, tone: 'green', ms: 700 }
      );
      sessionSteps.push(
        { kind: 'cmd', text: 'claude' },
        { kind: 'welcome', cwd: '~/projects/my-app' },
        { kind: 'out', text: '' },
        { kind: 'ask', text: '/mcp' },
        { kind: 'work', text: `Connecting to ${shortSlug}`, done: `  ${shortSlug}  ✔ connected (stdio)`, tone: 'green', ms: 800 },
        { kind: 'out', text: `⏺ ${title} tools available in session.`, tone: 'magenta' }
      );
      break;

    default:
      installSteps.push(
        { kind: 'out', text: `📦 Installing ${typePlural.slice(0, -1)}: ${path}`, tone: 'blue' },
        { kind: 'work', text: 'Merging configuration into .claude/', done: `✅ "${title}" installed successfully!`, tone: 'green', ms: 650 }
      );
      sessionSteps.push(
        { kind: 'cmd', text: 'claude' },
        { kind: 'welcome', cwd: '~/projects/my-app' },
        { kind: 'out', text: '' },
        { kind: 'out', text: `⏺ ${title} active in current workspace.`, tone: 'green' }
      );
      break;
  }

  return [...installSteps, { kind: 'wait', ms: 450 }, { kind: 'out', text: '' }, ...sessionSteps];
}

type RenderedEntry =
  | { type: 'line'; text: string; tone: string }
  | { type: 'welcome'; cwd: string };

export const ComponentTerminal: React.FC<{
  typePlural: ComponentTypePlural;
  title: string;
  path: string;
  installCmd: string;
}> = ({ typePlural, title, path, installCmd }) => {
  const steps = useMemo(
    () => buildTerminalSteps(typePlural, title, path, installCmd),
    [typePlural, title, path, installCmd]
  );

  const [lines, setLines] = useState<RenderedEntry[]>([]);
  const [typing, setTyping] = useState<{ prefix: string; text: string } | null>(null);
  const [finished, setFinished] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    setLines([]);
    setTyping(null);
    setFinished(false);

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    async function run() {
      for (const step of steps) {
        if (cancelled) return;
        if (step.kind === 'cmd' || step.kind === 'ask') {
          const prefix = step.kind === 'cmd' ? '$ ' : '❯ ';
          for (let i = 0; i <= step.text.length; i += 2) {
            if (cancelled) return;
            setTyping({ prefix, text: step.text.slice(0, i) });
            await sleep(24);
          }
          setTyping(null);
          setLines((prev) => [...prev, { type: 'line', text: `${prefix}${step.text}`, tone: 'default' }]);
          await sleep(140);
        } else if (step.kind === 'out') {
          setLines((prev) => [...prev, { type: 'line', text: step.text, tone: step.tone ?? 'default' }]);
          await sleep(90);
        } else if (step.kind === 'welcome') {
          setLines((prev) => [...prev, { type: 'welcome', cwd: step.cwd }]);
          await sleep(160);
        } else if (step.kind === 'work') {
          const duration = step.ms ?? 700;
          let frame = 0;
          setLines((prev) => [...prev, { type: 'line', text: `${SPINNER[0]} ${step.text}`, tone: 'orange' }]);
          const interval = window.setInterval(() => {
            frame = (frame + 1) % SPINNER.length;
            setLines((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = {
                type: 'line',
                text: `${SPINNER[frame]} ${step.text}`,
                tone: 'orange',
              };
              return copy;
            });
          }, 80);
          await sleep(duration);
          window.clearInterval(interval);
          if (cancelled) return;
          setLines((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              type: 'line',
              text: step.done,
              tone: step.tone ?? 'green',
            };
            return copy;
          });
        } else if (step.kind === 'wait') {
          await sleep(step.ms);
        }
      }
      if (!cancelled) setFinished(true);
    }

    run();
    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, [steps, replayCount]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, typing]);

  return (
    <div
      className="h-full min-h-[380px] rounded-[5px] border-2 border-black/65 flex flex-col overflow-hidden"
      style={{
        background: 'var(--color-display)',
        boxShadow: 'inset 0 3px 14px rgba(0,0,0,.8), 0 2px 0 var(--plate-hi), 0 6px 18px rgba(0,0,0,.28)',
      }}
    >
      {/* Terminal Window Titlebar */}
      <div className="px-4 py-2.5 border-b border-white/10 bg-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2 font-mono text-[11px] text-[#7d8590]">
            aimirah.mixtape — live preview
          </span>
        </div>
        <button
          type="button"
          onClick={() => setReplayCount((c) => c + 1)}
          className="text-[11px] font-mono text-[#7d8590] hover:text-[#e38d6e] px-2 py-0.5 rounded hover:bg-[#21262d] transition-colors cursor-pointer"
        >
          ↻ {finished ? 'Replay' : 'Restart'}
        </button>
      </div>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-[12px] leading-[1.65] space-y-0.5"
        style={{
          color: 'var(--color-display-amber)',
          textShadow: '0 0 7px rgba(255,180,84,.3)',
        }}
      >
        {lines.map((entry, idx) => {
          if (entry.type === 'welcome') {
            return (
              <div
                key={idx}
                className="my-2 p-3 rounded-lg border border-[#d57455]/45 bg-[#161b22]/80 flex items-center gap-3"
              >
                <AimirahTerminalMascot />
                <div className="min-w-0 text-[11px]">
                  <div className="font-semibold text-[#c9d1d9]">
                    Claude Code <span className="text-[#d57455]">× aimirah.mixtape</span>
                  </div>
                  <div className="text-[#7d8590] truncate">{entry.cwd}</div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              style={{ color: TONE_HEX[entry.tone] ?? TONE_HEX.default }}
              className="whitespace-pre-wrap break-all min-h-[18px]"
            >
              {entry.text}
            </div>
          );
        })}

        {typing && (
          <div className="whitespace-pre-wrap break-all text-[#c9d1d9]">
            <span className="text-[#d57455] font-bold">{typing.prefix}</span>
            {typing.text}
            <span className="terminal-cursor" />
          </div>
        )}
      </div>
    </div>
  );
};
