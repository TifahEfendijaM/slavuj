// Building blocks for the maps after Mostar: the same sketch-and-wash pieces as world.js (sky, sun, clouds, houses,
// trees, lamps, benches, walls, far hills), with palettes for each season. Mostar keeps its own copy in world.js.
import * as THREE from 'three';
import S from './settings.js';
import { Builder, tag, PAT, rng, SUN_DIR } from './paper.js';

export const BANK = 12;      // the height of the town's ground (the river and low ground lie below it)
const { Matrix4, Vector3, Quaternion, Euler } = THREE;
export const mat4 = (x, y, z, ry = 0, rx = 0, rz = 0, s = 1) => new Matrix4().compose(new Vector3(x, y, z),
  new Quaternion().setFromEuler(new Euler(rx, ry, rz, 'YXZ')), Array.isArray(s) ? new Vector3(...s) : new Vector3(s, s, s));
export const GEO = {
  BOX: new THREE.BoxGeometry(1, 1, 1), CYL: new THREE.CylinderGeometry(1, 1, 1, 8), CYL12: new THREE.CylinderGeometry(1, 1, 1, 12), CYL16: new THREE.CylinderGeometry(1, 1, 1, 16),
  CONE4: new THREE.ConeGeometry(1, 1, 4), CONE8: new THREE.ConeGeometry(1, 1, 8), CONE12: new THREE.ConeGeometry(1, 1, 12),
  ICO0: new THREE.IcosahedronGeometry(1, 0), ICO: new THREE.IcosahedronGeometry(1, 1), ICO2: new THREE.IcosahedronGeometry(1, 2),
  DODE: new THREE.DodecahedronGeometry(1, 0), HEMI: new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  TAPER: new THREE.CylinderGeometry(0.7, 1, 1, 7), POT: new THREE.CylinderGeometry(0.8, 1, 1, 8), SPH: new THREE.SphereGeometry(1, 12, 10),
};

// a hipped or gabled roof: eaves w x d, ridge along z with length rl, height rh. UVs are in metres.
export function roofGeo(w, d, rh, rl, open = false) {
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
export function triGeo(a, b, c) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c], 3)); g.computeVertexNormals(); return g; }

// palettes: [colour, colour it bleeds into]
export const PAL = {
  WALLS: [['#f3e7cd', '#e9d3a8'], ['#ecd29f', '#e0b97c'], ['#f4dccd', '#eac3ab'], ['#f6f1e6', '#e6dccb'], ['#efdf9c', '#e2c874'], ['#e6cbaa', '#d6b189'], ['#dde3d3', '#c5d0bb'], ['#f0c9a8', '#e3ad8a']],
  STONES: [['#d9ceb6', '#bfb092'], ['#c4beb4', '#a29c94'], ['#d6ba90', '#b3956a'], ['#bcafa2', '#978a7c'], ['#e6dfd0', '#cbc2ad']],
  BOULDERS: [['#8f8578', '#6d665d'], ['#b39468', '#8a6e4a'], ['#6f7f8c', '#55626e'], ['#a8785e', '#84584a'], ['#8b8f72', '#667052'], ['#a59a8c', '#7d7468'], ['#7b6a5e', '#5a4c44']],
  SLABS: [['#9c978c', '#827e76'], ['#8d9197', '#757b85'], ['#a79f90', '#8e8474'], ['#96958a', '#7c8076']],
  TILES: [['#cf5433', '#a8452f'], ['#c7643c', '#a44b2c'], ['#b9482f', '#96392a'], ['#d4734a', '#b4552f'], ['#a8432c', '#86331f']],
  WOODROOF: [['#7a5a3e', '#5c4330'], ['#8a6646', '#6a4c34'], ['#6e5440', '#523e30']],
  TRIMS: ['#4f8068', '#3f6f9a', '#8a4b2c', '#a3402f', '#c69a3a', '#5d7b8a'],
  DOORS: ['#7c4a26', '#5f6f4a', '#3d5f7a', '#8c3f2a', '#6a4a36'],
  FLOWERS: ['#e0453a', '#f08fb0', '#f2c230', '#8f6fd0', '#f6f0e6', '#ee7a2e', '#d94f8a'],
  KILIMS: [['#b3312c', '#28406e'], ['#8f2b3a', '#d9a23a'], ['#2f5f7a', '#b8452c'], ['#a8402a', '#3f6b4a'], ['#6a2f5a', '#d0a040']],
};
// tree crowns by season
export const LEAVES = {
  summer: [['#5a9148', '#3f7a45'], ['#6f9f45', '#55883c'], ['#48845a', '#356b4c'], ['#80a851', '#62903f']],
  autumn: [['#e08a2e', '#c4561e'], ['#d9612e', '#a83a1f'], ['#e8b13a', '#c98a1e'], ['#c9452a', '#8f2a1e'], ['#d99a3a', '#b0622a'], ['#a8b04a', '#7a8a32']],
  spring: [['#8ec26a', '#6aa44e'], ['#a6d07a', '#7fb05a'], ['#f2c6d6', '#e29ab6'], ['#f6e2ea', '#e8b8ca'], ['#9cc870', '#74a850']],
  winter: [['#3f6b52', '#2a5040'], ['#4a7458', '#33584a'], ['#365f4a', '#24483a']],
};

