// Jajce (spring): 3D storybook world built to Mostar/Sarajevo standards.
// North is -z, East is +x. Pliva Waterfall is at (-10, 0..13, 0), flowing east into the Vrbas canyon (x = 8..34, y = 0).
import * as THREE from 'three';
import { Builder, PAT, tag, rng, shared, paintGeo, washMat, addHull } from '../paper.js';
import S from '../settings.js';

export const VIEW_Y = 4.0;
export const PLATEAU_Y = 14.0;
export const WATER_UPPER = 13.0;
export const SUN_JAJCE = new THREE.Vector3(0.68, 0.56, 0.47).normalize();

const V = (x, y, z) => new THREE.Vector3(x, y, z);

function mat4(x, y, z, ry = 0, rx = 0, rz = 0, s = 1) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')),
    Array.isArray(s) ? new THREE.Vector3(...s) : new THREE.Vector3(s, s, s),
  );
  return m;
}

const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 8);
const CYL12 = new THREE.CylinderGeometry(1, 1, 1, 12);
const CYL16 = new THREE.CylinderGeometry(1, 1, 1, 16);
const CONE4 = new THREE.ConeGeometry(1, 1, 4);
const CONE8 = new THREE.ConeGeometry(1, 1, 8);
const ICO0 = new THREE.IcosahedronGeometry(1, 0);
const ICO = new THREE.IcosahedronGeometry(1, 1);
const DODE = new THREE.DodecahedronGeometry(1, 0);
const SPHERE = new THREE.SphereGeometry(1, 10, 8);

// Steep Bosnian hipped/pyramid roof geometry (Jajce traditional dark-shingle houses)
function hipRoofGeo(w, d, h) {
  const g = new THREE.ConeGeometry(1, h, 4);
  g.rotateY(Math.PI / 4);
  g.scale(w * 0.72, 1, d * 0.72);
  g.translate(0, h / 2, 0);
  return g;
}

// Helper for dynamic animated meshes sharing the watercolour/sketch shader
function dynMesh(geo, tagName, col, bleed, parent, x = 0, y = 0, z = 0, s = 1, hull = 1.4) {
  const seed = parent ? [parent.position.x, parent.position.y, parent.position.z] : [0, 0, 0];
  const g = paintGeo(geo, { col, bleed: bleed || col, seed, radius: 12, dur: 2.8, hatch: 0.45 });
  const m = new THREE.Mesh(g, washMat(tagName));
  m.position.set(x, y, z);
  if (Array.isArray(s)) m.scale.set(...s);
  else m.scale.setScalar(s);
  if (hull) addHull(m, hull);
  if (parent) parent.add(m);
  return m;
}

export function jajceGroundY(x, z) {
  // Lower Vrbas canyon & plunge pool
  if (x >= 8 && x <= 34 && z >= -115 && z <= 115) return 0;
  if (x >= -10 && x <= 14 && z >= -14 && z <= 14) return 0;
  // Upper Pliva stream & Pliva Lake
  if (x < -10 && x >= -78 && z >= -10 && z <= 10) return WATER_UPPER;
  if (x < -78 && x >= -132 && z >= -36 && z <= 36) return WATER_UPPER;
  // Royal Fortress hilltop (Tvrđava)
  if (Math.hypot((x + 6) / 22, (z + 88) / 18) < 1.05) return 32.0;
  // Mid-hill terrace (St. Luke's, Medvjed-kula, Catacombs)
  if (z < -44 && z >= -74 && x >= -62 && x <= 20) return 22.0;
  // East bank viewpoint & picnic park
  if (x > 34 && x <= 78 && z >= -58 && z <= 68) return VIEW_Y;
  if (x > 78) return VIEW_Y + Math.min(44, (x - 78) * 0.55);
  // West/NW Old Town plateau & SW spring meadow
  if (x <= 8) return PLATEAU_Y;
  return VIEW_Y;
}

