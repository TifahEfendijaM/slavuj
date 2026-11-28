// Falling autumn leaves for Sarajevo: one InstancedMesh (1 draw call) with per-instance colours.
// Hidden while the town is a sketch; wakes in the finale with a gust around the Sebilj poplar.
import * as THREE from 'three';

function makeLeafGeo() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.15);
  s.quadraticCurveTo(0.12, -0.04, 0.08, 0.08);
  s.quadraticCurveTo(0.03, 0.16, 0, 0.19);
  s.quadraticCurveTo(-0.03, 0.16, -0.08, 0.08);
  s.quadraticCurveTo(-0.12, -0.04, 0, -0.15);
  return new THREE.ShapeGeometry(s, 3);
}

export function createAutumnLeaves(scene, { emitters, groundY, count = 240, colors = ['#e5b53c', '#d88a2e', '#c95c28', '#e8c85a', '#b84b26'] }) {
  const geo = makeLeafGeo();
  const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false;
  mesh.visible = false;

  const col = new THREE.Color();
  const items = [];
  let seed = 731;
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
      wait: rnd() * 14,
      x: 0, y: 0, z: 0,
      vx: 0, vy: 0, vz: 0,
      rx: 0, ry: 0, rz: 0,
      swayPh: rnd() * 6.28,
      swaySp: 2.2 + rnd() * 1.6,
      sink: 0.75 + rnd() * 0.65,
      scale: 0.8 + rnd() * 0.55,
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
    it.y = e.y + (rnd() - 0.3) * e.r * 0.8;
    it.vx = (rnd() - 0.5) * 0.6;
    it.vz = (rnd() - 0.5) * 0.6;
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
      gustCenter = at ? { x: at.x, y: at.y, z: at.z, r: 4.5 } : null;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (i < Math.min(90, count * 0.4) && gustCenter) {
          spawn(it, gustCenter);
          const ang = rnd() * 6.28;
          it.vx = Math.cos(ang) * (2.6 + rnd() * 2.2);
          it.vz = Math.sin(ang) * (2.6 + rnd() * 2.2);
          it.vy = 0.8 + rnd() * 1.6;
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
      const wx = -0.75 + Math.sin(clock * 0.3) * 0.35;
      const wz = 0.35 + Math.cos(clock * 0.23) * 0.25;

      for (let i = 0; i < count; i++) {
        const it = items[i];
        if (it.state === 'wait') {
          it.wait -= dt * (0.6 + boost * 3);
          if (it.wait <= 0) spawn(it);
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          continue;
        }
        if (it.state === 'fall') {
          it.t += dt;
          // swirl gently around the poplar during the finale gust
          if (boost > 0.05 && gustCenter) {
            const dx = it.x - gustCenter.x, dz = it.z - gustCenter.z, d = Math.hypot(dx, dz);
            if (d < 16 && d > 0.4) {
              const swirl = boost * 3.8 * (1 - d / 16);
              it.vx += (-dz / d * swirl - dx / d * 0.4 * boost) * dt;
              it.vz += (dx / d * swirl - dz / d * 0.4 * boost) * dt;
            }
          }
          it.vx += (wx + Math.sin(clock * it.swaySp + it.swayPh) * 0.9 - it.vx) * Math.min(1, dt * 1.6);
          it.vz += (wz + Math.cos(clock * it.swaySp * 0.8 + it.swayPh) * 0.7 - it.vz) * Math.min(1, dt * 1.6);
          it.vy += (-it.sink * (0.65 + 0.45 * Math.sin(clock * it.swaySp + it.swayPh)) - it.vy) * Math.min(1, dt * 2.2);
          it.x += it.vx * dt; it.y += it.vy * dt; it.z += it.vz * dt;
          it.rx += dt * (1.8 + boost * 2.2);
          it.ry += dt * 1.2;
          it.rz += dt * 1.5;

          const gy = groundY(it.x, it.z);
          if (it.y <= gy + 0.04 || it.t > 45) {
            it.y = gy + 0.04;
            it.state = 'rest';
            it.restT = 7 + rnd() * 10;
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
            it.wait = 1 + rnd() * 6;
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
