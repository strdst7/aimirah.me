/* NOCTURNAL dreamscape — an original Three.js scene.
   One continuous camera path, top to bottom of a lucid dream:
   sky → the lake and its crow → under the surface → the floor of the dream
   → pulled back to the moon. Everything procedural; every shader hand-written. */

import * as THREE from "three";

export const CHAPTERS = [
  { id: "intro", start: 0.0, label: "falling asleep" },
  { id: "lake", start: 0.1, label: "the lake" },
  { id: "dive", start: 0.34, label: "the dive" },
  { id: "deep", start: 0.56, label: "the floor of the dream" },
  { id: "ascent", start: 0.79, label: "the pull of the moon" },
  { id: "wake", start: 0.93, label: "wake up" },
] as const;

export interface DreamEvents {
  onChapter(i: number): void;
  onProgress(p: number): void;
  onDepth(under: number, surface: number): void;
  onCrowHover(hover: boolean): void;
  onCrowClick(): void;
  onReady(): void;
}

interface Opts {
  events: DreamEvents;
  reducedMotion: boolean;
}

export interface Dream {
  setTarget(p: number): void;
  getProgress(): number;
  /** raycast the crow from an NDC pointer position; true when the bird is under it */
  hitCrow(x: number, y: number): boolean;
  scareCrow(): void;
  pause(v: boolean): void;
  dispose(): void;
  warm: Promise<void>;
}

/* ———— small math helpers ———— */
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const damp = (cur: number, tgt: number, k: number, dt: number) => lerp(cur, tgt, 1 - Math.exp(-k * dt));

/* ———— shared fog chunk for the hand-written shaders ———— */
const FOG_PARS = `uniform vec3 uFogColor; uniform float uFogDensity;`;
const FOG_FN = `float fogAmt(float d){ float f = uFogDensity * d; return clamp(1.0 - exp(-f * f), 0.0, 1.0); }`;

const SURFACE_FOG = new THREE.Color("#060809");
const DIVE_FOG = new THREE.Color("#0a2f33");
const DEEP_FOG = new THREE.Color("#03161b");

/* camera path keyframes: [progress, pos, look] */
const KEYS: Array<[number, THREE.Vector3, THREE.Vector3]> = [
  [0.0, new THREE.Vector3(0, 24, 40), new THREE.Vector3(0, 3, -10)],
  [0.1, new THREE.Vector3(0, 7.5, 21), new THREE.Vector3(0, 1.6, -4)],
  [0.24, new THREE.Vector3(1.2, 2.2, 7.4), new THREE.Vector3(0, 1.15, 0)],
  [0.3, new THREE.Vector3(0.7, 1.6, 5.6), new THREE.Vector3(0, 1.2, 0)],
  [0.34, new THREE.Vector3(0.5, 1.1, 5.4), new THREE.Vector3(-0.4, 0.5, -5)],
  [0.44, new THREE.Vector3(0, -2.4, 2.2), new THREE.Vector3(0.4, -7, -8)],
  [0.56, new THREE.Vector3(-1.2, -7.2, -3), new THREE.Vector3(1, -9.5, -16)],
  [0.79, new THREE.Vector3(1.6, -11.5, -10), new THREE.Vector3(-2, -11, -26)],
  [0.86, new THREE.Vector3(0.6, -6.5, -8), new THREE.Vector3(0, 1, -14)],
  [0.93, new THREE.Vector3(0, 14, -4), new THREE.Vector3(0, 34, -55)],
  [1.0, new THREE.Vector3(0, 26, 2), new THREE.Vector3(0, 40, -60)],
];

function pathAt(p: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++;
  const [p0, a0, l0] = KEYS[i];
  const [p1, a1, l1] = KEYS[i + 1];
  const t = ss(p0, p1, p);
  outPos.lerpVectors(a0, a1, t);
  outLook.lerpVectors(l0, l1, t);
}

