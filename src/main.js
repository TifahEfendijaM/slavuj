import * as THREE from 'three';
import '@fontsource/caveat/latin-700.css';
import '@fontsource/caveat/latin-ext-700.css';
import '@fontsource/patrick-hand/latin-400.css';
import '@fontsource/patrick-hand/latin-ext-400.css';
import S from './settings.js';
import { shared, setResolution, tags, tag, SUN_DIR, paintGeo, washMat, addHull } from './paper.js';
import { buildWorld, BANK } from './world.js';
import { createBird } from './bird.js';
import { createDiver } from './diver.js';
import { createPeople } from './people.js';
import { rng } from './paper.js';
import journalArt from '../assets/journal-mostar.webp';
import { Flight } from './flight.js';
import * as audio from './audio.js';
import { WORDS, ORDER, CULTURE } from './vocab.js';

const $ = (id) => document.getElementById(id);
const clamp = THREE.MathUtils.clamp, V = (x, y, z) => new THREE.Vector3(x, y, z);
const k = (rate, dt) => 1 - Math.exp(-rate * dt);
const smooth = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SPEAKER = '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#3b352f"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#3b352f" stroke-width="1.8" stroke-linecap="round"/></svg>';

// ---------- scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(S.colors.paper);
document.body.prepend(renderer.domElement);
const canvas = renderer.domElement;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(S.camera.fov, 1, 0.1, 2000);
const world = buildWorld(scene);
const bird = createBird(); scene.add(bird.root);
const diver = createDiver(world.diverPos); scene.add(diver.root);
const people = createPeople(scene, world, rng(41));
const flight = new Flight(world.colliders, bird);
people.onScatter = () => audio.flutter();
// the postman's knocks are heard only nearby
people.onKnock = (p) => { if (live) audio.knock(clamp(1 - flight.pos.distanceTo(p) / 22, 0, 1)); };
// animal sounds are quiet and only heard close to the animal: they fade out quickly with distance
const nearGain = (p, r) => clamp(1 - flight.pos.distanceTo(p) / r, 0, 1) ** 1.6;
people.onNeigh = (p) => { if (live) audio.neigh(nearGain(p, 22)); };
people.onMeow = (p) => { if (live) audio.meow(nearGain(p, 11)); };
// the spectators on the bridge: they keep applauding now and then after the finale, heard from nearby
const crowd = (() => { const w = world.people.filter((p) => p.kind === 'watch'), c = V(0, 0, 0); for (const p of w) c.add(V(p.x, p.y, p.z)); return c.multiplyScalar(1 / Math.max(1, w.length)); })();
let clapWait = 6;
let live = false;

function resize() {
  const w = innerWidth, h = innerHeight, px = Math.min(devicePixelRatio, 2);
  renderer.setPixelRatio(px); renderer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix(); setResolution(w, h, px);
}
addEventListener('resize', resize); resize();

// ---------- progress (kept between visits) ----------
const params = new URLSearchParams(location.search), fresh = params.has('fresh');
const KEY = 'slavuj-mostar-1' + (params.get('slot') ? '-' + params.get('slot') : '');   // ?slot=name keeps a separate save
let save = { done: [], finale: false };
try { if (!fresh) save = { ...save, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { /* no storage */ }
const store = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* no storage */ } };
const painting = new Set();
// journal photos: one frame grabbed from each word's own colouring scene, stored beside the save
const PICS = KEY + '-pics';
// photos from a full play-through that ship with the game: shown for any word whose scene the player
// skipped or never saw (skip to the finale). The player's own photo always wins.
const BUNDLED = Object.fromEntries(Object.entries(import.meta.glob('../assets/photos/*.jpg', { eager: true, query: '?url', import: 'default' })).map(([p, u]) => [p.split('/').pop().slice(0, -4), u]));
let pics = {}, snapId = null;
try { if (!fresh) pics = JSON.parse(localStorage.getItem(PICS) || '{}'); } catch (e) { /* no storage */ }
function keepPic(id, data) { if (!data) return; pics[id] = data; try { localStorage.setItem(PICS, JSON.stringify(pics)); } catch (e) { /* storage full: the photo still shows this session */ } }
function grabFrame() {
  const c = document.createElement('canvas'), W = canvas.width, H = canvas.height; if (!(W > 0 && H > 0)) return '';
  const cw = Math.min(W, H * 1.5), ch = cw / 1.5; c.width = 420; c.height = 280;
  c.getContext('2d').drawImage(canvas, (W - cw) / 2, (H - ch) / 2, cw, ch, 0, 0, 420, 280);
  return c.toDataURL('image/jpeg', 0.74);
}
const paint = (name, instant) => { const t = tag(name); t.painted = true; if (instant) t.uT.value = 1e5; else { t.uT.value = 0; painting.add(t); } };

// ---------- orbs ----------
function blobTexture(soft) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,214,60,0.95)'); grad.addColorStop(0.35, 'rgba(255,196,30,0.5)'); grad.addColorStop(1, 'rgba(255,190,30,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  if (!soft) { // a ragged edge, so the glow seems to dissolve as it spreads
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 46; i++) { const a = Math.random() * 6.28, r = 30 + Math.random() * 34, s = 4 + Math.random() * 11; g.beginPath(); g.arc(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, s, 0, 6.28); g.fill(); }
  }
  return new THREE.CanvasTexture(c);
}
const haloTex = blobTexture(true), wispTex = blobTexture(false);
const coreGeo = new THREE.SphereGeometry(0.3, 20, 14), shineGeo = new THREE.SphereGeometry(0.17, 14, 10);
function orbVisual() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ color: '#ffd21f', transparent: true }));
  const shine = new THREE.Mesh(shineGeo, new THREE.MeshBasicMaterial({ color: '#fff3b0', transparent: true })); shine.position.set(-0.08, 0.09, 0.08);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, depthWrite: false, transparent: true })); halo.scale.setScalar(2.6);
  const wisp = new THREE.Sprite(new THREE.SpriteMaterial({ map: wispTex, depthWrite: false, transparent: true, opacity: 0 })); wisp.scale.setScalar(2.6);
  g.add(halo, wisp, core, shine); g.userData = { core, shine, halo, wisp }; g.visible = false; scene.add(g);
  return g;
}
const orbs = world.orbs.map((def) => ({ def, id: def.id, w: WORDS[def.id], vis: orbVisual(), alive: false, done: save.done.includes(def.id), struck: new Set(), grow: 0 }));
const byId = Object.fromEntries(orbs.map((o) => [o.id, o]));
// people and animals face somewhere: their scenes are filmed from in front of them (the way they face, averaged for a group)
for (const o of orbs) if (o.def.front === undefined) {
  const who = [...world.people, ...world.animals].filter((p) => o.def.tags.includes(p.tag)); let fx = 0, fz = 0;
  for (const p of who) { fx += Math.sin(p.ry || 0); fz += Math.cos(p.ry || 0); }
  if (who.length && Math.hypot(fx, fz) > who.length * 0.5) o.def.front = Math.atan2(fx, fz);
}
for (const o of orbs) { o.vis.position.copy(o.def.at); if (o.done) for (const t of o.def.tags) paint(t, true); }
const FIRST = orbs.find((o) => o.def.stage === 0);     // the one word to learn before the others appear
const available = (o) => !o.done && (o.def.stage === 0 || (FIRST.done && (o.def.requires || []).every((r) => byId[r].done) &&
  (o.def.stage === 1 || orbs.every((x) => x.done || x.def.stage === 2))));
