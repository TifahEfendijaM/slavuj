# Slavuj

A promo mini game for easybosnian.com. A nightingale flies over a sketched, colourless Mostar. Each glowing orb asks which Bosnian word names a thing; the right answer plays a short scene in which that thing is painted in watercolour, and the word goes into the feather journal. When every orb is done, the fleur-de-lis finale brings the whole town to life and it can be explored freely.

Three.js + Vite. Live at https://tifahefendijam.github.io/slavuj/ (repo TifahEfendijaM/slavuj; every push to `main` republishes).

## Status
- Only Mostar (summer, approved) is public. Sarajevo (autumn), Jahorina (winter), Jajce (spring) and Neum (summer, extra) are built but marked `wip` in `src/maps/index.js`: on the public site they show on the Bosnia map, locked, as "in development"; locally they play with a "Work in progress" banner. The user is leaning towards redoing them.
- On easybosnian (merged into `develop` on 2026-11-21, PRs #10-#12; on the test site, not yet on easybosnian.com): the page `/slavuj` (full screen) and a band on the home page ("Fly over Bosnia and Herzegovina with Slavuj", button "Start flying"). Inside the game, the EasyBosnian logo stays visible and an "EasyBosnian menu" (start screen, Bosnia map, pause menu) shows the site's own menu. Fahrudin asked to keep it off the dashboard and the Practice tab until there are more towns; then decide together where it fits. Free, no energy; XP 2 per word learned and 20 per finished map, once each ("Skip to the finale" earns none). Guests save in the browser; signed-in players also on the account.

## Maps
- Summer: Mostar. Autumn: Sarajevo old town with Žuta tabija. Winter: Jahorina. Spring: Jajce. Extra: Neum. Also liked: Trebević, Igman, Vrelo Bosne, Blagaj.
- About 40 words per map; words without a recording use the browser's synthetic voice (record.html lists every map's words). *Ljubav* (was *ašikovanje*) is recorded.
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

## GitHub: where changes go
- **This game, `TifahEfendijaM/slavuj`**:
  - `main` is the public game: every push republishes https://tifahefendijam.github.io/slavuj/ (GitHub Pages workflow). Commit finished, approved changes here.
  - `dev` is for work in progress and experiments (the platform build, art-style trials). Pushing it publishes nothing. Merge `main` into `dev` after each public change, and `dev` into `main` only when the user approves.
- **The easybosnian platform, `fahro/bosanski-jezik`** (owner Fahrudin; the user has write access). Local copy: `~/Documents/bosanski-jezik`, a partial checkout without `backend/static` media.
  - The game lives there as a build in `frontend/public/games/slavuj/`, made with `npm run build:platform` from a clean copy of `dev` (so recordings not yet committed stay out), plus `pages/Slavuj.jsx`, `utils/slavujText.js`, `backend/app/routes/slavuj.py` and `backend/tests/test_slavuj.py`.
  - To update it: make a new branch from the latest `develop`, commit, push, open a pull request into `develop` and merge it (Fahrudin allows the user to add to `develop`). About ten minutes after the merge it is live on the test site, https://bosanski-test.up.railway.app/slavuj.
  - Never push or merge into `main` there: `main` deploys the live easybosnian.com, and Fahrudin moves `develop` into it.
  - Their CI's frontend `test:progress` check already fails on `develop` (4 tests, not ours).

## Working on it
- `npm run dev` (port 5183). Test with `?slot=test&fresh` so the user's save is untouched; `window.__game` has test hooks (`step`, `skipToFinale`, `startFinale`, `view`, `checkShots`, `flight`, `people`...).
- The public build can be previewed with the `slavuj-public` launch config (port 5190).
