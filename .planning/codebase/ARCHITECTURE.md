<!-- refreshed: 2026-11-01 -->
# Architecture

**Analysis Date:** 2026-11-01

## System Overview

The repository is a **monorepo of five independent, standalone Vite + React 19 + TypeScript sites**. There is no root `package.json`, no workspace tooling, no shared package, and no build orchestration at the repo root. Each subproject has its own `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, and `index.html`, and is built/deployed on its own.

```text
/root/aimirah.me/
├── clone-reframed-online-website/        ← MAIN SITE (aimirah.me, kdmirah lab)
├── clone-string-tune-website/            ← MI4Inc. motion study (mi4inc clone)
├── aimirah-mixtape/                      ← aimirah.mixtape component catalog app
├── kdmirah-studio/                       ← kdmirah.studio video/prompt archive
└── pasarapi-mini-bounty-announcement/    ← PASAR.DATA Malaysia open-data board
```

The five sites are linked **only by outbound hyperlinks** (`clone-reframed-online-website/src/components/IndexSection.tsx` lists "Standalone projects" pointing at `https://clone-string-tune-website-gold.vercel.app/` and `https://aimirah-mi4.netlify.app/`) and by a Vercel redirect in `clone-reframed-online-website/vercel.json` (`/dev` → `https://aimirah-mi4.netlify.app/`). There is **no shared code**: `src/utils/cn.ts` is a byte-identical copy in all five projects (verified by checksum `d9837f38…`), and `main.tsx` is identical in all five.

## Shared Build Model (all five subprojects)

Every project uses the same Vite configuration shape (`vite.config.ts` in each):

```ts
plugins: [react(), tailwindcss(), viteSingleFile()]
resolve: { alias: { "@": path.resolve(__dirname, "src") } }
```

Key consequences of `vite-plugin-singlefile`:

- **Production output is a single self-contained `dist/index.html`.** All JS, CSS, and imported assets are inlined. There are no separate `/assets/*.js` chunks to cache or route.
- **No code splitting is possible.** Every component and dependency ships in the initial document. Bundle size is therefore the primary performance constraint for these sites.
- **Assets that must stay external live in `public/`** (`clone-reframed-online-website/public/images/*.jpg`, `public/CNAME`, `public/robots.txt`, `public/sitemap.xml`, `public/site.webmanifest`; `kdmirah-studio/public/favicon.svg`). Assets imported through `src/` (e.g. `clone-string-tune-website/src/assets/*.webp`) are inlined as data URIs.
- **Deployment is static-host only** — a single HTML file plus `public/` passthrough. `clone-reframed-online-website` targets GitHub Pages with a custom domain via `public/CNAME` (`aimirah.me`).

Tailwind is wired through `@tailwindcss/vite` (Tailwind v4, CSS-first config) in every project. Design tokens are declared with `@theme` blocks and CSS custom properties inside each project's `src/index.css`.

## Pattern Overview

**Overall:** Local-state, single-page composition. Every site is a **flat component tree rooted in one `App.tsx`** with no router library and no global state library.

**Key Characteristics:**

