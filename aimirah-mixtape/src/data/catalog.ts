import rawSnapshot from './catalogSnapshot.json';
import {
  CatalogItem,
  ComponentTypePlural,
  CountryStat,
  JobPosting,
  MixtapeCollection,
  PluginMarketplace,
  TrendingRankItem,
} from '../types/catalog';
import { TYPE_META } from '../components/Icons';

export const CLI_PACKAGE = 'npx aimirah-mixtape@latest';

export const ASCII_BANNER = [
  ' █████╗ ██╗███╗   ███╗██╗██████╗  █████╗ ██╗  ██╗   ███╗   ███╗██╗██╗  ██╗████████╗ █████╗ ██████╗ ███████╗',
  '██╔══██╗██║████╗ ████║██║██╔══██╗██╔══██╗██║  ██║   ████╗ ████║██║╚██╗██╔╝╚══██╔══╝██╔══██╗██╔══██╗██╔════╝',
  '███████║██║██╔████╔██║██║██████╔╝███████║███████║   ██╔████╔██║██║ ╚███╔╝    ██║   ███████║██████╔╝█████╗  ',
  '██╔══██║██║██║╚██╔╝██║██║██╔══██╗██╔══██║██╔══██║   ██║╚██╔╝██║██║ ██╔██╗    ██║   ██╔══██║██╔═══╝ ██╔══╝  ',
  '██║  ██║██║██║ ╚═╝ ██║██║██║  ██║██║  ██║██║  ██║██╗██║ ╚═╝ ██║██║██╔╝ ██╗   ██║   ██║  ██║██║     ███████╗',
  '╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝     ╚══════╝',
].join('\n');

export function stripExt(pathOrName?: string): string {
  return (pathOrName ?? '').replace(/\.(md|json)$/i, '');
}

