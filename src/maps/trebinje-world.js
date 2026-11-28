// Trebinje (autumn): 3D storybook world with Arslanagića Ottoman Bridge, spinning wooden dolap waterwheel,
// emerald Trebišnjica sinking river, golden Platani square, Old Town Kastel, Herzegovinian vineyards & olive grove,
// sunlit beekeeping apiary, Mediterranean botanical garden, karst wildlife, and Hercegovačka Gračanica on Crkvina Hill.
import * as THREE from 'three';
import { Builder, PAT, tag, rng, shared, paintGeo, washMat, addHull } from '../paper.js';
import S from '../settings.js';

export const TOWN_Y = 4.0;
export const BRIDGE_Y = 6.2;
export const HILLSIDE_Y = 11.0;
export const HILL_Y = 25.0;
export const SUN_TREBINJE = new THREE.Vector3(0.68, 0.52, 0.52).normalize();

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

function roundArchBayGeo(bayW, totalH, openW, springH, depth) {
  const hw = bayW / 2, ow = openW / 2;
  const s = new THREE.Shape();
  s.moveTo(-hw, 0);
  s.lineTo(-ow, 0);
  s.lineTo(-ow, springH);
  s.absarc(0, springH, ow, Math.PI, 0, true);
  s.lineTo(ow, 0);
  s.lineTo(hw, 0);
  s.lineTo(hw, totalH);
  s.lineTo(-hw, totalH);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 10 });
  g.translate(0, 0, -depth / 2);
  return g;
}

