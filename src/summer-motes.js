// Sunlit golden summer dandelion-fluff & warm light motes for Travnik: one InstancedMesh (1 draw call).
// Hidden while the town is a sketch; wakes in the finale and drifts gently over Plava voda and the Lašva valley.
import * as THREE from 'three';

function makeMoteGeo() {
  const s = new THREE.Shape();
  s.absarc(0, 0, 0.09, 0, Math.PI * 2, false);
  return new THREE.ShapeGeometry(s, 6);
}

export function createSummerMotes(scene, {
  emitters,
  groundY,
  count = 200,
  colors = ['#fff6cc', '#ffe380', '#ffffff', '#e8f7ff', '#ffefc2'],
}) {
  const geo = makeMoteGeo();
  const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false;
  mesh.visible = false;

  const col = new THREE.Color();
  const items = [];
  let seed = 883;
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
      x: 0, y: 0, z: 0,
      vx: 0, vy: 0, vz: 0,
      ph: rnd() * 6.28,
      sp: 1.4 + rnd() * 1.3,
      rise: 0.25 + rnd() * 0.45,
      scale: 0.65 + rnd() * 0.7,
      life: rnd() * 12,
      maxLife: 10 + rnd() * 10,
    });
  }
  mesh.instanceColor.needsUpdate = true;
  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);

  let shown = false, gustT = 0, gustCenter = null, clock = 0;

  function respawn(it, near) {
    const e = near || it.em;
    const a = rnd() * 6.28, r = Math.sqrt(rnd()) * e.r;
    it.x = e.x + Math.cos(a) * r;
    it.z = e.z + Math.sin(a) * r;
    it.y = e.y + rnd() * 2.5;
    it.vx = (rnd() - 0.5) * 0.5;
    it.vz = (rnd() - 0.5) * 0.5;
    it.vy = it.rise;
    it.life = 0;
  }

  return {
    mesh,
    show() {
      shown = true; mesh.visible = true;
      for (const it of items) respawn(it);
    },
    gust(at) {
      shown = true; mesh.visible = true;
      gustT = 8.5;
      gustCenter = at ? { x: at.x, y: at.y, z: at.z, r: 6.0 } : null;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (i < Math.min(85, count * 0.45) && gustCenter) {
          respawn(it, gustCenter);
          const ang = rnd() * 6.28;
          it.vx = Math.cos(ang) * (2.0 + rnd() * 2.0);
          it.vz = Math.sin(ang) * (2.0 + rnd() * 2.0);
          it.vy = 1.0 + rnd() * 1.8;
        }
      }
    },
    update(dt) {
      if (!shown) return;
      dt = Math.min(dt, 0.05);
      clock += dt;
      if (gustT > 0) gustT = Math.max(0, gustT - dt);
      const boost = gustT / 8.5;
      const wx = 0.35 + Math.sin(clock * 0.25) * 0.25;
      const wz = 0.45 + Math.cos(clock * 0.21) * 0.25;

      for (let i = 0; i < count; i++) {
        const it = items[i];
        it.life += dt;
        if (it.life >= it.maxLife) respawn(it);

        if (boost > 0.05 && gustCenter) {
          const dx = it.x - gustCenter.x, dz = it.z - gustCenter.z, d = Math.hypot(dx, dz);
          if (d < 18 && d > 0.4) {
            const swirl = boost * 3.2 * (1 - d / 18);
            it.vx += (-dz / d * swirl) * dt;
            it.vz += (dx / d * swirl) * dt;
          }
        }
        it.vx += (wx + Math.sin(clock * it.sp + it.ph) * 0.65 - it.vx) * Math.min(1, dt * 1.4);
        it.vz += (wz + Math.cos(clock * it.sp * 0.8 + it.ph) * 0.65 - it.vz) * Math.min(1, dt * 1.4);
        it.vy += (it.rise * Math.sin(clock * 0.7 + it.ph) - it.vy) * Math.min(1, dt * 1.6);

        it.x += it.vx * dt;
        it.y = Math.max(groundY(it.x, it.z) + 0.4, it.y + it.vy * dt);
        it.z += it.vz * dt;

        const env = Math.sin(Math.min(1, it.life / it.maxLife) * Math.PI);
        dummy.position.set(it.x, it.y, it.z);
        dummy.rotation.set(clock * 0.9 + it.ph, clock * 1.1 + it.ph, 0);
        dummy.scale.setScalar(it.scale * env);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}
