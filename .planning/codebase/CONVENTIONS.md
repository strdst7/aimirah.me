---
last_mapped_commit: f8435c622ec4708cdef96f7ea7e2c2ef010035e4
last_mapped_at: 2026-11-03
---
# Coding Conventions

**Analysis Date:** 2026-11-03

## Naming Patterns

**Files:**
- Use PascalCase for React components (`clone-reframed-online-website/src/components/ExperimentSection.tsx`, `kdmirah-studio/src/components/VideoGallery.tsx`), camelCase for hooks and utilities (`clone-reframed-online-website/src/hooks/useReveal.ts`, `clone-reframed-online-website/src/lib/scroll.ts`), and `index.css` for app styles (`clone-reframed-online-website/src/index.css`).
- Treat the five top-level applications as separate packages, each with its own `package.json`, `tsconfig.json`, and `src/` (`clone-reframed-online-website/package.json`, `aimirah-mixtape/package.json`, `clone-string-tune-website/package.json`, `kdmirah-studio/package.json`, `pasarapi-mini-bounty-announcement/package.json`).

**Functions:**
- Use camelCase for helpers and handlers (`scrollToId` in `clone-reframed-online-website/src/lib/scroll.ts`, `onDragStart` in `clone-reframed-online-website/src/components/ExperimentSection.tsx`); prefix hooks with `use` (`clone-reframed-online-website/src/hooks/useReveal.ts`, `pasarapi-mini-bounty-announcement/src/hooks/useFx.ts`).
- Use PascalCase for React components (`Nav`, `MenuOverlay` in `clone-reframed-online-website/src/components/Nav.tsx`).

**Variables:**
- Use camelCase for local state and refs (`menuOpen` in `clone-reframed-online-website/src/App.tsx`, `panelRef` in `clone-reframed-online-website/src/components/ExperimentSection.tsx`); use uppercase for fixed content/constants (`EXPERIMENTS` in `clone-reframed-online-website/src/lib/data.ts`, `CATEGORIES` in `kdmirah-studio/src/lib/content.ts`). Follow `AGENTS.md`'s descriptive-name and extracted-complex-condition guidance.

**Types:**
- Use PascalCase for interfaces, aliases, and prop types (`Experiment` in `clone-reframed-online-website/src/lib/data.ts`, `GalleryProps` in `kdmirah-studio/src/components/VideoGallery.tsx`); use `import type` where the type is imported separately (`clone-reframed-online-website/src/components/ExperimentSection.tsx`).

## Code Style

**Formatting:**
- No tracked Prettier or Biome configuration detected; follow the surrounding file. The primary site uses two-space indentation, double quotes, and semicolons (`clone-reframed-online-website/src/App.tsx`, `clone-reframed-online-website/src/lib/scroll.ts`); `aimirah-mixtape/src/data/catalog.ts` and `pasarapi-mini-bounty-announcement/src/lib/api.ts` use single quotes. Do not impose one package's quote style on another.
- Prefer Tailwind utilities in JSX and centralize global tokens, bespoke CSS, and keyframes in `clone-reframed-online-website/src/index.css`; the site's `@theme` defines `ink`, `bone`, `signal`, and font families.

**Linting:**
- No tracked ESLint/Biome config or lint script detected (`clone-reframed-online-website/package.json` and the other four package manifests). TypeScript options `strict`, `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` are configured in `clone-reframed-online-website/tsconfig.json` and the other applications' `tsconfig.json` files; `vite build` is not a substitute for a separate `tsc --noEmit` check (`clone-reframed-online-website/package.json`).

## Import Organization

**Order:**
1. Import React/runtime and third-party modules first (`clone-reframed-online-website/src/components/ExperimentSection.tsx`, `clone-reframed-online-website/src/main.tsx`).
2. Import local components and modules next (`clone-reframed-online-website/src/App.tsx`, `kdmirah-studio/src/components/VideoGallery.tsx`).
3. Keep type-only imports explicitly typed (`clone-reframed-online-website/src/components/ExperimentSection.tsx`, `kdmirah-studio/src/components/VideoGallery.tsx`); import global CSS at the entry point (`clone-reframed-online-website/src/main.tsx`). Exact ordering between local groups is not enforced.

