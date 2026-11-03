---
status: partial
phase: 01-live-standalone-project-links
source:
  - 01-01-SUMMARY.md
started: 2026-11-04T07:16:41+08:00
updated: 2026-11-04T07:17:48+08:00
---

## Current Test

[testing paused — production deployment required]

## Tests

### 1. Three ordered standalone links
expected: PASAR.DATA, MI4Inc. Motion Study, and kdmirah Studio appear in order, with their exact reachable destinations and safe new-tab links.
result: pass
source: automated
coverage_id: links

### 2. Mobile, keyboard, and screen-reader interaction
expected: At narrow mobile width, the three full directory rows fit without clipping. Each link opens its intended site in a new tab. Tab reaches them in order with visible focus; Enter activates each. A screen reader announces each full title and the new-tab notice, without the decorative arrow.
result: pass
source: user
coverage_id: mobile-interaction

### 3. Production visitor flow
expected: After a normal merge and deployment, aimirah.me shows the same three links in order. Visitors can open each live destination; no unresolved mixtape link appears.
result: blocked
blocked_by: release-build
reason: Production still uses main; the feature branch is not deployed.
coverage_id: live-deployment

## Summary

total: 3
passed: 2
issues: 0
pending: 0
skipped: 0
blocked: 1

## Gaps

[none yet]
