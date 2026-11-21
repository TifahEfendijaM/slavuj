# Slavuj

A promo mini game for easybosnian.com. A nightingale flies over a sketched, colourless Mostar. Each glowing orb asks which Bosnian word names a thing; the right answer plays a short scene in which that thing is painted in watercolour, and the word goes into the feather journal. When every orb is done, the fleur-de-lis finale brings the whole town to life and it can be explored freely.

Three.js + Vite. Live at https://tifahefendijam.github.io/slavuj/ (repo TifahEfendijaM/slavuj; every push to `main` republishes).

## Status
- Only Mostar (summer, approved) is public. Sarajevo (autumn), Jahorina (winter), Jajce (spring) and Neum (summer, extra) are built but marked `wip` in `src/maps/index.js`: on the public site they show on the Bosnia map, locked, as "in development"; locally they play with a "Work in progress" banner. The user is leaning towards redoing them.
- Next big step (not started): putting the game on the easybosnian platform (repo fahro/bosanski-jezik, branch `develop`; the user has write access, Fahrudin owns it). Plan discussed on 2026-11-21: a public page such as `/slavuj` on the website plus a row in the app's Practice tab; the game stays its own build in a folder of the site; progress in the browser for guests and saved to the account when signed in; no easybosnian.com links inside the platform version. Open questions: energy cost or XP, app size (~10 MB), a new backend endpoint for progress. Work on a feature branch and a pull request into `develop`, never `main`.

## Maps
- Summer: Mostar. Autumn: Sarajevo old town with Žuta tabija. Winter: Jahorina. Spring: Jajce. Extra: Neum. Also liked: Trebević, Igman, Vrelo Bosne, Blagaj.
- About 40 words per map; words without a recording use the browser's synthetic voice (record.html lists every map's words). *Ljubav* (was *ašikovanje*) still needs recording.
- "Skip to the finale" (pause menu) is for players too. `?unlock` opens every map on the Bosnia map (locally).

## Rules from the user
- A new map is started only when the user says so.
- Assets must be CC0 or commercially usable; log each in `assets/CREDITS.md`.
- A word colours only what it names. Everything stays frozen until the finale.
- No clipping: people, animals, the bird and the cameras keep clear of solid things.
- When the user says "revert exactly", restore the previous code with no difference.
- Say clearly what was checked in code, what was looked at, and what is still unverified.
- When the user asks to hold a change back from the public page, keep it local until they say so.

## Controls
- Desktop: mouse steers, Space flaps, hold the mouse button to dive (walk on the ground, paddle on water), E opens an orb, J journal, F sing, Esc pause. The pause menu has Sound on/off (remembered), Bosnia map, Restart, Skip to the finale.
- Phone (decided at the very start of the page, in `index.html`; landscape only): a floating joystick, flap and dive buttons, Open at an orb, pause and sing buttons. Code in `src/touch.js`. Known: Brave on iPhone leaves the notch areas empty in landscape (Safari is fine).

## Where things are
- `src/maps/`: one module per map; `index.js` lists them in order. Mostar's world is `src/world.js`, the others use `src/kit.js`.
- `src/bosnia.js`: the Bosnia map page. `src/boot.js` chooses between it and a map (`?map=<id>`) and reloads once if an outdated cached page cannot load its code.
- `src/settings.js`: values to tweak. `src/vocab.js`: Mostar's words. `src/fall.js`: falling leaves and blossom.
- `src/people.js`: people and animals (and what walks towards the bird, so it flies off). `src/flight.js`: flying, landing, walking, swimming. `src/main.js`: game flow.
- `assets/audio/words/`: the user's own recordings, made with `record.html` (dev server only). `assets/photos/`: default journal photos.

## Working on it
- `npm run dev` (port 5183). Test with `?slot=test&fresh` so the user's save is untouched; `window.__game` has test hooks (`step`, `skipToFinale`, `startFinale`, `view`, `checkShots`, `flight`, `people`...).
- The public build can be previewed with the `slavuj-public` launch config (port 5190).
