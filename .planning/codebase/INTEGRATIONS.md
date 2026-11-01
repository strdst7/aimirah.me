# External Integrations

**Analysis Date:** 2026-11-01

## Overview

All five subprojects are **static client-side bundles with no backend**. There is no server code, no API routes, no database client, no auth provider, and no third-party analytics/tag-manager script. External dependencies fall into four groups: (1) Google Fonts webfont loading, (2) one project with live public-API fetches, (3) remote media hot-linked from a CDN, and (4) static-data snapshots that replaced live APIs (including one large vendored JSON snapshot).

## APIs & External Services

**Malaysia open data (`pasarapi-mini-bounty-announcement` only):**
- `https://api.data.gov.my/data-catalogue` — the public data.gov.my catalogue API (no key, no auth). Client: native `fetch` with `AbortController` timeouts.
  - `pasarapi-mini-bounty-announcement/src/lib/api.ts` — `CATALOGUE` constant, `buildUrl()`, `getJson()` (14 s timeout), `fetchCatalogue()` (tries server-side `filter` params, silently retries unfiltered), `fetchJson()` (16 s timeout), `useAsyncData()` hook
  - Datasets fetched by id: `fuelprice` (`pasarapi-mini-bounty-announcement/src/components/FuelSection.tsx`, `Ticker.tsx`), `exchangerates_daily_1200` (`ForexSection.tsx`, `Ticker.tsx`), `population_state` (`PopulationSection.tsx`), `births` (`BirthsSection.tsx`), `hies_state` (`IncomeSection.tsx`)
- `https://pasarapi.xyz/api/catalogue` — PasarAPI catalogue listing (no key). Consumed in `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx` via `fetchJson`.
  - Fallback snapshot: `pasarapi-mini-bounty-announcement/src/data/fallbackApis.ts` (hardcoded curated array, used if the live fetch fails)

**Government/provider docs referenced as data (not called):** entries in `pasarapi-mini-bounty-announcement/src/data/fallbackApis.ts` link to `data.gov.my`, `vietqr.io`, `moitruongthudo.vn`, `provinces.open-api.vn`, `open.tiki.vn`, `date.nager.at`, `github.com/thinh-vu/vnstock`. These are plain `docs` URLs, not integrations.

**Everything else is static:** `aimirah-mixtape`, `clone-reframed-online-website`, `clone-string-tune-website`, and `kdmirah-studio` make **zero** network calls at runtime.

## Data Storage

**Databases:**
- None. No database client, no ORM, no connection string, no SQL anywhere.

**Persisted client state (localStorage only):**
- `aimirah-mixtape/src/App.tsx` — `aimirah-theme` (light/dark), `aimirahMixtapeCart` (JSON array of install commands), `aimirahMixtapeCollections` (JSON saved collections). Read on mount, written on change.
- `kdmirah-studio/src/App.tsx` — `kdmirah-theme` (`"dark"` / `"light"`), seeded from `prefers-color-scheme`.
- `aimirah-mixtape/index.html` — inline pre-paint script reads `aimirah-theme` to avoid a theme flash.
- No cookies, no IndexedDB, no sessionStorage.

**Bundled/static data (the "content layer" — no CMS):**
- `aimirah-mixtape/src/data/catalogSnapshot.json` (424 KB) — vendored snapshot of the component catalog, imported in `aimirah-mixtape/src/data/catalog.ts` and heavily string-rewritten there (regex replacements mapping `claude-code-templates` → `aimirah-mixtape`, `aitmpl.com` → `aimirah.mixtape`).
- `kdmirah-studio/src/data/videos.json` (328 KB, 418 entries) — video records (`slug`, `author`, `prompt`, `img`, `remakeImg`, `video`, `remakeVideo`), consumed by `kdmirah-studio/src/lib/content.ts`.
- `clone-reframed-online-website/src/lib/data.ts` — the four "experiments" content.
- `pasarapi-mini-bounty-announcement/src/data/fallbackApis.ts` — API directory fallback.

