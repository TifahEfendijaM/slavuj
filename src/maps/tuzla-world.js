// Tuzla (summer / City of Salt & Pannonian Lakes): 3D world built from scratch on the shared Slavuj engine.
// South (+z) = turquoise Panonska jezera salt lakes, waterfalls & Neolithic stilt village;
// West (-x) = historic salt mine headframe, brine pump & railway;
// Centre = Soni trg, Korzo promenade & mosque; East (+x) = University & sevdah music pavilion;
// North-central = Gradska pijaca market; North (-z) = rising green Slana Banja hill & Observatory.
import * as THREE from 'three';
import { Builder, paintGeo, washMat, addHull, tag, PAT, shared } from '../paper.js';

export const LAKE_Y = 0.0;
export const CITY_Y = 3.2;

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const sm = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

function makeRng(seed = 75001977) {
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

// Continuous terrain height across the Pannonian salt lake basins, flat Tuzla valley & Slana Banja hill
export function tuzlaGroundY(x, z) {
  // Main West/Central Pannonian Lake centred at (-14, 35)
  const d1 = Math.hypot((x + 14) / 23.5, (z - 35) / 14.5);
  const y1 = d1 < 1.15 ? -2.0 + (CITY_Y + 2.0) * sm((d1 - 0.72) / 0.43) : CITY_Y;
  // Upper East Pannonian Lake centred at (16, 40)
  const d2 = Math.hypot((x - 16) / 14.5, (z - 40) / 11.5);
  const y2 = d2 < 1.15 ? -1.4 + (CITY_Y + 1.4) * sm((d2 - 0.72) / 0.43) : CITY_Y;
  let y = Math.min(y1, y2);
  // North rising Slana Banja hilltop park (z < -56), summit around (6, -86)
  if (z < -54) {
    const hillU = sm((-54 - z) / 42);
    const peak = Math.exp(-(((x - 6) / 42) ** 2 + ((z + 86) / 28) ** 2)) * 8.2;
    y = Math.max(y, CITY_Y + hillU * 9.6 + peak);
  }
  return y;
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

export function buildTuzlaWorld(scene) {
  // Bright summer Pannonian light with warm golden-salt afternoon finale glow
  shared.uWaterDir.value.set(-0.7, 0.25);
  shared.uSunShadow.value.set(0.32, 0.56, 0.74);
  shared.uSunGlow.value.set(1.0, 0.80, 0.48);
  shared.uSunTint.value.set(1.04, 0.99, 0.91);
  shared.uSkyGlow.value.set(0.99, 0.78, 0.50);

  const b = new Builder();
  const R = makeRng(75001977);
  const rr = (a, c) => a + R() * (c - a);

  const BOX = new THREE.BoxGeometry(1, 1, 1);
  const CYL = new THREE.CylinderGeometry(1, 1, 1, 8);
  const CYL8 = new THREE.CylinderGeometry(1, 1, 1, 8);
  const CYL6 = new THREE.CylinderGeometry(1, 1, 1, 6);
  const CONE = new THREE.ConeGeometry(1, 1, 7);
  const SPH = new THREE.SphereGeometry(1, 7, 5);
  const ICO = new THREE.IcosahedronGeometry(1, 1);
  const OCT = new THREE.OctahedronGeometry(1, 0);
  const TORUS = new THREE.TorusGeometry(1, 0.24, 6, 12);

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
    b.block(BOX, mat4(x, y, z, 0, 0, 0, [sx, sy, sz]), data);
  const box = (t, col, x, y, z, sx, sy, sz, ry = 0, o = {}) =>
    add(BOX, t, col, mat4(x, y, z, ry, o.rx || 0, o.rz || 0, [sx, sy, sz]), o);
  const cyl = (t, col, x, y, z, rx, h, rz = rx, o = {}) =>
    add(o.hex ? CYL6 : CYL, t, col, mat4(x, y, z, o.ry || 0, o.rx || 0, o.rz || 0, [rx, h, rz]), { ...o, hull: o.noOutline ? false : (o.hull ?? true) });
  const sph = (t, col, x, y, z, rx, ry = rx, rz = rx, o = {}) =>
    add(o.ico ? ICO : o.oct ? OCT : SPH, t, col, mat4(x, y, z, o.ry || 0, o.rx || 0, o.rz || 0, [rx, ry, rz]), { ...o, hull: o.noOutline ? false : (o.hull ?? true) });
  const cone = (t, col, x, y, z, r, h, o = {}) =>
    add(CONE, t, col, mat4(x, y, z, o.ry || 0, o.rx || 0, o.rz || 0, [r, h, r]), { ...o, hull: o.noOutline ? false : (o.hull ?? true) });

  // ---- 0. Summer Sky Dome, Sun & Clouds ----
  for (const t of ['terrain', 'lakes', 'props', 'passerby']) {
    tag(t).mode = 'one'; tag(t).radius = 125; tag(t).holdRest = 1.8;
  }
  const sunPos = V(-65, 58, 128);
  {
    const skyGeo = new THREE.SphereGeometry(260, 24, 14);
    const pa = skyGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) if (pa.getY(i) < -20) pa.setY(i, -20);
    const g = paintGeo(skyGeo, { col: '#88ccf2', bleed: '#f6e0b0', seed: [sunPos.x, sunPos.y, sunPos.z], radius: 360, dur: 5.5, hatch: 0 });
    const m = new THREE.Mesh(g, washMat('sky'));
    m.material.side = THREE.BackSide; m.material.depthWrite = false; m.renderOrder = -2;
    scene.add(m);
  }
  {
    const m = new THREE.Mesh(paintGeo(new THREE.SphereGeometry(11, 16, 12), { col: '#ffec94', bleed: '#ffc462', seed: [sunPos.x, sunPos.y, sunPos.z], radius: 22, dur: 3.5, hatch: 0 }), washMat('sun'));
    m.position.copy(sunPos); addHull(m, 1.5); scene.add(m);
  }
  const clouds = [];
  for (const [cx, cy, cz, sc] of [[-58, 54, 74, 1.25], [24, 58, 86, 1.35], [72, 52, 56, 1.15], [-46, 56, -68, 1.2], [44, 56, -62, 1.15]]) {
    const cg = new THREE.Group(); cg.position.set(cx, cy, cz); scene.add(cg);
    const cm = washMat('sky');
    for (const [dx, dy, dz, r] of [[0, 0, 0, 4.6], [3.6, -0.4, 0.5, 3.3], [-3.5, -0.5, -0.4, 3.1], [1.1, 1.2, -0.3, 2.9]]) {
      const m = new THREE.Mesh(paintGeo(ICO, { col: '#fbfaf5', bleed: '#e2e8f0', seed: [sunPos.x, sunPos.y, sunPos.z], radius: 260, dur: 5.0, hatch: 0 }), cm);
      m.position.set(dx * sc, dy * sc, dz * sc); m.scale.set(r * sc, r * 0.55 * sc, r * 0.7 * sc);
      addHull(m, 1.4); cg.add(m);
    }
    clouds.push({ g: cg, c: V(cx, cy, cz), r: 6.5 * sc, x0: cx, z0: cz, y0: cy, speed: 0.45 + R() * 0.3 });
  }

  // ---- 1. Continuous terrain mesh (salt-lake basins, valley town & rising Slana Banja hill) ----
  const NX = 52, NZ = 52, W = 250, D = 250;
  const tGeo = new THREE.PlaneGeometry(W, D, NX, NZ);
  tGeo.rotateX(-Math.PI / 2);
  const tp = tGeo.attributes.position;
  for (let i = 0; i < tp.count; i++) {
    const x = tp.getX(i), z = tp.getZ(i);
    tp.setY(i, tuzlaGroundY(x, z));
  }
  tGeo.computeVertexNormals();
  add(tGeo, 'terrain', '#8ab868', new THREE.Matrix4(), { bleed: '#68984c', hatch: 0.28, noOutline: true, solid: false });
  const terrCol = new THREE.Mesh(tGeo, new THREE.MeshBasicMaterial({ visible: false }));
  terrCol.userData.ground = true;
  b.colliders.push(terrCol);

  // ---- 2. Pannonian Salt Lakes turquoise water surfaces ----
  const lake1Geo = new THREE.CircleGeometry(24, 28);
  lake1Geo.rotateX(-Math.PI / 2);
  add(lake1Geo, 'lakes', '#2fb8c4', mat4(-14, LAKE_Y, 35, 0, 0, 0, [1.0, 1.0, 0.64]), {
    bleed: '#1d8fa0', pat: PAT.water, ps: 0.42, hatch: 0.16, noOutline: true,
  });
  const lake2Geo = new THREE.CircleGeometry(15, 22);
  lake2Geo.rotateX(-Math.PI / 2);
  add(lake2Geo, 'lakes', '#38c8d2', mat4(16, LAKE_Y + 0.55, 40, 0, 0, 0, [1.0, 1.0, 0.78]), {
    bleed: '#2298a8', pat: PAT.water, ps: 0.45, hatch: 0.16, noOutline: true,
  });
  // Water swim colliders for both lakes
  const wCol1 = blk(-14, LAKE_Y - 0.12, 35, 44, 0.24, 26, { wall: false, water: true });
  wCol1.userData.water = true;
  const wCol2 = blk(16, LAKE_Y + 0.43, 40, 26, 0.24, 20, { wall: false, water: true });
  wCol2.userData.water = true;

  // Warm sand & wooden lakeside boardwalk decks
  box('terrain', '#e6d6b0', -14, CITY_Y + 0.03, 18.5, 42, 0.12, 6.2, 0, { pat: PAT.planks, ps: 0.5, noOutline: true });
  box('terrain', '#d8c49a', 12, CITY_Y + 0.03, 25.5, 16, 0.12, 5.5, 0, { pat: PAT.planks, ps: 0.5, noOutline: true });
  // Soni trg & Korzo cobbled town centre
  box('terrain', '#d6c8b2', 0, CITY_Y + 0.03, -6, 48, 0.10, 34, 0, { pat: PAT.cobble, ps: 0.52, noOutline: true });
  // Market plaza cobblestones
  box('terrain', '#d0c2ac', -4, CITY_Y + 0.03, -40, 64, 0.10, 24, 0, { pat: PAT.cobble, ps: 0.55, noOutline: true });
  // University courtyard paving
  box('terrain', '#dfd4c0', 44, CITY_Y + 0.03, -2, 34, 0.10, 34, 0, { pat: PAT.blocks, ps: 0.45, noOutline: true });
  // Slana Banja stone footpath climbing north toward the observatory
  for (let i = 0; i < 10; i++) {
    const pz = -55 - i * 3.0;
    const py = tuzlaGroundY(4, pz);
    box('terrain', '#d2c8b6', 4, py + 0.08, pz, 4.4, 0.18, 3.3, 0, { noOutline: true });
  }

  // ---- Helpers for houses, trees, stalls & orbs ----
  const orbs = [];
  const near = (x, y, z, r = 4.6) => ({ p: V(x, y, z), r });
  const toArr = (v) => (Array.isArray(v) ? v : [v.x, v.y, v.z]);
  function addOrb(id, focus, size, tags, _shotName, at, view, stage = 1, nearR = 4.8, wideView = null) {
    orbs.push({
      id, focus, size, tags, shot: wideView ? 'combo' : 'close', at, stage,
      near: near(at.x, at.y, at.z, nearR),
      view: { from: toArr(view.from), to: toArr(view.to), look: toArr(view.look) },
      ...(wideView ? { wideView } : {}),
    });
  }

  function buildHouse(t, x, y, z, w, h, d, wallCol, roofCol, ry = 0, o = {}) {
    box(t, wallCol, x, y + h / 2, z, w, h, d, ry, { bleed: o.bleed || wallCol, pat: o.pat || PAT.blocks, ps: 0.4, solid: true, wall: true });
    const rH = o.roofH || 2.2;
    const rg = gableRoof(w + 0.5, d + 0.5, rH);
    add(rg, t, roofCol, mat4(x, y + h, z, ry), { bleed: roofCol, hatch: 0.45 });
    // Simple window accents on front (+z local)
    const cos = Math.cos(ry), sin = Math.sin(ry);
    const rows = h > 5.5 ? 2 : 1;
    const cols = Math.max(2, Math.floor(w / 2.6));
    for (let r = 0; r < rows; r++) {
      const wy = y + 1.8 + r * 2.4;
      for (let c = 0; c < cols; c++) {
        const lx = -w / 2 + (c + 0.5) * (w / cols);
        const lz = d / 2 + 0.06;
        box(t, '#3e5c78', x + lx * cos + lz * sin, wy, z - lx * sin + lz * cos, 0.9, 1.2, 0.10, ry, { noOutline: true });
      }
    }
  }

  function addTree(t, x, z, sc = 1.0, col = '#4f8c46', bleed = '#34662c') {
    const y = tuzlaGroundY(x, z);
    cyl(t, '#6e4e34', x, y + 1.4 * sc, z, 0.24 * sc, 2.8 * sc, 0.24 * sc, { bleed: '#4c321e' });
    sph(t, col, x, y + 3.4 * sc, z, 1.6 * sc, 1.45 * sc, 1.6 * sc, { ico: true, bleed, sway: 0.45 });
    sph(t, col, x + 0.65 * sc, y + 2.9 * sc, z + 0.4 * sc, 1.05 * sc, 1.0 * sc, 1.05 * sc, { ico: true, bleed, sway: 0.45 });
  }

  function addMarketStall(t, x, z, awningCol, ry = 0) {
    const y = CITY_Y;
    // Wooden counter & 4 posts
    box(t, '#a4784c', x, y + 0.55, z, 3.6, 1.1, 1.7, ry, { bleed: '#7a5430', solid: true, wall: true });
    for (const sx of [-1.65, 1.65]) for (const sz of [-0.72, 0.72]) {
      const rx = sx * Math.cos(ry) + sz * Math.sin(ry);
      const rz = -sx * Math.sin(ry) + sz * Math.cos(ry);
      cyl(t, '#6e4e32', x + rx, y + 1.4, z + rz, 0.07, 2.8, 0.07);
    }
    // Slanted striped awning roof
    box(t, awningCol, x, y + 2.85, z, 4.0, 0.14, 2.2, ry, { rx: 0.14, bleed: awningCol });
    box(t, '#faf6ec', x, y + 2.90, z, 1.35, 0.12, 2.22, ry, { rx: 0.14, noOutline: true });
  }

  // =========================================================================
  // ZONE 1: PANNONIAN SALT LAKES, WATERFALLS & NEOLITHIC STILT VILLAGE (13)
  // =========================================================================

  // 1. kristal (Stage 0 FIRST ORB right in front of the lakeside start terrace!)
  {
    const cx = -20, cy = CITY_Y, cz = 20.5;
    cyl('kristal', '#cfc6b4', cx, cy + 0.25, cz, 1.9, 0.5, 1.9, { bleed: '#a89e8c', solid: true });
    const shards = [
      [0, 1.6, 0, 0.58, 2.8, 0, 0, '#f4fbff'],
      [-0.72, 1.1, 0.35, 0.42, 2.0, 0.28, 0.32, '#dff4fa'],
      [0.74, 1.2, -0.25, 0.44, 2.1, -0.26, -0.30, '#e8f7fc'],
      [0.18, 0.95, 0.72, 0.36, 1.65, 0.35, -0.15, '#ffffff'],
      [-0.45, 0.9, -0.62, 0.36, 1.6, -0.32, 0.26, '#d8f0f8'],
    ];
    for (const [dx, dy, dz, r, h, rx, rz, c] of shards) {
      cyl('kristal', c, cx + dx, cy + dy, cz + dz, r, h, r, { hex: true, rx, rz, bleed: '#9ad6e6' });
      cone('kristal', '#ffffff', cx + dx, cy + dy + h * 0.54, cz + dz, r, r * 1.3, { rx, rz, bleed: '#a8dce8' });
    }
    addOrb('kristal', V(cx, cy + 1.5, cz), 2.5, ['kristal'], 'kristal', V(cx, cy + 3.4, cz), {
      from: V(cx - 5.5, cy + 3.2, cz - 5.5), to: V(cx - 3.0, cy + 2.4, cz - 4.2), look: V(cx, cy + 1.4, cz),
    }, 0, 5.2);
  }

  // 2. kaskada (tiered white-stone salt waterfalls between the upper and main lake)
  {
    const kx = 2.0, kz = 36.5;
    for (let i = 0; i < 4; i++) {
      const tx = kx + i * 1.4, ty = 0.25 + i * 0.68;
      box('kaskada', '#e8e2d4', tx, ty, kz, 2.2, 0.85, 8.6 - i * 0.6, 0, { bleed: '#c4bca8', solid: true });
      // Turquoise cascading water sheets & frothy foam lips
      box('kaskada', '#52d6e0', tx - 0.95, ty + 0.05, kz, 0.38, 0.86, 6.2 - i * 0.5, 0, { bleed: '#28a6b4', noOutline: true });
      sph('kaskada', '#f4fcff', tx - 1.15, ty - 0.25, kz + (i - 1.5) * 1.2, 0.75, 0.36, 1.35, { noOutline: true });
    }
    box('kaskada', '#44ced8', kx + 4.4, 2.65, kz, 2.6, 0.26, 6.2, 0, { pat: PAT.water, noOutline: true });
    addOrb('kaskada', V(kx + 1.4, 1.6, kz), 4.0, ['kaskada'], 'kaskada', V(kx + 1.2, 4.2, kz), {
      from: V(kx - 7.5, 4.6, kz - 7.5), to: V(kx - 4.8, 3.6, kz - 5.5), look: V(kx + 1.6, 1.6, kz),
    }, 1, 6.0);
  }

  // 3. sojenica (Neolithic stilt village over the west edge of the salt lake)
  {
    const sx = -36, sz = 34;
    // Wooden walkway & stilts into lake
    box('sojenica', '#9c7248', sx + 2, 1.35, sz - 2, 10.5, 0.25, 11.0, 0, { pat: PAT.planks, ps: 0.45, bleed: '#6e4c2a', solid: true });
    for (const px of [-2.8, 1.8, 6.5]) for (const pz of [-6.5, -2.0, 2.8]) {
      cyl('sojenica', '#6e4a2c', sx + px, 0.4, sz + pz, 0.18, 2.6, 0.18);
    }
    // 3 thatched prehistoric timber huts on the platform
    const huts = [
      [sx - 0.6, 1.5, sz - 4.2, 3.4, 2.2, 3.2, 0.1],
      [sx + 4.4, 1.5, sz - 0.4, 3.6, 2.3, 3.2, -0.25],
      [sx - 0.4, 1.5, sz + 1.2, 3.2, 2.1, 3.0, 0.2],
    ];
    for (const [hx, hy, hz, hw, hh, hd, ry] of huts) {
      box('sojenica', '#a87d50', hx, hy + hh / 2, hz, hw, hh, hd, ry, { bleed: '#7a5632', solid: true, wall: true });
      add(gableRoof(hw + 0.8, hd + 0.8, 2.1), 'sojenica', '#d4b468', mat4(hx, hy + hh, hz, ry), { bleed: '#a88a42', hatch: 0.55 });
    }
    addOrb('sojenica', V(sx + 1.6, 3.2, sz - 1.4), 5.2, ['sojenica'], 'sojenica', V(sx + 1.8, 6.4, sz - 1.2), {
      from: V(sx + 12.5, 6.2, sz - 9.5), to: V(sx + 9.2, 4.8, sz - 6.8), look: V(sx + 1.6, 2.9, sz - 1.2),
    }, 1, 6.4);
  }

  // 4. cup (Neolithic salt-boiling terracotta clay pots on the stilt village terrace)
  {
    const cx = -31.5, cy = 1.55, cz = 26.8;
    box('cup', '#9c7248', cx, cy - 0.1, cz, 4.2, 0.22, 3.4, 0, { solid: true });
    for (const [dx, dz, sc] of [[0, 0, 1.15], [-0.95, 0.45, 0.82], [0.92, -0.35, 0.90]]) {
      sph('cup', '#c86c44', cx + dx, cy + 0.55 * sc, cz + dz, 0.55 * sc, 0.65 * sc, 0.55 * sc, { bleed: '#964828' });
      cyl('cup', '#b65b36', cx + dx, cy + 1.15 * sc, cz + dz, 0.30 * sc, 0.32 * sc, 0.30 * sc);
      add(TORUS, 'cup', '#d87e54', mat4(cx + dx, cy + 1.30 * sc, cz + dz, 0, Math.PI / 2, 0, [0.33 * sc, 0.33 * sc, 0.33 * sc]));
    }
    addOrb('cup', V(cx, cy + 0.7, cz), 1.8, ['cup'], 'cup', V(cx, cy + 2.4, cz), {
      from: V(cx + 4.5, cy + 3.0, cz - 4.2), to: V(cx + 3.0, cy + 2.2, cz - 2.8), look: V(cx, cy + 0.7, cz),
    }, 1, 4.4);
  }

  // 5. fosil (ancient Pannonian spiral ammonite shell fossil on a stone geological pedestal)
  {
    const fx = -44, fy = CITY_Y, fz = 24;
    box('fosil', '#c8beaa', fx, fy + 0.55, fz, 1.7, 1.1, 1.4, 0.25, { bleed: '#9c927e', solid: true });
    box('fosil', '#dcd2be', fx, fy + 1.35, fz, 1.5, 0.95, 0.55, 0.25, { rx: -0.25, bleed: '#b4aa94' });
    add(TORUS, 'fosil', '#947e5c', mat4(fx + 0.06, fy + 1.42, fz + 0.24, 0.25, -0.25, 0, [0.42, 0.42, 0.28]), { bleed: '#6e5a3c' });
    add(TORUS, 'fosil', '#a8906a', mat4(fx + 0.06, fy + 1.42, fz + 0.28, 0.25, -0.25, 0, [0.22, 0.22, 0.24]));
    addOrb('fosil', V(fx, fy + 1.3, fz), 1.7, ['fosil'], 'fosil', V(fx, fy + 2.8, fz), {
      from: V(fx + 3.6, fy + 2.8, fz + 3.8), to: V(fx + 2.3, fy + 2.1, fz + 2.6), look: V(fx, fy + 1.3, fz),
    }, 1, 4.4);
  }

  // 6. mineral (geological park display table with amethyst, quartz & rock-salt specimens)
  {
    const mx = -48, my = CITY_Y, mz = 32;
    box('mineral', '#8a6846', mx, my + 0.52, mz, 3.2, 1.04, 1.4, 0.3, { bleed: '#62462c', solid: true });
    sph('mineral', '#9e62c8', mx - 0.85, my + 1.42, mz + 0.15, 0.46, 0.56, 0.44, { oct: true, bleed: '#6e3898' });
    sph('mineral', '#54c4b8', mx + 0.05, my + 1.48, mz - 0.05, 0.48, 0.62, 0.46, { oct: true, bleed: '#2c8e84' });
    sph('mineral', '#f4a852', mx + 0.90, my + 1.38, mz - 0.22, 0.44, 0.50, 0.42, { oct: true, bleed: '#c07424' });
    addOrb('mineral', V(mx, my + 1.3, mz), 2.1, ['mineral'], 'mineral', V(mx, my + 2.9, mz), {
      from: V(mx + 4.4, my + 3.0, mz + 4.0), to: V(mx + 2.8, my + 2.2, mz + 2.6), look: V(mx, my + 1.3, mz),
    }, 1, 4.5);
  }

  // 7. plutati (floating swimmer in the salty Pannonian lake) -> person kind 'tuzFloat'
  addOrb('plutati', V(-14, 0.3, 35), 2.0, ['plutati'], 'plutati', V(-14, 2.4, 35), {
    from: V(-9.2, 3.2, 29.5), to: V(-10.8, 2.2, 31.4), look: V(-14, 0.35, 35),
  }, 1, 5.0);

  // 8. prskati (splashing child in shallow turquoise edge) -> person kind 'tuzSplash'
  addOrb('prskati', V(-6, 0.9, 26.8), 1.9, ['prskati'], 'prskati', V(-6, 2.9, 26.8), {
    from: V(-1.5, 3.4, 21.8), to: V(-3.0, 2.5, 23.4), look: V(-6, 0.9, 26.8),
  }, 1, 4.8);

  // 9. trambolina (floating yellow-and-blue water trampoline in the main lake)
  {
    const tx = -22, ty = 0.24, tz = 42;
    add(TORUS, 'trambolina', '#f2b82a', mat4(tx, ty + 0.18, tz, 0, Math.PI / 2, 0, [2.1, 2.1, 1.5]), { bleed: '#c88c14' });
    cyl('trambolina', '#2668b4', tx, ty + 0.16, tz, 1.85, 0.18, 1.85, { bleed: '#18447c', solid: true });
    addOrb('trambolina', V(tx, ty + 0.4, tz), 2.8, ['trambolina'], 'trambolina', V(tx, ty + 2.8, tz), {
      from: V(tx + 5.6, 3.8, tz - 5.4), to: V(tx + 3.8, 2.6, tz - 3.6), look: V(tx, ty + 0.35, tz),
    }, 1, 5.2);
  }

  // 10. ljuljati (striped lakeside hammock slung between two wooden beach posts)
  {
    const hx = 12, hy = CITY_Y, hz = 24;
    for (const s of [-1.8, 1.8]) cyl('ljuljati', '#7a5230', hx + s, hy + 1.15, hz, 0.12, 2.3, 0.12);
    // Curved hammock sling built from 3 angled slats
    box('ljuljati', '#e8684a', hx, hy + 0.72, hz, 1.7, 0.12, 1.05, 0, { bleed: '#b84228' });
    box('ljuljati', '#f4c842', hx - 1.15, hy + 1.02, hz, 1.1, 0.10, 0.95, 0, { rz: -0.45 });
    box('ljuljati', '#f4c842', hx + 1.15, hy + 1.02, hz, 1.1, 0.10, 0.95, 0, { rz: 0.45 });
    addOrb('ljuljati', V(hx, hy + 1.1, hz), 2.3, ['ljuljati'], 'ljuljati', V(hx, hy + 2.9, hz), {
      from: V(hx - 4.4, hy + 2.8, hz - 4.6), to: V(hx - 2.8, hy + 2.0, hz - 3.2), look: V(hx, hy + 1.0, hz),
    }, 1, 4.8);
  }

  // 11. narandzasta (row of vivid bright-orange sun loungers & parasols on the boardwalk)
  {
    const nx = -11, ny = CITY_Y, nz = 17.5;
    for (let i = -1; i <= 1; i++) {
      const lx = nx + i * 2.1;
      box('narandzasta', '#f47b20', lx, ny + 0.35, nz, 0.95, 0.22, 2.0, 0, { bleed: '#c8560c', solid: true });
      box('narandzasta', '#f47b20', lx, ny + 0.68, nz - 0.72, 0.95, 0.20, 0.85, 0, { rx: 0.58, bleed: '#c8560c' });
    }
    cyl('narandzasta', '#8a6640', nx, ny + 1.35, nz - 0.5, 0.06, 2.6, 0.06);
    cone('narandzasta', '#ff8826', nx, ny + 2.55, nz - 0.5, 1.75, 0.65, { bleed: '#cc5e10' });
    addOrb('narandzasta', V(nx, ny + 1.2, nz), 3.0, ['narandzasta'], 'narandzasta', V(nx, ny + 3.4, nz), {
      from: V(nx + 4.8, ny + 3.4, nz - 5.2), to: V(nx + 3.0, ny + 2.5, nz - 3.5), look: V(nx, ny + 1.1, nz),
    }, 1, 5.2);
  }

  // 12. osam (eight crisp white salt-crystal columns lining the lakeside terrace)
  {
    const ox = -1.5, oy = CITY_Y, oz = 16.5;
    box('osam', '#c8bea8', ox, oy + 0.18, oz, 8.6, 0.36, 1.5, 0, { solid: true });
    for (let i = 0; i < 8; i++) {
      const px = ox - 3.5 + i * 1.0;
      cyl('osam', '#f7fbff', px, oy + 1.25, oz, 0.26, 1.8, 0.26, { hex: true, bleed: '#b8dce6' });
      cone('osam', '#ffffff', px, oy + 2.35, oz, 0.28, 0.45);
    }
    addOrb('osam', V(ox, oy + 1.3, oz), 3.6, ['osam'], 'osam', V(ox, oy + 3.4, oz), {
      from: V(ox + 2.4, oy + 3.4, oz - 6.6), to: V(ox + 1.4, oy + 2.6, oz - 4.8), look: V(ox, oy + 1.3, oz),
    }, 1, 5.4);
  }

  // 13. slano (salt-water mineral tasting well with white salt-crusted stone basin & brine jet)
  {
    const sx = 9.5, sy = CITY_Y, sz = 30;
    cyl('slano', '#d8d0c0', sx, sy + 0.42, sz, 1.5, 0.84, 1.5, { bleed: '#b2a896', solid: true });
    cyl('slano', '#36c2ce', sx, sy + 0.80, sz, 1.22, 0.14, 1.22, { pat: PAT.water, noOutline: true });
    // White crystallized salt rim crusts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      sph('slano', '#ffffff', sx + Math.cos(a) * 1.38, sy + 0.86, sz + Math.sin(a) * 1.38, 0.24, 0.16, 0.24, { oct: true, bleed: '#cce8f0' });
    }
    cyl('slano', '#f2fafc', sx, sy + 1.35, sz, 0.22, 1.0, 0.22, { hex: true });
    addOrb('slano', V(sx, sy + 1.0, sz), 2.0, ['slano'], 'slano', V(sx, sy + 2.9, sz), {
      from: V(sx - 4.4, sy + 3.0, sz - 4.2), to: V(sx - 2.8, sy + 2.1, sz - 2.8), look: V(sx, sy + 0.95, sz),
    }, 1, 4.6);
  }

  // =========================================================================
  // ZONE 2: SALT MINE, SALTWORKS & RAILWAY HERITAGE (13)
  // =========================================================================

  // 14. rudnik (tall historic timber-and-iron salt mine hoist headframe tower)
  {
    const rx = -42, ry = CITY_Y, rz = -6;
    box('rudnik', '#7c6e60', rx, ry + 0.5, rz, 5.8, 1.0, 5.8, 0, { solid: true, wall: true });
    // 4 angled timber legs climbing 9.5 m
    for (const [dx, dz] of [[-1.9, -1.9], [1.9, -1.9], [-1.9, 1.9], [1.9, 1.9]]) {
      box('rudnik', '#5c422c', rx + dx * 0.72, ry + 5.2, rz + dz * 0.72, 0.42, 9.4, 0.42, 0, {
        rx: -dz * 0.055, rz: dx * 0.055, bleed: '#3a2818',
      });
    }
    // Cross-beams & hoist house at top
    box('rudnik', '#6e4e34', rx, ry + 5.4, rz, 3.6, 0.35, 3.6, 0);
    box('rudnik', '#5a402a', rx, ry + 9.6, rz, 3.0, 1.6, 3.0, 0, { bleed: '#3a2818' });
    add(gableRoof(3.5, 3.5, 1.4), 'rudnik', '#4a4e54', mat4(rx, ry + 10.4, rz));
    // Large iron pulley wheel
    add(TORUS, 'rudnik', '#363c42', mat4(rx, ry + 8.6, rz + 0.2, 0, 0, 0, [1.15, 1.15, 0.45]));
    addOrb('rudnik', V(rx, ry + 5.6, rz), 5.6, ['rudnik'], 'rudnik', V(rx, ry + 11.4, rz), {
      from: V(rx + 12.5, ry + 9.2, rz + 10.5), to: V(rx + 9.0, ry + 7.5, rz + 7.8), look: V(rx, ry + 5.4, rz),
    }, 1, 6.8);
  }

  // 15. rudar (animated salt miner standing outside the shaft) -> person kind 'tuzMiner'
  addOrb('rudar', V(-37.5, CITY_Y + 1.1, 0.5), 1.9, ['rudar'], 'rudar', V(-37.5, CITY_Y + 3.0, 0.5), {
    from: V(-33.0, CITY_Y + 2.8, 4.4), to: V(-34.6, CITY_Y + 2.1, 3.0), look: V(-37.5, CITY_Y + 1.1, 0.5),
  }, 1, 4.6);

  // 16. kramp (crossed iron pickaxes lodged into a sparkling block of rock salt)
  {
    const kx = -38.5, ky = CITY_Y, kz = -11.5;
    sph('kramp', '#edf6fa', kx, ky + 0.58, kz, 0.95, 0.65, 0.85, { oct: true, bleed: '#b8d6e0', solid: true });
    // Pickaxe handle + curved iron twin points
    cyl('kramp', '#8a6038', kx + 0.15, ky + 1.45, kz, 0.06, 1.55, 0.06, { rz: -0.25 });
    box('kramp', '#4c545e', kx + 0.34, ky + 2.12, kz, 1.15, 0.12, 0.14, 0, { rz: -0.25, bleed: '#2e343a' });
    cone('kramp', '#4c545e', kx - 0.30, ky + 1.94, kz, 0.10, 0.34, { rz: 1.32 });
    cone('kramp', '#4c545e', kx + 0.98, ky + 2.26, kz, 0.10, 0.34, { rz: -1.82 });
    addOrb('kramp', V(kx + 0.2, ky + 1.3, kz), 1.8, ['kramp'], 'kramp', V(kx + 0.2, ky + 2.9, kz), {
      from: V(kx + 4.4, ky + 2.9, kz + 3.8), to: V(kx + 2.9, ky + 2.1, kz + 2.5), look: V(kx + 0.2, ky + 1.3, kz),
    }, 1, 4.4);
  }

  // 17. svjetiljka (glowing brass-and-gold miner's safety lamp standing on a timber post)
  {
    const lx = -34.5, ly = CITY_Y, lz = -3.8;
    cyl('svjetiljka', '#6e4e34', lx, ly + 0.55, lz, 0.20, 1.1, 0.20, { solid: true });
    cyl('svjetiljka', '#c89c32', lx, ly + 1.22, lz, 0.34, 0.22, 0.34, { bleed: '#96701c' });
    cyl('svjetiljka', '#fff08c', lx, ly + 1.62, lz, 0.26, 0.62, 0.26, { bleed: '#f2c42c' });
    cyl('svjetiljka', '#c89c32', lx, ly + 2.02, lz, 0.34, 0.22, 0.34, { bleed: '#96701c' });
    add(TORUS, 'svjetiljka', '#d8aa3c', mat4(lx, ly + 2.24, lz, 0, 0, 0, [0.22, 0.22, 0.22]));
    addOrb('svjetiljka', V(lx, ly + 1.6, lz), 1.7, ['svjetiljka'], 'svjetiljka', V(lx, ly + 3.0, lz), {
      from: V(lx + 3.8, ly + 2.9, lz + 3.6), to: V(lx + 2.4, ly + 2.2, lz + 2.3), look: V(lx, ly + 1.6, lz),
    }, 1, 4.4);
  }

  // 18. sljem (bright yellow protective mining helmets lined on a wooden rack)
  {
    const sx = -34.5, sy = CITY_Y, sz = 3.8;
    box('sljem', '#8a6440', sx, sy + 0.55, sz, 2.2, 1.1, 0.9, 0.2, { bleed: '#624428', solid: true });
    for (const dx of [-0.62, 0, 0.62]) {
      sph('sljem', '#f6c424', sx + dx, sy + 1.28, sz, 0.32, 0.28, 0.36, { bleed: '#c89410' });
      box('sljem', '#f6c424', sx + dx, sy + 1.18, sz + 0.28, 0.36, 0.06, 0.24, 0.2);
    }
    addOrb('sljem', V(sx, sy + 1.25, sz), 1.8, ['sljem'], 'sljem', V(sx, sy + 2.8, sz), {
      from: V(sx + 4.0, sy + 2.8, sz + 3.8), to: V(sx + 2.6, sy + 2.1, sz + 2.5), look: V(sx, sy + 1.25, sz),
    }, 1, 4.4);
  }

  // 19, 20, 21. lokomotiva, vagon & voz (animated Tuzla salt train built as a single movable THREE.Group!)
  const trainGroup = new THREE.Group();
  const trainHome = V(-56, CITY_Y + 0.14, 0);
  trainGroup.position.copy(trainHome);
  scene.add(trainGroup);
  {
    const mkPart = (geo, tagName, col, bleed, pos, scale, rot = [0, 0, 0]) => {
      const m = new THREE.Mesh(
        paintGeo(geo, { col, bleed, seed: [pos[0], pos[1], pos[2]], radius: 14, hatch: 0.4 }),
        washMat(tagName)
      );
      m.position.set(...pos);
      m.rotation.set(...rot);
      m.scale.set(...scale);
      addHull(m, 1.3);
      trainGroup.add(m);
      return m;
    };
    // Locomotive at local z = +4.2
    mkPart(BOX, 'lokomotiva', '#2b543e', '#1c3a2a', [0, 1.1, 4.2], [2.2, 1.2, 4.6]);
    mkPart(CYL, 'lokomotiva', '#243c32', '#162620', [0, 1.9, 4.7], [0.82, 3.0, 0.82], [Math.PI / 2, 0, 0]);
    mkPart(BOX, 'lokomotiva', '#2b543e', '#1c3a2a', [0, 2.35, 2.7], [2.25, 1.7, 1.8]);
    mkPart(BOX, 'lokomotiva', '#c44632', '#8e2d1e', [0, 3.30, 2.7], [2.5, 0.22, 2.1]);
    mkPart(CYL, 'lokomotiva', '#2e343a', '#1c2024', [0, 3.05, 5.6], [0.28, 1.25, 0.28]);
    mkPart(SPH, 'lokomotiva', '#f2c844', '#c4961c', [0, 1.9, 6.25], [0.35, 0.35, 0.20]);
    for (const wz of [2.5, 4.2, 5.6]) for (const wx of [-1.12, 1.12]) {
      mkPart(CYL, 'lokomotiva', '#b83c2c', '#82241a', [wx, 0.55, wz], [0.48, 0.22, 0.48], [0, 0, Math.PI / 2]);
    }
    // Carriage #1 (vagon) at local z = -1.2 filled with gleaming white rock salt
    mkPart(BOX, 'vagon', '#b85432', '#8a381e', [0, 1.35, -1.2], [2.15, 1.45, 4.2]);
    mkPart(ICO, 'vagon', '#f5fbff', '#c6e2ec', [0, 2.20, -1.2], [0.95, 0.52, 1.65]);
    for (const wz of [-2.4, 0.0]) for (const wx of [-1.08, 1.08]) {
      mkPart(CYL, 'vagon', '#383e44', '#22262a', [wx, 0.48, wz], [0.42, 0.20, 0.42], [0, 0, Math.PI / 2]);
    }
    // Carriage #2 (voz) at local z = -6.2 + front cowcatcher & couplings
    mkPart(BOX, 'voz', '#366898', '#22466a', [0, 1.35, -6.2], [2.15, 1.45, 4.2]);
    mkPart(ICO, 'voz', '#ffffff', '#cee8f0', [0, 2.20, -6.2], [0.95, 0.50, 1.65]);
    mkPart(BOX, 'voz', '#363c42', '#22262a', [0, 0.8, 1.4], [0.5, 0.28, 1.3]);
    mkPart(BOX, 'voz', '#363c42', '#22262a', [0, 0.8, -3.7], [0.5, 0.28, 1.3]);
    mkPart(CONE, 'voz', '#b83c2c', '#82241a', [0, 0.55, 6.7], [0.85, 0.95, 0.85], [Math.PI / 2, 0, 0]);
    for (const wz of [-7.4, -5.0]) for (const wx of [-1.08, 1.08]) {
      mkPart(CYL, 'voz', '#383e44', '#22262a', [wx, 0.48, wz], [0.42, 0.20, 0.42], [0, 0, Math.PI / 2]);
    }
  }
  const trainCollider = blk(-56, CITY_Y + 1.6, -1.0, 2.8, 3.2, 15.8, { solid: true, wall: true });

  addOrb('lokomotiva', V(-56, CITY_Y + 1.9, 4.2), 3.4, ['lokomotiva'], 'lokomotiva', V(-56, CITY_Y + 4.4, 4.2), {
    from: V(-48.5, CITY_Y + 4.4, 9.5), to: V(-50.5, CITY_Y + 3.2, 7.6), look: V(-56, CITY_Y + 1.8, 4.2),
  }, 1, 5.6);

  addOrb('vagon', V(-56, CITY_Y + 1.6, -1.2), 3.2, ['vagon'], 'vagon', V(-56, CITY_Y + 3.9, -1.2), {
    from: V(-49.0, CITY_Y + 4.0, -3.2), to: V(-51.0, CITY_Y + 3.0, -2.2), look: V(-56, CITY_Y + 1.6, -1.2),
  }, 1, 5.4);

  addOrb('voz', V(-56, CITY_Y + 1.8, -5.8), 4.8, ['voz'], 'voz', V(-56, CITY_Y + 4.6, -6.2), {
    from: V(-46.0, CITY_Y + 6.4, -12.5), to: V(-48.2, CITY_Y + 5.0, -9.8), look: V(-56, CITY_Y + 1.8, -1.5),
  }, 1, 6.0);

  // 22. pruga (wooden sleepers & parallel steel rails stretching north-south along x = -56)
  {
    const px = -56, py = CITY_Y;
    for (const dx of [-0.85, 0.85]) {
      box('pruga', '#68727c', px + dx, py + 0.14, -8, 0.12, 0.14, 52, 0, { bleed: '#444c54' });
    }
    for (let rz = -32; rz <= 16; rz += 1.6) {
      box('pruga', '#785638', px, py + 0.06, rz, 2.5, 0.10, 0.32, 0, { noOutline: true });
    }
    addOrb('pruga', V(px, py + 0.4, -20), 3.0, ['pruga'], 'pruga', V(px, py + 2.4, -20), {
      from: V(px + 5.2, py + 3.6, -24.5), to: V(px + 3.4, py + 2.5, -22.8), look: V(px, py + 0.3, -20),
    }, 1, 5.2);
  }

  // 23. rampa (red-and-white striped railway crossing barrier gate)
  {
    const rx = -52.5, ry = CITY_Y, rz = 12;
    box('rampa', '#484e54', rx, ry + 0.75, rz, 0.55, 1.5, 0.55, 0, { solid: true });
    for (let i = 0; i < 5; i++) {
      box('rampa', i % 2 ? '#faf8f2' : '#d8362a', rx - 0.6 - i * 0.9, ry + 1.25, rz, 0.90, 0.16, 0.14, 0, { rz: 0.06 });
    }
    cyl('rampa', '#363c42', rx + 0.6, ry + 1.65, rz, 0.07, 3.2, 0.07);
    box('rampa', '#d8362a', rx + 0.6, ry + 2.95, rz + 0.08, 0.88, 0.16, 0.08, 0, { rz: 0.78 });
    box('rampa', '#d8362a', rx + 0.6, ry + 2.95, rz + 0.08, 0.88, 0.16, 0.08, 0, { rz: -0.78 });
    addOrb('rampa', V(rx - 1.6, ry + 1.5, rz), 2.8, ['rampa'], 'rampa', V(rx - 1.4, ry + 3.4, rz), {
      from: V(rx + 3.8, ry + 3.2, rz + 5.2), to: V(rx + 2.0, ry + 2.4, rz + 3.6), look: V(rx - 1.6, ry + 1.4, rz),
    }, 1, 5.0);
  }

  // 24. pumpa (historic cast-iron salt brine wheel pump & stone trough)
  {
    const px = -44, py = CITY_Y, pz = 6.5;
    box('pumpa', '#b8b0a0', px, py + 0.35, pz, 2.8, 0.7, 1.8, 0, { solid: true });
    cyl('pumpa', '#2c6e68', px - 0.35, py + 1.45, pz, 0.36, 1.7, 0.36, { bleed: '#1c4a46' });
    add(TORUS, 'pumpa', '#244e4a', mat4(px - 0.35, py + 1.65, pz + 0.45, 0, 0, 0, [0.55, 0.55, 0.22]));
    box('pumpa', '#2c6e68', px + 0.45, py + 1.55, pz, 1.1, 0.18, 0.18, 0, { rz: -0.25 });
    box('pumpa', '#48c8d4', px + 0.85, py + 0.72, pz, 0.9, 0.12, 0.9, 0, { noOutline: true });
    addOrb('pumpa', V(px, py + 1.4, pz), 2.2, ['pumpa'], 'pumpa', V(px, py + 3.2, pz), {
      from: V(px + 4.8, py + 3.1, pz + 4.4), to: V(px + 3.0, py + 2.3, pz + 2.9), look: V(px, py + 1.3, pz),
    }, 1, 4.8);
  }

  // 25. bure (iron-hooped oak salt barrels stacked beside the old salt warehouse)
  {
    const bx = -46, by = CITY_Y, bz = -16;
    for (const [dx, dy, dz, rx] of [[0, 0.65, 0, 0], [1.15, 0.65, 0.35, 0], [-1.05, 0.65, 0.4, 0], [0.1, 1.75, 0.2, Math.PI / 2]]) {
      cyl('bure', '#9c6838', bx + dx, by + dy, bz + dz, 0.52, 1.25, 0.52, { rx, bleed: '#6e4620' });
      add(TORUS, 'bure', '#3a3e44', mat4(bx + dx, by + dy + (rx ? 0 : 0.32), bz + dz, 0, rx ? 0 : Math.PI / 2, 0, [0.53, 0.53, 0.14]));
    }
    addOrb('bure', V(bx, by + 1.1, bz), 2.3, ['bure'], 'bure', V(bx, by + 3.1, bz), {
      from: V(bx + 4.6, by + 3.0, bz + 4.6), to: V(bx + 3.0, by + 2.2, bz + 3.0), look: V(bx, by + 1.0, bz),
    }, 1, 4.8);
  }

  // 26. crna (shiny jet-black coal pile inside a wooden railway bunker)
  {
    const cx = -63.5, cy = CITY_Y, cz = -12;
    box('crna', '#8c6a46', cx, cy + 0.45, cz, 3.6, 0.9, 3.2, 0, { solid: true });
    for (const [dx, dy, dz, r] of [[0, 1.05, 0, 0.85], [-0.8, 0.92, 0.45, 0.62], [0.75, 0.90, -0.35, 0.65], [0.25, 1.42, 0.20, 0.52], [-0.45, 1.28, -0.4, 0.50]]) {
      sph('crna', '#1c2026', cx + dx, cy + dy, cz + dz, r, r * 0.78, r, { oct: true, bleed: '#0d0f12' });
    }
    addOrb('crna', V(cx, cy + 1.1, cz), 2.3, ['crna'], 'crna', V(cx, cy + 3.0, cz), {
      from: V(cx - 4.8, cy + 3.2, cz + 4.4), to: V(cx - 3.0, cy + 2.3, cz + 2.9), look: V(cx, cy + 1.1, cz),
    }, 1, 4.8);
  }

  // =========================================================================
  // ZONE 3: SONI TRG, KORZO PROMENADE & CITY LIFE (13)
  // =========================================================================

  // Decorative Korzo Austro-Hungarian townhouses & Tuzla mosque silhouette (props)
  buildHouse('props', -18, CITY_Y, -21, 9.5, 6.2, 6.8, '#f0d894', '#c85a3a', 0, { bleed: '#d6bc72' });
  buildHouse('props', -5, CITY_Y, -21.5, 10.5, 6.6, 6.8, '#ecc098', '#be4e32', 0, { bleed: '#d0a278' });
  buildHouse('props', 12, CITY_Y, -22, 9.5, 6.0, 6.5, '#f2e4c4', '#c45638', 0, { bleed: '#d4c6a4' });
  // Charming white mosque & slender minaret framing Soni trg on the east side
  {
    const mx = 21.5, my = CITY_Y, mz = -4.5;
    box('props', '#f6f2e8', mx, my + 2.8, mz, 7.0, 5.6, 7.0, 0, { bleed: '#ddd6c6', solid: true, wall: true });
    sph('props', '#6e7c88', mx, my + 5.7, mz, 3.3, 2.2, 3.3, { bleed: '#4c5864' });
    cyl('props', '#faf7f0', mx + 3.8, my + 6.4, mz + 3.2, 0.52, 12.8, 0.52, { solid: true });
    cyl('props', '#e4dcc8', mx + 3.8, my + 10.2, mz + 3.2, 0.85, 0.55, 0.85);
    cone('props', '#586672', mx + 3.8, my + 14.3, mz + 3.2, 0.56, 3.2);
  }
  // Decorative Soni trg fountain (props) at (0, CITY_Y, -6) — compass sits cleanly just north of it or right in front
  {
    const fx = 0, fy = CITY_Y, fz = -9.5;
    cyl('props', '#dfd6c4', fx, fy + 0.4, fz, 2.6, 0.8, 2.6, { solid: true });
    cyl('props', '#4cc4d4', fx, fy + 0.78, fz, 2.25, 0.14, 2.25, { pat: PAT.water, noOutline: true });
    cyl('props', '#e6dfd0', fx, fy + 1.5, fz, 0.42, 1.5, 0.42);
    cyl('props', '#e6dfd0', fx, fy + 2.25, fz, 1.05, 0.22, 1.05);
  }

  // 27. taksi (bright yellow Tuzla taxi car with rooftop TAXI sign)
  {
    const tx = -20, ty = CITY_Y, tz = 4.5;
    box('taksi', '#f6c224', tx, ty + 0.65, tz, 4.0, 0.85, 1.85, 0.15, { bleed: '#cc9812', solid: true, wall: true });
    box('taksi', '#f6c224', tx - 0.15, ty + 1.32, tz, 2.1, 0.65, 1.62, 0.15, { bleed: '#cc9812' });
    box('taksi', '#507290', tx - 0.15, ty + 1.32, tz, 1.9, 0.48, 1.66, 0.15, { noOutline: true });
    box('taksi', '#fff8d4', tx - 0.15, ty + 1.78, tz, 0.65, 0.24, 0.34, 0.15);
    for (const dx of [-1.25, 1.25]) for (const dz of [-0.90, 0.90]) {
      cyl('taksi', '#262a30', tx + dx, ty + 0.35, tz + dz, 0.35, 0.22, 0.35, { rx: Math.PI / 2 });
    }
    addOrb('taksi', V(tx, ty + 1.2, tz), 2.8, ['taksi'], 'taksi', V(tx, ty + 3.2, tz), {
      from: V(tx + 5.2, ty + 3.2, tz + 4.8), to: V(tx + 3.4, ty + 2.3, tz + 3.2), look: V(tx, ty + 1.1, tz),
    }, 1, 5.2);
  }

  // 28. kombi (boxy cream-white delivery van with blue side stripe)
  {
    const vx = -24.5, vy = CITY_Y, vz = -8.5;
    box('kombi', '#f4f2ec', vx, vy + 1.15, vz, 2.05, 1.75, 4.5, 0, { bleed: '#d4d0c4', solid: true, wall: true });
    box('kombi', '#2e74b4', vx, vy + 0.85, vz, 2.09, 0.32, 4.52, 0, { noOutline: true });
    box('kombi', '#4a6c8c', vx, vy + 1.48, vz + 2.24, 1.72, 0.62, 0.10, 0, { noOutline: true });
    for (const dz of [-1.35, 1.35]) for (const dx of [-1.0, 1.0]) {
      cyl('kombi', '#262a30', vx + dx, vy + 0.36, vz + dz, 0.36, 0.22, 0.36, { rz: Math.PI / 2 });
    }
    addOrb('kombi', V(vx, vy + 1.3, vz), 3.0, ['kombi'], 'kombi', V(vx, vy + 3.4, vz), {
      from: V(vx + 5.6, vy + 3.4, vz + 4.5), to: V(vx + 3.8, vy + 2.4, vz + 3.0), look: V(vx, vy + 1.2, vz),
    }, 1, 5.2);
  }

  // 29. motor (sleek red motorcycle parked along Korzo)
  {
    const mx = -14.5, my = CITY_Y, mz = -2.2;
    for (const dx of [-0.72, 0.72]) add(TORUS, 'motor', '#262a30', mat4(mx + dx, my + 0.40, mz, 0, 0, 0, [0.36, 0.36, 0.32]));
    box('motor', '#d63228', mx, my + 0.86, mz, 1.25, 0.38, 0.42, 0, { bleed: '#9e1c16' });
    box('motor', '#2a2e34', mx - 0.25, my + 1.05, mz, 0.65, 0.16, 0.38, 0);
    cyl('motor', '#9aa4ae', mx + 0.55, my + 0.92, mz, 0.05, 0.95, 0.05, { rz: 0.35 });
    box('motor', '#343a40', mx + 0.42, my + 1.32, mz, 0.08, 0.08, 0.72, 0);
    addOrb('motor', V(mx, my + 0.9, mz), 1.9, ['motor'], 'motor', V(mx, my + 2.7, mz), {
      from: V(mx + 3.4, my + 2.6, mz + 4.0), to: V(mx + 2.2, my + 1.9, mz + 2.6), look: V(mx, my + 0.85, mz),
    }, 1, 4.4);
  }

  // 30. kofer (travel suitcase with telescopic handle standing beside the taxi stand)
  {
    const kx = -16.5, ky = CITY_Y, kz = 6.8;
    box('kofer', '#28869c', kx, ky + 0.62, kz, 0.88, 1.05, 0.42, 0.3, { bleed: '#1a5c6e', solid: true });
    box('kofer', '#d89c46', kx, ky + 0.62, kz, 0.92, 0.16, 0.46, 0.3);
    for (const dx of [-0.22, 0.22]) cyl('kofer', '#7a828a', kx + dx, ky + 1.42, kz, 0.035, 0.58, 0.035);
    box('kofer', '#2e3238', kx, ky + 1.72, kz, 0.54, 0.09, 0.09, 0.3);
    addOrb('kofer', V(kx, ky + 0.9, kz), 1.6, ['kofer'], 'kofer', V(kx, ky + 2.6, kz), {
      from: V(kx + 3.5, ky + 2.6, kz + 3.4), to: V(kx + 2.2, ky + 1.9, kz + 2.2), look: V(kx, ky + 0.9, kz),
    }, 1, 4.3);
  }

  // 31. sanducic (bright yellow Bosnian post letterbox on a dark-iron post)
  {
    const sx = -10, sy = CITY_Y, sz = 4.5;
    cyl('sanducic', '#32383e', sx, sy + 0.72, sz, 0.09, 1.44, 0.09, { solid: true });
    box('sanducic', '#f4c222', sx, sy + 1.62, sz, 0.64, 0.88, 0.48, 0, { bleed: '#c89610' });
    box('sanducic', '#2c3238', sx, sy + 1.88, sz + 0.25, 0.44, 0.08, 0.06, 0, { noOutline: true });
    box('sanducic', '#244e98', sx, sy + 1.44, sz + 0.25, 0.40, 0.22, 0.04, 0, { noOutline: true });
    addOrb('sanducic', V(sx, sy + 1.5, sz), 1.6, ['sanducic'], 'sanducic', V(sx, sy + 3.0, sz), {
      from: V(sx + 3.2, sy + 2.8, sz + 3.8), to: V(sx + 2.0, sy + 2.1, sz + 2.4), look: V(sx, sy + 1.5, sz),
    }, 1, 4.3);
  }

  // 32. karta (colourful Tuzla town map board on twin wooden posts)
  {
    const kx = -2, ky = CITY_Y, kz = 4.5;
    for (const dx of [-1.05, 1.05]) cyl('karta', '#6e4c30', kx + dx, ky + 1.25, kz, 0.09, 2.5, 0.09);
    box('karta', '#6e4c30', kx, ky + 1.72, kz, 2.45, 1.65, 0.16, 0, { solid: true });
    box('karta', '#f6efd8', kx, ky + 1.72, kz + 0.09, 2.15, 1.38, 0.04, 0, { noOutline: true });
    // Mini turquoise lakes & green hills painted on the map board
    box('karta', '#34c0cc', kx - 0.35, ky + 1.42, kz + 0.12, 0.85, 0.36, 0.03, 0, { noOutline: true });
    box('karta', '#6ea858', kx + 0.25, ky + 2.02, kz + 0.12, 1.15, 0.42, 0.03, 0, { noOutline: true });
    box('karta', '#d84434', kx + 0.10, ky + 1.72, kz + 0.13, 0.16, 0.16, 0.03, 0, { noOutline: true });
    addOrb('karta', V(kx, ky + 1.7, kz), 2.1, ['karta'], 'karta', V(kx, ky + 3.4, kz), {
      from: V(kx + 2.6, ky + 2.9, kz + 4.8), to: V(kx + 1.5, ky + 2.2, kz + 3.2), look: V(kx, ky + 1.7, kz),
    }, 1, 4.6);
  }

  // 33. kompas (decorative brass-and-stone compass rose medallion on Soni trg)
  {
    const cx = 0, cy = CITY_Y, cz = -2.2;
    cyl('kompas', '#d6c8a8', cx, cy + 0.22, cz, 1.85, 0.44, 1.85, { bleed: '#b2a282', solid: true });
    add(TORUS, 'kompas', '#c89a2c', mat4(cx, cy + 0.46, cz, 0, Math.PI / 2, 0, [1.55, 1.55, 0.24]));
    // 4-point brass star + red north needle
    box('kompas', '#d8362a', cx, cy + 0.56, cz - 0.52, 0.28, 0.10, 1.15, 0);
    box('kompas', '#2e5888', cx, cy + 0.56, cz + 0.52, 0.28, 0.10, 1.15, 0);
    box('kompas', '#d8aa38', cx, cy + 0.52, cz, 2.2, 0.08, 0.24, 0);
    cyl('kompas', '#e4b838', cx, cy + 0.64, cz, 0.24, 0.18, 0.24);
    addOrb('kompas', V(cx, cy + 0.6, cz), 2.2, ['kompas'], 'kompas', V(cx, cy + 2.6, cz), {
      from: V(cx + 3.8, cy + 3.8, cz + 3.8), to: V(cx + 2.4, cy + 2.7, cz + 2.5), look: V(cx, cy + 0.55, cz),
    }, 1, 4.8);
  }

  // 34. kljuc (giant ceremonial golden Key of Tuzla mounted on an arched stone gate)
  {
    const kx = 10.5, ky = CITY_Y, kz = 2.5;
    for (const dx of [-1.7, 1.7]) box('kljuc', '#dcd2be', kx + dx, ky + 2.0, kz, 0.75, 4.0, 0.75, 0, { solid: true, wall: true });
    box('kljuc', '#dcd2be', kx, ky + 4.15, kz, 4.4, 0.72, 0.85, 0, { solid: true });
    // Golden ceremonial key floating/mounted horizontally across the arch
    add(TORUS, 'kljuc', '#f0bd30', mat4(kx - 0.95, ky + 3.2, kz, 0, 0, 0, [0.52, 0.52, 0.28]), { bleed: '#be8c14' });
    box('kljuc', '#f0bd30', kx + 0.35, ky + 3.2, kz, 1.85, 0.18, 0.18, 0, { bleed: '#be8c14' });
    box('kljuc', '#f0bd30', kx + 0.95, ky + 2.92, kz, 0.18, 0.42, 0.16, 0);
    box('kljuc', '#f0bd30', kx + 1.22, ky + 2.96, kz, 0.16, 0.34, 0.16, 0);
    addOrb('kljuc', V(kx, ky + 3.0, kz), 2.8, ['kljuc'], 'kljuc', V(kx, ky + 5.2, kz), {
      from: V(kx + 3.2, ky + 4.4, kz + 5.6), to: V(kx + 2.0, ky + 3.6, kz + 3.8), look: V(kx, ky + 3.0, kz),
    }, 1, 5.2);
  }

  // 35. sapun (artisan wooden stall with pastel bars of handmade Tuzla salt soap)
  {
    const sx = 9.0, sy = CITY_Y, sz = -10.5;
    box('sapun', '#a67b4c', sx, sy + 0.55, sz, 2.8, 1.1, 1.3, 0, { bleed: '#7a5430', solid: true });
    const cols = ['#f2a6b8', '#a6dcd2', '#f4dc8c', '#c8a8e4', '#faf6ec'];
    for (let i = 0; i < 5; i++) {
      box('sapun', cols[i], sx - 0.96 + i * 0.48, sy + 1.24, sz, 0.38, 0.24, 0.62, 0.08 * (i - 2));
      box('sapun', cols[(i + 2) % 5], sx - 0.72 + i * 0.36, sy + 1.46, sz - 0.15, 0.34, 0.22, 0.50, -0.06);
    }
    addOrb('sapun', V(sx, sy + 1.25, sz), 1.9, ['sapun'], 'sapun', V(sx, sy + 2.9, sz), {
      from: V(sx + 3.8, sy + 2.9, sz + 3.6), to: V(sx + 2.4, sy + 2.1, sz + 2.4), look: V(sx, sy + 1.25, sz),
    }, 1, 4.5);
  }

  // 36. ogledalo (tall silver-framed standing boutique mirror on Korzo)
  {
    const ox = -6.5, oy = CITY_Y, oz = -15.5;
    box('ogledalo', '#c4a046', ox, oy + 1.35, oz, 1.35, 2.35, 0.18, 0.15, { bleed: '#947428', solid: true });
    box('ogledalo', '#c8e8f4', ox, oy + 1.35, oz + 0.08, 1.08, 2.05, 0.06, 0.15, { bleed: '#8ac2d8', noOutline: true });
    box('ogledalo', '#ffffff', ox - 0.24, oy + 1.72, oz + 0.12, 0.12, 0.95, 0.02, 0.15, { rz: -0.45, noOutline: true });
    addOrb('ogledalo', V(ox, oy + 1.4, oz), 2.0, ['ogledalo'], 'ogledalo', V(ox, oy + 3.2, oz), {
      from: V(ox + 3.4, oy + 2.8, oz + 4.2), to: V(ox + 2.1, oy + 2.1, oz + 2.8), look: V(ox, oy + 1.4, oz),
    }, 1, 4.5);
  }

  // 37. patike (crisp white-and-blue sneakers displayed on a shop pedestal)
  {
    const px = 2.0, py = CITY_Y, pz = -16.2;
    box('patike', '#ded6c6', px, py + 0.52, pz, 1.7, 1.04, 1.1, 0, { solid: true });
    for (const [dx, ry] of [[-0.36, 0.22], [0.38, -0.25]]) {
      box('patike', '#fafaf6', px + dx, py + 1.16, pz, 0.34, 0.16, 0.78, ry);
      box('patike', '#2e74c4', px + dx, py + 1.34, pz - 0.06, 0.32, 0.26, 0.62, ry, { bleed: '#1c4e8a' });
      box('patike', '#f24a38', px + dx, py + 1.34, pz + 0.08, 0.34, 0.08, 0.24, ry, { noOutline: true });
    }
    addOrb('patike', V(px, py + 1.25, pz), 1.6, ['patike'], 'patike', V(px, py + 2.8, pz), {
      from: V(px + 3.2, py + 2.7, pz + 3.4), to: V(px + 2.0, py + 2.0, pz + 2.2), look: V(px, py + 1.25, pz),
    }, 1, 4.3);
  }

  // 38. majica (sunny turquoise-coral summer T-shirt on a boutique display rack)
  {
    const mx = 11.5, my = CITY_Y, mz = -16.2;
    for (const dx of [-0.95, 0.95]) cyl('majica', '#5a6066', mx + dx, my + 1.1, mz, 0.05, 2.2, 0.05);
    cyl('majica', '#5a6066', mx, my + 2.15, mz, 0.05, 2.0, 0.05, { rz: Math.PI / 2 });
    // T-shirt torso & sleeves
    box('majica', '#2cb8b4', mx, my + 1.48, mz, 0.96, 1.15, 0.20, 0, { bleed: '#1c8682' });
    box('majica', '#2cb8b4', mx - 0.65, my + 1.82, mz, 0.44, 0.38, 0.20, 0, { rz: 0.42 });
    box('majica', '#2cb8b4', mx + 0.65, my + 1.82, mz, 0.44, 0.38, 0.20, 0, { rz: -0.42 });
    box('majica', '#f6c838', mx, my + 1.56, mz + 0.11, 0.56, 0.22, 0.04, 0, { noOutline: true });
    addOrb('majica', V(mx, my + 1.55, mz), 1.9, ['majica'], 'majica', V(mx, my + 3.2, mz), {
      from: V(mx + 3.2, my + 2.8, mz + 3.9), to: V(mx + 2.0, my + 2.1, mz + 2.6), look: V(mx, my + 1.55, mz),
    }, 1, 4.4);
  }

  // 39. haljina (flowing rose-red summer dress on a boutique display mannequin)
  {
    const hx = 17.5, hy = CITY_Y, hz = -13.5;
    cyl('haljina', '#6e4e34', hx, hy + 0.45, hz, 0.38, 0.9, 0.38, { solid: true });
    cone('haljina', '#e04e72', hx, hy + 1.25, hz, 0.72, 1.15, { bleed: '#ad2e50' });
    box('haljina', '#e04e72', hx, hy + 1.98, hz, 0.54, 0.65, 0.32, 0, { bleed: '#ad2e50' });
    box('haljina', '#f6d244', hx, hy + 1.66, hz, 0.58, 0.12, 0.36, 0);
    addOrb('haljina', V(hx, hy + 1.5, hz), 1.8, ['haljina'], 'haljina', V(hx, hy + 3.1, hz), {
      from: V(hx - 3.6, hy + 2.8, hz + 3.6), to: V(hx - 2.3, hy + 2.1, hz + 2.4), look: V(hx, hy + 1.45, hz),
    }, 1, 4.4);
  }

  // =========================================================================
  // ZONE 4: UNIVERSITY, SCIENCE & SEVDAH MUSIC QUARTER (12)
  // =========================================================================

  // 40. univerzitet (grand neo-classical University of Tuzla hall with white columns & pediment)
  {
    const ux = 48, uy = CITY_Y, uz = -16;
    box('univerzitet', '#eee0bc', ux, uy + 4.0, uz, 15.0, 8.0, 9.0, 0, { bleed: '#cfc096', pat: PAT.blocks, ps: 0.45, solid: true, wall: true });
    add(gableRoof(15.6, 9.6, 2.8), 'univerzitet', '#b84c34', mat4(ux, uy + 8.0, uz), { bleed: '#8c3420' });
    // Portico columns & wide stone steps facing south (+z)
    box('univerzitet', '#dcd4c4', ux, uy + 0.35, uz + 5.6, 9.6, 0.7, 2.6, 0, { solid: true });
    for (let i = -2; i <= 2; i++) {
      cyl('univerzitet', '#faf7f0', ux + i * 1.9, uy + 3.8, uz + 5.2, 0.32, 6.4, 0.32);
    }
    box('univerzitet', '#faf7f0', ux, uy + 7.2, uz + 5.2, 9.6, 0.75, 1.8, 0);
    add(gableRoof(9.8, 1.9, 1.8), 'univerzitet', '#e8dec8', mat4(ux, uy + 7.55, uz + 5.2));
    addOrb('univerzitet', V(ux, uy + 4.6, uz + 2.0), 7.2, ['univerzitet'], 'univerzitet', V(ux, uy + 9.4, uz + 5.0), {
      from: V(ux - 11.5, uy + 8.8, uz + 16.5), to: V(ux - 7.8, uy + 7.0, uz + 13.0), look: V(ux, uy + 4.4, uz + 2.0),
    }, 1, 7.6);
  }

  // 41. student (animated university student carrying notebooks) -> person kind 'tuzStudent'
  addOrb('student', V(41, CITY_Y + 1.1, -6.5), 1.9, ['student'], 'student', V(41, CITY_Y + 3.0, -6.5), {
    from: V(36.5, CITY_Y + 2.8, -2.5), to: V(38.0, CITY_Y + 2.1, -4.0), look: V(41, CITY_Y + 1.1, -6.5),
  }, 1, 4.6);

  // 42. tabla (outdoor green lecture chalkboard on an A-frame easel)
  {
    const tx = 32.5, ty = CITY_Y, tz = -11;
    for (const dx of [-1.15, 1.15]) cyl('tabla', '#8a623c', tx + dx, ty + 1.3, tz, 0.08, 2.6, 0.08);
    box('tabla', '#8a623c', tx, ty + 1.85, tz, 2.65, 1.75, 0.16, 0.25, { solid: true });
    box('tabla', '#26563c', tx, ty + 1.85, tz + 0.08, 2.38, 1.48, 0.05, 0.25, { bleed: '#183a26', noOutline: true });
    // White chalk writing lines
    box('tabla', '#faf8f0', tx - 0.35, ty + 2.15, tz + 0.11, 1.2, 0.08, 0.02, 0.25, { noOutline: true });
    box('tabla', '#faf8f0', tx - 0.15, ty + 1.85, tz + 0.11, 1.5, 0.08, 0.02, 0.25, { noOutline: true });
    addOrb('tabla', V(tx, ty + 1.8, tz), 2.2, ['tabla'], 'tabla', V(tx, ty + 3.5, tz), {
      from: V(tx + 3.4, ty + 2.9, tz + 4.4), to: V(tx + 2.1, ty + 2.2, tz + 3.0), look: V(tx, ty + 1.8, tz),
    }, 1, 4.6);
  }

  // 43. kreda (colourful sticks of lecture chalk displayed on a campus table)
  {
    const kx = 30.5, ky = CITY_Y, kz = -4.5;
    box('kreda', '#a0764a', kx, ky + 0.52, kz, 1.8, 1.04, 1.1, 0, { solid: true });
    const cols = ['#ffffff', '#f8dc62', '#f4a2b4', '#92d8ec', '#ffffff'];
    for (let i = 0; i < 5; i++) {
      cyl('kreda', cols[i], kx - 0.56 + i * 0.28, ky + 1.12, kz + (i % 2) * 0.10, 0.08, 0.62, 0.08, { rx: Math.PI / 2, ry: 0.12 * (i - 2) });
    }
    addOrb('kreda', V(kx, ky + 1.15, kz), 1.6, ['kreda'], 'kreda', V(kx, ky + 2.7, kz), {
      from: V(kx + 3.2, ky + 2.6, kz + 3.2), to: V(kx + 2.0, ky + 1.9, kz + 2.1), look: V(kx, ky + 1.15, kz),
    }, 1, 4.3);
  }

  // 44. globus (blue-and-green terrestrial globe on a brass stand)
  {
    const gx = 37.5, gy = CITY_Y, gz = -14.5;
    box('globus', '#8e6640', gx, gy + 0.52, gz, 1.5, 1.04, 1.5, 0, { solid: true });
    cyl('globus', '#c89c32', gx, gy + 1.18, gz, 0.36, 0.26, 0.36);
    add(TORUS, 'globus', '#d4a638', mat4(gx, gy + 1.78, gz, 0, 0, 0.35, [0.68, 0.68, 0.14]));
    sph('globus', '#2c84c8', gx, gy + 1.78, gz, 0.54, 0.54, 0.54, { bleed: '#1c5c94' });
    sph('globus', '#5ca64e', gx + 0.24, gy + 1.92, gz + 0.36, 0.26, 0.20, 0.18, { noOutline: true });
    sph('globus', '#5ca64e', gx - 0.28, gy + 1.64, gz + 0.34, 0.22, 0.26, 0.18, { noOutline: true });
    addOrb('globus', V(gx, gy + 1.7, gz), 1.8, ['globus'], 'globus', V(gx, gy + 3.2, gz), {
      from: V(gx - 3.6, gy + 2.9, gz + 3.6), to: V(gx - 2.3, gy + 2.2, gz + 2.4), look: V(gx, gy + 1.7, gz),
    }, 1, 4.4);
  }

  // 45. mikroskop (brass-and-white laboratory microscope on a campus science desk)
  {
    const mx = 54.5, my = CITY_Y, mz = -6.0;
    box('mikroskop', '#9c7246', mx, my + 0.52, mz, 1.7, 1.04, 1.2, 0, { solid: true });
    box('mikroskop', '#2e343c', mx, my + 1.14, mz, 0.68, 0.16, 0.56, 0);
    cyl('mikroskop', '#e8eef2', mx - 0.18, my + 1.56, mz, 0.10, 0.85, 0.10, { rz: -0.22 });
    cyl('mikroskop', '#d4a638', mx + 0.14, my + 1.92, mz, 0.13, 0.95, 0.13, { rz: 0.38, bleed: '#a0781c' });
    box('mikroskop', '#2e343c', mx + 0.08, my + 1.44, mz, 0.52, 0.08, 0.44, 0);
    addOrb('mikroskop', V(mx, my + 1.55, mz), 1.8, ['mikroskop'], 'mikroskop', V(mx, my + 3.1, mz), {
      from: V(mx + 3.4, my + 2.8, mz + 3.6), to: V(mx + 2.2, my + 2.1, mz + 2.4), look: V(mx, my + 1.55, mz),
    }, 1, 4.4);
  }

  // 46. olovka (giant sunny yellow wooden pencil resting on an outdoor study desk)
  {
    const ox = 52.5, oy = CITY_Y, oz = -0.5;
    box('olovka', '#a67a4c', ox, oy + 0.52, oz, 2.2, 1.04, 1.1, 0, { solid: true });
    cyl('olovka', '#f4c028', ox, oy + 1.18, oz, 0.13, 1.45, 0.13, { hex: true, rz: Math.PI / 2, bleed: '#c89212' });
    cone('olovka', '#e8cfa0', ox + 0.92, oy + 1.18, oz, 0.13, 0.40, { rz: -Math.PI / 2 });
    cone('olovka', '#2a2e34', ox + 1.12, oy + 1.18, oz, 0.05, 0.14, { rz: -Math.PI / 2 });
    cyl('olovka', '#e88094', ox - 0.84, oy + 1.18, oz, 0.13, 0.24, 0.13, { rz: Math.PI / 2 });
    addOrb('olovka', V(ox, oy + 1.2, oz), 1.8, ['olovka'], 'olovka', V(ox, oy + 2.8, oz), {
      from: V(ox + 3.4, oy + 2.8, oz + 3.6), to: V(ox + 2.1, oy + 2.0, oz + 2.3), look: V(ox, oy + 1.2, oz),
    }, 1, 4.4);
  }

  // 47. sveska (open spiral lined notebook resting on a campus stone bench)
  {
    const sx = 58.5, sy = CITY_Y, sz = -10.0;
    box('sveska', '#d4ccb8', sx, sy + 0.45, sz, 2.4, 0.90, 1.2, 0, { solid: true });
    box('sveska', '#2c6eb4', sx, sy + 0.96, sz, 1.56, 0.08, 0.98, 0.15, { bleed: '#1c4c82' });
    box('sveska', '#fbf8ee', sx - 0.36, sy + 1.02, sz, 0.68, 0.07, 0.88, 0.15, { noOutline: true });
    box('sveska', '#fbf8ee', sx + 0.36, sy + 1.02, sz, 0.68, 0.07, 0.88, 0.15, { noOutline: true });
    for (let i = -3; i <= 3; i++) {
      add(TORUS, 'sveska', '#5a6068', mat4(sx, sy + 1.06, sz + i * 0.12, 0, 0, 0, [0.06, 0.06, 0.12]));
    }
    addOrb('sveska', V(sx, sy + 1.05, sz), 1.7, ['sveska'], 'sveska', V(sx, sy + 2.6, sz), {
      from: V(sx + 3.4, sy + 2.9, sz + 3.4), to: V(sx + 2.1, sy + 2.1, sz + 2.2), look: V(sx, sy + 1.05, sz),
    }, 1, 4.4);
  }

  // Music pavilion (props) at (44, CITY_Y, 8) framing harmonika, klavir, flauta, pjesma
  {
    const px = 44, py = CITY_Y, pz = 8;
    cyl('props', '#e4dcc8', px, py + 0.25, pz, 4.8, 0.5, 4.8, { solid: true });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      cyl('props', '#faf6ec', px + Math.cos(a) * 4.2, py + 2.25, pz + Math.sin(a) * 4.2, 0.14, 3.8, 0.14);
    }
    cone('props', '#3c7a6e', px, py + 5.0, pz, 5.2, 1.9, { bleed: '#28564c' });
  }

  // 48. harmonika (sevdah accordionist seated beside the music pavilion) -> person kind 'tuzAccordion'
  addOrb('harmonika', V(36, CITY_Y + 1.1, 6.5), 1.9, ['harmonika'], 'harmonika', V(36, CITY_Y + 3.0, 6.5), {
    from: V(31.5, CITY_Y + 2.7, 10.2), to: V(33.2, CITY_Y + 2.0, 8.8), look: V(36, CITY_Y + 1.1, 6.5),
  }, 1, 4.6);

  // 49. klavir (glossy black grand piano inside the music pavilion + seated pianist)
  {
    const px = 44, py = CITY_Y + 0.5, pz = 8;
    box('klavir', '#1e2228', px, py + 0.92, pz, 2.2, 0.44, 1.65, 0, { bleed: '#0e1014', solid: true });
    box('klavir', '#1e2228', px + 0.55, py + 1.48, pz - 0.1, 2.0, 0.10, 1.55, 0, { rz: 0.46 });
    box('klavir', '#faf8f2', px, py + 0.88, pz + 0.84, 1.85, 0.14, 0.36, 0, { noOutline: true });
    for (const [dx, dz] of [[-0.9, -0.6], [0.9, -0.6], [-0.9, 0.6], [0.9, 0.6]]) {
      cyl('klavir', '#1e2228', px + dx, py + 0.42, pz + dz, 0.08, 0.84, 0.08);
    }
    addOrb('klavir', V(px, py + 1.1, pz), 2.4, ['klavir'], 'klavir', V(px, py + 3.0, pz + 1.6), {
      from: V(px - 4.8, py + 2.9, pz + 5.6), to: V(px - 3.0, py + 2.2, pz + 4.0), look: V(px, py + 1.1, pz),
    }, 1, 5.0);
  }

  // 50. flauta (flutist standing by the east side of the pavilion) -> person kind 'tuzFlute'
  addOrb('flauta', V(50.5, CITY_Y + 1.2, 12.0), 1.9, ['flauta'], 'flauta', V(50.5, CITY_Y + 3.1, 12.0), {
    from: V(54.8, CITY_Y + 2.8, 15.8), to: V(53.0, CITY_Y + 2.1, 14.2), look: V(50.5, CITY_Y + 1.2, 12.0),
  }, 1, 4.6);

  // 51. pjesma (singer with floating golden musical notes) -> person kind 'tuzSing'
  addOrb('pjesma', V(38.5, CITY_Y + 1.5, 14.5), 2.1, ['pjesma'], 'pjesma', V(38.5, CITY_Y + 3.4, 14.5), {
    from: V(34.2, CITY_Y + 3.1, 18.4), to: V(35.8, CITY_Y + 2.4, 16.8), look: V(38.5, CITY_Y + 1.5, 14.5),
  }, 1, 4.8);

  // =========================================================================
  // ZONE 5: TUZLA MARKET, BAKERY & FRESH PRODUCE (13)
  // =========================================================================

  // Row A (z = -34, facing south +z): kifla, pereca, pekmez, limun, narandza, breskva, kruska
  // 52. kifla (warm crescent bakery rolls in a wicker basket)
  {
    const x = -32, y = CITY_Y, z = -34;
    addMarketStall('kifla', x, z, '#d8683a');
    cyl('kifla', '#c69858', x, y + 1.24, z + 0.1, 0.72, 0.34, 0.62);
    for (const [dx, dz, ry] of [[-0.25, 0.1, 0.2], [0.22, -0.05, -0.3], [0, 0.22, 0.8]]) {
      add(TORUS, 'kifla', '#e4a246', mat4(x + dx, y + 1.48, z + dz, ry, Math.PI / 2, 0, [0.24, 0.24, 0.35]), { bleed: '#b8761e' });
    }
    addOrb('kifla', V(x, y + 1.4, z), 2.2, ['kifla'], 'kifla', V(x, y + 3.4, z + 1.1), {
      from: V(x + 2.4, y + 2.6, z + 4.4), to: V(x + 1.4, y + 2.0, z + 3.0), look: V(x, y + 1.35, z),
    }, 1, 4.6);
  }

  // 53. pereca (golden twisted salt pretzels)
  {
    const x = -24, y = CITY_Y, z = -34;
    addMarketStall('pereca', x, z, '#e08434');
    box('pereca', '#d8b478', x, y + 1.18, z + 0.1, 1.6, 0.12, 0.9, 0);
    for (const dx of [-0.45, 0.05, 0.52]) {
      add(TORUS, 'pereca', '#c87228', mat4(x + dx, y + 1.38, z + 0.1, 0, Math.PI / 2, 0, [0.26, 0.26, 0.30]), { bleed: '#8f4c14' });
      sph('pereca', '#ffffff', x + dx + 0.08, y + 1.48, z + 0.14, 0.05, 0.05, 0.05, { noOutline: true });
    }
    addOrb('pereca', V(x, y + 1.4, z), 2.2, ['pereca'], 'pereca', V(x, y + 3.4, z + 1.1), {
      from: V(x + 2.4, y + 2.6, z + 4.4), to: V(x + 1.4, y + 2.0, z + 3.0), look: V(x, y + 1.35, z),
    }, 1, 4.6);
  }

  // 54. pekmez (glass jars of thick purple Bosnian plum jam)
  {
    const x = -16, y = CITY_Y, z = -34;
    addMarketStall('pekmez', x, z, '#984688');
    for (const [dx, dz] of [[-0.55, 0.1], [0, -0.05], [0.55, 0.12], [-0.28, -0.28], [0.28, -0.25]]) {
      cyl('pekmez', '#68245c', x + dx, y + 1.36, z + dz, 0.20, 0.50, 0.20, { bleed: '#44123c' });
      cyl('pekmez', '#e85442', x + dx, y + 1.64, z + dz, 0.22, 0.10, 0.22);
    }
    addOrb('pekmez', V(x, y + 1.4, z), 2.2, ['pekmez'], 'pekmez', V(x, y + 3.4, z + 1.1), {
      from: V(x + 2.4, y + 2.6, z + 4.4), to: V(x + 1.4, y + 2.0, z + 3.0), look: V(x, y + 1.4, z),
    }, 1, 4.6);
  }

  // 55. limun (bright yellow lemons heaped in a slatted crate)
  {
    const x = -8, y = CITY_Y, z = -34;
    addMarketStall('limun', x, z, '#e6b824');
    box('limun', '#a87c4a', x, y + 1.24, z + 0.1, 1.5, 0.30, 0.9, 0);
    for (const [dx, dy, dz] of [[-0.4, 1.44, 0.1], [0, 1.46, 0.1], [0.4, 1.44, 0.1], [-0.2, 1.56, -0.05], [0.2, 1.56, -0.05], [0, 1.68, 0.05]]) {
      sph('limun', '#f8e238', x + dx, y + dy, z + dz, 0.22, 0.16, 0.16, { bleed: '#d0b618' });
    }
    addOrb('limun', V(x, y + 1.45, z), 2.2, ['limun'], 'limun', V(x, y + 3.4, z + 1.1), {
      from: V(x + 2.4, y + 2.6, z + 4.4), to: V(x + 1.4, y + 2.0, z + 3.0), look: V(x, y + 1.45, z),
    }, 1, 4.6);
  }

  // 56. narandza (round bright-orange oranges stacked on the stall)
  {
    const x = 0, y = CITY_Y, z = -34;
    addMarketStall('narandza', x, z, '#ea7222');
    box('narandza', '#a87c4a', x, y + 1.24, z + 0.1, 1.5, 0.30, 0.9, 0);
    for (const [dx, dy, dz] of [[-0.4, 1.46, 0.1], [0, 1.46, 0.1], [0.4, 1.46, 0.1], [-0.2, 1.64, 0.05], [0.2, 1.64, 0.05], [0, 1.80, 0.05]]) {
      sph('narandza', '#f6821e', x + dx, y + dy, z + dz, 0.21, 0.21, 0.21, { bleed: '#c8580c' });
    }
    addOrb('narandza', V(x, y + 1.5, z), 2.2, ['narandza'], 'narandza', V(x, y + 3.4, z + 1.1), {
      from: V(x + 2.4, y + 2.6, z + 4.4), to: V(x + 1.4, y + 2.0, z + 3.0), look: V(x, y + 1.5, z),
    }, 1, 4.6);
  }

  // 57. breskva (velvety rosy-gold peaches in a shallow market bowl)
  {
    const x = 8, y = CITY_Y, z = -34;
    addMarketStall('breskva', x, z, '#e27462');
    cyl('breskva', '#c26c44', x, y + 1.22, z + 0.1, 0.72, 0.26, 0.72);
    for (const [dx, dy, dz] of [[-0.28, 1.42, 0.15], [0.26, 1.42, 0.15], [0, 1.42, -0.15], [0, 1.62, 0.06]]) {
      sph('breskva', '#f69e68', x + dx, y + dy, z + dz, 0.22, 0.21, 0.22, { bleed: '#d85c48' });
    }
    addOrb('breskva', V(x, y + 1.45, z), 2.2, ['breskva'], 'breskva', V(x, y + 3.4, z + 1.1), {
      from: V(x + 2.4, y + 2.6, z + 4.4), to: V(x + 1.4, y + 2.0, z + 3.0), look: V(x, y + 1.45, z),
    }, 1, 4.6);
  }

  // 58. kruska (bell-shaped yellow-green orchard pears)
  {
    const x = 16, y = CITY_Y, z = -34;
    addMarketStall('kruska', x, z, '#7ca83e');
    box('kruska', '#a87c4a', x, y + 1.24, z + 0.1, 1.5, 0.30, 0.9, 0);
    for (const [dx, dz] of [[-0.42, 0.12], [0, 0.08], [0.42, 0.12], [-0.2, -0.18], [0.2, -0.18]]) {
      sph('kruska', '#b6cc38', x + dx, y + 1.46, z + dz, 0.19, 0.20, 0.19, { bleed: '#889e1e' });
      cone('kruska', '#c4d648', x + dx, y + 1.68, z + dz, 0.14, 0.24);
    }
    addOrb('kruska', V(x, y + 1.48, z), 2.2, ['kruska'], 'kruska', V(x, y + 3.4, z + 1.1), {
      from: V(x + 2.4, y + 2.6, z + 4.4), to: V(x + 1.4, y + 2.0, z + 3.0), look: V(x, y + 1.48, z),
    }, 1, 4.6);
  }

  // Row B (z = -46, facing south +z): malina, dinja, kupus, krompir, grah, tikvica
  // 59. malina (ruby-red Bosnian raspberries in wooden punnets)
  {
    const x = -28, y = CITY_Y, z = -46;
    addMarketStall('malina', x, z, '#c83458');
    for (const dx of [-0.52, 0.52]) {
      box('malina', '#b88e58', x + dx, y + 1.24, z + 0.1, 0.78, 0.26, 0.68, 0);
      for (const [bx, bz] of [[-0.18, 0.12], [0.18, 0.12], [0, -0.12], [0, 0.05]]) {
        sph('malina', '#d62652', x + dx + bx, y + 1.46 + (bz === 0.05 ? 0.10 : 0), z + 0.1 + bz, 0.14, 0.15, 0.14, { bleed: '#981434' });
      }
    }
    addOrb('malina', V(x, y + 1.45, z), 2.2, ['malina'], 'malina', V(x, y + 3.4, z + 1.1), {
      from: V(x + 2.4, y + 2.6, z + 4.4), to: V(x + 1.4, y + 2.0, z + 3.0), look: V(x, y + 1.45, z),
    }, 1, 4.6);
  }

  // 60. dinja (round golden-skinned sweet summer melons)
  {
    const x = -18, y = CITY_Y, z = -46;
    addMarketStall('dinja', x, z, '#d8a634');
    for (const [dx, dy, dz] of [[-0.52, 1.38, 0.12], [0.52, 1.38, 0.12], [0, 1.38, -0.18], [0, 1.72, 0.06]]) {
      sph('dinja', '#eac248', x + dx, y + dy, z + dz, 0.34, 0.30, 0.34, { bleed: '#bc9222' });
    }
    addOrb('dinja', V(x, y + 1.5, z), 2.2, ['dinja'], 'dinja', V(x, y + 3.4, z + 1.1), {
      from: V(x + 2.4, y + 2.6, z + 4.4), to: V(x + 1.4, y + 2.0, z + 3.0), look: V(x, y + 1.5, z),
    }, 1, 4.6);
  }

  // 61. kupus (large round pale-green leafy cabbages stacked high)
  {
    const x = -8, y = CITY_Y, z = -46;
    addMarketStall('kupus', x, z, '#5a9c4e');
    for (const [dx, dy, dz] of [[-0.55, 1.38, 0.10], [0.05, 1.38, 0.12], [0.62, 1.38, 0.10], [-0.24, 1.72, 0.04], [0.32, 1.72, 0.04]]) {
      sph('kupus', '#8ec872', x + dx, y + dy, z + dz, 0.32, 0.30, 0.32, { ico: true, bleed: '#5a9444' });
    }
    addOrb('kupus', V(x, y + 1.5, z), 2.2, ['kupus'], 'kupus', V(x, y + 3.4, z + 1.1), {
      from: V(x + 2.4, y + 2.6, z + 4.4), to: V(x + 1.4, y + 2.0, z + 3.0), look: V(x, y + 1.5, z),
    }, 1, 4.6);
  }

  // 62. krompir (earthy golden potatoes spilling from a burlap sack)
  {
    const x = 2, y = CITY_Y, z = -46;
    addMarketStall('krompir', x, z, '#b48a4e');
    cyl('krompir', '#c8a874', x - 0.35, y + 1.42, z, 0.44, 0.68, 0.44, { rz: -0.25, bleed: '#987a4a' });
    for (const [dx, dy, dz] of [[0.25, 1.24, 0.15], [0.58, 1.24, -0.05], [0.42, 1.36, 0.10], [0.05, 1.52, 0.10], [-0.30, 1.78, 0]]) {
      sph('krompir', '#c89a56', x + dx, y + dy, z + dz, 0.20, 0.14, 0.16, { bleed: '#966c32' });
    }
    addOrb('krompir', V(x, y + 1.45, z), 2.2, ['krompir'], 'krompir', V(x, y + 3.4, z + 1.1), {
      from: V(x + 2.4, y + 2.6, z + 4.4), to: V(x + 1.4, y + 2.0, z + 3.0), look: V(x, y + 1.45, z),
    }, 1, 4.6);
  }

  // 63. grah (speckled dried beans in an open wooden tub with scoop)
  {
    const x = 12, y = CITY_Y, z = -46;
    addMarketStall('grah', x, z, '#a85a46');
    cyl('grah', '#8c623a', x, y + 1.38, z + 0.08, 0.62, 0.56, 0.62, { bleed: '#624224' });
    cyl('grah', '#e8dfd0', x, y + 1.66, z + 0.08, 0.54, 0.08, 0.54, { noOutline: true });
    for (const [dx, dz] of [[-0.22, 0.12], [0.16, 0.18], [-0.08, -0.14], [0.24, -0.08], [0, 0.04]]) {
      sph('grah', '#9c4a38', x + dx, y + 1.72, z + 0.08 + dz, 0.10, 0.07, 0.08);
    }
    addOrb('grah', V(x, y + 1.5, z), 2.2, ['grah'], 'grah', V(x, y + 3.4, z + 1.1), {
      from: V(x + 2.4, y + 2.6, z + 4.4), to: V(x + 1.4, y + 2.0, z + 3.0), look: V(x, y + 1.5, z),
    }, 1, 4.6);
  }

  // 64. tikvica (glossy dark-green courgettes / zucchinis neatly lined in a crate)
  {
    const x = 21, y = CITY_Y, z = -46;
    addMarketStall('tikvica', x, z, '#367e46');
    box('tikvica', '#a87c4a', x, y + 1.24, z + 0.1, 1.6, 0.28, 0.92, 0);
    for (let i = -2; i <= 2; i++) {
      cyl('tikvica', '#2c7a3e', x + i * 0.28, y + 1.42, z + 0.1, 0.11, 0.74, 0.11, { rx: Math.PI / 2, bleed: '#1c5228' });
    }
    addOrb('tikvica', V(x, y + 1.45, z), 2.2, ['tikvica'], 'tikvica', V(x, y + 3.4, z + 1.1), {
      from: V(x + 2.4, y + 2.6, z + 4.4), to: V(x + 1.4, y + 2.0, z + 3.0), look: V(x, y + 1.45, z),
    }, 1, 4.6);
  }

  // =========================================================================
  // ZONE 6: SLANA BANJA HILLTOP PARK, OBSERVATORY & WILDLIFE (11)
  // =========================================================================

  // 65. teleskop (long white-and-brass telescope on a wooden tripod overlooking Tuzla)
  {
    const tx = -4.5, tz = -80, ty = tuzlaGroundY(tx, tz);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      cyl('teleskop', '#6e4c30', tx + Math.cos(a) * 0.36, ty + 0.78, tz + Math.sin(a) * 0.36, 0.055, 1.65, 0.055, {
        rx: -Math.sin(a) * 0.25, rz: Math.cos(a) * 0.25,
      });
    }
    cyl('teleskop', '#faf8f2', tx, ty + 1.88, tz, 0.22, 2.25, 0.22, { rx: 1.05, bleed: '#d6d2c4' });
    cyl('teleskop', '#d8aa34', tx, ty + 2.38, tz + 0.85, 0.26, 0.26, 0.26, { rx: 1.05 });
    addOrb('teleskop', V(tx, ty + 1.7, tz), 2.2, ['teleskop'], 'teleskop', V(tx, ty + 3.5, tz), {
      from: V(tx - 4.6, ty + 3.2, tz + 4.2), to: V(tx - 3.0, ty + 2.4, tz + 2.8), look: V(tx, ty + 1.7, tz),
    }, 1, 4.8);
  }

  // 66. zvjezdarnica (STAGE 2 LAST ORB! White domed hilltop Observatory crowning Slana Banja)
  const obsX = 6, obsZ = -86, obsY = tuzlaGroundY(obsX, obsZ);
  {
    cyl('zvjezdarnica', '#e2dac8', obsX, obsY + 0.45, obsZ, 5.4, 0.9, 5.4, { solid: true });
    cyl('zvjezdarnica', '#faf8f2', obsX, obsY + 3.2, obsZ, 3.8, 4.8, 3.8, { bleed: '#dcd6c6', solid: true, wall: true });
    sph('zvjezdarnica', '#dce6ee', obsX, obsY + 5.6, obsZ, 3.85, 3.3, 3.85, { bleed: '#a8bccb' });
    // Dark telescope observation slit running up the dome facing south (+z)
    box('zvjezdarnica', '#263442', obsX, obsY + 7.2, obsZ + 2.6, 0.95, 3.2, 1.3, 0, { rx: -0.45 });
    // Entrance arch & windows
    box('zvjezdarnica', '#5a422e', obsX, obsY + 2.0, obsZ + 3.78, 1.4, 2.4, 0.22, 0);
    addOrb('zvjezdarnica', V(obsX, obsY + 5.2, obsZ), 6.2, ['zvjezdarnica'], 'zvjezdarnica', V(obsX, obsY + 10.2, obsZ), {
      from: V(obsX - 11.5, obsY + 8.6, obsZ + 14.5), to: V(obsX - 8.2, obsY + 7.0, obsZ + 11.0), look: V(obsX, obsY + 4.8, obsZ),
    }, 2, 7.2);
  }

  // 67. ljubicasta (terraced royal-purple flower beds lining the Slana Banja hillside path)
  {
    const lx = -14, lz = -66, ly = tuzlaGroundY(lx, lz);
    box('ljubicasta', '#c8bea8', lx, ly + 0.35, lz, 5.6, 0.70, 2.8, 0.15, { solid: true });
    for (let i = -2; i <= 2; i++) for (const dz of [-0.55, 0.55]) {
      sph('ljubicasta', i % 2 ? '#8a46c8' : '#a45ce0', lx + i * 1.0, ly + 0.98, lz + dz, 0.52, 0.44, 0.52, { ico: true, bleed: '#5e2494' });
    }
    addOrb('ljubicasta', V(lx, ly + 1.0, lz), 2.8, ['ljubicasta'], 'ljubicasta', V(lx, ly + 2.9, lz), {
      from: V(lx + 4.6, ly + 3.4, lz + 5.2), to: V(lx + 3.0, ly + 2.4, lz + 3.6), look: V(lx, ly + 0.95, lz),
    }, 1, 5.0);
  }

  // 68. kesten (grand flowering horse-chestnut tree with upright white blossom candles)
  {
    const kx = -26, kz = -70, ky = tuzlaGroundY(kx, kz);
    cyl('kesten', '#62442c', kx, ky + 2.1, kz, 0.45, 4.2, 0.45, { bleed: '#3e2818', solid: true });
    sph('kesten', '#46843e', kx, ky + 5.2, kz, 2.8, 2.3, 2.8, { ico: true, bleed: '#2c5c28', sway: 0.4 });
    sph('kesten', '#549648', kx + 1.4, ky + 4.6, kz + 0.9, 1.7, 1.5, 1.7, { ico: true, bleed: '#346a2c', sway: 0.4 });
    sph('kesten', '#3e7838', kx - 1.3, ky + 4.8, kz - 0.8, 1.8, 1.5, 1.8, { ico: true, bleed: '#265222', sway: 0.4 });
    // Upright white-and-pink horse-chestnut blossom candles
    for (const [dx, dy, dz] of [[0, 7.2, 0.9], [1.7, 6.0, 1.4], [-1.5, 6.2, 1.2], [0.8, 6.7, -1.0], [-0.6, 5.8, 2.2], [2.2, 5.1, 0.2]]) {
      cone('kesten', '#fff8ee', kx + dx, ky + dy, kz + dz, 0.24, 0.72, { bleed: '#f2b8c8' });
    }
    addOrb('kesten', V(kx, ky + 4.6, kz), 4.6, ['kesten'], 'kesten', V(kx, ky + 8.4, kz), {
      from: V(kx + 7.5, ky + 7.2, kz + 9.5), to: V(kx + 5.2, ky + 5.8, kz + 7.0), look: V(kx, ky + 4.5, kz),
    }, 1, 6.2);
  }

  // 69. djetlic (red-crowned woodpecker tapping on a Slana Banja trunk) -> tuzAnimals 'woodpecker'
  const djetX = -19, djetZ = -78, djetY = tuzlaGroundY(djetX, djetZ);
  {
    cyl('props', '#68482e', djetX, djetY + 2.4, djetZ, 0.36, 4.8, 0.36, { solid: true });
    sph('props', '#4c8c42', djetX, djetY + 5.6, djetZ, 2.1, 1.8, 2.1, { ico: true, bleed: '#306228' });
    addOrb('djetlic', V(djetX, djetY + 2.2, djetZ + 0.45), 1.6, ['djetlic'], 'djetlic', V(djetX, djetY + 3.4, djetZ + 1.0), {
      from: V(djetX + 3.2, djetY + 3.0, djetZ + 4.0), to: V(djetX + 2.0, djetY + 2.4, djetZ + 2.6), look: V(djetX, djetY + 2.15, djetZ + 0.42),
    }, 1, 4.5);
  }

  // 70. krtica (velvety black mole peeking from its molehill) -> tuzAnimals 'mole'
  const krtX = 22, krtZ = -68, krtY = tuzlaGroundY(krtX, krtZ);
  addOrb('krtica', V(krtX, krtY + 0.5, krtZ), 1.6, ['krtica'], 'krtica', V(krtX, krtY + 2.2, krtZ), {
    from: V(krtX - 3.4, krtY + 2.4, krtZ + 3.4), to: V(krtX - 2.2, krtY + 1.6, krtZ + 2.2), look: V(krtX, krtY + 0.4, krtZ),
  }, 1, 4.3);

  // 71. puz (garden snail on a flat mossy Slana Banja park stone) -> tuzAnimals 'snail'
  const puzX = 32, puzZ = -63, puzY = tuzlaGroundY(puzX, puzZ);
  cyl('props', '#a8a294', puzX, puzY + 0.22, puzZ, 1.05, 0.44, 0.92, { solid: true });
  addOrb('puz', V(puzX, puzY + 0.6, puzZ), 1.5, ['puz'], 'puz', V(puzX, puzY + 2.2, puzZ), {
    from: V(puzX - 3.0, puzY + 2.2, puzZ + 3.0), to: V(puzX - 1.9, puzY + 1.5, puzZ + 1.9), look: V(puzX, puzY + 0.55, puzZ),
  }, 1, 4.2);

  // 72. svitac (glowing golden fireflies dancing above a Slana Banja meadow patch) -> tuzAnimals 'firefly'
  const sviX = 34, sviZ = -76, sviY = tuzlaGroundY(sviX, sviZ);
  addOrb('svitac', V(sviX, sviY + 0.9, sviZ), 1.9, ['svitac'], 'svitac', V(sviX, sviY + 2.6, sviZ), {
    from: V(sviX - 3.8, sviY + 2.6, sviZ + 3.8), to: V(sviX - 2.5, sviY + 1.8, sviZ + 2.5), look: V(sviX, sviY + 0.85, sviZ),
  }, 1, 4.5);

  // 73. vilin (turquoise dragonfly hovering over lakeside reeds at the East Pannonian Lake edge) -> tuzAnimals 'dragonfly'
  const vilX = 27.5, vilZ = 34.5, vilY = tuzlaGroundY(vilX, vilZ);
  for (let i = -2; i <= 2; i++) {
    cyl('props', '#4d8a42', vilX + i * 0.32, vilY + 0.75, vilZ - 0.6 + (i % 2) * 0.25, 0.05, 1.6, 0.05, { rz: i * 0.06 });
  }
  addOrb('vilin', V(vilX, vilY + 1.1, vilZ), 1.8, ['vilin'], 'vilin', V(vilX, vilY + 2.7, vilZ), {
    from: V(vilX - 3.8, vilY + 2.7, vilZ - 3.8), to: V(vilX - 2.4, vilY + 1.9, vilZ - 2.4), look: V(vilX, vilY + 1.05, vilZ),
  }, 1, 4.5);

  // 74. kabanica (park stroller in bright yellow hooded raincoat overlooking Tuzla) -> person kind 'tuzRaincoat'
  const kabX = 18.5, kabZ = -80, kabY = tuzlaGroundY(kabX, kabZ);
  addOrb('kabanica', V(kabX, kabY + 1.1, kabZ), 1.9, ['kabanica'], 'kabanica', V(kabX, kabY + 3.0, kabZ), {
    from: V(kabX - 4.0, kabY + 2.8, kabZ + 4.0), to: V(kabX - 2.6, kabY + 2.1, kabZ + 2.6), look: V(kabX, kabY + 1.1, kabZ),
  }, 1, 4.6);

  // 75. carape (colourful striped knitted socks hanging on a sunny hillside garden line)
  {
    const cx = 42, cz = -66, cy = tuzlaGroundY(cx, cz);
    for (const dx of [-1.7, 1.7]) cyl('carape', '#7a5430', cx + dx, cy + 1.25, cz, 0.08, 2.5, 0.08);
    box('carape', '#4a4e54', cx, cy + 2.30, cz, 3.4, 0.04, 0.04, 0);
    const sCols = ['#e2463a', '#3282c8', '#f2b82a', '#48a454', '#c84ca8', '#e67c28'];
    for (let i = 0; i < 6; i++) {
      const sx = cx - 1.25 + i * 0.50;
      box('carape', sCols[i], sx, cy + 1.92, cz, 0.22, 0.62, 0.10, 0);
      box('carape', '#faf6ec', sx, cy + 2.02, cz, 0.23, 0.12, 0.11, 0, { noOutline: true });
      box('carape', sCols[i], sx + 0.14, cy + 1.66, cz, 0.34, 0.18, 0.10, 0);
    }
    addOrb('carape', V(cx, cy + 1.85, cz), 2.4, ['carape'], 'carape', V(cx, cy + 3.4, cz), {
      from: V(cx - 3.6, cy + 3.0, cz + 4.4), to: V(cx - 2.2, cy + 2.3, cz + 2.9), look: V(cx, cy + 1.85, cz),
    }, 1, 4.8);
  }

  // ---- Scenic background greenery (Slana Banja hillside woods & perimeter Tuzla trees) ----
  const treeSpots = [
    [-38, -64, 1.15], [-34, -80, 1.25], [-12, -88, 1.3], [16, -92, 1.25], [28, -84, 1.2],
    [46, -78, 1.15], [50, -56, 1.1], [-48, -42, 1.1], [-66, 20, 1.15], [34, 24, 1.1],
    [32, 46, 1.15], [-42, 48, 1.1], [-8, 54, 1.1], [24, 56, 1.15], [64, -22, 1.2],
    [66, 4, 1.15], [-2, -62, 1.05], [14, -64, 1.05],
  ];
  for (const [tx, tz, sc] of treeSpots) {
    addTree('props', tx, tz, sc, R() > 0.4 ? '#4f8c46' : '#629c52', '#32642a');
  }

  // ---- Living Tuzla people & wildlife ----
  const people = [
    { kind: 'tuzFloat',    tag: 'plutati',   x: -14,   y: LAKE_Y + 0.04, z: 35,   ry: 0.4,   trunks: true },
    { kind: 'tuzSplash',   tag: 'prskati',   x: -6,    y: LAKE_Y + 0.05, z: 26.8, ry: -2.4,  sc: 0.78, trunks: true },
    { kind: 'tuzMiner',    tag: 'rudar',     x: -37.5, y: CITY_Y,        z: 0.5,  ry: 0.7,   top: '#3e5468', bottom: '#2c343c', helmetTag: 'rudar', helmetCol: '#f6c424', helmetBleed: '#c89410' },
    { kind: 'tuzStudent',  tag: 'student',   x: 41,    y: CITY_Y,        z: -6.5, ry: -0.7,  woman: true, top: '#e26a48', bottom: '#385478' },
    { kind: 'tuzAccordion',tag: 'harmonika', x: 36,    y: CITY_Y,        z: 6.5,  ry: -0.6,  top: '#faf6ec', bottom: '#2e343c', accordionTag: 'harmonika' },
    { kind: 'tuzPiano',    tag: 'klavir',    x: 44,    y: CITY_Y + 0.5,  z: 9.25, ry: Math.PI, woman: true, top: '#3a4c78', bottom: '#242c44' },
    { kind: 'tuzFlute',    tag: 'flauta',    x: 50.5,  y: CITY_Y,        z: 12.0, ry: 0.8,   woman: true, top: '#e8a238', bottom: '#344c68', fluteTag: 'flauta' },
    { kind: 'tuzSing',     tag: 'pjesma',    x: 38.5,  y: CITY_Y,        z: 14.5, ry: -0.7,  woman: true, top: '#c84258', bottom: '#362e3a', noteTag: 'pjesma' },
    { kind: 'tuzRaincoat', tag: 'kabanica',  x: kabX,  y: kabY,          z: kabZ, ry: -0.6,  coatTag: 'kabanica', coatCol: '#f2be22', coatBleed: '#c49010', bottom: '#365272' },
    // Ambient town walkers along Korzo & lakeside (painted by 'passerby' in finale)
    { kind: 'walk', tag: 'passerby', x: -12, y: CITY_Y, z: -8, to: [6, -8], speed: 1.0, top: '#e27456', bottom: '#364c68' },
    { kind: 'walk', tag: 'passerby', x: -8, y: CITY_Y, z: 14.2, to: [10, 14.2], speed: 0.9, woman: true, top: '#42a4b4', bottom: '#464e58' },
  ];

  const tuzAnimals = [
    { kind: 'woodpecker', tag: 'djetlic', x: djetX, y: djetY + 2.15, z: djetZ + 0.42, ry: Math.PI },
    { kind: 'mole',       tag: 'krtica',  x: krtX,  y: krtY,         z: krtZ,         ry: -0.6 },
    { kind: 'snail',      tag: 'puz',     x: puzX,  y: puzY + 0.44,  z: puzZ,         ry: -0.7 },
    { kind: 'firefly',    tag: 'svitac',  x: sviX,  y: sviY + 0.35,  z: sviZ,         ry: -0.6 },
    { kind: 'dragonfly',  tag: 'vilin',   x: vilX,  y: vilY + 1.05,  z: vilZ,         ry: -2.2, r: 1.1 },
  ];

  for (const o of orbs) for (const t of o.tags) tag(t).source = o.focus.clone();
  tag('sky').source = sunPos.clone();
  tag('sun').source = sunPos.clone();

  b.finish(scene);

  return {
    colliders: b.colliders,
    orbs,
    people,
    animals: [],
    tuzAnimals,
    clouds,
    smoke: [],
    movers: [],
    train: { g: trainGroup, home: trainHome, collider: trainCollider, active: false },
    sunPos,
    water: {
      y: LAKE_Y, driftX: 0, driftZ: 0,
      clamp: (p) => { p.x = clamp(p.x, -36, 28); p.z = clamp(p.z, 22, 50); },
    },
    // Completely open lakeside wooden deck edge looking right out over the Pannonian Lakes & kristal orb
    start: V(-26.5, CITY_Y + 0.4, 15.0),
    // Golden fleur hovering brightly above the white Observatory dome on Slana Banja
    fleur: V(obsX, obsY + 14.5, obsZ),
  };
}
