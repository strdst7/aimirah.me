---
last_mapped_commit: f8435c622ec4708cdef96f7ea7e2c2ef010035e4
last_mapped_at: 2026-11-03
---
<!-- refreshed: 2026-11-03 -->
# Architecture

**Analysis Date:** 2026-11-03

## System Overview

```text
Five independent Vite/React browser applications (no root package/workspace)
  ├─ aimirah-mixtape/src/main.tsx → App.tsx → catalog browsing/collections
  ├─ clone-reframed-online-website/src/main.tsx → App.tsx → editorial site
  ├─ clone-string-tune-website/src/main.tsx → App.tsx → animated landing page
  ├─ kdmirah-studio/src/main.tsx → App.tsx → video archive
  └─ pasarapi-mini-bounty-announcement/src/main.tsx → App.tsx → data dashboard
                  │
                  ▼
  Each app's src/components/ + local hooks/lib/data/types + src/index.css
                  │
                  ▼
  Browser DOM/localStorage, bundled JSON/images, or direct browser fetch
  (`pasarapi-mini-bounty-announcement/src/lib/api.ts`)
```

`README.md` describes `clone-reframed-online-website/` as the aimirah.me site; the four sibling applications each have their own `package.json`, `index.html`, `vite.config.ts`, and `src/main.tsx`. They are separate builds, not packages imported into the primary site.

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

**Overall:** Independent, client-rendered single-page applications with app-local component/data modules (`README.md`, `clone-reframed-online-website/src/main.tsx`, `pasarapi-mini-bounty-announcement/src/main.tsx`).

**Key Characteristics:**
- Each app bootstraps through its own `index.html` and `src/main.tsx`, and `vite.config.ts` uses React, Tailwind and `vite-plugin-singlefile` (`clone-reframed-online-website/vite.config.ts`, `kdmirah-studio/vite.config.ts`).
- No shared source package or server route is tracked; imports remain inside each app's `src/` (`clone-reframed-online-website/src/App.tsx`, `aimirah-mixtape/src/App.tsx`).
- Presentational sections receive content and callbacks from their app root or local data modules (`clone-reframed-online-website/src/App.tsx`, `kdmirah-studio/src/App.tsx`); PasarAPI sections independently call the common fetch hook (`pasarapi-mini-bounty-announcement/src/components/FuelSection.tsx`).

## Layers

**Bootstrap and composition:**
- Purpose: Mount the application and compose its ordered sections or active views.
- Location: `clone-reframed-online-website/src/main.tsx`, `clone-reframed-online-website/src/App.tsx`; equivalent files under each sibling `src/`.
- Contains: `createRoot`, `StrictMode`, app-level React state and page composition.
- Depends on: React, local `src/components/`, `src/lib/`, `src/data/`.
- Used by: Each app's `index.html` browser entry.

**Views and interactions:**
- Purpose: Render sections, controls, overlays and locally scoped UI behavior.
- Location: `clone-reframed-online-website/src/components/`, `aimirah-mixtape/src/components/`, `clone-string-tune-website/src/components/`, `kdmirah-studio/src/components/`, `pasarapi-mini-bounty-announcement/src/components/`.
- Contains: TSX components with props, effects, pointer handlers and optional hooks.
- Depends on: The app's local `src/lib/`, `src/hooks/`, `src/data/`, `src/types/` as applicable.
- Used by: Each app's `src/App.tsx` and sibling components.

**Data and browser adapters:**
- Purpose: Supply bundled content, formatting, scrolling or remote data access.
- Location: `clone-reframed-online-website/src/lib/data.ts`, `clone-reframed-online-website/src/lib/scroll.ts`, `aimirah-mixtape/src/data/catalog.ts`, `kdmirah-studio/src/lib/content.ts`, `pasarapi-mini-bounty-announcement/src/lib/api.ts`, `clone-string-tune-website/src/lib/ui.tsx`.
- Contains: Typed records, snapshot transforms, Lenis helpers, fetch/async hook and animation primitives.
- Depends on: App-local JSON/assets, browser APIs and installed libraries.
- Used by: App roots and their sections.

## Data Flow

### Primary Request Path

1. Browser loads `clone-reframed-online-website/index.html`; `clone-reframed-online-website/src/main.tsx` imports `src/index.css` and mounts `App`.
2. `clone-reframed-online-website/src/App.tsx:23` initializes Lenis and blocks scroll until `Preloader` calls `handleLoaded`; `src/components/Nav.tsx:146` maps menu selections to `src/lib/scroll.ts:31` anchor scrolling.
3. `clone-reframed-online-website/src/App.tsx:68` maps `EXPERIMENTS` from `src/lib/data.ts:11` to `src/components/ExperimentSection.tsx:14`; that component updates clip and divider styles on pointer/keyboard input (`src/components/ExperimentSection.tsx:129`).

### Sibling Application Flows

