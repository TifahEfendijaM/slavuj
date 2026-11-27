// Jahorina (winter): 3D Olympic mountain world built from scratch on the shared Slavuj engine.
// North up (-z = north pine forest, +z = south rising ski slopes to Ogorjelica Peak, -x = west chalets/dom, +x = east sled hill & frozen pond).
// Poljice plateau & 1984 Olympic plaza centred at (0, PLATEAU_Y, 0).
import * as THREE from 'three';
import { Builder, paintGeo, washMat, addHull, tag, PAT, shared } from '../paper.js';

export const PLATEAU_Y = 4.0;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const sm = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

// Continuous terrain height used by terrain mesh, cabins, trees, skiers, chairlift, snow, and orbs.
export function jahorinaGroundY(x, z) {
  let y = PLATEAU_Y;
  // South ski slope climbing smoothly from Poljice (z = 18) up to Ogorjelica Peak (z = 108, y = 32)
  if (z > 18) {
    const u = sm((z - 18) / 88);
    y += u * 28.0;
    // Rajska dolina concave bowl on the west side of the ski mountain (x = -78..-22, z = 30..92)
    const bx = (x + 52) / 30, bz = (z - 62) / 30;
    const bowl = Math.exp(-(bx * bx + bz * bz));
    y -= bowl * 5.8 * u;
  }
  // North forested hill rising gently behind Poljice (z < -18)
  if (z < -18) {
    const u = sm((-18 - z) / 56);
    y += u * 10.5;
  }
  // East gentle sledding hill north of the frozen pond (x = 18..58, z = -48..-12)
  if (x > 14 && z < -12) {
    const sx = sm((x - 14) / 14) * (1 - sm((x - 56) / 16));
    const sz = sm((-12 - z) / 34);
    y = Math.max(y, PLATEAU_Y + sx * sz * 7.8);
  }
  // Frozen mountain pond basin at (48, 3.85, 2)
  const pd = Math.hypot((x - 48) / 15, (z - 2) / 11.5);
  if (pd < 1.15) {
    const dip = 1 - sm((pd - 0.8) / 0.35);
    y -= dip * 0.25;
  }
  return y;
}

