---
phase: 01-live-standalone-project-links
reviewed: 2026-11-03T23:06:12Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - clone-reframed-online-website/src/lib/links.ts
  - clone-reframed-online-website/src/components/IndexSection.tsx
  - tests/standalone-project-links.test.ts
findings:
  critical: 0
  warning: 1
  info: 0
  total: 1
  necessity: 0
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-11-03T23:06:12Z
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

The three static destinations, their sole renderer, and the focused server-rendered regression test were reviewed against the Phase 01 plan and UI contract. No source correctness, security, or accessibility defect was established. The test misses one explicitly required rendered property. Actual mobile, keyboard, screen-reader, and production behavior remain separate release checks, not findings inferred from static code.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Rendered project indices are not asserted

**File:** `tests/standalone-project-links.test.ts:28-40`
**Issue:** The test checks `01`, `02`, and `03` only in `realProjects`, then checks each rendered anchor's href, title, new-tab attributes, and icon. It never checks that `IndexSection.tsx:144` renders the corresponding index. Removing or misrendering the visible index would leave this regression test passing, although ordered, visible indices are an explicit Phase 01 requirement.
**Fix:** In the existing per-link loop, assert that `content` includes the rendered index span with `realProjects[i].index` (or parse the span and compare its text), rather than relying only on the data-array assertion.

## Review finding resolved

WR-01 identified a missing rendered-index assertion. Commit `3b6b5c5` adds it; the focused tests and typecheck passed. The review preserves the original finding for traceability.

## Checks

- `npm test -- --run tests/standalone-project-links.test.ts`: 2 tests passed.
- `npm --prefix clone-reframed-online-website run build`: TypeScript and Vite build passed.
- `App.tsx` renders `IndexSection`; `IndexSection` is the only source caller of `STANDALONE_PROJECTS` in the primary site's source tree.

---
_Reviewer: gsd-code-reviewer_
_Depth: standard_
