// Banja Luka (spring / City of Greenery on the Vrbas): 3D world built from scratch on the shared Slavuj engine.
// North up (-z = Gospodska, Banski dvor, Park Petar Kočić & Park Mladen Stojanović,
// +z = emerald Vrbas river, Šeher thermal springs & rising green Banj brdo hill with monument).
import * as THREE from 'three';
import { Builder, paintGeo, washMat, addHull, tag, PAT, shared } from '../paper.js';

export const RIVER_Y = 0.0;
export const CITY_Y = 3.2;

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const sm = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

function makeRng(seed = 15790507) {
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

// Gentle curve of the Vrbas river centreline as a function of x
export function vrbasCenterZ(x) {
  return 26.5 + Math.sin(x * 0.028) * 5.2;
}

// Continuous terrain height across the Vrbas valley and Banj brdo hill
export function blGroundY(x, z) {
  const rc = vrbasCenterZ(x);
  const dist = Math.abs(z - rc);
  // River channel (half-width ~10.5 m)
  if (dist < 13.5) {
    const bank = sm((dist - 7.5) / 6.0);
    return -2.2 * (1 - bank) + CITY_Y * bank;
  }
  // North flat city valley (Kastel, Ferhadija, Banski dvor, Gospodska, Parks)
  if (z < rc) return CITY_Y;
  // South bank climbing gently up to Banj brdo summit around (0, 26.5, 92)
  const hillU = sm((z - (rc + 13.5)) / 56);
  const peakBoost = Math.exp(-((x / 46) ** 2 + ((z - 92) / 34) ** 2)) * 9.5;
  return CITY_Y + hillU * 14.5 + peakBoost;
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

export function buildBanjaLukaWorld(scene) {
  // Lush green late-spring palette & warm golden afternoon finale light
  shared.uWaterDir.value.set(1.0, 0.0);
  shared.uSunShadow.value.set(0.36, 0.56, 0.72);
  shared.uSunGlow.value.set(1.0, 0.76, 0.44);
  shared.uSunTint.value.set(1.03, 0.98, 0.90);
  shared.uSkyGlow.value.set(0.98, 0.74, 0.48);

  const b = new Builder();
  const R = makeRng(15790507);
  const rr = (a, c) => a + R() * (c - a);

  const BOX = new THREE.BoxGeometry(1, 1, 1);
  const CYL = new THREE.CylinderGeometry(1, 1, 1, 10);
  const CYL8 = new THREE.CylinderGeometry(1, 1, 1, 8);
  const CONE = new THREE.ConeGeometry(1, 1, 8);
  const SPH = new THREE.SphereGeometry(1, 9, 7);
  const ICO = new THREE.IcosahedronGeometry(1, 1);
  const TORUS = new THREE.TorusGeometry(1, 0.25, 7, 16);

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
    add(o.oct ? CYL8 : CYL, t, col, m, { ...o, hull: o.noOutline ? false : (o.hull ?? true), solid: false });
    if (o.solid) blk(x, y, z, r * 2, h, r * 2, { wall: o.wall !== false, orb: o.orb });
  };
  const sph = (t, col, x, y, z, sx, sy, sz, o = {}) => {
    add(SPH, t, col, mat4(x, y, z, o.ry || 0, o.rx || 0, o.rz || 0, [sx, sy, sz]), { ...o, hull: o.noOutline ? false : (o.hull ?? true), solid: false });
  };
  const cone = (t, col, x, y, z, r, h, o = {}) => {
    add(CONE, t, col, mat4(x, y, z, o.ry || 0, o.rx || 0, o.rz || 0, [r, h, r]), { ...o, hull: o.noOutline ? false : (o.hull ?? true), solid: false });
  };

  for (const t of ['terrain', 'river', 'aleja', 'park', 'travnjak', 'zidine', 'dvor']) {
    tag(t).mode = 'one'; tag(t).radius = 120; tag(t).holdRest = 1.8;
  }

  // ==================== 1. SKY DOME, SPRING SUN & CLOUDS ====================
  const sunPos = V(-70, 56, 132);
  {
    const skyGeo = new THREE.SphereGeometry(260, 24, 14);
    const pa = skyGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) if (pa.getY(i) < -20) pa.setY(i, -20);
    const g = paintGeo(skyGeo, { col: '#92cef2', bleed: '#f2dfb8', seed: [sunPos.x, sunPos.y, sunPos.z], radius: 360, dur: 5.5, hatch: 0 });
    const m = new THREE.Mesh(g, washMat('sky'));
    m.material.side = THREE.BackSide; m.material.depthWrite = false; m.renderOrder = -2;
    scene.add(m);
  }
  {
    const m = new THREE.Mesh(paintGeo(new THREE.SphereGeometry(11, 16, 12), { col: '#ffea92', bleed: '#ffc266', seed: [sunPos.x, sunPos.y, sunPos.z], radius: 22, dur: 3.5, hatch: 0 }), washMat('sun'));
    m.position.copy(sunPos); addHull(m, 1.5); scene.add(m);
  }
  const clouds = [];
  for (const [cx, cy, cz, sc] of [[-62, 54, 78, 1.25], [22, 58, 92, 1.4], [76, 52, 68, 1.15], [-44, 56, -60, 1.2], [48, 56, -54, 1.15]]) {
    const cg = new THREE.Group(); cg.position.set(cx, cy, cz); scene.add(cg);
    const cm = washMat('sky');
    for (const [dx, dy, dz, r] of [[0, 0, 0, 4.6], [3.6, -0.4, 0.5, 3.3], [-3.5, -0.5, -0.4, 3.1], [1.1, 1.2, -0.3, 2.9]]) {
      const m = new THREE.Mesh(paintGeo(ICO, { col: '#fbfaf5', bleed: '#e2e6ee', seed: [sunPos.x, sunPos.y, sunPos.z], radius: 260, dur: 5.0, hatch: 0 }), cm);
      m.position.set(dx * sc, dy * sc, dz * sc); m.scale.set(r * sc, r * 0.55 * sc, r * 0.7 * sc);
      addHull(m, 1.4); cg.add(m);
    }
    clouds.push({ g: cg, c: V(cx, cy, cz), r: 6.5 * sc, x0: cx, z0: cz, y0: cy, speed: 0.45 + R() * 0.3 });
  }

  // ==================== 2. LUSH GREEN VALLEY TERRAIN & EMERALD VRBAS ====================
  const NX = 74, NZ = 74, X0 = -112, X1 = 112, Z0 = -96, Z1 = 114;
  const tGeo = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, NX, NZ);
  tGeo.rotateX(-Math.PI / 2);
  tGeo.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2);
  const posA = tGeo.attributes.position;
  for (let i = 0; i < posA.count; i++) posA.setY(i, blGroundY(posA.getX(i), posA.getZ(i)));
  tGeo.computeVertexNormals();
  add(tGeo, 'terrain', '#8eb668', new THREE.Matrix4(), { bleed: '#628c46', hatch: 0.32, noOutline: true, solid: false });
  const terrCol = new THREE.Mesh(tGeo, new THREE.MeshBasicMaterial({ visible: false }));
  terrCol.userData.ground = true;
  b.colliders.push(terrCol);

  // Emerald Vrbas river sheet ('river' painted in finale, swim collider enabled!)
  const rivGeo = new THREE.PlaneGeometry(224, 36, 32, 6);
  rivGeo.rotateX(-Math.PI / 2);
  const rPos = rivGeo.attributes.position;
  for (let i = 0; i < rPos.count; i++) {
    const rx = rPos.getX(i), rz = rPos.getZ(i);
    rPos.setZ(i, vrbasCenterZ(rx) + rz);
    rPos.setY(i, RIVER_Y);
  }
  rivGeo.computeVertexNormals();
  add(rivGeo, 'river', '#2a9c84', new THREE.Matrix4(), { bleed: '#197060', pat: PAT.water, noOutline: true, hatch: 0.1, solid: false });
  const rivCol = blk(0, RIVER_Y - 0.12, 26.5, 220, 0.24, 24, { wall: false, water: true });
  rivCol.userData.water = true;

  // Foaming Vrbas rapids ('brzak') around x = 44..62
  for (let i = 0; i < 9; i++) {
    const bx = 42 + i * 2.4, bz = vrbasCenterZ(bx) + (i % 3 - 1) * 2.6;
    sph('brzak', '#eefaf8', bx, 0.14, bz, 1.45, 0.16, 0.65, { bleed: '#98dcd0', noOutline: true });
    sph('brzak', '#88d6c8', bx + 0.8, 0.10, bz + 0.9, 1.2, 0.12, 0.55, { noOutline: true });
  }

  // Deep swirling emerald river eddy ('vir') below Kastel bend at (-48, 0.05, 22)
  {
    const vx = -48, vz = vrbasCenterZ(vx);
    for (let r = 0; r < 3; r++) {
      add(TORUS, 'vir', r === 0 ? '#14584e' : '#1d7668', mat4(vx, 0.07 + r * 0.01, vz, 0, Math.PI / 2, 0, [1.2 + r * 1.15, 1.2 + r * 1.15, 0.14]), { bleed: '#0e423a', noOutline: true });
    }
    sph('vir', '#0e443c', vx, 0.04, vz, 1.6, 0.06, 1.6, { noOutline: true });
  }

  // Smooth river stones along bank ('kamenje') at (14, y, 17)
  for (let i = 0; i < 18; i++) {
    const kx = 10 + (i % 6) * 1.35 + (R() - 0.5) * 0.4;
    const kz = vrbasCenterZ(kx) - 10.0 + Math.floor(i / 6) * 1.05;
    const ky = blGroundY(kx, kz) + 0.14;
    sph('kamenje', ['#b8bcc0', '#d4d0c4', '#989ea4', '#c8c4b8'][i % 4], kx, ky, kz, rr(0.32, 0.58), rr(0.18, 0.30), rr(0.28, 0.52), { ry: rr(0, 3), bleed: '#7e848a' });
  }

  // Wooden dajak river dock ('pristaniste') on north bank at (-22, y, 16)
  {
    const px = -22, pz = vrbasCenterZ(px) - 8.2;
    box('pristaniste', '#9e7244', px, 0.72, pz, 8.8, 0.24, 3.8, { bleed: '#745230', pat: PAT.planks, ps: 2.5 });
    for (const dx of [-3.8, 0, 3.8]) for (const dz of [-1.5, 1.5]) {
      cyl('pristaniste', '#6c4c2e', px + dx, 0.35, pz + dz, 0.14, 1.6, { solid: true });
    }
    // Timber steps connecting dock up to Kastel bank
    for (let s = 0; s < 5; s++) {
      box('pristaniste', '#8c6238', px, 1.1 + s * 0.42, pz - 2.3 - s * 0.7, 2.8, 0.22, 0.75, { solid: true });
    }
  }

  // Iconic green-arched Vrbas footbridge ('mostic') spanning the river at x = 22
  {
    const mx = 22, mz = vrbasCenterZ(mx);
    // Stone piers on both banks
    box('mostic', '#dcd4c0', mx, 2.2, mz - 12.2, 5.2, 4.4, 2.4, { bleed: '#b4ac98' });
    box('mostic', '#dcd4c0', mx, 2.2, mz + 12.2, 5.2, 4.4, 2.4, { bleed: '#b4ac98' });
    // Arched green steel & timber deck spanning 24 m across the emerald Vrbas
    for (let i = -5; i <= 5; i++) {
      const u = i / 5;
      const archY = 4.6 + (1 - u * u) * 1.8;
      box('mostic', '#347a58', mx, archY, mz + u * 11.5, 4.4, 0.32, 2.45, { bleed: '#20523a', solid: true });
      for (const sd of [-2.05, 2.05]) {
        box('mostic', '#2b6a4c', mx + sd, archY + 0.65, mz + u * 11.5, 0.14, 1.05, 2.45, { solid: false });
      }
    }
    // High twin green steel arch ribs
    for (const sd of [-2.05, 2.05]) {
      for (let i = -4; i <= 4; i++) {
        const u = i / 4;
        const ay = 5.4 + (1 - u * u) * 3.8;
        box('mostic', '#2a6b4c', mx + sd, ay, mz + u * 10.0, 0.24, 0.28, 2.6, { rx: -u * 0.45, bleed: '#1a4832', solid: false });
      }
    }
  }

  // Animated traditional Banja Luka dajak boats ('dajak' — FIRST ORB!)
  const dajaks = [];
  function buildDajak(cx, cz, ry, woodCol, phaseOffset) {
    const g = new THREE.Group();
    g.position.set(cx, 0.12, cz);
    g.rotation.y = ry;
    scene.add(g);
    const DP = (geo, col, x, y, z, sx, sy, sz, bleed) => {
      const m = new THREE.Mesh(paintGeo(geo, { col, bleed: bleed || col, seed: [cx, 0.6, cz], radius: 4.5, delay: 0, dur: 2, hatch: 0.25 }), washMat('dajak'));
      m.position.set(x, y, z); m.scale.set(sx, sy, sz); addHull(m, 1.3); g.add(m); return m;
    };
    // Long narrow sleek wooden hull (signature Banja Luka dajak silhouette!)
    DP(BOX, woodCol, 0, 0.24, 0, 1.05, 0.42, 6.2, '#623c20');
    const prow = DP(CONE, woodCol, 0, 0.46, 3.85, 0.55, 1.9, '#623c20'); prow.rotation.x = Math.PI / 2 - 0.18;
    const stern = DP(CONE, woodCol, 0, 0.34, -3.55, 0.50, 1.3, '#623c20'); stern.rotation.x = -Math.PI / 2 + 0.12;
    // Wooden cross benches
    for (const bz of [-1.4, 0.2, 1.6]) DP(BOX, '#b8864c', 0, 0.44, bz, 0.96, 0.08, 0.32, '#8a6032');
    // Traditional painted accent trim on upturned prow
    DP(BOX, '#d94234', 0, 0.54, 3.3, 0.28, 0.12, 0.85, '#a22a20');
    const col = blk(cx, 0.5, cz, 1.4, 1.0, 7.6, { wall: true, ry });
    dajaks.push({ g, home: V(cx, 0.12, cz), ry, phaseOffset, collider: col, active: false });
  }
  buildDajak(-8, vrbasCenterZ(-8) - 1.5, -Math.PI / 2, '#966236', 0);
  buildDajak(6, vrbasCenterZ(6) + 2.2, -Math.PI / 2, '#84542c', 2.4);

  // Šeher thermal springs ('banja') + warm steam wisps ('para') on south bank at (36, y, 42)
  {
    const bx = 36, bz = vrbasCenterZ(bx) + 12.2, by = blGroundY(bx, bz);
    box('banja', '#dcd4c0', bx, by + 0.35, bz, 7.2, 0.9, 5.4, { bleed: '#b4ac98', pat: PAT.blocks });
    box('banja', '#44c8c0', bx, by + 0.72, bz, 6.0, 0.22, 4.2, { bleed: '#289c94', pat: PAT.water, noOutline: true, solid: false });
    // Little timber changing gazebo beside thermal pool
    box('banja', '#9c6e40', bx + 4.4, by + 1.35, bz, 2.2, 2.7, 2.6, { bleed: '#704c2a' });
    add(gableRoof(2.6, 3.0, 0.9), 'banja', '#c46038', mat4(bx + 4.4, by + 2.7, bz), { bleed: '#904022' });
    // Rising translucent white steam puffs ('para')
    for (let k = 0; k < 8; k++) {
      sph('para', '#f8fafc', bx - 1.6 + (k % 4) * 1.1, by + 1.45 + (k % 3) * 0.65, bz - 0.6 + Math.floor(k / 4) * 1.2, 0.62, 0.45, 0.56, { bleed: '#dce6ec', noOutline: true });
    }
  }

  // Mossy log for otter ('vidra') on river edge at (-36, 0.3, 18)
  cyl('props', '#6e4e30', -36, 0.25, vrbasCenterZ(-36) - 8.5, 0.34, 3.2, { rz: Math.PI / 2, ry: 0.3, solid: true });

  // ==================== 3. KASTEL FORTRESS & OPEN-AIR CONCERT STAGE ====================
  {
    const kx = -34, kz = 0, ky = CITY_Y;
    // Medieval stone curtain walls ('zidine') framing Kastel courtyard
    box('zidine', '#d8cfba', kx, ky + 2.6, kz - 14.5, 34, 5.2, 1.8, { bleed: '#b2a892', pat: PAT.blocks });
    box('zidine', '#d8cfba', kx - 17, ky + 2.6, kz - 1.5, 1.8, 5.2, 26, { bleed: '#b2a892', pat: PAT.blocks });
    box('zidine', '#d8cfba', kx + 17, ky + 2.6, kz - 1.5, 1.8, 5.2, 26, { bleed: '#b2a892', pat: PAT.blocks });
    // Low riverside parapet wall with battlements along south river side
    box('zidine', '#d8cfba', kx - 7, ky + 1.4, kz + 11.5, 20, 2.8, 1.5, { bleed: '#b2a892', pat: PAT.blocks });
    box('zidine', '#d8cfba', kx + 12, ky + 1.4, kz + 11.5, 10, 2.8, 1.5, { bleed: '#b2a892', pat: PAT.blocks });
    // Crenellations along walls
    for (let x = kx - 15; x <= kx + 15; x += 3.2) box('zidine', '#dfd6c2', x, ky + 5.5, kz - 14.5, 1.4, 0.8, 1.9, { solid: false });
    // Arched stone fortress entrance gate on north wall
    box('zidine', '#4e4238', kx, ky + 1.6, kz - 14.5, 3.8, 3.2, 2.0, { solid: false });

    // Thick round stone corner bastions ('bastion') guarding Kastel
    for (const [bx, bz, h] of [[kx - 17, kz + 11.5, 7.6], [kx + 17, kz + 11.5, 7.2], [kx - 17, kz - 14.5, 8.2], [kx + 17, kz - 14.5, 7.4]]) {
      cyl('bastion', '#d6cdb8', bx, ky + h / 2, bz, 3.6, h, { bleed: '#afa58e', pat: PAT.blocks, solid: true });
      cyl('bastion', '#c8bfa8', bx, ky + h + 0.35, bz, 3.85, 0.7, { bleed: '#a49a84' });
      cone('bastion', '#a85838', bx, ky + h + 2.1, bz, 3.8, 2.9, { bleed: '#7a3c24' });
    }

    // Open-air wooden festival stage ('pozornica') + concert backdrop ('koncert') + truss spotlights ('reflektor')
    const sx = kx - 2, sz = kz - 8.2;
    box('pozornica', '#8e6238', sx, ky + 0.55, sz, 11.5, 1.1, 6.2, { bleed: '#664424', pat: PAT.planks, ps: 2.5 });
    for (const dx of [-5.2, 5.2]) {
      cyl('koncert', '#3a4048', sx + dx, ky + 3.6, sz - 2.6, 0.14, 5.2, { solid: true });
      cyl('koncert', '#3a4048', sx + dx, ky + 3.6, sz + 2.4, 0.14, 5.2, { solid: true });
    }
    // Concert awning & banner ('koncert')
    box('koncert', '#26466e', sx, ky + 6.1, sz - 0.1, 11.8, 0.45, 5.8, { bleed: '#18304e', solid: true });
    box('koncert', '#e8b630', sx, ky + 5.65, sz + 2.75, 9.6, 0.65, 0.14, { solid: false });
    // Stage spotlights ('reflektor') mounted on front truss
    for (const rx of [-3.6, -1.2, 1.2, 3.6]) {
      box('reflektor', '#2c3238', sx + rx, ky + 5.72, sz + 2.9, 0.45, 0.38, 0.55, { rx: 0.45, solid: false });
      sph('reflektor', '#fff098', sx + rx, ky + 5.56, sz + 3.12, 0.22, 0.22, 0.14, { noOutline: true });
    }
    // Low stone audience benches in Kastel yard (props)
    for (const bz of [kz + 3.5, kz + 6.5]) {
      box('props', '#d8d0bc', sx, ky + 0.36, bz, 12.0, 0.72, 1.0, { bleed: '#b4ac98' });
    }
  }

  // ==================== 4. FERHADIJA, BANSKI DVOR, THEATRE, GALLERY & TRG KRAJINE ====================
  // Ferhadija Mosque (props main body) + domed portico ('trijem') + octagonal 'turbe' at (8, CITY_Y, 0)
  {
    const fx = 8, fz = 0, fy = CITY_Y;
    box('props', '#f6f1e4', fx, fy + 4.4, fz - 2.2, 9.6, 8.8, 9.6, { bleed: '#d6cebc' });
    sph('props', '#7e9098', fx, fy + 8.8, fz - 2.2, 4.6, 4.2, 4.6, { bleed: '#5a6b72' });
    sph('props', '#e4bc3e', fx, fy + 13.3, fz - 2.2, 0.24, 0.45, 0.24);
    // Slender stone minaret on west side
    cyl('props', '#f4efe2', fx - 5.6, fy + 10.5, fz - 1.5, 0.85, 21.0, { bleed: '#d2cab6', solid: true });
    cyl('props', '#e6decb', fx - 5.6, fy + 16.5, fz - 1.5, 1.25, 0.9);
    cone('props', '#6e8088', fx - 5.6, fy + 22.8, fz - 1.5, 0.95, 3.8, { bleed: '#4c5c64' });
    // Graceful triple-domed stone portico ('trijem') on north entrance
    box('trijem', '#f4eee0', fx, fy + 0.25, fz - 8.6, 9.8, 0.5, 3.6, { bleed: '#d0c8b4' });
    for (const dx of [-4.2, -1.4, 1.4, 4.2]) cyl('trijem', '#f0eadc', fx + dx, fy + 2.4, fz - 10.1, 0.24, 4.2, { solid: true });
    box('trijem', '#ebe4d4', fx, fy + 4.6, fz - 8.6, 9.8, 0.65, 3.6, { bleed: '#c8c0ac' });
    for (const dx of [-2.8, 0, 2.8]) sph('trijem', '#7c8e96', fx + dx, fy + 5.1, fz - 8.6, 1.35, 1.2, 1.35, { bleed: '#5a6b72' });
    // Octagonal stone mausoleum ('turbe') in Ferhadija's garden at (19, fy, -4)
    const tx = 19, tz = -4;
    cyl('turbe', '#f2ecde', tx, fy + 2.3, tz, 2.5, 4.6, { oct: true, bleed: '#cfc7b4', solid: true });
    sph('turbe', '#7b8d94', tx, fy + 4.8, tz, 2.35, 2.1, 2.35, { bleed: '#586970' });
    sph('turbe', '#e4bc3e', tx, fy + 7.1, tz, 0.16, 0.32, 0.16);
  }

  // Grand Banski dvor ('dvor'), fluted columns ('stub'), stone arcade ('arkada') & golden domes ('zlatna') at (14, CITY_Y, -28)
  {
    const dx = 14, dz = -28, dy = CITY_Y;
    box('dvor', '#f2e0b4', dx, dy + 4.8, dz, 24, 9.6, 12.5, { bleed: '#d4be8c' });
    add(gableRoof(24.8, 13.2, 2.8), 'dvor', '#b85c3a', mat4(dx, dy + 9.6, dz), { bleed: '#8a4024' });
    // Grand pediment & tall white columns ('stub') across south portico
    box('dvor', '#f6e8c2', dx, dy + 8.6, dz + 6.8, 13.2, 1.1, 2.2, { bleed: '#d4c298' });
    add(gableRoof(13.6, 2.4, 2.1), 'dvor', '#e8d4a2', mat4(dx, dy + 9.2, dz + 6.8), { bleed: '#c4ae7c' });
    for (let i = 0; i < 6; i++) {
      cyl('stub', '#faf6ec', dx - 5.5 + i * 2.2, dy + 4.2, dz + 7.4, 0.36, 8.4, { bleed: '#dad2c0', solid: true });
      box('stub', '#f4eee0', dx - 5.5 + i * 2.2, dy + 0.35, dz + 7.4, 0.92, 0.7, 0.92, { solid: false });
    }
    // Rounded stone arcade ('arkada') connecting west wing
    for (let i = 0; i < 4; i++) {
      const ax = dx - 14.5 - i * 3.0;
      box('arkada', '#f2e6c8', ax, dy + 2.6, dz + 4.2, 0.65, 5.2, 1.4, { bleed: '#cec09e' });
      box('arkada', '#f2e6c8', ax - 1.5, dy + 4.8, dz + 4.2, 3.0, 0.9, 1.4, { bleed: '#cec09e' });
    }
    // Gleaming golden domes of nearby cathedral landmark ('zlatna') at (34, dy, -26)
    const zx = 34, zz = -26;
    box('props', '#f6ecdc', zx, dy + 4.6, zz, 11.5, 9.2, 11.5, { bleed: '#d6c8b2' });
    sph('zlatna', '#f0c434', zx, dy + 10.6, zz, 3.2, 3.4, 3.2, { bleed: '#c4961a' });
    for (const [ox, oz] of [[-3.4, -3.4], [3.4, -3.4], [-3.4, 3.4], [3.4, 3.4]]) {
      sph('zlatna', '#f0c434', zx + ox, dy + 9.8, zz + oz, 1.35, 1.5, 1.35, { bleed: '#c4961a' });
    }
  }

  // National Theatre ('pozoriste') & Art Gallery ('galerija') on civic square
  {
    const px = 42, pz = -46, py = CITY_Y;
    box('pozoriste', '#f4e6cc', px, py + 4.4, pz, 16, 8.8, 11, { bleed: '#d4c2a2' });
    add(gableRoof(16.8, 11.8, 2.5), 'pozoriste', '#b85636', mat4(px, py + 8.8, pz), { bleed: '#883c22' });
    box('pozoriste', '#c83430', px, py + 2.4, pz + 5.65, 6.4, 3.2, 0.3, { solid: false });
    // Art Gallery ('galerija') with framed canvases visible on terrace wall at (20, py, -48)
    const gx = 20, gz = -48;
    box('galerija', '#f6f2e8', gx, py + 3.6, gz, 13, 7.2, 9.5, { bleed: '#d6d0c0' });
    box('galerija', '#5a6e7e', gx, py + 7.4, gz, 13.6, 0.65, 10.0, { bleed: '#3e4e5c' });
    for (const [dx, col] of [[-3.4, '#e06444'], [0, '#3888b8'], [3.4, '#e6b830']]) {
      box('galerija', '#8a6238', gx + dx, py + 3.2, gz + 4.82, 2.2, 1.7, 0.14, { solid: false });
      box('galerija', col, gx + dx, py + 3.2, gz + 4.90, 1.85, 1.35, 0.08, { noOutline: true, solid: false });
    }
  }

  // Trg Krajine square paving (props), fountain ('fontana'), bronze statue ('kip') & newsstand kiosk ('kiosk')
  box('props', '#e8e2d2', 14, CITY_Y - 0.18, -14, 34, 0.36, 16, { bleed: '#c6bfb0', pat: PAT.cobble });
  {
    const fx = 14, fz = -14, fy = CITY_Y;
    cyl('fontana', '#dfd8c6', fx, fy + 0.45, fz, 2.8, 0.9, { bleed: '#b8b09e', solid: true });
    cyl('fontana', '#52c4d4', fx, fy + 0.78, fz, 2.35, 0.25, { pat: PAT.water, noOutline: true });
    cyl('fontana', '#dcd4c2', fx, fy + 1.55, fz, 0.42, 1.6, { solid: true });
    cyl('fontana', '#dfd8c6', fx, fy + 2.25, fz, 1.15, 0.26);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      sph('fontana', '#ccf0f8', fx + Math.cos(a) * 0.85, fy + 2.1 + (k % 2) * 0.4, fz + Math.sin(a) * 0.85, 0.12, 0.32, 0.12, { noOutline: true });
    }
  }
  // Bronze statue of Petar Kočić ('kip') at (32, CITY_Y, -14)
  {
    const sx = 32, sz = -14, sy = CITY_Y;
    box('kip', '#dcd4c2', sx, sy + 0.85, sz, 1.65, 1.7, 1.65, { bleed: '#b6ae9c' });
    cyl('kip', '#4a5a4e', sx, sy + 2.45, sz, 0.36, 1.5, { bleed: '#2e3c32', solid: true });
    sph('kip', '#4a5a4e', sx, sy + 3.45, sz, 0.24, 0.26, 0.24, { bleed: '#2e3c32' });
  }
  // Street kiosk ('kiosk') at (2, CITY_Y, -14)
  {
    const kx = 2, kz = -14, ky = CITY_Y;
    box('kiosk', '#2b6ea8', kx, ky + 1.4, kz, 3.2, 2.8, 2.6, { bleed: '#1c4d78' });
    box('kiosk', '#f2c230', kx, ky + 2.95, kz, 3.6, 0.35, 3.0, { bleed: '#c4961a' });
    box('kiosk', '#bfe4f2', kx, ky + 1.65, kz + 1.32, 2.2, 1.15, 0.12, { solid: false });
  }

  // ==================== 5. GOSPODSKA ULICA, SHOPS, CAFES & BANJA LUKA FOOD ====================
  // Pedestrian promenade pavement (props) along x = -34..4, z = -34..-22
  box('props', '#ece4d4', -16, CITY_Y - 0.16, -28, 38, 0.32, 14, { bleed: '#cac2b0', pat: PAT.cobble });
  // Pastel Austro-Hungarian townhouses on north edge of Gospodska: Bookshop ('knjizara'), Flower Shop ('cvjecara'), Cafe ('kafic')
  {
    const py = CITY_Y, pz = -39;
    // Bookshop ('knjizara') at (-28, py, pz)
    box('knjizara', '#f2d6a6', -28, py + 4.0, pz, 9.6, 8.0, 8.2, { bleed: '#d2b484' });
    add(gableRoof(10.2, 8.8, 2.2), 'knjizara', '#c45c38', mat4(-28, py + 8.0, pz), { bleed: '#924022' });
    // Books stacked neatly inside bookshop display
    for (let k = 0; k < 5; k++) box('knjizara', ['#d94234', '#2a78b8', '#48a056', '#e6b228', '#8a58b8'][k], -30 + k * 1.0, py + 1.15, pz + 4.35, 0.72, 0.95, 0.32, { solid: false });
    // Flower shop ('cvjecara') + bouquets ('buket') at (-17, py, pz)
    box('cvjecara', '#f4c8cc', -17, py + 3.8, pz, 9.4, 7.6, 8.2, { bleed: '#d4a6aa' });
    add(gableRoof(10.0, 8.8, 2.1), 'cvjecara', '#b85436', mat4(-17, py + 7.6, pz), { bleed: '#883a22' });
    for (const [dx, col] of [[-2.4, '#e03e44'], [-1.1, '#f2c430'], [0.4, '#d868a8'], [1.9, '#8a58c8']]) {
      cyl('buket', '#e8d8be', -17 + dx, py + 0.45, pz + 4.65, 0.28, 0.7, { bleed: '#c0b096' });
      sph('buket', col, -17 + dx, py + 0.96, pz + 4.65, 0.42, 0.34, 0.42, { bleed: '#9c2830' });
    }
    // Shop window glass frames ('izlog') & striped awnings ('tenda') across Gospodska facades
    for (const ix of [-28, -17, -6]) {
      box('izlog', '#b8e0f0', ix, py + 1.75, pz + 4.18, 5.8, 2.5, 0.16, { bleed: '#84b8d0', solid: false });
      box('izlog', '#523828', ix, py + 3.05, pz + 4.22, 6.1, 0.22, 0.24, { solid: false });
      box('tenda', '#d93e34', ix, py + 3.45, pz + 5.2, 6.4, 0.24, 2.2, { rx: 0.28, bleed: '#a4261e', solid: true });
      box('tenda', '#faf6ec', ix, py + 3.48, pz + 5.2, 2.2, 0.24, 2.22, { rx: 0.28, noOutline: true, solid: false });
    }
    // Sidewalk Cafe ('kafic') at (-6, py, pz)
    box('kafic', '#d8e8d4', -6, py + 4.2, pz, 9.6, 8.4, 8.2, { bleed: '#b4cab0' });
    add(gableRoof(10.2, 8.8, 2.2), 'kafic', '#c4603a', mat4(-6, py + 8.4, pz), { bleed: '#924424' });
    // Outdoor cafe tables & Banja Luka specialties along z = -31.5
    const CTABS = [[-22, -31.5], [-14, -31.5], [-8, -31.5], [-2, -31.5]];
    for (const [tx, tz] of CTABS) {
      cyl('kafic', '#4a382c', tx, py + 0.45, tz, 0.08, 0.82);
      cyl('kafic', '#faf4e6', tx, py + 0.86, tz, 0.78, 0.10, { bleed: '#d6cebe', solid: true });
    }
    const ty = py + 0.94;
    // Banja Luka square flatbread bun ('lepinja'), clotted cream ('kajmak') & chopped red onion ('luk') at (-22, ty, -31.5)
    box('lepinja', '#d8a054', -22.2, ty + 0.12, -31.5, 0.62, 0.22, 0.62, { bleed: '#ac7832', solid: false });
    sph('kajmak', '#fbf6e4', -21.55, ty + 0.12, -31.45, 0.22, 0.14, 0.22, { bleed: '#ded6bc' });
    sph('luk', '#a83c78', -21.9, ty + 0.11, -30.98, 0.16, 0.12, 0.16, { bleed: '#7a2454' });
    sph('luk', '#c45492', -22.15, ty + 0.11, -31.02, 0.14, 0.10, 0.14);
    // Festive layered cake ('torta') at (-14, ty, -31.5)
    cyl('torta', '#f8d8dc', -14, ty + 0.14, -31.5, 0.34, 0.26, { bleed: '#d8a4ac' });
    cyl('torta', '#faf6ec', -14, ty + 0.32, -31.5, 0.24, 0.18, { bleed: '#dcd4c4' });
    sph('torta', '#e03838', -14, ty + 0.45, -31.5, 0.09, 0.09, 0.09);
    // Sugar-dusted doughnuts ('krofna') at (-8, ty, -31.5)
    for (const [dx, dz] of [[-0.2, 0], [0.22, 0.08], [0, -0.22]]) {
      add(TORUS, 'krofna', '#d89844', mat4(-8 + dx, ty + 0.08, -31.5 + dz, 0, Math.PI / 2, 0, [0.14, 0.14, 0.16]), { bleed: '#a87024', hull: true });
    }
    // Golden flaky croissants ('kroasan') at (-2, ty, -31.5)
    for (const [dx, dz, ry2] of [[-0.18, 0.08, 0.4], [0.2, -0.06, -0.6]]) {
      sph('kroasan', '#dfa044', -2 + dx, ty + 0.10, -31.5 + dz, 0.28, 0.11, 0.13, { ry: ry2, bleed: '#b07826' });
    }
    // Red flower planters & red accent bench ('crvena') along Gospodska at (-11, py, -24.5)
    box('crvena', '#d9322c', -11, py + 0.52, -24.5, 2.4, 0.48, 0.72, { bleed: '#a21e1a' });
    box('crvena', '#d9322c', -11, py + 0.96, -24.8, 2.4, 0.48, 0.12, { solid: false });
    for (const rx of [-13.2, -8.8]) sph('crvena', '#e02c28', rx, py + 0.72, -24.5, 0.56, 0.48, 0.56, { bleed: '#a21818' });
  }

  // ==================== 6. PARK PETAR KOČIĆ, GREEN AVENUE OF 7 TREES & FLORA ====================
  // Shady green avenue ('aleja') + neat row of 7 tall chestnut trees ('sedam') along x = 44..72, z = -34..8
  box('aleja', '#ddd6c4', 52, CITY_Y - 0.12, -16, 8.2, 0.24, 52, { bleed: '#b8b09c', pat: PAT.cobble });
  for (let i = 0; i < 7; i++) {
    const az = -38 + i * 7.2;
    cyl('sedam', '#6c4e32', 47.2, CITY_Y + 2.2, az, 0.34, 4.4, { bleed: '#4c3420', solid: true });
    sph('sedam', '#4a8e42', 47.2, CITY_Y + 5.6, az, 2.6, 2.3, 2.6, { bleed: '#30662a' });
    sph('sedam', '#fff6e4', 47.2 + 0.9, CITY_Y + 6.4, az + 0.6, 0.45, 0.55, 0.45, { noOutline: true });
    // Mirror avenue trees on east side ('aleja')
    cyl('aleja', '#6c4e32', 56.8, CITY_Y + 2.1, az, 0.32, 4.2, { solid: true });
    sph('aleja', '#549a4a', 56.8, CITY_Y + 5.4, az, 2.4, 2.1, 2.4, { bleed: '#366e30' });
  }

  // Lush city park ('park'), wide green lawn ('travnjak') & octagonal gazebo ('paviljon') at (68, CITY_Y, -28)
  box('park', '#dcd6c4', 68, CITY_Y - 0.10, -28, 22, 0.22, 22, { bleed: '#b8b2a0', solid: false });
  box('travnjak', '#66aa4c', 68, CITY_Y - 0.04, -52, 28, 0.18, 22, { bleed: '#448230', noOutline: true, solid: false });
  // Octagonal glass-and-wood park pavilion ('paviljon') at (68, CITY_Y, -28)
  {
    const px = 68, pz = -28, py = CITY_Y;
    cyl('paviljon', '#e4dcc8', px, py + 0.35, pz, 4.2, 0.7, { oct: true, bleed: '#beb6a2', solid: true });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      cyl('paviljon', '#faf6ec', px + Math.cos(a) * 3.5, py + 2.3, pz + Math.sin(a) * 3.5, 0.14, 3.4, { solid: true });
    }
    cone('paviljon', '#3c7a58', px, py + 5.2, pz, 4.6, 2.4, { bleed: '#24523a' });
  }

  // Mighty oak tree ('hrast') at (66, CITY_Y, -46) & slender white birch ('breza') at (78, CITY_Y, -44)
  {
    const hx = 66, hz = -46, hy = CITY_Y;
    cyl('hrast', '#5e4228', hx, hy + 2.4, hz, 0.58, 4.8, { bleed: '#3e2a18', solid: true });
    sph('hrast', '#3e7c38', hx, hy + 6.4, hz, 4.2, 3.2, 4.0, { bleed: '#245422' });
    sph('hrast', '#529446', hx + 1.8, hy + 5.8, hz + 1.2, 2.6, 2.2, 2.5, { noOutline: true });
    const bx = 78, bz = -44;
    cyl('breza', '#f4f2ec', bx, hy + 3.0, bz, 0.22, 6.0, { bleed: '#c8c6be', solid: true });
    for (const dy of [1.2, 2.4, 3.6, 4.8]) box('breza', '#2e3034', bx, hy + dy, bz + 0.2, 0.24, 0.08, 0.06, { solid: false });
    sph('breza', '#7cc25a', bx, hy + 6.8, bz, 2.2, 2.6, 2.1, { bleed: '#549638' });
  }

  // Park flora: red roses ('ruza'), tall sunflowers ('suncokret'), purple violets ('ljubicica'), trimmed shrubs ('grm')
  // Roses along sunny trellis at (60, CITY_Y, -14)
  for (let i = 0; i < 6; i++) {
    const rx = 57 + i * 1.15, rz = -14;
    cyl('ruza', '#3c7834', rx, CITY_Y + 0.5, rz, 0.04, 1.0);
    sph('ruza', '#d92e3a', rx, CITY_Y + 1.05, rz, 0.28, 0.24, 0.28, { bleed: '#9c1822' });
  }
  // Tall sunflowers ('suncokret') at (74, CITY_Y, -14)
  for (let i = 0; i < 5; i++) {
    const sx = 72 + i * 1.15, sz = -14 + (i % 2) * 0.7;
    cyl('suncokret', '#4c8838', sx, CITY_Y + 1.1, sz, 0.06, 2.2);
    sph('suncokret', '#f4c824', sx, CITY_Y + 2.28, sz, 0.42, 0.42, 0.14, { bleed: '#c89a14' });
    sph('suncokret', '#4a301e', sx, CITY_Y + 2.28, sz + 0.10, 0.20, 0.20, 0.08);
  }
  // Purple violets ('ljubicica') at (62, CITY_Y, -38)
  for (let i = 0; i < 9; i++) {
    const lx = 60 + (i % 3) * 0.95, lz = -38 + Math.floor(i / 3) * 0.85;
    sph('ljubicica', '#4c843c', lx, CITY_Y + 0.18, lz, 0.34, 0.16, 0.34, { noOutline: true });
    sph('ljubicica', '#7a44c2', lx, CITY_Y + 0.36, lz, 0.22, 0.16, 0.22, { bleed: '#542894' });
  }
  // Trimmed rounded park shrubs ('grm') at (78, CITY_Y, -28)
  for (let i = 0; i < 5; i++) {
    sph('grm', '#44863c', 77 + (i % 2) * 2.2, CITY_Y + 0.75, -33 + i * 2.4, 1.15, 0.85, 1.15, { bleed: '#2a5e24' });
  }
  // Park bench for sparrow & broad sunny leaf for ladybug (props)
  box('props', '#8c6238', 62, CITY_Y + 0.45, -24, 2.2, 0.14, 0.65);
  box('props', '#4e9640', 60, CITY_Y + 0.45, -18, 0.9, 0.06, 0.9, { solid: false });

  // ==================== 7. PARK MLADEN STOJANOVIĆ (TENNIS, BASKETBALL, PLAYGROUND) ====================
  // Red-clay Tennis Court ('tenis') at (-56, CITY_Y, -44)
  {
    const tx = -56, tz = -44, ty = CITY_Y;
    box('tenis', '#c86a42', tx, ty + 0.05, tz, 14.5, 0.12, 22.0, { bleed: '#9c4c2a', solid: false });
    // White court lines
    box('tenis', '#faf8f2', tx, ty + 0.12, tz - 10.2, 12.6, 0.04, 0.14, { solid: false });
    box('tenis', '#faf8f2', tx, ty + 0.12, tz + 10.2, 12.6, 0.04, 0.14, { solid: false });
    box('tenis', '#faf8f2', tx - 6.3, ty + 0.12, tz, 0.14, 0.04, 20.4, { solid: false });
    box('tenis', '#faf8f2', tx + 6.3, ty + 0.12, tz, 0.14, 0.04, 20.4, { solid: false });
    // Tennis net across centre
    for (const dx of [-6.8, 6.8]) cyl('tenis', '#384048', tx + dx, ty + 0.6, tz, 0.07, 1.2, { solid: true });
    box('tenis', '#faf8f2', tx, ty + 1.05, tz, 13.6, 0.12, 0.06, { solid: false });
    box('tenis', '#d4dce2', tx, ty + 0.56, tz, 13.5, 0.86, 0.04, { solid: false });
  }
  // Basketball court ('kosarka') + hoop ('kos') at (-56, CITY_Y, -70)
  {
    const bx = -56, bz = -70, by = CITY_Y;
    box('kosarka', '#74828e', bx, by + 0.05, bz, 15.0, 0.12, 14.0, { bleed: '#54606a', solid: false });
    box('kosarka', '#faf8f2', bx, by + 0.12, bz, 13.8, 0.04, 0.14, { solid: false });
    // Basketball hoop & backboard ('kos') at north end of court
    const hx = bx, hz = bz - 6.2;
    cyl('kos', '#424a52', hx, by + 1.85, hz - 0.55, 0.11, 3.7, { solid: true });
    box('kos', '#faf8f2', hx, by + 3.55, hz, 1.9, 1.25, 0.12, { bleed: '#d6d2c8', solid: true });
    box('kos', '#e05828', hx, by + 3.45, hz + 0.08, 0.72, 0.56, 0.04, { solid: false });
    add(TORUS, 'kos', '#e05828', mat4(hx, by + 3.12, hz + 0.42, 0, Math.PI / 2, 0, [0.34, 0.34, 0.22]), { hull: true });
    cyl('kos', '#faf6ec', hx, by + 2.82, hz + 0.42, 0.26, 0.52);
  }
  // Playground wooden seesaw ('klackalica') & sandbox ('pjescanik') at (-72, CITY_Y, -34)
  {
    const kx = -72, kz = -34, ky = CITY_Y;
    box('klackalica', '#6e4c2e', kx, ky + 0.42, kz, 0.45, 0.84, 0.65, { solid: true });
    box('klackalica', '#e05838', kx, ky + 0.92, kz, 4.4, 0.14, 0.46, { rz: 0.18, bleed: '#aa3820', solid: true });
    for (const dx of [-1.85, 1.85]) box('klackalica', '#f2c430', kx + dx, ky + 0.92 + dx * 0.18 + 0.18, kz, 0.48, 0.10, 0.46, { rz: 0.18, solid: false });
    // Timber sandbox ('pjescanik') at (-72, ky, -44)
    const sx = -72, sz = -44;
    box('pjescanik', '#a87846', sx, ky + 0.28, sz, 4.8, 0.56, 4.8, { bleed: '#7e5630', solid: true });
    box('pjescanik', '#ebd08a', sx, ky + 0.36, sz, 4.1, 0.42, 4.1, { bleed: '#c8ab62', noOutline: true, solid: false });
    cyl('pjescanik', '#e04838', sx + 0.8, ky + 0.75, sz + 0.6, 0.22, 0.36);
  }

  // ==================== 8. BANJ BRDO MONUMENT ('spomenik' — STAGE 2 LAST ORB!) ====================
  {
    const mx = 0, mz = 92, my = blGroundY(mx, mz);
    // Lush dark-green forest trees ringing Banj brdo hillside (props)
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const rx = mx + Math.cos(a) * rr(14, 28), rz = mz + Math.sin(a) * rr(12, 22);
      const ry = blGroundY(rx, rz);
      cyl('props', '#5e4228', rx, ry + 1.4, rz, 0.28, 2.8);
      sph('props', i % 2 ? '#3e7a3c' : '#4e8c44', rx, ry + 4.0, rz, 2.4, 2.6, 2.4, { bleed: '#265224' });
    }
    // Iconic stepped white stone terrace & soaring modernist Banj brdo monument ('spomenik')
    box('spomenik', '#e8e2d4', mx, my + 0.65, mz, 13.0, 1.3, 9.0, { bleed: '#c2baa8' });
    box('spomenik', '#f2ede0', mx, my + 1.65, mz, 9.2, 0.85, 6.4, { bleed: '#ccc4b2' });
    // Sculpted white limestone memorial pylon rising proudly over the whole city
    box('spomenik', '#faf7ef', mx, my + 7.2, mz, 4.2, 10.6, 2.4, { bleed: '#d6d0c2' });
    box('spomenik', '#f4f0e4', mx - 2.6, my + 5.2, mz, 1.8, 6.6, 2.0, { bleed: '#d0cab8' });
    box('spomenik', '#f4f0e4', mx + 2.6, my + 5.2, mz, 1.8, 6.6, 2.0, { bleed: '#d0cab8' });
    box('spomenik', '#e8c448', mx, my + 12.8, mz, 1.2, 1.2, 1.2, { solid: false });
  }

  // ==================== 9. PEOPLE & WILDLIFE ====================
  const people = [
    // Standing dajak boatman ('dajakas' holding 'motka') on dajak[0]
    { kind: 'blDajak', tag: 'dajakas', x: -6.2, y: 0.42, z: vrbasCenterZ(-8) - 1.5, ry: -Math.PI / 2, top: '#faf6ec', bottom: '#265080', poleTag: 'motka' },
    // Stage musicians in Kastel ('violina', 'bubanj', 'truba')
    { kind: 'blViolin', tag: 'koncert', x: -39.0, y: CITY_Y + 1.12, z: -8.0, ry: 0.2, woman: true, scarfChoice: 'no', top: '#d94c44', bottom: '#263444', violinTag: 'violina' },
    { kind: 'blDrum', tag: 'koncert', x: -36.0, y: CITY_Y + 1.12, z: -8.6, ry: 0, top: '#2b6ea8', bottom: '#2c343e', drumTag: 'bubanj' },
    { kind: 'blTrumpet', tag: 'koncert', x: -33.0, y: CITY_Y + 1.12, z: -8.0, ry: -0.2, top: '#e2a628', bottom: '#263444', trumpetTag: 'truba' },
    // Joyful dancing couple ('plesati') + seated listeners ('slusati') + audience ('publika') in Kastel yard
    { kind: 'blDance', tag: 'plesati', x: -37.2, y: CITY_Y, z: -1.8, ry: 1.4, woman: true, scarfChoice: 'no', top: '#e85a68', bottom: '#2c5480' },
    { kind: 'blDance', tag: 'plesati', x: -35.4, y: CITY_Y, z: -1.8, ry: -1.4, top: '#3c7aa8', bottom: '#3a424c' },
    { kind: 'blListen', tag: 'slusati', x: -38.5, y: CITY_Y + 0.16, z: 3.5, ry: Math.PI, woman: true, scarfChoice: 'no', top: '#589c68', bottom: '#3a4856' },
    { kind: 'blListen', tag: 'slusati', x: -35.5, y: CITY_Y + 0.16, z: 3.5, ry: Math.PI, top: '#c87238', bottom: '#344252' },
    { kind: 'blListen', tag: 'publika', x: -39.5, y: CITY_Y + 0.16, z: 6.5, ry: Math.PI, top: '#4a78a8', bottom: '#2e3844' },
    { kind: 'blListen', tag: 'publika', x: -36.5, y: CITY_Y + 0.16, z: 6.5, ry: Math.PI, woman: true, scarfChoice: 'no', top: '#d86888', bottom: '#3a4654' },
    { kind: 'blListen', tag: 'publika', x: -33.5, y: CITY_Y + 0.16, z: 6.5, ry: Math.PI, top: '#5e9654', bottom: '#343c46' },
    // Friendly Gospodska waitress ('konobarica')
    { kind: 'blWaitress', tag: 'konobarica', x: -11.0, y: CITY_Y, z: -31.5, ry: 0.4, woman: true, scarfChoice: 'no', top: '#faf8f2', bottom: '#2c3a4c' },
    // Park Mladen Stojanović activities: scooter, frisbee, tennis ('reket'), basketball ('kosarka'), stroller ('kolica'), photographer, sketcher
    { kind: 'blScooter', tag: 'romobil', x: -42, y: CITY_Y, z: -34, ry: 0.5, sc: 0.72, top: '#e24a38', bottom: '#2c5480', scooterTag: 'romobil' },
    { kind: 'blFrisbee', tag: 'frizbi', x: -44, y: CITY_Y, z: -56, ry: -0.6, top: '#f2b828', bottom: '#2a5a8a', sport: true, frisbeeTag: 'frizbi' },
    { kind: 'blTennis', tag: 'tenis', x: -56, y: CITY_Y + 0.12, z: -38, ry: Math.PI, woman: true, scarfChoice: 'no', top: '#faf8f2', bottom: '#2b6ea8', sport: true, racketTag: 'reket' },
    { kind: 'blTennis', tag: 'tenis', x: -56, y: CITY_Y + 0.12, z: -50, ry: 0, top: '#2ca478', bottom: '#faf8f2', sport: true, racketTag: 'reket' },
    { kind: 'blBasket', tag: 'kosarka', x: -56, y: CITY_Y + 0.12, z: -72.5, ry: Math.PI, top: '#e04834', bottom: '#1e3858', sport: true, ballTag: 'kosarka' },
    { kind: 'blStroller', tag: 'kolica', x: 52, y: CITY_Y, z: -6, ry: Math.PI, woman: true, scarfChoice: 'no', top: '#6898c8', bottom: '#384654', strollerTag: 'kolica' },
    { kind: 'blPhoto', tag: 'fotograf', x: -12, y: CITY_Y, z: 11.2, ry: 0.3, top: '#4a5a68', bottom: '#363e46' },
    { kind: 'blDraw', tag: 'crtati', x: 65, y: CITY_Y, z: -34, ry: -0.5, woman: true, scarfChoice: 'no', top: '#d87848', bottom: '#384a5e' },
    // Strollers along the green avenue & Gospodska ('passerby')
    { kind: 'walk', tag: 'passerby', x: -24, y: CITY_Y, z: -26, to: [2, -26], speed: 1.1, woman: true, scarfChoice: 'no' },
    { kind: 'walk', tag: 'passerby', x: 52, y: CITY_Y, z: -32, to: [52, 4], speed: 1.05 },
  ];

  const blAnimals = [
    { kind: 'heron', tag: 'caplja', x: 32, y: 0.06, z: vrbasCenterZ(32) - 6.8, ry: -0.6 },
    { kind: 'otter', tag: 'vidra', x: -36, y: 0.56, z: vrbasCenterZ(-36) - 8.5, ry: 0.5 },
    { kind: 'hedgehog', tag: 'jez', x: 64, y: CITY_Y, z: -42, ry: 0.9 },
    { kind: 'sparrow', tag: 'vrabac', x: 62, y: CITY_Y + 0.52, z: -24, ry: -0.4 },
    { kind: 'ladybug', tag: 'bubamara', x: 60, y: CITY_Y + 0.48, z: -18, ry: 0.2 },
    { kind: 'goose', tag: 'guska', x: 2, y: blGroundY(2, vrbasCenterZ(2) - 10.5), z: vrbasCenterZ(2) - 10.5, ry: 0.8 },
  ];

  // ==================== 10. ALL 75 ORBS (CLEAR CAMERAS & REACHABLE LANDINGS) ====================
  const orbs = [];
  const O = (id, x, y, z, cam, look, extra = {}) => {
    const f = V(x, y, z);
    const lk = look || [x, Math.max(0.4, y - 1.2), z];
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

  // Zone 1: Vrbas, Dajak & Thermal Springs (12)
  O('dajak',      -8, 3.0, vrbasCenterZ(-8) - 1.5,   [-8, 6.2, vrbasCenterZ(-8) - 13],  [-8, 0.8, vrbasCenterZ(-8) - 1.5], { stage: 0, size: 6, r: 6.0, pan: 3.5, wideView: { from: [8, 12, vrbasCenterZ(0) - 18], to: [-24, 12, vrbasCenterZ(-20) - 14], look: [-4, 1, vrbasCenterZ(-4)], lookTo: [-4, 1, vrbasCenterZ(-4)] } });
  O('dajakas',    -6.2, 3.8, vrbasCenterZ(-8) - 1.5, [-2, 4.4, vrbasCenterZ(-8) - 8.5], [-6.2, 1.8, vrbasCenterZ(-8) - 1.5], { size: 2.5 });
  O('motka',      -6.2, 3.2, vrbasCenterZ(-8) - 3.2, [-1.5, 4.0, vrbasCenterZ(-8) - 8], [-6.2, 1.4, vrbasCenterZ(-8) - 2.0], { size: 2.5 });
  O('pristaniste',-22, 3.4, vrbasCenterZ(-22) - 8.2, [-14, 6.2, vrbasCenterZ(-22) + 2], [-22, 1.2, vrbasCenterZ(-22) - 8.2], { size: 6 });
  O('banja',      36, 4.8, vrbasCenterZ(36) + 12.2,  [30, 8.2, vrbasCenterZ(36) + 2],   [36, 2.2, vrbasCenterZ(36) + 12.2], { size: 6 });
  O('para',       36, 5.4, vrbasCenterZ(36) + 10.6,  [32, 6.6, vrbasCenterZ(36) + 3],   [36, 3.4, vrbasCenterZ(36) + 11.8], { size: 3.5 });
  O('brzak',      50, 2.8, vrbasCenterZ(50),         [50, 7.2, vrbasCenterZ(50) - 12],  [50, 0.3, vrbasCenterZ(50)], { size: 7 });
  O('vir',       -48, 2.8, vrbasCenterZ(-48),        [-48, 7.6, vrbasCenterZ(-48) + 10],[-48, 0.2, vrbasCenterZ(-48)], { size: 6 });
  O('kamenje',    14, 3.2, vrbasCenterZ(14) - 9.2,   [14, 5.4, vrbasCenterZ(14) - 3],   [14, 1.2, vrbasCenterZ(14) - 9.2], { size: 3.5 });
  O('caplja',     32, 2.8, vrbasCenterZ(32) - 6.8,   [29, 3.6, vrbasCenterZ(32) - 1.5], [32, 1.0, vrbasCenterZ(32) - 6.8], { size: 2.0, pan: 1.5 });
  O('vidra',     -36, 2.6, vrbasCenterZ(-36) - 8.5,  [-33, 3.4, vrbasCenterZ(-36) - 3.5],[-36, 0.8, vrbasCenterZ(-36) - 8.5], { size: 1.8, pan: 1.4 });
  O('mostic',     22, 10.5, vrbasCenterZ(22),        [38, 12.5, vrbasCenterZ(22) - 8],  [22, 5.8, vrbasCenterZ(22)], { size: 12, pan: 4 });

  // Zone 2: Kastel Fortress & Summer Concert Stage (11)
  O('bastion',   -17, 13.8, 11.5,    [-4, 14.5, 22],     [-17, 7.5, 11.5], { size: 7, pan: 3 });
  O('zidine',    -34, 11.2, -14.5,   [-34, 16.5, 18],    [-34, 6.2, -12],  { size: 14, pan: 5, wideView: { from: [-10, 22, 24], to: [-54, 22, 24], look: [-34, 5, -2], lookTo: [-34, 5, -2] } });
  O('pozornica', -36, 6.8, -8.2,     [-36, 8.2, 4.5],    [-36, 4.4, -8.2], { size: 7 });
  O('koncert',   -36, 11.2, -8.2,    [-26, 11.5, 5.5],   [-36, 6.8, -8.2], { size: 9, pan: 3.5 });
  O('violina',   -39, 6.4, -8.0,     [-39, 6.2, -3.5],   [-39, 5.4, -8.0], { size: 2.0, pan: 1.2 });
  O('bubanj',    -36, 6.2, -8.6,     [-36, 6.0, -3.8],   [-36, 5.0, -8.6], { size: 2.0, pan: 1.2 });
  O('truba',     -33, 6.4, -8.0,     [-33, 6.2, -3.5],   [-33, 5.5, -8.0], { size: 2.0, pan: 1.2 });
  O('plesati',   -36.3, 5.8, -1.8,   [-36.3, 6.0, 2.5],  [-36.3, 4.3, -1.8], { size: 3.0, pan: 1.5 });
  O('slusati',   -37.0, 5.6, 3.5,    [-37.0, 6.4, 8.8],  [-37.0, 4.2, 3.5], { size: 3.5, pan: 1.8 });
  O('publika',   -36.5, 5.8, 6.5,    [-28, 7.2, 10.5],   [-36.5, 4.2, 6.5], { size: 5 });
  O('reflektor', -36, 10.2, -5.2,    [-36, 9.8, 2.0],    [-36, 8.8, -5.2], { size: 4, pan: 2.0 });

  // Zone 3: Ferhadija, Banski Dvor & Trg Krajine (13)
  O('dvor',       14, 17.5, -28,     [14, 16.5, -6],     [14, 9.2, -28],   { size: 14, pan: 5, wideView: { from: [32, 20, -4], to: [-4, 20, -4], look: [14, 9, -28], lookTo: [14, 9, -28] } });
  O('stub',       14, 11.2, -20.6,   [14, 10.5, -12.5],  [14, 7.5, -20.6], { size: 6 });
  O('arkada',     -4, 9.8, -23.8,    [-4, 9.6, -15.5],   [-4, 6.2, -23.8], { size: 6 });
  O('fontana',    14, 7.2, -14,      [21.0, 7.8, -14.5], [14, 4.8, -14],   { size: 4.5, pan: 1.8 });
  O('kip',        32, 8.0, -14,      [32, 7.6, -7.8],    [32, 5.8, -14],   { size: 2.8, pan: 1.5 });
  O('pozoriste',  42, 16.2, -46,     [42, 15.5, -29],    [42, 8.6, -46],   { size: 11, pan: 4 });
  O('galerija',   20, 12.6, -48,     [20, 11.2, -35],    [20, 6.8, -48],   { size: 9, pan: 3.5 });
  O('kiosk',       2, 7.4, -14,      [2, 6.8, -7.5],     [2, 4.8, -14],    { size: 3.5, pan: 1.8 });
  O('trijem',      8, 10.5, -8.6,    [8, 10.2, -17.5],   [8, 6.6, -8.6],   { size: 6 });
  O('turbe',      19, 11.6, -4,      [27, 10.5, -11],    [19, 6.8, -4],    { size: 5 });
  O('zlatna',     34, 18.2, -26,     [34, 19.0, -9],     [34, 13.8, -26],  { size: 8, pan: 3.5 });
  O('crvena',    -11, 5.8, -24.5,    [-11, 6.0, -19.5],  [-11, 4.0, -24.5], { size: 3.5, pan: 1.5 });

  // Zone 4: Gospodska Ulica, Cafes & Food (13)
  O('izlog',     -17, 7.2, -34.8,    [-17, 6.6, -27.5],  [-17, 5.2, -34.8], { size: 4.5 });
  O('tenda',      -6, 8.6, -33.8,    [-6, 8.4, -26.5],   [-6, 6.6, -33.8], { size: 4.5 });
  O('knjizara',  -28, 14.5, -39,     [-28, 12.0, -24],   [-28, 7.2, -39],  { size: 8, pan: 3 });
  O('cvjecara',  -17, 14.2, -39,     [-17, 11.8, -24],   [-17, 7.0, -39],  { size: 8, pan: 3 });
  O('buket',     -17, 5.8, -34.3,    [-17, 5.6, -30.2],  [-17, 4.1, -34.3], { size: 2.8, pan: 1.5 });
  O('lepinja',   -22.2, 5.4, -31.5,  [-22.2, 5.4, -28.4],[-22.2, 4.2, -31.5], { size: 1.6, pan: 1.0 });
  O('kajmak',    -21.5, 5.4, -31.4,  [-20.4, 5.4, -28.6],[-21.5, 4.25, -31.4], { size: 1.4, pan: 0.9 });
  O('luk',       -22.0, 5.4, -31.0,  [-22.8, 5.4, -28.2],[-22.0, 4.2, -31.0], { size: 1.4, pan: 0.9 });
  O('torta',     -14, 5.5, -31.5,    [-14, 5.5, -28.4],  [-14, 4.35, -31.5], { size: 1.6, pan: 1.0 });
  O('krofna',     -8, 5.4, -31.5,    [-8, 5.4, -28.5],   [-8, 4.2, -31.5],  { size: 1.6, pan: 1.0 });
  O('kroasan',    -2, 5.4, -31.5,    [-2, 5.4, -28.5],   [-2, 4.2, -31.5],  { size: 1.6, pan: 1.0 });
  O('kafic',      -6, 14.8, -39,     [-6, 12.4, -23],    [-6, 7.6, -39],    { size: 8, pan: 3 });
  O('konobarica',-11, 6.2, -31.5,    [-11, 5.8, -27.2],  [-11, 4.5, -31.5], { size: 2.2, pan: 1.4 });

  // Zone 5: Park Petar Kočić, Green Avenues & Flora (14)
  O('aleja',      52, 11.2, -16,     [52, 13.0, 14],     [52, 6.5, -24],   { size: 14, pan: 4 });
  O('park',       68, 10.6, -22,     [82, 16.0, -8],     [68, 5.0, -30],   { size: 12, pan: 5 });
  O('paviljon',   68, 11.2, -28,     [58, 10.2, -18],    [68, 6.4, -28],   { size: 7, pan: 3 });
  O('hrast',      66, 13.2, -46,     [56, 13.0, -34],    [66, 8.6, -46],   { size: 7, pan: 3 });
  O('breza',      78, 13.0, -44,     [86, 12.2, -34],    [78, 8.4, -44],   { size: 6, pan: 2.5 });
  O('ruza',       60, 5.6, -14,      [60, 5.6, -9.5],    [60, 4.2, -14],   { size: 3.0, pan: 1.5 });
  O('suncokret',  74, 6.8, -14,      [74, 6.6, -8.5],    [74, 5.0, -14],   { size: 3.5, pan: 1.8 });
  O('ljubicica',  61, 5.2, -37,      [61, 5.6, -32.8],   [61, 3.6, -37],   { size: 2.5, pan: 1.4 });
  O('grm',        78, 5.8, -28,      [85, 6.6, -24],     [78, 4.0, -28],   { size: 4.0, pan: 2.0 });
  O('travnjak',   68, 6.6, -54,      [68, 12.5, -36],    [68, 3.4, -54],   { size: 12, pan: 4 });
  O('jez',        64, 4.8, -42,      [61, 4.8, -39],     [64, 3.4, -42],   { size: 1.5, pan: 1.2 });
  O('vrabac',     62, 5.0, -24,      [60, 5.0, -20.8],   [62, 3.85, -24],  { size: 1.4, pan: 1.0 });
  O('bubamara',   60, 4.9, -18,      [58.5, 4.8, -15.6], [60, 3.7, -18],   { size: 1.4, pan: 1.0 });
  O('guska',       2, 4.2, vrbasCenterZ(2) - 10.5, [6, 4.6, vrbasCenterZ(2) - 6.5], [2, 2.4, vrbasCenterZ(2) - 10.5], { size: 2.0, pan: 1.4 });

  // Zone 6: Park Mladen Stojanović, Sports & Banj Brdo (12)
  O('romobil',   -42, 5.4, -34,      [-38, 5.6, -29.5],  [-42, 3.9, -34],  { size: 2.2, pan: 1.4 });
  O('frizbi',    -44, 5.8, -56,      [-39, 6.0, -51],    [-44, 4.4, -56],  { size: 2.5, pan: 1.5 });
  O('tenis',     -56, 7.6, -44,      [-42, 11.5, -44],   [-56, 4.0, -44],  { size: 10, pan: 4 });
  O('reket',     -56, 5.6, -38,      [-52, 5.6, -34.5],  [-56, 4.5, -38],  { size: 2.2, pan: 1.3 });
  O('kosarka',   -56, 7.6, -70,      [-44, 10.8, -62],   [-56, 4.8, -70],  { size: 8, pan: 3.5 });
  O('kos',       -56, 8.2, -76.2,    [-52, 8.2, -70.5],  [-56, 6.4, -76.2], { size: 3.5, pan: 1.8 });
  O('klackalica',-72, 6.0, -34,      [-72, 6.4, -27.5],  [-72, 4.2, -34],  { size: 4.0, pan: 2.0 });
  O('pjescanik', -72, 5.6, -44,      [-66, 7.0, -38.5],  [-72, 3.8, -44],  { size: 4.5, pan: 2.0 });
  O('kolica',     52, 5.8, -6,       [52, 5.8, 1.5],     [52, 4.2, -6],    { size: 2.5, pan: 1.2 });
  O('fotograf',  -12, 5.8, 11.2,     [-7.5, 5.8, 15.2],  [-12, 4.6, 11.2], { size: 2.2, pan: 1.4 });
  O('crtati',     65, 5.6, -34,      [61, 5.6, -30],     [65, 4.2, -34],   { size: 2.2, pan: 1.4 });
  O('sedam',      47.2, 12.2, -16.4, [33, 14.0, -16.4],  [47.2, 7.0, -16.4], { size: 14, pan: 5 });

  // Stage 2 (LAST WORD): Banj brdo white stone monument ('spomenik')
  {
    const my = blGroundY(0, 92);
    O('spomenik', 0, my + 14.5, 92, [16, my + 15.0, 74], [0, my + 7.5, 92], {
      stage: 2, size: 12, r: 6.5, pan: 5,
      wideView: { from: [-24, my + 18, 70], to: [24, my + 18, 70], look: [0, my + 7, 92], lookTo: [0, 6, 10] },
    });
  }

  for (const o of orbs) for (const t of o.tags) tag(t).source = o.focus.clone();
  tag('sky').source = sunPos.clone();
  tag('sun').source = sunPos.clone();

  b.finish(scene);

  return {
    colliders: b.colliders,
    orbs,
    people,
    animals: [],
    blAnimals,
    clouds,
    smoke: [],
    start: V(-6, CITY_Y + 0.25, 11.2),
    fleur: V(0, blGroundY(0, 92) + 18.0, 92),
    sunPos,
    water: { y: RIVER_Y, driftX: -0.25, driftZ: 0.0, clamp: (p) => { p.x = clamp(p.x, -98, 98); const c = vrbasCenterZ(p.x); p.z = clamp(p.z, c - 9.2, c + 9.2); } },
    movers: [],
    dajaks,
  };
}
