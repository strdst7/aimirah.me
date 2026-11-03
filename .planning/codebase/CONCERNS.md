---
last_mapped_commit: f8435c622ec4708cdef96f7ea7e2c2ef010035e4
last_mapped_at: 2026-11-03
---
# Codebase Concerns

**Analysis Date:** 2026-11-03

## Tech Debt

**Independent frontend packages without shared verification:**
- Issue: Five Vite applications keep separate manifests/lockfiles and expose only `dev`, `build`, and `preview` scripts; there is no tracked repository-level test/lint workflow.
- Files: `aimirah-mixtape/package.json`, `clone-reframed-online-website/package.json`, `clone-string-tune-website/package.json`, `kdmirah-studio/package.json`, `pasarapi-mini-bounty-announcement/package.json`
- Impact: Changes and dependency alerts must be assessed independently in each app; a successful build cannot catch interaction regressions.
- Fix approach: Add a small per-app typecheck/smoke check and run all five in CI before deployment; keep separate apps unless shared code actually emerges.

**Large mixed-responsibility components:**
- Issue: Navigation, persistent cart/collections, stack actions, and rendering coexist in the 1,135-line mixtape `App`; its grid and secondary views are also large. The string-tune hero combines leaf canvases, wave simulation, pointer interaction, and page markup.
- Files: `aimirah-mixtape/src/App.tsx`, `aimirah-mixtape/src/components/ComponentGrid.tsx`, `aimirah-mixtape/src/components/SecondaryViews.tsx`, `clone-string-tune-website/src/components/Hero.tsx`
- Impact: Editing one feature risks unrelated state, rendering, or animation behavior.
- Fix approach: Extract only independently changeable state/handlers and visual units when touching them; retain existing helpers such as `clone-string-tune-website/src/lib/ui.tsx`.

**Catalogue content synthesized as if installable:**
- Issue: Missing snapshot content is replaced with generated-looking component files and metadata, while counts may come from snapshot totals rather than the items available in the bundle.
- Files: `aimirah-mixtape/src/data/catalog.ts`, `aimirah-mixtape/src/data/catalogSnapshot.json`, `aimirah-mixtape/src/components/ComponentGrid.tsx`
- Impact: A detail view or install action can imply a real configuration exists when only a synthesized example or partial snapshot is available.
- Fix approach: Clearly label synthesized previews and distinguish total catalogue counts from locally browsable items; verify install targets against the actual catalogue source.

## Known Bugs

**Forex board can lose the previous date:**
- Symptoms: The previous-day delta displays as flat/unavailable even when the API has previous-day rates.
- Files: `pasarapi-mini-bounty-announcement/src/components/ForexSection.tsx`, `pasarapi-mini-bounty-announcement/src/components/Ticker.tsx`
- Trigger: Sorted catalogue results return three rate types per date and the 12-row limit contains only one date or lacks a prior `middle` row; both views derive deltas from only those 12 rows.
- Workaround: None in the UI; request enough dated middle rows and explicitly check the second date before advertising a one-day change.

**Persisted mixtape shape is trusted without validation:**
- Symptoms: A manually edited, stale, or malformed localStorage cart/collection can break totals, stack rendering, or collection loading instead of falling back to a safe empty state.
- Files: `aimirah-mixtape/src/App.tsx`, `aimirah-mixtape/src/components/StackBuilderSidebar.tsx`
- Trigger: Set `aimirahMixtapeCart` to a JSON object with a non-array `skills` property, or set `aimirahMixtapeCollections` to a nonempty array of entries lacking `items`; parsing only checks JSON syntax and, for collections, top-level array shape.
- Workaround: Clear the affected localStorage keys; validate each entry and each cart list on hydration.

**Comparison slider accessibility value does not follow movement:**
- Symptoms: Assistive technology can read a stale slider percentage while the visible seam changes.
- Files: `clone-reframed-online-website/src/components/ExperimentSection.tsx`
- Trigger: Drag, tap, keyboard-adjust, or allow the introductory tease to move the seam; the percentage lives in refs and `aria-valuenow` is only refreshed on unrelated React renders.
- Workaround: Update slider ARIA state with each effective position change (or use React state at a throttled rate).

## Security Considerations

**Downloaded install script incorporates persisted catalogue paths:**
- Risk: `buildStackInstallCommand` concatenates item paths into a shell command, and `handleDownloadScript` inserts it into an executable `.sh` file. A manipulated localStorage collection/cart path containing shell metacharacters could become a command if the user runs the downloaded script.
- Files: `aimirah-mixtape/src/App.tsx`, `aimirah-mixtape/src/components/StackBuilderSidebar.tsx`, `aimirah-mixtape/src/data/catalog.ts`
- Current mitigation: Stack items initially originate from the bundled catalogue, but persisted JSON is accepted without path/shape validation.
- Recommendations: Resolve persisted paths against a known catalogue allowlist and shell-quote or reject unsafe identifiers before constructing commands; check the generated script with an adversarial path.

**Third-party directory links are data-driven:**
- Risk: Live catalogue `docs` values become clickable `href`s without protocol validation. If the upstream feed supplies a `javascript:` or lookalike URL, the directory can direct users to an unsafe destination.
- Files: `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx`, `pasarapi-mini-bounty-announcement/src/lib/api.ts`
- Current mitigation: React escapes rendered text and external links use `rel="noopener noreferrer"`; the bundled fallback uses HTTPS links.
- Recommendations: Validate response shape and permit only HTTP(S) links before rendering them.

