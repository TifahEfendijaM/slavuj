// Mostar (summer): the first map. Its world is built in ../world.js, its words are in ../vocab.js.
import { Vector3 } from 'three';
import { buildWorld } from '../world.js';
import { WORDS, ORDER, CULTURE } from '../vocab.js';
import art from '../../assets/journal-mostar.webp';

const V = (x, y, z) => new Vector3(x, y, z);
export default {
  id: 'mostar', name: 'Mostar', build: buildWorld, WORDS, ORDER, CULTURE, art,
  text: {
    firstHint: 'fly to the glowing orb and land on the roof',
    first: 'New orbs have appeared all over Mostar. Find them in any order.',
    last: { id: 'most', msg: 'Only the old bridge is left. Its orb is waiting on the bridge.' },
    fleur: 'Something golden is shining high above the bridge. Fly through it.',
    awake: 'Mostar has awakened. You can now explore it freely.',
  },
  // the finale: the bird flies itself along P ([seconds, x, y, z]; the first point is where it is), the camera cuts between the shots
  finale: {
    word: 'sunce', photo: { from: V(30, 30, 50), to: V(-60, 62, -80) },
    P: [[2, -14, 64, -6], [4.5, -26, 56, 10], [7, -18, 46, 34], [9.5, 2, 38, 48], [12, 14, 30, 36], [14, 10, 25, 16], [15.6, 4.5, 22.5, 6.5],
      [16.6, -2.5, 22, 5], [17.4, -4, 18.5, 9], [18.3, -2, 12.5, 13], [19.6, 6.5, 10, 22], [21.5, 7.5, 11, 40], [23.5, -2, 17, 56], [26, 0, 26, 68], [28, 2, 30, 80]],
    shots: [
      { t0: 0, t1: 7.5, from: V(30, 30, 50), to: V(24, 35, 44), lookFrom: V(-60, 62, -80), lookTo: V(-75, 60, -92) },
      { t0: 7.5, t1: 13.4, from: V(34, 60, 98), to: V(8, 48, 82), lookFrom: V(0, 12, 0), lookTo: V(0, 10, -8) },
      { t0: 13.4, t1: 22.8, from: V(-2.6, 7.2, 31.5), to: V(0.6, 5.2, 27.5), diver: true },
      { t0: 22.8, t1: 26, from: V(3, 26, 66), to: V(0, 33, 80), lookFrom: V(0, 13, 0), lookTo: V(0, 14, 0) },
    ],
  },
  // where the living town is heard: the bustle of the bazaar, people talking, the sheep on the meadow
  ambience: { city: [42, 0, 60], murmur: [[42, 0, 34], [-7, 0, 22], [19, 50, 20], [-28, -4, 16], [31, 76, 22], [55, 72, 20]], sheep: [56.5, 55] },
};
