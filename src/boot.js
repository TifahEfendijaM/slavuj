// The page opens on the Bosnia map; ?map=<id> plays that town (see src/maps/index.js).
import { MAP_ID } from './maps/index.js';
import { pull } from './platform.js';

// After a new version is published, a phone may still hold the old page for a few minutes, and that page asks for code
// files that no longer exist. Then the page is loaded again (once), which fetches the new version.
const RETRY = 'slavuj-reloaded';
function failed(e) {
  console.error('boot failed:', e);
  let again = false; try { again = sessionStorage.getItem(RETRY) === '1'; sessionStorage.setItem(RETRY, '1'); } catch (e) { /* */ }
  if (!again) { location.reload(); return; }
  const go = document.querySelector('#start .go');
  if (go) { go.innerHTML = 'Could not load · <a href="">try again</a>'; go.querySelector('a').addEventListener('click', (e) => { e.preventDefault(); location.reload(); }); }
}
const loaded = () => { try { sessionStorage.removeItem(RETRY); } catch (e) { /* */ } };
addEventListener('vite:preloadError', (e) => { e.preventDefault(); failed(); });

// on the easybosnian platform a signed-in player's progress is brought in first (src/platform.js)
pull().finally(start);
function start() {
  if (MAP_ID) import('./main.js').then(loaded, failed);
  else {
    for (const id of ['start', 'pause', 'hud', 'skip', 'journal', 'words', 'card', 'hint', 'learn', 'barTop', 'barBot', 'ebmark']) document.getElementById(id)?.remove();
    document.title = 'Slavuj · Bosnia';
    import('./bosnia.js').then((m) => { loaded(); m.showBosnia(); }, failed);
  }
}
