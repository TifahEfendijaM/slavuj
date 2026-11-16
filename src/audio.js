// All sound is synthesised here, except word pronunciation: that plays a recording from
// assets/audio/words/<id>.(mp3|m4a|ogg|wav) when one exists, and otherwise falls back to the
// browser's own speech voice for Croatian/Bosnian/Serbian (a placeholder, see CREDITS.md).
import S from './settings.js';
import { WORDS } from './vocab.js';

let ctx = null, master, sfx, mus, amb, noiseBuf;
const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));
const now = () => ctx.currentTime;

export function unlock() {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      master = ctx.createGain(); master.gain.value = S.audio.volume; master.connect(comp); comp.connect(ctx.destination);
      const delay = ctx.createDelay(); delay.delayTime.value = 0.13; const fb = ctx.createGain(); fb.gain.value = 0.22;
      sfx = ctx.createGain(); sfx.connect(master); sfx.connect(delay); delay.connect(fb); fb.connect(delay); fb.connect(master);
      mus = ctx.createGain(); mus.gain.value = S.audio.music; mus.connect(master); mus.connect(delay);
      amb = ctx.createGain(); amb.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      startLoops(); setInterval(musicTick, 200);
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
}
function loop(type, freq, q) {
  const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
  const flt = ctx.createBiquadFilter(); flt.type = type; flt.frequency.value = freq; flt.Q.value = q;
  const g = ctx.createGain(); g.gain.value = 0; src.connect(flt).connect(g).connect(amb); src.start();
  return { g, flt };
}
const ramp = (param, v, s = 0.3) => { if (ctx) param.setTargetAtTime(v, now(), s); };

// ---------- continuous layers ----------
let rush, windL, leavesL, waterL, murmurL, wind = 0, water = 0, birds = false, city = 0, murmur = 0;
function startLoops() {
  rush = loop('bandpass', 700, 0.6);       // air past the bird, follows its speed
  windL = loop('lowpass', 380, 0.4); leavesL = loop('highpass', 3500, 0.3); waterL = loop('bandpass', 900, 0.5); murmurL = loop('bandpass', 480, 1.4);
  setInterval(() => {
    if (!ctx) return;
    const t = now();
    ramp(windL.g.gain, wind * (0.05 + 0.04 * Math.sin(t * 0.37) + 0.03 * Math.sin(t * 0.9)), 0.8);
    ramp(leavesL.g.gain, wind * Math.max(0, 0.012 + 0.014 * Math.sin(t * 0.53 + 1)), 0.6);
    ramp(waterL.g.gain, water * (0.05 + 0.015 * Math.sin(t * 2.3)), 0.4);
    ramp(waterL.flt.frequency, 800 + 300 * Math.sin(t * 1.7) + 150 * Math.sin(t * 5.1), 0.2);
    if (birds && Math.random() < 0.16) { const f = 2600 + Math.random() * 2200, n = 1 + Math.floor(Math.random() * 4); for (let i = 0; i < n; i++) tone(t + i * 0.11, [[0, f], [0.05, f * 1.2], [0.09, f * 0.95]], 0.035, { bus: amb }); }
    ramp(murmurL.g.gain, murmur * (0.012 + 0.03 * Math.random()), 0.12); ramp(murmurL.flt.frequency, 380 + Math.random() * 320, 0.15);   // voices, far off
    if (Math.random() < 0.07 * city) { const n = 2 + Math.floor(Math.random() * 4); for (let i = 0; i < n; i++) tone(t + i * 0.19, [[0, 2350], [0.12, 2330]], 0.01 + 0.02 * city, { bus: amb, type: 'triangle', decay: true, attack: 0.003 }); }
  }, 250);
}
export function setRush(speed, flying) { if (ctx) { ramp(rush.g.gain, flying ? Math.min(0.11, Math.max(0, speed - 8) * 0.004) : 0, 0.15); ramp(rush.flt.frequency, 500 + speed * 28, 0.2); } }
export function setLife(o) { if ('wind' in o) wind = o.wind; if ('water' in o) water = o.water; if ('birds' in o) birds = o.birds; if ('city' in o) city = +o.city; if ('murmur' in o) murmur = o.murmur; }