1. `aimirah-mixtape/src/data/catalog.ts:174` reads bundled `catalogSnapshot.json`, transforms records into `CATALOG_BY_TYPE`, and `src/App.tsx:874` passes browse data and callbacks to `ComponentGrid`.
2. `aimirah-mixtape/src/App.tsx:81` restores cart/collections from `localStorage`, event handlers update React state, and effects persist it (`src/App.tsx:109`).
3. `kdmirah-studio/src/lib/content.ts:1` imports `videos.json`; `src/App.tsx:88` filters/sorts records and `src/App.tsx:136` supplies the result to `VideoGallery`.
4. `pasarapi-mini-bounty-announcement/src/components/FuelSection.tsx:92` calls `useAsyncData`/`fetchCatalogue` in `src/lib/api.ts:42`; the hook exposes data/loading/error/retry (`src/lib/api.ts:74`), and `src/components/DirectorySection.tsx:17` falls back to `src/data/fallbackApis.ts` on fetch failure.

**State Management:** React hooks in each `src/App.tsx` and individual components; persistent state is browser `localStorage` in `aimirah-mixtape/src/App.tsx:63` and `kdmirah-studio/src/App.tsx:22`. `clone-reframed-online-website/src/lib/scroll.ts:3` owns a module-level Lenis instance; `clone-string-tune-website/src/lib/ui.tsx:54` exposes Lenis via context.

## Key Abstractions

**Experiment:**
- Purpose: Pair source/output images and metadata for a single visual comparison.
- Examples: `clone-reframed-online-website/src/lib/data.ts`, `clone-reframed-online-website/src/components/ExperimentSection.tsx`.
- Pattern: Typed constant array mapped to repeated section components by `clone-reframed-online-website/src/App.tsx:68`.

**CatalogItem / ActiveRoute / CartState:**
- Purpose: Model browsable mixtape content, current in-app view and selected install tracks.
- Examples: `aimirah-mixtape/src/types/catalog.ts`, `aimirah-mixtape/src/data/catalog.ts`, `aimirah-mixtape/src/App.tsx`.
- Pattern: Typed data + parent-owned state passed as callbacks/props to `aimirah-mixtape/src/components/ComponentGrid.tsx` and `aimirah-mixtape/src/components/StackBuilderSidebar.tsx`.

**useAsyncData:**
- Purpose: Track pending/error/data states and retry a promise-returning loader.
- Examples: `pasarapi-mini-bounty-announcement/src/lib/api.ts:74`, `pasarapi-mini-bounty-announcement/src/components/ForexSection.tsx:22`.
- Pattern: Effect-driven component-level fetch with stale-result guard, not a server-side endpoint.

## Entry Points

**Primary aimirah.me page:**
- Location: `clone-reframed-online-website/index.html`, `clone-reframed-online-website/src/main.tsx`.
- Triggers: Browser navigation to the built page.
- Responsibilities: Mount `clone-reframed-online-website/src/App.tsx` and load `src/index.css`.

**Sibling site entries:**
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

**What happens:** Similar `src/utils/cn.ts`, `src/main.tsx` and `vite.config.ts` files exist independently in each application (`aimirah-mixtape/src/utils/cn.ts`, `kdmirah-studio/src/utils/cn.ts`).
**Why it's wrong:** Treating them as a shared module would misplace changes; no root package or workspace links these builds (`aimirah-mixtape/package.json`, `kdmirah-studio/package.json`).
**Do this instead:** Edit the owning application's files, e.g. `clone-reframed-online-website/src/components/ExperimentSection.tsx` for the primary site.

### Mistaking UI labels for backend routes

**What happens:** Mixtape presents `/llms.txt` and `/openapi.json` as modal actions (`aimirah-mixtape/src/App.tsx:979`), while content is supplied by bundled `aimirah-mixtape/src/data/catalogSnapshot.json`.
**Why it's wrong:** Implementing a server endpoint in this repo would not serve those current in-app actions (`aimirah-mixtape/src/App.tsx:1058`).
**Do this instead:** Follow the `SpecModal` path in `aimirah-mixtape/src/components/SecondaryViews.tsx` for those controls; create real endpoints only with an explicit deployment requirement.

## Error Handling

**Strategy:** Local UI fallbacks and bounded fetch attempts rather than a central server error layer (`pasarapi-mini-bounty-announcement/src/lib/api.ts`, `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx`).

**Patterns:**
- `pasarapi-mini-bounty-announcement/src/lib/api.ts:23` times out with `AbortController`, rejects HTTP/empty results, retries catalogue calls without server filters, and `useAsyncData` exposes a retry callback.
- `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx:17` serves bundled `fallbackApis.ts` when the directory request fails; `aimirah-mixtape/src/App.tsx:81` falls back to empty cart/initial collections if browser storage parsing fails.

## Cross-Cutting Concerns

**Logging:** No centralized logger in the primary app path `clone-reframed-online-website/src/App.tsx`; user feedback in `aimirah-mixtape/src/App.tsx:132` and `kdmirah-studio/src/App.tsx:60` uses local toast state.
**Validation:** Static TypeScript models (`clone-reframed-online-website/src/lib/data.ts`, `aimirah-mixtape/src/types/catalog.ts`); `pasarapi-mini-bounty-announcement/src/lib/api.ts:29` checks HTTP status and catalogue array shape, while `src/components/DirectorySection.tsx:19` trusts the decoded directory payload.
**Authentication:** No app-owned auth flow in the primary site `clone-reframed-online-website/src/App.tsx`; `kdmirah-studio/src/App.tsx:194` displays an `AuthDialog` UI in `src/components/Dialogs.tsx`.

---

*Architecture analysis: 2026-11-03*
