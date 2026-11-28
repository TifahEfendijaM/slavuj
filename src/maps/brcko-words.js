// Brčko (autumn): 53 learnable words + the finale word 'žetva', plus the culture travelogue page.
// Keep this module import-free so the Bosnia map (src/maps/counts.js) stays light.
export const WORDS = {
  // The Sava and the port (11)
  most:        { word: 'most',         en: 'bridge',                     q: 'The long steel crossing over the Sava to Croatia on the other bank. Which word is it?', choices: ['most', 'tunel', 'toranj'] },
  rijeka:      { word: 'rijeka',       en: 'river',                      q: 'The broad, slow Sava flowing past the town. Which word is it?', choices: ['rijeka', 'potok', 'more'] },
  luka:        { word: 'luka',         en: 'port, harbour',              q: 'The concrete quay where river boats load and unload. Which word is it?', choices: ['luka', 'pijaca', 'stanica'] },
  dizalica:    { word: 'dizalica',     en: 'crane',                      q: 'The tall yellow machines on rails that lift cargo off the boats. Which word is it?', choices: ['dizalica', 'traktor', 'vjetrenjača'] },
  teglenica:   { word: 'teglenica',    en: 'barge',                      q: 'The long flat river boat loaded with a heap of gravel. Which word is it?', choices: ['teglenica', 'jedrilica', 'podmornica'] },
  mornar:      { word: 'mornar',       en: 'sailor, boatman',            q: 'Who works on the barge and ties it up at the quay?', choices: ['mornar', 'rudar', 'pastir'] },
  bitva:       { word: 'bitva',        en: 'mooring bollard',            q: 'The short black iron posts on the quay edge that the ropes are tied to. Which word is it?', choices: ['bitva', 'stub', 'klin'] },
  kontejner:   { word: 'kontejner',    en: 'shipping container',         q: 'The big coloured metal boxes stacked at the end of the quay. Which word is it?', choices: ['kontejner', 'ormar', 'kiosk'] },
  bova:        { word: 'bova',         en: 'buoy',                       q: 'The red floating marker bobbing in the river to show the boats the way. Which word is it?', choices: ['bova', 'lopta', 'flaša'] },
  sidro:       { word: 'sidro',        en: 'anchor',                     q: 'The heavy old iron hook set on a stone on the promenade, in memory of the river boats. Which word is it?', choices: ['sidro', 'ključ', 'zvono'] },
  magla:       { word: 'magla',        en: 'fog, mist',                  q: 'The white veils lying low over the far bank on an autumn morning. Which word is it?', choices: ['magla', 'dim', 'snijeg'] },

  // The promenade and the fishermen (8)
  setaliste:   { word: 'šetalište',    en: 'promenade',                  q: 'The paved walk along the river where people stroll in the evening. Which word is it?', choices: ['šetalište', 'autoput', 'pruga'] },
  fenjer:      { word: 'fenjer',       en: 'street lamp',                q: 'The iron lamp posts with glass lanterns along the walk. Which word is it?', choices: ['fenjer', 'semafor', 'antena'] },
  ribar:       { word: 'ribar',        en: 'fisherman',                  q: 'Who stands at the railing with his line in the Sava, waiting for a bite?', choices: ['ribar', 'lovac', 'kovač'] },
  stap:        { word: 'štap',         en: 'fishing rod',                q: 'The long thin rods propped on a stand, their lines in the water. Which word is it?', choices: ['štap', 'koplje', 'metla'] },
  mreza:       { word: 'mreža',        en: 'net',                        q: 'The fishing net hung up on a frame to dry. Which word is it?', choices: ['mreža', 'zavjesa', 'ćebe'] },
  saran:       { word: 'šaran',        en: 'carp',                       q: 'The big golden-scaled river fish swimming slowly near the bank. Which word is it?', choices: ['šaran', 'delfin', 'rak'] },
  camac:       { word: 'čamac',        en: 'small boat',                 q: 'The little wooden boat tied up at the jetty. Which word is it?', choices: ['čamac', 'vagon', 'balon'] },
  bicikl:      { word: 'bicikl',       en: 'bicycle',                    q: 'The two-wheeler leaning against a lamp post, its rider gone for coffee. Which word is it?', choices: ['bicikl', 'motor', 'skuter'] },

  // The town centre (8)
  trg:         { word: 'trg',          en: 'town square',                q: 'The big paved open space in the middle of town in front of the City Hall. Which word is it?', choices: ['trg', 'park', 'parking'] },
  fontana:     { word: 'fontana',      en: 'fountain',                   q: 'The round stone basin in the middle of the square with water rising from it. Which word is it?', choices: ['fontana', 'bunar', 'kada'] },
  dzamija:     { word: 'džamija',      en: 'mosque',                     q: 'The White Mosque with its great dome, near the river. Which word is it?', choices: ['džamija', 'banka', 'pošta'] },
  munara:      { word: 'munara',       en: 'minaret',                    q: 'The tall slim white tower rising beside the White Mosque. Which word is it?', choices: ['munara', 'dimnjak', 'dizalica'] },
  crkva:       { word: 'crkva',        en: 'church',                     q: 'The Orthodox church with its bell tower and green dome. Which word is it?', choices: ['crkva', 'škola', 'kino'] },
  zvono:       { word: 'zvono',        en: 'bell',                       q: 'What hangs in the open top of the church tower and rings on Sundays? Which word is it?', choices: ['zvono', 'sat', 'fenjer'] },
  zastava:     { word: 'zastava',      en: 'flag',                       q: 'The blue and yellow flag with white stars on top of the City Hall. Which word is it?', choices: ['zastava', 'jedro', 'peškir'] },
  lisce:       { word: 'lišće',        en: 'leaves',                     q: 'The heap of golden fallen leaves raked together in the church garden. Which word is it?', choices: ['lišće', 'sijeno', 'pijesak'] },
  grablje:     { word: 'grablje',      en: 'rake',                       q: 'The garden tool with long teeth leaning on the leaf heap. Which word is it?', choices: ['grablje', 'lopata', 'sjekira'] },

  // The market (8)
  pijaca:      { word: 'pijaca',       en: 'market',                     q: 'The long roofed stalls where farmers sell what they have grown. Which word is it?', choices: ['pijaca', 'bolnica', 'škola'] },
  prodavac:    { word: 'prodavac',     en: 'stallholder, seller',        q: 'Who stands behind the stall weighing apples for the customers?', choices: ['prodavac', 'kuhar', 'vozač'] },
  bundeva:     { word: 'bundeva',      en: 'pumpkin',                    q: 'The big round orange autumn vegetables piled on the stall. Which word is it?', choices: ['bundeva', 'lubenica', 'dinja'] },
  kupus:       { word: 'kupus',        en: 'cabbage',                    q: 'The round green heads, for making sour cabbage for the winter. Which word is it?', choices: ['kupus', 'luk', 'krompir'] },
  paprika:     { word: 'paprika',      en: 'pepper',                     q: 'The long red vegetables hanging in strings, ready for ajvar. Which word is it?', choices: ['paprika', 'mrkva', 'kruška'] },
  jabuka:      { word: 'jabuka',       en: 'apple',                      q: 'The red and green fruit filling the wooden crates. Which word is it?', choices: ['jabuka', 'breskva', 'limun'] },
  orah:        { word: 'orah',         en: 'walnut',                     q: 'The hard brown nuts in the open sack. Which word is it?', choices: ['orah', 'grah', 'grožđe'] },
  kesten:      { word: 'kesten',       en: 'chestnut',                   q: 'The shiny brown nuts roasting in the smoky drum, sold warm in paper cones. Which word is it?', choices: ['kesten', 'kokice', 'kikiriki'] },

  // The Posavina farm (17)
  njiva:       { word: 'njiva',        en: 'ploughed field',             q: 'The wide flat brown field, ploughed in long furrows after the harvest. Which word is it?', choices: ['njiva', 'jezero', 'šuma'] },
  kukuruz:     { word: 'kukuruz',      en: 'corn, maize',                q: 'The rows of tall dry stalks with yellow cobs, the crop of Posavina. Which word is it?', choices: ['kukuruz', 'pšenica', 'trska'] },
  cardak:      { word: 'čardak',       en: 'corn crib',                  q: 'The little wooden house on stilts with slatted walls, full of yellow corn cobs. Which word is it?', choices: ['čardak', 'garaža', 'kućica'] },
  traktor:     { word: 'traktor',      en: 'tractor',                    q: 'The red farm machine with huge back wheels, out on the field. Which word is it?', choices: ['traktor', 'autobus', 'tramvaj'] },
  plast:       { word: 'plast',        en: 'haystack',                   q: 'The tall rounded heap of hay built round a pole. Which word is it?', choices: ['plast', 'šator', 'brdo'] },
  vile:        { word: 'vile',         en: 'pitchfork',                  q: 'The long-handled fork with three prongs, leaning on the haystack. Which word is it?', choices: ['vile', 'grablje', 'veslo'] },
  strasilo:    { word: 'strašilo',     en: 'scarecrow',                  q: 'Who stands in the field in an old coat and hat to frighten the crows away?', choices: ['strašilo', 'pastir', 'lutka'] },
  suncokret:   { word: 'suncokret',    en: 'sunflower',                  q: 'The tall dry flowers with heavy brown heads full of seeds, bowing at the field\'s edge. Which word is it?', choices: ['suncokret', 'ruža', 'tulipan'] },
  kazan:       { word: 'kazan',        en: 'copper cauldron',            q: 'The big copper pot on a fire in the yard, where plums are boiled for hours. Which word is it?', choices: ['kazan', 'lonac', 'bure'] },
  pekmez:      { word: 'pekmez',       en: 'plum jam',                   q: 'The thick dark jam cooked from plums, filled into jars for the winter. Which word is it?', choices: ['pekmez', 'med', 'ajvar'] },
  sljiva:      { word: 'šljiva',       en: 'plum tree, plum',            q: 'The orchard trees heavy with dark blue fruit. Which word is it?', choices: ['šljiva', 'trešnja', 'smokva'] },
  guska:       { word: 'guska',        en: 'goose',                      q: 'The white birds with orange beaks waddling round the farmyard. Which word is it?', choices: ['guska', 'patka', 'kokoš'] },
  pleter:      { word: 'pleter',       en: 'wattle fence',               q: 'The fence of thin branches woven between posts round the yard. Which word is it?', choices: ['pleter', 'zid', 'mreža'] },
  gnijezdo:    { word: 'gnijezdo',     en: 'nest',                       q: 'The big round pile of sticks on top of a tall pole, where the storks raised their young this summer. Which word is it?', choices: ['gnijezdo', 'korpa', 'krov'] },
  topola:      { word: 'topola',       en: 'poplar',                     q: 'The tall narrow trees in a row, turned gold in autumn. Which word is it?', choices: ['topola', 'palma', 'bor'] },
  jato:        { word: 'jato',         en: 'flock',                      q: 'The wild geese resting together on the sandbank, on their way south. Which word is it?', choices: ['jato', 'stado', 'čopor'] },
  // the last word: the City Hall
  vijecnica:   { word: 'vijećnica',    en: 'city hall',                  q: 'The grand striped building with towers and domes, the pride of Brčko. Which word is it?', choices: ['vijećnica', 'tvrđava', 'bolnica'] },

  // Finale
  zetva:       { word: 'žetva',        en: 'harvest' },
};

