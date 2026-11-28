// Dev only (never imported by the game). From the console on a town (?map=<id>&slot=test&fresh):
//   const c = await import('/src/devcheck.js');
//   await c.check()          -> every orb's cameras, landing spots, triggers, orbs inside things, people clipping
//   await c.photos(id)       -> colours each word in turn and saves its journal photo to assets/photos/<id>/
//   await c.finalePhoto(id)  -> (on a finished save) the finale word's photo
//   await c.art(id, from, look) -> renders the journal painting (assets/journal-<id>.webp via the dev server; move it there)
const g = () => window.__game;

export async function check() {
  const G = g(), { flight, orbs } = G, V = (x, y, z) => new flight.pos.constructor(x, y, z), D = V(0, -1, 0);
  const shots = G.checkShots(), land = {}, trigger = {}, inside = [], clip = [];
  for (const o of orbs) {
    const d = o.def, probs = [];
    if (d.swim) { const h = flight.cast(V(d.swim.p[0], d.swim.p[1] + 6, d.swim.p[2]), D, 12); if (!h || !h.object.userData.water) probs.push('swim spot not on water'); }
    else if (d.near) {
      const p = d.near.p, h = flight.cast(V(p[0], p[1] + 1.2, p[2]), D, 4);
      if (!h) probs.push('nothing under near spot');
      else { if (!flight.landable(h)) probs.push('near spot not landable: ' + h.object.userData.tag); if (Math.abs(h.point.y - p[1]) > 0.5) probs.push(`near y ${p[1].toFixed(2)} vs surface ${h.point.y.toFixed(2)} (${h.object.userData.tag})`); }
    } else {
      const h = flight.cast(d.at.clone(), D, 60);
      if (!h) probs.push('nothing under orb');
      else { const ok = [].concat(h.object.userData.orb || []).includes(d.id) || d.tags.includes(h.object.userData.tag); if (!ok) probs.push('under the orb: ' + h.object.userData.tag); if (!flight.landable(h)) probs.push('surface under orb not landable'); }
    }
    if (probs.length) land[d.id] = probs;
    // the orb's glow itself must sit in the open
    for (const dir of [V(1, 0, 0), V(-1, 0, 0), V(0, 0, 1), V(0, 0, -1), V(0, 1, 0)]) { const h = flight.cast(d.at.clone(), dir, 0.5); if (h) { inside.push(`${d.id}: ${h.object.userData.tag}`); break; } }
  }
  // standing exactly on each near / swim spot opens that orb
  const keep = { pos: flight.pos.clone(), mode: flight.mode };
  for (const o of orbs) o.alive = !o.done;
  for (const o of orbs) {
    const d = o.def;
    if (d.swim) { flight.pos.set(d.swim.p[0], d.swim.p[1], d.swim.p[2]); flight.mode = 'swim'; flight.waterY = d.swim.p[1]; }
    else if (d.near) { flight.pos.set(...d.near.p); flight.mode = 'perched'; flight.landedOn = null; }
    else continue;
    const got = G.orbHere(); if (got !== o) trigger[d.id] = got?.def.id || null;
  }
  flight.pos.copy(keep.pos); flight.mode = keep.mode;
  // people and creatures: nothing solid within 0.28 of their body
  for (const p of G.people.list || []) {
    const r = p.root || p.g; if (!r) continue; const c = r.position;
    for (const hgt of [0.4, 1.0, 1.5]) for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2, h = flight.cast(V(c.x, c.y + hgt, c.z), V(Math.cos(a), 0, Math.sin(a)), 0.28);
      if (h && !h.object.userData.person) { clip.push(`${p.o?.kind}/${p.o?.tag} @${c.x.toFixed(1)},${c.z.toFixed(1)} h${hgt}: ${h.object.userData.tag}`); i = 8; }
    }
  }
  const unpainted = G.unpainted();
  return { shots, land, trigger, inside, clip: [...new Set(clip)], unpaintedTags: unpainted };
}

function sizeFor(w, h) { const G = g(), r = G.renderer, cam = G.camera; r.setPixelRatio(1); r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
async function post(map, id, data) { return (await fetch(`/__photo?map=${map}&id=${id}`, { method: 'POST', body: data })).ok; }

export async function photos(map) {
  const G = g(); sizeFor(1260, 840); const saved = [];
  for (const o of G.orbs) { o.alive = true; G.finish(o.def.id); if (await post(map, o.def.id, G.snapshot(o.def.id))) saved.push(o.def.id); }
  return saved.length;
}
export async function finalePhoto(map) {
  const G = g(); sizeFor(1260, 840); for (const o of G.orbs) o.vis.visible = false;
  const word = Object.keys(G.tags).length && (await import('/src/maps/current.js')).default.finale.word;
  return post(map, word, G.snapshot(word));
}
export async function art(map, from, look) {
  const G = g(), r = G.renderer, cam = G.camera; sizeFor(1024, 576); G.bird.root.visible = false; for (const o of G.orbs) o.vis.visible = false;
  cam.fov = 50; cam.updateProjectionMatrix(); cam.position.set(...from); cam.lookAt(...look); cam.updateMatrixWorld(); r.render(G.scene, cam);
  const data = r.domElement.toDataURL('image/webp', 0.86);
  await post(map, 'journaltmp', data.replace('data:image/webp', 'data:image/jpeg'));
  return data;
}
// a quick look: renders views into a sheet over the page; views: [[from, look], ...]
export function look(views, w = 1024, h = 576) {
  const G = g(), r = G.renderer, cam = G.camera; sizeFor(w, h); G.bird.root.visible = false;
  const out = views.map(([from, at]) => { cam.position.set(...from); cam.lookAt(...at); cam.updateMatrixWorld(); r.render(G.scene, cam); return r.domElement.toDataURL('image/jpeg', 0.82); });
  document.getElementById('pv')?.remove();
  const d = document.createElement('div'); d.id = 'pv'; d.style.cssText = `position:fixed;inset:0;z-index:999;background:#fff;display:grid;grid-template-columns:repeat(${views.length > 2 ? 2 : 1},1fr);gap:2px;align-content:start`;
  for (const u of out) { const i = new Image(); i.src = u; i.style.width = '100%'; d.append(i); }
  document.body.append(d);
  return out.length;
}
