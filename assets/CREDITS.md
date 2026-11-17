# Credits and licenses

Only CC0 or commercially usable assets are allowed in this game. Every downloaded or third-party asset is listed here.

| Asset | Used for | Source | License |
|---|---|---|---|
| Caveat (font) | Bosnian words, titles | npm `@fontsource/caveat` (Google Fonts, Impallari Type) | SIL Open Font License 1.1 |
| Patrick Hand (font) | Interface text | npm `@fontsource/patrick-hand` (Google Fonts, Patrick Wagesreiter) | SIL Open Font License 1.1 |
| three.js | 3D engine | npm `three` | MIT |
| `journal-mostar.webp` | Painting of Stari Most on the journal's Mostar page | Original, made by the project owner (with an AI image tool) | Owned by the project; cleared for publishing |
| `audio/sfx/sheep-1.mp3`, `sheep-4.mp3` | Sheep bleating | BigSoundBank, Joseph Sardin: "Sheep #1" (2343), "Sheep #4" (2346) | CC0 |
| `audio/sfx/applause-40.mp3` | The crowd's applause | BigSoundBank, Joseph Sardin: "Applause from 40 People #5" (3521) | CC0 |
| `audio/sfx/horse-neigh.mp3` | The horse neighing | BigSoundBank, Joseph Sardin: "Horse Neighing #3" (0863) | CC0 |
| `audio/sfx/cat-meow.mp3` | The cat miaowing | BigSoundBank, Joseph Sardin: "Meow Cat #2" (1890) | CC0 |

Everything else is generated in code and belongs to the project: the bird, the town, all textures, the journal drawing, the music and the other sound effects.

## Word pronunciation: not final

There are no recordings yet. Until there are, the speaker buttons use the visitor's own browser speech voice
(Croatian, Bosnian or Serbian, whichever the device has; on this Mac it is the system voice "Lana", hr-HR).
Nothing from that voice is shipped with the game, but it is only a stand-in: it is missing on many devices and
it is not a Bosnian speaker.

To replace it, put one recording per word in `assets/audio/words/`, named after the word in lower case without
diacritics (`kuca.mp3`, `dzamija.mp3`, `cilim.mp3`, `skakac.mp3` ...; mp3, m4a, ogg or wav). The game picks them
up by itself and stops using the browser voice. The answer choices that are never the right answer (krov,
okrugla, velika, slavuj) need recordings too. List the speaker and license of the recordings in the table above.
