// Sarajevo (autumn): map module, finale, moving tram/cable-car, falling leaves, and local sounds.
import { Vector3 } from 'three';
import { buildSarajevoWorld, sarajevoGroundY, TOWN_Y } from './sarajevo-world.js';
import { WORDS, ORDER, CULTURE } from './sarajevo-words.js';
import { tag } from '../paper.js';
import { createAutumnLeaves } from '../autumn-leaves.js';
import art from '../../assets/journal-sarajevo.webp';

const V = (x, y, z) => new Vector3(x, y, z);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const sm = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

let leaves = null;
let tramDriver = null;
let lastBellStop = -99;
let nextQuack = 4;
let nextCoo = 3;

function build(scene) {
  const world = buildSarajevoWorld(scene);
  leaves = createAutumnLeaves(scene, {
    emitters: world.leafEmitters,
    groundY: sarajevoGroundY,
    count: 240,
  });
  tramDriver = null;
  lastBellStop = -99;
  nextQuack = 4;
  nextCoo = 3;
  return world;
}

function updateTramAndCabins(dt, time, life, ctx) {
  const { world, people, audio, flight, running, nearGain } = ctx;
  const alive = life > 0.5;
  world.movers.length = 0;

  // Reveal shop sign letters once their word begins colouring
  for (const s of world.signs || []) {
    const learned = tag(s.tag).uT.value > 0;
    if (s.textM.visible !== learned) { s.textM.visible = learned; s.iconM.visible = !learned; }
  }

  // Sahat-kula lunar hands: 11:35 in sketch -> smoothly reach 12:00 at sunset!
  const sunset = clamp(life, 0, 1);
  const hourAng = (-25 / 60 / 12) * Math.PI * 2 * (1 - sunset);
  const minAng = (-25 / 60) * Math.PI * 2 * (1 - sunset);
  for (const h of world.sahatHands || []) {
    h.hour.rotation.z = -hourAng;
    h.min.rotation.z = -minAng;
  }

  // Giant chess moving piece
  if (alive && world.movingChessPiece) {
    const cp = world.movingChessPiece;
    const u = 0.5 - 0.5 * Math.cos(time * 0.55);
    cp.g.position.lerpVectors(cp.a, cp.b, sm(u));
    cp.g.position.y = cp.a.y + Math.sin(u * Math.PI) * 0.45;
  }

  // Tram moves smoothly around the anticlockwise loop once awake
  const tr = world.tram;
  if (alive && tr.active) {
    const speed = 5.4; // m/s
    const loopLen = tr.curve.getLength();
    tr.u = (tr.u + (dt * speed) / loopLen) % 1;
    const p = tr.curve.getPointAt(tr.u);
    const tan = tr.curve.getTangentAt(tr.u);
    const ry = Math.atan2(tan.x, tan.z);
    tr.group.position.copy(p);
    tr.group.rotation.y = ry;
    // Move the seated tram driver with the front cab
    if (!tramDriver) tramDriver = people.list.find((x) => x.o.kind === 'sarDriver') || null;
    if (tramDriver) {
      tramDriver.root.position.set(p.x + Math.sin(ry) * 8.1, p.y + 0.82, p.z + Math.cos(ry) * 8.1);
      tramDriver.root.rotation.y = ry;
    }
    // Notify flight/inWay so a perched bird hops up if the tram approaches
    for (const off of [-6, 0, 6]) {
      world.movers.push({ x: p.x + Math.sin(ry) * off, y: p.y, z: p.z + Math.cos(ry) * off, fx: tan.x, fz: tan.z, r: 1.6, h: 3.4, v: speed });
    }
    // Tram rumble & soft bell near the Baščaršija stop (4, -15)
    if (running) {
      audio.setLoop('tram-rumble', nearGain(p, 36), { vol: 0.22 });
      const dStop = Math.hypot(p.x - 4, p.z + 15);
      if (dStop < 6 && time - lastBellStop > 14) {
        lastBellStop = time;
        const g = nearGain(p, 40);
        if (g > 0.04) audio.playNear('tram-bell', () => tr.group.position, 42, 0.34, { initGain: g });
      }
    }
  }

  // Trebević cable car cabins gliding smoothly up & down
  if (alive && world.cabins) {
    const { list, A, B } = world.cabins;
    const span = A.distanceTo(B);
    const dir = B.clone().sub(A).normalize();
    for (const c of list) {
      c.u = (c.u + c.sd * (dt * 3.8) / span + 1) % 1;
      const p = A.clone().lerp(B, c.u);
      p.x += c.perpX * c.sd; p.z += c.perpZ * c.sd;
      c.g.position.set(p.x, p.y - 1.5, p.z);
      world.movers.push({ x: p.x, y: p.y - 2.4, z: p.z, fx: dir.x * c.sd, fz: dir.z * c.sd, r: 1.3, h: 2.2, v: 3.8 });
    }
  }

  // Local Sarajevo ambient recordings once alive & running
  if (alive && running) {
    // Quiet coppersmith tapping in Kazandžiluk (approved decision 2a)
    audio.setLoop('kazandziluk-tapping', nearGain(V(23.2, TOWN_Y + 1.5, 14.5), 24), { vol: 0.22 });
    // Crackle at the chestnut stand
    audio.setLoop('chestnut-crackle', nearGain(V(39, TOWN_Y + 1.2, 32.5), 16), { vol: 0.24 });
    // Pigeons cooing on the square
    nextCoo -= dt;
    if (nextCoo <= 0) {
      nextCoo = 7 + Math.random() * 7;
      const g = nearGain(V(-3.5, TOWN_Y + 1, 3.8), 24);
      if (g > 0.04) audio.playNear('pigeon-coo', V(-3.5, TOWN_Y + 1, 3.8), 24, 0.28, { initGain: g });
    }
    // Ducks now and then on the Miljacka
    nextQuack -= dt;
    if (nextQuack <= 0) {
      nextQuack = 8 + Math.random() * 9;
      const g = nearGain(V(27.5, 0.5, 51), 24);
      if (g > 0.04) audio.playNear('duck-quack', V(27.5, 0.5, 51), 24, 0.26, { initGain: g });
    }
  }

  leaves?.update(dt);
}

