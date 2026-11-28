// Jahorina (winter): map module, 26 s alpenglow finale, moving chairlift & snow groomer, snowfall, and mountain sounds.
import { Vector3 } from 'three';
import { buildJahorinaWorld, jahorinaGroundY, PLATEAU_Y } from './jahorina-world.js';
import { WORDS, ORDER, CULTURE } from './jahorina-words.js';
import { createWinterSnow } from '../winter-snow.js';
import art from '../../assets/journal-jahorina.webp';

const V = (x, y, z) => new Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

let snow = null;
let nextOwl = 6;
let nextWolf = 14;

function build(scene) {
  const world = buildJahorinaWorld(scene);
  snow = createWinterSnow(scene, { count: 360, radius: 118, maxY: 56, minY: 2 });
  nextOwl = 6;
  nextWolf = 14;
  return world;
}

function wakeMountain(ctx) {
  const rt = ctx.world.ratrak;
  if (rt && !rt.active) {
    rt.active = true;
    const idx = ctx.world.colliders.indexOf(rt.collider);
    if (idx >= 0) ctx.world.colliders.splice(idx, 1);
  }
  snow?.show();
}

function updateMountain(dt, time, life, ctx) {
  const { world, audio, running, nearGain } = ctx;
  const alive = life > 0.5;
  world.movers.length = 0;

  // Chairlift seats gliding smoothly up & down Ogorjelica once awake
  if (alive && world.lift) {
    const { chairs, A, B } = world.lift;
    const span = A.distanceTo(B);
    const dir = B.clone().sub(A).normalize();
    for (const c of chairs) {
      c.u = (c.u + c.sd * (dt * 3.4) / span + 1) % 1;
      const p = A.clone().lerp(B, c.u);
      c.g.position.set(p.x + c.sd * 1.8, p.y - 1.8, p.z);
      world.movers.push({ x: c.g.position.x, y: c.g.position.y - 0.5, z: c.g.position.z, fx: dir.x * c.sd, fz: dir.z * c.sd, r: 1.0, h: 2.0, v: 3.4 });
    }
  }

  // Snow groomer (ratrak) rolling gently up and down the lower piste edge once awake
  if (alive && world.ratrak?.active) {
    const rt = world.ratrak;
    const u = 0.5 - 0.5 * Math.cos(time * 0.24);
    const nz = 18 + u * 16;
    const ny = jahorinaGroundY(rt.home.x, nz) + 0.05;
    const dirZ = Math.sin(time * 0.24) >= 0 ? 1 : -1;
    rt.group.position.set(rt.home.x, ny, nz);
    rt.group.rotation.y = dirZ > 0 ? 0 : Math.PI;
    world.movers.push({ x: rt.home.x, y: ny, z: nz, fx: 0, fz: dirZ, r: 2.6, h: 3.0, v: 1.9 });
  }

  // Slalom flags & summit windsock fluttering in the mountain breeze once awake
  if (alive) {
    for (const fl of world.flags || []) {
      fl.g.rotation.y = fl.baseRy + Math.sin(time * 4.2 + fl.phase) * 0.25;
    }
    if (world.windsock) {
      world.windsock.rotation.y = Math.sin(time * 1.3) * 0.18;
      world.windsock.rotation.z = -0.12 + Math.sin(time * 3.8) * 0.08;
    }
  }

  // Local Jahorina CC0 sounds once awake & running
  if (alive && running) {
    audio.setLoop('hearth-fire', nearGain(V(-14, PLATEAU_Y + 1, -9.5), 22), { vol: 0.28 });
    audio.setLoop('winter-wind', clamp(0.18 + Math.max(0, (ctx.flight.pos.y - 8) / 36) * 0.72, 0.15, 0.9), { vol: 0.22 });
    nextOwl -= dt;
    if (nextOwl <= 0) {
      nextOwl = 11 + Math.random() * 10;
      const g = nearGain(V(5.8, jahorinaGroundY(4, -26) + 3.8, -25.1), 36);
      if (g > 0.04) audio.playNear('owl-hoot', V(5.8, jahorinaGroundY(4, -26) + 3.8, -25.1), 36, 0.26, { initGain: g });
    }
    nextWolf -= dt;
    if (nextWolf <= 0) {
      nextWolf = 22 + Math.random() * 16;
      const g = nearGain(V(-34, 17, -54), 56);
      if (g > 0.04) audio.playNear('wolf-howl', V(-34, 17, -54), 56, 0.22, { initGain: g });
    }
  }

  snow?.update(dt, alive ? 0.35 : 0);
}

