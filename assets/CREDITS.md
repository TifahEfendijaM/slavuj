# Credits and licenses

Only CC0 or commercially usable assets are allowed in this game. Every downloaded or third-party asset is listed here.

| Asset | Used for | Source | License |
|---|---|---|---|
| Caveat (font) | Bosnian words, titles | npm `@fontsource/caveat` (Google Fonts, Impallari Type) | SIL Open Font License 1.1 |
| Patrick Hand (font) | Interface text | npm `@fontsource/patrick-hand` (Google Fonts, Patrick Wagesreiter) | SIL Open Font License 1.1 |
| three.js | 3D engine | npm `three` | MIT |
| `journal-mostar.webp` | Painting of Stari Most on the journal's Mostar page | Original, made by the project owner (with an AI image tool) | Owned by the project; cleared for publishing |
| `audio/words/*.wav` | Pronunciation of every word | Recorded by the project owner (native speaker) | Owned by the project |
| `audio/sfx/sheep-2348.mp3`, `sheep-2349.mp3` | Sheep bleating (played pitched up) | BigSoundBank, Joseph Sardin: "Sheep #6" (2348), "Sheep #7" (2349) | CC0 |
| `audio/sfx/applause.mp3` | The crowd's applause | BigSoundBank, Joseph Sardin: "Applause about 25-50 people #1" (0812) | CC0 |
| `audio/sfx/horse-neigh.mp3` | The horse neighing | BigSoundBank, Joseph Sardin: "Horse Neighing #3" (0863) | CC0 |
| `audio/sfx/cat-meow.mp3` | The cat miaowing | BigSoundBank, Joseph Sardin: "Little Meow of a Cat #1" (0494) | CC0 |
| `audio/sfx/dog-bark.mp3`, `audio/sfx/dog-bark2.mp3` | The dog barking (two double barks cut from the recording) | BigSoundBank, Joseph Sardin: "Barking Dog #2" (2954) | CC0 |
| `audio/sfx/fountain.mp3` | The šadrvan's water (24 s loop, mono) | BigSoundBank, Joseph Sardin: "Fountain of a Japanese Temple" (0913) | CC0 |

Everything else is generated in code and belongs to the project: the bird, the town, all textures, the journal drawing, the music and the other sound effects.

## Word pronunciation

Every word the game says (105, including the answer choices) is recorded by the project owner, a native speaker,
in `assets/audio/words/` (one `.wav` per word, named after the word in lower case without diacritics: `kuca.wav`,
`dzamija.wav`, `pola devet.wav` ...). These recordings belong to the project. Free native recordings were looked for
first (Wikimedia Commons: Lingua Libre and Wiktionary) but existed for only 7 of the words.

To redo a word: run the game (`npm run dev`), open `http://localhost:5183/record.html`, record it again and save
(Enter); it replaces the old file. A word without a recording would fall back to the visitor's browser speech voice.
