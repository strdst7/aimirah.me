# Coding Conventions

**Analysis Date:** 2026-11-01

## Scope

Five independent Vite + React 19 + TypeScript single-page apps live in one repo. Each is a self-contained npm project with its own `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, and `src/`. There is no root workspace, no shared package, and no monorepo tooling.

| Subproject | Entry | Component style |
|------------|-------|-----------------|
| `clone-reframed-online-website/` | `src/App.tsx` | default exports |
| `clone-string-tune-website/` | `src/App.tsx` | default exports |
| `kdmirah-studio/` | `src/App.tsx` | named exports |
| `pasarapi-mini-bounty-announcement/` | `src/App.tsx` | named exports |
| `aimirah-mixtape/` | `src/App.tsx` | `React.FC` named exports |

Conventions below are shared unless a section explicitly calls out per-project divergence. **Divergences are the repo norm, not exceptions** — match the subproject you are editing rather than globalizing a choice.

## Naming Patterns

**Files:**
- Components: `PascalCase.tsx` — `src/components/ExperimentSection.tsx`, `src/components/VideoCard.tsx`, `src/components/ComponentGrid.tsx`
- Hooks: `use` + PascalCase, camelCase file — `src/hooks/useReveal.ts`, `src/hooks/useFx.ts`
- Utilities: lowercase, single word where possible — `src/utils/cn.ts`, `src/lib/scroll.ts`, `src/lib/api.ts`, `src/lib/content.ts`
- Shared JSX library (not a page section): lowercase `ui` — `src/lib/ui.tsx` (`clone-string-tune-website`), `src/components/ui.tsx` (`pasarapi-mini-bounty-announcement`)
- Data: `src/data/*.json` plus a lowercase `.ts` wrapper/adapter — `src/data/videos.json` + `src/lib/content.ts`, `src/data/catalogSnapshot.json` + `src/data/catalog.ts`, `src/data/fallbackApis.ts`
- Types directory used only in `aimirah-mixtape`: `src/types/catalog.ts`; all other projects declare types in `src/lib/*.ts` or inline in components
- One primary component per file; small private sub-components live above the exported one in the same file (`ScrambleLetter` in `clone-reframed-online-website/src/components/Hero.tsx`, `WordFill`/`ClarityItem` in `clone-string-tune-website/src/components/Clarity.tsx`, `PumpBoard`/`SkeletonError` in `pasarapi-mini-bounty-announcement/src/components/FuelSection.tsx`)

**Component groupings (avoid 1-component-per-file sprawl for related UI):**
- `clone-reframed-online-website/src/components/Nav.tsx` exports `Nav` (default) plus `MenuOverlay` and the `useMenu` hook
- `kdmirah-studio/src/components/Footer.tsx` exports both `ClosingCta` and `Footer`
- `kdmirah-studio/src/components/Dialogs.tsx` exports `SkillDialog` and `AuthDialog`
- `kdmirah-studio/src/components/Icon.tsx` exports `Icon`, `Logo`, `Wordmark`, and `type IconName`
- `aimirah-mixtape/src/components/SecondaryViews.tsx` exports `JobsView`, `MyMixtapesView`, `PluginsView`, `SpecModal`, `TrendingView`, `JobsSidebar`

**Functions:**
- camelCase, verb-first for actions — `sortVideos`, `buildUrl`, `fetchCatalogue`, `lockScroll`, `navigateVideo`, `changeCategory`
- Query helpers prefixed `get`/`videoBySlug`/`skillBySlug` style lookup naming — `src/lib/content.ts`
- `handleX` for local event handlers in `clone-reframed-online-website/src/App.tsx` (`handleLoaded`), but `onDragStart`/`onKey`/`onPanelTap` style for pointer handlers in `src/components/ExperimentSection.tsx`

**Variables:**
- Module-level constant collections use `SCREAMING_SNAKE_CASE` — `PAGE_SIZE`, `TOTAL_VIDEOS`, `CATEGORY_GRADIENT`, `TOOL_ABBREVIATIONS`, `EMPTY_CART`, `NAV`, `PUMPS`, `ITEMS`, `SIDEBAR_BROWSE_ORDER`
- `useRef` handles suffix `Ref` — `panelRef`, `clipRef`, `inputRef`, `btnRef`, `toastId`
- Booleans read as predicates — `dragging`, `entered`, `interacted`, `inView`, `loading`, `active`

**Types:**
- PascalCase type names, `type` alias preferred for object shapes in `kdmirah-studio` / `aimirah-mixtape` (`type HeaderProps = {...}`, `type Video = {...}`)
- `interface Props` block above the component in `clone-reframed-online-website` (`src/components/Hero.tsx`, `src/components/ExperimentSection.tsx`)
- Domain row shapes prefixed with the domain — `interface FuelRow`, `interface QuerySpec`, `interface ApiEntry`
- Discriminated unions for state machines — `type ScriptStep = { kind: 'cmd' ... } | { kind: 'ask' ... }` in `aimirah-mixtape/src/components/ComponentTerminal.tsx`
- String-literal unions instead of enums — `type CategoryKey = "all" | "motion" | ...` in `kdmirah-studio/src/lib/content.ts`
- `as const` for fixed site metadata objects — `SITE` in `kdmirah-studio/src/lib/content.ts`

## TypeScript Configuration

All five `tsconfig.json` files are byte-identical:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "types": ["node"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "vite.config.ts"]
}
```

**Enforced:** `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `isolatedModules`, `skipLibCheck`.

**Not enabled** (do not rely on these being caught): `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`.

**Critical caveat:** `npm run build` is `vite build` only — there is no `tsc` step. esbuild strips types without checking them, so `strict` is enforced **only** in the editor / IDE and when running `npx tsc --noEmit` manually. Type regressions can ship. See `TESTING.md`.

**Escape hatches in use (keep to a minimum, follow the existing style when unavoidable):**
- `as any` casts where a `RefObject` generic mismatches `useSectionProgress` — `clone-string-tune-website/src/components/Clarity.tsx:40`, `src/components/Techniques.tsx:33,288`, `src/components/WhoItsFor.tsx:64`
- `(p: any)` for Recharts tooltip callback payloads — `pasarapi-mini-bounty-announcement/src/components/BirthsSection.tsx:120`, `src/components/FuelSection.tsx:195`
- Non-null root mount assertion, identical in every project — `createRoot(document.getElementById("root")!).render(...)` in `src/main.tsx`
- `as unknown as` for window globals — `(window as unknown as { __lenis: Lenis }).__lenis = l` in `clone-string-tune-website/src/App.tsx:145`
- Typed JSON imports cast at the boundary — `export const videos = raw as Video[];` in `kdmirah-studio/src/lib/content.ts`

## Export Style

**Diverges by subproject. Match the neighbors in the file you edit.**

**`clone-reframed-online-website/` — default exports for components:**
```tsx
// src/components/ExperimentSection.tsx
export default function ExperimentSection({ exp }: Props) { ... }
```
Named exports only for hooks/helpers co-located in component files: `useMenu`, `MenuOverlay` in `src/components/Nav.tsx`; `initLenis`, `startScroll`, `stopScroll`, `scrollToId`, `scrollToTop` in `src/lib/scroll.ts`.

**`clone-string-tune-website/` — default exports for page sections:**
```tsx
export default function Clarity() { ... }        // src/components/Clarity.tsx
export function Reveal({ ... }) { ... }          // src/lib/ui.tsx (shared primitives = named)
export function GiantWord({ ... }) { ... }       // src/components/Techniques.tsx (named helper)
```

**`kdmirah-studio/` — named exports for all components, one default for App:**
```tsx
export function VideoCard({ video, compare, index, onOpen, onCopy }: { ... }) { ... }
export default function App() { ... }            // only default in the project
```

**`pasarapi-mini-bounty-announcement/` — named exports for all components:**
```tsx
export function FuelSection() { ... }            // src/components/FuelSection.tsx
function App() { ... }
export default App;                              // src/App.tsx
```

**`aimirah-mixtape/` — `React.FC` named exports, default App at file end:**
```tsx
export const ComponentGrid: React.FC<{
  activeType: ComponentTypePlural;
  onSelectComponent: (item: CatalogItem) => void;
  /* ...12 more props... */
}> = ({ activeType, onSelectComponent, ... }) => { ... };
```
`src/App.tsx` uses `export function App()` at line 63 plus `export default App;` at line 1135.

**Rule of thumb:** page-section components are the default export in `clone-reframed-online-website` and `clone-string-tune-website`; shared/primitives are named. In `kdmirah-studio` and `pasarapi-mini-bounty-announcement`, everything is named except `App`.

## Props Typing Patterns

Four coexisting patterns — pick based on the subproject.

**1. `interface Props` above component** (`clone-reframed-online-website`):
```tsx
interface Props {
  exp: Experiment;
}
export default function ExperimentSection({ exp }: Props) { ... }
```

**2. Inline object type in the signature** (`kdmirah-studio`, `pasarapi-mini-bounty-announcement`):
```tsx
export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) { ... }
```

**3. Named `type XProps` when reused or long** (`kdmirah-studio`):
```tsx
// src/components/Header.tsx
type HeaderProps = {
  dark: boolean;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onSignIn: () => void;
  onNotify: (message: string) => void;
};
export function Header({ dark, onToggleTheme, onOpenSearch, onSignIn, onNotify }: HeaderProps) { ... }
```

**4. `React.FC<{...}>` inline generic** (`aimirah-mixtape`):
```tsx
// src/components/DeckWidgets.tsx
export const RecLamp: React.FC<{ on: boolean; label?: string }> = ({ on, label = 'REC' }) => ( ... );
```

**Conventions inside props types:**
- Callback props named `onX` and typed as `(arg) => void` — never `Function`
- Optional props use `?` with a default in destructuring, never `| undefined` — `className = ""`, `height = "h-64"`, `delay = 0`, `step = 22`
- `children` typed as `ReactNode` (`import { ReactNode } from 'react'` in `pasarapi-mini-bounty-announcement/src/components/ui.tsx`) or `React.ReactNode` (`clone-string-tune-website/src/lib/ui.tsx`); optional form `children?: React.ReactNode`
- Class-name passthrough props always `className?: string` with `""` default
- Colors passed as raw strings, not union types — `accent?: string` (default `'#ffb020'`), `color: string` in `PUMPS`
- Refs typed explicitly with the element: `useRef<HTMLDivElement | null>(null)`, `useRef<HTMLInputElement>(null)`
- Generic hooks constrain to elements: `useInView<T extends HTMLElement>`

## Styling Conventions

**Tailwind CSS 4, CSS-first. There is no `tailwind.config.js`/`.ts` anywhere in the repo.** All theme config lives in `src/index.css` via `@theme`.

**CSS file organization — one `src/index.css` per project, always this order:**
1. `@import "tailwindcss";` (first line; `kdmirah-studio` puts a Google Fonts `@import` above it)
2. `@font-face` declarations (only `clone-string-tune-website`, using `src/assets/fonts/*.woff2`)
3. `@theme { ... }` custom tokens
4. `:root` custom properties and, where needed, `.dark` / `html.dark` overrides
5. Base element styles (`html`, `body`, `::selection`)
6. `@keyframes` and custom utilities (`@utility no-scrollbar`)
7. Project-specific component classes (`.vignette`, `.bg-blueprint`, `.text-outline-faint`, `.screw`, `.legend`)

Theme token naming is per-project prefixed and kebab-case:
- `clone-reframed-online-website/src/index.css`: `--font-display`, `--color-ink`, `--color-coal`, `--color-bone`, `--color-smoke`, `--color-signal`, `--animate-marquee`, `--ease-out-expo`
- `clone-string-tune-website/src/index.css`: dual system — `--color-st-*` (@theme) plus `--c-*`, `--f-*` cubic-bezier easings, and a `--type-step` modular scale (`--p`, `--m`, `--mm`, `--h0`..`--h6`)
- `kdmirah-studio/src/index.css`: `@custom-variant dark (&:where(.dark, .dark *))` + `@theme inline` mapping `--color-bg: var(--bg)` for light/dark switching
- `pasarapi-mini-bounty-announcement/src/index.css`: neon palette `--color-neon-amber`, `--color-neon-green`, `--color-neon-pink`, `--color-neon-cyan`, `--color-neon-violet`, plus `@keyframes` declared inside `@theme`
- `aimirah-mixtape/src/index.css`: hardware-chassis tokens `--color-surface-0..4`, `--color-display*`, `--shadow-card`, faceplate variants under `:root, html.light` and `html.dark`

**Class composition — `cn()` is the standard, but adoption is uneven:**

Helper is identical in all five projects:
```ts
// src/utils/cn.ts (byte-identical in every subproject)
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Usage:
| Subproject | `cn()` calls | Approach when not using `cn` |
|------------|--------------|------------------------------|
| `kdmirah-studio/` | 19 | — |
| `pasarapi-mini-bounty-announcement/` | 17 | template literals for accent colors |
| `aimirah-mixtape/` | 0 (helper exists, unused) | template literals with `${}` |
| `clone-reframed-online-website/` | 0 (helper exists, unused) | template literals with `${}` |
| `clone-string-tune-website/` | 0 (helper exists, unused) | template literals with `${}` |

Prefer `cn()` when a subproject already uses it. `twMerge` matters because conditional Tailwind classes conflict (later wins):
```tsx
// pasarapi-mini-bounty-announcement/src/components/ui.tsx
className={cn(
  'transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
  className
)}
```
Existing template-literal pattern (do not refactor wholesale, but match it when editing):
```tsx
// clone-reframed-online-website/src/components/Hero.tsx
className={`inline-block transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
  char === "i" ? "text-signal" : ""
}`}
```

**Conditional class pattern:** ternaries inside the class string, not `if`-built strings. Variant helpers are local functions returning a string:
```tsx
// clone-reframed-online-website/src/components/ExperimentSection.tsx
const pill = (state: "in" | "out") => {
  const active = side === state;
  return `pointer-events-none border px-3 py-1.5 font-mono text-[9px] ... ${
    active ? "border-bone bg-bone text-ink" : "border-bone/35 bg-ink/30 text-bone/70"
  }`;
};
```

**Arbitrary-value Tailwind syntax is used heavily for design precision** — expect and preserve it: `text-[10px]`, `tracking-[0.25em]`, `duration-[900ms]`, `z-[105]`, `min-h-[100svh]`, `bg-white/[0.045]`, `text-[9px]`, `leading-[0.86]`.

**Inline `style={{}}` — allowed only for values Tailwind cannot express statically:**
| Project | Inline style count |
|---------|-------------------|
| `clone-string-tune-website/` | 57 |
| `aimirah-mixtape/` | 53 |
| `clone-reframed-online-website/` | 23 |
| `pasarapi-mini-bounty-announcement/` | 14 |
| `kdmirah-studio/` | 0 |

Legitimate inline-style cases observed:
- Runtime-computed geometry: `style={{ clipPath: "inset(0 0 0 50%)" }}`, `style={{ left: "50%" }}`, `ring.current.style.transform = ...` (`clone-reframed-online-website/src/components/ExperimentSection.tsx`)
- Fluid `clamp()` font sizes: `style={{ fontSize: "clamp(3rem, 19vw, 22rem)" }}` (`clone-reframed-online-website/src/components/Hero.tsx`)
- Dynamic transition delays: `style={{ transitionDelay: `${delay}ms` }}` (`clone-reframed-online-website/src/components/Hero.tsx`)
- CSS custom properties fed to JS: `style={{ "--i": idx } as React.CSSProperties}` (`clone-string-tune-website/src/lib/ui.tsx`), `style={{ "--rv-delay": `${delay}ms` } as React.CSSProperties}`
- Data-driven colors from props: `style={{ color: accent }}`, `style={{ background: \`linear-gradient(90deg, transparent, ${accent}, transparent)\` }}` (`pasarapi-mini-bounty-announcement/src/components/ui.tsx`)
- Composited gradients and per-pixel light effects (`aimirah-mixtape/src/components/DeckWidgets.tsx` VU lamps)

`kdmirah-studio/` is the counter-example: **zero inline styles** — dynamic appearance is expressed with CSS variables in `src/index.css` toggled by a `.dark` class on `<html>`, so use classes + `cn()` there.

**Never:** CSS Modules, styled-components, emotion, or per-component `.css` files. Styling is Tailwind utilities + one global `index.css`.

## Import Organization

**No automated sorter (no ESLint, no Prettier, no Biome — see below).** Follow the observed order:

1. React and React DOM — `import { useCallback, useEffect, useState } from "react";`
2. Third-party libraries — `import Lenis from "lenis";`, `import { ArrowDown } from "lucide-react";`, `import { LineChart, Line, ... } from 'recharts';`
3. Local components — `./components/Header`, `"./components/Starfield"`
4. Local lib/data — `../lib/content`, `./lib/data`, `../data/catalog`
5. Local utils — `"../utils/cn"`
6. CSS side-effect import last in `main.tsx` — `import "./index.css";`

Canonical example, `kdmirah-studio/src/components/VideoCard.tsx`:
```tsx
import { Icon } from "./Icon";
import {
  CATEGORY_ICON,
  TOOL_ABBREVIATIONS,
  type Video,
} from "../lib/content";
import { cn } from "../utils/cn";
```

**Type imports:** inline `type` modifier preferred — `import { clsx, type ClassValue } from "clsx"`, `import type { Experiment } from "../lib/data"`, `import type { IconName } from "../components/Icon"`. Inline `{ type Video }` inside a value import is also used (`kdmirah-studio/src/App.tsx`, `src/components/VideoCard.tsx`). `aimirah-mixtape` imports types without the `type` modifier (`import { CatalogItem, ComponentTypePlural } from '../types/catalog';`) — do not propagate that.

**Path alias `@/*`:** configured in every `tsconfig.json` and every `vite.config.ts`, but **used zero times in practice**. All imports are relative (`./`, `../`). Stay relative for consistency; if you introduce `@/`, do it project-wide.

**Import extensions:** always extensionless (`"./components/Header"`), never `.tsx`/`.ts` in the specifier even though `allowImportingTsExtensions` is on.

## Quote and Formatting Style

No formatter is configured, so hand-formatting rules are enforced only by convention.

| Subproject | Quotes | Notes |
|------------|--------|-------|
| `clone-reframed-online-website/` | double | JSX + TS consistently `"` |
| `clone-string-tune-website/` | double | one stray `//` comment pair uses `'` |
| `kdmirah-studio/` | double | strictest consistency |
| `pasarapi-mini-bounty-announcement/` | single | `'react'`, `'./components/Header'` |
| `aimirah-mixtape/` | mixed | `'` for module imports, `"` inside JSX class strings; template literals dominate string building |

Shared formatting facts:
- 2-space indentation everywhere
- Semicolons always
- Trailing commas in multi-line literals/params (`clone-string-tune-website` and `kdmirah-studio` even use trailing commas in function call argument lists)
- Long JSX props broken one-per-line when >2 props
- Ternary chains broken across lines with the condition on its own line, as in `src/lib/content.ts` `sortVideos`

## Error Handling

**Fetch layer is centralized per project.** `pasarapi-mini-bounty-announcement/src/lib/api.ts` is the only project with real network code:

```ts
async function getJson<Row>(url: string, timeoutMs = 14000): Promise<Row[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) throw new Error('EMPTY_RESPONSE');
    return json as Row[];
  } finally {
    clearTimeout(timer);
  }
}
```

**Cancellation is mandatory** — `AbortController` + `clearTimeout` in `finally`; every request has an explicit timeout (14–16s).

**Loading/error state is a hook, not a component concern:**
```ts
// pasarapi-mini-bounty-announcement/src/lib/api.ts
interface AsyncState<T> { data: T | null; loading: boolean; error: string | null; }
export function useAsyncData<T>(loader: () => Promise<T>) { /* ... */ return { ...state, retry }; }
```
Consumers render one of three states explicitly and never crash on `null`:
```tsx
// src/components/FuelSection.tsx
{loading && <Skeleton label="Pumping MOF feed" height="h-96" />}
{error && <SkeletonError code={error} retry={retry} />}
{!loading && !error && !latest && <SkeletonError code="NO_LEVEL_ROWS" retry={retry} />}
```
Error UI comes from the shared `ErrorPanel` in `src/components/ui.tsx` (label + error code + retry button).

**Stale-response guard:** async effects use an `alive` boolean, cleared in the cleanup function, before `setState`:
```ts
useEffect(() => {
  let alive = true;
  loaderRef.current().then(d => alive && setState(...)).catch(e => alive && setState(...));
  return () => { alive = false; };
}, [nonce]);
```

**Storage and clipboard are wrapped, never assumed:**
```ts
try { localStorage.getItem('aimirahMixtapeCart'); } catch {}   // aimirah-mixtape/src/App.tsx
try { /* ... */ } catch { /* storage can be unavailable in private modes */ }  // kdmirah-studio/src/App.tsx
```
Clipboard has a `document.execCommand("copy")` fallback with a throwaway `<textarea>` (`kdmirah-studio/src/App.tsx` `copy`).

**Floating promises are marked explicitly** — `void copy(video.prompt, ...)` in `kdmirah-studio/src/App.tsx`.

**Conventions to follow:**
- Catch empty (`catch {}`) only with a one-line comment explaining why
- Error messages are short uppercase codes (`HTTP 404`, `EMPTY_RESPONSE`, `ERR_UNKNOWN`, `FETCH_FAILED`) and rendered in mono uppercase, never raw exception text
- No `console.*` anywhere in the repo — do not add logging as error handling
- No React error boundaries exist; a thrown render error blanks the page. If you add one, place it in `src/main.tsx` around `<App />`
- Type guards narrow instead of casting where practical: `if (!Array.isArray(json) || json.length === 0) throw`

## Accessibility Patterns

Accessibility is applied consistently and deliberately. Follow these existing patterns.

**Decorative layers are always `aria-hidden`:**
```tsx
<div aria-hidden className="pointer-events-none absolute inset-0"> ... </div>   // Hero rules
<div aria-hidden className="pointer-events-none fixed inset-0 z-[105] ..." />   // film grain
<svg aria-hidden="true" ... />                                                  // every icon
```

**Icon-only buttons carry `aria-label`** — never rely on the icon:
```tsx
<button aria-label={open ? "Close menu" : "Open menu"} ...>          // clone-reframed-online-website/src/components/Nav.tsx
<button aria-label={`Copy prompt by @${video.author}`} ...>          // kdmirah-studio/src/components/VideoCard.tsx
<button aria-label="Dismiss notification" ...>                       // kdmirah-studio/src/components/Toast.tsx
```

**Visible text is duplicated for screen readers with `sr-only`** when the visual label is an abbreviation or glyph:
```tsx
<span className="sr-only">{tag}</span>
<span className="sr-only">{video.category}</span>
```

**Dialogs:** `role="dialog"` + `aria-modal="true"` + `aria-label`, Escape to close, scroll locked on mount and restored on unmount.
```tsx
<div role="dialog" aria-modal="true" aria-label="Search videos and prompts" ...>
```
Scroll locking is ref-counted so nested overlays don't fight (`kdmirah-studio/src/lib/scrollLock.ts`):
```ts
let locks = 0;
export function lockScroll() { locks += 1; if (locks === 1) document.body.style.overflow = "hidden"; }
export function unlockScroll() { locks = Math.max(0, locks - 1); if (locks === 0) document.body.style.overflow = ""; }
```

**Toasts:** `role="status"` + `aria-live="polite"` (`kdmirah-studio/src/components/Toast.tsx`).

**Custom sliders:** the draggable comparison seam is a real `role="slider"` with `tabIndex={0}`, `aria-valuemin`/`aria-valuemax`/`aria-valuenow`, `aria-label`, and ArrowLeft/ArrowRight keyboard handlers — `clone-reframed-online-website/src/components/ExperimentSection.tsx`.
```tsx
<div role="slider" tabIndex={0} aria-label={`${exp.title} — comparison seam`}
     aria-valuemin={4} aria-valuemax={96} aria-valuenow={Math.round(target.current)}
     onKeyDown={onKey} className="... focus:outline-none focus-visible:border-signal" />
