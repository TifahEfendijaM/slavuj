// the map being played (see index.js)
import { MAP_ID } from './index.js';
import mostar from './mostar.js';
import sarajevo from './sarajevo.js';

const ALL = { mostar, sarajevo };
export default ALL[MAP_ID] || mostar;
