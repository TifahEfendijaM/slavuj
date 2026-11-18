# Slavuj

A promo mini game for easybosnian.com. A nightingale flies over a sketched, colourless Mostar. Each glowing orb asks which Bosnian word names a thing; the right answer plays a short scene in which that thing is painted in watercolour, and the word goes into the feather journal. When every orb is done, the fleur-de-lis finale brings the whole town to life and it can be explored freely.

Three.js + Vite. Live at https://tifahefendijam.github.io/slavuj/ (repo TifahEfendijaM/slavuj; every push to `main` republishes).

## Status
Level 1, Mostar, is complete and playable on desktop and phone: 82 words, the finale, the living town, the journal with culture pages.
Waiting on: the default journal photos (see below). Then the user reviews the finished map.

## Rules from the user
- No new maps (including the Bosnia level map) until the user has reviewed and approved this one.
- Assets must be CC0 or commercially usable; log each in `assets/CREDITS.md`.
- A word colours only what it names. Everything stays frozen until the finale.
- No clipping: people, animals, the bird and the cameras keep clear of solid things.
- When the user says "revert exactly", restore the previous code with no difference.
- Say clearly what was checked in code, what was looked at, and what is still unverified.

## Controls
- Desktop: mouse steers, Space flaps, hold the mouse button to dive (walk on the ground, paddle on water), E opens an orb, J journal, F sing, Esc pause.
- Phone (detected automatically, landscape only): a floating joystick that starts wherever the thumb lands, flap and dive buttons on the right, Open at an orb, pause and sing buttons. Code in `src/touch.js`.

## Where things are
- `src/settings.js`: values to tweak (flight, joystick, camera, audio).
- `src/world.js`: the town, its objects, the orbs and their camera shots. `src/vocab.js`: the words.
- `src/people.js`: people and animals. `src/flight.js`: flying, landing, walking, swimming. `src/main.js`: game flow.
- `assets/audio/words/`: the user's own recordings of every word, made with `record.html` (dev server only).
- `assets/photos/`: default journal photos, shown for words whose scene a player skipped.

## Working on it
- `npm run dev` (port 5183). Test with `?slot=test&fresh` so the user's save is untouched; `window.__game` has test hooks.
- Default photos: during a local run on the main save (no `?slot`), each word's photo is written to `assets/photos/` as it is taken. Commit them once the run is complete.

## Next
1. The user plays a full run locally without skipping. Commit the photos and push.
2. The user tests the phone controls from the live page on their phone.
3. After the user approves Mostar: the next map.
