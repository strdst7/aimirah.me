import raw from "../data/videos.json";
import type { IconName } from "../components/Icon";

export type CategoryKey = "all" | "motion" | "explainer" | "3d" | "interactive";

export type Video = {
  slug: string;
  author: string;
  duration: string;
  category: string;
  tags: string[];
  prompt: string;
  img: string;
  remakeImg: string;
  video: string;
  remakeVideo: string;
};

export type Skill = {
  slug: string;
  title: string;
  installs: number;
  versions: number;
  output: string;
  tags: string[];
  description: string;
  image: string;
};

export const videos = raw as Video[];

export const CATEGORIES: {
  key: CategoryKey;
  label: string;
  icon: IconName;
  count: number;
}[] = [
  { key: "all", label: "All", icon: "grid", count: videos.length },
  {
    key: "motion",
    label: "Motion graphics",
    icon: "movie",
    count: videos.filter((v) => v.category === "Motion graphics").length,
  },
  {
    key: "explainer",
    label: "Explainers",
    icon: "school",
    count: videos.filter((v) => v.category === "Explainers").length,
  },
  {
    key: "3d",
    label: "3D scenes",
    icon: "box",
    count: videos.filter((v) => v.category === "3D scenes").length,
  },
  {
    key: "interactive",
    label: "Games",
    icon: "gamepad",
    count: videos.filter((v) => v.category === "Games").length,
  },
];

export const CATEGORY_BY_KEY: Record<CategoryKey, string | null> = {
  all: null,
  motion: "Motion graphics",
  explainer: "Explainers",
  "3d": "3D scenes",
  interactive: "Games",
};

export const CATEGORY_ICON: Record<string, IconName> = {
  "Motion graphics": "movie",
  Explainers: "school",
  "3D scenes": "box",
  Games: "gamepad",
};

export function videoBySlug(slug: string): Video | undefined {
  return videos.find((v) => v.slug === slug);
}

function imageFor(slug: string): string {
  return videoBySlug(slug)?.img ?? videos[0].img;
}

export const SKILLS: Skill[] = [
  {
    slug: "bs-creatormotion-type-title-takeover",
    title: "CreatorMotion · Title Scene Takeover",
    installs: 842,
    versions: 7,
    output: "Video",
    tags: ["Motion graphics", "Canvas"],
    description:
      "A kinetic title takeover: oversized type, hard cuts and a full-frame transition that hands your scene over to the next shot.",
    image: imageFor("heyiamnick-119558"),
  },
  {
    slug: "velocity-matched-ui-sting",
    title: "Velocity-Matched UI Sting",
    installs: 981,
    versions: 42,
    output: "Video",
    tags: ["Motion graphics", "GSAP"],
    description:
      "A short, polished sting where interface panels slide at matched velocity, then snap into a logo lockup on the final beat.",
    image: imageFor("0xrapzz-433554"),
  },
  {
    slug: "bs-creatormotion-synchronized-action-checklist",
    title: "CreatorMotion · Synchronized Action Checklist",
    installs: 533,
    versions: 14,
    output: "Video",
    tags: ["Explainers", "Remotion"],
    description:
      "Turn a feature list into a rhythmic checklist: each line strikes in on the beat with a matching click and camera nudge.",
    image: imageFor("smitjaineditor-843957"),
  },
  {
    slug: "manus-2-0-style-launch-video",
    title: "Manus 2.0 Style Launch Video",
    installs: 251,
    versions: 36,
    output: "Video",
    tags: ["Launch", "Three.js"],
    description:
      "Cinematic product launch language: macro 3D objects, tight typography and a code-generated score that hits every cut.",
    image: imageFor("leowenai-125931"),
  },
  {
    slug: "living-halftone-canvas-film",
    title: "Living-Halftone Canvas Film",
    installs: 712,
    versions: 18,
    output: "Video",
    tags: ["Motion graphics", "GSAP"],
    description:
      "A living halftone treatment that breathes across the frame. Pairs a canvas shader with a hand-built, print-inspired type system.",
    image: imageFor("dheepanratnam-706454"),
  },
  {
    slug: "cue-style-launch-video",
    title: "Cue Style Launch Video",
    installs: 438,
    versions: 9,
    output: "Video",
    tags: ["Launch", "Remotion"],
    description:
      "An editorial launch film: quick value beats, product close-ups and a confident ending card. Fully code-rendered in Remotion.",
    image: imageFor("sonali-sahu-09-350200"),
  },
];

export const POPULAR_SKILLS = SKILLS.slice(0, 4);
export const PROMO_SKILLS = [SKILLS[4], SKILLS[5], SKILLS[3], SKILLS[1]];

export function skillBySlug(slug: string): Skill | undefined {
  return SKILLS.find((s) => s.slug === slug);
}

export function profileUrl(author: string): string {
  return `https://x.com/${author.replace(/[^a-zA-Z0-9_]/g, "")}`;
}

export function initials(author: string): string {
  return author.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "AI";
}

export const TOOL_ABBREVIATIONS: Record<string, string> = {
  "Three.js": "3D",
  GLSL: "GL",
  GSAP: "GS",
  SVG: "SV",
  Canvas: "CA",
  CSS: "CS",
  "Web Audio": "AU",
  Remotion: "RE",
  Playable: "PL",
  "Pixel art": "PX",
  WebGL: "GL",
  Physics: "PH",
  Particles: "PT",
  "AI image": "AI",
};

export function sortVideos(list: Video[], sort: string): Video[] {
  const copy = [...list];
  if (sort === "az") return copy.sort((a, b) => a.author.localeCompare(b.author));
  if (sort === "shortest")
    return copy.sort((a, b) => durationSeconds(a.duration) - durationSeconds(b.duration));
  if (sort === "longest")
    return copy.sort((a, b) => durationSeconds(b.duration) - durationSeconds(a.duration));
  if (sort === "newest") return copy.reverse();
  return copy;
}

export function durationSeconds(duration: string): number {
  const [m, s] = duration.split(":").map((n) => Number.parseInt(n, 10));
  return (Number.isFinite(m) ? m : 0) * 60 + (Number.isFinite(s) ? s : 0);
}

export const PAGE_SIZE = 40;
export const TOTAL_VIDEOS = videos.length;
export const GITHUB_STARS = 9536;

export const SITE = {
  name: "kdmirah.studio",
  handle: "@kdmirah_studio",
  url: "https://kdmirah.studio",
  xUrl: "https://x.com/kdmirah_studio",
  archiveUrl: "https://github.com/yihui-dev/awesome-opus5-5-videos",
  tagline: "Independent Opus 5.5 video archive",
} as const;