function refreshOrbs(announce) {
  let n = 0;
  for (const o of orbs) if (available(o) && !o.alive) { o.alive = true; o.vis.visible = true; o.grow = 0; n++; }
  if (announce && n) audio.orbsAppear();
  return n;
}
const allDone = () => orbs.every((o) => o.done);
function showFleur() { if (allDone() && !save.finale && !fleur.visible) { fleur.visible = true; fleurGrow = 0; audio.orbsAppear(); say('Something golden is shining high above the bridge. Fly through it.', 9); } }

// the golden fleur-de-lis that starts the finale
const fleur = new THREE.Group();
{
  const p = new THREE.Path(); p.moveTo(0, 1.6); p.quadraticCurveTo(0.6, 0.95, 0.17, 0.08); p.quadraticCurveTo(0.5, 0.9, 0.95, 0.78); p.quadraticCurveTo(1.32, 0.45, 0.9, 0.05);
  p.quadraticCurveTo(0.95, 0.4, 0.6, 0.35); p.quadraticCurveTo(0.42, 0.3, 0.42, 0); p.lineTo(0.42, -0.22); p.lineTo(0.3, -0.22); p.quadraticCurveTo(0.5, -0.7, 0.8, -0.9); p.quadraticCurveTo(0.35, -1.0, 0, -1.35);
  const half = p.getPoints(8), pts = [...half, ...half.slice(1, -1).reverse().map((q) => new THREE.Vector2(-q.x, q.y))];
  const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 0.24, bevelEnabled: false }).translate(0, 0, -0.12);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: '#f5b81c', transparent: true }));
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 40), new THREE.LineBasicMaterial({ color: '#8a5a10', transparent: true }));
  const band = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.24, 0.34), new THREE.MeshBasicMaterial({ color: '#ffe07a', transparent: true })); band.position.y = -0.11;
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, depthWrite: false, transparent: true })); halo.scale.setScalar(6);
  fleur.add(halo, m, e, band); fleur.userData = { parts: [m, e, band, halo] };
  fleur.scale.setScalar(2.3); fleur.position.copy(world.fleur); fleur.visible = false; scene.add(fleur);
}

// the hands of the clock tower: they appear once the clock has been coloured, showing half past eight
const hands = new THREE.Group(); hands.visible = byId.sat.done; scene.add(hands);
{
  const mat = washMat('time'), f = byId.pola.def.focus, seed = [f.x, f.y, f.z];
  for (const ry of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const g = new THREE.Group(); g.position.set(59.5, BANK + 18.5, -15); g.rotation.y = ry; hands.add(g);
    [[0.52, 0.15, (8.5 / 12) * Math.PI * 2, 2.42], [0.86, 0.1, Math.PI, 2.47]].forEach(([len, w, ang, z]) => {
      const m = new THREE.Mesh(paintGeo(new THREE.BoxGeometry(w, len, 0.05).translate(0, len / 2 - 0.07, 0), { col: '#2c2622', bleed: '#4a3a30', seed, radius: 7, dur: 2.6, hatch: 0 }), mat);
      m.rotation.z = -ang; m.position.z = z; addHull(m, 1.4); g.add(m);
    });
  }
  if (byId.pola.done) tag('time').uT.value = 1e5;
}

// ---------- state ----------
let state = 'play';           // play | words | cutscene | journal | finale
let started = false, locked = false, noLock = false, paused = false, singing = false, time = 0, cut = null, fin = null, current = null;
let toast = '', toastT = 0, freeSingT = 0, fleurGrow = 1, singTok = 0, nextCheer = 0;
const inp = { dx: 0, dy: 0, turn: 0, tilt: 0, flap: false, dive: false, takeoff: false, pointer: null };
const keys = new Set(), mouse = { x: innerWidth / 2, y: innerHeight / 2 };
const fx = [];

flight.placeAt(world.start.x, world.start.z, Math.atan2(FIRST.def.focus.x - world.start.x, FIRST.def.focus.z - world.start.z));

// which orb the bird has landed at: the object it stands on, or the nearest one it stands beside
function orbHere() {
  if (flight.mode !== 'perched' && flight.mode !== 'swim') return null;
  // something small it stands beside comes first, then the thing it stands on.
  // Water words (river, creek) open only while it floats on that water.
  let best = null, bd = 1e9;
  for (const o of orbs) if (o.alive) {
    const z = o.def.swim, n = o.def.near;
    if (z) { if (flight.mode !== 'swim') continue; const d = Math.hypot(flight.pos.x - z.p[0], flight.pos.z - z.p[2]); if (d < z.r && Math.abs(flight.waterY - z.p[1]) < 1 && d + 3 < bd) { best = o; bd = d + 3; } }
    else if (n) { const d = flight.pos.distanceTo(V(...n.p)); if (d < n.r && d < bd) { best = o; bd = d; } }
  }
  if (!best && flight.mode === 'perched') best = [].concat(flight.landedOn?.userData.orb || []).map((id) => byId[id]).find((o) => o?.alive) || null;
  return best;
}

// ---------- input ----------
function lock() {
  audio.unlock();
  if (noLock) return;
  try { const p = canvas.requestPointerLock(); p?.catch?.(() => { noLock = true; paused = false; }); } catch (e) { noLock = true; }
}
function resume() { paused = false; if (!noLock) { lock(); setTimeout(() => { if (!locked && !noLock && state === 'play') paused = true; }, 250); } }
$('start').addEventListener('click', (e) => {
  if (e.target.closest('a,button')) return;
  started = true; $('start').classList.add('off'); $('hud').classList.remove('off'); lock(); refreshOrbs(false); updateLegend(); showFleur();
  if (save.finale) audio.setLife({ wind: 1, water: 1, birds: true, city: true });
});
function reload() { if (!fresh) return location.reload(); params.delete('fresh'); const q = params.toString(); location.href = location.pathname + (q ? '?' + q : ''); }
function restartLevel() { try { localStorage.removeItem(KEY); localStorage.removeItem(PICS); } catch (e) { /* */ } reload(); }
// for testing: everything coloured and every word collected, only the fleur-de-lis and the finale left
function skipToFinale() { save = { done: orbs.map((o) => o.id), finale: false }; store(); reload(); }
$('reset').addEventListener('click', restartLevel);
for (const [id, fn] of [['restart', restartLevel], ['toFinale', skipToFinale]]) {
  const b = $(id), label = b.textContent; let armed = 0;
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    if (armed) return fn();
    armed = 1; b.textContent = 'Sure? Click again'; b.classList.add('armed');
    setTimeout(() => { armed = 0; b.textContent = label; b.classList.remove('armed'); }, 3500);
  });
}
if (save.done.length) $('resetWrap').style.display = '';
canvas.addEventListener('click', () => { if (started && state === 'play') resume(); });
// holding the mouse button tucks the wings for a dive
let mouseDown = false;
canvas.addEventListener('mousedown', (e) => { if (e.button === 0 && started && state === 'play' && !paused && (locked || noLock)) mouseDown = true; });
addEventListener('mouseup', () => { mouseDown = false; }); addEventListener('blur', () => { mouseDown = false; });
$('pause').addEventListener('click', resume);
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  if (locked) paused = false; else if (started && state === 'play' && !noLock) paused = true;
  updateLegend();
});
document.addEventListener('pointerlockerror', () => { noLock = true; paused = false; updateLegend(); });
document.addEventListener('mousemove', (e) => {
  if (locked || (noLock && started && state === 'play' && !paused)) { inp.dx += e.movementX; inp.dy += e.movementY; }
  mouse.x = e.clientX; mouse.y = e.clientY;
});
addEventListener('keydown', (e) => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  keys.add(e.code);
  if (!started) return;
  audio.unlock();
  if (state === 'play') {
    if (e.code === 'Escape') { paused = !paused; return; }
    if (paused) { if (e.code === 'Space' || e.code === 'Enter') resume(); return; }
    if (e.code === 'Space') inp.takeoff = true;
    if (e.code === 'KeyE') { const o = orbHere(); if (o) openWords(o); }
    if (e.code === 'KeyJ' || e.code === 'Tab') openJournal();
    if (e.code === 'KeyF') { audio.chirp(); freeSingT = 0.35; }
  } else if (state === 'words') {
    if (e.code === 'Escape' || e.code === 'KeyE') closeWords();
    const n = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code);
    if (n >= 0) pick(n);
  } else if (state === 'journal') {
    if (!$('card').classList.contains('off')) $('card').classList.add('off'); else if (['Escape', 'KeyJ', 'Tab', 'Enter'].includes(e.code)) closeJournal();
  } else if (e.code === 'Enter') skipScene();
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
function updateLegend() { /* the controls are listed on the pause card */ }

