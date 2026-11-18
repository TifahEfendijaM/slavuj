// the map being played (see index.js)
import { MAP_ID } from './index.js';
import mostar from './mostar.js';
import sarajevo from './sarajevo.js';
import jahorina from './jahorina.js';

const ALL = { mostar, sarajevo, jahorina };
export default ALL[MAP_ID] || mostar;
