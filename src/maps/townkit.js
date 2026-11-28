// Shared building pieces for the newer towns (Konjic, Brčko, Visoko, Stolac, Trebević, Bijambare, Peručica):
// the builder helpers, sky and clouds, roofs and arches, houses and trees, orbs, and the world object main.js expects.
// A town file only says what is where. (Mostar and the earlier towns have their own copies of these helpers.)
import * as THREE from 'three';
import { Builder, PAT, tag, rng, shared, paintGeo, washMat, addHull } from '../paper.js';
import S from '../settings.js';

export { PAT, tag, THREE };
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

export function mat4(x, y, z, ry = 0, rx = 0, rz = 0, s = 1) {
  return new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')),
    Array.isArray(s) ? new THREE.Vector3(...s) : new THREE.Vector3(s, s, s),
  );
}

export const G = {
  BOX: new THREE.BoxGeometry(1, 1, 1),
  CYL: new THREE.CylinderGeometry(1, 1, 1, 8),
  CYL12: new THREE.CylinderGeometry(1, 1, 1, 12),
  CYL16: new THREE.CylinderGeometry(1, 1, 1, 16),
  CONE4: new THREE.ConeGeometry(1, 1, 4),
  CONE8: new THREE.ConeGeometry(1, 1, 8),
  ICO: new THREE.IcosahedronGeometry(1, 1),
  ICO0: new THREE.IcosahedronGeometry(1, 0),
  SPHERE: new THREE.SphereGeometry(1, 10, 8),
  HEMI: new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
};

// a four-sided hipped roof (its base at y = 0)
export function hipRoofGeo(w, d, h) {
  const g = new THREE.ConeGeometry(1, h, 4);
  g.rotateY(Math.PI / 4); g.scale(w * 0.72, 1, d * 0.72); g.translate(0, h / 2, 0);
  return g;
}
// a gabled roof: ridge along x, w wide (x), d deep (z), h high
export function gableRoofGeo(w, d, h) {
  const s = new THREE.Shape(); s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false });
  g.translate(0, 0, -w / 2); g.rotateY(Math.PI / 2);
  return g;
}
// one bay of a stone bridge: a (slightly pointed) arch in a block of masonry; the arch opening faces z
export function archBayGeo(bayW, totalH, openW, springH, apexH, depth, pointed = 0.86) {
  const hw = bayW / 2, ow = openW / 2, s = new THREE.Shape();
  s.moveTo(-hw, 0); s.lineTo(-ow, 0); s.lineTo(-ow, springH);
  s.quadraticCurveTo(-ow * 0.96, apexH * pointed, 0, apexH);
  s.quadraticCurveTo(ow * 0.96, apexH * pointed, ow, springH);
  s.lineTo(ow, 0); s.lineTo(hw, 0); s.lineTo(hw, totalH); s.lineTo(-hw, totalH); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 8 });
  g.translate(0, 0, -depth / 2);
  return g;
}
// a slab with a round-topped opening (a doorway, a tunnel or cave mouth): w x h, opening openW wide, straight sides to sideH, then an arch archH high
export function portalGeo(w, h, openW, sideH, archH, depth) {
  const hw = w / 2, ow = openW / 2, s = new THREE.Shape();
  s.moveTo(-hw, 0); s.lineTo(-ow, 0); s.lineTo(-ow, sideH);
  s.absellipse(0, sideH, ow, archH, Math.PI, 0, true);
  s.lineTo(ow, 0); s.lineTo(hw, 0); s.lineTo(hw, h); s.lineTo(-hw, h); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 14 });
  g.translate(0, 0, -depth / 2);
  return g;
}
// a moving piece (boat, fish, bird): its colour baked in, painted with tagName
export function dynMesh(geo, tagName, col, bleed, parent, x = 0, y = 0, z = 0, s = 1, hull = 1.3) {
  const seed = parent ? [parent.position.x, parent.position.y, parent.position.z] : [0, 0, 0];
  const g = paintGeo(geo, { col, bleed: bleed || col, seed, radius: 12, dur: 2.8, hatch: 0.45 });
  const m = new THREE.Mesh(g, washMat(tagName));
  m.position.set(x, y, z);
  if (Array.isArray(s)) m.scale.set(...s); else m.scale.setScalar(s);
  if (hull) addHull(m, hull);
  if (parent) parent.add(m);
  return m;
}

