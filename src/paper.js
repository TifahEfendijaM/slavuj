// The paper-and-wash look. One shader for everything; colours live in the geometry,
// so each "paint tag" (house, tree, river ...) is a single merged mesh that can be
// coloured in as a wave by moving one number (uT).
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import S from './settings.js';

export function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- noise texture: R = paper grain, G = big blotches, B = medium blotches ----
function makeNoiseTexture() {
  const size = 256, r = rng(1234);
  const lerp = (a, b, t) => a + (b - a) * t;
  const layer = (period) => {
    const g = new Float32Array(period * period).map(() => r());
    return (x, y) => {
      const fx = (x / size) * period, fy = (y / size) * period;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      let tx = fx - x0, ty = fy - y0;
      tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
      const i = (xx, yy) => g[(yy % period) * period + (xx % period)];
      return lerp(lerp(i(x0, y0), i(x0 + 1, y0), tx), lerp(i(x0, y0 + 1), i(x0 + 1, y0 + 1), tx), ty);
    };
  };
  const fbm = (periods) => {
    const ls = periods.map(layer);
    return (x, y) => { let v = 0, a = 0.5, s = 0; for (const l of ls) { v += l(x, y) * a; s += a; a *= 0.5; } return v / s; };
  };
  const stretch = (v) => Math.min(1, Math.max(0, (v - 0.5) * 2.4 + 0.5));
  const grainF = fbm([64, 128]), big = fbm([4, 8, 16, 32]), mid = fbm([8, 16, 32, 64]);
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    data[i] = 255 * (0.5 * r() + 0.5 * grainF(x, y));
    data[i + 1] = 255 * stretch(big(x, y));
    data[i + 2] = 255 * stretch(mid(x, y));
    data[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true; tex.needsUpdate = true;
  return tex;
}

export const SUN_DIR = new THREE.Vector3(-0.62, 0.3, -0.72).normalize();
export const shared = {
  uTime: { value: 0 }, uFlow: { value: 0 }, uPx: { value: 1 },
  uRes: { value: new THREE.Vector2(1, 1) },
  uLight: { value: new THREE.Vector3(-0.5, 0.8, 0.35).normalize() },
  uSunDir: { value: SUN_DIR.clone() }, uSun: { value: 0 }, uLife: { value: 0 },
  uNoise: { value: makeNoiseTexture() },
  uPaper: { value: new THREE.Color(S.colors.paper) },
  uInk: { value: new THREE.Color(S.ink.color) },
};

// pattern ids used in aPar.y
export const PAT = { none: 0, kilim: 1, cobble: 2, roof: 3, blocks: 4, planks: 5, water: 6, grass: 7, fall: 8, sky: 9 };

const SWAY = /* glsl */`
  if (aAni.w > 0.0) {
    float ph = aSeed.x * 0.37 + aSeed.z * 0.51;
    w.x += sin(uTime * 1.4 + ph) * aAni.w * uLife;
    w.z += cos(uTime * 1.1 + ph * 1.3) * aAni.w * 0.6 * uLife;
  } else if (aAni.w < 0.0) {              // negative: a slow drift (clouds)
    w.x += sin(uFlow * 0.11 - aAni.w) * -aAni.w * 1.3;
    w.z += sin(uFlow * 0.067 - aAni.w * 1.7) * -aAni.w * 0.6;
  }`;

const VERT = /* glsl */`
attribute vec3 aCol, aBleed, aSeed; attribute vec4 aPar, aAni;
uniform float uT, uTime, uLife, uFlow;
varying vec3 vWorld, vN, vCol, vBleed, vSeed; varying vec4 vPar; varying vec2 vUv, vAni;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  ${SWAY}
  vWorld = w.xyz;
  vN = normalize((vec4(normalMatrix * normal, 0.0) * viewMatrix).xyz);
  vUv = uv; vCol = aCol; vBleed = aBleed; vSeed = aSeed; vPar = aPar;
  vAni = vec2(clamp((uT - aAni.y) / aAni.z, 0.0, 1.0), aAni.x);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const FRAG = /* glsl */`
uniform sampler2D uNoise;
uniform vec3 uPaper, uInk, uLight, uSunDir;
uniform float uTime, uFlow, uPx, uVivid, uSun;
varying vec3 vWorld, vN, vCol, vBleed, vSeed; varying vec4 vPar; varying vec2 vUv, vAni;

float strokes(float h, float lw){
  float w = fwidth(h) * 1.2;
  float t = abs(fract(h) - 0.5) * 2.0;
  float l = 1.0 - smoothstep(lw - w, lw + w, t);
  return mix(l, lw, clamp(w * 1.5 - 0.3, 0.0, 1.0));
}
// lines of a staggered grid (cobbles, roof slabs, stone blocks)
float grid(vec2 p, float lw){
  vec2 w = fwidth(p) * 1.2 + 0.001;
  p.x += 0.5 * mod(floor(p.y), 2.0);
  vec2 f = 0.5 - abs(fract(p) - 0.5);
  float l = max(1.0 - smoothstep(lw, lw + w.x, f.x), 1.0 - smoothstep(lw, lw + w.y, f.y));
  return l * (1.0 - clamp(max(w.x, w.y) * 2.5 - 0.4, 0.0, 1.0));
}

void main(){
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 an = abs(N);
  vec2 wuv = (an.y > an.x && an.y > an.z) ? vWorld.xz : (an.x > an.z ? vWorld.zy : vWorld.xy);
  float pat = vPar.y, ps = vPar.w;
  bool sky = pat > 8.5;
  if (sky) wuv *= 0.02;

  float grain  = texture2D(uNoise, gl_FragCoord.xy / (uPx * 190.0)).r;
  float blotch = texture2D(uNoise, wuv * 0.045).g;
  float mid    = texture2D(uNoise, wuv * 0.17 + 0.3).b;

  // the evening light arrives as a wave from the side of the sun
  float tS = clamp((150.0 - dot(vWorld.xz, uSunDir.xz)) / 300.0, 0.0, 1.0);
  float sun = sky ? 0.0 : smoothstep(tS, tS + 0.25, uSun * 1.25);
  vec3 L = normalize(mix(uLight, uSunDir + vec3(0.0, 0.3, 0.0), sun));
  float shade = 1.0 - (dot(N, L) * 0.5 + 0.5);

  vec3 paper = uPaper * (0.93 + 0.09 * grain);

  // pencil hatching in the shaded areas
  float a1 = smoothstep(0.50, 0.68, shade);
  float h1 = strokes((wuv.x * 0.8 + wuv.y) * 4.2 + blotch * 0.6, 0.17) * a1 * smoothstep(0.15, 0.45, mid);
  float a2 = smoothstep(0.74, 0.9, shade);
  float h2 = strokes((wuv.x - wuv.y * 0.7) * 4.2 + mid * 0.5, 0.16) * a2;
  float hatch = clamp(h1 + h2, 0.0, 1.0) * vPar.z;

  // drawn surface patterns and the colour itself
  vec3 col = vCol; float pink = 0.0, streak = 0.0, bleedK = 1.0;
  if (pat > 0.5 && pat < 1.5) {            // kilim
    float b = vUv.y * ps;
    col = mix(vCol, vBleed, step(0.5, fract(b * 0.5)));
    float dm = abs(fract(vUv.x * ps * 0.6) - 0.5) + abs(fract(b) - 0.5);
    col = mix(col, vec3(0.93, 0.86, 0.68), step(dm, 0.22));
    pink = (1.0 - smoothstep(0.04, 0.04 + fwidth(b), 0.5 - abs(fract(b) - 0.5))) * 0.4;
    bleedK = 0.0;
  } else if (pat < 2.5 && pat > 1.5) {     // cobbles
    pink = grid(wuv * ps, 0.035) * smoothstep(0.3, 0.6, mid) * 0.36;
  } else if (pat < 3.5 && pat > 2.5) {     // roof slabs or tiles
    pink = grid(vUv * vec2(ps, ps * 1.7), 0.03) * smoothstep(0.25, 0.55, mid) * 0.32;
  } else if (pat < 4.5 && pat > 3.5) {     // stone blocks
    pink = grid(wuv * vec2(ps, ps * 2.0), 0.03) * smoothstep(0.5, 0.72, blotch) * 0.3;
  } else if (pat < 5.5 && pat > 4.5) {     // planks
    float q = vUv.x * ps;
    pink = (1.0 - smoothstep(0.04, 0.04 + fwidth(q), 0.5 - abs(fract(q) - 0.5))) * 0.45;
  } else if (pat < 6.5 && pat > 5.5) {     // water: long wavy strokes and small ripples
    float hw = wuv.y * 0.55 + sin(wuv.x * 0.45 + blotch * 4.0 + uFlow * 0.4) * 0.3 - uFlow * 0.22;
    float brk = texture2D(uNoise, wuv * vec2(0.012, 0.09) + vec2(0.0, -uFlow * 0.012)).g;
    float hr = wuv.y * 1.9 + sin(wuv.x * 2.1 + mid * 6.0) * 0.22 - uFlow * 0.5;
    float brk2 = texture2D(uNoise, wuv * vec2(0.05, 0.3) + vec2(0.4, -uFlow * 0.03)).b;
    streak = max(strokes(hw, 0.11) * smoothstep(0.38, 0.6, brk), strokes(hr, 0.14) * smoothstep(0.6, 0.78, brk2) * 0.8);
    hatch = 0.0;
  } else if (pat < 7.5 && pat > 6.5) {     // grass tufts
    float tuft = texture2D(uNoise, wuv * vec2(0.9, 0.07)).b;
    pink = strokes(wuv.x * 2.2 + mid * 3.0, 0.1) * smoothstep(0.74, 0.86, tuft) * 0.4;
  } else if (pat < 8.5 && pat > 7.5) {     // falling water: long streaks running down
    float fb = texture2D(uNoise, wuv * vec2(0.22, 0.045) + vec2(0.0, uFlow * 0.07)).g;
    float fb2 = texture2D(uNoise, wuv * vec2(0.5, 0.11) + vec2(0.3, uFlow * 0.12)).b;
    streak = max(strokes(wuv.x * 1.5 + sin(wuv.y * 0.9 + blotch * 4.0) * 0.18, 0.16) * smoothstep(0.34, 0.56, fb), strokes(wuv.x * 3.7 + mid, 0.12) * smoothstep(0.55, 0.75, fb2) * 0.8);
    hatch = 0.0;
  } else if (sky) {                        // evening sky: warm at the horizon, deep above
    vec3 dir = normalize(vWorld - vec3(0.0, 10.0, 0.0));
    col = mix(vCol, vBleed, smoothstep(0.02, 0.6, dir.y));
    col = mix(col, vec3(1.0, 0.86, 0.5), pow(max(dot(dir, uSunDir), 0.0), 5.0) * 0.75);
    hatch = 0.0; bleedK = 0.0;
  }
  float nearK = 1.0 - clamp(length(fwidth(wuv)) * 5.0 - 0.5, 0.0, 1.0);   // drawn detail fades out far away
  pink *= nearK; hatch *= mix(0.55, 1.0, nearK);
  col = mix(col, vBleed, smoothstep(0.45, 0.9, blotch) * 0.45 * bleedK);

  // wet paint front spreading from the seed
  float p = 1.0 - pow(1.0 - vAni.x, 1.5);
  float d = min(distance(vWorld, vSeed) / vAni.y, 1.4) + blotch * 0.45 + mid * 0.15;
  float front = p * 2.3 - 0.1;
  float m   = 1.0 - smoothstep(front - 0.05, front, d);
  float wet = m * smoothstep(front - 0.55, front, d);
  float rim = m * smoothstep(front - 0.11, front - 0.04, d);
  float damp = (1.0 - m) * (1.0 - smoothstep(front, front + 0.25, d)) * step(0.001, p);

  float strength = mix((0.8 + 0.2 * mid) * (0.86 + 0.26 * grain), 1.0, max(uVivid, sky ? 0.7 : 0.0));
  vec2 e = min(vUv, 1.0 - vUv);
  float pool = vPar.x * (1.0 - smoothstep(0.0, 0.06 + 0.05 * mid, min(e.x, e.y)));
  float gran = sky ? 0.0 : 1.0 - smoothstep(0.0, 0.035, abs(blotch - 0.5));
  vec3 wash = mix(vec3(1.0), col, strength);
  wash *= 1.0 - 0.22 * pool - 0.10 * gran * (1.0 - uVivid) - 0.22 * wet - 0.42 * rim;
  float sh = sky ? 0.0 : smoothstep(0.55, 0.68, shade + (mid - 0.5) * 0.06);
  wash *= mix(vec3(1.0), mix(vec3(0.74, 0.7, 0.86), vec3(0.7, 0.58, 0.76), sun), sh * 0.6);
  vec3 painted = mix(paper, vec3(0.97), uVivid * 0.6) * wash;
  painted = mix(painted, paper * 1.03, streak * 0.55);             // light glints on water
  painted += sun * 0.13 * max(dot(N, uSunDir), 0.0) * vec3(1.0, 0.7, 0.32);
  painted += sun * streak * vec3(0.3, 0.16, 0.02);

  vec3 c = mix(paper * (1.0 - 0.07 * damp), painted, m);
  c = mix(c, uInk, max(hatch * mix(0.5, 0.3, m), max(pink, streak * 0.75) * (1.0 - m * (streak > 0.0 ? 1.0 : 0.45))));
  c *= mix(vec3(1.0), vec3(1.05, 0.95, 0.84), sun);
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;

export const tags = {};
export function tag(name) {
  return tags[name] ||= { name, uT: { value: -1e4 }, pos: [], nor: [], uv: [], col: [], bleed: [], par: [], sway: [],
    hpos: [], hnor: [], hsway: [], subs: [], source: null, mode: 'wave', waveDelay: 0.5, painted: false };
}

export function washMat(tagName, o = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: o.side ?? THREE.FrontSide,
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
    uniforms: {
      uNoise: shared.uNoise, uPaper: shared.uPaper, uInk: shared.uInk, uLight: shared.uLight, uSunDir: shared.uSunDir,
      uTime: shared.uTime, uFlow: shared.uFlow, uPx: shared.uPx, uSun: shared.uSun, uLife: shared.uLife,
      uT: tag(tagName).uT, uVivid: { value: o.vivid ?? 0 },
    },
  });
}

