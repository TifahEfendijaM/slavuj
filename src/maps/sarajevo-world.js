// Old Sarajevo in autumn (Baščaršija, Miljacka, Vijećnica, Morića han, Gazi Husrev-beg,
// Ferhadija, Cathedral, Mahala hill, Žuta tabija, Vratnik wall, South bank and Trebević).
// Axes: +x east, -x west, -z north, +z south, +y up. Sebilj at (0, TOWN_Y, 0).
import * as THREE from 'three';
import S from '../settings.js';
import { Builder, tag, PAT, rng, shared, paintGeo, washMat, addHull } from '../paper.js';

export const TOWN_Y = 4.0;
export const SUN_SARAJEVO = new THREE.Vector3(-0.93, 0.21, 0.30).normalize();

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ'), _p = new THREE.Vector3(), _s = new THREE.Vector3();
function mat4(x, y, z, ry = 0, rx = 0, rz = 0, s = 1) {
  _e.set(rx, ry, rz); _q.setFromEuler(_e); _p.set(x, y, z);
  if (Array.isArray(s)) _s.set(s[0], s[1], s[2]); else _s.set(s, s, s);
  return new THREE.Matrix4().compose(_p, _q, _s);
}

// Shared unit geometries (reused so Builder caches flat copies and EdgesGeometry)
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 8);
const CYL12 = new THREE.CylinderGeometry(1, 1, 1, 12);
const CYL16 = new THREE.CylinderGeometry(1, 1, 1, 16);
const CONE4 = new THREE.ConeGeometry(1, 1, 4);
const CONE8 = new THREE.ConeGeometry(1, 1, 8);
const ICO0 = new THREE.IcosahedronGeometry(1, 0);
const ICO = new THREE.IcosahedronGeometry(1, 1);
const ICO2 = new THREE.IcosahedronGeometry(1, 2);
const DODE = new THREE.DodecahedronGeometry(1, 0);
const HEMI = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
const TAPER = new THREE.CylinderGeometry(0.68, 1, 1, 7);
const POPLAR = new THREE.SphereGeometry(1, 9, 8);
const SPHERE = new THREE.SphereGeometry(1, 10, 8);

