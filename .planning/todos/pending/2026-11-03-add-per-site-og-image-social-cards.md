---
created: 2026-11-03T09:07:19.000Z
title: Add per-site og:image social cards
area: seo
files:
  - clone-reframed-online-website/index.html
  - clone-reframed-online-website/public/og-cover.jpg
  - aimirah-mixtape/index.html
  - clone-string-tune-website/index.html
  - kdmirah-studio/index.html
  - pasarapi-mini-bounty-announcement/index.html
---

## Problem

The metadata half of CONCERNS.md #30 is done: every site now has `rel=canonical`,
`og:url`/`og:type`/`og:site_name`, `twitter:card`, a `public/robots.txt`, and
`public/sitemap.xml` (robots/sitemap added to all five; sitemap to the four that
lacked it). What is still missing is the actual **social preview image**.

Current `og:image` state:

| Site | og:image tags |
|---|---|
| `clone-reframed-online-website` | 3 (image, width, height) — the only complete one |
| `aimirah-mixtape` | 0 |
| `clone-string-tune-website` | 0 |
| `kdmirah-studio` | 0 |
| `pasarapi-mini-bounty-announcement` | 0 |

`twitter:card` is now `summary_large_image` on all four, which actively promises
a large image that does not exist. Sharing any of those links currently renders
a blank or generic card, which undercuts the point of having added the tags.

## Solution

Standardise on 1200x630 (the Facebook/Twitter safe ratio; the existing reframed
card is 1600x1200, which gets centre-cropped on most surfaces).

**Step 1 — produce four images.** One per site that lacks one. A clean
deterministic route is a small script that renders each site's hero at 1200x630
with Playwright, so the cards never drift from the actual design:

```
scripts/og-image.mjs   → public/og-cover.jpg per site
```

Commit the output rather than generating in CI, so builds stay hermetic. Add a
comment above each block noting the command to regenerate.

**Step 2 — add the tags** to each `index.html`:

```html
<meta property="og:image" content="https://<site>/og-cover.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="..." />
<meta name="twitter:image" content="https://<site>/og-cover.jpg" />
```

**Step 3 — correct the reframed card** to 1200x630 (or keep 1600x1200 and update
the declared width/height to match whatever is actually shipped — the current
tags declare 1600x1200, so verify the file on disk still matches).

Note: `aimirah-mixtape/public/` and `kdmirah-studio/public/` already exist from
the robots/sitemap work, so no new directory setup is needed.

Acceptance: pasting each site URL into a card validator produces a real preview
image with the correct dimensions and no "image too small" warning.
