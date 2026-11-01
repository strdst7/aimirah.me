# Technology Stack

**Analysis Date:** 2026-11-01

## Repository Shape

This repo is **not** a workspace monorepo (no root `package.json`, no `workspaces` field, no `pnpm-workspace.yaml`, no `turbo.json`/`nx.json`). It is a flat container of **five independent Vite + React projects**, each with its own `package.json`, `package-lock.json`, `node_modules` (uninstalled), `vite.config.ts`, and `tsconfig.json`:

| Subproject | Path | Role |
|-----------|------|------|
| clone-reframed-online-website | `clone-reframed-online-website/` | Production site for `aimirah.me` (kdmirah "Digital Inspiration Lab") |
| aimirah-mixtape | `aimirah-mixtape/` | "aimirah.mixtape" catalog UI for Claude Code agents/commands/skills/MCP |
| clone-string-tune-website | `clone-string-tune-website/` | MI4Inc. motion/animation library landing page |
| kdmirah-studio | `kdmirah-studio/` | kdmirah.studio — Opus 5.5 video prompt archive |
| pasarapi-mini-bounty-announcement | `pasarapi-mini-bounty-announcement/` | PASAR.DATA — Malaysia open-data dashboard (PasarAPI bounty) |

There is no root build script. Each subproject is built and deployed on its own by `cd`-ing into its directory. Shared root files: `README.md`, `LICENSE` (GPL-3.0), `.gitignore` (`.vercel`, `.env*`).

## Languages

**Primary:**
- TypeScript 5.9.3 — all source in all five subprojects (`.tsx` / `.ts`)
- CSS (Tailwind v4 CSS-first config, no `tailwind.config.*` anywhere) — `src/index.css` in every subproject

**Secondary:**
- HTML — `index.html` in each subproject
- JSON — static data: `aimirah-mixtape/src/data/catalogSnapshot.json` (424 KB), `kdmirah-studio/src/data/videos.json` (328 KB)

## Runtime

**Environment:**
- Browser-only (client-side SPA). No Node server, no SSR, no API routes — every build is a static bundle inlined into a single `index.html`.

**Package Manager:**
- npm (all five subprojects have `package-lock.json`, `lockfileVersion` 3)
- Lockfile: present for all five; no `pnpm-lock.yaml` or `yarn.lock`
- No `.nvmrc` / `.node-version`; no `engines` field in any `package.json`

## Frameworks

**Core (identical across all 5):**
- React 19.2.6 + React DOM 19.2.6 — UI
- Vite ^7.3.7 (locked 7.3.7) — dev server and bundler
- `@vitejs/plugin-react` 5.1.1 — React Fast Refresh / JSX transform
- Tailwind CSS 4.1.17 via `@tailwindcss/vite` 4.1.17 — styling (CSS-first `@import "tailwindcss"` + `@theme` blocks; no PostCSS config, no `tailwind.config.js`)

**Testing:**
- Not detected. No test runner, no test files, no `test` script in any `package.json`.

**Build/Dev:**
- `vite-plugin-singlefile` 2.3.0 — **the defining build choice**: production output is a single self-contained `index.html` with CSS/JS inlined
- `esbuild` ^0.28.2 — declared as an explicit devDependency only in `kdmirah-studio/package.json`; present transitively (via Vite) in all five
- Scripts are identical in all five: `dev` (`vite`), `build` (`vite build`), `preview` (`vite preview`). No `lint`, `typecheck`, or `test` script.

## Key Dependencies

**Shared by all five:**
- `clsx` 2.1.1 + `tailwind-merge` 3.4.0 — consumed through a per-project `src/utils/cn.ts` (`cn()` helper)
- `@types/node` 22.19.17, `@types/react` 19.2.7, `@types/react-dom` 19.2.3 — dev types
- `"type": "module"`, `"private": true`, `"version": "0.0.0"`, and `"name": "react-vite-tailwind"` in every `package.json` (identical boilerplate names — no project-specific naming)

**Per-project extras:**
- `lenis` ^1.3.26 (locked 1.3.26) — smooth scroll. Only `clone-reframed-online-website` (via `clone-reframed-online-website/src/lib/scroll.ts`) and `clone-string-tune-website`
- `lucide-react` — icons; three different pinned ranges: ^1.48.0 (`clone-reframed-online-website`), ^1.41.0 (`clone-string-tune-website`), ^1.23.0 (`pasarapi-mini-bounty-announcement`)
- `recharts` ^3.9.2 + `react-is` ^19.2.6 — charts, **only** in `pasarapi-mini-bounty-announcement` (`pasarapi-mini-bounty-announcement/src/components/BirthsSection.tsx`, `pasarapi-mini-bounty-announcement/src/components/FuelSection.tsx`)
- `aimirah-mixtape` and `kdmirah-studio` have **no** runtime deps beyond React + the clsx/tailwind-merge pair (icons/illustrations are hand-rolled in `aimirah-mixtape/src/components/Icons.tsx` and `kdmirah-studio/src/components/Icon.tsx`)

## Dependency Comparison Matrix

