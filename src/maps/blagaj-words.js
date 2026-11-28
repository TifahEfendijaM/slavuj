// Blagaj (summer): 69 learnable words + the finale word 'mir', plus the culture travelogue page.
// Keep this module import-free so the Bosnia map (src/maps/counts.js) stays light.
export const WORDS = {
  // Zone 1: Vrelo Bune, the spring of the Buna under the cliff (10)
  vrelo:       { word: 'vrelo',        en: 'spring, source of a river',   q: 'The deep blue-green pool where the Buna wells up out of the mountain. Which word is it?', choices: ['vrelo', 'more', 'bara'] },
  pecina:      { word: 'pećina',       en: 'cave',                        q: 'The great dark opening at the foot of the cliff that the river pours out of. Which word is it?', choices: ['pećina', 'kuća', 'kapija'] },
  stijena:     { word: 'stijena',      en: 'rock face, cliff',            q: 'The towering pale limestone wall rising straight up behind the Tekija. Which word is it?', choices: ['stijena', 'oblak', 'livada'] },
  camac:       { word: 'čamac',        en: 'small boat',                  q: 'The little wooden boat that takes visitors up to the mouth of the cave. Which word is it?', choices: ['čamac', 'voz', 'kočija'] },
  veslo:       { word: 'veslo',        en: 'oar',                         q: 'The long wooden pole with a flat blade, leaning on the jetty. Which word is it?', choices: ['veslo', 'metla', 'koplje'] },
  camdzija:    { word: 'čamdžija',     en: 'boatman',                     q: 'Who rows visitors across the cold spring water towards the cave?', choices: ['čamdžija', 'pekar', 'kovač'] },
  pastrmka:    { word: 'pastrmka',     en: 'trout',                       q: 'The speckled fish darting through the icy clear water of the spring. Which word is it?', choices: ['pastrmka', 'žaba', 'kornjača'] },
  mahovina:    { word: 'mahovina',     en: 'moss',                        q: 'The soft bright green growth covering the wet rocks at the cave mouth. Which word is it?', choices: ['mahovina', 'pijesak', 'snijeg'] },
  pjena:       { word: 'pjena',        en: 'foam',                        q: 'The white froth where the spring water tumbles over the stones. Which word is it?', choices: ['pjena', 'magla', 'dim'] },
  golub:       { word: 'golub',        en: 'pigeon, dove',                q: 'The grey birds pecking for crumbs on the path beside the river. Which word is it?', choices: ['golub', 'orao', 'labud'] },

  // Zone 2: The Tekija, the dervish house on the water (12)
  tekija:      { word: 'tekija',       en: 'dervish lodge (tekke)',       q: 'The white house of the dervishes, built against the cliff right beside the spring. Which word is it?', choices: ['tekija', 'škola', 'pošta'] },
  doksat:      { word: 'doksat',       en: 'projecting bay window',       q: 'The little wooden room jutting out from the upper floor, right over the water. Which word is it?', choices: ['doksat', 'podrum', 'dimnjak'] },
  musebak:     { word: 'mušebak',      en: 'wooden window lattice',       q: 'The fine wooden grilles over the Tekija windows that let the light through. Which word is it?', choices: ['mušebak', 'zavjesa', 'ogledalo'] },
  turbe:       { word: 'turbe',        en: 'mausoleum',                   q: 'The small domed tomb beside the Tekija where two holy men are buried. Which word is it?', choices: ['turbe', 'toranj', 'bunar'] },
  nisan:       { word: 'nišan',        en: 'Ottoman headstone',           q: 'The upright white gravestones crowned with a carved turban. Which word is it?', choices: ['nišan', 'stub', 'kip'] },
  dervis:      { word: 'derviš',       en: 'dervish',                     q: 'Who wears a long robe and a white cap and lives a quiet life of prayer here?', choices: ['derviš', 'vojnik', 'ribar'] },
  serdzada:    { word: 'serdžada',     en: 'prayer rug',                  q: 'The small patterned rug laid out on the terrace for prayer. Which word is it?', choices: ['serdžada', 'peškir', 'zastava'] },
  tespih:      { word: 'tespih',       en: 'prayer beads',                q: 'The string of smooth wooden beads resting on the low bench. Which word is it?', choices: ['tespih', 'ogrlica', 'sat'] },
  papuce:      { word: 'papuče',       en: 'slippers',                    q: 'The soft leather shoes lined up at the door, for walking inside. Which word is it?', choices: ['papuče', 'čizme', 'čarape'] },
  marama:      { word: 'marama',       en: 'headscarf',                   q: 'The colourful scarves visitors borrow at the door to cover their hair. Which word is it?', choices: ['marama', 'kapa', 'rukavica'] },
  sadrvan:     { word: 'šadrvan',      en: 'ablution fountain',           q: 'The many-sided stone fountain in the courtyard, with water running from its spouts. Which word is it?', choices: ['šadrvan', 'bazen', 'kada'] },
  ibrik:       { word: 'ibrik',        en: 'copper water ewer',           q: 'The tall copper jug with a long curved spout beside the fountain. Which word is it?', choices: ['ibrik', 'lonac', 'tanjir'] },

  // Zone 3: The stalls along the path to the Tekija (10)
  tezga:       { word: 'tezga',        en: 'market stall',                q: 'The wooden stand with a striped awning where things are sold by the path. Which word is it?', choices: ['tezga', 'krevet', 'ormar'] },
  prodavacica: { word: 'prodavačica',  en: 'saleswoman',                  q: 'Who stands behind the stall and sells juice and figs to visitors?', choices: ['prodavačica', 'učiteljica', 'doktorica'] },
  nar:         { word: 'nar',          en: 'pomegranate',                 q: 'The round red fruit full of juicy seeds, piled high on the stall. Which word is it?', choices: ['nar', 'krompir', 'luk'] },
  sok:         { word: 'sok',          en: 'juice',                       q: 'The deep red drink pressed fresh from pomegranates, in glasses on the stall. Which word is it?', choices: ['sok', 'čaj', 'mlijeko'] },
  smokva:      { word: 'smokva',       en: 'fig (fruit and tree)',        q: 'The soft purple fruit of Herzegovina, in a basket under its broad-leaved tree. Which word is it?', choices: ['smokva', 'jabuka', 'kruška'] },
  med:         { word: 'med',          en: 'honey',                       q: 'The golden sweet stuff in glass jars, made by bees from the karst herbs. Which word is it?', choices: ['med', 'ulje', 'sirće'] },
  lokum:       { word: 'lokum',        en: 'Turkish delight',             q: 'The soft cubes of sweet jelly dusted with white sugar. Which word is it?', choices: ['lokum', 'hljeb', 'sir'] },
  tepsija:     { word: 'tepsija',      en: 'round copper tray',           q: 'The big round hammered copper tray the coffee is served on. Which word is it?', choices: ['tepsija', 'kofer', 'kanta'] },
  dzezva:      { word: 'džezva',       en: 'coffee pot',                  q: 'The little long-handled copper pot that Bosnian coffee is brewed in. Which word is it?', choices: ['džezva', 'flaša', 'čajnik'] },
  fildzan:     { word: 'fildžan',      en: 'small coffee cup',            q: 'The tiny handleless cup that Bosnian coffee is poured into. Which word is it?', choices: ['fildžan', 'tava', 'kašika'] },

  // Zone 4: The restaurant terrace on the water (10)
  terasa:      { word: 'terasa',       en: 'terrace',                     q: 'The wooden deck built out over the river, facing the Tekija. Which word is it?', choices: ['terasa', 'krov', 'podrum'] },
  odrina:      { word: 'odrina',       en: 'vine pergola',                q: 'The frame of wooden posts and beams over the tables, for the vine to climb on. Which word is it?', choices: ['odrina', 'ograda', 'ljestve'] },
  loza:        { word: 'loza',         en: 'grapevine',                   q: 'The climbing plant with broad leaves spread over the pergola for shade. Which word is it?', choices: ['loza', 'trska', 'bor'] },
  grozd:       { word: 'grozd',        en: 'bunch of grapes',             q: 'The dark purple clusters hanging down from the vine. Which word is it?', choices: ['grozd', 'lubenica', 'šljiva'] },
  sto:         { word: 'sto',          en: 'table',                       q: 'Where the guests sit to eat, right by the water. Which word is it?', choices: ['sto', 'prozor', 'vrata'] },
  tanjir:      { word: 'tanjir',       en: 'plate',                       q: 'The round white dish set out on each table. Which word is it?', choices: ['tanjir', 'šešir', 'točak'] },
  riba:        { word: 'riba',         en: 'fish (as food)',              q: 'The grilled trout from the Buna served on the plates. Which word is it?', choices: ['riba', 'pita', 'supa'] },
  limun:       { word: 'limun',        en: 'lemon',                       q: 'The sour yellow slices laid beside the grilled fish. Which word is it?', choices: ['limun', 'paprika', 'banana'] },
  rostilj:     { word: 'roštilj',      en: 'grill',                       q: 'The smoking charcoal grate at the back of the terrace where the fish is cooked. Which word is it?', choices: ['roštilj', 'frižider', 'sudoper'] },
  konobarica:  { word: 'konobarica',   en: 'waitress',                    q: 'Who carries the drinks out to the tables on the terrace?', choices: ['konobarica', 'pjevačica', 'frizerka'] },

  // Zone 5: The old mills on the Buna (9)
  jaz:         { word: 'jaz',          en: 'mill race (water channel)',   q: 'The stone channel that leads river water off to turn the mill wheels. Which word is it?', choices: ['jaz', 'put', 'zid'] },
  mlin:        { word: 'mlin',         en: 'watermill',                   q: 'The little stone house built over the channel, where grain is ground. Which word is it?', choices: ['mlin', 'štala', 'garaža'] },
  mlinar:      { word: 'mlinar',       en: 'miller',                      q: 'Who carries the sacks of grain and grinds them into flour?', choices: ['mlinar', 'mesar', 'krojač'] },
  zrvanj:      { word: 'žrvanj',       en: 'millstone',                   q: 'The heavy round stone wheel with a hole in the middle, leaning by the mill door. Which word is it?', choices: ['žrvanj', 'točak', 'sat'] },
  brasno:      { word: 'brašno',       en: 'flour',                       q: 'The fine white powder in the open trough, ground from wheat and corn. Which word is it?', choices: ['brašno', 'šećer', 'so'] },
  vreca:       { word: 'vreća',        en: 'sack',                        q: 'The bulging cloth bags of grain stacked by the mill door. Which word is it?', choices: ['vreća', 'kutija', 'korpa'] },
  stupa:       { word: 'stupa',        en: 'fulling mill (stamping mill)', q: 'The wooden water-driven hammers that pound woollen cloth to make it thick. Which word is it?', choices: ['stupa', 'pila', 'vaga'] },
  vuna:        { word: 'vuna',         en: 'wool',                        q: 'The soft white fleece from sheep, heaped beside the stamping mill. Which word is it?', choices: ['vuna', 'svila', 'koža'] },
  magarac:     { word: 'magarac',      en: 'donkey',                      q: 'The small grey animal with long ears that carries the sacks to the mill. Which word is it?', choices: ['magarac', 'krava', 'pas'] },

  // Zone 6: The Velagić house and the Karađoz-beg bridge (9)
  ograda:      { word: 'ograda',       en: 'stone wall (enclosure)',      q: 'The high stone wall that closes the old family house off from the lane. Which word is it?', choices: ['ograda', 'staza', 'kula'] },
  kapija:      { word: 'kapija',       en: 'courtyard gate',              q: 'The big wooden gate in the wall, with its own little stone roof. Which word is it?', choices: ['kapija', 'prozor', 'stepenice'] },
  avlija:      { word: 'avlija',       en: 'courtyard',                   q: 'The paved open yard inside the walls of the Velagić house. Which word is it?', choices: ['avlija', 'ulica', 'plaža'] },
  ploce:       { word: 'ploče',        en: 'stone roof slabs',            q: 'The flat grey stones laid like scales over the Herzegovinian roofs. Which word is it?', choices: ['ploče', 'crijep', 'slama'] },
  dimnjak:     { word: 'dimnjak',      en: 'chimney',                     q: 'Where the smoke from the hearth rises out of the stone roof. Which word is it?', choices: ['dimnjak', 'balkon', 'oluk'] },
  bunar:       { word: 'bunar',        en: 'well',                        q: 'The round stone wall in the courtyard with a bucket for drawing water. Which word is it?', choices: ['bunar', 'peć', 'sto'] },
  cempres:     { word: 'čempres',      en: 'cypress tree',                q: 'The tall slim dark-green tree standing like a candle beside the house. Which word is it?', choices: ['čempres', 'hrast', 'palma'] },
  dud:         { word: 'dud',          en: 'mulberry tree',               q: 'The broad shady tree in the courtyard whose leaves once fed silkworms. Which word is it?', choices: ['dud', 'kesten', 'jela'] },
  most:        { word: 'most',         en: 'bridge',                      q: 'The old stone crossing with five arches over the Buna, downstream. Which word is it?', choices: ['most', 'tunel', 'brana'] },

  // Zone 7: The karst above the cliff and Stjepan grad (8 + 1)
  staza:       { word: 'staza',        en: 'footpath',                    q: 'The narrow stony trail zigzagging up the hill towards the old fortress. Which word is it?', choices: ['staza', 'pruga', 'rijeka'] },
  kamenjar:    { word: 'kamenjar',     en: 'rocky karst ground',          q: 'The dry grey slope of the hills, more stone than soil. Which word is it?', choices: ['kamenjar', 'močvara', 'šuma'] },
  zalfija:     { word: 'žalfija',      en: 'sage',                        q: 'The silvery-grey herb with purple flowers that grows on the dry karst. Which word is it?', choices: ['žalfija', 'kopriva', 'djetelina'] },
  smilje:      { word: 'smilje',       en: 'immortelle (curry plant)',    q: 'The little golden-yellow flowers of the Herzegovinian hills that never wilt. Which word is it?', choices: ['smilje', 'ruža', 'lala'] },
  kornjaca:    { word: 'kornjača',     en: 'tortoise',                    q: 'The slow animal with a domed shell, crawling between the stones. Which word is it?', choices: ['kornjača', 'zec', 'jež'] },
  sokol:       { word: 'sokol',        en: 'falcon',                      q: 'The swift grey hunting bird perched on a ledge high on the cliff. Which word is it?', choices: ['sokol', 'kokoš', 'patka'] },
  lasta:       { word: 'lasta',        en: 'swallow',                     q: 'The little fork-tailed birds darting along the cliff face, with mud nests under the ledge. Which word is it?', choices: ['lasta', 'sova', 'gavran'] },
  kula:        { word: 'kula',         en: 'tower',                       q: 'The ruined stone tower on the cliff edge, high above the spring. Which word is it?', choices: ['kula', 'džamija', 'bolnica'] },
  tvrdjava:    { word: 'tvrđava',      en: 'fortress',                    q: 'The old walls of Stjepan grad, the castle of Herceg Stjepan, crowning the hill above Blagaj. Which word is it?', choices: ['tvrđava', 'pijaca', 'stanica'] },

  // Finale
  mir:         { word: 'mir',          en: 'peace, calm' },
};

