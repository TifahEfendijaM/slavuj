// The diver on the ledge of Stari Most: frozen with his arms spread until the finale.
import * as THREE from 'three';
import S from './settings.js';
import { paintGeo, washMat, addHull } from './paper.js';

const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const kk = (rate, dt) => 1 - Math.exp(-rate * dt);

export function createDiver(pos) {
  const C = S.colors, SC = 1.25, mat = washMat('diver'), seed = [pos.x, pos.y + 1.4, pos.z];
  const root = new THREE.Group(); root.position.copy(pos); root.scale.setScalar(SC);
  const P = (geo, col, parent, x, y, z, bleed) => {
    const m = new THREE.Mesh(paintGeo(geo, { col, bleed: bleed ?? col, seed, radius: 3.2, dur: 3.5, hatch: 0.5 }), mat);
    m.position.set(x, y, z); addHull(m, 1.4); parent.add(m); return m;
  };
  const G = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 4, 10);
  const skin2 = '#c98862';

  const hips = G(root, 0, 0.97, 0);
  const trunks = P(cap(0.175, 0.1), C.trunks, hips, 0, -0.02, 0, '#8f2a20'); trunks.scale.z = 0.8;
  const torso = G(hips, 0, 0.04, 0);
  const pts = [[0.001, 0], [0.155, 0], [0.16, 0.12], [0.15, 0.26], [0.2, 0.48], [0.215, 0.57], [0.17, 0.65], [0.075, 0.69], [0.066, 0.77], [0.001, 0.77]].map(([x, y]) => new THREE.Vector2(x, y));
  const chest = P(new THREE.LatheGeometry(pts, 14), C.skin, torso, 0, 0, 0, skin2); chest.scale.z = 0.7;
  const head = G(torso, 0, 0.88, 0.01);
  const skull = P(new THREE.SphereGeometry(0.125, 14, 12), C.skin, head, 0, 0, 0, skin2); skull.scale.set(0.9, 1.1, 1);
  const hair = P(new THREE.SphereGeometry(0.133, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.52), C.hair, head, 0, 0.02, -0.012); hair.rotation.x = -0.35;
  const arms = [-1, 1].map((s) => {
    const sh = G(torso, s * 0.215, 0.6, 0);
    P(cap(0.055, 0.25), C.skin, sh, 0, -0.16, 0, skin2);
    const el = G(sh, 0, -0.32, 0);
    P(cap(0.047, 0.24), C.skin, el, 0, -0.15, 0, skin2);
    const hand = P(new THREE.SphereGeometry(0.058, 10, 8), C.skin, el, 0, -0.33, 0, skin2); hand.scale.set(0.75, 1.3, 0.45);
    return { sh, el, s };
  });
  const legs = [-1, 1].map((s) => {
    const hip = G(hips, s * 0.095, -0.03, 0);
    P(cap(0.088, 0.34), C.skin, hip, 0, -0.22, 0, skin2);
    const knee = G(hip, 0, -0.45, 0);
    P(cap(0.066, 0.34), C.skin, knee, 0, -0.22, 0, skin2);
    const foot = P(cap(0.05, 0.14), C.skin, knee, 0, -0.455, 0.07, skin2); foot.rotation.x = Math.PI / 2;
    return { hip, knee };
  });

  const d = { root, state: 'stand', t: 0, look: 0, onSplash: null, splashPos: new THREE.Vector3() };
  // arms: 0 = hanging, 1 = spread like a swallow, 2 = stretched above the head
  function pose(crouch, armMode, lean) {
    for (const { hip, knee } of legs) { hip.rotation.x = -0.75 * crouch; knee.rotation.x = 1.4 * crouch; }
    hips.position.y = 0.97 - 0.17 * crouch;
    torso.rotation.x = lean + 0.35 * crouch;
    const a = armMode <= 1 ? lerp(0.35, Math.PI / 2 + 0.14, armMode) : lerp(Math.PI / 2 + 0.14, Math.PI - 0.08, armMode - 1);
    for (const { sh, el, s } of arms) { sh.rotation.z = s * a; sh.rotation.x = armMode < 1 ? 0.5 * (1 - armMode) : 0; el.rotation.z = 0; }
    head.rotation.x = -0.1 - 0.2 * crouch;
  }
  pose(0, 1, -0.07);

  const T0 = 0.75, V = new THREE.Vector3(0, 4.6, 3.3), GR = 9.8;
  d.jump = () => { if (d.state === 'stand') { d.state = 'jump'; d.t = 0; } };
  d.update = (dt, time) => {
    if (d.state === 'stand') return;
    d.t += dt;
    if (d.state === 'jump') {
      const t = d.t;
      if (t < T0) {
        const c = sm(0, 0.5, t) * (1 - sm(0.56, T0, t));
        pose(c, lerp(1, 0.15, sm(0, 0.5, t)) + 0.85 * sm(0.56, T0, t), -0.07);
        root.position.copy(pos);
      } else {
        const q = t - T0;
        root.position.set(pos.x, pos.y + V.y * q - 0.5 * GR * q * q, pos.z + V.z * q);
        const k = sm(0.2, 2.0, q);
        root.rotation.x = k * 3.02;
        pose(0, 1 + sm(1.3, 1.9, q), -0.07 - 0.1 * (1 - k));
        // rotate about the hips rather than the feet
        root.position.y += Math.sin(root.rotation.x * 0.5) * 0.9 * SC;
        if (root.position.y < 0.2 && q > 1) {
          d.splashPos.set(root.position.x, 0, root.position.z + 0.6);
          d.state = 'under'; d.t = 0; root.visible = false; d.onSplash?.(d.splashPos);
        }
      }
    } else if (d.state === 'under' && d.t > 1.7) {
      d.state = 'rise'; d.t = 0; root.rotation.set(0, Math.PI, 0); pose(0, 0.25, 0);
      root.position.set(d.splashPos.x, -2.7 * SC, d.splashPos.z + 1.2); root.visible = true;   // placed under the surface before he is shown again
      d.onSurface?.(d.splashPos);
    } else if (d.state === 'rise' || d.state === 'swim') {
      // he comes up through the surface, shakes the water off, then lifts an arm and waves
      const up = d.state === 'swim' ? 1 : sm(0, 1.5, d.t), wave = d.state === 'swim' ? 1 : sm(1.6, 2.6, d.t);
      if (d.state === 'rise' && d.t > 2.8) d.state = 'swim';
      root.position.set(d.splashPos.x, lerp(-2.7, -1.42, up) * SC + Math.sin(time * 2.2) * 0.07 * up, d.splashPos.z + 1.2);
      pose(0, 0.25, 0);
      arms[0].sh.rotation.z = -lerp(0.6, Math.PI - 0.35, wave) + Math.sin(time * 5) * 0.25 * wave;
      arms[1].sh.rotation.z = 0.9 + Math.sin(time * 2.2) * 0.15;
      // once he has shaken the water off he slowly lifts his head toward the spectators on the bridge
      d.look += ((d.state === 'swim' || d.t > 2.1 ? 1 : 0) - d.look) * kk(0.9, dt);
      head.rotation.y = (d.state === 'rise' && d.t < 1.9 ? Math.sin(d.t * 16) * 0.35 * (1 - wave) : 0) + 0.55 * d.look + Math.sin(time * 0.5) * 0.06 * d.look;
      head.rotation.x = -0.5 * d.look; root.rotation.y = Math.PI + 0.2 * d.look;
    }
  };
  // already in the water (a later visit, after the finale has been seen)
  d.swimAt = (p) => { d.splashPos.copy(p); d.state = 'swim'; d.look = 1; root.visible = true; root.rotation.set(0, Math.PI, 0); };
  return d;
}
