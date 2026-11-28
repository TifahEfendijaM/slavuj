// Višegrad (autumn): 67 learnable words + the finale word 'baština', plus the culture travelogue page.
// Keep this module import-free so the Bosnia map (src/maps/counts.js) stays light.
export const WORDS = {
  // Zone 1: Mehmed Paša Sokolović Bridge and the Emerald Drina River (11)
  lukovi:      { word: 'lukovi',       en: 'bridge arches',                 q: 'The graceful pointed stone vaults of Mehmed Paša Sokolović Bridge spanning the Drina. Which word is it?', choices: ['lukovi', 'prozori', 'krovovi'] },
  jedanaest:   { word: 'jedanaest',    en: 'eleven',                        q: 'How many pointed stone piers and arches carry the great Višegrad bridge across the Drina?', choices: ['devet', 'jedanaest', 'sedam'] },
  sofa:        { word: 'sofa',         en: 'stone sitting terrace',         q: 'The raised curved stone bench at the centre of the bridge where townsfolk gather for coffee. Which word is it?', choices: ['sofa', 'vrata', 'zid'] },
  tarih:       { word: 'tarih',        en: 'carved Ottoman inscription',    q: 'The tall marble portal opposite the sofa bearing historic Ottoman verses about the bridge. Which word is it?', choices: ['tarih', 'dimnjak', 'sat'] },
  ploca:       { word: 'ploča',        en: 'stone slab, plaque',            q: 'A carved smooth travertine tablet set cleanly into the historic masonry. Which word is it?', choices: ['ploča', 'knjiga', 'daska'] },
  tirkiz:      { word: 'tirkiz',       en: 'turquoise (colour of Drina)',   q: 'The luminous blue-green gem colour of the deep Drina River flowing beneath the bridge. Which word is it?', choices: ['tirkiz', 'pepeo', 'blato'] },
  splavar:     { word: 'splavar',      en: 'Drina raftsman',                q: 'Who steers a bound wooden log raft with a long oar down the Drina current?', choices: ['splavar', 'pekar', 'krojač'] },
  veslar:      { word: 'veslar',       en: 'oarsman, rower',                q: 'Who rows the traditional wooden river boat gently beneath the stone arches?', choices: ['veslar', 'vozač', 'mlinar'] },
  klesar:      { word: 'klesar',       en: 'stonemason',                    q: 'Who carves blocks of warm Višegrad travertine stone beside the bridge approach?', choices: ['klesar', 'kuhar', 'konobar'] },
  dlijeto:     { word: 'dlijeto',      en: 'chisel',                        q: 'The sharp steel carving blade resting atop the stonemason\'s travertine block. Which word is it?', choices: ['dlijeto', 'kašika', 'olovka'] },
  cekic:       { word: 'čekić',        en: 'hammer, mallet',                q: 'The heavy iron-headed tool the stonemason strikes against the chisel. Which word is it?', choices: ['čekić', 'ključ', 'četka'] },

  // Zone 2: Andrićgrad and Ivo Andrić Literary Quarter (10)
  knjizevnik:  { word: 'književnik',   en: 'author, novelist',              q: 'Who sits at the courtyard writing desk crafting stories about the bridge on the Drina?', choices: ['književnik', 'ribar', 'stražar'] },
  roman:       { word: 'roman',        en: 'novel',                         q: 'Ivo Andrić won the Nobel Prize for his famous book "Na Drini ćuprija". What kind of book is it?', choices: ['roman', 'pismo', 'novine'] },
  hronika:     { word: 'hronika',      en: 'chronicle',                     q: 'A thick leather-bound historical record tracing centuries of life along the Drina. Which word is it?', choices: ['hronika', 'torba', 'mapa'] },
  stranica:    { word: 'stranica',     en: 'page (of a book)',              q: 'An open cream sheet covered in neat handwritten lines inside the chronicle. Which word is it?', choices: ['stranica', 'stolica', 'slika'] },
  korice:      { word: 'korice',       en: 'book cover',                    q: 'The sturdy burgundy-and-gold outer binding protecting the precious novel. Which word is it?', choices: ['korice', 'tepih', 'zavjesa'] },
  mastilo:     { word: 'mastilo',      en: 'writing ink',                   q: 'The little glass bottle filled with deep indigo ink beside the writer\'s notebook. Which word is it?', choices: ['mastilo', 'mlijeko', 'med'] },
  pecat:       { word: 'pečat',        en: 'wax seal, stamp',               q: 'The brass handle and red wax emblem used to sign official scrolls and letters. Which word is it?', choices: ['pečat', 'novčić', 'prsten'] },
  svitak:      { word: 'svitak',       en: 'parchment scroll',              q: 'A tightly rolled cylinder of cream parchment tied with crimson ribbon. Which word is it?', choices: ['svitak', 'hljeb', 'štap'] },
  bista:       { word: 'bista',        en: 'bust (sculpted portrait)',      q: 'A bronze portrait sculpture of the head and shoulders standing on a marble column. Which word is it?', choices: ['bista', 'bunar', 'klupa'] },
  kino:        { word: 'kino',         en: 'cinema, movie theatre',         q: 'The stone-arched building in Andrićgrad with glowing marquee letters showing films. Which word is it?', choices: ['kino', 'pekara', 'pošta'] },

  // Zone 3: Old Višegrad Smithy, Timber Yard and Crafts (10)
  kovac:       { word: 'kovač',        en: 'blacksmith',                    q: 'Who shapes glowing red iron beside the stone forge near the Drina?', choices: ['kovač', 'učitelj', 'doktor'] },
  nakovanj:    { word: 'nakovanj',     en: 'anvil',                         q: 'The heavy horned iron block where the blacksmith hammers hot horseshoes. Which word is it?', choices: ['nakovanj', 'sto', 'sanduk'] },
  potkovica:   { word: 'potkovica',    en: 'horseshoe',                     q: 'The U-shaped forged steel shoe hanging on the smithy wall for good luck. Which word is it?', choices: ['potkovica', 'točak', 'kruna'] },
  mijeh:       { word: 'mijeh',        en: 'forge bellows',                 q: 'The hinged wooden-and-leather air pump fanning the blacksmith\'s coals. Which word is it?', choices: ['mijeh', 'bubanj', 'jastuk'] },
  klijesta:    { word: 'kliješta',     en: 'tongs, pliers',                 q: 'The long-handled iron gripping tool used to lift hot metal from the fire. Which word is it?', choices: ['kliješta', 'makaze', 'viljuška'] },
  kalup:       { word: 'kalup',        en: 'casting mould',                 q: 'The carved metal form on the workbench used to cast molten bronze medallions. Which word is it?', choices: ['kalup', 'tanjir', 'lonac'] },
  kantar:      { word: 'kantar',       en: 'hanging beam scale',            q: 'The traditional iron rod with a sliding weight hanging at the old trade stall. Which word is it?', choices: ['kantar', 'veslo', 'luk'] },
  drvosjeca:   { word: 'drvosječa',    en: 'woodcutter, lumberjack',        q: 'Who cuts and stacks tall canyon pines ready to float down the Drina?', choices: ['drvosječa', 'muzičar', 'grnčar'] },
  klada:       { word: 'klada',        en: 'timber log',                    q: 'Thick felled pine trunks stacked neatly along the Drina timber yard. Which word is it?', choices: ['klada', 'cigla', 'grana'] },
  pila:        { word: 'pila',         en: 'saw',                           q: 'The toothed steel lumber blade leaning against the freshly cut logs. Which word is it?', choices: ['pila', 'nož', 'igla'] },

  // Zone 4: "Ćiro" Narrow-Gauge Heritage Steam Railway (10)
  tunel:       { word: 'tunel',        en: 'railway tunnel',                q: 'The stone-arched passage carved straight through the steep Drina canyon rock. Which word is it?', choices: ['tunel', 'most', 'toranj'] },
  kolosijek:   { word: 'kolosijek',    en: 'narrow-gauge railway track',    q: 'The twin steel rails of the heritage Ćiro line curving along the riverside terrace. Which word is it?', choices: ['kolosijek', 'cesta', 'staza'] },
  prag:        { word: 'prag',         en: 'wooden railway sleeper, tie',   q: 'Dark weathered oak cross-beams laid evenly beneath the steel train rails. Which word is it?', choices: ['prag', 'ograda', 'stepenik'] },
  skretnica:   { word: 'skretnica',    en: 'railway switch lever',          q: 'The red-and-white weighted iron lever that guides the train onto a side track. Which word is it?', choices: ['skretnica', 'semafor', 'fenjer'] },
  signal:      { word: 'signal',       en: 'semaphore railway signal',      q: 'The tall red-and-white striped mast raising its arm to clear the steam train. Which word is it?', choices: ['signal', 'zastava', 'jarbol'] },
  peron:       { word: 'peron',        en: 'station platform',              q: 'The covered timber-and-stone boarding deck beside Višegrad\'s heritage railway track. Which word is it?', choices: ['peron', 'balkon', 'terasa'] },
  kotao:       { word: 'kotao',        en: 'steam locomotive boiler',       q: 'The gleaming black-and-brass iron drum of the Ćiro engine humming with steam. Which word is it?', choices: ['kotao', 'bure', 'kanta'] },
  kondukter:   { word: 'kondukter',    en: 'train conductor',               q: 'Who wears a dark cap on the platform checking tickets before departure?', choices: ['kondukter', 'pilot', 'kapetan'] },
  zvizdaljka:  { word: 'zviždaljka',   en: 'whistle',                       q: 'The gleaming brass pipe the conductor blows to signal that the train is leaving. Which word is it?', choices: ['zviždaljka', 'frula', 'zvono'] },
  prtljag:     { word: 'prtljag',      en: 'luggage, suitcases',            q: 'Vintage brown leather trunks and strapped suitcases stacked on the station platform. Which word is it?', choices: ['prtljag', 'paketi', 'korpa'] },

  // Zone 5: Višegradska Banja Thermal Spa and Autumn Harvest (9)
  kupka:       { word: 'kupka',        en: 'warm mineral bath',             q: 'The steaming turquoise thermal pool sheltered beneath Višegrad\'s spa stone arches. Which word is it?', choices: ['kupka', 'rijeka', 'jezero'] },
  ogrtac:      { word: 'ogrtač',       en: 'bathrobe, cloak',               q: 'A soft cream woven robe draped on a wooden peg beside the warm mineral pool. Which word is it?', choices: ['ogrtač', 'kaput', 'haljina'] },
  vrc:         { word: 'vrč',          en: 'ceramic water pitcher',         q: 'A tall glazed ceramic jug filled with fresh warm thermal spring water. Which word is it?', choices: ['vrč', 'šolja', 'čaša'] },
  mermer:      { word: 'mermer',       en: 'marble',                        q: 'Smooth pale veined stone carved into the basin and columns of the bathhouse. Which word is it?', choices: ['mermer', 'drvo', 'glina'] },
  vaga:        { word: 'vaga',         en: 'balance scale',                 q: 'A gleaming two-pan brass balance measuring autumn herbs and berries. Which word is it?', choices: ['vaga', 'sat', 'svijećnjak'] },
  sipak:       { word: 'šipak',        en: 'rosehip, wild pomegranate',     q: 'Bright scarlet autumn berries gathered along the Drina paths for fragrant tea. Which word is it?', choices: ['šipak', 'jabuka', 'šljiva'] },
  drenjina:    { word: 'drenjina',     en: 'cornelian cherry',              q: 'Glossy ruby oval forest berries prized across Bosnia for autumn jam and juice. Which word is it?', choices: ['drenjina', 'jagoda', 'kruška'] },
  glog:        { word: 'glog',         en: 'hawthorn bush',                 q: 'A leafy autumn shrub heavy with tiny crimson berries beside the stone garden. Which word is it?', choices: ['glog', 'bor', 'vrba'] },
  lula:        { word: 'lula',         en: 'wooden smoking pipe',           q: 'A curved carved walnut pipe resting quietly on the old veranda table. Which word is it?', choices: ['lula', 'kašika', 'četkica'] },

  // Zone 6: Drina Gorge Autumn Wildlife and Golden Cliffs (11)
  klisura:     { word: 'klisura',      en: 'river gorge, steep canyon',     q: 'The towering autumn-clad walls rising dramatically on both sides of the Drina. Which word is it?', choices: ['klisura', 'livada', 'plaža'] },
  litica:      { word: 'litica',       en: 'sheer cliff face',              q: 'A steep jagged outcrop of pale limestone overhanging the emerald Drina bend. Which word is it?', choices: ['litica', 'obala', 'ostrvo'] },
  bukva:       { word: 'bukva',        en: 'beech tree',                    q: 'A tall golden-copper woodland tree lighting up the Drina slopes in autumn. Which word is it?', choices: ['bukva', 'palma', 'smreka'] },
  zir:         { word: 'žir',          en: 'acorn',                         q: 'Little capped brown woodland nuts scattered on the autumn moss beneath the trees. Which word is it?', choices: ['žir', 'orah', 'lješnjak'] },
  kora:        { word: 'kora',         en: 'tree bark',                     q: 'The rugged furrowed outer wood sheathing the mossy fallen forest trunk. Which word is it?', choices: ['kora', 'list', 'korijen'] },
  brsljan:     { word: 'bršljan',      en: 'ivy',                           q: 'Evergreen leafy vines clinging and cascading down the ancient stone cliff wall. Which word is it?', choices: ['bršljan', 'trava', 'paprat'] },
  mladica:     { word: 'mladica',      en: 'Danube salmon, Drina huchen',   q: 'The legendary silver-bronze giant river fish gliding through the emerald Drina. Which word is it?', choices: ['mladica', 'delfin', 'rak'] },
  som:         { word: 'som',          en: 'river catfish',                 q: 'A dark whiskered bottom-dwelling fish resting peacefully near the deep bridge piers. Which word is it?', choices: ['som', 'žaba', 'kornjača'] },
  divokoza:    { word: 'divokoza',     en: 'chamois (mountain goat)',       q: 'A nimble horned mountain antelope balanced high on the limestone canyon cliff. Which word is it?', choices: ['divokoza', 'ovca', 'konj'] },
  kuna:        { word: 'kuna',         en: 'pine marten',                   q: 'A sleek brown woodland creature with a cream throat peeking along the cliff branch. Which word is it?', choices: ['kuna', 'zec', 'mačka'] },
  jastreb:     { word: 'jastreb',      en: 'goshawk, hawk',                 q: 'A keen-eyed barred forest hawk perched above the golden autumn Drina canyon. Which word is it?', choices: ['jastreb', 'golub', 'patka'] },

  // Zone 7: Bikavac Hilltop, Old Fortress Ruins and Golden Dusk (6 + 1)
  puteljak:    { word: 'puteljak',     en: 'winding footpath',              q: 'The narrow stone-bordered trail climbing up the autumn hillside to Bikavac. Which word is it?', choices: ['puteljak', 'pruga', 'most'] },
  putnik:      { word: 'putnik',       en: 'traveller',                     q: 'Who pauses with a walking staff atop Bikavac Hill admiring the eleven-arched bridge?', choices: ['putnik', 'stražar', 'kovač'] },
  gavran:      { word: 'gavran',       en: 'raven',                         q: 'A large glossy black bird perched watchfully on the ancient fortress stones. Which word is it?', choices: ['gavran', 'labud', 'sokol'] },
  svraka:      { word: 'svraka',       en: 'magpie',                        q: 'A clever black-and-white long-tailed bird perched on the low hillside wall. Which word is it?', choices: ['svraka', 'sova', 'vodomar'] },
  odraz:       { word: 'odraz',        en: 'mirror reflection (in water)',  q: 'The shimmering golden image of the eleven stone arches dancing on the calm Drina. Which word is it?', choices: ['odraz', 'oblak', 'vjetar'] },
  rusevina:    { word: 'ruševina',     en: 'ancient fortress ruins',        q: 'The weathered medieval stone walls crowning Bikavac Hill high above Višegrad. Which word is it?', choices: ['ruševina', 'vijećnica', 'bolnica'] },

  // Finale
  bastina:     { word: 'baština',      en: 'cultural heritage' },
};

