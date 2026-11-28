# Slavuj

A free mini game that promotes easybosnian.com (a site for learning Bosnian). You fly a small blue nightingale (*slavuj*) over a Bosnian town drawn as a colourless pencil sketch. Glowing orbs float over things in the town; opening one asks which Bosnian word names that thing (three choices). The right answer plays a short camera scene in which only that thing is painted in, the word is spoken, and it goes into the feather journal. When every orb is done, a golden fleur-de-lis appears; flying through it starts the finale: the whole town is coloured, people and animals come alive, and the town can then be explored freely.

Three.js + Vite, plain JavaScript (no framework). Live: https://tifahefendijam.github.io/slavuj/ (repo `TifahEfendijaM/slavuj`).

## Where it stands (2026-11-28)
- **Twelve finished towns**, all open from the Bosnia map (no unlocking order for finished maps). Mostar, Blagaj and Konjic were built here; the other nine were built by Fahrudin (GitHub `fahro`, owner of easybosnian, now a collaborator on this repo) and merged from his PR #1 on 2026-11-28. Built from zero, replacing the earlier rejected drafts.

  | Town | Season | Words | What it is |
  |---|---|---|---|
  | Neum | summer | 76 | the Adriatic coast: beach, harbour, sailboats, lighthouse, sunset finale |
  | Mostar | summer | 81 | the Neretva gorge, Stari Most and its diver, the bazaar |
  | Blagaj | summer | 69 | the Buna spring pouring out of the cave under the cliff, the Tekija with its bay window, the stalls, the terrace, the mills, the Velagić house, the Karađoz-beg bridge, Stjepan grad above (added 2026-11-28) |
  | Konjic | summer | 59 | the Neretva under the six-arched Old Bridge, rafting, the woodcarvers, the railway station, the river beach, Prenj, Tito's bunker (added 2026-11-28) |
  | Sarajevo | autumn | 79 | Baščaršija, the Sebilj, Vijećnica, trams, cable car, falling leaves |
  | Jahorina | winter | 76 | the Olympic ski mountain: slopes, chairlift, snow groomer, chalets, snowfall |
  | Višegrad | autumn | 68 | the Mehmed Paša Sokolović Bridge on the Drina, the old railway, autumn leaves |
  | Tuzla | summer | 76 | the city of salt: the Pannonian salt lakes, the mine, the salt train |
  | Travnik | summer | 69 | the viziers' town: Plava Voda, the trout stream, the fortress, shepherds |
  | Jajce | spring | 73 | the Pliva waterfall, the little watermills, the fortress, blossom |
  | Banja Luka | spring | 76 | the green city on the Vrbas: dajak boats, Kastel, parks and a concert |
  | Bihać | spring | 67 | the emerald Una: cascades, river islands, the lađa boat, Kapetanova kula |

- **Art style trials (on `dev` and the public `main`, since 2026-11-28):** coloured pencil, crayon, gouache, spray paint, pixel art, cel shading and comic book (the last two added 2026-11-28), beside the original watercolour (the default), switchable from the pause menu. See "Art style" below. Tried and dropped: oil paint and risograph print. The user hasn't chosen one yet.
- **Word audio:** words without the user's own recording have Azure Bosnian TTS placeholders (`.wav` in `assets/audio/words/`, listed in `assets/audio/words/_tts.json`; `record.html` marks them "TTS"). The user's own 11 recordings (casa, dvorac, hrid, jezero, kisobran, mahala, peskir, rak, suncobran, trg, vijecnica) are in the local folder only, over the committed placeholders (they show as modified). A backup is in `../slavuj-my-recordings/`. Never commit them until the user says they are done; then also take those words out of `_tts.json`.

## What's next
1. The art style decision: keep the watercolour or switch to one of the trials (and tune it). The Style button is on the public game for now.
2. Polish the new towns from the user's feedback, to Mostar's standard (see the rules below).
3. Native recordings to replace the TTS placeholders (`record.html`).

## Rules from the user (important)
- **Where to publish:** each finished fix goes to this repo's `main` (the public game) and `dev`. Nothing goes to easybosnian (`fahro/bosanski-jezik`) unless the user says so, and there only to `develop`, never `main`.
- **Experiments** (like the art styles) stay on `dev`, never `main`, until the user approves them. Keep them easy to undo completely, so switching back gives exactly the old version ("revert exactly" means no difference at all).
- **A word colours only what it names.** Everything else stays a frozen sketch until the finale.
- **No clipping, ever:** people, animals, the bird, held objects and the cameras keep clear of solid things and of each other. Every solid thing has a collider, thin things too; the bird lands right on surfaces, no hovering. Check it in code (measure distances) and then look at it.
- Every orb is reachable and its scene frames the thing clearly. People look natural and varied; local details done properly (e.g. a proper hijab). Sounds quiet and local. No heavy full-screen effects. Desktop and phone (landscape).
- Before claiming something is done, say clearly what was checked in code, what was looked at in the game, and what is still unverified.
- The user reports issues with screenshots from the public site. Usually that means fix it, check it, publish it, and tell them to refresh.

