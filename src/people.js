// The people of Mostar, the cat, the dog. All of them stand frozen in the sketch until the
// finale brings the town to life; then they walk, talk, sell, play, ride, paddle, applaud and wave.
import * as THREE from 'three';
import { paintGeo, washMat, addHull, tag } from './paper.js';

const TOPS = ['#b8452c', '#3f6f9a', '#4f8068', '#c69a3a', '#8a5a8a', '#e6dccb', '#5d7b8a', '#c9744a'];
const BOTTOMS = ['#4a4a52', '#6a5a44', '#3d5066', '#7a6a58', '#5a4a40'];
const SKINS = ['#e0a37a', '#d99a72', '#e8b48c'], HAIRS = ['#3a2a20', '#5a3a22', '#2a2420', '#8a6a3a'];
const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 4, 8);
const lathe = (pts) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 12);
const G = {
  thigh: cap(0.085, 0.26), calf: cap(0.068, 0.26), foot: cap(0.05, 0.12), arm: cap(0.052, 0.5), hand: new THREE.SphereGeometry(0.058, 8, 6),
  head: new THREE.SphereGeometry(0.13, 12, 10), hair: new THREE.SphereGeometry(0.139, 12, 7, 0, Math.PI * 2, 0, 1.75), scarf: new THREE.SphereGeometry(0.15, 12, 8, 0, Math.PI * 2, 0, 2.3),
  torso: lathe([[0.001, 0], [0.15, 0], [0.155, 0.14], [0.145, 0.28], [0.19, 0.5], [0.2, 0.57], [0.15, 0.64], [0.07, 0.68], [0.06, 0.74], [0.001, 0.74]]),
  skirt: lathe([[0.001, -0.72], [0.3, -0.72], [0.17, 0.02], [0.001, 0.02]]), robe: lathe([[0.001, -0.88], [0.27, -0.88], [0.18, 0.02], [0.001, 0.02]]),   // listed bottom to top, so the surface faces outwards
  uarm: cap(0.052, 0.2), farm: cap(0.048, 0.2),
  fes: new THREE.CylinderGeometry(0.085, 0.1, 0.13, 10), cap: new THREE.SphereGeometry(0.137, 10, 5, 0, Math.PI * 2, 0, 1.1), bloom: new THREE.IcosahedronGeometry(0.07, 0),
  catBody: new THREE.SphereGeometry(1, 12, 10), catLeg: new THREE.CylinderGeometry(0.04, 0.035, 0.26, 6).translate(0, -0.13, 0), catTail: new THREE.CylinderGeometry(0.035, 0.05, 0.6, 6).translate(0, 0.3, 0), ear: new THREE.ConeGeometry(0.07, 0.14, 4),
  box: new THREE.BoxGeometry(1, 1, 1), rod: new THREE.CylinderGeometry(1, 1, 1, 6), ball: new THREE.IcosahedronGeometry(1, 1),
  wheel: new THREE.TorusGeometry(0.34, 0.03, 6, 20).rotateY(Math.PI / 2), cone: new THREE.ConeGeometry(0.05, 0.17, 8), tube: cap(0.2, 2.5).rotateX(Math.PI / 2), tubeX: cap(0.2, 0.8).rotateZ(Math.PI / 2),
};
const BLOCK = new THREE.MeshBasicMaterial();
const UPY = new THREE.Vector3(0, 1, 0);
const k = (rate, dt) => 1 - Math.exp(-rate * dt);
const sm = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };

