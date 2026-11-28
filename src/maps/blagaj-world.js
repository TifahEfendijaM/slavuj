// Blagaj (autumn): the spring of the Buna (Vrelo Bune) pouring out of a great cave at the foot of a sheer
// limestone cliff, the dervish Tekija built against the rock beside it with its bay window over the water,
// the turbe and its nišani, the stalls on the path, a restaurant terrace under a vine pergola facing the Tekija,
// the old mills and stamping mill on a mill race, the walled Velagić house, the five-arched Karađoz-beg bridge
// downstream, and above the cliff the karst slope, its path and the ruins of Stjepan grad.
// North (-z) is the cliff; the Buna flows south (+z).
import * as THREE from 'three';
import { Builder, PAT, tag, rng, shared, paintGeo, washMat, addHull } from '../paper.js';
import S from '../settings.js';

export const TOWN_Y = 1.6;      // the banks, a little above the water (y = 0)
export const CLIFF_Y = 62;      // the top of the cliff, where Stjepan grad stands
export const BRIDGE_Y = 4.2;    // the deck of the Karađoz-beg bridge
export const SUN_BLAGAJ = new THREE.Vector3(-0.42, 0.52, 0.74).normalize();     // low autumn sun in the south-west, lighting the cliff face

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// the foot of the cliff: it curves round the spring like an amphitheatre (z of its face for a given x)
export function cliffZ(x) {
  const u = clamp(x / 40, -1, 1);
  return -48 + 14 * (1 - Math.cos(u * Math.PI / 2));
}
// the karst slope west of the cliff that the path climbs (x -106..-62): its surface height at z
const RAMP_A = Math.atan2(CLIFF_Y - TOWN_Y, 90);
export const rampY = (z) => TOWN_Y + clamp(-34 - z, 0, 90) * (CLIFF_Y - TOWN_Y) / 90;

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
const OCT = new THREE.CylinderGeometry(1, 1, 1, 8);
const CONE4 = new THREE.ConeGeometry(1, 1, 4);
const CONE8 = new THREE.ConeGeometry(1, 1, 8);
const ICO = new THREE.IcosahedronGeometry(1, 1);
const ICO0 = new THREE.IcosahedronGeometry(1, 0);
const SPHERE = new THREE.SphereGeometry(1, 10, 8);
const HEMI = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);

function hipRoofGeo(w, d, h) {
  const g = new THREE.ConeGeometry(1, h, 4);
  g.rotateY(Math.PI / 4);
  g.scale(w * 0.72, 1, d * 0.72);
  g.translate(0, h / 2, 0);
  return g;
}

// the mouth of the cave: a broad low arch cut out of a slab of the cliff face
function caveMouthGeo(w, h, openW, sideH, archH, depth) {
  const hw = w / 2, ow = openW / 2;
  const s = new THREE.Shape();
  s.moveTo(-hw, 0);
  s.lineTo(-ow, 0);
  s.lineTo(-ow, sideH);
  s.absellipse(0, sideH, ow, archH, Math.PI, 0, true);
  s.lineTo(ow, 0);
  s.lineTo(hw, 0);
  s.lineTo(hw, h);
  s.lineTo(-hw, h);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 14 });
  g.translate(0, 0, -depth / 2);
  return g;
}

// one bay of the Karađoz-beg bridge: a slightly pointed arch in a block of masonry
function archBayGeo(bayW, totalH, openW, springH, apexH, depth) {
  const hw = bayW / 2, ow = openW / 2;
  const s = new THREE.Shape();
  s.moveTo(-hw, 0);
  s.lineTo(-ow, 0);
  s.lineTo(-ow, springH);
  s.quadraticCurveTo(-ow * 0.96, apexH * 0.86, 0, apexH);
  s.quadraticCurveTo(ow * 0.96, apexH * 0.86, ow, springH);
  s.lineTo(ow, 0);
  s.lineTo(hw, 0);
  s.lineTo(hw, totalH);
  s.lineTo(-hw, totalH);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 8 });
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

