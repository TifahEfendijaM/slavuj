// The words of Jajce (spring): the Pliva waterfall in the middle of the town, the little watermills on the lake, the old
// fortress on its hill, blossom and young animals everywhere. Edit freely: word, English meaning, the question shown
// above the list, and the answer choices (the correct word must be among them).
const Q = 'Which word is it?';
export const WORDS = {
  mlin:       { word: 'mlin',       en: 'watermill',      q: 'What is the nightingale standing on?', choices: ['mlin', 'most', 'kula'] },
  tocak:      { word: 'točak',      en: 'wheel',          q: 'What does the water turn?', choices: ['točak', 'krov', 'zvono'] },
  jezero:     { word: 'jezero',     en: 'lake',           q: 'The calm water above the town. Which word is it?', choices: ['more', 'jezero', 'potok'] },
  mostic:     { word: 'mostić',     en: 'little bridge',  q: 'What crosses the stream?', choices: ['mostić', 'cesta', 'zid'] },
  slap:       { word: 'slap',       en: 'waterfall',      q: 'Where the river falls down the rock. Which word is it?', choices: ['izvor', 'slap', 'jezero'] },
  duga:       { word: 'duga',       en: 'rainbow',        q: 'The coloured arch over the falls. Which word is it?', choices: ['duga', 'oblak', 'most'] },
  vrba:       { word: 'vrba',       en: 'willow',         q: 'Which tree hangs its branches over the water?', choices: ['bor', 'vrba', 'trešnja'] },
  patka:      { word: 'patka',      en: 'duck',           q: 'Who is swimming on the lake?', choices: ['patka', 'riba', 'labud'] },
  pacici:     { word: 'pačići',     en: 'ducklings',      q: 'Who is following the duck?', choices: ['pilići', 'pačići', 'jaganjci'] },
  grad:       { word: 'grad',       en: 'town',           q: 'All the houses together. Which word is it?', choices: ['grad', 'selo', 'šuma'] },
  trg:        { word: 'trg',        en: 'square',         q: 'The paved open place in the middle of the town. Which word is it?', choices: ['trg', 'livada', 'krov'] },
  izvor:      { word: 'izvor',      en: 'spring (water)', q: 'Where fresh water comes out of the stone. Which word is it?', choices: ['izvor', 'bunar', 'slap'] },
  zvonik:     { word: 'zvonik',     en: 'bell tower',     q: 'The tall tower in the town. Which word is it?', choices: ['zvonik', 'dimnjak', 'tvrđava'] },
  zvono:      { word: 'zvono',      en: 'bell',           q: 'What rings at the top of the tower?', choices: ['sat', 'zvono', 'top'] },
  zidine:     { word: 'zidine',     en: 'town walls',     q: 'The old stone walls on the hill. Which word is it?', choices: ['zidine', 'ograda', 'stepenice'] },
  kapija:     { word: 'kapija',     en: 'gate',           q: 'The way in through the walls. Which word is it?', choices: ['prozor', 'kapija', 'krov'] },
  katakombe:  { word: 'katakombe',  en: 'catacombs',      q: 'The old royal tombs cut into the rock. Which word is it?', choices: ['katakombe', 'podrum', 'pećina'] },
  tresnja:    { word: 'trešnja',    en: 'cherry tree',    q: 'Which tree is covered in white and pink blossom?', choices: ['trešnja', 'bor', 'vrba'] },
  lasta:      { word: 'lasta',      en: 'swallow',        q: 'The bird that comes back in spring. Which word is it?', choices: ['lasta', 'vrana', 'sova'] },
  gnijezdo:   { word: 'gnijezdo',   en: 'nest',           q: 'What have the birds built?', choices: ['gnijezdo', 'kućica', 'korpa'] },
  roda:       { word: 'roda',       en: 'stork',          q: 'The tall white bird on the chimney. Which word is it?', choices: ['roda', 'golub', 'patka'] },
  kosnica:    { word: 'košnica',    en: 'beehive',        q: 'Where do the bees live?', choices: ['košnica', 'gnijezdo', 'štala'] },
  pcela:      { word: 'pčela',      en: 'bee',            q: 'Who makes honey?', choices: ['muha', 'pčela', 'leptir'] },
  pcelar:     { word: 'pčelar',     en: 'beekeeper',      q: 'Who looks after the bees?', choices: ['pčelar', 'pastir', 'ribar'] },
  leptir:     { word: 'leptir',     en: 'butterfly',      q: 'Who is resting on the flower?', choices: ['leptir', 'pčela', 'ptica'] },
  livada:     { word: 'livada',     en: 'meadow',         q: 'The green field full of flowers. Which word is it?', choices: ['livada', 'trg', 'jezero'] },
  maslacak:   { word: 'maslačak',   en: 'dandelion',      q: 'Which little yellow flower is everywhere in the grass?', choices: ['maslačak', 'tulipan', 'ruža'] },
  tulipan:    { word: 'tulipan',    en: 'tulip',          q: 'Which flower is it?', choices: ['ruža', 'tulipan', 'maslačak'] },
  janje:      { word: 'janje',      en: 'lamb',           q: 'Who is the little white one in the meadow?', choices: ['janje', 'tele', 'pas'] },
  pastir:     { word: 'pastir',     en: 'shepherd',       q: 'Who looks after the lambs?', choices: ['pastir', 'pčelar', 'poštar'] },
  zmaj:       { word: 'zmaj',       en: 'kite',           q: 'What is flying high on a string?', choices: ['zmaj', 'balon', 'ptica'] },
  djecak:     { word: 'dječak',     en: 'boy',            q: 'Who is holding the string?', choices: ['djevojčica', 'dječak', 'djed'] },
  saditi:     { word: 'saditi',     en: 'to plant',       q: 'What is she doing in the garden?', choices: ['saditi', 'kuhati', 'čitati'] },
  motika:     { word: 'motika',     en: 'hoe',            q: 'What is she digging with?', choices: ['motika', 'metla', 'kišobran'] },
  strasilo:   { word: 'strašilo',   en: 'scarecrow',      q: 'Who stands in the garden to keep the birds away?', choices: ['strašilo', 'snjegović', 'pastir'] },
  sesir:      { word: 'šešir',      en: 'hat',            q: 'What is on the scarecrow’s head?', choices: ['šešir', 'šal', 'kapa'] },
  kokos:      { word: 'kokoš',      en: 'hen',            q: 'Who is pecking in the yard?', choices: ['kokoš', 'patka', 'golub'] },
  pile:       { word: 'pile',       en: 'chick',          q: 'Who is the little yellow one?', choices: ['pile', 'pače', 'mače'] },
  jaje:       { word: 'jaje',       en: 'egg',            q: 'What is in the basket?', choices: ['jaje', 'jabuka', 'kamen'] },
  prolece:    { word: 'proljeće',   en: 'spring (season)' },
};
export const ORDER = Object.keys(WORDS);

export const CULTURE = {
  place: 'Jajce',
  subtitle: 'Bosnia and Herzegovina · where the Pliva meets the Vrbas',
  facts: [
    ['The waterfall', 'In the middle of the town the Pliva drops about 20 metres into the Vrbas. Few towns in the world have a waterfall in their centre.'],
    ['Mlinčići', 'On the lakes above the town stand about twenty little wooden watermills on stilts, built centuries ago to grind grain.'],
    ['A royal town', 'Jajce was the seat of the last Bosnian kings. The fortress on the hill, its walls and gates, date from the 14th century.'],
    ['The catacombs', 'Under the town lies a church and tomb cut into the rock around 1400, the catacombs of Jajce.'],
    ['Spring', 'In spring the Pliva is full and loud, the orchards around the lakes blossom, and the storks come back to their nests on the chimneys.'],
  ],
};
