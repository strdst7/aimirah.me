---
phase: 01-live-standalone-project-links
verified: 2026-11-03T23:04:52Z
status: human_needed
score: 5/9 must-haves verified
covered_files:
  - .planning/phases/01-live-standalone-project-links/01-01-PLAN.md
  - .planning/phases/01-live-standalone-project-links/01-01-SUMMARY.md
  - clone-reframed-online-website/src/components/IndexSection.tsx
  - clone-reframed-online-website/src/lib/links.ts
  - tests/standalone-project-links.test.ts
covered_digest: "v4:sha256:6b13739dfa5f1060658528f6e2fee7cb2036c5963d7fcb6f69f9bf958afd34ed"
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "After normal review/merge and deployment, open the production aimirah.me standalone-project section."
    expected: "The live page, not merely this feature branch, shows the three full names in the specified order and no mixtape destination."
    why_human: "Main/production was not updated; local source and a build cannot prove the live page."
  - test: "At narrow mobile width and desktop, inspect each row and tap each link."
    expected: "Full directory titles, index, and arrow fit within the row; each row is at least 44px high. Check the separate page-wide horizontal overflow and actual touch navigation. Each destination opens the intended site in a new tab."
    why_human: "Local Chromium measured the directory geometry. Touch navigation and the separate page-wide overflow remain unchecked."
  - test: "Tab through the standalone links and activate each with Enter."
    expected: "All three native anchors receive focus in index order with a visible signal outline and open the intended destination in a new tab."
    why_human: "No interactive keyboard/browser session was performed."
  - test: "Use a screen reader on each standalone link."
    expected: "It announces each complete project name and '(opens in a new tab)' without announcing the decorative arrow."
    why_human: "Markup supports this, but no screen-reader/accessibility-tree check was performed."
---

# Phase 01: Live standalone project links — Verification

**Phase goal:** Visitors can find and open each reachable standalone project from aimirah.me without encountering an unresolved destination.
**Status:** `human_needed`. The feature-branch implementation and automated checks pass; actual mobile/keyboard/screen-reader operation and the production visitor outcome remain unverified. This is not a production release sign-off.

## User Flow Coverage

User story from the plan: As a visitor to aimirah.me, I want to open each reachable standalone project from its existing directory, so that I can reach the live work without encountering a dead destination.

| Step | Expected | Independent evidence | Status |
|---|---|---|---|
| Open the primary site's directory | Existing Standalone projects heading and intro, followed by three rows | `src/main.tsx` mounts `App.tsx`; `App.tsx:79` renders `IndexSection`; `IndexSection.tsx:122-152` renders the directory; focused rendered test passes | Verified on branch; production pending |
| Identify the projects | PASAR.DATA (01), MI4Inc. Motion Study (02), kdmirah Studio (03) | `links.ts:14-30`; `IndexSection.tsx:136-147`; focused test checks data and rendered titles/URLs | Verified in rendered markup |
| Open each live destination | Native full-row links open three checked live hosts | Anchors in `IndexSection.tsx:138-147`; redirected GET returned 200 for each host | Browser activation and live-site integration pending |
| Avoid a dead destination | No mixtape link or disabled placeholder; empty list shows documented copy | Link records have no mixtape; rendered test excludes it and checks empty state | Verified on branch; production pending |
| Reach the outcome on aimirah.me | Visitor can navigate from the live primary site to all three projects | Feature branch is pushed, but `origin/main` is not at this commit; no live-site check | Not yet demonstrated |

## Must-Haves and Requirements

ROADMAP success criteria are included alongside distinct PLAN truths; duplicate wording is consolidated. A GET proves the hosts respond now, not that a visitor successfully navigated from production.