## Performance Bottlenecks

**Persistent animation loops on the portfolio:**
- Problem: Canvas starfield and comparison seam loops run continuously, including when sections are offscreen; each experiment starts separate paint and label-check rAF loops.
- Files: `clone-reframed-online-website/src/components/Starfield.tsx`, `clone-reframed-online-website/src/components/ExperimentSection.tsx`
- Cause: rAF schedules its next frame unconditionally until component unmount; reduced-motion handling only skips the scripted seam tease.
- Improvement path: Pause on document visibility/offscreen state and reduced-motion preference; schedule seam frames only while position differs from target.

**Duplicate direct catalogue requests:**
- Problem: The ticker and the fuel/forex sections independently request the same datasets on initial mount.
- Files: `pasarapi-mini-bounty-announcement/src/components/Ticker.tsx`, `pasarapi-mini-bounty-announcement/src/components/FuelSection.tsx`, `pasarapi-mini-bounty-announcement/src/components/ForexSection.tsx`, `pasarapi-mini-bounty-announcement/src/lib/api.ts`
- Cause: `useAsyncData` has no request cache or shared state.
- Improvement path: Share a per-session promise/result for matching dataset requests if duplicate network work proves material; preserve retry semantics.

## Fragile Areas

**Catalogue fetch fallback and display parsing:**
- Files: `pasarapi-mini-bounty-announcement/src/lib/api.ts`, `pasarapi-mini-bounty-announcement/src/components/PopulationSection.tsx`, `pasarapi-mini-bounty-announcement/src/components/BirthsSection.tsx`, `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx`
- Why fragile: Generic fetches cast unvalidated JSON to typed rows; filtered requests can silently retry unfiltered with the same limit, then client-side filters may leave an incomplete or empty latest date. Directory fallbacks can mask network/schema failure as a cached result.
- Safe modification: Check row shape and ordering at the boundary; test filtered, unfiltered, empty, and malformed replies before changing display logic.
- Test coverage: No tracked automated tests for these response paths.

**Global smooth-scroll lifecycle:**
- Files: `clone-reframed-online-website/src/lib/scroll.ts`, `clone-reframed-online-website/src/App.tsx`
- Why fragile: Module-global Lenis and an uncancellable rAF loop survive unmount; stop/start directly overwrite root `overflow` rather than restoring its previous value.
- Safe modification: Return a teardown that destroys Lenis and cancels its frame, and preserve/restore the existing overflow style; exercise preloader and menu transitions.
- Test coverage: No tracked automated tests for scroll locking.

## Scaling Limits

**Bundled catalogue and client-side filtering:**
- Current capacity: The tracked snapshot is imported directly into `aimirah-mixtape/src/data/catalog.ts`; `aimirah-mixtape/src/components/ComponentGrid.tsx` filters and sorts the full selected list before paginating to 24 items.
- Limit: Bundle size and per-keystroke filter/sort work rise with snapshot size; no measured ceiling is documented.
- Scaling path: Measure build size and typing latency first; only then split catalogue payloads or move search to an index/server.

**Directory truncation:**
- Current capacity: The directory renders only the first 60 matching entries in `pasarapi-mini-bounty-announcement/src/components/DirectorySection.tsx`.
- Limit: Matches after entry 60 cannot be reached via pagination, despite the displayed `SHOWING ... / ... MATCHES` count.
- Scaling path: Add a small load-more or page control when live catalogue results exceed 60.

## Dependencies at Risk

**Five separately locked frontend dependency trees:**
- Risk: React/Vite/Tailwind and supporting packages repeat across five lockfiles; a fix applied in one app does not update the others. No specific vulnerability is asserted from source inspection alone.
- Impact: Dependency-alert remediation or plugin upgrades can leave sibling apps on differing resolutions.
- Migration plan: Audit all five lockfiles when an alert arrives, update only affected packages in their own app, and build/typecheck each changed app; see `aimirah-mixtape/package-lock.json`, `clone-reframed-online-website/package-lock.json`, `clone-string-tune-website/package-lock.json`, `kdmirah-studio/package-lock.json`, `pasarapi-mini-bounty-announcement/package-lock.json`.

## Missing Critical Features

**Verified data provenance for displayed metrics:**
- Problem: Counters increase using random timers and curated skills/stars/counts are constants, while their labels suggest installs, downloads, and merged PRs rather than illustrative values.
- Blocks: Trustworthy live analytics or claims based on those displayed numbers.
- Files: `aimirah-mixtape/src/components/HomeStats.tsx`, `aimirah-mixtape/src/data/catalog.ts`, `kdmirah-studio/src/lib/content.ts`

## Test Coverage Gaps

**No tracked automated tests or CI verification:**
- What's not tested: Slider keyboard/ARIA synchronization, persisted collection hydration and script safety, catalogue response variants, directory link validation, and modal/scroll behavior.
- Files: `clone-reframed-online-website/src/components/ExperimentSection.tsx`, `aimirah-mixtape/src/App.tsx`, `aimirah-mixtape/src/components/StackBuilderSidebar.tsx`, `pasarapi-mini-bounty-announcement/src/lib/api.ts`, `kdmirah-studio/src/components/VideoModal.tsx`
- Risk: Production builds can pass while interactions, data semantics, and security boundaries regress.
- Priority: High for generated commands and data parsing; Medium for UI animation and modal behavior.

---

*Concerns audit: 2026-11-03*