// Deterministic RNG so every build produces identical layout & tree scatter
function makeRng(seed = 19840208) {
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

// Pitched gable / A-frame roof geometry
function gableRoof(w, d, h) {
  const hw = w / 2, hd = d / 2;
  const verts = new Float32Array([
    // Left slope
    -hw, 0, -hd,  -hw, 0, hd,  0, h, hd,
    -hw, 0, -hd,   0, h, hd,   0, h, -hd,
    // Right slope
     hw, 0, hd,    hw, 0, -hd, 0, h, -hd,
     hw, 0, hd,    0, h, -hd,  0, h, hd,
    // Front gable triangle
    -hw, 0, hd,    hw, 0, hd,  0, h, hd,
    // Back gable triangle
     hw, 0, -hd,  -hw, 0, -hd, 0, h, -hd,
  ]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  g.computeVertexNormals();
  return g;
}

export function buildJahorinaWorld(scene) {
  // Configure crisp winter palette & alpenglow sun uniforms
  shared.uWaterDir.value.set(0, 1);
  shared.uSunShadow.value.set(0.55, 0.7, 0.92);
  shared.uSunGlow.value.set(1.0, 0.72, 0.52);
  shared.uSunTint.value.set(1.02, 0.94, 0.90);
  shared.uSkyGlow.value.set(0.98, 0.70, 0.56);

  const b = new Builder();
  const R = makeRng(19840208);
  const rr = (a, c) => a + R() * (c - a);
  const pick = (arr) => arr[Math.floor(R() * arr.length)];

  const BOX = new THREE.BoxGeometry(1, 1, 1);
  const CYL = new THREE.CylinderGeometry(1, 1, 1, 10);
  const CYL6 = new THREE.CylinderGeometry(1, 1, 1, 6);
  const CONE = new THREE.ConeGeometry(1, 1, 8);
  const CONE6 = new THREE.ConeGeometry(1, 1, 6);
  const SPHERE = new THREE.SphereGeometry(1, 12, 9);
  const ICO = new THREE.IcosahedronGeometry(1, 1);
  const ICO2 = new THREE.IcosahedronGeometry(1, 2);
  const TORUS = new THREE.TorusGeometry(1, 0.14, 8, 18);

  const A = (geo, x, y, z, o, ry = 0, rx = 0, rz = 0, s = [1, 1, 1]) => b.add(geo, mat4(x, y, z, ry, rx, rz, s), o);
  const box = (w, h, d, x, y, z, o, ry = 0, rx = 0, rz = 0) => A(BOX, x, y, z, o, ry, rx, rz, [w, h, d]);

  // Tag paint modes & speeds
  for (const t of ['snijeg', 'bijela', 'staza', 'dolina', 'greben', 'vrh', 'peaks']) {
    tag(t).mode = 'one'; tag(t).radius = 120; tag(t).holdRest = 2.0;
  }
  tag('sjedez').mode = 'one'; tag('sjedez').radius = 120; tag('sjedez').holdRest = 2.2;
  tag('bor').waveDelay = 2.2; tag('jela').waveDelay = 2.2; tag('vikendica').waveDelay = 2.4;

  // Palette constants
  const SNOW_W = ['#f6f9fc', '#dce6f2'];
  const SNOW_B = ['#eef4fa', '#cddae8'];
  const WOOD_D = ['#6e4a2e', '#4c321e'];
  const WOOD_L = ['#9c6e44', '#754f2d'];
  const STONE_M = ['#9aa0a8', '#788088'];
  const PINE_G = ['#2c5840', '#1c3c2a'];
  const FIR_G = ['#244d38', '#173425'];
  const PR_W = { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1], pat: PAT.planks, ps: 3 };
  const PR_S = { tag: 'props', col: STONE_M[0], bleed: STONE_M[1], pat: PAT.blocks, ps: 0.7 };

  const people = [];
  const animals = [];
  const jahAnimals = [];
  const smoke = [];
  const orbs = [];
  const flags = [];

  const orb = (id, focus, size, tags, shot, landY, extra = {}) => {
    const f = V(...focus);
    orbs.push({
      id, focus: f, size, tags, shot,
      at: extra.at || V(f.x, (landY ?? f.y) + 2.0, f.z),
      stage: extra.stage ?? 1,
      ...extra,
    });
  };

  // ==================== 1. SKY, WINTER SUN, CLOUDS & DISTANT PEAKS ====================
  const sunPos = V(-105, 58, 135);
  // Winter sky dome (coloured in finale)
  {
    const skyGeo = new THREE.SphereGeometry(260, 24, 14);
    const pa = skyGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const y = pa.getY(i);
      if (y < -20) pa.setY(i, -20);
    }
    const g = paintGeo(skyGeo, { col: '#b8d4ec', bleed: '#e8d8cc', seed: [sunPos.x, sunPos.y, sunPos.z], radius: 360, dur: 5.5, hatch: 0 });
    const m = new THREE.Mesh(g, washMat('sky'));
    m.material.side = THREE.BackSide; m.material.depthWrite = false; m.renderOrder = -2;
    scene.add(m);
  }
  // Low pale winter sun
  {
    const m = new THREE.Mesh(paintGeo(new THREE.SphereGeometry(11, 16, 12), { col: '#ffe29c', bleed: '#ffbc72', seed: [sunPos.x, sunPos.y, sunPos.z], radius: 22, dur: 3.5, hatch: 0 }), washMat('sun'));
    m.position.copy(sunPos); addHull(m, 1.5); scene.add(m);
  }
  // Soft winter clouds
  const clouds = [];
  for (const [cx, cy, cz, sc] of [[-60, 58, 70, 1.2], [48, 62, 85, 1.35], [-10, 64, -55, 1.1], [75, 56, -30, 1.0], [-95, 54, 15, 1.15]]) {
    const g = new THREE.Group(); g.position.set(cx, cy, cz); scene.add(g);
    const cm = washMat('sky');
    for (const [dx, dy, dz, r] of [[0, 0, 0, 5.2], [4.4, -0.5, 0.8, 3.8], [-4.2, -0.4, -0.6, 3.6], [1.2, 1.4, -0.8, 3.4]]) {
      const m = new THREE.Mesh(paintGeo(ICO, { col: '#fbf9f6', bleed: '#e2e6ee', seed: [sunPos.x, sunPos.y, sunPos.z], radius: 260, dur: 5.0, hatch: 0 }), cm);
      m.position.set(dx * sc, dy * sc, dz * sc); m.scale.set(r * sc, r * 0.58 * sc, r * 0.72 * sc);
      addHull(m, 1.4); g.add(m);
    }
    clouds.push({ g, c: V(cx, cy, cz), r: 6.5 * sc, x0: cx, z0: cz, y0: cy, speed: 0.45 + R() * 0.3 });
  }
  // Surrounding Bosnian winter mountain ring ('peaks' finale)
  b.object(() => {
    const PK = { tag: 'peaks', col: '#d8e3ef', bleed: '#a4b7cc', hull: true, solid: false };
    const specs = [
      [-155, 8, 130, 78, 52, 68], [155, 10, 135, 85, 56, 72],
      [-160, 4, -55, 82, 46, 70], [160, 4, -45, 78, 44, 68],
      [-55, 2, -160, 90, 44, 72], [75, 2, -155, 92, 48, 74],
      [0, 12, 195, 115, 62, 72],
    ];
    for (const [mx, my, mz, rx, ry, rz] of specs) A(ICO2, mx, my, mz, PK, 0, 0, 0, [rx, ry, rz]);
  });

  // ==================== 2. SNOW TERRAIN, POLJICE PLATEAU, SLOPES & RAJSKA DOLINA ====================
  // Visual sculpted mountain terrain ('bijela': wide white snow blanket across slopes & valley)
  b.object(() => {
    const geo = new THREE.PlaneGeometry(240, 240, 36, 36);
    geo.rotateX(-Math.PI / 2);
    const pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const px = pa.getX(i), pz = pa.getZ(i);
      pa.setY(i, jahorinaGroundY(px, pz));
    }
    geo.computeVertexNormals();
    b.add(geo, mat4(0, 0, 0), { tag: 'bijela', col: SNOW_B[0], bleed: SNOW_B[1], pool: 0.5, solid: false, ink: false, orb: 'bijela' });
  });

  // Walkable snow ground colliders matching jahorinaGroundY (plateau + stepped ski run + north forest + sled hill + summit)
  // Central Poljice snow blanket ('snijeg': Stage 0 FIRST WORD! Crisp snow plaza + snowdrifts right in front of the bird!)
  b.object(() => {
    const SN = { tag: 'snijeg', col: SNOW_W[0], bleed: SNOW_W[1], pool: 0.55, orb: 'snijeg' };
    box(118, 1.0, 38, 4, PLATEAU_Y - 0.48, 0, { ...SN, ink: false });
    // Sculpted soft snowdrifts framing the Poljice plateau
    for (const [dx, dz, rx, ry, rz] of [[-14, 12, 4.5, 0.9, 2.8], [15, -10, 5.2, 1.0, 3.0], [-24, -12, 6.0, 1.1, 3.2], [24, 12, 5.0, 0.95, 3.0], [2, 16, 4.2, 0.75, 2.4]]) {
      A(ICO, dx, PLATEAU_Y + ry * 0.25, dz, { ...SN, hull: true }, 0, 0, 0, [rx, ry, rz]);
    }
  });
  // Solid ground slabs for slopes so the nightingale can perch & walk anywhere on the mountain
  // South ski slope + Rajska dolina + Summit
  for (let i = 0; i < 9; i++) {
    const z0 = 18 + i * 10, z1 = z0 + 10, zm = (z0 + z1) / 2;
    const y0 = jahorinaGroundY(0, z0), y1 = jahorinaGroundY(0, z1), ym = (y0 + y1) / 2;
    const ang = -Math.atan2(y1 - y0, 10);
    b.block(BOX, mat4(0, ym - 0.5, zm, 0, ang, 0, [130, 1.0, 10.6]), { tag: 'bijela' });
  }
  // Summit plateau collider at Ogorjelica (z = 104..122, y = 32)
  b.block(BOX, mat4(0, 31.5, 112, 0, 0, 0, [70, 1.0, 18]), { tag: 'vrh' });
  // North forest slope colliders
  for (let i = 0; i < 6; i++) {
    const z0 = -18 - i * 10, z1 = z0 - 10, zm = (z0 + z1) / 2;
    const y0 = jahorinaGroundY(0, z0), y1 = jahorinaGroundY(0, z1), ym = (y0 + y1) / 2;
    const ang = Math.atan2(y1 - y0, 10);
    b.block(BOX, mat4(0, ym - 0.5, zm, 0, ang, 0, [150, 1.0, 10.6]), { tag: 'bijela' });
  }

  // ==================== 3. ZONE 1: POLJICE & 1984 OLYMPIC PLAZA ====================
  // Stone plinth + 5 interlocking 1984 Olympic rings ('pet') at (6, PLATEAU_Y, -4)
  b.object(() => {
    const ox = 6, oz = -4;
    box(6.4, 1.1, 1.6, ox, PLATEAU_Y + 0.55, oz, PR_S);
    const ringCols = ['#1f66b5', '#222428', '#cf352c', '#e6b222', '#2f8a48'];
    const ringPos = [[-1.7, 2.75], [0, 2.75], [1.7, 2.75], [-0.85, 2.0], [0.85, 2.0]];
    ringPos.forEach(([rx, ry], i) => {
      A(TORUS, ox + rx, PLATEAU_Y + ry, oz, { tag: 'pet', col: ringCols[i], bleed: ringCols[i], hull: true, orb: 'pet' }, 0, 0, 0, [0.76, 0.76, 0.76]);
    });
  });

  // Iconic 1984 Sarajevo Winter Olympics 6-pointed stylized snowflake monument ('pahulja') at (-4, PLATEAU_Y, -8)
  b.object(() => {
    const fx = -4, fz = -8;
    box(2.2, 0.9, 2.2, fx, PLATEAU_Y + 0.45, fz, PR_S);
    const PF = { tag: 'pahulja', col: '#d9542b', bleed: '#b03918', hull: true, orb: 'pahulja' };
    A(CYL6, fx, PLATEAU_Y + 2.4, fz, { ...PF, wall: true }, 0, 0, 0, [0.16, 3.0, 0.16]);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const sx = Math.cos(a), sy = Math.sin(a);
      box(0.22, 2.6, 0.18, fx, PLATEAU_Y + 3.8, fz, PF, 0, 0, a);
      // Forked snowflake arms
      box(0.16, 0.72, 0.16, fx + sx * 0.85, PLATEAU_Y + 3.8 + sy * 0.85, fz, PF, 0, 0, a + 0.65);
      box(0.16, 0.72, 0.16, fx + sx * 0.85, PLATEAU_Y + 3.8 + sy * 0.85, fz, PF, 0, 0, a - 0.65);
    }
  });

  // Wooden mountain trail signpost ('putokaz') at (14, PLATEAU_Y, 6)
  b.object(() => {
    const px = 14, pz = 6;
    const PK = { tag: 'putokaz', col: WOOD_L[0], bleed: WOOD_L[1], pat: PAT.planks, ps: 3, orb: 'putokaz' };
    A(CYL, px, PLATEAU_Y + 1.5, pz, { ...PK, wall: true }, 0, 0, 0, [0.12, 3.0, 0.12]);
    box(1.75, 0.36, 0.1, px + 0.55, PLATEAU_Y + 2.65, pz, PK, 0.2);
    box(1.65, 0.36, 0.1, px - 0.5, PLATEAU_Y + 2.2, pz, PK, -0.4);
    box(1.55, 0.36, 0.1, px + 0.45, PLATEAU_Y + 1.75, pz, PK, 0.6);
  });

  // Snowman ('snjesko') + carrot nose ('mrkva') + knitted hat ('kapa') + warm mittens ('rukavice') at (-8, PLATEAU_Y, 6)
  b.object(() => {
    const sx = -8, sz = 6;
    const SM = { tag: 'snjesko', col: '#f7fafd', bleed: '#d2e0ee', hull: true, orb: 'snjesko' };
    A(SPHERE, sx, PLATEAU_Y + 0.72, sz, SM, 0, 0, 0, [0.82, 0.76, 0.82]);
    A(SPHERE, sx, PLATEAU_Y + 1.72, sz, SM, 0, 0, 0, [0.58, 0.54, 0.58]);
    A(SPHERE, sx, PLATEAU_Y + 2.48, sz, SM, 0, 0, 0, [0.40, 0.38, 0.40]);
    // Coal eyes & buttons
    for (const dx of [-0.14, 0.14]) A(SPHERE, sx + dx, PLATEAU_Y + 2.58, sz + 0.35, { tag: 'snjesko', col: '#2a2a2e', solid: false }, 0, 0, 0, [0.055, 0.055, 0.055]);
    for (const dy of [1.95, 1.72, 1.48]) A(SPHERE, sx, PLATEAU_Y + dy, sz + 0.55, { tag: 'snjesko', col: '#2a2a2e', solid: false }, 0, 0, 0, [0.06, 0.06, 0.06]);
    // Twig arms
    for (const sd of [-1, 1]) box(0.9, 0.07, 0.07, sx + sd * 0.88, PLATEAU_Y + 1.82, sz, { tag: 'snjesko', col: '#5c3c24', solid: false }, 0, 0, sd * 0.32);
  });
  // Orange carrot nose ('mrkva')
  b.object(() => {
    A(CONE, -8, PLATEAU_Y + 2.46, 6.55, { tag: 'mrkva', col: '#e87424', bleed: '#b84c10', hull: true, orb: 'mrkva' }, 0, Math.PI / 2, 0, [0.09, 0.46, 0.09]);
  });
  // Knitted red-and-cream winter hat ('kapa') on snowman's head
  b.object(() => {
    const sx = -8, sz = 6;
    const KP = { tag: 'kapa', col: '#c43a2e', bleed: '#8f2218', hull: true, orb: 'kapa' };
    A(CYL, sx, PLATEAU_Y + 2.82, sz, { tag: 'kapa', col: '#f2ece0', bleed: '#d6cebc', hull: true }, 0, 0, 0, [0.41, 0.16, 0.41]);
    A(CONE, sx, PLATEAU_Y + 3.16, sz, KP, 0, 0, 0.12, [0.39, 0.62, 0.39]);
    A(SPHERE, sx - 0.06, PLATEAU_Y + 3.48, sz, { tag: 'kapa', col: '#f2ece0', hull: true }, 0, 0, 0, [0.13, 0.13, 0.13]);
  });
  // Warm wool mittens ('rukavice') on the snowman's twig hands (plus a spare pair on the fence!)
  b.object(() => {
    const sx = -8, sz = 6;
    const RK = { tag: 'rukavice', col: '#2c689c', bleed: '#1d476e', hull: true, orb: 'rukavice' };
    for (const sd of [-1, 1]) {
      A(SPHERE, sx + sd * 1.32, PLATEAU_Y + 1.98, sz, RK, 0, 0, 0, [0.16, 0.14, 0.12]);
      A(SPHERE, sx + sd * 1.24, PLATEAU_Y + 2.08, sz + 0.04, RK, 0, 0, 0, [0.08, 0.09, 0.08]);
    }
  });
  // Pile of packed snowballs ('grudva') beside the snowball-throwing kids at (3, PLATEAU_Y, 8)
  b.object(() => {
    const GR = { tag: 'grudva', col: '#f5f9fd', bleed: '#c8d8ea', hull: true, orb: 'grudva' };
    for (const [dx, dy, dz, r] of [[0, 0.14, 0, 0.16], [0.28, 0.14, 0.1, 0.15], [-0.25, 0.14, 0.14, 0.15], [0.04, 0.36, 0.08, 0.14]]) {
      A(SPHERE, 3.0 + dx, PLATEAU_Y + dy, 8.0 + dz, GR, 0, 0, 0, [r, r, r]);
    }
  });

  // ==================== 4. ZONE 2 & 3: PLANINARSKI DOM, VIKENDICE, FIRE & WINTER TABLE ====================
  // Helper: steep-roofed Bosnian mountain chalet ('vikendica' or 'koliba')
  function chalet(x, y, z, rot, w, d, wallH, roofH, tg, orbId) {
    const CW = { tag: tg, col: '#8c603c', bleed: '#664226', pat: PAT.planks, ps: 3.5, orb: orbId };
    const CS = { tag: tg, col: STONE_M[0], bleed: STONE_M[1], pat: PAT.blocks, ps: 0.7, orb: orbId };
    const CR = { tag: tg, col: '#f4f8fc', bleed: '#cfe0f0', pool: 0.5, orb: orbId }; // snow-laden roof
    const CE = { tag: tg, col: '#5c3b22', bleed: '#3d2514', orb: orbId };
    b.push(mat4(x, y, z, rot));
    b.object(() => {
      box(w, 1.4, d, 0, 0.7, 0, CS);
      box(w + 0.2, wallH, d + 0.2, 0, 1.4 + wallH / 2, 0, CW);
      // Warm amber glowing cabin windows
      for (const wx of [-w * 0.26, w * 0.26]) {
        box(1.15, 1.25, 0.14, wx, 1.4 + wallH * 0.55, d / 2 + 0.12, { tag: tg, col: '#f4c05c', bleed: '#d89632', solid: false });
        box(1.28, 0.12, 0.22, wx, 1.4 + wallH * 0.55 - 0.66, d / 2 + 0.16, CE);
      }
      // Wooden cabin door
      box(1.25, 2.2, 0.16, 0, 1.4 + 1.1, d / 2 + 0.12, CE);
      // Steep snow-covered gable roof + dark timber under-eaves
      A(gableRoof(w + 1.6, d + 1.8, roofH), 0, 1.4 + wallH - 0.1, 0, CE);
      A(gableRoof(w + 1.75, d + 1.95, roofH + 0.28), 0, 1.4 + wallH + 0.12, 0, CR);
      // Stone chimney
      box(0.85, 2.6, 0.85, w * 0.28, 1.4 + wallH + roofH * 0.65, -d * 0.18, CS);
    });
    b.pop();
  }

  // Main Planinarski dom ('koliba') at (-24, PLATEAU_Y, -4) facing east (+x toward Poljice)
  chalet(-26, PLATEAU_Y, -4, Math.PI / 2, 11.0, 8.4, 3.2, 4.4, 'koliba', 'koliba');
  // Covered wooden porch deck in front of Planinarski dom
  b.object(() => {
    const KP = { tag: 'koliba', col: WOOD_L[0], bleed: WOOD_L[1], pat: PAT.planks, ps: 3, orb: 'koliba' };
    box(4.6, 0.35, 11.4, -19.5, PLATEAU_Y + 0.18, -4, KP);
    for (const pz of [-9.0, -4.0, 1.0]) A(CYL, -17.5, PLATEAU_Y + 1.8, pz, { ...KP, wall: true }, 0, 0, 0, [0.11, 3.2, 0.11]);
    box(4.8, 0.28, 11.8, -19.5, PLATEAU_Y + 3.45, -4, { tag: 'koliba', col: SNOW_W[0], bleed: SNOW_W[1] }, 0, 0, -0.18);
  });
  smoke.push({ x: -24.5, y: PLATEAU_Y + 9.2, z: -6.8 }); // smoke #1 (Planinarski dom chimney)

  // Icicles ('ledenica') hanging from Planinarski dom front porch eaves at x = -17.2
  b.object(() => {
    const IC = { tag: 'ledenica', col: '#cde8f8', bleed: '#8cc0df', hull: true, orb: 'ledenica' };
    for (let i = 0; i < 11; i++) {
      const iz = -8.6 + i * 0.92;
      const len = 0.52 + (i % 3) * 0.24;
      A(CONE6, -17.2, PLATEAU_Y + 3.05 - len / 2, iz, IC, 0, Math.PI, 0, [0.075, len, 0.075]);
    }
  });

  // Glowing hanging lantern ('fenjer') beside the cabin door at (-17.5, PLATEAU_Y + 2.4, -4.0)
  b.object(() => {
    const fx = -17.1, fy = PLATEAU_Y + 2.35, fz = -4.0;
    const FN = { tag: 'fenjer', col: '#3a342e', bleed: '#201c18', orb: 'fenjer' };
    box(0.45, 0.08, 0.08, fx - 0.18, fy + 0.35, fz, FN);
    box(0.28, 0.38, 0.28, fx, fy, fz, { tag: 'fenjer', col: '#ffcf54', bleed: '#e89524', hull: true, orb: 'fenjer' });
    A(CONE6, fx, fy + 0.28, fz, FN, 0, 0, 0, [0.24, 0.22, 0.24]);
    box(0.32, 0.08, 0.32, fx, fy - 0.22, fz, FN);
  });

  // Cluster of steep-roofed Bosnian mountain chalets ('vikendica') on the western snow slope
  for (const [vx, vz, rot] of [[-46, -10, 0.65], [-54, 6, 1.35], [-42, 16, 1.8], [-38, -24, 0.25], [-56, -24, 0.4]]) {
    const vy = jahorinaGroundY(vx, vz);
    chalet(vx, vy, vz, rot, 6.2, 5.2, 2.5, 3.6, 'vikendica', 'vikendica');
  }
  smoke.push({ x: -45.2, y: jahorinaGroundY(-46, -10) + 7.4, z: -11.4 }); // smoke #2
  smoke.push({ x: -53.2, y: jahorinaGroundY(-54, 6) + 7.4, z: 4.8 });     // smoke #3

  // Stacked firewood ('drva'), wooden chopping stump ('panj'), and woodcutter ('cijepati' + 'sjekira') at (-21, PLATEAU_Y, 6)
  b.object(() => {
    const DR = { tag: 'drva', col: '#8c6239', bleed: '#5e3f22', hull: true, orb: 'drva' };
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        A(CYL6, -22.8 + col * 0.34, PLATEAU_Y + 0.18 + row * 0.28, 4.6, DR, 0, Math.PI / 2, 0, [0.13, 0.85, 0.13]);
      }
    }
    // Small roof overhang above firewood stack ('props')
    box(2.2, 0.12, 1.15, -22.1, PLATEAU_Y + 1.55, 4.6, PR_W, 0, 0.15, 0);
  });
  // Chopping stump ('panj') at (-19.2, PLATEAU_Y, 6.4)
  b.object(() => {
    const PJ = { tag: 'panj', col: '#6e492a', bleed: '#4a2f1a', hull: true, orb: 'panj' };
    A(CYL, -19.2, PLATEAU_Y + 0.42, 6.4, PJ, 0, 0, 0, [0.42, 0.84, 0.42]);
    A(CYL, -19.2, PLATEAU_Y + 0.86, 6.4, { tag: 'panj', col: '#d8b482', bleed: '#b08b5a', solid: false }, 0, 0, 0, [0.38, 0.04, 0.38]);
  });

  // Outdoor stone hearth / fire pit ('vatra') & iron wood-burning stove ('pec') on the covered terrace!
  // Fire pit at (-14, PLATEAU_Y, -9.5)
  b.object(() => {
    const fx = -14, fz = -9.5;
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI * 2) / 10;
      A(ICO, fx + Math.cos(a) * 0.85, PLATEAU_Y + 0.22, fz + Math.sin(a) * 0.85, PR_S, 0, 0, 0, [0.28, 0.22, 0.28]);
    }
    const VT = { tag: 'vatra', col: '#f26a22', bleed: '#c83412', hull: true, orb: 'vatra' };
    A(CONE6, fx, PLATEAU_Y + 0.56, fz, VT, 0, 0, 0, [0.38, 0.95, 0.38]);
    A(CONE6, fx + 0.18, PLATEAU_Y + 0.44, fz - 0.14, { tag: 'vatra', col: '#ffba2e', bleed: '#eb6c18', hull: true }, 0, 0, -0.18, [0.24, 0.65, 0.24]);
    A(CONE6, fx - 0.18, PLATEAU_Y + 0.42, fz + 0.14, { tag: 'vatra', col: '#ffba2e', bleed: '#eb6c18', hull: true }, 0, 0, 0.2, [0.22, 0.58, 0.22]);
  });
  smoke.push({ x: -14, y: PLATEAU_Y + 1.15, z: -9.5 }); // smoke #4 (hearth fire pit)

  // Cast-iron Bosnian wood stove ('pec') on the sheltered Planinarski dom porch at (-18.8, PLATEAU_Y + 0.35, -7.8)
  b.object(() => {
    const sx = -18.8, sy = PLATEAU_Y + 0.35, sz = -7.8;
    const PC = { tag: 'pec', col: '#34383e', bleed: '#1e2126', hull: true, orb: 'pec' };
    box(0.85, 0.95, 0.72, sx, sy + 0.62, sz, PC);
    box(0.45, 0.32, 0.08, sx + 0.42, sy + 0.65, sz, { tag: 'pec', col: '#f07828', bleed: '#b83c14', solid: false }); // glowing stove window
    A(CYL, sx, sy + 2.05, sz, { ...PC, wall: true }, 0, 0, 0, [0.11, 2.0, 0.11]); // stovepipe
  });

  // Deep boot footprints in fresh snow ('tragovi') leading from the plaza to Planinarski dom porch
  b.object(() => {
    const TR = { tag: 'tragovi', col: '#98aec6', bleed: '#758da8', solid: false, orb: 'tragovi' };
    for (let i = 0; i < 12; i++) {
      const fx = -10.5 - i * 0.62, fz = -0.8 + (i % 2 ? 0.22 : -0.22);
      box(0.32, 0.04, 0.16, fx, PLATEAU_Y + 0.03, fz, TR, 0.1);
    }
  });

  // Zone 3: Warm Cabin Terrace Table & Winter Props at (-18.6, PLATEAU_Y + 0.35, -1.6)
  // Wooden table + bench ('props')
  b.object(() => {
    const tx = -18.6, ty = PLATEAU_Y + 0.35, tz = -1.6;
    box(1.5, 0.1, 2.8, tx, ty + 0.78, tz, PR_W);
    for (const dz of [-1.05, 1.05]) box(1.2, 0.75, 0.12, tx, ty + 0.38, tz + dz, PR_W);
    // Wooden porch bench beside the table for the wool blanket ('deka') & winter boots ('cizme')
    box(0.65, 0.1, 2.4, tx - 1.25, ty + 0.48, tz, PR_W);
    box(0.1, 0.55, 2.4, tx - 1.54, ty + 0.78, tz, PR_W);
  });
  // Hot mountain tea ('caj'), ceramic mug ('solja'), honey jar ('med'), bread ('hljeb'), cheese ('sir'), soup ('supa'), thermos ('termos')
  b.object(() => {
    const tx = -18.6, ty = PLATEAU_Y + 1.18, tz = -1.6;
    // Ceramic mug ('solja') + hot amber herbal tea ('caj')
    A(CYL, tx + 0.25, ty + 0.12, tz - 0.85, { tag: 'solja', col: '#e8e2d4', bleed: '#c8beaa', hull: true, orb: 'solja' }, 0, 0, 0, [0.11, 0.22, 0.11]);
    A(TORUS, tx + 0.36, ty + 0.12, tz - 0.85, { tag: 'solja', col: '#e8e2d4', solid: false }, 0, 0, 0, [0.065, 0.065, 0.065]);
    A(CYL, tx + 0.25, ty + 0.22, tz - 0.85, { tag: 'caj', col: '#b85c22', bleed: '#8a3c10', hull: true, orb: 'caj' }, 0, 0, 0, [0.095, 0.04, 0.095]);
    // Second steaming tea glass for clarity
    A(CYL, tx + 0.25, ty + 0.12, tz - 0.48, { tag: 'caj', col: '#c46424', bleed: '#8a3c10', hull: true, orb: 'caj' }, 0, 0, 0, [0.085, 0.2, 0.085]);
    // Golden mountain honey jar ('med')
    A(CYL, tx - 0.15, ty + 0.14, tz - 0.72, { tag: 'med', col: '#e8a824', bleed: '#b87810', hull: true, orb: 'med' }, 0, 0, 0, [0.12, 0.26, 0.12]);
    A(CYL, tx - 0.15, ty + 0.29, tz - 0.72, { tag: 'med', col: '#c4462c', solid: false }, 0, 0, 0, [0.125, 0.05, 0.125]);
    // Round warm Bosnian bread loaf ('hljeb')
    A(SPHERE, tx + 0.15, ty + 0.12, tz + 0.05, { tag: 'hljeb', col: '#c98a42', bleed: '#965c20', hull: true, orb: 'hljeb' }, 0, 0, 0, [0.28, 0.16, 0.24]);
    // White mountain cheese wheel & wedges ('sir')
    A(CYL, tx - 0.28, ty + 0.08, tz + 0.28, { tag: 'sir', col: '#f7f2dc', bleed: '#dcd2aa', hull: true, orb: 'sir' }, 0, 0, 0, [0.22, 0.14, 0.22]);
    // Steaming soup bowl ('supa')
    A(CYL, tx + 0.2, ty + 0.09, tz + 0.82, { tag: 'supa', col: '#d45834', bleed: '#9e381c', hull: true, orb: 'supa' }, 0, 0, 0, [0.22, 0.16, 0.22]);
    A(CYL, tx + 0.2, ty + 0.17, tz + 0.82, { tag: 'supa', col: '#e6a83c', bleed: '#b87a1c', solid: false }, 0, 0, 0, [0.18, 0.03, 0.18]);
    // Tall steel thermos ('termos')
    A(CYL, tx - 0.25, ty + 0.24, tz + 1.05, { tag: 'termos', col: '#2d688a', bleed: '#1c4660', hull: true, orb: 'termos' }, 0, 0, 0, [0.1, 0.46, 0.1]);
    A(CYL, tx - 0.25, ty + 0.50, tz + 1.05, { tag: 'termos', col: '#d0d6dc', solid: false }, 0, 0, 0, [0.1, 0.1, 0.1]);
  });
  // Woven red-plaid wool blanket ('deka') draped over the porch bench at (-19.85, PLATEAU_Y + 0.9, -1.6)
  b.object(() => {
    const DK = { tag: 'deka', col: '#b83c32', bleed: '#84241c', hull: true, orb: 'deka' };
    box(0.75, 0.12, 1.35, -19.85, PLATEAU_Y + 0.92, -1.6, DK);
    box(0.12, 0.42, 1.35, -19.50, PLATEAU_Y + 0.74, -1.6, DK);
  });
  // Pair of sturdy winter boots ('cizme') lined neatly by the cabin porch steps at (-17.6, PLATEAU_Y + 0.35, 0.4)
  b.object(() => {
    const CZ = { tag: 'cizme', col: '#694228', bleed: '#452816', hull: true, orb: 'cizme' };
    for (const dz of [-0.18, 0.18]) {
      A(CYL, -17.6, PLATEAU_Y + 0.62, 0.4 + dz, CZ, 0, 0, 0, [0.1, 0.42, 0.1]);
      box(0.32, 0.14, 0.16, -17.48, PLATEAU_Y + 0.45, 0.4 + dz, CZ);
    }
  });

  // ==================== 5. ZONE 4: SLEDDING HILL & FROZEN MOUNTAIN POND ====================
  // Frozen mountain pond ('jezero' shore + rim, 'led' smooth glossy glacier-blue ice sheet!) at (48, PLATEAU_Y, 2)
  b.object(() => {
    const px = 48, py = PLATEAU_Y, pz = 2;
    // Shore bank ring ('jezero')
    A(CYL, px, py + 0.03, pz, { tag: 'jezero', col: '#90a6bc', bleed: '#688098', orb: 'jezero' }, 0, 0, 0, [15.2, 0.14, 12.0]);
    // Smooth glossy ice surface ('led') sitting cleanly above the plateau snow slab
    A(CYL, px, py + 0.10, pz, { tag: 'led', col: '#9acae6', bleed: '#68a6cc', pool: 0.45, orb: 'led' }, 0, 0, 0, [13.8, 0.12, 10.6]);
  });
  // Frosted wooden fence rails ('mraz') along the west edge of the pond at x = 33.2, z = -4..8
  b.object(() => {
    const MR = { tag: 'mraz', col: '#d8ebf8', bleed: '#9cc2dc', hull: true, orb: 'mraz' };
    for (let i = 0; i < 5; i++) {
      const fz = -4 + i * 3.0;
      A(CYL, 33.2, PLATEAU_Y + 0.55, fz, PR_W, 0, 0, 0, [0.09, 1.15, 0.09]);
      A(SPHERE, 33.2, PLATEAU_Y + 1.15, fz, MR, 0, 0, 0, [0.13, 0.08, 0.13]);
    }
    box(0.14, 0.14, 12.4, 33.2, PLATEAU_Y + 0.92, 2.0, MR);
    box(0.12, 0.12, 12.4, 33.2, PLATEAU_Y + 0.52, 2.0, PR_W);
  });
  // Parked empty wooden sled ('sanke') at the foot of the sledding hill at (34, PLATEAU_Y, -12)
  b.object(() => {
    const sx = 34, sz = -12;
    const SK = { tag: 'sanke', col: '#8f5c34', bleed: '#623c1e', pat: PAT.planks, ps: 3, orb: 'sanke' };
    for (const dx of [-0.26, 0.26]) box(0.06, 0.09, 1.45, sx + dx, PLATEAU_Y + 0.08, sz, SK);
    box(0.65, 0.08, 1.25, sx, PLATEAU_Y + 0.28, sz, SK);
  });

  // ==================== 6. ZONE 5: SKI SLOPES, CHAIRLIFT & SNOW GROOMER ====================
  // Wide groomed white ski piste ('staza') sweeping from Ogorjelica (0, 32, 102) down to Poljice (0, 4, 20)
  b.object(() => {
    const ST = { tag: 'staza', col: '#ffffff', bleed: '#d6e5f5', solid: false, ink: false, orb: 'staza' };
    for (let i = 0; i < 10; i++) {
      const z0 = 20 + i * 8.2, z1 = z0 + 8.2, zm = (z0 + z1) / 2;
      const x0 = Math.sin((i / 10) * Math.PI) * -8, x1 = Math.sin(((i + 1) / 10) * Math.PI) * -8, xm = (x0 + x1) / 2;
      const y0 = jahorinaGroundY(x0, z0), y1 = jahorinaGroundY(x1, z1), ym = (y0 + y1) / 2;
      const ry = Math.atan2(x1 - x0, z1 - z0), rx = -Math.atan2(y1 - y0, Math.hypot(x1 - x0, z1 - z0));
      box(14.5, 0.12, Math.hypot(x1 - x0, z1 - z0) + 0.6, xm, ym + 0.06, zm, ST, ry, rx, 0);
    }
  });

  // Bright orange ski safety net ('mreza') lining the eastern border of the lower ski run
  b.object(() => {
    const MR = { tag: 'mreza', col: '#e86820', bleed: '#b84810', hull: true, orb: 'mreza' };
    for (let i = 0; i < 7; i++) {
      const mz = 24 + i * 4.5, mx = 8.5 - Math.sin(((mz - 20) / 82) * Math.PI) * 5.0;
      const my = jahorinaGroundY(mx, mz);
      A(CYL, mx, my + 0.75, mz, { ...MR, wall: true }, 0, 0, 0, [0.05, 1.5, 0.05]);
      if (i < 6) {
        const mz2 = 24 + (i + 1) * 4.5, mx2 = 8.5 - Math.sin(((mz2 - 20) / 82) * Math.PI) * 5.0;
        const my2 = jahorinaGroundY(mx2, mz2);
        const len = Math.hypot(mx2 - mx, mz2 - mz), ry = Math.atan2(mx2 - mx, mz2 - mz);
        box(0.08, 1.15, len, (mx + mx2) / 2, (my + my2) / 2 + 0.72, (mz + mz2) / 2, MR, ry);
      }
    }
  });

  // Red & blue Olympic slalom racing flags ('zastavica') zig-zagging down the upper ski slope
  for (let i = 0; i < 6; i++) {
    const fz = 36 + i * 10.5;
    const fx = (i % 2 ? -5.5 : 3.5) - Math.sin(((fz - 20) / 82) * Math.PI) * 6.0;
    const fy = jahorinaGroundY(fx, fz);
    const col = i % 2 ? '#d6382c' : '#2662b8';
    b.object(() => {
      A(CYL, fx, fy + 1.0, fz, { tag: 'zastavica', col: '#2c3038', wall: true }, 0, 0, 0, [0.04, 2.0, 0.04]);
    });
    const fg = new THREE.Group(); fg.position.set(fx, fy + 1.72, fz); scene.add(fg);
    const fm = new THREE.Mesh(paintGeo(new THREE.BoxGeometry(0.75, 0.48, 0.05).translate(0.38, 0, 0), { col, bleed: col, seed: [fx, fy + 1.7, fz], radius: 4, dur: 2.2, hatch: 0.3 }), washMat('zastavica'));
    addHull(fm, 1.3); fg.add(fm);
    flags.push({ g: fg, baseRy: 0.25, phase: i * 0.9 });
  }

  // Open Alpine Chairlift ('sjedez'): Poljice lower station (18, 4, 20) -> 4 towers -> Ogorjelica upper station (18, 31.6, 102)
  const LIFT_A = V(18, PLATEAU_Y + 5.0, 20), LIFT_B = V(18, jahorinaGroundY(18, 102) + 4.8, 102);
  const liftDir = LIFT_B.clone().sub(LIFT_A), liftLen = liftDir.length();
  const liftPitch = -Math.atan2(liftDir.y, Math.hypot(liftDir.x, liftDir.z));
  b.object(() => {
    const LC = { tag: 'sjedez', col: '#4a5562', bleed: '#2e3640', orb: 'sjedez' };
    const LR = { tag: 'sjedez', col: '#c93c2e', bleed: '#96281c', orb: 'sjedez' };
    // Lower & upper wooden/steel stations
    box(6.4, 4.2, 5.2, 18, PLATEAU_Y + 2.1, 18.5, LC);
    box(7.0, 0.5, 5.8, 18, PLATEAU_Y + 4.4, 18.5, LR);
    const topY = jahorinaGroundY(18, 102);
    box(6.4, 4.2, 5.2, 18, topY + 2.1, 103.5, LC);
    box(7.0, 0.5, 5.8, 18, topY + 4.4, 103.5, LR);
    // 4 steel lattice towers along the lift line
    for (const u of [0.2, 0.42, 0.65, 0.85]) {
      const p = LIFT_A.clone().lerp(LIFT_B, u);
      const gy = jahorinaGroundY(p.x, p.z) - 1.0;
      const th = Math.max(6.5, p.y - gy + 0.8);
      A(CYL, p.x, gy + th / 2, p.z, { ...LC, wall: true }, 0, 0, 0, [0.34, th, 0.34]);
      box(4.8, 0.35, 0.38, p.x, p.y + 0.3, p.z, { ...LC, wall: true });
    }
    // Two parallel steel haul cables
    for (const sd of [-1.8, 1.8]) {
      const mid = LIFT_A.clone().lerp(LIFT_B, 0.5);
      box(0.08, 0.08, liftLen, mid.x + sd, mid.y + 0.15, mid.z, { ...LC, solid: false, ink: false }, 0, liftPitch, 0);
    }
  });
  // 8 hanging chairlift seats gliding up & down once awake
  const chairs = [];
  {
    const lMat = washMat('sjedez');
    for (let i = 0; i < 8; i++) {
      const u = (i % 4) * 0.24 + 0.10;
      const sd = i < 4 ? 1 : -1;
      const p = LIFT_A.clone().lerp(LIFT_B, u);
      const g = new THREE.Group(); g.position.set(p.x + sd * 1.8, p.y - 1.8, p.z); g.rotation.y = sd > 0 ? 0 : Math.PI;
      const mk = (geo, col, x, y, z, sx, sy, sz) => {
        const m = new THREE.Mesh(paintGeo(geo, { col, bleed: col, seed: [18, PLATEAU_Y + 5, 20], radius: 115, dur: 4.0, hatch: 0.4 }), lMat);
        m.position.set(x, y, z); m.scale.set(sx, sy, sz); addHull(m, 1.3); g.add(m);
      };
      mk(BOX, '#363e46', 0, 0.95, 0, 0.08, 1.85, 0.08);   // hanger bar
      mk(BOX, '#d94432', 0, 0, 0, 1.45, 0.12, 0.58);      // seat bench
      mk(BOX, '#d94432', 0, 0.42, -0.25, 1.45, 0.72, 0.1); // backrest
      scene.add(g);
      chairs.push({ g, u, sd });
    }
  }

  // Red tracked snow groomer / snowcat ('ratrak') at (-16, PLATEAU_Y, 20), rolls gently along piste edge once awake!
  const ratrakGroup = new THREE.Group();
  const ratrakHome = V(-16, PLATEAU_Y + 0.05, 20);
  {
    const rMat = washMat('ratrak');
    const RSeed = [-16, PLATEAU_Y + 1.5, 20];
    const rp = (geo, col, bleed, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0) => {
      const m = new THREE.Mesh(paintGeo(geo, { col, bleed: bleed || col, seed: RSeed, radius: 10, dur: 3.4, hatch: 0.5 }), rMat);
      m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.x = rx; addHull(m, 1.4); ratrakGroup.add(m);
    };
    // Wide rubber caterpillar tracks
    for (const sx of [-1.45, 1.45]) rp(BOX, '#2a2d32', '#1a1c20', sx, 0.48, 0, 0.95, 0.85, 4.6);
    // Red chassis & glass cab
    rp(BOX, '#d43628', '#a12218', 0, 1.05, -0.35, 2.2, 0.9, 4.0);
    rp(BOX, '#d43628', '#a12218', 0, 2.05, 0.45, 2.0, 1.2, 2.1);
    rp(BOX, '#283440', '#1a242e', 0, 2.12, 0.52, 2.05, 0.75, 1.75); // dark glass cab wrap
    rp(BOX, '#f2b824', '#c99416', 0, 2.78, 0.45, 0.35, 0.25, 0.35); // roof beacon
    // Front curved snow plow blade
    rp(BOX, '#d43628', '#9c2218', 0, 0.65, 2.85, 4.1, 1.05, 0.25, -0.25);
    // Rear corduroy tiller bar
    rp(BOX, '#363c44', '#22262c', 0, 0.42, -2.75, 4.2, 0.45, 0.65);
    tag('ratrak').subs.push({ box: new THREE.Box3(V(-18.5, PLATEAU_Y, 17), V(-13.5, PLATEAU_Y + 3.2, 23)), ranges: [], hranges: [] });
    tag('ratrak').end = 3.5; tag('ratrak').nearEnd = 3.3;
    ratrakGroup.position.copy(ratrakHome);
    scene.add(ratrakGroup);
  }
  const ratrakCollider = b.block(BOX, mat4(-16, PLATEAU_Y + 1.5, 20, 0, 0, 0, [4.2, 3.0, 5.8]), { orb: 'ratrak', tag: 'ratrak' });

  // ==================== 7. ZONE 6: SPRUCE & PINE FOREST + BOSNIAN WILDLIFE ====================
  // Helper: tall alpine pine ('bor') with bare lower trunk & umbrella-like upper crown
  function addPine(x, z, sc = 1, tg = 'bor', orbId = 'bor') {
    const y = jahorinaGroundY(x, z);
    const P_TR = { tag: tg, col: '#69462c', bleed: '#472d1b', wall: true, orb: orbId };
    const P_CR = { tag: tg, col: PINE_G[0], bleed: PINE_G[1], hull: true, orb: orbId, sway: (v) => 0.02 * Math.max(0, v.y - y - 3) };
    const P_SN = { tag: tg, col: SNOW_W[0], bleed: SNOW_W[1], hull: true, solid: false };
    b.object(() => {
      A(CYL6, x, y + 3.2 * sc, z, P_TR, 0, 0, 0, [0.28 * sc, 6.4 * sc, 0.28 * sc]);
      for (const [dx, dy, dz, r] of [[0, 6.8, 0, 2.4], [1.4, 5.8, 0.7, 1.7], [-1.3, 6.0, -0.6, 1.8]]) {
        A(ICO, x + dx * sc, y + dy * sc, z + dz * sc, P_CR, 0, 0, 0, [r * sc, r * 0.62 * sc, r * sc]);
        A(ICO, x + dx * sc, y + (dy + r * 0.36) * sc, z + dz * sc, P_SN, 0, 0, 0, [r * 0.82 * sc, r * 0.28 * sc, r * 0.82 * sc]);
      }
    });
  }
  // Helper: layered cone spruce/fir ('jela') dusted with snow
  function addFir(x, z, sc = 1, tg = 'jela', orbId = 'jela') {
    const y = jahorinaGroundY(x, z);
    const F_TR = { tag: tg, col: '#583b25', bleed: '#3b2617', wall: true, orb: orbId };
    const F_CR = { tag: tg, col: FIR_G[0], bleed: FIR_G[1], hull: true, orb: orbId };
    const F_SN = { tag: tg, col: SNOW_W[0], bleed: SNOW_W[1], hull: true, solid: false };
    b.object(() => {
      A(CYL6, x, y + 1.5 * sc, z, F_TR, 0, 0, 0, [0.22 * sc, 3.0 * sc, 0.22 * sc]);
      for (const [dy, r, h] of [[2.8, 2.2, 2.8], [4.6, 1.75, 2.6], [6.2, 1.25, 2.3]]) {
        A(CONE, x, y + dy * sc, z, F_CR, 0, 0, 0, [r * sc, h * sc, r * sc]);
        A(CONE, x, y + (dy + 0.32) * sc, z, F_SN, 0, 0, 0, [r * 0.78 * sc, h * 0.45 * sc, r * 0.78 * sc]);
      }
    });
  }

  // Hero pine ('bor') at (-12, -26) with sticking-out snow-laden branch ('grana') & pinecones ('sisarka')!
  addPine(-12, -26, 1.25, 'bor', 'bor');
  // Prominent horizontal snow-dusted pine branch ('grana') + pinecones ('sisarka') on hero pine
  b.object(() => {
    const by = jahorinaGroundY(-12, -26);
    box(3.4, 0.24, 0.24, -10.2, by + 3.2, -25.2, { tag: 'grana', col: '#634128', bleed: '#452b18', orb: 'grana' }, -0.2, 0, -0.06);
    box(3.1, 0.14, 0.32, -10.2, by + 3.38, -25.2, { tag: 'grana', col: SNOW_W[0], bleed: SNOW_W[1], solid: false }, -0.2, 0, -0.06);
  });
  b.object(() => {
    const by = jahorinaGroundY(-12, -26);
    const SS = { tag: 'sisarka', col: '#784824', bleed: '#4e2c12', hull: true, orb: 'sisarka' };
    for (const [dx, dy, dz] of [[-9.6, 3.0, -25.0], [-9.1, 3.05, -24.85], [-10.5, 3.02, -25.25], [-10.1, 0.14, -24.0], [-9.5, 0.14, -23.7]]) {
      A(SPHERE, dx, by + dy, dz, SS, 0, 0, 0, [0.12, 0.18, 0.12]);
    }
  });

  // Hero fir/spruce ('jela') at (4, -26) with an owl branch at y + 3.6
  addFir(4, -26, 1.25, 'jela', 'jela');
  b.object(() => {
    const jy = jahorinaGroundY(4, -26);
    box(2.2, 0.18, 0.18, 5.2, jy + 3.4, -25.2, { tag: 'jela', col: '#583b25', orb: 'jela' }, -0.2);
  });

  // Additional pines & firs framing the forest, pond, chalets & ski slopes (budget friendly!)
  const pineCoords = [[-28, -32, 1.15], [-42, -38, 1.2], [-2, -42, 1.1], [-22, -48, 1.25], [-52, -46, 1.2], [58, -14, 1.05], [64, 10, 1.1], [34, 34, 1.15], [-34, 36, 1.2], [38, 62, 1.2], [-30, 74, 1.15]];
  for (const [px, pz, ps] of pineCoords) addPine(px, pz, ps, 'bor', 'bor');

  const firCoords = [[14, -36, 1.15], [-18, -36, 1.1], [24, -44, 1.2], [60, -2, 1.15], [56, 18, 1.1], [32, 24, 1.1], [34, 48, 1.2], [36, 78, 1.15], [-28, 24, 1.15], [-36, 52, 1.2], [-18, -56, 1.25], [8, -54, 1.2]];
  for (const [fx, fz, fs] of firCoords) addFir(fx, fz, fs, 'jela', 'jela');

  // Rocky snowy crag for the mountain wolf ('vuk') at (-34, y, -54)
  const wolfCragY = jahorinaGroundY(-34, -54);
  b.object(() => {
    A(ICO, -34, wolfCragY + 1.6, -54, PR_S, 0, 0, 0, [4.6, 2.8, 3.8]);
    A(ICO, -34, wolfCragY + 3.4, -54, { tag: 'props', col: SNOW_W[0], bleed: SNOW_W[1] }, 0, 0, 0, [3.6, 0.7, 2.8]);
  });

  // Snow fence perch for the glossy black crow ('vrana') at (26, PLATEAU_Y, -4)
  b.object(() => {
    for (const fx of [24.5, 27.5]) A(CYL, fx, PLATEAU_Y + 0.55, -4, PR_W, 0, 0, 0, [0.09, 1.1, 0.09]);
    box(3.4, 0.12, 0.12, 26, PLATEAU_Y + 0.96, -4, PR_W);
  });

  // 6 Bosnian mountain wildlife species in world.jahAnimals!
  jahAnimals.push(
    { kind: 'fox',  tag: 'lisica', x: -24, y: jahorinaGroundY(-24, -34), z: -34, ry: 0.9, r: 2.2 },
    { kind: 'hare', tag: 'zec',    x: -4,  y: jahorinaGroundY(-4, -32),  z: -32, ry: 0.4 },
    { kind: 'owl',  tag: 'sova',   x: 5.8, y: jahorinaGroundY(4, -26) + 3.48, z: -25.1, ry: 0.3 },
    { kind: 'roe',  tag: 'srna',   x: -14, y: jahorinaGroundY(-14, -44), z: -44, ry: 0.5 },
    { kind: 'wolf', tag: 'vuk',    x: -34, y: wolfCragY + 3.95,          z: -54, ry: 0.7 },
    { kind: 'crow', tag: 'vrana',  x: 26,  y: PLATEAU_Y + 1.02,          z: -4,  ry: -0.6 },
  );

  // ==================== 8. ZONE 7: OGORJELICA SUMMIT, RAJSKA DOLINA & WEATHER ====================
  // Rajska dolina bowl marker snow terrain ('dolina') + hovering soft mist cloud band ('magla')
  b.object(() => {
    const dy = jahorinaGroundY(-52, 62);
    A(ICO, -52, dy + 0.2, 62, { tag: 'dolina', col: '#e6eff8', bleed: '#bdd2e8', solid: false, ink: false, orb: 'dolina' }, 0, 0, 0, [22, 1.6, 20]);
  });
  b.object(() => {
    const my = jahorinaGroundY(-52, 62) + 4.8;
    const MG = { tag: 'magla', col: '#eef4fa', bleed: '#d2deec', hull: true, solid: false, orb: 'magla' };
    for (const [dx, dz, rx, rz] of [[0, 0, 14, 7.5], [-10, 6, 11, 6.2], [11, -5, 12, 6.8]]) {
      A(ICO, -52 + dx, my, 62 + dz, MG, 0, 0, 0, [rx, 1.8, rz]);
    }
  });

  // Rocky snowy Ogorjelica mountain ridge ('greben') running east-west behind the summit at z = 114
  b.object(() => {
    const GR = { tag: 'greben', col: '#9aa4b0', bleed: '#6e7886', hull: true, orb: 'greben' };
    const GS = { tag: 'greben', col: SNOW_W[0], bleed: SNOW_W[1], hull: true, solid: false };
    for (const [gx, gz, rx, ry, rz] of [[-26, 115, 16, 6.5, 8], [-6, 117, 18, 7.8, 9], [16, 116, 17, 7.2, 8.5], [34, 114, 14, 5.8, 7.5]]) {
      A(ICO, gx, 31.5 + ry * 0.35, gz, GR, 0, 0, 0, [rx, ry, rz]);
      A(ICO, gx, 31.5 + ry * 0.72, gz, GS, 0, 0, 0, [rx * 0.85, ry * 0.36, rz * 0.82]);
    }
  });

  // Summit timber lookout platform ('vidikovac') at (-8, 32.0, 106) looking north over the whole mountain!
  b.object(() => {
    const vx = -8, vy = 32.0, vz = 106;
    const VD = { tag: 'vidikovac', col: WOOD_L[0], bleed: WOOD_L[1], pat: PAT.planks, ps: 3, orb: 'vidikovac' };
    box(7.6, 0.35, 5.2, vx, vy + 0.25, vz, VD);
    for (const dx of [-3.5, 0, 3.5]) {
      A(CYL, vx + dx, vy + 0.85, vz - 2.4, { ...VD, wall: true }, 0, 0, 0, [0.1, 1.15, 0.1]);
    }
    box(7.4, 0.14, 0.14, vx, vy + 1.38, vz - 2.4, VD);
    box(2.2, 0.12, 0.55, vx, vy + 0.82, vz + 1.6, VD);
  });

  // Orange-and-white ridge windsock ('vjetar') at (6, 32.0, 105)
  b.object(() => {
    A(CYL, 6, 32.0 + 2.1, 105, { tag: 'vjetar', col: '#5a626a', wall: true, orb: 'vjetar' }, 0, 0, 0, [0.07, 4.2, 0.07]);
  });
  const windsock = new THREE.Group(); windsock.position.set(6, 32.0 + 4.1, 105); scene.add(windsock);
  {
    const wMat = washMat('vjetar');
    for (let i = 0; i < 4; i++) {
      const col = i % 2 ? '#f7f7f5' : '#eb5e24';
      const r0 = 0.28 - i * 0.045, r1 = 0.235 - i * 0.045;
      const m = new THREE.Mesh(paintGeo(new THREE.CylinderGeometry(r1, r0, 0.48, 10).rotateZ(-Math.PI / 2).translate(0.28 + i * 0.46, 0, 0), { col, bleed: col, seed: [6, 36.1, 105], radius: 5, dur: 2.2, hatch: 0.3 }), wMat);
      addHull(m, 1.3); windsock.add(m);
    }
  }

  // Ogorjelica Summit cairn & Olympic peak sign ('vrh': Stage 2 LAST ORB!) at (0, 32.0, 108)
  b.object(() => {
    const px = 0, py = 32.0, pz = 108;
    const VR = { tag: 'vrh', col: '#8a94a0', bleed: '#5f6874', pat: PAT.blocks, ps: 0.7, hull: true, orb: 'vrh' };
    A(CYL6, px, py + 0.7, pz, VR, 0, 0, 0, [2.2, 1.4, 2.2]);
    A(CYL6, px, py + 1.8, pz, VR, 0, 0, 0, [1.4, 1.1, 1.4]);
    A(CYL, px, py + 3.2, pz, { tag: 'vrh', col: WOOD_D[0], wall: true, orb: 'vrh' }, 0, 0, 0, [0.14, 3.0, 0.14]);
    box(2.2, 0.65, 0.16, px, py + 4.2, pz, { tag: 'vrh', col: '#d94c2c', bleed: '#a6341a', orb: 'vrh' });
  });

  // ==================== 9. PEOPLE (22 WINTER FIGURES, ALL BRAND-NEW jah* KINDS) ====================
  const skiPath1 = [[-2, jahorinaGroundY(-2, 92), 92], [-7, jahorinaGroundY(-7, 68), 68], [-2, jahorinaGroundY(-2, 42), 42], [2, jahorinaGroundY(2, 24), 24]];
  const skiPath2 = [[3, jahorinaGroundY(3, 86), 86], [-2, jahorinaGroundY(-2, 60), 60], [-6, jahorinaGroundY(-6, 36), 36], [-3, jahorinaGroundY(-3, 22), 22]];
  const sledPath = [[38, jahorinaGroundY(38, -36), -36], [36, jahorinaGroundY(36, -24), -24], [35, jahorinaGroundY(35, -15), -15]];

  people.push(
    // Poljice snowball throwers ('bacati')
    { kind: 'jahThrow', tag: 'bacati', x: 1.8, y: PLATEAU_Y, z: 8.2, ry: 1.4, sc: 0.72, beanie: true, hatCol: '#2e6aa8', top: '#c44634' },
    { kind: 'jahThrow', tag: 'bacati', x: 5.4, y: PLATEAU_Y, z: 7.8, ry: -1.6, sc: 0.72, woman: true, scarfChoice: 'no', beanie: true, hatCol: '#d48a28', top: '#3c7a5c' },

    // Woodcutter chopping logs ('cijepati', holds 'sjekira')
    { kind: 'jahChop', tag: 'cijepati', x: -19.2, y: PLATEAU_Y, z: 7.45, ry: Math.PI, beanie: true, hatCol: '#584434', top: '#7a422e' },
    // Woman clearing snow off cabin path ('cistiti', holds 'lopata')
    { kind: 'jahShovel', tag: 'cistiti', x: -14.8, y: PLATEAU_Y, z: 1.2, ry: 1.1, woman: true, scarfChoice: 'no', beanie: true, hatCol: '#b84c3c', top: '#4a6b7c' },

    // Two hikers warming hands at the outdoor hearth fire ('grijati')
    { kind: 'jahWarm', tag: 'grijati', x: -12.6, y: PLATEAU_Y, z: -9.5, ry: -Math.PI / 2, beanie: true, hatCol: '#3a5e4a', top: '#685042' },
    { kind: 'jahWarm', tag: 'grijati', x: -14.0, y: PLATEAU_Y, z: -8.1, ry: Math.PI, woman: true, scarfChoice: 'no', beanie: true, hatCol: '#c45a3a', top: '#5a4e68' },

    // Cabin terrace winter clothing figures: patterned sweater ('dzemper'), padded jacket ('jakna'), shivering ('hladno')
    { kind: 'stand', tag: 'passerby', x: -14.8, y: PLATEAU_Y, z: -4.2, ry: 1.4, woman: true, scarfChoice: 'no', topTag: 'dzemper', topCol: '#3b7466', topBleed: '#265246', beanie: true, hatCol: '#e0b03a' },
    { kind: 'stand', tag: 'passerby', x: -14.8, y: PLATEAU_Y, z: -5.8, ry: 1.2, topTag: 'jakna', topCol: '#c84232', topBleed: '#8e281e', padded: true, beanie: true, hatCol: '#2e4a6e' },
    { kind: 'jahShiver', tag: 'hladno', x: -11.4, y: PLATEAU_Y, z: -4.6, ry: 0.7, beanie: true, hatCol: '#486078', top: '#587088' },

    // Sledding hill: sledding child ('sankati'), parent pulling sled uphill ('vuci'), laughing child ('smijati')
    { kind: 'jahSledRide', tag: 'sankati', x: 37.0, y: jahorinaGroundY(37, -30), z: -30, ry: 0.1, sc: 0.72, beanie: true, hatCol: '#d44234', top: '#3c70a8', path: sledPath },
    { kind: 'jahSledPull', tag: 'vuci', x: 42.5, y: jahorinaGroundY(42.5, -24), z: -24, ry: Math.PI, woman: true, scarfChoice: 'no', beanie: true, hatCol: '#c87c2c', top: '#6b4a5e' },
    { kind: 'jahLaugh', tag: 'smijati', x: 31.8, y: jahorinaGroundY(31.8, -18), z: -18, ry: 0.8, sc: 0.7, woman: true, scarfChoice: 'no', beanie: true, hatCol: '#e0a22e', top: '#c44a3a' },

    // Frozen pond: 2 graceful ice skaters ('klizati', boots have 'klizaljke') + 1 slipping figure ('klizavo')
    { kind: 'jahSkater', tag: 'klizati', x: 46.0, y: PLATEAU_Y + 0.16, z: 3.5, ry: 0.8, woman: true, scarfChoice: 'no', beanie: true, hatCol: '#c43e4c', top: '#2e5d8c', orbit: { cx: 48, cz: 2, rx: 7.5, rz: 5.5, speed: 0.42 } },
    { kind: 'jahSkater', tag: 'klizati', x: 52.5, y: PLATEAU_Y + 0.16, z: -0.5, ry: -2.2, beanie: true, hatCol: '#386e52', top: '#b85c34', orbit: { cx: 48, cz: 2, rx: 5.2, rz: 3.8, speed: -0.52 } },
    { kind: 'jahSlip', tag: 'klizavo', x: 37.2, y: PLATEAU_Y + 0.16, z: 4.2, ry: -0.8, beanie: true, hatCol: '#4a5a70', top: '#c47a2e' },

    // Ski slope: hero skier ('skijas' with 'skije', 'stapovi', 'kaciga', 'naocale'), second carving skier ('skijati'), tumbled beginner ('padati')
    { kind: 'jahSkier', tag: 'skijas', x: -3.2, y: jahorinaGroundY(-3.2, 46), z: 46, ry: Math.PI, helmetTag: 'kaciga', helmetCol: '#2458a6', gogglesTag: 'naocale', gogglesCol: '#f08222', top: '#d43a2c', skiCol: '#2458a6', path: skiPath1, speed: 0.10 },
    { kind: 'jahSkier', tag: 'skijati', x: -5.2, y: jahorinaGroundY(-5.2, 62), z: 62, ry: Math.PI, woman: true, scarfChoice: 'no', helmetTag: 'kaciga', helmetCol: '#d44834', gogglesTag: 'naocale', gogglesCol: '#3498c8', top: '#2c7a5c', skiCol: '#d44834', path: skiPath2, speed: 0.11 },
    { kind: 'jahTumble', tag: 'padati', x: 4.5, y: jahorinaGroundY(4.5, 34), z: 34, ry: -0.6, beanie: true, hatCol: '#d99a28', top: '#5a4e7c' },

    // Summit lookout admirer ('passerby' finale)
    { kind: 'stand', tag: 'passerby', x: -8.0, y: 32.42, z: 105.2, ry: Math.PI, woman: true, scarfChoice: 'no', beanie: true, hatCol: '#c44834', top: '#3c6858' },
  );

  // ==================== 10. ALL 75 ORBS (CLEAR CAMERAS & REACHABLE LANDINGS) ====================
  // Zone 1: Poljice Plateau & 1984 Olympic Plaza (11)
  orb('snijeg', [0, PLATEAU_Y + 0.3, 4], 14, ['snijeg'], 'combo', PLATEAU_Y, {
    stage: 0, at: V(0, PLATEAU_Y + 2.1, 4), near: { p: [0, PLATEAU_Y + 0.2, 4], r: 5.5 },
    view: { from: [8, PLATEAU_Y + 5.5, 15], to: [-8, PLATEAU_Y + 5.5, 14], look: [0, PLATEAU_Y + 0.4, 3] },
    wideView: { from: [24, PLATEAU_Y + 18, 28], to: [-24, PLATEAU_Y + 18, 26], look: [0, PLATEAU_Y + 1, 0], lookTo: [0, PLATEAU_Y + 1, 0] },
  });
  orb('pahulja', [-4, PLATEAU_Y + 3.4, -8], 3.0, ['pahulja'], 'close', PLATEAU_Y + 1.0, {
    at: V(-4, PLATEAU_Y + 2.4, -5.2), near: { p: [-4, PLATEAU_Y + 0.2, -5.2], r: 4.2 },
    view: { from: [-9, PLATEAU_Y + 4.4, -1.5], to: [1, PLATEAU_Y + 4.4, -1.5], look: [-4, PLATEAU_Y + 3.4, -8] },
  });
  orb('pet', [6, PLATEAU_Y + 2.4, -4], 3.8, ['pet'], 'close', PLATEAU_Y + 1.2, {
    at: V(6, PLATEAU_Y + 2.4, -1.0), near: { p: [6, PLATEAU_Y + 0.2, -1.0], r: 4.5 },
    view: { from: [1, PLATEAU_Y + 3.4, 3.5], to: [11, PLATEAU_Y + 3.4, 3.5], look: [6, PLATEAU_Y + 2.4, -4] },
  });
  orb('putokaz', [14, PLATEAU_Y + 2.0, 6], 2.2, ['putokaz'], 'close', PLATEAU_Y + 1.5, {
    at: V(14, PLATEAU_Y + 2.4, 8.2), near: { p: [14, PLATEAU_Y + 0.2, 8.2], r: 4.0 },
    view: { from: [10.5, PLATEAU_Y + 3.0, 11.5], to: [17.5, PLATEAU_Y + 3.0, 11.5], look: [14, PLATEAU_Y + 2.0, 6] },
  });
  orb('snjesko', [-8, PLATEAU_Y + 1.6, 6], 2.4, ['snjesko'], 'close', PLATEAU_Y + 0.4, {
    at: V(-8, PLATEAU_Y + 2.4, 8.8), near: { p: [-8, PLATEAU_Y + 0.2, 8.8], r: 4.0 },
    view: { from: [-11.5, PLATEAU_Y + 2.8, 11.2], to: [-4.5, PLATEAU_Y + 2.8, 11.2], look: [-8, PLATEAU_Y + 1.6, 6] },
  });
  orb('mrkva', [-8, PLATEAU_Y + 2.46, 6.55], 0.9, ['mrkva'], 'close', PLATEAU_Y + 1.8, {
    requires: ['snjesko'], at: V(-7.2, PLATEAU_Y + 2.5, 8.0), near: { p: [-7.2, PLATEAU_Y + 0.2, 8.0], r: 3.6 },
    view: { from: [-9.5, PLATEAU_Y + 2.8, 8.6], to: [-6.5, PLATEAU_Y + 2.8, 8.6], look: [-8, PLATEAU_Y + 2.46, 6.55] },
  });
  orb('kapa', [-8, PLATEAU_Y + 3.1, 6], 1.1, ['kapa'], 'close', PLATEAU_Y + 2.5, {
    requires: ['snjesko'], at: V(-9.2, PLATEAU_Y + 2.6, 7.6), near: { p: [-9.2, PLATEAU_Y + 0.2, 7.6], r: 3.6 },
    view: { from: [-10.8, PLATEAU_Y + 3.8, 8.8], to: [-5.5, PLATEAU_Y + 3.8, 8.8], look: [-8, PLATEAU_Y + 3.1, 6] },
  });
  orb('rukavice', [-6.7, PLATEAU_Y + 2.0, 6], 1.2, ['rukavice'], 'close', PLATEAU_Y + 1.8, {
    requires: ['snjesko'], at: V(-6.4, PLATEAU_Y + 2.2, 7.2), near: { p: [-6.4, PLATEAU_Y + 0.2, 7.2], r: 3.6 },
    view: { from: [-5.2, PLATEAU_Y + 2.6, 9.2], to: [-10.6, PLATEAU_Y + 2.6, 9.2], look: [-8, PLATEAU_Y + 2.0, 6] },
  });
  orb('grudva', [3.0, PLATEAU_Y + 0.25, 8.0], 1.2, ['grudva'], 'close', PLATEAU_Y + 0.4, {
    at: V(3.0, PLATEAU_Y + 2.0, 9.4), near: { p: [3.0, PLATEAU_Y + 0.2, 9.4], r: 3.6 },
    view: { from: [1.2, PLATEAU_Y + 1.4, 10.6], to: [4.8, PLATEAU_Y + 1.4, 10.6], look: [3.0, PLATEAU_Y + 0.25, 8.0] },
  });
  orb('bacati', [3.6, PLATEAU_Y + 1.0, 8.0], 2.8, ['bacati'], 'close', PLATEAU_Y + 1.2, {
    requires: ['grudva'], at: V(3.6, PLATEAU_Y + 2.3, 10.4), near: { p: [3.6, PLATEAU_Y + 0.2, 10.4], r: 4.2 },
    view: { from: [0.5, PLATEAU_Y + 2.6, 13.5], to: [7.0, PLATEAU_Y + 2.6, 13.5], look: [3.6, PLATEAU_Y + 1.0, 8.0] },
  });
  orb('bijela', [0, 14, 52], 32, ['bijela'], 'combo', PLATEAU_Y + 1, {
    at: V(8, PLATEAU_Y + 2.4, 14), near: { p: [8, PLATEAU_Y + 0.2, 14], r: 5.0 },
    view: { from: [14, PLATEAU_Y + 14, 4], to: [-14, PLATEAU_Y + 14, 4], look: [0, 14, 56] },
    wideView: { from: [46, 36, -18], to: [-44, 38, -14], look: [0, 14, 54], lookTo: [0, 16, 62] },
  });

  // Zone 2: Planinarski dom & Vikendice Village (14)
  orb('koliba', [-24, PLATEAU_Y + 3.8, -4], 9.0, ['koliba'], 'combo', PLATEAU_Y + 4.5, {
    at: V(-14.5, PLATEAU_Y + 2.5, -4), near: { p: [-14.5, PLATEAU_Y + 0.2, -4], r: 4.8 },
    view: { from: [-6, PLATEAU_Y + 7.5, 8], to: [-6, PLATEAU_Y + 7.5, -14], look: [-24, PLATEAU_Y + 3.8, -4] },
    wideView: { from: [2, PLATEAU_Y + 14, 14], to: [0, PLATEAU_Y + 14, -20], look: [-24, PLATEAU_Y + 3.8, -4], lookTo: [-24, PLATEAU_Y + 3.8, -4] },
  });
  orb('vikendica', [-46, jahorinaGroundY(-46, -10) + 3.2, -10], 11.0, ['vikendica'], 'combo', PLATEAU_Y + 4, {
    at: V(-36, jahorinaGroundY(-36, -6) + 2.6, -6), near: { p: [-36, jahorinaGroundY(-36, -6) + 0.3, -6], r: 5.0 },
    view: { from: [-28, PLATEAU_Y + 12, 8], to: [-30, PLATEAU_Y + 12, -22], look: [-48, PLATEAU_Y + 3.5, -8] },
    wideView: { from: [-14, 24, 22], to: [-20, 26, -34], look: [-46, 8, -8], lookTo: [-46, 8, -10] },
  });
  orb('ledenica', [-17.2, PLATEAU_Y + 2.7, -4.5], 2.5, ['ledenica'], 'close', PLATEAU_Y + 2.2, {
    requires: ['koliba'], at: V(-15.2, PLATEAU_Y + 2.8, -4.5), near: { p: [-15.2, PLATEAU_Y + 0.2, -4.5], r: 3.8 },
    view: { from: [-13.5, PLATEAU_Y + 3.1, -1.5], to: [-13.5, PLATEAU_Y + 3.1, -7.5], look: [-17.2, PLATEAU_Y + 2.7, -4.5] },
  });
  orb('fenjer', [-17.1, PLATEAU_Y + 2.35, -4.0], 1.1, ['fenjer'], 'close', PLATEAU_Y + 1.8, {
    requires: ['koliba'], at: V(-15.4, PLATEAU_Y + 2.3, -3.2), near: { p: [-15.4, PLATEAU_Y + 0.2, -3.2], r: 3.6 },
    view: { from: [-14.2, PLATEAU_Y + 2.5, -2.0], to: [-14.2, PLATEAU_Y + 2.5, -5.6], look: [-17.1, PLATEAU_Y + 2.35, -4.0] },
  });
  orb('drva', [-22.1, PLATEAU_Y + 0.7, 4.6], 2.0, ['drva'], 'close', PLATEAU_Y + 0.8, {
    at: V(-22.1, PLATEAU_Y + 2.2, 6.8), near: { p: [-22.1, PLATEAU_Y + 0.2, 6.8], r: 3.8 },
    view: { from: [-24.8, PLATEAU_Y + 2.2, 8.8], to: [-19.4, PLATEAU_Y + 2.2, 8.8], look: [-22.1, PLATEAU_Y + 0.7, 4.6] },
  });
  orb('panj', [-19.2, PLATEAU_Y + 0.5, 6.4], 1.2, ['panj'], 'close', PLATEAU_Y + 0.9, {
    at: V(-18.2, PLATEAU_Y + 2.0, 5.2), near: { p: [-18.2, PLATEAU_Y + 0.2, 5.2], r: 3.6 },
    view: { from: [-16.6, PLATEAU_Y + 1.8, 4.4], to: [-21.4, PLATEAU_Y + 1.8, 4.4], look: [-19.2, PLATEAU_Y + 0.5, 6.4] },
  });
  orb('sjekira', [-19.2, PLATEAU_Y + 1.2, 6.9], 1.3, ['sjekira'], 'close', PLATEAU_Y + 1.4, {
    requires: ['panj'], at: V(-17.8, PLATEAU_Y + 2.1, 7.6), near: { p: [-17.8, PLATEAU_Y + 0.2, 7.6], r: 3.6 },
    view: { from: [-16.0, PLATEAU_Y + 2.1, 5.8], to: [-16.0, PLATEAU_Y + 2.1, 9.2], look: [-19.2, PLATEAU_Y + 1.2, 6.9] },
  });
  orb('cijepati', [-19.2, PLATEAU_Y + 1.1, 7.45], 1.8, ['cijepati'], 'close', PLATEAU_Y + 1.5, {
    requires: ['panj'], at: V(-19.2, PLATEAU_Y + 2.4, 9.6), near: { p: [-19.2, PLATEAU_Y + 0.2, 9.6], r: 3.8 },
    view: { from: [-15.8, PLATEAU_Y + 2.4, 9.8], to: [-22.4, PLATEAU_Y + 2.4, 9.8], look: [-19.2, PLATEAU_Y + 1.1, 7.2] },
  });
  orb('lopata', [-14.2, PLATEAU_Y + 0.7, 1.5], 1.3, ['lopata'], 'close', PLATEAU_Y + 1.0, {
    at: V(-13.4, PLATEAU_Y + 2.0, 2.2), near: { p: [-13.4, PLATEAU_Y + 0.2, 2.2], r: 3.6 },
    view: { from: [-11.4, PLATEAU_Y + 2.1, 3.6], to: [-11.8, PLATEAU_Y + 2.1, -0.8], look: [-14.4, PLATEAU_Y + 0.8, 1.4] },
  });
  orb('cistiti', [-14.8, PLATEAU_Y + 1.1, 1.2], 1.8, ['cistiti'], 'close', PLATEAU_Y + 1.4, {
    requires: ['lopata'], at: V(-13.2, PLATEAU_Y + 2.3, 0.2), near: { p: [-13.2, PLATEAU_Y + 0.2, 0.2], r: 3.8 },
    view: { from: [-10.8, PLATEAU_Y + 2.4, 4.0], to: [-11.2, PLATEAU_Y + 2.4, -1.4], look: [-14.8, PLATEAU_Y + 1.0, 1.2] },
  });
  orb('vatra', [-14.0, PLATEAU_Y + 0.55, -9.5], 1.6, ['vatra'], 'close', PLATEAU_Y + 0.8, {
    at: V(-14.0, PLATEAU_Y + 2.2, -11.4), near: { p: [-14.0, PLATEAU_Y + 0.2, -11.4], r: 3.8 },
    view: { from: [-11.2, PLATEAU_Y + 2.2, -12.6], to: [-16.8, PLATEAU_Y + 2.2, -12.6], look: [-14.0, PLATEAU_Y + 0.55, -9.5] },
  });
  orb('pec', [-18.8, PLATEAU_Y + 1.2, -7.8], 1.6, ['pec'], 'close', PLATEAU_Y + 1.2, {
    requires: ['koliba'], at: V(-16.6, PLATEAU_Y + 2.1, -7.8), near: { p: [-16.6, PLATEAU_Y + 0.2, -7.8], r: 3.6 },
    view: { from: [-15.8, PLATEAU_Y + 2.1, -6.8], to: [-15.8, PLATEAU_Y + 2.1, -9.2], look: [-18.8, PLATEAU_Y + 1.1, -7.8] },
  });
  orb('grijati', [-13.3, PLATEAU_Y + 1.0, -8.8], 2.2, ['grijati'], 'close', PLATEAU_Y + 1.2, {
    requires: ['vatra'], at: V(-11.4, PLATEAU_Y + 2.2, -8.6), near: { p: [-11.4, PLATEAU_Y + 0.2, -8.6], r: 3.8 },
    view: { from: [-9.8, PLATEAU_Y + 2.5, -6.2], to: [-11.2, PLATEAU_Y + 2.5, -12.2], look: [-13.5, PLATEAU_Y + 1.0, -9.0] },
  });
  orb('tragovi', [-13.8, PLATEAU_Y + 0.1, -0.8], 3.2, ['tragovi'], 'close', PLATEAU_Y + 0.2, {
    at: V(-11.5, PLATEAU_Y + 1.9, -0.8), near: { p: [-11.5, PLATEAU_Y + 0.2, -0.8], r: 3.8 },
    view: { from: [-9.2, PLATEAU_Y + 3.4, 2.8], to: [-9.2, PLATEAU_Y + 3.4, -4.4], look: [-14.0, PLATEAU_Y + 0.1, -0.8] },
  });

  // Zone 3: Warm Cabin Terrace, Food & Winter Clothes (12)
  orb('caj', [-18.35, PLATEAU_Y + 1.35, -2.28], 0.9, ['caj'], 'close', PLATEAU_Y + 1.2, {
    at: V(-17.0, PLATEAU_Y + 2.1, -2.4), near: { p: [-17.0, PLATEAU_Y + 0.2, -2.4], r: 3.4 },
    view: { from: [-16.6, PLATEAU_Y + 2.2, -1.2], to: [-16.6, PLATEAU_Y + 2.2, -3.4], look: [-18.35, PLATEAU_Y + 1.35, -2.28] },
  });
  orb('solja', [-18.35, PLATEAU_Y + 1.3, -2.45], 0.9, ['solja'], 'close', PLATEAU_Y + 1.2, {
    requires: ['caj'], at: V(-17.0, PLATEAU_Y + 2.1, -3.0), near: { p: [-17.0, PLATEAU_Y + 0.2, -3.0], r: 3.4 },
    view: { from: [-16.5, PLATEAU_Y + 2.1, -1.6], to: [-16.8, PLATEAU_Y + 2.1, -3.6], look: [-18.35, PLATEAU_Y + 1.3, -2.45] },
  });
  orb('med', [-18.75, PLATEAU_Y + 1.35, -2.32], 0.9, ['med'], 'close', PLATEAU_Y + 1.2, {
    at: V(-17.2, PLATEAU_Y + 2.1, -2.0), near: { p: [-17.2, PLATEAU_Y + 0.2, -2.0], r: 3.4 },
    view: { from: [-16.6, PLATEAU_Y + 2.2, -1.0], to: [-16.6, PLATEAU_Y + 2.2, -3.4], look: [-18.75, PLATEAU_Y + 1.35, -2.32] },
  });
  orb('hljeb', [-18.45, PLATEAU_Y + 1.3, -1.55], 0.9, ['hljeb'], 'close', PLATEAU_Y + 1.2, {
    at: V(-17.0, PLATEAU_Y + 2.1, -1.55), near: { p: [-17.0, PLATEAU_Y + 0.2, -1.55], r: 3.4 },
    view: { from: [-16.6, PLATEAU_Y + 2.1, -0.4], to: [-16.6, PLATEAU_Y + 2.1, -2.7], look: [-18.45, PLATEAU_Y + 1.3, -1.55] },
  });
  orb('sir', [-18.88, PLATEAU_Y + 1.28, -1.32], 0.9, ['sir'], 'close', PLATEAU_Y + 1.2, {
    at: V(-17.1, PLATEAU_Y + 2.1, -1.1), near: { p: [-17.1, PLATEAU_Y + 0.2, -1.1], r: 3.4 },
    view: { from: [-16.6, PLATEAU_Y + 2.1, -0.1], to: [-16.6, PLATEAU_Y + 2.1, -2.5], look: [-18.88, PLATEAU_Y + 1.28, -1.32] },
  });
  orb('supa', [-18.4, PLATEAU_Y + 1.3, -0.78], 0.9, ['supa'], 'close', PLATEAU_Y + 1.2, {
    at: V(-17.0, PLATEAU_Y + 2.1, -0.7), near: { p: [-17.0, PLATEAU_Y + 0.2, -0.7], r: 3.4 },
    view: { from: [-16.5, PLATEAU_Y + 2.1, 0.4], to: [-16.5, PLATEAU_Y + 2.1, -1.9], look: [-18.4, PLATEAU_Y + 1.3, -0.78] },
  });
  orb('termos', [-18.85, PLATEAU_Y + 1.45, -0.55], 1.0, ['termos'], 'close', PLATEAU_Y + 1.3, {
    at: V(-17.2, PLATEAU_Y + 2.1, -0.2), near: { p: [-17.2, PLATEAU_Y + 0.2, -0.2], r: 3.4 },
    view: { from: [-16.5, PLATEAU_Y + 2.2, 0.8], to: [-16.5, PLATEAU_Y + 2.2, -1.7], look: [-18.85, PLATEAU_Y + 1.45, -0.55] },
  });
  orb('deka', [-19.8, PLATEAU_Y + 0.9, -1.6], 1.4, ['deka'], 'close', PLATEAU_Y + 1.0, {
    at: V(-19.8, PLATEAU_Y + 2.1, -0.1), near: { p: [-19.8, PLATEAU_Y + 0.2, -0.1], r: 3.6 },
    view: { from: [-17.2, PLATEAU_Y + 2.4, 0.8], to: [-17.2, PLATEAU_Y + 2.4, -3.6], look: [-19.8, PLATEAU_Y + 0.9, -1.6] },
  });
  orb('cizme', [-17.5, PLATEAU_Y + 0.65, 0.4], 1.0, ['cizme'], 'close', PLATEAU_Y + 0.6, {
    at: V(-16.4, PLATEAU_Y + 1.9, 0.8), near: { p: [-16.4, PLATEAU_Y + 0.2, 0.8], r: 3.4 },
    view: { from: [-15.8, PLATEAU_Y + 1.7, 1.5], to: [-15.8, PLATEAU_Y + 1.7, -0.7], look: [-17.5, PLATEAU_Y + 0.65, 0.4] },
  });
  orb('dzemper', [-14.8, PLATEAU_Y + 1.25, -4.2], 1.2, ['dzemper'], 'close', PLATEAU_Y + 1.4, {
    at: V(-13.4, PLATEAU_Y + 2.1, -4.2), near: { p: [-13.4, PLATEAU_Y + 0.2, -4.2], r: 3.4 },
    view: { from: [-12.2, PLATEAU_Y + 1.8, -3.0], to: [-12.2, PLATEAU_Y + 1.8, -5.2], look: [-14.8, PLATEAU_Y + 1.25, -4.2] },
  });
  orb('jakna', [-14.8, PLATEAU_Y + 1.25, -5.8], 1.2, ['jakna'], 'close', PLATEAU_Y + 1.4, {
    at: V(-13.4, PLATEAU_Y + 2.1, -5.8), near: { p: [-13.4, PLATEAU_Y + 0.2, -5.8], r: 3.4 },
    view: { from: [-12.2, PLATEAU_Y + 1.8, -4.6], to: [-12.2, PLATEAU_Y + 1.8, -7.0], look: [-14.8, PLATEAU_Y + 1.25, -5.8] },
  });
  orb('hladno', [-11.4, PLATEAU_Y + 1.15, -4.6], 1.6, ['hladno'], 'close', PLATEAU_Y + 1.4, {
    at: V(-10.0, PLATEAU_Y + 2.1, -4.0), near: { p: [-10.0, PLATEAU_Y + 0.2, -4.0], r: 3.6 },
    view: { from: [-8.6, PLATEAU_Y + 2.0, -2.2], to: [-8.6, PLATEAU_Y + 2.0, -6.4], look: [-11.4, PLATEAU_Y + 1.15, -4.6] },
  });

  // Zone 4: Sledding Hill & Frozen Pond (10)
  orb('sanke', [34, PLATEAU_Y + 0.3, -12], 1.6, ['sanke'], 'close', PLATEAU_Y + 0.5, {
    at: V(34, PLATEAU_Y + 2.0, -10.2), near: { p: [34, PLATEAU_Y + 0.2, -10.2], r: 3.8 },
    view: { from: [31, PLATEAU_Y + 2.0, -8.5], to: [37, PLATEAU_Y + 2.0, -8.5], look: [34, PLATEAU_Y + 0.3, -12] },
  });
  orb('sankati', [37, jahorinaGroundY(37, -30) + 0.9, -30], 2.4, ['sankati'], 'close', jahorinaGroundY(37, -30) + 1.0, {
    requires: ['sanke'], at: V(37, jahorinaGroundY(37, -27) + 2.2, -27), near: { p: [37, jahorinaGroundY(37, -27) + 0.3, -27], r: 4.5 },
    view: { from: [32, jahorinaGroundY(37, -30) + 3.2, -23], to: [42, jahorinaGroundY(37, -30) + 3.2, -23], look: [37, jahorinaGroundY(37, -30) + 0.9, -30] },
  });
  orb('vuci', [42.5, jahorinaGroundY(42.5, -24) + 1.0, -24], 2.4, ['vuci'], 'close', jahorinaGroundY(42.5, -24) + 1.2, {
    at: V(44.5, jahorinaGroundY(44.5, -22) + 2.2, -22), near: { p: [44.5, jahorinaGroundY(44.5, -22) + 0.3, -22], r: 4.2 },
    view: { from: [47.5, jahorinaGroundY(42.5, -24) + 2.8, -20], to: [47.5, jahorinaGroundY(42.5, -24) + 2.8, -28], look: [42.5, jahorinaGroundY(42.5, -24) + 1.0, -24] },
  });
  orb('smijati', [31.8, jahorinaGroundY(31.8, -18) + 1.0, -18], 1.8, ['smijati'], 'close', jahorinaGroundY(31.8, -18) + 1.2, {
    at: V(30.4, jahorinaGroundY(30.4, -16) + 2.2, -16), near: { p: [30.4, jahorinaGroundY(30.4, -16) + 0.3, -16], r: 3.8 },
    view: { from: [28.2, jahorinaGroundY(31.8, -18) + 2.4, -14.5], to: [34.5, jahorinaGroundY(31.8, -18) + 2.4, -14.5], look: [31.8, jahorinaGroundY(31.8, -18) + 1.0, -18] },
  });
  orb('jezero', [48, PLATEAU_Y, 2], 14, ['jezero'], 'combo', PLATEAU_Y, {
    at: V(48, PLATEAU_Y + 2.4, 12.5), near: { p: [48, PLATEAU_Y + 0.2, 12.5], r: 5.5 },
    view: { from: [48, PLATEAU_Y + 12, 22], to: [36, PLATEAU_Y + 12, 18], look: [48, PLATEAU_Y, 2] },
    wideView: { from: [32, PLATEAU_Y + 18, 22], to: [64, PLATEAU_Y + 18, 22], look: [48, PLATEAU_Y, 2], lookTo: [48, PLATEAU_Y, 2] },
  });
  orb('led', [48, PLATEAU_Y, 2], 11, ['led'], 'close', PLATEAU_Y, {
    requires: ['jezero'], at: V(48, PLATEAU_Y + 2.0, 2), near: { p: [48, PLATEAU_Y + 0.2, 2], r: 5.5 },
    view: { from: [38, PLATEAU_Y + 6.5, 13], to: [56, PLATEAU_Y + 6.5, 13], look: [48, PLATEAU_Y, 2] },
  });
  orb('klizaljke', [46.0, PLATEAU_Y + 0.2, 3.5], 1.1, ['klizaljke'], 'close', PLATEAU_Y + 0.3, {
    requires: ['led'], at: V(44.2, PLATEAU_Y + 1.9, 5.2), near: { p: [44.2, PLATEAU_Y + 0.2, 5.2], r: 3.8 },
    view: { from: [43.5, PLATEAU_Y + 1.3, 6.2], to: [48.2, PLATEAU_Y + 1.3, 6.2], look: [46.0, PLATEAU_Y + 0.35, 3.5] },
  });
  orb('klizati', [49.0, PLATEAU_Y + 1.0, 1.5], 4.5, ['klizati'], 'close', PLATEAU_Y + 1.2, {
    requires: ['led'], at: V(50.5, PLATEAU_Y + 2.2, 4.5), near: { p: [50.5, PLATEAU_Y + 0.2, 4.5], r: 4.5 },
    view: { from: [42, PLATEAU_Y + 4.5, 12], to: [56, PLATEAU_Y + 4.5, 12], look: [49, PLATEAU_Y + 1.0, 1.5] },
  });
  orb('klizavo', [37.2, PLATEAU_Y + 1.0, 4.2], 1.8, ['klizavo'], 'close', PLATEAU_Y + 1.2, {
    at: V(35.8, PLATEAU_Y + 2.1, 6.2), near: { p: [35.8, PLATEAU_Y + 0.2, 6.2], r: 3.8 },
    view: { from: [34.5, PLATEAU_Y + 2.4, 8.2], to: [40.2, PLATEAU_Y + 2.4, 8.2], look: [37.2, PLATEAU_Y + 1.0, 4.2] },
  });
  orb('mraz', [33.2, PLATEAU_Y + 0.95, 2.0], 3.2, ['mraz'], 'close', PLATEAU_Y + 1.0, {
    at: V(31.4, PLATEAU_Y + 2.1, 2.0), near: { p: [31.4, PLATEAU_Y + 0.2, 2.0], r: 3.8 },
    view: { from: [29.0, PLATEAU_Y + 2.2, 6.0], to: [29.0, PLATEAU_Y + 2.2, -2.0], look: [33.2, PLATEAU_Y + 0.9, 2.0] },
  });

  // Zone 5: Ski Slopes, Chairlift & Groomer (11)
  orb('staza', [-3, jahorinaGroundY(-3, 54), 54], 18, ['staza'], 'combo', jahorinaGroundY(-3, 24), {
    at: V(0, PLATEAU_Y + 2.4, 22), near: { p: [0, PLATEAU_Y + 0.2, 22], r: 5.5 },
    view: { from: [10, PLATEAU_Y + 12, 10], to: [-10, PLATEAU_Y + 12, 10], look: [-3, 14, 54] },
    wideView: { from: [28, 36, 12], to: [-28, 38, 12], look: [-2, 16, 62], lookTo: [0, 22, 82] },
  });
  orb('skije', [-3.2, jahorinaGroundY(-3.2, 46) + 0.3, 46], 1.8, ['skije'], 'close', jahorinaGroundY(-3.2, 46) + 0.4, {
    at: V(-1.2, jahorinaGroundY(-1.2, 44) + 2.2, 44), near: { p: [-1.2, jahorinaGroundY(-1.2, 44) + 0.3, 44], r: 4.0 },
    view: { from: [-6.0, jahorinaGroundY(-3.2, 46) + 2.2, 42.5], to: [0.0, jahorinaGroundY(-3.2, 46) + 2.2, 42.5], look: [-3.2, jahorinaGroundY(-3.2, 46) + 0.35, 46] },
  });
  orb('stapovi', [-3.2, jahorinaGroundY(-3.2, 46) + 0.9, 46], 1.6, ['stapovi'], 'close', jahorinaGroundY(-3.2, 46) + 1.0, {
    requires: ['skije'], at: V(-5.2, jahorinaGroundY(-5.2, 44) + 2.2, 44), near: { p: [-5.2, jahorinaGroundY(-5.2, 44) + 0.3, 44], r: 4.0 },
    view: { from: [-6.2, jahorinaGroundY(-3.2, 46) + 2.2, 43.0], to: [-0.2, jahorinaGroundY(-3.2, 46) + 2.2, 43.0], look: [-3.2, jahorinaGroundY(-3.2, 46) + 0.9, 46] },
  });
  orb('skijas', [-3.2, jahorinaGroundY(-3.2, 46) + 1.1, 46], 2.2, ['skijas'], 'close', jahorinaGroundY(-3.2, 46) + 1.2, {
    at: V(-3.2, jahorinaGroundY(-3.2, 42) + 2.4, 42), near: { p: [-3.2, jahorinaGroundY(-3.2, 42) + 0.3, 42], r: 4.5 },
    view: { from: [-7.2, jahorinaGroundY(-3.2, 46) + 2.8, 41.2], to: [1.0, jahorinaGroundY(-3.2, 46) + 2.8, 41.2], look: [-3.2, jahorinaGroundY(-3.2, 46) + 1.1, 46] },
  });
  orb('kaciga', [-3.2, jahorinaGroundY(-3.2, 46) + 1.85, 46], 1.0, ['kaciga'], 'close', jahorinaGroundY(-3.2, 46) + 1.8, {
    requires: ['skijas'], at: V(-1.4, jahorinaGroundY(-1.4, 46) + 2.3, 46), near: { p: [-1.4, jahorinaGroundY(-1.4, 46) + 0.3, 46], r: 3.8 },
    view: { from: [-5.4, jahorinaGroundY(-3.2, 46) + 2.4, 43.6], to: [-1.0, jahorinaGroundY(-3.2, 46) + 2.4, 43.6], look: [-3.2, jahorinaGroundY(-3.2, 46) + 1.75, 46] },
  });
  orb('naocale', [-3.2, jahorinaGroundY(-3.2, 46) + 1.7, 46], 1.0, ['naocale'], 'close', jahorinaGroundY(-3.2, 46) + 1.7, {
    requires: ['skijas'], at: V(-5.0, jahorinaGroundY(-5.0, 46) + 2.3, 46), near: { p: [-5.0, jahorinaGroundY(-5.0, 46) + 0.3, 46], r: 3.8 },
    view: { from: [-5.0, jahorinaGroundY(-3.2, 46) + 2.2, 43.6], to: [-1.4, jahorinaGroundY(-3.2, 46) + 2.2, 43.6], look: [-3.2, jahorinaGroundY(-3.2, 46) + 1.7, 46] },
  });
  orb('skijati', [-5.2, jahorinaGroundY(-5.2, 62) + 1.1, 62], 2.6, ['skijati'], 'close', jahorinaGroundY(-5.2, 62) + 1.2, {
    at: V(-5.2, jahorinaGroundY(-5.2, 58) + 2.4, 58), near: { p: [-5.2, jahorinaGroundY(-5.2, 58) + 0.3, 58], r: 4.5 },
    view: { from: [-9.8, jahorinaGroundY(-5.2, 62) + 3.2, 56.5], to: [-0.8, jahorinaGroundY(-5.2, 62) + 3.2, 56.5], look: [-5.2, jahorinaGroundY(-5.2, 62) + 1.1, 62] },
  });
  orb('padati', [4.5, jahorinaGroundY(4.5, 34) + 0.7, 34], 2.0, ['padati'], 'close', jahorinaGroundY(4.5, 34) + 0.8, {
    at: V(4.5, jahorinaGroundY(4.5, 31) + 2.2, 31), near: { p: [4.5, jahorinaGroundY(4.5, 31) + 0.3, 31], r: 4.0 },
    view: { from: [1.0, jahorinaGroundY(4.5, 34) + 2.6, 29.5], to: [8.0, jahorinaGroundY(4.5, 34) + 2.6, 29.5], look: [4.5, jahorinaGroundY(4.5, 34) + 0.7, 34] },
  });
  orb('mreza', [6.5, jahorinaGroundY(6.5, 36) + 0.9, 36], 4.5, ['mreza'], 'close', jahorinaGroundY(6.5, 36) + 1.0, {
    at: V(9.8, jahorinaGroundY(9.8, 34) + 2.2, 34), near: { p: [9.8, jahorinaGroundY(9.8, 34) + 0.3, 34], r: 4.5 },
    view: { from: [12.5, jahorinaGroundY(6.5, 36) + 3.6, 28], to: [12.5, jahorinaGroundY(6.5, 36) + 4.4, 44], look: [6.5, jahorinaGroundY(6.5, 36) + 0.9, 36] },
  });
  orb('sjedez', [18, PLATEAU_Y + 4.0, 20], 9.0, ['sjedez'], 'combo', PLATEAU_Y + 4.5, {
    at: V(18, PLATEAU_Y + 6.4, 18.5), near: { p: [18, PLATEAU_Y + 4.6, 18.5], r: 5.5 },
    view: { from: [6, PLATEAU_Y + 10, 10], to: [30, PLATEAU_Y + 11, 14], look: [18, PLATEAU_Y + 5, 28] },
    wideView: { from: [36, 26, 20], to: [36, 48, 82], look: [18, 12, 48], lookTo: [18, 28, 92] },
  });
  orb('ratrak', [-16, PLATEAU_Y + 1.5, 20], 4.2, ['ratrak'], 'close', PLATEAU_Y + 2.0, {
    at: V(-16, PLATEAU_Y + 4.6, 20), near: { p: [-16, PLATEAU_Y + 3.0, 20], r: 5.2 },
    view: { from: [-9, PLATEAU_Y + 4.2, 13], to: [-22, PLATEAU_Y + 4.2, 13], look: [-16, PLATEAU_Y + 1.5, 20] },
  });

  // Zone 6: Spruce Forest & Bosnian Mountain Wildlife (10)
  orb('bor', [-12, jahorinaGroundY(-12, -26) + 4.5, -26], 4.5, ['bor'], 'combo', jahorinaGroundY(-12, -26) + 1.0, {
    at: V(-12, jahorinaGroundY(-12, -22) + 2.4, -22), near: { p: [-12, jahorinaGroundY(-12, -22) + 0.3, -22], r: 4.5 },
    view: { from: [-18, jahorinaGroundY(-12, -26) + 6.5, -16], to: [-6, jahorinaGroundY(-12, -26) + 6.5, -16], look: [-12, jahorinaGroundY(-12, -26) + 4.5, -26] },
    wideView: { from: [-34, 24, -10], to: [12, 24, -10], look: [-18, 11, -36], lookTo: [-24, 12, -40] },
  });
  orb('grana', [-10.2, jahorinaGroundY(-12, -26) + 3.3, -25.2], 2.0, ['grana'], 'close', jahorinaGroundY(-12, -26) + 3.4, {
    requires: ['bor'], at: V(-9.6, jahorinaGroundY(-12, -26) + 4.6, -24.6), near: { p: [-9.6, jahorinaGroundY(-12, -26) + 3.3, -24.6], r: 3.8 },
    view: { from: [-8.5, jahorinaGroundY(-12, -26) + 4.4, -21.2], to: [-12.0, jahorinaGroundY(-12, -26) + 4.4, -21.2], look: [-10.2, jahorinaGroundY(-12, -26) + 3.3, -25.2] },
  });
  orb('sisarka', [-9.6, jahorinaGroundY(-12, -26) + 3.0, -25.0], 1.1, ['sisarka'], 'close', jahorinaGroundY(-12, -26) + 3.0, {
    requires: ['bor'], at: V(-8.6, jahorinaGroundY(-12, -26) + 2.2, -23.5), near: { p: [-8.6, jahorinaGroundY(-12, -26) + 0.3, -23.5], r: 3.8 },
    view: { from: [-7.6, jahorinaGroundY(-12, -26) + 3.4, -22.2], to: [-10.8, jahorinaGroundY(-12, -26) + 3.4, -22.2], look: [-9.6, jahorinaGroundY(-12, -26) + 3.0, -25.0] },
  });
  orb('jela', [4, jahorinaGroundY(4, -26) + 4.0, -26], 4.2, ['jela'], 'combo', jahorinaGroundY(4, -26) + 1.0, {
    at: V(4, jahorinaGroundY(4, -22) + 2.4, -22), near: { p: [4, jahorinaGroundY(4, -22) + 0.3, -22], r: 4.5 },
    view: { from: [-2, jahorinaGroundY(4, -26) + 6.0, -16], to: [10, jahorinaGroundY(4, -26) + 6.0, -16], look: [4, jahorinaGroundY(4, -26) + 4.0, -26] },
    wideView: { from: [-10, 24, -10], to: [32, 24, -12], look: [8, 10, -34], lookTo: [18, 12, -42] },
  });
  orb('sova', [5.8, jahorinaGroundY(4, -26) + 3.8, -25.1], 1.1, ['sova'], 'close', jahorinaGroundY(4, -26) + 3.5, {
    requires: ['jela'], at: V(6.4, jahorinaGroundY(4, -26) + 4.8, -24.0), near: { p: [6.4, jahorinaGroundY(4, -26) + 3.5, -24.0], r: 3.8 },
    view: { from: [8.0, jahorinaGroundY(4, -26) + 4.4, -22.0], to: [4.2, jahorinaGroundY(4, -26) + 4.4, -22.0], look: [5.8, jahorinaGroundY(4, -26) + 3.8, -25.1] },
  });
  orb('lisica', [-24, jahorinaGroundY(-24, -34) + 0.6, -34], 1.5, ['lisica'], 'close', jahorinaGroundY(-24, -34) + 0.6, {
    at: V(-22, jahorinaGroundY(-22, -32) + 2.1, -32), near: { p: [-22, jahorinaGroundY(-22, -32) + 0.3, -32], r: 4.0 },
    view: { from: [-20.5, jahorinaGroundY(-24, -34) + 2.2, -30.5], to: [-27.0, jahorinaGroundY(-24, -34) + 2.2, -30.5], look: [-24, jahorinaGroundY(-24, -34) + 0.6, -34] },
  });
  orb('zec', [-4, jahorinaGroundY(-4, -32) + 0.45, -32], 1.1, ['zec'], 'close', jahorinaGroundY(-4, -32) + 0.4, {
    at: V(-4, jahorinaGroundY(-4, -29.5) + 2.0, -29.5), near: { p: [-4, jahorinaGroundY(-4, -29.5) + 0.3, -29.5], r: 3.8 },
    view: { from: [-1.5, jahorinaGroundY(-4, -32) + 1.8, -29.0], to: [-6.5, jahorinaGroundY(-4, -32) + 1.8, -29.0], look: [-4, jahorinaGroundY(-4, -32) + 0.45, -32] },
  });
  orb('srna', [-14, jahorinaGroundY(-14, -44) + 1.0, -44], 2.0, ['srna'], 'close', jahorinaGroundY(-14, -44) + 1.0, {
    at: V(-12, jahorinaGroundY(-12, -41) + 2.2, -41), near: { p: [-12, jahorinaGroundY(-12, -41) + 0.3, -41], r: 4.2 },
    view: { from: [-10, jahorinaGroundY(-14, -44) + 2.6, -39.5], to: [-18, jahorinaGroundY(-14, -44) + 2.6, -39.5], look: [-14, jahorinaGroundY(-14, -44) + 1.0, -44] },
  });
  orb('vuk', [-34, wolfCragY + 4.6, -54], 2.2, ['vuk'], 'close', wolfCragY + 4.0, {
    at: V(-31.5, wolfCragY + 5.8, -51.5), near: { p: [-31.5, wolfCragY + 4.0, -51.5], r: 4.8 },
    view: { from: [-28, wolfCragY + 6.4, -48], to: [-39, wolfCragY + 6.4, -48], look: [-34, wolfCragY + 4.6, -54] },
  });
  orb('vrana', [26, PLATEAU_Y + 1.25, -4], 1.1, ['vrana'], 'close', PLATEAU_Y + 1.1, {
    at: V(26, PLATEAU_Y + 2.3, -2.5), near: { p: [26, PLATEAU_Y + 0.2, -2.5], r: 3.6 },
    view: { from: [23.5, PLATEAU_Y + 2.2, -1.2], to: [28.5, PLATEAU_Y + 2.2, -1.2], look: [26, PLATEAU_Y + 1.25, -4] },
  });

  // Zone 7: Ogorjelica Summit, Rajska dolina & Weather (7)
  orb('dolina', [-52, jahorinaGroundY(-52, 62) + 2, 62], 18, ['dolina'], 'combo', jahorinaGroundY(-36, 56), {
    at: V(-36, jahorinaGroundY(-36, 56) + 2.6, 56), near: { p: [-36, jahorinaGroundY(-36, 56) + 0.3, 56], r: 5.5 },
    view: { from: [-18, 28, 44], to: [-22, 30, 74], look: [-52, 12, 62] },
    wideView: { from: [-12, 38, 92], to: [-18, 36, 32], look: [-52, 14, 62], lookTo: [-52, 14, 62] },
  });
  orb('magla', [-52, jahorinaGroundY(-52, 62) + 5.0, 62], 14, ['magla'], 'close', jahorinaGroundY(-40, 66), {
    at: V(-40, jahorinaGroundY(-40, 66) + 3.2, 66), near: { p: [-40, jahorinaGroundY(-40, 66) + 0.3, 66], r: 5.5 },
    view: { from: [-22, 26, 56], to: [-22, 28, 76], look: [-52, 16, 62] },
  });
  orb('zastavica', [-4, jahorinaGroundY(-4, 58) + 1.6, 58], 6.0, ['zastavica'], 'combo', jahorinaGroundY(-4, 54), {
    at: V(2, jahorinaGroundY(2, 54) + 2.4, 54), near: { p: [2, jahorinaGroundY(2, 54) + 0.3, 54], r: 4.8 },
    view: { from: [8, jahorinaGroundY(-4, 58) + 4.5, 48], to: [-10, jahorinaGroundY(-4, 58) + 4.5, 48], look: [-4, jahorinaGroundY(-4, 58) + 1.6, 58] },
    wideView: { from: [12, 32, 32], to: [10, 40, 84], look: [-3, 18, 62], lookTo: [-3, 24, 78] },
  });
  orb('vidikovac', [-8, 32.8, 106], 4.8, ['vidikovac'], 'close', 32.5, {
    at: V(-8, 34.4, 106), near: { p: [-8, 32.4, 106], r: 5.0 },
    view: { from: [-16, 36.5, 98], to: [0, 36.5, 98], look: [-8, 32.8, 106] },
  });
  orb('vjetar', [6.8, 36.0, 105], 2.5, ['vjetar'], 'close', 32.5, {
    at: V(6, 34.4, 103.5), near: { p: [6, 32.2, 103.5], r: 4.5 },
    view: { from: [2, 36.8, 99], to: [11, 36.8, 99], look: [6.8, 36.0, 105] },
  });
  orb('greben', [0, 35.5, 116], 18, ['greben'], 'combo', 32.5, {
    at: V(-12, 34.4, 110), near: { p: [-12, 32.2, 110], r: 5.5 },
    view: { from: [-24, 42, 92], to: [24, 42, 92], look: [0, 35, 116] },
    wideView: { from: [-38, 46, 84], to: [38, 46, 84], look: [0, 35, 116], lookTo: [0, 35, 116] },
  });
  // Stage 2 (LAST WORD): 'vrh' on top of Ogorjelica Peak
  orb('vrh', [0, 34.2, 108], 9.0, ['vrh'], 'combo', 32.5, {
    stage: 2, at: V(0, 35.2, 105.5), near: { p: [0, 32.2, 105.5], r: 6.0 },
    view: { from: [-12, 38.5, 96], to: [12, 38.5, 96], look: [0, 34.0, 108] },
    wideView: { from: [22, 46, 122], to: [-22, 46, 122], look: [0, 26, 70], lookTo: [0, 12, 12] },
  });

  // Paint sources for every orb tag & sky/sun
  for (const o of orbs) for (const t of o.tags) tag(t).source = o.focus.clone();
  tag('sky').source = sunPos.clone();
  tag('sun').source = sunPos.clone();

  b.finish(scene);

  return {
    colliders: b.colliders,
    orbs,
    people,
    animals,
    jahAnimals,
    clouds,
    smoke,
    start: V(-10.5, PLATEAU_Y + 0.08, 1.5),
    fleur: V(0, 44.5, 106),
    sunPos,
    movers: [],
    // Jahorina handles
    lift: { chairs, A: LIFT_A, B: LIFT_B },
    ratrak: { group: ratrakGroup, home: ratrakHome, collider: ratrakCollider, active: false },
    flags,
    windsock,
  };
}
