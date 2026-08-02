/**
 * Trilhas sonoras de aventura por fase — estilo chiptune (Web Audio API).
 */

const NOTES = {
  E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0,
  A3: 220.0, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
  A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
  A5: 880.0, B5: 987.77, C6: 1046.5,
};

const PITCHES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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

function transpose(note, semitones) {
  if (!note) return null;
  return midiToNote(noteToMidi(note) + semitones);
}

function transposeTrack(track, semitones) {
  const map = (arr) => arr.map((n) => transpose(n, semitones));
  return {
    ...track,
    melody: map(track.melody),
    harmony: map(track.harmony),
    bass: map(track.bass),
    arpeggio: track.arpeggio.map((chord) => map(chord)),
  };
}

const TRACKS = [
  {
    name: 'Alvorecer',
    tempo: 94,
    melody: ['E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'G5', 'A5', 'B5', 'A5', 'G5', 'E5', null],
    harmony: ['C5', null, 'E5', null, 'G5', null, 'E5', null, 'C5', null, 'D5', null, 'B4', null, 'G4', null],
    bass: ['A2', 'A2', 'C3', 'C3', 'G2', 'G2', 'F2', 'F2', 'A2', 'A2', 'E3', 'E3', 'D3', 'D3', 'A2', 'A2'],
    arpeggio: [['A3', 'C4', 'E4', 'A4'], ['G3', 'B3', 'D4', 'G4'], ['F3', 'A3', 'C4', 'F4'], ['E3', 'G3', 'B3', 'E4']],
  },
  {
    name: 'Floresta',
    tempo: 102,
    melody: ['D5', 'F5', 'G5', 'A5', 'G5', 'F5', 'D5', 'C5', 'D5', 'E5', 'G5', 'G5', 'A5', 'G5', 'F5', 'D5'],
    harmony: [null, 'A4', null, 'F4', null, 'D4', null, 'A4', null, 'C5', null, 'G4', null, 'E4', null, 'D4'],
    bass: ['D3', 'D3', 'G2', 'G2', 'A2', 'A2', 'D3', 'D3', 'G2', 'G2', 'C3', 'C3', 'A2', 'A2', 'D3', 'D3'],
    arpeggio: [['D3', 'F3', 'A3', 'D4'], ['G3', 'B3', 'D4', 'G4'], ['A3', 'C4', 'E4', 'A4'], ['D3', 'F3', 'A3', 'D4']],
  },
  {
    name: 'Caverna',
    tempo: 108,
    melody: ['A4', 'C5', 'D5', 'D5', 'C5', 'A4', 'G4', 'A4', 'C5', 'E5', 'D5', 'C5', 'A4', null, 'G4', 'A4'],
    harmony: ['E4', null, 'G4', null, 'A4', null, 'E4', null, 'C5', null, 'G4', null, 'E4', null, 'C4', null],
    bass: ['A2', 'A2', 'A2', 'E3', 'A2', 'A2', 'G2', 'G2', 'F2', 'F2', 'E3', 'E3', 'A2', 'A2', 'G2', 'A2'],
    arpeggio: [['A2', 'E3', 'A3', 'C4'], ['A2', 'E3', 'G3', 'C4'], ['G2', 'D3', 'G3', 'B3'], ['A2', 'E3', 'A3', 'E4']],
  },
  {
    name: 'Montanha',
    tempo: 110,
    melody: ['G4', 'C5', 'E5', 'G5', 'E5', 'C5', 'G4', 'E4', 'C5', 'D5', 'E5', 'G5', 'A5', 'G5', 'E5', 'C5'],
    harmony: [null, 'E4', null, 'G4', null, 'C5', null, 'G4', null, 'A4', null, 'C5', null, 'E5', null, 'G4'],
    bass: ['C3', 'C3', 'G2', 'G2', 'C3', 'C3', 'E3', 'E3', 'A2', 'A2', 'D3', 'D3', 'G2', 'G2', 'C3', 'C3'],
    arpeggio: [['C3', 'E3', 'G3', 'C4'], ['G2', 'B2', 'D3', 'G3'], ['A2', 'C3', 'E3', 'A3'], ['C3', 'G3', 'C4', 'E4']],
  },
  {
    name: 'Deserto',
    tempo: 96,
    melody: ['E5', null, 'D5', null, 'C5', 'D5', 'E5', null, 'G5', null, 'E5', null, 'D5', 'C5', 'B4', 'A4'],
    harmony: [null, 'G4', null, 'F4', null, 'E4', null, 'G4', null, 'C5', null, 'B4', null, 'A4', null, 'G4'],
    bass: ['A2', null, 'G2', null, 'F2', null, 'G2', null, 'C3', null, 'B2', null, 'A2', null, 'E2', null],
    arpeggio: [['A3', 'C4', 'E4', 'G4'], ['G3', 'B3', 'D4', 'F4'], ['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4']],
  },
  {
    name: 'Rio',
    tempo: 118,
    melody: ['C5', 'E5', 'G5', 'E5', 'C5', 'D5', 'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'G5'],
    harmony: ['G4', null, 'C5', null, 'E5', null, 'G4', null, 'E5', null, 'C5', null, 'G4', null, 'E4', null],
    bass: ['C3', 'G2', 'C3', 'E3', 'A2', 'E3', 'A2', 'D3', 'G2', 'D3', 'G2', 'C3', 'F2', 'C3', 'G2', 'C3'],
    arpeggio: [['C4', 'E4', 'G4', 'C5'], ['G3', 'B3', 'D4', 'G4'], ['A3', 'C4', 'E4', 'A4'], ['F3', 'A3', 'C4', 'F4']],
  },
  {
    name: 'Ruínas',
    tempo: 100,
    melody: ['A4', 'B4', 'C5', 'E5', 'D5', 'C5', 'B4', 'A4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'D5', 'C5'],
    harmony: [null, 'G4', null, 'A4', null, 'E4', null, 'C4', null, 'B3', null, 'G4', null, 'C5', null, 'A4'],
    bass: ['A2', 'E3', 'A2', 'C3', 'G2', 'C3', 'G2', 'A2', 'E2', 'A2', 'E2', 'G2', 'C3', 'G2', 'F2', 'E2'],
    arpeggio: [['A3', 'C4', 'E4', 'B4'], ['E3', 'G3', 'B3', 'E4'], ['C3', 'E3', 'G3', 'C4'], ['G3', 'B3', 'D4', 'G4']],
  },
  {
    name: 'Tempestade',
    tempo: 124,
    melody: ['E5', 'E5', 'G5', 'A5', 'B5', 'A5', 'G5', 'E5', 'D5', 'E5', 'G5', 'B5', 'A5', 'G5', 'E5', 'D5'],
    harmony: ['C5', 'C5', null, 'E5', null, 'G5', null, 'E5', 'C5', null, 'D5', null, 'B4', null, 'G4', 'F4'],
    bass: ['A2', 'A2', 'C3', 'E3', 'A3', 'G2', 'F2', 'E2', 'D3', 'E3', 'G2', 'B2', 'A2', 'G2', 'F2', 'E2'],
    arpeggio: [['A3', 'E4', 'A4', 'C5'], ['C4', 'E4', 'G4', 'C5'], ['G3', 'B3', 'D4', 'G4'], ['E3', 'B3', 'E4', 'G4']],
  },
  {
    name: 'Abismo',
    tempo: 112,
    melody: ['G4', 'G4', 'A4', 'C5', 'D5', 'C5', 'A4', 'G4', 'F4', 'G4', 'A4', 'C5', 'D5', 'E5', 'D5', 'C5'],
    harmony: ['E4', null, 'G4', null, 'A4', null, 'G4', null, 'F4', null, 'E4', null, 'C4', null, 'D4', null],
    bass: ['G2', 'G2', 'C3', 'C3', 'D3', 'D3', 'G2', 'G2', 'F2', 'F2', 'E2', 'E2', 'C3', 'C3', 'G2', 'G2'],
    arpeggio: [['G2', 'D3', 'G3', 'B3'], ['C3', 'G3', 'C4', 'E4'], ['D3', 'A3', 'D4', 'F4'], ['G2', 'B2', 'D3', 'G3']],
  },
  {
    name: 'Cristais',
    tempo: 116,
    melody: ['E5', 'G5', 'B5', 'G5', 'E5', 'C6', 'B5', 'G5', 'E5', 'G5', 'A5', 'B5', 'C6', 'B5', 'A5', 'G5'],
    harmony: [null, 'C5', null, 'D5', null, 'G5', null, 'E5', null, 'C5', null, 'E5', null, 'G5', null, 'B4'],
    bass: ['C3', 'G2', 'C3', 'E3', 'G2', 'C3', 'E3', 'B2', 'A2', 'E3', 'A2', 'D3', 'G2', 'C3', 'G2', 'C3'],
    arpeggio: [['C4', 'E4', 'G4', 'B4'], ['G3', 'B3', 'D4', 'G4'], ['A3', 'C4', 'E4', 'A4'], ['E3', 'G3', 'B3', 'E4']],
  },
  {
    name: 'Vulcão',
    tempo: 126,
    melody: ['A4', 'C5', 'E5', 'A5', 'G5', 'E5', 'C5', 'A4', 'B4', 'D5', 'F5', 'A5', 'G5', 'F5', 'D5', 'B4'],
    harmony: ['E4', 'E4', null, 'C5', null, 'G4', null, 'E4', 'F4', null, 'A4', null, 'G4', null, 'F4', 'D4'],
    bass: ['A2', 'A2', 'E3', 'E3', 'A2', 'G2', 'F2', 'E2', 'B2', 'B2', 'F3', 'F3', 'G2', 'E2', 'D2', 'E2'],
    arpeggio: [['A3', 'C4', 'E4', 'A4'], ['E3', 'G3', 'B3', 'E4'], ['F3', 'A3', 'C4', 'F4'], ['B2', 'D3', 'F3', 'A3']],
  },
  {
    name: 'Legado',
    tempo: 120,
    melody: ['E5', 'G5', 'A5', 'B5', 'C6', 'B5', 'A5', 'G5', 'E5', 'G5', 'A5', 'G5', 'F5', 'E5', 'D5', 'E5'],
    harmony: ['C5', null, 'E5', null, 'G5', null, 'E5', null, 'C5', null, 'D5', null, 'B4', null, 'G4', null],
    bass: ['A2', 'C3', 'E3', 'A3', 'G2', 'B2', 'E3', 'A2', 'F2', 'A2', 'D3', 'G2', 'C3', 'E3', 'A2', 'A2'],
    arpeggio: [['A3', 'C4', 'E4', 'A4'], ['F3', 'A3', 'C4', 'F4'], ['C3', 'E3', 'G3', 'C4'], ['G3', 'B3', 'D4', 'G4']],
  },
];

export function getTrackForLevel(level) {
  const index = (level - 1) % TRACKS.length;
  const cycle = Math.floor((level - 1) / TRACKS.length);
  const base = TRACKS[index];
  const varied = cycle > 0 ? transposeTrack(base, cycle * 2) : base;

  return {
    ...varied,
    name: cycle > 0 ? `${base.name} II` : base.name,
    tempo: Math.min(varied.tempo + cycle * 3, 140),
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
