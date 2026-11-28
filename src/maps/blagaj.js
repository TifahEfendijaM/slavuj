// Blagaj (summer): map module. The Buna spring under the cliff, the Tekija, the boat on the pool, trout, swallows
// along the rock, the falcon, the stamping mill's hammers, a tortoise on the karst, sun sparkles on the water, and local sounds.
import { Vector3 } from 'three';
import { buildBlagajWorld, TOWN_Y, CLIFF_Y } from './blagaj-world.js';
import { WORDS, ORDER, CULTURE } from './blagaj-words.js';
import { createSummerSparkles } from '../summer-sparkles.js';
import art from '../../assets/journal-blagaj.webp';

const V = (x, y, z) => new Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

let sparkles = null;
let nextFalcon = 10;
let nextCoo = 6;

function build(scene) {
  const world = buildBlagajWorld(scene);
  sparkles = createSummerSparkles(scene, { count: 180, xSpan: 22, zMin: -60, zMax: 120, waterY: 0.12 });
  nextFalcon = 10;
  nextCoo = 6;
  return world;
}

function updateBlagaj(dt, time, life, ctx) {
  const { world, audio, running, nearGain } = ctx;
  const alive = life > 0.5;
  world.movers.length = 0;

  // the boat rocking on the spring pool
  if (alive && world.boat) {
    const b = world.boat;
    b.g.position.y = b.home.y + Math.sin(time * 1.6) * 0.05;
    b.g.rotation.z = Math.sin(time * 1.1) * 0.035;
  }
  // trout turning slow circles in the cold water
  if (alive && world.fish) {
    for (const f of world.fish) {
      const a = time * f.speed + f.phase;
      f.g.position.set(f.home.x + Math.cos(a) * f.rx, f.home.y, f.home.z + Math.sin(a) * f.rz);
      f.g.rotation.y = -a;
    }
  }
  // the falcon turning its head on the ledge
  if (alive && world.birds) for (const bd of world.birds) bd.g.rotation.y = bd.ry + Math.sin(time * 0.9 + bd.phase) * 0.45;
  // swallows darting in loops along the cliff face (they stay hidden in the sketch: only their nests show)
  if (world.swallows) {
    for (const s of world.swallows) {
      s.g.visible = alive;
      if (!alive) continue;
      const a = time * s.speed + s.phase, x = s.cx + Math.cos(a) * s.r, y = s.cy + Math.sin(a * 2) * 1.6;
      const z = -32 + Math.sin(a * 1.3) * 2.2;      // a few metres out from the rock
      s.g.position.set(x, y, Math.max(z, -40));
      s.g.rotation.y = Math.atan2(-Math.sin(a) * s.r, 0.8) ;
      s.g.rotation.z = Math.sin(a) * 0.5;
      const flap = Math.sin(time * 18 + s.phase) * 0.7;
      s.wings[0].rotation.z = flap; s.wings[1].rotation.z = -flap;
    }
  }
  // the stamping mill's hammers rising and falling
  if (world.hammers) for (const h of world.hammers) h.g.rotation.x = alive ? -Math.max(0, Math.sin(time * 2.4 + h.phase)) * 0.55 : 0;
  // the tortoise plodding a small circle between the stones
  if (alive && world.tortoise) {
    const t = world.tortoise, a = time * 0.06;
    t.g.position.set(t.home.x + Math.cos(a) * 1.2, t.home.y, t.home.z + Math.sin(a) * 0.8);
    t.g.rotation.y = -a;
  }

  if (alive && running) {
    // the spring roaring out of the cave, the mill race, the grill, the Tekija fountain
    audio.setLoop('buna-spring', nearGain(V(0, 1, -42), 70), { vol: 0.3 });
    audio.setLoop('mill-stream', nearGain(V(16.5, TOWN_Y + 1, 34), 24), { vol: 0.18 });
    audio.setLoop('grill-sizzle', nearGain(V(-24.6, TOWN_Y + 1, -8.6), 16), { vol: 0.14 });
    audio.setLoop('fountain-trickle', nearGain(V(35, TOWN_Y + 1, -19.5), 12), { vol: 0.12 });
    nextFalcon -= dt;
    if (nextFalcon <= 0) {
      nextFalcon = 14 + Math.random() * 12;
      const p = V(-22, 30, -42), g = nearGain(p, 70);
      if (g > 0.04) audio.playNear('falcon-cry', p, 70, 0.2, { initGain: g });
    }
    nextCoo -= dt;
    if (nextCoo <= 0) {
      nextCoo = 8 + Math.random() * 9;
      const p = V(31, TOWN_Y, -1), g = nearGain(p, 20);
      if (g > 0.04) audio.playNear('pigeon-coo', p, 20, 0.16, { initGain: g });
    }
  }

  sparkles?.update(dt);
}

