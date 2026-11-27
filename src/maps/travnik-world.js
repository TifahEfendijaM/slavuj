// Travnik (summer): 3D storybook world built to Mostar/Sarajevo/Jajce standards.
// North is -z (Stari Grad Travnik & Mount Vlašić), South is +z (Lašva River valley), Plava voda spring at (0, 0).
import * as THREE from 'three';
import { Builder, PAT, tag, rng, shared, paintGeo, washMat, addHull } from '../paper.js';
import S from '../settings.js';

export const TOWN_Y = 4.0;
export const PLAVA_WATER_Y = 1.6;
export const FOOTHILL_Y = 14.0;
export const FORT_Y = 26.0;
export const SUN_TRAVNIK = new THREE.Vector3(-0.55, 0.66, 0.51).normalize();

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

export function travnikGroundY(x, z) {
  // Lašva River flowing west-to-east at z = 48..66
  if (z >= 48 && z <= 66) return 0;
  // Plava voda stream channel running north-to-south at x = -6..6, z = -12..48
  if (x >= -6 && x <= 6 && z >= -12 && z <= 48) return PLAVA_WATER_Y;
  // Stari Grad Travnik rocky crag directly north of Plava voda (centred at (0, -48))
  if (Math.hypot(x / 20, (z + 48) / 18) < 1.05) return FORT_Y;
  // Vlašić foothills terrace on NW and NE (z < -20, |x| > 22)
  if (z < -20 && z >= -74 && Math.abs(x) >= 22) return FOOTHILL_Y;
  // Higher Mount Vlašić slope further north
  if (z < -74) return FOOTHILL_Y + Math.min(48, (-74 - z) * 0.65);
  return TOWN_Y;
}

