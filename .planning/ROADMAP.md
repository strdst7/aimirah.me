# Roadmap: aimirah.me — Standalone Project Links

## Overview

Deliver one vertical MVP: reconcile the older feature branch with remote `main` without discarding either history, then reuse `main`'s standalone-project directory and link data to expose only the three checked live destinations. Keep the standalone applications on their existing hosts; do not create another directory or publish the unresolved mixtape URL. Domain research was intentionally skipped.

## Phases

- [ ] **Phase 1: Live standalone project links** - Visitors can open the three reachable projects from the existing directory, on keyboard and mobile, without a dead mixtape link.

## Phase Details

### Phase 1: Live standalone project links
**Goal**: Visitors can find and open each reachable standalone project from aimirah.me without encountering an unresolved destination.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: LINK-01, LINK-02, LINK-03, LINK-04, LINK-05
**Execution boundary**: First inspect branch differences and reconcile `fix/dependency-alerts` with remote `main` while preserving history (no force-push). Reuse `clone-reframed-online-website/src/components/IndexSection.tsx` and its `src/lib/links.ts` data from `main`; do not replace the section, add a second directory, move apps, or alter their deployments. Then use the checked destinations: `https://mi4inc.com` (redirects to `https://www.mi4inc.com/`), `https://kdmirah-studio.vercel.app/`, and `https://pasarapi-mini-bounty-announcement.vercel.app/`. Exclude `https://aimirah.mixtape/` until it resolves. Validate destinations and the primary site's rendered links before calling the phase complete.
**Success Criteria** (what must be TRUE):
  1. A visitor can open MI4Inc. Motion Study from the standalone-project section and arrive at its reachable live site.
  2. A visitor can open kdmirah studio from that section and arrive at its reachable live site.
  3. A visitor can open PASAR.DATA from that section and arrive at its reachable live site.
  4. A visitor can identify and activate each of those links with a keyboard and on a mobile browser, including awareness that each opens a new tab.
  5. A visitor does not see `https://aimirah.mixtape/` offered as a live project destination.
**Plans**: 1/1 plans executed
- [x] 01-01-PLAN.md
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Live standalone project links | 1/1 | In Progress | - |
