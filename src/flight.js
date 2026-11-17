// Arcade flight: always moving forward, steer with the mouse, flap hard (Space) to climb,
// tuck and dive with Shift, land by touching a surface. The bird feels for walls with
// "whiskers" to its sides, keeps its body clear of them and tucks the wing that has no room.
import * as THREE from 'three';
import S from './settings.js';

const rad = THREE.MathUtils.degToRad, clamp = THREE.MathUtils.clamp;
const k = (rate, dt) => 1 - Math.exp(-rate * dt);
export const angDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const DOWN = new THREE.Vector3(0, -1, 0), UP = new THREE.Vector3(0, 1, 0);
const _o = new THREE.Vector3(), _d = new THREE.Vector3();
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _inv = new THREE.Matrix4();
const _nm = new THREE.Matrix3();

export class Flight {
  constructor(colliders, bird) {
    this.colliders = colliders; this.perchH = bird.perchHeight; this.footOffsets = bird.footOffsets;
    this.ray = new THREE.Raycaster();
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3();
    this.yaw = 0; this.pitch = 0; this.roll = 0; this.speed = 0; this.lift = 0;
    this.camYaw = 0; this.mousePitch = 0; this.camElev = 0.14;
    this.mode = 'perched'; this.power = false; this.diving = false; this.flare = 0;
    this.clearL = 1; this.clearR = 1; this.grace = 0; this.landedOn = null; this.feet = null;
    this.events = []; this.bumpCool = 0; this.perchPitch = 0; this.perchRoll = 0;
    this.walk = 0; this.hop = null; this.groundY = 0; this.waterY = 0; this.swimT = 0; this.drift = 0; this.splashPower = 0; this.paddle = 0;
  }

  cast(origin, dir, far) {
    this.ray.set(origin, dir); this.ray.far = far;
    const hit = this.ray.intersectObjects(this.colliders, false)[0];
    if (hit) hit.n = hit.face.normal.clone().applyMatrix3(_nm.getNormalMatrix(hit.object.matrixWorld)).normalize();
    return hit;
  }
  landable(hit) { return hit.n.y > S.flight.maxLandSlope && !hit.object.userData.water && !hit.object.userData.wall; }

  placeAt(x, z, yaw) {
    const hit = this.cast(new THREE.Vector3(x, 200, z), DOWN, 400);
    this.yaw = this.camYaw = yaw; this.mode = 'perched'; this.landedOn = hit?.object ?? null;
    this.settle(hit ? hit.point : new THREE.Vector3(x, 0, z));
  }

