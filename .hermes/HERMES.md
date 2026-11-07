<!-- GSD:project-start source:PROJECT.md -->

## Project

**aimirah.me — Standalone Project Links**

aimirah.me is the kdmirah Digital Inspiration Lab. Its primary site presents four visual experiments and a directory of separately deployed projects. This milestone gives visitors working links to the live projects already held in the repository without moving their applications into the primary site.

**Core Value:** Visitors can open each live standalone project from the aimirah.me project directory.

### Constraints

- **Deployment:** Keep each standalone site's own host; only link from aimirah.me.
- **Links:** Use checked live destinations; do not present a placeholder domain as deployed.
- **Git:** Preserve existing remote history and separate deployments. Rebase or merge only after inspecting differences.
- **Accessibility:** Existing link rows must remain keyboard reachable and disclose new-tab behavior.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript 5.9.3 with TSX/React JSX - application source in `clone-reframed-online-website/src/`, `clone-string-tune-website/src/`, `kdmirah-studio/src/`, `pasarapi-mini-bounty-announcement/src/`, and `aimirah-mixtape/src/`; each app's `package.json` pins TypeScript and `tsconfig.json` targets ES2020 with strict checking.
- HTML/CSS - each app's `index.html` and `src/index.css`; JSON - static catalogs in `aimirah-mixtape/src/data/catalogSnapshot.json` and `kdmirah-studio/src/data/videos.json`, plus package/config files such as `clone-reframed-online-website/package.json`.

## Runtime

- Browser-hosted React single-page applications; build tooling runs on Node.js, but no Node version is pinned in the tracked manifests such as `clone-reframed-online-website/package.json` or `README.md`.
- npm (version not specified); use `npm install`, `npm run dev`, `npm run build`, and `npm run preview` inside the relevant app directory as shown in `README.md` and each app's `package.json`.
- Lockfiles: one committed `package-lock.json` per app, e.g. `clone-reframed-online-website/package-lock.json` and `pasarapi-mini-bounty-announcement/package-lock.json`; there is no root package manifest.

## Frameworks

- React 19.2.6 / React DOM 19.2.6 - client-rendered UI in all five app manifests, e.g. `clone-reframed-online-website/package.json` and `aimirah-mixtape/package.json`.
- Tailwind CSS 4.1.17 via `@tailwindcss/vite` 4.1.17 - utility styling in all five apps; plugin wiring in each `vite.config.ts`, e.g. `clone-reframed-online-website/vite.config.ts`.
- Not detected: no test runner or test script in app manifests such as `pasarapi-mini-bounty-announcement/package.json`; tracked source has no test/spec files.
- Vite ^7.3.7, `@vitejs/plugin-react` 5.1.1, `vite-plugin-singlefile` 2.3.0 - development server and single-HTML production bundle in all app manifests/configs, e.g. `aimirah-mixtape/package.json` and `aimirah-mixtape/vite.config.ts`.
- TypeScript `noEmit`, bundler resolution, `resolveJsonModule`, `@/*` → `src/*` alias, strict/no-unused checks - configured consistently in each `tsconfig.json`, e.g. `kdmirah-studio/tsconfig.json`; Vite alias mirrors it in `kdmirah-studio/vite.config.ts`.

## Key Dependencies

- `lenis` ^1.3.26 - smooth scrolling in `clone-reframed-online-website/src/lib/scroll.ts` and `clone-string-tune-website/src/App.tsx`; declared in their respective `package.json` files.
- `recharts` ^3.9.2 - data visualizations in `pasarapi-mini-bounty-announcement/src/components/BirthsSection.tsx`, declared in `pasarapi-mini-bounty-announcement/package.json`.
- `lucide-react` - icon set in `clone-reframed-online-website/src/components/Hero.tsx`, `clone-string-tune-website/src/components/Header.tsx`, and `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx`; versions vary by app (`^1.48.0`, `^1.41.0`, `^1.23.0`) in their `package.json` files.
- `clsx` 2.1.1 + `tailwind-merge` 3.4.0 - class merging in each app's `src/utils/cn.ts`, e.g. `aimirah-mixtape/src/utils/cn.ts`.
- Browser `fetch`/`AbortController` with manual React state/retry, not a data-fetching SDK, in `pasarapi-mini-bounty-announcement/src/lib/api.ts`.

## Configuration

