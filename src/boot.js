// The page opens on the Bosnia map; ?map=<id> plays that town (see src/maps/index.js).
import { MAP_ID } from './maps/index.js';


if (MAP_ID) import('./main.js');
else {
  for (const id of ['start', 'pause', 'hud', 'skip', 'journal', 'words', 'card', 'hint', 'learn', 'barTop', 'barBot']) document.getElementById(id)?.remove();
  document.title = 'Slavuj · Bosnia';
  import('./bosnia.js').then((m) => m.showBosnia());
}
