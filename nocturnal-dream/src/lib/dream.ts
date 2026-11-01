// ------------------------------------------------------------------ the dream, in one mutable store
// Everything that changes every frame (depth, cursor, time) lives here as plain mutable state so the canvas and
// the HUD can read it without pushing 60 updates a second through React. React only owns structural state:
// is the loader gone, is the storage open, which modules were found.

export type ModId = "crow" | "sphere" | "chandelier" | "door" | "car" | "earth";

export interface Scene {
  id: string;
  n: string; // printed index
  place: string; // HUD readout
  a: number; // depth range
  b: number;
  anchor: [number, number]; // where the world "sits" on screen at this depth (0..1)
}

export interface Title {
  scene: number;
  lines: string[];
  pos: "top" | "center" | "bottom-left" | "bottom" | "lower" | "upper";
  size: number; // 1 = the big opening card
}

export interface Mod {
  id: ModId;
  name: string;
  rarity: 1 | 2 | 3;
  place: string;
  scene: number;
  /** hot spot in canvas fractions */
  at: [number, number];
  r: number; // reveal radius (in px at --s 1)
  note: string[];
  meta: [string, string];
}

export const SCENES: Scene[] = [
  { id: "lake", n: "01", place: "LAKE", a: 0.0, b: 0.13, anchor: [0.5, 0.62] },
  { id: "pier", n: "02", place: "THE PIER", a: 0.13, b: 0.26, anchor: [0.5, 0.56] },
  { id: "church", n: "03", place: "CHURCH", a: 0.26, b: 0.4, anchor: [0.5, 0.5] },
  { id: "door", n: "04", place: "KEYHOLE", a: 0.4, b: 0.53, anchor: [0.5, 0.52] },
  { id: "street", n: "05", place: "STREET", a: 0.53, b: 0.68, anchor: [0.5, 0.6] },
  { id: "portal", n: "06", place: "PORTAL", a: 0.68, b: 0.79, anchor: [0.5, 0.55] },
  { id: "ascent", n: "07", place: "ASCENT", a: 0.79, b: 0.9, anchor: [0.5, 0.66] },
  { id: "orbit", n: "08", place: "ORBIT", a: 0.9, b: 1.0, anchor: [0.5, 0.5] },
];

/** The stuck-on notes. One line = one sticker sheet. */
export const TITLES: Title[] = [
  {
    scene: 0,
    lines: ["DO YOU", "REMEMBER YOUR", "LAST DREAM?"],
    pos: "top",
    size: 1,
  },
  {
    scene: 1,
    lines: ["did they make you", "forget it again?"],
    pos: "bottom-left",
    size: 0.42,
  },
  {
    scene: 2,
    lines: ["they know we're aware of them.", "be quiet. we're getting out"],
    pos: "bottom-left",
    size: 0.36,
  },
  {
    scene: 3,
    lines: ["talk to me", "when you're awake"],
    pos: "center",
    size: 0.44,
  },
  {
    scene: 4,
    lines: ["now look for hidden senses", "they change the reality"],
    pos: "lower",
    size: 0.36,
  },
  {
    scene: 5,
    lines: ["when jumping remember", "you can fly as long", "as you're lucid dreaming"],
    pos: "upper",
    size: 0.34,
  },
  {
    scene: 6,
    lines: ["hold your breath", "and enjoy the view"],
    pos: "bottom-left",
    size: 0.38,
  },
  {
    scene: 7,
    lines: ["everything is written.", "everything bleeds together."],
    pos: "bottom",
    size: 0.4,
  },
];

/** The loader card — the same sticker system, burnt away with the rest of the intro. */
export const LOADER_TITLE = ["LET ME SHOW", "WHAT A REAL LUCID DREAMING", "LOOKS LIKE"];

