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

// palettes: [colour, colour it bleeds into]
const WALLS = [['#f3e7cd', '#e9d3a8'], ['#ecd29f', '#e0b97c'], ['#f4dccd', '#eac3ab'], ['#f6f1e6', '#e6dccb'], ['#efdf9c', '#e2c874'], ['#e6cbaa', '#d6b189'], ['#dde3d3', '#c5d0bb'], ['#f0c9a8', '#e3ad8a']];
const STONES = [['#d6cab0', '#bfb092'], ['#cdc5b3', '#b3ab9a'], ['#dccfb2', '#c7b48e']];
const SLABS = [['#9c978c', '#827e76'], ['#8d9197', '#757b85'], ['#a79f90', '#8e8474'], ['#96958a', '#7c8076']];
const TILES = [['#cf5433', '#a8452f'], ['#c7643c', '#a44b2c'], ['#b9482f', '#96392a'], ['#d4734a', '#b4552f']];
const TRIMS = ['#4f8068', '#3f6f9a', '#8a4b2c', '#a3402f', '#c69a3a', '#5d7b8a'];
const DOORS = ['#7c4a26', '#5f6f4a', '#3d5f7a', '#8c3f2a', '#6a4a36'];
const GREENS = [['#5a9148', '#3f7a45'], ['#6f9f45', '#55883c'], ['#48845a', '#356b4c'], ['#80a851', '#62903f'], ['#5f8f3c', '#4a7634']];
const GRASS = [['#8fb05a', '#7aa04c'], ['#9cb866', '#86a653'], ['#86a85c', '#6f9650'], ['#a3ba6c', '#8aa858']];
const FLOWERS = ['#e0453a', '#f08fb0', '#f2c230', '#8f6fd0', '#f6f0e6', '#ee7a2e', '#d94f8a'];
const KILIMS = [['#b3312c', '#28406e'], ['#8f2b3a', '#d9a23a'], ['#2f5f7a', '#b8452c'], ['#a8402a', '#3f6b4a'], ['#6a2f5a', '#d0a040']];
const STREET = { tag: 'street', col: '#cdc2aa', bleed: '#b4a688', pat: PAT.cobble, ps: 1.1 };

