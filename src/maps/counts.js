// how many words each map has (for the Bosnia map), from the word lists alone, so the map page stays light
import { ORDER as mostar } from '../vocab.js';
import { ORDER as sarajevo } from './sarajevo-words.js';
import { ORDER as jahorina } from './jahorina-words.js';
import { ORDER as jajce } from './jajce-words.js';
import { ORDER as travnik } from './travnik-words.js';
import { ORDER as neum } from './neum-words.js';
import { ORDER as banjaluka } from './banjaluka-words.js';
import { ORDER as tuzla } from './tuzla-words.js';
import { ORDER as bihac } from './bihac-words.js';
import { ORDER as visegrad } from './visegrad-words.js';
import { ORDER as blagaj } from './blagaj-words.js';
import { ORDER as brcko } from './brcko-words.js';
import { ORDER as konjic } from './konjic-words.js';

export const WORD_COUNTS = { mostar: mostar.length, sarajevo: sarajevo.length, jahorina: jahorina.length, jajce: jajce.length, travnik: travnik.length, neum: neum.length, banjaluka: banjaluka.length, tuzla: tuzla.length, bihac: bihac.length, visegrad: visegrad.length, blagaj: blagaj.length, konjic: konjic.length, brcko: brcko.length };
