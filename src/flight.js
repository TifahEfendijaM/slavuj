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
// the points of its underside, forward/sideways (times the bird's size): the same as where it stands (settle)
const UNDER = [[0, 0], [0.32, 0], [-0.32, 0], [0.18, 0.15], [0.18, -0.15], [-0.18, 0.15], [-0.18, -0.15], [0, 0.21], [0, -0.21]];
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
  // into the water: a splash as big as the arrival, then it floats
  intoWater(p) {
    this.splashPower = clamp((Math.abs(this.vel.y) + this.speed * 0.25) / 16, 0.2, 1);
    this.mode = 'swim'; this.waterY = p.y; this.speed = Math.min(this.speed, 6) * 0.5; this.vel.set(0, 0, 0);
    this.power = this.diving = false; this.flare = 0; this.feet = null; this.landedOn = null; this.camElev = 0.3; this.mousePitch = 0;
    this.clearL = this.clearR = 1; this.pos.y = this.waterY + 0.14 * S.bird.scale; this.events.push('splash');
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
    if (lean > 0.05) {      // leaning into a steep slope: its breast must not sink into it
      const C = 0.38 * sc, h = this.cast(this.pos, _d.copy(nrm).negate(), C);
      if (h) this.pos.addScaledVector(nrm, C - h.distance);
    }
    this.feet = this.footOffsets.map((o) => {
      _o.copy(this.pos).addScaledVector(l, o.x).addScaledVector(f, o.z);
      const h = this.cast(_o, DOWN, this.perchH + 0.9 * sc);
      return h && !h.object.userData.water ? { p: h.point.clone(), n: h.n } : { p: _o.clone().setY(_o.y - this.perchH), n: UP.clone() };
    });
  }

  // On the ground, holding the mouse button walks, then runs. Small steps up and down are hopped;
  // at a drop too deep to hop down it stops at the edge; into shallow-lying water it hops in and floats.
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
    if (g && !g.object.userData.wall && !g.object.userData.water) {     // the edge of a step: its sloping front face, not ground; step down past it
      const far = at(step + reach + 0.12);
      if (far && this.landable(far) && Math.abs(far.point.y - gy) <= f.hopUp) { hopTo(far); return; }
    }
    if (g && (g.object.userData.wall || gy - g.point.y < 0.3)) { this.walk = 0; return; }
    // nothing to stand on within reach (a drop too deep to hop down): it stops at the edge. Leaving is up to the
    // player: Space takes off.
    this.walk = 0;
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

  // is there room above this spot for the bird's body? (not under an overhanging roof or a ledge)
  roomAt(point) { _o.copy(point); _o.y += 0.03; return !this.cast(_o, UP, 0.42 * S.bird.scale + this.perchH); }
  land(hit) {
    if (!this.roomAt(hit.point)) return false;          // no room: it does not land here
    this.landHit = Math.max(0, -this.vel.y) + this.speed * 0.15;      // how hard it comes down (for the give in its legs)
    this.mode = 'perched'; this.speed = 0; this.vel.set(0, 0, 0); this.diving = this.power = false; this.flare = 0;
    this.hop = null; this.walk = 0; this.camElev = 0.3; this.mousePitch = 0; this.clearL = this.clearR = 1;
    // it stands exactly where it touched. A touch by a feeler off to the side is moved back onto its own line, so it
    // never lands beside where it was flying
    if (hit.side) {
      const f = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)), l = new THREE.Vector3(f.z, 0, -f.x);
      _o.copy(hit.point).addScaledVector(l, -hit.side); _o.y += 0.4;
      const h = this.cast(_o, DOWN, 0.8); if (h && this.landable(h)) hit = h;
    }
    const from = this.pos.clone();
    this.landedOn = hit.object; this.settle(hit.point); this.events.push('land');
    // whatever small difference is left between where its body was and where it stands is eased out in a tenth of a
    // second, its feet already planted, so it never jumps
    const off = from.sub(this.pos); this.landEase = off.length() > 0.005 && off.length() < 0.4 ? { off, base: this.pos.clone(), t: 0 } : null;
    if (this.landEase) this.pos.add(off);
    return true;
  }

  update(dt, inp) {
    const f = S.flight, ptr = inp.pointer;
    this.camYaw -= inp.dx * f.mouseSens + (inp.turn + (ptr ? ptr.x : 0)) * (ptr && !inp.turn ? f.pointerTurnRate : f.keyTurnRate) * dt;
    this.bumpCool -= dt;

    if (this.mode === 'perched') {
      if (this.landEase && (inp.dive || inp.takeoff)) { this.pos.copy(this.landEase.base); this.landEase = null; }      // walking or taking off: from where it stands
      if (this.landEase) {
        const e = this.landEase; e.t += dt; const u = Math.min(1, e.t / 0.16), w = 1 - u * u * u * (u * (6 * u - 15) + 10);      // a soft ease, about a sixth of a second
        this.pos.copy(e.base).addScaledVector(e.off, w); if (u >= 1) this.landEase = null;
      }
      this.camElev = clamp(this.camElev + inp.dy * f.mouseSens - (inp.tilt - (ptr ? ptr.y : 0)) * f.keyPitchRate * dt, -0.25, 1.1);
      this.pitch += (this.perchPitch - this.pitch) * k(10, dt); this.roll += (this.perchRoll - this.roll) * k(10, dt);
      if (!inp.takeoff && this.walkStep(dt, inp) === 'left') return;      // walked off a height, or into the water
      if (inp.takeoff) {
        this.hop = null; this.walk = 0; if (this.landEase) { this.pos.copy(this.landEase.base); this.landEase = null; }
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
        // and only onto more water: at the end of it (the top of the waterfall) it stops, as walking stops at a ledge
        _o.copy(this.pos).addScaledVector(move, dt).addScaledVector(_d.copy(move).normalize(), 0.3 * S.bird.scale); _o.y = this.waterY + 0.5;
        const w = this.cast(_o, DOWN, 1.0);
        if (!w || !w.object.userData.water || Math.abs(w.point.y - this.waterY) > 0.3) move.set(0, 0, 0);
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
    this.diving = inp.dive && (this.grace <= 0 || this.airT > 0.1);      // diving works right after take-off (the grace only stops it landing again at once)
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

    this.speed -= (this.pitch < 0 ? (this.diving ? f.diveGravity : f.glideGravity) : f.gravity) * Math.sin(this.pitch) * dt;      // gliding down builds speed gently; a dive is the fast way
    if (this.power) { if (this.speed < f.cruiseSpeed) this.speed += f.flapAccel * Math.min(1, 0.35 + this.airT / 1.6) * dt; }      // (gently at first, just after taking off)
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
    for (const sd of [-0.75, 0.75]) { const h = this.cast(_o.copy(this.pos).addScaledVector(left, sd * R0), dir, step + R0); if (h && !h.object.userData.water && (!ahead || h.distance < ahead.distance)) { ahead = h; h.side = sd * R0; } }
    // its underside (feet and belly, the same shape it stands with), swept along this frame's flight: at the first
    // touch of a surface it can stand on, it is moved to that very moment and lands, so it stands where it already is
    if (this.grace <= 0 && step > 0.001) {
      const sc = S.bird.scale, hf = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)), hl = new THREE.Vector3(hf.z, 0, -hf.x);
      let best = null;
      for (const [a, b] of UNDER) {
        const drop = a === 0 && b === 0 ? Math.max(this.perchH, 0.05 * sc + 0.3 * sc) : 0.05 * sc + 0.3 * sc * Math.sqrt(Math.max(0, 1 - (a / 0.4) ** 2 - (b / 0.26) ** 2));
        _o.copy(this.pos).addScaledVector(hf, a * sc).addScaledVector(hl, b * sc); _o.y -= drop;
        const h = this.cast(_o, dir, step + 0.02); if (h && this.landable(h) && (!best || h.distance < best.distance)) best = h;
      }
      if (best) {
        const keep = this.pos.clone(); this.pos.addScaledVector(dir, best.distance);
        const c = this.cast(_o.copy(this.pos).setY(this.pos.y + 0.3), DOWN, this.perchH + 0.9);
        if (this.land(c && this.landable(c) && Math.abs(c.point.y - best.point.y) < 0.5 ? c : best)) return;
        this.pos.copy(keep);
      }
    }
    // a surface it can stand on ahead of its breast is simply flown on towards (the underside sweep lands it)
    const reachable = ahead && !ahead.object.userData.water && this.landable(ahead) && this.grace <= 0;
    if (ahead && !ahead.object.userData.water && (!reachable || !this.roomAt(ahead.point))) {      // (no room to stand there: it bumps off)
      const n = new THREE.Vector3(ahead.n.x, 0, ahead.n.z);
      if (n.lengthSq() < 0.01) n.copy(fwd).negate(); n.normalize();
      // the smallest turn that leads into open space: directions further and further from where it was heading,
      // 10 degrees at a time on each side (first the side the wall deflects it to), until one is clear for 1.5 m
      const head = Math.atan2(dir.x, dir.z), slide = new THREE.Vector3(dir.x, 0, dir.z).addScaledVector(n, -(dir.x * n.x + dir.z * n.z));
      const side = Math.sign(Math.sin(head) * slide.z - Math.cos(head) * slide.x) || 1;
      const fl = new THREE.Vector3(-Math.sin(head), 0, -Math.cos(head));       // nothing clear at all: back the way it came
      _o.copy(this.pos).addScaledVector(n, 0.05);
      search: for (let deg = 10; deg <= 180; deg += 10) for (const sgn of [-side, side]) {
        const yw = head + sgn * rad(deg), c = new THREE.Vector3(Math.sin(yw), dir.y * 0.5, Math.cos(yw)).normalize();
        if (!this.cast(_o, c, 1.5)) { fl.set(c.x, 0, c.z).normalize(); break search; }
      }
      this.yaw = this.camYaw = Math.atan2(fl.x, fl.z);
      this.speed = Math.max(f.minSpeed, this.speed * 0.8);
      this.pos.addScaledVector(n, Math.max(0, R0 - ahead.distance) + 0.05);
      this.vel.set(fl.x * this.speed, Math.max(this.vel.y, ahead.n.y > 0.2 ? 2 : 0), fl.z * this.speed);
      if (this.bumpCool <= 0) { this.events.push('bump'); this.bumpCool = 0.5; }
    }
    // the water surface anywhere along this frame's move: a steep dive covers more than a metre a frame (more still
    // on a phone running slower), which could carry it from above the surface to below it between two looks down
    // (also in the moment after taking off: a dive straight back down must still meet the surface; the grace only
    // keeps it from dropping back in while it is still rising)
    const mv = this.vel.length() * dt;
    if (this.vel.y < 0 && mv > 0.001) {
      const w = this.cast(this.pos, _d.copy(this.vel).normalize(), mv + this.perchH + 0.2);
      if (w && w.object.userData.water) { this.pos.x = w.point.x; this.pos.z = w.point.z; return this.intoWater(w.point); }
    }
    this.pos.addScaledVector(this.vel, dt);
    // and should it ever end up under a water surface all the same, it comes up and floats on it
    const over = this.cast(this.pos, UP, 40);
    if (over && over.object.userData.water) return this.intoWater(over.point);

    // ---- below: land, skim the water, or flare when the ground is close ----
    this.gapBelow = 9;
    const below = this.cast(this.pos, DOWN, 3.4);
    let flare = 0;
    if (below) {
      const h = below.distance - this.perchH; this.gapBelow = h;      // (the bird's wing-beat bob fades out close to a surface)
      if (below.object.userData.water) {
        if (h < 0.2 && (this.grace <= 0 || this.vel.y < 0)) return this.intoWater(below.point);
      } else if (this.landable(below)) {
        // never lower than standing height over a surface it could stand on (a bounce off a wall can push it down
        // into a roof): kept there at once, so landing finds it already in place
        const stand = Math.max(this.perchH, 0.35 * S.bird.scale);
        if (below.distance < stand) { this.pos.y += stand - below.distance; below.distance = stand; }
        // close enough to stand: measured out from the surface (straight down misjudges a steep roof), and moved
        // that last bit onto it before landing
        const gap = below.distance * Math.max(0.3, below.n.y) - this.perchH * Math.max(0.3, below.n.y);
        if (gap <= 0.1 && this.grace <= 0) { const keep = this.pos.clone(); this.pos.addScaledVector(below.n, -Math.max(0, gap)); if (this.land(below)) return; this.pos.copy(keep); }
        flare = clamp(1 - (h - 0.1) / 1.9, 0, 1) * clamp(Math.max((-this.vel.y - 0.4) / 1.6, (9 - this.speed) / 2), 0, 1);
      } else if (below.distance < R0) this.pos.addScaledVector(below.n, R0 - below.distance);
    }
    this.flare += (flare - this.flare) * k(10, dt);
  }
}
