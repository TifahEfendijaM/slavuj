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
// a pin that would overlap its neighbour (Jahorina is right next to Sarajevo, Travnik right next to Jajce) or the coast (Neum)
// is drawn a little way off, with a line to its real place; the route joins the real places
const NUDGE = { jahorina: [42, 74], neum: [-96, 40], travnik: [52, -32], visegrad: [28, -58], blagaj: [112, 76], konjic: [40, 0] };
const SEASON_COL = { summer: '#f2b02a', autumn: '#d9612e', winter: '#5f9fd6', spring: '#6cb46a' };

// little drawings for each town's pin, in a 40 x 40 box
const ICON = {
  mostar: '<path d="M4 30 Q20 6 36 30" fill="none" stroke="#3b352f" stroke-width="2.4"/><path d="M2 30 H38" stroke="#3b352f" stroke-width="2.4"/><rect x="2" y="18" width="6" height="12" fill="#e8dcc4" stroke="#3b352f" stroke-width="1.8"/><rect x="32" y="16" width="6" height="14" fill="#e8dcc4" stroke="#3b352f" stroke-width="1.8"/><path d="M6 33 q4 3 8 0 t8 0 t8 0 t8 0" fill="none" stroke="#2f9a80" stroke-width="2"/>',
  sarajevo: '<path d="M8 32 V20 H32 V32 Z" fill="#e8dcc4" stroke="#3b352f" stroke-width="2"/><path d="M6 20 Q20 2 34 20 Z" fill="#7a9a7a" stroke="#3b352f" stroke-width="2"/><path d="M20 4 V0" stroke="#3b352f" stroke-width="2"/><path d="M14 32 V24 M20 32 V24 M26 32 V24" stroke="#3b352f" stroke-width="1.6"/><circle cx="31" cy="9" r="3.4" fill="#d9612e" stroke="#3b352f" stroke-width="1.2"/>',
  jahorina: '<path d="M2 34 L15 10 L22 20 L28 12 L38 34 Z" fill="#eef4fb" stroke="#3b352f" stroke-width="2"/><path d="M11 18 L15 10 L19 17 L16 15 L13 18 Z" fill="#fff" stroke="#3b352f" stroke-width="1.2"/><path d="M6 30 L9 24 L12 30 Z M28 31 L31 25 L34 31 Z" fill="#3f7a55" stroke="#3b352f" stroke-width="1.2"/>',
  jajce: '<path d="M6 8 H26 L26 30" fill="none" stroke="#3b352f" stroke-width="2"/><path d="M16 9 Q18 20 15 34 M21 9 Q23 20 21 34 M11 9 Q13 20 9 34" fill="none" stroke="#5fa8c8" stroke-width="2.4"/><path d="M26 6 l4 -4 l4 4 v8 h-8 z" fill="#e8dcc4" stroke="#3b352f" stroke-width="1.6"/><path d="M4 35 q6 -4 12 0 t12 0 t12 0" fill="none" stroke="#6cb46a" stroke-width="2"/>',
  banjaluka: '<path d="M7 30 V24" stroke="#3b352f" stroke-width="2"/><circle cx="7" cy="18" r="6.5" fill="#6cb46a" stroke="#3b352f" stroke-width="1.6"/><rect x="14" y="20" width="14" height="10" fill="#e8dcc4" stroke="#3b352f" stroke-width="1.8"/><path d="M15 20 Q21 12 27 20 Z" fill="#9ab0a0" stroke="#3b352f" stroke-width="1.6"/><path d="M30 30 V9 H34 V30 Z" fill="#e8dcc4" stroke="#3b352f" stroke-width="1.8"/><path d="M29.5 9 L32 1 L34.5 9 Z" fill="#7a9a7a" stroke="#3b352f" stroke-width="1.4"/><path d="M2 35 q5 -4 10 0 t10 0 t10 0 t10 0" fill="none" stroke="#3a8bc0" stroke-width="2.2"/>',
  bihac: '<path d="M6 30 V12 H18 V30 Z" fill="#e8dcc4" stroke="#3b352f" stroke-width="2"/><path d="M4 12 L12 3 L20 12 Z" fill="#b5654a" stroke="#3b352f" stroke-width="1.8"/><rect x="10" y="17" width="4" height="5" fill="#3b352f"/><path d="M2 31 q5 -4 10 0 t10 0 t10 0 t10 0 M2 37 q5 -4 10 0 t10 0 t10 0 t10 0" fill="none" stroke="#2fa89a" stroke-width="2.2"/><path d="M23 25 H37 L34 29 H26 Z" fill="#c89a5a" stroke="#3b352f" stroke-width="1.6"/>',
  tuzla: '<ellipse cx="18" cy="28" rx="16" ry="7" fill="#bfe0ea" stroke="#3b352f" stroke-width="2"/><path d="M8 28 q3 -2 6 0 t6 0 t6 0" fill="none" stroke="#3a8bc0" stroke-width="1.8"/><path d="M26 9 L32 6 L38 9 V16 L32 19 L26 16 Z" fill="#fbfbf6" stroke="#3b352f" stroke-width="1.6"/><path d="M26 9 L32 12 L38 9 M32 12 V19" fill="none" stroke="#3b352f" stroke-width="1.3"/><circle cx="10" cy="10" r="4.5" fill="#f2c230" stroke="#3b352f" stroke-width="1.3"/>',
  travnik: '<path d="M2 36 Q20 14 38 36 Z" fill="#cfe0b8" stroke="#3b352f" stroke-width="2"/><path d="M14 26 V10 H26 V26 Z" fill="#e8dcc4" stroke="#3b352f" stroke-width="2"/><path d="M13 10 V6 H16 V8 H19 V6 H21 V8 H24 V6 H27 V10 Z" fill="#e8dcc4" stroke="#3b352f" stroke-width="1.6"/><path d="M20 26 V20 a2 2 0 0 1 4 0 V26" fill="#3b352f"/><path d="M20 6 V0 L26 2 L20 4" fill="#d9612e" stroke="#3b352f" stroke-width="1.2"/>',
  neum: '<circle cx="28" cy="10" r="5" fill="#f2c230" stroke="#3b352f" stroke-width="1.4"/><path d="M2 26 q5 -5 10 0 t10 0 t10 0 t10 0 M2 33 q5 -5 10 0 t10 0 t10 0 t10 0" fill="none" stroke="#3a8bc0" stroke-width="2.2"/><path d="M8 20 L14 8 L14 20 Z" fill="#fff" stroke="#3b352f" stroke-width="1.4"/>',
  // the Tekija's white wall and dark bay window against the cliff, the cave and the spring
  blagaj: '<path d="M2 30 V6 Q10 2 20 4 Q30 2 38 7 V30 Z" fill="#e2dccd" stroke="#3b352f" stroke-width="1.8"/><path d="M6 30 V22 a6 6 0 0 1 12 0 V30 Z" fill="#3b352f"/><rect x="22" y="16" width="13" height="12" fill="#f6f1e4" stroke="#3b352f" stroke-width="1.6"/><path d="M20 16 L28.5 10 L37 16 Z" fill="#8f897d" stroke="#3b352f" stroke-width="1.4"/><rect x="19" y="19" width="4" height="5" fill="#7a5233" stroke="#3b352f" stroke-width="1.2"/><path d="M2 34 q5 -4 10 0 t10 0 t10 0 t10 0" fill="none" stroke="#1a8f8a" stroke-width="2.4"/>',
  konjic: '<path d="M2 26 V18 H38 V26 H34 a3 5 0 0 0 -5 0 H27 a3 5 0 0 0 -5 0 H20 a3 5 0 0 0 -5 0 H13 a3 5 0 0 0 -5 0 H6 a3 5 0 0 0 -4 0 Z" fill="#e8dcc0" stroke="#3b352f" stroke-width="1.6"/><path d="M2 32 q5 -4 10 0 t10 0 t10 0 t10 0" fill="none" stroke="#1f9c88" stroke-width="2.2"/><ellipse cx="24" cy="35" rx="7" ry="2.6" fill="#e0662a" stroke="#3b352f" stroke-width="1.4"/><path d="M28 6 L34 14 L22 14 Z M14 8 L19 14 L9 14 Z" fill="#f4f6fa" stroke="#3b352f" stroke-width="1.3"/>',
  visegrad: '<path d="M2 28 V18 H38 V28 H32 a4 6 0 0 0 -8 0 H16 a4 6 0 0 0 -8 0 Z" fill="#e8dcc0" stroke="#3b352f" stroke-width="1.8"/><rect x="17" y="8" width="6" height="10" fill="#f2e8d0" stroke="#3b352f" stroke-width="1.6"/><path d="M2 33 q5 -4 10 0 t10 0 t10 0 t10 0" fill="none" stroke="#1f9982" stroke-width="2.2"/>',
};