function roofGeo(w, d, rh, rl, open = false) {
  const hw = w / 2, hd = d / 2, hr = rl / 2, pos = [], uv = [];
  const sl = Math.hypot(hw, rh), hl = Math.hypot(hd - hr, rh);
  const tri = (a, b, c, ua, ub, uc) => { pos.push(...a, ...b, ...c); uv.push(...ua, ...ub, ...uc); };
  const quad = (a, b, c, d2, ua, ub, uc, ud) => { tri(a, b, c, ua, ub, uc); tri(a, c, d2, ua, uc, ud); };
  quad([hw, 0, -hd], [hw, 0, hd], [0, rh, hr], [0, rh, -hr], [0, 0], [d, 0], [hd + hr, sl], [hd - hr, sl]);
  quad([-hw, 0, hd], [-hw, 0, -hd], [0, rh, -hr], [0, rh, hr], [0, 0], [d, 0], [hd + hr, sl], [hd - hr, sl]);
  if (!open) {
    tri([-hw, 0, -hd], [hw, 0, -hd], [0, rh, -hr], [0, 0], [w, 0], [hw, hl]);
    tri([hw, 0, hd], [-hw, 0, hd], [0, rh, hr], [0, 0], [w, 0], [hw, hl]);
  }
  quad([-hw, 0, -hd], [-hw, 0, hd], [hw, 0, hd], [hw, 0, -hd], [0, 0], [0, 0], [0, 0], [0, 0]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

// Shop sign canvas: shows an ink picture icon while unpainted, and switches to Bosnian text once learned
function makeSignMesh(text, iconKind, w, h) {
  const mk = (drawFn) => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 96;
    const g = c.getContext('2d');
    g.fillStyle = '#efe5cf'; g.fillRect(0, 0, 256, 96);
    g.strokeStyle = '#3b352f'; g.lineWidth = 6; g.strokeRect(5, 5, 246, 86);
    drawFn(g);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
  };
  const iconM = mk((g) => {
    g.strokeStyle = '#3b352f'; g.fillStyle = '#5c4a38'; g.lineWidth = 5; g.lineCap = 'round';
    if (iconKind === 'bread') {
      g.beginPath(); g.ellipse(128, 52, 46, 26, 0, 0, Math.PI * 2); g.stroke();
      for (let x = 96; x <= 160; x += 16) { g.beginPath(); g.moveTo(x - 10, 34); g.lineTo(x + 10, 70); g.stroke(); }
      for (let x = 96; x <= 160; x += 16) { g.beginPath(); g.moveTo(x + 10, 34); g.lineTo(x - 10, 70); g.stroke(); }
    } else if (iconKind === 'sweet') {
      g.beginPath(); g.moveTo(128, 22); g.lineTo(176, 48); g.lineTo(128, 74); g.lineTo(80, 48); g.closePath(); g.stroke();
      g.beginPath(); g.moveTo(128, 34); g.lineTo(154, 48); g.lineTo(128, 62); g.lineTo(102, 48); g.closePath(); g.stroke();
    } else if (iconKind === 'grill') {
      for (let i = -2; i <= 2; i++) { g.beginPath(); g.roundRect(120 + i * 22, 34, 14, 34, 6); g.stroke(); }
      g.beginPath(); g.moveTo(74, 24); g.quadraticCurveTo(84, 14, 94, 24); g.moveTo(124, 22); g.quadraticCurveTo(134, 12, 144, 22); g.stroke();
    } else {
      // coffee cup + pot silhouette
      g.beginPath(); g.moveTo(92, 68); g.lineTo(100, 34); g.lineTo(132, 34); g.lineTo(140, 68); g.closePath(); g.stroke();
      g.beginPath(); g.moveTo(132, 42); g.lineTo(172, 26); g.stroke();
    }
  });
  const textM = mk((g) => {
    g.fillStyle = '#3b352f'; g.font = 'bold 34px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 128, 50);
  });
  textM.visible = false;
  const grp = new THREE.Group(); grp.add(iconM, textM);
  return { grp, iconM, textM };
}

// Analytical ground height helper (also used by falling leaves)
export function sarajevoGroundY(x, z) {
  if (z >= 40 && z <= 62) return 0;
  // Žuta tabija terrace (ENE)
  if (Math.hypot((x - 88) / 16, (z + 54) / 14) < 1.05) return 30.0;
  // South bank Trebević slope
  if (z > 88) return TOWN_Y + Math.min(78, (z - 88) * 0.62);
  // Mahala hill to the north (z < -19)
  if (z < -19) {
    if (z > -44) return 8.5;
    if (z > -68) return 14.5;
    if (z > -94) return 21.0;
    return 24.0 + Math.min(30, (-94 - z) * 0.45);
  }
  return TOWN_Y;
}

// Closed anticlockwise one-way tram loop around Old Sarajevo (east on quay, round Vijećnica, west on back street)
const TRAM_LOOP_PTS = [
  [-112, 35.5], [-70, 35.5], [-20, 35.5], [12, 35.5], [46, 35.5], [70, 35.5],
  [82, 33.0], [86, 25.0], [82, 14.0], [72, 2.0], [56, -9.0], [34, -14.5],
  [4, -15.0], [-36, -15.0], [-78, -15.0], [-112, -15.0],
  [-120, -10.0], [-122, 10.0], [-120, 30.0],
].map(([x, z]) => V(x, TOWN_Y + 0.14, z));

export function buildSarajevoWorld(scene) {
  const b = new Builder(), R = rng(107);
  const pick = (a) => a[Math.floor(R() * a.length)], rr = (lo, hi) => lo + R() * (hi - lo);
  const A = (geo, x, y, z, o, ry = 0, rx = 0, rz = 0, s = 1) => b.add(geo, mat4(x, y, z, ry, rx, rz, s), o);
  const box = (w, h, d, x, y, z, o, ry = 0, rx = 0, rz = 0) => A(BOX, x, y, z, o, ry, rx, rz, [w, h, d]);
  const slab = (x0, x1, z0, z1, o, y = TOWN_Y + 0.04, h = 0.08) => box(x1 - x0, h, z1 - z0, (x0 + x1) / 2, y, (z0 + z1) / 2, o);

  // Tune autumn sunset shader uniforms for Sarajevo (per page load, never affects Mostar)
  shared.uSunDir.value.copy(SUN_SARAJEVO);
  shared.uWaterDir.value.set(-1, 0);          // Miljacka flows west (-x)
  shared.uSunShadow.value.set(0.64, 0.54, 0.74);
  shared.uSunGlow.value.set(1.0, 0.64, 0.24);
  shared.uSunTint.value.set(1.08, 0.93, 0.79);
  shared.uSkyGlow.value.set(1.0, 0.84, 0.46);

  const orbs = [], clouds = [], people = [], animals = [], smoke = [], leafEmitters = [], signs = [];
  const orb = (id, focus, size, tags, shot, top, extra = {}) => orbs.push({
    id, focus: V(...focus), size, tags, shot,
    at: V(focus[0], top + S.orb.hoverHeight, focus[2]), stage: 1, ...extra,
  });

  // Autumn palettes
  const LIME = ['#f3efe4', '#e5dfd0'];
  const WOOD = ['#4d3424', '#382518'];
  const TILE_C = [['#b85732', '#924124'], ['#c2653b', '#9c4b2b'], ['#a84d2c', '#82381f']];
  const SHINGLE = ['#6f665b', '#564f46'];
  const AH_WALLS = [['#efe2c6', '#dfc89e'], ['#ead1b8', '#d7b494'], ['#e8d49c', '#d5ba74'], ['#e6c7bf', '#d1a89d']];
  const STONE_Y = ['#d8cbb0', '#b89f78'];
  const STONE_G = ['#c4bfb6', '#9e9990'];
  const POPLAR_C = [['#e8b83a', '#d19222'], ['#e4ad34', '#c9881c'], ['#ecc44a', '#d69d2a']];
  const MAPLE_C = [['#d65524', '#ad3616'], ['#df6f26', '#b84818'], ['#c74322', '#962c14']];
  const BEECH_C = [['#c46a2b', '#96491c'], ['#b85826', '#8a3c18'], ['#d28632', '#a85f1e'], ['#8c4c26', '#663518']];
  const FIR_C = ['#2f4a3a', '#1f3628'];
  const LEAF_HEX = ['#e5b53c', '#d88a2e', '#c95c28', '#b84b26', '#e6c656'];

  // ==================== 1. SKY, SUN & CLOUDS ====================
  tag('sky').side = THREE.BackSide; tag('sky').mode = 'one'; tag('sky').radius = 1300; tag('sky').dur = 6;
  tag('sun').mode = 'one'; tag('sun').radius = 65; tag('sun').dur = 2.5;
  A(new THREE.SphereGeometry(720, 32, 20), 0, 0, 0, { tag: 'sky', col: '#f6b16a', bleed: '#5b6a9e', pat: PAT.sky, hatch: 0, ink: false, solid: false });
  const sunPos = SUN_SARAJEVO.clone().multiplyScalar(520);
  const sunM = new THREE.Matrix4().lookAt(sunPos, V(0, 20, 0), V(0, 1, 0)).setPosition(sunPos);
  b.add(new THREE.CircleGeometry(32, 36).rotateY(Math.PI), sunM, { tag: 'sun', col: '#ffbd38', bleed: '#f5842a', hatch: 0, ink: false, solid: false });
  {
    const g = new THREE.Group(); g.position.copy(sunPos); g.lookAt(0, 20, 0);
    const inkM = new THREE.MeshBasicMaterial({ color: S.ink.color, side: THREE.DoubleSide });
    for (const r0 of [32, 33]) { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r0 + 0.75, 48), inkM); m.position.z = -0.5; g.add(m); }
    scene.add(g);
  }
  const addCloud = (x, y, z, s) => {
    clouds.push({ c: V(x, y, z), r: 4.0 * s });
    const dr = -rr(14, 34);
    b.object(() => {
      for (const [ox, oy, oz, r] of [[-2.0, 0, 0, 1.4], [-0.6, 0.45, 0.2, 1.9], [1.0, 0.4, -0.2, 2.0], [2.3, 0, 0, 1.4], [0.2, -0.2, 0.5, 1.7]])
        A(ICO, x + ox * s, y + oy * s, z + oz * s, { tag: 'landmarks', col: '#fbf4e8', bleed: '#e8d4bc', hull: true, hatch: 0.4, solid: false, sway: dr }, 0, 0, 0, [r * s, 0.58 * r * s, r * s]);
    });
  };
  for (const [x, y, z, s] of [[-180, 74, -140, 8], [130, 80, -160, 9], [190, 68, 70, 7], [-190, 66, 90, 8], [-40, 84, -220, 9], [40, 78, 210, 8], [-90, 68, 12, 4.5]])
    addCloud(x, y, z, s);

  // ==================== 2. GROUND, MILJACKA, QUAYS & WEIRS ====================
  tag('voda').mode = 'one'; tag('voda').radius = 120; tag('voda').holdRest = 2.6;
  tag('brdo').mode = 'one'; tag('brdo').radius = 140; tag('brdo').holdRest = 2.6;
  tag('planina').mode = 'one'; tag('planina').radius = 240; tag('planina').holdRest = 2.6;
  tag('trg').mode = 'one'; tag('trg').radius = 35; tag('trg').holdRest = 2.2;
  tag('carsija').waveDelay = 2.6; tag('mahala').waveDelay = 2.6; tag('avlija').waveDelay = 2.6;
  tag('kapija').waveDelay = 2.6; tag('jablan').waveDelay = 2.6; tag('lisce').waveDelay = 2.4;
  tag('kupola').waveDelay = 2.6; tag('javor').waveDelay = 2.6; tag('sine').mode = 'one'; tag('sine').radius = 150; tag('sine').holdRest = 2.5;
  tag('bedem').mode = 'one'; tag('bedem').radius = 65; tag('bedem').holdRest = 2.4;
  tag('zicara').mode = 'one'; tag('zicara').radius = 150; tag('zicara').holdRest = 2.4;

  // Base flat town earth (north bank & south bank)
  const QUAY_M = { tag: 'quay', col: '#d2cec4', bleed: '#b4afa4', pat: PAT.blocks, ps: 0.35 };
  const WEST_M = { tag: 'west', col: '#ccc7bd', bleed: '#aba59a', pat: PAT.blocks, ps: 0.4 };
  const SOUTH_M = { tag: 'south', col: '#d0cabf', bleed: '#b2aba0', pat: PAT.blocks, ps: 0.35 };
  const HILL_M = { tag: 'brdo', col: '#7d9254', bleed: '#627642', pat: PAT.grass };

  // North bank flat platform (z: -22..40)
  box(310, 6, 62, -10, TOWN_Y - 3, 9, QUAY_M);
  // South bank flat platform (z: 62..94)
  box(310, 6, 32, -10, TOWN_Y - 3, 78, SOUTH_M);
  // River bed under Miljacka
  box(560, 2, 26, 0, -1.5, 51, { tag: 'quay', col: '#8a867c', bleed: '#6d6960', ink: false });

  // Miljacka water surface (thin closed box y = -0.1..0, water top = 0)
  const WATER_M = { tag: 'voda', col: '#5c6b4b', bleed: '#45543a', pat: PAT.water, hatch: 0, water: true, ink: false };
  box(560, 0.1, 22.8, 0, -0.05, 51, WATER_M);
  // Low weirs across the Miljacka (sloping sills + churning white foam)
  for (const wx of [88, 42, -4, -50, -96]) {
    box(1.1, 0.3, 21.0, wx, -0.08, 51, { tag: 'quay', col: '#9e9a90', bleed: '#7d796f', solid: false });
    for (let i = 0; i < 8; i++) {
      const fz = 42.2 + i * 2.55;
      A(ICO, wx - 0.65, 0.08, fz, { tag: 'voda', col: '#f5f7f2', bleed: '#d8e2d8', hull: true, hatch: 0, solid: false, sway: 10.1 }, 0, 0, 0, [0.42, 0.14, 0.95]);
    }
  }

  // 4 m stone embankments along north (z=40) and south (z=62) edges of Miljacka
  const EMB_M = { tag: 'quay', col: '#bab6ac', bleed: '#969288', pat: PAT.blocks, ps: 0.6, pool: 0.7 };
  box(300, 4.6, 1.3, -10, 1.85, 39.85, EMB_M);
  box(300, 4.6, 1.3, -10, 1.85, 62.15, EMB_M);
  // Low stone parapets along quay edges with openings at Latinska (-54) and Šeher-ćehajina (76)
  for (const [x0, x1] of [[-128, -57.2], [-50.8, 72.8], [79.2, 108]]) {
    box(x1 - x0, 0.72, 0.45, (x0 + x1) / 2, TOWN_Y + 0.36, 39.5, { ...EMB_M, wall: true });
    box(x1 - x0, 0.72, 0.45, (x0 + x1) / 2, TOWN_Y + 0.36, 62.5, { ...EMB_M, wall: true });
  }

  // Quay street paving (north quay Obala Kulina bana & back street Mula Mustafe Bašeskije)
  slab(-126, 98, 30.8, 39.3, { tag: 'quay', col: '#b8b2a6', bleed: '#9a9386', pat: PAT.cobble, ps: 0.8 }, TOWN_Y + 0.04, 0.08);
  slab(-126, 40, -18.5, -11.5, { tag: 'quay', col: '#b8b2a6', bleed: '#9a9386', pat: PAT.cobble, ps: 0.8 }, TOWN_Y + 0.04, 0.08);
  // Wet darker paving patch by Baščaršija tram stop (passing autumn shower)
  slab(-2, 14, -15.5, -11.6, { tag: 'quay', col: '#7c7870', bleed: '#635f58', pat: PAT.cobble, ps: 0.9, solid: false, ink: false }, TOWN_Y + 0.09, 0.02);

  // ==================== 3. TWO HISTORIC STONE BRIDGES ('cuprija') ====================
  function buildStoneBridge(bx, hasOkna, offCenterHump) {
    const BR = { tag: 'cuprija', col: '#cbb082', bleed: '#a88c5e', pat: PAT.blocks, ps: 0.65, pool: 0.8, orb: 'cuprija' };
    const PAR = { tag: 'cuprija', col: '#e5dfd3', bleed: '#cbc3b2', pool: 0.6, wall: true };
    const PIER = { tag: 'cuprija', col: '#a8a49c', bleed: '#848078', pat: PAT.blocks, ps: 0.7 };
    const z0 = 39.2, z1 = 62.8, len = z1 - z0, peakZ = offCenterHump ? 53.5 : 51.0;
    const deckY = (z) => {
      const u = (z - z0) / len;
      const h = Math.sin(u * Math.PI) * 1.75 + (offCenterHump ? Math.sin(u * Math.PI * 2) * -0.22 : 0);
      return TOWN_Y + 0.1 + h;
    };
    b.object(() => {
      // Deck segments (12 smooth segments so walking and landing work cleanly)
      const N = 12;
      for (let i = 0; i < N; i++) {
        const za = z0 + (i / N) * len, zb = z0 + ((i + 1) / N) * len, zm = (za + zb) / 2;
        const ya = deckY(za), yb = deckY(zb), ym = (ya + yb) / 2;
        const dz = zb - za, dy = yb - ya, segL = Math.hypot(dz, dy), pitch = -Math.atan2(dy, dz);
        box(5.0, 0.55, segL + 0.12, bx, ym - 0.25, zm, BR, 0, pitch, 0);
        // Stone parapets on west/east edges of deck
        for (const sx of [-2.35, 2.35])
          box(0.32, 0.95, segL + 0.1, bx + sx, ym + 0.45, zm, PAR, 0, pitch, 0);
      }
      // 3 stone piers with triangular cutwaters upstream (+x)
      for (const pz of [45.0, 51.0, 57.0]) {
        const topY = deckY(pz) - 0.4;
        box(5.2, topY + 0.5, 1.7, bx, (topY - 0.5) / 2, pz, PIER);
        // Upstream cutwater prism (+x side)
        A(CONE4, bx + 3.1, (topY - 0.4) / 2, pz, PIER, Math.PI / 4, 0, 0, [1.2, topY + 0.2, 1.2]);
        // Spandrel wall infill between deck and arches
        box(4.8, 1.3, 4.4, bx, topY - 0.65, pz, BR);
      }
      // 4 arch rings visible on east and west faces
      for (const az of [42.1, 48.0, 54.0, 59.9]) {
        const topY = deckY(az) - 0.5;
        for (const sx of [-2.38, 2.38]) {
          A(new THREE.TorusGeometry(2.1, 0.28, 6, 12, Math.PI), bx + sx, topY - 2.2, az, { ...BR, solid: false }, Math.PI / 2, 0, 0);
        }
      }
      // Signature round relieving openings ("okna") on Latinska ćuprija
      if (hasOkna) {
        for (const oz of [48.0, 54.0]) {
          const oy = deckY(oz) - 1.15;
          for (const sx of [-2.42, 2.42]) {
            A(CYL12, bx + sx, oy, oz, { tag: 'cuprija', col: '#5b564e', bleed: '#403c36', solid: false, ink: true }, 0, 0, Math.PI / 2, [0.55, 0.14, 0.55]);
          }
        }
      }
    });
  }
  buildStoneBridge(-54, true, false);   // Latinska ćuprija
  buildStoneBridge(76, false, true);    // Šeher-ćehajina ćuprija

  // ==================== 4. BAŠČARŠIJA SQUARE & THE SEBILJ ====================
  // Square stone paving ('trg') with lighter diagonal bands
  slab(-18, 20, -11.5, 14, { tag: 'trg', col: '#c9c4ba', bleed: '#b0aa9e', pat: PAT.blocks, ps: 0.45, orb: 'trg' }, TOWN_Y + 0.04, 0.08);
  for (let i = -1; i <= 1; i++) {
    box(30, 0.04, 0.65, i * 8, TOWN_Y + 0.09, 1.5, { tag: 'trg', col: '#dfd9cc', bleed: '#cbc4b4', solid: false, ink: false }, 0.6);
  }

  // The Sebilj at (0, TOWN_Y, 0): STAGE 0 (FIRST WORD!)
  b.object(() => {
    const SB = { tag: 'sebilj', orb: 'sebilj', pool: 0.8 };
    const STEP_M = { ...SB, col: '#b7b1a6', bleed: '#969085', pat: PAT.blocks, ps: 0.8 };
    const PED_M = { ...SB, col: '#ece6da', bleed: '#d6cebe', pat: PAT.blocks, ps: 0.9 };
    const WOD_M = { ...SB, col: '#74452c', bleed: '#54301d', pat: PAT.planks, ps: 4 };
    const COP_M = { ...SB, col: '#639b89', bleed: '#497a6b', hull: true };
    // 3 octagonal stone steps
    A(CYL, 0, TOWN_Y + 0.22, 0, STEP_M, Math.PI / 8, 0, 0, [3.6, 0.34, 3.6]);
    A(CYL, 0, TOWN_Y + 0.47, 0, STEP_M, Math.PI / 8, 0, 0, [3.2, 0.22, 3.2]);
    A(CYL, 0, TOWN_Y + 0.66, 0, STEP_M, Math.PI / 8, 0, 0, [2.85, 0.20, 2.85]);
    // Octagonal pale stone pedestal
    A(CYL, 0, TOWN_Y + 1.38, 0, PED_M, Math.PI / 8, 0, 0, [1.52, 1.24, 1.52]);
    // Two opposite rectangular stone troughs & spouts (NW and SE sides)
    for (const ang of [-Math.PI / 2, Math.PI / 2]) {
      const tx = Math.sin(ang) * 1.92, tz = Math.cos(ang) * 1.92;
      box(1.15, 0.56, 0.72, tx, TOWN_Y + 1.04, tz, PED_M, ang);
      // Water inside Sebilj trough ('voda' tag!)
      box(0.92, 0.08, 0.50, tx, TOWN_Y + 1.33, tz, { tag: 'voda', col: '#5a8f88', bleed: '#3f706a', hatch: 0, solid: false, ink: false }, ang);
      // Metal spout
      A(CYL, Math.sin(ang) * 1.58, TOWN_Y + 1.55, Math.cos(ang) * 1.58, { ...SB, col: '#4a4a48', wall: true }, ang, Math.PI / 2, 0, [0.04, 0.38, 0.04]);
    }
    // Wooden octagonal kiosk body (solid base + arched lattice mušepci above)
    A(CYL, 0, TOWN_Y + 3.55, 0, WOD_M, Math.PI / 8, 0, 0, [1.46, 3.1, 1.46]);
    // Lattice accent bands around the upper wood
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      box(0.75, 1.3, 0.08, Math.sin(a) * 1.40, TOWN_Y + 4.1, Math.cos(a) * 1.40, { ...SB, col: '#402617', bleed: '#2e1a10', solid: false }, a);
    }
    // Broad flared octagonal eave with scalloped wood valance
    A(new THREE.CylinderGeometry(1.5, 2.75, 0.85, 8), 0, TOWN_Y + 5.45, 0, WOD_M, Math.PI / 8);
    // Short octagonal drum + green-patina copper dome + copper finial (wall: true on finial!)
    A(CYL, 0, TOWN_Y + 6.08, 0, { ...SB, col: '#6b4028' }, Math.PI / 8, 0, 0, [1.42, 0.46, 1.42]);
    A(HEMI, 0, TOWN_Y + 6.26, 0, COP_M, 0, 0, 0, [1.42, 1.45, 1.42]);
    A(CONE8, 0, TOWN_Y + 8.05, 0, { ...SB, col: '#b89438', wall: true, edge: 55 }, 0, 0, 0, [0.09, 0.72, 0.09]);
  });

  // Corn cart on the square (cart = 'props' finale; yellow corn cups + scattered kernels = 'kukuruz')
  b.object(() => {
    const CT = { tag: 'props', col: '#6d472c', bleed: '#4f321e', pat: PAT.planks, ps: 3 };
    box(1.5, 0.85, 0.9, 5.2, TOWN_Y + 0.62, 5.2, CT);
    for (const sx of [-0.65, 0.65]) A(CYL12, 5.2 + sx, TOWN_Y + 0.34, 5.65, { tag: 'props', col: '#3a342e', wall: true }, 0, Math.PI / 2, 0, [0.30, 0.08, 0.30]);
    for (let i = 0; i < 6; i++) {
      const cx = 4.65 + (i % 3) * 0.45, cz = 4.95 + Math.floor(i / 3) * 0.42;
      A(CYL, cx, TOWN_Y + 1.15, cz, { tag: 'props', col: '#ece6d8', solid: false }, 0, 0, 0, [0.075, 0.16, 0.075]);
      A(ICO0, cx, TOWN_Y + 1.24, cz, { tag: 'kukuruz', col: '#f2c12e', bleed: '#d69c18', hull: true, solid: false }, 0, 0, 0, [0.07, 0.045, 0.07]);
    }
    // Scattered corn kernels near pigeons & girl
    for (let i = 0; i < 16; i++) {
      const kx = -4.2 + Math.cos(i * 1.9) * (0.4 + (i % 4) * 0.35);
      const kz = 3.6 + Math.sin(i * 2.3) * (0.4 + (i % 3) * 0.4);
      A(ICO0, kx, TOWN_Y + 0.11, kz, { tag: 'kukuruz', col: '#f4c634', bleed: '#d99e1a', solid: false, ink: false }, 0, 0, 0, [0.04, 0.025, 0.04]);
    }
  });

  // ==================== 5. BAZAAR LANES & NAMED SHOPS ====================
  // Bazaar lane paving ('carsija'): all lanes >= 6 m wide!
  const LANE_M = { tag: 'carsija', col: '#bfb1a0', bleed: '#9d8e7c', pat: PAT.cobble, ps: 1.15, orb: 'carsija' };
  slab(8, 42, 13.5, 20.5, LANE_M, TOWN_Y + 0.04, 0.08);       // Kazandžiluk
  slab(-16, 42, 23.0, 29.5, LANE_M, TOWN_Y + 0.04, 0.08);     // Bravadžiluk
  slab(-86, -17.5, 0.5, 7.5, LANE_M, TOWN_Y + 0.04, 0.08);    // Sarači -> meets East/West line
  slab(34, 42, 12.0, 31.0, LANE_M, TOWN_Y + 0.04, 0.08);      // connector to Vijećnica/quay

  // Helper: generic Ottoman dućan shop ('carsija', with ćepenci bench + canopy eave)
  let shopIdx = 0;
  function ducan(x, z, rot, w = 4.2, d = 3.8, o = {}) {
    const lift = ((shopIdx++) % 2) * 0.05;
    const tg = o.tag || 'carsija';
    const tc = pick(TILE_C);
    const W_M = { tag: tg, col: o.wall || LIME[0], bleed: LIME[1], pool: 0.7, orb: o.orb };
    const WD_M = { tag: tg, col: WOOD[0], bleed: WOOD[1], pat: PAT.planks, ps: 4, orb: o.orb };
    const RF_M = { tag: tg, col: tc[0], bleed: tc[1], pat: PAT.roof, ps: 1.5, orb: o.orb };
    b.push(mat4(x, TOWN_Y, z, rot));
    b.object(() => {
      box(w, 0.45, d, 0, 0.225, 0, { tag: tg, col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.9, orb: o.orb });
      box(w, 2.7, d, 0, 1.8, 0, W_M);
      // Dark open shopfront recess
      box(w * 0.78, 2.0, 0.1, 0, 1.5, d / 2 + 0.02, { tag: tg, col: '#3a2a20', solid: false });
      // Folding ćepenci: lower bench leaf + upper canopy leaf
      box(w * 0.86, 0.12, 0.75, 0, 0.65, d / 2 + 0.42, WD_M);
      box(w * 0.92, 0.1, 1.05, 0, 2.75, d / 2 + 0.55, WD_M, 0, 0.18, 0);
      // Steep ćeramida roof with deep eaves
      A(roofGeo(d + 1.4, w + 0.5, 1.5, w + 0.1), 0, 3.15 + lift, 0.15, RF_M, Math.PI / 2);
    });
    b.pop();
  }

  // Generic čaršija shops along Kazandžiluk, Bravadžiluk, Sarači, square west
  for (const [x, z, rot] of [
    [-20, -4, Math.PI / 2], [-20, 10, Math.PI / 2],
    [13, 11.2, 0], [18, 11.2, 0], [28.5, 11.2, 0], [33.5, 11.2, 0],
    [13, 21.8, Math.PI], [24, 21.8, Math.PI], [30, 21.8, Math.PI],
    [8, 31.8, Math.PI], [31, 31.8, Math.PI],
    [-36, 10.0, Math.PI], [-44, 10.0, Math.PI], [-52, 10.0, Math.PI],
    [-64, -2.5, 0], [-72, -2.5, 0],
  ]) ducan(x, z, rot);

  // Coppersmith workshop in Kazandžiluk (at x=23, z=11.5 facing south into Kazandžiluk)
  ducan(23.2, 11.2, 0, 4.8, 3.8, { tag: 'carsija' });
  // Low wooden anvil stump + copper tray being hammered + copper wares ('bakar') along Kazandžiluk
  box(0.55, 0.45, 0.55, 23.2, TOWN_Y + 0.225, 14.3, { tag: 'props', col: '#6d4b2d', bleed: '#4f351e' });
  // Copper wares ('bakar') in two clusters along Kazandžiluk (for close + second shot)
  const BAK_M = { tag: 'bakar', col: '#cf7b48', bleed: '#9c5228', hull: true, orb: 'bakar' };
  const BAK2_M = { tag: 'bakar', col: '#d4a348', bleed: '#a67b26', hull: true, orb: 'bakar' };
  b.object(() => {
    // Tray on coppersmith's stump
    A(CYL12, 23.2, TOWN_Y + 0.48, 14.3, BAK_M, 0, 0, 0, [0.36, 0.04, 0.36]);
    // Workshop display trays, pans, ibrik jugs
    for (let i = 0; i < 5; i++) {
      A(CYL12, 21.4 + i * 0.85, TOWN_Y + 1.05, 13.45, i % 2 ? BAK_M : BAK2_M, Math.PI / 2.2, 0, 0, [0.34, 0.04, 0.34]);
      A(CYL, 21.6 + i * 0.85, TOWN_Y + 0.92, 13.7, BAK_M, 0, 0, 0, [0.11, 0.34, 0.11]);
    }
  });
  // Second cluster of copper wares further east along Kazandžiluk (x = 29..34)
  b.object(() => {
    for (let i = 0; i < 6; i++) {
      const cx = 28.4 + i * 0.95;
      A(CYL12, cx, TOWN_Y + 1.08, 13.45, i % 2 ? BAK2_M : BAK_M, Math.PI / 2.3, 0, 0, [0.36, 0.04, 0.36]);
      A(CYL, cx + 0.15, TOWN_Y + 0.92, 13.72, BAK_M, 0, 0, 0, [0.12, 0.36, 0.12]);
      // Hanging copper plates under opposite shop eave
      A(CYL12, cx, TOWN_Y + 2.35, 19.6, BAK_M, Math.PI / 2, 0, 0, [0.28, 0.03, 0.28]);
    }
  });

  // Named Shop 1: Bakery ('pekara') on south side of Sarači at (-26, 10.0) facing north (PI)
  ducan(-26, 10.0, Math.PI, 4.8, 3.8, { tag: 'pekara', orb: 'pekara', wall: '#f2e6cf' });
  {
    const s = makeSignMesh('PEKARA', 'bread', 2.4, 0.72);
    s.grp.position.set(-26, TOWN_Y + 3.05, 7.62); s.grp.rotation.y = Math.PI; scene.add(s.grp);
    signs.push({ tag: 'pekara', ...s });
  }
  // Golden somun loaves on bakery counter ('somun')
  b.object(() => {
    const SM = { tag: 'somun', col: '#d9a45a', bleed: '#b57e38', hull: true, orb: 'somun' };
    for (let i = 0; i < 6; i++)
      A(SPHERE, -27.2 + i * 0.46, TOWN_Y + 0.80, 7.68, SM, 0, 0, 0, [0.19, 0.065, 0.19]);
  });

  // Named Shop 2: Sweet shop ('slasticarna') on north side of Sarači at (-26, -2.5) facing south (0)
  ducan(-26, -2.5, 0, 4.8, 3.8, { tag: 'slasticarna', orb: 'slasticarna', wall: '#f2dfd8' });
  {
    const s = makeSignMesh('SLASTIČARNA', 'sweet', 2.6, 0.72);
    s.grp.position.set(-26, TOWN_Y + 3.05, -0.12); scene.add(s.grp);
    signs.push({ tag: 'slasticarna', ...s });
  }
  // Diamond-cut baklava tray on sweet shop counter ('baklava')
  b.object(() => {
    box(1.15, 0.08, 0.68, -26, TOWN_Y + 0.78, -0.15, { tag: 'baklava', col: '#9e8f78', bleed: '#7a6c58', orb: 'baklava' });
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++)
      box(0.18, 0.08, 0.18, -26.38 + c * 0.25, TOWN_Y + 0.86, -0.28 + r * 0.26, { tag: 'baklava', col: '#d89b32', bleed: '#b5721a', solid: false }, Math.PI / 4);
  });

  // Named Shop 3: Ćevabdžinica on south side of Bravadžiluk at (16, 31.8) facing north (PI)
  ducan(16, 31.8, Math.PI, 4.8, 3.8, { tag: 'carsija' });
  {
    const s = makeSignMesh('ĆEVABDŽINICA', 'grill', 2.7, 0.72);
    s.grp.position.set(16, TOWN_Y + 3.05, 29.42); s.grp.rotation.y = Math.PI; scene.add(s.grp);
    signs.push({ tag: 'cevapi', ...s });
  }
  // Grill + ćevapi rolls on grill & plates ('cevapi') + thin grill smoke (smoke #1)
  b.object(() => {
    box(1.4, 0.16, 0.7, 16, TOWN_Y + 0.80, 29.52, { tag: 'props', col: '#3a3836', bleed: '#242220' });
    const CV = { tag: 'cevapi', col: '#7c3f26', bleed: '#542614', hull: true, orb: 'cevapi' };
    for (let i = 0; i < 10; i++)
      A(CYL, 15.48 + (i % 5) * 0.22, TOWN_Y + 0.92, 29.38 + Math.floor(i / 5) * 0.24, CV, 0, Math.PI / 2, 0.2, [0.036, 0.16, 0.036]);
    // Plate beside grill with somun + ćevapi
    A(CYL12, 17.15, TOWN_Y + 0.78, 29.52, { tag: 'props', col: '#f2efe8', solid: false }, 0, 0, 0, [0.24, 0.03, 0.24]);
    for (let i = 0; i < 5; i++)
      A(CYL, 17.0 + i * 0.075, TOWN_Y + 0.84, 29.52, CV, 0, Math.PI / 2, 0, [0.028, 0.14, 0.028]);
  });
  smoke.push({ x: 16, y: TOWN_Y + 4.4, z: 31.5 });

  // Named Shop 4: Buregdžinica on south side of Bravadžiluk at (23.5, 31.8) facing north (PI)
  ducan(23.5, 31.8, Math.PI, 4.6, 3.8, { tag: 'carsija' });
  // Round copper tray (tepsija) of spiral burek ('burek')
  b.object(() => {
    A(CYL12, 23.5, TOWN_Y + 0.79, 29.52, { tag: 'burek', col: '#b87644', bleed: '#8c5328', orb: 'burek' }, 0, 0, 0, [0.46, 0.06, 0.46]);
    // Spiral rings of golden flaky burek pastry
    for (const r of [0.36, 0.24, 0.12])
      A(new THREE.TorusGeometry(r, 0.055, 6, 14), 23.5, TOWN_Y + 0.86, 29.52, { tag: 'burek', col: '#d89b42', bleed: '#b07222', hull: true, solid: false }, 0, Math.PI / 2, 0);
  });

  // ==================== 6. MORIĆA HAN & KAHVANA ====================
  // Morića han ('han'): x = -56..-32, z = -11.5..0.5, open courtyard inside (-51..-37, -9.5..-1.5)
  b.object(() => {
    const H_W = { tag: 'han', col: LIME[0], bleed: LIME[1], pool: 0.7, orb: 'han' };
    const H_S = { tag: 'han', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.65, orb: 'han' };
    const H_R = { tag: 'han', col: '#b55632', bleed: '#8d3e22', pat: PAT.roof, ps: 1.4, orb: 'han' };
    const H_WD = { tag: 'han', col: WOOD[0], bleed: WOOD[1], pat: PAT.planks, ps: 3, orb: 'han' };
    // Cobbled courtyard floor
    slab(-52, -36, -10.2, -0.5, { tag: 'han', col: '#b8afa2', bleed: '#988e80', pat: PAT.cobble, ps: 1.2, orb: 'han' }, TOWN_Y + 0.05, 0.1);
    // North wing, west wing, east wing, south wing with central gate opening (x = -46..-42)
    const wings = [
      [-44, -10.8, 24, 3.0, 0],
      [-54.5, -5.5, 3.0, 11.5, 0],
      [-33.5, -5.5, 3.0, 11.5, 0],
      [-50.5, -0.3, 9.0, 2.6, 0],
      [-37.5, -0.3, 9.0, 2.6, 0],
    ];
    for (const [wx, wz, ww, wd] of wings) {
      box(ww, 3.0, wd, wx, TOWN_Y + 1.5, wz, H_S);
      box(ww + 0.4, 2.8, wd + 0.4, wx, TOWN_Y + 4.4, wz, H_W);
      A(roofGeo(Math.min(ww, wd) + 1.2, Math.max(ww, wd) + 1.2, 1.8, Math.max(ww, wd) - Math.min(ww, wd) + 0.6), wx, TOWN_Y + 5.8, wz, H_R, ww > wd ? Math.PI / 2 : 0);
    }
    // Over-gate upper bridge on south wing
    box(4.6, 2.8, 3.0, -44, TOWN_Y + 4.4, -0.3, H_W);
    // Dark oak gallery posts around the yard (open span at x=-44 above the kahvana counter & sign)
    for (const px of [-51, -47.5, -40.5, -37]) {
      A(CYL, px, TOWN_Y + 1.5, -9.0, { ...H_WD, wall: true }, 0, 0, 0, [0.11, 3.0, 0.11]);
    }
  });

  // Kahvana inside Morića han courtyard: counter + 3 low tables + stools ('kahvana'), džezvas ('dzezva'), coffee sets ('kahva')
  const KAH_TABLES = [[-47.5, -5.5], [-43.8, -6.2], [-40.2, -5.0]];
  b.object(() => {
    const KV = { tag: 'kahvana', col: '#69432a', bleed: '#4c2f1c', pat: PAT.planks, ps: 4, orb: 'kahvana' };
    // Counter along north gallery edge
    box(5.6, 1.0, 0.9, -44, TOWN_Y + 0.58, -8.8, KV);
    // 3 low tables + stools
    for (const [tx, tz] of KAH_TABLES) {
      A(CYL12, tx, TOWN_Y + 0.66, tz, KV, 0, 0, 0, [0.58, 0.08, 0.58]);
      A(CYL, tx, TOWN_Y + 0.34, tz, KV, 0, 0, 0, [0.1, 0.6, 0.1]);
      for (const a of [0, Math.PI]) {
        A(CYL, tx + Math.sin(a) * 0.92, TOWN_Y + 0.28, tz + Math.cos(a) * 0.92, KV, 0, 0, 0, [0.22, 0.44, 0.22]);
      }
    }
  });
  {
    const s = makeSignMesh('KAHVANA', 'coffee', 2.4, 0.7);
    s.grp.position.set(-44, TOWN_Y + 2.68, -8.85); scene.add(s.grp);
    signs.push({ tag: 'kahvana', ...s });
  }
  // Copper džezvas ('dzezva') on each kahvana table (plus waiter's tray has one!)
  for (const [tx, tz] of KAH_TABLES) {
    b.object(() => {
      const DZ = { tag: 'dzezva', col: '#cc7844', bleed: '#9a5226', hull: true, orb: 'dzezva' };
      A(CYL, tx - 0.14, TOWN_Y + 0.80, tz, DZ, 0, 0, 0, [0.065, 0.16, 0.065]);
      box(0.22, 0.024, 0.024, tx - 0.28, TOWN_Y + 0.85, tz, { ...DZ, solid: false }, 0, 0, 0.28);
    });
  }
  // Coffee sets ('kahva': fildžan cups, sugar bowl, lokum): one sub per table for groupPaint!
  for (const [tx, tz] of KAH_TABLES) {
    b.object(() => {
      const KF = { tag: 'kahva', col: '#f7f3ea', bleed: '#ddd5c5', hull: true, orb: 'kahva' };
      // Two handleless fildžan cups + dark coffee inside
      for (const oz of [-0.22, 0.22]) {
        A(CYL, tx + 0.16, TOWN_Y + 0.77, tz + oz, KF, 0, 0, 0, [0.052, 0.085, 0.052]);
        A(CYL, tx + 0.16, TOWN_Y + 0.81, tz + oz, { tag: 'kahva', col: '#3a2214', solid: false, ink: false }, 0, 0, 0, [0.044, 0.02, 0.044]);
      }
      // Sugar cubes + rose rahat-lokum
      box(0.09, 0.06, 0.09, tx + 0.02, TOWN_Y + 0.75, tz + 0.1, { tag: 'kahva', col: '#ffffff', solid: false });
      box(0.09, 0.06, 0.09, tx + 0.02, TOWN_Y + 0.75, tz - 0.12, { tag: 'kahva', col: '#e698a6', bleed: '#c87382', solid: false });
    });
  }

  // ==================== 7. MOSQUES, BRUSA BEZISTAN, ŠADRVAN & SAHAT-KULA ====================
  const LM_S = { tag: 'landmarks', col: '#e7decb', bleed: '#cfc2a6', pat: PAT.blocks, ps: 0.5, pool: 0.7 };
  const LM_W = { tag: 'landmarks', col: '#eee8da', bleed: '#d6cebe', pool: 0.6 };
  const KUP_GREY = { tag: 'kupola', col: '#848f96', bleed: '#68737b', hull: true, orb: 'kupola' };
  const KUP_COP = { tag: 'kupola', col: '#699e8d', bleed: '#4c7c6d', hull: true, orb: 'kupola' };

  // Helper: mosque finial with exact ball count (wall: true: unlandable!)
  function addFinial(x, y, z, balls, tg = 'landmarks') {
    const FM = { tag: tg, col: '#d4ae3c', bleed: '#a68222', wall: true, edge: 50 };
    A(CYL, x, y + 0.55, z, FM, 0, 0, 0, [0.045, 1.1, 0.045]);
    for (let i = 0; i < balls; i++) {
      const r = 0.13 - i * 0.014;
      A(SPHERE, x, y + 0.25 + i * 0.22, z, { ...FM, solid: false }, 0, 0, 0, [r, r, r]);
    }
  }

  // 7A. Baščaršijska (Havadže Duraka) džamija: south of square at (-2, 18.5)
  b.object(() => {
    const mx = -2, mz = 18.5;
    box(9.6, 6.4, 9.6, mx, TOWN_Y + 3.2, mz, LM_W);
    A(CYL, mx, TOWN_Y + 7.2, mz, LM_W, Math.PI / 8, 0, 0, [4.6, 1.8, 4.6]);
    // Main dome ('kupola')
    A(HEMI, mx, TOWN_Y + 8.0, mz, KUP_GREY, 0, 0, 0, [4.3, 3.8, 4.3]);
    addFinial(mx, TOWN_Y + 11.8, mz, 4);
    // NW/N porch with 3 small domes ('kupola')
    box(9.8, 0.35, 3.2, mx, TOWN_Y + 4.0, mz - 6.2, LM_S);
    for (const dx of [-3.1, 0, 3.1]) {
      A(CYL, mx + dx, TOWN_Y + 2.0, mz - 7.5, { ...LM_S, wall: true }, 0, 0, 0, [0.22, 4.0, 0.22]);
      A(HEMI, mx + dx, TOWN_Y + 4.18, mz - 6.2, KUP_GREY, 0, 0, 0, [1.25, 1.2, 1.25]);
    }
    // Minaret (SW corner, 4-ball finial, wall: true on cap/finial)
    const mnx = mx - 5.2, mnz = mz + 3.2;
    A(CYL, mnx, TOWN_Y + 2.5, mnz, LM_S, Math.PI / 8, 0, 0, [1.3, 5.0, 1.3]);
    A(CYL, mnx, TOWN_Y + 12.0, mnz, { ...LM_W, wall: true }, Math.PI / 8, 0, 0, [0.85, 14.5, 0.85]);
    A(CYL, mnx, TOWN_Y + 15.8, mnz, { ...LM_S, wall: true }, Math.PI / 8, 0, 0, [1.35, 0.9, 1.35]);
    A(CONE8, mnx, TOWN_Y + 22.0, mnz, { tag: 'landmarks', col: '#7d8890', bleed: '#5e6870', wall: true, edge: 25 }, 0, 0, 0, [0.95, 5.8, 0.95]);
    addFinial(mnx, TOWN_Y + 24.9, mnz, 4);
  });

  // 7B. Brusa bezistan: (-42, 20), rough stone hall ('landmarks') + 6 green-patina domes ('kupola')
  b.object(() => {
    const bx = -42, bz = 20;
    box(15.6, 5.6, 10.8, bx, TOWN_Y + 2.8, bz, { tag: 'landmarks', col: '#c9bfae', bleed: '#a89d8a', pat: PAT.blocks, ps: 0.65, pool: 0.8 });
    for (const dx of [-4.6, 0, 4.6]) for (const dz of [-2.4, 2.4]) {
      A(HEMI, bx + dx, TOWN_Y + 5.6, bz + dz, KUP_COP, 0, 0, 0, [2.15, 2.1, 2.15]);
    }
  });

  // 7C. Gazi Husrev-begova (Begova) džamija complex: (-68, 22)
  b.object(() => {
    const bx = -68, bz = 23.5;
    // Courtyard pale stone paving & low perimeter wall
    slab(-80, -56, 8.2, 30.2, { tag: 'landmarks', col: '#e2dcd0', bleed: '#cbc4b4', pat: PAT.blocks, ps: 0.45 }, TOWN_Y + 0.05, 0.1);
    box(24, 1.7, 0.55, -68, TOWN_Y + 0.85, 30.0, LM_S);
    box(0.55, 1.7, 21.8, -56.2, TOWN_Y + 0.85, 19.2, LM_S);
    box(0.55, 1.7, 21.8, -79.8, TOWN_Y + 0.85, 19.2, LM_S);
    // North courtyard walls with wide central gate
    box(8.5, 1.7, 0.55, -75.5, TOWN_Y + 0.85, 8.4, LM_S);
    box(8.5, 1.7, 0.55, -60.5, TOWN_Y + 0.85, 8.4, LM_S);

    // Main prayer hall + side tetime + big central dome ('kupola')
    box(13.2, 8.2, 11.4, bx, TOWN_Y + 4.1, bz, LM_S);
    A(CYL, bx, TOWN_Y + 9.2, bz, LM_S, Math.PI / 8, 0, 0, [5.8, 2.2, 5.8]);
    A(HEMI, bx, TOWN_Y + 10.2, bz, KUP_GREY, 0, 0, 0, [5.4, 5.2, 5.4]);
    addFinial(bx, TOWN_Y + 15.4, bz, 5);
    // 5-dome porch facing north into the courtyard
    box(14.0, 0.45, 3.6, bx, TOWN_Y + 5.2, bz - 7.4, LM_S);
    // Plain gold-on-blue geometric portal panel (no invented calligraphy!)
    box(2.2, 1.0, 0.12, bx, TOWN_Y + 3.8, bz - 5.72, { tag: 'landmarks', col: '#2c4c78', bleed: '#1f385c', solid: false });
    box(1.7, 0.55, 0.14, bx, TOWN_Y + 3.8, bz - 5.74, { tag: 'landmarks', col: '#d8b044', solid: false, ink: false });
    for (let i = -2; i <= 2; i++) {
      if (i < 2) A(CYL, bx + i * 3.1 + 1.55, TOWN_Y + 2.6, bz - 8.9, { ...LM_W, wall: true }, 0, 0, 0, [0.28, 5.2, 0.28]);
      A(HEMI, bx + i * 2.75, TOWN_Y + 5.42, bz - 7.4, KUP_GREY, 0, 0, 0, [1.22, 1.25, 1.22]);
    }
    // Tall Begova minaret (west side, 5-ball finial, wall: true!)
    const mnx = bx - 8.2, mnz = bz - 1.5;
    A(CYL, mnx, TOWN_Y + 3.2, mnz, LM_S, Math.PI / 8, 0, 0, [1.55, 6.4, 1.55]);
    A(CYL, mnx, TOWN_Y + 16.5, mnz, { ...LM_W, wall: true }, Math.PI / 8, 0, 0, [1.0, 21.0, 1.0]);
    A(CYL, mnx, TOWN_Y + 21.5, mnz, { ...LM_S, wall: true }, Math.PI / 8, 0, 0, [1.65, 1.0, 1.65]);
    A(CONE8, mnx, TOWN_Y + 30.2, mnz, { tag: 'landmarks', col: '#7d8890', bleed: '#5d6770', wall: true, edge: 25 }, 0, 0, 0, [1.08, 7.2, 1.08]);
    addFinial(mnx, TOWN_Y + 33.8, mnz, 5);

    // Two calm octagonal turbes (east of mosque) + white nišani (calm scenery, finale only, NO orbs!)
    for (const [tx, tz, tr, th] of [[-59.2, 22.5, 2.2, 3.6], [-58.8, 27.0, 1.55, 2.8]]) {
      A(CYL, tx, TOWN_Y + th / 2, tz, { ...LM_S, wall: true }, Math.PI / 8, 0, 0, [tr, th, tr]);
      A(HEMI, tx, TOWN_Y + th, tz, { tag: 'landmarks', col: '#848f96', bleed: '#68737b', hull: true, wall: true }, 0, 0, 0, [tr * 0.94, tr * 0.85, tr * 0.94]);
    }
    for (const [nx, nz] of [[-76.5, 14.5], [-75.0, 15.8], [-77.2, 17.0], [-75.6, 18.2], [-60.5, 16.5], [-59.0, 17.8]]) {
      A(CYL, nx, TOWN_Y + 0.65, nz, { tag: 'landmarks', col: '#f3efe6', wall: true }, 0, 0, 0, [0.11, 1.2, 0.11]);
      A(SPHERE, nx, TOWN_Y + 1.32, nz, { tag: 'landmarks', col: '#f3efe6', solid: false }, 0, 0, 0, [0.16, 0.15, 0.16]);
    }
  });

  // 7D. Šadrvan ('sadrvan') in Begova mosque courtyard at (-67, TOWN_Y + 0.1, 13.0)
  const SAD_POS = { x: -67, y: TOWN_Y + 0.1, z: 13.0 };
  b.object(() => {
    const SD = { tag: 'sadrvan', orb: 'sadrvan', pool: 0.7 };
    const sx = SAD_POS.x, sy = SAD_POS.y, sz = SAD_POS.z;
    // 12-sided white Brač marble basin + central 3-tier cup column
    A(CYL12, sx, sy + 0.52, sz, { ...SD, col: '#f0ece2', bleed: '#d8d2c4' }, 0, 0, 0, [1.8, 0.95, 1.8]);
    A(CYL12, sx, sy + 0.98, sz, { tag: 'sadrvan', col: '#5c9aa0', bleed: '#3d7980', hatch: 0, solid: false, ink: false }, 0, 0, 0, [1.55, 0.06, 1.55]);
    A(CYL, sx, sy + 1.6, sz, { ...SD, col: '#ece7dc' }, 0, 0, 0, [0.24, 1.7, 0.24]);
    A(CYL12, sx, sy + 2.25, sz, { ...SD, col: '#f0ece2' }, 0, 0, 0, [0.85, 0.16, 0.85]);
    // 8 dark wooden posts carrying octagonal lead canopy & dome
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      A(CYL, sx + Math.sin(a) * 2.15, sy + 1.9, sz + Math.cos(a) * 2.15, { ...SD, col: WOOD[0], bleed: WOOD[1], wall: true }, 0, 0, 0, [0.11, 3.8, 0.11]);
    }
    A(CYL, sx, sy + 3.9, sz, { ...SD, col: WOOD[0], bleed: WOOD[1] }, Math.PI / 8, 0, 0, [2.5, 0.35, 2.5]);
    A(HEMI, sx, sy + 4.05, sz, { ...SD, col: '#848f96', bleed: '#68737b', hull: true }, 0, 0, 0, [2.35, 1.9, 2.35]);
  });

  // 7E. Sahat-kula (west of Begova mosque at (-82.5, TOWN_Y, 15.5)), 24 m tall, 3-ball finial, lunar hands reach 12 at sunset!
  const sahatHands = [];
  b.object(() => {
    const sx = -82.5, sz = 15.5;
    box(3.4, 21.0, 3.4, sx, TOWN_Y + 10.5, sz, { tag: 'landmarks', col: '#cbb28a', bleed: '#ab9068', pat: PAT.blocks, ps: 0.55, pool: 0.8 });
    // White limestone bands
    for (const by of [5, 10, 15, 18.5])
      box(3.55, 0.32, 3.55, sx, TOWN_Y + by, sz, { tag: 'landmarks', col: '#ebe4d6', solid: false });
    // 4 dark clock dials with plain gold marks (no invented Arabic script)
    for (const ry of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      b.push(mat4(sx, TOWN_Y + 17.0, sz, ry));
      A(CYL12, 0, 0, 1.72, { tag: 'landmarks', col: '#2d2b2a', bleed: '#1d1c1b', solid: false }, 0, Math.PI / 2, 0, [0.95, 0.08, 0.95]);
      for (let h = 0; h < 12; h++) {
        const a = (h / 12) * Math.PI * 2;
        box(h % 3 === 0 ? 0.09 : 0.05, h % 3 === 0 ? 0.22 : 0.14, 0.04, Math.sin(a) * 0.74, Math.cos(a) * 0.74, 1.77, { tag: 'landmarks', col: '#e2bd4a', solid: false, ink: false }, 0, 0, -a);
      }
      b.pop();
      // Animated hands built on scene so they sweep to 12:00 at sunset in the finale
      const g = new THREE.Group(); g.position.set(sx, TOWN_Y + 17.0, sz); g.rotation.y = ry; scene.add(g);
      const lmMat = washMat('landmarks');
      const mkHand = (len, w, zOff) => {
        const m = new THREE.Mesh(paintGeo(new THREE.BoxGeometry(w, len, 0.04).translate(0, len / 2 - 0.06, 0), { col: '#e8c44e', bleed: '#c2992c', seed: [sx, TOWN_Y + 17, sz], radius: 8, dur: 3, hatch: 0 }), lmMat);
        m.position.z = zOff; g.add(m); return m;
      };
      sahatHands.push({ hour: mkHand(0.46, 0.11, 1.80), min: mkHand(0.72, 0.075, 1.84) });
    }
    A(CONE4, sx, TOWN_Y + 23.0, sz, { tag: 'landmarks', col: '#7c848a', bleed: '#5f676d', wall: true }, Math.PI / 4, 0, 0, [2.8, 4.0, 2.8]);
    addFinial(sx, TOWN_Y + 25.0, sz, 3);
  });

  // ==================== 8. VIJEĆNICA & INAT KUĆA ====================
  // 8A. Vijećnica ('vijecnica') at east end by the river (centre (58, TOWN_Y, 20), triangular Neo-Moorish ablaq stripes!)
  b.object(() => {
    const vx = 58, vz = 20;
    const V_O = { tag: 'vijecnica', col: '#dba43f', bleed: '#be8828', pool: 0.7, orb: 'vijecnica' };
    const V_R = { tag: 'vijecnica', col: '#ad4b35', bleed: '#8a3624', pool: 0.7, orb: 'vijecnica' };
    const V_C = { tag: 'vijecnica', col: '#eee2c6', bleed: '#d6c6a4', orb: 'vijecnica' };
    // Triangular footprint built from a 3-sided prism + striped courses + 3 corner towers + river-facing 5-arch porch
    const triR = 14.5;
    for (let i = 0; i < 12; i++) {
      const y = TOWN_Y + 0.55 + i * 1.1;
      A(new THREE.CylinderGeometry(triR, triR, 1.12, 3), vx, y, vz, i % 2 ? V_R : V_O, Math.PI / 3);
    }
    // Cream stone stepped cornice + crenellations
    A(new THREE.CylinderGeometry(triR + 0.4, triR + 0.4, 0.75, 3), vx, TOWN_Y + 13.8, vz, V_C, Math.PI / 3);
    // 3 corner prismatic towers
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 3 + (i * Math.PI * 2) / 3;
      const cx = vx + Math.sin(a) * (triR - 0.8), cz = vz + Math.cos(a) * (triR - 0.8);
      for (let k = 0; k < 5; k++)
        box(3.8, 1.0, 3.8, cx, TOWN_Y + 11.2 + k * 1.0, cz, k % 2 ? V_R : V_O, a);
      box(4.2, 0.5, 4.2, cx, TOWN_Y + 16.0, cz, V_C, a);
    }
    // Central hexagonal glazed dome lantern
    A(new THREE.CylinderGeometry(4.2, 4.5, 1.8, 6), vx, TOWN_Y + 14.6, vz, { tag: 'vijecnica', col: '#7ca3b0', bleed: '#587d8c', hull: true, orb: 'vijecnica' });
    A(HEMI, vx, TOWN_Y + 15.4, vz, { tag: 'vijecnica', col: '#8eb2be', bleed: '#698d9c', hull: true, orb: 'vijecnica' }, 0, 0, 0, [4.0, 2.4, 4.0]);
    // River-facing 5-arch entrance porch on south side (z ~ 28.5)
    box(11.5, 0.55, 3.6, vx, TOWN_Y + 0.28, vz + 8.8, V_C);
    box(10.8, 1.1, 2.8, vx, TOWN_Y + 4.4, vz + 8.4, V_C);
    for (let i = -2; i <= 2; i++)
      A(CYL, vx + i * 2.1, TOWN_Y + 2.2, vz + 9.4, { ...V_C, wall: true }, 0, 0, 0, [0.22, 3.8, 0.22]);
    // Pseudo-Moorish arched dark windows on the 3 striped facades (south, NW, NE)
    const VW = { tag: 'vijecnica', col: '#3a322d', bleed: '#25201c', solid: false };
    for (let f = 0; f < 3; f++) {
      const ang = (f * Math.PI * 2) / 3; // face normals: +z (0), +120deg, +240deg
      const apothem = triR * 0.5 + 0.08;
      b.push(mat4(vx + Math.sin(ang) * apothem, TOWN_Y, vz + Math.cos(ang) * apothem, ang));
      for (const wy of [7.0, 10.6]) {
        for (const wx of [-6.4, -3.2, 0, 3.2, 6.4]) {
          box(1.35, 2.2, 0.16, wx, wy, 0, VW);
          box(1.55, 0.22, 0.22, wx, wy - 1.15, 0.04, { ...V_C, solid: false });
        }
      }
      b.pop();
    }
  });

  // 8B. Inat kuća ('inat') across Šeher-ćehajina ćuprija on south bank at (76, TOWN_Y, 70)
  b.object(() => {
    const ix = 76, iz = 70;
    const IW = { tag: 'inat', col: LIME[0], bleed: LIME[1], pool: 0.8, orb: 'inat' };
    const ID = { tag: 'inat', col: '#3d4c34', bleed: '#2a3624', pat: PAT.planks, ps: 4, orb: 'inat' };
    const IR = { tag: 'inat', col: '#ba5933', bleed: '#914022', pat: PAT.roof, ps: 1.5, orb: 'inat' };
    // Stone plinth + 2-storey white house + front single-storey wing
    box(10.4, 2.6, 8.2, ix, TOWN_Y + 1.3, iz, { tag: 'inat', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.7, orb: 'inat' });
    box(11.2, 3.0, 8.8, ix, TOWN_Y + 4.1, iz, IW);
    box(6.0, 2.8, 3.2, ix - 1.5, TOWN_Y + 1.4, iz - 5.2, IW);
    // Signature dark green-brown corner doksat bay window facing the bridge/river
    box(3.4, 2.4, 2.6, ix - 4.4, TOWN_Y + 4.0, iz - 3.6, ID);
    // Low-pitched hipped ćeramida roof with deep eaves + round white chimney
    A(roofGeo(10.4, 12.8, 2.5, 4.2), ix, TOWN_Y + 5.6, iz, IR, Math.PI / 2);
    A(roofGeo(4.2, 6.8, 1.3, 3.2), ix - 1.5, TOWN_Y + 2.8, iz - 5.2, IR, Math.PI / 2);
    A(CYL, ix + 2.8, TOWN_Y + 7.6, iz + 1.2, IW, 0, 0, 0, [0.42, 2.6, 0.42]);
  });

  // ==================== 9. BACK STREET, FERHADIJA, CHURCHES, CATHEDRAL & CHESS ====================
  // Tram rails ('sine') all around the closed anticlockwise loop!
  const tramCurve = new THREE.CatmullRomCurve3(TRAM_LOOP_PTS, true, 'catmullrom', 0.35);
  {
    const RAIL_M = { tag: 'sine', col: '#5a5f66', bleed: '#3d4147', solid: false, orb: 'sine' };
    const N = 120;
    b.object(() => {
      for (let i = 0; i < N; i++) {
        const u0 = i / N, u1 = ((i + 1) % N) / N;
        const p0 = tramCurve.getPoint(u0), p1 = tramCurve.getPoint(u1);
        const dx = p1.x - p0.x, dz = p1.z - p0.z, len = Math.hypot(dx, dz), ry = Math.atan2(dx, dz);
        const nx = dz / len, nz = -dx / len;
        const mx = (p0.x + p1.x) / 2, mz = (p0.z + p1.z) / 2;
        for (const sd of [-0.68, 0.68])
          box(0.11, 0.06, len + 0.08, mx + nx * sd, TOWN_Y + 0.11, mz + nz * sd, RAIL_M, ry);
      }
    });
  }

  // Baščaršija tram stop shelter ('quay' finale) at (4, TOWN_Y, -12.0)
  b.object(() => {
    const TS = { tag: 'quay', col: '#4a5258', bleed: '#343a40' };
    box(4.6, 0.14, 1.7, 4, TOWN_Y + 2.65, -12.0, TS);
    for (const dx of [-2.0, 2.0]) A(CYL, 4 + dx, TOWN_Y + 1.32, -11.3, { ...TS, wall: true }, 0, 0, 0, [0.07, 2.6, 0.07]);
    box(4.4, 1.8, 0.08, 4, TOWN_Y + 1.4, -11.2, { tag: 'quay', col: '#9fb6c2', bleed: '#7a929e', wall: true });
    box(2.6, 0.12, 0.45, 4, TOWN_Y + 0.55, -11.55, { tag: 'quay', col: '#7a5436' });
  });

  // 9A. Old Orthodox Church ('crkva') north of back street at (-46, TOWN_Y, -24.5)
  b.object(() => {
    const cx = -46, cz = -24.5;
    const CR_S = { tag: 'crkva', col: '#d8d0c0', bleed: '#b8ae9c', pat: PAT.blocks, ps: 0.7, pool: 0.7, orb: 'crkva' };
    const CR_R = { tag: 'crkva', col: '#a85334', bleed: '#823d24', pat: PAT.roof, ps: 1.4, orb: 'crkva' };
    // Low stone courtyard wall on street
    box(15.5, 1.8, 0.55, cx, TOWN_Y + 0.9, cz + 5.6, CR_S);
    // Wider-than-long limestone church + low 4-sided ćeramida pyramid roof
    box(12.2, 4.6, 9.6, cx, TOWN_Y + 2.3, cz, CR_S);
    A(roofGeo(10.8, 13.4, 3.0, 2.6), cx, TOWN_Y + 4.6, cz, CR_R, Math.PI / 2);
    // Square pseudo-Romanesque tufa bell tower on west + cross (wall: true!)
    const tx = cx - 7.8, tz = cz + 1.2;
    box(3.4, 12.2, 3.4, tx, TOWN_Y + 6.1, tz, { ...CR_S, col: '#cbb490', bleed: '#ab926e' });
    A(CONE4, tx, TOWN_Y + 13.6, tz, { ...CR_R, wall: true }, Math.PI / 4, 0, 0, [2.7, 2.8, 2.7]);
    // Cross on Orthodox bell tower (wall: true)
    box(0.14, 1.35, 0.14, tx, TOWN_Y + 15.6, tz, { tag: 'crkva', col: '#c9a63c', wall: true });
    box(0.75, 0.14, 0.14, tx, TOWN_Y + 15.85, tz, { tag: 'crkva', col: '#c9a63c', wall: true });
  });

  // 9B. Old Synagogue ('sinagoga') south of back street at (-82, TOWN_Y, -6.0): NO cross or roof symbol!
  b.object(() => {
    const sx = -82, sz = -6.0;
    const SY_S = { tag: 'sinagoga', col: '#d9d2c4', bleed: '#b9b0a0', pat: PAT.blocks, ps: 0.65, pool: 0.7, orb: 'sinagoga' };
    const SY_R = { tag: 'sinagoga', col: '#b35736', bleed: '#8c3e24', pat: PAT.roof, ps: 1.5, orb: 'sinagoga' };
    // Rectangular stone hall + pitched roof
    box(8.8, 7.6, 12.4, sx, TOWN_Y + 3.8, sz, SY_S);
    A(roofGeo(9.8, 13.4, 2.6, 13.4), sx, TOWN_Y + 7.6, sz, SY_R);
    // Rose window detail on south facade
    A(CYL12, sx, TOWN_Y + 5.6, sz + 6.24, { tag: 'sinagoga', col: '#5a6a78', solid: false }, 0, Math.PI / 2, 0, [0.75, 0.08, 0.75]);
    // Walled cobbled courtyard & iron double gates facing north toward back street
    box(3.8, 2.0, 0.45, sx - 3.6, TOWN_Y + 1.0, sz - 7.8, SY_S);
    box(3.8, 2.0, 0.45, sx + 3.6, TOWN_Y + 1.0, sz - 7.8, SY_S);
    box(3.0, 2.0, 0.12, sx, TOWN_Y + 1.0, sz - 7.8, { tag: 'sinagoga', col: '#3d4042', wall: true });
  });

  // 9C. "East | West" paving line + Ferhadija pedestrian street + Austro-Hungarian facades ('west' finale)
  slab(-122, -86, 0.5, 7.5, WEST_M, TOWN_Y + 0.04, 0.08);
  // Meeting of Cultures cream stone strip at x = -86
  box(0.8, 0.06, 7.0, -86, TOWN_Y + 0.09, 4.0, { tag: 'west', col: '#f2ead6', bleed: '#dfd4ba', solid: false });
  // Austro-Hungarian 3-storey blocks flanking Ferhadija & square
  for (const [fx, fz, fw, fd, fh, cIdx] of [
    [-92, -3.5, 9.5, 7.5, 11.5, 0], [-116, -3.5, 9.5, 7.5, 11.0, 1],
    [-91, 13.5, 8.5, 7.0, 11.0, 2], [-116, 14.5, 8.5, 8.0, 11.5, 3],
    [-116, 25.0, 8.5, 8.0, 10.5, 0],
  ]) {
    const wc = AH_WALLS[cIdx % AH_WALLS.length];
    b.object(() => {
      box(fw, fh, fd, fx, TOWN_Y + fh / 2, fz, { tag: 'west', col: wc[0], bleed: wc[1], pool: 0.7 });
      A(roofGeo(Math.min(fw, fd) + 0.8, Math.max(fw, fd) + 0.8, 2.4, Math.max(fw, fd) - Math.min(fw, fd) + 1.0), fx, TOWN_Y + fh, fz, { tag: 'west', col: '#9e4c30', bleed: '#7a3820', pat: PAT.roof, ps: 1.4 }, fw > fd ? Math.PI / 2 : 0);
      // Window bands
      for (const wy of [4.2, 8.2]) for (let dx = -fw * 0.3; dx <= fw * 0.31; dx += fw * 0.3)
        box(1.1, 1.8, fd + 0.14, fx + dx, TOWN_Y + wy, fz, { tag: 'west', col: '#5a7080', solid: false });
    });
  }

  // 9D. Sacred Heart Cathedral ('katedrala') + its TWO towers ('dva', requires katedrala) at (-104, TOWN_Y, -5.0)
  b.object(() => {
    const kx = -104, kz = -5.5;
    const KT_S = { tag: 'katedrala', col: '#dec7a0', bleed: '#be9e74', pat: PAT.blocks, ps: 0.55, pool: 0.8, orb: 'katedrala' };
    const KT_R = { tag: 'katedrala', col: '#7c6f68', bleed: '#5f544e', pat: PAT.roof, ps: 1.5, orb: 'katedrala' };
    // Nave body + steep gabled roof + front portal gable
    box(11.6, 12.2, 16.5, kx, TOWN_Y + 6.1, kz - 2.2, KT_S);
    A(roofGeo(12.2, 17.0, 5.2, 17.0), kx, TOWN_Y + 12.2, kz - 2.2, KT_R);
    // Front neo-Gothic gable + signature 8-lobed rose window over south entrance!
    box(7.4, 14.5, 1.4, kx, TOWN_Y + 7.25, kz + 5.8, KT_S);
    A(CYL16, kx, TOWN_Y + 9.2, kz + 6.56, { tag: 'katedrala', col: '#4a6484', bleed: '#324866', solid: false }, 0, Math.PI / 2, 0, [1.85, 0.14, 1.85]);
    A(new THREE.TorusGeometry(1.88, 0.18, 6, 16), kx, TOWN_Y + 9.2, kz + 6.58, { tag: 'katedrala', col: '#efe6d4', solid: false });
    // Dark arched portal door
    box(2.6, 3.8, 0.3, kx, TOWN_Y + 1.9, kz + 6.52, { tag: 'katedrala', col: '#4e3422', wall: true });
  });
  // Cathedral's TWO towers ('dva'): separate tag so 'dva' colours ONLY the two towers!
  for (const sx of [-4.6, 4.6]) {
    b.object(() => {
      const tx = -104 + sx, tz = 0.2;
      const DV_S = { tag: 'dva', col: '#dec7a0', bleed: '#be9e74', pat: PAT.blocks, ps: 0.6, pool: 0.8, orb: 'dva' };
      const DV_SP = { tag: 'dva', col: '#556e68', bleed: '#3c524d', wall: true, edge: 25 };
      box(3.4, 19.5, 3.4, tx, TOWN_Y + 9.75, tz, DV_S);
      box(3.75, 0.45, 3.75, tx, TOWN_Y + 19.6, tz, { tag: 'dva', col: '#efe6d4', wall: true });
      A(CONE4, tx, TOWN_Y + 24.4, tz, DV_SP, Math.PI / 4, 0, 0, [2.5, 9.2, 2.5]);
      // Crosses on spires (wall: true!)
      box(0.14, 1.5, 0.14, tx, TOWN_Y + 29.6, tz, { tag: 'dva', col: '#d4b042', wall: true });
      box(0.85, 0.14, 0.14, tx, TOWN_Y + 29.85, tz, { tag: 'dva', col: '#d4b042', wall: true });
    });
  }

  // 9E. Trg oslobođenja & Giant Chess ('sah') at (-103, TOWN_Y, 17.5)
  slab(-111, -95, 10.5, 25.0, WEST_M, TOWN_Y + 0.05, 0.1);
  // Bench for grandfather ('djed') facing the giant chess
  b.object(() => {
    const BM = { tag: 'west', col: '#7d5434', bleed: '#5a3a20', pat: PAT.planks, ps: 3 };
    b.push(mat4(-96.2, TOWN_Y + 0.08, 17.5, -Math.PI / 2));
    box(2.4, 0.12, 0.62, 0, 0.54, 0, BM);
    box(2.4, 0.52, 0.1, 0, 1.0, -0.28, BM, 0, -0.1, 0);
    for (const lx of [-0.95, 0.95]) box(0.12, 0.54, 0.56, lx, 0.27, 0, { tag: 'west', col: '#3e4042' });
    b.pop();
  });
  // Giant chessboard + merged static pieces ('sah') + 1 moving piece animated after finale
  let movingChessPiece = null;
  b.object(() => {
    const cx = -103.5, cz = 17.5, sq = 0.72;
    box(sq * 8 + 0.4, 0.12, sq * 8 + 0.4, cx, TOWN_Y + 0.10, cz, { tag: 'sah', col: '#8d867a', bleed: '#6e685e', orb: 'sah' });
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const dark = (r + c) % 2 === 1;
      box(sq, 0.04, sq, cx + (c - 3.5) * sq, TOWN_Y + 0.18, cz + (r - 3.5) * sq, { tag: 'sah', col: dark ? '#3c3834' : '#f2ece0', solid: false, ink: false });
    }
    // 10 merged giant pieces (5 white, 5 black)
    const piecePts = [
      [0, 1, 0, 1.05], [1, 3, 0, 0.78], [2, 5, 0, 0.85], [1, 6, 0, 0.78], [3, 2, 0, 0.95],
      [7, 2, 1, 1.05], [6, 4, 1, 0.78], [5, 6, 1, 0.88], [6, 1, 1, 0.78], [4, 5, 1, 0.92],
    ];
    for (const [r, c, blk, h] of piecePts) {
      const px = cx + (c - 3.5) * sq, pz = cz + (r - 3.5) * sq;
      const PM = { tag: 'sah', col: blk ? '#34312e' : '#f4efe2', bleed: blk ? '#1e1c1a' : '#d6cebe', solid: false };
      A(CYL, px, TOWN_Y + 0.2 + h * 0.45, pz, PM, 0, 0, 0, [0.16, h * 0.9, 0.16]);
      A(SPHERE, px, TOWN_Y + 0.2 + h * 0.95, pz, { ...PM, hull: true }, 0, 0, 0, [0.14, 0.14, 0.14]);
    }
  });
  // One movable chess piece (animated between two squares once alive)
  {
    const g = new THREE.Group();
    const sMat = washMat('sah');
    const px = -103.5 + (3 - 3.5) * 0.72, pz = 17.5 + (4 - 3.5) * 0.72;
    g.position.set(px, TOWN_Y + 0.2, pz);
    const body = new THREE.Mesh(paintGeo(new THREE.CylinderGeometry(0.13, 0.18, 0.85, 8).translate(0, 0.425, 0), { col: '#f4efe2', bleed: '#d6cebe', seed: [-103.5, TOWN_Y + 0.6, 17.5], radius: 4, dur: 2.5, hatch: 0.4 }), sMat);
    const top = new THREE.Mesh(paintGeo(new THREE.SphereGeometry(0.14, 10, 8), { col: '#f4efe2', bleed: '#d6cebe', seed: [-103.5, TOWN_Y + 0.6, 17.5], radius: 4, dur: 2.5, hatch: 0.4 }), sMat);
    top.position.y = 0.92; addHull(body, 1.3); addHull(top, 1.3); g.add(body, top); scene.add(g);
    movingChessPiece = { g, a: V(px, TOWN_Y + 0.2, pz), b: V(px + 0.72, TOWN_Y + 0.2, pz - 0.72) };
  }

  // ==================== 10. QUAY POPLARS ('jablan'), BENCHES, LAMPS & CHESTNUT STAND ====================
  function addPoplar(x, y, z, s = 1, orbId = 'jablan') {
    const c = pick(POPLAR_C);
    const PL = { tag: 'jablan', col: c[0], bleed: c[1], hull: true, orb: orbId };
    b.object(() => {
      A(TAPER, x, y + 1.6 * s, z, { tag: 'jablan', col: '#6d5036', bleed: '#4d3724', edge: 50, wall: true }, 0, 0, 0, [0.28 * s, 3.2 * s, 0.28 * s]);
      // Tall narrow golden Lombardy column (3 stacked stretched spheres)
      for (const [oy, rx, ry] of [[5.4, 1.25, 3.4], [9.2, 1.05, 3.0], [12.2, 0.72, 2.2]])
        A(POPLAR, x, y + oy * s, z, { ...PL, sway: (v) => 0.028 * Math.max(0, v.y - y - 2.5) }, 0, 0, 0, [rx * s, ry * s, rx * s]);
    });
    leafEmitters.push({ x, y: y + 7.5 * s, z, r: 1.8 * s });
  }
  // Famous Sebilj golden poplar (twin-trunked silhouette at (7.5, TOWN_Y, -6.5))
  addPoplar(7.5, TOWN_Y + 0.08, -6.5, 1.28);
  // Quay row poplars along Miljacka
  for (const px of [-92, -62, -22, 20, 44]) addPoplar(px, TOWN_Y + 0.08, 38.4, rr(0.95, 1.15));
  // South bank poplars by Inat kuća
  addPoplar(66, TOWN_Y + 0.08, 65.5, 1.1);
  addPoplar(84, TOWN_Y + 0.08, 65.5, 1.05);

  // Quay benches & street lamps ('quay' finale)
  for (const bx of [-74, -30, -4, 30]) {
    b.push(mat4(bx, TOWN_Y + 0.08, 38.0, Math.PI));
    box(2.1, 0.11, 0.58, 0, 0.52, 0, { tag: 'quay', col: '#7d5232', pat: PAT.planks, ps: 3 });
    box(2.1, 0.45, 0.09, 0, 0.94, -0.26, { tag: 'quay', col: '#7d5232' });
    b.pop();
  }
  for (const lx of [-80, -42, -10, 26, 52]) {
    A(CYL, lx, TOWN_Y + 1.8, 38.6, { tag: 'quay', col: '#3a4042', wall: true }, 0, 0, 0, [0.08, 3.6, 0.08]);
    box(0.45, 0.55, 0.45, lx, TOWN_Y + 3.85, 38.6, { tag: 'quay', col: '#f2d478', bleed: '#e2ae42', solid: false });
  }

  // Chestnut stand on east quay near Vijećnica at (39, TOWN_Y, 32.5) (stand = 'quay' finale; chestnuts = 'kesteni')
  b.object(() => {
    const sx = 39, sz = 32.5;
    box(1.7, 0.92, 0.95, sx, TOWN_Y + 0.54, sz, { tag: 'quay', col: '#5a3d28', bleed: '#3e291a', pat: PAT.planks, ps: 3 });
    A(CYL12, sx - 0.25, TOWN_Y + 1.06, sz, { tag: 'quay', col: '#2d2d2e', bleed: '#1c1c1e' }, 0, 0, 0, [0.36, 0.14, 0.36]);
    // Roasted chestnuts piled in pan + paper cones ('kesteni')
    const KN = { tag: 'kesteni', col: '#61341f', bleed: '#3d1e10', hull: true, orb: 'kesteni' };
    for (let i = 0; i < 9; i++) {
      const a = i * 0.72, r = (i % 3) * 0.1;
      A(ICO0, sx - 0.25 + Math.cos(a) * r, TOWN_Y + 1.15, sz + Math.sin(a) * r, KN, 0, 0, 0, [0.065, 0.048, 0.065]);
    }
    for (let i = 0; i < 3; i++) {
      A(CONE8, sx + 0.42 + i * 0.16, TOWN_Y + 1.10, sz + 0.1, { tag: 'quay', col: '#dcd0b4', solid: false }, 0, Math.PI, 0, [0.065, 0.18, 0.065]);
      A(ICO0, sx + 0.42 + i * 0.16, TOWN_Y + 1.20, sz + 0.1, KN, 0, 0, 0, [0.055, 0.042, 0.055]);
    }
  });
  smoke.push({ x: 38.75, y: TOWN_Y + 1.35, z: 32.5 }); // smoke #2 (chestnut roaster)

  // ==================== 11. THE TRAM ('tramvaj', frozen eastbound on quay, rolls after onWake!) ====================
  const tramGroup = new THREE.Group();
  const tramStartU = tramCurve.getUtoTmapping(0.205);
  {
    const tmMat = washMat('tramvaj');
    const TSeed = [12, TOWN_Y + 1.8, 35.5];
    const tp = (geo, col, bleed, x, y, z, sx = 1, sy = 1, sz = 1) => {
      const m = new THREE.Mesh(paintGeo(geo, { col, bleed: bleed || col, seed: TSeed, radius: 14, dur: 3.6, hatch: 0.5 }), tmMat);
      m.position.set(x, y, z); m.scale.set(sx, sy, sz); addHull(m, 1.5); tramGroup.add(m); return m;
    };
    // Modern bright-yellow 3-section Sarajevo tram (total length ~18 m, width 2.4 m, height 3.2 m, facing +z in local)
    for (const [zOff, len] of [[-6.0, 5.5], [0, 5.5], [5.3, 4.1]]) {
      tp(BOX, '#f2c200', '#d6a200', 0, 1.75, zOff, 2.38, 2.45, len);         // bright yellow body
      tp(BOX, '#3d4550', '#2b313a', 0, 0.55, zOff, 2.42, 0.65, len + 0.02);  // dark grey-blue lower skirt
      tp(BOX, '#262b32', '#1a1e24', 0, 1.92, zOff, 2.44, 0.95, len - 0.5);   // black window band
      tp(BOX, '#dce2e6', '#b8c0c6', 0, 3.05, zOff, 2.15, 0.22, len - 0.2);   // roof unit
    }
    // Articulation bellows between sections
    for (const zB of [-3.0, 3.0]) tp(BOX, '#34383e', '#24272b', 0, 1.65, zB, 2.15, 2.4, 0.65);
    // Open front driver cab (z = 7.35..8.95) with clear windshield cutout so the driver ('vozac') is clearly visible!
    tp(BOX, '#3d4550', '#2b313a', 0, 0.52, 8.15, 2.40, 0.62, 1.6);           // front skirt & floor
    tp(BOX, '#f2c200', '#d6a200', 0, 1.02, 8.15, 2.38, 0.72, 1.6);           // lower yellow nose & dashboard
    tp(BOX, '#f2c200', '#d6a200', 0, 2.78, 8.15, 2.38, 0.42, 1.6);           // cab roof visor
    tp(BOX, '#dce2e6', '#b8c0c6', 0, 3.05, 8.15, 2.15, 0.22, 1.5);           // front roof unit
    for (const sx of [-1.11, 1.11]) tp(BOX, '#262b32', '#1a1e24', sx, 2.02, 8.84, 0.14, 1.32, 0.14); // A-pillars
    for (const sx of [-0.72, 0.72]) tp(BOX, '#fff6cc', '#e8c44e', sx, 0.95, 8.97, 0.28, 0.18, 0.08); // headlights
    // Roof pantograph
    tp(BOX, '#3a3d42', '#26282b', 0, 3.65, 1.5, 1.4, 0.08, 0.08);
    tp(BOX, '#3a3d42', '#26282b', 0, 3.35, 1.5, 0.08, 0.6, 0.9);
    // Register tram sub on tag 'tramvaj' so ownSphere/timing knows its extent
    tag('tramvaj').subs.push({ box: new THREE.Box3(V(3, TOWN_Y, 34), V(21, TOWN_Y + 3.8, 37)), ranges: [], hranges: [] });
    tag('tramvaj').end = 3.8; tag('tramvaj').nearEnd = 3.6;
    scene.add(tramGroup);
  }
  // Place tram at frozen eastbound spot (x=12, z=35.5 facing +x east)
  const tramFrozenPos = V(12, TOWN_Y + 0.14, 35.5);
  tramGroup.position.copy(tramFrozenPos);
  tramGroup.rotation.y = Math.PI / 2;
  // Static collider for the frozen tram (dropped when tram starts moving in onWake, replaced by dynamic world.movers!)
  const tramStaticCollider = b.block(BOX, mat4(12, TOWN_Y + 1.8, 35.5, 0, 0, 0, [18.2, 3.3, 2.5]), { orb: 'tramvaj', tag: 'tramvaj' });

  // ==================== 12. MAHALA HILL (3 TERRACES), KOVAČI STREET & ŽUTA TABIJA ====================
  // Three stepped green hill terraces ('brdo') rising north behind the back street
  box(260, 10, 26, 20, 8.5 - 5, -31.5, HILL_M);       // Lower terrace top y = 8.5
  box(260, 16, 25, 20, 14.5 - 8, -56.5, HILL_M);      // Middle terrace top y = 14.5
  box(260, 22, 28, 20, 21.0 - 11, -82.0, HILL_M);     // Upper terrace top y = 21.0
  // Gentle sloped grass risers connecting terraces (clean low-poly ramps)
  box(220, 5.2, 7.5, 15, 5.8, -20.0, { ...HILL_M, solid: false }, 0, -0.62, 0);
  box(220, 6.8, 7.5, 15, 11.2, -44.5, { ...HILL_M, solid: false }, 0, -0.72, 0);
  box(220, 7.2, 7.5, 15, 17.5, -68.5, { ...HILL_M, solid: false }, 0, -0.75, 0);
  // Hill mass rising up to Žuta tabija on the ENE side
  A(ICO2, 92, 16, -54, { tag: 'brdo', col: '#7c9052', bleed: '#607340', hull: true, solid: false }, 0, 0, 0, [34, 15, 30]);

  // Steep Kovači street ('strma') climbing NE from (24, 4.1, -12) up to Žuta tabija (77, 29.5, -49)
  b.object(() => {
    const ST = { tag: 'strma', col: '#beb4a4', bleed: '#9c9282', pat: PAT.cobble, ps: 1.2, orb: 'strma' };
    const pA = V(24, TOWN_Y + 0.06, -12), pB = V(76, 29.8, -48);
    const steps = 22;
    for (let i = 0; i < steps; i++) {
      const u0 = i / steps, u1 = (i + 1) / steps;
      const a = pA.clone().lerp(pB, u0), c = pA.clone().lerp(pB, u1), m = a.clone().lerp(c, 0.5);
      const dx = c.x - a.x, dz = c.z - a.z, hz = Math.hypot(dx, dz), ry = Math.atan2(dx, dz);
      // Solid grounded stone riser + kaldrma tread down into the hillside so zero steps ever hover
      const stepH = Math.max(2.6, m.y - Math.max(TOWN_Y - 0.8, sarajevoGroundY(m.x, m.z) - 2.4));
      box(4.4, stepH, hz + 0.45, m.x, m.y - stepH / 2 + 0.08, m.z, ST, ry);
    }
  });

  // Helper: traditional Bosnian mahala house ('mahala', or custom tag like 'stara')
  function mahalaHouse(x, y, z, rot, w = 6.2, d = 5.4, h = 5.0, o = {}) {
    const tg = o.tag || 'mahala';
    const tc = o.shingle ? SHINGLE : pick(TILE_C);
    const MW = { tag: tg, col: LIME[0], bleed: LIME[1], pool: 0.7, orb: o.orb };
    const MS = { tag: tg, col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 0.65, orb: o.orb };
    const MR = { tag: tg, col: tc[0], bleed: tc[1], pat: PAT.roof, ps: 1.4, orb: o.orb };
    const MD = { tag: tg, col: WOOD[0], bleed: WOOD[1], pat: PAT.planks, ps: 4, orb: o.orb };
    b.push(mat4(x, y, z, rot));
    b.object(() => {
      box(w, 2.2, d, 0, 1.1, 0, MS);
      box(w + 0.6, h - 2.2, d + 0.6, 0, 2.2 + (h - 2.2) / 2, 0, MW);
      // Dark wood trim & windows
      for (const wx of [-w * 0.26, w * 0.26])
        box(0.85, 1.15, 0.1, wx, h - 1.25, (d + 0.6) / 2 + 0.04, { tag: tg, col: '#4a3426', solid: false });
      if (o.doksat) {
        // Cantilevered dark-wood bay window (doksat) with a real open recessed window for Nana
        const fz = (d + 0.6) / 2;
        box(2.7, 0.72, 1.25, 0, h - 2.18, fz + 0.56, MD);                     // lower apron under window sill
        box(2.7, 0.42, 1.25, 0, h - 0.38, fz + 0.56, MD);                     // upper lintel beam
        box(0.55, 1.38, 1.25, -1.07, h - 1.22, fz + 0.56, MD);                // left bay cheek
        box(0.55, 1.38, 1.25, 1.07, h - 1.22, fz + 0.56, MD);                 // right bay cheek
        box(1.62, 1.38, 0.14, 0, h - 1.22, fz + 0.06, { tag: tg, col: '#221c18', solid: false }); // dark interior backdrop
        box(1.9, 0.12, 0.38, 0, h - 1.78, fz + 1.14, MD);                     // wooden sill for Nana
      }
      A(roofGeo(d + 1.9, w + 1.9, o.shingle ? 2.8 : 2.0, Math.max(0.4, w - d + 0.8)), 0, h, 0, MR, Math.PI / 2);
      if (o.chimney !== false)
        box(0.68, 1.8, 0.68, w * 0.24, h + 1.6, -d * 0.18, MW);
    });
    b.pop();
  }

  // Helper: walled Sarajevo courtyard ('avlija') with wooden double gate ('kapija')
  function addAvlija(x, y, z, w, d, gateSide = 'south') {
    const AW = { tag: 'avlija', col: '#f2eee4', bleed: '#dcd5c4', pool: 0.6, orb: 'avlija' };
    const AR = { tag: 'avlija', col: '#b85a35', bleed: '#914224', solid: false };
    const KP = { tag: 'kapija', col: '#5a3b25', bleed: '#3d2718', pat: PAT.planks, ps: 4, orb: 'kapija' };
    const KR = { tag: 'kapija', col: '#b55632', bleed: '#8d3e22' };
    b.object(() => {
      // Pebble kaldrma paving + flower bed strips along inner edges
      box(w - 0.5, 0.08, d - 0.5, x, y + 0.04, z, { tag: 'avlija', col: '#e2dcd0', bleed: '#cac2b2', pat: PAT.cobble, ps: 1.6, orb: 'avlija' });
      box(w - 1.4, 0.12, 0.75, x, y + 0.08, z - d / 2 + 0.65, { tag: 'avlija', col: '#788f52', bleed: '#5b723c', solid: false });
      // 3 full walls + 1 front wall split for kapija gate
      const wh = 2.0;
      box(0.4, wh, d, x - w / 2, y + wh / 2, z, AW);
      box(0.4, wh, d, x + w / 2, y + wh / 2, z, AW);
      box(w, wh, 0.4, x, y + wh / 2, z - d / 2, AW);
      // Front wall with 2.4 m gate opening
      const fz = z + d / 2, sideW = (w - 2.4) / 2;
      box(sideW, wh, 0.4, x - w / 2 + sideW / 2, y + wh / 2, fz, AW);
      box(sideW, wh, 0.4, x + w / 2 - sideW / 2, y + wh / 2, fz, AW);
      // Terracotta cap strip along top of courtyard walls
      box(w + 0.2, 0.16, 0.55, x, y + wh + 0.08, z - d / 2, AR);
    });
    // Wooden double gate ('kapija') with small tile roof
    b.object(() => {
      const fz = z + d / 2;
      box(2.3, 2.05, 0.18, x, y + 1.02, fz, KP);
      box(2.9, 0.22, 0.95, x, y + 2.25, fz, KR);
    });
  }

  // Lower terrace (y = 8.5, z = -25..-42)
  mahalaHouse(-22, 8.5, -34, 0, 6.2, 5.2, 5.0);
  mahalaHouse(-8, 8.5, -36, 0, 6.4, 5.4, 5.2);
  mahalaHouse(6, 8.5, -38, 0, 6.4, 5.4, 5.0);
  smoke.push({ x: 6 + 6.4 * 0.24, y: 8.5 + 5.0 + 2.5, z: -38 - 5.4 * 0.18 }); // smoke #3
  mahalaHouse(28, 8.5, -35, 0.15, 6.0, 5.0, 4.8);
  addAvlija(6, 8.5, -30, 8.6, 7.6);
  // Outdoor wood stove & red peppers ('paprike') in lower-terrace courtyard (at (4.5, 8.5, -30.5))
  b.object(() => {
    const px = 4.5, pz = -30.5;
    box(1.1, 0.78, 0.85, px, 8.5 + 0.39, pz, { tag: 'props', col: '#3a3a3c', bleed: '#252527' });
    A(CYL, px + 0.4, 8.5 + 1.5, pz - 0.3, { tag: 'props', col: '#4a4a4c', wall: true }, 0, 0, 0, [0.08, 1.6, 0.08]);
    const PP = { tag: 'paprike', col: '#cc3526', bleed: '#982016', hull: true, orb: 'paprike' };
    // Red peppers roasting on stove top
    for (let i = 0; i < 6; i++)
      A(SPHERE, px - 0.32 + (i % 3) * 0.28, 8.5 + 0.84, pz - 0.14 + Math.floor(i / 3) * 0.28, PP, 0.3 * i, 0, 0, [0.06, 0.045, 0.13]);
    // Strings of red peppers hanging on courtyard wall
    for (const sx of [px - 1.2, px - 0.7]) for (let k = 0; k < 4; k++)
      A(SPHERE, sx, 8.5 + 1.65 - k * 0.2, pz - 3.05, PP, 0, 0, 0, [0.055, 0.11, 0.055]);
  });
  // Small mahala stone fountain ('props') + big golden linden ('lipa') at (19, 8.5, -28)
  box(1.1, 1.5, 0.8, 16.5, 8.5 + 0.75, -28, { tag: 'props', col: STONE_G[0], bleed: STONE_G[1], pat: PAT.blocks, ps: 1.0 });
  b.object(() => {
    const lx = 19.5, ly = 8.5, lz = -28;
    A(TAPER, lx, ly + 2.1, lz, { tag: 'lipa', col: '#694a30', bleed: '#4a331f', edge: 50, wall: true }, 0, 0, 0, [0.46, 4.2, 0.46]);
    const LP = { tag: 'lipa', col: '#e8c448', bleed: '#cf9e28', hull: true, orb: 'lipa', sway: (v) => 0.03 * Math.max(0, v.y - ly - 3) };
    for (const [dx, dy, dz, r] of [[0, 5.8, 0, 3.0], [-2.2, 4.9, 0.7, 2.2], [2.2, 5.1, -0.6, 2.3], [0.4, 5.0, 2.1, 2.1], [-0.4, 5.1, -2.0, 2.1]])
      A(ICO, lx + dx, ly + dy, lz + dz, LP, 0, 0, 0, [r, r * 0.85, r]);
    leafEmitters.push({ x: lx, y: ly + 5.5, z: lz, r: 3.2 });
  });
  // Small mahala mosque #1 ('landmarks' finale) at (-32, 8.5, -34)
  b.object(() => {
    box(6.2, 4.6, 6.2, -32, 8.5 + 2.3, -34, LM_W);
    A(roofGeo(7.0, 7.0, 2.2, 0.6), -32, 8.5 + 4.6, -34, { tag: 'landmarks', col: '#b55632', pat: PAT.roof, ps: 1.4 });
    A(CYL, -35.6, 8.5 + 7.5, -34, { ...LM_W, wall: true }, 0, 0, 0, [0.55, 14.5, 0.55]);
    A(CONE8, -35.6, 8.5 + 16.2, -34, { tag: 'landmarks', col: '#6a787e', wall: true }, 0, 0, 0, [0.65, 3.2, 0.65]);
  });

  // Middle terrace (y = 14.5, z = -48..-64)
  mahalaHouse(-12, 14.5, -59, 0, 6.4, 5.4, 5.2);
  mahalaHouse(10, 14.5, -60, 0, 6.6, 5.4, 5.0, { shingle: true });
  smoke.push({ x: 10 + 6.6 * 0.24, y: 14.5 + 5.0 + 2.5, z: -60 - 5.4 * 0.18 }); // smoke #4 (max 4!)
  mahalaHouse(32, 14.5, -60, -0.1, 6.2, 5.2, 5.0);
  addAvlija(-12, 14.5, -52, 8.2, 7.2);
  addAvlija(10, 14.5, -52, 8.2, 7.2);
  addAvlija(30, 14.5, -52, 8.4, 7.4);

  // Quince tree ('dunja') + golden quinces on its house's windowsill at (-11, 14.5, -52)
  b.object(() => {
    const dx = -10.5, dy = 14.5, dz = -52.5;
    A(TAPER, dx, dy + 1.3, dz, { tag: 'dunja', col: '#6b4c32', edge: 50, wall: true }, 0, 0, 0, [0.24, 2.6, 0.24]);
    const DN = { tag: 'dunja', col: '#d9b53e', bleed: '#b88f24', hull: true, orb: 'dunja', sway: (v) => 0.025 * Math.max(0, v.y - dy - 2) };
    for (const [ox, oy, oz, r] of [[0, 3.4, 0, 1.55], [-1.0, 2.9, 0.4, 1.15], [1.0, 3.0, -0.4, 1.15]])
      A(ICO, dx + ox, dy + oy, dz + oz, DN, 0, 0, 0, [r, r * 0.85, r]);
    // Golden quince fruits in canopy + 3 quinces on house windowsill!
    const FR = { tag: 'dunja', col: '#f2cc30', bleed: '#d6a418', hull: true, solid: false };
    for (const [fx, fy, fz] of [[-0.6, 2.6, 0.9], [0.5, 2.8, 0.8], [0.8, 2.5, -0.4], [-0.4, 3.3, 0.7]])
      A(SPHERE, dx + fx, dy + fy, dz + fz, FR, 0, 0, 0, [0.12, 0.14, 0.12]);
    for (let i = 0; i < 3; i++)
      A(SPHERE, -13.9 + i * 0.26, 14.5 + 3.45, -55.9, FR, 0, 0, 0, [0.11, 0.13, 0.11]);
  });

  // Pergola vine ('props' finale) + hanging purple grape bunches ('grozdje') at (10, 14.5, -52)
  b.object(() => {
    const gx = 10, gy = 14.5, gz = -52;
    const VN = { tag: 'props', col: '#5c4028', bleed: '#402c1a', wall: true };
    for (const sx of [-1.8, 1.8]) for (const sz of [-1.4, 1.4])
      A(CYL, gx + sx, gy + 1.35, gz + sz, VN, 0, 0, 0, [0.08, 2.7, 0.08]);
    for (let z = -1.3; z <= 1.35; z += 0.65)
      box(4.0, 0.08, 0.08, gx, gy + 2.72, gz + z, VN);
    // Autumn vine leaves on pergola ('props')
    for (let i = 0; i < 6; i++)
      A(ICO0, gx - 1.4 + i * 0.56, gy + 2.84, gz + (i % 2 ? 0.5 : -0.5), { tag: 'props', col: '#b87a2e', bleed: '#8f4624', solid: false }, 0, 0, 0, [0.52, 0.18, 0.52]);
  });
  b.object(() => {
    const gx = 10, gy = 14.5, gz = -52;
    const GR = { tag: 'grozdje', col: '#5e2c66', bleed: '#3e1848', hull: true, orb: 'grozdje' };
    for (const [bx, bz] of [[-1.0, -0.5], [0, 0.4], [1.0, -0.3], [-0.4, 0.8], [0.7, 0.7]]) {
      A(SPHERE, gx + bx, gy + 2.48, gz + bz, GR, 0, 0, 0, [0.14, 0.22, 0.14]);
      A(SPHERE, gx + bx, gy + 2.28, gz + bz, { ...GR, solid: false }, 0, 0, 0, [0.09, 0.14, 0.09]);
    }
  });

  // Walnut tree ('orah') + bare horizontal branch for squirrel ('vjeverica') at (29.5, 14.5, -52.5)
  b.object(() => {
    const ox = 29.5, oy = 14.5, oz = -52.5;
    A(TAPER, ox, oy + 1.9, oz, { tag: 'orah', col: '#5c422c', bleed: '#3f2d1d', edge: 50, wall: true }, 0, 0, 0, [0.38, 3.8, 0.38]);
    // Bare branch sticking east/south for the squirrel
    A(CYL, ox + 1.4, oy + 2.85, oz + 0.5, { tag: 'orah', col: '#5c422c', bleed: '#3f2d1d', edge: 50, orb: 'orah' }, 0.3, 0, Math.PI / 2 - 0.08, [0.12, 2.8, 0.12]);
    const OR = { tag: 'orah', col: '#c49b38', bleed: '#967222', hull: true, orb: 'orah', sway: (v) => 0.025 * Math.max(0, v.y - oy - 3) };
    for (const [dx, dy, dz, r] of [[0, 4.9, 0, 2.3], [-1.7, 4.2, 0.6, 1.7], [1.6, 4.4, -0.7, 1.7], [-0.3, 4.3, -1.6, 1.5]])
      A(ICO, ox + dx, oy + dy, oz + dz, OR, 0, 0, 0, [r, r * 0.85, r]);
    // Walnuts on ground under tree
    for (let i = 0; i < 8; i++)
      A(ICO0, ox - 1.2 + i * 0.36, oy + 0.12, oz + 1.6 + (i % 2) * 0.4, { tag: 'orah', col: '#7a5430', bleed: '#54381d', solid: false }, 0, 0, 0, [0.06, 0.05, 0.06]);
    leafEmitters.push({ x: ox, y: oy + 4.8, z: oz, r: 2.5 });
  });
  // Small mahala mosque #2 ('landmarks' finale) at (-28, 14.5, -58)
  b.object(() => {
    box(6.0, 4.4, 6.0, -28, 14.5 + 2.2, -58, LM_W);
    A(roofGeo(6.8, 6.8, 2.1, 0.5), -28, 14.5 + 4.4, -58, { tag: 'landmarks', col: '#b55632', pat: PAT.roof, ps: 1.4 });
    A(CYL, -31.5, 14.5 + 7.2, -58, { ...LM_W, wall: true }, 0, 0, 0, [0.52, 14.0, 0.52]);
    A(CONE8, -31.5, 14.5 + 15.6, -58, { tag: 'landmarks', col: '#6a787e', wall: true }, 0, 0, 0, [0.62, 3.0, 0.62]);
  });

  // Upper terrace (y = 21.0, z = -72..-90)
  mahalaHouse(-20, 21.0, -82, 0.1, 6.2, 5.2, 5.0);
  mahalaHouse(36, 21.0, -81, -0.1, 6.4, 5.4, 5.2, { shingle: true });
  addAvlija(-6, 21.0, -76, 8.4, 7.6);
  addAvlija(18, 21.0, -75, 9.2, 8.2);

  // Apple tree ('jabuka') + wooden ladder ('merdevine') at (-6, 21.0, -76.5)
  b.object(() => {
    const ax = -6, ay = 21.0, az = -76.8;
    A(TAPER, ax, ay + 1.5, az, { tag: 'jabuka', col: '#66482e', edge: 50, wall: true }, 0, 0, 0, [0.28, 3.0, 0.28]);
    const JB = { tag: 'jabuka', col: '#8aa042', bleed: '#687c2c', hull: true, orb: 'jabuka', sway: (v) => 0.024 * Math.max(0, v.y - ay - 2.2) };
    for (const [dx, dy, dz, r] of [[0, 3.8, 0, 2.0], [-1.3, 3.3, 0.5, 1.4], [1.4, 3.4, -0.4, 1.45]])
      A(ICO, ax + dx, ay + dy, az + dz, JB, 0, 0, 0, [r, r * 0.85, r]);
    const AP = { tag: 'jabuka', col: '#d43a2a', bleed: '#a1251a', hull: true, solid: false };
    for (const [fx, fy, fz] of [[-0.8, 3.1, 1.1], [0.4, 3.4, 1.2], [1.0, 2.9, 0.7], [-0.2, 2.8, 1.35], [0.7, 3.8, 0.8], [-1.1, 3.6, 0.6]])
      A(SPHERE, ax + fx, ay + fy, az + fz, AP, 0, 0, 0, [0.11, 0.11, 0.11]);
  });
  // Wooden ladder ('merdevine') leaning into the apple tree from z = -74.6 up to -75.4
  b.object(() => {
    const MD = { tag: 'merdevine', col: '#9e7444', bleed: '#78542c', orb: 'merdevine' };
    b.push(mat4(-5.4, 21.0, -74.6, 0, -0.32, 0));
    for (const sx of [-0.26, 0.26]) box(0.07, 3.2, 0.07, sx, 1.6, 0, MD);
    for (let i = 0; i < 7; i++) box(0.56, 0.06, 0.06, 0, 0.4 + i * 0.42, 0, MD);
    b.pop();
  });

  // The Old House ('stara': 300-year-old Bosnian house with doksat bay window, own tag!) at (18, 21.0, -81.5)
  mahalaHouse(18, 21.0, -81.5, 0, 7.8, 6.4, 5.8, { tag: 'stara', orb: 'stara', doksat: true, shingle: true });

  // Fallen autumn leaves ('lisce') scattered across square, quay & mahala steps (1 merged mesh, solid: false)
  b.object(() => {
    const leafPatches = [
      [26, 8.5, -24, 18, 3.5], [22, 6.2, -18, 14, 3.0],
      [-12, TOWN_Y, -5, 22, 4.0], [7, TOWN_Y, -6, 20, 4.5],
      [-36, TOWN_Y, 35, 16, 4.0], [19, 8.5, -28, 16, 3.5],
      [16, 21.0, -72.5, 14, 2.5], [88, 30.0, -54, 18, 6.0],
    ];
    for (const [cx, cy, cz, cnt, rad] of leafPatches) {
      for (let i = 0; i < cnt; i++) {
        const a = R() * 6.28, r = Math.sqrt(R()) * rad;
        const c = LEAF_HEX[i % LEAF_HEX.length];
        box(rr(0.18, 0.34), 0.02, rr(0.14, 0.26), cx + Math.cos(a) * r, cy + 0.10, cz + Math.sin(a) * r, { tag: 'lisce', col: c, bleed: '#9c4c1e', solid: false, ink: false }, R() * 3.14);
      }
    }
  });

  // ==================== 13. ŽUTA TABIJA ('zuta': STAGE 2 LAST WORD!) & VRATNIK WALL ('bedem') ====================
  b.object(() => {
    const zx = 88, zy = 30.0, zz = -54;
    const ZT = { tag: 'zuta', col: STONE_Y[0], bleed: STONE_Y[1], pat: PAT.blocks, ps: 0.55, pool: 0.8, orb: 'zuta' };
    // Faceted D-shaped yellow-beige bastion plinth (battered 8-sided prism)
    A(new THREE.CylinderGeometry(13.8, 15.8, 11.5, 8), zx, zy - 5.75, zz, ZT, Math.PI / 8);
    // Low stone rim around the edge where people sit (opening on SW for Kovači entry)
    for (let i = 0; i < 8; i++) {
      if (i === 5) continue; // entry from steep Kovači street
      const a = (i / 8) * Math.PI * 2;
      box(10.2, 0.85, 0.9, zx + Math.sin(a) * 13.0, zy + 0.42, zz + Math.cos(a) * 13.0, ZT, a);
    }
    // Beaten earth & grass top terrace ('brdo' tag!)
    A(CYL, zx, zy - 0.05, zz, { tag: 'brdo', col: '#c8b288', bleed: '#8d9b5c', pat: PAT.grass }, Math.PI / 8, 0, 0, [13.2, 0.14, 13.2]);
    // Quiet ceremonial iftar cannon at rest on west point ('props' finale: NEVER fires!)
    box(0.55, 0.45, 0.9, zx - 10.2, zy + 0.28, zz + 1.5, { tag: 'props', col: '#5c3c24' }, -1.2);
    A(CYL, zx - 10.6, zy + 0.65, zz + 1.7, { tag: 'props', col: '#343638', wall: true }, -1.2, Math.PI / 2 - 0.15, 0, [0.16, 1.65, 0.16]);
    // Easel & mini watercolour painting for 'slikarica' (painted with 'slikarica'!)
    const ex = 84.6, ez = -46.8;
    b.push(mat4(ex, zy, ez, -1.9));
    for (const [lx, lz, rz, rx] of [[-0.35, 0.25, 0.18, -0.15], [0.35, 0.25, -0.18, -0.15], [0, -0.45, 0, 0.28]])
      A(CYL, lx, 0.82, lz, { tag: 'slikarica', col: '#7a5432', wall: true }, 0, rx, rz, [0.032, 1.7, 0.032]);
    box(0.82, 0.62, 0.06, 0, 1.32, 0.18, { tag: 'slikarica', col: '#f2e8d2', bleed: '#d99848', orb: 'slikarica' }, 0, -0.14, 0);
    b.pop();
  });

  // Autumn red-orange maples ('javor') on Žuta tabija
  for (const [jx, jz, js] of [[95, -48, 1.05], [96, -59, 1.15], [82, -63, 0.95]]) {
    const mc = pick(MAPLE_C);
    b.object(() => {
      A(TAPER, jx, 30.0 + 1.7 * js, jz, { tag: 'javor', col: '#63462d', edge: 50, wall: true }, 0, 0, 0, [0.32 * js, 3.4 * js, 0.32 * js]);
      const JV = { tag: 'javor', col: mc[0], bleed: mc[1], hull: true, orb: 'javor', sway: (v) => 0.03 * Math.max(0, v.y - 32.5) };
      for (const [dx, dy, dz, r] of [[0, 4.6, 0, 2.2], [-1.5, 3.9, 0.6, 1.6], [1.5, 4.0, -0.5, 1.65]])
        A(ICO, jx + dx * js, 30.0 + dy * js, jz + dz * js, JV, 0, 0, 0, [r * js, r * 0.84 * js, r * js]);
      leafEmitters.push({ x: jx, y: 30.0 + 4.4 * js, z: jz, r: 2.3 * js });
    });
  }

  // Vratnik fortress wall ('bedem') running NNW from Žuta tabija to the gate tower (NOT the gate tower!)
  b.object(() => {
    const BD = { tag: 'bedem', col: STONE_Y[0], bleed: STONE_Y[1], pat: PAT.blocks, ps: 0.6, pool: 0.8, orb: 'bedem' };
    const p0 = V(83, 29.0, -65), p1 = V(68, 27.0, -91);
    const segs = 6;
    for (let i = 0; i < segs; i++) {
      const a = p0.clone().lerp(p1, i / segs), c = p0.clone().lerp(p1, (i + 1) / segs), m = a.clone().lerp(c, 0.5);
      const len = Math.hypot(c.x - a.x, c.z - a.z), ry = Math.atan2(c.x - a.x, c.z - a.z);
      box(1.9, 8.2, len + 0.35, m.x, m.y + 0.3, m.z, BD, ry);
    }
  });
  // Vratnik Gate Tower (Kula Širokac: 'landmarks' finale, NOT coloured by 'bedem'!) at (65, 25.5, -95)
  b.object(() => {
    const gx = 65, gy = 25.5, gz = -95;
    box(3.0, 8.2, 7.6, gx - 2.6, gy + 4.1, gz, LM_S);
    box(3.0, 8.2, 7.6, gx + 2.6, gy + 4.1, gz, LM_S);
    box(3.2, 3.6, 7.6, gx, gy + 6.4, gz, LM_S);
    A(roofGeo(8.6, 9.2, 2.8, 1.2), gx, gy + 8.2, gz, { tag: 'landmarks', col: '#696662', bleed: '#4c4945', pat: PAT.roof, ps: 1.3 });
  });

  // ==================== 14. SOUTH BANK, PUMPKINS, CABLE CAR & TREBEVIĆ ====================
  // Bistrik orange-roofed south-bank houses ('south' finale)
  for (const [hx, hz, rot] of [[42, 74, Math.PI], [54, 76, Math.PI], [-22, 75, Math.PI], [-66, 74, Math.PI], [-82, 76, Math.PI], [6, 74, Math.PI]]) {
    mahalaHouse(hx, TOWN_Y, hz, rot, 6.4, 5.4, 5.0, { tag: 'south' });
  }
  // White minaret with green cap behind Inat kuća ('landmarks' finale)
  b.object(() => {
    const mx = 88, mz = 76;
    box(7.2, 4.8, 7.2, mx, TOWN_Y + 2.4, mz, LM_W);
    A(roofGeo(8.0, 8.0, 2.2, 0.8), mx, TOWN_Y + 4.8, mz, { tag: 'landmarks', col: '#b55632', pat: PAT.roof, ps: 1.4 });
    A(CYL, mx - 4.2, TOWN_Y + 9.0, mz, { ...LM_W, wall: true }, 0, 0, 0, [0.65, 17.5, 0.65]);
    A(CONE8, mx - 4.2, TOWN_Y + 19.8, mz, { tag: 'landmarks', col: '#4a7c5a', bleed: '#325a3f', wall: true }, 0, 0, 0, [0.78, 4.2, 0.78]);
  });

  // Pumpkin stall by Latinska ćuprija's south landing at (-44, TOWN_Y, 66.5) (stall = 'props'; pumpkins = 'bundeva')
  b.object(() => {
    const px = -44, pz = 66.5;
    box(3.2, 0.82, 1.3, px, TOWN_Y + 0.45, pz, { tag: 'props', col: '#7a5234', bleed: '#583820', pat: PAT.planks, ps: 3 });
    for (const sx of [-1.45, 1.45]) A(CYL, px + sx, TOWN_Y + 1.35, pz + 0.5, { tag: 'props', col: '#5c3c24', wall: true }, 0, 0, 0, [0.06, 2.5, 0.06]);
    box(3.5, 0.08, 1.6, px, TOWN_Y + 2.55, pz + 0.1, { tag: 'props', col: '#c9a67a' }, 0, -0.18, 0);
  });
  b.object(() => {
    const px = -44, pz = 66.5;
    const BN = { tag: 'bundeva', col: '#df6c20', bleed: '#b54a10', hull: true, orb: 'bundeva' };
    for (const [dx, dy, dz, r] of [[-0.95, 1.10, 0.1, 0.34], [-0.32, 1.14, -0.08, 0.38], [0.38, 1.12, 0.06, 0.36], [1.0, 1.08, -0.05, 0.32], [0.0, 1.56, 0.0, 0.30], [-1.9, 0.36, 0.3, 0.34]]) {
      A(SPHERE, px + dx, TOWN_Y + dy, pz + dz, BN, 0, 0, 0, [r, r * 0.76, r]);
      A(CYL, px + dx, TOWN_Y + dy + r * 0.78, pz + dz, { tag: 'bundeva', col: '#4e6330', solid: false }, 0, 0, 0.2, [0.04, 0.14, 0.04]);
    }
  });

  // Trebević & Far Mountains ('planina')
  b.object(() => {
    const PL = { tag: 'planina', col: '#8d7d5e', bleed: '#6e6249', hull: true, orb: 'planina' };
    // Trebević main forested mountain body behind south bank
    A(ICO2, 35, 12, 185, PL, 0, 0, 0, [120, 74, 92]);
    A(ICO2, -95, 8, 195, PL, 0, 0, 0, [115, 62, 85]);
    A(ICO2, 175, 14, 155, PL, 0, 0, 0, [110, 68, 82]);
    // Gentle playable lower slope rising behind Bistrik (solid so cable car sits naturally)
    box(250, 26, 70, 20, 14, 118, { ...PL, hull: false, ink: false }, 0, 0.42, 0);
    // Hum (WNW) with TV tower ('landmarks' finale) + Grdonj (N)
    A(ICO2, -230, 8, -95, { ...PL, solid: false }, 0, 0, 0, [95, 64, 82]);
    A(ICO2, 0, 10, -235, { ...PL, solid: false }, 0, 0, 0, [130, 62, 85]);
    A(ICO2, 180, 12, -165, { ...PL, solid: false }, 0, 0, 0, [105, 58, 80]);
  });
  // Hum TV tower ('landmarks' finale, silhouetted on western horizon)
  b.object(() => {
    A(CYL, -225, 82, -95, { tag: 'landmarks', col: '#d8d4cc', solid: false }, 0, 0, 0, [1.8, 36, 1.8]);
    A(CYL, -225, 92, -95, { tag: 'landmarks', col: '#d8d4cc', solid: false }, 0, 0, 0, [4.6, 3.2, 4.6]);
    A(CYL, -225, 106, -95, { tag: 'landmarks', col: '#c44632', solid: false }, 0, 0, 0, [0.45, 16, 0.45]);
  });

  // Trebević Autumn Forest ('suma'): close beech trees by cable car station + merged forest masses up the slope!
  b.object(() => {
    // Near autumn beeches right beside lower cable car station at (8, TOWN_Y, 82..88)
    for (const [tx, ty, tz, ts] of [[8, TOWN_Y, 83, 1.15], [3, TOWN_Y, 86, 1.0], [12, TOWN_Y, 87, 0.95], [6, TOWN_Y + 1.5, 91, 1.1]]) {
      const bc = pick(BEECH_C);
      A(TAPER, tx, ty + 1.8 * ts, tz, { tag: 'suma', col: '#5c402a', edge: 50, wall: true }, 0, 0, 0, [0.34 * ts, 3.6 * ts, 0.34 * ts]);
      A(ICO, tx, ty + 4.8 * ts, tz, { tag: 'suma', col: bc[0], bleed: bc[1], hull: true, orb: 'suma', sway: (v) => 0.028 * Math.max(0, v.y - ty - 3) }, 0, 0, 0, [2.4 * ts, 2.1 * ts, 2.4 * ts]);
    }
  });
  // Merged copper beech, russet oak, and dark fir forest masses climbing Trebević (low-poly, solid: false)
  // Sample exact height of the Trebević mountain domes + lower slope so every tree canopy sits proudly ON TOP of the hillside!
  b.object(() => {
    const mtnSurfaceY = (x, z) => {
      let y = TOWN_Y + Math.max(0, z - 85) * 0.44 + 10.0;
      for (const [mx, my, mz, rx, ry, rz] of [[35, 12, 185, 120, 74, 92], [-95, 8, 195, 115, 62, 85], [175, 14, 155, 110, 68, 82]]) {
        const q = ((x - mx) / rx) ** 2 + ((z - mz) / rz) ** 2;
        if (q < 0.98) y = Math.max(y, my + ry * Math.sqrt(Math.max(0, 1 - q)));
      }
      return y;
    };
    for (let i = 0; i < 34; i++) {
      const fx = -85 + (i % 9) * 23 + rr(-5, 5);
      const row = Math.floor(i / 9);
      const fz = 98 + row * 20 + rr(-4, 4);
      const fy = mtnSurfaceY(fx, fz);
      const isFir = i % 3 === 0;
      const fc = isFir ? FIR_C : pick(BEECH_C);
      const r = rr(7.0, 11.5);
      if (isFir) A(CONE8, fx, fy + r * 0.72, fz, { tag: 'suma', col: fc[0], bleed: fc[1], hull: true, solid: false }, 0, 0, 0, [r * 0.62, r * 1.55, r * 0.62]);
      else A(ICO, fx, fy + r * 0.52, fz, { tag: 'suma', col: fc[0], bleed: fc[1], hull: true, solid: false }, 0, 0, 0, [r, r * 0.74, r]);
    }
  });

  // Trebević Cable Car ('zicara'): lower Bistrik station -> 3 towers -> upper Vidikovac station + 6 moving cabins!
  const CABLE_A = V(20, TOWN_Y + 5.2, 78), CABLE_B = V(52, 66.0, 186);
  const cableDir = CABLE_B.clone().sub(CABLE_A), cableLen = cableDir.length();
  const cableYaw = Math.atan2(cableDir.x, cableDir.z), cablePitch = -Math.atan2(cableDir.y, Math.hypot(cableDir.x, cableDir.z));
  b.object(() => {
    const ZC = { tag: 'zicara', col: '#5a646e', bleed: '#3f474f', orb: 'zicara' };
    const ZG = { tag: 'zicara', col: '#8aa4b2', bleed: '#688290', orb: 'zicara' };
    const ZW = { tag: 'zicara', col: '#313d46', bleed: '#20282f', solid: false };
    const ZT = { tag: 'zicara', col: '#c29258', bleed: '#966d3c', solid: false };
    // Lower Bistrik glazed station at (20, TOWN_Y, 78) with front glass portal & timber fascia
    b.push(mat4(20, TOWN_Y, 78, cableYaw));
    box(9.5, 5.2, 8.2, 0, 2.6, 0, ZG);
    box(10.4, 0.55, 9.0, 0, 5.4, 0, ZC);
    box(9.8, 0.45, 0.25, 0, 4.85, -4.15, ZT);
    box(7.4, 2.8, 0.2, 0, 2.2, -4.12, ZW);
    box(2.4, 2.2, 0.24, 0, 1.1, -4.16, { tag: 'zicara', col: '#1f262c', solid: false });
    b.pop();
    // Upper Vidikovac station at (52, 61, 186)
    box(9.5, 5.2, 8.2, 52, 63.4, 186, ZG, cableYaw);
    box(10.2, 0.55, 8.8, 52, 66.2, 186, ZC, cableYaw);
    // 3 slim steel towers along the line
    for (const u of [0.25, 0.55, 0.82]) {
      const p = CABLE_A.clone().lerp(CABLE_B, u);
      const gy = sarajevoGroundY(p.x, p.z) - 2;
      const th = Math.max(8, p.y - gy + 1.5);
      box(0.8, th, 0.8, p.x, gy + th / 2, p.z, { ...ZC, wall: true }, cableYaw);
      box(5.2, 0.45, 0.5, p.x, p.y + 0.4, p.z, { ...ZC, wall: true }, cableYaw);
    }
    // Two parallel steel cables
    const perpX = Math.cos(cableYaw) * 1.9, perpZ = -Math.sin(cableYaw) * 1.9;
    for (const sd of [-1, 1]) {
      const mid = CABLE_A.clone().lerp(CABLE_B, 0.5);
      box(0.09, 0.09, cableLen, mid.x + perpX * sd, mid.y + 0.2, mid.z + perpZ * sd, { ...ZC, solid: false, ink: false }, cableYaw, cablePitch, 0);
    }
  });
  // 6 cable car cabins (graphite black + green + yellow + BiH blue-yellow), moving smoothly once alive!
  const cabins = [];
  {
    const zMat = washMat('zicara');
    const cabinSpecs = [
      [0.10, 1, '#2b2e32', '#1c1e22'],
      [0.36, 1, '#3a864e', '#266136'],    // Olympic green
      [0.68, 1, '#2b2e32', '#1c1e22'],
      [0.18, -1, '#e8bc28', '#c29816'],   // Olympic yellow
      [0.48, -1, '#24529e', '#e8bc28'],   // BiH blue & yellow
      [0.78, -1, '#2b2e32', '#1c1e22'],
    ];
    const perpX = Math.cos(cableYaw) * 1.9, perpZ = -Math.sin(cableYaw) * 1.9;
    for (const [u, sd, col, bl] of cabinSpecs) {
      const p = CABLE_A.clone().lerp(CABLE_B, u);
      p.x += perpX * sd; p.z += perpZ * sd;
      const g = new THREE.Group(); g.position.set(p.x, p.y - 1.5, p.z); g.rotation.y = cableYaw;
      const body = new THREE.Mesh(paintGeo(new THREE.BoxGeometry(1.75, 1.85, 2.0), { col, bleed: bl, seed: [20, TOWN_Y + 6, 78], radius: 145, dur: 4.0, hatch: 0.4 }), zMat);
      const hanger = new THREE.Mesh(paintGeo(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6), { col: '#3a3e42', seed: [20, TOWN_Y + 6, 78], radius: 145, dur: 4.0, hatch: 0 }), zMat);
      hanger.position.y = 1.45; addHull(body, 1.4); g.add(body, hanger); scene.add(g);
      cabins.push({ g, u, sd, perpX, perpZ });
    }
  }

  // ==================== 15. PEOPLE (30 FIGURES, AT MOST 4 HEADSCARVES) & ANIMALS ====================
  // Only the strolling woman wears a coat ('kaput'), only 2 men wear neck scarves ('sal')!
  people.push(
    // Baščaršija square
    { kind: 'sarCornSell', tag: 'prodavacica', x: 5.8, y: TOWN_Y + 0.08, z: 4.4, ry: -0.9, woman: true, scarfChoice: 'yes', scarfCol: '#b8563a', top: '#4f6d5c', lookUpOnClimax: true },
    { kind: 'sarFeed', tag: 'hraniti', x: -5.8, y: TOWN_Y + 0.08, z: 3.4, ry: 1.2, woman: true, sc: 0.68, scarfChoice: 'no', top: '#d46b42', lookUpOnClimax: true },
    { kind: 'sarSweep', tag: 'mesti', x: -13.0, y: TOWN_Y + 0.08, z: -5.0, ry: 0.9, top: '#5a6875', lookUpOnClimax: true },
    { kind: 'sarDrinkSpout', tag: 'zedan', x: -2.45, y: TOWN_Y + 0.68, z: 0.0, ry: Math.PI / 2, top: '#6d5846' },

    // Bazaar lanes
    { kind: 'sarHammer', tag: 'kazandzija', x: 23.2, y: TOWN_Y + 0.08, z: 13.7, ry: 0, top: '#594638' },
    { kind: 'sarCarry', tag: 'nositi', x: -23.5, y: TOWN_Y + 0.08, z: 6.2, to: [-15.0, 6.2], speed: 0.95, ry: Math.PI / 2, sc: 0.72, top: '#4a6b82' },

    // Morića han kahvana
    { kind: 'sarWaiter', tag: 'konobar', x: -45.5, y: TOWN_Y + 0.10, z: -4.2, ry: 0.5, top: '#e6dfd2', bottom: '#38383c', loop: [[-45.5, -4.2], [-42.0, -4.2], [-42.0, -7.4], [-45.5, -7.4]] },
    { kind: 'sarTalk', tag: 'razgovarati', x: -47.5, y: TOWN_Y + 0.10, z: -6.45, ry: 0, woman: true, scarfChoice: 'yes', scarfCol: '#c48d3a', top: '#6e4c5a', turn: 0 },
    { kind: 'sarTalk', tag: 'razgovarati', x: -47.5, y: TOWN_Y + 0.10, z: -4.55, ry: Math.PI, woman: true, scarfChoice: 'no', top: '#4a6e66', turn: 1 },

    // Quay, tram, chestnut stand & strolling couple
    { kind: 'sarDriver', tag: 'vozac', x: 20.1, y: TOWN_Y + 0.95, z: 35.5, ry: Math.PI / 2, top: '#364d68' },
    { kind: 'sarChestnutSell', tag: 'prodavac', x: 39.0, y: TOWN_Y + 0.08, z: 31.6, ry: 0, top: '#6b4d38' },
    { kind: 'sarBuy', tag: 'kupovati', x: 39.0, y: TOWN_Y + 0.08, z: 33.6, ry: Math.PI, sc: 0.72, top: '#b85a34' },
    { kind: 'walk', tag: 'setati', x: -34.0, y: TOWN_Y + 0.08, z: 33.4, to: [-20.0, 33.4], speed: 0.95, ry: Math.PI / 2, woman: true, scarfChoice: 'no', coatTag: 'kaput', coatCol: '#8a3d32', coatBleed: '#66281f' },
    { kind: 'walk', tag: 'setati', x: -34.0, y: TOWN_Y + 0.08, z: 32.3, to: [-20.0, 32.3], speed: 0.95, ry: Math.PI / 2, top: '#4a5a68', neckScarfTag: 'sal', neckScarfCol: '#c98e2c', neckScarfBleed: '#9e6b18' },

    // Tram stop umbrella woman (she is 'passerby' finale, closed umbrella is 'kisobran')
    { kind: 'sarUmbrellaWait', tag: 'passerby', x: 5.8, y: TOWN_Y + 0.08, z: -12.6, ry: 0.3, woman: true, scarfChoice: 'no', top: '#5a6b5e' },

    // West end giant chess & grandfather on bench
    { kind: 'sarChess', tag: 'igrati', x: -101.8, y: TOWN_Y + 0.10, z: 21.0, ry: -2.6, hairCol: '#bcb8b0', top: '#58626b', turn: 0 },
    { kind: 'sarChess', tag: 'igrati', x: -105.0, y: TOWN_Y + 0.10, z: 14.0, ry: 0.5, woman: true, sc: 0.86, scarfChoice: 'no', top: '#b85842', turn: 1 },
    { kind: 'sarReadBench', tag: 'djed', x: -96.55, y: TOWN_Y + 0.08, z: 17.5, ry: -Math.PI / 2, hairCol: '#c2beb6', top: '#685e52', neckScarfTag: 'sal', neckScarfCol: '#9e3e34', neckScarfBleed: '#752820' },

    // Mahala hill activities
    { kind: 'sarRoast', tag: 'peci', x: 4.5, y: 8.5 + 0.08, z: -29.5, ry: Math.PI, woman: true, scarfChoice: 'yes', scarfCol: '#8c5642', top: '#5d6e54' },
    { kind: 'sarPick', tag: 'brati', x: -5.4, y: 21.0 + 1.15, z: -74.9, ry: Math.PI, woman: true, scarfChoice: 'no', top: '#c46a38' },
    { kind: 'sarNana', tag: 'nana', x: 18.0, y: 21.0 + 2.95, z: -77.65, ry: 0, woman: true, scarfChoice: 'yes', scarfCol: '#c2b69e', top: '#6e5c52', hairCol: '#c4c0b8' },

    // Žuta tabija rim & painter
    { kind: 'sarRimSit', tag: 'gledati', x: 77.6, y: 30.0, z: -50.2, ry: -2.0, top: '#4a647a', point: true },
    { kind: 'sarRimSit', tag: 'gledati', x: 78.6, y: 30.0, z: -48.6, ry: -2.1, woman: true, scarfChoice: 'no', top: '#b86238', point: false },
    { kind: 'sarPaint', tag: 'slikarica', x: 85.4, y: 30.0, z: -46.3, ry: -1.9, woman: true, scarfChoice: 'no', top: '#6a5272' },

    // Passers-by coloured ONLY in the finale (6 figures across square, lanes, han, Ferhadija)
    { kind: 'walk', tag: 'passerby', x: -10.5, y: TOWN_Y + 0.08, z: 8.5, to: [8.5, 8.5], speed: 1.0, ry: Math.PI / 2, top: '#6a5646', lookUpOnClimax: true },
    { kind: 'walk', tag: 'passerby', x: 14.0, y: TOWN_Y + 0.08, z: 16.5, to: [32.0, 16.5], speed: 0.95, ry: Math.PI / 2, woman: true, scarfChoice: 'no', top: '#785a4a' },
    { kind: 'walk', tag: 'passerby', x: -34.0, y: TOWN_Y + 0.08, z: 3.5, to: [-56.0, 3.5], speed: 1.05, ry: -Math.PI / 2, top: '#4e5d4e' },
    { kind: 'walk', tag: 'passerby', x: -94.0, y: TOWN_Y + 0.08, z: 4.5, to: [-112.0, 4.5], speed: 1.0, ry: -Math.PI / 2, woman: true, scarfChoice: 'no', top: '#8c6244' },
    { kind: 'sit', tag: 'passerby', x: -40.2, y: TOWN_Y + 0.10, z: -5.9, ry: 0, top: '#5a4e42' },
    { kind: 'walk', tag: 'passerby', x: 10.0, y: TOWN_Y + 0.08, z: -6.0, to: [-8.0, -6.0], speed: 0.95, ry: -Math.PI / 2, top: '#546674', lookUpOnClimax: true },
  );

  // Wildlife: 10 square pigeons ('jato'), 3 Miljacka ducks ('patke'), squirrel ('vjeverica'), kitten ('mace')
  const pigeons = { x: -3.5, y: TOWN_Y + 0.08, z: 3.8, fx: 7.5, fz: -6.5, fh: 7.5, count: 10, spread: 2.0, tag: 'jato' };
  const ducks = [
    { tag: 'patke', x: 26.5, y: 0, z: 49.5, ry: 0.6, r: 2.0 },
    { tag: 'patke', x: 29.2, y: 0, z: 51.4, ry: -0.9, r: 1.6 },
    { tag: 'patke', x: 27.4, y: 0, z: 52.8, ry: 2.1, r: 1.8 },
  ];
  const squirrel = { tag: 'vjeverica', x: 30.8, y: 14.5 + 3.0, z: -52.0, ry: 1.2, span: 1.1 };
  const kitten = { tag: 'mace', x: 16.2, y: 21.0 + 0.08, z: -72.8, ry: 0.6 };

  // ==================== 16. ALL 78 ORBS, GATES & CAMERAS ====================
  // Zone 1: Baščaršija square & Sebilj (8)
  orbs.push({
    id: 'sebilj', focus: V(0, TOWN_Y + 4.0, 0), size: 4.8, tags: ['sebilj'], shot: 'close',
    at: V(0, TOWN_Y + 3.0, 2.5), stage: 0,
    near: { p: [0, TOWN_Y + 0.72, 2.5], r: 3.6 },
    view: { from: [-9.5, TOWN_Y + 5.2, 11.5], to: [-6.0, TOWN_Y + 5.8, 12.2], look: [0, TOWN_Y + 3.8, 0] },
  });
  orb('trg', [1, TOWN_Y + 0.2, 2], 8, ['trg'], 'combo', TOWN_Y + 0.2, {
    at: V(8.5, TOWN_Y + 2.1, 7.5), near: { p: [8.5, TOWN_Y + 0.2, 7.5], r: 4.5 },
    wideView: { from: [-24, TOWN_Y + 18, 22], to: [24, TOWN_Y + 20, 18], look: [0, TOWN_Y + 1.5, 1], lookTo: [2, TOWN_Y + 1.0, 0] },
  });
  orb('jato', [-3.5, TOWN_Y + 0.4, 3.8], 2.4, ['jato'], 'close', TOWN_Y + 0.2, { near: { p: [-3.5, TOWN_Y + 0.2, 3.8], r: 3.4 }, front: 0.4 });
  orb('hraniti', [-5.8, TOWN_Y + 0.9, 3.4], 1.6, ['hraniti'], 'close', TOWN_Y + 1.6, { requires: ['jato'], near: { p: [-5.8, TOWN_Y + 0.2, 3.4], r: 3.2 } });
  orb('kukuruz', [5.2, TOWN_Y + 1.2, 5.2], 1.6, ['kukuruz'], 'close', TOWN_Y + 1.3, { near: { p: [5.2, TOWN_Y + 0.3, 5.2], r: 3.2 }, front: -0.6 });
  orb('prodavacica', [5.8, TOWN_Y + 1.1, 4.4], 1.6, ['prodavacica'], 'close', TOWN_Y + 2.1, { requires: ['kukuruz'], near: { p: [5.8, TOWN_Y + 0.3, 4.4], r: 3.2 } });
  orb('mesti', [-13.0, TOWN_Y + 1.1, -5.0], 1.8, ['mesti'], 'close', TOWN_Y + 2.1, { near: { p: [-13.0, TOWN_Y + 0.3, -5.0], r: 3.2 } });
  orb('zedan', [-2.45, TOWN_Y + 1.5, 0.0], 1.6, ['zedan'], 'close', TOWN_Y + 2.4, { near: { p: [-2.8, TOWN_Y + 0.7, 0.0], r: 3.2 }, front: -1.1 });

  // Zone 2: The bazaar lanes (10)
  orb('carsija', [18, TOWN_Y + 1.5, 17], 8, ['carsija'], 'combo', TOWN_Y + 0.2, {
    at: V(15.5, TOWN_Y + 2.1, 17.0), near: { p: [15.5, TOWN_Y + 0.2, 17.0], r: 4.0 },
    wideView: { from: [46, TOWN_Y + 15, 22], to: [12, TOWN_Y + 18, 28], look: [20, TOWN_Y + 2.0, 17], lookTo: [-12, TOWN_Y + 2.0, 10] },
  });
  orb('kazandzija', [23.2, TOWN_Y + 1.0, 13.9], 1.8, ['kazandzija'], 'close', TOWN_Y + 2.0, {
    near: { p: [23.2, TOWN_Y + 0.2, 15.0], r: 3.4 },
    view: { from: [21.2, TOWN_Y + 2.2, 17.6], to: [24.8, TOWN_Y + 2.3, 17.4], look: [23.2, TOWN_Y + 1.0, 13.9] },
  });
  orb('bakar', [23.2, TOWN_Y + 1.0, 13.7], 2.2, ['bakar'], 'combo', TOWN_Y + 1.4, {
    at: V(26.2, TOWN_Y + 2.1, 15.2), near: { p: [26.2, TOWN_Y + 0.2, 15.2], r: 3.5 },
    view: { from: [25.6, TOWN_Y + 2.1, 17.5], to: [22.4, TOWN_Y + 2.2, 17.5], look: [23.2, TOWN_Y + 1.0, 13.7] },
    second: { view: { from: [26.5, TOWN_Y + 2.4, 17.2], to: [35.5, TOWN_Y + 2.4, 17.0], look: [31.5, TOWN_Y + 1.2, 14.2] } },
  });
  orb('pekara', [-26, TOWN_Y + 2.0, 9.5], 3.5, ['pekara'], 'close', TOWN_Y + 4.8, {
    at: V(-26, TOWN_Y + 2.2, 6.2), near: { p: [-26, TOWN_Y + 0.2, 6.2], r: 3.6 },
    view: { from: [-29.2, TOWN_Y + 2.8, 3.0], to: [-23.0, TOWN_Y + 3.0, 3.0], look: [-26, TOWN_Y + 2.0, 8.6] },
  });
  orb('somun', [-26, TOWN_Y + 0.9, 7.7], 1.5, ['somun'], 'close', TOWN_Y + 1.3, {
    requires: ['pekara'], near: { p: [-26, TOWN_Y + 0.2, 6.6], r: 3.4 },
    view: { from: [-27.8, TOWN_Y + 2.0, 5.2], to: [-24.4, TOWN_Y + 2.0, 5.2], look: [-26.0, TOWN_Y + 0.85, 7.7] },
  });
  orb('nositi', [-23.5, TOWN_Y + 1.0, 6.2], 1.6, ['nositi'], 'close', TOWN_Y + 1.8, { requires: ['pekara'], near: { p: [-23.5, TOWN_Y + 0.2, 6.2], r: 3.4 }, front: -0.4 });
  orb('burek', [23.5, TOWN_Y + 0.9, 29.5], 1.4, ['burek'], 'close', TOWN_Y + 1.5, {
    at: V(23.5, TOWN_Y + 2.1, 28.0), near: { p: [23.5, TOWN_Y + 0.2, 28.0], r: 3.4 },
    view: { from: [21.6, TOWN_Y + 2.1, 26.2], to: [25.2, TOWN_Y + 2.1, 26.2], look: [23.5, TOWN_Y + 0.9, 29.5] },
  });
  orb('cevapi', [16.0, TOWN_Y + 1.2, 29.5], 2.0, ['cevapi'], 'close', TOWN_Y + 1.8, {
    at: V(16.0, TOWN_Y + 2.1, 28.0), near: { p: [16.0, TOWN_Y + 0.2, 28.0], r: 3.5 },
    view: { from: [13.5, TOWN_Y + 2.4, 25.5], to: [18.5, TOWN_Y + 2.4, 25.5], look: [16.0, TOWN_Y + 1.5, 29.5] },
  });
  orb('slasticarna', [-26, TOWN_Y + 2.0, -2.0], 3.5, ['slasticarna'], 'close', TOWN_Y + 4.8, {
    at: V(-26, TOWN_Y + 2.2, 1.8), near: { p: [-26, TOWN_Y + 0.2, 1.8], r: 3.6 },
    view: { from: [-29.2, TOWN_Y + 2.8, 4.8], to: [-23.0, TOWN_Y + 3.0, 4.8], look: [-26, TOWN_Y + 2.0, -1.2] },
  });
  orb('baklava', [-26, TOWN_Y + 0.9, -0.15], 1.4, ['baklava'], 'close', TOWN_Y + 1.4, {
    requires: ['slasticarna'], at: V(-26, TOWN_Y + 2.1, 1.2), near: { p: [-26, TOWN_Y + 0.2, 1.2], r: 3.4 },
    view: { from: [-27.6, TOWN_Y + 2.0, 2.4], to: [-24.4, TOWN_Y + 2.0, 2.4], look: [-26, TOWN_Y + 0.85, -0.15] },
  });

  // Zone 3: Morića han & kahvana (6)
  orb('han', [-44, TOWN_Y + 3.0, -5.5], 10, ['han'], 'combo', TOWN_Y + 6.5, {
    at: V(-44, TOWN_Y + 2.4, -2.2), near: { p: [-44, TOWN_Y + 0.2, -2.2], r: 4.0 },
    view: { from: [-44, TOWN_Y + 16, 8], to: [-36, TOWN_Y + 15, 6], look: [-44, TOWN_Y + 2.0, -5.5] },
    wideView: { from: [-34, TOWN_Y + 18, 12], to: [-54, TOWN_Y + 18, 12], look: [-44, TOWN_Y + 2.5, -5.5], lookTo: [-44, TOWN_Y + 2.5, -5.5] },
  });
  orb('kahvana', [-44, TOWN_Y + 1.2, -7.2], 4.2, ['kahvana'], 'close', TOWN_Y + 2.2, {
    at: V(-44, TOWN_Y + 2.2, -7.2), near: { p: [-44, TOWN_Y + 0.2, -7.2], r: 3.6 },
    view: { from: [-49.5, TOWN_Y + 3.6, -2.2], to: [-38.5, TOWN_Y + 3.6, -2.2], look: [-44, TOWN_Y + 1.2, -7.2] },
  });
  orb('konobar', [-45.5, TOWN_Y + 1.1, -4.2], 1.6, ['konobar'], 'close', TOWN_Y + 2.1, { near: { p: [-45.5, TOWN_Y + 0.2, -4.2], r: 3.2 } });
  orb('dzezva', [-43.9, TOWN_Y + 0.82, -6.2], 1.2, ['dzezva'], 'close', TOWN_Y + 1.2, {
    requires: ['kahvana'], near: { p: [-43.8, TOWN_Y + 0.2, -6.2], r: 3.2 },
    view: { from: [-44.8, TOWN_Y + 2.0, -5.0], to: [-42.8, TOWN_Y + 2.0, -5.0], look: [-43.9, TOWN_Y + 0.82, -6.2] },
  });
  orb('kahva', [-43.8, TOWN_Y + 0.82, -6.2], 1.4, ['kahva'], 'combo', TOWN_Y + 1.4, {
    requires: ['kahvana'], at: V(-40.2, TOWN_Y + 2.1, -5.0), near: { p: [-40.2, TOWN_Y + 0.2, -5.0], r: 3.2 },
    view: { from: [-38.4, TOWN_Y + 1.85, -3.5], to: [-41.6, TOWN_Y + 1.85, -3.5], look: [-40.2, TOWN_Y + 0.82, -5.0] },
    groups: [
      { focus: [-43.8, TOWN_Y + 0.82, -6.2], size: 1.3, view: { from: [-42.4, TOWN_Y + 1.8, -4.6], to: [-45.0, TOWN_Y + 1.8, -4.6], look: [-43.8, TOWN_Y + 0.82, -6.2] } },
      { focus: [-47.5, TOWN_Y + 0.82, -5.5], size: 1.3, view: { from: [-46.0, TOWN_Y + 1.8, -3.9], to: [-48.8, TOWN_Y + 1.8, -3.9], look: [-47.5, TOWN_Y + 0.82, -5.5] } },
    ],
    groupPaint: true,
  });
  orb('razgovarati', [-47.5, TOWN_Y + 1.0, -5.5], 2.0, ['razgovarati'], 'close', TOWN_Y + 1.9, {
    near: { p: [-47.5, TOWN_Y + 0.2, -5.5], r: 3.4 },
    view: { from: [-44.6, TOWN_Y + 2.3, -3.4], to: [-44.6, TOWN_Y + 2.3, -7.4], look: [-47.5, TOWN_Y + 1.0, -5.5] },
  });

  // Zone 4: Gazi Husrev-beg & Brusa bezistan (2)
  orb('kupola', [-42, TOWN_Y + 6.8, 20], 7.5, ['kupola'], 'combo', TOWN_Y + 8.0, {
    at: V(-42, TOWN_Y + 9.2, 20), near: { p: [-42, TOWN_Y + 5.7, 20], r: 6.0 },
    wideView: { from: [-30, TOWN_Y + 26, 46], to: [-62, TOWN_Y + 28, 42], look: [-42, TOWN_Y + 7, 20], lookTo: [-68, TOWN_Y + 11, 22] },
  });
  orb('sadrvan', [SAD_POS.x, TOWN_Y + 2.5, SAD_POS.z], 3.8, ['sadrvan'], 'close', TOWN_Y + 0.2, {
    at: V(SAD_POS.x, TOWN_Y + 2.2, SAD_POS.z - 3.6), near: { p: [SAD_POS.x, TOWN_Y + 0.2, SAD_POS.z - 3.6], r: 4.5 },
    view: { from: [SAD_POS.x - 5.5, TOWN_Y + 4.4, SAD_POS.z - 6.8], to: [SAD_POS.x + 5.5, TOWN_Y + 4.4, SAD_POS.z - 6.8], look: [SAD_POS.x, TOWN_Y + 2.5, SAD_POS.z] },
  });

  // Zone 5: Miljacka & quays (14)
  orb('voda', [0, 0.2, 51], 14, ['voda'], 'combo', 0.2, {
    at: V(-4, 2.2, 51), swim: { p: [-4, 0, 51], r: 10.0 },
    view: { from: [12, 4.5, 55], to: [-14, 5.2, 55], look: [-4, 0.2, 51] },
    wideView: { from: [48, 8.5, 52], to: [-58, 9.5, 52], look: [12, 0.4, 51], lookTo: [-46, 0.4, 51] },
  });
  orb('cuprija', [-54, 4.8, 51], 9.5, ['cuprija'], 'combo', 6.0, {
    at: V(-54, 7.6, 51), near: { p: [-54, 5.8, 51], r: 5.0 },
    view: { from: [-36, 9.0, 55], to: [-38, 10.5, 46], look: [-54, 4.5, 51] },
    second: { view: { from: [58, 9.5, 56], to: [60, 10.5, 45], look: [76, 4.5, 51] } },
  });
  orb('jablan', [20, TOWN_Y + 7.5, 38.4], 5.5, ['jablan'], 'combo', TOWN_Y + 13.5, {
    at: V(20, TOWN_Y + 16.5, 38.4), near: { p: [20, TOWN_Y + 0.4, 36.2], r: 4.5 },
    wideView: { from: [42, TOWN_Y + 22, 66], to: [-30, TOWN_Y + 24, 62], look: [16, TOWN_Y + 8, 38], lookTo: [0, TOWN_Y + 8, 12] },
  });
  orb('vijecnica', [58, TOWN_Y + 8.0, 20], 14.0, ['vijecnica'], 'combo', TOWN_Y + 16.5, {
    at: V(58, TOWN_Y + 2.4, 31.8), near: { p: [58, TOWN_Y + 0.4, 31.8], r: 5.5 },
    view: { from: [58, TOWN_Y + 12, 52], to: [72, TOWN_Y + 13, 46], look: [58, TOWN_Y + 7.5, 20] },
    wideView: { from: [82, TOWN_Y + 24, 52], to: [38, TOWN_Y + 22, 56], look: [58, TOWN_Y + 7, 20], lookTo: [58, TOWN_Y + 7, 20] },
  });
  orb('inat', [76, TOWN_Y + 3.5, 70], 6.5, ['inat'], 'close', TOWN_Y + 8.2, {
    at: V(76, TOWN_Y + 2.4, 63.8), near: { p: [76, TOWN_Y + 0.4, 63.8], r: 4.5 },
    view: { from: [65, TOWN_Y + 5.5, 53], to: [84, TOWN_Y + 6.0, 53], look: [76, TOWN_Y + 3.5, 70] },
  });
  orb('kesteni', [39.0, TOWN_Y + 1.15, 32.5], 1.5, ['kesteni'], 'close', TOWN_Y + 1.5, { near: { p: [39.0, TOWN_Y + 0.3, 33.4], r: 3.4 }, front: 0 });
  orb('prodavac', [39.0, TOWN_Y + 1.1, 31.6], 1.6, ['prodavac'], 'close', TOWN_Y + 2.1, { requires: ['kesteni'], near: { p: [39.0, TOWN_Y + 0.3, 33.0], r: 3.6 } });
  orb('kupovati', [39.0, TOWN_Y + 0.9, 33.6], 1.6, ['kupovati'], 'close', TOWN_Y + 1.9, { requires: ['kesteni'], near: { p: [39.0, TOWN_Y + 0.3, 34.0], r: 3.4 }, front: 0.7 });
  orb('tramvaj', [12, TOWN_Y + 1.8, 35.5], 8.0, ['tramvaj'], 'close', TOWN_Y + 3.4, {
    at: V(12, TOWN_Y + 5.4, 35.5), near: { p: [12, TOWN_Y + 3.4, 35.5], r: 6.5 },
    view: { from: [24, TOWN_Y + 6.5, 52], to: [4, TOWN_Y + 6.5, 52], look: [12, TOWN_Y + 1.9, 35.5] },
  });
  orb('vozac', [20.1, TOWN_Y + 1.85, 35.5], 1.5, ['vozac'], 'close', TOWN_Y + 3.4, {
    requires: ['tramvaj'], at: V(21.2, TOWN_Y + 2.6, 35.5), near: { p: [21.2, TOWN_Y + 0.5, 35.5], r: 4.5 },
    view: { from: [24.2, TOWN_Y + 2.5, 38.6], to: [24.6, TOWN_Y + 2.5, 36.2], look: [20.1, TOWN_Y + 1.9, 35.5] },
  });
  orb('patke', [27.5, 0.3, 51.0], 2.6, ['patke'], 'close', 0.4, {
    at: V(27.5, 2.2, 51.0), swim: { p: [27.5, 0, 51.0], r: 6.0 },
    view: { from: [23.5, 3.2, 55.5], to: [31.5, 3.2, 55.5], look: [27.5, 0.25, 51.0] },
  });
  orb('setati', [-34.0, TOWN_Y + 1.1, 32.85], 2.0, ['setati'], 'close', TOWN_Y + 2.1, { near: { p: [-34.0, TOWN_Y + 0.2, 32.85], r: 3.6 }, front: 0.4 });
  orb('kaput', [-34.0, TOWN_Y + 1.0, 33.4], 1.4, ['kaput'], 'close', TOWN_Y + 2.1, { requires: ['setati'], near: { p: [-34.0, TOWN_Y + 0.2, 33.6], r: 3.4 }, front: 0.3 });
  orb('sal', [-34.0, TOWN_Y + 1.55, 32.3], 1.2, ['sal'], 'combo', TOWN_Y + 2.1, {
    requires: ['setati'], near: { p: [-34.0, TOWN_Y + 0.2, 32.1], r: 3.4 },
    view: { from: [-32.2, TOWN_Y + 2.0, 34.4], to: [-31.8, TOWN_Y + 2.0, 31.4], look: [-34.0, TOWN_Y + 1.5, 32.3] },
    second: { view: { from: [-98.6, TOWN_Y + 1.8, 18.8], to: [-98.6, TOWN_Y + 1.8, 16.2], look: [-96.55, TOWN_Y + 1.25, 17.5] } },
  });

  // Zone 6: Back street, Ferhadija & west end (10)
  orb('sine', [-20, TOWN_Y + 0.15, -15.0], 10, ['sine'], 'combo', TOWN_Y + 0.2, {
    at: V(-20, TOWN_Y + 2.1, -15.0), near: { p: [-20, TOWN_Y + 0.2, -15.0], r: 4.5 },
    wideView: { from: [24, TOWN_Y + 11, -14], to: [-92, TOWN_Y + 13, -12], look: [-24, TOWN_Y + 0.3, -15], lookTo: [-106, TOWN_Y + 0.3, -15] },
  });
  orb('kisobran', [5.6, TOWN_Y + 0.9, -12.4], 1.4, ['kisobran'], 'close', TOWN_Y + 1.8, { near: { p: [5.8, TOWN_Y + 0.2, -12.6], r: 3.2 }, front: 0.4 });
  orb('crkva', [-46, TOWN_Y + 4.5, -24.5], 9.0, ['crkva'], 'close', TOWN_Y + 0.2, {
    at: V(-46, TOWN_Y + 2.4, -16.5), near: { p: [-46, TOWN_Y + 0.2, -16.5], r: 4.5 },
    view: { from: [-36, TOWN_Y + 9.0, -8.0], to: [-56, TOWN_Y + 9.5, -8.5], look: [-47, TOWN_Y + 5.0, -24.0] },
  });
  orb('sinagoga', [-82, TOWN_Y + 4.5, -6.0], 7.0, ['sinagoga'], 'close', TOWN_Y + 0.2, {
    at: V(-82, TOWN_Y + 2.4, -14.8), near: { p: [-82, TOWN_Y + 0.2, -14.8], r: 4.5 },
    view: { from: [-74, TOWN_Y + 7.5, -19.5], to: [-90, TOWN_Y + 7.5, -19.5], look: [-82, TOWN_Y + 4.5, -6.0] },
  });
  orb('katedrala', [-104, TOWN_Y + 8.0, -3.0], 11.0, ['katedrala'], 'close', TOWN_Y + 0.2, {
    at: V(-104, TOWN_Y + 2.5, 4.5), near: { p: [-104, TOWN_Y + 0.2, 4.5], r: 4.5 },
    view: { from: [-104, TOWN_Y + 9.5, 22.0], to: [-96, TOWN_Y + 11.0, 20.0], look: [-104, TOWN_Y + 8.5, -2.0] },
  });
  orb('dva', [-104, TOWN_Y + 17.5, 0.2], 9.5, ['dva'], 'close', TOWN_Y + 0.2, {
    requires: ['katedrala'], at: V(-104, TOWN_Y + 2.5, 6.8), near: { p: [-104, TOWN_Y + 0.2, 6.8], r: 4.5 },
    view: { from: [-104, TOWN_Y + 9.0, 24.0], to: [-104, TOWN_Y + 14.0, 22.0], look: [-104, TOWN_Y + 19.0, 0.2] },
  });
  orb('sah', [-103.5, TOWN_Y + 0.6, 17.5], 3.8, ['sah'], 'close', TOWN_Y + 0.4, { near: { p: [-103.5, TOWN_Y + 0.2, 17.5], r: 4.5 }, front: 0.4 });
  orb('igrati', [-103.5, TOWN_Y + 1.1, 17.5], 3.8, ['igrati'], 'close', TOWN_Y + 2.0, {
    requires: ['sah'], at: V(-101.8, TOWN_Y + 2.3, 21.0), near: { p: [-101.8, TOWN_Y + 0.2, 21.0], r: 4.0 },
    view: { from: [-96.8, TOWN_Y + 4.4, 24.5], to: [-109.5, TOWN_Y + 4.4, 23.5], look: [-103.5, TOWN_Y + 1.0, 17.5] },
  });
  orb('djed', [-96.55, TOWN_Y + 1.0, 17.5], 1.6, ['djed'], 'close', TOWN_Y + 1.9, { near: { p: [-97.4, TOWN_Y + 0.2, 17.5], r: 3.4 }, front: -Math.PI / 2 });
  orb('novine', [-97.0, TOWN_Y + 1.05, 17.5], 1.2, ['novine'], 'close', TOWN_Y + 1.8, {
    requires: ['djed'], near: { p: [-97.6, TOWN_Y + 0.2, 17.5], r: 3.4 },
    view: { from: [-98.8, TOWN_Y + 1.85, 18.8], to: [-98.8, TOWN_Y + 1.85, 16.2], look: [-97.0, TOWN_Y + 1.05, 17.5] },
  });

  // Zone 7: The mahala hill (19)
  orb('brdo', [10, 14.5, -50], 18, ['brdo'], 'combo', 14.5, {
    at: V(-2, 16.5, -45), near: { p: [-2, 14.5, -45], r: 4.5 },
    wideView: { from: [20, 26, 42], to: [10, 38, 12], look: [14, 14, -42], lookTo: [36, 22, -62] },
  });
  orb('lisce', [26, 8.7, -24], 4.5, ['lisce'], 'combo', 8.7, {
    at: V(26, 10.6, -24), near: { p: [26, 8.6, -24], r: 4.0 },
    wideView: { from: [36, 18, -10], to: [14, 19, -2], look: [24, 8.6, -24], lookTo: [4, TOWN_Y + 0.5, -4] },
  });
  orb('mahala', [8, 15.0, -56], 16, ['mahala'], 'combo', 14.5, {
    at: V(18, 16.5, -47), near: { p: [18, 14.6, -47], r: 4.5 },
    wideView: { from: [12, 22, 10], to: [30, 34, -14], look: [10, 14, -46], lookTo: [18, 21, -76] },
  });
  orb('strma', [50, 17.0, -30], 9.0, ['strma'], 'close', 17.5, {
    at: V(48, 18.5, -29), near: { p: [48, 16.0, -29], r: 4.5 },
    view: { from: [74, 34.5, -46], to: [64, 31.0, -39], look: [36, 10.0, -20] },
  });
  orb('lipa', [19.5, 8.5 + 4.8, -28], 4.2, ['lipa'], 'close', 8.5 + 7.5, {
    at: V(19.5, 8.5 + 2.4, -24.0), near: { p: [19.5, 8.6, -24.0], r: 4.2 },
    view: { from: [14, 14.5, -16], to: [25, 14.5, -16], look: [19.5, 13.0, -28] },
  });
  orb('avlija', [6, 8.5 + 1.2, -30], 5.5, ['avlija'], 'combo', 8.5 + 2.2, {
    at: V(6, 8.5 + 2.2, -28.0), near: { p: [6, 8.6, -28.0], r: 4.2 },
    wideView: { from: [6, 22, -16], to: [18, 30, -32], look: [6, 9.5, -30], lookTo: [12, 16.0, -54] },
  });
  orb('kapija', [6, 8.5 + 1.2, -26.2], 2.0, ['kapija'], 'close', 8.5 + 2.4, {
    requires: ['avlija'], at: V(6, 8.5 + 2.2, -25.0), near: { p: [6, 8.6, -25.0], r: 3.6 }, front: 0,
  });
  orb('paprike', [4.5, 8.5 + 1.0, -30.5], 1.6, ['paprike'], 'close', 8.5 + 1.5, { near: { p: [4.5, 8.6, -30.5], r: 3.4 }, front: 0.4 });
  orb('peci', [4.5, 8.5 + 1.1, -29.5], 1.6, ['peci'], 'close', 8.5 + 2.1, { requires: ['paprike'], near: { p: [4.5, 8.6, -29.0], r: 3.4 }, front: 0.6 });
  orb('dunja', [-10.5, 14.5 + 2.6, -52.5], 2.8, ['dunja'], 'close', 14.5 + 4.0, {
    at: V(-10.5, 14.5 + 2.3, -49.5), near: { p: [-10.5, 14.6, -49.5], r: 3.8 }, front: 0.3,
  });
  orb('grozdje', [10, 14.5 + 2.4, -52], 2.4, ['grozdje'], 'close', 14.5 + 2.9, { near: { p: [10, 14.6, -52], r: 3.8 }, front: 0 });
  orb('orah', [29.5, 14.5 + 3.8, -52.5], 3.8, ['orah'], 'close', 14.5 + 6.5, {
    at: V(29.5, 14.5 + 2.3, -49.5), near: { p: [29.5, 14.6, -49.5], r: 4.0 }, front: 0.2,
  });
  orb('vjeverica', [30.8, 14.5 + 3.15, -52.0], 1.2, ['vjeverica'], 'close', 14.5 + 3.4, {
    requires: ['orah'], near: { p: [30.8, 14.5 + 3.0, -52.0], r: 3.6 },
    view: { from: [32.8, 14.5 + 4.1, -49.8], to: [30.0, 14.5 + 4.0, -49.4], look: [30.8, 14.5 + 3.15, -52.0] },
  });
  orb('jabuka', [-6, 21.0 + 3.0, -76.8], 3.2, ['jabuka'], 'close', 21.0 + 5.2, {
    at: V(-6, 21.0 + 2.3, -73.6), near: { p: [-6, 21.1, -73.6], r: 3.8 }, front: 0,
  });
  orb('merdevine', [-5.4, 21.0 + 1.6, -74.9], 2.0, ['merdevine'], 'close', 21.0 + 3.2, { requires: ['jabuka'], near: { p: [-5.4, 21.1, -74.0], r: 3.4 }, front: 0.5 });
  orb('brati', [-5.4, 21.0 + 2.2, -74.9], 1.8, ['brati'], 'close', 21.0 + 3.6, { requires: ['jabuka'], near: { p: [-5.4, 21.1, -74.0], r: 3.6 }, front: 0.7 });
  orb('stara', [18, 21.0 + 3.8, -81.5], 6.0, ['stara'], 'close', 21.0 + 8.4, {
    at: V(18, 21.0 + 2.4, -76.0), near: { p: [18, 21.1, -76.0], r: 4.5 },
    view: { from: [12, 26.5, -68.5], to: [24, 26.5, -68.5], look: [18, 24.5, -81.0] },
  });
  orb('nana', [18, 21.0 + 4.5, -77.1], 1.6, ['nana'], 'close', 21.0 + 4.8, {
    requires: ['stara'], at: V(18, 21.0 + 5.2, -76.3), near: { p: [18, 21.0 + 4.0, -76.3], r: 3.6 },
    view: { from: [16.2, 21.0 + 5.0, -73.2], to: [19.8, 21.0 + 5.0, -73.2], look: [18, 21.0 + 4.55, -77.1] },
  });
  orb('mace', [16.2, 21.0 + 0.35, -72.8], 1.2, ['mace'], 'close', 21.0 + 0.6, { near: { p: [16.2, 21.1, -72.8], r: 3.2 }, front: 0.5 });

  // Zone 8: Žuta tabija & Vratnik wall (5)
  orb('bedem', [75, 30.0, -78], 12.0, ['bedem'], 'combo', 31.8, {
    at: V(76, 33.4, -76), near: { p: [76, 31.6, -76], r: 5.5 },
    wideView: { from: [54, 42, -62], to: [48, 40, -96], look: [78, 30, -72], lookTo: [68, 29, -90] },
  });
  orb('javor', [95, 34.5, -48], 4.2, ['javor'], 'combo', 36.5, {
    at: V(92, 32.2, -49), near: { p: [92, 30.1, -49], r: 4.5 },
    wideView: { from: [74, 42, -36], to: [104, 44, -40], look: [92, 34, -54], lookTo: [88, 34, -58] },
  });
  orb('gledati', [78.1, 30.9, -49.4], 2.2, ['gledati'], 'close', 31.8, { near: { p: [78.5, 30.1, -49.4], r: 3.8 }, front: -2.0 });
  orb('slikarica', [85.0, 31.1, -46.5], 2.0, ['slikarica'], 'close', 32.0, { near: { p: [85.4, 30.1, -46.3], r: 3.6 }, front: -1.2 });
  // Stage 2 (LAST WORD): 'zuta' on Žuta tabija
  orb('zuta', [88, 30.0, -54], 14.0, ['zuta'], 'combo', 30.5, {
    stage: 2, at: V(84, 32.4, -54), near: { p: [84, 30.1, -54], r: 6.5 },
    view: { from: [64, 34.0, -34], to: [68, 36.0, -68], look: [88, 29.0, -54] },
    wideView: { from: [106, 44, -62], to: [94, 40, -44], look: [86, 30, -54], lookTo: [10, 12, 10] },
  });

  // Zone 9: South bank & Trebević (4)
  orb('bundeva', [-44, TOWN_Y + 1.1, 66.5], 2.0, ['bundeva'], 'close', TOWN_Y + 1.8, { near: { p: [-44, TOWN_Y + 0.2, 65.2], r: 3.6 }, front: Math.PI });
  orb('zicara', [20, TOWN_Y + 4.0, 78], 8.0, ['zicara'], 'combo', TOWN_Y + 6.0, {
    at: V(20, TOWN_Y + 7.5, 78), near: { p: [20, TOWN_Y + 5.6, 78], r: 5.5 },
    wideView: { from: [0, 26, 70], to: [12, 66, 108], look: [24, 14, 92], lookTo: [46, 56, 174] },
  });
  orb('suma', [8, TOWN_Y + 4.5, 84], 5.5, ['suma'], 'combo', TOWN_Y + 6.8, {
    at: V(8, TOWN_Y + 2.4, 79.5), near: { p: [8, TOWN_Y + 0.2, 79.5], r: 4.5 },
    view: { from: [-2, TOWN_Y + 7.0, 72], to: [14, TOWN_Y + 7.5, 72], look: [7, TOWN_Y + 4.5, 85] },
    second: { view: { from: [-10, 34, 60], to: [30, 48, 76], look: [16, 26, 132], lookTo: [34, 42, 152] } },
  });
  orb('planina', [25, 42, 155], 38, ['planina'], 'combo', 42, {
    sky: false, at: V(-6, TOWN_Y + 2.4, 72), near: { p: [-6, TOWN_Y + 0.2, 72], r: 4.5 },
    view: { from: [-6, 16, 56], to: [8, 22, 60], look: [25, 36, 155] },
    wideView: { from: [80, 56, -40], to: [-60, 54, -20], look: [20, 34, 155], lookTo: [-40, 28, 170] },
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
    pigeons,
    ducks,
    squirrel,
    kitten,
    smoke,
    fountain: SAD_POS,
    fountainTag: 'sadrvan',
    start: V(-6.5, TOWN_Y + 0.08, 9.5),
    fleur: V(86, 48, -52),
    sunPos,
    movers: [],
    // Sarajevo-specific handles for sarajevo.js update/onWake/finale
    tram: { group: tramGroup, curve: tramCurve, u: tramStartU, staticCollider: tramStaticCollider, active: false, frozenPos: tramFrozenPos },
    cabins: { list: cabins, A: CABLE_A, B: CABLE_B },
    sahatHands,
    movingChessPiece,
    signs,
    leafEmitters,
  };
}
