// Konjic (summer): the emerald Neretva through the middle of the town (flowing south, +z) under the six-arched
// Stara ćuprija; on the west bank the čaršija (mosque and minaret, česma, linden, bakery, kafana) and the woodcarvers'
// workshop; on the east bank the railway station and its train, and the rafting base on a pebble beach; downstream a
// river beach and a rapid; Prenj with snow on its peaks to the south-west; and Tito's bunker hidden behind an
// ordinary house in the hill to the north-west.
import { town, THREE, PAT, V, G, PAL, dynMesh, archBayGeo, hipRoofGeo, portalGeo } from './townkit.js';

export const TOWN_Y = 2.0;       // the banks
export const BRIDGE_Y = 6.4;     // the bridge deck
export const BEACH_Y = 0.35;     // the pebble beaches
const RW = 16;                   // half the river's width

// the band of stones round an arch (outer edge, then back along the inner edge)
function archRingGeo(ow, springH, apexH, t, depth) {
  const s = new THREE.Shape();
  s.moveTo(-ow - t, 0); s.lineTo(-ow - t, springH);
  s.quadraticCurveTo(-(ow + t) * 0.96, (apexH + t) * 0.9, 0, apexH + t);
  s.quadraticCurveTo((ow + t) * 0.96, (apexH + t) * 0.9, ow + t, springH);
  s.lineTo(ow + t, 0); s.lineTo(ow, 0); s.lineTo(ow, springH);
  s.quadraticCurveTo(ow * 0.96, apexH * 0.9, 0, apexH);
  s.quadraticCurveTo(-ow * 0.96, apexH * 0.9, -ow, springH);
  s.lineTo(-ow, 0); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 8 });
  g.translate(0, 0, -depth / 2);
  return g;
}

