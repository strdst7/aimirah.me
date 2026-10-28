# PASAR.DATA

PASAR.DATA is a standalone Malaysia open-data dashboard for visitors exploring public datasets. [Open the site](https://pasarapi-mini-bounty-announcement.vercel.app).

## What it shows

- Fuel prices, exchange rates, births, population, and household income.
- A searchable API directory with country and access-tier filters.
- A bundled directory snapshot when the PasarAPI catalogue is unavailable.

The data panels fetch datasets from [data.gov.my](https://api.data.gov.my/data-catalogue). The directory fetches `https://pasarapi.xyz/api/catalogue`. Data availability depends on those services and browser access.

## Stack

React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, Recharts, and Lucide React. `vite-plugin-singlefile` inlines the production bundle into `dist/index.html`.

## Run locally

From the repository root:

```bash
cd pasarapi-mini-bounty-announcement
npm ci
npm run dev
```

Run `npm run build` for production output and `npm run preview` to serve it locally.

## Source and deployment

- `src/components/`: dashboard sections and directory UI.
- `src/lib/api.ts`: fetch helpers, timeouts, and React data state.
- `src/data/fallbackApis.ts`: bundled API directory snapshot.
- Vercel project: `pasarapi-mini-bounty-announcement`, with `pasarapi-mini-bounty-announcement` as its root directory.

This feature branch contains the app. It does not change the `aimirah.me` homepage on `main`.

## License

[GPL-3.0](LICENSE).