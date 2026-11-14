import * as THREE from 'three';
import '@fontsource/caveat/latin-700.css';
import '@fontsource/caveat/latin-ext-700.css';
import '@fontsource/patrick-hand/latin-400.css';
import '@fontsource/patrick-hand/latin-ext-400.css';
import S from './settings.js';
import { shared, setResolution } from './paper.js';
import { buildWorld } from './world.js';
import { createBird } from './bird.js';
import { Flight } from './flight.js';
import * as audio from './audio.js';

const $ = (id) => document.getElementById(id);
const clamp = THREE.MathUtils.clamp;
const k = (rate, dt) => 1 - Math.exp(-rate * dt);
const smooth = (x) => x * x * (3 - 2 * x);

// ---------- scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(S.colors.paper);
document.body.prepend(renderer.domElement);
const canvas = renderer.domElement;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(S.camera.fov, 1, 0.1, 2000);

const world = buildWorld(scene);
const bird = createBird();
scene.add(bird.root);
const flight = new Flight(world.colliders, bird.perchHeight);

function resize() {
  const w = innerWidth, h = innerHeight, px = Math.min(devicePixelRatio, 2);
  renderer.setPixelRatio(px); renderer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  setResolution(w, h, px);
}
addEventListener('resize', resize); resize();

// ---------- the orb ----------
const orbDef = world.orbs[0];
const orb = new THREE.Group();
{
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,214,60,0.95)'); grad.addColorStop(0.35, 'rgba(255,196,30,0.5)'); grad.addColorStop(1, 'rgba(255,190,30,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthWrite: false, transparent: true }));
  halo.scale.setScalar(2.6);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 14), new THREE.MeshBasicMaterial({ color: '#ffd21f' }));
  const shine = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), new THREE.MeshBasicMaterial({ color: '#fff3b0' }));
  shine.position.set(-0.08, 0.09, 0.08);
  orb.add(halo, core, shine);
}
const orbHome = orbDef.perch.clone(); orbHome.y += S.orb.hoverHeight;
orb.position.copy(orbHome); scene.add(orb);
let orbAlive = true;

// ---------- state ----------
let state = 'play';           // play | words | cutscene
let started = false, locked = false, noLock = false, singing = false, cut = null, time = 0;
const inp = { dx: 0, dy: 0, turn: 0, tilt: 0, flap: false, dive: false, takeoff: false };
const keys = new Set();

flight.placeAt(world.start.x, world.start.z, Math.atan2(orbDef.centre.x - world.start.x, orbDef.centre.z - world.start.z));
flight.onLand = (obj) => { if (orbAlive && orbDef.meshes.includes(obj)) flight.hopTo(orbDef.perch); };

const atOrb = () => orbAlive && flight.mode === 'perched' && !flight.hop &&
  (orbDef.meshes.includes(flight.landedOn) || Math.hypot(flight.pos.x - orbDef.centre.x, flight.pos.z - orbDef.centre.z) < S.orb.nearRadius);

// ---------- input ----------
function lock() {
  audio.unlock();
  if (noLock) return;
  try { const p = canvas.requestPointerLock(); p?.catch?.(() => { noLock = true; }); } catch (e) { noLock = true; }
}
$('start').addEventListener('click', () => { started = true; $('start').style.display = 'none'; lock(); });
canvas.addEventListener('click', () => { if (started && state !== 'words') lock(); });
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; });
document.addEventListener('pointerlockerror', () => { noLock = true; });
document.addEventListener('mousemove', (e) => { if (locked) { inp.dx += e.movementX; inp.dy += e.movementY; } });
addEventListener('keydown', (e) => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  keys.add(e.code);
  if (!started) return;
  if (state === 'play') {
    if (e.code === 'Space') inp.takeoff = true;
    if (e.code === 'KeyE' && atOrb()) openWords();
  } else if (state === 'words') {
    if (e.code === 'Escape' || e.code === 'KeyE') closeWords();
    const n = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code);
    if (n >= 0) pick(n);
  }
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());

// ---------- word list ----------
const wordsEl = $('words'), listEl = $('wordList');
const struck = new Set();
let busy = false;
function openWords() {
  state = 'words'; document.exitPointerLock?.();
  listEl.innerHTML = '';
  orbDef.choices.forEach((w, i) => {
    const b = document.createElement('button');
    b.innerHTML = `<small>${i + 1}</small>${w}`;
    if (struck.has(i)) { b.classList.add('wrong'); b.disabled = true; }
    b.addEventListener('click', () => pick(i));
    listEl.append(b);
  });
  wordsEl.classList.remove('off');
}
function closeWords() { state = 'play'; wordsEl.classList.add('off'); }
async function pick(i) {
  if (busy || state !== 'words' || struck.has(i) || i >= orbDef.choices.length) return;
  const b = listEl.children[i], word = orbDef.choices[i];
  busy = true; wordsEl.classList.add('busy'); b.classList.add('speaking'); singing = true;
  audio.unlock();
  const right = word === orbDef.word;
  if (right) lock();                      // grab the mouse again while we still have the click
  await audio.speak(word);                // the result only shows after the bird has said it
  singing = false; b.classList.remove('speaking');
  if (right) {
    b.classList.add('right');
    await new Promise((r) => setTimeout(r, 450));
    wordsEl.classList.add('off');
    startCutscene();
  } else {
    struck.add(i); b.classList.add('wrong'); b.disabled = true;
  }
  busy = false; wordsEl.classList.remove('busy');
}

