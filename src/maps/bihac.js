// Bihać (spring): map module, finale, gliding Una lađa boat, dragonflies, falcon, kingfisher, sparkling river mist, and local sounds.
import { Vector3 } from 'three';
import { buildBihacWorld, bihacGroundY, TOWN_Y } from './bihac-world.js';
import { WORDS, ORDER, CULTURE } from './bihac-words.js';
import { createUnaSpray } from '../una-spray.js';
import art from '../../assets/journal-bihac.webp';

const V = (x, y, z) => new Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

let spray = null;
let nextKingfisher = 5;
let nextFalcon = 10;

function build(scene) {
  const world = buildBihacWorld(scene);
  spray = createUnaSpray(scene, {
    emitters: world.sprayEmitters,
    groundY: bihacGroundY,
    count: 220,
  });
  nextKingfisher = 5;
  nextFalcon = 10;
  return world;
}

function updateBihac(dt, time, life, ctx) {
  const { world, audio, running, nearGain } = ctx;
  const alive = life > 0.5;
  world.movers.length = 0;

  // Traditional wooden Una lađa rocking gently on the emerald river once awake
  if (alive && world.ladja) {
    const b = world.ladja;
    b.g.position.y = b.home.y + Math.sin(time * 1.8) * 0.05;
    b.g.rotation.z = Math.sin(time * 1.3) * 0.04;
    b.g.rotation.x = Math.cos(time * 1.1) * 0.025;
  }

  // Inflatable regatta raft gently bobbing
  if (alive && world.regata) {
    const r = world.regata;
    r.g.position.y = r.home.y + Math.sin(time * 2.1 + 1.2) * 0.05;
    r.g.rotation.z = Math.cos(time * 1.5) * 0.035;
  }

  // Iridescent dragonflies darting over the Una reeds once awake
  if (alive && world.dragonflies) {
    for (const df of world.dragonflies) {
      const a = time * df.speed + df.phase;
      df.g.position.set(
        df.home.x + Math.cos(a) * df.r,
        df.home.y + Math.sin(time * 3.8 + df.phase) * 0.25,
        df.home.z + Math.sin(a * 1.4) * df.r * 0.8,
      );
      df.g.rotation.y = -a;
    }
  }

  // Kingfisher bobbing and dipping near the water
  if (alive && world.kingfisher) {
    const kf = world.kingfisher;
    kf.g.position.y = kf.home.y + Math.sin(time * 2.4) * 0.06;
    kf.g.rotation.y = kf.ry + Math.sin(time * 1.1) * 0.35;
  }

  // Falcon circling softly or turning on the Sokolac battlement
  if (alive && world.falcon) {
    const f = world.falcon;
    f.g.rotation.y = f.ry + Math.sin(time * 0.8) * 0.45;
  }

  // Local Bihać ambient recordings once alive & running
  if (alive && running) {
    // Roaring emerald Una cascades (buk)
    audio.setLoop('una-rapids', nearGain(V(0, 1.5, -12), 54), { vol: 0.28 });
    // Krajina folk accordion melody in the Una riverside park
    audio.setLoop('krajina-accordion', nearGain(V(34, TOWN_Y + 1, 26), 28), { vol: 0.22 });
    // Warm hearth crackle in the Japodes stilt village
    audio.setLoop('village-hearth', nearGain(V(-28, TOWN_Y + 1, 6), 24), { vol: 0.22 });

    // Bright kingfisher / river bird whistle over the Una
    nextKingfisher -= dt;
    if (nextKingfisher <= 0) {
      nextKingfisher = 7 + Math.random() * 8;
      const g = nearGain(V(-14, 4, -36), 38);
      if (g > 0.04) audio.playNear('kingfisher-call', V(-14, 4, -36), 38, 0.25, { initGain: g });
    }

    // Distant falcon cry high over Sokolac tower
    nextFalcon -= dt;
    if (nextFalcon <= 0) {
      nextFalcon = 14 + Math.random() * 12;
      const g = nearGain(V(0, 38, -76), 58);
      if (g > 0.04) audio.playNear('falcon-cry', V(0, 38, -76), 58, 0.22, { initGain: g });
    }
  }

  spray?.update(dt);
}

function wakeBihac() {
  spray?.show();
}

