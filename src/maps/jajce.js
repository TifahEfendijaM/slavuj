// Jajce (spring): map module, finale, spinning watermills, swans/butterflies/swallows, spring petals, and local sounds.
import { Vector3 } from 'three';
import { buildJajceWorld, jajceGroundY, VIEW_Y, PLATEAU_Y } from './jajce-world.js';
import { WORDS, ORDER, CULTURE } from './jajce-words.js';
import { createSpringPetals } from '../spring-petals.js';
import art from '../../assets/journal-jajce.webp';

const V = (x, y, z) => new Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

let petals = null;
let nextFrog = 4;
let nextBird = 3;
let nextBell = 12;

function build(scene) {
  const world = buildJajceWorld(scene);
  petals = createSpringPetals(scene, {
    emitters: world.petalEmitters,
    groundY: jajceGroundY,
    count: 240,
  });
  nextFrog = 4;
  nextBird = 3;
  nextBell = 12;
  return world;
}

function updateJajce(dt, time, life, ctx) {
  const { world, audio, running, nearGain } = ctx;
  const alive = life > 0.5;
  world.movers.length = 0;

  // Spin wooden waterwheels at Mlinčići once awake
  if (alive && world.wheels) {
    for (const w of world.wheels) {
      w.g.rotation.z -= dt * w.speed;
    }
  }

  // Gentle bobbing raft on the Vrbas
  if (alive && world.raft) {
    const r = world.raft;
    r.g.position.y = r.home.y + Math.sin(time * 1.9) * 0.05;
    r.g.rotation.z = Math.sin(time * 1.4) * 0.03;
    r.g.rotation.x = Math.cos(time * 1.2) * 0.02;
  }

  // Swans gliding calmly on Pliva Lake
  if (alive && world.swans) {
    for (const sw of world.swans) {
      const a = time * sw.speed + sw.phase;
      const x = sw.home.x + Math.cos(a) * sw.r;
      const z = sw.home.z + Math.sin(a) * sw.r * 0.72;
      sw.g.position.set(x, sw.home.y + Math.sin(time * 2.1 + sw.phase) * 0.025, z);
      sw.g.rotation.y = Math.atan2(-Math.sin(a) * sw.r, Math.cos(a) * sw.r * 0.72);
    }
  }

  // Butterflies fluttering over the spring meadow
  if (alive && world.butterflies) {
    for (const bf of world.butterflies) {
      const a = time * bf.speed + bf.phase;
      bf.g.position.set(
        bf.home.x + Math.cos(a) * bf.r,
        bf.home.y + Math.sin(time * 3.1 + bf.phase) * 0.35,
        bf.home.z + Math.sin(a * 1.3) * bf.r * 0.8,
      );
      bf.g.rotation.y = -a;
      const flap = Math.sin(time * 18 + bf.phase) * 0.75;
      bf.lw.rotation.z = flap;
      bf.rw.rotation.z = -flap;
    }
  }

  // Bees orbiting the beehives
  if (alive && world.bees) {
    for (const be of world.bees) {
      const a = time * be.speed + be.phase;
      be.g.position.set(
        be.home.x + Math.cos(a) * be.r,
        be.home.y + Math.sin(a * 2.3) * 0.22,
        be.home.z + Math.sin(a) * be.r,
      );
    }
  }

  // Swallows circling over the old town roofs once awake
  if (alive && world.swallows) {
    for (const sl of world.swallows) {
      const a = time * sl.speed + sl.phase;
      const x = sl.home.x + Math.cos(a) * sl.r;
      const z = sl.home.z + Math.sin(a) * sl.r * 0.75;
      sl.g.position.set(x, sl.home.y + Math.sin(time * 2.4 + sl.phase) * 0.8, z);
      sl.g.rotation.y = Math.atan2(-Math.sin(a), Math.cos(a) * 0.75);
      const fl = Math.sin(time * 15 + sl.phase) * 0.55;
      sl.lw.rotation.z = fl;
      sl.rw.rotation.z = -fl;
    }
  }

  // Frog gentle hop-bob on lily pad
  if (alive && world.frog) {
    const hop = Math.max(0, Math.sin(time * 1.6)) ** 6;
    world.frog.position.y = world.frogHomeY + hop * 0.22;
  }

  // Local Jajce spring ambient recordings once alive & running
  if (alive && running) {
    // Pliva Waterfall roar right around the plunge pool
    audio.setLoop('waterfall-roar', nearGain(V(-4, 6, 0), 52), { vol: 0.30 });
    // Wooden watermill splash & creak at Mlinčići
    audio.setLoop('watermill-stream', nearGain(V(-54, PLATEAU_Y, 0), 32), { vol: 0.22 });
    // Spring guitar strum near the picnic meadow
    audio.setLoop('spring-guitar', nearGain(V(52, VIEW_Y + 1, 24), 24), { vol: 0.22 });

    // Spring songbirds in the orchards & meadows
    nextBird -= dt;
    if (nextBird <= 0) {
      nextBird = 6 + Math.random() * 7;
      const g = Math.max(
        nearGain(V(-24, PLATEAU_Y + 4, -26), 34),
        nearGain(V(-76, PLATEAU_Y + 2, 24), 34),
      );
      if (g > 0.04) audio.playNear('spring-bird', V(-24, PLATEAU_Y + 4, -26), 44, 0.26, { initGain: g });
    }

    // Frog croak by Pliva Lake
    nextFrog -= dt;
    if (nextFrog <= 0) {
      nextFrog = 7 + Math.random() * 8;
      const g = nearGain(V(-86, PLATEAU_Y, 6), 28);
      if (g > 0.04) audio.playNear('frog-croak', V(-86, PLATEAU_Y, 6), 28, 0.26, { initGain: g });
    }

    // Distant gentle bell from St. Luke's tower every ~28 s
    nextBell -= dt;
    if (nextBell <= 0) {
      nextBell = 24 + Math.random() * 14;
      const g = nearGain(V(-16, 32, -52), 56);
      if (g > 0.04) audio.playNear('tower-bell', V(-16, 32, -52), 56, 0.20, { initGain: g });
    }
  }

  petals?.update(dt);
}

