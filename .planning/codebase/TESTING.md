# Testing Patterns

**Analysis Date:** 2026-11-01

## Status: No Automated Tests Exist

**There is no test framework, no test file, no test runner config, and no CI pipeline anywhere in this repository.**

Verified by exhaustive scan of all five subprojects:

| Checked | Result |
|---------|--------|
| `vitest.config.*` / `jest.config.*` / `playwright.config.*` / `cypress.config.*` | None found |
| Files matching `*.test.ts(x)` / `*.spec.ts(x)` / `__tests__/` | None found |
| `test` / `typecheck` / `lint` in any `package.json` `scripts` | None — every project has exactly `dev`, `build`, `preview` |
| `vitest`, `jest`, `@testing-library/*`, `playwright`, `cypress`, `happy-dom`, `jsdom` in any `package.json` or `package-lock.json` | None found |
| `.github/` directory or any `*.yml` / `*.yaml` workflow | None found (`.github/` does not exist) |
| ESLint / Prettier / Biome / `.editorconfig` | None found |
| `node_modules/` at any level | Not installed (fresh clone, `npm install` required) |

Every `package.json` is the same shape:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Consequence:** there is no automated safety net. Any change must be verified by hand. Every convention in `CONVENTIONS.md` is enforced only by review and editor type-checking.

## Test Framework

**Runner:** Not configured.

**Assertion Library:** Not configured.

**Run Commands:** None. There is no `npm test` in any subproject — running it fails with `Missing script: "test"`.

## Test File Organization

Not applicable — no tests exist. If tests are added, follow the co-located convention implied by the source layout (`src/components/Foo.tsx` → `src/components/Foo.test.tsx`), since components are one-per-file and `src/utils/cn.ts` / `src/lib/*.ts` are the only pure-function surfaces.

## Mocking

Not applicable.

Worth noting for a future test setup: the projects have **very little mockable surface** and heavy dependence on browser APIs, which shapes what is realistic to test:

- `window.matchMedia` — used in `clone-reframed-online-website/src/components/ExperimentSection.tsx:65`, `kdmirah-studio/src/App.tsx:30`, `clone-string-tune-website/src/lib/ui.tsx:319`, `aimirah-mixtape/src/components/DeckWidgets.tsx:93`
- `IntersectionObserver` — `clone-reframed-online-website/src/components/ExperimentSection.tsx:55`, `clone-string-tune-website/src/lib/ui.tsx:102`, `pasarapi-mini-bounty-announcement/src/hooks/useFx.ts:13`
- `requestAnimationFrame` — 5 separate hand-rolled loops (`ExperimentSection.tsx`, `clone-string-tune-website/src/lib/ui.tsx:29` global registry, `src/App.tsx:158`, `pasarapi-mini-bounty-announcement/src/hooks/useFx.ts:44`, `aimirah-mixtape/src/components/DeckWidgets.tsx:411` `useVUDrive`)
- `localStorage` — `kdmirah-studio/src/App.tsx:25`, `aimirah-mixtape/src/App.tsx:66,79`
- `navigator.clipboard` + `document.execCommand` — `kdmirah-studio/src/App.tsx:74-95`
- `fetch` — `pasarapi-mini-bounty-announcement/src/lib/api.ts` (only network code in the repo)
- `window.setInterval` / `window.setTimeout` — preloaders, clock, toast dismissal

## Fixtures and Factories

Not applicable. There are no fixtures. Two data sources would serve as natural fixtures:

- `pasarapi-mini-bounty-announcement/src/data/fallbackApis.ts` — a static `ApiEntry[]` snapshot already used as an offline fallback; usable as a fetch mock payload.
- `kdmirah-studio/src/data/videos.json` and `aimirah-mixtape/src/data/catalogSnapshot.json` — static JSON catalogs imported as typed arrays. No network needed to exercise list rendering.

## Coverage

**Requirements:** None. No coverage tool installed, no threshold configured, no coverage output directory in `.gitignore`.

**View Coverage:** Not possible without adding tooling.

## Test Types

**Unit Tests:** None.

**Integration Tests:** None.

**E2E Tests:** None.

## What Is Currently Used as Manual Verification

The only verification loop today. Run it from inside each subproject directory after `npm install`.

### 1. Type checking (not wired into any script)

`npm run build` runs `vite build` only — it does **not** run `tsc`. esbuild strips types without checking them, so type errors do not fail the build.

```bash
cd <subproject>
npx tsc --noEmit          # the ONLY type check available; must be run manually
```

