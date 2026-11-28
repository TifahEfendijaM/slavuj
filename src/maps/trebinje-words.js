// Trebinje (autumn): 65 learnable words + the finale word 'toplina', plus the culture travelogue page.
// Keep this module import-free so the Bosnia map (src/maps/counts.js) stays light.
export const WORDS = {
  // Zone 1: Arslanagića Bridge, Trebišnjica Sinking River and Giant Wooden Waterwheel (9)
  dolap:       { word: 'dolap',        en: 'wooden river waterwheel',       q: 'The giant traditional wooden wheel turning beside the Trebišnjica to lift water into the gardens. Which word is it?', choices: ['dolap', 'čamac', 'toranj'] },
  svodovi:     { word: 'svodovi',      en: 'stone bridge vaults',           q: 'The graceful curved limestone vaults of Arslanagića Bridge spanning the emerald river. Which word is it?', choices: ['svodovi', 'zidovi', 'stubovi'] },
  osovina:     { word: 'osovina',      en: 'wooden axle, shaft',            q: 'The sturdy central timber beam upon which the giant waterwheel turns. Which word is it?', choices: ['osovina', 'grana', 'letva'] },
  oluk:        { word: 'oluk',         en: 'wooden water trough, gutter',   q: 'The long hollowed wooden chute catching spilling water from the turning waterwheel. Which word is it?', choices: ['oluk', 'klupa', 'ograda'] },
  kanal:       { word: 'kanal',        en: 'irrigation channel, canal',     q: 'The stone-lined watercourse carrying Trebišnjica water out to the vineyards. Which word is it?', choices: ['kanal', 'put', 'most'] },
  ponornica:   { word: 'ponornica',    en: 'karst sinking river',           q: 'The crystal turquoise Trebišnjica, famous as Europe\'s greatest disappearing limestone river. Which word is it?', choices: ['ponornica', 'planina', 'šuma'] },
  kamencic:    { word: 'kamenčić',     en: 'small pebble',                  q: 'Smooth sunlit white stones sparkling along the shallow edge of the Trebišnjica. Which word is it?', choices: ['kamenčić', 'list', 'oblak'] },
  krs:         { word: 'krš',          en: 'limestone karst landscape',     q: 'The pale sun-baked rocky Mediterranean hills rising behind Trebinje. Which word is it?', choices: ['krš', 'snijeg', 'jezero'] },
  kamenjar:    { word: 'kamenjar',     en: 'rocky hillside, stony ground',  q: 'The rugged terraced stone slope where wild Herzegovinian herbs thrive in the sun. Which word is it?', choices: ['kamenjar', 'livada', 'plaža'] },

  // Zone 2: Platani Square, Old Town Kastel and Herzegovinian Hospitality (10)
  platan:      { word: 'platan',       en: 'plane tree (sycamore)',         q: 'The towering golden-amber century-old trees shading Trebinje\'s beloved main square. Which word is it?', choices: ['platan', 'bor', 'vrba'] },
  hladovina:   { word: 'hladovina',    en: 'cool shade',                    q: 'The peaceful shaded café terrace sheltered beneath the giant plane trees. Which word is it?', choices: ['hladovina', 'kiša', 'magla'] },
  gostionica:  { word: 'gostionica',   en: 'traditional stone tavern, inn', q: 'The warm limestone Old Town inn welcoming travellers for coffee and dinner. Which word is it?', choices: ['gostionica', 'škola', 'bolnica'] },
  trpeza:      { word: 'trpeza',       en: 'feast table, dining spread',    q: 'The long wooden Herzegovinian table laid out with autumn delicacies. Which word is it?', choices: ['trpeza', 'polica', 'vrata'] },
  prsut:       { word: 'pršut',        en: 'dry-cured ham',                 q: 'Thin ruby slices of air-dried Herzegovinian ham arranged on the wooden platter. Which word is it?', choices: ['pršut', 'hljeb', 'med'] },
  sokak:       { word: 'sokak',        en: 'narrow cobblestone alley',      q: 'The winding stone lane threaded between sunlit Old Town Kastel walls. Which word is it?', choices: ['sokak', 'trg', 'park'] },
  cosak:       { word: 'ćošak',        en: 'street corner',                 q: 'The quiet angle where two old limestone alleys meet beside a stone bollard. Which word is it?', choices: ['ćošak', 'krov', 'prozor'] },
  kapak:       { word: 'kapak',        en: 'wooden window shutter',         q: 'The painted green Mediterranean wooden shutters guarding Old Town windows from midday sun. Which word is it?', choices: ['kapak', 'stolica', 'slika'] },
  saksija:     { word: 'saksija',      en: 'terracotta flower pot',         q: 'Warm clay pots overflowing with autumn blooms along the limestone steps. Which word is it?', choices: ['saksija', 'korpa', 'kanta'] },
  kalendar:    { word: 'kalendar',     en: 'wall calendar',                 q: 'The neat paper grid marking sunny harvest days beside the tavern entrance. Which word is it?', choices: ['kalendar', 'knjiga', 'pismo'] },

  // Zone 3: Herzegovinian Vineyards, Wine Cellars and Olive Grove (13)
  vinograd:    { word: 'vinograd',     en: 'vineyard',                      q: 'Sun-drenched terraced rows of autumn vines climbing the Herzegovinian slope. Which word is it?', choices: ['vinograd', 'voćnjak', 'šuma'] },
  loza:        { word: 'loza',         en: 'grapevine',                     q: 'The gnarled woody climbing stems trained along wooden trellises. Which word is it?', choices: ['loza', 'trava', 'grana'] },
  grozd:       { word: 'grozd',        en: 'bunch of grapes',               q: 'A heavy hanging cluster of deep purple Vranac autumn grapes. Which word is it?', choices: ['grozd', 'jabuka', 'kruška'] },
  kosara:      { word: 'košara',       en: 'woven harvest basket',          q: 'A sturdy wicker basket heaped with freshly picked vineyard grapes. Which word is it?', choices: ['košara', 'torba', 'kutija'] },
  vinarija:    { word: 'vinarija',     en: 'winery',                        q: 'The sunlit stone wine house pressing local Žilavka and Vranac harvests. Which word is it?', choices: ['vinarija', 'pekara', 'pošta'] },
  podrum:      { word: 'podrum',       en: 'stone wine cellar',             q: 'The cool arched underground vault where oak wine barrels rest in silence. Which word is it?', choices: ['podrum', 'balkon', 'tavan'] },
  presa:       { word: 'presa',        en: 'wooden grape press',            q: 'The slatted oak-and-iron screw press squeezing sweet juice from autumn grapes. Which word is it?', choices: ['presa', 'klupa', 'sto'] },
  vino:        { word: 'vino',         en: 'wine',                          q: 'Deep ruby Herzegovinian Vranac poured into a clear stemmed glass. Which word is it?', choices: ['vino', 'mlijeko', 'čaj'] },
  boca:        { word: 'boca',         en: 'glass bottle',                  q: 'Tall dark-green glass vessels resting cleanly in the winery cellar rack. Which word is it?', choices: ['boca', 'šolja', 'tanjir'] },
  cep:         { word: 'čep',          en: 'cork stopper',                  q: 'The small cylindrical cork sealing each aged bottle of wine. Which word is it?', choices: ['čep', 'ključ', 'dugme'] },
  vadicep:     { word: 'vadičep',      en: 'corkscrew',                     q: 'The spiral brass-handled opener resting on the tasting barrel beside the glasses. Which word is it?', choices: ['vadičep', 'nož', 'kašika'] },
  maslinik:    { word: 'maslinik',     en: 'olive grove',                   q: 'A sunlit Mediterranean terrace planted with silvery-green olive trees. Which word is it?', choices: ['maslinik', 'park', 'livada'] },
  ulje:        { word: 'ulje',         en: 'olive oil',                     q: 'Luminous golden-green cold-pressed Herzegovinian oil glowing in a glass flask. Which word is it?', choices: ['ulje', 'voda', 'sok'] },

  // Zone 4: Herzegovinian Beekeeping and Honey (9)
  pcelinjak:   { word: 'pčelinjak',    en: 'apiary, bee yard',              q: 'A sunny stone-walled row of colourful wooden beehives above the herb meadow. Which word is it?', choices: ['pčelinjak', 'pijaca', 'muzej'] },
  pcelar:      { word: 'pčelar',       en: 'beekeeper',                     q: 'Who wears a protective wide-brimmed veiled hat tending Trebinje\'s honeybees?', choices: ['pčelar', 'pekar', 'ribar'] },
  dimilica:    { word: 'dimilica',     en: 'bee smoker',                    q: 'The little tin-and-leather bellows tool puffing gentle smoke to calm the bees. Which word is it?', choices: ['dimilica', 'fenjer', 'čajnik'] },
  sace:        { word: 'saće',         en: 'honeycomb',                     q: 'A wooden hive frame brimming with golden six-sided wax honey cells. Which word is it?', choices: ['saće', 'hljeb', 'sir'] },
  vosak:       { word: 'vosak',        en: 'beeswax',                       q: 'Warm golden moulded blocks of pure natural beeswax resting on the bench. Which word is it?', choices: ['vosak', 'kamen', 'sapun'] },
  tegla:       { word: 'tegla',        en: 'glass jar',                     q: 'Clear round jars filled to the brim with glowing amber sage honey. Which word is it?', choices: ['tegla', 'čaša', 'lonac'] },
  medovina:    { word: 'medovina',     en: 'honey mead',                    q: 'A glazed earthen flagon holding traditional sweet fermented Bosnian honey drink. Which word is it?', choices: ['medovina', 'kafa', 'limunada'] },
  roj:         { word: 'roj',          en: 'swarm of bees',                 q: 'A lively golden cloud of buzzing honeybees hovering above the sunlit hives. Which word is it?', choices: ['roj', 'jato', 'krdo'] },
  bokal:       { word: 'bokal',        en: 'serving pitcher, carafe',       q: 'A wide-bellied clear glass carafe set out on the honey tasting table. Which word is it?', choices: ['bokal', 'tanjir', 'zdjela'] },

  // Zone 5: Mediterranean Botanical Garden and Herzegovinian Herbs (9)
  vrt:         { word: 'vrt',          en: 'walled garden',                 q: 'A peaceful stone-bordered Mediterranean courtyard filled with herbs and fruit. Which word is it?', choices: ['vrt', 'trg', 'most'] },
  smilje:      { word: 'smilje',       en: 'immortelle (golden herb)',      q: 'Bright golden-yellow tufts of Herzegovina\'s treasured fragrant wildflower. Which word is it?', choices: ['smilje', 'ruža', 'lala'] },
  kadulja:     { word: 'kadulja',      en: 'wild sage',                     q: 'Silvery-green leaves and violet blossom spikes prized for Herzegovinian honey and tea. Which word is it?', choices: ['kadulja', 'paprat', 'mahovina'] },
  ruzmarin:    { word: 'ružmarin',     en: 'rosemary',                      q: 'A fragrant evergreen Mediterranean shrub covered in slender aromatic needles. Which word is it?', choices: ['ružmarin', 'bor', 'hrast'] },
  lovor:       { word: 'lovor',        en: 'bay laurel',                    q: 'A glossy dark-green aromatic Mediterranean tree shading the garden wall. Which word is it?', choices: ['lovor', 'vrba', 'breza'] },
  agava:       { word: 'agava',        en: 'agave plant',                   q: 'A sculptural rosette of broad spiked blue-green Mediterranean leaves. Which word is it?', choices: ['agava', 'trava', 'gljiva'] },
  mandarina:   { word: 'mandarina',    en: 'tangerine, mandarin',           q: 'Bright sweet orange autumn citrus fruits heaped in a sunlit garden crate. Which word is it?', choices: ['mandarina', 'limun', 'šljiva'] },
  kivi:        { word: 'kivi',         en: 'kiwifruit',                     q: 'Fuzzy brown-green Mediterranean fruits hanging ripe beneath the sunny pergola. Which word is it?', choices: ['kivi', 'trešnja', 'malina'] },
  badem:       { word: 'badem',        en: 'almond',                        q: 'Pale oval nuts harvested from warm southern Herzegovinian groves. Which word is it?', choices: ['badem', 'krompir', 'kupus'] },

  // Zone 6: Warm Karst Wildlife and Birds (8)
  lastavica:   { word: 'lastavica',    en: 'swallow (bird)',                q: 'A sleek forked-tail bird skimming swiftly above the emerald Trebišnjica arches. Which word is it?', choices: ['lastavica', 'patka', 'labud'] },
  cuk:         { word: 'ćuk',          en: 'scops owl',                     q: 'A tiny warm-brown Mediterranean owl perched quietly on a stone wall at dusk. Which word is it?', choices: ['ćuk', 'golub', 'vrana'] },
  fazan:       { word: 'fazan',        en: 'pheasant',                      q: 'A colourful long-tailed game bird strutting proudly beside the autumn vineyard. Which word is it?', choices: ['fazan', 'pijetao', 'orao'] },
  jarebica:    { word: 'jarebica',     en: 'rock partridge',                q: 'A plump speckled grey-brown karst bird perched on a sunlit limestone boulder. Which word is it?', choices: ['jarebica', 'sokol', 'galeb'] },
  sismis:      { word: 'šišmiš',       en: 'bat',                           q: 'A small winged dusk creature resting safely under the cool stone cellar arch. Which word is it?', choices: ['šišmiš', 'leptir', 'ptica'] },
  cvrcak:      { word: 'cvrčak',       en: 'cicada',                        q: 'The warm-weather singing insect clinging to a sunlit olive trunk in Herzegovina. Which word is it?', choices: ['cvrčak', 'mrav', 'pčela'] },
  bogomoljka:  { word: 'bogomoljka',   en: 'praying mantis',                q: 'A slender bright-green insect holding its folded forelegs atop the rosemary bush. Which word is it?', choices: ['bogomoljka', 'puž', 'bumbar'] },
  amfora:      { word: 'amfora',       en: 'ancient terracotta amphora',    q: 'A tall twin-handled clay wine vessel from Mediterranean antiquity standing by the garden. Which word is it?', choices: ['amfora', 'lonac', 'kanta'] },

  // Zone 7: Crkvina Hilltop (Hercegovačka Gračanica) and Sacred Art (7 + 1)
  mozaik:      { word: 'mozaik',       en: 'mosaic',                        q: 'Gleaming tiny golden and azure tiles forming a shimmering artwork above the archway. Which word is it?', choices: ['mozaik', 'zastava', 'ćilim'] },
  ikona:       { word: 'ikona',        en: 'gilded panel icon',             q: 'A richly painted gold-framed sacred panel set in the sunlit stone cloister niche. Which word is it?', choices: ['ikona', 'knjiga', 'sat'] },
  vaza:        { word: 'vaza',         en: 'stone flower vase',             q: 'An elegant carved vessel filled with autumn blossoms flanking the hilltop steps. Which word is it?', choices: ['vaza', 'bunar', 'klupa'] },
  kamenica:    { word: 'kamenica',     en: 'carved stone water basin',      q: 'A hollowed limestone bowl catching clear water on the quiet Crkvina terrace. Which word is it?', choices: ['kamenica', 'tanjir', 'čaša'] },
  kolo:        { word: 'kolo',         en: 'carved stone wheel medallion',  q: 'The circular carved stone rosette ornament set high in the monastery gable. Which word is it?', choices: ['kolo', 'prozor', 'krov'] },
  mediteran:   { word: 'mediteran',    en: 'Mediterranean horizon',         q: 'The warm luminous southern karst ridge gazing out toward the nearby Adriatic Sea. Which word is it?', choices: ['mediteran', 'sjever', 'zima'] },
  manastir:    { word: 'manastir',     en: 'monastery, hilltop sanctuary',  q: 'Hercegovačka Gračanica, the warm stone domed sanctuary crowning Crkvina Hill above Trebinje. Which word is it?', choices: ['manastir', 'vijećnica', 'han'] },

  // Finale
  toplina:     { word: 'toplina',      en: 'warmth' },
};

