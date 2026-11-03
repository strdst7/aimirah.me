---
created: 2026-11-03T09:07:19.000Z
title: Split oversized JSON data bundles and load on demand
area: performance
files:
  - kdmirah-studio/src/data/videos.json
  - kdmirah-studio/src/lib/content.ts
  - aimirah-mixtape/src/data/catalogSnapshot.json
  - aimirah-mixtape/src/data/catalog.ts
  - shared/vite.base.ts
---

## Problem

The image half of CONCERNS.md #6 is fixed — string-tune's 4.5 MB of imagery
moved to `public/images/`, dropping its `dist/index.html` from ~6 MB to ~416 kB.
The JSON half (#20) is still open: both files are imported at module scope, so
`vite-plugin-singlefile` bakes them into the JS bundle and every visitor
downloads all of it regardless of what they view.

Measured sizes:

| File | On disk | As JSON | Notes |
|---|---|---|---|
| `kdmirah-studio/src/data/videos.json` | 334 KB | 334 KB | 131 KB is `prompt` text; 418 videos |
| `aimirah-mixtape/src/data/catalogSnapshot.json` | 432 KB | 291 KB | `byType` is 256 KB of the 291 KB |

File size exceeds the serialized size because of pretty-printing, so trimming
whitespace is a free, zero-risk win before any structural change.

Current import sites:

- `kdmirah-studio/src/lib/content.ts:1` — `import raw from "../data/videos.json"`
- `aimirah-mixtape/src/data/catalog.ts:1` — `import rawSnapshot from './catalogSnapshot.json'`

Impact: users who open one video still download all 418 prompts; users who
browse one catalogue type still download every row. LCP is dominated by a
monolithic JS payload on both sites (~692 KB and ~700 KB HTML respectively).

## Solution

Three incremental steps, each independently shippable.

**Step 1 — strip whitespace (free).** Re-emit both JSON files minified. No code
changes. Expect roughly 30% off `catalogSnapshot.json` immediately.

**Step 2 — split by category/type.** Emit one file per key instead of one blob:

- `videos.json` → `data/videos/{slug}.json` (list metadata, no `prompt`)
  plus `data/prompts/{slug}.json` fetched when a modal opens.
- `catalogSnapshot.json` → `data/catalog/{typePlural}.json`, keeping
  `counts`/`trending`/`jobs` in a small `meta.json`.

Load them with `fetch()` from `public/` and render skeletons while in flight.
`kdmirah-studio` already has `VideoCardSkeleton` removed as dead code — revive
it (or a simpler shimmer) for this purpose.

**Step 3 — code-split the initial payload.** Keep only metadata needed for the
first paint. Use dynamic `import()` for the detail views so Vite emits separate
chunks.

Caveat: `viteSingleFile` in `shared/vite.base.ts` inlines everything by design.
For these two sites, either pass an `overrides` argument to
`createViteConfig()` that disables the singlefile plugin, or accept that
runtime `fetch()` from `public/` is the only way to keep assets out of the
bundle. The `overrides` hook already exists, so this needs no shared-config
change.

Acceptance: first-load JS for both sites drops materially, and one video /
one catalogue type can be viewed without downloading the rest.