export function createDream(canvas: HTMLCanvasElement, opts: Opts): Dream {
  const { events, reducedMotion } = opts;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x030302, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(SURFACE_FOG.clone(), 0.012);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
  camera.position.set(0, 24, 40);

  /* everything with hand-managed fog registers here */
  const fogMats: Array<{ uFogColor: { value: THREE.Color }; uFogDensity: { value: number } }> = [];
  const fogU = { uFogColor: { value: new THREE.Color().copy(SURFACE_FOG) }, uFogDensity: { value: 0.012 } };
  const regFog = (m: { uniforms: Record<string, { value: unknown }> }) => {
    m.uniforms.uFogColor = fogU.uFogColor;
    m.uniforms.uFogDensity = fogU.uFogDensity;
    fogMats.push(fogU);
  };

  const timeU = { value: 0 };

  /* ————————————— SKY: stars ————————————— */
  const STAR_N = 900;
  const starGeo = new THREE.BufferGeometry();
  {
    const pos = new Float32Array(STAR_N * 3);
    const rnd = new Float32Array(STAR_N);
    for (let i = 0; i < STAR_N; i++) {
      // dome of stars, denser away from the horizon
      const a = Math.random() * Math.PI * 2;
      const r = 120 + Math.random() * 120;
      const y = 12 + Math.pow(Math.random(), 0.6) * 130;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(a) * r - 30;
      rnd[i] = Math.random() * 100;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    starGeo.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 1));
  }
  const starMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: timeU, uOpacity: { value: 1 } },
    vertexShader: `
      attribute float aRnd; varying float vTw; uniform float uTime;
      void main(){
        vTw = 0.55 + 0.45 * sin(uTime * (0.4 + fract(aRnd) * 1.4) + aRnd);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = (1.1 + fract(aRnd * 7.3) * 1.9) * (170.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying float vTw; uniform float uOpacity;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = smoothstep(0.5, 0.05, length(c));
        gl_FragColor = vec4(vec3(0.93, 0.9, 0.78), d * vTw * uOpacity);
      }`,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* ————————————— MOON + halo ————————————— */
  const moonPos = new THREE.Vector3(-6, 36, -88);
  const moonTex = makeMoonTexture();
  const moon = new THREE.Mesh(
    new THREE.CircleGeometry(6.4, 48),
    new THREE.MeshBasicMaterial({ map: moonTex, transparent: true, fog: false })
  );
  moon.position.copy(moonPos);
  moon.lookAt(0, 8, 40);
  scene.add(moon);

  const haloTex = makeRadialTexture("218,206,176");
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: haloTex,
      color: 0xdaceb0,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })
  );
  halo.scale.setScalar(50);
  halo.position.copy(moonPos);
  scene.add(halo);

  /* ————————————— WATER ————————————— */
  const waterGeo = new THREE.PlaneGeometry(180, 180, 150, 150);
  waterGeo.rotateX(-Math.PI / 2);
  const burst = { origin: new THREE.Vector2(0, 0), t0: -100 };
  const waterMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      uTime: timeU,
      uMoon: { value: moonPos.clone().normalize() },
      uCam: { value: camera.position },
      uBurstOrigin: { value: burst.origin },
      uBurstT0: { value: burst.t0 },
      uFlash: { value: 0 },
    },
    vertexShader: `
      uniform float uTime;
      varying vec3 vWorld; varying vec3 vNorm; varying float vDist;
      // three long swells and a fine chop — the lake breathing
      float wave(vec2 p, vec2 d, float f, float s, float a){
        return sin(dot(p, d) * f + uTime * s) * a;
      }
      float h(vec2 p){
        float y = 0.0;
        y += wave(p, vec2(0.8, 0.3), 0.55, 0.9, 0.12);
        y += wave(p, vec2(-0.4, 0.9), 0.8, 0.7, 0.09);
        y += wave(p, vec2(0.2, -0.6), 1.7, 1.3, 0.035);
        y += wave(p, vec2(0.9, -0.1), 3.4, 2.1, 0.014);
        return y;
      }
      void main(){
        vec3 pos = position;
        vec2 p = pos.xz;
        pos.y += h(p);
        float e = 0.35;
        vNorm = normalize(vec3(h(p - vec2(e, 0.0)) - h(p + vec2(e, 0.0)), 2.0 * e, h(p - vec2(0.0, e)) - h(p + vec2(0.0, e))));
        vec4 w = modelMatrix * vec4(pos, 1.0);
        vWorld = w.xyz;
        vec4 mv = viewMatrix * w;
        vDist = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      ${FOG_PARS}
      uniform float uTime; uniform vec3 uMoon; uniform vec3 uCam;
      uniform vec2 uBurstOrigin; uniform float uBurstT0; uniform float uFlash;
      varying vec3 vWorld; varying vec3 vNorm; varying float vDist;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      ${FOG_FN}
      void main(){
        vec3 N = normalize(vNorm);
        vec3 V = normalize(uCam - vWorld);
        if (!gl_FrontFacing) {
          // the underside: darker, greener, quieter
          vec3 under = vec3(0.016, 0.13, 0.14) * (0.7 + 0.3 * sin(vWorld.x * 0.7 + uTime * 0.8));
          float f = fogAmt(vDist);
          gl_FragColor = vec4(mix(under, uFogColor, f), 1.0);
          return;
        }
        // deep ink with a breath of blue
        vec3 col = vec3(0.012, 0.02, 0.028);
        // long ink streaks drifting sideways
        float streak = sin(vWorld.z * 0.65 + sin(vWorld.x * 0.22 + uTime * 0.12) * 2.6 + uTime * 0.05);
        col *= 0.85 + 0.3 * smoothstep(-0.2, 0.9, streak);
        // fresnel toward a cold sky
        float fres = pow(1.0 - max(dot(V, N), 0.0), 3.0);
        col += vec3(0.05, 0.07, 0.085) * fres;
        // the moon's silver road across the water
        vec3 R = reflect(-V, N);
        float spec = pow(max(dot(R, uMoon), 0.0), 140.0);
        float glitter = hash(floor(vWorld.xz * 14.0) + floor(uTime * 7.0));
        spec *= 0.65 + 0.8 * step(0.72, glitter);
        col += vec3(0.85, 0.82, 0.66) * spec * 2.4;
        // crow's ripple: rings running outward from the splash
        float bt = uTime - uBurstT0;
        if (bt > 0.0 && bt < 5.0) {
          float r = length(vWorld.xz - uBurstOrigin);
          float ring = sin(r * 9.0 - bt * 7.0) * exp(-r * 0.55) * exp(-bt * 0.9);
          col += vec3(0.5, 0.52, 0.45) * max(ring, 0.0) * 0.5;
        }
        col += vec3(0.8, 0.8, 0.75) * uFlash;
        float f = fogAmt(vDist);
        gl_FragColor = vec4(mix(col, uFogColor, f), 1.0);
      }`,
  });
  regFog(waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  scene.add(water);

  /* ————————————— THE ROCK ————————————— */
  const rockGeo = new THREE.IcosahedronGeometry(1.15, 3);
  {
    const p = rockGeo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n =
        0.82 +
        0.3 * Math.abs(Math.sin(v.x * 5.3) * Math.cos(v.y * 4.1) * Math.sin(v.z * 6.2)) +
        0.08 * Math.sin(v.y * 12.0);
      v.multiplyScalar(n);
      v.y *= 0.62;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    rockGeo.computeVertexNormals();
  }
  const rock = new THREE.Mesh(rockGeo, new THREE.MeshBasicMaterial({ color: 0x0c0e12 }));
  rock.position.set(0, -0.32, 0);
  scene.add(rock);

  /* ————————————— THE CROW ————————————— */
  const crowGroup = new THREE.Group();
  crowGroup.position.set(0, 0.42, 0);
  scene.add(crowGroup);

  const crowMat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: { uTime: timeU, uMap: { value: null as THREE.Texture | null }, uRuffle: { value: 0 } },
    vertexShader: `
      varying vec2 vUv; varying float vDist;
      uniform float uTime; uniform float uRuffle;
      void main(){
        vUv = uv;
        vec3 pos = position;
        // idle sway + the scare shiver
        pos.x += sin(uTime * 1.3 + uv.y * 3.0) * 0.008 * uv.y;
        pos.x += sin(uTime * 42.0 + uv.y * 9.0) * 0.02 * uRuffle * uv.y;
        pos.y += sin(uTime * 38.0) * 0.012 * uRuffle * uv.x;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        vDist = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      ${FOG_PARS}
      uniform sampler2D uMap; uniform float uTime;
      varying vec2 vUv; varying float vDist;
      ${FOG_FN}
      void main(){
        vec4 t = texture2D(uMap, vUv);
        float lum = dot(t.rgb, vec3(0.299, 0.587, 0.114));
        float a = 1.0 - smoothstep(0.55, 0.82, lum);
        if (a < 0.02) discard;
        // near-black body, moonlight combing its back
        float top = smoothstep(0.55, 0.95, vUv.y);
        float rim = smoothstep(0.35, 0.05, abs(lum - 0.42));
        vec3 col = vec3(0.012, 0.014, 0.02) + vec3(0.13, 0.14, 0.16) * rim * (0.25 + 0.75 * top);
        float f = fogAmt(vDist);
        gl_FragColor = vec4(mix(col, uFogColor, f), a);
      }`,
  });
  regFog(crowMat);
  const crowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), crowMat);
  crowMesh.position.y = 0.58;
  crowGroup.add(crowMesh);

  /* ————————————— BUBBLES (the dive) ————————————— */
  const BUB_N = 240;
  const bubGeo = new THREE.BufferGeometry();
  {
    const pos = new Float32Array(BUB_N * 3);
    const rnd = new Float32Array(BUB_N * 2);
    for (let i = 0; i < BUB_N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = Math.random() * 26;
      pos[i * 3 + 2] = -18 + (Math.random() - 0.5) * 36;
      rnd[i * 2] = 0.35 + Math.random() * 1.1; // speed
      rnd[i * 2 + 1] = Math.random(); // size seed
    }
    bubGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    bubGeo.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 2));
  }
  const bubMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: timeU, uOpacity: { value: 0 } },
    vertexShader: `
      attribute vec2 aRnd; uniform float uTime; varying float vA;
      void main(){
        vec3 p = position;
        p.y = mod(p.y + uTime * aRnd.x, 26.0) - 14.0;
        p.x += sin(uTime * 0.8 + aRnd.y * 40.0) * 0.35;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (1.2 + aRnd.y * 3.2) * (140.0 / -mv.z);
        vA = smoothstep(-14.0, -11.0, p.y) * (1.0 - smoothstep(9.0, 12.0, p.y));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying float vA; uniform float uOpacity;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        float ring = smoothstep(0.5, 0.42, d) * (0.35 + 0.65 * smoothstep(0.3, 0.48, d));
        gl_FragColor = vec4(vec3(0.62, 0.85, 0.82), ring * vA * uOpacity * 0.5);
      }`,
  });
  const bubbles = new THREE.Points(bubGeo, bubMat);
  scene.add(bubbles);

  /* ————————————— GOD RAYS (deep windows) ————————————— */
  const rayTex = makeRayTexture();
  const rays: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4 + Math.random() * 2.4, 34),
      new THREE.MeshBasicMaterial({
        map: rayTex,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        color: 0x9fd8cf,
      })
    );
    m.position.set(-9 + i * 4 + (Math.random() - 0.5) * 4, -4, -14 - Math.random() * 12);
    m.rotation.z = (Math.random() - 0.5) * 0.22;
    m.userData.phase = Math.random() * Math.PI * 2;
    rays.push(m);
    scene.add(m);
  }

  /* ————————————— DREAM ORBS (the floor of the dream) ————————————— */
  const orbTex = makeRadialTexture("255,244,214");
  const orbs: THREE.Sprite[] = [];
  for (let i = 0; i < 26; i++) {
    const warm = Math.random() > 0.4;
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: orbTex,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        color: warm ? 0xe8dcb6 : 0x8fd0c6,
      })
    );
    s.position.set((Math.random() - 0.5) * 26, -14 + Math.random() * 9, -34 + Math.random() * 30);
    const sc = 0.5 + Math.random() * 1.6;
    s.scale.setScalar(sc);
    s.userData = {
      base: s.position.clone(),
      ph: Math.random() * Math.PI * 2,
      sp: 0.24 + Math.random() * 0.5,
      amp: 0.5 + Math.random() * 1.4,
      sc,
    };
    orbs.push(s);
    scene.add(s);
  }

  /* ————————————— DUST MOTES (everywhere, always) ————————————— */
  const DUST_N = 520;
  const dustGeo = new THREE.BufferGeometry();
  {
    const pos = new Float32Array(DUST_N * 3);
    const rnd = new Float32Array(DUST_N);
    for (let i = 0; i < DUST_N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = -18 + Math.random() * 70;
      pos[i * 3 + 2] = -40 + (Math.random() - 0.5) * 90;
      rnd[i] = Math.random() * 100;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    dustGeo.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 1));
  }
  const dustMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: timeU, uOpacity: { value: 0.16 } },
    vertexShader: `
      attribute float aRnd; uniform float uTime; varying float vA;
      void main(){
        vec3 p = position;
        p.x += sin(uTime * 0.11 + aRnd) * 2.4;
        p.y += sin(uTime * 0.07 + aRnd * 2.0) * 1.6;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float d = -mv.z;
        gl_PointSize = 1.4 * (140.0 / max(d, 4.0));
        vA = smoothstep(120.0, 30.0, d);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying float vA; uniform float uOpacity;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = smoothstep(0.5, 0.1, length(c));
        gl_FragColor = vec4(vec3(0.85, 0.81, 0.68), d * vA * uOpacity);
      }`,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  /* ————————————— state & loop ————————————— */
  let target = 0;
  let p = 0;
  let raf = 0;
  let paused = false;
  let last = performance.now();
  let chapter = -1;
  let crowHoverNow = false;
  let ruffle: { t0: number; active: boolean } = { t0: -10, active: false };
  let flash = 0;
  let readyFired = false;
  const pointer = new THREE.Vector2(0, 0);
  const pointerSm = new THREE.Vector2(0, 0);
  const raycaster = new THREE.Raycaster();
  const pos = new THREE.Vector3();
  const look = new THREE.Vector3();
  const lookSm = new THREE.Vector3(0, 3, -10);
  const fogCol = new THREE.Color();
  const crowWorld = new THREE.Vector3();

  window.addEventListener("pointermove", (e) => {
    pointer.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
  });

  function resize() {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (paused) return;
    timeU.value = now / 1000;
    const t = timeU.value;

    // scroll easing — heavy, dreamlike
    p = damp(p, target, 2.2, dt);
    if (Math.abs(p - target) < 0.0004) p = target;
    events.onProgress(p);

    // chapter bookkeeping
    let ci = 0;
    for (let i = 0; i < CHAPTERS.length; i++) if (p >= CHAPTERS[i].start) ci = i;
    if (ci !== chapter) {
      chapter = ci;
      events.onChapter(ci);
    }

    // depth masks
    const under = ss(0.345, 0.42, p) * (1 - ss(0.865, 0.925, p));
    const deepness = ss(0.42, 0.75, p) * (1 - ss(0.8, 0.9, p));
    const surface = 1 - ss(0.36, 0.46, p) * (1 - ss(0.86, 0.94, p));
    events.onDepth(under * (0.35 + 0.65 * deepness), surface);

    // fog: surface night → dive teal → the floor's dark
    fogCol.copy(SURFACE_FOG).lerp(DIVE_FOG, ss(0.36, 0.5, p)).lerp(DEEP_FOG, ss(0.55, 0.8, p));
    fogCol.lerp(new THREE.Color("#0c0a07"), ss(0.9, 1, p) * 0.5); // waking warmth
    let dens = lerp(0.011, 0.052, ss(0.36, 0.48, p));
    dens = lerp(dens, 0.07, ss(0.55, 0.8, p));
    dens = lerp(dens, 0.008, ss(0.87, 0.97, p));
    fogU.uFogColor.value.copy(fogCol);
    fogU.uFogDensity.value = dens;
    (scene.fog as THREE.FogExp2).color.copy(fogCol);
    (scene.fog as THREE.FogExp2).density = dens;
    renderer.setClearColor(fogCol, 1);

    // camera on its path + parallax drift
    pathAt(p, pos, look);
    pointerSm.x = damp(pointerSm.x, pointer.x, 3, dt);
    pointerSm.y = damp(pointerSm.y, pointer.y, 3, dt);
    const pm = reducedMotion ? 0.25 : 1;
    pos.x += pointerSm.x * 0.55 * pm;
    pos.y += -pointerSm.y * 0.35 * pm;
    camera.position.copy(pos);
    lookSm.lerp(look, 1 - Math.exp(-3.2 * dt));
    const lk = lookSm.clone();
    lk.x += pointerSm.x * 0.9 * pm;
    lk.y += -pointerSm.y * 0.6 * pm;
    camera.lookAt(lk);

    // moon breath
    const mb = 1 + Math.sin(t * 0.24) * 0.015;
    halo.scale.setScalar(50 * mb);
    (halo.material as THREE.SpriteMaterial).opacity = 0.3 + Math.sin(t * 0.24) * 0.05 + under * -0.1;

    // stars fade underwater and at waking
    (starMat.uniforms.uOpacity as { value: number }).value = (1 - under) * (1 - ss(0.93, 1, p)) * 0.95 + 0.05;

    // crow idle: it watches you
    crowGroup.rotation.y = Math.sin(t * 0.32) * 0.16 + 0.1;
    crowGroup.rotation.z = Math.sin(t * 0.85) * 0.015;
    if (ruffle.active) {
      const rt = t - ruffle.t0;
      const k = Math.max(0, 1 - rt / 0.9);
      crowMat.uniforms.uRuffle.value = k;
      crowGroup.rotation.z += Math.sin(rt * 26) * 0.16 * k;
      crowGroup.rotation.y += Math.sin(rt * 9) * 0.5 * k * 0.4;
      if (k <= 0) ruffle.active = false;
    }
    crowMesh.getWorldPosition(crowWorld);
    crowMesh.lookAt(camera.position.x, crowWorld.y, camera.position.z);

    // underwater cast
    (bubMat.uniforms.uOpacity as { value: number }).value = ss(0.36, 0.44, p) * (1 - ss(0.84, 0.93, p));
    const rayOp = ss(0.48, 0.6, p) * (1 - ss(0.76, 0.86, p));
    for (const r of rays) {
      const m = r.material as THREE.MeshBasicMaterial;
      m.opacity = rayOp * (0.05 + 0.05 * Math.sin(t * 0.4 + r.userData.phase));
      r.rotation.z = Math.sin(t * 0.1 + r.userData.phase) * 0.12;
    }
    const orbWindow = ss(0.52, 0.64, p) * (1 - ss(0.78, 0.88, p));
    for (const s of orbs) {
      const u = s.userData;
      s.position.y = u.base.y + Math.sin(t * u.sp + u.ph) * u.amp;
      s.position.x = u.base.x + Math.sin(t * u.sp * 0.6 + u.ph * 2.0) * u.amp * 0.7;
      const pulse = 0.75 + 0.25 * Math.sin(t * (u.sp * 2.4) + u.ph);
      (s.material as THREE.SpriteMaterial).opacity = orbWindow * 0.5 * pulse;
      s.scale.setScalar(u.sc * (0.9 + 0.18 * pulse));
    }
    (dustMat.uniforms.uOpacity as { value: number }).value = 0.1 + under * 0.14;

    // water flash when crossing the film of the surface
    flash = damp(flash, 0, 3.2, dt);
    waterMat.uniforms.uFlash.value = flash;

    renderer.render(scene, camera);

    if (!readyFired) {
      readyFired = true;
      events.onReady();
    }
  }
  raf = requestAnimationFrame(frame);

  /* ————— warm-up: crow texture + a couple of frames ————— */
  const warm = new Promise<void>((resolve) => {
    new THREE.TextureLoader().load(
      "/assets/crow.png",
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        crowMat.uniforms.uMap.value = tex;
        // the portrait is landscape — stretch the canvas it sits on, never the bird
        const img = tex.image as { width: number; height: number };
        crowMesh.scale.x = Math.min(2.2, Math.max(0.9, img.width / img.height));
        const chk = () => (readyFired ? resolve() : setTimeout(chk, 60));
        chk();
      },
      undefined,
      () => {
        // the bird refused to be drawn — dream on without it
        const chk = () => (readyFired ? resolve() : setTimeout(chk, 60));
        chk();
      }
    );
  });

  return {
    warm,
    setTarget(v: number) {
      target = clamp(v);
    },
    getProgress() {
      return p;
    },
    hitCrow(x: number, y: number) {
      // the bird only matters while you're both at the lake
      if (p < 0.1 || p > 0.36) {
        if (crowHoverNow) {
          crowHoverNow = false;
          events.onCrowHover(false);
        }
        return false;
      }
      raycaster.setFromCamera(new THREE.Vector2(x, -y), camera);
      const hit = raycaster.intersectObject(crowMesh, false).length > 0;
      if (hit !== crowHoverNow) {
        crowHoverNow = hit;
        events.onCrowHover(hit);
      }
      return hit;
    },
    scareCrow() {
      ruffle = { t0: timeU.value, active: true };
      burst.origin.set(0, 1.1);
      burst.t0 = timeU.value;
      waterMat.uniforms.uBurstT0.value = burst.t0;
      flash = Math.max(flash, 0.05);
      events.onCrowClick();
    },
    pause(v: boolean) {
      paused = v;
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      scene.traverse((o) => {
        const anyO = o as unknown as { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
        anyO.geometry?.dispose?.();
        if (Array.isArray(anyO.material)) anyO.material.forEach((m) => m.dispose());
        else anyO.material?.dispose?.();
      });
    },
  };
}