export const MODULES: Mod[] = [
  {
    id: "crow",
    name: "THE CROW",
    rarity: 1,
    place: "LAKE",
    scene: 0,
    at: [0.5, 0.72],
    r: 150,
    note: [
      "IT SAT ON THE PIER LONG BEFORE YOU KNEW YOU WERE BEING WATCHED. BLACK FEATHERS, BLACK WATER, ONE BRIGHT EYE — THE ONLY WITNESS HERE THAT NEVER BLINKS.",
      "ASK IT WHERE THE LAKE ENDS. IT WILL TELL YOU THE TRUTH: IT DOESN'T. IT ONLY GETS DEEPER, AND YOU KEEP SCROLLING ANYWAY.",
    ],
    meta: ["THE NIGHT THE LAKE WENT STILL", "1993"],
  },
  {
    id: "sphere",
    name: "FORTUNE TELLER'S SPHERE",
    rarity: 2,
    place: "CHURCH",
    scene: 2,
    at: [0.36, 0.56],
    r: 120,
    note: [
      "SHE SAID THE GLASS SHOWS WHAT IS ALREADY WRITTEN. SHE LIED — IT SHOWS WHAT IS BEING WRITTEN, NOW, IN A HAND THAT LOOKS A LOT LIKE YOURS.",
      "LOOK CLOSER: THE ROOM INSIDE THE SPHERE HAS A SPHERE IN IT, AND A ROOM INSIDE THAT. EVERY REFLECTION IS A DRAFT. NONE OF THEM ARE FINAL.",
    ],
    meta: ["THE READING THAT NEVER ENDED", "1971"],
  },
  {
    id: "chandelier",
    name: "IRON CHANDELIER",
    rarity: 2,
    place: "CHURCH",
    scene: 2,
    at: [0.66, 0.2],
    r: 130,
    note: [
      "FORTY CANDLES, NONE OF THEM LIT, AND IT STILL SWINGS — THOUGH THERE IS NO WIND IN HERE. ONLY THE SLOW BREATH OF SOMETHING UNDER THE FLOORBOARDS.",
      "LIGHT WAS THE ONLY RULE THAT EVER KEPT THE DARK POLITE. SOMEONE TOOK THE FLAMES AND LEFT THE IRON: A CAGE STILL WAITING FOR ITS BIRD.",
    ],
    meta: ["THE LAST MASS BEFORE THE FLOOD", "1954"],
  },
  {
    id: "door",
    name: "THE CHURCH DOOR",
    rarity: 3,
    place: "KEYHOLE",
    scene: 3,
    at: [0.5, 0.52],
    r: 170,
    note: [
      "EVERY STORY HAS ONE DOOR THAT WASN'T ON THE BLUEPRINTS. THIS ONE WAS MADE TO STAY LOCKED, AND THE KEYHOLE WAS MADE TO BE LOOKED THROUGH.",
      "ON THE OTHER SIDE: THE SAME STREET, THE SAME CHURCH, THE SAME YOU — ONLY THE SHADOWS ARRIVE HALF A SECOND LATE.",
    ],
    meta: ["THE NIGHT YOU LOOKED THROUGH", "2019"],
  },
  {
    id: "car",
    name: "OLD SEDAN",
    rarity: 1,
    place: "STREET",
    scene: 4,
    at: [0.28, 0.66],
    r: 140,
    note: [
      "ENGINE COLD, HEADLIGHTS ON. IT HAS BEEN PARKED ON THIS STREET FOR DECADES AND THE ODOMETER KEEPS CLIMBING ANYWAY.",
      "NOBODY DRIVES IT. SOMETHING DRIVES IT, AT NIGHT, DOWN ROADS THAT LOOP BACK INTO THEMSELVES LIKE A CHAPTER YOU KEEP REWRITING.",
    ],
    meta: ["LAST SEEN LEAVING TOWN", "1978"],
  },
  {
    id: "earth",
    name: "THE EARTH",
    rarity: 2,
    place: "ORBIT",
    scene: 7,
    at: [0.5, 0.46],
    r: 180,
    note: [
      "FROM UP HERE IT LOOKS FINISHED. BLUE, QUIET, TURNING LIKE A THOUGHT YOU CAN'T LET GO OF.",
      "BUT YOU HAVE READ ENOUGH OF THIS DREAM TO KNOW: THE HIGHER YOU CLIMB, THE SMALLER THE STORY GETS, UNTIL THE WHOLE WORLD FITS INSIDE ONE WORD YOU FORGOT TO WRITE.",
    ],
    meta: ["FROM THE DAY YOU FIRST MET", "2064"],
  },
];

export const TASKS = [
  "find a hidden module by hovering over objects",
  "discover the lucid dream by scrolling",
  `collect ${MODULES.length} modules`,
];

export const CREDIT = "aimirah - kdmirah lab";

