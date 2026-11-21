// On the easybosnian platform. The game is built for it with `npm run build:platform` and served from the platform's
// own site (frontend/public/games/slavuj/), inside its page /slavuj (the app opens the same page).
//  - The easybosnian.com links are hidden (index.html marks the page `platform` at the very start).
//  - Progress is kept in the browser as always. A signed-in player's progress is also kept on their account, so it
//    follows them, and earns XP there (2 per word learned, 20 per map finished, each once ever; the server decides).
//    The platform keeps its sign-in in this same browser storage ('token'); its server address comes in the page's
//    address as ?api= (kept for the rest of the visit, the map pages included).
//  - Only words learned by answering count, and a finale reached without skipping: "Skip to the finale" earns no XP.
import { MAPS, saveKey, progress, markFinished } from './maps/index.js';

export const PLATFORM = import.meta.env.MODE === 'platform';
const URL_PATH = '/api/games/slavuj/progress', API_KEY = 'slavuj-api';

function apiBase() {
  const q = new URLSearchParams(location.search).get('api');
  try { if (q !== null) sessionStorage.setItem(API_KEY, q); return q ?? sessionStorage.getItem(API_KEY) ?? ''; } catch (e) { return q || ''; }
}
const token = () => { try { return localStorage.getItem('token'); } catch (e) { return null; } };
const signedIn = () => PLATFORM && !!token();

async function call(method, body, ms = 4000) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(apiBase() + URL_PATH, { method, signal: ctl.signal, headers: { Authorization: `Bearer ${token()}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
    return r.ok ? await r.json() : null;
  } catch (e) { return null; } finally { clearTimeout(timer); }
}

// what the account should know of this browser's saves: the words learned by answering, and an earned finale
const earned = (p) => ({ done: p.learned ?? (p.skipped ? [] : p.done || []), finale: !!p.finale && !p.skipped });
const mine = () => Object.fromEntries(MAPS.map((m) => [m.id, earned(progress(m.id))]).filter(([, v]) => v.done.length || v.finale));

// the account's progress into this browser's saves (only ever adds)
function absorb(maps) {
  for (const [id, sv] of Object.entries(maps || {})) {
    if (!MAPS.some((m) => m.id === id)) continue;
    const p = progress(id), done = new Set(p.done || []), learned = new Set(p.learned ?? (p.skipped ? [] : p.done || []));
    for (const w of sv.done || []) { done.add(w); learned.add(w); }
    const next = { ...p, done: [...done], learned: [...learned], finale: !!p.finale || !!sv.finale };
    try { localStorage.setItem(saveKey(id), JSON.stringify(next)); } catch (e) { /* no storage */ }
    if (next.finale) markFinished(id);
  }
}

// at the start of every page: bring the account's progress in, and send up what only this browser has (playing
// before signing in, or on another device). Never holds the game up for long: without an answer it simply goes on.
export async function pull() {
  if (!signedIn()) return;
  const got = await call('GET', null, 2500);
  if (got) absorb(got.maps);
  push(0);
}

// after each save: send the whole record (a moment later, so a burst of saves is one request)
let timer = null;
export function push(delay = 1200) {
  if (!signedIn()) return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const r = await call('PUT', { maps: mine() });
    if (r && r.xp_awarded > 0) onXp(r.xp_awarded);
  }, delay);
}

// the game shows what was earned (main.js sets this)
let onXp = () => {};
export function onXpAwarded(fn) { onXp = fn; }

// leaving the game: the platform page around it closes it (in a frame); opened on its own, back to the platform's start
export function leave() {
  if (window.parent !== window) window.parent.postMessage({ type: 'slavuj:close' }, location.origin);
  else location.href = '/';
}
// the EasyBosnian menu: the page around the game shows the site's own menu bar (logo, links, profile) above the game
export function menu() {
  if (window.parent !== window) window.parent.postMessage({ type: 'slavuj:menu' }, location.origin);
  else location.href = '/';
}
if (PLATFORM) addEventListener('click', (e) => {
  const a = e.target.closest?.('.leave, .ebmenu'); if (!a) return;
  e.preventDefault(); e.stopPropagation(); if (a.classList.contains('ebmenu')) menu(); else leave();
}, true);
