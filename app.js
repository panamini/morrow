'use strict';

const APP_SCHEMA_VERSION = 9;
const STORAGE_KEY = 'dawnChamberV4State';
const MASTER_GAIN_CEILING = 1;
const OUTPUT_GAIN_BOOST = 2.15;
const OUTPUT_GAIN_CEILING = 1.85;
const WAKE_FOCUS_SETTLE_MS = 1900;
const GRID_GEOMETRY_HARD_RULE = 'If the constellation cannot fit, shrink the orbit';
const POINTER_MOVE_THRESHOLD = 8;
const WORLD_LABEL_HIDE_SAFE_MIN = 540;
const WORLD_DEFAULT_SOUND_MODE = 'world-default';
const TUNING_A4_HZ = 432;

function equalTemperamentHzFromMidi(midiNote, a4Hz = TUNING_A4_HZ) {
  return a4Hz * Math.pow(2, (midiNote - 69) / 12);
}

const BED_DURATION_OPTIONS = [
  { id: '10m', label: '10', ms: 10 * 60 * 1000 },
  { id: '15m', label: '15', ms: 15 * 60 * 1000 },
  { id: '30m', label: '30', ms: 30 * 60 * 1000 },
  { id: '1h', label: '1h', ms: 60 * 60 * 1000 },
  { id: 'night', label: 'night', ms: null }
];

const SOUND_MODES = [
  { id: 'still-water', name: '432 Still Water', referenceHz: '432 Hz', description: 'A=432-style consonance: 216 Hz bed with 432 Hz octave bloom, calm and rounded.', baseFrequency: 216, partialRatios: [0.5, 1, 1.25, 1.5, 2, 2.5], droneRatios: [0.5, 1, 2], strikeGrammar: [{ ratio: 1, weight: 7 }, { ratio: 2, weight: 6 }, { ratio: 1.5, weight: 5 }, { ratio: 1.25, weight: 2 }, { ratio: 2.5, weight: 1 }, { ratio: 0.5, weight: 1 }], bowlDensity: 0.20, shimmerProbability: 0.10, nightSafeCutoff: 720, binaural: { allowed: false, deltaHz: 2 }, ritualLabel: '432 Hz musical tuning reference' },
  {
    id: 'blue-bowl',
    name: 'F# Blue Lullaby',
    referenceHz: 'F# / 432 lullaby field',
    description: 'Low F# bedtime field: blue-water pedal, soft fifths, slow 6/9 resolutions, no piercing upper bowl.',
    baseFrequency: Number(equalTemperamentHzFromMidi(42).toFixed(2)), // F#2 = 90.82 at A432
    partialRatios: [
      0.5,
      1,
      1.122,
      1.26,
      1.498,
      1.682,
      2,
      2.245,
      2.52,
      2.997,
      3.364,
      4
    ],
    droneRatios: [
      1,
      1.498,
      2,
      2.245
    ],
    strikeGrammar: [
      { ratio: 1.498, weight: 10 },
      { ratio: 2, weight: 9 },
      { ratio: 1.682, weight: 7 },
      { ratio: 2.245, weight: 5 },
      { ratio: 1, weight: 3.5 },
      { ratio: 2.997, weight: 2.4 },
      { ratio: 2.52, weight: 1.8 },
      { ratio: 3.364, weight: 1.2 },
      { ratio: 1.122, weight: 0.8 },
      { ratio: 1.26, weight: 0.6 },
      { ratio: 4, weight: 0.22 },
      { ratio: 0.5, weight: 0.2 }
    ],
    bowlDensity: 0.025,
    shimmerProbability: 0.002,
    nightSafeCutoff: 480,
    binaural: { allowed: false, deltaHz: 2 },
    ritualLabel: 'F# lullaby field tuned from A=432',
    engineV2: {
      style: 'lullaby',
      phraseGapsMs: {
        bedside: [34000, 89000],
        object: [13000, 55000],
        ringing: [8000, 34000]
      },
      phraseGapSequenceMs: {
        bedside: [55000, 89000, 34000, 55000, 144000],
        object: [13000, 21000, 34000, 21000, 55000],
        ringing: [8000, 13000, 21000, 13000, 34000]
      },
      restProbability: {
        bedside: 0.72,
        object: 0.34,
        ringing: 0.18
      },
      maxEventsPerPhrase: {
        bedside: 1,
        object: 2,
        ringing: 2
      },
      attackSeconds: [2.8, 9.5],
      releaseSeconds: [24, 76],
      gainScale: 0.56,
      foregroundGainScale: 0.74,
      repeatMemory: 8,
      droneVoiceLimit: 4,
      orderedPhraseCells: [
        [1.498],
        [1.682, 1.498],
        [2, 1.498],
        [2.245, 2],
        [2.52, 2.245],
        [3.364, 2.997],
        [1.682, 1.498],
        [1]
      ],
      phraseCells: [
        [1.498],
        [1.682, 1.498],
        [2, 1.498],
        [2.245, 2],
        [2.52, 2.245],
        [2.997, 2.245],
        [1, 1.498],
        [2, 2.245, 1.682],
        [1.498, 1],
        [1]
      ]
    }
  },
  { id: 'limestone-harmonic', name: '417 Limestone Shift', referenceHz: '417 Hz', description: '417 Hz reference through 139 Hz fundamentals: mineral, slightly tense, good for transition.', baseFrequency: 139, partialRatios: [1, 1.5, 2, 3, 4.5, 6], droneRatios: [0.5, 1, 3], strikeGrammar: [{ ratio: 1, weight: 7 }, { ratio: 3, weight: 5 }, { ratio: 1.5, weight: 4 }, { ratio: 2, weight: 3 }, { ratio: 4.5, weight: 1 }, { ratio: 6, weight: 1 }], bowlDensity: 0.32, shimmerProbability: 0.18, nightSafeCutoff: 900, binaural: { allowed: false, deltaHz: 2 }, ritualLabel: '417 Hz symbolic frequency reference' },
  { id: 'night-temple', name: '138/111 Night Temple', referenceHz: '138 Hz + 111 Hz', description: 'The sleep anchor: 138 Hz bowl, 111 Hz night drone, slow binaural only with headphones.', baseFrequency: 138, partialRatios: [0.804, 1, 1.25, 1.5, 2, 2.25], droneRatios: [0.804, 1, 1.5], strikeGrammar: [{ ratio: 1, weight: 8 }, { ratio: 1.5, weight: 5 }, { ratio: 0.804, weight: 4 }, { ratio: 2, weight: 3 }, { ratio: 1.25, weight: 2 }, { ratio: 2.25, weight: 1 }], bowlDensity: 0.22, shimmerProbability: 0.12, nightSafeCutoff: 640, binaural: { allowed: true, deltaHz: 2 }, ritualLabel: '138 Hz bowl with 111 Hz night drone reference' },
  { id: 'glass-orbit', name: '528 Glass Orbit', referenceHz: '528 Hz', description: '528 Hz octave bloom from a 264 Hz bed: brighter, glassier, more wake-forward.', baseFrequency: 264, partialRatios: [0.5, 1, 1.25, 1.5, 2, 3], droneRatios: [0.5, 1, 2], strikeGrammar: [{ ratio: 1, weight: 6 }, { ratio: 2, weight: 6 }, { ratio: 1.5, weight: 4 }, { ratio: 1.25, weight: 3 }, { ratio: 3, weight: 2 }, { ratio: 0.5, weight: 1 }], bowlDensity: 0.40, shimmerProbability: 0.42, nightSafeCutoff: 1180, binaural: { allowed: false, deltaHz: 3 }, ritualLabel: '528 Hz symbolic frequency reference' },
  { id: 'deep-return', name: '174 Deep Return', referenceHz: '174 Hz', description: '174 Hz low reference from an 87 Hz bed: grounded, sparse, slow physical weight.', baseFrequency: 87, partialRatios: [1, 2, 3, 4, 5, 6], droneRatios: [1, 2, 3], strikeGrammar: [{ ratio: 2, weight: 8 }, { ratio: 1, weight: 6 }, { ratio: 3, weight: 5 }, { ratio: 4, weight: 2 }, { ratio: 5, weight: 1 }, { ratio: 6, weight: 1 }], bowlDensity: 0.16, shimmerProbability: 0.06, nightSafeCutoff: 520, binaural: { allowed: false, deltaHz: 1.5 }, ritualLabel: '174 Hz symbolic frequency reference' },
  { id: 'ember-human', name: '639 Ember Human', referenceHz: '639 Hz', description: '639 Hz upper bloom from 213 Hz: warm midrange, closer, more human and present.', baseFrequency: 213, partialRatios: [0.5, 1, 1.125, 1.5, 2, 3], droneRatios: [0.5, 1, 1.5], strikeGrammar: [{ ratio: 1, weight: 7 }, { ratio: 1.5, weight: 6 }, { ratio: 3, weight: 5 }, { ratio: 2, weight: 3 }, { ratio: 1.125, weight: 2 }, { ratio: 0.5, weight: 1 }], bowlDensity: 0.30, shimmerProbability: 0.18, nightSafeCutoff: 860, binaural: { allowed: false, deltaHz: 2 }, ritualLabel: '639 Hz symbolic frequency reference' },
  { id: 'near-silent', name: '7.83 Quiet Field', referenceHz: '7.83 Hz', description: 'Near-silent air with optional 7.83 Hz-style delta reference: minimal notes, maximum space.', baseFrequency: 98, partialRatios: [1, 1.5, 2, 3], droneRatios: [0.5, 1], strikeGrammar: [{ ratio: 1, weight: 9 }, { ratio: 1.5, weight: 4 }, { ratio: 2, weight: 3 }, { ratio: 3, weight: 1 }], bowlDensity: 0.08, shimmerProbability: 0.02, nightSafeCutoff: 380, binaural: { allowed: true, deltaHz: 7.83 }, ritualLabel: '7.83 Hz symbolic binaural reference' },
  {
    id: 'human-return',
    name: 'D Human Return',
    referenceHz: 'D / Dorian 6/9 field',
    description: 'Low D human field: breath-like pedal, Dorian 6/9 compassion, slow tension and release.',
    baseFrequency: Number(equalTemperamentHzFromMidi(38).toFixed(2)), // D2 at A432
    partialRatios: [
      0.5,
      1,
      1.122,
      1.189,
      1.335,
      1.498,
      1.682,
      2,
      2.245,
      2.378,
      2.670,
      2.997,
      3.364,
      4
    ],
    droneRatios: [
      1,
      1.498,
      2,
      2.245
    ],
    strikeGrammar: [
      { ratio: 1.498, weight: 10 },
      { ratio: 2, weight: 8 },
      { ratio: 1.682, weight: 7 },
      { ratio: 2.245, weight: 5 },
      { ratio: 1.189, weight: 4 },
      { ratio: 1, weight: 3.5 },
      { ratio: 2.997, weight: 2.4 },
      { ratio: 2.378, weight: 1.8 },
      { ratio: 1.335, weight: 1.3 },
      { ratio: 3.364, weight: 1.0 },
      { ratio: 4, weight: 0.20 },
      { ratio: 0.5, weight: 0.15 }
    ],
    bowlDensity: 0.018,
    shimmerProbability: 0.001,
    nightSafeCutoff: 430,
    binaural: { allowed: false, deltaHz: 2 },
    ritualLabel: 'D Dorian human-return field tuned from A=432',
    engineV2: {
      style: 'human',
      phraseGapsMs: {
        bedside: [55000, 144000],
        object: [21000, 89000],
        ringing: [13000, 55000]
      },
      phraseGapSequenceMs: {
        bedside: [89000, 144000, 55000, 89000, 233000],
        object: [21000, 34000, 55000, 34000, 89000],
        ringing: [13000, 21000, 34000, 21000, 55000]
      },
      restProbability: {
        bedside: 0.78,
        object: 0.46,
        ringing: 0.24
      },
      maxEventsPerPhrase: {
        bedside: 1,
        object: 2,
        ringing: 2
      },
      attackSeconds: [5.5, 18],
      releaseSeconds: [34, 110],
      gainScale: 0.50,
      foregroundGainScale: 0.64,
      repeatMemory: 10,
      droneVoiceLimit: 4,
      orderedPhraseCells: [
        [1.498],
        [1.682, 1.498],
        [1.189, 1],
        [2.245, 2],
        [1.335, 1.498],
        [2.378, 2],
        [3.364, 2.997],
        [1]
      ],
      phraseCells: [
        [1.498],
        [1.682, 1.498],
        [1.189, 1],
        [2.245, 2],
        [1.335, 1.498],
        [2.378, 2],
        [1, 1.498],
        [2, 2.245, 1.682],
        [1.498, 1],
        [1]
      ]
    }
  },
  {
    id: 'space-field',
    name: 'C# Space Field',
    referenceHz: 'C# / F# 6/9 field',
    description: 'C#-dominant F# 6/9 drone: deep, almost still, no beat, slow room pressure.',
    baseFrequency: Number(equalTemperamentHzFromMidi(37).toFixed(2)), // C#2 = 68.04 at A432
    partialRatios: [0.667, 1, 1.5, 2, 2.667, 3, 3.375, 4, 4.5, 6.024, 8.058],
    droneRatios: [1, 2, 6.024, 4, 1.5, 3, 0.667, 2.667],
    strikeGrammar: [
      { ratio: 1, weight: 10 },
      { ratio: 2, weight: 8 },
      { ratio: 1.5, weight: 6 },
      { ratio: 4, weight: 4 },
      { ratio: 6.024, weight: 3.2 },
      { ratio: 3, weight: 2.4 },
      { ratio: 2.667, weight: 2 },
      { ratio: 4.5, weight: 0.6 },
      { ratio: 3.375, weight: 0.45 },
      { ratio: 8.058, weight: 0.35 },
      { ratio: 0.667, weight: 0.25 }
    ],
    bowlDensity: 0.025,
    shimmerProbability: 0.003,
    nightSafeCutoff: 520,
    binaural: { allowed: false, deltaHz: 2 },
    ritualLabel: 'C#-anchored F# 6/9 drone reference',
    engineV2: {
      style: 'field',
      phraseGapsMs: { bedside: [52000, 150000], object: [26000, 90000], ringing: [11000, 42000] },
      restProbability: { bedside: 0.76, object: 0.52, ringing: 0.22 },
      maxEventsPerPhrase: { bedside: 1, object: 1, ringing: 2 },
      attackSeconds: [7, 24],
      releaseSeconds: [22, 70],
      gainScale: 0.62,
      foregroundGainScale: 0.72,
      repeatMemory: 6,
      droneVoiceLimit: 8,
      phraseCells: [
        [1],
        [2],
        [4],
        [6.024],
        [1, 2],
        [1.5, 2],
        [2, 4],
        [4, 6.024],
        [1, 4],
        [3, 4],
        [4.5],
        [8.058]
      ]
    }
  },
  {
    id: 'neroli-thread',
    name: 'E Neroli Thread',
    referenceHz: 'E / Phrygian thread',
    description: 'Sparse E-centered phrygian thread: single tones, soft dissonance, no beat, botanical stillness.',
    baseFrequency: Number(equalTemperamentHzFromMidi(40).toFixed(2)), // E2 = 80.91 at A432
    partialRatios: [0.5, 1.194, 1.486, 1.789, 2.127, 2.397, 2.531, 2.842, 3.185, 3.578, 4.257, 4.788],
    droneRatios: [0.5, 1.194],
    strikeGrammar: [
      { ratio: 2.127, weight: 10 },
      { ratio: 1.789, weight: 8 },
      { ratio: 1.194, weight: 5 },
      { ratio: 2.397, weight: 4 },
      { ratio: 2.531, weight: 2 },
      { ratio: 3.185, weight: 1.5 },
      { ratio: 1.486, weight: 1.2 },
      { ratio: 2.842, weight: 0.7 },
      { ratio: 3.578, weight: 0.6 },
      { ratio: 4.257, weight: 0.45 },
      { ratio: 4.788, weight: 0.35 },
      { ratio: 0.5, weight: 0.25 }
    ],
    bowlDensity: 0.018,
    shimmerProbability: 0.006,
    nightSafeCutoff: 430,
    binaural: { allowed: false, deltaHz: 2 },
    ritualLabel: 'E-centered phrygian thread reference',
    engineV2: {
      style: 'thread',
      phraseGapsMs: {
        bedside: [42000, 120000],
        object: [8500, 24000],
        ringing: [5000, 18000]
      },
      restProbability: {
        bedside: 0.62,
        object: 0.18,
        ringing: 0.10
      },
      maxEventsPerPhrase: {
        bedside: 1,
        object: 1,
        ringing: 2
      },
      attackSeconds: [0.18, 1.4],
      releaseSeconds: [8, 26],
      gainScale: 1.18,
      foregroundGainScale: 1.35,
      repeatMemory: 7,
      droneVoiceLimit: 2,
      phraseCells: [
        [2.127],
        [1.789],
        [2.397],
        [2.127],
        [1.789, 2.127],
        [2.127, 2.397],
        [2.127, 2.531],
        [1.194, 2.127],
        [3.185],
        [2.842, 2.127]
      ]
    }
  },
  {
    id: 'phi-dawn-chorale',
    name: 'Phi Dawn Chorale',
    referenceHz: 'C / Lydian 6/9 wake chorale',
    description: 'Peaceful melodic alarm: C Lydian 6/9, Fibonacci pacing, soft C5 presence, no harsh beeps.',
    baseFrequency: Number(equalTemperamentHzFromMidi(48).toFixed(2)), // C3 = 128.43 at A432
    partialRatios: [
      0.5,
      1,
      1.122,
      1.260,
      1.414,
      1.498,
      1.682,
      2,
      2.245,
      2.520,
      2.828,
      2.997,
      3.364,
      4,
      4.490
    ],
    droneRatios: [
      1,
      1.498,
      2,
      2.245
    ],
    strikeGrammar: [
      { ratio: 2, weight: 10 },
      { ratio: 2.997, weight: 9 },
      { ratio: 2.245, weight: 7 },
      { ratio: 2.520, weight: 6 },
      { ratio: 3.364, weight: 4 },
      { ratio: 1.498, weight: 3.5 },
      { ratio: 2.828, weight: 2.4 },
      { ratio: 4, weight: 2.2 },
      { ratio: 4.490, weight: 0.6 },
      { ratio: 1, weight: 0.4 },
      { ratio: 0.5, weight: 0.1 }
    ],
    bowlDensity: 0.05,
    shimmerProbability: 0.004,
    nightSafeCutoff: 760,
    binaural: { allowed: false, deltaHz: 2 },
    ritualLabel: 'C Lydian wake chorale tuned from A=432',
    engineV2: {
      style: 'wake-chorale',
      phraseGapsMs: {
        bedside: [34000, 89000],
        object: [13000, 55000],
        ringing: [5000, 21000]
      },
      phraseGapSequenceMs: {
        ringing: [21000, 13000, 21000, 8000, 13000, 5000, 8000, 3000]
      },
      restProbability: {
        bedside: 0.60,
        object: 0.24,
        ringing: 0.04
      },
      maxEventsPerPhrase: {
        bedside: 1,
        object: 2,
        ringing: 4
      },
      attackSeconds: [0.8, 4.2],
      releaseSeconds: [8, 32],
      gainScale: 0.62,
      foregroundGainScale: 0.78,
      repeatMemory: 7,
      droneVoiceLimit: 4,
      wakeRatioCeilings: [
        { atMinute: 0, maxRatio: 2.245 },
        { atMinute: 2, maxRatio: 2.520 },
        { atMinute: 3, maxRatio: 2.997 },
        { atMinute: 5, maxRatio: 3.364 },
        { atMinute: 8, maxRatio: 4 },
        { atMinute: 13, maxRatio: 4.490 }
      ],
      orderedPhraseCells: [
        [1.498, 2],
        [1.682, 1.498],
        [1.122, 1.260],
        [2.245, 2],
        [1.260, 1.498, 2],
        [2.520, 2.997],
        [2.828, 2.997],
        [3.364, 2.997],
        [4, 3.364, 2.997],
        [2.997, 2.520, 2]
      ],
      phraseCells: [
        [2],
        [2.245, 2],
        [2.520, 2.997],
        [3.364, 2.997],
        [2.828, 2.997],
        [2.245, 2.520, 2.997],
        [4, 3.364, 2.997],
        [2.997, 2.520, 2]
      ]
    }
  },
  {
    id: 'night-nest',
    name: 'A Night Nest',
    referenceHz: 'A / minor 6/9 sleep field',
    description: 'Low A sleep field: breath-paced softness, pink-noise-like warmth, sparse minor 6/9 resolution.',
    baseFrequency: Number(equalTemperamentHzFromMidi(45).toFixed(2)), // A2 = 108.00 at A432
    partialRatios: [
      0.5,
      1,
      1.189,
      1.335,
      1.498,
      1.682,
      1.782,
      2,
      2.378,
      2.670,
      2.997,
      3.364
    ],
    droneRatios: [
      0.5,
      1,
      1.498,
      2
    ],
    strikeGrammar: [
      { ratio: 1.498, weight: 10 },
      { ratio: 1, weight: 9 },
      { ratio: 2, weight: 6 },
      { ratio: 1.335, weight: 5 },
      { ratio: 1.682, weight: 4 },
      { ratio: 1.189, weight: 3 },
      { ratio: 1.782, weight: 1.4 },
      { ratio: 2.378, weight: 0.8 },
      { ratio: 2.670, weight: 0.6 },
      { ratio: 2.997, weight: 0.35 },
      { ratio: 3.364, weight: 0.12 },
      { ratio: 0.5, weight: 0.4 }
    ],
    bowlDensity: 0.010,
    shimmerProbability: 0.000,
    nightSafeCutoff: 360,
    binaural: { allowed: false, deltaHz: 2 },
    ritualLabel: 'A minor sleep field tuned from A=432',
    engineV2: {
      style: 'sleep-nest',
      phraseGapsMs: {
        bedside: [55000, 180000],
        object: [18000, 64000],
        ringing: [21000, 89000]
      },
      phraseGapSequenceMs: {
        bedside: [55000, 89000, 144000, 89000, 180000],
        object: [21000, 34000, 55000, 34000, 21000, 89000],
        ringing: [21000, 34000, 55000, 34000, 89000]
      },
      restProbability: {
        bedside: 0.80,
        object: 0.38,
        ringing: 0.42
      },
      maxEventsPerPhrase: {
        bedside: 1,
        object: 2,
        ringing: 2
      },
      attackSeconds: [6, 22],
      releaseSeconds: [42, 150],
      gainScale: 0.46,
      foregroundGainScale: 0.58,
      repeatMemory: 10,
      droneVoiceLimit: 4,
      sleepNoise: {
        enabled: true,
        color: 'pink-brown',
        gain: 0.014,
        bedsideGain: 0.020,
        lowpassHz: 560,
        highpassHz: 38,
        breathingRateHz: 0.10,
        breathingDepth: 0.08
      },
      orderedPhraseCells: [
        [1.498],
        [1.335, 1],
        [1.682, 1.498],
        [1.189, 1],
        [2, 1.498],
        [1.335, 1.189],
        [1.782, 1.682],
        [1],
        [0.5, 1]
      ],
      phraseCells: [
        [1.498],
        [1.335, 1],
        [1.682, 1.498],
        [1.189, 1],
        [2, 1.498],
        [1.335, 1.189],
        [1.782, 1.682],
        [1],
        [0.5, 1]
      ]
    }
  }
];

