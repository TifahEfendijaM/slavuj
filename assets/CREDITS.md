# Credits and licenses

Only CC0 or commercially usable assets are allowed in this game. Every downloaded or third-party asset is listed here.

| Asset | Used for | Source | License |
|---|---|---|---|
| Caveat (font) | Bosnian words, titles | npm `@fontsource/caveat` (Google Fonts, Impallari Type) | SIL Open Font License 1.1 |
| Patrick Hand (font) | Interface text | npm `@fontsource/patrick-hand` (Google Fonts, Patrick Wagesreiter) | SIL Open Font License 1.1 |
| three.js | 3D engine | npm `three` | MIT |
| `journal-mostar.webp` | Painting of Stari Most on the journal's Mostar page | Original, made by the project owner (with an AI image tool) | Owned by the project; cleared for publishing |
| `journal-sarajevo.webp` | Painting of Old Sarajevo in autumn on the journal's Sarajevo page | Original, made for the project (with an AI image tool) | Owned by the project; cleared for publishing |
| `journal-jahorina.webp` | Painting of Mount Jahorina in winter on the journal's Jahorina page | Original, made for the project (with an AI image tool) | Owned by the project; cleared for publishing |
| `audio/words/*.wav` | Pronunciation of every word | Recorded by the project owner (native speaker); temporary Sarajevo and Jahorina placeholders listed in `_tts.json` generated with Azure Neural Speech (`bs-BA-GoranNeural`) until replaced via `record.html` | Owned by the project |
| `audio/sfx/sheep-2348.mp3`, `sheep-2349.mp3` | Sheep bleating (played pitched up) | BigSoundBank, Joseph Sardin: "Sheep #6" (2348), "Sheep #7" (2349) | CC0 |
| `audio/sfx/applause.mp3` | The crowd's applause | BigSoundBank, Joseph Sardin: "Applause about 25-50 people #1" (0812) | CC0 |
| `audio/sfx/horse-neigh.mp3` | The horse neighing | BigSoundBank, Joseph Sardin: "Horse Neighing #3" (0863) | CC0 |
| `audio/sfx/cat-meow.mp3` | The cat miaowing | BigSoundBank, Joseph Sardin: "Little Meow of a Cat #1" (0494) | CC0 |
| `audio/sfx/dog-bark.mp3`, `audio/sfx/dog-bark2.mp3` | The dog barking (two double barks cut from the recording) | BigSoundBank, Joseph Sardin: "Barking Dog #2" (2954) | CC0 |
| `audio/sfx/fountain.mp3` | The šadrvan's water (24 s loop, mono) | BigSoundBank, Joseph Sardin: "Fountain of a Japanese Temple" (0913) | CC0 |
| `audio/sfx/sarajevo/kazandziluk-tapping.mp3` | Quiet coppersmith hammer tapping in Kazandžiluk (14 s loop, mono) | BigSoundBank, Pablo Bergel: "Anvil #1" (3589) | CC0 |
| `audio/sfx/sarajevo/pigeon-coo.mp3` | Pigeon cooing on Pigeon Square (3.2 s clip, mono) | Wikimedia Commons, mary905: "Dove cooing.ogg" | Public Domain |
| `audio/sfx/sarajevo/duck-quack.mp3` | Ducks quacking on the Miljacka (2.2 s clip, mono) | BigSoundBank, Joseph Sardin: "Ducks" (0276) | CC0 |
| `audio/sfx/sarajevo/tram-bell.mp3` | Sarajevo tram bell (1.6 s clip, mono) | BigSoundBank, Joseph Sardin: "Bicycle bell #3" (0974) | CC0 |
| `audio/sfx/sarajevo/tram-rumble.mp3` | Sarajevo tram rolling on steel rails (10 s loop, mono) | BigSoundBank, Joseph Sardin: "Metro Paris #2" (0092) | CC0 |
| `audio/sfx/sarajevo/chestnut-crackle.mp3` | Roasting chestnuts crackle on the quay (12 s loop, mono) | BigSoundBank, Joseph Sardin: "Fireplace #4" (2856) | CC0 |
| `audio/sfx/jahorina/hearth-fire.mp3` | Crackling outdoor mountain hearth fire (12 s loop, mono) | BigSoundBank, Joseph Sardin: "Fireplace #4" (2856) | CC0 |
| `audio/sfx/jahorina/owl-hoot.mp3` | Soft tawny owl double-hoot in the pine forest (2.8 s clip, mono) | Original, synthesised in code for the project | Owned by the project |
| `audio/sfx/jahorina/winter-wind.mp3` | Soft mountain forest wind ambience (12 s loop, mono) | Wikimedia Commons, nille: "20090610 0 ambience.ogg" | Public Domain |
| `audio/sfx/jahorina/wolf-howl.mp3` | Distant mountain wolf howl on the ridge (4.5 s clip, mono) | Wikimedia Commons: "Wolf howls.ogg" | Public Domain |

Everything else is generated in code and belongs to the project: the bird, the town, all textures, the journal drawing, the music and the other sound effects.

## Word pronunciation

Every word the game says (105, including the answer choices) is recorded by the project owner, a native speaker,
in `assets/audio/words/` (one `.wav` per word, named after the word in lower case without diacritics: `kuca.wav`,
`dzamija.wav`, `pola devet.wav` ...). These recordings belong to the project. Free native recordings were looked for
first (Wikimedia Commons: Lingua Libre and Wiktionary) but existed for only 7 of the words.

To redo a word: run the game (`npm run dev`), open `http://localhost:5183/record.html`, record it again and save
(Enter); it replaces the old file. A word without a recording would fall back to the visitor's browser speech voice.