// ---- ink ----
export const inkMaterial = new LineMaterial({ color: new THREE.Color(S.ink.color), linewidth: S.ink.lineWidth });
const fadeMats = [];   // outlines that disappear once their tag has been coloured (grass, hanging branches)

const HULL_VERT = /* glsl */`
attribute vec3 aSeed; attribute vec4 aAni;
uniform float uW, uTime, uLife, uFlow; uniform vec2 uRes;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  ${SWAY}
  vec4 c = projectionMatrix * viewMatrix * w;
  vec4 cn = projectionMatrix * vec4(normalMatrix * normal, 0.0);
  c.xy += normalize(cn.xy + 1e-6) * uW * 2.0 / uRes * c.w;
  gl_Position = c;
}`;
const HULL_FRAG = /* glsl */`
uniform vec3 uInk;
void main(){ gl_FragColor = vec4(uInk, 1.0);
  #include <colorspace_fragment>
}`;
const hullMats = {};
export function hullMat(width = S.ink.lineWidth) {
  return hullMats[width] ||= new THREE.ShaderMaterial({
    vertexShader: HULL_VERT, fragmentShader: HULL_FRAG, side: THREE.BackSide,
    uniforms: { uW: { value: width }, uRes: shared.uRes, uInk: shared.uInk, uTime: shared.uTime, uLife: shared.uLife, uFlow: shared.uFlow },
  });
}
export function addHull(mesh, width) { const h = new THREE.Mesh(mesh.geometry, hullMat(width)); mesh.add(h); return h; }

