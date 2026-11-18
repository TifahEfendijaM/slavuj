// The Bosnia map: where the player chooses which town to fly to. The towns open one by one, a season each
// (summer, autumn, winter, spring); a finished one can be flown again. Drawn as a page of the sketchbook.
import '@fontsource/caveat/latin-700.css';
import '@fontsource/caveat/latin-ext-700.css';
import '@fontsource/patrick-hand/latin-400.css';
import '@fontsource/patrick-hand/latin-ext-400.css';
import { MAPS, progress, unlocked, mapUrl, finished } from './maps/index.js';
import { GEO } from './maps/geo.js';
import { WORD_COUNTS } from './maps/counts.js';

const { W0, N1, kx, sc } = GEO.proj;
const at = (lon, lat) => [(lon - W0) * kx * sc, (N1 - lat) * sc];
// pins that would overlap their neighbour are drawn a little way off, with a line to the real place
const NUDGE = { sarajevo: [-70, -78], jahorina: [92, 46], neum: [-96, 40] };
const SEASON_COL = { summer: '#f2b02a', autumn: '#d9612e', winter: '#5f9fd6', spring: '#6cb46a' };

// little drawings for each town's pin, in a 40 x 40 box
const ICON = {
  mostar: '<path d="M4 30 Q20 6 36 30" fill="none" stroke="#3b352f" stroke-width="2.4"/><path d="M2 30 H38" stroke="#3b352f" stroke-width="2.4"/><rect x="2" y="18" width="6" height="12" fill="#e8dcc4" stroke="#3b352f" stroke-width="1.8"/><rect x="32" y="16" width="6" height="14" fill="#e8dcc4" stroke="#3b352f" stroke-width="1.8"/><path d="M6 33 q4 3 8 0 t8 0 t8 0 t8 0" fill="none" stroke="#2f9a80" stroke-width="2"/>',
  sarajevo: '<path d="M8 32 V20 H32 V32 Z" fill="#e8dcc4" stroke="#3b352f" stroke-width="2"/><path d="M6 20 Q20 2 34 20 Z" fill="#7a9a7a" stroke="#3b352f" stroke-width="2"/><path d="M20 4 V0" stroke="#3b352f" stroke-width="2"/><path d="M14 32 V24 M20 32 V24 M26 32 V24" stroke="#3b352f" stroke-width="1.6"/><circle cx="31" cy="9" r="3.4" fill="#d9612e" stroke="#3b352f" stroke-width="1.2"/>',
  jahorina: '<path d="M2 34 L15 10 L22 20 L28 12 L38 34 Z" fill="#eef4fb" stroke="#3b352f" stroke-width="2"/><path d="M11 18 L15 10 L19 17 L16 15 L13 18 Z" fill="#fff" stroke="#3b352f" stroke-width="1.2"/><path d="M6 30 L9 24 L12 30 Z M28 31 L31 25 L34 31 Z" fill="#3f7a55" stroke="#3b352f" stroke-width="1.2"/>',
  jajce: '<path d="M6 8 H26 L26 30" fill="none" stroke="#3b352f" stroke-width="2"/><path d="M16 9 Q18 20 15 34 M21 9 Q23 20 21 34 M11 9 Q13 20 9 34" fill="none" stroke="#5fa8c8" stroke-width="2.4"/><path d="M26 6 l4 -4 l4 4 v8 h-8 z" fill="#e8dcc4" stroke="#3b352f" stroke-width="1.6"/><path d="M4 35 q6 -4 12 0 t12 0 t12 0" fill="none" stroke="#6cb46a" stroke-width="2"/>',
  neum: '<circle cx="28" cy="10" r="5" fill="#f2c230" stroke="#3b352f" stroke-width="1.4"/><path d="M2 26 q5 -5 10 0 t10 0 t10 0 t10 0 M2 33 q5 -5 10 0 t10 0 t10 0 t10 0" fill="none" stroke="#3a8bc0" stroke-width="2.2"/><path d="M8 20 L14 8 L14 20 Z" fill="#fff" stroke="#3b352f" stroke-width="1.4"/>',
};

