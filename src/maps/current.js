// the map being played (see index.js)
import { MAP_ID } from './index.js';
import mostar from './mostar.js';

const ALL = { mostar };
export default ALL[MAP_ID] || mostar;
