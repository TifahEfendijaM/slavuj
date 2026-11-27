// Sarajevo (autumn): map module (in progress).
import { Vector3 } from 'three';
import { WORDS, ORDER, CULTURE } from './sarajevo-words.js';
import art from '../../assets/journal-sarajevo.webp';

const V = (x, y, z) => new Vector3(x, y, z);

export default {
  id: 'sarajevo',
  name: 'Sarajevo',
  art,
  artAlt: 'Old Sarajevo in autumn at sunset, painted in watercolour',
  WORDS,
  ORDER,
  CULTURE,
  ground: 12,
  bounds: { boundsRadius: 155, ceiling: 92 },
  build() { return { colliders: [], orbs: [], people: [], animals: [], clouds: [], start: V(0, 12, 8), fleur: V(95, 50, -60) }; },
  text: {
    firstHint: 'fly to the glowing orb and land on the wooden fountain in the square',
    first: 'New orbs have appeared all over Sarajevo. Find them in any order.',
    last: { id: 'zuta', msg: 'Only one orb is left. It is waiting on the old bastion high above the town.' },
    fleur: 'Something golden is shining high above the bastion. Fly through it.',
    awake: 'Sarajevo has awakened. You can now explore it freely.',
  },
  finale: {
    word: 'jesen',
    photo: { from: V(106, 46, -64), to: V(0, 16, 18) },
    P: [[4, 80, 44, -46], [10, 40, 34, -22], [16, 6, 22, 6], [22, -16, 20, 48], [28, -50, 28, 60]],
    shots: [
      { t0: 0, t1: 26, from: V(106, 46, -64), to: V(96, 42, -56), lookFrom: V(0, 16, 18), lookTo: V(-40, 18, 30) },
    ],
  },
  ambience: {},
};