function wakeJajce() {
  petals?.show();
}

export default {
  id: 'jajce',
  name: 'Jajce',
  art,
  artAlt: 'Jajce in spring with the Pliva Waterfall, wooden watermills, blooming cherry trees and hilltop fortress, painted in watercolour',
  WORDS,
  ORDER,
  CULTURE,
  ground: VIEW_Y,
  bounds: { boundsRadius: 155, ceiling: 92 },
  build,

  // Look from open river/south side by default
  sideOf(f) {
    if (f.x > 34) return -Math.PI / 2;
    if (f.x < -70) return Math.PI / 4;
    return 0;
  },

  // Keep swimming bird inside either lower Vrbas (y=0) or upper Pliva/Lake (y=13)
  swimClamp(pos, waterY) {
    if (waterY < 5) {
      if (pos.x < -8.5) pos.x = -8.5;
      if (pos.x > 33.0) pos.x = 33.0;
      if (pos.z < -105) pos.z = -105;
      if (pos.z > 105) pos.z = 105;
    } else {
      if (pos.x > -11.8) pos.x = -11.8;
      if (pos.x < -122) pos.x = -122;
      if (pos.x > -76) {
        if (pos.z < -9.5) pos.z = -9.5;
        if (pos.z > 9.5) pos.z = 9.5;
      } else {
        if (pos.z < -33) pos.z = -33;
        if (pos.z > 33) pos.z = 33;
      }
    }
  },

  // Pliva flows east (+x) toward the waterfall; Vrbas flows north (-z)
  waterDrift(pos, waterY, life) {
    if (waterY < 5) return [0, -0.45 * life];
    return [0.42 * life, 0];
  },

  text: {
    firstHint: 'fly to the glowing orb above the Pliva Waterfall',
    first: 'New orbs have appeared all over Jajce. Find them in any order.',
    last: { id: 'tvrdjava', msg: 'Only one orb is left. It is waiting at the royal fortress on the hilltop.' },
    fleur: 'Something golden is shining above the royal fortress. Fly through it.',
    awake: 'Jajce has awakened in spring. You can now explore it freely.',
  },

  update: updateJajce,
  onWake: wakeJajce,
  onAlive() {
    wakeJajce();
  },

  finale: {
    word: 'proljece',
    paints: ['canyon', 'town', 'hills', 'props', 'passerby', 'smoke'],
    // Finale photo: Jajce in spring from the east canyon looking NW across the waterfall to Old Town & Fortress
    photo: { from: V(48, 22, 34), to: V(-14, 15, -30) },
    // 26 s flight: from golden fleur above Tvrđava -> past St. Luke's tower -> swoop over Mlinčići & orchards -> swirl over Pliva Waterfall
    P: [
      [2.5, -6, 44, -74],
      [5.5, -14, 36, -54],
      [8.5, -34, 28, -30],
      [11.5, -52, 24, -6],
      [14.2, -26, 20, 4],
      [16.5, -4, 15, 4],
      [18.8, 14, 13, -4],
      [21.2, 24, 14, 10],
      [23.6, 30, 17, 24],
      [26.5, 42, 22, 34],
    ],
    shots: [
      // 0 to 7.5 s: from above the hilltop royal fortress, spring sky & warm sun colour over Jajce
      { t0: 0, t1: 7.5, from: V(-6, 46, -104), to: V(8, 42, -92), lookFrom: V(-8, 24, -56), lookTo: V(-12, 14, -12) },
      // 7.5 to 13.4 s: sweeping over St. Luke's bell tower, blooming orchards and Mlinčići watermills
      { t0: 7.5, t1: 13.4, from: V(-32, 32, -56), to: V(-56, 26, -18), lookFrom: V(-36, 18, -16), lookTo: V(-44, 15, 0) },
      // 13.4 to 22.8 s: Pliva Waterfall & rainbow; at 15 s pink-and-white behar petals burst and swirl over the falls!
      { t0: 13.4, t1: 22.8, from: V(28, 14, 18), to: V(26, 16, -16), lookFrom: V(-6, 9, 0), lookTo: V(-8, 10, 0) },
      // 22.8 to 26 s: wide sunlit panorama over the emerald Vrbas canyon, waterfall and fortress
      { t0: 22.8, t1: 26, from: V(48, 22, 34), to: V(56, 26, 20), lookFrom: V(-10, 12, -14), lookTo: V(-12, 16, -36) },
    ],
    climax(ctx) {
      // At t = 15 s: burst of pink-and-white spring blossom petals over the waterfall & orchards + gentle tower bell
      petals?.gust(V(-4, 16, 0));
      ctx.audio.playClip('tower-bell', 0.25);
    },
  },

  ambience: {
    water(p) {
      const dFall = Math.hypot(p.x + 8, p.z);
      const dVrbas = Math.max(0, Math.abs(p.x - 21) - 12);
      const dPliva = p.x < -10 ? Math.max(0, Math.abs(p.z) - 12) : 99;
      const base = Math.max(
        clamp(1 - dFall / 46, 0, 1) * 0.95,
        clamp(1 - dVrbas / 38, 0.06, 0.65),
        clamp(1 - dPliva / 34, 0, 0.60),
      );
      return clamp(base * clamp(1 - p.y / 65, 0.25, 1), 0.06, 1);
    },
    murmur: [
      [42, 0, 18],      // Viewpoint visitors
      [-20, -24, 20],   // Old town spring market
      [52, 24, 18],     // Picnic meadow
    ],
  },
};