const WORLDS = [
  { id: 'milk-blue', name: 'Milk Blue', mood: 'cyan membrane, cobalt depth, quiet wall', soundMode: 'blue-bowl', visualScore: 'blue-bowl', palettes: { object: { wall: '#141d30', spill: '#0937ce', outer: '#5ff0c7', inner: '#79f0dd', core: '#244d9a', core2: '#43a7c2', shadow: '#02030a' }, bedside: { wall: '#020710', spill: '#061f4a', outer: '#2aa982', inner: '#3b7b8f', core: '#081120', core2: '#102439', shadow: '#000204' }, wake: { wall: '#7f563c', spill: '#c7efe2', outer: '#d7fff0', inner: '#a9ffd9', core: '#4a6475', core2: '#81c4c0', shadow: '#1b120d' } } },
  { id: 'ember-mouth', name: 'Ember Mouth', mood: 'red field, violet center, warm return', soundMode: 'ember-human', visualScore: 'default', palettes: { object: { wall: '#210205', spill: '#6b0c17', outer: '#ff2c61', inner: '#ff5269', core: '#45165f', core2: '#bd1c3a', shadow: '#050003' }, bedside: { wall: '#080203', spill: '#2c0710', outer: '#973b34', inner: '#79293f', core: '#1d0b25', core2: '#32101b', shadow: '#010000' }, wake: { wall: '#5b1d12', spill: '#fd7252', outer: '#ff9b63', inner: '#f65342', core: '#50364b', core2: '#cf4e35', shadow: '#160603' } } },
  { id: 'violet-arc', name: 'Violet Arc', mood: 'black aperture, violet edge, moving hush', soundMode: 'space-field', visualScore: 'space-field', palettes: { object: { wall: '#010106', spill: '#1b0d42', outer: '#896dff', inner: '#4629b4', core: '#020205', core2: '#0b0b16', shadow: '#000000' }, bedside: { wall: '#000000', spill: '#08031a', outer: '#33236a', inner: '#24155c', core: '#000000', core2: '#050509', shadow: '#000000' }, wake: { wall: '#08070f', spill: '#321271', outer: '#b9a0ff', inner: '#6757f5', core: '#090913', core2: '#1a1742', shadow: '#000000' } } },
  { id: 'sakura-depth', name: 'Sakura Depth', mood: 'rose bloom, dark center, gridded softness', soundMode: 'neroli-thread', visualScore: 'neroli-thread', palettes: { object: { wall: '#ead7dd', spill: '#ff8bc7', outer: '#ffd2f0', inner: '#ff0f72', core: '#3b0628', core2: '#b50747', shadow: '#210215' }, bedside: { wall: '#150a10', spill: '#4b1231', outer: '#8b2a66', inner: '#a01f54', core: '#140412', core2: '#360619', shadow: '#020001' }, wake: { wall: '#f1e6ea', spill: '#ffb3da', outer: '#ffe2f3', inner: '#ff4d9a', core: '#6f174d', core2: '#fb1d79', shadow: '#321222' } } },
  { id: 'mineral-green', name: 'Mineral Green', mood: 'green rim, blue interior, earthen room', soundMode: 'still-water', visualScore: 'default', palettes: { object: { wall: '#30351a', spill: '#6a7427', outer: '#dbff36', inner: '#82e872', core: '#065ee9', core2: '#233d7c', shadow: '#0a0d04' }, bedside: { wall: '#071005', spill: '#1e2d10', outer: '#557e2c', inner: '#3c7851', core: '#021d2f', core2: '#0e263c', shadow: '#000201' }, wake: { wall: '#4e4f32', spill: '#a4ac54', outer: '#edff4b', inner: '#a7ee5d', core: '#056bff', core2: '#315a9a', shadow: '#171909' } } },
  { id: 'paper-sun', name: 'Paper Sun', mood: 'print-like warmth, red yellow diffusion', soundMode: 'glass-orbit', visualScore: 'default', palettes: { object: { wall: '#f2eee6', spill: '#ffe36e', outer: '#fff5cf', inner: '#ffb44a', core: '#39150d', core2: '#e20d18', shadow: '#1a0804' }, bedside: { wall: '#1a150e', spill: '#4a2b0b', outer: '#8d5725', inner: '#9b3a28', core: '#120704', core2: '#3b160b', shadow: '#020100' }, wake: { wall: '#f2eee6', spill: '#ffe78d', outer: '#fff8d8', inner: '#ffcf55', core: '#5a1b10', core2: '#ee2d1b', shadow: '#2a0a04' } } },
  { id: 'phi-dawn', name: 'Phi Dawn', mood: 'golden dawn, soft chorale, peaceful return', soundMode: 'phi-dawn-chorale', visualScore: 'phi-dawn', palettes: { object: { wall: '#f2eee6', spill: '#ffe36e', outer: '#fff5cf', inner: '#ffb44a', core: '#39150d', core2: '#e20d18', shadow: '#1a0804' }, bedside: { wall: '#1a150e', spill: '#4a2b0b', outer: '#8d5725', inner: '#9b3a28', core: '#120704', core2: '#3b160b', shadow: '#020100' }, wake: { wall: '#f2eee6', spill: '#ffe78d', outer: '#fff8d8', inner: '#ffcf55', core: '#5a1b10', core2: '#ee2d1b', shadow: '#2a0a04' } } },
  { id: 'night-nest', name: 'Night Nest', mood: 'low blue shelter, soft breath, sleep return', soundMode: 'night-nest', visualScore: 'night-nest', palettes: { object: { wall: '#020714', spill: '#061a3d', outer: '#2d7286', inner: '#3b8a88', core: '#01040b', core2: '#071226', shadow: '#000104' }, bedside: { wall: '#00030a', spill: '#031026', outer: '#164355', inner: '#1f5b5c', core: '#000207', core2: '#040b17', shadow: '#000000' }, wake: { wall: '#07111f', spill: '#0b2a55', outer: '#3a8794', inner: '#4fa09a', core: '#020713', core2: '#0b1d34', shadow: '#000207' } } },
  { id: 'focus-white', name: 'Focus White', mood: 'paper edge, dark eye, silent center', soundMode: 'human-return', visualScore: 'human-return', palettes: { object: { wall: '#ececea', spill: '#ffffff', outer: '#f8f8f4', inner: '#9a9a96', core: '#050505', core2: '#303030', shadow: '#000000' }, bedside: { wall: '#d8d8d4', spill: '#f0f0ec', outer: '#e7e7e2', inner: '#7b7b78', core: '#000000', core2: '#202020', shadow: '#000000' }, wake: { wall: '#f6f6f2', spill: '#ffffff', outer: '#ffffff', inner: '#bfbfba', core: '#0a0a0a', core2: '#444440', shadow: '#000000' } } }
];

const WAKE_CURVE = [
  { atMinute: 0, name: 'firstBreath', visualIntensity: 0.06, audioDensity: 0.02, masterGainTarget: 0.16, layers: ['air'] },
  { atMinute: 1, name: 'roomAppears', visualIntensity: 0.10, audioDensity: 0.04, masterGainTarget: 0.19, layers: ['air'] },
  { atMinute: 2, name: 'bodyReturns', visualIntensity: 0.18, audioDensity: 0.08, masterGainTarget: 0.23, layers: ['air', 'lowDrone'] },
  { atMinute: 3, name: 'safeFifth', visualIntensity: 0.26, audioDensity: 0.14, masterGainTarget: 0.29, layers: ['air', 'lowDrone', 'fifth'] },
  { atMinute: 5, name: 'firstMelody', visualIntensity: 0.36, audioDensity: 0.24, masterGainTarget: 0.37, layers: ['air', 'lowDrone', 'melody'] },
  { atMinute: 8, name: 'dawnChorale', visualIntensity: 0.50, audioDensity: 0.36, masterGainTarget: 0.47, layers: ['air', 'drone', 'melody', 'chorale'] },
  { atMinute: 13, name: 'clearMorning', visualIntensity: 0.66, audioDensity: 0.54, masterGainTarget: 0.58, layers: ['air', 'drone', 'melody', 'chorale', 'c5'] },
  { atMinute: 21, name: 'awakePresence', visualIntensity: 0.78, audioDensity: 0.70, masterGainTarget: 0.68, layers: ['air', 'drone', 'melody', 'chorale', 'c5', 'return'] },
  { atMinute: 34, name: 'persistentPeace', visualIntensity: 0.86, audioDensity: 0.82, masterGainTarget: 0.76, layers: ['air', 'drone', 'melody', 'chorale', 'c5', 'return'] }
];

const DEFAULT_STATE = {
  schemaVersion: APP_SCHEMA_VERSION,
  currentMode: 'object',
  previousMode: 'object',
  selectedWorldId: 'milk-blue',
  wakeWorldId: 'milk-blue',
  bedsideDuration: '30m',
  alarm: { enabled: true, time: '07:30', snoozeMinutes: 9, lastTriggeredKey: '' },
  settings: {
    visualBrightness: 0.86,
    reduceMotion: false,
    use24h: true,
    audio: {
      masterVolume: 0.90,
      objectVolume: 0.88,
      bedsideVolume: 0.68,
      wakeVolume: 0.95,
      airVolume: 0.55,
      strikeVolume: 0.72,
      shimmerAmount: 0.34,
      limiterCeiling: 1,
      binauralEnabled: true,
      binauralDeltaHz: 2,
      soundMode: WORLD_DEFAULT_SOUND_MODE,
      worldSoundModes: {}
    }
  }
};

const audioState = {
  unlocked: false,
  audioContextState: 'none',
  audioPlaybackState: 'stopped',
  userFacingAudioState: 'STOPPED',
  lastGestureAt: null,
  lastAudioError: null,
  lastAudioStopReason: null,
  currentAudioSessionId: 0,
  explicitStopOnly: true,
  activeNodes: 0,
  activeOscillators: 0,
  activeTimers: 0,
  currentMode: 'none',
  currentWorldId: null,
  currentSoundModeId: 'night-temple',
  engineStyle: 'legacy',
  lastPhraseAt: 0,
  lastEventAt: 0,
  masterGainValue: 0,
  modeGainValue: 0,
  compressorEnabled: false,
  limiterCeiling: MASTER_GAIN_CEILING,
  binauralEnabled: true,
  deltaHz: 2
};

const visualState = {
  brightness: DEFAULT_STATE.settings.visualBrightness,
  audioIntensity: 0,
  wakeVisualIntensity: 0,
  objectTapPulseUntil: 0,
  modeClarity: 0.82,
  apertureShape: 'circle'
};

let state = loadState();
let renderer = null;
let audioEngine = null;
let clockTimer = null;
let alarmTimer = null;
let bedsideIdleTimer = null;
let bedsideSessionTimer = null;
let diagnosticsTimer = null;
let wakeCurveTimer = null;
let wakeCurveStartedAt = 0;
let gridOverlayEnabled = false;
let sensoryPointer = null;
let durationPointer = null;
let wakePointer = null;
let wakeWorldPointer = null;
let wakeSettleTimer = null;
let wakeEntryGuardUntil = 0;
let wakeLastEntryAt = 0;
let wakePreviewActive = false;
let worldPointer = null;
let worldLongHoldTimer = null;
let wheelWorldThrottleAt = 0;
let apertureTapToggleArmed = false;

const wakeSetState = {
  wakeStep: 'time',
  editingPart: 'hour',
  activePart: null,
  isDragging: false,
  dragRing: null,
  candidateHour: parseTime(state.alarm.time).hour,
  candidateMinute: parseTime(state.alarm.time).minute,
  committedTime: state.alarm.time,
  lastStableAngle: 0,
  lastHitRing: null,
  lastInteractionAt: 0
};

const worldSelectionState = {
  focusedWorld: state.selectedWorldId,
  stagedWorld: null,
  selectedWorld: state.selectedWorldId,
  activeWorld: state.selectedWorldId,
  entryMode: 'object',
  labelHidden: false,
  geometry: null
};

