// how many words each map has (for the Bosnia map), from the word lists alone, so the map page stays light
import { ORDER as mostar } from '../vocab.js';
import { ORDER as sarajevo } from './sarajevo-words.js';
import { ORDER as jahorina } from './jahorina-words.js';
import { ORDER as jajce } from './jajce-words.js';

export const WORD_COUNTS = { mostar: mostar.length, sarajevo: sarajevo.length, jahorina: jahorina.length, jajce: jajce.length };