export function makeKit(scene, opts = {}) {
  const b = new Builder(), R = rng(opts.seed ?? 11);
  const pick = (a) => a[Math.floor(R() * a.length)], rr = (lo, hi) => lo + R() * (hi - lo);
  const A = (geo, x, y, z, o, ry = 0, rx = 0, rz = 0, s = 1) => b.add(geo, mat4(x, y, z, ry, rx, rz, s), o);
  const box = (w, h, d, x, y, z, o, ry = 0, rx = 0, rz = 0) => A(GEO.BOX, x, y, z, o, ry, rx, rz, [w, h, d]);
  const slab = (x0, x1, z0, z1, o, y = BANK + 0.05, h = 0.1) => box(x1 - x0, h, z1 - z0, (x0 + x1) / 2, y, (z0 + z1) / 2, o);
  const orbs = [], clouds = [];
  const orb = (id, focus, size, tags, shot, top, extra = {}) => orbs.push({ id, focus: new Vector3(...focus), size, tags, shot,
    at: new Vector3(focus[0], top + S.orb.hoverHeight, focus[2]), stage: 1, ...extra });
  const K = { b, R, pick, rr, A, box, slab, orb, orbs, clouds, mat4, GEO, PAL, trees: [] };      // (trees: each broad-leaved tree's crown, for things falling from them)

  // the sky dome and the sun (both coloured in the finale) with its pencilled rays
  K.sky = (o = {}) => {
    tag('sky').side = THREE.BackSide; tag('sky').mode = 'one'; tag('sky').radius = 1300; tag('sky').dur = 6;
    tag('sun').mode = 'one'; tag('sun').radius = 60; tag('sun').dur = 2.5;
    A(new THREE.SphereGeometry(700, 32, 20), 0, 0, 0, { tag: 'sky', col: o.col || '#f8a55a', bleed: o.bleed || '#6577b6', pat: PAT.sky, hatch: 0, ink: false, solid: false });
    const sunPos = SUN_DIR.clone().multiplyScalar(520);
    const sunM = new Matrix4().lookAt(sunPos, new Vector3(0, 20, 0), new Vector3(0, 1, 0)).setPosition(sunPos);
    b.add(new THREE.CircleGeometry(30, 40).rotateY(Math.PI), sunM, { tag: 'sun', col: o.sun || '#ffc23a', bleed: o.sunBleed || '#ff9a2e', hatch: 0, ink: false, solid: false });
    const sun = new THREE.Group(); sun.applyMatrix4(sunM);
    const inkBasic = new THREE.MeshBasicMaterial({ color: S.ink.color, side: THREE.DoubleSide });
    for (const [r0, ox, oy] of [[30, 0, 0], [30.8, 0.9, -0.6]]) { const ring = new THREE.Mesh(new THREE.RingGeometry(r0, r0 + 0.75, 56), inkBasic); ring.position.set(ox, oy, -0.5); sun.add(ring); }
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.1, len = 8 + R() * 7, ray = new THREE.Mesh(new THREE.PlaneGeometry(0.75, len), inkBasic);
      ray.position.set(Math.cos(a) * (38 + len / 2), Math.sin(a) * (38 + len / 2), -0.5); ray.rotation.z = a - Math.PI / 2 + (R() - 0.5) * 0.08; sun.add(ray);
    }
    scene.add(sun); K.sunPos = sunPos;
    return sunPos;
  };
  tag('cloud').hullWidth = 2;
  K.cloud = (x, y, z, s, o = {}) => b.object(() => {
    clouds.push({ c: new Vector3(x, y, z), r: 4.1 * s });
    const drift = 14 + R() * 22;
    for (const [px, py, pz, r] of [[-2.2, 0, 0, 1.5], [-0.8, 0.5, 0.2, 1.9], [0.9, 0.45, -0.2, 2.1], [2.4, 0, 0, 1.5], [0.2, -0.25, 0.5, 1.8], [0.5, 0.1, -0.9, 1.6]])
      A(GEO.ICO2, x + px * s, y + py * s * (o.flat ?? 1), z + pz * s, { tag: o.tag || 'cloud', col: o.col || '#ffffff', bleed: o.bleed || '#dfe7f4', hull: true, hatch: 0.6, solid: !!o.orb, orb: o.orb, sway: o.orb ? 0 : -drift }, 0, 0, 0, [r * s, r * s * 0.62, r * s]);
  });
  // far hills all round, the lower part hidden below the town's ground
  K.hills = (list, o = {}) => {
    tag(o.tag || 'grass').hullWidth = 1.8;
    for (const [x, z, r, h, c] of list) A(GEO.ICO2, x, (o.y ?? BANK) - 4, z, { tag: o.tag || 'grass', col: c, bleed: o.bleed || '#7d9a78', hull: true, solid: false }, R() * 6, 0, 0, [r, h, r * rr(0.7, 1)]);
  };
  K.flowers = (x, y, z, len, n = 5) => {
    for (let i = 0; i < n; i++) A(GEO.ICO0, x + (i / (n - 1) - 0.5) * len, y + rr(0, 0.1), z + rr(-0.06, 0.06), { tag: 'flower', col: pick(PAL.FLOWERS), hull: true, hatch: 0, solid: false }, R() * 6, 0, 0, rr(0.13, 0.19));
  };
  tag('flower').hullWidth = 1.2;
  // a broad-leaved tree; crown and trunk can carry their own words (o.crownTag, o.trunkTag)
  K.tree = (x, z, s = 1, o = {}) => b.object(() => {
    const g = o.col || pick(LEAVES[o.season || 'summer']), th = 3.2 * s, y0 = o.y ?? BANK, T = { tag: o.tag || 'tree', orb: o.orb };
    tag(o.crownTag || T.tag).hullWidth = 1.8;
    A(GEO.TAPER, x, y0 + th / 2, z, { ...T, tag: o.trunkTag || T.tag, col: '#7a5636', bleed: '#5f4028', edge: 50 }, R() * 6, 0, 0, [0.42 * s, th, 0.42 * s]);
    const blobs = o.big ? [[0, 1.6, 0, 2.6], [-1.9, 0.7, 0.6, 1.9], [1.8, 0.9, -0.4, 2.0], [0.4, 0.6, 1.9, 1.8], [-0.3, 0.8, -1.9, 1.8]] : [[0, 1.0, 0, 1.7], [-1.1, 0.3, 0.3, 1.25], [1.0, 0.4, -0.3, 1.3]];
    const thin = o.bare ? 0.55 : 1;      // late in autumn: a thinner crown
    K.trees.push({ x, z, y: y0 + th + 0.8 * s, r: (o.big ? 2.6 : 1.7) * s * thin, tag: o.crownTag || T.tag });
    for (const [px, py, pz, r] of blobs) A(GEO.ICO, x + px * s, y0 + th + py * s, z + pz * s, { ...T, tag: o.crownTag || T.tag, col: g[0], bleed: g[1], hull: true, sway: (v) => 0.03 * (v.y - y0 - th + 1) }, R() * 6, 0, 0, [r * s * thin, r * s * 0.85 * thin, r * s * thin]);
  });
  // a pine or spruce: tiers of dark cones (snow on them in winter: o.snow)
  K.pine = (x, z, s = 1, o = {}) => b.object(() => {
    const y0 = o.y ?? BANK, T = { tag: o.tag || 'tree', orb: o.orb }, g = pick(LEAVES.winter);
    A(GEO.CYL, x, y0 + 0.8 * s, z, { ...T, tag: o.trunkTag || T.tag, col: '#6a4a30', bleed: '#4a3220', edge: 50 }, 0, 0, 0, [0.22 * s, 1.6 * s, 0.22 * s]);
    for (let i = 0; i < 3; i++) {
      const r = (1.9 - i * 0.5) * s, h = 2.4 * s, y = y0 + (1.4 + i * 1.5) * s + h / 2;
      A(GEO.CONE8, x, y, z, { ...T, col: g[0], bleed: g[1], hull: true, wall: i === 0, sway: (v) => 0.015 * (v.y - y0) }, R() * 6, 0, 0, [r, h, r]);
      if (o.snow) A(GEO.CONE8, x, y + 0.18 * s, z, { tag: o.snowTag || 'snow', col: '#fbfdff', bleed: '#d6e4f2', hull: false, ink: false, solid: false }, R() * 6, 0, 0, [r * 0.7, h * 0.62, r * 0.7]);
    }
  });
  K.bush = (x, z, s = 1, o = {}) => b.object(() => { const g = o.col || pick(LEAVES[o.season || 'summer']); for (const [px, pz, r] of [[0, 0, 1], [0.8, 0.3, 0.75], [-0.7, -0.2, 0.7]]) A(GEO.ICO, x + px * s, (o.y ?? BANK) + 0.5 * s, z + pz * s, { tag: o.tag || 'tree', col: g[0], bleed: g[1], hull: true, sway: 0.02 }, R() * 6, 0, 0, [r * s, r * s * 0.7, r * s]); });
  K.lamp = (x, z, o = {}) => b.object(() => {
    const y0 = o.y ?? BANK, L = { tag: o.tag || 'lamp', col: '#3f4a4a', bleed: '#2c3838', orb: o.orb };
    A(GEO.CYL, x, y0 + 1.8, z, { ...L, edge: 50 }, 0, 0, 0, [0.09, 3.6, 0.09]); box(0.5, 0.2, 0.5, x, y0 + 0.1, z, L);
    box(0.55, 0.7, 0.55, x, y0 + 3.95, z, { ...L, tag: o.glassTag || L.tag, col: '#f4d77a', bleed: '#eeb84a', pool: 1 }); A(GEO.CONE4, x, y0 + 4.5, z, L, Math.PI / 4, 0, 0, [0.55, 0.4, 0.55]);
  });
  K.bench = (x, z, ry, o = {}) => {
    b.push(mat4(x, o.y ?? BANK, z, ry));
    b.object(() => {
      const W = { tag: o.tag || 'bench', col: pick(['#8a5a34', '#6f7f52', '#7a4a3a']), bleed: '#5f4028', pat: PAT.planks, ps: 3, orb: o.orb };
      box(2.3, 0.12, 0.65, 0, 0.6, 0, W); box(2.3, 0.55, 0.1, 0, 1.1, -0.3, W, 0, -0.12);
      for (const sx of [-0.95, 0.95]) box(0.12, 0.6, 0.6, sx, 0.3, 0, { ...W, pat: 0, col: '#4a4a48' });
    });
    b.pop();
  };
  K.wall = (x0, x1, z0, z1, h = 1.3, o = {}) => { const s = o.col || pick(PAL.STONES); slab(x0, x1, z0, z1, { tag: o.tag || 'wall', col: s[0], bleed: s[1], pat: PAT.blocks, ps: 1.1, pool: 1, orb: o.orb }, (o.y ?? BANK) + h / 2, h); };

  // a house: stone ground floor, plastered upper floor, a hipped or gabled roof, a chimney, windows with shutters
  K.house = (o) => {
    const { x, z, rot = 0, w, d, h, rh = 2.3, roof = 'hip', kind = 'tile', tagH = 'house', y = BANK } = o;
    let chimTop = null;
    const wl = o.wall || pick(PAL.WALLS), st = pick(PAL.STONES), rc = o.roofC || (kind === 'slab' ? pick(PAL.SLABS) : kind === 'wood' ? pick(PAL.WOODROOF) : pick(PAL.TILES)), trim = pick(PAL.TRIMS), dc = pick(PAL.DOORS);
    b.push(mat4(x, y, z, rot));
    b.object(() => {
      const H = { tag: tagH, orb: o.orb }, sh = o.stone === false ? 0 : Math.min(3, h * 0.42), j = sh ? 0.3 : 0;
      if (sh) box(w, sh, d, 0, sh / 2, 0, { ...H, col: st[0], bleed: st[1], pat: PAT.blocks, ps: 0.55, pool: 1 });
      box(w + j, h - sh, d + j, 0, sh + (h - sh) / 2, 0, { ...H, col: wl[0], bleed: wl[1], pat: o.wood ? PAT.planks : 0, ps: 2, pool: 1 });
      const fz = d / 2 + j / 2, fx = w / 2 + j / 2, ov = 1.3, long = Math.max(w, d), short = Math.min(w, d), ry = d >= w ? 0 : Math.PI / 2;
      const hip = roof === 'hip', RO = { tag: o.roofTag || 'roof', orb: o.roofOrb ?? o.orb, col: rc[0], bleed: rc[1], pat: PAT.roof, ps: kind === 'slab' ? 0.8 : 1.5 };
      A(roofGeo(short + ov, long + ov, rh, hip ? Math.max(0.01, long - short + 0.8) : long + ov, !hip), 0, h, 0, RO, ry);
      if (!hip) A(roofGeo(short + j, long + j, rh * 0.92, long + j), 0, h, 0, { ...H, col: wl[0], bleed: wl[1] }, ry);
      if (o.snow) A(roofGeo(short + ov + 0.1, long + ov + 0.1, rh * 1.04, hip ? Math.max(0.01, long - short + 0.8) : long + ov + 0.1, !hip), 0, h + 0.14, 0, { tag: o.snowTag || 'snow', col: '#fbfdff', bleed: '#d3e2f2', ink: false, hatch: 0.3, solid: false }, ry);
      if (o.chimney !== false) {
        const cw = 0.85, cx = ry ? -long * 0.16 : short * 0.2, cz = ry ? short * 0.18 : -long * 0.16, cy = h + rh * 0.5, CH = { tag: o.chimTag || 'chimney', orb: o.chimneyOrb };
        const cc = pick([['#c9bda2', '#b0a184'], ['#c98a66', '#a8674a'], ['#d6d0c2', '#b9b2a2']]);
        chimTop = new Vector3(cx, cy + 2.01, cz).applyMatrix4(mat4(x, y, z, rot));
        box(cw, 2.6, cw, cx, cy + 0.5, cz, { ...CH, col: cc[0], bleed: cc[1], pat: PAT.blocks, ps: 1.4, pool: 1 });
        box(cw + 0.4, 0.22, cw + 0.4, cx, cy + 1.9, cz, { ...CH, col: cc[1], bleed: cc[1] });
      }
      const dx = o.doorX ?? -w * 0.22;
      box(1.25, 2.15, 0.16, dx, 1.08, d / 2 + 0.05, { tag: o.doorTag || 'door', col: dc, bleed: '#4a3020', pat: PAT.planks, ps: 4, pool: 1, solid: false, orb: o.doorOrb });
      box(2.1, 0.3, 1.2, dx, 0.15, d / 2 + 0.6, { tag: o.doorTag || 'door', col: '#cfc4ad', bleed: '#b4a688', orb: o.doorOrb });
      const win = (px, py, pz, wr) => {
        const Wn = { tag: o.winTag || 'window', pool: 1, solid: false, orb: o.winOrb };
        b.push(mat4(px, py, pz, wr));
        box(0.95, 1.25, 0.1, 0, 0, 0.02, { ...Wn, col: o.lit ? '#f2c66a' : '#6a93ad', bleed: o.lit ? '#d9963a' : '#44708f' });
        for (const sg of [-1, 1]) box(0.24, 1.25, 0.07, sg * 0.6, 0, 0.04, { ...Wn, col: trim, bleed: trim, pat: PAT.planks, ps: 3 });
        box(1.47, 0.14, 0.34, 0, -0.69, 0.17, { tag: o.winTag || 'window', col: '#d8cdb6', bleed: '#bfb092', solid: false });
        b.pop();
      };
      const uy = sh + (h - sh) * 0.52;
      win(w * 0.25, uy, fz, 0); if (w > 6.4) win(-w * 0.25, uy, fz, 0);
      win(fx, uy, 0, Math.PI / 2); win(-fx, uy, 0, -Math.PI / 2); win(0, uy, -fz, Math.PI);
    });
    b.pop();
    return { ...o, top: y + h + rh, chimTop };
  };
  // where each tag's colour starts from (the orb that paints it), then everything is merged and added to the scene
  K.finish = () => {
    for (const o of orbs) for (const t of o.tags) tag(t).source = o.focus.clone();
    if (K.sunPos) { tag('sky').source = K.sunPos.clone(); tag('sun').source = K.sunPos.clone(); }
    b.finish(scene);
  };
  return K;
}
