// Tuzla (summer / City of Salt & Pannonian Lakes): 75 learnable words + finale word 'so' (76 total).
// Zero overlap with Mostar, Sarajevo, Jahorina, Jajce, Neum, Travnik, or Banja Luka (531 prior words). Answer positions balanced 25/25/25.

export const WORDS = {
  // Zone 1: Pannonian Salt Lakes, Waterfalls & Neolithic Stilt Village (13)
  kristal:      { word: 'kristal',      en: 'crystal',              prompt: 'Gleaming white geometric salt blocks sparkle beside the Pannonian Lakes. Which word is it?', choices: ['kristal', 'kamen', 'led'] },
  kaskada:      { word: 'kaskada',      en: 'cascade / tiered falls', prompt: 'Salted turquoise water tumbles down white stone steps into the lake. Which word is it?',   choices: ['fontana', 'kaskada', 'potok'] },
  sojenica:     { word: 'sojenica',     en: 'stilt house',          prompt: 'Reconstructed prehistoric timber huts stand on wooden posts over the water. Which word is it?', choices: ['koliba', 'vila', 'sojenica'] },
  cup:          { word: 'ćup',          en: 'clay pot / vessel',    prompt: 'Ancient Bosnians boiled salt brine inside round earthenware jars like this. Which word is it?', choices: ['ćup', 'tanjir', 'šolja'] },
  fosil:        { word: 'fosil',        en: 'fossil',               prompt: 'A stone imprint of an ancient Pannonian sea shell rests on display. Which word is it?',       choices: ['slika', 'fosil', 'kip'] },
  mineral:      { word: 'mineral',      en: 'mineral',              prompt: 'Sparkling rock-salt and quartz specimens line the lakeside geological park. Which word is it?', choices: ['drvo', 'pijesak', 'mineral'] },
  plutati:      { word: 'plutati',      en: 'to float',             prompt: 'The salty water lifts the relaxed swimmer right on top without effort. Which verb is it?',   choices: ['plutati', 'roniti', 'trčati'] },
  prskati:      { word: 'prskati',      en: 'to splash',            prompt: 'What are the laughing children doing with the cool lake water?',                             choices: ['spavati', 'prskati', 'čitati'] },
  trambolina:   { word: 'trambolina',   en: 'trampoline',           prompt: 'A bouncy round water pad floats offshore for summer jumps. Which word is it?',               choices: ['čamac', 'dušek', 'trambolina'] },
  ljuljati:     { word: 'ljuljati',     en: 'to sway / rock',       prompt: 'What is the gentle lake hammock doing in the warm summer breeze?',                           choices: ['ljuljati', 'skakati', 'voziti'] },
  narandzasta:  { word: 'narandžasta',  en: 'orange (colour)',      prompt: 'What bright sunny citrus colour paints this row of lakeside loungers?',                      choices: ['plava', 'narandžasta', 'zelena'] },
  osam:         { word: 'osam',         en: 'eight',                prompt: 'How many crisp white salt-crystal columns stand along the lakeside terrace?',                choices: ['šest', 'sedam', 'osam'] },
  slano:        { word: 'slano',        en: 'salty',                prompt: 'Tuzla\'s lakes come from ancient underground sea deposits. How does the water taste?',       choices: ['slano', 'hladno', 'suho'] },

  // Zone 2: Salt Mine, Saltworks & Railway Heritage (13)
  rudnik:       { word: 'rudnik',       en: 'mine',                 prompt: 'This wooden hoist tower marks Tuzla\'s historic underground salt shaft. Which word is it?',  choices: ['muzej', 'rudnik', 'hotel'] },
  rudar:        { word: 'rudar',        en: 'miner',                prompt: 'Who wears a yellow helmet and lamp while working at the salt shaft?',                        choices: ['ribar', 'mlinar', 'rudar'] },
  kramp:        { word: 'kramp',        en: 'pickaxe',              prompt: 'This double-pointed iron tool breaks blocks of solid rock salt. Which word is it?',          choices: ['kramp', 'lopata', 'sjekira'] },
  svjetiljka:   { word: 'svjetiljka',   en: 'lamp / flashlight',    prompt: 'A bright round beacon shines from the front of the miner\'s helmet. Which word is it?',      choices: ['svijeća', 'svjetiljka', 'sunce'] },
  sljem:        { word: 'šljem',        en: 'hard hat / helmet',    prompt: 'This sturdy yellow protective headpiece keeps miners safe underground. Which word is it?',   choices: ['kapa', 'šešir', 'šljem'] },
  vagon:        { word: 'vagon',        en: 'train carriage / cart', prompt: 'Heavy steel rail cars haul white salt crystals out of the depot. Which word is it?',        choices: ['vagon', 'autobus', 'brod'] },
  lokomotiva:   { word: 'lokomotiva',   en: 'locomotive / engine',  prompt: 'The powerful engine at the front pulls the whole line of rail cars. Which word is it?',      choices: ['tramvaj', 'lokomotiva', 'kamion'] },
  voz:          { word: 'voz',          en: 'train',                prompt: 'Engine and carriages roll smoothly together along the steel rails. Which word is it?',       choices: ['avion', 'bicikl', 'voz'] },
  pruga:        { word: 'pruga',        en: 'railway track',        prompt: 'Timber sleepers and parallel iron tracks lead out from the saltworks. Which word is it?',    choices: ['pruga', 'cesta', 'staza'] },
  rampa:        { word: 'rampa',        en: 'crossing barrier',     prompt: 'A red-and-white striped pole lowers across the road before the train passes. Which word is it?', choices: ['ograda', 'rampa', 'most'] },
  pumpa:        { word: 'pumpa',        en: 'pump',                 prompt: 'This cast-iron wheel machine draws salty brine up from deep underground. Which word is it?', choices: ['česma', 'bunar', 'pumpa'] },
  bure:         { word: 'bure',         en: 'wooden barrel',        prompt: 'Iron-hooped oak casks store crystal salt outside the old warehouse. Which word is it?',      choices: ['bure', 'vreća', 'korpa'] },
  crna:         { word: 'crna',         en: 'black',                prompt: 'What dark colour are the shiny chunks of coal stacked beside the railway?',                  choices: ['bijela', 'crna', 'žuta'] },

  // Zone 3: Soni Trg, Korzo Promenade & City Life (13)
  taksi:        { word: 'taksi',        en: 'taxi',                 prompt: 'A bright yellow city car with a rooftop sign waits beside the square. Which word is it?',    choices: ['autobus', 'tramvaj', 'taksi'] },
  kombi:        { word: 'kombi',        en: 'van',                  prompt: 'A boxy white delivery vehicle parks near the bakery corner. Which word is it?',              choices: ['kombi', 'brod', 'jahta'] },
  motor:        { word: 'motor',        en: 'motorcycle',           prompt: 'A sleek red two-wheeled motorbike rests on its kickstand along Korzo. Which word is it?',    choices: ['bicikl', 'motor', 'romobil'] },
  kofer:        { word: 'kofer',        en: 'suitcase',             prompt: 'A travel bag with a handle and wheels stands beside the taxi stand. Which word is it?',      choices: ['ruksak', 'torba', 'kofer'] },
  sanducic:     { word: 'sandučić',     en: 'mailbox / letterbox',  prompt: 'A bright yellow post box hangs on the corner waiting for postcards. Which word is it?',      choices: ['sandučić', 'kiosk', 'prozor'] },
  karta:        { word: 'karta',        en: 'map',                  prompt: 'A colourful town guide on a board shows visitors the way to the lakes. Which word is it?',   choices: ['knjiga', 'karta', 'slika'] },
  kompas:       { word: 'kompas',       en: 'compass',              prompt: 'A brass stone medallion with a pointing needle marks north on the square. Which word is it?', choices: ['sat', 'ogledalo', 'kompas'] },
  kljuc:        { word: 'ključ',        en: 'key',                  prompt: 'A giant golden ceremonial emblem of Tuzla hangs above the old gate. Which word is it?',      choices: ['ključ', 'sidro', 'zvono'] },
  sapun:        { word: 'sapun',        en: 'soap',                 prompt: 'Handmade pastel bars crafted with Tuzla salt sit neatly on the artisan stall. Which word is it?', choices: ['sir', 'sapun', 'kamen'] },
  ogledalo:     { word: 'ogledalo',     en: 'mirror',               prompt: 'A tall silver-framed glass panel reflects the sunny street outside the shop. Which word is it?', choices: ['prozor', 'slika', 'ogledalo'] },
  patike:       { word: 'patike',       en: 'sneakers / trainers',  prompt: 'Laced white-and-blue running shoes sit displayed on the Korzo shop shelf. Which word is it?', choices: ['patike', 'čizme', 'papuče'] },
  majica:       { word: 'majica',       en: 'T-shirt',              prompt: 'A light short-sleeved summer cotton top hangs in the sunny boutique window. Which word is it?', choices: ['kaput', 'majica', 'džemper'] },
  haljina:      { word: 'haljina',      en: 'dress',                prompt: 'A flowing floral summer garment stands on display in the corner boutique. Which word is it?', choices: ['jakna', 'šal', 'haljina'] },

  // Zone 4: University, Science & Music Quarter (12)
  univerzitet:  { word: 'univerzitet',  en: 'university',           prompt: 'Students gather on the stone steps of Tuzla\'s grand higher-education hall. Which word is it?', choices: ['univerzitet', 'bolnica', 'pekara'] },
  student:      { word: 'student',      en: 'university student',   prompt: 'Who carries notebooks across the sunlit campus courtyard?',                                  choices: ['kapetan', 'student', 'kuhar'] },
  tabla:        { word: 'tabla',        en: 'chalkboard / blackboard', prompt: 'An outdoor dark-green writing board stands ready for a summer lecture. Which word is it?', choices: ['vrata', 'sto', 'tabla'] },
  kreda:        { word: 'kreda',        en: 'chalk',                prompt: 'White and coloured writing sticks rest along the ledge of the board. Which word is it?',     choices: ['kreda', 'olovka', 'pero'] },
  globus:       { word: 'globus',       en: 'globe',                prompt: 'A spinning blue-and-green model of planet Earth sits on the study desk. Which word is it?',  choices: ['lopta', 'globus', 'sunce'] },
  mikroskop:    { word: 'mikroskop',    en: 'microscope',           prompt: 'Scientists peer through this optical instrument to inspect salt crystals. Which word is it?', choices: ['dvogled', 'teleskop', 'mikroskop'] },
  olovka:       { word: 'olovka',       en: 'pencil',               prompt: 'A sharp yellow wooden writing stick rests beside the open notebook. Which word is it?',      choices: ['olovka', 'kist', 'štap'] },
  sveska:       { word: 'sveska',       en: 'notebook',             prompt: 'A spiral lined pad filled with lecture notes lies on the campus bench. Which word is it?',   choices: ['knjiga', 'sveska', 'pismo'] },
  harmonika:    { word: 'harmonika',    en: 'accordion',            prompt: 'A pleated bellows instrument fills the Tuzla evening with Bosnian sevdah. Which word is it?', choices: ['gitara', 'violina', 'harmonika'] },
  klavir:       { word: 'klavir',       en: 'piano',                prompt: 'A glossy black-and-white keyboard instrument stands inside the music pavilion. Which word is it?', choices: ['klavir', 'bubanj', 'truba'] },
  flauta:       { word: 'flauta',       en: 'flute',                prompt: 'A slender silver wind instrument sends sweet clear notes into the park. Which word is it?',  choices: ['truba', 'flauta', 'violina'] },
  pjesma:       { word: 'pjesma',       en: 'song',                 prompt: 'Floating golden musical notes rise as the singer shares a melody. Which word is it?',        choices: ['priča', 'igra', 'pjesma'] },

  // Zone 5: Tuzla Market, Bakery & Fresh Produce (13)
  kifla:        { word: 'kifla',        en: 'bread roll',           prompt: 'Warm soft crescent-shaped bakery rolls fill the wicker basket. Which word is it?',           choices: ['kifla', 'burek', 'torta'] },
  pereca:       { word: 'pereca',       en: 'pretzel',              prompt: 'Twisted golden knots sprinkled with coarse Tuzla salt cool on the tray. Which word is it?',  choices: ['krofna', 'pereca', 'somun'] },
  pekmez:       { word: 'pekmez',       en: 'jam / fruit preserve', prompt: 'Glass jars of thick sweet homemade plum spread shine in the sun. Which word is it?',         choices: ['med', 'sir', 'pekmez'] },
  limun:        { word: 'limun',        en: 'lemon',                prompt: 'Bright yellow sour citrus fruits are piled high in a wooden crate. Which word is it?',       choices: ['limun', 'jabuka', 'dunja'] },
  narandza:     { word: 'narandža',     en: 'orange (fruit)',       prompt: 'Round sweet bright-orange citrus fruit sits beside the lemons. Which word is it?',           choices: ['breskva', 'narandža', 'kruška'] },
  breskva:      { word: 'breskva',      en: 'peach',                prompt: 'Soft velvety rosy-gold summer stone fruit fills the market bowl. Which word is it?',         choices: ['jagoda', 'trešnja', 'breskva'] },
  kruska:       { word: 'kruška',       en: 'pear',                 prompt: 'Bell-shaped sweet yellow-green orchard fruit stacks neatly in a basket. Which word is it?',  choices: ['kruška', 'šljiva', 'orah'] },
  malina:       { word: 'malina',       en: 'raspberry',            prompt: 'Tiny ruby-red Bosnian berries fill small wooden market punnets. Which word is it?',          choices: ['kupina', 'malina', 'grožđe'] },
  dinja:        { word: 'dinja',        en: 'melon',                prompt: 'Round golden-skinned sweet summer melons rest on the green stall. Which word is it?',        choices: ['bundeva', 'lubenica', 'dinja'] },
  kupus:        { word: 'kupus',        en: 'cabbage',              prompt: 'Large round pale-green leafy heads sit stacked at the vegetable table. Which word is it?',   choices: ['kupus', 'salata', 'luk'] },
  krompir:      { word: 'krompir',      en: 'potato',               prompt: 'Earthy oval golden tubers spill out of a woven burlap farm sack. Which word is it?',         choices: ['mrkva', 'krompir', 'orah'] },
  grah:         { word: 'grah',         en: 'beans',                prompt: 'Speckled dried legumes fill a wooden scoop for classic Bosnian stew. Which word is it?',     choices: ['žito', 'brašno', 'grah'] },
  tikvica:      { word: 'tikvica',      en: 'courgette / zucchini', prompt: 'Slender glossy dark-green summer squash lie neatly in a market crate. Which word is it?',    choices: ['tikvica', 'krastavac', 'paprika'] },

  // Zone 6: Slana Banja Hilltop Park, Observatory & Wildlife (11)
  teleskop:     { word: 'teleskop',     en: 'telescope',            prompt: 'This long white brass-mounted tube gazes out at stars and planets. Which word is it?',       choices: ['dvogled', 'teleskop', 'mikroskop'] },
  zvjezdarnica: { word: 'zvjezdarnica', en: 'observatory',          prompt: 'This domed white hilltop tower crowns Slana Banja above the salt lakes. Which word is it?',  choices: ['tvrđava', 'svjetionik', 'zvjezdarnica'] },
  ljubicasta:   { word: 'ljubičasta',   en: 'purple',               prompt: 'What rich royal flower colour fills the terraced beds on Slana Banja?',                      choices: ['ljubičasta', 'crvena', 'žuta'] },
  kesten:       { word: 'kesten',       en: 'chestnut tree',        prompt: 'A tall shady park tree holds upright white blossom candles above the path. Which word is it?', choices: ['breza', 'kesten', 'hrast'] },
  djetlic:      { word: 'djetlić',      en: 'woodpecker',           prompt: 'A red-crowned woodland bird taps steadily against the chestnut trunk. Which word is it?',    choices: ['vrabac', 'golub', 'djetlić'] },
  krtica:       { word: 'krtica',       en: 'mole',                 prompt: 'A velvety dark little burrower peeks out from a fresh earthen mound. Which word is it?',     choices: ['krtica', 'jež', 'zec'] },
  puz:          { word: 'puž',          en: 'snail',                prompt: 'A slow little garden creature carries a spiral shell on its back. Which word is it?',        choices: ['rak', 'puž', 'žaba'] },
  svitac:       { word: 'svitac',       en: 'firefly',              prompt: 'Tiny glowing golden summer beetles twinkle above the twilight park grass. Which word is it?', choices: ['pčela', 'leptir', 'svitac'] },
  vilin:        { word: 'vilin konjic', en: 'dragonfly',            prompt: 'A shimmering turquoise four-winged insect hovers over the lakeside reeds. Which word is it?', choices: ['vilin konjic', 'bubamara', 'ptica'] },
  kabanica:     { word: 'kabanica',     en: 'raincoat',             prompt: 'A bright yellow hooded waterproof coat waits on the park hanger. Which word is it?',         choices: ['haljina', 'kabanica', 'majica'] },
  carape:       { word: 'čarape',       en: 'socks',                prompt: 'Colourful striped knitted foot warmers dry on the sunny garden line. Which word is it?',     choices: ['rukavice', 'patike', 'čarape'] },

  // Finale (1)
  so:           { word: 'so',           en: 'salt',                 prompt: '', choices: [] },
};

