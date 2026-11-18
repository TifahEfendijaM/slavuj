// Jahorina (winter): a mountain village on a snowy plateau under the ski slope, pine forest all round, the ski lift up to
// the peak. North is -z: the slope rises from z = -60 (the village) to z = -230 (the top).
import * as THREE from 'three';
import { makeKit, BANK, GEO, PAL, mat4 } from '../kit.js';
import { tag, PAT } from '../paper.js';
import { WORDS, ORDER, CULTURE } from './jahorina-words.js';
import art from '../../assets/journal-jahorina.jpg';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const S0 = -60, S1 = -230, TOP = 82;
export const yAt = (z) => (z > S0 ? BANK : z < S1 ? TOP : BANK + (S0 - z) * (TOP - BANK) / (S0 - S1));
const LIFT_X = 60, LIFT_Z0 = -56, LIFT_Z1 = -224, CHAIR_GAP = 12;
const SNOW = { tag: 'snow', col: '#fbfdff', bleed: '#cfdcec', pat: PAT.grass, hatch: 0.35 };

function build(scene) {
  const K = makeKit(scene, { seed: 47 }), { A, box, slab, orb, pick, rr, R, b } = K;
  const sunPos = K.sky({ col: '#f4b4a4', bleed: '#6f86c6', sun: '#ffd27a', sunBleed: '#ffab5a' });
  for (const [x, y, z, s] of [[-120, 90, -170, 7], [90, 96, -200, 9], [170, 74, 40, 7], [-180, 80, 70, 8], [20, 92, 200, 8], [-50, 100, -280, 10], [120, 84, -90, 6], [-80, 78, -40, 5]]) K.cloud(x, y, z, s);

  // ---------- the ground: snow on the village's plateau, the slope, the top ----------
  tag('snow').mode = 'one'; tag('snow').radius = 320; tag('mountain').mode = 'one'; tag('mountain').radius = 420;
  box(240, 10, 190, 0, BANK - 5, 35, SNOW);
  const L = Math.hypot(S0 - S1, TOP - BANK), ang = Math.atan2(TOP - BANK, S0 - S1);
  box(240, 2, L, 0, (BANK + TOP) / 2 - 1 / Math.cos(ang), (S0 + S1) / 2, SNOW, 0, ang);
  box(240, 2, 120, 0, TOP - 1, S1 - 59.9, SNOW);
  slab(-120, 120, 70, 78, { ...SNOW, col: '#eef2f6', bleed: '#c3cfdc', pat: PAT.cobble, ps: 1.6 }, BANK + 0.04, 0.1);      // the road, packed snow
  // the piste: a groomed band down the slope
  tag('piste').hullWidth = 1.2;
  box(42, 0.2, L, 20, (BANK + TOP) / 2 + 0.06, (S0 + S1) / 2, { tag: 'piste', col: '#f4f8ff', bleed: '#b8cde6', pat: PAT.planks, ps: 0.5, hatch: 0.25, solid: false }, 0, ang);
  orb('staza', [20, yAt(-120) + 1, -120], 14, ['piste'], 'combo', yAt(-120) + 2, { near: { p: [20, yAt(-110) + 0.5, -110], r: 4 }, wideView: { from: [34, BANK + 26, 10], to: [6, BANK + 28, 4], look: [20, yAt(-120), -120], lookTo: [20, yAt(-170), -170] } });
  orb('snijeg', [-4, BANK + 0.2, 20], 10, ['snow'], 'combo', BANK + 1, { near: { p: [-4, BANK + 0.5, 20], r: 4 }, wideView: { from: [90, BANK + 60, 120], to: [-90, BANK + 60, 120], look: [30, BANK, 0], lookTo: [-30, BANK, 0] } });
  tag('snow').holdRest = 2.9;
  // the mountains all round, and the rocks of the peak above the top of the slope
  for (const [x, z, r, h] of [[-300, 280, 160, 110], [20, 380, 220, 140], [300, 260, 170, 115], [400, -60, 180, 150], [-400, -80, 190, 160], [-200, -420, 190, 190], [200, -430, 200, 200]]) {
    A(GEO.ICO2, x, BANK - 4, z, { tag: 'mountain', col: '#9eb0c4', bleed: '#6f84a0', hull: true, solid: false }, R() * 6, 0, 0, [r, h, r * rr(0.7, 1)]);
    A(GEO.ICO2, x, BANK - 4 + h * 0.62, z, { tag: 'mountain', col: '#f6f9fd', bleed: '#c8d6e8', hull: false, ink: false, solid: false }, R() * 6, 0, 0, [r * 0.62, h * 0.42, r * 0.6]);
  }
  orb('planina', [0, 60, 300], 60, ['mountain'], 'wide', BANK + 8, { at: V(0, BANK + 10, 104), near: { p: [0, BANK + 0.5, 104], r: 4 } });
  b.object(() => { for (const [x, z, s] of [[-24, -246, 7], [-14, -252, 5], [-34, -240, 4.5], [-6, -244, 3.6], [-28, -258, 5.5]]) { A(GEO.DODE, x, TOP + s * 0.5, z, { tag: 'peak', col: '#8a8f96', bleed: '#5f646c' }, R() * 6, 0, 0, [s * 1.3, s * 1.1, s]); A(GEO.DODE, x, TOP + s * 0.95, z, { tag: 'snow', col: '#fbfdff', bleed: '#cfdcec', solid: false, ink: false }, R() * 6, 0, 0, [s * 0.9, s * 0.5, s * 0.7]); } });
  orb('vrh', [-22, TOP + 5, -248], 12, ['peak'], 'close', TOP + 10);

  // ---------- the cabins (all one word) with snow on their roofs and icicles at the eaves ----------
  const icicles = (x, z, y, rot, w, n = 7) => { b.push(mat4(x, y, z, rot)); for (let i = 0; i < n; i++) A(GEO.CONE4, -w / 2 + 0.4 + i * (w - 0.8) / (n - 1), -0.32 - (i % 3) * 0.12, 0, { tag: 'icicle', col: '#e6f4fb', bleed: '#9fd0e6', hatch: 0, solid: false, hull: true }, 0, Math.PI, 0, [0.09, 0.55 + (i % 3) * 0.25, 0.09]); b.pop(); };
  const CAB = { tagH: 'cabin', roofTag: 'cabin', winTag: 'cabin', doorTag: 'cabin', chimTag: 'cabin', stone: false, wood: true, kind: 'wood', roof: 'gable', snow: true };
  const cabins = [];
  const cabin = (x, z, rot, w, d, h, extra = {}) => { const c = K.house({ ...CAB, x, z, rot, w, d, h, rh: 2.6, wall: pick([['#a8794e', '#86603c'], ['#9a6a42', '#7a5032'], ['#b08458', '#8e6440']]), ...extra }); cabins.push(c); icicles(x + Math.sin(rot) * (d / 2 + 0.66), z + Math.cos(rot) * (d / 2 + 0.66), BANK + h, rot, w + 1.2); return c; };
  const tut = cabin(-10, 26, 0, 6, 5, 3.6, { roofOrb: 'koliba' });
  orb('koliba', [-10, BANK + 4.6, 26], 5, ['cabin'], 'combo', tut.top, { stage: 0 });
  tag('cabin').holdRest = 2.9;
  for (const [x, z, rot, w, d, h] of [[-34, -22, 0, 7, 6, 4], [-52, -2, Math.PI / 2, 6.5, 5.5, 3.8], [38, 30, Math.PI, 7, 6, 4.2], [58, 6, -Math.PI / 2, 6, 5.5, 3.6], [-56, 36, Math.PI / 2, 7, 6, 4], [18, 50, Math.PI, 6.5, 5.5, 3.8],
    [-30, 58, Math.PI, 7, 6, 4], [70, 40, -Math.PI / 2, 6.5, 6, 4], [-78, 10, Math.PI / 2, 6.5, 5.5, 3.8], [-84, 50, Math.PI / 2, 7, 6, 4.2], [86, -16, -Math.PI / 2, 6.5, 5.5, 3.8]]) cabin(x, z, rot, w, d, h);
  // the hotel: lit windows, snow on its roof
  const hot = K.house({ x: 24, z: -28, rot: 0, w: 22, d: 12, h: 10, rh: 3.4, roof: 'hip', kind: 'wood', tagH: 'hotel', roofTag: 'hotel', winTag: 'light', doorTag: 'hotel', chimTag: 'hotel', lit: true, snow: true, stone: true, wall: ['#e9dcc4', '#cdbb9c'] });
  for (const fy of [2.2, 4.6]) for (let i = 0; i < 6; i++) { const wx = 24 - 9 + i * 3.6; box(1.1, 1.3, 0.1, wx, BANK + fy + 2, -28 + 6.18, { tag: 'light', col: '#f2c66a', bleed: '#d9963a', solid: false, pool: 1 }); }
  icicles(24, -28 + 6 + 0.66, BANK + 10, 0, 23.2, 14);
  orb('hotel', [24, BANK + 6, -28], 12, ['hotel'], 'close', hot.top, { front: 0 });
  orb('svjetlo', [24, BANK + 6, -21.6], 9, ['light'], 'close', BANK + 9, { requires: ['hotel'], front: 0, at: V(14, BANK + 8, -20.5) });
  orb('ledenica', [-10, BANK + 3.2, 29.2], 3, ['icicle'], 'combo', BANK + 3.4, { requires: ['koliba'], near: { p: [-8, BANK + 0.5, 30.6], r: 2.6 }, at: V(-6.8, BANK + 4.4, 29.6), front: 0 });
  tag('icicle').holdRest = 2.9;

  // ---------- the frozen pond and its skater ----------
  A(GEO.CYL16, -36, BANK + 0.07, 18, { tag: 'ice', col: '#cfe8f4', bleed: '#8fc2dc', pat: PAT.water, hatch: 0, edge: 50, ink: true }, 0, 0, 0, [9.5, 0.08, 7]);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; A(GEO.ICO, -36 + Math.cos(a) * 9.7, BANK + 0.1, 18 + Math.sin(a) * 7.2, { ...SNOW, hull: true, solid: false, ink: false }, R() * 6, 0, 0, [rr(0.8, 1.3), 0.35, rr(0.6, 1)]); }
  orb('led', [-36, BANK + 0.2, 18], 7, ['ice'], 'close', BANK + 0.6, { near: { p: [-36, BANK + 0.5, 26.8], r: 3 } });
  orb('klizati', [-36, BANK + 1, 18], 2.4, ['skate'], 'close', BANK + 2.2, { near: { p: [-36, BANK + 0.5, 26.8], r: 3 }, at: V(-38, BANK + 2.8, 21) });

  // ---------- the snowman, the igloo and a pile of snowballs ----------
  b.object(() => {
    const SM = { tag: 'snowman', col: '#fbfdff', bleed: '#c8d6e8', hull: true }, x = 6, z = 14;
    A(GEO.SPH, x, BANK + 0.75, z, SM, 0, 0, 0, 0.85); A(GEO.SPH, x, BANK + 1.85, z, SM, 0, 0, 0, 0.6); A(GEO.SPH, x, BANK + 2.7, z, SM, 0, 0, 0, 0.42);
    for (const [dx, dy, dz] of [[-0.14, 2.82, 0.38], [0.14, 2.82, 0.38], [0, 1.95, 0.58], [0, 1.7, 0.6], [0, 1.45, 0.55]]) A(GEO.SPH, x + dx, BANK + dy, z + dz, { tag: 'snowman', col: '#2a2826', solid: false, ink: false }, 0, 0, 0, 0.055);
    for (const s of [-1, 1]) A(GEO.CYL, x + s * 0.95, BANK + 2.1, z, { tag: 'snowman', col: '#6a4a30', solid: false }, 0, 0, s * 1.0, [0.035, 1.1, 0.035]);
    A(GEO.CONE8, x, BANK + 2.7, z + 0.58, { tag: 'carrot', col: '#e8792e', bleed: '#c45a1e', solid: false, hull: true }, 0, Math.PI / 2, 0, [0.07, 0.42, 0.07]);
    A(new THREE.TorusGeometry(0.4, 0.09, 6, 16), x, BANK + 2.3, z, { tag: 'scarf', col: '#c0392b', bleed: '#8a2a20', solid: false, hull: true }, 0, Math.PI / 2, 0);
    box(0.16, 0.5, 0.06, x + 0.24, BANK + 2.08, z + 0.38, { tag: 'scarf', col: '#c0392b', bleed: '#8a2a20', solid: false }, 0, 0, 0.2);
    A(GEO.HEMI, x, BANK + 2.98, z, { tag: 'hat', col: '#2f5f9a', bleed: '#1f4277', hull: true, solid: false }, 0, 0, 0, [0.4, 0.34, 0.4]);
    A(GEO.SPH, x, BANK + 3.36, z, { tag: 'hat', col: '#f6f1e6', solid: false, hull: true }, 0, 0, 0, 0.1);
  });
  orb('snjegovic', [6, BANK + 1.6, 14], 2.2, ['snowman'], 'close', BANK + 3.6, { front: 0, near: { p: [7.8, BANK + 0.5, 16.4], r: 2.4 }, at: V(4.2, BANK + 3.4, 15.4) });
  orb('mrkva', [6, BANK + 2.72, 14.6], 0.5, ['carrot'], 'close', BANK + 3, { requires: ['snjegovic'], front: 0, near: { p: [7.8, BANK + 0.5, 16.4], r: 2.4 }, at: V(7.6, BANK + 3.4, 15.2) });
  orb('sal', [6, BANK + 2.25, 14], 0.8, ['scarf'], 'close', BANK + 2.6, { requires: ['snjegovic'], front: 0, near: { p: [7.8, BANK + 0.5, 16.4], r: 2.4 }, at: V(4.6, BANK + 3.2, 15.6) });
  orb('kapa', [6, BANK + 3.1, 14], 0.7, ['hat'], 'close', BANK + 3.5, { requires: ['snjegovic'], front: 0, near: { p: [7.8, BANK + 0.5, 16.4], r: 2.4 } });
  b.object(() => {
    const IG = { tag: 'igloo', col: '#f2f8fd', bleed: '#b9d2e8', pat: PAT.blocks, ps: 0.9, hatch: 0.3 };
    A(GEO.HEMI, -14, BANK, 46, IG, 0, 0, 0, [2.7, 2.4, 2.7]);
    A(new THREE.CylinderGeometry(1, 1, 1, 12, 1, false, 0, Math.PI), -14, BANK + 0.05, 48.6, IG, Math.PI / 2, 0, Math.PI / 2, [0.95, 1.6, 0.95]);
    box(0.9, 1.0, 0.1, -14, BANK + 0.5, 49.4, { tag: 'igloo', col: '#4a5868', bleed: '#2e3a48', solid: false });
  });
  for (let i = 0; i < 9; i++) A(GEO.SPH, -10.2 + (i % 4) * 0.42 + (i > 3 ? 0.21 : 0) + (i > 6 ? 0.21 : 0), BANK + 0.2 + (i > 3 ? 0.34 : 0) + (i > 6 ? 0.34 : 0), 47.4, { tag: 'snowball', col: '#fbfdff', bleed: '#c8d6e8', hull: true, solid: i < 4 }, 0, 0, 0, 0.21);
  orb('iglu', [-14, BANK + 1.4, 46], 3.2, ['igloo'], 'close', BANK + 2.6, { front: 0 });
  orb('grudva', [-9.6, BANK + 0.5, 47.4], 1.2, ['snowball'], 'close', BANK + 1.2, { near: { p: [-8.2, BANK + 0.5, 49.4], r: 2.4 } });

  // ---------- the tea table by the hotel, skis and poles in the snow ----------
  b.object(() => {
    const T = { tag: 'table', col: '#8a6646', bleed: '#6a4c34', pat: PAT.planks, ps: 3 };
    box(2.2, 0.1, 1.1, 12, BANK + 0.82, -16, T); for (const [dx, dz] of [[-0.95, -0.45], [-0.95, 0.45], [0.95, -0.45], [0.95, 0.45]]) box(0.1, 0.8, 0.1, 12 + dx, BANK + 0.4, -16 + dz, { ...T, solid: false });
    for (const s of [-1, 1]) box(2.2, 0.08, 0.36, 12, BANK + 0.46, -16 + s * 0.95, T);
    for (const [dx, dz, c] of [[-0.6, 0.15, '#c0392b'], [-0.15, -0.2, '#2f5f9a'], [0.35, 0.18, '#4f8068']]) {
      A(GEO.CYL12, 12 + dx, BANK + 0.97, -16 + dz, { tag: 'mug', col: c, bleed: c, hull: true, solid: false }, 0, 0, 0, [0.09, 0.2, 0.09]);
      A(GEO.CYL12, 12 + dx, BANK + 1.065, -16 + dz, { tag: 'tea', col: '#b8792e', bleed: '#8a5420', solid: false, ink: false, hatch: 0 }, 0, 0, 0, [0.08, 0.01, 0.08]);
      for (let k = 0; k < 2; k++) A(GEO.SPH, 12 + dx + k * 0.04, BANK + 1.2 + k * 0.17, -16 + dz, { tag: 'tea', col: '#f4f6f8', bleed: '#d8dee6', solid: false, ink: false, hatch: 0 }, 0, 0, 0, 0.06 + k * 0.025);
    }
    A(GEO.CYL12, 12.8, BANK + 1.1, -16.2, { tag: 'thermos', col: '#b8452c', bleed: '#8a3020', hull: true, solid: false }, 0, 0, 0, [0.1, 0.46, 0.1]);
    A(GEO.CYL12, 12.8, BANK + 1.36, -16.2, { tag: 'thermos', col: '#c9ccd0', bleed: '#9a9ea4', solid: false, ink: false }, 0, 0, 0, [0.11, 0.06, 0.11]);
    for (const [s, c] of [[-0.25, '#d9453a'], [0.08, '#2f5f9a']]) for (const k of [0, 1]) box(0.09, 1.75, 0.03, 34 + s + k * 0.13, BANK + 0.85, -19.8, { tag: 'skis', col: c, bleed: c, solid: false }, 0, -0.08, 0.06 * (k ? 1 : -1));
    for (const k of [0, 1]) A(GEO.CYL, 34.75 + k * 0.18, BANK + 0.7, -19.7, { tag: 'poles', col: '#3a3e42', solid: false }, 0, 0.06, (k ? 1 : -1) * 0.08, [0.02, 1.4, 0.02]);
  });
  orb('sto', [12, BANK + 0.82, -16], 1.4, ['table'], 'close', BANK + 1.4, { near: { p: [12, BANK + 0.5, -13.4], r: 2.4 }, at: V(10.2, BANK + 2.6, -14.8) });
  orb('solja', [11.8, BANK + 0.97, -16], 0.8, ['mug', 'coffee'], 'close', BANK + 1.2, { requires: ['sto'], near: { p: [12, BANK + 0.5, -13.4], r: 2.4 }, at: V(13.4, BANK + 2.6, -14.6) });
  orb('caj', [11.8, BANK + 1.1, -16], 0.7, ['tea'], 'close', BANK + 1.4, { requires: ['solja'], near: { p: [12, BANK + 0.5, -13.4], r: 2.4 }, at: V(11.4, BANK + 2.8, -14.2) });
  orb('termos', [12.8, BANK + 1.1, -16.2], 0.6, ['thermos'], 'close', BANK + 1.4, { requires: ['sto'], near: { p: [12, BANK + 0.5, -13.4], r: 2.4 }, at: V(14.2, BANK + 2.6, -15.6) });
  orb('skije', [34, BANK + 0.9, -19.8], 1.3, ['skis'], 'close', BANK + 1.8, { near: { p: [34, BANK + 0.5, -17.2], r: 2.4 }, at: V(32.6, BANK + 2.8, -18.6) });
  orb('stapovi', [34.8, BANK + 0.7, -19.7], 1.0, ['poles'], 'close', BANK + 1.5, { requires: ['skije'], near: { p: [34, BANK + 0.5, -17.2], r: 2.4 }, at: V(36.2, BANK + 2.6, -18.6) });

  // ---------- the woodcutter by his woodpile, the path being cleared, the signpost, the bird feeder ----------
  b.object(() => {
    const W = { tag: 'firewood', col: '#9a6a42', bleed: '#6a4630', edge: 40 };
    for (let r = 0; r < 4; r++) for (let i = 0; i < 7 - (r % 2); i++) A(GEO.CYL, -37.6 + i * 0.36 + (r % 2) * 0.18, BANK + 0.18 + r * 0.32, -18.4, W, 0, Math.PI / 2, 0, [0.17, 1.1, 0.17]);
    A(GEO.CYL12, -28, BANK + 0.3, -12.8, { ...W, col: '#7a5636' }, 0, 0, 0, [0.38, 0.6, 0.38]);
  });
  orb('drva', [-36.5, BANK + 0.8, -18.4], 2.2, ['firewood'], 'close', BANK + 1.8, { near: { p: [-36.5, BANK + 0.5, -15.6], r: 2.4 }, front: 0 });
  orb('cijepati', [-28, BANK + 1, -14], 1.6, ['chop'], 'close', BANK + 2.2, { near: { p: [-25.6, BANK + 0.5, -13], r: 2.4 }, at: V(-29.8, BANK + 2.8, -14.8) });
  orb('sjekira', [-28, BANK + 1.4, -13.6], 0.9, ['axe'], 'close', BANK + 1.9, { requires: ['cijepati'], near: { p: [-25.6, BANK + 0.5, -13], r: 2.4 }, at: V(-26.4, BANK + 2.8, -14.6) });
  orb('cistiti', [2, BANK + 1, -8], 1.6, ['clear'], 'close', BANK + 2.2, { near: { p: [4.2, BANK + 0.5, -6.6], r: 2.4 }, at: V(0.4, BANK + 2.8, -7.2) });
  orb('lopata', [2, BANK + 0.4, -7.4], 1.0, ['shovel'], 'close', BANK + 1.2, { requires: ['cistiti'], near: { p: [4.2, BANK + 0.5, -6.6], r: 2.4 } });
  b.object(() => {
    A(GEO.CYL, -2, BANK + 1.6, 34, { tag: 'sign', col: '#7a5636', bleed: '#5f4028' }, 0, 0, 0, [0.08, 3.2, 0.08]);
    for (const [y, a, c] of [[2.8, 0.6, '#f2c230'], [2.35, -0.9, '#c0392b'], [1.9, 2.2, '#2f5f9a']]) box(1.5, 0.32, 0.06, -2 + Math.cos(a) * 0.7, BANK + y, 34 - Math.sin(a) * 0.7, { tag: 'sign', col: c, bleed: c, solid: false }, a);
    A(GEO.CYL, -18, BANK + 1.1, 30, { tag: 'feeder', col: '#7a5636', bleed: '#5f4028' }, 0, 0, 0, [0.06, 2.2, 0.06]);
    box(0.7, 0.08, 0.7, -18, BANK + 2.2, 30, { tag: 'feeder', col: '#9a6a42', bleed: '#6a4630' });
    A(GEO.CONE4, -18, BANK + 2.75, 30, { tag: 'feeder', col: '#c0392b', bleed: '#8a2a20' }, Math.PI / 4, 0, 0, [0.6, 0.5, 0.6]);
    for (const [dx, dz] of [[-0.25, -0.25], [0.25, 0.25]]) box(0.05, 0.42, 0.05, -18 + dx, BANK + 2.43, 30 + dz, { tag: 'feeder', col: '#7a5636', solid: false });
  });
  orb('putokaz', [-2, BANK + 2.4, 34], 1.8, ['sign'], 'close', BANK + 3.4, { near: { p: [0.2, BANK + 0.5, 35.4], r: 2.4 } });
  orb('hranilica', [-18, BANK + 2.4, 30], 1.2, ['feeder'], 'close', BANK + 3.2, { near: { p: [-16, BANK + 0.5, 31.6], r: 2.4 } });

  // ---------- the snowplough on the road ----------
  const plough = b.object(() => {
    const P = { tag: 'plough', col: '#e8a22e', bleed: '#c47a1e', hull: true, ink: false };
    const body = box(5.2, 2.4, 2.5, 46, BANK + 1.5, 74, { ...P, solid: true });
    box(2.2, 1.6, 2.4, 49.2, BANK + 3.2, 74, { ...P, solid: false }); box(1.9, 0.9, 0.05, 49.2, BANK + 3.4, 75.22, { ...P, col: '#4a5f72', bleed: '#2e4052', solid: false, hull: false });
    box(0.3, 1.1, 3.6, 51.5, BANK + 0.6, 74, { ...P, col: '#c0392b', bleed: '#8a2a20', solid: false }, 0.35);
    for (const [dx, dz] of [[-1.6, -1.3], [-1.6, 1.3], [1.6, -1.3], [1.6, 1.3]]) A(GEO.CYL16, 46 + dx, BANK + 0.5, 74 + dz, { ...P, col: '#2a2826', bleed: '#1a1816', solid: false }, 0, Math.PI / 2, 0, [0.5, 0.35, 0.5]);
    return body;
  });
  orb('ralica', [47, BANK + 2, 74], 4, ['plough'], 'close', BANK + 5, { front: 0 });

  // ---------- the forest: pines with snow, an owl, a fox, a deer and its tracks ----------
  tag('tree').hullWidth = 1.6;
  const pines = [];
  const clearOf = (x, z) => !(z > -66 && z < 82 && x > -96 && x < 96) && !(x > -6 && x < 46 && z < -56) && !(x > 50 && x < 70 && z < -50) && !(x > -70 && x < -54 && z < -56);
  for (let i = 0; i < 900 && pines.length < 300; i++) {
    const x = rr(-160, 160), z = rr(-235, 150); if (!clearOf(x, z) || pines.some((p) => Math.hypot(p[0] - x, p[1] - z) < 3.6)) continue;
    pines.push([x, z]); K.pine(x, z, rr(0.9, 1.4), { y: yAt(z) - 0.2, snow: true, tag: 'tree' });
  }
  for (const [x, z] of [[-60, -42], [-74, -30], [-48, -50], [72, -40], [62, -52], [-90, 20], [92, 30], [-20, 90], [40, 92]]) { K.pine(x, z, 1.2, { y: yAt(z) - 0.2, snow: true, tag: 'tree' }); pines.push([x, z]); }
  // small groups of pines between the cabins, clear of everything built
  const busy = [[-10, 26, 7], [-36, 18, 12], [6, 14, 3], [-14, 46, 5], [24, -28, 15], [12, -16, 4], [34, -20, 3], [-28, -14, 4], [-36, -20, 6], [2, -8, 3], [-2, 34, 3], [-18, 30, 3], [47, 74, 8], [-44, -16, 9], [-52, -40, 6], [64, -44, 3], [-72.6, -30, 3], [LIFT_X, LIFT_Z0, 8], [4, 32, 4]];
  for (const c of [[-30, 5], [10, -45], [-70, -10], [70, 20], [40, 50], [-46, 60], [80, 64], [-80, 72], [26, 70]]) for (let k = 0; k < 5; k++) {
    const x = c[0] + rr(-6, 6), z = c[1] + rr(-6, 6);
    if (busy.some(([bx, bz, r]) => Math.hypot(bx - x, bz - z) < r + 3) || cabins.some((h) => Math.hypot(h.x - x, h.z - z) < 7) || pines.some((p) => Math.hypot(p[0] - x, p[1] - z) < 3.4) || (z > 66 && z < 82)) continue;
    pines.push([x, z]); K.pine(x, z, rr(0.8, 1.15), { y: BANK - 0.2, snow: true, tag: 'tree' });
  }
  orb('bor', [-60, BANK + 5, -42], 4, ['tree'], 'combo', BANK + 10.4, { near: { p: [-57, BANK + 0.5, -39], r: 3 } });
  tag('tree').holdRest = 2.9;
  b.object(() => {
    box(1.6, 0.16, 0.16, -73.1, BANK + 4.2, -30, { tag: 'tree', col: '#6a4a30', bleed: '#4a3220' });
    const O = { tag: 'owl', col: '#9a7a5a', bleed: '#6a5038', hull: true, solid: false };
    A(GEO.SPH, -72.6, BANK + 4.62, -30, O, 0, 0, 0, [0.26, 0.34, 0.24]); A(GEO.SPH, -72.6, BANK + 5.05, -29.96, O, 0, 0, 0, [0.22, 0.2, 0.2]);
    for (const s of [-1, 1]) { A(GEO.SPH, -72.6 + s * 0.09, BANK + 5.07, -29.78, { tag: 'owl', col: '#f2c230', solid: false, ink: false }, 0, 0, 0, 0.06); A(GEO.CONE4, -72.6 + s * 0.13, BANK + 5.27, -29.96, O, 0, 0, s * -0.3, [0.05, 0.12, 0.05]); }
  });
  orb('sova', [-72.6, BANK + 4.8, -30], 1.0, ['owl'], 'close', BANK + 5.6, { front: 0, near: { p: [-71, BANK + 0.5, -27.6], r: 2.6 }, at: V(-71.2, BANK + 6.2, -29.2) });
  b.object(() => {
    const F = { tag: 'fox', col: '#d9662a', bleed: '#a84a1e', hull: true, solid: false }, x = 64, z = -44;
    A(GEO.SPH, x, BANK + 0.42, z, F, 0, 0, 0, [0.24, 0.32, 0.36]); A(GEO.SPH, x, BANK + 0.82, z + 0.16, F, 0, 0, 0, [0.18, 0.17, 0.2]);
    A(GEO.CONE8, x, BANK + 0.8, z + 0.38, F, 0, Math.PI / 2, 0, [0.07, 0.18, 0.07]); for (const s of [-1, 1]) A(GEO.CONE4, x + s * 0.1, BANK + 1.0, z + 0.12, F, 0, 0, 0, [0.06, 0.14, 0.04]);
    A(GEO.SPH, x - 0.1, BANK + 0.18, z - 0.42, F, 0.6, 0, 0, [0.14, 0.13, 0.4]); A(GEO.SPH, x - 0.26, BANK + 0.16, z - 0.76, { ...F, col: '#f6f1e6' }, 0.6, 0, 0, 0.1);
  });
  orb('lisica', [64, BANK + 0.6, -44], 1.0, ['fox'], 'close', BANK + 1.4, { front: 0, near: { p: [64.6, BANK + 0.5, -41.2], r: 2.6 }, at: V(65.4, BANK + 2.6, -42.4) });
  for (let i = 0; i < 30; i++) { const u = i / 29, x = -50 + u * 14 + Math.sin(u * 5) * 2, z = -36 + u * 44, s = i % 2 ? 0.16 : -0.16; A(GEO.CYL12, x + s, BANK + 0.09, z, { tag: 'tracks', col: '#8fa3b8', bleed: '#6a7f96', solid: false, ink: false, hatch: 0 }, 0.3, 0, 0, [0.09, 0.02, 0.15]); }
  orb('tragovi', [-44, BANK + 0.2, -16], 3, ['tracks'], 'combo', BANK + 0.6, { near: { p: [-41.6, BANK + 0.5, -16], r: 2.6 } });
  orb('jelen', [-52, BANK + 1.2, -40], 2.2, ['deer'], 'close', BANK + 2.6, { near: { p: [-49, BANK + 0.5, -36.6], r: 3 } });

  // ---------- the ski lift: stations, towers, the cable and its chairs ----------
  const lz = (z) => yAt(z) + 7.2;
  b.object(() => {
    const LF = { tag: 'lift', col: '#5d6066', bleed: '#3d4046' };
    for (const [z, y] of [[LIFT_Z0, BANK], [LIFT_Z1, yAt(LIFT_Z1)]]) { box(6, 4, 5, LIFT_X, y + 2, z, { ...LF, col: '#c0392b', bleed: '#8a2a20' }); A(GEO.CYL16, LIFT_X, y + 7.2, z, { ...LF, edge: 50 }, 0, 0, 0, [2.2, 0.4, 2.2]); }
    for (let z = LIFT_Z0 - 22; z > LIFT_Z1 + 10; z -= 24) { box(0.5, 7.4, 0.5, LIFT_X, yAt(z) + 3.7, z, LF); box(4.2, 0.3, 0.3, LIFT_X, yAt(z) + 7.4, z, LF); }
    const len = Math.hypot(LIFT_Z0 - LIFT_Z1, lz(LIFT_Z1) - lz(LIFT_Z0)), a = Math.atan2(lz(LIFT_Z1) - lz(LIFT_Z0), LIFT_Z0 - LIFT_Z1);
    for (const s of [-1, 1]) box(0.06, 0.06, len, LIFT_X + s * 1.9, (lz(LIFT_Z0) + lz(LIFT_Z1)) / 2, (LIFT_Z0 + LIFT_Z1) / 2, { ...LF, solid: false, ink: false }, 0, a);
  });
  // the chairs, one line going up and one coming down (each moved as a whole once the town wakes: see update)
  for (const [s, tg] of [[1, 'chairs'], [-1, 'chairs2']]) b.object(() => {
    for (let z = LIFT_Z0 - 4; z > LIFT_Z1 + 4; z -= CHAIR_GAP) {
      const y = lz(z), C = { tag: tg, col: '#2f5f9a', bleed: '#1f4277', solid: false, hull: true, ink: false };
      A(GEO.CYL, LIFT_X + s * 1.9, y - 0.7, z, { ...C, col: '#3a3e42', hull: false }, 0, 0, 0, [0.03, 1.4, 0.03]);
      box(1.1, 0.1, 0.5, LIFT_X + s * 1.9, y - 1.45, z, C); box(1.1, 0.5, 0.08, LIFT_X + s * 1.9, y - 1.2, z - s * 0.24, C);
    }
  });
  orb('zicara', [LIFT_X, BANK + 5, LIFT_Z0], 7, ['lift', 'chairs', 'chairs2'], 'combo', BANK + 9.8, { wideView: { from: [140, 56, -70], to: [136, 66, -110], look: [LIFT_X, 30, -90], lookTo: [LIFT_X, 50, -160] } });

  // ---------- people (and the deer) ----------
  const people = [
    { kind: 'skate', tag: 'skate', x: -41, y: BANK + 0.15, z: 18, to: [-31, 18.6], speed: 1.6, woman: true, scarf: true },
    { kind: 'sled', tag: 'sledkid', toolTag: 'sled', x: -62, y: yAt(-120), z: -120, sc: 0.66, run: { from: [-62, yAt(-120), -120], to: [-62, BANK, -64], dur: 9 }, still: 0, lift: 0.08 },
    { kind: 'ski', tag: 'skier', x: 20, y: yAt(-200), z: -200, run: { from: [20, yAt(-200), -200], to: [20, yAt(-66), -66], dur: 24 }, still: 0.35, toolCol: '#2f5f9a', lift: 0.06 },
    { kind: 'chop', tag: 'chop', toolTag: 'axe', x: -28, y: BANK + 0.12, z: -14, ry: 0 },
    { kind: 'shovel', tag: 'clear', toolTag: 'shovel', x: 2, y: BANK + 0.12, z: -8, ry: Math.PI },
  ];
  orb('sanke', [-62, yAt(-120) + 0.4, -119.8], 1.2, ['sled'], 'close', yAt(-120) + 1.2, { near: { p: [-59.4, yAt(-118) + 0.5, -118], r: 2.6 }, at: V(-60.2, yAt(-120) + 2.4, -121) });
  orb('sankati', [-62, yAt(-120) + 0.8, -120], 1.4, ['sledkid'], 'close', yAt(-120) + 1.8, { requires: ['sanke'], near: { p: [-59.4, yAt(-118) + 0.5, -118], r: 2.6 }, at: V(-63.6, yAt(-120) + 2.6, -119) });
  const skP = (t) => { const e = t * t * (3 - 2 * t) * 0.25 + t * 0.75; return [20 + Math.sin(e * Math.PI * 5) * 3.2, -200 + 134 * e]; };
  const [skx, skz] = skP(0.35);
  orb('skijas', [skx, yAt(skz) + 1, skz], 2, ['skier'], 'close', yAt(skz) + 2.4, { near: { p: [skx + 3, yAt(skz) + 0.5, skz + 2], r: 3 } });

  K.finish();
  return {
    clouds: K.clouds, colliders: b.colliders, orbs: K.orbs, people, sunPos,
    animals: [{ kind: 'deer', tag: 'deer', x: -52, y: BANK + 0.06, z: -40, ry: 0.6, roam: 3 }],
    start: V(4, 0, 32), fleur: V(0, 56, -14), smoke: cabins.slice(0, 6).map((c) => c.chimTop).filter(Boolean), parts: { plough },
  };
}