export const ORDER = Object.keys(WORDS);

export const CULTURE = {
  place: 'Brčko',
  subtitle: 'Bosnia and Herzegovina · on the Sava',
  facts: [
    ['On the Sava', 'Brčko lies on the right bank of the Sava, Bosnia\'s border with Croatia. A bridge crosses to Gunja on the other side, and the town\'s river port is the only one in the country on a navigable river.'],
    ['The City Hall', 'Built in 1892 in the Austro-Hungarian years, Brčko\'s City Hall is a pseudo-Moorish building of striped walls, horseshoe arches and little domes, like Sarajevo\'s Vijećnica.'],
    ['Brčko District', 'Since 2000 Brčko has been a district of its own, shared by the whole country. Its White Mosque, Orthodox and Catholic churches stand a few streets from each other.'],
    ['Posavina', 'All around stretches Posavina, the flat and fertile plain along the Sava: fields of corn and sunflowers, plum orchards, and wooden čardaci on stilts to keep the corn dry.'],
    ['Pekmez', 'In autumn Posavina families boil plums for hours in copper kazani in the yard, stirring all day, to make thick pekmez for the winter.'],
    ['Autumn on the river', 'Autumn brings fog over the Sava in the mornings, golden poplars along the banks, and flocks of wild geese resting on the sandbanks on their way south.'],
  ],
};
