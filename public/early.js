// Runs first, before anything else loads (a plain script, not a module; a file rather than inline, so a page with a
// strict content security policy, such as easybosnian's, runs it too).
// Phone or computer? Decided here, before anything else loads, so a phone shows its own controls (and the "turn your
// phone" note) from the first moment, on the Bosnia map too. A phone or tablet: a touch screen whose main pointer is a
// finger. Some phone browsers misreport the pointer kind right after following a link, so the browser's "mobile" flag
// and a finger tap on an earlier page count too. A laptop with a touch screen keeps its mouse controls.
if (document.documentElement.dataset.mode === 'platform') document.documentElement.classList.add('platform');      // built for the easybosnian platform (src/platform.js)
(() => {
  const n = navigator, mm = (q) => matchMedia(q).matches;
  let tapped = false; try { tapped = sessionStorage.getItem('slavuj-touch') === '1'; } catch (e) {}
  const touch = n.maxTouchPoints > 0 && (
    (mm('(pointer: coarse)') && !mm('(any-pointer: fine)'))
    || (n.userAgentData && n.userAgentData.mobile === true) || /Android|iPhone|iPad|iPod|Mobile/i.test(n.userAgent)
    || (!(mm('(pointer: fine)') && mm('(hover: hover)')) && (tapped || mm('(pointer: coarse)'))));
  if (touch) document.documentElement.classList.add('touch');
  addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') try { sessionStorage.setItem('slavuj-touch', '1'); } catch (e) {} }, { capture: true, passive: true });
})();