- No required build/runtime environment variable references detected in tracked application source; API base URLs are literal strings in `pasarapi-mini-bounty-announcement/src/lib/api.ts` and `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx`.
- Configure changes per app using its `package.json`, `tsconfig.json`, and `vite.config.ts` rather than assuming a root workspace (`README.md`, `clone-reframed-online-website/vite.config.ts`).
- `vite build` via each app's `package.json`; Vite plugins inline JS/CSS in `index.html` through `vite-plugin-singlefile`, but assets under `clone-reframed-online-website/public/` remain separate static files (`clone-reframed-online-website/vite.config.ts`, `clone-reframed-online-website/public/images/og-cover.jpg`).

## Platform Requirements

- Node.js and npm with a version compatible with Vite 7; exact Node/npm versions are not pinned in `README.md` or `clone-reframed-online-website/package.json`. Run commands from an individual app directory per `README.md`.
- Static browser hosting; `README.md` describes GitHub Pages with custom domain set by `clone-reframed-online-website/public/CNAME`. A separate Vercel `/dev` redirect exists in `clone-reframed-online-website/vercel.json`; this file does not establish that Vercel hosts the main site.

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- Use PascalCase for React components (`clone-reframed-online-website/src/components/ExperimentSection.tsx`, `kdmirah-studio/src/components/VideoGallery.tsx`), camelCase for hooks and utilities (`clone-reframed-online-website/src/hooks/useReveal.ts`, `clone-reframed-online-website/src/lib/scroll.ts`), and `index.css` for app styles (`clone-reframed-online-website/src/index.css`).
- Treat the five top-level applications as separate packages, each with its own `package.json`, `tsconfig.json`, and `src/` (`clone-reframed-online-website/package.json`, `aimirah-mixtape/package.json`, `clone-string-tune-website/package.json`, `kdmirah-studio/package.json`, `pasarapi-mini-bounty-announcement/package.json`).
- Use camelCase for helpers and handlers (`scrollToId` in `clone-reframed-online-website/src/lib/scroll.ts`, `onDragStart` in `clone-reframed-online-website/src/components/ExperimentSection.tsx`); prefix hooks with `use` (`clone-reframed-online-website/src/hooks/useReveal.ts`, `pasarapi-mini-bounty-announcement/src/hooks/useFx.ts`).
- Use PascalCase for React components (`Nav`, `MenuOverlay` in `clone-reframed-online-website/src/components/Nav.tsx`).
- Use camelCase for local state and refs (`menuOpen` in `clone-reframed-online-website/src/App.tsx`, `panelRef` in `clone-reframed-online-website/src/components/ExperimentSection.tsx`); use uppercase for fixed content/constants (`EXPERIMENTS` in `clone-reframed-online-website/src/lib/data.ts`, `CATEGORIES` in `kdmirah-studio/src/lib/content.ts`). Follow `AGENTS.md`'s descriptive-name and extracted-complex-condition guidance.
- Use PascalCase for interfaces, aliases, and prop types (`Experiment` in `clone-reframed-online-website/src/lib/data.ts`, `GalleryProps` in `kdmirah-studio/src/components/VideoGallery.tsx`); use `import type` where the type is imported separately (`clone-reframed-online-website/src/components/ExperimentSection.tsx`).

## Code Style

- No tracked Prettier or Biome configuration detected; follow the surrounding file. The primary site uses two-space indentation, double quotes, and semicolons (`clone-reframed-online-website/src/App.tsx`, `clone-reframed-online-website/src/lib/scroll.ts`); `aimirah-mixtape/src/data/catalog.ts` and `pasarapi-mini-bounty-announcement/src/lib/api.ts` use single quotes. Do not impose one package's quote style on another.
- Prefer Tailwind utilities in JSX and centralize global tokens, bespoke CSS, and keyframes in `clone-reframed-online-website/src/index.css`; the site's `@theme` defines `ink`, `bone`, `signal`, and font families.
- No tracked ESLint/Biome config or lint script detected (`clone-reframed-online-website/package.json` and the other four package manifests). TypeScript options `strict`, `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` are configured in `clone-reframed-online-website/tsconfig.json` and the other applications' `tsconfig.json` files; `vite build` is not a substitute for a separate `tsc --noEmit` check (`clone-reframed-online-website/package.json`).

## Import Organization

- `@/*` maps to `src/*` in `clone-reframed-online-website/tsconfig.json` and `clone-reframed-online-website/vite.config.ts`; existing site modules use relative imports (`clone-reframed-online-website/src/App.tsx`, `clone-reframed-online-website/src/components/Nav.tsx`).

## Error Handling

