/* ══════════════════════════════════════════════════════════════
   A small, generative ambient score.
   No autoplay: it only wakes on a gesture, and can always be hushed.
   ══════════════════════════════════════════════════════════════ */
const CHORDS = [
    [174.61, 220.00, 261.63, 329.63],   // Fmaj7
    [196.00, 233.08, 293.66, 349.23],   // Gm7
    [220.00, 261.63, 329.63, 392.00],   // Am7
    [146.83, 174.61, 220.00, 293.66]    // Dm7
  ];
  const MELODY = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

  class AmbientMusic {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.bus = null;
      this.playing = false;
      this.phraseTimer = 0;
      this.suspendTimer = 0;
      this.phraseIndex = 0;
    }

    init() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;

      this.ctx = new AC();
      const ctx = this.ctx;

      this.master = ctx.createGain();
      this.master.gain.value = 0;

      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -22;
      comp.knee.value = 24;
      comp.ratio.value = 2.4;
      comp.attack.value = 0.08;
      comp.release.value = 0.45;

      this.master.connect(comp);
      comp.connect(ctx.destination);

      this.bus = ctx.createGain();
      this.bus.gain.value = 0.9;

      const dry = ctx.createGain();
      dry.gain.value = 0.72;
      this.bus.connect(dry);
      dry.connect(this.master);

      const convolver = ctx.createConvolver();
      convolver.buffer = this.impulse(3.4, 2.6);
      const wet = ctx.createGain();
      wet.gain.value = 0.55;
      this.bus.connect(convolver);
      convolver.connect(wet);
      wet.connect(this.master);

      const delay = ctx.createDelay(2);
      delay.delayTime.value = 0.38;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.22;
      const delayTone = ctx.createBiquadFilter();
      delayTone.type = 'lowpass';
      delayTone.frequency.value = 1600;
      const delayGain = ctx.createGain();
      delayGain.gain.value = 0.18;
      this.bus.connect(delay);
      delay.connect(delayTone);
      delayTone.connect(delayGain);
      delayGain.connect(this.master);
      delayTone.connect(feedback);
      feedback.connect(delay);

      return true;
    }

    impulse(seconds, decay) {
      const ctx = this.ctx;
      const rate = ctx.sampleRate;
      const length = Math.floor(rate * seconds);
      const buffer = ctx.createBuffer(2, length, rate);
      for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
      }
      return buffer;
    }

    async start() {
      try {
        if (!this.ctx && !this.init()) return false;
        window.clearTimeout(this.suspendTimer);
        if (this.ctx.state === 'suspended') await this.ctx.resume();

        const now = this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
        this.master.gain.setTargetAtTime(0.17, now, 1.8);

        if (!this.playing) {
          this.playing = true;
          this.nextPhrase(0.6);
        }
        return true;
      } catch (err) {
        return false;
      }
    }

    stop() {
      this.playing = false;
      window.clearTimeout(this.phraseTimer);
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      try {
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setValueAtTime(this.master.gain.value, now);
        this.master.gain.setTargetAtTime(0.0001, now, 0.5);
      } catch (err) { /* noop */ }
      window.clearTimeout(this.suspendTimer);
      this.suspendTimer = window.setTimeout(() => {
        if (!this.playing && this.ctx) this.ctx.suspend().catch(() => {});
      }, 2200);
    }

    nextPhrase(delay) {
      if (!this.playing) return;
      window.clearTimeout(this.phraseTimer);
      this.phraseTimer = window.setTimeout(() => {
        this.phrase();
        this.nextPhrase(6.2 + Math.random() * 3.4);
      }, Math.max(0, delay * 1000));
    }

    phrase() {
      if (!this.playing || !this.ctx) return;
      const ctx = this.ctx;
      const chord = CHORDS[this.phraseIndex % CHORDS.length];
      this.phraseIndex++;
      const start = ctx.currentTime + 0.08;

      const root = chord[0] / 2;
      this.pad(root, start, 8.4, 0.024);

      chord.forEach((freq, i) => {
        const when = start + i * (0.55 + Math.random() * 0.22);
        this.pluck(freq, when, 3.2, 0.05 - i * 0.005, i % 2 === 0 ? -0.25 : 0.25);
      });

      if (Math.random() > 0.35) {
        const note = MELODY[Math.floor(Math.random() * MELODY.length)];
        this.pluck(note, start + 1.9 + Math.random() * 1.6, 2.8, 0.026, (Math.random() - 0.5) * 0.8);
      }
      if (Math.random() > 0.6) {
        const note = MELODY[Math.floor(Math.random() * MELODY.length)] * 2;
        this.pluck(note, start + 3.6 + Math.random() * 1.4, 2.4, 0.012, (Math.random() - 0.5) * 0.9);
      }
    }

    pluck(freq, when, duration, level, pan) {
      const ctx = this.ctx;
      if (!ctx || freq > 2600) return;

      const osc = ctx.createOscillator();
      const shimmer = ctx.createOscillator();
      const gain = ctx.createGain();
      const tone = ctx.createBiquadFilter();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      osc.type = 'triangle';
      osc.frequency.value = freq;
      shimmer.type = 'sine';
      shimmer.frequency.value = freq * 2.003;
      tone.type = 'lowpass';
      tone.frequency.value = 2100;
      tone.Q.value = 0.4;

      const shimmerGain = ctx.createGain();
      shimmerGain.gain.value = 0.18;

      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), when + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

      osc.connect(tone);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(tone);
      tone.connect(gain);
      if (panner) {
        panner.pan.value = pan;
        gain.connect(panner);
        panner.connect(this.bus);
      } else {
        gain.connect(this.bus);
      }

      osc.start(when);
      shimmer.start(when);
      osc.stop(when + duration + 0.1);
      shimmer.stop(when + duration + 0.1);
    }

    pad(freq, when, duration, level) {
      const ctx = this.ctx;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const tone = ctx.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.value = freq;
      tone.type = 'lowpass';
      tone.frequency.value = 600;
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.linearRampToValueAtTime(level, when + 1.8);
      gain.gain.linearRampToValueAtTime(0.0001, when + duration);
      osc.connect(tone);
      tone.connect(gain);
      gain.connect(this.bus);
      osc.start(when);
      osc.stop(when + duration + 0.1);
    }
  }

export default AmbientMusic;
