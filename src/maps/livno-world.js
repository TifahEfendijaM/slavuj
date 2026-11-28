// Livno (winter): 3D storybook world with wild horses of the Krug plateau ('krdo', Stage 0),
// turquoise Duman karst spring ('vrelo') gushing from its limestone cavern ('spilja'),
// artisan Livanjski sir dairy ('mljekara'/'sirana'), Old Town winter hearth & feast,
// snowy village & ridge wind turbine ('vjetrenjaca'/'elisa'), mountain wildlife, and
// historic Kula Veis stone fortress ('utvrda', Stage 2) beneath snow-clad Mount Cincar ('vrhovi').
import * as THREE from 'three';
import { Builder, PAT, tag, rng, shared, paintGeo, washMat, addHull } from '../paper.js';
import S from '../settings.js';

export const TOWN_Y = 3.2;
export const BRIDGE_Y = 3.8;
export const FORT_Y = 18.0;
export const SUN_LIVNO = new THREE.Vector3(-0.66, 0.56, 0.50).normalize();

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
const CONE8 = new THREE.ConeGeometry(1, 1, 8);
const ICO = new THREE.IcosahedronGeometry(1, 1);
const SPHERE = new THREE.SphereGeometry(1, 10, 8);
const HEMI = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);

function hipRoofGeo(w, d, h) {
  const g = new THREE.ConeGeometry(1, h, 4);
  g.rotateY(Math.PI / 4);
  g.scale(w * 0.72, 1, d * 0.72);
  g.translate(0, h / 2, 0);
  return g;
}

function dynMesh(geo, tagName, col, bleed, parent, x = 0, y = 0, z = 0, s = 1, rx = 0, ry = 0, rz = 0, hull = 1.15) {
  const seed = parent ? [parent.position.x, parent.position.y, parent.position.z] : [0, 0, 0];
  const g = paintGeo(geo, { col, bleed: bleed || col, seed, radius: 12, dur: 2.6, hatch: 0.35 });
  const m = new THREE.Mesh(g, washMat(tagName));
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  if (Array.isArray(s)) m.scale.set(...s);
  else m.scale.setScalar(s);
  if (hull) addHull(m, hull);
  if (parent) parent.add(m);
  return m;
}

function buildHorseMesh(parent, tagName, bodyC, bodyB, maneC, sc = 1.0, pose = 'stand') {
  const m = (geo, col, bleed, x, y, z, rx, ry, rz, s) =>
    dynMesh(geo, tagName, col, bleed, parent, x * sc, y * sc, z * sc, [s[0] * sc, s[1] * sc, s[2] * sc], rx, ry, rz);
  const bodyTilt = pose === 'gallop' ? -0.14 : 0;
  m(SPHERE, bodyC, bodyB, 0, 1.24, 0, bodyTilt, 0, 0, [0.40, 0.42, 0.92]);
  const neckPitch = pose === 'graze' ? 0.95 : pose === 'gallop' ? 0.35 : 0.45;
  m(SPHERE, bodyC, bodyB, 0, 1.54, 0.72, neckPitch, 0, 0, [0.18, 0.48, 0.24]);
  m(SPHERE, bodyC, bodyB, 0, 1.94, 1.04, 0.55, 0, 0, [0.15, 0.17, 0.36]);
  for (const s of [-0.08, 0.08]) m(CONE8, bodyB, bodyB, s, 2.15, 0.92, -0.1, 0, 0, [0.05, 0.14, 0.05]);
  m(SPHERE, maneC, '#1c1814', 0, 1.66, 0.56, neckPitch, 0, 0, [0.07, 0.46, 0.14]);
  m(CYL, maneC, '#1c1814', 0, 0.90, -0.96, 0.32, 0, 0, [0.07, 0.78, 0.07]);
  const legSpecs = pose === 'gallop'
    ? [[-0.20, 0.60, -0.55], [0.20, 0.55, -0.35], [-0.20, -0.60, 0.48], [0.20, -0.58, 0.30]]
    : [[-0.20, 0.56, 0], [0.20, 0.56, 0], [-0.20, -0.58, 0], [0.20, -0.58, 0]];
  for (const [lx, lz, tilt] of legSpecs) {
    m(CYL, bodyC, bodyB, lx, 0.56, lz, tilt, 0, 0, [0.075, 1.06, 0.075]);
    m(CYL, '#2b2622', '#171412', lx, 0.09, lz + Math.sin(tilt) * 0.4, 0, 0, 0, [0.085, 0.18, 0.085]);
  }
}