- Guard missing browser elements before acting and fall back to native scrolling when Lenis is unavailable (`clone-reframed-online-website/src/lib/scroll.ts`); return early when an observer has no element (`clone-reframed-online-website/src/hooks/useReveal.ts`).
- For remote requests in the data dashboard, abort on timeout, check HTTP status and JSON shape, clear timers in `finally`, and expose retry/error state in the consuming hook (`pasarapi-mini-bounty-announcement/src/lib/api.ts`). The primary site has no comparable network-fetch layer (`clone-reframed-online-website/src/lib/data.ts`).

## Logging

- Handle expected failures through return values or state rather than introducing logging in presentation code (`clone-reframed-online-website/src/lib/scroll.ts`, `pasarapi-mini-bounty-announcement/src/lib/api.ts`).

## Comments

- Explain non-obvious interaction/animation intent and structural JSX regions rather than restating syntax (`clone-reframed-online-website/src/components/ExperimentSection.tsx`, `clone-reframed-online-website/src/components/Preloader.tsx`).
- Short `/** ... */` descriptions appear on hooks and visual components (`clone-reframed-online-website/src/hooks/useReveal.ts`, `clone-reframed-online-website/src/components/Nav.tsx`); extensive API docs are not detected.

## Function Design

## Module Design

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Browser bootstrap | Mount React `App` in `#root` and load global CSS; repeated independently in each app | `clone-reframed-online-website/src/main.tsx`, `aimirah-mixtape/src/main.tsx`, `clone-string-tune-website/src/main.tsx`, `kdmirah-studio/src/main.tsx`, `pasarapi-mini-bounty-announcement/src/main.tsx` |
| Primary-site composition | Preloader/menu readiness, scroll locking and section ordering | `clone-reframed-online-website/src/App.tsx` |
| Experiment content and interaction | Four typed experiment records and per-section draggable before/after seam | `clone-reframed-online-website/src/lib/data.ts`, `clone-reframed-online-website/src/components/ExperimentSection.tsx` |
| Scroll/navigation | Lenis instance, scroll controls, menu anchor navigation | `clone-reframed-online-website/src/lib/scroll.ts`, `clone-reframed-online-website/src/components/Nav.tsx` |
| Mixtape application controller | View selection, cart, collections, theme, overlays and persistence | `aimirah-mixtape/src/App.tsx` |
| Mixtape catalog | Transform bundled snapshot into typed catalog, expose lookup/install helpers | `aimirah-mixtape/src/data/catalog.ts`, `aimirah-mixtape/src/data/catalogSnapshot.json`, `aimirah-mixtape/src/types/catalog.ts` |
| Studio archive | Filtering/sorting/page/dialog state and static video/skill models | `kdmirah-studio/src/App.tsx`, `kdmirah-studio/src/lib/content.ts`, `kdmirah-studio/src/data/videos.json` |
| Animated landing page | Lenis provider, shared animation hooks and visual sections | `clone-string-tune-website/src/App.tsx`, `clone-string-tune-website/src/lib/ui.tsx` |
| Data dashboard | Section composition, HTTP/timeouts/retryable async state, fallback directory | `pasarapi-mini-bounty-announcement/src/App.tsx`, `pasarapi-mini-bounty-announcement/src/lib/api.ts`, `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx` |

## Pattern Overview

- Each app bootstraps through its own `index.html` and `src/main.tsx`, and `vite.config.ts` uses React, Tailwind and `vite-plugin-singlefile` (`clone-reframed-online-website/vite.config.ts`, `kdmirah-studio/vite.config.ts`).
- No shared source package or server route is tracked; imports remain inside each app's `src/` (`clone-reframed-online-website/src/App.tsx`, `aimirah-mixtape/src/App.tsx`).
- Presentational sections receive content and callbacks from their app root or local data modules (`clone-reframed-online-website/src/App.tsx`, `kdmirah-studio/src/App.tsx`); PasarAPI sections independently call the common fetch hook (`pasarapi-mini-bounty-announcement/src/components/FuelSection.tsx`).

## Layers

