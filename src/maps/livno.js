// Livno (winter): map module, wild horses of the Krug plateau, turquoise Duman karst spring,
// Livanjski sir artisan dairy, Old Town Kula Veis fortress, Mount Cincar, finale, and local sounds.
import { Vector3 } from 'three';
import { buildLivnoWorld, TOWN_Y } from './livno-world.js';
import { WORDS, ORDER, CULTURE } from './livno-words.js';
import { createLivnoSnow } from '../livno-snow.js';
import art from '../../assets/journal-livno.webp';

const V = (x, y, z) => new Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

let snow = null;
let nextGallop = 10;
let nextVulture = 14;

function build(scene) {
  const world = buildLivnoWorld(scene);
  snow = createLivnoSnow(scene, { count: 240, bounds: 92 });
  nextGallop = 10;
  nextVulture = 14;
  return world;
}

function updateLivno(dt, time, life, ctx) {
  const { world, audio, running, nearGain } = ctx;
  const alive = life > 0.5;
  world.movers.length = 0;

  // Wind turbine rotor ('elisa') spinning smoothly in the Dinaric bura once awake
  if (alive && world.elisaWheel) {
    world.elisaWheel.rotation.z -= dt * 1.15;
  }

  // Wild horses ('krdo') gently trotting & tossing heads across the snowy Krug plateau once awake
  if (alive && world.wildHorses) {
    for (const h of world.wildHorses) {
      const t = time * h.speed + h.phase;
      const dx = Math.sin(t) * h.span;
      const dz = Math.cos(t * 0.7) * h.span * 0.45;
      h.g.position.set(h.home.x + dx, h.home.y + Math.abs(Math.sin(t * 4.5)) * 0.14, h.home.z + dz);
      h.g.rotation.y = Math.atan2(Math.cos(t) * h.span, -Math.sin(t * 0.7) * h.span * 0.315);
      h.g.rotation.x = Math.sin(t * 4.5) * 0.05;
    }
  }

  // Griffon vulture ('sup') spreading wings gently on its limestone perch
  if (alive && world.vulture) {
    const s = Math.sin(time * 1.2);
    world.vulture.rotation.z = s * 0.06;
    world.vulture.position.y = world.vultureHomeY + Math.max(0, s) * 0.12;
  }

  // Local Livno winter soundscapes once alive & running
  if (alive && running) {
    // Rushing turquoise Duman karst spring cascading into Bistrica
    audio.setLoop('duman-spring', nearGain(V(0, 3.5, -15), 48), { vol: 0.28 });
    // Crisp high-altitude Dinaric bura wind across Krug plateau & wind ridge
    audio.setLoop('bura-wind', nearGain(V(-34, 8, -28), 64), { vol: 0.20 });
    // Crackling Bosnian winter hearth fire on the east courtyard
    audio.setLoop('dairy-hearth', nearGain(V(26, TOWN_Y + 2, 16), 34), { vol: 0.22 });

    // Distant wild horse gallop hooves on the frozen Krug plateau
    nextGallop -= dt;
    if (nextGallop <= 0) {
      nextGallop = 12 + Math.random() * 10;
      const g = nearGain(V(-28, TOWN_Y + 1, 18), 48);
      if (g > 0.04) audio.playNear('horse-gallop', V(-28, TOWN_Y + 1, 18), 48, 0.24, { initGain: g });
    }

    // High Dinaric griffon vulture / mountain raptor cry above Duman cliffs
    nextVulture -= dt;
    if (nextVulture <= 0) {
      nextVulture = 16 + Math.random() * 12;
      const g = nearGain(V(-16, 18, -30), 68);
      if (g > 0.04) audio.playNear('mountain-vulture', V(-16, 18, -30), 68, 0.22, { initGain: g });
    }
  }

  snow?.update(dt);
}

function wakeLivno() {
  snow?.show();
}

export default {
  id: 'livno',
  name: 'Livno',
  art,
  artAlt: 'Livno in sunlit winter with wild horses galloping on the snow-dusted Krug plateau, turquoise Duman karst spring below the limestone cliff, Old Town Kula Veis stone fortress, and snow-clad Mount Cincar painted in watercolour',
  WORDS,
  ORDER,
  CULTURE,
  ground: TOWN_Y,
  bounds: { boundsRadius: 162, ceiling: 94 },
  build,

  sideOf(f) {
    if (f.x < -14) return Math.PI / 2;
    if (f.x > 14) return -Math.PI / 2;
    return 0;
  },

  swimClamp(pos) {
    if (pos.x < -12.5) pos.x = -12.5;
    if (pos.x > 12.5) pos.x = 12.5;
    if (pos.z < -13.5) pos.z = -13.5;
    if (pos.z > 95) pos.z = 95;
  },

  waterDrift(pos, waterY, life) {
    return [0, 0.45 * life];
  },

  text: {
    firstHint: 'fly to the glowing orb beside the wild horse herd on the snowy Krug plateau',
    first: 'New orbs have appeared across the plateau, Duman spring, dairy yard and Old Town fortress. Find them in any order.',
    last: { id: 'utvrda', msg: 'Only one orb is left. It is waiting at Old Town Livno\'s stone fortress high on the northern crag.' },
    fleur: 'Something golden is shining above the fortress watchtower. Fly through it.',
    awake: 'Livno has awakened under crisp winter sun. You can now explore it freely.',
  },

  update: updateLivno,
  onWake: wakeLivno,
  onAlive() {
    wakeLivno();
  },

  finale: {
    word: 'sloboda',
    paints: ['riverbank', 'town', 'hills', 'props', 'passerby', 'smoke'],
    photo: { from: V(-30, 22, 52), to: V(2, 10, -24) },
    P: [
      [2.5, 24, 38, -44],
      [5.5, 10, 28, -28],
      [8.5, -14, 22, -16],
      [11.5, -28, 16, 4],
      [14.2, -24, 12, 22],
      [16.5, -8, 11, 20],
      [18.8, 16, 12, 16],
      [21.2, 24, 16, 30],
      [23.6, 6, 18, 44],
      [26.5, -22, 20, 50],
    ],
    shots: [
      { t0: 0, t1: 7.5, from: V(44, 38, -68), to: V(4, 34, -64), lookFrom: V(24, 20, -48), lookTo: V(0, 8, -16) },
      { t0: 7.5, t1: 14.0, from: V(-12, 16, 32), to: V(-38, 14, 26), lookFrom: V(-28, 6, 14), lookTo: V(-38, 6, -4) },
      { t0: 14.0, t1: 22.0, from: V(10, 12, 28), to: V(36, 14, 24), lookFrom: V(24, 6, 12), lookTo: V(0, 6, -15) },
      { t0: 22.0, t1: 26, from: V(-26, 20, 48), to: V(-12, 22, 52), lookFrom: V(4, 10, -16), lookTo: V(4, 16, -44) },
    ],
    climax(ctx) {
      snow?.gust();
      ctx.audio.playClip('horse-gallop', 0.30);
    },
  },

  ambience: {
    water(p) {
      const d = Math.max(0, Math.hypot(p.x, p.z + 15) - 14);
      return clamp(1 - d / 44, 0.08, 0.88) * clamp(1 - p.y / 65, 0.25, 1);
    },
    murmur: [
      [-38, -6, 22],    // Artisan dairy & cheese yard
      [26, 12, 20],     // Old Town winter hearth
      [-28, 16, 20],    // Krug plateau horses
    ],
  },
};
