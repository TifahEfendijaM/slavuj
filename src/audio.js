// Placeholder bird voice: synthesised chirps and a longer melodic song.
import S from './settings.js';

let ctx = null, out = null;
const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));

export function unlock() {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      out = ctx.createGain(); out.gain.value = S.audio.volume;
      const delay = ctx.createDelay(); delay.delayTime.value = 0.11;
      const fb = ctx.createGain(); fb.gain.value = 0.2;
      out.connect(ctx.destination); out.connect(delay); delay.connect(fb); fb.connect(delay); fb.connect(ctx.destination);
    }
    if (ctx.state !== 'running') ctx.resume();
  } catch (e) { ctx = null; }
}

// one whistle: pts = [[time, frequency], ...]
function note(t, pts, vol = 0.22, vibrato = 0) {
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(pts[0][1], t + pts[0][0]);
  for (let i = 1; i < pts.length; i++) o.frequency.exponentialRampToValueAtTime(pts[i][1], t + pts[i][0]);
  const end = t + pts[pts.length - 1][0];
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.setValueAtTime(vol, Math.max(t + 0.016, end - 0.04));
  g.gain.exponentialRampToValueAtTime(0.0001, end);
  if (vibrato) {
    const l = ctx.createOscillator(), lg = ctx.createGain();
    l.frequency.value = 9; lg.gain.value = vibrato; l.connect(lg).connect(o.frequency); l.start(t); l.stop(end + 0.05);
  }
  o.connect(g).connect(out); o.start(t); o.stop(end + 0.05);
}

// The bird "says" a word: one chirp per syllable, a contour that is always the same for that word.
export function speak(word) {
  const n = Math.max(1, (word.toLowerCase().match(/[aeiou]/g) || []).length);
  let hash = 0; for (const ch of word) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  if (ctx) {
    const t0 = ctx.currentTime + 0.03;
    for (let i = 0; i < n; i++) {
      const base = 2300 + ((hash >> (i * 3)) & 7) * 170, t = t0 + i * 0.21;
      note(t, [[0, base * 0.8], [0.06, base * 1.25], [0.16, base * (i === n - 1 ? 0.82 : 1.05)]], 0.25);
    }
  }
  return wait(n * 0.21 + 0.15);
}

// The special colouring song: longer and melodic, only used in cutscenes.
export function song(duration) {
  const scale = [1, 1.125, 1.25, 1.5, 1.6875, 2, 2.25].map((x) => x * 1900);
  const N = (i, d) => ['n', i, d], T = (a, b, d) => ['t', a, b, d], G = (a, b, d) => ['g', a, b, d], R = (d) => ['r', d];
  const seq = [
    N(0, .14), N(2, .14), N(4, .14), N(5, .32), R(.1), T(4, 5, .5), R(.12),
    G(5, 2, .36), N(3, .15), N(4, .15), N(6, .42), R(.14),
    T(2, 4, .45), N(5, .18), N(4, .18), N(2, .32), R(.16),
    N(2, .12), N(4, .12), N(5, .12), N(6, .12), ['v', 5, .7], R(.12),
    T(5, 6, .4), G(6, 3, .3), N(4, .14), N(5, .14), N(6, .14), G(6, 5, .55),
  ];
  const total = seq.reduce((s, e) => s + e[e.length - 1], 0), f = duration / total;
  if (ctx) {
    let t = ctx.currentTime + 0.05;
    for (const e of seq) {
      const d = e[e.length - 1] * f;
      if (e[0] === 'n') note(t, [[0, scale[e[1]] * 0.94], [0.03, scale[e[1]]], [d * 0.92, scale[e[1]] * 1.01]], 0.22);
      if (e[0] === 'v') note(t, [[0, scale[e[1]]], [d * 0.95, scale[e[1]]]], 0.22, 45);
      if (e[0] === 'g') note(t, [[0, scale[e[1]]], [d * 0.95, scale[e[2]]]], 0.22);
      if (e[0] === 't') { const c = Math.round(d / 0.065); for (let i = 0; i < c; i++) note(t + (i * d) / c, [[0, scale[i % 2 ? e[2] : e[1]]], [(d / c) * 0.9, scale[i % 2 ? e[2] : e[1]] * 1.03]], 0.2); }
      t += d;
    }
  }
  return wait(duration);
}
