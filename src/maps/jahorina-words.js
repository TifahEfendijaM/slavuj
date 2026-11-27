// Jahorina (winter): 75 learnable words + finale word 'zima' (76 total).
// Zero overlap with Mostar (82 words) or Sarajevo (79 words). Answer positions balanced 25/25/25.

export const WORDS = {
  // Zone 1: Poljice Plateau & 1984 Olympic Plaza (11)
  snijeg:    { word: 'snijeg',     en: 'snow',                  prompt: 'Soft white flakes cover the whole mountain. Which word is it?',               choices: ['snijeg', 'kiša', 'pijesak'] },
  pahulja:   { word: 'pahulja',    en: 'snowflake',             prompt: 'This six-pointed crystal became the 1984 Sarajevo Olympic emblem. Which word is it?', choices: ['zvijezda', 'pahulja', 'oblak'] },
  pet:       { word: 'pet',        en: 'five',                  prompt: 'How many interlocking Olympic rings stand on the stone plinth?',               choices: ['četiri', 'šest', 'pet'] },
  putokaz:   { word: 'putokaz',    en: 'signpost',              prompt: 'These wooden arrows point to the trails and summit. Which word is it?',        choices: ['putokaz', 'ograda', 'klupa'] },
  snjesko:   { word: 'snješko',    en: 'snowman',               prompt: 'Children rolled three big snowballs to build this figure. Which word is it?',  choices: ['lutka', 'snješko', 'kip'] },
  mrkva:     { word: 'mrkva',      en: 'carrot',                prompt: 'What orange vegetable makes the snowman\'s nose?',                             choices: ['jabuka', 'krompir', 'mrkva'] },
  grudva:    { word: 'grudva',     en: 'snowball',              prompt: 'This round ball of packed snow is ready to fly. Which word is it?',            choices: ['grudva', 'lopta', 'kamen'] },
  bacati:    { word: 'bacati',     en: 'to throw',              prompt: 'What are the two children doing with the snowballs?',                          choices: ['hvatati', 'bacati', 'nositi'] },
  kapa:      { word: 'kapa',       en: 'winter hat',            prompt: 'This knitted wool piece keeps the snowman\'s head warm. Which word is it?',    choices: ['šal', 'kaput', 'kapa'] },
  rukavice:  { word: 'rukavice',   en: 'gloves',                prompt: 'These warm mittens keep fingers safe from the frost. Which word is it?',       choices: ['rukavice', 'čarape', 'čizme'] },
  bijela:    { word: 'bijela',     en: 'white',                 prompt: 'What colour is the fresh winter snow across the whole plateau?',               choices: ['plava', 'bijela', 'zelena'] },

  // Zone 2: Planinarski dom & Vikendice Village (14)
  koliba:    { word: 'koliba',     en: 'mountain cabin',        prompt: 'This cosy timber mountain lodge welcomes skiers inside. Which word is it?',    choices: ['škola', 'bolnica', 'koliba'] },
  vikendica: { word: 'vikendica',  en: 'mountain chalet',       prompt: 'These steep-roofed holiday cottages dot the snowy slope. Which word is it?',   choices: ['vikendica', 'pekara', 'vijećnica'] },
  ledenica:  { word: 'ledenica',   en: 'icicle',                prompt: 'Long frozen spikes hang from the cabin roof eaves. Which word is it?',         choices: ['grana', 'ledenica', 'stijena'] },
  fenjer:    { word: 'fenjer',     en: 'lantern',               prompt: 'This warm hanging lamp glows beside the wooden cabin door. Which word is it?', choices: ['sat', 'prozor', 'fenjer'] },
  drva:      { word: 'drva',       en: 'firewood',              prompt: 'Split logs are stacked neatly under the eaves for the stove. Which word is it?', choices: ['drva', 'lišće', 'kamenje'] },
  panj:      { word: 'panj',       en: 'tree stump',            prompt: 'The woodcutter sets each log on this thick wooden block. Which word is it?',   choices: ['sto', 'panj', 'klupa'] },
  sjekira:   { word: 'sjekira',    en: 'axe',                   prompt: 'This heavy iron tool splits the logs in two. Which word is it?',               choices: ['čekić', 'lopata', 'sjekira'] },
  cijepati:  { word: 'cijepati',   en: 'to chop (wood)',        prompt: 'What is the man doing to the logs on the stump?',                              choices: ['cijepati', 'peći', 'brati'] },
  lopata:    { word: 'lopata',     en: 'shovel',                prompt: 'This wide tool scoops snow off the cabin steps. Which word is it?',            choices: ['metla', 'lopata', 'štap'] },
  cistiti:   { word: 'čistiti',    en: 'to clear / clean',      prompt: 'What is the woman doing to the snow-covered path?',                            choices: ['graditi', 'crtati', 'čistiti'] },
  vatra:     { word: 'vatra',      en: 'fire',                  prompt: 'Bright orange flames crackle in the stone hearth. Which word is it?',          choices: ['vatra', 'voda', 'dim'] },
  pec:       { word: 'peć',        en: 'wood stove',            prompt: 'This iron stove heats the mountain lodge from within. Which word is it?',      choices: ['stolica', 'peć', 'vrata'] },
  grijati:   { word: 'grijati se', en: 'to warm up',            prompt: 'Why are the hikers holding their hands close to the fire?',                    choices: ['spavati', 'trčati', 'grijati se'] },
  tragovi:   { word: 'tragovi',    en: 'footprints',            prompt: 'Deep boot marks lead across the fresh snow to the door. Which word is it?',    choices: ['tragovi', 'šine', 'stepenice'] },

  // Zone 3: Warm Cabin Terrace, Food & Winter Clothes (12)
  caj:       { word: 'čaj',        en: 'tea',                   prompt: 'This hot mountain herbal drink steams on the terrace table. Which word is it?', choices: ['mlijeko', 'čaj', 'sok'] },
  med:       { word: 'med',        en: 'honey',                 prompt: 'A golden jar of sweet mountain nectar sits beside the tea. Which word is it?', choices: ['šećer', 'sir', 'med'] },
  hljeb:     { word: 'hljeb',      en: 'bread',                 prompt: 'A warm round loaf rests on the wooden board. Which word is it?',               choices: ['hljeb', 'kolač', 'burek'] },
  sir:       { word: 'sir',        en: 'cheese',                prompt: 'Slices of white mountain dairy sit next to the bread. Which word is it?',      choices: ['meso', 'sir', 'jaje'] },
  supa:      { word: 'supa',       en: 'soup',                  prompt: 'A steaming bowl of hot broth warms skiers after the slopes. Which word is it?', choices: ['salata', 'pita', 'supa'] },
  solja:     { word: 'šolja',      en: 'mug',                   prompt: 'Hot tea is served in this ceramic cup with a handle. Which word is it?',       choices: ['šolja', 'tanjir', 'čaša'] },
  termos:    { word: 'termos',     en: 'thermos',               prompt: 'This tall steel flask keeps tea hot out in the snow. Which word is it?',       choices: ['džezva', 'termos', 'flaša'] },
  deka:      { word: 'deka',       en: 'blanket',               prompt: 'A thick woven wool throw drapes over the terrace chair. Which word is it?',    choices: ['ćilim', 'kaput', 'deka'] },
  cizme:     { word: 'čizme',      en: 'winter boots',          prompt: 'These tall warm shoes stand beside the cabin porch. Which word is it?',        choices: ['čizme', 'klizaljke', 'skije'] },
  dzemper:   { word: 'džemper',    en: 'sweater',               prompt: 'This thick patterned knit top keeps the hiker cosy. Which word is it?',        choices: ['košulja', 'džemper', 'haljina'] },
  jakna:     { word: 'jakna',      en: 'winter jacket',         prompt: 'This padded winter coat zips up to the chin. Which word is it?',               choices: ['šal', 'kapa', 'jakna'] },
  hladno:    { word: 'hladno',     en: 'cold',                  prompt: 'The hiker shivers and hugs his arms in the frosty air. How does it feel?',     choices: ['hladno', 'toplo', 'tiho'] },

  // Zone 4: Sledding Hill & Frozen Pond (10)
  sanke:     { word: 'sanke',      en: 'sled',                  prompt: 'This wooden runner glides down the snowy meadow. Which word is it?',           choices: ['čamac', 'sanke', 'bicikl'] },
  sankati:   { word: 'sankati se', en: 'to sled',               prompt: 'What is the child doing on the wooden sled down the hill?',                    choices: ['plivati', 'veslati', 'sankati se'] },
  vuci:      { word: 'vući',       en: 'to pull',               prompt: 'What is the parent doing with the sled rope going uphill?',                    choices: ['vući', 'gurati', 'nositi'] },
  smijati:   { word: 'smijati se', en: 'to laugh',              prompt: 'The children throw up their arms in joy on the hill. Which word is it?',       choices: ['plakati', 'smijati se', 'spavati'] },
  jezero:    { word: 'jezero',     en: 'lake / pond',           prompt: 'This round body of water among the pines has frozen solid. Which word is it?', choices: ['rijeka', 'potok', 'jezero'] },
  led:       { word: 'led',        en: 'ice',                   prompt: 'The pond surface is frozen into a smooth glassy sheet. Which word is it?',     choices: ['led', 'snijeg', 'voda'] },
  klizaljke: { word: 'klizaljke',  en: 'ice skates',            prompt: 'These boots have thin steel blades underneath for gliding. Which word is it?', choices: ['čizme', 'klizaljke', 'skije'] },
  klizati:   { word: 'klizati',    en: 'to ice skate',          prompt: 'What are the people doing across the frozen pond?',                            choices: ['trčati', 'šetati', 'klizati'] },
  klizavo:   { word: 'klizavo',    en: 'slippery',              prompt: 'He waves his arms to keep balance on the icy patch. How is the ground?',       choices: ['klizavo', 'suho', 'mekano'] },
  mraz:      { word: 'mraz',       en: 'frost',                 prompt: 'Sparkling white ice crystals coat the wooden fence rails. Which word is it?',  choices: ['kiša', 'mraz', 'magla'] },

  // Zone 5: Ski Slopes, Chairlift & Groomer (11)
  staza:     { word: 'staza',      en: 'ski trail',             prompt: 'This wide groomed white run sweeps down the mountainside. Which word is it?',  choices: ['cesta', 'most', 'staza'] },
  skije:     { word: 'skije',      en: 'skis',                  prompt: 'These two long curved boards glide over the snow. Which word is it?',          choices: ['skije', 'sanke', 'merdevine'] },
  stapovi:   { word: 'štapovi',    en: 'ski poles',             prompt: 'What is the skier holding in both hands for balance?',                         choices: ['vesla', 'štapovi', 'grane'] },
  skijas:    { word: 'skijaš',     en: 'skier',                 prompt: 'Who is carving turns down the Olympic slope?',                                 choices: ['ribar', 'vozač', 'skijaš'] },
  skijati:   { word: 'skijati',    en: 'to ski',                prompt: 'What sport is she doing down the snowy hillside?',                             choices: ['skijati', 'klizati', 'plivati'] },
  kaciga:    { word: 'kaciga',     en: 'helmet',                prompt: 'This hard shell protects the skier\'s head on the slope. Which word is it?',   choices: ['kapa', 'kaciga', 'fes'] },
  naocale:   { word: 'naočale',    en: 'ski goggles',           prompt: 'These tinted lenses shield the skier\'s eyes from snow glare. Which word is it?', choices: ['rukavice', 'čizme', 'naočale'] },
  padati:    { word: 'padati',     en: 'to fall',               prompt: 'This beginner tumbled right into the soft powder snow. Which word is it?',     choices: ['padati', 'stajati', 'sjediti'] },
  mreza:     { word: 'mreža',      en: 'safety net',            prompt: 'This bright orange barrier lines the edge of the ski run. Which word is it?',  choices: ['zid', 'mreža', 'zastava'] },
  sjedez:    { word: 'sjedežnica', en: 'chairlift',             prompt: 'Hanging chairs carry skiers up the snowy mountainside. Which word is it?',     choices: ['tramvaj', 'autobus', 'sjedežnica'] },
  ratrak:    { word: 'ratrak',     en: 'snow groomer',          prompt: 'This red tracked mountain machine smooths the ski pistes. Which word is it?',  choices: ['ratrak', 'auto', 'bicikl'] },

  // Zone 6: Spruce Forest & Bosnian Mountain Wildlife (10)
  bor:       { word: 'bor',        en: 'pine tree',             prompt: 'This tall evergreen with long needles stands above the snow. Which word is it?', choices: ['lipa', 'bor', 'javor'] },
  jela:      { word: 'jela',       en: 'fir / spruce tree',     prompt: 'This layered cone-shaped evergreen bends under fresh snow. Which word is it?', choices: ['orah', 'jabuka', 'jela'] },
  sisarka:   { word: 'šišarka',    en: 'pinecone',              prompt: 'These woody brown cones sit on the snowy pine branches. Which word is it?',    choices: ['šišarka', 'dunja', 'bundeva'] },
  grana:     { word: 'grana',      en: 'branch',                prompt: 'A heavy snow pillow rests along this wooden bough. Which word is it?',         choices: ['stablo', 'grana', 'lišće'] },
  lisica:    { word: 'lisica',     en: 'fox',                   prompt: 'This bright orange forest animal has a bushy white-tipped tail. Which word is it?', choices: ['mačka', 'pas', 'lisica'] },
  zec:       { word: 'zec',        en: 'hare',                  prompt: 'Long ears peek up beside a snowy bush at the forest edge. Which word is it?',  choices: ['zec', 'vjeverica', 'ovca'] },
  sova:      { word: 'sova',       en: 'owl',                   prompt: 'This round-eyed forest bird watches quietly from a spruce bough. Which word is it?', choices: ['golub', 'sova', 'patka'] },
  srna:      { word: 'srna',       en: 'roe deer',              prompt: 'This graceful brown woodland creature steps softly through the pines. Which word is it?', choices: ['konj', 'ovca', 'srna'] },
  vuk:       { word: 'vuk',        en: 'wolf',                  prompt: 'This wild grey mountain animal inspired the 1984 Olympic mascot Vučko. Which word is it?', choices: ['vuk', 'pas', 'lisica'] },
  vrana:     { word: 'vrana',      en: 'crow',                  prompt: 'This glossy black bird perches on the snowy wooden fence. Which word is it?',  choices: ['slavuj', 'vrana', 'golub'] },

  // Zone 7: Ogorjelica Summit, Rajska dolina & Finale (7 + zima)
  dolina:    { word: 'dolina',     en: 'valley',                prompt: 'Rajska dolina opens wide below the snowy mountain slopes. Which word is it?',  choices: ['brdo', 'planina', 'dolina'] },
  greben:    { word: 'greben',     en: 'mountain ridge',        prompt: 'This long rocky snow-crest runs along the top of Jahorina. Which word is it?', choices: ['greben', 'obala', 'trg'] },
  magla:     { word: 'magla',      en: 'fog / mist',            prompt: 'A pale soft cloud layer drifts low across the valley floor. Which word is it?', choices: ['dim', 'magla', 'kiša'] },
  vjetar:    { word: 'vjetar',     en: 'wind',                  prompt: 'What makes the orange windsock and ridge banners stream straight out?',        choices: ['sunce', 'mraz', 'vjetar'] },
  vidikovac: { word: 'vidikovac',  en: 'lookout',               prompt: 'This wooden summit deck looks out over all the Bosnian peaks. Which word is it?', choices: ['vidikovac', 'stanica', 'han'] },
  zastavica: { word: 'zastavica',  en: 'slalom flag',           prompt: 'Red and blue racing flags mark the turns of the Olympic course. Which word is it?', choices: ['mreža', 'zastavica', 'putokaz'] },
  vrh:       { word: 'vrh',        en: 'summit / peak',         prompt: 'You have reached Ogorjelica, the highest point of Jahorina. Which word is it?', choices: ['dno', 'obala', 'vrh'] },

  // Finale word (76th entry in journal)
  zima:      { word: 'zima',       en: 'winter' },
};

