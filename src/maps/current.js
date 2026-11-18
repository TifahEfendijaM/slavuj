// the map being played (see index.js)
import { MAP_ID } from './index.js';
import mostar from './mostar.js';
import sarajevo from './sarajevo.js';
import jahorina from './jahorina.js';
import jajce from './jajce.js';

const ALL = { mostar, sarajevo, jahorina, jajce };
export default ALL[MAP_ID] || mostar;
