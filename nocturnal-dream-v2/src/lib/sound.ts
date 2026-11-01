/* NOCTURNAL soundscape — everything is synthesized live with WebAudio.
   No samples, no assets: a two-oscillator dream drone, lapping water noise,
   distant crickets near the surface, a squawk for the crow, and a depth
   lowpass that swallows the world as you dive. */

export interface SoundEngine {
  readonly muted: boolean;
  setMuted(m: boolean): void;
  setDepth(d: number): void; // 0 = surface air, 1 = deep underwater
  setSurface(s: number): void; // how close to the surface world we are
  caw(): void;
  blip(freq?: number): void;
  whoosh(down: boolean): void;
  resume(): void;
}

export function createSound(): SoundEngine {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let depthFilter: BiquadFilterNode | null = null;
  let waterGain: GainNode | null = null;
  let muted = true;
  let started = false;
  let depth = 0;
  let surface = 1;

  function ensure() {
    if (ctx) return;
    const AC: typeof AudioContext | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0;

    depthFilter = ctx.createBiquadFilter();
    depthFilter.type = "lowpass";
    depthFilter.frequency.value = 18000;
    depthFilter.Q.value = 0.4;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -22;
    comp.ratio.value = 6;

    depthFilter.connect(comp);
    comp.connect(master);
    master.connect(ctx.destination);

    startDrone();
    startWater();
    scheduleCrickets();
    started = true;
  }

  /* ————— the drone: two slow-beating sines + a fifth, breathing ————— */
  function startDrone() {
    if (!ctx || !depthFilter) return;
    const t = ctx.currentTime;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.05;
    droneGain.connect(depthFilter);

    const mk = (type: OscillatorType, f: number, g: number) => {
      const o = ctx!.createOscillator();
      o.type = type;
      o.frequency.value = f;
      const og = ctx!.createGain();
      og.gain.value = g;
      o.connect(og);
      og.connect(droneGain);
      o.start(t);
      return o;
    };
    mk("sine", 55, 0.9);
    mk("sine", 55.4, 0.9); // slow beat — the pulse of the dream
    mk("triangle", 82.5, 0.28);
    mk("sine", 110.3, 0.22);

    // a long breath: the whole drone swells and recedes
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 1 / 18;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 0.022;
    lfo.connect(lfoG);
    lfoG.connect(droneGain.gain);
    lfo.start(t);
  }

  /* ————— water: looped noise, the shore breathing in and out ————— */
  function startWater() {
    if (!ctx || !depthFilter) return;
    const len = 4 * ctx.sampleRate;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02; // brown-ish
      d[i] = last * 3.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 640;
    lp.Q.value = 0.6;

    waterGain = ctx.createGain();
    waterGain.gain.value = 0.05;

    src.connect(lp);
    lp.connect(waterGain);
    waterGain.connect(depthFilter);
    src.start();

    // lapping: slow asymmetric swells
    const lap = ctx.createOscillator();
    lap.frequency.value = 1 / 7.3;
    const lapG = ctx.createGain();
    lapG.gain.value = 190;
    lap.connect(lapG);
    lapG.connect(lp.frequency);
    lap.start();
  }

  /* ————— crickets: tiny far-off trains of chirps, only near the surface ————— */
  function scheduleCrickets() {
    if (!ctx) return;
    const tick = () => {
      setTimeout(tick, 900 + Math.random() * 3400);
      if (muted || depth > 0.25 || surface < 0.35) return;
      chirp();
    };
    tick();
  }

  function chirp() {
    if (!ctx || !depthFilter) return;
    const t0 = ctx.currentTime + Math.random() * 0.15;
    const n = 2 + Math.floor(Math.random() * 4);
    const f = 3900 + Math.random() * 500;
    for (let i = 0; i < n; i++) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t0 + i * 0.07);
      g.gain.linearRampToValueAtTime(0.008, t0 + i * 0.07 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0004, t0 + i * 0.07 + 0.055);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = f;
      bp.Q.value = 14;
      o.connect(bp);
      bp.connect(g);
      g.connect(depthFilter);
      o.start(t0 + i * 0.07);
      o.stop(t0 + i * 0.07 + 0.08);
    }
  }

  return {
    get muted() {
      return muted;
    },
    setMuted(m: boolean) {
      muted = m;
      if (!m) ensure();
      if (!ctx || !master) return;
      if (ctx.state === "suspended") void ctx.resume();
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setTargetAtTime(m ? 0 : 0.85, t, 0.6);
    },
    resume() {
      if (ctx && ctx.state === "suspended") void ctx.resume();
    },
    setDepth(d: number) {
      depth = Math.min(1, Math.max(0, d));
      if (!ctx || !depthFilter || !started) return;
      // the deeper you go, the more the world is swallowed
      const f = 18000 * Math.pow(0.014, depth); // → ~250 Hz at the bottom
      depthFilter.frequency.setTargetAtTime(Math.max(220, f), ctx.currentTime, 0.4);
      if (waterGain) waterGain.gain.setTargetAtTime(0.05 + depth * 0.05, ctx.currentTime, 0.5);
    },
    setSurface(s: number) {
      surface = Math.min(1, Math.max(0, s));
    },
    /* a tired crow: two falling squawks, slightly detuned */
    caw() {
      if (muted || !ctx || !depthFilter) return;
      const t0 = ctx.currentTime + 0.02;
      for (let c = 0; c < 2; c++) {
        const ts = t0 + c * 0.24 + Math.random() * 0.03;
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(760 + Math.random() * 60, ts);
        o.frequency.exponentialRampToValueAtTime(290, ts + 0.16);
        const am = ctx.createOscillator();
        am.frequency.value = 86;
        const amG = ctx.createGain();
        amG.gain.value = 0.5;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.001, ts);
        g.gain.exponentialRampToValueAtTime(0.11, ts + 0.014);
        g.gain.exponentialRampToValueAtTime(0.0008, ts + 0.2);
        am.connect(amG);
        amG.connect(g.gain);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 1150;
        bp.Q.value = 1.1;
        o.connect(bp);
        bp.connect(g);
        g.connect(depthFilter);
        o.start(ts);
        o.stop(ts + 0.22);
        am.start(ts);
        am.stop(ts + 0.22);
      }
    },
    blip(freq = 620) {
      if (muted || !ctx || !depthFilter) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.09);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0006, t + 0.12);
      o.connect(g);
      g.connect(depthFilter);
      o.start(t);
      o.stop(t + 0.13);
    },
    whoosh(down: boolean) {
      if (muted || !ctx || !depthFilter) return;
      const t = ctx.currentTime;
      const len = 0.8 * ctx.sampleRate;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = 1.4;
      bp.frequency.setValueAtTime(down ? 300 : 2400, t);
      bp.frequency.exponentialRampToValueAtTime(down ? 2600 : 240, t + 0.7);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 0.8);
      src.connect(bp);
      bp.connect(g);
      g.connect(depthFilter);
      src.start(t);
    },
  };
}