const dom = {};

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function modulo(value, length) { return ((value % length) + length) % length; }
function pad2(value) { return String(value).padStart(2, '0'); }
function nowMs() { return Date.now(); }
function getWakePhase(minute) {
  let current = WAKE_CURVE[0];
  let next = WAKE_CURVE[WAKE_CURVE.length - 1];
  for (let index = 0; index < WAKE_CURVE.length; index += 1) {
    if (minute >= WAKE_CURVE[index].atMinute) current = WAKE_CURVE[index];
    if (WAKE_CURVE[index].atMinute > minute) { next = WAKE_CURVE[index]; break; }
  }
  const span = Math.max(1, next.atMinute - current.atMinute);
  const t = current === next ? 1 : clamp((minute - current.atMinute) / span, 0, 1);
  return {
    atMinute: minute,
    name: current.name,
    visualIntensity: lerp(current.visualIntensity, next.visualIntensity, t),
    audioDensity: lerp(current.audioDensity, next.audioDensity, t),
    masterGainTarget: lerp(current.masterGainTarget, next.masterGainTarget, t),
    layers: current.layers
  };
}
function getCurrentWakePhase() {
  const startedAt = wakeCurveStartedAt || Date.now();
  return getWakePhase((Date.now() - startedAt) / 60000);
}
function parseTime(value) {
  const parts = String(value || '07:30').split(':').map(Number);
  return { hour: Number.isFinite(parts[0]) ? clamp(parts[0], 0, 23) : 7, minute: Number.isFinite(parts[1]) ? clamp(parts[1], 0, 59) : 30 };
}
function formatTime(hour, minute) { return `${pad2(modulo(hour, 24))}:${pad2(modulo(minute, 60))}`; }
function hexToRgb(hex) {
  const clean = String(hex || '#000000').replace('#', '');
  const normalized = clean.length === 3 ? clean.split('').map((char) => `${char}${char}`).join('') : clean;
  const parsed = parseInt(normalized, 16);
  return { r: (parsed >> 16) & 255, g: (parsed >> 8) & 255, b: parsed & 255 };
}
function rgba(hex, alpha) { const c = hexToRgb(hex); return `rgba(${c.r},${c.g},${c.b},${alpha})`; }
function mixHex(a, b, t) {
  const ca = hexToRgb(a); const cb = hexToRgb(b);
  return `rgb(${Math.round(lerp(ca.r, cb.r, t))},${Math.round(lerp(ca.g, cb.g, t))},${Math.round(lerp(ca.b, cb.b, t))})`;
}
function parseCssPixels(value, fallback = 0) {
  const parsed = Number.parseFloat(String(value || '').trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}
function getWorld(id = state.selectedWorldId) { return WORLDS.find((world) => world.id === id) || WORLDS[0]; }
function getSoundMode(id = 'night-temple') { return SOUND_MODES.find((mode) => mode.id === id) || SOUND_MODES[2]; }
function getWorldSoundModeId(world = getWorld()) {
  const override = state.settings.audio.worldSoundModes?.[world.id];
  return SOUND_MODES.some((mode) => mode.id === override) ? override : world.soundMode;
}
function getEffectiveSoundMode(world = getWorld()) {
  return getSoundMode(getWorldSoundModeId(world));
}
function getWakeSoundMode(world = getWorld()) {
  return getSoundMode(world.soundMode);
}
function getVisualScore(world = getWorld()) {
  return world.visualScore || 'default';
}
function recordError(scope, error) {
  const message = error && error.message ? error.message : String(error || 'Unknown error');
  audioState.lastAudioError = `${scope}: ${message}`;
  if (typeof console !== 'undefined' && typeof console.error === 'function') console.error(`[Dawn Chamber] ${scope}`, error);
  return audioState.lastAudioError;
}
function safeStorageGet(key) { try { return window.localStorage.getItem(key); } catch (error) { recordError('safeStorageGet', error); return null; } }
function safeStorageSet(key, value) { try { window.localStorage.setItem(key, value); return true; } catch (error) { recordError('safeStorageSet', error); return false; } }
function validateState(candidate) {
  const next = clone(DEFAULT_STATE);
  if (!candidate || typeof candidate !== 'object') return next;
  if (WORLDS.some((world) => world.id === candidate.selectedWorldId)) next.selectedWorldId = candidate.selectedWorldId;
  if (WORLDS.some((world) => world.id === candidate.wakeWorldId)) next.wakeWorldId = candidate.wakeWorldId;
  if (BED_DURATION_OPTIONS.some((option) => option.id === candidate.bedsideDuration)) next.bedsideDuration = candidate.bedsideDuration;
  if (candidate.alarm && typeof candidate.alarm === 'object') Object.assign(next.alarm, candidate.alarm);
  if (!/^\d{2}:\d{2}$/.test(next.alarm.time)) next.alarm.time = DEFAULT_STATE.alarm.time;
  if (candidate.settings && typeof candidate.settings === 'object') {
    Object.assign(next.settings, candidate.settings);
    next.settings.audio = Object.assign(clone(DEFAULT_STATE.settings.audio), candidate.settings.audio || {});
  }
  if (!next.settings.audio.worldSoundModes || typeof next.settings.audio.worldSoundModes !== 'object') next.settings.audio.worldSoundModes = {};
  Object.keys(next.settings.audio.worldSoundModes).forEach((worldId) => {
    const modeId = next.settings.audio.worldSoundModes[worldId];
    const validWorld = WORLDS.some((world) => world.id === worldId);
    const validMode = SOUND_MODES.some((mode) => mode.id === modeId);
    if (!validWorld || !validMode || (modeId === 'phi-dawn-chorale' && worldId !== 'phi-dawn')) delete next.settings.audio.worldSoundModes[worldId];
  });
  ['masterVolume', 'objectVolume', 'bedsideVolume', 'wakeVolume', 'airVolume', 'strikeVolume', 'shimmerAmount'].forEach((key) => {
    const value = Number(next.settings.audio[key]);
    next.settings.audio[key] = Number.isFinite(value) ? clamp(value, 0, 1) : DEFAULT_STATE.settings.audio[key];
  });
  next.settings.audio.limiterCeiling = clamp(Number(next.settings.audio.limiterCeiling) || MASTER_GAIN_CEILING, 0, MASTER_GAIN_CEILING);
  next.settings.audio.binauralDeltaHz = clamp(Number(next.settings.audio.binauralDeltaHz) || 2, 1, 4);
  const savedSchema = Number(candidate.schemaVersion) || 0;
  const soundModeIsValid = next.settings.audio.soundMode === WORLD_DEFAULT_SOUND_MODE || SOUND_MODES.some((mode) => mode.id === next.settings.audio.soundMode);
  if (!soundModeIsValid || savedSchema < 9) next.settings.audio.soundMode = WORLD_DEFAULT_SOUND_MODE;
  next.settings.audio.soundMode = WORLD_DEFAULT_SOUND_MODE;
  next.settings.use24h = Boolean(next.settings.use24h);
  next.currentMode = 'object';
  next.schemaVersion = APP_SCHEMA_VERSION;
  return next;
}
function loadState() {
  if (typeof window === 'undefined') return clone(DEFAULT_STATE);
  const raw = safeStorageGet(STORAGE_KEY);
  if (!raw) return clone(DEFAULT_STATE);
  try { return validateState(JSON.parse(raw)); } catch (error) { recordError('loadState parse', error); return clone(DEFAULT_STATE); }
}
function saveState() { safeStorageSet(STORAGE_KEY, JSON.stringify(state)); }

function setActiveVisualWorld(worldId = state.selectedWorldId) {
  document.body.dataset.world = getWorld(worldId).id;
}

function cacheDom() {
  [
    'apertureCanvas', 'grain', 'debugGridOverlay', 'toast', 'soundToggleButton', 'objectPanel', 'objectGestureSurface', 'objectTime', 'nextWake', 'objectRail', 'railBed', 'railWake', 'railWorld', 'railSet',
    'bedsidePanel', 'bedsideGestureSurface', 'bedsideTime', 'bedsideSoundBreath', 'bedsideWorldPrev', 'bedsideWorldNext', 'durationRow', 'bedsideRail', 'bedsideDurationButton', 'bedsideExitButton',
    'wakeSetPanel', 'wakeCloseButton', 'wakeGestureArea', 'hourRing', 'minuteRing', 'wakeHour', 'wakeMinute', 'wakeHourValue', 'wakeMinuteValue', 'wakeColon', 'wakeWorldSelector', 'wakeWorldPrev', 'wakeWorldName', 'wakeWorldNext', 'wakeRail', 'wakeRailClose', 'wakeSetConfirmButton',
    'worldsPanel', 'worldsCloseButton', 'wakeWorldMemory', 'worldConstellation', 'worldPrevButton', 'worldNextButton', 'worldCopy', 'worldConstellationName', 'worldHint', 'worldRail', 'worldBackButton',
    'settingsPanel', 'settingsBackdrop', 'settingsSheet', 'settingsCloseButton', 'soundModeSelect', 'soundModeDescription', 'binauralToggle', 'deltaReadout', 'deltaSlider', 'masterVolumeReadout', 'masterVolume', 'bedsideVolumeReadout', 'bedsideVolume', 'objectVolumeReadout', 'objectVolume', 'wakeVolumeReadout', 'wakeVolume', 'airVolumeReadout', 'airVolume', 'strikeVolumeReadout', 'strikeVolume', 'shimmerReadout', 'shimmerAmount', 'softTestButton', 'mediumTestButton', 'wakeTestButton', 'stopAudioButton', 'brightnessReadout', 'brightnessSlider', 'reduceMotionToggle', 'use24hToggle', 'openSafetyButton', 'openDiagnosticsButton', 'diagGridButton',
    'safetyPanel', 'safetyBackdrop', 'safetySheet', 'safetyCloseButton',
    'diagnosticsPanel', 'diagnosticsBackdrop', 'diagnosticsSheet', 'diagnosticsCloseButton', 'diagToneButton', 'diagPlayButton', 'diagBedsideButton', 'diagWakeButton', 'diagStopButton', 'diagGridButton2', 'diagnosticsOutput',
    'ringingPanel', 'ringingTime', 'wakePhaseDots', 'stopWakeButton', 'snoozeWakeButton'
  ].forEach((id) => { dom[id] = document.getElementById(id); });
}

function showToast(message, duration = 1800) {
  if (!dom.toast) return;
  dom.toast.textContent = message;
  dom.toast.classList.add('is-visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => dom.toast.classList.remove('is-visible'), duration);
}

function createApertureRenderer(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let width = 0; let height = 0; let dpr = 1; let rafId = 0; let running = false;
  let mode = 'object'; let worldId = state.selectedWorldId; let displayWorldId = worldId; let crossfade = 1; let crossfadeStart = 0; const crossfadeMs = 900;
  function resizeCanvasToDisplaySize() {
    const rect = canvas.getBoundingClientRect();
    const nextDpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const nextWidth = Math.max(1, Math.round(rect.width * nextDpr));
    const nextHeight = Math.max(1, Math.round(rect.height * nextDpr));
    if (nextWidth !== width || nextHeight !== height || nextDpr !== dpr) { width = nextWidth; height = nextHeight; dpr = nextDpr; canvas.width = width; canvas.height = height; }
  }
  function paletteFor(world, renderMode) { return world.palettes[renderMode === 'bedside' ? 'bedside' : renderMode === 'wakeSet' || renderMode === 'ringing' ? 'wake' : 'object']; }
  function mixedPalette(time) {
    if (crossfade < 1) crossfade = clamp((time - crossfadeStart) / crossfadeMs, 0, 1);
    const from = paletteFor(getWorld(displayWorldId), mode);
    const to = paletteFor(getWorld(worldId), mode);
    const out = {};
    ['wall', 'spill', 'outer', 'inner', 'core', 'core2', 'shadow'].forEach((key) => { out[key] = crossfade < 1 ? mixHex(from[key], to[key], crossfade) : to[key]; });
    if (crossfade >= 1) displayWorldId = worldId;
    return out;
  }
  function currentVisualScore() {
    return getVisualScore(getWorld(worldId));
  }
  function visualProfileFor(score) {
    if (score === 'blue-bowl') {
      return {
        breatheRate: 0.00018,
        breatheDepth: 0.006,
        audioBreathe: 0.010,
        driftXRate: 0.000060,
        driftYRate: 0.000052,
        driftX: 0.030,
        driftY: 0.024,
        outerScale: 2.50,
        innerScale: 1.62,
        coreScale: 1.16,
        outerAlpha: 1.04,
        innerAlpha: 0.96,
        coreAlpha: 1.06,
        rimAlpha: 0.88,
        ceilingAlpha: 0.86,
        pulseGain: 0.08,
        eventWindowMs: 7000,
        eventAlpha: 0.14
      };
    }

    if (score === 'space-field') {
      return {
        breatheRate: 0.00016,
        breatheDepth: 0.006,
        audioBreathe: 0.010,
        driftXRate: 0.000055,
        driftYRate: 0.000045,
        driftX: 0.030,
        driftY: 0.024,
        outerScale: 2.72,
        innerScale: 1.86,
        coreScale: 1.16,
        outerAlpha: 1.22,
        innerAlpha: 0.82,
        coreAlpha: 1.08,
        rimAlpha: 0.78,
        ceilingAlpha: 1.35,
        pulseGain: 0.08,
        eventWindowMs: 1600,
        eventAlpha: 0
      };
    }

    if (score === 'neroli-thread') {
      return {
        breatheRate: 0.00028,
        breatheDepth: 0.008,
        audioBreathe: 0.012,
        driftXRate: 0.000095,
        driftYRate: 0.000082,
        driftX: 0.034,
        driftY: 0.026,
        outerScale: 2.22,
        innerScale: 1.56,
        coreScale: 1.10,
        outerAlpha: 0.92,
        innerAlpha: 1.06,
        coreAlpha: 1.04,
        rimAlpha: 1.18,
        ceilingAlpha: 0.78,
        pulseGain: 0.10,
        eventWindowMs: 4200,
        eventAlpha: 0.34
      };
    }

    if (score === 'human-return') {
      return {
        breatheRate: 0.00012,
        breatheDepth: 0.0045,
        audioBreathe: 0.007,
        driftXRate: 0.000040,
        driftYRate: 0.000036,
        driftX: 0.018,
        driftY: 0.016,
        outerScale: 2.35,
        innerScale: 1.50,
        coreScale: 1.08,
        outerAlpha: 0.72,
        innerAlpha: 0.82,
        coreAlpha: 1.10,
        rimAlpha: 0.62,
        ceilingAlpha: 0.52,
        pulseGain: 0.04,
        eventWindowMs: 9000,
        eventAlpha: 0.10
      };
    }

    if (score === 'phi-dawn') {
      return {
        breatheRate: 0.00016,
        breatheDepth: 0.006,
        audioBreathe: 0.012,
        driftXRate: 0.000052,
        driftYRate: 0.000046,
        driftX: 0.024,
        driftY: 0.020,
        outerScale: 2.58,
        innerScale: 1.70,
        coreScale: 1.14,
        outerAlpha: 1.10,
        innerAlpha: 0.94,
        coreAlpha: 1.04,
        rimAlpha: 0.92,
        ceilingAlpha: 1.12,
        pulseGain: 0.06,
        eventWindowMs: 8000,
        eventAlpha: 0.12
      };
    }

    if (score === 'night-nest') {
      return {
        breatheRate: 0.00010,
        breatheDepth: 0.004,
        audioBreathe: 0.006,
        driftXRate: 0.000032,
        driftYRate: 0.000028,
        driftX: 0.014,
        driftY: 0.012,
        outerScale: 2.42,
        innerScale: 1.48,
        coreScale: 1.06,
        outerAlpha: 0.58,
        innerAlpha: 0.68,
        coreAlpha: 1.12,
        rimAlpha: 0.48,
        ceilingAlpha: 0.36,
        pulseGain: 0.02,
        eventWindowMs: 12000,
        eventAlpha: 0.05
      };
    }

    return {
      breatheRate: 0.00035,
      breatheDepth: 0.010,
      audioBreathe: 0.018,
      driftXRate: 0.00013,
      driftYRate: 0.00011,
      driftX: 0.045,
      driftY: 0.035,
      outerScale: 2.45,
      innerScale: 1.72,
      coreScale: 1.22,
      outerAlpha: 1,
      innerAlpha: 1,
      coreAlpha: 1,
      rimAlpha: 1,
      ceilingAlpha: 1,
      pulseGain: 0.34,
      eventWindowMs: 2200,
      eventAlpha: 0
    };
  }
  function currentEventPulse(profile) {
    if (!audioState.lastEventAt) return 0;
    const age = Date.now() - audioState.lastEventAt;
    const raw = clamp(1 - age / profile.eventWindowMs, 0, 1);
    return raw * raw * (3 - 2 * raw);
  }
  function fillCircle(cx, cy, radius, stops, composite = 'source-over') {
    ctx.save();
    ctx.globalCompositeOperation = composite;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, radius));
    stops.forEach(([at, color]) => gradient.addColorStop(at, color));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function draw(time = performance.now()) {
    resizeCanvasToDisplaySize();
    const cssW = width / dpr; const cssH = height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const palette = mixedPalette(time);
    const visualScore = currentVisualScore();
    const visualProfile = visualProfileFor(visualScore);
    const eventPulse = currentEventPulse(visualProfile);
    const wakeBoost = mode === 'ringing' ? visualState.wakeVisualIntensity : 0;
    const brightness = clamp(state.settings.visualBrightness + wakeBoost * 0.18, 0.08, 1);
    ctx.fillStyle = palette.wall;
    ctx.fillRect(0, 0, cssW, cssH);
    const cx = cssW / 2;
    const cy = mode === 'object' ? cssH * 0.49 : mode === 'bedside' ? cssH * 0.49 : cssH * 0.50;
    const minDim = Math.min(cssW, cssH);
    const radius = mode === 'worlds' ? minDim * 0.24 : mode === 'wakeSet' ? minDim * 0.36 : mode === 'bedside' ? minDim * 0.62 : minDim * 0.45;
    const breathe = 1 + Math.sin(time * visualProfile.breatheRate) * visualProfile.breatheDepth + visualState.audioIntensity * visualProfile.audioBreathe;
    const r = radius * breathe;
    const driftX = Math.sin(time * visualProfile.driftXRate) * r * visualProfile.driftX;
    const driftY = Math.cos(time * visualProfile.driftYRate) * r * visualProfile.driftY;
    const bedDim = mode === 'bedside' ? 0.72 : 1;
    const tapPulse = mode === 'object' ? clamp((visualState.objectTapPulseUntil - time) / 620, 0, 1) : 0;
    const pulseEase = tapPulse * tapPulse * (3 - 2 * tapPulse);
    const glow = brightness * bedDim * (1 + wakeBoost * 0.24 + pulseEase * visualProfile.pulseGain);

    fillCircle(cx, cy, r * visualProfile.outerScale, [
      [0, rgba(palette.spill, 0.030 * glow * visualProfile.outerAlpha)],
      [0.38, rgba(palette.spill, 0.120 * glow * visualProfile.outerAlpha)],
      [0.70, rgba(palette.outer, 0.050 * glow * visualProfile.ceilingAlpha)],
      [1, rgba(palette.spill, 0)]
    ], 'screen');

    fillCircle(cx + driftX, cy + driftY, r * visualProfile.innerScale, [
      [0, rgba(palette.inner, 0.030 * glow * visualProfile.innerAlpha)],
      [0.44, rgba(palette.outer, 0.085 * glow * visualProfile.rimAlpha)],
      [0.78, rgba(palette.spill, 0.070 * glow * visualProfile.innerAlpha)],
      [1, rgba(palette.spill, 0)]
    ], 'screen');

    fillCircle(cx, cy, r * visualProfile.coreScale, [
      [0, rgba(palette.core, 0.92 * brightness * visualProfile.coreAlpha)],
      [0.30, rgba(palette.core2, 0.78 * brightness * visualProfile.coreAlpha)],
      [0.56, rgba(palette.inner, 0.52 * glow * visualProfile.innerAlpha)],
      [0.76, rgba(palette.outer, 0.34 * glow * visualProfile.rimAlpha)],
      [0.91, rgba(palette.outer, 0.075 * glow * visualProfile.rimAlpha)],
      [1, rgba(palette.outer, 0)]
    ]);

    fillCircle(cx - driftX * 0.55, cy - driftY * 0.55, r * 0.88, [
      [0, rgba(palette.shadow, 0.10)],
      [0.44, rgba(palette.core, 0.18 * brightness)],
      [1, rgba(palette.core, 0)]
    ], 'multiply');

    fillCircle(cx, cy, r * (visualProfile.innerScale + 0.10), [
      [0, rgba(palette.outer, 0)],
      [0.58, rgba(palette.outer, 0.026 * glow * visualProfile.rimAlpha)],
      [0.82, rgba(palette.spill, 0.022 * glow * visualProfile.ceilingAlpha)],
      [1, rgba(palette.outer, 0)]
    ], 'screen');

    if (visualScore === 'space-field') {
      const ceilingDrift = Math.sin(time * 0.000035) * r * 0.018;
      fillCircle(cx, cy - r * 0.18 + ceilingDrift, r * 2.05, [
        [0, rgba(palette.outer, 0)],
        [0.52, rgba(palette.outer, 0.020 * glow)],
        [0.76, rgba(palette.inner, 0.040 * glow)],
        [0.92, rgba(palette.spill, 0.020 * glow)],
        [1, rgba(palette.outer, 0)]
      ], 'screen');
    }

    if (visualScore === 'neroli-thread' && eventPulse > 0) {
      fillCircle(cx + driftX * 0.25, cy + driftY * 0.25, r * (1.08 + eventPulse * 0.12), [
        [0, rgba(palette.outer, 0)],
        [0.60, rgba(palette.inner, 0.026 * eventPulse * visualProfile.eventAlpha * glow)],
        [0.78, rgba(palette.outer, 0.120 * eventPulse * visualProfile.eventAlpha * glow)],
        [0.93, rgba(palette.spill, 0.044 * eventPulse * visualProfile.eventAlpha * glow)],
        [1, rgba(palette.outer, 0)]
      ], 'screen');
    }

    if (visualScore === 'blue-bowl' && eventPulse > 0) {
      const ringScale = 1.01 + eventPulse * 0.10;
      const ringAlpha = eventPulse * visualProfile.eventAlpha * glow;
      fillCircle(cx + driftX * 0.16, cy + driftY * 0.16, r * (visualProfile.innerScale + 0.12 * ringScale), [
        [0, rgba(palette.outer, 0)],
        [0.54, rgba(palette.inner, 0.012 * ringAlpha)],
        [0.74, rgba(palette.outer, 0.060 * ringAlpha)],
        [0.91, rgba(palette.spill, 0.020 * ringAlpha)],
        [1, rgba(palette.outer, 0)]
      ], 'screen');
    }

    if (visualScore === 'human-return' && eventPulse > 0) {
      const ringAlpha = eventPulse * visualProfile.eventAlpha * glow;
      fillCircle(cx + driftX * 0.08, cy + driftY * 0.08, r * (visualProfile.outerScale + eventPulse * 0.08), [
        [0, rgba(palette.outer, 0)],
        [0.62, rgba(palette.inner, 0.006 * ringAlpha)],
        [0.80, rgba(palette.outer, 0.026 * ringAlpha)],
        [0.94, rgba(palette.spill, 0.010 * ringAlpha)],
        [1, rgba(palette.outer, 0)]
      ], 'screen');
    }

    if (tapPulse > 0) {
      fillCircle(cx, cy, r * (1.05 + (1 - tapPulse) * 0.42), [
        [0, rgba(palette.outer, 0.060 * pulseEase)],
        [0.38, rgba(palette.inner, 0.110 * pulseEase)],
        [0.74, rgba(palette.spill, 0.052 * pulseEase)],
        [1, rgba(palette.spill, 0)]
      ], 'screen');
    }

    if (gridOverlayEnabled) setRootCenter(cssW / 2, cssH / 2, r);
    if (running) rafId = window.requestAnimationFrame(draw);
  }
  function setRootCenter(cx, cy, radius) {
    document.documentElement.style.setProperty('--object-center-x', `${cx}px`);
    document.documentElement.style.setProperty('--object-center-y', `${cy}px`);
    document.documentElement.style.setProperty('--orbit-radius-primary', `${radius}px`);
  }
  return {
    start() { if (!running) { running = true; rafId = window.requestAnimationFrame(draw); } },
    stop() { running = false; window.cancelAnimationFrame(rafId); },
    setMode(next) { mode = next; },
    setWorld(next) { if (next !== worldId) { displayWorldId = worldId; worldId = next; crossfade = 0; crossfadeStart = performance.now(); } }
  };
}

function ensureAudioEngine() {
  if (audioEngine) return audioEngine;
  audioEngine = createAudioEngine();
  return audioEngine;
}

function createAudioEngine() {
  let ctx = null;
  let masterGain = null;
  let modeGain = null;
  let compressor = null;
  let eventTimer = null;
  let droneOscillators = [];
  let transientOscillators = [];
  let sessionId = 0;
  let currentWakePhase = WAKE_CURVE[0];
  const musicMemory = {
    lastRatios: [],
    phraseIndex: 0,
    lastPhraseAt: 0,
    lastEventAt: 0
  };
  function updateContextState() { audioState.audioContextState = ctx ? ctx.state : 'none'; return audioState.audioContextState; }
  function initContext() {
    if (ctx) return ctx;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) throw new Error('AudioContext is not available.');
    ctx = new AudioContextCtor();
    masterGain = ctx.createGain();
    modeGain = ctx.createGain();
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.knee.value = 22;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.018;
    compressor.release.value = 0.28;
    modeGain.gain.value = 0.0001;
    masterGain.gain.value = 0.0001;
    modeGain.connect(compressor);
    compressor.connect(masterGain);
    masterGain.connect(ctx.destination);
    audioState.compressorEnabled = true;
    updateContextState();
    return ctx;
  }
  async function unlockAudioFromGesture(event) {
    try {
      initContext();
      audioState.lastGestureAt = nowMs();
      audioState.unlocked = true;
      updateContextState();
      if (ctx.state === 'suspended') await ctx.resume();
      updateContextState();
      return true;
    } catch (error) {
      audioState.audioPlaybackState = 'error';
      audioState.userFacingAudioState = 'STOPPED';
      recordError('unlockAudioFromGesture', error);
      showToast('Tap once for sound.');
      return false;
    }
  }
  function stopScheduledNodes(reason = 'explicit_stop', fade = 0.22) {
    if (!ctx || !modeGain) return;
    const at = ctx.currentTime;
    const oldOscillators = droneOscillators.slice();
    const oldTransientOscillators = transientOscillators.slice();
    const oldTimer = eventTimer;
    droneOscillators = [];
    transientOscillators = [];
    eventTimer = null;
    if (oldTimer) window.clearTimeout(oldTimer);
    modeGain.gain.cancelScheduledValues(at);
    modeGain.gain.setTargetAtTime(0.0001, at, fade);
    window.setTimeout(() => {
      oldOscillators.concat(oldTransientOscillators).forEach((osc) => { try { osc.stop(); } catch (error) { /* oscillator may already be stopped */ } });
      if (reason !== 'mode_crossfade_internal') {
        audioState.activeNodes = 0;
        audioState.activeOscillators = 0;
        audioState.activeTimers = 0;
      }
    }, Math.max(30, fade * 1000 + 80));
    audioState.lastAudioStopReason = reason;
    if (reason !== 'mode_crossfade_internal') {
      audioState.audioPlaybackState = 'stopped';
      audioState.userFacingAudioState = 'STOPPED';
      updateSoundControls();
    }
  }
  function setMasterTarget(modeName, intensity = 1, ramp = 0.9) {
    if (!ctx || !masterGain || !modeGain) return;
    const audio = state.settings.audio;
    const master = clamp(audio.masterVolume, 0, 1) * MASTER_GAIN_CEILING;
    const output = clamp(master * OUTPUT_GAIN_BOOST, 0.0001, OUTPUT_GAIN_CEILING);
    const modeVolume = modeName === 'bedside' ? audio.bedsideVolume : modeName === 'ringing' ? audio.wakeVolume : audio.objectVolume;
    const target = clamp(master * modeVolume * intensity, 0.0001, MASTER_GAIN_CEILING);
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setTargetAtTime(output, ctx.currentTime, ramp);
    modeGain.gain.cancelScheduledValues(ctx.currentTime);
    modeGain.gain.setTargetAtTime(target, ctx.currentTime, ramp);
    audioState.masterGainValue = output;
    audioState.modeGainValue = target;
  }
  function syncWakePhase(phase = getCurrentWakePhase()) {
    if (!ctx || audioState.currentMode !== 'ringing') return phase;
    currentWakePhase = phase;
    setMasterTarget('ringing', phase.masterGainTarget, 1.4);
    visualState.audioIntensity = phase.audioDensity;
    return phase;
  }
  function pickWeightedRatio(soundMode) {
    const grammar = soundMode.strikeGrammar || soundMode.partialRatios.map((ratio) => ({ ratio, weight: 1 }));
    const totalWeight = grammar.reduce((sum, candidate) => sum + Math.max(0, candidate.weight || 0), 0);
    let cursor = Math.random() * (totalWeight || 1);
    for (const candidate of grammar) {
      cursor -= Math.max(0, candidate.weight || 0);
      if (cursor <= 0) return candidate.ratio || 1;
    }
    return grammar[0]?.ratio || 1;
  }
  function pickDroneRatio(soundMode) {
    const ratios = soundMode.droneRatios || soundMode.partialRatios || [1];
    return ratios[Math.floor(Math.random() * ratios.length)] || 1;
  }
  function randomBetween(range, fallback = 1) {
    if (!Array.isArray(range) || range.length < 2) return fallback;
    return range[0] + Math.random() * (range[1] - range[0]);
  }
  function isLongToneStyle(style) {
    return style === 'field' || style === 'thread' || style === 'bowl' || style === 'lullaby' || style === 'human' || style === 'wake-chorale' || style === 'sleep-nest';
  }
  function updateActiveOscillatorCount() {
    audioState.activeOscillators = droneOscillators.length + transientOscillators.length;
  }
  function rememberRatio(ratio, limit = 5) {
    musicMemory.lastRatios.push(Number(ratio));
    while (musicMemory.lastRatios.length > limit) musicMemory.lastRatios.shift();
  }
  function ratioInMemory(ratio, limit = 5) {
    return musicMemory.lastRatios.slice(-limit).some((candidate) => Math.abs(candidate - ratio) < 0.001);
  }
  function getRatioWeight(soundMode, ratio) {
    const grammar = soundMode.strikeGrammar || [];
    const found = grammar.find((candidate) => Math.abs((candidate.ratio || 1) - ratio) < 0.001);
    return found ? Math.max(0.01, found.weight || 0.01) : 1;
  }
  function getWakeDensity(modeName) {
    return modeName === 'ringing' ? clamp(currentWakePhase.audioDensity || 0, 0, 1) : 0;
  }
  function buildDefaultPhraseCells(soundMode) {
    const grammar = (soundMode.strikeGrammar || soundMode.partialRatios.map((ratio) => ({ ratio, weight: 1 }))).slice();
    const ranked = grammar.sort((a, b) => (b.weight || 0) - (a.weight || 0)).map((candidate) => candidate.ratio || 1);
    const root = ranked.find((ratio) => Math.abs(ratio - 1) < 0.001) || ranked[0] || 1;
    const color = ranked.find((ratio) => Math.abs(ratio - root) > 0.001) || root;
    const octave = ranked.find((ratio) => Math.abs(ratio - 2) < 0.001) || ranked.find((ratio) => ratio > root && Math.abs(ratio - color) > 0.001) || color;
    const low = ranked.find((ratio) => ratio < root) || root;
    const high = ranked.find((ratio) => ratio > octave && getRatioWeight(soundMode, ratio) <= getRatioWeight(soundMode, root) * 0.55) || octave;
    return [[root, color], [root, octave], [low, root], [color, octave], [root, color, octave], [root, high]];
  }
  function getWakeChoraleFallbackCell(wakeMinute, phraseIndex) {
    const early = [
      [1.498, 2],
      [1.682, 1.498],
      [1.122, 1.260],
      [2.245, 2],
      [1.260, 1.498],
      [1, 1.498]
    ];
    const mid = [
      [2.520, 2.997],
      [2.245, 2.520, 2.997],
      [2.828, 2.997],
      [3.364, 2.997],
      [2.997, 2.520, 2]
    ];
    const late = [
      [4, 3.364, 2.997],
      [4, 2.997],
      [4.490, 4, 3.364],
      [2.997, 2.520, 2]
    ];
    const pool = wakeMinute >= 13 ? early.concat(mid, late)
      : wakeMinute >= 5 ? early.concat(mid)
      : early;
    return pool[phraseIndex % pool.length] || [1.498];
  }
  function getV2Profile(modeName, soundMode) {
    const custom = soundMode.engineV2 || {};
    const style = custom.style || 'canonical';
    const wakeDensity = getWakeDensity(modeName);
    const defaultGaps = { bedside: [26000, 90000], object: [7000, 22000], ringing: [5000, 16000] };
    const defaultRest = { bedside: 0.72, object: 0.28, ringing: 0.18 };
    const defaultMax = { bedside: 1, object: 3, ringing: 4 };
    const gapRange = (custom.phraseGapsMs && custom.phraseGapsMs[modeName]) || defaultGaps[modeName] || defaultGaps.object;
    const ringingPull = modeName === 'ringing' ? clamp(1.12 - wakeDensity * 0.62, 0.46, 1.12) : 1;
    const maxEventsBase = (custom.maxEventsPerPhrase && custom.maxEventsPerPhrase[modeName]) || defaultMax[modeName] || 2;
    const restBase = (custom.restProbability && custom.restProbability[modeName] !== undefined) ? custom.restProbability[modeName] : (defaultRest[modeName] || 0.36);
    const defaultForegroundGain = style === 'thread' ? 1.25 : 1;
    return {
      style,
      phraseGapsMs: [gapRange[0] * ringingPull, gapRange[1] * ringingPull],
      restProbability: clamp(restBase - wakeDensity * 0.34, 0.05, 0.86),
      maxEvents: clamp(Math.round(maxEventsBase + wakeDensity * 2), 1, 5),
      attackSeconds: custom.attackSeconds || (isLongToneStyle(style) ? [3.5, 12] : [0.25, 1.6]),
      releaseSeconds: custom.releaseSeconds || (isLongToneStyle(style) ? [10, 32] : [4, 18]),
      gainScale: custom.gainScale || (isLongToneStyle(style) ? 0.55 : 0.82),
      foregroundGainScale: custom.foregroundGainScale || defaultForegroundGain,
      repeatMemory: custom.repeatMemory || 4,
      droneVoiceLimit: custom.droneVoiceLimit,
      wakeRatioCeilings: custom.wakeRatioCeilings || null,
      sleepNoise: custom.sleepNoise || null,
      phraseGapSequenceMs: custom.phraseGapSequenceMs || null,
      orderedPhraseCells: custom.orderedPhraseCells || null,
      phraseCells: custom.phraseCells || buildDefaultPhraseCells(soundMode)
    };
  }
  function selectPhraseCell(modeName, soundMode, profile) {
    const cutoff = modeName === 'bedside' ? (soundMode.nightSafeCutoff || 640) : Infinity;
    const wakeRatioCeiling = profile.style === 'wake-chorale' && modeName === 'ringing' && Array.isArray(profile.wakeRatioCeilings)
      ? profile.wakeRatioCeilings.reduce((maxRatio, ceiling) => (
        ceiling.atMinute <= getCurrentWakePhase().atMinute ? ceiling.maxRatio : maxRatio
      ), 2.245)
      : Infinity;
    const withinLimits = (ratio) => soundMode.baseFrequency * ratio <= cutoff && ratio <= wakeRatioCeiling;
    if (profile.orderedPhraseCells && profile.orderedPhraseCells.length) {
      const orderedCell = profile.orderedPhraseCells[musicMemory.phraseIndex % profile.orderedPhraseCells.length] || [1];
      const filteredOrderedCell = orderedCell.filter(withinLimits);
      if (filteredOrderedCell.length) return filteredOrderedCell.slice(0, profile.maxEvents);
      if (profile.style === 'wake-chorale') {
        const fallbackCell = getWakeChoraleFallbackCell(getCurrentWakePhase().atMinute, musicMemory.phraseIndex).filter(withinLimits);
        return (fallbackCell.length ? fallbackCell : [1.498]).slice(0, profile.maxEvents);
      }
      return [1].slice(0, profile.maxEvents);
    }

    const candidates = profile.phraseCells
      .map((cell) => cell.filter(withinLimits))
      .filter((cell) => cell.length);
    const cells = candidates.length ? candidates : [[profile.style === 'wake-chorale' ? 2 : 1]];
    const weighted = cells.map((cell) => {
      const rarest = Math.min(...cell.map((ratio) => getRatioWeight(soundMode, ratio)));
      const memoryPenalty = cell.some((ratio) => ratioInMemory(ratio, profile.repeatMemory)) ? 0.32 : 1;
      const lengthBonus = profile.style === 'thread'
        ? (cell.length === 1 ? 1.1 : 0.64 + cell.length * 0.14)
        : isLongToneStyle(profile.style)
          ? (cell.length === 1 ? 0.72 : 1 + cell.length * 0.2)
          : (cell.length === 1 ? 0.34 : 1 + cell.length * 0.28);
      return { cell, weight: Math.max(0.01, rarest * memoryPenalty * lengthBonus) };
    });
    const totalWeight = weighted.reduce((sum, candidate) => sum + candidate.weight, 0);
    let cursor = Math.random() * (totalWeight || 1);
    for (const candidate of weighted) {
      cursor -= candidate.weight;
      if (cursor <= 0) return candidate.cell.slice(0, profile.maxEvents);
    }
    return weighted[0].cell.slice(0, profile.maxEvents);
  }
  function selectPhraseGap(modeName, profile) {
    const sequence = profile.phraseGapSequenceMs && profile.phraseGapSequenceMs[modeName];
    if (Array.isArray(sequence) && sequence.length) {
      const sequenceGap = sequence[musicMemory.phraseIndex % sequence.length] || sequence[0];
      if (profile.style === 'wake-chorale' && modeName === 'ringing') {
        const densityFactor = clamp(1 - getWakeDensity(modeName) * 0.45, 0.55, 1);
        return sequenceGap * densityFactor * (0.88 + Math.random() * 0.24);
      }
      return sequenceGap * (0.88 + Math.random() * 0.30);
    }
    return randomBetween(profile.phraseGapsMs, modeName === 'bedside' ? 42000 : 16000) * (0.82 + Math.random() * 0.46);
  }
  function registerTransientOscillator(osc, nodeCount, stopMs) {
    transientOscillators.push(osc);
    audioState.activeNodes += nodeCount;
    updateActiveOscillatorCount();
    window.setTimeout(() => {
      transientOscillators = transientOscillators.filter((candidate) => candidate !== osc);
      audioState.activeNodes = Math.max(0, audioState.activeNodes - nodeCount);
      updateActiveOscillatorCount();
    }, stopMs);
  }
  function maybeScheduleBloom(modeName, soundMode, emphasis = 1) {
    if (!ctx || !modeGain) return;
    if (soundMode.engineV2 && isLongToneStyle(soundMode.engineV2.style)) return;
    const shimmer = clamp(Number(state.settings.audio.shimmerAmount) || 0, 0, 1);
    const air = clamp(Number(state.settings.audio.airVolume) || 0, 0, 1);
    const modeMultiplier = modeName === 'bedside' ? 0.52 : modeName === 'ringing' ? 1.18 : 1;
    const probability = clamp((soundMode.shimmerProbability || 0) * shimmer * modeMultiplier, 0, 0.55);
    if (air <= 0.001 || Math.random() > probability) return;

    const ratio = pickDroneRatio(soundMode);
    const octave = Math.random() > 0.76 && modeName !== 'bedside' ? 2 : 1;
    const freq = soundMode.baseFrequency * ratio * octave;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const at = ctx.currentTime;
    const peak = clamp((0.010 + shimmer * 0.018) * air * emphasis, 0.001, modeName === 'bedside' ? 0.020 : 0.040);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * (0.998 + Math.random() * 0.004), at);
    filter.type = 'lowpass';
    filter.frequency.value = modeName === 'bedside' ? soundMode.nightSafeCutoff * 0.82 : Math.min(soundMode.nightSafeCutoff * 1.25, 1600);
    filter.Q.value = 0.35;
    gain.gain.value = 0.0001;
    gain.gain.setTargetAtTime(peak, at + 0.18 + Math.random() * 0.7, 1.6 + Math.random() * 1.8);
    gain.gain.setTargetAtTime(0.0001, at + 4.8 + Math.random() * 5.2, 5.5 + Math.random() * 4.5);

    if (pan) {
      pan.pan.value = -0.5 + Math.random();
      osc.connect(filter); filter.connect(gain); gain.connect(pan); pan.connect(modeGain);
    } else {
      osc.connect(filter); filter.connect(gain); gain.connect(modeGain);
    }
    osc.start(); osc.stop(at + 19);
    registerTransientOscillator(osc, pan ? 4 : 3, 19200);
  }
  function scheduleResonantEvent(modeName, world, soundMode, ratio, emphasis = 1) {
    if (!ctx || !modeGain) return;
    const profile = getV2Profile(modeName, soundMode);
    const isLongTone = isLongToneStyle(profile.style);
    const isThread = profile.style === 'thread';
    const isBowl = profile.style === 'bowl';
    const isLullaby = profile.style === 'lullaby';
    const isHuman = profile.style === 'human';
    const isWakeChorale = profile.style === 'wake-chorale';
    const isSleepNest = profile.style === 'sleep-nest';
    const wakeMinute = isWakeChorale && modeName === 'ringing' ? getCurrentWakePhase().atMinute : 0;
    const at = ctx.currentTime;
    const wakeEmphasis = modeName === 'ringing' ? 0.62 + getWakeDensity(modeName) * 0.84 : 1;
    const attack = isSleepNest
      ? randomBetween(profile.attackSeconds, 16)
      : isWakeChorale
      ? randomBetween(profile.attackSeconds, 2.4)
      : isHuman
      ? randomBetween(profile.attackSeconds, 9)
      : isLullaby
      ? randomBetween(profile.attackSeconds, 5.8)
      : isBowl
      ? randomBetween(profile.attackSeconds, 0.42)
      : randomBetween(profile.attackSeconds, isLongTone ? 7 : 1);
    const release = isSleepNest
      ? randomBetween(profile.releaseSeconds, 90)
      : isWakeChorale
      ? randomBetween(profile.releaseSeconds, 18)
      : isHuman
      ? randomBetween(profile.releaseSeconds, 70)
      : isLullaby
      ? randomBetween(profile.releaseSeconds, 46)
      : isBowl
      ? randomBetween(profile.releaseSeconds, 28)
      : randomBetween(profile.releaseSeconds, isLongTone ? 22 : 8);
    const hold = isSleepNest
      ? randomBetween([12, 36], 18)
      : isWakeChorale
      ? randomBetween(wakeMinute >= 13 ? [3.5, 11] : [1.5, 6.5], 4)
      : isHuman
      ? randomBetween([6, 14], 9)
      : isLullaby
      ? randomBetween([2.8, 10.5], 6)
      : isBowl
      ? randomBetween([0.9, 5.5], 2.8)
      : isThread ? randomBetween([0.75, 4.5], 2.5) : isLongTone ? randomBetween([1.5, 8], 4) : randomBetween([0.35, 2.5], 1);
    const rawFrequency = soundMode.baseFrequency * ratio;
    const cutoff = modeName === 'bedside' ? (soundMode.nightSafeCutoff || 640) : Math.min((soundMode.nightSafeCutoff || 900) * (isLongTone ? 1 : 1.16), isWakeChorale ? 760 : isLongTone ? 720 : 1500);
    if (modeName === 'bedside' && rawFrequency > cutoff) return;
    if ((isLullaby || isHuman) && modeName === 'bedside' && ratio > 2.997) return;
    if (isWakeChorale && modeName === 'ringing' && ratio >= 4 && wakeMinute < 8) return;
    if (isSleepNest && ((modeName === 'bedside' && ratio > 2) || (modeName === 'object' && ratio > 2.997) || ratio > 3.364)) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const modeScale = isSleepNest ? (modeName === 'bedside' ? 0.20 : modeName === 'ringing' ? 0.34 : 0.26) : isWakeChorale ? (modeName === 'ringing' ? 0.46 : 0.38) : isHuman ? (modeName === 'bedside' ? 0.28 : modeName === 'ringing' ? 0.58 : 0.46) : isLullaby ? (modeName === 'bedside' ? 0.34 : modeName === 'ringing' ? 0.68 : 0.56) : isBowl ? (modeName === 'bedside' ? 0.36 : modeName === 'ringing' ? 0.74 : 0.62) : modeName === 'bedside' ? 0.48 : modeName === 'ringing' ? 0.92 : 0.78;
    const fieldScale = isSleepNest ? 0.030 : isWakeChorale ? 0.046 : isHuman ? 0.044 : isLullaby ? 0.052 : isBowl ? 0.064 : isThread ? 0.086 : isLongTone ? 0.078 : 0.052;
    const wakePhaseScale = isWakeChorale ? clamp(0.34 + getWakeDensity(modeName) * 0.82, 0.30, wakeMinute >= 13 ? 0.98 : 0.74) : 1;
    const highToneScale = isSleepNest && ratio >= 2.997 ? 0.22 : isSleepNest && ratio >= 2.378 ? 0.36 : isSleepNest && ratio >= 2 ? 0.56 : isWakeChorale && ratio >= 4 ? (wakeMinute >= 13 ? 0.38 : 0.26) : isWakeChorale && ratio >= 3.364 ? 0.54 : isWakeChorale && ratio >= 2.997 ? 0.72 : (isLullaby || isHuman) && ratio >= 2.997 ? 0.52 : (isLullaby || isHuman) && ratio >= 2.52 ? 0.72 : 1;
    const peak = clamp(fieldScale * profile.gainScale * profile.foregroundGainScale * modeScale * highToneScale * wakePhaseScale * state.settings.audio.strikeVolume * emphasis * wakeEmphasis, 0.001, isSleepNest ? (modeName === 'bedside' ? 0.010 : modeName === 'object' ? 0.024 : 0.018) : isWakeChorale ? 0.044 : isHuman ? (modeName === 'bedside' ? 0.018 : 0.038) : isLullaby ? (modeName === 'bedside' ? 0.026 : 0.052) : isBowl ? 0.045 : isLongTone ? (isThread ? 0.105 : 0.085) : 0.095);
    const detuneCents = (Math.random() - 0.5) * (isSleepNest ? 0.9 : isWakeChorale ? 1.8 : isHuman ? 1.6 : isLullaby ? 2.2 : isLongTone ? 5 : 10);
    const upperTone = rawFrequency >= 130 && ratio >= 1.5;
    const bowlTouch = isBowl && ratio >= 4;

    osc.type = isSleepNest ? 'sine' : isWakeChorale ? (wakeMinute >= 13 && ratio < 3 && Math.random() > 0.96 ? 'triangle' : 'sine') : (isLullaby || isHuman) ? 'sine' : isBowl ? (Math.random() > 0.84 ? 'triangle' : 'sine') : Math.random() > 0.72 && !isLongTone ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(rawFrequency, at);
    if (osc.detune) osc.detune.setValueAtTime(detuneCents, at);
    filter.type = 'lowpass';
    filter.frequency.value = Math.max(120, isSleepNest ? Math.min(cutoff, modeName === 'bedside' ? 320 : 360) : isWakeChorale ? Math.min(cutoff, ratio >= 4 ? 660 : 720) : isHuman ? Math.min(cutoff, modeName === 'ringing' ? 540 : 430) : isLullaby ? Math.min(cutoff, modeName === 'ringing' ? 620 : 520) : isBowl ? Math.min(cutoff, modeName === 'bedside' ? 920 : 1800) : cutoff);
    filter.Q.value = isSleepNest ? 0.10 : isWakeChorale ? 0.16 : isHuman ? 0.18 : isLullaby ? 0.22 : isBowl ? 0.28 : isLongTone ? 0.32 : 0.45;
    gain.gain.value = 0.0001;
    gain.gain.setValueAtTime(0.0001, at);
    if (isSleepNest) {
      gain.gain.linearRampToValueAtTime(peak, at + Math.max(8, attack));
      gain.gain.setTargetAtTime(0.0001, at + Math.max(8, attack) + hold, Math.max(30, release / 2.4));
    } else if (isWakeChorale) {
      gain.gain.linearRampToValueAtTime(peak, at + Math.max(0.8, attack));
      gain.gain.setTargetAtTime(0.0001, at + Math.max(0.8, attack) + hold, Math.max(8, release / 2.2));
    } else if (isHuman) {
      gain.gain.linearRampToValueAtTime(peak, at + Math.max(3.6, attack));
      gain.gain.setTargetAtTime(0.0001, at + Math.max(3.6, attack) + hold, Math.max(14, release / 2.1));
    } else if (isLullaby) {
      gain.gain.linearRampToValueAtTime(peak, at + Math.max(1.8, attack));
      gain.gain.setTargetAtTime(0.0001, at + Math.max(1.8, attack) + hold, Math.max(9, release / 2.2));
    } else if (isBowl) {
      gain.gain.linearRampToValueAtTime(peak, at + Math.max(0.04, attack));
      gain.gain.setTargetAtTime(0.0001, at + Math.max(0.04, attack) + hold, Math.max(2.8, release / 2.4));
    } else {
      gain.gain.linearRampToValueAtTime(peak, at + attack);
      gain.gain.setTargetAtTime(0.0001, at + attack + hold, Math.max(1.2, release / 3));
    }

    if (pan) {
      pan.pan.value = isSleepNest ? (ratio >= 2.378 ? (Math.random() - 0.5) * 0.04 : 0) : isWakeChorale ? (ratio >= 2.997 ? (Math.random() - 0.5) * 0.10 : 0) : isHuman ? (upperTone ? (Math.random() - 0.5) * 0.06 : 0) : isLullaby ? (upperTone ? (Math.random() - 0.5) * 0.12 : 0) : bowlTouch ? (Math.random() - 0.5) * (modeName === 'bedside' ? 0.08 : 0.14) : upperTone ? (Math.random() - 0.5) * (isLongTone ? (isThread ? 0.18 : 0.24) : 0.42) : 0;
      if (upperTone) pan.pan.setTargetAtTime(-pan.pan.value * 0.72, at + attack + hold, release * 0.55);
      osc.connect(filter); filter.connect(gain); gain.connect(pan); pan.connect(modeGain);
    } else {
      osc.connect(filter); filter.connect(gain); gain.connect(modeGain);
    }

    const stopAt = at + attack + hold + release + 5;
    osc.start(at);
    osc.stop(stopAt);
    rememberRatio(ratio, profile.repeatMemory);
    musicMemory.lastEventAt = nowMs();
    audioState.lastEventAt = musicMemory.lastEventAt;
    registerTransientOscillator(osc, pan ? 4 : 3, Math.ceil((stopAt - at) * 1000) + 200);
    if (isSleepNest || isWakeChorale || isLullaby || isHuman) return;
    maybeScheduleBloom(modeName, soundMode, emphasis * wakeEmphasis * 0.6);
  }
  function scheduleStrike(modeName, world, soundMode, emphasis = 1) {
    if (!ctx || !modeGain) return;
    const wakeEmphasis = modeName === 'ringing' ? 0.58 + currentWakePhase.audioDensity * 0.92 : 1;
    const ratio = pickWeightedRatio(soundMode);
    const freq = soundMode.baseFrequency * ratio;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = modeName === 'bedside' ? soundMode.nightSafeCutoff : Math.min(soundMode.nightSafeCutoff * 1.4, 1800);
    filter.Q.value = 0.5;
    osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq * (0.996 + Math.random() * 0.008), ctx.currentTime);
    gain.gain.value = 0.0001;
    const peak = clamp((modeName === 'bedside' ? 0.070 : 0.115) * state.settings.audio.strikeVolume * emphasis * wakeEmphasis, 0.001, 0.22);
    gain.gain.setTargetAtTime(peak, ctx.currentTime + 0.01, 0.06);
    gain.gain.setTargetAtTime(0.0001, ctx.currentTime + 0.18, 1.9 + Math.random() * 1.4);
    osc.connect(filter); filter.connect(gain); gain.connect(modeGain);
    osc.start(); osc.stop(ctx.currentTime + 5);
    registerTransientOscillator(osc, 3, 5200);
    maybeScheduleBloom(modeName, soundMode, emphasis * wakeEmphasis);
  }
  function startSleepNoiseBed(modeName, profile) {
    if (!ctx || !modeGain || !profile.sleepNoise?.enabled) return;
    const config = profile.sleepNoise;
    const duration = 2;
    const frameCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let brown = 0;
    for (let index = 0; index < frameCount; index += 1) {
      const white = Math.random() * 2 - 1;
      brown = (brown + 0.018 * white) / 1.018;
      data[index] = clamp(white * 0.24 + brown * 3.5, -1, 1) * 0.20;
    }

    const source = ctx.createBufferSource();
    const highpass = ctx.createBiquadFilter();
    const lowpass = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const at = ctx.currentTime;
    const baseGain = modeName === 'bedside' ? (config.bedsideGain || config.gain || 0.018) : (config.gain || 0.018);
    const depth = clamp(config.breathingDepth || 0.10, 0, 0.18);
    const period = 1 / clamp(config.breathingRateHz || 0.10, 0.06, 0.14);

    source.buffer = buffer;
    source.loop = true;
    highpass.type = 'highpass';
    highpass.frequency.value = config.highpassHz || 42;
    highpass.Q.value = 0.18;
    lowpass.type = 'lowpass';
    lowpass.frequency.value = config.lowpassHz || 620;
    lowpass.Q.value = 0.12;
    let filterAt = at;
    for (let step = 0; step < 16; step += 1) {
      filterAt += randomBetween([30, 90], 60);
      lowpass.frequency.linearRampToValueAtTime(randomBetween([420, 620], config.lowpassHz || 560), filterAt);
    }
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(baseGain, at + 8);
    let breathAt = at + 8;
    for (let step = 0; step < 48; step += 1) {
      breathAt += period / 2;
      const direction = step % 2 === 0 ? 1 : -1;
      gain.gain.linearRampToValueAtTime(baseGain * (1 + direction * depth), breathAt);
    }
    gain.gain.setTargetAtTime(baseGain * 0.35, at + 20 * 60, 260);

    source.connect(highpass); highpass.connect(lowpass); lowpass.connect(gain); gain.connect(modeGain);
    source.start(at);
    droneOscillators.push(source);
    audioState.activeNodes += 4;
    updateActiveOscillatorCount();
  }
  function startDrones(modeName, world, soundMode) {
    if (!ctx || !modeGain) return;
    const profile = getV2Profile(modeName, soundMode);
    const isLongTone = isLongToneStyle(profile.style);
    const isThread = profile.style === 'thread';
    const isField = profile.style === 'field';
    const existingFallback = isThread ? (modeName === 'bedside' ? 2 : 3) : modeName === 'bedside' ? 3 : isLongTone ? 6 : 4;
    const ratioLimit = profile.droneVoiceLimit || existingFallback;
    const ratios = (soundMode.droneRatios || soundMode.partialRatios).slice(0, ratioLimit);
    const at = ctx.currentTime;
    let haloVoiceCount = 0;
    if (profile.style === 'sleep-nest') startSleepNoiseBed(modeName, profile);
    ratios.forEach((ratio, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      osc.type = 'sine';
      const frequency = soundMode.baseFrequency * ratio;
      osc.frequency.value = frequency;
      if (osc.detune) osc.detune.value = (Math.random() - 0.5) * (isLongTone ? 4 : 7);
      const droneBase = modeName === 'bedside' ? (isThread ? 0.014 : 0.010) : isThread ? 0.018 : isLongTone ? 0.013 : 0.026;
      const baseGain = (droneBase * (isLongTone ? profile.gainScale + (isThread ? 0.10 : 0.12) : 1)) / Math.sqrt(index + 1);
      const breathDepth = index === 0 ? 0.035 : index < 3 ? 0.055 : 0.038;
      const breathCycle = [8, 14, 25, 46, 96, 150, 220][index % 7];
      let breathAt = at;
      gain.gain.setValueAtTime(baseGain, at);
      for (let step = 0; step < 8; step += 1) {
        breathAt += breathCycle * (0.85 + Math.random() * 0.32);
        gain.gain.linearRampToValueAtTime(baseGain * (1 - breathDepth + Math.random() * breathDepth * 2), breathAt);
      }
      if (index === 0 && pan && audioState.binauralEnabled && soundMode.binaural.allowed) {
        const rightOsc = ctx.createOscillator();
        const rightGain = ctx.createGain();
        const rightPan = ctx.createStereoPanner();
        const deltaHz = clamp(Number(audioState.deltaHz || soundMode.binaural.deltaHz) || 2, 1, 4);
        osc.frequency.value = frequency;
        rightOsc.type = 'sine';
        rightOsc.frequency.value = frequency + deltaHz;
        gain.gain.value *= 0.58;
        rightGain.gain.value = gain.gain.value;
        pan.pan.value = -1;
        rightPan.pan.value = 1;
        osc.connect(gain); gain.connect(pan); pan.connect(modeGain);
        rightOsc.connect(rightGain); rightGain.connect(rightPan); rightPan.connect(modeGain);
        osc.start(); rightOsc.start();
        droneOscillators.push(osc, rightOsc);
        audioState.activeNodes += 6;
        updateActiveOscillatorCount();
        return;
      }
      if (pan) {
        pan.pan.value = frequency < 110 || index === 0 ? 0 : (index % 2 === 0 ? -0.16 : 0.16);
        if (frequency >= 110) pan.pan.setTargetAtTime(-pan.pan.value * 0.65, at + 36 + index * 11, 80 + Math.random() * 90);
        osc.connect(gain); gain.connect(pan); pan.connect(modeGain);
      } else {
        osc.connect(gain); gain.connect(modeGain);
      }
      osc.start();
      droneOscillators.push(osc);
      audioState.activeNodes += pan ? 3 : 2;
      if (isField && modeName !== 'bedside' && frequency > 250 && haloVoiceCount < 3) {
        const haloOsc = ctx.createOscillator();
        const haloGain = ctx.createGain();
        const haloPan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const detuneDirection = Math.random() > 0.5 ? 1 : -1;
        const detuneCents = detuneDirection * (3 + Math.random() * 4);
        const haloBaseGain = baseGain * (0.20 + Math.random() * 0.15);
        const panValue = pan ? clamp(-pan.pan.value * 0.85, -0.22, 0.22) : (index % 2 === 0 ? 0.12 : -0.12);

        haloOsc.type = 'sine';
        haloOsc.frequency.value = frequency;
        if (haloOsc.detune) haloOsc.detune.value = detuneCents;
        haloGain.gain.setValueAtTime(haloBaseGain, at);
        haloGain.gain.linearRampToValueAtTime(haloBaseGain * (0.88 + Math.random() * 0.24), at + 80 + Math.random() * 80);

        if (haloPan) {
          haloPan.pan.value = panValue;
          haloOsc.connect(haloGain); haloGain.connect(haloPan); haloPan.connect(modeGain);
        } else {
          haloOsc.connect(haloGain); haloGain.connect(modeGain);
        }
        haloOsc.start();
        droneOscillators.push(haloOsc);
        audioState.activeNodes += haloPan ? 3 : 2;
        haloVoiceCount += 1;
      }
    });
    updateActiveOscillatorCount();
  }
  function scheduleNextPhrase(modeName, world, soundMode, nextSessionId, options = {}) {
    const profile = getV2Profile(modeName, soundMode);
    const phraseStartedAt = nowMs();
    const shouldRest = options.allowRest !== false && Math.random() < profile.restProbability;
    musicMemory.phraseIndex += 1;
    musicMemory.lastPhraseAt = phraseStartedAt;
    audioState.lastPhraseAt = phraseStartedAt;
    if (modeName === 'ringing') syncWakePhase(getCurrentWakePhase());

    if (!shouldRest) {
      let cell = selectPhraseCell(modeName, soundMode, profile);
      if (!isLongToneStyle(profile.style) && cell.length === 1) {
        const fallbackRatios = (soundMode.strikeGrammar || soundMode.partialRatios.map((ratio) => ({ ratio, weight: 1 })))
          .map((candidate) => candidate.ratio || 1)
          .filter((ratio) => Math.abs(ratio - cell[0]) > 0.001)
          .filter((ratio) => !ratioInMemory(ratio, profile.repeatMemory));
        if (fallbackRatios.length && Math.random() < 0.82) {
          const chosen = fallbackRatios[Math.floor(Math.random() * Math.min(3, fallbackRatios.length))];
          cell = [cell[0], chosen];
        }
      }
      const eventCount = Math.min(profile.maxEvents, cell.length);
      const eventGap = isLongToneStyle(profile.style)
        ? randomBetween(modeName === 'ringing' ? [2800, 9800] : [5200, 17000], 9000)
        : randomBetween(modeName === 'ringing' ? [1400, 5200] : [2200, 7600], 5200);
      cell.slice(0, eventCount).forEach((ratio, index) => {
        const offset = index === 0 ? randomBetween([0, isLongToneStyle(profile.style) ? 1700 : 650], 0) : eventGap * index * (0.82 + Math.random() * 0.42);
        window.setTimeout(() => {
          if (nextSessionId !== sessionId || !ctx || !modeGain) return;
          const innerSkipProbability = profile.style === 'wake-chorale' ? 0.12 : 0.42;
          if (ratioInMemory(ratio, profile.repeatMemory) && index > 0 && Math.random() < innerSkipProbability) return;
          scheduleResonantEvent(modeName, world, soundMode, ratio, modeName === 'ringing' ? 1.2 : 1);
        }, offset);
      });
    }

    const gap = selectPhraseGap(modeName, profile);
    eventTimer = window.setTimeout(() => {
      if (nextSessionId !== sessionId) return;
      scheduleNextPhrase(modeName, world, soundMode, nextSessionId, { allowRest: true });
    }, gap);
    audioState.activeTimers = 1;
  }
  function startMode(modeName = 'object', options = {}) {
    try {
      initContext();
      if (!audioState.unlocked) { showToast('Tap once for sound.'); return false; }
      const wasPlaying = audioState.userFacingAudioState === 'PLAYING';
      sessionId += 1;
      const nextSessionId = sessionId;
      audioState.currentAudioSessionId = nextSessionId;
      stopScheduledNodes('mode_crossfade_internal', wasPlaying ? 0.06 : 0.02);
      const world = getWorld(options.worldId || state.selectedWorldId);
      const soundMode = modeName === 'ringing' ? getWakeSoundMode(world) : getEffectiveSoundMode(world);
      audioState.currentWorldId = world.id;
      audioState.currentMode = modeName;
      audioState.currentSoundModeId = soundMode.id;
      audioState.binauralEnabled = Boolean(state.settings.audio.binauralEnabled && soundMode.binaural.allowed);
      audioState.deltaHz = state.settings.audio.binauralDeltaHz;
      audioState.engineStyle = options.engine === 'legacy' ? 'legacy' : `v2-${soundMode.engineV2?.style || 'canonical'}`;
      if (modeName === 'ringing') {
        if (!wakeCurveStartedAt) startWakeCurve();
        currentWakePhase = getCurrentWakePhase();
      }
      window.setTimeout(() => {
        if (nextSessionId !== sessionId) return;
        if (modeName === 'ringing') syncWakePhase(currentWakePhase);
        else setMasterTarget(modeName, options.intensity || 1, 0.30);
        startDrones(modeName, world, soundMode);
        if (options.engine === 'legacy') {
          const density = options.density || (modeName === 'bedside' ? soundMode.bowlDensity * 0.55 : soundMode.bowlDensity);
          const spacingBase = modeName === 'bedside' ? 6200 : modeName === 'ringing' ? 3000 : 4800;
          const spacingPull = modeName === 'ringing' ? 1800 : 2200;
          const spacingFloor = modeName === 'bedside' ? 3600 : modeName === 'ringing' ? 1400 : 2200;
          const scheduleNextStrike = () => {
            if (nextSessionId !== sessionId) return;
            if (modeName === 'ringing') syncWakePhase(getCurrentWakePhase());
            const effectiveDensity = modeName === 'ringing' ? currentWakePhase.audioDensity : density;
            const spacing = clamp(spacingBase - effectiveDensity * spacingPull, spacingFloor, 7600);
            scheduleStrike(modeName, world, soundMode, modeName === 'ringing' ? 1.6 : 1);
            const nextSpacing = spacing * (0.72 + Math.random() * 0.70);
            eventTimer = window.setTimeout(scheduleNextStrike, nextSpacing);
          };
          audioState.activeTimers = 1;
          eventTimer = window.setTimeout(scheduleNextStrike, 70);
        } else {
          const isThread = soundMode.engineV2?.style === 'thread';
          const firstPhraseDelay = isThread
            ? (modeName === 'bedside' ? randomBetween([1200, 3600], 2200) : modeName === 'ringing' ? 250 : randomBetween([80, 360], 180))
            : modeName === 'bedside' ? randomBetween([5000, 14000], 9000) : modeName === 'ringing' ? 500 : randomBetween([300, 1300], 700);
          audioState.activeTimers = 1;
          eventTimer = window.setTimeout(() => {
            if (nextSessionId !== sessionId) return;
            scheduleNextPhrase(modeName, world, soundMode, nextSessionId, { allowRest: false });
          }, firstPhraseDelay);
        }
      }, wasPlaying ? 95 : 0);
      audioState.audioPlaybackState = 'playing';
      audioState.userFacingAudioState = 'PLAYING';
      audioState.lastAudioStopReason = null;
      updateSoundControls();
      return true;
    } catch (error) {
      audioState.audioPlaybackState = 'error';
      audioState.userFacingAudioState = 'STOPPED';
      recordError('startMode', error);
      return false;
    }
  }
  function playFromGesture(event, modeName = state.currentMode === 'bedside' ? 'bedside' : 'object', options = {}) {
    return unlockAudioFromGesture(event).then((ok) => {
      if (!ok) return false;
      const intensity = modeName === 'bedside' ? 0.72 : modeName === 'ringing' ? 1 : 1;
      return startMode(modeName, { ...options, intensity: options.intensity || intensity });
    });
  }
  function startModeFromGesture(event, modeName = state.currentMode === 'bedside' ? 'bedside' : 'object', options = {}) {
    try {
      initContext();
      audioState.lastGestureAt = nowMs();
      audioState.unlocked = true;
      const intensity = modeName === 'bedside' ? 0.72 : modeName === 'ringing' ? 1 : 1;
      const started = startMode(modeName, { ...options, intensity: options.intensity || intensity });
      if (ctx.state === 'suspended') {
        ctx.resume().then(updateContextState).catch((error) => recordError('resumeAfterStartModeFromGesture', error));
      }
      updateContextState();
      return started;
    } catch (error) {
      audioState.audioPlaybackState = 'error';
      audioState.userFacingAudioState = 'STOPPED';
      recordError('startModeFromGesture', error);
      showToast('Tap once for sound.');
      return false;
    }
  }
  function stopExplicit() { stopScheduledNodes('explicit_stop', 0.28); return true; }
  function stopForDurationExpiry() { stopScheduledNodes('duration_expiry', 1.2); return true; }
  function stopForWakeDismiss() { stopScheduledNodes('wake_dismiss', 0.3); return true; }
  function crossfadeToWorld(world) {
    if (!ctx || audioState.userFacingAudioState !== 'PLAYING') return;
    startMode(audioState.currentMode || 'object', { worldId: world.id, intensity: 0.92 });
  }
  function getAudioDiagnostics() {
    updateContextState();
    const diagnosticsSoundMode = getSoundMode(audioState.currentSoundModeId);
    const diagnosticsProfile = getV2Profile(audioState.currentMode, diagnosticsSoundMode);
    return {
      audioPlaybackState: audioState.audioPlaybackState,
      userFacingAudioState: audioState.userFacingAudioState,
      audioContextState: audioState.audioContextState,
      currentMode: audioState.currentMode,
      activeWorld: audioState.currentWorldId || state.selectedWorldId,
      currentWakePhaseName: currentWakePhase.name,
      currentWakeMinute: Number((currentWakePhase.atMinute || 0).toFixed(2)),
      currentSoundModeId: audioState.currentSoundModeId,
      engineStyle: audioState.engineStyle,
      phraseStyle: diagnosticsProfile.style,
      droneVoiceLimit: diagnosticsProfile.droneVoiceLimit || null,
      lastPhraseAt: audioState.lastPhraseAt,
      lastEventAt: audioState.lastEventAt,
      modeGain: Number(audioState.modeGainValue.toFixed(4)),
      masterGainTarget: Number(audioState.masterGainValue.toFixed(4)),
      compressorEnabled: audioState.compressorEnabled,
      activeNodes: audioState.activeNodes,
      activeOscillators: audioState.activeOscillators,
      activeDroneOscillators: droneOscillators.length,
      activeTransientOscillators: transientOscillators.length,
      activeTimers: audioState.activeTimers,
      lastAudioError: audioState.lastAudioError,
      lastAudioStopReason: audioState.lastAudioStopReason,
      currentAudioSessionId: audioState.currentAudioSessionId,
      limiterCeiling: MASTER_GAIN_CEILING,
      outputGainBoost: OUTPUT_GAIN_BOOST,
      outputGainCeiling: OUTPUT_GAIN_CEILING
    };
  }
  return { unlockAudioFromGesture, playFromGesture, startModeFromGesture, startMode, stopExplicit, stopForDurationExpiry, stopForWakeDismiss, crossfadeToWorld, getAudioDiagnostics, setMasterTarget, syncWakePhase };
}

