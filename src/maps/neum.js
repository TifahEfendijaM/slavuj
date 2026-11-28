// Neum (summer / Adriatic Sea): map module, 26 s Adriatic sunset finale, moving sailboats, lighthouse beam, sparkles, and coastal sounds.
import { Vector3 } from 'three';
import { buildNeumWorld, PROM_Y } from './neum-world.js';
import { WORDS, ORDER, CULTURE } from './neum-words.js';
import { createSummerSparkles } from '../summer-sparkles.js';
import art from '../../assets/journal-neum.webp';

const V = (x, y, z) => new Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

let sparkles = null;
let nextGull = 5;

function build(scene) {
  const world = buildNeumWorld(scene);
  sparkles = createSummerSparkles(scene, { count: 220, xSpan: 105, zMin: 18, zMax: 100, waterY: 0.16 });
  nextGull = 5;
  return world;
}

function wakeCoast(ctx) {
  const { world } = ctx;
  for (const sb of world.sailboats || []) {
    if (!sb.active) {
      sb.active = true;
      const idx = world.colliders.indexOf(sb.collider);
      if (idx >= 0) world.colliders.splice(idx, 1);
    }
  }
  if (world.lighthouseBeam) world.lighthouseBeam.visible = true;
  sparkles?.show();
}

function updateCoast(dt, time, life, ctx) {
  const { world, audio, running, nearGain } = ctx;
  const alive = life > 0.5;
  world.movers.length = 0;

  // White sailboats gliding gracefully across Neum bay once awake
  if (alive) {
    for (let si = 0; si < (world.sailboats || []).length; si++) {
      const sb = world.sailboats[si];
      if (!sb.active || !sb.orbit) continue;
      const ang = time * sb.orbit.speed;
      const nx = sb.orbit.cx + Math.cos(ang) * sb.orbit.rx;
      const nz = sb.orbit.cz + Math.sin(ang) * sb.orbit.rz;
      const vx = -Math.sin(ang) * sb.orbit.rx * sb.orbit.speed;
      const vz = Math.cos(ang) * sb.orbit.rz * sb.orbit.speed;
      const ry = Math.atan2(vx, vz);
      const ny = 0.12 + Math.sin(time * 1.9 + nx) * 0.08;
      sb.g.position.set(nx, ny, nz);
      sb.g.rotation.y = ry;
      sb.g.rotation.z = Math.sin(time * 1.4) * 0.05;
      world.movers.push({ x: nx, y: 1.5, z: nz, fx: vx, fz: vz, r: 2.2, h: 4.5, v: 2.2 });
      // Keep the sailor ('jedriti') seated inside the cockpit of sailboat[0] as it sails!
      if (si === 0) {
        const sailor = ctx.people?.list?.find((p) => p.o.kind === 'neuSailor');
        if (sailor) {
          const sx = nx - Math.sin(ry) * 1.15, sz = nz - Math.cos(ry) * 1.15;
          sailor.root.position.set(sx, ny + 0.84, sz);
          sailor.root.rotation.y = ry;
          if (sailor.block) sailor.block.matrixWorld.setPosition(sx, ny + 1.5, sz);
        }
      }
    }
    // Rotating golden Adriatic lighthouse beam
    if (world.lighthouseBeam) {
      world.lighthouseBeam.rotation.y = time * 0.72;
    }
  }

  // Local Adriatic CC0/PD sounds once awake & running
  if (alive && running) {
    const seaGain = clamp(0.18 + Math.max(0, 1 - Math.abs(ctx.flight.pos.z - 26) / 68) * 0.62, 0.12, 0.8);
    audio.setLoop('sea-waves', seaGain, { vol: 0.24 });
    audio.setLoop('cicadas', nearGain(V(6, 12, -40), 58), { vol: 0.20 });
    audio.setLoop('harbour-creak', nearGain(V(-58, 3, 24), 34), { vol: 0.20 });
    nextGull -= dt;
    if (nextGull <= 0) {
      nextGull = 9 + Math.random() * 10;
      const gp = V(-32, 12, 34);
      const g = nearGain(gp, 68);
      if (g > 0.05) audio.playNear('seagulls', gp, 68, 0.24, { initGain: g });
    }
  }

  sparkles?.update(dt);
}

export default {
  id: 'neum',
  name: 'Neum',
  art,
  artAlt: 'Neum on the Adriatic Sea in summer, painted in watercolour',
  WORDS,
  ORDER,
  CULTURE,
  ground: PROM_Y,
  bounds: { boundsRadius: 145, ceiling: 88 },
  build,

  sideOf(f) {
    return f.z > 10 ? 0 : Math.PI;
  },

  text: {
    firstHint: 'fly out from the promenade to the glowing orb over the turquoise sea',
    first: 'New orbs have appeared all across Neum and its bay. Find them in any order.',
    last: { id: 'svjetionik', msg: 'Only one orb is left. It is waiting at the top of the pier lighthouse.' },
    fleur: 'Something golden is shining above the lighthouse. Fly through it.',
    awake: 'Neum has awakened. You can now explore the coast freely.',
  },

  update: updateCoast,
  onWake: wakeCoast,
  onAlive(ctx) {
    wakeCoast(ctx);
  },

  finale: {
    word: 'ljeto',
    paints: ['hills', 'props', 'passerby'],
    // Finale photo: golden sunset sweep across Neum bay, lighthouse, beach & hillside villas
    photo: { from: V(32, 26, 62), to: V(-28, 7, 8) },
    // 26 s flight: from fleur above lighthouse -> along breakwater & boats -> across beach -> over konoba & hillside villas
    P: [
      [2.5, -52, 22, 56],
      [6.0, -34, 15, 42],
      [9.5, -14, 11, 28],
      [13.0, 12, 10, 20],
      [16.0, 28, 12, 12],
      [19.0, 14, 14, -6],
      [22.5, -18, 15, -12],
      [26.0, -42, 18, 10],
    ],
    shots: [
      // 0 to 7.5 s: lighthouse & breakwater glowing in warm Adriatic sunset
      { t0: 0, t1: 7.5, from: V(-26, 26, 86), to: V(-46, 20, 74), lookFrom: V(-58, 13, 62), lookTo: V(-36, 4, 34) },
      // 7.5 to 14 s: gliding over sailboats, dolphins & Neum's striped umbrella beach
      { t0: 7.5, t1: 14, from: V(-20, 14, 52), to: V(22, 13, 40), lookFrom: V(-12, 3, 24), lookTo: V(14, 4, 12) },
      // 14 to 21 s: climax sweep across the palm promenade, hotel & seaside konoba as sea sparkles light up
      { t0: 14, t1: 21, from: V(34, 16, 26), to: V(-12, 14, 18), lookFrom: V(6, 7, -14), lookTo: V(-32, 4, -2) },
      // 21 to 26 s: pulling wide over the whole turquoise Neum-Klek bay & Herzegovinian hillside
      { t0: 21, t1: 26, from: V(-28, 22, 34), to: V(-44, 28, 66), lookFrom: V(-4, 7, -18), lookTo: V(12, 8, -28) },
    ],
    climax(ctx) {
      if (ctx.world.lighthouseBeam) ctx.world.lighthouseBeam.visible = true;
      sparkles?.show();
      ctx.audio.playClip('seagulls', 0.24);
    },
  },

  ambience: {
    water(p) {
      return clamp(1 - Math.abs(p.z - 28) / 48, 0, 1) * 0.45;
    },
    murmur: [
      [-34, -2, 18],   // Seaside konoba terrace
      [-6, 12, 24],    // Main Neum beach
      [24, 16, 18],    // Beach volleyball court
    ],
  },
};
