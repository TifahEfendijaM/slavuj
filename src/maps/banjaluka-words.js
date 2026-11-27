// Banja Luka (spring / City of Greenery on the Vrbas): 75 learnable words + finale word 'grad' (76 total).
// Zero overlap with Mostar (82), Sarajevo (79), Jahorina (76), Jajce (73), or Neum (76). Answer positions balanced 25/25/25.

export const WORDS = {
  // Zone 1: Emerald Vrbas River, Dajak Boats & Thermal Springs (12)
  dajak:       { word: 'dajak',       en: 'dajak river boat',       prompt: 'This sleek long wooden boat is Banja Luka\'s proudest symbol on the Vrbas. Which word is it?', choices: ['dajak', 'jahta', 'trajekt'] },
  dajakas:     { word: 'dajakaš',     en: 'dajak boatman',          prompt: 'Who stands upright at the stern pushing the narrow boat upstream?',                          choices: ['kapetan', 'dajakaš', 'poštar'] },
  motka:       { word: 'motka',       en: 'wooden pole',            prompt: 'The boatman pushes off the emerald riverbed with this long ash shaft. Which word is it?',   choices: ['veslo', 'grana', 'motka'] },
  pristaniste: { word: 'pristanište', en: 'river landing / dock',   prompt: 'Wooden dajak boats tie up along this timber riverside platform. Which word is it?',         choices: ['pristanište', 'stanica', 'pijaca'] },
  banja:       { word: 'banja',       en: 'thermal spa / bath',     prompt: 'Warm mineral springs bubble beside the Vrbas and gave this city its name. Which word is it?', choices: ['plaža', 'banja', 'bunar'] },
  para:        { word: 'para',        en: 'steam / vapour',         prompt: 'Soft white wisps rise off the warm natural thermal spring water. Which word is it?',        choices: ['snijeg', 'led', 'para'] },
  brzak:       { word: 'brzak',       en: 'rapids',                 prompt: 'Swift emerald currents foam white over smooth stones in the Vrbas. Which word is it?',      choices: ['brzak', 'jezero', 'bara'] },
  vir:         { word: 'vir',         en: 'river eddy / deep pool', prompt: 'Swirling deep green water circles quietly below the fortress bend. Which word is it?',      choices: ['talas', 'vir', 'potok'] },
  kamenje:     { word: 'kamenje',     en: 'river stones',           prompt: 'Smooth grey and white pebbles line the clear Vrbas riverbank. Which word is it?',           choices: ['lišće', 'pijesak', 'kamenje'] },
  caplja:      { word: 'čaplja',      en: 'heron',                  prompt: 'A tall slender grey bird wades patiently in the emerald river shallows. Which word is it?', choices: ['čaplja', 'sova', 'golub'] },
  vidra:       { word: 'vidra',       en: 'otter',                  prompt: 'A sleek brown river animal pops out onto a mossy log by the water. Which word is it?',      choices: ['lisica', 'vidra', 'mačka'] },
  mostic:      { word: 'mostić',      en: 'footbridge',             prompt: 'A graceful little timber bridge arches across the green creek. Which word is it?',          choices: ['cesta', 'staza', 'mostić'] },

  // Zone 2: Kastel Fortress & Summer Concert Stage (11)
  bastion:     { word: 'bastion',     en: 'fortress bastion',       prompt: 'This thick stone corner tower guards Kastel above the river bend. Which word is it?',       choices: ['bastion', 'balkon', 'trijem'] },
  zidine:      { word: 'zidine',      en: 'fortress walls / ramparts', prompt: 'Ancient stone battlements encircle Kastel\'s riverside courtyard. Which word is it?',    choices: ['ograda', 'zidine', 'stepenice'] },
  pozornica:   { word: 'pozornica',   en: 'stage',                  prompt: 'Musicians perform on this wide wooden platform inside Kastel courtyard. Which word is it?', choices: ['klupa', 'tezga', 'pozornica'] },
  koncert:     { word: 'koncert',     en: 'concert',                prompt: 'A live open-air musical performance fills the fortress with melody. Which word is it?',     choices: ['koncert', 'utakmica', 'izlet'] },
  violina:     { word: 'violina',     en: 'violin',                 prompt: 'A bowed wooden string instrument sings bright melodies on stage. Which word is it?',        choices: ['gitara', 'violina', 'klavir'] },
  bubanj:      { word: 'bubanj',      en: 'drum',                   prompt: 'A round percussion instrument keeps the lively rhythm on stage. Which word is it?',         choices: ['zvono', 'lonac', 'bubanj'] },
  truba:       { word: 'truba',       en: 'trumpet',                prompt: 'This gleaming brass horn shines as the musician plays a fanfare. Which word is it?',        choices: ['truba', 'svijeća', 'lampa'] },
  plesati:     { word: 'plesati',     en: 'to dance',               prompt: 'What is the joyful couple doing in front of the fortress stage?',                           choices: ['spavati', 'plesati', 'čekati'] },
  slusati:     { word: 'slušati',     en: 'to listen',              prompt: 'People sit quietly on the stone steps taking in the music. Which verb is it?',              choices: ['trčati', 'bacati', 'slušati'] },
  publika:     { word: 'publika',     en: 'audience / crowd',       prompt: 'Rows of smiling concertgoers gather in the fortress yard. Which word is it?',               choices: ['publika', 'porodica', 'ekipa'] },
  reflektor:   { word: 'reflektor',   en: 'spotlight',              prompt: 'Bright stage lamps shine down from the wooden truss over the musicians. Which word is it?', choices: ['prozor', 'reflektor', 'semafor'] },

  // Zone 3: Ferhadija, Banski Dvor & Trg Krajine (13)
  dvor:        { word: 'dvor',        en: 'palace / court',         prompt: 'Grand cream-and-ochre Banski dvor is Banja Luka\'s cultural palace. Which word is it?',     choices: ['koliba', 'vikendica', 'dvor'] },
  stub:        { word: 'stub',        en: 'column / pillar',        prompt: 'Tall fluted white stone shafts hold up the grand palace facade. Which word is it?',         choices: ['stub', 'dimnjak', 'grana'] },
  arkada:      { word: 'arkada',      en: 'arcade / arched gallery', prompt: 'A neat row of rounded stone arches frames the civic courtyard. Which word is it?',         choices: ['prolaz', 'arkada', 'krov'] },
  fontana:     { word: 'fontana',     en: 'fountain',               prompt: 'Sparkling jets of water dance in this sculpted stone basin on the square. Which word is it?', choices: ['bazen', 'bunar', 'fontana'] },
  spomenik:    { word: 'spomenik',    en: 'monument',               prompt: 'This white stone landmark crowns Banj brdo looking over the whole valley. Which word is it?', choices: ['spomenik', 'putokaz', 'svjetionik'] },
  kip:         { word: 'kip',         en: 'statue',                 prompt: 'A bronze figure of writer Petar Kočić stands proudly in the park. Which word is it?',       choices: ['slika', 'kip', 'lutka'] },
  pozoriste:   { word: 'pozorište',   en: 'theatre',                prompt: 'Actors perform plays inside this stately cream civic hall. Which word is it?',              choices: ['pekara', 'bolnica', 'pozorište'] },
  galerija:    { word: 'galerija',    en: 'art gallery',            prompt: 'Framed paintings hang on display inside this sunlit cultural hall. Which word is it?',      choices: ['galerija', 'apoteka', 'škola'] },
  kiosk:       { word: 'kiosk',       en: 'newsstand / kiosk',      prompt: 'A neat little street booth sells newspapers, tickets, and snacks. Which word is it?',       choices: ['kula', 'kiosk', 'han'] },
  trijem:      { word: 'trijem',      en: 'portico / covered porch', prompt: 'Domed stone arches shelter the carved entrance of Ferhadija Mosque. Which word is it?',    choices: ['podrum', 'tavan', 'trijem'] },
  turbe:       { word: 'turbe',       en: 'octagonal mausoleum',    prompt: 'This domed octagonal stone shrine sits peacefully in Ferhadija\'s garden. Which word is it?', choices: ['turbe', 'dućan', 'mlin'] },
  zlatna:      { word: 'zlatna',      en: 'golden',                 prompt: 'What gleaming sunlit colour shines across the domes beside the square?',                    choices: ['plava', 'zlatna', 'bijela'] },
  crvena:      { word: 'crvena',      en: 'red',                    prompt: 'What bold bright colour paints the roses and awnings along the promenade?',                 choices: ['zelena', 'žuta', 'crvena'] },

  // Zone 4: Gospodska Ulica, Cafes & Banja Luka Food (13)
  izlog:       { word: 'izlog',       en: 'shop window',            prompt: 'Bright glass storefronts display books, flowers, and pastries on Gospodska. Which word is it?', choices: ['izlog', 'vrata', 'zid'] },
  tenda:       { word: 'tenda',       en: 'awning',                 prompt: 'Striped fabric canopies shade the sidewalk cafe tables along the street. Which word is it?', choices: ['krov', 'tenda', 'jedro'] },
  knjizara:    { word: 'knjižara',    en: 'bookshop',               prompt: 'Shelves of colourful Bosnian books fill this charming corner shop. Which word is it?',      choices: ['pekara', 'slastičarna', 'knjižara'] },
  cvjecara:    { word: 'cvjećara',    en: 'flower shop',            prompt: 'Buckets of fresh blooms overflow onto the pavement outside this shop. Which word is it?',   choices: ['cvjećara', 'kahvana', 'hotel'] },
  buket:       { word: 'buket',       en: 'bouquet',                prompt: 'A tied bunch of fresh red and yellow flowers sits wrapped in paper. Which word is it?',     choices: ['korpa', 'buket', 'vijenac'] },
  lepinja:     { word: 'lepinja',     en: 'flatbread bun',          prompt: 'Warm square grilled bread cradles classic Banja Luka ćevapi. Which word is it?',            choices: ['supa', 'salata', 'lepinja'] },
  kajmak:      { word: 'kajmak',      en: 'clotted cream',          prompt: 'A rich creamy spoonful melts beside warm bread on the cafe plate. Which word is it?',       choices: ['kajmak', 'med', 'ulje'] },
  luk:         { word: 'luk',         en: 'onion',                  prompt: 'Crisp chopped purple rings are served fresh alongside Banja Luka ćevapi. Which word is it?', choices: ['mrkva', 'luk', 'jabuka'] },
  torta:       { word: 'torta',       en: 'layered cake',           prompt: 'A festive frosted celebration dessert sits inside the patisserie display. Which word is it?', choices: ['hljeb', 'pita', 'torta'] },
  krofna:      { word: 'krofna',      en: 'doughnut',               prompt: 'Soft golden sugar-dusted rings sit freshly fried on the pastry tray. Which word is it?',    choices: ['krofna', 'burek', 'somun'] },
  kroasan:     { word: 'kroasan',     en: 'croissant',              prompt: 'Flaky crescent-shaped butter rolls sit beside the morning coffee. Which word is it?',       choices: ['sir', 'kroasan', 'jaje'] },
  kafic:       { word: 'kafić',       en: 'cafe / coffee bar',      prompt: 'Friends meet at outdoor wicker tables along Gospodska Street. Which word is it?',           choices: ['muzej', 'park', 'kafić'] },
  konobarica:  { word: 'konobarica',  en: 'waitress',               prompt: 'Who carries a gleaming tray of coffee and pastries between cafe tables?',                   choices: ['konobarica', 'slikarica', 'prodavačica'] },

  // Zone 5: Park Petar Kočić, Green Avenues & Flora (14)
  aleja:       { word: 'aleja',       en: 'tree-lined avenue',      prompt: 'Tall leafy rows form a shady green tunnel along Banja Luka\'s boulevard. Which word is it?', choices: ['ulica', 'aleja', 'obala'] },
  park:        { word: 'park',        en: 'park',                   prompt: 'Wide shady paths, benches, and flowers make Banja Luka the City of Greenery. Which word is it?', choices: ['trg', 'teren', 'park'] },
  paviljon:    { word: 'paviljon',    en: 'gazebo / pavilion',      prompt: 'This octagonal glass-and-wood park shelter hosts quiet readings and music. Which word is it?', choices: ['paviljon', 'šator', 'most'] },
  hrast:       { word: 'hrast',       en: 'oak tree',               prompt: 'A mighty broad-crowned tree spreads thick green boughs over the meadow. Which word is it?', choices: ['bor', 'hrast', 'palma'] },
  breza:       { word: 'breza',       en: 'birch tree',             prompt: 'A graceful slender tree stands out with silvery-white bark and airy leaves. Which word is it?', choices: ['vrba', 'maslina', 'breza'] },
  ruza:        { word: 'ruža',        en: 'rose',                   prompt: 'Velvety red blossoms climb along the sunny park trellis. Which word is it?',                choices: ['ruža', 'lala', 'lavanda'] },
  suncokret:   { word: 'suncokret',   en: 'sunflower',              prompt: 'Tall bright yellow flower heads with dark centres turn toward the sun. Which word is it?',  choices: ['maslačak', 'suncokret', 'jorgovan'] },
  ljubicica:   { word: 'ljubičica',   en: 'violet',                 prompt: 'Clusters of tiny deep-purple spring flowers carpet the shady park border. Which word is it?', choices: ['trava', 'mahovina', 'ljubičica'] },
  grm:         { word: 'grm',         en: 'bush / shrub',           prompt: 'Neat rounded green hedges border the winding park flowerbeds. Which word is it?',           choices: ['grm', 'panj', 'kamen'] },
  travnjak:    { word: 'travnjak',    en: 'lawn',                   prompt: 'A wide trimmed green carpet invites families to relax in the city park. Which word is it?', choices: ['pijesak', 'travnjak', 'kaldrma'] },
  jez:         { word: 'jež',         en: 'hedgehog',               prompt: 'A round little prickly woodland creature snuffles through the park grass. Which word is it?', choices: ['zec', 'vjeverica', 'jež'] },
  vrabac:      { word: 'vrabac',      en: 'sparrow',                prompt: 'A cheerful tiny brown city bird hops along the park bench looking for crumbs. Which word is it?', choices: ['vrabac', 'galeb', 'roda'] },
  bubamara:    { word: 'bubamara',    en: 'ladybug',                prompt: 'A glossy bright red beetle with black spots rests on a sunny green leaf. Which word is it?', choices: ['pčela', 'bubamara', 'leptir'] },
  guska:       { word: 'guska',       en: 'goose',                  prompt: 'A plump white long-necked bird waddles across the riverside grass. Which word is it?',      choices: ['patka', 'vrana', 'guska'] },

  // Zone 6: Park Mladen Stojanović, Sports & Everyday Life (12)
  romobil:     { word: 'romobil',     en: 'scooter',                prompt: 'A child glides down the smooth park path on this two-wheeled handlebar ride. Which word is it?', choices: ['romobil', 'bicikl', 'sanke'] },
  frizbi:      { word: 'frizbi',      en: 'frisbee',                prompt: 'A bright spinning flying disc sails across the sunny green park lawn. Which word is it?',   choices: ['lopta', 'frizbi', 'kolut'] },
  tenis:       { word: 'tenis',       en: 'tennis',                 prompt: 'Players rally across the red-clay court net in Park Mladen Stojanović. Which word is it?',  choices: ['odbojka', 'šah', 'tenis'] },
  reket:       { word: 'reket',       en: 'racket',                 prompt: 'What stringed oval paddle does the tennis player swing at the ball?',                       choices: ['reket', 'štap', 'veslo'] },
  kosarka:     { word: 'košarka',     en: 'basketball',             prompt: 'Friends shoot orange balls toward the backboard on the neighbourhood court. Which word is it?', choices: ['fudbal', 'košarka', 'skijanje'] },
  kos:         { word: 'koš',         en: 'basketball hoop',        prompt: 'A white backboard with an orange rim and net waits above the court. Which word is it?',     choices: ['gol', 'mreža', 'koš'] },
  klackalica:  { word: 'klackalica',  en: 'seesaw',                 prompt: 'A balanced wooden plank tips up and down on the park playground. Which word is it?',        choices: ['klackalica', 'ljuljačka', 'tobogan'] },
  pjescanik:   { word: 'pješčanik',   en: 'sandbox',                prompt: 'A square timber frame full of soft sand lets little children dig and build. Which word is it?', choices: ['bazen', 'pješčanik', 'vrt'] },
  kolica:      { word: 'kolica',      en: 'stroller / buggy',       prompt: 'A parent pushes a wheeled baby carriage peacefully along the shady avenue. Which word is it?', choices: ['auto', 'camac', 'kolica'] },
  fotograf:    { word: 'fotograf',    en: 'photographer',           prompt: 'Who holds up a camera to capture Kastel and the emerald Vrbas?',                            choices: ['fotograf', 'vozač', 'mlinar'] },
  crtati:      { word: 'crtati',      en: 'to draw / sketch',       prompt: 'What is the young artist doing with a pencil and sketchbook in the park?',                  choices: ['čitati', 'crtati', 'pjevati'] },
  sedam:       { word: 'sedam',       en: 'seven',                  prompt: 'How many tall shady chestnut trees stand in a neat row along the grand avenue?',            choices: ['pet', 'šest', 'sedam'] },

  // Finale (1)
  grad:        { word: 'grad',        en: 'city / town',            prompt: '', choices: [] },
};

