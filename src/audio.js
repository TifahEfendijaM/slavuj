// Sound is synthesised here, except a few animal and crowd recordings (assets/audio/sfx, CC0, see CREDITS.md)
// and word pronunciation: that plays a recording from
// assets/audio/words/<id>.(mp3|m4a|ogg|wav) when one exists, and otherwise falls back to the
// browser's own speech voice for Croatian/Bosnian/Serbian (a placeholder, see CREDITS.md).
import S from './settings.js';

let ctx = null, master, sfx, mus, amb, town, noiseBuf, townPaused = false;
const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));
// recorded sounds: loaded once the sound is unlocked; until then (or if one fails) the synthesised one plays
const SFX_URLS = Object.fromEntries(Object.entries(import.meta.glob('../assets/audio/sfx/*.mp3', { eager: true, query: '?url', import: 'default' })).map(([p, u]) => [p.split('/').pop().slice(0, -4), u]));
const MAP_SFX_URLS = {};
for (const [p, u] of Object.entries(import.meta.glob('../assets/audio/sfx/*/*.mp3', { eager: true, query: '?url', import: 'default' }))) {
  const parts = p.split('/'), mapId = parts[parts.length - 2], name = parts[parts.length - 1].slice(0, -4);
  (MAP_SFX_URLS[mapId] ||= {})[name] = u;
}
const sfxBufs = {};
let activeMapSfx = null;
function decodeUrl(n, u) {
  if (!ctx || sfxBufs[n] !== undefined) return;
  sfxBufs[n] = null;
  fetch(u).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).then((buf) => { sfxBufs[n] = buf; }).catch(() => { delete sfxBufs[n]; });
}
function loadClips() {
  for (const [n, u] of Object.entries(SFX_URLS)) decodeUrl(n, u);
  if (activeMapSfx && MAP_SFX_URLS[activeMapSfx]) for (const [n, u] of Object.entries(MAP_SFX_URLS[activeMapSfx])) decodeUrl(n, u);
}
export function loadMapSfx(mapId) {
  activeMapSfx = mapId;
  if (ctx && MAP_SFX_URLS[mapId]) for (const [n, u] of Object.entries(MAP_SFX_URLS[mapId])) decodeUrl(n, u);
}
// play a recording; returns false if it is not loaded (so the caller can fall back)
function clip(name, vol, o = {}) {
  const buf = sfxBufs[name]; if (!ctx || !buf) return false;
  const src = ctx.createBufferSource(), g = ctx.createGain(), t = now(); src.buffer = buf; src.playbackRate.value = o.rate ?? 1;
  const dur = o.dur ?? buf.duration / src.playbackRate.value, fade = Math.min(o.fade ?? 0.01, dur / 3);
  if (o.dur) src.loop = true;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + fade);
  g.gain.setValueAtTime(vol, t + dur - fade); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(g).connect(o.bus || amb); src.start(t, o.offset ?? 0); src.stop(t + dur + 0.05); return true;
}
const now = () => ctx.currentTime;

// muting silences everything, the word recordings too; it is remembered between visits
let muted = false; try { muted = localStorage.getItem('slavuj-muted') === '1'; } catch (e) { /* no storage */ }
export const isMuted = () => muted;
export function setMuted(m) {
  muted = m; try { localStorage.setItem('slavuj-muted', m ? '1' : '0'); } catch (e) { /* no storage */ }
  if (master) master.gain.setTargetAtTime(m ? 0 : S.audio.volume, ctx.currentTime, 0.04);
  if (m) { player?.pause(); window.speechSynthesis?.cancel(); }
}
export function unlock() {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      master = ctx.createGain(); master.gain.value = muted ? 0 : S.audio.volume; master.connect(comp); comp.connect(ctx.destination);
      const delay = ctx.createDelay(); delay.delayTime.value = 0.13; const fb = ctx.createGain(); fb.gain.value = 0.22;
      sfx = ctx.createGain(); sfx.connect(master); sfx.connect(delay); delay.connect(fb); fb.connect(delay); fb.connect(master);
      mus = ctx.createGain(); mus.gain.value = S.audio.music; mus.connect(master); mus.connect(delay);
      amb = ctx.createGain(); amb.connect(master);
      town = ctx.createGain(); town.gain.value = townPaused ? 0 : 1; town.connect(amb);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      startLoops(); setInterval(musicTick, 200); loadClips();
    }
    if (ctx.state !== 'running') ctx.resume();
  } catch (e) { ctx = null; }
}

