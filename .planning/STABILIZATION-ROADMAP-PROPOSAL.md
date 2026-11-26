# Proposed roadmap: aimirah.me stabilization

> Reconstructed from the November 17 planning conversation. The original
> 8,859-byte `.planning/ROADMAP.md` in the iCloud-managed checkout is currently
> dataless and unreadable. This document preserves its recorded decisions and
> scope, but is **not** a byte-for-byte recovery. It is a proposal for a later
> milestone; the existing standalone-project-links `.planning/ROADMAP.md`,
> `PROJECT.md`, `REQUIREMENTS.md`, and `STATE.md` remain authoritative.

## Overview

Five independent sites share the `shared/` package and one toolchain. The
proposed stabilization milestone targets testability, shared motion primitives,
payload size, storage and runtime correctness, UI polish, and social cards.
Its inputs were five pending todos from November 3 and code-review findings
discussed on November 5. Recheck each input against the current codebase before
turning this proposal into requirements or phase plans: the GitHub checkout has
advanced independently of the inaccessible local copy.

**Proposed milestone:** v1.0 — Stabilise and ship.

**Proposed exit criteria:** component and end-to-end checks run in CI; the two
JSON-heavy sites have an assessed first-load budget; duplicated motion
primitives are reduced; every site's social preview has a real image; and
known storage-validation crashes have regression coverage.

## Phase 1: Test Coverage Foundation

**Goal:** Prove user-facing behavior before refactoring critical paths. The
November review counted 20 Vitest tests, all for pure functions or storage
guards, with no rendered-component or end-to-end coverage.

**Source:**
`todos/pending/2026-11-03-add-component-and-e2e-test-coverage.md`

**Proposed scope:**

- Add jsdom, React Testing Library, and user-event for component tests.
- Cover catalogue search, filters and keyboard navigation in
  `aimirah-mixtape/src/components/SearchModal.tsx`.
- Cover cart state and the `localStorage` round-trip, including malformed data.
- Cover the keyboard-operated comparison seam in
  `clone-reframed-online-website/src/components/ExperimentSection.tsx`.
- Verify video sorting in a rendered view.
- Add Playwright smoke coverage per site: boot, expected heading, console
  errors, and reduced-motion behavior.
- Wire component tests and appropriately scoped browser tests into CI, after
  deciding whether browser-install cost belongs on every run or a schedule.

**Dependencies:** None. Capture the existing test baseline first.

## Phase 2: Shared Motion Primitives

**Goal:** Share common preloader, cursor, reveal and scroll-lock behavior
without flattening each site's visual identity.

**Source:**
`todos/pending/2026-11-03-extract-shared-scroll-preloader-cursor-primitives.md`

**Proposed scope:**

- Reconcile the competing scroll-lock strategies (`documentElement` versus a
  reference-counted `body` lock) into a suitable shared API.
- Explore a shared reveal/progress hook while retaining any `ProgressMode`
  behavior used by the string-tune site.
- Extract configurable preloader and cursor primitives, preserving each site's
  timing, visuals, and accessibility behavior.
- Export agreed primitives from `shared/package.json`.
- Leave the Lenis provider out of the initial extraction.

**Dependencies:** Phase 1, because loaders and cursors affect page boot and
every interaction path.

## Phase 3: Payload Budget

**Goal:** Avoid loading the entire video prompt archive and catalogue snapshot
before a visitor needs the content.

**Source:**
`todos/pending/2026-11-03-split-oversized-json-data-bundles-and-load-on-demand.md`

**Proposed scope:**

1. Measure the current first-load payload and minify the source JSON where it
   can be done without changing content. Earlier measurements recorded
   `videos.json` at about 334 KB and `catalogSnapshot.json` at about 432 KB
   on disk (about 291 KB as compact JSON).
2. Split detail data by video slug and catalogue `typePlural`; load the detail
   only when needed and show a loading state.
3. Code-split appropriate detail views.
4. For sites using separate data/chunks, opt out of `viteSingleFile` through
   the shared Vite config rather than assuming dynamic imports will remain
   separate under a single-file build.

**Dependencies:** Phase 1 for smoke tests that catch broken lazy-load paths;
otherwise independent of Phase 2.

**Proposed acceptance:** A visitor can open one video or one catalogue type
without downloading all detail data on first load; compare actual build output
to the recorded baseline.

