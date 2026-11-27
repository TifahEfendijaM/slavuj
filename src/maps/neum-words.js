// Neum (summer / Adriatic Sea): 75 learnable words + finale word 'ljeto' (76 total).
// Zero overlap with Mostar (82), Sarajevo (79), Jahorina (76), or Jajce (73). Answer positions balanced 25/25/25.

export const WORDS = {
  // Zone 1: Adriatic Sea, Bay & Marine Life (13)
  more:        { word: 'more',        en: 'sea',                     prompt: 'The sparkling turquoise Adriatic stretches out before Neum. Which word is it?',        choices: ['more', 'rijeka', 'jezero'] },
  talas:       { word: 'talas',       en: 'wave',                    prompt: 'White-crested swells roll gently onto the sunlit shore. Which word is it?',            choices: ['oblak', 'talas', 'vjetar'] },
  zaljev:      { word: 'zaljev',      en: 'bay',                     prompt: 'Green limestone hills curve around this calm sheltered stretch of sea. Which word is it?', choices: ['kanjon', 'dolina', 'zaljev'] },
  ostrvo:      { word: 'ostrvo',      en: 'island',                  prompt: 'A small pine-crowned piece of land sits surrounded by blue water. Which word is it?',  choices: ['ostrvo', 'brdo', 'obala'] },
  hrid:        { word: 'hrid',        en: 'sea cliff / reef rock',   prompt: 'A pale steep limestone crag rises straight out of the clear sea. Which word is it?',   choices: ['zid', 'hrid', 'kula'] },
  galeb:       { word: 'galeb',       en: 'seagull',                 prompt: 'White coastal birds perch on harbour pilings and cry over the waves. Which word is it?', choices: ['golub', 'sova', 'galeb'] },
  delfin:      { word: 'delfin',      en: 'dolphin',                 prompt: 'Playful grey sea mammals leap gracefully out of the bay. Which word is it?',           choices: ['delfin', 'riba', 'labud'] },
  rak:         { word: 'rak',         en: 'crab',                    prompt: 'This bright red clawed creature scuttles sideways across the wet rocks. Which word is it?', choices: ['žaba', 'rak', 'puž'] },
  skoljka:     { word: 'školjka',     en: 'seashell / mussel',       prompt: 'Fluted pink and cream sea casings rest along the sparkling tide line. Which word is it?', choices: ['kamen', 'orah', 'školjka'] },
  hobotnica:   { word: 'hobotnica',   en: 'octopus',                 prompt: 'An eight-armed sea creature curls beside the rocky Adriatic reef. Which word is it?',  choices: ['hobotnica', 'riba', 'zmija'] },
  jezic:       { word: 'ježić',       en: 'sea urchin',              prompt: 'Spiny purple-black spheres cling to stones in the crystal-clear cove. Which word is it?', choices: ['šišarka', 'ježić', 'bundeva'] },
  plava:       { word: 'plava',       en: 'blue',                    prompt: 'What deep summer colour shines across the Adriatic bay and sky?',                      choices: ['zelena', 'žuta', 'plava'] },
  meduza:      { word: 'meduza',      en: 'jellyfish',               prompt: 'A glowing translucent umbrella creature drifts gently in the clear cove. Which word is it?', choices: ['meduza', 'leptir', 'pčela'] },

  // Zone 2: Neum Beach, Sun & Relaxation (16)
  plaza:       { word: 'plaža',       en: 'beach',                   prompt: 'Sunlit pebbles and sand curve along the waterfront for swimmers. Which word is it?',   choices: ['livada', 'plaža', 'trg'] },
  pijesak:     { word: 'pijesak',     en: 'sand',                    prompt: 'Warm fine golden grains cover the family stretch beside the sea. Which word is it?',   choices: ['snijeg', 'zemlja', 'pijesak'] },
  sljunak:     { word: 'šljunak',     en: 'pebbles',                 prompt: 'Smooth rounded white stones crunch underfoot along the Adriatic shore. Which word is it?', choices: ['šljunak', 'trava', 'lišće'] },
  suncobran:   { word: 'suncobran',   en: 'beach umbrella',          prompt: 'Bright striped canopies shade bathers from the midday summer sun. Which word is it?',  choices: ['kišobran', 'suncobran', 'šator'] },
  peskir:      { word: 'peškir',      en: 'beach towel',             prompt: 'Colourful striped cloth mats are spread neatly across the sunny shore. Which word is it?', choices: ['ćilim', 'deka', 'peškir'] },
  lezaljka:    { word: 'ležaljka',    en: 'sun lounger',             prompt: 'Wooden reclining deckchairs face the sparkling water on the beach. Which word is it?', choices: ['ležaljka', 'klupa', 'stolica'] },
  dvorac:      { word: 'dvorac',      en: 'sandcastle / castle',     prompt: 'Children sculpted tiny towers and walls out of damp sand by the tide. Which word is it?', choices: ['koliba', 'dvorac', 'mlin'] },
  lopatica:    { word: 'lopatica',    en: 'beach spade',             prompt: 'A bright little plastic shovel sticks out of the sandcastle moat. Which word is it?',  choices: ['kašika', 'sjekira', 'lopatica'] },
  dusek:       { word: 'dušek',       en: 'air mattress / float',    prompt: 'An inflatable striped pad bobs lazily on the turquoise shallows. Which word is it?',   choices: ['dušek', 'čamac', 'splav'] },
  kolut:       { word: 'kolut',       en: 'swim ring',               prompt: 'This bright round inflatable hoop helps young swimmers float safely. Which word is it?', choices: ['točak', 'kolut', 'lopta'] },
  papuce:      { word: 'papuče',      en: 'flip-flops / sandals',    prompt: 'Light open beach footwear waits neatly beside the striped towel. Which word is it?',   choices: ['čizme', 'klizaljke', 'papuče'] },
  sesir:       { word: 'šešir',       en: 'sun hat',                 prompt: 'A wide-brimmed woven straw piece shields the bather from bright sun. Which word is it?', choices: ['šešir', 'kapa', 'kaciga'] },
  suncati:     { word: 'sunčati se',  en: 'to sunbathe',             prompt: 'What are the relaxed holidaymakers doing on the warm deckchairs?',                     choices: ['klizati', 'sunčati se', 'skijati'] },
  spavati:     { word: 'spavati',     en: 'to sleep',                prompt: 'What is the tired traveller doing quietly under the striped parasol?',                 choices: ['trčati', 'pjevati', 'spavati'] },
  citati:      { word: 'čitati',      en: 'to read',                 prompt: 'What is the woman doing with the open paperback under her umbrella?',                  choices: ['čitati', 'pisati', 'slikati'] },
  knjiga:      { word: 'knjiga',      en: 'book',                    prompt: 'An open summer story lies beside the beach towel and sunglasses. Which word is it?',   choices: ['novine', 'knjiga', 'karta'] },

  // Zone 3: Water Sports, Snorkelling & Lifeguard (10)
  roniti:      { word: 'roniti',      en: 'to dive / snorkel',       prompt: 'What is the swimmer with mask and fins doing above the clear reef?',                   choices: ['veslati', 'pecati', 'roniti'] },
  maska:       { word: 'maska',       en: 'diving mask',             prompt: 'This clear-lensed gear lets swimmers see fish underwater. Which word is it?',          choices: ['maska', 'naočale', 'kaciga'] },
  peraje:      { word: 'peraje',      en: 'swim fins',               prompt: 'Broad rubber blades worn on the feet help divers glide fast underwater. Which word is it?', choices: ['skije', 'peraje', 'čizme'] },
  spasilac:    { word: 'spasilac',    en: 'lifeguard',               prompt: 'Who watches carefully over the swimmers from the tall wooden beach tower?',            choices: ['poštar', 'vozač', 'spasilac'] },
  pojas:       { word: 'pojas',       en: 'lifebuoy',                prompt: 'A red-and-white floating rescue ring hangs ready on the seaside post. Which word is it?', choices: ['pojas', 'vijenac', 'sat'] },
  tus:         { word: 'tuš',         en: 'beach shower',            prompt: 'Fresh water rinses off sea salt beneath this metal stand by the steps. Which word is it?', choices: ['česma', 'tuš', 'bunar'] },
  odbojka:     { word: 'odbojka',     en: 'volleyball',              prompt: 'Players volley a ball back and forth over the net on the sand court. Which word is it?', choices: ['fudbal', 'šah', 'odbojka'] },
  skakati:     { word: 'skakati',     en: 'to jump',                 prompt: 'What is the player at the net doing high off the sand to spike the ball?',             choices: ['skakati', 'sjediti', 'čekati'] },
  pedolina:    { word: 'pedolina',    en: 'pedal boat',              prompt: 'A bright yellow boat with foot pedals and a little slide floats offshore. Which word is it?', choices: ['kajak', 'pedolina', 'ratrak'] },
  vruce:       { word: 'vruće',       en: 'hot',                     prompt: 'He fans himself under the blazing Adriatic noon sun. How does it feel?',               choices: ['hladno', 'mokro', 'vruće'] },

  // Zone 4: Harbour, Pier & Lighthouse (12)
  luka:        { word: 'luka',        en: 'harbour / port',          prompt: 'Boats shelter safely inside this stone coastal basin. Which word is it?',              choices: ['luka', 'stanica', 'pijaca'] },
  mol:         { word: 'mol',         en: 'pier / jetty',            prompt: 'A long stone and timber walkway reaches straight out into the bay. Which word is it?', choices: ['most', 'mol', 'put'] },
  jedrilica:   { word: 'jedrilica',   en: 'sailboat',                prompt: 'This graceful wind-powered vessel glides quietly across the blue bay. Which word is it?', choices: ['autobus', 'tramvaj', 'jedrilica'] },
  jedro:       { word: 'jedro',       en: 'sail',                    prompt: 'A tall white triangular canvas catches the warm Adriatic breeze. Which word is it?',   choices: ['jedro', 'zastava', 'oblak'] },
  jedriti:     { word: 'jedriti',     en: 'to sail',                 prompt: 'What is the sailor at the tiller doing as the wind fills the canvas?',                 choices: ['hodati', 'jedriti', 'voziti'] },
  jahta:       { word: 'jahta',       en: 'yacht',                   prompt: 'A gleaming white pleasure cruiser rests moored along the harbour quay. Which word is it?', choices: ['čamac', 'splav', 'jahta'] },
  sidro:       { word: 'sidro',       en: 'anchor',                  prompt: 'This heavy iron hook holds ships steady in the harbour. Which word is it?',            choices: ['sidro', 'ključ', 'čekić'] },
  konopac:     { word: 'konopac',     en: 'rope',                    prompt: 'Thick coiled hemp cord ties the boats firmly to the stone bollard. Which word is it?', choices: ['lanac', 'konopac', 'grana'] },
  bova:        { word: 'bova',        en: 'buoy',                    prompt: 'Floating red-and-white markers line the safe swimming zone in the bay. Which word is it?', choices: ['lopta', 'lampa', 'bova'] },
  brod:        { word: 'brod',        en: 'boat / ship',             prompt: 'A sturdy wooden excursion vessel waits by the quay for bay passengers. Which word is it?', choices: ['brod', 'auto', 'bicikl'] },
  kapetan:     { word: 'kapetan',     en: 'captain',                 prompt: 'Who wears a white peaked cap and commands the ship from the deck?',                    choices: ['konobar', 'kapetan', 'mlinar'] },
  svjetionik:  { word: 'svjetionik',  en: 'lighthouse',              prompt: 'This tall white-and-red stone tower guides ships safely home at dusk. Which word is it?', choices: ['zvonik', 'dimnjak', 'svjetionik'] },

  // Zone 5: Promenade, Hotel & Seaside Konoba (13)
  setaliste:   { word: 'šetalište',   en: 'promenade',               prompt: 'A wide stone walkway lined with palms runs right beside the sea. Which word is it?',   choices: ['šetalište', 'dvorište', 'igralište'] },
  hotel:       { word: 'hotel',       en: 'hotel',                   prompt: 'This large sunlit terraced seaside building welcomes summer guests. Which word is it?', choices: ['škola', 'hotel', 'muzej'] },
  bazen:       { word: 'bazen',       en: 'swimming pool',           prompt: 'Bright turquoise water shimmers in this tiled rectangle on the terrace. Which word is it?', choices: ['bunar', 'potok', 'bazen'] },
  balkon:      { word: 'balkon',      en: 'balcony',                 prompt: 'Wrought-iron terraces look out from every room over the Adriatic bay. Which word is it?', choices: ['balkon', 'prozor', 'krov'] },
  restoran:    { word: 'restoran',    en: 'restaurant',              prompt: 'Diners gather on this open-air seaside terrace for grilled fish and drinks. Which word is it?', choices: ['pekara', 'restoran', 'apoteka'] },
  sto:         { word: 'sto',         en: 'table',                   prompt: 'Plates and cool pitchers are set out on this blue-and-white clothed surface. Which word is it?', choices: ['klupa', 'krevet', 'sto'] },
  tanjir:      { word: 'tanjir',      en: 'plate',                   prompt: 'Round white ceramic dishes are arranged neatly for seaside dinner. Which word is it?', choices: ['tanjir', 'šolja', 'džezva'] },
  casa:        { word: 'čaša',        en: 'glass',                   prompt: 'Tall clear drinking vessels glisten with cold summer refreshment. Which word is it?',  choices: ['flaša', 'čaša', 'kanta'] },
  limunada:    { word: 'limunada',    en: 'lemonade',                prompt: 'A chilled yellow citrus drink with ice cools guests on the sunny terrace. Which word is it?', choices: ['kahva', 'mlijeko', 'limunada'] },
  lubenica:    { word: 'lubenica',    en: 'watermelon',              prompt: 'Juicy bright red wedges with green rinds sit chilled on a summer platter. Which word is it?', choices: ['lubenica', 'jabuka', 'dunja'] },
  lignje:      { word: 'lignje',      en: 'calamari / squid',        prompt: 'Grilled golden Adriatic rings served with fresh lemon slices sit on the plate. Which word is it?', choices: ['ćevapi', 'lignje', 'burek'] },
  salata:      { word: 'salata',      en: 'salad',                   prompt: 'A crisp bowl of ripe tomatoes, olives, and greens sits on the table. Which word is it?', choices: ['supa', 'hljeb', 'salata'] },
  razglednica: { word: 'razglednica', en: 'postcard',                prompt: 'Colourful souvenir photo cards of Neum spin on a rack by the promenade. Which word is it?', choices: ['razglednica', 'novine', 'slika'] },

  // Zone 6: Herzegovinian Hillside & Mediterranean Nature (11)
  vila:        { word: 'vila',        en: 'villa',                   prompt: 'Whitewashed limestone houses with red tile roofs climb the sunny hill. Which word is it?', choices: ['koliba', 'vila', 'tvrđava'] },
  palma:       { word: 'palma',       en: 'palm tree',               prompt: 'Tall coastal trees with spreading green fan fronds sway by the water. Which word is it?', choices: ['lipa', 'bor', 'palma'] },
  maslina:     { word: 'maslina',     en: 'olive tree',              prompt: 'Ancient silvery-green Herzegovinian trees grow along the stone terraces. Which word is it?', choices: ['maslina', 'vrba', 'šljiva'] },
  smokva:      { word: 'smokva',      en: 'fig tree',                prompt: 'Broad lobed leaves shade sweet purple Mediterranean fruit on this tree. Which word is it?', choices: ['jabuka', 'smokva', 'trešnja'] },
  cempres:     { word: 'čempres',     en: 'cypress tree',            prompt: 'Slender dark-green needle trees rise like tall spires on the coastal hill. Which word is it?', choices: ['javor', 'jablan', 'čempres'] },
  lavanda:     { word: 'lavanda',     en: 'lavender',                prompt: 'Fragrant spikes of purple Mediterranean flowers line the sunny stone steps. Which word is it?', choices: ['lavanda', 'maslačak', 'lala'] },
  nar:         { word: 'nar',         en: 'pomegranate',             prompt: 'Round ruby-red Herzegovinian fruit hangs heavy on the sunlit orchard bush. Which word is it?', choices: ['orah', 'nar', 'jagoda'] },
  kaktus:      { word: 'kaktus',      en: 'cactus',                  prompt: 'Thick spiky green pads with yellow blossoms thrive on the warm karst rock. Which word is it?', choices: ['trska', 'mahovina', 'kaktus'] },
  guster:      { word: 'gušter',      en: 'lizard',                  prompt: 'A quick green reptile basks motionless on the sun-warmed stone wall. Which word is it?', choices: ['gušter', 'miš', 'mačka'] },
  ulica:       { word: 'ulica',       en: 'street',                  prompt: 'A bright stepped coastal lane winds down between white walls toward the sea. Which word is it?', choices: ['staza', 'ulica', 'obala'] },
  sest:        { word: 'šest',        en: 'six',                     prompt: 'How many tall coastal palm trees stand in a neat row along the promenade?',             choices: ['tri', 'četiri', 'šest'] },

  // Finale (1)
  ljeto:       { word: 'ljeto',       en: 'summer',                  prompt: '', choices: [] },
};

