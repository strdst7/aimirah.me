// ------------------------------------------------------------------ the sound of the dream
// Nothing is downloaded: the whole score is built out of oscillators and one noise buffer, so the page stays a
// single file and the mix can react to the dream (depth, scroll speed, cursor) in real time.
//   drone    — two detuned low oscillators through a slow filter, the lake at 3 a.m.
//   wind     — filtered noise, brighter and louder the faster you scroll
//   vinyl    — sparse crackle, the "SOUND ON" badge of the site
//   sfx      — tape, blip (a module found), caw (the crow), whoosh (a scene passes), win (all six)

export type Sfx = "tape" | "blip" | "caw" | "whoosh" | "win" | "ui" | "down";

interface Ctx extends AudioContext {}

class Sound {
  ctx: Ctx | null = null;
  master: GainNode | null = null;
  music: GainNode | null = null;
  sfxBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private wind: { filt: BiquadFilterNode; gain: GainNode } | null = null;
  muted = true;
  enabled = false;
  private nodes: AudioNode[] = [];
  flow = 0; // set from the dream: how fast the scroll is running

  private makeNoise(ctx: BaseAudioContext) {
    const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  /** must be called from a real gesture (browsers only let sound start inside one) */
  async enable() {
    if (!this.ctx) {
      const AC: typeof AudioContext =
        (window as unknown as { AudioContext: typeof AudioContext }).AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx: Ctx = new AC();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(ctx.destination);
      this.music = ctx.createGain();
      this.music.gain.value = 0.5;
      this.music.connect(this.master);
      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = 0.8;
      this.sfxBus.connect(this.master);
      this.noise = this.makeNoise(ctx);

      // ---- drone: three low voices, each through its own slow-moving bandpass
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.16;
      droneGain.connect(this.music);
      const dFilt = ctx.createBiquadFilter();
      dFilt.type = "lowpass";
      dFilt.frequency.value = 480;
      dFilt.Q.value = 1.4;
      dFilt.connect(droneGain);
      for (const [f, type, g] of [
        [55, "sawtooth", 0.5],
        [82.4, "sine", 0.75],
        [110.3, "triangle", 0.35],
        [164.9, "sine", 0.12],
      ] as [number, OscillatorType, number][]) {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = f;
        o.detune.value = (Math.random() - 0.5) * 14;
        const og = ctx.createGain();
        og.gain.value = g;
        o.connect(og).connect(dFilt);
        o.start();
        this.nodes.push(o, og);
      }
      // breathing of the filter
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.06;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 220;
      lfo.connect(lfoG).connect(dFilt.frequency);
      lfo.start();
      this.nodes.push(lfo, lfoG, dFilt, droneGain);

      // ---- wind / lake surface
      const wSrc = ctx.createBufferSource();
      wSrc.buffer = this.noise;
      wSrc.loop = true;
      const wf = ctx.createBiquadFilter();
      wf.type = "bandpass";
      wf.frequency.value = 620;
      wf.Q.value = 0.7;
      const wg = ctx.createGain();
      wg.gain.value = 0.05;
      wSrc.connect(wf).connect(wg).connect(this.music);
      wSrc.start();
      this.wind = { filt: wf, gain: wg };
      this.nodes.push(wSrc, wf, wg);

      // ---- vinyl crackle: an idle loop of sparse impulses
      const cSrc = ctx.createBufferSource();
      cSrc.buffer = this.noise;
      cSrc.loop = true;
      const cf = ctx.createBiquadFilter();
      cf.type = "highpass";
      cf.frequency.value = 2400;
      const cg = ctx.createGain();
      cg.gain.value = 0.02;
      cSrc.connect(cf).connect(cg).connect(this.music);
      cSrc.start();
      this.nodes.push(cSrc, cf, cg);
    }
    try {
      await this.ctx.resume();
    } catch {
      /* ignore */
    }
    this.enabled = true;
    this.apply();
  }

  apply() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(this.muted ? 0 : 0.9, t, 0.35);
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (!m) void this.enable();
    else this.apply();
  }