```

**Focus is always visible via `focus-visible`, and `focus:outline-none` is only paired with a `focus-visible:` replacement:**
```tsx
className="... focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 ... focus-visible:outline-none"
```

**Reduced motion is respected.** Check `matchMedia("(prefers-reduced-motion: reduce)")` before scripted animation and neutralize it in CSS:
```tsx
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduce) { target.current = 50; pos.current = 50; paint(); return; }
```
CSS blocks exist in `clone-reframed-online-website/src/index.css`, `kdmirah-studio/src/index.css`, `pasarapi-mini-bounty-announcement/src/index.css`, `aimirah-mixtape/src/index.css`. When adding a scroll/RAF animation, include a reduced-motion branch.

**Images:** meaningful images get descriptive `alt` (`alt={exp.inspiration.caption}`); purely decorative thumbnails use `alt=""` (`kdmirah-studio/src/components/VideoCard.tsx`). Add `loading="eager" | "lazy"` based on position and `decoding="async"` for grids.

**Skip links:** `kdmirah-studio` uses `id="main-content"` on `<main>` for skip targeting.

## Comment Style

**No AI-generated narration, no restating the code. Comments explain *why* or mark structure.**

**1. Section banners** in CSS and larger TS files — 95 occurrences repo-wide:
```css
/* ------------------------------------------------------------------ */
/*  Theme tokens (Tailwind v4)                                         */
/* ------------------------------------------------------------------ */
```
```ts
/* ------------------------------------------------------------------ */
/*  Lenis context                                                      */
/* ------------------------------------------------------------------ */
```

**2. JSDoc on exported hooks and non-obvious helpers** — 25 occurrences:
```ts
/** Tiny data-fetching hook with manual retry. */
/**
 * stick   — 0 -> 1 while an element taller than the viewport scrolls past
 * through — 0 when top enters bottom of vp, 1 when bottom leaves vp top
 */