`tsc` is installed (`typescript@5.9.3`) and `tsconfig.json` has `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. This is the highest-value check available and the one most likely to be skipped.

### 2. Production build (catches bundling and import errors)

```bash
cd clone-reframed-online-website
npm install
npm run build             # vite build — fails on unresolved imports, bad JSX, CSS errors
npm run preview           # serve the built output at http://localhost:4173
```

All five projects use `vite-plugin-singlefile`, so a successful build emits a **single self-contained `dist/index.html`** with CSS and JS inlined. Verify by opening the file or the preview URL — a blank page usually means a runtime error that the build step could not catch.

### 3. Dev server (the primary visual check)

```bash
npm run dev               # http://localhost:5173
```

Manual checklist implied by the code — these are the behaviors most likely to break:

| Area | What to exercise | Files |
|------|------------------|-------|
| Preloader → content handoff | Page must not stay scroll-locked; `document.body.style.overflow` restored | `clone-reframed-online-website/src/App.tsx:27`, `clone-string-tune-website/src/App.tsx:162` |
| Draggable seam | Mouse drag, tap, and ArrowLeft/ArrowRight keyboard; seam clamps to 4–96% | `clone-reframed-online-website/src/components/ExperimentSection.tsx` |
| Scroll reveals | Sections appear on scroll; no permanently invisible content | `src/hooks/useReveal.ts`, `src/lib/ui.tsx` |
| Modals | Escape closes; background scroll locked then unlocked; focus lands in search input | `kdmirah-studio/src/components/SearchDialog.tsx:22`, `src/components/VideoModal.tsx:37`, `src/lib/scrollLock.ts` |
| Theme toggle | `.dark` class on `<html>`; persisted to `localStorage`; survives reload | `kdmirah-studio/src/App.tsx:33`, `aimirah-mixtape/src/App.tsx:64` |
| Clipboard | Prompt/install-command copy shows toast (has `execCommand` fallback) | `kdmirah-studio/src/App.tsx:73` |
| Live data | Fuel/forex/population render; **and** the error + retry path (disconnect network) | `pasarapi-mini-bounty-announcement/src/lib/api.ts`, `src/components/FuelSection.tsx:118` |
| Empty/loading states | `Skeleton` and `ErrorPanel` show instead of a crash | `pasarapi-mini-bounty-announcement/src/components/ui.tsx:154,177` |
| Responsive layout | Mobile menu, sidebar collapse, grid breakpoints (`sm:`/`md:`/`lg:`) | `src/components/Header.tsx` in each project |
| Reduced motion | Scripted animations neutralize under `prefers-reduced-motion: reduce` | `clone-reframed-online-website/src/components/ExperimentSection.tsx:66` |

### 4. Deployment as the final gate

`clone-reframed-online-website/vercel.json` and `public/CNAME` indicate GitHub Pages / Vercel deployment with no build checks in between. Nothing gates a merge.

## Gaps and Risks

**Highest risk — type errors ship silently.** `vite build` never type-checks. A one-line change to a `Props` interface that breaks a caller builds cleanly and fails at runtime with `undefined` props. Compounding this, `strict` is on but `noUncheckedIndexedAccess` is off, so `latest[lv.length - 1]` in `pasarapi-mini-bounty-announcement/src/components/FuelSection.tsx:111` is typed as `FuelRow`, not `FuelRow | undefined`, and the code must guard manually (`!latest && <SkeletonError .../>`).

**Untested pure logic (safe, high-value, zero DOM needed):**
- `pasarapi-mini-bounty-announcement/src/lib/api.ts` — `fmtRM`, `fmtRate`, `fmtInt`, `fmtDay`, `fmtDayYear`, `buildUrl`, and the `getJson` error paths (`HTTP ${status}`, `EMPTY_RESPONSE`)
- `kdmirah-studio/src/lib/content.ts` — `sortVideos`, `durationSeconds`, `profileUrl`, `initials`, `videoBySlug`, `skillBySlug`. `durationSeconds` on a malformed `"mm:ss"` string is an obvious edge case.
- `aimirah-mixtape/src/data/catalog.ts` — `stripExt`, `formatComponentTitle`, `buildSingleInstallCmd`, `lookupCatalogItem`, `buildStackInstallCommand` in `src/components/StackBuilderSidebar.tsx:6`
- `aimirah-mixtape/src/types/catalog.ts` — `CartState` reducer-like merge in `src/App.tsx` (`{ ...EMPTY_CART, ...JSON.parse(raw) }` is unvalidated)
- `clone-reframed-online-website/src/lib/scroll.ts` — `stopScroll`/`startScroll` state

**Untested state logic (needs React Testing Library):**
- Cart/collection persistence and hydration in `aimirah-mixtape/src/App.tsx:79-100` — malformed `localStorage` JSON is swallowed by `catch {}` and silently resets
- Filter/sort/pagination derivation in `kdmirah-studio/src/App.tsx:118-130` and `src/components/VideoGallery.tsx`
- Modal navigation wrap-around (`navigateVideo` with `(activeIndex + direction + len) % len`)

**Untested and hardest to cover:** rAF animation loops, IntersectionObserver reveals, Lenis smooth scroll, and the preloader → scroll-unlock handoff. These require jsdom stubs for `IntersectionObserver`, `matchMedia`, and `requestAnimationFrame`, or a real browser via Playwright.

## What Would Need to Be Added

Suggested minimal setup, per subproject (there is no shared root `package.json`, so it must be repeated or a root workspace introduced):

**1. Vitest + jsdom** — fits Vite seamlessly, no separate config file needed if the block goes in `vite.config.ts`:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

```jsonc
// package.json
"scripts": {
  "dev": "vite",
  "build": "tsc --noEmit && vite build",   // add the missing type gate first
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "typecheck": "tsc --noEmit"
}
```

**2. Test setup file** — stub the browser APIs the components assume:

```ts
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  }),
});

