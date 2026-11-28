// Golden autumn leaves and warm Drina canyon mist drifting across Višegrad once awake.
// Single InstancedMesh (1 draw call), hidden until the finale awakens the town.
import * as THREE from 'three';

export function createDrinaLeaves(scene, { count = 240, bounds = 90 } = {}) {
  const geo = new THREE.PlaneGeometry(0.32, 0.22);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.88, depthWrite: false });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false;
  mesh.visible = false;
  scene.add(mesh);

  const palette = [new THREE.Color('#e8a332'), new THREE.Color('#d9682b'), new THREE.Color('#f2c84b'), new THREE.Color('#c44926'), new THREE.Color('#e6d298')];
  const dummy = new THREE.Object3D();
  const items = [];
  let s = 4219;
  const R = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

  for (let i = 0; i < count; i++) {
    const it = {
      x: (R() - 0.5) * bounds * 2,
      y: 4 + R() * 34,
      z: (R() - 0.5) * bounds * 1.8,
      vx: (R() - 0.5) * 1.6,
      vy: -(0.7 + R() * 1.2),
      vz: -(0.8 + R() * 1.4),
      rx: R() * 6.28,
      ry: R() * 6.28,
      rz: R() * 6.28,
      sc: 0.65 + R() * 0.85,
      ph: R() * 6.28,
    };
    items.push(it);
    mesh.setColorAt(i, palette[i % palette.length]);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  let active = false, burst = 0;
  return {
    show() { active = true; mesh.visible = true; },
    gust() { burst = 4.5; },
    update(dt) {
      if (!active) return;
      burst = Math.max(0, burst - dt * 1.2);
      const sp = 1 + burst;
      for (let i = 0; i < count; i++) {
        const it = items[i];
        it.ph += dt * (1.8 + sp * 0.4);
        it.x += (it.vx + Math.sin(it.ph) * 1.1) * dt * sp;
        it.y += it.vy * dt * (0.7 + sp * 0.3);
        it.z += (it.vz + Math.cos(it.ph * 0.8) * 0.8) * dt * sp;
        it.rx += dt * 1.8;
        it.ry += dt * 1.4;
        if (it.y < 0.8 || Math.abs(it.x) > bounds || Math.abs(it.z) > bounds) {
          it.x = (R() - 0.5) * bounds * 1.7;
          it.y = 24 + R() * 18;
          it.z = (R() - 0.5) * bounds * 1.6;
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
