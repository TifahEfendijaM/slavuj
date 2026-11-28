// Travnik (summer): map module, finale, swimming trout, clock hands, waving banner, sheep & farm birds, golden summer motes, and local sounds.
import { Vector3 } from 'three';
import { buildTravnikWorld, travnikGroundY, TOWN_Y } from './travnik-world.js';
import { WORDS, ORDER, CULTURE } from './travnik-words.js';
import { createSummerMotes } from '../summer-motes.js';
import art from '../../assets/journal-travnik.webp';

const V = (x, y, z) => new Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

let motes = null;
let nextRooster = 5;
let nextSheepBell = 4;
let nextClock = 14;

function build(scene) {
  const world = buildTravnikWorld(scene);
  motes = createSummerMotes(scene, {
    emitters: world.moteEmitters,
    groundY: travnikGroundY,
    count: 200,
  });
  nextRooster = 5;
  nextSheepBell = 4;
  nextClock = 14;
  return world;
}

function updateTravnik(dt, time, life, ctx) {
  const { world, audio, running, nearGain } = ctx;
  const alive = life > 0.5;
  world.movers.length = 0;

  // Swimming mountain trout in the clear Plava voda spring once awake
  if (alive && world.trouts) {
    for (const tr of world.trouts) {
      const a = time * tr.speed + tr.phase;
      const x = tr.home.x + Math.sin(a) * tr.rx;
      const z = tr.home.z + Math.cos(a * 0.7) * tr.rz;
      tr.g.position.set(x, tr.home.y + Math.sin(time * 3.2 + tr.phase) * 0.04, z);
      tr.g.rotation.y = Math.atan2(Math.cos(a) * tr.rx, -Math.sin(a * 0.7) * tr.rz * 0.7);
    }
  }

  // Sahat-kula clock hands turning gently once awake
  if (alive && world.clockHands) {
    for (const h of world.clockHands) {
      h.min.rotation.z = -(time * 0.25);
      h.hour.rotation.z = -(time * 0.25 / 12) - 0.8;
    }
  }

  // Fortress crimson-and-gold banner fluttering in the Vlašić breeze once awake
  if (alive && world.banner) {
    world.banner.rotation.y = Math.sin(time * 2.4) * 0.26;
    world.banner.rotation.z = Math.sin(time * 3.6) * 0.06;
  }

  // Farmyard goose & rooster subtle bobbing once awake
  if (alive && world.farmBirds) {
    for (const fb of world.farmBirds) {
      fb.g.rotation.y = fb.ry + Math.sin(time * 1.1 + fb.phase) * 0.35;
      if (fb.head) fb.head.rotation.x = Math.max(0, Math.sin(time * 2.1 + fb.phase)) ** 4 * 0.65;
    }
  }

  // Local Travnik ambient recordings once alive & running
  if (alive && running) {
    // Rushing Plava voda cold spring brook
    audio.setLoop('plava-voda', nearGain(V(0, 2.0, 6), 40), { vol: 0.28 });
    // Sizzling charcoal grill at the Travnik food plaza
    audio.setLoop('grill-sizzle', nearGain(V(26, TOWN_Y + 1, 20), 22), { vol: 0.22 });
    // Summer cicadas on the sunlit Vlašić slopes
    audio.setLoop('summer-cicadas', nearGain(V(-42, 16, -42), 46), { vol: 0.16 });

    // Rooster crowing on the Lašva valley farmstead
    nextRooster -= dt;
    if (nextRooster <= 0) {
      nextRooster = 14 + Math.random() * 12;
      const g = nearGain(V(16, TOWN_Y + 1, 76), 42);
      if (g > 0.04) audio.playNear('rooster-crow', V(16, TOWN_Y + 1, 76), 42, 0.26, { initGain: g });
    }

    // Soft brass sheep bell up on the Vlašić foothills
    nextSheepBell -= dt;
    if (nextSheepBell <= 0) {
      nextSheepBell = 6 + Math.random() * 8;
      const g = nearGain(V(-46, 15, -42), 38);
      if (g > 0.04) audio.playNear('sheep-bell', V(-46, 15, -42), 38, 0.26, { initGain: g });
    }

    // Clock tower chime every ~28 s
    nextClock -= dt;
    if (nextClock <= 0) {
      nextClock = 24 + Math.random() * 14;
      const g = nearGain(V(-54, TOWN_Y + 14, 18), 58);
      if (g > 0.04) audio.playNear('clock-chime', V(-54, TOWN_Y + 14, 18), 58, 0.22, { initGain: g });
    }
  }

  motes?.update(dt);
}

function wakeTravnik() {
  motes?.show();
}