| Package | aimirah-mixtape | clone-reframed-online-website | clone-string-tune-website | kdmirah-studio | pasarapi-mini-bounty-announcement |
|---|---|---|---|---|---|
| react / react-dom | 19.2.6 | 19.2.6 | 19.2.6 | 19.2.6 | 19.2.6 |
| vite | ^7.3.7 | ^7.3.7 | ^7.3.7 | ^7.3.7 | ^7.3.7 |
| @vitejs/plugin-react | 5.1.1 | 5.1.1 | 5.1.1 | 5.1.1 | 5.1.1 |
| vite-plugin-singlefile | 2.3.0 | 2.3.0 | 2.3.0 | 2.3.0 | 2.3.0 |
| tailwindcss / @tailwindcss/vite | 4.1.17 | 4.1.17 | 4.1.17 | 4.1.17 | 4.1.17 |
| typescript | 5.9.3 | 5.9.3 | 5.9.3 | 5.9.3 | 5.9.3 |
| clsx / tailwind-merge | 2.1.1 / 3.4.0 | 2.1.1 / 3.4.0 | 2.1.1 / 3.4.0 | 2.1.1 / 3.4.0 | 2.1.1 / 3.4.0 |
| lenis | — | ^1.3.26 | ^1.3.26 | — | — |
| lucide-react | — | ^1.48.0 | ^1.41.0 | — | ^1.23.0 |
| recharts | — | — | — | — | ^3.9.2 |
| react-is | — | — | — | — | ^19.2.6 |
| esbuild (devDep, explicit) | — | — | — | ^0.28.2 | — |

**Notable divergences:** only `clone-reframed-online-website` and `clone-string-tune-website` use Lenis; only `pasarapi-mini-bounty-announcement` pulls in Recharts (+ `react-is` peer); `lucide-react` is on three different minor pins, so icon sets are not guaranteed identical across projects; `kdmirah-studio` is the only project that pins `esbuild` explicitly.

## Build Tooling

All five `vite.config.ts` files are **byte-for-byte equivalent**:

```ts
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
```

Consequences to know when adding code:
- `@` → `src` alias in Vite **and** `tsconfig.json` (`baseUrl: "."`, `paths: { "@/*": ["src/*"] }`)
- `viteSingleFile()` inlines all JS/CSS — any asset imported from `src/assets` becomes a base64 data URI in the final HTML; assets in `public/` stay as separate files referenced by absolute path
- No `base` option is set anywhere, so builds assume deployment at domain root

## TypeScript Configuration

Identical `tsconfig.json` in all five:
- `target: ES2020`, `lib: ["ES2020","DOM","DOM.Iterable"]`, `module: ESNext`, `moduleResolution: bundler`
- `jsx: "react-jsx"`, `noEmit: true`, `isolatedModules: true`, `allowImportingTsExtensions: true`, `resolveJsonModule: true`
- Strictness: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noFallthroughCasesInSwitch: true`
- `types: ["node"]`
- `include: ["src", "vite.config.ts"]`

Note: there is no `tsc --noEmit` in any script, so type checking never runs in CI/build; only Vite's esbuild transpile runs.

## Configuration

**Environment:**
- No `.env` files present and no `import.meta.env` / `process.env` usage anywhere in `src/`
- Root `.gitignore` ignores `.env*` and `.vercel`
- No runtime env vars required to build or run any subproject

**Build:**
- Per-project: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- Only deployment config in the repo: `clone-reframed-online-website/vercel.json` (a single redirect rule)
- No ESLint/Prettier/Biome config, no `postcss.config.*`, no `tailwind.config.*`, no CI workflow files (`.github/` does not exist)

**Static/file config:**
- `clone-reframed-online-website/public/CNAME` → `aimirah.me`
- `clone-reframed-online-website/public/robots.txt` → allow all, sitemap at `https://aimirah.me/sitemap.xml`
- `clone-reframed-online-website/public/sitemap.xml` → single URL `https://aimirah.me/`
- `clone-reframed-online-website/public/site.webmanifest` → standalone PWA manifest, theme `#050505`
- `kdmirah-studio/public/favicon.svg` — only other `public/` asset in the repo
- `aimirah-mixtape/`, `clone-string-tune-website/`, `pasarapi-mini-bounty-announcement/` have **no** `public/` directory

**Theme bootstrap:**
- `aimirah-mixtape/index.html` has an inline blocking `<script>` that reads `localStorage['aimirah-theme']` and sets `html.light` / `html.dark` before paint
- `kdmirah-studio` reads `localStorage['kdmirah-theme']` + `prefers-color-scheme` in `kdmirah-studio/src/App.tsx`

## Platform Requirements

**Development:**
- Node.js with npm; modern browser. No version pinning anywhere.
- Per-project install: `cd <subproject> && npm install && npm run dev`

**Production:**
- Static hosting only. Primary target: **GitHub Pages** with custom domain `aimirah.me` (via `clone-reframed-online-website/public/CNAME`), per `README.md`.
- Secondary/actual deployments referenced in code: `https://clone-string-tune-website-gold.vercel.app/` (Vercel) and `https://aimirah-mi4.netlify.app/` (Netlify), both linked from `clone-reframed-online-website/src/components/IndexSection.tsx`; `clone-reframed-online-website/vercel.json` redirects `/dev` → `https://aimirah-mi4.netlify.app/`.
- No deployment config exists for `aimirah-mixtape/`, `kdmirah-studio/`, or `pasarapi-mini-bounty-announcement/`.

## Licensing

Single root `LICENSE`: GNU GPL v3 (README states GPL-3.0). The five subprojects carry no individual license files.

---

*Stack analysis: 2026-11-01*
