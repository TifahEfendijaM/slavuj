// Falling spring blossom petals for Jajce: one InstancedMesh (1 draw call) with per-instance colours.
// Hidden while the town is a sketch; wakes in the finale with a pink-and-white swirl over the Pliva Waterfall.
import * as THREE from 'three';

function makePetalGeo() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.11);
  s.quadraticCurveTo(0.11, -0.02, 0.08, 0.08);
  s.quadraticCurveTo(0.03, 0.14, 0, 0.11);
  s.quadraticCurveTo(-0.03, 0.14, -0.08, 0.08);
  s.quadraticCurveTo(-0.11, -0.02, 0, -0.11);
  return new THREE.ShapeGeometry(s, 3);
}

export function createSpringPetals(scene, {
  emitters,
  groundY,
  count = 240,
  colors = ['#ffd8e6', '#fff6f9', '#f7b2cc', '#ffeaf1', '#ffffff'],
}) {
  const geo = makePetalGeo();
  const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false;
  mesh.visible = false;

  const col = new THREE.Color();
  const items = [];
  let seed = 419;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  const dummy = new THREE.Object3D();
  dummy.scale.setScalar(0);
  dummy.updateMatrix();

  for (let i = 0; i < count; i++) {
    col.set(colors[i % colors.length]);
    mesh.setColorAt(i, col);
    mesh.setMatrixAt(i, dummy.matrix);
    items.push({
      em: emitters[i % emitters.length],
      state: 'wait',
      wait: rnd() * 12,
      x: 0, y: 0, z: 0,
      vx: 0, vy: 0, vz: 0,
      rx: 0, ry: 0, rz: 0,
      swayPh: rnd() * 6.28,
      swaySp: 2.0 + rnd() * 1.5,
      sink: 0.55 + rnd() * 0.5,
      scale: 0.75 + rnd() * 0.5,
      restT: 0,
      t: 0,
    });
  }
  mesh.instanceColor.needsUpdate = true;
  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);

  let shown = false, gustT = 0, gustCenter = null, clock = 0;

  function spawn(it, near) {
    const e = near || it.em;
    const a = rnd() * 6.28, r = Math.sqrt(rnd()) * e.r;
    it.x = e.x + Math.cos(a) * r;
    it.z = e.z + Math.sin(a) * r;
    it.y = e.y + (rnd() - 0.3) * e.r * 0.7;
    it.vx = (rnd() - 0.5) * 0.5;
    it.vz = (rnd() - 0.5) * 0.5;
    it.vy = -it.sink;
    it.rx = rnd() * 6.28; it.ry = rnd() * 6.28; it.rz = rnd() * 6.28;
    it.t = 0;
    it.state = 'fall';
  }

  return {
    mesh,
    show() { shown = true; mesh.visible = true; },
    gust(at) {
      shown = true; mesh.visible = true;
      gustT = 8.5;
      gustCenter = at ? { x: at.x, y: at.y, z: at.z, r: 5.5 } : null;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (i < Math.min(96, count * 0.4) && gustCenter) {
          spawn(it, gustCenter);
          const ang = rnd() * 6.28;
          it.vx = Math.cos(ang) * (2.4 + rnd() * 2.0);
          it.vz = Math.sin(ang) * (2.4 + rnd() * 2.0);
          it.vy = 0.7 + rnd() * 1.5;
        } else if (it.state === 'wait') {
          spawn(it);
        }
      }
    },
    update(dt) {
      if (!shown) return;
      dt = Math.min(dt, 0.05);
      clock += dt;
      if (gustT > 0) gustT = Math.max(0, gustT - dt);
      const boost = gustT / 8.5;
      const wx = 0.55 + Math.sin(clock * 0.28) * 0.3;
      const wz = -0.3 + Math.cos(clock * 0.22) * 0.25;

      for (let i = 0; i < count; i++) {
        const it = items[i];
        if (it.state === 'wait') {
          it.wait -= dt * (0.65 + boost * 3);
          if (it.wait <= 0) spawn(it);
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          continue;
        }
        if (it.state === 'fall') {
          it.t += dt;
          if (boost > 0.05 && gustCenter) {
            const dx = it.x - gustCenter.x, dz = it.z - gustCenter.z, d = Math.hypot(dx, dz);
            if (d < 18 && d > 0.4) {
              const swirl = boost * 3.5 * (1 - d / 18);
              it.vx += (-dz / d * swirl - dx / d * 0.35 * boost) * dt;
              it.vz += (dx / d * swirl - dz / d * 0.35 * boost) * dt;
            }
          }
          it.vx += (wx + Math.sin(clock * it.swaySp + it.swayPh) * 0.85 - it.vx) * Math.min(1, dt * 1.6);
          it.vz += (wz + Math.cos(clock * it.swaySp * 0.8 + it.swayPh) * 0.65 - it.vz) * Math.min(1, dt * 1.6);
          it.vy += (-it.sink * (0.65 + 0.4 * Math.sin(clock * it.swaySp + it.swayPh)) - it.vy) * Math.min(1, dt * 2.1);
          it.x += it.vx * dt; it.y += it.vy * dt; it.z += it.vz * dt;
          it.rx += dt * (1.7 + boost * 2.1);
          it.ry += dt * 1.3;
          it.rz += dt * 1.5;

          const gy = groundY(it.x, it.z);
          if (it.y <= gy + 0.04 || it.t > 45) {
            it.y = gy + 0.04;
            it.state = 'rest';
            it.restT = 6 + rnd() * 9;
            it.rx = -Math.PI / 2;
            it.rz = 0;
          }
          dummy.position.set(it.x, it.y, it.z);
          dummy.rotation.set(it.rx, it.ry, it.rz);
          dummy.scale.setScalar(it.scale);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        } else {
          it.restT -= dt;
          const sc = it.restT < 1 ? Math.max(0, it.restT) * it.scale : it.scale;
          if (it.restT <= 0) {
            it.state = 'wait';
            it.wait = 1 + rnd() * 5;
            dummy.scale.setScalar(0);
          } else {
            dummy.position.set(it.x, it.y, it.z);
            dummy.rotation.set(-Math.PI / 2, it.ry, 0);
            dummy.scale.setScalar(sc);
          }
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}
