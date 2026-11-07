---
name: Atomic GitHub Release
description: Publish reviewed repository changes as meaningful commits, push a branch, and merge a checked pull request.
---

# Atomic GitHub release

Use this workflow when the user requests a GitHub push, pull request, or merge.

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
