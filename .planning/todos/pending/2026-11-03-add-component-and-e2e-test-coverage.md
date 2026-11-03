---
created: 2026-11-03T09:07:19.000Z
title: Add component and E2E test coverage
area: testing
files:
  - tests/
  - vitest.config.ts
  - package.json
  - aimirah-mixtape/src/components/SearchModal.tsx
  - aimirah-mixtape/src/App.tsx
  - clone-reframed-online-website/src/components/ExperimentSection.tsx
  - kdmirah-studio/src/lib/content.ts
---

## Problem

The repo now has 20 Vitest tests, but they cover only pure functions and
storage guards:

- `tests/studio-content.test.ts` — `durationSeconds`, `sortVideos`
- `tests/pasarapi-format.test.ts` — `fmtRate`, `fmtInt`
- `tests/shared-storage.test.ts` — `safeJsonParse`, `isObject`, `pickKnownShape`,
  `hasStringFields`, `isArrayOf`

Nothing exercises rendered components, and there are still no end-to-end
checks. The interactive surface that users actually touch remains untested:

- catalogue search / filter / sort (`aimirah-mixtape/src/components/SearchModal.tsx`)
- stack-builder cart and its localStorage round-trip (`aimirah-mixtape/src/App.tsx`)
- drag-seam interaction and keyboard handling
  (`clone-reframed-online-website/src/components/ExperimentSection.tsx`)
- video pagination and sorting UI (`kdmirah-studio/src/lib/content.ts` consumers)
- every data-driven view in `pasarapi-mini-bounty-announcement`

This is the remaining half of CONCERNS.md #3 / #33. It also blocks safe
execution of the shared-primitives refactor, which touches the preloader and
cursor on the critical path of every page.

## Solution

Two layers, cheapest first.

**1. Component tests (Vitest + jsdom + @testing-library/react).**

Add `environment: "jsdom"` and `@testing-library/react` + `@testing-library/user-event`.
Target the pure-ish interactive pieces rather than whole pages:

- `SearchModal` — typing filters the list, escape closes, keyboard nav selects.
- Cart reducer behaviour — add/remove/clear, and that a malformed localStorage
  payload falls back to empty (the guards exist in `shared/storage.ts`, so
  assert the integration, not the guard itself).
- `ExperimentSection` seam — keyboard arrow adjusts the clip position.
- `sortVideos` consumers — rendered order matches the selected sort.

**2. E2E smoke tests (Playwright), one spec per site.**

Keep them deliberately shallow — the goal is "the site boots", not full
regression coverage:

- build succeeds and `dist/index.html` exists (already partly covered by CI)
- page renders a known heading
- zero console errors on load
- `prefers-reduced-motion: reduce` emulation produces no continuous rAF work
  (assert via a stubbed `requestAnimationFrame` counter)

Wire both into `.github/workflows/ci.yml`: component tests in the existing
`unit` job, Playwright as a new job that builds each site and serves `dist/`.

Note: Playwright browsers add ~1GB to CI. If that is unacceptable, run E2E
nightly/scheduled instead of per-PR rather than dropping it.