| # | Must-have / coverage | Status | Evidence and limitation |
|---|---|---|---|
| 1 | LINK-01: Visitor opens MI4Inc. Motion Study from aimirah.me | UNCERTAIN | Exact anchor href `https://mi4inc.com`; independent GET follows redirect to `https://www.mi4inc.com/` (200). Actual navigation from live primary site not checked. |
| 2 | LINK-02: Visitor opens kdmirah Studio from aimirah.me | UNCERTAIN | Exact anchor href `https://kdmirah-studio.vercel.app/`; GET 200. Live visitor navigation not checked. |
| 3 | LINK-03: Visitor opens PASAR.DATA from aimirah.me | UNCERTAIN | Exact anchor href `https://pasarapi-mini-bounty-announcement.vercel.app/`; GET 200. Live visitor navigation not checked. |
| 4 | LINK-04: Identify/activate all three via keyboard/mobile, aware of new tab | UNCERTAIN | Native anchors, `target="_blank"`, safe rel, sr-only disclosure, `aria-hidden` icon and focus-visible class are present/tested in markup; no actual keyboard, touch or screen-reader test. |
| 5 | LINK-05: No unresolved mixtape live destination | VERIFIED on branch | Exactly three records, no mixtape href; focused rendered test excludes it. Production status separately pending. |
| 6 | D-01/D-02: Full titles and indices 01–03 in exact order | VERIFIED | Data records and `.map` renderer inspected; focused rendered test asserts names, visible indices, URLs, and count. |
| 7 | LINK-05: Zero-entry copy and no dummy link; partial list uses same row | VERIFIED | `IndexSection.tsx:129-153` branches on array length, maps positive entries; empty test asserts both exact strings and zero anchors. One-entry/partial rendering not separately tested. |
| 8 | D-03/D-05/D-06: Existing single source/renderer, preserved ancestry, separately pushed changes | VERIFIED | `main.tsx → App.tsx → IndexSection.tsx → links.ts` inspected; `git show 30a2e24` has both branch parents; `origin/main` is an ancestor of HEAD, `origin/fix/dependency-alerts` matches local HEAD; distinct feature/test commits appear in history. Remote push force flags cannot be independently inferred from final history alone. |
| 9 | Narrow mobile directory layout: full titles, visible index/arrow, 44px+ row | VERIFIED locally at 320px | Chromium measured 80–112px row heights and complete title/index/arrow bounds inside the directory. Page-wide horizontal overflow of 28px remains outside the directory. Touch navigation remains untested. |

**Score:** 5/9 checked against the phase's visitor-facing wording; four await observed browser or production behavior. `behavior_unverified: 0` describes state-transition invariants only. It does not clear interaction or deployment checks.

## Artifacts, Wiring, and UI Contract

| Artifact/link | Assessment |
|---|---|
| `clone-reframed-online-website/src/lib/links.ts` | Substantive three-record static data source, exact URLs and order; no unresolved record. |
| `clone-reframed-online-website/src/components/IndexSection.tsx` | Existing sole renderer imports that data and maps it into native `<ul><li><a>` rows; supports empty branch. Heading, intro, dark tokens, dividers, font classes, 20px/40px horizontal padding and `py-6` preserved. |
| `tests/standalone-project-links.test.ts` | Server-rendered tests check exact URLs, names, rendered indices, attributes, and empty state. They do not simulate touch, screen-reader speech, or production deployment. |
| Data flow | `main.tsx → App.tsx → IndexSection.tsx → STANDALONE_PROJECTS → href/title/index`. Bundled constants are the intended data source; no fetch, second directory or runtime error state required. |

The rendered regression test checks the visible indices inside each link. A local Chromium check at 320px showed directory rows within its container, full titles and arrows, and 80–112px row heights. A 320px page-wide scroll width of 348px remains outside this directory and needs separate investigation. The accessibility tree exposed all three full names and new-tab notices. DOM focus showed a 2px signal outline. Actual Tab/Enter traversal, screen-reader speech, and production navigation remain untested.

## Independent Checks

| Check | Observed result |
|---|---|
| `npm test -- --run tests/standalone-project-links.test.ts` | 1 file, 2 tests passed |
| `npm test` | 4 files, 22 tests passed |
| `npm run typecheck` | Five application workspaces passed |
| `npm --prefix clone-reframed-online-website run build` | TypeScript and Vite build passed (2076 modules transformed) |
| Redirect-following HTTP GET of the three exact URLs | 200, 200 (MI4Inc. redirects to `www.mi4inc.com`), 200 |
| Git ancestry/branch read | Merge commit has both parents; `origin/main` ancestor of feature HEAD; remote feature HEAD matches local |
| Anti-pattern/test audit | No unresolved TBD/FIXME/XXX or skipped focused tests in the changed source/test files |
| Browser, mobile, keyboard and screen reader | Local Chromium measured 320px directory rows and computed focus outline. Accessibility tree exposed link names. Touch, actual Tab/Enter traversal, and screen-reader speech remain untested. Page-wide overflow: 348px at 320px viewport, outside the directory. |
| Production aimirah.me and main | Not updated/verified in this phase; branch publication is not deployment |

## Human Verification Required

1. After review and normal merge/deployment, inspect **production aimirah.me**. Confirm exact three ordered full names, indices, safe URLs and no mixtape row. Repeat the URL health check immediately before release; a 200 at verification time is not a future availability guarantee.
2. At a narrow mobile viewport and desktop, check complete titles, index, arrow, and full-row tap area. Local Chromium measured the directory rows at 320px, but page-wide overflow reached 348px. Find the overflow source before release. Test each new-tab destination with a real tap.
3. Tab through rows in order; check visible focus and Enter navigation for all three.
4. With a screen reader, check each accessible name includes the full project title and new-tab disclosure and excludes the arrow.

No changed-source defect or failing automated check was found. Local Chromium did reveal 28px of page-wide overflow at 320px, outside the project directory. These remaining checks are release gates. LINK-06 remains v2 scope.

_Initial independent report: gsd-verifier. Parent added the post-review index test and local Chromium findings; no deployment._