// A geometry for a moving object (bird, diver): the colour attributes are baked in as constants.
export function paintGeo(geo, o = {}) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  const n = g.attributes.position.count;
  const fill = (name, size, vals) => {
    const a = new Float32Array(n * size);
    for (let i = 0; i < n; i++) for (let k = 0; k < size; k++) a[i * size + k] = vals[k];
    g.setAttribute(name, new THREE.BufferAttribute(a, size));
  };
  const c = new THREE.Color(o.col ?? '#ffffff'), b = new THREE.Color(o.bleed ?? o.col ?? '#ffffff'), s = o.seed ?? [0, 0, 0];
  fill('aCol', 3, [c.r, c.g, c.b]); fill('aBleed', 3, [b.r, b.g, b.b]); fill('aSeed', 3, s);
  fill('aPar', 4, [o.pool ?? 0, o.pat ?? 0, o.hatch ?? 0, o.ps ?? 1]);
  fill('aAni', 4, [o.radius ?? 3, o.delay ?? 0, o.dur ?? 3, 0]);
  if (!g.attributes.uv) fill('uv', 2, [0, 0]);
  return g;
}

// ---- the world builder: merges everything of one tag into one mesh ----
const COLLIDE = new THREE.MeshBasicMaterial();
const edgeCache = new Map();
const _v = new THREE.Vector3(), _n = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _d = new THREE.Vector3();
const _nm = new THREE.Matrix3(), _c = new THREE.Color();

