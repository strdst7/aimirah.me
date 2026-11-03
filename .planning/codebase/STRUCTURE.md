---
last_mapped_commit: f8435c622ec4708cdef96f7ea7e2c2ef010035e4
last_mapped_at: 2026-11-03
---
# Codebase Structure

**Analysis Date:** 2026-11-03

## Directory Layout

```text
aimirah.me/
├── README.md                              # Primary site overview and commands
├── .gitignore                             # Excludes .env*, node_modules/, dist/, .vercel
├── clone-reframed-online-website/         # Primary aimirah.me site
│   ├── index.html                         # Vite HTML entry
│   ├── public/                            # CNAME, SEO documents and experiment imagery
│   ├── src/
│   │   ├── main.tsx / App.tsx / index.css  # React bootstrap, composition, styling
│   │   ├── components/                     # Editorial sections and interactive seam
│   │   ├── hooks/                          # useReveal scroll observation
│   │   ├── lib/                            # Experiment content and Lenis controls
│   │   └── utils/                          # cn class-name helper
│   ├── package.json / package-lock.json   # Independent npm project
│   └── tsconfig.json / vite.config.ts / vercel.json
├── aimirah-mixtape/                       # Independent catalog/collection app
│   ├── src/components/                   # Browse, detail, search, sidebar, secondary views
│   ├── src/data/                         # catalogSnapshot.json and adapter catalog.ts
│   ├── src/types/                        # Catalog/cart/route models
│   ├── src/utils/                        # cn helper
│   └── index.html / package.json / package-lock.json / tsconfig.json / vite.config.ts
├── clone-string-tune-website/            # Independent animated landing page
│   ├── src/components/ / src/assets/     # Visual sections and bundled imagery/fonts
│   ├── src/lib/ / src/utils/             # Lenis/RAF UI primitives and cn
│   └── index.html / package.json / package-lock.json / tsconfig.json / vite.config.ts
├── kdmirah-studio/                        # Independent video archive
│   ├── src/components/ / src/data/        # Gallery/dialogs and videos.json
│   ├── src/lib/ / src/utils/             # Content mapping, scroll lock, cn
│   ├── public/                            # favicon.svg
│   └── index.html / package.json / package-lock.json / tsconfig.json / vite.config.ts
└── pasarapi-mini-bounty-announcement/     # Independent data dashboard
    ├── src/components/ / src/hooks/      # Data sections, common UI and browser hooks
    ├── src/lib/ / src/data/ / src/utils/ # HTTP hook, fallback directory, cn
    └── index.html / package.json / package-lock.json / tsconfig.json / vite.config.ts
```

The layout includes only tracked files (`README.md`, `clone-reframed-online-website/package.json`, `pasarapi-mini-bounty-announcement/package.json`); ignored `node_modules/` and `dist/` are not source (`.gitignore`). No root `package.json` is tracked.

## Directory Purposes

**Primary site — `clone-reframed-online-website/`:**
- Purpose: Own the public aimirah.me editorial experience per `README.md`.
- Contains: Independent Vite application and deploy metadata in `clone-reframed-online-website/public/CNAME`, `clone-reframed-online-website/public/sitemap.xml` and `clone-reframed-online-website/vercel.json`.
- Key files: `clone-reframed-online-website/src/App.tsx`, `clone-reframed-online-website/src/lib/data.ts`, `clone-reframed-online-website/src/components/ExperimentSection.tsx`.

**Primary components — `clone-reframed-online-website/src/components/`:**
- Purpose: Render page sections and interactive chrome in `clone-reframed-online-website/src/App.tsx` order.
- Contains: `Hero.tsx`, `Nav.tsx`, `Manifesto.tsx`, `ExperimentSection.tsx`, `IndexSection.tsx`, `Footer.tsx`, cursor/preloader/starfield and marquees.
- Key files: `clone-reframed-online-website/src/components/ExperimentSection.tsx`, `clone-reframed-online-website/src/components/Nav.tsx`.

