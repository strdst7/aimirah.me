# aimirah.me — Standalone Project Links

## What This Is

aimirah.me is the kdmirah Digital Inspiration Lab. Its primary site presents four visual experiments and a directory of separately deployed projects. This milestone gives visitors working links to the live projects already held in the repository without moving their applications into the primary site.

## Core Value

Visitors can open each live standalone project from the aimirah.me project directory.

## Requirements

### Validated

- ✓ The primary site displays four draggable before-and-after experiments — existing in `clone-reframed-online-website/src/`.
- ✓ The primary site has an archive/index section — existing in `clone-reframed-online-website/src/components/IndexSection.tsx`.
- ✓ The repository contains standalone application directories — existing in `clone-string-tune-website/`, `aimirah-mixtape/`, `kdmirah-studio/`, and `pasarapi-mini-bounty-announcement/`.

### Active

- [ ] Show links to the currently reachable MI4Inc. motion study, kdmirah studio, and PASAR.DATA dashboard on the primary site's standalone-project directory.
- [ ] Use each project's checked live URL and keep links accessible on keyboard and mobile.
- [ ] Avoid presenting the non-resolving `https://aimirah.mixtape/` as a live destination.

### Out of Scope

- Deploying or rebuilding the standalone apps — this milestone links existing live deployments.
- Publishing mixtape without a reachable destination — add its link after deployment and a live URL check.
- Changing the primary site's hosting or domain — link updates do not require a migration.

## Context

- Repository: `https://github.com/strdst7/aimirah.me`.
- Main checkout: `/Users/nuramirahmohdkamil/aimirah.me` on `fix/dependency-alerts`; `main` is newer. Reconcile with `main` before implementing links. Never force-push.
- The remote `main` branch contains a standalone-project section in `clone-reframed-online-website/src/components/IndexSection.tsx` and its link data in `clone-reframed-online-website/src/lib/links.ts`. The current checkout predates those files. Reuse the `main` implementation rather than recreate it.
- Live URL checks on 2026-11-03: `https://mi4inc.com` returned HTTP 200 and redirected to `https://www.mi4inc.com/`; `https://kdmirah-studio.vercel.app/` and `https://pasarapi-mini-bounty-announcement.vercel.app/` returned HTTP 200. `https://aimirah.mixtape/` did not resolve.
- `.planning/codebase/` maps the older `fix/dependency-alerts` checkout. Its source baseline predates current remote `main`.

## Constraints

- **Deployment:** Keep each standalone site's own host; only link from aimirah.me.
- **Links:** Use checked live destinations; do not present a placeholder domain as deployed.
- **Git:** Preserve existing remote history and separate deployments. Rebase or merge only after inspecting differences.
- **Accessibility:** Existing link rows must remain keyboard reachable and disclose new-tab behavior.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Link three reachable projects first | They have working public destinations | — Pending |
| Defer mixtape link | Its listed domain does not resolve | — Pending |
| Reuse the link directory on `main` | Avoid duplicate UI or link sources | — Pending |

## Evolution

Review requirements, core value, context, and decisions after each phase and milestone. Move shipped and checked active requirements to Validated. Record changed scope under Out of Scope with a reason.

---
*Last updated: 2026-11-03 after initialization*
