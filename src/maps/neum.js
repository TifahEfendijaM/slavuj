// Neum (summer by the sea): the town climbing its hill above the bay, the riva with a café, a pebble beach with umbrellas,
// a wooden jetty, a little harbour with boats, the Klek peninsula and its lighthouse across the water, an island.
// North is -z: the sea is to the south (+z, at y = 0), the hill rises to the north.
import * as THREE from 'three';
import { makeKit, GEO, PAL, triGeo } from '../kit.js';
import { tag, PAT } from '../paper.js';
import { WORDS, ORDER, CULTURE } from './neum-words.js';
import art from '../../assets/journal-neum.jpg';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const RIVA = 2, BEACH = 0.6, SHORE = 20;                      // the promenade's height, the beach's, where the sea begins
export const yAt = (z) => (z > -2 ? RIVA : RIVA + (-2 - z) * 0.4);      // the hill climbs north from the riva

function build(scene) {
  const K = makeKit(scene, { seed: 71 }), { A, box, slab, orb, pick, rr, R, b } = K;
  const sunPos = K.sky({ col: '#f8b46a', bleed: '#5a8ad0', sun: '#ffcf4a', sunBleed: '#ff9a2e' });
  for (const [x, y, z, s] of [[-140, 74, -170, 7], [90, 80, -200, 9], [170, 64, 60, 7], [-180, 70, 90, 8], [30, 86, 260, 8], [-60, 82, -260, 10], [140, 74, -90, 6]]) K.cloud(x, y, z, s);

  // ---------- the sea, the beach, the riva, the hill ----------
  tag('sea').mode = 'one'; tag('sea').radius = 400; tag('hill').mode = 'one'; tag('hill').radius = 260; tag('beach').mode = 'one'; tag('beach').radius = 160;
  box(800, 0.1, 700, 0, 0, SHORE + 350, { tag: 'sea', col: '#3f9ec4', bleed: '#2a6fa4', pat: PAT.water, hatch: 0, water: true, ink: false });
  box(800, 6, 700, 0, -3.2, SHORE + 350, { tag: 'sea', col: '#2a6fa4', solid: false, ink: false });      // (the sea floor, out of sight)
  box(260, 4, SHORE - 4, 0, BEACH - 2, (SHORE + 4) / 2, { tag: 'beach', col: '#ddd6c6', bleed: '#b7ad99', pat: PAT.cobble, ps: 1.8 });
  box(260, 6, 6.2, 0, RIVA - 3, 1, { tag: 'riva', col: '#e4dccb', bleed: '#c2b79e', pat: PAT.blocks, ps: 0.5 });
  const L = Math.hypot(150, 60), ang = Math.atan2(60, 150);
  box(260, 2, L, 0, (RIVA + yAt(-152)) / 2 - 1 / Math.cos(ang), -77, { tag: 'hill', col: '#a8a868', bleed: '#7d8048', pat: PAT.grass }, 0, ang);
  box(260, 2, 120, 0, yAt(-152) - 1, -211.9, { tag: 'hill', col: '#a8a868', bleed: '#7d8048', pat: PAT.grass });
  K.hills([[-260, -300, 170, 120, '#a8a868'], [0, -340, 220, 150, '#9a9a62'], [260, -300, 180, 125, '#a4a46a'], [-380, -60, 170, 90, '#a8a868'], [380, -80, 170, 95, '#9ea266']], { tag: 'hill', bleed: '#7d8048', y: 40 });      // the mountains behind the town
  orb('more', [0, 0, 60], 12, ['sea'], 'combo', 0.6, { swim: { p: [0, 0, 44], r: 14 }, wideView: { from: [120, 50, 110], to: [-120, 50, 110], look: [40, 0, 160], lookTo: [-40, 0, 160] } });
  tag('sea').holdRest = 2.9;
  orb('plaza', [-20, BEACH + 0.2, 12], 10, ['beach'], 'combo', BEACH + 1, { near: { p: [-24, BEACH + 0.5, 12], r: 4 } });
  tag('beach').holdRest = 2.9;
  orb('riva', [20, RIVA, 1], 10, ['riva'], 'combo', RIVA + 1, { near: { p: [24, RIVA + 0.5, 1.4], r: 4 } });
  tag('riva').holdRest = 2.9;
  // waves breaking along the shore, pebbles, shells, a rock with a crab, rocks out in the sea
  for (let x = -126; x <= 126; x += 5.5) box(rr(3, 4.6), 0.12, 0.5, x, 0.12, SHORE + 0.6 + rr(0, 0.8), { tag: 'wave', col: '#fbfdff', bleed: '#cde6f2', hatch: 0, solid: false, ink: false, sway: 0.14 }, rr(-0.1, 0.1));
  orb('val', [-6, 0.2, SHORE + 1], 3, ['wave'], 'combo', 0.8, { near: { p: [-6, BEACH + 0.5, SHORE - 2], r: 3 } });
  tag('wave').holdRest = 2.9;
  for (let i = 0; i < 70; i++) A(GEO.DODE, rr(-120, 120), BEACH + 0.05, rr(5, SHORE - 0.5), { tag: 'pebbles', col: pick(['#c9c2b4', '#a8a296', '#d9d2c4', '#8f8a80']), bleed: '#7a756c', solid: false, ink: false }, R() * 6, 0, 0, [rr(0.15, 0.35), 0.1, rr(0.12, 0.3)]);
  orb('sljunak', [-34, BEACH + 0.2, 14], 3, ['pebbles'], 'combo', BEACH + 0.6, { near: { p: [-34, BEACH + 0.5, 15], r: 3 } });
  tag('pebbles').holdRest = 2.9;
  for (const [x, z, c] of [[-14, 17.2, '#f2c6b0'], [-12.6, 18, '#f6e2d0'], [-15.4, 18.4, '#e8b49a']]) A(GEO.HEMI, x, BEACH + 0.02, z, { tag: 'shell', col: c, bleed: '#c98a6a', hull: true, solid: false }, R() * 6, 0, 0, [0.16, 0.08, 0.13]);
  orb('skoljka', [-14, BEACH + 0.1, 17.8], 0.8, ['shell'], 'close', BEACH + 0.6, { near: { p: [-12.4, BEACH + 0.5, 16.4], r: 2.2 } });
  A(GEO.DODE, 62, 0.8, SHORE + 1.2, { tag: 'rock', col: PAL.BOULDERS[0][0], bleed: PAL.BOULDERS[0][1] }, 0.4, 0, 0, [2.2, 1.2, 1.8]);
  b.object(() => {      // a crab on the rock
    const C = { tag: 'crab', col: '#d9532e', bleed: '#a8301e', hull: true, solid: false }, x = 62.3, y = 1.95, z = SHORE + 1.4;
    A(GEO.SPH, x, y, z, C, 0, 0, 0, [0.22, 0.09, 0.17]); for (const s of [-1, 1]) { A(GEO.SPH, x + s * 0.3, y + 0.04, z + 0.14, C, 0, 0, 0, [0.09, 0.05, 0.07]); for (let k = 0; k < 3; k++) A(GEO.CYL, x + s * 0.24, y - 0.05, z - 0.08 + k * 0.08, C, 0, 0, s * 1.1, [0.015, 0.2, 0.015]); }
  });
  orb('rak', [62.3, 2, SHORE + 1.4], 0.8, ['crab'], 'close', 2.6, { near: { p: [61, 1.9, SHORE + 0.6], r: 2 } });
  for (const [x, z, s] of [[80, 46, 3.6], [86, 52, 2.4], [74, 54, 2]]) A(GEO.DODE, x, 0.6, z, { tag: 'searock', col: PAL.BOULDERS[2][0], bleed: PAL.BOULDERS[2][1] }, R() * 6, 0, 0, [s * 1.2, s * 0.9, s]);
  orb('hrid', [80, 2, 46], 4, ['searock'], 'close', 4.2);

  // ---------- the jetty (first word), the swimming area's buoys, a pedalo ----------
  b.object(() => {
    const J = { tag: 'jetty', col: '#9a6a42', bleed: '#6a4630', pat: PAT.planks, ps: 4 };
    box(3, 0.24, 24, 10, 1.25, SHORE + 8, J);
    for (let z = SHORE - 2; z <= SHORE + 19; z += 3.5) for (const s of [-1, 1]) A(GEO.CYL, 10 + s * 1.35, 0.4, z, { ...J, pat: 0, edge: 40 }, 0, 0, 0, [0.12, 1.8, 0.12]);
  });
  orb('mol', [10, 1.4, SHORE + 14], 4, ['jetty'], 'combo', 1.6, { stage: 0 });
  tag('jetty').holdRest = 2.9;
  for (let i = 0; i < 9; i++) A(GEO.SPH, -60 + i * 12, 0.15, SHORE + 34, { tag: 'buoy', col: i % 2 ? '#f6f1e6' : '#d9302a', bleed: '#a8201a', hull: true, solid: false, sway: 0.08 }, 0, 0, 0, 0.42);
  orb('bova', [-24, 0.3, SHORE + 34], 1.4, ['buoy'], 'close', 0.8, { swim: { p: [-24, 0, SHORE + 31], r: 4 } });
  b.object(() => {
    const P = { tag: 'pedalo', col: '#f6f1e6', bleed: '#d8d0bc', hull: true, solid: false, sway: 0.08 }, x = 30, z = SHORE + 24;
    for (const s of [-1, 1]) A(GEO.SPH, x + s * 0.8, 0.25, z, P, 0, 0, 0, [0.4, 0.3, 1.8]);
    box(1.8, 0.12, 1.4, x, 0.55, z, { ...P, col: '#e8792e', bleed: '#c45a1e' }); box(1.6, 0.6, 0.1, x, 0.85, z - 0.6, { ...P, col: '#e8792e', bleed: '#c45a1e' });
  });
  orb('pedalina', [30, 0.6, SHORE + 24], 2, ['pedalo'], 'close', 1.2, { swim: { p: [30, 0, SHORE + 21], r: 3.6 } });

  // ---------- the beach: umbrellas, loungers, towels, a sandcastle and its bucket ----------
  for (const [x, z, c] of [[-30, 11, '#d9302a'], [-22, 12, '#2f6fb0'], [-14, 11, '#f2c230'], [22, 12, '#4f9a6a'], [30, 11, '#d9302a']]) b.object(() => {
    A(GEO.CYL, x, BEACH + 1.2, z, { tag: 'umbrella', col: '#e6dccb', solid: false }, 0, 0, 0, [0.05, 2.4, 0.05]);
    A(GEO.CONE12, x, BEACH + 2.55, z, { tag: 'umbrella', col: c, bleed: c, hull: true, solid: false }, 0, 0, 0, [1.9, 0.6, 1.9]);
    box(0.75, 0.12, 2, x + 0.7, BEACH + 0.42, z + 0.6, { tag: 'lounger', col: '#f6f1e6', bleed: '#d8d0bc', pat: PAT.planks, ps: 6 }); box(0.75, 0.6, 0.1, x + 0.7, BEACH + 0.68, z - 0.38, { tag: 'lounger', col: '#f6f1e6', bleed: '#d8d0bc', solid: false }, 0, 0.6, 0);
    for (const s of [-1, 1]) box(0.7, 0.36, 0.08, x + 0.7, BEACH + 0.2, z + 0.6 + s * 0.85, { tag: 'lounger', col: '#7a6a58', solid: false });
  });
  orb('suncobran', [-22, BEACH + 2.6, 12], 2.2, ['umbrella'], 'combo', BEACH + 3, { near: { p: [-24.4, BEACH + 0.5, 13.4], r: 2.4 } });
  tag('umbrella').holdRest = 2.9;
  orb('lezaljka', [-21.3, BEACH + 0.5, 12.6], 1.6, ['lounger'], 'combo', BEACH + 1, { near: { p: [-19.4, BEACH + 0.5, 13.6], r: 2.2 }, at: V(-19.4, BEACH + 2.2, 13.8) });
  tag('lounger').holdRest = 2.9;
  for (const [x, z, c] of [[-4, 13, '#e0567f'], [-1, 14.6, '#3f8fd0'], [4, 13.4, '#f2c230']]) box(1, 0.03, 1.9, x, BEACH + 0.08, z, { tag: 'towel', col: c, bleed: c, pat: PAT.kilim, ps: 3, solid: false }, R() * 0.4);
  orb('peskir', [-1, BEACH + 0.1, 14], 2, ['towel'], 'close', BEACH + 0.6, { near: { p: [1.4, BEACH + 0.5, 15.6], r: 2.4 } });
  b.object(() => {
    const SC = { tag: 'castle', col: '#e8cf96', bleed: '#c4a868', pat: PAT.blocks, ps: 2 }, x = 40, z = 15;
    box(1.4, 0.5, 1.4, x, BEACH + 0.25, z, SC); for (const [dx, dz] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) { A(GEO.CYL, x + dx, BEACH + 0.6, z + dz, { ...SC, edge: 40 }, 0, 0, 0, [0.22, 1.2, 0.22]); A(GEO.CONE8, x + dx, BEACH + 1.35, z + dz, SC, 0, 0, 0, [0.26, 0.3, 0.26]); }
    A(GEO.CYL12, x + 1.6, BEACH + 0.24, z + 0.4, { tag: 'bucket', col: '#2f9ad0', bleed: '#1f6fa0', hull: true, solid: false }, 0, 0, 0, [0.22, 0.42, 0.22]);
  });
  orb('dvorac', [40, BEACH + 0.6, 15], 1.6, ['castle'], 'close', BEACH + 1.6, { near: { p: [42.4, BEACH + 0.5, 16.6], r: 2.2 } });
  orb('kanta', [41.6, BEACH + 0.3, 15.4], 0.7, ['bucket'], 'close', BEACH + 0.8, { requires: ['dvorac'], near: { p: [42.4, BEACH + 0.5, 16.6], r: 2.2 } });

  // ---------- the riva: lamps, a café with lemonade and watermelon ----------
  for (let x = -110; x <= 110; x += 18) K.lamp(x, 3.4, { y: RIVA, tag: 'lamp' });
  b.object(() => {
    const T = { tag: 'cafe', col: '#f6f1e6', bleed: '#d8d0bc' };
    for (const x of [-4, 0, 4]) { A(GEO.CYL12, x, RIVA + 0.76, -0.4, { ...T, edge: 40 }, 0, 0, 0, [0.6, 0.06, 0.6]); A(GEO.CYL, x, RIVA + 0.38, -0.4, { ...T, solid: false }, 0, 0, 0, [0.05, 0.76, 0.05]); A(GEO.CONE12, x, RIVA + 2.6, -0.4, { ...T, col: '#b8452c', bleed: '#8a3020', hull: true, solid: false }, 0, 0, 0, [1.5, 0.5, 1.5]); A(GEO.CYL, x, RIVA + 1.6, -0.4, { ...T, solid: false }, 0, 0, 0, [0.04, 2, 0.04]); }
    for (let i = 0; i < 3; i++) A(GEO.CYL, -0.25 + i * 0.25, RIVA + 0.9, -0.3 + (i % 2) * 0.2, { tag: 'lemonade', col: '#f6e47a', bleed: '#d9c03a', hull: true, solid: false }, 0, 0, 0, [0.06, 0.2, 0.06]);
    for (let i = 0; i < 3; i++) A(new THREE.CylinderGeometry(1, 1, 1, 12, 1, false, 0, Math.PI * 0.55), 4 + (i - 1) * 0.22, RIVA + 0.95, -0.4, { tag: 'melon', col: '#e0453a', bleed: '#3f8a4a', solid: false }, 0, Math.PI / 2, 0, [0.3, 0.06, 0.3]);
  });
  orb('limunada', [0, RIVA + 0.95, -0.3], 0.6, ['lemonade'], 'close', RIVA + 1.4, { near: { p: [0, RIVA + 0.5, 1.6], r: 2 } });
  orb('lubenica', [4, RIVA + 1, -0.4], 0.6, ['melon'], 'close', RIVA + 1.4, { near: { p: [4, RIVA + 0.5, 1.6], r: 2 } });
  orb('konobar', [-8, RIVA + 1, 1], 2, ['waiter'], 'close', RIVA + 2.2, { near: { p: [-8, RIVA + 0.5, 2.8], r: 2.4 }, at: V(-9.4, RIVA + 2.8, 2.2) });

  // ---------- the harbour: its wall, a boat, a sailing boat, nets and an anchor, gulls ----------
  b.object(() => {
    const H = { tag: 'harbour', col: '#d0c6b0', bleed: '#ada38e', pat: PAT.blocks, ps: 0.6 };
    box(3, 2.6, 30, -70, 0.8, SHORE + 15, H); box(26, 2.6, 3, -58.5, 0.8, SHORE + 30, H);
  });
  orb('luka', [-64, 2, SHORE + 18], 10, ['harbour'], 'close', 3, { near: { p: [-70, 2.6, SHORE + 22], r: 3 } });
  b.object(() => {
    const B = { tag: 'boat', col: '#f6f1e6', bleed: '#d8d0bc', hull: true, sway: 0.06 };
    A(GEO.SPH, -62, 0.3, SHORE + 14, B, 0, 0, 0, [1.3, 0.55, 3.4]); box(1.4, 1, 1.6, -62, 1.1, SHORE + 13.6, { ...B, col: '#2f5f9a', bleed: '#1f4277', solid: false });
    A(GEO.SPH, -55, 0.3, SHORE + 20, { tag: 'sailboat', col: '#f6f1e6', bleed: '#d8d0bc', hull: true, sway: 0.06 }, 0.2, 0, 0, [1.1, 0.5, 3]);
    A(GEO.CYL, -55, 3.6, SHORE + 20, { tag: 'sailboat', col: '#8a6a44', solid: false, sway: 0.06 }, 0, 0, 0, [0.06, 6.4, 0.06]);
    A(triGeo([0, 6.2, 0], [0, 0.4, 0], [0, 0.4, 2.4]), -54.96, 0.6, SHORE + 20.1, { tag: 'sail', col: '#fbf7ec', bleed: '#e0d8c4', solid: false, sway: 0.06 });
    for (let i = 0; i < 5; i++) box(0.05, 1.1, 1.6, -71.3, 2.6, SHORE + 6 + i * 1.4, { tag: 'net', col: '#5f8aa0', bleed: '#3f6a80', pat: PAT.kilim, ps: 9, solid: false, hatch: 0.6 }, 0, 0, 0.12);
    A(GEO.CYL, -70, 3, SHORE + 26, { tag: 'anchor', col: '#3a3d42', bleed: '#25272b', solid: false }, 0, 0, 0, [0.07, 1.4, 0.07]);
    A(new THREE.TorusGeometry(0.5, 0.07, 6, 16, Math.PI), -70, 2.5, SHORE + 26, { tag: 'anchor', col: '#3a3d42', bleed: '#25272b', solid: false }, 0, 0, Math.PI);
    box(0.7, 0.07, 0.07, -70, 3.6, SHORE + 26, { tag: 'anchor', col: '#3a3d42', solid: false });
  });
  orb('brod', [-62, 1, SHORE + 14], 3.4, ['boat'], 'close', 2, { near: { p: [-70, 2.6, SHORE + 14], r: 2.6 } });
  orb('jedrilica', [-55, 1, SHORE + 20], 3, ['sailboat'], 'close', 2, { near: { p: [-70, 2.6, SHORE + 20], r: 2.6 } });
  orb('jedro', [-55, 3.5, SHORE + 21], 2.6, ['sail'], 'close', 6.8, { requires: ['jedrilica'], near: { p: [-55, 2.6, SHORE + 30], r: 2.6 }, at: V(-53, 6, SHORE + 22) });
  orb('mreza', [-71.3, 2.6, SHORE + 8.8], 2.4, ['net'], 'close', 3.6, { near: { p: [-70, 2.6, SHORE + 9], r: 2.4 }, at: V(-68.6, 4.4, SHORE + 8.8) });
  orb('sidro', [-70, 2.9, SHORE + 26], 1.2, ['anchor'], 'close', 3.8, { near: { p: [-70, 2.6, SHORE + 27.6], r: 2 } });
  for (const [x, z] of [[-70, SHORE + 2], [-50, SHORE + 30]]) b.object(() => {
    const G = { tag: 'gull', col: '#f6f6f2', bleed: '#c8ccd0', hull: true, solid: false };
    A(GEO.SPH, x, 2.3, z, G, 0, 0, 0, [0.14, 0.13, 0.26]); A(GEO.SPH, x, 2.48, z + 0.18, G, 0, 0, 0, 0.09); box(0.5, 0.03, 0.18, x, 2.34, z - 0.02, { ...G, col: '#8f9aa6' });
    A(GEO.CONE4, x, 2.48, z + 0.3, { ...G, col: '#f2c230' }, 0, Math.PI / 2, 0, [0.03, 0.1, 0.03]);
  });
  orb('galeb', [-66, 2.4, SHORE + 30], 3, ['gull', 'pigeon'], 'close', 3, { near: { p: [-62, 2.6, SHORE + 30], r: 3 } });
  // a pair of dolphins in the bay (they leap once the town wakes: see update)
  b.object(() => { for (const dx of [0, 3]) { const D = { tag: 'dolphin', col: '#7d94a8', bleed: '#55697c', hull: true, solid: false }; A(GEO.SPH, 20 + dx, -0.3, 120 + dx, D, 0, -0.6, 0, [0.5, 0.42, 1.5]); A(GEO.CONE4, 20 + dx, 0.22, 120 + dx, D, 0, 0, 0, [0.12, 0.5, 0.3]); } });
  orb('delfin', [21.5, 0.4, 121.5], 3, ['dolphin'], 'close', 1, { swim: { p: [21, 0, 116], r: 5 } });

  // ---------- the town on the hill: houses, a balcony, a hotel with a pool ----------
  const houses = [];
  for (const [x, z] of [[-90, -12], [-70, -16], [-48, -10], [-28, -14], [20, -12], [44, -14], [66, -10], [88, -16], [-80, -34], [-56, -38], [-34, -32], [-10, -36], [14, -38], [38, -34], [62, -40], [86, -36],
    [-92, -58], [-66, -60], [-40, -56], [-16, -62], [10, -58], [34, -62], [58, -56], [82, -62], [-74, -84], [-46, -86], [-20, -80], [6, -88], [32, -84], [60, -88], [-30, -108], [20, -110], [50, -106]]) {
    const w = rr(6.5, 8), d = rr(6, 7), yb = yAt(z + d / 2);
    box(w + 0.6, 6, d + 0.6, x, yb - 3 + 0.01, z, { tag: 'house', col: '#d6cdb8', bleed: '#b4a88e', pat: PAT.blocks, ps: 0.6 });
    houses.push(K.house({ x, z, rot: 0, y: yb, w, d, h: rr(5, 7), rh: 2, roof: 'hip', kind: 'tile', wall: pick([['#fbf7ec', '#e6dccb'], ['#f6efe0', '#e0d4bc'], ['#fff6e8', '#eadcc4'], ['#f4e8d4', '#dccaa8']]) }));
  }
  orb('naselje', [-10, yAt(-36) + 4, -36], 9, ['house', 'roof', 'window', 'door', 'chimney'], 'combo', yAt(-36) + 9.4);
  for (const t of ['house', 'roof', 'window', 'door', 'chimney']) tag(t).holdRest = 2.9;
  const bh = houses[4];
  b.object(() => {
    box(4.4, 0.18, 1.4, bh.x, bh.y + 3.2, bh.z + bh.d / 2 + 0.7, { tag: 'balcony', col: '#e6dccb', bleed: '#c4b89c' });
    for (let i = 0; i <= 8; i++) box(0.05, 0.9, 0.05, bh.x - 2.1 + i * 0.525, bh.y + 3.75, bh.z + bh.d / 2 + 1.35, { tag: 'balcony', col: '#3a3632', solid: false, ink: false });
    box(4.4, 0.06, 0.06, bh.x, bh.y + 4.2, bh.z + bh.d / 2 + 1.35, { tag: 'balcony', col: '#3a3632', solid: false });
    K.flowers(bh.x, bh.y + 3.4, bh.z + bh.d / 2 + 1.25, 3.4, 7);
  });
  orb('balkon', [bh.x, bh.y + 3.4, bh.z + bh.d / 2 + 0.7], 2.4, ['balcony'], 'close', bh.y + 4.4, { front: 0 });
  b.object(() => {      // the hotel's pool on its terrace
    slab(-14, 6, -26, -18, { tag: 'pooldeck', col: '#ece6d8', bleed: '#cbc2ad', pat: PAT.blocks, ps: 0.6 }, yAt(-18) + 0.05, 0.3);
    box(14, 0.12, 5, -4, yAt(-18) + 0.18, -22, { tag: 'pool', col: '#5fc4e0', bleed: '#2f9ac0', pat: PAT.water, hatch: 0, water: true, ink: false });
  });
  orb('bazen', [-4, yAt(-18) + 0.3, -22], 5, ['pool'], 'close', yAt(-18) + 1, { near: { p: [4, yAt(-18) + 0.5, -24], r: 2.4 } });

  // ---------- olives, figs and cypresses on the hill, a vineyard ----------
  const spots = [];
  for (let i = 0; i < 160 && spots.length < 60; i++) { const x = rr(-120, 120), z = rr(-150, -6); if (houses.some((h) => Math.hypot(h.x - x, h.z - z) < 7) || (x > -16 && x < 8 && z > -28 && z < -16) || (x > 60 && x < 100 && z > -132 && z < -116)) continue; spots.push([x, z]); }
  spots.forEach(([x, z], i) => {
    if (i % 3 === 0) K.tree(x, z, rr(0.8, 1.05), { col: pick([['#9aaa82', '#748660'], ['#a8b48e', '#7e8e66']]), crownTag: 'olive', trunkTag: 'olive', y: yAt(z) - 0.2 });
    else if (i % 3 === 1) K.tree(x, z, rr(0.85, 1.1), { col: pick([['#5f9a48', '#447a36'], ['#6aa452', '#4a8438']]), crownTag: 'fig', trunkTag: 'fig', y: yAt(z) - 0.2 });
    else b.object(() => { A(GEO.CYL, x, yAt(z) + 0.4, z, { tag: 'cypress', col: '#6a4a30', ink: false }, 0, 0, 0, [0.15, 1, 0.15]); A(GEO.SPH, x, yAt(z) + 4, z, { tag: 'cypress', col: '#2f6146', bleed: '#1f4a36', hull: true, sway: (v) => 0.02 * (v.y - yAt(z)) }, R() * 6, 0, 0, [0.9, 3.6, 0.9]); });
  });
  // each tree word is shown on the tree of its kind that stands most in the open (no house or tree crowding its camera)
  const open = (k) => spots.filter((_, i) => i % 3 === k).reduce((best, p) => { const room = Math.min(...houses.map((h) => Math.hypot(h.x - p[0], h.z - p[1])), ...spots.filter((q) => q !== p).map((q) => Math.hypot(q[0] - p[0], q[1] - p[1]))); return room > best.room ? { p, room } : best; }, { p: null, room: -1 }).p;
  const ol = open(0), fg = open(1), cy = open(2);
  orb('maslina', [ol[0], yAt(ol[1]) + 4, ol[1]], 3, ['olive'], 'combo', yAt(ol[1]) + 6, { wideView: { from: [96, 64, 70], to: [-96, 64, 70], look: [36, 28, -60], lookTo: [-36, 28, -60] } });
  orb('smokva', [fg[0], yAt(fg[1]) + 4, fg[1]], 3, ['fig'], 'combo', yAt(fg[1]) + 6, { wideView: { from: [96, 64, 70], to: [-96, 64, 70], look: [36, 28, -60], lookTo: [-36, 28, -60] } });
  orb('cempres', [cy[0], yAt(cy[1]) + 4, cy[1]], 3, ['cypress'], 'combo', yAt(cy[1]) + 8.4, { wideView: { from: [96, 64, 70], to: [-96, 64, 70], look: [36, 28, -60], lookTo: [-36, 28, -60] } });
  for (const t of ['olive', 'fig', 'cypress']) tag(t).holdRest = 2.9;
  b.object(() => { for (let r = 0; r < 6; r++) { const z = -118 - r * 2.4; for (let x = 64; x < 98; x += 1.6) { A(GEO.CYL, x, yAt(z) + 0.5, z, { tag: 'vines', col: '#6a4a30', solid: false, ink: false }, 0, 0, 0, [0.04, 1, 0.04]); A(GEO.ICO, x, yAt(z) + 1.1, z, { tag: 'vines', col: '#6f9a3a', bleed: '#4e7a2a', hull: true, solid: false }, R() * 6, 0, 0, [0.6, 0.45, 0.45]); } } });
  orb('vinograd', [80, yAt(-124) + 1, -124], 8, ['vines'], 'close', yAt(-124) + 2, { near: { p: [80, yAt(-114) + 0.5, -114], r: 4 } });

  // ---------- across the bay: an island, the Klek peninsula and its lighthouse ----------
  b.object(() => {
    A(GEO.ICO2, 110, -2, 150, { tag: 'island', col: '#a8a868', bleed: '#7d8048', hull: true }, 0, 0, 0, [16, 7, 12]);
    for (const [dx, dz] of [[-4, 0], [3, -2], [0, 4]]) A(GEO.SPH, 110 + dx, 7.5, 150 + dz, { tag: 'island', col: '#2f6146', bleed: '#1f4a36', hull: true, solid: false }, 0, 0, 0, [0.9, 3.4, 0.9]);
  });
  orb('otok', [110, 5, 150], 10, ['island'], 'close', 8);
  for (let x = -320; x <= 70; x += 34) A(GEO.ICO2, x, -4, 215 + Math.sin(x * 0.03) * 8, { tag: 'peninsula', col: '#9aa068', bleed: '#727a48', hull: true }, R() * 6, 0, 0, [30, rr(16, 26), 20]);
  orb('poluotok', [-60, 14, 215], 24, ['peninsula'], 'wide', 22, { at: V(-40, 24, 196), near: { p: [-40, 12, 200], r: 10 } });
  b.object(() => {
    const LH = { tag: 'lighthouse', col: '#fbf7ec', bleed: '#e0d8c4' };
    A(GEO.ICO2, 92, -2, 212, { tag: 'peninsula', col: '#9aa068', bleed: '#727a48', hull: true }, 0, 0, 0, [10, 6, 8]);
    A(GEO.CYL12, 92, 9, 212, { ...LH, edge: 40 }, 0, 0, 0, [1.4, 10, 1.4]); A(GEO.CYL12, 92, 14.6, 212, { ...LH, col: '#f2c66a', bleed: '#d9963a', edge: 40 }, 0, 0, 0, [1.1, 1.2, 1.1]);
    A(GEO.CONE12, 92, 16, 212, { ...LH, col: '#c0392b', bleed: '#8a2a20' }, 0, 0, 0, [1.6, 1.6, 1.6]);
    for (let i = 0; i < 3; i++) box(2.86, 0.6, 2.86, 92, 6 + i * 2.6, 212, { ...LH, col: '#c0392b', bleed: '#8a2a20', solid: false });
  });
  orb('svjetionik', [92, 10, 212], 6, ['lighthouse'], 'close', 17.4, { near: { p: [92, 16.4, 212], r: 2.4 } });

  // ---------- people ----------
  const people = [
    { kind: 'lie', tag: 'sunbathe', x: -21.3, y: BEACH + 0.66, z: 13.6, ry: Math.PI, woman: true },
    { kind: 'swimmer', tag: 'bathe', x: -40, y: -0.08, z: SHORE + 12, to: [-12, SHORE + 12], speed: 0.8, trunks: true },
    { kind: 'swimmer', tag: 'bathe', x: 46, y: -0.08, z: SHORE + 16, to: [20, SHORE + 18], speed: 0.7, trunks: true },
    { kind: 'walk', tag: 'waiter', x: -10, y: RIVA + 0.12, z: 1.2, to: [6, 1.2], speed: 0.8, top: '#f6f1e6' },
  ];
  orb('suncati', [-21.3, BEACH + 0.9, 12.8], 1.6, ['sunbathe'], 'close', BEACH + 1.6, { near: { p: [-19.4, BEACH + 0.5, 13.6], r: 2.2 }, at: V(-23, BEACH + 2.4, 13.8) });
  orb('kupati', [-26, 0.3, SHORE + 12], 3, ['bathe'], 'close', 0.8, { swim: { p: [-26, 0, SHORE + 9], r: 4 } });
  K.finish();
  return {
    clouds: K.clouds, colliders: b.colliders, orbs: K.orbs, people, sunPos, animals: [], start: V(-14, 0, 1.4), fleur: V(0, 50, 40),
    pigeons: { x: -64, y: 2.12, z: SHORE + 30.2, fx: -62, fz: SHORE + 24, fh: 7 }, smoke: [houses[8].chimTop, houses[14].chimTop].filter(Boolean),
  };
}