**Primary helpers/content — `clone-reframed-online-website/src/lib/` and `clone-reframed-online-website/src/hooks/`:**
- Purpose: Keep experiment records, Lenis controls and intersection-based reveal separate from JSX sections.
- Contains: Typed data in `clone-reframed-online-website/src/lib/data.ts`, imperative scrolling in `clone-reframed-online-website/src/lib/scroll.ts`, `useReveal` in `clone-reframed-online-website/src/hooks/useReveal.ts`.
- Key files: `clone-reframed-online-website/src/lib/data.ts`, `clone-reframed-online-website/src/lib/scroll.ts`.

**Sibling apps — `aimirah-mixtape/`, `clone-string-tune-website/`, `kdmirah-studio/`, `pasarapi-mini-bounty-announcement/`:**
- Purpose: House separate browser builds; no sibling imports are present in their `src/App.tsx` entry trees.
- Contains: Each app's own `index.html`, `package.json`, lockfile, `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/components/` and `src/utils/cn.ts`.
- Key files: `aimirah-mixtape/src/data/catalog.ts`, `clone-string-tune-website/src/lib/ui.tsx`, `kdmirah-studio/src/lib/content.ts`, `pasarapi-mini-bounty-announcement/src/lib/api.ts`.

## Key File Locations

**Entry Points:**
- `clone-reframed-online-website/index.html`, `clone-reframed-online-website/src/main.tsx`, `clone-reframed-online-website/src/App.tsx`: primary site HTML/React entry and ordered sections.
- `aimirah-mixtape/src/main.tsx`, `clone-string-tune-website/src/main.tsx`, `kdmirah-studio/src/main.tsx`, `pasarapi-mini-bounty-announcement/src/main.tsx`: independent sibling browser entries.

**Configuration:**
- `clone-reframed-online-website/package.json`, `clone-reframed-online-website/package-lock.json`, `clone-reframed-online-website/vite.config.ts`, `clone-reframed-online-website/tsconfig.json`: primary app scripts, dependencies, build and TypeScript settings; equivalents live at each sibling root, e.g. `aimirah-mixtape/package.json`.
- `clone-reframed-online-website/public/CNAME`, `clone-reframed-online-website/vercel.json`: primary domain mapping and `/dev` redirect metadata.
- `.gitignore`: ignored local build/install/config artifacts.

**Core Logic:**
- `clone-reframed-online-website/src/lib/data.ts`, `clone-reframed-online-website/src/components/ExperimentSection.tsx`: four experiments and draggable image comparison.
- `clone-reframed-online-website/src/lib/scroll.ts`, `clone-reframed-online-website/src/components/Nav.tsx`: scroll state and in-page menu navigation.
- `aimirah-mixtape/src/types/catalog.ts`, `aimirah-mixtape/src/data/catalog.ts`, `aimirah-mixtape/src/App.tsx`: typed catalog, snapshot transform and app-controlled cart/route/collection state.
- `kdmirah-studio/src/lib/content.ts`, `kdmirah-studio/src/App.tsx`: video metadata, sorting/filtering and dialog state.
- `clone-string-tune-website/src/lib/ui.tsx`: Lenis context, rAF subscription and visual hooks.
- `pasarapi-mini-bounty-announcement/src/lib/api.ts`, `pasarapi-mini-bounty-announcement/src/data/fallbackApis.ts`: HTTP data access and bundled fallback.

**Testing:**
- Not detected among tracked source: the five `package.json` files (e.g. `clone-reframed-online-website/package.json`, `kdmirah-studio/package.json`) expose `dev`, `build`, `preview` but no test script; no tracked `*.test.*` or `*.spec.*` files.

## Naming Conventions