// Stage 1: first orb (more), 73 Stage-1 orbs, Stage 2 last orb (svjetionik), finale (ljeto)
export const ORDER = [
  'more',
  'talas', 'zaljev', 'ostrvo', 'hrid', 'galeb', 'delfin', 'rak', 'skoljka', 'hobotnica', 'jezic', 'plava', 'meduza',
  'plaza', 'pijesak', 'sljunak', 'suncobran', 'peskir', 'lezaljka', 'dvorac', 'lopatica', 'dusek', 'kolut', 'papuce', 'sesir', 'suncati', 'spavati', 'citati', 'knjiga',
  'roniti', 'maska', 'peraje', 'spasilac', 'pojas', 'tus', 'odbojka', 'skakati', 'pedolina', 'vruce',
  'luka', 'mol', 'jedrilica', 'jedro', 'jedriti', 'jahta', 'sidro', 'konopac', 'bova', 'brod', 'kapetan',
  'setaliste', 'hotel', 'bazen', 'balkon', 'restoran', 'sto', 'tanjir', 'casa', 'limunada', 'lubenica', 'lignje', 'salata', 'razglednica',
  'vila', 'palma', 'maslina', 'smokva', 'cempres', 'lavanda', 'nar', 'kaktus', 'guster', 'ulica', 'sest',
  'svjetionik',
  'ljeto',
];

export const CULTURE = {
  place: 'Neum',
  subtitle: 'Bosnia and Herzegovina · on the Adriatic Sea',
  facts: [
    ['Bosnia\'s window on the Adriatic', 'Neum is Bosnia and Herzegovina\'s only coastal town on the Adriatic Sea, tucked inside the calm, sunlit Neum-Klek Bay where warm turquoise water meets white Herzegovinian limestone hills.'],
    ['The sheltered bay of Klek', 'Because the green Klek peninsula shields the bay from open-sea storms, summer mornings stay calm and glassy for swimmers, snorkellers, pedal boats, and white-sailed boats gliding past the pier lighthouse.'],
    ['Mediterranean terraces', 'Above the palm-lined promenade, whitewashed villas with terracotta roofs climb terraced karst slopes filled with gnarled silvery olive trees, sweet purple figs, ruby pomegranates, lavender, and tall cypresses.'],
    ['Evenings by the sea', 'As golden sunset settles over the bay, families gather on open-air konoba terraces for grilled calamari, crisp salad, chilled watermelon, and lemonade while seagulls circle above the harbour.'],
  ],
};
