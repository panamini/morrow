#!/usr/bin/env node
'use strict';

/**
 * Morrow / Dawn Chamber full balancing patch.
 * Run from repo root:
 *   node morrow_golden_dawn_full_patch.cjs
 * Then inspect:
 *   git diff -- app.js
 *   node --check app.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = path.join(process.cwd(), 'app.js');
if (!fs.existsSync(target)) {
  console.error('app.js not found. Run this from the panamini/morrow repo root.');
  process.exit(1);
}

let src = fs.readFileSync(target, 'utf8');
const original = src;

function fail(message) {
  console.error(`\nPatch failed: ${message}`);
  process.exit(1);
}

function replaceOnce(label, search, replacement) {
  const before = src;
  if (typeof search === 'string') {
    if (!src.includes(search)) fail(`${label}: search string not found`);
    src = src.replace(search, replacement);
  } else {
    if (!search.test(src)) fail(`${label}: regex not found`);
    src = src.replace(search, replacement);
  }
  if (src === before) fail(`${label}: replacement produced no change`);
}

function insertBefore(label, marker, addition) {
  if (!src.includes(marker)) fail(`${label}: marker not found`);
  src = src.replace(marker, `${addition}${marker}`);
}

function insertAfter(label, marker, addition) {
  if (!src.includes(marker)) fail(`${label}: marker not found`);
  src = src.replace(marker, `${marker}${addition}`);
}

// 1) Dev grouping constants for settings dropdown.
insertAfter('sound mode grouping constants',
`const BED_SESSION_OPTIONS = [
  { id: 'infinite', label: '∞', type: 'track', ms: null },
  { id: '10m', label: '10', type: 'track', ms: 10 * 60 * 1000 },
  { id: '30m', label: '30', type: 'track', ms: 30 * 60 * 1000 },
  { id: '1h', label: '1h', type: 'track', ms: 60 * 60 * 1000 },
  { id: 'night-passage', label: 'night', type: 'program', programId: 'night-passage' }
];
`,
`
const WORLD_NATIVE_SOUND_MODE_IDS = [
  'blue-bowl',
  'night-nest',
  'phi-dawn-chorale',
  'human-return',
  'space-field',
  'afternoon-glass',
  'neroli-thread',
  'paper-sun-morning',
  'ember-afterglow'
];
const LEGACY_SOUND_MODE_IDS = [
  'still-water',
  'limestone-harmonic',
  'night-temple',
  'glass-orbit',
  'deep-return',
  'ember-human',
  'near-silent'
];
`);

// 2) Blue Lullaby: keep subtlety but reduce excessive dead gaps.
replaceOnce('Blue Lullaby bedside sequence',
`        bedside: [55000, 89000, 34000, 55000, 144000],`,
`        bedside: [55000, 76000, 34000, 55000, 89000],`);
replaceOnce('Blue Lullaby bedside rest probability',
`      restProbability: {
        bedside: 0.72,
        object: 0.24,
        ringing: 0.18
      },`,
`      restProbability: {
        bedside: 0.64,
        object: 0.24,
        ringing: 0.18
      },`);

// 3) Human Return: add a restrained breathing envelope.
insertBefore('Human Return spaceEnvelope',
`      orderedPhraseCells: [
        [1.498],
        [1.682, 1.498],`,
`      spaceEnvelope: {
        enabled: true,
        gain: 0.018,
        bedsideGain: 0.012,
        voiceRatios: [
          1,
          1.189,
          1.498,
          1.682,
          2,
          2.245
        ],
        maxVoices: 5,
        attackSeconds: [24, 64],
        releaseSeconds: [70, 190],
        cyclesSeconds: [55, 89, 144, 233],
        panDrift: 0.10,
        detuneCents: 2.8,
        lowpassHz: [240, 460],
        highpassHz: 32
      },
`);

// 4) Neroli Thread: add a very restrained thread envelope.
insertBefore('Neroli Thread spaceEnvelope',
`      phraseCells: [
        [2.127],
        [1.789],`,
`      spaceEnvelope: {
        enabled: true,
        gain: 0.012,
        bedsideGain: 0.007,
        voiceRatios: [
          0.5,
          1.194,
          1.789,
          2.127,
          2.397
        ],
        maxVoices: 4,
        attackSeconds: [18, 48],
        releaseSeconds: [40, 110],
        cyclesSeconds: [34, 55, 89, 144],
        panDrift: 0.18,
        detuneCents: 2.2,
        lowpassHz: [300, 620],
        highpassHz: 58
      },
`);

// 5) Rename Phi Dawn display to Golden Dawn and add a wake-bloom envelope.
replaceOnce('Golden Dawn track name', `    name: 'Phi Dawn Chorale',`, `    name: 'Golden Dawn Chorale',`);
replaceOnce('Golden Dawn track description',
`    description: 'Peaceful melodic alarm: C Lydian 6/9, Fibonacci pacing, soft C5 presence, no harsh beeps.',`,
`    description: 'Peaceful melodic alarm: C Lydian 6/9, gradual dawn pacing, soft C5 presence, no harsh beeps.',`);
replaceOnce('Golden Dawn ritual label',
`    ritualLabel: 'C Lydian wake chorale tuned from A=432',`,
`    ritualLabel: 'Golden Dawn wake chorale tuned from A=432',`);
insertBefore('Golden Dawn spaceEnvelope',
`      wakeRatioCeilings: [
        { atMinute: 0, maxRatio: 2.245 },`,
`      spaceEnvelope: {
        enabled: true,
        gain: 0.022,
        bedsideGain: 0.012,
        voiceRatios: [
          1,
          1.498,
          1.682,
          2,
          2.245,
          2.520,
          2.997
        ],
        maxVoices: 6,
        attackSeconds: [18, 50],
        releaseSeconds: [50, 150],
        cyclesSeconds: [34, 55, 89, 144, 233],
        panDrift: 0.14,
        detuneCents: 2.4,
        lowpassHz: [360, 760],
        highpassHz: 44
      },
`);

// 6) Add final world-native Paper Sun and Ember Mouth modes before Night Nest.
const PAPER_AND_EMBER_MODES = String.raw`  {
    id: 'paper-sun-morning',
    name: 'Paper Sun Morning',
    referenceHz: 'F / suspended morning field',
    description: 'Warm paper-light morning field: soft suspended thirds and sixths, calm but awake, not an alarm.',
    baseFrequency: Number(equalTemperamentHzFromMidi(41).toFixed(2)), // F2 at A432
    partialRatios: [
      0.5,
      1,
      1.122,
      1.260,
      1.335,
      1.498,
      1.682,
      2,
      2.245,
      2.520,
      2.670,
      2.997,
      3.364,
      4
    ],
    droneRatios: [
      1,
      1.335,
      1.498,
      2
    ],
    strikeGrammar: [
      { ratio: 1.335, weight: 10 },
      { ratio: 1.498, weight: 9 },
      { ratio: 1.682, weight: 6 },
      { ratio: 2, weight: 5 },
      { ratio: 1.260, weight: 4 },
      { ratio: 2.245, weight: 3.2 },
      { ratio: 2.520, weight: 2.0 },
      { ratio: 1.122, weight: 1.4 },
      { ratio: 2.997, weight: 0.7 },
      { ratio: 3.364, weight: 0.22 },
      { ratio: 4, weight: 0.10 },
      { ratio: 0.5, weight: 0.18 }
    ],
    bowlDensity: 0.026,
    shimmerProbability: 0.001,
    nightSafeCutoff: 560,
    binaural: { allowed: false, deltaHz: 2 },
    ritualLabel: 'Paper morning field tuned from A=432',
    engineV2: {
      style: 'day-reset',
      phraseGapsMs: {
        bedside: [42000, 110000],
        object: [12000, 42000],
        ringing: [9000, 32000]
      },
      phraseGapSequenceMs: {
        bedside: [55000, 89000, 42000, 76000, 110000],
        object: [13000, 21000, 34000, 21000, 55000],
        ringing: [9000, 13000, 21000, 13000, 32000]
      },
      restProbability: {
        bedside: 0.68,
        object: 0.24,
        ringing: 0.18
      },
      maxEventsPerPhrase: {
        bedside: 1,
        object: 2,
        ringing: 2
      },
      attackSeconds: [3.2, 10.5],
      releaseSeconds: [22, 72],
      gainScale: 0.50,
      foregroundGainScale: 0.68,
      repeatMemory: 8,
      droneVoiceLimit: 4,
      spaceEnvelope: {
        enabled: true,
        gain: 0.026,
        bedsideGain: 0.014,
        voiceRatios: [
          1,
          1.260,
          1.335,
          1.498,
          1.682,
          2,
          2.245,
          2.520
        ],
        maxVoices: 6,
        attackSeconds: [18, 46],
        releaseSeconds: [55, 150],
        cyclesSeconds: [34, 55, 89, 144, 233],
        panDrift: 0.14,
        detuneCents: 2.8,
        lowpassHz: [360, 780],
        highpassHz: 46
      },
      orderedPhraseCells: [
        [1.335],
        [1.498, 1.335],
        [1.260, 1.498],
        [1.682, 2],
        [2.245, 2],
        [2.520, 2.245],
        [1.122, 1.335],
        [1.498, 1]
      ],
      phraseCells: [
        [1.335],
        [1.498, 1.335],
        [1.260, 1.498],
        [1.682, 2],
        [2.245, 2],
        [2.520, 2.245],
        [1.122, 1.335],
        [1.498, 1],
        [1.335, 1.682, 2],
        [1]
      ]
    }
  },
  {
    id: 'ember-afterglow',
    name: 'Ember Afterglow',
    referenceHz: 'C / warm after-sunset field',
    description: 'Warm after-sunset field: close low-mid motion, ember breath, calm body return without bright glass.',
    baseFrequency: Number(equalTemperamentHzFromMidi(36).toFixed(2)), // C2 at A432
    partialRatios: [
      0.5,
      1,
      1.189,
      1.260,
      1.335,
      1.498,
      1.682,
      1.782,
      2,
      2.378,
      2.520,
      2.670,
      2.997,
      3.364
    ],
    droneRatios: [
      1,
      1.335,
      1.498,
      2
    ],
    strikeGrammar: [
      { ratio: 1.498, weight: 10 },
      { ratio: 1.335, weight: 8 },
      { ratio: 1.682, weight: 6 },
      { ratio: 1.189, weight: 5 },
      { ratio: 2, weight: 4.5 },
      { ratio: 1.782, weight: 3.2 },
      { ratio: 2.378, weight: 2.0 },
      { ratio: 1.260, weight: 1.6 },
      { ratio: 2.670, weight: 0.8 },
      { ratio: 2.997, weight: 0.35 },
      { ratio: 3.364, weight: 0.12 },
      { ratio: 0.5, weight: 0.2 }
    ],
    bowlDensity: 0.020,
    shimmerProbability: 0.001,
    nightSafeCutoff: 520,
    binaural: { allowed: false, deltaHz: 2 },
    ritualLabel: 'Ember afterglow field tuned from A=432',
    engineV2: {
      style: 'human',
      phraseGapsMs: {
        bedside: [52000, 130000],
        object: [18000, 70000],
        ringing: [13000, 46000]
      },
      phraseGapSequenceMs: {
        bedside: [76000, 110000, 52000, 89000, 144000],
        object: [18000, 29000, 46000, 29000, 70000],
        ringing: [13000, 21000, 34000, 21000, 46000]
      },
      restProbability: {
        bedside: 0.72,
        object: 0.38,
        ringing: 0.24
      },
      maxEventsPerPhrase: {
        bedside: 1,
        object: 2,
        ringing: 2
      },
      attackSeconds: [5, 16],
      releaseSeconds: [32, 100],
      gainScale: 0.48,
      foregroundGainScale: 0.58,
      repeatMemory: 9,
      droneVoiceLimit: 4,
      spaceEnvelope: {
        enabled: true,
        gain: 0.024,
        bedsideGain: 0.016,
        voiceRatios: [
          0.5,
          1,
          1.189,
          1.335,
          1.498,
          1.682,
          2,
          2.378
        ],
        maxVoices: 6,
        attackSeconds: [24, 58],
        releaseSeconds: [70, 180],
        cyclesSeconds: [55, 89, 144, 233, 377],
        panDrift: 0.12,
        detuneCents: 3.2,
        lowpassHz: [220, 520],
        highpassHz: 30
      },
      orderedPhraseCells: [
        [1.498],
        [1.335, 1.189],
        [1.682, 1.498],
        [2, 1.498],
        [1.782, 1.682],
        [2.378, 2],
        [1.260, 1.335],
        [1]
      ],
      phraseCells: [
        [1.498],
        [1.335, 1.189],
        [1.682, 1.498],
        [2, 1.498],
        [1.782, 1.682],
        [2.378, 2],
        [1.260, 1.335],
        [1.498, 1],
        [1]
      ]
    }
  },
`;
insertBefore('new Paper Sun and Ember Mouth sound modes', `  {
    id: 'night-nest',`, PAPER_AND_EMBER_MODES);

// 7) World assignments and display rename.
replaceOnce('Ember Mouth final sound assignment',
`{ id: 'ember-mouth', name: 'Ember Mouth', mood: 'red field, violet center, warm return', soundMode: 'ember-human', visualScore: 'default',`,
`{ id: 'ember-mouth', name: 'Ember Mouth', mood: 'red field, violet center, warm return', soundMode: 'ember-afterglow', visualScore: 'ember-afterglow',`);
replaceOnce('Paper Sun final sound assignment',
`{ id: 'paper-sun', name: 'Paper Sun', mood: 'print-like warmth, red yellow diffusion', soundMode: 'glass-orbit', visualScore: 'default',`,
`{ id: 'paper-sun', name: 'Paper Sun', mood: 'print-like warmth, red yellow diffusion', soundMode: 'paper-sun-morning', visualScore: 'paper-sun',`);
replaceOnce('Golden Dawn world display name',
`{ id: 'phi-dawn', name: 'Phi Dawn', mood: 'golden dawn, soft chorale, peaceful return', soundMode: 'phi-dawn-chorale', visualScore: 'phi-dawn',`,
`{ id: 'phi-dawn', name: 'Golden Dawn', mood: 'golden dawn, soft chorale, peaceful return', soundMode: 'phi-dawn-chorale', visualScore: 'phi-dawn',`);
replaceOnce('Golden Dawn default wake', `  wakeWorldId: 'milk-blue',`, `  wakeWorldId: 'phi-dawn',`);

// 8) Visual profiles for finalized worlds.
insertBefore('Paper Sun and Ember Afterglow visual profiles',
`    if (score === 'phi-dawn') {
      return {`,
String.raw`    if (score === 'paper-sun') {
      return {
        breatheRate: 0.00018,
        breatheDepth: 0.0055,
        audioBreathe: 0.010,
        driftXRate: 0.000058,
        driftYRate: 0.000046,
        driftX: 0.026,
        driftY: 0.018,
        outerScale: 2.50,
        innerScale: 1.62,
        coreScale: 1.12,
        outerAlpha: 1.02,
        innerAlpha: 0.92,
        coreAlpha: 1.02,
        rimAlpha: 0.86,
        ceilingAlpha: 0.92,
        pulseGain: 0.05,
        eventWindowMs: 7000,
        eventAlpha: 0.10
      };
    }

    if (score === 'ember-afterglow') {
      return {
        breatheRate: 0.00011,
        breatheDepth: 0.0048,
        audioBreathe: 0.008,
        driftXRate: 0.000038,
        driftYRate: 0.000033,
        driftX: 0.020,
        driftY: 0.017,
        outerScale: 2.40,
        innerScale: 1.55,
        coreScale: 1.10,
        outerAlpha: 0.92,
        innerAlpha: 0.86,
        coreAlpha: 1.08,
        rimAlpha: 0.72,
        ceilingAlpha: 0.62,
        pulseGain: 0.04,
        eventWindowMs: 9000,
        eventAlpha: 0.08
      };
    }

`);

// 9) Track music memory for diagnostics.
replaceOnce('music memory diagnostics fields',
`  const musicMemory = {
    lastRatios: [],
    phraseIndex: 0,
    lastPhraseAt: 0,
    lastEventAt: 0
  };`,
`  const musicMemory = {
    lastRatios: [],
    phraseIndex: 0,
    lastPhraseAt: 0,
    lastEventAt: 0,
    lastSelectedCell: null,
    lastOrderedCell: null
  };`);
insertAfter('record ordered phrase cell',
`      const orderedCell = profile.orderedPhraseCells[musicMemory.phraseIndex % profile.orderedPhraseCells.length] || [1];`,
`
      musicMemory.lastOrderedCell = orderedCell.slice();`);
insertBefore('clear ordered phrase memory for non-ordered cells',
`    const candidates = profile.phraseCells
      .map((cell) => cell.filter(withinLimits))`,
`    musicMemory.lastOrderedCell = null;
`);
insertBefore('record final selected phrase cell',
`      const eventCount = Math.min(profile.maxEvents, cell.length);`,
`      musicMemory.lastSelectedCell = cell.slice();
`);

// 10) Lightweight true crossfade via per-session mode gain layers.
replaceOnce('fading layer state', `  let sessionId = 0;
  let currentWakePhase = WAKE_CURVE[0];`, `  let sessionId = 0;
  let fadingLayerCount = 0;
  let currentWakePhase = WAKE_CURVE[0];`);
insertAfter('create mode gain layer helper',
`  function updateContextState() { audioState.audioContextState = ctx ? ctx.state : 'none'; return audioState.audioContextState; }
`,
`  function createModeGainLayer(initialValue = 0.0001) {
    const gain = ctx.createGain();
    gain.gain.value = initialValue;
    gain.connect(compressor);
    return gain;
  }
`);
replaceOnce('initContext mode gain layer',
`    masterGain = ctx.createGain();
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
    compressor.connect(masterGain);`,
`    masterGain = ctx.createGain();
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.knee.value = 22;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.018;
    compressor.release.value = 0.28;
    masterGain.gain.value = 0.0001;
    compressor.connect(masterGain);
    modeGain = createModeGainLayer(0.0001);`);
replaceOnce('stopScheduledNodes layered crossfade',
/function stopScheduledNodes\(reason = 'explicit_stop', fade = 0\.22\) \{[\s\S]*?\n  \}\n  function setMasterTarget/,
String.raw`function stopScheduledNodes(reason = 'explicit_stop', fade = 0.22) {
    if (!ctx || !modeGain) return;
    const at = ctx.currentTime;
    const oldModeGain = modeGain;
    const oldOscillators = droneOscillators.slice();
    const oldTransientOscillators = transientOscillators.slice();
    const oldTimer = eventTimer;
    const oldActiveNodes = audioState.activeNodes;
    const fadeSeconds = Math.max(0.02, Number(fade) || 0.22);
    const isCrossfade = reason === 'mode_crossfade_internal';

    droneOscillators = [];
    transientOscillators = [];
    eventTimer = null;
    if (oldTimer) window.clearTimeout(oldTimer);

    oldModeGain.gain.cancelScheduledValues(at);
    oldModeGain.gain.setTargetAtTime(0.0001, at, fadeSeconds);
    if (isCrossfade) fadingLayerCount += 1;

    window.setTimeout(() => {
      oldOscillators.concat(oldTransientOscillators).forEach((osc) => { try { osc.stop(); } catch (error) { /* oscillator may already be stopped */ } });
      try { oldModeGain.disconnect(); } catch (error) { /* layer may already be disconnected */ }
      if (isCrossfade) {
        fadingLayerCount = Math.max(0, fadingLayerCount - 1);
        audioState.activeNodes = Math.max(0, audioState.activeNodes - oldActiveNodes);
        updateActiveOscillatorCount();
      } else {
        audioState.activeNodes = 0;
        audioState.activeOscillators = 0;
        audioState.activeTimers = 0;
      }
    }, Math.max(30, fadeSeconds * 1000 + 120));
    audioState.lastAudioStopReason = reason;
    if (!isCrossfade) {
      audioState.audioPlaybackState = 'stopped';
      audioState.userFacingAudioState = 'STOPPED';
      updateSoundControls();
    }
  }
  function setMasterTarget`);
replaceOnce('startMode new layer and crossfade duration',
`      stopScheduledNodes('mode_crossfade_internal', wasPlaying ? 0.06 : 0.02);`,
`      const crossfadeSeconds = wasPlaying ? clamp(Number(options.crossfadeSeconds) || 1.6, 0.12, 18) : 0.02;
      stopScheduledNodes('mode_crossfade_internal', crossfadeSeconds);
      modeGain = createModeGainLayer(0.0001);`);
replaceOnce('startMode fade-in target',
`        else setMasterTarget(modeName, options.intensity || 1, 0.30);`,
`        else setMasterTarget(modeName, options.intensity || 1, options.fadeInSeconds || 0.30);`);
replaceOnce('crossfadeToWorld duration',
`    startMode(audioState.currentMode || 'object', { worldId: world.id, intensity: 0.92 });`,
`    startMode(audioState.currentMode || 'object', { worldId: world.id, intensity: 0.92, crossfadeSeconds: 1.8, fadeInSeconds: 1.1 });`);
replaceOnce('program phase crossfade options',
`      intensity: programState.currentTargetGain
    });`,
`      intensity: programState.currentTargetGain,
      crossfadeSeconds: resolvedPhase.crossfadeSeconds || (resolvedPhase.id === 'wake' ? 3.2 : 12),
      fadeInSeconds: resolvedPhase.fadeInSeconds || (resolvedPhase.id === 'wake' ? 2.4 : 8)
    });`);
replaceOnce('wake sequence crossfade option',
`  return ensureAudioEngine().startMode('ringing', { worldId: state.wakeWorldId || state.selectedWorldId, intensity: 1 });`,
`  return ensureAudioEngine().startMode('ringing', { worldId: state.wakeWorldId || state.selectedWorldId || 'phi-dawn', intensity: 1, crossfadeSeconds: 2.4, fadeInSeconds: 1.6 });`);

// 11) Diagnostics.
insertAfter('getAudioDiagnostics extra fields',
`      phraseStyle: diagnosticsProfile.style,
`,
`      phraseIndex: musicMemory.phraseIndex,
      lastSelectedPhraseCell: musicMemory.lastSelectedCell,
      lastOrderedPhraseCell: musicMemory.lastOrderedCell,
      spaceEnvelopeEnabled: Boolean(diagnosticsProfile.spaceEnvelope?.enabled),
      sleepNoiseEnabled: Boolean(diagnosticsProfile.sleepNoise?.enabled),
      crossfadeActive: fadingLayerCount > 0,
      activeAudioLayerCount: 1 + fadingLayerCount,
