/**
 * Single source of truth for outbound links to the sibling projects.
 *
 * Deployment targets (see README "Deployment"):
 * - aimirah.me            → clone-reframed-online-website (GitHub Pages, public/CNAME)
 * - mi4inc.com            → clone-string-tune-website (Vercel)
 * - aimirah.mixtape       → aimirah-mixtape
 * - kdmirah.studio        → kdmirah-studio
 * - pasarapi              → pasarapi-mini-bounty-announcement
 *
 * Preview URLs are intentionally kept out of component bodies so a rotated
 * preview deployment only needs updating here (CONCERNS.md #7).
 */
export const STANDALONE_PROJECTS = [
  {
    index: "01",
    title: "MI4Inc. Motion Study",
    href: "https://mi4inc.com",
  },
  {
    index: "02",
    title: "Aimirah Component Showcase",
    href: "https://aimirah.mixtape",
  },
] as const;