// ---------- building blocks ----------
function tone(t, pts, vol = 0.2, o = {}) {
  if (!ctx) return;
  const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = o.type || 'sine';
  osc.frequency.setValueAtTime(pts[0][1], t + pts[0][0]);
  for (let i = 1; i < pts.length; i++) osc.frequency.exponentialRampToValueAtTime(pts[i][1], t + pts[i][0]);
  const end = t + pts[pts.length - 1][0], a = o.attack ?? 0.015;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a);
  if (o.decay) g.gain.exponentialRampToValueAtTime(0.0001, end);
  else { g.gain.setValueAtTime(vol, Math.max(t + a + 0.001, end - 0.04)); g.gain.exponentialRampToValueAtTime(0.0001, end); }
  if (o.vibrato) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 9; lg.gain.value = o.vibrato; l.connect(lg).connect(osc.frequency); l.start(t); l.stop(end + 0.05); }
  osc.connect(g).connect(o.bus || sfx); osc.start(t); osc.stop(end + 0.05);
}
function noise(t, dur, o = {}) {
  if (!ctx) return;
  const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
  const flt = ctx.createBiquadFilter(); flt.type = o.type || 'bandpass'; flt.Q.value = o.q ?? 1;
  flt.frequency.setValueAtTime(o.f0 ?? 1000, t); if (o.f1) flt.frequency.exponentialRampToValueAtTime(o.f1, t + dur);
  const g = ctx.createGain(), a = o.attack ?? 0.01, v = o.vol ?? 0.2;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(flt).connect(g).connect(o.bus || sfx); src.start(t, Math.random()); src.stop(t + dur + 0.05);
  return { src, g };
}
function loop(type, freq, q, bus) {
  const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
  const flt = ctx.createBiquadFilter(); flt.type = type; flt.frequency.value = freq; flt.Q.value = q;
  const g = ctx.createGain(); g.gain.value = 0; src.connect(flt).connect(g).connect(bus || amb); src.start();
  return { g, flt };
}
const ramp = (param, v, s = 0.3) => { if (ctx) param.setTargetAtTime(v, now(), s); };
export function setTownPaused(p) {
  if (townPaused === !!p) return;
  townPaused = !!p;
  if (ctx && town) ramp(town.gain, townPaused ? 0 : 1, 0.06);
}