/* ————————————— procedural textures ————————————— */

function makeRadialTexture(rgb: string): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.25, `rgba(${rgb},0.55)`);
  grad.addColorStop(0.6, `rgba(${rgb},0.14)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeMoonTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 40, 128, 128, 126);
  grad.addColorStop(0, "rgba(246,240,222,1)");
  grad.addColorStop(0.72, "rgba(238,230,204,1)");
  grad.addColorStop(0.94, "rgba(226,216,186,0.9)");
  grad.addColorStop(1, "rgba(226,216,186,0)");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(128, 128, 126, 0, Math.PI * 2);
  g.fill();
  // craters — blotches of quiet gray
  g.globalCompositeOperation = "source-atop";
  for (let i = 0; i < 26; i++) {
    const x = 60 + Math.random() * 136;
    const y = 60 + Math.random() * 136;
    const r = 3 + Math.random() * 16;
    const cg = g.createRadialGradient(x, y, 0, x, y, r);
    cg.addColorStop(0, `rgba(178,170,144,${0.08 + Math.random() * 0.14})`);
    cg.addColorStop(1, "rgba(178,170,144,0)");
    g.fillStyle = cg;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeRayTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.22)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 256);
  // soften the sides
  const side = g.createLinearGradient(0, 0, 64, 0);
  side.addColorStop(0, "rgba(0,0,0,1)");
  side.addColorStop(0.3, "rgba(0,0,0,0)");
  side.addColorStop(0.7, "rgba(0,0,0,0)");
  side.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out";
  g.fillStyle = side;
  g.fillRect(0, 0, 64, 256);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}
