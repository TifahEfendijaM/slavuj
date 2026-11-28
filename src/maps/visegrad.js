// Višegrad (autumn): map module, 11-arched Mehmed Paša Sokolović Bridge, emerald Drina River, finale, animated river boats, fish, hawk, Ćiro steam puffs, golden autumn leaves, and local sounds.
import { Vector3 } from 'three';
import { buildVisegradWorld, TOWN_Y } from './visegrad-world.js';
import { WORDS, ORDER, CULTURE } from './visegrad-words.js';
import { createDrinaLeaves } from '../drina-leaves.js';
import art from '../../assets/journal-visegrad.webp';

const V = (x, y, z) => new Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

let leaves = null;
let nextWhistle = 9;
let nextHawk = 12;

function build(scene) {
  const world = buildVisegradWorld(scene);
  leaves = createDrinaLeaves(scene, { count: 240, bounds: 86 });
  nextWhistle = 9;
  nextHawk = 12;
  return world;
}

function updateVisegrad(dt, time, life, ctx) {
  const { world, audio, running, nearGain } = ctx;
  const alive = life > 0.5;
  world.movers.length = 0;

  // Drina wooden river boat gently rocking beneath the 11 stone arches
  if (alive && world.boat) {
    const b = world.boat;
    b.g.position.y = b.home.y + Math.sin(time * 1.7) * 0.05;
    b.g.rotation.z = Math.sin(time * 1.2) * 0.035;
  }

  // Traditional Drina timber raft bobbing softly downstream
  if (alive && world.raft) {
    const r = world.raft;
    r.g.position.y = r.home.y + Math.sin(time * 1.5 + 1.1) * 0.04;
    r.g.rotation.z = Math.cos(time * 1.1) * 0.03;
  }

  // Legendary Drina huchen (mladica) and catfish (som) cruising smoothly in the turquoise water
  if (alive && world.drinaFish) {
    for (const f of world.drinaFish) {
      const a = time * f.speed + f.phase;
      f.g.position.set(f.home.x + Math.cos(a) * f.rx, f.home.y, f.home.z + Math.sin(a) * f.rz);
      f.g.rotation.y = -a;
    }
  }

  // Perched canyon birds (goshawk, raven, magpie) gently turning their heads once awake
  if (alive && world.birds) {
    for (const bd of world.birds) {
      bd.g.rotation.y = bd.ry + Math.sin(time * 0.9 + bd.phase) * 0.42;
    }
  }

  // Local Višegrad ambient recordings once alive & running
  if (alive && running) {
    // Broad steady emerald Drina river flow beneath the 11 arches
    audio.setLoop('drina-flow', nearGain(V(0, 1.5, 0), 75), { vol: 0.28 });
    // Blacksmith hammer clink at the east riverbank forge
    audio.setLoop('smithy-anvil', nearGain(V(42, TOWN_Y + 1, 20), 28), { vol: 0.18 });
    // Gentle rhythmic Ćiro steam locomotive chug along the eastern canyon railway
    audio.setLoop('ciro-steam', nearGain(V(52, TOWN_Y + 2, -26), 36), { vol: 0.22 });

    // Nostalgic Ćiro narrow-gauge steam whistle echoing in the Drina gorge
    nextWhistle -= dt;
    if (nextWhistle <= 0) {
      nextWhistle = 15 + Math.random() * 14;
      const g = nearGain(V(52, TOWN_Y + 3, -26), 68);
      if (g > 0.04) audio.playNear('ciro-whistle', V(52, TOWN_Y + 3, -26), 68, 0.22, { initGain: g });
    }

    // Autumn canyon goshawk cry high above Bikavac and the Drina cliffs
    nextHawk -= dt;
    if (nextHawk <= 0) {
      nextHawk = 13 + Math.random() * 12;
      const g = nearGain(V(0, 32, -68), 64);
      if (g > 0.04) audio.playNear('canyon-hawk', V(0, 32, -68), 64, 0.22, { initGain: g });
    }
  }

  leaves?.update(dt);
}

function wakeVisegrad() {
  leaves?.show();
}