// ------------------------------------------------------------------ live state
export interface DreamState {
  t: number;
  dt: number;
  depth: number; // eased 0..1
  target: number; // where the scroll wants to be
  flow: number; // total absolute movement (feeds the aberration + sfx)
  s: number; // scene index (float)
  scene: number; // rounded
  mix: number; // 0 at a scene centre → 1 exactly between two (transition heat)
  w: number;
  h: number;
  sScale: number; // --s, design scale
  mx: number; // pointer px
  my: number;
  px: number; // smoothed pointer, −1..1
  py: number;
  ptx: number;
  pty: number;
  ink: { x: number; y: number; t: number }[]; // the black ink the cursor leaves behind
  hold: number; // 0..1 pointer-down hold on a tag
  holdId: ModId | null;
  lift: number; // crown / win glow
  wake: number; // the last card: 0 → 1 as you reach the end
  intro: number; // 0..1 the first seconds after the loader burns out
  reduced: boolean;
  dpr: number;
}

export const D: DreamState = {
  t: 0,
  dt: 0,
  depth: 0,
  target: 0,
  flow: 0,
  s: 0,
  scene: 0,
  mix: 0,
  w: 1,
  h: 1,
  sScale: 1,
  mx: -999,
  my: -999,
  px: 0,
  py: 0,
  ptx: 0,
  pty: 0,
  ink: [],
  hold: 0,
  holdId: null,
  lift: 0,
  wake: 0,
  intro: 0,
  reduced: false,
  dpr: 1,
};

export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a || 1e-6));
  return t * t * (3 - 2 * t);
};
/** deterministic pseudo-noise for the painterly parts (no allocations, wraps at 1024) */
const PERM = new Uint8Array(1024);
{
  let x = 1;
  for (let i = 0; i < 1024; i++) {
    x = (x * 1664525 + 1013904223) >>> 0;
    PERM[i] = x & 255;
  }
}
export function nz(x: number, y = 0, z = 0) {
  const i = (Math.floor(x) & 255) ^ (Math.floor(y) & 255) ^ (Math.floor(z) & 255);
  const f = x - Math.floor(x);
  const g = y - Math.floor(y);
  const a = PERM[i] / 255;
  const b = PERM[(i + 37) & 1023] / 255;
  const c = PERM[(i + 91) & 1023] / 255;
  const u = f * f * (3 - 2 * f);
  const v = g * g * (3 - 2 * g);
  return (a * (1 - u) + b * u) * (1 - v) + (b * (1 - u) + c * u) * v;
}
/** layered value noise, 0..1 */
export function fbm(x: number, y = 0, oct = 3) {
  let s = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    s += amp * nz(x * f, y * f, i * 4.7);
    f *= 2.03;
    amp *= 0.5;
  }
  return s;
}

export function sceneAt(depth: number) {
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (depth >= SCENES[i].a) {
      const sc = SCENES[i];
      const local = clamp((depth - sc.a) / (sc.b - sc.a));
      return { i, sc, local };
    }
  }
  return { i: 0, sc: SCENES[0], local: 0 };
}

/** how strongly the depth `d` belongs to scene i (with a soft overlap into the neighbours) */
export function sceneAlpha(i: number, d: number) {
  const sc = SCENES[i];
  const pad = (sc.b - sc.a) * 0.22;
  const inA = i === 0 ? 1 : smoothstep(sc.a - pad, sc.a + pad * 0.4, d);
  const outA = i === SCENES.length - 1 ? 1 : 1 - smoothstep(sc.b - pad * 0.4, sc.b + pad, d);
  return clamp(Math.min(inA, outA));
}

// ------------------------------------------------------------------ persistence (the hunt)
const KEY = "nocturnal-modules-v1";
export interface Save {
  found: ModId[];
  dream: boolean;
}
export function loadSave(): Save {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    const ok = (a: unknown) => (Array.isArray(a) ? (a.filter((x) => MODULES.some((m) => m.id === x)) as ModId[]) : []);
    return { found: ok(raw.found), dream: !!raw.dream };
  } catch {
    return { found: [], dream: false };
  }
}
export function writeSave(s: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode: the hunt just isn't remembered */
  }
}

export function layoutVars() {
  const w = innerWidth;
  const h = innerHeight;
  document.documentElement.style.setProperty("--s", Math.max(0.72, Math.min(w / 1920, h / 1080) * 1.05).toFixed(3));
  document.documentElement.style.setProperty("--k", Math.max(0.82, Math.min(1.5, w / 1440)).toFixed(3));
  D.sScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--s")) || 1;
}