export const ORDER = Object.keys(WORDS);

// The travelogue page revealed after the finale.
export const CULTURE = {
  place: 'Višegrad',
  subtitle: 'Bosnia and Herzegovina · on the emerald Drina',
  facts: [
    ['Mehmed Paša Sokolović Bridge', 'Commissioned in 1571 by Grand Vizier Mehmed Paša Sokolović and designed by the great Ottoman architect Mimar Sinan, this UNESCO World Heritage masterpiece spans the Drina on eleven graceful pointed travertine arches with its famous mid-bridge kapija sofa.'],
    ['The Bridge on the Drina', 'Nobel Prize laureate Ivo Andrić grew up in Višegrad and immortalized the stone bridge in his 1945 novel "Na Drini ćuprija", tracing four centuries of shared life, stories and coffee gathered upon its central stone terrace.'],
    ['The Emerald Drina and Splavari', 'Carving a deep wooded canyon through eastern Bosnia, the turquoise-green Drina was once a highway for fearless wooden timber rafts (splavovi), steered past swirling eddies and limestone crags by skilled raftsmen.'],
    ['The Ćiro Heritage Railway', 'Built at the turn of the 20th century, the narrow-gauge steam railway threaded dozens of stone tunnels and bridges along the Drina gorge, carrying travellers and timber through some of the Balkans\' grandest canyon scenery.'],
    ['Višegradska Banja', 'Tucked in a wooded valley just north of town, Višegrad\'s warm geothermal mineral springs have welcomed travellers since Ottoman times with vaulted stone pools and healing waters.'],
    ['Stari Grad and Bikavac Hill', 'High above the town stand the medieval ruins of Pavlovina fortress and the sunny slopes of Bikavac, offering sweeping autumn views across all eleven arches reflecting in the quiet emerald river below.'],
  ],
};