// ---------- continuous layers ----------
let rush, rushLow, songBus = null, windL, leavesL, waterL, murmurL, wind = 0, water = 0, birds = false, city = 0, murmur = 0;
const loops = {};
const trackedShots = [];
function startLoops() {
  rush = loop('bandpass', 420, 1.3, amb); rushLow = loop('lowpass', 240, 0.5, amb);       // wind in a fast dive: silent at cruising speed
  windL = loop('lowpass', 380, 0.4, town); leavesL = loop('highpass', 3500, 0.3, town); waterL = loop('bandpass', 900, 0.5, town); murmurL = loop('bandpass', 480, 1.4, town);
  setInterval(() => {
    if (!ctx) return;
    const t = now();
    ramp(windL.g.gain, wind * (0.05 + 0.04 * Math.sin(t * 0.37) + 0.03 * Math.sin(t * 0.9)), 0.8);
    ramp(leavesL.g.gain, wind * Math.max(0, 0.012 + 0.014 * Math.sin(t * 0.53 + 1)), 0.6);
    ramp(waterL.g.gain, water * (0.05 + 0.015 * Math.sin(t * 2.3)), 0.4);
    ramp(waterL.flt.frequency, 800 + 300 * Math.sin(t * 1.7) + 150 * Math.sin(t * 5.1), 0.2);
    if (birds && !townPaused && Math.random() < 0.16) { const f = 2600 + Math.random() * 2200, n = 1 + Math.floor(Math.random() * 4); for (let i = 0; i < n; i++) tone(t + i * 0.11, [[0, f], [0.05, f * 1.2], [0.09, f * 0.95]], 0.035, { bus: town }); }
    ramp(murmurL.g.gain, murmur * (0.012 + 0.03 * Math.random()), 0.12); ramp(murmurL.flt.frequency, 380 + Math.random() * 320, 0.15);   // voices, far off
  }, 250);
}
// reusable positional loop backed by an sfx clip (loaded per map)
export function setLoop(name, g, o = {}) {
  if (!ctx) return;
  let l = loops[name];
  if (!l) {
    const buf = sfxBufs[name]; if (!buf || g <= 0) return;
    const gain = ctx.createGain(); gain.gain.value = 0;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.playbackRate.value = o.rate ?? 1;
    if (o.loopStart != null) src.loopStart = o.loopStart;
    if (o.loopEnd != null) src.loopEnd = Math.min(o.loopEnd, buf.duration);
    src.connect(gain).connect(town); src.start(now(), o.loopStart ?? 0);
    l = loops[name] = { gain, vol: o.vol ?? 0.35 };
  }
  l.gain.gain.setTargetAtTime((o.vol ?? l.vol) * Math.max(0, g), now(), o.tau ?? 0.25);
}
// play a one-shot clip, optionally following the bird's distance each frame via updateTracked(birdPos)
export function playClip(name, vol = 0.3, o = {}) {
  if (!ctx || vol <= 0) return false;
  return clip(name, vol, { bus: town, ...o });
}
export function playNear(name, pos, radius, vol = 0.3, o = {}) {
  const buf = sfxBufs[name]; if (!ctx || !buf || vol <= 0) return false;
  const src = ctx.createBufferSource(), env = ctx.createGain(), distG = ctx.createGain(), t = now();
  src.buffer = buf; src.playbackRate.value = o.rate ?? 1;
  const dur = o.dur ?? buf.duration / src.playbackRate.value, fade = Math.min(o.fade ?? 0.015, dur / 3);
  if (o.dur) src.loop = true;
  env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(vol, t + fade);
  env.gain.setValueAtTime(vol, t + dur - fade); env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  distG.gain.value = o.initGain ?? 1;
  src.connect(env).connect(distG).connect(town); src.start(t, o.offset ?? 0); src.stop(t + dur + 0.05);
  const item = { pos, radius, distG, end: t + dur + 0.05 };
  trackedShots.push(item);
  return true;
}
export function updateTracked(birdPos) {
  if (!ctx || !trackedShots.length) return;
  const t = now();
  for (let i = trackedShots.length - 1; i >= 0; i--) {
    const it = trackedShots[i];
    if (t >= it.end) { trackedShots.splice(i, 1); continue; }
    const p = typeof it.pos === 'function' ? it.pos() : it.pos;
    const d = Math.hypot(birdPos.x - p.x, birdPos.y - p.y, birdPos.z - p.z);
    const g = Math.max(0, 1 - d / it.radius) ** 1.6;
    it.distG.gain.setTargetAtTime(g, t, 0.08);
  }
}
let lastSpeed = 0, accel = 0;
// wind past the bird, by its speed: it starts at about take-off speed, is clearly there at full cruising speed and
// strongest in a dive; gaining speed adds a little more. It stops at once when the bird lands.
export function setRush(speed, flying, dt = 0.016) {
  if (!ctx) return;
  const t = now();
  if (!flying) { lastSpeed = 0; accel = 0; for (const l of [rush, rushLow]) { l.g.gain.cancelScheduledValues(t); l.g.gain.setTargetAtTime(0, t, 0.035); } return; }
  const a = lastSpeed ? (speed - lastSpeed) / Math.max(dt, 0.001) : 0; lastSpeed = speed;
  accel += (Math.min(1, Math.max(0, a / 3)) - accel) * Math.min(1, dt * 6);
  const x = Math.min(1, Math.max(0, (speed - 8) / 18) + accel * 0.35), gust = 0.75 + 0.17 * Math.sin(t * 1.7) + 0.08 * Math.sin(t * 4.1);
  ramp(rush.g.gain, x ** 1.3 * 0.16 * gust * S.audio.wind, 0.18); ramp(rush.flt.frequency, 330 + 380 * x + 70 * Math.sin(t * 2.3), 0.3);
  ramp(rushLow.g.gain, x * 0.2 * S.audio.wind, 0.2);
}
export function setLife(o) { if ('wind' in o) wind = o.wind; if ('water' in o) water = o.water; if ('birds' in o) birds = o.birds; if ('city' in o) city = +o.city; if ('murmur' in o) murmur = o.murmur; }

