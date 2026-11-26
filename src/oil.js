// The oil paint trial's last step (only with the 'oil' style, see settings.js): the picture is painted into a buffer, then
// smeared into flat dabs of colour with an edge-keeping (Kuwahara) filter, the way oil paint sits in patches. The ink
// (outlines and the thick lines round people and trees) is drawn afterwards, on top and sharp, against the same depth,
// so it is never smeared away. With the watercolour style draw() is just renderer.render().
// (The look can be switched while playing: pause menu, "Style".)
import * as THREE from 'three';
import { look } from './paper.js';

const INK = 1;      // the layer the ink is moved to

const VERT = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FRAG = /* glsl */`
uniform sampler2D tColor, tDepth; uniform vec2 uTexel; uniform float uStep;
varying vec2 vUv;
void main(){
  // four overlapping squares round the pixel; the pixel takes the average colour of the calmest one
  vec3 m0 = vec3(0.0), m1 = vec3(0.0), m2 = vec3(0.0), m3 = vec3(0.0), s0 = vec3(0.0), s1 = vec3(0.0), s2 = vec3(0.0), s3 = vec3(0.0);
  const int R = 4;
  for (int j = -R; j <= R; j++) for (int i = -R; i <= R; i++) {
    vec3 c = texture2D(tColor, vUv + vec2(float(i), float(j)) * uTexel * uStep).rgb, c2 = c * c;
    if (i <= 0 && j <= 0) { m0 += c; s0 += c2; }
    if (i >= 0 && j <= 0) { m1 += c; s1 += c2; }
    if (i <= 0 && j >= 0) { m2 += c; s2 += c2; }
    if (i >= 0 && j >= 0) { m3 += c; s3 += c2; }
  }
  float n = float((R + 1) * (R + 1));
  m0 /= n; m1 /= n; m2 /= n; m3 /= n;
  vec3 v0 = s0 / n - m0 * m0, v1 = s1 / n - m1 * m1, v2 = s2 / n - m2 * m2, v3 = s3 / n - m3 * m3;
  float a0 = v0.r + v0.g + v0.b, a1 = v1.r + v1.g + v1.b, a2 = v2.r + v2.g + v2.b, a3 = v3.r + v3.g + v3.b;
  vec3 col = m0; float best = a0;
  if (a1 < best) { best = a1; col = m1; }
  if (a2 < best) { best = a2; col = m2; }
  if (a3 < best) { best = a3; col = m3; }
  gl_FragColor = vec4(col, 1.0);
  gl_FragDepth = texture2D(tDepth, vUv).x;
  #include <colorspace_fragment>
}`;

export function createDraw(renderer) {
  const rt = new THREE.WebGLRenderTarget(1, 1, { samples: 4, depthTexture: new THREE.DepthTexture(1, 1) });
  rt.texture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, depthTest: true, depthFunc: THREE.AlwaysDepth, depthWrite: true,      // (with the test off, GL writes no depth)
    uniforms: { tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture }, uTexel: { value: new THREE.Vector2(1, 1) }, uStep: { value: 1 } },
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); quad.frustumCulled = false;
  const post = new THREE.Scene(); post.add(quad); const flat = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  let n = 0;
  const sortInk = (scene) => scene.traverse((o) => {
    if (o.layers.mask !== 1) return;
    const m = o.material;
    if (o.isLineSegments2 || o.isLine2 || (m && m.isShaderMaterial && m.uniforms?.uW && m.side === THREE.BackSide)) o.layers.set(INK);
  });
  return {
    draw(scene, camera) {
      if (!look.oil) { const k = camera.layers.mask; camera.layers.enable(INK); renderer.render(scene, camera); camera.layers.mask = k; return; }      // (ink already moved to its layer stays seen)
      if (n++ % 30 === 0) sortInk(scene);      // (new things, such as the finale's, are found within half a second)
      const keep = camera.layers.mask;
      camera.layers.set(0); renderer.setRenderTarget(rt); renderer.render(scene, camera);
      renderer.setRenderTarget(null); renderer.render(post, flat);
      const ac = renderer.autoClear; renderer.autoClear = false;
      camera.layers.set(INK); renderer.render(scene, camera);
      renderer.autoClear = ac; camera.layers.mask = keep;
    },
    resize(w, h, px) {
      rt.setSize(Math.round(w * px), Math.round(h * px));
      mat.uniforms.uTexel.value.set(1 / (w * px), 1 / (h * px)); mat.uniforms.uStep.value = Math.max(1, px * 0.85);
    },
  };
}