`);
insertAfter('refreshDiagnostics payload extra fields',
`      engineStyle: diagnostics.engineStyle,
`,
`      phraseStyle: diagnostics.phraseStyle,
      phraseIndex: diagnostics.phraseIndex,
      lastSelectedPhraseCell: diagnostics.lastSelectedPhraseCell,
      lastOrderedPhraseCell: diagnostics.lastOrderedPhraseCell,
      spaceEnvelopeEnabled: diagnostics.spaceEnvelopeEnabled,
      sleepNoiseEnabled: diagnostics.sleepNoiseEnabled,
      crossfadeActive: diagnostics.crossfadeActive,
      activeAudioLayerCount: diagnostics.activeAudioLayerCount,
      activeProgramId: programState.activeProgramId,
      activeProgramPhaseId: programState.activePhaseId,
      activeProgramPhaseLabel: programState.activePhaseLabel,
      wakeTargetAt: programState.wakeTargetAt,
`);
insertAfter('getProgramDiagnostics labels',
`    activePhase: programState.activePhaseId,
`,
`    activePhaseLabel: programState.activePhaseLabel,
    wakeTargetAt: programState.wakeTargetAt,
`);

// 12) Settings dropdown grouping: world-native first, legacy as Lab.
replaceOnce('populateSoundModes grouped dropdown',
/function populateSoundModes\(\) \{[\s\S]*?\n\}/,
String.raw`function populateSoundModes() {
  if (!dom.soundModeSelect) return;
  dom.soundModeSelect.textContent = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = WORLD_DEFAULT_SOUND_MODE;
  defaultOption.textContent = 'Built-in world track';
  dom.soundModeSelect.appendChild(defaultOption);

  const appendGroup = (label, ids) => {
    const group = document.createElement('optgroup');
    group.label = label;
    ids
      .map((id) => getSoundMode(id))
      .filter((mode) => mode && mode.id)
      .forEach((mode) => {
        const option = document.createElement('option');
        option.value = mode.id;
        option.textContent = mode.name;
        group.appendChild(option);
      });
    if (group.children.length) dom.soundModeSelect.appendChild(group);
  };

  appendGroup('World-native tracks', WORLD_NATIVE_SOUND_MODE_IDS);
  appendGroup('Lab / legacy references', LEGACY_SOUND_MODE_IDS);
  const grouped = new Set([WORLD_DEFAULT_SOUND_MODE].concat(WORLD_NATIVE_SOUND_MODE_IDS, LEGACY_SOUND_MODE_IDS));
  const remaining = SOUND_MODES.filter((mode) => !grouped.has(mode.id));
  if (remaining.length) {
    const group = document.createElement('optgroup');
    group.label = 'Other';
    remaining.forEach((mode) => {
      const option = document.createElement('option');
      option.value = mode.id;
      option.textContent = mode.name;
      group.appendChild(option);
    });
    dom.soundModeSelect.appendChild(group);
  }
}`);
replaceOnce('sync settings control repopulates new grouped options',
`  if (dom.soundModeSelect && !dom.soundModeSelect.querySelector('option[value="afternoon-glass"]')) populateSoundModes();`,
`  if (dom.soundModeSelect && !dom.soundModeSelect.querySelector('option[value="paper-sun-morning"]')) populateSoundModes();`);

if (src === original) fail('no changes produced');
fs.writeFileSync(target, src);

try {
  execSync('node --check app.js', { stdio: 'inherit' });
  console.log('\nPatch applied. node --check app.js passed.');
} catch (error) {
  console.error('\nPatch applied, but node --check app.js failed. Inspect app.js before committing.');
  process.exit(error.status || 1);
}
