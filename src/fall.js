// Things the wind takes from the trees, once a town is alive.
//  - autumn leaves: heavy enough to fall. Each one swings from side to side as it drops (gliding, slowing at the end of
//    each swing), is pushed along by the wind, and settles on the ground, where it lies for a while (a strong gust makes
//    it skitter), then is gone. On water it floats away with the current.
//  - spring blossom: petals are light. They fall slowly, ride the breeze far from their tree and are lifted again by
//    small updrafts before they settle. Pollen is lighter still: tiny specks that hang and wander in the air.
// The wind turns slowly and comes in gusts; a map's finale can send one big gust (gust()) that shakes many loose at once.
import * as THREE from 'three';

const TAU = Math.PI * 2;
function leafShape(w, h) {
  const s = new THREE.Shape(); s.moveTo(0, -h / 2); s.quadraticCurveTo(w * 0.62, -h * 0.1, 0, h / 2); s.quadraticCurveTo(-w * 0.62, -h * 0.1, 0, -h / 2);
  const g = new THREE.ShapeGeometry(s, 4); g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(g.attributes.position.count * 2).fill(0), 2)); return g;
}

// trees: [{ x, z, y (the crown's middle), r (its radius) }]; ground(x, z) -> { y, flow?: [vx, vz] } (flow: a current on water)
export function makeFall(scene, { kind, trees, ground, n = 220, pollen = 0, cols }) {
  const autumn = kind === 'autumn';
  const geo = autumn ? leafShape(0.24, 0.34) : leafShape(0.16, 0.15);
  // one batch per colour (each leaf keeps its own colour); the batches are shown together
  const per = Math.ceil(n / cols.length);
  const meshes = cols.map((c) => { const m = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }), per); m.frustumCulled = false; m.visible = false; scene.add(m); return m; });
  const P = Array.from({ length: per * cols.length }, (_, i) => ({ s: 'wait', w: Math.random() * 30, v: new THREE.Vector3(), p: new THREE.Vector3(), mesh: meshes[i % cols.length], k: Math.floor(i / cols.length) }));
  n = P.length;
  const mesh = { set visible(v) { for (const m of meshes) m.visible = v; } };
  // pollen: tiny specks, a cloud of points
  let dust = null, D = [];
  if (pollen) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(pollen * 3), 3));
    const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), rg = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.45, 'rgba(255,255,255,.8)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = rg; x.fillRect(0, 0, 32, 32);      // a soft round speck
    dust = new THREE.Points(g, new THREE.PointsMaterial({ color: '#fff1a8', size: 0.09, map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.85, depthWrite: false }));
    dust.frustumCulled = false; dust.visible = false; scene.add(dust);
    D = Array.from({ length: pollen }, () => ({ p: new THREE.Vector3(), life: 0, ph: Math.random() * TAU }));
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3();
  const wind = new THREE.Vector3(); let T = 0, boost = 0, boostAt = null, on = false;

  // a point in a tree's crown
  const inCrown = (p, t) => { const a = Math.random() * TAU, r = t.r * Math.sqrt(Math.random()); p.set(t.x + Math.cos(a) * r, t.y + (Math.random() - 0.3) * t.r * 0.9, t.z + Math.sin(a) * r); };
  function release(l) {
    const t = trees[Math.floor(Math.random() * trees.length)]; inCrown(l.p, t);
    l.s = 'fall'; l.t = 0; l.v.set(0, 0, 0);
    l.fall = autumn ? 0.9 + Math.random() * 0.7 : 0.22 + Math.random() * 0.2;           // its steady speed down (m/s)
    l.om = autumn ? 2.2 + Math.random() * 1.6 : 1.5 + Math.random() * 1.5;               // how fast it swings
    l.amp = autumn ? 0.9 + Math.random() * 0.8 : 0.35 + Math.random() * 0.3;             // and how far
    l.ax = Math.random() * TAU; l.ph = Math.random() * TAU; l.yaw = Math.random() * TAU;
    l.tumble = autumn && Math.random() < 0.25 ? 4 + Math.random() * 5 : 0;              // a few leaves tumble instead of swinging
    l.drag = autumn ? 0.7 + Math.random() * 0.4 : 1.8 + Math.random() * 0.8;            // how quickly the wind takes it
    l.lift = Math.random() * TAU;
  }
  function windAt(p, t, out) {
    // a slowly turning breeze, in gusts, with a little swirl that differs from place to place
    const dir = 0.7 + 0.5 * Math.sin(t * 0.031) + 0.25 * Math.sin(t * 0.11);
    const g = 0.5 + 0.9 * Math.max(0, Math.sin(t * 0.19) * Math.sin(t * 0.47 + 1.3)) + boost * 4;
    const sw = 0.35;
    out.set(Math.cos(dir) * g + sw * Math.sin(p.z * 0.21 + t * 0.7), 0, Math.sin(dir) * g + sw * Math.cos(p.x * 0.19 + t * 0.6));
    if (boostAt) { const dx = p.x - boostAt.x, dz = p.z - boostAt.z, d = Math.hypot(dx, dz) + 4; out.x += boost * 6 * dx / d; out.z += boost * 6 * dz / d; }
    return out;
  }

  return {
    show() { on = true; mesh.visible = true; if (dust) dust.visible = true; },
    // a big gust (the finale): shakes many loose at once and blows out from `at`
    gust(at) {
      this.show(); boost = 1; boostAt = at ? at.clone() : null;
      for (const l of P) if (l.s === 'wait' || (l.s !== 'fall' && Math.random() < 0.5)) release(l);
      for (const d of D) d.life = 0;
    },
    update(dt) {
      if (!on) return;
      dt = Math.min(dt, 0.05); T += dt; boost = Math.max(0, boost - dt / 9); if (!boost) boostAt = null;
      const gustNow = 0.5 + 0.9 * Math.max(0, Math.sin(T * 0.19) * Math.sin(T * 0.47 + 1.3)) + boost * 4;
      for (let i = 0; i < n; i++) {
        const l = P[i];
        if (l.s === 'wait') {
          l.w -= dt * (0.4 + gustNow);                     // more come loose when the wind blows harder
          if (l.w <= 0) release(l); else { m4.makeScale(0, 0, 0); l.mesh.setMatrixAt(l.k, m4); continue; }
        }
        const p = l.p;
        if (l.s === 'fall') {
          l.t += dt;
          windAt(p, T, wind);
          l.v.x += (wind.x - l.v.x) * Math.min(1, l.drag * dt);
          l.v.z += (wind.z - l.v.z) * Math.min(1, l.drag * dt);
          const sw = Math.sin(l.om * l.t + l.ph), cw = Math.cos(l.om * l.t + l.ph);
          let vy;
          if (l.tumble) vy = -l.fall * 1.25;
          else vy = -l.fall * (0.35 + 1.3 * cw * cw);            // it glides at the end of each swing and drops fastest through the middle
          if (!autumn) vy += 0.25 * Math.sin(T * 0.5 + l.lift) + 0.18 * Math.sin(T * 1.7 + l.lift * 2) + boost * 1.4;      // light: small updrafts lift it again
          const side = autumn ? l.amp * l.om * cw : l.amp * l.om * cw * 0.6;                  // the side to side swing
          p.x += (l.v.x + Math.cos(l.ax) * side) * dt; p.z += (l.v.z + Math.sin(l.ax) * side) * dt; p.y += vy * dt;
          l.yaw += dt * (autumn ? 0.6 : 1.2);
          if (l.tumble) e.set(l.t * l.tumble, l.yaw, l.t * l.tumble * 0.6, 'YXZ');
          else e.set(0.75 * sw, l.yaw, 0.35 * cw, 'YXZ');                                     // tilted with its swing
          const gr = ground(p.x, p.z);
          if (p.y <= gr.y + 0.03) { p.y = gr.y + 0.03; l.s = 'rest'; l.rest = autumn ? 8 + Math.random() * 14 : 5 + Math.random() * 8; l.flow = gr.flow; l.yaw = Math.random() * TAU; }
          if (l.t > 90) l.s = 'gone';
        } else if (l.s === 'rest') {
          l.rest -= dt;
          if (l.flow) { p.x += l.flow[0] * dt; p.z += l.flow[1] * dt; l.yaw += dt * 0.2; }            // carried off on the water
          else if (gustNow > 1.6) { windAt(p, T, wind); const k = (gustNow - 1.6) * 0.25; p.x += wind.x * k * dt; p.z += wind.z * k * dt; l.yaw += dt * k * 3; }      // a strong gust makes it skitter
          e.set(-Math.PI / 2, l.yaw, 0, 'YXZ');
          if (l.rest <= 0) l.s = 'gone';
        }
        if (l.s === 'gone') { l.s = 'wait'; l.w = Math.random() * (autumn ? 14 : 10); m4.makeScale(0, 0, 0); l.mesh.setMatrixAt(l.k, m4); continue; }
        const sc = l.s === 'rest' && l.rest < 1 ? Math.max(0, l.rest) : 1;          // it fades into the ground at the end
        q.setFromEuler(e); one.setScalar(sc); m4.compose(p, q, one); l.mesh.setMatrixAt(l.k, m4);
      }
      for (const m of meshes) m.instanceMatrix.needsUpdate = true;
      if (dust) {
        const a = dust.geometry.attributes.position.array;
        for (let i = 0; i < D.length; i++) {
          const d = D[i], p = d.p;
          if (d.life <= 0) { inCrown(p, trees[Math.floor(Math.random() * trees.length)]); p.x += (Math.random() - 0.5) * 16; p.z += (Math.random() - 0.5) * 16; p.y += Math.random() * 3; d.life = 20 + Math.random() * 40; }
          d.life -= dt;
          windAt(p, T, wind);
          // pollen floats with the breeze, wandering and rising and sinking in the air's small eddies; it hardly falls
          p.x += (wind.x * 0.8 + 0.5 * Math.sin(T * 0.9 + d.ph + p.y)) * dt;
          p.z += (wind.z * 0.8 + 0.5 * Math.cos(T * 0.8 + d.ph * 1.7 + p.x * 0.3)) * dt;
          p.y += (0.32 * Math.sin(T * 0.6 + d.ph * 3) + 0.12 * Math.sin(T * 1.9 + d.ph) - 0.03 + boost * 0.8) * dt;
          const gr = ground(p.x, p.z).y; if (p.y < gr + 0.3) p.y = gr + 0.3;
          a[i * 3] = p.x; a[i * 3 + 1] = p.y; a[i * 3 + 2] = p.z;
        }
        dust.geometry.attributes.position.needsUpdate = true;
      }
    },
  };
}
