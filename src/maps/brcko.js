// Brčko (autumn): map module (see brcko-world.js for the town).
import { buildBrckoWorld, TOWN_Y } from './brcko-world.js';
import * as words from './brcko-words.js';
import { townModule } from './townmod.js';
import { createAutumnLeaves } from '../autumn-leaves.js';
import { Vector3 } from 'three';
import art from '../../assets/journal-brcko.webp';

const V = (x, y, z) => new Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

export default townModule({
  id: 'brcko', name: 'Brčko', art,
  artAlt: 'Brčko in autumn: the striped City Hall on its square, the Sava with its bridge and port, golden poplars, painted in watercolour',
  words, ground: TOWN_Y, bounds: { boundsRadius: 200, ceiling: 100 },
  build: buildBrckoWorld,
  particles: (scene, world) => createAutumnLeaves(scene, { emitters: world.leafEmitters, groundY: () => TOWN_Y, count: 220 }),
  loops: [['sava-river', [0, 1, -64], 60, 0.2], ['chestnut-crackle', [-2, TOWN_Y + 1, 41], 14, 0.14]],
  calls: [['church-bell', [-56, TOWN_Y + 11, 16], 90, 0.18, 26, 44], ['geese', [-34, 1, -72], 40, 0.16, 9, 18], ['rooster', [104, TOWN_Y + 2, 22], 50, 0.14, 16, 30]],
  sideOf(f) {
    if (f.z < -84) return 0;
    if (f.z < 60) return Math.PI;
    return 0;
  },
  swimClamp(pos) {
    if (pos.x < -215) pos.x = -215;
    if (pos.x > 215) pos.x = 215;
    if (pos.z < -83.6) pos.z = -83.6;
    if (pos.z > -44.4) pos.z = -44.4;
  },
  waterDrift: (pos, waterY, life) => [0.32 * life, 0],
  text: {
    firstHint: 'fly to the glowing orb on the bridge over the Sava',
    first: 'New orbs have appeared all over Brčko, from the river to the fields. Find them in any order.',
    last: { id: 'vijecnica', msg: 'Only one orb is left. It is waiting in front of the striped City Hall on the square.' },
    fleur: 'Something golden is shining above the City Hall. Fly through it.',
    awake: 'Brčko has woken up in the autumn sun. You can now explore it freely.',
  },
  finale: {
    word: 'zetva',
    paints: ['riverbank', 'town', 'hills', 'props', 'passerby', 'smoke', 'fes', 'coffee', 'fisher', 'fish', 'bike'],
    photo: { from: V(-40, 16, -6), to: V(-24, 7, 36) },
    P: [[2.5, -30, 34, 24], [5.5, -40, 26, 4], [8.5, -56, 20, -20], [11.5, -66, 18, -48], [14.2, -50, 14, -64], [16.5, -20, 10, -62], [18.8, 10, 10, -58], [21.2, 40, 14, -50], [23.6, 70, 18, -20], [26.5, 96, 22, 20]],
    shots: [
      { t0: 0, t1: 7, from: V(-40, 22, -6), to: V(-10, 24, -10), lookFrom: V(-24, 8, 36), lookTo: V(-24, 6, 30) },
      { t0: 7, t1: 13.4, from: V(-40, 20, -20), to: V(-44, 22, -40), lookFrom: V(-70, 10, -60), lookTo: V(-70, 10, -70) },
      { t0: 13.4, t1: 22, from: V(-20, 12, -30), to: V(30, 14, -26), lookFrom: V(0, 1, -64), lookTo: V(56, 8, -46) },
      { t0: 22, t1: 26, from: V(70, 22, -10), to: V(80, 26, 0), lookFrom: V(110, 3, 60), lookTo: V(120, 3, 90) },
    ],
    cry: 'church-bell',
  },
  ambience: {
    water(p) { const d = p.z < -84 ? -84 - p.z : p.z > -44 ? p.z + 44 : 0; return clamp(clamp(1 - d / 40, 0.08, 0.95) * clamp(1 - p.y / 60, 0.2, 1), 0.06, 1); },
    murmur: [[-24, TOWN_Y, 12], [18, TOWN_Y, 41], [-16, TOWN_Y, -39]],
  },
});
