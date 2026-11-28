// Višegrad (autumn): 3D storybook world featuring the 11-arched UNESCO Mehmed Paša Sokolović Bridge,
// the emerald Drina River, Andrićgrad, Ćiro narrow-gauge steam railway, Višegradska Banja thermal spa,
// autumn Drina gorge cliffs & wildlife, and Bikavac hilltop medieval ruins.
import * as THREE from 'three';
import { Builder, PAT, tag, rng, shared, paintGeo, washMat, addHull } from '../paper.js';
import S from '../settings.js';

export const TOWN_Y = 4.0;
export const BRIDGE_Y = 6.2;
export const FOREST_Y = 12.0;
export const HILL_Y = 26.0;
export const SUN_VISEGRAD = new THREE.Vector3(0.66, 0.44, 0.61).normalize();

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
const SPHERE = new THREE.SphereGeometry(1, 10, 8);
const HEMI = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);

function hipRoofGeo(w, d, h) {
  const g = new THREE.ConeGeometry(1, h, 4);
  g.rotateY(Math.PI / 4);
  g.scale(w * 0.72, 1, d * 0.72);
  g.translate(0, h / 2, 0);
  return g;
}

// Pointed Ottoman bridge arch bay (Mehmed Paša Sokolović Bridge spandrel with graceful pointed arch opening)
function ottomanArchBayGeo(bayW, totalH, openW, springH, apexH, depth) {
  const hw = bayW / 2, ow = openW / 2;
  const s = new THREE.Shape();
  s.moveTo(-hw, 0);
  s.lineTo(-ow, 0);
  s.lineTo(-ow, springH);
  s.quadraticCurveTo(-ow * 0.92, apexH * 0.80, 0, apexH);
  s.quadraticCurveTo(ow * 0.92, apexH * 0.80, ow, springH);
  s.lineTo(ow, 0);
  s.lineTo(hw, 0);
  s.lineTo(hw, totalH);
  s.lineTo(-hw, totalH);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 8 });
  g.translate(0, 0, -depth / 2);
  return g;
}

// Arched stone tunnel portal for the Ćiro narrow-gauge railway
function tunnelPortalGeo(w, h, openW, openH, depth) {
  const hw = w / 2, ow = openW / 2;
  const s = new THREE.Shape();
  s.moveTo(-hw, 0);
  s.lineTo(-ow, 0);
  s.lineTo(-ow, openH * 0.62);
  s.absarc(0, openH * 0.62, ow, Math.PI, 0, true);
  s.lineTo(ow, 0);
  s.lineTo(hw, 0);
  s.lineTo(hw, h);
  s.lineTo(-hw, h);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 10 });
  g.translate(0, 0, -depth / 2);
  return g;
}

