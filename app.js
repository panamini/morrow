'use strict';

const APP_SCHEMA_VERSION = 8;
const STORAGE_KEY = 'dawnChamberV4State';
const MASTER_GAIN_CEILING = 0.72;
const GRID_GEOMETRY_HARD_RULE = 'If the constellation cannot fit, shrink the orbit';
const POINTER_MOVE_THRESHOLD = 8;
const WORLD_LABEL_HIDE_SAFE_MIN = 540;

const BED_DURATION_OPTIONS = [
  { id: '10m', label: '10', ms: 10 * 60 * 1000 },
  { id: '15m', label: '15', ms: 15 * 60 * 1000 },
  { id: '30m', label: '30', ms: 30 * 60 * 1000 },
  { id: '1h', label: '1h', ms: 60 * 60 * 1000 },
  { id: 'night', label: 'night', ms: null }
];

const SOUND_MODES = [
  { id: 'still-water', name: 'Still Water', baseFrequency: 132, partialRatios: [1, 1.125, 1.333, 1.5, 1.875, 2.25], bowlDensity: 0.22, shimmerProbability: 0.10, nightSafeCutoff: 720, binaural: { allowed: true, deltaHz: 2 }, ritualLabel: 'quiet water reference' },
  { id: 'limestone-harmonic', name: 'Limestone Harmonic', baseFrequency: 138, partialRatios: [1, 1.47, 2.08, 2.72, 3.86, 5.03], bowlDensity: 0.34, shimmerProbability: 0.20, nightSafeCutoff: 900, binaural: { allowed: true, deltaHz: 2 }, ritualLabel: 'symbolic resonance, musical reference' },
  { id: 'night-temple', name: 'Night Temple', baseFrequency: 146, partialRatios: [1, 1.2, 1.5, 1.875, 2.25, 2.625], bowlDensity: 0.28, shimmerProbability: 0.16, nightSafeCutoff: 680, binaural: { allowed: true, deltaHz: 2 }, ritualLabel: 'night ritual label, not health care' },
  { id: 'glass-orbit', name: 'Glass Orbit', baseFrequency: 247, partialRatios: [1, 1.25, 1.414, 1.6, 1.875, 2.25], bowlDensity: 0.40, shimmerProbability: 0.42, nightSafeCutoff: 1180, binaural: { allowed: true, deltaHz: 3 }, ritualLabel: 'bright musical orbit' },
  { id: 'deep-return', name: 'Deep Return', baseFrequency: 110, partialRatios: [1, 1.25, 1.5, 2, 2.5, 3], bowlDensity: 0.18, shimmerProbability: 0.08, nightSafeCutoff: 520, binaural: { allowed: true, deltaHz: 1.5 }, ritualLabel: 'low musical anchor' },
  { id: 'ember-human', name: 'Ember Human', baseFrequency: 216, partialRatios: [1, 1.125, 1.25, 1.5, 1.75, 2], bowlDensity: 0.30, shimmerProbability: 0.18, nightSafeCutoff: 860, binaural: { allowed: true, deltaHz: 2 }, ritualLabel: 'warm musical reference' },
  { id: 'near-silent', name: 'Near Silent', baseFrequency: 98, partialRatios: [1, 1.5, 2, 3], bowlDensity: 0.08, shimmerProbability: 0.02, nightSafeCutoff: 380, binaural: { allowed: false, deltaHz: 0 }, ritualLabel: 'nearly silent preference' }
];