// ---------- the bird ----------
export function flap(strength, scale = 1) { if (ctx) noise(now(), 0.12, { f0: 1300, f1: 450, q: 0.7, vol: (0.04 + 0.05 * strength) * S.audio.flap * scale, attack: 0.03 }); }
export function flutter() { if (!ctx) return; const t = now(); for (let i = 0; i < 9; i++) noise(t + i * 0.05 + Math.random() * 0.03, 0.07, { f0: 2100 + Math.random() * 600, f1: 800, q: 0.8, vol: 0.07 }); }
// a sheep bleating, as loud as it is near (g 0..1)
let baaN = 0;
export function baa(g = 1) {
  if (!ctx || g <= 0) return;
  const takes = Object.keys(sfxBufs).filter((n) => n.startsWith('sheep')); baaN = (baaN + 1) % Math.max(1, takes.length);
  if (takes.length && clip(takes[baaN], 0.3 * g, { rate: 1.18 })) return;      // (pitched up: the recordings are deep for these small sheep)
  const t = now(), f0 = 270 + Math.random() * 90, dur = 0.7 + Math.random() * 0.35;
  const o = ctx.createOscillator(); o.type = 'sawtooth';
  o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0 * 1.07, t + 0.12); o.frequency.linearRampToValueAtTime(f0 * 0.9, t + dur);
  const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 7 + Math.random() * 2; lg.gain.value = f0 * 0.07; l.connect(lg).connect(o.frequency);
  const out = ctx.createGain(); out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.11 * g, t + 0.05); out.gain.setValueAtTime(0.1 * g, t + dur - 0.2); out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  for (const [f, q, v] of [[900, 1.4, 1], [2300, 3, 0.45]]) { const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; const gv = ctx.createGain(); gv.gain.value = v; o.connect(bp).connect(gv).connect(out); }
  out.connect(amb); o.start(t); l.start(t); o.stop(t + dur + 0.05); l.stop(t + dur + 0.05);
}
// the horse neighing and the cat miaowing, as loud as they are near (g 0..1)
export function neigh(g = 1) { if (ctx && g > 0) clip('horse-neigh', 0.38 * g); }
export function meow(g = 1) { if (ctx && g > 0) clip('cat-meow', 0.3 * g); }
export function bark(g = 1) { if (ctx && g > 0) clip(Math.random() < 0.5 ? 'dog-bark' : 'dog-bark2', 0.34 * g); }      // two woofs; one of two takes
// the šadrvan's water: one quiet loop, as loud as the bird is near it (0 = silent)
let fountainGain = null;
export function setFountain(g) {
  if (!ctx) return;
  if (!fountainGain) { const buf = sfxBufs.fountain; if (!buf || g <= 0) return; fountainGain = ctx.createGain(); fountainGain.gain.value = 0; const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.connect(fountainGain).connect(town); src.start(); }
  fountainGain.gain.setTargetAtTime(0.32 * g, now(), 0.25);
}
// a knuckle on a wooden door
export function knock(g = 1) { if (!ctx || g <= 0) return; const t = now(); tone(t, [[0, 190], [0.07, 120]], 0.2 * g, { decay: true, attack: 0.002, bus: amb }); noise(t, 0.05, { f0: 1100, q: 1.3, vol: 0.12 * g, attack: 0.002, bus: amb }); }
let takeoffNodes = [];
export function takeoff() { if (!ctx) return; const t = now(); takeoffNodes = []; for (let i = 0; i < 4; i++) takeoffNodes.push(noise(t + i * 0.07, 0.09, { f0: 1700, f1: 600, q: 0.7, vol: 0.13 })); }
// a dive straight after taking off: the take-off wingbeats still to come are cut off at once
export function cancelTakeoff() { if (!ctx) return; const t = now(); for (const n of takeoffNodes) { n.g.gain.cancelScheduledValues(t); n.g.gain.setValueAtTime(Math.max(0.0001, n.g.gain.value), t); n.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02); try { n.src.stop(t + 0.03); } catch (e) { /* already ended */ } } takeoffNodes = []; }
export function land() { if (!ctx) return; const t = now(); tone(t, [[0, 150], [0.09, 70]], 0.2, { decay: true, attack: 0.004 }); noise(t, 0.12, { f0: 900, f1: 300, vol: 0.1 }); noise(t + 0.08, 0.1, { f0: 1600, f1: 700, vol: 0.06 }); }
export function bump() { if (ctx) { const t = now(); tone(t, [[0, 120], [0.12, 60]], 0.22, { decay: true, attack: 0.004 }); noise(t, 0.1, { f0: 500, f1: 200, vol: 0.1 }); } }
// the bird meets the water: p is 0..1, from a gentle touch to a full dive
export function birdSplash(p) { if (!ctx) return; const t = now(); noise(t, 0.25 + 0.5 * p, { type: 'lowpass', f0: 1800 + 1800 * p, f1: 400, q: 0.4, vol: 0.1 + 0.3 * p, attack: 0.008 }); noise(t + 0.04, 0.5 + 0.6 * p, { f0: 3200, f1: 1500, q: 0.5, vol: 0.04 + 0.1 * p, attack: 0.06 }); if (p > 0.5) tone(t, [[0, 170], [0.2, 60]], 0.25 * p, { decay: true, attack: 0.005 }); }
// the bridge crowd after the finale: it never stops clapping, so its applause loops (the steady middle of the recording),
// as loud as the bird is close (g, 0..1), like the fountain
let applauseGain = null;
export function setApplause(g) {
  if (!ctx) return;
  if (!applauseGain) { const buf = sfxBufs.applause; if (!buf || g <= 0) return; applauseGain = ctx.createGain(); applauseGain.gain.value = 0; const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = 1; src.loopEnd = Math.min(7.5, buf.duration); src.connect(applauseGain).connect(town); src.start(now(), 1); }
  applauseGain.gain.setTargetAtTime(0.55 * g, now(), 0.25);
}
// a crowd clapping; gain below 1 is the same crowd heard from further off
export function applause(seconds = 6, gain = 1) {
  if (!ctx) return; const t = now();
  const rec = sfxBufs['applause']; if (rec && clip('applause', 0.55 * gain, { dur: seconds, fade: Math.min(1.2, seconds / 4), offset: Math.random() * Math.max(0, rec.duration - 2) })) return;
  for (let i = 0; i < seconds * 48; i++) { const at = Math.random() * seconds, env = Math.sin(Math.PI * Math.min(1, at / seconds)) ** 0.5; noise(t + at, 0.045, { f0: 1000 + Math.random() * 2400, q: 1.1, vol: (0.13 * env + 0.015) * gain, attack: 0.002, bus: amb }); }
}
export function skim() { if (ctx) { const t = now(); noise(t, 0.3, { f0: 2500, f1: 900, q: 0.8, vol: 0.12 }); tone(t, [[0, 700], [0.12, 1300]], 0.04); } }

