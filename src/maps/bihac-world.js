// Bihać (spring): 3D storybook world built to Mostar/Sarajevo/Jajce/Travnik standards.
// North is -z (Sokolac watchtower & National Park Una), South is +z, Emerald Una River flows north through x = -14..14, y = 0.
import * as THREE from 'three';
import { Builder, PAT, tag, rng, shared, paintGeo, washMat, addHull } from '../paper.js';
import S from '../settings.js';

export const TOWN_Y = 4.0;
export const FOREST_Y = 12.0;
export const HILL_Y = 26.0;
export const SUN_BIHAC = new THREE.Vector3(0.62, 0.58, 0.52).normalize();

const V = (x, y, z) => new THREE.Vector3(x, y, z);

function mat4(x, y, z, ry = 0, rx = 0, rz = 0, s = 1) {
  return new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')),
    Array.isArray(s) ? new THREE.Vector3(...s) : new THREE.Vector3(s, s, s),
  );
}

const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 8);
const CYL12 = new THREE.CylinderGeometry(1, 1, 1, 12);
const CYL16 = new THREE.CylinderGeometry(1, 1, 1, 16);
const CONE4 = new THREE.ConeGeometry(1, 1, 4);
const CONE8 = new THREE.ConeGeometry(1, 1, 8);
const ICO = new THREE.IcosahedronGeometry(1, 1);
const DODE = new THREE.DodecahedronGeometry(1, 0);
const SPHERE = new THREE.SphereGeometry(1, 10, 8);
const HEMI = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);

function hipRoofGeo(w, d, h) {
  const g = new THREE.ConeGeometry(1, h, 4);
  g.rotateY(Math.PI / 4);
  g.scale(w * 0.72, 1, d * 0.72);
  g.translate(0, h / 2, 0);
  return g;
}

function pointedArchGeo(w, h, depth) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.quadraticCurveTo(-w * 0.42, h * 0.65, 0, h);
  s.quadraticCurveTo(w * 0.42, h * 0.65, w / 2, 0);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 6 });
  g.translate(0, 0, -depth / 2);
  return g;
}

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

export function bihacGroundY(x, z) {
  // Emerald Una river channel (x = -14..14) except river island ada at (0, 6)
  if (Math.hypot(x / 5.5, (z - 6) / 6.5) < 1.0) return 1.1;
  if (x >= -14 && x <= 14 && z >= -112 && z <= 112) return 0;
  // Stari Grad Sokolac hilltop centred at (0, -78)
  if (Math.hypot(x / 18, (z + 78) / 16) < 1.05) return HILL_Y;
  // National Park Una forest terraces (north of z = -34 on west & east)
  if (z < -34 && z >= -74 && Math.abs(x) > 14) return FOREST_Y;
  return TOWN_Y;
}