  /** depth 0..1 and scroll speed — the mix follows the dream */
  space(depth: number, flow: number) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    if (this.wind) {
      this.wind.filt.frequency.setTargetAtTime(400 + flow * 2600 + depth * 200, t, 0.25);
      this.wind.gain.gain.setTargetAtTime(0.035 + Math.min(0.1, flow * 0.22), t, 0.2);
    }
    if (this.music) this.music.gain.setTargetAtTime(0.4 + depth * 0.32, t, 0.6);
  }

  private env(dur: number, peak: number, attack = 0.008) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(this.sfxBus!);
    return g;
  }

  play(kind: Sfx) {
    const ctx = this.ctx;
    if (!ctx || this.muted || !this.sfxBus) return;
    const t = ctx.currentTime;
    switch (kind) {
      case "tape": {
        // a sticker pressed on: a short torn-noise tick
        const s = ctx.createBufferSource();
        s.buffer = this.noise!;
        s.loop = true;
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = 1800 + Math.random() * 900;
        f.Q.value = 1.1;
        const g = this.env(0.13, 0.3);
        s.connect(f).connect(g);
        s.start(t);
        s.stop(t + 0.16);
        break;
      }
      case "ui": {
        const o = ctx.createOscillator();
        o.type = "square";
        o.frequency.value = 880;
        const g = this.env(0.05, 0.06);
        o.connect(g);
        o.start(t);
        o.stop(t + 0.07);
        break;
      }
      case "down": {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(300, t);
        o.frequency.exponentialRampToValueAtTime(90, t + 0.18);
        const g = this.env(0.22, 0.16);
        o.connect(g);
        o.start(t);
        o.stop(t + 0.26);
        break;
      }
      case "blip": {
        // the futuristic two-tone of a module discovered
        for (const [f, dt, len] of [
          [1244, 0, 0.09],
          [1864, 0.09, 0.07],
          [2489, 0.16, 0.14],
        ]) {
          const o = ctx.createOscillator();
          o.type = "triangle";
          o.frequency.setValueAtTime(f, t + dt);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t + dt);
          g.gain.linearRampToValueAtTime(0.2, t + dt + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dt + len);
          o.connect(g).connect(this.sfxBus);
          o.start(t + dt);
          o.stop(t + dt + len + 0.02);
        }
        break;
      }
      case "caw": {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(760, t);
        o.frequency.exponentialRampToValueAtTime(300, t + 0.14);
        o.frequency.setValueAtTime(680, t + 0.2);
        o.frequency.exponentialRampToValueAtTime(240, t + 0.36);
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = 1100;
        f.Q.value = 2.2;
        const g = this.env(0.4, 0.16, 0.02);
        o.connect(f).connect(g);
        o.start(t);
        o.stop(t + 0.44);
        break;
      }
      case "whoosh": {
        const s = ctx.createBufferSource();
        s.buffer = this.noise!;
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.Q.value = 0.8;
        f.frequency.setValueAtTime(300, t);
        f.frequency.exponentialRampToValueAtTime(2600, t + 0.5);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.14, t + 0.12);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
        s.connect(f).connect(g).connect(this.sfxBus);
        s.start(t);
        s.stop(t + 0.75);
        break;
      }
      case "win": {
        for (let i = 0; i < 4; i++) {
          const o = ctx.createOscillator();
          o.type = "triangle";
          const f = [220, 277.2, 329.6, 440][i];
          o.frequency.value = f;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t + i * 0.11);
          g.gain.linearRampToValueAtTime(0.14, t + i * 0.11 + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.11 + 1.4);
          o.connect(g).connect(this.sfxBus);
          o.start(t + i * 0.11);
          o.stop(t + i * 0.11 + 1.5);
        }
        break;
      }
    }
  }
}

export const SND = new Sound();
