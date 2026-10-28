# kdmirah.studio

kdmirah.studio is a standalone video-and-prompt archive for people exploring Claude Opus 5.5 creations. [Open the site](https://kdmirah-studio.vercel.app).

## What it does

- Browse 418 entries by category, creator, or prompt search.
- Compare original videos with remakes and copy creator prompts.
- Switch between light and dark themes.

The app bundles its entries in `src/data/videos.json`. Video and image URLs point to external media at `media.skillry.dev`. Playback needs access to that host.

## Stack

React 19, TypeScript 5.9, Vite 7, and Tailwind CSS 4. `vite-plugin-singlefile` inlines the production bundle into `dist/index.html`.

## Run locally

From the repository root:

```bash
cd kdmirah-studio
npm ci
npm run dev
```

Run `npm run build` for production output and `npm run preview` to serve it locally.

## Source and deployment

- `src/data/videos.json`: video metadata, prompts, and media URLs.
- `src/lib/content.ts`: archive data, categories, and sorting.
- `src/components/`: gallery, search, video modal, and site UI.
- Vercel project: `kdmirah-studio`, with `kdmirah-studio` as its root directory.

This feature branch contains the app. It does not change the `aimirah.me` homepage on `main`.

## License

[GPL-3.0](LICENSE). External video and image assets retain their own rights.