## Art style
- Everything is drawn by one shader in `src/paper.js` (`FRAG`). Colours live in the geometry; all pieces with the same "paint tag" (house, tree, river...) are merged into one mesh, coloured in as a spreading wet front by moving one number (`uT`). Ink outlines are `LineSegments2` lines plus "hull" shells (inflated back faces) for round shapes. Pencil hatching and the drawn patterns (cobbles, roof slabs, planks, kilim, water streaks) are in the shader too.
- **Style switch:** the pause menu's "Style" button cycles watercolour → coloured pencil → crayon → gouache → spray paint → pixel art → cel shading → comic book while playing (remembered in the browser). The default is `style` in `src/settings.js` (`'watercolor'`). `?style=watercolor|pencil|crayon|gouache|spray|pixel|cel|comic` overrides both.
  - Each trial is a `#ifdef STYLE_…` part of `FRAG` (helper `lineCov`). Switching rebuilds the materials with that define (`setStyle()`; `onStyle` callbacks run after). The watercolour code runs when no style define is set.
  - Pencil, crayon, gouache and spray draw in each object's own coordinates (`vLocal`, `vLN`), so the pattern stays on moving things. Things drawn with `vivid` (the bird) are fully coloured in every style.
  - Cel shading (two hard light bands, a crisp highlight and rim) and comic book (halftone dots in the shadows and sky, ink hatching in the darkest shadows) also draw bolder, darker outlines (`INK` and `applyInk()` in `paper.js`).
  - Pixel art is drawn at two thirds of the screen size into a buffer and scaled up with sharp pixels (`src/look.js`), outlines about 1.5 of its pixels wide.
  - When the user chooses: drop the unused styles (and the button, if only one is left), on both branches.

## Where things are
- `index.html`: the page, menus and HUD (CSS inline). It decides at the very start whether the device is touch-only (phone controls) and whether this is the platform build.
- `src/boot.js`: shows the Bosnia map (`src/bosnia.js`) or loads a map (`?map=<id>`). If an outdated cached page can't load its code, it reloads once.
- `src/maps/index.js`: the list of maps (order, season, position on the Bosnia map), unlocking and save keys (`SAVE_VER`). `src/maps/counts.js` and `current.js` help the Bosnia map and the loader.
- **Mostar:** `src/world.js` (the town) and `src/vocab.js` (its words, culture notes). Its people are in `src/people.js`, its photos in `assets/photos/*.jpg`.
- **The other towns**, each in `src/maps/`: `<id>.js` (the module: finale, moving things, ambient sounds, hooks like `onWake`), `<id>-world.js` (the town), `<id>-words.js` (words, order, culture notes). Their particles are separate files in `src/` (`autumn-leaves.js`, `winter-snow.js`, `spring-petals.js`, `summer-sparkles.js`, `summer-motes.js`, `bl-blossoms.js`, `tuzla-sparkles.js`, `una-spray.js`, `drina-leaves.js`); photos in `assets/photos/<id>/`, journal art `assets/journal-<id>.webp`, sounds `assets/audio/sfx/<id>/`. `src/kit.js` is left over from the old drafts and no longer used.
- **Newer towns (Konjic on) share building pieces:** `src/maps/townkit.js` (sky, houses, trees, roofs, arches, portals, orbs, the world object) and `src/maps/townmod.js` (the module from a short description: moving things, sounds, particles). `src/devcheck.js` (dev only, from the console) checks a town's cameras, landing spots, triggers and clipping, and renders its journal photos and painting.
- `src/main.js`: the game flow (orbs, quiz, colouring scenes and their cameras, journal, finale, saving, pause menu, HUD) and the test hooks. Maps can override it through their module (ground height, camera sides, water drift, shots).
- `src/flight.js`: flying, landing (perching), walking, hopping, swimming, and feeling for walls. `Builder.block()` adds invisible obstacles and perches; `twoSided` makes open rings solid from inside too.
- `src/people.js`: the people and animals (one shared rig), the flag, and what each does after the finale.
- `src/bird.js`: the nightingale. `src/diver.js`: Mostar's diver. `src/fall.js`: falling leaves and blossom. `src/touch.js`: phone controls. `src/audio.js`: sounds (synthesised plus `assets/audio/sfx`), music and word pronunciation.
- `src/platform.js` (dev only): the easybosnian build (`npm run build:platform` gives `dist-platform/`). It hides the site links, adds the site's menu, and syncs progress and XP with the signed-in account.
- `src/settings.js`: values worth tweaking (flight, camera, colours, sound, style).
- `record.html` (dev server only): record word audio, TTS placeholders first. `assets/CREDITS.md`: sources of downloaded assets.

