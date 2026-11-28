// Tuzla (summer / City of Salt & Pannonian Lakes): map module, 26 s golden finale, moving salt train, salt sparkles & Tuzla sounds.
import { Vector3 } from 'three';
import { buildTuzlaWorld, CITY_Y, LAKE_Y } from './tuzla-world.js';
import { WORDS, ORDER, CULTURE } from './tuzla-words.js';
import { createTuzlaSparkles } from '../tuzla-sparkles.js';
import art from '../../assets/journal-tuzla.webp';

const V = (x, y, z) => new Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

let sparkles = null;
let nextTrain = 7;

function build(scene) {
  const world = buildTuzlaWorld(scene);
  sparkles = createTuzlaSparkles(scene, { count: 220 });
  nextTrain = 7;
  return world;
}

function wakeCity(ctx) {
  const { world } = ctx;
  if (world.train && !world.train.active) {
    world.train.active = true;
    const idx = world.colliders.indexOf(world.train.collider);
    if (idx >= 0) world.colliders.splice(idx, 1);
  }
  sparkles?.show();
}

function updateCity(dt, time, life, ctx) {
  const { world, audio, running, nearGain } = ctx;
  const alive = life > 0.5;
  world.movers.length = 0;

  // Tuzla salt-mine train gliding smoothly along the steel railway track once awake
  if (alive && world.train?.active) {
    const tr = world.train;
    const u = Math.sin(time * 0.22);
    const dirZ = Math.cos(time * 0.22) >= 0 ? 1 : -1;
    const nz = -8.0 + u * 14.5;
    tr.g.position.set(tr.home.x, tr.home.y, nz);
    world.movers.push({ x: tr.home.x, y: CITY_Y + 1.6, z: nz, fx: 0, fz: dirZ, r: 2.2, h: 3.4, v: 3.2 });
  }

  // Local Tuzla ambient sounds once awake & running
  if (alive && running) {
    audio.setLoop('salt-cascade', nearGain(V(2, 2, 36), 54), { vol: 0.24 });
    audio.setLoop('sevdah-accordion', nearGain(V(42, CITY_Y + 2, 8), 40), { vol: 0.20 });
    audio.setLoop('banja-crickets', nearGain(V(8, 16, -78), 46), { vol: 0.18 });
    nextTrain -= dt;
    if (nextTrain <= 0) {
      nextTrain = 12 + Math.random() * 10;
      const tp = V(-56, CITY_Y + 3, -6);
      const g = nearGain(tp, 74);
      if (g > 0.05) audio.playNear('steam-train', tp, 74, 0.24, { initGain: g });
    }
  }

  sparkles?.update(dt, alive ? 0.35 : 0);
}

export default {
  id: 'tuzla',
  name: 'Tuzla',
  art,
  artAlt: 'Tuzla and the Pannonian Salt Lakes beneath Slana Banja hill, painted in watercolour',
  WORDS,
  ORDER,
  CULTURE,
  ground: CITY_Y,
  bounds: { boundsRadius: 145, ceiling: 88 },
  build,

  sideOf(f) {
    return f.z > 10 ? 0 : Math.PI;
  },

  text: {
    firstHint: 'fly out from the lakeside terrace toward the glowing orb above the white salt crystal',
    first: 'New orbs have appeared all over Tuzla. Find them in any order.',
    last: { id: 'zvjezdarnica', msg: 'Only one orb is left. It is waiting at the white observatory atop Slana Banja.' },
    fleur: 'Something golden is shining high above Slana Banja observatory. Fly through it.',
    awake: 'Tuzla has awakened. You can now explore the City of Salt freely.',
  },

  update: updateCity,
  onWake: wakeCity,
  onAlive(ctx) {
    wakeCity(ctx);
  },

  finale: {
    word: 'so',
    paints: ['terrain', 'lakes', 'props', 'passerby'],
    // Finale photo: sweeping golden panorama from Slana Banja over Soni trg, salt mine & turquoise Pannonian Lakes
    photo: { from: V(24, 24, -68), to: V(-10, 4, 28) },
    // 26 s flight: from Slana Banja Observatory -> over market & Soni trg -> across salt mine & moving train -> over turquoise Pannonian Lakes & waterfalls -> to University & sevdah music pavilion
    P: [
      [2.5,  6, 32, -80],
      [6.0, -4, 20, -46],
      [9.5, -24, 15, -14],
      [13.0, -42, 13, 14],
      [16.5, -16, 12, 34],
      [20.0,  16, 14, 30],
      [23.0,  40, 15,  4],
      [26.0,  10, 20, -8],
    ],
    shots: [
      // 0 to 7 s: Slana Banja white observatory framing Tuzla & Pannonian Lakes in the distance
      { t0: 0, t1: 7.0, from: V(-22, 34, -98), to: V(-18, 28, -66), lookFrom: V(6, 22, -84), lookTo: V(-6, 5, 18) },
      // 7 to 14 s: gliding past the salt mine hoist tower, rolling salt train & Neolithic stilt village
      { t0: 7.0, t1: 14.0, from: V(-26, 16, -24), to: V(-34, 14, 22), lookFrom: V(-46, 6, -6), lookTo: V(-24, 3, 34) },
      // 14 to 20.5 s: climax sweep over turquoise Pannonian Lakes, terraced salt waterfalls & Soni trg
      { t0: 14.0, t1: 20.5, from: V(-30, 12, 48), to: V(22, 15, 44), lookFrom: V(-6, 2, 34), lookTo: V(4, 5, -6) },
      // 20.5 to 26 s: sweeping past the University, sevdah music pavilion & pulling wide over Tuzla
      { t0: 20.5, t1: 26.0, from: V(58, 16, 22), to: V(28, 26, -42), lookFrom: V(42, 6, 4), lookTo: V(-8, 4, 20) },
    ],
    climax(ctx) {
      sparkles?.show();
      ctx.audio.playClip('steam-train', 0.26);
    },
  },

  ambience: {
    water(p) {
      const d = Math.hypot(p.x + 6, p.z - 36);
      return clamp(1 - d / 44, 0, 1) * 0.45;
    },
    murmur: [
      [0, -6, 24],     // Soni trg & Korzo
      [-4, -40, 24],   // Gradska pijaca market
      [42, 8, 22],     // University & music pavilion
    ],
  },
};