function unlockAudioFromGesture(event) { return ensureAudioEngine().unlockAudioFromGesture(event); }
function playSoundFromGesture(event, modeName, options = {}) { return ensureAudioEngine().playFromGesture(event, modeName, options); }
function startSoundFromGesture(event, modeName, options = {}) { return ensureAudioEngine().startModeFromGesture(event, modeName, options); }
function playWakePreviewFromGesture(event) {
  wakePreviewActive = true;
  return startSoundFromGesture(event, 'object', { worldId: state.wakeWorldId || state.selectedWorldId, intensity: 0.46 });
}
function stopWakePreview() {
  if (!wakePreviewActive) return;
  wakePreviewActive = false;
  ensureAudioEngine().stopExplicit();
}
function playWakeSoundFromGesture(event) {
  wakePreviewActive = false;
  return startSoundFromGesture(event, 'ringing', { worldId: state.wakeWorldId || state.selectedWorldId, intensity: 1 });
}
function playCurrentSoundFromGesture(event) {
  if (state.currentMode === 'bedside') return startSoundFromGesture(event, 'bedside');
  if (state.currentMode === 'wakeSet') return playWakePreviewFromGesture(event);
  if (state.currentMode === 'ringing') return playWakeSoundFromGesture(event);
  return startSoundFromGesture(event, 'object', { worldId: state.selectedWorldId, intensity: 1 });
}
function stopSoundExplicit() { const result = ensureAudioEngine().stopExplicit(); updateSoundControls(); return result; }
function startBedsideSound() { return ensureAudioEngine().startMode('bedside', { intensity: 0.72 }); }
function startObjectSound() { return ensureAudioEngine().startMode('object', { intensity: 1 }); }
function startWakeSequence() {
  wakePreviewActive = false;
  if (state.currentMode !== 'ringing') setMode('ringing', { keepAudio: true });
  return ensureAudioEngine().startMode('ringing', { worldId: state.wakeWorldId || state.selectedWorldId, intensity: 1 });
}
function getAudioDiagnostics() { return ensureAudioEngine().getAudioDiagnostics(); }

