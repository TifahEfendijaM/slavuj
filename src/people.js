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
const SWING = [[STANCE, ...OFF], [0.45, 0.5, 1.5], [0.55, 0.2, 2.0], [0.68, -0.4, 1.9], [0.8, -0.85, 1.2], [0.92, -0.75, 0.6], [1, ...LAND]];
function runLeg(u, hipY) {
  if (u < STANCE) return plant(Z_LAND + (Z_OFF - Z_LAND) * (u / STANCE), hipY);
  let i = 0; while (SWING[i + 1][0] < u) i++;
  const s = (u - SWING[i][0]) / (SWING[i + 1][0] - SWING[i][0]), K = (j) => SWING[Math.max(0, Math.min(SWING.length - 1, j))];
  return [1, 2].map((c) => { const p0 = K(i - 1)[c], p1 = K(i)[c], p2 = K(i + 1)[c], p3 = K(i + 2)[c];       // Catmull-Rom: smooth through the keys
    return 0.5 * (2 * p1 + (p2 - p0) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s * s + (3 * p1 - p0 - 3 * p2 + p3) * s * s * s); });
}
const cap = (r, l) =>new THREE.CapsuleGeometry(r, l, 4, 8);
const lathe = (pts) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 12);
const G = {
  thigh: cap(0.085, 0.26), calf: cap(0.068, 0.26), foot: cap(0.05, 0.12), arm: cap(0.052, 0.5), hand: new THREE.SphereGeometry(0.058, 8, 6),
  head: new THREE.SphereGeometry(0.13, 12, 10), hair: new THREE.SphereGeometry(0.139, 12, 7, 0, Math.PI * 2, 0, 1.75), scarf: new THREE.SphereGeometry(0.15, 12, 8, 0, Math.PI * 2, 0, 2.3),
  torso: lathe([[0.001, 0], [0.15, 0], [0.155, 0.14], [0.145, 0.28], [0.19, 0.5], [0.2, 0.57], [0.15, 0.64], [0.07, 0.68], [0.06, 0.74], [0.001, 0.74]]),
  skirt: lathe([[0.001, -0.89], [0.31, -0.89], [0.17, 0.02], [0.001, 0.02]]), robe: lathe([[0.001, -0.88], [0.27, -0.88], [0.18, 0.02], [0.001, 0.02]]),   // listed bottom to top, so the surface faces outwards
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
    const skin = pick(SKINS), top0 = o.robe ? '#e9e2d0' : pick(TOPS), top = o.trunks ? skin : o.top || (o.kind === 'girl' ? '#e0567f' : top0), bottom0 = pick(BOTTOMS), bottom = o.trunks ? skin : bottom0, gown = (o.robe || o.woman) && !o.sport;      // sport: dressed to run and kick (no skirt)
    const hips = grp(root, 0, 0.92, 0), legs = [];
    if (o.robe) P(G.robe, '#6a5a4a', hips, 0, 0, 0, '#4f4236');
    const seated = ['sit', 'swing', 'drink', 'argue', 'read', 'sled'].includes(o.kind), skirtC = o.woman && !o.robe && !o.sport && o.kind !== 'girl' ? pick(TOPS) : null;
    if (skirtC && !seated) { const sk = P(G.skirt, skirtC, hips, 0, 0, 0); if (sc < 1) sk.scale.y = 0.45; }       // a child's skirt is short, so her legs show
    const legC = skirtC && seated ? skirtC : bottom;                                                                  // a seated woman's skirt lies over her legs
    if ((!gown || seated || (skirtC && sc < 1)) && o.kind !== 'girl' && o.kind !== 'raft') for (const s of [-1, 1]) {
      const hip = grp(hips, s * 0.09, 0, 0); P(G.thigh, legC, hip, 0, -0.2, 0);
      const knee = grp(hip, 0, -0.42, 0); P(G.calf, (skirtC && seated) || o.sport ? skin : bottom, knee, 0, -0.2, 0);      // (shorts: bare calves)
      const f = P(G.foot, o.trunks ? skin : '#3a322c', knee, 0, -0.42, 0.06); f.rotation.x = Math.PI / 2;
      legs.push({ hip, knee, foot: f });
    }
    const torso = grp(hips, 0, 0, 0); const body = P(G.torso, top, torso, 0, 0, 0); body.scale.z = 0.72;
    if (o.trunks) { const tr = P(G.catBody, '#c0392b', hips, 0, -0.06, 0, '#8f2a20'); tr.scale.set(0.19, 0.17, 0.15); }      // swimming trunks
    const head = grp(torso, 0, 0.85, 0.01); P(G.head, skin, head, 0, 0, 0);
    if (sc < 1) head.scale.setScalar(1.25);                       // children: a bigger head
    if (o.fes) painter('fes', pos, undefined, false, o.fesAt)(G.fes, '#b3312c', head, 0, 0.15, 0, '#8f2420'); else if (o.robe) P(G.cap, '#f3efe6', head, 0, 0.02, 0);
    else if (o.kind === 'post') { P(G.cap, '#23405e', head, 0, 0.03, 0, '#1a2f45'); const v = P(G.box, '#1a2f45', head, 0, 0.05, 0.13); v.scale.set(0.2, 0.025, 0.11); }
    else if (o.woman && (o.scarf || R() < 0.5) && o.kind !== 'girl') { const s = P(G.scarf, pick(TOPS), head, 0, 0.012, -0.012); s.rotation.x = -0.25; }
    else {
      const hc = pick(HAIRS), h = P(G.hair, hc, head, 0, 0.012, -0.012); h.rotation.x = -0.3;
      if (o.woman) { const long = P(G.head, hc, head, 0, -0.13, -0.075); long.scale.set(1.02, 1.75, 0.62); }      // long hair down the back
      if (o.kind === 'girl') { const fl = P(G.bloom, '#f2c230', head, 0.1, 0.09, 0.06); fl.scale.setScalar(0.7); }
    }
    const arms = [-1, 1].map((s) => { const sh = grp(torso, s * 0.2, 0.56, 0); P(G.uarm, top, sh, 0, -0.135, 0); const el = grp(sh, 0, -0.27, 0); P(G.farm, top, el, 0, -0.14, 0); const hand = P(G.hand, skin, el, 0, -0.3, 0); return { sh, el, hand, s }; });
    const p = { o, root, hips, torso, head, legs, arms, phase: R() * 6, clap: 0, s: 0, dir: 1, P, sc, y0: o.y };
    const moving = o.kind === 'walk' || o.kind === 'bike' || o.kind === 'keeper' || o.kind === 'swimmer' || o.kind === 'skate';
    if (o.kind === 'swimmer') p.block = block(o.x, 0.3, o.z, 1.0, 1.1, 2.3, { wall: true, person: true });
    else if (o.kind !== 'girl' && o.kind !== 'swing') p.block = block(o.x, o.y + sc, o.z, 0.8 * sc + (o.kind === 'bike' ? 0.5 : 0), 2 * sc, 0.8 * sc + (o.kind === 'bike' ? 0.5 : 0), { wall: true, person: true });
    if (moving && o.to) { p.from = pos.clone(); p.to = new THREE.Vector3(o.to[0], o.y, o.to[1]); root.rotation.y = Math.atan2(p.to.x - p.from.x, p.to.z - p.from.z); }
    if (seated || o.kind === 'raft') { hips.position.y = 0.5; for (const l of legs) { l.hip.rotation.x = -1.5; l.knee.rotation.x = o.kind === 'raft' ? 0.55 : 1.45; } }
    if (o.kind === 'girl') torso.rotation.x = 0.5;
    if (o.kind === 'boy' && !o.kite) for (const [dx, dy, c] of [[0, 0.1, '#e0453a'], [0.07, 0.03, '#f2c230'], [-0.07, 0.04, '#f08fb0'], [0, -0.02, '#5a9148']]) P(G.bloom, c, arms[1].el, dx, -0.41 - dy, 0.02);

    if (o.dog) {       // the dog trots beside him on a leash
      const d = p.dog = grp(root, 0.55, 0, 0.75), C = '#b9834a', C2 = '#8f5f30', P = painter('dog', pos);
      const b = P(G.catBody, C, d, 0, 0.42, 0, C2); b.scale.set(0.17, 0.17, 0.36);
      const hd = p.dogHead = grp(d, 0, 0.58, 0.36); const hm = P(G.catBody, C, hd, 0, 0, 0, C2); hm.scale.set(0.13, 0.13, 0.15);
      const sn = P(G.catBody, '#f3e6cf', hd, 0, -0.03, 0.15); sn.scale.set(0.07, 0.06, 0.09);
      for (const s of [-1, 1]) { const e = P(G.catBody, C2, hd, s * 0.11, 0.03, -0.02); e.scale.set(0.035, 0.09, 0.06); }
      p.dogLegs = [[0.09, 0.22], [-0.09, 0.22], [0.09, -0.22], [-0.09, -0.22]].map(([x, z]) => { const g = grp(d, x, 0.3, z); const m = P(G.catLeg, C, g, 0, 0, 0, C2); m.scale.y = 1.15; return g; });
      p.dogTail = grp(d, 0, 0.5, -0.33); const tl = P(G.catTail, C, p.dogTail, 0, 0, 0, C2); tl.scale.set(0.8, 0.55, 0.8); p.dogTail.rotation.x = -0.9;
      rod(P, torso, [0.2, 0.08, 0.27], [0.55, -0.34, 1.0], 0.012, '#5a3a22');
      arms[1].sh.rotation.x = -0.5;
    }
    if (o.kind === 'eat') {       // an ice cream cone held up to the mouth
      const P = painter('icecream', pos), e = arms[1].el;
      P(G.cone, '#d9a25a', e, 0, -0.42, 0.02, '#b97f3a').scale.setScalar(1.1);
      P(G.ball, '#f08fb0', e, 0, -0.53, 0.02).scale.setScalar(0.075); P(G.ball, '#f6e3b0', e, 0.01, -0.62, 0.02).scale.setScalar(0.062);
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
      a.tail = grp(root, 0, 1.35, -0.76); const t = P(G.catTail, D, a.tail, 0, 0, 0); t.scale.set(1.2, 1.3, 1.2); a.tail.rotation.x = Math.PI - 0.35;
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
  for (let i = 0; i < (world.pigeons ? 8 : 0); i++) {
    const ang = (i / 8) * 6.28 + R(), rad = 0.5 + R() * 1.5, home = new THREE.Vector3(PG.x + Math.cos(ang) * rad, PG.y, PG.z + Math.sin(ang) * rad);
    const P = painter('pigeon', home, 1.2), g = new THREE.Group(); g.position.copy(home); g.rotation.y = R() * 6.28; scene.add(g);
    const col = ['#8f9aa6', '#a7aeb5', '#7d8794', '#c9c4bc'][i % 4], b = P(G.catBody, col, g, 0, 0.11, 0, '#6a7480'); b.scale.set(0.07, 0.075, 0.13);
    const hd = grp(g, 0, 0.2, 0.09); P(G.catBody, '#6f8a84', hd, 0, 0, 0).scale.set(0.045, 0.045, 0.045); const bk = P(G.cone, '#d9a25a', hd, 0, 0, 0.055); bk.scale.set(0.3, 0.3, 0.3); bk.rotation.x = Math.PI / 2;
    const tl = P(G.box, '#6a7480', g, 0, 0.1, -0.15); tl.scale.set(0.07, 0.015, 0.12);
    const wings = [-1, 1].map((s) => { const w = grp(g, s * 0.05, 0.14, 0); const m = P(G.box, col, w, s * 0.11, 0, 0, '#6a7480'); m.scale.set(0.22, 0.012, 0.12); w.visible = false; return w; });
    pigeons.push({ g, hd, wings, home, mode: 'ground', t: 0, phase: R() * 6, r: 3 + R() * 2.5, h: 3 + R() * 2.5, yaw: g.rotation.y });
  }
  let fishT0 = 0;      // the fish's jumps count from here (the finale sets it so one comes early in the diver's shot)
  const FS = world.fish || { x: 0, z: 0 }, fishHome = new THREE.Vector3(FS.x, 0.55, FS.z), FP = painter('fish', fishHome, 1), fish = new THREE.Group(); fish.position.copy(fishHome); fish.rotation.x = -0.7; if (world.fish) scene.add(fish);
  if (world.fish) FP(G.catBody, '#9fb6c2', fish, 0, 0, 0, '#6f8a9a').scale.set(0.05, 0.1, 0.24); if (world.fish) { const t = FP(G.ear, '#6f8a9a', fish, 0, 0, -0.27); t.scale.set(0.5, 1.3, 1.6); t.rotation.x = Math.PI / 2; }
  const birdD = new THREE.Vector3();

  // ---- smoke from a chimney: still curls in the sketch, then it rises and drifts ----
  const smokes = (world.smoke || []).map((SM, k) => {
    const SMP = painter('smoke', new THREE.Vector3(SM.x, SM.y + 1.6, SM.z), 3.6);
    return { SM, k, puffs: Array.from({ length: 9 }, (_, i) => SMP(G.ball, i % 2 ? '#e2dfd8' : '#d0ccc4', scene, 0, 0, 0, '#b4b0a8')) };
  });
  // ---- the šadrvan: eight thin streams fall from the rim of its upper bowl into the basin (still in the sketch) ----
  const FT = world.fountain || { x: 0, y: 0, z: 0 }, FTP = painter('fountain', new THREE.Vector3(FT.x, FT.y + 1.6, FT.z), 2.4);
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
  block(FL.x, FL.y + FL.h / 2, FL.z, 0.16, FL.h, 0.16, { wall: true }); block(FL.x, FL.y + FL.h + 0.12, FL.z, 0.3, 0.12, 0.3, { orb: 'zastava' });
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
  const ballHome = new THREE.Vector3(...(world.ball || [31.2, 12.29, 76.2])), BP = painter('ball', ballHome, 1), ball = kickers.length ? BP(G.ball, '#f8f4ea', scene, 0, 0, 0, '#cfd6d8') : new THREE.Object3D();
  ball.scale.setScalar(0.17); ball.position.copy(ballHome);
  const ballBlock = kickers.length ? block(ballHome.x, ballHome.y, ballHome.z, 0.4, 0.4, 0.4, { wall: true, person: true }) : new THREE.Object3D(), dogP = new THREE.Vector3();
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();

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
  const C = world.cat || { x: 0, y: -999, z: 0, x0: 0, x1: 0 }, cpos = new THREE.Vector3(C.x, C.y, C.z), ctm = timing('cat', cpos), cmat = washMat('cat');
  const cat = new THREE.Group(); cat.position.copy(cpos); if (world.cat) scene.add(cat);
  const CP = (geo, parent, x, y, z, sx = 1, sy = 1, sz = 1, col = '#e39a4a') => {
    const m = new THREE.Mesh(paintGeo(geo, { col, bleed: '#c9752f', seed: [C.x, C.y + 0.4, C.z], radius: 1.4, delay: ctm.delay, dur: 3, hatch: 0.4 }), cmat);
    m.position.set(x, y, z); m.scale.set(sx, sy, sz); addHull(m, 1.5); parent.add(m); return m;
  };
  const cbody = new THREE.Group(); cat.add(cbody);
  CP(G.catBody, cbody, 0, 0.36, 0, 0.42, 0.28, 0.25);
  const chead = new THREE.Group(); chead.position.set(0.38, 0.6, 0); cbody.add(chead);
  CP(G.catBody, chead, 0, 0, 0, 0.2, 0.19, 0.2); for (const s of [-1, 1]) CP(G.ear, chead, 0.02, 0.2, s * 0.11);
  const ctail = new THREE.Group(); ctail.position.set(-0.4, 0.4, 0); cbody.add(ctail); CP(G.catTail, ctail, 0, 0, 0);
  const clegs = [[0.24, 0.1], [0.24, -0.1], [-0.24, 0.1], [-0.24, -0.1]].map(([x, z]) => { const g = new THREE.Group(); g.position.set(x, 0.26, z); cbody.add(g); CP(G.catLeg, g, 0, 0, 0); return g; });
  const catS = { walk: 0, x: C.x, dir: 1, rest: 2 };

  return {
    flagCloth: cloth, animals,
    list, cat, ball,
    fishJumpAt(t) { fishT0 = t; },
    applaud() { for (const p of list) if (p.o.kind === 'watch') p.cheer = true; },
    update(dt, time, life, bird) {
      const alive = life > 0.5;
      for (const p of list) {
        const t = time * (alive ? 1 : 0) + p.phase, [a0, a1] = p.arms, o = p.o;
        if (o.kind === 'walk' || o.kind === 'bike' || o.kind === 'skate') {
          const speed = o.speed || 1.25;
          if (alive) {
            p.s += p.dir * dt * speed / p.from.distanceTo(p.to); if (p.s > 1 || p.s < 0) { p.dir *= -1; p.s = Math.min(1, Math.max(0, p.s)); }
            p.root.position.lerpVectors(p.from, p.to, p.s);
            const want = Math.atan2((p.to.x - p.from.x) * p.dir, (p.to.z - p.from.z) * p.dir);
            p.root.rotation.y += Math.atan2(Math.sin(want - p.root.rotation.y), Math.cos(want - p.root.rotation.y)) * k(o.kind === 'bike' ? 2.5 : 5, dt);
            p.block.matrixWorld.setPosition(p.root.position.x, p.root.position.y + p.sc, p.root.position.z);
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
            }
          }
        } else if (o.kind === 'watch') {
          if (p.cheer && alive) {
            const want = Math.atan2(0.5 - o.x, 10.5 - o.z); p.root.rotation.y += (want - p.root.rotation.y) * k(3, dt); p.head.rotation.x = 0.4; p.torso.rotation.x = 0.12;      // looking down at the water where he landed
            const f = p.f ||= 2.2 + R() * 1.5, wave = Math.sin(t * 0.31 * f + p.phase * 2) > 0.2, j = Math.max(0, Math.sin(t * f)) ** 2;
            p.root.position.y = p.y0 + j * (wave ? 0.16 : 0.06);
            for (const a of p.arms) {
              if (wave) { a.sh.rotation.x += (-2.85 + Math.sin(t * 2.3 * f + a.s) * 0.25 - a.sh.rotation.x) * k(8, dt); a.sh.rotation.z = -a.s * 0.3; a.el.rotation.x = -0.25; }     // arms up, cheering
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
          a1.sh.rotation.set(-0.3 - lick * 0.12, 0, -0.42); a1.el.rotation.x = -2.2 - lick * 0.12; p.head.rotation.x = 0.1 + lick * 0.2; p.head.rotation.y = alive ? Math.sin(t * 0.5) * 0.3 * (1 - lick) : 0; a0.sh.rotation.z = -0.1;
        } else if (o.kind === 'photo') {     // lowers the camera to look, lifts it again
          const up = alive ? sm(Math.sin(t * 0.6) * 2 + 1.2) : 1;
          for (const a of p.arms) { a.sh.rotation.x = -0.55 - 0.95 * up; a.el.rotation.x = -1.15 - 0.15 * up; } p.head.rotation.x = 0.12 * up;
        } else if (o.kind === 'swimmer') {   // front crawl, up and down the river
          if (alive) {
            p.s += p.dir * dt * o.speed / p.from.distanceTo(p.to); if (p.s > 1 || p.s < 0) { p.dir *= -1; p.s = Math.min(1, Math.max(0, p.s)); }
            const want = Math.atan2((p.to.x - p.from.x) * p.dir, (p.to.z - p.from.z) * p.dir); p.root.rotation.y += Math.atan2(Math.sin(want - p.root.rotation.y), Math.cos(want - p.root.rotation.y)) * k(2, dt);
            p.root.position.lerpVectors(p.from, p.to, p.s).addScaledVector(birdD.set(Math.sin(p.root.rotation.y), 0, Math.cos(p.root.rotation.y)), -0.95);
            a0.sh.rotation.x = -(t * 3.2) % 6.283; a1.sh.rotation.x = -(t * 3.2 + Math.PI) % 6.283; p.head.rotation.y = Math.sin(t * 3.2) * 0.5;
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
          if (alive) { p.root.position.z = o.z + Math.sin(t * 1.3) * 0.9; p.block.matrixWorld.setPosition(o.x, o.y + p.sc, p.root.position.z); }
          p.hips.position.y = 0.84 + (alive ? Math.abs(Math.sin(t * 2.6)) * 0.04 : 0); for (const a of p.arms) a.sh.rotation.z = a.s * (0.95 + (alive ? Math.sin(t * 2.6) * 0.15 : 0));
        } else if (o.kind === 'cheer') {
          const j = alive ? Math.abs(Math.sin(t * 3.4)) : 0;
          p.root.position.y = p.y0 + j * 0.14; a1.sh.rotation.z = 2.5 + (alive ? Math.sin(t * 6.8) * 0.3 : 0); a0.sh.rotation.z = alive ? -0.4 - j * 1.6 : -0.2; p.head.rotation.x = -0.15;
        } else if (o.kind === 'slide') {
          const [sit, ry, walk, climb] = alive ? slideAt(time + p.phase, tmpA) : [1, -Math.PI / 2, 0, 0];
          if (alive) { p.root.position.set(SLD.x + tmpA.x, SLD.y + tmpA.y, SLD.z + tmpA.z); p.root.rotation.y += Math.atan2(Math.sin(ry - p.root.rotation.y), Math.cos(ry - p.root.rotation.y)) * k(8, dt); }
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
        }
      }
      // the ball goes back and forth between the two who chase it
      if (alive && kickers.length === 2) {
        const h = 0.5 - 0.5 * Math.cos(time * 1.15);
        for (const [p, v] of [[kickers[0], tmpA], [kickers[1], tmpB]]) v.copy(p.root.position).add(new THREE.Vector3(Math.sin(p.root.rotation.y) * 0.45, 0, Math.cos(p.root.rotation.y) * 0.45));
        ball.position.lerpVectors(tmpA, tmpB, h); ball.position.y = ballHome.y + Math.abs(Math.sin(time * 2.3)) * 0.35 * Math.sin(Math.PI * h); ball.rotation.x += dt * 5;
        ballBlock.matrixWorld.setPosition(ball.position.x, ball.position.y, ball.position.z);
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
        // now and then the horse lifts its head high and neighs (the sound is played in main.js)
        if (a.o.kind === 'horse' && alive && !moving && !(a.neigh > 0) && R() < dt / 16) { a.neigh = 2.8; this.onNeigh?.(a.root.position); }
        if (a.neigh > 0) a.neigh -= dt;
        const proud = a.neigh > 0 ? sm(Math.min(1, (2.8 - a.neigh) / 0.3, a.neigh / 0.6)) : 0, toss = a.neigh > 0 ? Math.sin((2.8 - a.neigh) * 8) * 0.14 * proud : 0;
        const down = alive ? (1 - a.walk) * sm(Math.sin(t * 0.5) * 2 + 1.1) * (1 - proud) : 0.3;
        a.neck.rotation.x = down * (horse ? 1.15 : 0.8) + (alive ? Math.sin(t * 5) * 0.04 * down : 0) - proud * 0.95 - toss;      // neighing: head lifted high, with a toss or two
        if (a.tail) a.tail.rotation.z = alive ? Math.sin(t * 2.4) * 0.35 : 0.1;
        const sw = Math.sin(t * (horse ? 5 : 8)) * 0.4 * a.walk;
        a.legs.forEach((l, i) => { l.rotation.x = i === 0 || i === 3 ? sw : -sw; });
      }
      // pigeons peck about; once the town is alive they scatter when the nightingale comes close, circle, and come back
      const near = bird ? bird.pos.distanceTo(pcentre) : 99, scare = alive && (near < 3 || (near < 5.5 && bird.mode === 'perched'));
      if (scare && pigeons[0]?.mode === 'ground') this.onScatter?.();
      for (const q of pigeons) {
        const t = time + q.phase;
        if (q.mode === 'ground') {
          if (scare) { q.mode = 'fly'; q.t = 0; for (const w of q.wings) w.visible = true; }
          q.hd.rotation.x = alive ? Math.max(0, Math.sin(t * 2.3)) ** 4 * 1.1 : 0; if (alive) { q.yaw += Math.sin(t * 0.5) * dt * 0.6; q.g.rotation.y = q.yaw; q.g.position.x = q.home.x + Math.sin(t * 0.3) * 0.25; q.g.position.z = q.home.z + Math.cos(t * 0.23) * 0.25; }
        } else {
          q.t += dt; const back = near > 7 && q.t > 5 ? (q.back = (q.back || 0) + dt / 2.2) : (q.back = 0), up = sm(q.t / 1.3) * (1 - sm(back));
          const a = q.t * 1.5 + q.phase, rr = 2 + (q.r - 3) * 0.9, tx = PG.fx + Math.cos(a) * rr, tz = PG.fz + Math.sin(a) * rr;
          q.g.position.set(q.home.x + (tx - q.home.x) * up, q.home.y + (PG.fh + q.h * 0.4) * up + Math.sin(t * 3) * 0.15 * up, q.home.z + (tz - q.home.z) * up);
          q.g.rotation.y = Math.atan2(-Math.sin(a), Math.cos(a)); q.hd.rotation.x = 0;
          q.wings.forEach((w, i) => { w.rotation.z = (i ? 1 : -1) * Math.sin(t * 38) * 0.9; });
          if (back >= 1) { q.mode = 'ground'; q.back = 0; for (const w of q.wings) w.visible = false; q.g.position.copy(q.home); }
        }
      }
      // the fish jumps now and then
      if (alive && world.fish) { const u = ((((time - fishT0) % 5.5) + 5.5) % 5.5) / 1.1; fish.visible = u < 1; if (u < 1) { fish.position.set(fishHome.x + (u - 0.5) * 1.3, Math.sin(Math.PI * u) * 0.95 - 0.12, fishHome.z); fish.rotation.set(-1.1 + u * 2.2, Math.PI / 2, 0, 'YXZ'); } }
      // the cat sits until the town wakes, then strolls along its wall with pauses
      if (world.cat) {
      const c = catS;
      if (alive) { c.rest -= dt; if (c.rest < 0) { c.x += c.dir * dt * 0.9; if (c.x > C.x1 || c.x < C.x0) { c.dir *= -1; c.rest = 1.5 + R() * 3; c.x = Math.min(C.x1, Math.max(C.x0, c.x)); } else if (R() < dt * 0.12) c.rest = 1 + R() * 2.5; } }
      const moving = alive && c.rest < 0; c.walk += ((moving ? 1 : 0) - c.walk) * k(5, dt);
      if (alive && !moving && R() < dt / 14) this.onMeow?.(cat.position);      // a miaow now and then while it sits (the sound is played in main.js)
      cat.position.x = c.x; cat.rotation.y = c.dir > 0 ? 0 : Math.PI; world.catBlock.matrixWorld.setPosition(c.x, C.y + 0.4, C.z);
      cbody.rotation.z = (1 - c.walk) * 0.5; cbody.position.y = c.walk * 0.06;
      const sw = Math.sin(time * 9) * 0.5 * c.walk;
      clegs.forEach((l, i) => { l.rotation.z = (i === 0 || i === 3 ? sw : -sw); l.scale.y = 0.35 + 0.65 * c.walk; });
      ctail.rotation.z = 0.5 + (alive ? Math.sin(time * 1.7) * 0.35 : 0); ctail.rotation.x = alive ? Math.sin(time * 1.1) * 0.3 : 0;
      chead.rotation.y = alive && !moving ? Math.sin(time * 0.8) * 0.5 : 0;
      }
    },
  };
}