export const ORDER = Object.keys(WORDS);

// The travelogue page revealed after the finale.
export const CULTURE = {
  place: 'Trebinje',
  subtitle: 'Bosnia and Herzegovina · on the Trebišnjica',
  facts: [
    ['Arslanagića Bridge', 'Built in 1574 on the order of Grand Vizier Mehmed Paša Sokolović, this graceful stone bridge originally stood upstream and was carefully dismantled stone by stone and reassembled here in Trebinje in 1970.'],
    ['The Trebišnjica and Wooden Dolapi', 'Trebinje\'s clear emerald Trebišnjica is one of Europe\'s longest karst sinking rivers (ponornice). For centuries, giant wooden waterwheels called dolapi turned along its banks, lifting cool water into Mediterranean orchards and vineyards.'],
    ['Under the Giant Platani', 'Sixteen towering century-old plane trees (platani) spread a living golden canopy over Trebinje\'s Old Town square, shading coffee tables and the lively open-air market where figs, sage honey and herbs are sold.'],
    ['Herzegovinian Wine and Honey', 'Bathed in over 260 sunny days a year, the karst hills around Trebinje produce renowned Žilavka and Vranac wines alongside golden honey gathered from wild sage (kadulja) and immortelle (smilje).'],
    ['Hercegovačka Gračanica', 'Crowning Crkvina Hill high above the valley, this warm travertine-and-brick domed sanctuary houses the resting place of beloved Herzegovinian poet Jovan Dučić and offers sweeping views over every stone roof below.'],
    ['Gateway to the Mediterranean', 'Just half an hour from the Adriatic coast, Trebinje blends Ottoman stone alleys, Austrian-era squares and Mediterranean palms, olive groves and cypresses in Bosnia and Herzegovina\'s sunniest southern corner.'],
  ],
};