// one chirp per syllable, the same contour every time for the same word
export function speak(word) {
  const n = Math.max(1, (word.toLowerCase().match(/[aeiou]/g) || []).length);
  let hash = 0; for (const ch of word) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  if (ctx) { const t0 = now() + 0.03; for (let i = 0; i < n; i++) { const b = 2300 + ((hash >> (i * 3)) & 7) * 170; tone(t0 + i * 0.21, [[0, b * 0.8], [0.06, b * 1.25], [0.16, b * (i === n - 1 ? 0.82 : 1.05)]], 0.25); } }
  return wait(n * 0.21 + 0.15);
}
// the free-sing button: one short simple chirp
export function chirp() { if (ctx) { const t = now(), b = 2500 + Math.random() * 500; tone(t, [[0, b], [0.07, b * 1.3]], 0.2); tone(t + 0.1, [[0, b * 1.25], [0.09, b * 0.9]], 0.18); } }

// the colouring song: long and melodic, kept for the colouring scenes only
export function song(id, duration, reps = 3) {
  const sc = [1, 1.125, 1.25, 1.5, 1.6875, 2, 2.25].map((x) => x * 1900);
  const N = (i, d) => ['n', i, d], T = (a, b, d) => ['t', a, b, d], Gl = (a, b, d) => ['g', a, b, d], Rs = (d) => ['r', d];
  const seq = [
    N(0, .14), N(2, .14), N(4, .14), N(5, .32), Rs(.1), T(4, 5, .5), Rs(.12),
    Gl(5, 2, .36), N(3, .15), N(4, .15), N(6, .42), Rs(.14),
    T(2, 4, .45), N(5, .18), N(4, .18), N(2, .32), Rs(.16),
    N(2, .12), N(4, .12), N(5, .12), N(6, .12), ['v', 5, .7], Rs(.12),
    T(5, 6, .4), Gl(6, 3, .3), N(4, .14), N(5, .14), N(6, .14), Gl(6, 5, .55),
  ];
  // the melody keeps its own pace; a longer scene simply hears it again from the start
  const total = seq.reduce((a, e) => a + e[e.length - 1], 0), f = 1;
  if (ctx) {
    if (!songBus) { songBus = ctx.createGain(); songBus.connect(sfx); }
    const bus = songBus;
    let t = now() + 0.05; const end = t + duration;
    for (let rep = 0; rep < reps && t < end - 1.5; rep++) for (const e of seq) {
      const d = e[e.length - 1] * f; if (t + d > end) break;
      if (e[0] === 'n') tone(t, [[0, sc[e[1]] * 0.94], [0.03, sc[e[1]]], [d * 0.92, sc[e[1]] * 1.01]], 0.2, { bus });
      if (e[0] === 'v') tone(t, [[0, sc[e[1]]], [d * 0.95, sc[e[1]]]], 0.2, { vibrato: 45, bus });
      if (e[0] === 'g') tone(t, [[0, sc[e[1]]], [d * 0.95, sc[e[2]]]], 0.2, { bus });
      if (e[0] === 't') { const c = Math.max(2, Math.round(d / 0.065)); for (let i = 0; i < c; i++) tone(t + (i * d) / c, [[0, sc[i % 2 ? e[2] : e[1]]], [(d / c) * 0.9, sc[i % 2 ? e[2] : e[1]] * 1.03]], 0.18, { bus }); }
      t += d;
    }
  }
  return wait(duration);
}