- **No router.** Verified: no `react-router`, no `history.pushState`, no `location.hash` reads anywhere in any `src/` tree. Navigation is either (a) in-page anchor scrolling via `scrollIntoView` / Lenis `scrollTo`, or (b) a hand-rolled discriminated-union "route" in local React state.
- **No state manager.** No Redux, Zustand, Jotai, or Context store for app data. All state is `useState` inside `App.tsx` and passed down as props (prop drilling is the explicit pattern).
- **Presentation/content split.** Each project isolates copy and data in a `lib/` or `data/` module, and keeps `components/` purely presentational.
- **Animation is imperative and rAF-driven, not declarative.** There is no Framer Motion / GSAP. Motion is implemented as `requestAnimationFrame` loops that write directly to `element.style` / CSS custom properties to bypass React re-renders.
- **Direct DOM mutation is deliberate.** Seam position, parallax, starfield, cursors, and text illumination all mutate `ref.current.style` inside rAF loops rather than via state.

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `App` (reframed) | Page composition, Lenis lifecycle, preloader/menu scroll lock | `clone-reframed-online-website/src/App.tsx` |
| `Starfield` | Full-viewport canvas: twinkling stars + mouse parallax + comets | `clone-reframed-online-website/src/components/Starfield.tsx` |
| `ExperimentSection` | Draggable before/after seam with scripted intro tease | `clone-reframed-online-website/src/components/ExperimentSection.tsx` |
| `Manifesto` | Word-by-word illumination tied to viewport progress | `clone-reframed-online-website/src/components/Manifesto.tsx` |
| `App` (string-tune) | Page composition, Lenis instance + `LenisProvider`, preloader | `clone-string-tune-website/src/App.tsx` |
| `lib/ui.tsx` | Shared animation primitives + Lenis context | `clone-string-tune-website/src/lib/ui.tsx` |
| `App` (mixtape) | Router-less view switcher, cart, collections, toast | `aimirah-mixtape/src/App.tsx` |
| `data/catalog.ts` | Catalog normalization from JSON snapshot + install-command builders | `aimirah-mixtape/src/data/catalog.ts` |
| `App` (studio) | Filter/sort/page/modal state, theme, toasts | `kdmirah-studio/src/App.tsx` |
| `lib/content.ts` | Video/skill data, categories, sort helpers | `kdmirah-studio/src/lib/content.ts` |
| `App` (pasarapi) | Static section stack, no app state | `pasarapi-mini-bounty-announcement/src/App.tsx` |
| `lib/api.ts` | data.gov.my fetch client + `useAsyncData` hook + formatters | `pasarapi-mini-bounty-announcement/src/lib/api.ts` |

## Layers

**Entry Layer:**
- Purpose: Mount React into `#root`.
- Location: `{project}/src/main.tsx`, `{project}/index.html`
- Contains: `createRoot(...).render(<StrictMode><App /></StrictMode>)`
- Depends on: `./index.css`, `./App`
- Used by: Vite dev server / single-file build

**Composition Layer (`App.tsx`):**
- Purpose: Own all top-level state, arrange section components in document order, wire cross-cutting chrome (preloader, cursor, nav, modals, toast).
- Location: `{project}/src/App.tsx`
- Contains: Section ordering, state declarations, event handlers passed as props.
- Depends on: `components/*`, `lib/*`
- Used by: `main.tsx`

**Component Layer:**
- Purpose: Render markup and local interaction.
- Location: `{project}/src/components/*.tsx`
- Contains: One section per file, default export for sections, named exports for shared primitives.
- Depends on: `lib/` helpers, `utils/cn.ts`, `lucide-react`, `recharts` (pasarapi only)
- Used by: `App.tsx` and sibling components

**Data/Domain Layer:**
- Purpose: Hold content, types, derived selectors, and side-effectful clients.
- Location: `{project}/src/lib/*`, `{project}/src/data/*`, `{project}/src/types/*`
- Contains: Typed constants, JSON imports, fetch clients, formatting functions.
- Depends on: nothing from `components/` (exception: `aimirah-mixtape/src/data/catalog.ts` imports `TYPE_META` from `../components/Icons`)
- Used by: `App.tsx` and components

**Hook Layer:**
- Purpose: Reusable browser-API effects.
- Location: `{project}/src/hooks/*.ts`
- Contains: `useReveal`, `useInView`, `useAnimatedNumber`, `useKLTime`, `useFx`
- Depends on: React only
- Used by: components

**Utility Layer:**
- Purpose: Class-name merging.
- Location: `{project}/src/utils/cn.ts` (identical in all five)
- Contains: `cn(...inputs) = twMerge(clsx(inputs))`
- Depends on: `clsx`, `tailwind-merge`
- Used by: nearly all components

## Data Flow

### Static-site render path (all projects)

1. `index.html` loads (project-specific `<title>`, meta, font `<link>`s, optional inline theme bootstrap) — `{project}/index.html`
2. `main.tsx` mounts `<App />` in `StrictMode` — `{project}/src/main.tsx`
3. `App.tsx` imports content constants at module scope (synchronous, build-time embedded) — e.g. `clone-reframed-online-website/src/lib/data.ts`, `kdmirah-studio/src/data/videos.json`, `aimirah-mixtape/src/data/catalogSnapshot.json`
4. `App` renders section components in fixed order; each section renders from imported data.

### Primary Request Path — `clone-reframed-online-website` (main site)

