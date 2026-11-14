// The paper-and-wash look: one material for everything, plus ink lines.
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
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

export const shared = {
  uTime: { value: 0 },
  uPx: { value: 1 },
  uRes: { value: new THREE.Vector2(1, 1) },
  uLight: { value: new THREE.Vector3(-0.5, 0.8, 0.35).normalize() },
  uNoise: { value: makeNoiseTexture() },
  uPaper: { value: new THREE.Color(S.colors.paper) },
  uInk: { value: new THREE.Color(S.ink.color) },
};

// A paint group: every part of one colourable object shares these.
export function newPaint(progress = 0) {
  return { uProgress: { value: progress }, uSeed: { value: new THREE.Vector3() }, uRadius: { value: 1e6 } };
}

const VERT = /* glsl */`
varying vec3 vWorld; varying vec3 vN; varying vec2 vUv;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vN = normalize((vec4(normalMatrix * normal, 0.0) * viewMatrix).xyz);
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const FRAG = /* glsl */`
uniform sampler2D uNoise;
uniform vec3 uColor, uBleed, uPaper, uInk, uSeed, uLight;
uniform float uProgress, uRadius, uHatch, uPool, uVivid, uWater, uTime, uPx, uScale;
varying vec3 vWorld; varying vec3 vN; varying vec2 vUv;

float strokes(float h, float lw){
  float w = fwidth(h) * 1.2;
  float t = abs(fract(h) - 0.5) * 2.0;
  float l = 1.0 - smoothstep(lw - w, lw + w, t);
  return mix(l, lw, clamp(w * 1.5 - 0.3, 0.0, 1.0));
}

void main(){
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 an = abs(N);
  vec2 wuv = (an.y > an.x && an.y > an.z) ? vWorld.xz : (an.x > an.z ? vWorld.zy : vWorld.xy);
  wuv *= uScale;

  float grain  = texture2D(uNoise, gl_FragCoord.xy / (uPx * 190.0)).r;
  float blotch = texture2D(uNoise, wuv * 0.045).g;
  float mid    = texture2D(uNoise, wuv * 0.17 + 0.3).b;
  float shade  = 1.0 - (dot(N, uLight) * 0.5 + 0.5);

  vec3 paper = uPaper * (0.93 + 0.09 * grain);

  // pencil hatching in the shaded areas
  float a1 = smoothstep(0.50, 0.68, shade);
  float h1 = strokes((wuv.x * 0.8 + wuv.y) * 2.6 + blotch * 1.2, 0.22) * a1 * smoothstep(0.15, 0.45, mid);
  float a2 = smoothstep(0.74, 0.9, shade);
  float h2 = strokes((wuv.x - wuv.y * 0.7) * 2.6 + mid, 0.2) * a2;
  float hatch = clamp(h1 + h2, 0.0, 1.0) * uHatch;
  if (uWater > 0.5) {
    float hw = wuv.y * 0.55 + sin(wuv.x * 0.45 + uTime * 0.5 + blotch * 4.0) * 0.3 + uTime * 0.12;
    float brk = texture2D(uNoise, wuv * vec2(0.012, 0.09) + vec2(uTime * 0.004, 0.0)).g;
    hatch = strokes(hw, 0.10) * smoothstep(0.5, 0.72, brk) * 0.9;
  }

  // wet paint front spreading from the seed
  float d = distance(vWorld, uSeed) / uRadius + blotch * 0.45 + mid * 0.15;
  float front = uProgress * 2.3 - 0.1;
  float m   = 1.0 - smoothstep(front - 0.05, front, d);
  float wet = m * smoothstep(front - 0.55, front, d);
  float rim = m * smoothstep(front - 0.11, front - 0.04, d);
  float damp = (1.0 - m) * (1.0 - smoothstep(front, front + 0.25, d)) * step(0.001, uProgress);

  // the wash itself
  vec3 col = mix(uColor, uBleed, smoothstep(0.45, 0.9, blotch) * 0.45);
  float strength = mix((0.8 + 0.2 * mid) * (0.86 + 0.26 * grain), 1.0, uVivid);
  vec2 e = min(vUv, 1.0 - vUv);
  float pool = uPool * (1.0 - smoothstep(0.0, 0.06 + 0.05 * mid, min(e.x, e.y)));
  float gran = 1.0 - smoothstep(0.0, 0.035, abs(blotch - 0.5));
  vec3 wash = mix(vec3(1.0), col, strength);
  wash *= 1.0 - 0.22 * pool - 0.10 * gran * (1.0 - uVivid) - 0.22 * wet - 0.42 * rim;
  float sh = smoothstep(0.55, 0.68, shade + (mid - 0.5) * 0.06);
  wash *= mix(vec3(1.0), vec3(0.62, 0.6, 0.8), sh * 0.7);
  vec3 painted = mix(paper, vec3(0.97), uVivid * 0.6) * wash;

  vec3 c = mix(paper * (1.0 - 0.07 * damp), painted, m);
  c = mix(c, uInk, hatch * mix(0.5, 0.3, m));
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;

export function washMaterial(o = {}) {
  const paint = o.paint || newPaint();
  return new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: o.side ?? THREE.FrontSide,
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
    uniforms: {
      uNoise: shared.uNoise, uPaper: shared.uPaper, uInk: shared.uInk, uLight: shared.uLight,
      uTime: shared.uTime, uPx: shared.uPx,
      uProgress: paint.uProgress, uSeed: paint.uSeed, uRadius: paint.uRadius,
      uColor: { value: new THREE.Color(o.color ?? '#ffffff') },
      uBleed: { value: new THREE.Color(o.bleed ?? o.color ?? '#ffffff') },
      uHatch: { value: o.hatch ?? 1 }, uPool: { value: o.pool ?? 0 }, uVivid: { value: o.vivid ?? 0 },
      uWater: { value: o.water ?? 0 }, uScale: { value: o.scale ?? 1 },
    },
  });
}