export function stopSong() { if (ctx && songBus) { songBus.gain.setTargetAtTime(0, now(), 0.04); songBus = null; } }

// ---------- interface and magic ----------
const BELL = [1046.5, 1318.5, 1568, 2093];
function bell(t, f, vol = 0.12, len = 1.2) { tone(t, [[0, f], [len, f]], vol, { decay: true, attack: 0.004 }); tone(t, [[0, f * 2.01], [len * 0.6, f * 2.01]], vol * 0.35, { decay: true, attack: 0.004 }); }
export function uiOpen() { if (ctx) { const t = now(); noise(t, 0.16, { f0: 2500, f1: 5000, q: 0.5, vol: 0.05 }); bell(t + 0.02, BELL[1], 0.05, 0.5); } }
export function uiClose() { if (ctx) noise(now(), 0.14, { f0: 4000, f1: 1800, q: 0.5, vol: 0.04 }); }
// pencil on paper: a few quick scratchy strokes
export function scribble(dur = 0.4) { if (!ctx) return; const t = now(), n = Math.round(dur / 0.07); for (let i = 0; i < n; i++) noise(t + i * 0.07, 0.075, { f0: 2600 + Math.random() * 1500, f1: 3300 + Math.random() * 1200, q: 2.2, vol: 0.13, attack: 0.012 }); }
export function underline(dur = 0.45) { if (!ctx) return; const t = now(); noise(t, dur, { f0: 2400, f1: 3800, q: 1.8, vol: 0.1, attack: 0.03 }); BELL.slice(0, 3).forEach((f, i) => bell(t + dur * 0.7 + i * 0.09, f, 0.09, 1.1)); }
export function orbRelease() { if (!ctx) return; const t = now(); noise(t, 1.2, { f0: 900, f1: 6000, q: 0.6, vol: 0.06, attack: 0.3 }); [0, 1, 2, 3].forEach((i) => bell(t + 0.15 + i * 0.16, BELL[i], 0.07, 1.4)); }
export function paintWash(dur) { if (!ctx) return; const t = now(); noise(t, dur, { type: 'lowpass', f0: 500, f1: 1400, q: 0.5, vol: 0.05, attack: dur * 0.3 }); for (let i = 0; i < 9; i++) tone(t + 0.3 + i * dur * 0.09, [[0, 500 + Math.random() * 500], [0.06, 900 + Math.random() * 700]], 0.025); }
export function learned() { if (ctx) { const t = now(); bell(t, BELL[2], 0.1, 0.9); bell(t + 0.12, BELL[3], 0.1, 1.2); } }
export function page() { if (ctx) noise(now(), 0.28, { f0: 1200, f1: 4200, q: 0.5, vol: 0.09, attack: 0.05 }); }
export function orbsAppear() { if (ctx) { const t = now(); [0, 2, 1, 3].forEach((n, i) => bell(t + i * 0.13, BELL[n] * 0.5, 0.09, 1.6)); } }
export function pickup() { if (!ctx) return; const t = now(); [0, 1, 2, 3, 2, 3].forEach((n, i) => bell(t + i * 0.1, BELL[n] * (i > 3 ? 2 : 1), 0.11, 2)); noise(t, 1.6, { f0: 2000, f1: 8000, q: 0.5, vol: 0.07, attack: 0.2 }); }
// a cannon shot far off: a deep thud and a rolling rumble
export function boom(g = 1) { if (!ctx) return; const t = now(); tone(t, [[0, 70], [0.5, 32]], 0.55 * g, { decay: true, attack: 0.004 }); noise(t, 1.8, { type: 'lowpass', f0: 900, f1: 120, q: 0.5, vol: 0.45 * g, attack: 0.006 }); }
export function splash() { if (!ctx) return; const t = now(); noise(t, 0.9, { type: 'lowpass', f0: 2600, f1: 300, q: 0.4, vol: 0.5, attack: 0.008 }); noise(t + 0.05, 1.6, { f0: 3500, f1: 1500, q: 0.4, vol: 0.16, attack: 0.1 }); tone(t, [[0, 140], [0.3, 45]], 0.4, { decay: true, attack: 0.005 }); }