export class Builder {
  constructor() { this.M = new THREE.Matrix4(); this.stack = []; this.ink = []; this.colliders = []; this.cur = null; this.r = rng(99); this.id = 0; }
  push(m) { this.stack.push(this.M); this.M = this.M.clone().multiply(m); }
  pop() { this.M = this.stack.pop(); }
  // everything added inside fn belongs to one object (one house, one tree ...)
  object(fn) { const prev = this.cur; this.cur = { id: ++this.id, subs: {} }; const r = fn(this.cur); this.cur = prev; return r; }

  add(geo, m, o) {
    if (!this.cur) return this.object(() => this.add(geo, m, o));
    const t = tag(o.tag), W = this.M.clone().multiply(m);
    const sub = this.cur.subs[o.tag] ||= (() => { const s = { ranges: [], hranges: [], box: new THREE.Box3() }; t.subs.push(s); return s; })();
    const g = geo.index ? (geo.userData.flat ||= geo.toNonIndexed()) : geo;
    const P = g.attributes.position, Nn = g.attributes.normal, U = g.attributes.uv, n = P.count;
    _nm.getNormalMatrix(W);
    const col = _c.set(o.col ?? '#fff'), cr = col.r, cg = col.g, cb = col.b;
    const bl = _c.set(o.bleed ?? o.col ?? '#fff'), br = bl.r, bg = bl.g, bb = bl.b;
    const v0 = t.pos.length / 3;
    // round shapes (given a high edge angle) have no edges to ink along their sides, so they get an outline as well
    const hull = o.hull ?? ((o.edge ?? 0) >= 40 && o.ink !== false);
    for (let i = 0; i < n; i++) {
      _v.fromBufferAttribute(P, i).applyMatrix4(W); _n.fromBufferAttribute(Nn, i).applyMatrix3(_nm).normalize();
      t.pos.push(_v.x, _v.y, _v.z); t.nor.push(_n.x, _n.y, _n.z);
      t.uv.push(U ? U.getX(i) : 0, U ? U.getY(i) : 0);
      t.col.push(cr, cg, cb); t.bleed.push(br, bg, bb);
      t.par.push(o.pool ?? 0, o.pat ?? 0, o.hatch ?? 1, o.ps ?? 1);
      t.sway.push(typeof o.sway === 'function' ? o.sway(_v) : (o.sway ?? 0));
      sub.box.expandByPoint(_v);
      if (hull) { t.hpos.push(_v.x, _v.y, _v.z); t.hnor.push(_n.x, _n.y, _n.z); t.hsway.push(t.sway[t.sway.length - 1]); }
    }
    sub.ranges.push([v0, n]);
    if (hull) sub.hranges.push([t.hpos.length / 3 - n, n]);
    if (o.ink !== false && !o.hull) {
      const key = geo.uuid + (o.edge ?? 30);
      let e = edgeCache.get(key);
      if (!e) edgeCache.set(key, e = new THREE.EdgesGeometry(geo, o.edge ?? 30).attributes.position);
      const r = this.r, jit = o.jitter ?? 0.03, j = () => (r() - 0.5) * 2 * jit, ink = o.inkFade ? (t.fink ||= []) : this.ink;
      for (let i = 0; i < e.count; i += 2) {
        _a.fromBufferAttribute(e, i).applyMatrix4(W); _b.fromBufferAttribute(e, i + 1).applyMatrix4(W);
        _d.subVectors(_b, _a); const len = _d.length(); if (len < 1e-3) continue;
        const k = len > 0.6 && r() < 0.5 ? 2 : 1;
        for (let s = 0; s < k; s++) {
          const ov = Math.min(len * 0.05, 0.2) * (0.4 + r()) / len;
          ink.push(_a.x - _d.x * ov + j(), _a.y - _d.y * ov + j(), _a.z - _d.z * ov + j(), _b.x + _d.x * ov + j(), _b.y + _d.y * ov + j(), _b.z + _d.z * ov + j());
        }
      }
    }
    if (o.solid !== false) {
      const c = new THREE.Mesh(geo, COLLIDE); c.matrixAutoUpdate = false; c.matrix.copy(W); c.matrixWorld.copy(W);
      c.userData = { orb: o.orb, water: o.water, wall: o.wall, tag: o.tag };
      this.colliders.push(c); return c;
    }
    return null;
  }