1. `App` runs `initLenis()` and `stopScroll()` on mount — `clone-reframed-online-website/src/App.tsx:23-26`
2. `Preloader` runs a 2000 ms rAF counter, then calls `onDone` after a 1000 ms exit — `clone-reframed-online-website/src/components/Preloader.tsx:16-39`
3. `handleLoaded` sets `ready=true` and calls `startScroll()` — `clone-reframed-online-website/src/App.tsx:28-31`
4. `ready` gates Hero letter slide-ups, Nav slide-in, and scroll unlock.
5. `EXPERIMENTS` (4 items) map into `ExperimentSection`, each taking full viewport height — `clone-reframed-online-website/src/App.tsx:68-70`
6. Each `ExperimentSection` observes itself with `IntersectionObserver` at `threshold: 0.45`; on first entry it runs a keyframed "tease" of the seam (84 → 18 → 62 → 50 %) — `clone-reframed-online-website/src/components/ExperimentSection.tsx:57-114`
7. Pointer drag updates `target.current`; a persistent rAF loop smoothly pursues it (`0.35` while dragging, `0.09` otherwise) and writes `clipPath` + `left` directly — `clone-reframed-online-website/src/components/ExperimentSection.tsx:41-54`
8. `Manifesto` runs its own rAF loop computing viewport progress and toggling word opacity — `clone-reframed-online-website/src/components/Manifesto.tsx:14-36`
9. `Starfield` runs one canvas rAF loop for the entire page lifetime — `clone-reframed-online-website/src/components/Starfield.tsx:82-151`

**State Management:** `ready` and `menuOpen` are the only `App`-level state. Seam position, parallax, and canvas state are held in `useRef` and **never** trigger React renders. `useMenu` (`clone-reframed-online-website/src/components/Nav.tsx:146-161`) is a custom hook returning `[open, toggle, navigate]`.

### Secondary Flow — `aimirah-mixtape` (routing without a router)

1. `route` is a discriminated union stored in `useState` — `aimirah-mixtape/src/types/catalog.ts:121-127`
2. `navigate(...)` calls `setRoute`; `App` renders a different view component per `route.view` — `aimirah-mixtape/src/App.tsx:759-949`
3. Cart (`aimirahMixtapeCart`) and collections (`aimirahMixtapeCollections`) are `useState` hydrated from `localStorage` in lazy initializers, and persisted back via `useEffect` — `aimirah-mixtape/src/App.tsx:73-104`
4. `⌘K` / `Ctrl+K` toggles `SearchModal` through a global `keydown` listener — `aimirah-mixtape/src/App.tsx:106-116`
5. Catalog items are normalized once at module load from `catalogSnapshot.json` into `CATALOG_BY_TYPE` / `ALL_CATALOG_ITEMS` — `aimirah-mixtape/src/data/catalog.ts:200-232`

**State Management:** All in `App.tsx`: `theme`, `sidebarCollapsed`, `mobileMenuOpen`, `route`, `searchOpen`, `stackOpen`, `specModal`, `selectedJob`, `toast`, `cart`, `collections`. A `notify()` callback drives a 2400 ms auto-dismiss toast.

### Secondary Flow — `pasarapi-mini-bounty-announcement` (live data)

1. `App` renders a fixed static stack: `Header → Hero → Ticker → Fuel → Forex → Population → Births → Income → Directory → Footer` — `pasarapi-mini-bounty-announcement/src/App.tsx`
2. Each section calls `useAsyncData(loader)` locally; there is **no shared cache** — `pasarapi-mini-bounty-announcement/src/lib/api.ts:74-94`
3. `fetchCatalogue` requests `https://api.data.gov.my/data-catalogue?id=…`, trying server-side `filter` params first and retrying unfiltered on failure — `pasarapi-mini-bounty-announcement/src/lib/api.ts:42-51`
4. `DirectorySection` fetches `https://pasarapi.xyz/api/catalogue` and falls back to the curated `FALLBACK_APIS` array on CORS/offline — `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx:17-28`
5. Every fetch aborts after 14–16 s via `AbortController`.

**State Management:** Each section owns `{data, loading, error}` from `useAsyncData`, plus local filter state. `Ticker` and each section fetch independently, so the fuel and forex datasets are fetched more than once per page load.

### Secondary Flow — `kdmirah-studio` (filterable gallery)