function setMode(mode, options = {}) {
  const previous = state.currentMode;
  state.previousMode = previous;
  state.currentMode = mode;
  saveState();
  document.body.dataset.mode = mode;
  ['object', 'bedside', 'wakeSet', 'worlds', 'settings', 'safety', 'diagnostics', 'ringing'].forEach((panelMode) => {
    const panel = dom[`${panelMode}Panel`];
    if (!panel) return;
    const active = mode === panelMode;
    panel.hidden = !active;
    window.requestAnimationFrame(() => panel.classList.toggle('is-active', active));
  });
  if (renderer) {
    renderer.setMode(mode);
    const visualWorldId = (mode === 'wakeSet' || mode === 'ringing') ? (state.wakeWorldId || state.selectedWorldId) : state.selectedWorldId;
    if (mode !== 'worlds') renderer.setWorld(visualWorldId);
    setActiveVisualWorld(visualWorldId);
  }
  if (mode === 'bedside') { revealBedsideControls(); startBedsideSessionTimer(); } else { document.body.classList.remove('bedside-idle'); clearBedsideIdleTimer(); clearBedsideSessionTimer(); }
  if (mode === 'ringing') startWakeCurve();
  else if (previous === 'ringing') stopWakeCurve();
  if (mode === 'wakeSet') { wakeSetState.wakeStep = 'time'; syncWakeStateFromAlarm(); clearWakeSetterFocus(); }
  if (mode === 'worlds') { initializeWorldSelection(options.entry || previous); renderWorlds(); }
  if (mode === 'settings') syncSettingsControls();
  if (mode === 'diagnostics') refreshDiagnostics(true);
  updateRails();
  updateClocks();
}