function dynMesh(geo, tagName, col, bleed, parent, x = 0, y = 0, z = 0, s = 1, hull = 1.3) {
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

export function buildVisegradWorld(scene) {
  const b = new Builder(), R = rng(913);
  const rr = (lo, hi) => lo + R() * (hi - lo);
  const A = (geo, x, y, z, o, ry = 0, rx = 0, rz = 0, s = 1) => b.add(geo, mat4(x, y, z, ry, rx, rz, s), o);
  const box = (w, h, d, x, y, z, o, ry = 0, rx = 0, rz = 0) => A(BOX, x, y, z, o, ry, rx, rz, [w, h, d]);

  // Warm golden Bosnian autumn afternoon light over the emerald Drina gorge
  shared.uSunDir.value.copy(SUN_VISEGRAD);
  shared.uWaterDir.value.set(0, -1); // Drina flows north (-z)
  shared.uSunShadow.value.set(0.56, 0.52, 0.62);
  shared.uSunGlow.value.set(1.0, 0.84, 0.56);
  shared.uSunTint.value.set(1.06, 0.98, 0.88);
  shared.uSkyGlow.value.set(0.95, 0.92, 0.86);

  const orbs = [], clouds = [], people = [], animals = [], smoke = [], fish = [], birds = [];

  const orb = (id, focus, size, tags, shot, top, extra = {}) => orbs.push({
    id, focus: V(...focus), size, tags, shot,
    at: V(focus[0], top + S.orb.hoverHeight, focus[2]), stage: 1, ...extra,
  });

  // Autumn Višegrad palette (warm cream travertine, terracotta, autumn gold/russet, emerald Drina)
  const TRAV = ['#e8dcc0', '#c7b897'];
  const TRAV_L = ['#f2e8d0', '#d4c6a7'];
  const LIME = ['#f4eee0', '#ded5c1'];
  const TILE = ['#b85432', '#8c3b20'];
  const WOOD_D = ['#573b26', '#3b2617'];
  const WOOD_W = ['#94693e', '#6e4c2a'];
  const STONE_G = ['#b8b2a6', '#8f8a7e'];
  const GRASS_A = ['#8ea346', '#697d2f'];
  const HILL_A = ['#7c943e', '#596e29'];

  // ==================== 1. SKY, GOLDEN AUTUMN SUN & CLOUDS ====================
  tag('sky').side = THREE.BackSide; tag('sky').mode = 'one'; tag('sky').radius = 1300; tag('sky').dur = 6;
  tag('sun').mode = 'one'; tag('sun').radius = 65; tag('sun').dur = 2.5;
  A(new THREE.SphereGeometry(720, 32, 20), 0, 0, 0, { tag: 'sky', col: '#b6d9e8', bleed: '#79b3d4', pat: PAT.sky, hatch: 0, ink: false, solid: false });
  const sunPos = SUN_VISEGRAD.clone().multiplyScalar(520);
  const sunM = new THREE.Matrix4().lookAt(sunPos, V(0, 20, 0), V(0, 1, 0)).setPosition(sunPos);
  b.add(new THREE.CircleGeometry(28, 36).rotateY(Math.PI), sunM, { tag: 'sun', col: '#ffe899', bleed: '#f5b84c', hatch: 0, ink: false, solid: false });
  {
    const g = new THREE.Group(); g.position.copy(sunPos); g.lookAt(0, 20, 0);
    const inkM = new THREE.MeshBasicMaterial({ color: S.ink.color, side: THREE.DoubleSide });
    for (const r0 of [28, 29]) { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r0 + 0.7, 48), inkM); m.position.z = -0.5; g.add(m); }
    scene.add(g);
  }
  for (const [x, y, z, s] of [[-150, 76, -125, 8], [140, 82, -135, 9], [160, 72, 70, 7], [-160, 70, 85, 8], [-10, 86, -195, 9], [50, 78, 190, 8]]) {
    clouds.push({ c: V(x, y, z), r: 4.0 * s });
    const dr = -rr(14, 34);
    b.object(() => {
      for (const [ox, oy, oz, r] of [[-2.0, 0, 0, 1.4], [-0.5, 0.5, 0.2, 1.9], [1.0, 0.45, -0.2, 2.0], [2.3, 0, 0, 1.4], [0.2, -0.2, 0.5, 1.7]])
        A(ICO, x + ox * s, y + oy * s, z + oz * s, { tag: 'hills', col: '#fffcf2', bleed: '#ebe4d1', hull: true, hatch: 0.3, solid: false, sway: dr }, 0, 0, 0, [r * s, 0.58 * r * s, r * s]);
    });
  }

  for (const t of ['lukovi', 'tirkiz', 'jedanaest', 'klisura', 'rusevina', 'kolosijek', 'odraz', 'puteljak']) {
    tag(t).mode = 'one'; tag(t).radius = 125; tag(t).holdRest = 2.4;
  }
  for (const t of ['prag', 'bukva', 'brsljan', 'klada', 'zir']) {
    tag(t).waveDelay = 2.2;
  }

  // ==================== 2. TERRAIN, DRINA CHANNEL, GORGE CLIFFS & BIKAVAC HILL ====================
  const BANK_M = { tag: 'riverbank', col: GRASS_A[0], bleed: GRASS_A[1], pat: PAT.grass };
  const TOWN_G = { tag: 'town', col: '#d4ccbc', bleed: '#b5ad9c', pat: PAT.cobble, ps: 0.65 };
  const HILL_M = { tag: 'hills', col: HILL_A[0], bleed: HILL_A[1], pat: PAT.grass };
  const EMB_M = { tag: 'riverbank', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.65 };

  // Continuous grounded valley floor underneath everything so sky never peeks below terrain or cliffs
  box(500, 4, 500, 0, -4.0, 0, { tag: 'hills', col: HILL_A[0], bleed: HILL_A[1], pat: PAT.grass, ink: false });

  // Broad Drina riverbed (x = -27..27, z = -115..115)
  box(58, 2, 240, 0, -1.6, 0, { tag: 'riverbank', col: '#226658', bleed: '#15473d', ink: false });

  // West bank: Andrićgrad, Stonemason yard & Višegradska Banja (x = -98..-27, z = -38..78, y = TOWN_Y)
  box(72, 6, 116, -63, TOWN_Y - 3, 20, TOWN_G);
  // East bank: Old Smithy, Timber yard & Ćiro Railway terrace (x = 27..98, z = -38..78, y = TOWN_Y)
  box(72, 6, 116, 63, TOWN_Y - 3, 20, BANK_M);
  // Stone riverside embankments lining both Drina banks (x = -27.4 & x = +27.4)
  box(1.6, 4.5, 116, -27.4, 1.85, 20, EMB_M);
  box(1.6, 4.5, 116, 27.4, 1.85, 20, EMB_M);

  // North autumn forest terraces flanking the Drina gorge (y = FOREST_Y = 12.0, z = -76..-38)
  box(68, 14, 42, -61, FOREST_Y - 7.0, -59, HILL_M);
  box(68, 14, 42, 61, FOREST_Y - 7.0, -59, HILL_M);
  box(68, 8.2, 1.4, -61, 8.0, -38.2, EMB_M);
  box(68, 8.2, 1.4, 61, 8.0, -38.2, EMB_M);

  // Bikavac natural tapered autumn hillside at (0, -76, top plateau y = HILL_Y = 26.0)
  A(new THREE.CylinderGeometry(16.5, 36, 28, 16), 0, 12.0, -76, { tag: 'hills', col: HILL_A[0], bleed: HILL_A[1], pat: PAT.grass });
  A(CYL16, 0, 25.6, -76, { tag: 'hills', col: GRASS_A[0], bleed: GRASS_A[1], pat: PAT.grass }, 0, 0, 0, [17.0, 0.8, 15.0]);
  for (const [sx, sy, sz, rx, ry, rz] of [[-26, 6, -76, 24, 14, 22], [26, 6, -76, 24, 14, 22], [0, -2, -98, 38, 22, 24]]) {
    A(HEMI, sx, sy, sz, { tag: 'hills', col: HILL_A[0], bleed: HILL_A[1], pat: PAT.grass, solid: false }, 0, 0, 0, [rx, ry, rz]);
  }

  // Dramatic steep wooded Drina Gorge walls ('klisura') grounded solidly at y = -2.5 on north/east/west canyon flanks
  for (const [kx, kz, rx, ry, rz, c1, c2] of [
    [-112, -135, 76, 48, 56, '#9c7834', '#705420'],
    [-38, -155, 86, 56, 58, '#8a7a36', '#5e5422'],
    [42, -155, 86, 56, 58, '#967232', '#6b4e1e'],
    [114, -134, 76, 48, 56, '#8f7d38', '#635624'],
  ]) {
    A(HEMI, kx, -2.5, kz, { tag: 'klisura', col: c1, bleed: c2, pat: PAT.grass, hull: true, solid: false, orb: 'klisura' }, 0, 0, 0, [rx, ry, rz]);
  }
  // Enclosing golden-autumn hills around east, west & south ('hills', all grounded at y = -2.5)
  for (const [hx, hz, rx, ry, rz] of [
    [-142, -52, 64, 38, 72], [-138, 28, 60, 32, 74], [-128, 102, 66, 32, 62],
    [142, -52, 64, 38, 72], [138, 28, 60, 32, 74], [128, 102, 66, 32, 62],
    [-64, 134, 78, 32, 56], [64, 134, 78, 32, 56],
  ]) {
    A(HEMI, hx, -2.5, hz, { tag: 'hills', col: '#8f843a', bleed: '#665d24', pat: PAT.grass, hull: true, solid: false }, 0, 0, 0, [rx, ry, rz]);
  }

  // ==================== 3. ZONE 1: MEHMED PAŠA SOKOLOVIĆ BRIDGE (11 ARCHES!) & EMERALD DRINA (11 words) ====================
  // Emerald-turquoise Drina River ('tirkiz') flowing beneath all 11 arches
  box(54.5, 0.12, 224, 0, -0.06, 0, {
    tag: 'tirkiz', col: '#1f9982', bleed: '#116e5c', pat: PAT.water, hatch: 0, water: true, ink: false, orb: 'tirkiz',
  });

  // Shimmering golden mirror reflections ('odraz') dancing on the calm Drina south of the 11 arches
  b.object(() => {
    const OD = { tag: 'odraz', col: '#f2d98c', bleed: '#d4ad4e', hatch: 0, ink: false, solid: false, orb: 'odraz' };
    for (let i = 0; i < 9; i++) {
      const rx = -19.2 + i * 4.8;
      A(CYL, rx, 0.04, 6.2 + (i % 2) * 1.4, OD, 0, Math.PI / 2, 0, [0.42, 3.8 + (i % 3) * 0.8, 0.04]);
      A(CYL, rx + 0.4, 0.04, 10.6 + (i % 2) * 0.8, OD, 0, Math.PI / 2, 0, [0.28, 2.4, 0.04]);
    }
  });

  // STAGE 0 (FIRST WORD!): The 11 graceful pointed Ottoman travertine arches ('lukovi') of Mehmed Paša Sokolović Bridge!
  // 10 river arches spanning x = -24..+24 PLUS the 11th bank arch at x = -26.4 -> 11 EXACT pointed arches!
  const archGeo = ottomanArchBayGeo(4.8, BRIDGE_Y, 3.65, 1.5, 4.55, 4.6);
  const archCenters = [-26.4, -21.6, -16.8, -12.0, -7.2, -2.4, 2.4, 7.2, 12.0, 16.8, 21.6];
  b.object(() => {
    const LK = { tag: 'lukovi', col: TRAV[0], bleed: TRAV[1], pat: PAT.blocks, ps: 0.65, pool: 0.85, orb: 'lukovi' };
    for (const cx of archCenters) {
      A(archGeo, cx, 0, 0, LK);
    }
    // East bank stone abutment & bridge deck + low stone parapets spanning all 11 arches
    box(6.0, BRIDGE_Y, 4.6, 27.0, BRIDGE_Y / 2, 0, { tag: 'lukovi', col: TRAV[0], bleed: TRAV[1], pat: PAT.blocks, ps: 0.65 });
    box(59.0, 0.36, 4.8, -1.0, BRIDGE_Y + 0.18, 0, { tag: 'lukovi', col: '#d9ceb4', bleed: '#b8ab8e', pat: PAT.cobble, ps: 0.7 });
    // Continuous stone parapets along south (+2.3) & north (-2.3) with openings at the central kapija (x = -2.2..+2.2)
    for (const pz of [-2.28, 2.28]) {
      box(26.5, 0.92, 0.34, -15.5, BRIDGE_Y + 0.64, pz, { tag: 'lukovi', col: TRAV_L[0], bleed: TRAV_L[1], pat: PAT.blocks, ps: 0.8, wall: true });
      box(26.5, 0.92, 0.34, 15.5, BRIDGE_Y + 0.64, pz, { tag: 'lukovi', col: TRAV_L[0], bleed: TRAV_L[1], pat: PAT.blocks, ps: 0.8, wall: true });
    }
    // Gentle stone approach ramps from west & east banks (y = TOWN_Y = 4.0 up to BRIDGE_Y = 6.2)
    box(8.5, 2.4, 4.6, -32.2, TOWN_Y + 1.0, 0, { tag: 'town', col: TRAV[0], bleed: TRAV[1], pat: PAT.blocks, ps: 0.7 }, 0, 0, 0.22);
    box(8.5, 2.4, 4.6, 32.2, TOWN_Y + 1.0, 0, { tag: 'town', col: TRAV[0], bleed: TRAV[1], pat: PAT.blocks, ps: 0.7 }, 0, 0, -0.22);
  });

  // ELEVEN ('jedanaest') monumental conical pointed stone cutwater piers standing across the Drina!
  // Pier centers: x = -24.0, -19.2, -14.4, -9.6, -4.8, 0.0, +4.8, +9.6, +14.4, +19.2, +24.0 (11 exact piers!)
  b.object(() => {
    const P11 = { tag: 'jedanaest', col: TRAV_L[0], bleed: TRAV_L[1], pat: PAT.blocks, ps: 0.65, orb: 'jedanaest' };
    for (let i = 0; i < 11; i++) {
      const px = -24.0 + i * 4.8;
      // Square stone pier shaft + upstream (+z) pointed conical cutwater pyramid
      box(1.35, 4.2, 5.4, px, 2.0, 0, P11);
      A(CYL, px, 1.5, 3.15, P11, 0, 0, 0, [0.85, 3.0, 0.85]);
      A(CONE8, px, 3.95, 3.15, { tag: 'jedanaest', col: '#f5ecd6', bleed: '#cfc1a3' }, 0, 0, 0, [0.92, 1.95, 0.92]);
    }
  });

  // Central Bridge Kapija Terrace at x = 0: curved stone sitting bench ('sofa'), tall Ottoman 'tarih' portal & carved 'ploca' plaque!
  b.object(() => {
    // South projecting terrace supporting the famous Višegrad stone 'sofa' bench (x = 0, z = +2.3..+5.4)
    box(5.6, BRIDGE_Y + 0.32, 3.2, 0, (BRIDGE_Y + 0.32) / 2, 3.9, { tag: 'town', col: TRAV[0], bleed: TRAV[1], pat: PAT.blocks, ps: 0.65 });
    // Raised curved stone 'sofa' bench facing north onto the bridge deck
    const SF = { tag: 'sofa', col: '#f2e8d2', bleed: '#cbbd9f', pat: PAT.blocks, ps: 0.75, orb: 'sofa' };
    box(4.6, 0.55, 0.85, 0, BRIDGE_Y + 0.62, 4.75, SF);
    box(4.8, 1.15, 0.38, 0, BRIDGE_Y + 1.05, 5.32, SF);
    for (const sx of [-2.45, 2.45]) box(0.45, 1.15, 1.45, sx, BRIDGE_Y + 1.05, 4.78, SF);
    // North projecting monumental Ottoman 'tarih' inscription portal (x = 0, z = -2.6..-3.8)
    box(5.4, BRIDGE_Y + 0.32, 2.2, 0, (BRIDGE_Y + 0.32) / 2, -3.4, { tag: 'town', col: TRAV[0], bleed: TRAV[1], pat: PAT.blocks, ps: 0.65 });
    const TR = { tag: 'tarih', col: '#efe4ca', bleed: '#c7b897', pat: PAT.blocks, ps: 0.65, orb: 'tarih' };
    box(3.8, 4.8, 0.75, 0, BRIDGE_Y + 2.75, -3.9, TR);
    box(4.2, 0.42, 0.95, 0, BRIDGE_Y + 5.25, -3.9, TR);
    // Recessed pointed Ottoman niche inside the tarih portal
    box(2.1, 2.6, 0.20, 0, BRIDGE_Y + 2.2, -3.48, { tag: 'tarih', col: '#d8c9a8', bleed: '#b5a584', solid: false });
    // Smooth carved marble inscription plaque ('ploca') mounted cleanly on the tarih facade
    box(1.75, 1.15, 0.16, 0, BRIDGE_Y + 3.4, -3.46, { tag: 'ploca', col: '#faf5e8', bleed: '#d8ceb6', orb: 'ploca' });
    box(1.45, 0.10, 0.18, 0, BRIDGE_Y + 3.65, -3.42, { tag: 'ploca', col: '#7d6e54', solid: false });
    box(1.45, 0.10, 0.18, 0, BRIDGE_Y + 3.35, -3.42, { tag: 'ploca', col: '#7d6e54', solid: false });
    box(1.20, 0.10, 0.18, 0, BRIDGE_Y + 3.05, -3.42, { tag: 'ploca', col: '#7d6e54', solid: false });
  });

  // Traditional Drina wooden log raft & raftsman ('splavar') at (-10, 0.14, 16)
  const raftG = new THREE.Group();
  raftG.position.set(-10.0, 0.14, 16.0);
  raftG.rotation.y = 0.18;
  scene.add(raftG);
  for (let i = -3; i <= 3; i++) {
    const lg = dynMesh(CYL12, 'splavar', '#8f653c', '#634424', raftG, i * 0.34, 0.14, 0, [0.16, 5.2, 0.16], 1.1);
    lg.rotation.x = Math.PI / 2;
  }
  for (const bz of [-1.7, 1.7]) dynMesh(BOX, 'splavar', '#6b4726', '#4a3018', raftG, 0, 0.30, bz, [2.4, 0.12, 0.24], 1.1);
  people.push({ kind: 'visRaftsman', x: -10.0, y: 0.42, z: 16.2, ry: 0.18, tag: 'splavar' });

  // Traditional wooden Drina river boat & oarsman ('veslar') at (11, 0.14, 18)
  const boatG = new THREE.Group();
  boatG.position.set(11.0, 0.14, 18.0);
  boatG.rotation.y = -0.22;
  scene.add(boatG);
  dynMesh(BOX, 'veslar', '#8a5932', '#613c1f', boatG, 0, 0.20, 0, [1.5, 0.38, 4.5], 1.2);
  dynMesh(BOX, 'veslar', '#a87646', '#7a522c', boatG, 0, 0.40, 0, [1.35, 0.08, 0.38], 1.1);
  const bProw = dynMesh(CONE4, 'veslar', '#9c673a', '#6e4624', boatG, 0, 0.40, -2.7, [0.85, 1.4, 0.68], 1.1);
  bProw.rotation.x = -Math.PI / 2 + 0.28;
  people.push({ kind: 'visRower', x: 11.0, y: 0.18, z: 18.0, ry: -0.22, tag: 'veslar' });

  // Bridgehead Stonemason yard at (-34, TOWN_Y, 7): 'klesar', chisel ('dlijeto') & mallet ('cekic')
  b.object(() => {
    box(1.5, 0.92, 1.2, -34.0, TOWN_Y + 0.46, 7.0, { tag: 'props', col: TRAV[0], bleed: TRAV[1], pat: PAT.blocks, ps: 0.7 });
    // Iron carving chisel ('dlijeto') resting on top of the carved block
    box(0.58, 0.09, 0.12, -34.3, TOWN_Y + 0.98, 7.0, { tag: 'dlijeto', col: '#69727d', bleed: '#454c54', orb: 'dlijeto' }, 0.32);
    box(0.24, 0.13, 0.14, -34.62, TOWN_Y + 0.99, 7.1, { tag: 'dlijeto', col: '#94693e', bleed: '#694827' }, 0.32);
    // Heavy iron mason's hammer ('cekic') beside it
    box(0.54, 0.08, 0.08, -33.55, TOWN_Y + 0.97, 7.1, { tag: 'cekic', col: '#8f6438', bleed: '#664524', orb: 'cekic' }, -0.45);
    box(0.18, 0.18, 0.36, -33.36, TOWN_Y + 1.01, 6.96, { tag: 'cekic', col: '#4a5059', bleed: '#2e3338' }, -0.45);
  });
  people.push({ kind: 'visMason', x: -34.0, y: TOWN_Y + 0.04, z: 8.3, ry: Math.PI, tag: 'klesar' });

  // ==================== 4. ZONE 2: ANDRIĆGRAD & IVO ANDRIĆ LITERARY QUARTER (10 words) ====================
  // Stone-arched Andrićgrad cinema ('kino') at (-54, TOWN_Y, 22)
  b.object(() => {
    const KN = { tag: 'kino', col: TRAV[0], bleed: TRAV[1], pat: PAT.blocks, ps: 0.65, orb: 'kino' };
    box(10.5, 6.8, 8.2, -54, TOWN_Y + 3.4, 22, KN);
    A(hipRoofGeo(11.4, 9.0, 2.8), -54, TOWN_Y + 6.8, 22, { tag: 'kino', col: TILE[0], bleed: TILE[1], pat: PAT.roof });
    // Warm glowing cinema marquee canopy & classic arched doors facing east (+x)
    box(1.4, 0.65, 5.2, -48.3, TOWN_Y + 3.5, 22, { tag: 'kino', col: '#b8322a', bleed: '#851e18' });
    box(1.44, 0.34, 4.6, -48.26, TOWN_Y + 3.5, 22, { tag: 'kino', col: '#fff1b8', bleed: '#e3c868', solid: false });
    for (const dz of [-1.4, 0, 1.4]) box(0.24, 2.5, 1.1, -48.72, TOWN_Y + 1.25, 22 + dz, { tag: 'kino', col: '#3d281a', solid: false });
  });

  // Sculpted bronze/stone portrait bust ('bista') on marble column in Andrićgrad square (-42, TOWN_Y, 20)
  b.object(() => {
    box(1.6, 0.35, 1.6, -42, TOWN_Y + 0.18, 20, { tag: 'props', col: TRAV_L[0], bleed: TRAV_L[1] });
    A(CYL12, -42, TOWN_Y + 1.25, 20, { tag: 'props', col: '#ede6d8', bleed: '#c7beac' }, 0, 0, 0, [0.46, 1.85, 0.46]);
    const BS = { tag: 'bista', col: '#7d6846', bleed: '#54442b', hull: true, orb: 'bista' };
    box(0.86, 0.56, 0.44, -42, TOWN_Y + 2.48, 20, BS);
    A(SPHERE, -42, TOWN_Y + 3.04, 20, BS, 0, 0, 0, [0.28, 0.34, 0.28]);
  });

  // Seated novelist ('knjizevnik') & courtyard writing desk at (-38, TOWN_Y, 31):
  // 'roman', 'hronika', 'stranica', 'korice', 'mastilo', 'pecat', 'svitak'
  b.object(() => {
    box(4.6, 0.88, 1.6, -38.5, TOWN_Y + 0.44, 31.0, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1], pat: PAT.planks, ps: 3 });
    // Hardbound novel ('roman') with crimson-and-gold outer cover ('korice') & open cream page ('stranica') at x = -40.0
    box(0.86, 0.16, 0.64, -40.0, TOWN_Y + 0.96, 31.0, { tag: 'roman', col: '#f2e8d0', bleed: '#cfc2a6', orb: 'roman' }, 0.08);
    box(0.92, 0.06, 0.70, -40.0, TOWN_Y + 0.90, 31.0, { tag: 'korice', col: '#9e2a2b', bleed: '#6e191a', orb: 'korice' }, 0.08);
    box(0.40, 0.03, 0.58, -39.78, TOWN_Y + 1.06, 31.0, { tag: 'stranica', col: '#fffdf5', bleed: '#e3dbc5', orb: 'stranica' }, 0.08, 0, 0.06);
    // Thick leather-bound historical chronicle ('hronika') at x = -38.7
    box(0.68, 0.26, 0.54, -38.7, TOWN_Y + 1.01, 30.85, { tag: 'hronika', col: '#613c24', bleed: '#3d2414', orb: 'hronika' }, -0.14);
    box(0.60, 0.16, 0.48, -38.7, TOWN_Y + 1.01, 30.88, { tag: 'hronika', col: '#f5ebd4', bleed: '#d4c6a8', solid: false }, -0.14);
    // Glass inkwell ('mastilo') at x = -37.8
    A(CYL12, -37.8, TOWN_Y + 1.02, 31.1, { tag: 'mastilo', col: '#243c6b', bleed: '#132240', hull: true, orb: 'mastilo' }, 0, 0, 0, [0.14, 0.26, 0.14]);
    A(CYL, -37.8, TOWN_Y + 1.20, 31.1, { tag: 'mastilo', col: '#d9b244', bleed: '#a68222' }, 0, 0, 0, [0.08, 0.12, 0.08]);
    // Brass wax seal ('pecat') with crimson stamp at x = -37.2
    A(CYL12, -37.2, TOWN_Y + 0.94, 31.2, { tag: 'pecat', col: '#c92e2e', bleed: '#8f1b1b', orb: 'pecat' }, 0, 0, 0, [0.16, 0.06, 0.16]);
    A(CYL12, -37.2, TOWN_Y + 1.12, 31.2, { tag: 'pecat', col: '#d9b244', bleed: '#a68222' }, 0, 0, 0, [0.07, 0.30, 0.07]);
    // Rolled parchment scroll ('svitak') tied with crimson ribbon at x = -36.5
    A(CYL12, -36.5, TOWN_Y + 0.99, 30.9, { tag: 'svitak', col: '#f5e7c4', bleed: '#cfb98c', orb: 'svitak' }, 0.25, 0, Math.PI / 2, [0.11, 0.72, 0.11]);
    A(CYL12, -36.5, TOWN_Y + 0.99, 30.9, { tag: 'svitak', col: '#c9342c', bleed: '#8f1f19' }, 0.25, 0, Math.PI / 2, [0.125, 0.08, 0.125]);
  });
  people.push({ kind: 'visAuthor', x: -38.5, y: TOWN_Y + 0.04, z: 29.6, ry: 0, tag: 'knjizevnik' });

  // ==================== 5. ZONE 3: OLD VIŠEGRAD SMITHY, TIMBER YARD & BAZAAR (10 words) ====================
  // East bank stone blacksmith forge at (42, TOWN_Y, 18): 'kovac', 'nakovanj', 'potkovica', 'mijeh', 'klijesta', 'kalup'
  b.object(() => {
    box(6.4, 3.6, 5.2, 44.5, TOWN_Y + 1.8, 18, { tag: 'town', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.7 });
    A(hipRoofGeo(7.4, 6.2, 2.4), 44.5, TOWN_Y + 3.6, 18, { tag: 'town', col: TILE[0], bleed: TILE[1], pat: PAT.roof });
    box(1.1, 2.2, 1.1, 46.5, TOWN_Y + 5.6, 17, { tag: 'town', col: STONE_G[0], bleed: STONE_G[1] });
    smoke.push(V(46.5, TOWN_Y + 6.9, 17));
    // Horned iron anvil ('nakovanj') on oak stump at (39.6, TOWN_Y, 18.0)
    A(CYL12, 39.6, TOWN_Y + 0.34, 18.0, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.38, 0.68, 0.38]);
    box(0.86, 0.36, 0.42, 39.6, TOWN_Y + 0.86, 18.0, { tag: 'nakovanj', col: '#3b4047', bleed: '#212429', orb: 'nakovanj' });
    A(CONE4, 39.0, TOWN_Y + 0.90, 18.0, { tag: 'nakovanj', col: '#4a5059', bleed: '#292d33' }, 0, 0, Math.PI / 2, [0.22, 0.46, 0.22]);
    // Forged steel horseshoe ('potkovica') mounted on oak display post at (40.8, TOWN_Y, 15.6)
    box(0.24, 1.6, 0.24, 40.8, TOWN_Y + 0.8, 15.6, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] });
    A(new THREE.TorusGeometry(0.28, 0.065, 6, 12, Math.PI * 1.45), 40.62, TOWN_Y + 1.25, 15.6, { tag: 'potkovica', col: '#9aa4b0', bleed: '#68717d', orb: 'potkovica' }, Math.PI / 2, 0, 0.8);
    // Hinged leather-and-wood forge bellows ('mijeh') on low bench at (39.5, TOWN_Y, 20.2)
    box(1.4, 0.56, 0.9, 39.5, TOWN_Y + 0.28, 20.2, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
    box(0.88, 0.12, 0.56, 39.5, TOWN_Y + 0.64, 20.2, { tag: 'mijeh', col: '#8c5a32', bleed: '#613c1f', orb: 'mijeh' });
    box(0.76, 0.28, 0.48, 39.5, TOWN_Y + 0.82, 20.2, { tag: 'mijeh', col: '#b84232', bleed: '#852a1e' });
    box(0.88, 0.10, 0.56, 39.5, TOWN_Y + 0.98, 20.2, { tag: 'mijeh', col: '#8c5a32', bleed: '#613c1f' }, 0, 0, 0.18);
    // Iron blacksmith tongs ('klijesta') & bronze casting mould ('kalup') on workbench at (39.6, TOWN_Y, 22.4)
    box(2.0, 0.78, 1.0, 39.6, TOWN_Y + 0.39, 22.4, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
    for (const ang of [-0.16, 0.16]) box(0.85, 0.06, 0.07, 39.2, TOWN_Y + 0.83, 22.4, { tag: 'klijesta', col: '#4a5059', bleed: '#2a2e33', orb: 'klijesta' }, ang);
    box(0.56, 0.24, 0.48, 40.1, TOWN_Y + 0.90, 22.4, { tag: 'kalup', col: '#7d6c54', bleed: '#544734', orb: 'kalup' });
    A(CYL12, 40.1, TOWN_Y + 1.03, 22.4, { tag: 'kalup', col: '#e3b23c', bleed: '#b0841c' }, 0, 0, 0, [0.16, 0.06, 0.16]);
  });
  people.push({ kind: 'visSmith', x: 38.2, y: TOWN_Y + 0.04, z: 18.0, ry: Math.PI / 2, tag: 'kovac' });

  // Traditional trade stall with hanging iron beam scale ('kantar') at (35, TOWN_Y, 32)
  b.object(() => {
    box(3.2, 0.88, 1.2, 35, TOWN_Y + 0.44, 32, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3 });
    for (const sx of [-1.45, 1.45]) box(0.14, 2.5, 0.14, 35 + sx, TOWN_Y + 1.25, 32, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] });
    box(3.4, 0.16, 1.5, 35, TOWN_Y + 2.52, 32, { tag: 'props', col: '#b85432', bleed: '#8c3b20' });
    // Hanging iron beam scale ('kantar')
    box(1.25, 0.07, 0.07, 35, TOWN_Y + 1.88, 32, { tag: 'kantar', col: '#3d424a', bleed: '#222529', orb: 'kantar' });
    A(CYL, 35.42, TOWN_Y + 1.66, 32, { tag: 'kantar', col: '#5c646e', bleed: '#3a4047' }, 0, 0, 0, [0.12, 0.24, 0.12]);
    A(HEMI, 34.55, TOWN_Y + 1.46, 32, { tag: 'kantar', col: '#d4a63b', bleed: '#9e761e' }, 0, Math.PI, 0, [0.24, 0.14, 0.24]);
  });

  // Drina timber yard at (46, TOWN_Y, 34): 'drvosjeca', stacked logs ('klada') & lumber saw ('pila')
  b.object(() => {
    const KL = { tag: 'klada', col: '#8f6239', bleed: '#634122', pat: PAT.planks, ps: 2, orb: 'klada' };
    for (const [ox, oy] of [[-0.65, 0.34], [0, 0.34], [0.65, 0.34], [-0.32, 0.88], [0.32, 0.88], [0, 1.40]]) {
      A(CYL12, 46 + ox, TOWN_Y + oy, 34, KL, 0, Math.PI / 2, 0, [0.32, 3.8, 0.32]);
    }
    // Two-handled steel lumber saw ('pila') leaning against the front log pile at (44.4, TOWN_Y, 34)
    box(0.06, 0.22, 1.9, 44.3, TOWN_Y + 0.65, 34, { tag: 'pila', col: '#c2cbd4', bleed: '#8d97a1', orb: 'pila' }, 0, 0.25, 0.22);
    for (const sz of [-0.96, 0.96]) A(CYL, 44.3, TOWN_Y + 0.65 + sz * 0.24, 34 + sz, { tag: 'pila', col: '#945b32', bleed: '#693d1e' }, 0, 0, 0, [0.05, 0.34, 0.05]);
  });
  people.push({ kind: 'visLumber', x: 43.2, y: TOWN_Y + 0.04, z: 36.2, ry: 2.3, tag: 'drvosjeca' });

  // ==================== 6. ZONE 4: "ĆIRO" DRINA CANYON STEAM RAILWAY (10 words) ====================
  // Narrow-gauge track along x = 52, z = -42..+2
  b.object(() => {
    // Arched stone railway tunnel ('tunel') protruding cleanly from the north cliff wall at (52, TOWN_Y, -36.8)
    const tunGeo = tunnelPortalGeo(7.6, 6.2, 4.4, 4.6, 2.6);
    A(tunGeo, 52, TOWN_Y, -36.8, { tag: 'tunel', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.65, orb: 'tunel' });
    box(4.4, 4.5, 0.3, 52, TOWN_Y + 2.25, -37.45, { tag: 'tunel', col: '#181a1f', solid: false });
    // Twin steel narrow-gauge rails ('kolosijek') running from z = -37.2 to z = +2
    const KS = { tag: 'kolosijek', col: '#69727d', bleed: '#454c54', orb: 'kolosijek' };
    for (const rx of [51.35, 52.65]) box(0.14, 0.14, 39.5, rx, TOWN_Y + 0.14, -17.6, KS);
    // Dark oak wooden railway sleepers ('prag') every 1.4 m
    const PR = { tag: 'prag', col: '#4a3524', bleed: '#2e1f14', orb: 'prag' };
    for (let z = -37; z <= 1; z += 1.45) box(2.3, 0.12, 0.32, 52, TOWN_Y + 0.06, z, PR);
    // Weighted red-and-white railway switch lever ('skretnica') at (49.6, TOWN_Y, -6.5)
    box(0.28, 0.34, 0.42, 49.6, TOWN_Y + 0.17, -6.5, { tag: 'skretnica', col: '#3a3f45', bleed: '#222529', orb: 'skretnica' });
    box(0.08, 1.35, 0.08, 49.6, TOWN_Y + 0.85, -6.5, { tag: 'skretnica', col: '#4a5059', bleed: '#2e3338' }, 0, 0, -0.35);
    A(SPHERE, 49.84, TOWN_Y + 1.48, -6.5, { tag: 'skretnica', col: '#d43b2c', bleed: '#962217', hull: true }, 0, 0, 0, 0.22);
    // Tall red-and-white semaphore railway signal mast ('signal') at (54.8, TOWN_Y, -10.5)
    A(CYL, 54.8, TOWN_Y + 2.6, -10.5, { tag: 'signal', col: '#f2f0ea', bleed: '#ccc9c0', orb: 'signal' }, 0, 0, 0, [0.12, 5.2, 0.12]);
    box(1.55, 0.30, 0.08, 54.1, TOWN_Y + 4.65, -10.5, { tag: 'signal', col: '#d93829', bleed: '#9e2116' }, 0, 0, 0.35);
    box(0.45, 0.32, 0.10, 54.4, TOWN_Y + 4.55, -10.5, { tag: 'signal', col: '#ffffff', bleed: '#d6d6d6', solid: false }, 0, 0, 0.35);
    // Roofed timber station platform ('peron') beside the tracks at (46.2, TOWN_Y, -16)
    const PN = { tag: 'peron', col: TRAV[0], bleed: TRAV[1], pat: PAT.blocks, ps: 0.7, orb: 'peron' };
    box(5.2, 0.65, 11.5, 46.2, TOWN_Y + 0.32, -16, PN);
    for (const pz of [-20.5, -16.0, -11.5]) box(0.22, 3.0, 0.22, 45.2, TOWN_Y + 2.1, pz, { tag: 'peron', col: WOOD_D[0], bleed: WOOD_D[1] });
    box(4.8, 0.20, 12.0, 45.8, TOWN_Y + 3.65, -16, { tag: 'peron', col: TILE[0], bleed: TILE[1], pat: PAT.roof }, 0, 0, -0.14);
    // Vintage leather trunks & suitcases ('prtljag') stacked on platform at (46.6, TOWN_Y + 0.65, -12.6)
    box(0.95, 0.56, 0.62, 46.6, TOWN_Y + 0.93, -12.6, { tag: 'prtljag', col: '#8c5328', bleed: '#5e3517', orb: 'prtljag' }, 0.14);
    box(0.74, 0.42, 0.48, 46.6, TOWN_Y + 1.42, -12.6, { tag: 'prtljag', col: '#b87638', bleed: '#85501f' }, -0.22);
    // Heritage Ćiro narrow-gauge steam locomotive parked on track at (52, TOWN_Y, -25) with gleaming 'kotao' boiler!
    box(2.3, 0.65, 6.4, 52, TOWN_Y + 0.78, -25, { tag: 'props', col: '#2b3036', bleed: '#181b1f' });
    for (const wz of [-27.2, -25.4, -23.2]) for (const wx of [51.0, 53.0]) {
      A(CYL12, wx, TOWN_Y + 0.55, wz, { tag: 'props', col: '#b8322a', bleed: '#821f19' }, 0, 0, Math.PI / 2, [0.42, 0.14, 0.42]);
    }
    box(2.4, 2.3, 2.2, 52, TOWN_Y + 2.2, -27.0, { tag: 'props', col: '#2d5c45', bleed: '#1c3d2d' });
    box(2.6, 0.18, 2.5, 52, TOWN_Y + 3.4, -27.0, { tag: 'props', col: '#24272c', bleed: '#14161a' });
    // Gleaming black-and-brass steam boiler ('kotao') + brass steam dome + funnel
    A(CYL16, 52, TOWN_Y + 1.95, -24.1, { tag: 'kotao', col: '#2b3038', bleed: '#171a1f', orb: 'kotao' }, 0, Math.PI / 2, 0, [0.82, 3.8, 0.82]);
    A(SPHERE, 52, TOWN_Y + 2.82, -24.6, { tag: 'kotao', col: '#e3b83b', bleed: '#b0881c', hull: true }, 0, 0, 0, [0.34, 0.36, 0.34]);
    A(CYL12, 52, TOWN_Y + 3.05, -22.7, { tag: 'kotao', col: '#24272c', bleed: '#14161a' }, 0, 0, 0, [0.22, 1.15, 0.22]);
    smoke.push(V(52, TOWN_Y + 3.75, -22.7));
  });
  people.push({ kind: 'visConductor', x: 47.4, y: TOWN_Y + 0.69, z: -17.0, ry: Math.PI / 2, tag: 'kondukter' });

  // ==================== 7. ZONE 5: VIŠEGRADSKA BANJA THERMAL SPA & AUTUMN HARVEST (9 words) ====================
  // Thermal spa pavilion on west bank at (-42, TOWN_Y, -16): 'kupka', 'mermer', 'ogrtac', 'vrc'
  b.object(() => {
    // Veined white marble thermal basin ('mermer') & turquoise steaming water ('kupka')
    const MR = { tag: 'mermer', col: '#f5f2eb', bleed: '#d6d0c2', pat: PAT.blocks, ps: 0.8, orb: 'mermer' };
    box(6.4, 0.72, 0.65, -42, TOWN_Y + 0.36, -13.1, MR);
    box(6.4, 0.72, 0.65, -42, TOWN_Y + 0.36, -18.9, MR);
    box(0.65, 0.72, 5.4, -44.9, TOWN_Y + 0.36, -16.0, MR);
    box(0.65, 0.72, 5.4, -39.1, TOWN_Y + 0.36, -16.0, MR);
    box(5.2, 0.22, 5.2, -42, TOWN_Y + 0.48, -16.0, { tag: 'kupka', col: '#48c9c2', bleed: '#289993', pat: PAT.water, hatch: 0, water: true, ink: false, orb: 'kupka' });
    smoke.push(V(-42, TOWN_Y + 0.75, -16.0));
    // Open pavilion pillars + roof sheltering the spa pool
    for (const px of [-45.2, -38.8]) for (const pz of [-19.2, -12.8]) {
      A(CYL12, px, TOWN_Y + 2.0, pz, { tag: 'town', col: TRAV_L[0], bleed: TRAV_L[1] }, 0, 0, 0, [0.24, 4.0, 0.24]);
    }
    A(hipRoofGeo(7.6, 7.6, 2.3), -42, TOWN_Y + 4.0, -16, { tag: 'town', col: '#5c6662', bleed: '#3d4542', pat: PAT.roof });
    // Folded soft cream bathrobe ('ogrtac') hanging on wooden spa peg at (-38.8, TOWN_Y, -12.2)
    box(0.18, 1.45, 0.18, -37.2, TOWN_Y + 0.72, -14.2, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] });
    box(0.58, 0.92, 0.22, -37.2, TOWN_Y + 1.15, -14.2, { tag: 'ogrtac', col: '#faf4e6', bleed: '#dfd5be', orb: 'ogrtac' });
    box(0.62, 0.10, 0.26, -37.2, TOWN_Y + 1.08, -14.2, { tag: 'ogrtac', col: '#5aa69c', bleed: '#397870' });
    // Glazed ceramic mineral water pitcher ('vrc') resting on the marble ledge at (-39.1, TOWN_Y + 0.72, -16.8)
    A(SPHERE, -39.1, TOWN_Y + 0.98, -16.8, { tag: 'vrc', col: '#4888b5', bleed: '#2d5e82', hull: true, orb: 'vrc' }, 0, 0, 0, [0.22, 0.30, 0.22]);
    A(CYL12, -39.1, TOWN_Y + 1.32, -16.8, { tag: 'vrc', col: '#4888b5', bleed: '#2d5e82' }, 0, 0, 0, [0.10, 0.22, 0.10]);
  });

  // Autumn harvest & veranda table at (-38, TOWN_Y, -26): 'vaga', 'lula', 'sipak', 'drenjina', 'glog'
  b.object(() => {
    box(3.0, 0.82, 1.2, -38, TOWN_Y + 0.41, -26, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
    // Twin-pan brass apothecary balance ('vaga') at (-39.0, TOWN_Y + 0.82, -26)
    A(CYL, -39.0, TOWN_Y + 1.14, -26, { tag: 'vaga', col: '#e3b83b', bleed: '#b0881c', orb: 'vaga' }, 0, 0, 0, [0.05, 0.62, 0.05]);
    box(0.76, 0.05, 0.05, -39.0, TOWN_Y + 1.42, -26, { tag: 'vaga', col: '#e3b83b', bleed: '#b0881c' });
    for (const ox of [-0.34, 0.34]) A(CYL12, -39.0 + ox, TOWN_Y + 1.10, -26, { tag: 'vaga', col: '#e8c456', bleed: '#b89428' }, 0, 0, 0, [0.16, 0.05, 0.16]);
    // Carved walnut smoking pipe ('lula') at (-37.4, TOWN_Y + 0.86, -26)
    box(0.46, 0.06, 0.06, -37.5, TOWN_Y + 0.88, -26.0, { tag: 'lula', col: '#5c3820', bleed: '#3b2110', orb: 'lula' }, 0.2);
    A(CYL12, -37.25, TOWN_Y + 0.98, -25.95, { tag: 'lula', col: '#6e4226', bleed: '#472814' }, 0, 0, 0, [0.10, 0.22, 0.10]);
    // Baskets of scarlet rosehips ('sipak') & ruby cornelian cherries ('drenjina') beside table
    for (const [bx, tid, c1, c2] of [[-41.5, 'sipak', '#d93829', '#9c2015'], [-43.8, 'drenjina', '#a81e3b', '#6e1024']]) {
      A(new THREE.CylinderGeometry(0.54, 0.42, 0.44, 10), bx, TOWN_Y + 0.22, -26, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        A(SPHERE, bx + Math.cos(a) * 0.22, TOWN_Y + 0.50, -26 + Math.sin(a) * 0.22, { tag: tid, col: c1, bleed: c2, hull: true, orb: tid }, 0, 0, 0, [0.11, 0.16, 0.11]);
      }
    }
    // Autumn crimson hawthorn berry bush ('glog') at (-34.2, TOWN_Y, -28)
    A(ICO, -34.2, TOWN_Y + 0.95, -28, { tag: 'glog', col: '#698a38', bleed: '#456120', hull: true, sway: 0.10, orb: 'glog' }, 0, 0, 0, [1.25, 1.05, 1.25]);
    for (const [ox, oy, oz] of [[-0.5, 1.2, 0.7], [0.4, 1.4, 0.6], [0.0, 1.6, 0.8], [-0.7, 0.9, 0.5], [0.6, 1.0, 0.6]]) {
      A(SPHERE, -34.2 + ox, TOWN_Y + oy, -28 + oz, { tag: 'glog', col: '#d92e2e', bleed: '#961919', hull: true }, 0, 0, 0, 0.13);
    }
  });

  // ==================== 8. ZONE 6: DRINA GORGE AUTUMN WILDLIFE & GOLDEN CLIFFS (11 words) ====================
  // Towering golden-copper autumn beech trees ('bukva') on NW & NE forest terraces (y = FOREST_Y)
  for (const [bx, bz, s] of [[-40, -48, 1.15], [-52, -56, 1.1], [40, -52, 1.1]]) {
    b.object(() => {
      A(CYL, bx, FOREST_Y + 2.6 * s, bz, { tag: 'bukva', col: '#8a8278', bleed: '#635d55', orb: 'bukva' }, 0, 0, 0, [0.36 * s, 5.2 * s, 0.36 * s]);
      A(ICO, bx, FOREST_Y + 5.8 * s, bz, { tag: 'bukva', col: '#e3962e', bleed: '#b86818', hull: true, sway: 0.14 }, 0, 0, 0, [2.7 * s, 2.4 * s, 2.7 * s]);
    });
  }
  // Autumn acorns ('zir') & fallen rough-barked woodland trunk ('kora') on NW terrace
  b.object(() => {
    for (const [ax, az] of [[-35.0, -44.2], [-34.2, -44.6], [-34.6, -43.8], [-35.4, -44.8]]) {
      A(SPHERE, ax, FOREST_Y + 0.16, az, { tag: 'zir', col: '#9c6632', bleed: '#6e441d', hull: true, orb: 'zir' }, 0, 0, 0, [0.14, 0.18, 0.14]);
      A(HEMI, ax, FOREST_Y + 0.24, az, { tag: 'zir', col: '#5c3b20', bleed: '#3b2412' }, 0, 0, 0, [0.16, 0.11, 0.16]);
    }
    // Fallen rough-barked log ('kora') at (-46, FOREST_Y, -44)
    A(CYL12, -46, FOREST_Y + 0.42, -44, { tag: 'kora', col: '#6b4d32', bleed: '#47311d', pat: PAT.planks, ps: 2, orb: 'kora' }, 0.35, Math.PI / 2, 0, [0.44, 3.6, 0.44]);
  });

  // Sheer jagged pale limestone cliff crag ('litica') overhanging NE river bend at (31, FOREST_Y, -44) with chamois ('divokoza') & pine marten ('kuna')
  b.object(() => {
    const LT = { tag: 'litica', col: '#d9d4c7', bleed: '#aba596', hull: true, orb: 'litica' };
    A(ICO, 31.0, FOREST_Y + 1.2, -44.0, LT, 0.4, 0, 0, [3.8, 2.4, 3.2]);
    A(ICO, 29.2, FOREST_Y + 2.4, -44.6, LT, 1.1, 0, 0, [2.6, 2.2, 2.4]);
    A(ICO, 32.6, FOREST_Y + 2.0, -43.4, LT, 2.0, 0, 0, [2.4, 2.0, 2.2]);
    A(ICO, 31.0, FOREST_Y + 3.6, -44.0, { tag: 'litica', col: '#e6e1d5', bleed: '#bab3a4', hull: true }, 0.7, 0, 0, [2.5, 1.4, 2.2]);
    // Nimble chamois mountain goat ('divokoza') standing proudly atop the limestone crag
    const DV = { tag: 'divokoza', col: '#8c694a', bleed: '#5e442e', hull: true, orb: 'divokoza' };
    A(ICO, 31, FOREST_Y + 5.45, -44, DV, 0, 0, 0, [0.28, 0.28, 0.54]);
    A(SPHERE, 31, FOREST_Y + 5.86, -43.4, { tag: 'divokoza', col: '#e8dec8', bleed: '#bfb49b', hull: true }, 0, 0, 0, [0.16, 0.16, 0.22]);
    for (const hx of [-0.08, 0.08]) A(CONE4, 31 + hx, FOREST_Y + 6.14, -43.44, { tag: 'divokoza', col: '#2b2826', bleed: '#171514' }, 0, -0.35, 0, [0.04, 0.28, 0.04]);
    for (const lx of [-0.15, 0.15]) for (const lz of [-0.30, 0.30]) A(CYL, 31 + lx, FOREST_Y + 5.0, -44 + lz, { tag: 'divokoza', col: '#4a3a2e', bleed: '#2e231b' }, 0, 0, 0, [0.06, 0.72, 0.06]);
    // Agile pine marten ('kuna') perched on mossy boulder at (-32, FOREST_Y, -42)
    A(ICO, -32, FOREST_Y + 0.4, -42, { tag: 'hills', col: STONE_G[0], bleed: STONE_G[1], hull: true }, 0, 0, 0, [0.9, 0.5, 0.8]);
    const KU = { tag: 'kuna', col: '#784c2c', bleed: '#52321b', hull: true, orb: 'kuna' };
    A(ICO, -32, FOREST_Y + 1.05, -42, KU, 0, 0, 0, [0.16, 0.15, 0.38]);
    A(SPHERE, -32, FOREST_Y + 1.18, -41.58, { tag: 'kuna', col: '#f5e4b8', bleed: '#cfb986', hull: true }, 0, 0, 0, 0.13);
    A(CYL, -32, FOREST_Y + 1.02, -42.55, KU, 0, Math.PI / 2, 0, [0.07, 0.45, 0.07]);
  });

  // Animated Drina fish: giant Danube salmon ('mladica') & whiskered catfish ('som') cruising beneath the turquoise surface
  {
    const mg = new THREE.Group(); mg.position.set(-9.5, 0.08, -16); scene.add(mg);
    dynMesh(SPHERE, 'mladica', '#a8b8c4', '#70828f', mg, 0, 0, 0, [0.22, 0.20, 0.92], 1.1);
    dynMesh(CONE4, 'mladica', '#8a9ba8', '#5e6d78', mg, 0, 0, -1.05, [0.06, 0.42, 0.30], 1.0).rotation.x = -Math.PI / 2;
    fish.push({ g: mg, home: V(-9.5, 0.08, -16), rx: 4.5, rz: 3.2, speed: 0.45, phase: 0 });

    const sg = new THREE.Group(); sg.position.set(10.5, 0.08, -14); scene.add(sg);
    dynMesh(SPHERE, 'som', '#4e594c', '#313830', sg, 0, 0, 0, [0.34, 0.22, 0.98], 1.1);
    dynMesh(CONE4, 'som', '#3e473c', '#252b24', sg, 0, 0, -1.10, [0.08, 0.48, 0.28], 1.0).rotation.x = -Math.PI / 2;
    for (const wx of [-0.28, 0.28]) dynMesh(BOX, 'som', '#2b2e29', '#171916', sg, wx, -0.02, 0.90, [0.38, 0.03, 0.03], 1.0).rotation.y = wx > 0 ? -0.4 : 0.4;
    fish.push({ g: sg, home: V(10.5, 0.08, -14), rx: 3.8, rz: 2.8, speed: 0.35, phase: 2.4 });
  }

  // Perched canyon goshawk ('jastreb') on a cliff rock at (-29, FOREST_Y, -48)
  {
    A(ICO, -29, FOREST_Y + 0.75, -48, { tag: 'hills', col: STONE_G[0], bleed: STONE_G[1], hull: true }, 0, 0, 0, [1.2, 0.9, 1.1]);
    const jg = new THREE.Group(); jg.position.set(-29, FOREST_Y + 1.55, -48); scene.add(jg);
    dynMesh(ICO, 'jastreb', '#63605b', '#3f3d39', jg, 0, 0.36, 0, [0.24, 0.36, 0.26], 1.1);
    dynMesh(SPHERE, 'jastreb', '#8c8880', '#5e5b55', jg, 0, 0.78, 0.06, 0.16, 1.1);
    dynMesh(CONE4, 'jastreb', '#e8b62c', '#b88b14', jg, 0, 0.76, 0.26, [0.055, 0.18, 0.055], 1.0).rotation.x = Math.PI / 2;
    birds.push({ g: jg, ry: 0.5, phase: 0.2 });
  }

  // ==================== 9. ZONE 7: BIKAVAC HILLTOP, MEDIEVAL RUINS & AUTUMN FOOTPATH (6 words, Stage 2!) ====================
  // Winding cobblestone footpath ('puteljak') grounded cleanly up the hillside from NE terrace to Bikavac Hill
  b.object(() => {
    const PT = { tag: 'puteljak', col: '#d9ceb8', bleed: '#b5a890', pat: PAT.cobble, ps: 0.75, orb: 'puteljak' };
    for (let i = 0; i < 10; i++) {
      const topY = FOREST_Y + 1.4 + i * 1.35;
      const h = topY - (FOREST_Y - 1.0);
      box(3.8, h, 2.4, 21.5 - i * 1.35, FOREST_Y - 1.0 + h / 2, -55 - i * 1.15, PT);
    }
  });

  // Ancient medieval stone fortress ruins ('rusevina', Stage 2!) crowning Bikavac Hill at (0, HILL_Y, -76) + climbing ivy ('brsljan')
  b.object(() => {
    const RV = { tag: 'rusevina', col: '#d4cab4', bleed: '#aba088', pat: PAT.blocks, ps: 0.6, pool: 0.85, orb: 'rusevina' };
    // Weathered stepped ruined fortress walls & broken central keep tower
    box(22, 4.2, 2.0, 0, HILL_Y + 2.1, -66, RV);
    box(16, 3.4, 2.0, -3, HILL_Y + 1.7, -86, RV);
    box(2.0, 4.8, 22, -10.5, HILL_Y + 2.4, -76, RV);
    box(2.0, 3.6, 20, 10.5, HILL_Y + 1.8, -76, RV);
    // Ruined medieval keep rising on the northwest crest
    box(6.2, 11.5, 6.2, -3.5, HILL_Y + 5.75, -78, RV);
    box(3.2, 3.2, 6.2, -5.0, HILL_Y + 13.0, -78, RV);
    // Cascading evergreen ivy vines ('brsljan') clinging down the south ruin wall
    const BR = { tag: 'brsljan', col: '#3b7d34', bleed: '#24571e', hull: true, orb: 'brsljan' };
    for (const [ix, iy, r] of [[-5.6, 3.8, 0.9], [-5.2, 2.6, 0.85], [-5.8, 1.5, 0.8], [-4.5, 3.1, 0.75], [-4.8, 1.8, 0.7]]) {
      A(ICO, ix, HILL_Y + iy, -64.75, BR, 0, 0, 0, [r, r * 0.9, 0.32]);
    }
  });

  // Autumn traveller ('putnik') on Bikavac lookout + raven ('gavran') & magpie ('svraka')
  people.push({ kind: 'visTraveller', x: 5.2, y: HILL_Y + 0.04, z: -63.2, ry: 0, tag: 'putnik' });
  {
    const gv = new THREE.Group(); gv.position.set(-1.5, HILL_Y + 4.25, -66); scene.add(gv);
    dynMesh(ICO, 'gavran', '#22252b', '#121418', gv, 0, 0.28, 0, [0.18, 0.22, 0.34], 1.1);
    dynMesh(SPHERE, 'gavran', '#22252b', '#121418', gv, 0, 0.54, 0.18, 0.13, 1.1);
    dynMesh(CONE4, 'gavran', '#3a3e45', '#202226', gv, 0, 0.52, 0.35, [0.045, 0.20, 0.045], 1.0).rotation.x = Math.PI / 2;
    birds.push({ g: gv, ry: 0.2, phase: 1.4 });

    const sv = new THREE.Group(); sv.position.set(8.2, HILL_Y + 4.25, -66); scene.add(sv);
    dynMesh(ICO, 'svraka', '#1f2329', '#121418', sv, 0, 0.24, 0, [0.15, 0.18, 0.28], 1.1);
    dynMesh(SPHERE, 'svraka', '#f5f5f2', '#d6d6d0', sv, 0, 0.20, 0.06, [0.13, 0.14, 0.18], 1.0);
    dynMesh(BOX, 'svraka', '#1f2329', '#121418', sv, 0, 0.26, -0.36, [0.08, 0.04, 0.45], 1.0).rotation.x = 0.25;
    birds.push({ g: sv, ry: -0.3, phase: 2.8 });
  }

  // Scenic Old Višegrad Bosnian stone houses with timber windows & doors, lush golden autumn trees & strollers
  for (const [hx, hz, w, d, h] of [
    [-44, 6, 6.6, 5.4, 3.2], [-56, -4, 6.8, 5.6, 3.0], [-48, 38, 6.6, 5.4, 3.0],
    [35, 7, 6.6, 5.4, 3.1], [58, 12, 6.8, 5.6, 3.0], [56, 28, 6.4, 5.2, 2.9],
  ]) {
    box(w, 1.4, d, hx, TOWN_Y + 0.7, hz, { tag: 'town', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.7 });
    box(w + 0.4, h, d + 0.4, hx, TOWN_Y + 1.4 + h / 2, hz, { tag: 'town', col: LIME[0], bleed: LIME[1] });
    A(hipRoofGeo(w + 1.1, d + 1.1, 2.8), hx, TOWN_Y + 1.4 + h, hz, { tag: 'town', col: TILE[0], bleed: TILE[1], pat: PAT.roof });
    box(0.95, 1.25, 0.18, hx - w * 0.24, TOWN_Y + 2.9, hz + d / 2 + 0.22, { tag: 'town', col: '#4a3525', solid: false });
    box(0.95, 1.25, 0.18, hx + w * 0.24, TOWN_Y + 2.9, hz + d / 2 + 0.22, { tag: 'town', col: '#4a3525', solid: false });
    box(0.90, 1.35, 0.18, hx, TOWN_Y + 0.7, hz + d / 2 + 0.08, { tag: 'town', col: '#3d2818', solid: false });
  }
  // Golden-amber, russet-orange & deep pine autumn trees lining both Drina banks, canyon slopes & Bikavac ('hills' / 'riverbank')
  const autumnTrees = [
    [-34, TOWN_Y, 44, 1.15, '#e8a832', '#b87616', 'riverbank'],
    [-58, TOWN_Y, 38, 1.2, '#d46828', '#9c4314', 'riverbank'],
    [-60, TOWN_Y, 12, 1.15, '#ebb838', '#bf881b', 'riverbank'],
    [-54, TOWN_Y, -24, 1.25, '#c95424', '#8f3412', 'riverbank'],
    [-32, TOWN_Y, -34, 1.05, '#e3a230', '#b07216', 'riverbank'],
    [34, TOWN_Y, 46, 1.15, '#e6a632', '#b37416', 'riverbank'],
    [60, TOWN_Y, 42, 1.2, '#d46626', '#994112', 'riverbank'],
    [64, TOWN_Y, 2, 1.15, '#ebba3a', '#bd8a1c', 'riverbank'],
    [64, TOWN_Y, -26, 1.2, '#4a7a40', '#2e5226', 'riverbank'],
    // North gorge autumn woodland terraces
    [-64, FOREST_Y, -46, 1.25, '#d96e26', '#9e4612', 'hills'],
    [-62, FOREST_Y, -64, 1.3, '#44703b', '#2a4a24', 'hills'],
    [-36, FOREST_Y, -62, 1.15, '#e8ab32', '#b57a16', 'hills'],
    [48, FOREST_Y, -46, 1.2, '#d66924', '#9c4312', 'hills'],
    [62, FOREST_Y, -58, 1.3, '#426e38', '#294722', 'hills'],
    [44, FOREST_Y, -66, 1.15, '#ebb536', '#b88218', 'hills'],
    // Bikavac flanking hillside trees seated cleanly at hillside top
    [-25, 19.2, -72, 1.05, '#e39a2b', '#ad6a14', 'hills'],
    [25, 19.2, -72, 1.05, '#d66826', '#994112', 'hills'],
  ];
  for (const [tx, ty, tz, s, c1, c2, tg] of autumnTrees) {
    A(CYL, tx, ty + 2.0 * s, tz, { tag: tg, col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.28 * s, 4.0 * s, 0.28 * s]);
    A(ICO, tx, ty + 4.6 * s, tz, { tag: tg, col: c1, bleed: c2, hull: true, sway: 0.14 }, 0, 0, 0, [2.15 * s, 1.9 * s, 2.15 * s]);
  }
  // Background townsfolk strolling across the bridge & square ('passerby')
  people.push({ kind: 'walk', x: -12, y: BRIDGE_Y + 0.40, z: 0.2, to: [12, 0.2], tag: 'passerby', woman: true });
  people.push({ kind: 'chat', x: -34, y: TOWN_Y + 0.04, z: 18, ry: 0.8, tag: 'passerby' });
  people.push({ kind: 'chat', x: -32.8, y: TOWN_Y + 0.04, z: 18.4, ry: -2.3, tag: 'passerby', woman: true });

  // ==================== 10. ALL 67 ORBS, GATES & HAND-TUNED CAMERAS ====================
  // Zone 1: Mehmed Paša Sokolović Bridge & Emerald Drina (11)
  orbs.push({
    id: 'lukovi', focus: V(0, 3.8, 0), size: 22.0, tags: ['lukovi'], shot: 'combo',
    at: V(0, 8.6, 8.5), stage: 0,
    swim: { p: [0, 0, 8.5], r: 10.0 },
    view: { from: [-18, 9.5, 22], to: [18, 9.5, 22], look: [0, 3.8, 0] },
    wideView: { from: [-28, 16, 40], to: [28, 16, 40], look: [0, 4.0, 0], lookTo: [0, 4.0, 0] },
  });
  orb('jedanaest', [0, 3.0, 3.15], 24.0, ['jedanaest'], 'combo', 8.2, {
    requires: ['lukovi'], at: V(-10, 8.2, 6.5), swim: { p: [-10, 0, 6.5], r: 9.0 },
    view: { from: [-24, 8.5, 24], to: [24, 8.5, 24], look: [0, 3.0, 3.0] },
    wideView: { from: [-30, 14, 38], to: [30, 14, 38], look: [0, 3.2, 2.0], lookTo: [0, 3.2, 2.0] },
  });
  orb('sofa', [0, BRIDGE_Y + 0.9, 4.75], 3.2, ['sofa'], 'close', BRIDGE_Y + 2.2, {
    at: V(0, BRIDGE_Y + 2.2, 1.4), near: { p: [0, BRIDGE_Y + 0.4, 1.4], r: 4.5 },
    view: { from: [-4.5, BRIDGE_Y + 3.2, 0.2], to: [4.5, BRIDGE_Y + 3.2, 0.2], look: [0, BRIDGE_Y + 0.9, 4.75] },
  });
  orb('tarih', [0, BRIDGE_Y + 2.8, -3.8], 3.8, ['tarih'], 'close', BRIDGE_Y + 5.6, {
    at: V(0, BRIDGE_Y + 2.2, -0.6), near: { p: [0, BRIDGE_Y + 0.4, -0.6], r: 4.5 },
    view: { from: [-4.5, BRIDGE_Y + 3.4, 2.6], to: [4.5, BRIDGE_Y + 3.4, 2.6], look: [0, BRIDGE_Y + 2.8, -3.8] },
  });
  orb('ploca', [0, BRIDGE_Y + 3.4, -3.45], 1.8, ['ploca'], 'close', BRIDGE_Y + 4.4, {
    requires: ['tarih'], at: V(0, BRIDGE_Y + 2.4, -0.8), near: { p: [0, BRIDGE_Y + 0.4, -0.8], r: 4.2 },
    view: { from: [-2.2, BRIDGE_Y + 3.6, 0.6], to: [2.2, BRIDGE_Y + 3.6, 0.6], look: [0, BRIDGE_Y + 3.4, -3.45] },
  });
  orb('tirkiz', [0, 0.3, 12], 18.0, ['tirkiz'], 'combo', 2.2, {
    at: V(0, 2.4, 20), swim: { p: [0, 0, 20], r: 10.0 },
    view: { from: [-16, 10, 36], to: [16, 10, 36], look: [0, 0.3, 8] },
    wideView: { from: [-24, 18, 48], to: [24, 18, 48], look: [0, 0.4, 0], lookTo: [0, 0.4, -14] },
  });
  orb('splavar', [-10.0, 1.0, 16.0], 3.4, ['splavar'], 'close', 2.4, {
    at: V(-10.0, 2.8, 16.0), swim: { p: [-10.0, 0, 16.0], r: 7.0 },
    view: { from: [-5.0, 3.4, 21.5], to: [-15.0, 3.4, 21.5], look: [-10.0, 1.0, 16.0] },
  });
  orb('veslar', [11.0, 0.9, 18.0], 3.2, ['veslar'], 'close', 2.2, {
    at: V(11.0, 2.6, 18.0), swim: { p: [11.0, 0, 18.0], r: 7.0 },
    view: { from: [6.0, 3.2, 23.0], to: [16.0, 3.2, 23.0], look: [11.0, 0.9, 18.0] },
  });
  orb('klesar', [-34.0, TOWN_Y + 1.1, 8.3], 1.8, ['klesar'], 'close', TOWN_Y + 2.2, {
    near: { p: [-31.5, TOWN_Y + 0.2, 8.3], r: 3.8 },
    view: { from: [-30.6, TOWN_Y + 2.2, 10.8], to: [-30.6, TOWN_Y + 2.2, 5.8], look: [-34.0, TOWN_Y + 1.1, 8.3] },
  });
  orb('dlijeto', [-34.4, TOWN_Y + 1.0, 7.0], 1.2, ['dlijeto'], 'close', TOWN_Y + 1.6, {
    requires: ['klesar'], near: { p: [-34.4, TOWN_Y + 0.2, 5.2], r: 3.6 },
    view: { from: [-33.0, TOWN_Y + 1.9, 4.8], to: [-35.8, TOWN_Y + 1.9, 4.8], look: [-34.4, TOWN_Y + 1.0, 7.0] },
  });
  orb('cekic', [-33.4, TOWN_Y + 1.0, 7.0], 1.2, ['cekic'], 'close', TOWN_Y + 1.6, {
    requires: ['klesar'], near: { p: [-33.4, TOWN_Y + 0.2, 5.2], r: 3.6 },
    view: { from: [-32.0, TOWN_Y + 1.9, 4.8], to: [-34.8, TOWN_Y + 1.9, 4.8], look: [-33.4, TOWN_Y + 1.0, 7.0] },
  });

  // Zone 2: Andrićgrad & Ivo Andrić Literary Quarter (10)
  orb('kino', [-54, TOWN_Y + 3.8, 22], 9.0, ['kino'], 'close', TOWN_Y + 9.2, {
    at: V(-46.5, TOWN_Y + 2.6, 22), near: { p: [-46.5, TOWN_Y + 0.2, 22], r: 5.5 },
    view: { from: [-38, TOWN_Y + 5.8, 30], to: [-38, TOWN_Y + 5.8, 14], look: [-52, TOWN_Y + 3.6, 22] },
  });
  orb('bista', [-42, TOWN_Y + 2.8, 20], 1.8, ['bista'], 'close', TOWN_Y + 3.7, {
    near: { p: [-39.5, TOWN_Y + 0.2, 20], r: 4.0 },
    view: { from: [-38.5, TOWN_Y + 3.2, 22.8], to: [-38.5, TOWN_Y + 3.2, 17.2], look: [-42, TOWN_Y + 2.7, 20] },
  });
  orb('knjizevnik', [-38.5, TOWN_Y + 1.1, 29.6], 1.8, ['knjizevnik'], 'close', TOWN_Y + 2.2, {
    near: { p: [-38.5, TOWN_Y + 0.2, 27.6], r: 3.8 },
    view: { from: [-35.8, TOWN_Y + 2.2, 26.8], to: [-41.2, TOWN_Y + 2.2, 26.8], look: [-38.5, TOWN_Y + 1.1, 29.6] },
  });
  orb('roman', [-40.0, TOWN_Y + 1.0, 31.0], 1.3, ['roman'], 'close', TOWN_Y + 1.6, {
    near: { p: [-40.0, TOWN_Y + 0.2, 33.2], r: 3.6 },
    view: { from: [-38.6, TOWN_Y + 2.0, 33.4], to: [-41.4, TOWN_Y + 2.0, 33.4], look: [-40.0, TOWN_Y + 1.0, 31.0] },
  });
  orb('korice', [-40.0, TOWN_Y + 0.92, 31.0], 1.3, ['korice'], 'close', TOWN_Y + 1.5, {
    requires: ['roman'], near: { p: [-40.0, TOWN_Y + 0.2, 33.2], r: 3.6 },
    view: { from: [-38.8, TOWN_Y + 1.8, 33.2], to: [-41.2, TOWN_Y + 1.8, 33.2], look: [-40.0, TOWN_Y + 0.92, 31.0] },
  });
  orb('stranica', [-39.78, TOWN_Y + 1.06, 31.0], 1.2, ['stranica'], 'close', TOWN_Y + 1.6, {
    requires: ['roman'], near: { p: [-39.78, TOWN_Y + 0.2, 33.2], r: 3.6 },
    view: { from: [-38.6, TOWN_Y + 1.9, 33.0], to: [-41.0, TOWN_Y + 1.9, 33.0], look: [-39.78, TOWN_Y + 1.06, 31.0] },
  });
  orb('hronika', [-38.7, TOWN_Y + 1.04, 30.85], 1.3, ['hronika'], 'close', TOWN_Y + 1.6, {
    near: { p: [-38.7, TOWN_Y + 0.2, 33.2], r: 3.6 },
    view: { from: [-37.3, TOWN_Y + 2.0, 33.4], to: [-40.1, TOWN_Y + 2.0, 33.4], look: [-38.7, TOWN_Y + 1.04, 30.85] },
  });
  orb('mastilo', [-37.8, TOWN_Y + 1.08, 31.1], 1.1, ['mastilo'], 'close', TOWN_Y + 1.6, {
    near: { p: [-37.8, TOWN_Y + 0.2, 33.2], r: 3.6 },
    view: { from: [-36.6, TOWN_Y + 1.9, 33.2], to: [-39.0, TOWN_Y + 1.9, 33.2], look: [-37.8, TOWN_Y + 1.08, 31.1] },
  });
  orb('pecat', [-37.2, TOWN_Y + 1.06, 31.2], 1.1, ['pecat'], 'close', TOWN_Y + 1.6, {
    near: { p: [-37.2, TOWN_Y + 0.2, 33.2], r: 3.6 },
    view: { from: [-36.0, TOWN_Y + 1.9, 33.2], to: [-38.4, TOWN_Y + 1.9, 33.2], look: [-37.2, TOWN_Y + 1.06, 31.2] },
  });
  orb('svitak', [-36.5, TOWN_Y + 1.0, 30.9], 1.2, ['svitak'], 'close', TOWN_Y + 1.6, {
    near: { p: [-36.5, TOWN_Y + 0.2, 33.2], r: 3.6 },
    view: { from: [-35.2, TOWN_Y + 1.9, 33.2], to: [-37.8, TOWN_Y + 1.9, 33.2], look: [-36.5, TOWN_Y + 1.0, 30.9] },
  });

  // Zone 3: Old Višegrad Smithy, Timber Yard & Bazaar (10)
  orb('kovac', [38.2, TOWN_Y + 1.1, 18.0], 1.8, ['kovac'], 'close', TOWN_Y + 2.2, {
    near: { p: [36.0, TOWN_Y + 0.2, 18.0], r: 3.8 },
    view: { from: [35.0, TOWN_Y + 2.3, 20.8], to: [35.0, TOWN_Y + 2.3, 15.2], look: [38.2, TOWN_Y + 1.1, 18.0] },
  });
  orb('nakovanj', [39.6, TOWN_Y + 0.86, 18.0], 1.5, ['nakovanj'], 'close', TOWN_Y + 1.5, {
    near: { p: [36.8, TOWN_Y + 0.2, 18.0], r: 4.0 },
    view: { from: [36.8, TOWN_Y + 1.9, 20.2], to: [36.8, TOWN_Y + 1.9, 15.8], look: [39.6, TOWN_Y + 0.86, 18.0] },
  });
  orb('potkovica', [40.6, TOWN_Y + 1.25, 15.6], 1.2, ['potkovica'], 'close', TOWN_Y + 1.9, {
    requires: ['kovac'], near: { p: [38.4, TOWN_Y + 0.2, 15.6], r: 3.6 },
    view: { from: [38.0, TOWN_Y + 1.7, 17.2], to: [38.0, TOWN_Y + 1.7, 14.0], look: [40.6, TOWN_Y + 1.25, 15.6] },
  });
  orb('mijeh', [39.5, TOWN_Y + 0.82, 20.2], 1.5, ['mijeh'], 'close', TOWN_Y + 1.5, {
    near: { p: [37.2, TOWN_Y + 0.2, 20.2], r: 3.8 },
    view: { from: [36.5, TOWN_Y + 1.9, 22.0], to: [36.5, TOWN_Y + 1.9, 18.4], look: [39.5, TOWN_Y + 0.82, 20.2] },
  });
  orb('klijesta', [39.2, TOWN_Y + 0.86, 22.4], 1.2, ['klijesta'], 'close', TOWN_Y + 1.5, {
    requires: ['kovac'], near: { p: [39.2, TOWN_Y + 0.2, 24.4], r: 3.6 },
    view: { from: [37.8, TOWN_Y + 1.9, 24.6], to: [40.6, TOWN_Y + 1.9, 24.6], look: [39.2, TOWN_Y + 0.86, 22.4] },
  });
  orb('kalup', [40.1, TOWN_Y + 0.94, 22.4], 1.2, ['kalup'], 'close', TOWN_Y + 1.5, {
    requires: ['kovac'], near: { p: [40.1, TOWN_Y + 0.2, 24.4], r: 3.6 },
    view: { from: [38.7, TOWN_Y + 1.9, 24.6], to: [41.5, TOWN_Y + 1.9, 24.6], look: [40.1, TOWN_Y + 0.94, 22.4] },
  });
  orb('kantar', [35.0, TOWN_Y + 1.72, 32.0], 1.8, ['kantar'], 'close', TOWN_Y + 2.8, {
    near: { p: [35.0, TOWN_Y + 0.2, 34.8], r: 3.8 },
    view: { from: [32.8, TOWN_Y + 2.1, 35.2], to: [37.2, TOWN_Y + 2.1, 35.2], look: [35.0, TOWN_Y + 1.72, 32.0] },
  });
  orb('drvosjeca', [43.2, TOWN_Y + 1.1, 36.2], 1.8, ['drvosjeca'], 'close', TOWN_Y + 2.2, {
    near: { p: [41.0, TOWN_Y + 0.2, 37.5], r: 3.8 },
    view: { from: [40.2, TOWN_Y + 2.3, 39.2], to: [45.8, TOWN_Y + 2.3, 39.2], look: [43.2, TOWN_Y + 1.1, 36.2] },
  });
  orb('klada', [46.0, TOWN_Y + 0.9, 34.0], 3.8, ['klada'], 'close', TOWN_Y + 2.0, {
    near: { p: [46.0, TOWN_Y + 0.2, 38.0], r: 4.5 },
    view: { from: [42.0, TOWN_Y + 2.8, 39.5], to: [50.0, TOWN_Y + 2.8, 39.5], look: [46.0, TOWN_Y + 0.9, 34.0] },
  });
  orb('pila', [44.3, TOWN_Y + 0.72, 34.0], 1.8, ['pila'], 'close', TOWN_Y + 1.4, {
    requires: ['klada'], near: { p: [42.2, TOWN_Y + 0.2, 34.0], r: 3.8 },
    view: { from: [41.6, TOWN_Y + 1.8, 36.2], to: [41.6, TOWN_Y + 1.8, 31.8], look: [44.3, TOWN_Y + 0.72, 34.0] },
  });

  // Zone 4: "Ćiro" Drina Canyon Narrow-Gauge Steam Railway (10)
  orb('tunel', [52, TOWN_Y + 3.0, -36.8], 6.5, ['tunel'], 'close', TOWN_Y + 6.8, {
    at: V(52, TOWN_Y + 2.6, -32.0), near: { p: [52, TOWN_Y + 0.2, -32.0], r: 5.0 },
    view: { from: [46, TOWN_Y + 4.4, -29.0], to: [58, TOWN_Y + 4.4, -29.0], look: [52, TOWN_Y + 2.8, -36.8] },
  });
  orb('kolosijek', [52, TOWN_Y + 0.2, -16], 12.0, ['kolosijek'], 'combo', TOWN_Y + 1.6, {
    at: V(52, TOWN_Y + 2.4, -4), near: { p: [52, TOWN_Y + 0.2, -4], r: 5.0 },
    view: { from: [48, TOWN_Y + 3.2, 4], to: [56, TOWN_Y + 3.2, 4], look: [52, TOWN_Y + 0.2, -14] },
    wideView: { from: [42, TOWN_Y + 10, 8], to: [60, TOWN_Y + 10, 8], look: [52, TOWN_Y + 0.5, -18], lookTo: [52, TOWN_Y + 0.5, -26] },
  });
  orb('prag', [52, TOWN_Y + 0.12, -2], 3.2, ['prag'], 'close', TOWN_Y + 1.1, {
    requires: ['kolosijek'], near: { p: [52, TOWN_Y + 0.2, 2.2], r: 4.0 },
    view: { from: [49.2, TOWN_Y + 2.0, 2.6], to: [54.8, TOWN_Y + 2.0, 2.6], look: [52, TOWN_Y + 0.12, -2.5] },
  });
  orb('skretnica', [49.6, TOWN_Y + 0.9, -6.5], 1.8, ['skretnica'], 'close', TOWN_Y + 1.9, {
    near: { p: [47.4, TOWN_Y + 0.2, -6.5], r: 3.8 },
    view: { from: [46.6, TOWN_Y + 2.0, -4.4], to: [46.6, TOWN_Y + 2.0, -8.6], look: [49.6, TOWN_Y + 0.9, -6.5] },
  });
  orb('signal', [54.8, TOWN_Y + 3.0, -10.5], 4.5, ['signal'], 'close', TOWN_Y + 5.8, {
    at: V(54.8, TOWN_Y + 2.6, -7.2), near: { p: [54.8, TOWN_Y + 0.2, -7.2], r: 4.5 },
    view: { from: [50.2, TOWN_Y + 4.2, -5.2], to: [58.4, TOWN_Y + 4.2, -5.2], look: [54.8, TOWN_Y + 3.0, -10.5] },
  });
  orb('peron', [46.2, TOWN_Y + 2.0, -16], 8.5, ['peron'], 'close', TOWN_Y + 4.4, {
    at: V(41.5, TOWN_Y + 2.4, -16), near: { p: [41.5, TOWN_Y + 0.2, -16], r: 5.0 },
    view: { from: [37, TOWN_Y + 4.2, -8], to: [37, TOWN_Y + 4.2, -24], look: [46.2, TOWN_Y + 2.0, -16] },
  });
  orb('kotao', [52, TOWN_Y + 2.1, -24.1], 4.2, ['kotao'], 'close', TOWN_Y + 3.8, {
    at: V(56.2, TOWN_Y + 2.4, -24.1), near: { p: [56.2, TOWN_Y + 0.2, -24.1], r: 4.5 },
    view: { from: [57.8, TOWN_Y + 3.2, -20.0], to: [57.8, TOWN_Y + 3.2, -28.0], look: [52, TOWN_Y + 2.0, -24.1] },
  });
  orb('kondukter', [47.4, TOWN_Y + 1.7, -17.0], 1.8, ['kondukter'], 'close', TOWN_Y + 2.9, {
    near: { p: [49.4, TOWN_Y + 0.6, -17.0], r: 4.0 },
    view: { from: [50.4, TOWN_Y + 2.5, -14.8], to: [50.4, TOWN_Y + 2.5, -19.2], look: [47.4, TOWN_Y + 1.7, -17.0] },
  });
  orb('zvizdaljka', [47.6, TOWN_Y + 1.8, -17.0], 1.2, ['zvizdaljka'], 'close', TOWN_Y + 2.6, {
    requires: ['kondukter'], near: { p: [49.4, TOWN_Y + 0.6, -17.0], r: 4.0 },
    view: { from: [49.8, TOWN_Y + 2.2, -15.6], to: [49.8, TOWN_Y + 2.2, -18.4], look: [47.6, TOWN_Y + 1.8, -17.0] },
  });
  orb('prtljag', [46.6, TOWN_Y + 1.2, -12.6], 1.6, ['prtljag'], 'close', TOWN_Y + 2.1, {
    near: { p: [49.0, TOWN_Y + 0.6, -12.6], r: 3.8 },
    view: { from: [49.6, TOWN_Y + 2.2, -10.8], to: [49.6, TOWN_Y + 2.2, -14.4], look: [46.6, TOWN_Y + 1.2, -12.6] },
  });

  // Zone 5: Višegradska Banja Thermal Spa & Autumn Harvest (9)
  orb('kupka', [-42, TOWN_Y + 0.6, -16], 5.4, ['kupka'], 'close', TOWN_Y + 2.2, {
    at: V(-36.5, TOWN_Y + 2.2, -16), near: { p: [-36.5, TOWN_Y + 0.2, -16], r: 4.5 },
    view: { from: [-34.5, TOWN_Y + 3.2, -12], to: [-34.5, TOWN_Y + 3.2, -20], look: [-42, TOWN_Y + 0.6, -16] },
  });
  orb('mermer', [-42, TOWN_Y + 0.5, -13.1], 5.8, ['mermer'], 'close', TOWN_Y + 1.8, {
    requires: ['kupka'], at: V(-42, TOWN_Y + 2.2, -10.2), near: { p: [-42, TOWN_Y + 0.2, -10.2], r: 4.5 },
    view: { from: [-38.2, TOWN_Y + 2.6, -9.0], to: [-45.8, TOWN_Y + 2.6, -9.0], look: [-42, TOWN_Y + 0.5, -13.1] },
  });
  orb('ogrtac', [-37.2, TOWN_Y + 1.15, -14.2], 1.5, ['ogrtac'], 'close', TOWN_Y + 1.9, {
    near: { p: [-35.2, TOWN_Y + 0.2, -14.2], r: 3.6 },
    view: { from: [-34.6, TOWN_Y + 1.9, -12.4], to: [-34.6, TOWN_Y + 1.9, -16.0], look: [-37.2, TOWN_Y + 1.15, -14.2] },
  });
  orb('vrc', [-39.1, TOWN_Y + 1.08, -16.8], 1.2, ['vrc'], 'close', TOWN_Y + 1.7, {
    near: { p: [-36.8, TOWN_Y + 0.2, -16.8], r: 3.6 },
    view: { from: [-36.2, TOWN_Y + 1.8, -15.4], to: [-36.2, TOWN_Y + 1.8, -18.2], look: [-39.1, TOWN_Y + 1.08, -16.8] },
  });
  orb('vaga', [-39.0, TOWN_Y + 1.18, -26], 1.3, ['vaga'], 'close', TOWN_Y + 1.8, {
    near: { p: [-39.0, TOWN_Y + 0.2, -23.8], r: 3.6 },
    view: { from: [-37.6, TOWN_Y + 2.0, -23.6], to: [-40.4, TOWN_Y + 2.0, -23.6], look: [-39.0, TOWN_Y + 1.18, -26] },
  });
  orb('lula', [-37.4, TOWN_Y + 0.94, -26], 1.1, ['lula'], 'close', TOWN_Y + 1.5, {
    near: { p: [-37.4, TOWN_Y + 0.2, -23.8], r: 3.6 },
    view: { from: [-36.0, TOWN_Y + 1.8, -23.8], to: [-38.8, TOWN_Y + 1.8, -23.8], look: [-37.4, TOWN_Y + 0.94, -26] },
  });
  orb('sipak', [-41.5, TOWN_Y + 0.55, -26], 1.4, ['sipak'], 'close', TOWN_Y + 1.2, {
    near: { p: [-41.5, TOWN_Y + 0.2, -23.8], r: 3.6 },
    view: { from: [-39.8, TOWN_Y + 1.9, -23.4], to: [-43.2, TOWN_Y + 1.9, -23.4], look: [-41.5, TOWN_Y + 0.55, -26] },
  });
  orb('drenjina', [-43.8, TOWN_Y + 0.55, -26], 1.4, ['drenjina'], 'close', TOWN_Y + 1.2, {
    near: { p: [-43.8, TOWN_Y + 0.2, -23.8], r: 3.6 },
    view: { from: [-42.1, TOWN_Y + 1.9, -23.4], to: [-45.5, TOWN_Y + 1.9, -23.4], look: [-43.8, TOWN_Y + 0.55, -26] },
  });
  orb('glog', [-34.2, TOWN_Y + 1.1, -28], 2.2, ['glog'], 'close', TOWN_Y + 2.2, {
    near: { p: [-34.2, TOWN_Y + 0.2, -25.2], r: 4.0 },
    view: { from: [-31.4, TOWN_Y + 2.2, -24.5], to: [-37.0, TOWN_Y + 2.2, -24.5], look: [-34.2, TOWN_Y + 1.1, -28] },
  });

  // Zone 6: Drina Gorge Autumn Wildlife & Golden Cliffs (11)
  orb('klisura', [0, 28, -145], 48.0, ['klisura'], 'combo', 30, {
    sky: false, at: V(0, HILL_Y + 2.6, -61), near: { p: [0, HILL_Y + 0.2, -61], r: 5.5 },
    view: { from: [-10, HILL_Y + 10, -54], to: [10, HILL_Y + 10, -54], look: [0, 26, -145] },
    wideView: { from: [-36, HILL_Y + 22, -38], to: [36, HILL_Y + 22, -38], look: [0, 28, -145], lookTo: [0, 28, -145] },
  });
  orb('litica', [31, FOREST_Y + 1.0, -44], 6.5, ['litica'], 'close', FOREST_Y + 4.8, {
    at: V(24.5, FOREST_Y + 2.0, -40), near: { p: [24.5, FOREST_Y + 0.2, -40], r: 6.0 },
    view: { from: [20, FOREST_Y + 4.5, -34], to: [32, FOREST_Y + 4.5, -34], look: [31, FOREST_Y + 1.5, -44] },
  });
  orb('bukva', [-40, FOREST_Y + 4.6, -48], 6.0, ['bukva'], 'combo', FOREST_Y + 8.8, {
    at: V(-40, FOREST_Y + 2.4, -43.5), near: { p: [-40, FOREST_Y + 0.2, -43.5], r: 4.8 },
    view: { from: [-32, FOREST_Y + 6.5, -40], to: [-48, FOREST_Y + 6.5, -40], look: [-40, FOREST_Y + 4.6, -48] },
    wideView: { from: [-28, FOREST_Y + 12, -36], to: [-58, FOREST_Y + 12, -40], look: [-44, FOREST_Y + 4.6, -50], lookTo: [-48, FOREST_Y + 4.6, -54] },
  });
  orb('zir', [-34.8, FOREST_Y + 0.22, -44.3], 1.4, ['zir'], 'close', FOREST_Y + 0.9, {
    near: { p: [-34.8, FOREST_Y + 0.2, -42.2], r: 3.6 },
    view: { from: [-33.2, FOREST_Y + 1.6, -42.0], to: [-36.4, FOREST_Y + 1.6, -42.0], look: [-34.8, FOREST_Y + 0.22, -44.3] },
  });
  orb('kora', [-46, FOREST_Y + 0.5, -44], 2.8, ['kora'], 'close', FOREST_Y + 1.3, {
    near: { p: [-46, FOREST_Y + 0.2, -41.2], r: 4.0 },
    view: { from: [-43.0, FOREST_Y + 2.0, -40.5], to: [-49.0, FOREST_Y + 2.0, -40.5], look: [-46, FOREST_Y + 0.5, -44] },
  });
  orb('brsljan', [-5.2, HILL_Y + 2.6, -64.75], 2.8, ['brsljan'], 'close', HILL_Y + 4.2, {
    at: V(-5.2, HILL_Y + 2.4, -62.2), near: { p: [-5.2, HILL_Y + 0.2, -62.2], r: 4.2 },
    view: { from: [-8.0, HILL_Y + 3.2, -60.5], to: [-2.4, HILL_Y + 3.2, -60.5], look: [-5.2, HILL_Y + 2.6, -64.75] },
  });
  orb('mladica', [-9.5, 0.25, -16], 2.6, ['mladica'], 'close', 1.4, {
    at: V(-9.5, 2.2, -16), swim: { p: [-9.5, 0, -16], r: 7.0 },
    view: { from: [-5.0, 3.0, -11.5], to: [-14.0, 3.0, -11.5], look: [-9.5, 0.2, -16] },
  });
  orb('som', [10.5, 0.25, -14], 2.6, ['som'], 'close', 1.4, {
    at: V(10.5, 2.2, -14), swim: { p: [10.5, 0, -14], r: 7.0 },
    view: { from: [6.0, 3.0, -9.5], to: [15.0, 3.0, -9.5], look: [10.5, 0.2, -14] },
  });
  orb('divokoza', [31, FOREST_Y + 5.5, -44], 1.8, ['divokoza'], 'close', FOREST_Y + 6.8, {
    at: V(28, FOREST_Y + 6.4, -40.5), near: { p: [28, FOREST_Y + 4.0, -40.5], r: 5.5 },
    view: { from: [27.5, FOREST_Y + 6.6, -40.0], to: [34.5, FOREST_Y + 6.6, -40.0], look: [31, FOREST_Y + 5.5, -44] },
  });
  orb('kuna', [-32, FOREST_Y + 1.1, -42], 1.4, ['kuna'], 'close', FOREST_Y + 1.8, {
    near: { p: [-32, FOREST_Y + 0.2, -39.6], r: 3.6 },
    view: { from: [-30.2, FOREST_Y + 2.0, -39.2], to: [-33.8, FOREST_Y + 2.0, -39.2], look: [-32, FOREST_Y + 1.1, -42] },
  });
  orb('jastreb', [-29, FOREST_Y + 2.0, -48], 1.8, ['jastreb'], 'close', FOREST_Y + 2.9, {
    near: { p: [-29, FOREST_Y + 0.2, -45.2], r: 4.0 },
    view: { from: [-26.2, FOREST_Y + 3.0, -44.5], to: [-31.8, FOREST_Y + 3.0, -44.5], look: [-29, FOREST_Y + 2.0, -48] },
  });

  // Zone 7: Bikavac Hilltop, Medieval Ruins & Golden Reflections (6 words, Stage 2!)
  orb('puteljak', [15.5, 19.0, -60.0], 8.5, ['puteljak'], 'close', 21.0, {
    at: V(19.5, 17.5, -56.5), near: { p: [19.5, 14.5, -56.5], r: 5.5 },
    view: { from: [27, 23, -44], to: [17, 26, -46], look: [15.5, 19.0, -60.0] },
  });
  orb('putnik', [5.2, HILL_Y + 1.1, -63.2], 1.8, ['putnik'], 'close', HILL_Y + 2.2, {
    near: { p: [5.2, HILL_Y + 0.2, -60.8], r: 3.8 },
    view: { from: [2.4, HILL_Y + 2.2, -60.0], to: [8.0, HILL_Y + 2.2, -60.0], look: [5.2, HILL_Y + 1.1, -63.2] },
  });
  orb('gavran', [-1.5, HILL_Y + 4.7, -66], 1.6, ['gavran'], 'close', HILL_Y + 5.6, {
    at: V(-1.5, HILL_Y + 6.0, -66), near: { p: [-1.5, HILL_Y + 4.2, -66], r: 5.0 },
    view: { from: [-4.0, HILL_Y + 5.6, -62.5], to: [1.0, HILL_Y + 5.6, -62.5], look: [-1.5, HILL_Y + 4.7, -66] },
  });
  orb('svraka', [8.2, HILL_Y + 4.6, -66], 1.5, ['svraka'], 'close', HILL_Y + 5.5, {
    at: V(8.2, HILL_Y + 5.8, -66), near: { p: [8.2, HILL_Y + 4.2, -66], r: 5.0 },
    view: { from: [5.8, HILL_Y + 5.5, -62.5], to: [10.6, HILL_Y + 5.5, -62.5], look: [8.2, HILL_Y + 4.6, -66] },
  });
  orb('odraz', [0, 0.2, 8.2], 14.0, ['odraz'], 'close', 1.6, {
    at: V(0, 2.4, 11.5), swim: { p: [0, 0, 11.5], r: 8.5 },
    view: { from: [-14, 6.5, 19], to: [14, 6.5, 19], look: [0, 0.2, 7.5] },
  });
  // Stage 2 (LAST WORD): 'rusevina' atop Bikavac Hill
  orb('rusevina', [0, HILL_Y + 5.5, -76], 16.0, ['rusevina'], 'combo', HILL_Y + 1.0, {
    stage: 2, at: V(0, HILL_Y + 2.6, -71), near: { p: [0, HILL_Y + 0.2, -71], r: 6.5 },
    view: { from: [24, HILL_Y + 12, -46], to: [-24, HILL_Y + 12, -46], look: [0, HILL_Y + 5.5, -76] },
    wideView: { from: [32, HILL_Y + 20, -36], to: [-32, HILL_Y + 20, -36], look: [0, HILL_Y + 5.5, -76], lookTo: [0, HILL_Y + 5.5, -76] },
  });

  // Paint sources for all 67 orb tags + sky/sun
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
    // Perched flush on the west stone embankment coping overlooking all 11 arches and the emerald Drina!
    start: V(-27.2, 4.12, 22.0),
    fleur: V(0, HILL_Y + 17.5, -76),
    sunPos,
    movers: [],
    // Višegrad-specific animated handles
    boat: { g: boatG, home: V(11.0, 0.14, 18.0) },
    raft: { g: raftG, home: V(-10.0, 0.14, 16.0) },
    drinaFish: fish,
    birds,
  };
}
