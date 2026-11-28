// The people of Mostar, the cat, the dog. All of them stand frozen in the sketch until the
// finale brings the town to life; then they walk, talk, sell, play, ride, paddle, applaud and wave.
import * as THREE from 'three';
import { paintGeo, washMat, addHull, tag, inkMaterial } from './paper.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';

const TOPS = ['#b8452c', '#3f6f9a', '#4f8068', '#c69a3a', '#8a5a8a', '#e6dccb', '#5d7b8a', '#c9744a'];
const BOTTOMS = ['#4a4a52', '#6a5a44', '#3d5066', '#7a6a58', '#5a4a40'];
const SKINS = ['#e0a37a', '#d99a72', '#e8b48c'], HAIRS = ['#3a2a20', '#5a3a22', '#2a2420', '#8a6a3a'];
// A run cycle in key poses, one leg, u = 0..1 (the other leg is half a cycle behind). Hip: negative swings the
// leg forward; knee: positive folds the heel up. Contact (foot out in front) → down (knee gives) → push-off
// (leg behind) → toe-off, heel kicks up → passing (foot tucked high under) → knee drive → reach for the ground.
// While the foot is on the ground (u 0..STANCE) the leg is solved so the foot stays pinned where it landed;
// in the air it follows the key poses, which start and end exactly on the solved poses.
const STANCE = 0.35, ANKLE = 0.05, Z_LAND = 0.3, Z_OFF = -0.37;
function legIK(z, d) {        // foot z ahead of the hip and d below it → [hip, knee] (thigh and shin 0.42 each)
  const D = Math.min(0.839, Math.hypot(z, d)), A = 0.42;
  return [-(Math.atan2(z, d) + Math.acos(D / (2 * A))), Math.PI - Math.acos(1 - (D * D) / (2 * A * A))];
}
const runHipY = (w) => w < 0.7 ? 0.84 - 0.05 * Math.sin(Math.PI * w / 0.7) : 0.84 + 0.05 * Math.sin(Math.PI * (w - 0.7) / 0.3);      // w: half-cycle; dips as the knee gives, lifts in the air
function plant(z, hipY) {      // the foot hangs 0.06 ahead of the ankle along the shin, so solve again with that offset where the shin ended up
  const d = hipY - ANKLE; let r = legIK(z, d);
  for (let n = 0; n < 2; n++) { const th = r[0] + r[1]; r = legIK(z - 0.06 * Math.cos(th), d - 0.06 * Math.sin(th)); }
  return r;
}
const OFF = plant(Z_OFF, runHipY(0.7)), LAND = plant(Z_LAND, runHipY(0));
// toe-off → heel kicks up → passing (foot tucked high under) → knee drive → reach → land
const SWING = [[STANCE, ...OFF], [0.43, 0.42, 0.5], [0.52, 0.22, 1.15], [0.63, -0.2, 1.6], [0.76, -0.7, 1.4], [0.89, -0.82, 0.75], [1, ...LAND]];      // (the foot lifts and comes through in one arc, with no flick back after toe-off)
function runLeg(u, hipY) {
  if (u < STANCE) return plant(Z_LAND + (Z_OFF - Z_LAND) * (u / STANCE), hipY);
  let i = 0; while (SWING[i + 1][0] < u) i++;
  const s = (u - SWING[i][0]) / (SWING[i + 1][0] - SWING[i][0]), K = (j) => SWING[Math.max(0, Math.min(SWING.length - 1, j))];
  return [1, 2].map((c) => { const p0 = K(i - 1)[c], p1 = K(i)[c], p2 = K(i + 1)[c], p3 = K(i + 2)[c];       // Catmull-Rom: smooth through the keys
    return 0.5 * (2 * p1 + (p2 - p0) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s * s + (3 * p1 - p0 - 3 * p2 + p3) * s * s * s); });
}
// A walker with a dog goes round a long loop: out along his line, a half circle (radius TURN_R) round the
// far end, back along the other side, a half circle round the near end. The dog walks on his left, so he turns right.
const TURN_R = 0.6;
const loopLen = (p) => 2 * p.from.distanceTo(p.to) + 2 * Math.PI * TURN_R;
function loopAt(p, d) {
  const len = p.from.distanceTo(p.to), ux = (p.to.x - p.from.x) / len, uz = (p.to.z - p.from.z) / len, lx = uz, lz = -ux;      // u: along the line; l: his left going out
  // (the loop is shifted to his right, so he goes out along his own line, from where he stands in the sketch, and comes back beside it)
  const A = { x: p.from.x - lx * TURN_R, z: p.from.z - lz * TURN_R }, B = { x: p.to.x - lx * TURN_R, z: p.to.z - lz * TURN_R };
  let x, z, hx, hz;
  if (d < len) { x = A.x + ux * d + lx * TURN_R; z = A.z + uz * d + lz * TURN_R; hx = ux; hz = uz; }
  else if (d < len + Math.PI * TURN_R) { const a = (d - len) / TURN_R; x = B.x + (lx * Math.cos(a) + ux * Math.sin(a)) * TURN_R; z = B.z + (lz * Math.cos(a) + uz * Math.sin(a)) * TURN_R; hx = ux * Math.cos(a) - lx * Math.sin(a); hz = uz * Math.cos(a) - lz * Math.sin(a); }
  else if (d < 2 * len + Math.PI * TURN_R) { const e = d - len - Math.PI * TURN_R; x = B.x - ux * e - lx * TURN_R; z = B.z - uz * e - lz * TURN_R; hx = -ux; hz = -uz; }
  else { const a = (d - 2 * len - Math.PI * TURN_R) / TURN_R; x = A.x + (-lx * Math.cos(a) - ux * Math.sin(a)) * TURN_R; z = A.z + (-lz * Math.cos(a) - uz * Math.sin(a)) * TURN_R; hx = -ux * Math.cos(a) + lx * Math.sin(a); hz = -uz * Math.cos(a) + lz * Math.sin(a); }
  p.root.position.set(x, p.root.position.y, z); p.root.rotation.y = Math.atan2(hx, hz);
}
// The goalkeeper's side-shuffle, in his own frame (x: to his side). Over one step cycle (STEP of travel) the leading foot
// steps out while the other stays planted, then the trailing foot closes in while the leading one stays planted; so a
// planted foot never slides. The cycle runs on the distance travelled, so he steps quicker when he moves quicker and
// stops stepping at each turn; a change of direction blends to the mirrored stance. Leg: 0.77 from hip to ankle (crouched).
const K_STEP = 0.45, K_NARROW = 0.14, K_LEG = 0.772, K_HIP = 0.09;
function keeperShuffle(p, dt) {
  const z = p.root.position.z, dz = z - (p.kPrev ?? z); p.kPrev = z;
  const ry = p.root.rotation.y, dl = (-dz * Math.sin(ry)) / p.root.scale.x;      // the move along his own x (sideways), in his own size
  p.kD = (p.kD || 0) + Math.abs(dl);
  const dir = dl > 1e-5 ? 1 : dl < -1e-5 ? -1 : (p.kDir || 1);
  const e = (x) => x * x * (3 - 2 * x), u = (p.kD / K_STEP) % 1, S = K_STEP, n = K_NARROW;
  let lead, trail, liftL = 0, liftT = 0;
  if (u < 0.5) { trail = n + u * S; lead = n + (S / 2) * e(u / 0.5); liftL = Math.sin(Math.PI * u / 0.5); }
  else { lead = n + S / 2 - (u - 0.5) * S; trail = n + S / 2 - (S / 2) * e((u - 0.5) / 0.5); liftT = Math.sin(Math.PI * (u - 0.5) / 0.5); }
  let feet = [-1, 1].map((sd) => sd === dir ? [sd * lead, liftL] : [sd * trail, liftT]);
  if (dir !== p.kDir) { p.kFrom = p.kFeet; p.kBlend = 0; p.kDir = dir; }
  if (p.kFrom && p.kBlend < 1) { p.kBlend = Math.min(1, p.kBlend + dt / 0.3); const w = e(p.kBlend); feet = feet.map(([x, l], i) => [p.kFrom[i][0] + (x - p.kFrom[i][0]) * w, p.kFrom[i][1] * (1 - w) + l * w]); }
  p.kFeet = feet;
  let planted = 1, low = 9;
  p.legs.forEach((l, i) => {
    const sd = i ? 1 : -1, [fx, lift] = feet[i], th = Math.asin(Math.max(-0.9, Math.min(0.9, (fx - sd * K_HIP) / K_LEG)));
    l.hip.rotation.set(-0.45 - 0.3 * lift, 0, th); l.knee.rotation.x = 0.8 + 0.6 * lift;      // a lifted foot: the knee bends a little more
    if (lift < low) { low = lift; planted = Math.cos(th); }      // (the foot on the ground: the one lifted least)
  });
  p.hips.position.y = 0.068 + K_LEG * planted;      // the hips sit as high as the planted leg reaches
}
const cap = (r, l) =>new THREE.CapsuleGeometry(r, l, 4, 8);
const lathe = (pts) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 12);
// a hijab: close round the head, with a round opening for the whole face (the face points along +z), then falling
// from under the chin onto the top's high collar. Built row by row from the crown down; on the rows that cross the face
// each row stops at the edge of the opening, so the opening is a smooth oval
function hijab() {
  const R = 0.137, M = 56, N = 30, t1 = 2.1, r1 = R * Math.sin(t1), y1 = R * Math.cos(t1);
  const tc = 1.56, tb = 0.7, half = 0.86;      // the opening: centre and half height (angles from the crown), half width
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= M; i++) {
    const t = (i / M) * Math.PI, u = Math.max(0, (t - t1) / (Math.PI - t1)), v = 1 - u;
    // below the head: a soft curve from the sphere in under the jaw (0.09) and out onto the collar (0.11)
    const r = t <= t1 ? R * Math.sin(t) : v * v * r1 + 2 * u * v * 0.09 + u * u * 0.11, y = t <= t1 ? R * Math.cos(t) : v * v * y1 + 2 * u * v * -0.13 + u * u * -0.195;
    // the opening: round over the brow, then open all the way down the front (the chin and the throat stay bare; the turtleneck covers the neck),
    // narrowing a little from the cheeks to the jaw so the sides and back come down to the collar
    const k = (t - tc) / tb, wide = half * R;
    const lw = t < tc ? (k > -1 ? wide * Math.sqrt(1 - k * k) : 0) : wide - (wide - 0.1) * Math.min(1, (t - tc) / (Math.PI - tc)) ** 1.5;
    const w = lw > 0 ? Math.min(Math.PI - 0.05, lw / Math.max(0.05, r)) : 0;
    for (let j = 0; j <= N; j++) {
      const ph = Math.PI / 2 + w + (j / N) * (Math.PI * 2 - 2 * w);
      pos.push(-Math.cos(ph) * r, y, Math.sin(ph) * r); uv.push(j / N, 1 - i / M);
    }
  }
  for (let i = 0; i < M; i++) for (let j = 0; j < N; j++) { const a = i * (N + 1) + j, b = a + N + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
const G = {
  thigh: cap(0.085, 0.26), calf: cap(0.068, 0.26), foot: cap(0.05, 0.12), arm: cap(0.052, 0.5), hand: new THREE.SphereGeometry(0.058, 8, 6),
  head: new THREE.SphereGeometry(0.13, 12, 10), hair: new THREE.SphereGeometry(0.139, 12, 7, 0, Math.PI * 2, 0, 1.75), scarf: hijab(),
  torso: lathe([[0.001, 0], [0.15, 0], [0.155, 0.14], [0.145, 0.28], [0.19, 0.5], [0.2, 0.57], [0.15, 0.64], [0.07, 0.68], [0.06, 0.74], [0.001, 0.74]]),
  skirt: lathe([[0.001, -0.89], [0.31, -0.89], [0.17, 0.02], [0.001, 0.02]]), robe: lathe([[0.001, -0.88], [0.27, -0.88], [0.18, 0.02], [0.001, 0.02]]),   // listed bottom to top, so the surface faces outwards
  coat: lathe([[0.001, -0.68], [0.27, -0.68], [0.22, -0.2], [0.17, 0.04], [0.175, 0.28], [0.215, 0.52], [0.22, 0.59], [0.16, 0.66], [0.08, 0.72], [0.001, 0.72]]),
  neckScarf: new THREE.TorusGeometry(0.115, 0.042, 7, 14).rotateX(Math.PI / 2),
  uarm: cap(0.052, 0.2), farm: cap(0.048, 0.2),
  fes: new THREE.CylinderGeometry(0.085, 0.1, 0.13, 10), cap: new THREE.SphereGeometry(0.137, 10, 5, 0, Math.PI * 2, 0, 1.1), bloom: new THREE.IcosahedronGeometry(0.07, 0),
  catBody: new THREE.SphereGeometry(1, 12, 10), catLeg: new THREE.CylinderGeometry(0.04, 0.035, 0.26, 6).translate(0, -0.13, 0), catTail: new THREE.CylinderGeometry(0.035, 0.05, 0.6, 6).translate(0, 0.3, 0), ear: new THREE.ConeGeometry(0.07, 0.14, 4),
  box: new THREE.BoxGeometry(1, 1, 1), disc: new THREE.CylinderGeometry(1, 1, 1, 14).rotateX(Math.PI / 2), rod: new THREE.CylinderGeometry(1, 1, 1, 6), ball: new THREE.IcosahedronGeometry(1, 1),
  wheel: new THREE.TorusGeometry(0.34, 0.03, 6, 20).rotateY(Math.PI / 2), cone: new THREE.ConeGeometry(0.05, 0.17, 8), tube: cap(0.2, 2.5).rotateX(Math.PI / 2), tubeX: cap(0.2, 0.8).rotateZ(Math.PI / 2),
};
const BLOCK = new THREE.MeshBasicMaterial();
const UPY = new THREE.Vector3(0, 1, 0);
const k = (rate, dt) => 1 - Math.exp(-rate * dt);
const sm = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };

