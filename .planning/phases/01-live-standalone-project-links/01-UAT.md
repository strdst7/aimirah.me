---
status: testing
phase: 01-live-standalone-project-links
source:
  - 01-01-SUMMARY.md
started: 2026-11-04T07:16:41+08:00
updated: 2026-11-04T08:03:59+08:00
---

## Current Test

number: 2
name: Mobile touch navigation
expected: |
  At a narrow mobile width, all three project titles, indices, and arrows fit. Tap each row and check that its intended live site opens in a new tab.
awaiting: user response

## Tests

### 1. Three ordered standalone links
expected: PASAR.DATA, MI4Inc. Motion Study, and kdmirah Studio appear in order, with their exact reachable destinations and safe new-tab links.
result: pass
source: automated
coverage_id: links

### 2. Mobile touch navigation
expected: At a narrow mobile width, all three project titles, indices, and arrows fit. Tap each row and check that its intended live site opens in a new tab.
result: [pending]
coverage_id: mobile-interaction

### 3. Keyboard navigation
expected: Tab reaches the three project links in index order. Each has visible focus, and Enter opens its intended site in a new tab.
result: [pending]
coverage_id: mobile-interaction

### 4. Screen-reader names
expected: A screen reader announces each complete project title and new-tab notice, without announcing the decorative arrow.
result: [pending]
coverage_id: mobile-interaction

### 5. Production visitor flow
expected: After a normal merge and deployment, aimirah.me shows the same three links in order. Visitors can open each live destination; no unresolved mixtape link appears.
result: blocked
blocked_by: release-build
reason: Production still uses main; the feature branch is not deployed.
coverage_id: live-deployment

## Evidence

- Local Chromium measured 80–112px directory row heights at 320px and exposed full link names in its accessibility tree.
- A prior `pass` answered a composite mobile, keyboard, and screen-reader prompt. It did not identify which actions the user performed. Separate checks remain pending.
- Production `aimirah.me` returned HTTP 200, but `origin/main` is still behind this feature branch. HTTP status does not show these links are deployed.

## Summary

total: 5
passed: 1
issues: 0
pending: 3
skipped: 0
blocked: 1

## Gaps

[none yet]
