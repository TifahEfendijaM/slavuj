// Konjic (summer): 59 learnable words + the finale word 'pustolovina', plus the culture travelogue page.
// Keep this module import-free so the Bosnia map (src/maps/counts.js) stays light.
export const WORDS = {
  // The Neretva and the Old Bridge (6)
  cuprija:     { word: 'ćuprija',      en: 'old stone bridge',           q: 'The old Ottoman stone bridge with six arches across the Neretva. Which word is it?', choices: ['ćuprija', 'brana', 'kula'] },
  svod:        { word: 'svod',         en: 'arch, vault',                q: 'The curved bands of cut stone over each opening of the bridge. Which word is it?', choices: ['svod', 'pod', 'krov'] },
  stub:        { word: 'stub',         en: 'pier, pillar',               q: 'The heavy stone legs of the bridge standing in the river, pointed against the current. Which word is it?', choices: ['stub', 'jarbol', 'dimnjak'] },
  rijeka:      { word: 'rijeka',       en: 'river',                      q: 'The clear emerald Neretva flowing through the middle of Konjic. Which word is it?', choices: ['rijeka', 'more', 'bara'] },
  brzak:       { word: 'brzak',        en: 'rapid',                      q: 'The white water tumbling over the rocks downstream, where the rafts bounce. Which word is it?', choices: ['brzak', 'jezero', 'bunar'] },
  pastrmka:    { word: 'pastrmka',     en: 'trout',                      q: 'The speckled fish swimming in the cold water under the bridge. Which word is it?', choices: ['pastrmka', 'jegulja', 'rak'] },

  // Rafting on the Neretva (8)
  gumenjak:    { word: 'gumenjak',     en: 'rubber raft',                q: 'The big inflatable boat the rafters ride down the river in. Which word is it?', choices: ['gumenjak', 'kamion', 'balon'] },
  veslo:       { word: 'veslo',        en: 'paddle, oar',                q: 'What each rafter holds to push the water and steer. Which word is it?', choices: ['veslo', 'metla', 'štap'] },
  kaciga:      { word: 'kaciga',       en: 'helmet',                     q: 'The hard hats hanging on the rack, to protect the head on the rapids. Which word is it?', choices: ['kaciga', 'šešir', 'lonac'] },
  prsluk:      { word: 'prsluk',       en: 'life jacket',                q: 'The bright padded vests that keep rafters afloat. Which word is it?', choices: ['prsluk', 'kaput', 'džemper'] },
  skiper:      { word: 'skiper',       en: 'raft guide',                 q: 'Who leads the rafting group and steers the raft from the back?', choices: ['skiper', 'kuhar', 'vozač'] },
  kajak:       { word: 'kajak',        en: 'kayak',                      q: 'The narrow little boat for one person, lying on the pebbles. Which word is it?', choices: ['kajak', 'splav', 'jedrilica'] },
  konopac:     { word: 'konopac',      en: 'rope',                       q: 'The coil of thick line for pulling the rafts ashore. Which word is it?', choices: ['konopac', 'lanac', 'kabl'] },
  pumpa:       { word: 'pumpa',        en: 'pump',                       q: 'The tool used to blow the rafts full of air. Which word is it?', choices: ['pumpa', 'kanta', 'ventilator'] },

  // The woodcarvers' workshop (10)
  radionica:   { word: 'radionica',    en: 'workshop',                   q: 'The open wooden building where the craftsmen carve furniture. Which word is it?', choices: ['radionica', 'bolnica', 'apoteka'] },
  rezbar:      { word: 'rezbar',       en: 'woodcarver',                 q: 'Who carves patterns into walnut wood with chisels, the famous craft of Konjic?', choices: ['rezbar', 'ribar', 'zidar'] },
  dlijeto:     { word: 'dlijeto',      en: 'chisel',                     q: 'The sharp steel tools with wooden handles laid out on the bench. Which word is it?', choices: ['dlijeto', 'viljuška', 'olovka'] },
  orah:        { word: 'orah',         en: 'walnut (wood)',              q: 'The dark, hard wood stacked in planks, the carvers\' favourite. Which word is it?', choices: ['orah', 'bor', 'bambus'] },
  sanduk:      { word: 'sanduk',       en: 'chest',                      q: 'The big carved wooden box with a lid, for keeping a dowry. Which word is it?', choices: ['sanduk', 'ormar', 'kofer'] },
  sofra:       { word: 'sofra',        en: 'low round table',            q: 'The low round carved table that families once ate around, sitting on the floor. Which word is it?', choices: ['sofra', 'polica', 'krevet'] },
  stolica:     { word: 'stolica',      en: 'chair',                      q: 'The carved wooden seat with a high back, waiting to be finished. Which word is it?', choices: ['stolica', 'ljestve', 'kolijevka'] },
  sara:        { word: 'šara',         en: 'carved ornament, pattern',   q: 'The round carved rosette panel hanging on the workshop wall. Which word is it?', choices: ['šara', 'slika', 'karta'] },
  strugotina:  { word: 'strugotina',   en: 'wood shavings',              q: 'The pale curls of wood lying on the floor under the bench. Which word is it?', choices: ['strugotina', 'brašno', 'pijesak'] },
  kasika:      { word: 'kašika',       en: 'wooden spoon',               q: 'The little carved spoons standing in a jar on the bench. Which word is it?', choices: ['kašika', 'nož', 'češalj'] },

  // The čaršija (9)
  dzamija:     { word: 'džamija',      en: 'mosque',                     q: 'The stone house of prayer with a tiled roof by the river. Which word is it?', choices: ['džamija', 'pošta', 'škola'] },
  munara:      { word: 'munara',       en: 'minaret',                    q: 'The slim white tower beside the mosque, with a balcony near its top. Which word is it?', choices: ['munara', 'dimnjak', 'svjetionik'] },
  cesma:       { word: 'česma',        en: 'public fountain',            q: 'The stone wall fountain where passers-by drink cold water. Which word is it?', choices: ['česma', 'kada', 'bazen'] },
  lipa:        { word: 'lipa',         en: 'linden tree',                q: 'The big shady tree in sweet-smelling bloom in early summer, its flowers dried for tea. Which word is it?', choices: ['lipa', 'jela', 'palma'] },
  klupa:       { word: 'klupa',        en: 'bench',                      q: 'Where you can sit in the shade of the linden. Which word is it?', choices: ['klupa', 'tepih', 'kolica'] },
  pekara:      { word: 'pekara',       en: 'bakery',                     q: 'The shop where the warm bread and pies come out of the oven. Which word is it?', choices: ['pekara', 'mesnica', 'banka'] },
  burek:       { word: 'burek',        en: 'meat pie (burek)',           q: 'The coiled pastry filled with meat, in round trays on the counter. Which word is it?', choices: ['burek', 'torta', 'salata'] },
  kafana:      { word: 'kafana',       en: 'café, tavern',               q: 'The little café by the bridge where people sit over coffee. Which word is it?', choices: ['kafana', 'garaža', 'štala'] },
  kahva:       { word: 'kahva',        en: 'Bosnian coffee',             q: 'The strong coffee served in a copper pot with little cups and sugar. Which word is it?', choices: ['kahva', 'limunada', 'supa'] },

  // The railway station (9)
  stanica:     { word: 'stanica',      en: 'station',                    q: 'The yellow building where passengers wait for the train to Sarajevo and Mostar. Which word is it?', choices: ['stanica', 'crkva', 'tvornica'] },
  peron:       { word: 'peron',        en: 'platform',                   q: 'The raised stone edge where you step on and off the train. Which word is it?', choices: ['peron', 'balkon', 'krov'] },
  pruga:       { word: 'pruga',        en: 'railway line',               q: 'The two steel rails on wooden sleepers running along the river. Which word is it?', choices: ['pruga', 'cesta', 'ograda'] },
  lokomotiva:  { word: 'lokomotiva',   en: 'locomotive',                 q: 'The engine at the front that pulls the whole train. Which word is it?', choices: ['lokomotiva', 'traktor', 'bicikl'] },
  vagon:       { word: 'vagon',        en: 'railway carriage',           q: 'The long cars with windows where the passengers sit. Which word is it?', choices: ['vagon', 'čamac', 'šator'] },
  otpravnik:   { word: 'otpravnik',    en: 'station master',             q: 'Who stands on the platform in a red cap and sends the train off?', choices: ['otpravnik', 'konobar', 'pekar'] },
  semafor:     { word: 'semafor',      en: 'railway signal',             q: 'The tall post with coloured lights that tells the driver to stop or go. Which word is it?', choices: ['semafor', 'fenjer', 'antena'] },
  kofer:       { word: 'kofer',        en: 'suitcase',                   q: 'The travellers\' bags with handles waiting on the platform. Which word is it?', choices: ['kofer', 'sanduk', 'korpa'] },
  sat:         { word: 'sat',          en: 'clock',                      q: 'The round face on the station wall that shows if the train is on time. Which word is it?', choices: ['sat', 'tanjir', 'ogledalo'] },

  // The river beach (7)
  plaza:       { word: 'plaža',        en: 'beach',                      q: 'The strip of smooth pebbles by the water where people swim and sunbathe. Which word is it?', choices: ['plaža', 'livada', 'pijaca'] },
  kupac:       { word: 'kupač',        en: 'swimmer',                    q: 'Who is splashing in the cold, clear Neretva on a hot day?', choices: ['kupač', 'pilot', 'kovač'] },
  peskir:      { word: 'peškir',       en: 'towel',                      q: 'The striped cloth spread out on the pebbles to lie on. Which word is it?', choices: ['peškir', 'zastava', 'zavjesa'] },
  suncobran:   { word: 'suncobran',    en: 'sunshade, parasol',          q: 'The big striped umbrella giving shade on the beach. Which word is it?', choices: ['suncobran', 'kišobran', 'jedro'] },
  lopta:       { word: 'lopta',        en: 'ball',                       q: 'The round thing the children kick and throw at the water\'s edge. Which word is it?', choices: ['lopta', 'kocka', 'lubenica'] },
  sladoled:    { word: 'sladoled',     en: 'ice cream',                  q: 'The cold sweet treat in cones, sold from a little cart. Which word is it?', choices: ['sladoled', 'kolač', 'čokolada'] },
  kamencic:    { word: 'kamenčić',     en: 'pebble',                     q: 'The small smooth stones a child is piling into a little tower. Which word is it?', choices: ['kamenčić', 'novčić', 'dugme'] },

  // Nature round Konjic (11)
  caplja:      { word: 'čaplja',       en: 'heron',                      q: 'The tall grey bird standing still in the shallows, waiting for a fish. Which word is it?', choices: ['čaplja', 'roda', 'labud'] },
  vodomar:     { word: 'vodomar',      en: 'kingfisher',                 q: 'The little bright blue and orange bird on a branch over the water. Which word is it?', choices: ['vodomar', 'vrabac', 'golub'] },
  vidra:       { word: 'vidra',        en: 'otter',                      q: 'The sleek brown swimmer resting on the rocks by the rapid. Which word is it?', choices: ['vidra', 'mačka', 'zec'] },
  vrba:        { word: 'vrba',         en: 'willow',                     q: 'The tree with long hanging branches leaning over the river. Which word is it?', choices: ['vrba', 'bor', 'jabuka'] },
  livada:      { word: 'livada',       en: 'meadow',                     q: 'The open grassy field full of summer flowers above the town. Which word is it?', choices: ['livada', 'šuma', 'pustinja'] },
  leptir:      { word: 'leptir',       en: 'butterfly',                  q: 'The insects with colourful wings fluttering over the flowers. Which word is it?', choices: ['leptir', 'muha', 'pauk'] },
  kosnica:     { word: 'košnica',      en: 'beehive',                    q: 'The painted wooden boxes at the edge of the meadow where bees make honey. Which word is it?', choices: ['košnica', 'kućica', 'ladica'] },
  planina:     { word: 'planina',      en: 'mountain',                   q: 'Prenj, the great rocky mountain rising over the valley. Which word is it?', choices: ['planina', 'dolina', 'ostrvo'] },
  snijeg:      { word: 'snijeg',       en: 'snow',                       q: 'The white patches still lying on the peaks even in summer. Which word is it?', choices: ['snijeg', 'pijesak', 'šećer'] },
  // the last word: Tito's bunker, hidden in the hill
  bunker:      { word: 'bunker',       en: 'bunker',                     q: 'Behind an ordinary-looking house, a secret shelter dug deep into the hill. Which word is it?', choices: ['bunker', 'podrum', 'garaža'] },

  // Finale
  pustolovina: { word: 'pustolovina',  en: 'adventure' },
};

