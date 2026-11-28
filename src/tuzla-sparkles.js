// Lightweight instanced salt-crystal glints over Pannonian Lakes & warm twilight fireflies over Slana Banja (1 InstancedMesh = 1 draw call).
// Hidden until show() is called on wake/finale so the sketch stays crisp and still.
import * as THREE from 'three';

export function createTuzlaSparkles(scene, opts = {}) {
  const count = opts.count || 230;
  const radius = opts.radius || 105;

  const geo = new THREE.OctahedronGeometry(0.18, 0);
  const mat = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
  });

  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false;
  mesh.visible = false;
  scene.add(mesh);

  const PALETTE = [
    new THREE.Color('#ffffff'),
    new THREE.Color('#dff8ff'),
    new THREE.Color('#fff4a8'),
    new THREE.Color('#ffe066'),
  ];

  let s = 70002026;
  const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

  const motes = Array.from({ length: count }, (_, i) => {
    const firefly = i >= Math.floor(count * 0.55);
    mesh.setColorAt(i, firefly ? PALETTE[2 + (i % 2)] : PALETTE[i % 2]);
    return {
      firefly,
      x: firefly ? (rnd() - 0.5) * radius * 1.8 : -44 + rnd() * 88,
      y: firefly ? 3.5 + rnd() * 24 : 0.25 + rnd() * 1.4,
      z: firefly ? -88 + rnd() * 68 : 6 + rnd() * 38,
      phase: rnd() * Math.PI * 2,
      rate: firefly ? 1.8 + rnd() * 1.8 : 2.8 + rnd() * 3.0,
      sc: firefly ? 0.5 + rnd() * 0.65 : 0.6 + rnd() * 0.9,
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
      const tw = 0.2 + 0.8 * Math.max(0, Math.sin(elapsed * m.rate + m.phase)) ** 2;
      const sc = m.sc * tw * intensity;
      dummy.position.set(
        m.x + (m.firefly ? Math.sin(elapsed * 0.7 + m.phase) * 1.1 : 0),
        m.y + (m.firefly ? Math.cos(elapsed * 0.9 + m.phase) * 0.65 : Math.sin(elapsed * 1.5 + m.phase) * 0.08),
        m.z + (m.firefly ? Math.cos(elapsed * 0.6 + m.phase) * 1.0 : 0)
      );
      dummy.rotation.set(elapsed * 0.9 + m.phase, elapsed * 0.7 + m.phase, 0);
      dummy.scale.setScalar(sc);
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