export function buildBihacWorld(scene) {
  const b = new Builder(), R = rng(709);
  const rr = (lo, hi) => lo + R() * (hi - lo);
  const A = (geo, x, y, z, o, ry = 0, rx = 0, rz = 0, s = 1) => b.add(geo, mat4(x, y, z, ry, rx, rz, s), o);
  const box = (w, h, d, x, y, z, o, ry = 0, rx = 0, rz = 0) => A(BOX, x, y, z, o, ry, rx, rz, [w, h, d]);

  // Crisp luminous spring morning light for Bihać & the emerald Una
  shared.uSunDir.value.copy(SUN_BIHAC);
  shared.uWaterDir.value.set(0, -1); // Una flows north (-z)
  shared.uSunShadow.value.set(0.52, 0.64, 0.76);
  shared.uSunGlow.value.set(0.98, 0.94, 0.70);
  shared.uSunTint.value.set(1.03, 1.04, 0.96);
  shared.uSkyGlow.value.set(0.82, 0.96, 1.0);

  const orbs = [], clouds = [], people = [], animals = [], smoke = [], sprayEmitters = [];
  const dragonflies = [];

  const orb = (id, focus, size, tags, shot, top, extra = {}) => orbs.push({
    id, focus: V(...focus), size, tags, shot,
    at: V(focus[0], top + S.orb.hoverHeight, focus[2]), stage: 1, ...extra,
  });

  // Palettes
  const LIME = ['#f5f1e6', '#e6dfd0'];
  const TILE = ['#b85834', '#8f3f22'];
  const WOOD_D = ['#593c26', '#3d2818'];
  const WOOD_W = ['#94693e', '#704d2a'];
  const STONE_W = ['#d8ceb8', '#b5a88e'];
  const STONE_G = ['#bab6ac', '#949086'];
  const GRASS = ['#69a84a', '#4b8532'];
  const GRASS_H = ['#56913d', '#3b6e28'];

  // ==================== 1. SKY, SUN & SPRING CLOUDS ====================
  tag('sky').side = THREE.BackSide; tag('sky').mode = 'one'; tag('sky').radius = 1300; tag('sky').dur = 6;
  tag('sun').mode = 'one'; tag('sun').radius = 65; tag('sun').dur = 2.5;
  A(new THREE.SphereGeometry(720, 32, 20), 0, 0, 0, { tag: 'sky', col: '#a0daf2', bleed: '#5caae0', pat: PAT.sky, hatch: 0, ink: false, solid: false });
  const sunPos = SUN_BIHAC.clone().multiplyScalar(520);
  const sunM = new THREE.Matrix4().lookAt(sunPos, V(0, 20, 0), V(0, 1, 0)).setPosition(sunPos);
  b.add(new THREE.CircleGeometry(28, 36).rotateY(Math.PI), sunM, { tag: 'sun', col: '#fff199', bleed: '#ffd354', hatch: 0, ink: false, solid: false });
  {
    const g = new THREE.Group(); g.position.copy(sunPos); g.lookAt(0, 20, 0);
    const inkM = new THREE.MeshBasicMaterial({ color: S.ink.color, side: THREE.DoubleSide });
    for (const r0 of [28, 29]) { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r0 + 0.7, 48), inkM); m.position.z = -0.5; g.add(m); }
    scene.add(g);
  }
  for (const [x, y, z, s] of [[-155, 78, -130, 8], [135, 82, -145, 9], [165, 72, 75, 7], [-165, 70, 90, 8], [-15, 86, -205, 9], [45, 78, 195, 8]]) {
    clouds.push({ c: V(x, y, z), r: 4.0 * s });
    const dr = -rr(14, 34);
    b.object(() => {
      for (const [ox, oy, oz, r] of [[-2.0, 0, 0, 1.4], [-0.5, 0.5, 0.2, 1.9], [1.0, 0.45, -0.2, 2.0], [2.3, 0, 0, 1.4], [0.2, -0.2, 0.5, 1.7]])
        A(ICO, x + ox * s, y + oy * s, z + oz * s, { tag: 'hills', col: '#ffffff', bleed: '#e4f0f5', hull: true, hatch: 0.3, solid: false, sway: dr }, 0, 0, 0, [r * s, 0.58 * r * s, r * s]);
    });
  }

  for (const t of ['smaragd', 'ada', 'buk', 'tok', 'osmatracnica', 'drvored', 'kamp', 'horizont']) {
    tag(t).mode = 'one'; tag(t).radius = 120; tag(t).holdRest = 2.4;
  }
  for (const t of ['sojenica', 'trstika', 'stup', 'jasen', 'paprat', 'mahovina', 'osam']) {
    tag(t).waveDelay = 2.2;
  }

  // ==================== 2. TERRAIN, UNA CHANNEL, BANKS & KRAJINA HILLS ====================
  const BANK_M = { tag: 'riverbank', col: GRASS[0], bleed: GRASS[1], pat: PAT.grass };
  const TOWN_G = { tag: 'town', col: '#d2ccc0', bleed: '#b4aea2', pat: PAT.cobble, ps: 0.65 };
  const HILL_M = { tag: 'hills', col: GRASS_H[0], bleed: GRASS_H[1], pat: PAT.grass };
  const EMB_M = { tag: 'riverbank', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.65 };

  // Continuous wide Krajina valley floor underneath everything so sky never peeks under terrain or hills
  box(480, 4, 480, 0, -4.0, 0, { tag: 'hills', col: GRASS_H[0], bleed: GRASS_H[1], pat: PAT.grass, ink: false });

  // Una River bed (x = -14..14, z = -115..115)
  box(32, 2, 240, 0, -1.6, 0, { tag: 'riverbank', col: '#3a7a64', bleed: '#255c4a', ink: false });

  // West bank: Japodes village & Krajina river camp (x = -95..-14, z = -34..82, y = TOWN_Y)
  box(82, 6, 116, -55, TOWN_Y - 3, 24, BANK_M);
  // East bank: Old Town Bihać (Kapetanova kula, Fethija) & Riverside Park (x = 14..95, z = -34..82, y = TOWN_Y)
  box(82, 6, 116, 55, TOWN_Y - 3, 24, TOWN_G);
  // Stone river embankments lining the Una (x = -14 & x = 14)
  box(1.6, 4.5, 116, -14.4, 1.85, 24, EMB_M);
  box(1.6, 4.5, 116, 14.4, 1.85, 24, EMB_M);

  // Wooden Bihać town bridge spanning the Una at z = 20 connecting west & east banks
  b.object(() => {
    const BR = { tag: 'town', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3 };
    const RL = { tag: 'town', col: WOOD_D[0], bleed: WOOD_D[1], wall: true };
    box(30.5, 0.35, 3.8, 0, TOWN_Y + 0.25, 20, BR);
    for (const rz of [18.2, 21.8]) box(30.2, 0.9, 0.16, 0, TOWN_Y + 0.82, rz, RL);
    for (const px of [-8, 8]) box(0.7, 4.5, 3.6, px, 2.0, 20, { tag: 'town', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.7 });
  });

  // National Park Una forested terraces north of z = -34 (y = FOREST_Y = 12.0)
  box(74, 14, 48, -52, FOREST_Y - 7.0, -58, HILL_M);
  box(74, 14, 48, 52, FOREST_Y - 7.0, -58, HILL_M);
  box(74, 8.2, 1.4, -52, 8.0, -34.2, EMB_M);
  box(74, 8.2, 1.4, 52, 8.0, -34.2, EMB_M);

  // Stari Grad Sokolac tapered natural green hilltop at (0, -78, top plateau y = HILL_Y = 26.0)
  A(new THREE.CylinderGeometry(16.5, 34, 28, 16), 0, 12.0, -78, { tag: 'hills', col: GRASS_H[0], bleed: GRASS_H[1], pat: PAT.grass });
  A(CYL16, 0, 25.6, -78, { tag: 'hills', col: GRASS[0], bleed: GRASS[1], pat: PAT.grass }, 0, 0, 0, [17.0, 0.8, 15.0]);
  // Soft flanking hillside shoulders blending Sokolac into the forest terraces
  for (const [sx, sy, sz, rx, ry, rz] of [[-24, 6, -78, 22, 14, 20], [24, 6, -78, 22, 14, 20], [0, -2, -98, 36, 22, 24]]) {
    A(HEMI, sx, sy, sz, { tag: 'hills', col: GRASS_H[0], bleed: GRASS_H[1], pat: PAT.grass, solid: false }, 0, 0, 0, [rx, ry, rz]);
  }

  // Distant Krajina horizon mountain range ('horizont') firmly grounded at y = -2
  for (const [hx, hz, rx, ry, rz] of [
    [-145, -148, 86, 46, 54], [-68, -162, 84, 56, 56], [0, -168, 96, 62, 58],
    [72, -160, 84, 54, 56], [148, -146, 86, 46, 54],
  ]) {
    A(HEMI, hx, -2.5, hz, { tag: 'horizont', col: '#699e7a', bleed: '#4c7d64', hull: true, solid: false, orb: 'horizont' }, 0, 0, 0, [rx, ry, rz]);
  }
  // Enclosing lush rolling Krajina hills ('hills') firmly grounded at y = -2 around west, east & south
  for (const [hx, hz, rx, ry, rz] of [
    [-136, -65, 62, 34, 68], [-134, 15, 58, 30, 76], [-128, 92, 64, 32, 62],
    [136, -65, 62, 34, 68], [134, 15, 58, 30, 76], [128, 92, 64, 32, 62],
    [-62, 128, 76, 32, 54], [62, 128, 76, 32, 54],
  ]) {
    A(HEMI, hx, -2.5, hz, { tag: 'hills', col: '#5c9646', bleed: '#41732f', pat: PAT.grass, hull: true, solid: false }, 0, 0, 0, [rx, ry, rz]);
  }
  // Gentle low foothills softening the outer meadow edges
  for (const [hx, hz, rx, ry, rz] of [[-96, 52, 26, 12, 32], [-96, -8, 24, 11, 28], [96, 46, 26, 12, 34], [96, -8, 24, 11, 28]]) {
    A(HEMI, hx, 3.0, hz, { tag: 'hills', col: GRASS[0], bleed: GRASS[1], pat: PAT.grass, solid: false }, 0, 0, 0, [rx, ry, rz]);
  }

  // ==================== 3. ZONE 1: EMERALD UNA RIVER, CASCADES, ADA & BOAT (10 words) ====================
  // STAGE 0 (FIRST WORD!): 'smaragd' (emerald green water of the Una River!)
  box(28.5, 0.12, 224, 0, -0.06, 0, {
    tag: 'smaragd', col: '#22ab82', bleed: '#127a5b', pat: PAT.water, hatch: 0, water: true, ink: false, orb: 'smaragd',
  });

  // Lush green river island ('ada') in the middle of the Una at (0, 0.6, 6)
  b.object(() => {
    const AD = { tag: 'ada', col: '#63a848', bleed: '#44822f', pat: PAT.grass, orb: 'ada' };
    A(CYL16, 0, 0.55, 6, AD, 0, 0, 0, [5.4, 1.2, 6.4]);
    for (const [bx, bz, r] of [[-4.8, 4.2, 0.7], [4.7, 7.6, 0.8], [-3.8, 9.8, 0.65], [3.6, 2.2, 0.7]]) {
      A(ICO, bx, 0.35, bz, { tag: 'ada', col: '#9e9b90', bleed: '#757268', hull: true }, 0, 0, 0, [r, r * 0.6, r]);
    }
    for (const [sx, sz, r] of [[-1.8, 4.5, 1.3], [1.6, 7.2, 1.4], [-0.4, 6.0, 1.65]]) {
      A(ICO, sx, 1.75, sz, { tag: 'ada', col: '#529c3f', bleed: '#367527', hull: true, sway: 0.10 }, 0, 0, 0, [r, r * 0.85, r]);
    }
    A(CYL, 1.2, 2.5, 7.0, { tag: 'ada', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.22, 2.8, 0.22]);
    A(ICO, 1.2, 4.3, 7.0, { tag: 'ada', col: '#7ec460', bleed: '#54993a', hull: true, sway: 0.14 }, 0, 0, 0, [1.85, 1.55, 1.85]);
    A(ICO, 1.6, 4.7, 6.6, { tag: 'ada', col: '#e8f5da', bleed: '#c2e0a8', hull: true, sway: 0.14 }, 0, 0, 0, [1.15, 0.95, 1.15]);
  });

  // Roaring travertine cascade ledge ('buk') across the Una at z = -12
  b.object(() => {
    const BK_R = { tag: 'buk', col: '#a8a288', bleed: '#7a745d', pat: PAT.blocks, ps: 0.6, orb: 'buk' };
    const BK_W = { tag: 'buk', col: '#7ce3d0', bleed: '#45b8a4', hatch: 0, ink: false, solid: false };
    const BK_F = { tag: 'buk', col: '#eefcf9', bleed: '#bcece2', hull: true, hatch: 0, ink: false, solid: false };
    box(27.5, 0.65, 2.1, 0, 0.12, -11.8, BK_R);
    box(27.2, 0.36, 1.8, 0, 0.08, -13.2, BK_W);
    for (let i = 0; i < 11; i++) {
      const fx = -12.0 + i * 2.4 + ((i % 3) - 1) * 0.35;
      const fz = -12.6 - (i % 2) * 0.85;
      const rx = 1.05 + (i % 3) * 0.32;
      const ry = 0.26 + ((i + 1) % 3) * 0.12;
      A(ICO, fx, 0.24 + (i % 2) * 0.08, fz, BK_F, i * 0.7, 0, 0, [rx, ry, 0.85 + (i % 2) * 0.35]);
    }
    sprayEmitters.push({ x: 0, y: 1.2, z: -12, r: 10 }, { x: 0, y: 1.5, z: 6, r: 6 });
  });

  // Shimmering river current streaks ('tok') sweeping past the island at (8.5, 0.08, 6)
  b.object(() => {
    const TK = { tag: 'tok', col: '#b5f7eb', bleed: '#6cd9c7', hatch: 0, ink: false, solid: false, orb: 'tok' };
    for (const [tx, tz, len, ang] of [
      [6.4, 2.2, 3.6, 0.14], [8.2, 3.8, 4.2, -0.08], [10.0, 5.4, 3.4, 0.10],
      [7.1, 6.8, 4.0, -0.12], [9.1, 8.6, 3.8, 0.09], [7.8, 10.2, 3.2, -0.06],
    ]) {
      A(CYL, tx, 0.05, tz, TK, ang, Math.PI / 2, 0, [0.22, len, 0.05]);
    }
  });

  // Traditional wooden Una river boat ('ladja') at (-7.5, 0.14, 12) with carved bow ('pramac'), stern ('krma') & rudder ('kormilo')!
  const ladjaG = new THREE.Group();
  ladjaG.position.set(-7.5, 0.16, 12.0);
  ladjaG.rotation.y = 0.12;
  scene.add(ladjaG);
  dynMesh(BOX, 'ladja', '#8c5e34', '#634020', ladjaG, 0, 0.18, 0, [1.35, 0.36, 4.4], 1.2);
  for (const bz of [-1.2, 0, 1.2]) dynMesh(BOX, 'ladja', '#a87646', '#7d542d', ladjaG, 0, 0.38, bz, [1.25, 0.08, 0.32], 1.1);
  // Pointed curved prow ('pramac') at -z (front)
  const prow = dynMesh(CONE4, 'pramac', '#b57b42', '#825326', ladjaG, 0, 0.45, -2.75, [0.85, 1.6, 0.72], 1.2);
  prow.rotation.x = -Math.PI / 2 + 0.32;
  // Stern ('krma') at +z (rear)
  dynMesh(BOX, 'krma', '#784e2a', '#523318', ladjaG, 0, 0.34, 2.45, [1.05, 0.44, 0.75], 1.2);
  // Rudder ('kormilo') mounted at stern
  dynMesh(BOX, 'kormilo', '#59381d', '#382210', ladjaG, 0, 0.24, 3.05, [0.12, 0.72, 0.65], 1.1);
  dynMesh(CYL, 'kormilo', '#a87846', '#7a542d', ladjaG, 0, 0.56, 2.65, [0.05, 0.95, 0.05], 1.1).rotation.x = Math.PI / 2;

  // Bright Una Regatta inflatable raft ('regata') & orange life vest ('prsluk') at (8.5, 0.18, 28)
  const regataG = new THREE.Group();
  regataG.position.set(8.5, 0.18, 28.0);
  regataG.rotation.y = -0.18;
  scene.add(regataG);
  dynMesh(BOX, 'regata', '#2e78c9', '#1c5291', regataG, 0, 0.10, 0, [2.0, 0.22, 3.6], 1.2);
  for (const sx of [-0.95, 0.95]) {
    const t = dynMesh(CYL12, 'regata', '#f2b824', '#c28d10', regataG, sx, 0.32, 0, [0.34, 3.6, 0.34], 1.2);
    t.rotation.x = Math.PI / 2;
  }
  // Orange life vest ('prsluk') resting on the raft seat
  dynMesh(BOX, 'prsluk', '#f26222', '#bd420f', regataG, 0.1, 0.42, 0.2, [0.58, 0.22, 0.65], 1.1);

  // ==================== 4. ZONE 2: JAPODES STILT VILLAGE (SOJENICE) & POTTERY (10 words) ====================
  // 3 prehistoric wooden stilt houses ('sojenica') standing out over the emerald Una shallows on tall oak pilings ('stup') at x = -13.0, z = -8, 1, 10
  for (const sz of [-8, 1, 10]) {
    b.object(() => {
      // Tall oak pilings ('stup') rising straight out of the emerald Una water
      const ST = { tag: 'stup', col: WOOD_D[0], bleed: WOOD_D[1], orb: 'stup' };
      for (const px of [-1.7, 1.7]) for (const pz of [-1.4, 1.4]) {
        box(0.30, 4.8, 0.30, -13.0 + px, 2.0, sz + pz, ST);
      }
      // Timber stilt-house deck, walls & shore gangplank ('sojenica')
      const SJ = { tag: 'sojenica', col: '#8a623c', bleed: '#664526', pat: PAT.planks, ps: 3, orb: 'sojenica' };
      box(4.8, 0.28, 4.0, -13.0, TOWN_Y + 0.55, sz, SJ);
      box(2.2, 0.22, 1.4, -15.8, TOWN_Y + 0.32, sz, SJ);
      box(3.9, 2.4, 3.2, -13.0, TOWN_Y + 1.88, sz, SJ);
      box(0.95, 1.65, 0.14, -11.0, TOWN_Y + 1.45, sz, { tag: 'sojenica', col: '#3b2819' });
      // Thick golden-tan woven reed thatch roof ('trstika')
      A(hipRoofGeo(5.3, 4.5, 2.45), -13.0, TOWN_Y + 3.08, sz, {
        tag: 'trstika', col: '#cfb36e', bleed: '#a38746', pat: PAT.roof, orb: 'trstika',
      });
    });
  }

  // Riverbank pottery yard & hearth at (-28, TOWN_Y, 6)
  b.object(() => {
    // Open stone hearth ('ognjiste') + soft grey ash ('pepeo') + cooking pot ('lonac')
    A(new THREE.TorusGeometry(1.15, 0.28, 6, 12), -28, TOWN_Y + 0.24, 6, { tag: 'ognjiste', col: STONE_G[0], bleed: STONE_G[1], orb: 'ognjiste' }, 0, Math.PI / 2, 0);
    A(CYL12, -28, TOWN_Y + 0.14, 6, { tag: 'pepeo', col: '#b8b6b0', bleed: '#8d8b85', orb: 'pepeo' }, 0, 0, 0, [0.85, 0.16, 0.85]);
    A(SPHERE, -28, TOWN_Y + 0.52, 6, { tag: 'lonac', col: '#3d3f44', bleed: '#252629', hull: true, orb: 'lonac' }, 0, 0, 0, [0.44, 0.36, 0.44]);
    smoke.push(V(-28, TOWN_Y + 0.95, 6));
    // Potter's clay mound ('glina'), amphora pitcher ('cup') & bowl ('zdjela') at (-27, TOWN_Y, -3)
    box(3.4, 0.82, 1.2, -27.5, TOWN_Y + 0.41, -3.2, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
    A(ICO, -28.6, TOWN_Y + 0.98, -3.2, { tag: 'glina', col: '#b86c48', bleed: '#8c4c2e', hull: true, orb: 'glina' }, 0, 0, 0, [0.36, 0.26, 0.34]);
    A(SPHERE, -27.5, TOWN_Y + 1.08, -3.2, { tag: 'cup', col: '#c96f44', bleed: '#964b28', hull: true, orb: 'cup' }, 0, 0, 0, [0.24, 0.34, 0.24]);
    A(CYL12, -27.5, TOWN_Y + 1.42, -3.2, { tag: 'cup', col: '#c96f44', bleed: '#964b28' }, 0, 0, 0, [0.11, 0.22, 0.11]);
    A(HEMI, -26.4, TOWN_Y + 1.06, -3.2, { tag: 'zdjela', col: '#d47c4e', bleed: '#9e5430', hull: true, orb: 'zdjela' }, 0, Math.PI, 0, [0.28, 0.24, 0.28]);
  });
  people.push({ kind: 'bihPotter', x: -27.5, y: TOWN_Y + 0.04, z: -1.8, ry: Math.PI, tag: 'grncar' });

  // ==================== 5. ZONE 3: KAPETANOVA KULA & FETHIJA GOTHIC MOSQUE (11 words) ====================
  // Kapetanova kula (Captain's Tower) at (28, TOWN_Y, -8)
  b.object(() => {
    const TW = { tag: 'town', col: STONE_W[0], bleed: STONE_W[1], pat: PAT.blocks, ps: 0.65, pool: 0.8 };
    box(8.2, 13.5, 8.2, 28, TOWN_Y + 6.75, -8, TW);
    A(hipRoofGeo(9.4, 9.4, 4.4), 28, TOWN_Y + 13.5, -8, { tag: 'town', col: TILE[0], bleed: TILE[1], pat: PAT.roof });
    // Upper medieval stone embrasure windows on west and south facades
    for (const wy of [TOWN_Y + 8.6, TOWN_Y + 11.4]) {
      box(0.24, 1.35, 0.85, 23.86, wy, -8, { tag: 'town', col: '#3b332c', solid: false });
      box(0.85, 1.35, 0.24, 28, wy, -3.86, { tag: 'town', col: '#3b332c', solid: false });
    }
    // Iron-bound dungeon door ('tamnica') on west river-facing side
    box(0.28, 2.6, 1.8, 23.82, TOWN_Y + 1.3, -8, { tag: 'tamnica', col: '#4a3525', bleed: '#2e1f14', orb: 'tamnica' });
    for (const dy of [-0.6, 0, 0.6]) box(0.32, 0.10, 1.7, 23.78, TOWN_Y + 1.3 + dy, -8, { tag: 'tamnica', col: '#3a3d42', solid: false });
    // Weathered stone crack ('pukotina') on south tower wall
    box(0.18, 2.2, 0.14, 26.2, TOWN_Y + 4.8, -3.85, { tag: 'pukotina', col: '#3a352f', bleed: '#221f1c', solid: false, orb: 'pukotina' }, 0, 0, 0.28);
    box(0.16, 1.8, 0.14, 26.6, TOWN_Y + 3.2, -3.85, { tag: 'pukotina', col: '#3a352f', bleed: '#221f1c', solid: false }, 0, 0, -0.32);
    // Carved medieval stone relief slab ('reljef') on south wall
    box(2.2, 1.4, 0.22, 29.6, TOWN_Y + 2.4, -3.84, { tag: 'reljef', col: '#e8dec8', bleed: '#c4b698', orb: 'reljef' });
    A(ICO, 29.6, TOWN_Y + 2.4, -3.70, { tag: 'reljef', col: '#cfc2a6', bleed: '#a8997c', solid: false }, 0, 0, 0, [0.55, 0.45, 0.12]);
  });
  // Medieval guard ('strazar'), shield ('stit'), sword ('mac') & suit of armour ('oklop') by Kapetanova kula
  people.push({ kind: 'bihGuard', x: 22.4, y: TOWN_Y + 0.04, z: -5.2, ry: -Math.PI / 2, tag: 'strazar' });
  b.object(() => {
    // Armour stand ('oklop') at (22.6, TOWN_Y, -10.8)
    A(CYL12, 22.6, TOWN_Y + 1.05, -10.8, { tag: 'oklop', col: '#9aa4b0', bleed: '#6d7782', orb: 'oklop' }, 0, 0, 0, [0.34, 1.2, 0.26]);
    A(SPHERE, 22.6, TOWN_Y + 1.82, -10.8, { tag: 'oklop', col: '#aeb8c4', bleed: '#7d8794', hull: true }, 0, 0, 0, 0.22);
    // Shield ('stit') & sword ('mac') displayed on timber rack at (22.8, TOWN_Y, -12.6)
    box(0.18, 0.95, 0.72, 22.8, TOWN_Y + 1.1, -12.6, { tag: 'stit', col: '#2d5799', bleed: '#1c3b6b', orb: 'stit' });
    box(0.22, 0.35, 0.35, 22.78, TOWN_Y + 1.1, -12.6, { tag: 'stit', col: '#f2c842', bleed: '#c2981c', solid: false });
    box(0.08, 1.35, 0.12, 22.8, TOWN_Y + 1.15, -13.6, { tag: 'mac', col: '#cfd6de', bleed: '#969fa8', orb: 'mac' });
    box(0.10, 0.10, 0.46, 22.8, TOWN_Y + 0.65, -13.6, { tag: 'mac', col: '#c99b38', bleed: '#966f1c' });
  });

  // Fethija Gothic Mosque at (46, TOWN_Y, -14): Bosnia's ONLY Gothic mosque!
  b.object(() => {
    const FT = { tag: 'town', col: LIME[0], bleed: LIME[1], pat: PAT.blocks, ps: 0.7, pool: 0.75 };
    box(11.5, 8.2, 15.0, 46, TOWN_Y + 4.1, -14, FT);
    A(hipRoofGeo(12.6, 16.0, 3.8), 46, TOWN_Y + 8.2, -14, { tag: 'town', col: '#5c5852', bleed: '#403d38', pat: PAT.roof });
    // Slim octagonal Ottoman minaret added in 1592
    A(CYL12, 39.6, TOWN_Y + 9.5, -7.2, { tag: 'town', col: STONE_W[0], bleed: STONE_W[1] }, 0, 0, 0, [0.72, 19.0, 0.72]);
    A(CYL12, 39.6, TOWN_Y + 14.5, -7.2, { tag: 'town', col: STONE_W[0], bleed: STONE_W[1] }, 0, 0, 0, [1.05, 0.55, 1.05]);
    A(CONE8, 39.6, TOWN_Y + 21.0, -7.2, { tag: 'town', col: '#5c5852', bleed: '#403d38' }, 0, 0, 0, [0.82, 4.0, 0.82]);
    // Symmetrical pointed Gothic stone arch surrounds ('gotika') & stained glass ('vitraj') along south facade (z = -6.4)
    const archTop = pointedArchGeo(1.42, 1.15, 0.26);
    const glassTop = pointedArchGeo(0.86, 0.85, 0.28);
    for (const gx of [43.2, 46.0, 48.8]) {
      box(1.42, 3.1, 0.24, gx, TOWN_Y + 2.85, -6.42, { tag: 'gotika', col: '#dfd5be', bleed: '#b8ac94', orb: 'gotika' });
      A(archTop, gx, TOWN_Y + 4.38, -6.42, { tag: 'gotika', col: '#dfd5be', bleed: '#b8ac94' });
      // Jewel-toned stained glass panes ('vitraj') inside the pointed lancet arches
      const gc = gx < 45 ? '#3a7cc4' : gx > 47 ? '#d44c54' : '#e6b834';
      box(0.86, 2.75, 0.28, gx, TOWN_Y + 2.85, -6.38, { tag: 'vitraj', col: gc, bleed: '#284a7a', orb: 'vitraj' });
      A(glassTop, gx, TOWN_Y + 4.20, -6.38, { tag: 'vitraj', col: gc, bleed: '#284a7a' });
    }
    // Circular stone Gothic rose window ('rozeta') high on south gable with radial stone tracery
    A(new THREE.TorusGeometry(1.05, 0.18, 6, 18), 46, TOWN_Y + 6.75, -6.38, { tag: 'rozeta', col: '#e8dec8', bleed: '#bfb39a', orb: 'rozeta' });
    A(CYL16, 46, TOWN_Y + 6.75, -6.44, { tag: 'rozeta', col: '#548ec9', bleed: '#326396', solid: false }, 0, Math.PI / 2, 0, [0.92, 0.14, 0.92]);
    for (const rz of [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]) {
      box(0.08, 1.85, 0.10, 46, TOWN_Y + 6.75, -6.34, { tag: 'rozeta', col: '#e8dec8', bleed: '#bfb39a', solid: false }, 0, 0, rz);
    }
    // Tall brass candelabra ('svijecnjak') at the stone entrance porch (46, TOWN_Y, -4.6)
    A(CYL12, 46, TOWN_Y + 0.08, -4.6, { tag: 'svijecnjak', col: '#d9b244', bleed: '#a68222' }, 0, 0, 0, [0.34, 0.16, 0.34]);
    A(CYL, 46, TOWN_Y + 0.80, -4.6, { tag: 'svijecnjak', col: '#d9b244', bleed: '#a68222', orb: 'svijecnjak' }, 0, 0, 0, [0.10, 1.45, 0.10]);
    box(0.88, 0.10, 0.10, 46, TOWN_Y + 1.48, -4.6, { tag: 'svijecnjak', col: '#d9b244', bleed: '#a68222' });
    for (const cx of [-0.36, 0, 0.36]) {
      A(CYL, 46 + cx, TOWN_Y + 1.66, -4.6, { tag: 'svijecnjak', col: '#fff7e0', bleed: '#e3d6b8' }, 0, 0, 0, [0.055, 0.30, 0.055]);
      A(CONE4, 46 + cx, TOWN_Y + 1.88, -4.6, { tag: 'svijecnjak', col: '#ffbe3b', bleed: '#e07a16', solid: false }, 0, 0, 0, [0.05, 0.14, 0.05]);
    }
  });

  // ==================== 6. ZONE 4: UNA RIVERSIDE PARK, ART & KRAJINA MUSIC (10 words) ====================
  // Tree-lined spring avenue ('drvored') along the east riverside promenade (x = 21.5, z = 14, 24, 34, 44)
  for (const dz of [14, 24, 34, 44]) {
    b.object(() => {
      A(CYL, 21.5, TOWN_Y + 2.0, dz, { tag: 'drvored', col: '#5c422c', bleed: '#402c1c', orb: 'drvored' }, 0, 0, 0, [0.30, 4.0, 0.30]);
      A(ICO, 21.5, TOWN_Y + 4.7, dz, { tag: 'drvored', col: '#69b04f', bleed: '#498734', hull: true, sway: 0.14 }, 0, 0, 0, [2.1, 1.95, 2.1]);
    });
  }

  // Park stone sculpture ('skulptura') on tiered pedestal at (30, TOWN_Y, 16): sculpted Bosnian stone arch monument
  b.object(() => {
    box(1.9, 0.35, 1.9, 30, TOWN_Y + 0.18, 16, { tag: 'props', col: STONE_G[0], bleed: STONE_G[1] });
    box(1.4, 0.85, 1.4, 30, TOWN_Y + 0.78, 16, { tag: 'props', col: STONE_G[0], bleed: STONE_G[1] });
    A(new THREE.TorusGeometry(0.68, 0.20, 7, 16), 30, TOWN_Y + 2.02, 16, { tag: 'skulptura', col: '#f0eadc', bleed: '#c7bfb0', orb: 'skulptura' }, 0.35, 0, 0);
    A(CYL12, 30, TOWN_Y + 1.32, 16, { tag: 'skulptura', col: '#e8e0cf', bleed: '#bfb5a2' }, 0, 0, 0, [0.55, 0.24, 0.55]);
    A(ICO, 30, TOWN_Y + 2.02, 16, { tag: 'skulptura', col: '#d4b46a', bleed: '#a3853e', hull: true }, 0, 0, 0, 0.22);
  });

  // Open-air painter's easel with canvas ('platno') & carved golden frame ('okvir') at (29, TOWN_Y, 26)
  b.object(() => {
    for (const sx of [-0.45, 0.45]) box(0.08, 1.9, 0.08, 29 + sx, TOWN_Y + 0.95, 26, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0.14, 0);
    // Golden frame ('okvir')
    box(1.42, 1.12, 0.10, 29, TOWN_Y + 1.48, 26.15, { tag: 'okvir', col: '#e3b83b', bleed: '#b58b1a', orb: 'okvir' }, 0, -0.15, 0);
    // Painted emerald Una canvas ('platno') inside frame
    box(1.18, 0.88, 0.12, 29, TOWN_Y + 1.48, 26.18, { tag: 'platno', col: '#3ec29e', bleed: '#268c70', orb: 'platno' }, 0, -0.15, 0);
  });

  // Krajina musician ('muzicar') playing accordion ('harmonika'), plus Bosnian saz ('saz') & flute ('frula') at (35, TOWN_Y, 26)
  box(2.8, 0.48, 0.72, 35, TOWN_Y + 0.24, 26, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
  people.push({ kind: 'bihAccordion', x: 34.4, y: TOWN_Y + 0.04, z: 26.0, ry: -Math.PI / 2, tag: 'muzicar' });
  b.object(() => {
    // Traditional long-necked Bosnian saz ('saz') leaning on the bench at (35.4, TOWN_Y, 26.0)
    A(ICO, 35.4, TOWN_Y + 0.75, 26.0, { tag: 'saz', col: '#b87638', bleed: '#854f1f', hull: true, orb: 'saz' }, 0, 0, 0, [0.22, 0.28, 0.18]);
    box(0.08, 1.05, 0.06, 35.4, TOWN_Y + 1.38, 26.0, { tag: 'saz', col: '#7a4b22', bleed: '#543214' });
    // Wooden shepherd flute ('frula') resting on the bench at (36.1, TOWN_Y + 0.52, 26.0)
    A(CYL, 36.1, TOWN_Y + 0.54, 26.0, { tag: 'frula', col: '#c99652', bleed: '#996d32', orb: 'frula' }, 0.3, 0, Math.PI / 2, [0.045, 0.65, 0.045]);
  });

  // Riverside craft stall ('tezga') & painted Bihać souvenirs ('suvenir') at (34, TOWN_Y, 36)
  b.object(() => {
    const TZ = { tag: 'tezga', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3, orb: 'tezga' };
    box(3.4, 0.92, 1.3, 34, TOWN_Y + 0.46, 36, TZ);
    for (const sx of [-1.55, 1.55]) for (const sz of [-0.55, 0.55]) box(0.12, 2.3, 0.12, 34 + sx, TOWN_Y + 1.2, 36 + sz, { tag: 'tezga', col: WOOD_D[0], bleed: WOOD_D[1] });
    box(3.8, 0.16, 1.8, 34, TOWN_Y + 2.42, 36, { tag: 'tezga', col: '#3a8c76', bleed: '#256352' }, 0, 0.16, 0);
    // Painted miniature Una keepsakes ('suvenir') on the counter
    for (const [ox, col] of [[-0.9, '#d9573b'], [-0.3, '#3f7cb0'], [0.3, '#e6b834'], [0.9, '#5aa366']]) {
      box(0.32, 0.42, 0.28, 34 + ox, TOWN_Y + 1.14, 36, { tag: 'suvenir', col, bleed: col, orb: 'suvenir' });
    }
  });

  // ==================== 7. ZONE 5: KRAJINA ORCHARD & UNA RIVER CAMP (9 words) ====================
  // Riverside campsite ('kamp') at (-30, TOWN_Y, 44) with quilt ('jorgan'), lantern ('svjetiljka'), compass ('kompas'), map ('karta') & canteen ('cuturica')
  b.object(() => {
    const KM = { tag: 'kamp', col: '#4a8f63', bleed: '#326946', orb: 'kamp' };
    A(new THREE.CylinderGeometry(0.1, 2.4, 2.3, 4), -32, TOWN_Y + 1.15, 44, KM, Math.PI / 4);
    box(2.2, 0.82, 1.3, -27.5, TOWN_Y + 0.41, 44, { tag: 'kamp', col: WOOD_W[0], bleed: WOOD_W[1] });
    // Rolled quilted blanket ('jorgan') beside the tent at (-30.2, TOWN_Y, 46.2)
    A(CYL12, -30.2, TOWN_Y + 0.28, 46.2, { tag: 'jorgan', col: '#d45a6a', bleed: '#a33b4a', hull: true, orb: 'jorgan' }, 0, 0, Math.PI / 2, [0.28, 1.3, 0.28]);
    // Camping lantern ('svjetiljka') glowing on the camp table (-28.2, TOWN_Y + 1.05, 43.8)
    A(CYL12, -28.2, TOWN_Y + 1.04, 43.8, { tag: 'svjetiljka', col: '#ffe066', bleed: '#e3b224', hull: true, orb: 'svjetiljka' }, 0, 0, 0, [0.16, 0.36, 0.16]);
    A(CONE8, -28.2, TOWN_Y + 1.30, 43.8, { tag: 'svjetiljka', col: '#3a424a', bleed: '#24292e' }, 0, 0, 0, [0.22, 0.14, 0.22]);
    // Spread trail map ('karta') & round brass compass ('kompas') & water canteen ('cuturica') on table
    box(0.85, 0.03, 0.62, -27.4, TOWN_Y + 0.84, 44.0, { tag: 'karta', col: '#f5ebd4', bleed: '#d6c9ab', orb: 'karta' }, 0.08);
    A(CYL12, -27.1, TOWN_Y + 0.88, 44.1, { tag: 'kompas', col: '#e3b83b', bleed: '#b3891a', orb: 'kompas' }, 0, 0, 0, [0.15, 0.06, 0.15]);
    A(SPHERE, -26.6, TOWN_Y + 0.98, 43.8, { tag: 'cuturica', col: '#5a7d4a', bleed: '#3d5930', hull: true, orb: 'cuturica' }, 0, 0, 0, [0.16, 0.22, 0.10]);
  });

  // Krajina orchard fruit baskets at (-26, TOWN_Y, 56): pears ('kruska'), peaches ('breskva') & hazelnuts ('ljesnjak')
  b.object(() => {
    for (const [bx, tagId, col1, col2] of [
      [-28.5, 'kruska', '#a8c942', '#7d9c28'],
      [-26.0, 'breskva', '#f29863', '#c96d3c'],
      [-23.5, 'ljesnjak', '#8c5c32', '#613c1d'],
    ]) {
      A(new THREE.CylinderGeometry(0.55, 0.42, 0.45, 10), bx, TOWN_Y + 0.24, 56, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        A(SPHERE, bx + Math.cos(a) * 0.22, TOWN_Y + 0.54, 56 + Math.sin(a) * 0.22, {
          tag: tagId, col: col1, bleed: col2, hull: true, orb: tagId,
        }, 0, 0, 0, tagId === 'kruska' ? [0.14, 0.20, 0.14] : 0.15);
      }
    }
  });

  // ==================== 8. ZONE 6: NATIONAL PARK UNA WILDLIFE & FOREST (11 words) ====================
  // Tall ash trees ('jasen'), ferns ('paprat') & velvety moss ('mahovina') on NW & NE forest terraces (y = FOREST_Y = 12.0)
  for (const [jx, jz, s] of [[-30, -44, 1.15], [-42, -52, 1.05], [32, -46, 1.1]]) {
    b.object(() => {
      A(CYL, jx, FOREST_Y + 2.5 * s, jz, { tag: 'jasen', col: '#7a7268', bleed: '#59524a', orb: 'jasen' }, 0, 0, 0, [0.36 * s, 5.0 * s, 0.36 * s]);
      A(ICO, jx, FOREST_Y + 5.6 * s, jz, { tag: 'jasen', col: '#5aa648', bleed: '#3d7d30', hull: true, sway: 0.14 }, 0, 0, 0, [2.6 * s, 2.3 * s, 2.6 * s]);
    });
  }
  // Woodland ferns ('paprat') & mossy stones ('mahovina') at (-24, FOREST_Y, -42) and (-36, FOREST_Y, -40)
  b.object(() => {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      box(0.28, 0.08, 1.35, -24 + Math.sin(a) * 0.65, FOREST_Y + 0.32, -42 + Math.cos(a) * 0.65, {
        tag: 'paprat', col: '#3e8c3a', bleed: '#266324', orb: 'paprat',
      }, a, -0.35, 0);
    }
    for (const [mx, mz, r] of [[-35.5, -40, 1.2], [-37.0, -41, 0.95], [-36.2, -39, 0.85]]) {
      A(ICO, mx, FOREST_Y + 0.35, mz, { tag: 'mahovina', col: '#589c3b', bleed: '#3a7024', hull: true, orb: 'mahovina' }, 0, 0, 0, [r, r * 0.45, r]);
    }
  });

  // Forest mammals & small creatures: brown bear ('medvjed'), badger ('jazavac'), snail ('puz'), beaver ('dabar'), turtle ('kornjaca'), eagle ('orao'), kingfisher ('vodomar'), dragonflies ('vilin')
  b.object(() => {
    // Mighty Bosnian brown bear ('medvjed') at (-46, FOREST_Y, -46)
    const MD = { tag: 'medvjed', col: '#69442a', bleed: '#452b18', hull: true, orb: 'medvjed' };
    A(ICO, -46, FOREST_Y + 1.05, -46, MD, 0, 0, 0, [0.75, 0.68, 1.15]);
    A(SPHERE, -46, FOREST_Y + 1.38, -44.8, MD, 0, 0, 0, [0.42, 0.38, 0.46]);
    for (const lx of [-0.42, 0.42]) for (const lz of [-0.62, 0.62]) A(CYL, -46 + lx, FOREST_Y + 0.48, -46 + lz, MD, 0, 0, 0, [0.22, 0.96, 0.22]);
    // Striped badger ('jazavac') at (-32, FOREST_Y, -50)
    const JZ = { tag: 'jazavac', col: '#4a4c52', bleed: '#2e3034', hull: true, orb: 'jazavac' };
    A(ICO, -32, FOREST_Y + 0.36, -50, JZ, 0, 0, 0, [0.34, 0.28, 0.56]);
    A(SPHERE, -32, FOREST_Y + 0.42, -49.4, { tag: 'jazavac', col: '#f2f2f2', bleed: '#d0d0d0', hull: true }, 0, 0, 0, [0.20, 0.16, 0.24]);
    // Snail ('puz') on mossy rock at (-26, FOREST_Y, -38)
    A(ICO, -26, FOREST_Y + 0.22, -38, { tag: 'puz', col: '#a87240', bleed: '#7a4f26', hull: true, orb: 'puz' }, 0, 0, 0, [0.22, 0.22, 0.22]);
    box(0.14, 0.10, 0.48, -26, FOREST_Y + 0.08, -37.9, { tag: 'puz', col: '#d4be96', bleed: '#ab946c' });
    // Beaver ('dabar') on river bank edge at (-16.2, TOWN_Y, -24)
    const DB = { tag: 'dabar', col: '#784c2c', bleed: '#52321b', hull: true, orb: 'dabar' };
    A(ICO, -16.2, TOWN_Y + 0.36, -24, DB, 0, 0, 0, [0.32, 0.28, 0.48]);
    box(0.28, 0.08, 0.55, -16.2, TOWN_Y + 0.18, -24.65, { tag: 'dabar', col: '#3d3632', bleed: '#24201d' });
    // River turtle ('kornjaca') on sunny bank rock at (16.5, TOWN_Y, 6)
    A(HEMI, 16.5, TOWN_Y + 0.08, 6, { tag: 'kornjaca', col: '#4a7a42', bleed: '#30542a', hull: true, orb: 'kornjaca' }, 0, 0, 0, [0.36, 0.24, 0.44]);
    A(SPHERE, 16.5, TOWN_Y + 0.16, 6.46, { tag: 'kornjaca', col: '#699954', bleed: '#487038', hull: true }, 0, 0, 0, 0.11);
    // Golden eagle ('orao') perched on high rock on NE terrace (26, FOREST_Y, -44)
    A(DODE, 26, FOREST_Y + 1.0, -44, { tag: 'hills', col: STONE_G[0], bleed: STONE_G[1], hull: true }, 0, 0, 0, [1.6, 1.1, 1.5]);
    A(ICO, 26, FOREST_Y + 2.45, -44, { tag: 'orao', col: '#6e4c2e', bleed: '#4a321c', hull: true, orb: 'orao' }, 0, 0, 0, [0.34, 0.44, 0.32]);
    A(SPHERE, 26, FOREST_Y + 2.98, -43.9, { tag: 'orao', col: '#8a623c', bleed: '#5c3f24', hull: true }, 0, 0, 0, 0.18);
    A(CONE4, 26, FOREST_Y + 2.95, -43.68, { tag: 'orao', col: '#f0be2e', bleed: '#bf9116' }, 0, Math.PI / 2, 0, [0.07, 0.22, 0.07]);
  });

  // Animated jewel-blue kingfisher ('vodomar') perched over the emerald Una at (-13.5, 3.2, -30)
  const kfG = new THREE.Group();
  kfG.position.set(-13.5, 3.2, -30.0);
  kfG.rotation.y = Math.PI / 2;
  scene.add(kfG);
  dynMesh(ICO, 'vodomar', '#1c96c9', '#0e648c', kfG, 0, 0.16, 0, [0.16, 0.16, 0.28], 1.1);
  dynMesh(ICO, 'vodomar', '#e87a24', '#b85712', kfG, 0, 0.08, 0.04, [0.14, 0.12, 0.20], 1.1);
  dynMesh(CONE4, 'vodomar', '#2e2c2a', '#1a1816', kfG, 0, 0.20, 0.34, [0.045, 0.28, 0.045], 1.0).rotation.x = Math.PI / 2;

  // Animated shimmering dragonflies ('vilin') over the river edge at (-10, 1.4, -22)
  for (let i = 0; i < 4; i++) {
    const dfg = new THREE.Group();
    const dx = -10.5 + i * 1.4, dy = 1.4 + (i % 2) * 0.4, dz = -22 + (i % 2) * 2.2;
    dfg.position.set(dx, dy, dz);
    scene.add(dfg);
    dynMesh(CYL, 'vilin', '#24b8b8', '#148282', dfg, 0, 0, 0, [0.04, 0.56, 0.04], 1.0).rotation.x = Math.PI / 2;
    dynMesh(BOX, 'vilin', '#ccf7f7', '#94dede', dfg, 0, 0.04, 0.05, [0.68, 0.02, 0.12], 1.0);
    dynMesh(BOX, 'vilin', '#ccf7f7', '#94dede', dfg, 0, 0.04, -0.08, [0.56, 0.02, 0.10], 1.0);
    dragonflies.push({ g: dfg, home: V(dx, dy, dz), r: 1.8 + i * 0.4, speed: 1.5 + i * 0.2, phase: i * 1.5 });
  }

  // ==================== 9. ZONE 7: STARI GRAD SOKOLAC WATCHTOWER (5 words, Stage 2!) ====================
  // Winding stone rampart staircase ('stepeniste') grounded cleanly down into the hillside up to Sokolac
  b.object(() => {
    const ST = { tag: 'stepeniste', col: STONE_W[0], bleed: STONE_W[1], pat: PAT.blocks, ps: 0.7, orb: 'stepeniste' };
    for (let i = 0; i < 10; i++) {
      const topY = FOREST_Y + 1.4 + i * 1.35;
      const h = topY - (FOREST_Y - 1.0);
      box(3.8, h, 2.4, 16.5 - i * 1.1, FOREST_Y - 1.0 + h / 2, -56 - i * 1.1, ST);
    }
  });

  // Stari Grad Sokolac medieval stone watchtower ('osmatracnica', Stage 2!) & eight battlements ('osam') at (0, HILL_Y, -78)
  b.object(() => {
    const OS = { tag: 'osmatracnica', col: '#d8ceb8', bleed: '#b0a388', pat: PAT.blocks, ps: 0.6, pool: 0.85, orb: 'osmatracnica' };
    // Curtain ring wall around hilltop
    box(24, 5.2, 2.0, 0, HILL_Y + 2.6, -68, OS);
    box(24, 5.2, 2.0, 0, HILL_Y + 2.6, -88, OS);
    box(2.0, 5.2, 22, -11, HILL_Y + 2.6, -78, OS);
    box(2.0, 5.2, 22, 11, HILL_Y + 2.6, -78, OS);
    // Tall slender Sokolac keep tower rising 14 m above the hill with medieval arrow-slits & crown cap
    box(6.2, 14.0, 6.2, 0, HILL_Y + 7.0, -78, OS);
    box(6.8, 0.7, 6.8, 0, HILL_Y + 14.3, -78, OS);
    for (const wy of [HILL_Y + 8.5, HILL_Y + 11.8]) {
      box(0.55, 1.4, 0.22, 0, wy, -74.86, { tag: 'osmatracnica', col: '#3a342e', solid: false });
    }
    // Exactly EIGHT ('osam') stone battlements crowning the south rampart!
    const O8 = { tag: 'osam', col: '#ede4cf', bleed: '#c4b89c', pat: PAT.blocks, ps: 0.7, orb: 'osam' };
    for (let i = 0; i < 8; i++) {
      box(1.4, 1.25, 2.1, -9.8 + i * 2.8, HILL_Y + 5.8, -68, O8);
    }
  });

  // Perched falcon ('sokol') atop the Sokolac parapet (3.5, HILL_Y + 6.7, -68)
  const falconG = new THREE.Group();
  falconG.position.set(3.5, HILL_Y + 6.45, -68);
  scene.add(falconG);
  dynMesh(ICO, 'sokol', '#5a626e', '#3a404a', falconG, 0, 0.34, 0, [0.22, 0.32, 0.24], 1.1);
  dynMesh(SPHERE, 'sokol', '#424852', '#282c33', falconG, 0, 0.72, 0.06, 0.14, 1.1);
  dynMesh(CONE4, 'sokol', '#e8b62c', '#b88b14', falconG, 0, 0.70, 0.24, [0.05, 0.16, 0.05], 1.0).rotation.x = Math.PI / 2;

  // Scenic Bihać Old Town houses (with timber windows & doors), lush orchard & forest backdrop trees, & strollers
  for (const [hx, hz, w, d, h] of [[36, 4, 6.6, 5.4, 3.1], [48, 12, 6.8, 5.6, 3.0], [44, 28, 6.4, 5.2, 2.9], [56, 26, 6.6, 5.4, 3.1]]) {
    box(w, 1.4, d, hx, TOWN_Y + 0.7, hz, { tag: 'town', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.7 });
    box(w + 0.4, h, d + 0.4, hx, TOWN_Y + 1.4 + h / 2, hz, { tag: 'town', col: LIME[0], bleed: LIME[1] });
    A(hipRoofGeo(w + 1.1, d + 1.1, 2.8), hx, TOWN_Y + 1.4 + h, hz, { tag: 'town', col: TILE[0], bleed: TILE[1], pat: PAT.roof });
    // Dark wooden windows & ground door on south & west walls
    box(0.95, 1.25, 0.18, hx - w * 0.24, TOWN_Y + 2.9, hz + d / 2 + 0.22, { tag: 'town', col: '#4a3525', solid: false });
    box(0.95, 1.25, 0.18, hx + w * 0.24, TOWN_Y + 2.9, hz + d / 2 + 0.22, { tag: 'town', col: '#4a3525', solid: false });
    box(0.18, 1.25, 0.95, hx - w / 2 - 0.22, TOWN_Y + 2.9, hz, { tag: 'town', col: '#4a3525', solid: false });
    box(0.9, 1.35, 0.18, hx, TOWN_Y + 0.7, hz + d / 2 + 0.08, { tag: 'town', col: '#3d2818', solid: false });
  }
  // Scenic spring trees enriching the orchard, campsite meadow, riverside park & National Park Una woodland ('hills' / 'riverbank')
  const scenicTrees = [
    // Krajina fruit orchard & camp backdrop (west bank)
    [-38, TOWN_Y, 54, 1.1, '#75b548', '#4f8c2a', 'riverbank'],
    [-46, TOWN_Y, 44, 1.2, '#69a84a', '#467d2c', 'riverbank'],
    [-36, TOWN_Y, 32, 1.0, '#d9e8c5', '#a9c78f', 'riverbank'],
    [-48, TOWN_Y, 22, 1.15, '#62a344', '#417828', 'riverbank'],
    [-40, TOWN_Y, 8, 1.1, '#6eb04d', '#49852f', 'riverbank'],
    [-46, TOWN_Y, -12, 1.2, '#5c9c3e', '#3d7324', 'riverbank'],
    [-20, TOWN_Y, 64, 1.05, '#7cb84e', '#528a2b', 'riverbank'],
    [-33, TOWN_Y, 63, 0.95, '#e8d9c5', '#c9b399', 'riverbank'],
    // East bank park & old town greenery
    [58, TOWN_Y, 5, 1.15, '#68ab48', '#447d2a', 'town'],
    [56, TOWN_Y, 42, 1.2, '#5da140', '#3d7526', 'town'],
    [28, TOWN_Y, 48, 1.05, '#6db04c', '#49852f', 'town'],
    [42, TOWN_Y, 50, 1.1, '#75b548', '#4f8c2a', 'town'],
    // National Park Una woodland backdrop (NW & NE forest terraces)
    [-58, FOREST_Y, -44, 1.25, '#4b8c3b', '#306324', 'hills'],
    [-54, FOREST_Y, -60, 1.3, '#448236', '#2b5920', 'hills'],
    [-34, FOREST_Y, -62, 1.2, '#539440', '#376b29', 'hills'],
    [-22, FOREST_Y, -54, 1.05, '#4d8f3c', '#326625', 'hills'],
    [44, FOREST_Y, -42, 1.2, '#4e913d', '#336626', 'hills'],
    [54, FOREST_Y, -54, 1.3, '#458537', '#2c5c22', 'hills'],
    [40, FOREST_Y, -62, 1.15, '#549642', '#386e2a', 'hills'],
    // Sokolac flanking hillside trees
    [-24, 19.2, -74, 1.0, '#4a8a3a', '#306124', 'hills'],
    [24, 19.2, -74, 1.0, '#4a8a3a', '#306124', 'hills'],
  ];
  for (const [tx, ty, tz, s, c1, c2, tg] of scenicTrees) {
    A(CYL, tx, ty + 2.0 * s, tz, { tag: tg, col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.28 * s, 4.0 * s, 0.28 * s]);
    A(ICO, tx, ty + 4.6 * s, tz, { tag: tg, col: c1, bleed: c2, hull: true, sway: 0.14 }, 0, 0, 0, [2.1 * s, 1.9 * s, 2.1 * s]);
  }
  // Scenic park benches & flowerbed planters in Una riverside park ('props')
  for (const [bx, bz] of [[25.5, 20], [25.5, 38]]) {
    box(2.2, 0.45, 0.65, bx, TOWN_Y + 0.23, bz, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] }, Math.PI / 2);
  }
  people.push({ kind: 'walk', x: 24, y: TOWN_Y + 0.04, z: 18, to: [24, 38], tag: 'passerby', woman: true });
  people.push({ kind: 'chat', x: 31, y: TOWN_Y + 0.04, z: 6, ry: 0.6, tag: 'passerby' });
  people.push({ kind: 'chat', x: 32.2, y: TOWN_Y + 0.04, z: 6.4, ry: -2.4, tag: 'passerby', woman: true });

  // ==================== 10. ALL 66 ORBS, GATES & HAND-TUNED CAMERAS ====================
  // Zone 1: Emerald Una River, Cascades, Island & Boat (10)
  orbs.push({
    id: 'smaragd', focus: V(0, 0.4, 6), size: 12.0, tags: ['smaragd'], shot: 'combo',
    at: V(0, 2.4, 14), stage: 0,
    swim: { p: [0, 0, 14], r: 10.0 },
    view: { from: [0, 8.5, 32], to: [0, 9.5, 22], look: [0, 0.5, 2] },
    wideView: { from: [-16, 18, 44], to: [16, 18, 44], look: [0, 0.5, 6], lookTo: [0, 0.5, -12] },
  });
  orb('ada', [0, 1.8, 6], 6.5, ['ada'], 'close', 4.8, {
    at: V(0, 3.2, 6), near: { p: [0, 1.2, 6], r: 6.5 },
    view: { from: [-10, 7.5, 16], to: [10, 7.5, 16], look: [0, 1.6, 6] },
  });
  orb('buk', [0, 0.8, -12], 12.0, ['buk'], 'close', 1.8, {
    at: V(0, 2.6, -12), swim: { p: [0, 0, -9], r: 8.0 },
    view: { from: [12, 6.0, -2], to: [-12, 6.0, -2], look: [0, 0.6, -12] },
  });
  orb('tok', [8.5, 0.3, 6], 4.5, ['tok'], 'close', 1.0, {
    at: V(8.5, 2.2, 6), swim: { p: [8.5, 0, 6], r: 6.5 },
    view: { from: [4.5, 4.5, 12.5], to: [12.0, 4.5, 12.5], look: [8.5, 0.2, 6] },
  });
  orb('ladja', [-7.5, 0.4, 12], 3.8, ['ladja'], 'close', 1.2, {
    at: V(-7.5, 2.4, 12), swim: { p: [-7.5, 0, 12], r: 6.5 },
    view: { from: [-2.0, 3.8, 17], to: [-12.0, 3.8, 17], look: [-7.5, 0.4, 12] },
  });
  orb('pramac', [-7.8, 0.55, 9.2], 1.8, ['pramac'], 'close', 1.2, {
    requires: ['ladja'], at: V(-7.8, 2.2, 9.2), swim: { p: [-7.8, 0, 9.2], r: 5.5 },
    view: { from: [-4.5, 2.5, 7.2], to: [-10.5, 2.5, 7.2], look: [-7.8, 0.55, 9.2] },
  });
  orb('krma', [-7.2, 0.45, 14.4], 1.8, ['krma'], 'close', 1.2, {
    requires: ['ladja'], at: V(-7.2, 2.2, 14.4), swim: { p: [-7.2, 0, 14.4], r: 5.5 },
    view: { from: [-4.2, 2.5, 16.8], to: [-10.2, 2.5, 16.8], look: [-7.2, 0.45, 14.4] },
  });
  orb('kormilo', [-7.1, 0.45, 15.0], 1.5, ['kormilo'], 'close', 1.2, {
    requires: ['krma'], at: V(-7.1, 2.2, 15.6), swim: { p: [-7.1, 0, 15.6], r: 5.5 },
    view: { from: [-4.4, 2.2, 17.5], to: [-9.8, 2.2, 17.5], look: [-7.1, 0.45, 15.0] },
  });
  orb('regata', [8.5, 0.4, 28], 3.8, ['regata'], 'close', 1.2, {
    at: V(8.5, 2.4, 28), swim: { p: [8.5, 0, 28], r: 6.5 },
    view: { from: [3.0, 4.0, 33], to: [12.0, 4.0, 33], look: [8.5, 0.4, 28] },
  });
  orb('prsluk', [8.6, 0.6, 28.2], 1.4, ['prsluk'], 'close', 1.2, {
    requires: ['regata'], at: V(8.6, 2.2, 29.8), swim: { p: [8.6, 0, 29.8], r: 5.5 },
    view: { from: [5.8, 2.5, 31.0], to: [11.2, 2.5, 31.0], look: [8.6, 0.6, 28.2] },
  });

  // Zone 2: Japodes Prehistoric Stilt Village & Pottery (10)
  orb('sojenica', [-13.0, TOWN_Y + 2.2, 1], 6.5, ['sojenica'], 'combo', TOWN_Y + 5.8, {
    at: V(-18.2, TOWN_Y + 2.4, 1), near: { p: [-18.2, TOWN_Y + 0.2, 1], r: 5.0 },
    view: { from: [-5, TOWN_Y + 4.8, 9], to: [-5, TOWN_Y + 4.8, -7], look: [-13.0, TOWN_Y + 2.2, 1] },
    wideView: { from: [-2, TOWN_Y + 10, 16], to: [-2, TOWN_Y + 10, -14], look: [-13.0, TOWN_Y + 2.4, 1], lookTo: [-13.0, TOWN_Y + 2.4, -4] },
  });
  orb('trstika', [-13.0, TOWN_Y + 4.2, -8], 5.0, ['trstika'], 'close', TOWN_Y + 5.8, {
    requires: ['sojenica'], at: V(-18.2, TOWN_Y + 2.4, -8), near: { p: [-18.2, TOWN_Y + 0.2, -8], r: 5.0 },
    view: { from: [-4, TOWN_Y + 6.5, -3], to: [-4, TOWN_Y + 6.5, -13], look: [-13.0, TOWN_Y + 4.2, -8] },
  });
  orb('stup', [-11.3, 2.0, 10], 4.0, ['stup'], 'close', TOWN_Y + 1.0, {
    requires: ['sojenica'], at: V(-8.8, 2.4, 10), swim: { p: [-8.8, 0, 10], r: 6.5 },
    view: { from: [-5.5, 2.8, 14.5], to: [-5.5, 2.8, 6.0], look: [-11.5, 2.0, 10] },
  });
  orb('ognjiste', [-28, TOWN_Y + 0.4, 6], 2.4, ['ognjiste'], 'close', TOWN_Y + 1.2, {
    near: { p: [-28, TOWN_Y + 0.2, 8.2], r: 3.8 },
    view: { from: [-25.0, TOWN_Y + 2.4, 9.2], to: [-31.0, TOWN_Y + 2.4, 9.2], look: [-28, TOWN_Y + 0.4, 6] },
  });
  orb('pepeo', [-28, TOWN_Y + 0.25, 6], 1.6, ['pepeo'], 'close', TOWN_Y + 1.0, {
    requires: ['ognjiste'], near: { p: [-28, TOWN_Y + 0.2, 8.2], r: 3.8 },
    view: { from: [-26.0, TOWN_Y + 2.1, 8.4], to: [-30.0, TOWN_Y + 2.1, 8.4], look: [-28, TOWN_Y + 0.25, 6] },
  });
  orb('lonac', [-28, TOWN_Y + 0.55, 6], 1.5, ['lonac'], 'close', TOWN_Y + 1.3, {
    requires: ['ognjiste'], near: { p: [-28, TOWN_Y + 0.2, 8.2], r: 3.8 },
    view: { from: [-25.8, TOWN_Y + 2.0, 8.2], to: [-30.2, TOWN_Y + 2.0, 8.2], look: [-28, TOWN_Y + 0.55, 6] },
  });
  orb('grncar', [-27.5, TOWN_Y + 1.0, -1.8], 1.8, ['grncar'], 'close', TOWN_Y + 2.2, {
    near: { p: [-27.5, TOWN_Y + 0.2, 0.2], r: 3.8 },
    view: { from: [-24.5, TOWN_Y + 2.3, 1.2], to: [-30.5, TOWN_Y + 2.3, 1.2], look: [-27.5, TOWN_Y + 1.0, -1.8] },
  });
  orb('glina', [-28.6, TOWN_Y + 1.0, -3.2], 1.3, ['glina'], 'close', TOWN_Y + 1.6, {
    near: { p: [-28.6, TOWN_Y + 0.2, -5.2], r: 3.8 },
    view: { from: [-27.0, TOWN_Y + 2.0, -5.8], to: [-30.2, TOWN_Y + 2.0, -5.8], look: [-28.6, TOWN_Y + 1.0, -3.2] },
  });
  orb('cup', [-27.5, TOWN_Y + 1.15, -3.2], 1.3, ['cup'], 'close', TOWN_Y + 1.7, {
    requires: ['grncar'], near: { p: [-27.5, TOWN_Y + 0.2, -5.2], r: 3.8 },
    view: { from: [-26.0, TOWN_Y + 2.0, -5.8], to: [-29.0, TOWN_Y + 2.0, -5.8], look: [-27.5, TOWN_Y + 1.15, -3.2] },
  });
  orb('zdjela', [-26.4, TOWN_Y + 1.05, -3.2], 1.3, ['zdjela'], 'close', TOWN_Y + 1.6, {
    requires: ['grncar'], near: { p: [-26.4, TOWN_Y + 0.2, -5.2], r: 3.8 },
    view: { from: [-24.8, TOWN_Y + 2.0, -5.8], to: [-28.0, TOWN_Y + 2.0, -5.8], look: [-26.4, TOWN_Y + 1.05, -3.2] },
  });

  // Zone 3: Kapetanova kula & Fethija Gothic Mosque (11)
  orb('strazar', [22.4, TOWN_Y + 1.1, -5.2], 1.8, ['strazar'], 'close', TOWN_Y + 2.2, {
    near: { p: [20.2, TOWN_Y + 0.2, -5.2], r: 3.8 },
    view: { from: [18.5, TOWN_Y + 2.4, -2.5], to: [18.5, TOWN_Y + 2.4, -8.0], look: [22.4, TOWN_Y + 1.1, -5.2] },
  });
  orb('tamnica', [23.8, TOWN_Y + 1.4, -8.0], 2.6, ['tamnica'], 'close', TOWN_Y + 2.8, {
    near: { p: [20.5, TOWN_Y + 0.2, -8.0], r: 4.2 },
    view: { from: [18.0, TOWN_Y + 2.8, -5.0], to: [18.0, TOWN_Y + 2.8, -11.0], look: [23.8, TOWN_Y + 1.4, -8.0] },
  });
  orb('pukotina', [26.4, TOWN_Y + 4.0, -3.85], 2.6, ['pukotina'], 'close', TOWN_Y + 5.2, {
    at: V(26.4, TOWN_Y + 2.4, -1.2), near: { p: [26.4, TOWN_Y + 0.2, -1.2], r: 4.5 },
    view: { from: [23.8, TOWN_Y + 4.4, 1.8], to: [29.0, TOWN_Y + 4.4, 1.8], look: [26.4, TOWN_Y + 4.0, -3.85] },
  });
  orb('reljef', [29.6, TOWN_Y + 2.4, -3.84], 2.2, ['reljef'], 'close', TOWN_Y + 3.4, {
    at: V(29.6, TOWN_Y + 2.4, -1.2), near: { p: [29.6, TOWN_Y + 0.2, -1.2], r: 4.5 },
    view: { from: [27.2, TOWN_Y + 2.8, 1.2], to: [32.0, TOWN_Y + 2.8, 1.2], look: [29.6, TOWN_Y + 2.4, -3.84] },
  });
  orb('oklop', [22.6, TOWN_Y + 1.1, -10.8], 1.8, ['oklop'], 'close', TOWN_Y + 2.2, {
    near: { p: [20.0, TOWN_Y + 0.2, -10.8], r: 3.8 },
    view: { from: [18.8, TOWN_Y + 2.2, -9.0], to: [18.8, TOWN_Y + 2.2, -12.6], look: [22.6, TOWN_Y + 1.1, -10.8] },
  });
  orb('stit', [22.8, TOWN_Y + 1.1, -12.6], 1.5, ['stit'], 'close', TOWN_Y + 2.0, {
    near: { p: [20.0, TOWN_Y + 0.2, -12.6], r: 3.8 },
    view: { from: [19.0, TOWN_Y + 2.0, -11.0], to: [19.0, TOWN_Y + 2.0, -14.2], look: [22.8, TOWN_Y + 1.1, -12.6] },
  });
  orb('mac', [22.8, TOWN_Y + 1.15, -13.6], 1.5, ['mac'], 'close', TOWN_Y + 2.0, {
    requires: ['stit'], near: { p: [20.0, TOWN_Y + 0.2, -13.6], r: 3.8 },
    view: { from: [19.0, TOWN_Y + 2.0, -12.0], to: [19.0, TOWN_Y + 2.0, -15.2], look: [22.8, TOWN_Y + 1.15, -13.6] },
  });
  orb('gotika', [46.0, TOWN_Y + 3.6, -6.4], 5.5, ['gotika'], 'close', TOWN_Y + 5.8, {
    at: V(46.0, TOWN_Y + 2.4, -2.5), near: { p: [46.0, TOWN_Y + 0.2, -2.5], r: 5.0 },
    view: { from: [40.5, TOWN_Y + 5.0, 2.5], to: [51.5, TOWN_Y + 5.0, 2.5], look: [46.0, TOWN_Y + 3.8, -6.4] },
  });
  orb('vitraj', [46.0, TOWN_Y + 3.1, -6.38], 4.5, ['vitraj'], 'close', TOWN_Y + 4.8, {
    requires: ['gotika'], at: V(43.2, TOWN_Y + 2.4, -2.5), near: { p: [43.2, TOWN_Y + 0.2, -2.5], r: 4.8 },
    view: { from: [41.5, TOWN_Y + 3.8, 0.5], to: [50.5, TOWN_Y + 3.8, 0.5], look: [46.0, TOWN_Y + 3.1, -6.38] },
  });
  orb('rozeta', [46.0, TOWN_Y + 6.75, -6.38], 2.8, ['rozeta'], 'close', TOWN_Y + 7.5, {
    requires: ['gotika'], at: V(46.0, TOWN_Y + 6.8, -2.5), near: { p: [46.0, TOWN_Y + 0.2, -2.5], r: 7.5 },
    view: { from: [42.0, TOWN_Y + 7.1, 1.0], to: [50.0, TOWN_Y + 7.1, 1.0], look: [46.0, TOWN_Y + 6.75, -6.38] },
  });
  orb('svijecnjak', [46.0, TOWN_Y + 1.1, -4.6], 1.6, ['svijecnjak'], 'close', TOWN_Y + 2.0, {
    near: { p: [46.0, TOWN_Y + 0.2, -2.6], r: 3.8 },
    view: { from: [43.8, TOWN_Y + 2.0, -1.8], to: [48.2, TOWN_Y + 2.0, -1.8], look: [46.0, TOWN_Y + 1.1, -4.6] },
  });

  // Zone 4: Una Riverside Park, Art & Krajina Music (10)
  orb('drvored', [21.5, TOWN_Y + 4.2, 29], 12.0, ['drvored'], 'combo', TOWN_Y + 7.2, {
    at: V(25.5, TOWN_Y + 2.4, 29), near: { p: [25.5, TOWN_Y + 0.2, 29], r: 5.0 },
    view: { from: [12, TOWN_Y + 7.5, 48], to: [12, TOWN_Y + 7.5, 10], look: [21.5, TOWN_Y + 4.0, 29] },
    wideView: { from: [8, TOWN_Y + 14, 54], to: [8, TOWN_Y + 14, 6], look: [21.5, TOWN_Y + 4.0, 28], lookTo: [21.5, TOWN_Y + 4.0, 24] },
  });
  orb('skulptura', [30, TOWN_Y + 2.0, 16], 2.4, ['skulptura'], 'close', TOWN_Y + 3.4, {
    near: { p: [30, TOWN_Y + 0.2, 18.8], r: 4.0 },
    view: { from: [26.8, TOWN_Y + 3.0, 20.5], to: [33.2, TOWN_Y + 3.0, 20.5], look: [30, TOWN_Y + 2.0, 16] },
  });
  orb('platno', [29, TOWN_Y + 1.48, 26.18], 1.6, ['platno'], 'close', TOWN_Y + 2.2, {
    near: { p: [29, TOWN_Y + 0.2, 28.4], r: 3.8 },
    view: { from: [27.2, TOWN_Y + 2.0, 29.0], to: [30.8, TOWN_Y + 2.0, 29.0], look: [29, TOWN_Y + 1.48, 26.18] },
  });
  orb('okvir', [29, TOWN_Y + 1.48, 26.15], 1.8, ['okvir'], 'close', TOWN_Y + 2.4, {
    requires: ['platno'], near: { p: [29, TOWN_Y + 0.2, 28.4], r: 3.8 },
    view: { from: [27.0, TOWN_Y + 2.1, 29.2], to: [31.0, TOWN_Y + 2.1, 29.2], look: [29, TOWN_Y + 1.48, 26.15] },
  });
  orb('muzicar', [34.4, TOWN_Y + 1.0, 26.0], 1.8, ['muzicar'], 'close', TOWN_Y + 2.2, {
    near: { p: [32.2, TOWN_Y + 0.2, 26.0], r: 3.8 },
    view: { from: [31.2, TOWN_Y + 2.2, 29.0], to: [31.2, TOWN_Y + 2.2, 23.0], look: [34.4, TOWN_Y + 1.0, 26.0] },
  });
  orb('harmonika', [34.1, TOWN_Y + 1.05, 26.0], 1.3, ['harmonika'], 'close', TOWN_Y + 1.9, {
    requires: ['muzicar'], near: { p: [32.2, TOWN_Y + 0.2, 26.0], r: 3.8 },
    view: { from: [31.6, TOWN_Y + 1.8, 28.0], to: [31.6, TOWN_Y + 1.8, 24.0], look: [34.1, TOWN_Y + 1.05, 26.0] },
  });
  orb('saz', [35.4, TOWN_Y + 1.1, 26.0], 1.5, ['saz'], 'close', TOWN_Y + 2.1, {
    near: { p: [35.4, TOWN_Y + 0.2, 28.2], r: 3.8 },
    view: { from: [33.4, TOWN_Y + 2.0, 28.8], to: [37.4, TOWN_Y + 2.0, 28.8], look: [35.4, TOWN_Y + 1.1, 26.0] },
  });
  orb('frula', [36.1, TOWN_Y + 0.6, 26.0], 1.2, ['frula'], 'close', TOWN_Y + 1.3, {
    near: { p: [36.1, TOWN_Y + 0.2, 28.2], r: 3.6 },
    view: { from: [34.6, TOWN_Y + 1.6, 28.2], to: [37.6, TOWN_Y + 1.6, 28.2], look: [36.1, TOWN_Y + 0.6, 26.0] },
  });
  orb('tezga', [34, TOWN_Y + 1.4, 36], 3.8, ['tezga'], 'close', TOWN_Y + 3.0, {
    near: { p: [34, TOWN_Y + 0.2, 39.0], r: 4.2 },
    view: { from: [29.5, TOWN_Y + 3.2, 41.0], to: [38.5, TOWN_Y + 3.2, 41.0], look: [34, TOWN_Y + 1.4, 36] },
  });
  orb('suvenir', [34, TOWN_Y + 1.15, 36], 2.0, ['suvenir'], 'close', TOWN_Y + 1.8, {
    requires: ['tezga'], near: { p: [34, TOWN_Y + 0.2, 38.5], r: 4.0 },
    view: { from: [31.8, TOWN_Y + 2.0, 38.8], to: [36.2, TOWN_Y + 2.0, 38.8], look: [34, TOWN_Y + 1.15, 36] },
  });

  // Zone 5: Krajina Orchard & Una River Camp (9)
  orb('kamp', [-30, TOWN_Y + 1.2, 44], 5.5, ['kamp'], 'close', TOWN_Y + 2.8, {
    at: V(-26, TOWN_Y + 2.4, 47.5), near: { p: [-26, TOWN_Y + 0.2, 47.5], r: 5.0 },
    view: { from: [-22, TOWN_Y + 4.2, 51], to: [-36, TOWN_Y + 4.2, 51], look: [-30, TOWN_Y + 1.2, 44] },
  });
  orb('jorgan', [-30.2, TOWN_Y + 0.35, 46.2], 1.6, ['jorgan'], 'close', TOWN_Y + 1.1, {
    near: { p: [-30.2, TOWN_Y + 0.2, 48.2], r: 3.6 },
    view: { from: [-28.0, TOWN_Y + 1.9, 49.0], to: [-32.4, TOWN_Y + 1.9, 49.0], look: [-30.2, TOWN_Y + 0.35, 46.2] },
  });
  orb('svjetiljka', [-28.2, TOWN_Y + 1.1, 43.8], 1.2, ['svjetiljka'], 'close', TOWN_Y + 1.7, {
    near: { p: [-28.2, TOWN_Y + 0.2, 41.8], r: 3.6 },
    view: { from: [-26.6, TOWN_Y + 1.9, 41.4], to: [-29.8, TOWN_Y + 1.9, 41.4], look: [-28.2, TOWN_Y + 1.1, 43.8] },
  });
  orb('karta', [-27.4, TOWN_Y + 0.88, 44.0], 1.3, ['karta'], 'close', TOWN_Y + 1.5, {
    near: { p: [-27.4, TOWN_Y + 0.2, 46.0], r: 3.6 },
    view: { from: [-25.8, TOWN_Y + 2.0, 46.2], to: [-29.0, TOWN_Y + 2.0, 46.2], look: [-27.4, TOWN_Y + 0.88, 44.0] },
  });
  orb('kompas', [-27.1, TOWN_Y + 0.90, 44.1], 1.1, ['kompas'], 'close', TOWN_Y + 1.5, {
    requires: ['karta'], near: { p: [-27.1, TOWN_Y + 0.2, 46.0], r: 3.6 },
    view: { from: [-25.8, TOWN_Y + 1.9, 46.0], to: [-28.4, TOWN_Y + 1.9, 46.0], look: [-27.1, TOWN_Y + 0.90, 44.1] },
  });
  orb('cuturica', [-26.6, TOWN_Y + 1.0, 43.8], 1.2, ['cuturica'], 'close', TOWN_Y + 1.6, {
    near: { p: [-25.2, TOWN_Y + 0.2, 43.8], r: 3.6 },
    view: { from: [-24.6, TOWN_Y + 1.9, 45.6], to: [-24.6, TOWN_Y + 1.9, 42.0], look: [-26.6, TOWN_Y + 1.0, 43.8] },
  });
  orb('kruska', [-28.5, TOWN_Y + 0.55, 56], 1.4, ['kruska'], 'close', TOWN_Y + 1.2, {
    near: { p: [-28.5, TOWN_Y + 0.2, 58.0], r: 3.6 },
    view: { from: [-26.8, TOWN_Y + 1.9, 58.6], to: [-30.2, TOWN_Y + 1.9, 58.6], look: [-28.5, TOWN_Y + 0.55, 56] },
  });
  orb('breskva', [-26.0, TOWN_Y + 0.55, 56], 1.4, ['breskva'], 'close', TOWN_Y + 1.2, {
    near: { p: [-26.0, TOWN_Y + 0.2, 58.0], r: 3.6 },
    view: { from: [-24.3, TOWN_Y + 1.9, 58.6], to: [-27.7, TOWN_Y + 1.9, 58.6], look: [-26.0, TOWN_Y + 0.55, 56] },
  });
  orb('ljesnjak', [-23.5, TOWN_Y + 0.55, 56], 1.4, ['ljesnjak'], 'close', TOWN_Y + 1.2, {
    near: { p: [-23.5, TOWN_Y + 0.2, 58.0], r: 3.6 },
    view: { from: [-21.8, TOWN_Y + 1.9, 58.6], to: [-25.2, TOWN_Y + 1.9, 58.6], look: [-23.5, TOWN_Y + 0.55, 56] },
  });

  // Zone 6: National Park Una Wildlife & Forest (11)
  orb('jasen', [-30, FOREST_Y + 4.5, -44], 6.0, ['jasen'], 'combo', FOREST_Y + 8.6, {
    at: V(-30, FOREST_Y + 2.4, -39.5), near: { p: [-30, FOREST_Y + 0.2, -39.5], r: 4.8 },
    view: { from: [-22, FOREST_Y + 6.5, -36], to: [-38, FOREST_Y + 6.5, -36], look: [-30, FOREST_Y + 4.5, -44] },
    wideView: { from: [-18, FOREST_Y + 12, -32], to: [-48, FOREST_Y + 12, -36], look: [-34, FOREST_Y + 4.5, -46], lookTo: [-40, FOREST_Y + 4.5, -50] },
  });
  orb('paprat', [-24, FOREST_Y + 0.4, -42], 2.2, ['paprat'], 'close', FOREST_Y + 1.0, {
    near: { p: [-24, FOREST_Y + 0.2, -39.8], r: 3.8 },
    view: { from: [-21.2, FOREST_Y + 2.0, -39.0], to: [-26.8, FOREST_Y + 2.0, -39.0], look: [-24, FOREST_Y + 0.4, -42] },
  });
  orb('mahovina', [-36.2, FOREST_Y + 0.4, -40], 2.6, ['mahovina'], 'close', FOREST_Y + 1.1, {
    near: { p: [-36.2, FOREST_Y + 0.2, -37.6], r: 3.8 },
    view: { from: [-33.0, FOREST_Y + 2.2, -37.0], to: [-39.4, FOREST_Y + 2.2, -37.0], look: [-36.2, FOREST_Y + 0.4, -40] },
  });
  orb('medvjed', [-46, FOREST_Y + 1.1, -46], 2.6, ['medvjed'], 'close', FOREST_Y + 2.2, {
    near: { p: [-46, FOREST_Y + 0.2, -42.5], r: 4.2 },
    view: { from: [-42, FOREST_Y + 2.8, -41.0], to: [-50, FOREST_Y + 2.8, -41.0], look: [-46, FOREST_Y + 1.1, -46] },
  });
  orb('jazavac', [-32, FOREST_Y + 0.45, -50], 1.6, ['jazavac'], 'close', FOREST_Y + 1.1, {
    near: { p: [-32, FOREST_Y + 0.2, -47.8], r: 3.6 },
    view: { from: [-29.6, FOREST_Y + 1.8, -47.0], to: [-34.4, FOREST_Y + 1.8, -47.0], look: [-32, FOREST_Y + 0.45, -50] },
  });
  orb('puz', [-26, FOREST_Y + 0.25, -38], 1.2, ['puz'], 'close', FOREST_Y + 0.8, {
    near: { p: [-26, FOREST_Y + 0.2, -36.2], r: 3.4 },
    view: { from: [-24.4, FOREST_Y + 1.5, -36.0], to: [-27.6, FOREST_Y + 1.5, -36.0], look: [-26, FOREST_Y + 0.25, -38] },
  });
  orb('dabar', [-16.2, TOWN_Y + 0.4, -24], 1.6, ['dabar'], 'close', TOWN_Y + 1.1, {
    near: { p: [-18.2, TOWN_Y + 0.2, -24], r: 3.6 },
    view: { from: [-19.4, TOWN_Y + 1.8, -21.5], to: [-19.4, TOWN_Y + 1.8, -26.5], look: [-16.2, TOWN_Y + 0.4, -24] },
  });
  orb('kornjaca', [16.5, TOWN_Y + 0.25, 6], 1.4, ['kornjaca'], 'close', TOWN_Y + 0.9, {
    near: { p: [18.5, TOWN_Y + 0.2, 6], r: 3.6 },
    view: { from: [19.4, TOWN_Y + 1.6, 8.2], to: [19.4, TOWN_Y + 1.6, 3.8], look: [16.5, TOWN_Y + 0.25, 6] },
  });
  orb('orao', [26, FOREST_Y + 2.6, -44], 2.2, ['orao'], 'close', FOREST_Y + 3.5, {
    near: { p: [26, FOREST_Y + 0.2, -40.5], r: 4.5 },
    view: { from: [22.5, FOREST_Y + 3.8, -39.5], to: [29.5, FOREST_Y + 3.8, -39.5], look: [26, FOREST_Y + 2.6, -44] },
  });
  orb('vodomar', [-13.5, 3.3, -30.0], 1.4, ['vodomar'], 'close', 4.0, {
    at: V(-10.5, 3.2, -30.0), swim: { p: [-10.5, 0, -30.0], r: 6.0 },
    view: { from: [-9.5, 4.2, -27.5], to: [-9.5, 4.2, -32.5], look: [-13.5, 3.3, -30.0] },
  });
  orb('vilin', [-9.0, 1.5, -21.0], 2.6, ['vilin'], 'close', 2.4, {
    at: V(-9.0, 2.4, -21.0), swim: { p: [-9.0, 0, -21.0], r: 6.5 },
    view: { from: [-4.5, 3.2, -17.5], to: [-12.5, 3.2, -17.5], look: [-9.0, 1.5, -21.0] },
  });

  // Zone 7: Stari Grad Sokolac Watchtower (5 words, Stage 2!)
  orb('stepeniste', [11.5, 19.0, -61.5], 8.5, ['stepeniste'], 'close', 20.5, {
    at: V(14.5, 17.5, -58.0), near: { p: [14.5, 14.5, -58.0], r: 5.5 },
    view: { from: [22, 23, -46], to: [12, 26, -48], look: [11.5, 19.0, -61.5] },
  });
  orb('osam', [0, HILL_Y + 5.8, -68], 12.0, ['osam'], 'close', HILL_Y + 7.2, {
    at: V(0, HILL_Y + 8.0, -68), near: { p: [0, HILL_Y + 5.2, -68], r: 6.5 },
    view: { from: [14, HILL_Y + 9.5, -54], to: [-14, HILL_Y + 9.5, -54], look: [0, HILL_Y + 5.8, -68] },
  });
  orb('horizont', [0, 32, -155], 44.0, ['horizont'], 'combo', 32, {
    sky: false, at: V(-5, HILL_Y + 2.4, -71), near: { p: [-5, HILL_Y + 0.2, -71], r: 5.0 },
    view: { from: [-6, HILL_Y + 12, -62], to: [6, HILL_Y + 12, -62], look: [0, 30, -150] },
    wideView: { from: [-34, HILL_Y + 24, -44], to: [34, HILL_Y + 24, -44], look: [0, 32, -150], lookTo: [0, 32, -150] },
  });
  orb('sokol', [3.5, HILL_Y + 6.9, -68], 1.6, ['sokol'], 'close', HILL_Y + 7.8, {
    at: V(3.5, HILL_Y + 8.2, -68), near: { p: [3.5, HILL_Y + 6.2, -68], r: 5.0 },
    view: { from: [1.0, HILL_Y + 7.8, -64.5], to: [6.0, HILL_Y + 7.8, -64.5], look: [3.5, HILL_Y + 6.9, -68] },
  });
  // Stage 2 (LAST WORD): 'osmatracnica' on Stari Grad Sokolac
  orb('osmatracnica', [0, HILL_Y + 7.0, -78], 16.0, ['osmatracnica'], 'combo', HILL_Y + 1.0, {
    stage: 2, at: V(0, HILL_Y + 2.6, -73), near: { p: [0, HILL_Y + 0.2, -73], r: 6.5 },
    view: { from: [24, HILL_Y + 14, -48], to: [-24, HILL_Y + 14, -48], look: [0, HILL_Y + 7.0, -78] },
    wideView: { from: [32, HILL_Y + 22, -38], to: [-32, HILL_Y + 22, -38], look: [0, HILL_Y + 7.0, -78], lookTo: [0, HILL_Y + 7.0, -78] },
  });

  // Paint sources for all 66 orb tags + sky/sun
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
    start: V(0, TOWN_Y + 1.28, 18.2),
    fleur: V(0, HILL_Y + 18.0, -78),
    sunPos,
    movers: [],
    // Bihać-specific animated handles
    ladja: { g: ladjaG, home: V(-7.5, 0.16, 12.0) },
    regata: { g: regataG, home: V(8.5, 0.18, 28.0) },
    dragonflies,
    kingfisher: { g: kfG, home: V(-13.5, 3.2, -30.0), ry: Math.PI / 2 },
    falcon: { g: falconG, ry: 0 },
    sprayEmitters,
  };
}