**Files:**
- Use PascalCase for React components (`clone-reframed-online-website/src/components/ExperimentSection.tsx`, `kdmirah-studio/src/components/VideoGallery.tsx`); `App.tsx` and `main.tsx` remain the per-app convention (`clone-reframed-online-website/src/App.tsx`, `clone-reframed-online-website/src/main.tsx`).
- Use camelCase for hooks, utility and data modules (`clone-reframed-online-website/src/hooks/useReveal.ts`, `pasarapi-mini-bounty-announcement/src/lib/api.ts`, `aimirah-mixtape/src/data/catalogSnapshot.json`); descriptive section suffixes occur in `pasarapi-mini-bounty-announcement/src/components/FuelSection.tsx`.

**Directories:**
- Keep app-local source under each project's `src/` (`clone-reframed-online-website/src/`, `aimirah-mixtape/src/`); organize by responsibility into `components/`, `lib/`, `hooks/`, `data/`, `types/`, `utils/` only where used (`clone-reframed-online-website/src/hooks/`, `aimirah-mixtape/src/types/`).
- Use `public/` for served-as-is deploy assets (`clone-reframed-online-website/public/images/`, `clone-reframed-online-website/public/CNAME`); use `src/assets/` for imported imagery/fonts (`clone-string-tune-website/src/assets/`).

## Where to Add New Code

**New Feature:**
- Primary code: Add editorial sections under `clone-reframed-online-website/src/components/`, compose them in `clone-reframed-online-website/src/App.tsx`; add experiment records to `clone-reframed-online-website/src/lib/data.ts` and corresponding served images in `clone-reframed-online-website/public/images/`.
- Tests: No existing test location; place a focused check beside the touched module in the owning app, e.g. `clone-reframed-online-website/src/lib/data.test.ts`, and add a runner script only if a test is introduced (`clone-reframed-online-website/package.json`).

**New Component/Module:**
- Implementation: Use the owning app's `src/components/` rather than a root shared folder; e.g. `kdmirah-studio/src/components/` for archive UI or `pasarapi-mini-bounty-announcement/src/components/` for a dashboard section. Wire into that app's `src/App.tsx` (`kdmirah-studio/src/App.tsx`, `pasarapi-mini-bounty-announcement/src/App.tsx`).

**Utilities:**
- Shared helpers within an app: `clone-reframed-online-website/src/lib/` for site behavior, `clone-reframed-online-website/src/hooks/` for reusable React hooks, `clone-reframed-online-website/src/utils/cn.ts` for class composition. For dashboard fetch logic reuse `pasarapi-mini-bounty-announcement/src/lib/api.ts`; for animated landing primitives reuse `clone-string-tune-website/src/lib/ui.tsx`.

## Special Directories

**`clone-reframed-online-website/public/`:**
- Purpose: Domain/SEO files and experiment images consumed by `clone-reframed-online-website/src/lib/data.ts`.
- Generated: No (`clone-reframed-online-website/public/CNAME`, `clone-reframed-online-website/public/images/exp-01-output.jpg`).
- Committed: Yes (`clone-reframed-online-website/public/sitemap.xml`).

**`aimirah-mixtape/src/data/` and `kdmirah-studio/src/data/`:**
- Purpose: Bundled snapshots read by `aimirah-mixtape/src/data/catalog.ts` and `kdmirah-studio/src/lib/content.ts`.
- Generated: Not established from tracked source; treat as committed inputs (`aimirah-mixtape/src/data/catalogSnapshot.json`, `kdmirah-studio/src/data/videos.json`).
- Committed: Yes (`aimirah-mixtape/src/data/catalogSnapshot.json`, `kdmirah-studio/src/data/videos.json`).

**`node_modules/`, `dist/`, `.vercel/`:**
- Purpose: Installed dependencies, build output and platform local metadata as excluded by `.gitignore`.
- Generated: Yes (`.gitignore`).
- Committed: No (`.gitignore`).

---

*Structure analysis: 2026-11-03*