// ---------- word list ----------
const wordsEl = $('words'), listEl = $('wordList');
let busy = false;
const markSvg = (cls, paths) => `<svg class="mark ${cls}" viewBox="0 0 100 20" preserveAspectRatio="none">${paths.map((d) => `<path d="${d}" pathLength="1" vector-effect="non-scaling-stroke"/>`).join('')}</svg>`;
const STRIKE = ['M2 11 C 22 6, 40 15, 62 9 S 90 8, 98 11'], UNDER = ['M3 9 C 25 4, 55 13, 97 6', 'M12 15 C 40 11, 60 17, 88 12'];
function sayButton(word) {
  const b = document.createElement('button'); b.className = 'say'; b.title = 'Listen'; b.innerHTML = SPEAKER;
  b.addEventListener('click', (e) => {
    e.stopPropagation(); audio.unlock();
    if (audio.pronounce(word)) { b.classList.add('playing'); setTimeout(() => b.classList.remove('playing'), 700); }
  });
  return b;
}
function openWords(o) {
  current = o; state = 'words'; document.exitPointerLock?.(); audio.uiOpen();
  $('question').textContent = o.w.q; listEl.innerHTML = '';
  o.w.choices.forEach((w, i) => {
    const row = document.createElement('div'); row.className = 'row';
    const b = document.createElement('button'); b.className = 'word';
    b.innerHTML = `<small>${i + 1}</small><span class="txt">${w}${markSvg('strike', STRIKE)}${markSvg('under', UNDER)}</span>`;
    if (o.struck.has(i)) { b.classList.add('wrong'); b.disabled = true; b.querySelector('.strike').classList.add('done'); }
    b.addEventListener('click', () => pick(i));
    row.append(b, sayButton(w)); listEl.append(row);
  });
  wordsEl.classList.remove('off');
}
function closeWords() { if (busy) return; state = 'play'; wordsEl.classList.add('off'); audio.uiClose(); resume(); }
async function pick(i) {
  const o = current;
  if (busy || state !== 'words' || !o || o.struck.has(i) || i >= o.w.choices.length) return;
  const row = listEl.children[i], b = row.firstChild, word = o.w.choices[i], right = word === o.w.word;
  busy = true; wordsEl.classList.add('busy'); b.classList.add('speaking'); singing = true;
  audio.unlock();
  if (right && !noLock) lock();                  // take the mouse back while we still have the click
  await audio.speak(word);                       // the answer only shows once the bird has chirped it
  singing = false; b.classList.remove('speaking');
  if (right) {
    b.classList.add('right'); b.querySelector('.under').classList.add('draw'); audio.underline(0.45);
    [...listEl.children].forEach((r, j) => { if (j !== i) r.classList.add('fade'); });
    await sleep(1150);
    wordsEl.classList.add('off'); busy = false; wordsEl.classList.remove('busy');
    startCutscene(o);
  } else {
    o.struck.add(i); b.classList.add('wrong'); b.disabled = true; b.querySelector('.strike').classList.add('draw'); audio.scribble(0.32);
    busy = false; wordsEl.classList.remove('busy');
  }
}