export function buildJajceWorld(scene) {
  const b = new Builder(), R = rng(317);
  const pick = (a) => a[Math.floor(R() * a.length)], rr = (lo, hi) => lo + R() * (hi - lo);
  const A = (geo, x, y, z, o, ry = 0, rx = 0, rz = 0, s = 1) => b.add(geo, mat4(x, y, z, ry, rx, rz, s), o);
  const box = (w, h, d, x, y, z, o, ry = 0, rx = 0, rz = 0) => A(BOX, x, y, z, o, ry, rx, rz, [w, h, d]);
  const slab = (x0, x1, z0, z1, o, y = VIEW_Y + 0.04, h = 0.08) => box(x1 - x0, h, z1 - z0, (x0 + x1) / 2, y, (z0 + z1) / 2, o);

  // Bright, fresh spring morning light for Jajce (per page load, never affects Mostar/Sarajevo)
  shared.uSunDir.value.copy(SUN_JAJCE);
  shared.uWaterDir.value.set(0, -1); // Vrbas flows north (-z)
  shared.uSunShadow.value.set(0.56, 0.64, 0.78);
  shared.uSunGlow.value.set(1.0, 0.92, 0.68);
  shared.uSunTint.value.set(1.04, 1.03, 0.96);
  shared.uSkyGlow.value.set(0.84, 0.95, 1.0);

  const orbs = [], clouds = [], people = [], animals = [], smoke = [], petalEmitters = [];
  const wheels = [], swans = [], butterflies = [], bees = [], swallows = [];

  const orb = (id, focus, size, tags, shot, top, extra = {}) => orbs.push({
    id, focus: V(...focus), size, tags, shot,
    at: V(focus[0], top + S.orb.hoverHeight, focus[2]), stage: 1, ...extra,
  });

  // Spring palettes
  const LIME = ['#f5f1e6', '#e6e0d0'];
  const SHINGLE = ['#4c4640', '#38332e'];
  const WOOD_DARK = ['#5c3e28', '#422c1b'];
  const WOOD_WARM = ['#8c633c', '#6e4c2c'];
  const STONE_WARM = ['#d4cab4', '#b4a890'];
  const STONE_GREY = ['#b8b4aa', '#949086'];
  const GRASS_SPRING = ['#6ea84f', '#52873a'];
  const GRASS_LUSH = ['#5d9c44', '#437a30'];
  const PINK_BLOSSOM = [['#f7c4d6', '#e298b2'], ['#fbd5e2', '#e8abc0'], ['#f4b5cb', '#d988a5']];
  const WHITE_BLOSSOM = [['#faf6f2', '#e3dcd4'], ['#fff9f5', '#eae2da']];

  // ==================== 1. SKY, SUN & SPRING CLOUDS ====================
  tag('sky').side = THREE.BackSide; tag('sky').mode = 'one'; tag('sky').radius = 1300; tag('sky').dur = 6;
  tag('sun').mode = 'one'; tag('sun').radius = 65; tag('sun').dur = 2.5;
  A(new THREE.SphereGeometry(720, 32, 20), 0, 0, 0, { tag: 'sky', col: '#a8d8f0', bleed: '#68a8dc', pat: PAT.sky, hatch: 0, ink: false, solid: false });
  const sunPos = SUN_JAJCE.clone().multiplyScalar(520);
  const sunM = new THREE.Matrix4().lookAt(sunPos, V(0, 20, 0), V(0, 1, 0)).setPosition(sunPos);
  b.add(new THREE.CircleGeometry(28, 36).rotateY(Math.PI), sunM, { tag: 'sun', col: '#fff19c', bleed: '#ffd35c', hatch: 0, ink: false, solid: false });
  {
    const g = new THREE.Group(); g.position.copy(sunPos); g.lookAt(0, 20, 0);
    const inkM = new THREE.MeshBasicMaterial({ color: S.ink.color, side: THREE.DoubleSide });
    for (const r0 of [28, 29]) { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r0 + 0.7, 48), inkM); m.position.z = -0.5; g.add(m); }
    scene.add(g);
  }
  const addCloud = (x, y, z, s) => {
    clouds.push({ c: V(x, y, z), r: 4.0 * s });
    const dr = -rr(14, 34);
    b.object(() => {
      for (const [ox, oy, oz, r] of [[-2.0, 0, 0, 1.4], [-0.5, 0.5, 0.2, 1.9], [1.0, 0.45, -0.2, 2.0], [2.3, 0, 0, 1.4], [0.2, -0.2, 0.5, 1.7]])
        A(ICO, x + ox * s, y + oy * s, z + oz * s, { tag: 'hills', col: '#ffffff', bleed: '#e4edf4', hull: true, hatch: 0.3, solid: false, sway: dr }, 0, 0, 0, [r * s, 0.58 * r * s, r * s]);
    });
  };
  for (const [x, y, z, s] of [[-160, 78, -130, 8], [130, 82, -150, 9], [170, 72, 80, 7], [-170, 70, 95, 8], [-20, 86, -210, 9], [40, 80, 200, 8]])
    addCloud(x, y, z, s);

  // Paint wave tuning for large tags
  for (const t of ['kanjon', 'livada', 'zelena', 'tvrdjava', 'sedra', 'slap', 'brana']) {
    tag(t).mode = 'one'; tag(t).radius = 120; tag(t).holdRest = 2.4;
  }
  for (const t of ['mlin', 'tresnja', 'sljiva', 'behar', 'vrba', 'trska', 'lokvanj', 'lala', 'maslacak', 'djetelina', 'cetiri', 'kamen']) {
    tag(t).waveDelay = 2.3;
  }

  // ==================== 2. TERRAIN, VRBAS CANYON, PLIVA LAKE & HILLS ====================
  const CANYON_M = { tag: 'kanjon', col: '#9e9788', bleed: '#7a7364', pat: PAT.blocks, ps: 0.35 };
  const CANYON_BG = { tag: 'canyon', col: '#b2aa9a', bleed: '#8c8474', pat: PAT.blocks, ps: 0.35 };
  const GREEN_M = { tag: 'zelena', col: GRASS_SPRING[0], bleed: GRASS_SPRING[1], pat: PAT.grass };
  const MEADOW_M = { tag: 'livada', col: '#78b852', bleed: '#5a943b', pat: PAT.grass };
  const TOWN_G = { tag: 'town', col: '#cfc9bc', bleed: '#b0aa9c', pat: PAT.cobble, ps: 0.6 };
  const HILL_BG = { tag: 'hills', col: '#699e4b', bleed: '#4e7d36', pat: PAT.grass };

  // Lower Vrbas river bed & emerald water surface (y = 0)
  box(48, 2, 260, 18, -1.6, 0, { tag: 'canyon', col: '#486e60', bleed: '#325246', ink: false });
  box(44, 0.1, 250, 19, -0.05, 0, { tag: 'canyon', col: '#3b9a84', bleed: '#287a68', pat: PAT.water, hatch: 0, water: true, ink: false });
  // Plunge pool under waterfall (x = -12..14, z = -14..14)
  box(26, 0.1, 28, 1, -0.05, 0, { tag: 'canyon', col: '#45ab95', bleed: '#2e8774', pat: PAT.water, hatch: 0, water: true, ink: false });

  // East bank terrace (viewpoint & picnic lawn, y = VIEW_Y = 4.0, x = 34..82, z = -65..72)
  box(48, 6, 138, 58, VIEW_Y - 3, 4, GREEN_M);
  // Stone embankment along Vrbas east edge (x = 34)
  box(2.2, 4.6, 138, 34.4, 1.9, 4, CANYON_BG);

  // Steep Vrbas canyon cliffs on east (x > 80) and south (z > 70) and north-east (z < -62) -> tagged 'kanjon'
  for (const [cx, cy, cz, sx, sy, sz] of [
    [94, 16, -24, 24, 26, 48], [98, 20, 26, 26, 34, 52], [90, 14, 72, 26, 22, 40],
    [54, 14, 86, 48, 22, 28], [56, 15, -78, 46, 24, 34], [92, 18, -72, 28, 30, 44],
    [3, 12, 54, 16, 22, 48], [2, 14, 90, 22, 26, 40],
  ]) {
    box(sx, sy, sz, cx, cy, cz, CANYON_M);
  }
  // Dramatic sloped canyon rock outcrops along the Vrbas gorge ('kanjon')
  for (const [rx, ry, rz, sx, sy, sz, rot] of [
    [80, 10, -8, 14, 14, 22, 0.15], [82, 12, 34, 16, 18, 24, -0.2],
    [8, 7, 26, 9, 14, 16, 0.25], [8, 8, -24, 9, 16, 16, -0.18],
  ]) {
    A(DODE, rx, ry, rz, { ...CANYON_M, hull: true }, rot, 0, 0, [sx * 0.55, sy * 0.55, sz * 0.55]);
  }

  // Upper Pliva river bed & emerald water (y = WATER_UPPER = 13.0)
  // Channel from Mlinčići (-78..-10, z = -10..10) + wide Pliva Lake (-132..-78, z = -36..36)
  box(70, 13.5, 22, -45, 6.0, 0, { tag: 'canyon', col: '#56786a', bleed: '#3d5c50', ink: false });
  box(70, 0.1, 20.4, -45, WATER_UPPER - 0.05, 0, { tag: 'canyon', col: '#3ea38d', bleed: '#2a806d', pat: PAT.water, hatch: 0, water: true, ink: false });
  box(58, 13.5, 74, -104, 6.0, 0, { tag: 'canyon', col: '#4a6e62', bleed: '#35544a', ink: false });
  box(56, 0.1, 72, -104, WATER_UPPER - 0.05, 0, { tag: 'canyon', col: '#359482', bleed: '#237566', pat: PAT.water, hatch: 0, water: true, ink: false });

  // North-West Old Town plateau (y = PLATEAU_Y = 14.0, x = -78..8, z = -45..-10)
  box(86, 15, 36, -35, PLATEAU_Y - 7.5, -28, TOWN_G);
  // Grassy orchard edge on NW plateau
  box(54, 15, 36, -104, PLATEAU_Y - 7.5, -54, HILL_BG);

  // South-West Spring Meadow ('livada', y = PLATEAU_Y = 14.0, x = -112..-10, z = 10..66)
  box(68, 15, 56, -44, PLATEAU_Y - 7.5, 38, MEADOW_M);
  box(54, 15, 34, -104, PLATEAU_Y - 7.5, 53, MEADOW_M);

  // Mid-hill terrace (y = 22.0, x = -62..20, z = -74..-44) -> St. Luke's, Medvjed-kula, Catacombs
  box(82, 16, 32, -21, 14.0, -59, HILL_BG);
  // Retaining stone wall facing south toward Old Town
  box(82, 8.2, 1.4, -21, 18.0, -44.2, CANYON_BG);
  // Stone ramp / wide steps connecting Old Town (y=14) to Mid-hill (y=22) at x = -28
  for (let i = 0; i < 8; i++) {
    box(6.5, 1.1, 2.2, -28, 14.5 + i * 1.0, -42.5 - i * 1.1, { tag: 'town', col: '#c6bfb2', bleed: '#a49d90', pat: PAT.blocks, ps: 0.7 });
  }

  // Royal Fortress conical green hilltop (y = 32.0, centred at (-6, -88))
  A(CYL16, -6, 16.0, -88, { tag: 'hills', col: '#5c9442', bleed: '#42732d', pat: PAT.grass }, 0, 0, 0, [26, 32, 22]);
  // Flat top grassy terrace for fortress courtyard at y = 32.0
  A(CYL16, -6, 31.6, -88, { tag: 'hills', col: '#74ab52', bleed: '#578a3b', pat: PAT.grass }, 0, 0, 0, [21, 0.8, 17]);

  // Distant green spring hills ringing the horizon ('hills')
  for (const [hx, hy, hz, rx, ry, rz] of [
    [-165, 22, -95, 58, 34, 52], [-170, 18, 25, 48, 28, 66], [-130, 20, 118, 65, 30, 44],
    [-20, 26, -155, 76, 42, 46], [95, 28, -140, 68, 44, 52], [155, 24, 0, 48, 38, 95],
    [120, 22, 130, 64, 34, 48], [-45, 18, 125, 56, 26, 42],
  ]) {
    A(DODE, hx, hy, hz, { tag: 'hills', col: '#5c9145', bleed: '#407030', hull: true, solid: false }, rr(0, 3), 0, 0, [rx, ry, rz]);
  }

  // ==================== 3. ZONE 1: PLIVA WATERFALL & VIEWPOINT (9 words) ====================
  // Travertine cliff ('sedra') at x = -10, z = -12..12, y = 0..13.5
  const SEDRA_M = { tag: 'sedra', col: '#c9be9e', bleed: '#968b6c', pat: PAT.blocks, ps: 0.5, pool: 0.8, orb: 'sedra' };
  const SEDRA_MOSS = { tag: 'sedra', col: '#698f4d', bleed: '#4a6e34', hull: true };
  b.object(() => {
    // Stepped porous tufa ledges forming the curved amphitheatre cliff
    for (const [x, y, z, w, h, d] of [
      [-11.8, 6.4, 0, 4.2, 13.0, 24.0],
      [-9.5, 4.5, -10.5, 5.2, 9.2, 5.5],
      [-9.5, 4.5, 10.5, 5.2, 9.2, 5.5],
      [-8.8, 3.2, -3.5, 3.6, 6.6, 5.0],
      [-8.6, 2.8, 4.2, 3.8, 5.8, 4.8],
      [-7.2, 1.4, -7.5, 3.4, 3.0, 4.0],
      [-7.2, 1.4, 7.8, 3.4, 3.0, 4.0],
    ]) {
      box(w, h, d, x, y, z, SEDRA_M);
    }
    // Rounded mossy tufa cushions & overhangs
    for (const [mx, my, mz, rx, ry, rz] of [
      [-9.2, 12.6, -9.8, 2.2, 1.2, 2.6], [-9.2, 12.6, 9.8, 2.2, 1.2, 2.6],
      [-9.0, 9.2, -1.2, 1.8, 1.4, 2.0], [-8.8, 7.8, 4.4, 2.0, 1.2, 2.2],
      [-7.4, 4.2, -5.5, 1.6, 1.1, 1.8], [-7.4, 3.8, 6.2, 1.6, 1.1, 1.8],
    ]) {
      A(DODE, mx, my, mz, SEDRA_MOSS, 0, 0, 0, [rx, ry, rz]);
    }
  });

  // Pliva Waterfall ('slap') - STAGE 0 (FIRST WORD!)
  const SLAP_W = { tag: 'slap', col: '#dff5f5', bleed: '#8cd4cf', hatch: 0, solid: false, orb: 'slap' };
  const SLAP_F = { tag: 'slap', col: '#ffffff', bleed: '#cdeae8', hull: true, hatch: 0, solid: false };
  b.object(() => {
    // 5 broad white-cyan foaming waterfall curtains plunging from y=13 down to y=0
    for (const [cz, w, d, tilt] of [
      [-6.8, 3.8, 1.1, -0.14], [-3.2, 3.4, 1.2, -0.16], [0.2, 4.2, 1.3, -0.18],
      [4.0, 3.6, 1.2, -0.16], [7.2, 3.4, 1.1, -0.14],
    ]) {
      box(d, 13.6, w, -8.3, 6.6, cz, SLAP_W, 0, 0, tilt);
      // Curved lip at top of fall
      A(CYL12, -9.4, 12.9, cz, SLAP_W, 0, Math.PI / 2, 0, [0.85, w * 0.95, 0.85]);
    }
    // Churning white plunge-pool foam billow at y = 0.2..1.6
    for (let i = 0; i < 12; i++) {
      const fz = -9.5 + i * 1.72;
      const fx = -6.2 + Math.sin(i * 1.7) * 1.1;
      A(ICO, fx, 0.55 + (i % 3) * 0.25, fz, SLAP_F, 0, 0, 0, [1.5, 0.75, 1.6]);
    }
  });

  // Waterfall spray droplets ('kap'): glistening suspended water beads rising right in front of the cascade
  b.object(() => {
    const KAP_M = { tag: 'kap', col: '#bceeff', bleed: '#70c4e8', hull: true, hatch: 0, solid: false, sway: 8.5, orb: 'kap' };
    for (const [kx, ky, kz, ks] of [
      [-2.2, 3.2, 5.2, 0.34], [-1.5, 4.4, 4.6, 0.28], [-2.8, 5.2, 5.8, 0.26],
      [-1.0, 3.6, 6.2, 0.32], [-2.0, 2.4, 6.6, 0.30], [-0.8, 4.8, 5.0, 0.24],
      [-3.1, 3.9, 4.4, 0.30], [-1.8, 5.8, 5.5, 0.22],
    ]) {
      A(SPHERE, kx, ky, kz, KAP_M, 0, 0, 0, [ks * 0.85, ks * 1.25, ks * 0.85]);
    }
  });

  // Rainbow ('duga') arching across the waterfall mist!
  b.object(() => {
    const BANDS = [
      ['#eb5757', 8.8], ['#f2994a', 8.35], ['#f2c94c', 7.9],
      ['#6fcf97', 7.45], ['#56ccf2', 7.0], ['#9b51e0', 6.55],
    ];
    for (const [col, rad] of BANDS) {
      A(new THREE.TorusGeometry(rad, 0.24, 6, 28, Math.PI), 0.5, 1.2, -1.0, {
        tag: 'duga', col, bleed: col, hatch: 0, ink: false, solid: false, orb: 'duga',
      }, Math.PI / 2 - 0.18, 0, 0);
    }
  });

  // East-bank viewing platform (wooden deck jutting over Vrbas at x = 31..39, z = -7..7, y = VIEW_Y)
  box(8.5, 0.35, 14.0, 35.0, VIEW_Y + 0.12, 0, { tag: 'props', col: WOOD_WARM[0], bleed: WOOD_WARM[1], pat: PAT.planks, ps: 3 });
  // Railing along the waterfall-facing edge
  for (const rz of [-6.8, 6.8]) box(8.2, 0.9, 0.16, 35.0, VIEW_Y + 0.65, rz, { tag: 'props', col: WOOD_DARK[0], bleed: WOOD_DARK[1], wall: true });
  box(0.16, 0.9, 13.8, 30.85, VIEW_Y + 0.65, 0, { tag: 'props', col: WOOD_DARK[0], bleed: WOOD_DARK[1], wall: true });

  // Gazebo / pavilion ('sjenica') on the viewpoint park at (43, VIEW_Y, -9)
  b.object(() => {
    const SJ = { tag: 'sjenica', orb: 'sjenica', pool: 0.7 };
    A(CYL, 43, VIEW_Y + 0.22, -9, { ...SJ, col: STONE_GREY[0], bleed: STONE_GREY[1], pat: PAT.blocks, ps: 0.7 }, Math.PI / 8, 0, 0, [3.2, 0.44, 3.2]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      A(CYL, 43 + Math.cos(a) * 2.55, VIEW_Y + 1.85, -9 + Math.sin(a) * 2.55, { ...SJ, col: WOOD_DARK[0], bleed: WOOD_DARK[1], wall: true }, 0, 0, 0, [0.12, 3.0, 0.12]);
    }
    // Conical shingle roof
    A(CONE8, 43, VIEW_Y + 4.35, -9, { ...SJ, col: '#9e4c30', bleed: '#7a3720', pat: PAT.roof }, Math.PI / 8, 0, 0, [3.6, 2.2, 3.6]);
    // Bench inside gazebo
    box(2.0, 0.45, 0.55, 43, VIEW_Y + 0.68, -9, { ...SJ, col: WOOD_WARM[0], bleed: WOOD_WARM[1] });
  });

  // Tulip flowerbed ('lala') at (39.5, VIEW_Y, 8.5)
  b.object(() => {
    box(4.8, 0.24, 2.8, 39.5, VIEW_Y + 0.12, 8.5, { tag: 'props', col: '#69503b', bleed: '#4d3a2a' });
    const TCOLS = [['#e03e3e', '#b02828'], ['#f2b82e', '#c99018'], ['#e85b8a', '#ba3b66']];
    for (let i = 0; i < 15; i++) {
      const tx = 37.6 + (i % 5) * 0.95 + (R() - 0.5) * 0.18;
      const tz = 7.6 + Math.floor(i / 5) * 0.85 + (R() - 0.5) * 0.18;
      const [c1, c2] = TCOLS[i % TCOLS.length];
      A(CYL, tx, VIEW_Y + 0.48, tz, { tag: 'lala', col: '#4a8a3e', bleed: '#34692b', solid: false }, 0, 0, 0, [0.035, 0.46, 0.035]);
      A(CONE8, tx, VIEW_Y + 0.78, tz, { tag: 'lala', col: c1, bleed: c2, hull: true, solid: false, orb: 'lala' }, 0, Math.PI, 0, [0.16, 0.26, 0.16]);
    }
  });

  // Dandelions ('maslacak') patch on the viewpoint lawn at (45, VIEW_Y, 4.0)
  b.object(() => {
    for (let i = 0; i < 14; i++) {
      const mx = 43.2 + (i % 4) * 1.15 + (R() - 0.5) * 0.4;
      const mz = 2.4 + Math.floor(i / 4) * 1.05 + (R() - 0.5) * 0.4;
      A(CYL, mx, VIEW_Y + 0.24, mz, { tag: 'maslacak', col: '#5a9440', bleed: '#40702c', solid: false }, 0, 0, 0, [0.025, 0.36, 0.025]);
      A(ICO, mx, VIEW_Y + 0.46, mz, { tag: 'maslacak', col: '#ffd22b', bleed: '#dba514', hull: true, solid: false, orb: 'maslacak' }, 0, 0, 0, [0.16, 0.11, 0.16]);
    }
  });

  // Viewpoint visitors: woman with binoculars ('dvogled') and hiker with backpack ('ruksak')
  people.push({ kind: 'jajBinoc', x: 32.2, y: VIEW_Y + 0.30, z: -2.0, ry: -Math.PI / 2, tag: 'passerby', woman: true });
  people.push({ kind: 'jajHiker', x: 32.4, y: VIEW_Y + 0.30, z: 3.4, ry: -Math.PI / 2, tag: 'passerby' });

  // ==================== 4. ZONE 2: WOODEN WATERMILLS - MLINČIĆI (10 words) ====================
  // Low stone-and-timber dam/weir ('brana') guiding water to the mills at x = -36, z = -9.5..9.5
  b.object(() => {
    const BR = { tag: 'brana', col: '#a8a092', bleed: '#827a6c', pat: PAT.blocks, ps: 0.6, orb: 'brana' };
    box(2.0, 1.35, 19.6, -36, WATER_UPPER - 0.25, 0, BR);
    box(0.55, 0.55, 19.6, -35.2, WATER_UPPER + 0.45, 0, { tag: 'brana', col: WOOD_DARK[0], bleed: WOOD_DARK[1] });
    for (let i = 0; i < 7; i++) {
      A(ICO, -34.6, WATER_UPPER + 0.06, -8.0 + i * 2.65, { tag: 'brana', col: '#eef9f7', bleed: '#c8e6e2', hull: true, hatch: 0, solid: false }, 0, 0, 0, [0.55, 0.18, 1.0]);
    }
  });

  // 5 iconic Jajce wooden watermills ('mlin') on oak stilts over the Pliva at x = -48..-66
  const MILL_POS = [
    [-46, -5.2, 0.05], [-52, 4.8, -0.08], [-58, -4.6, 0.04], [-64, 4.2, -0.05], [-70, -5.0, 0.06],
  ];
  for (let i = 0; i < MILL_POS.length; i++) {
    const [mx, mz, ry] = MILL_POS[i];
    const ML = { tag: 'mlin', orb: 'mlin', pool: 0.7 };
    b.object(() => {
      // 4 oak stilts down into the stream
      for (const sx of [-1.45, 1.45]) for (const sz of [-1.25, 1.25]) {
        box(0.24, 2.2, 0.24, mx + sx, WATER_UPPER + 0.2, mz + sz, { ...ML, col: WOOD_DARK[0], bleed: WOOD_DARK[1] });
      }
      // Plank floor deck + timber cabin body
      box(3.8, 0.24, 3.4, mx, WATER_UPPER + 1.35, mz, { ...ML, col: WOOD_WARM[0], bleed: WOOD_WARM[1], pat: PAT.planks, ps: 3 }, ry);
      box(3.3, 2.3, 2.8, mx, WATER_UPPER + 2.6, mz, { ...ML, col: '#7a5636', bleed: '#593c24', pat: PAT.planks, ps: 3 }, ry);
      // Dark steep hipped shingle roof
      A(hipRoofGeo(4.1, 3.6, 2.2), mx, WATER_UPPER + 3.75, mz, { ...ML, col: SHINGLE[0], bleed: SHINGLE[1], pat: PAT.roof }, ry);
      // Little wooden door
      box(0.85, 1.55, 0.12, mx, WATER_UPPER + 2.25, mz + (mz < 0 ? 1.42 : -1.42), { ...ML, col: '#3d2818', bleed: '#28180d' }, ry);
    });
    // Animated wooden waterwheel ('tocak') mounted on the stream-facing side of each mill!
    const wg = new THREE.Group();
    const wz = mz + (mz < 0 ? 1.65 : -1.65);
    wg.position.set(mx, WATER_UPPER + 0.95, wz);
    scene.add(wg);
    dynMesh(new THREE.TorusGeometry(0.95, 0.11, 6, 16), 'tocak', '#6e4a2a', '#4f331b', wg, 0, 0, 0, 1, 1.3);
    dynMesh(CYL, 'tocak', '#4a311c', '#332011', wg, 0, 0, 0, [0.16, 0.45, 0.16], 1.2).rotation.x = Math.PI / 2;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const sp = dynMesh(BOX, 'tocak', '#7d5634', '#593b21', wg, Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0, [0.95, 0.10, 0.24], 1.2);
      sp.rotation.z = a;
    }
    wheels.push({ g: wg, speed: 1.5 + (i % 3) * 0.28 });
  }

  // Wooden footbridge ('brvno') crossing the Pliva stream between the mills at x = -55, z = -10.5..10.5
  b.object(() => {
    const BV = { tag: 'brvno', col: '#8d653e', bleed: '#6b4a2b', pat: PAT.planks, ps: 3, orb: 'brvno' };
    box(2.4, 0.26, 21.5, -55, PLATEAU_Y + 0.16, 0, BV);
    for (let z = -9; z <= 9; z += 3.0) {
      for (const sx of [-1.08, 1.08]) box(0.14, 0.92, 0.14, -55 + sx, PLATEAU_Y + 0.65, z, { ...BV, wall: true });
    }
    for (const sx of [-1.08, 1.08]) box(0.12, 0.12, 21.2, -55 + sx, PLATEAU_Y + 1.08, 0, { ...BV, wall: true });
  });

  // Miller ('mlinar'), flour ('brasno'), wheat ('zito'), sacks ('vreca'), oak planks ('daska') on north bank beside Mlinčići (x = -46..-64, z = -13..-17, y = PLATEAU_Y)
  people.push({ kind: 'jajMiller', x: -49.2, y: PLATEAU_Y + 0.06, z: -13.2, ry: 0.4, tag: 'mlinar' });

  // Open wooden flour trough & bright white flour mound ('brasno') at (-46.5, PLATEAU_Y, -13.2)
  b.object(() => {
    box(1.5, 0.72, 0.9, -46.5, PLATEAU_Y + 0.36, -13.2, { tag: 'props', col: WOOD_WARM[0], bleed: WOOD_WARM[1], pat: PAT.planks, ps: 3 });
    A(ICO, -46.5, PLATEAU_Y + 0.82, -13.2, { tag: 'brasno', col: '#fcfaf2', bleed: '#e8e2d2', hull: true, orb: 'brasno' }, 0, 0, 0, [0.58, 0.32, 0.38]);
    A(ICO, -46.9, PLATEAU_Y + 0.85, -13.1, { tag: 'brasno', col: '#ffffff', bleed: '#ebe5d5', hull: true }, 0, 0, 0, [0.28, 0.22, 0.26]);
  });

  // Stacked burlap sacks ('vreca') at (-51.8, PLATEAU_Y, -13.4)
  b.object(() => {
    const VR = { tag: 'vreca', col: '#d8c8a2', bleed: '#b5a27a', hull: true, orb: 'vreca' };
    for (const [vx, vy, vz, sx, sy, sz] of [
      [-51.8, PLATEAU_Y + 0.42, -13.4, 0.46, 0.56, 0.38],
      [-52.6, PLATEAU_Y + 0.38, -13.2, 0.44, 0.52, 0.36],
      [-52.2, PLATEAU_Y + 0.88, -13.3, 0.48, 0.32, 0.38],
    ]) A(ICO, vx, vy, vz, VR, 0, 0, 0, [sx, sy, sz]);
  });

  // Golden wheat sheaves ('zito') leaning by the mill at (-59.2, PLATEAU_Y, -13.5)
  b.object(() => {
    const ZT = { tag: 'zito', col: '#e6be4c', bleed: '#c49628', hull: true, orb: 'zito' };
    for (const dx of [-0.65, 0, 0.65]) {
      A(CYL, -59.2 + dx, PLATEAU_Y + 0.62, -13.5, ZT, 0, 0, dx * 0.12, [0.26, 1.2, 0.26]);
      A(CONE8, -59.2 + dx, PLATEAU_Y + 1.35, -13.5, ZT, 0, 0, dx * 0.12, [0.34, 0.42, 0.34]);
    }
  });

  // Stacked sawn oak planks ('daska') on the south mill bank at (-49.5, PLATEAU_Y, 13.4)
  b.object(() => {
    const DK = { tag: 'daska', col: '#b88854', bleed: '#916638', pat: PAT.planks, ps: 3, orb: 'daska' };
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        box(2.8, 0.14, 0.36, -49.5, PLATEAU_Y + 0.10 + row * 0.16, 13.0 + col * 0.42, DK, (row % 2) * 0.03);
      }
    }
  });

  // Natural hillside spring ('izvor') bubbling out of mossy stone at (-66, PLATEAU_Y, -16.5)
  b.object(() => {
    A(DODE, -66, PLATEAU_Y + 1.2, -17.8, { tag: 'izvor', col: '#8d8c82', bleed: '#696860', hull: true, orb: 'izvor' }, 0.3, 0, 0, [2.2, 1.6, 1.5]);
    // Clear sparkling stream pouring from the rock into a little stone basin
    box(0.42, 1.15, 0.35, -66, PLATEAU_Y + 0.68, -16.4, { tag: 'izvor', col: '#9ee4f0', bleed: '#5bc0d6', hatch: 0, solid: false }, 0, 0.3, 0);
    A(CYL12, -66, PLATEAU_Y + 0.16, -15.6, { tag: 'izvor', col: '#56c2cf', bleed: '#3899a8', hatch: 0 }, 0, 0, 0, [1.5, 0.24, 1.2]);
  });

  // ==================== 5. ZONE 3: PLIVA LAKE & SPRING MEADOW (13 words) ====================
  // 3 graceful white swans ('labud') on Pliva Lake around (-94, WATER_UPPER, -4)
  for (let i = 0; i < 3; i++) {
    const sg = new THREE.Group();
    const hx = -92 - i * 4.5, hz = -6 + i * 5.2;
    sg.position.set(hx, WATER_UPPER + 0.12, hz);
    sg.rotation.y = i * 1.4;
    scene.add(sg);
    dynMesh(ICO, 'labud', '#ffffff', '#e2e6ec', sg, 0, 0.14, 0, [0.42, 0.28, 0.62], 1.3);
    dynMesh(CYL, 'labud', '#ffffff', '#e2e6ec', sg, 0, 0.56, 0.42, [0.09, 0.62, 0.09], 1.2).rotation.x = 0.22;
    dynMesh(SPHERE, 'labud', '#ffffff', '#e2e6ec', sg, 0, 0.86, 0.52, [0.13, 0.12, 0.15], 1.2);
    dynMesh(CONE4, 'labud', '#e88b2c', '#bd6816', sg, 0, 0.84, 0.68, [0.06, 0.18, 0.06], 1.1).rotation.x = Math.PI / 2;
    swans.push({ g: sg, home: V(hx, WATER_UPPER + 0.12, hz), r: 3.2 + i * 0.9, speed: 0.28 + i * 0.06, phase: i * 2.1 });
  }

  // Water lilies ('lokvanj') floating near the lake shore (-84..-92, WATER_UPPER, 4..14)
  b.object(() => {
    const LOK_G = { tag: 'lokvanj', col: '#4f9446', bleed: '#367030', solid: false, orb: 'lokvanj' };
    const LOK_F = { tag: 'lokvanj', col: '#fff0f5', bleed: '#e8b8cc', hull: true, solid: false };
    for (const [lx, lz, hasFl] of [
      [-85.5, 6.2, true], [-87.0, 7.8, false], [-84.8, 8.6, true],
      [-88.4, 5.4, true], [-86.2, 10.2, false], [-89.5, 9.0, true], [-83.8, 6.8, false],
    ]) {
      A(CYL12, lx, WATER_UPPER + 0.04, lz, LOK_G, 0, 0, 0, [0.58, 0.05, 0.58]);
      if (hasFl) A(ICO, lx, WATER_UPPER + 0.14, lz, LOK_F, 0, 0, 0, [0.22, 0.14, 0.22]);
    }
  });

  // Green frog ('zaba') sitting on a lily pad at (-85.5, WATER_UPPER + 0.16, 6.2)
  const frogG = new THREE.Group();
  frogG.position.set(-85.5, WATER_UPPER + 0.16, 6.2);
  frogG.rotation.y = 0.8;
  scene.add(frogG);
  dynMesh(ICO, 'zaba', '#4da838', '#337a24', frogG, 0, 0.10, 0, [0.22, 0.16, 0.28], 1.2);
  dynMesh(SPHERE, 'zaba', '#5ec246', '#3d8f2b', frogG, -0.09, 0.22, 0.14, 0.07, 1.1);
  dynMesh(SPHERE, 'zaba', '#5ec246', '#3d8f2b', frogG, 0.09, 0.22, 0.14, 0.07, 1.1);

  // Tall lakeside reeds ('trska') along the shallow shore at (-78..-84, WATER_UPPER, 14..26)
  b.object(() => {
    const TR_S = { tag: 'trska', col: '#69994a', bleed: '#4c7534', solid: false, orb: 'trska' };
    const TR_T = { tag: 'trska', col: '#6e482b', bleed: '#4f321c', solid: false };
    for (let i = 0; i < 18; i++) {
      const rx = -79.2 - (i % 6) * 0.85 + (R() - 0.5) * 0.35;
      const rz = 14.5 + Math.floor(i / 6) * 2.4 + (R() - 0.5) * 0.6;
      const h = 1.9 + R() * 0.9;
      A(CYL, rx, WATER_UPPER + h / 2, rz, TR_S, 0, 0, (R() - 0.5) * 0.12, [0.04, h, 0.04]);
      A(CYL, rx, WATER_UPPER + h - 0.18, rz, TR_T, 0, 0, 0, [0.075, 0.32, 0.075]);
    }
  });

  // Weeping willow trees ('vrba') drooping over Pliva Lake at (-79, PLATEAU_Y, -18) and (-82, PLATEAU_Y, 26)
  for (const [wx, wz] of [[-79, -18], [-82, 26]]) {
    b.object(() => {
      const VB_T = { tag: 'vrba', col: '#694e34', bleed: '#4d3824', orb: 'vrba' };
      const VB_L = { tag: 'vrba', col: '#78b056', bleed: '#54873a', hull: true, sway: 5.5 };
      A(CYL, wx, PLATEAU_Y + 2.2, wz, VB_T, 0, 0, 0, [0.42, 4.4, 0.42]);
      A(ICO, wx, PLATEAU_Y + 5.2, wz, VB_L, 0, 0, 0, [3.2, 2.2, 3.2]);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        box(0.32, 3.6, 0.32, wx + Math.cos(a) * 2.4, PLATEAU_Y + 2.8, wz + Math.sin(a) * 2.4, { ...VB_L, solid: false });
      }
    });
  }

  // Wooden lakeside pier with fisherman ('pecati'), rod ('udica') and bucket ('kanta') at (-78, PLATEAU_Y, -6)
  box(5.5, 0.24, 2.4, -79.5, PLATEAU_Y - 0.1, -6.0, { tag: 'props', col: WOOD_WARM[0], bleed: WOOD_WARM[1], pat: PAT.planks, ps: 3 });
  for (const px of [-81.8, -77.5]) for (const pz of [-7.0, -5.0]) box(0.22, 1.6, 0.22, px, WATER_UPPER + 0.4, pz, { tag: 'props', col: WOOD_DARK[0], bleed: WOOD_DARK[1] });
  people.push({ kind: 'jajFish', x: -81.5, y: PLATEAU_Y + 0.02, z: -6.0, ry: -Math.PI / 2, tag: 'pecati' });
  // Bucket ('kanta') sitting on the pier beside the fisherman
  b.object(() => {
    A(new THREE.CylinderGeometry(0.24, 0.18, 0.42, 10), -81.1, PLATEAU_Y + 0.23, -4.95, {
      tag: 'kanta', col: '#5a8ab0', bleed: '#3c688a', orb: 'kanta',
    });
  });

  // Clover patch ('djetelina') on the SW spring meadow at (-52, PLATEAU_Y, 26)
  b.object(() => {
    const DJ = { tag: 'djetelina', col: '#3e8c38', bleed: '#286924', hull: true, solid: false, orb: 'djetelina' };
    for (let i = 0; i < 16; i++) {
      const cx = -54 + (i % 4) * 1.1 + (R() - 0.5) * 0.3;
      const cz = 24.5 + Math.floor(i / 4) * 1.0 + (R() - 0.5) * 0.3;
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2;
        A(ICO, cx + Math.cos(a) * 0.14, PLATEAU_Y + 0.12, cz + Math.sin(a) * 0.14, DJ, 0, 0, 0, [0.14, 0.06, 0.14]);
      }
    }
  });

  // Colourful wooden beehives ('kosnica') on the SW meadow at (-36, PLATEAU_Y, 34)
  b.object(() => {
    const HCOLS = [['#e6b83a', '#c2921c'], ['#5c94bd', '#3e7096'], ['#d66b4a', '#ab4c30']];
    for (let i = 0; i < 3; i++) {
      const hx = -38 + i * 2.0, hz = 34;
      const [c1, c2] = HCOLS[i];
      box(1.05, 0.25, 0.9, hx, PLATEAU_Y + 0.14, hz, { tag: 'kosnica', col: WOOD_DARK[0], bleed: WOOD_DARK[1] });
      box(0.96, 1.05, 0.84, hx, PLATEAU_Y + 0.78, hz, { tag: 'kosnica', col: c1, bleed: c2, pat: PAT.planks, ps: 4, orb: 'kosnica' });
      A(hipRoofGeo(1.16, 1.04, 0.42), hx, PLATEAU_Y + 1.30, hz, { tag: 'kosnica', col: '#694d35', bleed: '#4d3623' });
    }
  });

  // Bees ('pcela') orbiting the beehives
  for (let i = 0; i < 6; i++) {
    const bg = new THREE.Group();
    const bx = -36 + (i - 2.5) * 0.8, by = PLATEAU_Y + 1.55 + (i % 2) * 0.3, bz = 33.2;
    bg.position.set(bx, by, bz);
    scene.add(bg);
    dynMesh(ICO, 'pcela', '#f2c629', '#c99b10', bg, 0, 0, 0, [0.11, 0.09, 0.16], 1.1);
    dynMesh(BOX, 'pcela', '#2b241d', '#1c1712', bg, 0, 0, 0, [0.12, 0.10, 0.04], 1.0);
    dynMesh(BOX, 'pcela', '#eef7fa', '#cde2eb', bg, 0, 0.08, 0, [0.24, 0.02, 0.08], 1.0);
    bees.push({ g: bg, home: V(bx, by, bz), r: 0.9 + (i % 3) * 0.35, speed: 2.4 + i * 0.3, phase: i * 1.1 });
  }

  // Butterflies ('leptir') fluttering over the SW meadow at (-64, PLATEAU_Y + 1.2, 28)
  const BF_COLS = [['#f2a830', '#d47f14'], ['#e86898', '#bf4574'], ['#62b8e8', '#3c8ec2'], ['#f5d442', '#ccaa1e']];
  for (let i = 0; i < 5; i++) {
    const bfg = new THREE.Group();
    const bx = -64 + (i - 2) * 1.5, by = PLATEAU_Y + 1.15 + (i % 2) * 0.35, bz = 28 + (i % 3 - 1) * 1.4;
    bfg.position.set(bx, by, bz);
    scene.add(bfg);
    const [c1, c2] = BF_COLS[i % BF_COLS.length];
    dynMesh(BOX, 'leptir', '#362e28', '#221c18', bfg, 0, 0, 0, [0.04, 0.05, 0.24], 1.0);
    const lw = new THREE.Group(); bfg.add(lw);
    const rw = new THREE.Group(); bfg.add(rw);
    dynMesh(BOX, 'leptir', c1, c2, lw, -0.16, 0, 0, [0.26, 0.02, 0.24], 1.0);
    dynMesh(BOX, 'leptir', c1, c2, rw, 0.16, 0, 0, [0.26, 0.02, 0.24], 1.0);
    butterflies.push({ g: bfg, lw, rw, home: V(bx, by, bz), r: 1.8 + (i % 3) * 0.6, speed: 0.95 + i * 0.14, phase: i * 1.3 });
  }

  // ==================== 6. ZONE 4: OLD TOWN JAJCE, ORCHARDS & SPRING MARKET (14 words) ====================
  // Traditional Bosnian white-walled houses with steep dark-shingle hipped roofs ('town')
  function buildBosnianHouse(hx, hz, w, d, h, ry = 0, hasChimney = false) {
    const TN = { tag: 'town', pool: 0.7 };
    b.object(() => {
      // Stone base plinth
      box(w, 1.4, d, hx, PLATEAU_Y + 0.7, hz, { ...TN, col: STONE_GREY[0], bleed: STONE_GREY[1], pat: PAT.blocks, ps: 0.7 }, ry);
      // Overhanging white limewashed upper floor
      box(w + 0.45, h, d + 0.45, hx, PLATEAU_Y + 1.4 + h / 2, hz, { ...TN, col: LIME[0], bleed: LIME[1] }, ry);
      // Steep Bosnian dark-shingle hipped roof
      A(hipRoofGeo(w + 1.2, d + 1.2, 3.1), hx, PLATEAU_Y + 1.4 + h, hz, { ...TN, col: SHINGLE[0], bleed: SHINGLE[1], pat: PAT.roof }, ry);
      // Small dark timber windows on front & back
      for (const sx of [-w * 0.26, w * 0.26]) {
        box(0.7, 0.95, 0.1, hx + Math.cos(ry) * sx, PLATEAU_Y + 1.4 + h * 0.55, hz + d / 2 + 0.24, { ...TN, col: '#4a3525', solid: false }, ry);
      }
      if (hasChimney) {
        box(0.85, 1.5, 0.85, hx + 0.9, PLATEAU_Y + 1.4 + h + 2.4, hz, { ...TN, col: STONE_WARM[0], bleed: STONE_WARM[1] });
        smoke.push(V(hx + 0.9, PLATEAU_Y + 1.4 + h + 3.25, hz));
      }
    });
  }
  buildBosnianHouse(-8, -22, 6.2, 5.4, 3.0, 0.05, true);
  buildBosnianHouse(-34, -22, 6.8, 5.6, 3.2, -0.08, false);
  buildBosnianHouse(-48, -26, 6.0, 5.2, 3.0, 0.12, true);
  buildBosnianHouse(-16, -34, 6.4, 5.4, 3.1, -0.04, false);
  buildBosnianHouse(-40, -35, 6.2, 5.2, 2.9, 0.06, false);

  // Stork ('roda') standing in its wide twig nest ('gnijezdo') atop the Bosnian house chimney at (-8, PLATEAU_Y + 7.6, -22)
  const NEST_Y = PLATEAU_Y + 1.4 + 3.0 + 3.2;
  b.object(() => {
    A(CYL12, -7.1, NEST_Y + 0.15, -22, { tag: 'gnijezdo', col: '#7d5a38', bleed: '#5c3f24', hull: true, orb: 'gnijezdo' }, 0, 0, 0, [0.95, 0.36, 0.95]);
    A(new THREE.TorusGeometry(0.88, 0.18, 6, 12), -7.1, NEST_Y + 0.28, -22, { tag: 'gnijezdo', col: '#694a2c', bleed: '#4c341d' }, 0, Math.PI / 2, 0);
  });
  b.object(() => {
    const RD = { tag: 'roda', orb: 'roda' };
    // Long red legs
    for (const sx of [-0.12, 0.12]) A(CYL, -7.1 + sx, NEST_Y + 0.72, -22, { ...RD, col: '#d94c38', bleed: '#a83322' }, 0, 0, 0, [0.035, 0.86, 0.035]);
    // White body + black wing tips + long neck + red beak
    A(ICO, -7.1, NEST_Y + 1.24, -22, { ...RD, col: '#ffffff', bleed: '#e2e6eb', hull: true }, 0, 0, 0, [0.28, 0.26, 0.44]);
    A(ICO, -7.1, NEST_Y + 1.22, -22.24, { ...RD, col: '#2b2d30', bleed: '#1c1d1f', hull: true }, 0, 0, 0, [0.22, 0.18, 0.26]);
    A(CYL, -7.1, NEST_Y + 1.66, -21.72, { ...RD, col: '#ffffff', bleed: '#e2e6eb' }, 0, 0.2, 0, [0.075, 0.56, 0.075]);
    A(SPHERE, -7.1, NEST_Y + 1.98, -21.65, { ...RD, col: '#ffffff', bleed: '#e2e6eb', hull: true }, 0, 0, 0, 0.12);
    A(CONE4, -7.1, NEST_Y + 1.96, -21.40, { ...RD, col: '#d94c38', bleed: '#a83322' }, Math.PI / 2, 0, 0, [0.045, 0.34, 0.045]);
  });

  // Swallows ('lasta') circling over the old town square once awake
  for (let i = 0; i < 5; i++) {
    const slg = new THREE.Group();
    const sx = -22 + (i - 2) * 2.2, sy = PLATEAU_Y + 6.5 + (i % 2) * 1.1, sz = -25;
    slg.position.set(sx, sy, sz);
    scene.add(slg);
    dynMesh(ICO, 'lasta', '#2c3d59', '#1c283d', slg, 0, 0, 0, [0.12, 0.10, 0.28], 1.1);
    const lw = new THREE.Group(); slg.add(lw);
    const rw = new THREE.Group(); slg.add(rw);
    dynMesh(BOX, 'lasta', '#25334a', '#182233', lw, -0.26, 0, 0, [0.46, 0.03, 0.14], 1.0);
    dynMesh(BOX, 'lasta', '#25334a', '#182233', rw, 0.26, 0, 0, [0.46, 0.03, 0.14], 1.0);
    swallows.push({ g: slg, lw, rw, home: V(-22, sy, -25), r: 6.5 + i * 1.4, speed: 0.9 + i * 0.12, phase: i * 1.25 });
  }

  // Blooming Cherry trees ('tresnja'), Plum trees ('sljiva') & Spring Blossom ('behar') in the Old Town orchard
  function buildBlossomTree(tx, ty, tz, treeTag, canopyCols, scale = 1.0, blossomTag = null) {
    const TR = { tag: treeTag, col: '#5c402c', bleed: '#402b1c', orb: treeTag };
    const [c1, c2] = canopyCols;
    const LF = { tag: blossomTag || treeTag, col: c1, bleed: c2, hull: true, sway: 5.5 };
    b.object(() => {
      A(CYL, tx, ty + 1.8 * scale, tz, TR, 0, 0, 0, [0.28 * scale, 3.6 * scale, 0.28 * scale]);
      for (const [ox, oy, oz, r] of [[0, 4.0, 0, 2.0], [-1.2, 3.5, 0.7, 1.4], [1.2, 3.6, -0.6, 1.45], [0.2, 4.7, 0.3, 1.35]]) {
        A(ICO, tx + ox * scale, ty + oy * scale, tz + oz * scale, LF, 0, 0, 0, r * scale);
      }
    });
    petalEmitters.push({ x: tx, y: ty + 4.2 * scale, z: tz, r: 2.2 * scale });
  }
  // Cherry trees ('tresnja')
  buildBlossomTree(-28, PLATEAU_Y, -16, 'tresnja', PINK_BLOSSOM[0], 1.05);
  buildBlossomTree(-14, PLATEAU_Y, -15, 'tresnja', PINK_BLOSSOM[1], 0.95);
  // Plum trees ('sljiva')
  buildBlossomTree(-39, PLATEAU_Y, -16, 'sljiva', WHITE_BLOSSOM[0], 1.05);
  buildBlossomTree(-56, PLATEAU_Y, -24, 'sljiva', WHITE_BLOSSOM[1], 0.95);
  // Dedicated 'behar' (spring blossom) showcase arch & canopy right by the orchard walk at (-22, PLATEAU_Y, -15)
  buildBlossomTree(-22, PLATEAU_Y, -15, 'town', PINK_BLOSSOM[2], 1.15, 'behar');
  buildBlossomTree(-6, PLATEAU_Y, -14, 'town', WHITE_BLOSSOM[0], 1.0, 'behar');

  // Close-up spring buds ('pupoljak') on a low flowering shrub at (-24.5, PLATEAU_Y, -19.2)
  b.object(() => {
    A(CYL, -24.5, PLATEAU_Y + 0.55, -19.2, { tag: 'props', col: '#5c402c', bleed: '#422c1d' }, 0, 0, 0.25, [0.06, 1.1, 0.06]);
    A(CYL, -24.2, PLATEAU_Y + 0.85, -19.1, { tag: 'props', col: '#5c402c', bleed: '#422c1d' }, 0, 0, -0.45, [0.045, 0.85, 0.045]);
    const PU = { tag: 'pupoljak', col: '#f28cb0', bleed: '#c95f86', hull: true, orb: 'pupoljak' };
    for (const [bx, by, bz] of [
      [-24.6, 1.15, -19.2], [-24.1, 1.28, -19.1], [-23.85, 1.05, -19.05],
      [-24.4, 0.95, -19.35], [-24.0, 1.12, -19.28],
    ]) A(ICO, bx, PLATEAU_Y + by, bz, PU, 0, 0, 0, [0.13, 0.19, 0.13]);
  });

  // Exposed gnarled tree roots ('korijen') gripping the mossy bank at (-32.5, PLATEAU_Y, -13.0)
  b.object(() => {
    A(CYL, -32.5, PLATEAU_Y + 2.2, -13.0, { tag: 'town', col: '#5c402c', bleed: '#402c1c' }, 0, 0, 0, [0.55, 4.4, 0.55]);
    A(ICO, -32.5, PLATEAU_Y + 5.0, -13.0, { tag: 'town', col: '#69a64c', bleed: '#4c8035', hull: true }, 0, 0, 0, [2.6, 2.0, 2.6]);
    const KR = { tag: 'korijen', col: '#6e4b30', bleed: '#4d321e', hull: true, orb: 'korijen' };
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.3;
      box(0.32, 0.30, 1.55, -32.5 + Math.sin(a) * 0.95, PLATEAU_Y + 0.22, -13.0 + Math.cos(a) * 0.95, KR, a, 0.26, 0);
    }
  });

  // Open-air spring market ('pijaca') at (-20, PLATEAU_Y, -25) with baskets ('korpa') & strawberries ('jagoda')
  b.object(() => {
    const PJ = { tag: 'pijaca', orb: 'pijaca' };
    for (const [sx, sz, col] of [[-22.5, -25.5, '#d9573b'], [-17.5, -25.5, '#3f7aa8']]) {
      box(3.4, 0.95, 1.4, sx, PLATEAU_Y + 0.48, sz, { ...PJ, col: WOOD_WARM[0], bleed: WOOD_WARM[1], pat: PAT.planks, ps: 3 });
      for (const px of [-1.55, 1.55]) for (const pz of [-0.6, 0.6])
        box(0.12, 2.3, 0.12, sx + px, PLATEAU_Y + 1.2, sz + pz, { ...PJ, col: WOOD_DARK[0], bleed: WOOD_DARK[1] });
      box(3.8, 0.14, 2.0, sx, PLATEAU_Y + 2.42, sz, { ...PJ, col, bleed: col }, 0, 0.18, 0);
    }
  });
  // Woven willow baskets ('korpa') & red strawberries ('jagoda') on the market stalls
  b.object(() => {
    for (const [kx, kz] of [[-23.2, -25.4], [-21.8, -25.4], [-18.2, -25.4], [-16.8, -25.4]]) {
      A(new THREE.CylinderGeometry(0.36, 0.26, 0.32, 10), kx, PLATEAU_Y + 1.12, kz, {
        tag: 'korpa', col: '#c49658', bleed: '#996f38', pat: PAT.planks, ps: 4, orb: 'korpa',
      });
    }
    for (const [jx, jz] of [[-23.2, -25.4], [-21.8, -25.4]]) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        A(CONE8, jx + Math.cos(a) * 0.14, PLATEAU_Y + 1.32, jz + Math.sin(a) * 0.14, {
          tag: 'jagoda', col: '#d93238', bleed: '#a31d22', hull: true, orb: 'jagoda',
        }, 0, Math.PI, 0, [0.11, 0.16, 0.11]);
      }
    }
  });

  // Gardener ('vrtlar') watering ('zalijevati') a spring flowerbed with a hoe ('motika') at (-13, PLATEAU_Y, -27)
  box(3.2, 0.22, 1.8, -11.4, PLATEAU_Y + 0.11, -27.0, { tag: 'props', col: '#694e38', bleed: '#4d3726' });
  people.push({ kind: 'jajGarden', x: -13.1, y: PLATEAU_Y + 0.04, z: -27.0, ry: Math.PI / 2, tag: 'vrtlar', woman: true });
  // Garden hoe ('motika') leaning against a low wooden post at (-14.5, PLATEAU_Y, -25.8)
  b.object(() => {
    box(0.08, 1.55, 0.08, -14.5, PLATEAU_Y + 0.78, -25.8, { tag: 'motika', col: '#8c633b', bleed: '#694726', orb: 'motika' }, 0, 0, 0.24);
    box(0.36, 0.22, 0.06, -14.72, PLATEAU_Y + 0.14, -25.8, { tag: 'motika', col: '#5a5f66', bleed: '#3d4147' }, 0, 0, 0.24);
  });

  // ==================== 7. ZONE 5: ST. LUKE'S BELL TOWER, MEDVJED-KULA & CATACOMBS (9 words) ====================
  const MID_Y = 22.0;

  // St. Luke's Bell Tower ('zvonik') & bronze bell ('zvono') at (-16, MID_Y, -52)
  b.object(() => {
    const ZV = { tag: 'zvonik', col: STONE_WARM[0], bleed: STONE_WARM[1], pat: PAT.blocks, ps: 0.65, pool: 0.8, orb: 'zvonik' };
    // Square 15th-century Romanesque-Gothic stone campanile (4.4 x 4.4, 16 m tall)
    box(4.4, 13.5, 4.4, -16, MID_Y + 6.75, -52, ZV);
    // Open belfry pillars at the top (y = MID_Y + 13.5..16.5) so the bronze bell is clearly visible!
    for (const sx of [-1.85, 1.85]) for (const sz of [-1.85, 1.85]) {
      box(0.7, 3.0, 0.7, -16 + sx, MID_Y + 15.0, -52 + sz, ZV);
    }
    // Stone cornice & pyramid spire roof
    box(4.8, 0.5, 4.8, -16, MID_Y + 16.75, -52, ZV);
    A(hipRoofGeo(4.8, 4.8, 3.6), -16, MID_Y + 17.0, -52, { tag: 'zvonik', col: '#5c554c', bleed: '#423c35', pat: PAT.roof });
    // Arched windows on south face
    for (const wy of [MID_Y + 5.5, MID_Y + 9.5]) {
      box(0.95, 1.7, 0.15, -16, wy, -49.75, { tag: 'zvonik', col: '#3a342e', solid: false });
    }
  });
  // Bronze bell ('zvono') hanging inside St. Luke's belfry
  b.object(() => {
    A(CONE8, -16, MID_Y + 15.25, -52, { tag: 'zvono', col: '#c99c3c', bleed: '#967022', hull: true, orb: 'zvono' }, 0, 0, 0, [0.78, 1.15, 0.78]);
    A(SPHERE, -16, MID_Y + 14.55, -52, { tag: 'zvono', col: '#967022', bleed: '#6e5014' }, 0, 0, 0, 0.22);
  });

  // Medvjed-kula (stout round Bear Tower) & carved stone masonry ('kamen') at (-42, MID_Y, -54)
  b.object(() => {
    const KM = { tag: 'kamen', col: '#b8b1a2', bleed: '#8f887a', pat: PAT.blocks, ps: 0.6, pool: 0.8, orb: 'kamen' };
    A(CYL16, -42, MID_Y + 4.8, -54, KM, 0, 0, 0, [4.6, 9.6, 4.6]);
    A(CYL16, -42, MID_Y + 9.8, -54, KM, 0, 0, 0, [4.9, 0.6, 4.9]);
    // Hewn medieval stone blocks stacked beside the tower
    for (let i = 0; i < 4; i++) {
      box(1.15, 0.65, 0.85, -36.0 + (i % 2) * 1.25, MID_Y + 0.34 + Math.floor(i / 2) * 0.66, -51.5, KM);
    }
  });

  // Travnik Medieval Gate: stone passage ('prolaz'), curved vault ('svod'), royal coat of arms ('grb') & crown ('kruna') at (2, MID_Y, -54)
  b.object(() => {
    const PR = { tag: 'prolaz', col: STONE_WARM[0], bleed: STONE_WARM[1], pat: PAT.blocks, ps: 0.65, orb: 'prolaz' };
    // Twin stone gate piers leaving an open arched passage between x = 0..4
    box(2.2, 6.2, 4.2, -1.2, MID_Y + 3.1, -54, PR);
    box(2.2, 6.2, 4.2, 5.2, MID_Y + 3.1, -54, PR);
    box(8.8, 2.2, 4.4, 2.0, MID_Y + 7.2, -54, PR);
    // Curved stone vault/arch ('svod') spanning the passage
    A(new THREE.TorusGeometry(2.15, 0.55, 8, 16, Math.PI), 2.0, MID_Y + 4.0, -52.1, {
      tag: 'svod', col: '#e2d8c4', bleed: '#bfb39b', orb: 'svod',
    });
    A(new THREE.TorusGeometry(2.15, 0.55, 8, 16, Math.PI), 2.0, MID_Y + 4.0, -55.9, {
      tag: 'svod', col: '#e2d8c4', bleed: '#bfb39b',
    });
    // Medieval Bosnian shield coat of arms ('grb') carved above the arch
    box(1.5, 1.85, 0.28, 2.0, MID_Y + 7.2, -51.72, { tag: 'grb', col: '#2d5799', bleed: '#1d3b6b', orb: 'grb' });
    box(1.62, 0.22, 0.32, 2.0, MID_Y + 7.2, -51.70, { tag: 'grb', col: '#f2e8d0', bleed: '#cfc2a8' }, 0, 0, -0.55);
    // Golden royal crown ('kruna') atop the coat of arms
    A(CYL12, 2.0, MID_Y + 8.65, -51.72, { tag: 'kruna', col: '#f0be30', bleed: '#c49216', hull: true, orb: 'kruna' }, 0, 0, 0, [0.85, 0.42, 0.42]);
    for (const cx of [-0.6, 0, 0.6]) {
      A(CONE4, 2.0 + cx, MID_Y + 9.10, -51.72, { tag: 'kruna', col: '#ffd242', bleed: '#c99a18' }, 0, 0, 0, [0.22, 0.52, 0.22]);
    }
  });

  // Underground Catacombs rock entrance ('pecina') & warm glowing candles ('svijeca') at (-28, MID_Y, -66)
  b.object(() => {
    const PC = { tag: 'pecina', col: '#7d776c', bleed: '#575249', pat: PAT.blocks, ps: 0.5, orb: 'pecina' };
    A(DODE, -28, MID_Y + 2.8, -68.2, PC, 0, 0, 0, [5.4, 3.8, 3.2]);
    // Dark recessed rock archway
    box(2.6, 3.2, 1.4, -28, MID_Y + 1.6, -65.6, { tag: 'pecina', col: '#2b2824', bleed: '#1a1815' });
    A(new THREE.TorusGeometry(1.4, 0.42, 6, 14, Math.PI), -28, MID_Y + 2.8, -65.0, PC);
  });
  // Warm wax candles ('svijeca') on low stone ledges flanking the catacombs entrance
  b.object(() => {
    for (const sx of [-29.6, -26.4]) {
      box(0.7, 0.6, 0.7, sx, MID_Y + 0.3, -64.6, { tag: 'props', col: STONE_GREY[0], bleed: STONE_GREY[1] });
      A(CYL, sx, MID_Y + 0.85, -64.6, { tag: 'svijeca', col: '#f7efd8', bleed: '#d9ceb0', orb: 'svijeca' }, 0, 0, 0, [0.11, 0.52, 0.11]);
      A(CONE8, sx, MID_Y + 1.24, -64.6, { tag: 'svijeca', col: '#ffba2e', bleed: '#e87a1c', hull: true, solid: false }, 0, 0, 0, [0.10, 0.26, 0.10]);
    }
  });

  // ==================== 8. ZONE 6: VRBAS CANYON, RAFT & SPRING PICNIC (14 words) ====================
  // Moored wooden raft ('splav') & oar ('veslo') on the emerald Vrbas at (26, 0.12, 20)
  const raftG = new THREE.Group();
  raftG.position.set(26.0, 0.14, 20.0);
  raftG.rotation.y = 0.22;
  scene.add(raftG);
  for (let i = -2; i <= 2; i++) {
    dynMesh(CYL, 'splav', '#8f653c', '#694726', raftG, i * 0.42, 0, 0, [0.19, 4.2, 0.19], 1.2).rotation.x = Math.PI / 2;
  }
  dynMesh(BOX, 'splav', '#6e4a28', '#4f331a', raftG, 0, 0.16, -1.2, [2.2, 0.14, 0.22], 1.1);
  dynMesh(BOX, 'splav', '#6e4a28', '#4f331a', raftG, 0, 0.16, 1.2, [2.2, 0.14, 0.22], 1.1);
  // Wooden oar ('veslo') resting across the raft
  const oarS = dynMesh(CYL, 'veslo', '#b88c54', '#8c6638', raftG, 0.2, 0.28, 0.1, [0.045, 2.8, 0.045], 1.1);
  oarS.rotation.set(0, 0.35, Math.PI / 2);
  const oarB = dynMesh(BOX, 'veslo', '#c99b5e', '#99703c', raftG, 1.55, 0.28, -0.35, [0.75, 0.06, 0.28], 1.1);
  oarB.rotation.y = 0.35;

  // Sunny east-bank picnic lawn (x = 46..62, z = 18..34, y = VIEW_Y)
  // Bright tent ('sator') at (58, VIEW_Y, 20)
  b.object(() => {
    const ST = { tag: 'sator', col: '#e06b3e', bleed: '#b84e27', orb: 'sator' };
    A(new THREE.CylinderGeometry(0.1, 2.3, 2.2, 4), 58, VIEW_Y + 1.1, 20, ST, Math.PI / 4);
    box(0.85, 1.4, 0.14, 56.8, VIEW_Y + 0.72, 20, { tag: 'sator', col: '#3a2c24', solid: false }, Math.PI / 2);
  });

  // Checkered picnic mat ('prostirka') at (51, VIEW_Y, 25)
  b.object(() => {
    box(3.8, 0.06, 3.2, 51, VIEW_Y + 0.05, 25, { tag: 'prostirka', col: '#f2e8d8', bleed: '#d6cab6', orb: 'prostirka' });
    for (let i = 0; i < 4; i++) {
      box(3.75, 0.07, 0.36, 51, VIEW_Y + 0.06, 23.9 + i * 0.72, { tag: 'prostirka', col: '#d44b42', bleed: '#a8342c', solid: false, ink: false });
    }
  });

  // Pitcher of fruit juice ('sok') & cake ('kolac') on the picnic mat
  b.object(() => {
    A(CYL12, 50.4, VIEW_Y + 0.32, 24.4, { tag: 'sok', col: '#f29f24', bleed: '#cc7a10', hull: true, orb: 'sok' }, 0, 0, 0, [0.18, 0.44, 0.18]);
    A(CYL12, 50.9, VIEW_Y + 0.20, 24.5, { tag: 'sok', col: '#f5b038', bleed: '#cf8a18' }, 0, 0, 0, [0.09, 0.22, 0.09]);
    A(CYL12, 51.8, VIEW_Y + 0.22, 25.1, { tag: 'kolac', col: '#e8b878', bleed: '#c48f4d', hull: true, orb: 'kolac' }, 0, 0, 0, [0.32, 0.24, 0.32]);
    A(CYL12, 51.8, VIEW_Y + 0.35, 25.1, { tag: 'kolac', col: '#fff5e8', bleed: '#e3d4c0', solid: false }, 0, 0, 0, [0.33, 0.06, 0.33]);
  });

  // Young man playing ('svirati') guitar ('gitara') & friend singing ('pjevati') at the picnic
  people.push({ kind: 'jajGuitar', x: 49.8, y: VIEW_Y + 0.08, z: 25.8, ry: 0.7, tag: 'svirati' });
  people.push({ kind: 'jajSing', x: 52.2, y: VIEW_Y + 0.08, z: 26.0, ry: -0.7, tag: 'pjevati', woman: true });

  // Four ('cetiri') blooming spring cherry trees in a neat row along the east meadow at x = 66, z = 12, 20, 28, 36
  for (const cz of [12, 20, 28, 36]) {
    buildBlossomTree(66, VIEW_Y, cz, 'cetiri', PINK_BLOSSOM[0], 0.92);
  }

  // Goat ('koza') & lamb ('janje') grazing on the sunny east meadow (x = 52..58, z = -28..-22, y = VIEW_Y)
  b.object(() => {
    const KZ = { tag: 'koza', col: '#d9cbb8', bleed: '#b5a58e', hull: true, orb: 'koza' };
    const gx = 54, gz = -26;
    A(ICO, gx, VIEW_Y + 0.72, gz, KZ, 0, 0, 0, [0.32, 0.32, 0.56]);
    for (const sx of [-0.16, 0.16]) for (const sz of [-0.32, 0.32])
      A(CYL, gx + sx, VIEW_Y + 0.34, gz + sz, KZ, 0, 0, 0, [0.06, 0.68, 0.06]);
    A(SPHERE, gx, VIEW_Y + 1.05, gz + 0.56, KZ, 0, 0, 0, [0.18, 0.18, 0.24]);
    // Curved goat horns
    for (const sx of [-0.10, 0.10])
      A(CONE4, gx + sx, VIEW_Y + 1.28, gz + 0.50, { tag: 'koza', col: '#5c4e40', bleed: '#3d3329' }, -0.45, 0, sx * 2, [0.04, 0.30, 0.04]);
  });
  b.object(() => {
    const JN = { tag: 'janje', col: '#faf7f0', bleed: '#ded9cc', hull: true, orb: 'janje' };
    const lx = 50.5, lz = -22.5;
    A(ICO, lx, VIEW_Y + 0.48, lz, JN, 0, 0, 0, [0.24, 0.22, 0.36]);
    for (const sx of [-0.11, 0.11]) for (const sz of [-0.20, 0.20])
      A(CYL, lx + sx, VIEW_Y + 0.22, lz + sz, { tag: 'janje', col: '#4a423b', bleed: '#302a25' }, 0, 0, 0, [0.04, 0.44, 0.04]);
    A(SPHERE, lx, VIEW_Y + 0.66, lz + 0.36, { tag: 'janje', col: '#f0ebe0', bleed: '#d4cec0', hull: true }, 0, 0, 0, 0.13);
  });

  // ==================== 9. ZONE 7: JAJCE ROYAL FORTRESS - TVRĐAVA (3 words, Stage 2!) ====================
  const FORT_Y = 32.0;
  b.object(() => {
    const TV = { tag: 'tvrdjava', col: '#d4c9b2', bleed: '#afa288', pat: PAT.blocks, ps: 0.6, pool: 0.85, orb: 'tvrdjava' };
    const ROOF_T = { tag: 'tvrdjava', col: '#9e4c30', bleed: '#7a3720', pat: PAT.roof };
    // Curtain walls forming a rectangular citadel around (-6, FORT_Y, -88)
    box(30, 6.0, 2.2, -6, FORT_Y + 3.0, -76, TV); // South curtain wall facing town
    box(30, 6.0, 2.2, -6, FORT_Y + 3.0, -100, TV); // North curtain wall
    box(2.2, 6.0, 26, -20, FORT_Y + 3.0, -88, TV); // West wall
    box(2.2, 6.0, 26, 8, FORT_Y + 3.0, -88, TV); // East wall
    // Crenellations along south and east walls
    for (let cx = -19; cx <= 7; cx += 3.2) box(1.5, 1.1, 2.3, cx, FORT_Y + 6.5, -76, TV);
    // 4 Corner watchtowers
    for (const [tx, tz] of [[-20, -76], [8, -76], [-20, -100], [8, -100]]) {
      box(4.4, 9.2, 4.4, tx, FORT_Y + 4.6, tz, TV);
      A(hipRoofGeo(5.2, 5.2, 2.6), tx, FORT_Y + 9.2, tz, ROOF_T);
    }
    // Central royal keep (Donžon)
    box(7.5, 10.5, 6.8, -11, FORT_Y + 5.25, -92, TV);
    A(hipRoofGeo(8.5, 7.8, 3.2), -11, FORT_Y + 10.5, -92, ROOF_T);
  });

  // Old iron cannon ('top') on the south fortress rampart at (0, FORT_Y, -79.2)
  b.object(() => {
    const TP = { tag: 'top', col: '#3a3d42', bleed: '#25272b', orb: 'top' };
    A(CYL12, 0, FORT_Y + 0.95, -79.0, TP, Math.PI / 2 - 0.12, 0, 0, [0.24, 2.2, 0.24]);
    box(0.85, 0.65, 1.3, 0, FORT_Y + 0.42, -79.4, { tag: 'top', col: WOOD_DARK[0], bleed: WOOD_DARK[1] });
    for (const sx of [-0.52, 0.52]) A(CYL12, sx, FORT_Y + 0.36, -79.3, { tag: 'top', col: '#4f3520', bleed: '#362314' }, 0, 0, Math.PI / 2, [0.36, 0.12, 0.36]);
  });

  // Sunny fortress bench with visitor enjoying the warm spring sun ('toplo') at (-4, FORT_Y, -82)
  box(2.2, 0.5, 0.6, -4, FORT_Y + 0.25, -82, { tag: 'props', col: WOOD_WARM[0], bleed: WOOD_WARM[1] });
  people.push({ kind: 'jajWarmSit', x: -4.0, y: FORT_Y + 0.04, z: -81.9, ry: 0.1, tag: 'toplo' });

  // Background spring townsfolk & strolling visitors (finale-coloured 'passerby')
  people.push({ kind: 'walk', x: 40, y: VIEW_Y + 0.06, z: -2, to: [40, 12], tag: 'passerby' });
  people.push({ kind: 'chat', x: -20, y: PLATEAU_Y + 0.06, z: -22, ry: 0.6, tag: 'passerby', woman: true });
  people.push({ kind: 'chat', x: -18.8, y: PLATEAU_Y + 0.06, z: -21.6, ry: -2.4, tag: 'passerby' });
  people.push({ kind: 'stand', x: 42.5, y: VIEW_Y + 0.44, z: -9.0, ry: -1.4, tag: 'passerby' });
  people.push({ kind: 'walk', x: -30, y: PLATEAU_Y + 0.06, z: -28, to: [-12, -28], tag: 'passerby', woman: true });

  // Extra scenic green trees around the hills & canyon ('hills')
  for (const [tx, ty, tz, s] of [
    [48, VIEW_Y, -38, 1.1], [62, VIEW_Y, -14, 1.0], [64, VIEW_Y, 44, 1.15],
    [-64, PLATEAU_Y, 42, 1.2], [-42, PLATEAU_Y, 48, 1.1], [-24, PLATEAU_Y, 36, 1.0],
    [-54, MID_Y, -62, 1.1], [14, MID_Y, -60, 1.05], [-26, FORT_Y, -84, 0.9], [14, FORT_Y, -86, 0.95],
  ]) {
    A(CYL, tx, ty + 1.8 * s, tz, { tag: 'hills', col: '#5c402c', bleed: '#422d1e' }, 0, 0, 0, [0.3 * s, 3.6 * s, 0.3 * s]);
    A(ICO, tx, ty + 4.3 * s, tz, { tag: 'hills', col: GRASS_LUSH[0], bleed: GRASS_LUSH[1], hull: true, sway: 5.5 }, 0, 0, 0, [2.2 * s, 2.0 * s, 2.2 * s]);
  }

  // ==================== 10. ALL 72 ORBS, GATES & HAND-TUNED CAMERAS ====================
  // Zone 1: Pliva Waterfall & Viewpoint (9)
  orbs.push({
    id: 'slap', focus: V(-8.0, 6.8, 0), size: 9.5, tags: ['slap'], shot: 'close',
    at: V(8.0, 6.5, 0), stage: 0,
    near: { p: [8.0, 0.5, 0], r: 10.0 },
    view: { from: [24, 9.5, 11], to: [24, 10.5, -10], look: [-8, 6.5, 0] },
  });
  orb('sedra', [-9.5, 6.5, -10.0], 8.5, ['sedra'], 'close', 13.0, {
    at: V(4.0, 5.5, -10.0), near: { p: [4.0, 0.5, -10.0], r: 9.0 },
    view: { from: [18, 9.0, -18], to: [18, 10.0, -2], look: [-9.5, 6.2, -9.5] },
  });
  orb('duga', [0.5, 8.8, -1.0], 9.0, ['duga'], 'close', 9.0, {
    requires: ['slap'], at: V(12.0, 8.0, 3.0), near: { p: [12.0, 0.5, 3.0], r: 10.0 },
    view: { from: [24, 9.5, 9], to: [24, 10.0, -8], look: [0.5, 7.2, -1.0] },
  });
  orb('kap', [-2.0, 4.0, 5.4], 2.4, ['kap'], 'close', 4.5, {
    requires: ['slap'], at: V(2.5, 3.2, 6.8), swim: { p: [2.5, 0, 6.8], r: 7.0 },
    view: { from: [6.5, 5.0, 9.5], to: [4.5, 5.4, 3.0], look: [-2.0, 4.0, 5.4] },
  });
  orb('sjenica', [43, VIEW_Y + 2.2, -9], 4.5, ['sjenica'], 'close', VIEW_Y + 5.6, {
    at: V(38.5, VIEW_Y + 2.2, -9), near: { p: [38.5, VIEW_Y + 0.2, -9], r: 4.5 },
    view: { from: [33, VIEW_Y + 4.5, -15], to: [33, VIEW_Y + 5.0, -3], look: [43, VIEW_Y + 2.2, -9] },
  });
  orb('lala', [39.5, VIEW_Y + 0.6, 8.5], 2.6, ['lala'], 'close', VIEW_Y + 1.0, {
    near: { p: [39.5, VIEW_Y + 0.2, 8.5], r: 3.8 },
    view: { from: [35.5, VIEW_Y + 2.4, 11.5], to: [42.5, VIEW_Y + 2.4, 11.5], look: [39.5, VIEW_Y + 0.6, 8.5] },
  });
  orb('maslacak', [45, VIEW_Y + 0.4, 4.0], 2.4, ['maslacak'], 'close', VIEW_Y + 0.8, {
    near: { p: [45, VIEW_Y + 0.2, 4.0], r: 3.8 },
    view: { from: [41.5, VIEW_Y + 2.2, 7.2], to: [48.5, VIEW_Y + 2.2, 7.2], look: [45, VIEW_Y + 0.4, 4.0] },
  });
  orb('dvogled', [32.2, VIEW_Y + 1.5, -2.0], 1.6, ['dvogled'], 'close', VIEW_Y + 2.3, {
    near: { p: [33.5, VIEW_Y + 0.3, -2.0], r: 3.6 },
    view: { from: [29.4, VIEW_Y + 2.2, -0.2], to: [29.4, VIEW_Y + 2.2, -3.8], look: [32.2, VIEW_Y + 1.5, -2.0] },
  });
  orb('ruksak', [32.7, VIEW_Y + 1.3, 3.4], 1.6, ['ruksak'], 'close', VIEW_Y + 2.3, {
    near: { p: [34.0, VIEW_Y + 0.3, 3.4], r: 3.6 },
    view: { from: [36.2, VIEW_Y + 2.2, 5.2], to: [36.2, VIEW_Y + 2.2, 1.6], look: [32.7, VIEW_Y + 1.3, 3.4] },
  });

  // Zone 2: Wooden Watermills - Mlinčići (10)
  orb('mlin', [-52, WATER_UPPER + 3.0, 4.8], 6.5, ['mlin'], 'combo', WATER_UPPER + 6.2, {
    at: V(-52, PLATEAU_Y + 2.4, 10.5), near: { p: [-52, PLATEAU_Y + 0.2, 10.5], r: 5.5 },
    view: { from: [-44, PLATEAU_Y + 4.5, 14], to: [-60, PLATEAU_Y + 4.8, 14], look: [-52, WATER_UPPER + 2.8, 4.8] },
    wideView: { from: [-36, PLATEAU_Y + 12, 22], to: [-76, PLATEAU_Y + 12, 20], look: [-56, WATER_UPPER + 2.5, 0], lookTo: [-60, WATER_UPPER + 2.5, 0] },
  });
  orb('tocak', [-46, WATER_UPPER + 1.0, -3.55], 2.2, ['tocak'], 'close', WATER_UPPER + 2.2, {
    requires: ['mlin'], at: V(-46, WATER_UPPER + 2.4, -0.5), swim: { p: [-46, WATER_UPPER, -0.5], r: 5.5 },
    view: { from: [-43.5, WATER_UPPER + 2.6, 1.2], to: [-48.5, WATER_UPPER + 2.6, 1.2], look: [-46, WATER_UPPER + 1.0, -3.55] },
  });
  orb('mlinar', [-49.2, PLATEAU_Y + 1.1, -13.2], 1.8, ['mlinar'], 'close', PLATEAU_Y + 2.2, {
    near: { p: [-49.2, PLATEAU_Y + 0.2, -13.2], r: 3.6 },
    view: { from: [-46.8, PLATEAU_Y + 2.4, -10.5], to: [-51.5, PLATEAU_Y + 2.4, -10.5], look: [-49.2, PLATEAU_Y + 1.1, -13.2] },
  });
  orb('brasno', [-46.5, PLATEAU_Y + 0.85, -13.2], 1.6, ['brasno'], 'close', PLATEAU_Y + 1.4, {
    near: { p: [-46.5, PLATEAU_Y + 0.2, -13.2], r: 3.4 },
    view: { from: [-44.5, PLATEAU_Y + 2.2, -11.0], to: [-48.5, PLATEAU_Y + 2.2, -11.0], look: [-46.5, PLATEAU_Y + 0.85, -13.2] },
  });
  orb('zito', [-59.2, PLATEAU_Y + 0.9, -13.5], 1.8, ['zito'], 'close', PLATEAU_Y + 1.8, {
    near: { p: [-59.2, PLATEAU_Y + 0.2, -13.5], r: 3.4 },
    view: { from: [-57.0, PLATEAU_Y + 2.2, -10.8], to: [-61.5, PLATEAU_Y + 2.2, -10.8], look: [-59.2, PLATEAU_Y + 0.9, -13.5] },
  });
  orb('vreca', [-52.2, PLATEAU_Y + 0.65, -13.3], 1.6, ['vreca'], 'close', PLATEAU_Y + 1.3, {
    near: { p: [-52.2, PLATEAU_Y + 0.2, -13.3], r: 3.4 },
    view: { from: [-50.2, PLATEAU_Y + 2.1, -11.0], to: [-54.2, PLATEAU_Y + 2.1, -11.0], look: [-52.2, PLATEAU_Y + 0.65, -13.3] },
  });
  orb('daska', [-49.5, PLATEAU_Y + 0.5, 13.4], 2.2, ['daska'], 'close', PLATEAU_Y + 1.0, {
    near: { p: [-49.5, PLATEAU_Y + 0.2, 13.4], r: 3.6 },
    view: { from: [-46.5, PLATEAU_Y + 2.3, 16.5], to: [-52.5, PLATEAU_Y + 2.3, 16.5], look: [-49.5, PLATEAU_Y + 0.5, 13.4] },
  });
  orb('brvno', [-55, PLATEAU_Y + 0.6, 0], 7.0, ['brvno'], 'close', PLATEAU_Y + 1.3, {
    at: V(-55, PLATEAU_Y + 2.3, 0), near: { p: [-55, PLATEAU_Y + 0.2, 0], r: 5.0 },
    view: { from: [-49, PLATEAU_Y + 6.5, 11], to: [-61, PLATEAU_Y + 6.5, 11], look: [-55, PLATEAU_Y + 0.6, 0] },
  });
  orb('brana', [-36, WATER_UPPER + 0.4, 0], 8.0, ['brana'], 'close', WATER_UPPER + 1.2, {
    at: V(-36, WATER_UPPER + 2.4, 0), swim: { p: [-39, WATER_UPPER, 0], r: 7.0 },
    view: { from: [-26, PLATEAU_Y + 5.0, 10], to: [-26, PLATEAU_Y + 5.2, -10], look: [-36, WATER_UPPER + 0.4, 0] },
  });
  orb('izvor', [-66, PLATEAU_Y + 0.9, -16.2], 2.6, ['izvor'], 'close', PLATEAU_Y + 2.2, {
    near: { p: [-66, PLATEAU_Y + 0.2, -14.5], r: 3.8 },
    view: { from: [-63, PLATEAU_Y + 2.8, -12.0], to: [-69, PLATEAU_Y + 2.8, -12.0], look: [-66, PLATEAU_Y + 0.9, -16.2] },
  });

  // Zone 3: Pliva Lake & Spring Meadow (13)
  orb('labud', [-92, WATER_UPPER + 0.5, -6], 3.5, ['labud'], 'close', WATER_UPPER + 1.2, {
    at: V(-92, WATER_UPPER + 2.4, -6), swim: { p: [-92, WATER_UPPER, -6], r: 8.0 },
    view: { from: [-84, WATER_UPPER + 3.5, -2], to: [-98, WATER_UPPER + 3.5, -12], look: [-93, WATER_UPPER + 0.5, -4] },
  });
  orb('zaba', [-85.5, WATER_UPPER + 0.25, 6.2], 1.2, ['zaba'], 'close', WATER_UPPER + 0.6, {
    requires: ['lokvanj'], at: V(-85.5, WATER_UPPER + 2.0, 6.2), swim: { p: [-85.5, WATER_UPPER, 6.2], r: 5.0 },
    view: { from: [-83.4, WATER_UPPER + 1.6, 8.2], to: [-87.4, WATER_UPPER + 1.6, 8.2], look: [-85.5, WATER_UPPER + 0.25, 6.2] },
  });
  orb('lokvanj', [-86.5, WATER_UPPER + 0.15, 7.8], 3.4, ['lokvanj'], 'close', WATER_UPPER + 0.6, {
    at: V(-86.5, WATER_UPPER + 2.2, 7.8), swim: { p: [-86.5, WATER_UPPER, 7.8], r: 6.0 },
    view: { from: [-81, WATER_UPPER + 3.5, 12], to: [-91, WATER_UPPER + 3.5, 12], look: [-86.5, WATER_UPPER + 0.15, 7.8] },
  });
  orb('trska', [-81, WATER_UPPER + 1.2, 17], 3.5, ['trska'], 'close', WATER_UPPER + 2.4, {
    at: V(-81, WATER_UPPER + 2.6, 17), swim: { p: [-83, WATER_UPPER, 17], r: 6.0 },
    view: { from: [-87, WATER_UPPER + 3.2, 22], to: [-87, WATER_UPPER + 3.2, 12], look: [-81, WATER_UPPER + 1.2, 17] },
  });
  orb('vrba', [-79, PLATEAU_Y + 3.8, -18], 5.5, ['vrba'], 'combo', PLATEAU_Y + 7.2, {
    at: V(-75, PLATEAU_Y + 2.4, -18), near: { p: [-75, PLATEAU_Y + 0.2, -18], r: 4.8 },
    view: { from: [-70, PLATEAU_Y + 5.5, -10], to: [-88, PLATEAU_Y + 5.8, -10], look: [-79, PLATEAU_Y + 3.5, -18] },
    wideView: { from: [-68, PLATEAU_Y + 14, 4], to: [-96, PLATEAU_Y + 14, 8], look: [-80, PLATEAU_Y + 3.5, -14], lookTo: [-82, PLATEAU_Y + 3.5, 24] },
  });
  orb('pecati', [-81.5, PLATEAU_Y + 1.1, -6.0], 2.0, ['pecati'], 'close', PLATEAU_Y + 2.1, {
    near: { p: [-79.5, PLATEAU_Y + 0.1, -6.0], r: 3.8 },
    view: { from: [-84.5, PLATEAU_Y + 2.4, -2.5], to: [-84.5, PLATEAU_Y + 2.4, -9.5], look: [-81.5, PLATEAU_Y + 1.0, -6.0] },
  });
  orb('udica', [-83.2, PLATEAU_Y + 0.8, -6.0], 2.2, ['udica'], 'close', PLATEAU_Y + 1.6, {
    requires: ['pecati'], near: { p: [-79.5, PLATEAU_Y + 0.1, -6.0], r: 4.2 },
    view: { from: [-83.0, PLATEAU_Y + 2.2, -2.2], to: [-86.0, PLATEAU_Y + 2.2, -3.2], look: [-83.2, PLATEAU_Y + 0.6, -6.0] },
  });
  orb('kanta', [-81.1, PLATEAU_Y + 0.3, -4.95], 1.2, ['kanta'], 'close', PLATEAU_Y + 0.7, {
    requires: ['pecati'], near: { p: [-79.5, PLATEAU_Y + 0.1, -5.2], r: 3.6 },
    view: { from: [-79.2, PLATEAU_Y + 1.6, -3.2], to: [-82.5, PLATEAU_Y + 1.6, -3.2], look: [-81.1, PLATEAU_Y + 0.25, -4.95] },
  });
  orb('livada', [-52, PLATEAU_Y + 0.5, 34], 16.0, ['livada'], 'combo', PLATEAU_Y + 1.2, {
    at: V(-52, PLATEAU_Y + 2.4, 34), near: { p: [-52, PLATEAU_Y + 0.2, 34], r: 5.0 },
    view: { from: [-34, PLATEAU_Y + 8, 46], to: [-68, PLATEAU_Y + 9, 44], look: [-52, PLATEAU_Y + 0.5, 34] },
    wideView: { from: [-24, PLATEAU_Y + 18, 56], to: [-86, PLATEAU_Y + 20, 48], look: [-52, PLATEAU_Y + 1, 32], lookTo: [-66, PLATEAU_Y + 1, 34] },
  });
  orb('djetelina', [-52.5, PLATEAU_Y + 0.2, 26], 2.4, ['djetelina'], 'close', PLATEAU_Y + 0.6, {
    near: { p: [-52.5, PLATEAU_Y + 0.2, 26], r: 3.8 },
    view: { from: [-49.5, PLATEAU_Y + 2.2, 29.5], to: [-55.5, PLATEAU_Y + 2.2, 29.5], look: [-52.5, PLATEAU_Y + 0.2, 26] },
  });
  orb('leptir', [-64, PLATEAU_Y + 1.3, 28], 2.6, ['leptir'], 'close', PLATEAU_Y + 2.0, {
    near: { p: [-64, PLATEAU_Y + 0.2, 28], r: 4.0 },
    view: { from: [-60.5, PLATEAU_Y + 2.5, 31.5], to: [-67.5, PLATEAU_Y + 2.5, 31.5], look: [-64, PLATEAU_Y + 1.3, 28] },
  });
  orb('kosnica', [-36, PLATEAU_Y + 0.9, 34], 3.4, ['kosnica'], 'close', PLATEAU_Y + 1.8, {
    near: { p: [-36, PLATEAU_Y + 0.2, 31.5], r: 4.2 },
    view: { from: [-32, PLATEAU_Y + 2.6, 29.5], to: [-40, PLATEAU_Y + 2.6, 29.5], look: [-36, PLATEAU_Y + 0.9, 34] },
  });
  orb('pcela', [-36, PLATEAU_Y + 1.6, 33.2], 2.0, ['pcela'], 'close', PLATEAU_Y + 2.1, {
    requires: ['kosnica'], near: { p: [-36, PLATEAU_Y + 0.2, 31.5], r: 4.0 },
    view: { from: [-33.5, PLATEAU_Y + 2.3, 30.2], to: [-38.5, PLATEAU_Y + 2.3, 30.2], look: [-36, PLATEAU_Y + 1.6, 33.2] },
  });

  // Zone 4: Old Town, Orchards & Spring Market (14)
  orb('tresnja', [-28, PLATEAU_Y + 3.6, -16], 4.5, ['tresnja'], 'combo', PLATEAU_Y + 6.4, {
    at: V(-28, PLATEAU_Y + 2.4, -12.8), near: { p: [-28, PLATEAU_Y + 0.2, -12.8], r: 4.2 },
    view: { from: [-23, PLATEAU_Y + 5.2, -9], to: [-33, PLATEAU_Y + 5.2, -9], look: [-28, PLATEAU_Y + 3.5, -16] },
    wideView: { from: [-10, PLATEAU_Y + 10, -4], to: [-36, PLATEAU_Y + 10, -4], look: [-22, PLATEAU_Y + 3.5, -15], lookTo: [-28, PLATEAU_Y + 3.5, -16] },
  });
  orb('sljiva', [-39, PLATEAU_Y + 3.6, -16], 4.5, ['sljiva'], 'combo', PLATEAU_Y + 6.4, {
    at: V(-39, PLATEAU_Y + 2.4, -12.8), near: { p: [-39, PLATEAU_Y + 0.2, -12.8], r: 4.2 },
    view: { from: [-34, PLATEAU_Y + 5.2, -9], to: [-44, PLATEAU_Y + 5.2, -9], look: [-39, PLATEAU_Y + 3.5, -16] },
    wideView: { from: [-32, PLATEAU_Y + 12, -4], to: [-62, PLATEAU_Y + 12, -10], look: [-44, PLATEAU_Y + 3.5, -18], lookTo: [-54, PLATEAU_Y + 3.5, -24] },
  });
  orb('behar', [-22, PLATEAU_Y + 4.4, -15], 4.8, ['behar'], 'combo', PLATEAU_Y + 7.0, {
    at: V(-22, PLATEAU_Y + 2.4, -12.0), near: { p: [-22, PLATEAU_Y + 0.2, -12.0], r: 4.2 },
    view: { from: [-17, PLATEAU_Y + 5.5, -8], to: [-27, PLATEAU_Y + 5.5, -8], look: [-22, PLATEAU_Y + 4.2, -15] },
    wideView: { from: [2, PLATEAU_Y + 10, -4], to: [-28, PLATEAU_Y + 10, -4], look: [-14, PLATEAU_Y + 4.0, -14], lookTo: [-22, PLATEAU_Y + 4.0, -15] },
  });
  orb('pupoljak', [-24.2, PLATEAU_Y + 1.1, -19.2], 1.4, ['pupoljak'], 'close', PLATEAU_Y + 1.6, {
    near: { p: [-24.2, PLATEAU_Y + 0.2, -18.5], r: 3.4 },
    view: { from: [-22.4, PLATEAU_Y + 1.8, -17.2], to: [-25.8, PLATEAU_Y + 1.8, -17.2], look: [-24.2, PLATEAU_Y + 1.1, -19.2] },
  });
  orb('korijen', [-32.5, PLATEAU_Y + 0.4, -13.0], 2.4, ['korijen'], 'close', PLATEAU_Y + 1.2, {
    near: { p: [-32.5, PLATEAU_Y + 0.2, -11.5], r: 3.8 },
    view: { from: [-30.0, PLATEAU_Y + 2.0, -10.0], to: [-35.0, PLATEAU_Y + 2.0, -10.0], look: [-32.5, PLATEAU_Y + 0.4, -13.0] },
  });
  orb('gnijezdo', [-7.1, NEST_Y + 0.25, -22], 1.8, ['gnijezdo'], 'close', NEST_Y + 1.0, {
    at: V(-7.1, NEST_Y + 1.4, -22), near: { p: [-7.1, NEST_Y + 0.2, -22], r: 5.5 },
    view: { from: [-3.5, NEST_Y + 2.4, -18.5], to: [-10.5, NEST_Y + 2.4, -18.5], look: [-7.1, NEST_Y + 0.4, -22] },
  });
  orb('roda', [-7.1, NEST_Y + 1.2, -22], 2.0, ['roda'], 'close', NEST_Y + 2.4, {
    requires: ['gnijezdo'], at: V(-7.1, NEST_Y + 3.0, -22), near: { p: [-7.1, NEST_Y + 0.2, -22], r: 6.0 },
    view: { from: [-3.5, NEST_Y + 2.6, -18.0], to: [-10.5, NEST_Y + 2.6, -18.0], look: [-7.1, NEST_Y + 1.2, -22] },
  });
  orb('lasta', [-22, PLATEAU_Y + 6.8, -25], 3.8, ['lasta'], 'close', PLATEAU_Y + 7.5, {
    at: V(-22, PLATEAU_Y + 6.5, -21), near: { p: [-22, PLATEAU_Y + 0.2, -21], r: 8.0 },
    view: { from: [-14, PLATEAU_Y + 8.5, -16], to: [-30, PLATEAU_Y + 8.5, -16], look: [-22, PLATEAU_Y + 6.8, -25] },
  });
  orb('pijaca', [-20, PLATEAU_Y + 1.6, -25.5], 5.5, ['pijaca'], 'close', PLATEAU_Y + 3.2, {
    at: V(-20, PLATEAU_Y + 2.4, -22.5), near: { p: [-20, PLATEAU_Y + 0.2, -22.5], r: 4.5 },
    view: { from: [-14, PLATEAU_Y + 4.2, -19.5], to: [-26, PLATEAU_Y + 4.2, -19.5], look: [-20, PLATEAU_Y + 1.5, -25.5] },
  });
  orb('korpa', [-22.5, PLATEAU_Y + 1.15, -25.4], 1.8, ['korpa'], 'close', PLATEAU_Y + 1.7, {
    requires: ['pijaca'], at: V(-22.5, PLATEAU_Y + 2.1, -23.6), near: { p: [-22.5, PLATEAU_Y + 0.2, -23.6], r: 3.6 },
    view: { from: [-20.5, PLATEAU_Y + 2.2, -22.6], to: [-24.5, PLATEAU_Y + 2.2, -22.6], look: [-22.5, PLATEAU_Y + 1.15, -25.4] },
  });
  orb('jagoda', [-22.5, PLATEAU_Y + 1.32, -25.4], 1.4, ['jagoda'], 'close', PLATEAU_Y + 1.8, {
    requires: ['korpa'], at: V(-21.0, PLATEAU_Y + 2.1, -23.8), near: { p: [-21.0, PLATEAU_Y + 0.2, -23.8], r: 3.6 },
    view: { from: [-21.0, PLATEAU_Y + 2.1, -23.2], to: [-23.8, PLATEAU_Y + 2.1, -23.2], look: [-22.5, PLATEAU_Y + 1.30, -25.4] },
  });
  orb('vrtlar', [-13.1, PLATEAU_Y + 1.1, -27.0], 1.8, ['vrtlar'], 'close', PLATEAU_Y + 2.2, {
    near: { p: [-13.1, PLATEAU_Y + 0.2, -25.2], r: 3.6 },
    view: { from: [-12.2, PLATEAU_Y + 2.6, -29.8], to: [-15.8, PLATEAU_Y + 2.6, -29.5], look: [-13.1, PLATEAU_Y + 1.1, -27.0] },
  });
  orb('zalijevati', [-12.2, PLATEAU_Y + 0.9, -27.0], 1.8, ['zalijevati'], 'close', PLATEAU_Y + 1.9, {
    requires: ['vrtlar'], near: { p: [-12.2, PLATEAU_Y + 0.2, -25.2], r: 3.6 },
    view: { from: [-11.8, PLATEAU_Y + 2.5, -29.8], to: [-14.8, PLATEAU_Y + 2.5, -29.6], look: [-12.2, PLATEAU_Y + 0.9, -27.0] },
  });
  orb('motika', [-14.6, PLATEAU_Y + 0.75, -25.8], 1.5, ['motika'], 'close', PLATEAU_Y + 1.7, {
    near: { p: [-14.6, PLATEAU_Y + 0.2, -24.5], r: 3.4 },
    view: { from: [-12.8, PLATEAU_Y + 1.9, -23.5], to: [-16.2, PLATEAU_Y + 1.9, -23.5], look: [-14.6, PLATEAU_Y + 0.75, -25.8] },
  });

  // Zone 5: St. Luke's Bell Tower, Medvjed-kula & Catacombs (9)
  orb('zvonik', [-16, MID_Y + 9.5, -52], 9.0, ['zvonik'], 'close', MID_Y + 2.0, {
    at: V(-16, MID_Y + 2.6, -47.5), near: { p: [-16, MID_Y + 0.2, -47.5], r: 5.0 },
    view: { from: [-4, MID_Y + 11, -36], to: [-28, MID_Y + 12, -36], look: [-16, MID_Y + 9.5, -52] },
  });
  orb('zvono', [-16, MID_Y + 15.2, -52], 2.2, ['zvono'], 'close', MID_Y + 15.2, {
    requires: ['zvonik'], at: V(-16, MID_Y + 15.5, -48.5), near: { p: [-16, MID_Y + 13.5, -49.5], r: 5.5 },
    view: { from: [-12, MID_Y + 16.0, -46.5], to: [-20, MID_Y + 16.0, -46.5], look: [-16, MID_Y + 15.2, -52] },
  });
  orb('kamen', [-42, MID_Y + 4.8, -54], 7.5, ['kamen'], 'close', MID_Y + 10.6, {
    at: V(-36.5, MID_Y + 2.4, -50.5), near: { p: [-36.5, MID_Y + 0.2, -50.5], r: 4.8 },
    view: { from: [-30, MID_Y + 7.0, -43], to: [-50, MID_Y + 7.5, -43], look: [-42, MID_Y + 4.5, -54] },
  });
  orb('prolaz', [2.0, MID_Y + 4.0, -54], 6.5, ['prolaz'], 'close', MID_Y + 8.6, {
    at: V(2.0, MID_Y + 2.4, -49.5), near: { p: [2.0, MID_Y + 0.2, -49.5], r: 4.8 },
    view: { from: [8.5, MID_Y + 6.0, -42], to: [-4.5, MID_Y + 6.0, -42], look: [2.0, MID_Y + 4.0, -54] },
  });
  orb('svod', [2.0, MID_Y + 5.2, -52.1], 3.8, ['svod'], 'close', MID_Y + 6.6, {
    requires: ['prolaz'], at: V(2.0, MID_Y + 2.4, -50.8), near: { p: [2.0, MID_Y + 0.2, -50.8], r: 4.5 },
    view: { from: [6.0, MID_Y + 5.8, -45.5], to: [-2.0, MID_Y + 5.8, -45.5], look: [2.0, MID_Y + 5.2, -52.1] },
  });
  orb('grb', [2.0, MID_Y + 7.2, -51.72], 2.0, ['grb'], 'close', MID_Y + 7.2, {
    requires: ['prolaz'], at: V(2.0, MID_Y + 7.2, -49.5), near: { p: [2.0, MID_Y + 0.2, -49.5], r: 8.0 },
    view: { from: [5.0, MID_Y + 7.6, -47.0], to: [-1.0, MID_Y + 7.6, -47.0], look: [2.0, MID_Y + 7.2, -51.72] },
  });
  orb('kruna', [2.0, MID_Y + 8.9, -51.72], 1.8, ['kruna'], 'close', MID_Y + 9.2, {
    requires: ['grb'], at: V(2.0, MID_Y + 9.4, -49.8), near: { p: [2.0, MID_Y + 8.3, -51.8], r: 5.5 },
    view: { from: [4.5, MID_Y + 9.4, -47.5], to: [-0.5, MID_Y + 9.4, -47.5], look: [2.0, MID_Y + 8.9, -51.72] },
  });
  orb('pecina', [-28, MID_Y + 2.2, -65.6], 5.5, ['pecina'], 'close', MID_Y + 5.5, {
    at: V(-28, MID_Y + 2.4, -62.0), near: { p: [-28, MID_Y + 0.2, -62.0], r: 4.5 },
    view: { from: [-22, MID_Y + 4.0, -57.5], to: [-34, MID_Y + 4.0, -57.5], look: [-28, MID_Y + 2.2, -65.6] },
  });
  orb('svijeca', [-29.6, MID_Y + 0.95, -64.6], 1.4, ['svijeca'], 'close', MID_Y + 1.5, {
    requires: ['pecina'], at: V(-29.6, MID_Y + 2.0, -63.0), near: { p: [-29.6, MID_Y + 0.2, -63.0], r: 3.6 },
    view: { from: [-27.6, MID_Y + 1.8, -62.0], to: [-31.4, MID_Y + 1.8, -62.0], look: [-29.6, MID_Y + 0.95, -64.6] },
  });

  // Zone 6: Vrbas Canyon, Raft & Spring Picnic (14)
  orb('kanjon', [82, 14, 18], 22.0, ['kanjon'], 'combo', 16.0, {
    at: V(48, VIEW_Y + 2.4, 12), near: { p: [48, VIEW_Y + 0.2, 12], r: 5.0 },
    view: { from: [26, 16, 4], to: [26, 20, 32], look: [82, 14, 18] },
    wideView: { from: [20, 26, -34], to: [22, 28, 44], look: [82, 14, 8], lookTo: [68, 14, 52] },
  });
  orb('splav', [26, 0.4, 20], 3.8, ['splav'], 'close', 0.8, {
    at: V(26, 2.2, 20), swim: { p: [26, 0, 20], r: 6.5 },
    view: { from: [19, 4.0, 25], to: [19, 4.0, 15], look: [26, 0.3, 20] },
  });
  orb('veslo', [26.8, 0.5, 19.9], 2.2, ['veslo'], 'close', 1.0, {
    requires: ['splav'], at: V(26.8, 2.2, 21.8), swim: { p: [26.8, 0, 21.8], r: 6.0 },
    view: { from: [22.5, 2.8, 23.5], to: [29.5, 2.8, 23.5], look: [26.8, 0.4, 19.9] },
  });
  orb('sator', [58, VIEW_Y + 1.2, 20], 3.6, ['sator'], 'close', VIEW_Y + 2.6, {
    at: V(54.5, VIEW_Y + 2.2, 20), near: { p: [54.5, VIEW_Y + 0.2, 20], r: 4.2 },
    view: { from: [51.5, VIEW_Y + 3.2, 24.5], to: [51.5, VIEW_Y + 3.2, 15.5], look: [58, VIEW_Y + 1.1, 20] },
  });
  orb('prostirka', [51, VIEW_Y + 0.15, 25], 3.4, ['prostirka'], 'close', VIEW_Y + 0.6, {
    near: { p: [51, VIEW_Y + 0.2, 22.5], r: 4.0 },
    view: { from: [46.5, VIEW_Y + 3.2, 21.0], to: [55.5, VIEW_Y + 3.2, 21.0], look: [51, VIEW_Y + 0.2, 25] },
  });
  orb('gitara', [50.0, VIEW_Y + 0.95, 25.6], 1.5, ['gitara'], 'close', VIEW_Y + 1.9, {
    requires: ['svirati'], near: { p: [50.0, VIEW_Y + 0.2, 24.0], r: 3.6 },
    view: { from: [52.2, VIEW_Y + 1.9, 23.5], to: [48.2, VIEW_Y + 1.9, 23.5], look: [50.0, VIEW_Y + 0.95, 25.6] },
  });
  orb('svirati', [49.8, VIEW_Y + 1.0, 25.8], 1.8, ['svirati'], 'close', VIEW_Y + 2.1, {
    near: { p: [49.8, VIEW_Y + 0.2, 24.0], r: 3.8 },
    view: { from: [52.8, VIEW_Y + 2.2, 22.8], to: [47.5, VIEW_Y + 2.2, 22.8], look: [49.8, VIEW_Y + 1.0, 25.8] },
  });
  orb('pjevati', [52.2, VIEW_Y + 1.0, 26.0], 1.8, ['pjevati'], 'close', VIEW_Y + 2.1, {
    near: { p: [52.2, VIEW_Y + 0.2, 24.0], r: 3.8 },
    view: { from: [49.2, VIEW_Y + 2.2, 22.8], to: [54.8, VIEW_Y + 2.2, 22.8], look: [52.2, VIEW_Y + 1.0, 26.0] },
  });
  orb('sok', [50.6, VIEW_Y + 0.35, 24.4], 1.2, ['sok'], 'close', VIEW_Y + 0.8, {
    requires: ['prostirka'], near: { p: [50.6, VIEW_Y + 0.2, 23.2], r: 3.4 },
    view: { from: [48.8, VIEW_Y + 1.6, 22.4], to: [52.2, VIEW_Y + 1.6, 22.4], look: [50.6, VIEW_Y + 0.35, 24.4] },
  });
  orb('kolac', [51.8, VIEW_Y + 0.28, 25.1], 1.2, ['kolac'], 'close', VIEW_Y + 0.7, {
    requires: ['prostirka'], near: { p: [51.8, VIEW_Y + 0.2, 23.4], r: 3.4 },
    view: { from: [50.0, VIEW_Y + 1.6, 23.0], to: [53.4, VIEW_Y + 1.6, 23.0], look: [51.8, VIEW_Y + 0.28, 25.1] },
  });
  orb('koza', [54, VIEW_Y + 0.8, -26], 2.0, ['koza'], 'close', VIEW_Y + 1.6, {
    near: { p: [54, VIEW_Y + 0.2, -24.2], r: 3.8 },
    view: { from: [50.5, VIEW_Y + 2.2, -23.0], to: [57.5, VIEW_Y + 2.2, -23.0], look: [54, VIEW_Y + 0.8, -26] },
  });
  orb('janje', [50.5, VIEW_Y + 0.5, -22.5], 1.6, ['janje'], 'close', VIEW_Y + 1.1, {
    near: { p: [50.5, VIEW_Y + 0.2, -21.2], r: 3.6 },
    view: { from: [47.8, VIEW_Y + 1.8, -20.0], to: [53.0, VIEW_Y + 1.8, -20.0], look: [50.5, VIEW_Y + 0.5, -22.5] },
  });
  orb('zelena', [54, VIEW_Y + 0.5, -6], 18.0, ['zelena'], 'combo', VIEW_Y + 1.2, {
    at: V(54, VIEW_Y + 2.4, -6), near: { p: [54, VIEW_Y + 0.2, -6], r: 5.0 },
    view: { from: [38, VIEW_Y + 10, 12], to: [38, VIEW_Y + 12, -24], look: [56, VIEW_Y + 0.5, -6] },
    wideView: { from: [26, VIEW_Y + 22, 34], to: [26, VIEW_Y + 22, -34], look: [56, VIEW_Y + 1, 0], lookTo: [56, VIEW_Y + 1, -18] },
  });
  orb('cetiri', [66, VIEW_Y + 3.2, 24], 10.5, ['cetiri'], 'close', VIEW_Y + 5.8, {
    at: V(61, VIEW_Y + 2.4, 24), near: { p: [61, VIEW_Y + 0.2, 24], r: 5.0 },
    view: { from: [46, VIEW_Y + 9.0, 24], to: [48, VIEW_Y + 10.5, 16], look: [66, VIEW_Y + 3.0, 24] },
  });

  // Zone 7: Jajce Royal Fortress (3 words, Stage 2!)
  orb('top', [0, FORT_Y + 0.9, -79.2], 2.2, ['top'], 'close', FORT_Y + 1.8, {
    near: { p: [0, FORT_Y + 0.2, -81.5], r: 4.0 },
    view: { from: [3.2, FORT_Y + 2.4, -82.5], to: [-3.2, FORT_Y + 2.4, -82.5], look: [0, FORT_Y + 0.9, -79.2] },
  });
  orb('toplo', [-4.0, FORT_Y + 1.0, -81.9], 2.0, ['toplo'], 'close', FORT_Y + 2.1, {
    near: { p: [-4.0, FORT_Y + 0.2, -80.2], r: 3.8 },
    view: { from: [-1.2, FORT_Y + 2.4, -79.2], to: [-6.8, FORT_Y + 2.4, -79.2], look: [-4.0, FORT_Y + 1.0, -81.9] },
  });
  // Stage 2 (LAST WORD): 'tvrdjava' on Jajce Royal Fortress
  orb('tvrdjava', [-6, FORT_Y + 4.5, -88], 16.0, ['tvrdjava'], 'combo', FORT_Y + 1.0, {
    stage: 2, at: V(-2, FORT_Y + 2.6, -86), near: { p: [-2, FORT_Y + 0.2, -86], r: 6.5 },
    view: { from: [24, FORT_Y + 12, -60], to: [-28, FORT_Y + 14, -58], look: [-6, FORT_Y + 4.5, -88] },
    wideView: { from: [32, FORT_Y + 20, -48], to: [-36, FORT_Y + 20, -48], look: [-6, FORT_Y + 4.0, -88], lookTo: [-6, FORT_Y + 4.0, -88] },
  });

  // Set paint source for every orb tag & sky/sun before b.finish(scene)
  for (const o of orbs) for (const t of o.tags) tag(t).source = o.focus.clone();
  tag('sky').source = sunPos.clone();
  tag('sun').source = sunPos.clone();

  b.finish(scene);

  return {
    colliders: b.colliders,
    orbs,
    people,
    animals,
    clouds,
    smoke,
    start: V(33.8, VIEW_Y + 0.34, 0.0),
    fleur: V(-6, FORT_Y + 14.0, -86),
    sunPos,
    movers: [],
    // Jajce-specific animated handles for jajce.js
    wheels,
    raft: { g: raftG, home: V(26.0, 0.14, 20.0) },
    swans,
    butterflies,
    bees,
    swallows,
    frog: frogG,
    frogHomeY: WATER_UPPER + 0.16,
    petalEmitters,
  };
}
