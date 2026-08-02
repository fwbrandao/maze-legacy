/**
 * Trilha sonora de aventura em estilo chiptune (Web Audio API).
 */

const NOTES = {
  E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0,
  A3: 220.0, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
  A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
  A5: 880.0, B5: 987.77, C6: 1046.5,
};

const MELODY = [
  'E5', 'G5', 'A5', 'A5', 'G5', 'E5', 'D5', 'D5',
  'C5', 'D5', 'E5', 'E5', 'G5', 'A5', 'B5', 'A5',
  'G5', 'G5', 'E5', 'E5', null, null, null, null,
  'A5', 'G5', 'E5', 'E5', 'D5', 'C5', 'D5', 'D5',
  'E5', 'E5', 'A5', 'A5', 'G5', 'E5', 'D5', 'C5',
  'D5', 'E5', 'G5', 'A5', 'B5', 'A5', 'G5', 'E5',
  'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'G5',
];

const HARMONY = [
  'C5', null, 'E5', null, 'D5', null, 'B4', null,
  'A4', null, 'C5', null, 'E5', null, 'D5', null,
  'B4', null, 'G4', null, null, null, null, null,
  'E5', null, 'C5', null, 'A4', null, 'B4', null,
  'C5', null, 'E5', null, 'G5', null, 'E5', null,
  'D5', null, 'B4', null, 'A4', null, 'G4', null,
  'E5', null, 'C5', null, 'A4', null, 'B4', null,
  'C5', null, 'E5', null, 'G5', null, 'A5', null,
];

const BASS = [
  'A2', 'A2', 'C3', 'C3', 'D3', 'D3', 'E3', 'E3',
  'A2', 'A2', 'G2', 'G2', 'F2', 'F2', 'G2', 'G2',
  'A2', 'A2', 'E2', 'E2', null, null, null, null,
  'A2', 'A2', 'F2', 'F2', 'G2', 'G2', 'C3', 'C3',
  'A2', 'A2', 'E3', 'E3', 'A2', 'A2', 'D3', 'D3',
  'E3', 'E3', 'A2', 'A2', 'B2', 'B2', 'E3', 'E3',
  'A2', 'A2', 'F2', 'F2', 'G2', 'G2', 'C3', 'C3',
  'D3', 'D3', 'E3', 'E3', 'A2', 'A2', 'A2', 'A2',
];

const ARPEGGIO = [
  ['A3', 'C4', 'E4', 'A4'],
  ['F3', 'A3', 'C4', 'F4'],
  ['C3', 'E3', 'G3', 'C4'],
  ['G3', 'B3', 'D4', 'G4'],
];

export class AdventureMusic {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.playing = false;
    this.muted = false;
    this.schedulerId = null;
    this.nextNoteTime = 0;
    this.beat = 0;
    this.tempo = 108;
    this.beatDuration = 60 / this.tempo / 2;
    this.lookahead = 25;
    this.scheduleAhead = 0.12;
    this.loopLength = MELODY.length;
  }

  async init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return;
    }

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.28;
    this.masterGain.connect(this.ctx.destination);
  }

  freq(note) {
    return NOTES[note] ?? 0;
  }

  playTone(freq, start, duration, type, volume) {
    if (!freq || this.muted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.01);
    gain.gain.setValueAtTime(volume * 0.85, start + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration - 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(start);
    osc.stop(start + duration);
  }

  scheduleBeat(beatIndex, time) {
    const dur = this.beatDuration * 0.92;

    const melody = MELODY[beatIndex % this.loopLength];
    const harmony = HARMONY[beatIndex % this.loopLength];
    const bass = BASS[beatIndex % this.loopLength];

    if (melody) {
      this.playTone(this.freq(melody), time, dur, 'square', 0.14);
    }

    if (harmony) {
      this.playTone(this.freq(harmony), time, dur, 'triangle', 0.07);
    }

    if (bass) {
      this.playTone(this.freq(bass), time, dur * 1.1, 'triangle', 0.18);
    }

    const chordSet = ARPEGGIO[Math.floor(beatIndex / 4) % ARPEGGIO.length];
    const arpNote = chordSet[beatIndex % 4];
    if (arpNote) {
      this.playTone(this.freq(arpNote), time, dur * 0.75, 'sine', 0.05);
    }
  }

  scheduler() {
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAhead) {
      this.scheduleBeat(this.beat, this.nextNoteTime);
      this.nextNoteTime += this.beatDuration;
      this.beat = (this.beat + 1) % this.loopLength;
    }
  }

  start() {
    if (!this.ctx || this.playing) return;

    this.playing = true;
    this.beat = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;

    this.schedulerId = setInterval(() => {
      if (this.playing) this.scheduler();
    }, this.lookahead);
  }

  stop() {
    this.playing = false;
    if (this.schedulerId) {
      clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 0.28;
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  async playVictory() {
    if (!this.ctx || this.muted) return;

    const notes = ['C5', 'E5', 'G5', 'C6'];
    const t = this.ctx.currentTime + 0.05;
    notes.forEach((note, i) => {
      this.playTone(this.freq(note), t + i * 0.12, 0.25, 'square', 0.16);
    });
  }

  async playDefeat() {
    if (!this.ctx || this.muted) return;

    const notes = ['E4', 'D4', 'C4', 'A3'];
    const t = this.ctx.currentTime + 0.05;
    notes.forEach((note, i) => {
      this.playTone(this.freq(note), t + i * 0.18, 0.3, 'triangle', 0.12);
    });
  }
}