const WORLDS = [
  { id: 'milk-blue', name: 'Milk Blue', mood: 'cyan membrane, cobalt depth, quiet wall', soundMode: 'night-temple', palettes: { object: { wall: '#141d30', spill: '#0937ce', outer: '#5ff0c7', inner: '#79f0dd', core: '#244d9a', core2: '#43a7c2', shadow: '#02030a' }, bedside: { wall: '#020710', spill: '#061f4a', outer: '#2aa982', inner: '#3b7b8f', core: '#081120', core2: '#102439', shadow: '#000204' }, wake: { wall: '#7f563c', spill: '#c7efe2', outer: '#d7fff0', inner: '#a9ffd9', core: '#4a6475', core2: '#81c4c0', shadow: '#1b120d' } } },
  { id: 'ember-mouth', name: 'Ember Mouth', mood: 'red field, violet center, warm return', soundMode: 'ember-human', palettes: { object: { wall: '#210205', spill: '#6b0c17', outer: '#ff2c61', inner: '#ff5269', core: '#45165f', core2: '#bd1c3a', shadow: '#050003' }, bedside: { wall: '#080203', spill: '#2c0710', outer: '#973b34', inner: '#79293f', core: '#1d0b25', core2: '#32101b', shadow: '#010000' }, wake: { wall: '#5b1d12', spill: '#fd7252', outer: '#ff9b63', inner: '#f65342', core: '#50364b', core2: '#cf4e35', shadow: '#160603' } } },
  { id: 'violet-arc', name: 'Violet Arc', mood: 'black aperture, violet edge, moving hush', soundMode: 'deep-return', palettes: { object: { wall: '#010106', spill: '#1b0d42', outer: '#896dff', inner: '#4629b4', core: '#020205', core2: '#0b0b16', shadow: '#000000' }, bedside: { wall: '#000000', spill: '#08031a', outer: '#33236a', inner: '#24155c', core: '#000000', core2: '#050509', shadow: '#000000' }, wake: { wall: '#08070f', spill: '#321271', outer: '#b9a0ff', inner: '#6757f5', core: '#090913', core2: '#1a1742', shadow: '#000000' } } },
  { id: 'sakura-depth', name: 'Sakura Depth', mood: 'rose bloom, dark center, gridded softness', soundMode: 'limestone-harmonic', palettes: { object: { wall: '#ead7dd', spill: '#ff8bc7', outer: '#ffd2f0', inner: '#ff0f72', core: '#3b0628', core2: '#b50747', shadow: '#210215' }, bedside: { wall: '#150a10', spill: '#4b1231', outer: '#8b2a66', inner: '#a01f54', core: '#140412', core2: '#360619', shadow: '#020001' }, wake: { wall: '#f1e6ea', spill: '#ffb3da', outer: '#ffe2f3', inner: '#ff4d9a', core: '#6f174d', core2: '#fb1d79', shadow: '#321222' } } },
  { id: 'mineral-green', name: 'Mineral Green', mood: 'green rim, blue interior, earthen room', soundMode: 'still-water', palettes: { object: { wall: '#30351a', spill: '#6a7427', outer: '#dbff36', inner: '#82e872', core: '#065ee9', core2: '#233d7c', shadow: '#0a0d04' }, bedside: { wall: '#071005', spill: '#1e2d10', outer: '#557e2c', inner: '#3c7851', core: '#021d2f', core2: '#0e263c', shadow: '#000201' }, wake: { wall: '#4e4f32', spill: '#a4ac54', outer: '#edff4b', inner: '#a7ee5d', core: '#056bff', core2: '#315a9a', shadow: '#171909' } } },
  { id: 'paper-sun', name: 'Paper Sun', mood: 'print-like warmth, red yellow diffusion', soundMode: 'glass-orbit', palettes: { object: { wall: '#f2eee6', spill: '#ffe36e', outer: '#fff5cf', inner: '#ffb44a', core: '#39150d', core2: '#e20d18', shadow: '#1a0804' }, bedside: { wall: '#1a150e', spill: '#4a2b0b', outer: '#8d5725', inner: '#9b3a28', core: '#120704', core2: '#3b160b', shadow: '#020100' }, wake: { wall: '#f2eee6', spill: '#ffe78d', outer: '#fff8d8', inner: '#ffcf55', core: '#5a1b10', core2: '#ee2d1b', shadow: '#2a0a04' } } },
  { id: 'focus-white', name: 'Focus White', mood: 'paper edge, dark eye, silent center', soundMode: 'near-silent', palettes: { object: { wall: '#ececea', spill: '#ffffff', outer: '#f8f8f4', inner: '#9a9a96', core: '#050505', core2: '#303030', shadow: '#000000' }, bedside: { wall: '#d8d8d4', spill: '#f0f0ec', outer: '#e7e7e2', inner: '#7b7b78', core: '#000000', core2: '#202020', shadow: '#000000' }, wake: { wall: '#f6f6f2', spill: '#ffffff', outer: '#ffffff', inner: '#bfbfba', core: '#0a0a0a', core2: '#444440', shadow: '#000000' } } }
];