globalThis.IntersectionObserver = class {
  observe() {} unobserve() {} disconnect() {} takeRecords() { return []; }
} as unknown as typeof IntersectionObserver;

globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0) as unknown as number;
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
```

**3. `tsconfig.json`** — extend `include` to cover test files and add the setup global:

```jsonc
"include": ["src", "vite.config.ts"],
"types": ["node", "vitest/globals"]
```

**4. First tests to write** (highest value, no DOM required):

```ts
// pasarapi-mini-bounty-announcement/src/lib/api.test.ts
import { describe, expect, it } from "vitest";
import { fmtRM, fmtRate, fmtDay } from "./api";

describe("fmtRM", () => {
  it("renders a placeholder for null and NaN", () => {
    expect(fmtRM(null)).toBe("--.--");
    expect(fmtRM(undefined)).toBe("--.--");
    expect(fmtRM(Number.NaN)).toBe("--.--");
  });
  it("formats to two decimals by default", () => {
    expect(fmtRM(2.1)).toBe("2.10");
  });
});
```

```ts
// kdmirah-studio/src/lib/content.test.ts
import { describe, expect, it } from "vitest";
import { durationSeconds, sortVideos } from "./content";

describe("durationSeconds", () => {
  it("parses mm:ss", () => {
    expect(durationSeconds("01:30")).toBe(90);
  });
  it("does not return NaN for malformed input", () => {
    expect(durationSeconds("bad")).toBe(0);
  });
});
```

**5. CI** — no `.github/` exists. Minimum viable workflow:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        project: [clone-reframed-online-website, clone-string-tune-website, kdmirah-studio, pasarapi-mini-bounty-announcement, aimirah-mixtape]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: "${{ matrix.project }}/package-lock.json" }
      - run: npm ci
        working-directory: ${{ matrix.project }}
      - run: npx tsc --noEmit
        working-directory: ${{ matrix.project }}
      - run: npm run build
        working-directory: ${{ matrix.project }}
      - run: npm test
        working-directory: ${{ matrix.project }}
```

Order matters: `tsc --noEmit` first (fast, catches type regressions), then `build` (catches bundling), then `test`.

**6. Optional linting** — no ESLint config exists, and two `// eslint-disable-next-line react-hooks/exhaustive-deps` comments are inert (`clone-string-tune-website/src/lib/ui.tsx:121`, `src/App.tsx:34`). Adding ESLint with `eslint-plugin-react-hooks` would activate them and catch the missing dependency arrays. There is also no formatter; the repo has four distinct quote styles (`CONVENTIONS.md` has the table), which a Prettier pass would flatten — decide deliberately before introducing it.

## Priority Order for Closing the Gap

1. **Add `tsc --noEmit` to the `build` script** — cheapest possible fix, prevents the most likely class of shipped defect. No new dependencies.
2. **Add a GitHub Actions workflow running `tsc --noEmit` + `vite build`** for all five projects — no dependencies beyond the runner, catches broken imports and type errors on every push.
3. **Add Vitest and cover the four pure-logic modules** listed above — fast, high-confidence, no DOM stubs needed.
4. **Add React Testing Library for `kdmirah-studio` filter/sort/pagination** and `aimirah-mixtape` cart persistence — the stateful logic with the most user-visible failure modes.
5. **Add Playwright smoke tests** for the three animation-heavy projects (`clone-reframed-online-website`, `clone-string-tune-website`, `aimirah-mixtape`) — one test per page asserting the preloader clears and the hero heading is visible. This is the only way to catch the scroll-lock and rAF failures that manual testing currently owns.

---

*Testing analysis: 2026-11-01*
