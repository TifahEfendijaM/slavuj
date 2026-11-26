// Drawing the frame. Every look renders straight to the screen, except the pixel art trial: that is drawn into a
// picture a few times smaller than the screen (no smoothing, outlines one pixel wide) and scaled up with sharp pixels.
import * as THREE from 'three';
import { look, setResolution } from './paper.js';

const PIX = 3;      // screen pixels (CSS) per pixel of the pixel art

const VERT = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FRAG = /* glsl */`uniform sampler2D tColor; varying vec2 vUv;
void main(){ gl_FragColor = texture2D(tColor, vUv);
  #include <colorspace_fragment>
}`;

export function createDraw(renderer) {
  const rt = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false });
  rt.texture.colorSpace = THREE.SRGBColorSpace;
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: { tColor: { value: rt.texture } }, depthTest: false, depthWrite: false }));
  quad.frustumCulled = false;
  const post = new THREE.Scene(); post.add(quad); const flat = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    draw(scene, camera) {
      if (look.style !== 'pixel') { renderer.render(scene, camera); return; }
      renderer.setRenderTarget(rt); renderer.render(scene, camera);
      renderer.setRenderTarget(null); renderer.render(post, flat);
    },
    // after the usual sizes are set: the pixel art draws at its small size, with outlines about one of its pixels wide
    resize(w, h) {
      if (look.style !== 'pixel') return;
      const lw = Math.max(1, Math.round(w / PIX)), lh = Math.max(1, Math.round(h / PIX));
      rt.setSize(lw, lh); setResolution(lw * 1.15, lh * 1.15, 1);      // (outlines come out about one and a half of its pixels wide: thinner ones break up)
    },
  };
}