const WAKE_CURVE = [
  { atMinute: 0, name: 'firstLight', masterGainTarget: 0.18 },
  { atMinute: 3, name: 'bodyReturns', masterGainTarget: 0.24 },
  { atMinute: 6, name: 'gentleResonance', masterGainTarget: 0.34 },
  { atMinute: 9, name: 'clearWake', masterGainTarget: 0.45 },
  { atMinute: 12, name: 'morningPresence', masterGainTarget: 0.56 },
  { atMinute: 27, name: 'persistentMorning', masterGainTarget: 0.66 }
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
      objectVolume: 0.82,
      bedsideVolume: 0.62,
      wakeVolume: 0.86,
      airVolume: 0.55,
      strikeVolume: 0.72,
      shimmerAmount: 0.34,
      limiterCeiling: 0.72,
      binauralEnabled: true,
      binauralDeltaHz: 2,
      soundMode: 'night-temple'
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
let gridOverlayEnabled = false;
let sensoryPointer = null;
let durationPointer = null;
let wakePointer = null;
let wakeWorldPointer = null;
let wakeSettleTimer = null;
let worldPointer = null;
let worldLongHoldTimer = null;
let wheelWorldThrottleAt = 0;
let apertureTapToggleArmed = false;

const wakeSetState = {
  wakeStep: 'time',
  editingPart: 'hour',
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
function getWorld(id = state.selectedWorldId) { return WORLDS.find((world) => world.id === id) || WORLDS[0]; }
function getSoundMode(id = state.settings.audio.soundMode) { return SOUND_MODES.find((mode) => mode.id === id) || SOUND_MODES[2]; }
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
  ['masterVolume', 'objectVolume', 'bedsideVolume', 'wakeVolume', 'airVolume', 'strikeVolume', 'shimmerAmount'].forEach((key) => {
    const value = Number(next.settings.audio[key]);
    next.settings.audio[key] = Number.isFinite(value) ? clamp(value, 0, 1) : DEFAULT_STATE.settings.audio[key];
  });
  next.settings.audio.limiterCeiling = clamp(Number(next.settings.audio.limiterCeiling) || MASTER_GAIN_CEILING, 0, MASTER_GAIN_CEILING);
  next.settings.audio.binauralDeltaHz = clamp(Number(next.settings.audio.binauralDeltaHz) || 2, 1, 4);
  if (!SOUND_MODES.some((mode) => mode.id === next.settings.audio.soundMode)) next.settings.audio.soundMode = 'night-temple';
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
    'settingsPanel', 'settingsBackdrop', 'settingsSheet', 'settingsCloseButton', 'soundModeSelect', 'binauralToggle', 'deltaReadout', 'deltaSlider', 'masterVolumeReadout', 'masterVolume', 'bedsideVolumeReadout', 'bedsideVolume', 'objectVolumeReadout', 'objectVolume', 'wakeVolumeReadout', 'wakeVolume', 'airVolumeReadout', 'airVolume', 'strikeVolumeReadout', 'strikeVolume', 'shimmerReadout', 'shimmerAmount', 'softTestButton', 'mediumTestButton', 'wakeTestButton', 'stopAudioButton', 'brightnessReadout', 'brightnessSlider', 'reduceMotionToggle', 'use24hToggle', 'openSafetyButton', 'openDiagnosticsButton', 'diagGridButton',
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
    const brightness = state.settings.visualBrightness;
    ctx.fillStyle = palette.wall;
    ctx.fillRect(0, 0, cssW, cssH);
    const cx = cssW / 2;
    const cy = mode === 'object' ? cssH * 0.49 : mode === 'bedside' ? cssH * 0.49 : cssH * 0.50;
    const minDim = Math.min(cssW, cssH);
    const radius = mode === 'worlds' ? minDim * 0.24 : mode === 'wakeSet' ? minDim * 0.36 : mode === 'bedside' ? minDim * 0.62 : minDim * 0.45;
    const breathe = 1 + Math.sin(time * 0.00035) * 0.010 + visualState.audioIntensity * 0.018;
    const r = radius * breathe;
    const driftX = Math.sin(time * 0.00013) * r * 0.045;
    const driftY = Math.cos(time * 0.00011) * r * 0.035;
    const bedDim = mode === 'bedside' ? 0.72 : 1;
    const glow = brightness * bedDim;

    fillCircle(cx, cy, r * 2.45, [
      [0, rgba(palette.spill, 0.030 * glow)],
      [0.38, rgba(palette.spill, 0.120 * glow)],
      [0.70, rgba(palette.outer, 0.050 * glow)],
      [1, rgba(palette.spill, 0)]
    ], 'screen');

    fillCircle(cx + driftX, cy + driftY, r * 1.72, [
      [0, rgba(palette.inner, 0.030 * glow)],
      [0.44, rgba(palette.outer, 0.085 * glow)],
      [0.78, rgba(palette.spill, 0.070 * glow)],
      [1, rgba(palette.spill, 0)]
    ], 'screen');

    fillCircle(cx, cy, r * 1.22, [
      [0, rgba(palette.core, 0.92 * brightness)],
      [0.30, rgba(palette.core2, 0.78 * brightness)],
      [0.56, rgba(palette.inner, 0.52 * glow)],
      [0.76, rgba(palette.outer, 0.34 * glow)],
      [0.91, rgba(palette.outer, 0.075 * glow)],
      [1, rgba(palette.outer, 0)]
    ]);

    fillCircle(cx - driftX * 0.55, cy - driftY * 0.55, r * 0.88, [
      [0, rgba(palette.shadow, 0.10)],
      [0.44, rgba(palette.core, 0.18 * brightness)],
      [1, rgba(palette.core, 0)]
    ], 'multiply');

    fillCircle(cx, cy, r * 1.82, [
      [0, rgba(palette.outer, 0)],
      [0.58, rgba(palette.outer, 0.026 * glow)],
      [0.82, rgba(palette.spill, 0.022 * glow)],
      [1, rgba(palette.outer, 0)]
    ], 'screen');

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
  function updateContextState() { audioState.audioContextState = ctx ? ctx.state : 'none'; return audioState.audioContextState; }
  function initContext() {
    if (ctx) return ctx;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) throw new Error('AudioContext is not available.');
    ctx = new AudioContextCtor();
    masterGain = ctx.createGain();
    modeGain = ctx.createGain();
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 18;
    compressor.ratio.value = 8;
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
    if (oldTimer) window.clearInterval(oldTimer);
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
    const modeVolume = modeName === 'bedside' ? audio.bedsideVolume : modeName === 'ringing' ? audio.wakeVolume : audio.objectVolume;
    const target = clamp(master * modeVolume * intensity, 0.0001, MASTER_GAIN_CEILING);
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setTargetAtTime(clamp(master, 0.0001, MASTER_GAIN_CEILING), ctx.currentTime, ramp);
    modeGain.gain.cancelScheduledValues(ctx.currentTime);
    modeGain.gain.setTargetAtTime(target, ctx.currentTime, ramp);
    audioState.masterGainValue = clamp(master, 0, MASTER_GAIN_CEILING);
    audioState.modeGainValue = target;
  }
  function scheduleStrike(modeName, world, soundMode, emphasis = 1) {
    if (!ctx || !modeGain) return;
    const ratio = soundMode.partialRatios[Math.floor(Math.random() * soundMode.partialRatios.length)] || 1;
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
    const peak = clamp((modeName === 'bedside' ? 0.070 : 0.115) * state.settings.audio.strikeVolume * emphasis, 0.001, 0.22);
    gain.gain.setTargetAtTime(peak, ctx.currentTime + 0.01, 0.06);
    gain.gain.setTargetAtTime(0.0001, ctx.currentTime + 0.18, 1.9 + Math.random() * 1.4);
    osc.connect(filter); filter.connect(gain); gain.connect(modeGain);
    osc.start(); osc.stop(ctx.currentTime + 5);
    transientOscillators.push(osc);
    audioState.activeNodes += 3;
    window.setTimeout(() => {
      transientOscillators = transientOscillators.filter((candidate) => candidate !== osc);
      audioState.activeNodes = Math.max(0, audioState.activeNodes - 3);
    }, 5200);
  }
  function startDrones(modeName, world, soundMode) {
    if (!ctx || !modeGain) return;
    const ratios = soundMode.partialRatios.slice(0, modeName === 'bedside' ? 3 : 4);
    ratios.forEach((ratio, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      osc.type = 'sine';
      osc.frequency.value = soundMode.baseFrequency * ratio * (0.5 + index * 0.02);
      gain.gain.value = (modeName === 'bedside' ? 0.030 : 0.045) / (index + 1);
      if (pan) {
        pan.pan.value = index % 2 === 0 ? -0.18 : 0.18;
        osc.connect(gain); gain.connect(pan); pan.connect(modeGain);
      } else {
        osc.connect(gain); gain.connect(modeGain);
      }
      osc.start();
      droneOscillators.push(osc);
      audioState.activeNodes += pan ? 3 : 2;
    });
    audioState.activeOscillators = droneOscillators.length;
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
      const soundMode = getSoundMode(world.soundMode || state.settings.audio.soundMode);
      audioState.currentWorldId = world.id;
      audioState.currentMode = modeName;
      audioState.currentSoundModeId = soundMode.id;
      audioState.binauralEnabled = Boolean(state.settings.audio.binauralEnabled && soundMode.binaural.allowed);
      audioState.deltaHz = state.settings.audio.binauralDeltaHz;
      const density = options.density || (modeName === 'bedside' ? soundMode.bowlDensity * 0.55 : soundMode.bowlDensity);
      const spacing = clamp(3800 - density * 2200, modeName === 'bedside' ? 2600 : 1200, 5200);
      window.setTimeout(() => {
        if (nextSessionId !== sessionId) return;
        setMasterTarget(modeName, options.intensity || 1, 0.30);
        startDrones(modeName, world, soundMode);
        window.setTimeout(() => {
          if (nextSessionId === sessionId) scheduleStrike(modeName, world, soundMode, modeName === 'ringing' ? 1.6 : 1);
        }, 70);
        if (eventTimer) window.clearInterval(eventTimer);
        eventTimer = window.setInterval(() => scheduleStrike(modeName, world, soundMode, modeName === 'ringing' ? 1.6 : 1), spacing);
        audioState.activeTimers = 1;
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
    return {
      audioPlaybackState: audioState.audioPlaybackState,
      userFacingAudioState: audioState.userFacingAudioState,
      audioContextState: audioState.audioContextState,
      currentMode: audioState.currentMode,
      activeWorld: audioState.currentWorldId || state.selectedWorldId,
      modeGain: Number(audioState.modeGainValue.toFixed(4)),
      masterGainTarget: Number(audioState.masterGainValue.toFixed(4)),
      compressorEnabled: audioState.compressorEnabled,
      activeNodes: audioState.activeNodes,
      activeOscillators: audioState.activeOscillators,
      activeTimers: audioState.activeTimers,
      lastAudioError: audioState.lastAudioError,
      lastAudioStopReason: audioState.lastAudioStopReason,
      currentAudioSessionId: audioState.currentAudioSessionId,
      limiterCeiling: MASTER_GAIN_CEILING
    };
  }
  return { unlockAudioFromGesture, playFromGesture, startModeFromGesture, startMode, stopExplicit, stopForDurationExpiry, stopForWakeDismiss, crossfadeToWorld, getAudioDiagnostics, setMasterTarget };
}

function unlockAudioFromGesture(event) { return ensureAudioEngine().unlockAudioFromGesture(event); }
function playSoundFromGesture(event, modeName, options = {}) { return ensureAudioEngine().playFromGesture(event, modeName, options); }
function startSoundFromGesture(event, modeName, options = {}) { return ensureAudioEngine().startModeFromGesture(event, modeName, options); }
function playWakeSoundFromGesture(event) { return startSoundFromGesture(event, 'ringing', { worldId: state.wakeWorldId || state.selectedWorldId, intensity: 1 }); }
function playCurrentSoundFromGesture(event) {
  if (state.currentMode === 'bedside') return startSoundFromGesture(event, 'bedside');
  if (state.currentMode === 'wakeSet' || state.currentMode === 'ringing') return playWakeSoundFromGesture(event);
  return startSoundFromGesture(event, 'object', { worldId: state.selectedWorldId, intensity: 1 });
}
function stopSoundExplicit() { const result = ensureAudioEngine().stopExplicit(); updateSoundControls(); return result; }
function startBedsideSound() { return ensureAudioEngine().startMode('bedside', { intensity: 0.72 }); }
function startObjectSound() { return ensureAudioEngine().startMode('object', { intensity: 1 }); }
function startWakeSequence() { return ensureAudioEngine().startMode('ringing', { intensity: 1 }); }
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
    const visualWorldId = mode === 'wakeSet' ? (state.wakeWorldId || state.selectedWorldId) : state.selectedWorldId;
    if (mode !== 'worlds') renderer.setWorld(visualWorldId);
    setActiveVisualWorld(visualWorldId);
  }
  if (mode === 'bedside') { revealBedsideControls(); startBedsideSessionTimer(); } else { document.body.classList.remove('bedside-idle'); clearBedsideIdleTimer(); clearBedsideSessionTimer(); }
  if (mode === 'wakeSet') { wakeSetState.wakeStep = 'time'; syncWakeStateFromAlarm(); setActiveSetter('hour'); markWakeInteraction(); }
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
function checkAlarmTick() {
  if (!state.alarm.enabled || state.currentMode === 'ringing') return;
  const now = new Date();
  const current = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${current}`;
  if (current === state.alarm.time && state.alarm.lastTriggeredKey !== key) {
    state.alarm.lastTriggeredKey = key;
    saveState();
    setMode('ringing', { keepAudio: true });
    showToast('Tap once for sound.', 1600);
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
  showToast(next.id === 'night' ? 'All night' : `${next.label} min`, 900);
  startBedsideSessionTimer();
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
  const rect = ring.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const angle = Math.atan2(event.clientY - cy, event.clientX - cx) + Math.PI / 2;
  return modulo(Math.round((angle / (Math.PI * 2)) * total), total);
}
function wakeRingDistanceModel(event) {
  const rect = dom.wakeGestureArea.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const distance = Math.hypot(event.clientX - cx, event.clientY - cy);
  const hourRadius = dom.hourRing.getBoundingClientRect().width * 0.48;
  const minuteRadius = dom.minuteRing.getBoundingClientRect().width * 0.48;
  const hourBand = Math.max(28, hourRadius * 0.18);
  const minuteBand = Math.max(26, minuteRadius * 0.13);
  const deadZone = Math.max(22, Math.abs(minuteRadius - hourRadius) * 0.18);
  if (Math.abs(distance - hourRadius) <= hourBand && Math.abs(distance - minuteRadius) > deadZone) return 'hour';
  if (Math.abs(distance - minuteRadius) <= minuteBand) return 'minute';
  return null;
}
function syncWakeStateFromAlarm() { const parsed = parseTime(state.alarm.time); wakeSetState.candidateHour = parsed.hour; wakeSetState.candidateMinute = parsed.minute; wakeSetState.committedTime = state.alarm.time; }
function setActiveSetter(part) {
  wakeSetState.editingPart = part;
  if (dom.wakeHour) dom.wakeHour.classList.toggle('is-selected', part === 'hour');
  if (dom.wakeMinute) dom.wakeMinute.classList.toggle('is-selected', part === 'minute');
  if (dom.wakeGestureArea) dom.wakeGestureArea.dataset.activeRing = part;
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
  const hour12 = ringValueFromPointer(event, dom.hourRing, 12);
  parsed.hour = parsed.hour >= 12 ? hour12 + 12 : hour12;
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
  window.clearTimeout(wakeSettleTimer);
  wakeSettleTimer = window.setTimeout(() => { if (dom.wakeSetPanel) dom.wakeSetPanel.classList.add('is-idle'); }, 1800);
}

function confirmWakeSet() {
  saveState();
  showToast(`Wake ${state.alarm.time}`, 1100);
  setMode('object', { keepAudio: true });
}

function applyWorld(world) {
  if (!world) return null;
  state.selectedWorldId = world.id;
  state.settings.audio.soundMode = world.soundMode || state.settings.audio.soundMode;
  worldSelectionState.activeWorld = world.id;
  worldSelectionState.selectedWorld = world.id;
  worldSelectionState.focusedWorld = world.id;
  worldSelectionState.stagedWorld = null;
  saveState();
  setActiveVisualWorld(world.id);
  if (renderer) renderer.setWorld(world.id);
  if (audioState.userFacingAudioState === 'PLAYING') ensureAudioEngine().crossfadeToWorld(world);
  syncSettingsControls(false);
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
  if (state.currentMode === 'wakeSet' && audioState.userFacingAudioState === 'PLAYING' && audioState.currentMode === 'ringing') {
    ensureAudioEngine().startMode('ringing', { worldId: next.id, intensity: 1 });
  }
  updateClocks();
  showToast(`Wake ${next.name}`, 1000);
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
  setMode('wakeSet', { keepAudio: true });
  playWakeSoundFromGesture(event);
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
  const selected = getWorld(worldSelectionState.selectedWorld || state.selectedWorldId);
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
  [dom.railBed, dom.railWake, dom.railWorld].forEach((button) => button && button.classList.remove('is-active', 'is-far'));
  const active = state.currentMode === 'wakeSet' ? dom.railWake : state.currentMode === 'worlds' ? dom.railWorld : dom.railBed;
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
    revealObjectHint();
  }
  sensoryPointer = null;
  apertureTapToggleArmed = false;
}
function revealObjectHint() { dom.objectRail.classList.add('show-labels'); window.setTimeout(() => dom.objectRail.classList.remove('show-labels'), 1400); }

function populateSoundModes() {
  dom.soundModeSelect.textContent = '';
  SOUND_MODES.forEach((mode) => {
    const option = document.createElement('option'); option.value = mode.id; option.textContent = mode.name; dom.soundModeSelect.appendChild(option);
  });
}
function syncSettingsControls(save = false) {
  const audio = state.settings.audio;
  dom.soundModeSelect.value = audio.soundMode;
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
      modeGain: diagnostics.modeGain,
      masterGainTarget: diagnostics.masterGainTarget,
      compressorEnabled: diagnostics.compressorEnabled,
      activeNodes: diagnostics.activeNodes,
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
  dom.railWake.addEventListener('pointerdown', (event) => { event.preventDefault(); enterWakeFromGesture(event); });
  dom.railWorld.addEventListener('pointerdown', (event) => { event.preventDefault(); enterWorldFromGesture(event); });
  dom.railSet.addEventListener('click', () => setMode('settings', { keepAudio: true }));
  dom.soundToggleButton.addEventListener('pointerdown', (event) => { event.preventDefault(); handleGlobalSoundToggle(event); });

  if (dom.bedsideDurationButton) dom.bedsideDurationButton.addEventListener('click', () => { focusDurationControl(); revealBedsideControls(); });
  dom.bedsideExitButton.addEventListener('click', () => setMode('object', { keepAudio: true }));
  dom.durationRow.addEventListener('pointerdown', (event) => { durationPointer = { x: event.clientX, y: event.clientY, at: nowMs() }; dom.durationRow.classList.add('is-focused'); revealBedsideControls(); });
  dom.durationRow.addEventListener('pointerup', (event) => {
    if (!durationPointer) return;
    const direct = event.target.closest && event.target.closest('[data-duration]');
    const dx = event.clientX - durationPointer.x;
    if (direct && nowMs() - durationPointer.at < 520 && Math.abs(dx) < 20) state.bedsideDuration = direct.dataset.duration;
    else if (Math.abs(dx) > 22) changeBedsideDuration(dx < 0 ? 1 : -1);
    saveState(); updateDurationRow(); revealBedsideControls(); window.setTimeout(() => dom.durationRow && dom.durationRow.classList.remove('is-focused'), 1800); durationPointer = null;
  });

  dom.wakeCloseButton.addEventListener('click', () => setMode('object', { keepAudio: true }));
  dom.wakeRailClose.addEventListener('click', () => setMode('object', { keepAudio: true }));
  dom.wakeSetConfirmButton.addEventListener('click', confirmWakeSet);
  dom.wakeHour.addEventListener('click', () => setActiveSetter('hour'));
  dom.wakeMinute.addEventListener('click', () => setActiveSetter('minute'));
  [dom.wakeHour, dom.wakeMinute].forEach((zone) => {
    zone.addEventListener('pointerdown', (event) => { wakePointer = { x: event.clientX, y: event.clientY, at: nowMs(), part: zone.id === 'wakeHour' ? 'hour' : 'minute' }; setActiveSetter(wakePointer.part); zone.setPointerCapture(event.pointerId); });
    zone.addEventListener('pointerup', (event) => {
      if (!wakePointer) return;
      const dx = event.clientX - wakePointer.x; const dy = event.clientY - wakePointer.y; const speed = Math.hypot(dx, dy) / Math.max(1, nowMs() - wakePointer.at);
      if (Math.abs(dx) > 58 && Math.abs(dx) > Math.abs(dy) * 1.25) setActiveSetter(wakeSetState.editingPart === 'hour' ? 'minute' : 'hour');
      if (Math.abs(dy) > 30 && Math.abs(dy) > Math.abs(dx)) { const stepBase = wakePointer.part === 'minute' ? (speed > 0.9 ? 5 : 1) : (speed > 0.9 ? 3 : 1); changeWakeTime(wakePointer.part, dy < 0 ? stepBase : -stepBase); }
      wakePointer = null;
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
  dom.soundModeSelect.addEventListener('change', () => { state.settings.audio.soundMode = dom.soundModeSelect.value; saveState(); });
  dom.binauralToggle.addEventListener('change', () => { state.settings.audio.binauralEnabled = dom.binauralToggle.checked; saveState(); });
  dom.deltaSlider.addEventListener('input', () => { state.settings.audio.binauralDeltaHz = Number(dom.deltaSlider.value); syncSettingsControls(true); });
  dom.brightnessSlider.addEventListener('input', () => { state.settings.visualBrightness = Number(dom.brightnessSlider.value); syncSettingsControls(true); });
  dom.reduceMotionToggle.addEventListener('change', () => { state.settings.reduceMotion = dom.reduceMotionToggle.checked; saveState(); });
  dom.use24hToggle.addEventListener('change', () => { state.settings.use24h = dom.use24hToggle.checked; saveState(); updateClocks(); });
  dom.softTestButton.addEventListener('pointerdown', (event) => playSoundFromGesture(event, 'object'));
  dom.mediumTestButton.addEventListener('pointerdown', (event) => playSoundFromGesture(event, 'object'));
  dom.wakeTestButton.addEventListener('pointerdown', (event) => { playSoundFromGesture(event, 'ringing'); });
  dom.stopAudioButton.addEventListener('click', stopSoundExplicit);
  dom.diagToneButton.addEventListener('pointerdown', (event) => playSoundFromGesture(event, 'object'));
  dom.diagPlayButton.addEventListener('pointerdown', (event) => playSoundFromGesture(event, 'object'));
  dom.diagBedsideButton.addEventListener('pointerdown', (event) => { setMode('bedside', { keepAudio: true }); playSoundFromGesture(event, 'bedside'); });
  dom.diagWakeButton.addEventListener('pointerdown', (event) => playSoundFromGesture(event, 'ringing'));
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
