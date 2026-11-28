// Neum (summer / Adriatic Sea): 3D coastal world built from scratch on the shared Slavuj engine.
// North up (-z = rising Herzegovinian hillside & villas, +z = open Adriatic Sea & Klek peninsula,
// -x = west harbour, pier & lighthouse, +x = east pebble beach, rocky cove & island).
import * as THREE from 'three';
import { Builder, paintGeo, washMat, addHull, tag, PAT, shared } from '../paper.js';

export const SEA_Y = 0.0;
export const PROM_Y = 2.6;

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const sm = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

function makeRng(seed = 20260721) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function mat4(x, y, z, ry = 0, rx = 0, rz = 0, s = [1, 1, 1]) {
  return new THREE.Matrix4().compose(
    V(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')),
    V(s[0], s[1], s[2])
  );
}

// Continuous coastal terrain height (land north of shore, seabed sloping under sea south of shore)
export function neumGroundY(x, z) {
  if (z <= -12) {
    const u = sm((-12 - z) / 80);
    const hotelMask = sm((x + 22) / 6) * (1 - sm((x - 28) / 6)) * (1 - sm((-30 - z) / 6));
    let y = PROM_Y + u * 25.5;
    if (hotelMask > 0.01) y = y * (1 - hotelMask) + 5.2 * hotelMask;
    y += Math.sin(x * 0.045) * 1.1 * u;
    return y;
  }
  if (z <= 4) {
    if (x >= -78 && x <= 58) return PROM_Y;
    const wing = x < -78 ? sm((-78 - x) / 30) : sm((x - 58) / 30);
    return PROM_Y + wing * 6.5;
  }
  if (x < -44) {
    const wall = sm((z - 4) / 3.5);
    const outerHill = sm((-84 - x) / 22);
    return (PROM_Y * (1 - wall) - 2.6 * wall) + outerHill * 11.5;
  }
  if (x > 46) {
    const capeZ = 22 + sm((x - 46) / 30) * 18;
    const t = sm((z - 4) / Math.max(8, capeZ - 4));
    const ridge = sm((x - 66) / 22) * 8.5 * (1 - sm((z - 26) / 24));
    return PROM_Y * (1 - t) - 2.4 * t + ridge;
  }
  const edgeZ = 22.5;
  if (z <= edgeZ) {
    const t = (z - 4) / (edgeZ - 4);
    return PROM_Y * (1 - t) + 0.08 * t;
  }
  const d = sm((z - edgeZ) / 14);
  return 0.08 * (1 - d) - 2.8 * d;
}

function gableRoof(w, d, h) {
  const hw = w / 2, hd = d / 2;
  const verts = new Float32Array([
    -hw, 0, -hd,  -hw, 0, hd,   0, h, hd,
    -hw, 0, -hd,   0, h, hd,    0, h, -hd,
     hw, 0, hd,    hw, 0, -hd,  0, h, -hd,
     hw, 0, hd,    0, h, -hd,   0, h, hd,
    -hw, 0, hd,    hw, 0, hd,   0, h, hd,
     hw, 0, -hd,  -hw, 0, -hd,  0, h, -hd,
  ]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  g.computeVertexNormals();
  return g;
}

export function buildNeumWorld(scene) {
  // Bright sunlit Adriatic summer palette + warm golden-coral sunset finale uniforms
  shared.uWaterDir.value.set(0.15, 1.0);
  shared.uSunShadow.value.set(0.32, 0.56, 0.82);
  shared.uSunGlow.value.set(1.0, 0.68, 0.36);
  shared.uSunTint.value.set(1.05, 0.96, 0.86);
  shared.uSkyGlow.value.set(0.98, 0.62, 0.40);

  const b = new Builder();
  const R = makeRng(20260721);
  const rr = (a, c) => a + R() * (c - a);

  const BOX = new THREE.BoxGeometry(1, 1, 1);
  const CYL = new THREE.CylinderGeometry(1, 1, 1, 10);
  const CYL6 = new THREE.CylinderGeometry(1, 1, 1, 6);
  const CONE = new THREE.ConeGeometry(1, 1, 8);
  const SPH = new THREE.SphereGeometry(1, 9, 7);
  const ICO = new THREE.IcosahedronGeometry(1, 1);
  const TORUS = new THREE.TorusGeometry(1, 0.28, 7, 16);

  // Clean wrappers around Builder.add(geo, m, opts) & Builder.block(geo, m, data)
  const add = (g, t, col, m, o = {}) => b.add(g, m, {
    tag: t, col,
    bleed: o.bleed,
    pat: o.pat,
    ps: o.ps,
    hatch: o.hatch,
    ink: o.noOutline ? false : o.ink,
    hull: o.hull,
    edge: o.edge,
    solid: o.solid === true,
    wall: o.wall,
    water: o.water,
    orb: o.orb,
    sway: o.sway,
  });
  const blk = (x, y, z, sx, sy, sz, data = {}) =>
    b.block(BOX, mat4(x, y, z, data.ry || 0, data.rx || 0, data.rz || 0, [sx, sy, sz]), data);

  const box = (t, col, x, y, z, sx, sy, sz, o = {}) => {
    const m = mat4(x, y, z, o.ry || 0, o.rx || 0, o.rz || 0, [sx, sy, sz]);
    add(BOX, t, col, m, { ...o, solid: false });
    if (o.solid !== false) {
      const c = blk(x, y, z, sx, sy, sz, { wall: o.wall !== false, ry: o.ry || 0, rx: o.rx || 0, rz: o.rz || 0, orb: o.orb, water: o.water });
      if (o.water) c.userData.water = true;
    }
  };
  const cyl = (t, col, x, y, z, r, h, o = {}) => {
    const m = mat4(x, y, z, o.ry || 0, o.rx || 0, o.rz || 0, [r, h, r]);
    add(o.hex ? CYL6 : CYL, t, col, m, { ...o, hull: o.noOutline ? false : (o.hull ?? true), solid: false });
    if (o.solid) blk(x, y, z, r * 2, h, r * 2, { wall: o.wall !== false, orb: o.orb });
  };
  const sph = (t, col, x, y, z, sx, sy, sz, o = {}) => {
    add(SPH, t, col, mat4(x, y, z, o.ry || 0, o.rx || 0, o.rz || 0, [sx, sy, sz]), { ...o, hull: o.noOutline ? false : (o.hull ?? true), solid: false });
  };
  const cone = (t, col, x, y, z, r, h, o = {}) => {
    add(CONE, t, col, mat4(x, y, z, o.ry || 0, o.rx || 0, o.rz || 0, [r, h, r]), { ...o, hull: o.noOutline ? false : (o.hull ?? true), solid: false });
  };

  for (const t of ['more', 'plava', 'zaljev', 'plaza', 'setaliste', 'hills', 'luka']) {
    tag(t).mode = 'one'; tag(t).radius = 125; tag(t).holdRest = 1.8;
  }
  tag('vila').waveDelay = 2.0; tag('palma').waveDelay = 1.8; tag('suncobran').waveDelay = 1.8;

  // ==================== 1. SKY DOME, ADRIATIC SUN & CLOUDS ====================
  const sunPos = V(-62, 54, 138);
  {
    const skyGeo = new THREE.SphereGeometry(260, 24, 14);
    const pa = skyGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) if (pa.getY(i) < -20) pa.setY(i, -20);
    const g = paintGeo(skyGeo, { col: '#84c6ee', bleed: '#f2d8b4', seed: [sunPos.x, sunPos.y, sunPos.z], radius: 360, dur: 5.5, hatch: 0 });
    const m = new THREE.Mesh(g, washMat('sky'));
    m.material.side = THREE.BackSide; m.material.depthWrite = false; m.renderOrder = -2;
    scene.add(m);
  }
  {
    const m = new THREE.Mesh(paintGeo(new THREE.SphereGeometry(11, 16, 12), { col: '#ffe88a', bleed: '#ffbc5c', seed: [sunPos.x, sunPos.y, sunPos.z], radius: 22, dur: 3.5, hatch: 0 }), washMat('sun'));
    m.position.copy(sunPos); addHull(m, 1.5); scene.add(m);
  }
  const clouds = [];
  for (const [cx, cy, cz, sc] of [[-64, 54, 86, 1.3], [12, 58, 98, 1.5], [74, 52, 82, 1.2], [-48, 56, -56, 1.15], [46, 58, -52, 1.2]]) {
    const cg = new THREE.Group(); cg.position.set(cx, cy, cz); scene.add(cg);
    const cm = washMat('sky');
    for (const [dx, dy, dz, r] of [[0, 0, 0, 4.6], [3.8, -0.4, 0.5, 3.4], [-3.6, -0.5, -0.4, 3.2], [1.2, 1.2, -0.3, 3.0]]) {
      const m = new THREE.Mesh(paintGeo(ICO, { col: '#fbf9f4', bleed: '#e2e6ee', seed: [sunPos.x, sunPos.y, sunPos.z], radius: 260, dur: 5.0, hatch: 0 }), cm);
      m.position.set(dx * sc, dy * sc, dz * sc); m.scale.set(r * sc, r * 0.55 * sc, r * 0.7 * sc);
      addHull(m, 1.4); cg.add(m);
    }
    clouds.push({ g: cg, c: V(cx, cy, cz), r: 6.5 * sc, x0: cx, z0: cz, y0: cy, speed: 0.45 + R() * 0.3 });
  }

  // ==================== 2. SUNLIT KARST HILLSIDE & TERRAIN ====================
  const NX = 72, NZ = 72, X0 = -115, X1 = 115, Z0 = -98, Z1 = 112;
  const tGeo = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, NX, NZ);
  tGeo.rotateX(-Math.PI / 2);
  tGeo.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2);
  const posA = tGeo.attributes.position;
  for (let i = 0; i < posA.count; i++) posA.setY(i, neumGroundY(posA.getX(i), posA.getZ(i)));
  tGeo.computeVertexNormals();
  add(tGeo, 'hills', '#c8c49a', new THREE.Matrix4(), { bleed: '#98a674', hatch: 0.35, noOutline: true, solid: false });
  const terrCol = new THREE.Mesh(tGeo, new THREE.MeshBasicMaterial({ visible: false }));
  terrCol.userData.ground = true;
  b.colliders.push(terrCol);

  // ==================== 3. ADRIATIC SEA, BAY, WAVES & DEEP BLUE ====================
  const seaGeo = new THREE.PlaneGeometry(236, 126, 20, 14);
  seaGeo.rotateX(-Math.PI / 2);
  seaGeo.translate(0, SEA_Y, 64);
  add(seaGeo, 'more', '#2ca4bc', new THREE.Matrix4(), { bleed: '#197896', pat: PAT.water, noOutline: true, hatch: 0.1, solid: false });
  const seaCol = blk(0, SEA_Y - 0.12, 66, 224, 0.24, 118, { wall: false, water: true });
  seaCol.userData.water = true;

  const deepGeo = new THREE.CircleGeometry(36, 28);
  deepGeo.rotateX(-Math.PI / 2);
  deepGeo.scale(2.35, 1, 0.62);
  deepGeo.translate(6, SEA_Y + 0.04, 58);
  add(deepGeo, 'plava', '#1b64b8', new THREE.Matrix4(), { bleed: '#12468a', pat: PAT.water, noOutline: true, hatch: 0.08, solid: false });

  // White-crested gentle Adriatic waves lapping the beach ('talas')
  for (let i = 0; i < 11; i++) {
    const wx = -38 + i * 7.6, wz = 22.8 + (i % 2) * 1.3;
    sph('talas', '#f2fafc', wx, 0.12, wz, 2.8, 0.18, 0.72, { bleed: '#b8e0ec', noOutline: true });
    sph('talas', '#d8f0f7', wx + 1.4, 0.09, wz + 2.2, 2.4, 0.14, 0.62, { bleed: '#98d0e4', noOutline: true });
  }

  // Sheltered Klek peninsula & enclosing bay headlands ('zaljev')
  const klekPts = [
    [-98, 86, 26, 12, 16], [-62, 102, 34, 15, 18], [-18, 110, 42, 17, 16],
    [28, 108, 40, 16, 16], [74, 96, 32, 14, 18], [102, 76, 24, 13, 18],
    [-100, 42, 18, 14, 24], [102, 40, 18, 13, 22],
  ];
  for (const [kx, kz, rx, ry, rz] of klekPts) {
    sph('zaljev', '#7c9a68', kx, 0.5, kz, rx, ry, rz, { bleed: '#5a784a', hatch: 0.35 });
    sph('zaljev', '#d8d0b8', kx, 0.2, kz - rz * 0.45, rx * 0.65, ry * 0.32, rz * 0.35, { bleed: '#b5ab92', noOutline: true });
  }

  // Offshore rocky pine-crowned island ('ostrvo') at (58, 0, 58)
  sph('ostrvo', '#d8d0ba', 58, 0.2, 58, 12.5, 4.2, 10.5, { bleed: '#b5ab94' });
  sph('ostrvo', '#84a266', 58, 2.4, 58, 10.2, 3.6, 8.6, { bleed: '#5e7e46' });
  for (const [dx, dz, h] of [[-3.2, -1.8, 5.4], [1.5, -2.5, 6.2], [3.8, 1.2, 4.8], [-1.5, 2.6, 5.0]]) {
    cyl('ostrvo', '#6a4c32', 58 + dx, 4.6, 58 + dz, 0.24, 2.0);
    cone('ostrvo', '#3b6a42', 58 + dx, 4.8 + h * 0.5, 58 + dz, 1.05, h, { bleed: '#284c2e' });
  }
  blk(58, 2.5, 58, 18, 5, 15, { wall: true });

  // Pale coastal limestone sea cliff & crag ('hrid') at (72, 0, 26)
  sph('hrid', '#e6dfd0', 72, 2.2, 26, 6.8, 6.4, 5.6, { bleed: '#bfb6a2' });
  sph('hrid', '#dcd4c2', 76.5, 1.4, 28.5, 4.5, 4.2, 4.4, { bleed: '#b4ab96' });
  sph('hrid', '#ede7da', 68.5, 1.0, 24.5, 3.6, 3.2, 3.8, { bleed: '#c8bfaa' });
  blk(72, 3.2, 26, 12, 6.4, 10, { wall: true });

  // ==================== 4. MARINE REEF PROPS ====================
  sph('props', '#cfc8b8', 54, 0.1, 22, 2.4, 0.52, 2.1, { bleed: '#a8a090', noOutline: true });
  sph('props', '#d4cdb8', 47, 0.2, 22, 2.8, 0.65, 2.2, { bleed: '#aea692', noOutline: true });
  sph('props', '#c6bfb0', 64, -0.05, 32, 2.5, 0.45, 2.2, { bleed: '#9c9586', noOutline: true });

  // Fluted seashells ('skoljka') at (38, 0.24, 21.5)
  for (const [dx, dz, ry, col] of [[0, 0, 0.2, '#f4c8be'], [0.65, 0.35, 1.1, '#f8e6d2'], [-0.6, 0.4, -0.7, '#e8b4c4'], [0.25, -0.5, 2.1, '#f2d4b8'], [-0.5, -0.4, 0.8, '#e8c4be']]) {
    sph('skoljka', col, 38 + dx, 0.24, 21.5 + dz, 0.26, 0.14, 0.30, { ry, bleed: '#c8988e' });
    sph('skoljka', '#fff6ec', 38 + dx, 0.31, 21.5 + dz, 0.14, 0.08, 0.16, { ry, noOutline: true });
  }

  // Spiny sea urchins ('jezic') at (58, 0.18, 26)
  for (const [dx, dz, sc] of [[0, 0, 1.0], [0.75, 0.4, 0.85], [-0.7, 0.35, 0.9], [0.3, -0.65, 0.8]]) {
    const ux = 58 + dx, uz = 26 + dz;
    sph('jezic', '#362244', ux, 0.18, uz, 0.22 * sc, 0.16 * sc, 0.22 * sc, { bleed: '#1e1028' });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      cone('jezic', '#2a1836', ux + Math.cos(a) * 0.18 * sc, 0.24, uz + Math.sin(a) * 0.18 * sc, 0.03 * sc, 0.22 * sc, { rz: -Math.cos(a) * 0.9, rx: Math.sin(a) * 0.9 });
    }
  }

  // Diving mask & snorkel ('maska') at (46, 0.86, 22)
  box('maska', '#2482c4', 46, 0.92, 22, 0.44, 0.22, 0.18, { bleed: '#185c8c', solid: false });
  box('maska', '#bde8f5', 46, 0.92, 22.08, 0.34, 0.14, 0.04, { noOutline: true, solid: false });
  cyl('maska', '#f2b82a', 46.28, 1.18, 21.95, 0.032, 0.56, { rz: -0.22 });

  // Yellow swim fins ('peraje') at (48, 0.86, 22)
  for (const [dx, ry] of [[-0.22, 0.18], [0.22, -0.15]]) {
    box('peraje', '#f2b82a', 48 + dx, 0.88, 22, 0.28, 0.05, 0.72, { ry, bleed: '#c28c18', solid: false });
    box('peraje', '#283440', 48 + dx, 0.94, 21.74, 0.20, 0.12, 0.24, { ry, solid: false });
  }

  // ==================== 5. MAIN NEUM BEACH, SAND, PEBBLES & BEACH PROPS ====================
  const beachGeo = new THREE.PlaneGeometry(88, 18.5, 22, 6);
  beachGeo.rotateX(-Math.PI / 2);
  beachGeo.translate(1, 0, 13.25);
  const bPos = beachGeo.attributes.position;
  for (let i = 0; i < bPos.count; i++) bPos.setY(i, neumGroundY(bPos.getX(i), bPos.getZ(i)) + 0.06);
  beachGeo.computeVertexNormals();
  add(beachGeo, 'plaza', '#efe2c2', new THREE.Matrix4(), { bleed: '#d6c49e', noOutline: true, hatch: 0.2, solid: false });

  const sandGeo = new THREE.PlaneGeometry(22, 8.2, 8, 4);
  sandGeo.rotateX(-Math.PI / 2);
  sandGeo.translate(-3, 0, 17.2);
  const sPos = sandGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) sPos.setY(i, neumGroundY(sPos.getX(i), sPos.getZ(i)) + 0.11);
  sandGeo.computeVertexNormals();
  add(sandGeo, 'pijesak', '#e8c474', new THREE.Matrix4(), { bleed: '#cca452', noOutline: true, hatch: 0.18, solid: false });

  for (let i = 0; i < 34; i++) {
    const px = 12.5 + (i % 11) * 1.9 + (R() - 0.5) * 0.7;
    const pz = 12.5 + Math.floor(i / 11) * 2.4 + (R() - 0.5) * 0.8;
    const py = neumGroundY(px, pz) + 0.12;
    const col = ['#f4f0e6', '#e6dfd2', '#d8d2c6', '#ece6da'][i % 4];
    sph('sljunak', col, px, py, pz, rr(0.32, 0.56), rr(0.11, 0.18), rr(0.28, 0.48), { ry: rr(0, 3), bleed: '#c2bab0', noOutline: true });
  }

  // Striped beach umbrellas ('suncobran') — crisp bold canopies visible from ground and air
  const UMB_COLS = ['#d94234', '#2874b8', '#e6a622', '#26948c', '#d85c7a', '#3a8a52', '#e07228', '#3c5ea8'];
  const UMB_POS = [[-34, 10.2], [-22, 10.2], [-11, 11.4], [-2, 10.0], [8.5, 13.6], [16.5, 10.6], [-28, 15.2], [2.5, 15.2]];
  for (let i = 0; i < UMB_POS.length; i++) {
    const [ux, uz] = UMB_POS[i], uy = neumGroundY(ux, uz) + 0.08;
    const c1 = UMB_COLS[i % UMB_COLS.length];
    cyl('suncobran', '#d8d2c6', ux, uy + 1.25, uz, 0.055, 2.5, { solid: true });
    cone('suncobran', c1, ux, uy + 2.56, uz, 1.72, 0.68, { bleed: '#8a3026', edge: 18 });
    cyl('suncobran', '#faf6ec', ux, uy + 2.24, uz, 1.74, 0.08, { bleed: '#dcd6c8' });
    sph('suncobran', '#faf6ec', ux, uy + 2.94, uz, 0.14, 0.14, 0.14);
    blk(ux, uy + 2.52, uz, 3.1, 0.55, 3.1, { wall: true });
  }

  // Beach towels ('peskir')
  const TOWELS = [
    [-34, 12.2, '#e05844'], [-28, 16.5, '#2b82b8'], [-11, 13.0, '#e8b030'],
    [8.5, 13.6, '#2e9c88'], [6.5, 12.2, '#d86488'], [2.5, 16.8, '#4a7cc2'],
  ];
  for (const [tx, tz, col] of TOWELS) {
    const ty = neumGroundY(tx, tz) + 0.12;
    box('peskir', col, tx, ty, tz, 1.15, 0.05, 2.05, { bleed: '#8a4838', solid: false });
    box('peskir', '#faf6ee', tx, ty + 0.012, tz - 0.55, 1.15, 0.04, 0.22, { noOutline: true, solid: false });
    box('peskir', '#faf6ee', tx, ty + 0.012, tz + 0.55, 1.15, 0.04, 0.22, { noOutline: true, solid: false });
  }

  // Sun loungers ('lezaljka')
  for (const [lx, lz] of [[-24, 9.8], [-20, 9.8], [-18, 12.8], [-3.5, 10.2], [0.5, 10.2]]) {
    const ly = neumGroundY(lx, lz) + 0.08;
    box('lezaljka', '#b8864e', lx, ly + 0.28, lz, 0.82, 0.08, 1.95, { bleed: '#8a6034', solid: true });
    box('lezaljka', '#faf6ee', lx, ly + 0.34, lz + 0.15, 0.68, 0.06, 1.25, { solid: false });
    box('lezaljka', '#faf6ee', lx, ly + 0.58, lz - 0.62, 0.68, 0.06, 0.72, { rx: 0.58, solid: false });
    for (const dx of [-0.34, 0.34]) for (const dz of [-0.75, 0.75]) cyl('lezaljka', '#8a6034', lx + dx, ly + 0.14, lz + dz, 0.035, 0.28);
  }

  // Sandcastle ('dvorac') + beach spade ('lopatica')
  {
    const cx = -4, cz = 17.5, cy = neumGroundY(cx, cz) + 0.1;
    box('dvorac', '#e2be70', cx, cy + 0.35, cz, 1.65, 0.7, 1.65, { bleed: '#ba9648', solid: true });
    box('dvorac', '#e8c87e', cx, cy + 0.85, cz, 0.92, 0.6, 0.92, { bleed: '#c09c50', solid: false });
    cone('dvorac', '#d4a64e', cx, cy + 1.38, cz, 0.55, 0.52);
    for (const sx of [-0.78, 0.78]) for (const sz of [-0.78, 0.78]) {
      cyl('dvorac', '#e4c274', cx + sx, cy + 0.55, cz + sz, 0.28, 1.1, { bleed: '#bc984a' });
      cone('dvorac', '#d4a64e', cx + sx, cy + 1.28, cz + sz, 0.32, 0.38);
    }
    const lx = -1.9, lz = 17.8, ly = neumGroundY(lx, lz) + 0.1;
    cyl('lopatica', '#e8c230', lx + 0.55, ly + 0.22, lz, 0.22, 0.42, { bleed: '#ba981e' });
    cyl('lopatica', '#e04234', lx, ly + 0.36, lz, 0.035, 0.62, { rz: -0.32 });
    box('lopatica', '#e04234', lx - 0.12, ly + 0.09, lz, 0.24, 0.05, 0.32, { rz: -0.32, bleed: '#aa2c22', solid: false });
  }

  // Air mattress ('dusek') + swim rings ('kolut')
  {
    const mx = -16, mz = 26;
    box('dusek', '#f26844', mx, 0.14, mz, 1.05, 0.18, 2.05, { ry: 0.22, bleed: '#c44a2a', solid: false });
    box('dusek', '#faf6ec', mx, 0.18, mz, 0.36, 0.14, 2.02, { ry: 0.22, noOutline: true, solid: false });
    sph('dusek', '#f26844', mx - 0.18, 0.26, mz - 0.82, 0.48, 0.16, 0.24, { ry: 0.22 });
  }
  add(TORUS, 'kolut', '#f29828', mat4(-6, 0.18, 25, 0, Math.PI / 2, 0, [0.58, 0.58, 0.58]), { bleed: '#c47218', hull: true });
  add(TORUS, 'kolut', '#3498d8', mat4(-4.5, 0.16, 26.2, 0.4, Math.PI / 2, 0, [0.46, 0.46, 0.46]), { bleed: '#206ea2', hull: true });

  // Flip-flops ('papuce')
  {
    const px = 7.45, pz = 12.2, py = neumGroundY(px, pz) + 0.12;
    for (const [dx, ry] of [[-0.16, 0.15], [0.16, -0.18]]) {
      box('papuce', '#28a6b4', px + dx, py + 0.03, pz, 0.18, 0.04, 0.42, { ry, bleed: '#1c7a86', solid: false });
      box('papuce', '#f2b828', px + dx, py + 0.08, pz + 0.04, 0.16, 0.04, 0.12, { ry, solid: false });
    }
  }

  // Straw sun hat on side stool ('sesir')
  {
    const sx = -18.2, sz = 10.4, sy = neumGroundY(sx, sz) + 0.1;
    box('props', '#b8864e', sx, sy + 0.25, sz, 0.56, 0.5, 0.56, { solid: true });
    cyl('sesir', '#e6c884', sx, sy + 0.54, sz, 0.42, 0.04, { bleed: '#c2a260' });
    cyl('sesir', '#e6c884', sx, sy + 0.68, sz, 0.20, 0.24, { bleed: '#c2a260' });
    cyl('sesir', '#cc3c32', sx, sy + 0.59, sz, 0.215, 0.06);
  }

  // Open summer book ('knjiga')
  {
    const bx = -9.6, bz = 12.0, by = neumGroundY(bx, bz) + 0.14;
    box('knjiga', '#2a78aa', bx, by + 0.03, bz, 0.62, 0.04, 0.42, { ry: 0.35, bleed: '#1c567c', solid: false });
    box('knjiga', '#fbf6ea', bx - 0.14, by + 0.07, bz, 0.26, 0.04, 0.36, { ry: 0.35, rz: 0.12, solid: false });
    box('knjiga', '#fbf6ea', bx + 0.14, by + 0.07, bz, 0.26, 0.04, 0.36, { ry: 0.35, rz: -0.12, solid: false });
  }

  // ==================== 6. LIFEGUARD TOWER, SHOWER, VOLLEYBALL & PEDAL BOAT ====================
  {
    const tx = 28, tz = 9.5, ty = neumGroundY(tx, tz);
    for (const dx of [-1.05, 1.05]) for (const dz of [-1.05, 1.05]) cyl('spasilac', '#9e7444', tx + dx, ty + 1.4, tz + dz, 0.09, 2.8);
    box('spasilac', '#c4965a', tx, ty + 2.7, tz, 2.5, 0.18, 2.5, { bleed: '#98703c', solid: true });
    for (const dz of [-1.15, 1.15]) box('spasilac', '#f4f0e4', tx, ty + 3.45, tz + dz, 2.4, 0.10, 0.08, { solid: false });
    for (const dx of [-1.15, 1.15]) box('spasilac', '#f4f0e4', tx + dx, ty + 3.45, tz, 0.08, 0.10, 2.4, { solid: false });
    for (const dx of [-1.05, 1.05]) for (const dz of [-1.05, 1.05]) cyl('spasilac', '#f4f0e4', tx + dx, ty + 3.85, tz + dz, 0.06, 2.1);
    box('spasilac', '#d94234', tx, ty + 4.95, tz, 2.7, 0.14, 2.7, { rx: 0.08, bleed: '#a22a20', solid: true });
    for (const dx of [-0.35, 0.35]) cyl('spasilac', '#9e7444', tx + dx, ty + 1.35, tz - 1.25, 0.04, 2.7);
    for (let r = 0; r < 6; r++) box('spasilac', '#9e7444', tx, ty + 0.4 + r * 0.42, tz - 1.25, 0.72, 0.06, 0.06, { solid: false });
    blk(tx, ty + 1.4, tz, 2.4, 2.8, 2.4, { wall: true });
    add(TORUS, 'pojas', '#e03c2e', mat4(tx + 0.9, ty + 2.35, tz + 1.25, 0, 0, 0, [0.42, 0.42, 0.42]), { bleed: '#aa261c', hull: true });
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2;
      box('pojas', '#faf6ec', tx + 0.9 + Math.cos(a) * 0.42, ty + 2.35 + Math.sin(a) * 0.42, tz + 1.26, 0.16, 0.16, 0.24, { solid: false });
    }
  }

  // Beach shower ('tus')
  {
    const sx = 22, sz = 4.5, sy = neumGroundY(sx, sz);
    box('tus', '#b48a56', sx, sy + 0.06, sz, 1.35, 0.12, 1.35, { solid: true });
    cyl('tus', '#b8c4cc', sx, sy + 1.35, sz - 0.45, 0.065, 2.6, { solid: true });
    cyl('tus', '#b8c4cc', sx, sy + 2.6, sz - 0.15, 0.055, 0.65, { rx: Math.PI / 2 });
    cone('tus', '#8c9aa4', sx, sy + 2.48, sz + 0.12, 0.18, 0.16);
    for (let k = 0; k < 5; k++) sph('tus', '#bfeaf5', sx + (k - 2) * 0.06, sy + 1.9 - (k % 3) * 0.38, sz + 0.12, 0.035, 0.09, 0.035, { noOutline: true });
  }

  // Beach volleyball ('odbojka')
  {
    const vx = 24, vz = 16, vy = neumGroundY(vx, vz) + 0.08;
    cyl('odbojka', '#e8e4da', vx, vy + 1.35, vz - 3.6, 0.07, 2.7, { solid: true });
    cyl('odbojka', '#e8e4da', vx, vy + 1.35, vz + 3.6, 0.07, 2.7, { solid: true });
    box('odbojka', '#faf6ec', vx, vy + 2.48, vz, 0.06, 0.14, 7.2, { solid: false });
    box('odbojka', '#d4e2ea', vx, vy + 1.98, vz, 0.04, 0.88, 7.1, { solid: false });
    box('odbojka', '#f2ece0', vx, vy + 0.03, vz - 3.8, 10.4, 0.03, 0.12, { solid: false });
    box('odbojka', '#f2ece0', vx, vy + 0.03, vz + 3.8, 10.4, 0.03, 0.12, { solid: false });
    box('odbojka', '#f2ece0', vx - 5.2, vy + 0.03, vz, 0.12, 0.03, 7.6, { solid: false });
    box('odbojka', '#f2ece0', vx + 5.2, vy + 0.03, vz, 0.12, 0.03, 7.6, { solid: false });
    sph('odbojka', '#faf6ec', vx - 0.35, vy + 2.95, vz - 0.2, 0.24, 0.24, 0.24, { bleed: '#e2a830' });
  }

  // Pedal boat ('pedolina')
  {
    const px = 26, pz = 32;
    for (const dx of [-0.72, 0.72]) box('pedolina', '#f2c228', px + dx, 0.22, pz, 0.56, 0.38, 3.3, { bleed: '#c89818', solid: true });
    box('pedolina', '#f2c228', px, 0.38, pz, 1.9, 0.16, 2.8, { bleed: '#c89818', solid: true });
    box('pedolina', '#faf6ec', px, 0.62, pz - 0.55, 1.35, 0.36, 0.45, { solid: false });
    box('pedolina', '#2b82c4', px, 1.15, pz + 0.72, 0.68, 0.1, 1.85, { rx: 0.45, bleed: '#1c5a8c', solid: false });
    for (const dx of [-0.32, 0.32]) cyl('pedolina', '#d8e0e6', px + dx, 0.92, pz + 0.12, 0.04, 1.1);
  }

  // ==================== 7. HARBOUR, PIER, BOATS & LIGHTHOUSE ====================
  box('luka', '#ddd5c2', -64, 1.3, 2.0, 44, 2.6, 12, { bleed: '#b8af9a', pat: PAT.cobble });
  box('luka', '#cbc3b0', -84, 1.3, 20, 7, 2.6, 28, { bleed: '#a69d8a' });
  for (let i = 0; i < 4; i++) cyl('luka', '#3c4248', -81, 2.88, 10 + i * 7, 0.22, 0.56, { solid: true });

  box('mol', '#e2dac8', -58, 1.25, 34, 7.6, 2.5, 58, { bleed: '#beb6a2', pat: PAT.cobble });
  box('mol', '#a67b4b', -58, 2.54, 32, 4.4, 0.10, 50, { bleed: '#7e5a34', pat: PAT.planks, ps: 2.5, solid: false });
  for (let z = 12; z <= 54; z += 7) {
    cyl('mol', '#705032', -54.0, 1.65, z, 0.20, 3.6, { solid: true });
    cyl('mol', '#705032', -62.0, 1.65, z, 0.20, 3.6, { solid: true });
  }
  add(TORUS, 'pojas', '#e03c2e', mat4(-54.0, 2.9, 32, 0, Math.PI / 2, 0, [0.38, 0.38, 0.38]), { bleed: '#aa261c', hull: true });

  // Heavy anchor ('sidro')
  {
    const ax = -55.4, az = 22, ay = 2.6;
    cyl('sidro', '#3c444c', ax, ay + 0.95, az, 0.09, 1.85, { rz: 0.15, solid: true });
    cyl('sidro', '#3c444c', ax - 0.1, ay + 1.55, az, 0.06, 0.92, { rx: Math.PI / 2 });
    add(TORUS, 'sidro', '#3c444c', mat4(ax - 0.14, ay + 1.92, az, 0, Math.PI / 2, 0, [0.22, 0.22, 0.22]), { hull: true });
    box('sidro', '#3c444c', ax + 0.12, ay + 0.36, az, 0.14, 0.16, 1.35, { rx: 0.1, bleed: '#242a30', solid: false });
    cone('sidro', '#3c444c', ax + 0.12, ay + 0.62, az + 0.68, 0.18, 0.36, { rx: 0.45 });
    cone('sidro', '#3c444c', ax + 0.12, ay + 0.62, az - 0.68, 0.18, 0.36, { rx: -0.45 });
  }

  // Coiled rope ('konopac')
  {
    const kx = -55.2, kz = 14, ky = 2.6;
    cyl('props', '#343a40', kx, ky + 0.32, kz, 0.22, 0.64, { solid: true });
    for (let r = 0; r < 4; r++) {
      add(TORUS, 'konopac', '#caa464', mat4(kx, ky + 0.12 + r * 0.11, kz, 0, Math.PI / 2, 0, [0.34 + (r === 0 ? 0.18 : 0), 0.34 + (r === 0 ? 0.18 : 0), 0.36]), { bleed: '#9c7a40', hull: true });
    }
    add(TORUS, 'konopac', '#caa464', mat4(kx - 0.85, ky + 0.10, kz + 0.45, 0, Math.PI / 2, 0, [0.45, 0.45, 0.32]), { bleed: '#9c7a40', hull: true });
  }

  // Swim-zone buoys ('bova')
  for (let i = 0; i < 8; i++) {
    const bx = -30 + i * 9.5, bz = 36 + Math.sin(i * 0.8) * 1.6;
    sph('bova', i % 2 ? '#faf6ec' : '#e03e30', bx, 0.18, bz, 0.38, 0.34, 0.38, { bleed: '#a82a1e' });
    cyl('bova', '#e03e30', bx, 0.56, bz, 0.04, 0.45);
  }

  // Motor yacht ('jahta')
  {
    const yx = -47, yz = 24;
    box('jahta', '#faf8f2', yx, 0.65, yz, 3.2, 1.3, 8.8, { bleed: '#d6d2c8', solid: true });
    cone('jahta', '#faf8f2', yx, 0.65, yz + 5.6, 1.6, 2.5, { rx: Math.PI / 2 });
    box('jahta', '#1e5494', yx, 0.72, yz + 0.2, 3.28, 0.22, 8.6, { noOutline: true, solid: false });
    box('jahta', '#f4f0e8', yx, 1.72, yz - 0.8, 2.4, 1.05, 4.4, { bleed: '#ccc8bc', solid: true });
    box('jahta', '#2b4a6a', yx, 1.82, yz + 1.42, 2.15, 0.58, 0.14, { rx: -0.25, solid: false });
    box('jahta', '#e4d4b4', yx, 1.34, yz + 2.8, 2.4, 0.08, 2.4, { solid: false });
  }

  // Wooden excursion boat ('brod')
  {
    const bx = -72, bz = 18;
    box('brod', '#8c5a34', bx, 0.62, bz, 3.6, 1.25, 9.6, { bleed: '#623c20', solid: true });
    cone('brod', '#8c5a34', bx, 0.62, bz + 6.0, 1.8, 2.6, { rx: Math.PI / 2 });
    box('brod', '#faf4e6', bx, 1.32, bz, 3.2, 0.16, 8.8, { solid: false });
    box('brod', '#c44032', bx, 0.88, bz, 3.68, 0.24, 9.5, { noOutline: true, solid: false });
    for (const dx of [-1.45, 1.45]) for (const dz of [-3.2, 0, 2.4]) cyl('brod', '#faf4e6', bx + dx, 2.35, bz + dz, 0.06, 2.0);
    box('brod', '#2b6ea8', bx, 3.38, bz - 0.4, 3.3, 0.14, 6.2, { bleed: '#1c4d78', solid: true });
    add(TORUS, 'brod', '#6e4626', mat4(bx + 0.5, 2.05, bz + 2.5, 0, 0, 0, [0.34, 0.34, 0.34]), { hull: true });
  }

  // Animated sailboats ('jedrilica' + 'jedro')
  const sailboats = [];
  function buildSailboat(cx, cz, ry, hullCol, orbit) {
    const g = new THREE.Group();
    g.position.set(cx, 0.12, cz);
    g.rotation.y = ry;
    scene.add(g);
    const HP = (geo, col, x, y, z, sx, sy, sz, bleed) => {
      const m = new THREE.Mesh(paintGeo(geo, { col, bleed: bleed || col, seed: [cx, 1.5, cz], radius: 5, delay: 0, dur: 2, hatch: 0.25 }), washMat('jedrilica'));
      m.position.set(x, y, z); m.scale.set(sx, sy, sz); addHull(m, 1.4); g.add(m); return m;
    };
    const SP = (geo, col, x, y, z, sx, sy, sz, bleed) => {
      const m = new THREE.Mesh(paintGeo(geo, { col, bleed: bleed || '#d4d0c4', seed: [cx, 4.0, cz], radius: 6, delay: 0, dur: 2, hatch: 0.15 }), washMat('jedro'));
      m.position.set(x, y, z); m.scale.set(sx, sy, sz); addHull(m, 1.2); g.add(m); return m;
    };
    HP(BOX, hullCol, 0, 0.42, 0, 2.0, 0.84, 5.8, '#c8c4b8');
    const bow = HP(CONE, hullCol, 0, 0.42, 3.85, 1.0, 2.1, '#c8c4b8'); bow.rotation.x = Math.PI / 2;
    HP(BOX, '#b8864e', 0, 0.88, -0.2, 1.75, 0.1, 4.8, '#8a6034');
    HP(CYL, '#d8d4ca', 0, 4.2, 0.4, 0.08, 7.2, '#a8a498');
    HP(CYL, '#d8d4ca', 0, 1.75, -1.2, 0.06, 3.2, '#a8a498').rotation.x = Math.PI / 2;
    const mainGeo = new THREE.BufferGeometry();
    mainGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      0, 1.85, 0.35,   0.18, 1.85, -2.65,   0, 7.45, 0.35,
      0, 1.85, 0.35,   0, 7.45, 0.35,       0.18, 1.85, -2.65,
    ]), 3));
    mainGeo.computeVertexNormals();
    SP(mainGeo, '#fbf8f0', 0, 0, 0, 1, 1, 1, '#dcd6c6');
    const jibGeo = new THREE.BufferGeometry();
    jibGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      0, 1.7, 0.55,    0.12, 1.6, 3.9,      0, 6.6, 0.55,
      0, 1.7, 0.55,    0, 6.6, 0.55,        0.12, 1.6, 3.9,
    ]), 3));
    jibGeo.computeVertexNormals();
    SP(jibGeo, '#f4f0e4', 0, 0, 0, 1, 1, 1, '#d2ccbc');
    const col = blk(cx, 1.5, cz, 2.6, 3.0, 6.8, { wall: true, ry });
    sailboats.push({ g, home: V(cx, 0.12, cz), ry, orbit, collider: col, active: false });
  }
  buildSailboat(-32, 46, 0.65, '#faf8f2', { cx: -24, cz: 54, rx: 14, rz: 10, speed: 0.18 });
  buildSailboat(-10, 72, -0.85, '#f4f2ec', { cx: 4, cz: 74, rx: 18, rz: 11, speed: -0.15 });

  // Tall white-and-red Adriatic stone lighthouse ('svjetionik' — STAGE 2 LAST ORB!)
  let lighthouseBeam = null;
  {
    const lx = -58, lz = 62, ly = 2.45;
    cyl('svjetionik', '#d8d0be', lx, ly + 1.0, lz, 3.4, 2.0, { bleed: '#b4ac9a', solid: true });
    const towerGeo = new THREE.CylinderGeometry(1.7, 2.55, 11.2, 10);
    add(towerGeo, 'svjetionik', '#f8f5ec', mat4(lx, ly + 7.5, lz), { bleed: '#d6d0c2', hull: true });
    blk(lx, ly + 7.5, lz, 4.6, 11.2, 4.6, { wall: true });
    cyl('svjetionik', '#cc3a2e', lx, ly + 13.4, lz, 2.35, 0.52, { bleed: '#98261c', solid: true });
    cyl('svjetionik', '#cc3a2e', lx, ly + 14.35, lz, 2.15, 0.14);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      cyl('svjetionik', '#cc3a2e', lx + Math.cos(a) * 2.1, ly + 13.95, lz + Math.sin(a) * 2.1, 0.06, 0.9);
    }
    cyl('svjetionik', '#fff2b0', lx, ly + 14.95, lz, 1.38, 1.95, { bleed: '#e8c858', solid: true });
    cone('svjetionik', '#cc3a2e', lx, ly + 16.75, lz, 1.65, 1.75, { bleed: '#98261c' });
    sph('svjetionik', '#e8c448', lx, ly + 17.75, lz, 0.25, 0.25, 0.25);
    box('svjetionik', '#5c3c24', lx, ly + 3.0, lz - 2.35, 1.1, 2.1, 0.3, { solid: false });
    for (const wy of [6.5, 10.2]) box('svjetionik', '#32404e', lx + 2.1, ly + wy, lz, 0.28, 0.95, 0.62, { solid: false });
    const beamGroup = new THREE.Group();
    beamGroup.position.set(lx, ly + 15.0, lz);
    const beamGeo = new THREE.ConeGeometry(4.2, 26, 10, 1, true);
    beamGeo.translate(0, -13, 0);
    beamGeo.rotateX(-Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({ color: '#ffe588', transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false });
    const b1 = new THREE.Mesh(beamGeo, beamMat);
    const b2 = new THREE.Mesh(beamGeo, beamMat);
    b2.rotation.y = Math.PI;
    beamGroup.add(b1, b2);
    beamGroup.visible = false;
    scene.add(beamGroup);
    lighthouseBeam = beamGroup;
  }

  // ==================== 8. PROMENADE, HOTEL, POOL, BALCONIES & KONOBA ====================
  box('setaliste', '#eae2d0', -14, PROM_Y - 1.35, -3.0, 122, 2.7, 14.0, { bleed: '#c8bfa8', pat: PAT.cobble });
  box('setaliste', '#dcd4c0', -6, PROM_Y + 0.35, 3.7, 82, 0.72, 0.52, { bleed: '#b8b09a' });
  for (const lx of [-42, -20, 2, 24, 44]) {
    cyl('props', '#34424e', lx, PROM_Y + 1.85, -0.5, 0.08, 3.7, { solid: true });
    sph('props', '#fff2c2', lx, PROM_Y + 3.85, -0.5, 0.24, 0.28, 0.24);
  }

  // Hotel, balconies & terrace swimming pool
  {
    const hx = 6, hz = -21, hy = 5.2;
    box('props', '#e4dcc8', hx, 3.9, -18, 44, 2.6, 20, { bleed: '#c0b8a2' });
    box('hotel', '#f8f4ea', hx, hy + 4.4, hz, 34, 8.8, 12, { bleed: '#dad2c0' });
    box('hotel', '#f4efe4', hx - 12, hy + 6.4, hz - 1.5, 11, 12.8, 9.5, { bleed: '#d4ccb8' });
    box('hotel', '#f4efe4', hx + 12, hy + 5.8, hz - 1.5, 11, 11.6, 9.5, { bleed: '#d4ccb8' });
    add(gableRoof(35.2, 13.0, 2.2), 'hotel', '#c8663e', mat4(hx, hy + 8.8, hz), { bleed: '#964628' });
    add(gableRoof(12.2, 10.4, 2.0), 'hotel', '#c8663e', mat4(hx - 12, hy + 12.8, hz - 1.5), { bleed: '#964628' });
    add(gableRoof(12.2, 10.4, 2.0), 'hotel', '#c8663e', mat4(hx + 12, hy + 11.6, hz - 1.5), { bleed: '#964628' });
    for (const wx of [-12, -6, 0, 6, 12]) for (const wy of [2.4, 5.6]) {
      box('hotel', '#4a7ea4', hx + wx, hy + wy, hz + 6.06, 2.4, 1.8, 0.12, { solid: false });
    }
    for (const bx of [-12, -6, 0, 6, 12]) for (const by of [1.4, 4.6, 7.6]) {
      if (by > 7 && Math.abs(bx) < 9) continue;
      box('balkon', '#f2ece0', hx + bx, hy + by, hz + 6.85, 3.8, 0.22, 1.65, { bleed: '#ccc4b0', solid: true });
      box('balkon', '#2e3e4c', hx + bx, hy + by + 0.55, hz + 7.62, 3.7, 0.10, 0.08, { solid: false });
      for (let p = -1.6; p <= 1.65; p += 0.8) cyl('balkon', '#2e3e4c', hx + bx + p, hy + by + 0.3, hz + 7.62, 0.03, 0.52);
      box('balkon', '#c8663e', hx + bx, hy + by + 0.68, hz + 7.62, 1.1, 0.22, 0.24, { solid: false });
      sph('balkon', '#d84a78', hx + bx, hy + by + 0.86, hz + 7.62, 0.45, 0.16, 0.18, { noOutline: true });
    }
    const px = 6, pz = -11.4, py = 5.22;
    box('bazen', '#f2ece0', px, py + 0.14, pz, 12.6, 0.28, 5.8, { bleed: '#ccc4b2', solid: true });
    box('bazen', '#32c6d8', px, py + 0.24, pz, 11.4, 0.14, 4.6, { bleed: '#1c9ab0', pat: PAT.water, noOutline: true, solid: false });
    for (const dx of [-0.35, 0.35]) cyl('bazen', '#d8e0e6', px + 4.8 + dx, py + 0.58, pz + 2.3, 0.04, 0.72);
  }

  // Seaside konoba ('restoran') + food props
  {
    const rx = -34, rz = -2.2, ry = PROM_Y;
    for (const dx of [-5.8, 0, 5.8]) for (const dz of [-4.2, 4.2]) box('restoran', '#d8d0bc', rx + dx, ry - 1.35, rz + dz, 0.85, 2.7, 0.85, { bleed: '#b4ac98' });
    box('restoran', '#a87d4c', rx, ry + 0.08, rz, 13.4, 0.22, 9.6, { bleed: '#7e5c34', pat: PAT.planks, ps: 2.5 });
    box('restoran', '#f2ead8', rx, ry + 2.1, rz - 4.4, 13.2, 4.0, 0.85, { bleed: '#cfc6b0' });
    box('restoran', '#c8643c', rx, ry + 4.4, rz - 4.4, 13.8, 0.55, 2.2, { rx: 0.15, bleed: '#984426' });
    for (const dx of [-5.8, -1.8, 2.2, 5.8]) cyl('restoran', '#7c5634', rx + dx, ry + 2.1, rz + 4.2, 0.14, 4.0, { solid: true });
    for (let z = -3.6; z <= 4.2; z += 1.3) box('restoran', '#8e643c', rx, ry + 4.15, rz + z, 12.8, 0.14, 0.18, { solid: false });

    const TABLES = [[-36.5, -1.6], [-33.2, -1.6], [-29.8, -1.6], [-34.2, -4.4], [-30.5, -4.4]];
    for (const [tx, tz] of TABLES) {
      cyl('sto', '#6e4a2c', tx, ry + 0.45, tz, 0.09, 0.78);
      box('sto', '#faf6ec', tx, ry + 0.86, tz, 1.55, 0.14, 1.15, { bleed: '#d6d0c0', solid: true });
      box('sto', '#2b6cb0', tx, ry + 0.88, tz, 0.45, 0.14, 1.17, { noOutline: true, solid: false });
      for (const dz of [-0.85, 0.85]) {
        box('props', '#7e5634', tx, ry + 0.5, tz + dz, 0.46, 0.08, 0.46, { solid: false });
        box('props', '#7e5634', tx, ry + 0.78, tz + dz + Math.sign(dz) * 0.2, 0.46, 0.52, 0.07, { solid: false });
      }
    }
    const ty = ry + 0.96;
    for (const [tx, tz] of [[-33.5, -1.5], [-32.9, -1.75], [-36.5, -1.6], [-29.8, -1.6]]) {
      cyl('tanjir', '#faf8f2', tx, ty + 0.02, tz, 0.22, 0.04, { bleed: '#d2cec4' });
      cyl('tanjir', '#2b6cb0', tx, ty + 0.035, tz, 0.16, 0.02, { noOutline: true });
    }
    for (const [dx, dz] of [[0, 0], [0.24, 0.18], [-0.22, 0.22]]) cyl('casa', '#d4f0f8', -32.2 + dx, ty + 0.12, -1.8 + dz, 0.06, 0.22, { bleed: '#98d2e4' });
    cyl('limunada', '#f4dc48', -34.2, ty + 0.20, -4.2, 0.14, 0.38, { bleed: '#d2b420' });
    cyl('limunada', '#f4dc48', -33.82, ty + 0.12, -4.05, 0.065, 0.22, { bleed: '#d2b420' });
    cyl('limunada', '#f8e664', -34.55, ty + 0.12, -4.3, 0.065, 0.22);
    for (const [dx, dz, ry2] of [[-0.18, 0.05, 0.3], [0.16, -0.04, -0.5], [0.02, 0.18, 1.1]]) {
      cone('lubenica', '#e23b3c', -29.8 + dx, ty + 0.13, -1.6 + dz, 0.22, 0.26, { ry: ry2, rz: 0.4, bleed: '#aa2224' });
      box('lubenica', '#2f8a44', -29.8 + dx, ty + 0.04, -1.6 + dz, 0.32, 0.06, 0.10, { ry: ry2, solid: false });
    }
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      add(TORUS, 'lignje', '#e4b868', mat4(-36.5 + Math.cos(a) * 0.14, ty + 0.07, -1.6 + Math.sin(a) * 0.12, 0, Math.PI / 2, 0, [0.08, 0.08, 0.08]), { bleed: '#b8863c', hull: true });
    }
    sph('lignje', '#f4dc44', -36.32, ty + 0.09, -1.46, 0.09, 0.05, 0.07);
    cyl('salata', '#f2ece0', -30.5, ty + 0.09, -4.4, 0.25, 0.16, { bleed: '#c8c0ae' });
    sph('salata', '#56a646', -30.5, ty + 0.18, -4.4, 0.22, 0.10, 0.22, { bleed: '#387a2c' });
    for (const [dx, dz] of [[-0.08, 0.06], [0.09, -0.05], [0.02, 0.09]]) sph('salata', '#de3c32', -30.5 + dx, ty + 0.23, -4.4 + dz, 0.055, 0.05, 0.055);
  }

  // Postcard rack ('razglednica')
  {
    const px = -16, pz = -1.5, py = PROM_Y;
    cyl('razglednica', '#465058', px, py + 0.9, pz, 0.06, 1.8, { solid: true });
    box('razglednica', '#e8e4da', px, py + 1.25, pz, 0.62, 0.92, 0.62, { bleed: '#c4bfb2', solid: true });
    const CARD_COLS = ['#3498cc', '#f2b830', '#e06448', '#48a878', '#8a68c8', '#d86888'];
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2;
      for (let r = 0; r < 2; r++) {
        box('razglednica', CARD_COLS[(k * 2 + r) % CARD_COLS.length], px + Math.sin(a) * 0.34, py + 1.05 + r * 0.42, pz + Math.cos(a) * 0.34, 0.38, 0.28, 0.04, { ry: a, solid: false });
      }
    }
  }

  // ==================== 9. SIX PALMS ('palma') & SIX PLANTERS ('sest') ====================
  const PALM_XS = [-24, -14, -4, 6, 16, 26];
  for (let i = 0; i < PALM_XS.length; i++) {
    const px = PALM_XS[i], pz = 2.4, py = PROM_Y;
    box('sest', '#c86842', px, py + 0.38, pz, 1.35, 0.76, 1.35, { bleed: '#98482a', solid: true });
    box('sest', '#f4ede0', px, py + 0.76, pz, 1.48, 0.14, 1.48, { solid: false });
    const h = 5.2 + (i % 2) * 0.6;
    cyl('palma', '#9c7852', px, py + 0.76 + h * 0.5, pz, 0.22, h, { rz: (i % 2 ? 1 : -1) * 0.05, bleed: '#745638', solid: true });
    const topY = py + 0.76 + h;
    for (let f = 0; f < 6; f++) {
      const ang = (f / 6) * Math.PI * 2 + i * 0.4;
      box('palma', '#4c8e42', px + Math.cos(ang) * 1.15, topY + 0.12, pz + Math.sin(ang) * 1.15, 2.35, 0.10, 0.62, { ry: -ang, rz: -0.26, bleed: '#32682c', solid: false });
    }
  }

  // ==================== 10. HILLSIDE VILLAS, OLIVES, FIGS, CYPRESSES & NATURE ====================
  for (let step = 0; step < 11; step++) {
    const uz = -13 - step * 2.8, uy = neumGroundY(-18, uz);
    box('ulica', '#ece4d2', -18, uy + 0.12, uz, 4.2, 0.32, 3.0, { bleed: '#c8bfa8', pat: PAT.cobble });
    box('ulica', '#f6f2e8', -20.4, uy + 0.65, uz, 0.42, 1.1, 2.9, { bleed: '#d6d0c0' });
    box('ulica', '#f6f2e8', -15.6, uy + 0.65, uz, 0.42, 1.1, 2.9, { bleed: '#d6d0c0' });
  }

  const VILLAS = [
    [-44, -26, 9.5, 6.2, 7.6, 0.15], [-32, -46, 10.2, 6.6, 8.0, -0.1],
    [-8, -48, 11.0, 6.8, 8.4, 0.08], [18, -46, 10.4, 6.4, 7.8, -0.14],
    [42, -38, 9.6, 6.0, 7.4, 0.2], [-16, -68, 11.4, 7.2, 8.6, 0.05],
    [24, -66, 10.8, 6.8, 8.2, -0.08],
  ];
  for (const [vx, vz, w, h, d, ry] of VILLAS) {
    const vy = neumGroundY(vx, vz) - 1.2;
    box('vila', '#f8f4ea', vx, vy + h / 2, vz, w, h, d, { ry, bleed: '#dad2be' });
    add(gableRoof(w + 0.9, d + 0.9, 2.1), 'vila', '#c6623a', mat4(vx, vy + h, vz, ry), { bleed: '#944424' });
    for (const sx of [-w * 0.26, w * 0.26]) {
      const wx = vx + Math.cos(ry) * sx + Math.sin(ry) * (d / 2 + 0.08);
      const wz = vz - Math.sin(ry) * sx + Math.cos(ry) * (d / 2 + 0.08);
      box('vila', '#3c7a52', wx, vy + h * 0.65, wz, 1.45, 1.35, 0.14, { ry, solid: false });
      box('vila', '#4a7896', wx, vy + h * 0.65, wz + 0.04, 0.85, 1.15, 0.14, { ry, solid: false });
    }
  }

  for (const [ox, oz] of [[-48, -16], [-36, -34], [-54, -38], [-28, -28], [-44, -54], [-58, -24], [34, -48], [52, -34]]) {
    const oy = neumGroundY(ox, oz);
    cyl('maslina', '#786652', ox, oy + 1.35, oz, 0.34, 2.7, { rz: 0.14, bleed: '#544636', solid: true });
    sph('maslina', '#8fa684', ox, oy + 3.4, oz, 2.35, 1.65, 2.15, { bleed: '#6a8262' });
    sph('maslina', '#a2b896', ox + 0.9, oy + 3.8, oz - 0.5, 1.45, 1.15, 1.4, { bleed: '#7c9472', noOutline: true });
  }

  // Fig tree ('smokva')
  {
    const fx = 34, fz = -26, fy = neumGroundY(fx, fz);
    cyl('smokva', '#8a7e72', fx, fy + 1.4, fz, 0.36, 2.8, { bleed: '#645a50', solid: true });
    sph('smokva', '#4a883c', fx, fy + 3.6, fz, 2.8, 2.0, 2.6, { bleed: '#306226' });
    sph('smokva', '#5a9a48', fx - 1.1, fy + 3.2, fz + 0.9, 1.7, 1.3, 1.6, { noOutline: true });
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      sph('smokva', '#6a2e6c', fx + Math.cos(a) * 2.1, fy + 2.8 + (k % 2) * 0.7, fz + Math.sin(a) * 1.9, 0.20, 0.26, 0.20, { bleed: '#441a46' });
    }
  }

  for (const [cx, cz, h] of [
    [-58, -16, 7.5], [-40, -22, 8.2], [-24, -40, 8.8], [-22, -44, 7.6],
    [10, -40, 8.6], [28, -42, 8.2], [46, -26, 7.8], [56, -24, 8.4],
    [-36, -64, 9.0], [4, -66, 9.2], [38, -58, 8.5],
  ]) {
    const cy = neumGroundY(cx, cz);
    cyl('cempres', '#624830', cx, cy + 0.8, cz, 0.22, 1.6, { solid: true });
    cone('cempres', '#2e5c36', cx, cy + 1.4 + h * 0.5, cz, 1.05, h, { bleed: '#1d4024' });
  }

  for (let i = 0; i < 8; i++) {
    const lx = 8 + i * 1.85, lz = -35.5 + (i % 2) * 1.4, ly = neumGroundY(lx, lz);
    sph('lavanda', '#6a8a5e', lx, ly + 0.35, lz, 0.72, 0.42, 0.68, { bleed: '#4a6840' });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      cyl('lavanda', '#8a58c2', lx + Math.cos(a) * 0.36, ly + 0.76, lz + Math.sin(a) * 0.34, 0.08, 0.55, { bleed: '#66389c' });
    }
  }

  {
    const nx = -25, nz = -34, ny = neumGroundY(nx, nz);
    cyl('nar', '#6c5036', nx, ny + 0.9, nz, 0.18, 1.8, { solid: true });
    sph('nar', '#4c8840', nx, ny + 2.2, nz, 1.9, 1.45, 1.8, { bleed: '#326028' });
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      sph('nar', '#cc2e36', nx + Math.cos(a) * 1.45, ny + 1.95 + (k % 3) * 0.35, nz + Math.sin(a) * 1.38, 0.22, 0.22, 0.22, { bleed: '#961c22' });
    }
  }

  {
    const kx = 52, kz = -16, ky = neumGroundY(kx, kz);
    sph('props', '#dcd4c2', kx, ky + 0.2, kz, 2.2, 0.65, 1.9, { bleed: '#b4ac98', noOutline: true });
    for (const [dx, dy, dz, rx, rz, sc] of [
      [0, 1.0, 0, 0, 0.08, 1.0], [0.62, 1.65, 0.1, 0.1, -0.32, 0.82],
      [-0.58, 1.55, -0.1, -0.1, 0.35, 0.78], [0.08, 2.15, 0.12, 0.15, 0.1, 0.68],
      [-0.95, 1.15, 0.45, 0.2, 0.25, 0.72],
    ]) {
      sph('kaktus', '#548c44', kx + dx, ky + dy, kz + dz, 0.48 * sc, 0.62 * sc, 0.18 * sc, { rx, rz, bleed: '#38662c' });
    }
    sph('kaktus', '#f4d034', kx + 0.08, ky + 2.62, kz + 0.12, 0.16, 0.14, 0.16);
    sph('kaktus', '#f4d034', kx + 0.68, ky + 2.16, kz + 0.1, 0.14, 0.12, 0.14);
  }

  box('props', '#e4dcc8', 44, PROM_Y + 0.65, -8, 6.4, 1.3, 0.9, { bleed: '#bfb7a2' });

  // ==================== 11. PEOPLE & ADRIATIC WILDLIFE ====================
  const people = [
    { kind: 'neuSunbathe', tag: 'suncati', x: -24, y: neumGroundY(-24, 9.8) + 0.38, z: 9.8, ry: 0, woman: true, scarfChoice: 'no', top: '#e05844', bottom: '#e05844', sport: true },
    { kind: 'neuSunbathe', tag: 'suncati', x: -20, y: neumGroundY(-20, 9.8) + 0.38, z: 9.8, ry: 0, trunks: true, top: '#e4b898', bottom: '#2864a8', sport: true },
    { kind: 'neuNap', tag: 'spavati', x: 8.5, y: neumGroundY(8.5, 13.6) + 0.18, z: 13.6, ry: 0.15, trunks: true, top: '#e2b290', bottom: '#2b8a78', sport: true },
    { kind: 'neuRead', tag: 'citati', x: -11.0, y: neumGroundY(-11, 12.6) + 0.12, z: 12.6, ry: 0.2, woman: true, scarfChoice: 'no', top: '#f2c248', bottom: '#2e689c', sport: true, bookTag: 'knjiga', sunHatTag: 'sesir' },
    { kind: 'neuFan', tag: 'vruce', x: 16.2, y: neumGroundY(16.2, 11.4) + 0.08, z: 11.4, ry: 0.3, top: '#faf6ec', bottom: '#4a7ca8', sport: true },
    { kind: 'neuSnorkel', tag: 'roniti', x: 42, y: 0.16, z: 29, ry: 0.8, trunks: true, top: '#d8a482', bottom: '#2460a2', sport: true, maskTag: 'maska', finTag: 'peraje', orbit: { cx: 43, cz: 30, rx: 3.2, rz: 2.2, speed: 0.24 } },
    { kind: 'neuLifeguard', tag: 'spasilac', x: 28, y: neumGroundY(28, 9.5) + 2.82, z: 9.5, ry: 0.1, top: '#e24034', bottom: '#1e3c68', sport: true },
    { kind: 'neuVolley', tag: 'skakati', x: 22.2, y: neumGroundY(22.2, 16) + 0.08, z: 16, ry: Math.PI / 2, jump: true, top: '#f2b828', bottom: '#264a78', sport: true },
    { kind: 'neuVolley', tag: 'odbojka', x: 25.8, y: neumGroundY(25.8, 16) + 0.08, z: 16, ry: -Math.PI / 2, woman: true, scarfChoice: 'no', top: '#2ca49c', bottom: '#264a78', sport: true },
    { kind: 'neuSailor', tag: 'jedriti', x: -32.6, y: 0.98, z: 45.2, ry: 0.65, top: '#faf8f2', bottom: '#224472', sport: true },
    { kind: 'neuCaptain', tag: 'kapetan', x: -71.2, y: 1.42, z: 19.6, ry: 0.4, top: '#faf8f2', bottom: '#1e3554', capCap: true },
    { kind: 'neuDine', tag: 'passerby', x: -33.2, y: PROM_Y + 0.08, z: -0.75, ry: Math.PI, woman: true, scarfChoice: 'no', top: '#e26a5a', bottom: '#2e5478' },
    { kind: 'neuDine', tag: 'passerby', x: -30.5, y: PROM_Y + 0.08, z: -3.55, ry: Math.PI, top: '#3a78a8', bottom: '#d8cfb8' },
    { kind: 'walk', tag: 'passerby', x: -24, y: PROM_Y, z: -2.2, to: [12, -2.2], speed: 1.15, woman: true, scarfChoice: 'no', sunHat: true },
    { kind: 'walk', tag: 'passerby', x: 18, y: PROM_Y, z: -4.2, to: [-12, -4.2], speed: 1.1, sport: true },
    { kind: 'walk', tag: 'passerby', x: -58, y: 2.6, z: 12, to: [-58, 46], speed: 1.05, sport: true },
  ];

  const neuAnimals = [
    { kind: 'gull', tag: 'galeb', x: -54.0, y: 3.45, z: 26, ry: 0.8 },
    { kind: 'gull', tag: 'galeb', x: -54.0, y: 3.45, z: 40, ry: -0.6 },
    { kind: 'gull', tag: 'galeb', x: -36, y: 14, z: 36, fly: true, r: 16, speed: 0.34 },
    { kind: 'gull', tag: 'galeb', x: -12, y: 16, z: 48, fly: true, r: 19, speed: -0.30 },
    { kind: 'gull', tag: 'galeb', x: 22, y: 15, z: 42, fly: true, r: 15, speed: 0.36 },
    { kind: 'dolphin', tag: 'delfin', x: -8, y: 0.25, z: 58, ry: 0.5, r: 7.5 },
    { kind: 'dolphin', tag: 'delfin', x: -12, y: 0.25, z: 62, ry: 0.5, r: 8.5 },
    { kind: 'crab', tag: 'rak', x: 54, y: 0.58, z: 22, ry: 0.4 },
    { kind: 'octopus', tag: 'hobotnica', x: 64, y: 0.30, z: 32, ry: -0.6 },
    { kind: 'jellyfish', tag: 'meduza', x: 46, y: 0.48, z: 34, ry: 0 },
    { kind: 'lizard', tag: 'guster', x: 44, y: PROM_Y + 1.32, z: -8, ry: 0.35 },
  ];

  // ==================== 12. ALL 75 ORBS (CLEAR CAMERAS & REACHABLE LANDINGS) ====================
  const orbs = [];
  const O = (id, x, y, z, cam, look, extra = {}) => {
    const f = V(x, y, z);
    const lk = look || [x, Math.max(0.4, y - 1.2), z];
    // Gentle lateral camera pan clear of geometry
    const dx = lk[0] - cam[0], dz = lk[2] - cam[2];
    const len = Math.hypot(dx, dz) || 1;
    const px = -dz / len * (extra.pan ?? 2.2), pz = dx / len * (extra.pan ?? 2.2);
    const from = extra.from || [cam[0] - px, cam[1], cam[2] - pz];
    const to = extra.to || [cam[0] + px, cam[1], cam[2] + pz];
    orbs.push({
      id,
      focus: V(...lk),
      size: extra.size ?? 3.0,
      tags: [id],
      shot: extra.wideView ? 'combo' : 'close',
      at: f,
      stage: extra.stage ?? 1,
      near: extra.near || { p: [x, Math.max(0.2, y - 1.8), z], r: extra.r ?? 4.8 },
      view: { from, to, look: lk },
      ...(extra.wideView ? { wideView: extra.wideView } : {}),
    });
  };

  // Zone 1: Adriatic Sea, Bay & Marine Life (13)
  O('more',      0, 3.0, 30,     [0, 9.5, 14],       [0, 0.5, 44],   { stage: 0, size: 16, r: 6.0, pan: 5, wideView: { from: [24, 22, 18], to: [-24, 22, 18], look: [0, 1, 48], lookTo: [0, 1, 48] } });
  O('talas',   -12, 2.2, 23.2,   [-12, 4.8, 15.5],   [-12, 0.2, 23.8], { size: 4 });
  O('zaljev',   14, 10.5, 72,    [0, 26.0, 36],      [4, 5.0, 96],   { size: 22, pan: 8, wideView: { from: [-34, 34, 42], to: [34, 34, 42], look: [0, 5, 92], lookTo: [0, 5, 92] } });
  O('ostrvo',   58, 9.2, 58,     [36, 13.5, 42],     [58, 3.2, 58],  { size: 10, pan: 4 });
  O('hrid',     72, 9.8, 26,     [54, 9.0, 38],      [72, 3.2, 26],  { size: 8, pan: 3.5 });
  O('galeb',   -54, 5.2, 26,     [-48, 5.4, 24],     [-54, 3.8, 26], { size: 2.2 });
  O('delfin',   -8, 3.4, 58,     [-18, 6.2, 46],     [-8, 1.0, 58],  { size: 5 });
  O('rak',      54, 2.4, 22,     [50.5, 3.2, 25.5],  [54, 0.6, 22],  { size: 1.5, pan: 1.4 });
  O('skoljka',  38, 2.1, 21.5,   [36.5, 2.6, 24.5],  [38, 0.3, 21.5], { size: 1.5, pan: 1.2 });
  O('hobotnica',64, 2.4, 32,     [59.5, 3.6, 36],    [64, 0.3, 32],  { size: 2.0, pan: 1.6 });
  O('jezic',    58, 2.1, 26,     [55.5, 3.0, 29.2],  [58, 0.2, 26],  { size: 1.5, pan: 1.2 });
  O('plava',    14, 3.4, 50,     [14, 11.5, 30],     [14, 0.2, 56],  { size: 14, pan: 5 });
  O('meduza',   46, 2.4, 34,     [43, 3.4, 38.2],    [46, 0.5, 34],  { size: 1.8, pan: 1.4 });

  // Zone 2: Neum Beach, Sun & Relaxation (16)
  O('plaza',     2, 4.8, 14,     [18, 11.0, 30],     [-4, 1.5, 13],  { size: 14, pan: 5, wideView: { from: [36, 18, 36], to: [-28, 18, 36], look: [0, 2, 13], lookTo: [0, 2, 13] } });
  O('pijesak',  -6, 2.8, 17,     [-11, 5.8, 24],     [-4, 0.6, 17],  { size: 6 });
  O('sljunak',  22, 3.2, 14.5,   [22, 6.2, 22],      [22, 1.0, 14.5], { size: 5 });
  O('suncobran',-22, 5.4, 10.2,  [-22, 6.4, 18.5],   [-22, 3.4, 10.2], { size: 4 });
  O('peskir',  -28, 3.0, 16.5,   [-28, 4.8, 22],     [-28, 0.9, 16.5], { size: 2.5 });
  O('lezaljka', -3.5, 3.6, 10.2, [-1.5, 4.8, 16.2],  [-1.8, 1.9, 10.2], { size: 2.8 });
  O('dvorac',   -4, 2.8, 17.5,   [-5.8, 3.2, 21.5],  [-4, 1.0, 17.5], { size: 2.0, pan: 1.5 });
  O('lopatica', -1.8, 2.4, 17.8, [-0.2, 2.8, 20.8],  [-1.8, 0.8, 17.8], { size: 1.4, pan: 1.2 });
  O('dusek',   -16, 2.2, 26,     [-16, 4.4, 31],     [-16, 0.2, 26], { size: 2.5 });
  O('kolut',    -6, 2.2, 25,     [-5.5, 3.8, 29.5],  [-5.5, 0.2, 25.4], { size: 2.0 });
  O('papuce',    7.4, 2.8, 12.2, [7.6, 3.6, 15.8],   [7.4, 1.3, 12.2], { size: 1.4, pan: 1.2 });
  O('sesir',   -18.2, 3.6, 10.4, [-16.2, 4.2, 14.2], [-18.2, 2.2, 10.4], { size: 1.5, pan: 1.2 });
  O('suncati', -22, 3.8, 9.8,    [-22, 4.8, 15.4],   [-22, 2.2, 9.8], { size: 3.0 });
  O('spavati',   8.5, 3.4, 13.6, [11.5, 4.2, 17.2],  [8.5, 1.4, 13.6], { size: 2.2, pan: 1.4 });
  O('citati',  -11, 4.4, 12.6,   [-11, 4.4, 17.6],   [-11, 2.0, 12.6], { size: 2.2, pan: 1.6 });
  O('knjiga',   -9.6, 3.0, 12.0, [-8.2, 3.5, 15.2],  [-9.6, 1.5, 12.0], { size: 1.5, pan: 1.2 });

  // Zone 3: Water Sports, Snorkelling & Lifeguard (10)
  O('roniti',   42, 2.6, 29,     [37, 4.5, 35],      [42, 0.3, 29],  { size: 2.8 });
  O('maska',    46, 2.6, 22,     [45.5, 3.0, 25.4],  [46, 0.95, 22], { size: 1.4, pan: 1.0 });
  O('peraje',   48, 2.6, 22,     [48.5, 3.0, 25.4],  [48, 0.9, 22],  { size: 1.4, pan: 1.0 });
  O('spasilac', 28, 7.8, 9.5,    [34, 8.2, 16.5],    [28, 4.6, 9.5], { size: 4.5 });
  O('pojas',    28.9, 5.2, 11.4, [31.2, 5.4, 15.4],  [28.9, 4.2, 10.8], { size: 1.8, pan: 1.4 });
  O('tus',      22, 5.6, 4.5,    [24.5, 5.6, 9.5],   [22, 3.9, 4.5], { size: 2.5, pan: 1.5 });
  O('odbojka',  24, 5.4, 16,     [24, 7.2, 26],      [24, 2.2, 16],  { size: 6, pan: 3.5 });
  O('skakati',  22.2, 4.8, 16,   [18.5, 5.2, 21.8],  [22.4, 2.5, 16], { size: 2.5 });
  O('pedolina', 26, 3.2, 32,     [31, 4.8, 37.5],    [26, 0.8, 32],  { size: 3.5 });
  O('vruce',    16.2, 4.2, 11.4, [18.5, 4.4, 16.2],  [16.2, 2.4, 11.4], { size: 2.2, pan: 1.5 });

  // Zone 4: Harbour, Pier & Lighthouse (12)
  O('luka',    -68, 6.2, 6,      [-48, 14.0, 28],    [-68, 2.2, 12], { size: 14, pan: 5, wideView: { from: [-34, 22, 36], to: [-66, 22, 42], look: [-68, 2, 12], lookTo: [-68, 2, 12] } });
  O('mol',     -58, 5.6, 36,     [-40, 11.0, 44],    [-58, 2.6, 36], { size: 10, pan: 4 });
  O('jedrilica',-32, 6.8, 46,    [-20, 8.5, 56],     [-32, 2.6, 46], { size: 6, pan: 3 });
  O('jedro',   -32, 8.8, 46.5,   [-21, 9.2, 53],     [-32, 5.0, 46.5], { size: 5, pan: 3 });
  O('jedriti', -32.6, 4.2, 45.2, [-27, 4.8, 51],     [-32.6, 1.8, 45.2], { size: 2.5 });
  O('jahta',   -47, 4.8, 24,     [-36, 6.6, 32],     [-47, 1.4, 24], { size: 6, pan: 3 });
  O('sidro',   -55.4, 5.0, 22,   [-51, 5.2, 24.5],   [-55.4, 3.4, 22], { size: 2.2, pan: 1.4 });
  O('konopac', -55.2, 4.5, 14,   [-51.2, 4.8, 16.5], [-55.2, 2.9, 14], { size: 1.8, pan: 1.4 });
  O('bova',    -11, 2.5, 36,     [-11, 4.6, 43],     [-11, 0.4, 36], { size: 3.5 });
  O('brod',    -72, 5.8, 18,     [-62, 7.6, 28],     [-72, 1.8, 18], { size: 6, pan: 3 });
  O('kapetan', -71.2, 4.2, 19.6, [-66.5, 4.6, 24],   [-71.2, 2.4, 19.6], { size: 2.2, pan: 1.4 });
  O('svjetionik',-58, 21.4, 62,  [-34, 18.0, 74],    [-58, 11.0, 62], { stage: 2, size: 12, r: 6.5, pan: 5, wideView: { from: [-24, 24, 86], to: [-76, 22, 86], look: [-58, 10, 62], lookTo: [-40, 6, 30] } });

  // Zone 5: Promenade, Hotel & Seaside Konoba (13)
  O('setaliste', 0, 5.4, -2.5,   [-26, 9.2, 6.5],    [6, 3.2, -2.5], { size: 14, pan: 4 });
  O('hotel',     6, 18.2, -21,   [6, 17.5, 6],       [6, 11.0, -21], { size: 16, pan: 6, wideView: { from: [26, 22, 12], to: [-14, 22, 12], look: [6, 10, -21], lookTo: [6, 10, -21] } });
  O('bazen',     6, 8.4, -11.4,  [16, 11.2, -3.5],   [6, 5.6, -11.4], { size: 7, pan: 3 });
  O('balkon',    6, 12.2, -13.5, [15, 13.0, -4.2],   [6, 10.6, -14.2], { size: 6, pan: 3 });
  O('restoran',-34, 8.4, -2.2,   [-22, 9.4, 11.0],   [-34, 4.6, -2.2], { size: 8, pan: 3.5 });
  O('sto',     -33.2, 5.2, -1.6, [-33.2, 5.8, 3.6],  [-33.2, 3.4, -1.6], { size: 2.5, pan: 1.5 });
  O('tanjir',  -33.5, 4.9, -1.5, [-33.5, 5.4, 1.8],  [-33.5, 3.55, -1.5], { size: 1.5, pan: 1.0 });
  O('casa',    -32.2, 4.9, -1.8, [-31.0, 5.2, 1.2],  [-32.2, 3.65, -1.8], { size: 1.4, pan: 1.0 });
  O('limunada',-34.2, 5.0, -4.2, [-34.2, 5.4, -0.6], [-34.2, 3.7, -4.2], { size: 1.5, pan: 1.0 });
  O('lubenica',-29.8, 4.9, -1.6, [-27.6, 5.2, 1.4],  [-29.8, 3.65, -1.6], { size: 1.5, pan: 1.0 });
  O('lignje',  -36.5, 4.9, -1.6, [-36.5, 5.3, 1.8],  [-36.5, 3.6, -1.6], { size: 1.5, pan: 1.0 });
  O('salata',  -30.5, 5.0, -4.4, [-28.4, 5.3, -1.2], [-30.5, 3.7, -4.4], { size: 1.5, pan: 1.0 });
  O('razglednica',-16, 5.4, -1.5,[-12.5, 5.4, 2.2],  [-16, 3.9, -1.5], { size: 2.0, pan: 1.4 });

  // Zone 6: Herzegovinian Hillside & Mediterranean Nature (11)
  O('vila',     -8, 22.8, -48,   [-8, 24.0, -28],    [-8, 15.5, -48], { size: 10, pan: 4 });
  O('palma',    16, 10.6, 2.4,   [24, 10.0, 12.5],   [16, 6.8, 2.4], { size: 5, pan: 2.5 });
  O('maslina', -36, 15.6, -34,   [-28, 16.0, -22],   [-36, 12.0, -34], { size: 5, pan: 2.5 });
  O('smokva',   34, 14.0, -26,   [39, 13.5, -17],    [34, 10.6, -26], { size: 4.5, pan: 2.2 });
  O('cempres',  46, 17.5, -26,   [54, 16.5, -14],    [46, 12.0, -26], { size: 6, pan: 2.5 });
  O('lavanda',  14, 13.8, -35.5, [14, 14.2, -28],    [14, 10.8, -35.5], { size: 4, pan: 2.5 });
  O('nar',     -25, 14.5, -34,   [-21, 14.8, -26],   [-25, 11.4, -34], { size: 4, pan: 2.2 });
  O('kaktus',   52, 8.6, -16,    [55, 8.8, -9.5],    [52, 5.6, -16], { size: 3.5, pan: 2.0 });
  O('guster',   44, 5.6, -8,     [44, 6.2, -3.5],    [44, 4.0, -8],  { size: 1.8, pan: 1.4 });
  O('ulica',   -18, 12.6, -26,   [-18, 14.5, -10],   [-18, 8.5, -28], { size: 7, pan: 3 });
  O('sest',      1, 6.8, 2.4,    [1, 10.5, 19.5],    [1, 3.4, 2.4],  { size: 10, pan: 4 });

  // Register paint sources for every orb tag & sky/sun
  for (const o of orbs) for (const t of o.tags) tag(t).source = o.focus.clone();
  tag('sky').source = sunPos.clone();
  tag('sun').source = sunPos.clone();

  b.finish(scene);

  return {
    colliders: b.colliders,
    orbs,
    people,
    animals: [],
    neuAnimals,
    clouds,
    smoke: [],
    start: V(0, PROM_Y + 0.85, 3.7),
    fleur: V(-58, 23.0, 62),
    sunPos,
    water: { y: SEA_Y, driftX: 0.12, driftZ: 0.08, clamp: (p) => { p.x = clamp(p.x, -95, 95); p.z = clamp(p.z, 18, 104); } },
    movers: [],
    sailboats,
    lighthouseBeam,
  };
}
