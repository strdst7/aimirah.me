---
last_mapped_commit: f8435c622ec4708cdef96f7ea7e2c2ef010035e4
last_mapped_at: 2026-11-03
---
# Technology Stack

**Analysis Date:** 2026-11-03

## Languages

**Primary:**
- TypeScript 5.9.3 with TSX/React JSX - application source in `clone-reframed-online-website/src/`, `clone-string-tune-website/src/`, `kdmirah-studio/src/`, `pasarapi-mini-bounty-announcement/src/`, and `aimirah-mixtape/src/`; each app's `package.json` pins TypeScript and `tsconfig.json` targets ES2020 with strict checking.

**Secondary:**
- HTML/CSS - each app's `index.html` and `src/index.css`; JSON - static catalogs in `aimirah-mixtape/src/data/catalogSnapshot.json` and `kdmirah-studio/src/data/videos.json`, plus package/config files such as `clone-reframed-online-website/package.json`.

## Runtime

**Environment:**
- Browser-hosted React single-page applications; build tooling runs on Node.js, but no Node version is pinned in the tracked manifests such as `clone-reframed-online-website/package.json` or `README.md`.

**Package Manager:**
- npm (version not specified); use `npm install`, `npm run dev`, `npm run build`, and `npm run preview` inside the relevant app directory as shown in `README.md` and each app's `package.json`.
- Lockfiles: one committed `package-lock.json` per app, e.g. `clone-reframed-online-website/package-lock.json` and `pasarapi-mini-bounty-announcement/package-lock.json`; there is no root package manifest.

## Frameworks

**Core:**
- React 19.2.6 / React DOM 19.2.6 - client-rendered UI in all five app manifests, e.g. `clone-reframed-online-website/package.json` and `aimirah-mixtape/package.json`.
- Tailwind CSS 4.1.17 via `@tailwindcss/vite` 4.1.17 - utility styling in all five apps; plugin wiring in each `vite.config.ts`, e.g. `clone-reframed-online-website/vite.config.ts`.

**Testing:**
- Not detected: no test runner or test script in app manifests such as `pasarapi-mini-bounty-announcement/package.json`; tracked source has no test/spec files.

**Build/Dev:**
- Vite ^7.3.7, `@vitejs/plugin-react` 5.1.1, `vite-plugin-singlefile` 2.3.0 - development server and single-HTML production bundle in all app manifests/configs, e.g. `aimirah-mixtape/package.json` and `aimirah-mixtape/vite.config.ts`.
- TypeScript `noEmit`, bundler resolution, `resolveJsonModule`, `@/*` → `src/*` alias, strict/no-unused checks - configured consistently in each `tsconfig.json`, e.g. `kdmirah-studio/tsconfig.json`; Vite alias mirrors it in `kdmirah-studio/vite.config.ts`.

## Key Dependencies

**Critical:**
- `lenis` ^1.3.26 - smooth scrolling in `clone-reframed-online-website/src/lib/scroll.ts` and `clone-string-tune-website/src/App.tsx`; declared in their respective `package.json` files.
- `recharts` ^3.9.2 - data visualizations in `pasarapi-mini-bounty-announcement/src/components/BirthsSection.tsx`, declared in `pasarapi-mini-bounty-announcement/package.json`.
- `lucide-react` - icon set in `clone-reframed-online-website/src/components/Hero.tsx`, `clone-string-tune-website/src/components/Header.tsx`, and `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx`; versions vary by app (`^1.48.0`, `^1.41.0`, `^1.23.0`) in their `package.json` files.

**Infrastructure:**
- `clsx` 2.1.1 + `tailwind-merge` 3.4.0 - class merging in each app's `src/utils/cn.ts`, e.g. `aimirah-mixtape/src/utils/cn.ts`.
- Browser `fetch`/`AbortController` with manual React state/retry, not a data-fetching SDK, in `pasarapi-mini-bounty-announcement/src/lib/api.ts`.

## Configuration

**Environment:**
- No required build/runtime environment variable references detected in tracked application source; API base URLs are literal strings in `pasarapi-mini-bounty-announcement/src/lib/api.ts` and `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx`.
- Configure changes per app using its `package.json`, `tsconfig.json`, and `vite.config.ts` rather than assuming a root workspace (`README.md`, `clone-reframed-online-website/vite.config.ts`).

**Build:**
- `vite build` via each app's `package.json`; Vite plugins inline JS/CSS in `index.html` through `vite-plugin-singlefile`, but assets under `clone-reframed-online-website/public/` remain separate static files (`clone-reframed-online-website/vite.config.ts`, `clone-reframed-online-website/public/images/og-cover.jpg`).

## Platform Requirements

**Development:**
- Node.js and npm with a version compatible with Vite 7; exact Node/npm versions are not pinned in `README.md` or `clone-reframed-online-website/package.json`. Run commands from an individual app directory per `README.md`.

**Production:**
- Static browser hosting; `README.md` describes GitHub Pages with custom domain set by `clone-reframed-online-website/public/CNAME`. A separate Vercel `/dev` redirect exists in `clone-reframed-online-website/vercel.json`; this file does not establish that Vercel hosts the main site.

---

*Stack analysis: 2026-11-03*
