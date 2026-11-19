// Sarajevo (autumn): Baščaršija with the Sebilj and its pigeons, the coppersmiths' shops, a café, the chestnut seller and
// the fruit market; the Miljacka with the Latin Bridge, the striped Vijećnica and the tram along the river; the mahala
// climbing the hill to Žuta tabija. North is -z. The river runs along x, between z = 40 and 50, below the town.
import * as THREE from 'three';
import { makeKit, BANK, GEO, PAL, LEAVES } from '../kit.js';
import { tag, PAT } from '../paper.js';
import { WORDS, ORDER, CULTURE } from './sarajevo-words.js';
import art from '../../assets/journal-sarajevo.jpg';
import { makeFall } from '../fall.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const WATER_Y = 7.6, RZ0 = 40, RZ1 = 50, RZ = 45;          // the Miljacka: its surface and its two banks
const HILL0 = -72, HILL1 = -150, TOP = 40;                  // the hill rises from z = -72 (the town) to z = -150 (the fortress)
export const yAt = (z) => (z > HILL0 ? BANK : z < HILL1 ? TOP : BANK + (HILL0 - z) * (TOP - BANK) / (HILL0 - HILL1));
const TRAM_Z = 31.75;

function build(scene) {
  const K = makeKit(scene, { seed: 31 }), { A, box, slab, orb, pick, rr, R, b } = K;
  const sunPos = K.sky({ col: '#f6a35e', bleed: '#7a6fb0', sun: '#ffb53a', sunBleed: '#ff8a2e' });
  for (const [x, y, z, s] of [[-120, 72, -170, 7], [90, 80, -200, 9], [170, 64, 40, 7], [-180, 70, 70, 8], [20, 86, 200, 8], [-50, 82, -260, 10], [120, 74, -90, 6], [-80, 62, -60, 4.6], [40, 66, 90, 5]]) K.cloud(x, y, z, s);

  // ---------- ground: the town, the river between its walls, the hill ----------
  tag('street').mode = 'one'; tag('street').radius = 140; tag('hill').mode = 'one'; tag('hill').radius = 220; tag('river').mode = 'one'; tag('river').radius = 160;
  const GROUND = { tag: 'street', col: '#d4cdbf', bleed: '#ada597', pat: PAT.blocks, ps: 0.3 };
  box(240, 10, RZ0 - HILL0 + 0.01, 0, BANK - 5, (RZ0 + HILL0) / 2, GROUND);                 // the old town, between the hill and the river
  box(240, 10, 110, 0, BANK - 5, RZ1 + 55, GROUND);                                        // the south bank
  const EMB = { tag: 'embank', col: '#a39783', bleed: '#7d7262', pat: PAT.blocks, ps: 0.9 };
  box(240, 0.4, RZ1 - RZ0 + 0.2, 0, WATER_Y - 1.4, RZ, { ...EMB, col: '#8f8676' });       // the river bed
  for (const z of [RZ0 + 0.15, RZ1 - 0.15]) box(240, BANK - WATER_Y + 1.2, 0.3, 0, (BANK + WATER_Y - 1.2) / 2, z, { ...EMB, solid: false });
  box(240, 0.1, RZ1 - RZ0, 0, WATER_Y, RZ, { tag: 'river', col: '#5f9a8c', bleed: '#3f7a74', pat: PAT.water, hatch: 0, water: true, ink: false });
  // the hill: a long slope up to the fortress, then its flat top
  const HILL = { tag: 'hill', col: '#b8ab68', bleed: '#8e8a4c', pat: PAT.grass };
  const L = Math.hypot(HILL0 - HILL1, TOP - BANK), ang = Math.atan2(TOP - BANK, HILL0 - HILL1);
  box(240, 2, L, 0, (BANK + TOP) / 2 - 1 / Math.cos(ang), (HILL0 + HILL1) / 2, HILL, 0, ang);
  box(240, 2, 120, 0, TOP - 1, HILL1 - 59.9, HILL);
  // cobbled streets of the bazaar and the square
  const STREET = { tag: 'street', col: '#c4b39a', bleed: '#9e8a70', pat: PAT.cobble, ps: 1.1 };
  for (const [x0, x1, z0, z1] of [[-14, 14, -12, 16], [-56, 14, -12, -8], [-8, -4, -70, -12], [14, 40, -2, 2], [-60, 60, 33.2, 39]]) slab(x0, x1, z0, z1, STREET, BANK + 0.06, 0.12);
  for (const z of [TRAM_Z - 0.72, TRAM_Z + 0.72]) box(240, 0.08, 0.12, 0, BANK + 0.13, z, { tag: 'street', col: '#7d7a76', bleed: '#5d5a56', solid: false });      // the tram rails
  K.hills([[-300, 300, 150, 70, '#a8a060'], [20, 380, 210, 95, '#9aa25e'], [300, 290, 160, 72, '#b39a5e'], [400, -40, 170, 80, '#a2a868'], [-400, -60, 180, 85, '#b0985f'], [-180, -400, 170, 66, '#98a064'], [170, -410, 170, 70, '#b59468']], { tag: 'hill', bleed: '#7d7448' });

  // ---------- the Sebilj in the middle of the square, its green dome, and its pigeons ----------
  b.object(() => {
    const SB = { tag: 'sebilj', col: '#c9a46a', bleed: '#9c7a46', pat: PAT.planks, ps: 2.2 };
    A(GEO.CYL, 0, BANK + 0.2, -2, { ...SB, col: '#d6cdb8', bleed: '#b4a88e', pat: PAT.blocks, ps: 1, edge: 40 }, Math.PI / 8, 0, 0, [2.9, 0.4, 2.9]);
    A(GEO.CYL, 0, BANK + 2, -2, { ...SB, edge: 40 }, Math.PI / 8, 0, 0, [2.1, 3.2, 2.1]);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; box(0.9, 1.6, 0.1, Math.sin(a) * 2.02, BANK + 2.2, -2 + Math.cos(a) * 2.02, { tag: 'sebilj', col: '#5a4232', bleed: '#3e2c20', solid: false }, a); }
    A(GEO.CYL, 0, BANK + 3.75, -2, { ...SB, col: '#a7804e', edge: 40 }, Math.PI / 8, 0, 0, [2.75, 0.3, 2.75]);
    A(GEO.HEMI, 0, BANK + 3.9, -2, { tag: 'dome', col: '#6f9a7c', bleed: '#4c7a62', hull: true }, 0, 0, 0, [1.95, 2.1, 1.95]);
    A(GEO.CYL, 0, BANK + 6.25, -2, { tag: 'dome', col: '#c9a23a', bleed: '#a07a25', solid: false }, 0, 0, 0, [0.06, 0.6, 0.06]);
    A(GEO.SPH, 0, BANK + 6.6, -2, { tag: 'dome', col: '#e0b84a', bleed: '#a07a25', solid: false, hull: true }, 0, 0, 0, 0.16);
  });
  orb('kupola', [0, BANK + 5, -2], 3, ['dome'], 'close', BANK + 6.8, { stage: 0 });
  orb('sebilj', [0, BANK + 2, -2], 4.6, ['sebilj'], 'close', BANK + 4, { near: { p: [3.2, BANK + 0.5, 1.4], r: 2.6 }, at: V(3.6, BANK + 2.6, 2.2) });
  orb('jato', [6, BANK + 0.3, 5], 3.2, ['pigeon'], 'close', BANK + 0.4, { near: { p: [7.5, BANK + 0.5, 6.5], r: 3 }, at: V(6, BANK + 2.2, 5) });

  // ---------- Kazandžiluk: the bazaar shops, a coppersmith beating a pot in front of his ----------
  const shop = (x, z, o = {}) => b.object(() => {
    const S = { tag: 'shop' }, wd = pick([['#b58a5a', '#8e6640'], ['#a67a4c', '#7e5834'], ['#c09566', '#987044']]);
    box(6.2, 3.2, 5, x, BANK + 1.6, z, { ...S, col: wd[0], bleed: wd[1], pat: PAT.planks, ps: 2, pool: 1 });
    A(K.roofGeoShop ||= roofGeoLow(), x, BANK + 3.2, z + 0.4, { ...S, col: '#7a5a3e', bleed: '#5c4330', pat: PAT.roof, ps: 1.4 });
    box(4.6, 2, 0.12, x, BANK + 1.5, z + 2.52, { ...S, col: '#4a3628', bleed: '#2e2018', solid: false });
    box(4.8, 0.12, 1.1, x, BANK + 1.0, z + 3.1, { ...S, col: wd[1], bleed: '#5c4330', pat: PAT.planks, ps: 4 });      // the counter (a shutter let down)
    if (o.copper) {      // copper pots, an ewer and trays, set out on the counter and hung by the door
      const CU = { tag: 'copper', col: '#c9783a', bleed: '#9c5426', hull: true, solid: false };
      for (const [px, sc] of [[-1.7, 0.32], [-0.9, 0.26], [0.0, 0.36], [0.9, 0.24], [1.7, 0.3]]) A(GEO.POT, x + px, BANK + 1.06 + sc * 0.6, z + 3.1, CU, 0, 0, 0, [sc, sc * 1.1, sc]);
      for (const px of [-2.6, 2.6]) A(GEO.CYL16, x + px, BANK + 2.2, z + 2.62, { ...CU, hull: false, edge: 50 }, 0, Math.PI / 2, 0, [0.42, 0.04, 0.42]);
    }
  });
  function roofGeoLow() { return roofGeoShop(7.4, 6.4, 1.1); }
  for (const [x, cu] of [[-48, 0], [-40.5, 0], [-33, 1], [-25.5, 0], [-18, 0], [-10.5, 0], [-3, 0], [4.5, 0]]) shop(x, -15, { copper: cu });
  // more of the bazaar: a row facing the square from the south, and one along its east side
  const shopAt = (x, z, rot) => { b.push(K.mat4(x, 0, z, rot)); shop(0, 0, {}); b.pop(); };
  for (const x of [-12, -4.5, 3, 10.5]) shopAt(x, 27, Math.PI);
  shopAt(23.5, -4, -Math.PI / 2);
  box(0.9, 0.55, 0.6, -33, BANK + 0.28, -9.25, { tag: 'shop', col: '#5d6066', bleed: '#3d4046' });       // his anvil, and the pot on it
  A(GEO.POT, -33, BANK + 0.72, -9.25, { tag: 'copper', col: '#d08440', bleed: '#9c5426', hull: true, solid: false }, 0, 0, 0, [0.26, 0.22, 0.26]);
  orb('carsija', [-33, BANK + 1, -14], 10, ['street', 'shop'], 'combo', BANK + 5.4);
  tag('street').holdRest = 2.9;
  orb('bakar', [-33, BANK + 1.4, -11.6], 2.6, ['copper'], 'close', BANK + 2.2, { near: { p: [-30.6, BANK + 0.5, -10.4], r: 2.6 }, at: V(-30.8, BANK + 3.4, -11.2), front: 0 });
  orb('kazandzija', [-33, BANK + 1, -10.2], 1.6, ['smith'], 'close', BANK + 2.2, { near: { p: [-31.2, BANK + 0.5, -8.2], r: 2.4 }, at: V(-34.8, BANK + 2.6, -8.6) });
  orb('cekic', [-32.8, BANK + 1.1, -9.8], 1.1, ['hammer'], 'close', BANK + 1.6, { requires: ['kazandzija'], near: { p: [-31.2, BANK + 0.5, -7.6], r: 2.4 }, at: V(-31.6, BANK + 2.4, -8.6) });

  // ---------- the café: tables outside, a guest with his coffee, a džezva, fildžani and lokum on a copper tray ----------
  K.house({ x: -24, z: 6, rot: Math.PI / 2, w: 9, d: 7, h: 4.6, rh: 2, roof: 'hip', kind: 'wood', tagH: 'cafe', roofTag: 'cafe', winTag: 'cafe', doorTag: 'cafe', chimTag: 'cafe', chimney: false, stone: false, wall: ['#f1e2c4', '#ddc59e'] });
  const CF = { tag: 'cafe', col: '#7a5236', bleed: '#5a3a22' };
  for (const z of [1.5, 6, 10.5]) {
    A(GEO.CYL12, -15.5, BANK + 0.76, z, { ...CF, edge: 40 }, 0, 0, 0, [0.62, 0.06, 0.62]); A(GEO.CYL, -15.5, BANK + 0.37, z, { ...CF, solid: false }, 0, 0, 0, [0.06, 0.74, 0.06]);
    for (const dz of [-1.05, 1.05]) if (!(z === 6 && dz < 0)) box(0.5, 0.06, 0.5, -15.5, BANK + 0.47, z + dz, CF);
  }
  box(0.5, 0.06, 0.5, -16.55, BANK + 0.47, 6, CF); box(0.06, 0.5, 0.5, -16.8, BANK + 0.75, 6, { ...CF, solid: false });      // the guest's chair
  A(GEO.CYL16, -15.4, BANK + 0.8, 6, { tag: 'copper', col: '#c9783a', bleed: '#9c5426', edge: 50, solid: false }, 0, 0, 0, [0.5, 0.025, 0.5]);
  A(GEO.POT, -15.2, BANK + 0.92, 5.8, { tag: 'dzezva', col: '#b86a32', bleed: '#8a4a20', hull: true, solid: false }, 0, 0, 0, [0.07, 0.17, 0.07]);
  box(0.16, 0.02, 0.02, -15.05, BANK + 0.98, 5.8, { tag: 'dzezva', col: '#6a4a30', solid: false, ink: false });
  for (const [dx, dz] of [[-0.2, 6.25], [0.08, 6.3]]) A(GEO.CYL, -15.4 + dx, BANK + 0.86, dz, { tag: 'fildzan', col: '#f6f1e6', bleed: '#2f5f9a', hull: true, solid: false }, 0, 0, 0, [0.045, 0.07, 0.045]);
  for (const [dx, dz] of [[-0.35, 5.7], [-0.27, 5.62], [-0.33, 5.55]]) box(0.06, 0.06, 0.06, -15.4 + dx, BANK + 0.85, dz, { tag: 'lokum', col: '#f2b8c6', bleed: '#e08aa2', solid: false, ink: false });
  orb('kafana', [-24, BANK + 3, 6], 6.5, ['cafe'], 'close', BANK + 6.8, { front: Math.PI / 2 });
  orb('gost', [-16.5, BANK + 1, 6], 1.4, ['guest'], 'close', BANK + 1.8, { near: { p: [-14.2, BANK + 0.5, 8], r: 2.4 }, at: V(-14.6, BANK + 2.6, 7.6) });
  orb('dzezva', [-15.2, BANK + 0.95, 5.8], 0.6, ['dzezva'], 'close', BANK + 1.2, { near: { p: [-14.2, BANK + 0.5, 4.2], r: 2.2 }, at: V(-14.4, BANK + 2.4, 4.4) });
  orb('fildzan', [-15.3, BANK + 0.9, 6.25], 0.6, ['fildzan', 'coffee'], 'close', BANK + 1.2, { requires: ['dzezva'], near: { p: [-14.2, BANK + 0.5, 4.2], r: 2.2 }, at: V(-14.3, BANK + 2.4, 5.0) });
  orb('lokum', [-15.7, BANK + 0.9, 5.62], 0.5, ['lokum'], 'close', BANK + 1.2, { requires: ['fildzan'], near: { p: [-14.2, BANK + 0.5, 4.2], r: 2.2 }, at: V(-14.6, BANK + 2.4, 4.1) });
  // an umbrella left open to dry by the café door
  b.object(() => {
    const U = { tag: 'umbrella', col: '#2f5f9a', bleed: '#1f4277', hull: true, solid: false };
    A(GEO.CYL, -19.6, BANK + 0.55, 12.2, { ...U, col: '#3a3632', hull: false }, 0, 0.5, 0, [0.02, 1.2, 0.02]);
    A(GEO.CONE8, -19.35, BANK + 0.32, 12.6, U, 0, 2.05, 0, [0.85, 0.45, 0.85]);
  });
  orb('kisobran', [-19.4, BANK + 0.6, 12.5], 1.2, ['umbrella'], 'close', BANK + 1.2, { near: { p: [-17.6, BANK + 0.5, 12.8], r: 2.4 }, at: V(-19.2, BANK + 2.6, 12.4) });

  // ---------- the chestnut seller's brazier, with glowing embers and smoke ----------
  b.object(() => {
    A(GEO.CYL12, 11, BANK + 0.5, -8, { tag: 'seller', col: '#3d4046', bleed: '#2a2c30', edge: 40 }, 0, 0, 0, [0.45, 1, 0.45]);
    A(GEO.CYL12, 11, BANK + 1.03, -8, { tag: 'coals', col: '#e2502a', bleed: '#ff9a2e', hatch: 0.2, edge: 50, solid: false }, 0, 0, 0, [0.4, 0.06, 0.4]);
    for (let i = 0; i < 11; i++) A(GEO.SPH, 11 + Math.cos(i * 2.4) * 0.25 * (i % 3) / 2, BANK + 1.11, -8 + Math.sin(i * 2.4) * 0.25 * (i % 3) / 2, { tag: 'chestnut', col: '#6a3a1e', bleed: '#4a2410', solid: false, ink: false }, 0, 0, 0, [0.06, 0.045, 0.06]);
    box(1.0, 0.75, 0.6, 12.1, BANK + 0.38, -8.2, { tag: 'seller', col: '#8a6646', bleed: '#6a4c34', pat: PAT.planks, ps: 3 });
  });
  orb('kesten', [11, BANK + 1.15, -8], 0.8, ['chestnut'], 'close', BANK + 1.4, { near: { p: [9.6, BANK + 0.5, -6.6], r: 2.4 }, at: V(10.3, BANK + 2.6, -7.2) });
  orb('zar', [11, BANK + 1.05, -8], 0.9, ['coals', 'smoke'], 'close', BANK + 1.4, { requires: ['kesten'], near: { p: [9.6, BANK + 0.5, -6.6], r: 2.4 }, at: V(11.6, BANK + 2.8, -7.0) });
  orb('prodavac', [12.1, BANK + 1, -9.1], 1.5, ['seller'], 'close', BANK + 2.2, { near: { p: [9.6, BANK + 0.5, -6.6], r: 2.4 }, at: V(13.2, BANK + 2.8, -8.8) });

  // ---------- the fruit market: a stall with a striped awning, apples, grapes, pumpkins and baskets ----------
  b.object(() => {
    const ST = { tag: 'stall', col: '#8a6646', bleed: '#6a4c34', pat: PAT.planks, ps: 3 };
    box(1.6, 0.9, 4.4, 17, BANK + 0.45, 10, ST);
    for (const [dx, dz] of [[-0.75, -2.15], [-0.75, 2.15], [0.75, -2.15], [0.75, 2.15]]) A(GEO.CYL, 17 + dx, BANK + 1.25, 10 + dz, { ...ST, pat: 0, solid: false }, 0, 0, 0, [0.05, 2.5, 0.05]);
    for (let i = 0; i < 6; i++) box(1.9, 0.06, 0.78, 17, BANK + 2.55 - (i % 2) * 0.001, 8.05 + i * 0.78, { tag: 'stall', col: i % 2 ? '#f6f1e6' : '#b8452c', bleed: i % 2 ? '#e6dccb' : '#8a3020', hatch: 0.4, solid: i === 0 }, 0, 0, -0.18);
    for (const [dz, c] of [[8.5, 0], [10, 1], [11.5, 0]]) A(GEO.CYL12, 17, BANK + 1.02, dz, { tag: 'basket', col: '#b8904e', bleed: '#8e6a32', pat: PAT.planks, ps: 5, edge: 50 }, 0, 0, 0, [0.5, 0.26, 0.5]);
    for (let i = 0; i < 14; i++) A(GEO.SPH, 17 + Math.cos(i * 2.2) * 0.3, BANK + 1.2, 8.5 + (i < 7 ? 0 : 3) + Math.sin(i * 2.2) * 0.3, { tag: 'apple', col: i % 3 ? '#c8302a' : '#d9a23a', bleed: '#8a1f1a', solid: false, ink: false, hull: true }, 0, 0, 0, 0.12);
    for (let i = 0; i < 12; i++) A(GEO.SPH, 17 + Math.cos(i * 1.7) * (0.12 + (i % 3) * 0.08), BANK + 1.18 + (i % 4) * 0.06, 10 + Math.sin(i * 1.7) * 0.22, { tag: 'grapes', col: '#6a3a7a', bleed: '#4a2458', solid: false, ink: false, hull: true }, 0, 0, 0, 0.07);
    for (const [x, z, sc] of [[15.6, 7.4, 0.42], [15.3, 8.3, 0.34], [15.7, 12.7, 0.5], [15.2, 11.9, 0.32]]) A(GEO.SPH, x, BANK + sc * 0.7, z, { tag: 'pumpkin', col: '#e8792e', bleed: '#c45a1e', hull: true }, R() * 6, 0, 0, [sc, sc * 0.7, sc]);
  });
  orb('pijaca', [17, BANK + 1.5, 10], 3.4, ['stall'], 'close', BANK + 3.2, { front: -Math.PI / 2, near: { p: [14.4, BANK + 0.5, 12.6], r: 2.4 }, at: V(14.6, BANK + 3.6, 12.4) });
  orb('korpa', [17, BANK + 1.05, 10], 1.6, ['basket'], 'close', BANK + 1.6, { near: { p: [14.8, BANK + 0.5, 10], r: 2.4 }, at: V(15.6, BANK + 2.8, 9.4), front: -Math.PI / 2 });
  orb('jabuka', [17, BANK + 1.2, 8.5], 0.8, ['apple'], 'close', BANK + 1.6, { requires: ['korpa'], near: { p: [14.8, BANK + 0.5, 8.6], r: 2.4 }, at: V(15.8, BANK + 2.8, 8.2), front: -Math.PI / 2 });
  orb('grozdje', [17, BANK + 1.25, 10], 0.7, ['grapes'], 'close', BANK + 1.6, { requires: ['korpa'], near: { p: [14.8, BANK + 0.5, 10], r: 2.4 }, at: V(15.8, BANK + 2.8, 10.4), front: -Math.PI / 2 });
  orb('bundeva', [15.5, BANK + 0.4, 10], 3, ['pumpkin'], 'close', BANK + 1, { near: { p: [14.2, BANK + 0.5, 10], r: 2.4 }, at: V(14.6, BANK + 2.2, 10), front: -Math.PI / 2 });
  orb('prodavacica', [18.6, BANK + 1, 10], 1.6, ['sellerw'], 'close', BANK + 2.2, { near: { p: [14.8, BANK + 0.5, 11.4], r: 2.4 }, at: V(19.6, BANK + 2.8, 11.2) });

  // ---------- puddles from last night's rain ----------
  for (const [x, z, s] of [[5, 13, 1.3], [-7, 10.5, 0.9], [26, 0, 1.1], [-44, -10, 1], [34, 36, 1.4]]) A(GEO.CYL16, x, BANK + 0.13, z, { tag: 'puddle', col: '#9fbccb', bleed: '#6f94aa', hatch: 0, edge: 50, solid: false }, R() * 6, 0, 0, [s, 0.02, s * 0.7]);
  orb('lokva', [5, BANK + 0.2, 13], 2, ['puddle'], 'combo', BANK + 0.6, { near: { p: [7.4, BANK + 0.5, 14.2], r: 2.6 } });

  // ---------- the river: the Latin Bridge, the Vijećnica, the tram, the fog, lanterns and trees along the bank ----------
  b.object(() => {
    const BR = { tag: 'bridge', col: '#d8ccb2', bleed: '#b0a284', pat: PAT.blocks, ps: 0.7 }, x = -35, w = 4.6, rise = 1.2, half = (RZ1 - RZ0 + 6) / 2;
    const tilt = Math.atan2(rise, half);
    for (const s of [-1, 1]) {
      box(w, 0.7, Math.hypot(half, rise) + 0.2, x, BANK + rise / 2 - 0.3, RZ + s * half / 2, BR, 0, -s * tilt);
      for (const px of [-w / 2 + 0.2, w / 2 - 0.2]) box(0.4, 0.8, Math.hypot(half, rise), x + px, BANK + rise / 2 + 0.4, RZ + s * half / 2, { ...BR, solid: s > 0 || px > 0 }, 0, -s * tilt);
      box(w, BANK - WATER_Y + 1, 2.4, x, (BANK + WATER_Y - 1) / 2, RZ + s * 4.6, BR);      // the piers by the banks
    }
    for (let i = 0; i <= 12; i++) {     // the arch, stone by stone
      const a = Math.PI * i / 12, r = 3.5, z = RZ + Math.cos(a) * r, y = WATER_Y + 0.4 + Math.sin(a) * r * 1.05;
      box(w, 0.9, 1.0, x, y, z, { ...BR, col: '#cfc0a2' }, 0, a - Math.PI / 2);
    }
  });
  orb('cuprija', [-35, BANK + 0.6, RZ], 7, ['bridge'], 'close', BANK + 1.8, { front: Math.PI / 2 });
  // the Vijećnica: yellow walls with rust-red stripes, arched windows, a little dome on the roof
  b.object(() => {
    const x = 62, z = 24, w = 24, d = 16, h = 12, CH = { tag: 'cityhall', col: '#ecd09a', bleed: '#d0aa66', pool: 1 };
    box(w, h, d, x, BANK + h / 2, z, CH);
    for (let i = 0; i < 7; i++) {      // the stripes, all round
      const y = BANK + 1.4 + i * 1.5;
      for (const [px, pz, sw, sd] of [[0, d / 2 + 0.04, w, 0.06], [0, -d / 2 - 0.04, w, 0.06], [w / 2 + 0.04, 0, 0.06, d], [-w / 2 - 0.04, 0, 0.06, d]]) box(sw + 0.08, 0.5, sd + 0.08, x + px, y, z + pz, { tag: 'stripes', col: '#c25a34', bleed: '#9a3a22', solid: false, ink: false, hatch: 0.4 });
    }
    for (let i = 0; i < 6; i++) for (const fy of [3.6, 8.1]) { const wx = x - w / 2 + 2.4 + i * 3.84; box(1.3, 2.2, 0.12, wx, BANK + fy, z + d / 2 + 0.1, { ...CH, col: '#5a6f86', bleed: '#3e5268', solid: false }); A(GEO.CYL, wx, BANK + fy + 1.1, z + d / 2 + 0.1, { ...CH, col: '#5a6f86', bleed: '#3e5268', solid: false, ink: false }, 0, Math.PI / 2, 0, [0.65, 0.12, 0.65]); }
    box(6, 4.2, 2.4, x, BANK + 2.1, z + d / 2 + 1.2, CH); box(3, 3, 0.1, x, BANK + 1.5, z + d / 2 + 2.45, { ...CH, col: '#6a4a30', bleed: '#4a3020', solid: false });
    A(roofGeoShop(w + 0.6, d + 0.6, 2.2), x, BANK + h, z, { ...CH, col: '#8a8f86', bleed: '#6a6f68', pat: PAT.roof, ps: 1.2 }, Math.PI / 2);
    A(GEO.HEMI, x, BANK + h + 2.0, z, { ...CH, col: '#7a9a8a', bleed: '#567a68', hull: true }, 0, 0, 0, [2.2, 2.4, 2.2]);
  });
  orb('vijecnica', [62, BANK + 6, 24], 13, ['cityhall'], 'close', BANK + 16.6, { front: 0 });
  orb('pruge', [62, BANK + 6, 32.1], 11, ['stripes'], 'close', BANK + 9, { requires: ['vijecnica'], front: 0, at: V(52, BANK + 3, 35.4), near: { p: [52, BANK + 0.5, 35.4], r: 3 } });
  // the tram, waiting at its stop (once the town wakes it runs up and down the river road)
  const tram = b.object(() => {
    const T = { tag: 'tram', col: '#f2c230', bleed: '#d9a625', hull: true, ink: false };
    const body = box(12, 2.6, 2.5, 30, BANK + 1.75, TRAM_Z, { ...T, solid: true });
    box(12.1, 0.5, 2.56, 30, BANK + 0.75, TRAM_Z, { ...T, col: '#c0392b', bleed: '#8a2a20', solid: false });
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) box(1.3, 0.95, 0.06, 25.2 + i * 1.95, BANK + 2.05, TRAM_Z + s * 1.26, { ...T, col: '#4a5f72', bleed: '#2e4052', solid: false, hull: false, ink: false });
    box(11.4, 0.3, 2.2, 30, BANK + 3.18, TRAM_Z, { ...T, col: '#d9d4c8', bleed: '#b4ae9e', solid: false });
    A(GEO.CYL, 30, BANK + 3.65, TRAM_Z, { ...T, col: '#3a3632', solid: false, hull: false }, 0, 0, 0.6, [0.04, 1.2, 0.04]);
    return body;
  });
  orb('tramvaj', [30, BANK + 1.8, TRAM_Z], 6.5, ['tram'], 'close', BANK + 3.6, { front: 0 });
  // the fog lying low over the water
  tag('fog').hullWidth = 1.4;
  for (let x = -110; x <= 110; x += 13) A(GEO.ICO2, x + rr(-3, 3), WATER_Y + 0.9 + rr(0, 0.5), RZ + rr(-1.5, 1.5), { tag: 'fog', col: '#eef1f4', bleed: '#c9d2dc', hull: true, hatch: 0.15, solid: false, sway: -2.5 }, R() * 6, 0, 0, [rr(6, 8.5), rr(0.35, 0.55), rr(2.8, 3.8)]);
  orb('magla', [-10, WATER_Y + 1.2, RZ], 6, ['fog'], 'combo', WATER_Y + 2.5, { near: { p: [-10, BANK + 0.5, 37.4], r: 3 } });
  orb('voda', [10, WATER_Y, RZ], 6, ['river'], 'combo', WATER_Y + 0.4, { swim: { p: [10, WATER_Y, RZ], r: 8 } });
  // lanterns and trees along the river road
  tag('lamp').hullWidth = 1.2;
  for (let x = -96; x <= 96; x += 16) if (Math.abs(x + 35) > 5) K.lamp(x, 38.4, { tag: 'lamp' });
  for (const [x, z] of [[-10, -9], [9, 13], [-11, 13]]) K.lamp(x, z, { tag: 'lamp' });
  orb('fenjer', [-8, BANK + 3.8, 38.4], 2.2, ['lamp'], 'combo', BANK + 4.8, { near: { p: [-8, BANK + 0.5, 37], r: 2.4 } });
  const treeSpots = [];
  for (let x = -100; x <= 100; x += 16) if (Math.abs(x + 35) > 6 && Math.abs(x - 62) > 14) treeSpots.push([x + 7, 36.6]);
  treeSpots.push([-10, -3], [10, 3.5], [24, 18], [-34, 16], [40, -14], [-60, -30], [55, -40], [-20, -45], [30, -50]);
  for (const [x, z] of treeSpots) K.tree(x, z, rr(0.85, 1.15), { season: 'autumn', crownTag: 'leaves', trunkTag: 'trunk', y: yAt(z) });
  for (const [x, z] of treeSpots.slice(0, 12)) for (let i = 0; i < 3; i++) A(GEO.ICO, x + rr(-1.4, 1.4), BANK + 0.15, z + rr(-0.6, 0.6), { tag: 'leaves', col: pick(LEAVES.autumn)[0], bleed: '#a83a1f', hull: true, solid: false }, R() * 6, 0, 0, [rr(0.5, 0.8), 0.18, rr(0.4, 0.6)]);      // fallen leaves in little heaps
  orb('lisce', [9, BANK + 4.4, 3.5], 3.2, ['leaves'], 'combo', BANK + 6.2, { wideView: { from: [80, BANK + 70, 110], to: [-80, BANK + 70, 110], look: [30, BANK, 10], lookTo: [-30, BANK, 10] } });
  tag('leaves').holdRest = 2.9;
  orb('deblo', [24, BANK + 1.6, 18], 2.2, ['trunk'], 'combo', BANK + 3.2, { near: { p: [25.6, BANK + 0.5, 19.4], r: 2.4 }, at: V(25.4, BANK + 2.6, 18.6) });
  tag('trunk').holdRest = 2.9;

  // ---------- people ----------
  const S0 = BANK + 0.12;
  const people = [
    { kind: 'hammer', tag: 'smith', toolTag: 'hammer', x: -33, y: S0, z: -10.35, ry: 0 },      // facing the street, his anvil before him
    { kind: 'sell', tag: 'seller', x: 12.1, y: S0, z: -9.1, ry: 0.3 },
    { kind: 'sell', tag: 'sellerw', x: 18.6, y: S0, z: 10, ry: -Math.PI / 2, woman: true, scarf: true },
    { kind: 'drink', tag: 'guest', x: -16.55, y: BANK + 0.245, z: 6, ry: Math.PI / 2 },
    { kind: 'read', tag: 'read', toolTag: 'news', x: -6, y: BANK + 0.3, z: 21.9, ry: Math.PI },      // facing the square
    { kind: 'sweep', tag: 'sweep', x: 27, y: S0, z: -16, ry: 0.6 },
    { kind: 'walk', tag: 'stroll', x: -60, y: S0, z: 35.4, to: [12, 35.4], speed: 0.9, woman: true, scarf: true }, { kind: 'walk', tag: 'stroll', x: -61, y: S0, z: 34.5, to: [11, 34.5], speed: 0.9 },
  ];
  K.bench(-6, 21.9, Math.PI, { tag: 'bench' });
  orb('citati', [-6, BANK + 1.2, 21.8], 1.6, ['read'], 'close', BANK + 2.2, { near: { p: [-4.2, BANK + 0.5, 20.2], r: 2.4 }, at: V(-7.6, BANK + 2.6, 21.2) });
  orb('novine', [-6, BANK + 1.5, 21.4], 0.8, ['news'], 'close', BANK + 1.9, { requires: ['citati'], near: { p: [-4.2, BANK + 0.5, 20.2], r: 2.4 }, at: V(-4.6, BANK + 2.6, 20.6) });
  orb('mesti', [27, BANK + 1, -16], 1.6, ['sweep'], 'close', BANK + 2.2, { near: { p: [28.8, BANK + 0.5, -14.6], r: 2.4 }, at: V(28.4, BANK + 2.8, -16.6) });
  orb('setati', [-48, BANK + 1, 35], 2.2, ['stroll'], 'close', BANK + 2.2, { near: { p: [-48, BANK + 0.5, 37.2], r: 2.6 }, at: V(-49.6, BANK + 2.8, 36.4) });

  // ---------- the mahala on the hill and the houses of the south bank ----------
  const houses = [];
  for (const [x, z, w, d, h] of [[-62, -84, 7, 6, 5.5], [-44, -88, 6.5, 6, 6], [-24, -82, 7, 6.5, 5], [14, -86, 7, 6, 5.8], [34, -82, 6.5, 6, 5.2], [54, -88, 7.5, 6.5, 6],
    [-52, -106, 7, 6, 5.5], [-30, -110, 6.5, 6, 5.2], [22, -108, 7, 6, 5.6], [44, -112, 6.5, 6, 5], [-14, -126, 6, 5.5, 5], [30, -130, 6.5, 6, 5.4],
    [-70, 66, 8, 6.5, 6], [-48, 70, 7, 6, 5.5], [-16, 64, 7.5, 6.5, 6.2], [12, 72, 7, 6, 5.4], [40, 66, 8, 7, 6], [66, 70, 7, 6, 5.6], [-30, 92, 7, 6, 5], [24, 96, 7.5, 6.5, 5.8], [56, 98, 7, 6, 5.2]]) {
    const yb = yAt(z + d / 2), front = z > 0 ? Math.PI : 0;
    if (z < HILL0) box(w + 0.6, 4, d + 0.6, x, yb - 2 + 0.01, z, { tag: 'house', col: PAL.STONES[1][0], bleed: PAL.STONES[1][1], pat: PAT.blocks, ps: 0.6 });      // a stone footing cut into the slope
    houses.push(K.house({ x, z, rot: front, y: yb, w, d, h, rh: 2.4, roof: 'hip', kind: 'tile' }));
  }
  // the town's own houses, in the blocks off the bazaar (part of the mahala too), and more up the hill
  for (const [x, z, rot] of [[-70, -40, 0], [-70, -6, Math.PI / 2], [-88, 10, Math.PI / 2], [-66, 22, Math.PI], [36, -40, 0], [52, -30, 0], [66, -46, 0], [84, -24, -Math.PI / 2],
    [86, -2, -Math.PI / 2], [40, -26, Math.PI], [92, 14, -Math.PI / 2], [-50, -52, 0], [-30, -58, 0], [14, -58, 0], [-96, -50, 0]]) houses.push(K.house({ x, z, rot, w: rr(6.5, 8), d: rr(6, 7), h: rr(5, 6.4), rh: 2.4, roof: 'hip', kind: 'tile' }));
  for (let i = 0; i < 26; i++) {
    const z = rr(-142, -78), x = rr(-100, 100); if (Math.abs(x) < 9 || houses.some((h) => Math.hypot(h.x - x, h.z - z) < 9)) continue;
    const yb = yAt(z + 3); box(7.4, 4, 6.8, x, yb - 2 + 0.01, z, { tag: 'house', col: PAL.STONES[1][0], bleed: PAL.STONES[1][1], pat: PAT.blocks, ps: 0.6 });
    houses.push(K.house({ x, z, rot: 0, y: yb, w: 6.8, d: 6.2, h: rr(4.8, 6), rh: 2.3, roof: 'hip', kind: 'tile' }));
  }
  for (let i = 0; i < 44; i++) {
    const z = rr(-148, -76), x = rr(-110, 110); if (Math.abs(x) < 7 || houses.some((h) => Math.hypot(h.x - x, h.z - z) < 6.5)) continue;
    K.tree(x, z, rr(0.8, 1.2), { season: 'autumn', crownTag: 'leaves', trunkTag: 'trunk', y: yAt(z) - 0.2 });
  }
  // the Gazi Husrev-beg mosque's dome and minaret (coloured with the rest of the town in the finale)
  b.object(() => {
    const MQ = { tag: 'mosque', col: '#e6dccb', bleed: '#cbbfa6', pat: PAT.blocks, ps: 0.6, pool: 1 }, x = -82, z = 34 - 60;
    box(13, 8, 13, x, BANK + 4, z, MQ); A(GEO.HEMI, x, BANK + 8, z, { ...MQ, col: '#8f9aa0', bleed: '#6c777e', pat: 0, hull: true }, 0, 0, 0, [5.6, 5, 5.6]);
    A(GEO.CYL, x + 8.2, BANK + 11, z - 4, { ...MQ, edge: 40 }, 0, 0, 0, [0.9, 22, 0.9]); A(GEO.CONE8, x + 8.2, BANK + 23.6, z - 4, { ...MQ, col: '#8f9aa0', bleed: '#6c777e', pat: 0, hull: true }, 0, 0, 0, [0.95, 3.2, 0.95]);
    A(GEO.CYL, x + 8.2, BANK + 18, z - 4, { ...MQ, edge: 40 }, 0, 0, 0, [1.35, 0.4, 1.35]);
  });
  orb('mahala', [-24, yAt(-82) + 4, -82], 9, ['house', 'roof', 'window', 'door', 'chimney'], 'combo', yAt(-82) + 9.4);
  for (const t of ['house', 'roof', 'window', 'door', 'chimney']) tag(t).holdRest = 2.9;
  orb('brdo', [0, yAt(-110) + 1, -110], 12, ['hill'], 'combo', yAt(-110) + 2, { near: { p: [0, yAt(-100) + 0.5, -100], r: 4 } });
  tag('hill').holdRest = 2.9;

  // ---------- Žuta tabija: the yellow bastion at the top of the hill, with its cannon ----------
  b.object(() => {
    const F = { tag: 'fortress', col: '#e6bf58', bleed: '#c49a34', pat: PAT.blocks, ps: 0.8, pool: 1 }, y = TOP;
    box(32, 4.6, 2.4, 0, y + 2.3, -153.2, F);                                                        // the front wall, facing the town
    for (const s of [-1, 1]) box(2.4, 4.6, 16, s * 16.6, y + 2.3, -160, F, s * 0.18);              // its sides, angled back
    box(30, 4.4, 13, 0, y + 2.2, -160.6, { ...F, col: '#ddb550' });                                  // the bastion's body
    slab(-15, 15, -167, -154.4, { tag: 'fortress', col: '#cfc6b2', bleed: '#ada38e', pat: PAT.blocks, ps: 0.5 }, y + 4.45, 0.1);      // the terrace on top
    for (let i = 0; i < 10; i++) box(1.6, 0.8, 0.9, -13.6 + i * 3.02, y + 5, -152.6, F);           // the parapet, with gaps
  });
  b.object(() => {
    const C = { tag: 'cannon', col: '#3a3d42', bleed: '#25272b', hull: true }, y = TOP + 4.5;
    A(GEO.CYL12, 2, y + 0.78, -155.2, C, 0, Math.PI / 2 - 0.12, 0, [0.28, 2.6, 0.28]);
    for (const s of [-1, 1]) A(GEO.CYL16, 2 + s * 0.55, y + 0.42, -155.9, { ...C, col: '#6a4a30', bleed: '#4a3220' }, 0, 0, Math.PI / 2, [0.42, 0.12, 0.42]);
    box(0.9, 0.45, 1.6, 2, y + 0.45, -156.1, { ...C, col: '#6a4a30', bleed: '#4a3220', hull: false });
  });
  orb('tvrdjava', [0, TOP + 3, -158], 12, ['fortress'], 'close', TOP + 6.6, { stage: 2, front: 0 });
  orb('top', [2, TOP + 5.2, -155.4], 1.8, ['cannon'], 'close', TOP + 6, { requires: ['tvrdjava'], near: { p: [5, TOP + 5, -157], r: 2.6 }, at: V(4.6, TOP + 7, -156.6) });

  K.finish();
  // the tram's mesh and its collider, so it can run once the town wakes
  const tramParts = { body: tram };
  return {
    clouds: K.clouds, colliders: b.colliders, orbs: K.orbs, people, animals: [], sunPos,
    start: V(6, 0, 20), fleur: V(0, 58, -30), pigeons: { x: 6, y: BANK + 0.12, z: 5, fx: 8, fz: 0, fh: 9 },
    smoke: [V(11, BANK + 1.1, -8)], tramParts, trees: K.trees,
  };
}