// ---------- the bird ----------
export function flap(strength, scale = 1) { if (ctx) noise(now(), 0.12, { f0: 1300, f1: 450, q: 0.7, vol: (0.04 + 0.05 * strength) * S.audio.flap * scale, attack: 0.03 }); }
export function takeoff() { if (!ctx) return; const t = now(); for (let i = 0; i < 4; i++) noise(t + i * 0.07, 0.09, { f0: 1700, f1: 600, q: 0.7, vol: 0.13 }); }
export function land() { if (!ctx) return; const t = now(); tone(t, [[0, 150], [0.09, 70]], 0.2, { decay: true, attack: 0.004 }); noise(t, 0.12, { f0: 900, f1: 300, vol: 0.1 }); noise(t + 0.08, 0.1, { f0: 1600, f1: 700, vol: 0.06 }); }
export function bump() { if (ctx) { const t = now(); tone(t, [[0, 120], [0.12, 60]], 0.22, { decay: true, attack: 0.004 }); noise(t, 0.1, { f0: 500, f1: 200, vol: 0.1 }); } }
// the bird meets the water: p is 0..1, from a gentle touch to a full dive
export function birdSplash(p) { if (!ctx) return; const t = now(); noise(t, 0.25 + 0.5 * p, { type: 'lowpass', f0: 1800 + 1800 * p, f1: 400, q: 0.4, vol: 0.1 + 0.3 * p, attack: 0.008 }); noise(t + 0.04, 0.5 + 0.6 * p, { f0: 3200, f1: 1500, q: 0.5, vol: 0.04 + 0.1 * p, attack: 0.06 }); if (p > 0.5) tone(t, [[0, 170], [0.2, 60]], 0.25 * p, { decay: true, attack: 0.005 }); }
export function applause(seconds = 6) { if (!ctx) return; const t = now(); for (let i = 0; i < seconds * 26; i++) { const at = Math.random() * seconds, env = Math.sin(Math.PI * Math.min(1, at / seconds) ** 0.6); noise(t + at, 0.035, { f0: 1500 + Math.random() * 1800, q: 1.6, vol: 0.05 * env + 0.008, attack: 0.002, bus: amb }); } }
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
export function song(id, duration) {
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
    let t = now() + 0.05; const end = t + duration;
    for (let rep = 0; rep < 3 && t < end - 1.5; rep++) for (const e of seq) {
      const d = e[e.length - 1] * f; if (t + d > end) break;
      if (e[0] === 'n') tone(t, [[0, sc[e[1]] * 0.94], [0.03, sc[e[1]]], [d * 0.92, sc[e[1]] * 1.01]], 0.2);
      if (e[0] === 'v') tone(t, [[0, sc[e[1]]], [d * 0.95, sc[e[1]]]], 0.2, { vibrato: 45 });
      if (e[0] === 'g') tone(t, [[0, sc[e[1]]], [d * 0.95, sc[e[2]]]], 0.2);
      if (e[0] === 't') { const c = Math.max(2, Math.round(d / 0.065)); for (let i = 0; i < c; i++) tone(t + (i * d) / c, [[0, sc[i % 2 ? e[2] : e[1]]], [(d / c) * 0.9, sc[i % 2 ? e[2] : e[1]] * 1.03]], 0.18); }
      t += d;
    }
  }
  return wait(duration);
}

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
export function splash() { if (!ctx) return; const t = now(); noise(t, 0.9, { type: 'lowpass', f0: 2600, f1: 300, q: 0.4, vol: 0.5, attack: 0.008 }); noise(t + 0.05, 1.6, { f0: 3500, f1: 1500, q: 0.4, vol: 0.16, attack: 0.1 }); tone(t, [[0, 140], [0.3, 45]], 0.4, { decay: true, attack: 0.005 }); }

// ---------- music: sparse plucked notes that grow richer as the town fills with colour ----------
const MINOR = [1, 1.2, 4 / 3, 1.5, 1.8], MAJOR = [1, 1.125, 1.25, 1.5, 5 / 3];
let level = 0.2, alive = false, nextNote = 0, deg = 2, padG = null, musicHold = 0;
export function setMusic(l, isAlive) { level = l; if (isAlive !== undefined) alive = isAlive; }
function pluck(t, f, vol) { tone(t, [[0, f], [2.2, f]], vol, { type: 'triangle', decay: true, attack: 0.006, bus: mus }); tone(t, [[0, f * 2], [1.2, f * 2]], vol * 0.3, { decay: true, attack: 0.006, bus: mus }); }
function musicTick() {
  if (!ctx || ctx.state !== 'running') return;
  const t = now(); if (t < musicHold || t < nextNote) return;
  const sc = alive ? MAJOR : MINOR, base = 293.66;
  deg = Math.max(0, Math.min(9, deg + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)]));
  pluck(t + 0.05, base * sc[deg % 5] * (deg >= 5 ? 2 : 1), 0.05 + 0.04 * level);
  if (Math.random() < 0.25 + 0.3 * level) pluck(t + 0.05, (base / 2) * sc[[0, 3, 2, 0][Math.floor(Math.random() * 4)]], 0.07);
  if (level > 0.5 && Math.random() < 0.4) pluck(t + 0.3, base * sc[(deg + 2) % 5] * 2, 0.04);
  nextNote = t + (1.7 - 1.1 * level) * (0.7 + Math.random() * 0.7);
}
// the finale: a warm chord swells under the scene
export function swell(on, time = 6) {
  if (!ctx) return;
  if (on && !padG) {
    padG = ctx.createGain(); padG.gain.value = 0; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; padG.connect(lp).connect(mus);
    for (const f of [146.83, 220, 293.66, 369.99, 440, 587.33]) for (const d of [-4, 4]) { const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = d; const g = ctx.createGain(); g.gain.value = 0.05; o.connect(g).connect(padG); o.start(); }
  }
  if (padG) ramp(padG.gain, on ? 0.9 : 0.25, time / 3);
}
export function hush(seconds) { if (ctx) { musicHold = now() + seconds; const g = mus.gain; g.setTargetAtTime(0.04, now(), 0.25); g.setTargetAtTime(S.audio.music, now() + seconds, 0.6); } }

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
  const id = slug(word);
  if (clips[id]) { player?.pause(); player = new Audio(clips[id]); player.volume = 0.95; player.play().catch(() => {}); return true; }
  if (!voice) findVoice();
  if (!voice) return false;
  const u = new SpeechSynthesisUtterance(word); u.voice = voice; u.lang = voice.lang; u.rate = S.audio.pronunciationRate;
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); return true;
}
