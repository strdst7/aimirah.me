export type ComponentTypePlural =
  | 'skills'
  | 'agents'
  | 'commands'
  | 'settings'
  | 'hooks'
  | 'mcps'
  | 'mods'
  | 'loops';

export interface SkillSpectorFinding {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  title: string;
  category: string;
  file: string;
  line?: number;
  count?: number;
}

export interface SkillSpectorResult {
  score: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  recommendation: 'SAFE' | 'CAUTION' | 'DO_NOT_INSTALL' | string;
  issueCount: number;
  analysis?: string;
  findings: SkillSpectorFinding[];
  version?: string;
  scannedAt?: string;
}

export interface CatalogItem {
  name: string;
  path: string;
  category: string;
  type: string;
  typePlural: ComponentTypePlural;
  description: string;
  author?: string;
  version?: string;
  license?: string;
  downloads: number;
  content?: string;
  sponsored?: boolean;
  skillspector?: SkillSpectorResult;
}

export interface CartItem {
  name: string;
  path: string;
  category: string;
  description: string;
  typePlural: ComponentTypePlural;
}

export type CartState = Record<ComponentTypePlural, CartItem[]>;

export interface SavedComponentRef {
  name: string;
  path: string;
  category: string;
  typePlural: ComponentTypePlural;
}

export interface MixtapeCollection {
  id: string;
  name: string;
  sideLabel: string;
  description: string;
  accentColor: string;
  items: SavedComponentRef[];
  createdAt: string;
}

export interface PluginMarketplace {
  id: string;
  name: string;
  repo: string;
  author: string;
  description: string;
  stars: number;
  pluginCount: number;
  tags: string[];
  installCmd: string;
  featured?: boolean;
}

export interface TrendingRankItem {
  id: string;
  name: string;
  category: string;
  typePlural?: ComponentTypePlural;
  downloadsToday: number;
  downloadsWeek: number;
  downloadsMonth: number;
  downloadsTotal: number;
}

export interface CountryStat {
  code: string;
  name: string;
  flag: string;
  downloads: number;
  percentage: number;
}

export interface JobPosting {
  id: string;
  company: string;
  position: string;
  location: string;
  remote: boolean;
  salary: string;
  description: string;
  applyUrl: string;
  source: string;
  postedAt: string;
  tags: string[];
  companyIcon?: string;
}

export type ActiveRoute =
  | { view: 'browse'; typePlural: ComponentTypePlural }
  | { view: 'detail'; item: CatalogItem; fromType: ComponentTypePlural }
  | { view: 'my-mixtapes' }
  | { view: 'plugins' }
  | { view: 'trending' }
  | { view: 'jobs' };