1. `App` holds `category`, `compare`, `sort`, `page`, modal openers, `toast` — `kdmirah-studio/src/App.tsx:28-37`
2. `filtered` derives from `videos` + `CATEGORY_BY_KEY` + `sortVideos()` inside `useMemo` — `kdmirah-studio/src/App.tsx:88-92`
3. `VideoGallery` slices `PAGE_SIZE = 40` per page and renders `VideoCard`s; `compare` toggles a side-by-side original/remake `<img>` pair — `kdmirah-studio/src/components/VideoGallery.tsx`, `kdmirah-studio/src/components/VideoCard.tsx:40-70`
4. Modals (`VideoModal`, `SearchDialog`, `SkillDialog`, `AuthDialog`, `Toast`) are conditionally mounted at the `App` root.

**State Management:** All local `useState` in `App`; theme persisted to `localStorage["kdmirah-theme"]`.

## Rendering Strategy per Subproject

### `clone-reframed-online-website` — the main site

- **Type:** Long-scroll dark editorial single page. No routes.
- **Sections in order:** `Starfield` (fixed canvas) → `Cursor` → `Preloader` → `Nav` + `MenuOverlay` → `Hero` → `Marquee` → `Manifesto` (`#idea`) → `ChapterIntro` + 4× `ExperimentSection` (`#lab`) → `Marquee` (reverse) → `IndexSection` (`#index`) → `Marquee` → `Footer` (`#contact`) → fixed film-grain overlay.
- **Scroll architecture:** Lenis is a **module-level singleton** in `clone-reframed-online-website/src/lib/scroll.ts` (`let lenis: Lenis | null`), initialized once, with `stopScroll()` / `startScroll()` / `scrollToId()` / `scrollToTop()` exported. Lenis `raf` is driven by its own `requestAnimationFrame` chain. `stopScroll` also sets `documentElement.style.overflow = "hidden"`.
- **Animation architecture:** five independent rAF loops coexist — Starfield, Cursor (`0.16` lerp), ExperimentSection pursuit, ExperimentSection side-label sampler, Manifesto illumination, IndexSection preview chase. Each loop runs for the page lifetime; none are gated by visibility.
- **Reveal pattern:** `useReveal(threshold)` — a one-shot `IntersectionObserver` returning `{ref, visible}` — `clone-reframed-online-website/src/hooks/useReveal.ts`. Used by `ChapterIntro` and `Footer`.
- **CSS-driven loops:** infinite marquees (`--animate-marquee`), blink, drift are pure CSS keyframes declared in `clone-reframed-online-website/src/index.css`.
- **Theme tokens:** `@theme` exposes `--color-ink/coal/bone/smoke/signal` plus `font-display` (Anton), `font-sans` (Space Grotesk), `font-mono` (Space Mono).

### `clone-string-tune-website` — MI4Inc. motion study

- **Type:** Single-page motion showcase. No routes.
- **Sections:** `Header` (fixed, hides on scroll-down) → `Hero` (`#c-tree`, sticky scroll scene: bamboo, koi/leaves canvas, "string impulse") → `Techniques` (`#techniques`, sword compass + giant word fill) → `Masonry` (magazine grid) → `WhoItsFor` → `Clarity` (`#clarity`, per-word scroll fill) → `Footer` (`#footer`).
- **Scroll architecture:** Lenis instance lives in `App` `useState`, published through `LenisProvider`/`useLenis` React context — `clone-string-tune-website/src/App.tsx:129-158`, `clone-string-tune-website/src/lib/ui.tsx:51-56`. Unlike the reframed site, this is **not** a module singleton. The instance is also exposed on `window.__lenis`.
- **Animation architecture:** `clone-string-tune-website/src/lib/ui.tsx` is the animation kernel. It provides:
  - a **single shared rAF ticker** (`subs: Set<Cb>`) with `useRaf(cb, active)` — one `requestAnimationFrame` chain for the whole app;
  - `useSectionProgress(ref, "stick" | "through" | "enter")` — returns 0→1 scroll progress per section (re-renders on change);
  - `useInView` — IntersectionObserver, optional `once`;
  - `Reveal` / `Chars` — character-cascade text reveal using `--i` custom properties and CSS;
  - `Button` — glare-tracking button/anchor using `--glare-x/y`;
  - `Star12`, `CompassLines` — signature SVG decorations;
  - `useMedia`, `clamp`, `lerp`, `easeOut`.