export function showBosnia() {
  const el = document.createElement('div'); el.id = 'bosnia'; document.body.append(el);
  const pins = MAPS.map((m, i) => {
    const [rx, ry] = at(m.lon, m.lat), [nx, ny] = NUDGE[m.id] || [0, 0], x = rx + nx, y = ry + ny, p = progress(m.id), open = !m.soon && unlocked(i), done = finished(m.id), n = WORD_COUNTS[m.id] || 0;
    const words = (p.done || []).length + (p.finale ? 1 : 0);
    return { m, x, y, rx, ry, open, done, state: m.soon ? 'soon' : done ? 'done' : open ? 'open' : 'locked', words, n };
  });
  const route = pins.filter((q) => !q.m.extra).map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ');
  const H = GEO.h;
  el.innerHTML = `
    <div class="bhead"><h1>Slavuj</h1><div class="bsub">Choose where to fly · each town is a season of the year</div></div>
    <svg class="bmap" viewBox="-20 -20 1040 ${H + 40}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="wob"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter>
        <filter id="wash"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="9" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.15" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/></filter>
        <pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0 V9" stroke="#3b352f" stroke-opacity=".12" stroke-width="1.4"/></pattern>
      </defs>
      <rect x="-20" y="-20" width="1040" height="${H + 40}" fill="#cfe3ea"/>
      <rect x="-20" y="-20" width="1040" height="${H + 40}" fill="url(#hatch)" opacity=".5"/>
      <text x="70" y="${H - 70}" class="sea">Jadransko more</text>
      <g filter="url(#wob)">
        ${Object.entries(GEO.paths).filter(([k]) => k !== 'BIH').map(([, d]) => `<path d="${d}" fill="#efe6d0" stroke="#8a8172" stroke-width="2" stroke-linejoin="round"/>`).join('')}
        <path d="${GEO.paths.BIH}" fill="#f6edd6" stroke="none"/>
        <path d="${GEO.paths.BIH}" fill="#e8c98a" opacity=".55" filter="url(#wash)"/>
        <path d="${GEO.paths.BIH}" fill="none" stroke="#3b352f" stroke-width="4.2" stroke-linejoin="round"/>
        <path d="${GEO.paths.BIH}" fill="none" stroke="#3b352f" stroke-width="1.4" stroke-linejoin="round" transform="translate(3,-2)" opacity=".5"/>
      </g>
      <text x="${at(17.75, 44.95)[0]}" y="${at(17.75, 44.95)[1]}" class="country">Bosna i Hercegovina</text>
      ${pins.filter((q) => q.x !== q.rx || q.y !== q.ry).map((q) => `<path d="M${q.rx},${q.ry} L${q.x},${q.y}" class="leader"/><circle cx="${q.rx}" cy="${q.ry}" r="6" class="spot"/>`).join('')}
      <polyline points="${route}" class="route"/>
      ${pins.map((q, i) => `
        <g class="pin ${q.state}" data-i="${i}" transform="translate(${q.x.toFixed(1)},${q.y.toFixed(1)})">
          ${q.state === 'open' ? '<circle r="56" class="glow"/>' : ''}
          <circle r="40" class="disc" style="--sc:${SEASON_COL[q.m.en]}"/>
          <g transform="translate(-26,-28) scale(1.3)" class="ic">${ICON[q.m.id]}</g>
          ${q.state === 'locked' ? '<g class="lock" transform="translate(24,16) scale(1.3)"><rect x="-8" y="-2" width="16" height="12" rx="2"/><path d="M-5 -2 V-6 a5 5 0 0 1 10 0 V-2" fill="none"/></g>' : ''}
          ${q.state === 'done' ? '<g transform="translate(28,-30)"><circle r="13" fill="#fff8de" stroke="#3b352f" stroke-width="2"/><path d="M-5 0 L-1 4 L6 -4" fill="none" stroke="#c8891a" stroke-width="3" stroke-linecap="round"/></g>' : ''}
          <text y="68" class="pname">${q.m.name}</text>
          <text y="92" class="pseason">${q.m.season} · ${q.m.en}${q.state === 'soon' ? ' · later' : q.n ? ` · ${q.words}/${q.n}` : ''}</text>
        </g>`).join('')}
    </svg>
    <div class="bfoot"><a href="https://easybosnian.com" target="_blank" rel="noopener">easybosnian.com</a></div>`;
  // the place names sit clear of each other: Jahorina's label goes below the pin, Sarajevo's above
  for (const g of el.querySelectorAll('.pin')) {
    const q = pins[+g.dataset.i];
    if (q.m.id === 'sarajevo') { g.querySelector('.pname').setAttribute('y', -66); g.querySelector('.pseason').setAttribute('y', -48); }
    g.addEventListener('click', () => {
      if (q.state === 'open' || q.state === 'done') { location.href = mapUrl(q.m.id); return; }
      const prev = MAPS[+g.dataset.i - 1];
      note(q.state === 'soon' ? `${q.m.name} is coming later.` : `Finish ${prev.name} first to fly to ${q.m.name}.`);
    });
  }
  let nt = 0;
  function note(t) { let n = el.querySelector('.bnote'); if (!n) { n = document.createElement('div'); n.className = 'bnote wobbly'; el.append(n); } n.textContent = t; n.classList.remove('off'); clearTimeout(nt); nt = setTimeout(() => n.classList.add('off'), 2600); }
}