```

**3. Inline `//` notes for non-obvious intent** — lowercase, short, often in JSX:
```tsx
{/* film grain */}
{/* INSPIRATION — base layer */}
{/* OUTPUT — clipped layer */}
{/* pos = seam position in % of panel width */}
<p>
  // A digital laboratory
  <br />
  for borrowed light
</p>
```

**4. Empty-catch justifications:**
```ts
} catch {
  // storage can be unavailable in private modes
}
} catch {
  /* fall through to unfiltered pull */
}
```

**`// eslint-disable-next-line react-hooks/exhaustive-deps` appears twice** (`clone-string-tune-website/src/lib/ui.tsx:121`, `src/App.tsx:34`) but **ESLint is not installed** — these are descriptive only. Do not add more; fix the dependency array instead.

**TSDoc `@param`/`@returns` blocks are not used.** Keep JSDoc prose-only.

## Function and Module Design

- **Component size:** a page section may be 400–600 lines when it is one visual composition (`clone-string-tune-website/src/components/Hero.tsx`, `kdmirah-studio/src/components/VideoModal.tsx`). Extract only when a sub-piece is reused or independently stateful.
- **Co-locate:** sub-components, constants, and small helpers live in the same file as their only consumer. Promote to `src/lib/` or `src/components/ui.tsx` only on second use.
- **Controlled state:** all UI state lives in `App.tsx` and is passed down as props + `onX` callbacks (`kdmirah-studio/src/App.tsx` holds theme, category, sort, page, modals, toast). Leaf components stay stateless where possible.
- **Derived state via `useMemo`**, never stored — `filtered`, `results`, `modalList`, `activeIndex` in `kdmirah-studio/src/App.tsx`.
- **DOM writes bypass React for high-frequency animation** — direct `ref.current.style.*` inside a `requestAnimationFrame` loop, and that loop is cancelled in the effect cleanup (`clone-reframed-online-website/src/components/ExperimentSection.tsx` `paint`).
- **No barrel `index.ts` files.** Import the concrete module path.
- **No `enum`**; unions + `Record<K, V>` maps.

## Divergence Quick Reference

When editing a subproject, match that column.

| Concern | reframed | string-tune | kdmirah-studio | pasarapi | mixtape |
|---------|----------|-------------|----------------|----------|---------|
| Component export | default | default | named | named | named `React.FC` |
| Quotes | double | double | double | single | mixed |
| `cn()` used | no | no | yes | yes | no |
| Inline styles | some | heavy | none | some | heavy |
| Path style | relative | relative | relative | relative | relative |
| Props typing | `interface Props` | inline/interface | inline + `type XProps` | inline | `React.FC<{...}>` |
| Theme approach | `@theme` | `@theme` + `--c-*` | `@theme inline` + `.dark` | `@theme` | `:root`/`html.dark` vars |

---

*Convention analysis: 2026-11-01*