export const PAL = {
  WHITE: ['#f3eee2', '#d8d0bf'], STONE: ['#cbc3b2', '#9d9584'], STONE_D: ['#a9a397', '#7d776c'],
  TILE: ['#b85432', '#8c3b20'], SLAB: ['#8f897d', '#676157'], WOOD_D: ['#5a3c25', '#3b2617'], WOOD_W: ['#93683e', '#6b4a29'],
  GRASS: ['#8fa04c', '#687a32'], GRASS_S: ['#86b04e', '#5d8634'], SNOW: ['#f7f9fc', '#d6e0ec'], COPPER: ['#c97b3c', '#924f1f'],
};

// ---- the town ----
// o: seed, sun [x,y,z] (towards the sun), water [x,z] (the flow), light { shadow, glow, tint, skyGlow }, sky [top, horizon], clouds [[x,y,z,s]]
export function town(scene, o) {
  const b = new Builder(), R = rng(o.seed || 1), rr = (lo, hi) => lo + R() * (hi - lo);
  const A = (geo, x, y, z, m, ry = 0, rx = 0, rz = 0, s = 1) => b.add(geo, mat4(x, y, z, ry, rx, rz, s), m);
  const box = (w, h, d, x, y, z, m, ry = 0, rx = 0, rz = 0) => A(G.BOX, x, y, z, m, ry, rx, rz, [w, h, d]);
  const sunDir = new THREE.Vector3(...o.sun).normalize(), L = o.light || {};
  shared.uSunDir.value.copy(sunDir);
  shared.uWaterDir.value.set(...(o.water || [0, 1]));
  shared.uSunShadow.value.set(...(L.shadow || [0.56, 0.53, 0.62]));
  shared.uSunGlow.value.set(...(L.glow || [1.0, 0.88, 0.62]));
  shared.uSunTint.value.set(...(L.tint || [1.05, 0.98, 0.9]));
  shared.uSkyGlow.value.set(...(L.skyGlow || [0.95, 0.92, 0.86]));

  const k = { b, R, rr, A, box, orbs: [], people: [], smoke: [], clouds: [], fish: [], birds: [], rock: [], flyers: [], spin: [], swing: [], walkers: [] };

  // sky, sun and clouds
  tag('sky').side = THREE.BackSide; tag('sky').mode = 'one'; tag('sky').radius = 1300; tag('sky').dur = 6;
  tag('sun').mode = 'one'; tag('sun').radius = 65; tag('sun').dur = 2.5;
  const [skyTop, skyLow] = o.sky || ['#b6d9e8', '#79b3d4'];
  A(new THREE.SphereGeometry(720, 32, 20), 0, 0, 0, { tag: 'sky', col: skyTop, bleed: skyLow, pat: PAT.sky, hatch: 0, ink: false, solid: false });
  const sunPos = sunDir.clone().multiplyScalar(520); k.sunPos = sunPos;
  const sunM = new THREE.Matrix4().lookAt(sunPos, V(0, 20, 0), V(0, 1, 0)).setPosition(sunPos);
  b.add(new THREE.CircleGeometry(28, 36).rotateY(Math.PI), sunM, { tag: 'sun', col: o.sunCol || '#ffe899', bleed: '#f5b84c', hatch: 0, ink: false, solid: false });
  {
    const g = new THREE.Group(); g.position.copy(sunPos); g.lookAt(0, 20, 0);
    const inkM = new THREE.MeshBasicMaterial({ color: S.ink.color, side: THREE.DoubleSide });
    for (const r0 of [28, 29]) { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r0 + 0.7, 48), inkM); m.position.z = -0.5; g.add(m); }
    scene.add(g);
  }
  for (const [x, y, z, s] of o.clouds || [[-150, 90, -120, 8], [140, 96, -140, 9], [170, 84, 70, 7], [-170, 82, 95, 8], [60, 92, 200, 8]]) {
    k.clouds.push({ c: V(x, y, z), r: 4.0 * s });
    const dr = -rr(14, 34), col = o.cloudCol || '#fffcf2';
    b.object(() => {
      for (const [ox, oy, oz, r] of [[-2.0, 0, 0, 1.4], [-0.5, 0.5, 0.2, 1.9], [1.0, 0.45, -0.2, 2.0], [2.3, 0, 0, 1.4], [0.2, -0.2, 0.5, 1.7]])
        A(G.ICO, x + ox * s, y + oy * s, z + oz * s, { tag: 'hills', col, bleed: '#ebe4d1', hull: true, hatch: 0.3, solid: false, sway: dr }, 0, 0, 0, [r * s, 0.58 * r * s, r * s]);
    });
  }

  // the big words colour as one sweeping wash; small things wait a moment so the eye follows
  k.bigTags = (...names) => { for (const t of names) { tag(t).mode = 'one'; tag(t).radius = 130; tag(t).holdRest = 2.4; } };
  k.lateTags = (...names) => { for (const t of names) tag(t).waveDelay = 2.0; };

  // an orb. focus: what it names; top: the height the orb hovers above (plus the usual hover); extra: at, near, swim, view, wideView, stage
  k.orb = (id, focus, size, shot, top, extra = {}) => k.orbs.push({
    id, focus: V(...focus), size, tags: extra.tags || [id], shot,
    at: V(focus[0], top + S.orb.hoverHeight, focus[2]), stage: 1, ...extra,
  });

  // a house: stone base, walls, a hipped (or gabled) roof, windows and a door on its front (+z before turning by ry)
  // h: wall height above the base; roof 'slab' (grey stone slabs) or 'tile' (red tiles); tag defaults to 'town'
  k.house = ({ x, y, z, w = 7, d = 5.6, h = 3.2, ry = 0, tag: t = 'town', walls = PAL.WHITE, roof = 'tile', roofCol, base = 1.2, floors = 1, gable = false, door = true, orb, extraTagRoof }) => {
    b.push(mat4(x, y, z, ry));
    b.object(() => {
      const M = (col, extra = {}) => ({ tag: t, col: col[0], bleed: col[1], ...(orb ? { orb } : {}), ...extra });
      if (base) box(w, base, d, 0, base / 2, 0, M(PAL.STONE, { pat: PAT.blocks, ps: 0.7 }));
      box(w + 0.3, h * floors, d + 0.3, 0, base + (h * floors) / 2, 0, M(walls));
      const top = base + h * floors, rc = roofCol || (roof === 'slab' ? PAL.SLAB : PAL.TILE);
      const RM = { tag: extraTagRoof || t, col: rc[0], bleed: rc[1], pat: PAT.roof, ps: roof === 'slab' ? 1.5 : 1, ...(orb && !extraTagRoof ? { orb } : {}) };
      if (gable) A(gableRoofGeo(w + 1.2, d + 1.2, 2.4), 0, top, 0, RM); else A(hipRoofGeo(w + 1.2, d + 1.2, 2.6), 0, top, 0, RM);
      for (let f = 0; f < floors; f++) for (const ox of [-w * 0.27, w * 0.27]) box(0.95, 1.1, 0.2, ox, base + h * f + h * 0.55, d / 2 + 0.2, M(['#4a3525', '#33241a'], { solid: false }));
      if (door) box(1.1, Math.min(2.1, h * 0.8), 0.2, 0, base + Math.min(2.1, h * 0.8) / 2 - 0.05, d / 2 + 0.2, M(['#3d2818', '#2a1b10'], { solid: false }));
    });
    b.pop();
  };

  // a tree. kind: round, cypress, pine, spruce, poplar, willow, birch
  k.tree = (x, y, z, s = 1, kind = 'round', t = 'hills', c1 = '#7aa045', c2 = '#52702a', extra = {}) => b.object(() => {
    const trunk = { tag: t, col: kind === 'birch' ? '#e8e4da' : PAL.WOOD_D[0], bleed: kind === 'birch' ? '#a8a296' : PAL.WOOD_D[1], ...extra };
    const leaf = { tag: t, col: c1, bleed: c2, hull: true, sway: kind === 'spruce' || kind === 'cypress' ? 0.05 : 0.12, ...extra };
    if (kind === 'cypress') {
      A(G.CYL, x, y + 0.6 * s, z, trunk, 0, 0, 0, [0.22, 1.2 * s, 0.22]);
      A(G.SPHERE, x, y + 5.0 * s, z, leaf, 0, 0, 0, [1.0 * s, 4.6 * s, 1.0 * s]);
    } else if (kind === 'pine' || kind === 'spruce') {
      A(G.CYL, x, y + 1.6 * s, z, trunk, 0, 0, 0, [0.24 * s, 3.2 * s, 0.24 * s]);
      const tiers = kind === 'spruce' ? [[2.4, 2.4, 3.2], [4.4, 1.9, 2.8], [6.2, 1.4, 2.4], [7.8, 0.8, 1.8]] : [[3.2, 2.2, 1.9], [4.6, 1.7, 1.9], [5.8, 1.1, 1.9]];
      for (const [ty, r, hh] of tiers) A(G.CONE8, x, y + ty * s, z, leaf, 0, 0, 0, [r * s, hh * s, r * s]);
    } else if (kind === 'poplar') {
      A(G.CYL, x, y + 1.2 * s, z, trunk, 0, 0, 0, [0.24 * s, 2.4 * s, 0.24 * s]);
      A(G.SPHERE, x, y + 6.0 * s, z, leaf, 0, 0, 0, [1.4 * s, 5.0 * s, 1.4 * s]);
    } else if (kind === 'willow') {
      A(G.CYL, x, y + 1.6 * s, z, trunk, 0, 0, 0.12, [0.34 * s, 3.2 * s, 0.34 * s]);
      A(G.ICO, x, y + 3.8 * s, z, leaf, 0, 0, 0, [2.6 * s, 2.4 * s, 2.6 * s]);
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; A(G.ICO, x + Math.cos(a) * 2.1 * s, y + 2.4 * s, z + Math.sin(a) * 2.1 * s, { ...leaf, solid: false }, 0, 0, 0, [0.7 * s, 1.6 * s, 0.7 * s]); }
    } else {
      A(G.CYL, x, y + 2.0 * s, z, trunk, 0, 0, 0, [0.28 * s, 4.0 * s, 0.28 * s]);
      A(G.ICO, x, y + 4.6 * s, z, leaf, 0, 0, 0, [2.1 * s, 1.8 * s, 2.1 * s]);
    }
  });

  // a gently rolling backdrop of hills or mountains (domes), solid: false so they never trap the bird
  k.hills = (list, col = ['#a3a272', '#77774c'], t = 'hills', extra = {}) => {
    for (const [hx, hz, rx, ry, rz, y0 = -2.5] of list) A(G.HEMI, hx, y0, hz, { tag: t, col: col[0], bleed: col[1], pat: PAT.grass, hull: true, solid: false, ...extra }, 0, 0, 0, [rx, ry, rz]);
  };

  // everything is placed: merge it and hand main.js its world
  k.finish = (extra = {}) => {
    for (const ob of k.orbs) for (const t of ob.tags) tag(t).source = ob.focus.clone();
    tag('sky').source = sunPos.clone(); tag('sun').source = sunPos.clone();
    b.finish(scene);
    return {
      colliders: b.colliders, orbs: k.orbs, people: k.people, animals: [], clouds: k.clouds, smoke: k.smoke, sunPos, movers: [],
      fish: k.fish, birds: k.birds, rock: k.rock, flyers: k.flyers, spin: k.spin, swing: k.swing, ...extra,
    };
  };
  return k;
}
