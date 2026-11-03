# Codebase Structure

**Analysis Date:** 2026-11-01

## Directory Layout

The repository root is **not** a JavaScript project — it has no `package.json`. It is a container for five fully independent Vite projects plus docs.

```text
/root/aimirah.me/
├── README.md                                  # Project overview, stack, structure, deployment
├── LICENSE                                    # GPL-3.0
├── .gitignore                                 # .vercel, .env*
├── .planning/codebase/                        # GSD analysis output (this directory)
│
├── clone-reframed-online-website/             # ★ MAIN SITE — aimirah.me / kdmirah lab
│   ├── index.html                             # SEO meta, OG/Twitter cards, fonts, #root
│   ├── package.json                           # react, lenis, lucide-react, vite-plugin-singlefile
│   ├── vite.config.ts                         # react + tailwind + singleFile, "@" → src
│   ├── tsconfig.json                          # strict, bundler resolution, "@/*" path
│   ├── vercel.json                            # /dev → aimirah-mi4.netlify.app redirect
│   ├── public/                                # NOT inlined — copied verbatim
│   │   ├── CNAME                              # aimirah.me (GitHub Pages custom domain)
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   ├── site.webmanifest
│   │   └── images/                            # exp-0N-inspiration.jpg / exp-0N-output.jpg, og-cover.jpg
│   └── src/
│       ├── main.tsx                           # createRoot + StrictMode
│       ├── App.tsx                            # section composition, Lenis lifecycle
│       ├── index.css                          # @theme tokens (@color-ink…), keyframes, lenis css
│       ├── components/                        # 11 section/chrome components
│       │   ├── Starfield.tsx                  # full-viewport canvas stars + comets
│       │   ├── Cursor.tsx                     # dot + elastic ring, reads [data-cursor]
│       │   ├── Preloader.tsx                  # 2 s wordmark shutter → onDone
│       │   ├── Nav.tsx                        # Nav + MenuOverlay + useMenu hook
│       │   ├── Hero.tsx                       # scramble-letter wordmark, --active gated
│       │   ├── Marquee.tsx                    # reusable typographic ticker
│       │   ├── Manifesto.tsx                  # word-by-word illumination
│       │   ├── ChapterIntro.tsx               # kicker + title reveal (uses useReveal)
│       │   ├── ExperimentSection.tsx          # draggable before/after seam
│       │   ├── IndexSection.tsx               # archive index + pointer-chasing preview
│       │   └── Footer.tsx                     # outro + back-to-top
│       ├── hooks/useReveal.ts                 # IntersectionObserver one-shot reveal
│       ├── lib/
│       │   ├── data.ts                        # EXPERIMENTS: Experiment[] (site content)
│       │   └── scroll.ts                      # Lenis module singleton + scroll helpers
│       └── utils/cn.ts                        # clsx + tailwind-merge
│
├── clone-string-tune-website/                 # MI4Inc. motion study (string-tune clone)
│   ├── index.html                             # title "MI4Inc.", theme-color #101214
│   ├── package.json                           # + lenis, lucide-react
│   ├── vite.config.ts · tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                            # Lenis instance + LenisProvider; Preloader + Cursor INLINE
│       ├── index.css                          # 495 lines: modular type scale, 6/14 grid, easing set
│       ├── assets/                            # imported → inlined as data URIs by singleFile
│       │   ├── *.webp / *.jpg                 # aika, bamboo-1..4, cloud, control, fidoru, flash, oji, polygon, technique, tree, ultra
│       │   └── fonts/KHTeka-Regular.woff2, KHTekaMono-Regular.woff2
│       ├── components/
│       │   ├── Header.tsx                     # fixed, hides on scroll-down, progress meter
│       │   ├── Hero.tsx                       # 604 lines: bamboo, LeavesCanvas, StringImpulse, FadeChars
│       │   ├── Techniques.tsx                 # GiantWord, SwordCompass, Principles
│       │   ├── Masonry.tsx                    # magazine grid, Tile, EasingCurve, WaveRun
│       │   ├── WhoItsFor.tsx
│       │   ├── Clarity.tsx                    # per-item scroll word fill
│       │   └── Footer.tsx
│       ├── lib/ui.tsx                         # 327 lines — THE animation kernel (see below)
│       ├── utils/cn.ts
│       └── vite-env.d.ts
│
├── aimirah-mixtape/                           # aimirah.mixtape component catalog app
│   ├── index.html                             # pre-paint theme bootstrap script, `class="light"`
│   ├── package.json                           # NO lenis, NO lucide — clsx + tailwind-merge only
│   ├── vite.config.ts · tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                            # 1,135 lines — route union, cart, collections, toast, shell
│       ├── index.css                          # 468 lines: faceplate/brushed/groove, light+dark tokens
│       ├── components/
│       │   ├── Icons.tsx                      # TYPE_META (labels, flags, installDir), TypeIcon, mascot
│       │   ├── DeckWidgets.tsx                # Screw, RecLamp, VUMeter, TapeCounter, CassetteWindow, Faceplate, LegendChip, useVUDrive
│       │   ├── HomeStats.tsx
│       │   ├── ComponentGrid.tsx              # 722 lines: filters, sort, pagination (PAGE_SIZE 24)
│       │   ├── ComponentDetailView.tsx        # file preview + install command
│       │   ├── ComponentTerminal.tsx          # terminal-style content viewer
│       │   ├── SaveToCollectionButton.tsx
│       │   ├── SkillSpectorBadge.tsx          # security scan badge
│       │   ├── SearchModal.tsx                # ⌘K palette
│       │   ├── StackBuilderSidebar.tsx        # slide-over cart ("Dub Queue")
│       │   └── SecondaryViews.tsx             # 893 lines: JobsSidebar, JobsView, TrendingView, PluginsView, MyMixtapesView, SpecModal
│       ├── data/
│       │   ├── catalogSnapshot.json           # 12,172 lines — source-of-truth catalog dump
│       │   └── catalog.ts                     # 452 lines: normalization + install-cmd builders
│       ├── types/catalog.ts                   # CatalogItem, CartState, ActiveRoute, JobPosting, …
│       └── utils/cn.ts
│
├── kdmirah-studio/                            # kdmirah.studio prompt/video archive
│   ├── index.html                             # title "Opus 5.5 videos…", theme-color #f4f1e9
│   ├── package.json                           # + esbuild (dev dep); no lenis
│   ├── vite.config.ts · tsconfig.json
│   ├── public/favicon.svg
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                            # 199 lines: filter/sort/page state, theme, modals, toast
│       ├── index.css                          # 182 lines: .dark tokens, @theme inline, @custom-variant dark
│       ├── components/
│       │   ├── Icon.tsx                       # 300 lines: inline SVG icon registry + IconName type, Logo, Wordmark
│       │   ├── Header.tsx                     # sticky, theme toggle, ⌘K, sign-in
│       │   ├── Hero.tsx
│       │   ├── VideoGallery.tsx               # 280 lines: category bar, sort, compare toggle, pagination
│       │   ├── VideoCard.tsx                  # aspect-video card; compare → original|remake split
│       │   ├── VideoCardSkeleton.tsx          # skeleton + poster fallback
│       │   ├── VideoModal.tsx                 # 351 lines: player + prompt copy + keyboard nav
│       │   ├── MidPromo.tsx                   # promo inserted mid-grid
│       │   ├── PopularSkills.tsx
│       │   ├── SearchDialog.tsx               # ⌘K search
│       │   ├── Dialogs.tsx                    # SkillDialog (install cmd) + AuthDialog (mock)
│       │   ├── Faq.tsx
│       │   ├── Toast.tsx
│       │   └── Footer.tsx                     # ClosingCta + Footer
│       ├── data/videos.json                   # Video[] — slug, author, prompt, img/remakeImg, video/remakeVideo
│       ├── lib/
│       │   ├── content.ts                     # 216 lines: videos, CATEGORIES, SKILLS, sortVideos, SITE
│       │   └── scrollLock.ts                  # reference-counted body overflow lock
│       └── utils/cn.ts
│
└── pasarapi-mini-bounty-announcement/         # PASAR.DATA Malaysia open-data board
    ├── index.html                             # title "PASAR.DATA — built by kdmirah", fonts
    ├── package.json                           # + recharts, react-is, lucide-react; no lenis
    ├── vite.config.ts · tsconfig.json
    └── src/
        ├── main.tsx
        ├── App.tsx                            # 31 lines: fixed static section stack
        ├── index.css                          # 127 lines: dark neon tokens, @theme keyframes
        ├── components/
        │   ├── Header.tsx                     # anchor nav + KL clock
        │   ├── Hero.tsx                       # PASAR.DATA title, ambient glows, blueprint bg
        │   ├── Ticker.tsx                     # marquee of live fuel/fx deltas
        │   ├── FuelSection.tsx                # RON95/97/diesel pump boards + line chart
        │   ├── ForexSection.tsx               # BNM daily rates
        │   ├── PopulationSection.tsx          # DOSM state population
        │   ├── BirthsSection.tsx              # JPN daily live births
        │   ├── IncomeSection.tsx              # HIES household income
        │   ├── DirectorySection.tsx           # pasarapi.xyz catalogue search (live → FALLBACK_APIS)
        │   ├── Footer.tsx                     # credits, bounty link, data licence
        │   └── ui.tsx                         # 259 lines: Reveal, Panel, SectionShell, Skeleton, ErrorPanel, MYFlag, ChartTip, Delta
        ├── data/fallbackApis.ts               # ApiEntry[] — 18 curated entries, used on CORS failure
        ├── hooks/useFx.ts                      # useInView, useAnimatedNumber, useKLTime
        ├── lib/api.ts                          # 118 lines: fetchCatalogue, fetchJson, useAsyncData, formatters
        └── utils/cn.ts
```