**File Storage:**
- Local only. `clone-reframed-online-website/public/images/` (9 JPEGs: 8 experiment images + `og-cover.jpg`); `clone-string-tune-website/src/assets/` (WebP/JPEG sprites + 2 woff2 fonts bundled via `vite-plugin-singlefile`).

**Caching:**
- None explicitly. Browser HTTP cache only.

## Authentication & Identity

**Auth Provider:**
- None. No login, no OAuth, no session, no user accounts, no tokens. All interactive state (cart, collections, theme) is anonymous and local.

## Monitoring & Observability

**Error Tracking:**
- None. No Sentry/Rollbar/Bugsnag. Errors surface as inline UI states (`useAsyncData` catches and stores `error.message`; `pasarapi-mini-bounty-announcement` shows retry affordances).

**Analytics:**
- None installed. No GA/gtag, no Plausible, no Umami, no Vercel Analytics, no Meta pixel, no consent banner. The only "analytics" mention is copy text in `aimirah-mixtape/src/components/HomeStats.tsx` ("click to view live analytics"), which is a static marketing number, not an integration.

**Logs:**
- `console.*` only; no logging service.

## Third-Party Scripts & CDNs

**Webfonts — Google Fonts CSS API (`fonts.googleapis.com`) + `fonts.gstatic.com` (preconnected):**
- `clone-reframed-online-website/index.html` — Anton, Space Grotesk (300/400/500/700), Space Mono (400/700 + italic). Preconnect in `<head>`.
- `aimirah-mixtape/index.html` — Geist (400–700), Geist Mono (400–700), Instrument Serif (incl. italic). Preconnect in `<head>`.
- `pasarapi-mini-bounty-announcement/index.html` — Archivo Black, JetBrains Mono (400–800), Space Grotesk (400–700). Preconnect in `<head>`.
- `kdmirah-studio/src/index.css` — `@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700&display=swap")` (background CSS import, no preconnect).
- `clone-string-tune-website` — **self-hosted** fonts instead: `clone-string-tune-website/src/assets/fonts/KHTeka-Regular.woff2` and `KHTekaMono-Regular.woff2`, declared with `@font-face` in `clone-string-tune-website/src/index.css`. No Google Fonts dependency (and this project has no external requests at all).

**Remote media CDN (hot-linked at runtime by the browser):**
- `media.skillry.dev` — the dominant external origin in the repo (~1,668 URL occurrences). All image/video assets in `kdmirah-studio/src/data/videos.json` are absolute URLs of the form `https://media.skillry.dev/opus-5-5/<author>-<id>/original*.webp` and `.../remake-card*.mp4`, rendered in `kdmirah-studio/src/components/VideoCard.tsx`, `VideoModal.tsx`, `VideoCardSkeleton.tsx`, `SearchDialog.tsx`, `Dialogs.tsx`. No local fallback assets exist, so this CDN is a hard runtime dependency for kdmirah.studio's gallery.

**No other third-party scripts:** no tag managers, no chat widgets, no ad networks, no reCAPTCHA, no Stripe.js. `aimirah-mixtape/index.html` contains exactly one inline `<script>` (the theme bootstrap), and every project loads a single `/src/main.tsx` module entry.

## Outbound Links (not integrations, but the only cross-project coupling)

**Deployment-to-deployment links in `clone-reframed-online-website/src/components/IndexSection.tsx`:**
- `https://clone-string-tune-website-gold.vercel.app/` → the MI4Inc. / clone-string-tune build
- `https://aimirah-mi4.netlify.app/` → the "Aimirah Component Showcase" build (also the redirect target of `/dev` in `clone-reframed-online-website/vercel.json`)

