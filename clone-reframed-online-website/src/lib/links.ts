/**
 * Single source of truth for outbound links to the sibling projects.
 *
 * Deployment targets (see README "Deployment"):
 * - aimirah.me            → clone-reframed-online-website (GitHub Pages, public/CNAME)
 * - mi4inc.com            → clone-string-tune-website (Vercel)
 * - pasarapi-mini-bounty-announcement.vercel.app → pasarapi-mini-bounty-announcement
 * - kdmirah-studio.vercel.app → kdmirah-studio
 * - aimirah-mixtape awaits a reachable public destination.
 *
 * Preview URLs are intentionally kept out of component bodies so a rotated
 * preview deployment only needs updating here (CONCERNS.md #7).
 */
export const STANDALONE_PROJECTS = [
  {
    index: "01",
    title: "PASAR.DATA",
    href: "https://pasarapi-mini-bounty-announcement.vercel.app/",
  },
  {
    index: "02",
    title: "MI4Inc. Motion Study",
    href: "https://mi4inc.com",
  },
  {
    index: "03",
    title: "kdmirah Studio",
    href: "https://kdmirah-studio.vercel.app/",
  },
] as const;

export const CREATIVE_GARAGE_PROJECTS = [
  {
    index: "01",
    title: "Mirage",
    href: "https://mirage-miii.vercel.app/",
  },
  {
    index: "02",
    title: "Nocturnal Dream",
    href: "https://nocturnal-dream.vercel.app/",
  },
  {
    index: "03",
    title: "MI4Inc. Motion Study — Vercel",
    href: "https://clone-string-tune-website-gold.vercel.app/",
  },
  {
    index: "04",
    title: "4IM/Flux",
    href: "https://www.aimirah.dev/",
  },
  {
    index: "05",
    title: "keyOS",
    href: "https://key-os-aimirah-3d-icon.vercel.app/",
  },
  {
    index: "06",
    title: "AimIrah Vault",
    href: "https://kdmirah.warg-iwato.ts.net/",
  },
  {
    index: "07",
    title: "Aimirah — MI4 Inc.",
    href: "https://aimirah-mi4.netlify.app/",
  },
  {
    index: "08",
    title: "kdmirah Studio",
    href: "https://kdmirah-studio.vercel.app/",
  },
] as const;
