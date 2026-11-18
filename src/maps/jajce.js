// Jajce (spring): the old town on its rock, the Pliva flowing through it from the lake with its little watermills and
// falling over the edge into the pool below, a rainbow over the falls, the fortress on its hill, and below the town the
// spring meadow with a farm, beehives, lambs and a kite. North is -z. The town is at BANK, the meadow and pool below at LOW.
import * as THREE from 'three';
import { makeKit, BANK, GEO, PAL, triGeo } from '../kit.js';
import { tag, PAT } from '../paper.js';
import { WORDS, ORDER, CULTURE } from './jajce-words.js';
import art from '../../assets/journal-jajce.jpg';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const LOW = 1, EDGE = 28, WY = BANK + 0.06;          // the meadow's height, the edge of the town's rock, the stream's surface
const BLOSSOM = [['#f6dce6', '#e8a8c0'], ['#fbeef2', '#eec2d2'], ['#f2c6d6', '#e29ab6'], ['#fff6f8', '#f0d0dc']];

function build(scene) {
  const K = makeKit(scene, { seed: 59 }), { A, box, slab, orb, pick, rr, R, b } = K;
  const sunPos = K.sky({ col: '#f8c88a', bleed: '#7ab0e0', sun: '#ffd84a', sunBleed: '#ffb23a' });
  for (const [x, y, z, s] of [[-120, 74, -170, 7], [90, 80, -200, 9], [170, 64, 40, 7], [-180, 70, 70, 8], [20, 86, 220, 8], [-50, 82, -260, 10], [120, 74, -90, 6], [-80, 62, 120, 5]]) K.cloud(x, y, z, s);

  // ---------- ground: the town's rock, the meadow below it ----------
  tag('street').mode = 'one'; tag('street').radius = 160; tag('meadow').mode = 'one'; tag('meadow').radius = 220; tag('lake').mode = 'one'; tag('lake').radius = 80;
  box(240, 11, 180, 0, BANK - 5.5, EDGE - 90, { tag: 'street', col: '#d6cfbe', bleed: '#b0a792', pat: PAT.blocks, ps: 0.3 });
  box(240, 0.3, 4, 0, BANK + 0.01, EDGE - 2, { tag: 'rock', col: '#b9ad96', bleed: '#8e8270', solid: false });
  for (const [x0, x1] of [[-120, -3.2], [3.2, 120]]) box(x1 - x0, BANK - LOW + 0.2, 0.6, (x0 + x1) / 2, (BANK + LOW) / 2, EDGE + 0.3, { tag: 'rock', col: '#a89a82', bleed: '#7e7262', pat: PAT.blocks, ps: 0.25, solid: false });      // the rock face under the town
  for (let x = -116; x <= 116; x += 7) if (Math.abs(x) > 7) A(GEO.DODE, x + rr(-2, 2), LOW + 0.4, EDGE + 1.4 + rr(0, 1), { tag: 'rock', col: pick(PAL.BOULDERS)[0], bleed: '#6d665d' }, R() * 6, 0, 0, [rr(0.8, 1.6), rr(0.6, 1.1), rr(0.7, 1.2)]);      // and rocks fallen at its foot
  box(240, 4, 120, 0, LOW - 2, EDGE + 60, { tag: 'meadow', col: '#8fc062', bleed: '#6aa04a', pat: PAT.grass });
  K.hills([[-300, 280, 160, 80, '#8fbc6a'], [20, 360, 210, 100, '#9cc874'], [300, 260, 170, 85, '#86b462'], [400, -60, 180, 95, '#94c06c'], [-400, -80, 190, 100, '#8ab866'], [-200, -400, 190, 90, '#9ac472'], [200, -410, 200, 95, '#88b464']], { tag: 'farhill', bleed: '#5f8a48', y: LOW });

  // ---------- the lake with its watermills, the stream through the town, the little bridge ----------
  const WATER = { pat: PAT.water, hatch: 0, water: true, ink: false };
  A(GEO.CYL16, -50, WY, -44, { ...WATER, tag: 'lake', col: '#4fa3a0', bleed: '#2f7f86', edge: 50 }, 0, 0, 0, [20, 0.1, 14]);
  slab(-36, 3, -33, -27, { ...WATER, tag: 'river', col: '#5fb0ac', bleed: '#3f8a8a' }, WY, 0.1);       // the stream from the lake
  slab(-3, 3, -33, EDGE, { ...WATER, tag: 'river', col: '#5fb0ac', bleed: '#3f8a8a' }, WY, 0.1);         // the Pliva through the town
  for (let z = -30; z < EDGE - 2; z += 3.4) for (const s of [-1, 1]) A(GEO.DODE, s * 3.4, BANK + 0.2, z + rr(-0.8, 0.8), { tag: 'rock', col: pick(PAL.BOULDERS)[0], bleed: '#6d665d' }, R() * 6, 0, 0, [rr(0.5, 0.8), 0.4, rr(0.6, 0.9)]);
  const mills = [];
  for (const x of [-28, -21.5, -15, -8.5]) b.object(() => {      // the mlinčići: little wooden huts on stilts over the stream, each with its wheel
    const M = { tag: 'mill', col: '#8a6446', bleed: '#664630', pat: PAT.planks, ps: 2.4 };
    for (const [dx, dz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) A(GEO.CYL, x + dx, BANK + 0.5, -30 + dz, { ...M, pat: 0 }, 0, 0, 0, [0.09, 1, 0.09]);
    box(2.6, 2.1, 2.6, x, BANK + 2.05, -30, M);
    A(roofSteep(), x, BANK + 3.1, -30, { tag: 'mill', col: '#6e5440', bleed: '#523e30', pat: PAT.roof, ps: 1.4 });
    A(GEO.CYL16, x - 1.55, BANK + 0.9, -30, { tag: 'wheel', col: '#7a5636', bleed: '#5a3e26', edge: 50 }, 0, 0, Math.PI / 2, [0.85, 0.16, 0.85]);
    mills.push(x);
  });
  orb('mlin', [-15, BANK + 3, -30], 3, ['mill'], 'combo', BANK + 4.8, { stage: 0 });
  tag('mill').holdRest = 2.9;
  orb('tocak', [-16.55, BANK + 0.9, -30], 1.4, ['wheel'], 'combo', BANK + 2, { requires: ['mlin'], near: { p: [-16.6, BANK + 0.5, -26.8], r: 2.4 }, at: V(-17.4, BANK + 2.8, -27.4) });
  tag('wheel').holdRest = 2.9;
  orb('jezero', [-56, WY, -46], 12, ['lake'], 'close', BANK + 0.6, { swim: { p: [-58, WY, -48], r: 10 } });
  b.object(() => {
    const W = { tag: 'footbridge', col: '#9a6a42', bleed: '#6a4630', pat: PAT.planks, ps: 4 };
    box(8.4, 0.22, 2.4, 0, BANK + 0.5, -8, W); for (const s of [-1, 1]) for (const dx of [-3.8, -1.3, 1.3, 3.8]) A(GEO.CYL, dx, BANK + 1.0, -8 + s * 1.1, { ...W, pat: 0, solid: false }, 0, 0, 0, [0.05, 1, 0.05]);
    for (const s of [-1, 1]) box(8.2, 0.08, 0.08, 0, BANK + 1.45, -8 + s * 1.1, { ...W, pat: 0, solid: false });
  });
  orb('mostic', [0, BANK + 0.8, -8], 3, ['footbridge'], 'close', BANK + 1.6, { front: Math.PI / 2 });

  // ---------- the waterfall into the pool below, the rainbow over it ----------
  tag('waterfall').mode = 'one'; tag('waterfall').radius = 8;
  box(6.4, BANK + 0.06 - LOW, 0.6, 0, (BANK + LOW) / 2, EDGE + 0.4, { tag: 'waterfall', col: '#a8dcd8', bleed: '#4fa9ac', pat: PAT.fall, hatch: 0, solid: false, ink: false });
  A(GEO.CYL16, 0, LOW + 0.05, 45, { ...WATER, tag: 'pool', col: '#4fa3a0', bleed: '#2f7f86', edge: 50 }, 0, 0, 0, [16, 0.1, 13]);
  for (let i = 0; i < 9; i++) A(GEO.ICO, rr(-3, 3), LOW + 0.15, EDGE + 1.6 + rr(0, 2), { tag: 'foam', col: '#f4fbf8', bleed: '#cfe9e6', hull: true, hatch: 0, solid: false, sway: 10.1 }, R() * 6, 0, 0, [rr(0.6, 1), 0.3, rr(0.6, 1)]);
  orb('slap', [0, 7, EDGE + 0.5], 6, ['waterfall'], 'close', BANK + 1.4, { front: 0, near: { p: [5.6, BANK + 0.5, EDGE - 2.6], r: 2.6 }, at: V(5.8, BANK + 2.6, EDGE - 1.6) });
  const RB = ['#e0453a', '#ee7a2e', '#f2c230', '#6cb46a', '#3f8fd0', '#4a5fb0', '#8f6fd0'];
  b.object(() => RB.forEach((c, i) => A(new THREE.TorusGeometry(19 - i * 0.62, 0.32, 6, 48, Math.PI), 0, LOW, 54, { tag: 'rainbow', col: c, bleed: c, hatch: 0, ink: false, solid: false })));
  orb('duga', [0, LOW + 17, 54], 12, ['rainbow'], 'close', LOW + 4, { front: Math.PI, at: V(0, BANK + 6, EDGE - 6), near: { p: [-6, BANK + 0.5, EDGE - 3], r: 3 } });

  // ---------- the willow and the ducks on the lake ----------
  b.object(() => {
    const W = { tag: 'willow', col: '#9cc870', bleed: '#74a850' };
    A(GEO.TAPER, -30, BANK + 2.2, -64, { ...W, col: '#7a6248', bleed: '#5a4634', edge: 50 }, 0, 0, 0, [0.5, 4.4, 0.5]);
    for (const [px, py, pz, r] of [[0, 5.4, 0, 2.6], [-1.8, 4.2, 0.6, 2], [1.7, 4.4, -0.5, 2.1], [0.2, 4.1, 1.8, 1.9], [-0.3, 4.2, -1.8, 1.9]]) A(GEO.ICO, -30 + px, BANK + py, -64 + pz, { ...W, hull: true, sway: (v) => 0.04 * Math.max(0, BANK + 6 - v.y) }, R() * 6, 0, 0, [r, r * 1.2, r]);
  });
  orb('vrba', [-30, BANK + 4.5, -64], 4, ['willow'], 'close', BANK + 8.6);
  b.object(() => {
    const D = { tag: 'duck', col: '#a8825a', bleed: '#7a5a3a', hull: true, solid: false, sway: 0.03 }, x = -46, z = -44;
    A(GEO.SPH, x, WY + 0.2, z, D, 0, 0, 0, [0.26, 0.2, 0.42]); A(GEO.SPH, x, WY + 0.48, z + 0.3, { ...D, col: '#3f7a55', bleed: '#2a5a3e' }, 0, 0, 0, 0.15);
    A(GEO.CONE8, x, WY + 0.46, z + 0.5, { ...D, col: '#e8a22e' }, 0, Math.PI / 2, 0, [0.06, 0.16, 0.05]);
    for (let i = 0; i < 4; i++) A(GEO.SPH, x - 0.3 + (i % 2) * 0.6, WY + 0.1, z - 0.8 - i * 0.55, { tag: 'duckling', col: '#f2d24a', bleed: '#d9a625', hull: true, solid: false, sway: 0.03 }, 0, 0, 0, [0.12, 0.11, 0.16]);
  });
  orb('patka', [-46, WY + 0.3, -44], 1.2, ['duck'], 'close', BANK + 0.8, { swim: { p: [-46, WY, -41], r: 4 } });
  orb('pacici', [-46, WY + 0.2, -45.6], 1.6, ['duckling'], 'close', BANK + 0.8, { requires: ['patka'], swim: { p: [-46, WY, -41], r: 4 } });

  // ---------- the town: houses round the square, the bell tower, the spring, storks and swallows ----------
  slab(14, 56, -22, 8, { tag: 'street', col: '#c4b39a', bleed: '#9e8a70', pat: PAT.cobble, ps: 1.1 }, BANK + 0.06, 0.12);
  const houses = [];
  for (const [x, z, rot] of [[18, -30, 0], [30, -32, 0], [56, -32, 0], [64, -12, -Math.PI / 2], [64, 4, -Math.PI / 2], [50, 16, Math.PI], [34, 18, Math.PI], [18, 16, Math.PI], [8, -40, 0],
    [-16, 8, Math.PI / 2], [-30, 14, Math.PI / 2], [-18, -8, Math.PI / 2], [-40, -6, 0], [-60, 4, Math.PI / 2], [-76, -20, 0], [80, -36, 0], [86, 12, -Math.PI / 2], [-50, 20, Math.PI]])
    houses.push(K.house({ x, z, rot, w: rr(6.5, 8), d: rr(6, 7), h: rr(5, 6.6), rh: 2.5, roof: 'hip', kind: 'tile' }));
  orb('grad', [34, BANK + 5, 18], 9, ['house', 'roof', 'window', 'door', 'chimney'], 'combo', houses[6].top);
  for (const t of ['house', 'roof', 'window', 'door', 'chimney']) tag(t).holdRest = 2.9;
  orb('trg', [36, BANK + 0.2, -6], 10, ['street'], 'combo', BANK + 1, { near: { p: [36, BANK + 0.5, -4], r: 4 } });
  tag('street').holdRest = 2.9;
  b.object(() => {      // the bell tower, its bell in the open belfry
    const T = { tag: 'belltower', col: '#d9cdb2', bleed: '#b4a688', pat: PAT.blocks, ps: 0.7, pool: 1 }, x = 44, z = -14;
    box(4.2, 16, 4.2, x, BANK + 8, z, T);
    for (const [dx, dz] of [[-1.8, -1.8], [-1.8, 1.8], [1.8, -1.8], [1.8, 1.8]]) box(0.6, 3.6, 0.6, x + dx, BANK + 17.8, z + dz, T);
    box(4.6, 0.4, 4.6, x, BANK + 19.8, z, T); A(GEO.CONE4, x, BANK + 21.8, z, { ...T, col: '#8a5a3a', bleed: '#6a4026', pat: PAT.roof, ps: 1 }, Math.PI / 4, 0, 0, [3.4, 3.6, 3.4]);
    A(GEO.HEMI, x, BANK + 17.3, z, { tag: 'bell', col: '#c9a23a', bleed: '#a07a25', hull: true, solid: false }, 0, Math.PI, 0, [0.85, 1.1, 0.85]);
    box(1, 1.1, 0.1, x, BANK + 6, z + 2.15, { ...T, col: '#6a4a30', bleed: '#4a3020', solid: false });
  });
  orb('zvonik', [44, BANK + 9, -14], 8, ['belltower'], 'close', BANK + 25.4, { front: 0 });
  orb('zvono', [44, BANK + 16.6, -14], 1.4, ['bell'], 'close', BANK + 17.4, { requires: ['zvonik'], front: 0, near: { p: [44, BANK + 16.2, -12.2], r: 1.6 }, at: V(46.6, BANK + 18.4, -11.2) });
  b.object(() => {      // a stone spring: water from a spout into a trough
    const I = { tag: 'spring', col: '#d0c6b0', bleed: '#ada38e', pat: PAT.blocks, ps: 0.8 };
    box(2.6, 2.2, 0.5, 24, BANK + 1.1, -21.2, I); box(2.2, 0.6, 0.9, 24, BANK + 0.3, -20.5, I);
    A(GEO.CYL, 24, BANK + 1.3, -20.8, { ...I, col: '#8a8f86' }, 0, Math.PI / 2, 0, [0.06, 0.5, 0.06]);
    box(0.06, 0.95, 0.06, 24, BANK + 0.8, -20.55, { tag: 'spring', col: '#9fd6d2', bleed: '#4fa9ac', solid: false, ink: false, hatch: 0 });
  });
  orb('izvor', [24, BANK + 1.1, -21], 2, ['spring'], 'close', BANK + 2.4, { front: 0, near: { p: [24, BANK + 0.5, -18.2], r: 2.4 } });
  // a stork on its nest on a chimney, swallows by their mud nest under the eaves
  const sh = houses[3], st = sh.chimTop;
  b.object(() => {
    A(GEO.CYL16, st.x, st.y + 0.25, st.z, { tag: 'nest', col: '#8a6a44', bleed: '#6a4c2c', pat: PAT.planks, ps: 6, edge: 50 }, 0, 0, 0, [0.95, 0.35, 0.95]);
    const SK = { tag: 'stork', col: '#fbf7ec', bleed: '#d8d0bc', hull: true, solid: false };
    A(GEO.SPH, st.x, st.y + 0.9, st.z, SK, 0, 0, 0, [0.28, 0.3, 0.5]); A(GEO.SPH, st.x, st.y + 1.35, st.z + 0.38, SK, 0, 0, 0, 0.14);
    for (const s of [-1, 1]) box(0.04, 0.22, 0.5, st.x + s * 0.27, st.y + 0.95, st.z - 0.1, { ...SK, col: '#2a2826' });
    A(GEO.CONE8, st.x, st.y + 1.33, st.z + 0.62, { ...SK, col: '#d9453a', bleed: '#a8302a' }, 0, Math.PI / 2, 0, [0.04, 0.3, 0.04]);
    A(GEO.CYL, st.x, st.y + 1.15, st.z + 0.24, SK, 0, 0.5, 0, [0.06, 0.4, 0.06]);
  });
  orb('roda', [st.x, st.y + 1, st.z], 1.4, ['stork'], 'close', st.y + 1.6, { front: Math.PI / 2 });
  const sw = houses[5];      // its front faces the square (south side of the square, facing -z)
  b.object(() => {
    for (const dx of [-1.6, 1.4]) A(GEO.HEMI, sw.x + dx, BANK + sw.h - 0.05, sw.z - sw.d / 2 - 0.22, { tag: 'nest', col: '#a8825a', bleed: '#7a5a3a', hull: true, solid: false }, 0, Math.PI, 0, [0.32, 0.3, 0.24]);
    for (const dx of [-0.6, 0.4]) {
      const L = { tag: 'swallow', col: '#26345a', bleed: '#18223e', hull: true, solid: false }, y = BANK + sw.h + 0.05, z = sw.z - sw.d / 2 - 0.5;
      A(GEO.SPH, sw.x + dx, y, z, L, 0, 0, 0, [0.09, 0.09, 0.17]); A(GEO.SPH, sw.x + dx, y - 0.03, z - 0.04, { ...L, col: '#f4ece0' }, 0, 0, 0, [0.07, 0.06, 0.12]);
      A(GEO.CONE4, sw.x + dx, y, z + 0.24, L, 0, -Math.PI / 2, 0, [0.06, 0.2, 0.02]);
    }
    box(5, 0.03, 0.03, sw.x, BANK + sw.h - 0.02, sw.z - sw.d / 2 - 0.5, { tag: 'nest', col: '#3a3632', solid: false, ink: false });
  });
  orb('lasta', [sw.x - 0.1, BANK + sw.h, sw.z - sw.d / 2 - 0.5], 1.2, ['swallow'], 'close', BANK + sw.h + 0.6, { front: Math.PI, near: { p: [sw.x, BANK + 0.5, sw.z - sw.d / 2 - 2.6], r: 2.6 }, at: V(sw.x + 2.6, BANK + sw.h + 1.8, sw.z - sw.d / 2 - 1.2) });
  orb('gnijezdo', [sw.x, BANK + sw.h - 0.1, sw.z - sw.d / 2 - 0.22], 1.6, ['nest'], 'close', BANK + sw.h + 0.4, { requires: ['lasta'], front: Math.PI, near: { p: [sw.x, BANK + 0.5, sw.z - sw.d / 2 - 2.6], r: 2.6 }, at: V(sw.x - 2.6, BANK + sw.h + 1.8, sw.z - sw.d / 2 - 1.2) });

  // ---------- the fortress hill: walls, the gate, the catacombs cut into its rock ----------
  box(70, 16, 52, 60, BANK + 8, -100, { tag: 'rock', col: '#b9ad96', bleed: '#8e8270', pat: PAT.blocks, ps: 0.4 });
  slab(25, 95, -126, -74, { tag: 'hilltop', col: '#94c06c', bleed: '#6aa04a', pat: PAT.grass }, BANK + 16.05, 0.1);
  const HT = BANK + 16;
  b.object(() => {
    const Z = { tag: 'walls', col: '#cfc2a4', bleed: '#a89a7a', pat: PAT.blocks, ps: 0.6, pool: 1 };
    box(26, 4.4, 1.6, 40, HT + 2.2, -76, Z); box(26, 4.4, 1.6, 80, HT + 2.2, -76, Z);      // the south wall, either side of the gate
    box(64, 4.4, 1.6, 60, HT + 2.2, -124, Z); for (const x of [28, 92]) box(1.6, 4.4, 48, x, HT + 2.2, -100, Z);
    for (const [x, z] of [[28, -76], [92, -76], [28, -124], [92, -124]]) A(GEO.CYL12, x, HT + 3.4, z, { ...Z, edge: 40 }, 0, 0, 0, [2.4, 6.8, 2.4]);
    for (let i = 0; i < 20; i++) { const x = 28.8 + i * 3.25; if (Math.abs(x - 60) > 7) box(1.2, 0.7, 1.6, x, HT + 4.75, -76, Z); }
  });
  orb('zidine', [60, HT + 2.4, -100], 18, ['walls'], 'close', HT + 7.4, { stage: 2, front: 0 });
  b.object(() => {
    const G = { tag: 'gate', col: '#c4b494', bleed: '#9a8a6a', pat: PAT.blocks, ps: 0.6 };
    for (const s of [-1, 1]) box(2.6, 6, 2.4, 60 + s * 8.3, HT + 3, -76, G);
    box(14, 1.6, 2.4, 60, HT + 5.6, -76, G); box(11.4, 4.6, 0.3, 60, HT + 2.3, -76.4, { tag: 'gate', col: '#7a5236', bleed: '#5a3a22', pat: PAT.planks, ps: 3, solid: false });
  });
  orb('kapija', [60, HT + 3, -76], 6, ['gate'], 'close', HT + 7.4, { requires: ['zidine'], front: 0 });
  b.object(() => {
    const C = { tag: 'catacomb', col: '#bfb39a', bleed: '#94886e', pat: PAT.blocks, ps: 0.8 };
    box(4.6, 4.2, 0.4, 44, BANK + 2.1, -73.8, C); box(2.4, 2.8, 0.1, 44, BANK + 1.4, -73.55, { ...C, col: '#2e2a26', bleed: '#1e1a16', solid: false });
    A(GEO.CYL16, 44, BANK + 2.8, -73.55, { ...C, col: '#2e2a26', bleed: '#1e1a16', solid: false, ink: false }, 0, Math.PI / 2, 0, [1.2, 0.1, 1.2]);
    for (let i = 0; i < 4; i++) box(3.2 - i * 0.2, 0.3, 0.8, 44, BANK + 0.15, -72.8 + i * 0.8 - 0.8, { ...C, solid: true });
  });
  orb('katakombe', [44, BANK + 2, -73.6], 3, ['catacomb'], 'close', BANK + 4.6, { front: 0, near: { p: [44, BANK + 0.5, -70.4], r: 2.6 } });

  // ---------- blossoming cherry trees, in the town and round the meadow ----------
  const cherries = [[-6, -20], [8, -14], [-22, -38], [-40, -22], [-64, -20], [-70, -60], [12, 30.5 - 32], [70, -50], [-84, -4], [26, 24 - 50],
    [-40, 40], [-60, 54], [-80, 70], [30, 60], [60, 52], [78, 74], [-20, 96], [92, 110], [-96, 104], [52, 126]];
  for (const [x, z] of cherries) K.tree(x, z, rr(0.9, 1.2), { col: pick(BLOSSOM), crownTag: 'blossom', trunkTag: 'trunk', y: z > EDGE ? LOW : BANK });
  orb('tresnja', [8, BANK + 4.4, -14], 3.2, ['blossom'], 'combo', BANK + 6.2, { wideView: { from: [80, BANK + 60, 120], to: [-80, BANK + 60, 120], look: [30, BANK, -10], lookTo: [-30, BANK, -10] } });
  tag('blossom').holdRest = 2.9;

  // ---------- the spring meadow: dandelions, a farm with tulips, a scarecrow and hens, beehives, butterflies, lambs, a kite ----------
  orb('livada', [20, LOW + 0.2, 90], 12, ['meadow'], 'combo', LOW + 1, { near: { p: [20, LOW + 0.5, 90], r: 5 } });
  tag('meadow').holdRest = 2.9;
  for (let i = 0; i < 160; i++) { const x = rr(-110, 110), z = rr(EDGE + 6, 136); if (Math.hypot(x, z - 46) < 18) continue; A(GEO.ICO0, x, LOW + 0.12, z, { tag: 'dandelion', col: '#f2c230', bleed: '#d9a625', hull: true, hatch: 0, solid: false }, R() * 6, 0, 0, rr(0.13, 0.2)); }
  orb('maslacak', [-30, LOW + 0.2, 76], 3, ['dandelion'], 'combo', LOW + 0.8, { near: { p: [-28, LOW + 0.5, 78], r: 3 } });
  tag('dandelion').holdRest = 2.9;
  const farm = K.house({ x: -70, z: 88, rot: Math.PI / 2, y: LOW, w: 9, d: 7, h: 5, rh: 2.6, roof: 'gable', kind: 'tile' });
  b.object(() => {      // a bed of tulips in front of the farm
    for (let i = 0; i < 18; i++) { const x = -62 + (i % 6) * 0.7, z = 84 + Math.floor(i / 6) * 1.2, c = ['#e0453a', '#f2c230', '#d94f8a'][i % 3];
      A(GEO.CYL, x, LOW + 0.3, z, { tag: 'tulip', col: '#5a9148', solid: false, ink: false }, 0, 0, 0, [0.025, 0.6, 0.025]);
      A(GEO.CONE8, x, LOW + 0.7, z, { tag: 'tulip', col: c, bleed: c, hull: true, solid: false }, 0, Math.PI, 0, [0.12, 0.26, 0.12]); }
  });
  orb('tulipan', [-60.3, LOW + 0.6, 85.2], 2.2, ['tulip'], 'close', LOW + 1.4, { front: Math.PI / 2, near: { p: [-57.6, LOW + 0.5, 85], r: 2.6 } });
  b.object(() => {      // the scarecrow in the vegetable patch, with its hat
    slab(-66, -54, 96, 106, { tag: 'meadow', col: '#8a6a44', bleed: '#6a4c2c', pat: PAT.planks, ps: 2 }, LOW + 0.05, 0.1);
    const SC = { tag: 'scarecrow', col: '#c9a35a', bleed: '#a07f3a', solid: false };
    A(GEO.CYL, -60, LOW + 1.4, 101, { ...SC, col: '#7a5636' }, 0, 0, 0, [0.07, 2.8, 0.07]); A(GEO.CYL, -60, LOW + 2.2, 101, { ...SC, col: '#7a5636' }, 0, 0, Math.PI / 2, [0.05, 1.8, 0.05]);
    box(0.7, 0.9, 0.35, -60, LOW + 1.85, 101, { ...SC, col: '#b8452c', bleed: '#8a3020', solid: true }); A(GEO.SPH, -60, LOW + 2.6, 101, { ...SC, hull: true }, 0, 0, 0, 0.26);
    A(GEO.CYL12, -60, LOW + 2.84, 101, { tag: 'hat', col: '#e8c46a', bleed: '#c49a34', solid: false, edge: 50 }, 0, 0, 0, [0.5, 0.05, 0.5]); A(GEO.CYL12, -60, LOW + 2.96, 101, { tag: 'hat', col: '#e8c46a', bleed: '#c49a34', solid: false, edge: 50 }, 0, 0, 0, [0.24, 0.26, 0.24]);
  });
  orb('strasilo', [-60, LOW + 2, 101], 1.8, ['scarecrow'], 'close', LOW + 3.4, { front: 0, near: { p: [-57.4, LOW + 0.5, 103], r: 2.6 } });
  orb('sesir', [-60, LOW + 2.9, 101], 0.7, ['hat'], 'close', LOW + 3.4, { requires: ['strasilo'], front: 0, near: { p: [-57.4, LOW + 0.5, 103], r: 2.6 }, at: V(-58.4, LOW + 4.4, 102) });
  orb('saditi', [-55.6, LOW + 1, 98], 1.6, ['plant'], 'close', LOW + 2.2, { near: { p: [-53, LOW + 0.5, 99.4], r: 2.6 }, at: V(-54, LOW + 2.8, 96.6) });
  orb('motika', [-55.6, LOW + 0.4, 98.6], 1.0, ['hoe'], 'close', LOW + 1.2, { requires: ['saditi'], near: { p: [-53, LOW + 0.5, 99.4], r: 2.6 } });
  b.object(() => {      // hens and chicks by the farm, a basket of eggs on a stump
    for (const [x, z, ry] of [[-74, 96, 0.4], [-71.6, 98.4, 2.2], [-76.4, 99.2, -0.8]]) {
      const H = { tag: 'hen', col: '#b8692e', bleed: '#8a4a1e', hull: true, solid: false };
      A(GEO.SPH, x, LOW + 0.35, z, H, ry, 0, 0, [0.22, 0.24, 0.3]); A(GEO.SPH, x + Math.sin(ry) * 0.22, LOW + 0.62, z + Math.cos(ry) * 0.22, H, 0, 0, 0, 0.13);
      A(GEO.CONE4, x + Math.sin(ry) * 0.24, LOW + 0.78, z + Math.cos(ry) * 0.24, { ...H, col: '#d9302a' }, ry, 0, 0, [0.04, 0.1, 0.06]);
    }
    for (let i = 0; i < 5; i++) A(GEO.SPH, -73 + i * 0.5, LOW + 0.13, 101.5 + (i % 2) * 0.4, { tag: 'chick', col: '#f6d84a', bleed: '#d9b02a', hull: true, solid: false }, 0, 0, 0, 0.11);
    A(GEO.CYL12, -78, LOW + 0.3, 94, { tag: 'basket', col: '#7a5636', bleed: '#5a3e26', edge: 40 }, 0, 0, 0, [0.4, 0.6, 0.4]);
    A(GEO.CYL12, -78, LOW + 0.72, 94, { tag: 'basket', col: '#b8904e', bleed: '#8e6a32', pat: PAT.planks, ps: 5, edge: 50 }, 0, 0, 0, [0.38, 0.22, 0.38]);
    for (let i = 0; i < 6; i++) A(GEO.SPH, -78 + Math.cos(i * 1.05) * 0.18, LOW + 0.88, 94 + Math.sin(i * 1.05) * 0.18, { tag: 'egg', col: '#f6ead0', bleed: '#d8c49a', hull: true, solid: false }, i, 0, 0, [0.07, 0.09, 0.07]);
  });
  orb('kokos', [-74, LOW + 0.5, 97.6], 2, ['hen'], 'close', LOW + 1.2, { near: { p: [-70.6, LOW + 0.5, 100], r: 2.6 } });
  orb('pile', [-72, LOW + 0.2, 101.6], 1.4, ['chick'], 'close', LOW + 0.8, { requires: ['kokos'], near: { p: [-70.6, LOW + 0.5, 100], r: 2.6 } });
  orb('jaje', [-78, LOW + 0.9, 94], 0.7, ['egg'], 'close', LOW + 1.4, { near: { p: [-76, LOW + 0.5, 92], r: 2.4 } });
  b.object(() => {      // three painted beehives, with their bees
    for (const [i, c] of [['#3f6f9a', 0], ['#c69a3a', 1], ['#b8452c', 2]].map((a, k) => [k, a[0]])) {
      const x = 30 + i * 2.2, z = 112, H = { tag: 'hive', col: c, bleed: c, pat: PAT.planks, ps: 3 };
      box(1.3, 1.1, 1.1, x, LOW + 0.85, z, H); A(K.GEO.CONE4, x, LOW + 1.62, z, { ...H, col: '#6e5440', bleed: '#523e30', pat: 0 }, Math.PI / 4, 0, 0, [1.05, 0.45, 0.95]);
      box(1.1, 0.3, 0.9, x, LOW + 0.15, z, { ...H, col: '#7a5636', bleed: '#5a3e26', pat: 0 });
    }
    for (let i = 0; i < 14; i++) { const x = 30 + rr(-1.5, 5.9), y = LOW + rr(1.2, 2.6), z = 112 + rr(-1.4, 1.6);
      A(GEO.SPH, x, y, z, { tag: 'bee', col: '#f2c230', bleed: '#2a2826', hull: true, solid: false, sway: 0.25 }, 0, 0, 0, [0.07, 0.06, 0.1]); }
  });
  orb('kosnica', [32.2, LOW + 1, 112], 3, ['hive'], 'close', LOW + 2.6, { front: 0, near: { p: [32.2, LOW + 0.5, 115.4], r: 2.6 } });
  orb('pcela', [32.2, LOW + 2, 112], 2.2, ['bee'], 'close', LOW + 3, { requires: ['kosnica'], front: 0, near: { p: [32.2, LOW + 0.5, 115.4], r: 2.6 }, at: V(34.6, LOW + 3.8, 113.6) });
  orb('pcelar', [37.2, LOW + 1, 114], 1.6, ['beekeeper'], 'close', LOW + 2.2, { near: { p: [39.6, LOW + 0.5, 115], r: 2.4 }, at: V(38.6, LOW + 2.8, 112.8) });
  for (const [x, z, c] of [[-20, 70, '#ee7a2e'], [-12, 82, '#8f6fd0'], [6, 74, '#f2c230'], [16, 96, '#4fa3d0'], [-34, 96, '#e0453a'], [46, 86, '#ee7a2e']]) b.object(() => {
    for (const s of [-1, 1]) A(GEO.CYL12, x + s * 0.13, LOW + 0.5, z, { tag: 'butterfly', col: c, bleed: c, hull: true, solid: false, ink: false, sway: 0.06 }, 0, 0, s * 1.2, [0.16, 0.01, 0.12]);
    A(GEO.CYL, x, LOW + 0.24, z, { tag: 'dandelion', col: '#5a9148', solid: false, ink: false }, 0, 0, 0, [0.02, 0.48, 0.02]);
  });
  orb('leptir', [6, LOW + 0.5, 74], 0.8, ['butterfly'], 'close', LOW + 1.2, { near: { p: [8.4, LOW + 0.5, 75.6], r: 2.4 } });
  b.object(() => {      // the kite, high on its string
    const KT = { tag: 'kite', col: '#d9453a', bleed: '#a8302a', hatch: 0.3, solid: false, sway: 0.4 };
    A(triGeo([0, 1.2, 0], [-0.8, 0, 0], [0.8, 0, 0]), 18, 30, 128, KT); A(triGeo([0, -1.4, 0], [0.8, 0, 0], [-0.8, 0, 0]), 18, 30, 128, { ...KT, col: '#f2c230', bleed: '#d9a625' });
    const a = V(10.4, LOW + 1.7, 110.6), c = V(18, 29.6, 128), d = c.clone().sub(a), L = d.length();
    b.add(GEO.BOX, new THREE.Matrix4().compose(a.clone().add(c).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize()), V(0.03, L, 0.03)), { tag: 'kite', col: '#f6f1e6', solid: false, ink: false });
  });
  orb('zmaj', [18, 30, 128], 2.2, ['kite'], 'close', 31, { front: Math.PI });
  orb('djecak', [10, LOW + 0.8, 110], 1.4, ['kidboy'], 'close', LOW + 1.6, { near: { p: [12.4, LOW + 0.5, 108.6], r: 2.4 }, at: V(8.6, LOW + 2.6, 108.6) });
  A(GEO.CYL, 42.4, LOW + 0.9, 100.4, { tag: 'shepherd', col: '#7a5636', bleed: '#5a3e26', solid: false }, 0, 0, 0.08, [0.04, 1.9, 0.04]);      // the shepherd's staff
  orb('pastir', [42, LOW + 1, 100], 1.6, ['shepherd'], 'close', LOW + 2.2, { near: { p: [39.4, LOW + 0.5, 101.6], r: 2.4 }, at: V(43.6, LOW + 2.8, 98.6) });
  orb('janje', [48, LOW + 0.6, 94], 3, ['lamb'], 'close', LOW + 1.2, { near: { p: [46, LOW + 0.5, 90.6], r: 3 } });

  // ---------- people ----------
  const people = [
    { kind: 'wait', tag: 'beekeeper', x: 37.2, y: LOW + 0.12, z: 114, ry: -2.2, top: '#f6f1e6' },
    { kind: 'wait', tag: 'shepherd', x: 42, y: LOW + 0.12, z: 100, ry: 2.6 },
    { kind: 'boy', tag: 'kidboy', x: 10, y: LOW + 0.12, z: 110, ry: 0.35, sc: 0.66, kite: true },
    { kind: 'rake', tag: 'plant', toolTag: 'hoe', x: -55.6, y: LOW + 0.12, z: 98, ry: -2.6, woman: true, scarf: true },
  ];
  K.finish();
  return {
    clouds: K.clouds, colliders: b.colliders, orbs: K.orbs, people, sunPos, start: V(-14, 0, -20), fleur: V(0, 56, 14),
    animals: [{ kind: 'sheep', tag: 'lamb', x: 48, y: LOW + 0.06, z: 94, ry: 0.6, roam: 3 }, { kind: 'sheep', tag: 'lamb', x: 50.6, y: LOW + 0.06, z: 96.4, ry: 2.4, roam: 3 }, { kind: 'sheep', tag: 'lamb', x: 45.4, y: LOW + 0.06, z: 96.8, ry: -1.2, roam: 3 }],
    smoke: [farm.chimTop, houses[0].chimTop, houses[8].chimTop].filter(Boolean), cherries,
  };
}
// a steep little roof for the mills
function roofSteep() { const g = new THREE.ConeGeometry(2.3, 1.6, 4); g.rotateY(Math.PI / 4); return g; }

