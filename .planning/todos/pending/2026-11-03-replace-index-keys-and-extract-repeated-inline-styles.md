---
created: 2026-11-03T09:07:19.000Z
title: Replace index keys and extract repeated inline styles
area: ui
files:
  - aimirah-mixtape/src/App.tsx
  - aimirah-mixtape/src/components/SecondaryViews.tsx
  - aimirah-mixtape/src/components/ComponentGrid.tsx
  - clone-string-tune-website/src/components/Hero.tsx
  - clone-string-tune-website/src/index.css
  - aimirah-mixtape/src/index.css
---

## Problem

The type-safety half of CONCERNS.md #37 is done — all `as any` casts are gone
(`useSectionProgress` is now generic) and both dead
`eslint-disable-next-line react-hooks/exhaustive-deps` directives were removed
by fixing the actual dependencies. Two low-severity items remain:

**1. Index keys — 15 occurrences of `key={i}` / `key={index}`:**

| Site | File | Count |
|---|---|---|
| aimirah-mixtape | `ComponentDetailView.tsx`, `HomeStats.tsx` (×2), `SkillSpectorBadge.tsx`, `DeckWidgets.tsx` (×2) | 6 |
| clone-reframed-online-website | `Preloader.tsx`, `Manifesto.tsx`, `Hero.tsx`, `Marquee.tsx` | 4 |
| clone-string-tune-website | `Clarity.tsx` (×2), `Hero.tsx` | 3 |
| pasarapi-mini-bounty-announcement | `ui.tsx`, `Ticker.tsx` | 2 |

Not all are wrong. Static, never-reordered character/word splitters
(`Preloader`, `Manifesto`, `Marquee`, `HomeStats` odometer) are genuinely
stable-by-position, so an index key is acceptable there. The ones worth fixing
are lists that can reorder, filter, or have items inserted — those cause
remounts and lost state. Audit each rather than blanket-replacing.

**2. Inline styles — `style={{` appears 57 times in clone-string-tune and 53
in aimirah-mixtape.** Many are legitimately dynamic (scroll progress, pointer
position, computed transforms) and cannot move to CSS. The extractable subset
is static objects repeated in JSX — those should become Tailwind utilities or
CSS custom-property classes in `index.css`.

Current CSS-token naming also diverges per site (`--color-*`, `--c-*`,
`--animate-*`, `--bg`, `--br`), which is why nothing can be shared. Standardising
tokens belongs with the shared-primitives todo, not here.

## Solution

Do this as two small, separately-reviewable passes.

**Pass 1 — keys (low risk).** For each of the 15 sites, classify:

- **Static split of a constant string** → keep `key={i}`, add a one-line comment
  saying it is intentionally positional.
- **List that can reorder/filter** → key on a stable field (`item.slug`,
  `item.path`, `item.name`). `CatalogItem` and `Video` both have stable
  identifiers, so this is usually mechanical.

Do not change keys just to silence a rule; changing a key changes remount
behaviour and can regress animation state.

**Pass 2 — inline styles.** Grep for `style={{` and triage into:

- **Dynamic** (depends on scroll/pointer/measurement) → leave alone.
- **Static, repeated** → extract to a class. Start with the highest-frequency
  offenders rather than trying to reach zero.

Verification for both: `tsc --noEmit` plus a visual check that the starfield,
marquee and odometer animations still run. Component tests from the other todo
would make this safer, so consider ordering it after test coverage.

Explicitly out of scope: the large monolithic components (#21) and the
CSS-token unification — those deserve their own todos.
