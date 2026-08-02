/**
 * Trilhas sonoras de aventura — uma composição única por fase (Web Audio API).
 */

const NOTES = {
  E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0,
  A3: 220.0, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
  A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
  A5: 880.0, B5: 987.77, C6: 1046.5,
};

const PITCHES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
};

const ROOTS = ['A', 'C', 'D', 'E', 'F', 'G'];

const NAME_PREFIXES = [
  'Alvorecer', 'Floresta', 'Caverna', 'Montanha', 'Deserto', 'Rio',
  'Ruínas', 'Tempestade', 'Abismo', 'Cristais', 'Vulcão', 'Legado',
  'Névoa', 'Portal', 'Oásis', 'Fortaleza', 'Templo', 'Cânion',
  'Maré', 'Eclipse', 'Aurora', 'Sombra', 'Horizonte', 'Labirinto',
];

const NAME_SUFFIXES = [
  'Perdido', 'Antigo', 'Sagrado', 'Oculto', 'Eterno', 'Profundo',
  'Distante', 'Místico', 'Selvagem', 'Dourado', 'Silencioso', 'Esquecido',
  'Ascendente', 'Submerso', 'Flamejante', 'Gélido',
];

const MELODY_PATTERNS = [
  [0, 2, 4, 2, 0, -1, -2, -1, 0, 2, 4, 5, 4, 2, 0, null],
  [4, 2, 0, 2, 4, 5, 4, 2, 0, -1, 0, 2, 4, 4, 2, 0],
  [0, 0, 2, 4, 5, 4, 2, 0, -2, -1, 0, 2, 3, 2, 0, null],
  [2, 4, 5, 4, 2, 0, 2, 4, 5, 5, 4, 2, 0, -1, 0, 2],
  [0, 2, 3, 5, 4, 3, 2, 0, 2, 4, 5, 4, 3, 2, 0, null],
  [5, 4, 2, 0, 2, 4, 5, 4, 2, 0, -1, 0, 2, 4, 2, 0],
  [0, 3, 5, 3, 0, 2, 4, 2, 0, -2, 0, 3, 5, 4, 2, 0],
  [4, 5, 4, 2, 0, 2, 4, 5, 6, 5, 4, 2, 0, -1, -2, 0],
];

const BASS_PATTERNS = [
  [0, 0, 3, 3, 4, 4, 0, 0, 5, 5, 3, 3, 4, 4, 0, 0],
  [0, 0, 0, 4, 3, 3, 0, 0, 5, 5, 4, 4, 0, 0, 3, 3],
  [0, null, 3, null, 4, null, 0, null, 5, null, 3, null, 0, null, 4, null],
  [0, 0, 5, 5, 3, 3, 4, 4, 0, 0, 3, 3, 5, 5, 0, 0],
];

const CHORD_PROGRESSIONS = [
  [0, 3, 4, 5],
  [0, 4, 5, 3],
  [0, 5, 3, 4],
  [0, 3, 5, 4],
  [0, 4, 3, 0],
  [0, 5, 4, 0],
];