// ---------- the living town: blossom petals drift down; in the finale a gust lifts a cloud of them over the falls ----------
let petals = null, whirl = 0;
function setupPetals(scene) {
  const g = new THREE.PlaneGeometry(0.2, 0.16), cols = ['#f6dce6', '#fbeef2', '#f2c6d6', '#fff6f8'];
  petals = Array.from({ length: 240 }, (_, i) => { const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: cols[i % 4], side: THREE.DoubleSide })); m.visible = false; scene.add(m); return { m, t: Math.random() * 20, sp: 0.4 + Math.random() * 0.5, ph: Math.random() * 6, a: null }; });
}
function respawn(l, world, around) {
  if (around) { const a = Math.random() * 6.28, r = 3 + Math.random() * 14; l.x = around.x + Math.cos(a) * r; l.z = around.z + Math.sin(a) * r; l.y = around.y + Math.random() * 6; l.a = a; l.r = r; l.c = around; }
  else { const [x, z] = world.cherries[Math.floor(Math.random() * world.cherries.length)]; l.x = x + (Math.random() - 0.5) * 4; l.z = z + (Math.random() - 0.5) * 4; l.y = (z > EDGE ? LOW : BANK) + 4 + Math.random() * 2; l.a = null; }
}
export default {
  id: 'jajce', name: 'Jajce', WORDS, ORDER, CULTURE, art,
  bounds: { boundsRadius: 150, ceiling: 100 },
  build(scene) { const w = build(scene); setupPetals(scene); return w; },
  text: {
    firstHint: 'fly to the glowing orb and land on the little watermill',
    first: 'New orbs have appeared all over Jajce. Find them in any order.',
    last: { id: 'zidine', msg: 'Only the old walls are left. Their orb is waiting on the fortress hill.' },
    fleur: 'Something golden is shining high above the waterfall. Fly through it.',
    awake: 'Jajce has awakened. You can now explore it freely.',
  },
  finale: {
    word: 'prolece', photo: { from: V(30, 30, 100), to: V(0, 8, 20) }, paints: ['cloud', 'river', 'pool', 'foam', 'trunk', 'rock', 'hilltop', 'farhill', 'basket'],
    P: [[2, 10, 44, 0], [4.5, 30, 34, -20], [7, 20, 26, -50], [9.5, -20, 22, -40], [12, -10, 20, 0], [14, 0, 18, 20], [15.5, 0, 12, 36], [17, -10, 10, 60], [19, -30, 14, 84], [21.5, 0, 18, 110], [24, 40, 24, 100], [26, 60, 30, 60], [28, 50, 38, 20]],
    shots: [
      { t0: 0, t1: 7.5, from: V(24, 30, 40), to: V(18, 34, 34), lookFrom: V(-60, 62, -80), lookTo: V(-75, 60, -92) },
      { t0: 7.5, t1: 14, from: V(70, 46, 70), to: V(40, 40, 64), lookFrom: V(0, 12, -20), lookTo: V(-10, 12, -30) },
      { t0: 14, t1: 21, from: V(16, 8, 96), to: V(-12, 9, 92), lookFrom: V(0, 10, 40), lookTo: V(0, 12, 34) },
      { t0: 21, t1: 26, from: V(-60, 30, 130), to: V(-40, 34, 140), lookFrom: V(10, 8, 70), lookTo: V(20, 10, 60) },
    ],
    // a gust over the falls lifts a cloud of blossom petals
    climax(c) { whirl = 1; for (const l of petals) { respawn(l, c.world, V(0, LOW + 6, 44)); l.m.visible = true; } },
  },
  onAlive() { for (const l of petals) l.m.visible = true; },
  update(dt, time, life, c) {
    if (life < 0.5 && !whirl) return;
    for (const l of petals) {
      if (l.x === undefined) { respawn(l, c.world); l.y -= Math.random() * 5; }
      l.t += dt;
      if (whirl && l.a !== null) { l.a += dt * (0.9 + 6 / (l.r + 2)); l.y += dt * 2.6; l.r += dt * 0.8; l.x = l.c.x + Math.cos(l.a) * l.r; l.z = l.c.z + Math.sin(l.a) * l.r; if (l.y > LOW + 30) respawn(l, c.world); }
      else { l.y -= dt * l.sp; l.x += Math.sin(l.t * 1.3 + l.ph) * dt * 0.5; l.z += Math.cos(l.t * 0.9 + l.ph) * dt * 0.3; if (l.y < (l.z > EDGE ? LOW : BANK) + 0.1) respawn(l, c.world); }
      l.m.position.set(l.x, l.y, l.z); l.m.rotation.set(l.t * 2 + l.ph, l.t * 1.3, l.t * 0.7); l.m.scale.setScalar(whirl && l.a !== null ? 4 : 1.4);
    }
    if (whirl) { whirl -= dt / 11; if (whirl <= 0) { whirl = 0; for (const l of petals) l.a = null; } }
  },
  ambience: { murmur: [[36, -6, 26], [-60, 96, 20]], water: (p) => Math.max(Math.max(0, 1 - Math.hypot(p.x, p.z - EDGE) / 50), Math.max(0, 1 - Math.hypot(p.x + 20, p.z + 30) / 34) * 0.6) },
};