## Directory Purposes

**`clone-reframed-online-website/`** — the flagship site, deployed to `aimirah.me` on GitHub Pages with a custom domain (`public/CNAME`). This is the only project with a `public/` image pipeline and a `vercel.json` redirect to another subproject. Read `README.md` for its stack summary.

**`src/components/`** — one file per page section, default-exported. Shared primitives and multi-export modules also live here (e.g. `Nav.tsx` exports `Nav`, `MenuOverlay`, `useMenu`, `NAV_LINKS`; `DeckWidgets.tsx` exports eight widgets; `ui.tsx` in pasarapi exports nine primitives). Naming: `PascalCase.tsx`.

**`src/lib/`** — non-visual domain code: data constants, fetch clients, scroll controllers, animation kernels. Naming: camelCase `.ts`, except the two React-bearing kernels which are `.tsx` (`clone-string-tune-website/src/lib/ui.tsx`, and note `pasarapi.../lib/api.ts` contains a hook but no JSX so it is `.ts`).

**`src/hooks/`** — present in only two projects (`clone-reframed-online-website`, `pasarapi-mini-bounty-announcement`). Single-file unless the project has several effects (pasarapi: `useFx.ts` bundles three hooks). `clone-string-tune-website` puts its hooks in `lib/ui.tsx` instead; `kdmirah-studio` has no hook directory at all (all logic in `App.tsx`).

