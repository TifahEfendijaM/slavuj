// Lightweight instanced winter snowfall for Jahorina (1 InstancedMesh = 1 draw call).
// Hidden until show() is called on wake/finale so the mountain stays crisp and still in the sketch.
import * as THREE from 'three';

export function createWinterSnow(scene, opts = {}) {
  const count = opts.count || 360;
  const radius = opts.radius || 115;
  const maxY = opts.maxY || 56;
  const minY = opts.minY || -2;

  const geo = new THREE.OctahedronGeometry(0.16, 0);
  const mat = new THREE.MeshBasicMaterial({
    color: '#fbfdff',
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false;
  mesh.visible = false;
  scene.add(mesh);

  let s = 841984;
  const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

  const flakes = Array.from({ length: count }, () => ({
    x: (rnd() - 0.5) * radius * 2,
    y: minY + rnd() * (maxY - minY),
    z: (rnd() - 0.5) * radius * 2,
    vy: 1.4 + rnd() * 1.6,
    drift: 0.7 + rnd() * 0.9,
    phase: rnd() * Math.PI * 2,
    sc: 0.65 + rnd() * 0.85,
  }));

  const dummy = new THREE.Object3D();
  let active = false;
  let elapsed = 0;
  let intensity = 0;

  function sync() {
    for (let i = 0; i < count; i++) {
      const f = flakes[i];
      dummy.position.set(f.x, f.y, f.z);
      dummy.rotation.set(elapsed * 0.7 + f.phase, elapsed * 0.5, f.phase);
      dummy.scale.setScalar(f.sc * Math.min(1, intensity));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  return {
    mesh,
    show(instant = false) {
      active = true;
      mesh.visible = true;
      if (instant) intensity = 1;
      sync();
    },
    update(dt, windBoost = 0) {
      if (!active) return;
      elapsed += dt;
      intensity = Math.min(1, intensity + dt * 0.35);
      const wx = 1.1 + windBoost * 2.4;
      for (let i = 0; i < count; i++) {
        const f = flakes[i];
        f.y -= f.vy * dt;
        f.x += (wx + Math.sin(elapsed * 1.1 + f.phase) * f.drift) * dt;
        f.z += Math.cos(elapsed * 0.85 + f.phase * 1.3) * f.drift * 0.65 * dt;
        if (f.y < minY) {
          f.y = maxY;
          f.x = (rnd() - 0.5) * radius * 2;
          f.z = (rnd() - 0.5) * radius * 2;
        }
        if (f.x > radius) f.x -= radius * 2;
        if (f.x < -radius) f.x += radius * 2;
      }
      sync();
    },
  };
}
