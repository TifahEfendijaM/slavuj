// A town module from a short description (for the towns built with townkit.js). Animates what the world lists:
// rock (boats bobbing), fish (circling), birds (turning their heads), flyers (birds or bats looping), spin (wheels),
// swing (hammers, branches) and walkers (animals ambling along a line); plays its sound loops and occasional calls.
import { Vector3 } from 'three';

const V = (x, y, z) => new Vector3(x, y, z);

// d: { id, name, art, artAlt, words: { WORDS, ORDER, CULTURE }, ground, bounds, build(scene) -> world, particles(scene, world) -> { update, show, gust? },
//      loops: [[sound, [x,y,z], range, vol]], calls: [[sound, [x,y,z], range, vol, minGap, maxGap]], animate(world, dt, time, alive),
//      sideOf, swimClamp, waterDrift, text, finale, ambience }
export function townModule(d) {
  let fx = null; const next = [];
  const mod = {
    id: d.id, name: d.name, art: d.art, artAlt: d.artAlt,
    WORDS: d.words.WORDS, ORDER: d.words.ORDER, CULTURE: d.words.CULTURE,
    ground: d.ground, bounds: d.bounds || { boundsRadius: 160, ceiling: 100 },
    build(scene) {
      const world = d.build(scene);
      fx = d.particles ? d.particles(scene, world) : null;
      next.length = 0; for (const c of d.calls || []) next.push(c[4] * (0.4 + Math.random() * 0.6));
      return world;
    },
    sideOf: d.sideOf || (() => 0),
    swimClamp: d.swimClamp,
    waterDrift: d.waterDrift,
    text: d.text,
    update(dt, time, life, ctx) {
      const { world, audio, running, nearGain } = ctx, alive = life > 0.5;
      world.movers.length = 0;
      if (alive) {
        for (const r of world.rock || []) { r.g.position.y = r.home.y + Math.sin(time * 1.6 + (r.ph || 0)) * (r.amp ?? 0.05); r.g.rotation.z = (r.rz || 0) + Math.sin(time * 1.1 + (r.ph || 0)) * 0.035; }
        for (const f of world.fish || []) { const a = time * f.speed + f.phase; f.g.position.set(f.home.x + Math.cos(a) * f.rx, f.home.y, f.home.z + Math.sin(a) * f.rz); f.g.rotation.y = -a; }
        for (const b of world.birds || []) b.g.rotation.y = b.ry + Math.sin(time * 0.9 + b.phase) * 0.45;
        for (const s of world.spin || []) s.g.rotation[s.axis || 'x'] += dt * s.speed;
        for (const s of world.swing || []) s.g.rotation[s.axis || 'x'] = (s.base || 0) + (s.pound ? -Math.max(0, Math.sin(time * s.speed + (s.ph || 0))) : Math.sin(time * s.speed + (s.ph || 0))) * s.amp;
        for (const w of world.walkers || []) { const t = (Math.sin(time * w.speed + (w.ph || 0)) + 1) / 2; w.g.position.lerpVectors(w.a, w.b, t); w.g.rotation.y = Math.cos(time * w.speed + (w.ph || 0)) >= 0 ? w.ryAB : w.ryAB + Math.PI; }
      }
      for (const s of world.flyers || []) {
        // (still in the sketch: they hang at their first place until the town wakes)
        const a = alive ? time * s.speed + s.phase : s.phase, x = s.c.x + Math.cos(a) * s.rx, z = s.c.z + Math.sin(a) * s.rz, y = s.c.y + Math.sin(a * 2) * (s.ry ?? 1.2);
        s.g.position.set(x, y, z); s.g.rotation.y = Math.atan2(-Math.sin(a) * s.rx, Math.cos(a) * s.rz);      // (facing along its path; the model looks along +z)
        if (s.wings) { const fl = alive ? Math.sin(time * (s.flap || 16) + s.phase) * 0.7 : 0.35; s.wings[0].rotation.z = fl; s.wings[1].rotation.z = -fl; }
      }
      d.animate?.(world, dt, time, alive);
      if (alive && running) {
        for (const [name, p, range, vol] of d.loops || []) audio.setLoop(name, nearGain(V(...p), range), { vol });
        (d.calls || []).forEach(([name, p, range, vol, lo, hi], i) => {
          next[i] -= dt;
          if (next[i] <= 0) { next[i] = lo + Math.random() * (hi - lo); const pos = V(...p), g = nearGain(pos, range); if (g > 0.04) audio.playNear(name, pos, range, vol, { initGain: g }); }
        });
      }
      fx?.update(dt);
    },
    onWake() { fx?.show(); },
    onAlive() { fx?.show(); },
    finale: { ...d.finale, climax(ctx) { fx?.gust?.(); if (d.finale.cry) ctx.audio.playClip(d.finale.cry, 0.22); } },
    ambience: d.ambience,
  };
  return mod;
}