export default {
  id: 'jahorina',
  name: 'Jahorina',
  art,
  artAlt: 'Mount Jahorina in winter at alpenglow, painted in watercolour',
  WORDS,
  ORDER,
  CULTURE,
  ground: PLATEAU_Y,
  bounds: { boundsRadius: 145, ceiling: 90 },
  build,

  sideOf(f) {
    return f.z > 20 ? Math.PI : 0;
  },

  text: {
    firstHint: 'fly to the glowing orb and land on the fresh snow in front of the cabin',
    first: 'New orbs have appeared all over Jahorina. Find them in any order.',
    last: { id: 'vrh', msg: 'Only one orb is left. It is waiting at the top of Ogorjelica peak.' },
    fleur: 'Something golden is shining high above Ogorjelica peak. Fly through it.',
    awake: 'Jahorina has awakened. You can now explore it freely.',
  },

  update: updateMountain,
  onWake: wakeMountain,
  onAlive(ctx) {
    wakeMountain(ctx);
  },

  finale: {
    word: 'zima',
    paints: ['props', 'passerby', 'smoke', 'peaks'],
    // Finale photo: Ogorjelica & Poljice in rosy winter alpenglow
    photo: { from: V(32, 34, 62), to: V(-12, 10, -4) },
    // 26 s flight: from fleur above Ogorjelica -> down ski run -> over Poljice & pond -> past Planinarski dom
    P: [
      [2.5, 4, 42, 96],
      [6.0, 10, 34, 72],
      [9.5, -2, 24, 46],
      [13.0, 6, 15, 20],
      [16.0, 16, 12, 2],
      [19.0, 34, 11, -2],
      [22.5, 8, 12, -16],
      [26.0, -18, 16, -24],
    ],
    shots: [
      // 0 to 7.5 s: Ogorjelica summit & alpenglow winter sky sweeping over the peaks
      { t0: 0, t1: 7.5, from: V(24, 44, 116), to: V(-18, 42, 114), lookFrom: V(0, 26, 76), lookTo: V(-12, 12, 10) },
      // 7.5 to 14 s: gliding down the Olympic ski run & moving chairlift
      { t0: 7.5, t1: 14, from: V(28, 28, 72), to: V(24, 16, 28), lookFrom: V(-2, 18, 60), lookTo: V(0, 8, 14) },
      // 14 to 21 s: Poljice plaza, sledding hill & frozen pond as soft snow begins falling at 15 s
      { t0: 14, t1: 21, from: V(18, 14, 18), to: V(56, 14, 18), lookFrom: V(0, 6, -2), lookTo: V(46, 5, -4) },
      // 21 to 26 s: Planinarski dom, warm hearth fire, chimney smoke & snowy pines
      { t0: 21, t1: 26, from: V(4, 14, 16), to: V(-4, 18, -22), lookFrom: V(-22, 8, -4), lookTo: V(-26, 12, -38) },
    ],
    climax(ctx) {
      snow?.show();
      ctx.audio.playClip('wolf-howl', 0.24);
    },
  },

  ambience: {
    water() { return 0; },
    murmur: [
      [-18, -4, 20],   // Planinarski dom terrace
      [0, 6, 20],      // Poljice plaza
      [48, 2, 22],     // Frozen pond skaters
    ],
  },
};