function wakeBlagaj() {
  sparkles?.show();
}

export default {
  id: 'blagaj',
  name: 'Blagaj',
  art,
  artAlt: 'Blagaj in summer: the white Tekija with its wooden bay window against the tall pale cliff, beside the dark cave the Buna pours out of, painted in watercolour',
  WORDS,
  ORDER,
  CULTURE,
  ground: TOWN_Y,
  bounds: { boundsRadius: 160, ceiling: 112 },
  build,

  // look from the water side: the cliff and the Tekija face south, the terrace faces east
  sideOf(f) {
    if (f.y > CLIFF_Y - 2) return 0;
    if (f.x < -13 && f.z > -36) return Math.PI / 2;
    if (f.x > 13 && f.z > -14) return -Math.PI / 2;
    return 0;
  },

  // swimming stays in the spring pool (wide, reaching into the cave) and the river below it
  swimClamp(pos) {
    if (pos.z < -71) pos.z = -71;
    if (pos.z > 150) pos.z = 150;
    const half = pos.z < -14 ? 23.2 : 11.6;
    if (pos.x < -half) pos.x = -half;
    if (pos.x > half) pos.x = half;
  },

  // the spring pushes gently out of the cave; below the pool the Buna flows south
  waterDrift(pos, waterY, life) {
    return [0, (pos.z < -14 ? 0.18 : 0.42) * life];
  },

  text: {
    firstHint: 'fly down to the glowing orb over the spring of the Buna',
    first: 'New orbs have appeared all over Blagaj, from the spring to the cliff top. Find them in any order.',
    last: { id: 'tvrdjava', msg: 'Only one orb is left. It is waiting on the hill above the cliff, by the walls of Stjepan grad.' },
    fleur: 'Something golden is shining above the fortress of Stjepan grad. Fly through it.',
    awake: 'Blagaj has woken up in the summer sun. You can now explore it freely.',
  },

  update: updateBlagaj,
  onWake: wakeBlagaj,
  onAlive() {
    wakeBlagaj();
  },

  finale: {
    word: 'mir',
    paints: ['riverbank', 'rijeka', 'town', 'hills', 'props', 'passerby', 'smoke', 'coffee', 'fes'],
    // the photo: the Tekija against the cliff, the cave, the pool and the boat
    photo: { from: V(-30, 14, 14), to: V(10, 10, -36) },
    // 26 s: from the fleur over Stjepan grad, out over the cliff edge, down the face to the cave, across the pool past the Tekija, down the Buna
    P: [
      [2.5, -16, 80, -82],
      [5.5, -2, 76, -60],
      [8.5, 4, 56, -36],
      [11.5, 6, 30, -18],
      [14.2, 2, 12, -14],
      [16.5, -8, 6, -22],
      [18.8, 4, 5, -6],
      [21.2, 0, 8, 18],
      [23.6, -2, 10, 40],
      [26.5, 0, 14, 60],
    ],
    shots: [
      // 0 to 7 s: above the fortress, looking out over the cliff edge to the valley
      { t0: 0, t1: 7, from: V(-74, 96, -150), to: V(-56, 90, -132), lookFrom: V(-22, 66, -90), lookTo: V(6, 40, -30) },
      // 7 to 13.4 s: down the face of the cliff to the cave and the Tekija
      { t0: 7, t1: 13.4, from: V(-26, 46, 12), to: V(-30, 22, 6), lookFrom: V(4, 40, -46), lookTo: V(4, 8, -40) },
      // 13.4 to 22 s: gliding across the pool, past the Tekija's bay window and the terrace
      { t0: 13.4, t1: 22, from: V(-12, 6, -12), to: V(8, 7, -8), lookFrom: V(2, 4, -42), lookTo: V(24, 6, -32) },
      // 22 to 26 s: down the Buna to the mills and the Karađoz-beg bridge
      { t0: 22, t1: 26, from: V(-30, 18, 20), to: V(-22, 22, 30), lookFrom: V(8, 4, 44), lookTo: V(0, 4, 84) },
    ],
    climax(ctx) {
      ctx.audio.playClip('falcon-cry', 0.22);
    },
  },

  ambience: {
    water(p) {
      const half = p.z < -14 ? 24 : 12;
      const d = Math.max(0, Math.abs(p.x) - half);
      const base = clamp(1 - d / 40, 0.08, 0.95);
      return clamp(base * clamp(1 - p.y / 60, 0.2, 1), 0.06, 1);
    },
    murmur: [
      [30, TOWN_Y, -20],      // the Tekija courtyard
      [-19, TOWN_Y, -19],     // the terrace
      [36, TOWN_Y, 0],        // the stalls
    ],
  },
};
