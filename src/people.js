// The people of Mostar and the cat. All of them stand frozen in the sketch until the
// finale brings the town to life; then they walk, talk, sell, applaud and wave.
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
  skirt: lathe([[0.001, 0.02], [0.17, 0.02], [0.3, -0.72], [0.001, -0.72]]), robe: lathe([[0.001, 0.02], [0.18, 0.02], [0.27, -0.88], [0.001, -0.88]]),
  fes: new THREE.CylinderGeometry(0.085, 0.1, 0.13, 10), cap: new THREE.SphereGeometry(0.137, 10, 5, 0, Math.PI * 2, 0, 1.1), bloom: new THREE.IcosahedronGeometry(0.07, 0),
  catBody: new THREE.SphereGeometry(1, 12, 10), catLeg: new THREE.CylinderGeometry(0.04, 0.035, 0.26, 6).translate(0, -0.13, 0), catTail: new THREE.CylinderGeometry(0.035, 0.05, 0.6, 6).translate(0, 0.3, 0), ear: new THREE.ConeGeometry(0.07, 0.14, 4),
  box: new THREE.BoxGeometry(1, 1, 1),
};
const BLOCK = new THREE.MeshBasicMaterial();

export function createPeople(scene, world, R) {
  const pick = (a) => a[Math.floor(R() * a.length)], list = [];
  const timing = (tagName, pos) => {
    const src = tag(tagName).source, d = src ? pos.distanceTo(src) : 0;
    tag(tagName).subs.push({ box: new THREE.Box3().setFromCenterAndSize(pos.clone().setY(pos.y + 1), new THREE.Vector3(1, 2, 1)), ranges: [], hranges: [] });
    return d < 5 ? { delay: 0, dur: 3.2 } : { delay: 2.6 + Math.min(d, 150) / 150 * 2.5, dur: 2.2 };
  };
  const block = (x, y, z, w, h, d, data) => {
    const c = new THREE.Mesh(G.box, BLOCK); c.matrixAutoUpdate = false; c.matrix.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d));
    c.matrixWorld.copy(c.matrix); c.userData = data; world.colliders.push(c); return c;
  };

  function person(o) {
    const pos = new THREE.Vector3(o.x, o.y, o.z), tm = timing(o.tag, pos), mat = washMat(o.tag), seed = [o.x, o.y + 1.2, o.z];
    const root = new THREE.Group(); root.position.copy(pos); root.rotation.y = o.ry || 0; root.scale.setScalar(1.05); scene.add(root);
    const P = (geo, col, parent, x, y, z, bleed) => {
      const m = new THREE.Mesh(paintGeo(geo, { col, bleed: bleed ?? col, seed, radius: 2.6, delay: tm.delay, dur: tm.dur, hatch: 0.5 }), mat);
      m.position.set(x, y, z); addHull(m, 1.3); parent.add(m); return m;
    };
    const grp = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
    const skin = pick(SKINS), top = o.robe ? '#e9e2d0' : pick(TOPS), bottom = pick(BOTTOMS), gown = o.robe || o.woman;
    const hips = grp(root, 0, 0.92, 0), legs = [];
    if (o.robe) P(G.robe, '#6a5a4a', hips, 0, 0, 0, '#4f4236');
    else if (o.woman) P(G.skirt, pick(TOPS), hips, 0, 0, 0);
    if (!gown || o.kind === 'sit') for (const s of [-1, 1]) {
      const hip = grp(hips, s * 0.09, 0, 0); P(G.thigh, bottom, hip, 0, -0.2, 0);
      const knee = grp(hip, 0, -0.42, 0); P(G.calf, bottom, knee, 0, -0.2, 0);
      const f = P(G.foot, '#3a322c', knee, 0, -0.42, 0.06); f.rotation.x = Math.PI / 2;
      legs.push({ hip, knee });
    }
    const torso = grp(hips, 0, 0, 0); const body = P(G.torso, top, torso, 0, 0, 0); body.scale.z = 0.72;
    const head = grp(torso, 0, 0.85, 0.01); P(G.head, skin, head, 0, 0, 0);
    if (o.fes) P(G.fes, '#b3312c', head, 0, 0.15, 0); else if (o.robe) P(G.cap, '#f3efe6', head, 0, 0.02, 0);
    else if (o.woman && R() < 0.5) { const sc = P(G.scarf, pick(TOPS), head, 0, 0.012, -0.012); sc.rotation.x = -0.25; }
    else { const h = P(G.hair, pick(HAIRS), head, 0, 0.012, -0.012); h.rotation.x = -0.3; }
    const arms = [-1, 1].map((s) => { const sh = grp(torso, s * 0.2, 0.56, 0); P(G.arm, top, sh, 0, -0.27, 0); const hand = P(G.hand, skin, sh, 0, -0.57, 0); return { sh, hand, s }; });
    const p = { o, root, hips, torso, head, legs, arms, phase: R() * 6, clap: 0, s: 0, dir: 1, P };
    if (o.kind !== 'walk' && o.kind !== 'girl') p.block = block(o.x, o.y + 1, o.z, 0.8, 2, 0.8, { wall: true, person: true });
    if (o.kind === 'walk') { p.from = pos.clone(); p.to = new THREE.Vector3(o.to[0], o.y, o.to[1]); p.block = block(o.x, o.y + 1, o.z, 0.8, 2, 0.8, { wall: true, person: true }); }
    if (o.kind === 'sit') { hips.position.y = 0.5; for (const l of legs) { l.hip.rotation.x = -1.5; l.knee.rotation.x = 1.45; } }
    if (o.kind === 'girl') { torso.rotation.x = 0.5; hips.visible = true; }
    if (o.kind === 'boy') for (const [dx, dy, c] of [[0, 0.1, '#e0453a'], [0.07, 0.03, '#f2c230'], [-0.07, 0.04, '#f08fb0'], [0, -0.02, '#5a9148']]) P(G.bloom, c, arms[1].sh, dx, -0.68 - dy, 0.02);
    list.push(p); return p;
  }
  for (const o of world.people) person(o);

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

  const k = (rate, dt) => 1 - Math.exp(-rate * dt);
  return {
    list, cat,
    applaud(seconds) { for (const p of list) if (p.o.kind === 'watch') p.clap = seconds + R(); },
    update(dt, time, life) {
      const alive = life > 0.5;
      for (const p of list) {
        const t = time * (alive ? 1 : 0) + p.phase, [a0, a1] = p.arms, o = p.o;
        if (o.kind === 'walk') {
          if (alive) {
            p.s += p.dir * dt * 1.25 / p.from.distanceTo(p.to); if (p.s > 1 || p.s < 0) { p.dir *= -1; p.s = Math.min(1, Math.max(0, p.s)); }
            p.root.position.lerpVectors(p.from, p.to, p.s);
            const want = Math.atan2((p.to.x - p.from.x) * p.dir, (p.to.z - p.from.z) * p.dir);
            p.root.rotation.y += Math.atan2(Math.sin(want - p.root.rotation.y), Math.cos(want - p.root.rotation.y)) * k(5, dt);
            p.block.matrixWorld.setPosition(p.root.position.x, p.root.position.y + 1, p.root.position.z);
          } else p.root.rotation.y = Math.atan2(p.to.x - p.from.x, p.to.z - p.from.z);
          const sw = alive ? Math.sin(t * 6.5) * 0.5 : 0.42;
          p.legs.forEach((l, i) => { const s = i ? sw : -sw; l.hip.rotation.x = s; l.knee.rotation.x = Math.max(0, -s) * 0.9; });
          a0.sh.rotation.x = sw * 0.6; a1.sh.rotation.x = -sw * 0.6; p.hips.position.y = 0.92 + (alive ? Math.abs(Math.cos(t * 6.5)) * 0.025 : 0);
        } else if (o.kind === 'watch') {
          if (p.clap > 0 && alive) { p.clap -= dt; const c = Math.sin(time * 21 + p.phase); for (const a of p.arms) { a.sh.rotation.x += (-1.25 - a.sh.rotation.x) * k(10, dt); a.sh.rotation.z = -a.s * (0.34 + 0.2 * c); } p.hips.position.y = 0.92 + Math.abs(c) * 0.012; }
          else { a0.sh.rotation.x += ((o.look === 0 ? -2.2 : 0) - a0.sh.rotation.x) * k(5, dt); a0.sh.rotation.z = o.look === 0 ? 0.5 : -0.08; a1.sh.rotation.x += (0 - a1.sh.rotation.x) * k(5, dt); a1.sh.rotation.z = 0.08; }
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
        }
      }
      // the cat sits until the town wakes, then strolls along its wall with pauses
      const c = catS;
      if (alive) { c.rest -= dt; if (c.rest < 0) { c.x += c.dir * dt * 0.9; if (c.x > C.x1 || c.x < C.x0) { c.dir *= -1; c.rest = 1.5 + R() * 3; c.x = Math.min(C.x1, Math.max(C.x0, c.x)); } else if (R() < dt * 0.12) c.rest = 1 + R() * 2.5; } }
      const moving = alive && c.rest < 0; c.walk += ((moving ? 1 : 0) - c.walk) * k(5, dt);
      cat.position.x = c.x; cat.rotation.y = c.dir > 0 ? 0 : Math.PI;
      cbody.rotation.z = (1 - c.walk) * 0.5; cbody.position.y = c.walk * 0.06;
      const sw = Math.sin(time * 9) * 0.5 * c.walk;
      clegs.forEach((l, i) => { l.rotation.z = (i === 0 || i === 3 ? sw : -sw); l.scale.y = 0.35 + 0.65 * c.walk; });
      ctail.rotation.z = 0.5 + (alive ? Math.sin(time * 1.7) * 0.35 : 0); ctail.rotation.x = alive ? Math.sin(time * 1.1) * 0.3 : 0;
      chead.rotation.y = alive && !moving ? Math.sin(time * 0.8) * 0.5 : 0;
    },
  };
}