**`src/data/`** — static JSON payloads and the modules that normalize them (`aimirah-mixtape`, `kdmirah-studio`, `pasarapi-mini-bounty-announcement`). The reframed and string-tune sites keep equivalent content in `src/lib/data.ts` / inline instead.

**`src/types/`** — only `aimirah-mixtape/src/types/catalog.ts`. Other projects declare interfaces next to their data or inline in the consuming component.

**`src/utils/`** — exactly one file everywhere: `cn.ts`. Identical bytes across all five projects.

**`src/assets/`** — only `clone-string-tune-website`. Imported images and `@font-face` woff2 files; these are inlined into the single-file build.

**`public/`** — static passthrough that survives the single-file inline step. Only `clone-reframed-online-website` (images, CNAME, SEO files) and `kdmirah-studio` (favicon) use it.

## Key File Locations

**Entry Points:**
- `{project}/index.html`: HTML shell + SEO meta + font links + `#root`.
- `{project}/src/main.tsx`: React mount (identical in all five).
- `{project}/src/App.tsx`: composition root and all top-level state.
- `{project}/src/index.css`: Tailwind import, `@theme` tokens, `:root` variables, keyframes, custom utilities.

**Configuration:**
- `{project}/vite.config.ts`: `react()` + `tailwindcss()` + `viteSingleFile()`, alias `@` → `src`.
- `{project}/tsconfig.json`: `strict`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, path `@/*`.
- `{project}/package.json`: React 19.2.6 / Vite ^7.3.7 / Tailwind 4.1.17 / TypeScript 5.9.3 / vite-plugin-singlefile 2.3.0.
- `clone-reframed-online-website/vercel.json`: `/dev` → `https://aimirah-mi4.netlify.app/`.
- `clone-reframed-online-website/public/CNAME`: `aimirah.me`.