// ---------- cutscene cameras ----------
// Each orb has its own way of being filmed (close, wide, or close then wide). The distance is
// worked out so the whole object, and the bird perched on it, fit inside the picture.
const losRay = new THREE.Raycaster(), _box = new THREE.Box3();
const idsOf = (c) => [].concat(c.userData.orb || []);
function blocked(from, to, stop) {
  const d = to.clone().sub(from), len = d.length(); if (len - stop < 0.5) return false;
  losRay.set(from, d.normalize()); losRay.far = len - stop;
  return !!losRay.intersectObjects(world.colliders, false)[0];
}
const dirOf = (a, el = 0) => V(Math.sin(a) * Math.cos(el), Math.sin(el), Math.cos(a) * Math.cos(el));
function fitDist(r) { const t = Math.tan(THREE.MathUtils.degToRad(S.cutscene.fov) / 2); return r / Math.sin(Math.min(Math.atan(t * 0.74), Math.atan(t * aspect() * 0.92))); }
const aspect = () => (camera.aspect > 0 ? camera.aspect : 1.6);
function ownSphere(o) {
  const d = o.def, box = new THREE.Box3();
  for (const c of world.colliders) if (idsOf(c)[0] === o.id && !c.userData.person) { c.geometry.boundingBox || c.geometry.computeBoundingBox(); box.union(_box.copy(c.geometry.boundingBox).applyMatrix4(c.matrixWorld)); }
  const s = box.isEmpty() ? null : box.getBoundingSphere(new THREE.Sphere());
  return s && s.radius < d.size * 2.2 && s.radius > d.size * 0.35 ? s : new THREE.Sphere(d.focus.clone(), d.size);
}
const sideOf = (f) => (Math.abs(f.x) < 14 ? 0 : f.x < 0 ? Math.PI / 2 : -Math.PI / 2);     // look from the river side
// is any part of the thing (its middle, its sides, its top) hidden from this camera position?
const _r = V(0, 0, 0), _u = V(0, 1, 0), _t = V(0, 0, 0);
// rays only see the outside of things, so a camera standing inside a house sees "nothing in the way"
const _inv = new Map(), _lp = V(0, 0, 0), _bb = new THREE.Box3();
const bigs = new Set(), _up = V(0, 1, 0), upRay = new THREE.Raycaster();
// the big things (the cliffs, the ground) are not boxes: look straight up, and if the first thing above is the
// inside of a surface, the point is buried in it
function buried(p) {
  if (!bigs.size) for (const c of world.colliders) { const g = c.geometry; g.boundingBox || g.computeBoundingBox(); if (_bb.copy(g.boundingBox).applyMatrix4(c.matrixWorld).getSize(_lp).length() > 40 && !c.userData.water) bigs.add(c); }
  const list = [...bigs], mats = list.map((c) => c.material.side);
  for (const c of list) c.material.side = THREE.DoubleSide;
  upRay.set(p, _up); upRay.far = 400; const h = upRay.intersectObjects(list, false)[0];
  list.forEach((c, i) => { c.material.side = mats[i]; });
  return !!h && h.face.normal.clone().transformDirection(h.object.matrixWorld).y > 0;
}
function inside(p, pad = 0.35) {
  if (buried(p)) return true;
  for (const c of world.colliders) {
    const g = c.geometry; g.boundingBox || g.computeBoundingBox();
    if (c.userData.water) continue;
    let m = c.userData.person ? null : _inv.get(c);
    if (!m) {
      m = c.matrixWorld.clone().invert();
      if (_bb.copy(g.boundingBox).applyMatrix4(c.matrixWorld).getSize(_lp).length() > 40) m.big = true;     // the cliffs, the ground: their box is mostly air
      if (!c.userData.person) _inv.set(c, m);
    }
    if (m.big) { bigs.add(c); continue; }
    _lp.copy(p).applyMatrix4(m); const sc = c.matrixWorld.getMaxScaleOnAxis() || 1;
    if (_bb.copy(g.boundingBox).expandByScalar(pad / sc).containsPoint(_lp)) return true;
  }
  return false;
}
function covered(from, c, r) {
  if (inside(from) || blocked(from, c, r)) return true;
  _r.subVectors(c, from).cross(_u).normalize(); const k2 = r * 0.6;
  for (const [a, b] of [[1, 0], [-1, 0], [0, 1]]) { _t.copy(c).addScaledVector(_r, a * k2); _t.y += b * k2; if (blocked(from, _t, r * 0.75)) return true; }
  return false;
}
function closeShot(o, bird, dur) {
  const sp = ownSphere(o), c = sp.center.clone(); let r = sp.radius;
  if (bird) { const d = bird.distanceTo(c) + 0.9; if (d > r) { const nr = (r + d) / 2; c.add(bird.clone().sub(c).setLength(nr - r)); r = nr; } }
  // something with a front (a building's entrance, a face) is filmed from a front three-quarter view; the rest from the river side
  const front = o.def.front, dist = fitDist(r * 1.1), base = front ?? sideOf(o.def.focus), hid = (p) => covered(p, c, r) || (bird && blocked(p, bird, 0.7));
  const offs = front !== undefined ? [0.45, -0.45, 0, 0.9, -0.9, 1.35, -1.35, 1.9, -1.9, 2.5, -2.5, Math.PI] : [0, 0.6, -0.6, 1.2, -1.2, 1.9, -1.9, Math.PI, 2.5, -2.5];
  const els = [0.3, 0.5, 0.75, 1.05], tries = front !== undefined ? offs.flatMap((off) => els.map((el) => [el, off])) : els.flatMap((el) => offs.map((off) => [el, off]));      // a front: stay near it, rise if needed
  for (const [el, off] of tries) {
    const a = base + off, from = c.clone().addScaledVector(dirOf(a, el), dist);
    if (hid(from)) continue;
    for (const turn of [0.4, -0.4, 0.15, -0.15]) {
      const to = c.clone().addScaledVector(dirOf(a + turn, el + 0.05), dist * 0.96);
      if (!hid(to) && [0.25, 0.5, 0.75].every((e) => !hid(from.clone().lerp(to, e)))) return { from, to, lookFrom: c, lookTo: c, dur, r, c };     // clear the whole way, not only at its ends
    }
  }
  return { from: c.clone().addScaledVector(dirOf(base, 1.2), dist), to: c.clone().addScaledVector(dirOf(base + 0.3, 1.2), dist * 0.96), lookFrom: c, lookTo: c, dur, r, c };
}
function wideShot(o, dur) {
  const f = o.def.focus, pts = [];
  for (const t of o.def.tags) for (const s of tag(t).subs) { const p = s.box.getCenter(V(0, 0, 0)); if (p.distanceTo(f) < 105) pts.push(p); }
  let c, r;
  if (pts.length > 1) { c = V(0, 0, 0); for (const p of pts) c.add(p); c.multiplyScalar(1 / pts.length); r = Math.min(75, Math.max(...pts.map((p) => p.distanceTo(c))) + 4); }
  else { c = f.clone().lerp(V(0, BANK, 0), 0.45); r = 34; }
  const dist = clamp(fitDist(r), 55, 150), dx = f.x - c.x, dz = f.z - c.z, sky = f.y > 40;
  const az = Math.hypot(dx, dz) > 6 ? Math.atan2(dx, dz) : sideOf(f) + 0.2, lookFrom = f.clone().lerp(c, 0.5);
  const make = (off, el) => ({ from: c.clone().addScaledVector(dirOf(az + off, el), dist), to: c.clone().addScaledVector(dirOf(az + off + 0.22, el + 0.07), dist * 1.08), lookFrom, lookTo: c, dur, pts, wide: true });
  if (sky) return make(0, 0.06);
  // no cloud between the camera and what is being coloured
  for (const el of [0.6, 0.45, 0.78, 0.32]) for (const off of [0, 0.5, -0.5, 1, -1, 1.6, -1.6, 2.4, -2.4, Math.PI]) {
    const sh = make(off, el);
    if (!cloudHit(sh.from, lookFrom) && !cloudHit(sh.to, c) && !cloudHit(sh.from, f) && !cloudHit(sh.to, f)) return sh;
  }
  return make(0, 0.6);
}
const _ab = V(0, 0, 0), _ac = V(0, 0, 0);
function cloudHit(a, b) {
  _ab.subVectors(b, a); const L = _ab.lengthSq();
  return world.clouds.some((cl) => { const t = clamp(_ac.subVectors(cl.c, a).dot(_ab) / L, 0, 1); return _ac.copy(a).addScaledVector(_ab, t).distanceTo(cl.c) < cl.r; });
}
// every word has one set camera: framed for the spot where the bird usually stands for it (the surface under
// its orb, or the spot it opens from), not for wherever the bird happens to be, so the scene is the same every time
const birdSpots = new Map();
function birdSpot(o) {
  if (!birdSpots.has(o.id)) {
    const d = o.def, h = flight.cast(d.at.clone(), V(0, -1, 0), 80);
    birdSpots.set(o.id, h && flight.landable(h) ? h.point.clone().setY(h.point.y + 0.5) : d.near ? V(...d.near.p) : d.swim ? V(...d.swim.p) : null);
  }
  return birdSpots.get(o.id);
}
const fixedShots = new Map();
function setShots(o) {      // (framed for the window's shape: worked out again if the window changes shape)
  const f = fixedShots.get(o.id); if (f && Math.abs(f.aspect - aspect()) < 0.01) return f.shots;
  const shots = shotsFor(o, birdSpot(o)); fixedShots.set(o.id, { shots, aspect: aspect() }); return shots;
}
function shotsFor(o, bird) {
  const d = o.def, C = S.cutscene;
  if (d.id === 'rijeka') return [{ from: V(7, 20, 70), to: V(-4, 32, 86), lookFrom: V(1, 1, 26), lookTo: V(0, 4, 0), dur: C.wideDuration, wide: true }];
  if (d.shot === 'bridge') return [{ from: V(8.5, 6.5, 52), to: V(-8, 12, 46), lookFrom: V(0, 13, 0), lookTo: V(0, 13.5, 0), dur: 9.5, wide: true }];
  if (d.shot === 'close') return [closeShot(o, bird, C.closeDuration)];
  if (d.shot === 'wide') return [wideShot(o, C.wideDuration)];
  // the rest is in one other small spot: a second close look there instead of a wide view from above
  if (d.second) { const s2 = d.second; return [closeShot(o, bird, 4), closeShot({ id: '', def: { ...d, focus: V(...s2.focus), size: s2.size, front: s2.front } }, null, C.wideDuration - 4)]; }
  return [closeShot(o, bird, 4), wideShot(o, C.wideDuration - 4)];
}
// used from the console to check every orb's camera without playing through it
function checkShots() {
  const cam = new THREE.PerspectiveCamera(S.cutscene.fov, aspect(), 0.1, 3000), out = {}, D = V(0, -1, 0);
  const inFrame = (p) => { const q = p.clone().project(cam); return q.z < 1 && Math.abs(q.x) < 0.96 && Math.abs(q.y) < 0.76; };
  for (const o of orbs) {
    const d = o.def, probs = [], bird = birdSpot(o);
    for (const [si, s] of shotsFor(o, bird).entries()) for (const e of [0, 0.25, 0.5, 0.75, 1]) {
      cam.position.lerpVectors(s.from, s.to, e); cam.lookAt(s.lookFrom.clone().lerp(s.lookTo, e)); cam.updateMatrixWorld();
      if (inside(cam.position, 0.1)) probs.push(`camera ${e} inside something`);
      if (s.wide) { if (s.pts) { const n = s.pts.filter(inFrame).length; if (n < Math.min(s.pts.length, 2) || n / s.pts.length < 0.6) probs.push(`wide ${e}: only ${n}/${s.pts.length} in frame`); } continue; }
      const right = V(1, 0, 0).applyQuaternion(cam.quaternion), up = V(0, 1, 0).applyQuaternion(cam.quaternion);
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!inFrame(s.c.clone().addScaledVector(right, a * s.r).addScaledVector(up, b * s.r))) probs.push(`close ${e}: object cut off`);
      if (bird && si === 0 && !inFrame(bird)) probs.push(`close ${e}: bird cut off`);      // (only the first shot is where the bird is)
      if (covered(cam.position, s.c, s.r)) probs.push(`close ${e}: view blocked`);
      if (bird && si === 0 && blocked(cam.position, bird, 0.7)) probs.push(`close ${e}: bird hidden`);
      if (cam.position.y < 0.6) probs.push('camera under water');
    }
    if (probs.length) out[o.id] = [...new Set(probs)];
  }
  return out;
}

