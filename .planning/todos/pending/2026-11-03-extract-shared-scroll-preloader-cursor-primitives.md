---
created: 2026-11-03T09:07:19.000Z
title: Extract shared scroll, preloader and cursor primitives
area: ui
files:
  - clone-reframed-online-website/src/components/Preloader.tsx
  - clone-reframed-online-website/src/components/Cursor.tsx
  - clone-reframed-online-website/src/components/Starfield.tsx
  - clone-reframed-online-website/src/hooks/useReveal.ts
  - clone-reframed-online-website/src/lib/scroll.ts
  - clone-string-tune-website/src/App.tsx
  - clone-string-tune-website/src/lib/ui.tsx
  - kdmirah-studio/src/lib/scrollLock.ts
---

## Problem

`clone-reframed-online-website` and `clone-string-tune-website` each reimplement
the same motion primitives instead of sharing them. The shared `@aimirah/shared`
package now covers `cn()`, build config, motion hooks, ErrorBoundary and storage
guards, but the heavier primitives are still duplicated:

- **Preloader** — `clone-reframed-online-website/src/components/Preloader.tsx`
  vs an inline `Preloader` function at `clone-string-tune-website/src/App.tsx:14-62`.
  Different durations and easing.
- **Custom cursor** — `clone-reframed-online-website/src/components/Cursor.tsx`
  vs an independent implementation in `clone-string-tune-website`.
- **Lenis bootstrap** — `clone-reframed-online-website/src/lib/scroll.ts` vs
  `clone-string-tune-website/src/App.tsx:133`.
- **Scroll lock** — genuinely divergent behaviour:
  `clone-reframed-online-website/src/lib/scroll.ts:23` writes
  `documentElement.style.overflow`, while `kdmirah-studio/src/lib/scrollLock.ts`
  uses a ref-counted `body.style.overflow`. Two locking schemes on one origin
  is a real correctness risk if sites are ever composed.
- **Scroll-progress / reveal hooks** — `clone-reframed-online-website/src/hooks/useReveal.ts`
  and `clone-string-tune-website/src/lib/ui.tsx:68` (`useSectionProgress`).

This is the remaining half of CONCERNS.md #2. The monorepo half (#1) is done,
so extraction is now cheap: the package already exists and is linked.

## Solution

Move the primitives into `shared/` as separate entry points and rewire both
sites to import them:

1. `shared/scrollLock.ts` — single ref-counted implementation; migrate both
   current call sites to it (this is the highest-value fix because the two
   existing behaviours genuinely differ).
2. `shared/useReveal.ts` — merge `useReveal` and `useSectionProgress`, keeping
   `ProgressMode` as a parameter.
3. `shared/Preloader.tsx` — accept `duration`/`onDone` props so the two sites
   can keep their current timings without forking the component.
4. `shared/Cursor.tsx` — already gated on `prefers-reduced-motion` and
   `visibilitychange`; keep that behaviour.
5. Export each from `shared/package.json` `exports` and bump the peer deps.

Deliberately NOT in scope: extracting the Lenis provider itself. It is small
and its setup differs enough per site that a shared wrapper would mostly add
indirection. Revisit only if a third site needs it.

Verification: `tsc --noEmit` and `vite build` for both affected sites, plus a
manual side-by-side check that the preloader timing and cursor feel are
unchanged.