function noteToMidi(note) {
  if (!note) return null;
  const match = note.match(/^([A-G])(#)?(\d)$/);
  if (!match) return null;
  const idx = PITCHES.indexOf(match[1] + (match[2] || ''));
  return (parseInt(match[3], 10) + 1) * 12 + idx;
}

function midiToNote(midi) {
  const octave = Math.floor(midi / 12) - 1;
  const pitch = PITCHES[((midi % 12) + 12) % 12];
  return `${pitch}${octave}`;
}

function createRng(seed) {
  let state = (seed * 16807 + 12345) % 2147483647;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function pick(rng, array) {
  return array[Math.floor(rng() * array.length)];
}

function scaleDegreeToNote(rootMidi, scale, degree, octaveBase = 4) {
  if (degree === null) return null;
  const octaves = Math.floor(degree / scale.length);
  const wrapped = ((degree % scale.length) + scale.length) % scale.length;
  const midi = rootMidi + scale[wrapped] + (octaveBase - 4 + octaves) * 12;
  return midiToNote(midi);
}

function buildChordNotes(rootMidi, scale, degree, octaveBase = 3) {
  return [
    scaleDegreeToNote(rootMidi, scale, degree, octaveBase),
    scaleDegreeToNote(rootMidi, scale, degree + 2, octaveBase),
    scaleDegreeToNote(rootMidi, scale, degree + 4, octaveBase),
    scaleDegreeToNote(rootMidi, scale, degree + 4, octaveBase + 1),
  ];
}

function shiftPattern(pattern, shift) {
  return pattern.map((d) => (d === null ? null : d + shift));
}

export function getTrackForLevel(level) {
  const rng = createRng(level * 9973 + 42);
  const root = pick(rng, ROOTS);
  const scaleName = pick(rng, Object.keys(SCALES));
  const scale = SCALES[scaleName];
  const rootMidi = noteToMidi(`${root}3`);

  const melodyPattern = pick(rng, MELODY_PATTERNS);
  const bassPattern = pick(rng, BASS_PATTERNS);
  const progression = pick(rng, CHORD_PROGRESSIONS);
  const patternShift = Math.floor(rng() * 3) - 1;

  const shiftedMelody = shiftPattern(melodyPattern, patternShift);
  const melody = shiftedMelody.map((deg) =>
    scaleDegreeToNote(rootMidi, scale, deg, 5)
  );

  const harmony = shiftedMelody.map((deg, i) => {
    if (deg === null || rng() < 0.35) return null;
    return scaleDegreeToNote(rootMidi, scale, deg - 2, 4);
  });

  const bass = bassPattern.map((deg) =>
    deg === null ? null : scaleDegreeToNote(rootMidi, scale, deg, 2)
  );

  const arpeggio = progression.map((chordDeg) =>
    buildChordNotes(rootMidi, scale, chordDeg, 3)
  );

  const tempo = 90 + ((level * 7 + Math.floor(rng() * 12)) % 38);

  const prefix = NAME_PREFIXES[(level - 1) % NAME_PREFIXES.length];
  const suffix = NAME_SUFFIXES[Math.floor(rng() * NAME_SUFFIXES.length)];
  const name = level <= NAME_PREFIXES.length
    ? prefix
    : `${prefix} ${suffix}`;

  return {
    name,
    tempo,
    melody,
    harmony,
    bass,
    arpeggio,
    level,
  };
}

export class AdventureMusic {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.playing = false;
    this.muted = false;
    this.schedulerId = null;
    this.nextNoteTime = 0;
    this.beat = 0;
    this.level = 1;
    this.track = getTrackForLevel(1);
    this.tempo = this.track.tempo;
    this.beatDuration = 60 / this.tempo / 2;
    this.lookahead = 25;
    this.scheduleAhead = 0.12;
    this.loopLength = this.track.melody.length;
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

  loadLevel(level) {
    this.level = level;
    this.track = getTrackForLevel(level);
    this.tempo = this.track.tempo;
    this.beatDuration = 60 / this.tempo / 2;
    this.loopLength = this.track.melody.length;
    this.beat = 0;
  }

  getTrackName() {
    return this.track.name;
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
    const { melody, harmony, bass, arpeggio } = this.track;
    const i = beatIndex % this.loopLength;

    if (melody[i]) {
      this.playTone(this.freq(melody[i]), time, dur, 'square', 0.14);
    }

    if (harmony[i]) {
      this.playTone(this.freq(harmony[i]), time, dur, 'triangle', 0.07);
    }

    if (bass[i]) {
      this.playTone(this.freq(bass[i]), time, dur * 1.1, 'triangle', 0.18);
    }

    const chordSet = arpeggio[Math.floor(beatIndex / 4) % arpeggio.length];
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

  start(level = this.level) {
    if (!this.ctx) return;

    this.stop();
    this.loadLevel(level);
    this.playing = true;
    this.nextNoteTime = this.ctx.currentTime + 0.05;

    this.schedulerId = setInterval(() => {
      if (this.playing) this.scheduler();
    }, this.lookahead);
  }

  startLevel(level) {
    if (!this.ctx) return;
    const shouldPlay = this.playing && !this.muted;
    this.stop();
    this.loadLevel(level);
    if (shouldPlay) this.start(level);
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

  playVictory() {
    if (!this.ctx || this.muted) return;

    const notes = ['C5', 'E5', 'G5', 'C6'];
    const t = this.ctx.currentTime + 0.05;
    notes.forEach((note, i) => {
      this.playTone(this.freq(note), t + i * 0.12, 0.25, 'square', 0.16);
    });
  }

  playDefeat() {
    if (!this.ctx || this.muted) return;

    const notes = ['E4', 'D4', 'C4', 'A3'];
    const t = this.ctx.currentTime + 0.05;
    notes.forEach((note, i) => {
      this.playTone(this.freq(note), t + i * 0.18, 0.3, 'triangle', 0.12);
    });
  }
}