**Core Logic:**
- Main site content → `clone-reframed-online-website/src/lib/data.ts` (`EXPERIMENTS`).
- Main site scroll → `clone-reframed-online-website/src/lib/scroll.ts` (singleton Lenis).
- Main site seam comparison → `clone-reframed-online-website/src/components/ExperimentSection.tsx`.
- Star canvas → `clone-reframed-online-website/src/components/Starfield.tsx`.
- Animation kernel (string-tune) → `clone-string-tune-website/src/lib/ui.tsx` (`useRaf`, `useSectionProgress`, `Reveal`, `Button`).
- MI4 hero scene → `clone-string-tune-website/src/components/Hero.tsx`.
- Mixtape catalog normalization → `aimirah-mixtape/src/data/catalog.ts`.
- Mixtape data types → `aimirah-mixtape/src/types/catalog.ts`.
- Mixtape fake router + cart → `aimirah-mixtape/src/App.tsx`.
- Studio content → `kdmirah-studio/src/lib/content.ts`; raw data → `kdmirah-studio/src/data/videos.json`.
- Studio gallery/compare → `kdmirah-studio/src/components/VideoGallery.tsx`, `VideoCard.tsx`.
- Pasar API client → `pasarapi-mini-bounty-announcement/src/lib/api.ts`.
- Pasar section chrome → `pasarapi-mini-bounty-announcement/src/components/ui.tsx`.

