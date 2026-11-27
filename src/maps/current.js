// the map being played (see index.js)
import { MAP_ID } from './index.js';
import mostar from './mostar.js';
import sarajevo from './sarajevo.js';
import jahorina from './jahorina.js';
import jajce from './jajce.js';
import neum from './neum.js';
import banjaluka from './banjaluka.js';

const ALL = { mostar, sarajevo, jahorina, jajce, neum, banjaluka };
export default ALL[MAP_ID] || mostar;
