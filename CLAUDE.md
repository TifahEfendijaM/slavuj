# Slavuj

A free mini game that promotes easybosnian.com (a site for learning Bosnian). You fly a small blue nightingale (*slavuj*) over a town drawn as a colourless pencil sketch. Glowing orbs float over things in the town; opening one asks which Bosnian word names that thing (three choices). The right answer plays a short camera scene in which only that thing is painted in, the word is spoken, and it goes into the feather journal. When every orb is done, a golden fleur-de-lis appears over the bridge; flying through it starts the finale: the whole town is coloured, people and animals come alive, and the town can then be explored freely.

Three.js + Vite, plain JavaScript (no framework). Live: https://tifahefendijam.github.io/slavuj/ (repo `TifahEfendijaM/slavuj`).

## Where it stands (2026-11-26)
- **Mostar (summer) is finished and approved**, and is the only public map. Lately the work has been polish from the user's screenshots: no clipping, natural poses and animations, clothes, sounds.
- **Sarajevo (autumn), Jahorina (winter), Jajce (spring), Neum (summer, extra)** are built as drafts, marked `wip` in `src/maps/index.js`. On the public site they show on the Bosnia map, locked, as "in development"; locally they play with a "Work in progress" banner. The user is leaning towards redoing them properly, to Mostar's level. Also liked as possible maps: Trebević, Igman, Vrelo Bosne, Blagaj.
- **Oil paint trial (on `dev` only):** an oil paint look for the whole Mostar map, as a switch. See "Art style" below. The user is comparing it with the watercolour and has not decided.
- **11 recordings not committed:** `assets/audio/words/` has the user's new recordings casa, dvorac, hrid, jezero, kisobran, mahala, peskir, rak, suncobran, trg and vijecnica (`.wav`, for the other maps). Leave them uncommitted until the user says they are done.

## What's next
1. The oil paint decision: keep it, adjust it, or drop it.
2. The other maps, one at a time, to Mostar's standard (about 40 words each, every word colouring only what it names, people and a finale). Start a new map only when the user says so.
3. Back onto easybosnian once there are more towns (see below).

## Rules from the user (important)
- **Where to publish:** each finished fix goes to this repo's `main` (the public game) and `dev`. Nothing goes to easybosnian (`fahro/bosanski-jezik`), on any branch, until the user says so, even when the game changed.
- **Experiments** (like the oil paint style) stay on `dev`, never `main`, until the user approves them. Keep them easy to undo completely, so switching back gives exactly the old version.
- "Revert exactly" means restore the previous code with no difference at all.
- **A word colours only what it names.** Everything else stays a frozen sketch until the finale.
- **No clipping, ever:** people, animals, the bird, held objects and the cameras keep clear of solid things and of each other. Check it in code (measure distances) and then look at it.
- Before claiming something is done, say clearly what was checked in code, what was looked at in the game, and what is still unverified.
- The user reports issues with screenshots from the public site. Usually that means fix it, check it, publish it, and tell them to refresh.

## Art style
- Everything is drawn by one shader in `src/paper.js` (`FRAG`). Colours live in the geometry; all pieces with the same "paint tag" (house, tree, river...) are merged into one mesh, coloured in as a spreading wet front by moving one number (`uT`). Ink outlines are `LineSegments2` lines plus "hull" shells (inflated back faces) for round shapes. Pencil hatching and the drawn patterns (cobbles, roof slabs, planks, kilim, water streaks) are in the shader too.
- **Style switch:** the pause menu's "Style" button switches the look while playing (remembered in the browser). The default is `style` in `src/settings.js` (`'oil'` on `dev`, the original is `'watercolor'`). `?style=watercolor` or `?style=oil` in the address overrides both.
  - Oil = the `#ifdef OIL` branch of the shader (canvas, brush strokes, warm lights and cool shadows, impasto ridges) plus `src/oil.js`. That file paints the frame into a buffer and smears it into dabs with a Kuwahara filter, then draws the ink on top, sharp, using the same depth.
  - With `'watercolor'` nothing of that runs: `createDraw()` is plain `renderer.render()`, and the watercolour shader code is untouched.
  - To drop oil entirely, revert the oil commit(s) on `dev`. To keep it, merge it into `main` only after the user approves.

## Where things are
- `index.html`: the page, menus and HUD (CSS inline). It decides at the very start whether the device is touch-only (phone controls) and whether this is the platform build.
- `src/boot.js`: shows the Bosnia map (`src/bosnia.js`) or loads a map (`?map=<id>`). If an outdated cached page can't load its code, it reloads once.
- `src/maps/index.js`: the list of maps, their order and unlocking, and save keys. Each map has a module in `src/maps/` (and a `*-words.js` file for its words). Mostar's world is `src/world.js` with `src/vocab.js` (its words); the other maps are built from `src/kit.js`.
- `src/main.js`: the game flow (orbs, quiz, colouring scenes and their cameras, journal, finale, saving, pause menu, HUD) and the test hooks.
- `src/flight.js`: flying, landing (perching), walking, hopping, swimming, and feeling for walls. The colliders are invisible meshes built with the world. `Builder.block()` adds invisible obstacles and perches; `twoSided` makes open rings solid from inside too.
- `src/people.js`: Mostar's people and animals (one shared rig: torso, head, arms with shoulder, elbow and hand), the flag, and what each does after the finale. It also covers who walks up to the bird (so it flies off).
- `src/bird.js`: the nightingale. `src/diver.js`: the diver on Stari Most. `src/fall.js`: falling leaves and blossom. `src/touch.js`: phone controls. `src/audio.js`: sounds (mostly synthesised, plus `assets/audio/sfx`), music and word pronunciation.
- `src/platform.js`: the easybosnian build (`npm run build:platform` gives `dist-platform/`). It hides the site links, adds the site's menu, and syncs progress and XP with the signed-in account.
- `src/settings.js`: values worth tweaking (flight, camera, colours, sound, style).
- `assets/audio/words/`: the user's own recordings, one per word, made with `record.html` (dev server only). Words with no recording use the browser's synthetic voice. `assets/photos/`: the default journal photos (exported with `?exportPhotos` after a full play-through). `assets/CREDITS.md`: the sources of downloaded assets.