// ---------- the living town: the dolphins leap in the bay, and in the finale the whole pod comes in at sunset ----------
let leapT0 = 0, big = 0;
export default {
  id: 'neum', name: 'Neum', WORDS, ORDER, CULTURE, art,
  bounds: { boundsRadius: 230, ceiling: 110 },
  build,
  text: {
    firstHint: 'fly to the glowing orb and land on the wooden jetty',
    first: 'New orbs have appeared all over Neum. Find them in any order.',
    last: { id: 'svjetionik', msg: 'Only the lighthouse is left. Its orb is waiting across the bay.' },
    fleur: 'Something golden is shining high above the bay. Fly through it.',
    awake: 'Neum has awakened. You can now explore it freely.',
  },
  finale: {
    word: 'ljeto', photo: { from: V(-30, 30, 70), to: V(30, 0, 160) }, paints: ['cloud', 'rock', 'hill', 'lamp', 'cafe', 'pooldeck', 'flower'],
    P: [[2, 10, 40, 30], [4.5, 30, 30, 10], [7, 10, 22, -10], [9.5, -30, 18, 0], [12, -40, 12, 30], [14, -10, 8, 60], [16, 10, 6, 90], [18, 20, 8, 110], [20.5, 50, 12, 140], [23, 80, 18, 180], [25.5, 60, 26, 210], [28, 20, 34, 190]],
    shots: [
      { t0: 0, t1: 7.5, from: V(24, 30, 50), to: V(18, 34, 44), lookFrom: V(-60, 62, -80), lookTo: V(-75, 60, -92) },
      { t0: 7.5, t1: 14, from: V(40, 30, 90), to: V(10, 26, 84), lookFrom: V(0, 14, -30), lookTo: V(-10, 14, -40) },
      { t0: 14, t1: 21, from: V(4, 6, 92), to: V(-6, 7, 96), lookFrom: V(21, 1, 120), lookTo: V(22, 1, 122) },
      { t0: 21, t1: 26, from: V(-40, 20, 120), to: V(-30, 24, 130), lookFrom: V(60, 6, 200), lookTo: V(80, 10, 210) },
    ],
    climax(c) { leapT0 = c.time; big = 1; },
  },
  update(dt, time, life, c) {
    if (life < 0.5 && !big) return;
    // the pair leaps every few seconds (in the finale, at once and higher)
    const t = tag('dolphin'), per = 4.5, u = ((time - leapT0) % per + per) % per / 1.4;
    const y = u < 1 ? Math.sin(Math.PI * u) * (big ? 3.2 : 2) : 0, a = u < 1 ? (u - 0.5) * 2.4 : 0;
    for (const m of [t.mesh, t.hullMesh]) if (m) { m.position.set(0, y, u < 1 ? u * 3 : 0); }
    if (big && time - leapT0 > 12) big = 0;
  },
  ambience: { murmur: [[0, 0, 24], [-20, 12, 24], [-64, 30, 20]], water: (p) => Math.max(0, 1 - Math.max(0, 20 - p.z) / 30) * Math.max(0.2, 1 - p.y / 50) },
};