- **Canvas work:** hero leaf sprites are generated procedurally (`makeLeafSprite`) then animated in `LeavesCanvas` via `useRaf` — `clone-string-tune-website/src/components/Hero.tsx:22-215`.
- **CSS scale system:** `clone-string-tune-website/src/index.css` defines a full modular type scale (`--type-step: 1.333`, `--mm … --h0`, `--large`), a 6/14-column grid (`--g-columns`, `--g-margin`), a custom easing set (`--f-cubic`, `--f-bounce`, …), and self-hosted `KHTeka` / `KHTekaMono` `@font-face` rules. Utility classes `fsi-*`, `sans`, `up`, `w`, `gt` are hand-written.
- **Preloader & Cursor** are defined inline in `App.tsx` (not separate files).

### `aimirah-mixtape` — component catalog application

- **Type:** Application shell, not a scroll site. Fixed left sidebar + sticky transport header + scrollable main pane (`ref={mainScrollRef}` with `overflow-y-auto`). The main pane, not the window, is the scroll container.
- **Views (fake routes):** `browse`, `detail`, `my-mixtapes`, `plugins`, `trending`, `jobs`.
- **Chrome:** faceplate/brushed-metal aesthetic implemented with CSS (`brushed`, `groove`, `panel-inset`, `legend`, `liner`, `ascii-art` in `aimirah-mixtape/src/index.css`), plus physical-widget components (`VUMeter`, `TapeCounter`, `CassetteWindow`, `RecLamp`, `Screw`, `Faceplate`) in `aimirah-mixtape/src/components/DeckWidgets.tsx`.
- **Theme:** light "silver faceplate" / dark "black-anodised" via `html.light` / `html.dark` class toggling CSS custom properties (`--color-surface-0..4`, `--color-text-*`, `--color-accent`). A blocking inline script in `aimirah-mixtape/index.html` applies the stored theme before paint to avoid flash.
- **Animation:** CSS transitions/keyframes only (`animate-fade-in-up`, `terminal-prompt`). `useVUDrive` in `DeckWidgets.tsx` provides animated meter drive.
- **State:** see "Secondary Flow" above. Persistence via `localStorage`.

### `kdmirah-studio` — video/prompt archive

- **Type:** Marketing-plus-gallery single page with modal overlays.
- **Sections:** `Header` (sticky) → `Hero` → `VideoGallery` (`#videos`, filter bar + paginated grid + `MidPromo` insertions) → `PopularSkills` → `Faq` → `ClosingCta` → `Footer`.
- **Theme:** light/dark by toggling `.dark` on `documentElement` with `color-scheme`; tokens are `--bg/--fg/--card/--panel/--muted/--soft/--line` exposed as Tailwind colors through `@theme inline` — `kdmirah-studio/src/index.css:6-44`. Uses `@custom-variant dark`.
- **Scroll:** native browser scroll (`html { scroll-behavior: smooth }`). No Lenis. `clone-reframed`-style scroll lock is provided by a **reference-counted** `lockScroll`/`unlockScroll` in `kdmirah-studio/src/lib/scrollLock.ts` for modal stacking.
- **Animation:** CSS keyframes only (`fade-up`, `scale-in`, `promo-progress`, `marquee`) plus `VideoCardSkeleton` shimmer.
- **Pagination model:** `PAGE_SIZE = 40`; `VideoGallery` slices the filtered list and can reveal "extra" items client-side without changing page.

### `pasarapi-mini-bounty-announcement` — live open-data board

- **Type:** Dark neon data dashboard, single page, native anchor navigation (`#top`, `#fuel`, `#forex`, `#census`, `#births`, `#income`, `#directory`).
- **Charts:** `recharts` (`LineChart`, `BarChart` through `ResponsiveContainer`) inside each section; tooltips customized through `ChartTip` in `pasarapi-mini-bounty-announcement/src/components/ui.tsx`.
- **Animation:** `Reveal` (in-view translate/opacity), `useAnimatedNumber` (ease-out-expo counter), CSS marquee ticker, scan-line, pulse-dot.
- **Layout primitives:** `Panel`, `SectionShell` (ghost numeral + kicker + two-tone title + blurb + optional right slot), `Skeleton`, `ErrorPanel`, `Delta`, `MYFlag` — all in `pasarapi-mini-bounty-announcement/src/components/ui.tsx`.
- **Data resilience:** every section renders a skeleton → data or `ErrorPanel` with retry; directory falls back to a hardcoded 18-entry catalog.