// ---------- colouring cutscene ----------
const look = new THREE.Vector3();
async function fadeCut(fn) {
  $('fade').classList.add('on'); await new Promise((r) => setTimeout(r, 230));
  fn(); $('fade').classList.remove('on');
}
function startCutscene() {
  state = 'cutscene';
  fadeCut(() => {
    document.body.classList.add('cine');
    cut = { t: 0 }; singing = true;
    audio.song(S.cutscene.duration - 0.5).then(() => { singing = false; });
  });
}
function updateCutscene(dt) {
  const c = S.cutscene, cam = orbDef.cam;
  cut.t += dt;
  const e = smooth(clamp(cut.t / c.duration, 0, 1));
  camera.position.lerpVectors(cam.from, cam.to, e);
  camera.lookAt(look.lerpVectors(cam.lookFrom, cam.lookTo, e));
  camera.fov = c.fov; camera.updateProjectionMatrix();
  // the orb sinks into the roof and becomes the first drop of paint
  const drop = clamp(cut.t / c.paintDelay, 0, 1);
  orb.position.lerpVectors(orbHome, orbDef.paint.uSeed.value, smooth(drop));
  orb.scale.setScalar(1 - 0.9 * drop); orb.visible = drop < 1;
  const p = clamp((cut.t - c.paintDelay) / c.paintDuration, 0, 1);
  orbDef.paint.uProgress.value = 1 - Math.pow(1 - p, 1.5);
  if (cut.t >= c.duration && !cut.ending) {
    cut.ending = true;
    fadeCut(() => {
      cut = null; orbAlive = false; scene.remove(orb); singing = false;
      document.body.classList.remove('cine');
      camera.fov = S.camera.fov; camera.updateProjectionMatrix();
      camSnap = true; state = 'play';
    });
  }
}

// ---------- camera ----------
const camPos = new THREE.Vector3(), camWant = new THREE.Vector3(), camLook = new THREE.Vector3(), tmp = new THREE.Vector3();
const camRay = new THREE.Raycaster();
let camSnap = true;
function updateCamera(dt) {
  const perched = flight.mode === 'perched';
  const elev = perched ? flight.camElev : 0.22 - flight.pitch * 0.55;
  const dist = S.camera.distance, ce = Math.cos(elev);
  camLook.copy(flight.pos); camLook.y += 0.7;
  camWant.set(flight.pos.x - Math.sin(flight.camYaw) * ce * dist, flight.pos.y + 0.7 + Math.sin(elev) * dist, flight.pos.z - Math.cos(flight.camYaw) * ce * dist);
  if (camSnap) { camPos.copy(camWant); camSnap = false; } else camPos.lerp(camWant, k(S.camera.smooth, dt));
  camera.position.copy(camPos);
  // keep walls from coming between the camera and the bird
  tmp.subVectors(camPos, camLook); const len = tmp.length(); tmp.normalize();
  camRay.set(camLook, tmp); camRay.far = len;
  const hit = camRay.intersectObjects(world.colliders, false)[0];
  if (hit) camera.position.copy(camLook).addScaledVector(tmp, Math.max(0.6, hit.distance - 0.3));
  camera.lookAt(camLook);
  const f = S.flight, boost = perched ? 0 : clamp((flight.speed - f.cruiseSpeed) / (f.maxSpeed - f.cruiseSpeed), 0, 1);
  const fov = S.camera.fov + boost * S.camera.diveFovBoost;
  if (Math.abs(camera.fov - fov) > 0.01) { camera.fov += (fov - camera.fov) * k(4, dt); camera.updateProjectionMatrix(); }
}

// ---------- hints ----------
const hintEl = $('hint');
let lastHint = '';
function hint(html) {
  if (html === lastHint) return; lastHint = html;
  if (html) { hintEl.innerHTML = html; hintEl.classList.remove('off'); } else hintEl.classList.add('off');
}
function updateHint() {
  if (!started || state !== 'play') return hint('');
  if (!locked && !noLock) return hint('Click to keep flying');
  if (flight.mode === 'perched') {
    if (atOrb()) return hint('<kbd>E</kbd> open the word list');
    return hint('<kbd>Space</kbd> take off' + (orbAlive ? ' · fly to the glowing orb and land on the house' : ''));
  }
  hint('');
}

// ---------- loop ----------
const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  time += dt; shared.uTime.value = time;
  inp.turn = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
  inp.tilt = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
  inp.flap = keys.has('Space'); inp.dive = keys.has('ShiftLeft') || keys.has('ShiftRight');

  if (state === 'play' && started && (locked || noLock)) flight.update(dt, inp);
  inp.dx = inp.dy = 0; inp.takeoff = false;

  bird.root.position.copy(flight.pos);
  bird.root.rotation.set(-flight.pitch, flight.yaw, flight.roll);
  bird.update(dt, { mode: flight.mode, flapping: flight.flapping, diving: flight.diving, sing: singing });

  if (orbAlive && !cut) {
    orb.position.y = orbHome.y + Math.sin(time * 1.8) * 0.25;
    orb.scale.setScalar(1 + Math.sin(time * 3.1) * 0.06);
  }
  if (cut) updateCutscene(dt); else updateCamera(dt);
  updateHint();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();

// for testing from the console
window.__game = { flight, inp, keys, orbDef, world, camera, S, get state() { return state; },
  start() { started = true; noLock = true; $('start').style.display = 'none'; }, openWords, pick, startCutscene };
