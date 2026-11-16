// The nightingale: blue body, yellow belly, beak and claws. Always fully coloured.
// It flies like a small songbird: bursts of quick wingbeats with the wings folded
// for a moment in between, hard flapping to climb, a flare with the tail fanned to land.
import * as THREE from 'three';
import S from './settings.js';
import { paintGeo, washMat, addHull, tag } from './paper.js';

const k = (rate, dt) => 1 - Math.exp(-rate * dt);
const clamp = THREE.MathUtils.clamp, lerp = THREE.MathUtils.lerp;
const UP = new THREE.Vector3(0, 1, 0);

export function createBird() {
  const B = S.bird, SC = B.scale;
  tag('bird').uT.value = 1e6;
  const mat = washMat('bird', { vivid: 1 });
  const root = new THREE.Group(); root.rotation.order = 'YXZ';
  const tilt = new THREE.Group(); root.add(tilt);
  const body = new THREE.Group(); body.scale.setScalar(SC); tilt.add(body);
  const black = new THREE.MeshBasicMaterial({ color: '#17130f' }), white = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const part = (geo, col, parent, x, y, z, sx = 1, sy = 1, sz = 1, outline = true, bleed) => {
    const p = new THREE.Mesh(paintGeo(geo, { col, bleed: bleed ?? col, radius: 1e6, dur: 1 }), mat);
    p.position.set(x, y, z); p.scale.set(sx, sy, sz); if (outline) addHull(p, 2.1); parent.add(p); return p;
  };
  const sphere = new THREE.SphereGeometry(0.3, 18, 14);

  part(sphere, B.blue, body, 0, 0, 0, 0.85, 0.8, 1.25, true, B.blueDark);
  part(sphere, B.yellow, body, 0, -0.075, 0.09, 0.76, 0.7, 1.1, true, '#ffab1a');

  const head = new THREE.Group(); head.position.set(0, 0.2, 0.33); body.add(head);
  part(sphere, B.blue, head, 0, 0, 0, 0.68, 0.66, 0.68, true, B.blueDark);
  const beakGeo = new THREE.ConeGeometry(0.055, 0.2, 8).rotateX(Math.PI / 2).translate(0, 0, 0.1);
  part(beakGeo, B.yellow, head, 0, 0.0, 0.17, 1, 0.55, 1);
  const jaw = part(beakGeo, B.yellow, head, 0, -0.03, 0.17, 0.9, 0.45, 0.9);
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), black); eye.position.set(s * 0.125, 0.045, 0.125); head.add(eye);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), white); glint.position.set(s * 0.14, 0.062, 0.155); head.add(glint);
  }

  // tail: a fan that spreads when braking and turning
  const ts = new THREE.Shape(); ts.moveTo(-0.07, 0); ts.lineTo(0.07, 0); ts.lineTo(0.13, -0.3); ts.quadraticCurveTo(0, -0.39, -0.13, -0.3); ts.closePath();
  const tailGeo = new THREE.ExtrudeGeometry(ts, { depth: 0.03, bevelEnabled: false, curveSegments: 5 }).rotateX(Math.PI / 2);
  const tail = new THREE.Group(); tail.position.set(0, 0.04, -0.3); body.add(tail);
  part(tailGeo, B.blueDark, tail, 0, 0, 0);

  // wings: an inner part at the shoulder and an outer part that folds back over it
  const wi = new THREE.Shape(); wi.moveTo(0, 0.15); wi.lineTo(0.34, 0.17); wi.lineTo(0.34, -0.19); wi.quadraticCurveTo(0.15, -0.24, 0, -0.19); wi.closePath();
  const wo = new THREE.Shape(); wo.moveTo(0, 0.17); wo.quadraticCurveTo(0.3, 0.17, 0.46, 0.0); wo.quadraticCurveTo(0.4, -0.16, 0.22, -0.2); wo.lineTo(0, -0.19); wo.closePath();
  const flat = (shape) => new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false, curveSegments: 6 }).rotateX(Math.PI / 2).translate(0, 0.015, 0);
  const innerGeo = flat(wi), outerGeo = flat(wo);
  const wings = [-1, 1].map((s) => {
    const sh = new THREE.Group(); sh.position.set(s * 0.17, 0.1, 0.05); body.add(sh);
    const mirror = new THREE.Group(); mirror.scale.x = s; sh.add(mirror);
    const inner = new THREE.Group(); mirror.add(inner);
    part(innerGeo, B.blue, inner, 0, 0, 0, 1, 1, 1, true, B.blueDark);
    const outer = new THREE.Group(); outer.position.set(0.33, 0, 0); inner.add(outer);
    part(outerGeo, B.blueDark, outer, 0, 0, 0);
    return { sh, inner, outer, s, fold: 1 };
  });

  // legs: hip fixed on the body, the foot goes wherever the ground is
  const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 6).translate(0, -0.5, 0);
  const toe = new THREE.BoxGeometry(0.028, 0.022, 0.13).translate(0, 0, 0.05);
  const legs = [-1, 1].map((s) => {
    const hip = new THREE.Group(); hip.position.set(s * 0.085, -0.17, -0.02); body.add(hip);
    const shin = part(legGeo, B.yellow, hip, 0, 0, 0, 1, 0.2, 1, false);
    const foot = new THREE.Group(); hip.add(foot);
    for (const a of [-0.45, 0, 0.45]) { const t = part(toe, B.yellow, foot, 0, 0, 0); t.rotation.y = a; }
    const back = part(toe, B.yellow, foot, 0, 0, 0, 1, 1, 0.6); back.rotation.y = Math.PI;
    return { hip, shin, foot, s, len: 0.1 };
  });

  let prevBeat = 0, phase = 0, cyc = 0, open = 0, amp = 0, t = 0, sing = 0, fl = 0, slow = 0, landT = 9, wasPerched = true, bob = 0;
  const q = new THREE.Quaternion(), n = new THREE.Vector3();

  return {
    root, downstroke: 0,
    perchHeight: 0.335 * SC,
    footOffsets: legs.map((l) => new THREE.Vector3(l.s * 0.085 * SC, 0, 0.02 * SC)),
    // st: mode, power, diving, speed, flare, turn, clearL, clearR, sing, feet [{drop, n}], yaw
    update(dt, st) {
      t += dt;
      const perched = st.mode === 'perched';
      if (perched && !wasPerched) landT = 0;
      wasPerched = perched; landT += dt;
      const settling = perched && landT < 0.3;
      fl += ((perched ? 0 : st.flare) - fl) * k(9, dt);
      slow += ((perched ? 0 : clamp((10 - st.speed) / 4, 0, 1)) - slow) * k(5, dt);

      // flap-bounding: a burst of beats, then the wings close for a moment
      const steady = st.power || fl > 0.25 || slow > 0.3 || st.speed < 9;
      cyc += dt; if (cyc > 0.66) cyc = 0;
      const bound = !perched && !steady && !st.diving && cyc > 0.44;
      const wantOpen = perched ? (settling ? 0.6 : 0) : st.diving ? 0.08 : bound ? 0.05 : 1;
      open += (wantOpen - open) * k(perched ? 10 : 20, dt);
      const freq = st.power ? 11.5 : fl > 0.25 ? 12.5 : 9.5;
      const wantAmp = perched ? (settling ? 0.5 : 0) : st.diving ? 0 : st.power ? 1.05 : fl > 0.25 ? 0.6 : 0.78;
      amp += (wantAmp - amp) * k(9, dt);
      phase += dt * freq * Math.PI * 2;
      const beat = Math.sin(phase), up = Math.max(0, Math.cos(phase));
      if (prevBeat > 0 && beat <= 0 && !perched && amp * open > 0.4) this.downstroke = amp;
      prevBeat = beat;

      for (const w of wings) {
        const clear = w.s > 0 ? st.clearL : st.clearR;                 // +x is the bird's left
        const f = clamp(Math.max(1 - open, 1 - (clear ?? 1), up * 0.35 * amp), 0, 1);
        w.fold += (f - w.fold) * k(22, dt);
        const F = w.fold, a = (beat * 0.85 * amp + 0.14) * (1 - F) - 0.3 * F + fl * 0.25 * (1 - F);
        w.sh.rotation.set(0, w.s * lerp(0.08, 1.36, F), w.s * a);
        w.outer.rotation.set(0, lerp(0, 0.18, F) + up * 0.5 * amp * (1 - F), -beat * 0.3 * amp * (1 - F));
        w.inner.scale.set(lerp(1, 0.82, F), 1, lerp(1, 0.9, F)); w.inner.rotation.x = -1.15 * F;
        w.outer.scale.set(lerp(1, 0.62, F), 1, lerp(1, 0.8, F));
        w.sh.position.x = w.s * lerp(0.17, 0.14, F);
      }

      // the whole body rides up on the burst and dips while the wings are closed
      const bobWant = perched ? 0 : (steady || st.diving ? 0 : Math.sin((cyc / 0.66) * Math.PI * 2 - 0.6) * 0.09) - beat * 0.03 * amp;
      bob += (bobWant - bob) * k(14, dt);
      const squash = settling ? -Math.sin((landT / 0.3) * Math.PI) * 0.07 : 0;
      tilt.position.y = (bob + squash) * SC;
      tilt.rotation.x = -(0.5 * fl + 0.28 * slow) + (perched ? -0.12 : 0);     // nose up when slow or landing

      // tail: fanned and lowered to brake, twisted into turns, cocked when perched
      const spread = clamp(Math.max(fl, Math.abs(st.turn) * 0.9, st.power ? 0.25 : 0), 0, 1);
      tail.scale.x += ((1 + spread * 1.1) - tail.scale.x) * k(10, dt);
      const tailX = perched ? -0.28 + Math.sin(t * 1.7) * 0.05 + (Math.sin(t * 0.9) > 0.97 ? -0.3 : 0) : fl * 0.55 + beat * 0.05 * amp;
      tail.rotation.x += (tailX - tail.rotation.x) * k(10, dt);
      tail.rotation.z += ((perched ? 0 : -st.turn * 0.35) - tail.rotation.z) * k(8, dt);

      // head stays level and looks around; beak opens to sing
      sing += ((st.sing ? 1 : 0) - sing) * k(12, dt);
      const sb = Math.abs(Math.sin(t * 14));
      jaw.rotation.x = sing * (0.25 + 0.4 * sb);
      head.rotation.x = -tilt.rotation.x * 0.7 - 0.3 * sing + (perched ? Math.sin(t * 0.9) * 0.05 : 0);
      head.rotation.y = perched && !st.sing ? Math.sin(t * 0.6) * 0.3 : -st.turn * 0.25;
      body.position.y = sing * sb * 0.02;

      // feet
      legs.forEach((l, i) => {
        let len, fx = 0, fz = 0;
        if (perched && st.feet) {
          len = clamp(st.feet[i].drop / SC - 0.17, 0.03, 0.3);
          n.copy(st.feet[i].n).applyAxisAngle(UP, -st.yaw); q.setFromUnitVectors(UP, n);
          l.foot.quaternion.slerp(q, k(18, dt)); l.hip.rotation.x = 0;
        } else {
          len = lerp(0.05, 0.2, fl); l.hip.rotation.x = lerp(1.2, -0.5, fl);       // tucked back, reaching forward to land
          l.foot.quaternion.slerp(q.identity(), k(10, dt));
        }
        l.len += (len - l.len) * k(perched ? 30 : 12, dt);
        l.shin.scale.y = l.len; l.foot.position.set(fx, -l.len, fz);
      });
    },
  };
}
