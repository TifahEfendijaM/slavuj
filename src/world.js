// Mostar, stylised: the Neretva in its gorge, Stari Most with its two towers, the
// Kujundžiluk bazaar and the Koski Mehmed-pasha mosque on the east bank, the Crooked
// Bridge over the Radobolja creek on the west bank, old houses with stone-slab roofs.
// North is -z; the river flows south (+z). East bank is +x.
import * as THREE from 'three';
import S from './settings.js';
import { Builder, tag, PAT, rng, SUN_DIR } from './paper.js';

export const BANK = 12; // height of the bank tops; the Neretva is at 0
const { Matrix4, Vector3, Quaternion, Euler } = THREE;
const mat4 = (x, y, z, ry = 0, rx = 0, rz = 0, s = 1) => new Matrix4().compose(new Vector3(x, y, z),
  new Quaternion().setFromEuler(new Euler(rx, ry, rz, 'YXZ')), Array.isArray(s) ? new Vector3(...s) : new Vector3(s, s, s));

const BOX = new THREE.BoxGeometry(1, 1, 1), CYL = new THREE.CylinderGeometry(1, 1, 1, 8), CYL12 = new THREE.CylinderGeometry(1, 1, 1, 12);
const CONE4 = new THREE.ConeGeometry(1, 1, 4), CONE8 = new THREE.ConeGeometry(1, 1, 8);
const ICO0 = new THREE.IcosahedronGeometry(1, 0), ICO = new THREE.IcosahedronGeometry(1, 1), ICO2 = new THREE.IcosahedronGeometry(1, 2);
const DODE = new THREE.DodecahedronGeometry(1, 0), HEMI = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
const TAPER = new THREE.CylinderGeometry(0.7, 1, 1, 7), CYPRESS = new THREE.SphereGeometry(1, 9, 8), POT = new THREE.CylinderGeometry(0.8, 1, 1, 8);

