// The maps, in the order they unlock on the Bosnia map (one per season), and which one is being played.
// ?map=<id> plays a map; without it the Bosnia map is shown (src/boot.js). ?slot=<name> keeps a separate set of saves.
// (soon: shown on the map but not playable yet; wip: see below)
export const MAPS = [
  { id: 'mostar', name: 'Mostar', season: 'Ljeto', en: 'summer', lat: 43.343, lon: 17.808 },
  { id: 'sarajevo', name: 'Sarajevo', season: 'Jesen', en: 'autumn', lat: 43.859, lon: 18.431 },
  { id: 'jahorina', name: 'Jahorina', season: 'Zima', en: 'winter', lat: 43.738, lon: 18.567 },
  { id: 'jajce', name: 'Jajce', season: 'Proljeće', en: 'spring', lat: 44.342, lon: 17.270 },
  { id: 'neum', name: 'Neum', season: 'Ljeto', en: 'summer', lat: 42.923, lon: 17.615, extra: true, wip: true },      // (extra: off the season route)
  // towns planned for later: only a pin on the Bosnia map for now (no season yet, no world)
  { id: 'banjaluka', name: 'Banja Luka', lat: 44.772, lon: 17.191, extra: true, soon: true },
  { id: 'bihac', name: 'Bihać', lat: 44.817, lon: 15.871, extra: true, soon: true },
  { id: 'tuzla', name: 'Tuzla', lat: 44.538, lon: 18.676, extra: true, soon: true },
  { id: 'travnik', name: 'Travnik', season: 'Ljeto', en: 'summer', lat: 44.226, lon: 17.666, extra: true },
];
// wip: still in development. Locally it can be played (with a pre-release notice); on the public site it is shown but locked.
for (const m of MAPS) if (m.wip && import.meta.env.PROD) m.soon = true;

const params = new URLSearchParams(location.search);
const slot = params.get('slot') ? '-' + params.get('slot') : '';
const SAVE_VER = { sarajevo: 2, jahorina: 2, jajce: 2, travnik: 2 };
export const saveKey = (id) => `slavuj-${id}-${SAVE_VER[id] || 1}` + slot;      // (Mostar's key is the one it always had; Sarajevo uses -2 for a fresh save)
export const MAP_ID = MAPS.some((m) => m.id === params.get('map') && !m.soon) ? params.get('map') : null;

export function progress(id) { try { return JSON.parse(localStorage.getItem(saveKey(id)) || '{}'); } catch (e) { return {}; } }
// finishing a map is remembered on its own, so restarting it never locks the next one again
export const wonKey = (id) => saveKey(id) + '-finished';
export function markFinished(id) { try { localStorage.setItem(wonKey(id), '1'); } catch (e) { /* no storage */ } }
export const finished = (id) => { try { if (localStorage.getItem(wonKey(id))) return true; } catch (e) { /* */ } return !!progress(id).finale; };
// finished maps (not wip/soon) are all open for now so players can fly straight to any ready town;
// wip maps stay behind the previous town locally (?unlock opens them too) and are marked soon in builds
export const unlocked = (i) => (!MAPS[i].wip && !MAPS[i].soon) || params.has('unlock') || (i > 0 && finished(MAPS[i - 1].id));

// the address of a map (or of the Bosnia map, with id null), keeping the save slot
export function mapUrl(id) {
  const q = new URLSearchParams(); if (id) q.set('map', id); if (params.get('slot')) q.set('slot', params.get('slot')); if (params.has('unlock')) q.set('unlock', '');
  const s = q.toString().replace(/=(&|$)/g, '$1'); return location.pathname + (s ? '?' + s : '');
}