**Product/social links:**
- `aimirah-mixtape` → `https://github.com/aimirah/mixtape` (`App.tsx`, `ComponentGrid.tsx`, `HomeStats.tsx`), `https://twitter.com/intent/tweet?...` share intent (`StackBuilderSidebar.tsx`), and catalog repos on `github.com` (`src/data/catalog.ts`).
- `kdmirah-studio` → `https://x.com/kdmirah_studio`, `https://github.com/yihui-dev/awesome-opus5-5-videos` (archive source), `https://x.com/<author>` profile links built in `kdmirah-studio/src/lib/content.ts`.
- `clone-string-tune-website` → `https://mi4inc.com` (`Header.tsx`, `Footer.tsx`), `https://aimirah.com` (`WhoItsFor.tsx`).
- `pasarapi-mini-bounty-announcement` → `https://pasarapi.xyz` (`Hero.tsx`, `Footer.tsx`, `DirectorySection.tsx`), `https://krackeddevs.com/code/bounty/pasarapi-bounty` (`Footer.tsx`).

**Browser capability APIs (no third-party service):**
- `navigator.clipboard.writeText` — copy-to-clipboard in `aimirah-mixtape` (`ComponentDetailView.tsx`, `StackBuilderSidebar.tsx`, `SecondaryViews.tsx`, `ComponentGrid.tsx`) and `kdmirah-studio` (`App.tsx`).
- `IntersectionObserver` / `matchMedia` for reveals and reduced-motion — `clone-reframed-online-website/src/hooks/useReveal.ts`, `pasarapi-mini-bounty-announcement/src/hooks/useFx.ts`, `clone-string-tune-website/src/lib/ui.tsx`.

## CI/CD & Deployment

**Hosting:**
- `clone-reframed-online-website` → GitHub Pages at `https://aimirah.me` (`public/CNAME`), per `README.md`.
- `clone-string-tune-website` → Vercel (`clone-string-tune-website-gold.vercel.app`, linked from `IndexSection.tsx`).
- `aimirah-mixtape` → Netlify (`aimirah-mi4.netlify.app`, linked from `IndexSection.tsx` and used as the `/dev` redirect target).
- `kdmirah-studio` → intended `https://kdmirah.studio` (`SITE.url` in `kdmirah-studio/src/lib/content.ts`); no deploy config in repo.
- `pasarapi-mini-bounty-announcement` → bounty submission; no deploy config in repo.

**CI Pipeline:**
- None. No `.github/workflows/`, no `netlify.toml`, no `vercel.json` beyond the single `/dev` redirect in `clone-reframed-online-website/vercel.json`. Deploys are manual/static-upload of the single-file `dist/index.html`.

## Environment Configuration

**Required env vars:**
- None. No `.env` files, no `import.meta.env` or `process.env` reads in any `src/` file. Root `.gitignore` excludes `.env*` and `.vercel` defensively.

**Secrets location:**
- Not applicable — no secrets exist in the repo. Note: `aimirah-mixtape/src/data/catalogSnapshot.json` *describes* third-party tools that use env vars (e.g. `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `*_API_KEY` placeholders) but contains only documentation strings, no real values.

## Webhooks & Callbacks

**Incoming:**
- None. No endpoints, no forms posting anywhere, no server to receive callbacks.

**Outgoing:**
- None. No webhook dispatch, no POST requests — every `fetch` in the repo is a GET against the two PasarAPI/data.gov.my endpoints.

## Fragility Notes for Integration Work

- **No live data refresh**: `aimirah-mixtape` catalog and `kdmirah-studio` video list are frozen JSON snapshots; adding content means editing `catalogSnapshot.json` / `videos.json` by hand and rebuilding.
- **Cross-origin dependency on `media.skillry.dev`**: if that CDN changes paths or adds CORS/hotlink restrictions, kdmirah.studio loses all imagery/video with no local fallback.
- **CORS-sensitive fetches**: `pasarapi-mini-bounty-announcement` relies on browser-side GETs to `api.data.gov.my` and `pasarapi.xyz` with no proxy; the code already tolerates failure (dropping server-side filters, then falling back to `fallbackApis.ts` for the directory), but there is no full data fallback for charts.
- **Google Fonts is the only blocking `<head>` request** in three projects; `clone-string-tune-website` is the only fully self-contained one.

---

*Integration audit: 2026-11-01*