// ---------- colouring cutscene ----------
const look = new THREE.Vector3();
async function fadeCut(fn) { $('fade').classList.add('on'); await sleep(230); fn(); $('fade').classList.remove('on'); }
// Enter ends a colouring scene or the finale at once; everything it would have done is simply done
function skipScene() {
  if (state === 'cutscene' && cut && !cut.ending) {
    cut.started = true; for (const t of cut.o.def.tags) paint(t, true); if (cut.o.id === 'sat') hands.visible = true;
    cut.snapped = true;
    cut.o.vis.visible = false; cut.t = cut.dur; audio.stopSong(); singTok++; singing = false;
  } else if (state === 'finale' && fin && !fin.ending && fin.t < 25.5) {
    for (const n of ['sing', 'sky', 'photo', 'birds', 'city', 'murmur', 'jump']) fin.ev.add(n);
    fin.t = 26; audio.stopSong(); singing = false; audio.setLife({ wind: 1, water: 1, birds: true, city: true, murmur: 0.5 }); applyAlive();
  }
}
$('skip').addEventListener('click', skipScene);
function startCutscene(o) {
  state = 'cutscene'; hideLearn();
  fadeCut(() => {
    document.body.classList.add('cine');
    const shots = setShots(o), dur = shots.reduce((s, x) => s + x.dur, 0);
    cut = { o, t: 0, dur, shots, started: false, home: o.def.at.clone() };
    singing = true; audio.orbRelease(); audio.duckMusic(true); const tk = ++singTok;
    audio.song(o.id, dur - 0.9).then(() => { if (tk === singTok) singing = false; });
  });
}
function updateCutscene(dt) {
  const c = cut, o = c.o; c.t += dt;
  let seg = c.shots[0], t0 = 0;
  for (const s of c.shots) { if (c.t < t0 + s.dur || s === c.shots[c.shots.length - 1]) { seg = s; break; } t0 += s.dur; }
  c.seg = seg;
  const e = smooth((c.t - t0) / seg.dur);
  camera.position.lerpVectors(seg.from, seg.to, e); camera.lookAt(look.lerpVectors(seg.lookFrom, seg.lookTo, e));
  if (camera.fov !== S.cutscene.fov) { camera.fov = S.cutscene.fov; camera.updateProjectionMatrix(); }
  // the orb rises, swells, dims and frays away
  const u = o.vis.userData, r = clamp(c.t / S.cutscene.paintDelay, 0, 1), sw = smooth((r - 0.28) / 0.72);
  o.vis.position.copy(c.home); o.vis.position.y += smooth(r / 0.4) * 0.8;
  u.core.scale.setScalar(1 + sw * 2.4); u.shine.scale.setScalar(1 + sw * 2.4);
  u.core.material.opacity = 1 - sw; u.shine.material.opacity = 1 - sw;
  u.halo.scale.setScalar(2.6 + sw * 5); u.halo.material.opacity = 1 - sw;
  u.wisp.scale.setScalar(2.6 + sw * 9); u.wisp.material.opacity = Math.sin(Math.PI * Math.min(1, r * 1.05)) * 0.9; u.wisp.material.rotation = r * 1.2;
  if (r >= 1) o.vis.visible = false;
  if (!c.started && c.t >= S.cutscene.paintDelay) { c.started = true; for (const t of o.def.tags) paint(t); audio.paintWash(4.5); if (o.id === 'sat') hands.visible = true; }
  if (!c.snapped && c.t >= snapTime(o, c.dur)) { c.snapped = true; snapId = o.id; }
  if (c.t >= c.dur && !c.ending) {
    c.ending = true;
    fadeCut(() => {
      cut = null; singing = false; document.body.classList.remove('cine'); audio.duckMusic(false);
      camera.fov = S.camera.fov; camera.updateProjectionMatrix(); camSnap = true; state = 'play';
      finishOrb(o);
    });
  }
}
// the journal photo is taken once everything this word colours has finished colouring
const paintEnd = (o) => Math.max(0, ...o.def.tags.map((t) => tag(t).end || 4.6));      // (the clock hands and the diver colour on their own, within 4.6 s)
// in a scene with a close look and then a wide one, the photo is of the first object, fully coloured, before the cut
const nearEnd = (o) => Math.max(0, ...o.def.tags.map((t) => tag(t).nearEnd ?? tag(t).end ?? 4.6));
const snapTime = (o, dur) => o.def.shot === 'combo' ? Math.min(S.cutscene.paintDelay + nearEnd(o) + 0.2, 3.8) : Math.min(S.cutscene.paintDelay + paintEnd(o) + 0.4, dur - 0.2);
function finishOrb(o) {
  o.done = true; o.alive = false; scene.remove(o.vis); if (o.id === 'sat') hands.visible = true;
  if (!save.done.includes(o.id)) save.done.push(o.id); store();
  showLearn(o.w); renderJournal(o.id);
  const n = refreshOrbs(true);
  if (o === FIRST && n) say('New orbs have appeared all over Mostar. Find them in any order.', 7);
  else if (n && byId.most.alive && !byId.most.done && orbs.filter((x) => x.alive).length === 1) say('Only Stari Most is left. Its orb is waiting on the bridge.', 7);
  else if (n) say('A new orb has appeared nearby.', 5);
  showFleur();
  if (!noLock && !locked) setTimeout(() => { if (!locked && state === 'play') paused = true; }, 300);
}
let learnTimer = 0;
function showLearn(w) { const el = $('learn'); el.querySelector('b').textContent = w.word; el.querySelector('span').textContent = w.en; el.classList.remove('off'); audio.learned(); $('hud').classList.add('pulse'); clearTimeout(learnTimer); learnTimer = setTimeout(hideLearn, 4500); }
function hideLearn() { $('learn').classList.add('off'); $('hud').classList.remove('pulse'); }
function say(text, seconds) { toast = text; toastT = seconds; }