**Testing:**
- Not present. No `*.test.*`, `*.spec.*`, `vitest.config.*`, `jest.config.*`, or test scripts in any project. `package.json` scripts are only `dev`, `build`, `preview`.

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` — `ExperimentSection.tsx`, `VideoGallery.tsx`, `DeckWidgets.tsx`, `ui.tsx` (lowercase exception for generic primitive bundles).
- Hooks / libs / utils: `camelCase.ts` — `useReveal.ts`, `scroll.ts`, `data.ts`, `content.ts`, `api.ts`, `scrollLock.ts`, `cn.ts`.
- A module exporting hooks *and* JSX must be `.tsx` (`lib/ui.tsx`).
- JSON payloads: `camelCase.json` with a domain name — `catalogSnapshot.json`, `videos.json`, `fallbackApis.ts`.
- Types file: singular domain noun — `types/catalog.ts`.

**Directories:**
- All lowercase: `components`, `lib`, `hooks`, `utils`, `data`, `types`, `assets`, `public`.

**Symbols:**
- Components: `PascalCase` function, `export default` for sections, `export function` for shared named exports.
- MI4/mixtape shared widgets: `React.FC<Props>` constants (`export const VUMeter: React.FC<...>`).
- Hooks: `use` + `PascalCase` (`useReveal`, `useSectionProgress`, `useAsyncData`, `useVUDrive`).
- Data constants: `SCREAMING_SNAKE_CASE` (`EXPERIMENTS`, `CATALOG_COUNTS`, `FALLBACK_APIS`, `PAGE_SIZE`).
- Types/interfaces: `PascalCase`, `type` for unions and object shapes (`ActiveRoute`, `CatalogItem`).
- CSS custom properties: `--color-*` for Tailwind tokens (`@theme`), `--c-*` for string-tune palette, `--f-*`/`--g-*`/`--h*` for its scale system, `--rv-delay`/`--i`/`--glare-x` for per-element animation inputs.
- Class names (string-tune): short lowercase utilities — `w` (wrapper), `gt` (grid), `sans`, `up` (uppercase), `fsi-h6`, `sp-char`, `sp-word`, `rv`, `-in`.

**Other:**
- Section anchors use short kebab/dot ids: `#top`, `#idea`, `#lab`, `#index`, `#contact`, `#c-tree`, `#techniques`, `#clarity`, `#videos`, `#fuel`, `#forex`, `#census`, `#births`, `#income`, `#directory`.
- localStorage keys are namespaced: `aimirah-theme`, `aimirahMixtapeCart`, `aimirahMixtapeCollections`, `kdmirah-theme`.

## Where to Add New Code

**New section on the main site:**
- Component: `clone-reframed-online-website/src/components/YourSection.tsx` (PascalCase, default export).
- Mount it in document order in `clone-reframed-online-website/src/App.tsx` inside `<main className="relative z-10">`.
- Add a nav entry to `NAV_LINKS` in `clone-reframed-online-website/src/components/Nav.tsx` and a matching `id="…"` on the section root.
- Scroll reveals: import `useReveal` from `clone-reframed-online-website/src/hooks/useReveal.ts`.
- Smooth scroll: import `scrollToId` / `scrollToTop` from `clone-reframed-online-website/src/lib/scroll.ts` — do not construct a second Lenis.

**New experiment (before/after pair) on the main site:**
- Append an object to `EXPERIMENTS` in `clone-reframed-online-website/src/lib/data.ts`.
- Drop `exp-0N-inspiration.jpg` and `exp-0N-output.jpg` into `clone-reframed-online-website/public/images/` and reference as `./images/…`.

**New scroll-driven section (string-tune):**
- Create `clone-string-tune-website/src/components/YourSection.tsx` and mount it inside `<main id="top">` in `clone-string-tune-website/src/App.tsx`.
- Use `useSectionProgress(ref, "stick" | "through" | "enter")` and `useRaf(...)` from `clone-string-tune-website/src/lib/ui.tsx` — never add a bare `requestAnimationFrame` loop.
- Reuse `Reveal`, `Button`, `Star12`, `CompassLines`, `Chars`, `useInView`, `useMedia` from the same module.
- Add type-scale / grid values as CSS variables in `clone-string-tune-website/src/index.css` rather than hardcoding rem values.

**New catalog view (mixtape):**
- Add a variant to `ActiveRoute` in `aimirah-mixtape/src/types/catalog.ts:121`.
- Implement the view component in `aimirah-mixtape/src/components/SecondaryViews.tsx` (or a new file) and export it.
- Add a `{route.view === 'your-view' && …}` branch in `aimirah-mixtape/src/App.tsx` (around lines 901–949).
- Wire navigation by calling `navigate({ view: 'your-view' })` — the `navigate` helper is defined in `App.tsx`.

**New catalog data type:**
- Extend `ComponentTypePlural` in `aimirah-mixtape/src/types/catalog.ts:1-9`.
- Add its metadata to `TYPE_META` in `aimirah-mixtape/src/components/Icons.tsx`.
- Add it to `SIDEBAR_BROWSE_ORDER` and `EMPTY_CART` in `aimirah-mixtape/src/App.tsx`.
- Add a count fallback in `CATALOG_COUNTS` in `aimirah-mixtape/src/data/catalog.ts`.
- Add the payload under `byType.<type>` in `aimirah-mixtape/src/data/catalogSnapshot.json`.

