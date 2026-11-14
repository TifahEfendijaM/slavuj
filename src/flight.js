// Arcade flight: always moving forward, steer with the mouse, flap to climb,
// glide when not flapping, tuck and dive with Shift, land by touching a surface.
import * as THREE from 'three';
import S from './settings.js';

const rad = THREE.MathUtils.degToRad, clamp = THREE.MathUtils.clamp;
const k = (rate, dt) => 1 - Math.exp(-rate * dt);
export const angDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const DOWN = new THREE.Vector3(0, -1, 0);

export class Flight {
  constructor(colliders, perchHeight) {
    this.colliders = colliders; this.perchH = perchHeight;
    this.ray = new THREE.Raycaster();
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3();
    this.yaw = 0; this.pitch = 0; this.roll = 0; this.speed = 0; this.lift = 0;
    this.camYaw = 0; this.mousePitch = 0; this.camElev = 0.14;
    this.mode = 'perched'; this.flapping = false; this.diving = false;
    this.grace = 0; this.landedOn = null; this.hop = null; this.onLand = null;
  }

  placeAt(x, z, yaw) {
    this.ray.set(new THREE.Vector3(x, 200, z), DOWN); this.ray.far = 400;
    const hit = this.ray.intersectObjects(this.colliders, false)[0];
    this.pos.set(x, (hit ? hit.point.y : 0) + this.perchH, z);
    this.yaw = this.camYaw = yaw; this.mode = 'perched'; this.landedOn = hit?.object ?? null;
  }

  hopTo(target) { this.hop = { from: this.pos.clone(), to: target.clone().setY(target.y + this.perchH), t: 0 }; }

  cast(origin, dir, far) {
    this.ray.set(origin, dir); this.ray.far = far;
    const hit = this.ray.intersectObjects(this.colliders, false)[0];
    if (hit) hit.n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    return hit;
  }

  land(hit) {
    this.mode = 'perched'; this.pos.copy(hit.point); this.pos.y += this.perchH;
    this.speed = 0; this.vel.set(0, 0, 0); this.diving = this.flapping = false;
    this.landedOn = hit.object; this.camElev = 0.3; this.mousePitch = 0;
    this.onLand?.(hit.object);
  }

  update(dt, inp) {
    const f = S.flight;
    this.camYaw -= inp.dx * f.mouseSens + inp.turn * f.keyTurnRate * dt;

    if (this.mode === 'perched') {
      this.camElev = clamp(this.camElev + inp.dy * f.mouseSens - inp.tilt * f.keyPitchRate * dt, -0.25, 1.1);
      this.pitch += -this.pitch * k(10, dt); this.roll += -this.roll * k(10, dt);
      if (this.hop) {
        const h = this.hop; h.t = Math.min(1, h.t + dt / 0.45);
        const s = h.t * h.t * (3 - 2 * h.t);
        this.pos.lerpVectors(h.from, h.to, s); this.pos.y += Math.sin(Math.PI * s) * 0.9;
        if (h.t >= 1) this.hop = null;
        return;
      }
      if (inp.takeoff) {
        this.mode = 'flying'; this.landedOn = null; this.yaw = this.camYaw;
        this.pitch = rad(f.takeoffPitch); this.mousePitch = 0.1;
        this.speed = f.takeoffSpeed; this.lift = f.flapClimb; this.grace = 0.5; this.pos.y += 0.15;
      }
      return;
    }

    // ---- flying ----
    this.grace -= dt;
    this.diving = inp.dive && this.grace <= 0;
    this.flapping = (inp.flap || this.grace > 0) && !this.diving;
    if (this.diving) this.mousePitch = 0;
    else this.mousePitch = clamp(this.mousePitch - inp.dy * f.mouseSens + inp.tilt * f.keyPitchRate * dt, -rad(f.maxPitchDown), rad(f.maxPitchUp));

    // stay inside the slice: gently turn back, and stay under the ceiling
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
    this.roll += (clamp(-diff * 2.2, -1, 1) - this.roll) * k(8, dt);

    // climbing costs speed, descending gains it
    this.speed -= f.gravity * Math.sin(this.pitch) * dt;
    if (this.flapping) { if (this.speed < f.cruiseSpeed) this.speed += f.flapAccel * dt; }
    else if (this.speed < f.cruiseSpeed && this.pitch <= 0.03) this.speed += f.glideRecover * dt;
    if (this.speed > f.cruiseSpeed) this.speed -= f.drag * (this.speed - f.cruiseSpeed) * dt;
    this.speed = clamp(this.speed, f.minSpeed, f.maxSpeed);
    // out of speed while pointing up: the nose eases back down by itself
    if (this.speed <= f.minSpeed + 0.4 && !this.flapping && this.mousePitch > -0.08)
      this.mousePitch += (-0.08 - this.mousePitch) * Math.min(1, 2.5 * dt);

    const liftTarget = this.diving ? 0 : this.flapping ? f.flapClimb : -f.glideSink;
    this.lift += (liftTarget - this.lift) * k(5, dt);
    if (this.pos.y > W.ceiling) this.lift = Math.min(this.lift, 0);

    const cp = Math.cos(this.pitch);
    this.vel.set(Math.sin(this.yaw) * cp, Math.sin(this.pitch), Math.cos(this.yaw) * cp).multiplyScalar(this.speed);
    this.vel.y += this.lift;

    // ---- collisions ----
    const step = this.vel.length() * dt;
    const dir = this.vel.clone().normalize();
    const ahead = this.cast(this.pos, dir, step + 0.8);
    if (ahead && !ahead.object.userData.water) {
      if (ahead.n.y > 0.35 && this.grace <= 0) return this.land(ahead);
      // a wall: slide along it
      const n = new THREE.Vector3(ahead.n.x, 0, ahead.n.z).normalize();
      const fl = new THREE.Vector3(dir.x, 0, dir.z);
      fl.addScaledVector(n, -fl.dot(n));
      if (fl.lengthSq() < 0.02) fl.set(-n.z, 0, n.x);
      fl.normalize().addScaledVector(n, 0.25);
      this.yaw = this.camYaw = Math.atan2(fl.x, fl.z);
      this.speed = Math.max(f.minSpeed, this.speed * 0.8);
      this.pos.addScaledVector(n, 0.12);
      this.vel.set(fl.x * this.speed, Math.max(this.vel.y, 0), fl.z * this.speed);
    }
    this.pos.addScaledVector(this.vel, dt);

    const below = this.cast(this.pos, DOWN, this.perchH + 0.15);
    if (below) {
      if (below.object.userData.water) {
        // skim over the water instead of landing in it
        this.pos.y = below.point.y + this.perchH + 0.15;
        this.mousePitch = Math.max(this.mousePitch, 0.06); this.pitch = Math.max(this.pitch, 0);
      } else if (below.n.y > 0.35 && this.grace <= 0) {
        this.land(below);
      }
    }
  }
}
