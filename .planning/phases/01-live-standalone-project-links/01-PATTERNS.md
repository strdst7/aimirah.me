# Phase 01: Live standalone project links — Pattern Map

**Mapped:** 2026-11-04
**Baseline:** `origin/main` (inspected without changing the `fix/dependency-alerts` checkout)
**Files classified:** 2; **analogs found:** 2/2

## File Classification

| File to modify | Role / data flow | Closest tracked analog | Match |
|---|---|---|---|
| `clone-reframed-online-website/src/lib/links.ts` | Static link data / render-time transform | Same file on `origin/main`, lines 14–25 | Exact; absent on checkout |
| `clone-reframed-online-website/src/components/IndexSection.tsx` | React component / static data-to-DOM and native outbound navigation | Same file on `origin/main`, lines 122–146 | Exact; checkout has older inline rows |

Both analog paths are tracked on `origin/main` (`git ls-tree`); `IndexSection.tsx` is also tracked locally (`git ls-files`). No new component, service, fetch layer, route, deployment config, or dependency is needed.

## Pattern Assignments

### `clone-reframed-online-website/src/lib/links.ts`

`origin/main` lines 14–25 export a literal `as const` array with `index`, `title`, and `href`; the component imports it instead of embedding URLs. Keep that structure, replace **both** existing records (including the unresolved mixtape) with three records in the locked order. The target shape is:

```ts
export const STANDALONE_PROJECTS = [
  { index: "01", title: "PASAR.DATA", href: "https://pasarapi-mini-bounty-announcement.vercel.app/" },
  { index: "02", title: "MI4Inc. Motion Study", href: "https://mi4inc.com" },
  { index: "03", title: "kdmirah Studio", href: "https://kdmirah-studio.vercel.app/" },
] as const;
```

These URLs are phase decisions, not fresh availability checks; recheck before release. Do not copy `origin/main`'s `https://aimirah.mixtape` entry, and do not introduce the unresolved `https://aimirah.mixtape/` variant. The header comment on `origin/main` lines 1–12 describes nominal deployments, some not live; keep it consistent with the actual published records rather than treating nominal domains as checked endpoints.

### `clone-reframed-online-website/src/components/IndexSection.tsx`

`origin/main` lines 1–6 import `STANDALONE_PROJECTS` from `../lib/links`; lines 122–146 own the existing section. Reuse the section heading, intro, list, and row rendering rather than adding a second directory. Core excerpt (`origin/main` lines 129–145):

```tsx
<ul className="mt-10 border-t border-bone/10">
  {STANDALONE_PROJECTS.map((project) => (
    <li className="border-b border-bone/10" key={project.index}>
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-5 py-6 text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal md:gap-10"
      >
        <span className="font-mono text-xs text-signal">{project.index}</span>
        <span className="font-display text-2xl uppercase group-hover:text-signal md:text-4xl">{project.title}</span>
        <span className="sr-only">(opens in a new tab)</span>
        <ArrowUpRight size={20} aria-hidden className="ml-auto shrink-0" />
      </a>
    </li>
  ))}
</ul>
```

The native anchor provides Tab/Enter behavior, full-row touch area, visible focus outline, safe new-tab attributes, screen-reader disclosure, and decorative arrow. Keep those intact. Check the longest full title on a narrow viewport; if it overflows, let the title shrink/wrap (`min-w-0` on its span) while retaining the arrow's `shrink-0`. The UI contract's zero-entry copy is only relevant if there are no verified destinations; do not add a runtime fetch/error state for bundled constants.

## Branch Reconciliation / Shared Patterns

- Current checkout: `fix/dependency-alerts` at `d438c7d`; local `IndexSection.tsx` lines 117–151 already has the same heading and accessible row styling but hard-codes two older preview URLs. `src/lib/links.ts` does not exist locally. `origin/main` at `7e95918` supplies the data import/map and unrelated image attributes in `IndexSection.tsx` lines 67–70.
- The branches diverged (HEAD has 22 commits not in `origin/main`; `origin/main` has 21 not in HEAD, as of this mapping). Inspect/fetch remote state immediately before reconciliation; merge or rebase preserving both histories, resolve conflicts without reverting unrelated main changes, and do not force-push. Only then change the existing data records and, if needed, minimal mobile wrapping styles.
- `origin/main:README.md` lines 88–105 says primary site uses GitHub Pages and outbound sibling URLs belong in `src/lib/links.ts`, never inline in the component. The checkout root README is older and lacks this monorepo guidance.
- No auth, validation, API error handling, or test analog applies: these are bundled static links. Verify the three destinations and rendered ordering, exact `href`s, Tab/Enter/new-tab disclosure, mobile wrapping, and absence of mixtape before release.

## No Analog Found

None. No `RESEARCH.md` exists because external research was deliberately skipped.

## Metadata

**Search scope:** The two source paths on checkout and `origin/main`, checkout `src/lib/data.ts` (static array convention), and `origin/main:README.md` (deployment boundary). **Source files inspected:** 3 distinct source files (`links.ts`, `IndexSection.tsx`, `data.ts`); only the first two require edits. Source was not modified.