function closeOverlay(mode) {
  if (mode === 'worlds') return revertWorldChoiceAndClose();
  if (state.currentMode === mode) setMode(state.previousMode && state.previousMode !== mode ? state.previousMode : 'object', { keepAudio: true });
}

function formatClockDate(date) {
  const use24h = state.settings.use24h;
  const hour = use24h ? date.getHours() : ((date.getHours() + 11) % 12) + 1;
  return `${pad2(hour)}:${pad2(date.getMinutes())}`;
}
function updateClocks() {
  const current = formatClockDate(new Date());
  [dom.objectTime, dom.bedsideTime, dom.ringingTime].forEach((el) => { if (el) el.textContent = current; });
  if (dom.nextWake) dom.nextWake.textContent = state.alarm.time;
  if (dom.wakeWorldMemory) dom.wakeWorldMemory.textContent = state.alarm.time;
  if (dom.wakeWorldName) dom.wakeWorldName.textContent = getWorld(state.wakeWorldId || state.selectedWorldId).name;
  const parsed = parseTime(state.alarm.time);
  if (dom.wakeHourValue) dom.wakeHourValue.textContent = pad2(parsed.hour);
  if (dom.wakeMinuteValue) dom.wakeMinuteValue.textContent = pad2(parsed.minute);
  updateOrbitalRings();
}
function startClock() { updateClocks(); if (clockTimer) window.clearInterval(clockTimer); clockTimer = window.setInterval(updateClocks, 1000); }
function updateWakePhaseDots(phase) {
  if (!dom.wakePhaseDots) return;
  if (!dom.wakePhaseDots.children.length) {
    WAKE_CURVE.forEach(() => {
      const dot = document.createElement('span');
      dom.wakePhaseDots.appendChild(dot);
    });
  }
  const activeIndex = WAKE_CURVE.findIndex((candidate, index) => phase.atMinute < (WAKE_CURVE[index + 1]?.atMinute ?? Infinity));
  [...dom.wakePhaseDots.children].forEach((dot, index) => dot.classList.toggle('is-active', index === Math.max(0, activeIndex)));
}
function applyWakeCurvePhase() {
  const phase = getCurrentWakePhase();
  visualState.wakeVisualIntensity = phase.visualIntensity;
  visualState.audioIntensity = phase.audioDensity;
  document.body.dataset.wakePhase = phase.name;
  updateWakePhaseDots(phase);
  if (audioEngine && audioState.userFacingAudioState === 'PLAYING' && audioState.currentMode === 'ringing') {
    audioEngine.syncWakePhase(phase);
  }
  return phase;
}
function startWakeCurve() {
  if (!wakeCurveStartedAt) wakeCurveStartedAt = Date.now();
  applyWakeCurvePhase();
  if (wakeCurveTimer) window.clearInterval(wakeCurveTimer);
  wakeCurveTimer = window.setInterval(applyWakeCurvePhase, 1000);
}
function stopWakeCurve() {
  if (wakeCurveTimer) window.clearInterval(wakeCurveTimer);
  wakeCurveTimer = null;
  wakeCurveStartedAt = 0;
  visualState.wakeVisualIntensity = 0;
  visualState.audioIntensity = 0;
  delete document.body.dataset.wakePhase;
}
function checkAlarmTick() {
  if (!state.alarm.enabled || state.currentMode === 'ringing') return;
  const now = new Date();
  const current = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${current}`;
  if (current === state.alarm.time && state.alarm.lastTriggeredKey !== key) {
    state.alarm.lastTriggeredKey = key;
    saveState();
    setMode('ringing', { keepAudio: true });
    if (audioState.unlocked) startWakeSequence();
    else showToast('Tap once for sound.', 1600);
  }
}
function startAlarmWatcher() { if (alarmTimer) window.clearInterval(alarmTimer); alarmTimer = window.setInterval(checkAlarmTick, 1000); }

function updateDurationRow() {
  if (!dom.durationRow) return;
  const selectedIndex = BED_DURATION_OPTIONS.findIndex((option) => option.id === state.bedsideDuration);
  const activeIndex = selectedIndex === -1 ? 0 : selectedIndex;
  const total = BED_DURATION_OPTIONS.length;
  [...dom.durationRow.querySelectorAll('[data-duration]')].forEach((button) => {
    const index = BED_DURATION_OPTIONS.findIndex((option) => option.id === button.dataset.duration);
    const rawOffset = index - activeIndex;
    const offset = Math.abs(rawOffset) > total / 2 ? rawOffset - Math.sign(rawOffset) * total : rawOffset;
    const selected = button.dataset.duration === state.bedsideDuration;
    button.style.setProperty('--duration-offset', String(offset));
    button.classList.toggle('is-selected', selected);
    button.classList.toggle('is-near', Math.abs(offset) === 1);
    button.classList.toggle('is-far', Math.abs(offset) > 1);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function changeBedsideDuration(step) {
  const index = BED_DURATION_OPTIONS.findIndex((option) => option.id === state.bedsideDuration);
  const next = BED_DURATION_OPTIONS[modulo((index === -1 ? 0 : index) + step, BED_DURATION_OPTIONS.length)];
  state.bedsideDuration = next.id;
  saveState();
  updateDurationRow();
  startBedsideSessionTimer();
}
function stepDurationWheel(step) {
  if (!step) return;
  changeBedsideDuration(step);
  focusDurationControl();
  revealBedsideControls();
}

function clearBedsideIdleTimer() {
  if (bedsideIdleTimer) window.clearTimeout(bedsideIdleTimer);
  bedsideIdleTimer = null;
}

function clearBedsideSessionTimer() {
  if (bedsideSessionTimer) window.clearTimeout(bedsideSessionTimer);
  bedsideSessionTimer = null;
}

function revealBedsideControls() {
  if (!dom.bedsideRail || !dom.durationRow) return;
  document.body.classList.remove('bedside-idle');
  dom.bedsideRail.classList.add('is-revealed');
  dom.durationRow.classList.add('is-revealed');
  clearBedsideIdleTimer();
  bedsideIdleTimer = window.setTimeout(() => {
    if (state.currentMode !== 'bedside') return;
    document.body.classList.add('bedside-idle');
    dom.bedsideRail.classList.remove('is-revealed');
    dom.durationRow.classList.remove('is-revealed', 'is-focused');
  }, 3600);
}

function focusDurationControl() {
  if (!dom.durationRow) return;
  dom.durationRow.classList.add('is-focused', 'is-revealed');
  const selected = dom.durationRow.querySelector('.duration-option.is-selected');
  if (selected && typeof selected.focus === 'function') selected.focus({ preventScroll: true });
}

function startBedsideSessionTimer() {
  clearBedsideSessionTimer();
  if (state.currentMode !== 'bedside') return;
  const option = BED_DURATION_OPTIONS.find((candidate) => candidate.id === state.bedsideDuration);
  if (!option || option.ms == null) return;
  bedsideSessionTimer = window.setTimeout(() => {
    if (state.currentMode !== 'bedside') return;
    ensureAudioEngine().stopForDurationExpiry();
    setMode('object', { keepAudio: true });
    showToast('Bedside ended', 1400);
  }, option.ms);
}

function positionRingDot(dot, index, total, radiusPct) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  dot.style.left = `${50 + Math.cos(angle) * radiusPct}%`;
  dot.style.top = `${50 + Math.sin(angle) * radiusPct}%`;
}
function buildHourRing() {
  dom.hourRing.textContent = '';
  for (let i = 0; i < 12; i += 1) {
    const dot = document.createElement('button');
    dot.className = `dot hour-dot${i % 3 === 0 ? ' major' : ''}`;
    dot.type = 'button'; dot.dataset.hour12 = String(i); dot.setAttribute('aria-label', `Set hour ${i === 0 ? 12 : i}`);
    positionRingDot(dot, i, 12, 48);
    dom.hourRing.appendChild(dot);
  }
}
function buildMinuteRing() {
  dom.minuteRing.textContent = '';
  for (let i = 0; i < 60; i += 1) {
    const dot = document.createElement('button');
    dot.className = `dot minute-dot${i % 5 === 0 ? ' major' : ''}`;
    dot.type = 'button'; dot.dataset.minute = String(i); dot.setAttribute('aria-label', `Set minute ${pad2(i)}`);
    positionRingDot(dot, i, 60, 48);
    dom.minuteRing.appendChild(dot);
  }
  updateOrbitalRings();
}
function updateOrbitalRings() {
  if (!dom.hourRing || !dom.minuteRing) return;
  const parsed = parseTime(state.alarm.time);
  const activeHour12 = parsed.hour % 12;
  [...dom.hourRing.querySelectorAll('.hour-dot')].forEach((dot) => {
    const hour = Number(dot.dataset.hour12);
    const distance = Math.min(modulo(hour - activeHour12, 12), modulo(activeHour12 - hour, 12));
    dot.classList.toggle('is-active', hour === activeHour12);
    dot.classList.toggle('is-near', distance > 0 && distance <= 2);
    dot.classList.toggle('is-far', distance > 3);
    dot.setAttribute('aria-pressed', String(hour === activeHour12));
  });
  [...dom.minuteRing.querySelectorAll('.minute-dot')].forEach((dot) => {
    const minute = Number(dot.dataset.minute);
    const distance = Math.min(modulo(minute - parsed.minute, 60), modulo(parsed.minute - minute, 60));
    dot.classList.toggle('is-active', minute === parsed.minute);
    dot.classList.toggle('is-near', distance > 0 && distance <= 5);
    dot.classList.toggle('is-far', distance > 15);
    dot.setAttribute('aria-pressed', String(minute === parsed.minute));
  });
}
function ringValueFromPointer(event, ring, total) {
  return modulo(Math.round(ringTurnFromPointer(event, ring) * total), total);
}
function ringTurnFromPointer(event, ring) {
  const rect = ring.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const angle = Math.atan2(event.clientY - cy, event.clientX - cx) + Math.PI / 2;
  return modulo(angle / (Math.PI * 2), 1);
}
function wakeRingDistanceModel(event) {
  const rect = dom.wakeGestureArea.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const distance = Math.hypot(event.clientX - cx, event.clientY - cy);
  const hourRadius = dom.hourRing.getBoundingClientRect().width * 0.48;
  const minuteRadius = dom.minuteRing.getBoundingClientRect().width * 0.48;
  const hourBand = Math.max(36, hourRadius * 0.24);
  const minuteBand = Math.max(30, minuteRadius * 0.13);
  const deadZone = Math.max(22, Math.abs(minuteRadius - hourRadius) * 0.18);
  if (Math.abs(distance - hourRadius) <= hourBand && Math.abs(distance - minuteRadius) > deadZone) return 'hour';
  if (Math.abs(distance - minuteRadius) <= minuteBand) return 'minute';
  return null;
}
function syncWakeStateFromAlarm() { const parsed = parseTime(state.alarm.time); wakeSetState.candidateHour = parsed.hour; wakeSetState.candidateMinute = parsed.minute; wakeSetState.committedTime = state.alarm.time; }
function clearWakeSetterFocus() {
  wakeSetState.activePart = null;
  if (dom.wakeHour) dom.wakeHour.classList.remove('is-selected');
  if (dom.wakeMinute) dom.wakeMinute.classList.remove('is-selected');
  if (dom.wakeGestureArea) delete dom.wakeGestureArea.dataset.activeRing;
  if (dom.wakeSetPanel) dom.wakeSetPanel.classList.add('is-idle');
}
function scheduleWakeFocusSettle() {
  window.clearTimeout(wakeSettleTimer);
  wakeSettleTimer = window.setTimeout(() => {
    if (state.currentMode !== 'wakeSet') return;
    if (wakeSetState.isDragging || wakePointer) {
      scheduleWakeFocusSettle();
      return;
    }
    clearWakeSetterFocus();
  }, WAKE_FOCUS_SETTLE_MS);
}
function setActiveSetter(part, options = {}) {
  if (part !== 'hour' && part !== 'minute') {
    clearWakeSetterFocus();
    return;
  }
  wakeSetState.editingPart = part;
  wakeSetState.activePart = part;
  if (dom.wakeHour) dom.wakeHour.classList.toggle('is-selected', part === 'hour');
  if (dom.wakeMinute) dom.wakeMinute.classList.toggle('is-selected', part === 'minute');
  if (dom.wakeGestureArea) dom.wakeGestureArea.dataset.activeRing = part;
  if (dom.wakeSetPanel) dom.wakeSetPanel.classList.remove('is-idle');
  if (options.settle !== false) scheduleWakeFocusSettle();
}
function changeWakeTime(part, delta) {
  const parsed = parseTime(state.alarm.time);
  if (part === 'hour') parsed.hour = modulo(parsed.hour + delta, 24);
  if (part === 'minute') parsed.minute = modulo(parsed.minute + delta, 60);
  state.alarm.time = formatTime(parsed.hour, parsed.minute);
  wakeSetState.candidateHour = parsed.hour;
  wakeSetState.candidateMinute = parsed.minute;
  wakeSetState.lastInteractionAt = nowMs();
  saveState(); updateClocks(); markWakeInteraction();
}
function setHourFromRing(event) {
  const parsed = parseTime(state.alarm.time);
  const turn = ringTurnFromPointer(event, dom.hourRing);
  if (wakePointer && wakePointer.ring === 'hour') {
    if (!wakePointer.hourTrackingInitialized) {
      wakePointer.hourAbsoluteTurn = (parsed.hour >= 12 ? 1 : 0) + turn;
      wakePointer.hourTrackingInitialized = true;
    } else {
      let delta = turn - wakePointer.lastHourTurn;
      if (delta > 0.5) delta -= 1;
      if (delta < -0.5) delta += 1;
      wakePointer.hourAbsoluteTurn += delta;
    }
    wakePointer.lastHourTurn = turn;
    parsed.hour = modulo(Math.round(wakePointer.hourAbsoluteTurn * 12), 24);
  } else {
    parsed.hour = modulo(Math.round(((parsed.hour >= 12 ? 1 : 0) + turn) * 12), 24);
  }
  state.alarm.time = formatTime(parsed.hour, parsed.minute);
  wakeSetState.candidateHour = parsed.hour;
  saveState(); updateClocks(); markWakeInteraction();
}
function setMinuteFromRing(event) {
  const parsed = parseTime(state.alarm.time);
  parsed.minute = ringValueFromPointer(event, dom.minuteRing, 60);
  state.alarm.time = formatTime(parsed.hour, parsed.minute);
  wakeSetState.candidateMinute = parsed.minute;
  saveState(); updateClocks(); markWakeInteraction();
}
function setWakeFromRingPointer(event, ring) { if (ring === 'hour') setHourFromRing(event); if (ring === 'minute') setMinuteFromRing(event); }
function handleWakeStagePointerDown(event) {
  if (event.target.closest && event.target.closest('.digit-zone')) return;
  const directHour = event.target.closest && event.target.closest('[data-hour12]');
  const directMinute = event.target.closest && event.target.closest('[data-minute]');
  const hitRing = directHour ? 'hour' : directMinute ? 'minute' : wakeRingDistanceModel(event);
  if (!hitRing) return;
  event.preventDefault(); event.stopPropagation();
  wakeSetState.isDragging = true; wakeSetState.dragRing = hitRing; wakeSetState.lastHitRing = hitRing; wakeSetState.lastInteractionAt = nowMs();
  wakePointer = { id: event.pointerId, ring: hitRing, startX: event.clientX, startY: event.clientY, locked: true };
  if (hitRing === 'hour') wakePointer.lastHourTurn = ringTurnFromPointer(event, dom.hourRing);
  dom.wakeGestureArea.setPointerCapture(event.pointerId);
  setActiveSetter(hitRing);
  setWakeFromRingPointer(event, hitRing);
}
function handleWakeStagePointerMove(event) {
  if (!wakeSetState.isDragging || !wakePointer) return;
  event.preventDefault(); event.stopPropagation();
  setWakeFromRingPointer(event, wakePointer.ring);
}
function handleWakeStagePointerUp(event) {
  if (!wakePointer) return;
  event.preventDefault(); event.stopPropagation();
  try { dom.wakeGestureArea.releasePointerCapture(event.pointerId); } catch (error) { /* pointer may already be released */ }
  wakeSetState.isDragging = false; wakeSetState.dragRing = null; wakePointer = null; markWakeInteraction();
}
function markWakeInteraction() {
  if (dom.wakeSetPanel) dom.wakeSetPanel.classList.remove('is-idle');
  if (wakeSetState.activePart) scheduleWakeFocusSettle();
}

function confirmWakeSet() {
  if (isWakeEntryGuardActive()) return;
  saveState();
  showToast(`Wake ${state.alarm.time}`, 1100);
  stopWakePreview();
  setMode('object', { keepAudio: true });
}

function closeWakeSet() {
  if (isWakeEntryGuardActive()) return;
  stopWakePreview();
  setMode('object', { keepAudio: true });
}

function applyWorld(world) {
  if (!world) return null;
  state.selectedWorldId = world.id;
  state.settings.audio.soundMode = WORLD_DEFAULT_SOUND_MODE;
  worldSelectionState.activeWorld = world.id;
  worldSelectionState.selectedWorld = world.id;
  worldSelectionState.focusedWorld = world.id;
  worldSelectionState.stagedWorld = null;
  saveState();
  setActiveVisualWorld(world.id);
  if (renderer) renderer.setWorld(world.id);
  if (audioState.userFacingAudioState === 'PLAYING') ensureAudioEngine().crossfadeToWorld(world);
  syncSettingsControls(false);
  updateWorldReadout();
  return world;
}

function setWakeWorldByStep(step) {
  const index = WORLDS.findIndex((world) => world.id === (state.wakeWorldId || state.selectedWorldId));
  const next = WORLDS[modulo((index === -1 ? 0 : index) + step, WORLDS.length)];
  if (!next) return null;
  state.wakeWorldId = next.id;
  saveState();
  setActiveVisualWorld(next.id);
  if (renderer && state.currentMode === 'wakeSet') renderer.setWorld(next.id);
  if (state.currentMode === 'wakeSet' && wakePreviewActive && audioState.userFacingAudioState === 'PLAYING') {
    ensureAudioEngine().startMode('object', { worldId: next.id, intensity: 0.46 });
  } else if (state.currentMode === 'wakeSet' && audioState.userFacingAudioState === 'PLAYING' && audioState.currentMode === 'ringing') {
    ensureAudioEngine().startMode('ringing', { worldId: next.id, intensity: 1 });
  }
  updateClocks();
  return next;
}

function handleWakeWorldStep(event, step) {
  event.preventDefault();
  event.stopPropagation();
  setWakeWorldByStep(step);
}

function shouldStartWorldAudioFromGesture(context) {
  return context === 'worlds' && worldSelectionState.entryMode === 'world' && audioState.userFacingAudioState !== 'PLAYING';
}

function startWorldAudioFromGesture(event, context) {
  if (!event || context !== 'worlds') return;
  startSoundFromGesture(event, 'object', { worldId: state.selectedWorldId, intensity: 1 });
}

function enterWorldFromGesture(event) {
  const worldId = state.selectedWorldId;
  startSoundFromGesture(event, 'object', { worldId, intensity: 1 });
  setMode('worlds', { keepAudio: true, entry: 'world' });
}

function enterWakeFromGesture(event) {
  if (nowMs() - wakeLastEntryAt < 220) return;
  wakeLastEntryAt = nowMs();
  wakeEntryGuardUntil = nowMs() + 420;
  setMode('wakeSet', { keepAudio: true });
  playWakePreviewFromGesture(event);
}

function isWakeEntryGuardActive() {
  return state.currentMode === 'wakeSet' && nowMs() < wakeEntryGuardUntil;
}

function setWorldByStep(step, context = state.currentMode, event = null) {
  const baseId = context === 'bedside' || context === 'object' ? state.selectedWorldId : (worldSelectionState.selectedWorld || worldSelectionState.activeWorld || state.selectedWorldId);
  const index = WORLDS.findIndex((world) => world.id === baseId);
  const next = WORLDS[modulo(index + step, WORLDS.length)];
  if (!next) return null;
  if (context === 'bedside' || context === 'object') {
    applyWorld(next);
  } else {
    applyWorld(next);
    renderWorlds();
    startWorldAudioFromGesture(event, context);
  }
  return next;
}

function normalizeWheelStep(event) {
  const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (Math.abs(raw) < 10) return 0;
  return raw > 0 ? 1 : -1;
}

function handleWorldWheel(event, context = state.currentMode) {
  const step = normalizeWheelStep(event);
  if (!step) return;
  const now = nowMs();
  if (now - wheelWorldThrottleAt < 260) return;
  wheelWorldThrottleAt = now;
  event.preventDefault();
  setWorldByStep(step, context, event);
}

function isEditableTarget(target) {
  return Boolean(target && target.closest && target.closest('input, select, textarea, [contenteditable="true"]'));
}

function computeConstellationGeometry(viewportWidth = window.innerWidth, viewportHeight = window.innerHeight) {
  const rootStyles = getComputedStyle(document.documentElement);
  const gridMargin = parseCssPixels(rootStyles.getPropertyValue('--grid-margin'), Math.max(18, Math.min(viewportWidth, viewportHeight) * 0.04));
  const safeLeft = gridMargin;
  const safeRight = viewportWidth - gridMargin;
  const safeTop = gridMargin;
  const safeBottom = viewportHeight - gridMargin;
  const safeWidth = Math.max(1, safeRight - safeLeft);
  const safeHeight = Math.max(1, safeBottom - safeTop);
  const safeMin = Math.min(safeWidth, safeHeight);
  const objectCenterX = safeLeft + safeWidth / 2;
  const objectCenterY = safeTop + safeHeight / 2;
  const labelHidden = safeMin < WORLD_LABEL_HIDE_SAFE_MIN;
  const largestDotRadius = safeMin < 480 ? 20 : 26;
  const haloRadius = safeMin < 480 ? 12 : 18;
  const labelReserve = labelHidden ? 0 : 28;
  const maxDotOuterRadius = largestDotRadius + haloRadius + labelReserve;
  const minimumUsefulOrbit = Math.max(70, Math.min(116, safeMin * 0.24));
  const apertureRadius = safeMin * 0.27;
  const desiredRadius = Math.min(apertureRadius * 1.18, safeMin * 0.42);
  const maxRadius = Math.max(54, safeMin / 2 - maxDotOuterRadius);
  const constellationRadius = clamp(desiredRadius, Math.min(minimumUsefulOrbit, maxRadius), maxRadius);
  const dotSize = clamp(safeMin * 0.050, 18, labelHidden ? 26 : 30);
  const activeSize = clamp(safeMin * 0.078, 26, labelHidden ? 38 : 44);
  const controlY = clamp(objectCenterY + constellationRadius + 18, safeTop + 54, safeBottom - 52);
  const nameY = clamp(controlY + 52, safeTop + 62, safeBottom - 18);
  const clippingWarning = constellationRadius + maxDotOuterRadius > safeMin / 2;
  return { hardRule: GRID_GEOMETRY_HARD_RULE, safeLeft, safeRight, safeTop, safeBottom, safeWidth, safeHeight, safeMin, objectCenterX, objectCenterY, apertureCenterX: objectCenterX, apertureCenterY: objectCenterY, constellationRadius, maxDotOuterRadius, dotSize, activeSize, labelHidden, controlY, nameY, clippingWarning };
}
function applyConstellationGeometry(geometry = computeConstellationGeometry()) {
  worldSelectionState.geometry = geometry;
  const root = document.documentElement;
  root.style.setProperty('--world-center-x', `${geometry.objectCenterX}px`);
  root.style.setProperty('--world-center-y', `${geometry.objectCenterY}px`);
  root.style.setProperty('--world-radius', `${geometry.constellationRadius}px`);
  root.style.setProperty('--world-guide-size', `${geometry.constellationRadius * 2}px`);
  root.style.setProperty('--world-dot-size', `${geometry.dotSize}px`);
  root.style.setProperty('--world-active-size', `${geometry.activeSize}px`);
  root.style.setProperty('--world-control-y', `${geometry.controlY}px`);
  root.style.setProperty('--world-name-y', `${geometry.nameY}px`);
  root.style.setProperty('--object-center-x', `${geometry.objectCenterX}px`);
  root.style.setProperty('--object-center-y', `${geometry.objectCenterY}px`);
  root.style.setProperty('--orbit-radius-primary', `${geometry.constellationRadius}px`);
  if (dom.debugGridOverlay) {
    dom.debugGridOverlay.dataset.safeBounds = `${Math.round(geometry.safeLeft)},${Math.round(geometry.safeTop)},${Math.round(geometry.safeRight)},${Math.round(geometry.safeBottom)}`;
    dom.debugGridOverlay.dataset.constellationRadius = String(Math.round(geometry.constellationRadius));
    dom.debugGridOverlay.dataset.clippingWarning = String(geometry.clippingWarning);
  }
  return geometry;
}
function polarPoint(centerX, centerY, radius, angle) { return { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius }; }
function initializeWorldSelection(entry = 'object') {
  worldSelectionState.entryMode = entry;
  const baseId = entry === 'wakeWorld' ? (state.wakeWorldId || state.selectedWorldId) : state.selectedWorldId;
  worldSelectionState.activeWorld = baseId;
  worldSelectionState.selectedWorld = baseId;
  worldSelectionState.focusedWorld = baseId;
  worldSelectionState.stagedWorld = null;
  if (dom.worldsPanel) dom.worldsPanel.dataset.entry = entry;
}
function updateWorldReadout() {
  const selected = getWorld(worldSelectionState.activeWorld || worldSelectionState.selectedWorld || state.selectedWorldId);
  if (dom.worldConstellationName) dom.worldConstellationName.textContent = selected.name;
  if (dom.worldBackButton) dom.worldBackButton.textContent = worldSelectionState.entryMode === 'wakeWorld' ? 'BACK' : 'CLOSE';
}
function renderWorlds() {
  if (!dom.worldConstellation) return;
  const geometry = applyConstellationGeometry();
  dom.worldConstellation.textContent = '';
  const total = WORLDS.length;
  const activeIndex = WORLDS.findIndex((candidate) => candidate.id === (worldSelectionState.activeWorld || state.selectedWorldId));
  WORLDS.forEach((world, index) => {
    const palette = world.palettes.object;
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    const point = polarPoint(geometry.objectCenterX, geometry.objectCenterY, geometry.constellationRadius, angle);
    const disc = document.createElement('button');
    disc.className = 'world-disc';
    disc.type = 'button';
    disc.dataset.world = world.id;
    disc.dataset.angle = String(angle);
    disc.setAttribute('aria-label', `Select world ${world.name}`);
    disc.style.left = `${point.x}px`;
    disc.style.top = `${point.y}px`;
    disc.style.setProperty('--disc-wall', palette.wall);
    disc.style.setProperty('--disc-spill', palette.spill);
    disc.style.setProperty('--disc-outer', palette.outer);
    disc.style.setProperty('--disc-inner', palette.inner);
    disc.style.setProperty('--disc-core', palette.core);
    const distance = Math.min(modulo(index - activeIndex, total), modulo(activeIndex - index, total));
    disc.classList.toggle('is-active', world.id === worldSelectionState.activeWorld);
    disc.classList.toggle('is-selected', world.id === worldSelectionState.selectedWorld && world.id !== worldSelectionState.activeWorld);
    disc.classList.toggle('is-focused', world.id === worldSelectionState.focusedWorld);
    disc.classList.toggle('is-staged', world.id === worldSelectionState.stagedWorld);
    disc.classList.toggle('is-near', distance === 1);
    disc.classList.toggle('is-far', distance > 2);
    disc.classList.toggle('is-label-hidden', geometry.labelHidden);
    dom.worldConstellation.appendChild(disc);
  });
  updateWorldReadout();
}
function worldFromConstellationPointer(event) {
  const geometry = worldSelectionState.geometry || applyConstellationGeometry();
  const angle = Math.atan2(event.clientY - geometry.objectCenterY, event.clientX - geometry.objectCenterX) + Math.PI / 2;
  return WORLDS[modulo(Math.round((angle / (Math.PI * 2)) * WORLDS.length), WORLDS.length)];
}
function selectWorldCandidate(worldId, { stage = true, event = null } = {}) {
  const world = getWorld(worldId);
  applyWorld(world);
  renderWorlds();
  startWorldAudioFromGesture(event, 'worlds');
}
function revertWorldChoiceAndClose() {
  const activeWorld = getWorld(state.selectedWorldId);
  setActiveVisualWorld(activeWorld.id);
  if (renderer) renderer.setWorld(activeWorld.id);
  if (audioState.userFacingAudioState === 'PLAYING') ensureAudioEngine().crossfadeToWorld(activeWorld);
  if (worldSelectionState.entryMode === 'wakeWorld') {
    wakeSetState.wakeStep = 'time';
    setMode('wakeSet', { keepAudio: true });
  } else {
    setMode('object', { keepAudio: true });
  }
}
function selectWorldFromConstellation(event, playOnHold = false) {
  const direct = event.target.closest && event.target.closest('[data-world]');
  const world = direct ? getWorld(direct.dataset.world) : worldFromConstellationPointer(event);
  if (!world) return;
  selectWorldCandidate(world.id, { stage: true, event });
  if (playOnHold) playSoundFromGesture(event, 'object');
}

function updateRails() {
  [dom.objectRail, dom.bedsideRail, dom.wakeRail, dom.worldRail].forEach((rail) => rail && rail.classList.remove('is-current'));
  [dom.railBed, dom.railWake, dom.railWorld].forEach((button) => button && button.classList.remove('is-active', 'is-far'));
  if (dom.objectRail && state.currentMode === 'object') dom.objectRail.classList.add('is-current');
  if (dom.bedsideRail && state.currentMode === 'bedside') dom.bedsideRail.classList.add('is-current');
  if (dom.wakeRail && state.currentMode === 'wakeSet') dom.wakeRail.classList.add('is-current');
  if (dom.worldRail && state.currentMode === 'worlds') dom.worldRail.classList.add('is-current');
  const active = state.currentMode === 'bedside' ? dom.railBed : state.currentMode === 'wakeSet' ? dom.railWake : state.currentMode === 'worlds' ? dom.railWorld : null;
  if (active) active.classList.add('is-active');
  updateSoundControls();
}
function updateSoundControls() {
  const isPlaying = audioState.userFacingAudioState === 'PLAYING';
  document.body.dataset.audio = isPlaying ? 'playing' : 'stopped';
  if (!dom.soundToggleButton) return;
  dom.soundToggleButton.classList.toggle('is-on', isPlaying);
  dom.soundToggleButton.textContent = isPlaying ? 'ON' : 'OFF';
  dom.soundToggleButton.setAttribute('aria-pressed', String(isPlaying));
  dom.soundToggleButton.setAttribute('aria-label', isPlaying ? 'Sound on. Tap to stop.' : 'Sound off. Tap to play.');
}
function handlePlayStop(event, modeName = state.currentMode === 'bedside' ? 'bedside' : 'object') {
  if (audioState.userFacingAudioState === 'PLAYING') return stopSoundExplicit();
  return playSoundFromGesture(event, modeName);
}
function handleGlobalSoundToggle(event) {
  if (audioState.userFacingAudioState === 'PLAYING') return stopSoundExplicit();
  return playCurrentSoundFromGesture(event);
}

function triggerObjectTapPulse() {
  visualState.objectTapPulseUntil = performance.now() + 620;
}

function handleSensoryPointerStart(event, mode) {
  sensoryPointer = { x: event.clientX, y: event.clientY, mode, at: nowMs(), pointerType: event.pointerType || 'mouse' };
  apertureTapToggleArmed = false;
  if (mode === 'bedside') revealBedsideControls();
  try { event.currentTarget.setPointerCapture(event.pointerId); } catch (error) { /* capture not always available */ }
}
function handleSensoryPointerMove(event) {
  if (!sensoryPointer) return;
  if (sensoryPointer.mode === 'bedside') revealBedsideControls();
}
function handleSensoryPointerEnd(event) {
  if (!sensoryPointer) return;
  const dx = event.clientX - sensoryPointer.x;
  const dy = event.clientY - sensoryPointer.y;
  const isHorizontalWorldGesture = Math.abs(dx) > 54 && Math.abs(dx) > Math.abs(dy) * 1.2;
  if (isHorizontalWorldGesture && (sensoryPointer.mode === 'object' || sensoryPointer.mode === 'bedside')) {
    setWorldByStep(dx < 0 ? 1 : -1, sensoryPointer.mode);
  } else if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.4 && sensoryPointer.mode === 'bedside') {
    const next = clamp(state.settings.visualBrightness + (dy < 0 ? 0.08 : -0.08), 0.08, 1);
    state.settings.visualBrightness = next;
    saveState();
    showToast(`Brightness ${next.toFixed(2)}`, 800);
  } else if (nowMs() - sensoryPointer.at < 380 && Math.hypot(dx, dy) < 12 && sensoryPointer.mode === 'object') {
    triggerObjectTapPulse();
    handleGlobalSoundToggle(event);
    revealObjectHint();
  }
  sensoryPointer = null;
  apertureTapToggleArmed = false;
}
function revealObjectHint() { dom.objectRail.classList.add('show-labels'); window.setTimeout(() => dom.objectRail.classList.remove('show-labels'), 1400); }

function populateSoundModes() {
  dom.soundModeSelect.textContent = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = WORLD_DEFAULT_SOUND_MODE;
  defaultOption.textContent = 'Built-in world track';
  dom.soundModeSelect.appendChild(defaultOption);
  SOUND_MODES.filter((mode) => mode.id !== 'phi-dawn-chorale').forEach((mode) => {
    const option = document.createElement('option'); option.value = mode.id; option.textContent = mode.name; dom.soundModeSelect.appendChild(option);
  });
}
function syncSettingsControls(save = false) {
  const audio = state.settings.audio;
  const currentWorld = getWorld(state.selectedWorldId);
  const effectiveSoundMode = getEffectiveSoundMode(currentWorld);
  const hasWorldOverride = Boolean(audio.worldSoundModes?.[currentWorld.id]);
  dom.soundModeSelect.value = hasWorldOverride ? effectiveSoundMode.id : WORLD_DEFAULT_SOUND_MODE;
  if (dom.soundModeDescription) {
    const worldPrefix = hasWorldOverride ? `${currentWorld.name} custom track: ${effectiveSoundMode.name}. ` : `${currentWorld.name} track: ${effectiveSoundMode.name}. `;
    dom.soundModeDescription.textContent = worldPrefix + effectiveSoundMode.description;
  }
  dom.binauralToggle.checked = Boolean(audio.binauralEnabled);
  dom.deltaSlider.value = audio.binauralDeltaHz;
  dom.deltaReadout.textContent = `${audio.binauralDeltaHz} Hz`;
  const pairs = [['masterVolume', 'masterVolumeReadout'], ['bedsideVolume', 'bedsideVolumeReadout'], ['objectVolume', 'objectVolumeReadout'], ['wakeVolume', 'wakeVolumeReadout'], ['airVolume', 'airVolumeReadout'], ['strikeVolume', 'strikeVolumeReadout'], ['shimmerAmount', 'shimmerReadout']];
  pairs.forEach(([inputId, outputId]) => { const key = inputId === 'shimmerAmount' ? 'shimmerAmount' : inputId; dom[inputId].value = audio[key]; dom[outputId].textContent = Number(audio[key]).toFixed(2); });
  dom.brightnessSlider.value = state.settings.visualBrightness;
  dom.brightnessReadout.textContent = Number(state.settings.visualBrightness).toFixed(2);
  dom.reduceMotionToggle.checked = Boolean(state.settings.reduceMotion);
  dom.use24hToggle.checked = Boolean(state.settings.use24h);
  if (save) saveState();
}
function refreshDiagnostics(immediate = false) {
  if (!dom.diagnosticsOutput) return;
  const render = () => {
    const diagnostics = getAudioDiagnostics();
    const geometry = worldSelectionState.geometry || computeConstellationGeometry();
    const payload = {
      currentMode: state.currentMode,
      selectedWorld: state.selectedWorldId,
      wakeWorld: state.wakeWorldId,
      alarmTime: state.alarm.time,
      userFacingAudioState: diagnostics.userFacingAudioState,
      audioPlaybackState: diagnostics.audioPlaybackState,
      audioContextState: diagnostics.audioContextState,
      activeWorld: diagnostics.activeWorld,
      currentWakePhaseName: diagnostics.currentWakePhaseName,
      currentWakeMinute: diagnostics.currentWakeMinute,
      currentSoundModeId: diagnostics.currentSoundModeId,
      engineStyle: diagnostics.engineStyle,
      lastPhraseAt: diagnostics.lastPhraseAt,
      lastEventAt: diagnostics.lastEventAt,
      modeGain: diagnostics.modeGain,
      masterGainTarget: diagnostics.masterGainTarget,
      compressorEnabled: diagnostics.compressorEnabled,
      activeNodes: diagnostics.activeNodes,
      activeOscillators: diagnostics.activeOscillators,
      lastAudioError: diagnostics.lastAudioError,
      lastAudioStopReason: diagnostics.lastAudioStopReason,
      currentAudioSessionId: diagnostics.currentAudioSessionId,
      limiterCeiling: diagnostics.limiterCeiling,
      gridOverlayEnabled,
      constellationGeometry: {
        hardRule: geometry.hardRule,
        safeMin: Math.round(geometry.safeMin),
        objectCenterX: Math.round(geometry.objectCenterX),
        objectCenterY: Math.round(geometry.objectCenterY),
        constellationRadius: Math.round(geometry.constellationRadius),
        clippingWarning: geometry.clippingWarning
      },
      noMedicalClaims: true
    };
    dom.diagnosticsOutput.textContent = JSON.stringify(payload, null, 2);
  };
  render();
  if (immediate) {
    window.clearInterval(diagnosticsTimer);
    diagnosticsTimer = window.setInterval(render, 1200);
  }
}
function toggleDebugGrid() { gridOverlayEnabled = !gridOverlayEnabled; document.body.classList.toggle('debug-grid', gridOverlayEnabled); refreshDiagnostics(); }

function bindEvents() {
  dom.objectGestureSurface.addEventListener('pointerdown', (event) => handleSensoryPointerStart(event, 'object'));
  dom.objectGestureSurface.addEventListener('pointermove', handleSensoryPointerMove);
  dom.objectGestureSurface.addEventListener('pointerup', handleSensoryPointerEnd);
  dom.bedsideGestureSurface.addEventListener('pointerdown', (event) => handleSensoryPointerStart(event, 'bedside'));
  dom.bedsideGestureSurface.addEventListener('pointermove', handleSensoryPointerMove);
  dom.bedsideGestureSurface.addEventListener('pointerup', handleSensoryPointerEnd);

  dom.railBed.addEventListener('pointerdown', () => { setMode('bedside', { keepAudio: true }); });
  dom.railWake.addEventListener('pointerdown', (event) => { event.preventDefault(); event.stopPropagation(); });
  dom.railWake.addEventListener('pointerup', (event) => { event.preventDefault(); event.stopPropagation(); enterWakeFromGesture(event); });
  dom.railWake.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); enterWakeFromGesture(event); });
  if (dom.railWorld) dom.railWorld.addEventListener('pointerdown', (event) => { event.preventDefault(); enterWorldFromGesture(event); });
  dom.railSet.addEventListener('click', () => setMode('settings', { keepAudio: true }));
  dom.soundToggleButton.addEventListener('pointerdown', (event) => { event.preventDefault(); handleGlobalSoundToggle(event); });

  if (dom.bedsideDurationButton) dom.bedsideDurationButton.addEventListener('click', () => { focusDurationControl(); revealBedsideControls(); });
  dom.bedsideExitButton.addEventListener('click', () => setMode('object', { keepAudio: true }));
  dom.durationRow.addEventListener('pointerdown', (event) => {
    const direct = event.target.closest && event.target.closest('[data-duration]');
    durationPointer = { x: event.clientX, y: event.clientY, lastStepX: event.clientX, at: nowMs(), moved: false, downDuration: direct ? direct.dataset.duration : null };
    dom.durationRow.classList.add('is-focused');
    revealBedsideControls();
    try { dom.durationRow.setPointerCapture(event.pointerId); } catch (error) { /* capture optional */ }
  });
  dom.durationRow.addEventListener('pointermove', (event) => {
    if (!durationPointer) return;
    event.preventDefault();
    const dx = event.clientX - durationPointer.lastStepX;
    const dy = event.clientY - durationPointer.y;
    if (Math.abs(dx) < 34 || Math.abs(dx) < Math.abs(dy) * 0.85) return;
    durationPointer.moved = true;
    durationPointer.lastStepX = event.clientX;
    stepDurationWheel(dx < 0 ? 1 : -1);
  });
  dom.durationRow.addEventListener('pointerup', (event) => {
    if (!durationPointer) return;
    try { dom.durationRow.releasePointerCapture(event.pointerId); } catch (error) { /* pointer may already be released */ }
    const direct = event.target.closest && event.target.closest('[data-duration]');
    const tappedDuration = durationPointer.downDuration || (direct ? direct.dataset.duration : null);
    const dx = event.clientX - durationPointer.x;
    if (tappedDuration && !durationPointer.moved && nowMs() - durationPointer.at < 520 && Math.abs(dx) < 20) state.bedsideDuration = tappedDuration;
    else if (!durationPointer.moved && Math.abs(dx) > 22) stepDurationWheel(dx < 0 ? 1 : -1);
    saveState(); updateDurationRow(); revealBedsideControls(); window.setTimeout(() => dom.durationRow && dom.durationRow.classList.remove('is-focused'), 1800); durationPointer = null;
  });
  dom.durationRow.addEventListener('pointercancel', (event) => {
    if (!durationPointer) return;
    try { dom.durationRow.releasePointerCapture(event.pointerId); } catch (error) { /* pointer may already be released */ }
    durationPointer = null;
    window.setTimeout(() => dom.durationRow && dom.durationRow.classList.remove('is-focused'), 900);
  });

  dom.wakeCloseButton.addEventListener('click', closeWakeSet);
  dom.wakeRailClose.addEventListener('click', closeWakeSet);
  dom.wakeSetConfirmButton.addEventListener('click', confirmWakeSet);
  dom.wakeHour.addEventListener('click', () => setActiveSetter('hour'));
  dom.wakeMinute.addEventListener('click', () => setActiveSetter('minute'));
  [dom.wakeHour, dom.wakeMinute].forEach((zone) => {
    const part = zone.id === 'wakeHour' ? 'hour' : 'minute';
    zone.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') setActiveSetter(part, { settle: false }); });
    zone.addEventListener('pointerleave', () => { if (!wakeSetState.isDragging) markWakeInteraction(); });
    zone.addEventListener('pointerdown', (event) => { wakePointer = { x: event.clientX, y: event.clientY, at: nowMs(), part }; setActiveSetter(wakePointer.part); zone.setPointerCapture(event.pointerId); });
    zone.addEventListener('pointerup', (event) => {
      if (!wakePointer) return;
      const dx = event.clientX - wakePointer.x; const dy = event.clientY - wakePointer.y; const speed = Math.hypot(dx, dy) / Math.max(1, nowMs() - wakePointer.at);
      if (Math.abs(dx) > 58 && Math.abs(dx) > Math.abs(dy) * 1.25) setActiveSetter(wakeSetState.editingPart === 'hour' ? 'minute' : 'hour');
      if (Math.abs(dy) > 30 && Math.abs(dy) > Math.abs(dx)) { const stepBase = wakePointer.part === 'minute' ? (speed > 0.9 ? 5 : 1) : (speed > 0.9 ? 3 : 1); changeWakeTime(wakePointer.part, dy < 0 ? stepBase : -stepBase); }
      try { zone.releasePointerCapture(event.pointerId); } catch (error) { /* pointer may already be released */ }
      wakePointer = null;
      markWakeInteraction();
    });
    zone.addEventListener('pointercancel', (event) => {
      try { zone.releasePointerCapture(event.pointerId); } catch (error) { /* pointer may already be released */ }
      wakePointer = null;
      markWakeInteraction();
    });
  });
  dom.wakeGestureArea.addEventListener('pointerdown', handleWakeStagePointerDown);
  dom.wakeGestureArea.addEventListener('pointermove', handleWakeStagePointerMove);
  dom.wakeGestureArea.addEventListener('pointerup', handleWakeStagePointerUp);
  dom.wakeGestureArea.addEventListener('pointercancel', handleWakeStagePointerUp);
  dom.wakeWorldPrev.addEventListener('pointerdown', (event) => handleWakeWorldStep(event, -1));
  dom.wakeWorldNext.addEventListener('pointerdown', (event) => handleWakeWorldStep(event, 1));
  dom.wakeWorldSelector.addEventListener('pointerdown', (event) => {
    if (event.target.closest && event.target.closest('.world-step-button')) return;
    wakeWorldPointer = { x: event.clientX, y: event.clientY, at: nowMs() };
    try { dom.wakeWorldSelector.setPointerCapture(event.pointerId); } catch (error) { /* capture optional */ }
  });
  dom.wakeWorldSelector.addEventListener('pointerup', (event) => {
    if (!wakeWorldPointer) return;
    const dx = event.clientX - wakeWorldPointer.x;
    const dy = event.clientY - wakeWorldPointer.y;
    if (Math.abs(dx) > 32 && Math.abs(dx) > Math.abs(dy) * 1.2) setWakeWorldByStep(dx < 0 ? 1 : -1);
    wakeWorldPointer = null;
  });

  dom.worldsCloseButton.addEventListener('click', revertWorldChoiceAndClose);
  dom.worldBackButton.addEventListener('click', revertWorldChoiceAndClose);
  dom.worldConstellation.addEventListener('pointerdown', (event) => {
    startWorldAudioFromGesture(event, 'worlds');
    worldPointer = { x: event.clientX, y: event.clientY, at: nowMs(), entry: worldSelectionState.entryMode };
    try { dom.worldConstellation.setPointerCapture(event.pointerId); } catch (error) { /* capture optional */ }
    window.clearTimeout(worldLongHoldTimer);
    worldLongHoldTimer = window.setTimeout(() => selectWorldFromConstellation(event, true), 700);
  });
  dom.worldConstellation.addEventListener('pointermove', (event) => {
    if (!worldPointer) return;
    const dx = event.clientX - worldPointer.x;
    const dy = event.clientY - worldPointer.y;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.2) return;
    if (Math.hypot(dx, dy) > 16) selectWorldFromConstellation(event, false);
  });
  dom.worldConstellation.addEventListener('pointerup', (event) => {
    window.clearTimeout(worldLongHoldTimer);
    if (worldPointer) {
      const dx = event.clientX - worldPointer.x;
      const dy = event.clientY - worldPointer.y;
      if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.2) setWorldByStep(dx < 0 ? 1 : -1, 'worlds', event);
      else if (nowMs() - worldPointer.at < 650) selectWorldFromConstellation(event, false);
    }
    worldPointer = null;
  });
  dom.bedsideGestureSurface.addEventListener('wheel', (event) => handleWorldWheel(event, 'bedside'), { passive: false });
  dom.worldConstellation.addEventListener('wheel', (event) => handleWorldWheel(event, 'worlds'), { passive: false });
  dom.bedsideWorldPrev.addEventListener('pointerdown', (event) => { event.preventDefault(); setWorldByStep(-1, 'bedside', event); revealBedsideControls(); });
  dom.bedsideWorldNext.addEventListener('pointerdown', (event) => { event.preventDefault(); setWorldByStep(1, 'bedside', event); revealBedsideControls(); });

  dom.worldPrevButton.addEventListener('pointerdown', (event) => { event.preventDefault(); setWorldByStep(-1, 'worlds', event); });
  dom.worldNextButton.addEventListener('pointerdown', (event) => { event.preventDefault(); setWorldByStep(1, 'worlds', event); });

  dom.settingsCloseButton.addEventListener('click', () => closeOverlay('settings'));
  dom.settingsBackdrop.addEventListener('click', () => closeOverlay('settings'));
  dom.safetyCloseButton.addEventListener('click', () => closeOverlay('safety'));
  dom.safetyBackdrop.addEventListener('click', () => closeOverlay('safety'));
  dom.diagnosticsCloseButton.addEventListener('click', () => closeOverlay('diagnostics'));
  dom.diagnosticsBackdrop.addEventListener('click', () => closeOverlay('diagnostics'));
  dom.openSafetyButton.addEventListener('click', () => setMode('safety', { keepAudio: true }));
  dom.openDiagnosticsButton.addEventListener('click', () => setMode('diagnostics', { keepAudio: true }));
  dom.diagGridButton.addEventListener('click', toggleDebugGrid);
  dom.diagGridButton2.addEventListener('click', toggleDebugGrid);

  ['masterVolume', 'bedsideVolume', 'objectVolume', 'wakeVolume', 'airVolume', 'strikeVolume', 'shimmerAmount'].forEach((id) => {
    dom[id].addEventListener('input', () => { const key = id; state.settings.audio[key] = Number(dom[id].value); syncSettingsControls(true); });
  });
  dom.soundModeSelect.addEventListener('change', () => {
    const world = getWorld(state.selectedWorldId);
    state.settings.audio.soundMode = WORLD_DEFAULT_SOUND_MODE;
    if (dom.soundModeSelect.value === WORLD_DEFAULT_SOUND_MODE) delete state.settings.audio.worldSoundModes[world.id];
    else state.settings.audio.worldSoundModes[world.id] = dom.soundModeSelect.value;
    saveState();
    syncSettingsControls(false);
    if (audioState.userFacingAudioState === 'PLAYING') ensureAudioEngine().crossfadeToWorld(world);
  });
  dom.binauralToggle.addEventListener('change', () => { state.settings.audio.binauralEnabled = dom.binauralToggle.checked; saveState(); });
  dom.deltaSlider.addEventListener('input', () => { state.settings.audio.binauralDeltaHz = Number(dom.deltaSlider.value); syncSettingsControls(true); });
  dom.brightnessSlider.addEventListener('input', () => { state.settings.visualBrightness = Number(dom.brightnessSlider.value); syncSettingsControls(true); });
  dom.reduceMotionToggle.addEventListener('change', () => { state.settings.reduceMotion = dom.reduceMotionToggle.checked; saveState(); });
  dom.use24hToggle.addEventListener('change', () => { state.settings.use24h = dom.use24hToggle.checked; saveState(); updateClocks(); });
  dom.softTestButton.addEventListener('pointerdown', (event) => playSoundFromGesture(event, 'object'));
  dom.mediumTestButton.addEventListener('pointerdown', (event) => playSoundFromGesture(event, 'object'));
  dom.wakeTestButton.addEventListener('pointerdown', (event) => { playWakeSoundFromGesture(event); });
  dom.stopAudioButton.addEventListener('click', stopSoundExplicit);
  dom.diagToneButton.addEventListener('pointerdown', (event) => playSoundFromGesture(event, 'object'));
  dom.diagPlayButton.addEventListener('pointerdown', (event) => playSoundFromGesture(event, 'object'));
  dom.diagBedsideButton.addEventListener('pointerdown', (event) => { setMode('bedside', { keepAudio: true }); playSoundFromGesture(event, 'bedside'); });
  dom.diagWakeButton.addEventListener('pointerdown', (event) => playWakeSoundFromGesture(event));
  dom.diagStopButton.addEventListener('click', stopSoundExplicit);

  dom.stopWakeButton.addEventListener('click', () => { ensureAudioEngine().stopForWakeDismiss(); setMode('object', { keepAudio: true }); });
  dom.snoozeWakeButton.addEventListener('click', () => {
    ensureAudioEngine().stopForWakeDismiss();
    const now = new Date(Date.now() + state.alarm.snoozeMinutes * 60000);
    state.alarm.time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`; saveState(); updateClocks(); setMode('object', { keepAudio: true });
  });
  dom.ringingPanel.addEventListener('pointerdown', (event) => playSoundFromGesture(event, 'ringing'));

  window.addEventListener('resize', () => { if (state.currentMode === 'worlds') renderWorlds(); });
  document.addEventListener('keydown', (event) => {
    if (isEditableTarget(event.target)) return;
    if (event.key === ' ' || event.key === 'Spacebar') {
      if (state.currentMode === 'bedside' || state.currentMode === 'worlds' || state.currentMode === 'wakeSet') {
        event.preventDefault();
        handleGlobalSoundToggle(event);
      }
    }
    if (event.key === 'ArrowLeft' && state.currentMode === 'worlds') { event.preventDefault(); setWorldByStep(-1, 'worlds', event); }
    if (event.key === 'ArrowRight' && state.currentMode === 'worlds') { event.preventDefault(); setWorldByStep(1, 'worlds', event); }
    if (event.key === 'ArrowLeft' && state.currentMode === 'wakeSet') { event.preventDefault(); setWakeWorldByStep(-1); }
    if (event.key === 'ArrowRight' && state.currentMode === 'wakeSet') { event.preventDefault(); setWakeWorldByStep(1); }
    if (event.key === 'Escape') setMode('object', { keepAudio: true });
  });
}

function init() {
  cacheDom();
  renderer = createApertureRenderer(dom.apertureCanvas);
  renderer.start();
  populateSoundModes();
  syncSettingsControls(false);
  buildHourRing();
  buildMinuteRing();
  updateDurationRow();
  updateSoundControls();
  bindEvents();
  startClock();
  startAlarmWatcher();
  setMode('object', { keepAudio: true });
  window.unlockAudioFromGesture = unlockAudioFromGesture;
  window.startBedsideSound = startBedsideSound;
  window.startObjectSound = startObjectSound;
  window.startWakeSequence = startWakeSequence;
  window.stopSoundExplicit = stopSoundExplicit;
  window.getAudioDiagnostics = getAudioDiagnostics;
  window.computeConstellationGeometry = computeConstellationGeometry;
  window.wakeSetState = wakeSetState;
  window.worldSelectionState = worldSelectionState;
  window.setWorldByStep = setWorldByStep;
  window.WAKE_CURVE = WAKE_CURVE;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