export default {
  id: 'visegrad',
  name: 'Višegrad',
  art,
  artAlt: 'Višegrad in golden autumn with the 11-arched Mehmed Paša Sokolović Bridge spanning the emerald Drina River, a wooden river boat, Bosnian stone houses, the Ćiro steam locomotive and autumn gorge hills painted in watercolour',
  WORDS,
  ORDER,
  CULTURE,
  ground: TOWN_Y,
  bounds: { boundsRadius: 160, ceiling: 92 },
  build,

  // Face from the river side by default
  sideOf(f) {
    if (f.x < -28) return Math.PI / 2;
    if (f.x > 28) return -Math.PI / 2;
    return 0;
  },

  // Keep swimming bird inside the broad emerald Drina channel (x = -27..27)
  swimClamp(pos) {
    if (pos.x < -26.5) pos.x = -26.5;
    if (pos.x > 26.5) pos.x = 26.5;
    if (pos.z < -95) pos.z = -95;
    if (pos.z > 95) pos.z = 95;
  },

  // Drina flows north (-z) smoothly beneath the 11 arches
  waterDrift(pos, waterY, life) {
    return [0, -0.44 * life];
  },

  text: {
    firstHint: 'fly to the glowing orb beside the eleven arches of Mehmed Paša Sokolović Bridge',
    first: 'New orbs have appeared all over Višegrad and the Drina gorge. Find them in any order.',
    last: { id: 'rusevina', msg: 'Only one orb is left. It is waiting at the ancient stone ruins atop Bikavac Hill.' },
    fleur: 'Something golden is shining above the Bikavac fortress ruins. Fly through it.',
    awake: 'Višegrad has awakened in golden autumn. You can now explore it freely.',
  },

  update: updateVisegrad,
  onWake: wakeVisegrad,
  onAlive() {
    wakeVisegrad();
  },

  finale: {
    word: 'bastina',
    paints: ['riverbank', 'town', 'hills', 'props', 'passerby', 'smoke'],
    // Finale photo: sweeping golden-autumn vista of the entire 11-arched Mehmed Paša Sokolović Bridge over the emerald Drina with kapija sofa, Ćiro train & Bikavac ruins behind
    photo: { from: V(-26, 20, 52), to: V(6, 7, -4) },
    // 26 s flight: from golden fleur above Bikavac ruins -> swoop along the eastern canyon & Ćiro railway -> glide right across all 11 arches & kapija sofa of the bridge -> out over the golden Drina valley
    P: [
      [2.5, 22, 42, -56],
      [5.5, 34, 30, -34],
      [8.5, 42, 20, -14],
      [11.5, 32, 14, 12],
      [14.2, 10, 12, 14],
      [16.5, -14, 12, 10],
      [18.8, -28, 14, 20],
      [21.2, -16, 16, 36],
      [23.6, -22, 18, 46],
      [26.5, -26, 20, 54],
    ],
    shots: [
      // 0 to 7.5 s: from above Bikavac ruins looking south across the Drina gorge and all 11 bridge arches
      { t0: 0, t1: 7.5, from: V(32, 44, -84), to: V(8, 38, -76), lookFrom: V(0, 14, -20), lookTo: V(0, 8, 8) },
      // 7.5 to 13.4 s: sweeping over the Ćiro steam railway, old smithy and east bank towards the bridge
      { t0: 7.5, t1: 13.4, from: V(24, 18, 30), to: V(42, 16, 6), lookFrom: V(42, 8, -12), lookTo: V(12, 8, 0) },
      // 13.4 to 22.8 s: gliding right past all 11 arches & central kapija sofa of Mehmed Paša Sokolović Bridge; golden autumn leaves swirl at 15 s!
      { t0: 13.4, t1: 22.8, from: V(26, 12, 28), to: V(-26, 12, 26), lookFrom: V(0, 6, 0), lookTo: V(-6, 6, -4) },
      // 22.8 to 26 s: grand golden-autumn panorama of Višegrad, the 11-arched bridge, emerald Drina and Bikavac ruins
      { t0: 22.8, t1: 26, from: V(-26, 20, 52), to: V(-12, 24, 56), lookFrom: V(6, 7, -4), lookTo: V(4, 12, -26) },
    ],
    climax(ctx) {
      leaves?.gust();
      ctx.audio.playClip('ciro-whistle', 0.25);
    },
  },

  ambience: {
    water(p) {
      const dDrina = Math.max(0, Math.abs(p.x) - 27);
      const base = clamp(1 - dDrina / 44, 0.08, 0.90);
      return clamp(base * clamp(1 - p.y / 65, 0.25, 1), 0.06, 1);
    },
    murmur: [
      [0, 0, 26],       // Central kapija sofa on the bridge
      [-40, 18, 22],    // Andrićgrad square
      [42, 18, 20],     // East riverbank crafts & station
    ],
  },
};