export function buildBlagajWorld(scene) {
  const b = new Builder(), R = rng(1520);
  const rr = (lo, hi) => lo + R() * (hi - lo);
  const A = (geo, x, y, z, o, ry = 0, rx = 0, rz = 0, s = 1) => b.add(geo, mat4(x, y, z, ry, rx, rz, s), o);
  const box = (w, h, d, x, y, z, o, ry = 0, rx = 0, rz = 0) => A(BOX, x, y, z, o, ry, rx, rz, [w, h, d]);

  // Warm, low autumn light from the south-west on the pale cliff; the Buna flows south (+z)
  shared.uSunDir.value.copy(SUN_BLAGAJ);
  shared.uWaterDir.value.set(0, 1);
  shared.uSunShadow.value.set(0.55, 0.53, 0.62);
  shared.uSunGlow.value.set(1.0, 0.86, 0.6);
  shared.uSunTint.value.set(1.06, 0.99, 0.9);
  shared.uSkyGlow.value.set(0.95, 0.93, 0.88);

  const orbs = [], clouds = [], people = [], smoke = [], fish = [], birds = [], swallows = [];

  const orb = (id, focus, size, tags, shot, top, extra = {}) => orbs.push({
    id, focus: V(...focus), size, tags, shot,
    at: V(focus[0], top + S.orb.hoverHeight, focus[2]), stage: 1, ...extra,
  });

  // Herzegovinian palette: pale limestone, whitewash, grey stone-slab roofs, dark wood, karst greens, emerald water
  const LIMESTONE = ['#d9d2c2', '#a9a08d'];
  const STONE = ['#cbc3b2', '#9d9584'];
  const WHITE = ['#f3eee2', '#d8d0bf'];
  const SLAB = { col: '#8f897d', bleed: '#676157', pat: PAT.roof, ps: 1.5 };
  const WOOD_D = ['#5a3c25', '#3b2617'];
  const WOOD_W = ['#93683e', '#6b4a29'];
  const KARST = ['#9d9f74', '#74764f'];
  const GRASS = ['#8fa04c', '#687a32'];
  const COPPER = ['#c97b3c', '#924f1f'];

  // ==================== 1. SKY, SUN & CLOUDS ====================
  tag('sky').side = THREE.BackSide; tag('sky').mode = 'one'; tag('sky').radius = 1300; tag('sky').dur = 6;
  tag('sun').mode = 'one'; tag('sun').radius = 65; tag('sun').dur = 2.5;
  A(new THREE.SphereGeometry(720, 32, 20), 0, 0, 0, { tag: 'sky', col: '#b9dbea', bleed: '#7fb6d6', pat: PAT.sky, hatch: 0, ink: false, solid: false });
  const sunPos = SUN_BLAGAJ.clone().multiplyScalar(520);
  const sunM = new THREE.Matrix4().lookAt(sunPos, V(0, 20, 0), V(0, 1, 0)).setPosition(sunPos);
  b.add(new THREE.CircleGeometry(28, 36).rotateY(Math.PI), sunM, { tag: 'sun', col: '#ffe899', bleed: '#f5b84c', hatch: 0, ink: false, solid: false });
  {
    const g = new THREE.Group(); g.position.copy(sunPos); g.lookAt(0, 20, 0);
    const inkM = new THREE.MeshBasicMaterial({ color: S.ink.color, side: THREE.DoubleSide });
    for (const r0 of [28, 29]) { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r0 + 0.7, 48), inkM); m.position.z = -0.5; g.add(m); }
    scene.add(g);
  }
  for (const [x, y, z, s] of [[-150, 96, -60, 8], [130, 100, -150, 9], [170, 84, 70, 7], [-170, 82, 95, 8], [-20, 110, -230, 9], [60, 88, 200, 8]]) {
    clouds.push({ c: V(x, y, z), r: 4.0 * s });
    const dr = -rr(14, 34);
    b.object(() => {
      for (const [ox, oy, oz, r] of [[-2.0, 0, 0, 1.4], [-0.5, 0.5, 0.2, 1.9], [1.0, 0.45, -0.2, 2.0], [2.3, 0, 0, 1.4], [0.2, -0.2, 0.5, 1.7]])
        A(ICO, x + ox * s, y + oy * s, z + oz * s, { tag: 'hills', col: '#fffcf2', bleed: '#ebe4d1', hull: true, hatch: 0.3, solid: false, sway: dr }, 0, 0, 0, [r * s, 0.58 * r * s, r * s]);
    });
  }

  // the big words colour as one sweeping wash; small things nearby wait a moment so the eye follows
  for (const t of ['stijena', 'vrelo', 'pecina', 'tekija', 'most', 'kamenjar', 'tvrdjava', 'staza', 'jaz', 'ograda', 'avlija', 'terasa']) {
    tag(t).mode = 'one'; tag(t).radius = 130; tag(t).holdRest = 2.4;
  }
  for (const t of ['loza', 'grozd', 'ploce', 'musebak', 'nisan', 'smilje', 'zalfija']) tag(t).waveDelay = 2.0;

  // ==================== 2. TERRAIN: BANKS, THE CLIFF, THE CAVE, THE KARST SLOPE ====================
  const BANK_M = { tag: 'riverbank', col: GRASS[0], bleed: GRASS[1], pat: PAT.grass };
  const EMB_M = { tag: 'riverbank', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.65 };
  const HILL_M = { tag: 'hills', col: KARST[0], bleed: KARST[1], pat: PAT.grass };

  // ground under everything, so the sky never shows below the terrain
  box(520, 4, 520, 0, -4.2, 40, { tag: 'hills', col: KARST[0], bleed: KARST[1], pat: PAT.grass, ink: false });
  // the riverbed (dark under the clear water)
  box(50, 2, 230, 0, -2.2, 40, { tag: 'riverbank', col: '#1d5f58', bleed: '#123f3b', ink: false });

  // banks: beside the spring pool (|x| > 24, z < -14) and beside the river (|x| > 12, z >= -14)
  box(126, 6, 34, -87, TOWN_Y - 3, -31, BANK_M);
  box(126, 6, 34, 87, TOWN_Y - 3, -31, BANK_M);
  box(138, 6, 164, -81, TOWN_Y - 3, 68, BANK_M);
  box(138, 6, 164, 81, TOWN_Y - 3, 68, BANK_M);
  // stone embankments along the water
  b.object(() => {
    for (const sx of [-1, 1]) {
      box(0.9, TOWN_Y + 1.6, 164, sx * 12.45, TOWN_Y / 2 - 0.8, 68, EMB_M);
      box(0.9, TOWN_Y + 1.6, 34, sx * 24.45, TOWN_Y / 2 - 0.8, -31, EMB_M);
      box(12.9, TOWN_Y + 1.6, 0.9, sx * 18.45, TOWN_Y / 2 - 0.8, -14.45, EMB_M);
    }
  });

  // THE CLIFF ('stijena'): tall slabs following the curve round the spring, their tops a little ragged
  const CL = { tag: 'stijena', col: LIMESTONE[0], bleed: LIMESTONE[1], orb: 'stijena', ink: false };      // (no ink on the slabs' seams: the rock reads as one face)
  b.object(() => {
    // the face's character: outcrops bulging from the rock, long ledges of strata, and rounded rocks along the crest
    const RK = { tag: 'stijena', col: '#d3cbba', bleed: '#a39a86', orb: 'stijena', hull: true };
    for (let x = -56; x <= 170; x += rr(5, 9)) {
      const z = cliffZ(x);
      for (let k = 0; k < 3; k++) {
        const y = rr(4, CLIFF_Y - 6);
        if (Math.abs(x) < 15 && y < 17) continue;      // (keep the cave mouth clear, and the Tekija, the turbe, the falcon's ledge and the nests)
        if ((x > 14 && x < 52 && y < 17) || (Math.abs(x + 22) < 6 && y > 24) || (Math.abs(x - 30) < 7 && y > 9)) continue;
        A(ICO0, x + rr(-2, 2), y, z - 0.2, RK, rr(0, 6), rr(-0.3, 0.3), rr(-0.4, 0.4), [rr(2.0, 5.5), rr(1.2, 3.5), rr(0.8, 1.6)]);
      }
      A(ICO0, x, CLIFF_Y + rr(-0.5, 1.0), z - 3, RK, rr(0, 6), 0, 0, [rr(3, 6), rr(1.5, 3.2), rr(3, 5)]);
    }
    for (const [x0, x1, y] of [[-56, -20, 22], [-40, -14, 44], [16, 60, 26], [30, 96, 48], [60, 112, 18], [-30, -16, 34]]) {
      for (let x = x0; x < x1; x += rr(3.5, 5.5)) A(ICO0, x, y + Math.sin(x * 0.7) * 1.2, cliffZ(x) + 0.1, { ...RK, col: '#c8bfac', bleed: '#9a917d' }, rr(-0.2, 0.2), 0, rr(-0.15, 0.15), [rr(2.6, 4.2), rr(0.4, 0.7), rr(0.9, 1.4)]);
    }
    for (let x = -58; x <= 175; x += 6.5) {
      const z = cliffZ(x), dz = x > -40 && x < 40 ? 14 * Math.sin(x / 40 * Math.PI / 2) * (Math.PI / 80) : 0;
      const n = Math.hypot(1, dz), nx = -dz / n, nz = 1 / n, push = 0, top = CLIFF_Y;
      const tone = R() < 0.35 ? { ...CL, col: '#cfc7b5', bleed: '#9b927f' } : CL;
      const fx = x + nx * push, fz = z + nz * push;
      if (Math.abs(x) < 13) {
        // above the cave: only the lintel of rock over the opening
        box(7.6, top - 15, 30, fx - nx * 15, 15 + (top - 15) / 2, fz - nz * 15, tone, -Math.atan(dz));
      } else {
        box(7.6, top + 2, 30, fx - nx * 15, top / 2 - 1, fz - nz * 15, tone, -Math.atan(dz));
      }
    }
    // rock filling the corner west of the cave mouth
    box(4.6, 17, 15, -14.2, 6.5, cliffZ(-14) - 7.5, CL);
  });
  // the plateau above (in parts, leaving the cave hollow), its top the karst
  box(50, 64, 180, -37, CLIFF_Y / 2 - 1, -142, { ...HILL_M, ink: false });
  box(168, 64, 180, 96, CLIFF_Y / 2 - 1, -142, { ...HILL_M, ink: false });
  box(24, CLIFF_Y - 15, 180, 0, 15 + (CLIFF_Y - 15) / 2, -142, { ...HILL_M, ink: false });
  box(24, 18, 158, 0, 7, -153, HILL_M);
  // karst scrub and rocks scattered over the plateau (clear of the fortress, the tower and the rocky patch)
  b.object(() => {
    for (let i = 0; i < 70; i++) {
      const x = rr(-60, 150), z = rr(-210, -56);
      if (x > -54 && x < 8 && z > -120 && z < -60) continue;
      if (x > 18 && x < 50 && z > -82 && z < -56) continue;
      if (Math.hypot(x - 12, z + 55.5) < 6) continue;
      if (i % 3) A(ICO, x, CLIFF_Y + 0.4, z, { tag: 'hills', col: i % 2 ? '#7f8d4c' : '#93936a', bleed: '#5c6634', hull: true, sway: 0.05 }, 0, 0, 0, [rr(0.8, 1.8), rr(0.5, 1.0), rr(0.8, 1.8)]);
      else A(ICO0, x, CLIFF_Y + 0.2, z, { tag: 'hills', col: '#cbc4b3', bleed: '#9b9483', hull: true }, rr(0, 6), 0, 0, [rr(0.8, 2.0), rr(0.5, 1.0), rr(0.8, 1.6)]);
    }
  });

  // THE CAVE ('pecina'): a broad arch in the cliff, dark inside, the Buna pouring out of it
  {
    const PC = { tag: 'pecina', col: '#b9b09c', bleed: '#8a826f', orb: 'pecina' };
    A(caveMouthGeo(27, 17, 20, 3.5, 9.5, 4.2), 0, -1.5, cliffZ(0) + 0.6, CL);      // (the rock round the mouth is part of the cliff)
    // the arch itself, drawn by the rocks round its rim
    for (const [a, r, sx, sy] of [[3.05, 11.4, 2.6, 2.0], [2.62, 11.9, 3.4, 1.8], [2.2, 11.2, 2.4, 2.6], [1.78, 12.1, 3.8, 1.6], [1.38, 11.5, 2.8, 2.2], [0.98, 12.0, 3.2, 1.9], [0.52, 11.3, 2.5, 2.4], [0.1, 11.8, 2.9, 1.7]]) {
      A(ICO0, Math.cos(a) * r, 2.0 + Math.sin(a) * r * 0.92, cliffZ(0) + 2.5, { ...PC, hull: true }, rr(0, 6), rr(-0.3, 0.3), a + rr(-0.4, 0.4), [sx, sy, rr(0.7, 1.1)]);
    }
    const IN = { tag: 'pecina', col: '#4d4740', bleed: '#2f2a25', orb: 'pecina' };
    box(1.2, 16, 26, -10.6, 6.5, -60, IN);
    box(1.2, 16, 26, 10.6, 6.5, -60, IN);
    box(22, 1.2, 26, 0, 13.4, -60, IN, 0, -0.12);
    box(22, 16, 1.2, 0, 6.5, -72.5, { tag: 'pecina', col: '#2d2924', bleed: '#1c1916' });
    // a dark mouth so the depth reads even before it is coloured
    box(19, 11, 0.3, 0, 4.5, -71.6, { tag: 'pecina', col: '#1e1b18', solid: false, ink: false });
  }

  // THE KARST SLOPE ('kamenjar' lies at its top) west of the cliff, which the path climbs to the fortress
  {
    const L = Math.hypot(90, CLIFF_Y - TOWN_Y), h = 60, c = V(-84, (TOWN_Y + CLIFF_Y) / 2, -79);
    const cy = c.y - (h / 2) * Math.cos(RAMP_A), cz = c.z - (h / 2) * Math.sin(RAMP_A);
    A(BOX, -84, cy, cz, { tag: 'kamenjar', col: '#b0ab8c', bleed: '#858164', pat: PAT.grass, orb: 'kamenjar' }, 0, RAMP_A, 0, [44, h, L]);
    // round karst mounds along its west side, so the slope sits in the hills
    for (const [mz, r, hh] of [[-44, 16, 12], [-70, 18, 30], [-96, 18, 48], [-122, 20, 64]]) A(HEMI, -108, -2, mz, { tag: 'hills', col: '#a3a272', bleed: '#77774c', pat: PAT.grass, hull: true }, 0, 0, 0, [r, hh, r * 1.3]);
  }

  // enclosing karst hills round the valley
  for (const [hx, hz, rx, ry, rz] of [
    [-150, 10, 60, 30, 70], [-140, 100, 66, 34, 60], [150, 10, 60, 32, 72], [140, 104, 66, 34, 62],
    [-60, 168, 80, 30, 50], [60, 168, 80, 30, 50], [-150, -100, 60, 70, 60], [160, -100, 60, 74, 60],
  ]) {
    A(HEMI, hx, -2.5, hz, { tag: 'hills', col: '#a3a272', bleed: '#77774c', pat: PAT.grass, hull: true, solid: false }, 0, 0, 0, [rx, ry, rz]);
  }

  // ==================== 3. ZONE 1: VRELO BUNE — THE SPRING, THE BOAT, TROUT, MOSS, FOAM (10 words) ====================
  // The spring pool ('vrelo'): deep blue-green, reaching back into the cave
  box(47.4, 0.12, 60, 0, -0.06, -44, {
    tag: 'vrelo', col: '#1a8f8a', bleed: '#0f5f63', pat: PAT.water, hatch: 0, water: true, ink: false, orb: 'vrelo',
  });
  // The Buna below the pool (coloured with the finale)
  box(23.4, 0.12, 168, 0, -0.06, 70, {
    tag: 'rijeka', col: '#2a9f8c', bleed: '#17705f', pat: PAT.water, hatch: 0, water: true, ink: false,
  });

  // Foam ('pjena') where the water boils up at the cave mouth and tumbles round the rocks
  b.object(() => {
    const PJ = { tag: 'pjena', col: '#fbfbf6', bleed: '#d9e4e2', hatch: 0.2, solid: false, orb: 'pjena' };
    for (const [px, pz, r] of [[-6, -45.5, 2.4], [-1.5, -46.5, 2.8], [3.5, -45.6, 2.5], [7.8, -44.6, 2.0], [-9.2, -43.8, 1.6], [0.8, -43.2, 1.8], [5.6, -42.6, 1.4], [-4, -42.4, 1.5]]) {
      A(ICO, px, 0.05, pz, { ...PJ, sway: 10.14 }, R() * 3, 0, 0, [r, 0.22, r * 0.75]);
    }
  });

  // Moss ('mahovina') on the wet boulders either side of the cave mouth
  b.object(() => {
    for (const [mx, mz, r] of [[-16, -43.4, 2.2], [-18.8, -41.4, 1.6], [16, -43.6, 2.0], [18.6, -41.4, 1.5]]) {
      A(ICO, mx, 0.5, mz, { tag: 'hills', col: STONE[0], bleed: STONE[1], hull: true }, R() * 3, 0, 0, [r, r * 0.7, r * 0.85]);
      A(ICO, mx, 0.5 + r * 0.42, mz + 0.1, { tag: 'mahovina', col: '#5f9a3a', bleed: '#3c6e22', hull: true, orb: 'mahovina' }, R() * 3, 0, 0, [r * 0.86, r * 0.42, r * 0.74]);
    }
  });

  // The boat ('camac') and boatman ('camdzija') on the pool, off the cave mouth
  const boatG = new THREE.Group();
  boatG.position.set(-7.5, 0.12, -31.5);
  boatG.rotation.y = 0.5;
  scene.add(boatG);
  dynMesh(BOX, 'camac', '#7e5532', '#573719', boatG, 0, 0.2, 0, [1.4, 0.38, 3.9], 1.2);
  dynMesh(BOX, 'camac', '#a7794a', '#7a542c', boatG, 0, 0.41, 0.7, [1.25, 0.07, 0.34], 1.1);
  dynMesh(BOX, 'camac', '#a7794a', '#7a542c', boatG, 0, 0.41, -1.1, [1.25, 0.07, 0.34], 1.1);
  const prow = dynMesh(CONE4, 'camac', '#8c5f37', '#5f3c1d', boatG, 0, 0.38, -2.35, [0.78, 1.1, 0.6], 1.1);
  prow.rotation.x = -Math.PI / 2 + 0.25;
  people.push({ kind: 'visRower', x: -7.5, y: 0.16, z: -31.5, ry: 0.5, tag: 'camdzija' });

  // A small wooden jetty on the west side of the pool with a spare oar ('veslo') leaning on its post
  b.object(() => {
    box(4.6, 0.25, 3.0, -21.4, TOWN_Y - 0.25, -36.5, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3 });
    for (const [jx, jz] of [[-19.4, -37.8], [-19.4, -35.2]]) A(CYL, jx, TOWN_Y - 1.2, jz, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.14, 2.6, 0.14]);
    A(CYL, -19.4, TOWN_Y + 0.6, -35.2, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.14, 1.4, 0.14]);
    const VS = { tag: 'veslo', col: '#b68a55', bleed: '#86602f', orb: 'veslo' };
    A(CYL, -19.75, TOWN_Y + 0.75, -35.0, VS, 0, 0, 0.24, [0.05, 2.0, 0.05]);
    box(0.08, 0.7, 0.28, -19.98, TOWN_Y - 0.1, -35.0, VS, 0, 0, 0.24);
  });

  // Trout ('pastrmka') turning in the icy pool
  for (const [hx, hz, rx, rz, sp, ph] of [[4, -33, 3.2, 2.2, 0.55, 0], [-2, -38, 2.6, 1.8, 0.7, 2.1], [9, -26, 2.4, 2.8, 0.5, 4.0]]) {
    const g = new THREE.Group(); g.position.set(hx, 0.1, hz); scene.add(g);
    dynMesh(SPHERE, 'pastrmka', '#8f9a7c', '#5d684c', g, 0, 0, 0, [0.16, 0.15, 0.62], 1.1);
    dynMesh(CONE4, 'pastrmka', '#7a8466', '#4f573e', g, 0, 0, -0.72, [0.05, 0.3, 0.22], 1.0).rotation.x = -Math.PI / 2;
    for (const s of [-1, 1]) dynMesh(SPHERE, 'pastrmka', '#c4485a', '#8e2c3a', g, s * 0.12, 0.02, 0.05, [0.03, 0.04, 0.3], 0);
    fish.push({ g, home: V(hx, 0.1, hz), rx, rz, speed: sp, phase: ph });
  }

  // ==================== 4. ZONE 2: THE TEKIJA, THE TURBE, THE COURTYARD (12 words) ====================
  const TK = { tag: 'tekija', col: WHITE[0], bleed: WHITE[1], orb: 'tekija' };
  const TX = 29, TZ = -33;      // the middle of the house
  b.object(() => {
    // stone footing standing in the edge of the pool, against the cliff
    box(17.5, TOWN_Y + 1.2, 13.5, TX - 0.2, TOWN_Y / 2 - 0.6, TZ - 0.2, { tag: 'tekija', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.65, orb: 'tekija' });
    // ground floor (whitewashed stone) and the wider wooden-framed upper floor
    box(15, 3.6, 12, TX + 0.5, TOWN_Y + 1.8, TZ, TK);
    box(16.4, 3.4, 12.8, TX, TOWN_Y + 5.3, TZ, TK);
    // dark timber beams round the upper floor
    for (const y of [TOWN_Y + 3.66, TOWN_Y + 6.94]) box(16.6, 0.22, 13.0, TX, y, TZ, { tag: 'tekija', col: WOOD_D[0], bleed: WOOD_D[1], solid: false });
    // grey stone-slab hipped roof with wide eaves
    A(hipRoofGeo(19, 15.4, 3.6), TX, TOWN_Y + 7.05, TZ, { tag: 'tekija', ...SLAB });
    // door (south face) and ground-floor windows
    box(1.5, 2.4, 0.2, TX + 3, TOWN_Y + 1.2, TZ + 6.05, { tag: 'tekija', col: '#4a3120', solid: false });
    for (const wx of [TX - 3, TX + 6]) box(1.0, 1.1, 0.2, wx, TOWN_Y + 2.1, TZ + 6.05, { tag: 'tekija', col: '#3c3a36', solid: false });
    // the guest house wing (musafirhana) stepping up the rock to the east
    box(7, 5.6, 9, TX + 10.5, TOWN_Y + 2.8, TZ - 2.5, TK);
    A(hipRoofGeo(8.6, 10.4, 2.6), TX + 10.5, TOWN_Y + 5.6, TZ - 2.5, { tag: 'tekija', ...SLAB });
  });

  // The bay window ('doksat'), a little wooden room jutting out over the water on brackets
  const DX = TX - 9.6;      // its middle (west of the house)
  b.object(() => {
    const DK = { tag: 'doksat', col: '#7a5233', bleed: '#55361e', pat: PAT.planks, ps: 2.5, orb: 'doksat' };
    box(2.6, 2.9, 5.2, DX, TOWN_Y + 5.25, TZ + 1, DK);
    box(3.4, 0.2, 5.9, DX - 0.1, TOWN_Y + 6.8, TZ + 1, { tag: 'doksat', ...SLAB, orb: 'doksat' }, 0, 0, 0.12);      // (a lean-to roof tucked under the main eave)
    for (const bz of [TZ - 1.0, TZ + 3.0]) box(2.9, 0.24, 0.24, DX + 0.2, TOWN_Y + 3.0, bz, DK, 0, 0, -0.588);
  });

  // The window lattices ('musebak'): fine wooden grilles on the bay window and the upper floor
  const lattice = (cx, cy, cz, w, h, face) => {
    // face 'x': on a west wall (looking -x); face 'z': on a south wall (looking +z). The dark window sits just behind the grille.
    const M = { tag: 'musebak', col: '#9a7048', bleed: '#6d4b2a', orb: 'musebak' };
    const along = (o) => face === 'x' ? [cx, cz + o] : [cx + o, cz];
    box(face === 'x' ? 0.08 : w, h, face === 'z' ? 0.08 : w, cx + (face === 'x' ? 0.07 : 0), cy, cz - (face === 'z' ? 0.07 : 0), { tag: 'musebak', col: '#3a3029', bleed: '#231c17', solid: false });
    for (let i = 0; i <= 4; i++) { const [px, pz] = along(-w / 2 + (i * w) / 4); box(face === 'x' ? 0.1 : 0.07, h, face === 'z' ? 0.1 : 0.07, px, cy, pz, { ...M, solid: false }); }
    for (let j = 0; j <= 4; j++) box(face === 'x' ? 0.1 : w, 0.07, face === 'z' ? 0.1 : w, cx, cy - h / 2 + (j * h) / 4, cz, { ...M, solid: false });
  };
  b.object(() => {
    for (const oz of [-1.2, 1.2]) lattice(DX - 1.36, TOWN_Y + 5.2, TZ + 1 + oz, 1.6, 1.6, 'x');
    for (const oz of [-4.4, 4.6]) lattice(TX - 8.26, TOWN_Y + 5.2, TZ + oz, 1.5, 1.5, 'x');
    for (const ox of [-5, -1.6, 1.8, 5.2]) lattice(TX + ox, TOWN_Y + 5.2, TZ + 6.46, 1.5, 1.5, 'z');
  });

  // The turbe ('turbe'): a small domed tomb beside the house, and its nišani ('nisan') outside
  b.object(() => {
    const TB = { tag: 'turbe', col: WHITE[0], bleed: WHITE[1], orb: 'turbe' };
    box(5.4, 3.6, 5.4, 46, TOWN_Y + 1.8, -29.5, TB);
    A(OCT, 46, TOWN_Y + 3.9, -29.5, TB, Math.PI / 8, 0, 0, [3.0, 0.6, 3.0]);
    A(HEMI, 46, TOWN_Y + 4.2, -29.5, { tag: 'turbe', col: '#8d9192', bleed: '#63686a', hull: true }, 0, 0, 0, [2.6, 2.3, 2.6]);
    A(CYL, 46, TOWN_Y + 6.9, -29.5, { tag: 'turbe', col: '#d5b043', bleed: '#9e7f22' }, 0, 0, 0, [0.06, 0.8, 0.06]);
    box(1.6, 1.9, 0.2, 46, TOWN_Y + 1.9, -26.75, { tag: 'turbe', col: '#2e5a3e', solid: false });
  });
  b.object(() => {
    box(6.4, 0.5, 4.2, 44, TOWN_Y + 0.25, -24.2, { tag: 'props', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.8 });
    for (const [nx, nz, h, turban] of [[42, -25.2, 1.5, true], [43.6, -25.1, 1.2, false], [45.3, -25.3, 1.6, true], [46.6, -23.2, 1.1, false], [42.2, -23.1, 1.3, true]]) {
      const NS = { tag: 'nisan', col: '#f4f1e8', bleed: '#cfc9b9', orb: 'nisan' };
      box(0.42, h, 0.2, nx, TOWN_Y + 0.5 + h / 2, nz, NS);
      if (turban) A(SPHERE, nx, TOWN_Y + 0.5 + h + 0.16, nz, { ...NS, hull: true }, 0, 0, 0, [0.3, 0.22, 0.26]);
      else A(CONE8, nx, TOWN_Y + 0.5 + h + 0.15, nz, NS, 0, 0, 0, [0.22, 0.3, 0.13]);
    }
  });

  // The courtyard south of the house, paved, with the fountain ('sadrvan') and the copper ewer ('ibrik')
  box(26, 0.06, 12.5, 33, TOWN_Y + 0.03, -20.2, { tag: 'town', col: '#d9d0bd', bleed: '#b7ad98', pat: PAT.cobble, ps: 0.7, solid: false });
  b.object(() => {
    const SD = { tag: 'sadrvan', col: '#efe8d8', bleed: '#c9bfa9', pat: PAT.blocks, ps: 0.9, orb: 'sadrvan' };
    A(OCT, 35, TOWN_Y + 0.4, -19.5, SD, Math.PI / 8, 0, 0, [1.7, 0.8, 1.7]);
    A(OCT, 35, TOWN_Y + 0.78, -19.5, { tag: 'sadrvan', col: '#55b5b2', bleed: '#2f8784', pat: PAT.water, hatch: 0, ink: false, solid: false }, Math.PI / 8, 0, 0, [1.45, 0.06, 1.45]);
    A(CYL12, 35, TOWN_Y + 1.3, -19.5, SD, 0, 0, 0, [0.3, 1.2, 0.3]);
    A(CYL12, 35, TOWN_Y + 1.95, -19.5, SD, 0, 0, 0, [0.55, 0.12, 0.55]);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; A(CYL, 35 + Math.cos(a) * 0.38, TOWN_Y + 1.5, -19.5 + Math.sin(a) * 0.38, { tag: 'sadrvan', col: '#c9a54a', bleed: '#94761f', solid: false }, -a, 0, Math.PI / 2, [0.04, 0.3, 0.04]); }
  });
  b.object(() => {
    const IB = { tag: 'ibrik', col: COPPER[0], bleed: COPPER[1], hull: true, orb: 'ibrik' };
    A(SPHERE, 37.4, TOWN_Y + 1.06, -18.7, IB, 0, 0, 0, [0.2, 0.24, 0.2]);
    A(CYL12, 37.4, TOWN_Y + 1.4, -18.7, IB, 0, 0, 0, [0.07, 0.3, 0.07]);
    A(CYL, 37.18, TOWN_Y + 1.28, -18.7, { tag: 'ibrik', col: COPPER[0], bleed: COPPER[1] }, 0, 0, 0.75, [0.025, 0.38, 0.025]);
    A(new THREE.TorusGeometry(0.13, 0.025, 5, 10), 37.6, TOWN_Y + 1.2, -18.7, { tag: 'ibrik', col: COPPER[0], bleed: COPPER[1] });
    box(0.7, 0.8, 0.7, 37.4, TOWN_Y + 0.4, -18.7, { tag: 'props', col: STONE[0], bleed: STONE[1] });
  });

  // Slippers ('papuce') lined up on a low shelf at the door, headscarves ('marama') on a rail beside it
  b.object(() => {
    box(2.2, 0.36, 0.7, TX + 3, TOWN_Y + 0.18, TZ + 6.9, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3 });
    for (const [px, c1, c2] of [[-0.7, '#b8452c', '#83301c'], [0, '#d9a62e', '#a37718'], [0.7, '#4f7d4a', '#33552f']]) {
      for (const s of [-0.12, 0.12]) A(SPHERE, TX + 3 + px + s, TOWN_Y + 0.42, TZ + 6.9, { tag: 'papuce', col: c1, bleed: c2, hull: true, orb: 'papuce' }, 0, 0, 0, [0.1, 0.06, 0.24]);
    }
  });
  b.object(() => {
    for (const mx of [TX - 1.4, TX + 0.9]) A(CYL, mx, TOWN_Y + 0.8, TZ + 7.1, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.06, 1.6, 0.06]);
    A(CYL, TX - 0.25, TOWN_Y + 1.58, TZ + 7.1, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, Math.PI / 2, [0.04, 2.4, 0.04]);
    for (const [i, c1, c2] of [[0, '#2f6f9e', '#1e4b6e'], [1, '#c2416b', '#8e2a4c'], [2, '#e2b13c', '#a87f1d'], [3, '#5d8f55', '#3d6537']]) {
      box(0.42, 0.9, 0.04, TX - 1.1 + i * 0.56, TOWN_Y + 1.12, TZ + 7.1, { tag: 'marama', col: c1, bleed: c2, orb: 'marama' });
    }
  });

  // The stone terrace on the water where the dervish prays: the prayer rug ('serdzada') and the beads ('tespih') on a bench
  b.object(() => {
    box(6.2, TOWN_Y + 1.0, 9.4, 21.1, TOWN_Y / 2 - 0.5, -21.6, { tag: 'town', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.7 });
    box(0.4, 0.75, 9.4, 18.2, TOWN_Y + 0.37, -21.6, { tag: 'town', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.8, wall: true });
    box(1.2, 0.07, 2.0, 21.0, TOWN_Y + 0.04, -22.8, { tag: 'serdzada', col: '#9c2d2a', bleed: '#6e1c1a', pat: PAT.kilim, ps: 1.6, orb: 'serdzada' });
    box(2.4, 0.42, 0.7, 21.8, TOWN_Y + 0.21, -18.0, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3 });
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; A(SPHERE, 21.6 + Math.cos(a) * 0.2, TOWN_Y + 0.47, -18.0 + Math.sin(a) * 0.13, { tag: 'tespih', col: '#6b3f22', bleed: '#47280f', hull: true, orb: 'tespih' }, 0, 0, 0, 0.042); }
    box(0.05, 0.03, 0.26, 21.88, TOWN_Y + 0.45, -18.0, { tag: 'tespih', col: '#2f6b46', bleed: '#1c4a2d', orb: 'tespih' });
  });
  people.push({ kind: 'chat', robe: true, x: 22.4, y: TOWN_Y + 0.04, z: -24.6, ry: -Math.PI / 2 - 0.3, tag: 'dervis' });

  // ==================== 5. ZONE 3: THE STALLS ON THE PATH (10 words) ====================
  box(9, 0.06, 46, 31, TOWN_Y + 0.03, 9, { tag: 'town', col: '#ddd3bf', bleed: '#b9ae97', pat: PAT.cobble, ps: 0.7, solid: false });
  const stall = (sx, sz) => {
    const TZG = { tag: 'tezga', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3, orb: 'tezga' };
    box(1.3, 0.95, 3.8, sx, TOWN_Y + 0.48, sz, TZG);
    for (const dz of [-1.8, 1.8]) for (const dx of [-0.55, 1.1]) box(0.12, 2.6, 0.12, sx + dx, TOWN_Y + 1.3, sz + dz, TZG);
    for (let i = 0; i < 6; i++) box(2.3, 0.1, 0.68, sx + 0.25, TOWN_Y + 2.66 - 0.12 * 0, sz - 1.7 + i * 0.68, { tag: 'tezga', col: i % 2 ? '#f3ead6' : '#b8452c', bleed: i % 2 ? '#d6caae' : '#86301c', orb: 'tezga' }, 0, 0, -0.22);
  };
  b.object(() => stall(38.5, -5));
  b.object(() => stall(38.5, 4));
  // stall one: pomegranates ('nar') and their juice ('sok')
  b.object(() => {
    for (const [ox, oy, oz] of [[0, 0, -1.2], [0.2, 0, -0.8], [-0.2, 0, -0.85], [0, 0, -0.45], [0.05, 0.2, -0.95], [0, 0.2, -0.6], [0.2, 0, -1.45], [-0.2, 0, -1.4]]) {
      A(SPHERE, 38.5 + ox, TOWN_Y + 1.1 + oy, -5 + oz, { tag: 'nar', col: '#b8252e', bleed: '#7c141c', hull: true, orb: 'nar' }, 0, 0, 0, 0.13);
    }
    for (const oz of [0.6, 0.95, 1.3]) {
      A(CYL12, 38.35, TOWN_Y + 1.1, -5 + oz, { tag: 'sok', col: '#9b1f3a', bleed: '#661226', orb: 'sok' }, 0, 0, 0, [0.07, 0.2, 0.07]);
    }
    A(CYL12, 38.75, TOWN_Y + 1.2, -4.1, { tag: 'sok', col: '#a72441', bleed: '#6e152b', orb: 'sok' }, 0, 0, 0, [0.14, 0.4, 0.14]);
  });
  people.push({ kind: 'sell', woman: true, scarfChoice: 'yes', x: 40.0, y: TOWN_Y + 0.04, z: -5.2, ry: -Math.PI / 2, tag: 'prodavacica' });
  // stall two: figs ('smokva'), honey ('med'), Turkish delight ('lokum')
  b.object(() => {
    A(new THREE.CylinderGeometry(0.42, 0.32, 0.24, 10), 38.5, TOWN_Y + 1.08, 2.7, { tag: 'props', col: '#b08a52', bleed: '#7f6233' });
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; A(SPHERE, 38.5 + Math.cos(a) * 0.18, TOWN_Y + 1.26, 2.7 + Math.sin(a) * 0.18, { tag: 'smokva', col: '#6a3a5c', bleed: '#43213a', hull: true, orb: 'smokva' }, 0, 0, 0, [0.1, 0.12, 0.1]); }
    for (const oz of [3.6, 3.95, 4.3]) {
      A(CYL12, 38.4, TOWN_Y + 1.13, oz, { tag: 'med', col: '#e0a12a', bleed: '#a86f12', orb: 'med' }, 0, 0, 0, [0.12, 0.3, 0.12]);
      A(CYL12, 38.4, TOWN_Y + 1.31, oz, { tag: 'med', col: '#b8452c', bleed: '#86301c' }, 0, 0, 0, [0.13, 0.05, 0.13]);
    }
    A(CYL12, 38.5, TOWN_Y + 0.98, 5.2, { tag: 'props', col: WHITE[0], bleed: WHITE[1] }, 0, 0, 0, [0.4, 0.04, 0.4]);
    for (const [ox, oz, c] of [[-0.12, -0.12, '#f2c9cf'], [0.12, -0.1, '#f7f2e6'], [0, 0.13, '#f2c9cf'], [0.15, 0.14, '#e8f0d0'], [-0.15, 0.12, '#f7f2e6']]) {
      box(0.15, 0.13, 0.15, 38.5 + ox, TOWN_Y + 1.07, 5.2 + oz, { tag: 'lokum', col: c, bleed: '#d8c6b8', orb: 'lokum' }, ox * 3);
    }
  });
  // the fig tree ('smokva') behind the stalls, and a pomegranate tree heavy with fruit ('nar')
  b.object(() => {
    A(CYL, 44, TOWN_Y + 1.4, 8, { tag: 'smokva', col: '#a59e92', bleed: '#7a7468', orb: 'smokva' }, 0, 0, 0.12, [0.32, 2.8, 0.32]);
    for (const [ox, oy, oz, r] of [[0, 3.6, 0, 2.2], [-1.3, 3.0, 0.8, 1.5], [1.2, 3.2, -0.7, 1.6]]) A(ICO, 44 + ox, TOWN_Y + oy, 8 + oz, { tag: 'smokva', col: '#6f9640', bleed: '#4a6b26', hull: true, sway: 0.12 }, 0, 0, 0, [r, r * 0.7, r]);
  });
  b.object(() => {
    A(CYL, 44, TOWN_Y + 1.1, -11, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.22, 2.2, 0.22]);
    A(ICO, 44, TOWN_Y + 2.9, -11, { tag: 'props', col: '#7a9440', bleed: '#55702a', hull: true, sway: 0.12 }, 0, 0, 0, [1.6, 1.3, 1.6]);
    for (const [ox, oy, oz] of [[-0.9, 2.4, 0.9], [0.8, 2.6, 0.9], [0.1, 3.4, 1.2], [1.1, 3.0, -0.6], [-1.0, 3.2, -0.5]]) A(SPHERE, 44 + ox, TOWN_Y + oy, -11 + oz, { tag: 'nar', col: '#c42a30', bleed: '#86161c', hull: true }, 0, 0, 0, 0.15);
  });
  // coffee on a low table by the path: the copper tray ('tepsija'), the pot ('dzezva'), little cups ('fildzan')
  b.object(() => {
    A(CYL12, 34.5, TOWN_Y + 0.3, 13, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.7, 0.6, 0.7]);
    A(CYL16, 34.5, TOWN_Y + 0.64, 13, { tag: 'tepsija', col: COPPER[0], bleed: COPPER[1], pat: PAT.kilim, ps: 2.2, orb: 'tepsija' }, 0, 0, 0, [0.82, 0.05, 0.82]);
    A(CYL12, 34.3, TOWN_Y + 0.82, 12.85, { tag: 'dzezva', col: '#d08646', bleed: '#985622', orb: 'dzezva' }, 0, 0, 0, [0.11, 0.3, 0.11]);
    A(CYL, 34.0, TOWN_Y + 0.92, 12.85, { tag: 'dzezva', col: '#d08646', bleed: '#985622', orb: 'dzezva' }, 0, 0, Math.PI / 2 - 0.3, [0.022, 0.44, 0.022]);
    for (const [ox, oz] of [[0.32, 13.15], [0.12, 13.38], [0.48, 12.8]]) A(CYL12, 34.5 + ox, TOWN_Y + 0.73, oz, { tag: 'fildzan', col: '#f7f4ec', bleed: '#d4cec0', orb: 'fildzan' }, 0, 0, 0, [0.07, 0.12, 0.07]);
    for (const [cx, cz] of [[33.2, 13], [35.8, 13]]) box(0.6, 0.4, 0.6, cx, TOWN_Y + 0.2, cz, { tag: 'props', col: '#a5382b', bleed: '#73241a', pat: PAT.kilim, ps: 2 });
  });
  const pigeons = { x: 31, y: TOWN_Y + 0.08, z: -1, fx: 29, fz: -33, fh: 9, count: 8, spread: 2.2, tag: 'golub' };

  // ==================== 6. ZONE 4: THE RESTAURANT TERRACE FACING THE TEKIJA (10 words) ====================
  const TER_Y = TOWN_Y + 0.12;
  b.object(() => {
    const TR = { tag: 'terasa', col: '#a77a4a', bleed: '#7a5530', pat: PAT.planks, ps: 3, orb: 'terasa' };
    box(13.5, 0.3, 22, -19.25, TER_Y - 0.15, -19, TR);
    for (let pz = -29; pz <= -9; pz += 4) A(CYL, -13.2, -0.4, pz, { tag: 'terasa', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.15, 3.6, 0.15]);
    for (let pz = -29.5; pz <= -8.5; pz += 2.1) box(0.12, 0.95, 0.12, -12.75, TER_Y + 0.47, pz, { ...TR, pat: 0 });
    box(0.14, 0.1, 21.2, -12.75, TER_Y + 0.95, -19, { ...TR, pat: 0, wall: true });
  });
  // the vine pergola ('odrina'), its vine ('loza') and the grapes ('grozd')
  b.object(() => {
    const OD = { tag: 'odrina', col: '#6a4a2e', bleed: '#4a321c', orb: 'odrina' };
    for (const px of [-24.5, -19.6, -14.7]) for (const pz of [-28, -19, -10]) box(0.22, 3.3, 0.22, px, TER_Y + 1.65, pz, OD);
    for (const pz of [-28, -19, -10]) box(10.4, 0.2, 0.22, -19.6, TER_Y + 3.35, pz, OD);
    for (const px of [-24.5, -22.05, -19.6, -17.15, -14.7]) box(0.16, 0.16, 18.8, px, TER_Y + 3.5, -19, OD);
  });
  b.object(() => {
    for (let i = 0; i < 24; i++) {
      const lx = -24.4 + (i % 4) * 3.2 + rr(-0.7, 0.7), lz = -27.6 + Math.floor(i / 4) * 3.4 + rr(-0.7, 0.7);
      A(ICO, lx, TER_Y + 3.7 + rr(0, 0.25), lz, { tag: 'loza', col: i % 3 ? '#8aa040' : '#c2a238', bleed: i % 3 ? '#5d7326' : '#8f6d1c', hull: true, sway: 0.08, orb: 'loza' }, R() * 3, 0, 0, [2.5, 0.42, 2.3]);
    }
  });
  b.object(() => {
    for (const [gx, gz] of [[-22.6, -25.5], [-17.4, -24.2], [-21.2, -21.4], [-16.2, -16.6], [-23.4, -14.2], [-18.6, -12.6]]) {
      for (const [ox, oy, oz, r] of [[0, 0, 0, 0.17], [0.1, -0.2, 0.05, 0.15], [-0.08, -0.22, -0.04, 0.15], [0.02, -0.4, 0, 0.12]]) {
        A(SPHERE, gx + ox, TER_Y + 3.15 + oy, gz + oz, { tag: 'grozd', col: '#4d2c5c', bleed: '#2e183a', hull: true, orb: 'grozd' }, 0, 0, 0, r);
      }
    }
  });
  // tables ('sto') with plates ('tanjir'), grilled trout ('riba') and lemon ('limun')
  const tables = [[-16.8, -25], [-21.6, -21.5], [-16.8, -17], [-21.6, -13]];
  b.object(() => {
    for (const [tx, tz] of tables) {
      box(1.8, 0.08, 1.1, tx, TER_Y + 0.8, tz, { tag: 'sto', col: '#f2eee4', bleed: '#d2ccbd', orb: 'sto' });
      for (const [lx, lz] of [[-0.75, -0.42], [0.75, -0.42], [-0.75, 0.42], [0.75, 0.42]]) box(0.08, 0.78, 0.08, tx + lx, TER_Y + 0.39, tz + lz, { tag: 'sto', col: WOOD_D[0], bleed: WOOD_D[1], orb: 'sto' });
      for (const cx of [-1.3, 1.3]) {
        box(0.5, 0.06, 0.5, tx + cx, TER_Y + 0.46, tz, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
        box(0.06, 0.6, 0.5, tx + cx * 1.2, TER_Y + 0.76, tz, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
        for (const [lx, lz] of [[-0.2, -0.2], [0.2, 0.2], [-0.2, 0.2], [0.2, -0.2]]) box(0.05, 0.44, 0.05, tx + cx + lx, TER_Y + 0.22, tz + lz, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
      }
    }
  });
  b.object(() => {
    for (const [tx, tz] of tables) for (const ox of [-0.45, 0.45]) {
      A(CYL16, tx + ox, TER_Y + 0.86, tz, { tag: 'tanjir', col: '#fbfaf5', bleed: '#dad6cc', orb: 'tanjir' }, 0, 0, 0, [0.3, 0.025, 0.3]);
      A(SPHERE, tx + ox, TER_Y + 0.92, tz - 0.03, { tag: 'riba', col: '#b98a4c', bleed: '#7f5a2a', hull: true, orb: 'riba' }, 0.4, 0, 0, [0.07, 0.05, 0.21]);
      A(CONE4, tx + ox - 0.09, TER_Y + 0.92, tz + 0.21, { tag: 'riba', col: '#a37844', bleed: '#6f4f25', orb: 'riba' }, 0.4, Math.PI / 2, 0, [0.06, 0.1, 0.02]);
      A(HEMI, tx + ox + 0.18, TER_Y + 0.88, tz + 0.1, { tag: 'limun', col: '#f2d43a', bleed: '#c4a51a', hull: true, orb: 'limun' }, 0, 0, 0, [0.06, 0.04, 0.06]);
    }
  });
  // the charcoal grill ('rostilj') at the back of the terrace
  b.object(() => {
    box(1.8, 0.9, 1.0, -24.6, TER_Y + 0.45, -8.6, { tag: 'props', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.9 });
    box(1.6, 0.06, 0.85, -24.6, TER_Y + 0.95, -8.6, { tag: 'rostilj', col: '#2f3236', bleed: '#18191b', orb: 'rostilj' });
    for (let i = 0; i < 7; i++) box(0.04, 0.05, 0.85, -25.3 + i * 0.23, TER_Y + 1.0, -8.6, { tag: 'rostilj', col: '#56595e', bleed: '#2d2f32', orb: 'rostilj', solid: false });
    for (const ox of [-0.4, 0.3]) A(SPHERE, -24.6 + ox, TER_Y + 1.06, -8.6, { tag: 'rostilj', col: '#e05a28', bleed: '#9e3412', hull: true, orb: 'rostilj' }, 0, 0, 0, [0.12, 0.05, 0.08]);
  });
  smoke.push(V(-24.6, TER_Y + 1.2, -8.6));
  people.push({ kind: 'trvWaitress', woman: true, scarfChoice: 'no', x: -19.2, y: TER_Y + 0.04, z: -15.2, ry: Math.PI / 2, tag: 'konobarica' });
  // the restaurant house behind the terrace
  b.object(() => {
    box(9, 4.2, 7, -33, TOWN_Y + 2.1, -21, { tag: 'town', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.7 });
    A(hipRoofGeo(10.4, 8.4, 2.6), -33, TOWN_Y + 4.2, -21, { tag: 'town', ...SLAB });
    for (const oz of [-1.8, 1.8]) box(0.2, 1.1, 1.0, -28.45, TOWN_Y + 2.6, -21 + oz, { tag: 'town', col: '#4a3525', solid: false });
    box(0.2, 2.2, 1.2, -28.45, TOWN_Y + 1.1, -21, { tag: 'town', col: '#3d2818', solid: false });
  });

  // the little stone footbridge below the pool, from the terrace side to the stalls
  b.object(() => {
    const FB = { tag: 'town', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.7 };
    A(archBayGeo(26, TOWN_Y + 1.0, 18, 0.1, TOWN_Y + 0.2, 3.0), 0, -0.6, -4, FB);
    for (const pz of [-5.35, -2.65]) box(26, 0.55, 0.3, 0, TOWN_Y + 0.68, pz, { ...FB, wall: true });
  });

  // ==================== 7. ZONE 5: THE MILLS ON THE MILL RACE (9 words) ====================
  // the mill race ('jaz'): a stone channel along the east bank, fed from the river
  b.object(() => {
    const JZ = { tag: 'jaz', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.8, orb: 'jaz' };
    for (const jx of [14.3, 18.7]) box(0.6, 0.9, 34, jx, TOWN_Y + 0.45, 33, JZ);
    box(3.8, 0.1, 34, 16.5, TOWN_Y + 0.6, 33, { tag: 'jaz', col: '#3fa69a', bleed: '#23766c', pat: PAT.water, hatch: 0, ink: false, orb: 'jaz' });
  });
  // the mill ('mlin') straddling the race, the millstone ('zrvanj') by its door
  b.object(() => {
    const ML = { tag: 'mlin', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.65, orb: 'mlin' };
    box(5.6, 3.5, 5.4, 16.5, TOWN_Y + 1.75, 30, ML);
    A(hipRoofGeo(6.8, 6.6, 2.0), 16.5, TOWN_Y + 3.5, 30, { tag: 'mlin', ...SLAB, orb: 'mlin' });
    box(0.2, 1.9, 1.1, 19.35, TOWN_Y + 1.45, 30, { tag: 'mlin', col: '#4a3120', solid: false });
    for (const pz of [27.35, 32.65]) box(3.4, 0.5, 0.2, 16.5, TOWN_Y + 0.95, pz, { tag: 'mlin', col: '#2a2724', solid: false });
    A(CYL16, 20.1, TOWN_Y + 0.85, 27.9, { tag: 'zrvanj', col: '#a8a294', bleed: '#7a7468', pat: PAT.blocks, ps: 1.4, orb: 'zrvanj' }, 0, 0, Math.PI / 2 - 0.12, [0.85, 0.24, 0.85]);
    A(CYL12, 20.12, TOWN_Y + 0.85, 27.9, { tag: 'zrvanj', col: '#4a4640', bleed: '#2e2b27', solid: false }, 0, 0, Math.PI / 2 - 0.12, [0.16, 0.27, 0.16]);
  });
  // sacks ('vreca') by the door, and flour ('brasno') in an open trough
  b.object(() => {
    for (const [vx, vz, s] of [[20.6, 32.0, 1], [21.4, 32.5, 0.9], [20.9, 32.9, 0.95]]) {
      A(SPHERE, vx, TOWN_Y + 0.42 * s, vz, { tag: 'vreca', col: '#dfd3b8', bleed: '#bfb090', hull: true, orb: 'vreca' }, R(), 0, 0, [0.4 * s, 0.45 * s, 0.34 * s]);
    }
    box(1.8, 0.5, 0.8, 21.4, TOWN_Y + 0.25, 36.0, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3 });
    A(HEMI, 21.4, TOWN_Y + 0.5, 36.0, { tag: 'brasno', col: '#fbf8f0', bleed: '#e2dccd', hull: true, orb: 'brasno' }, 0, 0, 0, [0.8, 0.22, 0.34]);
  });
  people.push({ kind: 'jajMiller', x: 22.6, y: TOWN_Y + 0.04, z: 30.2, ry: -Math.PI / 2, tag: 'mlinar' });
  // the donkey ('magarac') that brings the grain
  b.object(() => {
    const MG = { tag: 'magarac', col: '#8f8a84', bleed: '#635f5a', hull: true, orb: 'magarac' };
    const mx = 25.4, mz = 33.5;
    A(SPHERE, mx, TOWN_Y + 1.0, mz, MG, 0, 0, 0, [0.34, 0.36, 0.72]);
    for (const [lx, lz] of [[-0.18, -0.42], [0.18, -0.42], [-0.18, 0.42], [0.18, 0.42]]) A(CYL, mx + lx, TOWN_Y + 0.4, mz + lz, { tag: 'magarac', col: '#77726c', bleed: '#4f4b47' }, 0, 0, 0, [0.07, 0.8, 0.07]);
    A(CYL, mx, TOWN_Y + 1.3, mz + 0.72, MG, 0, -0.7, 0, [0.14, 0.6, 0.14]);
    A(SPHERE, mx, TOWN_Y + 1.5, mz + 1.05, MG, 0, 0.5, 0, [0.15, 0.15, 0.3]);
    A(SPHERE, mx, TOWN_Y + 1.42, mz + 1.3, { tag: 'magarac', col: '#ddd6cc', bleed: '#b4ac9f', hull: true }, 0, 0, 0, [0.11, 0.1, 0.1]);
    for (const s of [-1, 1]) A(SPHERE, mx + s * 0.09, TOWN_Y + 1.82, mz + 0.95, MG, 0, 0, s * 0.25, [0.05, 0.24, 0.07]);
    A(CYL, mx, TOWN_Y + 0.9, mz - 0.78, MG, 0, 0.4, 0, [0.03, 0.5, 0.03]);
    for (const s of [-1, 1]) box(0.24, 0.5, 0.6, mx + s * 0.4, TOWN_Y + 1.05, mz, { tag: 'magarac', col: '#8a4a2c', bleed: '#5f301a', orb: 'magarac' });
  });
  // the stamping mill ('stupa'): a wooden frame over the race with two heavy hammers, and the wool ('vuna') beside it
  const stupaG = new THREE.Group(); stupaG.position.set(16.5, TOWN_Y, 44.5); scene.add(stupaG);
  b.object(() => {
    const ST = { tag: 'stupa', col: '#7d5634', bleed: '#55371d', orb: 'stupa' };
    for (const dx of [-2.0, 2.0]) for (const dz of [-1.4, 1.4]) box(0.24, 3.0, 0.24, 16.5 + dx, TOWN_Y + 1.5, 44.5 + dz, ST);
    for (const dz of [-1.4, 1.4]) box(4.3, 0.24, 0.24, 16.5, TOWN_Y + 3.0, 44.5 + dz, ST);
    box(4.4, 0.18, 3.2, 16.5, TOWN_Y + 3.2, 44.5, { tag: 'stupa', ...SLAB, orb: 'stupa' }, 0, 0, 0.12);
    box(3.4, 0.7, 1.4, 16.5, TOWN_Y + 0.9, 44.5, { tag: 'stupa', col: '#6b4a2d', bleed: '#4a311a', pat: PAT.planks, ps: 3, orb: 'stupa' });
  });
  const hammers = [];
  for (const hx of [-0.8, 0.8]) {
    const arm = new THREE.Group(); arm.position.set(hx, 2.4, -1.2); stupaG.add(arm);
    dynMesh(BOX, 'stupa', '#8c6339', '#61411f', arm, 0, 0, 0.9, [0.22, 0.22, 1.9], 1.1);
    dynMesh(BOX, 'stupa', '#7a5430', '#53351a', arm, 0, -0.55, 1.75, [0.5, 1.0, 0.45], 1.1);
    hammers.push({ g: arm, phase: hx > 0 ? Math.PI : 0 });
  }
  b.object(() => {
    for (const [ox, oz, r] of [[0, 0, 0.55], [0.5, 0.3, 0.45], [-0.4, 0.35, 0.42], [0.1, 0.55, 0.4], [0.2, -0.1, 0.38]]) {
      A(ICO, 21.0 + ox, TOWN_Y + 0.36 + r * 0.2, 44.0 + oz, { tag: 'vuna', col: '#f7f3ea', bleed: '#dcd4c2', hull: true, orb: 'vuna' }, R() * 3, 0, 0, [r, r * 0.7, r]);
    }
    A(CYL12, 21.6, TOWN_Y + 0.25, 45.6, { tag: 'vuna', col: '#e8dfcb', bleed: '#c4b89f', orb: 'vuna' }, 0.3, 0, Math.PI / 2, [0.25, 1.2, 0.25]);
  });

  // ==================== 8. ZONE 6: THE VELAGIĆ HOUSE AND THE KARAĐOZ-BEG BRIDGE (9 words) ====================
  const VX0 = -46, VX1 = -20, VZ0 = 30, VZ1 = 56;      // the walled compound on the west bank
  b.object(() => {
    const OG = { tag: 'ograda', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.6, wall: true, orb: 'ograda' };
    box(VX1 - VX0, 3.0, 0.7, (VX0 + VX1) / 2, TOWN_Y + 1.5, VZ0, OG);
    box(VX1 - VX0, 3.0, 0.7, (VX0 + VX1) / 2, TOWN_Y + 1.5, VZ1, OG);
    box(0.7, 3.0, VZ1 - VZ0, VX0, TOWN_Y + 1.5, (VZ0 + VZ1) / 2, OG);
    box(0.7, 3.0, 11.2, VX1, TOWN_Y + 1.5, VZ0 + 5.6, OG);
    box(0.7, 3.0, 11.2, VX1, TOWN_Y + 1.5, VZ1 - 5.6, OG);
  });
  // the gate ('kapija') with its own little stone-slab roof
  b.object(() => {
    const KP = { tag: 'kapija', col: '#6b4628', bleed: '#4a2f18', pat: PAT.planks, ps: 2.4, orb: 'kapija' };
    for (const s of [-1, 1]) box(0.16, 2.5, 1.7, VX1 + 0.05, TOWN_Y + 1.25, 43 + s * 0.87, KP);
    for (const s of [-1, 1]) box(0.9, 3.6, 0.9, VX1, TOWN_Y + 1.8, 43 + s * 2.2, { tag: 'kapija', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.8, orb: 'kapija' });
    A(hipRoofGeo(2.4, 6.2, 1.2), VX1, TOWN_Y + 3.6, 43, { tag: 'kapija', ...SLAB, orb: 'kapija' });
  });
  // the courtyard ('avlija'), paved
  box(VX1 - VX0 - 0.8, 0.07, VZ1 - VZ0 - 0.8, (VX0 + VX1) / 2, TOWN_Y + 0.04, (VZ0 + VZ1) / 2, { tag: 'avlija', col: '#d8cfba', bleed: '#b3a991', pat: PAT.cobble, ps: 0.6, orb: 'avlija', solid: false });
  // the house: stone ground floor, whitewashed upper floor; stone-slab roofs ('ploce') and the chimney ('dimnjak')
  b.object(() => {
    box(12, 3.0, 7.4, -36, TOWN_Y + 1.5, 50.5, { tag: 'town', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.65 });
    box(12.6, 3.0, 8.0, -36, TOWN_Y + 4.5, 50.5, { tag: 'town', col: WHITE[0], bleed: WHITE[1] });
    for (const ox of [-4, -1.3, 1.4, 4.1]) box(0.95, 1.2, 0.2, -36 + ox, TOWN_Y + 4.6, 46.45, { tag: 'town', col: '#4a3525', solid: false });
    box(1.2, 2.2, 0.2, -36, TOWN_Y + 1.1, 46.75, { tag: 'town', col: '#3d2818', solid: false });
    box(6.5, 3.0, 5.2, -40.5, TOWN_Y + 1.5, 35, { tag: 'town', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.65 });
    box(1.0, 1.9, 0.2, -38.5, TOWN_Y + 0.95, 37.65, { tag: 'town', col: '#3d2818', solid: false });
  });
  b.object(() => {
    const PL = { tag: 'ploce', ...SLAB, orb: 'ploce' };
    A(hipRoofGeo(14.4, 9.8, 3.4), -36, TOWN_Y + 6.0, 50.5, PL);
    A(hipRoofGeo(8.0, 6.6, 2.2), -40.5, TOWN_Y + 3.0, 35, PL);
  });
  b.object(() => {
    const DM = { tag: 'dimnjak', col: '#c8bfae', bleed: '#9b927f', pat: PAT.blocks, ps: 1.0, orb: 'dimnjak' };
    box(0.9, 2.2, 0.9, -32.5, TOWN_Y + 8.4, 51.5, DM);
    box(1.3, 0.14, 1.3, -32.5, TOWN_Y + 9.95, 51.5, { tag: 'dimnjak', ...SLAB, orb: 'dimnjak' });
  });
  smoke.push(V(-32.5, TOWN_Y + 10.2, 51.5));
  // the well ('bunar') in the courtyard
  b.object(() => {
    const BN = { tag: 'bunar', col: '#d4ccbb', bleed: '#a99f8b', pat: PAT.blocks, ps: 1.1, orb: 'bunar' };
    A(CYL16, -29.5, TOWN_Y + 0.45, 42, BN, 0, 0, 0, [0.95, 0.9, 0.95]);
    A(CYL16, -29.5, TOWN_Y + 0.92, 42, { tag: 'bunar', col: '#2a3a3c', bleed: '#18232a', solid: false }, 0, 0, 0, [0.75, 0.04, 0.75]);
    for (const s of [-1, 1]) box(0.14, 1.6, 0.14, -29.5 + s * 0.9, TOWN_Y + 1.6, 42, { tag: 'bunar', col: WOOD_D[0], bleed: WOOD_D[1], orb: 'bunar' });
    A(CYL, -29.5, TOWN_Y + 2.3, 42, { tag: 'bunar', col: WOOD_W[0], bleed: WOOD_W[1], orb: 'bunar' }, 0, 0, Math.PI / 2, [0.08, 2.0, 0.08]);
    A(new THREE.CylinderGeometry(0.2, 0.16, 0.3, 10), -29.5, TOWN_Y + 1.5, 42, { tag: 'bunar', col: '#7a6a52', bleed: '#544735', orb: 'bunar' });
  });
  // the mulberry ('dud') shading the courtyard; cypresses ('cempres') outside the wall
  b.object(() => {
    A(CYL, -25.5, TOWN_Y + 1.8, 51, { tag: 'dud', col: '#6b5340', bleed: '#4a3829', orb: 'dud' }, 0, 0, -0.1, [0.4, 3.6, 0.4]);
    for (const [ox, oy, oz, r] of [[0, 4.6, 0, 2.6], [-1.6, 4.0, 0.9, 1.8], [1.5, 4.2, -0.8, 1.9]]) A(ICO, -25.5 + ox, TOWN_Y + oy, 51 + oz, { tag: 'dud', col: '#a3a43c', bleed: '#727323', hull: true, sway: 0.12, orb: 'dud' }, 0, 0, 0, [r, r * 0.72, r]);
  });
  b.object(() => {
    for (const [cx, cz, s] of [[-16.5, 30.5, 1.1], [-16.5, 55.5, 1.0], [-49, 59, 1.15]]) {
      A(CYL, cx, TOWN_Y + 0.6 * s, cz, { tag: 'cempres', col: WOOD_D[0], bleed: WOOD_D[1], orb: 'cempres' }, 0, 0, 0, [0.2, 1.2 * s, 0.2]);
      A(SPHERE, cx, TOWN_Y + 4.6 * s, cz, { tag: 'cempres', col: '#2f5a36', bleed: '#1c3b22', hull: true, sway: 0.06, orb: 'cempres' }, 0, 0, 0, [0.95 * s, 4.2 * s, 0.95 * s]);
    }
  });

  // The Karađoz-beg bridge ('most'): five arches over the Buna, a little humped
  const MZ = 86;
  b.object(() => {
    const MS = { tag: 'most', col: '#ddd4c0', bleed: '#b5aa92', pat: PAT.blocks, ps: 0.65, pool: 0.85, orb: 'most' };
    const bay = archBayGeo(4.8, BRIDGE_Y, 3.7, 1.0, 3.3, 4.2);
    for (const cx of [-9.6, -4.8, 0, 4.8, 9.6]) A(bay, cx, 0, MZ, MS);
    // cutwaters on the upstream side (-z) of the four piers
    for (const px of [-7.2, -2.4, 2.4, 7.2]) {
      box(1.1, 2.4, 1.1, px, 0.9, MZ - 2.4, MS, Math.PI / 4);
      A(CONE4, px, 2.6, MZ - 2.4, { tag: 'most', col: '#e6ddca', bleed: '#bdb29b' }, 0, 0, 0, [0.82, 1.0, 0.82]);
    }
    box(25.4, 0.3, 4.4, 0, BRIDGE_Y + 0.15, MZ, { tag: 'most', col: '#d6ccb6', bleed: '#ada28a', pat: PAT.cobble, ps: 0.7, orb: 'most' });
    for (const pz of [-2.05, 2.05]) box(25.4, 0.8, 0.3, 0, BRIDGE_Y + 0.7, MZ + pz, { ...MS, wall: true });
    // ramps down to the banks
    for (const s of [-1, 1]) box(7.6, 2.0, 4.2, s * 15.8, TOWN_Y + 0.55, MZ, { tag: 'most', col: '#ddd4c0', bleed: '#b5aa92', pat: PAT.blocks, ps: 0.7, orb: 'most' }, 0, 0, -s * 0.34);
  });

  // ==================== 9. ZONE 7: THE KARST, THE PATH, THE WILDLIFE AND STJEPAN GRAD (9 words) ====================
  // The path ('staza'): stone steps zigzagging up the karst slope to the fortress
  b.object(() => {
    const SZ = { tag: 'staza', col: '#ddd5c3', bleed: '#b4aa95', pat: PAT.cobble, ps: 0.8, orb: 'staza' };
    const pts = [[-67, -37], [-99, -58], [-69, -82], [-99, -104], [-70, -122]];
    for (let k = 0; k < pts.length - 1; k++) {
      const [x0, z0] = pts[k], [x1, z1] = pts[k + 1], n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 2.2);
      for (let i = 0; i < n; i++) {
        const t = i / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, y = rampY(z);
        box(3.4, 1.6, 2.6, x, y - 0.7, z, SZ, Math.atan2(x1 - x0, z1 - z0));
      }
    }
  });
  // scattered boulders on the slope
  b.object(() => {
    for (let i = 0; i < 60; i++) {
      const x = rr(-104, -64), z = rr(-122, -38), r = rr(0.6, 1.8);
      if (i % 3 === 0) A(ICO, x, rampY(z) + 0.3, z, { tag: 'hills', col: '#7f8d4c', bleed: '#5c6634', hull: true, sway: 0.05 }, 0, 0, 0, [r, r * 0.55, r]);
      else A(ICO0, x, rampY(z) + r * 0.25, z, { tag: 'kamenjar', col: '#cbc4b3', bleed: '#9b9483', hull: true, orb: 'kamenjar' }, R() * 6, 0, 0, [r, r * 0.6, r * 0.9]);
    }
  });

  // On the plateau, east of the fortress: the rocky ground ('kamenjar'), sage ('zalfija'), immortelle ('smilje') and a tortoise ('kornjaca')
  b.object(() => {
    const KM = { tag: 'kamenjar', col: '#c3bca9', bleed: '#958e7b', pat: PAT.cobble, ps: 0.35, orb: 'kamenjar' };
    box(26, 0.3, 18, 34, CLIFF_Y + 0.12, -70, KM);
    for (let i = 0; i < 16; i++) {
      const x = rr(23, 45), z = rr(-78, -62), r = rr(0.5, 1.3);
      if (Math.hypot(x - 30, z + 66) < 2.5 || Math.hypot(x - 24, z + 63) < 2.2 || Math.hypot(x - 37, z + 64) < 2.2) continue;
      A(ICO0, x, CLIFF_Y + r * 0.3, z, { ...KM, pat: 0, hull: true }, R() * 6, 0, 0, [r, r * 0.55, r * 0.85]);
    }
  });
  b.object(() => {
    for (const [sx, sz, r] of [[23.5, -62.5, 0.7], [25, -63.6, 0.6], [22.6, -64.0, 0.55]]) {
      A(ICO, sx, CLIFF_Y + r * 0.6, sz, { tag: 'zalfija', col: '#9fae9c', bleed: '#6f806d', hull: true, sway: 0.06, orb: 'zalfija' }, 0, 0, 0, [r, r * 0.8, r]);
      for (let k = 0; k < 4; k++) A(SPHERE, sx + rr(-0.4, 0.4), CLIFF_Y + r * 1.2 + rr(0, 0.25), sz + rr(-0.4, 0.4), { tag: 'zalfija', col: '#8a62b0', bleed: '#5e3f80', hull: true, orb: 'zalfija' }, 0, 0, 0, [0.06, 0.16, 0.06]);
    }
  });
  b.object(() => {
    for (const [sx, sz] of [[36.5, -63.8], [37.8, -64.8], [36.2, -65.2]]) {
      A(ICO, sx, CLIFF_Y + 0.3, sz, { tag: 'smilje', col: '#a8ab8a', bleed: '#7a7d5f', hull: true, orb: 'smilje' }, 0, 0, 0, [0.45, 0.35, 0.45]);
      for (let k = 0; k < 5; k++) A(SPHERE, sx + rr(-0.32, 0.32), CLIFF_Y + 0.66, sz + rr(-0.32, 0.32), { tag: 'smilje', col: '#f0c52c', bleed: '#c49a12', hull: true, orb: 'smilje' }, 0, 0, 0, [0.1, 0.06, 0.1]);
    }
  });
  const tortoise = new THREE.Group(); tortoise.position.set(30, CLIFF_Y + 0.02, -66); scene.add(tortoise);
  {
    dynMesh(HEMI, 'kornjaca', '#7d6a3e', '#54451f', tortoise, 0, 0.12, 0, [0.42, 0.34, 0.52], 1.2);
    dynMesh(SPHERE, 'kornjaca', '#9b8a62', '#6c5e3c', tortoise, 0, 0.18, 0.58, [0.12, 0.1, 0.15], 1.1);
    for (const [lx, lz] of [[-0.3, 0.3], [0.3, 0.3], [-0.3, -0.3], [0.3, -0.3]]) dynMesh(SPHERE, 'kornjaca', '#9b8a62', '#6c5e3c', tortoise, lx, 0.08, lz, [0.09, 0.08, 0.11], 1.0);
  }

  // The falcon ('sokol') on a ledge high on the cliff west of the cave
  const LEDGE = V(-22, 30, cliffZ(-22) + 1.0);
  b.object(() => {
    A(CYL16, LEDGE.x, LEDGE.y - 0.3, LEDGE.z - 0.6, { tag: 'stijena', col: '#d3cbba', bleed: '#a39a86', hull: true, orb: 'stijena' }, 0.2, 0, 0, [2.4, 0.6, 2.0]);
  });
  {
    const g = new THREE.Group(); g.position.set(LEDGE.x + 0.6, LEDGE.y, LEDGE.z + 0.4); scene.add(g);
    dynMesh(ICO, 'sokol', '#6f747a', '#4a4e53', g, 0, 0.32, 0, [0.2, 0.32, 0.22], 1.1);
    dynMesh(SPHERE, 'sokol', '#e9e2d2', '#bfb6a2', g, 0, 0.28, 0.12, [0.15, 0.22, 0.12], 1.0);
    dynMesh(SPHERE, 'sokol', '#3a3d42', '#24272b', g, 0, 0.7, 0.04, 0.14, 1.1);
    dynMesh(CONE4, 'sokol', '#e0b42c', '#a88310', g, 0, 0.68, 0.2, [0.04, 0.14, 0.04], 1.0).rotation.x = Math.PI / 2;
    dynMesh(BOX, 'sokol', '#5c6066', '#3d4045', g, 0, 0.2, -0.32, [0.14, 0.04, 0.4], 1.0).rotation.x = -0.5;
    birds.push({ g, ry: 0.3, phase: 0.4 });
  }

  // Swallows ('lasta'): mud nests under an overhang on the cliff east of the cave, and the birds darting along the rock
  const NEST = V(30, 13, cliffZ(30) + 0.4);
  b.object(() => {
    A(CYL16, NEST.x, NEST.y + 1.15, NEST.z - 0.4, { tag: 'stijena', col: '#d3cbba', bleed: '#a39a86', hull: true, orb: 'stijena' }, 0.1, 0, 0, [3.6, 0.6, 2.2]);
    for (const ox of [-2.0, -0.7, 0.6, 1.9]) A(HEMI, NEST.x + ox, NEST.y + 0.86, NEST.z + 0.05, { tag: 'lasta', col: '#8a6d4c', bleed: '#5f4a31', hull: true, orb: 'lasta' }, 0, Math.PI, 0, [0.42, 0.42, 0.36]);
  });
  for (let i = 0; i < 6; i++) {
    const g = new THREE.Group(); scene.add(g);
    dynMesh(SPHERE, 'lasta', '#24324a', '#141c2b', g, 0, 0, 0, [0.09, 0.08, 0.24], 1.0);
    dynMesh(SPHERE, 'lasta', '#f3ede0', '#cfc6b2', g, 0, -0.04, 0.03, [0.07, 0.05, 0.16], 0);
    const wings = [-1, 1].map((s) => { const w = new THREE.Group(); w.position.set(s * 0.06, 0.02, 0); g.add(w); dynMesh(BOX, 'lasta', '#24324a', '#141c2b', w, s * 0.22, 0, -0.02, [0.44, 0.02, 0.12], 0); return w; });
    dynMesh(BOX, 'lasta', '#24324a', '#141c2b', g, 0, 0, -0.32, [0.12, 0.02, 0.22], 0);
    swallows.push({ g, wings, cx: 6 + i * 4.5, cy: 10 + (i % 3) * 3.5, r: 9 + (i % 2) * 4, speed: 0.55 + (i % 3) * 0.12, phase: i * 1.7 });
  }

  // Stjepan grad ('tvrdjava'): ruined walls and the keep on the hill above the cliff; the lone tower ('kula') at the cliff edge
  b.object(() => {
    const TV = { tag: 'tvrdjava', col: '#d6ccb4', bleed: '#ada188', pat: PAT.blocks, ps: 0.6, pool: 0.85, orb: 'tvrdjava' };
    const ring = [[-42, -72], [-12, -66], [2, -80], [-2, -106], [-28, -114], [-48, -96]];
    for (let i = 0; i < ring.length; i++) {
      const [x0, z0] = ring[i], [x1, z1] = ring[(i + 1) % ring.length], len = Math.hypot(x1 - x0, z1 - z0), h = [6.5, 5.0, 7.0, 5.5, 6.0, 4.6][i];
      if (i === 4) {      // a breach in the south-west wall
        box(len * 0.4, h, 2.2, x0 + (x1 - x0) * 0.2, CLIFF_Y + h / 2, z0 + (z1 - z0) * 0.2, TV, -Math.atan2(z1 - z0, x1 - x0));
        box(len * 0.4, h * 0.7, 2.2, x0 + (x1 - x0) * 0.8, CLIFF_Y + h * 0.35, z0 + (z1 - z0) * 0.8, TV, -Math.atan2(z1 - z0, x1 - x0));
      } else box(len + 1.6, h, 2.2, (x0 + x1) / 2, CLIFF_Y + h / 2, (z0 + z1) / 2, TV, -Math.atan2(z1 - z0, x1 - x0));
      box(3.6, h + 2.2, 3.6, x0, CLIFF_Y + (h + 2.2) / 2, z0, TV);
    }
    box(9, 13, 9, -22, CLIFF_Y + 6.5, -92, TV);
    box(4.5, 3.5, 9, -24.2, CLIFF_Y + 14.75, -92, TV);
    box(2.2, 3.4, 0.4, -22, CLIFF_Y + 1.7, -87.4, { tag: 'tvrdjava', col: '#3d3833', solid: false });
  });
  b.object(() => {
    const KL = { tag: 'kula', col: '#d0c6ae', bleed: '#a69a80', pat: PAT.blocks, ps: 0.6, orb: 'kula' };
    A(CYL16, 12, CLIFF_Y + 4.5, -55.5, KL, 0, 0, 0, [3.0, 9, 3.0]);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; if (i === 2) continue; box(1.1, 1.3, 0.9, 12 + Math.cos(a) * 2.6, CLIFF_Y + 9.65, -55.5 + Math.sin(a) * 2.6, KL, -a); }
    box(0.9, 1.6, 0.3, 12, CLIFF_Y + 5.5, -52.45, { tag: 'kula', col: '#3d3833', solid: false });
  });

  // ==================== 10. HOUSES, TREES AND PEOPLE OF THE VILLAGE ====================
  for (const [hx, hz, w, d, h, ry] of [
    [58, -6, 7.0, 5.6, 3.2, 0.1], [62, 18, 6.6, 5.4, 3.0, -0.08], [54, 56, 7.2, 5.8, 3.1, 0.15], [64, 38, 6.4, 5.2, 2.9, 0],
    [-56, -8, 6.8, 5.6, 3.0, -0.1], [-60, 12, 7.0, 5.6, 3.2, 0.05], [-58, 74, 6.6, 5.4, 3.0, 0.12], [-30, 74, 6.4, 5.2, 2.9, -0.06],
  ]) {
    b.object(() => {
      box(w, 1.4, d, hx, TOWN_Y + 0.7, hz, { tag: 'town', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.7 }, ry);
      box(w + 0.3, h, d + 0.3, hx, TOWN_Y + 1.4 + h / 2, hz, { tag: 'town', col: WHITE[0], bleed: WHITE[1] }, ry);
      A(hipRoofGeo(w + 1.2, d + 1.2, 2.6), hx, TOWN_Y + 1.4 + h, hz, { tag: 'town', ...SLAB }, ry);
      const s = hx > 0 ? -1 : 1;      // windows on the side facing the river
      for (const oz of [-1.3, 1.3]) box(0.18, 1.1, 0.9, hx + s * (w / 2 + 0.17), TOWN_Y + 2.9, hz + oz, { tag: 'town', col: '#4a3525', solid: false }, ry);
    });
  }
  const trees = [
    // willows and poplars along the Buna below the bridge, figs and pomegranates in the gardens, cypresses and pines
    [-17, TOWN_Y, 10, 1.1, '#c9b03e', '#93801f', 'riverbank', 'round'], [17, TOWN_Y, 60, 1.1, '#d0a63a', '#9a771c', 'riverbank', 'round'],
    [-17, TOWN_Y, 68, 1.15, '#b9b445', '#878222', 'riverbank', 'round'], [17, TOWN_Y, 100, 1.2, '#dc9a35', '#a56c18', 'riverbank', 'round'],
    [-17, TOWN_Y, 104, 1.1, '#c8a23a', '#93741b', 'riverbank', 'round'], [48, TOWN_Y, 24, 1.0, '#7e9a42', '#56702a', 'riverbank', 'round'],
    [-48, TOWN_Y, 0, 1.0, '#829c44', '#5a722b', 'riverbank', 'round'], [52, TOWN_Y, -20, 1.0, '#2f5a36', '#1c3b22', 'riverbank', 'cypress'],
    [-44, TOWN_Y, -30, 1.1, '#2f5a36', '#1c3b22', 'riverbank', 'cypress'], [70, TOWN_Y, 0, 1.15, '#2f5a36', '#1c3b22', 'riverbank', 'cypress'],
    [-68, TOWN_Y, 40, 1.1, '#2f5a36', '#1c3b22', 'riverbank', 'cypress'], [36, TOWN_Y, 70, 1.2, '#cf8a33', '#985f17', 'riverbank', 'round'],
    [-40, TOWN_Y, 88, 1.15, '#c79a37', '#92701a', 'riverbank', 'round'], [74, TOWN_Y, 50, 1.2, '#3f6438', '#273f22', 'riverbank', 'pine'],
    [-74, TOWN_Y, -12, 1.2, '#3f6438', '#273f22', 'riverbank', 'pine'],
    // up on the plateau, between the fortress and the cliff edge
    [-4, CLIFF_Y, -62, 1.0, '#3f6438', '#273f22', 'hills', 'pine'], [48, CLIFF_Y, -58, 1.05, '#7f8f46', '#58662c', 'hills', 'round'],
    [56, CLIFF_Y, -82, 1.1, '#3f6438', '#273f22', 'hills', 'pine'], [-52, CLIFF_Y, -70, 1.0, '#3f6438', '#273f22', 'hills', 'pine'],
  ];
  for (const [tx, ty, tz, s, c1, c2, tg, kind] of trees) {
    b.object(() => {
      if (kind === 'cypress') {
        A(CYL, tx, ty + 0.6 * s, tz, { tag: tg, col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.22, 1.2 * s, 0.22]);
        A(SPHERE, tx, ty + 5.0 * s, tz, { tag: tg, col: c1, bleed: c2, hull: true, sway: 0.06 }, 0, 0, 0, [1.0 * s, 4.6 * s, 1.0 * s]);
      } else if (kind === 'pine') {
        A(CYL, tx, ty + 1.8 * s, tz, { tag: tg, col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.26 * s, 3.6 * s, 0.26 * s]);
        for (const [y, r] of [[3.2, 2.2], [4.6, 1.7], [5.8, 1.1]]) A(CONE8, tx, ty + y * s, tz, { tag: tg, col: c1, bleed: c2, hull: true, sway: 0.08 }, 0, 0, 0, [r * s, 1.9 * s, r * s]);
      } else {
        A(CYL, tx, ty + 2.0 * s, tz, { tag: tg, col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.28 * s, 4.0 * s, 0.28 * s]);
        A(ICO, tx, ty + 4.6 * s, tz, { tag: tg, col: c1, bleed: c2, hull: true, sway: 0.14 }, 0, 0, 0, [2.1 * s, 1.8 * s, 2.1 * s]);
      }
    });
  }
  // visitors: on the path to the Tekija (the women in borrowed headscarves), taking photos, and crossing the bridges
  people.push({ kind: 'walk', x: 30.5, y: TOWN_Y + 0.04, z: 26, to: [30.5, -12], speed: 0.9, tag: 'passerby', woman: true, scarfChoice: 'yes' });
  people.push({ kind: 'walk', x: 27.5, y: TOWN_Y + 0.04, z: -12, to: [27.5, 24], speed: 1.0, tag: 'passerby' });
  people.push({ kind: 'photo', x: -14.6, y: TER_Y + 0.04, z: -28.6, ry: Math.PI * 0.82, tag: 'passerby', woman: true, scarfChoice: 'no' });
  people.push({ kind: 'walk', x: -10, y: TOWN_Y + 0.44, z: -4.0, to: [10, -4.1], speed: 0.8, tag: 'passerby' });
  people.push({ kind: 'walk', x: 8, y: BRIDGE_Y + 0.34, z: MZ - 0.5, to: [-8, MZ - 0.5], speed: 0.85, tag: 'passerby', woman: true });
  people.push({ kind: 'chat', x: 27.6, y: TOWN_Y + 0.04, z: -20.4, ry: 0.6, tag: 'passerby', woman: true, scarfChoice: 'yes' });
  people.push({ kind: 'chat', x: 28.6, y: TOWN_Y + 0.04, z: -19.6, ry: -2.4, tag: 'passerby' });

  // ==================== 11. ALL 69 ORBS ====================
  // Zone 1: Vrelo Bune (10)
  orbs.push({
    id: 'vrelo', focus: V(0, 0, -34), size: 26, tags: ['vrelo'], shot: 'combo',
    at: V(0, 2.4, -24), stage: 0,
    swim: { p: [0, 0, -24], r: 9.0 },
    view: { from: [-14, 7, -6], to: [14, 7, -6], look: [0, 1, -38] },
    wideView: { from: [-20, 20, 8], to: [20, 20, 8], look: [0, 2, -40], lookTo: [0, 4, -40] },
  });
  orb('pecina', [0, 6, -47], 20, ['pecina'], 'combo', 0.6, {
    at: V(-2, 3.2, -41), swim: { p: [-2, 0, -41], r: 3.5 },
    view: { from: [-10, 6, -24], to: [10, 6, -24], look: [0, 6, -50] },
    wideView: { from: [-18, 14, -10], to: [18, 14, -10], look: [0, 7, -50], lookTo: [0, 7, -50] },
  });
  orb('stijena', [0, 32, -46], 70, ['stijena'], 'combo', 3, {
    at: V(-30, 4.6, -26), near: { p: [-30, TOWN_Y, -26], r: 6.0 },
    view: { from: [-62, 12, 24], to: [-44, 16, 30], look: [2, 30, -46] },
    wideView: { from: [-50, 40, 40], to: [50, 40, 40], look: [0, 30, -46], lookTo: [0, 30, -46] },
  });
  orb('camac', [-7.5, 0.4, -31.5], 4.0, ['camac'], 'close', 1.0, { at: V(-11, 2.6, -29), swim: { p: [-11, 0, -29], r: 3.0 } });
  orb('veslo', [-19.8, TOWN_Y + 0.5, -35], 2.2, ['veslo'], 'close', TOWN_Y + 1.6, { near: { p: [-21.8, TOWN_Y - 0.12, -36.5], r: 2.2 } });
  orb('camdzija', [-7.5, 1.0, -31.5], 2.6, ['camdzija'], 'close', 2.0, { at: V(-5.5, 2.6, -35), swim: { p: [-5.5, 0, -35], r: 2.8 } });
  orb('pastrmka', [4, 0.1, -33], 3.5, ['pastrmka'], 'close', 0.8, { at: V(6, 2.2, -30), swim: { p: [6, 0, -30], r: 4.0 } });
  orb('mahovina', [16, 1.4, -43.6], 3.0, ['mahovina'], 'close', 2.4, { near: { p: [16, 2.1, -43.6], r: 2.0 } });
  orb('pjena', [0, 0.1, -44.5], 9, ['pjena'], 'close', 0.5, {
    at: V(7, 2.3, -41), swim: { p: [7, 0, -41], r: 3.0 },
    view: { from: [-8, 4.5, -33], to: [6, 4.5, -33], look: [0, 0.2, -44.5] },
  });
  orb('golub', [31, TOWN_Y + 0.2, -1], 4, ['golub'], 'close', TOWN_Y + 0.6, { near: { p: [30, TOWN_Y, -1], r: 2.0 } });

  // Zone 2: the Tekija (12)
  orb('tekija', [TX, TOWN_Y + 4, TZ], 20, ['tekija'], 'combo', TOWN_Y + 12.6, {
    view: { from: [8, 9, -6], to: [16, 10, 2], look: [TX, TOWN_Y + 4.5, TZ] },
    wideView: { from: [-14, 14, 0], to: [-4, 18, 10], look: [TX, TOWN_Y + 5, TZ], lookTo: [TX, TOWN_Y + 5, TZ] },
  });
  orb('doksat', [DX, TOWN_Y + 5.2, TZ + 1], 5, ['doksat'], 'close', TOWN_Y + 7.2, {
    at: V(DX - 0.6, TOWN_Y + 8.6, TZ + 1), near: { p: [DX - 0.5, TOWN_Y + 6.88, TZ + 1], r: 1.6 },
    view: { from: [DX - 9, TOWN_Y + 6, TZ + 7], to: [DX - 9, TOWN_Y + 6, TZ - 3], look: [DX, TOWN_Y + 5.2, TZ + 1] },
  });
  orb('musebak', [DX - 1.4, TOWN_Y + 5.2, TZ + 1], 4, ['musebak'], 'close', TOWN_Y + 7.0, {
    at: V(25.4, TOWN_Y + 2.2, -23.4), near: { p: [25.4, TOWN_Y, -23.4], r: 1.0 },
    view: { from: [DX - 6.5, TOWN_Y + 5.6, TZ + 3.5], to: [DX - 6.5, TOWN_Y + 5.6, TZ - 1.5], look: [DX - 1.4, TOWN_Y + 5.2, TZ + 1] },
  });
  orb('turbe', [46, TOWN_Y + 3.4, -29.5], 7, ['turbe'], 'close', TOWN_Y + 7.4);
  orb('nisan', [44, TOWN_Y + 1.4, -24.4], 4.5, ['nisan'], 'close', TOWN_Y + 2.4, { near: { p: [44, TOWN_Y, -20.8], r: 1.4 } });
  orb('dervis', [22.4, TOWN_Y + 1.0, -24.6], 2.6, ['dervis'], 'close', TOWN_Y + 2.2, { near: { p: [20.0, TOWN_Y, -25.6], r: 1.5 } });
  orb('serdzada', [21.0, TOWN_Y + 0.1, -22.8], 2.4, ['serdzada'], 'close', TOWN_Y + 0.8, { near: { p: [19.5, TOWN_Y, -22.4], r: 1.5 } });
  orb('tespih', [21.6, TOWN_Y + 0.47, -18.0], 1.4, ['tespih'], 'close', TOWN_Y + 1.1, { near: { p: [20.9, TOWN_Y + 0.42, -18.0], r: 1.0 } });
  orb('papuce', [TX + 3, TOWN_Y + 0.4, TZ + 6.9], 2.0, ['papuce'], 'close', TOWN_Y + 1.0, { near: { p: [TX + 3, TOWN_Y, TZ + 8.4], r: 1.1 } });
  orb('marama', [TX - 0.25, TOWN_Y + 1.15, TZ + 7.1], 2.4, ['marama'], 'close', TOWN_Y + 2.0, { near: { p: [TX - 0.4, TOWN_Y, TZ + 8.4], r: 1.1 } });
  orb('sadrvan', [35, TOWN_Y + 1.0, -19.5], 3.6, ['sadrvan'], 'close', TOWN_Y + 2.1);
  orb('ibrik', [37.4, TOWN_Y + 1.2, -18.7], 1.6, ['ibrik'], 'close', TOWN_Y + 1.9, { near: { p: [37.4, TOWN_Y, -16.8], r: 1.2 } });

  // Zone 3: the stalls (10)
  orb('tezga', [38.8, TOWN_Y + 1.4, -0.5], 10, ['tezga'], 'combo', TOWN_Y + 3.0, {
    at: V(35.0, TOWN_Y + 2.4, -0.5), near: { p: [35.0, TOWN_Y, -0.5], r: 1.6 },
    view: { from: [30, 4.5, -8], to: [30, 4.5, 6], look: [38.8, TOWN_Y + 1.4, -0.5] },
  });
  orb('prodavacica', [40.0, TOWN_Y + 1.0, -5.2], 2.6, ['prodavacica'], 'close', TOWN_Y + 2.2, { view: { from: [35.4, TOWN_Y + 2.3, -7.6], to: [35.4, TOWN_Y + 2.3, -3.2], look: [40.0, TOWN_Y + 1.3, -5.2] }, at: V(41.5, TOWN_Y + 2.4, -5.2), near: { p: [41.5, TOWN_Y, -5.2], r: 1.4 } });
  orb('nar', [38.5, TOWN_Y + 1.2, -5.95], 2.2, ['nar'], 'close', TOWN_Y + 2.0, { at: V(36.6, TOWN_Y + 2.0, -7.6), near: { p: [36.6, TOWN_Y, -7.6], r: 1.0 } });
  orb('sok', [38.4, TOWN_Y + 1.15, -4.0], 1.8, ['sok'], 'close', TOWN_Y + 1.9, { at: V(36.6, TOWN_Y + 2.0, -3.6), near: { p: [36.6, TOWN_Y, -3.6], r: 1.0 } });
  orb('smokva', [41.5, TOWN_Y + 2.0, 5.5], 7, ['smokva'], 'close', TOWN_Y + 3.4, {
    at: V(36.6, TOWN_Y + 2.4, 1.6), near: { p: [36.6, TOWN_Y, 1.6], r: 1.0 },
    view: { from: [32.5, 4.4, -1.5], to: [32.5, 4.4, 6.5], look: [41.5, TOWN_Y + 2.0, 5.5] },
  });
  orb('med', [38.4, TOWN_Y + 1.2, 3.95], 1.8, ['med'], 'close', TOWN_Y + 1.9, { at: V(36.6, TOWN_Y + 2.0, 4.0), near: { p: [36.6, TOWN_Y, 4.0], r: 1.0 } });
  orb('lokum', [38.5, TOWN_Y + 1.07, 5.2], 1.4, ['lokum'], 'close', TOWN_Y + 1.8, { at: V(36.6, TOWN_Y + 2.0, 6.4), near: { p: [36.6, TOWN_Y, 6.4], r: 1.0 } });
  orb('tepsija', [34.5, TOWN_Y + 0.66, 13], 2.2, ['tepsija'], 'close', TOWN_Y + 1.4, { at: V(32.4, TOWN_Y + 1.8, 13.0), near: { p: [32.4, TOWN_Y, 13.0], r: 0.9 } });
  orb('dzezva', [34.2, TOWN_Y + 0.85, 12.85], 1.2, ['dzezva'], 'close', TOWN_Y + 1.5, { at: V(34.5, TOWN_Y + 1.8, 14.9), near: { p: [34.5, TOWN_Y, 14.9], r: 1.0 } });
  orb('fildzan', [34.8, TOWN_Y + 0.75, 13.1], 1.2, ['fildzan'], 'close', TOWN_Y + 1.5, { at: V(36.6, TOWN_Y + 1.8, 13.0), near: { p: [36.6, TOWN_Y, 13.0], r: 0.9 } });

  // Zone 4: the terrace (10)
  orb('terasa', [-19, TER_Y, -19], 16, ['terasa'], 'combo', TER_Y + 0.8, {
    at: V(-14.4, TER_Y + 2.2, -9.5), near: { p: [-14.4, TER_Y, -9.5], r: 1.4 },
    view: { from: [-2, 6, -2], to: [-2, 7, -30], look: [-19, TER_Y + 1, -19] },
  });
  orb('odrina', [-19.6, TER_Y + 2.6, -19], 12, ['odrina'], 'close', TER_Y + 5.0, {
    at: V(-13.6, TER_Y + 2.2, -21.2), near: { p: [-13.6, TER_Y, -21.2], r: 1.3 },
    view: { from: [-4, 5, -12], to: [-4, 5, -26], look: [-19.6, TER_Y + 2.4, -19] },
  });
  orb('loza', [-19.6, TER_Y + 3.8, -19], 12, ['loza'], 'close', TER_Y + 5.5, {
    near: { p: [-19.6, TER_Y + 4.2, -19], r: 2.6 },
    view: { from: [-6, 9.5, -8], to: [-6, 10, -30], look: [-19.6, TER_Y + 3.6, -19] },
  });
  orb('grozd', [-21.2, TER_Y + 3.0, -21.4], 3.0, ['grozd'], 'close', TER_Y + 1.9, {
    at: V(-19.4, TER_Y + 1.9, -23.4), near: { p: [-19.4, TER_Y, -23.4], r: 1.3 },
    view: { from: [-18.2, TER_Y + 2.0, -18.4], to: [-17.6, TER_Y + 2.0, -23.6], look: [-21.2, TER_Y + 2.9, -21.4] },
  });
  orb('sto', [-16.8, TER_Y + 0.7, -25], 2.6, ['sto'], 'close', TER_Y + 1.5, { at: V(-14.4, TER_Y + 2.0, -25.6), near: { p: [-14.4, TER_Y, -25.6], r: 1.3 } });
  orb('tanjir', [-16.8, TER_Y + 0.86, -17], 2.0, ['tanjir'], 'close', TER_Y + 1.6, { view: { from: [-14.2, TER_Y + 2.0, -15.4], to: [-14.2, TER_Y + 2.0, -18.6], look: [-16.8, TER_Y + 0.86, -17] }, at: V(-14.4, TER_Y + 2.0, -17.0), near: { p: [-14.4, TER_Y, -17.0], r: 1.3 } });
  orb('riba', [-21.6, TER_Y + 0.92, -21.5], 1.6, ['riba'], 'close', TER_Y + 1.7, { view: { from: [-19.2, TER_Y + 1.9, -20.0], to: [-23.6, TER_Y + 1.9, -20.0], look: [-21.6, TER_Y + 0.9, -21.5] }, at: V(-21.6, TER_Y + 2.0, -19.9), near: { p: [-21.6, TER_Y, -19.9], r: 1.2 } });
  orb('limun', [-21.4, TER_Y + 0.9, -13], 1.4, ['limun'], 'close', TER_Y + 1.7, { at: V(-21.6, TER_Y + 2.0, -11.5), near: { p: [-21.6, TER_Y, -11.5], r: 1.2 } });
  orb('rostilj', [-24.6, TER_Y + 1.0, -8.6], 2.4, ['rostilj'], 'close', TER_Y + 2.0, { at: V(-22.8, TER_Y + 2.2, -8.6), near: { p: [-22.8, TER_Y, -8.6], r: 1.0 } });
  orb('konobarica', [-19.2, TER_Y + 1.0, -15.2], 2.6, ['konobarica'], 'close', TER_Y + 2.2, { view: { from: [-13.8, TER_Y + 1.8, -12.6], to: [-13.8, TER_Y + 1.8, -17.4], look: [-19.2, TER_Y + 1.1, -15.2] }, at: V(-17.4, TER_Y + 2.4, -14.2), near: { p: [-17.4, TER_Y, -14.2], r: 1.3 } });

  // Zone 5: the mills (9)
  orb('jaz', [16.5, TOWN_Y + 0.6, 34], 16, ['jaz'], 'combo', TOWN_Y + 1.6, {
    at: V(16.5, TOWN_Y + 2.8, 21), near: { p: [16.5, TOWN_Y + 0.6, 20], r: 3.0 },
    view: { from: [24, 6, 14], to: [26, 6, 22], look: [16.5, TOWN_Y + 0.6, 34] },
  });
  orb('mlin', [16.5, TOWN_Y + 2.4, 30], 7, ['mlin'], 'close', TOWN_Y + 5.6);
  orb('mlinar', [22.6, TOWN_Y + 1.0, 30.2], 2.6, ['mlinar'], 'close', TOWN_Y + 2.2, { view: { from: [26.6, TOWN_Y + 2.0, 28.0], to: [26.6, TOWN_Y + 2.0, 31.2], look: [22.6, TOWN_Y + 1.0, 30.2] }, at: V(24.0, TOWN_Y + 2.4, 30.0), near: { p: [24.0, TOWN_Y, 30.0], r: 1.2 } });
  orb('zrvanj', [20.1, TOWN_Y + 0.85, 27.9], 2.0, ['zrvanj'], 'close', TOWN_Y + 2.0, { view: { from: [23.2, TOWN_Y + 1.6, 25.6], to: [23.6, TOWN_Y + 1.6, 28.6], look: [20.1, TOWN_Y + 0.85, 27.9] }, at: V(21.6, TOWN_Y + 2.2, 26.8), near: { p: [21.6, TOWN_Y, 26.8], r: 1.0 } });
  orb('brasno', [21.4, TOWN_Y + 0.55, 36.0], 2.0, ['brasno'], 'close', TOWN_Y + 1.4, { at: V(22.8, TOWN_Y + 1.8, 36.8), near: { p: [22.8, TOWN_Y, 36.8], r: 1.0 } });
  orb('vreca', [21.0, TOWN_Y + 0.4, 32.5], 2.0, ['vreca'], 'close', TOWN_Y + 1.3, { at: V(22.4, TOWN_Y + 1.8, 33.2), near: { p: [22.4, TOWN_Y, 33.2], r: 1.0 } });
  orb('stupa', [16.5, TOWN_Y + 2.0, 44.5], 6, ['stupa'], 'close', TOWN_Y + 4.4);
  orb('vuna', [21.0, TOWN_Y + 0.5, 44.4], 2.4, ['vuna'], 'close', TOWN_Y + 1.6, { at: V(23.2, TOWN_Y + 1.8, 44.2), near: { p: [23.2, TOWN_Y, 44.2], r: 1.3 } });
  orb('magarac', [25.4, TOWN_Y + 1.1, 34], 3.0, ['magarac'], 'close', TOWN_Y + 2.4, { at: V(27.4, TOWN_Y + 2.4, 33.4), near: { p: [27.4, TOWN_Y, 33.4], r: 1.3 } });

  // Zone 6: the Velagić house and the bridge (9)
  orb('ograda', [VX1, TOWN_Y + 1.5, 43], 20, ['ograda'], 'combo', TOWN_Y + 3.0, {
    at: V(VX1 + 1.6, TOWN_Y + 2.4, 36), near: { p: [VX1 + 1.6, TOWN_Y, 36], r: 1.4 }, view: { from: [-8, 7, 30], to: [-8, 7, 56], look: [VX1 - 6, TOWN_Y + 1.5, 43] },
  });
  orb('kapija', [VX1, TOWN_Y + 1.8, 43], 4.0, ['kapija'], 'close', TOWN_Y + 4.8, { near: { p: [VX1 + 2.6, TOWN_Y, 43], r: 2.6 } });
  orb('avlija', [-33, TOWN_Y + 0.1, 41], 16, ['avlija'], 'combo', TOWN_Y + 0.8, {
    at: V(-26, TOWN_Y + 2.2, 38), near: { p: [-26, TOWN_Y, 38], r: 3.0 },
    view: { from: [-22, 12, 32], to: [-24, 13, 40], look: [-33, TOWN_Y, 44] },
  });
  orb('ploce', [-36, TOWN_Y + 7.5, 50.5], 12, ['ploce'], 'close', TOWN_Y + 9.6, { view: { from: [-20, 15, 40], to: [-24, 16, 58], look: [-36, TOWN_Y + 7.2, 50.5] } });
  orb('dimnjak', [-32.5, TOWN_Y + 8.6, 51.5], 2.6, ['dimnjak'], 'close', TOWN_Y + 10.6);
  orb('bunar', [-29.5, TOWN_Y + 1.0, 42], 2.6, ['bunar'], 'close', TOWN_Y + 2.8, { near: { p: [-27.4, TOWN_Y, 43.4], r: 2.2 } });
  orb('cempres', [-16.5, TOWN_Y + 4.5, 30.5], 9, ['cempres'], 'close', TOWN_Y + 9.6);
  orb('dud', [-25.5, TOWN_Y + 4.2, 51], 7, ['dud'], 'close', TOWN_Y + 6.8);
  orb('most', [0, BRIDGE_Y - 1, MZ], 26, ['most'], 'combo', BRIDGE_Y + 1.4, {
    at: V(0, BRIDGE_Y + 2.6, MZ), near: { p: [0, BRIDGE_Y + 0.3, MZ], r: 3.0 },
    view: { from: [-14, 6, MZ + 18], to: [14, 6, MZ + 18], look: [0, BRIDGE_Y - 1, MZ] },
    wideView: { from: [-24, 16, MZ + 34], to: [24, 16, MZ + 34], look: [0, 3, MZ], lookTo: [0, 3, MZ] },
  });

  // Zone 7: the karst and Stjepan grad (8 + the last word)
  orb('staza', [-84, rampY(-80) + 1, -80], 40, ['staza'], 'combo', rampY(-37) + 1, {
    at: V(-67, rampY(-37) + 2.6, -37), near: { p: [-67, rampY(-37), -37], r: 3.5 },
    view: { from: [-70, 30, 6], to: [-96, 40, -6], look: [-84, rampY(-80), -80] },
  });
  orb('kamenjar', [34, CLIFF_Y + 0.5, -70], 14, ['kamenjar'], 'combo', CLIFF_Y + 1.6, {
    at: V(40, CLIFF_Y + 3.0, -74),
    view: { from: [36, CLIFF_Y + 12, -48], to: [26, CLIFF_Y + 12, -50], look: [34, CLIFF_Y, -70] },
    wideView: { from: [-50, 40, 10], to: [-30, 50, 0], look: [-84, 30, -80], lookTo: [-60, 46, -100] },
  });
  orb('zalfija', [23.8, CLIFF_Y + 0.8, -63.3], 2.6, ['zalfija'], 'close', CLIFF_Y + 1.6, { near: { p: [23.8, CLIFF_Y, -60.8], r: 2.2 } });
  orb('smilje', [37, CLIFF_Y + 0.5, -64.5], 2.4, ['smilje'], 'close', CLIFF_Y + 1.4, { near: { p: [37, CLIFF_Y, -61.8], r: 2.2 } });
  orb('kornjaca', [30, CLIFF_Y + 0.3, -66], 2.2, ['kornjaca'], 'close', CLIFF_Y + 1.2, { near: { p: [30, CLIFF_Y, -62.6], r: 2.6 } });
  orb('sokol', [LEDGE.x + 0.6, LEDGE.y + 0.5, LEDGE.z + 0.4], 1.8, ['sokol'], 'close', LEDGE.y + 1.5, {
    near: { p: [LEDGE.x - 1.2, LEDGE.y, LEDGE.z + 0.2], r: 1.4 },
    view: { from: [LEDGE.x - 5, LEDGE.y + 1.6, LEDGE.z + 6], to: [LEDGE.x + 4, LEDGE.y + 1.6, LEDGE.z + 6], look: [LEDGE.x + 0.4, LEDGE.y + 0.5, LEDGE.z + 0.4] },
  });
  orb('lasta', [NEST.x, NEST.y + 0.7, NEST.z + 0.3], 5, ['lasta'], 'close', NEST.y + 3.0, {
    at: V(NEST.x, NEST.y + 3.2, NEST.z + 0.6), near: { p: [NEST.x, NEST.y + 1.45, NEST.z + 0.2], r: 2.6 },
    view: { from: [NEST.x - 7, NEST.y + 0.5, NEST.z + 9], to: [NEST.x + 5, NEST.y + 0.5, NEST.z + 9], look: [NEST.x, NEST.y + 0.9, NEST.z + 0.9] },
  });
  orb('kula', [12, CLIFF_Y + 4.5, -55.5], 10, ['kula'], 'close', CLIFF_Y + 10.4);
  // the last word: the fortress itself
  orb('tvrdjava', [-22, CLIFF_Y + 5, -90], 34, ['tvrdjava'], 'combo', CLIFF_Y + 1.0, {
    stage: 2, at: V(-12, CLIFF_Y + 2.6, -62), near: { p: [-12, CLIFF_Y, -62], r: 5.0 },
    view: { from: [14, CLIFF_Y + 14, -50], to: [-10, CLIFF_Y + 16, -48], look: [-22, CLIFF_Y + 5, -90] },
    wideView: { from: [30, CLIFF_Y + 26, -30], to: [-40, CLIFF_Y + 26, -30], look: [-22, CLIFF_Y + 4, -90], lookTo: [-22, CLIFF_Y + 4, -90] },
  });

  for (const o of orbs) for (const t of o.tags) tag(t).source = o.focus.clone();
  tag('sky').source = sunPos.clone();
  tag('sun').source = sunPos.clone();

  b.finish(scene);

  return {
    colliders: b.colliders,
    orbs,
    people,
    animals: [],
    clouds,
    smoke,
    pigeons,
    // perched on the parapet of the little footbridge, looking up the pool to the cave and the Tekija
    start: V(0, TOWN_Y + 0.96, -5.35),
    fleur: V(-22, CLIFF_Y + 24, -90),
    sunPos,
    movers: [],
    boat: { g: boatG, home: V(-7.5, 0.12, -31.5) },
    fish,
    birds,
    swallows,
    hammers,
    tortoise: { g: tortoise, home: V(30, CLIFF_Y + 0.02, -66) },
  };
}
