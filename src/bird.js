// The nightingale: blue body, yellow belly, beak and claws. Always fully coloured.
import * as THREE from 'three';
import S from './settings.js';
import { washMaterial, addHull, newPaint } from './paper.js';

export function createBird() {
  const B = S.bird, FULL = newPaint(1);
  const root = new THREE.Group(); root.rotation.order = 'YXZ';
  const body = new THREE.Group(); body.scale.setScalar(B.scale); root.add(body);
  const mat = (c, bleed) => washMaterial({ color: c, bleed: bleed ?? c, paint: FULL, vivid: 1, hatch: 0, scale: 3 });
  const blue = mat(B.blue, B.blueDark), dark = mat(B.blueDark), yellow = mat(B.yellow, '#ffab1a');
  const black = new THREE.MeshBasicMaterial({ color: '#17130f' }), white = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const OUT = 2.2;
  const part = (geo, m, parent, x, y, z, sx = 1, sy = 1, sz = 1, outline = true) => {
    const p = new THREE.Mesh(geo, m); p.position.set(x, y, z); p.scale.set(sx, sy, sz);
    if (outline) addHull(p, OUT); parent.add(p); return p;
  };
  const sphere = new THREE.SphereGeometry(0.3, 18, 14);

  part(sphere, blue, body, 0, 0, 0, 0.85, 0.8, 1.25);
  part(sphere, yellow, body, 0, -0.075, 0.09, 0.76, 0.7, 1.1);

  const head = new THREE.Group(); head.position.set(0, 0.2, 0.33); body.add(head);
  part(sphere, blue, head, 0, 0, 0, 0.68, 0.66, 0.68);
  const beakGeo = new THREE.ConeGeometry(0.06, 0.2, 8).rotateX(Math.PI / 2).translate(0, 0, 0.1);
  part(beakGeo, yellow, head, 0, 0.0, 0.17, 1, 0.55, 1);
  const jaw = part(beakGeo, yellow, head, 0, -0.03, 0.17, 0.9, 0.45, 0.9);
  for (const s of [-1, 1]) {
    part(new THREE.SphereGeometry(0.04, 10, 8), black, head, s * 0.125, 0.045, 0.125, 1, 1, 1, false);
    part(new THREE.SphereGeometry(0.014, 6, 6), white, head, s * 0.14, 0.062, 0.155, 1, 1, 1, false);
  }

  const tail = part(new THREE.BoxGeometry(0.26, 0.035, 0.36).translate(0, 0, -0.18), dark, body, 0, 0.03, -0.3);

  const ws = new THREE.Shape();
  ws.moveTo(0, 0.18); ws.quadraticCurveTo(0.4, 0.26, 0.8, 0.02); ws.quadraticCurveTo(0.55, -0.1, 0.42, -0.16);
  ws.quadraticCurveTo(0.2, -0.26, 0, -0.2); ws.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(ws, { depth: 0.035, bevelEnabled: false, curveSegments: 6 }).rotateX(-Math.PI / 2).translate(0, 0.017, 0);
  const wings = [-1, 1].map((s) => {
    const pivot = new THREE.Group(); pivot.position.set(s * 0.19, 0.09, 0.02); pivot.scale.x = s; body.add(pivot);
    part(wingGeo, blue, pivot, 0, 0, 0);
    return { pivot, s };
  });

  const legs = new THREE.Group(); body.add(legs);
  for (const s of [-1, 1]) {
    part(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), yellow, legs, s * 0.085, -0.28, 0, 1, 1, 1, false);
    part(new THREE.BoxGeometry(0.1, 0.03, 0.16), yellow, legs, s * 0.085, -0.365, 0.03);
  }

  let phase = 0, amp = 0, fold = 1, sweep = 1.3, t = 0, sing = 0;
  const k = (rate, dt) => 1 - Math.exp(-rate * dt);

  return {
    root,
    perchHeight: 0.38 * B.scale,
    update(dt, st) {
      t += dt;
      const perched = st.mode === 'perched';
      const flapping = !perched && st.flapping && !st.diving;
      amp += ((flapping ? 1 : 0) - amp) * k(10, dt);
      fold += ((perched ? 1 : st.diving ? 0.85 : 0) - fold) * k(9, dt);
      phase += dt * 17;
      const flap = Math.sin(phase) * 0.8 * amp + 0.12 * (1 - fold) + Math.sin(t * 1.3) * 0.03;
      const angle = flap * (1 - fold) - 0.45 * fold;
      sweep = fold * 1.3;
      for (const { pivot, s } of wings) {
        pivot.rotation.set(0, s * sweep, s * angle);
        pivot.scale.set(s * (1 - 0.4 * fold), 1, 1 - 0.15 * fold);
      }
      legs.scale.y += ((perched ? 1 : 0.3) - legs.scale.y) * k(10, dt);
      legs.position.y = (1 - legs.scale.y) * -0.2;
      sing += ((st.sing ? 1 : 0) - sing) * k(12, dt);
      const beat = Math.abs(Math.sin(t * 14));
      jaw.rotation.x = sing * (0.25 + 0.4 * beat);
      head.rotation.x = -0.35 * sing + (perched ? Math.sin(t * 0.9) * 0.05 : 0);
      head.rotation.y = perched && !st.sing ? Math.sin(t * 0.6) * 0.25 : 0;
      body.position.y = Math.sin(phase) * -0.04 * amp + sing * beat * 0.02;
      tail.rotation.x = perched ? -0.25 + Math.sin(t * 2) * 0.05 : 0.05;
    },
  };
}