export function buildWorld(scene) {
  const C = S.colors, b = new Builder(), R = rng(7);
  const pick = (a) => a[Math.floor(R() * a.length)], rr = (lo, hi) => lo + R() * (hi - lo);
  const A = (geo, x, y, z, o, ry = 0, rx = 0, rz = 0, s = 1) => b.add(geo, mat4(x, y, z, ry, rx, rz, s), o);
  const box = (w, h, d, x, y, z, o, ry = 0, rx = 0, rz = 0) => A(BOX, x, y, z, o, ry, rx, rz, [w, h, d]);
  const slab = (x0, x1, z0, z1, o, y = BANK + 0.05, h = 0.1) => box(x1 - x0, h, z1 - z0, (x0 + x1) / 2, y, (z0 + z1) / 2, o);
  const orbs = [];
  const orb = (id, focus, size, tags, shot, top, extra = {}) => orbs.push({ id, focus: new Vector3(...focus), size, tags, shot,
    at: new Vector3(focus[0], top + S.orb.hoverHeight, focus[2]), stage: 1, ...extra });
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
  const cloud = (x, y, z, s, o = {}) => b.object(() => {
    for (const [px, py, pz, r] of [[-2.2, 0, 0, 1.5], [-0.8, 0.5, 0.2, 1.9], [0.9, 0.45, -0.2, 2.1], [2.4, 0, 0, 1.5], [0.2, -0.25, 0.5, 1.8], [0.5, 0.1, -0.9, 1.6]])
      A(ICO2, x + px * s, y + py * s * (o.flat ?? 1), z + pz * s, { tag: 'cloud', col: '#ffffff', bleed: '#dfe7f4', hull: true, hatch: 0.6, solid: !!o.orb, orb: o.orb }, 0, 0, 0, [r * s, r * s * 0.62, r * s]);
  });
  for (const [x, y, z, s] of [[-110, 70, -150, 7], [80, 78, -190, 9], [170, 62, 40, 7], [-180, 70, 70, 8], [20, 88, 200, 8], [-40, 84, -260, 10], [120, 74, -80, 6]]) cloud(x, y, z, s);
  cloud(-24, 46, -34, 2.6, { orb: 'oblak', flat: 0.5 });
  orb('oblak', [-24, 46, -34], 9, ['cloud'], 'close', 50.3);

  // ---------- ground: two banks, the creek, the river ----------
  tag('rock').mode = 'one'; tag('rock').radius = 130; tag('river').mode = 'one'; tag('river').radius = 110;
  tag('grass').mode = 'one'; tag('grass').radius = 170; tag('street').mode = 'one'; tag('street').radius = 90;
  const ROCK = { tag: 'rock', col: '#dbcfb4', bleed: '#c8b38d' };
  box(400, 14, 383, -213, BANK - 7, -158.5, ROCK); box(400, 14, 309, -213, BANK - 7, 195.5, ROCK);
  box(400, 5, 8.2, -213, 0.5, 37, ROCK); box(400, 14, 700, 213, BANK - 7, 0, ROCK);
  const WATER = { tag: 'river', col: C.river, bleed: C.riverDeep, pat: PAT.water, hatch: 0, water: true, ink: false };
  box(26.4, 0.1, 700, 0, -0.05, 0, WATER); box(287, 0.1, 8, -156.5, 3.45, 37, WATER);
  box(0.3, 3.5, 7, -13.1, 1.75, 37, { ...WATER, solid: false });
  // pebble beach under the bridge and the stone steps up from it
  box(5.6, 1.7, 16, -10.3, -0.15, 13, { tag: 'rock', col: '#e7ddc4', bleed: '#cfc09e', pat: PAT.cobble, ps: 1.7 });
  const ramp = new THREE.Shape(); ramp.moveTo(0, -1); ramp.lineTo(11.3, -1); ramp.lineTo(11.3, 11.2); ramp.lineTo(0, -0.1); ramp.closePath();
  A(new THREE.ExtrudeGeometry(ramp, { depth: 2.4, bevelEnabled: false }).translate(0, 0, -1.2), -11.8, 0.7, 21, { ...STREET, pat: PAT.blocks, ps: 0.6 }, -Math.PI / 2);
  for (let i = 0; i < 15; i++) box(2.4, 0.76, 0.76, -11.8, 0.7 + (i + 1) * 0.753 - 0.38, 21.4 + i * 0.75, { ...STREET, pat: 0 });
  // rocky ledges along both cliffs
  for (const side of [-1, 1]) for (let i = 0; i < 26; i++) {
    const z = rr(-135, 135); if (Math.abs(z) < 6 || (side < 0 && z > 1 && z < 45) || (side > 0 && z > -29 && z < -18)) continue;
    const w = rr(2, 5), h = rr(2, 9), d = rr(3, 8);
    box(w, h, d, side * (13.3 - w / 2), h / 2 - 0.6, z, { tag: 'rock', col: pick(STONES)[0], bleed: '#bba987' }, rr(-0.2, 0.2), 0, rr(-0.06, 0.06));
  }
  box(5, 8, 9, 11.2, 3, -23.5, { tag: 'rock', col: '#d2c5a8', bleed: '#b9a684', orb: 'stijena' }, 0.08);
  orb('stijena', [11, 5, -23.5], 7, ['rock'], 'wide', 7.2);
  // boulders in the river
  for (const [x, z, s, o] of [[3, 30, 1.5, 'rijeka'], [-5, -18, 1.1], [6, -42, 1.3], [-3, 64, 1.2], [7.5, 50, 0.9], [-7, 86, 1.4], [4, -80, 1.2]])
    A(DODE, x, 0.25, z, { tag: 'rock', col: pick(STONES)[0], bleed: '#a99c84', orb: o }, R() * 6, 0, 0, [2 * s, 0.9 * s, 1.6 * s]);
  orb('rijeka', [3, 0.6, 30], 5, ['river'], 'wide', 1.6, { near: { p: [3, 1, 30], r: 4 } });

  // streets (kaldrma) and squares
  for (const [x0, x1, z0, z1, id] of [[17, 64, -2.6, 2.6, 'ulica'], [38, 43, -64, -2.6], [17, 21, 2.6, 62], [52, 67, -22, -8.5], [-64, -17, -2.6, 2.6], [-42, -37, 2.6, 33.2], [-42, -37, 40.8, 72],
    [-45, -40, -64, -2.6], [-61, -45, 3, 19], [43, 52, -17, -13]]) slab(x0, x1, z0, z1, { ...STREET, orb: id }, BANK + 0.06, 0.12);
  orb('ulica', [36, BANK, 0], 5, ['street'], 'wide', BANK + 1.2);

  // grass: the outskirts and a few gardens, each a slightly different green
  const grass = (x0, x1, z0, z1, id) => { const g = pick(GRASS); slab(x0, x1, z0, z1, { tag: 'grass', col: g[0], bleed: g[1], pat: PAT.grass, orb: id }, BANK + 0.03, 0.06); };
  for (const r of [[-413, -72, -350, 33], [-413, -72, 41, 350], [78, 413, -350, 350], [-72, -13.6, -350, -70], [13.6, 78, -350, -68], [-72, -13.6, 76, 350], [13.6, 78, 66, 350],
    [-36, -14, 41.2, 76], [-72, -43, 41.2, 76], [-72, -62, -30, -4], [-30, -15, 26.5, 32.5], [22, 37, 46, 64], [64, 78, -68, 66], [17.6, 37, -52.4, -21.6]]) grass(...r);
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
  const wall = (x0, x1, z0, z1, h = 1.3, id) => { const s = pick(STONES); slab(x0, x1, z0, z1, { tag: 'wall', col: s[0], bleed: s[1], pat: PAT.blocks, ps: 1.1, pool: 1, orb: id }, BANK + h / 2, h); };

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
      const win = (px, py, pz, wr, big, fl) => {
        const ww = big ? 2.4 : 0.95, wh = big ? 1.6 : 1.25, Wn = { tag: 'window', pool: 1, solid: false };
        b.push(mat4(px, py, pz, wr));
        box(ww, wh, 0.1, 0, 0, 0.02, { ...Wn, col: '#6a93ad', bleed: '#44708f' });
        for (const sg of [-1, 1]) box(ww * 0.25, wh, 0.07, sg * ww * 0.63, 0, 0.04, { ...Wn, col: trim, bleed: trim, pat: PAT.planks, ps: 3 });
        box(ww * 1.55, 0.14, big ? 1.1 : 0.34, 0, -wh / 2 - 0.07, big ? 0.55 : 0.17, { tag: 'window', col: '#d8cdb6', bleed: '#bfb092', solid: !!big, orb: big ? o.windowOrb : undefined });
        if (fl) { box(ww * 0.95, 0.22, 0.3, 0, -wh / 2 + 0.11, 0.33, { tag: 'flower', col: '#b9683e', bleed: '#96502e', solid: false }); flowers(0, -wh / 2 + 0.32, 0.33, ww * 0.8); }
        b.pop();
      };
      const uy = sh + (h - sh) * 0.52, fl = o.flowers ?? R() < 0.5;
      if (o.windowOrb) win(w * 0.12, uy, fz, 0, true, false);
      else { win(w * 0.25, uy, fz, 0, false, fl); if (w > 6.4) win(-w * 0.25, uy, fz, 0, false, fl); }
      if (sh > 2.2 && w > 6) win(w * 0.25, sh * 0.56, d / 2, 0, false, false);
      win(fx, uy, 0, Math.PI / 2, false, false); win(-fx, uy, 0, -Math.PI / 2, false, false); win(0, uy, -fz, Math.PI, false, false);
    });
    b.pop();
    return { ...o, top: BANK + h + rh };
  }

  const tut = house({ x: -30, z: 22, rot: 0.6, w: 8, d: 7, h: 5.5, rh: 3, roof: 'gable', kind: 'tile', wall: WALLS[0], roofC: TILES[0], orb: 'kuca', flowers: true });
  orbs.push({ id: 'kuca', focus: new Vector3(-30, BANK + 4, 22), size: 6.5, tags: ['house'], shot: 'combo', at: new Vector3(-30, tut.top + S.orb.hoverHeight, 22), stage: 0 });
  // west bank
  house({ x: -30, z: -9.5, w: 7, d: 6, h: 6 });
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
  orb('vrata', [doorP.x, doorP.y, doorP.z], 3.2, ['door'], 'combo', doorP.y + 1.3, { near: { p: [doorP.x + 1.5, BANK + 0.6, doorP.z], r: 3 } });
  for (const t of ['house', 'chimney', 'window', 'door', 'tree', 'flower', 'lamp', 'bench', 'wall', 'tower', 'shop', 'carpet']) tag(t).waveDelay = 2.2;

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
    box(4.6, 20, 4.6, 59.5, BANK + 10, -15, { tag: 'tower', col: s[0], bleed: s[1], pat: PAT.blocks, ps: 0.5, pool: 1 });
    box(5.2, 0.5, 5.2, 59.5, BANK + 16.5, -15, { tag: 'tower', col: s[1] }); box(5.2, 0.5, 5.2, 59.5, BANK + 20.2, -15, { tag: 'tower', col: s[1] });
    A(CONE4, 59.5, BANK + 22.4, -15, { tag: 'tower', col: SLABS[1][0], bleed: SLABS[1][1] }, Math.PI / 4, 0, 0, [3.8, 4, 3.8]);
    for (const [dx, dz, ry] of [[0, 2.33, 0], [2.33, 0, Math.PI / 2], [0, -2.33, Math.PI], [-2.33, 0, -Math.PI / 2]])
      A(CYL12, 59.5 + dx, BANK + 18.3, -15 + dz, { tag: 'tower', col: '#f3ecd8', bleed: '#e0d2a8', solid: false, edge: 40 }, ry, Math.PI / 2, 0, [1.1, 0.08, 1.1]);
  });
  orb('kula', [-21.2, BANK + 7, -6.2], 8, ['tower'], 'combo', BANK + 14.4);

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
    const Mn = { tag: 'minaret', orb: 'munara' }, s = ['#ece4d2', '#d6c9aa'];
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
  orb('dzamija', [27, BANK + 6, -41], 10, ['mosque'], 'close', BANK + 14);
  orb('munara', [34, BANK + 14, -35.6], 10, ['minaret'], 'close', BANK + 27.2, { requires: ['dzamija'] });
  orb('cesma', [24, BANK + 2, -28], 4, ['fountain'], 'close', BANK + 4.7);
  const wallNoOrb = (...a) => wall(...a);
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
    [22, 54, 1], [33, 58, 1.1], [68, 44, 1.2], [56, 36.5, 0.8], [72, -14, 1.1], [58, -62, 1.2], [30, -64, 1], [72, -66, 1.3], [-30, -70, 1.1], [45, 70, 1.2], [-55, 78, 1.2], [66, 30, 1]]) tree(x, z, s);
  for (const [x, z, s] of [[-66, 12, 1.2], [-70, 14.5, 1], [57, -24.5, 1.1], [70, -30, 1.3], [-22, 26, 0.9], [38, 27, 1]]) cypress(x, z, s);
  for (const [x, z, s] of [[-18, 30, 1], [-60, 60, 1.2], [-44, 74, 1], [24, 62.5, 1], [35, 49, 0.9], [-67, -8, 1], [66, 14, 1.1], [18.5, -60, 1.2], [-20, -62, 1], [75, 50, 1.2], [-22, 43, 0.8]]) bush(x, z, s);
  b.object(() => { // a stone trough of flowers in the square
    box(2.8, 0.7, 1.2, -48.5, BANK + 0.35, 6, { tag: 'flower', col: '#d6cab0', bleed: '#bfb092', pat: PAT.blocks, ps: 1.4, pool: 1, orb: 'cvijet' });
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
  boat(-5.6, 12, 0.5, 'camac', ['#3f7f9a', '#2f6078']); boat(10.5, 56, 1.4, undefined, ['#b8502f', '#96402a']);
  orb('camac', [-5.6, 0.5, 12], 3.2, ['boat'], 'close', 1, { near: { p: [-8.5, 0.9, 12], r: 3 } });

  // ---------- a cat on a wall ----------
  b.object(() => {
    const Ct = { tag: 'cat', col: '#e39a4a', bleed: '#c9752f', hull: true, hatch: 0.4, orb: 'macka' }, cx = 33.5, cz = 12.45, cy = BANK + 1.1;
    A(ICO2, cx, cy + 0.36, cz, Ct, 0, 0, 0, [0.42, 0.36, 0.3]); A(ICO2, cx + 0.34, cy + 0.72, cz, Ct, 0, 0, 0, 0.23);
    for (const s of [-1, 1]) A(CONE4, cx + 0.34, cy + 0.95, cz + s * 0.12, { ...Ct, solid: false }, 0.4, 0, 0, [0.09, 0.16, 0.09]);
    A(CYL, cx - 0.45, cy + 0.42, cz + 0.1, { ...Ct, solid: false, sway: (v) => 0.25 * Math.max(0, v.y - cy - 0.2) }, 0, 0, 0.5, [0.05, 0.7, 0.05]);
  });
  orb('macka', [33.5, BANK + 1.6, 12.45], 2.2, ['cat'], 'close', BANK + 2.2, { near: { p: [33.5, BANK + 1.6, 12.45], r: 2.8 } });

  // ---------- Stari Most and the Crooked Bridge ----------
  tag('bridge').mode = 'one'; tag('bridge').radius = 30; tag('bridge').dur = 5.5;
  const BR = { tag: 'bridge', col: '#e9dfc6', bleed: '#d3c29c', pat: PAT.blocks, ps: 0.5, orb: 'most' };
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
  A(new THREE.ExtrudeGeometry(crook, { depth: 4.6, bevelEnabled: false, curveSegments: 16 }).translate(0, 0, -2.3), -39.5, 0, 37, { ...BR, orb: undefined }, -Math.PI / 2);
  for (const dx of [-2.25, 2.25]) box(0.3, 0.8, 11, -39.5 + dx, 12.9, 37, { ...BR, orb: undefined, pat: 0 });
  orb('most', [0, 12, 0], 16, ['bridge'], 'bridge', 19.2, { stage: 2 });
  // the diver stands on the ledge; his spot and the invisible obstacle around him
  const diverPos = new Vector3(0, 18.9, 1.84);
  b.block(BOX, mat4(0, 20.1, 1.84, 0, 0, 0, [2.8, 2.5, 0.8]), { wall: true, diver: true });
  orb('skakac', [0, 20, 1.84], 2.6, ['diver'], 'close', 21.5, { near: { p: [0, 19.2, 1.84], r: 5 } });

  // ---------- the rock the bird starts on ----------
  A(DODE, -19.5, BANK + 0.45, 47, { tag: 'rock', col: STONES[0][0], bleed: STONES[0][1] }, 0.4, 0, 0, [1.4, 0.8, 1.2]);

  // where each tag's colour starts from: the orb that paints it
  for (const o of orbs) for (const t of o.tags) tag(t).source = o.focus.clone();
  tag('sky').source = sunPos.clone(); tag('sun').source = sunPos.clone();
  b.finish(scene);

  return { colliders: b.colliders, orbs, start: new Vector3(-19.5, 0, 47), diverPos, sunPos, fleur: new Vector3(0, 66, 8) };
}
