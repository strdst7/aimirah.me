# Codebase Concerns

**Analysis Date:** 2026-11-01
**Remediation pass:** 2026-11-01 — see the [Remediation status](#remediation-status) table at the end.

Scope: the repository root `/root/aimirah.me` contains five independent Vite + React 19 + TypeScript sites with no root `package.json` and no workspace tooling.

- `clone-reframed-online-website/` — kdmirah "Digital Inspiration Lab" (live at aimirah.me), the only project documented in `README.md`
- `clone-string-tune-website/` — "MI4Inc." motion study (deployed at `clone-string-tune-website-gold.vercel.app`)
- `aimirah-mixtape/` — aimirah.mixtape component catalog/CLI marketing site
- `kdmirah-studio/` — kdmirah.studio Opus 5.5 video archive
- `pasarapi-mini-bounty-announcement/` — PASAR.DATA Malaysia open-data dashboard

## Summary of Concerns by Severity

| Severity | Count | Theme |
|----------|-------|-------|
| High | 8 | Duplication/no monorepo, no tests/CI, single-file bundling of multi-MB assets, missing `.gitignore` (secret risk), conflicting deploy config, image loading/CLS, perf-heavy animation loops, unverifiable marketing data |
| Medium | 12 | Dependency drift, dead code, oversized components, SEO gaps, a11y in modals, reduced-motion gaps, CDN font dependence, duplicate API fetches, branding/content drift, font licensing, missing root docs, hardcoded preview URLs |
| Low | 6 | `key={i}`, `as any` casts, lockfile bloat, no engines pin, CSS-naming divergence, demo auth |

---

## Tech Debt

### 1. Five near-identical projects with no shared code or monorepo tooling
- **Severity:** High
- **Files:** All five `package.json` files; `*/vite.config.ts` (5 identical copies, md5 `2ae1972…`); `*/tsconfig.json` (5 identical copies, md5 `c43fbad…`); `*/src/main.tsx` (5 identical, md5 `447c8ce…`); `*/src/utils/cn.ts` (5 identical, md5 `d9837f3…`)
- **Issue:** Every project pins the same React 19.2.6 / Vite 7.3.7 / Tailwind 4.1.17 stack with byte-identical config, `main.tsx`, and `cn.ts`. There is no root `package.json`, no `workspaces`, no shared `packages/ui`. Five `package-lock.json` files (~444 KB total) and five `node_modules` trees are installed independently.
- **Impact:** A React/Vite/Tailwind security bump must be applied and re-locked five times by hand. Divergence is already visible (see dependency drift #9). Editor/TS server loads five duplicate projects.
- **Fix approach:** Introduce a root `package.json` with npm workspaces (or pnpm), a shared `packages/config` (vite/tsconfig presets) and `packages/ui` (`cn`, shared primitives). Each site keeps only its `src/`. This is the single highest-leverage refactor in the repo.

### 2. "clone-*" projects are divergent copies rather than shared components
- **Severity:** High
- **Files:** `clone-reframed-online-website/src/components/*` vs `clone-string-tune-website/src/components/*`
- **Issue:** Both projects independently reimplement the same primitives rather than sharing them — `Preloader` (`clone-reframed-online-website/src/components/Preloader.tsx`, `clone-string-tune-website/src/App.tsx:14-62`), a custom cursor, Lenis bootstrapping (`clone-reframed-online-website/src/lib/scroll.ts`, `clone-string-tune-website/src/App.tsx:133`), scroll-progress hooks (`clone-string-tune-website/src/lib/ui.tsx:68`, `clone-reframed-online-website/src/hooks/useReveal.ts`), and Footer/Header variants. Similarity analysis shows structural overlap (`IndexSection.tsx` ↔ `Header.tsx` ≈0.90 quick-ratio; `Hero.tsx` ↔ `WhoItsFor.tsx` ≈0.89).
- **Impact:** Bug fixes to the reveal/scroll/preloader pattern must be repeated per site; behavior drifts (different preloader durations, different scroll-lock implementations — `clone-reframed-online-website/src/lib/scroll.ts:23` writes `documentElement.style.overflow`; `kdmirah-studio/src/lib/scrollLock.ts` uses a ref-counted `body.style.overflow`).
- **Fix approach:** Extract `Preloader`, `CustomCursor`, `useSectionProgress`, `useReveal`, Lenis provider, and a single scroll-lock into a shared package; make each site compose them.

### 3. No tests anywhere in the repository
- **Severity:** High
- **Files:** No `*.test.*`, `*.spec.*`, `vitest.config.*`, `jest.config.*`, or `playwright.config.*` in any project; no `test` script in any `package.json`
- **Issue:** All five sites ship zero automated tests despite substantial logic: catalog search/filter (`aimirah-mixtape/src/components/SearchModal.tsx`), cart/collection persistence (`aimirah-mixtape/src/App.tsx:82-118`), data-fetch retry and formatting (`pasarapi-mini-bounty-announcement/src/lib/api.ts`), pagination/sorting (`kdmirah-studio/src/lib/content.ts:183-206`), and drag-seam keyboard handling (`clone-reframed-online-website/src/components/ExperimentSection.tsx`).
- **Impact:** Refactors (especially #1 consolidation) have no safety net; regressions in formatting (`fmtRate`, `fmtRM`), filters, and localStorage parsing reach production silently.
- **Fix approach:** Add Vitest at the root for pure functions (`api.ts` formatters, `content.ts` `sortVideos`/`durationSeconds`, `catalog.ts` `lookupCatalogItem`, `stripExt`/`formatComponentTitle`) and Playwright smoke tests per site (build succeeds, page renders, no console errors).

### 4. No CI pipeline
- **Severity:** High
- **Files:** No `.github/workflows/`, no `.gitlab-ci.yml`, no other CI config; `git log` shows a single commit `1d65fa9 chore: import aimirah.me baseline`
- **Issue:** Nothing runs `tsc`, `vite build`, linting, or tests on commit/PR. Type errors (`noUnusedLocals`/`noUnusedParameters` are enabled in `*/tsconfig.json`) and broken build configs are only caught manually.
- **Impact:** Any of the five sites can silently fail to build; drift in shared config is undetected.
- **Fix approach:** A single matrix workflow over the five directories: `npm ci && npx tsc --noEmit && npm run build`. Add a linkcheck/markup check for `index.html` meta tags.

### 5. Missing `.gitignore` in two projects (secret- and bloat-exposure risk)
- **Severity:** High
- **Files:** `clone-reframed-online-website/` and `clone-string-tune-website/` have **no** `.gitignore` (confirmed `git check-ignore` fails); root `/root/aimirah.me/.gitignore` only ignores `.vercel` and `.env*`
- **Issue:** In these two projects `node_modules/`, `dist/`, and editor artifacts are not ignored. Although `node_modules` is currently untracked, a single `git add .` would commit multi-hundred-MB dependency trees and any future `.env.local`/build secrets. `aimirah-mixtape/.gitignore` also redundantly lists `.vercel` and `.env*` twice.
- **Impact:** Repository bloat and potential credential leakage (any `.env.production` with a token would be committed).
- **Fix approach:** Add per-project `.gitignore` (`node_modules/`, `dist/`, `.env*`, `*.local`) and a root `.gitignore` covering `**/node_modules/`, `**/dist/`, `**/.env*`.

### 6. Single-file build inlines multi-megabyte assets into `index.html`
- **Severity:** High
- **Files:** `clone-string-tune-website/src/components/Hero.tsx:10-15`, `clone-string-tune-website/src/assets/*` (4.5 MB total: `tree.webp` 1.39 MB, `bamboo-1..4.webp` 2.36 MB, plus JPGs); `aimirah-mixtape/src/data/catalogSnapshot.json` (432 KB) imported at `aimirah-mixtape/src/data/catalog.ts:1`; `kdmirah-studio/src/data/videos.json` (334 KB) imported at `kdmirah-studio/src/lib/content.ts:1`; `viteSingleFile()` enabled in all five `vite.config.ts`
- **Issue:** `vite-plugin-singlefile` inlines JS/CSS and, by default, the emitted assets into one `index.html`. With ~4.6 MB of string-tune imagery, the production HTML becomes ~6 MB (base64 +33% overhead) before fonts. `catalogSnapshot.json` (gzip 55 KB) and `videos.json` (gzip 94 KB) are baked into the JS bundle of the mixtape and studio sites respectively, even though only ~350 catalog rows / 418 videos are needed.
- **Impact:** Slow first paint on mobile, high data usage, and no ability to cache images/JSON separately. LCP is dominated by a monolithic HTML download.
- **Fix approach:** Drop `viteSingleFile` or configure it to exclude large assets; move images to `public/` and reference by URL, add responsive `srcset`, and lazy-load below-the-fold media. For `videos.json`/`catalogSnapshot.json`, split into per-category chunks or fetch at runtime and render skeletons.

### 7. Duplicate and conflicting deployment configuration
- **Severity:** High
- **Files:** `clone-reframed-online-website/public/CNAME` (`aimirah.me`, GitHub Pages), `clone-reframed-online-website/vercel.json` (Vercel redirect `/dev → https://aimirah-mi4.netlify.app/`), `clone-reframed-online-website/src/components/IndexSection.tsx:127` (`https://clone-string-tune-website-gold.vercel.app/`), `:140` (`https://aimirah-mi4.netlify.app/`), `README.md:48` (states GitHub Pages)
- **Issue:** One project carries artifacts for three hosting providers simultaneously, and preview URLs are hardcoded into the site body. Four of five projects have no deployment config or documented target at all. `README.md` describes only the reframed site, so hosting for mixtape/studio/pasarapi is undiscoverable.
- **Impact:** A deploy to the "wrong" provider silently diverges from `aimirah.me`; rotating a preview deployment breaks links in `IndexSection.tsx`.
- **Fix approach:** Pick one hosting target per site, delete the others' config, move preview URLs to a single constants file, and document each target in `README.md`.

### 8. Inconsistent `prefers-reduced-motion` handling
- **Severity:** Medium
- **Files:** `clone-reframed-online-website/src/components/Starfield.tsx` (no reduce check — full canvas rAF loop always runs), `clone-reframed-online-website/src/components/Cursor.tsx` (rAF loop always runs once `pointer:fine`), `clone-reframed-online-website/src/components/ExperimentSection.tsx:66` (has a check), `aimirah-mixtape/src/components/DeckWidgets.tsx:93` (has a check), `aimirah-mixtape/src/index.css:312`, `kdmirah-studio/src/index.css:173`, `pasarapi-mini-bounty-announcement/src/index.css:124` (CSS guards)
- **Issue:** Motion-reduction is applied piecemeal. The starfield, custom cursor, and several `setInterval` counters (`aimirah-mixtape/src/components/HomeStats.tsx:92-105`, `aimirah-mixtape/src/App.tsx:325`) keep animating regardless of the user's OS preference.
- **Impact:** Users with vestibular disorders still get continuous motion; also wastes battery.
- **Fix approach:** Centralize a `usePrefersReducedMotion()` hook and gate every rAF/interval/canvas component on it (freeze to a static frame).

---

## Known Bugs / Data Integrity

### 9. Marketing numbers contradict shipped data
- **Severity:** High
- **Files:** `aimirah-mixtape/index.html:6,9`, `aimirah-mixtape/src/App.tsx:774,974`, `aimirah-mixtape/src/components/ComponentGrid.tsx:395,685`, `aimirah-mixtape/src/components/SecondaryViews.tsx:784,807,838` all claim "1,910+" components; `aimirah-mixtape/src/data/catalogSnapshot.json` actually ships **350** rows (48 each for most types) while its own `counts` block sums to **1,935**; `kdmirah-studio/src/lib/content.ts:207` hardcodes `GITHUB_STARS = 9536`; `aimirah-mixtape/src/components/HomeStats.tsx:92-94` starts counters at `1618534` downloads / `249812` npm installs and increments them with `Math.random()`
- **Issue:** The advertised catalog size cannot be browsed; search only searches 350 items. Download/star counts are fabricated and drift upward on a timer.
- **Impact:** Misleading product claims; SEO snippets (title/description) will not match on-page content.
- **Fix approach:** Derive claims from `CATALOG_COUNTS`/`ALL_CATALOG_ITEMS.length` (single source of truth), and replace invented counters with real values or clearly-labelled illustrative data.

### 10. Branding/content drift between projects and folders
- **Severity:** Medium
- **Files:** `clone-string-tune-website/index.html:6` `<title>MI4Inc.</title>`, but `clone-string-tune-website/src/components/WhoItsFor.tsx:138` links to `https://aimirah.com`, while `Header.tsx`/`Footer.tsx` link to `https://mi4inc.com`; folder names (`clone-string-tune-website`, `clone-reframed-online-website`) describe the *source* that was cloned, not the shipped brand
- **Issue:** Two brands (MI4Inc. and aimirah) coexist inside one site; external links point to two different domains. Folder names no longer describe content.
- **Impact:** Confusing navigation and analytics; future maintainers cannot tell which domain is canonical.
- **Fix approach:** Decide the brand, update all links to one domain, and rename directories to `sites/mi4inc-motion`, `sites/kdmirah-lab`, etc.

### 11. Third-party-derived catalog content with rebranding
- **Severity:** Medium
- **Files:** `aimirah-mixtape/src/data/catalog.ts:47-52` (`rebrandText` replaces `claude-code-templates`→`aimirah-mixtape` and `aitmpl.com`→`aimirah.mixtape`), `aimirah-mixtape/src/data/catalogSnapshot.json` (31 rows authored `"claude-code-templates"`, plus third-party authors such as "Seza Akgün", "Vercel Engineering", "supabase")
- **Issue:** Catalog data is derived from another project and partially relabelled, while retaining third-party authorship. `synthesizeFileContent` (`catalog.ts:56+`) fabricates install manifests for items.
- **Impact:** Attribution/licensing ambiguity given the repo is GPL-3.0; users may install non-existent `npx aimirah-mixtape` packages (a package that may not be published).
- **Fix approach:** Verify the CLI package actually exists on npm, preserve original authorship/licence fields verbatim, add a provenance note, and do not synthesize content for items that lack source files.

### 12. Unused/dead code and unused dependencies
- **Severity:** Medium
- **Files:**
  - Unused components/exports: `kdmirah-studio/src/components/VideoCardSkeleton.tsx` (never imported), `kdmirah-studio/src/lib/content.ts` exports `initials`, `skillBySlug`, `VideoCardPosterFallback`; `clone-string-tune-website/src/lib/ui.tsx` exports `easeOut`, `lerp` unused; `pasarapi-mini-bounty-announcement/src/lib/api.ts:87` `fmtRM` unused; `aimirah-mixtape/src/types/catalog.ts:47` `CartItem` only used by `CartState`
  - Entire `cn.ts` dead in 3 projects: `aimirah-mixtape/src/utils/cn.ts`, `clone-reframed-online-website/src/utils/cn.ts`, `clone-string-tune-website/src/utils/cn.ts` (0 importers each), yet `clsx` + `tailwind-merge` remain in their `package.json`
  - Unused deps: `react-is` (`pasarapi-mini-bounty-announcement/package.json:16`, 0 imports), `esbuild` devDep (`kdmirah-studio/package.json`, 0 imports — Vite bundles its own)
- **Issue:** Dead files and unused packages inflate lockfiles and confuse the dependency graph.
- **Impact:** Slower installs, misleading "what's used" picture during onboarding.
- **Fix approach:** Delete unused exports/files; remove `clsx`/`tailwind-merge` from the three projects that never call `cn`; drop `react-is` and `esbuild`.

---

## Security Considerations

### 13. Unignored build/env artifacts (see #5)
- **Severity:** High
- **Files:** `clone-reframed-online-website/`, `clone-string-tune-website/` (no `.gitignore`)
- **Risk:** Any future `.env*` or credential file in these directories is eligible for commit; currently `git ls-files` is clean, but nothing prevents an accident.
- **Current mitigation:** None at the project level.
- **Recommendations:** Add `.gitignore` immediately; add a pre-commit `gitleaks`/`detect-secrets` hook.

### 14. Demo authentication handled entirely client-side
- **Severity:** Low
- **Files:** `kdmirah-studio/src/components/Dialogs.tsx` (`AuthDialog`, state `email`/`password`, client-only regex validation)
- **Risk:** Password is held in React state; the dialog honestly labels itself "demo", but it teaches a pattern that must never be copied into a real flow.
- **Current mitigation:** No network call; every toast says "(demo)".
- **Recommendations:** Keep, but rename to `DemoAuthDialog` and add a code comment forbidding backend extension without a real auth provider.

### 15. External script/asset dependence on Google Fonts
- **Severity:** Medium
- **Files:** `aimirah-mixtape/index.html:11-16`, `clone-reframed-online-website/index.html:37-42`, `pasarapi-mini-bounty-announcement/index.html:15-18`, `kdmirah-studio/src/index.css:1` (`@import url("https://fonts.googleapis.com/...")`)
- **Risk:** Third-party availability/privacy/CSP: importing fonts in CSS blocks render and cannot use `preconnect`; Google Fonts is a privacy and single-point-of-failure dependency.
- **Current mitigation:** `preconnect` hints in three of four (kdmirah-studio's CSS `@import` cannot use them).
- **Recommendations:** Self-host fonts (string-tune already self-hosts `KHTeka*.woff2`), or at minimum move the kdmirah `@import` into `index.html` with `preconnect` + `display=swap`.

### 16. Provenance/licence of bundled fonts and images
- **Severity:** Medium
- **Files:** `clone-string-tune-website/src/assets/fonts/KHTeka-Regular.woff2`, `KHTekaMono-Regular.woff2`, `clone-string-tune-website/src/assets/*.jpg|webp` (≈4.5 MB), `clone-reframed-online-website/public/images/*.jpg`
- **Risk:** "KH Teka" is a commercial typeface; the repo is GPL-3.0 (`/root/aimirah.me/LICENSE`) but ships the font binaries with no OFL/licence file alongside. Photographic assets likewise have no attribution.
- **Current mitigation:** None (no licence files found other than the root GPL).
- **Recommendations:** Add font/image licences or replace commercial assets with open alternatives before redistributing.

---

## Performance Bottlenecks

### 17. Unoptimized, eager, dimension-less images
- **Severity:** High
- **Files:** `clone-reframed-online-website/src/components/ExperimentSection.tsx:188-207`, `clone-reframed-online-website/src/components/IndexSection.tsx:62`, `clone-string-tune-website/src/components/Hero.tsx:534-561`, `clone-string-tune-website/src/components/Masonry.tsx:193,272,359`, `clone-string-tune-website/src/components/Techniques.tsx:145,228`
- **Issue:** Across reframed and string-tune there are **zero** `loading=`, `decoding=`, `srcset`, or `width`/`height` attributes on `<img>` (only `kdmirah-studio` uses `loading="lazy"`/`decoding="async"`). Hero/experiment images are 400 KB–1.4 MB JPEG/WebP displayed full-bleed; several are mounted at once (the `IndexSection` preview renders all four experiment images stacked).
- **Impact:** Massive LCP and CLS penalties on mobile; everything downloads on first paint even when below the fold.
- **Fix approach:** Add explicit `width`/`height` (or `aspect-ratio`), `loading="lazy"` + `decoding="async"` for non-hero images, `fetchpriority="high"` + preload only for the true hero, and generate 480/960/1440 `srcset` variants with `sharp`/`squoosh` at build time.

### 18. Multiple always-on animation loops
- **Severity:** Medium
- **Files:** `clone-reframed-online-website/src/components/Starfield.tsx:150-156` (canvas stars + comets), `clone-reframed-online-website/src/components/Cursor.tsx:52-65`, `aimirah-mixtape/src/components/DeckWidgets.tsx:126-129,414`, `clone-reframed-online-website/src/components/Manifesto.tsx:32-34`, `clone-reframed-online-website/src/components/ExperimentSection.tsx:49-125` (three rAF loops), `aimirah-mixtape/src/components/HomeStats.tsx:97` and `clone-reframed-online-website/src/components/Nav.tsx:31` (1 s intervals), `pasarapi-mini-bounty-announcement/src/hooks/useFx.ts:56` (1 s clock)
- **Issue:** Several `requestAnimationFrame` loops run for the whole session and are not paused when the tab is hidden (`document.visibilitychange` is never handled). The reframed home page runs at least four concurrent loops plus a canvas repaint.
- **Impact:** Continuous CPU/GPU and battery drain on mobile; jank on mid-range devices; page stays "active" while backgrounded.
- **Fix approach:** Pause loops on `visibilitychange`/`IntersectionObserver` (only animate while in viewport), throttle intervals, and reduce particle counts at small viewports.

### 19. Duplicate network fetches for the same datasets
- **Severity:** Medium
- **Files:** `pasarapi-mini-bounty-announcement/src/components/Ticker.tsx:29-30`, `FuelSection.tsx:93`, `ForexSection.tsx:23` — `fuelprice` and `exchangerates_daily_1200` are each requested by two components with no shared cache; `pasarapi-mini-bounty-announcement/src/lib/api.ts` implements no caching or deduplication
- **Issue:** On load the page issues ~5 `data.gov.my` requests where 3 would suffice; each has a 14–16 s timeout and falls back to a second unfiltered request on failure (`api.ts:42-50`), potentially doubling calls again.
- **Impact:** Slower TTI, higher failure surface, and easily rate-limited on a public API.
- **Fix approach:** Add a small request cache/keyed promise in `api.ts` (or adopt TanStack Query) so identical datasource requests are shared; fetch once in `App.tsx` and pass data down.

### 20. Oversized monolithic data bundles (see #6)
- **Severity:** Medium
- **Files:** `kdmirah-studio/src/data/videos.json` (334 KB / 112 KB of prompts, all inlined), `aimirah-mixtape/src/data/catalogSnapshot.json` (432 KB / 12,172 lines)
- **Impact:** Users who only browse one category still download every prompt and catalog row.
- **Fix approach:** Split JSON by category/type, code-split routes, and fetch on demand.

---

## Fragile Areas

### 21. Very large components with mixed concerns
- **Severity:** Medium
- **Files:**
  - `aimirah-mixtape/src/App.tsx` — **1,135 lines**, holds 10+ `useState`, 7 `useEffect`, routing, cart/collection persistence, keyboard shortcuts, modal orchestration, and most layout
  - `aimirah-mixtape/src/components/SecondaryViews.tsx` — 893 lines (multiple views in one file)
  - `aimirah-mixtape/src/components/ComponentGrid.tsx` — 722 lines
  - `clone-string-tune-website/src/components/Hero.tsx` — 604 lines (canvas drawing + DOM style writes + layout)
  - `clone-string-tune-website/src/index.css` — 495 lines; `aimirah-mixtape/src/index.css` — 468 lines
- **Why fragile:** Any change risks unrelated regressions; state resets are hard to trace; no tests (#3).
- **Safe modification:** Extract one concern at a time (routing → `useRoute`, cart → `useCart`, keyboard → `useGlobalShortcuts`) and verify with a Playwright smoke test before deleting from `App.tsx`.
- **Test coverage:** None.

### 22. Routing implemented as local state, not URLs
- **Severity:** Medium
- **Files:** `aimirah-mixtape/src/App.tsx:63-110` (`route` state with `view` discriminated union, `navigate()` at :333); no `history.pushState`, hash, or router anywhere in `aimirah-mixtape/src` or `kdmirah-studio/src`
- **Why fragile:** Deep links and browser back/forward do not work; refreshing always returns to the default `browse`/`skills` view. Sharing a catalog item is impossible.
- **Safe modification:** Map `ActiveRoute` to the URL (`?view=detail&type=skills&name=…` or hash routes) and hydrate initial state from `location`; keep the discriminated union.
- **Test coverage:** None.

### 23. `localStorage` state hydration without schema checks
- **Severity:** Low
- **Files:** `aimirah-mixtape/src/App.tsx:82-118`, `kdmirah-studio/src/App.tsx:22-45`
- **Why fragile:** `JSON.parse` results are spread into default state (`{ ...EMPTY_CART, ...JSON.parse(raw) }`) with no validation; a stale/newer schema can inject bad shapes into the cart. Writes are wrapped in `try/catch`, reads are only partially guarded.
- **Safe modification:** Validate parsed objects against the `CartItem`/`MixtapeCollection` types (zod or manual guards) and version the storage keys.
- **Test coverage:** None.

### 24. Silent error swallowing in `api.ts` and `DirectorySection`
- **Severity:** Low
- **Files:** `pasarapi-mini-bounty-announcement/src/lib/api.ts:45-49` (`catch { /* fall through */ }`), `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx:17-24` (`try/catch` returns fallback with no logging)
- **Why fragile:** All failures (500s, CORS, timeouts) look identical to callers and leave no diagnostic trail; the directory silently shows stale fallback data.
- **Safe modification:** Log to `console.warn` in development and surface a "showing snapshot" badge (the `live` flag already exists but is only used internally).
- **Test coverage:** None.

---

## Scaling Limits

### 25. Static JSON as the catalog database
- **Severity:** Medium
- **Files:** `aimirah-mixtape/src/data/catalogSnapshot.json` (350 rows inside a claimed 1,910), `aimirah-mixtape/src/data/catalog.ts` (build-time mapping of every row into memory at module load)
- **Current capacity:** 350 items rendered/searchable.
- **Limit:** Each additional row increases the single-file bundle linearly; the "1,910" claim would roughly sextuple the inlined JS if truly shipped.
- **Scaling path:** Move to a runtime API or paginated JSON, virtualize the grid, and keep only metadata in the initial payload.

### 26. `videos.json` bundled whole
- **Severity:** Low
- **Files:** `kdmirah-studio/src/data/videos.json` (418 videos, 112 KB of prompt text)
- **Current capacity:** Fine at 418; pagination is client-side (`kdmirah-studio/src/lib/content.ts:205`, `PAGE_SIZE = 40`).
- **Limit:** Prompt bodies dominate; every visitor downloads all prompts.
- **Scaling path:** Serve prompts on-demand via a JSON API or per-video chunk; keep list metadata separate.

---

## Dependencies at Risk

### 27. Version drift across five lockfiles
- **Severity:** Medium
- **Files:** `clone-reframed-online-website/package.json` (`lucide-react ^1.48.0` → lock `1.48.0`), `clone-string-tune-website/package.json` (`^1.41.0` → `1.41.0`), `pasarapi-mini-bounty-announcement/package.json` (`^1.23.0` → `1.23.0`), `kdmirah-studio/package.json` (`esbuild ^0.28.2` direct devDep)
- **Issue:** `lucide-react` spans three minor versions across projects; using caret ranges means a fresh `npm install` can pull different code per site. `esbuild` is a direct devDep only in `kdmirah-studio` with no usage.
- **Impact:** Inconsistent icon sets/behaviour and a non-reproducible stack per site.
- **Fix approach:** Pin identical versions across all projects (or hoist to one workspace). Remove `esbuild`; pin `lucide-react` to one version.

### 28. Third-party media host `media.skillry.dev`
- **Severity:** Medium
- **Files:** `kdmirah-studio/src/data/videos.json` — 418 items, 417 of which reference `https://media.skillry.dev/opus-5-5/…` for `img`, `video`, `remakeImg`, `remakeVideo`
- **Risk:** Every thumbnail and video preview (1,668 URLs) depends on an external domain the repo does not control; a hotlink block or CORS change breaks the entire gallery. `VideoCardSkeleton.tsx` and `VideoModal.tsx:197` have no fallback for failed thumbnails beyond `onError` on `<video>`.
- **Impact:** Empty gallery on host outage; no local cache.
- **Migration plan:** Mirror assets to a controlled CDN/bucket or add an image proxy with a fallback gradient (already present as `CATEGORY_GRADIENT` in `VideoCard.tsx`).

### 29. `data.gov.my` / `pasarapi.xyz` API dependence with silent fallback
- **Severity:** Medium
- **Files:** `pasarapi-mini-bounty-announcement/src/lib/api.ts:3` (`https://api.data.gov.my/data-catalogue`), `DirectorySection.tsx:19` (`https://pasarapi.xyz/api/catalogue`), fallback `src/data/fallbackApis.ts`
- **Risk:** Public, undocumented, rate-limited APIs with no auth; a schema change silently breaks parsing (`any`-typed response). Fallback covers only the directory, not the fuel/forex/births/income charts (which will show skeletons or error panels).
- **Migration plan:** Add runtime schema validation (zod), cache last-good responses, and pin expected dataset IDs in one config.

---

## Missing Critical Features

### 30. SEO infrastructure only in one project
- **Severity:** Medium
- **Files:** `clone-reframed-online-website/public/sitemap.xml`, `robots.txt`, `site.webmanifest` exist **only here**; `aimirah-mixtape`, `clone-string-tune-website`, `kdmirah-studio`, `pasarapi-mini-bounty-announcement` have no `public/` directory, no `sitemap.xml`, no `robots.txt`
- **Issue:** Four sites are effectively invisible to crawlers beyond their single `index.html`. Only one project has `rel="canonical"` (`clone-reframed-online-website/index.html:12`); only two have `og:image`/`twitter:card` (`clone-reframed-online-website`, `kdmirah-studio` has `twitter:card` but no `og:image`).
- **Blocks:** Search indexing, social previews, and PWA installation for 4/5 sites.
- **Fix approach:** Add per-site `robots.txt` + `sitemap.xml`, canonical + `og:image` + `twitter:card`, and a generated `og-cover` per site.

### 31. No server-side rendering / prerender for content sites
- **Severity:** Low
- **Files:** all `*/index.html` render only `<div id="root">`; no `vite-plugin-ssr`, prerender, or `document.title` updates in any `src/`
- **Issue:** Every site is a client-rendered SPA with static `<title>`/description; route-level content (catalog items, videos) never appears in HTML source. Combined with #30, deep content is unindexable.
- **Fix approach:** Prerender at build (vite SSR/prerender plugin) for the static pages, and update `document.title`/meta on route changes for the SPA views.

### 32. No error boundaries or global error UI
- **Severity:** Low
- **Files:** none — no `ErrorBoundary`/`componentDidCatch`/`getDerivedStateFromError` anywhere in any `src/`
- **Issue:** A single render error in any component (e.g., malformed `localStorage` cart, null catalog item) blanks the entire app with no recovery path.
- **Fix approach:** Wrap each `App` in a minimal error boundary that renders a reload action; add per-section boundaries around data-driven views.

---

## Test Coverage Gaps

### 33. Zero coverage of all functional surface
- **Severity:** High
- **What's not tested:** Catalog search/filter/sort, stack-builder cart, localStorage persistence, API formatting/retry, video pagination/sorting, seam drag + keyboard, reduced-motion branches, all form validation.
- **Files:** `aimirah-mixtape/src/components/SearchModal.tsx`, `aimirah-mixtape/src/App.tsx`, `pasarapi-mini-bounty-announcement/src/lib/api.ts`, `kdmirah-studio/src/lib/content.ts`, `clone-reframed-online-website/src/components/ExperimentSection.tsx`
- **Risk:** Any refactor silently changes behaviour; the pending consolidation (#1/#2) is unsafe without tests.
- **Priority:** High.

---

## Maintainability Issues

### 34. README documents only 1 of 5 projects
- **Severity:** Low
- **Files:** `README.md` — describes only `clone-reframed-online-website`; mentions of `aimirah-mixtape`, `kdmirah-studio`, `pasarapi`, `clone-string-tune` = 0
- **Issue:** New contributors cannot discover purpose, run commands, or deploy target for the other four sites.
- **Fix approach:** Add a root table of the five sites (purpose, dev command, deploy target) and one `README` per project.

### 35. Build config duplicated verbatim (maintenance)
- **Severity:** Low
- **Files:** all five `*/vite.config.ts` (identical), all five `*/tsconfig.json` (identical)
- **Issue:** Any build tweak (e.g., base path, asset inlining limit, manualChunks) must be replicated five times; they are already at risk of drift.
- **Fix approach:** Single source in a shared config package, imported by each site (see #1).

### 36. No Node/runtime pinning
- **Severity:** Low
- **Files:** no `.nvmrc`, no `engines` field in any `package.json`
- **Issue:** Vite 7 requires a modern Node; differing local Node versions produce inconsistent lockfiles and build failures.
- **Fix approach:** Add `"engines": { "node": ">=20" }` and a root `.nvmrc`.

### 37. Minor code-quality nits
- **Severity:** Low
- **Files:**
  - `key={i}` / `key={index}` used 18 times (e.g., `clone-string-tune-website/src/components/Hero.tsx:551`, `kdmirah-studio/src/components/PopularSkills.tsx`)
  - `as any` casts 4× in `clone-string-tune-website` (`Clarity.tsx:40`, `Techniques.tsx:33,288`, `WhoItsFor.tsx:64`) plus `(p: any)` in `pasarapi-mini-bounty-announcement/src/components/BirthsSection.tsx:120`, `FuelSection.tsx:195` — defeating `strict`
  - `eslint-disable-next-line react-hooks/exhaustive-deps` in `clone-string-tune-website/src/lib/ui.tsx:121` and `App.tsx:34` (no ESLint is even installed — dead directives)
  - Excessive inline styles: 57 in `clone-string-tune-website`, 53 in `aimirah-mixtape` (hard to theme, blocks CSP `style-src`)
  - CSS custom-property naming diverges per project (`--color-*`, `--c-*`, `--animate-*`, `--bg`, `--br`), preventing shared design tokens
- **Impact:** Individually minor; collectively they slow every cross-site change.
- **Fix approach:** Tighten types (`unknown` + guards over `any`), install ESLint to make the disable directives real, move repeated inline styles into utility classes, and standardize tokens in the shared package from #1.

---

## Severity Index (quick reference)

**High:** #1 duplication/monorepo, #2 divergent copies, #3 no tests, #4 no CI, #5 missing `.gitignore`, #6 single-file inlining of MB assets, #7 conflicting deploy config, #9 false marketing numbers, #17 unoptimized images, #33 zero test coverage.

**Medium:** #8 reduced-motion gaps, #10 branding drift, #11 derived catalog content, #12 dead code/deps, #15 Google Fonts dependence, #16 font/image licensing, #18 always-on animations, #19 duplicate fetches, #20 large data bundles, #21 oversized components, #22 state-only routing, #25 static JSON scaling, #27 version drift, #28 external media host, #29 government API dependence, #30 SEO gaps.

**Low:** #14 demo auth, #23 localStorage validation, #24 silent errors, #26 videos.json size, #31 no SSR/prerender, #32 no error boundaries, #34 README gaps, #35 duplicated config, #36 no Node pin, #37 code-quality nits.

---

*Concerns audit: 2026-11-01*

---

## Remediation status

Status after the 2026-11-01 fix pass. Unlisted items remain open.

| # | Concern | Status |
|---|---|---|
| 1 | Five near-identical projects with no shared code or monorepo tooling | RESOLVED — npm workspaces, @aimirah/shared, one lockfile, shared vite/tsconfig presets. |
| 2 | "clone-*" projects are divergent copies rather than shared components | PARTIAL — cn() and build config now shared; scroll/preloader/cursor primitives still duplicated per site. |
| 3 | No tests anywhere in the repository | PARTIAL — Vitest suite added (20 tests) for pure functions + storage guards; no component/E2E tests yet. |
| 4 | No CI pipeline | RESOLVED — .github/workflows/ci.yml runs npm ci + typecheck + build for all five sites. |
| 5 | Missing `.gitignore` in two projects (secret- and bloat-exposure risk) | RESOLVED — .gitignore added to root and every project. |
| 6 | Single-file build inlines multi-megabyte assets into `index.html` | RESOLVED — string-tune images moved to public/; index.html 6 MB -> 416 kB. JSON bundles unchanged (see #20). |
| 7 | Duplicate and conflicting deployment configuration | RESOLVED — links centralised in src/lib/links.ts; one documented host per site in README. |
| 8 | Inconsistent `prefers-reduced-motion` handling | RESOLVED — shared usePrefersReducedMotion; starfield/cursor/VU gated; global CSS guard added. |
| 9 | Marketing numbers contradict shipped data | RESOLVED — counts derived from shipped data; fake counters removed; GITHUB_STARS corrected to 12,970. |
| 10 | Branding/content drift between projects and folders | RESOLVED — all MI4Inc. links point at mi4inc.com. |
| 12 | Unused/dead code and unused dependencies | RESOLVED — dead cn.ts copies, VideoCardSkeleton, unused exports and deps removed. |
| 17 | Unoptimized, eager, dimension-less images | RESOLVED — width/height, lazy loading, decoding=async and fetchPriority added. |
| 18 | Multiple always-on animation loops | RESOLVED — l/visibilitychange gating on starfield, cursor, clocks, counters and VU meter. |
| 19 | Duplicate network fetches for the same datasets | RESOLVED — in-flight request cache keyed by URL; 5 requests -> 3 on first paint. |
| 20 | Oversized monolithic data bundles (see #6) | PARTIAL — images no longer inlined; videos.json / catalogSnapshot.json still bundled whole. |
| 23 | `localStorage` state hydration without schema checks | RESOLVED — shared/storage guards validate cart and collections on hydration. |
| 24 | Silent error swallowing in `api.ts` and `DirectorySection` | RESOLVED — console.warn on filtered-request fallback and snapshot fallback. |
| 27 | Version drift across five lockfiles | RESOLVED — lucide-react pinned to ^1.48.0 everywhere; esbuild/react-is removed. |
| 30 | SEO infrastructure only in one project | PARTIAL — canonical/OG/twitter + robots.txt + sitemap.xml added; no og:image art per site yet. |
| 32 | No error boundaries or global error UI | RESOLVED — shared ErrorBoundary wraps every App. |
| 33 | Zero coverage of all functional surface | PARTIAL — see #3. |
| 34 | README documents only 1 of 5 projects | RESOLVED — README documents all five sites. |
| 35 | Build config duplicated verbatim (maintenance) | RESOLVED — shared/tsconfig.base.json and shared/vite.base.ts. |
| 36 | No Node/runtime pinning | RESOLVED — .nvmrc plus engines >=20 in every package.json. |
| 37 | Minor code-quality nits | PARTIAL — as-any casts and dead eslint directives removed; key={i} and inline styles remain. |

_Every change was verified with `tsc --noEmit`, `vite build` and `vitest run` before commit._