// ---------- music ----------
// Before the finale: sparse plucked notes in a minor mode that grow richer as the town fills with colour.
// After it: a brighter tune of its own, a steady arpeggio in D major with a melody over it.
// During the colouring scenes and the finale the soundtrack is silent (duckMusic).
const MINOR = [1, 1.2, 4 / 3, 1.5, 1.8];
let level = 0.2, alive = false, nextNote = 0, deg = 2, padG = null, ducked = false, step = 0, nextStep = 0, mel = 2;
export function setMusic(l, isAlive) { level = l; if (isAlive !== undefined) alive = isAlive; }
export function duckMusic(on) { ducked = on; if (ctx) mus.gain.setTargetAtTime(on ? 0 : S.audio.music, now(), on ? 0.12 : 0.9); }
function pluck(t, f, vol, len = 2.2) { tone(t, [[0, f], [len, f]], vol, { type: 'triangle', decay: true, attack: 0.006, bus: mus }); tone(t, [[0, f * 2], [len * 0.55, f * 2]], vol * 0.3, { decay: true, attack: 0.006, bus: mus }); }
const PROG = [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12], [0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]], PENTA = [0, 2, 4, 7, 9, 12, 14, 16], D3 = 146.83, semi = (n) => D3 * 2 ** (n / 12);
function aliveTick(t) {
  if (nextStep < t) nextStep = t + 0.08;
  while (nextStep < t + 0.5) {
    const s = step % 8, ch = PROG[Math.floor(step / 8) % PROG.length], at = nextStep + (s % 2 ? 0.02 : 0);
    if (s === 0) pluck(at, semi(ch[0]), 0.085, 1.6); else if (s === 4) pluck(at, semi(ch[2] - 12), 0.05, 1.2);
    pluck(at, semi(ch[[0, 1, 2, 1, 0, 2, 1, 2][s]] + 12), 0.03, 0.8);
    if (s % 2 === 0 && Math.random() < 0.72) {
      mel = Math.max(0, Math.min(PENTA.length - 1, mel + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)]));
      const f = semi(PENTA[mel] + 24); tone(at, [[0, f], [0.9, f]], 0.05, { decay: true, attack: 0.01, bus: mus }); tone(at, [[0, f * 2], [0.4, f * 2]], 0.012, { decay: true, attack: 0.01, bus: mus });
    }
    step++; nextStep += 0.3;
  }
}
function musicTick() {
  if (!ctx || ctx.state !== 'running' || ducked) return;
  const t = now(); if (alive) return aliveTick(t);
  if (t < nextNote) return;
  const base = 293.66;
  deg = Math.max(0, Math.min(9, deg + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)]));
  pluck(t + 0.05, base * MINOR[deg % 5] * (deg >= 5 ? 2 : 1), 0.05 + 0.04 * level);
  if (Math.random() < 0.25 + 0.3 * level) pluck(t + 0.05, (base / 2) * MINOR[[0, 3, 2, 0][Math.floor(Math.random() * 4)]], 0.07);
  if (level > 0.5 && Math.random() < 0.4) pluck(t + 0.3, base * MINOR[(deg + 2) % 5] * 2, 0.04);
  nextNote = t + (1.7 - 1.1 * level) * (0.7 + Math.random() * 0.7);
}
// the finale: a warm chord swells under the scene, and fades away when it is over
export function swell(on, time = 6) {
  if (!ctx) return;
  if (on && !padG) {
    padG = ctx.createGain(); padG.gain.value = 0; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; const out = ctx.createGain(); out.gain.value = S.audio.music; padG.connect(lp).connect(out).connect(master);
    for (const f of [146.83, 220, 293.66, 369.99, 440, 587.33]) for (const d of [-4, 4]) { const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = d; const g = ctx.createGain(); g.gain.value = 0.05; o.connect(g).connect(padG); o.start(); }
  }
  if (padG) ramp(padG.gain, on ? 0.9 : 0, time / 3);
}