export function createPeople(scene, world, R) {
  const pick = (a) => a[Math.floor(R() * a.length)], list = [], mats = {};
  const matOf = (t) => mats[t] ||= washMat(t);
  const timing = (tagName, pos) => {
    const src = tag(tagName).source, d = src ? pos.distanceTo(src) : 0;
    tag(tagName).subs.push({ box: new THREE.Box3().setFromCenterAndSize(pos.clone().setY(pos.y + 1), new THREE.Vector3(1, 2, 1)), ranges: [], hranges: [] });
    return d < 5 ? { delay: 0, dur: 3.2 } : { delay: 2.6 + Math.min(d, 150) / 150 * 2.5, dur: 2.2 };
  };
  const block = (x, y, z, w, h, d, data) => {
    const c = new THREE.Mesh(G.box, BLOCK); c.matrixAutoUpdate = false; c.matrix.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d));
    c.matrixWorld.copy(c.matrix); c.userData = data; world.colliders.push(c); return c;
  };
  // a painter for one figure: every part shares the figure's place and moment in the colouring wave
  const painter = (tagName, pos, radius = 2.6) => {
    const tm = timing(tagName, pos), seed = [pos.x, pos.y + 1.2, pos.z];
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
    const pos = new THREE.Vector3(o.x, o.y, o.z), sc = o.sc || 1, P = painter(o.tag, pos);
    const root = new THREE.Group(); root.position.copy(pos); root.rotation.y = o.ry || 0; root.scale.setScalar(1.05 * sc); scene.add(root);
    const skin = pick(SKINS), top0 = o.robe ? '#e9e2d0' : pick(TOPS), top = o.kind === 'girl' ? '#e0567f' : top0, bottom = pick(BOTTOMS), gown = o.robe || o.woman;
    const hips = grp(root, 0, 0.92, 0), legs = [];
    if (o.robe) P(G.robe, '#6a5a4a', hips, 0, 0, 0, '#4f4236');
    else if (o.woman && o.kind !== 'girl') P(G.skirt, pick(TOPS), hips, 0, 0, 0);
    if ((!gown || o.kind === 'sit') && o.kind !== 'girl' && o.kind !== 'raft') for (const s of [-1, 1]) {
      const hip = grp(hips, s * 0.09, 0, 0); P(G.thigh, bottom, hip, 0, -0.2, 0);
      const knee = grp(hip, 0, -0.42, 0); P(G.calf, bottom, knee, 0, -0.2, 0);
      const f = P(G.foot, '#3a322c', knee, 0, -0.42, 0.06); f.rotation.x = Math.PI / 2;
      legs.push({ hip, knee });
    }
    const torso = grp(hips, 0, 0, 0); const body = P(G.torso, top, torso, 0, 0, 0); body.scale.z = 0.72;
    const head = grp(torso, 0, 0.85, 0.01); P(G.head, skin, head, 0, 0, 0);
    if (sc < 1) head.scale.setScalar(1.25);                       // children: a bigger head
    if (o.fes) painter('fes', pos)(G.fes, '#b3312c', head, 0, 0.15, 0, '#8f2420'); else if (o.robe) P(G.cap, '#f3efe6', head, 0, 0.02, 0);
    else if (o.woman && (o.scarf || R() < 0.5) && o.kind !== 'girl') { const s = P(G.scarf, pick(TOPS), head, 0, 0.012, -0.012); s.rotation.x = -0.25; }
    else {
      const hc = pick(HAIRS), h = P(G.hair, hc, head, 0, 0.012, -0.012); h.rotation.x = -0.3;
      if (o.woman) { const long = P(G.head, hc, head, 0, -0.13, -0.075); long.scale.set(1.02, 1.75, 0.62); }      // long hair down the back
      if (o.kind === 'girl') { const fl = P(G.bloom, '#f2c230', head, 0.1, 0.09, 0.06); fl.scale.setScalar(0.7); }
    }
    const arms = [-1, 1].map((s) => { const sh = grp(torso, s * 0.2, 0.56, 0); P(G.uarm, top, sh, 0, -0.135, 0); const el = grp(sh, 0, -0.27, 0); P(G.farm, top, el, 0, -0.14, 0); const hand = P(G.hand, skin, el, 0, -0.3, 0); return { sh, el, hand, s }; });
    const p = { o, root, hips, torso, head, legs, arms, phase: R() * 6, clap: 0, s: 0, dir: 1, P, sc, y0: o.y };
    const moving = o.kind === 'walk' || o.kind === 'bike' || o.kind === 'keeper';
    if (o.kind !== 'girl' && o.kind !== 'swing') p.block = block(o.x, o.y + sc, o.z, 0.8 * sc + (o.kind === 'bike' ? 0.5 : 0), 2 * sc, 0.8 * sc + (o.kind === 'bike' ? 0.5 : 0), { wall: true, person: true });
    if (moving && o.to) { p.from = pos.clone(); p.to = new THREE.Vector3(o.to[0], o.y, o.to[1]); root.rotation.y = Math.atan2(p.to.x - p.from.x, p.to.z - p.from.z); }
    if (o.kind === 'sit' || o.kind === 'raft') { hips.position.y = 0.5; for (const l of legs) { l.hip.rotation.x = -1.5; l.knee.rotation.x = o.kind === 'raft' ? 0.55 : 1.45; } }
    if (o.kind === 'girl') torso.rotation.x = 0.5;
    if (o.kind === 'boy') for (const [dx, dy, c] of [[0, 0.1, '#e0453a'], [0.07, 0.03, '#f2c230'], [-0.07, 0.04, '#f08fb0'], [0, -0.02, '#5a9148']]) P(G.bloom, c, arms[1].el, dx, -0.41 - dy, 0.02);

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
      const P = painter('kayak', pos), pd = p.paddle = grp(torso, 0, 0.36, 0.5);
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
    if (o.dog) p.dogBlock = block(o.x, o.y + 0.4, o.z, 0.5, 0.8, 0.9, { wall: true, person: true });
    if (o.kind === 'keeper') { for (const l of legs) { l.hip.rotation.x = -0.45; l.knee.rotation.x = 0.8; l.hip.rotation.z = 0; } hips.position.y = 0.84; for (const a of arms) a.sh.rotation.z = a.s * 0.95; }
    if (o.kind === 'cheer') { arms[1].sh.rotation.z = 2.5; }
    list.push(p); return p;
  }
  for (const o of world.people) person(o);

  // ---- the football ----
  const kickers = list.filter((p) => p.o.ball !== undefined).sort((a, b) => a.o.ball - b.o.ball);
  const ballHome = new THREE.Vector3(31.2, 12.29, 76.2), BP = painter('ball', ballHome, 1), ball = BP(G.ball, '#f8f4ea', scene, 0, 0, 0, '#cfd6d8');
  ball.scale.setScalar(0.17); ball.position.copy(ballHome);
  const ballBlock = block(ballHome.x, ballHome.y, ballHome.z, 0.4, 0.4, 0.4, { wall: true, person: true }), dogP = new THREE.Vector3();
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();

  // ---- the slide: where the sliding child is at each moment of its round ----
  const SLD = world.slide, kidS = 1.05 * 0.66, seatDrop = 0.36 * 0.66;
  const WALK = [[-5.3, 0, 0], [-5.3, 0, 1.7], [2.3, 0, 1.7], [2.0, 0, 0]].map((a) => new THREE.Vector3(...a));
  const TOPSEAT = new THREE.Vector3(-0.45, 1.96 - seatDrop, 0), FOOT = new THREE.Vector3(-4.75, 0.52 - seatDrop, 0), LAND = new THREE.Vector3(1.0, 1.96, 0);
  function slideAt(T, out) {    // returns: sit (0..1), facing, walking (0..1)
    const t = T % 10.5; let sit = 0, ry = -Math.PI / 2, walk = 0;
    if (t < 1.2) { out.lerpVectors(TOPSEAT, FOOT, (t / 1.2) ** 1.6); sit = 1; }
    else if (t < 1.8) { const u = sm((t - 1.2) / 0.6); out.lerpVectors(FOOT, WALK[0], u); sit = 1 - u; }
    else if (t < 7) {
      const u = (t - 1.8) / 5.2 * 11.03; walk = 1;
      if (u < 1.7) { out.lerpVectors(WALK[0], WALK[1], u / 1.7); ry = 0; } else if (u < 9.3) { out.lerpVectors(WALK[1], WALK[2], (u - 1.7) / 7.6); ry = Math.PI / 2; } else { out.lerpVectors(WALK[2], WALK[3], (u - 9.3) / 1.73); ry = Math.PI; }
    } else if (t < 8.6) { out.lerpVectors(WALK[3], LAND, (t - 7) / 1.6); walk = 1; }
    else if (t < 9.2) { const u = sm((t - 8.6) / 0.6); out.lerpVectors(LAND, TOPSEAT, u); sit = u; }
    else { out.copy(TOPSEAT); sit = 1; }
    return [sit, ry, walk];
  }

  // ---- the cat ----
  const C = world.cat, cpos = new THREE.Vector3(C.x, C.y, C.z), ctm = timing('cat', cpos), cmat = washMat('cat');
  const cat = new THREE.Group(); cat.position.copy(cpos); scene.add(cat);
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
    list, cat, ball,
    applaud() { for (const p of list) if (p.o.kind === 'watch') p.cheer = true; },
    update(dt, time, life) {
      const alive = life > 0.5;
      for (const p of list) {
        const t = time * (alive ? 1 : 0) + p.phase, [a0, a1] = p.arms, o = p.o;
        if (o.kind === 'walk' || o.kind === 'bike') {
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
            a0.sh.rotation.x = sw * (run ? 1 : 0.6); if (!o.dog) a1.sh.rotation.x = -sw * (run ? 1 : 0.6); p.hips.position.y = 0.92 + (alive ? Math.abs(Math.cos(t * cad)) * (run ? 0.06 : 0.025) : run ? 0.05 : 0);
            if (run) { p.torso.rotation.x = 0.26; for (const a of p.arms) a.el.rotation.x = -1.5; }     // leaning in, elbows bent: running
            if (o.dog) {
              const ds = alive ? Math.sin(t * 11) * 0.5 : 0.3;
              p.dogLegs.forEach((l, i) => { l.rotation.x = (i === 0 || i === 3 ? ds : -ds); });
              p.dogTail.rotation.z = alive ? Math.sin(t * 9) * 0.5 : 0.2; p.dogHead.rotation.y = alive ? Math.sin(t * 0.8) * 0.3 : 0.25; p.dog.position.y = alive ? Math.abs(Math.sin(t * 11)) * 0.02 : 0;
              p.dog.getWorldPosition(dogP); p.dogBlock.matrixWorld.setPosition(dogP.x, dogP.y + 0.4, dogP.z);
            }
          }
        } else if (o.kind === 'watch') {
          if (p.cheer && alive) {
            const f = p.f ||= 2.2 + R() * 1.5, wave = Math.sin(t * 0.31 * f + p.phase * 2) > 0.2, j = Math.max(0, Math.sin(t * f)) ** 2;
            p.root.position.y = p.y0 + j * (wave ? 0.16 : 0.06);
            for (const a of p.arms) {
              if (wave) { a.sh.rotation.x += (-2.85 + Math.sin(t * 2.3 * f + a.s) * 0.25 - a.sh.rotation.x) * k(8, dt); a.sh.rotation.z = -a.s * 0.3; a.el.rotation.x = -0.25; }     // arms up, cheering
              else { a.sh.rotation.x += (-1.15 - a.sh.rotation.x) * k(8, dt); a.sh.rotation.z = -a.s * (0.3 + 0.16 * Math.sin(t * 6.5 * f)); a.el.rotation.x = -0.6; }                    // clapping
            }
          } else { a0.sh.rotation.x += ((o.look === 0 ? -2.2 : 0) - a0.sh.rotation.x) * k(5, dt); a0.sh.rotation.z = o.look === 0 ? 0.5 : -0.08; a1.sh.rotation.x += (0 - a1.sh.rotation.x) * k(5, dt); a1.sh.rotation.z = 0.08; }
          p.head.rotation.y = alive ? Math.sin(t * 0.7) * 0.25 : 0; p.torso.rotation.y = alive ? Math.sin(t * 0.4) * 0.1 : 0;
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
          const [sit, ry, walk] = alive ? slideAt(time + p.phase, tmpA) : [1, -Math.PI / 2, 0];
          if (alive) { p.root.position.set(SLD.x + tmpA.x, SLD.y + tmpA.y, SLD.z + tmpA.z); p.root.rotation.y += Math.atan2(Math.sin(ry - p.root.rotation.y), Math.cos(ry - p.root.rotation.y)) * k(8, dt); }
          else p.root.position.set(SLD.x + TOPSEAT.x, SLD.y + TOPSEAT.y, SLD.z);
          const sw = Math.sin(t * 8) * 0.6 * walk * (1 - sit);
          p.hips.position.y = 0.92 - 0.42 * sit;
          p.legs.forEach((l, i) => { const s = i ? sw : -sw; l.hip.rotation.x = s - 1.45 * sit; l.knee.rotation.x = Math.max(0, -s) * 0.9 + 0.5 * sit; });
          if (alive) p.block.matrixWorld.setPosition(p.root.position.x, p.root.position.y + 0.6, p.root.position.z);
          const up = sit * (alive ? 1 : 0.6); a0.sh.rotation.z = -up * 2.3; a1.sh.rotation.z = up * 2.3; a0.sh.rotation.x = sw * 0.5; a1.sh.rotation.x = -sw * 0.5;
        }
      }
      // the ball goes back and forth between the two who chase it
      if (alive && kickers.length === 2) {
        const h = 0.5 - 0.5 * Math.cos(time * 1.15);
        for (const [p, v] of [[kickers[0], tmpA], [kickers[1], tmpB]]) v.copy(p.root.position).add(new THREE.Vector3(Math.sin(p.root.rotation.y) * 0.45, 0, Math.cos(p.root.rotation.y) * 0.45));
        ball.position.lerpVectors(tmpA, tmpB, h); ball.position.y = ballHome.y + Math.abs(Math.sin(time * 2.3)) * 0.35 * Math.sin(Math.PI * h); ball.rotation.x += dt * 5;
        ballBlock.matrixWorld.setPosition(ball.position.x, ball.position.y, ball.position.z);
      }
      // the cat sits until the town wakes, then strolls along its wall with pauses
      const c = catS;
      if (alive) { c.rest -= dt; if (c.rest < 0) { c.x += c.dir * dt * 0.9; if (c.x > C.x1 || c.x < C.x0) { c.dir *= -1; c.rest = 1.5 + R() * 3; c.x = Math.min(C.x1, Math.max(C.x0, c.x)); } else if (R() < dt * 0.12) c.rest = 1 + R() * 2.5; } }
      const moving = alive && c.rest < 0; c.walk += ((moving ? 1 : 0) - c.walk) * k(5, dt);
      cat.position.x = c.x; cat.rotation.y = c.dir > 0 ? 0 : Math.PI; world.catBlock.matrixWorld.setPosition(c.x, C.y + 0.4, C.z);
      cbody.rotation.z = (1 - c.walk) * 0.5; cbody.position.y = c.walk * 0.06;
      const sw = Math.sin(time * 9) * 0.5 * c.walk;
      clegs.forEach((l, i) => { l.rotation.z = (i === 0 || i === 3 ? sw : -sw); l.scale.y = 0.35 + 0.65 * c.walk; });
      ctail.rotation.z = 0.5 + (alive ? Math.sin(time * 1.7) * 0.35 : 0); ctail.rotation.x = alive ? Math.sin(time * 1.1) * 0.3 : 0;
      chead.rotation.y = alive && !moving ? Math.sin(time * 0.8) * 0.5 : 0;
    },
  };
}