export function buildLivnoWorld(scene) {
  const b = new Builder(), R = rng(739);
  const rr = (lo, hi) => lo + R() * (hi - lo);
  const A = (geo, x, y, z, o, ry = 0, rx = 0, rz = 0, s = 1) => b.add(geo, mat4(x, y, z, ry, rx, rz, s), o);
  const box = (w, h, d, x, y, z, o, ry = 0, rx = 0, rz = 0) => A(BOX, x, y, z, o, ry, rx, rz, [w, h, d]);

  // Crisp sunlit Dinaric winter palette & sunlight
  shared.uSunDir.value.copy(SUN_LIVNO);
  shared.uWaterDir.value.set(0, 1);
  shared.uSunShadow.value.set(0.50, 0.56, 0.68);
  shared.uSunGlow.value.set(1.0, 0.96, 0.84);
  shared.uSunTint.value.set(1.04, 1.03, 1.00);
  shared.uSkyGlow.value.set(0.92, 0.96, 1.02);

  const orbs = [], clouds = [], people = [], animals = [], smoke = [], wildHorses = [];

  const orb = (id, focus, size, tags, shot, top, extra = {}) => orbs.push({
    id, focus: V(...focus), size, tags, shot,
    at: V(focus[0], top + S.orb.hoverHeight, focus[2]), stage: 1, ...extra,
  });

  const SNOW = ['#f3f7fc', '#d2e2f2'];
  const SNOW_SH = ['#e4eef8', '#bdd4ea'];
  const STONE_K = ['#dad5c8', '#b0a99a'];
  const STONE_D = ['#a8a296', '#7d776c'];
  const WOOD = ['#8c6038', '#5e3c1e'];
  const WOOD_L = ['#c49a68', '#946e42'];
  const ROOF_W = ['#9a4834', '#6b2c1e'];
  const SLATE = ['#667482', '#44505c'];
  const PINE = ['#2f5a44', '#1c3b2b'];

  // ==================== 1. CRISP WINTER SKY, SUN & CLOUDS ====================
  tag('sky').side = THREE.BackSide; tag('sky').mode = 'one'; tag('sky').radius = 1300; tag('sky').dur = 6;
  tag('sun').mode = 'one'; tag('sun').radius = 65; tag('sun').dur = 2.5;
  A(new THREE.SphereGeometry(720, 32, 20), 0, 0, 0, { tag: 'sky', col: '#92c8ef', bleed: '#549cd6', pat: PAT.sky, hatch: 0, ink: false, solid: false });
  const sunPos = SUN_LIVNO.clone().multiplyScalar(520);
  const sunM = new THREE.Matrix4().lookAt(sunPos, V(0, 20, 0), V(0, 1, 0)).setPosition(sunPos);
  b.add(new THREE.CircleGeometry(27, 36).rotateY(Math.PI), sunM, { tag: 'sun', col: '#fff7c8', bleed: '#f8d674', hatch: 0, ink: false, solid: false });
  {
    const g = new THREE.Group(); g.position.copy(sunPos); g.lookAt(0, 20, 0);
    const inkM = new THREE.MeshBasicMaterial({ color: S.ink.color, side: THREE.DoubleSide });
    for (const r0 of [27, 28]) { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r0 + 0.7, 48), inkM); m.position.z = -0.5; g.add(m); }
    scene.add(g);
  }
  for (const [x, y, z, s] of [[-155, 78, -118, 8], [145, 84, -130, 9], [162, 74, 72, 7], [-158, 72, 84, 8], [-12, 88, -192, 9], [52, 80, 188, 8]]) {
    clouds.push({ c: V(x, y, z), r: 4.0 * s });
    const dr = -rr(14, 34);
    b.object(() => {
      for (const [ox, oy, oz, r] of [[-2.0, 0, 0, 1.4], [-0.5, 0.5, 0.2, 1.9], [1.0, 0.45, -0.2, 2.0], [2.3, 0, 0, 1.4], [0.2, -0.2, 0.5, 1.7]])
        A(ICO, x + ox * s, y + oy * s, z + oz * s, { tag: 'hills', col: '#ffffff', bleed: '#e2eef8', hull: true, hatch: 0.25, solid: false, sway: dr }, 0, 0, 0, [r * s, 0.58 * r * s, r * s]);
    });
  }

  for (const t of ['krdo', 'visoravan', 'vrelo', 'spilja', 'vjetrenjaca', 'brijeg', 'sedlo', 'lednik', 'vrhovi', 'utvrda']) {
    tag(t).mode = 'one'; tag(t).radius = 120; tag(t).holdRest = 2.4;
  }
  for (const t of ['griva', 'kopito', 'siga', 'pogaca', 'ustipak', 'corba', 'kutlaca', 'slanik']) {
    tag(t).waveDelay = 2.2;
  }

  // ==================== 2. CONTINUOUS SNOW VALLEY, BISTRICA RIVER & DINARIC PEAKS ====================
  // Continuous snow valley floor so sky NEVER peeks underneath
  box(520, 4.0, 520, 0, -4.0, 0, { tag: 'hills', col: '#d4e2ef', bleed: '#b4c9df', ink: false });
  // Bistrica riverbed
  box(32, 1.2, 230, 0, -1.35, 38, { tag: 'riverbank', col: '#287678', bleed: '#185054', ink: false });
  // West snow plateau (Krug highland & dairy yard)
  box(88, TOWN_Y + 2.0, 150, -57, (TOWN_Y - 2.0) / 2, 18, { tag: 'riverbank', col: SNOW[0], bleed: SNOW[1], pat: PAT.grass, ps: 0.45 });
  // East snow terrace (Old Town hearth, snow play & conifer ridge)
  box(88, TOWN_Y + 2.0, 150, 57, (TOWN_Y - 2.0) / 2, 18, { tag: 'riverbank', col: SNOW[0], bleed: SNOW[1], pat: PAT.grass, ps: 0.45 });
  // Limestone embankments along Bistrica
  box(2.4, TOWN_Y + 0.6, 132, -13.2, TOWN_Y / 2, 24, { tag: 'riverbank', col: STONE_K[0], bleed: STONE_K[1], pat: PAT.blocks, ps: 0.7 });
  box(2.4, TOWN_Y + 0.6, 132, 13.2, TOWN_Y / 2, 24, { tag: 'riverbank', col: STONE_K[0], bleed: STONE_K[1], pat: PAT.blocks, ps: 0.7 });

  // Emerald Bistrica River water plane
  box(26.5, 0.12, 160, 0, -0.06, 56, {
    tag: 'riverbank', col: '#28a8a8', bleed: '#147278', pat: PAT.water, hatch: 0, water: true, ink: false,
  });

  // Gentle snow-dusted stone arch footbridge over Bistrica at z = 6
  b.object(() => {
    box(27.0, 0.65, 4.2, 0, BRIDGE_Y, 6, { tag: 'riverbank', col: STONE_K[0], bleed: STONE_K[1], pat: PAT.blocks, ps: 0.7 });
    box(27.0, 0.20, 4.4, 0, BRIDGE_Y + 0.42, 6, { tag: 'riverbank', col: SNOW[0], bleed: SNOW[1], solid: false });
    for (const sz of [4.0, 8.0]) {
      box(26.5, 0.85, 0.35, 0, BRIDGE_Y + 0.75, sz, { tag: 'riverbank', col: STONE_D[0], bleed: STONE_D[1] });
    }
    for (const px of [-12.0, 12.0]) {
      box(2.2, BRIDGE_Y + 1.0, 4.8, px, BRIDGE_Y / 2, 6, { tag: 'riverbank', col: STONE_D[0], bleed: STONE_D[1] });
    }
  });

  // Grounded Dinaric snow mountains ringing the horizon (ALL HEMI seated at y = -2.5)
  for (const [x, z, sx, sy, sz] of [
    [-115, -120, 62, 46, 56], [115, -122, 60, 44, 54],
    [-132, -32, 56, 36, 62], [134, -30, 56, 36, 62],
    [-125, 72, 54, 28, 56], [125, 74, 54, 28, 56],
    [-64, 134, 58, 24, 48], [64, 134, 58, 24, 48], [0, 146, 64, 22, 46],
  ]) {
    A(HEMI, x, -2.5, z, { tag: 'hills', col: SNOW_SH[0], bleed: SNOW_SH[1], hatch: 0.25, hull: true, solid: false }, 0, 0, 0, [sx, sy, sz]);
  }
  // North Duman limestone cliff massif flanking cavern (continuous rock wall flush against spilja!)
  box(44, 22, 18, -27.2, 9.5, -27, { tag: 'hills', col: STONE_K[0], bleed: STONE_K[1], pat: PAT.blocks, ps: 0.55 });
  box(44, 20, 18, 27.2, 8.5, -27, { tag: 'hills', col: STONE_K[0], bleed: STONE_K[1], pat: PAT.blocks, ps: 0.55 });
  box(22, 15, 18, 0, 14.5, -27, { tag: 'hills', col: STONE_K[0], bleed: STONE_K[1], pat: PAT.blocks, ps: 0.55 });
  A(HEMI, -26, 20.0, -27, { tag: 'hills', col: SNOW[0], bleed: SNOW[1], solid: false }, 0, 0, 0, [20, 4.5, 12]);
  A(HEMI, 26, 18.0, -27, { tag: 'hills', col: SNOW[0], bleed: SNOW[1], solid: false }, 0, 0, 0, [20, 4.5, 12]);
  A(HEMI, 0, 21.5, -27, { tag: 'hills', col: SNOW[0], bleed: SNOW[1], solid: false }, 0, 0, 0, [14, 3.8, 11]);
  // High ridge terrain supporting Kula Veis fortress & wind turbine
  A(HEMI, 24, -2.5, -48, { tag: 'hills', col: SNOW_SH[0], bleed: SNOW_SH[1], solid: false }, 0, 0, 0, [34, 20.6, 30]);
  A(HEMI, -44, -2.5, -52, { tag: 'hills', col: SNOW_SH[0], bleed: SNOW_SH[1], solid: false }, 0, 0, 0, [30, 17.6, 28]);
  // Stepped snowy path rising up from east terrace toward Kula Veis
  for (let i = 0; i < 8; i++) {
    box(4.6, 2.2, 3.6, 20 + i * 0.5, TOWN_Y + i * 1.9, -18 - i * 3.2, { tag: 'hills', col: STONE_K[0], bleed: STONE_K[1] });
  }

  // ==================== 3. ZONE 1: KRUG PLATEAU & WILD HORSES (11 ORBS, STAGE 0: krdo) ====================
  const herdSpecs = [
    { x: -28.0, z: 16.0, ry: 0.6, c1: '#7a4b2a', c2: '#523018', mane: '#241a14', sc: 1.06, span: 3.0, sp: 0.45 },
    { x: -31.8, z: 18.4, ry: 1.1, c1: '#c89b62', c2: '#9a703e', mane: '#3a2a1c', sc: 1.00, span: 2.6, sp: 0.52 },
    { x: -25.2, z: 19.6, ry: -0.4, c1: '#ebe3d5', c2: '#c9beac', mane: '#6b5e50', sc: 0.98, span: 2.8, sp: 0.48 },
    { x: -30.0, z: 13.4, ry: 0.2, c1: '#42352d', c2: '#29201b', mane: '#181412', sc: 1.04, span: 2.4, sp: 0.50 },
  ];
  for (let i = 0; i < herdSpecs.length; i++) {
    const hs = herdSpecs[i];
    const hg = new THREE.Group();
    hg.position.set(hs.x, TOWN_Y, hs.z);
    hg.rotation.y = hs.ry;
    scene.add(hg);
    buildHorseMesh(hg, 'krdo', hs.c1, hs.c2, hs.mane, hs.sc, 'stand');
    wildHorses.push({ g: hg, home: V(hs.x, TOWN_Y, hs.z), span: hs.span, speed: hs.sp, phase: i * 1.55 });
  }

  // Lead stallion ('pastuh'), sculpted windswept mane ('griva') & hoofprints ('kopito')
  {
    const sg = new THREE.Group();
    sg.position.set(-20.0, TOWN_Y, 8.0);
    sg.rotation.y = 0.25;
    scene.add(sg);
    buildHorseMesh(sg, 'pastuh', '#5e321a', '#3d1e0e', '#1c1410', 1.14, 'stand');
  }
  b.object(() => {
    for (let i = 0; i < 6; i++) {
      A(SPHERE, -19.80 + i * 0.03, TOWN_Y + 2.28 - i * 0.11, 8.48 + i * 0.08, { tag: 'griva', col: '#221814', bleed: '#0f0a08', hull: true, orb: 'griva' }, 0.25, 0.45, 0.2, [0.10, 0.24, 0.16]);
    }
    A(CYL12, -19.52, TOWN_Y + 0.15, 9.05, { tag: 'kopito', col: '#26221e', bleed: '#12100e', hull: true, orb: 'kopito' }, 0.25, 0.18, 0, [0.16, 0.24, 0.18]);
    A(CYL12, -19.52, TOWN_Y + 0.04, 9.05, { tag: 'kopito', col: '#5a6875', bleed: '#3a4652' }, 0.25, 0, 0, [0.22, 0.04, 0.22]);
    for (let i = 1; i <= 3; i++) {
      A(CYL12, -19.52 + i * 0.45, TOWN_Y + 0.03, 9.05 + i * 0.65, { tag: 'kopito', col: '#8aa4be', bleed: '#68829e' }, 0.25, 0, 0, [0.18, 0.03, 0.22]);
    }
  });

  // Pale mare ('kobila') & chestnut foal ('zdrijebe')
  {
    const mg = new THREE.Group();
    mg.position.set(-36.0, TOWN_Y, 10.0);
    mg.rotation.y = 1.05;
    scene.add(mg);
    buildHorseMesh(mg, 'kobila', '#f2ece0', '#cfc6b6', '#b8ab96', 1.04, 'stand');

    const fg = new THREE.Group();
    fg.position.set(-34.0, TOWN_Y, 12.2);
    fg.rotation.y = 0.85;
    scene.add(fg);
    buildHorseMesh(fg, 'zdrijebe', '#b87240', '#8c5026', '#4a2b14', 0.68, 'stand');
  }

  // Galloping wild horse kicking snow spray ('galop')
  {
    const gg = new THREE.Group();
    gg.position.set(-26.0, TOWN_Y + 0.22, 26.0);
    gg.rotation.y = 1.4;
    scene.add(gg);
    buildHorseMesh(gg, 'galop', '#6e4226', '#4a2814', '#1f1612', 1.08, 'gallop');
    b.object(() => {
      for (let i = 0; i < 6; i++) {
        A(ICO, -27.4 - i * 0.52, TOWN_Y + 0.28 + (i % 3) * 0.22, 25.8 + (i % 2 ? 0.3 : -0.3), { tag: 'galop', col: '#ffffff', bleed: '#c6dff2', hull: true, orb: 'galop' }, 0, 0, 0, [0.36, 0.28, 0.36]);
      }
    });
  }

  // Krug plateau terrace & cairn ('visoravan')
  b.object(() => {
    A(HEMI, -48, TOWN_Y - 0.3, 24, { tag: 'visoravan', col: '#eaf2fa', bleed: '#c4d8ec', hull: true, orb: 'visoravan' }, 0, 0, 0, [13.0, 2.4, 11.0]);
    for (let i = 0; i < 4; i++) {
      A(ICO, -48, TOWN_Y + 2.1 + i * 0.42, 24, { tag: 'visoravan', col: STONE_K[0], bleed: STONE_K[1], hull: true }, i * 0.8, 0, 0, [0.75 - i * 0.14, 0.34, 0.75 - i * 0.14]);
    }
  });

  // Winter highland pasture clearing ('pasnjak')
  b.object(() => {
    A(CYL12, -38, TOWN_Y + 0.04, 28, { tag: 'pasnjak', col: '#c9b46e', bleed: '#9e8846', orb: 'pasnjak' }, 0, 0, 0, [6.2, 0.08, 5.2]);
    for (let i = 0; i < 14; i++) {
      const a = i * 0.9, r = 1.2 + (i % 4) * 1.1;
      A(CONE8, -38 + Math.cos(a) * r, TOWN_Y + 0.28, 28 + Math.sin(a) * r * 0.85, { tag: 'pasnjak', col: '#d4b85c', bleed: '#9c8234' }, a, 0, 0, [0.22, 0.56, 0.22]);
    }
  });

  // Stone horse watering trough ('pojilo')
  b.object(() => {
    box(3.4, 0.85, 1.35, -23.5, TOWN_Y + 0.42, 20.0, { tag: 'pojilo', col: STONE_D[0], bleed: STONE_D[1], pat: PAT.blocks, ps: 0.75, orb: 'pojilo' });
    box(2.9, 0.14, 0.92, -23.5, TOWN_Y + 0.82, 20.0, { tag: 'pojilo', col: '#48b8c4', bleed: '#248290', solid: false });
    box(0.45, 1.55, 0.45, -25.1, TOWN_Y + 0.78, 20.0, { tag: 'pojilo', col: WOOD[0], bleed: WOOD[1] });
    box(0.55, 0.14, 0.14, -24.75, TOWN_Y + 1.25, 20.0, { tag: 'pojilo', col: '#5c6670', bleed: '#3a424a', solid: false });
  });

  // Dry-stone limestone wall ('suhozid')
  b.object(() => {
    for (let i = 0; i < 12; i++) {
      const z = 14 + i * 1.65;
      box(0.85, 1.05 + (i % 2) * 0.12, 1.55, -18.2, TOWN_Y + 0.55, z, { tag: 'suhozid', col: i % 2 ? STONE_K[0] : '#cfc9bc', bleed: STONE_K[1], pat: PAT.blocks, ps: 0.8, orb: 'suhozid' });
      box(0.92, 0.18, 1.58, -18.2, TOWN_Y + 1.14 + (i % 2) * 0.12, z, { tag: 'suhozid', col: SNOW[0], bleed: SNOW[1], solid: false });
    }
  });

  // ==================== 4. ZONE 2: DUMAN KARST SPRING, ICE & WINTER WEATHER (8 ORBS) ====================
  // Protruding Duman cavern arch ('spilja')
  b.object(() => {
    box(3.2, 6.2, 4.4, -4.4, 3.1, -18.0, { tag: 'spilja', col: STONE_K[0], bleed: STONE_K[1], pat: PAT.blocks, ps: 0.65, orb: 'spilja' });
    box(3.2, 6.2, 4.4, 4.4, 3.1, -18.0, { tag: 'spilja', col: STONE_K[0], bleed: STONE_K[1], pat: PAT.blocks, ps: 0.65 });
    box(11.8, 2.8, 4.6, 0, 7.2, -18.0, { tag: 'spilja', col: STONE_K[0], bleed: STONE_K[1], pat: PAT.blocks, ps: 0.65 });
    box(5.8, 5.8, 2.2, 0, 3.0, -19.2, { tag: 'spilja', col: '#18242c', bleed: '#0d141a', solid: false });
    A(HEMI, 0, 8.4, -18.0, { tag: 'spilja', col: SNOW[0], bleed: SNOW[1], solid: false }, 0, 0, 0, [6.2, 1.8, 3.0]);
  });

  // Rushing turquoise Duman spring & foam ('vrelo')
  b.object(() => {
    box(5.6, 2.6, 2.2, 0, 1.6, -16.8, { tag: 'vrelo', col: '#34c4c4', bleed: '#1c8a92', pat: PAT.fall, solid: false, orb: 'vrelo' });
    box(6.4, 1.5, 2.8, 0, 0.85, -14.8, { tag: 'vrelo', col: '#4ad4d2', bleed: '#20949c', pat: PAT.fall, solid: false });
    for (let i = 0; i < 8; i++) {
      A(ICO, -2.8 + i * 0.8, 0.42 + (i % 2) * 0.22, -13.2 + (i % 3) * 0.35, { tag: 'vrelo', col: '#ffffff', bleed: '#b8f0f2', hull: true }, i, 0, 0, [0.55, 0.36, 0.55]);
    }
  });

  // Sparkling icicles ('siga')
  b.object(() => {
    for (let i = 0; i < 9; i++) {
      const len = 0.85 + (i % 3) * 0.42;
      A(CONE8, -3.4 + i * 0.85, 5.75 - len / 2, -15.85, { tag: 'siga', col: '#d4f2ff', bleed: '#8ecae6', hull: true, orb: 'siga' }, 0, Math.PI, 0, [0.16, len, 0.16]);
    }
  });

  // Gleaming black ice sheet ('poledica')
  b.object(() => {
    box(4.8, 0.14, 7.6, 10.2, 0.18, 12.5, { tag: 'poledica', col: '#bfe8ff', bleed: '#74bae6', solid: false, orb: 'poledica' });
    for (const [dx, dz] of [[-1.2, -1.8], [0.8, 0.5], [-0.4, 2.4]]) {
      box(1.5, 0.05, 0.12, 10.2 + dx, 0.27, 12.5 + dz, { tag: 'poledica', col: '#ffffff', bleed: '#d6f2ff', solid: false }, 0.55);
    }
  });

  // Hoarfrost birch & shrubs ('inje')
  b.object(() => {
    A(CYL, -15.5, TOWN_Y + 1.5, -8.5, { tag: 'inje', col: '#e8e4dc', bleed: '#b8b2a6', orb: 'inje' }, 0, 0, 0, [0.16, 3.0, 0.16]);
    for (const [dx, dy, dz, s] of [[0, 3.2, 0, 1.35], [-0.9, 2.5, 0.4, 0.95], [0.8, 2.4, -0.4, 0.95]]) {
      A(ICO, -15.5 + dx, TOWN_Y + dy, -8.5 + dz, { tag: 'inje', col: '#f2faff', bleed: '#b6dbf5', hull: true, sway: 0.10 }, 0, 0, 0, [s, s * 0.9, s]);
    }
  });

  // Wind-bent bura pine & frosty wind ribbons ('bura')
  b.object(() => {
    A(CYL, -22.0, TOWN_Y + 2.0, -10.5, { tag: 'bura', col: WOOD[0], bleed: WOOD[1], orb: 'bura' }, 0, 0.34, -0.25, [0.22, 4.2, 0.22]);
    for (let i = 0; i < 3; i++) {
      A(CONE8, -22.6 - i * 0.28, TOWN_Y + 3.0 + i * 1.0, -9.8 + i * 0.45, { tag: 'bura', col: PINE[0], bleed: PINE[1], hull: true, sway: 0.13 }, 0, 0.38, -0.22, [1.5 - i * 0.3, 1.8, 1.5 - i * 0.3]);
    }
    for (let i = 0; i < 3; i++) {
      box(3.8, 0.14, 0.24, -22.0, TOWN_Y + 2.6 + i * 0.85, -8.2 + i * 0.55, { tag: 'bura', col: '#bfe4ff', bleed: '#7ab8e8', solid: false }, 0.38);
    }
  });

  // Sculpted snowdrift waves ('vijavica')
  b.object(() => {
    A(HEMI, -36.0, TOWN_Y - 0.1, -24.0, { tag: 'vijavica', col: '#eef6ff', bleed: '#bdd8f2', hull: true, orb: 'vijavica' }, 0.3, 0, 0, [4.6, 2.4, 2.6]);
    A(HEMI, -33.2, TOWN_Y - 0.1, -22.2, { tag: 'vijavica', col: '#ffffff', bleed: '#cde2f5', hull: true }, 0.3, 0, 0, [3.2, 1.7, 2.0]);
    for (let i = 0; i < 5; i++) {
      A(ICO, -38.0 + i * 1.4, TOWN_Y + 1.8 + (i % 2) * 0.45, -23.0 + i * 0.3, { tag: 'vijavica', col: '#ffffff', bleed: '#c8e4fc', hull: true }, i, 0, 0, [0.42, 0.24, 0.42]);
    }
  });

  // Frosted thermometer post & ice crystals ('hladnoca')
  b.object(() => {
    box(0.32, 2.5, 0.32, 17.5, TOWN_Y + 1.25, -4.5, { tag: 'hladnoca', col: WOOD[0], bleed: WOOD[1] });
    box(0.55, 1.35, 0.16, 17.5, TOWN_Y + 1.85, -4.3, { tag: 'hladnoca', col: '#f2f7fc', bleed: '#c4d8ec', orb: 'hladnoca' });
    box(0.10, 0.88, 0.18, 17.5, TOWN_Y + 1.75, -4.22, { tag: 'hladnoca', col: '#2474c4', bleed: '#124a8a', solid: false });
    A(SPHERE, 17.5, TOWN_Y + 1.28, -4.22, { tag: 'hladnoca', col: '#2474c4', bleed: '#124a8a', hull: true }, 0, 0, 0, [0.14, 0.14, 0.14]);
    for (let i = 0; i < 4; i++) {
      const a = i * 1.57 + 0.4;
      A(CONE8, 17.5 + Math.cos(a) * 0.55, TOWN_Y + 0.45, -4.5 + Math.sin(a) * 0.55, { tag: 'hladnoca', col: '#a8e0ff', bleed: '#64b2e6', hull: true }, 0, 0, 0, [0.18, 0.85, 0.18]);
    }
  });

  // ==================== 5. ZONE 3: LIVANJSKI SIR DAIRY & WOOL CRAFT (11 ORBS) ====================
  b.object(() => {
    box(7.2, 3.6, 5.4, -47.0, TOWN_Y + 1.8, -9.0, { tag: 'mljekara', col: '#f4efe2', bleed: '#d8d0be', pat: PAT.blocks, ps: 0.7, orb: 'mljekara' });
    A(hipRoofGeo(8.2, 6.4, 2.7), -47.0, TOWN_Y + 3.6, -9.0, { tag: 'mljekara', col: SLATE[0], bleed: SLATE[1], pat: PAT.roof });
    box(1.15, 2.05, 0.16, -47.0, TOWN_Y + 1.02, -6.24, { tag: 'mljekara', col: WOOD[0], bleed: WOOD[1], solid: false });
    for (const dx of [-2.1, 2.1]) box(1.05, 1.15, 0.16, -47.0 + dx, TOWN_Y + 2.1, -6.24, { tag: 'mljekara', col: '#3a6e98', bleed: '#224868', solid: false });
    for (const dx of [-1.2, -0.5]) A(CYL12, -45.2 + dx, TOWN_Y + 0.42, -5.6, { tag: 'mljekara', col: '#cfd8e0', bleed: '#9aa6b2', hull: true }, 0, 0, 0, [0.22, 0.82, 0.22]);
  });

  b.object(() => {
    box(6.4, 3.2, 4.8, -35.5, TOWN_Y + 1.6, -9.2, { tag: 'sirana', col: STONE_K[0], bleed: STONE_K[1], pat: PAT.blocks, ps: 0.7, orb: 'sirana' });
    A(hipRoofGeo(7.4, 5.8, 2.4), -35.5, TOWN_Y + 3.2, -9.2, { tag: 'sirana', col: ROOF_W[0], bleed: ROOF_W[1], pat: PAT.roof });
    for (const sy of [0.9, 1.75]) {
      box(4.6, 0.14, 0.85, -35.5, TOWN_Y + sy, -6.55, { tag: 'sirana', col: WOOD_L[0], bleed: WOOD_L[1] });
      for (let i = 0; i < 4; i++) A(CYL12, -37.2 + i * 1.12, TOWN_Y + sy + 0.24, -6.50, { tag: 'sirana', col: '#ecc048', bleed: '#c49222', hull: true }, 0, 0, 0, [0.42, 0.36, 0.42]);
    }
  });

  b.object(() => {
    box(1.1, 0.72, 1.1, -32.2, TOWN_Y + 0.36, -4.2, { tag: 'sirutka', col: WOOD_L[0], bleed: WOOD_L[1] });
    A(CYL12, -32.2, TOWN_Y + 1.05, -4.2, { tag: 'sirutka', col: '#c4743c', bleed: '#944e20', hull: true, orb: 'sirutka' }, 0, 0, 0, [0.28, 0.64, 0.28]);
    A(CYL12, -32.2, TOWN_Y + 1.38, -4.2, { tag: 'sirutka', col: '#f8f0c6', bleed: '#dfd294', hull: true }, 0, 0, 0, [0.24, 0.08, 0.24]);
  });
  b.object(() => {
    A(CYL12, -34.2, TOWN_Y + 0.68, -4.2, { tag: 'kaca', col: WOOD[0], bleed: WOOD[1], hull: true, orb: 'kaca' }, 0, 0, 0, [0.76, 1.32, 0.76]);
    for (const hy of [0.32, 1.02]) A(CYL12, -34.2, TOWN_Y + hy, -4.2, { tag: 'kaca', col: '#3a3e44', bleed: '#1e2024' }, 0, 0, 0, [0.79, 0.08, 0.79]);
    A(CYL12, -34.2, TOWN_Y + 1.28, -4.2, { tag: 'kaca', col: '#f7f2dc', bleed: '#ded5b6' }, 0, 0, 0, [0.68, 0.08, 0.68]);
  });
  b.object(() => {
    for (let i = 0; i < 3; i++) {
      const a = i * 2.09;
      A(CYL, -36.5 + Math.cos(a) * 0.42, TOWN_Y + 0.92, -4.2 + Math.sin(a) * 0.42, { tag: 'cjedilo', col: WOOD[0], bleed: WOOD[1] }, -a, 0.22, 0, [0.06, 1.9, 0.06]);
    }
    A(CYL12, -36.5, TOWN_Y + 1.15, -4.2, { tag: 'cjedilo', col: WOOD_L[0], bleed: WOOD_L[1], hull: true, orb: 'cjedilo' }, 0, 0, 0, [0.46, 0.14, 0.46]);
    A(CONE8, -36.5, TOWN_Y + 0.85, -4.2, { tag: 'cjedilo', col: '#faf7ee', bleed: '#dad4c2', hull: true }, 0, Math.PI, 0, [0.42, 0.56, 0.42]);
  });

  // Shepherd ('coban') & wool cloak ('gunj')
  people.push({ kind: 'livShepherd', x: -40.8, y: TOWN_Y + 0.04, z: -3.5, ry: 0.3, tag: 'coban' });
  b.object(() => {
    A(CYL, -42.8, TOWN_Y + 0.88, -3.5, { tag: 'gunj', col: WOOD[0], bleed: WOOD[1] }, 0, 0, 0, [0.08, 1.75, 0.08]);
    box(0.86, 0.96, 0.32, -42.8, TOWN_Y + 1.25, -3.5, { tag: 'gunj', col: '#4a3d36', bleed: '#2e241e', hull: true, orb: 'gunj' });
    box(0.90, 0.14, 0.36, -42.8, TOWN_Y + 0.82, -3.5, { tag: 'gunj', col: '#b8382c', bleed: '#8a2218', solid: false });
    box(0.90, 0.16, 0.36, -42.8, TOWN_Y + 1.66, -3.5, { tag: 'gunj', col: '#b8382c', bleed: '#8a2218', solid: false });
  });

  // Wool ('vuna'), distaff ('preslica'), loom ('razboj'), wool blanket ('cebe')
  b.object(() => {
    A(CYL12, -45.2, TOWN_Y + 0.38, -2.0, { tag: 'vuna', col: '#b08248', bleed: '#825c2c', hull: true }, 0, 0, 0, [0.62, 0.74, 0.62]);
    for (const [dx, dy, dz, r] of [[0, 0.82, 0, 0.48], [-0.28, 0.72, 0.22, 0.34], [0.28, 0.74, -0.18, 0.34]]) {
      A(ICO, -45.2 + dx, TOWN_Y + dy, -2.0 + dz, { tag: 'vuna', col: '#fbf8ee', bleed: '#dfd8c4', hull: true, orb: 'vuna' }, 0, 0, 0, [r, r * 0.85, r]);
    }
  });
  b.object(() => {
    A(CYL, -47.0, TOWN_Y + 0.92, -2.0, { tag: 'preslica', col: WOOD[0], bleed: WOOD[1], orb: 'preslica' }, 0, 0, 0, [0.06, 1.85, 0.06]);
    box(0.32, 0.68, 0.08, -47.0, TOWN_Y + 1.55, -2.0, { tag: 'preslica', col: '#b87e42', bleed: '#8a5a28', hull: true });
    A(SPHERE, -47.0, TOWN_Y + 1.62, -1.94, { tag: 'preslica', col: '#faf5e6', bleed: '#d8d0bc', hull: true }, 0, 0, 0, [0.22, 0.30, 0.18]);
  });
  b.object(() => {
    for (const [dx, dz] of [[-1.0, -0.7], [1.0, -0.7], [-1.0, 0.7], [1.0, 0.7]]) {
      box(0.14, 1.65, 0.14, -49.6 + dx, TOWN_Y + 0.82, -1.2 + dz, { tag: 'razboj', col: WOOD[0], bleed: WOOD[1] });
    }
    box(2.15, 0.14, 0.14, -49.6, TOWN_Y + 1.58, -1.2, { tag: 'razboj', col: WOOD[0], bleed: WOOD[1] });
    box(1.88, 0.06, 1.25, -49.6, TOWN_Y + 0.92, -1.2, { tag: 'razboj', col: '#c43e2e', bleed: '#8f281c', hull: true, orb: 'razboj' });
    box(1.88, 0.08, 0.28, -49.6, TOWN_Y + 0.95, -1.2, { tag: 'razboj', col: '#f2e8cc', bleed: '#d2c6a6', solid: false });
  });
  b.object(() => {
    box(1.85, 0.56, 0.76, -47.2, TOWN_Y + 0.28, 1.8, { tag: 'cebe', col: WOOD[0], bleed: WOOD[1] });
    box(1.15, 0.28, 0.82, -47.2, TOWN_Y + 0.70, 1.8, { tag: 'cebe', col: '#b83c2e', bleed: '#88241a', hull: true, orb: 'cebe' });
    box(1.18, 0.08, 0.85, -47.2, TOWN_Y + 0.74, 1.8, { tag: 'cebe', col: '#e8b63a', bleed: '#ba8c20', solid: false });
    box(1.18, 0.08, 0.85, -47.2, TOWN_Y + 0.64, 1.8, { tag: 'cebe', col: '#2d5a82', bleed: '#1c3e5e', solid: false });
  });

  // ==================== 6. ZONE 4: OLD TOWN HEARTH & WINTER FEAST (10 ORBS) ====================
  b.object(() => {
    box(3.4, 2.8, 2.2, 26.0, TOWN_Y + 1.4, 16.5, { tag: 'kamin', col: STONE_K[0], bleed: STONE_K[1], pat: PAT.blocks, ps: 0.7, orb: 'kamin' });
    box(1.6, 2.4, 1.5, 26.0, TOWN_Y + 3.8, 16.6, { tag: 'kamin', col: STONE_D[0], bleed: STONE_D[1], pat: PAT.blocks, ps: 0.7 });
    box(1.8, 1.25, 0.45, 26.0, TOWN_Y + 0.85, 15.32, { tag: 'kamin', col: '#221c18', bleed: '#120e0c', solid: false });
    for (const [dx, h, col] of [[-0.35, 0.55, '#f26a22'], [0, 0.78, '#f8b228'], [0.35, 0.52, '#e24a1e']]) {
      A(CONE8, 26.0 + dx, TOWN_Y + 0.55 + h / 2, 15.35, { tag: 'kamin', col, bleed: '#b83214', hull: true }, 0, 0, 0, [0.24, h, 0.24]);
    }
    smoke.push({ x: 26.0, y: TOWN_Y + 5.1, z: 16.6 });
  });
  b.object(() => {
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < 4 - row; i++) {
        A(CYL, 22.8 + i * 0.34 + row * 0.16, TOWN_Y + 0.18 + row * 0.26, 16.2, { tag: 'cjepanica', col: '#8f5e34', bleed: '#623c1c', hull: true, orb: 'cjepanica' }, 0, Math.PI / 2, 0, [0.15, 1.05, 0.15]);
      }
    }
  });
  b.object(() => {
    for (const [dx, dz] of [[-2.1, -1.4], [2.1, -1.4], [-2.1, 1.4], [2.1, 1.4]]) {
      box(0.24, 2.8, 0.24, 34.0 + dx, TOWN_Y + 1.4, 19.5 + dz, { tag: 'drvarnica', col: WOOD[0], bleed: WOOD[1] });
    }
    box(4.4, 2.6, 0.22, 34.0, TOWN_Y + 1.3, 20.9, { tag: 'drvarnica', col: WOOD[0], bleed: WOOD[1] });
    box(4.8, 0.28, 3.6, 34.0, TOWN_Y + 2.95, 19.5, { tag: 'drvarnica', col: ROOF_W[0], bleed: ROOF_W[1], orb: 'drvarnica' });
    box(4.9, 0.26, 3.7, 34.0, TOWN_Y + 3.20, 19.5, { tag: 'drvarnica', col: SNOW[0], bleed: SNOW[1], solid: false });
    for (let i = 0; i < 5; i++) A(CYL, 32.4 + i * 0.8, TOWN_Y + 0.65, 19.5, { tag: 'drvarnica', col: WOOD_L[0], bleed: WOOD_L[1] }, 0, Math.PI / 2, 0, [0.32, 2.2, 0.32]);
  });
  b.object(() => {
    A(CYL12, 25.5, TOWN_Y + 0.20, 13.0, { tag: 'sac', col: '#e65a24', bleed: '#a82c12', hull: true }, 0, 0, 0, [0.85, 0.34, 0.85]);
    A(HEMI, 25.5, TOWN_Y + 0.36, 13.0, { tag: 'sac', col: '#34383e', bleed: '#1c1f24', hull: true, orb: 'sac' }, 0, 0, 0, [0.76, 0.56, 0.76]);
    A(CYL, 25.5, TOWN_Y + 0.96, 13.0, { tag: 'sac', col: '#34383e', bleed: '#1c1f24' }, 0, 0, Math.PI / 2, [0.06, 0.36, 0.06]);
  });

  // Tablecloth & 5 Bosnian dishes
  b.object(() => {
    for (const [dx, dz] of [[-2.0, -0.6], [2.0, -0.6], [-2.0, 0.6], [2.0, 0.6]]) {
      box(0.16, 0.82, 0.16, 26.0 + dx, TOWN_Y + 0.41, 8.0 + dz, { tag: 'stolnjak', col: WOOD[0], bleed: WOOD[1] });
    }
    box(4.8, 0.16, 1.75, 26.0, TOWN_Y + 0.84, 8.0, { tag: 'stolnjak', col: '#f7f2e6', bleed: '#dcd4c0', hull: true, orb: 'stolnjak' });
    box(4.84, 0.12, 1.78, 26.0, TOWN_Y + 0.72, 8.0, { tag: 'stolnjak', col: '#c43a2e', bleed: '#8f241a', solid: false });
  });
  A(HEMI, 24.2, TOWN_Y + 0.92, 8.0, { tag: 'pogaca', col: '#d99842', bleed: '#a66b22', hull: true, orb: 'pogaca' }, 0, 0, 0, [0.46, 0.28, 0.46]);
  b.object(() => {
    A(CYL12, 25.4, TOWN_Y + 0.96, 8.0, { tag: 'ustipak', col: '#f2ece0', bleed: '#cfc6b6' }, 0, 0, 0, [0.42, 0.08, 0.42]);
    for (const [dx, dy, dz] of [[-0.14, 0.10, -0.08], [0.14, 0.10, -0.06], [0, 0.10, 0.14], [0, 0.24, 0]]) {
      A(SPHERE, 25.4 + dx, TOWN_Y + 0.96 + dy, 8.0 + dz, { tag: 'ustipak', col: '#e8a83c', bleed: '#b87a1c', hull: true, orb: 'ustipak' }, 0, 0, 0, [0.18, 0.12, 0.16]);
    }
  });
  b.object(() => {
    A(CYL12, 26.6, TOWN_Y + 1.12, 8.0, { tag: 'corba', col: '#9e4426', bleed: '#6e2812', hull: true, orb: 'corba' }, 0, 0, 0, [0.38, 0.40, 0.38]);
    A(CYL12, 26.6, TOWN_Y + 1.32, 8.0, { tag: 'corba', col: '#e2a238', bleed: '#b5781c' }, 0, 0, 0, [0.32, 0.05, 0.32]);
  });
  b.object(() => {
    A(CYL, 26.95, TOWN_Y + 1.48, 8.0, { tag: 'kutlaca', col: WOOD_L[0], bleed: WOOD_L[1], hull: true, orb: 'kutlaca' }, 0, 0, -0.58, [0.04, 0.68, 0.04]);
    A(HEMI, 26.74, TOWN_Y + 1.30, 8.0, { tag: 'kutlaca', col: '#c97e38', bleed: '#94561e', hull: true }, 0, Math.PI, 0, [0.14, 0.12, 0.14]);
  });
  b.object(() => {
    A(CYL12, 27.85, TOWN_Y + 1.06, 8.0, { tag: 'slanik', col: WOOD[0], bleed: WOOD[1], hull: true, orb: 'slanik' }, 0, 0, 0, [0.20, 0.28, 0.20]);
    A(CONE8, 27.85, TOWN_Y + 1.24, 8.0, { tag: 'slanik', col: '#ffffff', bleed: '#dae6f0', hull: true }, 0, 0, 0, [0.17, 0.14, 0.17]);
  });

  // ==================== 7. ZONE 5: WINTER VILLAGE, SNOW FUN & WIND RIDGE (10 ORBS) ====================
  b.object(() => {
    box(7.8, 3.6, 5.8, -46.0, TOWN_Y + 1.8, 42.0, { tag: 'stala', col: '#8e4030', bleed: '#64261a', pat: PAT.blocks, ps: 0.7, orb: 'stala' });
    A(hipRoofGeo(8.8, 6.8, 3.0), -46.0, TOWN_Y + 3.6, 42.0, { tag: 'stala', col: SNOW[0], bleed: SNOW[1] });
    box(2.0, 2.4, 0.20, -46.0, TOWN_Y + 1.2, 39.04, { tag: 'stala', col: WOOD[0], bleed: WOOD[1], solid: false });
  });
  b.object(() => {
    A(CYL12, -36.0, TOWN_Y + 1.15, 42.0, { tag: 'stog', col: '#dfb654', bleed: '#b0892c', hull: true, orb: 'stog' }, 0, 0, 0, [2.1, 2.2, 2.1]);
    A(CONE8, -36.0, TOWN_Y + 2.85, 42.0, { tag: 'stog', col: SNOW[0], bleed: SNOW[1], hull: true }, 0, 0, 0, [2.25, 1.5, 2.25]);
    A(CYL, -36.0, TOWN_Y + 3.65, 42.0, { tag: 'stog', col: WOOD[0], bleed: WOOD[1] }, 0, 0, 0, [0.10, 1.1, 0.10]);
  });
  b.object(() => {
    A(SPHERE, 22.0, TOWN_Y + 0.65, 32.0, { tag: 'snjegovic', col: '#ffffff', bleed: '#cde0f2', hull: true }, 0, 0, 0, [0.76, 0.72, 0.76]);
    A(SPHERE, 22.0, TOWN_Y + 1.58, 32.0, { tag: 'snjegovic', col: '#ffffff', bleed: '#cde0f2', hull: true, orb: 'snjegovic' }, 0, 0, 0, [0.56, 0.54, 0.56]);
    A(SPHERE, 22.0, TOWN_Y + 2.30, 32.0, { tag: 'snjegovic', col: '#ffffff', bleed: '#cde0f2', hull: true }, 0, 0, 0, [0.38, 0.38, 0.38]);
    A(CONE8, 22.0, TOWN_Y + 2.30, 31.52, { tag: 'snjegovic', col: '#e86820', bleed: '#b84610', hull: true }, 0, -Math.PI / 2, 0, [0.08, 0.36, 0.08]);
    A(CYL12, 22.0, TOWN_Y + 1.98, 32.0, { tag: 'snjegovic', col: '#c8342c', bleed: '#8f1e18' }, 0, 0, 0, [0.42, 0.16, 0.42]);
    for (const s of [-1, 1]) A(CYL, 22.0 + s * 0.75, TOWN_Y + 1.65, 32.0, { tag: 'snjegovic', col: WOOD[0], bleed: WOOD[1] }, 0, 0, s * 0.9, [0.04, 0.85, 0.04]);
  });
  b.object(() => {
    A(HEMI, 32.0, TOWN_Y - 0.05, 34.0, { tag: 'iglu', col: '#eef6ff', bleed: '#bdd8f2', pat: PAT.blocks, ps: 0.8, hull: true, orb: 'iglu' }, 0, 0, 0, [2.7, 2.4, 2.7]);
    box(1.5, 1.25, 1.5, 32.0, TOWN_Y + 0.62, 31.3, { tag: 'iglu', col: '#e2effa', bleed: '#b4d0ea', pat: PAT.blocks, ps: 0.8 });
    box(0.95, 0.95, 0.4, 32.0, TOWN_Y + 0.48, 30.52, { tag: 'iglu', col: '#223446', bleed: '#12202c', solid: false });
  });
  b.object(() => {
    for (const dx of [-0.42, 0.42]) {
      box(0.10, 0.12, 1.95, 26.0 + dx, TOWN_Y + 0.14, 38.0, { tag: 'sanjke', col: '#c43628', bleed: '#8f2018' });
      box(0.10, 0.36, 0.10, 26.0 + dx, TOWN_Y + 0.34, 37.3, { tag: 'sanjke', col: '#c43628', bleed: '#8f2018' });
      box(0.10, 0.36, 0.10, 26.0 + dx, TOWN_Y + 0.34, 38.6, { tag: 'sanjke', col: '#c43628', bleed: '#8f2018' });
    }
    box(0.98, 0.10, 1.75, 26.0, TOWN_Y + 0.54, 38.0, { tag: 'sanjke', col: WOOD_L[0], bleed: WOOD_L[1], hull: true, orb: 'sanjke' });
  });
  b.object(() => {
    box(0.24, 1.85, 0.24, 39.2, TOWN_Y + 0.92, 28.5, { tag: 'krplje', col: WOOD[0], bleed: WOOD[1] });
    for (const dx of [-0.36, 0.36]) A(SPHERE, 39.2 + dx, TOWN_Y + 0.58, 28.05, { tag: 'krplje', col: '#b88246', bleed: '#865a28', hull: true, orb: 'krplje' }, 0, -0.25, 0, [0.24, 0.52, 0.06]);
  });
  b.object(() => {
    A(CYL12, 36.8, TOWN_Y + 0.38, 28.0, { tag: 'subara', col: WOOD[0], bleed: WOOD[1] }, 0, 0, 0, [0.36, 0.76, 0.36]);
    A(CYL12, 36.8, TOWN_Y + 0.96, 28.0, { tag: 'subara', col: '#443228', bleed: '#281c16', hull: true, orb: 'subara' }, 0, 0, 0, [0.28, 0.42, 0.28]);
    A(HEMI, 36.8, TOWN_Y + 1.15, 28.0, { tag: 'subara', col: '#5c4436', bleed: '#3a281e', hull: true }, 0, 0, 0, [0.27, 0.16, 0.27]);
  });

  // Highland ridge Wind Turbine ('vjetrenjaca') + animated 3-blade rotor ('elisa')
  b.object(() => {
    A(CYL12, -44.0, 23.0, -52.0, { tag: 'vjetrenjaca', col: '#f2f6fa', bleed: '#c8d6e4', hull: true, orb: 'vjetrenjaca' }, 0, 0, 0, [0.95, 17.5, 0.95]);
    box(2.2, 1.8, 3.6, -44.0, 31.8, -51.6, { tag: 'vjetrenjaca', col: '#e8eef5', bleed: '#bccad8', hull: true });
  });
  const elisaWheel = new THREE.Group();
  elisaWheel.position.set(-44.0, 31.8, -49.6);
  scene.add(elisaWheel);
  dynMesh(SPHERE, 'elisa', '#d43a2e', '#982218', elisaWheel, 0, 0, 0, [0.9, 0.9, 1.2]);
  for (let i = 0; i < 3; i++) {
    const bladeG = new THREE.Group();
    bladeG.rotation.z = (i / 3) * Math.PI * 2;
    elisaWheel.add(bladeG);
    dynMesh(BOX, 'elisa', '#ffffff', '#cfe0ee', bladeG, 0, 4.4, 0.25, [0.68, 8.2, 0.16]);
    dynMesh(BOX, 'elisa', '#d43a2e', '#982218', bladeG, 0, 8.0, 0.26, [0.56, 1.4, 0.18]);
  }

  // Rolling snow-draped hillock ('brijeg') cleanly east of snow-play village
  b.object(() => {
    A(HEMI, 58.0, TOWN_Y - 0.5, 28.0, { tag: 'brijeg', col: '#edf5fc', bleed: '#c2d8ee', hull: true, orb: 'brijeg' }, 0, 0, 0, [11.0, 5.8, 10.0]);
    box(2.0, 0.46, 0.72, 58.0, TOWN_Y + 5.45, 28.0, { tag: 'brijeg', col: WOOD[0], bleed: WOOD[1] });
  });

  // ==================== 8. ZONE 6: ALPINE CONIFERS, WILDLIFE & EXPLORERS (10 ORBS) ====================
  b.object(() => {
    for (const [dx, dy, dz, r] of [[0, 0.55, 0, 0.95], [-0.75, 0.42, 0.35, 0.68], [0.72, 0.45, -0.32, 0.68]]) {
      A(ICO, 38.0 + dx, TOWN_Y + dy, 2.0 + dz, { tag: 'kleka', col: '#2f6046', bleed: '#1b402c', hull: true, sway: 0.08, orb: 'kleka' }, 0, 0, 0, [r * 1.2, r * 0.72, r * 1.2]);
    }
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05;
      A(SPHERE, 38.0 + Math.cos(a) * 0.72, TOWN_Y + 0.85, 2.0 + Math.sin(a) * 0.68, { tag: 'kleka', col: '#3b649c', bleed: '#22406e', hull: true }, 0, 0, 0, [0.11, 0.11, 0.11]);
    }
  });
  b.object(() => {
    A(CYL, 44.0, TOWN_Y + 2.8, -6.0, { tag: 'aris', col: WOOD[0], bleed: WOOD[1] }, 0, 0, 0, [0.28, 5.6, 0.28]);
    for (let i = 0; i < 4; i++) {
      A(CONE8, 44.0, TOWN_Y + 3.2 + i * 1.45, -6.0, { tag: 'aris', col: '#cf8e34', bleed: '#9a621a', hull: true, sway: 0.12, orb: 'aris' }, 0, 0, 0, [2.2 - i * 0.38, 2.1, 2.2 - i * 0.38]);
    }
  });
  b.object(() => {
    A(SPHERE, 46.0, TOWN_Y + 0.68, 10.0, { tag: 'vepar', col: '#4a3c34', bleed: '#2e241e', hull: true, orb: 'vepar' }, -0.8, 0, 0, [0.46, 0.44, 0.78]);
    A(CONE8, 45.35, TOWN_Y + 0.66, 10.55, { tag: 'vepar', col: '#3a2e28', bleed: '#221814', hull: true }, -0.8, Math.PI / 2, 0, [0.22, 0.56, 0.22]);
    for (const s of [-0.14, 0.14]) A(CONE8, 45.15 + s, TOWN_Y + 0.72, 10.75, { tag: 'vepar', col: '#f5efe2', bleed: '#d6ccb8', hull: true }, 0, 0, s * 2.5, [0.05, 0.22, 0.05]);
    for (const [dx, dz] of [[-0.2, -0.35], [0.2, -0.35], [-0.2, 0.35], [0.2, 0.35]]) A(CYL, 46.0 + dx, TOWN_Y + 0.28, 10.0 + dz, { tag: 'vepar', col: '#332822', bleed: '#1e1612' }, 0, 0, 0, [0.08, 0.54, 0.08]);
  });
  b.object(() => {
    A(SPHERE, 39.0, TOWN_Y + 0.98, -14.0, { tag: 'srndac', col: '#a46c3c', bleed: '#784a22', hull: true, orb: 'srndac' }, -0.5, 0, 0, [0.28, 0.32, 0.66]);
    A(CYL, 38.7, TOWN_Y + 1.48, -13.45, { tag: 'srndac', col: '#a46c3c', bleed: '#784a22', hull: true }, -0.5, 0.3, 0, [0.11, 0.58, 0.11]);
    A(SPHERE, 38.55, TOWN_Y + 1.82, -13.25, { tag: 'srndac', col: '#a46c3c', bleed: '#784a22', hull: true }, -0.5, 0, 0, [0.13, 0.14, 0.24]);
    for (const s of [-0.12, 0.12]) A(CYL, 38.55 + s, TOWN_Y + 2.12, -13.30, { tag: 'srndac', col: '#6e5034', bleed: '#4a341e' }, 0, 0, s * 2.4, [0.025, 0.42, 0.025]);
    for (const [dx, dz] of [[-0.14, -0.36], [0.14, -0.36], [-0.14, 0.36], [0.14, 0.36]]) A(CYL, 39.0 + dx, TOWN_Y + 0.46, -14.0 + dz, { tag: 'srndac', col: '#8c5a30', bleed: '#623c1c' }, 0, 0, 0, [0.055, 0.92, 0.055]);
  });
  b.object(() => {
    A(CYL, 48.0, TOWN_Y + 0.24, -15.5, { tag: 'tetrijeb', col: WOOD[0], bleed: WOOD[1] }, 0.3, Math.PI / 2, 0, [0.24, 2.2, 0.24]);
    A(SPHERE, 48.0, TOWN_Y + 0.78, -15.5, { tag: 'tetrijeb', col: '#2d3238', bleed: '#161a1e', hull: true, orb: 'tetrijeb' }, -0.4, 0, 0, [0.28, 0.30, 0.42]);
    A(SPHERE, 47.82, TOWN_Y + 1.18, -15.22, { tag: 'tetrijeb', col: '#243c32', bleed: '#12221c', hull: true }, 0, 0, 0, [0.14, 0.18, 0.16]);
    A(BOX, 47.82, TOWN_Y + 1.28, -15.16, { tag: 'tetrijeb', col: '#d42c24', bleed: '#981a14' }, 0, 0, 0, [0.16, 0.06, 0.08]);
    A(CYL12, 48.28, TOWN_Y + 0.98, -15.92, { tag: 'tetrijeb', col: '#24282e', bleed: '#101216', hull: true }, -0.4, 0.72, 0, [0.46, 0.06, 0.46]);
  });
  b.object(() => {
    box(0.24, 1.45, 0.24, 19.5, TOWN_Y + 0.72, 14.0, { tag: 'zeba', col: WOOD[0], bleed: WOOD[1] });
    A(SPHERE, 19.5, TOWN_Y + 1.62, 14.0, { tag: 'zeba', col: '#c45e3c', bleed: '#8f3a20', hull: true, orb: 'zeba' }, -0.4, 0, 0, [0.16, 0.15, 0.24]);
    A(SPHERE, 19.42, TOWN_Y + 1.78, 14.16, { tag: 'zeba', col: '#5a7492', bleed: '#3a5068', hull: true }, 0, 0, 0, [0.11, 0.11, 0.12]);
    A(CONE8, 19.38, TOWN_Y + 1.78, 14.30, { tag: 'zeba', col: '#e4b842', bleed: '#b48a20' }, 0, Math.PI / 2, 0, [0.04, 0.12, 0.04]);
  });
  b.object(() => {
    box(0.85, 1.35, 0.85, 18.2, TOWN_Y + 0.68, -14.2, { tag: 'cavka', col: STONE_K[0], bleed: STONE_K[1] });
    A(SPHERE, 18.2, TOWN_Y + 1.56, -14.2, { tag: 'cavka', col: '#2a2e36', bleed: '#14181e', hull: true, orb: 'cavka' }, 0.3, 0, 0, [0.18, 0.18, 0.30]);
    A(SPHERE, 18.26, TOWN_Y + 1.80, -13.96, { tag: 'cavka', col: '#7c8694', bleed: '#545e6a', hull: true }, 0, 0, 0, [0.12, 0.12, 0.14]);
  });
  b.object(() => {
    A(HEMI, 50.0, TOWN_Y - 0.05, 2.0, { tag: 'jazbina', col: STONE_D[0], bleed: STONE_D[1], hull: true, orb: 'jazbina' }, 0, 0, 0, [2.6, 1.9, 2.4]);
    A(HEMI, 50.0, TOWN_Y + 1.45, 2.0, { tag: 'jazbina', col: SNOW[0], bleed: SNOW[1] }, 0, 0, 0, [2.1, 0.65, 1.9]);
    box(1.35, 1.15, 0.65, 47.6, TOWN_Y + 0.56, 2.0, { tag: 'jazbina', col: '#181412', bleed: '#0c0a08', solid: false });
  });
  people.push({ kind: 'livHiker', x: 32.0, y: TOWN_Y + 0.04, z: -14.5, ry: -0.4, tag: 'planinar' });
  people.push({ kind: 'livHunter', x: 45.0, y: TOWN_Y + 0.04, z: -14.5, ry: -0.9, tag: 'lovac' });

  // ==================== 9. ZONE 7: VULTURE, MOUNT CINCAR & KULA VEIS FORTRESS (5 ORBS, STAGE 2) ====================
  const vulture = new THREE.Group();
  vulture.position.set(-16.0, 21.8, -23.0);
  vulture.rotation.y = 0.4;
  scene.add(vulture);
  dynMesh(SPHERE, 'sup', '#7e664a', '#52402c', vulture, 0, 0.55, 0, [0.42, 0.52, 0.56], 0.2);
  dynMesh(SPHERE, 'sup', '#efe8da', '#ccc2b0', vulture, 0, 1.05, 0.22, [0.34, 0.24, 0.34]);
  dynMesh(SPHERE, 'sup', '#c8beb0', '#968c7e', vulture, 0, 1.32, 0.36, [0.16, 0.16, 0.22]);
  dynMesh(CONE8, 'sup', '#383430', '#1c1a18', vulture, 0, 1.28, 0.58, [0.08, 0.26, 0.08], Math.PI / 2);
  for (const s of [-1, 1]) dynMesh(BOX, 'sup', '#5a4632', '#3a2a1c', vulture, s * 1.15, 0.65, -0.05, [1.85, 0.14, 0.65], 0, 0, s * -0.22);

  b.object(() => {
    A(HEMI, -14, -2.5, -76, { tag: 'sedlo', col: '#e8f2fc', bleed: '#bdd4ec', solid: false }, 0, 0, 0, [26, 28, 22]);
    A(HEMI, 14, -2.5, -76, { tag: 'sedlo', col: '#e8f2fc', bleed: '#bdd4ec', solid: false }, 0, 0, 0, [26, 28, 22]);
    box(24, 18, 16, 0, 8.0, -76, { tag: 'sedlo', col: '#f4f9ff', bleed: '#c8def2', solid: false, orb: 'sedlo' });
  });
  b.object(() => {
    A(HEMI, -32, 10.0, -104, { tag: 'lednik', col: '#98daf8', bleed: '#54aee2', hull: true, solid: false, orb: 'lednik' }, 0.2, 0, 0, [24, 18, 18]);
    A(HEMI, -26, 14.0, -98, { tag: 'lednik', col: '#d8f4ff', bleed: '#8ccff2', hull: true, solid: false }, 0.2, 0, 0, [14, 9, 12]);
  });
  b.object(() => {
    A(CONE8, -16, 28.0, -138, { tag: 'vrhovi', col: '#ffffff', bleed: '#c2dcf5', hatch: 0.22, hull: true, solid: false, orb: 'vrhovi' }, 0.3, 0, 0, [34, 62, 30]);
    A(CONE8, 20, 24.0, -134, { tag: 'vrhovi', col: '#f2f8ff', bleed: '#b8d4ee', hatch: 0.22, hull: true, solid: false }, 0.8, 0, 0, [30, 54, 28]);
    A(HEMI, 0, -2.5, -136, { tag: 'vrhovi', col: SNOW_SH[0], bleed: SNOW_SH[1], solid: false }, 0, 0, 0, [68, 34, 34]);
  });
  // Stage 2: Old Town Livno Kula Veis stone fortress ('utvrda')
  b.object(() => {
    box(16.0, 5.2, 13.0, 24.0, FORT_Y + 2.6, -48.0, { tag: 'utvrda', col: STONE_K[0], bleed: STONE_K[1], pat: PAT.blocks, ps: 0.65, orb: 'utvrda' });
    for (let i = -3; i <= 3; i++) {
      box(1.3, 1.1, 0.75, 24.0 + i * 2.2, FORT_Y + 5.75, -41.6, { tag: 'utvrda', col: STONE_D[0], bleed: STONE_D[1] });
      box(1.3, 1.1, 0.75, 24.0 + i * 2.2, FORT_Y + 5.75, -54.4, { tag: 'utvrda', col: STONE_D[0], bleed: STONE_D[1] });
    }
    box(5.8, 10.6, 5.8, 24.0, FORT_Y + 8.6, -48.0, { tag: 'utvrda', col: '#e2dcd0', bleed: '#b8b0a0', pat: PAT.blocks, ps: 0.65 });
    A(hipRoofGeo(6.8, 6.8, 3.2), 24.0, FORT_Y + 13.9, -48.0, { tag: 'utvrda', col: SLATE[0], bleed: SLATE[1], pat: PAT.roof });
    box(2.4, 3.2, 0.45, 24.0, FORT_Y + 1.6, -41.35, { tag: 'utvrda', col: '#2c241e', bleed: '#16120e', solid: false });
    for (const dx of [-1.2, 1.2]) box(0.75, 1.1, 0.25, 24.0 + dx, FORT_Y + 11.2, -45.02, { tag: 'utvrda', col: '#242a32', solid: false });
  });

  // ==================== 10. SCENIC OLD TOWN HOUSES, SNOWY CONIFERS & PASSERSBY ====================
  for (const [hx, hz, w, d, h] of [[24, -4, 6.4, 5.2, 3.2], [44, 40, 6.8, 5.4, 3.0], [-24, 44, 6.6, 5.2, 3.0], [52, -26, 6.4, 5.2, 3.0]]) {
    box(w, 1.4, d, hx, TOWN_Y + 0.7, hz, { tag: 'town', col: STONE_K[0], bleed: STONE_K[1], pat: PAT.blocks, ps: 0.7 });
    box(w + 0.4, h, d + 0.4, hx, TOWN_Y + 1.4 + h / 2, hz, { tag: 'town', col: '#f4efe2', bleed: '#d4ccbc' });
    A(hipRoofGeo(w + 1.2, d + 1.2, 2.7), hx, TOWN_Y + 1.4 + h, hz, { tag: 'town', col: ROOF_W[0], bleed: ROOF_W[1], pat: PAT.roof });
    box(0.95, 1.15, 0.18, hx - w * 0.24, TOWN_Y + 2.9, hz + d / 2 + 0.24, { tag: 'town', col: '#f2c45a', solid: false });
    box(0.95, 1.15, 0.18, hx + w * 0.24, TOWN_Y + 2.9, hz + d / 2 + 0.24, { tag: 'town', col: '#f2c45a', solid: false });
    box(0.92, 1.38, 0.18, hx, TOWN_Y + 0.7, hz + d / 2 + 0.08, { tag: 'town', col: WOOD[0], solid: false });
  }
  for (const [tx, ty, tz, s] of [
    [-54, TOWN_Y, 10, 1.15], [-56, TOWN_Y, 26, 1.2], [-22, TOWN_Y, 36, 1.1],
    [18, TOWN_Y, 22, 1.1], [54, TOWN_Y, 16, 1.2], [54, TOWN_Y, -10, 1.25],
    [12, FORT_Y - 2, -46, 1.05], [36, FORT_Y - 2, -48, 1.05],
    [-34, 15.0, -48, 1.1], [-54, 15.0, -50, 1.1],
  ]) {
    A(CYL, tx, ty + 1.5 * s, tz, { tag: 'hills', col: WOOD[0], bleed: WOOD[1] }, 0, 0, 0, [0.24 * s, 3.0 * s, 0.24 * s]);
    A(CONE8, tx, ty + 3.6 * s, tz, { tag: 'hills', col: PINE[0], bleed: PINE[1], hull: true, sway: 0.11 }, 0, 0, 0, [1.85 * s, 3.8 * s, 1.85 * s]);
    A(CONE8, tx, ty + 4.9 * s, tz, { tag: 'hills', col: SNOW[0], bleed: SNOW[1], hull: true, sway: 0.11 }, 0, 0, 0, [1.35 * s, 2.2 * s, 1.35 * s]);
  }
  for (const [lx, lz] of [[-14.5, 4.0], [14.5, 4.0], [-14.5, 8.0], [14.5, 8.0]]) {
    A(CYL, lx, TOWN_Y + 1.3, lz, { tag: 'props', col: '#343a40', bleed: '#1c2024' }, 0, 0, 0, [0.09, 2.6, 0.09]);
    A(SPHERE, lx, TOWN_Y + 2.72, lz, { tag: 'props', col: '#ffe294', bleed: '#d8a638', hull: true }, 0, 0, 0, [0.22, 0.24, 0.22]);
  }
  people.push({ kind: 'walk', x: -8, y: BRIDGE_Y + 0.56, z: 6.0, to: [8, 6.0], tag: 'passerby', woman: true, beanie: true });
  people.push({ kind: 'chat', x: 22.8, y: TOWN_Y + 0.04, z: 10.6, ry: 0.8, tag: 'passerby', beanie: true });
  people.push({ kind: 'chat', x: 24.0, y: TOWN_Y + 0.04, z: 11.2, ry: -2.2, tag: 'passerby', woman: true, beanie: true });

  // ==================== 11. ALL 65 ORBS, GATES & HAND-TUNED CAMERAS ====================
  // Zone 1 (11, Stage 0: krdo)
  orbs.push({
    id: 'krdo', focus: V(-28.5, TOWN_Y + 1.3, 16.5), size: 9.0, tags: ['krdo'], shot: 'combo',
    at: V(-22.5, TOWN_Y + 2.4, 16.5), stage: 0,
    near: { p: [-22.5, TOWN_Y + 0.2, 16.5], r: 5.5 },
    view: { from: [-20, TOWN_Y + 4.4, 24], to: [-20, TOWN_Y + 4.4, 10], look: [-29, TOWN_Y + 1.2, 16.5] },
    wideView: { from: [-14, TOWN_Y + 10, 30], to: [-14, TOWN_Y + 10, 4], look: [-29, TOWN_Y + 1.3, 16.5], lookTo: [-30, TOWN_Y + 1.3, 16.5] },
  });
  orb('pastuh', [-20.0, TOWN_Y + 1.4, 8.0], 3.2, ['pastuh'], 'close', TOWN_Y + 2.6, {
    at: V(-17.0, TOWN_Y + 2.2, 8.0), near: { p: [-17.0, TOWN_Y + 0.2, 8.0], r: 4.2 },
    view: { from: [-16.2, TOWN_Y + 2.4, 11.2], to: [-16.2, TOWN_Y + 2.4, 5.2], look: [-20.0, TOWN_Y + 1.4, 8.0] },
  });
  orb('kobila', [-36.0, TOWN_Y + 1.3, 10.0], 3.0, ['kobila'], 'close', TOWN_Y + 2.5, {
    at: V(-32.5, TOWN_Y + 2.2, 10.0), near: { p: [-32.5, TOWN_Y + 0.2, 10.0], r: 4.2 },
    view: { from: [-32.0, TOWN_Y + 2.4, 13.0], to: [-32.0, TOWN_Y + 2.4, 7.0], look: [-36.0, TOWN_Y + 1.3, 10.0] },
  });
  orb('zdrijebe', [-34.0, TOWN_Y + 0.9, 12.2], 2.2, ['zdrijebe'], 'close', TOWN_Y + 1.8, {
    requires: ['kobila'], near: { p: [-31.5, TOWN_Y + 0.2, 12.2], r: 3.8 },
    view: { from: [-31.2, TOWN_Y + 1.9, 14.5], to: [-31.2, TOWN_Y + 1.9, 10.2], look: [-34.0, TOWN_Y + 0.9, 12.2] },
  });
  orb('griva', [-19.72, TOWN_Y + 2.0, 8.68], 1.3, ['griva'], 'close', TOWN_Y + 2.6, {
    requires: ['pastuh'], near: { p: [-17.4, TOWN_Y + 0.2, 8.68], r: 3.8 },
    view: { from: [-17.6, TOWN_Y + 2.4, 10.2], to: [-17.6, TOWN_Y + 2.4, 7.2], look: [-19.72, TOWN_Y + 2.0, 8.68] },
  });
  orb('kopito', [-19.52, TOWN_Y + 0.2, 9.05], 1.4, ['kopito'], 'close', TOWN_Y + 1.1, {
    requires: ['pastuh'], near: { p: [-17.4, TOWN_Y + 0.2, 9.05], r: 3.8 },
    view: { from: [-17.2, TOWN_Y + 1.4, 11.2], to: [-17.2, TOWN_Y + 1.4, 7.8], look: [-19.52, TOWN_Y + 0.2, 9.05] },
  });
  orb('galop', [-26.5, TOWN_Y + 1.3, 26.0], 4.5, ['galop'], 'close', TOWN_Y + 2.6, {
    at: V(-23.0, TOWN_Y + 2.2, 26.0), near: { p: [-23.0, TOWN_Y + 0.2, 26.0], r: 4.5 },
    view: { from: [-22.5, TOWN_Y + 2.8, 30.2], to: [-22.5, TOWN_Y + 2.8, 22.0], look: [-26.8, TOWN_Y + 1.2, 26.0] },
  });
  orb('visoravan', [-48.0, TOWN_Y + 2.4, 24.0], 11.0, ['visoravan'], 'combo', TOWN_Y + 4.4, {
    at: V(-41.0, TOWN_Y + 2.8, 24.0), near: { p: [-41.0, TOWN_Y + 0.2, 24.0], r: 5.2 },
    view: { from: [-34, TOWN_Y + 6.5, 34], to: [-34, TOWN_Y + 6.5, 14], look: [-48, TOWN_Y + 2.0, 24] },
    wideView: { from: [-24, TOWN_Y + 12, 38], to: [-24, TOWN_Y + 12, 10], look: [-48, TOWN_Y + 2.0, 24], lookTo: [-48, TOWN_Y + 2.0, 24] },
  });
  orb('pasnjak', [-38.0, TOWN_Y + 0.4, 28.0], 6.5, ['pasnjak'], 'close', TOWN_Y + 1.8, {
    near: { p: [-32.5, TOWN_Y + 0.2, 28.0], r: 4.8 },
    view: { from: [-30.0, TOWN_Y + 4.0, 34.0], to: [-30.0, TOWN_Y + 4.0, 22.0], look: [-38.0, TOWN_Y + 0.4, 28.0] },
  });
  orb('pojilo', [-23.5, TOWN_Y + 0.8, 20.0], 2.8, ['pojilo'], 'close', TOWN_Y + 1.8, {
    near: { p: [-23.5, TOWN_Y + 0.2, 23.0], r: 4.0 },
    view: { from: [-21.0, TOWN_Y + 2.4, 23.4], to: [-26.0, TOWN_Y + 2.4, 23.4], look: [-23.5, TOWN_Y + 0.8, 20.0] },
  });
  orb('suhozid', [-18.2, TOWN_Y + 0.8, 22.5], 6.0, ['suhozid'], 'close', TOWN_Y + 1.9, {
    near: { p: [-15.2, TOWN_Y + 0.2, 22.5], r: 4.2 },
    view: { from: [-14.0, TOWN_Y + 2.8, 28.0], to: [-14.0, TOWN_Y + 2.8, 17.0], look: [-18.2, TOWN_Y + 0.8, 22.5] },
  });

  // Zone 2 (8)
  orb('vrelo', [0, 1.8, -15.5], 7.5, ['vrelo'], 'combo', 4.6, {
    at: V(0, 3.8, -10.5), swim: { p: [0, 0, -9.0], r: 9.0 },
    view: { from: [-7.5, 5.4, -5.5], to: [7.5, 5.4, -5.5], look: [0, 1.8, -15.5] },
    wideView: { from: [-12, 10, 4], to: [12, 10, 4], look: [0, 2.4, -15.5], lookTo: [0, 2.4, -15.5] },
  });
  orb('spilja', [0, 4.2, -18.0], 8.5, ['spilja'], 'combo', 6.4, {
    at: V(0, 6.0, -11.5), swim: { p: [0, 0, -10.0], r: 9.5 },
    view: { from: [-8.5, 6.8, -5.0], to: [8.5, 6.8, -5.0], look: [0, 4.2, -18.0] },
    wideView: { from: [-14, 12, 6], to: [14, 12, 6], look: [0, 4.4, -18.0], lookTo: [0, 4.4, -18.0] },
  });
  orb('siga', [-1.7, 5.2, -15.85], 2.8, ['siga'], 'close', 6.2, {
    requires: ['spilja'], at: V(-1.7, 5.6, -12.0), swim: { p: [-1.7, 0, -11.0], r: 7.0 },
    view: { from: [-4.5, 5.8, -10.8], to: [1.5, 5.8, -10.8], look: [-1.7, 5.2, -15.85] },
  });
  orb('poledica', [10.2, 0.25, 12.5], 4.8, ['poledica'], 'close', 1.8, {
    at: V(7.5, 2.2, 12.5), swim: { p: [7.5, 0, 12.5], r: 6.5 },
    view: { from: [4.5, 3.2, 16.5], to: [4.5, 3.2, 8.5], look: [10.2, 0.25, 12.5] },
  });
  orb('inje', [-15.5, TOWN_Y + 2.2, -8.5], 3.4, ['inje'], 'close', TOWN_Y + 4.0, {
    near: { p: [-18.5, TOWN_Y + 0.2, -8.5], r: 4.5 },
    view: { from: [-19.5, TOWN_Y + 3.2, -4.8], to: [-19.5, TOWN_Y + 3.2, -12.2], look: [-15.5, TOWN_Y + 2.2, -8.5] },
  });
  orb('bura', [-22.4, TOWN_Y + 3.2, -9.8], 4.8, ['bura'], 'close', TOWN_Y + 5.2, {
    near: { p: [-22.4, TOWN_Y + 0.2, -5.0], r: 4.8 },
    view: { from: [-18.5, TOWN_Y + 4.4, -3.5], to: [-26.5, TOWN_Y + 4.4, -3.5], look: [-22.4, TOWN_Y + 3.2, -9.8] },
  });
  orb('vijavica', [-35.2, TOWN_Y + 1.6, -23.4], 5.5, ['vijavica'], 'close', TOWN_Y + 3.0, {
    near: { p: [-35.2, TOWN_Y + 0.2, -18.5], r: 5.0 },
    view: { from: [-31.0, TOWN_Y + 3.6, -17.5], to: [-39.5, TOWN_Y + 3.6, -17.5], look: [-35.2, TOWN_Y + 1.4, -23.4] },
  });
  orb('hladnoca', [17.5, TOWN_Y + 1.6, -4.5], 2.0, ['hladnoca'], 'close', TOWN_Y + 2.6, {
    near: { p: [16.5, TOWN_Y + 0.2, -1.5], r: 3.8 },
    view: { from: [15.2, TOWN_Y + 2.2, -1.4], to: [18.4, TOWN_Y + 2.2, -1.4], look: [17.5, TOWN_Y + 1.6, -4.5] },
  });

  // Zone 3 (11)
  orb('mljekara', [-47.0, TOWN_Y + 2.8, -9.0], 8.0, ['mljekara'], 'close', TOWN_Y + 6.4, {
    at: V(-47.0, TOWN_Y + 2.6, -4.2), near: { p: [-47.0, TOWN_Y + 0.2, -4.2], r: 5.0 },
    view: { from: [-41.0, TOWN_Y + 4.8, -1.2], to: [-53.0, TOWN_Y + 4.8, -1.2], look: [-47.0, TOWN_Y + 2.6, -9.0] },
  });
  orb('sirana', [-35.5, TOWN_Y + 2.2, -8.5], 7.5, ['sirana'], 'close', TOWN_Y + 5.6, {
    at: V(-35.5, TOWN_Y + 2.4, -4.8), near: { p: [-35.5, TOWN_Y + 0.2, -4.8], r: 5.0 },
    view: { from: [-30.0, TOWN_Y + 4.2, -1.5], to: [-41.0, TOWN_Y + 4.2, -1.5], look: [-35.5, TOWN_Y + 2.0, -8.5] },
  });
  orb('sirutka', [-32.2, TOWN_Y + 1.1, -4.2], 1.4, ['sirutka'], 'close', TOWN_Y + 1.8, {
    near: { p: [-32.2, TOWN_Y + 0.2, -1.6], r: 3.6 },
    view: { from: [-30.6, TOWN_Y + 1.9, -1.5], to: [-33.8, TOWN_Y + 1.9, -1.5], look: [-32.2, TOWN_Y + 1.1, -4.2] },
  });
  orb('kaca', [-34.2, TOWN_Y + 0.8, -4.2], 2.0, ['kaca'], 'close', TOWN_Y + 1.7, {
    near: { p: [-34.2, TOWN_Y + 0.2, -1.6], r: 3.6 },
    view: { from: [-32.4, TOWN_Y + 2.0, -1.2], to: [-36.0, TOWN_Y + 2.0, -1.2], look: [-34.2, TOWN_Y + 0.8, -4.2] },
  });
  orb('cjedilo', [-36.5, TOWN_Y + 1.1, -4.2], 1.8, ['cjedilo'], 'close', TOWN_Y + 2.0, {
    near: { p: [-36.5, TOWN_Y + 0.2, -1.6], r: 3.6 },
    view: { from: [-34.8, TOWN_Y + 2.0, -1.2], to: [-38.2, TOWN_Y + 2.0, -1.2], look: [-36.5, TOWN_Y + 1.1, -4.2] },
  });
  orb('coban', [-40.8, TOWN_Y + 1.1, -3.5], 2.0, ['coban'], 'close', TOWN_Y + 2.3, {
    near: { p: [-40.8, TOWN_Y + 0.2, -0.8], r: 3.8 },
    view: { from: [-38.8, TOWN_Y + 2.1, -0.4], to: [-42.8, TOWN_Y + 2.1, -0.4], look: [-40.8, TOWN_Y + 1.1, -3.5] },
  });
  orb('gunj', [-42.8, TOWN_Y + 1.25, -3.5], 1.6, ['gunj'], 'close', TOWN_Y + 2.1, {
    near: { p: [-42.8, TOWN_Y + 0.2, -0.8], r: 3.8 },
    view: { from: [-41.0, TOWN_Y + 2.0, -0.8], to: [-44.6, TOWN_Y + 2.0, -0.8], look: [-42.8, TOWN_Y + 1.25, -3.5] },
  });
  orb('vuna', [-45.2, TOWN_Y + 0.75, -2.0], 1.6, ['vuna'], 'close', TOWN_Y + 1.5, {
    near: { p: [-45.2, TOWN_Y + 0.2, 0.6], r: 3.6 },
    view: { from: [-43.6, TOWN_Y + 1.8, 0.8], to: [-46.8, TOWN_Y + 1.8, 0.8], look: [-45.2, TOWN_Y + 0.75, -2.0] },
  });
  orb('preslica', [-47.0, TOWN_Y + 1.35, -2.0], 1.5, ['preslica'], 'close', TOWN_Y + 2.2, {
    near: { p: [-47.0, TOWN_Y + 0.2, 0.6], r: 3.6 },
    view: { from: [-45.4, TOWN_Y + 2.0, 0.8], to: [-48.6, TOWN_Y + 2.0, 0.8], look: [-47.0, TOWN_Y + 1.35, -2.0] },
  });
  orb('razboj', [-49.6, TOWN_Y + 1.0, -1.2], 2.8, ['razboj'], 'close', TOWN_Y + 2.2, {
    near: { p: [-49.6, TOWN_Y + 0.2, 2.0], r: 4.0 },
    view: { from: [-47.2, TOWN_Y + 2.4, 2.2], to: [-52.0, TOWN_Y + 2.4, 2.2], look: [-49.6, TOWN_Y + 1.0, -1.2] },
  });
  orb('cebe', [-47.2, TOWN_Y + 0.7, 1.8], 2.0, ['cebe'], 'close', TOWN_Y + 1.5, {
    near: { p: [-47.2, TOWN_Y + 0.2, 4.4], r: 3.8 },
    view: { from: [-45.2, TOWN_Y + 2.0, 4.6], to: [-49.2, TOWN_Y + 2.0, 4.6], look: [-47.2, TOWN_Y + 0.7, 1.8] },
  });

  // Zone 4 (10)
  orb('kamin', [26.0, TOWN_Y + 2.0, 16.2], 4.8, ['kamin'], 'close', TOWN_Y + 4.4, {
    at: V(26.0, TOWN_Y + 2.2, 12.6), near: { p: [26.0, TOWN_Y + 0.2, 12.6], r: 4.5 },
    view: { from: [22.2, TOWN_Y + 3.0, 11.2], to: [29.8, TOWN_Y + 3.0, 11.2], look: [26.0, TOWN_Y + 1.8, 16.2] },
  });
  orb('cjepanica', [23.4, TOWN_Y + 0.55, 16.2], 1.8, ['cjepanica'], 'close', TOWN_Y + 1.4, {
    near: { p: [23.4, TOWN_Y + 0.2, 13.4], r: 3.8 },
    view: { from: [21.6, TOWN_Y + 1.8, 13.0], to: [25.2, TOWN_Y + 1.8, 13.0], look: [23.4, TOWN_Y + 0.55, 16.2] },
  });
  orb('drvarnica', [34.0, TOWN_Y + 1.8, 19.5], 5.5, ['drvarnica'], 'close', TOWN_Y + 3.8, {
    at: V(34.0, TOWN_Y + 2.2, 15.6), near: { p: [34.0, TOWN_Y + 0.2, 15.6], r: 4.8 },
    view: { from: [30.0, TOWN_Y + 3.4, 14.0], to: [38.0, TOWN_Y + 3.4, 14.0], look: [34.0, TOWN_Y + 1.8, 19.5] },
  });
  orb('sac', [25.5, TOWN_Y + 0.6, 13.0], 2.0, ['sac'], 'close', TOWN_Y + 1.5, {
    near: { p: [25.5, TOWN_Y + 0.2, 10.4], r: 3.8 },
    view: { from: [23.4, TOWN_Y + 1.9, 10.2], to: [27.6, TOWN_Y + 1.9, 10.2], look: [25.5, TOWN_Y + 0.6, 13.0] },
  });
  orb('stolnjak', [26.0, TOWN_Y + 0.85, 8.0], 4.5, ['stolnjak'], 'close', TOWN_Y + 1.8, {
    near: { p: [26.0, TOWN_Y + 0.2, 5.2], r: 4.2 },
    view: { from: [23.0, TOWN_Y + 2.6, 4.4], to: [29.0, TOWN_Y + 2.6, 4.4], look: [26.0, TOWN_Y + 0.85, 8.0] },
  });
  orb('pogaca', [24.2, TOWN_Y + 1.05, 8.0], 1.2, ['pogaca'], 'close', TOWN_Y + 1.6, {
    requires: ['stolnjak'], near: { p: [24.2, TOWN_Y + 0.2, 5.8], r: 3.6 },
    view: { from: [23.0, TOWN_Y + 1.9, 5.8], to: [25.4, TOWN_Y + 1.9, 5.8], look: [24.2, TOWN_Y + 1.05, 8.0] },
  });
  orb('ustipak', [25.4, TOWN_Y + 1.08, 8.0], 1.2, ['ustipak'], 'close', TOWN_Y + 1.6, {
    requires: ['stolnjak'], near: { p: [25.4, TOWN_Y + 0.2, 5.8], r: 3.6 },
    view: { from: [24.2, TOWN_Y + 1.9, 5.8], to: [26.6, TOWN_Y + 1.9, 5.8], look: [25.4, TOWN_Y + 1.08, 8.0] },
  });
  orb('corba', [26.6, TOWN_Y + 1.15, 8.0], 1.2, ['corba'], 'close', TOWN_Y + 1.7, {
    requires: ['stolnjak'], near: { p: [26.6, TOWN_Y + 0.2, 5.8], r: 3.6 },
    view: { from: [25.4, TOWN_Y + 1.9, 5.8], to: [27.8, TOWN_Y + 1.9, 5.8], look: [26.6, TOWN_Y + 1.15, 8.0] },
  });
  orb('kutlaca', [26.92, TOWN_Y + 1.42, 8.0], 1.1, ['kutlaca'], 'close', TOWN_Y + 2.0, {
    requires: ['corba'], near: { p: [26.92, TOWN_Y + 0.2, 5.8], r: 3.6 },
    view: { from: [25.8, TOWN_Y + 2.0, 6.0], to: [28.0, TOWN_Y + 2.0, 6.0], look: [26.92, TOWN_Y + 1.42, 8.0] },
  });
  orb('slanik', [27.85, TOWN_Y + 1.1, 8.0], 1.1, ['slanik'], 'close', TOWN_Y + 1.6, {
    requires: ['stolnjak'], near: { p: [27.85, TOWN_Y + 0.2, 5.8], r: 3.6 },
    view: { from: [26.8, TOWN_Y + 1.9, 5.8], to: [28.9, TOWN_Y + 1.9, 5.8], look: [27.85, TOWN_Y + 1.1, 8.0] },
  });

  // Zone 5 (10)
  orb('stala', [-46.0, TOWN_Y + 2.8, 42.0], 8.5, ['stala'], 'close', TOWN_Y + 6.4, {
    at: V(-46.0, TOWN_Y + 2.6, 36.5), near: { p: [-46.0, TOWN_Y + 0.2, 36.5], r: 5.2 },
    view: { from: [-40.0, TOWN_Y + 5.0, 33.5], to: [-52.0, TOWN_Y + 5.0, 33.5], look: [-46.0, TOWN_Y + 2.6, 42.0] },
  });
  orb('stog', [-36.0, TOWN_Y + 1.9, 42.0], 4.8, ['stog'], 'close', TOWN_Y + 3.8, {
    near: { p: [-36.0, TOWN_Y + 0.2, 37.8], r: 4.6 },
    view: { from: [-32.5, TOWN_Y + 3.4, 36.5], to: [-39.5, TOWN_Y + 3.4, 36.5], look: [-36.0, TOWN_Y + 1.9, 42.0] },
  });
  orb('snjegovic', [22.0, TOWN_Y + 1.5, 32.0], 2.6, ['snjegovic'], 'close', TOWN_Y + 2.9, {
    near: { p: [22.0, TOWN_Y + 0.2, 28.8], r: 4.0 },
    view: { from: [19.6, TOWN_Y + 2.4, 28.4], to: [24.4, TOWN_Y + 2.4, 28.4], look: [22.0, TOWN_Y + 1.5, 32.0] },
  });
  orb('iglu', [32.0, TOWN_Y + 1.2, 34.0], 5.2, ['iglu'], 'close', TOWN_Y + 2.9, {
    near: { p: [32.0, TOWN_Y + 0.2, 29.0], r: 4.6 },
    view: { from: [28.0, TOWN_Y + 3.0, 27.6], to: [36.0, TOWN_Y + 3.0, 27.6], look: [32.0, TOWN_Y + 1.2, 34.0] },
  });
  orb('sanjke', [26.0, TOWN_Y + 0.55, 38.0], 2.4, ['sanjke'], 'close', TOWN_Y + 1.5, {
    near: { p: [26.0, TOWN_Y + 0.2, 35.0], r: 3.8 },
    view: { from: [23.8, TOWN_Y + 2.0, 34.8], to: [28.2, TOWN_Y + 2.0, 34.8], look: [26.0, TOWN_Y + 0.55, 38.0] },
  });
  orb('krplje', [39.2, TOWN_Y + 0.8, 28.0], 1.8, ['krplje'], 'close', TOWN_Y + 1.7, {
    near: { p: [39.2, TOWN_Y + 0.2, 25.4], r: 3.8 },
    view: { from: [37.4, TOWN_Y + 1.9, 25.0], to: [41.0, TOWN_Y + 1.9, 25.0], look: [39.2, TOWN_Y + 0.8, 28.0] },
  });
  orb('subara', [36.8, TOWN_Y + 1.0, 28.0], 1.4, ['subara'], 'close', TOWN_Y + 1.8, {
    near: { p: [36.8, TOWN_Y + 0.2, 25.6], r: 3.6 },
    view: { from: [35.4, TOWN_Y + 1.8, 25.6], to: [38.2, TOWN_Y + 1.8, 25.6], look: [36.8, TOWN_Y + 1.0, 28.0] },
  });
  orb('vjetrenjaca', [-44.0, 24.0, -52.0], 14.0, ['vjetrenjaca'], 'combo', 20.5, {
    at: V(-44.0, 19.5, -42.0), near: { p: [-44.0, 14.5, -42.0], r: 8.5 },
    view: { from: [-34, 24, -32], to: [-54, 24, -32], look: [-44, 24, -52] },
    wideView: { from: [-24, 30, -20], to: [-62, 30, -20], look: [-44, 25, -52], lookTo: [-44, 25, -52] },
  });
  orb('elisa', [-44.0, 31.8, -49.6], 10.0, ['elisa'], 'close', 33.0, {
    requires: ['vjetrenjaca'], at: V(-44.0, 31.8, -41.5),
    view: { from: [-36, 33, -36], to: [-52, 33, -36], look: [-44, 31.8, -49.6] },
  });
  orb('brijeg', [58.0, TOWN_Y + 4.0, 28.0], 12.0, ['brijeg'], 'combo', TOWN_Y + 7.2, {
    at: V(46.5, TOWN_Y + 4.0, 28.0), near: { p: [46.5, TOWN_Y + 0.2, 28.0], r: 6.0 },
    view: { from: [44, TOWN_Y + 8, 38], to: [44, TOWN_Y + 8, 18], look: [58, TOWN_Y + 3.8, 28] },
    wideView: { from: [36, TOWN_Y + 14, 42], to: [36, TOWN_Y + 14, 14], look: [58, TOWN_Y + 3.8, 28], lookTo: [58, TOWN_Y + 3.8, 28] },
  });

  // Zone 6 (10)
  orb('kleka', [38.0, TOWN_Y + 0.65, 2.0], 2.4, ['kleka'], 'close', TOWN_Y + 1.6, {
    near: { p: [35.0, TOWN_Y + 0.2, 2.0], r: 4.0 },
    view: { from: [34.4, TOWN_Y + 2.0, 4.4], to: [34.4, TOWN_Y + 2.0, -0.4], look: [38.0, TOWN_Y + 0.65, 2.0] },
  });
  orb('aris', [44.0, TOWN_Y + 4.8, -6.0], 6.5, ['aris'], 'close', TOWN_Y + 6.4, {
    at: V(39.5, TOWN_Y + 3.0, -6.0), near: { p: [39.5, TOWN_Y + 0.2, -6.0], r: 5.0 },
    view: { from: [35.0, TOWN_Y + 5.4, -1.0], to: [35.0, TOWN_Y + 5.4, -11.0], look: [44.0, TOWN_Y + 4.6, -6.0] },
  });
  orb('vepar', [46.0, TOWN_Y + 0.7, 10.0], 2.2, ['vepar'], 'close', TOWN_Y + 1.6, {
    near: { p: [42.8, TOWN_Y + 0.2, 10.0], r: 4.0 },
    view: { from: [42.4, TOWN_Y + 1.9, 12.2], to: [42.4, TOWN_Y + 1.9, 7.8], look: [46.0, TOWN_Y + 0.7, 10.0] },
  });
  orb('srndac', [39.0, TOWN_Y + 1.2, -14.0], 2.4, ['srndac'], 'close', TOWN_Y + 2.4, {
    near: { p: [35.8, TOWN_Y + 0.2, -14.0], r: 4.0 },
    view: { from: [35.4, TOWN_Y + 2.2, -11.6], to: [35.4, TOWN_Y + 2.2, -16.4], look: [39.0, TOWN_Y + 1.2, -14.0] },
  });
  orb('tetrijeb', [48.0, TOWN_Y + 0.9, -15.5], 1.8, ['tetrijeb'], 'close', TOWN_Y + 1.9, {
    near: { p: [44.8, TOWN_Y + 0.2, -15.5], r: 3.8 },
    view: { from: [44.4, TOWN_Y + 2.0, -13.4], to: [44.4, TOWN_Y + 2.0, -17.6], look: [48.0, TOWN_Y + 0.9, -15.5] },
  });
  orb('zeba', [19.5, TOWN_Y + 1.68, 14.0], 1.2, ['zeba'], 'close', TOWN_Y + 2.3, {
    near: { p: [17.4, TOWN_Y + 0.2, 14.0], r: 3.6 },
    view: { from: [17.2, TOWN_Y + 2.1, 15.6], to: [17.2, TOWN_Y + 2.1, 12.4], look: [19.5, TOWN_Y + 1.68, 14.0] },
  });
  orb('cavka', [18.2, TOWN_Y + 1.6, -14.2], 1.4, ['cavka'], 'close', TOWN_Y + 2.4, {
    near: { p: [18.2, TOWN_Y + 0.2, -11.4], r: 3.8 },
    view: { from: [16.2, TOWN_Y + 2.2, -11.0], to: [20.2, TOWN_Y + 2.2, -11.0], look: [18.2, TOWN_Y + 1.5, -14.2] },
  });
  orb('jazbina', [49.0, TOWN_Y + 0.85, 2.0], 3.2, ['jazbina'], 'close', TOWN_Y + 2.2, {
    near: { p: [45.0, TOWN_Y + 0.2, 2.0], r: 4.4 },
    view: { from: [44.2, TOWN_Y + 2.2, 4.6], to: [44.2, TOWN_Y + 2.2, -0.6], look: [49.0, TOWN_Y + 0.85, 2.0] },
  });
  orb('planinar', [32.0, TOWN_Y + 1.1, -14.5], 2.0, ['planinar'], 'close', TOWN_Y + 2.3, {
    near: { p: [32.0, TOWN_Y + 0.2, -11.6], r: 3.8 },
    view: { from: [29.8, TOWN_Y + 2.2, -11.2], to: [34.2, TOWN_Y + 2.2, -11.2], look: [32.0, TOWN_Y + 1.1, -14.5] },
  });
  orb('lovac', [45.0, TOWN_Y + 1.1, -14.5], 2.0, ['lovac'], 'close', TOWN_Y + 2.3, {
    near: { p: [42.2, TOWN_Y + 0.2, -14.5], r: 3.8 },
    view: { from: [42.0, TOWN_Y + 2.2, -12.0], to: [42.0, TOWN_Y + 2.2, -16.5], look: [45.0, TOWN_Y + 1.1, -14.5] },
  });

  // Zone 7 (5, Stage 2: utvrda)
  orb('sup', [-16.0, 22.5, -23.0], 3.6, ['sup'], 'close', 24.4, {
    at: V(-16.0, 23.6, -18.5),
    view: { from: [-19.5, 24.0, -17.0], to: [-12.5, 24.0, -17.0], look: [-16.0, 22.5, -23.0] },
  });
  orb('sedlo', [0, 16.0, -76.0], 28.0, ['sedlo'], 'combo', 22.0, {
    sky: false, at: V(0, 24.0, -56.0),
    view: { from: [-10, 24, -46], to: [10, 24, -46], look: [0, 16, -76] },
    wideView: { from: [-18, 28, -32], to: [18, 28, -32], look: [0, 16, -76], lookTo: [0, 16, -76] },
  });
  orb('lednik', [-30.0, 20.0, -102.0], 26.0, ['lednik'], 'combo', 26.0, {
    sky: false, at: V(-26.0, 24.0, -68.0),
    view: { from: [-18, 28, -62], to: [-36, 28, -62], look: [-30, 19, -102] },
    wideView: { from: [-10, 32, -48], to: [-42, 32, -48], look: [-30, 19, -102], lookTo: [-30, 19, -102] },
  });
  orb('vrhovi', [0, 38.0, -138.0], 56.0, ['vrhovi'], 'combo', 38.0, {
    sky: false, at: V(0, 26.0, -48.0),
    view: { from: [-14, 28, -36], to: [14, 28, -36], look: [0, 34, -138] },
    wideView: { from: [-24, 34, -18], to: [24, 34, -18], look: [0, 32, -138], lookTo: [0, 32, -138] },
  });
  orb('utvrda', [24.0, FORT_Y + 7.5, -48.0], 15.0, ['utvrda'], 'combo', FORT_Y + 2.0, {
    stage: 2, at: V(24.0, FORT_Y + 4.2, -37.5),
    near: { p: [24.0, FORT_Y + 0.2, -37.5], r: 6.5 },
    view: { from: [12, FORT_Y + 10, -28], to: [36, FORT_Y + 10, -28], look: [24.0, FORT_Y + 7.5, -48.0] },
    wideView: { from: [4, FORT_Y + 16, -16], to: [44, FORT_Y + 16, -16], look: [24.0, FORT_Y + 7.5, -48.0], lookTo: [24.0, FORT_Y + 7.5, -48.0] },
  });

  // Paint sources for all 65 orb tags + sky/sun
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
    start: V(-20.4, TOWN_Y + 0.12, 24.5),
    fleur: V(24.0, FORT_Y + 18.2, -48.0),
    sunPos,
    movers: [],
    elisaWheel,
    wildHorses,
    vulture,
    vultureHomeY: 21.8,
  };
}
