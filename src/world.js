// A small slice of Mostar, all in the sketch state.
import * as THREE from 'three';
import S from './settings.js';
import { washMaterial, addInk, addHull, newPaint, rng } from './paper.js';

export const BANK = 12; // height of the riverbank tops; the water is at 0

export function buildWorld(scene) {
  const C = S.colors, R = rng(7);
  const colliders = [];
  const loose = [];               // single meshes that get their ink lines in one batch
  const SK = newPaint();          // shared "still a sketch" paint state

  const M = (geo, color, o = {}) => new THREE.Mesh(geo, washMaterial({ color, paint: SK, ...o }));
  const put = (mesh, solid = true) => { scene.add(mesh); loose.push(mesh); if (solid) colliders.push(mesh); return mesh; };

  // ---- sky, sun, clouds ----
  const sky = M(new THREE.SphereGeometry(700, 24, 16), C.sky, { side: THREE.BackSide, hatch: 0, scale: 0.02 });
  scene.add(sky);

  const sun = new THREE.Group();
  sun.position.set(-0.55, 0.4, -0.72).normalize().multiplyScalar(520);
  const inkBasic = new THREE.MeshBasicMaterial({ color: S.ink.color, side: THREE.DoubleSide });
  const disc = M(new THREE.CircleGeometry(30, 40), C.sun, { hatch: 0, scale: 0.05, side: THREE.DoubleSide });
  sun.add(disc);
  for (const [r0, ox, oy] of [[30, 0, 0], [30.8, 0.9, -0.6]]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(r0, r0 + 0.75, 56), inkBasic);
    ring.position.set(ox, oy, 0.5); sun.add(ring);
  }
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.1, len = 8 + R() * 7;
    const ray = new THREE.Mesh(new THREE.PlaneGeometry(0.75, len), inkBasic);
    ray.position.set(Math.cos(a) * (38 + len / 2), Math.sin(a) * (38 + len / 2), 0.5);
    ray.rotation.z = a - Math.PI / 2 + (R() - 0.5) * 0.08;
    sun.add(ray);
  }
  sun.lookAt(0, 20, 0);
  scene.add(sun);

  const cloudGeo = new THREE.SphereGeometry(1, 14, 10);
  for (const [x, y, z, s] of [[-90, 62, -120, 6], [70, 72, -170, 8], [150, 58, 40, 6], [-160, 66, 60, 7], [10, 84, 180, 7], [-30, 78, -230, 9]]) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); g.rotation.y = R() * 6;
    for (const [px, py, pz, r] of [[-2.2, 0, 0, 1.5], [-0.8, 0.6, 0.2, 1.9], [0.9, 0.5, -0.2, 2.1], [2.4, 0, 0, 1.5], [0.2, -0.2, 0.5, 1.8]]) {
      const p = M(cloudGeo, C.cloud, { hatch: 0.6, scale: 0.15 });
      p.position.set(px, py, pz); p.scale.set(r, r * 0.7, r); addHull(p, 2); g.add(p);
    }
    scene.add(g);
  }

  // ---- river and banks ----
  const river = M(new THREE.PlaneGeometry(26.4, 700), C.river, { water: 1, bleed: C.riverDeep });
  river.rotation.x = -Math.PI / 2; river.userData.water = true;
  scene.add(river); colliders.push(river);

  for (const side of [-1, 1]) {
    const bank = M(new THREE.BoxGeometry(400, 14, 700), C.bank, { bleed: C.grass });
    bank.position.set(side * 213, BANK - 7, 0); put(bank);
    // rocky ledges along the cliff
    for (let i = 0; i < 16; i++) {
      let z = (R() - 0.5) * 260; if (Math.abs(z) < 7) z += 14 * Math.sign(z || 1);
      const w = 2 + R() * 3.5, h = 2 + R() * 8, d = 3 + R() * 6;
      const rock = M(new THREE.BoxGeometry(w, h, d), C.bank, { bleed: C.stone });
      rock.position.set(side * (13.4 - w / 2), h / 2 - 0.5, z);
      rock.rotation.y = (R() - 0.5) * 0.3; put(rock);
    }
  }

  // ---- distant hills ----
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3, dist = 230 + R() * 60, h = 45 + R() * 55;
    const hill = M(new THREE.ConeGeometry(60 + R() * 40, h, 6, 1), C.hill, { scale: 0.2 });
    hill.position.set(Math.cos(a) * dist, BANK + h / 2 - 2, Math.sin(a) * dist);
    if (Math.abs(hill.position.x) < 90) hill.position.x = 90 * Math.sign(hill.position.x || 1);
    hill.rotation.y = R() * 6; put(hill, false);
  }

  // ---- Stari Most ----
  const bridgePaint = newPaint();
  const arch = new THREE.Shape();
  arch.moveTo(-17, 12.5); arch.lineTo(0, 18); arch.lineTo(17, 12.5); arch.lineTo(17, 4); arch.lineTo(13, 4);
  arch.absarc(0, 2.4, 13.1, 0.1225, Math.PI - 0.1225, false);
  arch.lineTo(-17, 4); arch.closePath();
  const bridge = M(new THREE.ExtrudeGeometry(arch, { depth: 4, bevelEnabled: false, curveSegments: 28 }).translate(0, 0, -2), C.bridge, { paint: bridgePaint, bleed: C.stone });
  put(bridge);
  const rail = new THREE.Shape();
  rail.moveTo(-17, 12.5); rail.lineTo(0, 18); rail.lineTo(17, 12.5); rail.lineTo(17, 13.3); rail.lineTo(0, 18.8); rail.lineTo(-17, 13.3); rail.closePath();
  for (const z of [-2, 1.7]) {
    const p = M(new THREE.ExtrudeGeometry(rail, { depth: 0.3, bevelEnabled: false }).translate(0, 0, z), C.bridge, { paint: bridgePaint });
    put(p);
  }
  for (const side of [-1, 1]) {
    const tower = M(new THREE.BoxGeometry(5, 10, 5), C.stone, { pool: 1 });
    tower.position.set(side * 21, BANK + 5, -5.5); put(tower);
    const cap = M(new THREE.ConeGeometry(4.1, 2.8, 4), C.roofDark);
    cap.position.set(side * 21, BANK + 11.4, -5.5); cap.rotation.y = Math.PI / 4; put(cap);
  }

  // ---- the diver, frozen on the ledge ----
  const diver = new THREE.Group();
  diver.position.set(0, 18.8, 1.85); diver.scale.setScalar(1.3);
  const dp = (geo, color, x, y, z, rz = 0) => {
    const m = M(geo, color, { hatch: 0.5 }); m.position.set(x, y, z); m.rotation.z = rz; addHull(m, 1.4); diver.add(m); return m;
  };
  const leg = new THREE.CapsuleGeometry(0.1, 0.72, 4, 8), arm = new THREE.CapsuleGeometry(0.07, 0.7, 4, 8);
  dp(leg, C.skin, -0.12, 0.46, 0); dp(leg, C.skin, 0.12, 0.46, 0);
  dp(new THREE.CapsuleGeometry(0.2, 0.42, 4, 10), C.skin, 0, 1.22, 0);
  dp(new THREE.CapsuleGeometry(0.21, 0.12, 4, 10), C.trunks, 0, 0.9, 0);
  dp(new THREE.SphereGeometry(0.16, 12, 10), C.skin, 0, 1.76, 0);
  dp(arm, C.skin, -0.62, 1.48, 0, Math.PI / 2 - 0.16); dp(arm, C.skin, 0.62, 1.48, 0, -(Math.PI / 2 - 0.16));
  scene.add(diver);

  // ---- houses ----
  function house(o) {
    const { w, d, h, rh } = o, g = new THREE.Group();
    g.position.set(o.x, BANK, o.z); g.rotation.y = o.rot || 0;
    const paint = o.paint || SK, wall = o.wall || C.wall, roofC = o.roof || C.roof;
    const parts = [], solids = [];
    const add = (geo, color, x, y, z, opt = {}, solid = false) => {
      const m = new THREE.Mesh(geo, washMaterial({ color, paint, ...opt }));
      m.position.set(x, y, z); g.add(m); parts.push(m); if (solid) solids.push(m); return m;
    };
    add(new THREE.BoxGeometry(w, h, d), wall, 0, h / 2, 0, { pool: 1, bleed: C.wallWarm }, true);
    const tri = new THREE.Shape(); tri.moveTo(-w / 2, 0); tri.lineTo(w / 2, 0); tri.lineTo(0, rh); tri.closePath();
    add(new THREE.ExtrudeGeometry(tri, { depth: d, bevelEnabled: false }).translate(0, 0, -d / 2), wall, 0, h, 0, { bleed: C.wallWarm }, true);
    const a = Math.atan2(rh, w / 2), sl = Math.hypot(w / 2, rh) + 0.7, t = 0.28;
    for (const sd of [-1, 1]) {
      const slab = add(new THREE.BoxGeometry(sl, t, d + 0.9), roofC, sd * Math.cos(a) * sl / 2 + sd * Math.sin(a) * t / 2,
        h + rh - Math.sin(a) * sl / 2 + Math.cos(a) * t / 2, 0, { pool: 1, bleed: C.roofDark }, true);
      slab.rotation.z = -sd * a;
    }
    add(new THREE.BoxGeometry(0.9, 2, 0.9), C.stone, w * 0.26, h + rh * 0.75, -d * 0.2, { pool: 1 }, true);
    add(new THREE.BoxGeometry(1.2, 2.1, 0.14), C.door, o.doorX ?? -w * 0.2, 1.05, d / 2 + 0.03, { pool: 1 });
    const win = new THREE.BoxGeometry(1, 1.25, 0.12);
    add(win, C.window, w * 0.22, h * 0.56, d / 2 + 0.03, { pool: 1 });
    if (h > 5) add(win, C.window, -w * 0.2, h * 0.78, d / 2 + 0.03, { pool: 1 });
    for (const sd of [-1, 1]) {
      const sw = add(win, C.window, sd * (w / 2 + 0.03), h * 0.6, 0, { pool: 1 }); sw.rotation.y = Math.PI / 2;
    }
    addInk(g, parts, { seed: (o.x * 31 + o.z) | 0 });
    scene.add(g); colliders.push(...solids);
    return { group: g, parts, solids, paint, o };
  }

  const tutPaint = newPaint();
  const tut = house({ x: -30, z: 22, rot: 0.6, w: 8, d: 7, h: 5.5, rh: 3, paint: tutPaint });
  house({ x: -22, z: -16, rot: 1.3, w: 7, d: 6, h: 6.5, rh: 2.6, roof: C.roofDark });
  house({ x: -41, z: -3, rot: 0.2, w: 9, d: 7, h: 5, rh: 3 });
  house({ x: -47, z: 31, rot: 1.0, w: 7, d: 7, h: 7, rh: 2.8, wall: C.wallWarm });
  house({ x: -35, z: -37, rot: 2.0, w: 8, d: 6, h: 5.5, rh: 2.5 });
  house({ x: -55, z: 9, rot: 1.6, w: 8, d: 6, h: 6, rh: 3, roof: C.roofDark });
  house({ x: 23, z: 15, rot: -1.2, w: 7, d: 6, h: 6, rh: 2.6 });
  house({ x: 31, z: -15, rot: -1.9, w: 9, d: 7, h: 5.2, rh: 3, wall: C.wallWarm });
  house({ x: 45, z: 2, rot: -0.3, w: 8, d: 7, h: 7, rh: 2.8, roof: C.roofDark });
  house({ x: 25, z: 39, rot: -0.9, w: 7, d: 6, h: 5, rh: 2.4 });
  house({ x: 41, z: 27, rot: -2.4, w: 8, d: 6, h: 6.2, rh: 2.8 });

  // ---- mosque with minaret ----
  const hall = M(new THREE.BoxGeometry(9, 6, 9), C.stone, { pool: 1 }); hall.position.set(38, BANK + 3, -36); put(hall);
  const dome = M(new THREE.SphereGeometry(4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), C.stone);
  dome.position.set(38, BANK + 6, -36); addHull(dome, 1.7); scene.add(dome); colliders.push(dome);
  const shaft = M(new THREE.CylinderGeometry(0.9, 1.1, 17, 8), C.stone); shaft.position.set(45.5, BANK + 8.5, -31); put(shaft);
  const balcony = M(new THREE.CylinderGeometry(1.6, 1.4, 0.7, 8), C.stone); balcony.position.set(45.5, BANK + 14, -31); put(balcony);
  const spire = M(new THREE.ConeGeometry(1.25, 4.5, 8), C.roofDark); spire.position.set(45.5, BANK + 19.2, -31); put(spire);

  // ---- trees ----
  for (const [x, z, s] of [[-16, 8, 1], [-18, 32, 1.2], [-40, 16, 1.1], [-27, -27, 0.9], [18, -4, 1.1], [17, 27, 1], [35, 10, 1.2], [52, -18, 1], [-62, -20, 1.3], [-50, 50, 1.1], [34, 52, 1]]) {
    const trunk = M(new THREE.CylinderGeometry(0.2 * s, 0.28 * s, 1.6 * s, 6), C.door); trunk.position.set(x, BANK + 0.8 * s, z); put(trunk, false);
    const crown = M(new THREE.ConeGeometry(1.3 * s, 4.2 * s, 7), C.tree, { bleed: C.grass }); crown.position.set(x, BANK + 3.5 * s, z); crown.rotation.y = R() * 6; put(crown);
  }

  // ---- the rock the bird starts on ----
  const startRock = M(new THREE.DodecahedronGeometry(1.2, 0), C.stone); startRock.scale.y = 0.7;
  startRock.position.set(-21, BANK + 0.5, 47); put(startRock);

  addInk(scene, loose, { seed: 5 });
  scene.updateMatrixWorld(true);

  // ---- the tutorial orb's data ----
  const { w, d, h, rh } = tut.o;
  const perch = tut.group.localToWorld(new THREE.Vector3(0, h + rh + 0.3, 0));
  const centre = tut.group.localToWorld(new THREE.Vector3(0, h / 2, 0));
  tutPaint.uSeed.value.copy(perch);
  tutPaint.uRadius.value = Math.hypot(w / 2 + 1, d / 2 + 1, h + rh + 0.5);
  const V = (x, y, z) => new THREE.Vector3(centre.x + x, BANK + y, centre.z + z);

  return {
    colliders,
    start: new THREE.Vector3(-21, 0, 47),
    orbs: [{
      word: 'kuća', meaning: 'house', choices: ['most', 'kuća', 'rijeka'],
      paint: tutPaint, meshes: tut.solids, perch, centre,
      // predefined cutscene camera: where it starts, where it ends, and what it looks at
      cam: { from: V(6, 10, 22), to: V(17, 13, 14), lookFrom: V(0, 6.5, 0), lookTo: V(0, 4.5, 0) },
    }],
  };
}
