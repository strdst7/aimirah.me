export interface Experiment {
  id: string;
  index: string;
  title: string;
  year: string;
  tags: string[];
  inspiration: { img: string; code: string; caption: string };
  output: { img: string; code: string; caption: string };
}

export const EXPERIMENTS: Experiment[] = [
  {
    id: "exp-01",
    index: "001",
    title: "CONCRETE RHYTHM",
    year: "2026",
    tags: ["BRUTALISM", "GRID", "TYPE"],
    inspiration: {
      img: "./images/exp-01-inspiration.jpg",
      code: "SRC_0187",
      caption: "FACADE STUDY — RAW CONCRETE",
    },
    output: {
      img: "./images/exp-01-output.jpg",
      code: "EXH_A1",
      caption: "POSTER SYSTEM — STRICT MODULAR",
    },
  },
  {
    id: "exp-02",
    index: "002",
    title: "LIQUID STATE",
    year: "2026",
    tags: ["FLUID", "ORGANIC", "DARK UI"],
    inspiration: {
      img: "./images/exp-02-inspiration.jpg",
      code: "SRC_0294",
      caption: "INK IN WATER — MACRO",
    },
    output: {
      img: "./images/exp-02-output.jpg",
      code: "EXH_B2",
      caption: "HERO CONCEPT — FLOW FIELD",
    },
  },
  {
    id: "exp-03",
    index: "003",
    title: "LIGHT CURRENTS",
    year: "2026",
    tags: ["FIBRE", "MOTION", "DATA"],
    inspiration: {
      img: "./images/exp-03-inspiration.jpg",
      code: "SRC_0311",
      caption: "FIBRE TRAILS — LONG EXPOSURE",
    },
    output: {
      img: "./images/exp-03-output.jpg",
      code: "EXH_C3",
      caption: "DATA INTERFACE — STREAMS",
    },
  },
  {
    id: "exp-04",
    index: "004",
    title: "FAULT LINES",
    year: "2026",
    tags: ["TEXTURE", "COLLAGE", "EDITORIAL"],
    inspiration: {
      img: "./images/exp-04-inspiration.jpg",
      code: "SRC_0458",
      caption: "DRIED EARTH — TOPOGRAPHY",
    },
    output: {
      img: "./images/exp-04-output.jpg",
      code: "EXH_D4",
      caption: "EDITORIAL SPREAD — FRAGMENTS",
    },
  },
];