// ---------- pronunciation: a recording if there is one, otherwise the browser's voice ----------
const files = import.meta.glob('../assets/audio/words/*.{mp3,m4a,ogg,wav}', { eager: true, query: '?url', import: 'default' });
const clips = {}; for (const p in files) clips[p.split('/').pop().replace(/\.\w+$/, '')] = files[p];
let voice = null, player = null;
function findVoice() { const v = window.speechSynthesis?.getVoices() || []; voice = v.find((x) => /^bs/i.test(x.lang)) || v.find((x) => /^hr/i.test(x.lang)) || v.find((x) => /^sr/i.test(x.lang)) || null; }
if (window.speechSynthesis) { findVoice(); window.speechSynthesis.onvoiceschanged = findVoice; }
// file name for a word: lower case, no diacritics (kuća -> kuca.mp3, džamija -> dzamija.mp3)
export const slug = (w) => w.toLowerCase().replace(/đ/g, 'dj').replace(/[ćč]/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z');
export const pronunciationSource = () => (Object.keys(clips).length ? 'recordings' : voice ? 'browser voice ' + voice.name : 'none');
export function pronounce(word) {
  if (muted) return true;
  const id = slug(word);
  if (clips[id]) { player?.pause(); player = new Audio(clips[id]); player.volume = 0.95; player.play().catch(() => {}); return true; }
  if (!voice) findVoice();
  if (!voice) return false;
  const u = new SpeechSynthesisUtterance(word); u.voice = voice; u.lang = voice.lang; u.rate = S.audio.pronunciationRate;
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); return true;
}