## Working on it
- The dev server: `npm run dev` (port 5183; the launch config is named `slavuj`). Test with `?map=mostar&slot=test` (add `&fresh` for a new game), so the user's own save is untouched. The `slot=test` save is a test save; `skipToFinale()` puts it back to everything coloured.
- `window.__game` test hooks:
  - Moving the bird and camera: `flight.placeAt(x, z, yaw)`, `view(camX, camY, camZ, lookX, lookY, lookZ)`.
  - Turning things on: `start()` and `shared.uLife.value = 1` (alive).
  - The data: `people.list`, `world.colliders`.
  - The finale: `skipToFinale()` (reloads), `startFinale()`.
  - Also: `checkShots()`, `audio`.
- The start screen hides with `document.getElementById('start').style.display = 'none'`. Mostar's ground level is `world.flag.y` (the bank).
- Positions, overlaps and poses are best checked with measurements in the browser (raycasts, distances between world positions). For a pose, a small search over joint angles with clearance limits works well. Split big searches into smaller ones, or the tool times out.
- `?unlock` opens every map on the Bosnia map. "Skip to the finale" (pause menu) is for players too. The `slavuj-public` launch config (port 5190) previews the built public version.

## Git and publishing
- **This repo:**
  - `main` = the public game. Every push publishes it to GitHub Pages (the "Publish" workflow, `.github/workflows/pages.yml`, about 40 seconds).
  - `dev` = work in progress and experiments, plus the platform-mode code. Pushing `dev` publishes nothing.
  - The local folder is normally on `dev`.
- **How a fix goes out:**
  1. Commit on `dev` and push.
  2. `git checkout main`, `git pull --ff-only`, cherry-pick the commit, push.
  3. `git checkout dev`, `git merge --no-edit main`, push.
  4. Check the run with `gh run list --branch main`.
- `dev` differs from `main` on purpose (platform code, experiments). Never merge `dev` into `main` wholesale.

## easybosnian (`fahro/bosanski-jezik`, owner Fahrudin; the user has write access)
- **Done:** merged into its `develop` branch on 2026-11-21 (PRs #10–#12). The page `/slavuj` (full screen) and a band on the home page ("Fly over Bosnia and Herzegovina with Slavuj", "Start flying"). It is on the test site https://bosanski-test.up.railway.app/slavuj, not yet on easybosnian.com.
  - The game is free (no energy). XP is 2 per word learned and 20 per map finished, each once ever; skipping to the finale earns none.
  - Guests save in the browser; signed-in players also on their account.
- **How it's built there:**
  - The build lives in `frontend/public/games/slavuj/`, made with `npm run build:platform` from a clean copy of `dev`, so uncommitted recordings stay out.
  - Also there: `pages/Slavuj.jsx`, `utils/slavujText.js`, `backend/app/routes/slavuj.py`, `backend/tests/test_slavuj.py`.
  - Local copy: `~/Documents/bosanski-jezik` (a partial checkout without `backend/static` media).
- **Updating it (only when the user says so):**
  - Branch from the latest `develop`, open a PR into `develop` and merge it. About 10 minutes later it is on the test site.
  - **Never touch their `main`**: it deploys easybosnian.com, and Fahrudin moves `develop` into it.
  - Their CI's `test:progress` check already fails on `develop` (4 tests, not ours).
- **Planned, once there are more towns** (Fahrudin asked to keep it off the dashboard and the Practice tab until then):
  - The entry to the game is the nightingale mascot (`frontend/src/components/Mascot.jsx`).
  - On phones: in the Practice tab, only the mascot with its text next to it, no separate card; tapping it opens `/slavuj`.
  - On PC: the Slavuj game card shows the same mascot, slightly adapted.
  - The animation, silent: now and then it flaps its wings in place; now and then it looks at the camera and winks, never while flapping. A subtle glow that keeps fluctuating, with a very subtle grow and shrink in step with it. Respect reduced motion.
  - The earlier static glow (`.slavuj-mascot` in `native/app.css`) was removed in PR #12.

## Controls
- **Desktop:**
  - Mouse steers, Space flaps or takes off, and holding the mouse button dives (on the ground it walks, on water it paddles).
  - E opens an orb, J opens the journal, F sings, Esc pauses.
  - The pause menu has Sound on/off (on by default, remembered), Bosnia map, Restart and Skip to the finale.
- **Phone** (touch-only devices, landscape only):
  - A floating joystick, plus flap and dive buttons, Open at an orb, and pause and sing buttons.
  - Known issue: Brave on iPhone leaves the notch areas empty in landscape; Safari is fine.