  // stand on the surface. Each foot finds its own ground; the body is lifted just enough to stay clear
  // of it, and leans with the slope only where the surface is really steep (a tower roof, a cliff).
  settle(p, again) {
    const sc = S.bird.scale, f = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)), l = new THREE.Vector3(f.z, 0, -f.x);
    const nrm = new THREE.Vector3(), g = [];
    for (const [a, b] of [[0, 0], [0.32, 0], [-0.32, 0], [0.18, 0.15], [0.18, -0.15], [-0.18, 0.15], [-0.18, -0.15], [0, 0.21], [0, -0.21]]) {
      _o.copy(p).addScaledVector(f, a * sc).addScaledVector(l, b * sc); _o.y = p.y + 1.1;
      const h = this.cast(_o, DOWN, 2.2);
      // a surface far above where the feet are (a chimney beside the bird) is an obstacle, not ground to stand on
      if (h && !h.object.userData.water && h.point.y < p.y + 0.3) { g.push([a * sc, b * sc, h.point.y]); nrm.add(h.n); }
    }
    if (nrm.lengthSq() < 0.01) nrm.set(0, 1, 0); nrm.normalize();
    const st = clamp((0.8 - nrm.y) / 0.18, 0, 1), lean = st * st * (3 - 2 * st) * 0.85;
    // on a really steep surface it clings facing up the slope, which is how a bird holds on
    if (st > 0.5 && !again) { this.yaw = Math.atan2(-nrm.x, -nrm.z); return this.settle(p, true); }
    this.perchPitch = -Math.asin(clamp(nrm.dot(f), -1, 1)) * lean; this.perchRoll = -Math.asin(clamp(nrm.dot(l), -1, 1)) * lean;
    const tp = Math.tan(this.perchPitch), tr = Math.tan(this.perchRoll), D0 = 0.3 * sc, az = 0.4 * sc, ax = 0.26 * sc;
    let y = p.y + this.perchH;
    for (const [a, b, gy] of g) {   // the underside of the body at this spot must stay above the ground there
      const hb = D0 * Math.sqrt(Math.max(0, 1 - (a / az) ** 2 - (b / ax) ** 2));
      y = Math.max(y, gy + 0.05 * sc + hb - (a * tp + b * tr));
    }
    this.pos.set(p.x, y, p.z); this.groundY = p.y;
    this.feet = this.footOffsets.map((o) => {
      _o.copy(this.pos).addScaledVector(l, o.x).addScaledVector(f, o.z);
      const h = this.cast(_o, DOWN, this.perchH + 0.9 * sc);
      return h && !h.object.userData.water ? { p: h.point.clone(), n: h.n } : { p: _o.clone().setY(_o.y - this.perchH), n: UP.clone() };
    });
  }

  // On the ground, holding the mouse button walks, then runs. Small steps up and down are hopped;
  // off a big drop it tips into a dive; into shallow-lying water it hops in and floats.
  walkStep(dt, inp) {
    const f = S.flight, sc = S.bird.scale;
    if (this.hop) {
      const h = this.hop; h.t += dt; const u = Math.min(1, h.t / h.dur);
      this.pos.lerpVectors(h.from, h.to, u); this.pos.y += Math.sin(Math.PI * u) * h.arc;
      if (u >= 1) { this.hop = null; this.landedOn = h.obj; this.settle(h.point); }
      return;
    }
    if (!inp.dive) { this.walk = 0; return; }
    this.yaw += angDiff(this.camYaw, this.yaw) * k(7, dt);
    this.walk = this.walk ? Math.min(f.runSpeed, this.walk + f.walkAccel * dt) : f.walkStart;
    const fw = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)), step = this.walk * dt, gy = this.groundY, reach = 0.3 * sc + 0.08;
    // a hop needs a clear way: straight up to just above where it lands, then across (never into a wall or a chimney)
    const clearTo = (to) => {
      const top = Math.max(this.pos.y, to.y) + 0.1, mid = new THREE.Vector3(this.pos.x, top, this.pos.z), end = new THREE.Vector3(to.x, top, to.z);
      for (const [a, b] of [[this.pos, mid], [mid, end]]) { const d = b.clone().sub(a), L = d.length(); if (L > 0.01 && this.cast(a, d.normalize(), L)) return false; }
      return true;
    };
    const hopTo = (hit) => { if (!clearTo(hit.point.clone().setY(hit.point.y + this.perchH))) { this.walk = 0; return false; } const dy = hit.point.y - gy; this.feet = null; this.hop = { from: this.pos.clone(), to: hit.point.clone().setY(hit.point.y + this.perchH), point: hit.point.clone(), obj: hit.object, t: 0, dur: 0.38 + Math.abs(dy) * 0.3, arc: 0.16 + Math.max(0, dy) * 0.3 + Math.abs(dy) * 0.12 }; return true; };
    const ahead = this.cast(this.pos, fw, step + reach);
    if (ahead && !ahead.object.userData.water) {                          // something in the way: hop onto it if it is low enough
      const top = this.cast(new THREE.Vector3(this.pos.x + fw.x * (ahead.distance + reach), gy + f.hopUp + 0.3, this.pos.z + fw.z * (ahead.distance + reach)), DOWN, f.hopUp + 0.32);
      if (top && this.landable(top) && top.point.y - gy > 0.04 && top.point.y - gy <= f.hopUp) hopTo(top); else this.walk = 0;
      return;
    }
    const at = (d) => this.cast(new THREE.Vector3(this.pos.x + fw.x * d, gy + f.hopUp + 0.05, this.pos.z + fw.z * d), DOWN, f.hopUp + 0.05 + f.hopDown);
    const up = at(step + reach * 0.6);                                     // a seat, a table top, a kerb just ahead: hop onto it
    if (up && this.landable(up) && up.point.y - gy > 0.13) { hopTo(up); return; }
    const g = at(step);
    if (g && this.landable(g)) {
      const dy = g.point.y - gy;
      if (Math.abs(dy) < 0.13) { this.landedOn = g.object; this.settle(g.point); }
      else if (dy > 0) hopTo(g);
      else { const far = at(step + reach + 0.12); hopTo(far && this.landable(far) && far.point.y - gy < -0.1 ? far : g); }
      return;
    }
    if (g && g.object.userData.water) {                                   // into the water
      this.splashPower = 0.25; this.mode = 'swim'; this.waterY = g.point.y; this.speed = this.walk * 0.5; this.walk = 0; this.feet = null; this.landedOn = null;
      this.pos.addScaledVector(fw, 0.25); this.pos.y = this.waterY + 0.14 * sc; this.events.push('splash'); return 'left';
    }
    if (g && (g.object.userData.wall || gy - g.point.y < 0.3)) { this.walk = 0; return; }
    // nothing to stand on within reach: off it goes, wings tucked, for as long as the button is held
    this.mode = 'flying'; this.landedOn = null; this.feet = null; this.walk = 0; this.pitch = -0.35; this.mousePitch = -0.25; this.speed = Math.max(f.minSpeed, 6.5);
    this.lift = 0; this.grace = 0.25; this.airT = 1; this.pos.addScaledVector(fw, 0.3); this.pos.y += 0.05; this.events.push('takeoff'); return 'left';
  }

  // push the bird out of anything that moves (people, animals, the swimmer) and has come up against it
  makeWay() {
    if (this._mc !== this.colliders.length) { this._mc = this.colliders.length; this.movers = this.colliders.filter((c) => c.userData.person || c.userData.swimmer); }
    const R = S.flight.bodyRadius * 0.8;
    for (const c of this.movers) {
      const m = c.matrixWorld, sx = _v1.setFromMatrixColumn(m, 0).length(), sy = _v2.setFromMatrixColumn(m, 1).length(), sz = _v3.setFromMatrixColumn(m, 2).length();
      _inv.copy(m).invert(); _o.copy(this.pos).applyMatrix4(_inv);       // the bird in the box's own space, where the box is -0.5..0.5
      const px = 0.5 + R / sx - Math.abs(_o.x), py = 0.5 + R / sy - Math.abs(_o.y), pz = 0.5 + R / sz - Math.abs(_o.z);
      if (px <= 0 || py <= 0 || pz <= 0) continue;
      if (px * sx < pz * sz) _o.x += Math.sign(_o.x || 1) * px; else _o.z += Math.sign(_o.z || 1) * pz;
      const y = this.pos.y; this.pos.copy(_o.applyMatrix4(m)); this.pos.y = y;
    }
  }

  land(hit) {
    this.mode = 'perched'; this.speed = 0; this.vel.set(0, 0, 0); this.diving = this.power = false; this.flare = 0;
    this.hop = null; this.walk = 0; this.camElev = 0.3; this.mousePitch = 0; this.clearL = this.clearR = 1;
    // touched by a feeler reaching ahead of the body: land under the body as it is when that feeler touches,
    // not out where the feeler's tip was (that was a jump of up to half a metre)
    if (hit.dir) {
      const R0 = S.flight.bodyRadius, d = hit.dir; _d.set(d.x, 0, d.z).normalize();
      _o.copy(this.pos).addScaledVector(_d, Math.max(0, hit.distance - R0)); _o.y = Math.max(this.pos.y, hit.point.y) + 0.5;
      const top = _o.y, ok = (h) => h && this.landable(h) && Math.abs(h.point.y - hit.point.y) < 0.8;
      let h = this.cast(_o, DOWN, 1.6);
      if (!ok(h)) {      // the body is just past an edge: the nearest spot on the surface towards where it was touched
        const from = _o.clone(), to = hit.point.clone().setY(top);
        for (let u = 0.1; u <= 1.001 && !ok(h); u += 0.1) h = this.cast(_o.lerpVectors(from, to, u), DOWN, 1.6);
      }
      if (ok(h)) hit = h;
    }
    this.landedOn = hit.object; this.settle(hit.point); this.events.push('land');
  }

  update(dt, inp) {
    const f = S.flight, ptr = inp.pointer;
    this.camYaw -= inp.dx * f.mouseSens + (inp.turn + (ptr ? ptr.x : 0)) * (ptr && !inp.turn ? f.pointerTurnRate : f.keyTurnRate) * dt;
    this.bumpCool -= dt;

    if (this.mode === 'perched') {
      this.camElev = clamp(this.camElev + inp.dy * f.mouseSens - (inp.tilt - (ptr ? ptr.y : 0)) * f.keyPitchRate * dt, -0.25, 1.1);
      this.pitch += (this.perchPitch - this.pitch) * k(10, dt); this.roll += (this.perchRoll - this.roll) * k(10, dt);
      if (!inp.takeoff && this.walkStep(dt, inp) === 'left') return;      // walked off a height, or into the water
      if (inp.takeoff) {
        this.hop = null; this.walk = 0;
        this.mode = 'flying'; this.landedOn = null; this.yaw = this.camYaw; this.feet = null;
        this.pitch = rad(f.takeoffPitch); this.mousePitch = 0.02;
        this.speed = f.takeoffSpeed; this.lift = f.takeoffLift; this.grace = 0.45; this.airT = 0; this.pos.y += 0.1; this.events.push('takeoff');
      }
      return;
    }

    if (this.mode === 'swim') {
      this.swimT += dt;
      this.camElev = clamp(this.camElev + inp.dy * f.mouseSens - inp.tilt * 0, -0.1, 1.1);
      this.pitch += -this.pitch * k(8, dt); this.roll += -this.roll * k(8, dt);
      this.yaw += angDiff(this.camYaw, this.yaw) * k(3, dt);
      this.speed = inp.dive ? Math.min(f.swimMax, Math.max(this.speed, 0.4) + f.swimAccel * dt) : Math.max(0, this.speed - 2.2 * dt);     // hold the mouse button to paddle, faster the longer it is held
      this.paddle = Math.min(1, this.speed / f.swimMax);
      const fw = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)), move = fw.clone().multiplyScalar(this.speed); move.z += this.drift;
      if (move.lengthSq() > 1e-4) {
        _o.copy(this.pos); _o.y += 0.15;
        const h = this.cast(_o, move.clone().normalize(), 0.3 + 0.45 * S.bird.scale);
        if (h && !h.object.userData.water) move.set(0, 0, 0);
      }
      this.pos.addScaledVector(move, dt); this.pos.y = this.waterY + 0.14 * S.bird.scale + Math.sin(this.swimT * 2.4) * 0.03;
      this.makeWay();      // the swimmer (or the diver) comes past: the floating bird is nudged aside, never swum through
      if (Math.abs(this.pos.x) > 12.5 && this.waterY < 1) this.pos.x = Math.sign(this.pos.x) * 12.5;
      if (inp.takeoff) {
        this.mode = 'flying'; this.yaw = this.camYaw; this.pitch = rad(f.takeoffPitch); this.mousePitch = 0.06;
        this.speed = f.takeoffSpeed * 0.85; this.lift = f.takeoffLift + 1; this.grace = 0.5; this.airT = 0; this.pos.y += 0.2;
        this.splashPower = 0.4; this.events.push('takeoff', 'splash');
      }
      return;
    }

    // ---- flying ----
    this.grace -= dt; this.airT = (this.airT || 0) + dt;
    this.diving = inp.dive && this.grace <= 0;
    this.power = (inp.flap || this.grace > 0) && !this.diving;
    if (this.diving) this.mousePitch = 0;
    else if (ptr && !inp.tilt) this.mousePitch += (clamp(-ptr.y, -1, 1) * rad(ptr.y > 0 ? f.maxPitchDown : f.maxPitchUp) - this.mousePitch) * k(5, dt);
    else this.mousePitch = clamp(this.mousePitch - inp.dy * f.mouseSens + inp.tilt * f.keyPitchRate * dt, -rad(f.maxPitchDown), rad(f.maxPitchUp));

    const r = Math.hypot(this.pos.x, this.pos.z), W = S.world;
    if (r > W.boundsRadius) {
      const want = Math.atan2(-this.pos.x, -this.pos.z);
      this.camYaw += angDiff(want, this.camYaw) * Math.min(1, dt * 2.5 * Math.min(1, (r - W.boundsRadius) / 12));
    }
    if (this.pos.y > W.ceiling) this.mousePitch = Math.min(this.mousePitch, -0.15);

    const targetPitch = this.diving ? -rad(f.diveAngle) : this.mousePitch;
    this.pitch += (targetPitch - this.pitch) * k(f.pitchSmooth, dt);
    const diff = angDiff(this.camYaw, this.yaw);
    this.yaw += diff * k(f.turnSmooth, dt);

    this.speed -= f.gravity * Math.sin(this.pitch) * dt;
    if (this.power) { if (this.speed < f.cruiseSpeed) this.speed += f.flapAccel * dt; }
    else if (this.speed < f.cruiseSpeed && this.pitch <= 0.03) this.speed += f.glideRecover * dt;
    if (this.speed > f.cruiseSpeed) this.speed -= f.drag * (this.speed - f.cruiseSpeed) * dt;
    if (this.flare > 0.1 && this.speed > 7.5) this.speed += (7.5 - this.speed) * this.flare * k(3, dt);
    this.speed = clamp(this.speed, f.minSpeed, f.maxSpeed);
    if (this.speed <= f.minSpeed + 0.4 && !this.power && this.mousePitch > -0.08 && !ptr)
      this.mousePitch += (-0.08 - this.mousePitch) * Math.min(1, 2.5 * dt);
    if (this.speed <= f.minSpeed + 0.4 && !this.power && ptr && this.pitch > -0.08) this.pitch += (-0.08 - this.pitch) * Math.min(1, 4 * dt);

    const liftTarget = this.diving ? 0 : this.power ? f.flapClimb * Math.min(1, 0.28 + this.airT / 1.3) : -f.cruiseSink;   // the climb builds up after take-off
    this.lift += (liftTarget - this.lift) * k(5, dt);
    if (this.pos.y > W.ceiling) this.lift = Math.min(this.lift, 0);

    const cp = Math.cos(this.pitch), fwd = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)), left = new THREE.Vector3(fwd.z, 0, -fwd.x);
    this.vel.set(fwd.x * cp, Math.sin(this.pitch), fwd.z * cp).multiplyScalar(this.speed);
    this.vel.y += this.lift;

    // ---- whiskers: keep the body off walls, learn how much room each wing has ----
    const R0 = f.bodyRadius, WR = f.wingReach, push = new THREE.Vector3();
    const feel = (dir, len) => {
      const h = this.cast(this.pos, dir, len);
      if (!h || h.object.userData.water) return null;
      if (h.n.dot(dir) > 0) h.n.negate();
      const pen = 1 - h.distance / len; push.addScaledVector(h.n, pen * pen * 10);
      if (h.distance < R0) this.pos.addScaledVector(h.n, R0 - h.distance);
      return h;
    };
    const room = (h, base) => (h ? clamp((h.distance - base) / (WR - base), 0, 1) : 1);
    const hl = feel(left, WR), hr = feel(_d.copy(left).negate().clone(), WR);
    const dl = feel(fwd.clone().addScaledVector(left, 0.8).normalize(), WR), dr = feel(fwd.clone().addScaledVector(left, -0.8).normalize(), WR);
    feel(UP, 0.3 + 0.4 * S.bird.scale);
    const cl = Math.min(room(hl, 0.5), room(dl, 0.3) + 0.25), cr = Math.min(room(hr, 0.5), room(dr, 0.3) + 0.25);
    this.clearL += (cl - this.clearL) * k(16, dt); this.clearR += (cr - this.clearR) * k(16, dt);
    this.camYaw += ((1 - cr) - (1 - cl)) * 1.1 * dt;                       // ease away from the nearer wall
    push.y = Math.max(push.y, 0); this.vel.add(push);
    // bank into turns, and lean away from a wall that is close
    this.roll += (clamp(-diff * 2.2 + (cr - cl) * 0.5, -1, 1) - this.roll) * k(8, dt);

    // ---- straight ahead ----
    const step = this.vel.length() * dt, dir = this.vel.clone().normalize();
    let ahead = this.cast(this.pos, dir, step + R0);
    for (const sd of [-0.75, 0.75]) { const h = this.cast(_o.copy(this.pos).addScaledVector(left, sd * R0), dir, step + R0); if (h && !h.object.userData.water && (!ahead || h.distance < ahead.distance)) ahead = h; }
    if (ahead && !ahead.object.userData.water) {
      if (this.landable(ahead) && this.grace <= 0) { ahead.dir = dir; return this.land(ahead); }
      const n = new THREE.Vector3(ahead.n.x, 0, ahead.n.z);
      if (n.lengthSq() < 0.01) n.copy(fwd).negate(); n.normalize();
      const fl = new THREE.Vector3(dir.x, 0, dir.z); fl.addScaledVector(n, -fl.dot(n));
      if (fl.lengthSq() < 0.02) fl.set(-n.z, 0, n.x);
      fl.normalize().addScaledVector(n, 0.25).normalize();
      this.yaw = this.camYaw = Math.atan2(fl.x, fl.z);
      this.speed = Math.max(f.minSpeed, this.speed * 0.8);
      this.pos.addScaledVector(n, Math.max(0, R0 - ahead.distance) + 0.05);
      this.vel.set(fl.x * this.speed, Math.max(this.vel.y, ahead.n.y > 0.2 ? 2 : 0), fl.z * this.speed);
      if (this.bumpCool <= 0) { this.events.push('bump'); this.bumpCool = 0.5; }
    }
    this.pos.addScaledVector(this.vel, dt);

    // ---- below: land, skim the water, or flare when the ground is close ----
    const below = this.cast(this.pos, DOWN, 3.4);
    let flare = 0;
    if (below) {
      const h = below.distance - this.perchH;
      if (below.object.userData.water) {
        if (h < 0.2 && this.grace <= 0) {   // into the water: a splash as big as the arrival, then it floats
          this.splashPower = clamp((Math.abs(this.vel.y) + this.speed * 0.25) / 16, 0.2, 1);
          this.mode = 'swim'; this.waterY = below.point.y; this.speed = Math.min(this.speed, 6) * 0.5; this.vel.set(0, 0, 0);
          this.power = this.diving = false; this.flare = 0; this.feet = null; this.landedOn = null; this.camElev = 0.3; this.mousePitch = 0;
          this.clearL = this.clearR = 1; this.pos.y = this.waterY + 0.14 * S.bird.scale; this.events.push('splash'); return;
        }
      } else if (this.landable(below)) {
        if (h <= 0.1 && this.grace <= 0) return this.land(below);
        flare = clamp(1 - (h - 0.1) / 1.9, 0, 1) * clamp(Math.max((-this.vel.y - 0.4) / 1.6, (9 - this.speed) / 2), 0, 1);
      } else if (below.distance < R0) this.pos.addScaledVector(below.n, R0 - below.distance);
    }
    this.flare += (flare - this.flare) * k(10, dt);
  }
}