// a hipped or gabled roof: eaves w x d, ridge along z with length rl, height rh. UVs are in metres.
function roofGeo(w, d, rh, rl, open = false) {
  const hw = w / 2, hd = d / 2, hr = rl / 2, pos = [], uv = [], sl = Math.hypot(hw, rh), se = Math.hypot(hd - hr, rh);
  const E = [[-hw, 0, -hd], [hw, 0, -hd], [hw, 0, hd], [-hw, 0, hd]], R0 = [0, rh, -hr], R1 = [0, rh, hr];
  const tri = (a, b, c, ua, ub, uc) => { pos.push(...a, ...b, ...c); uv.push(...ua, ...ub, ...uc); };
  tri(E[2], E[1], R0, [hd, 0], [-hd, 0], [-hr, sl]); tri(E[2], R0, R1, [hd, 0], [-hr, sl], [hr, sl]);
  tri(E[0], E[3], R1, [-hd, 0], [hd, 0], [hr, sl]); tri(E[0], R1, R0, [-hd, 0], [hr, sl], [-hr, sl]);
  if (!open) { tri(E[3], E[2], R1, [-hw, 0], [hw, 0], [0, se]); tri(E[1], E[0], R0, [hw, 0], [-hw, 0], [0, se]); }
  tri(E[0], E[1], E[2], [0, 0], [0, 0], [0, 0]); tri(E[0], E[2], E[3], [0, 0], [0, 0], [0, 0]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals(); return g;
}

// a rocky cliff face sloping from the bank edge down into the river, between z0 and z1
export const cliffX = (y) => 13.25 - 4.7 * (12.02 - y) / 13.2;      // how far from the river's middle the cliff is at height y
function cliffGeo(side, z0, z1, R) {
  const rows = Math.max(2, Math.round((z1 - z0) / 4)), K = 6, P = [], pos = [];
  for (let i = 0; i <= rows; i++) {
    const z = z0 + (z1 - z0) * i / rows, end = i === 0 || i === rows, row = [];
    for (let k = 0; k < K; k++) {
      const t = k / (K - 1), mid = k > 0 && k < K - 1;
      row.push([side * (13.25 - 4.7 * t - (mid ? (R() - 0.42) * 2.1 : 0)), 12.02 - 13.2 * t + (mid ? (R() - 0.5) * 1.9 : 0), z + (end || !mid ? 0 : (R() - 0.5) * 2.4)]);
    }
    P.push(row);
  }
  const tri = (a, b, c) => (side > 0 ? pos.push(...a, ...c, ...b) : pos.push(...a, ...b, ...c));
  for (let i = 0; i < rows; i++) for (let k = 0; k < K - 1; k++) { const a = P[i][k], b = P[i + 1][k], c = P[i + 1][k + 1], d = P[i][k + 1]; tri(a, b, c); tri(a, c, d); }
  for (const row of [P[0], P[rows]]) for (let k = 0; k < K - 1; k++) {   // close the ends
    const a = row[k], b = row[k + 1], c = [side * 13.25, b[1], b[2]], d = [side * 13.25, a[1], a[2]];
    pos.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
}

// palettes: [colour, colour it bleeds into]
const WALLS = [['#f3e7cd', '#e9d3a8'], ['#ecd29f', '#e0b97c'], ['#f4dccd', '#eac3ab'], ['#f6f1e6', '#e6dccb'], ['#efdf9c', '#e2c874'], ['#e6cbaa', '#d6b189'], ['#dde3d3', '#c5d0bb'], ['#f0c9a8', '#e3ad8a']];
const STONES = [['#d9ceb6', '#bfb092'], ['#c4beb4', '#a29c94'], ['#d6ba90', '#b3956a'], ['#bcafa2', '#978a7c'], ['#e6dfd0', '#cbc2ad']];   // masonry
const BOULDERS = [['#8f8578', '#6d665d'], ['#b39468', '#8a6e4a'], ['#6f7f8c', '#55626e'], ['#a8785e', '#84584a'], ['#8b8f72', '#667052'], ['#a59a8c', '#7d7468'], ['#7b6a5e', '#5a4c44'], ['#c2b08a', '#9c8a62'], ['#66696b', '#4a4d50']];   // natural rock: ochre, slate, rust, moss, grey
const SLABS = [['#9c978c', '#827e76'], ['#8d9197', '#757b85'], ['#a79f90', '#8e8474'], ['#96958a', '#7c8076']];
const TILES = [['#cf5433', '#a8452f'], ['#c7643c', '#a44b2c'], ['#b9482f', '#96392a'], ['#d4734a', '#b4552f']];
const TRIMS = ['#4f8068', '#3f6f9a', '#8a4b2c', '#a3402f', '#c69a3a', '#5d7b8a'];
const DOORS = ['#7c4a26', '#5f6f4a', '#3d5f7a', '#8c3f2a', '#6a4a36'];
const GREENS = [['#5a9148', '#3f7a45'], ['#6f9f45', '#55883c'], ['#48845a', '#356b4c'], ['#80a851', '#62903f'], ['#5f8f3c', '#4a7634']];
const GRASS = [['#8fb05a', '#7aa04c'], ['#9cb866', '#86a653'], ['#86a85c', '#6f9650'], ['#a3ba6c', '#8aa858']];
const FLOWERS = ['#e0453a', '#f08fb0', '#f2c230', '#8f6fd0', '#f6f0e6', '#ee7a2e', '#d94f8a'];
const KILIMS = [['#b3312c', '#28406e'], ['#8f2b3a', '#d9a23a'], ['#2f5f7a', '#b8452c'], ['#a8402a', '#3f6b4a'], ['#6a2f5a', '#d0a040']];
const STREET = { tag: 'street', col: '#bfa88e', bleed: '#9a8068', pat: PAT.cobble, ps: 1.1 };

export function buildWorld(scene) {
  const C = S.colors, b = new Builder(), R = rng(7), R2 = rng(23);   // R2: for things added later, so the older ones keep their colours
  const pick = (a) => a[Math.floor(R() * a.length)], rr = (lo, hi) => lo + R() * (hi - lo);
  const A = (geo, x, y, z, o, ry = 0, rx = 0, rz = 0, s = 1) => b.add(geo, mat4(x, y, z, ry, rx, rz, s), o);
  const box = (w, h, d, x, y, z, o, ry = 0, rx = 0, rz = 0) => A(BOX, x, y, z, o, ry, rx, rz, [w, h, d]);
  const slab = (x0, x1, z0, z1, o, y = BANK + 0.05, h = 0.1) => box(x1 - x0, h, z1 - z0, (x0 + x1) / 2, y, (z0 + z1) / 2, o);
  const orbs = [];
  const orb = (id, focus, size, tags, shot, top, extra = {}) => orbs.push({ id, focus: new Vector3(...focus), size, tags, shot,
    at: new Vector3(focus[0], top + S.orb.hoverHeight, focus[2]), stage: 1, ...extra });
  const SL = { x: 57, y: BANK + 0.12, z: 72.5 };   // where the playground slide stands
  const local = (h, lx, ly, lz) => new Vector3(lx, ly, lz).applyMatrix4(mat4(h.x, BANK, h.z, h.rot || 0));

  // ---------- sky, sun, clouds ----------
  tag('sky').side = THREE.BackSide; tag('sky').mode = 'one'; tag('sky').radius = 1300; tag('sky').dur = 6;
  tag('sun').mode = 'one'; tag('sun').radius = 60; tag('sun').dur = 2.5;
  A(new THREE.SphereGeometry(700, 32, 20), 0, 0, 0, { tag: 'sky', col: '#f8a55a', bleed: '#6577b6', pat: PAT.sky, hatch: 0, ink: false, solid: false });
  const sunPos = SUN_DIR.clone().multiplyScalar(520);
  const sunM = new Matrix4().lookAt(sunPos, new Vector3(0, 20, 0), new Vector3(0, 1, 0)).setPosition(sunPos);
  b.add(new THREE.CircleGeometry(30, 40).rotateY(Math.PI), sunM, { tag: 'sun', col: '#ffc23a', bleed: '#ff9a2e', hatch: 0, ink: false, solid: false });
  const sun = new THREE.Group(); sun.applyMatrix4(sunM);
  const inkBasic = new THREE.MeshBasicMaterial({ color: S.ink.color, side: THREE.DoubleSide });
  for (const [r0, ox, oy] of [[30, 0, 0], [30.8, 0.9, -0.6]]) { const ring = new THREE.Mesh(new THREE.RingGeometry(r0, r0 + 0.75, 56), inkBasic); ring.position.set(ox, oy, -0.5); sun.add(ring); }
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.1, len = 8 + R() * 7, ray = new THREE.Mesh(new THREE.PlaneGeometry(0.75, len), inkBasic);
    ray.position.set(Math.cos(a) * (38 + len / 2), Math.sin(a) * (38 + len / 2), -0.5); ray.rotation.z = a - Math.PI / 2 + (R() - 0.5) * 0.08; sun.add(ray);
  }
  scene.add(sun);

  tag('cloud').hullWidth = 2;
  const clouds = [];
  const cloud = (x, y, z, s, o = {}) => b.object(() => {
    clouds.push({ c: new Vector3(x, y, z), r: 4.1 * s });
    const drift = 14 + R() * 22;
    for (const [px, py, pz, r] of [[-2.2, 0, 0, 1.5], [-0.8, 0.5, 0.2, 1.9], [0.9, 0.45, -0.2, 2.1], [2.4, 0, 0, 1.5], [0.2, -0.25, 0.5, 1.8], [0.5, 0.1, -0.9, 1.6]])
      A(ICO2, x + px * s, y + py * s * (o.flat ?? 1), z + pz * s, { tag: 'cloud', col: '#ffffff', bleed: '#dfe7f4', hull: true, hatch: 0.6, solid: !!o.orb, orb: o.orb, sway: o.orb ? 0 : -drift }, 0, 0, 0, [r * s, r * s * 0.62, r * s]);
  });
  for (const [x, y, z, s] of [[-110, 70, -150, 7], [80, 78, -190, 9], [170, 62, 40, 7], [-180, 70, 70, 8], [20, 88, 200, 8], [-40, 84, -260, 10], [120, 74, -80, 6], [-78, 60, -92, 4.6], [34, 64, -84, 5], [-66, 68, 6, 4.4]]) cloud(x, y, z, s);
  cloud(-24, 46, -34, 2.6, { orb: 'oblak', flat: 0.5 });
  orb('oblak', [-24, 46, -34], 9, ['cloud'], 'combo', 50.3);

  // ---------- ground: two banks, the creek, the river ----------
  tag('rock').mode = 'one'; tag('rock').radius = 130; tag('river').mode = 'one'; tag('river').radius = 110;
  tag('grass').mode = 'one'; tag('grass').radius = 170; tag('street').mode = 'one'; tag('street').radius = 90;
  const ROCK = { tag: 'rock', col: '#9a8c7c', bleed: '#746a5e' };
  // the tops of the two banks are the town's paved ground: pale grey flagstones
  const GROUND = { tag: 'street', col: '#d3d1ca', bleed: '#b3b9bb', pat: PAT.blocks, ps: 0.3 };
  box(400, 14, 383, -213, BANK - 7, -158.5, GROUND); box(400, 14, 309, -213, BANK - 7, 195.5, GROUND);
  box(403.4, 5, 8.2, -211.3, 0.5, 37, ROCK); box(400, 14, 700, 213, BANK - 7, 0, GROUND);
  // the gorge: rocky cliffs sloping down to the water on both sides
  const CLIFF = { tag: 'rock', col: '#ab9c8a', bleed: '#7c7468', wall: false, edge: 14, jitter: 0.05 };
  A(cliffGeo(-1, -350, 32.9, R), 0, 0, 0, CLIFF); A(cliffGeo(-1, 41.1, 350, R), 0, 0, 0, CLIFF); A(cliffGeo(1, -350, 350, R), 0, 0, 0, CLIFF);
  const WATER = { tag: 'river', col: C.river, bleed: C.riverDeep, pat: PAT.water, hatch: 0, water: true, ink: false };
  box(26.4, 0.1, 700, 0, -0.05, 0, WATER);
  // the Radobolja creek and the waterfall where it drops into the Neretva
  tag('creek').mode = 'one'; tag('creek').radius = 70; tag('waterfall').mode = 'one'; tag('waterfall').radius = 6; tag('foam').hullWidth = 1.3;
  box(290.3, 0.1, 8, -154.85, 3.45, 37, { ...WATER, tag: 'creek', col: '#3fa3a0', bleed: '#2b8793' });
  box(0.5, 3.6, 7.4, -9.75, 1.75, 37, { tag: 'waterfall', col: '#9fd6d2', bleed: '#4fa9ac', pat: PAT.fall, hatch: 0, solid: false, ink: false });
  for (let i = 0; i < 10; i++) A(ICO, -9.25 + R2() * 0.8, 0.1, 33.8 + i * 0.72, { tag: 'foam', col: '#f4fbf8', bleed: '#cfe9e6', hull: true, hatch: 0, solid: false, sway: 0.05 }, R2() * 6, 0, 0, [0.34 + R2() * 0.25, 0.2, 0.36 + R2() * 0.25]);
  A(DODE, -5.9, 0.25, 37.4, { tag: 'rock', col: BOULDERS[2][0], bleed: '#6f7a66', orb: 'vodopad' }, 1.1, 0, 0, [1.9, 0.85, 1.6]);
  orb('vodopad', [-9.5, 1.8, 37], 4.6, ['waterfall'], 'close', 1.4, { near: { p: [-5.9, 1.1, 37.4], r: 3 }, at: new Vector3(-8.4, 4.4, 37.6) });
  orb('pjena', [-8.8, 0.3, 35.6], 3.4, ['foam'], 'close', 0.4, { near: { p: [-7.7, 0.2, 35], r: 2.6 }, at: new Vector3(-8.2, 1.7, 34.8) });
  A(DODE, -24, 3.55, 36.2, { tag: 'rock', col: BOULDERS[5][0], bleed: '#6f7a66' }, 0.5, 0, 0, [1.4, 0.75, 1.2]);
  orb('potok', [-24, 3.6, 38.2], 7, ['creek'], 'close', 3.7, { swim: { p: [-24, 3.5, 38], r: 8 } });
  // pebble beach under the bridge and the stone steps up from it
  box(5.6, 1.7, 16, -7.6, -0.15, 13, { tag: 'shore', col: '#dfddd6', bleed: '#a7b2b6', pat: PAT.cobble, ps: 1.7, orb: 'obala' });
  orb('obala', [-7.6, 0.7, 13], 8, ['shore'], 'close', 1.2);
  for (let i = 0; i < 15; i++) { const y = 0.7 + (i + 1) * 0.753; box(2.6, 1.3, 0.78, -cliffX(y) + 0.75, y - 0.65, 21.4 + i * 0.75, { tag: 'stairs', col: '#b89478', bleed: '#8d6a55', orb: 'stepenice' }); }
  orb('stepenice', [-10.4, 6.4, 26.8], 7, ['stairs'], 'close', 7.4);
  // boulders at the foot of the cliffs and one big outcrop
  for (const side of [-1, 1]) for (let i = 0; i < 30; i++) {
    const z = rr(-140, 140); if (Math.abs(z) < 5 || (side < 0 && z > 2 && z < 44) || (side > 0 && z > -30 && z < -17)) continue;
    const y = rr(-0.2, 4.5), sc = rr(0.9, 2.2), st = BOULDERS[Math.floor(R() * 3) + (i % 7)];
    A(DODE, side * (cliffX(y) - rr(0, 0.6)), y, z, { tag: 'rock', col: st[0], bleed: st[1] }, R() * 6, 0, 0, [sc * 1.3, sc * 0.9, sc * 1.5]);
  }
  A(DODE, 9.7, 4.6, -23.5, { tag: 'rock', col: '#93877a', bleed: '#6c645b', orb: 'stijena' }, 0.3, 0, 0, [3.6, 2.9, 4.6]);
  // plants on the cliffs: shrubs, hanging creepers, tufts of grass, a few small trees rooted in the rock
  for (const side of [-1, 1]) for (let i = 0; i < 150; i++) {
    const z = -135 + R2() * 270, y = 1.2 + R2() * 10, g = GREENS[Math.floor(R2() * GREENS.length)], sc = 0.8 + R2() * 1.1, kind = R2();
    if (Math.abs(z) < 7 || (side < 0 && z > 1 && z < 45)) continue;
    const x = side * (cliffX(y) - 0.7), V_ = { tag: 'tree', col: g[0], bleed: g[1], hull: true, solid: false };
    if (kind < 0.45) A(ICO, x, y, z, { ...V_, sway: 0.03 }, R2() * 6, 0, 0, [sc, sc * 0.65, sc * 1.2]);
    else if (kind < 0.7) { for (let j = 0; j < 3; j++) A(ICO, x - side * 0.25, y - j * 0.75 * sc, z + (R2() - 0.5) * 0.7, { ...V_, sway: 0.04 }, R2() * 6, 0, 0, [0.4 * sc, 0.6 * sc, 0.7 * sc]); }   // a creeper hanging down
    else if (kind < 0.88) { for (let j = 0; j < 4; j++) A(CONE4, x - side * 0.3, y + 0.3, z + (j - 1.5) * 0.35, { ...V_, hull: false, ink: false, col: GRASS[j % 4][1], sway: 0.05 }, R2() * 6, 0, side * (0.2 + R2() * 0.5), [0.14, 0.9 * sc, 0.14]); }   // grass tufts
    else { A(TAPER, x - side * 0.5, y + 0.6 * sc, z, { tag: 'tree', col: '#7a5636', bleed: '#5f4028', solid: false, edge: 50 }, 0, 0, side * 0.6, [0.12 * sc, 1.6 * sc, 0.12 * sc]); A(ICO, x - side * 1.1 * sc, y + 1.5 * sc, z, { ...V_, sway: 0.04 }, R2() * 6, 0, 0, [1.1 * sc, 0.9 * sc, 1.1 * sc]); }
  }
  orb('stijena', [9.7, 5.6, -23.5], 6, ['rock'], 'wide', 7.6);
  // boulders in the river
  let ri = 0;
  for (const [x, z, s] of [[3, 30, 1.5], [-5, -18, 1.1], [6, -42, 1.3], [-3, 64, 1.2], [6, 50, 0.9], [-6, 86, 1.4], [4, -80, 1.2]])
    A(DODE, x, 0.25, z, { tag: 'rock', col: BOULDERS[Math.floor(R() * 3) + ri++ % 6][0], bleed: ri % 2 ? '#6f7a66' : '#5c6468' }, R() * 6, 0, 0, [2 * s, 0.9 * s, 1.6 * s]);
  orb('rijeka', [2, 0.3, 25], 5, ['river'], 'wide', 0.4, { swim: { p: [2, 0, 25], r: 8 } });

  // streets (kaldrma) and squares
  for (const [x0, x1, z0, z1, id] of [[17, 64, -2.6, 2.6, 'ulica'], [38, 43, -64, -2.6], [17, 21, 2.6, 62], [52, 67, -22, -8.5], [-64, -17, -2.6, 2.6], [-42, -37, 2.6, 33.2], [-42, -37, 40.8, 72],
    [-45, -40, -64, -2.6], [-61, -45, 3, 19], [43, 52, -17, -13]]) slab(x0, x1, z0, z1, { ...STREET, orb: id }, BANK + 0.06, 0.12);
  orb('ulica', [36, BANK, 0], 5, ['street'], 'wide', BANK + 1.2);

  // grass: the outskirts and a few gardens, each a slightly different green
  const grass = (x0, x1, z0, z1, id) => { const g = pick(GRASS); slab(x0, x1, z0, z1, { tag: 'grass', col: g[0], bleed: g[1], pat: PAT.grass, orb: id }, BANK + 0.03, 0.06); };
  for (const r of [[-413, -72, -350, 33], [-413, -72, 41, 350], [78, 413, -350, 350], [-72, -13.6, -350, -70], [13.6, 78, -350, -68], [-72, -13.6, 76, 350], [13.6, 78, 66, 350],
    [-36, -14, 41.2, 76], [-72, -43, 41.2, 76], [-72, -62, -30, -4], [-30, -15, 26.5, 32.5], [22, 37, 46, 64], [64, 78, -68, 66]]) grass(...r);
  R();   // (keeps the older colours as they were)
  grass(40, 62, 36, 60, 'trava');
  orb('trava', [51, BANK, 48], 8, ['grass'], 'wide', BANK + 1);
  // far hills: Hum to the south-west, the long ridge of Velež to the east
  tag('grass').hullWidth = 1.8;
  for (const [x, z, r, h, c] of [[-250, 210, 110, 78, '#8faa6c'], [-330, 40, 120, 60, '#9db57c'], [-290, -170, 130, 70, '#88a878'], [-120, -330, 120, 55, '#a3b88a'], [80, -350, 140, 66, '#93ad84'],
    [290, -230, 150, 105, '#a9b3a4'], [360, -40, 170, 125, '#b3b8ad'], [330, 170, 150, 100, '#a4b09c'], [150, 330, 130, 62, '#96b07c'], [-60, 350, 130, 58, '#8eac70']])
    A(ICO2, x, BANK - 4, z, { tag: 'grass', col: c, bleed: '#7d9a78', hull: true, solid: false }, R() * 6, 0, 0, [r, h, r * rr(0.7, 1)]);

  // ---------- small things ----------
  const flowers = (x, y, z, len, n = 5) => {
    for (let i = 0; i < n; i++) A(ICO0, x + (i / (n - 1) - 0.5) * len, y + rr(0, 0.1), z + rr(-0.06, 0.06), { tag: 'flower', col: pick(FLOWERS), hull: true, hatch: 0, solid: false }, R() * 6, 0, 0, rr(0.13, 0.19));
  };
  tag('flower').hullWidth = 1.2; tag('tree').hullWidth = 1.8; tag('cat').hullWidth = 1.5;

  function tree(x, z, s = 1, o = {}) {
    b.object(() => {
      const g = pick(GREENS), th = 3.2 * s, T = { tag: 'tree', orb: o.orb };
      A(TAPER, x, BANK + th / 2, z, { ...T, col: '#7a5636', bleed: '#5f4028', edge: 50 }, R() * 6, 0, 0, [0.42 * s, th, 0.42 * s]);
      const blobs = o.big ? [[0, 1.6, 0, 2.6], [-1.9, 0.7, 0.6, 1.9], [1.8, 0.9, -0.4, 2.0], [0.4, 0.6, 1.9, 1.8], [-0.3, 0.8, -1.9, 1.8]] : [[0, 1.0, 0, 1.7], [-1.1, 0.3, 0.3, 1.25], [1.0, 0.4, -0.3, 1.3]];
      for (const [px, py, pz, r] of blobs) A(ICO, x + px * s, BANK + th + py * s, z + pz * s, { ...T, col: g[0], bleed: g[1], hull: true, sway: (v) => 0.03 * (v.y - BANK - th + 1) }, R() * 6, 0, 0, [r * s, r * s * 0.85, r * s]);
      if (o.big) { // a branch to perch on
        A(CYL, x + 3.1, BANK + th * 0.62, z + 0.4, { ...T, col: '#7a5636', bleed: '#5f4028', edge: 50 }, 0, 0, Math.PI / 2 - 0.12, [0.2 * s, 4.4, 0.2 * s]);
        A(ICO, x + 5.3, BANK + th * 0.62 + 0.75, z + 0.4, { ...T, col: g[0], bleed: g[1], hull: true, sway: 0.05 }, 1, 0, 0, [1.0, 0.75, 1.0]);
      }
    });
  }
  function cypress(x, z, s = 1) {
    b.object(() => {
      A(CYL, x, BANK + 0.5, z, { tag: 'tree', col: '#6a4a30', solid: false, ink: false }, 0, 0, 0, [0.16 * s, 1, 0.16 * s]);
      A(CYPRESS, x, BANK + 0.8 + 3.6 * s, z, { tag: 'tree', col: pick(['#2f6146', '#35684e', '#2a5a40']), bleed: '#1f4a36', hull: true, wall: true, sway: (v) => 0.02 * (v.y - BANK) }, R() * 6, 0, 0, [0.95 * s, 3.6 * s, 0.95 * s]);
    });
  }
  function bush(x, z, s = 1) {
    b.object(() => { const g = pick(GREENS); for (const [px, pz, r] of [[0, 0, 1], [0.8, 0.3, 0.75], [-0.7, -0.2, 0.7]]) A(ICO, x + px * s, BANK + 0.5 * s, z + pz * s, { tag: 'tree', col: g[0], bleed: g[1], hull: true, sway: 0.02 }, R() * 6, 0, 0, [r * s, r * s * 0.7, r * s]); });
  }
  function lamp(x, z, id) {
    b.object(() => {
      const L = { tag: 'lamp', col: '#3f4a4a', bleed: '#2c3838', orb: id };
      A(CYL, x, BANK + 1.8, z, { ...L, edge: 50 }, 0, 0, 0, [0.09, 3.6, 0.09]); box(0.5, 0.2, 0.5, x, BANK + 0.1, z, L);
      box(0.55, 0.7, 0.55, x, BANK + 3.95, z, { ...L, col: '#f4d77a', bleed: '#eeb84a', pool: 1 }); A(CONE4, x, BANK + 4.5, z, L, Math.PI / 4, 0, 0, [0.55, 0.4, 0.55]);
    });
  }
  function bench(x, z, ry, id) {
    b.push(mat4(x, BANK, z, ry));
    b.object(() => {
      const W = { tag: 'bench', col: pick(['#8a5a34', '#6f7f52', '#7a4a3a']), bleed: '#5f4028', pat: PAT.planks, ps: 3, orb: id };
      box(2.3, 0.12, 0.65, 0, 0.6, 0, W); box(2.3, 0.55, 0.1, 0, 1.1, -0.3, W, 0, -0.12);
      for (const sx of [-0.95, 0.95]) box(0.12, 0.6, 0.6, sx, 0.3, 0, { ...W, pat: 0, col: '#4a4a48' });
    });
    b.pop();
  }
  const wall = (x0, x1, z0, z1, h = 1.3, id, tg = 'wall') => { const s = pick(STONES); slab(x0, x1, z0, z1, { tag: tg, col: s[0], bleed: s[1], pat: PAT.blocks, ps: 1.1, pool: 1, orb: id }, BANK + h / 2, h); };

  // ---------- houses ----------
  function house(o) {
    const { x, z, rot = 0, w, d, h, rh = 2.3, roof = 'hip', kind = 'slab', tagH = 'house' } = o;
    const wl = o.wall || pick(WALLS), st = pick(STONES), rc = o.roofC || (kind === 'slab' ? pick(SLABS) : pick(TILES)), trim = pick(TRIMS), dc = pick(DOORS);
    b.push(mat4(x, BANK, z, rot));
    b.object(() => {
      const H = { tag: tagH, orb: o.orb }, sh = o.stone === false ? 0 : Math.min(3, h * 0.42), j = sh ? 0.3 : 0;
      if (sh) box(w, sh, d, 0, sh / 2, 0, { ...H, col: st[0], bleed: st[1], pat: PAT.blocks, ps: 0.55, pool: 1 });
      box(w + j, h - sh, d + j, 0, sh + (h - sh) / 2, 0, { ...H, col: wl[0], bleed: wl[1], pool: 1 });
      const fz = d / 2 + j / 2, fx = w / 2 + j / 2, ov = 1.3, long = Math.max(w, d), short = Math.min(w, d), ry = d >= w ? 0 : Math.PI / 2;
      const hip = roof === 'hip', RO = { ...H, col: rc[0], bleed: rc[1], pat: PAT.roof, ps: kind === 'slab' ? 0.8 : 1.5 };
      A(roofGeo(short + ov, long + ov, rh, hip ? Math.max(0.01, long - short + 0.8) : long + ov, !hip), 0, h, 0, RO, ry);
      if (!hip) A(roofGeo(short + j, long + j, rh * 0.92, long + j), 0, h, 0, { ...H, col: wl[0], bleed: wl[1] }, ry);
      if (o.chimney !== false) {
        const cw = o.bigChimney ? 1.5 : 0.85, cx = ry ? -long * 0.16 : short * 0.2, cz = ry ? short * 0.18 : -long * 0.16, cy = h + rh * 0.5, CH = { tag: 'chimney', orb: o.chimneyOrb };
        const cc = pick([['#c9bda2', '#b0a184'], ['#c98a66', '#a8674a'], ['#d6d0c2', '#b9b2a2']]);
        box(cw, 2.6, cw, cx, cy + 0.5, cz, { ...CH, col: cc[0], bleed: cc[1], pat: PAT.blocks, ps: 1.4, pool: 1 });
        box(cw + 0.4, 0.22, cw + 0.4, cx, cy + 1.9, cz, { ...CH, col: cc[1], bleed: cc[1] });
      }
      const dx = o.doorX ?? -w * 0.22;
      box(1.25, 2.15, 0.16, dx, 1.08, d / 2 + 0.05, { tag: 'door', col: dc, bleed: '#4a3020', pat: PAT.planks, ps: 4, pool: 1, solid: false });
      box(2.1, 0.3, 1.2, dx, 0.15, d / 2 + 0.6, { tag: 'door', col: '#cfc4ad', bleed: '#b4a688', orb: o.doorOrb });
      const win = (px, py, pz, wr, big, fl, open) => {
        const ww = big ? 2.4 : 0.95, wh = big ? 1.6 : 1.25, Wn = { tag: 'window', pool: 1, solid: false };
        b.push(mat4(px, py, pz, wr));
        box(ww, wh, 0.1, 0, 0, 0.02, { ...Wn, col: open ? '#54463c' : '#6a93ad', bleed: open ? '#3c322b' : '#44708f' });
        for (const sg of [-1, 1]) box(ww * 0.25, wh, 0.07, sg * ww * 0.63, 0, 0.04, { ...Wn, col: trim, bleed: trim, pat: PAT.planks, ps: 3 });
        box(ww * 1.55, 0.14, big ? 1.1 : 0.34, 0, -wh / 2 - 0.07, big ? 0.55 : 0.17, { tag: 'window', col: '#d8cdb6', bleed: '#bfb092', solid: !!big, orb: big ? o.windowOrb : undefined });
        if (fl) { box(ww * 0.95, 0.22, 0.3, 0, -wh / 2 + 0.11, 0.33, { tag: 'flower', col: '#b9683e', bleed: '#96502e', solid: false }); flowers(0, -wh / 2 + 0.32, 0.33, ww * 0.8); }
        b.pop();
      };
      const uy = sh + (h - sh) * 0.52, fl = o.flowers ?? R() < 0.5;
      if (o.windowOrb) win(w * 0.12, uy, fz, 0, true, false);
      else { win(w * 0.25, uy, fz, 0, false, fl && !o.openWin, o.openWin); if (w > 6.4) win(-w * 0.25, uy, fz, 0, false, fl); }
      if (sh > 2.2 && w > 6) win(w * 0.25, sh * 0.56, d / 2, 0, false, false);
      win(fx, uy, 0, Math.PI / 2, false, false); win(-fx, uy, 0, -Math.PI / 2, false, false); win(0, uy, -fz, Math.PI, false, false);
    });
    b.pop();
    return { ...o, top: BANK + h + rh };
  }

  const tut = house({ x: -30, z: 22, rot: 0.6, w: 8, d: 7, h: 5.5, rh: 3, roof: 'gable', kind: 'tile', wall: WALLS[0], roofC: TILES[0], orb: 'kuca', flowers: true });
  orbs.push({ id: 'kuca', focus: new Vector3(-30, BANK + 4, 22), size: 6.5, tags: ['house'], shot: 'combo', at: new Vector3(-30, tut.top + S.orb.hoverHeight, 22), stage: 0 });
  // west bank
  house({ x: -30, z: -9.5, w: 7, d: 6, h: 6, openWin: true });
  const hChim = house({ x: -53, z: -9.5, w: 8.5, d: 6.5, h: 5.2, bigChimney: true, chimneyOrb: 'dimnjak' });
  house({ x: -64.5, z: -10.5, w: 6, d: 6, h: 7, roof: 'gable', kind: 'tile' });
  const hWin = house({ x: -25, z: 9.8, rot: Math.PI, w: 6.5, d: 6, h: 5.8, windowOrb: 'prozor', doorX: 2 });
  house({ x: -50.5, z: -24, rot: Math.PI / 2, w: 7, d: 6, h: 5.5 });
  house({ x: -50.5, z: -39, rot: Math.PI / 2, w: 7.5, d: 6.5, h: 6.4, kind: 'tile' });
  house({ x: -34, z: -22, rot: -Math.PI / 2, w: 7, d: 6, h: 5 });
  house({ x: -34, z: -37, rot: -Math.PI / 2, w: 7, d: 6.5, h: 6.6, roof: 'gable' });
  const hTall = house({ x: -50.5, z: -54, rot: Math.PI / 2, w: 5.2, d: 5.2, h: 13, rh: 2.6, tagH: 'tallHouse', orb: 'visoka', kind: 'tile', wall: WALLS[3] });
  const hSmall = house({ x: -34.5, z: -52, rot: -Math.PI / 2, w: 4.2, d: 3.8, h: 2.9, rh: 1.5, tagH: 'smallHouse', orb: 'mala', stone: false, wall: WALLS[4], chimney: false });
  const hDoor = house({ x: -48, z: 26, rot: Math.PI / 2, w: 7, d: 6, h: 5.6, kind: 'tile', doorOrb: 'vrata', doorX: 0 });
  house({ x: -28, z: 52, rot: -0.5, w: 7, d: 6, h: 5.2, kind: 'tile' });
  house({ x: -50, z: 51, rot: Math.PI / 2, w: 7.5, d: 6, h: 6 });
  house({ x: -49, z: 65, rot: Math.PI / 2, w: 6.5, d: 6, h: 5, roof: 'gable', kind: 'tile' });
  house({ x: -26, z: 67, rot: Math.PI, w: 7, d: 6, h: 5.5 });
  // east bank
  house({ x: 49, z: -27.5, rot: -Math.PI / 2, w: 7, d: 6, h: 5.6 });
  house({ x: 49, z: -41, rot: -Math.PI / 2, w: 7.5, d: 6.5, h: 6.2, kind: 'tile' });
  house({ x: 49.5, z: -55, rot: -Math.PI / 2, w: 7, d: 6, h: 5, roof: 'gable' });
  house({ x: 63, z: -34, rot: 0.3, w: 7, d: 6, h: 6, kind: 'tile' });
  house({ x: 66, z: -52, rot: -0.4, w: 6.5, d: 6, h: 5.4 });
  house({ x: 28.5, z: 17, rot: -Math.PI / 2, w: 7, d: 6, h: 5.8 });
  house({ x: 28.5, z: 29.5, rot: -Math.PI / 2, w: 7.5, d: 6, h: 5.2, kind: 'tile' });
  house({ x: 29, z: 41, rot: -Math.PI / 2, w: 6.5, d: 6, h: 6.2, roof: 'gable' });
  house({ x: 47, z: 19, rot: 0, w: 7, d: 6, h: 5.5 });
  house({ x: 60, z: 22, rot: 0.2, w: 7, d: 6.5, h: 6, kind: 'tile' });
  house({ x: 70, z: 6, rot: -Math.PI / 2, w: 7, d: 6, h: 5.4 });
  orb('visoka', [-50.5, BANK + 7, -54], 9, ['tallHouse'], 'close', hTall.top);
  orb('mala', [-34.5, BANK + 1.6, -52], 4, ['smallHouse'], 'close', hSmall.top);
  const chimP = local(hChim, -8.5 * 0.16, 5.2 + 3.2, 6.5 * 0.18);
  orb('dimnjak', [chimP.x, chimP.y, chimP.z], 3, ['chimney'], 'combo', chimP.y + 0.4);
  const winP = local(hWin, 6.5 * 0.12, 3.9, 3.7);
  orb('prozor', [winP.x, winP.y, winP.z], 3.5, ['window'], 'combo', winP.y + 1, { near: { p: [winP.x, BANK + 1, winP.z - 2.5], r: 3.2 } });
  const doorP = local(hDoor, 0, 1.1, 3.6);
  orb('vrata', [doorP.x, doorP.y, doorP.z], 3.2, ['door'], 'combo', doorP.y + 1.3, { at: new Vector3(doorP.x + 0.9, BANK + 3, doorP.z), near: { p: [doorP.x + 1.5, BANK + 0.6, doorP.z], r: 3 } });
  for (const t of ['house', 'chimney', 'window', 'door', 'tree', 'flower', 'lamp', 'bench', 'wall', 'tower', 'shop', 'carpet', 'cloud']) tag(t).waveDelay = 2.6;

  // ---------- Kujundžiluk: the bazaar shops with stone-slab roofs ----------
  function shop(x, z, rot, o = {}) {
    b.push(mat4(x, BANK, z, rot));
    b.object(() => {
      const st = pick(STONES), sl = pick(SLABS), Sh = { tag: 'shop', orb: o.orb }, aw = pick(['#b8452c', '#d9a23a', '#3f6b4a', '#2f5f7a', '#c9b48a']);
      box(5.2, 3.1, 4.4, 0, 1.55, 0, { ...Sh, col: st[0], bleed: st[1], pat: PAT.blocks, ps: 0.6, pool: 1 });
      A(roofGeo(5.4, 6.4, 1.1, 2.2), 0, 3.1, 0.35, { ...Sh, col: sl[0], bleed: sl[1], pat: PAT.roof, ps: 0.8 }, Math.PI / 2);
      box(3.7, 1.9, 0.1, 0, 1.75, 2.22, { ...Sh, col: '#5a4030', bleed: '#3a2a20', pool: 1, solid: false });
      box(3.9, 0.14, 1.0, 0, 0.85, 2.7, { ...Sh, col: '#8a5a34', bleed: '#5f4028', pat: PAT.planks, ps: 5 });
      box(4.7, 0.08, 1.9, 0, 2.75, 3.1, { ...Sh, col: aw, bleed: aw, pool: 1, orb: o.awningOrb ?? o.orb }, 0, 0.2);
      for (const sx of [-2.2, 2.2]) A(CYL, sx, 1.3, 3.9, { ...Sh, col: '#6a4a30', solid: false, edge: 50 }, 0, 0, 0, [0.06, 2.6, 0.06]);
      const n = o.carpets ?? (R() < 0.7 ? 2 : 1);
      for (let i = 0; i < n; i++) { const k = pick(KILIMS); box(1.1, 1.7, 0.05, (i - (n - 1) / 2) * 1.7, 1.6, 3.95, { tag: 'carpet', col: k[0], bleed: k[1], pat: PAT.kilim, ps: 7, hatch: 0.3, solid: false, sway: (v) => 0.05 * Math.max(0, BANK + 2.5 - v.y) }); }
      for (let i = 0; i < 3; i++) A(POT, -1.2 + i * 1.2, 1.1, 2.75, { ...Sh, col: '#c98a4a', bleed: '#a8672f', solid: false, edge: 50 }, 0, 0, 0, [0.16, 0.36, 0.16]);
    });
    b.pop();
  }
  shop(28.5, -5.4, 0, { orb: 'ducan', carpets: 1 }); shop(34.2, -5.4, 0); shop(47, -5.4, 0); shop(26.5, 5.4, Math.PI); shop(32.2, 5.4, Math.PI, { awningOrb: 'cilim', carpets: 2 });
  shop(38, 5.4, Math.PI); shop(43.8, 5.4, Math.PI); shop(49.6, 5.4, Math.PI); shop(55.4, 5.4, Math.PI);
  orb('ducan', [28.5, BANK + 2, -5.4], 4.5, ['shop'], 'combo', BANK + 4.3);
  orb('cilim', [32.2, BANK + 1.7, 1.4], 3, ['carpet'], 'combo', BANK + 3.4, { requires: ['ducan'], near: { p: [32.2, BANK + 0.6, 0.6], r: 2.6 } });

  // ---------- the bridge towers, the clock tower ----------
  b.object(() => { // Halebija, west
    const T = { tag: 'tower', orb: 'kula' }, s = STONES[1];
    box(6, 11, 6, -21.2, BANK + 5.5, -6.2, { ...T, col: s[0], bleed: s[1], pat: PAT.blocks, ps: 0.5, pool: 1 });
    box(6.5, 0.5, 6.5, -21.2, BANK + 11.2, -6.2, { ...T, col: s[1] }); A(CONE4, -21.2, BANK + 12.9, -6.2, { ...T, col: SLABS[0][0], bleed: SLABS[0][1] }, Math.PI / 4, 0, 0, [4.5, 3, 4.5]);
    for (const dz of [-1.5, 1.5]) box(0.1, 1.2, 0.6, -18.15, BANK + 7.5, -6.2 + dz, { tag: 'tower', col: '#4a3f36', solid: false });
  });
  b.object(() => { // Tara, east: the round one
    const s = STONES[0];
    A(CYL12, 21.2, BANK + 5.5, -6.2, { tag: 'tower', col: s[0], bleed: s[1], pat: PAT.blocks, ps: 0.5, edge: 40 }, 0, 0, 0, [3.5, 11, 3.5]);
    A(new THREE.ConeGeometry(1, 1, 12), 21.2, BANK + 12.4, -6.2, { tag: 'tower', col: SLABS[2][0], bleed: SLABS[2][1], edge: 40 }, 0, 0, 0, [4, 2.8, 4]);
  });
  b.object(() => { // Sahat-kula, the clock tower
    const s = STONES[2];
    const CT = { tag: 'clockTower', orb: 'sahat' }, both = ['sat', 'pola', 'sahat'];
    box(4.6, 20, 4.6, 59.5, BANK + 10, -15, { ...CT, col: s[0], bleed: s[1], pat: PAT.blocks, ps: 0.5, pool: 1 });
    box(7, 0.5, 7, 59.5, BANK + 16.6, -15, { ...CT, col: s[1], orb: both }); box(5.2, 0.5, 5.2, 59.5, BANK + 20.2, -15, { ...CT, col: s[1] });
    A(CONE4, 59.5, BANK + 22.4, -15, { ...CT, col: SLABS[1][0], bleed: SLABS[1][1] }, Math.PI / 4, 0, 0, [3.8, 4, 3.8]);
    for (const ry of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) { b.push(mat4(59.5, BANK + 18.5, -15, ry)); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; box(i % 3 ? 0.06 : 0.1, i % 3 ? 0.16 : 0.26, 0.03, Math.sin(a) * 0.93, Math.cos(a) * 0.93, 2.385, { tag: 'clock', col: '#3b352f', solid: false, ink: false, hatch: 0 }, 0, 0, -a); } b.pop(); }
    for (const [dx, dz, ry] of [[0, 2.33, 0], [2.33, 0, Math.PI / 2], [0, -2.33, Math.PI], [-2.33, 0, -Math.PI / 2]])
      A(CYL12, 59.5 + dx, BANK + 18.5, -15 + dz, { tag: 'clock', col: '#f6efd9', bleed: '#e6d6a6', solid: false, edge: 40 }, ry, Math.PI / 2, 0, [1.15, 0.08, 1.15]);
  });
  orb('kula', [-21.2, BANK + 7, -6.2], 8, ['tower'], 'combo', BANK + 14.4);
  orb('sat', [59.5, BANK + 18.2, -12.2], 3.2, ['clock'], 'close', BANK + 17.6, { at: new Vector3(59.5, BANK + 18.5, -10.4) });
  orb('pola', [59.5, BANK + 18.5, -12.6], 2.6, ['time'], 'close', BANK + 17.6, { at: new Vector3(59.5, BANK + 18.6, -10.6), requires: ['sat'] });
  orb('sahat', [59.5, BANK + 12, -15], 13, ['clockTower'], 'close', BANK + 24.6, { requires: ['sat', 'kula'] });

  // ---------- Koski Mehmed-pasha mosque ----------
  tag('mosque').hullWidth = 1.7; tag('minaret').hullWidth = 1.5;
  b.object(() => {
    const Mq = { tag: 'mosque', orb: 'dzamija' }, s = ['#e9e1cf', '#d3c6a8'], lead = ['#8e979c', '#737d86'];
    box(10, 7, 10, 27, BANK + 3.5, -42, { ...Mq, col: s[0], bleed: s[1], pat: PAT.blocks, ps: 0.45, pool: 1 });
    A(CYL, 27, BANK + 7.6, -42, { ...Mq, col: s[0], bleed: s[1], edge: 40 }, Math.PI / 8, 0, 0, [5.1, 1.3, 5.1]);
    A(HEMI, 27, BANK + 8.2, -42, { ...Mq, col: lead[0], bleed: lead[1], hull: true }, 0, 0, 0, 4.6);
    A(CONE8, 27, BANK + 13.3, -42, { ...Mq, col: '#c9a23a', solid: false, edge: 60 }, 0, 0, 0, [0.14, 1.3, 0.14]);
    box(10.4, 0.4, 3.8, 27, BANK + 4.4, -35.1, { ...Mq, col: s[1], bleed: s[1] });
    for (const dx of [-3.3, 0, 3.3]) A(HEMI, 27 + dx, BANK + 4.6, -35.1, { ...Mq, col: lead[0], bleed: lead[1], hull: true }, 0, 0, 0, 1.45);
    for (const dx of [-4.9, -1.65, 1.65, 4.9]) A(CYL, 27 + dx, BANK + 2.1, -33.5, { ...Mq, col: s[0], edge: 50 }, 0, 0, 0, [0.24, 4.2, 0.24]);
    box(1.5, 2.6, 0.12, 27, BANK + 1.3, -36.95, { tag: 'mosque', col: '#5f4a32', pat: PAT.planks, ps: 4, solid: false });
    for (const [dx, dz, ry] of [[-5.05, 0, -Math.PI / 2], [5.05, 0, Math.PI / 2], [0, -5.05, Math.PI]]) for (const k of [-2.3, 2.3])
      box(0.9, 2.2, 0.1, 27 + dx + (dx ? 0 : k), BANK + 3.6, -42 + dz + (dz ? 0 : k), { tag: 'mosque', col: '#6a93ad', bleed: '#44708f', solid: false }, ry);
  });
  b.object(() => {
    const Mn = { tag: 'minaret', orb: ['munara', 'mujezin'] }, s = ['#ece4d2', '#d6c9aa'];
    box(2.2, 3.4, 2.2, 34, BANK + 1.7, -35.6, { ...Mn, col: s[0], bleed: s[1], pat: PAT.blocks, ps: 0.6 });
    A(CYL, 34, BANK + 10, -35.6, { ...Mn, col: s[0], bleed: s[1], edge: 60 }, 0, 0, 0, [0.9, 13.4, 0.9]);
    A(new THREE.CylinderGeometry(1, 0.55, 1, 10), 34, BANK + 16.9, -35.6, { ...Mn, col: s[1], bleed: s[1], edge: 40 }, 0, 0, 0, [2.2, 0.8, 2.2]);
    A(new THREE.CylinderGeometry(1, 1, 1, 10, 1, true), 34, BANK + 17.75, -35.6, { tag: 'minaret', col: s[1], solid: false, edge: 40 }, 0, 0, 0, [2.15, 0.9, 2.15]);
    A(CYL, 34, BANK + 19.5, -35.6, { ...Mn, col: s[0], bleed: s[1], edge: 60 }, 0, 0, 0, [0.78, 4.4, 0.78]);
    A(CONE8, 34, BANK + 24.2, -35.6, { ...Mn, col: '#8e979c', bleed: '#737d86', wall: true, edge: 20 }, 0, 0, 0, [1, 5, 1]);
  });
  b.object(() => { // šadrvan, the courtyard fountain
    const F = { tag: 'fountain', orb: 'cesma' };
    A(CYL, 24, BANK + 0.4, -28, { ...F, col: '#ddd3bd', bleed: '#c2b594', edge: 40 }, 0, 0, 0, [1.8, 0.8, 1.8]);
    A(CYL, 24, BANK + 0.78, -28, { tag: 'fountain', col: C.river, bleed: C.riverDeep, solid: false, ink: false, hatch: 0 }, 0, 0, 0, [1.55, 0.06, 1.55]);
    A(CYL, 24, BANK + 1.2, -28, { ...F, col: '#ddd3bd', edge: 50 }, 0, 0, 0, [0.28, 1.6, 0.28]);
    A(new THREE.CylinderGeometry(1, 0.4, 1, 8), 24, BANK + 2.15, -28, { ...F, col: '#d0c4a8', bleed: '#b8a888', edge: 40 }, 0, 0, 0, [0.85, 0.35, 0.85]);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; A(CYL, 24 + Math.cos(a) * 2.2, BANK + 1.6, -28 + Math.sin(a) * 2.2, { tag: 'fountain', col: '#7a5636', solid: false, edge: 60 }, 0, 0, 0, [0.09, 3.2, 0.09]); }
    A(new THREE.ConeGeometry(1, 1, 6), 24, BANK + 3.85, -28, { ...F, col: SLABS[3][0], bleed: SLABS[3][1] }, 0, 0, 0, [2.9, 1.3, 2.9]);
  });
  orb('dzamija', [27, BANK + 6, -41], 10, ['mosque'], 'close', BANK + 14, { requires: ['munara'] });
  orb('munara', [34, BANK + 14, -35.6], 10, ['minaret'], 'close', BANK + 27.2);
  orb('mujezin', [35.2, BANK + 18.4, -34.7], 2.2, ['muezzin'], 'close', BANK + 19.6, { requires: ['munara'], at: new Vector3(36.6, BANK + 20.6, -33.6) });
  orb('cesma', [24, BANK + 2, -28], 4, ['fountain'], 'close', BANK + 4.7);
  const wallNoOrb = (...a) => wall(...a, 1.3, 'dvoriste', 'yard');
  wallNoOrb(17.3, 37.6, -53, -52.5); wallNoOrb(17.3, 17.8, -52.5, -21.5); wallNoOrb(17.3, 37.6, -21.5, -21); wallNoOrb(37.1, 37.6, -52.5, -40); wallNoOrb(37.1, 37.6, -31, -21.5);
  for (const [x, z, s] of [[19.5, -24, 1.15], [19.5, -49.5, 1.3], [35, -50, 1.1], [35.3, -24, 0.95]]) cypress(x, z, s);

  // ---------- walls, promenade, lamps, benches ----------
  wall(15.6, 16.2, 3.2, 62, 1.25, 'zid');
  orb('zid', [15.9, BANK + 0.7, 33], 6, ['wall'], 'combo', BANK + 1.3);
  wall(-16.2, -15.6, 3.2, 20, 1.25); wall(-16.2, -15.6, -60, -9.5, 1.25); wall(15.6, 16.2, -20.5, -9.5, 1.25);
  wall(30.5, 37, 12.2, 12.7, 1.1); wall(-72, -62, -3.6, -3.1, 1.1); wall(-36.5, -14, 76, 76.5, 1); wall(40, 62, 60.2, 60.7, 0.9);
  for (const [x, z, id] of [[-29.5, 3.4], [-46, -3.3], [-60, 3.2, 'lampa'], [-36.3, 18], [-45.6, -30], [-45.6, -50], [22.5, 3.3], [44.5, -3.3], [62, 3.2], [43.7, -26], [43.7, -48], [21.6, 22], [21.6, 44], [-36.4, 55]]) lamp(x, z, id);
  orb('lampa', [-60, BANK + 3.8, 3.2], 3.5, ['lamp'], 'combo', BANK + 4.7, { near: { p: [-60, BANK + 0.6, 3.2], r: 2.6 } });
  bench(18.6, 34, Math.PI / 2, 'klupa'); bench(18.6, 50, Math.PI / 2); bench(-52, 17.6, Math.PI); bench(-57, 16.5, Math.PI); bench(60, -10, Math.PI); bench(30, -24, Math.PI); bench(-35.5, 60, -Math.PI / 2);
  orb('klupa', [18.6, BANK + 0.8, 34], 2.6, ['bench'], 'combo', BANK + 1.4, { near: { p: [18.6, BANK + 0.6, 34], r: 2.2 } });

  // ---------- trees, bushes, flowers ----------
  tree(-53, 11, 1.5, { big: true, orb: 'drvo' });
  orb('drvo', [-53, BANK + 6, 11], 7, ['tree'], 'combo', BANK + 11, { near: { p: [-53, BANK + 0.6, 11], r: 3.8 } });
  for (const [x, z, s] of [[-20, -22, 1], [-64, 22, 1.2], [-27, 45.5, 0.9], [-58, 46, 1.1], [-20, 58, 1], [-33, 70, 1.2], [-66, -44, 1.1], [-22, -46, 0.9], [-68, -70, 1.3],
    [22, 54, 1], [33, 58, 1.1], [68, 44, 1.2], [56, 36.5, 0.8], [58, -62, 1.2], [30, -64, 1], [72, -66, 1.3], [-30, -70, 1.1], [45, 70, 1.2], [-55, 78, 1.2], [66, 30, 1]]) tree(x, z, s);
  for (const [x, z, s] of [[-66, 12, 1.2], [-70, 14.5, 1], [57, -24.5, 1.1], [70, -30, 1.3], [-22, 26, 0.9], [38, 27, 1]]) cypress(x, z, s);
  for (const [x, z, s] of [[-18, 30, 1], [-60, 60, 1.2], [-44, 74, 1], [24, 62.5, 1], [35, 49, 0.9], [-67, -8, 1], [66, 14, 1.1], [18.5, -60, 1.2], [-20, -62, 1], [75, 50, 1.2], [-22, 43, 0.8]]) bush(x, z, s);
  b.object(() => { // a stone trough of flowers in the square
    box(2.8, 0.7, 1.2, -48.5, BANK + 0.35, 6, { tag: 'flower', col: '#c4beb4', bleed: '#a29c94', pat: PAT.blocks, ps: 1.4, pool: 1, orb: 'cvijet' });
    for (const dz of [-0.3, 0.3]) flowers(-48.5, BANK + 0.82, 6 + dz, 2.2, 7);
  });
  orb('cvijet', [-48.5, BANK + 0.8, 6], 2.6, ['flower'], 'combo', BANK + 1.2, { near: { p: [-48.5, BANK + 0.6, 6], r: 2.6 } });
  for (const [x, z, n] of [[-22, 30, 6], [-26, 29, 5], [28, 55, 6], [33, 52, 5], [-55, 58, 6], [-64, -18, 5], [20, -27, 5], [34, -45, 5], [-20, 48, 5]]) b.object(() => {
    for (let i = 0; i < n; i++) A(ICO0, x + rr(-1.4, 1.4), BANK + 0.22, z + rr(-1.4, 1.4), { tag: 'flower', col: pick(FLOWERS), hull: true, hatch: 0, solid: false }, R() * 6, 0, 0, rr(0.16, 0.24));
  });

  // ---------- boats ----------
  const boatShape = new THREE.Shape(); boatShape.moveTo(-2.3, 0); boatShape.quadraticCurveTo(-1, 0.85, 1, 0.75); boatShape.quadraticCurveTo(2, 0.5, 2.5, 0); boatShape.quadraticCurveTo(2, -0.5, 1, -0.75); boatShape.quadraticCurveTo(-1, -0.85, -2.3, 0);
  const boatGeo = new THREE.ExtrudeGeometry(boatShape, { depth: 0.55, bevelEnabled: false, curveSegments: 5 }).rotateX(-Math.PI / 2);
  const boat = (x, z, ry, id, c) => b.object(() => {
    A(boatGeo, x, 0.02, z, { tag: 'boat', col: c[0], bleed: c[1], pat: PAT.planks, ps: 2, orb: id, edge: 40 }, ry);
    b.push(mat4(x, 0, z, ry)); for (const sx of [-0.9, 0.5]) box(0.3, 0.1, 1.3, sx, 0.5, 0, { tag: 'boat', col: '#c9a26a', bleed: '#a8804a', solid: false }); b.pop();
  });
  boat(-2.3, 15.2, 1.2, 'camac', ['#3f7f9a', '#2f6078']); boat(5.2, 56, 1.4, undefined, ['#b8502f', '#96402a']);
  orb('camac', [-2.3, 0.5, 15.2], 3.2, ['boat'], 'close', 1, { near: { p: [-5.3, 0.9, 15.2], r: 2.4 } });

  // ---------- the cat on a wall (the animal itself is built in people.js) ----------
  b.block(BOX, mat4(33.5, BANK + 1.5, 12.45, 0, 0, 0, [1.1, 0.8, 0.5]), { orb: 'macka', wall: true, asleep: true });
  orb('macka', [33.5, BANK + 1.6, 12.45], 2.2, ['cat'], 'close', BANK + 2.2, { near: { p: [33.5, BANK + 1.6, 12.45], r: 2.8 } });

  // ---------- Stari Most and the Crooked Bridge ----------
  tag('bridge').mode = 'one'; tag('bridge').radius = 30; tag('bridge').dur = 5.5;
  const BR = { tag: 'bridge', col: '#f1ead8', bleed: '#dccfae', pat: PAT.blocks, ps: 0.5, orb: 'most' }, BR2 = { ...BR, col: '#cfc8ba', bleed: '#a9a297', orb: undefined };
  const arch = new THREE.Shape();
  arch.moveTo(-17, 12.4); arch.lineTo(0, 18); arch.lineTo(17, 12.4); arch.lineTo(17, 4); arch.lineTo(13, 4);
  arch.absarc(0, 2.4, 13.1, 0.1225, Math.PI - 0.1225, false); arch.lineTo(-17, 4); arch.closePath();
  A(new THREE.ExtrudeGeometry(arch, { depth: 4, bevelEnabled: false, curveSegments: 28 }).translate(0, 0, -2), 0, 0, 0, BR);
  const rail = new THREE.Shape();
  rail.moveTo(-17, 12.4); rail.lineTo(0, 18); rail.lineTo(17, 12.4); rail.lineTo(17, 13.3); rail.lineTo(0, 18.9); rail.lineTo(-17, 13.3); rail.closePath();
  const railGeo = new THREE.ExtrudeGeometry(rail, { depth: 0.32, bevelEnabled: false });
  A(railGeo, 0, 0, -2, BR); A(railGeo, 0, 0, 1.68, BR);
  for (let i = -5; i <= 5; i++) if (i) box(0.5, 0.12, 3.4, i * 3, 18 - Math.abs(i * 3) * 0.329 + 0.02, 0, { ...BR, pat: 0, solid: false }, 0, 0, -Math.sign(i) * 0.318);
  const crook = new THREE.Shape();
  crook.moveTo(-5.5, 12); crook.lineTo(0, 13.3); crook.lineTo(5.5, 12); crook.lineTo(5.5, 7); crook.lineTo(3.6, 7); crook.absarc(0, 7, 3.6, 0, Math.PI, false); crook.lineTo(-5.5, 7); crook.closePath();
  A(new THREE.ExtrudeGeometry(crook, { depth: 4.6, bevelEnabled: false, curveSegments: 16 }).translate(0, 0, -2.3), -39.5, 0, 37, BR2, -Math.PI / 2);
  for (const dx of [-2.25, 2.25]) box(0.3, 0.8, 11, -39.5 + dx, 12.9, 37, { ...BR2, pat: 0 });
  orb('most', [0, 12, 0], 16, ['bridge'], 'bridge', 19.2, { stage: 2 });
  // the diver stands on the ledge; his spot and the invisible obstacle around him
  const diverPos = new Vector3(0, 18.9, 1.84);
  const diverBlock = b.block(BOX, mat4(0, 20.1, 1.84, 0, 0, 0, [2.8, 2.5, 0.8]), { wall: true, diver: true });
  orb('skakac', [0, 20, 1.84], 2.6, ['diver'], 'close', 21.5, { near: { p: [0, 19.2, 1.84], r: 4.2 } });
  // people: frozen until the finale. Their figures are built in people.js from this list.
  const deckY = (x) => 18.02 - Math.abs(x) * 0.329;
  const street = BANK + 0.12, kid = 0.66;
  // Who colours whom: a word for a thing colours only the thing (dog, bicycle, raft, ice cream, ball, fez);
  // the people themselves are coloured by a word for them (ljudi, djeca, mujezin) or for what they are doing.
  const people = [
    { kind: 'watch', tag: 'people', x: -6.2, y: deckY(-6.2), z: 0.9, ry: 1.35, look: 0 }, { kind: 'watch', tag: 'people', x: -7.5, y: deckY(-7.5), z: 0.5, ry: 1.3, woman: true }, { kind: 'watch', tag: 'people', x: -8.8, y: deckY(-8.8), z: 1.0, ry: 1.4 },
    { kind: 'sell', tag: 'people', x: 36, y: street, z: -1.95, ry: 0.3, fes: true }, { kind: 'sell', tag: 'people', x: 42.2, y: street, z: 1.95, ry: Math.PI - 0.3 },
    { kind: 'walk', tag: 'walkers', x: 41, y: street, z: 0.3, to: [58, -0.3], woman: true }, { kind: 'walk', tag: 'walkers', x: -57, y: street, z: 0.5, to: [-34, -0.5] },
    { kind: 'walk', tag: 'walkers', x: -39.5, y: street, z: 7, to: [-39.5, 30], dog: true },
    { kind: 'walk', tag: 'walkers', x: 27, y: street, z: -32.1, to: [27, -36.2], fes: true }, { kind: 'walk', tag: 'walkers', x: 36.4, y: street, z: -31.6, to: [29.6, -31.6], woman: true, scarf: true },
    { kind: 'sit', tag: 'sit', x: 18.75, y: BANK + 0.3, z: 49.45, ry: Math.PI / 2 - 0.35, woman: true }, { kind: 'sit', tag: 'sit', x: 18.75, y: BANK + 0.3, z: 50.55, ry: Math.PI / 2 + 0.35 },
    { kind: 'sit', tag: 'sit', x: 30.4, y: BANK + 0.3, z: -24.15, ry: Math.PI },
    { kind: 'muezzin', tag: 'muezzin', x: 35.2, y: BANK + 17.3, z: -34.7, ry: 0.9, robe: true },
    { kind: 'girl', tag: 'lovers', x: -28.25, y: BANK + 2.74, z: -6.52, ry: 0, woman: true }, { kind: 'boy', tag: 'lovers', x: -28.25, y: BANK, z: -3.7, ry: Math.PI },
    { kind: 'eat', tag: 'eat', x: -46.3, y: street, z: 14.2, ry: -2.2, woman: true },
    { kind: 'bike', tag: 'ride', x: 40.5, y: street, z: -56, to: [40.5, -9], speed: 4.2 },
    { kind: 'raft', tag: 'row', x: -3, y: 0.3, z: -34, ry: 0 },
    // a photo on the shore, with the bridge behind
    { kind: 'photo', tag: 'photo', x: -7.3, y: 0.7, z: 12.2, ry: Math.PI }, { kind: 'pose', tag: 'photo', x: -7.8, y: 0.7, z: 8.6, ry: 0.1, woman: true }, { kind: 'pose', tag: 'photo', x: -6.9, y: 0.7, z: 8.5, ry: -0.1 },
    // children: football on the pitch, the slide in the playground
    { kind: 'walk', tag: 'kids', x: 26.5, y: street, z: 73.6, to: [35, 78.4], speed: 2.7, sc: kid, ball: 0 }, { kind: 'walk', tag: 'kids', x: 36, y: street, z: 73.8, to: [28, 79.4], speed: 2.4, sc: kid, woman: true, ball: 1 },
    { kind: 'keeper', tag: 'kids', x: 23.5, y: street, z: 76, ry: Math.PI / 2, sc: kid },
    { kind: 'slide', tag: 'kids', x: SL.x - 0.45, y: SL.y + 1.96, z: SL.z, ry: -Math.PI / 2, sc: kid }, { kind: 'cheer', tag: 'kids', x: SL.x + 2.7, y: SL.y, z: SL.z - 0.9, ry: -1.9, sc: kid, woman: true },
  ];
  orb('pas', [-39, BANK + 0.5, 7.8], 1.6, ['dog'], 'close', BANK + 0.8, { near: { p: [-38.2, BANK + 0.6, 8.2], r: 2.2 }, at: new Vector3(-38.9, BANK + 1.7, 7.9) });
  orb('hodati', [-57, BANK + 1, 0.5], 2.6, ['walkers'], 'combo', BANK + 2.1, { near: { p: [-57, BANK + 0.6, 1.7], r: 2.6 } });
  orb('bicikl', [40.5, BANK + 0.6, -56], 2.2, ['bike'], 'close', BANK + 1, { near: { p: [41.6, BANK + 0.6, -57.3], r: 3.2 }, at: new Vector3(40.5, BANK + 1.5, -54.8) });
  orb('voziti', [40.5, BANK + 1.2, -56], 2.4, ['ride'], 'close', BANK + 2.2, { requires: ['bicikl'], near: { p: [41.6, BANK + 0.6, -57.3], r: 3.2 } });
  orb('sjediti', [18.75, BANK + 1, 50], 2.8, ['sit'], 'combo', BANK + 1.9, { near: { p: [20.2, BANK + 0.6, 50], r: 2.6 } });
  orb('fes', [36, BANK + 1.9, -1.95], 1.2, ['fes'], 'close', BANK + 2.2, { near: { p: [36.3, BANK + 0.6, -0.4], r: 2.3 }, at: new Vector3(36, BANK + 2.9, -1.95) });
  orb('slikati', [-7.3, 1.7, 10.4], 3.6, ['photo'], 'close', 2.8, { near: { p: [-6, 1.2, 10.6], r: 2.6 } });
  orb('ljudi', [-7.5, deckY(-7.5) + 1.2, 0.7], 3, ['people'], 'combo', deckY(-7.5) + 2.3, { near: { p: [-7.5, deckY(-7.5) + 0.6, -0.4], r: 3.2 } });
  orb('asikovanje', [-28.25, BANK + 3, -5.2], 4.2, ['lovers'], 'close', BANK + 6.2, { near: { p: [-28.25, BANK + 0.6, -3], r: 3 }, at: new Vector3(-28.25, BANK + 6.4, -4.6) });


  // a sign in pixel letters (5 wide, 7 high, plus the mark over Š)
  const FONT = { S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'], K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'], O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'], A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'], B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
    N: ['#...#', '##..#', '#.#.#', '#.#.#', '#..##', '#...#', '#...#'], I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'], C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'] };
  const sign = (text, y0, z, px, o) => {
    const chars = [...text], x0 = -(chars.length * 6 - 1) * px / 2;
    chars.forEach((ch, n) => {
      const rows = ch === 'Š' ? ['.#.#.', '..#..', ...FONT.S] : FONT[ch], top = rows.length;
      rows.forEach((row, r) => { for (let c = 0; c < 5; c++) if (row[c] === '#') { let e = c; while (row[e + 1] === '#') e++; box((e - c + 1) * px, px, 0.07, x0 + (n * 6 + (c + e + 1) / 2) * px, y0 + (top - 0.5 - r) * px, z, o); c = e; } });
    });
  };

  // ---------- the hospital on the clock tower square, with its garden in front ----------
  b.push(mat4(76.5, BANK, -15, -Math.PI / 2));
  b.object(() => {
    const H = { tag: 'hospital', orb: 'bolnica' }, T = { tag: 'hospital', solid: false }, W = 12, D = 7.5, Hh = 10.2, fz = D / 2 + 0.15;
    box(W, 1.2, D, 0, 0.6, 0, { ...H, col: '#c4beb4', bleed: '#a29c94', pat: PAT.blocks, ps: 0.55, pool: 1 });
    box(W + 0.3, Hh - 1.2, D + 0.3, 0, 1.2 + (Hh - 1.2) / 2, 0, { ...H, col: '#f6f3ec', bleed: '#d3dde0', pool: 1 });
    box(W + 0.9, 0.5, D + 0.9, 0, Hh + 0.25, 0, { ...H, col: '#7fb3b0', bleed: '#5d9794' });
    for (let fl = 0; fl < 3; fl++) for (let i = 0; i < 4; i++) {
      const mid = i === 1 || i === 2, px = -4.2 + i * 2.8, py = 2.5 + fl * 2.75;
      if (fl === 0 && mid) continue; if (fl === 2 && mid) continue;
      box(1.5, 1.5, 0.1, px, py, fz + 0.02, { ...T, col: '#7fb0c9', bleed: '#4f86a3', pool: 1 }); box(1.7, 0.14, 0.2, px, py - 0.82, fz + 0.08, { ...T, col: '#7fb3b0', bleed: '#5d9794' });
    }
    for (const sx of [-1, 1]) for (let fl = 0; fl < 3; fl++) box(1.3, 1.4, 0.1, sx * (W / 2 + 0.17), 2.5 + fl * 2.75, 0, { ...T, col: '#7fb0c9', bleed: '#4f86a3' }, sx * Math.PI / 2);
    box(2.4, 2.5, 0.14, 0, 1.25, fz + 0.03, { ...T, col: '#a9d0d6', bleed: '#6fa6b3', pool: 1 });
    box(3.6, 0.3, 1.7, 0, 0.15, fz + 0.85, { ...H, col: '#c4beb4', bleed: '#a29c94' });
    box(3.9, 0.14, 1.6, 0, 2.95, fz + 0.75, { ...T, col: '#7fb3b0', bleed: '#5d9794' });
    box(6.6, 1.25, 0.14, 0, 4.12, fz + 0.1, { ...T, col: '#2f6f73', bleed: '#235357' });
    sign('BOLNICA', 3.72, fz + 0.2, 0.115, { ...T, col: '#f8f4e6', bleed: '#e6efe9', ink: false, hatch: 0 });
    // the red cross
    A(CYL12, 0, 8, fz + 0.06, { ...T, col: '#ffffff', bleed: '#e9eef0', edge: 40 }, 0, Math.PI / 2, 0, [1.25, 0.1, 1.25]);
    box(1.55, 0.5, 0.08, 0, 8, fz + 0.14, { ...T, col: '#d2302c', bleed: '#a82420', ink: false }); box(0.5, 1.55, 0.08, 0, 8, fz + 0.15, { ...T, col: '#d2302c', bleed: '#a82420', ink: false });
  });
  b.pop();
  orb('bolnica', [76.5, BANK + 5.5, -15], 9, ['hospital'], 'close', BANK + 10.8);
  b.object(() => {       // bašta: beds of flowers and vegetables behind a low hedge, a path to the door
    const Gd = { tag: 'garden', orb: 'basta' }, N = { tag: 'garden', solid: false };
    slab(67.3, 72.5, -21, -9, { ...Gd, col: '#9cc06c', bleed: '#7fa855', pat: PAT.grass }, BANK + 0.09, 0.06);
    slab(67.3, 72.5, -15.9, -14.1, { ...N, col: '#e6dfd0', bleed: '#cbc2ad', pat: PAT.cobble, ps: 1.5 }, BANK + 0.13, 0.03);
    for (const [x0, x1, z0, z1] of [[67.3, 72.5, -21, -20.6], [67.3, 72.5, -9.4, -9], [67.3, 67.7, -21, -16.4], [67.3, 67.7, -13.6, -9]]) slab(x0, x1, z0, z1, { ...N, col: '#4f8a4a', bleed: '#3a6f3c', hatch: 1 }, BANK + 0.4, 0.6);
    for (const [bx, bz, kind] of [[69.1, -18.9, 0], [71.2, -18.9, 1], [69.1, -17.2, 2], [71.2, -17.2, 0], [69.1, -12.8, 1], [71.2, -12.8, 0], [69.1, -11.1, 0], [71.2, -11.1, 2]]) {
      box(1.6, 0.22, 1.2, bx, BANK + 0.2, bz, { ...N, col: '#8a5f3c', bleed: '#6a452a' });
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
        const px = bx - 0.6 + i * 0.4, pz = bz - 0.4 + j * 0.4;
        if (kind === 0) A(ICO0, px, BANK + 0.5, pz, { ...N, col: FLOWERS[Math.floor(R2() * FLOWERS.length)], hull: true, hatch: 0 }, R2() * 6, 0, 0, 0.15);
        else if (kind === 1) A(ICO, px, BANK + 0.42, pz, { ...N, col: '#7fbf5a', bleed: '#5a9a44', hull: true }, R2() * 6, 0, 0, [0.17, 0.13, 0.17]);     // cabbages
        else { A(CYL, px, BANK + 0.6, pz, { ...N, col: '#6f9f45', ink: false }, 0, 0, 0, [0.02, 0.6, 0.02]); A(ICO0, px, BANK + 0.82, pz, { ...N, col: '#d2302c', bleed: '#a82420', hull: true, hatch: 0 }, 0, 0, 0, 0.09); }   // tomatoes
      }
    }
  });
  tag('garden').hullWidth = 1.2;
  orb('basta', [70, BANK + 0.5, -17.6], 5, ['garden'], 'close', BANK + 1, { near: { p: [70.1, BANK + 0.6, -15], r: 2.4 } });

  // ---------- the school, facing the pitch and the playground ----------
  b.push(mat4(42, BANK, 89.2, Math.PI));
  b.object(() => {
    const H = { tag: 'school', orb: 'skola' }, T = { tag: 'school', solid: false }, W = 15, D = 6.5, Hh = 7.4, fz = D / 2 + 0.15;
    box(W, 1, D, 0, 0.5, 0, { ...H, col: '#bcafa2', bleed: '#978a7c', pat: PAT.blocks, ps: 0.55, pool: 1 });
    box(W + 0.3, Hh - 1, D + 0.3, 0, 1 + (Hh - 1) / 2, 0, { ...H, col: '#f4dc9a', bleed: '#e6bf6c', pool: 1 });
    A(roofGeo(D + 1.5, W + 1.5, 2.4, W - D + 1), 0, Hh, 0, { ...H, col: TILES[1][0], bleed: TILES[1][1], pat: PAT.roof, ps: 1.5 }, Math.PI / 2);
    for (let fl = 0; fl < 2; fl++) for (let i = 0; i < 6; i++) {
      const px = -6.25 + i * 2.5, py = 2.5 + fl * 3; if (i === 2 || i === 3) continue;
      box(1.7, 1.8, 0.1, px, py, fz + 0.02, { ...T, col: '#7fb0c9', bleed: '#4f86a3', pool: 1 });
      box(1.9, 0.12, 0.16, px, py, fz + 0.07, { ...T, col: '#fbf7ec', ink: false }); box(0.12, 1.8, 0.16, px, py, fz + 0.07, { ...T, col: '#fbf7ec', ink: false }); box(2, 0.14, 0.24, px, py - 0.97, fz + 0.1, { ...T, col: '#fbf7ec', bleed: '#d9d2c2' });
    }
    box(2.6, 2.7, 0.14, 0, 1.35, fz + 0.03, { ...T, col: '#3f6f5a', bleed: '#2c5040', pat: PAT.planks, ps: 2.2, pool: 1 });
    for (const st of [0, 1]) box(4.2 - st * 0.8, 0.25, 1.6 - st * 0.6, 0, 0.125 + st * 0.25, fz + 0.8 - st * 0.3, { ...H, col: '#c4beb4', bleed: '#a29c94' });
    A(roofGeo(4.2, 1.6, 0.9, 1.6, true), 0, 4.05, fz + 0.7, { ...T, col: TILES[1][0], bleed: TILES[1][1], pat: PAT.roof, ps: 1.5 }, 0);
    for (const sx of [-1.9, 1.9]) A(CYL, sx, 2.05, fz + 1.35, { ...T, col: '#fbf7ec', bleed: '#d9d2c2', edge: 50 }, 0, 0, 0, [0.11, 4.1, 0.11]);
    box(5.4, 1.5, 0.14, 0, 5.75, fz + 0.1, { ...T, col: '#34495a', bleed: '#25333f' });
    sign('ŠKOLA', 5.22, fz + 0.2, 0.13, { ...T, col: '#f8ecc6', bleed: '#f2d98a', ink: false, hatch: 0 });
    // a bell under a little roof on the ridge
    box(1, 1.1, 1, 0, Hh + 2.6, 0, { ...T, col: '#f4dc9a', bleed: '#e6bf6c' }); A(CONE4, 0, Hh + 3.6, 0, { ...T, col: TILES[1][0], bleed: TILES[1][1] }, Math.PI / 4, 0, 0, [1, 0.9, 1]);
    A(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0, Hh + 2.45, 0.56, { ...T, col: '#c69a3a', bleed: '#a07a25', hull: true }, 0, 0, 0, 0.26);
  });
  b.pop();
  tag('school').hullWidth = 1.3;
  orb('skola', [42, BANK + 4.5, 89.2], 10, ['school'], 'close', BANK + 10);

  // ---------- the ice cream cart on the west square ----------
  b.push(mat4(-47.3, BANK + 0.12, 15.7, 0.4));
  b.object(() => {
    const I = { tag: 'icecream' }, N = { tag: 'icecream', solid: false };
    box(1.7, 0.9, 0.95, 0, 0.85, 0, { ...I, col: '#f6efe2', bleed: '#f3b7c6', pool: 1 }); box(1.84, 0.1, 1.08, 0, 1.34, 0, { ...I, col: '#e58aa5', bleed: '#c96a88' });
    for (const sx of [-0.55, 0.55]) for (const sz of [-0.52, 0.52]) A(CYL12, sx, 0.38, sz, { ...N, col: '#4a4a48', bleed: '#2f2f2e', edge: 40 }, 0, Math.PI / 2, 0, [0.38, 0.08, 0.38]);
    A(CYL, -0.62, 2.25, 0, { ...N, col: '#6a4a30', edge: 50 }, 0, 0, 0, [0.04, 1.75, 0.04]);
    A(CONE8, -0.62, 3.3, 0, { ...I, col: '#f08fb0', bleed: '#f6f0e6', edge: 20 }, 0, 0, 0, [1.55, 0.6, 1.55]);
    [['#f6e3b0', 0.15], ['#f08fb0', 0.5], ['#8a5a34', -0.2]].forEach(([c, x]) => { A(CONE8, x, 1.52, 0.15, { ...N, col: '#d9a25a', bleed: '#b97f3a', ink: false }, 0, Math.PI, 0, [0.075, 0.24, 0.075]); A(ICO, x, 1.69, 0.15, { ...N, col: c, hull: true, hatch: 0 }, 0, 0, 0, 0.1); });
  });
  b.pop();
  tag('icecream').hullWidth = 1.3;
  orb('sladoled', [-46.8, BANK + 1.3, 15], 2.8, ['icecream'], 'close', BANK + 1.6, { near: { p: [-45.5, BANK + 0.6, 13.2], r: 3 }, at: new Vector3(-47.3, BANK + 2.6, 16.9) });
  orb('jesti', [-46.3, BANK + 1.3, 14.2], 2.4, ['eat'], 'close', BANK + 2.2, { requires: ['sladoled'], near: { p: [-45.5, BANK + 0.6, 13.2], r: 3 } });

  // ---------- the mosque courtyard: a paved path from the gate to the door ----------
  const YARD = { tag: 'yard', col: '#ece6d8', bleed: '#cdc8bc', pat: PAT.cobble, ps: 1.4, orb: 'dvoriste' };
  slab(26, 28, -36.9, -32.6, YARD, BANK + 0.09, 0.06); slab(26, 37.4, -32.6, -30.6, YARD, BANK + 0.09, 0.06);
  tag('yard').mode = 'one'; tag('yard').radius = 26;
  slab(17.6, 37, -52.4, -21.6, { tag: 'yard', col: '#93b867', bleed: '#7aa255', pat: PAT.grass, orb: 'dvoriste' }, BANK + 0.03, 0.06);
  orb('dvoriste', [27.5, BANK + 1, -37], 17, ['yard'], 'close', BANK + 1, { near: { p: [31, BANK + 0.6, -31.6], r: 3 }, at: new Vector3(31.5, BANK + 3, -31.6) });

  // ---------- a small football pitch and a playground on the southern green ----------
  b.object(() => {
    const Pt = { tag: 'pitch', orb: 'teren' }, Ln = { tag: 'pitch', col: '#f8f4ea', solid: false, ink: false, hatch: 0 };
    slab(22, 40, 70, 82, { ...Pt, col: '#7cb35c', bleed: '#5d9a4c', pat: PAT.grass }, BANK + 0.09, 0.06);
    for (const [x0, x1, z0, z1] of [[22.3, 39.7, 70.3, 70.44], [22.3, 39.7, 81.56, 81.7], [22.3, 22.44, 70.3, 81.7], [39.56, 39.7, 70.3, 81.7], [30.93, 31.07, 70.3, 81.7], [22.44, 24.6, 73.6, 73.74], [22.44, 24.6, 78.26, 78.4], [24.46, 24.6, 73.6, 78.4],
      [37.4, 39.56, 73.6, 73.74], [37.4, 39.56, 78.26, 78.4], [37.4, 37.54, 73.6, 78.4]]) slab(x0, x1, z0, z1, Ln, BANK + 0.128, 0.012);
    A(new THREE.RingGeometry(1.5, 1.64, 28).rotateX(-Math.PI / 2), 31, BANK + 0.135, 76, Ln);
    for (const gx of [22.37, 39.63]) {
      const Gl = { tag: 'pitch', col: '#f6f1e6', bleed: '#d9d2c2', solid: false, edge: 50 };
      for (const gz of [74.6, 77.4]) A(CYL, gx, BANK + 0.85, gz, Gl, 0, 0, 0, [0.06, 1.5, 0.06]);
      A(CYL, gx, BANK + 1.6, 76, Gl, 0, Math.PI / 2, 0, [0.06, 2.92, 0.06]);
      box(0.05, 1.5, 2.8, gx + Math.sign(gx - 31) * 0.7, BANK + 0.8, 76, { tag: 'pitch', col: '#f6f1e6', bleed: '#cfd6d8', solid: false, hatch: 1 }, 0, 0, Math.sign(gx - 31) * -0.42);
    }
  });
  orb('lopta', [31.2, BANK + 0.3, 76.2], 1.6, ['ball'], 'close', BANK + 0.5, { near: { p: [31.2, BANK + 0.4, 77.2], r: 2.6 }, at: new Vector3(31.2, BANK + 1.5, 76.2) });
  orb('teren', [31, BANK + 0.4, 76], 10, ['pitch'], 'close', BANK + 1, { at: new Vector3(36.5, BANK + 3.2, 79.5) });
  b.object(() => {
    const Sd = { tag: 'slide', orb: 'tobogan' }, Pk = { tag: 'park', orb: 'igraliste' };
    slab(49.5, 61.5, 67, 78, { ...Pk, col: '#ecdcab', bleed: '#d9bf82' }, BANK + 0.09, 0.06);
    b.push(mat4(SL.x, SL.y, SL.z));
    box(1.3, 0.12, 1.2, 0, 1.9, 0, { ...Sd, col: '#e9b83a', bleed: '#c9942a' });
    for (const [lx, lz] of [[-0.58, -0.52], [-0.58, 0.52], [0.58, -0.52], [0.58, 0.52]]) A(CYL, lx, 1.4, lz, { tag: 'slide', col: '#3f6f9a', bleed: '#2f5578', solid: false, edge: 50 }, 0, 0, 0, [0.06, 2.8, 0.06]);
    for (const lz of [-0.56, 0.56]) box(1.3, 0.07, 0.07, 0, 2.75, lz, { tag: 'slide', col: '#3f6f9a', solid: false });
    box(4.44, 0.08, 0.9, -2.72, 1.14, 0, { ...Sd, col: '#d9453a', bleed: '#b3352d' }, 0, 0, 0.357);
    for (const lz of [-0.47, 0.47]) box(4.44, 0.34, 0.07, -2.72, 1.3, lz, { tag: 'slide', col: '#b3352d', solid: false }, 0, 0, 0.357);
    for (const lz of [-0.4, 0.4]) box(0.08, 2.15, 0.08, 1.12, 0.95, lz, { tag: 'slide', col: '#3f6f9a', solid: false }, 0, 0, 0.44);
    for (let i = 0; i < 5; i++) box(0.07, 0.07, 0.8, 1.52 - i * 0.18, 0.3 + i * 0.37, 0, { tag: 'slide', col: '#e9b83a', solid: false });
    b.pop();
    // a sandpit beside it
    box(3.4, 0.25, 3.4, 52.2, BANK + 0.2, 69.6, { ...Pk, col: '#b9683e', bleed: '#96502e', pat: PAT.planks, ps: 1 }); box(3.0, 0.1, 3.0, 52.2, BANK + 0.31, 69.6, { tag: 'park', col: '#f3e3ae', bleed: '#e0c98a', solid: false, ink: false });
    // a swing, and a low fence along two sides
    const Sw = { tag: 'park', solid: false, col: '#4f8068', bleed: '#3a6350', edge: 50 };
    for (const sx of [-1.5, 1.5]) for (const sz of [-0.7, 0.7]) A(CYL, 52.6 + sx, BANK + 1.3, 75.6 + sz * 0.5, Sw, 0, sz * 0.5, 0, [0.06, 2.7, 0.06]);
    A(CYL, 52.6, BANK + 2.5, 75.6, Sw, 0, 0, Math.PI / 2, [0.06, 3.2, 0.06]);
    for (const sx of [-0.6, 0.6]) { for (const dx of [-0.2, 0.2]) A(CYL, 52.6 + sx + dx, BANK + 1.55, 75.6, { ...Sw, col: '#5a4a40', ink: false }, 0, 0, 0, [0.012, 1.9, 0.012]); box(0.55, 0.06, 0.24, 52.6 + sx, BANK + 0.6, 75.6, { ...Sw, col: '#d9453a', bleed: '#b3352d' }); }
    for (let i = 0; i < 13; i++) box(0.1, 0.7, 0.1, 49.7 + i * 0.98, BANK + 0.45, 77.8, { tag: 'park', solid: false, col: '#f6f1e6', bleed: '#d9d2c2' });
    box(11.9, 0.08, 0.06, 55.55, BANK + 0.62, 77.8, { tag: 'park', solid: false, col: '#f6f1e6', bleed: '#d9d2c2' });
  });
  orb('tobogan', [55, BANK + 1.3, 72.5], 4.5, ['slide'], 'close', BANK + 3);
  orb('igraliste', [55.5, BANK + 0.5, 72.5], 9, ['park'], 'close', BANK + 1, { at: new Vector3(52.2, BANK + 2.7, 69.6) });
  orb('djeca', [58.6, BANK + 0.9, 72.2], 3.4, ['kids'], 'combo', BANK + 1.7, { near: { p: [59.8, BANK + 0.6, 71.2], r: 3.2 }, at: new Vector3(59.2, BANK + 3.6, 71.8) });

  // the raft on the river: a floating thing the bird can land on (its figure is built in people.js)
  b.block(BOX, mat4(-3, 0.18, -34, 0, 0, 0, [1.5, 0.5, 3.3]), { orb: 'splav' });
  orb('splav', [-3, 0.5, -34], 3.2, ['raft'], 'close', 0.6, { near: { p: [-3, 0.5, -34], r: 3.6 }, at: new Vector3(-3, 1.9, -32.3) });
  orb('veslati', [-3, 0.9, -34], 2.6, ['row'], 'close', 1.9, { requires: ['splav'], near: { p: [-3, 0.5, -34], r: 3.6 } });

  // ---------- the rock the bird starts on ----------
  A(DODE, -19.5, BANK + 0.45, 47, { tag: 'rock', col: BOULDERS[1][0], bleed: BOULDERS[1][1] }, 0.4, 0, 0, [1.4, 0.8, 1.2]);

  // where each tag's colour starts from: the orb that paints it
  for (const o of orbs) for (const t of o.tags) tag(t).source = o.focus.clone();
  tag('sky').source = sunPos.clone(); tag('sun').source = sunPos.clone();
  b.finish(scene);

  return { slide: SL, clouds, colliders: b.colliders, orbs, start: new Vector3(-19.5, 0, 47), diverPos, diverBlock, people, cat: { x: 33.5, y: BANK + 1.1, z: 12.45, x0: 31, x1: 36.6 }, sunPos, fleur: new Vector3(0, 66, 8) };
}