export function showBosnia() {
  const el = document.createElement('div'); el.id = 'bosnia'; document.body.append(el);
  const fit = () => { el.style.height = innerHeight + 'px'; }; fit(); addEventListener('resize', fit); visualViewport?.addEventListener('resize', fit);      // (the really visible height: phone browsers count their bars into 100vh)
  const pins = MAPS.map((m, i) => {
    const [rx, ry] = at(m.lon, m.lat), [nx, ny] = NUDGE[m.id] || [0, 0], x = rx + nx, y = ry + ny, p = progress(m.id), open = !m.soon && unlocked(i), done = finished(m.id), n = WORD_COUNTS[m.id] || 0;
    const words = (p.done || []).length + (p.finale ? 1 : 0);
    return { m, x, y, rx, ry, open, done, state: m.soon ? 'soon' : done ? 'done' : open ? 'open' : 'locked', words, n };
  });
  const route = pins.filter((q) => !q.m.extra).map((q) => `${q.rx.toFixed(1)},${q.ry.toFixed(1)}`).join(' ');
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
          ${q.state === 'locked' || q.state === 'soon' ? '<g class="lock" transform="translate(24,16) scale(1.3)"><rect x="-8" y="-2" width="16" height="12" rx="2"/><path d="M-5 -2 V-6 a5 5 0 0 1 10 0 V-2" fill="none"/></g>' : ''}
          ${q.state === 'done' ? '<g transform="translate(28,-30)"><circle r="13" fill="#fff8de" stroke="#3b352f" stroke-width="2"/><path d="M-5 0 L-1 4 L6 -4" fill="none" stroke="#c8891a" stroke-width="3" stroke-linecap="round"/></g>' : ''}
          <g transform="translate(-28,-30)"><circle r="13" fill="#fffaf0" stroke="#3b352f" stroke-width="2"/><text y="5" text-anchor="middle" font-size="16" font-weight="700" fill="#3b352f">${i + 1}</text></g>
          <text y="68" class="pname">${q.m.name}</text>
          <text y="92" class="pseason">${q.m.season ? `${q.m.season} · ${q.m.en}` : ''}${q.state === 'soon' ? `${q.m.season ? ' · ' : ''}in development` : q.m.wip ? ' · beta' : ''}${q.state === 'soon' ? '' : q.n ? ` · ${q.words}/${q.n}` : ''}</text>
        </g>`).join('')}
    </svg>
    <div class="bfoot eb"><a href="https://easybosnian.com" target="_blank" rel="noopener">easybosnian.com</a></div>
    <div class="bfoot pf"><a href="" class="ebmenu">EasyBosnian menu</a></div>`;
  // the place names sit clear of each other: Jahorina's label goes below the pin, Sarajevo's above
  // the frame hugs the map (a little beyond Bosnia's borders) instead of stretching across a wide screen
  const svg = el.querySelector('.bmap'), ratio = 1040 / (H + 40);
  const hug = () => { svg.style.width = ''; svg.style.width = Math.min(svg.getBoundingClientRect().width, svg.clientHeight * ratio + 5) + 'px'; };
  hug(); addEventListener('resize', hug); visualViewport?.addEventListener('resize', hug);
  for (const g of el.querySelectorAll('.pin')) {
    const q = pins[+g.dataset.i];
    if (q.m.id === 'sarajevo' || q.m.id === 'travnik') { g.querySelector('.pname').setAttribute('y', -66); g.querySelector('.pseason').setAttribute('y', -48); }      // (above its pin, clear of the neighbour/route below)
    if (q.m.id === 'banjaluka') { for (const [sel, y] of [['.pname', 0], ['.pseason', 24]]) { const t = g.querySelector(sel); t.setAttribute('x', -52); t.setAttribute('y', y); t.style.textAnchor = 'end'; } }      // (to the left of its pin, clear of Jajce below and the country title above)
    if (q.m.id === 'bihac') { for (const sel of ['.pname', '.pseason']) { const t = g.querySelector(sel); t.setAttribute('x', -36); t.style.textAnchor = 'start'; } }      // (aligned rightwards from the pin's left edge so it never clips the frame)
    if (q.m.id === 'blagaj') { for (const [sel, y] of [['.pname', 4], ['.pseason', 28]]) { const t = g.querySelector(sel); t.setAttribute('x', 50); t.setAttribute('y', y); t.style.textAnchor = 'start'; } }      // (to the right of its pin, clear of Mostar's label just above)
    if (q.m.id === 'visegrad') { for (const sel of ['.pname', '.pseason']) { const t = g.querySelector(sel); t.setAttribute('x', 36); t.style.textAnchor = 'end'; } }      // (aligned leftwards from the pin's right edge so it stays cleanly inside the eastern border)
    g.addEventListener('click', () => {
      if (q.state === 'open' || q.state === 'done') { location.href = mapUrl(q.m.id); return; }
      const prev = MAPS[+g.dataset.i - 1];
      note(q.state === 'soon' ? `${q.m.name} is still in development. Coming soon!` : `Finish ${prev.name} first to fly to ${q.m.name}.`);
    });
  }
  let nt = 0;
  function note(t) { let n = el.querySelector('.bnote'); if (!n) { n = document.createElement('div'); n.className = 'bnote wobbly'; el.append(n); } n.textContent = t; n.classList.remove('off'); clearTimeout(nt); nt = setTimeout(() => n.classList.add('off'), 2600); }
}
