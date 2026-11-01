# PASAR.DATA

**kdmirah — Digital Inspiration Lab.** Live at [aimirah.me](https://aimirah.me).

A dark, editorial single-page site studying the space between what we see and what we make: four experiments, each pairing a raw source image with the work it provoked, compared through a draggable seam.

## Highlights

- Draggable before/after "seam" comparisons for each experiment
- Lenis smooth scrolling with scroll-driven reveals
- Word-by-word illuminated manifesto, infinite marquees, animated starfield
- Custom cursor, preloader, and film-grain overlay
- Typography: Anton, Space Grotesk, Space Mono

## Stack

- [React 19](https://react.dev) + TypeScript
- [Vite 7](https://vite.dev) with `vite-plugin-singlefile` — production builds inline into a single `index.html`
- [Tailwind CSS 4](https://tailwindcss.com) via `@tailwindcss/vite`
- [Lenis](https://github.com/darkroomengineering/lenis) smooth scroll, `lucide-react`, `clsx` + `tailwind-merge`

## Getting started

```bash
cd clone-reframed-online-website
npm install
npm run dev      # start the dev server
npm run build    # single-file production build
npm run preview  # preview the production build
```

## Structure

```
clone-reframed-online-website/
├── src/
│   ├── components/   # Hero, Nav, Manifesto, ExperimentSection, Marquee, ...
│   ├── hooks/        # useReveal — scroll-triggered reveal logic
│   ├── lib/          # data.ts (experiment content), scroll.ts (Lenis setup)
│   └── utils/        # cn.ts — className helper
└── public/           # images, CNAME, sitemap.xml, robots.txt, webmanifest
```

Site content (the four experiments) lives in [`src/lib/data.ts`](clone-reframed-online-website/src/lib/data.ts).

## Deployment

Each site has exactly one hosting target. Do not add a second provider's config
to a project (see `.planning/codebase/CONCERNS.md` #7).

| Project | Domain | Host | Config |
|---|---|---|---|
| `clone-reframed-online-website` | `aimirah.me` | GitHub Pages | `public/CNAME` |
| `clone-string-tune-website` | `mi4inc.com` | Vercel | Vercel project settings |
| `aimirah-mixtape` | `aimirah.mixtape` | (not yet configured) | — |
| `kdmirah-studio` | `kdmirah.studio` | (not yet configured) | — |
| `pasarapi-mini-bounty-announcement` | (not yet configured) | (not yet configured) | — |

`clone-reframed-online-website/vercel.json` exists only for the legacy `/dev`
redirect to the MI4Inc. preview; the canonical site itself is served by GitHub
Pages. Outbound links to sibling projects live in
[`src/lib/links.ts`](clone-reframed-online-website/src/lib/links.ts) — update
them there, never inline in a component.

## License

[GPL-3.0](LICENSE)