## Working on it
- The dev server: `npm run dev` (port 5183; the launch config is named `slavuj`). Test with `?map=<id>&slot=test` (add `&fresh` for a new game), so the user's own save is untouched. `skipToFinale()` puts the test save back to everything coloured.
- `window.__game` test hooks:
  - Moving the bird and camera: `flight.placeAt(x, z, yaw)`, `view(camX, camY, camZ, lookX, lookY, lookZ)`.
  - Turning things on: `start()` and `shared.uLife.value = 1` (alive).
  - The data: `orbs`, `people.list`, `world.colliders`.
  - The finale: `skipToFinale()` (reloads), `startFinale()`. Also `checkShots()` (it checks the finale's shots too), `audio`.
- The start screen hides with `document.getElementById('start').style.display = 'none'`.
- A quick check of every town: open each `?map=<id>&slot=test&fresh`, `start()`, and look for errors and failed requests (`performance.getEntriesByType('resource')` with `responseStatus >= 400`).
- Positions, overlaps and poses are best checked with measurements in the browser (raycasts, distances). Split big searches into smaller ones, or the tool times out.
- `?unlock` opens every map. The `slavuj-public` launch config (port 5190) previews the built public version.

## Git and publishing
- **This repo:**
  - `main` = the public game. Every push publishes it to GitHub Pages (the "Publish" workflow, about 40 seconds).
  - `dev` = work in progress and experiments, plus the platform code. Pushing `dev` publishes nothing.
  - `main` is `dev`'s game without the platform code (`src/platform.js`, `public/early.js`, `build:platform`, their hooks in `index.html`, `boot.js`, `bosnia.js`, `main.js`). Everything else is the same (the art styles too). Never merge `dev` into `main` wholesale.
  - The local folder is normally on `dev`.
- **How a fix goes out:**
  1. Commit on `dev` and push.
  2. `git checkout main`, `git pull --ff-only`, cherry-pick the commit, push.
  3. `git checkout dev`, `git merge --no-edit main`, push.
  4. Check the run with `gh run list --branch main`.
- **Big changes from `dev`** (like Fahrudin's towns): apply `git diff <old dev> <new dev>` onto `main` with `git apply --3way`, resolve the conflicts by leaving out the platform code, check every town, push; then merge `main` into `dev`, keeping `dev`'s side where they clash (dev already has it all).
- **Fahrudin's work** comes in as pull requests into `dev`. Check every town before merging.

## easybosnian (`fahro/bosanski-jezik`, owner Fahrudin; the user has write access)
- **On its `develop` branch** (test site https://bosanski-test.up.railway.app):
  - The page `/slavuj` (full screen) and a home page band ("Fly over Bosnia and Herzegovina with Slavuj").
  - The nightingale mascot opens the game (PR #17, 2026-11-27): in the app's Practice tab (the app, or a phone browser signed in) and on a Slavuj card on the website dashboard. It glows (with a slight grow and shrink in step), and now and then flaps in place or winks. `frontend/src/components/SlavujMascot.jsx`, CSS in `frontend/src/index.css`, texts in `frontend/src/utils/slavujText.js`.
  - The game is free (no energy). XP is 2 per word learned and 20 per map finished, each once ever; skipping to the finale earns none. Guests save in the browser; signed-in players also on their account.
- **How it's built there:** the build lives in `frontend/public/games/slavuj/`, made with `npm run build:platform` from a clean copy of `dev` (so uncommitted recordings stay out). Also there: `pages/Slavuj.jsx`, `backend/app/routes/slavuj.py`. Local copy: `~/Documents/bosanski-jezik` (partial checkout; big checkouts are slow).
- **Updating it (only when the user says so):** branch from the latest `develop`, open a PR into `develop` and merge it. **Never touch their `main`** (it deploys easybosnian.com). Railway deploys `develop` to the test site; deploys of the user's own commits may wait until Fahrudin's next deploy or his approval.

## Controls
- **Desktop:** mouse steers, Space flaps or takes off, holding the mouse button dives (on the ground it walks, on water it paddles). E opens an orb, J the journal, F sings, Esc pauses. The pause menu has Sound on/off (on by default), Bosnia map, Restart and Skip to the finale.
- **Phone** (touch-only devices, landscape only): a floating joystick, flap and dive buttons, Open at an orb, pause and sing buttons. Known issue: Brave on iPhone leaves the notch areas empty in landscape; Safari is fine.