export function formatComponentTitle(name?: string): string {
  if (!name) return '';
  return name
    .replace(/\.(md|json)$/i, '')
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => {
      const upper = ['mcp', 'api', 'cli', 'ui', 'ux', 'sql', 'pr', 'ci', 'cd', 'aws', 'gcp', 'llm', 'ai', 'ssr', 'tdd', 'qa'];
      if (upper.includes(w.toLowerCase())) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

export function buildSingleInstallCmd(item: { typePlural: ComponentTypePlural; path: string }): string {
  const meta = TYPE_META[item.typePlural] ?? TYPE_META.skills;
  return `${CLI_PACKAGE} ${meta.flag} ${stripExt(item.path)}`;
}

function rebrandText(text: string): string {
  return text
    .replace(/claude-code-templates/gi, 'aimirah-mixtape')
    .replace(/aitmpl\.com/gi, 'aimirah.mixtape');
}

function synthesizeFileContent(item: {
  name: string;
  path: string;
  category: string;
  typePlural: ComponentTypePlural;
  description: string;
  version?: string;
  license?: string;
}): string {
  const slug = stripExt(item.name);
  const title = formatComponentTitle(item.name);

  if (item.typePlural === 'mcps') {
    return JSON.stringify(
      {
        mcpServers: {
          [slug]: {
            command: 'npx',
            args: ['-y', `@aimirah-mcp/${slug}@latest`],
            env: {
              [`${slug.replace(/[^a-z0-9]/gi, '_').toUpperCase()}_API_KEY`]: '${YOUR_API_KEY}',
              MIXTAPE_SOURCE: 'aimirah.mixtape',
            },
          },
        },
      },
      null,
      2
    );
  }

  if (item.typePlural === 'hooks') {
    return JSON.stringify(
      {
        hooks: {
          PreToolUse: [
            {
              matcher: 'Bash|Edit|Write',
              hooks: [
                {
                  type: 'command',
                  command: `bash .claude/hooks/${slug}.sh`,
                  timeout: 15,
                },
              ],
            },
          ],
        },
        _mixtapeMeta: {
          name: item.name,
          category: item.category,
          description: item.description,
          installedVia: `${CLI_PACKAGE} --hook ${stripExt(item.path)}`,
        },
      },
      null,
      2
    );
  }

  if (item.typePlural === 'settings') {
    return JSON.stringify(
      {
        permissions: {
          allow: ['Read(*)', 'Grep(*)', 'Glob(*)', 'Bash(npm run test:*)', 'Bash(git status:*)'],
          deny: ['Read(.env.*)', 'Bash(rm -rf:*)'],
        },
        env: {
          CLAUDE_CODE_MAX_OUTPUT_TOKENS: '16384',
          AIMIRAH_PROFILE: slug,
        },
        description: item.description,
      },
      null,
      2
    );
  }

  return `---
name: ${slug}
category: ${item.category}
registry: aimirah.mixtape
version: ${item.version || '1.4.0'}
license: ${item.license || 'MIT'}
---

# ${title}

${item.description}

## When to Invoke

- Activate **${title}** whenever working inside \`${item.category}\` workflows or reviewing related pull requests.
- Combines cleanly with other tracks in your \`aimirah.mixtape\` stack via \`${CLI_PACKAGE}\`.

## Execution Protocol

1. **Context Discovery**: Inspect repository structure, package manifests, and existing conventions before proposing changes.
2. **Deterministic Verification**: Run targeted typechecks, linters, and test suites after edits to guarantee zero regressions.
3. **Structured Output**: Summarize root causes, modified files, and follow-up recommendations in concise engineering notes.

## Quick Install

\`\`\`bash
${CLI_PACKAGE} ${TYPE_META[item.typePlural].flag} ${stripExt(item.path)}
\`\`\`
`;
}

const ALL_TYPES: ComponentTypePlural[] = [
  'skills',
  'agents',
  'commands',
  'settings',
  'hooks',
  'mcps',
  'mods',
  'loops',
];

const snapshot = rawSnapshot as unknown as {
  counts: Record<string, number>;
  byType: Record<ComponentTypePlural, Array<Record<string, unknown>>>;
  trending: {
    lastUpdated: string;
    globalStats: {
      totalComponents: number;
      totalDownloads: number;
      monthlyDownloads: number;
      weeklyDownloads: number;
      todayDownloads: number;
      totalCountries: number;
    };
    topCountries: CountryStat[];
    trending: Record<string, TrendingRankItem[]>;
    chartData: {
      dates: string[];
      series: Record<string, number[]>;
    };
  };
  jobs: {
    totalJobs: number;
    jobs: JobPosting[];
  };
};

export const CATALOG_BY_TYPE: Record<ComponentTypePlural, CatalogItem[]> = {} as Record<
  ComponentTypePlural,
  CatalogItem[]
>;

for (const t of ALL_TYPES) {
  const rawList = snapshot.byType?.[t] ?? [];
  CATALOG_BY_TYPE[t] = rawList.map((raw) => {
    const cleanDesc = rebrandText(
      String(raw.description || `Production-ready ${TYPE_META[t].singular} configuration curated for Claude Code.`)
    );
    const rawContent = raw.content ? rebrandText(String(raw.content)) : undefined;
    const itemBase = {
      name: String(raw.name || ''),
      path: String(raw.path || raw.name || ''),
      category: String(raw.category || 'general'),
      type: String(raw.type || TYPE_META[t].singular),
      typePlural: t,
      description: cleanDesc,
      author: String(raw.author || 'aimirah'),
      version: String(raw.version || '1.2.0'),
      license: String(raw.license || 'MIT'),
      downloads: Number(raw.downloads || 0),
      skillspector: raw.skillspector as CatalogItem['skillspector'],
    };
    return {
      ...itemBase,
      content: rawContent || synthesizeFileContent(itemBase),
    };
  });
}

export const ALL_CATALOG_ITEMS: CatalogItem[] = ALL_TYPES.flatMap((t) => CATALOG_BY_TYPE[t]);

export const CATALOG_COUNTS: Record<ComponentTypePlural | 'plugins', number> = {
  skills: snapshot.counts?.skills ?? 891,
  agents: snapshot.counts?.agents ?? 422,
  commands: snapshot.counts?.commands ?? 288,
  settings: snapshot.counts?.settings ?? 77,
  hooks: snapshot.counts?.hooks ?? 63,
  mcps: snapshot.counts?.mcps ?? 107,
  mods: snapshot.counts?.mods ?? 44,
  loops: snapshot.counts?.loops ?? 18,
  plugins: 12,
};

export const PLUGIN_MARKETPLACES: PluginMarketplace[] = [
  {
    id: 'aimirah-core-tape',
    name: 'aimirah/core-mixtape-plugins',
    repo: 'https://github.com/aimirah/core-mixtape-plugins',
    author: 'aimirah',
    description:
      'Flagship collection of full-stack skills, TDD agents, pre-commit safety hooks, and zero-config MCP servers curated for shipping production software.',
    stars: 4820,
    pluginCount: 28,
    tags: ['featured', 'full-stack', 'agents', 'hooks'],
    installCmd: '/plugin marketplace add aimirah/core-mixtape-plugins',
    featured: true,
  },
  {
    id: 'anthropic-official-skills',
    name: 'anthropics/claude-code-plugins',
    repo: 'https://github.com/anthropics/claude-code',
    author: 'Anthropic',
    description:
      'Official reference skills, code review workflows, PR automation commands, and sandbox security configurations maintained for Claude Code.',
    stars: 19400,
    pluginCount: 16,
    tags: ['official', 'code-review', 'security'],
    installCmd: '/plugin marketplace add anthropics/claude-code',
    featured: true,
  },
  {
    id: 'aimirah-frontend-studio',
    name: 'aimirah/ui-motion-cassette',
    repo: 'https://github.com/aimirah/ui-motion-cassette',
    author: 'aimirah',
    description:
      'Design systems, Tailwind v4 architecture, WCAG accessibility audits, Playwright visual regression skills, and Figma MCP bridges.',
    stars: 2390,
    pluginCount: 19,
    tags: ['frontend', 'design-system', 'playwright', 'mcp'],
    installCmd: '/plugin marketplace add aimirah/ui-motion-cassette',
  },
  {
    id: 'aimirah-secops-side-b',
    name: 'aimirah/secops-redteam-pack',
    repo: 'https://github.com/aimirah/secops-redteam-pack',
    author: 'aimirah',
    description:
      'Static secret scanning hooks, OWASP Top 10 audit agents, dependency CVE guards, and strict permission settings for enterprise repos.',
    stars: 1875,
    pluginCount: 14,
    tags: ['security', 'owasp', 'guardrails'],
    installCmd: '/plugin marketplace add aimirah/secops-redteam-pack',
  },
  {
    id: 'supabase-postgres-pack',
    name: 'supabase-community/claude-postgres-kit',
    repo: 'https://github.com/supabase-community/claude-postgres-kit',
    author: 'supabase-community',
    description:
      'RLS policy generators, query plan analyzers, zero-downtime migration slash commands, and live Postgres MCP introspection tools.',
    stars: 3110,
    pluginCount: 12,
    tags: ['database', 'postgres', 'mcp', 'migrations'],
    installCmd: '/plugin marketplace add supabase-community/claude-postgres-kit',
  },
  {
    id: 'devops-kubernetes-deck',
    name: 'cloudnative-ai/k8s-terraform-plugins',
    repo: 'https://github.com/cloudnative-ai/k8s-terraform-plugins',
    author: 'cloudnative-ai',
    description:
      'Terraform plan reviewers, Helm chart validators, GitHub Actions CI/CD incident triage agents, and OpenTelemetry log hooks.',
    stars: 1540,
    pluginCount: 21,
    tags: ['devops', 'kubernetes', 'terraform', 'ci-cd'],
    installCmd: '/plugin marketplace add cloudnative-ai/k8s-terraform-plugins',
  },
  {
    id: 'python-ml-research-tape',
    name: 'aimirah/ml-evals-mixtape',
    repo: 'https://github.com/aimirah/ml-evals-mixtape',
    author: 'aimirah',
    description:
      'PyTorch profiling skills, dataset hygiene commands, prompt evaluation loops, and Weights & Biases experiment tracking MCPs.',
    stars: 1290,
    pluginCount: 15,
    tags: ['python', 'ai-engineering', 'evals', 'loops'],
    installCmd: '/plugin marketplace add aimirah/ml-evals-mixtape',
  },
  {
    id: 'rust-systems-cassette',
    name: 'ferris-ai/cargo-claude-suite',
    repo: 'https://github.com/ferris-ai/cargo-claude-suite',
    author: 'ferris-ai',
    description:
      'Clippy zero-warning hooks, lifetime borrow-checker diagnostics, unsafe block auditors, and Criterion benchmark slash commands.',
    stars: 1680,
    pluginCount: 11,
    tags: ['rust', 'systems', 'performance'],
    installCmd: '/plugin marketplace add ferris-ai/cargo-claude-suite',
  },
  {
    id: 'nextjs-vercel-stack',
    name: 'shipfast-oss/app-router-essentials',
    repo: 'https://github.com/shipfast-oss/app-router-essentials',
    author: 'shipfast-oss',
    description:
      'React Server Components performance checks, bundle size budgets, Edge runtime guards, and Stripe webhook verification skills.',
    stars: 2740,
    pluginCount: 17,
    tags: ['nextjs', 'react', 'typescript'],
    installCmd: '/plugin marketplace add shipfast-oss/app-router-essentials',
  },
  {
    id: 'monorepo-turbopack-ops',
    name: 'buildgraph/monorepo-agents',
    repo: 'https://github.com/buildgraph/monorepo-agents',
    author: 'buildgraph',
    description:
      'Nx & Turborepo task graph optimizers, workspace boundary enforcement hooks, and automated changeset release commands.',
    stars: 980,
    pluginCount: 9,
    tags: ['monorepo', 'dx', 'release'],
    installCmd: '/plugin marketplace add buildgraph/monorepo-agents',
  },
  {
    id: 'docs-api-spec-studio',
    name: 'specfirst/openapi-docs-agents',
    repo: 'https://github.com/specfirst/openapi-docs-agents',
    author: 'specfirst',
    description:
      'OpenAPI 3.1 contract sync, `/llms.txt` generators, changelog writers, and SDK drift detection loops.',
    stars: 1120,
    pluginCount: 10,
    tags: ['documentation', 'openapi', 'sdk'],
    installCmd: '/plugin marketplace add specfirst/openapi-docs-agents',
  },
  {
    id: 'mobile-swift-kotlin-deck',
    name: 'nativecraft/mobile-agent-pack',
    repo: 'https://github.com/nativecraft/mobile-agent-pack',
    author: 'nativecraft',
    description:
      'SwiftUI & Jetpack Compose architecture skills, simulator screenshot hooks, and App Store release checklist commands.',
    stars: 1410,
    pluginCount: 13,
    tags: ['ios', 'android', 'react-native'],
    installCmd: '/plugin marketplace add nativecraft/mobile-agent-pack',
  },
];

export const INITIAL_COLLECTIONS: MixtapeCollection[] = [
  {
    id: 'side-a-fullstack',
    name: 'Side A · Full-Stack Shipper',
    sideLabel: 'SIDE A · 90 MIN',
    description: 'Daily driver mixtape combining top frontend skill, architect subagent, test generator, and GitHub MCP.',
    accentColor: '#d57455',
    createdAt: '2026-10-01',
    items: [
      CATALOG_BY_TYPE.skills[0],
      CATALOG_BY_TYPE.agents[0],
      CATALOG_BY_TYPE.commands[0],
      CATALOG_BY_TYPE.mcps[0],
    ]
      .filter(Boolean)
      .map((c) => ({
        name: c.name,
        path: c.path,
        category: c.category,
        typePlural: c.typePlural,
      })),
  },
  {
    id: 'side-b-secops',
    name: 'Side B · Security & Guardrails',
    sideLabel: 'SIDE B · 60 MIN',
    description: 'Pre-tool safety hooks, code audit agent, strict permissions profile, and continuous QA loop.',
    accentColor: '#5e6ad2',
    createdAt: '2026-10-10',
    items: [
      CATALOG_BY_TYPE.agents[1],
      CATALOG_BY_TYPE.hooks[0],
      CATALOG_BY_TYPE.settings[0],
      CATALOG_BY_TYPE.loops[0],
    ]
      .filter(Boolean)
      .map((c) => ({
        name: c.name,
        path: c.path,
        category: c.category,
        typePlural: c.typePlural,
      })),
  },
];

export const TRENDING_DATA = snapshot.trending;
export const JOBS_DATA = snapshot.jobs;

export function lookupCatalogItem(nameOrPath: string, preferredType?: ComponentTypePlural): CatalogItem | undefined {
  const clean = stripExt(nameOrPath).toLowerCase();
  const pool = preferredType ? [...CATALOG_BY_TYPE[preferredType], ...ALL_CATALOG_ITEMS] : ALL_CATALOG_ITEMS;
  return pool.find(
    (item) =>
      stripExt(item.path).toLowerCase() === clean ||
      stripExt(item.name).toLowerCase() === clean ||
      stripExt(item.path).toLowerCase().endsWith(`/${clean}`)
  );
}