// Stage 1: first orb (dajak), 73 Stage-1 orbs, Stage 2 last orb (spomenik on Banj brdo), finale (grad)
export const ORDER = [
  'dajak',
  'dajakas', 'motka', 'pristaniste', 'banja', 'para', 'brzak', 'vir', 'kamenje', 'caplja', 'vidra', 'mostic',
  'bastion', 'zidine', 'pozornica', 'koncert', 'violina', 'bubanj', 'truba', 'plesati', 'slusati', 'publika', 'reflektor',
  'dvor', 'stub', 'arkada', 'fontana', 'kip', 'pozoriste', 'galerija', 'kiosk', 'trijem', 'turbe', 'zlatna', 'crvena',
  'izlog', 'tenda', 'knjizara', 'cvjecara', 'buket', 'lepinja', 'kajmak', 'luk', 'torta', 'krofna', 'kroasan', 'kafic', 'konobarica',
  'aleja', 'park', 'paviljon', 'hrast', 'breza', 'ruza', 'suncokret', 'ljubicica', 'grm', 'travnjak', 'jez', 'vrabac', 'bubamara', 'guska',
  'romobil', 'frizbi', 'tenis', 'reket', 'kosarka', 'kos', 'klackalica', 'pjescanik', 'kolica', 'fotograf', 'crtati', 'sedam',
  'spomenik',
  'grad',
];

export const CULTURE = {
  place: 'Banja Luka',
  subtitle: 'Bosnia and Herzegovina · the City of Greenery on the Vrbas',
  facts: [
    ['The dajak of the Vrbas', 'Nowhere else in the world do people steer narrow wooden riverboats like Banja Luka\'s dajak, standing at the stern and pushing straight upstream against the emerald Vrbas with a four-metre wooden pole.'],
    ['Kastel & Ferhadija', 'Right on the riverbank stand the medieval stone ramparts of Kastel Fortress, which come alive with summer concerts, just steps from the UNESCO-inscribed 16th-century Ferhadija Mosque and its octagonal turbe.'],
    ['Grad zelenila (City of Greenery)', 'Long avenues of chestnut, oak, and birch trees shade Gospodska Street, Banski dvor, Park Petar Kočić, and Park Mladen Stojanović, where locals play tennis, basketball, and stroll past blooming roses.'],
    ['Banj brdo & warm springs', 'The city takes its name from the warm thermal baths (banje) along the Vrbas in Šeher, watched over from the southern hillside by the soaring white stone monument on Banj brdo.'],
  ],
};
