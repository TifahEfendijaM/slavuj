// Trebinje (autumn): map module, Arslanagića Bridge, turning wooden dolap waterwheel, Platani square,
// Herzegovinian vineyards & apiary, Crkvina Hercegovačka Gračanica monastery, finale, and local sounds.
import { Vector3 } from 'three';
import { buildTrebinjeWorld, TOWN_Y } from './trebinje-world.js';
import { WORDS, ORDER, CULTURE } from './trebinje-words.js';
import { createTrebinjePetals } from '../trebinje-petals.js';
import art from '../../assets/journal-trebinje.webp';

const V = (x, y, z) => new Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

let petals = null;
let nextBell = 12;
let nextOwl = 9;

function build(scene) {
  const world = buildTrebinjeWorld(scene);
  petals = createTrebinjePetals(scene, { count: 220, bounds: 86 });
  nextBell = 12;
  nextOwl = 9;
  return world;
}

function updateTrebinje(dt, time, life, ctx) {
  const { world, audio, running, nearGain } = ctx;
  const alive = life > 0.5;
  world.movers.length = 0;

  // Giant wooden Trebišnjica irrigation waterwheel (dolap) turning smoothly once awake
  if (alive && world.dolapWheel) {
    world.dolapWheel.rotation.x += dt * 0.55;
  }

  // Shimmering golden swarm of honeybees ('roj') orbiting over the apiary
  if (alive && world.bees) {
    for (const bee of world.bees) {
      const a = time * bee.speed + bee.phase;
      bee.g.position.set(
        bee.home.x + Math.cos(a) * bee.r,
        bee.home.y + Math.sin(time * 4.2 + bee.phase) * 0.25,
        bee.home.z + Math.sin(a * 1.3) * bee.r * 0.85,
      );
      bee.g.rotation.y = -a;
    }
  }

  // Forked-tail swallows ('lastavica') skimming gracefully over the Trebišnjica arches
  if (alive && world.swallows) {
    for (const sw of world.swallows) {
      const a = time * sw.speed + sw.phase;
      sw.g.position.set(sw.home.x + Math.cos(a) * sw.rx, sw.home.y + Math.sin(a * 2) * 0.45, sw.home.z + Math.sin(a) * sw.rz);
      sw.g.rotation.y = -a;
    }
  }

  // Local Trebinje Mediterranean sounds once alive & running
  if (alive && running) {
    // Gentle wooden dolap waterwheel creak & Trebišnjica splash
    audio.setLoop('dolap-wheel', nearGain(V(-14, 2.5, 8), 42), { vol: 0.26 });
    // Warm Mediterranean cicadas singing in the vineyards & olive grove
    audio.setLoop('karst-cicadas', nearGain(V(34, TOWN_Y + 2, -16), 44), { vol: 0.20 });
    // Soft humming bees at the sunlit Herzegovinian apiary
    audio.setLoop('apiary-hum', nearGain(V(-34, TOWN_Y + 2, -24), 26), { vol: 0.18 });

    // Soft scops owl ('ćuk') evening whistle from the Platani trees
    nextOwl -= dt;
    if (nextOwl <= 0) {
      nextOwl = 10 + Math.random() * 9;
      const g = nearGain(V(-28, TOWN_Y + 5, 18), 40);
      if (g > 0.04) audio.playNear('scops-owl', V(-28, TOWN_Y + 5, 18), 40, 0.22, { initGain: g });
    }

    // Warm distant bronze monastery bell from Hercegovačka Gračanica on Crkvina Hill
    nextBell -= dt;
    if (nextBell <= 0) {
      nextBell = 16 + Math.random() * 14;
      const g = nearGain(V(0, 32, -74), 76);
      if (g > 0.04) audio.playNear('crkvina-bell', V(0, 32, -74), 76, 0.22, { initGain: g });
    }
  }

  petals?.update(dt);
}

function wakeTrebinje() {
  petals?.show();
}

export default {
  id: 'trebinje',
  name: 'Trebinje',
  art,
  artAlt: 'Trebinje in golden autumn with Arslanagića Ottoman stone bridge and wooden dolap waterwheel on the emerald Trebišnjica River, golden plane trees, vineyards, olive groves and Hercegovačka Gračanica on Crkvina Hill painted in watercolour',
  WORDS,
  ORDER,
  CULTURE,
  ground: TOWN_Y,
  bounds: { boundsRadius: 158, ceiling: 92 },
  build,

  sideOf(f) {
    if (f.x < -16) return Math.PI / 2;
    if (f.x > 16) return -Math.PI / 2;
    return 0;
  },

  swimClamp(pos) {
    if (pos.x < -16.5) pos.x = -16.5;
    if (pos.x > 16.5) pos.x = 16.5;
    if (pos.z < -95) pos.z = -95;
    if (pos.z > 95) pos.z = 95;
  },

  waterDrift(pos, waterY, life) {
    return [0, -0.40 * life];
  },

  text: {
    firstHint: 'fly to the glowing orb beside the giant wooden waterwheel on the Trebišnjica',
    first: 'New orbs have appeared across Trebinje, its vineyards and Crkvina Hill. Find them in any order.',
    last: { id: 'manastir', msg: 'Only one orb is left. It is waiting at Hercegovačka Gračanica monastery atop Crkvina Hill.' },
    fleur: 'Something golden is shining above the dome of Hercegovačka Gračanica. Fly through it.',
    awake: 'Trebinje has awakened in Mediterranean autumn warmth. You can now explore it freely.',
  },

  update: updateTrebinje,
  onWake: wakeTrebinje,
  onAlive() {
    wakeTrebinje();
  },

  finale: {
    word: 'toplina',
    paints: ['riverbank', 'town', 'hills', 'props', 'passerby', 'smoke'],
    photo: { from: V(-22, 18, 48), to: V(6, 8, -10) },
    P: [
      [2.5, 0, 42, -62],
      [5.5, 20, 30, -40],
      [8.5, 32, 20, -14],
      [11.5, 18, 14, 10],
      [14.2, 0, 10, 12],
      [16.5, -16, 11, 10],
      [18.8, -22, 14, 22],
      [21.2, -10, 16, 36],
      [23.6, -16, 18, 44],
      [26.5, -22, 20, 50],
    ],
    shots: [
      { t0: 0, t1: 7.5, from: V(22, 44, -84), to: V(-14, 38, -78), lookFrom: V(0, 16, -24), lookTo: V(0, 8, 8) },
      { t0: 7.5, t1: 13.4, from: V(14, 18, 28), to: V(34, 16, 6), lookFrom: V(34, 8, -10), lookTo: V(26, 8, -18) },
      { t0: 13.4, t1: 22.8, from: V(18, 10, 26), to: V(-20, 11, 24), lookFrom: V(0, 5, 2), lookTo: V(-14, 4, 8) },
      { t0: 22.8, t1: 26, from: V(-22, 18, 48), to: V(-10, 22, 52), lookFrom: V(4, 8, -8), lookTo: V(4, 14, -34) },
    ],
    climax(ctx) {
      petals?.gust();
      ctx.audio.playClip('crkvina-bell', 0.28);
    },
  },

  ambience: {
    water(p) {
      const d = Math.max(0, Math.abs(p.x) - 17);
      return clamp(1 - d / 40, 0.08, 0.85) * clamp(1 - p.y / 65, 0.25, 1);
    },
    murmur: [
      [-32, 22, 22],    // Platani Square
      [34, 16, 20],     // Winery & vineyards
      [-34, -24, 18],   // Apiary & garden
    ],
  },
};