export function createPeople(scene, world, R) {
  const pick = (a) => a[Math.floor(R() * a.length)], list = [], mats = {};
  const matOf = (t) => mats[t] ||= washMat(t);
  const timing = (tagName, pos, first, paintAt) => {      // first: coloured at once with the ones at the orb, wherever it is; paintAt: at that moment
    const src = tag(tagName).source, d = first ? 0 : src ? pos.distanceTo(src) : 0;
    tag(tagName).subs.push({ box: new THREE.Box3().setFromCenterAndSize(pos.clone().setY(pos.y + 1), new THREE.Vector3(1, 2, 1)), ranges: [], hranges: [] });
    const tm = paintAt !== undefined ? { delay: paintAt, dur: 2.2 } : d < 5 ? { delay: 0, dur: 3.2 } : { delay: 2.6 + Math.min(d, 150) / 150 * 2.5, dur: 2.2 };
    const T = tag(tagName); T.end = Math.max(T.end || 0, tm.delay + tm.dur); if (!tm.delay) T.nearEnd = Math.max(T.nearEnd || 0, tm.dur); return tm;
  };
  const block = (x, y, z, w, h, d, data) => {
    const c = new THREE.Mesh(G.box, BLOCK); c.matrixAutoUpdate = false; c.matrix.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d));
    c.matrixWorld.copy(c.matrix); c.userData = data; world.colliders.push(c); return c;
  };
  // a painter for one figure: every part shares the figure's place and moment in the colouring wave
  const painter = (tagName, pos, radius = 2.6, first, paintAt) => {
    const tm = timing(tagName, pos, first, paintAt), seed = [pos.x, pos.y + 1.2, pos.z];
    return (geo, col, parent, x, y, z, bleed, otherTag) => {
      const m = new THREE.Mesh(paintGeo(geo, { col, bleed: bleed ?? col, seed, radius, delay: tm.delay, dur: tm.dur, hatch: 0.5 }), matOf(otherTag || tagName));
      m.position.set(x, y, z); addHull(m, 1.3); parent.add(m); return m;
    };
  };
  const grp = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  // a thin rod between two points
  const rod = (P, parent, a, b, r, col) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), m = P(G.rod, col, parent, (A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
    m.scale.set(r, d.length(), r); m.quaternion.setFromUnitVectors(UPY, d.normalize()); return m;
  };

  function person(o) {
    const pos = new THREE.Vector3(o.x, o.y, o.z), sc = o.sc || 1, P = painter(o.tag, pos, undefined, o.first, o.paintAt);
    const root = new THREE.Group(); root.position.copy(pos); root.rotation.y = o.ry || 0; root.scale.setScalar(1.05 * sc); scene.add(root);
    const skin = pick(SKINS), top0 = o.robe ? '#e9e2d0' : pick(TOPS), top = o.trunks ? skin : o.top || (o.kind === 'girl' ? '#e0567f' : top0), bottom0 = pick(BOTTOMS), bottom = o.trunks ? skin : (o.bottom || bottom0), gown = (o.robe || o.woman) && !o.sport;      // sport: dressed to run and kick (no skirt)
    const hips = grp(root, 0, 0.92, 0), legs = [];
    if (o.robe) P(G.robe, '#6a5a4a', hips, 0, 0, 0, '#4f4236');
    const seated = ['sit', 'swing', 'drink', 'argue', 'read', 'sled', 'sarHammer', 'sarTalk', 'sarDriver', 'sarReadBench', 'sarRimSit', 'jahSledRide', 'jajFish', 'jajGuitar', 'jajSing', 'jajWarmSit', 'trvTailor', 'trvWriter', 'neuRead', 'neuLifeguard', 'neuSailor', 'neuDine', 'blDrum', 'blListen', 'blDraw', 'bihPotter', 'bihAccordion'].includes(o.kind), winterTrousers = o.kind?.startsWith('jah') || o.kind?.startsWith('neu') || o.kind?.startsWith('bl'), skirtC = o.woman && !o.robe && !o.sport && !winterTrousers && o.kind !== 'girl' && !o.coatTag && !o.topTag ? pick(TOPS) : null;
    if (skirtC && !seated) { const sk = P(G.skirt, skirtC, hips, 0, 0, 0); if (sc < 1) sk.scale.y = 0.45; }       // a child's skirt is short, so her legs show
    const legC = skirtC && seated ? skirtC : bottom;                                                                  // a seated woman's skirt lies over her legs
    if ((!gown || seated || winterTrousers || (skirtC && sc < 1) || o.coatTag || o.topTag) && o.kind !== 'girl' && o.kind !== 'raft' && o.kind !== 'sarNana') for (const s of [-1, 1]) {
      const hip = grp(hips, s * 0.09, 0, 0); P(G.thigh, legC, hip, 0, -0.2, 0);
      const knee = grp(hip, 0, -0.42, 0); P(G.calf, (skirtC && seated) || o.sport ? skin : bottom, knee, 0, -0.2, 0);      // (shorts: bare calves)
      const f = P(G.foot, o.trunks ? skin : '#3a322c', knee, 0, -0.42, 0.06); f.rotation.x = Math.PI / 2;
      legs.push({ hip, knee, foot: f });
    }
    const torso = grp(hips, 0, 0, 0);
    const coatP = o.coatTag ? painter(o.coatTag, pos, undefined, o.coatFirst, o.coatAt) : null;
    const topP = o.topTag ? painter(o.topTag, pos, undefined, o.topFirst, o.topAt) : null;
    if (coatP) { const ct = coatP(G.coat, o.coatCol || '#7a3c34', torso, 0, 0, 0, o.coatBleed || '#592922'); ct.scale.z = 0.78; }
    else if (topP) { const body = topP(G.torso, o.topCol || top, torso, 0, 0, 0, o.topBleed || o.topCol || top); body.scale.set(o.padded ? 1.14 : 1.04, 1, o.padded ? 0.92 : 0.76); }
    else { const body = P(G.torso, top, torso, 0, 0, 0); body.scale.z = 0.72; }
    if (o.neckScarfTag) {
      const SP = painter(o.neckScarfTag, pos, undefined, o.neckScarfFirst, o.neckScarfAt);
      const scC = o.neckScarfCol || '#b8452c', scB = o.neckScarfBleed || '#8a3020';
      SP(G.neckScarf, scC, torso, 0, 0.69, 0.01, scB);
      const tail = SP(G.box, scC, torso, 0.05, 0.48, 0.145, scB); tail.scale.set(0.09, 0.34, 0.035); tail.rotation.z = -0.08;
    }
    if (o.trunks) { const tr = P(G.catBody, '#c0392b', hips, 0, -0.06, 0, '#8f2a20'); tr.scale.set(0.19, 0.17, 0.15); }      // swimming trunks
    const head = grp(torso, 0, 0.85, 0.01); P(G.head, skin, head, 0, 0, 0);
    if (sc < 1) head.scale.setScalar(1.25);                       // children: a bigger head
    const useScarf = o.scarfChoice !== undefined ? o.scarfChoice === 'yes' : (o.woman && (o.scarf || R() < 0.5) && o.kind !== 'girl' && sc >= 1);
    if (o.fes) painter('fes', pos, undefined, false, o.fesAt)(G.fes, '#b3312c', head, 0, 0.15, 0, '#8f2420'); else if (o.robe) P(G.cap, '#f3efe6', head, 0, 0.02, 0);
    else if (o.helmetTag) {
      const HP = painter(o.helmetTag, pos, undefined, false, o.helmetAt);
      const hm = HP(G.cap, o.helmetCol || '#2b5ea8', head, 0, 0.025, -0.005, o.helmetBleed || '#1d4078'); hm.scale.set(1.16, 1.15, 1.16);
    } else if (o.hatTag || o.beanie) {
      const BP = o.hatTag ? painter(o.hatTag, pos, undefined, false, o.hatAt) : P;
      const hc = o.hatCol || '#b84434', hb = o.hatBleed || '#8c2e22';
      const bn = BP(G.cap, hc, head, 0, 0.04, 0, hb); bn.scale.set(1.08, 1.25, 1.08);
      BP(G.ball, '#f3efe6', head, 0, 0.18, 0, '#d8d2c4').scale.setScalar(0.05);
    } else if (o.sunHatTag || o.sunHat) {
      const SHP = o.sunHatTag ? painter(o.sunHatTag, pos, undefined, false, o.sunHatAt) : P;
      const brim = SHP(G.disc, o.sunHatCol || '#e4c788', head, 0, 0.09, 0, '#c2a264'); brim.scale.set(0.32, 0.32, 0.025); brim.rotation.x = Math.PI / 2;
      const crown = SHP(G.fes, o.sunHatCol || '#e4c788', head, 0, 0.16, 0, '#c2a264'); crown.scale.set(1.25, 0.72, 1.25);
      const band = SHP(G.disc, '#c84238', head, 0, 0.115, 0, '#962c24'); band.scale.set(0.165, 0.165, 0.032); band.rotation.x = Math.PI / 2;
    } else if (o.capCap) {
      const CP = painter(o.capTag || o.tag, pos);
      const topC = CP(G.disc, '#f8f6f0', head, 0, 0.14, 0.01, '#d8d2c6'); topC.scale.set(0.17, 0.17, 0.055); topC.rotation.x = Math.PI / 2;
      CP(G.cap, '#1e3554', head, 0, 0.04, 0, '#13243b').scale.set(1.04, 0.85, 1.04);
      const vis = CP(G.box, '#162436', head, 0, 0.06, 0.14); vis.scale.set(0.22, 0.024, 0.12);
      const badge = CP(G.ball, '#e0b83a', head, 0, 0.10, 0.13); badge.scale.setScalar(0.028);
    } else if (o.kind === 'post') { P(G.cap, '#23405e', head, 0, 0.03, 0, '#1a2f45'); const v = P(G.box, '#1a2f45', head, 0, 0.05, 0.13); v.scale.set(0.2, 0.025, 0.11); }
    else if (useScarf) P(G.scarf, o.scarfCol || pick(TOPS), head, 0, 0, 0);
    else {      // (a girl who drew a hijab gets hair instead. One draw either way, so nobody else changes)
      const hc = o.hairCol || pick(HAIRS), h = P(G.hair, hc, head, 0, 0.012, -0.012); h.rotation.x = -0.3;
      if (o.woman) { const long = P(G.head, hc, head, 0, -0.13, -0.075); long.scale.set(1.02, 1.75, 0.62); }      // long hair down the back
      if (o.kind === 'girl') { const fl = P(G.bloom, '#f2c230', head, 0.1, 0.09, 0.06); fl.scale.setScalar(0.7); }
    }
    if (o.gogglesTag) {
      const GP = painter(o.gogglesTag, pos, undefined, false, o.gogglesAt);
      const gg = GP(G.box, o.gogglesCol || '#e07a24', head, 0, 0.03, 0.125, '#a85214'); gg.scale.set(0.18, 0.075, 0.045);
      const st = GP(G.box, '#262a30', head, 0, 0.03, 0.0, '#181a1f'); st.scale.set(0.27, 0.04, 0.25);
    }
    const sleeveP = coatP || topP || P, sleeveC = coatP ? (o.coatCol || '#7a3c34') : topP ? (o.topCol || top) : top;
    const mitP = o.mittensTag ? painter(o.mittensTag, pos, undefined, false, o.mittensAt) : null;
    const arms = [-1, 1].map((s) => { const sh = grp(torso, s * 0.2, 0.56, 0); sleeveP(G.uarm, sleeveC, sh, 0, -0.135, 0); const el = grp(sh, 0, -0.27, 0); sleeveP(G.farm, sleeveC, el, 0, -0.14, 0); const hand = (mitP || P)(G.hand, mitP ? (o.mittensCol || '#c24834') : skin, el, 0, -0.3, 0); if (mitP) hand.scale.setScalar(1.35); return { sh, el, hand, s }; });
    const p = { o, root, hips, torso, head, legs, arms, phase: R() * 6, clap: 0, s: 0, dir: 1, P, sc, y0: o.y };
    const moving = o.kind === 'walk' || o.kind === 'bike' || o.kind === 'keeper' || o.kind === 'swimmer' || o.kind === 'skate' || o.kind === 'sarCarry';
    if (o.kind === 'swimmer') p.block = block(o.x, 0.3, o.z, 1.0, 1.1, 2.3, { wall: true, person: true });
    else if (o.kind !== 'girl' && o.kind !== 'swing' && o.kind !== 'sarNana' && o.kind !== 'sarDriver') p.block = block(o.x, o.y + sc, o.z, 0.8 * sc + (o.kind === 'bike' ? 0.5 : 0), 2 * sc, 0.8 * sc + (o.kind === 'bike' ? 0.5 : 0), { wall: true, person: true });
    if (moving && o.to) { p.from = pos.clone(); p.to = new THREE.Vector3(o.to[0], o.y, o.to[1]); root.rotation.y = Math.atan2(p.to.x - p.from.x, p.to.z - p.from.z); }
    if (moving && o.to && o.dog) { p.loopS = 0; loopAt(p, 0); }
    if (seated || o.kind === 'raft') { hips.position.y = 0.5; for (const l of legs) { l.hip.rotation.x = -1.5; l.knee.rotation.x = o.kind === 'raft' ? 0.55 : 1.45; } }
    if (o.kind === 'girl') torso.rotation.x = 0.5;
    if (o.kind === 'boy' && !o.kite) for (const [dx, dy, c] of [[0, 0.1, '#e0453a'], [0.07, 0.03, '#f2c230'], [-0.07, 0.04, '#f08fb0'], [0, -0.02, '#5a9148']]) P(G.bloom, c, arms[1].el, dx, -0.41 - dy, 0.02);

    if (o.dog) {       // the dog trots beside him on a leash
      const d = p.dog = grp(root, 0.55, 0, 0.75), C = '#b9834a', C2 = '#8f5f30', P = painter('dog', pos);
      const b = P(G.catBody, C, d, 0, 0.42, 0, C2); b.scale.set(0.17, 0.17, 0.36);
      const hd = p.dogHead = grp(d, 0, 0.58, 0.36); const hm = P(G.catBody, C, hd, 0, 0, 0, C2); hm.scale.set(0.13, 0.13, 0.15);
      const sn = P(G.catBody, '#f3e6cf', hd, 0, -0.03, 0.15); sn.scale.set(0.07, 0.06, 0.09);
      p.dogJaw = grp(hd, 0, -0.07, 0.08); const jw = P(G.catBody, '#e8d3b4', p.dogJaw, 0, -0.008, 0.08, '#c9a882'); jw.scale.set(0.05, 0.022, 0.08);      // the lower jaw: it opens to bark
      p.barkT = 9;
      for (const s of [-1, 1]) { const e = P(G.catBody, C2, hd, s * 0.11, 0.03, -0.02); e.scale.set(0.035, 0.09, 0.06); }
      p.dogLegs = [[0.09, 0.22], [-0.09, 0.22], [0.09, -0.22], [-0.09, -0.22]].map(([x, z]) => { const g = grp(d, x, 0.3, z); const m = P(G.catLeg, C, g, 0, 0, 0, C2); m.scale.y = 1.15; return g; });
      p.dogTail = grp(d, 0, 0.5, -0.33); const tl = P(G.catTail, C, p.dogTail, 0, 0, 0, C2); tl.scale.set(0.8, 0.55, 0.8); p.dogTail.rotation.x = -0.9;
      rod(P, torso, [0.2, 0.08, 0.27], [0.55, -0.34, 1.0], 0.012, '#5a3a22');
      arms[1].sh.rotation.x = -0.5;
    }
    if (o.kind === 'eat') {       // an ice cream cone held up to the mouth
      const P = painter('icecream', pos), e = arms[1].el;
      const w = grp(e, 0, -0.3, 0); w.rotation.set(-1.2, 0, 0.6);      // her wrist, keeping the cone nearly upright, tipped a little towards her mouth
      P(G.cone, '#d9a25a', w, 0, -0.03, 0.02, '#b97f3a').scale.setScalar(1.1);      // (gripped low in her fist, the scoops just above it)
      P(G.ball, '#f08fb0', w, 0, -0.14, 0.02).scale.setScalar(0.075); P(G.ball, '#f6e3b0', w, 0.01, -0.23, 0.02).scale.setScalar(0.062);
    }
    if (o.kind === 'photo') {     // a camera held in both hands, lifted to the eye
      const e = arms[1].el, cam = P(G.box, '#3a3632', e, -0.08, -0.34, -0.03, '#22201e'); cam.scale.set(0.22, 0.14, 0.1);
      const lens = P(G.rod, '#6a6a68', e, -0.08, -0.34, -0.1); lens.scale.set(0.045, 0.07, 0.045); lens.rotation.x = Math.PI / 2;
      for (const a of arms) a.sh.rotation.z = a.s * -0.3;
    }
    if (o.kind === 'bike') {
      const F = '#b8452c', D = '#3a3632', P = painter('bike', pos);
      p.wheels = [-0.55, 0.55].map((z) => { const w = grp(root, 0, 0.37, z); P(G.wheel, D, w, 0, 0, 0); for (const a of [0, Math.PI / 2]) { const sp = P(G.box, '#8a8a88', w, 0, 0, 0); sp.scale.set(0.012, 0.66, 0.012); sp.rotation.x = a; } return w; });
      for (const [a, b] of [[[0, 0.37, -0.55], [0, 0.9, -0.2]], [[0, 0.9, -0.2], [0, 0.38, 0.02]], [[0, 0.38, 0.02], [0, 0.37, -0.55]], [[0, 0.88, -0.2], [0, 0.95, 0.38]], [[0, 0.38, 0.02], [0, 0.95, 0.38]], [[0, 1.06, 0.36], [0, 0.37, 0.55]]]) rod(P, root, a, b, 0.022, F);
      rod(P, root, [-0.24, 1.07, 0.36], [0.24, 1.07, 0.36], 0.018, D);
      const seat = P(G.box, D, root, 0, 0.95, -0.24); seat.scale.set(0.16, 0.05, 0.3);
      hips.position.set(0, 1.03, -0.24); torso.rotation.x = 0.5; head.rotation.x = -0.4;
      for (const a of arms) { a.sh.rotation.x = -1.05; a.sh.rotation.z = a.s * -0.1; }
    }
    if (o.kind === 'raft') {       // sitting in the kayak (built in world.js) with a double paddle
      const pd = p.paddle = grp(torso, 0, 0.36, 0.5);       // the paddle is coloured with the paddler
      rod(P, pd, [-1.05, 0, 0], [1.05, 0, 0], 0.018, '#3a3632');
      for (const s of [-1, 1]) { const bl = P(G.box, '#e8792e', pd, s * 1.15, 0, 0, '#c85a1e'); bl.scale.set(0.34, 0.2, 0.03); }
      for (const a of arms) { a.sh.rotation.set(-0.85, 0, a.s * 0.3); a.el.rotation.x = -0.7; }
    }
    if (o.kind === 'swing') {      // the child's seat hangs from the bar and swings with her
      const pv = p.pivot = new THREE.Group(); pv.position.copy(pos); scene.add(pv); scene.remove(root); pv.add(root); root.position.set(0, -1.88 - 0.36 * sc, 0);
      const P = painter('swing', pos);
      for (const s of [-1, 1]) rod(P, pv, [s * 0.22, 0, 0], [s * 0.22, -1.9, 0], 0.012, '#5a4a40');
      const seat = P(G.box, '#d9453a', pv, 0, -1.9, 0, '#b3352d'); seat.scale.set(0.55, 0.06, 0.24);
      hips.position.y = 0.5; for (const l of legs) { l.hip.rotation.x = -1.5; l.knee.rotation.x = 1.1; }
      for (const a of arms) { a.sh.rotation.set(-2.5, 0, a.s * 0.35); a.el.rotation.x = -0.35; }
    }
    if (o.kind === 'swimmer') { root.rotation.order = 'YXZ'; root.rotation.x = 1.42; a0pose(arms, -2.9, 0.4); }
    if (o.kind === 'fisher') {     // a rod out over the water, a line and a float
      const rodG = p.rod = grp(root, 0, 1.2, 0.3);
      rod(P, rodG, [0, 0, 0], [0, 1.25, 2.3], 0.014, '#6a4a30'); rod(P, rodG, [0, 1.25, 2.3], [0, -1.62, 2.75], 0.004, '#3a3632');
      p.float = P(G.ball, '#d2302c', rodG, 0, -1.62, 2.75); p.float.scale.setScalar(0.06);
      for (const a of arms) { a.sh.rotation.set(-0.8, 0, a.s * -0.25); a.el.rotation.x = -0.75; }
      const hat = P(G.fes, '#c9b48a', head, 0, 0.13, 0, '#a8905a'); hat.scale.set(1.9, 0.5, 1.9);
    }
    if (o.kind === 'drink') { p.cup = painter('coffee', pos)(G.fes, '#f8f4ea', root, 0.12, 0.66, 0.47, '#d9d2c2'); p.cup.scale.set(0.38, 0.45, 0.38); p.cup.rotation.x = Math.PI; }
    if (o.kind === 'post') {      // a satchel on a strap, and a letter in the other hand
      const bag = P(G.box, '#7a4a26', hips, -0.25, 0.02, 0.02, '#5a3418'); bag.scale.set(0.1, 0.3, 0.32);
      rod(P, torso, [-0.2, 0.0, 0.05], [0.17, 0.64, 0.06], 0.014, '#5a3418');
      const letter = P(G.box, '#f8f4ea', arms[0].el, 0, -0.34, 0.06, '#e6dfd0'); letter.scale.set(0.02, 0.14, 0.2);
      p.raise = 1; p.lastK = -1;
    }
    // held things that have a word of their own (the hammer, the newspaper, the umbrella...) are coloured by it (toolTag)
    const TP = o.toolTag ? painter(o.toolTag, pos, undefined, false, o.toolAt) : P;
    if (o.kind === 'hammer') {      // a coppersmith: a hammer in his right hand, beating a copper pot on a low anvil
      rod(TP, arms[1].el, [0, -0.3, 0], [0, -0.3, 0.3], 0.016, '#6a4a30');
      const hd = TP(G.box, '#5d6066', arms[1].el, 0, -0.3, 0.32, '#3d4046'); hd.scale.set(0.13, 0.07, 0.08);
      a0pose(arms, -0.7, -1.1); arms[0].el.rotation.x = -0.9;
    }
    if (o.kind === 'sweep' || o.kind === 'rake') {      // a long handle held in both hands, its broom or rake on the ground ahead
      const g = p.tool = grp(root, 0, 0, 0.52);
      rod(TP, g, [0, 1.05, -0.2], [0, 0.04, 0.12], 0.02, '#8a6a44');
      if (o.kind === 'sweep') { const br = TP(G.box, '#c9a35a', g, 0, 0.05, 0.14, '#a07f3a'); br.scale.set(0.42, 0.1, 0.12); }
      else { const hd = TP(G.box, '#6a6e72', g, 0, 0.04, 0.13, '#4a4e52'); hd.scale.set(0.5, 0.03, 0.05); for (let i = -4; i <= 4; i++) rod(TP, g, [i * 0.055, 0.04, 0.13], [i * 0.055, 0.0, 0.2], 0.006, '#6a6e72'); }
      for (const a of arms) { a.sh.rotation.set(-0.85, 0, a.s * -0.12); a.el.rotation.x = -0.5; }
    }
    if (o.kind === 'read') {      // a newspaper held open in front of him
      const np = p.paper = TP(G.box, '#f2eee4', torso, 0, 0.5, 0.38, '#d9d2c2'); np.scale.set(0.5, 0.34, 0.012); np.rotation.x = -0.25;
      for (const a of arms) { a.sh.rotation.set(-1.0, 0, a.s * -0.32); a.el.rotation.x = -0.75; }
    }
    // Jahorina's people: a sledding child, a skier, a woodcutter, someone shovelling snow, a skater
    if (o.kind === 'lie') {      // lying on her back on a sun lounger, hands behind her head (Neum)
      root.rotation.order = 'YXZ'; root.rotation.x = -Math.PI / 2; hips.position.y = 0.92;
      for (const a of arms) { a.sh.rotation.set(-2.7, 0, a.s * 0.5); a.el.rotation.x = -1.9; }
      for (const l of legs) { l.hip.rotation.x = 0; l.knee.rotation.x = 0.05; }
    }
    if (o.kind === 'sled') { const sl = TP(G.box, o.toolCol || '#b8452c', root, 0, 0.3, 0.15, '#8a3020'); sl.scale.set(0.5, 0.08, 1.2); for (const a of arms) { a.sh.rotation.set(-0.5, 0, a.s * -0.2); a.el.rotation.x = -0.4; } }
    if (o.kind === 'ski') {
      for (const s of [-1, 1]) { const sk = TP(G.box, o.toolCol || '#d9453a', root, s * 0.12, 0.03, 0.15, '#a8302a'); sk.scale.set(0.08, 0.03, 1.75); rod(TP, arms[s > 0 ? 1 : 0].el, [0, -0.3, 0], [0, -1.15, -0.25], 0.012, '#3a3e42'); }
      for (const l of legs) { l.hip.rotation.x = -0.35; l.knee.rotation.x = 0.6; } hips.position.y = 0.82; torso.rotation.x = 0.28;
      for (const a of arms) { a.sh.rotation.set(-0.45, 0, a.s * -0.25); a.el.rotation.x = -0.5; }
    }
    if (o.kind === 'chop') {      // an axe held in both hands
      rod(TP, arms[1].el, [0, -0.3, 0], [0, -0.3, 0.6], 0.02, '#8a6a44');
      const hd = TP(G.box, '#6a6e72', arms[1].el, 0, -0.27, 0.62, '#4a4e52'); hd.scale.set(0.04, 0.2, 0.12);
    }
    if (o.kind === 'shovel') {
      const g = p.tool = grp(root, 0, 0, 0.52);
      rod(TP, g, [0, 1.05, -0.2], [0, 0.1, 0.12], 0.02, '#8a6a44');
      const bl = TP(G.box, '#5d7b8a', g, 0, 0.06, 0.2, '#3f5a68'); bl.scale.set(0.32, 0.04, 0.34);
      for (const a of arms) { a.sh.rotation.set(-0.85, 0, a.s * -0.12); a.el.rotation.x = -0.5; }
    }
    if (o.kind === 'umbrella') {      // standing under an open umbrella
      const g = p.tool = grp(root, 0.17, 0, 0.22);
      rod(TP, g, [0, 0.95, 0], [0, 2.12, 0], 0.016, '#3a3632');
      const cn = TP(G.cone, o.toolCol || '#b8452c', g, 0, 2.2, 0, '#8a3020'); cn.scale.set(14, 1.8, 14);      // (G.cone is 0.05 wide, 0.17 tall)
      a0pose(arms, 0, -0.75); arms[1].el.rotation.x = -1.3; arms[1].sh.rotation.z = -0.18;
    }
    if (o.dog) p.dogBlock = block(o.x, o.y + 0.4, o.z, 0.5, 0.8, 0.9, { wall: true, person: true });
    if (o.kind === 'keeper') { for (const l of legs) { l.hip.rotation.x = -0.45; l.knee.rotation.x = 0.8; l.hip.rotation.z = 0; } hips.position.y = 0.84; for (const a of arms) a.sh.rotation.z = a.s * 0.95; }
    if (o.kind === 'cheer') { arms[1].sh.rotation.z = 2.5; }

    // ---- Sarajevo activities (built fresh to Mostar's hand-contact standard) ----
    if (o.kind === 'sarCornSell') {
      const cup = P(G.fes, '#e8e0cf', arms[0].el, 0, -0.31, 0.03, '#cfc6b0'); cup.scale.set(0.45, 0.65, 0.45); cup.rotation.x = Math.PI;
      const KP = painter('kukuruz', pos);
      const corn = KP(G.ball, '#f0be2d', arms[0].el, 0, -0.34, 0.03, '#d49a1a'); corn.scale.set(0.042, 0.025, 0.042);
    }
    if (o.kind === 'sarSweep') {
      // broom parented to left forearm at the hand, angled down so right hand grips the upper shaft
      const br = grp(arms[1].el, 0, -0.3, 0); br.rotation.set(0.35, 0, 0.35);
      rod(P, br, [0, 0.45, 0], [0, -0.95, 0], 0.017, '#8c6a42');
      const headB = P(G.box, '#c9a252', br, 0, -0.97, 0, '#9c7834'); headB.scale.set(0.38, 0.14, 0.09);
      p.broom = br;
    }
    if (o.kind === 'sarHammer') {
      const h = grp(arms[0].el, 0, -0.3, 0);
      rod(P, h, [0, 0, -0.04], [0, 0, 0.24], 0.015, '#7a5432');
      const hd = P(G.box, '#52565c', h, 0, 0, 0.25, '#383b40'); hd.scale.set(0.11, 0.055, 0.065);
    }
    if (o.kind === 'sarCarry') {
      const SP = painter('somun', pos);
      const st = p.somunStack = grp(torso, 0, 0.32, 0.26);
      for (let i = 0; i < 3; i++) {
        const loaf = SP(G.catBody, '#d9a45a', st, (i - 1) * 0.02, i * 0.075, 0, '#b57e38');
        loaf.scale.set(0.15, 0.038, 0.15);
      }
    }
    if (o.kind === 'sarWaiter') {
      const tr = grp(arms[0].el, 0.06, -0.32, 0.06); tr.rotation.x = Math.PI / 2;
      const tray = P(G.disc, '#c48d56', tr, 0, 0, 0, '#9a6838'); tray.scale.set(0.105, 0.105, 0.014);
      const DP = painter('dzezva', pos);
      const pot = DP(G.fes, '#c97848', tr, 0, 0.02, -0.06, '#99522c'); pot.scale.set(0.45, 0.62, 0.45); pot.rotation.x = -Math.PI / 2;
      rod(DP, tr, [0, 0.02, -0.07], [0.13, 0.02, -0.11], 0.007, '#99522c');
      p.tray = tr;
      if (o.loop) p.loopPts = o.loop.map(([x, z]) => new THREE.Vector3(x, o.y, z));
    }
    if (o.kind === 'sarChestnutSell') {
      const sp = grp(arms[0].el, 0, -0.3, 0);
      rod(P, sp, [0, 0, -0.02], [0, 0, 0.32], 0.014, '#7a5634');
      const cn = P(G.cone, '#d9c8a6', arms[1].el, 0, -0.32, 0.02, '#b8a580'); cn.scale.setScalar(0.9); cn.rotation.x = Math.PI;
      const KP = painter('kesteni', pos);
      const nuts = KP(G.ball, '#5c3422', arms[1].el, 0, -0.37, 0.02, '#3d2014'); nuts.scale.set(0.045, 0.032, 0.045);
    }
    if (o.kind === 'sarBuy') {
      const cn = P(G.cone, '#d9c8a6', arms[1].el, 0, -0.32, 0.02, '#b8a580'); cn.scale.setScalar(0.85); cn.rotation.x = Math.PI;
      const KP = painter('kesteni', pos);
      const nuts = KP(G.ball, '#5c3422', arms[1].el, 0, -0.37, 0.02, '#3d2014'); nuts.scale.set(0.04, 0.028, 0.04);
      const coin = P(G.disc, '#e0b84a', arms[0].el, 0, -0.31, 0.03, '#b58d28'); coin.scale.set(0.022, 0.022, 0.006);
    }
    if (o.kind === 'sarUmbrellaWait') {
      // closed umbrella hanging cleanly from her bent right hand/wrist; coloured ONLY by 'kisobran'
      const UP = painter('kisobran', pos);
      const ug = p.umb = grp(arms[0].el, 0, -0.3, 0.01); ug.rotation.set(0.25, 0, 0);
      rod(UP, ug, [0, 0.02, 0], [0, -0.78, 0], 0.013, '#4a382c');
      const furled = UP(G.cone, '#2f5878', ug, 0, -0.44, 0, '#1f3e58'); furled.scale.set(0.95, 3.6, 0.95); furled.rotation.x = Math.PI;
      const hook = UP(G.box, '#4a382c', ug, 0, 0.04, -0.03, '#33261d'); hook.scale.set(0.022, 0.055, 0.075);
    }
    if (o.kind === 'sarReadBench') {
      const NP = painter('novine', pos);
      const pg = p.paper = grp(torso, 0, 0.42, 0.43); pg.rotation.x = -0.32;
      const leftP = NP(G.box, '#f2ece0', pg, -0.11, 0, 0, '#d8d0be'); leftP.scale.set(0.22, 0.30, 0.01); leftP.rotation.y = 0.14;
      const rightP = NP(G.box, '#f2ece0', pg, 0.11, 0, 0, '#d8d0be'); rightP.scale.set(0.22, 0.30, 0.01); rightP.rotation.y = -0.14;
    }
    if (o.kind === 'sarRoast') {
      const tg = grp(arms[0].el, 0, -0.3, 0);
      rod(P, tg, [0, 0, -0.02], [0, 0, 0.28], 0.01, '#585c62');
      const PP = painter('paprike', pos);
      const pep = PP(G.catBody, '#c93828', tg, 0, 0, 0.30, '#962218'); pep.scale.set(0.04, 0.035, 0.09);
    }
    if (o.kind === 'sarPick') {
      const AP = painter('jabuka', pos);
      const ap = AP(G.ball, '#cf3e2e', arms[0].el, 0, -0.33, 0.01, '#a02b1f'); ap.scale.setScalar(0.045);
    }
    if (o.kind === 'sarNana') {
      hips.position.y = 0.74; torso.rotation.x = 0.14;
      for (const l of legs) l.hip.visible = false;
      for (const ch of hips.children) if (ch !== torso && !legs.some((l) => l.hip === ch)) ch.visible = false;
    }
    if (o.kind === 'sarPaint') {
      const br = grp(arms[0].el, 0, -0.3, 0);
      rod(P, br, [0, 0, -0.02], [0, 0, 0.22], 0.008, '#7a5432');
      const tip = P(G.cone, '#d97832', br, 0, 0, 0.24, '#a64d1e'); tip.scale.set(0.25, 0.28, 0.25); tip.rotation.x = Math.PI / 2;
      const pal = P(G.disc, '#c99f6b', arms[1].el, 0, -0.3, 0.02, '#a37b4b'); pal.scale.set(0.11, 0.085, 0.014); pal.rotation.x = Math.PI / 2;
    }
    if (o.kind === 'sarDriver') {
      p.isTramDriver = true;
    }
    // ---- Jajce spring activities ----
    if (o.kind === 'jajBinoc') {
      const BP = painter('dvogled', pos);
      const bg = grp(arms[0].el, -0.05, -0.30, 0.03);
      for (const sx of [-0.045, 0.045]) {
        const tube = BP(G.rod, '#33363b', bg, sx, 0, 0.07, '#222428');
        tube.scale.set(0.032, 0.14, 0.032); tube.rotation.x = Math.PI / 2;
      }
      const bridge = BP(G.box, '#4a4e54', bg, 0, 0, 0.05, '#2f3236');
      bridge.scale.set(0.07, 0.025, 0.035);
    }
    if (o.kind === 'jajHiker') {
      const RP = painter('ruksak', pos);
      const pack = RP(G.box, '#c95b32', torso, 0, 0.30, -0.22, '#994020');
      pack.scale.set(0.32, 0.44, 0.20);
      const flap = RP(G.box, '#e07a42', torso, 0, 0.49, -0.22, '#b05526');
      flap.scale.set(0.34, 0.10, 0.22);
      const pocket = RP(G.box, '#a84422', torso, 0, 0.20, -0.33, '#7d2f16');
      pocket.scale.set(0.22, 0.18, 0.06);
    }
    if (o.kind === 'jajMiller') {
      const VP = painter('vreca', pos);
      const sk = VP(G.catBody, '#dfd3b8', torso, 0.12, 0.56, -0.04, '#bfb090');
      sk.scale.set(0.22, 0.24, 0.36); sk.rotation.z = -0.35;
    }
    if (o.kind === 'jajFish') {
      const UP = painter('udica', pos);
      const rodG = p.rod = grp(arms[0].el, 0, -0.30, 0.02);
      rod(UP, rodG, [0, 0, 0], [0, 0.45, 2.3], 0.014, '#7d5a34');
      rod(UP, rodG, [0, 0.45, 2.3], [0, -1.65, 2.55], 0.005, '#d8e4ea');
      const bob = UP(G.ball, '#d94232', rodG, 0, -1.52, 2.55, '#a82c20');
      bob.scale.set(0.045, 0.075, 0.045);
    }
    if (o.kind === 'jajGarden') {
      const WP = painter('zalijevati', pos);
      const can = grp(arms[0].el, 0, -0.32, 0.05);
      const body = WP(G.rod, '#4f8a68', can, 0, -0.06, 0.08, '#38694c'); body.scale.set(0.11, 0.22, 0.11);
      rod(WP, can, [0, -0.10, 0.16], [0, 0.04, 0.38], 0.018, '#4f8a68');
      const rose = WP(G.cone, '#c9a648', can, 0, 0.05, 0.40, '#9c7c2c'); rose.scale.set(0.55, 0.45, 0.55); rose.rotation.x = Math.PI / 2;
    }
    if (o.kind === 'jajGuitar') {
      const GP = painter('gitara', pos);
      const gg = p.guitar = grp(torso, 0.04, 0.22, 0.24);
      gg.rotation.set(0.08, 0.15, -0.32);
      const lo = GP(G.disc, '#c97e38', gg, -0.08, 0, 0, '#965820'); lo.scale.set(0.17, 0.19, 0.065);
      const up = GP(G.disc, '#c97e38', gg, 0.08, 0.04, 0, '#965820'); up.scale.set(0.13, 0.14, 0.065);
      const hole = GP(G.disc, '#3a2416', gg, 0.01, 0.01, 0.036, '#22140c'); hole.scale.set(0.055, 0.055, 0.008);
      rod(GP, gg, [0.16, 0.06, 0], [0.56, 0.16, 0], 0.024, '#5e3a20');
    }
    // ---- Jahorina winter figures (all brand-new jah* kinds) ----
    if (o.kind === 'jahThrow') {
      const GP = painter('grudva', pos);
      const sb = p.snowball = GP(G.ball, '#f4f8fc', arms[0].el, 0, -0.32, 0.03, '#c8d6e6'); sb.scale.setScalar(0.068);
    }
    if (o.kind === 'jahChop') {
      const AP = painter('sjekira', pos);
      const ax = grp(arms[0].el, 0, -0.3, 0);
      rod(AP, ax, [0, 0, -0.05], [0, 0, 0.56], 0.018, '#7a5434');
      const bl = AP(G.box, '#586068', ax, 0, 0.04, 0.54, '#363c42'); bl.scale.set(0.04, 0.2, 0.14);
    }
    if (o.kind === 'jahShovel') {
      const SP = painter('lopata', pos);
      const sh = p.shovel = grp(root, 0, 0, 0.52);
      rod(SP, sh, [0, 1.05, -0.22], [0, 0.08, 0.22], 0.018, '#7a5434');
      const scoop = SP(G.box, '#b84834', sh, 0, 0.08, 0.30, '#8a3222'); scoop.scale.set(0.36, 0.04, 0.28); scoop.rotation.x = 0.25;
    }
    if (o.kind === 'jahSledRide') {
      const KP = painter(o.sledTag || 'sanke', pos);
      const sl = grp(root, 0, 0.05, 0.05);
      for (const s of [-0.19, 0.19]) {
        const run = KP(G.box, '#7a5230', sl, s, 0.05, 0, '#54361e'); run.scale.set(0.035, 0.06, 1.15);
        rod(KP, sl, [s, 0.05, 0.56], [s, 0.2, 0.68], 0.02, '#7a5230');
      }
      const seat = KP(G.box, '#9c6b3e', sl, 0, 0.20, -0.04, '#754e2b'); seat.scale.set(0.46, 0.05, 0.95);
      if (o.path) p.pathPts = o.path.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    }
    if (o.kind === 'jahSledPull') {
      const KP = painter('sanke', pos);
      const sl = p.pullSled = grp(root, 0, 0.05, -1.25);
      for (const s of [-0.19, 0.19]) {
        const run = KP(G.box, '#7a5230', sl, s, 0.05, 0, '#54361e'); run.scale.set(0.035, 0.06, 1.05);
      }
      const seat = KP(G.box, '#9c6b3e', sl, 0, 0.20, 0, '#754e2b'); seat.scale.set(0.44, 0.05, 0.88);
      rod(P, torso, [-0.18, 0.08, -0.15], [0, -0.68, -0.78], 0.012, '#c8b490');
    }
    if (o.kind === 'jahSkater') {
      const BP = painter('klizaljke', pos);
      for (const l of legs) {
        const boot = BP(G.box, '#f2eee6', l.knee, 0, -0.40, 0.05, '#c8c2b6'); boot.scale.set(0.095, 0.14, 0.22);
        const blade = BP(G.box, '#788490', l.knee, 0, -0.49, 0.06, '#48525c'); blade.scale.set(0.018, 0.04, 0.26);
      }
      if (o.orbit) p.orbit = o.orbit;
    }
    if (o.kind === 'jahSkier' || o.kind === 'jahTumble') {
      const KP = painter('skije', pos);
      const PP = painter('stapovi', pos);
      if (o.kind === 'jahSkier') {
        for (const s of [-0.13, 0.13]) {
          const sk = KP(G.box, o.skiCol || '#cc3c2c', root, s, 0.025, 0.14, '#96281c'); sk.scale.set(0.09, 0.03, 1.65);
          const tip = KP(G.box, o.skiCol || '#cc3c2c', root, s, 0.08, 0.99, '#96281c'); tip.scale.set(0.09, 0.03, 0.2); tip.rotation.x = -0.5;
        }
        for (const a of arms) {
          rod(PP, a.el, [0, -0.3, 0], [0, -0.3, -1.02], 0.012, '#3a4048');
          const bsk = PP(G.disc, '#262b30', a.el, 0, -0.3, -0.94); bsk.scale.set(0.045, 0.045, 0.01);
        }
        if (o.path) p.pathPts = o.path.map(([x, y, z]) => new THREE.Vector3(x, y, z));
      } else {
        // playful beginner tumbled in soft powder snow, skis tilted up cleanly
        root.rotation.order = 'YXZ';
        hips.position.set(0, 0.36, 0); torso.rotation.x = -0.82;
        legs[0].hip.rotation.set(-1.75, 0, -0.25); legs[0].knee.rotation.x = 0.45;
        legs[1].hip.rotation.set(-1.35, 0, 0.35); legs[1].knee.rotation.x = 0.6;
        for (const [i, l] of legs.entries()) {
          const sk = KP(G.box, '#2c6eb8', l.knee, 0, -0.45, 0.06, '#1c4d85'); sk.scale.set(0.09, 0.03, 1.45); sk.rotation.x = Math.PI / 2 + (i ? 0.15 : -0.15);
        }
        for (const a of arms) { a.sh.rotation.set(-0.9, 0, a.s * 0.65); a.el.rotation.x = -0.4; }
      }
    }
    // ---- Travnik summer activities ----
    if (o.kind === 'trvWaitress') {
      const tr = grp(arms[0].el, 0.06, -0.32, 0.06); tr.rotation.x = Math.PI / 2;
      const tray = P(G.disc, '#c99358', tr, 0, 0, 0, '#996a38'); tray.scale.set(0.11, 0.11, 0.014);
      const gl = P(G.rod, '#f5db4c', tr, 0, 0.02, -0.05, '#c9ae26'); gl.scale.set(0.032, 0.08, 0.032); gl.rotation.x = Math.PI / 2;
    }
    if (o.kind === 'trvChef') {
      const hat = P(G.rod, '#faf8f2', head, 0, 0.24, 0, '#dcd8ce'); hat.scale.set(0.13, 0.22, 0.13);
      const puff = P(G.ball, '#ffffff', head, 0, 0.35, 0, '#e3e0d8'); puff.scale.set(0.17, 0.12, 0.17);
      const sp = grp(arms[0].el, 0, -0.30, 0);
      rod(P, sp, [0, 0, -0.02], [0, 0, 0.34], 0.012, '#7d5634');
    }
    if (o.kind === 'trvWriter') {
      const PP = painter('pero', pos);
      const q = grp(arms[0].el, 0, -0.30, 0.02);
      rod(PP, q, [0, 0, 0], [0.06, 0.24, 0.10], 0.009, '#f7f4ec');
      const fl = PP(G.box, '#ffffff', q, 0.05, 0.18, 0.08, '#dde2e8'); fl.scale.set(0.05, 0.16, 0.015);
    }
    if (o.kind === 'trvShepherd') {
      const SP = painter('stap', pos);
      const st = grp(arms[0].el, 0, -0.28, 0.03);
      rod(SP, st, [0, 0.65, 0], [0, -0.92, 0], 0.020, '#7a5430');
      const hk = SP(G.box, '#7a5430', st, 0, 0.68, 0.05, '#593b1f'); hk.scale.set(0.04, 0.05, 0.12);
    }
    if (o.kind === 'trvVizier') {
      const turb = P(G.ball, '#f5efe2', head, 0, 0.18, 0, '#d9d0be'); turb.scale.set(0.21, 0.14, 0.21);
      const crest = P(G.ball, '#d94c38', head, 0, 0.22, 0.16, '#a63322'); crest.scale.set(0.045, 0.07, 0.045);
    }
    // ---- Neum Adriatic summer figures (all brand-new neu* kinds) ----
    if (o.kind === 'neuSunbathe') {
      root.rotation.order = 'YXZ';
      root.rotation.x = -1.24;
      hips.position.set(0, 0.54, 0);
      legs[0].hip.rotation.x = -0.22; legs[0].knee.rotation.x = 0.25;
      legs[1].hip.rotation.x = -0.18; legs[1].knee.rotation.x = 0.20;
      for (const a of arms) { a.sh.rotation.set(-2.45, 0, a.s * 0.42); a.el.rotation.x = -1.65; }
    }
    if (o.kind === 'neuNap') {
      root.rotation.order = 'YXZ';
      root.rotation.x = -Math.PI / 2;
      hips.position.set(0, 0.16, 0);
      legs[0].hip.rotation.x = -0.05; legs[0].knee.rotation.x = 0.08;
      legs[1].hip.rotation.x = -0.12; legs[1].knee.rotation.x = 0.16;
      arms[0].sh.rotation.set(-0.2, 0, -0.35); arms[0].el.rotation.x = -1.1;
      arms[1].sh.rotation.set(-2.3, 0, 0.35); arms[1].el.rotation.x = -1.2;
      head.rotation.y = 0.35;
    }
    if (o.kind === 'neuRead') {
      const BP = o.bookTag ? painter(o.bookTag, pos, undefined, false, o.bookAt) : P;
      const bk = p.book = grp(torso, 0, 0.42, 0.38); bk.rotation.x = -0.48;
      const lft = BP(G.box, '#f6f1e4', bk, -0.11, 0, 0, '#dcd4c0'); lft.scale.set(0.20, 0.26, 0.02); lft.rotation.y = 0.22;
      const rgt = BP(G.box, '#f6f1e4', bk, 0.11, 0, 0, '#dcd4c0'); rgt.scale.set(0.20, 0.26, 0.02); rgt.rotation.y = -0.22;
      const cov = BP(G.box, o.bookCol || '#2b78a8', bk, 0, 0, -0.014, '#1b5478'); cov.scale.set(0.42, 0.28, 0.012);
      for (const a of arms) { a.sh.rotation.set(-0.85, 0, a.s * -0.18); a.el.rotation.x = -0.85; }
    }
    if (o.kind === 'neuFan') {
      const fn = p.fan = grp(arms[1].el, 0, -0.32, 0.06);
      const blade = P(G.disc, '#e8684a', fn, 0, 0, 0, '#b84830'); blade.scale.set(0.18, 0.14, 0.015);
      rod(P, fn, [0, -0.12, 0], [0, 0.02, 0], 0.012, '#7a5430');
    }
    if (o.kind === 'neuSnorkel') {
      root.rotation.order = 'YXZ';
      root.rotation.x = 1.48;
      hips.position.set(0, 0.45, 0);
      const MP = o.maskTag ? painter(o.maskTag, pos, undefined, false, o.maskAt) : P;
      const mk = MP(G.box, '#2b86c4', head, 0, 0.02, 0.135, '#1c5e8c'); mk.scale.set(0.19, 0.095, 0.05);
      rod(MP, head, [0.12, 0.02, 0.10], [0.16, 0.36, -0.04], 0.016, '#f2b82a');
      const FP = o.finTag ? painter(o.finTag, pos, undefined, false, o.finAt) : P;
      for (const l of legs) {
        const fin = FP(G.box, '#f2b82a', l.knee, 0, -0.50, 0.14, '#c48d18'); fin.scale.set(0.15, 0.03, 0.44);
      }
      if (o.orbit) p.orbit = o.orbit;
    }
    if (o.kind === 'neuLifeguard') {
      const tube = P(G.box, '#d9382c', torso, 0, 0.24, 0.30, '#a3241c'); tube.scale.set(0.54, 0.10, 0.11);
      arms[0].sh.rotation.set(-2.2, 0, -0.35); arms[0].el.rotation.x = -1.25;
      arms[1].sh.rotation.set(-0.7, 0, 0.12); arms[1].el.rotation.x = -0.6;
    }
    if (o.kind === 'neuSailor') {
      rod(P, arms[0].el, [0, -0.3, 0], [0, -0.3, -0.55], 0.018, '#7a5230');
    }
    if (o.kind === 'neuDine') {
      const gl = P(G.rod, '#f2da5e', arms[1].el, 0, -0.32, 0.06, '#d4b838'); gl.scale.set(0.038, 0.11, 0.038);
    }
    // ---- Banja Luka figures (all brand-new bl* kinds) ----
    if (o.kind === 'blDajak') {
      const MP = o.poleTag ? painter(o.poleTag, pos, undefined, false, o.poleAt) : P;
      const pole = p.pole = grp(torso, 0.24, 0.36, 0.18);
      rod(MP, pole, [0, 1.35, 0.28], [0, -2.15, -0.65], 0.028, '#a67b48');
      const tip = MP(G.cone, '#5a6066', pole, 0, -2.2, -0.68, '#363b40'); tip.scale.set(0.55, 1.2, 0.55); tip.rotation.x = Math.PI;
    }
    if (o.kind === 'blViolin') {
      const VP = o.violinTag ? painter(o.violinTag, pos) : P;
      const vl = grp(torso, -0.14, 0.62, 0.28); vl.rotation.set(0.15, 0.45, 0.25);
      VP(G.disc, '#9c4c24', vl, 0, 0, 0, '#6e3214').scale.set(0.11, 0.17, 0.05);
      rod(VP, vl, [0, 0.14, 0], [0, 0.42, 0], 0.018, '#4a2614');
      rod(VP, arms[1].el, [0, -0.3, -0.04], [0, -0.3, 0.52], 0.010, '#d8be8a');
    }
    if (o.kind === 'blDrum') {
      const DP = o.drumTag ? painter(o.drumTag, pos) : P;
      const dr = DP(G.rod, '#cc3e32', root, 0, 0.56, 0.56, '#96281e'); dr.scale.set(0.32, 0.42, 0.32);
      const topD = DP(G.disc, '#f4eedc', root, 0, 0.78, 0.56, '#d8d0be'); topD.scale.set(0.31, 0.31, 0.02); topD.rotation.x = Math.PI / 2;
      for (const a of arms) rod(DP, a.el, [0, -0.3, 0], [0, -0.3, 0.34], 0.012, '#d8be8a');
    }
    if (o.kind === 'blTrumpet') {
      const TP2 = o.trumpetTag ? painter(o.trumpetTag, pos) : P;
      const tr = grp(head, 0, -0.06, 0.14);
      rod(TP2, tr, [0, 0, 0], [0, 0.04, 0.44], 0.02, '#e8bc38');
      const bell = TP2(G.cone, '#e8bc38', tr, 0, 0.05, 0.50, '#b88e1e'); bell.scale.set(1.4, 1.4, 1.4); bell.rotation.x = -Math.PI / 2;
    }
    if (o.kind === 'blWaitress') {
      const tr = P(G.disc, '#c8ced4', arms[1].el, 0, -0.30, 0.08, '#969ea6'); tr.scale.set(0.24, 0.24, 0.022); tr.rotation.x = Math.PI / 2;
      P(G.rod, '#f8f4ea', arms[1].el, -0.06, -0.24, 0.08).scale.set(0.036, 0.08, 0.036);
      P(G.rod, '#f8f4ea', arms[1].el, 0.07, -0.24, 0.09).scale.set(0.036, 0.08, 0.036);
    }
    if (o.kind === 'blScooter') {
      const SP = o.scooterTag ? painter(o.scooterTag, pos) : P;
      const scG = grp(root, 0, 0, 0);
      SP(G.box, '#e24a38', scG, 0, 0.10, 0.02, '#aa2e20').scale.set(0.18, 0.04, 0.72);
      for (const z of [-0.32, 0.34]) { const w = SP(G.disc, '#2e343a', scG, 0, 0.09, z); w.scale.set(0.09, 0.09, 0.04); w.rotation.y = Math.PI / 2; }
      rod(SP, scG, [0, 0.12, 0.34], [0, 0.88, 0.28], 0.022, '#e24a38');
      rod(SP, scG, [-0.22, 0.88, 0.28], [0.22, 0.88, 0.28], 0.02, '#2e343a');
    }
    if (o.kind === 'blFrisbee') {
      const FP = o.frisbeeTag ? painter(o.frisbeeTag, pos) : P;
      const fb = p.frisbee = FP(G.disc, '#f25c38', arms[1].el, 0, -0.32, 0.12, '#c03c1e'); fb.scale.set(0.18, 0.18, 0.024); fb.rotation.x = Math.PI / 2;
    }
    if (o.kind === 'blTennis') {
      const RP = o.racketTag ? painter(o.racketTag, pos) : P;
      const rk = grp(arms[1].el, 0, -0.30, 0);
      rod(RP, rk, [0, 0, 0], [0, 0, 0.34], 0.016, '#2a3440');
      const hd = RP(G.disc, '#e8e4da', rk, 0, 0, 0.50, '#2a6cb8'); hd.scale.set(0.16, 0.21, 0.025);
    }
    if (o.kind === 'blBasket') {
      const BP = o.ballTag ? painter(o.ballTag, pos) : P;
      const bb = p.bball = BP(G.ball, '#e07228', arms[1].el, -0.06, -0.36, 0.12, '#a84c14'); bb.scale.setScalar(0.13);
    }
    if (o.kind === 'blStroller') {
      const CP = o.strollerTag ? painter(o.strollerTag, pos) : P;
      const st = grp(root, 0, 0, 0.82);
      CP(G.box, '#2b6ea8', st, 0, 0.56, 0.12, '#1c4d78').scale.set(0.56, 0.38, 0.78);
      const hood = CP(G.cap, '#2b6ea8', st, 0, 0.74, -0.10, '#1c4d78'); hood.scale.set(2.2, 1.8, 2.2);
      for (const sx of [-0.26, 0.26]) for (const sz of [-0.26, 0.34]) {
        const w = CP(G.disc, '#2e343a', st, sx, 0.14, sz); w.scale.set(0.14, 0.14, 0.05); w.rotation.y = Math.PI / 2;
        rod(CP, st, [sx, 0.14, sz], [sx, 0.45, sz * 0.5], 0.018, '#8a949e');
      }
      for (const sx of [-0.26, 0.26]) rod(CP, st, [sx, 0.55, -0.22], [sx, 0.92, -0.52], 0.018, '#8a949e');
      rod(CP, st, [-0.26, 0.92, -0.52], [0.26, 0.92, -0.52], 0.02, '#2e343a');
    }
    if (o.kind === 'blPhoto') {
      const e = arms[1].el;
      const cam = P(G.box, '#2e3238', e, -0.08, -0.34, -0.02, '#1a1d20'); cam.scale.set(0.24, 0.15, 0.12);
      const lens = P(G.rod, '#58606a', e, -0.08, -0.34, -0.12); lens.scale.set(0.05, 0.10, 0.05); lens.rotation.x = Math.PI / 2;
    }
    if (o.kind === 'blDraw') {
      const pad = P(G.box, '#faf6ea', torso, 0, 0.44, 0.38, '#d8d2c2'); pad.scale.set(0.38, 0.28, 0.025); pad.rotation.x = -0.55;
      rod(P, arms[1].el, [0, -0.30, 0], [0, -0.30, 0.22], 0.01, '#e8a828');
    }
    if (o.kind === 'bihPotter') {
      const clay = P(G.ball, '#b86c48', torso, 0, 0.42, 0.36, '#8c4c2e'); clay.scale.set(0.16, 0.14, 0.16);
    }
    if (o.kind === 'bihGuard') {
      const sp = grp(arms[1].el, 0, -0.32, 0);
      sp.rotation.x = 1.38;
      rod(P, sp, [0, -0.82, 0], [0, 1.38, 0], 0.022, '#6d4c32');
      const tip = P(G.cone, '#c8d0d8', sp, 0, 1.50, 0, '#8d96a0'); tip.scale.set(0.8, 1.8, 0.4);
      const helm = P(G.cap, '#9aa4b0', head, 0, 0.08, 0, '#6d7782'); helm.scale.set(1.06, 1.04, 1.06);
    }
    if (o.kind === 'bihAccordion') {
      const HP = painter(o.accordionTag || 'harmonika', pos);
      const acc = p.accordion = grp(torso, 0, 0.40, 0.30);
      HP(G.box, '#24272c', acc, -0.18, 0, 0, '#14161a').scale.set(0.10, 0.32, 0.18);
      HP(G.box, '#c9382e', acc, 0, 0, 0, '#8c221b').scale.set(0.24, 0.28, 0.15);
      HP(G.box, '#24272c', acc, 0.18, 0, 0, '#14161a').scale.set(0.10, 0.32, 0.18);
      HP(G.box, '#f4efe2', acc, 0.18, 0, 0.095, '#d6cfbc').scale.set(0.05, 0.24, 0.02);
    }
    list.push(p); return p;
  }
  function a0pose(arms, x0, x1) { arms[0].sh.rotation.x = x0; arms[1].sh.rotation.x = x1; }
  for (const o of world.people) person(o);

  // ---- animals: a horse and sheep on the outer meadows, pigeons on the square, a fish in the river ----
  const animals = world.animals.map((o) => {
    const pos = new THREE.Vector3(o.x, o.y, o.z), P = painter(o.tag, pos, 2), root = new THREE.Group(); root.position.copy(pos); root.rotation.y = o.ry; scene.add(root);
    const E = (col, parent, x, y, z, sx, sy, sz, bleed) => { const m = P(G.catBody, col, parent, x, y, z, bleed); m.scale.set(sx, sy, sz); return m; };
    const a = { o, root, legs: [] };
    if (o.kind === 'deer') {      // a red deer: like the horse, slighter, with antlers
      const C = '#8a5530', C2 = '#5f3a20', D = '#e8dcc4';
      E(C, root, 0, 1.0, 0, 0.26, 0.3, 0.62, C2);
      a.neck = grp(root, 0, 1.18, 0.5); E(C, a.neck, 0, 0.28, 0.16, 0.11, 0.34, 0.15, C2).rotation.x = 0.45; E(C, a.neck, 0, 0.56, 0.36, 0.09, 0.1, 0.22, C2).rotation.x = 0.4;
      for (const s of [-1, 1]) { rod(P, a.neck, [s * 0.05, 0.64, 0.3], [s * 0.3, 1.05, 0.22], 0.018, '#6a4a30'); rod(P, a.neck, [s * 0.2, 0.86, 0.26], [s * 0.34, 0.98, 0.42], 0.014, '#6a4a30'); }
      for (const [x, z] of [[0.13, 0.4], [-0.13, 0.4], [0.13, -0.4], [-0.13, -0.4]]) { const g = grp(root, x, 0.85, z); const m = P(G.catLeg, C, g, 0, 0, 0, C2); m.scale.set(1.1, 3.3, 1.1); a.legs.push(g); }
      a.tail = grp(root, 0, 1.12, -0.6); P(G.catTail, D, a.tail, 0, 0, 0).scale.set(0.8, 0.35, 0.8);
      a.block = block(o.x, o.y + 0.9, o.z, 1.2, 1.8, 1.4, { wall: true, person: true });
    } else if (o.kind === 'horse') {
      const C = '#8a5a34', C2 = '#5f3a20', D = '#2f241c';
      E(C, root, 0, 1.2, 0, 0.34, 0.38, 0.8, C2);
      a.neck = grp(root, 0, 1.4, 0.62); E(C, a.neck, 0, 0.32, 0.2, 0.15, 0.42, 0.2, C2).rotation.x = 0.55; E(C, a.neck, 0, 0.68, 0.52, 0.12, 0.14, 0.3, C2).rotation.x = 0.5;
      for (const s of [-1, 1]) E(C2, a.neck, s * 0.07, 0.86, 0.36, 0.03, 0.08, 0.04); E(D, a.neck, 0, 0.42, 0.06, 0.05, 0.4, 0.1).rotation.x = 0.55;
      for (const [x, z] of [[0.18, 0.5], [-0.18, 0.5], [0.18, -0.5], [-0.18, -0.5]]) { const g = grp(root, x, 1.0, z); const m = P(G.catLeg, C, g, 0, 0, 0, C2); m.scale.set(1.5, 3.85, 1.5); a.legs.push(g); }
      a.tail = grp(root, 0, 1.36, -0.8); const t = P(G.catTail, D, a.tail, 0, 0, 0); t.scale.set(1.2, 1.3, 1.2); a.tail.rotation.x = Math.PI + 0.55;      // (hangs down and back, clear of the hindquarters)
      a.block = block(o.x, o.y + 1, o.z, 1.7, 2, 1.7, { wall: true, person: true });
    } else {
      const W = '#f4f0e4', W2 = '#d6cfbc', D = '#3a342e';
      for (const [x, y, z, r] of [[0, 0.66, 0, 0.3], [0, 0.7, 0.24, 0.26], [0, 0.68, -0.26, 0.27], [0.14, 0.62, 0.05, 0.22], [-0.14, 0.62, -0.05, 0.22]]) E(W, root, x, y, z, r, r * 0.92, r * 1.15, W2);
      a.neck = grp(root, 0, 0.74, 0.4); E(D, a.neck, 0, 0.06, 0.14, 0.1, 0.11, 0.16); for (const s of [-1, 1]) E(D, a.neck, s * 0.11, 0.1, 0.08, 0.05, 0.025, 0.035);
      for (const [x, z] of [[0.13, 0.26], [-0.13, 0.26], [0.13, -0.26], [-0.13, -0.26]]) { const g = grp(root, x, 0.44, z); const m = P(G.catLeg, D, g, 0, 0, 0); m.scale.set(1, 1.7, 1); a.legs.push(g); }
      a.block = block(o.x, o.y + 0.5, o.z, 1, 1, 1, { wall: true, person: true });
    }
    a.size = o.kind === 'horse' ? 1.1 : o.kind === 'deer' ? 0.8 : 0.55;      // how close another animal may come (about half its length)
    a.phase = R() * 6; a.home = pos.clone(); a.to = pos.clone(); a.rest = 2 + R() * 5; a.walk = 0; return a;
  });
  // (each map has its own set of these features; a map without one simply does not get it)
  const PG = world.pigeons || { x: 0, y: -999, z: 0 }, pcentre = new THREE.Vector3(PG.x, PG.y, PG.z), pigeons = [];
  const pCount = world.pigeons ? (PG.count || 8) : 0, pTag = PG.tag || 'pigeon';
  for (let i = 0; i < pCount; i++) {
    const ang = (i / pCount) * 6.28 + R(), rad = 0.5 + R() * (PG.spread || 1.5), home = new THREE.Vector3(PG.x + Math.cos(ang) * rad, PG.y, PG.z + Math.sin(ang) * rad);
    const P = painter(pTag, home, 1.2), g = new THREE.Group(); g.position.copy(home); g.rotation.y = R() * 6.28; scene.add(g);
    const col = ['#8f9aa6', '#a7aeb5', '#7d8794', '#c9c4bc'][i % 4], b = P(G.catBody, col, g, 0, 0.11, 0, '#6a7480'); b.scale.set(0.07, 0.075, 0.13);
    const hd = grp(g, 0, 0.2, 0.09); P(G.catBody, '#6f8a84', hd, 0, 0, 0).scale.set(0.045, 0.045, 0.045); const bk = P(G.cone, '#d9a25a', hd, 0, 0, 0.055); bk.scale.set(0.3, 0.3, 0.3); bk.rotation.x = Math.PI / 2;
    const tl = P(G.box, '#6a7480', g, 0, 0.1, -0.15); tl.scale.set(0.07, 0.015, 0.12);
    const wings = [-1, 1].map((s) => { const w = grp(g, s * 0.05, 0.14, 0); const m = P(G.box, col, w, s * 0.11, 0, 0, '#6a7480'); m.scale.set(0.22, 0.012, 0.12); w.visible = false; return w; });
    pigeons.push({ g, hd, wings, home, mode: 'ground', t: 0, phase: R() * 6, r: 3 + R() * 2.5, h: 3 + R() * 2.5, yaw: g.rotation.y });
  }
  let pigeonsForced = 0;

  // ---- Sarajevo wildlife: ducks on the Miljacka, squirrel on walnut branch, kitten in courtyard ----
  const ducks = (world.ducks || []).map((dk, i) => {
    const dp = new THREE.Vector3(dk.x, dk.y, dk.z), DP = painter(dk.tag || 'patke', dp, 1.4), g = new THREE.Group();
    g.position.copy(dp); g.rotation.y = dk.ry || 0; scene.add(g);
    const drake = i === 0, bodyC = drake ? '#9e978c' : '#8f7254', headC = drake ? '#2b6b4c' : '#7b6046';
    const b = DP(G.catBody, bodyC, g, 0, 0.13, 0, '#6a5b48'); b.scale.set(0.16, 0.12, 0.24);
    const neck = grp(g, 0, 0.22, 0.18);
    DP(G.catBody, headC, neck, 0, 0.08, 0.02, '#1e4a34').scale.set(0.085, 0.085, 0.095);
    const bill = DP(G.box, '#e2a332', neck, 0, 0.07, 0.13, '#c4831e'); bill.scale.set(0.06, 0.026, 0.09);
    const tail = DP(G.cone, '#5a4e42', g, 0, 0.18, -0.24); tail.scale.set(1.2, 0.8, 1.2); tail.rotation.x = -0.9;
    return { g, neck, home: dp.clone(), r: dk.r || 1.6, phase: i * 2.1, speed: 0.38 + i * 0.08 };
  });

  let squirrel = null;
  if (world.squirrel) {
    const SQ = world.squirrel, sp = new THREE.Vector3(SQ.x, SQ.y, SQ.z), SP = painter(SQ.tag || 'vjeverica', sp, 1.2), g = new THREE.Group();
    g.position.copy(sp); g.rotation.y = SQ.ry || 0; scene.add(g);
    const C1 = '#a85124', C2 = '#7a3615';
    const bd = SP(G.catBody, C1, g, 0, 0.14, 0, C2); bd.scale.set(0.09, 0.11, 0.16);
    const hd = grp(g, 0, 0.24, 0.12); SP(G.catBody, C1, hd, 0, 0, 0, C2).scale.set(0.07, 0.068, 0.08);
    for (const s of [-1, 1]) SP(G.ear, C2, hd, s * 0.04, 0.07, -0.01).scale.set(0.35, 0.4, 0.35);
    const nut = SP(G.ball, '#7a5230', hd, 0, -0.05, 0.09, '#57381e'); nut.scale.setScalar(0.032);
    const tl = grp(g, 0, 0.15, -0.14);
    const t1 = SP(G.catBody, C1, tl, 0, 0.14, -0.05, C2); t1.scale.set(0.07, 0.17, 0.09); t1.rotation.x = -0.4;
    const t2 = SP(G.catBody, '#c96832', tl, 0, 0.28, -0.02, C1); t2.scale.set(0.075, 0.13, 0.08); t2.rotation.x = 0.45;
    squirrel = { g, hd, tl, home: sp.clone(), dir: new THREE.Vector3(Math.sin(SQ.ry || 0), 0, Math.cos(SQ.ry || 0)), span: SQ.span || 1.2 };
  }

  let kitten = null;
  if (world.kitten) {
    const KT = world.kitten, kp = new THREE.Vector3(KT.x, KT.y, KT.z), KP = painter(KT.tag || 'mace', kp, 1.2), g = new THREE.Group();
    g.position.copy(kp); g.rotation.y = KT.ry || 0; g.scale.setScalar(0.62); scene.add(g);
    const C1 = '#e39a4a', C2 = '#c9752f';
    const body = grp(g, 0, 0, 0);
    KP(G.catBody, C1, body, 0, 0.34, 0, C2).scale.set(0.19, 0.21, 0.36);
    const hd = grp(body, 0, 0.56, 0.34); KP(G.catBody, C1, hd, 0, 0, 0, C2).scale.set(0.18, 0.17, 0.18);
    for (const s of [-1, 1]) KP(G.ear, C2, hd, s * 0.1, 0.18, 0.02).scale.setScalar(0.95);
    const tl = grp(body, 0, 0.38, -0.35); KP(G.catTail, C1, tl, 0, 0, 0, C2); tl.rotation.x = -0.5;
    const legs = [[0.1, 0.2], [-0.1, 0.2], [0.1, -0.2], [-0.1, -0.2]].map(([x, z]) => { const lg = grp(body, x, 0.24, z); KP(G.catLeg, C1, lg, 0, 0, 0, C2); return lg; });
    kitten = { g, body, hd, tl, legs, home: kp.clone(), ry: KT.ry || 0 };
  }
  // ---- Jahorina mountain wildlife: fox, hare, owl, roe deer, wolf, crow ----
  const jahAnimals = (world.jahAnimals || []).map((o) => {
    const ap = new THREE.Vector3(o.x, o.y, o.z), AP = painter(o.tag, ap, 1.8), g = new THREE.Group();
    g.position.copy(ap); g.rotation.y = o.ry || 0; scene.add(g);
    const body = grp(g, 0, 0, 0); let hd = null, tl = null, neck = null; const legs = [], wings = [];
    if (o.kind === 'fox') {
      const C1 = '#d45c26', C2 = '#a34014', W = '#f4efe4';
      AP(G.catBody, C1, body, 0, 0.42, 0, C2).scale.set(0.18, 0.2, 0.42);
      AP(G.catBody, W, body, 0, 0.38, 0.22).scale.set(0.14, 0.14, 0.18);
      hd = grp(body, 0, 0.58, 0.4); AP(G.catBody, C1, hd, 0, 0, 0, C2).scale.set(0.14, 0.13, 0.18);
      AP(G.cone, C1, hd, 0, -0.02, 0.22, C2).rotation.x = Math.PI / 2;
      for (const s of [-1, 1]) AP(G.ear, C2, hd, s * 0.08, 0.15, -0.02).scale.set(1.1, 1.35, 1.1);
      tl = grp(body, 0, 0.44, -0.4); AP(G.catBody, C1, tl, 0, 0.04, -0.22, C2).scale.set(0.12, 0.13, 0.28);
      AP(G.ball, W, tl, 0, 0.06, -0.44).scale.setScalar(0.1);
      for (const [x, z] of [[0.1, 0.24], [-0.1, 0.24], [0.1, -0.24], [-0.1, -0.24]]) { const lg = grp(body, x, 0.3, z); AP(G.catLeg, '#362e2a', lg, 0, 0, 0).scale.set(0.95, 1.15, 0.95); legs.push(lg); }
    } else if (o.kind === 'hare') {
      const C1 = '#dcd6ca', C2 = '#b2aa9c';
      AP(G.catBody, C1, body, 0, 0.24, 0, C2).scale.set(0.16, 0.18, 0.26);
      hd = grp(body, 0, 0.42, 0.22); AP(G.catBody, C1, hd, 0, 0, 0, C2).scale.set(0.12, 0.12, 0.14);
      for (const s of [-1, 1]) { const e = AP(G.catLeg, C2, hd, s * 0.06, 0.20, -0.03); e.scale.set(0.85, 0.95, 0.6); e.rotation.z = s * -0.14; }
      tl = grp(body, 0, 0.22, -0.26); AP(G.ball, '#f8f8f4', tl, 0, 0, 0).scale.setScalar(0.085);
    } else if (o.kind === 'owl') {
      const C1 = '#7c624a', C2 = '#543f2d', W = '#e8dfd0';
      AP(G.catBody, C1, body, 0, 0.34, 0, C2).scale.set(0.2, 0.28, 0.18);
      AP(G.catBody, W, body, 0, 0.30, 0.08).scale.set(0.14, 0.2, 0.12);
      hd = grp(body, 0, 0.62, 0.02); AP(G.catBody, C1, hd, 0, 0, 0, C2).scale.set(0.17, 0.16, 0.16);
      AP(G.cone, '#d99a26', hd, 0, -0.02, 0.17).scale.set(0.38, 0.45, 0.38);
      for (const s of [-1, 1]) {
        AP(G.ear, C2, hd, s * 0.1, 0.15, 0.01);
        AP(G.ball, '#f0c438', hd, s * 0.065, 0.02, 0.14).scale.setScalar(0.035);
        const w = grp(body, s * 0.18, 0.38, -0.02); AP(G.catBody, C2, w, 0, -0.06, 0).scale.set(0.06, 0.22, 0.14); wings.push(w);
      }
    } else if (o.kind === 'roe') {
      const C1 = '#9c6e44', C2 = '#704b2c', W = '#f0eadc';
      AP(G.catBody, C1, body, 0, 0.88, 0, C2).scale.set(0.22, 0.25, 0.52);
      AP(G.ball, W, body, 0, 0.88, -0.5).scale.set(0.15, 0.17, 0.1);
      neck = grp(body, 0, 1.04, 0.42); AP(G.catBody, C1, neck, 0, 0.26, 0.1, C2).scale.set(0.095, 0.32, 0.12);
      hd = grp(neck, 0, 0.52, 0.2); AP(G.catBody, C1, hd, 0, 0, 0.06, C2).scale.set(0.09, 0.1, 0.2);
      for (const s of [-1, 1]) { const e = AP(G.ear, C2, hd, s * 0.08, 0.12, -0.04); e.scale.set(1.0, 1.5, 1.0); e.rotation.z = s * -0.35; }
      for (const [x, z] of [[0.12, 0.34], [-0.12, 0.34], [0.12, -0.34], [-0.12, -0.34]]) { const lg = grp(body, x, 0.72, z); AP(G.catLeg, C2, lg, 0, 0, 0).scale.set(0.95, 2.8, 0.95); legs.push(lg); }
    } else if (o.kind === 'wolf') {
      const C1 = '#7b8088', C2 = '#4d525a', W = '#d8dce0';
      AP(G.catBody, C1, body, 0, 0.66, 0, C2).scale.set(0.24, 0.26, 0.55);
      AP(G.catBody, W, body, 0, 0.60, 0.26).scale.set(0.20, 0.20, 0.22);
      neck = grp(body, 0, 0.82, 0.44);
      hd = grp(neck, 0, 0.14, 0.14); AP(G.catBody, C1, hd, 0, 0, 0, C2).scale.set(0.16, 0.15, 0.22);
      AP(G.catBody, W, hd, 0, -0.03, 0.22).scale.set(0.085, 0.075, 0.14);
      for (const s of [-1, 1]) AP(G.ear, C2, hd, s * 0.1, 0.16, -0.04).scale.set(1.1, 1.35, 1.1);
      tl = grp(body, 0, 0.66, -0.52); AP(G.catBody, C2, tl, 0, -0.14, -0.14).scale.set(0.09, 0.24, 0.11);
      for (const [x, z] of [[0.13, 0.34], [-0.13, 0.34], [0.13, -0.34], [-0.13, -0.34]]) { const lg = grp(body, x, 0.52, z); AP(G.catLeg, C2, lg, 0, 0, 0).scale.set(1.1, 2.0, 1.1); legs.push(lg); }
    } else if (o.kind === 'crow') {
      const C1 = '#24272c', C2 = '#14161a';
      AP(G.catBody, C1, body, 0, 0.22, 0, C2).scale.set(0.12, 0.13, 0.24);
      hd = grp(body, 0, 0.34, 0.18); AP(G.ball, C1, hd, 0, 0, 0, C2).scale.setScalar(0.095);
      const bk = AP(G.cone, '#3a3e44', hd, 0, -0.01, 0.14); bk.scale.set(0.32, 0.7, 0.32); bk.rotation.x = Math.PI / 2;
      tl = grp(body, 0, 0.2, -0.24); AP(G.box, C2, tl, 0, 0, -0.06).scale.set(0.12, 0.03, 0.18);
      for (const s of [-0.05, 0.05]) rod(AP, body, [s, 0.12, 0], [s, 0, 0], 0.01, '#3a3e44');
    }
    return { o, g, body, hd, tl, neck, legs, wings, home: ap.clone(), phase: R() * 6 };
  });
  // ---- Neum Adriatic coastal & marine wildlife: seagull, dolphin, crab, octopus, jellyfish, lizard ----
  const neuAnimals = (world.neuAnimals || []).map((o) => {
    const ap = new THREE.Vector3(o.x, o.y, o.z), AP = painter(o.tag, ap, 2.2), g = new THREE.Group();
    g.position.copy(ap); g.rotation.y = o.ry || 0; scene.add(g);
    const body = grp(g, 0, 0, 0); let hd = null, tl = null; const legs = [], wings = [], armsA = [];
    if (o.kind === 'gull') {
      const W = '#fbfaf6', G1 = '#8e9aa6', BK = '#e6a828';
      AP(G.catBody, W, body, 0, 0.24, 0, '#dce2e8').scale.set(0.13, 0.13, 0.28);
      hd = grp(body, 0, 0.36, 0.22); AP(G.ball, W, hd, 0, 0, 0).scale.setScalar(0.095);
      const bk = AP(G.cone, BK, hd, 0, -0.01, 0.15); bk.scale.set(0.32, 0.72, 0.32); bk.rotation.x = Math.PI / 2;
      tl = grp(body, 0, 0.24, -0.28); AP(G.box, W, tl, 0, 0, -0.08).scale.set(0.14, 0.025, 0.18);
      for (const s of [-1, 1]) {
        const w = grp(body, s * 0.10, 0.28, 0.02);
        const wm = AP(G.box, G1, w, s * 0.30, 0, -0.02, '#6c7884'); wm.scale.set(0.62, 0.026, 0.19);
        const wt = AP(G.box, '#2b3036', w, s * 0.58, 0, -0.04); wt.scale.set(0.16, 0.024, 0.13);
        if (!o.fly) { w.rotation.z = s * -1.15; w.scale.set(0.55, 1, 0.85); }
        wings.push(w);
      }
      if (!o.fly) for (const s of [-0.05, 0.05]) rod(AP, body, [s, 0.14, 0], [s, 0, 0], 0.011, BK);
    } else if (o.kind === 'dolphin') {
      const C1 = '#6f8ea8', C2 = '#4a6680', BL = '#d8e4ee';
      AP(G.catBody, C1, body, 0, 0, 0, C2).scale.set(0.28, 0.30, 0.92);
      AP(G.catBody, BL, body, 0, -0.09, 0.05).scale.set(0.22, 0.18, 0.74);
      const snout = AP(G.cone, C1, body, 0, -0.04, 1.02, C2); snout.scale.set(1.1, 1.4, 1.1); snout.rotation.x = Math.PI / 2;
      const dorsal = AP(G.ear, C2, body, 0, 0.34, -0.06); dorsal.scale.set(0.9, 2.2, 1.8); dorsal.rotation.x = -0.35;
      for (const s of [-1, 1]) { const fl = AP(G.box, C2, body, s * 0.34, -0.10, 0.24); fl.scale.set(0.32, 0.04, 0.16); fl.rotation.z = s * -0.45; }
      tl = grp(body, 0, 0, -0.92);
      AP(G.catBody, C2, tl, 0, 0, -0.22).scale.set(0.12, 0.12, 0.32);
      const fluke = AP(G.box, C2, tl, 0, 0, -0.52); fluke.scale.set(0.62, 0.045, 0.24);
    } else if (o.kind === 'crab') {
      const C1 = '#d94c2c', C2 = '#a33218';
      AP(G.catBody, C1, body, 0, 0.15, 0, C2).scale.set(0.24, 0.11, 0.19);
      for (const s of [-1, 1]) {
        AP(G.ball, '#1e2024', body, s * 0.08, 0.25, 0.12).scale.setScalar(0.028);
        const cl = grp(body, s * 0.18, 0.16, 0.18);
        AP(G.catBody, C1, cl, s * 0.06, 0.02, 0.10, C2).scale.set(0.08, 0.065, 0.12);
        armsA.push(cl);
        for (const z of [-0.10, 0, 0.09]) { const lg = grp(body, s * 0.22, 0.13, z); rod(AP, lg, [0, 0, 0], [s * 0.18, -0.12, z * 0.3], 0.018, C2); legs.push(lg); }
      }
    } else if (o.kind === 'octopus') {
      const C1 = '#c45848', C2 = '#8f3a2e';
      AP(G.catBody, C1, body, 0, 0.34, 0, C2).scale.set(0.24, 0.28, 0.26);
      for (const s of [-1, 1]) AP(G.ball, '#f2e8c8', body, s * 0.12, 0.26, 0.20).scale.setScalar(0.045);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const tn = grp(body, Math.cos(ang) * 0.16, 0.14, Math.sin(ang) * 0.16);
        tn.rotation.y = -ang;
        rod(AP, tn, [0, 0, 0], [0.32, -0.08, 0.06], 0.042, C1);
        rod(AP, tn, [0.32, -0.08, 0.06], [0.56, 0.04, -0.04], 0.026, C2);
        armsA.push(tn);
      }
    } else if (o.kind === 'jellyfish') {
      const C1 = '#d89ce6', C2 = '#b372c4';
      const dome = AP(G.cap, C1, body, 0, 0.22, 0, C2); dome.scale.set(2.2, 1.9, 2.2);
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const tn = grp(body, Math.cos(ang) * 0.10, 0.14, Math.sin(ang) * 0.10);
        rod(AP, tn, [0, 0, 0], [Math.cos(ang) * 0.05, -0.44, Math.sin(ang) * 0.05], 0.015, '#e8c4f2');
        armsA.push(tn);
      }
    } else if (o.kind === 'lizard') {
      const C1 = '#589c42', C2 = '#396e28';
      AP(G.catBody, C1, body, 0, 0.08, 0, C2).scale.set(0.08, 0.06, 0.22);
      hd = grp(body, 0, 0.09, 0.24); AP(G.catBody, C1, hd, 0, 0, 0.04, C2).scale.set(0.065, 0.05, 0.10);
      tl = grp(body, 0, 0.07, -0.22); rod(AP, tl, [0, 0, 0], [0, -0.02, -0.36], 0.022, C2);
      for (const [x, z] of [[0.08, 0.12], [-0.08, 0.12], [0.08, -0.10], [-0.08, -0.10]]) {
        const lg = grp(body, x, 0.06, z); rod(AP, lg, [0, 0, 0], [Math.sign(x) * 0.09, -0.06, 0.02], 0.014, C2); legs.push(lg);
      }
    }
    return { o, g, body, hd, tl, legs, wings, armsA, home: ap.clone(), phase: R() * 6 };
  });
  // ---- Banja Luka river & park wildlife: heron, otter, hedgehog, sparrow, ladybug, goose ----
  const blAnimals = (world.blAnimals || []).map((o) => {
    const ap = new THREE.Vector3(o.x, o.y, o.z), AP = painter(o.tag, ap, 2.0), g = new THREE.Group();
    g.position.copy(ap); g.rotation.y = o.ry || 0; scene.add(g);
    const body = grp(g, 0, 0, 0); let hd = null, neck = null, tl = null; const legs = [], wings = [];
    if (o.kind === 'heron') {
      const C1 = '#96a4b0', C2 = '#6a7886', W = '#f2f4f6';
      for (const s of [-0.08, 0.08]) rod(AP, body, [s, 0.72, 0], [s, 0, 0], 0.018, '#5a5244');
      AP(G.catBody, C1, body, 0, 0.84, 0, C2).scale.set(0.18, 0.22, 0.38);
      neck = grp(body, 0, 0.96, 0.28);
      rod(AP, neck, [0, 0, 0], [0, 0.42, 0.08], 0.042, W);
      hd = grp(neck, 0, 0.46, 0.10);
      AP(G.catBody, W, hd, 0, 0, 0, C1).scale.set(0.08, 0.08, 0.13);
      const bk = AP(G.cone, '#e4a828', hd, 0, -0.01, 0.24); bk.scale.set(0.32, 1.4, 0.32); bk.rotation.x = Math.PI / 2;
    } else if (o.kind === 'otter') {
      const C1 = '#6e4a30', C2 = '#4a301d';
      AP(G.catBody, C1, body, 0, 0.22, 0, C2).scale.set(0.18, 0.16, 0.46);
      hd = grp(body, 0, 0.34, 0.42); AP(G.catBody, C1, hd, 0, 0, 0, C2).scale.set(0.13, 0.11, 0.15);
      AP(G.catBody, '#d8c8b0', hd, 0, -0.03, 0.12).scale.set(0.08, 0.06, 0.07);
      tl = grp(body, 0, 0.18, -0.44); rod(AP, tl, [0, 0, 0], [0, -0.06, -0.46], 0.05, C2);
    } else if (o.kind === 'hedgehog') {
      const C1 = '#6e5848', C2 = '#4a3a2e';
      AP(G.catBody, C1, body, 0, 0.18, 0, C2).scale.set(0.20, 0.18, 0.25);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        coneH(AP, C2, body, Math.cos(a) * 0.14, 0.26, Math.sin(a) * 0.16);
      }
      hd = grp(body, 0, 0.14, 0.24); AP(G.cone, '#c8b49a', hd, 0, 0, 0.06).rotation.x = Math.PI / 2;
    } else if (o.kind === 'sparrow') {
      const C1 = '#8e6844', C2 = '#5e4228';
      AP(G.catBody, C1, body, 0, 0.14, 0, C2).scale.set(0.085, 0.09, 0.14);
      hd = grp(body, 0, 0.22, 0.10); AP(G.ball, C2, hd, 0, 0, 0).scale.setScalar(0.065);
      const bk = AP(G.cone, '#d4a238', hd, 0, -0.01, 0.09); bk.scale.set(0.24, 0.45, 0.24); bk.rotation.x = Math.PI / 2;
      for (const s of [-0.035, 0.035]) rod(AP, body, [s, 0.07, 0], [s, 0, 0], 0.008, '#4a3828');
    } else if (o.kind === 'ladybug') {
      AP(G.cap, '#d92e28', body, 0, 0.05, 0, '#9e1c18').scale.set(2.2, 2.0, 2.6);
      AP(G.ball, '#1e2024', body, 0, 0.12, 0.24).scale.setScalar(0.095);
      for (const [sx, sz] of [[-0.10, 0.06], [0.10, 0.06], [-0.11, -0.08], [0.11, -0.08], [0, -0.14]]) {
        AP(G.ball, '#1e2024', body, sx, 0.24, sz).scale.setScalar(0.042);
      }
    } else if (o.kind === 'goose') {
      const W = '#faf8f2', B = '#e68c28';
      AP(G.catBody, W, body, 0, 0.36, 0, '#dcd6c6').scale.set(0.20, 0.20, 0.36);
      neck = grp(body, 0, 0.48, 0.26);
      rod(AP, neck, [0, 0, 0], [0, 0.34, 0.06], 0.052, W);
      hd = grp(neck, 0, 0.36, 0.08); AP(G.ball, W, hd, 0, 0, 0).scale.setScalar(0.085);
      const bk = AP(G.box, B, hd, 0, -0.01, 0.12); bk.scale.set(0.06, 0.036, 0.12);
      for (const s of [-0.08, 0.08]) rod(AP, body, [s, 0.20, 0], [s, 0, 0], 0.018, B);
    }
    return { o, g, body, hd, neck, tl, legs, wings, home: ap.clone(), phase: R() * 6 };
  });
  function coneH(AP, col, parent, x, y, z) { const m = AP(G.cone, col, parent, x, y, z); m.scale.set(0.45, 0.55, 0.45); return m; }
  let fishT0 = 0;      // the fish's jumps count from here (the finale sets it so one comes early in the diver's shot)
  const FS = world.fish || { x: 0, z: 0 }, fishHome = new THREE.Vector3(FS.x, 0.55, FS.z), fish = new THREE.Group(); fish.position.copy(fishHome); fish.rotation.x = -0.7;
  if (world.fish) {
    const FP = painter('fish', fishHome, 1); scene.add(fish);
    FP(G.catBody, '#9fb6c2', fish, 0, 0, 0, '#6f8a9a').scale.set(0.05, 0.1, 0.24);
    const t = FP(G.ear, '#6f8a9a', fish, 0, 0, -0.27); t.scale.set(0.5, 1.3, 1.6); t.rotation.x = Math.PI / 2;
  }
  const birdD = new THREE.Vector3();

  // ---- smoke from a chimney: still curls in the sketch, then it rises and drifts ----
  const smokes = (world.smoke || []).map((SM, k) => {
    const SMP = painter('smoke', new THREE.Vector3(SM.x, SM.y + 1.6, SM.z), 3.6);
    return { SM, k, puffs: Array.from({ length: 9 }, (_, i) => SMP(G.ball, i % 2 ? '#e2dfd8' : '#d0ccc4', scene, 0, 0, 0, '#b4b0a8')) };
  });
  // ---- the šadrvan: eight thin streams fall from the rim of its upper bowl into the basin (still in the sketch) ----
  const FT = world.fountain || { x: 0, y: 0, z: 0 }, FTP = world.fountain ? painter(world.fountainTag || 'fountain', new THREE.Vector3(FT.x, FT.y + 1.6, FT.z), 2.4) : null;
  const FALL = 0.574, DROPS = 16, R0F = 0.86, R1F = 1.3, Y0F = FT.y + 2.29, VY0 = 0.25;      // seconds to fall; from the rim to the water
  const streams = Array.from({ length: world.fountain ? 8 : 0 }, (_, i) => {
    const a = (i + 0.5) * Math.PI / 4, dx = Math.sin(a), dz = Math.cos(a);
    return { dx, dz, drops: Array.from({ length: DROPS }, () => { const m = FTP(G.ball, '#bfe4ea', scene, 0, 0, 0, '#7fc0cc'); m.clear(); m.scale.set(0.024, 0.075, 0.024); return m; }) };
  });
  const flow = (time) => {
    for (const s of streams) s.drops.forEach((m, k) => {
      const u = ((k / DROPS) + time / FALL) % 1, t = u * FALL, r = R0F + (R1F - R0F) * u;
      m.position.set(FT.x + s.dx * r, Y0F + VY0 * t - 4.9 * t * t, FT.z + s.dz * r);
    });
  };
  flow(0);
  // ---- the traffic light by the road: red until the town wakes, then it cycles ----
  const lamps = [];
  if (world.light) {
  const TL = world.light, tlp = new THREE.Vector3(TL.x, TL.y, TL.z), TLP = painter('light', tlp, 2.6), tlg = new THREE.Group(); tlg.position.copy(tlp); scene.add(tlg);
  rod(TLP, tlg, [0, 0, 0], [0, 3, 0], 0.06, '#3a3e42');
  { const h = TLP(G.box, '#2e3236', tlg, 0, 3.45, 0, '#1e2124'); h.scale.set(0.34, 1.05, 0.3); }
  const DIM = ['#5a2a26', '#5a4a22', '#22482e'], ON = ['#ee3a2a', '#f6c22a', '#3fcf62'];
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
    const y = 3.45 + (1 - i) * 0.32, z = sd * 0.15;
    TLP(G.disc, DIM[i], tlg, 0, y, z).scale.set(0.11, 0.11, 0.02);
    const on = TLP(G.disc, ON[i], tlg, 0, y, z + sd * 0.012); on.scale.set(0.112, 0.112, 0.02); on.visible = i === 0; lamps.push({ on, i });
    TLP(G.box, '#2e3236', tlg, 0, y + 0.13, z + sd * 0.07).scale.set(0.24, 0.02, 0.13);
  }
  block(TL.x, TL.y + 1.5, TL.z, 0.2, 3, 0.2, { wall: true }); block(TL.x, TL.y + 3.45, TL.z, 0.36, 1.07, 0.34, { orb: 'semafor' });
  }
  // ---- the flag in front of the school: hangs still in the sketch, then waves ----
  const cloth = []; let waveFlag = () => {};
  if (world.flag) {
  const FL = world.flag, flp = new THREE.Vector3(FL.x, FL.y, FL.z), FLP = painter('flag', flp.clone().setY(FL.y + FL.h - 0.7), 2.4), flg = new THREE.Group(); flg.position.copy(flp); scene.add(flg);
  rod(FLP, flg, [0, 0, 0], [0, FL.h + 0.1, 0], 0.06, '#d9d6cf');
  FLP(G.ball, '#c9a23a', flg, 0, FL.h + 0.14, 0, '#a07a25').scale.setScalar(0.11);
  const FW = 2.1, FH = 1.05, ftop = FL.h - 0.08;
  // a piece of the cloth: a fine grid bent into shape (u across, v down), so it can ripple with the rest
  const piece = (shape, col, bleed, z, nu = 12, nv = 6) => {
    const geo = new THREE.PlaneGeometry(1, 1, nu, nv), pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) { const [x, y] = shape(pa.getX(i) + 0.5, 0.5 - pa.getY(i)); pa.setXYZ(i, x, ftop - y, z); }
    const back = geo.clone(), ix = back.index.array;     // figures are one-sided: the cloth needs a face on each side
    for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 2]; ix[i + 2] = t; }
    for (const g of [geo, back]) {
      g.computeVertexNormals();
      const m = FLP(g, col, flg, 0, 0, 0, bleed); m.clear();     // no outline shell: on a flat cloth it would cover the whole face
      cloth.push({ m, base: Float32Array.from(m.geometry.attributes.position.array), z });
    }
  };
  piece((u, v) => [0.06 + u * FW, v * FH], '#1f3f9a', '#132c73', 0, 16, 8);                                  // blue field
  for (const z of [0.012, -0.012]) {
    piece((u, v) => { const xl = 0.255 + v * 0.46, xr = 0.715; return [0.06 + (xl + u * (xr - xl)) * FW, v * FH]; }, '#f2c230', '#d9a625', z);   // yellow triangle
    for (let k = 0; k < 7; k++) {         // the stars along its long side
      const cx = 0.17 + k * 0.077, cy = (k + 0.4) / 7.4, r = 0.035;
      piece((u, v) => [0.06 + (cx + (u - 0.5) * r * 2) * FW, (cy + (v - 0.5) * r * 2 * FW / FH) * FH], '#fbf7ec', '#e6dfd0', z * 1.6, 2, 2);
    }
  }
  block(FL.x, FL.y + FL.h / 2, FL.z, 0.16, FL.h, 0.16, { wall: true }); block(FL.x + 0.06 + FW / 2, FL.y + ftop - FH / 2 - 0.06, FL.z, FW + 0.1, FH + 0.2, 0.36, { wall: true });     // the cloth (thick enough for its ripple) block(FL.x, FL.y + FL.h + 0.12, FL.z, 0.3, 0.12, 0.3, { orb: 'zastava' });
  // its ink outline, bent with the cloth (a flat cloth gets no outline shell, so it is drawn as a line)
  const rim = [];
  for (let i = 0; i < 16; i++) rim.push([0.06 + (i / 16) * FW, 0]);
  for (let i = 0; i < 8; i++) rim.push([0.06 + FW, (i / 8) * FH]);
  for (let i = 16; i > 0; i--) rim.push([0.06 + (i / 16) * FW, FH]);
  for (let i = 8; i > 0; i--) rim.push([0.06, (i / 8) * FH]);
  const rimGeo = new LineSegmentsGeometry().setPositions(new Float32Array(rim.length * 6)), rimLine = new LineSegments2(rimGeo, inkMaterial);
  rimLine.frustumCulled = false; flg.add(rimLine);
  const bend = (x, y, t, alive) => {      // -> [height, sideways] of a point of the cloth
    const u = Math.max(0, x - 0.06) / FW;
    const ripple = alive ? Math.sin(x * 2.6 - t * 5.2 + y * 0.6) * 0.16 + Math.sin(x * 4.1 - t * 7.9) * 0.05 : Math.sin(x * 2.6 + y * 0.6) * 0.07;
    return [y - (alive ? 0.04 : 0.12) * u * u, ripple * u];
  };
  waveFlag = (t, alive) => {
    for (const { m, base, z } of cloth) {
      const pa = m.geometry.attributes.position;
      for (let i = 0; i < pa.count; i++) { const [y, dz] = bend(base[i * 3], base[i * 3 + 1], t, alive); pa.setY(i, y); pa.setZ(i, z + dz); }
      pa.needsUpdate = true;
    }
    const ra = rimGeo.attributes.instanceStart.data, arr = ra.array;
    rim.forEach(([x, v], i) => {
      const [x2, v2] = rim[(i + 1) % rim.length], [ya, za] = bend(x, ftop - v, t, alive), [yb, zb] = bend(x2, ftop - v2, t, alive);
      arr.set([x, ya, za, x2, yb, zb], i * 6);
    });
    ra.needsUpdate = true;
  };
  waveFlag(0, false);
  }

  // ---- the football ----
  const kickers = list.filter((p) => p.o.ball !== undefined).sort((a, b) => a.o.ball - b.o.ball);
  const ballHome = new THREE.Vector3(...(world.ball || [31.2, 12.29, 76.2])), ball = kickers.length ? painter('ball', ballHome, 1)(G.ball, '#f8f4ea', scene, 0, 0, 0, '#cfd6d8') : new THREE.Object3D();
  ball.scale.setScalar(0.17); ball.position.copy(ballHome);
  const ballBlock = kickers.length ? block(ballHome.x, ballHome.y, ballHome.z, 0.4, 0.4, 0.4, { wall: true, person: true }) : new THREE.Object3D(), dogP = new THREE.Vector3();
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), tmpC = new THREE.Vector3();

  // ---- the slide: where the sliding child is at each moment of its round ----
  const SLD = world.slide || { x: 0, y: 0, z: 0 }, kidS = 1.05 * 0.66, seatDrop = 0.36 * 0.66;
  const WALK = [[-6.1, 0, 0], [-6.1, 0, 1.7], [2.3, 0, 1.7], [2.0, 0, 0]].map((a) => new THREE.Vector3(...a));
  const TOPSEAT = new THREE.Vector3(-0.45, 1.96 - seatDrop, 0), FOOT = new THREE.Vector3(-5.35, 0.28 - seatDrop, 0), LAND = new THREE.Vector3(0.45, 1.96, 0);
  // the climb: the foot of the ladder, each of its five rungs, then the platform (the rungs are built in world.js)
  const CLIMB = [new THREE.Vector3(1.78, 0, 0), ...[0, 1, 2, 3, 4].map((i) => new THREE.Vector3(1.52 - i * 0.18 + 0.03, 0.3 + i * 0.37 + 0.035, 0)), LAND];
  function slideAt(T, out) {    // returns: sit (0..1), facing, walking (0..1)
    const t = T % 10.5; let sit = 0, ry = -Math.PI / 2, walk = 0;
    if (t < 1.2) { out.lerpVectors(TOPSEAT, FOOT, (t / 1.2) ** 1.6); sit = 1; }
    else if (t < 1.8) { const u = sm((t - 1.2) / 0.6); out.lerpVectors(FOOT, WALK[0], u); sit = 1 - u; }
    else if (t < 7) {
      const u = (t - 1.8) / 5.2 * 11.83; walk = 1;
      if (u < 1.7) { out.lerpVectors(WALK[0], WALK[1], u / 1.7); ry = 0; } else if (u < 10.1) { out.lerpVectors(WALK[1], WALK[2], (u - 1.7) / 8.4); ry = Math.PI / 2; } else { out.lerpVectors(WALK[2], WALK[3], (u - 10.1) / 1.73); ry = Math.PI; }
    } else if (t < 7.3) { out.lerpVectors(WALK[3], CLIMB[0], (t - 7) / 0.3); walk = 1; }
    else if (t < 8.6) {         // one rung at a time: a quick step up, a short pause
      const u = (t - 7.3) / 1.3 * (CLIMB.length - 1), i = Math.min(CLIMB.length - 2, Math.floor(u)), f = u - i;
      out.lerpVectors(CLIMB[i], CLIMB[i + 1], sm(Math.min(1, f / 0.6))); return [0, ry, 0, i % 2 ? f : -f || 0.01];
    }
    else if (t < 9.2) { const u = sm((t - 8.6) / 0.6); out.lerpVectors(LAND, TOPSEAT, u); sit = u; }
    else { out.copy(TOPSEAT); sit = 1; }
    return [sit, ry, walk, 0];
  }

  // ---- the cat ----
  const C = world.cat || { x: 0, y: -999, z: 0, x0: 0, x1: 0 }, cpos = new THREE.Vector3(C.x, C.y, C.z);
  const cat = new THREE.Group(); cat.position.copy(cpos);
  const cbody = new THREE.Group(); cat.add(cbody);
  const chead = new THREE.Group(); chead.position.set(0.38, 0.6, 0); cbody.add(chead);
  const ctail = new THREE.Group(); ctail.position.set(-0.4, 0.4, 0); cbody.add(ctail);
  const clegs = [[0.24, 0.1], [0.24, -0.1], [-0.24, 0.1], [-0.24, -0.1]].map(([x, z]) => { const g = new THREE.Group(); g.position.set(x, 0.26, z); cbody.add(g); return g; });
  if (world.cat) {
    scene.add(cat);
    const ctm = timing('cat', cpos), cmat = washMat('cat');
    const CP = (geo, parent, x, y, z, sx = 1, sy = 1, sz = 1, col = '#e39a4a') => {
      const m = new THREE.Mesh(paintGeo(geo, { col, bleed: '#c9752f', seed: [C.x, C.y + 0.4, C.z], radius: 1.4, delay: ctm.delay, dur: 3, hatch: 0.4 }), cmat);
      m.position.set(x, y, z); m.scale.set(sx, sy, sz); addHull(m, 1.5); parent.add(m); return m;
    };
    CP(G.catBody, cbody, 0, 0.36, 0, 0.4, 0.22, 0.19);
    CP(G.catBody, chead, 0, 0, 0, 0.2, 0.19, 0.2); for (const s of [-1, 1]) CP(G.ear, chead, 0.02, 0.2, s * 0.11);
    CP(G.catTail, ctail, 0, 0, 0);
    for (const g of clegs) CP(G.catLeg, g, 0, 0, 0);
  }
  const catS = { walk: 0, x: C.x, dir: 1, rest: 2 };
  const CAT_SIT = { tilt: 0.5, drop: 0.04, front: 1.17, hind: 0.95, walkY: 0.0 };

  return {
    flagCloth: cloth, animals,
    list, cat, ball, ducks,
    fishJumpAt(t) { fishT0 = t; },
    applaud() { for (const p of list) if (p.o.kind === 'watch') p.cheer = true; },
    launchPigeons(dur = 9) { pigeonsForced = dur; for (const q of pigeons) { q.mode = 'fly'; q.t = 0; q.back = 0; for (const w of q.wings) w.visible = true; } this.onScatter?.(); },
    update(dt, time, life, bird) {
      const mv = this.movers = [];      // whatever is walking this frame (where, which way, how wide): main.js lifts the bird out of their way
      const go = (pos, ry, r, h, v = 1.2) => mv.push({ x: pos.x, y: pos.y, z: pos.z, fx: Math.sin(ry), fz: Math.cos(ry), r, h, v });      // v: how fast it comes (the faster, the sooner the bird must go)
      const alive = life > 0.5;
      for (const p of list) {
        const t = time * (alive ? 1 : 0) + p.phase, [a0, a1] = p.arms, o = p.o;
        if (o.kind === 'walk' || o.kind === 'bike' || o.kind === 'skate') {
          const speed = o.speed || 1.25;
          if (alive && o.dog) {      // with a dog: a loop with a U-turn at each end (turning away from the dog, so it stays on the outside), never a turn on the spot
            p.loopS = (p.loopS + dt * speed) % loopLen(p); loopAt(p, p.loopS);
          } else if (alive) {
            p.s += p.dir * dt * speed / p.from.distanceTo(p.to); if (p.s > 1 || p.s < 0) { p.dir *= -1; p.s = Math.min(1, Math.max(0, p.s)); }
            p.root.position.lerpVectors(p.from, p.to, p.s);
            const want = Math.atan2((p.to.x - p.from.x) * p.dir, (p.to.z - p.from.z) * p.dir);
            p.root.rotation.y += Math.atan2(Math.sin(want - p.root.rotation.y), Math.cos(want - p.root.rotation.y)) * k(o.kind === 'bike' ? 2.5 : 5, dt);
          }
          if (alive) {
            p.block.matrixWorld.setPosition(p.root.position.x, p.root.position.y + p.sc, p.root.position.z);
            go(p.root.position, p.root.rotation.y, (o.kind === 'bike' ? 0.9 : 0.45) * p.sc, 1.9 * p.sc, speed);
          }
          if (o.kind === 'bike') {
            const ph = alive ? t * 5.2 : 1.1;
            p.legs.forEach((l, i) => { const s = Math.sin(ph + i * Math.PI); l.hip.rotation.x = -1.0 + s * 0.45; l.knee.rotation.x = 1.25 - s * 0.55; });
            if (alive) for (const w of p.wheels) w.rotation.x += dt * speed / 0.37;
            p.hips.position.y = 1.03;
          } else {
            const run = speed > 2, cad = 5.2 * Math.sqrt(speed / 1.25) / Math.sqrt(p.sc), sw = alive ? Math.sin(t * cad) * (run ? 0.85 : 0.5) : run ? 0.85 : 0.42;
            p.legs.forEach((l, i) => { const s = i ? sw : -sw; l.hip.rotation.x = s - (run ? 0.15 : 0); l.knee.rotation.x = Math.max(0, -s) * (run ? 1.5 : 0.9) + (run ? 0.35 : 0); });
            a0.sh.rotation.x = sw * (run ? 1 : 0.6); if (!o.dog) a1.sh.rotation.x = -sw * (run ? 1 : 0.6); // the hips sit as high as the lower foot reaches (bent knees: lower), so a foot is always on the ground; then the stride's bounce
            if (o.kind === 'skate') {      // skating: a long push to one side, then the other, arms out for balance
              const g = alive ? Math.sin(t * 2.2) : 0.6;
              p.legs.forEach((l, k) => { const s = k ? 1 : -1, push = Math.max(0, g * s); l.hip.rotation.set(0.25 * push, 0, s * 0.32 * push); l.knee.rotation.x = 0.35 - 0.2 * push; });
              for (const a of p.arms) { a.sh.rotation.set(-0.2, 0, a.s * 0.7); a.el.rotation.x = -0.3; } p.torso.rotation.x = 0.25; p.torso.rotation.y = g * 0.2;
            }
            if (run) {      // a run: push off behind, heel kicks up as the knee folds, the leg swings through and reaches to land;
              // arms pump against the legs, shoulders twist with them, the head stays steady, a slight forward lean
              const cyc = (Z_LAND - Z_OFF) * p.root.scale.x / STANCE;      // metres per cycle (two steps): the planted foot moves back exactly as fast as he runs
              const u0 = alive ? (t * speed / cyc) % 1 : 0.2, hipY = runHipY((u0 * 2) % 1);
              p.legs.forEach((l, k) => {
                const u = (u0 + k * 0.5) % 1; [l.hip.rotation.x, l.knee.rotation.x] = runLeg(u, hipY);
                const flat = u < STANCE ? 1 : Math.max(0, 1 - (u - STANCE) / 0.12, (u - 0.85) / 0.15);      // the planted foot lies flat on the street; in the air it hangs with the shin
                l.foot.rotation.x = Math.PI / 2 - flat * (l.hip.rotation.x + l.knee.rotation.x);
              });
              p.arms.forEach((a, k) => {      // each arm swings against the leg on its own side; the elbow folds more as the arm comes forward
                const fw = -Math.cos(2 * Math.PI * ((u0 + k * 0.5 + 0.08) % 1));
                a.sh.rotation.set(-0.15 - 0.65 * fw, 0, a.s * 0.1); a.el.rotation.x = -1.3 - 0.35 * Math.max(0, fw);
              });
              const tw = Math.cos(2 * Math.PI * (u0 + 0.08));
              p.torso.rotation.x = 0.16; p.torso.rotation.y = -0.12 * tw; p.head.rotation.y = 0.1 * tw; p.head.rotation.x = -0.1;
              p.runHipY = hipY;
            }
            const reach = p.legs.length ? Math.max(...p.legs.map((l) => 0.42 * Math.cos(l.hip.rotation.x) + 0.42 * Math.cos(l.hip.rotation.x + l.knee.rotation.x) + 0.08)) : 0.92;
            p.hips.position.y = run ? p.runHipY : reach;      // (a run sets its own height: the planted foot is solved onto the ground, and he is airborne between steps)
            if (p.legs.length && !run) {      // then exactly: the lowest point of either foot onto the ground
              p.root.updateMatrixWorld(true); let low = Infinity;
              for (const l of p.legs) { const pa = l.foot.geometry.attributes.position; for (let k = 0; k < pa.count; k++) low = Math.min(low, tmpA.fromBufferAttribute(pa, k).applyMatrix4(l.foot.matrixWorld).y); }
              p.hips.position.y -= (low - p.root.position.y) / p.root.scale.y;
            }
            if (!run) p.hips.position.y += alive ? Math.abs(Math.cos(t * cad)) * 0.015 : 0;
            // (the run's lean and arms are set above)     // leaning in, elbows bent: running
            if (o.dog) {
              const ds = alive ? Math.sin(t * 11) * 0.5 : 0.3;
              p.dogLegs.forEach((l, i) => { l.rotation.x = (i === 0 || i === 3 ? ds : -ds); });
              p.dogTail.rotation.z = alive ? Math.sin(t * 9) * 0.5 : 0.2; p.dogHead.rotation.y = alive ? Math.sin(t * 0.8) * 0.3 : 0.25; p.dog.position.y = alive ? Math.abs(Math.sin(t * 11)) * 0.02 : 0;
              p.dog.getWorldPosition(dogP); p.dogBlock.matrixWorld.setPosition(dogP.x, dogP.y + 0.4, dogP.z);
              if (alive && (p.nextBark = (p.nextBark ?? 3 + R() * 5) - dt) <= 0) { p.nextBark = 10 + R() * 10; p.barkT = 0; this.onBark?.(dogP); }      // a bark every 10 to 20 s: a few on every lap (about 40 s)
              // a bark: two woofs (at 0 and 0.4 s, as in the sound). For each the nose comes up, the jaw drops and the head snaps
              // forward and down; the tail stands up meanwhile
              p.barkT += dt;
              const woof = (t0) => { const u = (p.barkT - t0) / 0.22; return u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0; }, wf = Math.max(woof(0), woof(0.4)), barking = p.barkT < 0.75;
              p.dogHead.rotation.x = -0.35 * wf + (barking ? 0.06 : 0); p.dogJaw.rotation.x = 0.55 * wf;
              if (barking) { p.dogHead.rotation.y *= 0.3; p.dogTail.rotation.x = -1.3; p.dogTail.rotation.z *= 0.4; } else p.dogTail.rotation.x = -0.9;
              if (alive) go(dogP, p.root.rotation.y, 0.5, 0.7);      // a bark now and then (the sound is played in main.js)
            }
          }
        } else if (o.kind === 'watch') {
          if (p.cheer && alive) {
            const want = Math.atan2(0.5 - o.x, 10.5 - o.z); p.root.rotation.y += (want - p.root.rotation.y) * k(3, dt); p.head.rotation.x = 0.4; p.torso.rotation.x = 0.12;      // looking down at the water where he landed
            const f = p.f ||= 2.2 + R() * 1.5, wave = Math.sin(t * 0.31 * f + p.phase * 2) > 0.2, j = Math.max(0, Math.sin(t * f)) ** 2;
            p.root.position.y = p.y0 + j * (wave ? 0.16 : 0.06);
            for (const a of p.arms) {
              if (wave) { a.sh.rotation.x += (-2.4 + Math.sin(t * 2.3 * f + a.s) * 0.25 - a.sh.rotation.x) * k(8, dt); a.sh.rotation.z = a.s * 0.5; a.el.rotation.x = -0.25; }     // arms up and apart in a V, cheering (hands clear of the head)
              else { a.sh.rotation.x += (-1.15 - a.sh.rotation.x) * k(8, dt); a.sh.rotation.z = -a.s * (0.3 + 0.16 * Math.sin(t * 6.5 * f)); a.el.rotation.x = -0.6; }                    // clapping
            }
          } else { a0.sh.rotation.x += ((o.look === 0 ? -2.2 : 0) - a0.sh.rotation.x) * k(5, dt); a0.sh.rotation.z = o.look === 0 ? 0.5 : -0.08; a1.sh.rotation.x += (0 - a1.sh.rotation.x) * k(5, dt); a1.sh.rotation.z = 0.08; }
          p.head.rotation.y = alive ? Math.sin(t * 0.7) * 0.25 : 0; p.torso.rotation.y = alive && !p.cheer ? Math.sin(t * 0.4) * 0.1 : 0;
        } else if (o.kind === 'sit') {
          a0.sh.rotation.x = -0.55 + (alive ? Math.sin(t * 2.6) * 0.4 : 0); a1.sh.rotation.x = -0.3 + (alive ? Math.sin(t * 1.9 + 1) * 0.25 : 0);
          p.head.rotation.y = alive ? Math.sin(t * 0.9) * 0.4 : 0.2; p.head.rotation.x = alive ? Math.sin(t * 2.1) * 0.08 : 0;
        } else if (o.kind === 'sell') {
          a1.sh.rotation.x = -1.7 + (alive ? Math.sin(t * 4.5) * 0.35 : 0); a1.sh.rotation.z = -0.25; a0.sh.rotation.z = -0.35; a0.sh.rotation.x = -0.2;
          p.torso.rotation.y = alive ? Math.sin(t * 0.8) * 0.3 : 0;
        } else if (o.kind === 'muezzin') {
          a1.sh.rotation.x = -2.25; a1.sh.rotation.z = 0.75; p.root.rotation.y = (o.ry || 0) + (alive ? Math.sin(t * 0.45) * 0.7 : 0);
        } else if (o.kind === 'girl') {
          a0.sh.rotation.x = -0.9; a1.sh.rotation.x = -1.3; a1.sh.rotation.z = alive ? -0.3 + Math.sin(t * 5) * 0.3 : -0.3; p.head.rotation.x = 0.25; p.torso.rotation.y = alive ? Math.sin(t * 0.9) * 0.12 : 0;
        } else if (o.kind === 'boy') {
          a1.sh.rotation.x = -2.5 + (alive ? Math.sin(t * 1.6) * 0.12 : 0); a0.sh.rotation.z = -0.3; p.head.rotation.x = -0.45; p.root.rotation.z = alive ? Math.sin(t * 1.3) * 0.03 : 0;
        } else if (o.kind === 'eat') {       // a lick, a look around, another lick
          const lick = alive ? Math.max(0, Math.sin(t * 1.5)) : 0.5;
          a1.sh.rotation.set(-0.3 - lick * 0.12, -0.95, 0.8); a1.el.rotation.x = -1.75 - lick * 0.12; p.head.rotation.x = 0.1 + lick * 0.2; p.head.rotation.y = alive ? Math.sin(t * 0.5) * 0.3 * (1 - lick) : 0; a0.sh.rotation.z = -0.1;
          // (arm and wrist found by search: the cone leans 26 degrees towards her face, 10 to the side; at each lick the top scoop reaches her lips, 1 cm short; still, 4 cm off; her arm clear of her chest, nothing in her head)
        } else if (o.kind === 'photo') {     // lowers the camera to look, lifts it again
          const up = alive ? sm(Math.sin(t * 0.6) * 2 + 1.2) : 1;
          for (const a of p.arms) { a.sh.rotation.x = -0.55 - 0.95 * up; a.el.rotation.x = -1.15 - 0.15 * up; } p.head.rotation.x = 0.12 * up;
        } else if (o.kind === 'swimmer') {   // front crawl, up and down the river
          if (alive) {
            // a lap: up one lane, a U-turn onto a parallel lane (towards the middle of the river), back down it and a U-turn
            // home, so he swims round each turn instead of spinning on the spot
            const L = p.from.distanceTo(p.to), r = 1, dx = (p.to.x - p.from.x) / L, dz = (p.to.z - p.from.z) / L;
            const sd = Math.sign(-p.from.x) || 1, nx = dz * sd, nz = -dx * sd, nf = nx * -p.from.x > 0 ? 1 : -1, Nx = nx * nf, Nz = nz * nf;
            const lap = 2 * L + 2 * Math.PI * r; p.u = ((p.u ?? 0) + dt * o.speed) % lap; const u = p.u;
            let px, pz, vx, vz;
            if (u < L) { px = p.from.x + dx * u; pz = p.from.z + dz * u; vx = dx; vz = dz; }
            else if (u < L + Math.PI * r) { const a = (u - L) / r, cx = p.to.x + Nx * r, cz = p.to.z + Nz * r; px = cx - Nx * r * Math.cos(a) + dx * r * Math.sin(a); pz = cz - Nz * r * Math.cos(a) + dz * r * Math.sin(a); vx = Nx * Math.sin(a) + dx * Math.cos(a); vz = Nz * Math.sin(a) + dz * Math.cos(a); }
            else if (u < 2 * L + Math.PI * r) { const w = u - L - Math.PI * r; px = p.to.x + 2 * Nx * r - dx * w; pz = p.to.z + 2 * Nz * r - dz * w; vx = -dx; vz = -dz; }
            else { const a = (u - 2 * L - Math.PI * r) / r, cx = p.from.x + Nx * r, cz = p.from.z + Nz * r; px = cx + Nx * r * Math.cos(a) - dx * r * Math.sin(a); pz = cz + Nz * r * Math.cos(a) - dz * r * Math.sin(a); vx = -Nx * Math.sin(a) - dx * Math.cos(a); vz = -Nz * Math.sin(a) - dz * Math.cos(a); }
            const ry = Math.atan2(vx, vz); p.root.rotation.y = ry;
            p.root.position.set(px, p.from.y, pz).addScaledVector(birdD.set(Math.sin(ry), 0, Math.cos(ry)), -0.95);
            go(birdD.set(px, p.from.y, pz), ry, 0.6, 0.6);
            // the arms: over the water reaching forward, under it pulling back. His body rolls with the strokes (the side
            // whose arm is out of the water comes up), and every second stroke he turns his face out on the right to breathe
            const ph = t * 3.2, roll = -Math.sin(ph) * 0.4;
            a0.sh.rotation.x = ph % 6.283; a1.sh.rotation.x = (ph + Math.PI) % 6.283;
            const c1 = ((ph + Math.PI) % 6.283) / 6.283, breath = sm((c1 - 0.02) / 0.12) * (1 - sm((c1 - 0.32) / 0.14));      // (as the right arm leaves the water)
            p.torso.rotation.y = roll + 0.15 * breath; p.head.rotation.y = -roll * 0.8 + 1.0 * breath;
          }
          p.legs.forEach((l, i) => { l.hip.rotation.x = (alive ? Math.sin(t * 9 + i * Math.PI) : i ? 0.2 : -0.2) * 0.3; });
          p.root.position.y = p.y0 + (alive ? Math.sin(t * 3.2) * 0.02 : 0);
          // his collision box: his body, from his feet to his reaching hands, turned the way he swims (still or moving)
          const ry = p.root.rotation.y; birdD.set(Math.sin(ry), 0, Math.cos(ry));
          p.block.matrixWorld.compose(tmpA.copy(p.root.position).addScaledVector(birdD, 1.1).setY(0.3), p.block.quaternion.setFromAxisAngle(UPY, ry), tmpB.set(1.0, 1.1, 2.3));
        } else if (o.kind === 'fisher') {    // waits; now and then lifts the rod a little
          const tug = alive ? Math.max(0, Math.sin(t * 0.7)) ** 6 : 0;
          p.rod.rotation.x = -tug * 0.12 + (alive ? Math.sin(t * 1.3) * 0.01 : 0); p.head.rotation.y = alive ? Math.sin(t * 0.3) * 0.2 : 0; p.float.position.y = -1.62 + (alive ? Math.sin(t * 2.2) * 0.03 : 0);
        } else if (o.kind === 'drink') {     // the cup at his lips, sipping; now and then he lowers it to the saucer and lifts it again
          // drinking pose: his hand at his mouth (found by search: hand 1 mm from the spot), the cup in his fingers at his lips
          const sip = alive ? sm(Math.sin(t * 0.7) * 2.6 + 1.1) : 1, held = sm(Math.min(1, sip * 4));
          a1.sh.rotation.set(-0.9 + (-1.26 + 0.9) * sip, -0.47 * sip, -0.2 + (-0.29 + 0.2) * sip); a1.el.rotation.x = -0.1 + (-2.15 + 0.1) * sip;
          p.root.updateMatrixWorld(true); a1.hand.getWorldPosition(birdD); p.root.worldToLocal(birdD); birdD.x -= 0.045; birdD.y += 0.03; birdD.z += 0.012;
          p.cup.position.set(0.12, 0.66, 0.47).lerp(birdD, held); p.cup.rotation.set(Math.PI - 0.95 * sip, 0, 0);      // tipped towards his mouth as he drinks
          p.head.rotation.x = -0.22 * sip; a0.sh.rotation.x = -0.6; a0.el.rotation.x = -0.9; p.head.rotation.y = alive ? Math.sin(t * 0.4) * 0.3 * (1 - sip) : 0;
        } else if (o.kind === 'argue') {     // leaning in, hands flying, taking turns
          const mine = alive ? sm(Math.sin(t * 0.7 + (o.woman ? Math.PI : 0)) * 3) : o.woman ? 0 : 1, w = alive ? Math.sin(t * 9) : 0.5;
          // whoever is speaking throws their hands up and apart; the other sits back with arms crossed, shaking their head
          p.torso.rotation.x = -0.08 + 0.3 * mine; p.head.rotation.x = -0.1; p.head.rotation.y = alive ? Math.sin(t * 6) * 0.25 * (1 - mine) : 0;
          for (const a of p.arms) {
            a.sh.rotation.set(-0.55 - (0.95 + w * 0.3 * a.s) * mine, 0, a.s * (-0.45 + 1.05 * mine));
            a.el.rotation.x = -1.9 + (1.3 + w * 0.4) * mine;
          }
        } else if (o.kind === 'wait') {      // looks down the road, checks her watch, shifts her weight
          const watch = alive ? sm(Math.sin(t * 0.5) * 3 - 1.8) : 0;
          a0.sh.rotation.x = -0.9 * watch; a0.el.rotation.x = -1.5 * watch; p.head.rotation.x = 0.35 * watch; p.head.rotation.y = alive ? Math.sin(t * 0.35) * 0.7 * (1 - watch) : 0.5; p.root.rotation.z = alive ? Math.sin(t * 0.6) * 0.03 : 0;
        } else if (o.kind === 'post') {      // three knocks on the door, a wait, a glance around, three more
          const c = alive ? (time + p.phase) % 4.4 : 0.35, kc = (c - 0.1) / 0.3, knocking = kc >= 0 && kc < 3;
          p.raise += ((alive ? (c < 1.6 ? 1 : 0.15) : 1) - p.raise) * k(7, dt);
          const tap = knocking ? Math.sin((kc % 1) * Math.PI) : 0;
          a1.sh.rotation.set(-1.45 * p.raise, 0, -0.12); a1.el.rotation.x = -0.6 * p.raise - 0.75 * tap;
          a0.sh.rotation.set(-0.45, 0, 0.1); a0.el.rotation.x = -0.9;
          p.head.rotation.y = alive && !knocking && c > 1.8 ? Math.sin(c * 1.4) * 0.45 : 0; p.head.rotation.x = 0.05;
          const kn = knocking ? Math.floor(kc + 0.5) : -1;
          if (alive && knocking && kn !== p.lastK && kc % 1 > 0.5) { p.lastK = kn; this.onKnock?.(p.root.position); }
          if (!knocking) p.lastK = -1;
        } else if (o.kind === 'hammer') {      // a few quick blows, a look at the work, again
          const c = alive ? (time + p.phase) % 3.2 : 0.2, beat = c < 2 ? Math.max(0, Math.sin(c * Math.PI * 3)) : 0;
          a1.sh.rotation.set(-0.55 - 1.1 * beat, 0, 0.05); a1.el.rotation.x = -0.6 - 0.5 * beat;
          p.head.rotation.x = 0.35; p.torso.rotation.x = 0.18; p.head.rotation.y = alive && c > 2.2 ? Math.sin(c * 3) * 0.2 : 0;
        } else if (o.kind === 'sled' || o.kind === 'ski') {      // down the slope (the skier in long turns), a pause at the bottom, then from the top again
          const run = o.run, total = run.dur + 2.5, u = alive ? Math.min(1, ((time * 1 + p.phase * 3) % total) / run.dur) : o.still ?? 0.5;
          const e = u * u * (3 - 2 * u) * 0.25 + u * 0.75, side = o.kind === 'ski' ? Math.sin(e * Math.PI * 5) * 3.2 : 0;
          tmpA.set(run.from[0] + (run.to[0] - run.from[0]) * e + side, run.from[1] + (run.to[1] - run.from[1]) * e, run.from[2] + (run.to[2] - run.from[2]) * e);
          p.root.position.copy(tmpA); p.root.position.y += (o.lift ?? 0.05);
          const dir = Math.atan2(run.to[0] - run.from[0], run.to[2] - run.from[2]), turn = o.kind === 'ski' ? Math.cos(e * Math.PI * 5) * 0.55 : 0;
          p.root.rotation.y = dir + turn; p.root.rotation.z = -turn * 0.35;
          p.block.matrixWorld.setPosition(tmpA.x, tmpA.y + p.sc, tmpA.z);
          if (o.kind === 'sled') { a0.sh.rotation.x = alive ? -0.5 + Math.sin(t * 9) * 0.05 : -0.5; p.head.rotation.x = -0.1; }
        } else if (o.kind === 'chop') {      // the axe up over his head, down onto the log, again
          const c = alive ? (time + p.phase) % 2.4 : 0.4, up = c < 1.3 ? Math.sin(c / 1.3 * Math.PI / 2) : Math.max(0, 1 - (c - 1.3) / 0.18);
          for (const a of p.arms) { a.sh.rotation.set(-0.55 - 2.1 * up, 0, a.s * -0.25); a.el.rotation.x = -0.3 - 0.5 * up; }
          p.torso.rotation.x = 0.1 + 0.25 * (1 - up); p.head.rotation.x = 0.3;
        } else if (o.kind === 'sweep' || o.kind === 'rake' || o.kind === 'shovel') {      // the tool goes side to side (sweeping) or is drawn back towards him (raking)
          const w = alive ? Math.sin(t * (o.kind === 'sweep' ? 2.6 : 1.5)) : 0.4;
          if (o.kind === 'sweep') { p.tool.rotation.y = w * 0.5; p.torso.rotation.y = w * 0.25; }
          else if (o.kind === 'shovel') { p.tool.position.z = 0.52 + w * 0.12; p.tool.rotation.x = -Math.max(0, w) * 0.5; p.torso.rotation.x = 0.2 + w * 0.12; }
          else { p.tool.position.z = 0.52 + w * 0.16; p.torso.rotation.x = 0.12 + w * 0.08; }
          p.head.rotation.x = 0.3;
        } else if (o.kind === 'read') {      // reading; now and then he looks up over the paper
          const up = alive ? sm(Math.sin(t * 0.45) * 3 - 2) : 0;
          p.head.rotation.x = 0.28 - 0.4 * up; p.head.rotation.y = alive ? Math.sin(t * 0.3) * 0.25 * up : 0; p.paper.rotation.z = alive ? Math.sin(t * 0.8) * 0.02 : 0;
        } else if (o.kind === 'umbrella') {      // stands waiting, the umbrella swaying a little
          p.tool.rotation.z = alive ? Math.sin(t * 0.9) * 0.05 : 0; p.head.rotation.y = alive ? Math.sin(t * 0.35) * 0.5 : 0.3;
        } else if (o.kind === 'pose') {      // stand close, wave at the camera
          a1.sh.rotation.z = alive ? 2.4 + Math.sin(t * 5) * 0.3 : 2.5; a1.el.rotation.z = alive ? Math.sin(t * 5) * 0.3 : 0; a0.sh.rotation.z = -0.15; p.torso.rotation.z = alive ? Math.sin(t * 0.9) * 0.05 : 0; p.head.rotation.y = alive ? Math.sin(t * 0.4) * 0.15 : 0;
        } else if (o.kind === 'raft') {      // one blade in, then the other
          const st = alive ? Math.sin(t * 2.2) : 0.6;
          p.paddle.rotation.set(0, st * 0.3, st * 0.5); p.torso.rotation.y = st * 0.18; p.torso.rotation.x = 0.1;
          a0.sh.rotation.x = -0.85 + st * 0.25; a1.sh.rotation.x = -0.85 - st * 0.25;
        } else if (o.kind === 'swing') {
          const a = alive ? Math.sin(t * 2.3) * 0.6 : 0.3;
          p.pivot.rotation.x = a; for (const l of p.legs) l.knee.rotation.x = 1.1 - (alive ? Math.cos(t * 2.3) * 0.6 : 0.4); p.torso.rotation.x = alive ? -Math.cos(t * 2.3) * 0.2 : 0;
        } else if (o.kind === 'keeper') {
          if (alive) { p.root.position.z = o.z + Math.sin(t * 1.3) * 0.9; p.block.matrixWorld.setPosition(o.x, o.y + p.sc, p.root.position.z); go(p.root.position, Math.cos(t * 1.3) > 0 ? 0 : Math.PI, 0.45 * p.sc, 1.9 * p.sc, 1.2); }      // (shuffling from side to side)
          keeperShuffle(p, dt);
          for (const a of p.arms) { a.sh.rotation.z = a.s * (0.95 + (alive ? Math.sin(t * 2.1 + (a.s > 0 ? 0 : 0.5)) * 0.32 : 0)); a.el.rotation.x = -0.15; }      // arms out wide, rising and falling at an easy pace
        } else if (o.kind === 'cheer') {
          const j = alive ? Math.abs(Math.sin(t * 3.4)) : 0;
          p.root.position.y = p.y0 + j * 0.14; a1.sh.rotation.z = 2.5 + (alive ? Math.sin(t * 6.8) * 0.3 : 0); a0.sh.rotation.z = alive ? -0.4 - j * 1.6 : -0.2; p.head.rotation.x = -0.15;
        } else if (o.kind === 'slide') {
          const [sit, ry, walk, climb] = alive ? slideAt(time + p.phase, tmpA) : [1, -Math.PI / 2, 0, 0];
          if (alive) { p.root.position.set(SLD.x + tmpA.x, SLD.y + tmpA.y, SLD.z + tmpA.z); p.root.rotation.y += Math.atan2(Math.sin(ry - p.root.rotation.y), Math.cos(ry - p.root.rotation.y)) * k(8, dt); if (walk > 0.3 || sit > 0.3) go(p.root.position, p.root.rotation.y, 0.45 * p.sc, 1.9 * p.sc, sit > 0.3 ? 3 : 1.4); }
          else p.root.position.set(SLD.x + TOPSEAT.x, SLD.y + TOPSEAT.y, SLD.z);
          const sw = Math.sin(t * 8) * 0.6 * walk * (1 - sit);
          p.hips.position.y = 0.92 - 0.42 * sit;
          p.legs.forEach((l, i) => { const s = i ? sw : -sw; l.hip.rotation.x = s - 1.45 * sit; l.knee.rotation.x = Math.max(0, -s) * 0.9 + 0.5 * sit; });
          if (alive) p.block.matrixWorld.setPosition(p.root.position.x, p.root.position.y + 0.6, p.root.position.z);
          const up = sit * (alive ? 1 : 0.6); a0.sh.rotation.z = -up * 2.3; a1.sh.rotation.z = up * 2.3; a0.sh.rotation.x = sw * 0.5; a1.sh.rotation.x = -sw * 0.5;
          if (climb) {          // on the ladder: hands up the rails, one knee lifting to the next rung, then the other
            const lift = Math.sin(Math.abs(climb) * Math.PI), lead = climb > 0 ? 1 : 0;
            p.legs.forEach((l, i) => { const k2 = i === lead ? lift : 0; l.hip.rotation.x = -0.25 - 1.1 * k2; l.knee.rotation.x = 0.25 + 1.4 * k2; });
            p.arms.forEach((a, i) => { a.sh.rotation.set(-2.2 - (i === lead ? 0.35 * lift : 0), 0, a.s * 0.12); a.el.rotation.x = -0.35; });
            p.torso.rotation.x = 0.12;
          } else { p.torso.rotation.x = 0; for (const a of p.arms) a.el.rotation.x = 0; }
        } else if (o.kind === 'sarCornSell') {
          a0.sh.rotation.set(-1.05 + (alive ? Math.sin(t * 2.2) * 0.16 : 0), 0, -0.15); a0.el.rotation.x = -0.45;
          a1.sh.rotation.set(-0.25 + (alive ? Math.sin(t * 1.7) * 0.18 : 0), 0, 0.12); a1.el.rotation.x = -0.35;
          p.head.rotation.y = alive ? Math.sin(t * 0.9) * 0.35 : 0.1;
          if (alive && pigeonsForced > 0) p.head.rotation.x = -0.38; else p.head.rotation.x = 0.05;
        } else if (o.kind === 'sarFeed') {
          const thr = alive ? Math.sin(t * 2.6) : 0.65;
          a0.sh.rotation.set(-0.9 - thr * 0.45, 0, -0.18); a0.el.rotation.x = -0.55 + thr * 0.35;
          a1.sh.rotation.set(-0.45, 0, 0.14); a1.el.rotation.x = -0.6;
          p.torso.rotation.x = 0.12 + thr * 0.06;
          p.head.rotation.x = alive && pigeonsForced > 0 ? -0.42 : 0.22;
        } else if (o.kind === 'sarSweep') {
          const w = alive ? Math.sin(t * 2.2) : 0.35;
          p.torso.rotation.y = w * 0.24; p.torso.rotation.x = 0.14;
          a1.sh.rotation.set(-0.88, 0, 0.16); a1.el.rotation.x = -0.48;
          a0.sh.rotation.set(-0.62, 0, -0.26); a0.el.rotation.x = -0.78;
          if (p.broom) p.broom.rotation.z = 0.35 + w * 0.22;
          p.head.rotation.x = alive && pigeonsForced > 0 ? -0.35 : 0.28;
        } else if (o.kind === 'sarDrinkSpout') {
          const c = alive ? (time + p.phase) % 6.0 : 0.5;
          const bend = alive ? (c < 2.6 ? 1 : c < 3.4 ? 1 - sm((c - 2.6) / 0.8) : c < 5.2 ? 0 : sm((c - 5.2) / 0.8)) : 1;
          const wipe = alive && c >= 3.4 && c < 4.7 ? Math.sin(((c - 3.4) / 1.3) * Math.PI) : 0;
          p.torso.rotation.x = 0.58 * bend;
          a0.sh.rotation.set(-0.85 * bend - 1.15 * wipe, 0, -0.22 * bend - 0.15 * wipe); a0.el.rotation.x = -0.85 * bend - 1.45 * wipe;
          a1.sh.rotation.set(-0.85 * bend, 0, 0.22 * bend); a1.el.rotation.x = -0.85 * bend;
          p.head.rotation.x = 0.12 * bend - 0.1 * wipe;
        } else if (o.kind === 'sarHammer') {
          const c = alive ? (time + p.phase) % 3.6 : 0.15;
          const strike = c < 2.4 ? Math.max(0, Math.sin(c * Math.PI * 3.0)) : 0;
          a0.sh.rotation.set(-0.75 - 0.72 * strike, 0, -0.14); a0.el.rotation.x = -0.95 - 0.35 * strike;
          a1.sh.rotation.set(-0.85, 0, 0.18); a1.el.rotation.x = -0.75;
          p.torso.rotation.x = 0.16; p.head.rotation.x = 0.34;
          p.head.rotation.y = alive && c >= 2.4 ? Math.sin((c - 2.4) * 3.2) * 0.22 : 0;
        } else if (o.kind === 'sarCarry') {
          const speed = o.speed || 1.0;
          if (alive && p.from && p.to) {
            p.s += p.dir * dt * speed / p.from.distanceTo(p.to);
            if (p.s > 1 || p.s < 0) { p.dir *= -1; p.s = Math.min(1, Math.max(0, p.s)); }
            p.root.position.lerpVectors(p.from, p.to, p.s);
            const want = Math.atan2((p.to.x - p.from.x) * p.dir, (p.to.z - p.from.z) * p.dir);
            p.root.rotation.y += Math.atan2(Math.sin(want - p.root.rotation.y), Math.cos(want - p.root.rotation.y)) * k(5, dt);
            p.block.matrixWorld.setPosition(p.root.position.x, p.root.position.y + p.sc, p.root.position.z);
            go(p.root.position, p.root.rotation.y, 0.45 * p.sc, 1.9 * p.sc, speed);
          }
          const sw = alive ? Math.sin(t * 4.8) * 0.42 : 0.28;
          p.legs.forEach((l, i) => { const s = i ? sw : -sw; l.hip.rotation.x = s; l.knee.rotation.x = Math.max(0, -s) * 0.85; });
          for (const a of p.arms) { a.sh.rotation.set(-0.52, 0, a.s * -0.14); a.el.rotation.x = -1.25; }
          p.torso.rotation.x = -0.05;
          p.hips.position.y = 0.92 + (alive ? Math.abs(Math.cos(t * 4.8)) * 0.014 : 0);
        } else if (o.kind === 'sarWaiter') {
          if (alive && p.loopPts && p.loopPts.length >= 2) {
            const speed = o.speed || 0.95;
            p.wi = p.wi ?? 0; p.ws = p.ws ?? 0;
            const A = p.loopPts[p.wi], B = p.loopPts[(p.wi + 1) % p.loopPts.length], L = Math.max(0.1, A.distanceTo(B));
            p.ws += dt * speed / L;
            if (p.ws >= 1) { p.ws -= 1; p.wi = (p.wi + 1) % p.loopPts.length; }
            const A2 = p.loopPts[p.wi], B2 = p.loopPts[(p.wi + 1) % p.loopPts.length];
            p.root.position.lerpVectors(A2, B2, p.ws);
            const want = Math.atan2(B2.x - A2.x, B2.z - A2.z);
            p.root.rotation.y += Math.atan2(Math.sin(want - p.root.rotation.y), Math.cos(want - p.root.rotation.y)) * k(6, dt);
            p.block.matrixWorld.setPosition(p.root.position.x, p.root.position.y + p.sc, p.root.position.z);
            go(p.root.position, p.root.rotation.y, 0.45 * p.sc, 1.9 * p.sc, speed);
          }
          const sw = alive ? Math.sin(t * 4.4) * 0.36 : 0.22;
          p.legs.forEach((l, i) => { const s = i ? sw : -sw; l.hip.rotation.x = s; l.knee.rotation.x = Math.max(0, -s) * 0.75; });
          a0.sh.rotation.set(-1.35, 0, -0.22); a0.el.rotation.x = -1.55;
          a1.sh.rotation.set(sw * 0.4, 0, 0.08); a1.el.rotation.x = -0.2;
          p.hips.position.y = 0.92 + (alive ? Math.abs(Math.cos(t * 4.4)) * 0.012 : 0);
        } else if (o.kind === 'sarTalk') {
          const mine = alive ? sm(Math.sin(t * 0.65 + (o.turn ? Math.PI : 0)) * 2.5) : (o.turn ? 0 : 1);
          const gest = alive ? Math.sin(t * 4.2) : 0.4;
          p.torso.rotation.x = 0.05 + 0.14 * mine;
          a0.sh.rotation.set(-0.6 - 0.45 * mine, 0, -0.15 - 0.2 * mine * gest); a0.el.rotation.x = -0.8 - 0.3 * mine;
          a1.sh.rotation.set(-0.55 - 0.25 * mine, 0, 0.15 + 0.15 * mine * gest); a1.el.rotation.x = -0.85;
          p.head.rotation.y = alive ? Math.sin(t * 1.1) * 0.22 : (o.turn ? -0.15 : 0.15);
          p.head.rotation.x = alive && !mine ? Math.sin(t * 2.8) * 0.08 : 0;
        } else if (o.kind === 'sarDriver') {
          a0.sh.rotation.set(-0.85, 0, -0.15); a0.el.rotation.x = -0.45;
          a1.sh.rotation.set(-0.85, 0, 0.15); a1.el.rotation.x = -0.45;
          p.head.rotation.y = alive ? Math.sin(t * 0.6) * 0.18 : 0;
        } else if (o.kind === 'sarChestnutSell') {
          const st = alive ? Math.sin(t * 3.1) : 0.3;
          a0.sh.rotation.set(-0.78 + st * 0.14, 0, -0.18 + st * 0.12); a0.el.rotation.x = -0.75;
          a1.sh.rotation.set(-1.05 + (alive ? Math.sin(t * 1.4) * 0.15 : 0), 0, 0.12); a1.el.rotation.x = -0.5;
          p.head.rotation.x = 0.18; p.head.rotation.y = alive ? Math.sin(t * 0.7) * 0.25 : 0;
        } else if (o.kind === 'sarBuy') {
          const bite = alive ? sm(Math.sin(t * 1.2) * 2.2) : 0;
          a1.sh.rotation.set(-0.85 - 0.35 * bite, 0, 0.14); a1.el.rotation.x = -0.75 - 0.5 * bite;
          a0.sh.rotation.set(-0.75, 0, -0.1); a0.el.rotation.x = -0.45;
          p.head.rotation.x = 0.08 * bite;
        } else if (o.kind === 'sarUmbrellaWait') {
          const watch = alive ? sm(Math.sin(t * 0.5) * 3 - 1.6) : 0;
          a0.sh.rotation.set(-0.35, 0, -0.1); a0.el.rotation.x = -1.25;
          a1.sh.rotation.set(-0.85 * watch, 0, 0.1); a1.el.rotation.x = -1.35 * watch;
          p.head.rotation.x = 0.32 * watch; p.head.rotation.y = alive ? Math.sin(t * 0.4) * 0.65 * (1 - watch) : 0.45;
        } else if (o.kind === 'sarChess') {
          const myTurn = alive ? sm(Math.sin(t * 0.55 + (o.turn ? Math.PI : 0)) * 3) : (o.turn ? 0 : 1);
          p.torso.rotation.x = 0.15 + 0.32 * myTurn;
          a0.sh.rotation.set(-0.45 - 0.85 * myTurn, 0, -0.1); a0.el.rotation.x = -0.4 - 0.35 * myTurn;
          a1.sh.rotation.set(-0.3, 0, 0.12); a1.el.rotation.x = -0.35;
          p.head.rotation.x = 0.35;
        } else if (o.kind === 'sarReadBench') {
          const up = alive ? sm(Math.sin(t * 0.45) * 3 - 1.8) : 0;
          for (const a of p.arms) { a.sh.rotation.set(-0.72, 0, a.s * 0.06); a.el.rotation.x = -1.05; }
          p.head.rotation.x = 0.28 - 0.38 * up; p.head.rotation.y = alive ? Math.sin(t * 0.35) * 0.25 * up : 0;
          if (p.paper) p.paper.rotation.z = alive ? Math.sin(t * 0.9) * 0.025 : 0;
        } else if (o.kind === 'sarRoast') {
          const c = alive ? (time + p.phase) % 5.5 : 0.4;
          const wipe = alive && c > 4.0 ? Math.sin(((c - 4.0) / 1.5) * Math.PI) : 0;
          const turn = alive && c <= 4.0 ? Math.sin(c * 3.5) : 0.25;
          a0.sh.rotation.set(-0.85 + turn * 0.14, 0, -0.14); a0.el.rotation.x = -0.68;
          a1.sh.rotation.set(-0.35 - 1.55 * wipe, 0, 0.15 - 0.25 * wipe); a1.el.rotation.x = -0.45 - 1.1 * wipe;
          p.torso.rotation.x = 0.16 * (1 - wipe); p.head.rotation.x = 0.24 * (1 - wipe);
        } else if (o.kind === 'sarPick') {
          const reach = alive ? 0.5 + 0.5 * Math.sin(t * 1.4) : 0.85;
          a0.sh.rotation.set(-2.05 - 0.42 * reach, 0, -0.18); a0.el.rotation.x = -0.55 + 0.3 * reach;
          a1.sh.rotation.set(-1.05, 0, 0.18); a1.el.rotation.x = -0.75;
          p.head.rotation.x = -0.35; p.torso.rotation.x = -0.06;
        } else if (o.kind === 'sarNana') {
          const wave = alive ? sm(Math.sin(t * 0.6) * 2.2) : 0;
          a0.sh.rotation.set(-0.95 - 0.95 * wave, 0, -0.22 - 0.35 * wave); a0.el.rotation.x = -1.15 + 0.5 * wave;
          a0.el.rotation.z = alive && wave > 0.2 ? Math.sin(t * 5.2) * 0.28 * wave : 0;
          a1.sh.rotation.set(-0.95, 0, 0.22); a1.el.rotation.x = -1.15;
          p.head.rotation.y = alive ? Math.sin(t * 0.5) * 0.35 : 0.1; p.head.rotation.x = 0.15;
        } else if (o.kind === 'sarRimSit') {
          const pt = o.point ? 1 : 0;
          a0.sh.rotation.set(-0.55 - 1.1 * pt + (alive ? Math.sin(t * 1.2) * 0.18 : 0), 0, -0.15); a0.el.rotation.x = -0.65 + 0.45 * pt;
          a1.sh.rotation.set(-0.5 + (alive ? Math.sin(t * 1.5 + 1) * 0.16 : 0), 0, 0.15); a1.el.rotation.x = -0.75;
          p.head.rotation.y = alive ? Math.sin(t * 0.65) * 0.35 : (pt ? -0.15 : 0.2);
          p.head.rotation.x = 0.08;
        } else if (o.kind === 'sarPaint') {
          const st = alive ? Math.sin(t * 3.4) : 0.2;
          const stepBack = alive ? sm(Math.sin(t * 0.45) * 2.4 - 1.4) : 0;
          a0.sh.rotation.set(-1.15 + st * 0.16 * (1 - stepBack), 0, -0.12 + Math.cos(t * 2.1) * 0.12 * (1 - stepBack));
          a0.el.rotation.x = -0.55 - 0.2 * stepBack;
          a1.sh.rotation.set(-0.85, 0, 0.22); a1.el.rotation.x = -0.95;
          p.torso.rotation.x = -0.08 * stepBack; p.head.rotation.y = alive ? Math.sin(t * 0.5) * 0.2 * stepBack : 0;
        } else if (o.kind === 'jajBinoc') {
          const pan = alive ? Math.sin(t * 0.6) * 0.35 : 0;
          a0.sh.rotation.set(-1.35, 0, -0.18); a0.el.rotation.x = -1.35;
          a1.sh.rotation.set(-1.35, 0, 0.18); a1.el.rotation.x = -1.35;
          p.head.rotation.y = pan; p.torso.rotation.y = pan * 0.45;
        } else if (o.kind === 'jajHiker') {
          a0.sh.rotation.set(-0.35 + (alive ? Math.sin(t * 0.7) * 0.15 : 0), 0, -0.12); a0.el.rotation.x = -0.5;
          a1.sh.rotation.set(-0.25, 0, 0.12); a1.el.rotation.x = -0.4;
          p.head.rotation.y = alive ? Math.sin(t * 0.55) * 0.35 : 0.15;
        } else if (o.kind === 'jajMiller') {
          const bob = alive ? Math.sin(t * 1.8) * 0.08 : 0;
          a0.sh.rotation.set(-1.55 + bob, 0, -0.25); a0.el.rotation.x = -1.1;
          a1.sh.rotation.set(-0.35 - bob, 0, 0.12); a1.el.rotation.x = -0.4;
          p.torso.rotation.x = 0.08; p.head.rotation.y = alive ? Math.sin(t * 0.7) * 0.25 : 0;
        } else if (o.kind === 'jajFish') {
          const tug = alive ? Math.sin(t * 1.4) * 0.08 : 0;
          a0.sh.rotation.set(-0.85 + tug, 0, -0.08); a0.el.rotation.x = -0.65;
          a1.sh.rotation.set(-0.78 + tug * 0.7, 0, 0.12); a1.el.rotation.x = -0.7;
          p.head.rotation.x = 0.18; p.head.rotation.y = alive ? Math.sin(t * 0.4) * 0.18 : 0;
        } else if (o.kind === 'jajGarden') {
          const pour = alive ? 0.5 + 0.5 * Math.sin(t * 1.4) : 0.65;
          a0.sh.rotation.set(-0.75 - 0.35 * pour, 0, -0.12); a0.el.rotation.x = -0.55;
          a1.sh.rotation.set(-0.35, 0, 0.15); a1.el.rotation.x = -0.45;
          p.torso.rotation.x = 0.16 * pour; p.head.rotation.x = 0.28 * pour;
        } else if (o.kind === 'jajGuitar') {
          const strum = alive ? Math.sin(t * 7.5) * 0.18 : 0;
          a0.sh.rotation.set(-0.62 + strum, 0, -0.18); a0.el.rotation.x = -0.95 + strum * 0.5;
          a1.sh.rotation.set(-0.82, 0, 0.26); a1.el.rotation.x = -0.85;
          p.head.rotation.x = alive ? Math.sin(t * 3.75) * 0.09 : 0.05;
        } else if (o.kind === 'jajSing') {
          const sway = alive ? Math.sin(t * 2.2) : 0;
          a0.sh.rotation.set(-0.72 + sway * 0.18, 0, -0.25); a0.el.rotation.x = -0.75;
          a1.sh.rotation.set(-0.72 - sway * 0.18, 0, 0.25); a1.el.rotation.x = -0.75;
          p.torso.rotation.z = sway * 0.08; p.head.rotation.x = -0.12 + sway * 0.06;
        } else if (o.kind === 'jajWarmSit') {
          a0.sh.rotation.set(-0.45, 0, -0.15); a0.el.rotation.x = -0.55;
          a1.sh.rotation.set(-0.45, 0, 0.15); a1.el.rotation.x = -0.55;
          p.head.rotation.x = -0.22; p.head.rotation.y = alive ? Math.sin(t * 0.5) * 0.3 : 0;
        } else if (o.kind === 'jahThrow') {
          const c = alive ? (time * 0.7 + p.phase) % 2.4 : 0.35;
          const wind = c < 0.7 ? sm(c / 0.7) : c < 1.05 ? 1 - sm((c - 0.7) / 0.35) : 0;
          const thr = c >= 0.7 && c < 1.2 ? Math.sin(((c - 0.7) / 0.5) * Math.PI) : 0;
          a0.sh.rotation.set(-1.9 * wind - 0.65 * thr, 0, -0.22); a0.el.rotation.x = -0.85 * wind - 0.15;
          a1.sh.rotation.set(-0.6, 0, 0.25); a1.el.rotation.x = -0.4;
          p.torso.rotation.y = 0.25 * wind - 0.3 * thr;
        } else if (o.kind === 'jahChop') {
          const c = alive ? (time * 0.85 + p.phase) % 2.2 : 0.2;
          const lift = c < 1.0 ? sm(c / 1.0) : c < 1.35 ? 1 - sm((c - 1.0) / 0.35) : 0;
          a0.sh.rotation.set(-0.85 - 1.45 * lift, 0, -0.12); a0.el.rotation.x = -0.55 - 0.4 * lift;
          a1.sh.rotation.set(-0.85 - 1.35 * lift, 0, 0.18); a1.el.rotation.x = -0.55 - 0.4 * lift;
          p.torso.rotation.x = 0.25 * (1 - lift) - 0.08 * lift;
        } else if (o.kind === 'jahShovel') {
          const w = alive ? Math.sin(t * 2.0) : 0.4;
          p.torso.rotation.x = 0.24 - w * 0.12; p.torso.rotation.y = w * 0.28;
          a0.sh.rotation.set(-0.75 - w * 0.2, 0, -0.16); a0.el.rotation.x = -0.65;
          a1.sh.rotation.set(-0.92, 0, 0.14); a1.el.rotation.x = -0.45;
          if (p.shovel) { p.shovel.rotation.y = w * 0.28; p.shovel.position.y = Math.max(0, w) * 0.14; }
        } else if (o.kind === 'jahWarm') {
          const rub = alive ? Math.sin(t * 4.5) * 0.08 : 0;
          p.torso.rotation.x = 0.22;
          a0.sh.rotation.set(-0.92, 0, -0.2 + rub); a0.el.rotation.x = -0.65;
          a1.sh.rotation.set(-0.92, 0, 0.2 - rub); a1.el.rotation.x = -0.65;
          p.head.rotation.x = 0.15;
        } else if (o.kind === 'jahShiver') {
          const sh = alive ? Math.sin(t * 16) * 0.045 : 0;
          p.torso.rotation.z = sh; p.torso.rotation.x = 0.1;
          a0.sh.rotation.set(-0.55, 0, -0.48); a0.el.rotation.x = -1.55;
          a1.sh.rotation.set(-0.55, 0, 0.48); a1.el.rotation.x = -1.55;
          p.head.rotation.x = 0.18;
        } else if (o.kind === 'jahSledRide') {
          if (alive && p.pathPts && p.pathPts.length >= 2) {
            const u = ((time * 0.16 + p.phase * 0.1) % 1);
            const seg = u * (p.pathPts.length - 1), i = Math.min(p.pathPts.length - 2, Math.floor(seg)), f = seg - i;
            p.root.position.lerpVectors(p.pathPts[i], p.pathPts[i + 1], f);
            const dx = p.pathPts[i + 1].x - p.pathPts[i].x, dz = p.pathPts[i + 1].z - p.pathPts[i].z;
            p.root.rotation.y = Math.atan2(dx, dz);
            if (p.block) p.block.matrixWorld.setPosition(p.root.position.x, p.root.position.y + 0.7, p.root.position.z);
          }
          a0.sh.rotation.set(-1.1, 0, -0.2); a0.el.rotation.x = -0.45;
          a1.sh.rotation.set(-1.1, 0, 0.2); a1.el.rotation.x = -0.45;
          p.torso.rotation.x = -0.12;
        } else if (o.kind === 'jahSledPull') {
          const sw = alive ? Math.sin(t * 3.8) * 0.36 : 0.22;
          p.legs.forEach((l, i) => { const s = i ? sw : -sw; l.hip.rotation.x = s; l.knee.rotation.x = Math.max(0, -s) * 0.7; });
          p.torso.rotation.x = 0.18;
          a0.sh.rotation.set(0.42, 0, -0.14); a0.el.rotation.x = -0.35;
          a1.sh.rotation.set(-0.35 + sw * 0.4, 0, 0.14); a1.el.rotation.x = -0.35;
        } else if (o.kind === 'jahLaugh') {
          const b = alive ? Math.abs(Math.sin(t * 5.0)) : 0.5;
          p.hips.position.y = 0.92 + b * 0.06;
          a0.sh.rotation.set(-2.3 - b * 0.25, 0, -0.45); a0.el.rotation.x = -0.35;
          a1.sh.rotation.set(-2.3 - b * 0.25, 0, 0.45); a1.el.rotation.x = -0.35;
          p.head.rotation.x = -0.25; p.torso.rotation.x = -0.1;
        } else if (o.kind === 'jahSkater') {
          if (alive && p.orbit) {
            const ang = time * (p.orbit.speed || 0.45) + p.phase;
            const nx = p.orbit.cx + Math.cos(ang) * p.orbit.rx, nz = p.orbit.cz + Math.sin(ang) * p.orbit.rz;
            p.root.position.set(nx, p.y0, nz);
            p.root.rotation.y = Math.atan2(-Math.sin(ang) * p.orbit.rx, Math.cos(ang) * p.orbit.rz);
            if (p.block) p.block.matrixWorld.setPosition(nx, p.y0 + p.sc, nz);
            go(p.root.position, p.root.rotation.y, 0.5, 1.9, 2.2);
          }
          const gl = alive ? Math.sin(t * 2.2) : 0.4;
          p.torso.rotation.x = 0.18; p.torso.rotation.z = gl * 0.12;
          p.legs[0].hip.rotation.x = -0.25 + gl * 0.35; p.legs[0].knee.rotation.x = 0.45;
          p.legs[1].hip.rotation.x = -0.25 - gl * 0.35; p.legs[1].knee.rotation.x = 0.45;
          a0.sh.rotation.set(-0.35, 0, -0.65 - gl * 0.2); a0.el.rotation.x = -0.25;
          a1.sh.rotation.set(-0.35, 0, 0.65 - gl * 0.2); a1.el.rotation.x = -0.25;
        } else if (o.kind === 'jahSlip') {
          const w = alive ? Math.sin(t * 5.2) : 0.55;
          p.torso.rotation.z = w * 0.22; p.torso.rotation.x = -0.16;
          a0.sh.rotation.set(-0.4 + w * 0.5, 0, -1.25); a0.el.rotation.x = -0.2;
          a1.sh.rotation.set(-0.4 - w * 0.5, 0, 1.25); a1.el.rotation.x = -0.2;
          p.legs[0].hip.rotation.x = -0.35; p.legs[1].hip.rotation.x = 0.2;
        } else if (o.kind === 'jahSkier') {
          if (alive && p.pathPts && p.pathPts.length >= 2) {
            const u = ((time * (o.speed || 0.11) + p.phase * 0.12) % 1);
            const seg = u * (p.pathPts.length - 1), i = Math.min(p.pathPts.length - 2, Math.floor(seg)), f = seg - i;
            p.root.position.lerpVectors(p.pathPts[i], p.pathPts[i + 1], f);
            const dx = p.pathPts[i + 1].x - p.pathPts[i].x, dz = p.pathPts[i + 1].z - p.pathPts[i].z;
            p.root.rotation.y = Math.atan2(dx, dz) + Math.sin(u * Math.PI * 6) * 0.28;
            if (p.block) p.block.matrixWorld.setPosition(p.root.position.x, p.root.position.y + p.sc, p.root.position.z);
            go(p.root.position, p.root.rotation.y, 0.6, 1.9, 4.5);
          }
          const carve = alive ? Math.sin(t * 2.4) : 0.35;
          p.hips.position.y = 0.80; p.torso.rotation.x = 0.30; p.torso.rotation.z = carve * 0.16;
          for (const l of p.legs) { l.hip.rotation.x = -0.4; l.knee.rotation.x = 0.72; }
          a0.sh.rotation.set(-0.65, 0, -0.35); a0.el.rotation.x = -0.55;
          a1.sh.rotation.set(-0.65, 0, 0.35); a1.el.rotation.x = -0.55;
        } else if (o.kind === 'jahTumble') {
          const w = alive ? Math.sin(t * 3.2) : 0;
          a0.sh.rotation.set(-0.9 + w * 0.25, 0, -0.65); a1.sh.rotation.set(-0.9 - w * 0.25, 0, 0.65);
          p.head.rotation.y = w * 0.28;
        } else if (o.kind === 'trvWaitress') {
          const sw = alive ? Math.sin(t * 1.8) * 0.10 : 0;
          a0.sh.rotation.set(-1.45 + sw, 0, -0.18); a0.el.rotation.x = -1.25;
          a1.sh.rotation.set(-0.35 - sw, 0, 0.14); a1.el.rotation.x = -0.45;
          p.head.rotation.y = alive ? Math.sin(t * 0.7) * 0.3 : 0.1;
        } else if (o.kind === 'trvTailor') {
          const sew = alive ? Math.sin(t * 3.4) : 0;
          a0.sh.rotation.set(-0.85 + sew * 0.22, 0, -0.15); a0.el.rotation.x = -0.95 + sew * 0.15;
          a1.sh.rotation.set(-0.82, 0, 0.18); a1.el.rotation.x = -0.9;
          p.head.rotation.x = 0.28;
        } else if (o.kind === 'trvWriter') {
          const scrib = alive ? Math.sin(t * 5.0) : 0;
          a0.sh.rotation.set(-0.88 + scrib * 0.06, 0, -0.14 + Math.cos(t * 3.1) * 0.05); a0.el.rotation.x = -0.92;
          a1.sh.rotation.set(-0.80, 0, 0.16); a1.el.rotation.x = -0.85;
          p.head.rotation.x = 0.32;
        } else if (o.kind === 'trvChef') {
          const stir = alive ? Math.sin(t * 3.2) : 0;
          a0.sh.rotation.set(-0.92 + stir * 0.16, 0, -0.16 + Math.cos(t * 3.2) * 0.12); a0.el.rotation.x = -0.78;
          a1.sh.rotation.set(-0.52, 0, 0.16); a1.el.rotation.x = -0.55;
          p.torso.rotation.x = 0.12; p.head.rotation.x = 0.22;
        } else if (o.kind === 'trvShepherd') {
          a0.sh.rotation.set(-0.58, 0, -0.16); a0.el.rotation.x = -0.65;
          a1.sh.rotation.set(-0.25 + (alive ? Math.sin(t * 0.8) * 0.12 : 0), 0, 0.14); a1.el.rotation.x = -0.4;
          p.head.rotation.y = alive ? Math.sin(t * 0.45) * 0.38 : 0.1;
        } else if (o.kind === 'trvVizier') {
          a0.sh.rotation.set(-0.42, 0, -0.14); a0.el.rotation.x = -0.75;
          a1.sh.rotation.set(-0.42, 0, 0.14); a1.el.rotation.x = -0.75;
          p.head.rotation.y = alive ? Math.sin(t * 0.4) * 0.28 : 0;
        } else if (o.kind === 'neuSunbathe') {
          const br = alive ? Math.sin(t * 1.1) * 0.03 : 0;
          p.torso.rotation.x = br;
          p.head.rotation.y = alive ? Math.sin(t * 0.45) * 0.18 : 0.08;
        } else if (o.kind === 'neuNap') {
          const br = alive ? Math.sin(t * 0.9) * 0.025 : 0;
          p.torso.rotation.x = br;
        } else if (o.kind === 'neuRead') {
          const pg = alive ? Math.max(0, Math.sin(t * 0.6)) ** 5 : 0;
          a1.sh.rotation.set(-0.85 - pg * 0.25, 0, 0.18 - pg * 0.15);
          p.head.rotation.x = 0.30; p.head.rotation.y = alive ? Math.sin(t * 0.7) * 0.12 : 0;
        } else if (o.kind === 'neuFan') {
          const fw = alive ? Math.sin(t * 6.5) : 0.4;
          a1.sh.rotation.set(-1.15, 0, 0.18); a1.el.rotation.x = -0.95;
          a1.el.rotation.z = fw * 0.35;
          a0.sh.rotation.set(-0.25, 0, -0.18); a0.el.rotation.x = -0.25;
          p.head.rotation.x = -0.06;
        } else if (o.kind === 'neuSnorkel') {
          if (alive && p.orbit) {
            const ang = time * (p.orbit.speed || 0.25) + p.phase;
            const nx = p.orbit.cx + Math.cos(ang) * p.orbit.rx, nz = p.orbit.cz + Math.sin(ang) * p.orbit.rz;
            p.root.position.set(nx, p.y0 + Math.sin(t * 2.2) * 0.04, nz);
            p.root.rotation.y = Math.atan2(-Math.sin(ang) * p.orbit.rx, Math.cos(ang) * p.orbit.rz);
            if (p.block) p.block.matrixWorld.setPosition(nx, p.y0 + 0.3, nz);
            go(p.root.position, p.root.rotation.y, 0.7, 0.9, 1.0);
          }
          const kk = alive ? Math.sin(t * 4.5) * 0.32 : 0.15;
          p.legs[0].hip.rotation.x = kk; p.legs[1].hip.rotation.x = -kk;
          a0.sh.rotation.set(-0.3, 0, -0.45); a1.sh.rotation.set(-0.3, 0, 0.45);
        } else if (o.kind === 'neuLifeguard') {
          p.head.rotation.y = alive ? Math.sin(t * 0.65) * 0.6 : 0.2;
          a0.sh.rotation.set(-2.2, 0, -0.35); a0.el.rotation.x = -1.25;
        } else if (o.kind === 'neuVolley') {
          const jp = o.jump ? (alive ? Math.max(0, Math.sin(t * 2.2)) ** 2 : 0.65) : 0;
          p.root.position.y = p.y0 + jp * 0.75;
          if (o.jump) {
            a0.sh.rotation.set(-2.65, 0, -0.22); a0.el.rotation.x = -0.2;
            a1.sh.rotation.set(-2.45, 0, 0.28); a1.el.rotation.x = -0.3;
            p.legs[0].knee.rotation.x = 0.5 * jp; p.legs[1].knee.rotation.x = 0.4 * jp;
          } else {
            const b = alive ? Math.sin(t * 2.2 + 1.4) * 0.15 : 0;
            p.hips.position.y = 0.82; p.torso.rotation.x = 0.25;
            a0.sh.rotation.set(-1.05 + b, 0, -0.28); a0.el.rotation.x = -0.15;
            a1.sh.rotation.set(-1.05 + b, 0, 0.28); a1.el.rotation.x = -0.15;
          }
        } else if (o.kind === 'neuSailor') {
          const sw = alive ? Math.sin(t * 1.4) * 0.16 : 0.08;
          p.torso.rotation.z = sw;
          a0.sh.rotation.set(-0.75, 0, -0.3); a0.el.rotation.x = -0.45;
          a1.sh.rotation.set(-0.55, 0, 0.35); a1.el.rotation.x = -0.35;
        } else if (o.kind === 'neuCaptain') {
          const wv = alive ? Math.sin(t * 4.2) * 0.32 : 0;
          a0.sh.rotation.set(-2.2, 0, -0.45 + wv * 0.4); a0.el.rotation.x = -0.35; a0.el.rotation.z = wv;
          a1.sh.rotation.set(-0.65, 0, 0.12); a1.el.rotation.x = -0.5;
          p.head.rotation.y = alive ? Math.sin(t * 0.6) * 0.35 : 0.1;
        } else if (o.kind === 'neuDine') {
          const sip = alive ? Math.max(0, Math.sin(t * 0.8)) ** 4 : 0.2;
          a1.sh.rotation.set(-0.75 - sip * 0.55, 0, 0.15); a1.el.rotation.x = -0.75 - sip * 0.55;
          a0.sh.rotation.set(-0.6, 0, -0.15); a0.el.rotation.x = -0.65;
          p.head.rotation.y = alive ? Math.sin(t * 0.5) * 0.25 : 0;
        } else if (o.kind === 'blDajak') {
          const st = alive ? Math.sin(t * 1.9) : 0.3;
          p.torso.rotation.x = 0.12 + st * 0.14;
          a0.sh.rotation.set(-0.75 - st * 0.35, 0, -0.14); a0.el.rotation.x = -0.55;
          a1.sh.rotation.set(-1.05 - st * 0.45, 0, 0.14); a1.el.rotation.x = -0.45;
          if (p.pole) p.pole.rotation.x = st * 0.24;
        } else if (o.kind === 'blViolin') {
          const bw = alive ? Math.sin(t * 5.2) : 0.2;
          a0.sh.rotation.set(-1.2, 0, -0.25); a0.el.rotation.x = -1.1;
          a1.sh.rotation.set(-0.85 + bw * 0.22, 0, 0.25 + bw * 0.15); a1.el.rotation.x = -0.95;
          p.head.rotation.z = 0.22;
        } else if (o.kind === 'blDrum') {
          const b0 = alive ? Math.sin(t * 7.5) : 0.3, b1 = alive ? Math.sin(t * 7.5 + Math.PI) : -0.3;
          a0.sh.rotation.set(-0.65 + b0 * 0.2, 0, -0.16); a0.el.rotation.x = -0.85 - b0 * 0.3;
          a1.sh.rotation.set(-0.65 + b1 * 0.2, 0, 0.16); a1.el.rotation.x = -0.85 - b1 * 0.3;
        } else if (o.kind === 'blTrumpet') {
          const sw = alive ? Math.sin(t * 2.2) * 0.12 : 0;
          a0.sh.rotation.set(-1.35, 0, -0.28); a0.el.rotation.x = -1.25;
          a1.sh.rotation.set(-1.35, 0, 0.28); a1.el.rotation.x = -1.25;
          p.torso.rotation.x = -0.10 + sw;
        } else if (o.kind === 'blDance') {
          const sw = alive ? Math.sin(t * 3.4) : 0.3;
          p.hips.position.y = 0.92 + Math.abs(sw) * 0.05;
          p.torso.rotation.y = sw * 0.28;
          a0.sh.rotation.set(-1.6 - sw * 0.35, 0, -0.45); a0.el.rotation.x = -0.45;
          a1.sh.rotation.set(-1.6 + sw * 0.35, 0, 0.45); a1.el.rotation.x = -0.45;
        } else if (o.kind === 'blListen') {
          p.head.rotation.x = alive ? Math.sin(t * 3.2) * 0.10 : 0.04;
          a0.sh.rotation.set(-0.55, 0, -0.1); a0.el.rotation.x = -0.85;
          a1.sh.rotation.set(-0.55, 0, 0.1); a1.el.rotation.x = -0.85;
        } else if (o.kind === 'blWaitress') {
          a1.sh.rotation.set(-0.85, 0, 0.22); a1.el.rotation.x = -1.25;
          a0.sh.rotation.set(-0.25, 0, -0.15); a0.el.rotation.x = -0.35;
          p.head.rotation.y = alive ? Math.sin(t * 0.8) * 0.3 : 0.1;
        } else if (o.kind === 'blScooter') {
          const ps = alive ? Math.sin(t * 3.6) : 0.3;
          a0.sh.rotation.set(-0.95, 0, -0.1); a0.el.rotation.x = -0.35;
          a1.sh.rotation.set(-0.95, 0, 0.1); a1.el.rotation.x = -0.35;
          p.legs[1].hip.rotation.x = 0.25 + Math.max(0, ps) * 0.55;
        } else if (o.kind === 'blFrisbee') {
          const tw = alive ? Math.sin(t * 2.4) : 0.4;
          p.torso.rotation.y = tw * 0.55;
          a1.sh.rotation.set(-1.05, 0, 0.35 + tw * 0.45); a1.el.rotation.x = -0.45;
          a0.sh.rotation.set(-0.4, 0, -0.35);
        } else if (o.kind === 'blTennis') {
          const sw = alive ? Math.sin(t * 2.8) : 0.3;
          p.torso.rotation.y = sw * 0.45;
          a1.sh.rotation.set(-0.95 - sw * 0.55, 0, 0.35); a1.el.rotation.x = -0.45;
          a0.sh.rotation.set(-0.5, 0, -0.25);
        } else if (o.kind === 'blBasket') {
          const sh = alive ? Math.max(0, Math.sin(t * 2.0)) ** 2 : 0.6;
          p.root.position.y = p.y0 + sh * 0.45;
          a1.sh.rotation.set(-2.3 - sh * 0.4, 0, 0.12); a1.el.rotation.x = -0.35;
          a0.sh.rotation.set(-2.1 - sh * 0.3, 0, -0.15); a0.el.rotation.x = -0.45;
        } else if (o.kind === 'blStroller') {
          const sw = alive ? Math.sin(t * 3.0) * 0.25 : 0.15;
          p.legs[0].hip.rotation.x = sw; p.legs[1].hip.rotation.x = -sw;
          a0.sh.rotation.set(-0.82, 0, -0.12); a0.el.rotation.x = -0.28;
          a1.sh.rotation.set(-0.82, 0, 0.12); a1.el.rotation.x = -0.28;
        } else if (o.kind === 'blPhoto') {
          a0.sh.rotation.set(-1.35, 0, -0.35); a0.el.rotation.x = -1.2;
          a1.sh.rotation.set(-1.35, 0, 0.35); a1.el.rotation.x = -1.2;
          p.head.rotation.y = alive ? Math.sin(t * 0.55) * 0.35 : 0;
        } else if (o.kind === 'blDraw') {
          const sk = alive ? Math.sin(t * 6.0) * 0.14 : 0.1;
          a0.sh.rotation.set(-0.85, 0, -0.18); a0.el.rotation.x = -0.95;
          a1.sh.rotation.set(-0.92 + sk, 0, 0.15 + sk); a1.el.rotation.x = -0.95;
          p.head.rotation.x = 0.30;
        } else if (o.kind === 'bihPotter') {
          const wr = alive ? Math.sin(t * 3.8) * 0.12 : 0.08;
          a0.sh.rotation.set(-0.92 + wr, 0, -0.18); a0.el.rotation.x = -0.75;
          a1.sh.rotation.set(-0.92 - wr, 0, 0.18); a1.el.rotation.x = -0.75;
          p.head.rotation.x = 0.28;
        } else if (o.kind === 'bihGuard') {
          a0.sh.rotation.set(-0.18, 0, -0.12); a0.el.rotation.x = -0.25;
          a1.sh.rotation.set(-0.78, 0, 0.14); a1.el.rotation.x = -0.62;
          p.head.rotation.y = alive ? Math.sin(t * 0.65) * 0.35 : 0.08;
        } else if (o.kind === 'bihAccordion') {
          const sq = alive ? Math.sin(t * 2.6) : 0.35;
          a0.sh.rotation.set(-0.88, 0, -0.22 - sq * 0.16); a0.el.rotation.x = -0.92;
          a1.sh.rotation.set(-0.88, 0, 0.22 + sq * 0.16); a1.el.rotation.x = -0.92;
          if (p.accordion) p.accordion.scale.x = 1 + sq * 0.18;
          p.head.rotation.z = alive ? Math.sin(t * 1.3) * 0.14 : 0.05;
        }
        if (o.lookUpOnClimax && alive && pigeonsForced > 0) p.head.rotation.x = -0.45;
      }
      // the ball goes back and forth between the two who chase it
      if (alive && kickers.length === 2) {
        const h = 0.5 - 0.5 * Math.cos(time * 1.15);
        for (const [p, v] of [[kickers[0], tmpA], [kickers[1], tmpB]]) v.copy(p.root.position).add(new THREE.Vector3(Math.sin(p.root.rotation.y) * 0.45, 0, Math.cos(p.root.rotation.y) * 0.45));
        ball.position.lerpVectors(tmpA, tmpB, h); ball.position.y = ballHome.y + Math.abs(Math.sin(time * 2.3)) * 0.35 * Math.sin(Math.PI * h); ball.rotation.x += dt * 5;
        ballBlock.matrixWorld.setPosition(ball.position.x, ball.position.y, ball.position.z);
        { const to = Math.sin(time * 1.15) > 0 ? tmpB : tmpA; go(tmpC.set(ball.position.x, ballHome.y - 0.2, ball.position.z), Math.atan2(to.x - ball.position.x, to.z - ball.position.z), 0.25, 0.8, 4); }      // the ball, on its way to the other kid
      }
      // smoke, the fountain and the traffic light
      if (alive) flow(time); else if (this.flowed) flow(0);
      this.flowed = alive;
      const st = alive ? time : 0;
      for (const { SM, k, puffs } of smokes) puffs.forEach((m, i) => {
        const f = (i / puffs.length + st * 0.1 + k * 0.37) % 1, sz = (0.18 + f * 0.75) * Math.min(1, (1 - f) / 0.25);
        m.position.set(SM.x + f * 1.7 + Math.sin(f * 5 + i) * 0.18, SM.y + 0.3 + f * 4.2, SM.z + Math.cos(f * 4 + i * 1.3) * 0.15); m.scale.setScalar(sz); m.visible = sz > 0.02;
      });
      if (alive) waveFlag(time, true); else if (this.flagMoved) waveFlag(0, false);
      this.flagMoved = alive;
      const lc = alive ? time % 10 : 9, light = lc < 4.5 ? 2 : lc < 5.8 ? 1 : 0;
      for (const l of lamps) l.on.visible = l.i === light;
      // the horse and the sheep graze
      for (const a of animals) {
        const t = time * (alive ? 1 : 0) + a.phase, horse = a.o.kind === 'horse' || a.o.kind === 'deer', sp = horse ? 0.7 : 0.45;      // (the deer moves and grazes like the horse)
        let moving = false;
        if (alive) {       // a few steps to a new patch of grass, then graze there for a while
          a.rest -= dt;
          if (a.rest < 0) {
            const d = birdD.subVectors(a.to, a.root.position); d.y = 0; const len = d.length();
            if (len < 0.15) {     // a new patch, clear of the others (where they stand and where they are heading)
              a.rest = 4 + R() * 7;
              for (let tries = 0; tries < 10; tries++) {
                const ang = R() * 6.28, r = 1 + R() * (a.o.roam ?? (horse ? 4 : 2.5)); tmpB.set(a.home.x + Math.cos(ang) * r, a.home.y, a.home.z + Math.sin(ang) * r);
                if (animals.every((b) => b === a || (Math.hypot(b.root.position.x - tmpB.x, b.root.position.z - tmpB.z) > a.size + b.size + 0.3 && Math.hypot(b.to.x - tmpB.x, b.to.z - tmpB.z) > a.size + b.size + 0.3))) { a.to.copy(tmpB); break; }
              }
            } else if (animals.some((b) => b !== a && Math.hypot(b.root.position.x - (a.root.position.x + d.x / len * 0.25), b.root.position.z - (a.root.position.z + d.z / len * 0.25)) < a.size + b.size)) {
              a.to.copy(a.root.position); a.rest = 1 + R() * 2;       // another one is in the way: stop here and graze
            } else { moving = true; const want = Math.atan2(d.x, d.z); a.root.rotation.y += Math.atan2(Math.sin(want - a.root.rotation.y), Math.cos(want - a.root.rotation.y)) * k(3, dt); a.root.position.addScaledVector(d.normalize(), Math.min(len, sp * dt)); a.block.matrixWorld.setPosition(a.root.position.x, a.root.position.y + (horse ? 1 : 0.5), a.root.position.z); }
          }
        }
        a.walk += ((moving ? 1 : 0) - a.walk) * k(4, dt);
        if (moving) go(a.root.position, a.root.rotation.y, a.size, a.o.kind === 'horse' ? 2.2 : 1.2);
        // now and then the horse lifts its head high and neighs (the sound is played in main.js)
        if (a.o.kind === 'horse' && alive) { a.nextNeigh = (a.nextNeigh ?? 4 + R() * 4) - dt; if (a.nextNeigh <= 0 && !moving && !(a.neigh > 0)) { a.neigh = 2.8; a.nextNeigh = 12 + R() * 10; this.onNeigh?.(a.root.position); } }      // a neigh every 12 to 22 s (once it stands still)
        if (a.neigh > 0) a.neigh -= dt;
        const proud = a.neigh > 0 ? sm(Math.min(1, (2.8 - a.neigh) / 0.3, a.neigh / 0.6)) : 0, toss = a.neigh > 0 ? Math.sin((2.8 - a.neigh) * 8) * 0.14 * proud : 0;
        const down = alive ? (1 - a.walk) * sm(Math.sin(t * 0.5) * 2 + 1.1) * (1 - proud) : 0.3;
        a.neck.rotation.x = down * (horse ? 1.15 : 0.8) + (alive ? Math.sin(t * 5) * 0.04 * down : 0) - proud * 0.95 - toss;      // neighing: head lifted high, with a toss or two
        if (a.tail) a.tail.rotation.z = alive ? Math.sin(t * 2.4) * 0.35 : 0.1;
        const sw = Math.sin(t * (horse ? 5 : 8)) * 0.4 * a.walk;
        a.legs.forEach((l, i) => { l.rotation.x = i === 0 || i === 3 ? sw : -sw; });
      }
      // pigeons peck about; once the town is alive they scatter when the nightingale comes close, circle, and come back
      if (pigeonsForced > 0) pigeonsForced = Math.max(0, pigeonsForced - dt);
      const near = bird ? bird.pos.distanceTo(pcentre) : 99, scare = alive && (near < 3 || (near < 5.5 && bird.mode === 'perched'));
      if (scare && pigeons[0]?.mode === 'ground') this.onScatter?.();
      for (const q of pigeons) {
        const t = time + q.phase;
        if (q.mode === 'ground') {
          if (scare) { q.mode = 'fly'; q.t = 0; for (const w of q.wings) w.visible = true; }
          q.hd.rotation.x = alive ? Math.max(0, Math.sin(t * 2.3)) ** 4 * 1.1 : 0; if (alive) { q.yaw += Math.sin(t * 0.5) * dt * 0.6; q.g.rotation.y = q.yaw; q.g.position.x = q.home.x + Math.sin(t * 0.3) * 0.25; q.g.position.z = q.home.z + Math.cos(t * 0.23) * 0.25; }
        } else {
          q.t += dt; const back = pigeonsForced <= 0 && near > 7 && q.t > 5 ? (q.back = (q.back || 0) + dt / 2.2) : (q.back = 0), up = sm(q.t / 1.3) * (1 - sm(back));
          const a = q.t * 1.5 + q.phase, rr = 2 + (q.r - 3) * 0.9, tx = PG.fx + Math.cos(a) * rr, tz = PG.fz + Math.sin(a) * rr;
          q.g.position.set(q.home.x + (tx - q.home.x) * up, q.home.y + (PG.fh + q.h * 0.4) * up + Math.sin(t * 3) * 0.15 * up, q.home.z + (tz - q.home.z) * up);
          q.g.rotation.y = Math.atan2(-Math.sin(a), Math.cos(a)); q.hd.rotation.x = 0;
          q.wings.forEach((w, i) => { w.rotation.z = (i ? 1 : -1) * Math.sin(t * 38) * 0.9; });
          if (back >= 1) { q.mode = 'ground'; q.back = 0; for (const w of q.wings) w.visible = false; q.g.position.copy(q.home); }
        }
      }
      // ducks paddling on the Miljacka
      for (const dk of ducks) {
        const a = (alive ? time * dk.speed : 0) + dk.phase;
        if (alive) {
          dk.g.position.set(dk.home.x + Math.cos(a) * dk.r, dk.home.y + Math.sin(time * 2.5 + dk.phase) * 0.025, dk.home.z + Math.sin(a) * dk.r * 0.65);
          dk.g.rotation.y = Math.atan2(-Math.sin(a) * dk.r, Math.cos(a) * dk.r * 0.65);
          const dab = Math.max(0, Math.sin(time * 0.9 + dk.phase)) ** 6;
          dk.neck.rotation.x = dab * 0.75;
        }
      }
      // squirrel on the walnut branch
      if (squirrel) {
        if (alive) {
          const c = (time * 0.45) % 4.0, scurry = c < 1.5 ? sm(c / 1.5) : c < 2.2 ? 1 : c < 3.7 ? 1 - sm((c - 2.2) / 1.5) : 0;
          squirrel.g.position.copy(squirrel.home).addScaledVector(squirrel.dir, scurry * squirrel.span);
          squirrel.g.position.y += Math.abs(Math.sin(scurry * Math.PI * 4)) * 0.05;
          squirrel.hd.rotation.x = (c >= 1.5 && c < 2.2) || c >= 3.7 ? Math.sin(time * 12) * 0.14 : 0;
          squirrel.tl.rotation.x = Math.sin(time * 4.5) * 0.16;
        }
      }
      // kitten pouncing at leaves in the old house courtyard
      if (kitten) {
        if (alive) {
          const c = (time * 0.55) % 4.2, pounce = c < 0.7 ? Math.sin((c / 0.7) * Math.PI) : 0;
          const off = c < 0.7 ? sm(c / 0.7) * 0.55 : c < 2.4 ? 0.55 : c < 3.4 ? 0.55 * (1 - sm((c - 2.4) / 1.0)) : 0;
          kitten.g.position.set(kitten.home.x + Math.sin(kitten.ry) * off, kitten.home.y + pounce * 0.24, kitten.home.z + Math.cos(kitten.ry) * off);
          kitten.body.rotation.x = -pounce * 0.35 + (c >= 3.4 ? 0.18 : 0);
          kitten.tl.rotation.z = Math.sin(time * 5.2) * 0.4;
          kitten.hd.rotation.y = Math.sin(time * 1.4) * 0.35;
        }
      }
      // Jahorina mountain wildlife
      for (const a of jahAnimals) {
        if (!alive) continue;
        const t = time + a.phase;
        if (a.o.kind === 'fox') {
          const ang = t * 0.38, r = a.o.r || 2.4;
          a.g.position.set(a.home.x + Math.cos(ang) * r, a.home.y, a.home.z + Math.sin(ang) * r * 0.65);
          a.g.rotation.y = Math.atan2(-Math.sin(ang) * r, Math.cos(ang) * r * 0.65);
          const sw = Math.sin(t * 7.5) * 0.42;
          a.legs.forEach((l, i) => { l.rotation.x = i === 0 || i === 3 ? sw : -sw; });
          if (a.tl) a.tl.rotation.y = Math.sin(t * 4) * 0.28;
        } else if (a.o.kind === 'hare') {
          const hop = Math.max(0, Math.sin(t * 2.2)) ** 3;
          a.g.position.y = a.home.y + hop * 0.22;
          if (a.hd) a.hd.rotation.y = Math.sin(t * 1.5) * 0.35;
        } else if (a.o.kind === 'owl') {
          if (a.hd) a.hd.rotation.y = Math.sin(t * 0.7) * 0.65;
          a.wings.forEach((w, i) => { w.rotation.z = (i ? 1 : -1) * (0.06 + Math.max(0, Math.sin(t * 0.45)) ** 6 * 0.35); });
        } else if (a.o.kind === 'roe') {
          const nod = sm(Math.sin(t * 0.55) * 2.2);
          if (a.neck) a.neck.rotation.x = 0.55 * nod;
          if (a.hd) a.hd.rotation.y = Math.sin(t * 0.8) * 0.25 * (1 - nod);
        } else if (a.o.kind === 'wolf') {
          const howl = Math.max(0, Math.sin(t * 0.35)) ** 4;
          if (a.neck) a.neck.rotation.x = -0.62 * howl;
          if (a.tl) a.tl.rotation.z = Math.sin(t * 1.8) * 0.16;
        } else if (a.o.kind === 'crow') {
          const hop = Math.max(0, Math.sin(t * 3.0)) ** 6;
          a.g.position.y = a.home.y + hop * 0.14;
          if (a.hd) a.hd.rotation.y = Math.sin(t * 1.9) * 0.45;
        }
      }
      // Neum coastal & marine wildlife
      for (const a of neuAnimals) {
        if (!alive) continue;
        const t = time + a.phase;
        if (a.o.kind === 'gull') {
          if (a.o.fly) {
            const ang = t * (a.o.speed || 0.34), r = a.o.r || 12;
            a.g.position.set(a.home.x + Math.cos(ang) * r, a.home.y + Math.sin(t * 1.1) * 1.4, a.home.z + Math.sin(ang) * r * 0.72);
            a.g.rotation.y = Math.atan2(-Math.sin(ang) * r, Math.cos(ang) * r * 0.72);
            const fl = Math.sin(t * 5.2) * 0.32;
            a.wings.forEach((w, i) => { w.rotation.z = (i ? 1 : -1) * fl; });
          } else {
            if (a.hd) a.hd.rotation.y = Math.sin(t * 1.2) * 0.55;
            a.g.position.y = a.home.y + Math.max(0, Math.sin(t * 2.1)) ** 8 * 0.08;
          }
        } else if (a.o.kind === 'dolphin') {
          const cyc = (t * 0.32) % 1;
          const ang = t * 0.22, r = a.o.r || 7.5;
          const bx = a.home.x + Math.cos(ang) * r, bz = a.home.z + Math.sin(ang) * r * 0.65;
          const leap = cyc < 0.42 ? Math.sin((cyc / 0.42) * Math.PI) : 0;
          a.g.position.set(bx, a.home.y - 0.15 + leap * 2.1, bz);
          a.g.rotation.y = Math.atan2(-Math.sin(ang) * r, Math.cos(ang) * r * 0.65);
          a.body.rotation.x = cyc < 0.42 ? -Math.cos((cyc / 0.42) * Math.PI) * 0.62 : 0.08;
          if (a.tl) a.tl.rotation.x = Math.sin(t * 7) * 0.25;
        } else if (a.o.kind === 'crab') {
          const sc = Math.sin(t * 1.4) * 0.45;
          a.g.position.x = a.home.x + Math.cos(a.o.ry || 0) * sc;
          a.g.position.z = a.home.z - Math.sin(a.o.ry || 0) * sc;
          a.armsA.forEach((c, i) => { c.rotation.x = -0.25 - Math.sin(t * 4.5 + i) * 0.2; });
        } else if (a.o.kind === 'octopus') {
          a.g.position.y = a.home.y + Math.sin(t * 1.8) * 0.06;
          a.armsA.forEach((tn, i) => { tn.rotation.z = Math.sin(t * 2.6 + i * 1.1) * 0.22; });
        } else if (a.o.kind === 'jellyfish') {
          const p2 = Math.sin(t * 2.4);
          a.g.position.y = a.home.y + p2 * 0.18;
          a.body.scale.set(1 + p2 * 0.08, 1 - p2 * 0.07, 1 + p2 * 0.08);
        } else if (a.o.kind === 'lizard') {
          const dart = Math.max(0, Math.sin(t * 0.7)) ** 6;
          a.g.position.x = a.home.x + Math.sin(a.o.ry || 0) * dart * 0.35;
          a.g.position.z = a.home.z + Math.cos(a.o.ry || 0) * dart * 0.35;
          if (a.tl) a.tl.rotation.y = Math.sin(t * 6) * 0.28;
        }
      }
      // Banja Luka river & park wildlife
      for (const a of blAnimals) {
        if (!alive) continue;
        const t = time + a.phase;
        if (a.o.kind === 'heron') {
          const dip = Math.max(0, Math.sin(t * 0.65)) ** 5;
          if (a.neck) a.neck.rotation.x = 0.75 * dip;
        } else if (a.o.kind === 'otter') {
          if (a.hd) a.hd.rotation.y = Math.sin(t * 1.4) * 0.45;
          if (a.tl) a.tl.rotation.y = Math.sin(t * 3.0) * 0.22;
        } else if (a.o.kind === 'hedgehog') {
          const w = Math.sin(t * 1.1) * 0.42;
          a.g.position.x = a.home.x + Math.sin(a.o.ry || 0) * w;
          a.g.position.z = a.home.z + Math.cos(a.o.ry || 0) * w;
        } else if (a.o.kind === 'sparrow') {
          const hop = Math.max(0, Math.sin(t * 3.8)) ** 4;
          a.g.position.y = a.home.y + hop * 0.12;
          if (a.hd) a.hd.rotation.y = Math.sin(t * 2.2) * 0.5;
        } else if (a.o.kind === 'ladybug') {
          a.g.rotation.y = (a.o.ry || 0) + Math.sin(t * 0.8) * 0.35;
        } else if (a.o.kind === 'goose') {
          const w = Math.sin(t * 2.6) * 0.12;
          a.body.rotation.z = w;
          if (a.neck) a.neck.rotation.x = Math.max(0, Math.sin(t * 0.8)) ** 4 * 0.5;
        }
      }
      // the fish jumps now and then
      if (alive && world.fish) { const u = ((((time - fishT0) % 5.5) + 5.5) % 5.5) / 1.1; fish.visible = u < 1; if (u < 1) { fish.position.set(fishHome.x + (u - 0.5) * 1.3, Math.sin(Math.PI * u) * 0.95 - 0.12, fishHome.z); fish.rotation.set(-1.1 + u * 2.2, Math.PI / 2, 0, 'YXZ'); } }
      // the cat sits until the town wakes, then strolls along its wall with pauses
      if (world.cat) {
      const c = catS;
      if (alive) { c.rest -= dt; if (c.rest < 0) { c.x += c.dir * dt * 0.9; if (c.x > C.x1 || c.x < C.x0) { c.dir *= -1; c.rest = 1.5 + R() * 3; c.x = Math.min(C.x1, Math.max(C.x0, c.x)); } else if (R() < dt * 0.12) c.rest = 1 + R() * 2.5; } }
      const moving = alive && c.rest < 0; c.walk += ((moving ? 1 : 0) - c.walk) * k(5, dt);
      if (moving) go(cat.position, c.dir > 0 ? Math.PI / 2 : -Math.PI / 2, 0.45, 0.7);
      if (alive && !moving && R() < dt / 14) this.onMeow?.(cat.position);      // a miaow now and then while it sits (the sound is played in main.js)
      cat.position.x = c.x; cat.rotation.y = c.dir > 0 ? 0 : Math.PI; world.catBlock.matrixWorld.setPosition(c.x, C.y + 0.4, C.z);
      // sitting up: the body tilts back onto its haunches, the front legs stand straight and upright, the hind legs fold under it
      const sit = 1 - c.walk; cbody.rotation.z = sit * CAT_SIT.tilt; cbody.position.y = c.walk * CAT_SIT.walkY - sit * CAT_SIT.drop;
      const sw = Math.sin(time * 9) * 0.5 * c.walk;
      clegs.forEach((l, i) => { const front = i < 2; l.rotation.z = (i === 0 || i === 3 ? sw : -sw) + sit * (front ? -CAT_SIT.tilt : CAT_SIT.hind); l.scale.y = front ? 1 + sit * (CAT_SIT.front - 1) : 1; });
      ctail.rotation.z = 0.5 + (alive ? Math.sin(time * 1.7) * 0.35 : 0); ctail.rotation.x = alive ? Math.sin(time * 1.1) * 0.3 : 0;
      chead.rotation.y = alive && !moving ? Math.sin(time * 0.8) * 0.5 : 0;
      }
    },
  };
}
