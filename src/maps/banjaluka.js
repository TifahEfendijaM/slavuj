// Banja Luka (spring / City of Greenery on the Vrbas): map module, 26 s golden finale, moving dajak boats, blossoms, and Vrbas sounds.
import { Vector3 } from 'three';
import { buildBanjaLukaWorld, CITY_Y, vrbasCenterZ } from './banjaluka-world.js';
import { WORDS, ORDER, CULTURE } from './banjaluka-words.js';
import { createBlBlossoms } from '../bl-blossoms.js';
import art from '../../assets/journal-banjaluka.webp';

const V = (x, y, z) => new Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

let blossoms = null;
let nextBird = 5;

function build(scene) {
  const world = buildBanjaLukaWorld(scene);
  blossoms = createBlBlossoms(scene, { count: 240, radius: 112, maxY: 42, minY: 1.5 });
  nextBird = 5;
  return world;
}

function wakeCity(ctx) {
  const { world } = ctx;
  for (const dj of world.dajaks || []) {
    if (!dj.active) {
      dj.active = true;
      const idx = world.colliders.indexOf(dj.collider);
      if (idx >= 0) world.colliders.splice(idx, 1);
    }
  }
  blossoms?.show();
}

function updateCity(dt, time, life, ctx) {
  const { world, audio, running, nearGain } = ctx;
  const alive = life > 0.5;
  world.movers.length = 0;

  // Traditional Banja Luka dajak boats gliding smoothly upstream & downstream along the emerald Vrbas once awake
  if (alive) {
    for (let i = 0; i < (world.dajaks || []).length; i++) {
      const dj = world.dajaks[i];
      if (!dj.active) continue;
      const u = Math.sin(time * 0.16 + dj.phaseOffset);
      const dirX = Math.cos(time * 0.16 + dj.phaseOffset) >= 0 ? 1 : -1;
      const nx = dj.home.x + u * 20;
      const nz = vrbasCenterZ(nx) + (i === 0 ? -1.8 : 2.4);
      const ny = 0.12 + Math.sin(time * 2.2 + i) * 0.05;
      const ry = dirX > 0 ? Math.PI / 2 : -Math.PI / 2;
      dj.g.position.set(nx, ny, nz);
      dj.g.rotation.y = ry;
      world.movers.push({ x: nx, y: 0.8, z: nz, fx: dirX, fz: 0, r: 1.8, h: 2.2, v: 2.0 });
      // Keep standing dajak boatman ('dajakas') riding at the stern of dajak[0]
      if (i === 0) {
        const boatman = ctx.people?.list?.find((p) => p.o.kind === 'blDajak');
        if (boatman) {
          const bx = nx - dirX * 1.9;
          boatman.root.position.set(bx, ny + 0.30, nz);
          boatman.root.rotation.y = ry;
          if (boatman.block) boatman.block.matrixWorld.setPosition(bx, ny + 1.2, nz);
        }
      }
    }
  }

  // Local Banja Luka ambient sounds once awake & running
  if (alive && running) {
    const rDist = Math.abs(ctx.flight.pos.z - vrbasCenterZ(ctx.flight.pos.x));
    const rivGain = clamp(1 - rDist / 48, 0.12, 0.78);
    audio.setLoop('vrbas-river', rivGain, { vol: 0.24 });
    audio.setLoop('kastel-concert', nearGain(V(-36, CITY_Y + 2, -6), 38), { vol: 0.20 });
    audio.setLoop('park-fountain', nearGain(V(14, CITY_Y + 1, -14), 24), { vol: 0.22 });
    nextBird -= dt;
    if (nextBird <= 0) {
      nextBird = 8 + Math.random() * 9;
      const bp = V(54, CITY_Y + 6, -24);
      const g = nearGain(bp, 68);
      if (g > 0.05) audio.playNear('avenue-birds', bp, 68, 0.24, { initGain: g });
    }
  }

  blossoms?.update(dt, alive ? 0.35 : 0);
}

export default {
  id: 'banjaluka',
  name: 'Banja Luka',
  art,
  artAlt: 'Banja Luka on the emerald Vrbas river in spring, painted in watercolour',
  WORDS,
  ORDER,
  CULTURE,
  ground: CITY_Y,
  bounds: { boundsRadius: 145, ceiling: 88 },
  build,

  sideOf(f) {
    return f.z > 20 ? Math.PI : 0;
  },

  text: {
    firstHint: 'fly out from Kastel over the emerald Vrbas to the glowing orb above the dajak boat',
    first: 'New orbs have appeared all over Banja Luka. Find them in any order.',
    last: { id: 'spomenik', msg: 'Only one orb is left. It is waiting at the white monument atop Banj brdo.' },
    fleur: 'Something golden is shining high above Banj brdo monument. Fly through it.',
    awake: 'Banja Luka has awakened. You can now explore the City of Greenery freely.',
  },

  update: updateCity,
  onWake: wakeCity,
  onAlive(ctx) {
    wakeCity(ctx);
  },

  finale: {
    word: 'grad',
    paints: ['terrain', 'river', 'props', 'passerby'],
    // Finale photo: sweeping golden panorama from Banj brdo over Vrbas, Kastel, Ferhadija, Banski dvor & green avenues
    photo: { from: V(-26, 28, 66), to: V(12, 6, -18) },
    // 26 s flight: from Banj brdo monument -> across emerald Vrbas & dajak boats -> over Kastel concert -> across Banski dvor, Gospodska & green avenues
    P: [
      [2.5, 0, 38, 84],
      [6.0, -14, 24, 56],
      [9.5, -24, 14, 24],
      [13.0, -30, 12, -2],
      [16.0, -6, 14, -18],
      [19.0, 26, 15, -22],
      [22.5, 52, 16, -24],
      [26.0, 18, 22, 8],
    ],
    shots: [
      // 0 to 7.5 s: Banj brdo monument framing the emerald Vrbas valley & green city
      { t0: 0, t1: 7.5, from: V(26, 40, 100), to: V(24, 34, 72), lookFrom: V(0, 30, 92), lookTo: V(-14, 6, 10) },
      // 7.5 to 14 s: gliding over the Vrbas, moving dajak boats, arched green bridge & Kastel fortress concert
      { t0: 7.5, t1: 14, from: V(20, 14, 42), to: V(-22, 15, 30), lookFrom: V(-6, 3, 24), lookTo: V(-34, 6, -4) },
      // 14 to 21 s: climax sweep over Ferhadija, Banski dvor, Gospodska ulica & blossoming green avenues
      { t0: 14, t1: 21, from: V(-14, 16, 4), to: V(36, 18, 2), lookFrom: V(10, 8, -24), lookTo: V(52, 7, -26) },
      // 21 to 26 s: pulling wide over Park Petar Kočić, the 7 chestnut trees & the emerald Vrbas
      { t0: 21, t1: 26, from: V(64, 22, 14), to: V(28, 30, 56), lookFrom: V(42, 7, -26), lookTo: V(-8, 6, -12) },
    ],
    climax(ctx) {
      blossoms?.show();
      ctx.audio.playClip('avenue-birds', 0.26);
    },
  },

  ambience: {
    water(p) {
      return clamp(1 - Math.abs(p.z - vrbasCenterZ(p.x)) / 36, 0, 1) * 0.45;
    },
    murmur: [
      [-36, 2, 22],    // Kastel concert courtyard
      [-14, -30, 22],  // Gospodska cafes
      [14, -14, 20],   // Trg Krajine
    ],
  },
};
