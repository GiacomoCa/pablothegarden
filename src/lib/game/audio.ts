// =============================================================================
// Pablo's Garden Run — chiptune music + SFX (Web Audio API)
// -----------------------------------------------------------------------------
// Everything is synthesised at runtime — no audio asset files, no external CDN
// (GDPR-friendly, zero network). The background track is an ORIGINAL 8-bit
// dance loop: a 128 BPM four-on-the-floor groove with a driving arpeggio over an
// Am–F–C–G progression — the kind of euphoric rave riff you can't get out of
// your head, written from scratch so nothing is copied from any real song.
//
// A lookahead scheduler (Chris Wilson's "A Tale of Two Clocks" pattern) keeps
// timing tight: a coarse JS timer schedules precise Web Audio events slightly
// ahead of the audio clock. The AudioContext is created lazily on the first user
// gesture (start of a run) to satisfy browser autoplay policies.
// =============================================================================

const BPM = 128;
const SIXTEENTH = 60 / BPM / 4; // seconds per 16th note
const STEPS = 64; // 4 bars × 16 sixteenths
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.12; // seconds

const MASTER_VOL = 0.42;

function midiToFreq(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

// Chord progression (one bar each): Am – F – C – G.
// `bass` = bass root MIDI; `tones` = three chord tones the arpeggio walks.
const CHORDS: { bass: number; tones: [number, number, number] }[] = [
  { bass: 45, tones: [69, 72, 76] }, // Am : A C E
  { bass: 41, tones: [65, 69, 72] }, // F  : F A C
  { bass: 48, tones: [72, 76, 79] }, // C  : C E G
  { bass: 43, tones: [67, 71, 74] }, // G  : G B D
];

// Arpeggio rhythm/shape per bar (index into chord tones, +3 = octave up, -1 = rest).
// Flowing 16th arp — the recognisable "hook" of the loop.
const ARP: number[] = [0, -1, 1, 2, 3, 2, 1, 2, 0, -1, 1, 3, 2, 3, 1, -1];

type WaveType = OscillatorType;

interface WebkitWindow {
  webkitAudioContext?: typeof AudioContext;
}

export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;

  private playing = false;
  private muted = false;
  private step = 0;
  private nextNoteTime = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private dropBoostUntil = 0;

  get isMuted(): boolean {
    return this.muted;
  }

  /** Create the context + graph on first gesture. Returns false if unsupported. */
  private ensure(): boolean {
    if (this.ctx) return true;
    if (typeof window === 'undefined') return false;
    const Ctor = window.AudioContext || (window as unknown as WebkitWindow).webkitAudioContext;
    if (!Ctor) return false;

    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : MASTER_VOL;
    master.connect(ctx.destination);

    const musicGain = ctx.createGain();
    musicGain.gain.value = 0.9;
    musicGain.connect(master);

    const sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.9;
    sfxGain.connect(master);

    // Pre-baked white noise for hats / claps / hits.
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    this.ctx = ctx;
    this.master = master;
    this.musicGain = musicGain;
    this.sfxGain = sfxGain;
    this.noiseBuf = buf;
    return true;
  }

  // -- low-level voices ------------------------------------------------------

  private tone(
    time: number,
    freq: number,
    dur: number,
    type: WaveType,
    gain: number,
    dest: AudioNode,
    glideTo?: number,
    detune = 0
  ): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const o = ctx.createOscillator();
    o.type = type;
    o.detune.value = detune;
    o.frequency.setValueAtTime(freq, time);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), time + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g).connect(dest);
    o.start(time);
    o.stop(time + dur + 0.03);
  }

  private noise(
    time: number,
    dur: number,
    gain: number,
    filter: BiquadFilterType,
    freq: number,
    dest: AudioNode
  ): void {
    const ctx = this.ctx;
    if (!ctx || !this.noiseBuf) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const bp = ctx.createBiquadFilter();
    bp.type = filter;
    bp.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.connect(bp).connect(g).connect(dest);
    src.start(time);
    src.stop(time + dur + 0.02);
  }

  private kick(time: number, dest: AudioNode): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, time);
    o.frequency.exponentialRampToValueAtTime(46, time + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.9, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
    o.connect(g).connect(dest);
    o.start(time);
    o.stop(time + 0.18);
  }

  // -- the sequencer ---------------------------------------------------------

  private scheduleStep(step: number, time: number): void {
    const music = this.musicGain;
    if (!music) return;
    const inBar = step % 16;
    const bar = Math.floor(step / 16) % 4;
    const chord = CHORDS[bar];
    const boosted = time < this.dropBoostUntil;

    // Kick — four on the floor.
    if (inBar % 4 === 0) this.kick(time, music);

    // Clap/snare on the backbeat.
    if (inBar === 4 || inBar === 12) {
      this.noise(time, 0.14, 0.28, 'bandpass', 1600, music);
    }

    // Hats — offbeat 8ths loud, in-between 16ths as quiet ghosts.
    if (inBar % 2 === 1) {
      const accent = inBar % 4 === 3;
      this.noise(time, accent ? 0.05 : 0.03, accent ? 0.16 : 0.07, 'highpass', 8000, music);
    }

    // Bass — straight driving 8ths on the root (triangle, soft sub).
    if (inBar % 2 === 0) {
      this.tone(time, midiToFreq(chord.bass - 12), SIXTEENTH * 1.7, 'triangle', 0.34, music);
    }

    // Lead arpeggio — the hook (square / pulse).
    const a = ARP[inBar];
    if (a >= 0) {
      const tone = a < 3 ? chord.tones[a] : chord.tones[0] + 12;
      const g = boosted ? 0.2 : 0.15;
      // Two slightly detuned squares = fatter chiptune lead.
      this.tone(time, midiToFreq(tone), SIXTEENTH * 1.4, 'square', g, music, undefined, -6);
      this.tone(time, midiToFreq(tone), SIXTEENTH * 1.4, 'square', g * 0.7, music, undefined, +6);
    }

    // On a drop bar, add a high octave sparkle on the downbeat.
    if (boosted && inBar === 0) {
      this.tone(time, midiToFreq(chord.tones[0] + 24), SIXTEENTH * 2, 'square', 0.12, music);
    }
  }

  private loop = (): void => {
    const ctx = this.ctx;
    if (!ctx || !this.playing || ctx.state !== 'running') return;
    while (this.nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD) {
      this.scheduleStep(this.step, this.nextNoteTime);
      this.nextNoteTime += SIXTEENTH;
      this.step = (this.step + 1) % STEPS;
    }
  };

  // -- public API ------------------------------------------------------------

  /** Begin the music loop (call from within a user gesture). */
  start(): void {
    if (!this.ensure() || !this.ctx) return;
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    if (this.playing) return;
    this.playing = true;
    this.step = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.08;
    this.timer = setInterval(this.loop, LOOKAHEAD_MS);
  }

  /** Stop the music loop (SFX tails ring out naturally). */
  stop(): void {
    this.playing = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : MASTER_VOL, this.ctx.currentTime, 0.02);
    }
  }

  resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
      // Re-arm the scheduler (suspend() stops it). Reseed nextNoteTime so the
      // frozen clock doesn't cause a burst of catch-up notes.
      if (this.playing && !this.timer) {
        this.nextNoteTime = this.ctx.currentTime + 0.08;
        this.timer = setInterval(this.loop, LOOKAHEAD_MS);
      }
    }
  }

  suspend(): void {
    if (this.ctx && this.ctx.state === 'running') {
      void this.ctx.suspend();
      // Stop the lookahead timer too, so we don't burn wakeups while suspended.
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  }

  /** Release everything (on close/unmount). */
  dispose(): void {
    this.stop();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.master = this.musicGain = this.sfxGain = null;
      this.noiseBuf = null;
    }
  }

  // -- sound effects ---------------------------------------------------------

  private now(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  flap(): void {
    if (!this.ensure() || !this.sfxGain) return;
    const t = this.now();
    this.tone(t, 380, 0.12, 'square', 0.16, this.sfxGain, 780);
  }

  coin(): void {
    if (!this.ensure() || !this.sfxGain) return;
    const t = this.now();
    // Classic two-tone pickup.
    this.tone(t, midiToFreq(88), 0.07, 'square', 0.18, this.sfxGain);
    this.tone(t + 0.07, midiToFreq(93), 0.14, 'square', 0.18, this.sfxGain);
  }

  hit(): void {
    if (!this.ensure() || !this.sfxGain) return;
    const t = this.now();
    this.noise(t, 0.2, 0.4, 'lowpass', 2200, this.sfxGain);
    this.tone(t, 220, 0.3, 'sawtooth', 0.3, this.sfxGain, 60);
  }

  gameOver(): void {
    if (!this.ensure() || !this.sfxGain) return;
    const t = this.now();
    const notes = [76, 72, 67, 60];
    notes.forEach((n, i) => {
      this.tone(t + i * 0.12, midiToFreq(n), 0.18, 'square', 0.2, this.sfxGain!);
    });
  }

  /** Rising sweep on a score "drop" + a one-bar lead boost. */
  drop(): void {
    if (!this.ensure() || !this.sfxGain) return;
    const t = this.now();
    this.noise(t, 0.4, 0.22, 'bandpass', 1200, this.sfxGain);
    this.tone(t, 200, 0.4, 'sawtooth', 0.16, this.sfxGain, 1800);
    this.dropBoostUntil = t + (60 / BPM) * 2; // ~2 beats of extra sparkle
  }
}
