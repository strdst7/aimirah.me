# aimirah.me

**aimirah.me** is a five-site React monorepo for the kdmirah portfolio and related experiments.

[![CI status](https://github.com/strdst7/aimirah.me/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/strdst7/aimirah.me/actions/workflows/ci.yml)
[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)
[![Node.js: 20+](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)](.nvmrc)
[![Workspaces: 5 sites](https://img.shields.io/badge/workspaces-5%20sites-646CFF?logo=vite&logoColor=white)](#projects)
[![Website: aimirah.me](https://img.shields.io/badge/website-aimirah.me-111111)](https://aimirah.me)

The primary site, [aimirah.me](https://aimirah.me), presents four visual experiments through draggable source-to-output comparisons.
The other sites cover motion design, a component catalogue, a video archive, and Malaysian open data.

## Contents

- [Projects](#projects)
- [Stack](#stack)
- [Getting started](#getting-started)
- [Commands](#commands)
- [Repository layout](#repository-layout)
- [Content and shared code](#content-and-shared-code)
- [Checks](#checks)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Projects

| Workspace | What it contains | Public link |
| --- | --- | --- |
| [`clone-reframed-online-website`](clone-reframed-online-website/) | Primary portfolio with four image comparisons, a manifesto, and scroll effects | [aimirah.me](https://aimirah.me) |
| [`clone-string-tune-website`](clone-string-tune-website/) | MI4Inc. motion study | [mi4inc.com](https://mi4inc.com) |
| [`aimirah-mixtape`](aimirah-mixtape/) | Catalogue of skills, agents, commands, and other components with saved collections | No public link configured in the repository |
| [`kdmirah-studio`](kdmirah-studio/) | Opus 5.5 video archive | [Vercel preview](https://kdmirah-studio.vercel.app/) |
| [`pasarapi-mini-bounty-announcement`](pasarapi-mini-bounty-announcement/) | PASAR.DATA dashboard for Malaysian public datasets | [Vercel preview](https://pasarapi-mini-bounty-announcement.vercel.app/) |

The primary site uses a draggable seam to compare each source image with its resulting work.
It also includes a custom cursor, preloader, animated starfield, marquees, and Lenis scrolling.

## Stack

| Layer | Technology |
| --- | --- |
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Build | Vite 7, `vite-plugin-singlefile` |
| Motion | Lenis in the primary and MI4Inc. sites |
| Data visualization | Recharts in PASAR.DATA |
| Tests | Vitest |
| Package management | npm workspaces with one root lockfile |

Each site builds a `dist/index.html` through the shared Vite config.
Static assets remain alongside that HTML in the site's `dist/` directory.

## Getting started

**Requirement:** Node.js 20 or newer. The repository's `.nvmrc` selects Node.js 20.

Clone the repository and install dependencies from its root:

```bash
git clone https://github.com/strdst7/aimirah.me.git
cd aimirah.me
npm ci
```

Start the primary site:

```bash
npm run dev --workspace clone-reframed-online-website
```

Vite prints the local URL when the server starts.
Run a different site by replacing the workspace name with one from [Projects](#projects).

## Commands

Run these commands from the repository root.

| Task | Command |
| --- | --- |
| Start one site | `npm run dev --workspace clone-reframed-online-website` |
| Preview one production build | `npm run preview --workspace clone-reframed-online-website` |
| Build one site | `npm run build --workspace clone-reframed-online-website` |
| Build all five sites | `npm run build` |
| Typecheck all five sites | `npm run typecheck` |
| Run unit tests once | `npm test` |
| Watch unit tests | `npm run test:watch` |

Build before previewing a site's production output:

```bash
npm run build --workspace clone-reframed-online-website
npm run preview --workspace clone-reframed-online-website
```

## Repository layout

```text
aimirah.me/
├── .github/workflows/ci.yml        # tests, typechecks, and per-site builds
├── aimirah-mixtape/               # component catalogue
├── clone-reframed-online-website/ # primary portfolio
├── clone-string-tune-website/     # MI4Inc. motion study
├── kdmirah-studio/                # video archive
├── pasarapi-mini-bounty-announcement/ # Malaysian open-data dashboard
├── shared/                        # @aimirah/shared package
├── tests/                         # root Vitest tests
├── package.json                   # workspace scripts and definitions
└── package-lock.json              # shared dependency lockfile
```

Each site keeps its own `src/`, `public/`, `vite.config.ts`, and `tsconfig.json`.

## Content and shared code

- **Portfolio experiments:** Modify [`clone-reframed-online-website/src/lib/data.ts`](clone-reframed-online-website/src/lib/data.ts) and the matching images in `public/images/`.
- **Portfolio project links:** Modify [`clone-reframed-online-website/src/lib/links.ts`](clone-reframed-online-website/src/lib/links.ts).
- **Mixtape catalogue:** Read [`aimirah-mixtape/src/data/catalog.ts`](aimirah-mixtape/src/data/catalog.ts) and its `catalogSnapshot.json`.
- **Studio videos:** Modify [`kdmirah-studio/src/data/videos.json`](kdmirah-studio/src/data/videos.json).
- **PASAR.DATA:** Read [`pasarapi-mini-bounty-announcement/src/lib/api.ts`](pasarapi-mini-bounty-announcement/src/lib/api.ts) for requests to `api.data.gov.my`.
- **Shared helpers:** Read [`shared/`](shared/) for Vite and TypeScript defaults, motion hooks, class names, storage guards, and the error boundary.

The PASAR.DATA site fetches public datasets at runtime.
Its `src/data/fallbackApis.ts` supplies directory entries, not fallback responses for dataset requests.

## Checks

Run the same root tests and workspace checks used by CI:

```bash
npm test
npm run typecheck
npm run build
```

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs unit tests and checks every site on pushes and pull requests.
Each workspace job typechecks, builds, and checks for `dist/index.html`.

## Deployment

| Site | Destination recorded in the repository | Deployment state |
| --- | --- | --- |
| Primary portfolio | `aimirah.me` via [`public/CNAME`](clone-reframed-online-website/public/CNAME) | GitHub Pages domain recorded |
| MI4Inc. motion study | `mi4inc.com` | Vercel project config lives outside this repository |
| Mixtape | No public destination recorded | Hosting not configured here |
| Studio | `kdmirah-studio.vercel.app` in portfolio links | Preview link recorded, deployment config not included |
| PASAR.DATA | `pasarapi-mini-bounty-announcement.vercel.app` in portfolio links | Preview link recorded, deployment config not included |

Build a site from the root before uploading its `dist/` directory to its host.
The repository's CI checks builds but contains no deployment job.
The primary site's `vercel.json` only defines a legacy `/dev` redirect.

## Contributing

Open an [issue](https://github.com/strdst7/aimirah.me/issues) or [pull request](https://github.com/strdst7/aimirah.me/pulls).
Keep site-specific changes inside their workspace and shared behavior inside `shared/`.
Run the [checks](#checks) before opening a pull request.

## License

The repository includes the [GNU General Public License v3.0](LICENSE).