export const ORDER = [
  'snijeg', 'pahulja', 'pet', 'putokaz', 'snjesko', 'mrkva', 'grudva', 'bacati', 'kapa', 'rukavice', 'bijela',
  'koliba', 'vikendica', 'ledenica', 'fenjer', 'drva', 'panj', 'sjekira', 'cijepati', 'lopata', 'cistiti', 'vatra', 'pec', 'grijati', 'tragovi',
  'caj', 'med', 'hljeb', 'sir', 'supa', 'solja', 'termos', 'deka', 'cizme', 'dzemper', 'jakna', 'hladno',
  'sanke', 'sankati', 'vuci', 'smijati', 'jezero', 'led', 'klizaljke', 'klizati', 'klizavo', 'mraz',
  'staza', 'skije', 'stapovi', 'skijas', 'skijati', 'kaciga', 'naocale', 'padati', 'mreza', 'sjedez', 'ratrak',
  'bor', 'jela', 'sisarka', 'grana', 'lisica', 'zec', 'sova', 'srna', 'vuk', 'vrana',
  'dolina', 'greben', 'magla', 'vjetar', 'vidikovac', 'zastavica', 'vrh',
  'zima',
];

export const CULTURE = {
  place: 'Jahorina',
  subtitle: 'Bosnia and Herzegovina · the Olympic mountain',
  facts: [
    ['The 1984 Winter Olympics', 'In February 1984 Jahorina hosted the women\'s alpine skiing events of the XIV Winter Olympic Games in Sarajevo. Its slopes, Poljice and Rajska dolina, still welcome skiers from across the region every winter.'],
    ['Vučko, the little wolf', 'The beloved mascot of the 1984 Games was Vučko, a cheerful little wolf who helped turn the mountain wolf from a feared creature into a friendly symbol of Bosnian hospitality.'],
    ['Ogorjelica & Rajska dolina', 'Jahorina rises to 1,916 metres at Ogorjelica peak, named after its sunny high ridges above the bowl of Rajska dolina (Paradise Valley), where snow often lingers well into spring.'],
    ['Mountain cabins & čaj', 'After cold hours on the slopes, skiers gather in timber planinarski domovi and steep-roofed vikendice around a crackling wood stove (peć) for mountain herbal tea with honey, hot soup, and homemade bread.'],
  ],
};
