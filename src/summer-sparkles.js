// Lightweight instanced Adriatic sea sun-sparkles & warm summer evening motes for Neum (1 InstancedMesh = 1 draw call).
// Hidden until show() is called on wake/finale so the summer sketch stays crisp and still.
import * as THREE from 'three';

export function createSummerSparkles(scene, opts = {}) {
  const count = opts.count || 220;
  const xSpan = opts.xSpan || 105;
  const zMin = opts.zMin ?? 16;
  const zMax = opts.zMax ?? 102;
  const waterY = opts.waterY ?? 0.16;

  const geo = new THREE.OctahedronGeometry(0.18, 0);
  const mat = new THREE.MeshBasicMaterial({
    color: '#fff6cc',
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
  });

  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false;
  mesh.visible = false;
  scene.add(mesh);

  const PALETTE = [
    new THREE.Color('#fff9dc'),
    new THREE.Color('#ffe08c'),
    new THREE.Color('#ffd09a'),
    new THREE.Color('#ffffff'),
  ];

  let s = 20260715;
  const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

  const motes = Array.from({ length: count }, (_, i) => {
    const air = i >= Math.floor(count * 0.72);
    mesh.setColorAt(i, PALETTE[i % PALETTE.length]);
    return {
      air,
      x: (rnd() - 0.5) * xSpan * 2,
      y: air ? 2.5 + rnd() * 20 : waterY + rnd() * 0.14,
      z: air ? -40 + rnd() * 115 : zMin + rnd() * (zMax - zMin),
      phase: rnd() * Math.PI * 2,
      rate: air ? 1.6 + rnd() * 1.4 : 2.6 + rnd() * 3.4,
      sc: air ? 0.45 + rnd() * 0.55 : 0.7 + rnd() * 1.1,
    };
  });
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  const dummy = new THREE.Object3D();
  let active = false;
  let elapsed = 0;
  let intensity = 0;

  function sync() {
    for (let i = 0; i < count; i++) {
      const m = motes[i];
      const tw = 0.25 + 0.75 * Math.max(0, Math.sin(elapsed * m.rate + m.phase)) ** 2;
      const sx = m.air ? m.sc * tw * intensity : m.sc * 1.7 * tw * intensity;
      const sy = m.air ? m.sc * tw * intensity : m.sc * 0.22 * tw * intensity;
      const sz = m.air ? m.sc * tw * intensity : m.sc * 0.65 * tw * intensity;
      dummy.position.set(
        m.x + (m.air ? Math.sin(elapsed * 0.6 + m.phase) * 0.9 : 0),
        m.y + (m.air ? Math.cos(elapsed * 0.8 + m.phase) * 0.55 : 0),
        m.z + (m.air ? Math.cos(elapsed * 0.5 + m.phase) * 0.8 : 0)
      );
      dummy.rotation.set(0, elapsed * 0.5 + m.phase, 0);
      dummy.scale.set(sx, sy, sz);
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
    update(dt) {
      if (!active) return;
      elapsed += dt;
      intensity = Math.min(1, intensity + dt * 0.45);
      sync();
    },
  };
}