// ---- ink: wobbly fat lines along the hard edges ----
export const inkMaterial = new LineMaterial({ color: new THREE.Color(S.ink.color), linewidth: S.ink.lineWidth });

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _d = new THREE.Vector3();
export function addInk(parent, meshes, o = {}) {
  const r = rng(o.seed ?? 99), jit = o.jitter ?? 0.035, pos = [];
  const j = () => (r() - 0.5) * 2 * jit;
  for (const mesh of meshes) {
    mesh.updateMatrix();
    const e = new THREE.EdgesGeometry(mesh.geometry, o.threshold ?? 30).attributes.position;
    for (let i = 0; i < e.count; i += 2) {
      _a.fromBufferAttribute(e, i).applyMatrix4(mesh.matrix);
      _b.fromBufferAttribute(e, i + 1).applyMatrix4(mesh.matrix);
      _d.subVectors(_b, _a);
      const len = _d.length(); if (len < 1e-4) continue;
      const strokesN = len > 0.6 && r() < 0.55 ? 2 : 1;
      for (let s = 0; s < strokesN; s++) {
        const ov = Math.min(len * 0.05, 0.22) * (0.4 + r()) / len;
        pos.push(_a.x - _d.x * ov + j(), _a.y - _d.y * ov + j(), _a.z - _d.z * ov + j(),
                 _b.x + _d.x * ov + j(), _b.y + _d.y * ov + j(), _b.z + _d.z * ov + j());
      }
    }
  }
  const line = new LineSegments2(new LineSegmentsGeometry().setPositions(pos), inkMaterial);
  parent.add(line);
  return line;
}

// ---- ink outline for round shapes (expanded back faces) ----
const HULL_VERT = /* glsl */`
uniform float uW; uniform vec2 uRes;
void main(){
  vec4 c = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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
export function addHull(mesh, width = S.ink.lineWidth) {
  const m = hullMats[width] ||= new THREE.ShaderMaterial({
    vertexShader: HULL_VERT, fragmentShader: HULL_FRAG, side: THREE.BackSide,
    uniforms: { uW: { value: width }, uRes: shared.uRes, uInk: shared.uInk },
  });
  const h = new THREE.Mesh(mesh.geometry, m);
  mesh.add(h);
  return h;
}

export function setResolution(w, h, px) {
  shared.uRes.value.set(w, h);
  shared.uPx.value = px;
  inkMaterial.resolution.set(w, h);
}