function wakeTram(ctx) {
  const tr = ctx.world.tram;
  if (!tr || tr.active) return;
  tr.active = true;
  // Drop the frozen tram static collider so the bird never hits an invisible ghost tram
  const idx = ctx.world.colliders.indexOf(tr.staticCollider);
  if (idx >= 0) ctx.world.colliders.splice(idx, 1);
  leaves?.show();
}

export default {
  id: 'sarajevo',
  name: 'Sarajevo',
  art,
  artAlt: 'Old Sarajevo in autumn at sunset, painted in watercolour',
  WORDS,
  ORDER,
  CULTURE,
  ground: TOWN_Y,
  bounds: { boundsRadius: 155, ceiling: 92 },
  build,

  // Look from the Miljacka side (+z) for north-bank objects, and from north (-z) for south-bank objects
  sideOf(f) {
    if (f.z > 60) return Math.PI;
    return 0;
  },
  // Keep swimming bird between the Miljacka stone embankments (z = 41..61)
  swimClamp(pos, waterY) {
    if (waterY < 1) {
      if (pos.z < 41.2) pos.z = 41.2;
      if (pos.z > 60.8) pos.z = 60.8;
    }
  },
  // Miljacka flows gently west (-x) once the town is alive
  waterDrift(pos, waterY, life) {
    return waterY < 1 ? [-0.45 * life, 0] : [0, 0];
  },

  text: {
    firstHint: 'fly to the glowing orb and land on the wooden fountain in the square',
    first: 'New orbs have appeared all over Sarajevo. Find them in any order.',
    last: { id: 'zuta', msg: 'Only one orb is left. It is waiting on the old bastion high above the town.' },
    fleur: 'Something golden is shining high above the bastion. Fly through it.',
    awake: 'Sarajevo has awakened. You can now explore it freely.',
  },

  update: updateTramAndCabins,
  onWake: wakeTram,
  onAlive(ctx) {
    wakeTram(ctx);
  },

  finale: {
    word: 'jesen',
    paints: ['landmarks', 'quay', 'west', 'south', 'props', 'passerby', 'smoke'],
    // Finale photo: autumn Sarajevo from above Žuta tabija looking WSW into the sunset
    photo: { from: V(104, 42, -62), to: V(-12, 12, 16) },
    // 26 s flight: from golden fleur above Žuta tabija -> over mahala roofs -> round Sebilj poplar -> out over Miljacka
    P: [
      [2.5, 74, 44, -46],
      [5.5, 56, 38, -36],
      [8.5, 36, 30, -24],
      [11.5, 18, 22, -12],
      [14.2, 6, 15, -2],
      [16.2, 12, 13.5, -10],
      [18.4, 2, 14.5, -12],
      [20.6, -4, 13.5, 2],
      [22.8, 8, 12.5, 34],
      [25.2, -16, 15, 52],
      [28.0, -48, 22, 56],
    ],
    shots: [
      // 0 to 7.5 s: from above Žuta tabija, sky & low autumn sun colour over the valley
      { t0: 0, t1: 7.5, from: V(106, 44, -62), to: V(94, 40, -56), lookFrom: V(-10, 14, 14), lookTo: V(-56, 20, 26) },
      // 7.5 to 13.4 s: high over the mahala roofs looking down on Baščaršija as golden light sweeps the town
      { t0: 7.5, t1: 13.4, from: V(46, 44, -44), to: V(24, 30, -22), lookFrom: V(0, 8, 8), lookTo: V(2, 7, 2) },
      // 13.4 to 22.8 s: Pigeon Square; at 15 s pigeons burst up & golden poplar leaves swirl together
      { t0: 13.4, t1: 22.8, from: V(16, 11.5, 11.0), to: V(-12, 13.5, 10.5), lookFrom: V(2, 9, -2), lookTo: V(5, 13, -5) },
      // 22.8 to 26 s: out over the Miljacka with the rolling tram & sunset down the valley
      { t0: 22.8, t1: 26, from: V(38, 18, 72), to: V(14, 24, 82), lookFrom: V(12, 8, 34), lookTo: V(-36, 12, 22) },
    ],
    climax(ctx) {
      // At t = 15 s: pigeons burst up round the Sebilj & poplar while a gust shakes autumn leaves loose!
      ctx.people.launchPigeons(10);
      leaves?.gust(V(7.5, TOWN_Y + 11, -6.5));
      ctx.audio.playClip('tram-bell', 0.32);
    },
  },

  ambience: {
    water(p) {
      const dRiv = Math.max(0, Math.abs(p.z - 51) - 11);
      const base = clamp(1 - dRiv / 44, 0.06, 1) * clamp(1 - p.y / 65, 0.2, 1);
      // Louder near the Miljacka weirs
      let weirBoost = 0;
      for (const wx of [88, 42, -4, -50, -96]) {
        const dw = Math.hypot(p.x - wx, p.z - 51);
        weirBoost = Math.max(weirBoost, clamp(1 - dw / 18, 0, 1) * 0.25);
      }
      return clamp(base + weirBoost, 0, 1);
    },
    murmur: [
      [0, 2, 26],       // Pigeon Square & Sebilj
      [22, 18, 22],     // Kazandžiluk & Bravadžiluk
      [-44, -5, 20],    // Morića han kahvana
      [-103, 17, 22],   // Trg oslobođenja chess
      [84, -52, 22],    // Žuta tabija sunset watchers
    ],
  },
};