## Key Abstractions

**`cn(...)` class merger:**
- Purpose: Conditional Tailwind classes with conflict resolution.
- Examples: `clone-reframed-online-website/src/utils/cn.ts`, `kdmirah-studio/src/utils/cn.ts`, `pasarapi-mini-bounty-announcement/src/utils/cn.ts`
- Pattern: `twMerge(clsx(inputs))` — copy-pasted per project (no shared dependency).

**`useReveal` / `useInView`:**
- Purpose: One-shot scroll-triggered reveal.
- Examples: `clone-reframed-online-website/src/hooks/useReveal.ts`, `clone-string-tune-website/src/lib/ui.tsx:94-124`, `pasarapi-mini-bounty-announcement/src/hooks/useFx.ts:4-27`
- Pattern: `IntersectionObserver` + `useState<boolean>` + `ref`; disconnects after first hit.

**`useSectionProgress`:**
- Purpose: Normalized 0→1 scroll position for a section.
- Examples: `clone-string-tune-website/src/lib/ui.tsx:68-89`
- Pattern: recomputed every frame inside `useRaf`, `setState` only when delta > 0.0005. Modes: `stick` (element taller than viewport), `through` (enter bottom → leave top), `enter` (top crosses viewport).

**Shared rAF ticker (`useRaf`):**
- Purpose: One animation loop for all subscribers.
- Examples: `clone-string-tune-website/src/lib/ui.tsx:22-49`
- Pattern: module-level `Set<Cb>`; subscribers added/removed in `useEffect`.

**Lenis integration (two variants):**
- Module singleton: `clone-reframed-online-website/src/lib/scroll.ts` — imported by any component, no React context.
- React context: `clone-string-tune-website/src/lib/ui.tsx:54-56` + `clone-string-tune-website/src/App.tsx:129-152` — instance created in `App` and consumed via `useLenis()`.

**Scroll lock (two variants):**
- Boolean/imperative: `stopScroll()` / `startScroll()` in `clone-reframed-online-website/src/lib/scroll.ts` — also flips `documentElement.style.overflow`.
- Reference-counted: `lockScroll()` / `unlockScroll()` in `kdmirah-studio/src/lib/scrollLock.ts` — safe for nested modals.

**Domain data module:**
- Purpose: All content for a site in one typed constant.
- Examples: `clone-reframed-online-website/src/lib/data.ts` (`Experiment[]`), `kdmirah-studio/src/lib/content.ts` (`Video[]`, `Skill[]`, `CATEGORIES`, `sortVideos`), `aimirah-mixtape/src/data/catalog.ts` (`CATALOG_BY_TYPE`, `CATALOG_COUNTS`, `buildSingleInstallCmd`), `pasarapi-mini-bounty-announcement/src/data/fallbackApis.ts` (`ApiEntry[]`).
- Pattern: `export const X: Type[] = [...]` or `import raw from "./x.json"` then `export const videos = raw as Video[]`.

**`useAsyncData<T>(loader)`:**
- Purpose: Minimal fetch lifecycle with manual retry.
- Examples: `pasarapi-mini-bounty-announcement/src/lib/api.ts:74-94`
- Pattern: `{data, loading, error, retry}`; `retry` bumps a `nonce` in the effect dependency list. `loader` is kept in a ref so it need not be stable.

**Route union (mixtape):**
- Purpose: Multi-view navigation without a router.
- Examples: `aimirah-mixtape/src/types/catalog.ts:121-127`
- Pattern: `type ActiveRoute = {view:'browse', typePlural} | {view:'detail', item, fromType} | …`; `App` switches on `route.view`.

## Entry Points

**HTML shell:**
- Location: `{project}/index.html`
- Triggers: Static host request.
- Responsibilities: SEO/meta tags, font preconnect + stylesheet links, `#root` div, `<script type="module" src="/src/main.tsx">`, and (mixtape only) a pre-paint theme bootstrap script.