export function buildTravnikWorld(scene) {
  const b = new Builder(), R = rng(521);
  const rr = (lo, hi) => lo + R() * (hi - lo);
  const A = (geo, x, y, z, o, ry = 0, rx = 0, rz = 0, s = 1) => b.add(geo, mat4(x, y, z, ry, rx, rz, s), o);
  const box = (w, h, d, x, y, z, o, ry = 0, rx = 0, rz = 0) => A(BOX, x, y, z, o, ry, rx, rz, [w, h, d]);
  const slab = (x0, x1, z0, z1, o, y = TOWN_Y + 0.04, h = 0.08) => box(x1 - x0, h, z1 - z0, (x0 + x1) / 2, y, (z0 + z1) / 2, o);

  // Warm, crisp highland summer light for Travnik
  shared.uSunDir.value.copy(SUN_TRAVNIK);
  shared.uWaterDir.value.set(0, 1); // Plava voda flows south (+z)
  shared.uSunShadow.value.set(0.54, 0.62, 0.78);
  shared.uSunGlow.value.set(1.0, 0.90, 0.62);
  shared.uSunTint.value.set(1.06, 1.02, 0.93);
  shared.uSkyGlow.value.set(0.82, 0.94, 1.0);

  const orbs = [], clouds = [], people = [], animals = [], smoke = [], moteEmitters = [];
  const trouts = [], clockHands = [], farmBirds = [];

  const orb = (id, focus, size, tags, shot, top, extra = {}) => orbs.push({
    id, focus: V(...focus), size, tags, shot,
    at: V(focus[0], top + S.orb.hoverHeight, focus[2]), stage: 1, ...extra,
  });

  // Palettes
  const LIME = ['#f5f0e4', '#e5decb'];
  const TILE = ['#b85834', '#924022'];
  const SHINGLE = ['#544d46', '#3d3732'];
  const WOOD_D = ['#593c26', '#402918'];
  const WOOD_W = ['#94693e', '#704d2a'];
  const STONE_W = ['#d8ceb8', '#b5a990'];
  const STONE_G = ['#bab5aa', '#969186'];
  const GRASS = ['#6ba34a', '#4f8234'];
  const GRASS_H = ['#5c9442', '#42732d'];

  // ==================== 1. SKY, SUN & SUMMER CLOUDS ====================
  tag('sky').side = THREE.BackSide; tag('sky').mode = 'one'; tag('sky').radius = 1300; tag('sky').dur = 6;
  tag('sun').mode = 'one'; tag('sun').radius = 65; tag('sun').dur = 2.5;
  A(new THREE.SphereGeometry(720, 32, 20), 0, 0, 0, { tag: 'sky', col: '#9cd2f2', bleed: '#549cd8', pat: PAT.sky, hatch: 0, ink: false, solid: false });
  const sunPos = SUN_TRAVNIK.clone().multiplyScalar(520);
  const sunM = new THREE.Matrix4().lookAt(sunPos, V(0, 20, 0), V(0, 1, 0)).setPosition(sunPos);
  b.add(new THREE.CircleGeometry(29, 36).rotateY(Math.PI), sunM, { tag: 'sun', col: '#ffef8c', bleed: '#ffcb42', hatch: 0, ink: false, solid: false });
  {
    const g = new THREE.Group(); g.position.copy(sunPos); g.lookAt(0, 20, 0);
    const inkM = new THREE.MeshBasicMaterial({ color: S.ink.color, side: THREE.DoubleSide });
    for (const r0 of [29, 30]) { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r0 + 0.7, 48), inkM); m.position.z = -0.5; g.add(m); }
    scene.add(g);
  }
  for (const [x, y, z, s] of [[-155, 80, -135, 8], [135, 82, -145, 9], [165, 72, 75, 7], [-165, 70, 88, 8], [-10, 86, -205, 9], [45, 78, 195, 8]]) {
    clouds.push({ c: V(x, y, z), r: 4.0 * s });
    const dr = -rr(14, 34);
    b.object(() => {
      for (const [ox, oy, oz, r] of [[-2.0, 0, 0, 1.4], [-0.5, 0.5, 0.2, 1.9], [1.0, 0.45, -0.2, 2.0], [2.3, 0, 0, 1.4], [0.2, -0.2, 0.5, 1.7]])
        A(ICO, x + ox * s, y + oy * s, z + oz * s, { tag: 'hills', col: '#ffffff', bleed: '#e4eef5', hull: true, hatch: 0.3, solid: false, sway: dr }, 0, 0, 0, [r * s, 0.58 * r * s, r * s]);
    });
  }

  for (const t of ['plava', 'bistra', 'zidine', 'sarena', 'terasa', 'sljunak', 'tor']) {
    tag(t).mode = 'one'; tag(t).radius = 110; tag(t).holdRest = 2.4;
  }
  for (const t of ['suncobran', 'stub', 'freska', 'sest', 'hrast', 'breza', 'stado', 'kupina', 'gljiva']) {
    tag(t).waveDelay = 2.2;
  }

  // ==================== 2. GROUND, LAŠVA RIVER, PLAVA VODA CHANNEL & MOUNT VLAŠIĆ ====================
  const VALLEY_M = { tag: 'valley', col: GRASS[0], bleed: GRASS[1], pat: PAT.grass };
  const TOWN_G = { tag: 'town', col: '#d1cbc0', bleed: '#b2aba0', pat: PAT.cobble, ps: 0.65 };
  const HILL_M = { tag: 'hills', col: GRASS_H[0], bleed: GRASS_H[1], pat: PAT.grass };
  const EMB_M = { tag: 'valley', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.65 };

  // North town platform: West of Plava voda (x = -115..-6, z = -22..48) & East of Plava voda (x = 6..115, z = -22..48)
  box(110, 6, 70, -61, TOWN_Y - 3, 13, TOWN_G);
  box(110, 6, 70, 61, TOWN_Y - 3, 13, TOWN_G);
  // South bank Lašva meadow & farmstead (x = -115..115, z = 66..118)
  box(230, 6, 52, 0, TOWN_Y - 3, 92, VALLEY_M);

  // Lašva River bed & emerald water (z = 48..66, y = 0)
  box(260, 2, 22, 0, -1.6, 57, { tag: 'valley', col: '#58786a', bleed: '#3e5c50', ink: false });
  box(260, 0.1, 18.6, 0, -0.05, 57, { tag: 'valley', col: '#459e8a', bleed: '#2f7d6c', pat: PAT.water, hatch: 0, water: true, ink: false });
  // Lašva stone embankments (z = 48 & z = 66)
  box(110, 4.5, 1.4, -61, 1.85, 48.0, EMB_M);
  box(110, 4.5, 1.4, 61, 1.85, 48.0, EMB_M);
  box(230, 4.5, 1.4, 0, 1.85, 66.0, EMB_M);

  // Stone bridge over Lašva River at x = 0 connecting Plava voda / town to south bank farmstead
  b.object(() => {
    const BR = { tag: 'town', col: STONE_W[0], bleed: STONE_W[1], pat: PAT.blocks, ps: 0.65 };
    box(6.0, 0.6, 20.0, 0, TOWN_Y + 0.35, 57, BR);
    for (const sx of [-2.8, 2.8]) box(0.35, 0.9, 19.8, sx, TOWN_Y + 0.95, 57, { ...BR, wall: true });
    for (const pz of [52, 62]) box(6.2, 4.2, 1.4, 0, 2.0, pz, BR);
  });

  // Plava voda stone channel (x = -6..6, z = -12..48)
  box(14, 2.6, 62, 0, 0.2, 18, { tag: 'valley', col: '#698a8c', bleed: '#4c6d70', ink: false });
  box(1.2, 3.2, 60, -6.2, 2.5, 18, EMB_M);
  box(1.2, 3.2, 60, 6.2, 2.5, 18, EMB_M);

  // NW & NE Vlašić foothill terraces (y = FOOTHILL_Y = 14.0, z = -74..-22, x = -92..-22 and x = 22..92)
  box(70, 14, 52, -57, FOOTHILL_Y - 7, -48, HILL_M);
  box(70, 14, 52, 57, FOOTHILL_Y - 7, -48, HILL_M);
  // Retaining stone wall along z = -22
  box(70, 10.2, 1.4, -57, 9.0, -22.2, EMB_M);
  box(70, 10.2, 1.4, 57, 9.0, -22.2, EMB_M);

  // Stari Grad Travnik rocky limestone crag directly north of Plava voda (top y = FORT_Y = 26.0, centred at (0, -48))
  A(CYL16, 0, 13.0, -48, { tag: 'hills', col: '#9e9b8e', bleed: '#7a776c', pat: PAT.blocks, ps: 0.45 }, 0, 0, 0, [23, 26, 20]);
  A(CYL16, 0, 25.6, -48, { tag: 'hills', col: GRASS[0], bleed: GRASS[1], pat: PAT.grass }, 0, 0, 0, [19.5, 0.8, 16.5]);

  // Iconic arched stone viaduct ramp connecting north-east foothill (y=14) up to Stari Grad fortress gate (y=26)
  for (let i = 0; i < 6; i++) {
    box(3.4, 1.0, 2.8, 18.5 + i * 1.6, 24.5 - i * 1.8, -42 + i * 2.2, { tag: 'town', col: STONE_W[0], bleed: STONE_W[1], pat: PAT.blocks, ps: 0.6 });
  }

  // Towering Mount Vlašić green alpine range rising behind Travnik ('hills')
  for (const [hx, hy, hz, rx, ry, rz] of [
    [-95, 36, -135, 78, 54, 55], [0, 44, -148, 86, 66, 56], [98, 38, -132, 76, 56, 54],
    [-155, 22, -25, 46, 34, 85], [155, 22, -15, 46, 34, 85], [-115, 18, 140, 72, 28, 46],
    [15, 20, 150, 82, 30, 44], [125, 18, 136, 70, 28, 46],
  ]) {
    A(DODE, hx, hy, hz, { tag: 'hills', col: '#5a9444', bleed: '#3e702c', hull: true, solid: false }, rr(0, 3), 0, 0, [rx, ry, rz]);
  }

  // ==================== 3. ZONE 1: PLAVA VODA SPRING & RIVERSIDE CAFÉS (9 words) ====================
  // STAGE 0 (FIRST WORD!): 'plava' (blue turquoise water of Plava voda spring + stepped cascades)
  b.object(() => {
    const PL = { tag: 'plava', col: '#2fb8d4', bleed: '#1989a8', pat: PAT.water, hatch: 0, water: true, ink: false, orb: 'plava' };
    box(11.6, 0.12, 60.0, 0, PLAVA_WATER_Y - 0.06, 18, PL);
    // White-cyan foaming spring cascades stepping down along the stream & pouring into Lašva
    for (const cz of [-6, 8, 24, 47.4]) {
      box(11.2, cz > 45 ? 1.7 : 0.45, 1.1, 0, cz > 45 ? 0.85 : PLAVA_WATER_Y + 0.06, cz, {
        tag: 'plava', col: '#dff8fc', bleed: '#9ae2f0', hatch: 0, solid: false,
      });
    }
    // Spring source cave-arch under the fortress crag at (0, 2.2, -12.5)
    A(DODE, 0, 3.2, -14.2, { tag: 'valley', col: '#9e9a8e', bleed: '#787468', hull: true }, 0, 0, 0, [6.5, 3.4, 3.2]);
  });

  // Crystal clear riverbed stones visible under the spring ('bistra') at (0, 1.35, -3)
  b.object(() => {
    const BS = { tag: 'bistra', col: '#8ce3f0', bleed: '#54b9cc', hull: true, solid: false, orb: 'bistra' };
    for (let i = 0; i < 12; i++) {
      const sx = -3.8 + (i % 4) * 2.5 + (R() - 0.5) * 0.5;
      const sz = -6.5 + Math.floor(i / 4) * 2.2 + (R() - 0.5) * 0.4;
      A(ICO, sx, PLAVA_WATER_Y - 0.02, sz, BS, 0, 0, 0, [0.55, 0.22, 0.48]);
    }
  });

  // Animated swimming trout ('pastrmka') in Plava voda around (0, PLAVA_WATER_Y - 0.05, 3.5)
  for (let i = 0; i < 4; i++) {
    const tg = new THREE.Group();
    const tx = -2.2 + i * 1.45, tz = 2.0 + (i % 2) * 3.0;
    tg.position.set(tx, PLAVA_WATER_Y + 0.06, tz);
    scene.add(tg);
    dynMesh(ICO, 'pastrmka', '#6a8f88', '#3c5e58', tg, 0, 0, 0, [0.14, 0.14, 0.44], 1.1);
    dynMesh(CONE4, 'pastrmka', '#4a6e68', '#2e4a45', tg, 0, 0, -0.46, [0.10, 0.24, 0.08], 1.0).rotation.x = -Math.PI / 2;
    trouts.push({ g: tg, home: V(tx, PLAVA_WATER_Y + 0.06, tz), rx: 1.1, rz: 1.8, speed: 0.75 + i * 0.15, phase: i * 1.6 });
  }

  // Wooden riverside café terraces ('terasa') overhanging both banks of Plava voda (x = -11..-6 and x = 6..11, z = 4..20)
  b.object(() => {
    const TR = { tag: 'terasa', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3, orb: 'terasa' };
    const RL = { tag: 'terasa', col: WOOD_D[0], bleed: WOOD_D[1], wall: true };
    for (const [cx, edgeX] of [[-8.5, -5.6], [8.5, 5.6]]) {
      box(6.2, 0.28, 16.5, cx, TOWN_Y + 0.14, 12, TR);
      box(0.16, 0.9, 16.4, edgeX, TOWN_Y + 0.68, 12, RL);
      for (const rz of [3.8, 20.2]) box(6.0, 0.9, 0.16, cx, TOWN_Y + 0.68, rz, RL);
    }
    // Cute wooden footbridge linking the two café terraces at z = 12
    box(11.8, 0.24, 2.4, 0, TOWN_Y + 0.22, 12, TR);
    for (const rz of [10.85, 13.15]) box(11.6, 0.85, 0.14, 0, TOWN_Y + 0.72, rz, RL);
  });

  // Traditional cushioned sećija bench ('secija') on the west terrace at (-9.8, TOWN_Y, 8.0)
  b.object(() => {
    const SC = { tag: 'secija', orb: 'secija' };
    box(1.1, 0.45, 3.6, -9.8, TOWN_Y + 0.48, 8.0, { ...SC, col: WOOD_D[0], bleed: WOOD_D[1] });
    box(1.0, 0.20, 3.4, -9.8, TOWN_Y + 0.78, 8.0, { ...SC, col: '#b83c32', bleed: '#8c2820', pat: PAT.kilim });
    for (const cz of [6.8, 8.0, 9.2]) box(0.32, 0.48, 0.85, -10.15, TOWN_Y + 1.06, cz, { ...SC, col: '#d48d32', bleed: '#a6691e', hull: true });
  });

  // Colourful parasols ('suncobran') shading the café tables on both terraces
  b.object(() => {
    const UCOLS = [['#e6c373', '#c29c4a'], ['#d6653e', '#ab4726'], ['#4f8ab8', '#36678f']];
    const UPOS = [[-7.6, 7.8], [-7.6, 16.5], [7.8, 7.6], [7.8, 16.2]];
    for (let i = 0; i < UPOS.length; i++) {
      const [ux, uz] = UPOS[i];
      const [c1, c2] = UCOLS[i % UCOLS.length];
      // Café table underneath ('props')
      A(CYL12, ux, TOWN_Y + 0.96, uz, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] }, 0, 0, 0, [0.72, 0.08, 0.72]);
      A(CYL, ux, TOWN_Y + 0.56, uz, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.09, 0.75, 0.09]);
      // Parasol pole & wide octagonal canopy ('suncobran')
      A(CYL, ux, TOWN_Y + 1.95, uz, { tag: 'suncobran', col: WOOD_D[0], bleed: WOOD_D[1], wall: true }, 0, 0, 0, [0.055, 2.2, 0.055]);
      A(CONE8, ux, TOWN_Y + 3.05, uz, { tag: 'suncobran', col: c1, bleed: c2, hull: true, orb: 'suncobran' }, 0, 0, 0, [1.85, 0.78, 1.85]);
    }
  });

  // Teapot ('cajnik') & cool lemonade ('limunada') on the east terrace café tables + waitress ('konobarica')
  b.object(() => {
    // Ceramic teapot on east table (7.8, TOWN_Y + 1.0, 7.6)
    A(SPHERE, 7.65, TOWN_Y + 1.18, 7.55, { tag: 'cajnik', col: '#d45b3b', bleed: '#a33c22', hull: true, orb: 'cajnik' }, 0, 0, 0, [0.22, 0.18, 0.22]);
    A(CYL, 7.90, TOWN_Y + 1.24, 7.55, { tag: 'cajnik', col: '#d45b3b', bleed: '#a33c22' }, 0, 0, -0.7, [0.04, 0.26, 0.04]);
    // Pitcher & glasses of yellow lemonade on east south table (7.8, TOWN_Y + 1.0, 16.2)
    A(CYL12, 7.68, TOWN_Y + 1.24, 16.15, { tag: 'limunada', col: '#f5df42', bleed: '#cfb51d', hull: true, orb: 'limunada' }, 0, 0, 0, [0.16, 0.42, 0.16]);
    A(CYL12, 8.05, TOWN_Y + 1.14, 16.30, { tag: 'limunada', col: '#faea64', bleed: '#d6c032', hull: true }, 0, 0, 0, [0.09, 0.24, 0.09]);
  });
  people.push({ kind: 'trvWaitress', x: 9.2, y: TOWN_Y + 0.28, z: 12.0, ry: -Math.PI / 2, tag: 'konobarica', woman: true });

  // ==================== 4. ZONE 2: ŠARENA DŽAMIJA & CRAFT ARCADE (11 words) ====================
  // Sulejmanija / Šarena džamija at (-26, TOWN_Y, 12)
  // Ground floor: 6-arch stone bezistan arcade ('stub' = columns, 'sest' = 6 arches, 'trgovina' = bazaar stalls)
  // Upper floor: colourful floral painted prayer hall ('sarena' = colourful walls, 'freska' = painted panels)
  b.object(() => {
    const SR = { tag: 'sarena', col: '#f4eedd', bleed: '#ded5bd', pool: 0.75, orb: 'sarena' };
    // Upper painted prayer hall cube
    box(15.6, 6.2, 11.4, -26, TOWN_Y + 6.9, 12, SR);
    // Hipped dark lead roof & slim minaret on west corner (finale 'town' for minaret so 'sarena' stays purely the painted mosque)
    A(hipRoofGeo(16.6, 12.4, 4.0), -26, TOWN_Y + 10.0, 12, { tag: 'sarena', col: '#5a6e6a', bleed: '#3f524e', pat: PAT.roof });
    A(CYL12, -34.2, TOWN_Y + 10.5, 11.2, { tag: 'town', col: STONE_W[0], bleed: STONE_W[1] }, 0, 0, 0, [0.75, 21.0, 0.75]);
    A(CONE8, -34.2, TOWN_Y + 23.0, 11.2, { tag: 'town', col: '#5a6e6a', bleed: '#3f524e' }, 0, 0, 0, [0.85, 4.2, 0.85]);
  });

  // Bright floral painted fresco panels ('freska') wrapping all 4 facades of Šarena džamija!
  b.object(() => {
    const FCOLS = [['#4b8eb8', '#2f6a91'], ['#d96548', '#ad442a'], ['#5ea166', '#3e7845'], ['#e3b33b', '#ba8c1e']];
    for (let i = 0; i < 6; i++) {
      const fx = -32.2 + i * 2.48;
      const [c1, c2] = FCOLS[i % FCOLS.length];
      // Front (+z) painted floral panels
      box(1.9, 4.2, 0.14, fx, TOWN_Y + 6.9, 17.75, { tag: 'freska', col: c1, bleed: c2, orb: 'freska' });
      A(ICO, fx, TOWN_Y + 7.2, 17.85, { tag: 'freska', col: '#faf2dc', bleed: '#e3d5b4', solid: false }, 0, 0, 0, [0.55, 0.85, 0.08]);
      // Back (-z) panels
      box(1.9, 4.2, 0.14, fx, TOWN_Y + 6.9, 6.25, { tag: 'freska', col: c1, bleed: c2 });
    }
  });

  // Ground-floor bezistan arcade: 7 stone pillars ('stub') forming 6 painted arches ('sest') along z = 17.5!
  b.object(() => {
    const ST = { tag: 'stub', col: STONE_W[0], bleed: STONE_W[1], pat: PAT.blocks, ps: 0.7, orb: 'stub' };
    for (let i = 0; i < 7; i++) {
      const px = -33.2 + i * 2.4;
      box(0.58, 3.6, 0.65, px, TOWN_Y + 1.8, 17.5, ST);
    }
    // 6 stone arches ('sest') spanning between the 7 columns
    const S6 = { tag: 'sest', col: '#c95c3c', bleed: '#9c3e24', orb: 'sest' };
    for (let i = 0; i < 6; i++) {
      const ax = -32.0 + i * 2.4;
      A(new THREE.TorusGeometry(1.08, 0.22, 6, 12, Math.PI), ax, TOWN_Y + 2.65, 17.55, S6);
    }
    // Ground-floor bazaar shop bays ('trgovina') inside the arcade
    box(15.2, 3.6, 10.6, -26, TOWN_Y + 1.8, 11.8, { tag: 'trgovina', col: '#e3d8c3', bleed: '#c4b69d', pat: PAT.planks, ps: 3, orb: 'trgovina' });
    // Wooden shop counters fronting the bazaar
    for (const cx of [-30.8, -26.0, -21.2]) {
      box(2.8, 0.88, 0.9, cx, TOWN_Y + 0.44, 18.6, { tag: 'trgovina', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3 });
    }
  });

  // Bazaar crafts displayed on & beside the shop counters: fabric ('tkanina'), thread ('konac'), bag ('torba'), slippers ('papuce'), jewellery ('nakit'), scissors ('makaze') & tailor ('krojac')
  b.object(() => {
    // Fabric rolls ('tkanina') on west counter (-30.8, 18.6)
    const TK_C = [['#d44842', '#a32e28'], ['#3a7cb0', '#245882'], ['#e0b034', '#b3861a'], ['#549964', '#387346']];
    for (let i = 0; i < 4; i++) {
      const [c1, c2] = TK_C[i];
      A(CYL12, -31.7 + i * 0.60, TOWN_Y + 1.06, 18.6, { tag: 'tkanina', col: c1, bleed: c2, orb: 'tkanina' }, 0, 0, Math.PI / 2, [0.16, 0.48, 0.16]);
    }
    // Colourful thread spools ('konac') & metal scissors ('makaze') beside the tailor (-26.0, 18.6)
    const KN_C = [['#e04a42', '#b03028'], ['#468cc4', '#2d6899'], ['#f0c638', '#c49b1e']];
    for (let i = 0; i < 3; i++) {
      A(CYL12, -26.8 + i * 0.34, TOWN_Y + 1.02, 18.5, { tag: 'konac', col: KN_C[i][0], bleed: KN_C[i][1], orb: 'konac' }, 0, 0, 0, [0.11, 0.24, 0.11]);
    }
    // Scissors ('makaze') resting on counter (-25.2, 18.6)
    box(0.55, 0.05, 0.08, -25.2, TOWN_Y + 0.92, 18.6, { tag: 'makaze', col: '#9aa2ab', bleed: '#6d757d', orb: 'makaze' }, 0.35);
    box(0.55, 0.05, 0.08, -25.2, TOWN_Y + 0.93, 18.6, { tag: 'makaze', col: '#9aa2ab', bleed: '#6d757d' }, -0.35);
    // Handmade leather bag ('torba') on east counter (-21.8, 18.6)
    box(0.52, 0.56, 0.24, -21.9, TOWN_Y + 1.18, 18.6, { tag: 'torba', col: '#8c4b28', bleed: '#633218', orb: 'torba' });
    A(new THREE.TorusGeometry(0.18, 0.035, 6, 10, Math.PI), -21.9, TOWN_Y + 1.46, 18.6, { tag: 'torba', col: '#633218', bleed: '#45210e' });
    // Embroidered slippers ('papuce') on bench (-20.4, 18.6)
    for (const sx of [-0.16, 0.16]) {
      A(ICO, -20.5 + sx, TOWN_Y + 0.96, 18.6, { tag: 'papuce', col: '#c93e52', bleed: '#962638', hull: true, orb: 'papuce' }, 0, 0, 0, [0.11, 0.08, 0.24]);
    }
    // Silver jewellery ('nakit') display stand at (-18.6, 18.6)
    box(0.95, 0.72, 0.75, -18.6, TOWN_Y + 0.36, 18.6, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] });
    box(0.82, 0.08, 0.62, -18.6, TOWN_Y + 0.76, 18.6, { tag: 'props', col: '#2f3d59', bleed: '#1f293d' });
    for (const [nx, nz] of [[-18.85, 18.5], [-18.4, 18.65], [-18.6, 18.4]]) {
      A(new THREE.TorusGeometry(0.14, 0.035, 6, 12), nx, TOWN_Y + 0.84, nz, { tag: 'nakit', col: '#f2d35c', bleed: '#c7a42c', orb: 'nakit' }, 0, Math.PI / 2, 0);
    }
  });
  people.push({ kind: 'trvTailor', x: -26.0, y: TOWN_Y + 0.04, z: 20.0, ry: Math.PI, tag: 'krojac' });

  // ==================== 5. ZONE 3: CLOCK TOWERS, MEDRESA, IVO ANDRIĆ HOUSE & TURBE (12 words) ====================
  // Travnik's Two Sahat-kule (Clock Towers) at (-52, TOWN_Y, 16) and (-48, TOWN_Y, -10)
  // Main clock tower features golden hands ('kazaljka') and numbers ('broj')!
  function buildClockTower(cx, cz, mainDial = false) {
    const TW = { tag: 'town', col: STONE_W[0], bleed: STONE_W[1], pat: PAT.blocks, ps: 0.65, pool: 0.8 };
    b.object(() => {
      box(3.8, 14.5, 3.8, cx, TOWN_Y + 7.25, cz, TW);
      A(hipRoofGeo(4.4, 4.4, 3.2), cx, TOWN_Y + 14.5, cz, { tag: 'town', col: SHINGLE[0], bleed: SHINGLE[1], pat: PAT.roof });
      // Dark clock face on south side
      A(CYL16, cx, TOWN_Y + 12.0, cz + 1.94, { tag: 'town', col: '#2b2824', bleed: '#1a1815', solid: false }, 0, Math.PI / 2, 0, [1.28, 0.12, 1.28]);
    });
    if (mainDial) {
      // Golden numerals ('broj') around the dial
      b.object(() => {
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          box(0.18, 0.26, 0.10, cx + Math.sin(a) * 0.96, TOWN_Y + 12.0 + Math.cos(a) * 0.96, cz + 2.02, {
            tag: 'broj', col: '#f5cc42', bleed: '#c99e1e', solid: false, orb: 'broj',
          });
        }
      });
      // Animated golden clock hands ('kazaljka')
      const hg = new THREE.Group();
      hg.position.set(cx, TOWN_Y + 12.0, cz + 2.06);
      scene.add(hg);
      const minG = new THREE.Group(); hg.add(minG);
      const hrG = new THREE.Group(); hg.add(hrG);
      dynMesh(BOX, 'kazaljka', '#ffdf5e', '#d4ae24', minG, 0, 0.45, 0, [0.10, 0.92, 0.08], 1.1);
      dynMesh(BOX, 'kazaljka', '#f2b82e', '#c28c14', hrG, 0, 0.32, 0.02, [0.14, 0.64, 0.08], 1.1);
      hrG.rotation.z = -0.8;
      clockHands.push({ min: minG, hour: hrG });
    }
  }
  buildClockTower(-52, 16, true);
  buildClockTower(-48, -10, false);

  // Ottoman Vizier Turbe ('turbe') & carved stone inscription ('natpis') at (-46, TOWN_Y, 30)
  b.object(() => {
    const TB = { tag: 'turbe', col: STONE_W[0], bleed: STONE_W[1], pat: PAT.blocks, ps: 0.7, orb: 'turbe' };
    A(CYL, -46, TOWN_Y + 0.35, 30, TB, Math.PI / 8, 0, 0, [3.2, 0.7, 3.2]);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      A(CYL, -46 + Math.cos(a) * 2.5, TOWN_Y + 2.2, 30 + Math.sin(a) * 2.5, TB, 0, 0, 0, [0.22, 3.2, 0.22]);
    }
    A(HEMI, -46, TOWN_Y + 3.8, 30, { tag: 'turbe', col: '#69857c', bleed: '#4a665d', hull: true }, 0, 0, 0, [2.9, 2.4, 2.9]);
    // Carved stone inscription tablet ('natpis') above south entrance
    box(1.9, 0.75, 0.22, -46, TOWN_Y + 3.65, 32.75, { tag: 'natpis', col: '#f2ead8', bleed: '#cfc3aa', orb: 'natpis' });
    for (const dy of [-0.14, 0.04, 0.20]) box(1.45, 0.06, 0.26, -46, TOWN_Y + 3.65 + dy, 32.78, { tag: 'natpis', col: '#403932', solid: false });
  });

  // Medresa Library Pavilion ('biblioteka') with bookshelf ('polica') & stacked books ('knjiga') at (-66, TOWN_Y, 16)
  b.object(() => {
    const BL = { tag: 'biblioteka', col: '#e8dec8', bleed: '#c7baa0', pat: PAT.blocks, ps: 0.65, orb: 'biblioteka' };
    box(9.5, 4.8, 7.2, -66, TOWN_Y + 2.4, 16, BL);
    A(hipRoofGeo(10.6, 8.2, 2.8), -66, TOWN_Y + 4.8, 16, { tag: 'biblioteka', col: TILE[0], bleed: TILE[1], pat: PAT.roof });
    // Outdoor covered reading bookshelf ('polica') on south front at (-66, TOWN_Y, 20.1)
    const PL = { tag: 'polica', col: WOOD_D[0], bleed: WOOD_D[1], pat: PAT.planks, ps: 3, orb: 'polica' };
    box(3.4, 2.2, 0.55, -66, TOWN_Y + 1.1, 20.1, PL);
    // Rows of colourful bound books ('knjiga') on the shelves & reading table
    const BCOLS = ['#b83b32', '#2f6294', '#468254', '#c9942c', '#7a487a'];
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 8; i++) {
        box(0.28, 0.44, 0.36, -67.3 + i * 0.37, TOWN_Y + 0.52 + r * 0.62, 20.28, {
          tag: 'knjiga', col: BCOLS[(i + r) % BCOLS.length], bleed: '#3a3028', orb: 'knjiga',
        });
      }
    }
  });

  // Ivo Andrić Birthplace House (Rodna kuća Ive Andrića) at (-66, TOWN_Y, -4)
  // Includes wooden balcony ('balkon'), writer ('pisac'), quill ('pero'), inkwell ('tinta') & wax-sealed letter ('pismo')!
  b.object(() => {
    const HS = { tag: 'town', col: LIME[0], bleed: LIME[1], pool: 0.7 };
    box(8.8, 2.6, 6.8, -66, TOWN_Y + 1.3, -4, { tag: 'town', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.7 });
    box(9.2, 3.2, 7.2, -66, TOWN_Y + 4.2, -4, HS);
    A(hipRoofGeo(10.2, 8.2, 3.0), -66, TOWN_Y + 5.8, -4, { tag: 'town', col: TILE[0], bleed: TILE[1], pat: PAT.roof });
    // Carved wooden Bosnian balcony ('balkon') jutting out on the south front
    const BK = { tag: 'balkon', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3, orb: 'balkon' };
    box(4.6, 0.28, 2.0, -66, TOWN_Y + 3.0, 0.4, BK);
    box(4.6, 1.0, 0.16, -66, TOWN_Y + 3.6, 1.35, { ...BK, wall: true });
    for (const sx of [-2.22, 2.22]) box(0.16, 1.0, 2.0, -66 + sx, TOWN_Y + 3.6, 0.4, { ...BK, wall: true });
  });
  // Writer's courtyard table in front of Ivo Andrić's house at (-66, TOWN_Y, 3.4)
  box(2.0, 0.85, 1.1, -66, TOWN_Y + 0.42, 3.4, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] });
  people.push({ kind: 'trvWriter', x: -66.0, y: TOWN_Y + 0.04, z: 2.4, ry: 0, tag: 'pisac' });
  b.object(() => {
    // Ink bottle ('tinta')
    A(CYL12, -65.4, TOWN_Y + 0.96, 3.35, { tag: 'tinta', col: '#1f3263', bleed: '#121e3d', hull: true, orb: 'tinta' }, 0, 0, 0, [0.13, 0.24, 0.13]);
    // Folded letter with red wax seal ('pismo')
    box(0.55, 0.04, 0.40, -66.3, TOWN_Y + 0.88, 3.35, { tag: 'pismo', col: '#faf4e6', bleed: '#dfd6c2', orb: 'pismo' }, 0.12);
    A(CYL12, -66.3, TOWN_Y + 0.91, 3.35, { tag: 'pismo', col: '#c92e2e', bleed: '#8f1b1b' }, 0, 0, 0, [0.09, 0.04, 0.09]);
  });

  // ==================== 6. ZONE 4: TRAVNIK FOOD PLAZA - ĆEVAPI, PITA & DINING (12 words) ====================
  // Outdoor Travnik grill station at (26, TOWN_Y, 18)
  b.object(() => {
    // Iron barbecue grill ('rostilj') & glowing embers ('zar')
    box(3.0, 0.95, 1.2, 26, TOWN_Y + 0.48, 18, { tag: 'rostilj', col: '#45484d', bleed: '#2c2e32', orb: 'rostilj' });
    box(2.6, 0.16, 0.9, 26, TOWN_Y + 0.98, 18, { tag: 'zar', col: '#ff661a', bleed: '#cc3300', hull: true, orb: 'zar' });
    for (let i = 0; i < 6; i++) {
      A(ICO, 24.9 + i * 0.44, TOWN_Y + 1.08, 18, { tag: 'zar', col: '#ff9c24', bleed: '#d94810', solid: false }, 0, 0, 0, [0.16, 0.10, 0.16]);
    }
    smoke.push(V(26, TOWN_Y + 1.5, 18));
  });
  // Chef ('kuhar') & assistant cooking ('kuhati')
  people.push({ kind: 'trvChef', x: 25.0, y: TOWN_Y + 0.04, z: 16.8, ry: 0, tag: 'kuhar' });
  people.push({ kind: 'trvChef', x: 27.2, y: TOWN_Y + 0.04, z: 16.8, ry: 0, tag: 'kuhati', woman: true });

  // Bosnian dining table at (26, TOWN_Y, 26) laid with tepsija, pita, kajmak, jogurt, tanjir, kasika, viljuska, noz!
  b.object(() => {
    box(4.6, 0.12, 2.2, 26, TOWN_Y + 0.88, 26, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3 });
    for (const sx of [-2.0, 2.0]) for (const sz of [-0.9, 0.9]) box(0.16, 0.86, 0.16, 26 + sx, TOWN_Y + 0.43, 26 + sz, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] });
    // Round metal baking pan ('tepsija') & spiral Bosnian pie ('pita')
    A(CYL16, 24.6, TOWN_Y + 0.98, 25.8, { tag: 'tepsija', col: '#b8bcc2', bleed: '#8a8e94', orb: 'tepsija' }, 0, 0, 0, [0.68, 0.12, 0.68]);
    A(new THREE.TorusGeometry(0.42, 0.12, 6, 16), 24.6, TOWN_Y + 1.06, 25.8, { tag: 'pita', col: '#d99a44', bleed: '#ad7226', hull: true, orb: 'pita' }, 0, Math.PI / 2, 0);
    A(new THREE.TorusGeometry(0.20, 0.11, 6, 12), 24.6, TOWN_Y + 1.07, 25.8, { tag: 'pita', col: '#e0a54f', bleed: '#b57c2d', hull: true }, 0, Math.PI / 2, 0);
    // Creamy kajmak bowl ('kajmak') & yogurt glass ('jogurt')
    A(CYL12, 25.8, TOWN_Y + 1.02, 25.5, { tag: 'kajmak', col: '#fff7d9', bleed: '#e3d5a8', hull: true, orb: 'kajmak' }, 0, 0, 0, [0.24, 0.18, 0.24]);
    A(CYL12, 26.4, TOWN_Y + 1.12, 25.6, { tag: 'jogurt', col: '#fafcff', bleed: '#dce3eb', hull: true, orb: 'jogurt' }, 0, 0, 0, [0.13, 0.36, 0.13]);
    // Ceramic plate ('tanjir'), spoon ('kasika'), fork ('viljuska') & knife ('noz') at (27.4, TOWN_Y + 0.96, 26.2)
    A(CYL16, 27.4, TOWN_Y + 0.96, 26.2, { tag: 'tanjir', col: '#f7f5f0', bleed: '#d6d2c8', orb: 'tanjir' }, 0, 0, 0, [0.34, 0.05, 0.34]);
    box(0.08, 0.04, 0.42, 26.88, TOWN_Y + 0.96, 26.2, { tag: 'viljuska', col: '#bfc5cc', bleed: '#8d949c', orb: 'viljuska' });
    box(0.07, 0.04, 0.44, 27.88, TOWN_Y + 0.96, 26.2, { tag: 'noz', col: '#cfd4db', bleed: '#989fa8', orb: 'noz' });
    box(0.10, 0.04, 0.40, 28.12, TOWN_Y + 0.96, 26.2, { tag: 'kasika', col: '#c7ccd4', bleed: '#9197a0', orb: 'kasika' });
  });

  // Summer vegetable crates beside the food plaza: tomatoes ('paradajz') & cucumbers ('krastavac') at (34, TOWN_Y, 20)
  b.object(() => {
    box(1.5, 0.55, 1.1, 33.4, TOWN_Y + 0.28, 20.0, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
    box(1.5, 0.55, 1.1, 35.4, TOWN_Y + 0.28, 20.0, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
    for (let i = 0; i < 6; i++) {
      A(SPHERE, 32.95 + (i % 3) * 0.45, TOWN_Y + 0.64, 19.75 + Math.floor(i / 3) * 0.48, {
        tag: 'paradajz', col: '#de352b', bleed: '#a82018', hull: true, orb: 'paradajz',
      }, 0, 0, 0, 0.19);
      A(CYL, 34.95 + (i % 3) * 0.42, TOWN_Y + 0.64, 19.78 + Math.floor(i / 3) * 0.42, {
        tag: 'krastavac', col: '#3d8f3b', bleed: '#276626', hull: true, orb: 'krastavac',
      }, 0.2, Math.PI / 2, 0, [0.09, 0.48, 0.09]);
    }
  });

  // Scenic Bosnian town houses flanking east & west plazas ('town')
  function buildTownHouse(hx, hz, w, d, h, ry = 0) {
    b.object(() => {
      box(w, 1.4, d, hx, TOWN_Y + 0.7, hz, { tag: 'town', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.7 }, ry);
      box(w + 0.4, h, d + 0.4, hx, TOWN_Y + 1.4 + h / 2, hz, { tag: 'town', col: LIME[0], bleed: LIME[1] }, ry);
      A(hipRoofGeo(w + 1.1, d + 1.1, 2.8), hx, TOWN_Y + 1.4 + h, hz, { tag: 'town', col: TILE[0], bleed: TILE[1], pat: PAT.roof }, ry);
    });
  }
  buildTownHouse(24, -4, 7.2, 5.8, 3.2, 0.05);
  buildTownHouse(38, 6, 6.8, 5.6, 3.0, -0.06);
  buildTownHouse(-24, -8, 6.8, 5.4, 3.1, 0.04);
  buildTownHouse(-18, 34, 6.4, 5.2, 2.9, -0.04);

  // ==================== 7. ZONE 5: LAŠVA VALLEY & FARMSTEAD (8 words) ====================
  // Smooth river gravel bar ('sljunak') along the south Lašva edge at (-16, 0.15, 64.5)
  b.object(() => {
    const SL = { tag: 'sljunak', col: '#cdc8bc', bleed: '#a39e92', hull: true, orb: 'sljunak' };
    box(10.0, 0.32, 3.2, -16, 0.16, 64.5, SL);
    for (let i = 0; i < 10; i++) {
      A(ICO, -20.2 + i * 0.92, 0.36, 64.2 + (i % 2) * 0.7, SL, 0, 0, 0, [0.32, 0.16, 0.28]);
    }
  });

  // Broad Bosnian oak trees ('hrast') & white-barked birch trees ('breza') on the south valley bank
  for (const [ox, oz, s] of [[-26, 76, 1.15], [-38, 82, 1.0]]) {
    b.object(() => {
      A(CYL, ox, TOWN_Y + 2.2 * s, oz, { tag: 'hrast', col: '#5c4028', bleed: '#3d2918', orb: 'hrast' }, 0, 0, 0, [0.48 * s, 4.4 * s, 0.48 * s]);
      for (const [dx, dy, dz, r] of [[0, 5.2, 0, 2.8], [-1.7, 4.6, 0.8, 1.9], [1.7, 4.7, -0.7, 1.9]]) {
        A(ICO, ox + dx * s, TOWN_Y + dy * s, oz + dz * s, { tag: 'hrast', col: '#4a853c', bleed: '#306125', hull: true, sway: 5.5 }, 0, 0, 0, r * s);
      }
    });
    moteEmitters.push({ x: ox, y: TOWN_Y + 4.5, z: oz, r: 3.5 });
  }
  for (const [bx, bz, s] of [[32, 74, 1.05], [40, 78, 0.95]]) {
    b.object(() => {
      A(CYL, bx, TOWN_Y + 2.6 * s, bz, { tag: 'breza', col: '#f2eee6', bleed: '#cfc9be', orb: 'breza' }, 0, 0, 0, [0.22 * s, 5.2 * s, 0.22 * s]);
      for (const dy of [1.2, 2.5, 3.6]) box(0.48 * s, 0.12, 0.48 * s, bx, TOWN_Y + dy * s, bz, { tag: 'breza', col: '#3a3530', solid: false });
      A(ICO, bx, TOWN_Y + 5.6 * s, bz, { tag: 'breza', col: '#82bf56', bleed: '#5e9638', hull: true, sway: 5.5 }, 0, 0, 0, [2.0 * s, 2.4 * s, 2.0 * s]);
    });
  }

  // Tall golden haystack ('sijeno') on the south valley meadow at (-8, TOWN_Y, 82)
  b.object(() => {
    const SJ = { tag: 'sijeno', col: '#e3bd4c', bleed: '#b89226', hull: true, orb: 'sijeno' };
    A(CYL12, -8, TOWN_Y + 1.3, 82, SJ, 0, 0, 0, [2.2, 2.6, 2.2]);
    A(CONE8, -8, TOWN_Y + 3.4, 82, SJ, 0, 0, 0, [2.4, 2.0, 2.4]);
  });

  // Farmyard birds: white goose ('guska'), proud rooster ('pijetao'), hen ('kokos') & eggs ('jaje') at (12..22, TOWN_Y, 74..80)
  // Goose ('guska')
  {
    const gg = new THREE.Group(); gg.position.set(11, TOWN_Y + 0.04, 74); scene.add(gg);
    dynMesh(ICO, 'guska', '#ffffff', '#dce2e8', gg, 0, 0.45, 0, [0.28, 0.26, 0.44], 1.2);
    const hd = dynMesh(CYL, 'guska', '#ffffff', '#dce2e8', gg, 0, 0.85, 0.30, [0.08, 0.55, 0.08], 1.1);
    dynMesh(CONE4, 'guska', '#e88b2c', '#b86614', gg, 0, 1.12, 0.45, [0.06, 0.20, 0.06], 1.0).rotation.x = Math.PI / 2;
    farmBirds.push({ g: gg, head: hd, ry: 0.4, phase: 0 });
  }
  // Rooster ('pijetao')
  {
    const rg = new THREE.Group(); rg.position.set(16, TOWN_Y + 0.04, 76); scene.add(rg);
    dynMesh(ICO, 'pijetao', '#b84b2c', '#822f18', rg, 0, 0.40, 0, [0.22, 0.22, 0.34], 1.2);
    dynMesh(ICO, 'pijetao', '#284a3d', '#183027', rg, 0, 0.52, -0.34, [0.14, 0.28, 0.24], 1.1);
    const hd = dynMesh(SPHERE, 'pijetao', '#d46a34', '#9e471c', rg, 0, 0.72, 0.24, 0.13, 1.1);
    dynMesh(BOX, 'pijetao', '#de2b2b', '#a31616', rg, 0, 0.88, 0.24, [0.06, 0.14, 0.22], 1.0);
    farmBirds.push({ g: rg, head: hd, ry: -0.5, phase: 1.8 });
  }
  // Hen ('kokos') & straw basket with white eggs ('jaje')
  b.object(() => {
    A(ICO, 20.0, TOWN_Y + 0.36, 75.5, { tag: 'kokos', col: '#d49e62', bleed: '#a6743c', hull: true, orb: 'kokos' }, 0, 0, 0, [0.24, 0.22, 0.34]);
    A(SPHERE, 20.0, TOWN_Y + 0.62, 75.8, { tag: 'kokos', col: '#e0ab6e', bleed: '#b07e46', hull: true }, 0, 0, 0, 0.13);
    // Straw nest + eggs ('jaje') at (21.6, TOWN_Y, 75.8)
    A(CYL12, 21.6, TOWN_Y + 0.18, 75.8, { tag: 'props', col: '#cfa854', bleed: '#a37f32' }, 0, 0, 0, [0.55, 0.26, 0.55]);
    for (const [ex, ez] of [[21.45, 75.7], [21.75, 75.72], [21.60, 75.95]]) {
      A(SPHERE, ex, TOWN_Y + 0.36, ez, { tag: 'jaje', col: '#fcf9f0', bleed: '#dfd9c8', hull: true, orb: 'jaje' }, 0, 0, 0, [0.11, 0.15, 0.11]);
    }
  });

  // ==================== 8. ZONE 6: MOUNT VLAŠIĆ FOOTHILLS & SHEPHERDS (9 words) ====================
  // NW Foothill terrace (y = FOOTHILL_Y = 14.0, x = -40..-64, z = -34..-52)
  // Wooden sheepfold pen ('tor')
  b.object(() => {
    const TR = { tag: 'tor', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3, wall: true, orb: 'tor' };
    for (const [fx, fz, w, d] of [
      [-46, -36, 12, 0.22], [-46, -48, 12, 0.22], [-52, -42, 0.22, 12], [-40, -42, 0.22, 12],
    ]) {
      box(w, 0.22, d, fx, FOOTHILL_Y + 0.45, fz, TR);
      box(w, 0.22, d, fx, FOOTHILL_Y + 0.95, fz, TR);
    }
    for (let x = -52; x <= -40; x += 3) for (const z of [-36, -48]) box(0.24, 1.3, 0.24, x, FOOTHILL_Y + 0.65, z, TR);
  });

  // Shepherd ('pastir') with curved staff ('stap') standing beside the sheepfold
  people.push({ kind: 'trvShepherd', x: -38.0, y: FOOTHILL_Y + 0.04, z: -40.5, ry: -Math.PI / 2, tag: 'pastir' });

  // Vlašić sheep flock ('stado') + brass bell ('zvonce') on the lead sheep!
  b.object(() => {
    const SH_POS = [[-43, -40], [-46, -42], [-49, -40], [-45, -45], [-48, -44]];
    for (let i = 0; i < SH_POS.length; i++) {
      const [sx, sz] = SH_POS[i];
      A(ICO, sx, FOOTHILL_Y + 0.68, sz, { tag: 'stado', col: '#f7f4eb', bleed: '#dad4c5', hull: true, orb: 'stado' }, 0, 0, 0, [0.42, 0.36, 0.62]);
      A(SPHERE, sx + 0.52, FOOTHILL_Y + 0.85, sz, { tag: 'stado', col: '#4a433d', bleed: '#2e2925', hull: true }, 0, 0, 0, [0.20, 0.18, 0.18]);
      for (const lx of [-0.24, 0.24]) for (const lz of [-0.18, 0.18])
        A(CYL, sx + lx, FOOTHILL_Y + 0.32, sz + lz, { tag: 'stado', col: '#3d3732', bleed: '#24201d' }, 0, 0, 0, [0.06, 0.64, 0.06]);
    }
    // Brass sheep bell ('zvonce') hanging beneath the lead sheep's neck at (-42.5, FOOTHILL_Y + 0.64, -40)
    A(CONE8, -42.45, FOOTHILL_Y + 0.60, -40.0, { tag: 'zvonce', col: '#e8bc38', bleed: '#b58b18', hull: true, orb: 'zvonce' }, 0, 0, 0, [0.16, 0.24, 0.16]);
  });

  // Vlašić cheese barrel ('bacva') & gleaming milk churn ('mlijeko') at (-34, FOOTHILL_Y, -35)
  b.object(() => {
    A(CYL12, -34.5, FOOTHILL_Y + 0.62, -35.0, { tag: 'bacva', col: '#9c6c3b', bleed: '#734b24', pat: PAT.planks, ps: 4, orb: 'bacva' }, 0, 0, 0, [0.55, 1.24, 0.55]);
    for (const hy of [0.35, 0.90]) A(new THREE.TorusGeometry(0.56, 0.04, 6, 14), -34.5, FOOTHILL_Y + hy, -35.0, { tag: 'bacva', col: '#4a4d52', bleed: '#2e3033' }, 0, Math.PI / 2, 0);
    // Milk churn & fresh white milk ('mlijeko') at (-32.8, FOOTHILL_Y, -35.0)
    A(CYL12, -32.8, FOOTHILL_Y + 0.48, -35.0, { tag: 'mlijeko', col: '#cfd6de', bleed: '#9ea6b0', orb: 'mlijeko' }, 0, 0, 0, [0.28, 0.96, 0.28]);
    A(CYL12, -32.8, FOOTHILL_Y + 0.96, -35.0, { tag: 'mlijeko', col: '#ffffff', bleed: '#e8edf2' }, 0, 0, 0, [0.24, 0.06, 0.24]);
  });

  // Wild blackberries ('kupina') & woodland mushrooms ('gljiva') on the NE Vlašić foothill terrace (x = 34..46, z = -34..-42, y = FOOTHILL_Y)
  b.object(() => {
    A(ICO, 36, FOOTHILL_Y + 0.75, -34, { tag: 'hills', col: '#3e7032', bleed: '#284f1f', hull: true }, 0, 0, 0, [1.5, 0.95, 1.4]);
    for (const [kx, ky, kz] of [[35.2, 1.1, -33.0], [36.1, 1.25, -32.9], [36.8, 0.95, -33.1], [35.6, 0.85, -32.8], [36.4, 1.15, -33.3]]) {
      A(ICO, kx, FOOTHILL_Y + ky, kz, { tag: 'kupina', col: '#331d3d', bleed: '#1c0d24', hull: true, orb: 'kupina' }, 0, 0, 0, 0.16);
    }
    // Woodland mushrooms ('gljiva') at (43, FOOTHILL_Y, -36)
    for (const [gx, gz, sc] of [[42.4, -36.0, 1.1], [43.3, -35.4, 0.85], [43.0, -36.8, 0.95]]) {
      A(CYL, gx, FOOTHILL_Y + 0.28 * sc, gz, { tag: 'gljiva', col: '#f5eedc', bleed: '#d6ccb4', orb: 'gljiva' }, 0, 0, 0, [0.11 * sc, 0.56 * sc, 0.11 * sc]);
      A(HEMI, gx, FOOTHILL_Y + 0.52 * sc, gz, { tag: 'gljiva', col: '#c94c2e', bleed: '#96321a', hull: true }, 0, 0, 0, [0.38 * sc, 0.28 * sc, 0.38 * sc]);
    }
  });

  // ==================== 9. ZONE 7: STARI GRAD TRAVNIK FORTRESS (5 words, Stage 2!) ====================
  // Towering medieval-Ottoman citadel walls ('zidine', Stage 2!) crowning the crag at (0, FORT_Y, -48)
  b.object(() => {
    const ZD = { tag: 'zidine', col: '#d8ceb8', bleed: '#b0a388', pat: PAT.blocks, ps: 0.6, pool: 0.85, orb: 'zidine' };
    const RF = { tag: 'zidine', col: TILE[0], bleed: TILE[1], pat: PAT.roof };
    // Outer stone walls around the crag perimeter
    box(28, 6.2, 2.2, 0, FORT_Y + 3.1, -36, ZD); // South curtain wall overlooking Plava voda
    box(28, 6.2, 2.2, 0, FORT_Y + 3.1, -60, ZD); // North wall
    box(2.2, 6.2, 26, -13, FORT_Y + 3.1, -48, ZD); // West wall
    box(2.2, 6.2, 26, 13, FORT_Y + 3.1, -48, ZD); // East wall
    for (let cx = -12; cx <= 12; cx += 3.0) box(1.4, 1.1, 2.3, cx, FORT_Y + 6.7, -36, ZD);
    // Stout octagonal keep tower (Central Bastion) at (-5, FORT_Y, -52)
    A(CYL, -5, FORT_Y + 5.8, -52, ZD, Math.PI / 8, 0, 0, [5.4, 11.6, 5.4]);
    A(CONE8, -5, FORT_Y + 13.4, -52, RF, Math.PI / 8, 0, 0, [6.0, 3.8, 6.0]);
    // Corner watchtowers
    for (const [tx, tz] of [[13, -36], [-13, -36], [13, -60]]) {
      box(4.2, 8.8, 4.2, tx, FORT_Y + 4.4, tz, ZD);
      A(hipRoofGeo(5.0, 5.0, 2.4), tx, FORT_Y + 8.8, tz, RF);
    }
  });

  // Stone museum pavilion ('muzej') inside Stari Grad courtyard at (6, FORT_Y, -50)
  b.object(() => {
    box(6.5, 4.0, 5.4, 6, FORT_Y + 2.0, -50, { tag: 'muzej', col: '#eee6d4', bleed: '#ccc0a8', pat: PAT.blocks, ps: 0.7, orb: 'muzej' });
    A(hipRoofGeo(7.5, 6.4, 2.4), 6, FORT_Y + 4.0, -50, { tag: 'muzej', col: '#a34a2c', bleed: '#7d341c', pat: PAT.roof });
  });

  // Ceremonial crimson-and-gold banner ('barjak') flying atop the keep tower (-5, FORT_Y + 15.2, -52)
  const bannerG = new THREE.Group();
  bannerG.position.set(-5, FORT_Y + 15.2, -52);
  scene.add(bannerG);
  dynMesh(CYL, 'barjak', '#5c422c', '#3d2a1b', bannerG, 0, 2.0, 0, [0.09, 4.4, 0.09], 1.1);
  dynMesh(BOX, 'barjak', '#c9382c', '#962218', bannerG, 1.35, 3.4, 0, [2.6, 1.35, 0.08], 1.2);
  dynMesh(BOX, 'barjak', '#f2c842', '#c79c1c', bannerG, 1.35, 3.4, 0.05, [0.7, 0.7, 0.04], 1.0);

  // Ottoman Vizier ('vezir') in traditional white turban & robe overlooking Travnik from the fortress terrace (2, FORT_Y, -40)
  people.push({ kind: 'trvVizier', x: 2.0, y: FORT_Y + 0.04, z: -40.0, ry: 0, tag: 'vezir', robe: true });

  // Background townsfolk & café guests ('passerby')
  people.push({ kind: 'walk', x: -16, y: TOWN_Y + 0.04, z: 26, to: [-36, 26], tag: 'passerby' });
  people.push({ kind: 'chat', x: 15, y: TOWN_Y + 0.04, z: 22, ry: 0.6, tag: 'passerby', woman: true });
  people.push({ kind: 'chat', x: 16.2, y: TOWN_Y + 0.04, z: 22.4, ry: -2.4, tag: 'passerby' });
  people.push({ kind: 'stand', x: -7.5, y: TOWN_Y + 0.28, z: 14.0, ry: Math.PI / 2, tag: 'passerby' });

  // Extra hillside greenery ('hills')
  for (const [tx, ty, tz, s] of [
    [-64, FOOTHILL_Y, -34, 1.1], [-28, FOOTHILL_Y, -54, 1.05], [32, FOOTHILL_Y, -48, 1.15],
    [52, FOOTHILL_Y, -32, 1.05], [46, TOWN_Y, 32, 1.0], [-54, TOWN_Y, 36, 1.1],
  ]) {
    A(CYL, tx, ty + 1.8 * s, tz, { tag: 'hills', col: '#5c402c', bleed: '#402b1c' }, 0, 0, 0, [0.3 * s, 3.6 * s, 0.3 * s]);
    A(ICO, tx, ty + 4.3 * s, tz, { tag: 'hills', col: GRASS_H[0], bleed: GRASS_H[1], hull: true, sway: 5.5 }, 0, 0, 0, [2.2 * s, 2.0 * s, 2.2 * s]);
  }
  moteEmitters.push({ x: 0, y: 4.5, z: 6, r: 10 }, { x: -24, y: 8, z: 16, r: 8 }, { x: 24, y: 7, z: 22, r: 8 });

  // ==================== 10. ALL 68 ORBS, GATES & HAND-TUNED CAMERAS ====================
  // Zone 1: Plava voda Spring & Riverside Cafés (9)
  orbs.push({
    id: 'plava', focus: V(0, 1.8, 4), size: 9.0, tags: ['plava'], shot: 'combo',
    at: V(0, 3.6, 4), stage: 0,
    swim: { p: [0, PLAVA_WATER_Y, 4], r: 10.0 },
    view: { from: [0, 7.5, 22], to: [0, 8.5, 16], look: [0, 1.8, 0] },
    wideView: { from: [12, 14, 34], to: [-12, 14, 34], look: [0, 2.0, 10], lookTo: [0, 2.0, -4] },
  });
  orb('bistra', [0, 1.7, -3.5], 4.5, ['bistra'], 'close', 2.2, {
    requires: ['plava'], at: V(0, 3.4, -3.5), swim: { p: [0, PLAVA_WATER_Y, -3.5], r: 6.0 },
    view: { from: [3.2, 5.2, 1.8], to: [-3.2, 5.2, 1.8], look: [0, 1.6, -3.8] },
  });
  orb('pastrmka', [0, 1.8, 3.5], 3.2, ['pastrmka'], 'close', 2.4, {
    requires: ['plava'], at: V(0, 3.4, 3.5), swim: { p: [0, PLAVA_WATER_Y, 3.5], r: 6.0 },
    view: { from: [3.5, 4.4, 7.5], to: [-3.5, 4.4, 7.5], look: [0, 1.7, 3.5] },
  });
  orb('terasa', [8.5, TOWN_Y + 0.6, 12], 6.5, ['terasa'], 'close', TOWN_Y + 1.8, {
    at: V(8.5, TOWN_Y + 2.4, 12), near: { p: [8.5, TOWN_Y + 0.3, 12], r: 5.0 },
    view: { from: [0, TOWN_Y + 5.5, 24], to: [14, TOWN_Y + 5.5, 24], look: [6, TOWN_Y + 0.8, 12] },
  });
  orb('secija', [-9.8, TOWN_Y + 0.9, 8.0], 2.6, ['secija'], 'close', TOWN_Y + 1.8, {
    near: { p: [-8.5, TOWN_Y + 0.3, 8.0], r: 3.8 },
    view: { from: [-5.8, TOWN_Y + 2.6, 10.5], to: [-5.8, TOWN_Y + 2.6, 5.5], look: [-9.8, TOWN_Y + 0.9, 8.0] },
  });
  orb('suncobran', [7.8, TOWN_Y + 3.0, 16.2], 3.6, ['suncobran'], 'combo', TOWN_Y + 4.4, {
    at: V(7.8, TOWN_Y + 5.0, 16.2), near: { p: [7.8, TOWN_Y + 0.3, 16.2], r: 5.5 },
    view: { from: [3.0, TOWN_Y + 4.5, 22.0], to: [12.5, TOWN_Y + 4.5, 22.0], look: [7.8, TOWN_Y + 2.6, 16.2] },
    wideView: { from: [0, TOWN_Y + 9.0, 26.0], to: [0, TOWN_Y + 9.5, 20.0], look: [0, TOWN_Y + 2.5, 12.0], lookTo: [0, TOWN_Y + 2.5, 12.0] },
  });
  orb('cajnik', [7.75, TOWN_Y + 1.2, 7.55], 1.3, ['cajnik'], 'close', TOWN_Y + 1.9, {
    near: { p: [9.0, TOWN_Y + 0.3, 7.55], r: 3.6 },
    view: { from: [9.8, TOWN_Y + 2.0, 9.4], to: [9.8, TOWN_Y + 2.0, 5.8], look: [7.75, TOWN_Y + 1.2, 7.55] },
  });
  orb('limunada', [7.85, TOWN_Y + 1.2, 16.2], 1.3, ['limunada'], 'close', TOWN_Y + 1.9, {
    near: { p: [9.2, TOWN_Y + 0.3, 16.2], r: 3.6 },
    view: { from: [10.0, TOWN_Y + 2.0, 18.0], to: [10.0, TOWN_Y + 2.0, 14.5], look: [7.85, TOWN_Y + 1.2, 16.2] },
  });
  orb('konobarica', [9.2, TOWN_Y + 1.2, 12.0], 1.8, ['konobarica'], 'close', TOWN_Y + 2.4, {
    near: { p: [9.2, TOWN_Y + 0.3, 12.0], r: 3.8 },
    view: { from: [5.5, TOWN_Y + 2.4, 14.5], to: [5.5, TOWN_Y + 2.4, 9.5], look: [9.2, TOWN_Y + 1.2, 12.0] },
  });

  // Zone 2: Šarena džamija & Craft Arcade (11)
  orb('sarena', [-26, TOWN_Y + 7.5, 12], 12.0, ['sarena'], 'combo', TOWN_Y + 14.8, {
    at: V(-26, TOWN_Y + 2.5, 22.0), near: { p: [-26, TOWN_Y + 0.2, 22.0], r: 5.5 },
    view: { from: [-16, TOWN_Y + 10, 32], to: [-36, TOWN_Y + 10, 32], look: [-26, TOWN_Y + 7.2, 12] },
    wideView: { from: [-10, TOWN_Y + 16, 36], to: [-42, TOWN_Y + 16, 34], look: [-26, TOWN_Y + 7.0, 12], lookTo: [-26, TOWN_Y + 7.0, 12] },
  });
  orb('freska', [-26, TOWN_Y + 7.0, 17.8], 8.0, ['freska'], 'close', TOWN_Y + 9.8, {
    requires: ['sarena'], at: V(-26, TOWN_Y + 6.5, 21.5), near: { p: [-26, TOWN_Y + 0.2, 21.5], r: 7.5 },
    view: { from: [-20, TOWN_Y + 7.5, 26.5], to: [-32, TOWN_Y + 7.5, 26.5], look: [-26, TOWN_Y + 7.0, 17.8] },
  });
  orb('stub', [-26, TOWN_Y + 1.8, 17.5], 6.5, ['stub'], 'close', TOWN_Y + 3.6, {
    at: V(-28.5, TOWN_Y + 2.4, 21.2), near: { p: [-28.5, TOWN_Y + 0.2, 21.2], r: 4.5 },
    view: { from: [-20, TOWN_Y + 3.2, 25.5], to: [-32, TOWN_Y + 3.2, 25.5], look: [-26, TOWN_Y + 1.8, 17.5] },
  });
  orb('sest', [-26, TOWN_Y + 3.2, 17.55], 7.5, ['sest'], 'close', TOWN_Y + 4.4, {
    requires: ['stub'], at: V(-23.5, TOWN_Y + 2.4, 21.5), near: { p: [-23.5, TOWN_Y + 0.2, 21.5], r: 4.8 },
    view: { from: [-18, TOWN_Y + 4.0, 27.5], to: [-34, TOWN_Y + 4.0, 27.5], look: [-26, TOWN_Y + 3.0, 17.55] },
  });
  orb('trgovina', [-26, TOWN_Y + 1.6, 18.6], 7.0, ['trgovina'], 'close', TOWN_Y + 3.2, {
    at: V(-26, TOWN_Y + 2.4, 23.0), near: { p: [-26, TOWN_Y + 0.2, 23.0], r: 5.0 },
    view: { from: [-19, TOWN_Y + 3.4, 25.0], to: [-33, TOWN_Y + 3.4, 25.0], look: [-26, TOWN_Y + 1.6, 18.0] },
  });
  orb('tkanina', [-30.8, TOWN_Y + 1.1, 18.6], 1.8, ['tkanina'], 'close', TOWN_Y + 1.7, {
    near: { p: [-30.8, TOWN_Y + 0.2, 20.5], r: 3.6 },
    view: { from: [-28.8, TOWN_Y + 2.2, 21.2], to: [-32.8, TOWN_Y + 2.2, 21.2], look: [-30.8, TOWN_Y + 1.1, 18.6] },
  });
  orb('konac', [-26.45, TOWN_Y + 1.05, 18.5], 1.2, ['konac'], 'close', TOWN_Y + 1.7, {
    requires: ['krojac'], near: { p: [-26.45, TOWN_Y + 0.2, 20.5], r: 3.6 },
    view: { from: [-24.8, TOWN_Y + 1.9, 20.8], to: [-28.0, TOWN_Y + 1.9, 20.8], look: [-26.45, TOWN_Y + 1.05, 18.5] },
  });
  orb('makaze', [-25.2, TOWN_Y + 0.95, 18.6], 1.2, ['makaze'], 'close', TOWN_Y + 1.6, {
    requires: ['krojac'], near: { p: [-25.2, TOWN_Y + 0.2, 20.5], r: 3.6 },
    view: { from: [-23.8, TOWN_Y + 1.9, 20.6], to: [-26.6, TOWN_Y + 1.9, 20.6], look: [-25.2, TOWN_Y + 0.95, 18.6] },
  });
  orb('torba', [-21.9, TOWN_Y + 1.25, 18.6], 1.4, ['torba'], 'close', TOWN_Y + 1.9, {
    near: { p: [-21.9, TOWN_Y + 0.2, 20.5], r: 3.6 },
    view: { from: [-20.2, TOWN_Y + 2.0, 21.0], to: [-23.5, TOWN_Y + 2.0, 21.0], look: [-21.9, TOWN_Y + 1.25, 18.6] },
  });
  orb('papuce', [-20.5, TOWN_Y + 1.0, 18.6], 1.2, ['papuce'], 'close', TOWN_Y + 1.6, {
    near: { p: [-20.5, TOWN_Y + 0.2, 20.5], r: 3.6 },
    view: { from: [-19.0, TOWN_Y + 1.9, 20.8], to: [-22.0, TOWN_Y + 1.9, 20.8], look: [-20.5, TOWN_Y + 1.0, 18.6] },
  });
  orb('nakit', [-18.6, TOWN_Y + 0.85, 18.6], 1.3, ['nakit'], 'close', TOWN_Y + 1.5, {
    near: { p: [-18.6, TOWN_Y + 0.2, 20.4], r: 3.6 },
    view: { from: [-17.0, TOWN_Y + 1.9, 20.8], to: [-20.2, TOWN_Y + 1.9, 20.8], look: [-18.6, TOWN_Y + 0.85, 18.6] },
  });
  orb('krojac', [-26.0, TOWN_Y + 1.0, 20.0], 1.8, ['krojac'], 'close', TOWN_Y + 2.1, {
    near: { p: [-26.0, TOWN_Y + 0.2, 21.8], r: 3.8 },
    view: { from: [-23.4, TOWN_Y + 2.3, 22.8], to: [-28.6, TOWN_Y + 2.3, 22.8], look: [-26.0, TOWN_Y + 1.0, 20.0] },
  });

  // Zone 3: Clock Towers, Medresa, Ivo Andrić House & Turbe (11)
  orb('kazaljka', [-52, TOWN_Y + 12.0, 18.06], 2.4, ['kazaljka'], 'close', TOWN_Y + 12.5, {
    at: V(-52, TOWN_Y + 12.0, 20.6), near: { p: [-52, TOWN_Y + 10.0, 20.6], r: 6.5 },
    view: { from: [-49.5, TOWN_Y + 12.4, 23.0], to: [-54.5, TOWN_Y + 12.4, 23.0], look: [-52, TOWN_Y + 12.0, 18.06] },
  });
  orb('broj', [-52, TOWN_Y + 12.0, 18.02], 2.6, ['broj'], 'close', TOWN_Y + 13.8, {
    requires: ['kazaljka'], at: V(-52, TOWN_Y + 14.0, 20.6), near: { p: [-52, TOWN_Y + 10.0, 20.6], r: 7.0 },
    view: { from: [-49.0, TOWN_Y + 12.6, 23.5], to: [-55.0, TOWN_Y + 12.6, 23.5], look: [-52, TOWN_Y + 12.0, 18.02] },
  });
  orb('turbe', [-46, TOWN_Y + 2.8, 30], 5.5, ['turbe'], 'close', TOWN_Y + 6.5, {
    at: V(-46, TOWN_Y + 2.4, 35.0), near: { p: [-46, TOWN_Y + 0.2, 35.0], r: 4.8 },
    view: { from: [-38, TOWN_Y + 5.2, 39], to: [-54, TOWN_Y + 5.2, 39], look: [-46, TOWN_Y + 2.8, 30] },
  });
  orb('natpis', [-46, TOWN_Y + 3.65, 32.75], 2.0, ['natpis'], 'close', TOWN_Y + 4.4, {
    requires: ['turbe'], at: V(-46, TOWN_Y + 3.65, 34.8), near: { p: [-46, TOWN_Y + 0.2, 34.8], r: 5.5 },
    view: { from: [-43.5, TOWN_Y + 4.0, 36.6], to: [-48.5, TOWN_Y + 4.0, 36.6], look: [-46, TOWN_Y + 3.65, 32.75] },
  });
  orb('biblioteka', [-66, TOWN_Y + 3.2, 16], 7.5, ['biblioteka'], 'close', TOWN_Y + 8.0, {
    at: V(-66, TOWN_Y + 2.4, 23.0), near: { p: [-66, TOWN_Y + 0.2, 23.0], r: 5.0 },
    view: { from: [-58, TOWN_Y + 6.5, 29], to: [-74, TOWN_Y + 6.5, 29], look: [-66, TOWN_Y + 3.0, 16] },
  });
  orb('polica', [-66, TOWN_Y + 1.1, 20.1], 3.0, ['polica'], 'close', TOWN_Y + 2.6, {
    requires: ['biblioteka'], near: { p: [-66, TOWN_Y + 0.2, 22.0], r: 4.0 },
    view: { from: [-63, TOWN_Y + 2.2, 23.8], to: [-69, TOWN_Y + 2.2, 23.8], look: [-66, TOWN_Y + 1.1, 20.1] },
  });
  orb('knjiga', [-66, TOWN_Y + 1.2, 20.28], 2.4, ['knjiga'], 'close', TOWN_Y + 2.2, {
    requires: ['polica'], near: { p: [-66, TOWN_Y + 0.2, 22.0], r: 4.0 },
    view: { from: [-64, TOWN_Y + 2.0, 23.2], to: [-68, TOWN_Y + 2.0, 23.2], look: [-66, TOWN_Y + 1.2, 20.28] },
  });
  orb('pisac', [-66.0, TOWN_Y + 1.0, 2.4], 1.8, ['pisac'], 'close', TOWN_Y + 2.1, {
    near: { p: [-66.0, TOWN_Y + 0.2, 5.0], r: 4.0 },
    view: { from: [-63.2, TOWN_Y + 2.3, 6.2], to: [-68.8, TOWN_Y + 2.3, 6.2], look: [-66.0, TOWN_Y + 1.0, 2.6] },
  });
  orb('pero', [-65.9, TOWN_Y + 1.15, 2.9], 1.2, ['pero'], 'close', TOWN_Y + 1.9, {
    requires: ['pisac'], near: { p: [-66.0, TOWN_Y + 0.2, 5.0], r: 4.0 },
    view: { from: [-64.4, TOWN_Y + 1.9, 5.2], to: [-67.4, TOWN_Y + 1.9, 5.2], look: [-65.9, TOWN_Y + 1.15, 2.9] },
  });
  orb('tinta', [-65.4, TOWN_Y + 0.96, 3.35], 1.2, ['tinta'], 'close', TOWN_Y + 1.5, {
    requires: ['pisac'], near: { p: [-65.4, TOWN_Y + 0.2, 5.0], r: 3.8 },
    view: { from: [-63.8, TOWN_Y + 1.7, 5.2], to: [-66.8, TOWN_Y + 1.7, 5.2], look: [-65.4, TOWN_Y + 0.96, 3.35] },
  });
  orb('pismo', [-66.3, TOWN_Y + 0.92, 3.35], 1.2, ['pismo'], 'close', TOWN_Y + 1.5, {
    requires: ['pisac'], near: { p: [-66.3, TOWN_Y + 0.2, 5.0], r: 3.8 },
    view: { from: [-64.8, TOWN_Y + 1.8, 5.0], to: [-67.8, TOWN_Y + 1.8, 5.0], look: [-66.3, TOWN_Y + 0.92, 3.35] },
  });

  // Zone 4: Travnik Food Plaza (14: grill + dining table + cutlery + veggies)
  orb('rostilj', [26, TOWN_Y + 0.7, 18], 2.8, ['rostilj'], 'close', TOWN_Y + 1.5, {
    near: { p: [26, TOWN_Y + 0.2, 20.0], r: 4.0 },
    view: { from: [23.0, TOWN_Y + 2.4, 21.8], to: [29.0, TOWN_Y + 2.4, 21.8], look: [26, TOWN_Y + 0.8, 18] },
  });
  orb('zar', [26, TOWN_Y + 1.05, 18], 2.2, ['zar'], 'close', TOWN_Y + 1.6, {
    requires: ['rostilj'], near: { p: [26, TOWN_Y + 0.2, 20.0], r: 4.0 },
    view: { from: [24.0, TOWN_Y + 2.2, 20.8], to: [28.0, TOWN_Y + 2.2, 20.8], look: [26, TOWN_Y + 1.05, 18] },
  });
  orb('kuhar', [25.0, TOWN_Y + 1.2, 16.8], 1.8, ['kuhar'], 'close', TOWN_Y + 2.4, {
    near: { p: [25.0, TOWN_Y + 0.2, 20.0], r: 4.2 },
    view: { from: [22.4, TOWN_Y + 2.5, 20.6], to: [27.4, TOWN_Y + 2.5, 20.6], look: [25.0, TOWN_Y + 1.2, 16.8] },
  });
  orb('kuhati', [27.2, TOWN_Y + 1.15, 16.8], 1.8, ['kuhati'], 'close', TOWN_Y + 2.4, {
    requires: ['kuhar'], near: { p: [27.2, TOWN_Y + 0.2, 20.0], r: 4.2 },
    view: { from: [24.8, TOWN_Y + 2.5, 20.6], to: [29.8, TOWN_Y + 2.5, 20.6], look: [27.2, TOWN_Y + 1.15, 16.8] },
  });
  orb('tepsija', [24.6, TOWN_Y + 1.02, 25.8], 1.5, ['tepsija'], 'close', TOWN_Y + 1.6, {
    near: { p: [24.6, TOWN_Y + 0.2, 28.0], r: 3.8 },
    view: { from: [22.8, TOWN_Y + 2.2, 28.4], to: [26.4, TOWN_Y + 2.2, 28.4], look: [24.6, TOWN_Y + 1.02, 25.8] },
  });
  orb('pita', [24.6, TOWN_Y + 1.08, 25.8], 1.4, ['pita'], 'close', TOWN_Y + 1.9, {
    requires: ['tepsija'], near: { p: [24.6, TOWN_Y + 0.2, 28.0], r: 3.8 },
    view: { from: [23.2, TOWN_Y + 2.1, 28.0], to: [26.0, TOWN_Y + 2.1, 28.0], look: [24.6, TOWN_Y + 1.08, 25.8] },
  });
  orb('kajmak', [25.8, TOWN_Y + 1.05, 25.5], 1.2, ['kajmak'], 'close', TOWN_Y + 1.6, {
    near: { p: [25.8, TOWN_Y + 0.2, 28.0], r: 3.8 },
    view: { from: [24.4, TOWN_Y + 2.0, 27.8], to: [27.2, TOWN_Y + 2.0, 27.8], look: [25.8, TOWN_Y + 1.05, 25.5] },
  });
  orb('jogurt', [26.4, TOWN_Y + 1.15, 25.6], 1.2, ['jogurt'], 'close', TOWN_Y + 1.7, {
    near: { p: [26.4, TOWN_Y + 0.2, 28.0], r: 3.8 },
    view: { from: [25.0, TOWN_Y + 2.0, 27.8], to: [27.8, TOWN_Y + 2.0, 27.8], look: [26.4, TOWN_Y + 1.15, 25.6] },
  });
  orb('tanjir', [27.4, TOWN_Y + 0.98, 26.2], 1.3, ['tanjir'], 'close', TOWN_Y + 1.6, {
    near: { p: [27.4, TOWN_Y + 0.2, 28.2], r: 3.8 },
    view: { from: [26.0, TOWN_Y + 2.1, 28.5], to: [28.8, TOWN_Y + 2.1, 28.5], look: [27.4, TOWN_Y + 0.98, 26.2] },
  });
  orb('kasika', [28.12, TOWN_Y + 0.98, 26.2], 1.1, ['kasika'], 'close', TOWN_Y + 1.6, {
    requires: ['tanjir'], near: { p: [28.1, TOWN_Y + 0.2, 28.2], r: 3.8 },
    view: { from: [27.0, TOWN_Y + 1.9, 28.2], to: [29.2, TOWN_Y + 1.9, 28.2], look: [28.12, TOWN_Y + 0.98, 26.2] },
  });
  orb('viljuska', [26.88, TOWN_Y + 0.98, 26.2], 1.1, ['viljuska'], 'close', TOWN_Y + 1.6, {
    requires: ['tanjir'], near: { p: [26.9, TOWN_Y + 0.2, 28.2], r: 3.8 },
    view: { from: [25.6, TOWN_Y + 1.9, 28.2], to: [28.0, TOWN_Y + 1.9, 28.2], look: [26.88, TOWN_Y + 0.98, 26.2] },
  });
  orb('noz', [27.88, TOWN_Y + 0.98, 26.2], 1.1, ['noz'], 'close', TOWN_Y + 1.6, {
    requires: ['tanjir'], near: { p: [27.9, TOWN_Y + 0.2, 28.2], r: 3.8 },
    view: { from: [26.8, TOWN_Y + 1.9, 28.2], to: [29.0, TOWN_Y + 1.9, 28.2], look: [27.88, TOWN_Y + 0.98, 26.2] },
  });
  orb('paradajz', [33.4, TOWN_Y + 0.65, 20.0], 1.6, ['paradajz'], 'close', TOWN_Y + 1.3, {
    near: { p: [33.4, TOWN_Y + 0.2, 21.8], r: 3.6 },
    view: { from: [31.6, TOWN_Y + 2.0, 22.6], to: [35.2, TOWN_Y + 2.0, 22.6], look: [33.4, TOWN_Y + 0.65, 20.0] },
  });
  orb('krastavac', [35.4, TOWN_Y + 0.65, 20.0], 1.6, ['krastavac'], 'close', TOWN_Y + 1.3, {
    near: { p: [35.4, TOWN_Y + 0.2, 21.8], r: 3.6 },
    view: { from: [33.6, TOWN_Y + 2.0, 22.6], to: [37.2, TOWN_Y + 2.0, 22.6], look: [35.4, TOWN_Y + 0.65, 20.0] },
  });

  // Zone 5: Lašva Valley & Farmstead (8)
  orb('sljunak', [-16, 0.35, 64.5], 5.5, ['sljunak'], 'close', 1.0, {
    at: V(-16, 2.2, 64.5), swim: { p: [-16, 0, 62.0], r: 7.0 },
    view: { from: [-22, 4.2, 58], to: [-10, 4.2, 58], look: [-16, 0.35, 64.5] },
  });
  orb('hrast', [-26, TOWN_Y + 4.8, 76], 6.0, ['hrast'], 'combo', TOWN_Y + 8.6, {
    at: V(-26, TOWN_Y + 2.4, 71.0), near: { p: [-26, TOWN_Y + 0.2, 71.0], r: 4.8 },
    view: { from: [-18, TOWN_Y + 6.5, 68], to: [-34, TOWN_Y + 6.5, 68], look: [-26, TOWN_Y + 4.5, 76] },
    wideView: { from: [-14, TOWN_Y + 12, 64], to: [-44, TOWN_Y + 12, 66], look: [-30, TOWN_Y + 4.5, 78], lookTo: [-36, TOWN_Y + 4.5, 82] },
  });
  orb('breza', [32, TOWN_Y + 4.5, 74], 5.0, ['breza'], 'combo', TOWN_Y + 8.4, {
    at: V(32, TOWN_Y + 2.4, 70.0), near: { p: [32, TOWN_Y + 0.2, 70.0], r: 4.6 },
    view: { from: [25, TOWN_Y + 6.0, 66], to: [39, TOWN_Y + 6.0, 66], look: [32, TOWN_Y + 4.2, 74] },
    wideView: { from: [22, TOWN_Y + 11, 64], to: [46, TOWN_Y + 11, 66], look: [35, TOWN_Y + 4.5, 76], lookTo: [38, TOWN_Y + 4.5, 78] },
  });
  orb('sijeno', [-8, TOWN_Y + 2.0, 82], 4.2, ['sijeno'], 'close', TOWN_Y + 4.8, {
    at: V(-8, TOWN_Y + 2.4, 77.5), near: { p: [-8, TOWN_Y + 0.2, 77.5], r: 4.5 },
    view: { from: [-14, TOWN_Y + 4.2, 74], to: [-2, TOWN_Y + 4.2, 74], look: [-8, TOWN_Y + 2.0, 82] },
  });
  orb('guska', [11, TOWN_Y + 0.65, 74], 1.6, ['guska'], 'close', TOWN_Y + 1.4, {
    near: { p: [11, TOWN_Y + 0.2, 71.8], r: 3.6 },
    view: { from: [8.4, TOWN_Y + 2.0, 71.0], to: [13.6, TOWN_Y + 2.0, 71.0], look: [11, TOWN_Y + 0.65, 74] },
  });
  orb('pijetao', [16, TOWN_Y + 0.55, 76], 1.5, ['pijetao'], 'close', TOWN_Y + 1.3, {
    near: { p: [16, TOWN_Y + 0.2, 73.8], r: 3.6 },
    view: { from: [13.4, TOWN_Y + 1.9, 73.0], to: [18.6, TOWN_Y + 1.9, 73.0], look: [16, TOWN_Y + 0.55, 76] },
  });
  orb('kokos', [20.0, TOWN_Y + 0.45, 75.5], 1.4, ['kokos'], 'close', TOWN_Y + 1.1, {
    near: { p: [20.0, TOWN_Y + 0.2, 73.6], r: 3.6 },
    view: { from: [17.8, TOWN_Y + 1.8, 72.8], to: [22.2, TOWN_Y + 1.8, 72.8], look: [20.0, TOWN_Y + 0.45, 75.5] },
  });
  orb('jaje', [21.6, TOWN_Y + 0.35, 75.8], 1.2, ['jaje'], 'close', TOWN_Y + 0.9, {
    requires: ['kokos'], near: { p: [21.6, TOWN_Y + 0.2, 74.0], r: 3.4 },
    view: { from: [20.0, TOWN_Y + 1.6, 73.6], to: [23.2, TOWN_Y + 1.6, 73.6], look: [21.6, TOWN_Y + 0.35, 75.8] },
  });

  // Zone 6: Mount Vlašić Foothills & Shepherds (9)
  orb('pastir', [-38.0, FOOTHILL_Y + 1.1, -40.5], 1.8, ['pastir'], 'close', FOOTHILL_Y + 2.2, {
    near: { p: [-36.0, FOOTHILL_Y + 0.2, -40.5], r: 3.8 },
    view: { from: [-34.0, FOOTHILL_Y + 2.4, -37.5], to: [-34.0, FOOTHILL_Y + 2.4, -43.5], look: [-38.0, FOOTHILL_Y + 1.1, -40.5] },
  });
  orb('stap', [-38.0, FOOTHILL_Y + 1.0, -40.2], 1.8, ['stap'], 'close', FOOTHILL_Y + 2.0, {
    requires: ['pastir'], near: { p: [-36.0, FOOTHILL_Y + 0.2, -40.2], r: 3.8 },
    view: { from: [-34.5, FOOTHILL_Y + 2.2, -38.0], to: [-34.5, FOOTHILL_Y + 2.2, -42.5], look: [-38.0, FOOTHILL_Y + 1.0, -40.2] },
  });
  orb('stado', [-46, FOOTHILL_Y + 0.8, -42], 6.5, ['stado'], 'close', FOOTHILL_Y + 1.6, {
    near: { p: [-46, FOOTHILL_Y + 0.2, -34.5], r: 5.5 },
    view: { from: [-39, FOOTHILL_Y + 4.8, -32], to: [-53, FOOTHILL_Y + 4.8, -32], look: [-46, FOOTHILL_Y + 0.8, -42] },
  });
  orb('tor', [-46, FOOTHILL_Y + 0.8, -36], 8.5, ['tor'], 'close', FOOTHILL_Y + 1.8, {
    at: V(-46, FOOTHILL_Y + 2.4, -33.5), near: { p: [-46, FOOTHILL_Y + 0.2, -33.5], r: 5.0 },
    view: { from: [-36, FOOTHILL_Y + 6.0, -29], to: [-56, FOOTHILL_Y + 6.0, -29], look: [-46, FOOTHILL_Y + 0.8, -42] },
  });
  orb('zvonce', [-42.45, FOOTHILL_Y + 0.65, -40.0], 1.2, ['zvonce'], 'close', FOOTHILL_Y + 1.4, {
    requires: ['stado'], near: { p: [-40.5, FOOTHILL_Y + 0.2, -37.5], r: 4.0 },
    view: { from: [-40.2, FOOTHILL_Y + 1.8, -38.2], to: [-43.6, FOOTHILL_Y + 1.8, -37.6], look: [-42.45, FOOTHILL_Y + 0.65, -40.0] },
  });
  orb('bacva', [-34.5, FOOTHILL_Y + 0.7, -35.0], 1.8, ['bacva'], 'close', FOOTHILL_Y + 1.6, {
    near: { p: [-34.5, FOOTHILL_Y + 0.2, -33.2], r: 3.8 },
    view: { from: [-32.0, FOOTHILL_Y + 2.2, -32.0], to: [-37.0, FOOTHILL_Y + 2.2, -32.0], look: [-34.5, FOOTHILL_Y + 0.7, -35.0] },
  });
  orb('mlijeko', [-32.8, FOOTHILL_Y + 0.6, -35.0], 1.5, ['mlijeko'], 'close', FOOTHILL_Y + 1.4, {
    near: { p: [-32.8, FOOTHILL_Y + 0.2, -33.2], r: 3.6 },
    view: { from: [-30.6, FOOTHILL_Y + 2.0, -32.4], to: [-35.0, FOOTHILL_Y + 2.0, -32.4], look: [-32.8, FOOTHILL_Y + 0.6, -35.0] },
  });
  orb('kupina', [36, FOOTHILL_Y + 1.0, -33.0], 2.2, ['kupina'], 'close', FOOTHILL_Y + 1.8, {
    near: { p: [36, FOOTHILL_Y + 0.2, -31.2], r: 3.8 },
    view: { from: [33.4, FOOTHILL_Y + 2.2, -30.2], to: [38.6, FOOTHILL_Y + 2.2, -30.2], look: [36, FOOTHILL_Y + 1.0, -33.0] },
  });
  orb('gljiva', [43, FOOTHILL_Y + 0.5, -36.0], 2.0, ['gljiva'], 'close', FOOTHILL_Y + 1.1, {
    near: { p: [43, FOOTHILL_Y + 0.2, -34.0], r: 3.6 },
    view: { from: [40.4, FOOTHILL_Y + 2.0, -33.0], to: [45.6, FOOTHILL_Y + 2.0, -33.0], look: [43, FOOTHILL_Y + 0.5, -36.0] },
  });

  // Zone 7: Stari Grad Travnik Fortress & Balcony (5 words, Stage 2!)
  orb('balkon', [-66, TOWN_Y + 3.5, 0.4], 3.8, ['balkon'], 'close', TOWN_Y + 4.4, {
    at: V(-66, TOWN_Y + 4.5, 2.2), near: { p: [-66, TOWN_Y + 3.2, 0.6], r: 4.5 },
    view: { from: [-61, TOWN_Y + 5.2, 6.5], to: [-71, TOWN_Y + 5.2, 6.5], look: [-66, TOWN_Y + 3.5, 0.4] },
  });
  orb('muzej', [6, FORT_Y + 2.4, -50], 5.5, ['muzej'], 'close', FORT_Y + 6.8, {
    at: V(6, FORT_Y + 2.4, -44.5), near: { p: [6, FORT_Y + 0.2, -44.5], r: 4.8 },
    view: { from: [0, FORT_Y + 5.0, -40.5], to: [10, FORT_Y + 5.0, -40.5], look: [6, FORT_Y + 2.4, -50] },
  });
  orb('barjak', [-5, FORT_Y + 18.2, -52], 3.6, ['barjak'], 'close', FORT_Y + 19.2, {
    at: V(-5, FORT_Y + 18.5, -49.5), near: { p: [-5, FORT_Y + 15.2, -52], r: 6.5 },
    view: { from: [2, FORT_Y + 19.0, -44], to: [-12, FORT_Y + 19.0, -44], look: [-5, FORT_Y + 18.2, -52] },
  });
  orb('vezir', [2.0, FORT_Y + 1.1, -40.0], 1.8, ['vezir'], 'close', FORT_Y + 2.3, {
    near: { p: [2.0, FORT_Y + 0.2, -41.5], r: 3.8 },
    view: { from: [-1.0, FORT_Y + 2.5, -43.0], to: [5.0, FORT_Y + 2.5, -43.0], look: [2.0, FORT_Y + 1.1, -40.0] },
  });
  // Stage 2 (LAST WORD): 'zidine' on Stari Grad Travnik fortress
  orb('zidine', [0, FORT_Y + 4.5, -48], 16.0, ['zidine'], 'combo', FORT_Y + 1.0, {
    stage: 2, at: V(0, FORT_Y + 2.6, -44), near: { p: [0, FORT_Y + 0.2, -44], r: 6.5 },
    view: { from: [26, FORT_Y + 12, -20], to: [-26, FORT_Y + 12, -20], look: [0, FORT_Y + 4.5, -48] },
    wideView: { from: [32, FORT_Y + 18, -10], to: [-32, FORT_Y + 18, -10], look: [0, FORT_Y + 4.5, -48], lookTo: [0, FORT_Y + 4.5, -48] },
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
    start: V(0, TOWN_Y + 1.16, 10.85),
    fleur: V(0, FORT_Y + 16.5, -46),
    sunPos,
    movers: [],
    // Travnik-specific animated handles for travnik.js
    trouts,
    clockHands,
    banner: bannerG,
    farmBirds,
    moteEmitters,
  };
}
