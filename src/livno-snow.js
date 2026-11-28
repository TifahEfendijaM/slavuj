// Sunlit winter snow flurries & diamond frost dust drifting across Livno once awake.
// Single InstancedMesh (1 draw call), hidden until the finale awakens the town.
import * as THREE from 'three';

export function createLivnoSnow(scene, { count = 240, bounds = 92 } = {}) {
  const geo = new THREE.OctahedronGeometry(0.16, 0);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.90, depthWrite: false });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false;
  mesh.visible = false;
  scene.add(mesh);

  const palette = [new THREE.Color('#ffffff'), new THREE.Color('#eaf4ff'), new THREE.Color('#d6ebff'), new THREE.Color('#fff9eb')];
  const dummy = new THREE.Object3D();
  const items = [];
  let s = 4919;
  const R = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

  for (let i = 0; i < count; i++) {
    items.push({
      x: (R() - 0.5) * bounds * 2,
      y: 3 + R() * 38,
      z: (R() - 0.5) * bounds * 1.8,
      vx: -(0.7 + R() * 1.2), // gentle bura drift from NE
      vy: -(0.8 + R() * 1.1),
      vz: 0.9 + R() * 1.4,
      rx: R() * 6.28, ry: R() * 6.28, rz: R() * 6.28,
      sc: 0.6 + R() * 0.9, ph: R() * 6.28,
    });
    mesh.setColorAt(i, palette[i % palette.length]);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  let active = false, burst = 0;
  return {
    show() { active = true; mesh.visible = true; },
    gust() { burst = 4.6; },
    update(dt) {
      if (!active) return;
      burst = Math.max(0, burst - dt * 1.1);
      const sp = 1 + burst;
      for (let i = 0; i < count; i++) {
        const it = items[i];
        it.ph += dt * (2.0 + sp * 0.4);
        it.x += (it.vx + Math.sin(it.ph) * 0.9) * dt * sp;
        it.y += it.vy * dt * (0.75 + sp * 0.25);
        it.z += (it.vz + Math.cos(it.ph * 0.85) * 0.7) * dt * sp;
        it.rx += dt * 1.8; it.ry += dt * 1.5;
        if (it.y < 0.8 || Math.abs(it.x) > bounds || Math.abs(it.z) > bounds) {
          it.x = (R() - 0.5) * bounds * 1.8 + 14;
          it.y = 24 + R() * 18;
          it.z = (R() - 0.5) * bounds * 1.6 - 14;
        }
        dummy.position.set(it.x, it.y, it.z);
        dummy.rotation.set(it.rx, it.ry, it.rz);
        dummy.scale.setScalar(it.sc);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}