**React mount:**
- Location: `{project}/src/main.tsx` (all five identical)
- Triggers: Module script execution.
- Responsibilities: `createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>)`.

**App root:**
- Location: `{project}/src/App.tsx`
- Triggers: React render.
- Responsibilities: Section ordering, top-level state, lifecycle effects, modals.

**Global stylesheet:**
- Location: `{project}/src/index.css`
- Triggers: Imported by `main.tsx` (or by Vite CSS pipeline).
- Responsibilities: `@import "tailwindcss"`, `@theme` tokens, `:root` variables, `@font-face`, keyframes, hand-written utility classes.

## Architectural Constraints

- **Single-file output:** `viteSingleFile()` forbids code splitting and lazy loading. Do not expect `React.lazy`/dynamic `import()` to reduce initial payload; every byte is inlined into `index.html`.
- **No routing layer:** URL state is not represented. Deep links to a mixtape detail view, a studio video, or a modal are impossible without adding a router or hash-based state.
- **`StrictMode` is enabled in all five apps.** Side-effectful `useEffect`s run twice in development — rAF loops, `IntersectionObserver`s, and Lenis instances must clean up correctly (they generally do, via `cancelAnimationFrame` + `disconnect` + `destroy`).
- **Module-level singletons:** `clone-reframed-online-website/src/lib/scroll.ts` holds one `Lenis` in module scope; `clone-string-tune-website/src/lib/ui.tsx` holds a module-level `subs` set and `started` flag. These survive unmount and are shared across all consumers in the module graph.
- **Side-effect-on-import:** `aimirah-mixtape/src/data/catalog.ts` normalizes the entire `catalogSnapshot.json` (12,172 lines) into typed objects at import time, including per-item `synthesizeFileContent`. This runs once per page load before first paint of any catalog UI.
- **Document-level mutations:** several components add/remove body classes (`custom-cursor` in `clone-reframed-online-website/src/components/Cursor.tsx:14`), set `documentElement.style.overflow`, and toggle `documentElement.classList`. These are global and not scoped.
- **No test infrastructure:** no test runner, no test files, no `vitest`/`jest` config in any project — see TESTING conventions.
- **No shared types across projects:** each `lib` declares its own interfaces; the same concept (e.g. a "video") is typed independently per project.
- **Component size:** several files are large and monolithic — `aimirah-mixtape/src/App.tsx` (1,135 lines), `aimirah-mixtape/src/components/SecondaryViews.tsx` (893), `aimirah-mixtape/src/components/ComponentGrid.tsx` (722), `clone-string-tune-website/src/components/Hero.tsx` (604). Changes there carry higher regression risk.

## Anti-Patterns

### Prop-drilling a dozen callbacks from `App`

**What happens:** `aimirah-mixtape/src/App.tsx` passes 10–12 props (`isInStack`, `onToggleStack`, `onAddManyToStack`, `onToggleInCollection`, `onCreateCollection`, `onLoadCollectionToStack`, `onOpenSpecModal`, `onNotify`, …) into `ComponentGrid`, `ComponentDetailView`, and `SecondaryViews`.
**Why it's wrong:** Any new action requires editing the type signature in every intermediate component; `ComponentGrid` alone declares 11 callback props (`aimirah-mixtape/src/components/ComponentGrid.tsx:17-30`).
**Do this instead:** Introduce a small `useMixtape()` context (cart + collections + notify) and consume it in leaf components, keeping the current prop shapes as the context value.

### Running a permanent rAF loop for value sampling

**What happens:** `ExperimentSection` runs a third rAF loop purely to sample `pos.current` and `setSide()` on threshold crossing — `clone-reframed-online-website/src/components/ExperimentSection.tsx:117-127`. `Manifesto` and `IndexSection` likewise run loops whether or not the section is on screen.
**Why it's wrong:** React state is set from a 60 Hz loop; on a page with six such loops the main thread is permanently busy, and offscreen sections still compute.
**Do this instead:** Gate loops on an `IntersectionObserver` (`useReveal` already exists) and only start/stop the rAF when the section is visible; derive `side` inside the existing `paint()` call instead of a third loop.

### Duplicated identical files instead of a shared package