export function buildKonjicWorld(scene) {
  const k = town(scene, {
    seed: 1682, sun: [-0.3, 0.7, 0.62], water: [0, 1],
    light: { glow: [1.0, 0.92, 0.7] }, sky: ['#a9d6ee', '#6aaed6'],
  });
  const { A, box, rr, R, orb, people, smoke, house, tree, b } = k;
  const { WHITE, STONE, WOOD_D, WOOD_W, GRASS_S, SLAB, TILE } = PAL;
  const BANK_M = { tag: 'riverbank', col: GRASS_S[0], bleed: GRASS_S[1], pat: PAT.grass };
  const EMB_M = { tag: 'riverbank', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.65 };
  k.bigTags('cuprija', 'rijeka', 'plaza', 'pruga', 'livada', 'planina', 'snijeg', 'radionica', 'stanica');
  k.lateTags('svod', 'stub', 'strugotina', 'kasika', 'leptir');

  // ==================== TERRAIN ====================
  box(520, 4, 520, 0, -4.2, 0, { tag: 'hills', col: '#9aae62', bleed: '#73883f', pat: PAT.grass, ink: false });
  box(2 * RW + 4, 2, 360, 0, -2.2, 0, { tag: 'riverbank', col: '#1d6a5c', bleed: '#124840', ink: false });
  // banks (the town reaches the water behind stone embankments; between z 40 and 80 a pebble beach on each side)
  for (const s of [-1, 1]) {
    box(144, 6, 200, s * (RW + 72), TOWN_Y - 3, -60, BANK_M);
    box(144, 6, 100, s * (RW + 72), TOWN_Y - 3, 130, BANK_M);
    const inner = s < 0 ? 30 : 28;
    box(160 - inner, 6, 40, s * (inner + (160 - inner) / 2), TOWN_Y - 3, 60, BANK_M);
    b.object(() => {
      box(0.9, TOWN_Y + 1.6, 200, s * (RW + 0.45), TOWN_Y / 2 - 0.8, -60, EMB_M);
      box(0.9, TOWN_Y + 1.6, 100, s * (RW + 0.45), TOWN_Y / 2 - 0.8, 130, EMB_M);
      box(0.9, TOWN_Y + 1.6, 40, s * (inner + 0.45), TOWN_Y / 2 - 0.8, 60, EMB_M);
    });
  }
  // the pebble beaches ('plaza' is the west one; the east one is the rafters')
  box(14, 1.6, 40, -(RW + 7), BEACH_Y - 0.8, 60, { tag: 'plaza', col: '#d9d2c3', bleed: '#b0a794', pat: PAT.cobble, ps: 1.6 });
  box(12, 1.6, 40, RW + 6, BEACH_Y - 0.8, 60, { tag: 'riverbank', col: '#d9d2c3', bleed: '#b0a794', pat: PAT.cobble, ps: 1.6 });

  // the Neretva ('rijeka'): clear emerald
  box(2 * RW + 0.4, 0.12, 360, 0, -0.06, 0, { tag: 'rijeka', col: '#1f9c88', bleed: '#11705f', pat: PAT.water, hatch: 0, water: true, ink: false });

  // ==================== THE OLD BRIDGE ====================
  const bays = [-14, -8.4, -2.8, 2.8, 8.4, 14];
  b.object(() => {
    const CU = { tag: 'cuprija', col: '#ddd3bd', bleed: '#b4a88e', pat: PAT.blocks, ps: 0.6, pool: 0.85 };
    const bay = archBayGeo(5.6, BRIDGE_Y, 4.3, 1.2, 4.6, 4.2, 0.9);
    for (const cx of bays) A(bay, cx, 0, 0, CU);
    box(34.6, 0.3, 4.4, 0, BRIDGE_Y + 0.15, 0, { tag: 'cuprija', col: '#d6ccb6', bleed: '#ada28a', pat: PAT.cobble, ps: 0.7 });
    for (const pz of [-2.05, 2.05]) box(34.6, 0.85, 0.3, 0, BRIDGE_Y + 0.72, pz, { ...CU, wall: true });
    for (const s of [-1, 1]) {
      const L = 11, rise = BRIDGE_Y + 0.3 - TOWN_Y, ang = Math.atan2(rise, L);
      box(Math.hypot(L, rise), 1.6, 4.4, s * (17.3 + L / 2), TOWN_Y + rise / 2 - 0.62, 0, { ...CU, pat: PAT.cobble, ps: 0.7 }, 0, 0, s * -ang);
      for (const pz of [-2.05, 2.05]) box(Math.hypot(L, rise), 0.85, 0.3, s * (17.3 + L / 2), TOWN_Y + rise / 2 + 0.6, pz, { ...CU, wall: true }, 0, 0, s * -ang);
    }
  });
  b.object(() => {      // the arch rings ('svod')
    const SV = { tag: 'svod', col: '#c9bda2', bleed: '#9d9078', pat: PAT.blocks, ps: 1.4 };
    const ring = archRingGeo(4.3 / 2 - 0.02, 1.2, 4.6, 0.42, 4.32);
    for (const cx of bays) A(ring, cx, 0, 0, SV);
  });
  b.object(() => {      // the piers' pointed cutwaters ('stub'), upstream and down
    const ST = { tag: 'stub', col: '#e3dac6', bleed: '#bcb09a', pat: PAT.blocks, ps: 0.7 };
    for (const px of [-11.2, -5.6, 0, 5.6, 11.2]) for (const s of [-1, 1]) {
      box(1.0, 3.4, 1.0, px, 0.7, s * 2.45, ST, Math.PI / 4);
      A(G.CONE4, px, 3.1, s * 2.45, { tag: 'stub', col: '#ece4d2', bleed: '#c3b8a2' }, 0, 0, 0, [0.72, 1.0, 0.72]);
    }
  });

  // ==================== THE ČARŠIJA (WEST BANK) ====================
  // the mosque ('dzamija') and its minaret ('munara')
  b.object(() => {
    const DZ = { tag: 'dzamija', col: WHITE[0], bleed: WHITE[1] };
    box(10, 1.0, 10, -46, TOWN_Y + 0.5, 18, { tag: 'dzamija', col: STONE[0], bleed: STONE[1], pat: PAT.blocks, ps: 0.7 });
    box(10, 6, 10, -46, TOWN_Y + 4, 18, DZ);
    A(hipRoofGeo(11.6, 11.6, 3.8), -46, TOWN_Y + 7, 18, { tag: 'dzamija', col: TILE[0], bleed: TILE[1], pat: PAT.roof });
    box(0.2, 3.0, 1.6, -40.95, TOWN_Y + 2.5, 18, { tag: 'dzamija', col: '#4a3120', solid: false });
    for (const oz of [-3, 3]) box(0.2, 2.0, 1.1, -40.95, TOWN_Y + 4.2, 18 + oz, { tag: 'dzamija', col: '#3a4a52', solid: false });
    // a wooden porch in front of the door
    for (const oz of [-3.5, 3.5]) box(0.24, 3.2, 0.24, -38.6, TOWN_Y + 1.6, 18 + oz, { tag: 'dzamija', col: WOOD_D[0], bleed: WOOD_D[1] });
    box(3.0, 0.2, 8.4, -39.6, TOWN_Y + 3.3, 18, { tag: 'dzamija', col: TILE[0], bleed: TILE[1], pat: PAT.roof }, 0, 0, 0.16);
  });
  b.object(() => {
    const MU = { tag: 'munara', col: '#f6f2e8', bleed: '#d8d0bf' };
    A(G.CYL12, -38.6, TOWN_Y + 9, 25.4, MU, 0, 0, 0, [1.0, 18, 1.0]);
    A(G.CYL12, -38.6, TOWN_Y + 14.2, 25.4, MU, 0, 0, 0, [1.55, 0.35, 1.55]);
    A(G.CYL12, -38.6, TOWN_Y + 15, 25.4, { tag: 'munara', col: '#e8e0cc', bleed: '#c4baa4', solid: false }, 0, 0, 0, [1.45, 0.9, 1.45]);
    A(G.CONE8, -38.6, TOWN_Y + 20.2, 25.4, { tag: 'munara', col: '#7d8790', bleed: '#58616a' }, 0, 0, 0, [1.05, 4.4, 1.05]);
    A(G.CYL, -38.6, TOWN_Y + 23.1, 25.4, { tag: 'munara', col: '#d5b043', bleed: '#9e7f22', solid: false }, 0, 0, 0, [0.05, 1.2, 0.05]);
  });
  // the fountain ('cesma')
  b.object(() => {
    const CE = { tag: 'cesma', col: '#e5dcc8', bleed: '#bdb29b', pat: PAT.blocks, ps: 1.1 };
    box(0.6, 2.0, 2.4, -38.4, TOWN_Y + 1.0, 11.5, CE);
    A(G.HEMI, -38.4, TOWN_Y + 2.0, 11.5, CE, 0, 0, 0, [0.3, 0.5, 1.2]);
    box(1.0, 0.5, 2.2, -37.7, TOWN_Y + 0.25, 11.5, CE);
    box(0.8, 0.06, 2.0, -37.7, TOWN_Y + 0.5, 11.5, { tag: 'cesma', col: '#5ab3b0', bleed: '#2f8784', solid: false, ink: false });
    A(G.CYL, -37.9, TOWN_Y + 1.25, 11.5, { tag: 'cesma', col: '#c9a54a', bleed: '#94761f' }, 0, 0, Math.PI / 2, [0.05, 0.4, 0.05]);
  });
  // the linden ('lipa') in bloom and the bench ('klupa') under it
  k.tree(-28, TOWN_Y, 30, 1.45, 'round', 'lipa', '#a9b84e', '#7a8a2e');
  b.object(() => {
    for (let i = 0; i < 14; i++) A(G.SPHERE, -28 + rr(-2.6, 2.6), TOWN_Y + 6.4 * 1.0 + rr(-1.4, 1.6), 30 + rr(-2.6, 2.6), { tag: 'lipa', col: '#f1e39a', bleed: '#cdbb5c', solid: false, ink: false }, 0, 0, 0, 0.32);
  });
  b.object(() => {
    const KL = { tag: 'klupa', col: '#8a5a32', bleed: '#5e3b1d', pat: PAT.planks, ps: 3 };
    box(2.6, 0.12, 0.6, -28, TOWN_Y + 0.5, 25.6, KL);
    box(2.6, 0.5, 0.1, -28, TOWN_Y + 0.85, 25.95, KL);
    for (const ox of [-1.1, 1.1]) box(0.12, 0.5, 0.55, -28 + ox, TOWN_Y + 0.25, 25.6, KL);
  });
  // the bakery ('pekara') and its burek ('burek') on a counter outside
  house({ x: -58, y: TOWN_Y, z: 4, w: 8, d: 6, h: 3.4, ry: Math.PI / 2, tag: 'pekara', roof: 'tile' });
  b.object(() => {
    box(0.2, 0.7, 4.0, -54.85, TOWN_Y + 4.0, 4, { tag: 'pekara', col: '#d8b04a', bleed: '#a48022' });      // the sign
    box(1.0, 0.9, 2.8, -53.4, TOWN_Y + 0.45, 4, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1], pat: PAT.planks, ps: 3 });
    for (const oz of [-0.7, 0.7]) {
      A(G.CYL16, -53.4, TOWN_Y + 0.93, 4 + oz, { tag: 'burek', col: '#8f9396', bleed: '#64686b' }, 0, 0, 0, [0.6, 0.06, 0.6]);
      A(G.CYL16, -53.4, TOWN_Y + 1.0, 4 + oz, { tag: 'burek', col: '#d9a352', bleed: '#a87428', pat: PAT.kilim, ps: 2.4 }, 0, 0, 0, [0.54, 0.1, 0.54]);
    }
  });
  people.push({ kind: 'sell', x: -55.6, y: TOWN_Y + 0.04, z: 2.2, ry: Math.PI / 2, tag: 'passerby' });
  // the kafana by the bridge, its terrace table with coffee ('kahva')
  house({ x: -32, y: TOWN_Y, z: -12, w: 7, d: 5.6, h: 3.2, ry: Math.PI / 2, tag: 'kafana', roof: 'tile' });
  b.object(() => {
    A(G.CYL12, -25.5, TOWN_Y + 0.4, -12, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0, [0.12, 0.8, 0.12]);
    A(G.CYL16, -25.5, TOWN_Y + 0.82, -12, { tag: 'props', col: '#f2eee4', bleed: '#d2ccbd' }, 0, 0, 0, [0.7, 0.05, 0.7]);
    A(G.CYL16, -25.5, TOWN_Y + 0.87, -12, { tag: 'kahva', col: '#c97b3c', bleed: '#924f1f' }, 0, 0, 0, [0.42, 0.03, 0.42]);
    A(G.CYL12, -25.65, TOWN_Y + 1.02, -12.1, { tag: 'kahva', col: '#c97b3c', bleed: '#924f1f' }, 0, 0, 0, [0.09, 0.26, 0.09]);
    A(G.CYL, -25.92, TOWN_Y + 1.1, -12.1, { tag: 'kahva', col: '#c97b3c', bleed: '#924f1f', solid: false }, 0, 0, Math.PI / 2 - 0.3, [0.02, 0.36, 0.02]);
    for (const [ox, oz] of [[0.2, 0.15], [-0.05, 0.25]]) A(G.CYL12, -25.5 + ox, TOWN_Y + 0.95, -12 + oz, { tag: 'kahva', col: '#f7f4ec', bleed: '#d4cec0' }, 0, 0, 0, [0.06, 0.1, 0.06]);
    for (const oz of [-1.2, 1.2]) box(0.5, 0.5, 0.5, -25.5, TOWN_Y + 0.25, -12 + oz, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
  });
  people.push({ kind: 'chat', x: -27.4, y: TOWN_Y + 0.04, z: -9.2, ry: 2.4, tag: 'passerby' });
  people.push({ kind: 'chat', x: -26.4, y: TOWN_Y + 0.04, z: -8.4, ry: -2.0, tag: 'passerby', woman: true });

  // ==================== THE WOODCARVERS' WORKSHOP ====================
  b.object(() => {
    const RW_ = { tag: 'radionica', col: '#9a6c3e', bleed: '#6b4826', pat: PAT.planks, ps: 2.2 };
    box(0.3, 4.2, 12, -62, TOWN_Y + 2.1, -28, RW_);
    for (const z of [-34, -22]) box(12, 4.2, 0.3, -56, TOWN_Y + 2.1, z, RW_);
    for (const z of [-33.8, -22.2]) box(0.3, 4.2, 0.3, -50.15, TOWN_Y + 2.1, z, RW_);
    box(13.4, 0.3, 13.2, -56, TOWN_Y + 4.75, -28, { tag: 'radionica', col: SLAB[0], bleed: SLAB[1], pat: PAT.roof, ps: 1.4 }, 0, 0, -0.1);
  });
  b.object(() => {
    box(1.0, 0.9, 4.0, -60.5, TOWN_Y + 0.45, -28, { tag: 'props', col: '#7d5530', bleed: '#55371a', pat: PAT.planks, ps: 3 });
    for (const [oz, ry] of [[-29.6, 0.2], [-29.2, -0.1], [-28.8, 0.35]]) {
      box(0.5, 0.04, 0.06, -60.4, TOWN_Y + 0.93, oz, { tag: 'dlijeto', col: '#9aa3ad', bleed: '#68717b' }, ry);
      box(0.22, 0.07, 0.08, -60.75, TOWN_Y + 0.94, oz + 0.06 * Math.sin(ry), { tag: 'dlijeto', col: '#8c5a32', bleed: '#613c1f' }, ry);
    }
    A(G.CYL12, -60.5, TOWN_Y + 1.05, -26.6, { tag: 'props', col: '#c8b48a', bleed: '#9c875e' }, 0, 0, 0, [0.16, 0.3, 0.16]);
    for (const a of [-0.25, 0, 0.25]) A(G.CYL, -60.5 + Math.sin(a) * 0.12, TOWN_Y + 1.35, -26.6, { tag: 'kasika', col: '#c08a50', bleed: '#8d5f2c' }, 0, 0, a, [0.025, 0.55, 0.025]);
    for (const a of [-0.25, 0, 0.25]) A(G.SPHERE, -60.5 + Math.sin(a) * 0.26, TOWN_Y + 1.63, -26.6, { tag: 'kasika', col: '#c08a50', bleed: '#8d5f2c' }, 0, 0, 0, [0.07, 0.1, 0.05]);
    for (let i = 0; i < 9; i++) A(G.ICO0, -58.6 + rr(-0.6, 0.6), TOWN_Y + 0.06, -31.3 + rr(-0.7, 0.7), { tag: 'strugotina', col: '#e8c98c', bleed: '#c19f5f', solid: false }, rr(0, 6), 0, 0, [0.16, 0.06, 0.1]);
  });
  people.push({ kind: 'hammer', x: -59.2, y: TOWN_Y + 0.04, z: -28, ry: -Math.PI / 2, tag: 'rezbar' });
  b.object(() => {      // the dowry chest ('sanduk'), carved all over
    box(1.8, 0.85, 1.0, -55, TOWN_Y + 0.43, -32.4, { tag: 'sanduk', col: '#6e4527', bleed: '#4b2c15', pat: PAT.kilim, ps: 3 });
    box(1.9, 0.14, 1.08, -55, TOWN_Y + 0.92, -32.4, { tag: 'sanduk', col: '#5d3a20', bleed: '#3f2511' });
  });
  b.object(() => {      // the low round table ('sofra') and a carved chair ('stolica')
    A(G.CYL16, -53.2, TOWN_Y + 0.38, -24.6, { tag: 'sofra', col: '#7b4d2a', bleed: '#523218', pat: PAT.kilim, ps: 3 }, 0, 0, 0, [0.85, 0.08, 0.85]);
    A(G.CYL12, -53.2, TOWN_Y + 0.17, -24.6, { tag: 'sofra', col: '#6b4325', bleed: '#472b14' }, 0, 0, 0, [0.55, 0.34, 0.55]);
    const ST = { tag: 'stolica', col: '#7b4d2a', bleed: '#523218' };
    box(0.7, 0.08, 0.7, -55.8, TOWN_Y + 0.5, -24.2, ST);
    box(0.7, 1.1, 0.08, -55.8, TOWN_Y + 1.05, -24.55, { ...ST, pat: PAT.kilim, ps: 2 });
    for (const [ox, oz] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) box(0.07, 0.5, 0.07, -55.8 + ox, TOWN_Y + 0.25, -24.2 + oz, ST);
  });
  b.object(() => {      // the carved rosette ('sara') on the back wall
    A(G.CYL16, -61.78, TOWN_Y + 2.6, -24.6, { tag: 'sara', col: '#8a5a30', bleed: '#5c3a1a', pat: PAT.kilim, ps: 4 }, 0, 0, Math.PI / 2, [0.75, 0.1, 0.75]);
    A(G.CYL16, -61.7, TOWN_Y + 2.6, -24.6, { tag: 'sara', col: '#a8743f', bleed: '#7a5126', solid: false }, 0, 0, Math.PI / 2, [0.35, 0.08, 0.35]);
  });
  b.object(() => {      // walnut planks ('orah') stacked outside
    for (let i = 0; i < 5; i++) box(3.2, 0.18, 0.7, -56, TOWN_Y + 0.12 + i * 0.2, -36.6 + (i % 2) * 0.1, { tag: 'orah', col: '#5a3a24', bleed: '#3b2414', pat: PAT.planks, ps: 2 });
  });

  // ==================== THE RAILWAY (EAST BANK) ====================
  const TX = 36;
  b.object(() => {
    const PR = { tag: 'pruga', col: '#6c737c', bleed: '#464c54' };
    for (const rx of [TX - 0.72, TX + 0.72]) box(0.14, 0.16, 300, rx, TOWN_Y + 0.2, 0, PR);
    for (let z = -148; z <= 148; z += 1.5) box(2.4, 0.1, 0.3, TX, TOWN_Y + 0.06, z, { tag: 'pruga', col: '#5a4230', bleed: '#3a2a1e' });
  });
  b.object(() => {      // the platform ('peron')
    box(4.6, 0.6, 30, TX + 4.2, TOWN_Y + 0.3, -18, { tag: 'peron', col: '#d6cfbf', bleed: '#aea795', pat: PAT.cobble, ps: 0.9 });
    box(0.3, 0.62, 30, TX + 2.05, TOWN_Y + 0.31, -18, { tag: 'peron', col: '#eadfb2', bleed: '#c4b77f' });
  });
  house({ x: 48, y: TOWN_Y, z: -18, w: 14, d: 7, h: 3.2, floors: 2, ry: -Math.PI / 2, tag: 'stanica', walls: ['#e8cf86', '#c4a85c'], roof: 'tile' });
  b.object(() => {      // the station clock ('sat') over the door
    A(G.CYL16, 44.3, TOWN_Y + 1.2 + 3.2 + 1.8, -18, { tag: 'sat', col: '#fbf8ee', bleed: '#d6d0c0' }, 0, 0, Math.PI / 2, [0.55, 0.12, 0.55]);
    box(0.04, 0.34, 0.05, 44.22, TOWN_Y + 6.32, -18, { tag: 'sat', col: '#2b2622', solid: false });
    box(0.04, 0.05, 0.26, 44.22, TOWN_Y + 6.2, -17.92, { tag: 'sat', col: '#2b2622', solid: false });
  });
  b.object(() => {      // the signal ('semafor')
    A(G.CYL, TX + 2.8, TOWN_Y + 2.4, -46, { tag: 'semafor', col: '#e9e6de', bleed: '#c2bdb2' }, 0, 0, 0, [0.1, 4.8, 0.1]);
    box(0.5, 1.3, 0.4, TX + 2.8, TOWN_Y + 4.6, -46, { tag: 'semafor', col: '#25282c', bleed: '#141618' });
    A(G.SPHERE, TX + 2.8, TOWN_Y + 4.95, -45.78, { tag: 'semafor', col: '#d63b2c', bleed: '#9a2116', solid: false }, 0, 0, 0, 0.14);
    A(G.SPHERE, TX + 2.8, TOWN_Y + 4.5, -45.78, { tag: 'semafor', col: '#3cb35c', bleed: '#217a38', solid: false }, 0, 0, 0, 0.14);
  });
  // the train: a blue locomotive ('lokomotiva') and two carriages ('vagon')
  b.object(() => {
    const LO = { tag: 'lokomotiva', col: '#2f5f9e', bleed: '#1d3f6e' };
    box(2.6, 3.0, 8, TX, TOWN_Y + 1.9, -30, LO);
    box(2.64, 0.34, 8.04, TX, TOWN_Y + 1.5, -30, { tag: 'lokomotiva', col: '#d83a2c', bleed: '#9a2116', solid: false });
    for (const s of [-1, 1]) box(2.2, 0.9, 0.1, TX, TOWN_Y + 2.7, -30 + s * 4.02, { tag: 'lokomotiva', col: '#bfe0f0', bleed: '#8ab8d0', solid: false });
    box(1.0, 0.1, 1.6, TX, TOWN_Y + 3.95, -30, { tag: 'lokomotiva', col: '#3a3d42', bleed: '#1f2124' });
    box(0.06, 0.6, 1.4, TX, TOWN_Y + 4.3, -30, { tag: 'lokomotiva', col: '#3a3d42', bleed: '#1f2124', solid: false }, 0, 0.5, 0);
  });
  b.object(() => {
    for (const cz of [-18.6, -4.2]) {
      const VA = { tag: 'vagon', col: '#4e7d52', bleed: '#335a36' };
      box(2.6, 2.8, 13.6, TX, TOWN_Y + 1.8, cz, VA);
      box(2.7, 0.24, 13.7, TX, TOWN_Y + 3.3, cz, { tag: 'vagon', col: '#8a8f94', bleed: '#5f6469' });
      for (const s of [-1, 1]) for (let i = 0; i < 6; i++) box(0.06, 0.8, 1.4, TX + s * 1.32, TOWN_Y + 2.4, cz - 5.6 + i * 2.24, { tag: 'vagon', col: '#d8ecf4', bleed: '#9fc4d4', solid: false });
    }
    for (const z of [-33, -27, -24, -13, -9.6, 1.2]) for (const s of [-1, 1]) A(G.CYL12, TX + s * 0.9, TOWN_Y + 0.45, z, { tag: 'vagon', col: '#2b2e32', bleed: '#16181a', solid: false }, 0, 0, Math.PI / 2, [0.42, 0.2, 0.42]);
  });
  people.push({ kind: 'visConductor', x: TX + 3.6, y: TOWN_Y + 0.64, z: -6.2, ry: -Math.PI / 2, tag: 'otpravnik' });
  b.object(() => {      // suitcases ('kofer') waiting on the platform
    box(0.8, 0.55, 0.3, TX + 4.6, TOWN_Y + 0.88, -14, { tag: 'kofer', col: '#8c5328', bleed: '#5e3517' }, 0.2);
    box(0.6, 0.45, 0.26, TX + 4.6, TOWN_Y + 1.38, -14.1, { tag: 'kofer', col: '#3d6a8c', bleed: '#254761' }, -0.2);
  });
  people.push({ kind: 'chat', x: TX + 5.4, y: TOWN_Y + 0.64, z: -11.6, ry: -2.2, tag: 'passerby', woman: true, scarfChoice: 'yes' });

  // ==================== THE RAFTING BASE (EAST BEACH) ====================
  const raft = (x, z, ry) => b.object(() => {
    A(new THREE.TorusGeometry(1.6, 0.45, 8, 20), x, BEACH_Y + 0.45, z, { tag: 'gumenjak', col: '#e0662a', bleed: '#a8441a', hull: true }, ry, Math.PI / 2, 0, [0.8, 1.45, 1]);
    A(G.CYL16, x, BEACH_Y + 0.12, z, { tag: 'gumenjak', col: '#4a4e55', bleed: '#2c2f33' }, ry, 0, 0, [1.25, 0.12, 2.2]);
    for (const oz of [-0.9, 0.9]) box(2.2, 0.3, 0.4, x, BEACH_Y + 0.55, z + oz, { tag: 'gumenjak', col: '#e0662a', bleed: '#a8441a' }, ry);
  });
  raft(21, 49.5, 0.1); raft(21.5, 57, -0.08);
  b.object(() => {      // the rack: paddles ('veslo') leaning on it, helmets ('kaciga') on top, vests ('prsluk') hanging
    for (const z of [59.6, 69.2]) box(0.16, 2.2, 0.16, 26.8, BEACH_Y + 1.1, z, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] });
    box(0.16, 0.16, 9.8, 26.8, BEACH_Y + 2.2, 64.4, { tag: 'props', col: WOOD_D[0], bleed: WOOD_D[1] });
    box(0.7, 0.1, 3.6, 26.95, BEACH_Y + 1.55, 64.4, { tag: 'props', col: WOOD_W[0], bleed: WOOD_W[1] });
    for (const z of [60.4, 61.0, 61.6]) {
      A(G.CYL, 26.45, BEACH_Y + 0.95, z, { tag: 'veslo', col: '#2b2f35', bleed: '#16181b' }, 0, 0, 0.18, [0.04, 1.9, 0.04]);
      box(0.08, 0.6, 0.22, 26.3, BEACH_Y + 0.25, z, { tag: 'veslo', col: '#e8c13a', bleed: '#b08d1a' }, 0, 0, 0.18);
    }
    for (const [z, c] of [[63.2, '#d63b2c'], [64.0, '#f2c230'], [64.8, '#2f7fc8'], [65.6, '#d63b2c']]) A(G.HEMI, 26.95, BEACH_Y + 1.6, z, { tag: 'kaciga', col: c, bleed: '#5a2a1a', hull: true }, 0, 0, 0, [0.28, 0.24, 0.32]);
    for (const [z, c] of [[66.8, '#f07b22'], [67.6, '#f2c230'], [68.4, '#f07b22']]) box(0.24, 0.8, 0.6, 26.75, BEACH_Y + 1.55, z, { tag: 'prsluk', col: c, bleed: '#a85212' });
  });
  b.object(() => {      // the pump ('pumpa') and a coil of rope ('konopac')
    A(G.CYL12, 19.4, BEACH_Y + 0.5, 64, { tag: 'pumpa', col: '#c9302c', bleed: '#8e1d1a' }, 0, 0, 0, [0.22, 1.0, 0.22]);
    box(0.7, 0.08, 0.12, 19.4, BEACH_Y + 1.04, 64, { tag: 'pumpa', col: '#2b2f35', bleed: '#16181b' });
    box(0.6, 0.06, 0.3, 19.4, BEACH_Y + 0.03, 64, { tag: 'pumpa', col: '#2b2f35', bleed: '#16181b' });
    for (let i = 0; i < 3; i++) A(new THREE.TorusGeometry(0.45 - i * 0.06, 0.06, 5, 16), 19.4, BEACH_Y + 0.07 + i * 0.1, 68, { tag: 'konopac', col: '#d8c39a', bleed: '#a8925f' }, 0, Math.PI / 2, 0);
  });
  b.object(() => {      // a kayak ('kajak')
    A(G.SPHERE, 22.5, BEACH_Y + 0.25, 74, { tag: 'kajak', col: '#f2c230', bleed: '#c49412', hull: true }, 0.08, 0, 0, [0.42, 0.25, 1.9]);
    A(G.CYL16, 22.5, BEACH_Y + 0.46, 74, { tag: 'kajak', col: '#2b2f35', bleed: '#16181b', solid: false }, 0.08, 0, 0, [0.22, 0.04, 0.4]);
  });
  people.push({ kind: 'chat', x: 24.6, y: BEACH_Y + 0.04, z: 53.4, ry: -Math.PI / 2, tag: 'skiper', top: '#f07b22' });
  // a raft going down the river with its crew
  {
    const g = new THREE.Group(); g.position.set(-3.5, 0.12, 64); scene.add(g);
    dynMesh(new THREE.TorusGeometry(1.6, 0.45, 8, 20), 'passerby', '#e0662a', '#a8441a', g, 0, 0.3, 0, [0.8, 1.45, 1], 1.1).rotation.x = Math.PI / 2;
    dynMesh(G.CYL16, 'passerby', '#4a4e55', '#2c2f33', g, 0, 0.0, 0, [1.25, 0.1, 2.2], 0);
    k.rock.push({ g, home: g.position.clone(), amp: 0.06, ph: 0.4 });
    people.push({ kind: 'visRower', x: -3.5, y: 0.2, z: 63.0, ry: 0, tag: 'passerby' });
    people.push({ kind: 'visRower', x: -3.5, y: 0.2, z: 65.2, ry: 0, tag: 'passerby' });
  }

  // ==================== THE RIVER BEACH (WEST) ====================
  b.object(() => {      // a striped towel ('peskir') on the pebbles
    box(0.9, 0.04, 1.9, -24, BEACH_Y + 0.02, 50, { tag: 'peskir', col: '#e4573a', bleed: '#f4ead6', pat: PAT.kilim, ps: 6 });
  });
  b.object(() => {      // the sunshade ('suncobran')
    A(G.CYL, -26.5, BEACH_Y + 1.2, 57, { tag: 'suncobran', col: '#e8e4da', bleed: '#bdb7aa' }, 0, 0, 0, [0.05, 2.4, 0.05]);
    A(G.CONE8, -26.5, BEACH_Y + 2.55, 57, { tag: 'suncobran', col: '#2f7fc8', bleed: '#f4f0e4', pat: PAT.kilim, ps: 4 }, 0, 0, 0, [1.5, 0.6, 1.5]);
  });
  A(G.SPHERE, -19.6, BEACH_Y + 0.26, 62, { tag: 'lopta', col: '#e9473b', bleed: '#f4f0e4', hull: true, pat: PAT.kilim, ps: 3 }, 0, 0, 0, 0.26);
  b.object(() => {      // a little tower of pebbles ('kamencic') a child has built
    for (const [y, r] of [[0.07, 0.24], [0.2, 0.2], [0.31, 0.16], [0.4, 0.12]]) A(G.SPHERE, -22.4, BEACH_Y + y, 67.4, { tag: 'kamencic', col: '#bdb5a6', bleed: '#8f887a', hull: true }, 0, 0, 0, [r, 0.07, r * 0.85]);
  });
  people.push({ kind: 'swimmer', x: -11, y: -0.08, z: 52, to: [-11, 62], speed: 0.8, trunks: true, tag: 'kupac' });
  b.object(() => {      // the ice-cream cart ('sladoled') at the top of the beach
    box(1.8, 0.9, 1.0, -35, TOWN_Y + 0.75, 48, { tag: 'props', col: '#f4f0e4', bleed: '#d0c9b8' });
    for (const s of [-1, 1]) A(G.CYL12, -35 + s * 0.7, TOWN_Y + 0.3, 48.55, { tag: 'props', col: '#2b2e32', bleed: '#16181a' }, 0, 0, Math.PI / 2, [0.3, 0.1, 0.3]);
    A(G.CYL, -35, TOWN_Y + 2.2, 48, { tag: 'props', col: '#e8e4da', bleed: '#bdb7aa' }, 0, 0, 0, [0.04, 2.0, 0.04]);
    A(G.CONE8, -35, TOWN_Y + 3.3, 48, { tag: 'props', col: '#f2a6b8', bleed: '#f4f0e4', pat: PAT.kilim, ps: 4 }, 0, 0, 0, [1.3, 0.5, 1.3]);
    for (const [ox, c] of [[-0.5, '#f4d8e0'], [0, '#7a4a2a'], [0.5, '#f2e6a0']]) {
      A(G.CONE8, -35 + ox, TOWN_Y + 1.35, 48.2, { tag: 'sladoled', col: '#d8a35a', bleed: '#a8742c' }, 0, Math.PI, 0, [0.1, 0.3, 0.1]);
      A(G.SPHERE, -35 + ox, TOWN_Y + 1.55, 48.2, { tag: 'sladoled', col: c, bleed: '#c8b4a0', hull: true }, 0, 0, 0, 0.13);
    }
  });

  // ==================== NATURE ====================
  // trout ('pastrmka') under the bridge
  for (const [hx, hz, rx, rz, sp, ph] of [[5, 14, 3, 2, 0.5, 0], [-4, 18, 2.4, 1.8, 0.65, 2], [9, 22, 2.2, 2.6, 0.45, 4]]) {
    const g = new THREE.Group(); g.position.set(hx, 0.1, hz); scene.add(g);
    dynMesh(G.SPHERE, 'pastrmka', '#8f9a7c', '#5d684c', g, 0, 0, 0, [0.16, 0.15, 0.62], 1.1);
    dynMesh(G.CONE4, 'pastrmka', '#7a8466', '#4f573e', g, 0, 0, -0.72, [0.05, 0.3, 0.22], 1.0).rotation.x = -Math.PI / 2;
    k.fish.push({ g, home: V(hx, 0.1, hz), rx, rz, speed: sp, phase: ph });
  }
  // the willow ('vrba') leaning over the water, a kingfisher ('vodomar') on its branch
  k.tree(-21, TOWN_Y, 30, 1.15, 'willow', 'vrba', '#8fb050', '#64822f');
  box(6.2, 0.3, 0.3, -17.4, TOWN_Y + 2.2, 30, { tag: 'vrba', col: WOOD_D[0], bleed: WOOD_D[1] }, 0, 0, 0.08);
  {
    const g = new THREE.Group(); g.position.set(-15.2, TOWN_Y + 2.56, 30); scene.add(g);
    dynMesh(G.SPHERE, 'vodomar', '#2f8fd0', '#1c6194', g, 0, 0.12, 0, [0.12, 0.13, 0.18], 1.0);
    dynMesh(G.SPHERE, 'vodomar', '#e8742a', '#b04e12', g, 0, 0.08, 0.06, [0.1, 0.1, 0.12], 0);
    dynMesh(G.SPHERE, 'vodomar', '#2f8fd0', '#1c6194', g, 0, 0.27, 0.06, 0.09, 1.0);
    dynMesh(G.CONE4, 'vodomar', '#2b2622', '#16130f', g, 0, 0.26, 0.2, [0.025, 0.16, 0.025], 0).rotation.x = Math.PI / 2;
    k.birds.push({ g, ry: Math.PI / 2, phase: 0.6 });
  }
  // the heron ('caplja') in the shallows by the rafters' beach
  people.push({ kind: 'heron', tag: 'caplja', x: 14.0, y: 0.06, z: 46.5, ry: -1.2 });
  // the rapid ('brzak'): rocks and white water downstream; an otter ('vidra') on the flat rock
  b.object(() => {
    for (const [rx, rz, r] of [[-9, 94, 1.4], [-4, 98, 1.1], [2, 95, 1.3], [6, 103, 1.2], [-6, 106, 1.5], [12.4, 98, 1.0], [-12.6, 101, 1.2]]) A(G.ICO0, rx, 0.1, rz, { tag: 'brzak', col: '#a9a397', bleed: '#7d776c', hull: true }, rr(0, 6), 0, 0, [r, r * 0.55, r * 0.9]);
    for (let i = 0; i < 14; i++) A(G.ICO, rr(-13, 13), 0.06, rr(92, 110), { tag: 'brzak', col: '#fbfbf6', bleed: '#d9e4e2', hatch: 0.2, solid: false, sway: 10.12 }, rr(0, 3), 0, 0, [rr(1.0, 2.2), 0.18, rr(0.7, 1.4)]);
    A(G.CYL12, 9, 0.5, 100, { tag: 'brzak', col: '#a9a397', bleed: '#7d776c', hull: true }, 0.3, 0, 0, [1.8, 1.0, 1.5]);
  });
  people.push({ kind: 'otter', tag: 'vidra', x: 9.5, y: 1.0, z: 100.2, ry: -0.8 });
  // the meadow ('livada') above the east bank, its beehives ('kosnica') and butterflies ('leptir')
  b.object(() => {
    box(46, 0.2, 30, 76, TOWN_Y + 0.1, -76, { tag: 'livada', col: '#9cbf58', bleed: '#6e9332', pat: PAT.grass });
    for (let i = 0; i < 60; i++) A(G.SPHERE, rr(54, 98), TOWN_Y + 0.28, rr(-90, -62), { tag: 'livada', col: ['#f2e04a', '#f4f0e4', '#c868c8', '#e85a4a'][i % 4], bleed: '#a8a058', solid: false, ink: false }, 0, 0, 0, [0.16, 0.08, 0.16]);
  });
  b.object(() => {
    for (const [ox, c] of [[0, '#3f88c8'], [1.4, '#f2c230'], [2.8, '#d8573a']]) {
      box(0.9, 0.8, 0.8, 56 + ox, TOWN_Y + 0.6, -65, { tag: 'kosnica', col: c, bleed: '#5a4a3a' });
      A(G.CONE4, 56 + ox, TOWN_Y + 1.15, -65, { tag: 'kosnica', col: SLAB[0], bleed: SLAB[1] }, Math.PI / 4, 0, 0, [0.72, 0.35, 0.72]);
      box(0.4, 0.08, 0.06, 56 + ox, TOWN_Y + 0.35, -64.58, { tag: 'kosnica', col: '#2b2622', solid: false });
    }
  });
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group(); scene.add(g);
    const col = ['#f2a63a', '#f4f0e4', '#6aa6e8', '#f2e04a'][i];
    dynMesh(G.SPHERE, 'leptir', '#2b2622', '#16130f', g, 0, 0, 0, [0.03, 0.03, 0.14], 0);
    const wings = [-1, 1].map((s) => { const w = new THREE.Group(); g.add(w); dynMesh(G.BOX, 'leptir', col, '#8a6a3a', w, s * 0.15, 0, 0, [0.28, 0.01, 0.24], 0); return w; });
    k.flyers.push({ g, wings, c: V(72 + i * 3, TOWN_Y + 1.6, -76 + (i % 2) * 4), rx: 2.5 + i * 0.5, rz: 2.0 + i * 0.4, ry: 0.5, speed: 0.6 + i * 0.1, phase: i * 1.6, flap: 22 });
  }

  // ==================== PRENJ ('planina', 'snijeg') AND THE BUNKER HILL ====================
  const PC = [-120, -2.5, 120];
  A(G.HEMI, ...PC, { tag: 'planina', col: '#a8a68c', bleed: '#7c7a62', pat: PAT.grass, hull: true }, 0, 0, 0, [60, 72, 50]);
  A(G.HEMI, PC[0], 50, PC[2], { tag: 'snijeg', col: '#f7f9fc', bleed: '#d6e0ec', hull: true }, 0, 0, 0, [40, 22, 34]);
  for (const [ox, oz, h] of [[-6, 4, 12], [5, -3, 9], [12, 6, 7], [-12, -6, 8]]) A(G.CONE4, PC[0] + ox, 66 + h / 2, PC[2] + oz, { tag: 'snijeg', col: '#eef2f8', bleed: '#c8d2de', solid: false }, rr(0, 3), 0, 0, [5, h, 5]);
  k.hills([[-200, 40, 60, 60, 60], [-60, 200, 70, 50, 60], [-190, -60, 60, 50, 70]], ['#a8a68c', '#7c7a62']);
  k.hills([[180, -40, 70, 40, 80], [150, 120, 70, 36, 60], [40, -200, 90, 40, 60], [190, 60, 50, 30, 60]], ['#8fa45a', '#68783a']);
  // the bunker hill, the ordinary house at its foot ('bunker'), and the concrete portal into the hill behind it
  A(G.HEMI, -60, -2.5, -100, { tag: 'hills', col: '#8fa45a', bleed: '#68783a', pat: PAT.grass, hull: true }, 0, 0, 0, [46, 26, 34]);
  house({ x: -60, y: TOWN_Y, z: -62, w: 8, d: 6, h: 3.2, tag: 'bunker', roof: 'tile', walls: ['#ece6d8', '#cbc3b1'] });
  A(portalGeo(7, 6, 3.6, 2.2, 1.6, 2.2), -60, TOWN_Y - 0.4, -68.4, { tag: 'bunker', col: '#b8b6ae', bleed: '#8e8c84', orb: 'bunker' });
  box(3.5, 3.9, 0.2, -60, TOWN_Y + 1.5, -69.3, { tag: 'bunker', col: '#5f6a63', bleed: '#3f4842' });
  box(10, 0.1, 6, -60, TOWN_Y + 0.05, -66, { tag: 'town', col: '#d6cfbf', bleed: '#aea795', pat: PAT.cobble, ps: 0.9, solid: false });

  // ==================== HOUSES, TREES, PEOPLE ====================
  for (const [x, z, w, d, h, ry, fl] of [
    [-72, -8, 7, 5.6, 3.1, Math.PI / 2, 1], [-76, 20, 7.4, 5.8, 3.0, Math.PI / 2, 2], [-60, 40, 7, 5.6, 3.1, 0, 1], [-48, 58, 6.6, 5.4, 3.0, 0.2, 1],
    [-70, 70, 7, 5.6, 3.0, -0.1, 2], [-44, -44, 7, 5.6, 3.1, 0, 1], [-82, -34, 7.2, 5.8, 3.0, 0.1, 1],
    [62, -42, 7, 5.6, 3.1, -Math.PI / 2, 2], [64, 6, 7.4, 5.8, 3.0, -Math.PI / 2, 1], [58, 28, 7, 5.6, 3.1, -Math.PI / 2, 2], [72, 54, 6.8, 5.6, 3.0, 0, 1], [54, 92, 7, 5.6, 3.0, 0, 1],
  ]) house({ x, y: TOWN_Y, z, w, d, h, ry, floors: fl, roof: 'tile' });
  // more of the town on both banks, clear of the landmarks
  {
    const keep = [[-64, -40, -48, -19], [-53, -39, 11, 24], [-62, -53, -1, 9], [-36, -28, -17, -7], [-72, -46, -100, -55], [-38, -20, 44, 52], [42, 53, -27, -9], [52, 100, -92, -60], [-32, -16, -4, 4], [-180, -60, 62, 180], [78, 230, 58, 182]];
    const placed = [[-72, -8], [-76, 20], [-60, 40], [-48, 58], [-70, 70], [-44, -44], [-82, -34], [62, -42], [64, 6], [58, 28], [72, 54], [54, 92], [-86, 4], [84, -20], [-84, 50], [90, -60]];
    const free = (x, z) => !keep.some(([x0, x1, z0, z1]) => x > x0 - 5 && x < x1 + 5 && z > z0 - 5 && z < z1 + 5) && placed.every(([px, pz]) => Math.hypot(px - x, pz - z) > 10);
    for (const [x0, x1, s] of [[-98, -64, -1], [60, 100, 1]]) for (let x = x0; x <= x1; x += 12) for (let z = -54; z <= 104; z += 11) {
      const hx = x + rr(-2, 2), hz = z + rr(-2, 2);
      if (!free(hx, hz) || R() < 0.2) continue;
      placed.push([hx, hz]);
      house({ x: hx, y: TOWN_Y, z: hz, w: rr(6.2, 7.6), d: rr(5.0, 6.0), h: rr(2.8, 3.2), ry: (s < 0 ? Math.PI / 2 : -Math.PI / 2) + rr(-0.15, 0.15), floors: R() < 0.4 ? 2 : 1, roof: 'tile' });
    }
  }
  for (const [x, z, s, kind, c1, c2] of [
    [-20, 74, 1.1, 'willow', '#8fb050', '#64822f'], [20.5, 88, 1.1, 'willow', '#8fb050', '#64822f'], [-21, -40, 1.2, 'poplar', '#7aa045', '#52702a'],
    [22, -40, 1.2, 'poplar', '#7aa045', '#52702a'], [-40, 66, 1.0, 'round', '#7aa045', '#52702a'], [44, 70, 1.1, 'round', '#86a84a', '#5c7830'],
    [-86, 4, 1.2, 'pine', '#3f6438', '#273f22'], [84, -20, 1.2, 'pine', '#3f6438', '#273f22'],
    [-36, -60, 1.0, 'round', '#7aa045', '#52702a'], [90, -60, 1.0, 'round', '#7aa045', '#52702a'], [-84, 50, 1.1, 'poplar', '#7aa045', '#52702a'],
  ]) tree(x, TOWN_Y, z, s, kind, 'riverbank', c1, c2);
  people.push({ kind: 'walk', x: -12, y: BRIDGE_Y + 0.34, z: -0.6, to: [12, -0.6], speed: 0.9, tag: 'passerby', woman: true, scarfChoice: 'no' });
  people.push({ kind: 'walk', x: 12, y: BRIDGE_Y + 0.34, z: 0.8, to: [-12, 0.8], speed: 0.8, tag: 'passerby' });
  people.push({ kind: 'chat', x: -36.4, y: TOWN_Y + 0.04, z: 16.2, ry: 1.2, tag: 'passerby' });
  people.push({ kind: 'chat', x: -35.4, y: TOWN_Y + 0.04, z: 17.2, ry: -2.2, tag: 'passerby', woman: true, scarfChoice: 'yes' });

  // ==================== THE ORBS ====================
  orb('cuprija', [0, 4, 0], 36, 'combo', BRIDGE_Y + 0.4, {
    stage: 0, at: V(-6, BRIDGE_Y + 2.4, 0), near: { p: [-6, BRIDGE_Y + 0.3, 0], r: 3.0 },
    view: { from: [-22, 9, 24], to: [22, 9, 24], look: [0, 3.5, 0] },
    wideView: { from: [-36, 18, 44], to: [36, 18, 44], look: [0, 4, 0], lookTo: [0, 4, 0] },
  });
  orb('svod', [-8.4, 3.4, 2.2], 6, 'close', 0.6, { at: V(-8.4, 2.2, 6.2), swim: { p: [-8.4, 0, 6.2], r: 2.4 }, view: { from: [-14, 2.6, 12], to: [-3, 2.6, 12], look: [-8.4, 3.4, 2] } });
  orb('stub', [5.6, 2.0, -2.6], 4, 'close', 0.6, { at: V(5.6, 2.2, -6.4), swim: { p: [5.6, 0, -6.4], r: 2.4 }, view: { from: [12, 3, -14], to: [-1, 3, -14], look: [5.6, 2.2, -2.4] } });
  orb('rijeka', [0, 0, -40], 40, 'combo', 0.5, { at: V(0, 2.4, -30), swim: { p: [0, 0, -30], r: 6 }, view: { from: [-12, 8, -10], to: [12, 8, -10], look: [0, 0, -50] }, wideView: { from: [-30, 30, 20], to: [30, 30, 20], look: [0, 0, -40], lookTo: [0, 0, -40] } });
  orb('brzak', [0, 0.3, 100], 18, 'close', 0.5, { at: V(-4, 2.4, 87), swim: { p: [-4, 0, 87], r: 3.5 }, view: { from: [-14, 7, 82], to: [10, 7, 82], look: [0, 0.4, 100] } });
  orb('pastrmka', [5, 0.1, 14], 3.5, 'close', 0.8, { at: V(5, 2.2, 18), swim: { p: [5, 0, 18], r: 3.5 } });

  orb('gumenjak', [21, BEACH_Y + 0.5, 49.5], 7, 'close', BEACH_Y + 1.6);
  orb('veslo', [26.4, BEACH_Y + 0.9, 61], 2.0, 'close', BEACH_Y + 2.6, { at: V(25.6, BEACH_Y + 2.4, 60.4), near: { p: [25.6, BEACH_Y, 60.4], r: 0.9 } });
  orb('kaciga', [26.95, BEACH_Y + 1.7, 64.4], 2.4, 'close', BEACH_Y + 2.8, { at: V(25.4, BEACH_Y + 2.6, 64.2), near: { p: [25.4, BEACH_Y, 64.2], r: 0.9 } });
  orb('prsluk', [26.75, BEACH_Y + 1.5, 67.6], 2.0, 'close', BEACH_Y + 2.6, { at: V(25.4, BEACH_Y + 2.4, 67.8), near: { p: [25.4, BEACH_Y, 67.8], r: 0.9 } });
  orb('pumpa', [19.4, BEACH_Y + 0.6, 64], 1.6, 'close', BEACH_Y + 1.6, { at: V(18.2, BEACH_Y + 1.8, 64), near: { p: [18.2, BEACH_Y, 64], r: 0.8 } });
  orb('konopac', [19.4, BEACH_Y + 0.15, 68], 1.4, 'close', BEACH_Y + 0.8, { at: V(18.2, BEACH_Y + 1.6, 68.8), near: { p: [18.2, BEACH_Y, 68.8], r: 0.8 } });
  orb('kajak', [22.5, BEACH_Y + 0.3, 74], 4, 'close', BEACH_Y + 0.8);
  orb('skiper', [24.6, BEACH_Y + 1.0, 53.4], 2.4, 'close', BEACH_Y + 2.2, { at: V(25.6, BEACH_Y + 2.2, 51.6), near: { p: [25.6, BEACH_Y, 51.6], r: 0.9 } });

  orb('radionica', [-56, TOWN_Y + 2.4, -28], 13, 'combo', TOWN_Y + 5.2, { view: { from: [-40, 7, -16], to: [-40, 7, -38], look: [-56, TOWN_Y + 2, -28] } });
  orb('rezbar', [-59.2, TOWN_Y + 1.0, -28], 2.4, 'close', TOWN_Y + 2.2, { at: V(-57.6, TOWN_Y + 2.2, -27.0), near: { p: [-57.6, TOWN_Y, -27.0], r: 0.9 }, view: { from: [-55.6, TOWN_Y + 2.0, -26.4], to: [-55.6, TOWN_Y + 2.0, -29.6], look: [-59.6, TOWN_Y + 1.1, -28] } });
  orb('dlijeto', [-60.5, TOWN_Y + 0.95, -29.2], 1.4, 'close', TOWN_Y + 1.6, { at: V(-60.5, TOWN_Y + 2.0, -29.4), near: { p: [-60.5, TOWN_Y + 0.9, -29.4], r: 0.6 }, view: { from: [-58.4, TOWN_Y + 1.8, -30.6], to: [-58.4, TOWN_Y + 1.8, -28.4], look: [-60.5, TOWN_Y + 0.95, -29.2] } });
  orb('kasika', [-60.5, TOWN_Y + 1.35, -26.6], 1.2, 'close', TOWN_Y + 1.8, { at: V(-60.5, TOWN_Y + 2.2, -27.0), near: { p: [-60.5, TOWN_Y + 0.9, -27.0], r: 0.5 }, view: { from: [-58.4, TOWN_Y + 1.8, -27.8], to: [-58.4, TOWN_Y + 1.8, -25.4], look: [-60.5, TOWN_Y + 1.3, -26.6] } });
  orb('strugotina', [-58.6, TOWN_Y + 0.1, -31.3], 1.8, 'close', TOWN_Y + 0.6, { at: V(-57.4, TOWN_Y + 1.8, -31.6), near: { p: [-57.4, TOWN_Y, -31.6], r: 0.8 }, view: { from: [-55.8, TOWN_Y + 1.6, -30.0], to: [-55.8, TOWN_Y + 1.6, -32.8], look: [-58.6, TOWN_Y + 0.1, -31.3] } });
  orb('sanduk', [-55, TOWN_Y + 0.5, -32.4], 2.2, 'close', TOWN_Y + 1.1, { view: { from: [-52.6, TOWN_Y + 1.8, -30.6], to: [-52.6, TOWN_Y + 1.8, -33.2], look: [-55, TOWN_Y + 0.5, -32.4] } });
  orb('sofra', [-53.2, TOWN_Y + 0.38, -24.6], 2.0, 'close', TOWN_Y + 0.9, { view: { from: [-51.0, TOWN_Y + 1.6, -26.2], to: [-51.0, TOWN_Y + 1.6, -23.6], look: [-53.2, TOWN_Y + 0.4, -24.6] } });
  orb('stolica', [-55.8, TOWN_Y + 0.8, -24.3], 1.8, 'close', TOWN_Y + 1.0, { view: { from: [-53.4, TOWN_Y + 1.7, -26.0], to: [-53.4, TOWN_Y + 1.7, -23.2], look: [-55.8, TOWN_Y + 0.8, -24.3] } });
  orb('sara', [-61.7, TOWN_Y + 2.6, -24.6], 1.8, 'close', TOWN_Y + 3.0, { at: V(-60.6, TOWN_Y + 1.8, -23.6), near: { p: [-60.6, TOWN_Y, -23.6], r: 0.7 }, view: { from: [-57.6, TOWN_Y + 2.4, -25.6], to: [-57.6, TOWN_Y + 2.4, -23.4], look: [-61.7, TOWN_Y + 2.6, -24.6] } });
  orb('orah', [-56, TOWN_Y + 0.6, -36.6], 3.4, 'close', TOWN_Y + 1.2);

  orb('dzamija', [-46, TOWN_Y + 4, 18], 12, 'close', TOWN_Y + 11);
  orb('munara', [-38.6, TOWN_Y + 12, 25.4], 6, 'close', TOWN_Y + 24.6, { at: V(-36.6, TOWN_Y + 16.4, 25.4), near: { p: [-37.3, TOWN_Y + 14.375, 25.4], r: 0.6 } });
  orb('cesma', [-38.2, TOWN_Y + 1.2, 11.5], 2.4, 'close', TOWN_Y + 2.6, { at: V(-36.6, TOWN_Y + 2.2, 11.5), near: { p: [-36.6, TOWN_Y, 11.5], r: 0.9 } });
  orb('lipa', [-28, TOWN_Y + 5.6, 30], 7, 'close', TOWN_Y + 8.0);
  orb('klupa', [-28, TOWN_Y + 0.6, 25.7], 2.6, 'close', TOWN_Y + 1.0);
  orb('pekara', [-58, TOWN_Y + 3, 4], 9, 'close', TOWN_Y + 7.2);
  orb('burek', [-53.4, TOWN_Y + 1.0, 4], 1.8, 'close', TOWN_Y + 1.8, { at: V(-52.2, TOWN_Y + 2.0, 4), near: { p: [-52.2, TOWN_Y, 4], r: 0.9 } });
  orb('kafana', [-32, TOWN_Y + 2.4, -12], 8, 'close', TOWN_Y + 7.0);
  orb('kahva', [-25.5, TOWN_Y + 0.95, -12], 1.4, 'close', TOWN_Y + 1.6, { at: V(-24.0, TOWN_Y + 2.0, -12), near: { p: [-24.0, TOWN_Y, -12], r: 0.9 } });

  orb('stanica', [48, TOWN_Y + 4, -18], 14, 'close', TOWN_Y + 10.4);
  orb('peron', [TX + 4.2, TOWN_Y + 0.6, -28.5], 6, 'close', TOWN_Y + 1.2, { at: V(TX + 4.6, TOWN_Y + 2.6, -29), near: { p: [TX + 4.6, TOWN_Y + 0.6, -29], r: 1.0 } });
  orb('pruga', [TX, TOWN_Y + 0.2, 30], 20, 'combo', TOWN_Y + 0.4, { at: V(TX, TOWN_Y + 2.4, 24), near: { p: [TX, TOWN_Y + 0.11, 24], r: 1.4 }, view: { from: [TX + 12, 6, 14], to: [TX + 12, 6, 34], look: [TX, TOWN_Y, 30] } });
  orb('lokomotiva', [TX, TOWN_Y + 2, -30], 9, 'close', TOWN_Y + 4.4);
  orb('vagon', [TX, TOWN_Y + 2, -18.6], 14, 'close', TOWN_Y + 3.6);
  orb('otpravnik', [TX + 3.6, TOWN_Y + 1.6, -6.2], 2.4, 'close', TOWN_Y + 2.8, { at: V(TX + 5.2, TOWN_Y + 2.6, -7.4), near: { p: [TX + 5.2, TOWN_Y + 0.6, -7.4], r: 0.9 } });
  orb('semafor', [TX + 2.8, TOWN_Y + 4.0, -46], 3, 'close', TOWN_Y + 5.6, { at: V(TX + 4.2, TOWN_Y + 2.2, -46), near: { p: [TX + 4.2, TOWN_Y, -46], r: 1.0 } });
  orb('kofer', [TX + 4.6, TOWN_Y + 1.1, -14], 1.8, 'close', TOWN_Y + 2.2, { at: V(TX + 5.4, TOWN_Y + 2.6, -16.2), near: { p: [TX + 5.4, TOWN_Y + 0.6, -16.2], r: 0.9 } });
  orb('sat', [44.3, TOWN_Y + 6.2, -18], 1.6, 'close', TOWN_Y + 7.0, { at: V(TX + 5.4, TOWN_Y + 2.6, -20.6), near: { p: [TX + 5.4, TOWN_Y + 0.6, -20.6], r: 0.9 }, view: { from: [39.4, TOWN_Y + 5.0, -21.4], to: [39.4, TOWN_Y + 5.0, -14.6], look: [44.3, TOWN_Y + 6.2, -18] } });

  orb('plaza', [-23, BEACH_Y, 60], 18, 'combo', BEACH_Y + 0.6, { at: V(-28, BEACH_Y + 2.2, 44), near: { p: [-28, BEACH_Y, 44], r: 1.4 }, view: { from: [-6, 7, 40], to: [-6, 7, 78], look: [-23, BEACH_Y, 60] } });
  orb('kupac', [-11, 0.2, 57], 3.0, 'close', 0.8, { at: V(-17.4, BEACH_Y + 2.0, 57), near: { p: [-17.4, BEACH_Y, 57], r: 0.9 } });
  orb('peskir', [-24, BEACH_Y + 0.05, 50], 2.0, 'close', BEACH_Y + 0.6, { at: V(-24, BEACH_Y + 1.8, 52.2), near: { p: [-24, BEACH_Y, 52.2], r: 0.9 } });
  orb('suncobran', [-26.5, BEACH_Y + 2.4, 57], 3.2, 'close', BEACH_Y + 3.0);
  orb('lopta', [-19.6, BEACH_Y + 0.26, 62], 1.2, 'close', BEACH_Y + 0.8, { at: V(-20.8, BEACH_Y + 1.6, 62), near: { p: [-20.8, BEACH_Y, 62], r: 0.8 } });
  orb('kamencic', [-22.4, BEACH_Y + 0.25, 67.4], 1.2, 'close', BEACH_Y + 0.8, { at: V(-22.4, BEACH_Y + 1.6, 69.2), near: { p: [-22.4, BEACH_Y, 69.2], r: 0.8 } });
  orb('sladoled', [-35, TOWN_Y + 1.5, 48.2], 1.8, 'close', TOWN_Y + 2.4, { at: V(-35, TOWN_Y + 2.4, 50.4), near: { p: [-35, TOWN_Y, 50.4], r: 0.9 } });

  orb('caplja', [14.0, 0.9, 46.5], 2.4, 'close', 1.8, { at: V(17.0, BEACH_Y + 2.0, 46.4), near: { p: [17.0, BEACH_Y, 46.4], r: 0.9 } });
  orb('vodomar', [-15.2, TOWN_Y + 2.7, 30], 1.2, 'close', TOWN_Y + 3.0, { at: V(-16.4, TOWN_Y + 3.6, 30), near: { p: [-16.4, TOWN_Y + 2.35, 30], r: 0.6 }, view: { from: [-12.2, TOWN_Y + 3.0, 33], to: [-12.2, TOWN_Y + 3.0, 27], look: [-15.2, TOWN_Y + 2.7, 30] } });
  orb('vrba', [-21, TOWN_Y + 4, 30], 7, 'close', TOWN_Y + 7.6);
  orb('vidra', [9.5, 1.3, 100.2], 1.8, 'close', 2.0, { at: V(8.0, 2.6, 99.6), near: { p: [8.0, 1.0, 99.6], r: 0.7 } });
  orb('livada', [76, TOWN_Y + 0.2, -80], 24, 'combo', TOWN_Y + 0.6, { at: V(64, TOWN_Y + 2.4, -86), near: { p: [64, TOWN_Y + 0.2, -86], r: 1.6 }, view: { from: [60, 9, -50], to: [92, 9, -50], look: [76, TOWN_Y, -78] } });
  orb('kosnica', [57.4, TOWN_Y + 0.8, -65], 3, 'close', TOWN_Y + 1.6, { at: V(57.4, TOWN_Y + 2.2, -62.8), near: { p: [57.4, TOWN_Y + 0.2, -62.8], r: 0.9 } });
  orb('leptir', [74, TOWN_Y + 1.8, -74], 5, 'close', TOWN_Y + 2.6, { at: V(74, TOWN_Y + 2.2, -70), near: { p: [74, TOWN_Y + 0.2, -70], r: 1.2 } });
  orb('planina', [-120, 40, 120], 60, 'combo', 52, { at: V(-72, TOWN_Y + 2.4, 84), near: { p: [-72, TOWN_Y, 84], r: 2.0 }, view: { from: [-40, 40, 40], to: [-30, 46, 60], look: [-120, 40, 120] }, wideView: { from: [-30, 60, 20], to: [-50, 70, 30], look: [-120, 40, 120], lookTo: [-120, 40, 120] } });
  orb('snijeg', [-120, 64, 120], 26, 'close', 72, { at: V(-118, 74.5, 118) });
  // the last: the bunker behind the ordinary house
  orb('bunker', [-60, TOWN_Y + 3, -64], 12, 'combo', TOWN_Y + 7.4, {
    stage: 2, view: { from: [-40, 12, -40], to: [-48, 12, -36], look: [-60, TOWN_Y + 3, -66] },
    wideView: { from: [-20, 26, -30], to: [-50, 30, -24], look: [-60, 10, -84], lookTo: [-60, 10, -84] },
  });

  return k.finish({
    start: V(-18, TOWN_Y + 0.02, 12),
    fleur: V(-60, 46, -90),
    BEACH_Y,
  });
}