function dynMesh(geo, tagName, col, bleed, parent, x = 0, y = 0, z = 0, s = 1, hull = 1.2) {
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

export function buildTrebinjeWorld(scene) {
  const b = new Builder(), R = rng(427);
  const rr = (lo, hi) => lo + R() * (hi - lo);
  const A = (geo, x, y, z, o, ry = 0, rx = 0, rz = 0, s = 1) => b.add(geo, mat4(x, y, z, ry, rx, rz, s), o);
  const box = (w, h, d, x, y, z, o, ry = 0, rx = 0, rz = 0) => A(BOX, x, y, z, o, ry, rx, rz, [w, h, d]);

  // Luminous sunlit Herzegovinian golden autumn warmth
  shared.uSunDir.value.copy(SUN_TREBINJE);
  shared.uWaterDir.value.set(0, -1);
  shared.uSunShadow.value.set(0.58, 0.54, 0.60);
  shared.uSunGlow.value.set(1.0, 0.88, 0.60);
  shared.uSunTint.value.set(1.06, 1.01, 0.90);
  shared.uSkyGlow.value.set(0.98, 0.94, 0.86);

  const orbs = [], clouds = [], people = [], animals = [], smoke = [], bees = [], swallows = [];

  const orb = (id, focus, size, tags, shot, top, extra = {}) => orbs.push({
    id, focus: V(...focus), size, tags, shot,
    at: V(focus[0], top + S.orb.hoverHeight, focus[2]), stage: 1, ...extra,
  });

  // Sunlit Herzegovinian limestone & terracotta palette
  const LIME = ['#f5efe0', '#dfd5be'];
  const STONE_H = ['#e6decb', '#c4baa3'];
  const STONE_G = ['#c4beb2', '#9c968a'];
  const TILE = ['#c96236', '#994420'];
  const WOOD_D = ['#593c26', '#3d2818'];
  const WOOD_W = ['#966b3e', '#704d2a'];
  const GRASS_M = ['#99a64c', '#738032'];
  const KARST = ['#cfc8b4', '#a69e8a'];

  // ==================== 1. SKY, WARM MEDITERRANEAN SUN & CLOUDS ====================
  tag('sky').side = THREE.BackSide; tag('sky').mode = 'one'; tag('sky').radius = 1300; tag('sky').dur = 6;
  tag('sun').mode = 'one'; tag('sun').radius = 65; tag('sun').dur = 2.5;
  A(new THREE.SphereGeometry(720, 32, 20), 0, 0, 0, { tag: 'sky', col: '#b0dcf0', bleed: '#6bb0de', pat: PAT.sky, hatch: 0, ink: false, solid: false });
  const sunPos = SUN_TREBINJE.clone().multiplyScalar(520);
  const sunM = new THREE.Matrix4().lookAt(sunPos, V(0, 20, 0), V(0, 1, 0)).setPosition(sunPos);
  b.add(new THREE.CircleGeometry(28, 36).rotateY(Math.PI), sunM, { tag: 'sun', col: '#ffec99', bleed: '#f5be4c', hatch: 0, ink: false, solid: false });
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
        A(ICO, x + ox * s, y + oy * s, z + oz * s, { tag: 'hills', col: '#fffdf5', bleed: '#efe7d5', hull: true, hatch: 0.3, solid: false, sway: dr }, 0, 0, 0, [r * s, 0.58 * r * s, r * s]);
    });
  }

  for (const t of ['dolap', 'svodovi', 'ponornica', 'platan', 'vinograd', 'maslinik', 'krs', 'mediteran', 'manastir']) {
    tag(t).mode = 'one'; tag(t).radius = 120; tag(t).holdRest = 2.4;
  }
  for (const t of ['loza', 'grozd', 'smilje', 'kadulja', 'kamencic', 'saksija', 'kapak']) {
    tag(t).waveDelay = 2.2;
  }

  // ==================== 2. TERRAIN, TREBIŠNJICA CHANNEL, KARST HILLS & CRKVINA HILL ====================
  const BANK_M = { tag: 'riverbank', col: GRASS_M[0], bleed: GRASS_M[1], pat: PAT.grass };
  const TOWN_G = { tag: 'town', col: '#ded7c7', bleed: '#bfb7a4', pat: PAT.cobble, ps: 0.65 };
  const HILL_M = { tag: 'hills', col: '#a8a654', bleed: '#7e7d38', pat: PAT.grass };
  const EMB_M = { tag: 'riverbank', col: STONE_H[0], bleed: STONE_H[1], pat: PAT.blocks, ps: 0.65 };

  // Continuous grounded valley floor so sky never peeks below terrain or karst hills
  box(500, 4, 500, 0, -4.0, 0, { tag: 'hills', col: '#9e9c4e', bleed: '#757434', pat: PAT.grass, ink: false });

  // Trebišnjica riverbed (x = -17..17, z = -115..115)
  box(38, 2, 240, 0, -1.6, 0, { tag: 'riverbank', col: '#227060', bleed: '#154f43', ink: false });

  // West bank: Old Town Kastel, Platani Square, Apiary & Botanical Garden (x = -95..-17, z = -36..80)
  box(78, 6, 116, -56, TOWN_Y - 3, 22, TOWN_G);
  // East bank: Herzegovinian Vineyards, Winery & Olive Grove (x = 17..95, z = -36..80)
  box(78, 6, 116, 56, TOWN_Y - 3, 22, BANK_M);
  // Limestone embankments along Trebišnjica (x = -17.4 & x = +17.4)
  box(1.6, 4.5, 116, -17.4, 1.85, 22, EMB_M);
  box(1.6, 4.5, 116, 17.4, 1.85, 22, EMB_M);

  // North karst terraces flanking Crkvina Hill (y = HILLSIDE_Y = 11.0, z = -76..-36)
  box(72, 13, 42, -53, HILLSIDE_Y - 6.5, -57, HILL_M);
  box(72, 13, 42, 53, HILLSIDE_Y - 6.5, -57, HILL_M);
  box(72, 7.2, 1.4, -53, 7.5, -36.2, EMB_M);
  box(72, 7.2, 1.4, 53, 7.5, -36.2, EMB_M);

  // Crkvina tapered limestone-and-olive hilltop at (0, -74, plateau y = HILL_Y = 25.0)
  A(new THREE.CylinderGeometry(17.0, 35, 27, 16), 0, 11.5, -74, { tag: 'hills', col: '#a8a458', bleed: '#7d7a3c', pat: PAT.grass });
  A(CYL16, 0, 24.6, -74, { tag: 'hills', col: '#dad2be', bleed: '#b8af98', pat: PAT.cobble, ps: 0.7 }, 0, 0, 0, [17.2, 0.8, 15.2]);
  for (const [sx, sy, sz, rx, ry, rz] of [[-24, 5.5, -74, 22, 13, 20], [24, 5.5, -74, 22, 13, 20], [0, -2, -96, 36, 20, 22]]) {
    A(HEMI, sx, sy, sz, { tag: 'hills', col: '#a3a054', bleed: '#787638', pat: PAT.grass, solid: false }, 0, 0, 0, [rx, ry, rz]);
  }

  // Pale sunlit Herzegovinian limestone karst hills ('krs') on east/west + warm southern horizon ('mediteran') grounded at y = -2.5
  for (const [kx, kz, rx, ry, rz] of [[-128, -56, 62, 36, 68], [-126, 24, 58, 30, 74], [128, -56, 62, 36, 68], [126, 24, 58, 30, 74]]) {
    A(HEMI, kx, -2.5, kz, { tag: 'krs', col: KARST[0], bleed: KARST[1], pat: PAT.blocks, ps: 0.45, hull: true, solid: false, orb: 'krs' }, 0, 0, 0, [rx, ry, rz]);
  }
  for (const [mx, mz, rx, ry, rz] of [[-110, -144, 82, 46, 54], [0, -160, 96, 56, 56], [112, -142, 82, 46, 54]]) {
    A(HEMI, mx, -2.5, mz, { tag: 'mediteran', col: '#c7c1a8', bleed: '#99927a', hull: true, solid: false, orb: 'mediteran' }, 0, 0, 0, [rx, ry, rz]);
  }
  for (const [hx, hz, rx, ry, rz] of [[-62, 130, 74, 30, 52], [62, 130, 74, 30, 52]]) {
    A(HEMI, hx, -2.5, hz, { tag: 'hills', col: '#b3ae72', bleed: '#87824f', pat: PAT.grass, hull: true, solid: false }, 0, 0, 0, [rx, ry, rz]);
  }

  // ==================== 3. ZONE 1: ARSLANAGIĆA BRIDGE, TREBIŠNJICA & GIANT WOODEN DOLAP (9 words) ====================
  // Crystal emerald Trebišnjica sinking river ('ponornica')
  box(34.5, 0.12, 224, 0, -0.06, 0, {
    tag: 'ponornica', col: '#1fa892', bleed: '#107866', pat: PAT.water, hatch: 0, water: true, ink: false, orb: 'ponornica',
  });

  // Smooth white sunlit river pebbles ('kamencic') along the crystal east shallow at (14.8, 0.08, 12)
  b.object(() => {
    for (const [px, pz, r] of [[14.5, 10.6, 0.48], [15.4, 11.4, 0.36], [14.2, 12.1, 0.42], [15.2, 12.8, 0.52], [14.6, 13.6, 0.34], [15.5, 14.2, 0.40]]) {
      A(SPHERE, px, 0.12, pz, { tag: 'kamencic', col: '#f2ede0', bleed: '#cfc7b4', hull: true, orb: 'kamencic' }, 0, 0, 0, [r, r * 0.48, r * 0.85]);
    }
  });

  // Arslanagića (Perovića) Ottoman Stone Bridge ('svodovi') spanning the Trebišnjica at z = 0
  // 4 broad semicircular stone vaults with stepped pitched roadway & characteristic pier flood openings!
  b.object(() => {
    const SV = { tag: 'svodovi', col: STONE_H[0], bleed: STONE_H[1], pat: PAT.blocks, ps: 0.65, pool: 0.85, orb: 'svodovi' };
    const bigBay = roundArchBayGeo(9.2, BRIDGE_Y + 0.8, 7.2, 1.8, 4.4);
    const sideBay = roundArchBayGeo(8.4, BRIDGE_Y, 6.2, 1.4, 4.4);
    A(sideBay, -13.4, 0, 0, SV);
    A(bigBay, -4.6, 0, 0, SV);
    A(bigBay, 4.6, 0, 0, SV);
    A(sideBay, 13.4, 0, 0, SV);
    // Pointed stone cutwater piers between the vaults + deck + parapets
    for (const px of [-9.0, 0.0, 9.0]) {
      box(1.6, 4.2, 5.2, px, 2.0, 0, SV);
      A(CONE8, px, 4.3, 2.8, SV, 0, 0, 0, [0.95, 1.8, 0.95]);
    }
    box(36.0, 0.35, 4.6, 0, BRIDGE_Y + 0.8, 0, { tag: 'svodovi', col: '#dbd3be', bleed: '#b8af98', pat: PAT.cobble, ps: 0.7 });
    for (const pz of [-2.18, 2.18]) box(35.8, 0.90, 0.32, 0, BRIDGE_Y + 1.4, pz, { tag: 'svodovi', col: LIME[0], bleed: LIME[1], pat: PAT.blocks, ps: 0.8, wall: true });
    // Approach ramps down to west & east banks
    box(8.0, 2.4, 4.4, -21.2, TOWN_Y + 1.2, 0, { tag: 'town', col: STONE_H[0], bleed: STONE_H[1], pat: PAT.blocks, ps: 0.7 }, 0, 0, 0.30);
    box(8.0, 2.4, 4.4, 21.2, TOWN_Y + 1.2, 0, { tag: 'town', col: STONE_H[0], bleed: STONE_H[1], pat: PAT.blocks, ps: 0.7 }, 0, 0, -0.30);
  });

  // STAGE 0 (FIRST WORD!): Giant traditional wooden Herzegovinian river waterwheel ('dolap') on stone pier at (-14.2, 3.0, 9.5)
  // Plus central wooden axle ('osovina'), raised wooden water chute ('oluk') & stone irrigation channel ('kanal')!
  b.object(() => {
    // Stone support pier rising from river
    box(2.2, 3.6, 2.4, -15.8, 1.8, 9.5, { tag: 'town', col: STONE_H[0], bleed: STONE_H[1], pat: PAT.blocks, ps: 0.7 });
    // Wooden axle ('osovina') spanning from pier through wheel hub
    A(CYL12, -14.6, 3.0, 9.5, { tag: 'osovina', col: '#694729', bleed: '#452c17', orb: 'osovina' }, 0, 0, Math.PI / 2, [0.22, 3.4, 0.22]);
    // Elevated wooden water trough ('oluk') catching water at top of wheel and carrying it onto the bank
    box(5.6, 0.36, 0.65, -17.6, 5.8, 9.5, { tag: 'oluk', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3, orb: 'oluk' }, 0, 0, -0.08);
    for (const sx of [-16.6, -19.6]) box(0.22, 2.2, 0.22, sx, 4.7, 9.5, { tag: 'oluk', col: WOOD_D[0], bleed: WOOD_D[1] });
    // Stone garden irrigation canal ('kanal') flowing inland along west bank from (-20.4, TOWN_Y, 9.5) to (-20.4, TOWN_Y, 22)
    box(1.6, 0.32, 13.0, -20.4, TOWN_Y + 0.16, 16.0, { tag: 'kanal', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.7, orb: 'kanal' });
    box(1.0, 0.12, 12.6, -20.4, TOWN_Y + 0.30, 16.0, { tag: 'kanal', col: '#3ec7b0', bleed: '#209984', pat: PAT.water, hatch: 0, ink: false, solid: false });
  });
  // Animated giant 12-spoke wooden dolap wheel ('dolap')!
  const dolapWheel = new THREE.Group();
  dolapWheel.position.set(-14.2, 3.0, 9.5);
  scene.add(dolapWheel);
  const rim = dynMesh(new THREE.TorusGeometry(3.1, 0.16, 6, 20), 'dolap', '#8c5f34', '#5e3e1e', dolapWheel, 0, 0, 0, 1, 1.1);
  rim.rotation.y = Math.PI / 2;
  const innerRim = dynMesh(new THREE.TorusGeometry(2.3, 0.10, 6, 16), 'dolap', '#9e6f40', '#6e4a27', dolapWheel, 0, 0, 0, 1, 1.0);
  innerRim.rotation.y = Math.PI / 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const sp = dynMesh(BOX, 'dolap', '#7a502a', '#52341a', dolapWheel, 0, Math.sin(a) * 1.55, Math.cos(a) * 1.55, [0.14, 0.12, 3.1], 1.0);
    sp.rotation.x = -a;
    // Wooden scoop paddle on rim
    const pd = dynMesh(BOX, 'dolap', '#ab7946', '#7a542d', dolapWheel, 0, Math.sin(a) * 3.1, Math.cos(a) * 3.1, [0.68, 0.12, 0.44], 1.0);
    pd.rotation.x = -a + 0.3;
  }

  // ==================== 4. ZONE 2: PLATANI SQUARE, OLD TOWN KASTEL & TAVERN (10 words) ====================
  // Giant golden-amber century-old plane trees ('platan') shading Platani Square (-28..-35, TOWN_Y, 16..34)
  for (const [px, pz, s] of [[-28, 18, 1.35], [-34, 15, 1.24], [-30, 32, 1.30]]) {
    b.object(() => {
      A(CYL12, px, TOWN_Y + 2.6 * s, pz, { tag: 'platan', col: '#9e9584', bleed: '#736c5e', orb: 'platan' }, 0, 0, 0, [0.55 * s, 5.2 * s, 0.55 * s]);
      A(ICO, px, TOWN_Y + 6.4 * s, pz, { tag: 'platan', col: '#e8a832', bleed: '#ba7a16', hull: true, sway: 0.14 }, 0, 0, 0, [3.2 * s, 2.5 * s, 3.2 * s]);
      A(ICO, px + 1.4 * s, TOWN_Y + 5.8 * s, pz - 0.8 * s, { tag: 'platan', col: '#f2c249', bleed: '#c9961e', hull: true, sway: 0.14 }, 0, 0, 0, [2.0 * s, 1.6 * s, 2.0 * s]);
    });
  }
  // Shaded café terrace ('hladovina'), stone tavern ('gostionica'), feast table ('trpeza'), cured ham ('prsut'), shutters ('kapak'), flowerpots ('saksija'), calendar ('kalendar'), alley ('sokak') & corner ('cosak')
  b.object(() => {
    // Shaded café deck & umbrella terrace under the giant plane tree ('hladovina') at (-33, TOWN_Y, 25)
    box(6.0, 0.14, 5.0, -33, TOWN_Y + 0.07, 25, { tag: 'hladovina', col: '#b8b09c', bleed: '#8f8876', pat: PAT.cobble, ps: 0.8, orb: 'hladovina' });
    A(CYL, -33, TOWN_Y + 1.4, 25, { tag: 'hladovina', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.07, 2.8, 0.07]);
    A(CONE8, -33, TOWN_Y + 2.85, 25, { tag: 'hladovina', col: '#f5efe0', bleed: '#d6ccb4' }, 0, 0, 0, [1.8, 0.65, 1.8]);
    // Welcoming Old Town stone tavern ('gostionica') at (-46, TOWN_Y, 24) with green wooden shutters ('kapak'), terracotta pots ('saksija') & wall calendar ('kalendar')
    box(9.6, 6.2, 7.6, -46, TOWN_Y + 3.1, 24, { tag: 'gostionica', col: STONE_H[0], bleed: STONE_H[1], pat: PAT.blocks, ps: 0.65, orb: 'gostionica' });
    A(hipRoofGeo(10.6, 8.6, 2.8), -46, TOWN_Y + 6.2, 24, { tag: 'gostionica', col: TILE[0], bleed: TILE[1], pat: PAT.roof });
    box(0.85, 1.6, 0.85, -47.5, TOWN_Y + 8.4, 23.0, { tag: 'gostionica', col: STONE_H[0], bleed: STONE_H[1] });
    smoke.push({ x: -47.5, y: TOWN_Y + 9.3, z: 23.0 });
    box(0.24, 2.4, 1.5, -41.15, TOWN_Y + 1.2, 24, { tag: 'gostionica', col: '#4a3220', solid: false });
    // Painted Mediterranean green wooden shutters ('kapak') flanking upper windows on east facade (-41.1)
    for (const wz of [21.6, 26.4]) {
      box(0.22, 1.35, 1.0, -41.15, TOWN_Y + 4.2, wz, { tag: 'town', col: '#3a342e', solid: false });
      for (const sd of [-0.68, 0.68]) box(0.18, 1.38, 0.42, -41.05, TOWN_Y + 4.2, wz + sd, { tag: 'kapak', col: '#3e7d5a', bleed: '#25573b', orb: 'kapak' });
    }
    // Terracotta flowerpots ('saksija') flanking tavern entrance
    for (const sz of [22.4, 25.6]) {
      A(new THREE.CylinderGeometry(0.34, 0.24, 0.46, 10), -40.4, TOWN_Y + 0.23, sz, { tag: 'saksija', col: '#c96236', bleed: '#96431e', orb: 'saksija' });
      A(ICO, -40.4, TOWN_Y + 0.62, sz, { tag: 'saksija', col: '#e85d75', bleed: '#b5384e', hull: true }, 0, 0, 0, [0.34, 0.26, 0.34]);
    }
    // Hanging wall calendar ('kalendar') beside the tavern doorway at (-41.08, TOWN_Y + 1.8, 22.2)
    box(0.08, 0.62, 0.48, -41.08, TOWN_Y + 1.85, 22.0, { tag: 'kalendar', col: '#fffdf5', bleed: '#ded8c5', orb: 'kalendar' });
    box(0.10, 0.16, 0.48, -41.06, TOWN_Y + 2.08, 22.0, { tag: 'kalendar', col: '#c9382c', bleed: '#912219', solid: false });
    // Feast table ('trpeza') & cured ham platter ('prsut') outside tavern at (-38.5, TOWN_Y, 27.5)
    box(2.8, 0.82, 1.3, -38.5, TOWN_Y + 0.41, 27.5, { tag: 'trpeza', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3, orb: 'trpeza' });
    box(2.4, 0.04, 1.1, -38.5, TOWN_Y + 0.84, 27.5, { tag: 'trpeza', col: '#faf4e6', bleed: '#dfd6c0' });
    // Dry-cured Herzegovinian ham ('prsut') on wooden board
    box(0.82, 0.06, 0.56, -38.5, TOWN_Y + 0.88, 27.5, { tag: 'prsut', col: WOOD_D[0], bleed: WOOD_D[1], orb: 'prsut' });
    for (const ox of [-0.22, 0, 0.22]) box(0.18, 0.05, 0.42, -38.5 + ox, TOWN_Y + 0.93, 27.5, { tag: 'prsut', col: '#a82832', bleed: '#75171e' });
    // Cobblestone Old Town alley ('sokak') & corner stone bollard ('cosak') at (-46, TOWN_Y, 34..42)
    box(4.2, 0.12, 12.0, -44, TOWN_Y + 0.06, 37, { tag: 'sokak', col: '#cbc3b0', bleed: '#a69d8a', pat: PAT.cobble, ps: 0.75, orb: 'sokak' });
    box(0.55, 1.2, 0.55, -41.6, TOWN_Y + 0.6, 32.5, { tag: 'cosak', col: STONE_H[0], bleed: STONE_H[1], pat: PAT.blocks, ps: 0.8, orb: 'cosak' });
    box(0.62, 0.16, 0.62, -41.6, TOWN_Y + 1.24, 32.5, { tag: 'cosak', col: LIME[0], bleed: LIME[1] });
  });

  // ==================== 5. ZONE 3: HERZEGOVINIAN VINEYARDS, WINERY & OLIVE GROVE (13 words) ====================
  // East bank sunlit winery ('vinarija'), arched wine cellar ('podrum'), press ('presa'), wine ('vino'), bottles ('boca'), cork ('cep'), corkscrew ('vadicep'), vineyards ('vinograd'), vines ('loza'), grapes ('grozd'), baskets ('kosara'), olive grove ('maslinik') & olive oil ('ulje')
  b.object(() => {
    // Stone winery ('vinarija') at (42, TOWN_Y, 16)
    box(9.2, 5.8, 7.8, 42, TOWN_Y + 2.9, 16, { tag: 'vinarija', col: STONE_H[0], bleed: STONE_H[1], pat: PAT.blocks, ps: 0.65, orb: 'vinarija' });
    A(hipRoofGeo(10.2, 8.8, 2.8), 42, TOWN_Y + 5.8, 16, { tag: 'vinarija', col: TILE[0], bleed: TILE[1], pat: PAT.roof });
    // Arched stone cellar vault entrance ('podrum') on west facade (x = 37.3)
    const celGeo = roundArchBayGeo(4.4, 3.6, 2.8, 1.5, 1.8);
    A(celGeo, 36.8, TOWN_Y, 16, { tag: 'podrum', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.7, orb: 'podrum' }, Math.PI / 2);
    box(0.4, 2.6, 2.6, 37.4, TOWN_Y + 1.3, 16, { tag: 'podrum', col: '#221e1a', solid: false });
    // Wooden screw grape press ('presa') outside winery at (35.5, TOWN_Y, 21.5)
    A(CYL12, 35.5, TOWN_Y + 0.62, 21.5, { tag: 'presa', col: '#946236', bleed: '#694322', pat: PAT.planks, ps: 3, orb: 'presa' }, 0, 0, 0, [0.62, 1.15, 0.62]);
    A(CYL, 35.5, TOWN_Y + 1.45, 21.5, { tag: 'presa', col: '#3a3f45', bleed: '#212429' }, 0, 0, 0, [0.08, 0.9, 0.08]);
    box(1.15, 0.10, 0.10, 35.5, TOWN_Y + 1.82, 21.5, { tag: 'presa', col: '#3a3f45', bleed: '#212429' });
    // Tasting table at (35.5, TOWN_Y, 11.5): wine bottles ('boca'), cork ('cep'), corkscrew ('vadicep'), ruby glass ('vino') & olive oil flask ('ulje')
    box(3.4, 0.86, 1.2, 35.5, TOWN_Y + 0.43, 11.5, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
    for (const ox of [-1.2, -0.9]) {
      A(CYL12, 35.5 + ox, TOWN_Y + 1.08, 11.5, { tag: 'boca', col: '#245234', bleed: '#13331e', orb: 'boca' }, 0, 0, 0, [0.10, 0.42, 0.10]);
      A(CYL12, 35.5 + ox, TOWN_Y + 1.36, 11.5, { tag: 'boca', col: '#245234', bleed: '#13331e' }, 0, 0, 0, [0.045, 0.22, 0.045]);
    }
    A(CYL12, 35.1, TOWN_Y + 0.96, 11.7, { tag: 'cep', col: '#c99b5e', bleed: '#966e38', orb: 'cep' }, 0, 0, 0, [0.075, 0.18, 0.075]);
    box(0.32, 0.06, 0.06, 35.5, TOWN_Y + 0.96, 11.7, { tag: 'vadicep', col: '#d9b244', bleed: '#a3801c', orb: 'vadicep' });
    A(CYL, 35.5, TOWN_Y + 0.90, 11.7, { tag: 'vadicep', col: '#7d858f', bleed: '#545b63' }, 0, 0, 0, [0.03, 0.16, 0.03]);
    A(CYL12, 36.0, TOWN_Y + 1.05, 11.5, { tag: 'vino', col: '#8f1d2c', bleed: '#5c0e18', orb: 'vino' }, 0, 0, 0, [0.11, 0.26, 0.11]);
    A(CYL, 36.0, TOWN_Y + 0.90, 11.5, { tag: 'vino', col: '#e6edf2', bleed: '#c2cdd4' }, 0, 0, 0, [0.03, 0.12, 0.03]);
    A(SPHERE, 36.65, TOWN_Y + 1.06, 11.5, { tag: 'ulje', col: '#b8b532', bleed: '#85821c', hull: true, orb: 'ulje' }, 0, 0, 0, [0.16, 0.22, 0.16]);
    A(CYL12, 36.65, TOWN_Y + 1.32, 11.5, { tag: 'ulje', col: '#b8b532', bleed: '#85821c' }, 0, 0, 0, [0.06, 0.18, 0.06]);

    // Terraced autumn vineyard rows ('vinograd'), gnarled vine posts ('loza'), purple grape clusters ('grozd') & harvest baskets ('kosara') at (34..46, TOWN_Y, -10..-26)
    for (const vz of [-12, -17, -22]) {
      box(11.0, 0.45, 1.4, 38, TOWN_Y + 0.22, vz, { tag: 'vinograd', col: '#7a5c38', bleed: '#523c22', orb: 'vinograd' });
      for (const lx of [33.5, 36.5, 39.5, 42.5]) {
        A(CYL, lx, TOWN_Y + 1.15, vz, { tag: 'loza', col: WOOD_D[0], bleed: WOOD_D[1], orb: 'loza' }, 0, 0, 0, [0.09, 1.7, 0.09]);
        A(ICO, lx, TOWN_Y + 1.85, vz, { tag: 'vinograd', col: '#d99a2e', bleed: '#a86e16', hull: true, sway: 0.10 }, 0, 0, 0, [1.25, 0.72, 0.85]);
        // Purple Vranac grape clusters ('grozd') hanging beneath the autumn leaves
        A(SPHERE, lx + 0.35, TOWN_Y + 1.32, vz + 0.55, { tag: 'grozd', col: '#5c246e', bleed: '#3a1347', hull: true, orb: 'grozd' }, 0, 0, 0, [0.18, 0.26, 0.18]);
      }
    }
    for (const bx of [33.5, 35.5]) {
      A(new THREE.CylinderGeometry(0.54, 0.40, 0.48, 10), bx, TOWN_Y + 0.24, -8.5, { tag: 'kosara', col: '#b88b4a', bleed: '#8a642e', orb: 'kosara' });
      A(ICO, bx, TOWN_Y + 0.56, -8.5, { tag: 'kosara', col: '#692a7d', bleed: '#451754', hull: true }, 0, 0, 0, [0.42, 0.22, 0.42]);
    }

    // Silvery-green terraced olive grove ('maslinik') at (34..46, TOWN_Y, 32..42)
    for (const [ox, oz, s] of [[34, 34, 1.1], [42, 36, 1.15], [37, 42, 1.05]]) {
      A(CYL, ox, TOWN_Y + 1.7 * s, oz, { tag: 'maslinik', col: '#7d7366', bleed: '#595147', orb: 'maslinik' }, 0, 0, 0, [0.28 * s, 3.4 * s, 0.28 * s]);
      A(ICO, ox, TOWN_Y + 3.8 * s, oz, { tag: 'maslinik', col: '#8fa87a', bleed: '#667d54', hull: true, sway: 0.12 }, 0, 0, 0, [2.1 * s, 1.55 * s, 2.1 * s]);
    }
  });

  // ==================== 6. ZONE 4: HERZEGOVINIAN BEEKEEPING & HONEY (9 words) ====================
  // Sunlit apiary ('pcelinjak') on west bank at (-36, TOWN_Y, -22): 'pcelar', 'dimilica', 'sace', 'vosak', 'tegla', 'medovina', 'bokal', 'roj'
  b.object(() => {
    const hiveCols = [['#e8b838', '#ba8d1c'], ['#5ba3c9', '#387699'], ['#d96b43', '#a64726'], ['#6db066', '#488242']];
    for (let i = 0; i < 4; i++) {
      const hx = -39.5 + i * 2.1;
      box(1.1, 1.05, 1.0, hx, TOWN_Y + 0.52, -24.5, { tag: 'pcelinjak', col: hiveCols[i][0], bleed: hiveCols[i][1], orb: 'pcelinjak' });
      box(1.26, 0.18, 1.16, hx, TOWN_Y + 1.12, -24.5, { tag: 'pcelinjak', col: WOOD_D[0], bleed: WOOD_D[1] });
    }
    // Honey tasting & processing workbench at (-36, TOWN_Y, -19.5)
    box(4.8, 0.84, 1.2, -36, TOWN_Y + 0.42, -19.5, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
    // Golden honeycomb frame ('sace')
    box(0.68, 0.54, 0.10, -37.8, TOWN_Y + 1.12, -19.5, { tag: 'sace', col: '#f2b824', bleed: '#c48b0e', orb: 'sace' }, 0.12);
    // Beeswax cakes ('vosak')
    box(0.46, 0.22, 0.36, -36.8, TOWN_Y + 0.95, -19.5, { tag: 'vosak', col: '#f5d256', bleed: '#cca62b', orb: 'vosak' });
    // Glowing amber sage honey jars ('tegla')
    for (const ox of [-0.2, 0.22]) {
      A(CYL12, -35.8 + ox, TOWN_Y + 1.04, -19.5, { tag: 'tegla', col: '#e89624', bleed: '#b56a0e', orb: 'tegla' }, 0, 0, 0, [0.14, 0.34, 0.14]);
      A(CYL12, -35.8 + ox, TOWN_Y + 1.24, -19.5, { tag: 'tegla', col: '#faf5e6', bleed: '#d6ccb4' }, 0, 0, 0, [0.15, 0.08, 0.15]);
    }
    // Ceramic mead flagon ('medovina') & clear glass serving carafe ('bokal')
    A(SPHERE, -34.8, TOWN_Y + 1.06, -19.5, { tag: 'medovina', col: '#b86832', bleed: '#85441a', hull: true, orb: 'medovina' }, 0, 0, 0, [0.18, 0.26, 0.18]);
    A(CYL12, -34.1, TOWN_Y + 1.06, -19.5, { tag: 'bokal', col: '#d4edf5', bleed: '#9ec8d6', orb: 'bokal' }, 0, 0, 0, [0.16, 0.38, 0.16]);
  });
  people.push({ kind: 'treBeekeeper', x: -36.4, y: TOWN_Y + 0.04, z: -22.2, ry: Math.PI, tag: 'pcelar' });
  // Animated shimmering bee swarm ('roj') orbiting over the hives at (-36.5, TOWN_Y + 2.1, -24.5)
  for (let i = 0; i < 6; i++) {
    const bg = new THREE.Group();
    const bx = -38.0 + i * 0.65, by = TOWN_Y + 1.9 + (i % 2) * 0.35, bz = -24.5 + (i % 2 ? 0.5 : -0.5);
    bg.position.set(bx, by, bz);
    scene.add(bg);
    dynMesh(SPHERE, 'roj', '#f5c42c', '#c79612', bg, 0, 0, 0, [0.11, 0.10, 0.16], 1.0);
    dynMesh(BOX, 'roj', '#242220', '#121110', bg, 0, 0, 0, [0.12, 0.11, 0.06], 0.9);
    bees.push({ g: bg, home: V(bx, by, bz), r: 1.2 + (i % 3) * 0.35, speed: 2.2 + i * 0.25, phase: i * 1.1 });
  }

  // ==================== 7. ZONE 5: MEDITERRANEAN BOTANICAL GARDEN & HERBS (9 words) ====================
  // Walled sunlit garden ('vrt') at (-32, TOWN_Y, -6): 'smilje', 'kadulja', 'ruzmarin', 'lovor', 'agava', 'mandarina', 'kivi', 'badem', 'amfora'
  b.object(() => {
    const VR = { tag: 'vrt', col: STONE_H[0], bleed: STONE_H[1], pat: PAT.blocks, ps: 0.7, orb: 'vrt' };
    box(11.5, 0.95, 0.55, -34, TOWN_Y + 0.48, -1.2, VR);
    box(11.5, 0.95, 0.55, -34, TOWN_Y + 0.48, -11.8, VR);
    box(0.55, 0.95, 10.6, -39.5, TOWN_Y + 0.48, -6.5, VR);
    // Golden immortelle ('smilje') tufts at (-31, TOWN_Y, -4)
    for (const [ox, oz] of [[-0.6, 0], [0, 0.4], [0.6, -0.2]]) {
      A(ICO, -31 + ox, TOWN_Y + 0.42, -4 + oz, { tag: 'smilje', col: '#f2c832', bleed: '#c79914', hull: true, orb: 'smilje' }, 0, 0, 0, [0.46, 0.38, 0.46]);
    }
    // Wild violet-silver karst sage ('kadulja') at (-34.5, TOWN_Y, -4)
    for (const [ox, oz] of [[-0.5, 0], [0.1, 0.3], [0.6, -0.2]]) {
      A(ICO, -34.5 + ox, TOWN_Y + 0.46, -4 + oz, { tag: 'kadulja', col: '#8d75b8', bleed: '#5f498a', hull: true, orb: 'kadulja' }, 0, 0, 0, [0.44, 0.48, 0.44]);
    }
    // Fragrant evergreen rosemary ('ruzmarin') at (-37.5, TOWN_Y, -4.5)
    A(ICO, -37.5, TOWN_Y + 0.65, -4.5, { tag: 'ruzmarin', col: '#4a7d56', bleed: '#2e5738', hull: true, orb: 'ruzmarin' }, 0, 0, 0, [0.78, 0.72, 0.78]);
    // Glossy aromatic bay laurel tree ('lovor') at (-37.2, TOWN_Y, -9.2)
    A(CYL, -37.2, TOWN_Y + 1.3, -9.2, { tag: 'lovor', col: WOOD_D[0], bleed: WOOD_D[1], orb: 'lovor' }, 0, 0, 0, [0.20, 2.6, 0.20]);
    A(ICO, -37.2, TOWN_Y + 3.0, -9.2, { tag: 'lovor', col: '#3d7a42', bleed: '#245228', hull: true, sway: 0.12 }, 0, 0, 0, [1.45, 1.55, 1.45]);
    // Sculptural spiky agave ('agava') at (-31.0, TOWN_Y, -9.2)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      box(0.26, 0.08, 1.25, -31.0 + Math.sin(a) * 0.55, TOWN_Y + 0.48, -9.2 + Math.cos(a) * 0.55, { tag: 'agava', col: '#5a9488', bleed: '#38695e', orb: 'agava' }, a, -0.52, 0);
    }
    // Crates of tangerines ('mandarina'), kiwifruit ('kivi') & almonds ('badem') at (-34.2, TOWN_Y, -8.5)
    for (const [ox, tid, c1, c2] of [[-1.6, 'mandarina', '#f28222', '#c25a0e'], [0, 'kivi', '#7d9e3c', '#526b22'], [1.6, 'badem', '#d9be91', '#ab8f62']]) {
      box(1.1, 0.48, 0.9, -34.2 + ox, TOWN_Y + 0.24, -8.5, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        A(SPHERE, -34.2 + ox + Math.cos(a) * 0.24, TOWN_Y + 0.56, -8.5 + Math.sin(a) * 0.20, { tag: tid, col: c1, bleed: c2, hull: true, orb: tid }, 0, 0, 0, 0.15);
      }
    }
    // Tall ancient Mediterranean terracotta amphora ('amfora') beside garden entrance (-27.8, TOWN_Y, -3.5)
    A(SPHERE, -27.8, TOWN_Y + 0.72, -3.5, { tag: 'amfora', col: '#c96f44', bleed: '#944a26', hull: true, orb: 'amfora' }, 0, 0, 0, [0.34, 0.58, 0.34]);
    A(CYL12, -27.8, TOWN_Y + 1.34, -3.5, { tag: 'amfora', col: '#c96f44', bleed: '#944a26' }, 0, 0, 0, [0.14, 0.36, 0.14]);
  });

  // ==================== 8. ZONE 6: WARM KARST WILDLIFE & BIRDS (8 words) ====================
  b.object(() => {
    // Colourful pheasant ('fazan') beside the vineyards at (28, TOWN_Y, -14)
    A(ICO, 28, TOWN_Y + 0.42, -14, { tag: 'fazan', col: '#b85428', bleed: '#823614', hull: true, orb: 'fazan' }, 0, 0, 0, [0.22, 0.22, 0.40]);
    A(SPHERE, 28, TOWN_Y + 0.70, -13.6, { tag: 'fazan', col: '#226e52', bleed: '#124734', hull: true }, 0, 0, 0, 0.14);
    box(0.10, 0.08, 0.75, 28, TOWN_Y + 0.46, -14.65, { tag: 'fazan', col: '#d49a38', bleed: '#9c6e1e' }, 0, 0.22, 0);
    // Rock partridge ('jarebica') on sunlit limestone boulder on NE karst terrace (28, HILLSIDE_Y, -44)
    A(ICO, 28, HILLSIDE_Y + 0.55, -44, { tag: 'kamenjar', col: KARST[0], bleed: KARST[1], hull: true, orb: 'kamenjar' }, 0, 0, 0, [1.5, 0.85, 1.4]);
    A(ICO, 28, HILLSIDE_Y + 1.48, -44, { tag: 'jarebica', col: '#9e9588', bleed: '#70685d', hull: true, orb: 'jarebica' }, 0, 0, 0, [0.24, 0.24, 0.32]);
    A(SPHERE, 28, HILLSIDE_Y + 1.76, -43.75, { tag: 'jarebica', col: '#c95c38', bleed: '#943c1e', hull: true }, 0, 0, 0, 0.12);
    // Scops owl ('cuk') perched on stone post near Platani Square (-26, TOWN_Y, 26)
    box(0.55, 1.4, 0.55, -26, TOWN_Y + 0.7, 26, { tag: 'props', col: STONE_H[0], bleed: STONE_H[1] });
    A(ICO, -26, TOWN_Y + 1.66, 26, { tag: 'cuk', col: '#8a6d52', bleed: '#5e4733', hull: true, orb: 'cuk' }, 0, 0, 0, [0.18, 0.24, 0.18]);
    for (const ex of [-0.10, 0.10]) A(CONE4, -26 + ex, TOWN_Y + 1.94, 26, { tag: 'cuk', col: '#5e4733', bleed: '#3d2c1e' }, 0, 0, 0, [0.04, 0.12, 0.04]);
    // Small bat ('sismis') hanging under the stone winery cellar arch (36.8, TOWN_Y + 2.65, 16)
    A(ICO, 36.2, TOWN_Y + 2.55, 16, { tag: 'sismis', col: '#3a3538', bleed: '#211e20', hull: true, orb: 'sismis' }, 0, 0, 0, [0.12, 0.22, 0.12]);
    box(0.06, 0.20, 0.62, 36.2, TOWN_Y + 2.55, 16, { tag: 'sismis', col: '#2b272a', bleed: '#171517' });
    // Singing cicada ('cvrcak') on olive trunk at (34, TOWN_Y + 1.6, 33.6)
    A(SPHERE, 34, TOWN_Y + 1.6, 33.65, { tag: 'cvrcak', col: '#5c4e38', bleed: '#3b3122', hull: true, orb: 'cvrcak' }, 0, 0, 0, [0.12, 0.22, 0.10]);
    box(0.32, 0.28, 0.04, 34, TOWN_Y + 1.6, 33.60, { tag: 'cvrcak', col: '#d9ece6', bleed: '#a8cfc2', solid: false });
    // Bright green praying mantis ('bogomoljka') perched atop the rosemary bush (-37.5, TOWN_Y + 1.38, -4.5)
    box(0.10, 0.10, 0.48, -37.5, TOWN_Y + 1.42, -4.5, { tag: 'bogomoljka', col: '#69c942', bleed: '#459624', orb: 'bogomoljka' });
    box(0.08, 0.26, 0.08, -37.5, TOWN_Y + 1.56, -4.25, { tag: 'bogomoljka', col: '#69c942', bleed: '#459624' }, 0, -0.35, 0);
  });
  // Animated swallows ('lastavica') skimming gracefully above the Trebišnjica bridge arches
  for (let i = 0; i < 3; i++) {
    const sg = new THREE.Group(); sg.position.set(-4 + i * 4, 9.2 + (i % 2) * 0.8, 4); scene.add(sg);
    dynMesh(ICO, 'lastavica', '#283c63', '#162440', sg, 0, 0, 0, [0.12, 0.11, 0.30], 1.0);
    dynMesh(BOX, 'lastavica', '#283c63', '#162440', sg, 0, 0.04, 0, [0.85, 0.03, 0.16], 1.0);
    swallows.push({ g: sg, home: V(0, 9.2 + i * 0.7, 2), rx: 11 + i * 2.5, rz: 7 + i * 1.5, speed: 0.9 + i * 0.15, phase: i * 2.1 });
  }

  // ==================== 9. ZONE 7: CRKVINA HILLTOP (HERCEGOVAČKA GRAČANICA) & SACRED ART (7 words, Stage 2!) ====================
  // Grounded stone ceremonial stairway climbing up Crkvina Hill from NE terrace
  b.object(() => {
    const ST = { tag: 'town', col: STONE_H[0], bleed: STONE_H[1], pat: PAT.blocks, ps: 0.7 };
    for (let i = 0; i < 10; i++) {
      const topY = HILLSIDE_Y + 1.4 + i * 1.35;
      const h = topY - (HILLSIDE_Y - 1.0);
      box(3.8, h, 2.4, 17.5 - i * 1.15, HILLSIDE_Y - 1.0 + h / 2, -52 - i * 1.15, ST);
    }
  });
  // Hercegovačka Gračanica domed sanctuary ('manastir', Stage 2!) at (0, HILL_Y, -74) + 'mozaik', 'ikona', 'kolo', 'vaza', 'kamenica'
  b.object(() => {
    const MN = { tag: 'manastir', col: '#e8d8ba', bleed: '#c4b18e', pat: PAT.blocks, ps: 0.6, pool: 0.85, orb: 'manastir' };
    // Cross-in-square Byzantine church body + terracotta gabled wings + central drum & dome!
    box(11.0, 6.2, 13.5, 0, HILL_Y + 3.1, -74, MN);
    box(14.5, 5.2, 6.2, 0, HILL_Y + 2.6, -74, MN);
    A(hipRoofGeo(11.8, 14.2, 2.6), 0, HILL_Y + 6.2, -74, { tag: 'manastir', col: TILE[0], bleed: TILE[1], pat: PAT.roof });
    // Central octagonal drum & terracotta dome
    A(CYL12, 0, HILL_Y + 9.4, -74, MN, 0, 0, 0, [2.7, 3.8, 2.7]);
    A(HEMI, 0, HILL_Y + 11.2, -74, { tag: 'manastir', col: TILE[0], bleed: TILE[1], pat: PAT.roof }, 0, 0, 0, [2.9, 2.6, 2.9]);
    // Shimmering gold-and-blue entrance mosaic ('mozaik') on south portal (z = -67.15)
    box(2.6, 2.8, 0.22, 0, HILL_Y + 1.4, -67.18, { tag: 'town', col: '#4a3220', solid: false });
    A(CYL16, 0, HILL_Y + 3.45, -67.14, { tag: 'mozaik', col: '#e8be3a', bleed: '#b88c14', orb: 'mozaik' }, 0, Math.PI / 2, 0, [1.25, 0.16, 1.25]);
    A(CYL16, 0, HILL_Y + 3.45, -67.08, { tag: 'mozaik', col: '#2f6bb5', bleed: '#1d467a', solid: false }, 0, Math.PI / 2, 0, [0.82, 0.14, 0.82]);
    // Carved stone wheel rosette ('kolo') high on the south gable
    A(new THREE.TorusGeometry(0.95, 0.16, 6, 16), 0, HILL_Y + 5.35, -67.14, { tag: 'kolo', col: '#f2e8d2', bleed: '#c9bca0', orb: 'kolo' });
    for (const rz of [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]) box(0.08, 1.65, 0.10, 0, HILL_Y + 5.35, -67.10, { tag: 'kolo', col: '#f2e8d2', solid: false }, 0, 0, rz);
    // Gilded sacred panel icon ('ikona') on east cloister wall (4.2, HILL_Y + 2.2, -67.14)
    box(1.15, 1.45, 0.14, 4.0, HILL_Y + 2.2, -67.14, { tag: 'ikona', col: '#e8be3a', bleed: '#b58a14', orb: 'ikona' });
    box(0.82, 1.12, 0.18, 4.0, HILL_Y + 2.2, -67.10, { tag: 'ikona', col: '#9e2e2b', bleed: '#6e1a18', solid: false });
    // Carved stone blossom vase ('vaza') & stone courtyard water basin ('kamenica') on Crkvina terrace
    A(SPHERE, -4.2, HILL_Y + 0.65, -65.2, { tag: 'vaza', col: '#f2ead8', bleed: '#cfc5b0', hull: true, orb: 'vaza' }, 0, 0, 0, [0.42, 0.56, 0.42]);
    A(ICO, -4.2, HILL_Y + 1.32, -65.2, { tag: 'vaza', col: '#e87a38', bleed: '#b8541c', hull: true }, 0, 0, 0, [0.48, 0.34, 0.48]);
    A(CYL12, 4.5, HILL_Y + 0.45, -64.2, { tag: 'kamenica', col: STONE_H[0], bleed: STONE_H[1], orb: 'kamenica' }, 0, 0, 0, [0.85, 0.9, 0.85]);
    A(CYL12, 4.5, HILL_Y + 0.92, -64.2, { tag: 'kamenica', col: '#48c2b8', bleed: '#24948a', ink: false, solid: false }, 0, 0, 0, [0.68, 0.08, 0.68]);
  });

  // Scenic Herzegovinian Old Town stone houses with windows/doors, cypresses & golden plane/olive trees
  for (const [hx, hz, w, d, h] of [[-52, 10, 6.6, 5.4, 3.2], [-50, 40, 6.8, 5.6, 3.0], [52, 4, 6.6, 5.4, 3.0], [54, 28, 6.8, 5.6, 3.1]]) {
    box(w, 1.4, d, hx, TOWN_Y + 0.7, hz, { tag: 'town', col: STONE_H[0], bleed: STONE_H[1], pat: PAT.blocks, ps: 0.7 });
    box(w + 0.4, h, d + 0.4, hx, TOWN_Y + 1.4 + h / 2, hz, { tag: 'town', col: LIME[0], bleed: LIME[1] });
    A(hipRoofGeo(w + 1.1, d + 1.1, 2.8), hx, TOWN_Y + 1.4 + h, hz, { tag: 'town', col: TILE[0], bleed: TILE[1], pat: PAT.roof });
    box(0.95, 1.25, 0.18, hx - w * 0.24, TOWN_Y + 2.9, hz + d / 2 + 0.22, { tag: 'town', col: '#3e7d5a', solid: false });
    box(0.95, 1.25, 0.18, hx + w * 0.24, TOWN_Y + 2.9, hz + d / 2 + 0.22, { tag: 'town', col: '#3e7d5a', solid: false });
    box(0.90, 1.35, 0.18, hx, TOWN_Y + 0.7, hz + d / 2 + 0.08, { tag: 'town', col: '#4a3220', solid: false });
  }
  // Slender Mediterranean cypresses & golden autumn trees ('hills' / 'riverbank', sway: 0.12)
  for (const [cx, cy, cz, s] of [[-12, HILL_Y, -70, 1.1], [12, HILL_Y, -70, 1.1], [-10, HILL_Y, -78, 1.0], [10, HILL_Y, -78, 1.0], [-48, TOWN_Y, -14, 1.2], [50, TOWN_Y, -18, 1.2], [-44, HILLSIDE_Y, -48, 1.2], [44, HILLSIDE_Y, -48, 1.2]]) {
    A(CONE8, cx, cy + 3.2 * s, cz, { tag: 'hills', col: '#355c3c', bleed: '#203d26', hull: true, sway: 0.10 }, 0, 0, 0, [0.9 * s, 6.4 * s, 0.9 * s]);
  }
  for (const [tx, ty, tz, s, c1, c2, tg] of [
    [-26, HILLSIDE_Y, -48, 1.15, '#e8a832', '#b87616', 'hills'], [-52, HILLSIDE_Y, -54, 1.2, '#d46e28', '#9c4814', 'hills'],
    [36, HILLSIDE_Y, -52, 1.15, '#e8b238', '#b58018', 'hills'], [52, HILLSIDE_Y, -56, 1.2, '#8fa87a', '#667d54', 'hills'],
    [-24, 18.0, -70, 1.0, '#e39c2b', '#ad6c14', 'hills'], [24, 18.0, -70, 1.0, '#e39c2b', '#ad6c14', 'hills'],
  ]) {
    A(CYL, tx, ty + 2.0 * s, tz, { tag: tg, col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.28 * s, 4.0 * s, 0.28 * s]);
    A(ICO, tx, ty + 4.5 * s, tz, { tag: tg, col: c1, bleed: c2, hull: true, sway: 0.12 }, 0, 0, 0, [2.0 * s, 1.8 * s, 2.0 * s]);
  }
  people.push({ kind: 'walk', x: -8, y: BRIDGE_Y + 0.96, z: 0.2, to: [8, 0.2], tag: 'passerby', woman: true });
  people.push({ kind: 'chat', x: -34, y: TOWN_Y + 0.04, z: 18, ry: 0.7, tag: 'passerby' });
  people.push({ kind: 'chat', x: -32.8, y: TOWN_Y + 0.04, z: 18.4, ry: -2.4, tag: 'passerby', woman: true });

  // ==================== 10. ALL 65 ORBS, GATES & HAND-TUNED CAMERAS ====================
  // Zone 1 (9)
  orbs.push({
    id: 'dolap', focus: V(-14.2, 3.0, 9.5), size: 6.8, tags: ['dolap'], shot: 'combo',
    at: V(-10.0, 4.6, 11.5), stage: 0,
    swim: { p: [-10.0, 0, 11.5], r: 8.5 },
    view: { from: [-5.0, 5.2, 16.5], to: [-5.0, 5.2, 3.5], look: [-14.2, 3.0, 9.5] },
    wideView: { from: [4, 11, 24], to: [-18, 12, 26], look: [-14.2, 3.2, 9.5], lookTo: [-4, 4.0, 2] },
  });
  orb('svodovi', [0, 3.8, 0], 18.0, ['svodovi'], 'combo', 8.8, {
    at: V(0, 8.8, 8.0), swim: { p: [0, 0, 8.0], r: 10.0 },
    view: { from: [-14, 9.5, 22], to: [14, 9.5, 22], look: [0, 3.8, 0] },
    wideView: { from: [-22, 15, 36], to: [22, 15, 36], look: [0, 4.0, 0], lookTo: [0, 4.0, 0] },
  });
  orb('osovina', [-14.6, 3.0, 9.5], 2.2, ['osovina'], 'close', 4.8, {
    requires: ['dolap'], at: V(-11.5, 3.2, 9.5), swim: { p: [-11.5, 0, 9.5], r: 6.5 },
    view: { from: [-10.5, 4.0, 13.5], to: [-10.5, 4.0, 5.5], look: [-14.6, 3.0, 9.5] },
  });
  orb('oluk', [-17.6, 5.8, 9.5], 4.2, ['oluk'], 'close', 6.8, {
    requires: ['dolap'], at: V(-17.6, 6.2, 12.8), near: { p: [-19.5, TOWN_Y + 0.2, 12.8], r: 5.0 },
    view: { from: [-12.5, 7.2, 14.8], to: [-21.5, 7.2, 14.8], look: [-17.6, 5.6, 9.5] },
  });
  orb('kanal', [-20.4, TOWN_Y + 0.3, 16.0], 6.5, ['kanal'], 'close', TOWN_Y + 1.4, {
    near: { p: [-22.6, TOWN_Y + 0.2, 16.0], r: 4.5 },
    view: { from: [-23.8, TOWN_Y + 3.0, 21.5], to: [-23.8, TOWN_Y + 3.0, 10.5], look: [-20.4, TOWN_Y + 0.3, 16.0] },
  });
  orb('ponornica', [0, 0.3, 14], 15.0, ['ponornica'], 'combo', 2.2, {
    at: V(0, 2.4, 18), swim: { p: [0, 0, 18], r: 9.0 },
    view: { from: [-12, 9, 32], to: [12, 9, 32], look: [0, 0.3, 8] },
    wideView: { from: [-18, 16, 44], to: [18, 16, 44], look: [0, 0.4, 0], lookTo: [0, 0.4, -14] },
  });
  orb('kamencic', [14.8, 0.25, 12.4], 2.2, ['kamencic'], 'close', 1.2, {
    at: V(12.5, 2.2, 12.4), swim: { p: [12.5, 0, 12.4], r: 6.5 },
    view: { from: [11.2, 2.4, 15.2], to: [11.2, 2.4, 9.6], look: [14.8, 0.2, 12.4] },
  });
  orb('krs', [126, 20, 10], 45.0, ['krs'], 'combo', 24, {
    sky: false, at: V(24, TOWN_Y + 2.4, 8), near: { p: [24, TOWN_Y + 0.2, 8], r: 5.0 },
    view: { from: [24, TOWN_Y + 10, 16], to: [24, TOWN_Y + 10, 0], look: [120, 18, 8] },
    wideView: { from: [16, TOWN_Y + 18, 28], to: [16, TOWN_Y + 18, -12], look: [120, 18, 8], lookTo: [120, 18, 0] },
  });
  orb('kamenjar', [28, HILLSIDE_Y + 0.8, -44], 3.4, ['kamenjar'], 'close', HILLSIDE_Y + 2.0, {
    near: { p: [28, HILLSIDE_Y + 0.2, -40.5], r: 4.5 },
    view: { from: [24.5, HILLSIDE_Y + 2.8, -39.5], to: [31.5, HILLSIDE_Y + 2.8, -39.5], look: [28, HILLSIDE_Y + 0.8, -44] },
  });

  // Zone 2 (10)
  orb('platan', [-28, TOWN_Y + 6.2, 18], 8.5, ['platan'], 'combo', TOWN_Y + 10.2, {
    at: V(-24.5, TOWN_Y + 2.4, 18), near: { p: [-24.5, TOWN_Y + 0.2, 18], r: 5.0 },
    view: { from: [-16, TOWN_Y + 7.5, 28], to: [-16, TOWN_Y + 7.5, 10], look: [-28, TOWN_Y + 5.8, 18] },
    wideView: { from: [-10, TOWN_Y + 13, 38], to: [-10, TOWN_Y + 13, 8], look: [-31, TOWN_Y + 5.5, 24], lookTo: [-32, TOWN_Y + 5.5, 26] },
  });
  orb('hladovina', [-33, TOWN_Y + 1.5, 25], 4.5, ['hladovina'], 'close', TOWN_Y + 3.4, {
    near: { p: [-29.5, TOWN_Y + 0.2, 25], r: 4.5 },
    view: { from: [-27.5, TOWN_Y + 3.0, 29.0], to: [-27.5, TOWN_Y + 3.0, 21.0], look: [-33, TOWN_Y + 1.4, 25] },
  });
  orb('gostionica', [-46, TOWN_Y + 3.6, 24], 9.0, ['gostionica'], 'close', TOWN_Y + 8.8, {
    at: V(-38.5, TOWN_Y + 2.4, 24), near: { p: [-38.5, TOWN_Y + 0.2, 24], r: 5.0 },
    view: { from: [-34.5, TOWN_Y + 4.4, 29.5], to: [-34.5, TOWN_Y + 4.4, 20.5], look: [-45, TOWN_Y + 3.4, 24] },
  });
  orb('kapak', [-41.05, TOWN_Y + 4.2, 21.6], 2.2, ['kapak'], 'close', TOWN_Y + 5.2, {
    requires: ['gostionica'], at: V(-38.5, TOWN_Y + 3.2, 21.6), near: { p: [-38.5, TOWN_Y + 0.2, 21.6], r: 4.8 },
    view: { from: [-36.5, TOWN_Y + 4.4, 23.6], to: [-36.5, TOWN_Y + 4.4, 19.6], look: [-41.05, TOWN_Y + 4.2, 21.6] },
  });
  orb('saksija', [-40.4, TOWN_Y + 0.5, 22.4], 1.4, ['saksija'], 'close', TOWN_Y + 1.3, {
    near: { p: [-38.2, TOWN_Y + 0.2, 22.4], r: 3.6 },
    view: { from: [-37.2, TOWN_Y + 1.6, 24.0], to: [-37.2, TOWN_Y + 1.6, 20.8], look: [-40.4, TOWN_Y + 0.5, 22.4] },
  });
  orb('kalendar', [-41.06, TOWN_Y + 1.85, 22.0], 1.2, ['kalendar'], 'close', TOWN_Y + 2.5, {
    near: { p: [-38.6, TOWN_Y + 0.2, 22.0], r: 3.6 },
    view: { from: [-37.6, TOWN_Y + 2.0, 23.2], to: [-37.6, TOWN_Y + 2.0, 20.8], look: [-41.06, TOWN_Y + 1.85, 22.0] },
  });
  orb('trpeza', [-38.5, TOWN_Y + 0.8, 27.5], 2.8, ['trpeza'], 'close', TOWN_Y + 1.8, {
    near: { p: [-36.0, TOWN_Y + 0.2, 27.5], r: 4.0 },
    view: { from: [-35.2, TOWN_Y + 2.2, 29.8], to: [-35.2, TOWN_Y + 2.2, 25.2], look: [-38.5, TOWN_Y + 0.8, 27.5] },
  });
  orb('prsut', [-38.5, TOWN_Y + 0.94, 27.5], 1.2, ['prsut'], 'close', TOWN_Y + 1.5, {
    requires: ['trpeza'], near: { p: [-36.2, TOWN_Y + 0.2, 27.5], r: 3.8 },
    view: { from: [-36.2, TOWN_Y + 1.8, 28.8], to: [-36.2, TOWN_Y + 1.8, 26.2], look: [-38.5, TOWN_Y + 0.94, 27.5] },
  });
  orb('sokak', [-44, TOWN_Y + 0.2, 37], 7.0, ['sokak'], 'close', TOWN_Y + 1.6, {
    near: { p: [-44, TOWN_Y + 0.2, 33], r: 4.5 },
    view: { from: [-41, TOWN_Y + 3.2, 31], to: [-47, TOWN_Y + 3.2, 31], look: [-44, TOWN_Y + 0.4, 38] },
  });
  orb('cosak', [-41.6, TOWN_Y + 0.8, 32.5], 1.6, ['cosak'], 'close', TOWN_Y + 1.8, {
    near: { p: [-39.2, TOWN_Y + 0.2, 32.5], r: 3.8 },
    view: { from: [-38.6, TOWN_Y + 2.0, 34.8], to: [-38.6, TOWN_Y + 2.0, 30.2], look: [-41.6, TOWN_Y + 0.8, 32.5] },
  });

  // Zone 3 (13)
  orb('vinarija', [42, TOWN_Y + 3.4, 16], 9.0, ['vinarija'], 'close', TOWN_Y + 8.6, {
    at: V(33.5, TOWN_Y + 2.4, 16), near: { p: [33.5, TOWN_Y + 0.2, 16], r: 5.5 },
    view: { from: [26, TOWN_Y + 5.4, 24], to: [26, TOWN_Y + 5.4, 8], look: [41, TOWN_Y + 3.4, 16] },
  });
  orb('podrum', [36.8, TOWN_Y + 1.8, 16], 4.2, ['podrum'], 'close', TOWN_Y + 3.8, {
    requires: ['vinarija'], near: { p: [33.0, TOWN_Y + 0.2, 16], r: 4.5 },
    view: { from: [31.5, TOWN_Y + 2.6, 19.0], to: [31.5, TOWN_Y + 2.6, 13.0], look: [36.8, TOWN_Y + 1.8, 16] },
  });
  orb('presa', [35.5, TOWN_Y + 1.0, 21.5], 2.2, ['presa'], 'close', TOWN_Y + 2.2, {
    near: { p: [32.8, TOWN_Y + 0.2, 21.5], r: 3.8 },
    view: { from: [32.2, TOWN_Y + 2.2, 23.8], to: [32.2, TOWN_Y + 2.2, 19.2], look: [35.5, TOWN_Y + 1.0, 21.5] },
  });
  orb('boca', [34.4, TOWN_Y + 1.15, 11.5], 1.2, ['boca'], 'close', TOWN_Y + 1.7, {
    near: { p: [34.4, TOWN_Y + 0.2, 9.4], r: 3.6 },
    view: { from: [33.0, TOWN_Y + 1.9, 9.2], to: [35.8, TOWN_Y + 1.9, 9.2], look: [34.4, TOWN_Y + 1.15, 11.5] },
  });
  orb('cep', [35.1, TOWN_Y + 0.98, 11.7], 1.0, ['cep'], 'close', TOWN_Y + 1.5, {
    requires: ['boca'], near: { p: [35.1, TOWN_Y + 0.2, 9.4], r: 3.6 },
    view: { from: [33.9, TOWN_Y + 1.9, 9.2], to: [36.3, TOWN_Y + 1.9, 9.2], look: [35.1, TOWN_Y + 0.98, 11.7] },
  });
  orb('vadicep', [35.5, TOWN_Y + 0.98, 11.7], 1.0, ['vadicep'], 'close', TOWN_Y + 1.5, {
    requires: ['boca'], near: { p: [35.5, TOWN_Y + 0.2, 9.4], r: 3.6 },
    view: { from: [34.3, TOWN_Y + 1.9, 9.2], to: [36.7, TOWN_Y + 1.9, 9.2], look: [35.5, TOWN_Y + 0.98, 11.7] },
  });
  orb('vino', [36.0, TOWN_Y + 1.08, 11.5], 1.1, ['vino'], 'close', TOWN_Y + 1.6, {
    requires: ['boca'], near: { p: [36.0, TOWN_Y + 0.2, 9.4], r: 3.6 },
    view: { from: [34.8, TOWN_Y + 1.8, 9.2], to: [37.2, TOWN_Y + 1.8, 9.2], look: [36.0, TOWN_Y + 1.08, 11.5] },
  });
  orb('ulje', [36.65, TOWN_Y + 1.12, 11.5], 1.1, ['ulje'], 'close', TOWN_Y + 1.6, {
    near: { p: [36.65, TOWN_Y + 0.2, 9.4], r: 3.6 },
    view: { from: [35.4, TOWN_Y + 1.8, 9.2], to: [37.9, TOWN_Y + 1.8, 9.2], look: [36.65, TOWN_Y + 1.12, 11.5] },
  });
  orb('vinograd', [38, TOWN_Y + 1.6, -17], 10.5, ['vinograd'], 'combo', TOWN_Y + 3.2, {
    at: V(30.5, TOWN_Y + 2.4, -17), near: { p: [30.5, TOWN_Y + 0.2, -17], r: 5.0 },
    view: { from: [25, TOWN_Y + 4.8, -8], to: [25, TOWN_Y + 4.8, -26], look: [38, TOWN_Y + 1.4, -17] },
    wideView: { from: [20, TOWN_Y + 11, -4], to: [20, TOWN_Y + 11, -28], look: [38, TOWN_Y + 1.5, -17], lookTo: [38, TOWN_Y + 1.5, -18] },
  });
  orb('loza', [36.5, TOWN_Y + 1.2, -12], 2.2, ['loza'], 'close', TOWN_Y + 2.4, {
    requires: ['vinograd'], near: { p: [36.5, TOWN_Y + 0.2, -9.8], r: 3.8 },
    view: { from: [34.2, TOWN_Y + 2.1, -9.2], to: [38.8, TOWN_Y + 2.1, -9.2], look: [36.5, TOWN_Y + 1.2, -12] },
  });
  orb('grozd', [39.85, TOWN_Y + 1.32, -11.45], 1.3, ['grozd'], 'close', TOWN_Y + 2.0, {
    requires: ['vinograd'], near: { p: [39.85, TOWN_Y + 0.2, -9.6], r: 3.6 },
    view: { from: [38.4, TOWN_Y + 1.9, -9.2], to: [41.3, TOWN_Y + 1.9, -9.2], look: [39.85, TOWN_Y + 1.32, -11.45] },
  });
  orb('kosara', [34.5, TOWN_Y + 0.5, -8.5], 2.2, ['kosara'], 'close', TOWN_Y + 1.4, {
    near: { p: [34.5, TOWN_Y + 0.2, -6.0], r: 3.8 },
    view: { from: [32.4, TOWN_Y + 1.9, -5.6], to: [36.6, TOWN_Y + 1.9, -5.6], look: [34.5, TOWN_Y + 0.5, -8.5] },
  });
  orb('maslinik', [38, TOWN_Y + 3.4, 37], 9.0, ['maslinik'], 'combo', TOWN_Y + 6.4, {
    at: V(30.5, TOWN_Y + 2.4, 37), near: { p: [30.5, TOWN_Y + 0.2, 37], r: 5.0 },
    view: { from: [24, TOWN_Y + 5.8, 44], to: [24, TOWN_Y + 5.8, 30], look: [38, TOWN_Y + 3.2, 37] },
    wideView: { from: [20, TOWN_Y + 11, 48], to: [20, TOWN_Y + 11, 26], look: [38, TOWN_Y + 3.0, 37], lookTo: [38, TOWN_Y + 3.0, 38] },
  });

  // Zone 4 (9)
  orb('pcelinjak', [-36.4, TOWN_Y + 0.9, -24.5], 6.5, ['pcelinjak'], 'close', TOWN_Y + 2.2, {
    at: V(-32, TOWN_Y + 2.2, -24.5), near: { p: [-32, TOWN_Y + 0.2, -24.5], r: 4.8 },
    view: { from: [-30, TOWN_Y + 3.0, -20.5], to: [-42, TOWN_Y + 3.0, -20.5], look: [-36.4, TOWN_Y + 0.9, -24.5] },
  });
  orb('pcelar', [-36.4, TOWN_Y + 1.1, -22.2], 1.8, ['pcelar'], 'close', TOWN_Y + 2.2, {
    near: { p: [-33.8, TOWN_Y + 0.2, -22.2], r: 3.8 },
    view: { from: [-33.2, TOWN_Y + 2.2, -20.0], to: [-33.2, TOWN_Y + 2.2, -24.4], look: [-36.4, TOWN_Y + 1.1, -22.2] },
  });
  orb('dimilica', [-36.1, TOWN_Y + 1.0, -22.2], 1.2, ['dimilica'], 'close', TOWN_Y + 1.8, {
    requires: ['pcelar'], near: { p: [-33.8, TOWN_Y + 0.2, -22.2], r: 3.8 },
    view: { from: [-33.8, TOWN_Y + 1.8, -20.8], to: [-33.8, TOWN_Y + 1.8, -23.6], look: [-36.1, TOWN_Y + 1.0, -22.2] },
  });
  orb('sace', [-37.8, TOWN_Y + 1.12, -19.5], 1.2, ['sace'], 'close', TOWN_Y + 1.7, {
    near: { p: [-37.8, TOWN_Y + 0.2, -17.4], r: 3.6 },
    view: { from: [-36.5, TOWN_Y + 1.9, -17.2], to: [-39.1, TOWN_Y + 1.9, -17.2], look: [-37.8, TOWN_Y + 1.12, -19.5] },
  });
  orb('vosak', [-36.8, TOWN_Y + 0.98, -19.5], 1.1, ['vosak'], 'close', TOWN_Y + 1.5, {
    near: { p: [-36.8, TOWN_Y + 0.2, -17.4], r: 3.6 },
    view: { from: [-35.6, TOWN_Y + 1.9, -17.2], to: [-38.0, TOWN_Y + 1.9, -17.2], look: [-36.8, TOWN_Y + 0.98, -19.5] },
  });
  orb('tegla', [-35.8, TOWN_Y + 1.08, -19.5], 1.2, ['tegla'], 'close', TOWN_Y + 1.6, {
    near: { p: [-35.8, TOWN_Y + 0.2, -17.4], r: 3.6 },
    view: { from: [-34.6, TOWN_Y + 1.9, -17.2], to: [-37.0, TOWN_Y + 1.9, -17.2], look: [-35.8, TOWN_Y + 1.08, -19.5] },
  });
  orb('medovina', [-34.8, TOWN_Y + 1.08, -19.5], 1.1, ['medovina'], 'close', TOWN_Y + 1.6, {
    near: { p: [-34.8, TOWN_Y + 0.2, -17.4], r: 3.6 },
    view: { from: [-33.6, TOWN_Y + 1.9, -17.2], to: [-36.0, TOWN_Y + 1.9, -17.2], look: [-34.8, TOWN_Y + 1.08, -19.5] },
  });
  orb('bokal', [-34.1, TOWN_Y + 1.08, -19.5], 1.1, ['bokal'], 'close', TOWN_Y + 1.6, {
    near: { p: [-34.1, TOWN_Y + 0.2, -17.4], r: 3.6 },
    view: { from: [-32.9, TOWN_Y + 1.9, -17.2], to: [-35.3, TOWN_Y + 1.9, -17.2], look: [-34.1, TOWN_Y + 1.08, -19.5] },
  });
  orb('roj', [-36.4, TOWN_Y + 2.1, -24.5], 2.8, ['roj'], 'close', TOWN_Y + 3.0, {
    requires: ['pcelinjak'], at: V(-36.4, TOWN_Y + 2.8, -22.5), near: { p: [-36.4, TOWN_Y + 0.2, -22.5], r: 4.8 },
    view: { from: [-33.2, TOWN_Y + 2.8, -21.5], to: [-39.6, TOWN_Y + 2.8, -21.5], look: [-36.4, TOWN_Y + 2.1, -24.5] },
  });

  // Zone 5 (9)
  orb('vrt', [-34, TOWN_Y + 1.0, -6.5], 9.0, ['vrt'], 'close', TOWN_Y + 2.8, {
    at: V(-26.5, TOWN_Y + 2.2, -6.5), near: { p: [-26.5, TOWN_Y + 0.2, -6.5], r: 5.0 },
    view: { from: [-23, TOWN_Y + 4.4, -2], to: [-23, TOWN_Y + 4.4, -11], look: [-34, TOWN_Y + 1.0, -6.5] },
  });
  orb('smilje', [-31, TOWN_Y + 0.45, -4], 1.6, ['smilje'], 'close', TOWN_Y + 1.2, {
    near: { p: [-29.0, TOWN_Y + 0.2, -4], r: 3.6 },
    view: { from: [-28.4, TOWN_Y + 1.8, -2.4], to: [-28.4, TOWN_Y + 1.8, -5.6], look: [-31, TOWN_Y + 0.45, -4] },
  });
  orb('kadulja', [-34.5, TOWN_Y + 0.5, -4], 1.6, ['kadulja'], 'close', TOWN_Y + 1.2, {
    near: { p: [-34.5, TOWN_Y + 0.2, -6.2], r: 3.6 },
    view: { from: [-32.8, TOWN_Y + 1.8, -6.5], to: [-36.2, TOWN_Y + 1.8, -6.5], look: [-34.5, TOWN_Y + 0.5, -4] },
  });
  orb('ruzmarin', [-37.5, TOWN_Y + 0.7, -4.5], 1.8, ['ruzmarin'], 'close', TOWN_Y + 1.5, {
    near: { p: [-35.2, TOWN_Y + 0.2, -4.5], r: 3.6 },
    view: { from: [-34.6, TOWN_Y + 1.9, -2.8], to: [-34.6, TOWN_Y + 1.9, -6.2], look: [-37.5, TOWN_Y + 0.7, -4.5] },
  });
  orb('lovor', [-37.2, TOWN_Y + 2.6, -9.2], 3.2, ['lovor'], 'close', TOWN_Y + 4.6, {
    near: { p: [-34.2, TOWN_Y + 0.2, -9.2], r: 4.2 },
    view: { from: [-32.0, TOWN_Y + 3.4, -6.8], to: [-32.0, TOWN_Y + 3.4, -11.6], look: [-37.2, TOWN_Y + 2.4, -9.2] },
  });
  orb('agava', [-31.0, TOWN_Y + 0.55, -9.2], 2.0, ['agava'], 'close', TOWN_Y + 1.4, {
    near: { p: [-28.5, TOWN_Y + 0.2, -9.2], r: 3.8 },
    view: { from: [-28.0, TOWN_Y + 2.0, -7.2], to: [-28.0, TOWN_Y + 2.0, -11.2], look: [-31.0, TOWN_Y + 0.55, -9.2] },
  });
  orb('mandarina', [-35.8, TOWN_Y + 0.55, -8.5], 1.3, ['mandarina'], 'close', TOWN_Y + 1.2, {
    near: { p: [-35.8, TOWN_Y + 0.2, -6.5], r: 3.6 },
    view: { from: [-34.4, TOWN_Y + 1.8, -6.2], to: [-37.2, TOWN_Y + 1.8, -6.2], look: [-35.8, TOWN_Y + 0.55, -8.5] },
  });
  orb('kivi', [-34.2, TOWN_Y + 0.55, -8.5], 1.3, ['kivi'], 'close', TOWN_Y + 1.2, {
    near: { p: [-34.2, TOWN_Y + 0.2, -6.5], r: 3.6 },
    view: { from: [-32.8, TOWN_Y + 1.8, -6.2], to: [-35.6, TOWN_Y + 1.8, -6.2], look: [-34.2, TOWN_Y + 0.55, -8.5] },
  });
  orb('badem', [-32.6, TOWN_Y + 0.55, -8.5], 1.3, ['badem'], 'close', TOWN_Y + 1.2, {
    near: { p: [-32.6, TOWN_Y + 0.2, -6.5], r: 3.6 },
    view: { from: [-31.2, TOWN_Y + 1.8, -6.2], to: [-34.0, TOWN_Y + 1.8, -6.2], look: [-32.6, TOWN_Y + 0.55, -8.5] },
  });

  // Zone 6 (8)
  orb('amfora', [-27.8, TOWN_Y + 0.9, -3.5], 1.5, ['amfora'], 'close', TOWN_Y + 1.8, {
    near: { p: [-25.5, TOWN_Y + 0.2, -3.5], r: 3.6 },
    view: { from: [-25.0, TOWN_Y + 1.9, -1.8], to: [-25.0, TOWN_Y + 1.9, -5.2], look: [-27.8, TOWN_Y + 0.9, -3.5] },
  });
  orb('lastavica', [0, 9.6, 2], 4.5, ['lastavica'], 'close', 10.6, {
    at: V(0, 9.8, 5.5), near: { p: [0, BRIDGE_Y + 1.0, 2.0], r: 6.5 },
    view: { from: [-6, 10.6, 11], to: [6, 10.6, 11], look: [0, 9.4, 2] },
  });
  orb('cuk', [-26, TOWN_Y + 1.75, 26], 1.2, ['cuk'], 'close', TOWN_Y + 2.4, {
    near: { p: [-23.8, TOWN_Y + 0.2, 26], r: 3.6 },
    view: { from: [-23.4, TOWN_Y + 2.2, 27.6], to: [-23.4, TOWN_Y + 2.2, 24.4], look: [-26, TOWN_Y + 1.75, 26] },
  });
  orb('fazan', [28, TOWN_Y + 0.5, -14], 1.5, ['fazan'], 'close', TOWN_Y + 1.2, {
    near: { p: [25.6, TOWN_Y + 0.2, -14], r: 3.6 },
    view: { from: [25.0, TOWN_Y + 1.8, -12.0], to: [25.0, TOWN_Y + 1.8, -16.0], look: [28, TOWN_Y + 0.5, -14] },
  });
  orb('jarebica', [28, HILLSIDE_Y + 1.55, -44], 1.4, ['jarebica'], 'close', HILLSIDE_Y + 2.3, {
    near: { p: [28, HILLSIDE_Y + 0.2, -41.4], r: 3.8 },
    view: { from: [26.0, HILLSIDE_Y + 2.4, -41.0], to: [30.0, HILLSIDE_Y + 2.4, -41.0], look: [28, HILLSIDE_Y + 1.55, -44] },
  });
  orb('sismis', [36.2, TOWN_Y + 2.55, 16], 1.2, ['sismis'], 'close', TOWN_Y + 3.2, {
    requires: ['podrum'], near: { p: [33.5, TOWN_Y + 0.2, 16], r: 4.0 },
    view: { from: [33.2, TOWN_Y + 2.6, 17.6], to: [33.2, TOWN_Y + 2.6, 14.4], look: [36.2, TOWN_Y + 2.55, 16] },
  });
  orb('cvrcak', [34, TOWN_Y + 1.6, 33.65], 1.1, ['cvrcak'], 'close', TOWN_Y + 2.2, {
    near: { p: [34, TOWN_Y + 0.2, 31.6], r: 3.6 },
    view: { from: [32.6, TOWN_Y + 2.0, 31.2], to: [35.4, TOWN_Y + 2.0, 31.2], look: [34, TOWN_Y + 1.6, 33.65] },
  });
  orb('bogomoljka', [-37.5, TOWN_Y + 1.45, -4.5], 1.1, ['bogomoljka'], 'close', TOWN_Y + 2.0, {
    requires: ['ruzmarin'], near: { p: [-35.2, TOWN_Y + 0.2, -4.5], r: 3.6 },
    view: { from: [-35.4, TOWN_Y + 2.0, -3.2], to: [-35.4, TOWN_Y + 2.0, -5.8], look: [-37.5, TOWN_Y + 1.45, -4.5] },
  });

  // Zone 7 (7, Stage 2!)
  orb('mozaik', [0, HILL_Y + 3.45, -67.14], 2.4, ['mozaik'], 'close', HILL_Y + 4.4, {
    at: V(0, HILL_Y + 2.6, -63.5), near: { p: [0, HILL_Y + 0.2, -63.5], r: 4.8 },
    view: { from: [-3.2, HILL_Y + 3.8, -62.5], to: [3.2, HILL_Y + 3.8, -62.5], look: [0, HILL_Y + 3.45, -67.14] },
  });
  orb('kolo', [0, HILL_Y + 5.35, -67.14], 2.2, ['kolo'], 'close', HILL_Y + 6.4, {
    at: V(0, HILL_Y + 5.2, -63.5), near: { p: [0, HILL_Y + 0.2, -63.5], r: 6.5 },
    view: { from: [-3.2, HILL_Y + 5.6, -61.8], to: [3.2, HILL_Y + 5.6, -61.8], look: [0, HILL_Y + 5.35, -67.14] },
  });
  orb('ikona', [4.0, HILL_Y + 2.2, -67.14], 1.8, ['ikona'], 'close', HILL_Y + 3.2, {
    near: { p: [4.0, HILL_Y + 0.2, -64.5], r: 4.0 },
    view: { from: [2.2, HILL_Y + 2.5, -63.5], to: [5.8, HILL_Y + 2.5, -63.5], look: [4.0, HILL_Y + 2.2, -67.14] },
  });
  orb('vaza', [-4.2, HILL_Y + 0.9, -65.2], 1.5, ['vaza'], 'close', HILL_Y + 1.8, {
    near: { p: [-4.2, HILL_Y + 0.2, -62.8], r: 3.8 },
    view: { from: [-6.0, HILL_Y + 1.8, -62.4], to: [-2.4, HILL_Y + 1.8, -62.4], look: [-4.2, HILL_Y + 0.9, -65.2] },
  });
  orb('kamenica', [4.5, HILL_Y + 0.65, -64.2], 1.8, ['kamenica'], 'close', HILL_Y + 1.4, {
    near: { p: [4.5, HILL_Y + 0.2, -61.8], r: 3.8 },
    view: { from: [2.4, HILL_Y + 1.8, -61.4], to: [6.6, HILL_Y + 1.8, -61.4], look: [4.5, HILL_Y + 0.65, -64.2] },
  });
  orb('mediteran', [0, 30, -155], 44.0, ['mediteran'], 'combo', 30, {
    sky: false, at: V(-6, HILL_Y + 2.4, -63), near: { p: [-6, HILL_Y + 0.2, -63], r: 5.5 },
    view: { from: [-8, HILL_Y + 10, -56], to: [8, HILL_Y + 10, -56], look: [0, 28, -150] },
    wideView: { from: [-34, HILL_Y + 22, -40], to: [34, HILL_Y + 22, -40], look: [0, 30, -150], lookTo: [0, 30, -150] },
  });
  // Stage 2 (LAST WORD): 'manastir' (Hercegovačka Gračanica on Crkvina Hill)
  orb('manastir', [0, HILL_Y + 6.0, -74], 16.0, ['manastir'], 'combo', HILL_Y + 1.0, {
    stage: 2, at: V(0, HILL_Y + 2.6, -65), near: { p: [0, HILL_Y + 0.2, -65], r: 6.5 },
    view: { from: [22, HILL_Y + 12, -46], to: [-22, HILL_Y + 12, -46], look: [0, HILL_Y + 6.0, -74] },
    wideView: { from: [32, HILL_Y + 20, -36], to: [-32, HILL_Y + 20, -36], look: [0, HILL_Y + 6.0, -74], lookTo: [0, HILL_Y + 6.0, -74] },
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
    start: V(-17.2, 4.12, 22.0),
    fleur: V(0, HILL_Y + 17.5, -74),
    sunPos,
    movers: [],
    dolapWheel,
    bees,
    swallows,
  };
}
