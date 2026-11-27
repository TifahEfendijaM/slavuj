// Lightweight instanced linden/chestnut blossoms & warm golden pollen motes for Banja Luka (1 InstancedMesh = 1 draw call).
// Hidden until show() is called on wake/finale so the sketch stays crisp and still.
import * as THREE from 'three';

export function createBlBlossoms(scene, opts = {}) {
  const count = opts.count || 240;
  const radius = opts.radius || 112;
  const maxY = opts.maxY || 42;
  const minY = opts.minY || 1.2;

  const geo = new THREE.PlaneGeometry(0.28, 0.18);
  const mat = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });

  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false;
  mesh.visible = false;
  scene.add(mesh);

  const PALETTE = [
    new THREE.Color('#fff9e2'),
    new THREE.Color('#f7e8a4'),
    new THREE.Color('#fff0f2'),
    new THREE.Color('#d8f0c0'),
    new THREE.Color('#ffe8b6'),
  ];

  let s = 15792026;
  const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

  const motes = Array.from({ length: count }, (_, i) => {
    mesh.setColorAt(i, PALETTE[i % PALETTE.length]);
    return {
      x: (rnd() - 0.5) * radius * 2,
      y: minY + rnd() * (maxY - minY),
      z: (rnd() - 0.5) * radius * 2,
      vy: 0.65 + rnd() * 0.9,
      drift: 0.7 + rnd() * 1.0,
      phase: rnd() * Math.PI * 2,
      spin: 0.9 + rnd() * 1.6,
      sc: 0.6 + rnd() * 0.8,
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
      dummy.position.set(m.x, m.y, m.z);
      dummy.rotation.set(
        elapsed * m.spin + m.phase,
        elapsed * m.spin * 0.65 + m.phase,
        Math.sin(elapsed * 1.4 + m.phase) * 0.85
      );
      dummy.scale.setScalar(m.sc * Math.min(1, intensity));
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
    update(dt, breeze = 0.25) {
      if (!active) return;
      elapsed += dt;
      intensity = Math.min(1, intensity + dt * 0.4);
      const wx = 1.0 + breeze * 1.8;
      for (let i = 0; i < count; i++) {
        const m = motes[i];
        m.y -= m.vy * dt;
        m.x += (wx + Math.sin(elapsed * 1.1 + m.phase) * m.drift) * dt;
        m.z += Math.cos(elapsed * 0.85 + m.phase * 1.3) * m.drift * 0.7 * dt;
        if (m.y < minY) {
          m.y = maxY;
          m.x = (rnd() - 0.5) * radius * 2;
          m.z = (rnd() - 0.5) * radius * 2;
        }
        if (m.x > radius) m.x -= radius * 2;
        if (m.x < -radius) m.x += radius * 2;
      }
      sync();
    },
  };
}