// ---------- feather journal ----------
function renderJournal(newId) {
  const known = ORDER.filter((id) => (id === 'sunce' ? save.finale : byId[id]?.done));
  $('count').textContent = `${known.length}/${ORDER.length}`;
  $('jcount').textContent = `${known.length} of ${ORDER.length} words from Mostar`;
  const list = $('jwords'); list.innerHTML = ''; list.style.gridTemplateRows = `repeat(${Math.ceil(ORDER.length / 2)}, auto)`;
  for (const id of ORDER) {
    const row = document.createElement('div'), w = WORDS[id];
    if (known.includes(id)) { row.className = 'jw' + (id === newId ? ' new' : ''); row.innerHTML = `<b>${w.word}</b><i>${w.en}</i>`; row.append(sayButton(w.word)); row.title = 'Show its picture'; row.addEventListener('click', () => showCard(id)); }
    else { row.className = 'jw unknown'; row.textContent = '· · · · ·'; }
    list.append(row);
  }
  $('cplace').textContent = CULTURE.place; $('csub').textContent = CULTURE.subtitle;
  $('cfacts').innerHTML = CULTURE.facts.map(([h, p]) => `<p><b>${h}</b>${p}</p>`).join('');
  $('culture').classList.toggle('locked', !save.finale); $('endcard').style.display = save.finale ? '' : 'none';
}
// a small photo card for a word in the journal: the game's own picture of it, taken from where its colouring scene was filmed
// fallback when a word has no stored photo (its scene was skipped): the same camera, taken now
function snapshot(id) {
  if (!(canvas.width > 0)) return '';
  const keep = { p: camera.position.clone(), q: camera.quaternion.clone(), fov: camera.fov }, vis = bird.root.visible;
  let from, to;
  if (id === 'sunce') { from = V(30, 30, 50); to = V(-60, 62, -80); }
  else { const sh = setShots(byId[id])[0]; from = sh.from.clone().lerp(sh.to, 0.7); to = sh.lookFrom.clone().lerp(sh.lookTo, 0.7); }
  camera.position.copy(from); camera.lookAt(to); camera.fov = S.cutscene.fov; camera.updateProjectionMatrix(); bird.root.visible = false;
  const shown = orbs.filter((o) => o.vis.visible); for (const o of shown) o.vis.visible = false;
  renderer.render(scene, camera);
  for (const o of shown) o.vis.visible = true;
  const data = grabFrame();
  camera.position.copy(keep.p); camera.quaternion.copy(keep.q); camera.fov = keep.fov; camera.updateProjectionMatrix(); bird.root.visible = vis;
  return data;
}
function showCard(id) {
  const w = WORDS[id], el = $('card');
  $('cardImg').src = pics[id] || BUNDLED[id] || snapshot(id); el.querySelector('b').textContent = w.word; el.querySelector('span').textContent = w.en;
  el.classList.remove('off'); audio.page();
}
$('card').addEventListener('click', () => $('card').classList.add('off'));
function openJournal(newId) { if (state !== 'play') return; state = 'journal'; document.exitPointerLock?.(); renderJournal(newId); $('journal').classList.remove('off'); audio.page(); hideLearn(); }
let awakeNote = false;      // after the finale's journal page: tell the player the town is theirs to explore
function closeJournal() { if (awakeNote) { awakeNote = false; say('Mostar has awakened. You can now explore it freely.', 8); } state = 'play'; $('journal').classList.add('off'); $('card').classList.add('off'); audio.page(); resume(); }
$('hud').addEventListener('click', () => { if (state === 'play') openJournal(); });
$('jclose').addEventListener('click', closeJournal);
$('journal').addEventListener('click', (e) => { if (e.target === $('journal')) closeJournal(); });
$('cart').src = journalArt;
renderJournal();

// ---------- the finale ----------
const dropBlock = (test) => { const i = world.colliders.findIndex(test); if (i >= 0) world.colliders.splice(i, 1); };
function wake() { dropBlock((c) => c.userData.diver); }
let swimBlock = null;
function diverInWater() {   // the bird cannot swim or fly through him
  const p = diver.splashPos;
  if (!swimBlock) { swimBlock = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1)); swimBlock.matrixAutoUpdate = false; swimBlock.userData = { wall: true, swimmer: true }; world.colliders.push(swimBlock); }
  swimBlock.matrix.compose(V(p.x, 0.2, p.z + 1.2), new THREE.Quaternion(), V(1.1, 2, 1.1)); swimBlock.matrixWorld.copy(swimBlock.matrix);
}
function applyAlive() { paint('sky', true); paint('sun', true); shared.uSun.value = 1; shared.uLife.value = 1; audio.setMusic(0.9, true); diver.swimAt(V(0, 0, 10.2)); wake(); diverInWater(); people.applaud(); }
if (save.finale) applyAlive();
const FIN_SHOTS = [
  { t0: 0, t1: 7.5, from: V(30, 30, 50), to: V(24, 35, 44), lookFrom: V(-60, 62, -80), lookTo: V(-75, 60, -92) },
  { t0: 7.5, t1: 14, from: V(34, 60, 98), to: V(8, 48, 82), lookFrom: V(0, 12, 0), lookTo: V(0, 10, -8) },
  { t0: 14, t1: 22.8, from: V(-2.6, 7.2, 31.5), to: V(0.6, 5.2, 27.5), diver: true },
  { t0: 22.8, t1: 26, from: V(3, 26, 66), to: V(0, 33, 80), lookFrom: V(0, 13, 0), lookTo: V(0, 14, 0) },
];
function startFinale() {
  state = 'finale'; hideLearn(); toastT = 0; document.body.classList.add('cine'); audio.pickup(); audio.duckMusic(true);
  const P = [[0, flight.pos.x, flight.pos.y, flight.pos.z], [2, -14, 64, -6], [4.5, -26, 56, 10], [7, -18, 46, 34], [9.5, 2, 38, 48], [12, 14, 30, 36], [14, 10, 25, 16], [15.6, 4.5, 22.5, 6.5],
    [16.6, -2.5, 22, 5], [17.4, -4, 18.5, 9], [18.3, -2, 12.5, 13], [19.6, 6.5, 10, 22], [21.5, 7.5, 11, 40], [23.5, -2, 17, 56], [26, 0, 26, 68], [28, 2, 30, 80]];
  fin = { t: 0, P, curve: new THREE.CatmullRomCurve3(P.map((p) => V(p[1], p[2], p[3]))), ev: new Set(), wind: 0, water: 0 };
  flight.mode = 'script'; flight.feet = null; flight.flare = 0; flight.diving = false; flight.clearL = flight.clearR = 1;
  diver.onSplash = (p) => { audio.splash(); splashFx(p, 1); audio.setMusic(0.9, true); setTimeout(() => { people.applaud(); audio.applause(8); }, 600); };
  diver.onSurface = (p) => { splashFx(V(p.x, 0, p.z + 1.2), 0.35); audio.birdSplash(0.3); diverInWater(); };
}
function updateFinale(dt) {
  const f = fin; f.t += dt; const t = f.t;
  const once = (name, at, fn) => { if (t >= at && !f.ev.has(name)) { f.ev.add(name); fn(); } };
  once('sing', 0.4, () => { singing = true; audio.speak('sunce').then(() => { singing = false; }); });
  once('sky', 1.2, () => { paint('sky'); paint('sun'); audio.swell(true, 7); audio.paintWash(6); });
  once('photo', 8, () => { snapId = 'sunce'; });
  once('birds', 11, () => audio.setLife({ birds: true })); once('city', 12.5, () => audio.setLife({ city: true }));
  once('murmur', 12.5, () => audio.setLife({ murmur: 0.5 }));
  once('jump', 15, () => { diver.jump(); wake(); singing = true; audio.song('sunce', 7.3, 1).then(() => { singing = false; }); });   // the whole melody, once
  shared.uSun.value = smooth((t - 3) / 7); shared.uLife.value = smooth((t - 8.5) / 3);
  f.wind = smooth((t - 6) / 4); f.water = smooth((t - 9.5) / 3); audio.setLife({ wind: f.wind, water: f.water });
  // the bird flies itself through the scene
  let i = 0; while (i < f.P.length - 2 && t > f.P[i + 1][0]) i++;
  const u = clamp((i + clamp((t - f.P[i][0]) / (f.P[i + 1][0] - f.P[i][0]), 0, 1)) / (f.P.length - 1), 0, 1);
  const p = f.curve.getPoint(u), tan = f.curve.getTangent(u);
  const yaw = Math.atan2(tan.x, tan.z), dy = Math.atan2(Math.sin(yaw - flight.yaw), Math.cos(yaw - flight.yaw));
  flight.pos.copy(p); flight.yaw += dy * k(8, dt); flight.camYaw = flight.yaw; flight.pitch = Math.asin(clamp(tan.y, -1, 1));
  flight.roll += (clamp(-dy * 3, -0.8, 0.8) - flight.roll) * k(6, dt); flight.speed = 14; flight.power = tan.y > 0.05;
  // the camera
  const s = FIN_SHOTS.find((x) => t < x.t1) || FIN_SHOTS[FIN_SHOTS.length - 1], e = smooth((t - s.t0) / (s.t1 - s.t0));
  if (f.shot !== s) f.shot = s;      // a straight cut between the finale's shots
  camera.position.lerpVectors(s.from, s.to, e);
  if (s.diver) { const d = diver.state === 'jump' ? diver.root.position : diver.state === 'stand' ? world.diverPos : diver.splashPos; f.look = (f.look || world.diverPos.clone()).lerp(V(d.x, d.y + 1, d.z), k(5, dt)); camera.lookAt(f.look); }
  else camera.lookAt(look.lerpVectors(s.lookFrom, s.lookTo, e));
  if (camera.fov !== 46) { camera.fov = 46; camera.updateProjectionMatrix(); }
  if (t >= 26 && !f.ending) {
    f.ending = true;
    fadeCut(() => {
      fin = null; save.finale = true; store(); document.body.classList.remove('cine'); audio.swell(false, 9); audio.setMusic(0.9, true); audio.duckMusic(false);
      camera.fov = S.camera.fov; camera.updateProjectionMatrix(); camSnap = true;
      flight.mode = 'flying'; flight.mousePitch = 0; flight.grace = 0.5; fleur.visible = false;
      state = 'play'; awakeNote = true; openJournal('sunce');
    });
  }
}
function splashFx(p, power = 1) {
  const m = new THREE.MeshBasicMaterial({ color: '#fbf7ec', transparent: true });
  for (let i = 0; i < 4 + 18 * power; i++) {
    const d = new THREE.Mesh(shineGeo, m); d.scale.setScalar((0.5 + Math.random() * 1.1) * (0.5 + 0.5 * power)); d.position.copy(p); scene.add(d);
    const a = Math.random() * 6.28, sp = (1 + Math.random() * 3.2) * (0.4 + 0.6 * power), v = V(Math.cos(a) * sp, (5 + Math.random() * 6) * (0.35 + 0.65 * power), Math.sin(a) * sp);
    fx.push({ t: 0, life: 1.6, step(dt) { v.y -= 14 * dt; d.position.addScaledVector(v, dt); d.visible = d.position.y > -0.2; }, end() { scene.remove(d); } });
  }
  for (let i = 0; i < (power > 0.6 ? 3 : 2); i++) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40), new THREE.MeshBasicMaterial({ color: '#fbf7ec', transparent: true, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(p.x, 0.06, p.z); scene.add(ring);
    fx.push({ t: -i * 0.35, life: 2.6, step() { const q = Math.max(0, this.t) / this.life; ring.scale.setScalar(0.4 + q * (2 + 5 * power)); ring.material.opacity = (1 - q) * 0.9; ring.visible = this.t > 0; }, end() { scene.remove(ring); } });
  }
}