// ---------- the living mountain: snowfall, the lift's chairs, the plough; in the finale, a torchlit descent ----------
let flakes = null, torches = null, torchT = -1, ploughX = 0, ploughDir = 1;
function setup(scene) {
  const g = new THREE.SphereGeometry(0.07, 5, 4), m = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  flakes = Array.from({ length: 420 }, () => { const f = new THREE.Mesh(g, m); f.visible = false; scene.add(f); return { f, x: 0, y: -1e3, z: 0, s: 0.6 + Math.random() * 0.8, ph: Math.random() * 6 }; });
  const tg = new THREE.SphereGeometry(0.22, 8, 6), tm = new THREE.MeshBasicMaterial({ color: '#ffb23a' });
  torches = Array.from({ length: 26 }, () => { const t = new THREE.Mesh(tg, tm); t.visible = false; scene.add(t); return t; });
}
export default {
  id: 'jahorina', name: 'Jahorina', WORDS, ORDER, CULTURE, art,
  bounds: { boundsRadius: 268, ceiling: 140 },      // (the slope reaches 230 m north, the peak above 90 m)
  build(scene) { const w = build(scene); setup(scene); return w; },
  text: {
    firstHint: 'fly to the glowing orb and land on the little cabin',
    first: 'New orbs have appeared all over Jahorina. Find them in any order.',
    last: { id: 'vrh', msg: 'Only the peak is left. Its orb is waiting at the top of the mountain.' },
    fleur: 'Something golden is shining high above the village. Fly through it.',
    awake: 'Jahorina has awakened. You can now explore it freely.',
  },
  finale: {
    word: 'zima', photo: { from: V(70, 40, 70), to: V(10, 20, -40) }, paints: ['cloud'],
    P: [[2, 14, 46, 6], [4.5, 30, 34, 24], [7, 4, 22, 30], [9.5, -30, 20, 14], [12, -20, 24, -30], [14, 40, 34, -60], [16.5, 58, 52, -120], [19, 50, 74, -180], [21.5, 20, 92, -226], [24, -14, 96, -200], [26, -24, 90, -150], [28, -20, 80, -100]],
    shots: [
      { t0: 0, t1: 7.5, from: V(24, 30, 50), to: V(18, 34, 44), lookFrom: V(-60, 62, -80), lookTo: V(-75, 60, -92) },
      { t0: 7.5, t1: 14, from: V(70, 50, 100), to: V(36, 44, 90), lookFrom: V(0, 14, 4), lookTo: V(-6, 12, -10) },
      { t0: 14, t1: 21, from: V(-34, 26, -30), to: V(-30, 24, -40), lookFrom: V(20, 50, -150), lookTo: V(20, 36, -110) },
      { t0: 21, t1: 26, from: V(60, 36, 60), to: V(46, 40, 48), lookFrom: V(0, 16, -10), lookTo: V(10, 30, -80) },
    ],
    // at sunset the skiers carry torches down the piste in a long winding line
    climax() { torchT = 0; },
  },
  onAlive() { for (const f of flakes) f.f.visible = true; },
  update(dt, time, life, c) {
    if (torchT >= 0) {      // the torchlit descent: down the piste in a winding line
      torchT += dt;
      torches.forEach((t, i) => { const u = Math.min(1, Math.max(0, (torchT - i * 0.55) / 22)); if (u <= 0 || u >= 1) { t.visible = false; return; } const z = -224 + 160 * u, x = 20 + Math.sin(u * Math.PI * 5) * 9; t.visible = true; t.position.set(x, yAt(z) + 1.4, z); t.scale.setScalar(1 + Math.sin(time * 9 + i) * 0.15); });
      if (torchT > 40) { torchT = -1; for (const t of torches) t.visible = false; }
    }
    if (life < 0.5) return;
    const p = c.flight.pos;
    for (const f of flakes) {      // snow falls around the bird
      f.y -= dt * f.s * 1.6; f.x += Math.sin(time * 0.7 + f.ph) * dt * 0.4;
      if (f.y < p.y - 14 || f.y < BANK - 1 || Math.hypot(f.x - p.x, f.z - p.z) > 34) { const a = Math.random() * 6.28, r = Math.random() * 32; f.x = p.x + Math.cos(a) * r; f.z = p.z + Math.sin(a) * r; f.y = p.y + Math.random() * 18 + (f.y < -900 ? -6 : 6); }
      f.f.position.set(f.x, f.y, f.z);
    }
    // the chairs: the line going up moves up, the other comes down
    const dz = LIFT_Z1 - LIFT_Z0, dy = yAt(LIFT_Z1) - yAt(LIFT_Z0), len = Math.hypot(dz, dy), off = (time * 2) % CHAIR_GAP;
    for (const [tg, sg] of [['chairs', 1], ['chairs2', -1]]) { const t = tag(tg); for (const m of [t.mesh, t.hullMesh]) if (m) m.position.set(0, sg * off * dy / len, sg * off * dz / len); }
    // the plough, up and down the road
    ploughX += ploughDir * dt * 3; if (ploughX > 30 || ploughX < -120) { ploughDir *= -1; ploughX = Math.max(-120, Math.min(30, ploughX)); }
    const pt = tag('plough'); for (const m of [pt.mesh, pt.hullMesh]) if (m) { m.position.x = ploughX; m.rotation.y = 0; }
    const body = c.world.parts.plough; if (body) { body.matrixWorld.copy(body.matrix); body.matrixWorld.elements[12] += ploughX; }
  },
  ambience: { murmur: [[-36, 18, 18], [24, -20, 26]], water: () => 0 },
};