export const ORDER = Object.keys(WORDS);

// The travelogue page revealed after the finale.
export const CULTURE = {
  place: 'Blagaj',
  subtitle: 'Bosnia and Herzegovina · at the spring of the Buna',
  facts: [
    ['Vrelo Bune', 'The Buna rises fully grown out of a huge cave at the foot of a cliff some 200 metres high. It is one of the strongest karst springs in Europe: cold, clear and deep blue-green all year, it flows a few kilometres to join the Neretva below Mostar.'],
    ['The Blagaj Tekija', 'Around 1520 dervishes built their lodge right at the spring, its back against the cliff and its wooden bay windows over the water. Restored in 1851, the tekke, its guest house (musafirhana) and the little turbe with two graves are still a place of quiet prayer.'],
    ['Visiting the Tekija', 'Visitors take off their shoes at the door and walk in slippers, and women borrow a headscarf. From the windows you can watch the river pouring out of the dark cave a few steps away.'],
    ['Mills and the Velagić house', 'Channels led the strong water to a row of mills, stamping mills and fulling mills on both banks. Downstream stands the Velagić house, a walled family home with courtyard and mill, a rare example of Mediterranean Herzegovinian building.'],
    ['The Karađoz-beg bridge', 'About 700 metres below the spring, a five-arched stone bridge has crossed the Buna since around 1570. It was badly damaged in 1849 and repaired with money from Belfe-Kadira, daughter of Ali-beg Velagić.'],
    ['Stjepan grad', 'On the hill above the cliff stand the ruins of the fortress of Herceg Stjepan Vukčić Kosača, the 15th-century lord whose title gave Herzegovina its name.'],
  ],
};