// ---------- camera ----------
const camPos = V(0, 0, 0), camWant = V(0, 0, 0), camLook = V(0, 0, 0), tmp = V(0, 0, 0);
const camRay = new THREE.Raycaster();
let camSnap = true, dbg = null, camDist = S.camera.distance;
const camOff = V(0, 0, 0), camFocus = V(0, 0, 0);
function updateCamera(dt) {
  const perched = flight.mode === 'perched' || flight.mode === 'swim';
  const elev = perched ? flight.camElev : 0.22 - flight.pitch * 0.55;
  camDist += ((perched ? S.camera.distance : S.camera.flightDistance) - camDist) * k(2.5, dt);
  const dist = camDist, ce = Math.cos(elev);
  const lift = 0.15 + 0.37 * S.bird.scale;
  if (camSnap) camFocus.copy(flight.pos); else camFocus.lerp(flight.pos, k(perched ? 5 : 80, dt));
  camLook.copy(camFocus); camLook.y += lift;
  camWant.set(flight.pos.x - Math.sin(flight.camYaw) * ce * dist, flight.pos.y + lift + Math.sin(elev) * dist, flight.pos.z - Math.cos(flight.camYaw) * ce * dist);
  // the offset from the bird is what eases, not the position, so the camera does not fall behind at speed
  camWant.sub(flight.pos);
  if (camSnap) { camOff.copy(camWant); camSnap = false; } else camOff.lerp(camWant, k(S.camera.smooth, dt));
  camPos.copy(camFocus).add(camOff);
  camera.position.copy(camPos);
  tmp.subVectors(camPos, camLook); const len = tmp.length(); tmp.normalize();
  camRay.set(camLook, tmp); camRay.far = len;
  const hit = camRay.intersectObjects(world.colliders, false)[0];
  if (hit && !hit.object.userData.diver && !hit.object.userData.swimmer) camera.position.copy(camLook).addScaledVector(tmp, Math.max(0.35, hit.distance - 0.25));
  camera.lookAt(camLook);
  const f = S.flight, boost = perched ? 0 : clamp((flight.speed - f.cruiseSpeed) / (f.maxSpeed - f.cruiseSpeed), 0, 1);
  const fov = S.camera.fov + boost * S.camera.diveFovBoost;
  if (Math.abs(camera.fov - fov) > 0.01) { camera.fov += (fov - camera.fov) * k(4, dt); camera.updateProjectionMatrix(); }
}

// ---------- hints ----------
const hintEl = $('hint');
let lastHint = null;
function hint(html) { if (html === lastHint) return; lastHint = html; if (html) { hintEl.innerHTML = html; hintEl.classList.remove('off'); } else hintEl.classList.add('off'); }
function updateHint() {
  $('pause').classList.toggle('off', !(started && paused && state === 'play'));
  if (!started || state !== 'play' || paused) return hint('');
  if (toastT > 0) return hint(toast);
  if (flight.mode === 'swim') return hint((orbHere() ? '<kbd>E</kbd> open the word list · ' : '') + 'hold the mouse button to paddle · <kbd>Space</kbd> take off');
  if (flight.mode === 'perched') {
    if (orbHere()) return hint('<kbd>E</kbd> open the word list · hold the mouse button to walk');
    return hint('<kbd>Space</kbd> take off' + (!FIRST.done ? ' · fly to the glowing orb and land on the roof' : ' · hold the mouse button to walk'));
  }
  hint('');
}