**New studio video:**
- Append a `Video` object to `kdmirah-studio/src/data/videos.json` with `slug, author, duration, category, tags, prompt, img, remakeImg, video, remakeVideo`.
- Categories are matched by display string via `CATEGORY_BY_KEY` in `kdmirah-studio/src/lib/content.ts:65`; use one of `Motion graphics`, `Explainers`, `3D scenes`, `Games` or add a new entry to both `CATEGORIES` and `CATEGORY_BY_KEY`.

**New studio modal:**
- Add state in `kdmirah-studio/src/App.tsx` and conditionally render at the root; call `lockScroll()` / `unlockScroll()` from `kdmirah-studio/src/lib/scrollLock.ts` in a mount/unmount effect (see `VideoModal.tsx`).

**New live-data section (pasarapi):**
- Create `src/components/YourSection.tsx` using `SectionShell` + `Panel` + `Reveal` + `Skeleton` + `ErrorPanel` from `pasarapi-mini-bounty-announcement/src/components/ui.tsx`.
- Load data with `useAsyncData(() => fetchCatalogue<Row>({ id: '…', limit, sort }))` from `pasarapi-mini-bounty-announcement/src/lib/api.ts`.
- Add an `<YourSection />` to `pasarapi-mini-bounty-announcement/src/App.tsx` and an anchor link in `pasarapi-mini-bounty-announcement/src/components/Header.tsx`.

**New shared UI primitive:**
- Reminder: nothing is shared across projects. Put it in the project that needs it (`{project}/src/components/` for visual, `{project}/src/lib/` for logic) and copy deliberately if another project also needs it. `utils/cn.ts` and `main.tsx` are already intentionally duplicated.

**New Tailwind design token:**
- Declare inside the `@theme { … }` block in that project's `src/index.css` (`--color-*`, `--font-*`, `--animate-*`, `--ease-*`) so Tailwind v4 generates the utility. For runtime-switchable values (dark mode), also declare under `:root` and the `.dark`/`html.dark` selector and expose via `@theme inline`.

## Special Directories

**`clone-reframed-online-website/public/images/`:**
- Purpose: The eight experiment JPEGs and the OG cover referenced by `lib/data.ts` and `index.html`.
- Generated: No — hand-curated source images.
- Committed: Yes. Not inlined by the build (paths are runtime strings, not imports).

**`clone-reframed-online-website/public/` (SEO files):**
- Purpose: `robots.txt`, `sitemap.xml`, `site.webmanifest`, `CNAME`.
- Generated: No.
- Committed: Yes.

**`clone-string-tune-website/src/assets/fonts/`:**
- Purpose: Self-hosted KHTeka + KHTekaMono woff2.
- Generated: No.
- Committed: Yes. Inlined into the single-file build via `@font-face` in `src/index.css`.

**`aimirah-mixtape/src/data/catalogSnapshot.json`:**
- Purpose: Full 12,172-line catalogue dump (`counts`, `byType.*`, `stats`, `topCountries`, `trending`, `chartData`, `jobs`) normalized at import time by `src/data/catalog.ts`.
- Generated: Yes — appears to be an export of an upstream catalog dataset.
- Committed: Yes. Expect large diffs on regeneration; the 891/422/288/77/63/107/44/18 counts are read from here with hardcoded fallbacks.

**`kdmirah-studio/src/data/videos.json`:**
- Purpose: The entire video/prompt archive (`Video[]`), with remote media URLs on `media.skillry.dev`.
- Generated: No.
- Committed: Yes.

**`.planning/codebase/`:**
- Purpose: GSD codebase map consumed by `/gsd-plan-phase` and `/gsd-execute-phase`.
- Generated: Yes — by this analysis command.
- Committed: Depends on orchestration; treat as generated documentation.

---

*Structure analysis: 2026-11-01*
