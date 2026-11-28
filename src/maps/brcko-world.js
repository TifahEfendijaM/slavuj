// Brčko (autumn): the broad Sava along the north of the town (flowing east, +x), the steel bridge to Croatia, the
// river port with its cranes and a barge; the promenade with fishermen; the town centre (square and fountain, the
// striped pseudo-Moorish City Hall, the White Mosque, the Orthodox church); the market with autumn produce; and a
// Posavina farm to the east (fields, corn, a čardak, plum jam boiling in a copper kazan, a stork's nest).
import { town, THREE, PAT, V, G, PAL, dynMesh, hipRoofGeo, gableRoofGeo } from './townkit.js';

export const TOWN_Y = 2.4;       // the south bank (Brčko)
export const NORTH_Y = 1.6;      // the north bank (Croatia)
export const BRIDGE_Y = 10;      // the bridge deck
const RZ0 = -84, RZ1 = -44;      // the river between these z

export function buildBrckoWorld(scene) {
  const k = town(scene, {
    seed: 1892, sun: [-0.55, 0.42, 0.72], water: [1, 0],
    light: { shadow: [0.56, 0.52, 0.62], glow: [1.0, 0.8, 0.52], tint: [1.07, 0.97, 0.86], skyGlow: [0.98, 0.88, 0.7] },
    sky: ['#c4d9e2', '#8fb6cc'], clouds: [[-160, 80, -150, 9], [120, 86, -170, 10], [180, 76, 60, 8], [-180, 74, 90, 8], [40, 90, 210, 9]],
  });
  const { A, box, rr, R, orb, people, smoke, house, tree, b } = k;
  const { WHITE, STONE, WOOD_D, WOOD_W, TILE, SLAB } = PAL;
  const EMB_M = { tag: 'riverbank', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.65 };
  const AUT = [['#e0a233', '#a8701a'], ['#d4762a', '#9a4c14'], ['#c9a43c', '#93761e'], ['#b8b04a', '#857f2a'], ['#d65a2a', '#9a3a14']];
  k.bigTags('most', 'rijeka', 'luka', 'setaliste', 'trg', 'pijaca', 'njiva', 'kukuruz', 'vijecnica', 'magla');
  k.lateTags('fenjer', 'pleter', 'topola', 'sljiva', 'suncokret', 'lisce');
  const leafEmitters = [];

  // ==================== TERRAIN AND THE SAVA ====================
  box(520, 4, 520, 0, -4.2, 0, { tag: 'hills', col: '#a8a868', bleed: '#7c7c44', pat: PAT.grass, ink: false });
  box(440, 6, 260, 0, TOWN_Y - 3, RZ1 + 130, { tag: 'riverbank', col: '#9ea85a', bleed: '#727c38', pat: PAT.grass });
  box(440, 6, 140, 0, NORTH_Y - 3, RZ0 - 70, { tag: 'riverbank', col: '#a6a45e', bleed: '#7a783a', pat: PAT.grass });
  box(440, 2, 44, 0, -2.2, (RZ0 + RZ1) / 2, { tag: 'riverbank', col: '#4a6a5a', bleed: '#2f4a3c', ink: false });
  b.object(() => {
    box(440, TOWN_Y + 1.6, 0.9, 0, TOWN_Y / 2 - 0.8, RZ1 - 0.45, EMB_M);
    box(440, NORTH_Y + 1.6, 0.9, 0, NORTH_Y / 2 - 0.8, RZ0 + 0.45, { ...EMB_M, col: '#a9a07c', bleed: '#7d7556', pat: PAT.grass });
  });
  // the Sava ('rijeka'): broad, slow, grey-green in autumn
  box(440, 0.12, RZ1 - RZ0 + 0.4, 0, -0.06, (RZ0 + RZ1) / 2, { tag: 'rijeka', col: '#5f8f84', bleed: '#3d675c', pat: PAT.water, hatch: 0, water: true, ink: false });
  // a sandbank with a flock of wild geese resting ('jato')
  A(G.CYL16, -34, 0.0, -72, { tag: 'riverbank', col: '#d8c89c', bleed: '#ab9a6c' }, 0, 0, 0, [8, 0.6, 3]);
  b.object(() => {
    for (const [gx, gz, ry] of [[-38, -72.6, 0.4], [-36.4, -71.2, -0.3], [-34.8, -72.8, 0.9], [-33.0, -71.6, 0.2], [-31.6, -72.9, -0.6], [-29.8, -71.8, 0.5]]) {
      A(G.SPHERE, gx, 0.55, gz, { tag: 'jato', col: '#8c8476', bleed: '#5f584c', hull: true }, ry, 0, 0, [0.22, 0.2, 0.38]);
      A(G.CYL, gx + Math.sin(ry) * 0.3, 0.85, gz + Math.cos(ry) * 0.3, { tag: 'jato', col: '#3a3632', bleed: '#201d1a' }, ry, 0.3, 0, [0.05, 0.42, 0.05]);
      A(G.SPHERE, gx + Math.sin(ry) * 0.42, 1.08, gz + Math.cos(ry) * 0.42, { tag: 'jato', col: '#3a3632', bleed: '#201d1a', hull: true }, ry, 0, 0, [0.08, 0.08, 0.12]);
      for (const s of [-0.08, 0.08]) A(G.CYL, gx + s, 0.42, gz, { tag: 'jato', col: '#d68a3a', bleed: '#a0601a', solid: false }, 0, 0, 0, [0.02, 0.24, 0.02]);
    }
  });
  // fog ('magla') lying over the far bank
  b.object(() => {
    for (const [fx, fz, sx, sz] of [[-30, -100, 18, 5], [10, -96, 16, 4], [46, -104, 20, 5], [-70, -110, 16, 5], [84, -98, 14, 4], [20, -118, 22, 6]]) A(G.SPHERE, fx, NORTH_Y + 1.4, fz, { tag: 'magla', col: '#f4f4f0', bleed: '#d8dcdc', hull: true, hatch: 0.1, solid: false }, 0, 0, 0, [sx, 1.1, sz]);
  });

  // ==================== THE BRIDGE ('most') ====================
  const BX = -70;
  b.object(() => {
    const MS = { tag: 'most', col: '#6f8a78', bleed: '#4b6252' }, CON = { tag: 'most', col: '#c8c4b8', bleed: '#9c988c' };
    box(6, 0.6, 72, BX, BRIDGE_Y, -66, { tag: 'most', col: '#8c8a84', bleed: '#64625c', pat: PAT.cobble, ps: 0.5 });
    for (const pz of [-92, -78, -64, -50, -36]) box(2.6, BRIDGE_Y + 2, 3.4, BX, BRIDGE_Y / 2 - 1.3, pz, CON);
    for (const sx of [-3.2, 3.2]) {
      box(0.4, 0.5, 60, BX + sx, BRIDGE_Y + 6, -66, MS);
      box(0.4, 0.6, 72, BX + sx, BRIDGE_Y + 0.6, -66, MS);
      for (let z = -96; z <= -36; z += 6) box(0.36, 5.7, 0.36, BX + sx, BRIDGE_Y + 3.15, z, MS);
      for (let z = -96; z < -36; z += 6) { const up = ((z + 96) / 6) % 2 ? 1 : -1; box(0.24, Math.hypot(6, 5.7), 0.24, BX + sx, BRIDGE_Y + 3.15, z + 3, MS, 0, up * Math.atan2(6, 5.7), 0); }
    }
    for (let z = -96; z <= -36; z += 12) box(6.8, 0.36, 0.36, BX, BRIDGE_Y + 6, z, MS);
    for (const sx of [-2.9, 2.9]) box(0.12, 0.8, 72, BX + sx, BRIDGE_Y + 0.7, -66, { ...MS, wall: true });
    // the approaches: an embankment road down to each bank
    const ramp = (z0, z1, y0, y1) => {
      const L = Math.abs(z1 - z0), rise = y0 - y1, th = 8, a = Math.atan2(rise, L) * Math.sign(z1 - z0), zm = (z0 + z1) / 2, ym = (y0 + y1) / 2;
      box(6, th, Math.hypot(L, rise), BX, ym - (th / 2) * Math.cos(a), zm - (th / 2) * Math.sin(a), { tag: 'most', col: '#b4b0a4', bleed: '#8a867a', pat: PAT.blocks, ps: 0.5 }, 0, a, 0);
    };
    ramp(-30, 12, BRIDGE_Y + 0.3, TOWN_Y);
    ramp(-102, -140, BRIDGE_Y + 0.3, NORTH_Y);
  });

  // ==================== THE PORT ('luka') ====================
  b.object(() => {
    box(64, 0.12, 18, 61, TOWN_Y + 0.06, -35, { tag: 'luka', col: '#bdb9b0', bleed: '#949088', pat: PAT.cobble, ps: 0.3 });
    for (const rz of [-41.6, -33.4]) box(64, 0.08, 0.16, 61, TOWN_Y + 0.16, rz, { tag: 'luka', col: '#5f646b', bleed: '#3a3e44', solid: false });
  });
  for (const cx of [46, 68]) b.object(() => {
    const Y = { tag: 'dizalica', col: '#e8b830', bleed: '#b0841a' }, H = { tag: 'dizalica', col: '#2f6fa8', bleed: '#1c4a74' };
    for (const sx of [-3.2, 3.2]) for (const z of [-41.6, -33.4]) box(0.6, 9, 0.6, cx + sx, TOWN_Y + 4.5, z, Y);
    for (const z of [-41.6, -33.4]) box(7, 0.6, 0.6, cx, TOWN_Y + 9, z, Y);
    for (const sx of [-3.2, 3.2]) box(0.6, 0.6, 8.8, cx + sx, TOWN_Y + 9, -37.5, Y);
    box(5, 3.4, 6, cx, TOWN_Y + 11, -37.5, H);
    box(1.6, 1.6, 1.4, cx + 1.4, TOWN_Y + 10.6, -41.2, { tag: 'dizalica', col: '#cfe6f2', bleed: '#8fb6cc' });
    box(1.0, 1.0, 18.1, cx, TOWN_Y + 13.75, -49.25, Y, 0, 0.252, 0);
    box(2.6, 2.0, 1.8, cx, TOWN_Y + 11.4, -33.4, { tag: 'dizalica', col: '#7d8088', bleed: '#55585e' });
    box(0.06, 12.2, 0.06, cx, TOWN_Y + 10.0, -58, { tag: 'dizalica', col: '#2b2e32', solid: false });
    A(G.CONE4, cx, TOWN_Y + 3.6, -58, { tag: 'dizalica', col: '#2b2e32', bleed: '#16181a', solid: false }, 0, Math.PI, 0, [0.3, 0.6, 0.3]);
  });
  b.object(() => {      // containers ('kontejner')
    for (const [x, z, y, c] of [[83, -38.6, 0, '#c9452c'], [83, -35.6, 0, '#2f6fa8'], [83, -38.6, 1, '#3f8a5a'], [90, -38.6, 0, '#e8b830'], [90, -35.6, 0, '#c9452c']]) {
      box(6, 2.6, 2.6, x, TOWN_Y + 1.3 + y * 2.62, z, { tag: 'kontejner', col: c, bleed: '#4a3a2a', pat: PAT.planks, ps: 8 });
    }
  });
  b.object(() => {      // the barge ('teglenica') with its gravel, moored to the quay
    const TG = { tag: 'teglenica', col: '#3d4650', bleed: '#252b31' };
    box(36, 1.8, 6.4, 56, 0.3, -50.8, TG);
    box(36.2, 0.3, 6.6, 56, 1.0, -50.8, { tag: 'teglenica', col: '#b8452c', bleed: '#86301c', solid: false });
    A(G.CONE4, 37.2, 0.3, -50.8, TG, Math.PI / 4, 0, Math.PI / 2, [2.3, 2.4, 2.3]);
    for (const gx of [48, 60]) A(G.ICO, gx, 1.2, -50.8, { tag: 'teglenica', col: '#c8b48e', bleed: '#9c8862', hull: true }, 0, 0, 0, [5.2, 1.6, 2.4]);
    box(3, 2.2, 3.4, 71.6, 2.3, -50.8, { tag: 'teglenica', col: '#e8e4da', bleed: '#c0baa8' });
    box(3.4, 0.2, 3.8, 71.6, 3.5, -50.8, TG);
    for (const s of [-1, 1]) box(0.08, 0.8, 1.2, 71.6 + s * 1.52, 2.6, -50.8, { tag: 'teglenica', col: '#8fb6cc', bleed: '#5f8aa6', solid: false });
  });
  people.push({ kind: 'chat', x: 68.6, y: 1.24, z: -49.0, ry: Math.PI / 2, tag: 'mornar', top: '#2f4f7f' });
  b.object(() => {      // bollards ('bitva') on the quay edge, ropes to the barge
    for (const x of [42, 54, 66]) {
      A(G.CYL12, x, TOWN_Y + 0.3, -44.4, { tag: 'bitva', col: '#2b2e32', bleed: '#16181a' }, 0, 0, 0, [0.26, 0.6, 0.26]);
      A(G.CYL12, x, TOWN_Y + 0.64, -44.4, { tag: 'bitva', col: '#2b2e32', bleed: '#16181a' }, 0, 0, 0, [0.36, 0.1, 0.36]);
    }
    for (const x of [42, 54, 66]) box(0.06, 0.06, 3.6, x, (TOWN_Y + 0.5 + 1.1) / 2, -46.1, { tag: 'props', col: '#d8c39a', solid: false }, 0, Math.atan2(TOWN_Y + 0.5 - 1.1, 3.4), 0);
  });
  // the buoy ('bova')
  {
    const g = new THREE.Group(); g.position.set(-6, 0.05, -66); scene.add(g);
    dynMesh(G.CONE8, 'bova', '#d8382c', '#9a2116', g, 0, 0.7, 0, [0.6, 1.4, 0.6], 1.1);
    dynMesh(G.CYL12, 'bova', '#f4f0e4', '#d0c9b8', g, 0, 0.55, 0, [0.5, 0.25, 0.5], 1.0);
    dynMesh(G.CYL12, 'bova', '#d8382c', '#9a2116', g, 0, 0.1, 0, [0.7, 0.3, 0.7], 1.1);
    k.rock.push({ g, home: g.position.clone(), amp: 0.08, ph: 0.2 });
  }

  // ==================== THE PROMENADE ('setaliste') ====================
  box(88, 0.12, 9.6, -16, TOWN_Y + 0.06, -39.2, { tag: 'setaliste', col: '#d8d0bc', bleed: '#b0a792', pat: PAT.cobble, ps: 0.8 });
  b.object(() => {
    const RL = { tag: 'setaliste', col: '#4a4e55', bleed: '#2c2f33', wall: true };
    for (const [x0, x1] of [[-60, -37.2], [-30.8, 28]]) {
      box(x1 - x0, 0.1, 0.12, (x0 + x1) / 2, TOWN_Y + 1.1, -43.8, RL);
      for (let x = x0; x <= x1 + 0.01; x += 2) box(0.1, 1.0, 0.1, x, TOWN_Y + 0.6, -43.8, RL);
    }
  });
  b.object(() => {      // street lamps ('fenjer')
    for (const x of [-54, -40, -26, -12, 2, 16]) {
      const F = { tag: 'fenjer', col: '#2f3236', bleed: '#18191b' };
      A(G.CYL, x, TOWN_Y + 1.9, -35.4, F, 0, 0, 0, [0.1, 3.6, 0.1]);
      box(0.5, 0.6, 0.5, x, TOWN_Y + 3.95, -35.4, { tag: 'fenjer', col: '#f6e6a8', bleed: '#d8b860' });
      A(G.CONE4, x, TOWN_Y + 4.45, -35.4, F, Math.PI / 4, 0, 0, [0.45, 0.4, 0.45]);
    }
  });
  b.object(() => {      // benches
    for (const x of [-47, -33, -5, 9, 23]) {
      box(2.2, 0.1, 0.6, x, TOWN_Y + 0.55, -35.6, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3 });
      box(2.2, 0.5, 0.08, x, TOWN_Y + 0.9, -35.3, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
      for (const ox of [-0.9, 0.9]) box(0.1, 0.5, 0.55, x + ox, TOWN_Y + 0.3, -35.6, { tag: 'props', col: '#2f3236', bleed: '#18191b' });
    }
  });
  b.object(() => {      // the old anchor ('sidro') on its stone
    box(1.6, 0.8, 1.6, -46, TOWN_Y + 0.5, -38, { tag: 'props', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 1 });
    const SI = { tag: 'sidro', col: '#4a4a4c', bleed: '#2a2a2c' };
    A(G.CYL, -46, TOWN_Y + 2.1, -38, SI, 0, 0, 0, [0.12, 2.4, 0.12]);
    box(1.5, 0.16, 0.16, -46, TOWN_Y + 3.05, -38, SI);
    A(new THREE.TorusGeometry(0.85, 0.11, 6, 14, Math.PI), -46, TOWN_Y + 1.85, -38, SI, 0, 0, Math.PI);
    A(new THREE.TorusGeometry(0.18, 0.06, 5, 10), -46, TOWN_Y + 3.4, -38, SI);
  });
  people.push({ kind: 'fisher', x: -22, y: TOWN_Y + 0.12, z: -42.8, ry: Math.PI, tag: 'ribar' });
  b.object(() => {      // spare rods ('stap') on a stand
    for (const s of [-1, 1]) box(0.06, 1.0, 0.06, -18.6 + s * 0.3, TOWN_Y + 0.6, -42.6, { tag: 'props', col: '#5a5e64', bleed: '#383b40' }, 0, 0, s * 0.25);
    for (const ox of [-0.25, 0.25]) box(0.05, 0.05, 6.6, -18.6 + ox, TOWN_Y + 2.5, -45.7, { tag: 'stap', col: '#6a4a2a', bleed: '#4a3018' }, 0, 0.5, 0);
  });
  b.object(() => {      // a net ('mreza') drying on a frame
    for (const ox of [-1.5, 1.5]) box(0.14, 2.4, 0.14, -10 + ox, TOWN_Y + 1.2, -38, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] });
    box(3.2, 0.14, 0.14, -10, TOWN_Y + 2.35, -38, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] });
    for (let i = 0; i < 7; i++) box(0.03, 1.6, 0.03, -11.2 + i * 0.4, TOWN_Y + 1.5, -38, { tag: 'mreza', col: '#8a9a8a', bleed: '#5e6e5e', solid: false });
    for (let j = 0; j < 5; j++) box(2.6, 0.03, 0.03, -10, TOWN_Y + 0.8 + j * 0.36, -38, { tag: 'mreza', col: '#8a9a8a', bleed: '#5e6e5e', solid: false });
    box(2.6, 1.6, 0.04, -10, TOWN_Y + 1.5, -38.02, { tag: 'mreza', col: '#8a9a8a', bleed: '#5e6e5e', ink: false });
  });
  b.object(() => {      // the jetty and the boat ('camac')
    box(4, 0.24, 6.4, -34, 1.0, -47.2, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3 });
    for (const [x, z] of [[-35.8, -50.2], [-32.2, -50.2], [-35.8, -47.4], [-32.2, -47.4]]) A(G.CYL, x, -0.2, z, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.14, 2.4, 0.14]);
    box(2.6, 0.3, 1.2, -34, TOWN_Y - 0.55, -44.4, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] }, 0, 0.6, 0);
  });
  {
    const g = new THREE.Group(); g.position.set(-29.8, 0.12, -48.5); scene.add(g);
    dynMesh(G.BOX, 'camac', '#6b8a5a', '#4a6338', g, 0, 0.22, 0, [1.3, 0.42, 3.6], 1.2);
    dynMesh(G.BOX, 'camac', '#a7794a', '#7a542c', g, 0, 0.44, 0.4, [1.15, 0.07, 0.3], 1.1);
    dynMesh(G.CONE4, 'camac', '#6b8a5a', '#4a6338', g, 0, 0.22, -2.1, [0.72, 0.9, 0.56], 1.1).rotation.x = -Math.PI / 2 + 0.25;
    k.rock.push({ g, home: g.position.clone(), amp: 0.04, ph: 1.2 });
  }
  for (const [hx, hz, rx, rz, sp, ph] of [[-14, -50, 3, 1.6, 0.4, 0], [-4, -52, 2.4, 1.4, 0.5, 2]]) {      // carp ('saran')
    const g = new THREE.Group(); g.position.set(hx, 0.1, hz); scene.add(g);
    dynMesh(G.SPHERE, 'saran', '#c8a04a', '#8e6e24', g, 0, 0, 0, [0.26, 0.24, 0.7], 1.1);
    dynMesh(G.CONE4, 'saran', '#b08838', '#7a5c1c', g, 0, 0, -0.82, [0.06, 0.34, 0.26], 1.0).rotation.x = -Math.PI / 2;
    k.fish.push({ g, home: V(hx, 0.1, hz), rx, rz, speed: sp, phase: ph });
  }
  b.object(() => {      // a parked bicycle ('bicikl')
    const BI = { tag: 'bicikl', col: '#2f7fa8', bleed: '#1c5474' };
    for (const ox of [-0.62, 0.62]) A(new THREE.TorusGeometry(0.34, 0.04, 6, 16), 5 + ox, TOWN_Y + 0.46, -36.6, { tag: 'bicikl', col: '#2b2e32', bleed: '#16181a' });
    box(1.1, 0.06, 0.06, 5, TOWN_Y + 0.72, -36.6, BI, 0, 0, 0.15);
    box(0.06, 0.55, 0.06, 4.8, TOWN_Y + 0.68, -36.6, BI, 0, 0, -0.3);
    box(0.06, 0.6, 0.06, 5.5, TOWN_Y + 0.74, -36.6, BI, 0, 0, 0.35);
    box(0.28, 0.06, 0.14, 4.72, TOWN_Y + 0.98, -36.6, { tag: 'bicikl', col: '#2b2e32', bleed: '#16181a' });
    box(0.06, 0.06, 0.5, 5.66, TOWN_Y + 1.06, -36.6, BI);
  });

  // ==================== THE TOWN CENTRE ====================
  box(40, 0.1, 32, -24, TOWN_Y + 0.05, 12, { tag: 'trg', col: '#d6ccb6', bleed: '#ada28a', pat: PAT.cobble, ps: 0.6 });
  b.object(() => {      // the fountain ('fontana')
    const FO = { tag: 'fontana', col: '#e3dac6', bleed: '#bcb09a', pat: PAT.blocks, ps: 1.2 };
    A(G.CYL16, -24, TOWN_Y + 0.4, 12, FO, 0, 0, 0, [3.2, 0.8, 3.2]);
    A(G.CYL16, -24, TOWN_Y + 0.74, 12, { tag: 'fontana', col: '#6ab6c0', bleed: '#3a8692', pat: PAT.water, hatch: 0, ink: false, solid: false }, 0, 0, 0, [2.9, 0.06, 2.9]);
    A(G.CYL12, -24, TOWN_Y + 1.6, 12, FO, 0, 0, 0, [0.4, 2.0, 0.4]);
    A(G.CYL16, -24, TOWN_Y + 2.6, 12, FO, 0, 0, 0, [1.1, 0.2, 1.1]);
    A(G.CYL, -24, TOWN_Y + 3.4, 12, { tag: 'fontana', col: '#eef8fa', bleed: '#bcd8de', solid: false, ink: false }, 0, 0, 0, [0.12, 1.4, 0.12]);
  });
  // the City Hall ('vijecnica'): striped pseudo-Moorish, towers and domes, facing the square (north)
  b.object(() => {
    const VW = { tag: 'vijecnica', col: '#f0d9a8', bleed: '#c8ae78' }, RED = { tag: 'vijecnica', col: '#c2563a', bleed: '#8e3a22', solid: false }, DK = { tag: 'vijecnica', col: '#3a3029', bleed: '#231c17', solid: false };
    box(26, 8.6, 12, -24, TOWN_Y + 4.3, 40, VW);
    A(hipRoofGeo(27, 13, 2.2), -24, TOWN_Y + 8.6, 40, { tag: 'vijecnica', col: '#7d8a84', bleed: '#58645e', pat: PAT.roof });
    for (const tx of [-36.5, -11.5]) {
      box(4, 12, 4, tx, TOWN_Y + 6, 35.6, VW);
      A(G.HEMI, tx, TOWN_Y + 12, 35.6, { tag: 'vijecnica', col: '#6f9a8a', bleed: '#4a6e60', hull: true }, 0, 0, 0, [2.2, 2.4, 2.2]);
      A(G.CYL, tx, TOWN_Y + 14.9, 35.6, { tag: 'vijecnica', col: '#d5b043', bleed: '#9e7f22', solid: false }, 0, 0, 0, [0.05, 1.2, 0.05]);
      for (let i = 0; i < 10; i++) box(4.04, 0.3, 4.04, tx, TOWN_Y + 0.9 + i * 1.1, 35.6, RED);
    }
    box(7, 11, 1.4, -24, TOWN_Y + 5.5, 33.4, VW);
    A(G.HEMI, -24, TOWN_Y + 11, 34.4, { tag: 'vijecnica', col: '#6f9a8a', bleed: '#4a6e60', hull: true }, 0, 0, 0, [3.0, 3.0, 2.4]);
    for (let i = 0; i < 8; i++) box(26.04, 0.3, 0.06, -24, TOWN_Y + 0.9 + i * 1.05, 33.98, RED);
    for (let i = 0; i < 10; i++) box(7.04, 0.3, 0.06, -24, TOWN_Y + 0.9 + i * 1.05, 32.68, RED);
    for (const fl of [0, 1]) for (const ox of [-9, -6.6, -4.2, 4.2, 6.6, 9]) {      // horseshoe-arched windows
      box(1.1, 1.5, 0.08, -24 + ox, TOWN_Y + 1.9 + fl * 4, 33.94, DK);
      A(G.CYL16, -24 + ox, TOWN_Y + 2.65 + fl * 4, 33.94, DK, 0, Math.PI / 2, 0, [0.62, 0.08, 0.62]);
    }
    box(2.2, 3.0, 0.08, -24, TOWN_Y + 1.5, 32.64, DK);
    A(G.CYL16, -24, TOWN_Y + 3.0, 32.64, DK, 0, Math.PI / 2, 0, [1.22, 0.08, 1.22]);
    for (const ox of [-1.8, 0, 1.8]) { box(1.0, 1.5, 0.08, -24 + ox, TOWN_Y + 6.4, 32.64, DK); A(G.CYL16, -24 + ox, TOWN_Y + 7.15, 32.64, DK, 0, Math.PI / 2, 0, [0.56, 0.08, 0.56]); }
  });
  b.object(() => {      // the flag ('zastava') on the central dome
    A(G.CYL, -24, TOWN_Y + 15.5, 34.4, { tag: 'props', col: '#d8d4ca', bleed: '#aaa69c' }, 0, 0, 0, [0.06, 3.6, 0.06]);
    box(2.4, 1.4, 0.06, -22.75, TOWN_Y + 16.6, 34.4, { tag: 'zastava', col: '#2a4aa8', bleed: '#1a3078' });
    A(G.CONE4, -22.2, TOWN_Y + 16.6, 34.4, { tag: 'zastava', col: '#f2c230', bleed: '#c49412', solid: false }, Math.PI / 4, 0, -Math.PI / 2, [0.5, 1.0, 0.04]);
  });
  // the White Mosque ('dzamija') and its minaret ('munara')
  b.object(() => {
    const DZ = { tag: 'dzamija', col: '#f7f5ee', bleed: '#d6d2c6' };
    box(12, 7, 12, 14, TOWN_Y + 3.5, 6, DZ);
    A(G.CYL16, 14, TOWN_Y + 7.5, 6, DZ, 0, 0, 0, [5.6, 1.0, 5.6]);
    A(G.HEMI, 14, TOWN_Y + 8, 6, { tag: 'dzamija', col: '#e8e6de', bleed: '#c4c0b4', hull: true }, 0, 0, 0, [5.2, 4.6, 5.2]);
    A(G.CYL, 14, TOWN_Y + 13.2, 6, { tag: 'dzamija', col: '#d5b043', bleed: '#9e7f22', solid: false }, 0, 0, 0, [0.06, 1.6, 0.06]);
    box(2.2, 3.4, 0.2, 14, TOWN_Y + 1.7, -0.1, { tag: 'dzamija', col: '#5a7a8a', solid: false });
    for (const ox of [-4, 4]) box(1.2, 2.6, 0.2, 14 + ox, TOWN_Y + 3.4, -0.1, { tag: 'dzamija', col: '#5a7a8a', solid: false });
  });
  b.object(() => {
    const MU = { tag: 'munara', col: '#f7f5ee', bleed: '#d6d2c6' };
    A(G.CYL12, 22.5, TOWN_Y + 13, 14, MU, 0, 0, 0, [1.0, 26, 1.0]);
    for (const y of [17, 23]) A(G.CYL12, 22.5, TOWN_Y + y, 14, MU, 0, 0, 0, [1.55, 0.35, 1.55]);
    A(G.CONE8, 22.5, TOWN_Y + 28.2, 14, { tag: 'munara', col: '#cfd4d6', bleed: '#a8aeb2' }, 0, 0, 0, [1.05, 4.4, 1.05]);
  });
  // the Orthodox church ('crkva') and its bell ('zvono')
  b.object(() => {
    const CR = { tag: 'crkva', col: '#f2e6c4', bleed: '#cbbd98' };
    box(8, 7, 14, -56, TOWN_Y + 3.5, 25, CR);
    A(gableRoofGeo(15, 9, 3.2), -56, TOWN_Y + 7, 25, { tag: 'crkva', col: '#7a4a3a', bleed: '#523024', pat: PAT.roof }, Math.PI / 2);
    A(G.HEMI, -56, TOWN_Y + 3.5, 32, CR, 0, Math.PI / 2, 0, [3.6, 3.0, 3.5]);
    box(4, 13, 4, -56, TOWN_Y + 6.5, 16, CR);
    box(5, 0.3, 5, -56, TOWN_Y + 9.2, 16, { tag: 'crkva', col: '#d8ccaa', bleed: '#ae9f7c' });
    for (const [ox, oz, w, d] of [[0, -2.02, 1.4, 0.08], [0, 2.02, 1.4, 0.08], [-2.02, 0, 0.08, 1.4], [2.02, 0, 0.08, 1.4]]) box(w, 1.8, d, -56 + ox, TOWN_Y + 10.6, 16 + oz, { tag: 'crkva', col: '#2a2420', bleed: '#16120f', solid: false });
    A(G.SPHERE, -56, TOWN_Y + 14.4, 16, { tag: 'crkva', col: '#4f8a6a', bleed: '#335e46', hull: true }, 0, 0, 0, [1.9, 2.4, 1.9]);
    A(G.CYL, -56, TOWN_Y + 17.4, 16, { tag: 'crkva', col: '#d5b043', bleed: '#9e7f22', solid: false }, 0, 0, 0, [0.06, 1.6, 0.06]);
    box(0.9, 0.06, 0.06, -56, TOWN_Y + 17.7, 16, { tag: 'crkva', col: '#d5b043', solid: false });
    box(2.2, 3.0, 0.2, -56, TOWN_Y + 1.5, 13.9, { tag: 'crkva', col: '#4a3120', solid: false });
  });
  A(G.CONE8, -56, TOWN_Y + 10.6, 13.88, { tag: 'zvono', col: '#c8963a', bleed: '#8e6420', solid: false }, 0, 0, 0, [0.6, 1.1, 0.12]);
  // fallen leaves ('lisce') raked into a heap in the church garden, the rake ('grablje') leaning on it
  b.object(() => {
    for (let i = 0; i < 9; i++) A(G.ICO, -46.5 + rr(-0.8, 0.8), TOWN_Y + 0.18, 30 + rr(-0.7, 0.7), { tag: 'lisce', col: AUT[i % 5][0], bleed: AUT[i % 5][1], hull: true, solid: i < 3 }, rr(0, 6), 0, 0, [rr(0.5, 0.8), 0.3, rr(0.5, 0.8)]);
  });
  b.object(() => {
    box(0.07, 0.07, 1.9, -45.2, TOWN_Y + 0.75, 30.6, { tag: 'grablje', col: '#9a6c3e', bleed: '#6b4826' }, 0.3, 0.9, 0);
    box(0.7, 0.08, 0.08, -45.25, TOWN_Y + 0.08, 29.9, { tag: 'grablje', col: '#5a5e64', bleed: '#383b40' }, 0.3);
  });

  // ==================== THE MARKET ('pijaca') ====================
  b.object(() => {
    const PI = { tag: 'pijaca', col: '#5f7d8a', bleed: '#3f5a66' };
    for (const x of [2, 18, 34]) for (const z of [34, 48]) box(0.3, 4, 0.3, x, TOWN_Y + 2, z, PI);
    box(33, 0.24, 15.4, 18, TOWN_Y + 4.1, 41, { tag: 'pijaca', col: '#b8452c', bleed: '#86301c', pat: PAT.roof }, 0, 0.05, 0);
    for (const x of [8, 18, 28]) box(6, 0.9, 2.2, x, TOWN_Y + 0.45, 41, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3 });
  });
  b.object(() => {      // pumpkins ('bundeva')
    for (const [x, z, r] of [[5.6, 40.6, 0.42], [6.5, 41.4, 0.38], [6.1, 40.2, 0.34], [4.6, 43.0, 0.5], [3.6, 43.6, 0.44]]) A(G.SPHERE, x, (z > 42 ? TOWN_Y : TOWN_Y + 0.9) + r * 0.7, z, { tag: 'bundeva', col: '#e8862a', bleed: '#b05a12', hull: true }, 0, 0, 0, [r, r * 0.75, r]);
  });
  b.object(() => {      // cabbages ('kupus')
    for (const [x, z] of [[9.4, 40.5], [10.2, 41.2], [10.9, 40.4], [9.8, 41.9], [10.6, 42.0]]) A(G.SPHERE, x, TOWN_Y + 1.18, z, { tag: 'kupus', col: '#8ab858', bleed: '#5e8a34', hull: true }, 0, 0, 0, [0.32, 0.28, 0.32]);
  });
  b.object(() => {      // peppers ('paprika'): strings hanging from the roof beam, a heap on the table
    for (const x of [15, 16.2]) for (let i = 0; i < 6; i++) A(G.CONE8, x, TOWN_Y + 3.6 - i * 0.28, 39.9, { tag: 'paprika', col: '#c8302a', bleed: '#8e1d1a', solid: false }, 0, Math.PI, 0, [0.09, 0.3, 0.09]);
    for (const x of [15, 16.2]) box(0.02, 1.9, 0.02, x, TOWN_Y + 3.0, 39.9, { tag: 'paprika', col: '#d8c39a', solid: false });
    for (let i = 0; i < 6; i++) A(G.SPHERE, 15.2 + (i % 3) * 0.4, TOWN_Y + 1.0, 40.6 + Math.floor(i / 3) * 0.4, { tag: 'paprika', col: '#d83a2c', bleed: '#9a2116' }, 0.6, 0, 0, [0.1, 0.1, 0.32]);
  });
  b.object(() => {      // apples ('jabuka') in crates
    for (const [x, c] of [[19.6, '#c8302a'], [20.8, '#8ab03a']]) {
      box(1.0, 0.36, 0.8, x, TOWN_Y + 1.08, 40.8, { tag: 'props', col: '#b08a52', bleed: '#7f6233', pat: PAT.planks, ps: 3 });
      for (let i = 0; i < 6; i++) A(G.SPHERE, x - 0.3 + (i % 3) * 0.3, TOWN_Y + 1.3, 40.6 + Math.floor(i / 3) * 0.36, { tag: 'jabuka', col: c, bleed: '#6a2a1a', hull: true }, 0, 0, 0, 0.14);
    }
  });
  b.object(() => {      // walnuts ('orah') in an open sack
    A(new THREE.CylinderGeometry(0.42, 0.5, 0.8, 10), 26.4, TOWN_Y + 0.4, 39.4, { tag: 'props', col: '#d8c8a0', bleed: '#ab9a6c' });
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; A(G.SPHERE, 26.4 + Math.cos(a) * 0.2, TOWN_Y + 0.86, 39.4 + Math.sin(a) * 0.2, { tag: 'orah', col: '#8a6238', bleed: '#5e4020', hull: true }, 0, 0, 0, 0.11); }
    for (let i = 0; i < 6; i++) A(G.SPHERE, 27.4 + (i % 3) * 0.3, TOWN_Y + 0.98, 40.6 + Math.floor(i / 3) * 0.3, { tag: 'orah', col: '#8a6238', bleed: '#5e4020' }, 0, 0, 0, 0.1);
  });
  people.push({ kind: 'sell', x: 29.6, y: TOWN_Y + 0.04, z: 43.2, ry: Math.PI, tag: 'prodavac' });
  b.object(() => {      // roasting chestnuts ('kesten') in a drum, in paper cones on a tray
    A(G.CYL16, -2, TOWN_Y + 1.1, 41, { tag: 'props', col: '#2b2e32', bleed: '#16181a' }, 0, 0, Math.PI / 2, [0.45, 1.2, 0.45]);
    for (const ox of [-0.5, 0.5]) for (const oz of [-0.3, 0.3]) box(0.06, 0.7, 0.06, -2 + ox, TOWN_Y + 0.35, 41 + oz, { tag: 'props', col: '#2b2e32', bleed: '#16181a' });
    box(1.4, 0.06, 0.6, -2, TOWN_Y + 0.9, 39.9, { tag: 'props', col: '#5a5e64', bleed: '#383b40' });
    for (const ox of [-0.45, 0, 0.45]) {
      A(G.CONE8, -2 + ox, TOWN_Y + 1.12, 39.9, { tag: 'kesten', col: '#f4ead2', bleed: '#cdbf9c' }, 0, Math.PI, 0, [0.14, 0.38, 0.14]);
      for (let i = 0; i < 3; i++) A(G.SPHERE, -2 + ox + (i - 1) * 0.06, TOWN_Y + 1.36, 39.9, { tag: 'kesten', col: '#6a3a1e', bleed: '#43220e' }, 0, 0, 0, 0.065);
    }
  });
  smoke.push(V(-2, TOWN_Y + 1.6, 41));

  // ==================== THE POSAVINA FARM ====================
  b.object(() => {      // the wattle fence ('pleter')
    const PL = { tag: 'pleter', col: '#8a6a44', bleed: '#5e4628' };
    const run = (x0, z0, x1, z1) => {
      const L = Math.hypot(x1 - x0, z1 - z0), ry = -Math.atan2(z1 - z0, x1 - x0), n = Math.round(L / 2.4);
      for (let i = 0; i <= n; i++) A(G.CYL, x0 + (x1 - x0) * i / n, TOWN_Y + 0.7, z0 + (z1 - z0) * i / n, PL, 0, 0, 0, [0.07, 1.4, 0.07]);
      for (const y of [0.4, 0.75, 1.1]) box(L, 0.16, 0.08, (x0 + x1) / 2, TOWN_Y + y, (z0 + z1) / 2, PL, ry);
    };
    run(88, 14, 124, 14); run(124, 14, 124, 46); run(124, 46, 88, 46); run(88, 46, 88, 32); run(88, 28, 88, 14);
  });
  house({ x: 104, y: TOWN_Y, z: 22, w: 10, d: 7, h: 3, tag: 'town', roof: 'tile', walls: ['#f4efe2', '#d4ccb8'], gable: true });
  b.object(() => {      // the stork's nest ('gnijezdo') on its pole
    A(G.CYL, 92, TOWN_Y + 4.5, 18, { tag: 'props', col: '#7d6a52', bleed: '#544735' }, 0, 0, 0, [0.18, 9, 0.18]);
    box(1.6, 0.14, 1.6, 92, TOWN_Y + 9.05, 18, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] });
    A(G.CYL16, 92, TOWN_Y + 9.45, 18, { tag: 'gnijezdo', col: '#8a6a44', bleed: '#5e4628', pat: PAT.planks, ps: 6 }, 0, 0, 0, [1.3, 0.7, 1.3]);
  });
  b.object(() => {      // the corn crib ('cardak') on stilts, full of yellow cobs
    const CA = { tag: 'cardak', col: '#8a6a44', bleed: '#5e4628' };
    for (const x of [116.2, 119.8]) for (const z of [38.6, 41.4]) box(0.24, 1.6, 0.24, x, TOWN_Y + 0.8, z, CA);
    box(4, 0.2, 3.2, 118, TOWN_Y + 1.7, 40, CA);
    box(3.6, 2.4, 2.8, 118, TOWN_Y + 3.0, 40, { tag: 'cardak', col: '#e8b830', bleed: '#b0841a' });
    for (let i = 0; i <= 10; i++) for (const z of [38.38, 41.62]) box(0.12, 2.6, 0.06, 116.1 + i * 0.38, TOWN_Y + 3.0, z, CA);
    for (let i = 0; i <= 7; i++) for (const x of [115.98, 120.02]) box(0.06, 2.6, 0.12, x, TOWN_Y + 3.0, 38.7 + i * 0.37, CA);
    A(gableRoofGeo(4.6, 4.0, 1.6), 118, TOWN_Y + 4.3, 40, { tag: 'cardak', col: '#7a5a3a', bleed: '#523a22', pat: PAT.planks, ps: 3 });
  });
  b.object(() => {      // the copper cauldron ('kazan') on its fire
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; A(G.ICO0, 96 + Math.cos(a) * 1.0, TOWN_Y + 0.15, 38 + Math.sin(a) * 1.0, { tag: 'props', col: STONE[0], bleed: STONE[1] }, a, 0, 0, [0.28, 0.2, 0.24]); }
    for (const a of [0.3, 1.9, 3.6]) box(0.12, 0.12, 1.1, 96, TOWN_Y + 0.16, 38, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1], solid: false }, a);
    A(new THREE.CylinderGeometry(0.95, 0.7, 0.9, 16), 96, TOWN_Y + 0.95, 38, { tag: 'kazan', col: '#c97b3c', bleed: '#924f1f' });
    A(G.CYL16, 96, TOWN_Y + 1.36, 38, { tag: 'kazan', col: '#3a1c34', bleed: '#22101e', solid: false, ink: false }, 0, 0, 0, [0.88, 0.04, 0.88]);
    box(0.06, 0.06, 1.8, 96.3, TOWN_Y + 1.7, 38.4, { tag: 'kazan', col: '#9a6c3e', bleed: '#6b4826', solid: false }, 0.4, 0.7, 0);
  });
  smoke.push(V(96, TOWN_Y + 1.6, 38));
  people.push({ kind: 'chat', x: 98.0, y: TOWN_Y + 0.04, z: 39.4, ry: -Math.PI / 2 - 0.4, tag: 'passerby', woman: true, scarfChoice: 'yes' });
  b.object(() => {      // plum jam ('pekmez') in jars on a bench
    box(2.4, 0.5, 0.6, 101, TOWN_Y + 0.25, 43.4, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3 });
    for (let i = 0; i < 5; i++) {
      A(G.CYL12, 100.1 + i * 0.45, TOWN_Y + 0.7, 43.4, { tag: 'pekmez', col: '#4a1e3e', bleed: '#2c1024' }, 0, 0, 0, [0.15, 0.4, 0.15]);
      A(G.CYL12, 100.1 + i * 0.45, TOWN_Y + 0.92, 43.4, { tag: 'pekmez', col: '#e8d8b0', bleed: '#c4b088' }, 0, 0, 0, [0.18, 0.05, 0.18]);
    }
  });
  for (const [x, z, ry] of [[108, 30, 0.4], [110, 32.4, -1.2], [112.4, 30.6, 2.2], [109.6, 34.6, 0.9]]) people.push({ kind: 'goose', tag: 'guska', x, y: TOWN_Y + 0.04, z, ry });
  // the plum orchard ('sljiva')
  for (const [x, z, s] of [[130, 54, 1.0], [138, 56, 1.05], [146, 54, 0.95], [132, 64, 1.0], [140, 66, 1.05], [148, 64, 0.95]]) {
    tree(x, TOWN_Y, z, s, 'round', 'sljiva', '#8a9a48', '#5f6e2c');
    b.object(() => { for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; A(G.SPHERE, x + Math.cos(a) * 1.7 * s, TOWN_Y + 4.0 * s + rr(-0.6, 0.6), z + Math.sin(a) * 1.7 * s, { tag: 'sljiva', col: '#3e3a78', bleed: '#26224e', solid: false }, 0, 0, 0, 0.14); } });
    leafEmitters.push({ x, y: TOWN_Y + 4.6 * s, z, r: 2 * s });
  }
  // the ploughed field ('njiva'), the tractor ('traktor'), the haystack ('plast') and fork ('vile'), the scarecrow ('strasilo')
  box(80, 0.2, 40, 110, TOWN_Y + 0.1, 100, { tag: 'njiva', col: '#8a6a48', bleed: '#5e462c', pat: PAT.planks, ps: 12 });
  b.object(() => {
    const TR = { tag: 'traktor', col: '#c8302a', bleed: '#8e1d1a' }, BK = { tag: 'traktor', col: '#2b2e32', bleed: '#16181a' };
    box(1.6, 1.2, 3.0, 96, TOWN_Y + 1.3, 92, TR);
    box(1.5, 1.6, 1.4, 96, TOWN_Y + 2.4, 93.0, { tag: 'traktor', col: '#cfe6f2', bleed: '#8fb6cc' });
    box(1.7, 0.12, 1.6, 96, TOWN_Y + 3.25, 93.0, TR);
    for (const s of [-1, 1]) { A(G.CYL16, 96 + s * 1.0, TOWN_Y + 0.9, 93.4, BK, 0, 0, Math.PI / 2, [0.9, 0.42, 0.9]); A(G.CYL16, 96 + s * 0.85, TOWN_Y + 0.55, 90.8, BK, 0, 0, Math.PI / 2, [0.5, 0.3, 0.5]); }
    A(G.CYL, 96.4, TOWN_Y + 2.4, 90.9, BK, 0, 0, 0, [0.08, 1.4, 0.08]);
    box(2.2, 1.0, 3.6, 96, TOWN_Y + 1.0, 97, { tag: 'traktor', col: '#5f7d8a', bleed: '#3f5a66' });
    A(G.ICO, 96, TOWN_Y + 1.6, 97, { tag: 'traktor', col: '#e8b830', bleed: '#b0841a', hull: true }, 0, 0, 0, [1.0, 0.5, 1.6]);
  });
  b.object(() => {
    A(G.HEMI, 78, TOWN_Y + 0.2, 108, { tag: 'plast', col: '#d8b86a', bleed: '#a8883c', hull: true }, 0, 0, 0, [2.4, 4.2, 2.4]);
    A(G.CYL, 78, TOWN_Y + 4.8, 108, { tag: 'plast', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.08, 1.4, 0.08]);
  });
  b.object(() => {
    box(0.07, 0.07, 2.4, 80.6, TOWN_Y + 1.25, 107.6, { tag: 'vile', col: '#9a6c3e', bleed: '#6b4826' }, 0.4, 1.0, 0);
    for (const ox of [-0.14, 0, 0.14]) box(0.03, 0.03, 0.5, 81.1 + ox, TOWN_Y + 0.25, 106.8, { tag: 'vile', col: '#5a5e64', bleed: '#383b40' }, 0.4, 1.0, 0);
  });
  b.object(() => {
    const SC = { tag: 'strasilo', col: '#8a6a44', bleed: '#5e4628' };
    A(G.CYL, 134, TOWN_Y + 1.3, 102, SC, 0, 0, 0, [0.07, 2.6, 0.07]);
    box(2.2, 0.08, 0.08, 134, TOWN_Y + 2.0, 102, SC);
    box(0.9, 1.0, 0.4, 134, TOWN_Y + 1.7, 102, { tag: 'strasilo', col: '#5a6a8a', bleed: '#3a4a66' });
    A(G.SPHERE, 134, TOWN_Y + 2.5, 102, { tag: 'strasilo', col: '#e8d8b0', bleed: '#c4b088', hull: true }, 0, 0, 0, 0.3);
    A(G.CONE8, 134, TOWN_Y + 2.9, 102, { tag: 'strasilo', col: '#6a4a2a', bleed: '#4a3018' }, 0, 0, 0, [0.42, 0.42, 0.42]);
  });
  // the dry corn field ('kukuruz')
  b.object(() => {
    for (let ix = 0; ix < 10; ix++) for (let iz = 0; iz < 8; iz++) {
      const x = 130 + ix * 2.6 + rr(-0.3, 0.3), z = 12 + iz * 4.2 + rr(-0.3, 0.3), h = rr(2.4, 3.0), lean = rr(-0.12, 0.12);
      A(G.CYL, x, TOWN_Y + h / 2, z, { tag: 'kukuruz', col: '#c8b070', bleed: '#9a8244' }, 0, lean, rr(-0.1, 0.1), [0.06, h, 0.06]);
      A(G.SPHERE, x + 0.12, TOWN_Y + h * 0.6, z, { tag: 'kukuruz', col: '#e8b830', bleed: '#b0841a', solid: false }, 0, 0, 0.4, [0.1, 0.24, 0.1]);
      box(0.9, 0.03, 0.14, x, TOWN_Y + h * 0.75, z, { tag: 'kukuruz', col: '#c8b070', bleed: '#9a8244', solid: false }, rr(0, 3), 0, -0.5);
    }
  });
  // dry sunflowers ('suncokret') at the field's edge
  b.object(() => {
    for (let ix = 0; ix < 5; ix++) for (let iz = 0; iz < 4; iz++) {
      const x = 72 + ix * 3.2 + rr(-0.3, 0.3), z = 54 + iz * 3.6 + rr(-0.3, 0.3), h = rr(2.4, 2.9);
      A(G.CYL, x, TOWN_Y + h / 2, z, { tag: 'suncokret', col: '#8a7a4a', bleed: '#5e5230' }, 0, 0, 0, [0.07, h, 0.07]);
      A(G.CYL16, x, TOWN_Y + h - 0.1, z + 0.25, { tag: 'suncokret', col: '#5a3e22', bleed: '#3a2612' }, 0, -1.0, 0, [0.42, 0.12, 0.42]);
      A(G.CYL16, x, TOWN_Y + h - 0.12, z + 0.26, { tag: 'suncokret', col: '#c8a43a', bleed: '#94761e', solid: false }, 0, -1.0, 0, [0.52, 0.06, 0.52]);
    }
  });
  // the row of golden poplars ('topola') along the farm road
  for (let i = 0; i < 8; i++) { tree(64, TOWN_Y, 4 + i * 15, 1.1, 'poplar', 'topola', '#e0b03a', '#a87a1a'); leafEmitters.push({ x: 64, y: TOWN_Y + 7, z: 4 + i * 15, r: 1.6 }); }

  // ==================== HOUSES, TREES, PEOPLE ====================
  {
    const keep = [[-46, -2, -6, 30], [-40, -8, 30, 50], [-62, -50, 10, 34], [-50, -44, 24, 36], [6, 26, -2, 16], [0, 36, 28, 54], [-76, -64, -40, 16], [28, 94, -46, -24], [-62, 30, -46, -32], [62, 165, -4, 124], [-4, 4, 36, 46]];
    const placed = [];
    const free = (x, z) => !keep.some(([x0, x1, z0, z1]) => x > x0 - 5 && x < x1 + 5 && z > z0 - 5 && z < z1 + 5) && placed.every(([px, pz]) => Math.hypot(px - x, pz - z) > 10);
    for (let x = -126; x <= 58; x += 12) for (let z = -22; z <= 150; z += 11.5) {
      const hx = x + rr(-2, 2), hz = z + rr(-2, 2);
      if (!free(hx, hz) || R() < 0.22) continue;
      placed.push([hx, hz]);
      house({ x: hx, y: TOWN_Y, z: hz, w: rr(6.6, 8.6), d: rr(5.4, 6.6), h: rr(2.9, 3.3), ry: Math.PI + rr(-0.08, 0.08), floors: R() < 0.55 ? 2 : 1, roof: 'tile', walls: R() < 0.5 ? WHITE : ['#f2e2c0', '#ccb890'] });
    }
    for (const [x, z] of [[-110, 20], [-96, 60], [-40, 70], [40, 80], [-120, 110], [10, 120], [-70, 140]]) {
      if (!free(x, z)) continue; placed.push([x, z]);
      const [c1, c2] = AUT[Math.floor(R() * 5)]; tree(x, TOWN_Y, z, 1.15, 'round', 'riverbank', c1, c2); leafEmitters.push({ x, y: TOWN_Y + 5.3, z, r: 2.4 });
    }
  }
  // Croatia across the river: poplars and a few houses of Gunja
  for (let i = 0; i < 12; i++) tree(-150 + i * 26 + rr(-4, 4), NORTH_Y, -92 - rr(0, 6), 1.15, 'poplar', 'hills', '#d8a83a', '#a0761a');
  for (const [x, z] of [[-120, -120], [-90, -130], [30, -134], [60, -126], [100, -132]]) house({ x, y: NORTH_Y, z, w: 7, d: 5.6, h: 3, roof: 'tile', tag: 'hills' });
  k.hills([[0, -230, 200, 20, 30, -2.5], [-230, 40, 30, 16, 200], [230, 40, 30, 16, 200]], ['#a8a46a', '#7c7844']);
  for (const [x, z] of [[-48, -32], [-20, -32], [12, -32], [-60, 4], [30, 24]]) { const [c1, c2] = AUT[Math.floor(R() * 5)]; tree(x, TOWN_Y, z, 0.95, 'round', 'riverbank', c1, c2); leafEmitters.push({ x, y: TOWN_Y + 4.4, z, r: 2 }); }
  people.push({ kind: 'bike', x: -50, y: TOWN_Y + 0.12, z: -39.6, to: [20, -39.6], speed: 2.2, tag: 'passerby' });
  people.push({ kind: 'walk', x: 16, y: TOWN_Y + 0.12, z: -41.2, to: [-40, -41.2], speed: 0.8, tag: 'passerby', woman: true, scarfChoice: 'no' });
  people.push({ kind: 'walk', x: -40, y: TOWN_Y + 0.08, z: 4, to: [-8, 4], speed: 0.9, tag: 'passerby' });
  people.push({ kind: 'chat', x: -30.4, y: TOWN_Y + 0.08, z: 20.4, ry: 0.8, tag: 'passerby' });
  people.push({ kind: 'chat', x: -29.4, y: TOWN_Y + 0.08, z: 21.2, ry: -2.2, tag: 'passerby', woman: true, scarfChoice: 'yes' });
  people.push({ kind: 'chat', x: 12, y: TOWN_Y + 0.04, z: 37.4, ry: 0.2, tag: 'passerby', woman: true, scarfChoice: 'no' });

  // ==================== THE ORBS ====================
  const PY = TOWN_Y + 0.12;      // the promenade's surface
  orb('most', [BX, BRIDGE_Y + 2, -64], 40, 'combo', BRIDGE_Y + 0.6, {
    stage: 0, at: V(BX, BRIDGE_Y + 2.6, -64), near: { p: [BX, BRIDGE_Y + 0.3, -64], r: 2.4 },
    view: { from: [-40, 12, -40], to: [-40, 16, -76], look: [BX, BRIDGE_Y + 2, -64] },
    wideView: { from: [-20, 26, -10], to: [-30, 30, -6], look: [BX, 8, -66], lookTo: [BX, 8, -66] },
  });
  orb('rijeka', [0, 0, -64], 40, 'combo', 0.5, { at: V(10, 2.4, -60), swim: { p: [10, 0, -60], r: 6 }, view: { from: [-10, 10, -32], to: [30, 10, -32], look: [10, 0, -66] }, wideView: { from: [-40, 30, -10], to: [40, 30, -10], look: [0, 0, -64], lookTo: [0, 0, -64] } });
  orb('luka', [61, TOWN_Y, -35], 30, 'combo', TOWN_Y + 0.4, { at: V(58, TOWN_Y + 2.4, -28.6), near: { p: [58, TOWN_Y + 0.12, -28.6], r: 1.6 }, view: { from: [40, 10, -14], to: [80, 10, -14], look: [61, TOWN_Y + 2, -38] } });
  orb('dizalica', [46, TOWN_Y + 10, -40], 16, 'close', TOWN_Y + 13, { view: { from: [30, 12, -20], to: [36, 16, -18], look: [46, TOWN_Y + 9, -44] } });
  orb('teglenica', [56, 1, -50.8], 20, 'close', 3.6, { view: { from: [40, 8, -64], to: [72, 8, -66], look: [56, 1.2, -50.8] } });
  orb('mornar', [68.6, 2.2, -49.0], 2.4, 'close', 3.4, { at: V(66.4, 2.6, -50.8), near: { p: [66.4, 1.2, -50.8], r: 0.9 } });
  orb('bitva', [54, TOWN_Y + 0.4, -44.4], 2, 'close', TOWN_Y + 1.0, { at: V(54, TOWN_Y + 2.2, -42.4), near: { p: [54, TOWN_Y + 0.12, -42.4], r: 0.9 }, view: { from: [50.4, TOWN_Y + 1.8, -40], to: [57.6, TOWN_Y + 1.8, -40], look: [54, TOWN_Y + 0.4, -44.4] } });
  orb('kontejner', [83, TOWN_Y + 2.6, -38.6], 8, 'close', TOWN_Y + 5.4);
  orb('bova', [-6, 0.8, -66], 2.4, 'close', 1.8, { at: V(-6, 2.4, -62.4), swim: { p: [-6, 0, -62.4], r: 2.0 } });
  orb('sidro', [-46, TOWN_Y + 2.2, -38], 3, 'close', TOWN_Y + 3.8, { at: V(-46, TOWN_Y + 2.2, -35.6), near: { p: [-46, PY, -35.6], r: 0.9 } });
  orb('magla', [10, NORTH_Y + 1.4, -104], 40, 'combo', NORTH_Y + 2.6, { at: V(10, NORTH_Y + 2.4, -90), near: { p: [10, NORTH_Y, -90], r: 1.8 }, view: { from: [-10, 8, -60], to: [30, 8, -60], look: [10, NORTH_Y + 1, -104] }, wideView: { from: [-30, 24, -30], to: [50, 24, -30], look: [10, 2, -104], lookTo: [10, 2, -104] } });

  orb('setaliste', [-16, TOWN_Y, -39], 30, 'combo', TOWN_Y + 0.4, { at: V(-52, TOWN_Y + 2.4, -40), near: { p: [-52, PY, -40], r: 1.4 }, view: { from: [-62, 7, -26], to: [-40, 7, -24], look: [-16, TOWN_Y, -40] } });
  orb('fenjer', [-26, TOWN_Y + 3.4, -35.4], 3, 'close', TOWN_Y + 5.0, { at: V(-26, TOWN_Y + 2.4, -37.4), near: { p: [-26, PY, -37.4], r: 0.9 } });
  orb('ribar', [-22, TOWN_Y + 1.0, -42.8], 2.4, 'close', TOWN_Y + 2.2, { at: V(-23.8, TOWN_Y + 2.2, -41.2), near: { p: [-23.8, PY, -41.2], r: 0.9 } });
  orb('stap', [-18.6, TOWN_Y + 2.0, -45.4], 4, 'close', TOWN_Y + 3.2, { at: V(-17.2, TOWN_Y + 2.2, -41.6), near: { p: [-17.2, PY, -41.6], r: 0.9 } });
  orb('mreza', [-10, TOWN_Y + 1.5, -38], 3, 'close', TOWN_Y + 2.8, { at: V(-10, TOWN_Y + 2.2, -40.4), near: { p: [-10, PY, -40.4], r: 0.9 } });
  orb('saran', [-14, 0.1, -50], 3, 'close', 0.8, { at: V(-14, 2.2, -54), swim: { p: [-14, 0, -54], r: 3.0 } });
  orb('camac', [-29.8, 0.4, -48.5], 4, 'close', 1.0, { at: V(-34, 2.6, -48.6), near: { p: [-34, 1.12, -48.6], r: 1.0 } });
  orb('bicikl', [5, TOWN_Y + 0.7, -36.6], 2, 'close', TOWN_Y + 1.6, { at: V(5, TOWN_Y + 2.2, -38.6), near: { p: [5, PY, -38.6], r: 0.9 } });

  orb('trg', [-24, TOWN_Y, 12], 26, 'combo', TOWN_Y + 0.4, { at: V(-40, TOWN_Y + 2.4, 0), near: { p: [-40, TOWN_Y + 0.1, 0], r: 1.4 }, view: { from: [-44, 12, -16], to: [-4, 12, -16], look: [-24, TOWN_Y, 14] } });
  orb('fontana', [-24, TOWN_Y + 1.4, 12], 5, 'close', TOWN_Y + 4.2);
  orb('dzamija', [14, TOWN_Y + 5, 6], 14, 'close', TOWN_Y + 13.4);
  orb('munara', [22.5, TOWN_Y + 14, 14], 6, 'close', TOWN_Y + 30, { at: V(24.9, TOWN_Y + 25, 14), near: { p: [23.8, TOWN_Y + 23.175, 14], r: 0.6 } });
  orb('crkva', [-56, TOWN_Y + 6, 22], 14, 'close', TOWN_Y + 10.6);
  orb('zvono', [-56, TOWN_Y + 10.6, 13.9], 1.6, 'close', TOWN_Y + 11.4, { at: V(-56, TOWN_Y + 11.4, 11.7), near: { p: [-56, TOWN_Y + 9.35, 13.75], r: 0.5 }, view: { from: [-58.6, TOWN_Y + 10.8, 8.4], to: [-53.4, TOWN_Y + 10.8, 8.4], look: [-56, TOWN_Y + 10.6, 13.9] } });
  orb('zastava', [-22.75, TOWN_Y + 16.6, 34.4], 3, 'close', TOWN_Y + 17.4, { at: V(-24, TOWN_Y + 15.6, 32.6), near: { p: [-24, TOWN_Y + 13.83, 33.6], r: 0.7 }, view: { from: [-26, TOWN_Y + 16, 28], to: [-19, TOWN_Y + 16, 28], look: [-22.75, TOWN_Y + 16.4, 34.4] } });
  orb('lisce', [-46.5, TOWN_Y + 0.3, 30], 2.4, 'close', TOWN_Y + 1.0, { at: V(-47.4, TOWN_Y + 2.0, 27.6), near: { p: [-47.4, TOWN_Y, 27.6], r: 0.9 } });
  orb('grablje', [-45.3, TOWN_Y + 0.7, 30.4], 2.2, 'close', TOWN_Y + 1.6, { at: V(-44.0, TOWN_Y + 2.0, 32.4), near: { p: [-44.0, TOWN_Y, 32.4], r: 0.9 } });

  orb('pijaca', [18, TOWN_Y + 3, 41], 26, 'combo', TOWN_Y + 4.4, { view: { from: [6, 10, 22], to: [30, 10, 22], look: [18, TOWN_Y + 1.6, 41] } });
  orb('bundeva', [5.4, TOWN_Y + 1.1, 41.2], 2.4, 'close', TOWN_Y + 1.8, { at: V(5.0, TOWN_Y + 2.0, 38.6), near: { p: [5.0, TOWN_Y, 38.6], r: 0.9 } });
  orb('kupus', [10.2, TOWN_Y + 1.18, 41.2], 2.0, 'close', TOWN_Y + 1.8, { at: V(10.6, TOWN_Y + 2.0, 38.6), near: { p: [10.6, TOWN_Y, 38.6], r: 0.9 } });
  orb('paprika', [15.6, TOWN_Y + 2.4, 40.2], 3, 'close', TOWN_Y + 3.4, { at: V(15.6, TOWN_Y + 2.0, 38.0), near: { p: [15.6, TOWN_Y, 38.0], r: 0.9 }, view: { from: [12.6, TOWN_Y + 2.4, 36.4], to: [18.6, TOWN_Y + 2.4, 36.4], look: [15.6, TOWN_Y + 2.0, 40.2] } });
  orb('jabuka', [20.2, TOWN_Y + 1.3, 40.8], 2.2, 'close', TOWN_Y + 1.8, { at: V(20.6, TOWN_Y + 2.0, 38.6), near: { p: [20.6, TOWN_Y, 38.6], r: 0.9 } });
  orb('orah', [26.8, TOWN_Y + 0.9, 40], 2.2, 'close', TOWN_Y + 1.6, { at: V(26.0, TOWN_Y + 2.0, 37.6), near: { p: [26.0, TOWN_Y, 37.6], r: 0.9 } });
  orb('prodavac', [29.6, TOWN_Y + 1.0, 43.2], 2.4, 'close', TOWN_Y + 2.2, { at: V(31.0, TOWN_Y + 2.0, 38.6), near: { p: [31.0, TOWN_Y, 38.6], r: 0.9 }, view: { from: [27.4, TOWN_Y + 2.2, 37.6], to: [32.8, TOWN_Y + 2.2, 37.6], look: [29.6, TOWN_Y + 1.1, 43.2] } });
  orb('kesten', [-2, TOWN_Y + 1.2, 39.9], 1.8, 'close', TOWN_Y + 1.8, { at: V(-2, TOWN_Y + 2.0, 38.0), near: { p: [-2, TOWN_Y, 38.0], r: 0.9 } });

  orb('njiva', [110, TOWN_Y + 0.2, 104], 40, 'combo', TOWN_Y + 0.6, { at: V(116, TOWN_Y + 2.4, 112), near: { p: [116, TOWN_Y + 0.2, 112], r: 1.6 }, view: { from: [90, 14, 70], to: [130, 14, 70], look: [110, TOWN_Y, 104] }, wideView: { from: [80, 30, 60], to: [140, 30, 60], look: [110, 2, 100], lookTo: [110, 2, 100] } });
  orb('kukuruz', [143, TOWN_Y + 1.6, 27], 22, 'combo', TOWN_Y + 3.4, { at: V(126, TOWN_Y + 2.4, 27), near: { p: [126, TOWN_Y, 27], r: 1.4 }, view: { from: [124, 7, 4], to: [124, 7, 50], look: [143, TOWN_Y + 1.4, 27] }, wideView: { from: [120, 16, 0], to: [160, 16, 0], look: [143, 3, 27], lookTo: [143, 3, 27] } });
  orb('cardak', [118, TOWN_Y + 3, 40], 5, 'close', TOWN_Y + 6.2);
  orb('traktor', [96, TOWN_Y + 1.6, 93], 6, 'close', TOWN_Y + 3.6);
  orb('plast', [78, TOWN_Y + 2.4, 108], 5, 'close', TOWN_Y + 5.8);
  orb('vile', [80.8, TOWN_Y + 1.2, 107.4], 2.6, 'close', TOWN_Y + 2.2, { at: V(82.4, TOWN_Y + 2.2, 106.0), near: { p: [82.4, TOWN_Y + 0.2, 106.0], r: 0.9 } });
  orb('strasilo', [134, TOWN_Y + 1.8, 102], 3, 'close', TOWN_Y + 3.4, { at: V(134, TOWN_Y + 2.2, 99.6), near: { p: [134, TOWN_Y + 0.2, 99.6], r: 0.9 } });
  orb('suncokret', [78, TOWN_Y + 2.2, 59], 12, 'combo', TOWN_Y + 3.2, { at: V(78, TOWN_Y + 2.4, 49.6), near: { p: [78, TOWN_Y, 49.6], r: 1.2 }, view: { from: [70, 6, 44], to: [86, 6, 44], look: [78, TOWN_Y + 2, 60] } });
  orb('kazan', [96, TOWN_Y + 1.0, 38], 2.4, 'close', TOWN_Y + 2.0, { at: V(94.0, TOWN_Y + 2.0, 38), near: { p: [94.0, TOWN_Y, 38], r: 0.9 } });
  orb('pekmez', [101, TOWN_Y + 0.8, 43.4], 2.4, 'close', TOWN_Y + 1.6, { at: V(101, TOWN_Y + 2.0, 41.6), near: { p: [101, TOWN_Y, 41.6], r: 0.8 } });
  orb('sljiva', [138, TOWN_Y + 4, 60], 18, 'combo', TOWN_Y + 7, { at: V(138, TOWN_Y + 2.4, 49.6), near: { p: [138, TOWN_Y, 49.6], r: 1.2 }, view: { from: [126, 9, 40], to: [150, 9, 40], look: [138, TOWN_Y + 3.4, 60] } });
  orb('guska', [110, TOWN_Y + 0.5, 32], 4, 'close', TOWN_Y + 1.2, { at: V(106.4, TOWN_Y + 2.0, 32), near: { p: [106.4, TOWN_Y, 32], r: 0.9 } });
  orb('pleter', [88, TOWN_Y + 0.8, 22], 6, 'close', TOWN_Y + 1.6, { at: V(86.2, TOWN_Y + 2.0, 22), near: { p: [86.2, TOWN_Y, 22], r: 0.9 }, view: { from: [82, 3.2, 16], to: [82, 3.2, 28], look: [88, TOWN_Y + 0.8, 22] } });
  orb('gnijezdo', [92, TOWN_Y + 9.5, 18], 3, 'close', TOWN_Y + 10.4);
  orb('topola', [64, TOWN_Y + 6, 56], 50, 'combo', TOWN_Y + 4, { at: V(60.6, TOWN_Y + 2.4, 56), near: { p: [60.6, TOWN_Y, 56], r: 1.2 }, view: { from: [40, 14, 40], to: [40, 14, 72], look: [64, TOWN_Y + 6, 56] } });
  orb('jato', [-34, 0.7, -72], 9, 'close', 1.4, { at: V(-39.4, 2.2, -72), near: { p: [-39.4, 0.3, -72], r: 1.2 } });
  // the last: the City Hall
  orb('vijecnica', [-24, TOWN_Y + 6, 39], 28, 'combo', TOWN_Y + 13, {
    stage: 2, at: V(-24, TOWN_Y + 2.4, 28.4), near: { p: [-24, TOWN_Y + 0.1, 28.4], r: 1.6 },
    view: { from: [-40, 10, 14], to: [-8, 10, 14], look: [-24, TOWN_Y + 6, 36] },
    wideView: { from: [-52, 26, -4], to: [4, 26, -4], look: [-24, TOWN_Y + 6, 38], lookTo: [-24, TOWN_Y + 6, 38] },
  });

  return k.finish({ start: V(-40, PY, -40), fleur: V(-24, TOWN_Y + 26, 30), leafEmitters });
}
