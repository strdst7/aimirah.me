---
last_mapped_commit: f8435c622ec4708cdef96f7ea7e2c2ef010035e4
last_mapped_at: 2026-11-03
---
# External Integrations

**Analysis Date:** 2026-11-03

## APIs & External Services

**Live public data:**
- Malaysia Open Data `https://api.data.gov.my/data-catalogue` - browser requests for fuel, exchange rates, population, births, and household income datasets in `pasarapi-mini-bounty-announcement/src/lib/api.ts`, called by `pasarapi-mini-bounty-announcement/src/components/FuelSection.tsx`, `ForexSection.tsx`, `PopulationSection.tsx`, `BirthsSection.tsx`, `IncomeSection.tsx`, and `Ticker.tsx`.
  - SDK/Client: native browser `fetch` with `AbortController`, response checks and optional filtered→unfiltered retry in `pasarapi-mini-bounty-announcement/src/lib/api.ts`.
  - Auth: none configured in `pasarapi-mini-bounty-announcement/src/lib/api.ts`.
- PasarAPI `https://pasarapi.xyz/api/catalogue` - live directory fetched in `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx`; on error, use curated local records from `pasarapi-mini-bounty-announcement/src/data/fallbackApis.ts`.
  - SDK/Client: `fetchJson` from `pasarapi-mini-bounty-announcement/src/lib/api.ts`.
  - Auth: none configured in `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx`.

**Third-party assets and outbound links:**
- Google Fonts - font stylesheets fetched via `clone-reframed-online-website/index.html`, `aimirah-mixtape/index.html`, `pasarapi-mini-bounty-announcement/index.html`, and `kdmirah-studio/src/index.css`; `clone-string-tune-website/src/assets/fonts/KHTeka-Regular.woff2` is bundled locally instead.
  - SDK/Client: browser stylesheet links or CSS import; Auth: none (`clone-reframed-online-website/index.html`, `kdmirah-studio/src/index.css`).
- Skillry media CDN - `kdmirah-studio/src/data/videos.json` contains external image/video URLs rendered from `kdmirah-studio/src/components/VideoCard.tsx`; use the bundled JSON, not a live catalogue fetch (`kdmirah-studio/src/lib/content.ts`).
  - SDK/Client: HTML media elements; Auth: none visible in `kdmirah-studio/src/components/VideoCard.tsx`.
- External navigation/share links are not API clients: project links in `clone-reframed-online-website/src/components/IndexSection.tsx`, archive link in `kdmirah-studio/src/lib/content.ts`, GitHub links in `aimirah-mixtape/src/App.tsx`, and X intent link in `aimirah-mixtape/src/components/StackBuilderSidebar.tsx`.

## Data Storage

**Databases:**
- Not detected: data is embedded as JSON in `kdmirah-studio/src/data/videos.json` and `aimirah-mixtape/src/data/catalogSnapshot.json`, or fetched directly by `pasarapi-mini-bounty-announcement/src/lib/api.ts`; no database connection/client is declared in the five app `package.json` files.
  - Connection: not applicable (`pasarapi-mini-bounty-announcement/package.json`).
  - Client: not applicable (`pasarapi-mini-bounty-announcement/package.json`).

**File Storage:**
- Static repository assets only, e.g. `clone-reframed-online-website/public/images/og-cover.jpg` and `clone-string-tune-website/src/assets/fonts/KHTeka-Regular.woff2`; no upload integration detected in `clone-reframed-online-website/src/`.

**Caching:**
- Browser `localStorage` for theme, cart and collections in `aimirah-mixtape/src/App.tsx` (theme also bootstrapped in `aimirah-mixtape/index.html`), and theme in `kdmirah-studio/src/App.tsx`; no remote cache in `aimirah-mixtape/package.json` or `kdmirah-studio/package.json`.

## Authentication & Identity

**Auth Provider:**
- Not detected in tracked app dependencies such as `aimirah-mixtape/package.json` and `pasarapi-mini-bounty-announcement/package.json`.
  - Implementation: public pages, anonymous browser fetches from `pasarapi-mini-bounty-announcement/src/lib/api.ts`, and local browser state in `aimirah-mixtape/src/App.tsx`.

## Monitoring & Observability

**Error Tracking:**
- Not detected in tracked dependencies such as `clone-reframed-online-website/package.json` and `pasarapi-mini-bounty-announcement/package.json`.

**Logs:**
- UI loading/error/retry state rather than a telemetry SDK in `pasarapi-mini-bounty-announcement/src/lib/api.ts`; directory errors fall back silently to `pasarapi-mini-bounty-announcement/src/data/fallbackApis.ts` in `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx`.

## CI/CD & Deployment

**Hosting:**
- `README.md` states GitHub Pages for the main site; `clone-reframed-online-website/public/CNAME` sets `aimirah.me`. `clone-reframed-online-website/vercel.json` specifies a `/dev` redirect to Netlify, while `clone-reframed-online-website/src/components/IndexSection.tsx` links to another Vercel deployment; do not conflate those links with verified hosting for all five apps.

**CI Pipeline:**
- Not detected in tracked files; app-specific `npm run build` scripts are defined in `clone-reframed-online-website/package.json`, `aimirah-mixtape/package.json`, and their sibling app manifests, but no tracked workflow configuration is present.

## Environment Configuration

**Required env vars:**
- None detected for these apps: public endpoints are hard-coded in `pasarapi-mini-bounty-announcement/src/lib/api.ts` and `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx`; no env-based provider configuration found in tracked application source.

**Secrets location:**
- Not applicable to the documented browser-only calls; do not put API credentials in the Vite client bundle configured by `pasarapi-mini-bounty-announcement/vite.config.ts`.

## Webhooks & Callbacks

**Incoming:**
- None detected; each app is a Vite browser application rooted at its `src/main.tsx`, e.g. `clone-reframed-online-website/src/main.tsx`, with no tracked server endpoints.

**Outgoing:**
- No webhook posts detected; client fetches are reads in `pasarapi-mini-bounty-announcement/src/lib/api.ts`, and sharing opens X intent in `aimirah-mixtape/src/components/StackBuilderSidebar.tsx`.

---

*Integration audit: 2026-11-03*
