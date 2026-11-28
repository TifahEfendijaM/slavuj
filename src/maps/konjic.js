// Konjic (summer): map module (see konjic-world.js for the town).
import { buildKonjicWorld, TOWN_Y } from './konjic-world.js';
import * as words from './konjic-words.js';
import { townModule } from './townmod.js';
import { createSummerSparkles } from '../summer-sparkles.js';
import { Vector3 } from 'three';
import art from '../../assets/journal-konjic.webp';

const V = (x, y, z) => new Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

export default townModule({
  id: 'konjic', name: 'Konjic', art,
  artAlt: 'Konjic in summer: the six-arched Old Bridge over the emerald Neretva, rafts on the river and Prenj behind, painted in watercolour',
  words, ground: TOWN_Y, bounds: { boundsRadius: 190, ceiling: 115 },
  build: buildKonjicWorld,
  particles: (scene) => createSummerSparkles(scene, { count: 200, xSpan: 30, zMin: -150, zMax: 150, waterY: 0.12 }),
  loops: [['neretva-rapids', [0, 1, 100], 50, 0.26], ['carving-tap', [-58, TOWN_Y + 1, -28], 16, 0.12], ['cicadas', [76, TOWN_Y + 2, -76], 40, 0.14]],
  calls: [['train-whistle', [36, TOWN_Y + 3, -30], 70, 0.2, 18, 32]],
  sideOf(f) {
    if (f.x < -16) return Math.PI / 2;
    if (f.x > 16) return -Math.PI / 2;
    return 0;
  },
  swimClamp(pos) {
    if (pos.z < -175) pos.z = -175;
    if (pos.z > 175) pos.z = 175;
    if (pos.x < -15.6) pos.x = -15.6;
    if (pos.x > 15.6) pos.x = 15.6;
  },
  waterDrift: (pos, waterY, life) => [0, (pos.z > 88 && pos.z < 112 ? 0.9 : 0.45) * life],
  text: {
    firstHint: 'fly to the glowing orb on the Old Bridge over the Neretva',
    first: 'New orbs have appeared all over Konjic, from the river to the mountain. Find them in any order.',
    last: { id: 'bunker', msg: 'Only one orb is left. It is waiting at an ordinary-looking house at the foot of the hill to the north-west.' },
    fleur: 'Something golden is shining over the bunker hill. Fly through it.',
    awake: 'Konjic has woken up in the summer sun. You can now explore it freely.',
  },
  finale: {
    word: 'pustolovina',
    paints: ['riverbank', 'town', 'hills', 'props', 'passerby', 'smoke', 'fes', 'coffee', 'zvizdaljka', 'fish'],
    photo: { from: V(-30, 14, 36), to: V(6, 5, -2) },
    P: [[2.5, -56, 44, -84], [5.5, -40, 34, -50], [8.5, -20, 22, -20], [11.5, -6, 12, -6], [14.2, 4, 9, 8], [16.5, 6, 8, 30], [18.8, 0, 9, 52], [21.2, -6, 10, 72], [23.6, -4, 12, 92], [26.5, 0, 16, 112]],
    shots: [
      { t0: 0, t1: 7, from: V(-30, 40, -40), to: V(-24, 34, -20), lookFrom: V(-60, 14, -70), lookTo: V(0, 6, 0) },
      { t0: 7, t1: 13.4, from: V(-26, 12, 22), to: V(26, 12, 22), lookFrom: V(0, 4, 0), lookTo: V(0, 4, 0) },
      { t0: 13.4, t1: 22, from: V(-12, 6, 30), to: V(12, 6, 66), lookFrom: V(20, 2, 58), lookTo: V(-20, 2, 64) },
      { t0: 22, t1: 26, from: V(10, 20, 130), to: V(14, 26, 140), lookFrom: V(0, 4, 60), lookTo: V(-60, 30, 80) },
    ],
    cry: 'train-whistle',
  },
  ambience: {
    water(p) { const d = Math.max(0, Math.abs(p.x) - 16); return clamp(clamp(1 - d / 40, 0.08, 0.95) * clamp(1 - p.y / 60, 0.2, 1), 0.06, 1); },
    murmur: [[-40, TOWN_Y, 14], [40, TOWN_Y, -18], [-24, TOWN_Y, 60]],
  },
});