export const ORDER = Object.keys(WORDS);

export const CULTURE = {
  place: 'Konjic',
  subtitle: 'Bosnia and Herzegovina · on the emerald Neretva',
  facts: [
    ['Stara ćuprija', 'The Old Bridge of Konjic was built in 1682 on six stone arches across the Neretva. Blown up in 1945, it was rebuilt stone by stone and opened again in 2009.'],
    ['The woodcarvers', 'Konjic is famous for its woodcarving: walnut chests, chairs, low sofra tables and panels covered in fine carved patterns. The craft is on UNESCO\'s list of the world\'s intangible heritage.'],
    ['Rafting', 'The Neretva above Konjic is one of the best rafting rivers in Europe: clear, cold and green, running through deep canyons from Glavatičevo down to the town.'],
    ['The railway', 'The line from Sarajevo to Mostar and the sea follows the Neretva valley through Konjic, after climbing over the Ivan pass in long loops and tunnels.'],
    ['Tito\'s bunker', 'Hidden in the hill near Konjic is ARK D-0, an atomic shelter for Yugoslavia\'s leaders, built in secret between 1953 and 1979 behind the front of an ordinary house. Today it hosts art exhibitions.'],
    ['Prenj', 'Above the town rises Prenj, the "Herzegovinian Himalaya": sharp limestone peaks above 2,000 metres where snow lies into the summer.'],
  ],
};