export default {
  id: 'travnik',
  name: 'Travnik',
  art,
  artAlt: 'Travnik in summer with the turquoise Plava voda stream, colourful Šarena džamija, Sahat-kula clock tower and Stari Grad fortress beneath Mount Vlašić, painted in watercolour',
  WORDS,
  ORDER,
  CULTURE,
  ground: TOWN_Y,
  bounds: { boundsRadius: 155, ceiling: 92 },
  build,

  // Look from open valley/south side by default
  sideOf(f) {
    if (f.z > 64) return Math.PI;
    return 0;
  },

  // Keep swimming bird inside either Plava voda (y=1.6, x=-6..6) or Lašva River (y=0, z=48..66)
  swimClamp(pos, waterY) {
    if (waterY < 0.8) {
      if (pos.z < 48.8) pos.z = 48.8;
      if (pos.z > 65.2) pos.z = 65.2;
      if (pos.x < -115) pos.x = -115;
      if (pos.x > 115) pos.x = 115;
    } else {
      if (pos.x < -5.2) pos.x = -5.2;
      if (pos.x > 5.2) pos.x = 5.2;
      if (pos.z < -11.5) pos.z = -11.5;
      if (pos.z > 47.5) pos.z = 47.5;
    }
  },

  // Plava voda flows south (+z) into the Lašva River, which flows east (+x)
  waterDrift(pos, waterY, life) {
    if (waterY < 0.8) return [0.42 * life, 0];
    return [0, 0.45 * life];
  },

  text: {
    firstHint: 'fly to the glowing orb above the turquoise Plava voda spring',
    first: 'New orbs have appeared all over Travnik. Find them in any order.',
    last: { id: 'zidine', msg: 'Only one orb is left. It is waiting at Stari Grad fortress high on the crag.' },
    fleur: 'Something golden is shining high above Stari Grad Travnik. Fly through it.',
    awake: 'Travnik has awakened in summer. You can now explore it freely.',
  },

  update: updateTravnik,
  onWake: wakeTravnik,
  onAlive() {
    wakeTravnik();
  },

  finale: {
    word: 'ljeto',
    paints: ['valley', 'town', 'hills', 'props', 'passerby', 'smoke'],
    // Finale photo: sunlit Travnik from the south bank looking north over Lašva, Plava voda, Šarena džamija and Stari Grad
    photo: { from: V(18, 24, 82), to: V(-6, 14, -18) },
    // 26 s flight: from golden fleur above Stari Grad -> swoop down over Plava voda -> circle Šarena džamija & Sahat-kula -> out over Lašva valley
    P: [
      [2.5, 0, 42, -46],
      [5.5, -12, 34, -28],
      [8.5, -24, 24, -6],
      [11.5, -22, 18, 16],
      [14.2, -6, 13, 14],
      [16.5, 4, 11, 2],
      [18.8, 10, 12, 18],
      [21.2, 18, 15, 36],
      [23.6, 20, 19, 58],
      [26.5, 18, 24, 80],
    ],
    shots: [
      // 0 to 7.5 s: from above Stari Grad fortress, summer sky colours over Travnik & Mount Vlašić
      { t0: 0, t1: 7.5, from: V(16, 44, -66), to: V(-14, 42, -64), lookFrom: V(0, 22, -26), lookTo: V(-8, 14, 14) },
      // 7.5 to 13.4 s: sweeping over Šarena džamija, Sahat-kula and Ivo Andrić's house
      { t0: 7.5, t1: 13.4, from: V(-44, 22, 42), to: V(-16, 18, 34), lookFrom: V(-28, 10, 18), lookTo: V(-8, 8, 8) },
      // 13.4 to 22.8 s: Plava voda spring terraces; at 15 s sunlit summer motes swirl over the blue stream!
      { t0: 13.4, t1: 22.8, from: V(16, 11, 24), to: V(-14, 12, 22), lookFrom: V(0, 5, 4), lookTo: V(0, 8, -14) },
      // 22.8 to 26 s: wide panorama over the Lašva valley with Stari Grad and Vlašić behind
      { t0: 22.8, t1: 26, from: V(24, 22, 82), to: V(8, 26, 86), lookFrom: V(-4, 12, 12), lookTo: V(-4, 18, -32) },
    ],
    climax(ctx) {
      motes?.gust(V(0, 9, 4));
      ctx.audio.playClip('clock-chime', 0.28);
    },
  },

  ambience: {
    water(p) {
      const dPlava = Math.max(0, Math.abs(p.x) - 6) + Math.max(0, Math.max(-14 - p.z, p.z - 50));
      const dLasva = Math.max(0, Math.abs(p.z - 57) - 9);
      const base = Math.max(
        clamp(1 - dPlava / 34, 0, 0.85),
        clamp(1 - dLasva / 36, 0.06, 0.65),
      );
      return clamp(base * clamp(1 - p.y / 65, 0.25, 1), 0.06, 1);
    },
    murmur: [
      [0, 10, 22],      // Plava voda riverside cafés
      [-28, 20, 22],    // Šarena džamija bazaar arcade
      [26, 20, 20],     // Travnik food plaza
    ],
  },
};