// Stage 1: first orb (kristal), 73 Stage-1 orbs, Stage 2 last orb (zvjezdarnica on Slana Banja), finale (so)
export const ORDER = [
  'kristal',
  'kaskada', 'sojenica', 'cup', 'fosil', 'mineral', 'plutati', 'prskati', 'trambolina', 'ljuljati', 'narandzasta', 'osam', 'slano',
  'rudnik', 'rudar', 'kramp', 'svjetiljka', 'sljem', 'vagon', 'lokomotiva', 'voz', 'pruga', 'rampa', 'pumpa', 'bure', 'crna',
  'taksi', 'kombi', 'motor', 'kofer', 'sanducic', 'karta', 'kompas', 'kljuc', 'sapun', 'ogledalo', 'patike', 'majica', 'haljina',
  'univerzitet', 'student', 'tabla', 'kreda', 'globus', 'mikroskop', 'olovka', 'sveska', 'harmonika', 'klavir', 'flauta', 'pjesma',
  'kifla', 'pereca', 'pekmez', 'limun', 'narandza', 'breskva', 'kruska', 'malina', 'dinja', 'kupus', 'krompir', 'grah', 'tikvica',
  'teleskop', 'ljubicasta', 'kesten', 'djetlic', 'krtica', 'puz', 'svitac', 'vilin', 'kabanica', 'carape',
  'zvjezdarnica',
  'so',
];

export const CULTURE = {
  place: 'Tuzla',
  subtitle: 'Bosnia and Herzegovina · the City of Salt and Pannonian Lakes',
  facts: [
    ['Seven thousand years of salt', 'Tuzla takes its name from the old word for salt (tuz). Neolithic settlers boiled salty brine in round clay pots (ćupovi) here more than 7,000 years ago, making Tuzla one of Europe\'s oldest continuously inhabited towns.'],
    ['The Pannonian Salt Lakes', 'Millions of years ago the prehistoric Pannonian Sea left deep underground rock-salt deposits beneath Tuzla. Today its three turquoise Panonska jezera are the only salt lakes right inside a European city centre.'],
    ['Stilt houses & Soni trg', 'Right beside the lakes stands a reconstructed Neolithic stilt village (sojenice), while downtown Soni trg honours the ancient salt springs alongside Korzo\'s colourful Austro-Hungarian facades.'],
    ['University, sevdah & Slana Banja', 'Home to a lively Bosnian university, famed writer Meša Selimović, and painter Ismet Mujezinović, Tuzla gathers on summer evenings for accordion songs beneath the green hillside of Slana Banja.'],
  ],
};