// a low, wide shop roof (a hipped roof with a short ridge)
function roofGeoShop(w, d, rh) {
  const hw = w / 2, hd = d / 2, rl = Math.max(0.01, d - w * 0.6), hr = rl / 2, pos = [];
  const E = [[-hw, 0, -hd], [hw, 0, -hd], [hw, 0, hd], [-hw, 0, hd]], R0 = [0, rh, -hr], R1 = [0, rh, hr], t = (...p) => pos.push(...p.flat());
  t(E[2], E[1], R0); t(E[2], R0, R1); t(E[0], E[3], R1); t(E[0], R1, R0); t(E[3], E[2], R1); t(E[1], E[0], R0); t(E[0], E[1], E[2]); t(E[0], E[2], E[3]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(pos.length / 3 * 2).fill(0), 2)); g.computeVertexNormals(); return g;
}

// ---------- the living town: leaves falling from the trees, the tram, and the finale's cannon shot and gust of wind ----------
let fall = null, tramX = 0, tramDir = 1, tramWait = 0;
// where a leaf lands: the ground, the hill, or the Miljacka (which carries it off downstream)
const ground = (x, z) => (z > RZ0 && z < RZ1 ? { y: WATER_Y, flow: [0.7, 0] } : { y: yAt(z) + 0.13 });      // (+ the paving)
export default {
  id: 'sarajevo', name: 'Sarajevo', WORDS, ORDER, CULTURE, art,
  bounds: { boundsRadius: 178, ceiling: 100 },      // (the fortress is 160 m north of the square)
  build(scene) {
    const w = build(scene);
    fall = makeFall(scene, { kind: 'autumn', trees: w.trees.filter((t) => t.tag === 'leaves'), ground, n: 900, cols: ['#e08a2e', '#d9612e', '#e8b13a', '#c9452a', '#d99a3a', '#b8742a'] });
    return w;
  },
  text: {
    firstHint: 'fly to the glowing orb and land on the green dome',
    first: 'New orbs have appeared all over Sarajevo. Find them in any order.',
    last: { id: 'tvrdjava', msg: 'Only the fortress is left. Its orb is waiting at the top of the hill.' },
    fleur: 'Something golden is shining high above Baščaršija. Fly through it.',
    awake: 'Sarajevo has awakened. You can now explore it freely.',
  },
  finale: {
    word: 'jesen', photo: { from: V(40, 40, -64), to: V(0, 14, 10) }, paints: ['cloud', 'embank', 'bench', 'mosque'],
    P: [[2, 10, 46, -10], [4.5, 22, 34, 10], [7, 4, 24, 26], [9.5, -28, 20, 40], [12, -8, 18, 44], [14, 22, 22, 36], [16, 34, 28, 6], [18, 24, 36, -50], [20, 10, 48, -110],
      [22, 0, 54, -140], [24, -14, 60, -168], [26, -32, 64, -150], [28, -24, 66, -110]],
    shots: [
      { t0: 0, t1: 7.5, from: V(24, 30, 40), to: V(18, 34, 34), lookFrom: V(-60, 62, -80), lookTo: V(-75, 60, -92) },
      { t0: 7.5, t1: 14, from: V(64, 46, 92), to: V(30, 40, 84), lookFrom: V(0, 14, 4), lookTo: V(-6, 12, -6) },
      { t0: 14, t1: 20, from: V(14, 50, -104), to: V(-4, 52, -112), lookFrom: V(1, 44, -156), lookTo: V(0, 44, -155) },
      { t0: 20, t1: 26, from: V(42, 40, -60), to: V(30, 46, -84), lookFrom: V(0, 18, 4), lookTo: V(0, 20, -6) },
    ],
    // the cannon on Žuta tabija fires at sunset, and a gust of wind shakes the leaves from the trees of Baščaršija
    climax(c) {
      c.audio.boom(0.9); c.splashFx(V(2, TOP + 6.2, -152.6), 0.6);
      fall.gust();
    },
  },
  onAlive() { fall.show(); },
  // every frame: the leaves fall, the tram runs once the town is alive
  update(dt, time, life, c) {
    fall.update(dt);
    if (life < 0.5) return;
    // the tram: along the river road, a pause at each end
    if (tramWait > 0) tramWait -= dt;
    else { tramX += tramDir * dt * 4.5; if (tramX > 55 || tramX < -110) { tramDir *= -1; tramWait = 4; tramX = Math.max(-110, Math.min(55, tramX)); } }
    const t = tag('tram'); if (t.mesh) t.mesh.position.x = tramX; if (t.hullMesh) t.hullMesh.position.x = tramX;
    const body = c.world.tramParts.body; if (body) { body.matrixWorld.copy(body.matrix); body.matrixWorld.elements[12] += tramX; }
  },
  ambience: {
    city: [-20, -10, 60], murmur: [[-16, 6, 22], [17, 10, 22], [0, -2, 28], [-33, -12, 26]],
    water: (p) => Math.max(0, 1 - Math.abs(p.z - RZ) / 30) * Math.max(0.2, 1 - (p.y - BANK) / 50),
  },
};
