# Phase 1: Live standalone project links - Context

**Gathered:** 2026-11-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Link the three reachable standalone projects from the existing aimirah.me project directory. Preserve their separate hosts and the primary site's existing layout. Do not present the unresolved mixtape URL as live.
</domain>

<decisions>
## Implementation Decisions

### Project labels
- **D-01:** Use the full names: “PASAR.DATA”, “MI4Inc. Motion Study”, and “kdmirah Studio”.

### Project ordering
- **D-02:** Show PASAR.DATA first, MI4Inc. Motion Study second, and kdmirah Studio third.

### Existing project decisions
- **D-03:** Reuse the standalone-project section in `clone-reframed-online-website/src/components/IndexSection.tsx` and its single link source in `clone-reframed-online-website/src/lib/links.ts` from `main`.
- **D-04:** Keep links keyboard-accessible and mobile-accessible, with new-tab disclosure. Link only reachable destinations. Leave mixtape pending.
- **D-05:** Preserve remote history when reconciling the older feature branch with `main`; do not force-push.
- **D-06:** Commit and push each completed document or update individually on the working branch.

### Claude's Discretion
- Minor styling within the existing link rows, provided the section's design and accessibility remain intact.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope
- `.planning/PROJECT.md` — project goal and scope boundaries.
- `.planning/REQUIREMENTS.md` — five v1 LINK requirements and deferred mixtape requirement.
- `.planning/ROADMAP.md` — Phase 1 goal, execution boundary, and success criteria.

### Existing code
- `clone-reframed-online-website/src/components/IndexSection.tsx` — project directory and accessible link-row pattern on remote `main`.
- `clone-reframed-online-website/src/lib/links.ts` — outbound project link records on remote `main`.
- `README.md` — deployment boundaries and sibling project identities on remote `main`.

No external specification documents were referenced during discussion.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The `IndexSection` standalone-project list renders each project link with a title, index, and new-tab disclosure on `main`.
- `STANDALONE_PROJECTS` in `src/lib/links.ts` centralizes outbound project destinations on `main`.

### Established Patterns
- The primary site uses React and TypeScript components under `clone-reframed-online-website/src/`.
- The current feature checkout predates the updated `main` implementation; check branch differences before editing.

### Integration Points
- Update the existing `STANDALONE_PROJECTS` records after reconciling the branches. Keep `IndexSection.tsx` as the sole renderer.
</code_context>

<specifics>
## Specific Ideas

- Use full project names, in this order: PASAR.DATA → MI4Inc. Motion Study → kdmirah Studio.
- Known live targets checked during initialization: `https://pasarapi-mini-bounty-announcement.vercel.app/`, `https://mi4inc.com`, and `https://kdmirah-studio.vercel.app/`. Recheck each before release.
</specifics>

<deferred>
## Deferred Ideas

- Link aimirah-mixtape only after its public destination resolves and returns a successful page.
</deferred>

---
*Phase: 01-live-standalone-project-links*
*Context gathered: 2026-11-04*
