# aimirah.mixtape

aimirah.mixtape is a standalone catalogue and stack builder for people browsing Claude Code components. [Open the site](https://aimirah-mixtape.vercel.app).

## What it does

- Browse agents, commands, skills, MCP integrations, hooks, and other components.
- Search the bundled catalogue and inspect component details.
- Assemble stacks and collections, then copy install commands.
- Explore bundled plugin, trending, and job views.

The app reads `src/data/catalogSnapshot.json` locally. Cart, collections, and theme use browser `localStorage`, so they stay on that browser. Some component file previews use generated text when the snapshot lacks source content. Review source and install commands before running them.

## Stack

React 19, TypeScript 5.9, Vite 7, and Tailwind CSS 4. `vite-plugin-singlefile` inlines the production bundle into `dist/index.html`.

## Run locally

From the repository root:

```bash
cd aimirah-mixtape
npm ci
npm run dev
```

Run `npm run build` for production output and `npm run preview` to serve it locally.

## Source and deployment

- `src/data/catalogSnapshot.json`: bundled catalogue, trending, and job data.
- `src/data/catalog.ts`: catalogue mapping and install commands.
- `src/App.tsx`: navigation, cart, collections, and theme state.
- Vercel project: `aimirah-mixtape`, with `aimirah-mixtape` as its root directory.

This feature branch contains the app. It does not change the `aimirah.me` homepage on `main`.

## License

[GPL-3.0](LICENSE). Review third-party component licenses before reuse.