**What happens:** `src/utils/cn.ts` is byte-identical in all five projects; `main.tsx` is byte-identical; `vite.config.ts` differs only by formatting.
**Why it's wrong:** A fix or upgrade (e.g. Tailwind v5, a new `cn` helper) must be applied five times and can silently drift.
**Do this instead:** If the projects are ever built together, extract `packages/ui` (cn, Reveal, Button, `useInView`) and consume via workspace dependency. Until then, keep edits synchronized deliberately.

### Fetching the same upstream dataset in multiple components

**What happens:** `pasarapi-mini-bounty-announcement/src/components/Ticker.tsx` fetches `fuelprice` and `exchangerates_daily_1200`, while `FuelSection.tsx` and `ForexSection.tsx` fetch the same IDs again.
**Why it's wrong:** Three simultaneous requests to `api.data.gov.my` on load; inconsistent snapshots if a request fails in one place and succeeds in another.
**Do this instead:** Lift the shared datasets into `App` (or a tiny module-level promise cache keyed by query spec) and pass results down; `useAsyncData` already supports a stable loader.

### Content mixed into layout components

**What happens:** `clone-string-tune-website/src/components/Masonry.tsx` and `Techniques.tsx` inline long copy strings, color arrays, and principle lists inside the JSX; `clone-reframed-online-website/src/components/Manifesto.tsx` hardcodes the paragraph and `ACCENTS` set.
**Why it's wrong:** Copy changes require reading animation code; the other four projects place equivalent content in `lib/`.
**Do this instead:** Move copy into `clone-string-tune-website/src/lib/content.ts`-style module and import it, matching the convention already used by reframed (`lib/data.ts`) and studio (`lib/content.ts`).

## Error Handling

**Strategy:** Per-section graceful degradation with explicit fallback data. There is no error boundary anywhere.

**Patterns:**
- Fetch failures surface as `error` from `useAsyncData` and render an `ErrorPanel` with a `retry()` button — `pasarapi-mini-bounty-announcement/src/lib/api.ts:86`, `pasarapi-mini-bounty-announcement/src/components/ui.tsx:137`.
- `AbortController` + `setTimeout` gives every request a hard timeout (14 s catalogue, 16 s generic) — `pasarapi-mini-bounty-announcement/src/lib/api.ts:23-35`.
- `DirectorySection` catches and substitutes `FALLBACK_APIS` — `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx:17-28`.
- Clipboard writes in `kdmirah-studio/src/App.tsx:65-86` fall back to a hidden `<textarea>` + `execCommand("copy")`.
- `localStorage` access is wrapped in `try/catch` in `aimirah-mixtape/src/App.tsx` and `kdmirah-studio/src/App.tsx`.
- Images fail silently (no `onError` handlers).

## Cross-Cutting Concerns

**Logging:** None. No logger module, no `console.*` conventions, no Sentry/Datadog integration in any project.

**Validation:** None at runtime. TypeScript `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` are enabled in every `tsconfig.json` (`{project}/tsconfig.json`). Incoming JSON from `catalogSnapshot.json`, `videos.json`, and `data.gov.my` is cast with `as` / hand-written row interfaces rather than validated.

**Authentication:** Not implemented. `kdmirah-studio/src/components/Dialogs.tsx` exports `AuthDialog`, but it is a UI-only mock invoked by `onSignIn` in `kdmirah-studio/src/App.tsx:129`.

**Theming:** Three distinct approaches coexist:
- Tailwind `@theme` design tokens with no dark mode (`clone-reframed-online-website`, `pasarapi-mini-bounty-announcement` — permanently dark/neon).
- `html.light` / `html.dark` class toggling CSS variables (`aimirah-mixtape`, with a pre-paint inline script).
- `.dark` class + `@custom-variant dark` + `color-scheme` (`kdmirah-studio`, with `prefers-color-scheme` default).

**Accessibility:**
- The seam in `ExperimentSection` is a proper `role="slider"` with `aria-valuemin/max/now` and arrow-key handlers — `clone-reframed-online-website/src/components/ExperimentSection.tsx:243-256`.
- `prefers-reduced-motion` is honored in the seam tease only (`ExperimentSection.tsx:66-74`); other loops ignore it.
- Decorative canvases/overlays carry `aria-hidden`; nav buttons carry `aria-label`/`aria-expanded`.
- No focus trap in modals across any project.

---

*Architecture analysis: 2026-11-01*
