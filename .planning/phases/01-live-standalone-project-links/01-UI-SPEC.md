---
phase: "01"
slug: "live-standalone-project-links"
status: draft
shadcn_initialized: false
preset: none
created: "2026-11-04"
---

# Phase 01 — UI Design Contract

> Scope: the existing standalone-project directory inside the primary site's `IndexSection`, not a new page or redesign. Source of truth: `01-CONTEXT.md` D-01–D-04, LINK-01–05, and the `origin/main` implementation inspected without switching branches. The current `fix/dependency-alerts` checkout predates this section; implement only after the separate branch reconciliation, preserving history.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — reuse existing bespoke Tailwind v4 utilities and `@theme` tokens in `clone-reframed-online-website/src/index.css`; do not initialize shadcn for three static links |
| Preset | not applicable |
| Component library | none; reuse `IndexSection.tsx` and native `<ul><li><a>` rows from `origin/main` |
| Icon library | existing `lucide-react` `ArrowUpRight` |
| Font | existing Anton display, Space Grotesk body, Space Mono index/label; no new font |

Primary visual anchor: the full-width, border-separated Anton title links for PASAR.DATA → MI4Inc. Motion Study → kdmirah Studio, beneath the existing “Standalone projects” heading; no new imagery or card treatment.

---

## Spacing Scale

Use the existing `IndexSection.tsx` values rather than a new spacing layer. All declared spacing increments below are multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Minimum inline separation where needed; not a new row style |
| sm | 8px | Compact text/icon spacing if needed |
| md | 16px | Default spacing if needed |
| lg | 24px | Existing link row vertical padding (`py-6`) |
| xl | 32px | Existing section horizontal padding at desktop (`md:px-10` is 40px; see exceptions) |
| 2xl | 48px | Existing directory top padding (`pt-12`) |
| 3xl | 64px | Section separation where already used |

Exceptions already in the section: mobile horizontal padding 20px (`px-5`), desktop 40px (`md:px-10`), row gap 20px/40px (`gap-5 md:gap-10`), list top margin 40px (`mt-10`), subsection separation 96px/144px (`mt-24 md:mt-36`). Keep these exactly rather than forcing the generic scale. Preserve full-row tap/click area with at least 44px usable height; existing `py-6` exceeds this.

---

## Typography

Four roles, four distinct sizes; only regular 400 is needed (two-weight maximum). Indices reuse the existing `text-sm` body size; all other responsive sizes preserve the existing section, not a new site-wide type scale.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body / explanatory sentence | 14px (`text-sm`) | 400 Space Grotesk | normal existing line-height (~1.43); allow wrapping |
| Label / numeric index | 14px (`text-sm`) | 400 Space Mono | normal existing line-height (~1.43) |
| Project title | 24px mobile / 36px desktop (`text-2xl md:text-4xl`) | 400 Anton (`font-display`), uppercase presentation | normal existing line-height; allow full name to wrap |
| Section heading | 36px mobile / 60px desktop (`text-4xl md:text-6xl`) | 400 Anton, uppercase presentation | normal existing line-height |

Visible case follows the existing uppercase styling; record titles remain exactly “PASAR.DATA”, “MI4Inc. Motion Study”, and “kdmirah Studio”, preserving accessible text content and spelling. Do not abbreviate or clip long titles.

---

## Color

The proportions describe the existing dark composition, not quotas requiring new surfaces.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (~60%) | `ink` `#050505` | Existing page/section background |
| Secondary (~30%) | `bone` `#ece9e2` for foreground; `coal` `#0d0d0c` where existing adjacent surfaces use it | Default text and existing neighboring preview surface; no new cards or background blocks |
| Accent (~10%) | `signal` `#ff4d00` | Existing numeric indices, keyboard focus outline, and project-title hover state |
| Destructive | none | No destructive action in this phase; do not add a destructive color |

Accent reserved for: the row indices, focused link outline, and hovered title. Keep existing `border-bone/10` dividers, `text-bone/70` description, `text-bone` link label, and `ArrowUpRight` icon. Focus must be visible without hover; touch must not depend on hover color to discover a link.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Section heading | `Standalone projects` (existing) |
| Intro | `Separate sites from the kdmirah lab. Each opens its own deployed project.` (existing) |
| Primary CTA / link labels | `PASAR.DATA`; `MI4Inc. Motion Study`; `kdmirah Studio` — title text itself is the link; no separate button |
| New-tab disclosure | `(opens in a new tab)` within every link's accessible name, as on `origin/main`; keep `ArrowUpRight` decorative (`aria-hidden`) |
| Empty state heading | `No live standalone projects yet` — only if the list genuinely becomes empty; not shown for the three required entries |
| Empty state body | `Check back once a project is live.` — do not turn an unresolved URL into a placeholder link |
| Error state | No runtime fetch/error UI for a static list. Before release, if a target cannot be reached, do not publish that entry as live; recheck its deployment and destination. |
| Destructive confirmation | Not applicable — no destructive controls or confirmation dialogs |

---

## UI Considerations

The probe covered two surfaces: E1, the static project list (list and navigation), and E2, each native outbound title link (control and text). The following resolutions are explicit unless marked dismissed.

| Element | Category | Status | Verification | Resolution / Reason |
|---------|----------|--------|--------------|---------------------|
| E1 | populated | resolved | explicit | Render exactly three full-title rows in order: PASAR.DATA → MI4Inc. Motion Study → kdmirah Studio, indexed 01–03. |
| E1 | zero-one-many | resolved | explicit | Reuse the same full-width row for one or more entries; show the documented empty copy for zero. |
| E1 | empty | resolved | explicit | If no verified destinations remain, show `No live standalone projects yet` and `Check back once a project is live.` |
| E1 | partial | resolved | explicit | Omit unresolved destinations, including `https://aimirah.mixtape/`; never render a disabled or placeholder row. |
| E1 | overflow | resolved | explicit | Keep rows in document flow with no horizontal scrolling at mobile width. |
| E1 | long-text | resolved | explicit | Wrap full names without clipping titles, index, or arrow on narrow screens. |
| E1 | loading | dismissed | — | Entries are bundled constants; the list does not fetch data. |
| E1 | error | dismissed | — | The list has no runtime request; check destinations before publishing. |
| E2 | overflow | resolved | explicit | The full-row link reflows within the mobile viewport without horizontal scrolling. |
| E2 | long-text | resolved | explicit | The complete link name remains visible and its new-tab disclosure remains in the accessible name. |
| E2 | loading | dismissed | — | The browser owns navigation/loading in the new tab. |
| E2 | error | dismissed | — | The destination browser tab owns navigation errors; check URL health before publishing. |

Each anchor remains Tab reachable in row order. Enter opens its exact `href` in a new tab with `target="_blank"` and `rel="noopener noreferrer"`. Preserve the `focus-visible` signal outline and the screen-reader new-tab disclosure. The full row is a touch target without hover dependency.

The intended destinations are PASAR.DATA → `https://pasarapi-mini-bounty-announcement.vercel.app/`, MI4Inc. Motion Study → `https://mi4inc.com`, and kdmirah Studio → `https://kdmirah-studio.vercel.app/`. Recheck before release. Do not change standalone applications or their hosts.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | Not applicable: no shadcn initialization, registry, or new UI dependency; reuse native anchors and existing installed icon |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS
- [x] Dimension 7 Inventory Provenance: PASS (not applicable: `Tool: none`)

**Approval:** UI checker verified all seven dimensions on 2026-11-04. The post-check UI Considerations probe resolved twelve applicable states.
