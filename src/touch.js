// Phone and tablet controls. Only used on a touch-only device (no mouse); desktop is untouched.
//  - Steer: a floating joystick. Wherever a thumb lands on the left part of the screen becomes its centre;
//    pushing sideways turns, up and down tilts. Let go and the bird flies level.
//  - Flap (Space) and Dive (hold the mouse button) as two big round buttons on the right.
//  - Small buttons for pause, sing, and "Open" when the bird is at an orb.
import S from './settings.js';

export const isTouch = (() => {
  const coarse = matchMedia('(pointer: coarse)').matches, fine = matchMedia('(any-pointer: fine)').matches;
  return navigator.maxTouchPoints > 0 && coarse && !fine;
})();

const ICON = {
  flap: '<svg viewBox="0 0 48 48"><path d="M7 38 C 15 24, 27 19, 42 21 C 34 26, 30 30, 27 40 C 21 36, 13 36, 7 38 Z" fill="#2466e8" stroke="#3b352f" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 15 V 4 M18 10 l6 -6 6 6" fill="none" stroke="#3b352f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  dive: '<svg viewBox="0 0 48 48"><path d="M24 6 C 30 16, 32 26, 24 42 C 16 26, 18 16, 24 6 Z" fill="#2466e8" stroke="#3b352f" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 30 l10 12 10 -12" fill="none" stroke="#3b352f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pause: '<svg viewBox="0 0 32 32"><path d="M11 8 V 24 M21 8 V 24" stroke="#3b352f" stroke-width="3.4" stroke-linecap="round"/></svg>',
  sing: '<svg viewBox="0 0 32 32"><path d="M12 24 V 8 L 24 5 V 21" fill="none" stroke="#3b352f" stroke-width="2.6" stroke-linejoin="round"/><circle cx="9" cy="24" r="3.6" fill="#2466e8" stroke="#3b352f" stroke-width="2"/><circle cx="21" cy="21" r="3.6" fill="#2466e8" stroke="#3b352f" stroke-width="2"/></svg>',
};

// hooks: { canPlay(), onPause(), onSing(), onOpen(), canOpen(), onTakeoff() }
export function setupTouch(inp, hooks) {
  document.body.classList.add('touch');
  const el = (tag, id, cls, html) => { const e = document.createElement(tag); if (id) e.id = id; if (cls) e.className = cls; if (html) e.innerHTML = html; document.body.append(e); return e; };
  const zone = el('div', 'tzone'), ring = el('div', 'tring'), knob = el('div', 'tknob');
  const flapB = el('button', 'tflap', 'tbtn big wobbly', ICON.flap + '<span>flap</span>');
  const diveB = el('button', 'tdive', 'tbtn big wobbly', ICON.dive + '<span>dive</span>');
  const openB = el('button', 'topen', 'tbtn wobbly off', 'Open');
  const pauseB = el('button', 'tpause', 'tbtn small wobbly', ICON.pause);
  const singB = el('button', 'tsing', 'tbtn small wobbly', ICON.sing);
  el('div', 'turn', 'overlay', '<div class="card wobbly">Turn your phone sideways to fly</div>');

  const stick = { id: null, x0: 0, y0: 0 }, state = { flap: false, dive: false };
  inp.pointer = { x: 0, y: 0 };       // always there on a phone: a released stick means level flight
  const R = () => S.touch.stickRadius;
  const setStick = (dx, dy) => {
    const r = R(), d = Math.hypot(dx, dy), c = d > r ? r / d : 1, kx = dx * c, ky = dy * c;
    knob.style.transform = `translate(${kx}px, ${ky}px)`;
    const shape = (v) => { const a = Math.abs(v) / r, dz = S.touch.deadZone; return Math.sign(v) * (a < dz ? 0 : ((a - dz) / (1 - dz)) ** S.touch.curve); };
    inp.pointer.x = shape(kx) * S.touch.turn; inp.pointer.y = shape(ky);
  };
  const place = (x, y) => { for (const e of [ring, knob]) { e.style.left = x + 'px'; e.style.top = y + 'px'; } };
  const release = () => { stick.id = null; inp.pointer.x = inp.pointer.y = 0; ring.classList.remove('on'); knob.classList.remove('on'); knob.style.transform = ''; };

  zone.addEventListener('touchstart', (e) => {
    e.preventDefault(); if (stick.id !== null || !hooks.canPlay()) return;
    const t = e.changedTouches[0]; stick.id = t.identifier; stick.x0 = t.clientX; stick.y0 = t.clientY;
    place(t.clientX, t.clientY); ring.classList.add('on'); knob.classList.add('on'); setStick(0, 0);
  }, { passive: false });
  addEventListener('touchmove', (e) => {
    for (const t of e.changedTouches) if (t.identifier === stick.id) setStick(t.clientX - stick.x0, t.clientY - stick.y0);
  }, { passive: true });
  const end = (e) => { for (const t of e.changedTouches) if (t.identifier === stick.id) release(); };
  addEventListener('touchend', end); addEventListener('touchcancel', end);

  // hold buttons: they stay pressed while the finger is on them, even if it slides a little
  const hold = (b, key, down) => {
    b.addEventListener('touchstart', (e) => { e.preventDefault(); if (!hooks.canPlay()) return; state[key] = true; b.classList.add('down'); down?.(); }, { passive: false });
    const up = (e) => { e.preventDefault(); state[key] = false; b.classList.remove('down'); };
    b.addEventListener('touchend', up); b.addEventListener('touchcancel', up);
  };
  hold(flapB, 'flap', () => hooks.onTakeoff()); hold(diveB, 'dive');
  const tap = (b, fn) => b.addEventListener('touchend', (e) => { e.preventDefault(); fn(); });
  tap(pauseB, () => hooks.onPause()); tap(singB, () => hooks.onSing()); tap(openB, () => hooks.onOpen());

  document.addEventListener('gesturestart', (e) => e.preventDefault());      // no pinch zoom (iOS)
  let n = 0;
  return {
    get flap() { return state.flap; }, get dive() { return state.dive; },
    // each frame: hide the controls when they can't be used, show Open at an orb
    update(show) {
      document.body.classList.toggle('tidle', !show);
      if (!show) { if (stick.id !== null) release(); state.flap = state.dive = false; flapB.classList.remove('down'); diveB.classList.remove('down'); }
      if (++n % 6 === 0) openB.classList.toggle('off', !(show && hooks.canOpen()));
    },
    // ask for full screen and landscape where the phone allows it (Android; an iPhone keeps its browser bars)
    enterFullscreen() {
      const d = document.documentElement;
      (d.requestFullscreen?.({ navigationUI: 'hide' }) || Promise.resolve()).then(() => screen.orientation?.lock?.('landscape')).catch(() => {});
    },
  };
}
