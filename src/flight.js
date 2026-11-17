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
    this.waterY = 0; this.swimT = 0; this.drift = 0; this.splashPower = 0; this.paddle = 0;
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
      if (h && !h.object.userData.water) { g.push([a * sc, b * sc, h.point.y]); nrm.add(h.n); }
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
    this.pos.set(p.x, y, p.z);
    this.feet = this.footOffsets.map((o) => {
      _o.copy(this.pos).addScaledVector(l, o.x).addScaledVector(f, o.z);
      const h = this.cast(_o, DOWN, this.perchH + 0.9 * sc);
      return h && !h.object.userData.water ? { p: h.point.clone(), n: h.n } : { p: _o.clone().setY(_o.y - this.perchH), n: UP.clone() };
    });
  }

  land(hit) {
    this.mode = 'perched'; this.speed = 0; this.vel.set(0, 0, 0); this.diving = this.power = false; this.flare = 0;
    this.landedOn = hit.object; this.camElev = 0.3; this.mousePitch = 0; this.clearL = this.clearR = 1;
    this.settle(hit.point); this.events.push('land');
  }

  update(dt, inp) {
    const f = S.flight, ptr = inp.pointer;
    this.camYaw -= inp.dx * f.mouseSens + (inp.turn + (ptr ? ptr.x : 0)) * (ptr && !inp.turn ? f.pointerTurnRate : f.keyTurnRate) * dt;
    this.bumpCool -= dt;

    if (this.mode === 'perched') {
      this.camElev = clamp(this.camElev + inp.dy * f.mouseSens - (inp.tilt - (ptr ? ptr.y : 0)) * f.keyPitchRate * dt, -0.25, 1.1);
      this.pitch += (this.perchPitch - this.pitch) * k(10, dt); this.roll += (this.perchRoll - this.roll) * k(10, dt);
      if (inp.takeoff) {
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
      this.speed += (inp.tilt * f.swimSpeed - this.speed) * k(3, dt); this.paddle = Math.min(1, Math.abs(this.speed) / f.swimSpeed);
      const fw = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)), move = fw.clone().multiplyScalar(this.speed); move.z += this.drift;
      if (move.lengthSq() > 1e-4) {
        _o.copy(this.pos); _o.y += 0.15;
        const h = this.cast(_o, move.clone().normalize(), 0.3 + 0.45 * S.bird.scale);
        if (h && !h.object.userData.water) move.set(0, 0, 0);
      }
      this.pos.addScaledVector(move, dt); this.pos.y = this.waterY + 0.14 * S.bird.scale + Math.sin(this.swimT * 2.4) * 0.03;
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
      if (this.landable(ahead) && this.grace <= 0) return this.land(ahead);
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