// ---------- loop ----------
const clock = new THREE.Clock();
function frame() { tick(Math.min(clock.getDelta(), 0.05)); requestAnimationFrame(frame); }
function tick(dt) {
  time += dt; shared.uTime.value = time; shared.uFlow.value += dt * shared.uLife.value;
  for (const t of painting) t.uT.value += dt;
  for (const n in tags) { const t = tags[n]; if (t.fadeLine) { const op = clamp(1 - (t.uT.value - 2.5) / 3, 0, 1); t.fadeLine.visible = op > 0.01; t.fadeLine.material.opacity = op; } }
  inp.turn = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
  inp.tilt = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
  inp.flap = keys.has('Space'); inp.dive = mouseDown;
  // without mouse capture the cursor can run out of room: resting it on the very edge of the window keeps turning
  if (noLock && !locked && innerWidth > 0 && !inp.turn) inp.turn = (mouse.x > innerWidth - 14 ? 1 : mouse.x < 14 ? -1 : 0) * S.flight.edgeTurnRate / S.flight.keyTurnRate;

  const running = started && !paused && state === 'play' && (locked || noLock); live = running;
  if (running) {
    flight.update(dt, inp);
    for (const ev of flight.events) { if (ev === 'splash') { splashFx(V(flight.pos.x, flight.waterY + 0.05, flight.pos.z), flight.splashPower); audio.birdSplash(flight.splashPower); } else audio[ev]?.(); }
    flight.drift = flight.waterY < 1 ? 0.5 * shared.uLife.value : 0;
    if (fleur.visible && flight.mode === 'flying' && flight.pos.distanceTo(fleur.position) < 3.6) startFinale();
    toastT -= dt;
  }
  flight.events.length = 0; inp.dx = inp.dy = 0; inp.takeoff = false;
  if (fin) updateFinale(dt);
  diver.update(dt, time); people.update(dt, time, shared.uLife.value, flight);
  if (shared.uLife.value > 0 && !fin) { // the living town is heard from where the bird is
    const p = flight.pos, low = clamp(1 - (p.y - BANK) / 50, 0.15, 1), near = (x, z, r) => clamp(1 - Math.hypot(p.x - x, p.z - z) / r, 0, 1) * low;
    audio.setLife({ wind: 0.45 + 0.55 * clamp((p.y - BANK) / 40, 0, 1), water: clamp(1 - (Math.abs(p.x) - 8) / 42, 0.08, 1) * clamp(1 - p.y / 70, 0.2, 1), birds: true,
      city: near(42, 0, 60), murmur: Math.max(near(42, 0, 34), near(-7, 0, 22), near(19, 50, 20), near(-28, -4, 16), near(31, 76, 22), near(55, 72, 20)) });
  }

  // the sheep bleat now and then, heard only when the bird is close to the meadow
  if (running && shared.uLife.value > 0.5 && !fin && (clapWait -= dt) < 0) {      // the bridge crowd claps again every so often
    clapWait = 9 + Math.random() * 9; const g = nearGain(crowd, 32);
    if (g > 0) { audio.applause(3 + Math.random() * 2, g); people.applaud(); }
  }
  if (running && shared.uLife.value > 0.5) { const sd = Math.hypot(flight.pos.x - 56.5, flight.pos.z - 55) + Math.max(0, flight.pos.y - BANK - 6); if (sd < 18 && Math.random() < dt * 0.25) audio.baa((1 - sd / 18) ** 1.6); }
  freeSingT -= dt;
  bird.root.position.copy(flight.pos);
  bird.root.rotation.set(-flight.pitch, flight.yaw, flight.roll);
  bird.update(dt, { walk: flight.walk / S.flight.runSpeed, hop: !!flight.hop, gap: flight.mode === 'flying' ? flight.gapBelow ?? 9 : 0, landHit: flight.landHit || 0, paddle: flight.paddle, mode: flight.mode === 'perched' || flight.mode === 'swim' ? flight.mode : 'flying', power: flight.power, diving: flight.diving, speed: flight.speed, flare: flight.flare, turn: flight.roll,
    clearL: flight.clearL, clearR: flight.clearR, sing: singing || freeSingT > 0, feet: flight.feet, yaw: flight.yaw });
  if (bird.downstroke) { if (running || fin) audio.flap(bird.downstroke, fin ? S.audio.finaleFlap : 1); bird.downstroke = 0; }
  audio.setRush(flight.speed, flight.mode === 'flying' && running, dt);

  for (const o of orbs) if (o.alive && !(cut && cut.o === o)) {
    o.vis.visible = !cut;      // the other orbs stay out of the colouring scenes (and their photos)
    o.grow = Math.min(1, o.grow + dt * 1.4); const g = smooth(o.grow) * (1 + Math.sin(time * 3.1 + o.def.at.x) * 0.06);
    o.vis.scale.setScalar(g * S.orb.size); o.vis.position.y = o.def.at.y + Math.sin(time * 1.8 + o.def.at.z) * 0.25;
  }
  if (fleur.visible) {
    fleurGrow = Math.min(1, fleurGrow + dt * 0.8); const out = fin ? smooth(fin.t / 0.5) : 0;      // flown through: it simply fades away
    fleur.scale.setScalar(2.3 * smooth(fleurGrow)); fleur.rotation.y = time * 0.9; fleur.position.y = world.fleur.y + Math.sin(time * 1.3) * 0.5;
    for (const m of fleur.userData.parts) m.material.opacity = 1 - out;
    if (out >= 1) fleur.visible = false;
  }
  for (let i = fx.length - 1; i >= 0; i--) { const e = fx[i]; e.t += dt; e.step(dt); if (e.t >= e.life) { e.end(); fx.splice(i, 1); } }

  if (cut) updateCutscene(dt); else if (!fin) updateCamera(dt);
  if (dbg) { camera.position.set(dbg[0], dbg[1], dbg[2]); camera.lookAt(dbg[3], dbg[4], dbg[5]); }
  updateHint(); $('skip').classList.toggle('off', !((cut && !cut.ending) || (fin && !fin.ending && fin.t < 25.5)));
  renderer.render(scene, camera);
  if (snapId) { keepPic(snapId, grabFrame()); snapId = null; }
}
audio.setMusic(0.2 + 0.6 * (save.done.length / orbs.length), save.finale);
updateLegend(); frame();

// for testing from the console
window.__game = { flight, inp, keys, mouse, bird, orbs, byId, world, camera, S, tags, shared, diver, fleur, audio,
  get state() { return state; }, get paused() { return paused; }, get noLock() { return noLock; },
  start() { started = true; noLock = true; $('start').classList.add('off'); $('hud').classList.remove('off'); refreshOrbs(false); updateLegend(); showFleur(); },
  view(...a) { dbg = a.length ? a : null; },
  step(seconds, dt = 1 / 60) { for (let t = 0; t < seconds; t += dt) tick(dt); },
  // writes this save's own journal photos into assets/photos/ (dev server only); returns the ids saved
  async exportPhotos() { const ids = []; for (const [id, d] of Object.entries(pics)) if ((await fetch('/__photo?id=' + id, { method: 'POST', body: d })).ok) ids.push(id); return ids; },
  checkShots, shotsFor, people, skipScene, snapshot, showCard, skipToFinale, restartLevel, closeWords, openWords, pick, startCutscene, orbHere, openJournal, closeJournal, startFinale,
  finish(id) { const o = byId[id]; for (const t of o.def.tags) paint(t, true); finishOrb(o); },
  unpainted() { const used = new Set(orbs.flatMap((o) => o.def.tags)); return Object.keys(tags).filter((t) => !used.has(t) && !['bird', 'sky', 'sun'].includes(t)); },
};

// Dev only: open http://localhost:5183/?exportPhotos after a full play-through (in the same browser) to copy this
// save's journal photos into assets/photos/, where they become the default photos for players who skip a scene.
if (import.meta.env.DEV && params.has('exportPhotos')) {
  (async () => {
    const ids = await window.__game.exportPhotos(), missing = ORDER.filter((id) => !ids.includes(id));
    document.body.insertAdjacentHTML('beforeend', `<div style="position:fixed;inset:20% 10% auto;z-index:99;background:#fffaf0;border:3px solid #3b352f;border-radius:14px;padding:20px 26px;font-size:22px;line-height:1.4">
      Saved ${ids.length} journal photos into assets/photos/.${missing.length ? `<br>No photo yet for: ${missing.join(', ')}` : '<br>Every word has one.'}</div>`);
  })();
}
