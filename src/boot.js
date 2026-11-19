// The page opens on the Bosnia map; ?map=<id> plays that town (see src/maps/index.js).
import { MAP_ID } from './maps/index.js';

// remember a finger tap, so the next page (a town opened from the map) knows this is a touch screen (see touch.js)
addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') try { sessionStorage.setItem('slavuj-touch', '1'); } catch {} }, { capture: true, passive: true });

if (MAP_ID) import('./main.js');
else {
  for (const id of ['start', 'pause', 'hud', 'skip', 'journal', 'words', 'card', 'hint', 'learn', 'barTop', 'barBot']) document.getElementById(id)?.remove();
  document.title = 'Slavuj · Bosnia';
  import('./bosnia.js').then((m) => m.showBosnia());
}
