---
name: Atomic GitHub Release
description: Publish each completed aimirah.me update through a checked pull request and production deployment unless instructed otherwise.
---

# Atomic GitHub release

For `aimirah.me`, run this workflow after each completed update unless the user requests local-only work.
Use it when the user requests a GitHub push, pull request, merge, or deployment.

1. Read the project instructions and run `git status --short --branch`.
2. Fetch `origin` and inspect the branch diff against `origin/main`.
3. Preserve existing commits and unrelated work. Never reset or force-push.
4. Split new changes by independent purpose. Stage exact files or hunks.
5. Commit each working change after its relevant checks pass.
6. Keep related documentation and code together when separating them breaks context.
7. Never split a word, letter, or unchanged file to inflate contribution counts.
8. Never backdate commits or change author identity for contribution counts.
9. Check `gh auth status` before pushing. Stop if authentication fails.
10. Push the branch, then create or update a pull request into `main`.
11. Read required reviews, branch protection, and CI results before merging.
12. Stop when approval or a required check is missing. Report the blocker.
13. Merge through GitHub only after the required checks pass.
14. Fetch `origin/main` and check that the merge contains the intended changes.
15. Check the production site separately. A merge does not prove deployment.

For `aimirah.me`, run `npm test`, the primary-site typecheck, and its build.
The primary site lives in `clone-reframed-online-website`.
For primary-site changes, deploy its built `dist` through the existing Vercel project.
Check the linked project and domain owner before each deployment.
Use a staged production deployment and check its content before promotion.
Promote the checked deployment, then fetch `https://aimirah.me` and check the new content.
Stop on authentication, CI, deployment, or live-site errors. Report the exact blocker.