  // an invisible obstacle
  block(geo, m, data = {}) {
    const W = this.M.clone().multiply(m), c = new THREE.Mesh(geo, COLLIDE);
    c.matrixAutoUpdate = false; c.matrix.copy(W); c.matrixWorld.copy(W); c.userData = data; this.colliders.push(c); return c;
  }

  // fill in where each piece's colour comes from and when, then build the meshes
  finish(scene) {
    const out = {};
    for (const t of Object.values(tags)) {
      const n = t.pos.length / 3; if (!n) continue;
      const seed = new Float32Array(n * 3), ani = new Float32Array(n * 4), hseed = new Float32Array(t.hpos.length), hani = new Float32Array(t.hpos.length / 3 * 4);
      const all = new THREE.Box3(); for (const s of t.subs) all.union(s.box);
      const src = t.source || all.getCenter(new THREE.Vector3());
      for (const s of t.subs) {
        const c = s.box.getCenter(new THREE.Vector3()), rad = Math.max(0.5, s.box.getSize(_v).length() / 2), dist = c.distanceTo(src);
        let sd, radius, delay, dur;
        if (t.mode === 'one') { sd = src; radius = t.radius ?? 160; delay = 0; dur = t.dur ?? 4.6; }
        else if (dist < rad + 2) { sd = src; radius = rad + dist + 0.5; delay = 0; dur = 4.2; }
        else { sd = c.clone().addScaledVector(_d.subVectors(src, c).normalize(), rad * 0.9); radius = rad * 2; delay = t.waveDelay + Math.min(dist, 150) / 150 * 2.5; dur = 2.0; }
        for (const [v0, cnt] of s.ranges) for (let i = v0; i < v0 + cnt; i++) {
          seed[i * 3] = sd.x; seed[i * 3 + 1] = sd.y; seed[i * 3 + 2] = sd.z;
          ani[i * 4] = radius; ani[i * 4 + 1] = delay; ani[i * 4 + 2] = dur; ani[i * 4 + 3] = t.sway[i];
        }
        for (const [v0, cnt] of s.hranges) for (let i = v0; i < v0 + cnt; i++) {
          hseed[i * 3] = sd.x; hseed[i * 3 + 1] = sd.y; hseed[i * 3 + 2] = sd.z; hani[i * 4 + 3] = t.hsway[i];
        }
      }
      const g = new THREE.BufferGeometry(), F = (a, s) => new THREE.BufferAttribute(a instanceof Float32Array ? a : new Float32Array(a), s);
      g.setAttribute('position', F(t.pos, 3)); g.setAttribute('normal', F(t.nor, 3)); g.setAttribute('uv', F(t.uv, 2));
      g.setAttribute('aCol', F(t.col, 3)); g.setAttribute('aBleed', F(t.bleed, 3)); g.setAttribute('aPar', F(t.par, 4));
      g.setAttribute('aSeed', F(seed, 3)); g.setAttribute('aAni', F(ani, 4));
      const mesh = new THREE.Mesh(g, washMat(t.name, { side: t.side ?? THREE.DoubleSide })); mesh.frustumCulled = false; scene.add(mesh);
      if (t.hpos.length) {
        const hg = new THREE.BufferGeometry();
        hg.setAttribute('position', F(t.hpos, 3)); hg.setAttribute('normal', F(t.hnor, 3)); hg.setAttribute('aSeed', F(hseed, 3)); hg.setAttribute('aAni', F(hani, 4));
        const hm = new THREE.Mesh(hg, hullMat(t.hullWidth)); hm.frustumCulled = false; scene.add(hm);
      }
      out[t.name] = mesh;
      if (t.fink?.length) {
        const fm = new LineMaterial({ color: new THREE.Color(S.ink.color), linewidth: S.ink.lineWidth, transparent: true }); fadeMats.push(fm);
        t.fadeLine = new LineSegments2(new LineSegmentsGeometry().setPositions(t.fink), fm); t.fadeLine.frustumCulled = false; scene.add(t.fadeLine); t.fink = null;
      }
      for (const k of ['pos', 'nor', 'uv', 'col', 'bleed', 'par', 'sway', 'hpos', 'hnor', 'hsway']) t[k] = null;
    }
    const line = new LineSegments2(new LineSegmentsGeometry().setPositions(this.ink), inkMaterial);
    line.frustumCulled = false; scene.add(line);
    return out;
  }
}

export function setResolution(w, h, px) {
  shared.uRes.value.set(w, h); shared.uPx.value = px; inkMaterial.resolution.set(w, h); for (const m of fadeMats) m.resolution.set(w, h);
}