- Purpose: Mount the application and compose its ordered sections or active views.
- Location: `clone-reframed-online-website/src/main.tsx`, `clone-reframed-online-website/src/App.tsx`; equivalent files under each sibling `src/`.
- Contains: `createRoot`, `StrictMode`, app-level React state and page composition.
- Depends on: React, local `src/components/`, `src/lib/`, `src/data/`.
- Used by: Each app's `index.html` browser entry.
- Purpose: Render sections, controls, overlays and locally scoped UI behavior.
- Location: `clone-reframed-online-website/src/components/`, `aimirah-mixtape/src/components/`, `clone-string-tune-website/src/components/`, `kdmirah-studio/src/components/`, `pasarapi-mini-bounty-announcement/src/components/`.
- Contains: TSX components with props, effects, pointer handlers and optional hooks.
- Depends on: The app's local `src/lib/`, `src/hooks/`, `src/data/`, `src/types/` as applicable.
- Used by: Each app's `src/App.tsx` and sibling components.
- Purpose: Supply bundled content, formatting, scrolling or remote data access.
- Location: `clone-reframed-online-website/src/lib/data.ts`, `clone-reframed-online-website/src/lib/scroll.ts`, `aimirah-mixtape/src/data/catalog.ts`, `kdmirah-studio/src/lib/content.ts`, `pasarapi-mini-bounty-announcement/src/lib/api.ts`, `clone-string-tune-website/src/lib/ui.tsx`.
- Contains: Typed records, snapshot transforms, Lenis helpers, fetch/async hook and animation primitives.
- Depends on: App-local JSON/assets, browser APIs and installed libraries.
- Used by: App roots and their sections.

## Data Flow

### Primary Request Path

### Sibling Application Flows

## Key Abstractions

- Purpose: Pair source/output images and metadata for a single visual comparison.
- Examples: `clone-reframed-online-website/src/lib/data.ts`, `clone-reframed-online-website/src/components/ExperimentSection.tsx`.
- Pattern: Typed constant array mapped to repeated section components by `clone-reframed-online-website/src/App.tsx:68`.
- Purpose: Model browsable mixtape content, current in-app view and selected install tracks.
- Examples: `aimirah-mixtape/src/types/catalog.ts`, `aimirah-mixtape/src/data/catalog.ts`, `aimirah-mixtape/src/App.tsx`.
- Pattern: Typed data + parent-owned state passed as callbacks/props to `aimirah-mixtape/src/components/ComponentGrid.tsx` and `aimirah-mixtape/src/components/StackBuilderSidebar.tsx`.
- Purpose: Track pending/error/data states and retry a promise-returning loader.
- Examples: `pasarapi-mini-bounty-announcement/src/lib/api.ts:74`, `pasarapi-mini-bounty-announcement/src/components/ForexSection.tsx:22`.
- Pattern: Effect-driven component-level fetch with stale-result guard, not a server-side endpoint.

## Entry Points

- Location: `clone-reframed-online-website/index.html`, `clone-reframed-online-website/src/main.tsx`.
- Triggers: Browser navigation to the built page.
- Responsibilities: Mount `clone-reframed-online-website/src/App.tsx` and load `src/index.css`.
- Location: `aimirah-mixtape/src/main.tsx`, `clone-string-tune-website/src/main.tsx`, `kdmirah-studio/src/main.tsx`, `pasarapi-mini-bounty-announcement/src/main.tsx`.
- Triggers: Each sibling application's own `index.html` build.
- Responsibilities: Independently mount each sibling `src/App.tsx`; no root-level runtime composition (`aimirah-mixtape/package.json`, `pasarapi-mini-bounty-announcement/package.json`).

## Architectural Constraints

- **Threading:** Browser main-thread React effects and animation frames; `clone-reframed-online-website/src/components/ExperimentSection.tsx:41` and `clone-string-tune-website/src/lib/ui.tsx:26` schedule rAF work. No tracked worker source in the five `src/` trees.
- **Global state:** Module-level Lenis in `clone-reframed-online-website/src/lib/scroll.ts:3`; module-level rAF subscribers in `clone-string-tune-website/src/lib/ui.tsx:23`; browser-local persistent keys in `aimirah-mixtape/src/App.tsx:63` and `kdmirah-studio/src/App.tsx:22`.
- **Circular imports:** No known cross-app circular chains; each app imports local modules (`clone-reframed-online-website/src/App.tsx`, `kdmirah-studio/src/App.tsx`).
- **Deployment boundary:** Primary site's domain asset is `clone-reframed-online-website/public/CNAME`; `clone-reframed-online-website/vercel.json` declares a `/dev` redirect. `README.md` identifies GitHub Pages for the primary site; these are separate configuration surfaces.

## Anti-Patterns

### Cross-app shared-source assumption

### Mistaking UI labels for backend routes

## Error Handling

- `pasarapi-mini-bounty-announcement/src/lib/api.ts:23` times out with `AbortController`, rejects HTTP/empty results, retries catalogue calls without server filters, and `useAsyncData` exposes a retry callback.
- `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx:17` serves bundled `fallbackApis.ts` when the directory request fails; `aimirah-mixtape/src/App.tsx:81` falls back to empty cart/initial collections if browser storage parsing fails.

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.hermes/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-fast` for a trivial task inline, with no subagents and no PLAN.md
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