**Path Aliases:**
- `@/*` maps to `src/*` in `clone-reframed-online-website/tsconfig.json` and `clone-reframed-online-website/vite.config.ts`; existing site modules use relative imports (`clone-reframed-online-website/src/App.tsx`, `clone-reframed-online-website/src/components/Nav.tsx`).

## Error Handling

**Patterns:**
- Guard missing browser elements before acting and fall back to native scrolling when Lenis is unavailable (`clone-reframed-online-website/src/lib/scroll.ts`); return early when an observer has no element (`clone-reframed-online-website/src/hooks/useReveal.ts`).
- For remote requests in the data dashboard, abort on timeout, check HTTP status and JSON shape, clear timers in `finally`, and expose retry/error state in the consuming hook (`pasarapi-mini-bounty-announcement/src/lib/api.ts`). The primary site has no comparable network-fetch layer (`clone-reframed-online-website/src/lib/data.ts`).

## Logging

**Framework:** Not detected in sampled application modules (`clone-reframed-online-website/src/lib/scroll.ts`, `pasarapi-mini-bounty-announcement/src/lib/api.ts`).

**Patterns:**
- Handle expected failures through return values or state rather than introducing logging in presentation code (`clone-reframed-online-website/src/lib/scroll.ts`, `pasarapi-mini-bounty-announcement/src/lib/api.ts`).

## Comments

**When to Comment:**
- Explain non-obvious interaction/animation intent and structural JSX regions rather than restating syntax (`clone-reframed-online-website/src/components/ExperimentSection.tsx`, `clone-reframed-online-website/src/components/Preloader.tsx`).

**JSDoc/TSDoc:**
- Short `/** ... */` descriptions appear on hooks and visual components (`clone-reframed-online-website/src/hooks/useReveal.ts`, `clone-reframed-online-website/src/components/Nav.tsx`); extensive API docs are not detected.

## Function Design

**Size:** Keep reusable behavior in small hooks/helpers (`clone-reframed-online-website/src/hooks/useReveal.ts`, `clone-reframed-online-website/src/utils/cn.ts`), but components may contain animation loops, handlers, and JSX in one file (`clone-reframed-online-website/src/components/ExperimentSection.tsx`). No numeric size limit is configured.

**Parameters:** Destructure component props and type them with local `Props`/named aliases (`clone-reframed-online-website/src/components/ExperimentSection.tsx`, `kdmirah-studio/src/components/VideoGallery.tsx`); pass callbacks for parent-controlled transitions (`clone-reframed-online-website/src/App.tsx`, `clone-reframed-online-website/src/components/Preloader.tsx`).

**Return Values:** Return `{ ref, visible }` from view hooks (`clone-reframed-online-website/src/hooks/useReveal.ts`), tuples for the menu hook (`clone-reframed-online-website/src/components/Nav.tsx`), and `undefined` for absent lookup results (`kdmirah-studio/src/lib/content.ts`).

## Module Design

**Exports:** Prefer default exports for primary site components (`clone-reframed-online-website/src/components/Nav.tsx`, `clone-reframed-online-website/src/components/ExperimentSection.tsx`) and named exports for hooks, data, and helpers (`clone-reframed-online-website/src/hooks/useReveal.ts`, `clone-reframed-online-website/src/lib/data.ts`, `clone-reframed-online-website/src/lib/scroll.ts`). Other apps use named component exports (`kdmirah-studio/src/components/VideoGallery.tsx`); match the target app.

**Barrel Files:** Not detected among tracked source; import from concrete modules as in `clone-reframed-online-website/src/App.tsx` and `kdmirah-studio/src/components/VideoGallery.tsx`.

---

*Convention analysis: 2026-11-03*