## Phase 4: Storage & Runtime Hardening

**Goal:** Keep aimirah-mixtape usable when storage is malformed or unavailable.

**Source:** November 5 code review findings; not one of the five pending todos.

**Proposed scope:**

- Validate stored `typePlural` against allowed keys, not just `typeof string`,
  before dereferencing `TYPE_META` or pushing into a cart bucket.
- Handle `localStorage.getItem` failures as safely as existing write failures.
- Guard the unvalidated `TYPE_META[t].flag` collection-command path.
- Assert a safe fallback for corrupt, stale, or blocked storage in tests.

**Dependencies:** Phase 1 supplies regression tests. The fixes are small enough
to prioritize sooner if a live incident warrants it.

## Phase 5: UI Correctness & Polish

**Goal:** Address visible animation and update behavior, then do a selective
key and inline-style cleanup.

**Sources:**
`todos/pending/2026-11-03-replace-index-keys-and-extract-repeated-inline-styles.md`
and November 5 review findings.

**Proposed scope:**

- Fix the string-tune preloader exit so its transition renders before parent
  state unmounts it; preserve intended timing.
- Stop the string-tune `useRaf` loop when unsubscribed or hidden, and avoid
  needless layout reads while invisible.
- Move `notify()` out of a `setCart` updater to avoid repeated side effects
  under React Strict Mode.
- Audit positional React keys: replace those on reorderable lists, and leave
  stable decorative sequences only where positional identity is intentional.
- Extract static repeated styles; retain inline styles where values genuinely
  depend on pointer, scroll or component state.

**Dependencies:** Phase 1 for the broader pass. Isolated bug fixes can move
earlier if verified independently.

## Phase 6: Social Cards

**Goal:** Make each `twitter:card=summary_large_image` declaration correspond
to a reachable, correctly sized preview image.

**Source:**
`todos/pending/2026-11-03-add-per-site-og-image-social-cards.md`

**Proposed scope:**

- Produce four 1200 × 630 cards from stable site designs (the earlier proposal
  suggested a Playwright-powered `scripts/og-image.mjs`); commit generated
  images rather than generating them in CI.
- Verify the existing reframed-site card's declared dimensions against its
  actual file.
- Add `og:image`, dimensions, alt text and `twitter:image` to sites that lack
  these tags. Use public absolute URLs that resolve on their deployed hosts.
- Test previews with an appropriate validator after deployment.

**Dependencies:** Prefer Phase 2 and the string-tune preloader fix before
capturing hero screenshots; re-evaluate this ordering if cards are drawn
without screenshots.

## Phase 7: Deploy Targets & Data-Feed Resilience (unscoped)

**Goal:** Discuss surfaced follow-up work before defining requirements.

- The earlier local README listed hosting for aimirah-mixtape,
  kdmirah-studio and the PASAR.DATA dashboard as unconfigured. **Recheck
  against current deployed URLs and the GitHub README:** the existing
  standalone-links milestone already checked some destinations.
- The November review found that the population feed's unfiltered fallback
  reused `limit: 220`, potentially yielding no overall rows. Reproduce against
  the current API before scoping a fix.

**Dependencies:** To be decided during milestone discussion. This phase is a
placeholder, not a commitment to change deployment configuration.

## Proposed dependencies and sequence

```text
Phase 1 (tests)
├─ Phase 2 (shared motion) ─ Phase 6 (social cards)
├─ Phase 3 (payload budget)
├─ Phase 4 (storage hardening)
└─ Phase 5 (UI correctness and polish)
Phase 7 requires discussion before planning.
```

Suggested order: **1 → 4 → 2 → 3 → 5 → 6 → 7**. Phase 4 comes early because
it is small and addresses persistent crash paths. Phases 2–5 are otherwise
largely independent after Phase 1.

## Status and adoption

All seven phases are **proposed, not started** in this document. Phase 7 is
**unscoped**. This proposal is not the active GSD roadmap and carries no
requirement traceability. To adopt it, first finish or explicitly close the
current standalone-project-links milestone, then run the normal project or
milestone questioning, requirements, roadmap approval, and commit gates.

*Reconstructed on 2026-11-26 from conversation history; original local file
remains untouched in `/Users/vstrdvst/Documents/aimirah.me-main`.*