export default {
  id: 'bihac',
  name: 'Bihać',
  art,
  artAlt: 'Bihać in spring with the emerald Una River, wooden Una lađa, prehistoric stilt houses, Kapetanova kula, Fethija Mosque and Sokolac watchtower, painted in watercolour',
  WORDS,
  ORDER,
  CULTURE,
  ground: TOWN_Y,
  bounds: { boundsRadius: 155, ceiling: 92 },
  build,

  // Look from the river side by default
  sideOf(f) {
    if (f.x < -14) return Math.PI / 2;
    if (f.x > 14) return -Math.PI / 2;
    return 0;
  },

  // Keep swimming bird inside the Una River channel (x = -13.5..13.5)
  swimClamp(pos) {
    if (pos.x < -13.5) pos.x = -13.5;
    if (pos.x > 13.5) pos.x = 13.5;
    if (pos.z < -105) pos.z = -105;
    if (pos.z > 105) pos.z = 105;
  },

  // Una flows smoothly north (-z)
  waterDrift(pos, waterY, life) {
    return [0, -0.46 * life];
  },

  text: {
    firstHint: 'fly to the glowing orb above the emerald Una River',
    first: 'New orbs have appeared all over Bihać. Find them in any order.',
    last: { id: 'osmatracnica', msg: 'Only one orb is left. It is waiting at Stari Grad Sokolac watchtower on the hill.' },
    fleur: 'Something golden is shining high above Sokolac watchtower. Fly through it.',
    awake: 'Bihać has awakened in spring. You can now explore it freely.',
  },

  update: updateBihac,
  onWake: wakeBihac,
  onAlive() {
    wakeBihac();
  },

  finale: {
    word: 'priroda',
    paints: ['riverbank', 'town', 'hills', 'props', 'passerby', 'smoke'],
    // Finale photo: emerald Una panorama looking north past the river island, stilt houses, Kapetanova kula, Fethija and Sokolac
    photo: { from: V(-18, 22, 54), to: V(6, 12, -26) },
    // 26 s flight: from golden fleur above Sokolac -> swoop down over Kapetanova kula & Fethija -> glide over emerald Una island & stilt houses -> out over the valley
    P: [
      [2.5, 0, 42, -68],
      [5.5, 16, 32, -44],
      [8.5, 28, 22, -16],
      [11.5, 16, 16, 4],
      [14.2, 0, 11, 8],
      [16.5, -14, 12, 4],
      [18.8, -16, 14, 18],
      [21.2, -4, 14, 34],
      [23.6, -12, 18, 46],
      [26.5, -18, 22, 56],
    ],
    shots: [
      // 0 to 7.5 s: from above Sokolac watchtower looking south across the entire emerald Una valley
      { t0: 0, t1: 7.5, from: V(18, 46, -92), to: V(-14, 42, -88), lookFrom: V(0, 20, -40), lookTo: V(0, 10, 12) },
      // 7.5 to 13.4 s: sweeping over Kapetanova kula, Gothic Fethija Mosque and the riverside park
      { t0: 7.5, t1: 13.4, from: V(6, 20, 26), to: V(24, 18, 12), lookFrom: V(34, 10, -8), lookTo: V(44, 10, -14) },
      // 13.4 to 22.8 s: emerald Una island, wooden lađa & Japodes stilt village; at 15 s mist sparkles burst over the cascade!
      { t0: 13.4, t1: 22.8, from: V(16, 10, 28), to: V(-16, 11, 26), lookFrom: V(0, 4, 4), lookTo: V(-14, 5, -6) },
      // 22.8 to 26 s: sunlit spring panorama of Bihać, emerald Una, Kapetanova kula and Sokolac hill
      { t0: 22.8, t1: 26, from: V(-18, 22, 54), to: V(-6, 26, 58), lookFrom: V(4, 10, -10), lookTo: V(4, 14, -36) },
    ],
    climax(ctx) {
      spray?.gust(V(0, 5, -6));
      ctx.audio.playClip('falcon-cry', 0.28);
    },
  },

  ambience: {
    water(p) {
      const dUna = Math.max(0, Math.abs(p.x) - 14);
      const base = clamp(1 - dUna / 38, 0.08, 0.85);
      const dBuk = Math.min(Math.hypot(p.x, p.z + 12), Math.hypot(p.x, p.z - 26));
      const boost = clamp(1 - dBuk / 24, 0, 1) * 0.25;
      return clamp((base + boost) * clamp(1 - p.y / 65, 0.25, 1), 0.06, 1);
    },
    murmur: [
      [34, 24, 22],     // Riverside park & music
      [30, -4, 18],     // Old town & Kapetanova kula
      [-28, 6, 18],     // Japodes stilt village
    ],
  },
};
