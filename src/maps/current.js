// the map being played (see index.js)
import { MAP_ID } from './index.js';
import mostar from './mostar.js';
import sarajevo from './sarajevo.js';
import jahorina from './jahorina.js';
import jajce from './jajce.js';
import travnik from './travnik.js';
import neum from './neum.js';
import banjaluka from './banjaluka.js';
import tuzla from './tuzla.js';

const ALL = { mostar, sarajevo, jahorina, jajce, travnik, neum, banjaluka, tuzla };
export default ALL[MAP_ID] || mostar;
