// Bihać (spring): 66 learnable words + the finale word 'priroda', plus the culture travelogue page.
// Keep this module import-free so the Bosnia map (src/maps/counts.js) stays light.
export const WORDS = {
  // Zone 1: Emerald Una River, Cascades, River Island and Una Boat (10)
  smaragd:     { word: 'smaragd',      en: 'emerald',                      q: 'The Una River glows the deep green colour of this precious gemstone. Which word is it?', choices: ['smaragd', 'bakar', 'kamen'] },
  ada:         { word: 'ada',          en: 'river island',                 q: 'A small lush green island resting right in the middle of the Una River. Which word is it?', choices: ['ada', 'planina', 'dolina'] },
  tok:         { word: 'tok',          en: 'river current, flow',          q: 'The steady rush of clear water carrying leaves downstream along the Una. Which word is it?', choices: ['tok', 'led', 'magla'] },
  buk:         { word: 'buk',          en: 'roaring cascade, ledge',       q: 'A foaming step where the Una tumbles over mossy travertine ledges, like Štrbački ___. Which word is it?', choices: ['buk', 'bunar', 'most'] },
  ladja:       { word: 'lađa',         en: 'traditional wooden Una boat',  q: 'The long narrow wooden boat built in Bihać to glide over the Una rapids. Which word is it?', choices: ['lađa', 'tramvaj', 'bicikl'] },
  pramac:      { word: 'pramac',       en: 'bow, prow (front of boat)',    q: 'The pointed curved front tip of the wooden Una river boat. Which word is it?', choices: ['pramac', 'krov', 'prozor'] },
  krma:        { word: 'krma',         en: 'stern (rear of boat)',         q: 'The back end of the boat where the helmsman steers through the current. Which word is it?', choices: ['krma', 'vrata', 'klupa'] },
  kormilo:     { word: 'kormilo',      en: 'rudder',                       q: 'The wooden blade mounted at the stern to steer the Una boat left and right. Which word is it?', choices: ['kormilo', 'motika', 'sjekira'] },
  regata:      { word: 'regata',       en: 'river regatta, raft race',     q: 'Colourful inflatable rafts lined up for Bihać\'s famous summer Una ___. Which word is it?', choices: ['regata', 'pijaca', 'škola'] },
  prsluk:      { word: 'prsluk',       en: 'life vest',                    q: 'The bright orange safety jacket worn by rafters on the Una rapids. Which word is it?', choices: ['kaput', 'prsluk', 'šal'] },

  // Zone 2: Japodes Prehistoric Stilt Village (Sojenice) and Riverbank Pottery (10)
  sojenica:    { word: 'sojenica',     en: 'stilt house (over water)',     q: 'An ancient wooden dwelling built on pilings over the Una by the Japodes tribe. Which word is it?', choices: ['sojenica', 'vijećnica', 'bolnica'] },
  trstika:     { word: 'trstika',      en: 'thatch, marsh cane roof',      q: 'Bundled river canes tied thickly to roof the prehistoric stilt houses. Which word is it?', choices: ['trstika', 'cigla', 'staklo'] },
  stup:        { word: 'stup',         en: 'wooden piling, tall post',     q: 'The thick oak legs driven into the riverbed holding up each stilt house. Which word is it?', choices: ['stup', 'stepenice', 'zid'] },
  glina:       { word: 'glina',        en: 'clay',                         q: 'Soft reddish-brown riverside earth shaped by hand into pots and jugs. Which word is it?', choices: ['glina', 'brašno', 'snijeg'] },
  cup:         { word: 'ćup',          en: 'clay pitcher, amphora',        q: 'A round earthen jug with two handles dried beside the potter\'s wheel. Which word is it?', choices: ['ćup', 'čaša', 'tanjir'] },
  zdjela:      { word: 'zdjela',       en: 'bowl',                         q: 'A deep round clay dish used for serving fruit, soup or cream. Which word is it?', choices: ['zdjela', 'daska', 'knjiga'] },
  lonac:       { word: 'lonac',        en: 'cooking pot',                  q: 'The big round lidded pot set beside the hearth for slow stews. Which word is it?', choices: ['lonac', 'šolja', 'kašika'] },
  ognjiste:    { word: 'ognjište',     en: 'hearth, open stone fireplace', q: 'The low stone circle where glowing logs warm the stilt-village yard. Which word is it?', choices: ['ognjište', 'bunar', 'stolica'] },
  pepeo:       { word: 'pepeo',        en: 'ash',                          q: 'Soft pale grey powder left behind after the hearth wood burns down. Which word is it?', choices: ['pijesak', 'pepeo', 'šećer'] },
  grncar:      { word: 'grnčar',       en: 'potter',                       q: 'Who shapes wet clay into pitchers and bowls by the Una riverbank?', choices: ['grnčar', 'vozač', 'konobar'] },

  // Zone 3: Kapetanova kula and Fethija Gothic Mosque (11)
  strazar:     { word: 'stražar',      en: 'guard, watchman',              q: 'Who stands watch beside the stone walls of Captain\'s Tower?', choices: ['stražar', 'pekar', 'mlinar'] },
  tamnica:     { word: 'tamnica',      en: 'medieval dungeon door',        q: 'The heavy iron-bound cellar doorway beneath the old fortress tower. Which word is it?', choices: ['tamnica', 'balkon', 'prozor'] },
  pukotina:    { word: 'pukotina',     en: 'crack, fissure (in stone)',    q: 'A jagged centuries-old split running across the ancient tower wall. Which word is it?', choices: ['pukotina', 'slika', 'zastava'] },
  reljef:      { word: 'reljef',       en: 'stone relief carving',         q: 'Raised ornamental figures carved right into the medieval stone slab. Which word is it?', choices: ['reljef', 'ćilim', 'torba'] },
  stit:        { word: 'štit',         en: 'shield',                       q: 'The curved medieval armour plate displaying a heraldic emblem by the tower. Which word is it?', choices: ['štit', 'tanjir', 'točak'] },
  mac:         { word: 'mač',          en: 'sword',                        q: 'The long steel blade mounted beside the shield outside Captain\'s Tower. Which word is it?', choices: ['nož', 'mač', 'olovka'] },
  oklop:       { word: 'oklop',        en: 'suit of armour',               q: 'Polished iron plates worn by medieval defenders of Bihać. Which word is it?', choices: ['kaput', 'oklop', 'džemper'] },
  gotika:      { word: 'gotika',       en: 'Gothic pointed arch',          q: 'Fethija Mosque keeps tall pointed stone windows from this medieval architectural style. Which word is it?', choices: ['gotika', 'livada', 'čaršija'] },
  rozeta:      { word: 'rozeta',       en: 'rose window',                  q: 'The carved circular stone window glowing high on Fethija\'s facade. Which word is it?', choices: ['rozeta', 'sat', 'dimnjak'] },
  vitraj:      { word: 'vitraj',       en: 'stained glass',                q: 'Jewel-coloured panes of glass gleaming inside the tall Gothic windows. Which word is it?', choices: ['vitraj', 'zavjesa', 'kamen'] },
  svijecnjak:  { word: 'svijećnjak',   en: 'candelabra, candlestick',      q: 'The tall brass holder supporting three wax candles at the stone porch. Which word is it?', choices: ['svijećnjak', 'fenjer', 'lampa'] },

  // Zone 4: Una Riverside Park, Art and Krajina Music (10)
  drvored:     { word: 'drvored',      en: 'tree-lined avenue',            q: 'A neat double row of shady spring trees bordering the Bihać riverside walk. Which word is it?', choices: ['drvored', 'kanjon', 'trg'] },
  skulptura:   { word: 'skulptura',    en: 'sculpture, statue',            q: 'A carved stone artwork standing on a pedestal in the riverside park. Which word is it?', choices: ['skulptura', 'kuća', 'klupa'] },
  harmonika:   { word: 'harmonika',    en: 'accordion',                    q: 'The pleated squeeze-box instrument filling the Una park with Krajina melodies. Which word is it?', choices: ['gitara', 'harmonika', 'violina'] },
  saz:         { word: 'saz',          en: 'traditional Bosnian lute',     q: 'A slender long-necked stringed instrument used for traditional Bosnian sevdalinka songs. Which word is it?', choices: ['saz', 'veslo', 'štap'] },
  frula:       { word: 'frula',        en: 'wooden shepherd flute',        q: 'A simple carved wooden pipe resting on the musician\'s bench. Which word is it?', choices: ['frula', 'kašika', 'ključ'] },
  muzicar:     { word: 'muzičar',      en: 'musician',                     q: 'Who sits on the park bench playing lively Krajina tunes on the accordion?', choices: ['muzičar', 'kuhar', 'krojač'] },
  tezga:       { word: 'tezga',        en: 'craft stall, market stand',    q: 'A small wooden roofed stand along the riverside selling handmade wares. Which word is it?', choices: ['tezga', 'bolnica', 'pošta'] },
  suvenir:     { word: 'suvenir',      en: 'souvenir, keepsake',           q: 'Little painted wooden keepsakes of Bihać and the Una lined up on the stall. Which word is it?', choices: ['suvenir', 'hljeb', 'sir'] },
  platno:      { word: 'platno',       en: 'painting canvas',              q: 'The stretched white cloth on the easel showing a painting of the Una River. Which word is it?', choices: ['platno', 'novine', 'pismo'] },
  okvir:       { word: 'okvir',        en: 'picture frame',                q: 'The carved golden wooden border surrounding the river painting. Which word is it?', choices: ['okvir', 'prozor', 'ograda'] },

  // Zone 5: Krajina Orchard and Una River Camp (9)
  kamp:        { word: 'kamp',         en: 'campsite',                     q: 'The shady riverside clearing pitched with tents and benches for Una travellers. Which word is it?', choices: ['kamp', 'han', 'muzej'] },
  jorgan:      { word: 'jorgan',       en: 'quilt, padded blanket',        q: 'A warm quilted roll laid out beside the camp tent for cool Krajina nights. Which word is it?', choices: ['jorgan', 'haljina', 'torba'] },
  svjetiljka:  { word: 'svjetiljka',   en: 'camping lantern, lamp',        q: 'A portable glowing lantern hanging beside the camp table at dusk. Which word is it?', choices: ['svjetiljka', 'čajnik', 'kanta'] },
  kompas:      { word: 'kompas',       en: 'compass',                      q: 'The little round brass instrument whose needle always points north. Which word is it?', choices: ['kompas', 'sat', 'novčić'] },
  karta:       { word: 'karta',        en: 'map',                          q: 'The unfolded paper guide spread on the camp table showing the Una trails. Which word is it?', choices: ['karta', 'knjiga', 'tanjir'] },
  cuturica:    { word: 'čuturica',     en: 'water flask, canteen',         q: 'A flat round travel flask filled with cold Una spring water. Which word is it?', choices: ['čuturica', 'džezva', 'šolja'] },
  kruska:      { word: 'kruška',       en: 'pear',                         q: 'Sweet yellow-green bell-shaped fruit heaped in a Krajina orchard basket. Which word is it?', choices: ['jabuka', 'kruška', 'dunja'] },
  breskva:     { word: 'breskva',      en: 'peach',                        q: 'Soft rosy-orange summer-ripening orchard fruit set beside the pears. Which word is it?', choices: ['breskva', 'jagoda', 'bundeva'] },
  ljesnjak:    { word: 'lješnjak',     en: 'hazelnut',                     q: 'Small round brown nuts gathered from wild bushes along the Krajina hills. Which word is it?', choices: ['kukuruz', 'lješnjak', 'krompir'] },

  // Zone 6: National Park Una Wildlife and Emerald Forest (11)
  dabar:       { word: 'dabar',        en: 'beaver',                       q: 'The busy flat-tailed riverside mammal building wooden dams along quiet Una coves. Which word is it?', choices: ['dabar', 'mačka', 'zec'] },
  orao:        { word: 'orao',         en: 'eagle',                        q: 'A broad-winged golden bird of prey perched majestically on the high rock. Which word is it?', choices: ['golub', 'orao', 'patka'] },
  vodomar:     { word: 'vodomar',      en: 'kingfisher',                   q: 'A tiny jewel-blue and orange river bird diving into the clear Una for minnows. Which word is it?', choices: ['vodomar', 'vrana', 'sova'] },
  vilin:       { word: 'vilin konjic', en: 'dragonfly',                    q: 'A shimmering four-winged insect darting low over the emerald river reeds. Which word is it?', choices: ['pčela', 'vilin konjic', 'leptir'] },
  kornjaca:    { word: 'kornjača',     en: 'turtle',                       q: 'The slow shelled reptile sunning itself on a flat riverside stone. Which word is it?', choices: ['kornjača', 'žaba', 'riba'] },
  puz:         { word: 'puž',          en: 'snail',                        q: 'A tiny garden creature carrying a spiral brown shell on its back. Which word is it?', choices: ['puž', 'pas', 'ovca'] },
  jazavac:     { word: 'jazavac',      en: 'badger',                       q: 'A stocky black-and-white striped woodland animal foraging beneath the forest trees. Which word is it?', choices: ['lisica', 'jazavac', 'koza'] },
  medvjed:     { word: 'medvjed',      en: 'bear',                         q: 'The mighty brown king of the dense Bosnian mountain forests around Una. Which word is it?', choices: ['medvjed', 'vuk', 'konj'] },
  paprat:      { word: 'paprat',       en: 'fern',                         q: 'Feathery arching green woodland fronds growing in the cool damp shade. Which word is it?', choices: ['paprat', 'lala', 'trava'] },
  mahovina:    { word: 'mahovina',     en: 'moss',                         q: 'Soft velvety green carpet covering damp rocks and roots beside the river. Which word is it?', choices: ['mahovina', 'snijeg', 'pijesak'] },
  jasen:       { word: 'jasen',        en: 'ash tree',                     q: 'A tall pale-barked woodland tree shading the banks of National Park Una. Which word is it?', choices: ['jasen', 'bor', 'vrba'] },

  // Zone 7: Stari Grad Sokolac Watchtower and Finale (5 + 1)
  stepeniste:  { word: 'stepenište',   en: 'stone staircase',              q: 'The winding flight of stone steps climbing up to the hilltop tower of Sokolac. Which word is it?', choices: ['stepenište', 'cesta', 'brvno'] },
  osam:        { word: 'osam',         en: 'eight',                        q: 'How many stone battlements crown the upper rampart of Sokolac watchtower?', choices: ['šest', 'osam', 'pet'] },
  horizont:    { word: 'horizont',     en: 'horizon',                      q: 'The far bright line where the green Krajina hills meet the spring sky. Which word is it?', choices: ['horizont', 'obala', 'trg'] },
  sokol:       { word: 'sokol',        en: 'falcon',                       q: 'The swift keen-eyed bird that gave Stari Grad Sokolac its name. Which word is it?', choices: ['sokol', 'labud', 'pijetao'] },
  osmatracnica:{ word: 'osmatračnica', en: 'watchtower, lookout tower',    q: 'The tall medieval stone keep of Stari Grad Sokolac watching over the entire Una valley. Which word is it?', choices: ['osmatračnica', 'pekara', 'sjenica'] },

  // Finale
  priroda:     { word: 'priroda',      en: 'nature' },
};

export const ORDER = Object.keys(WORDS);

// The travelogue page revealed after the finale.
export const CULTURE = {
  place: 'Bihać',
  subtitle: 'Bosnia and Herzegovina · on the emerald Una',
  facts: [
    ['The Emerald Una', 'Legend says Roman soldiers cried "Una!" (the one and only) when they first saw the river\'s emerald-green waters. Its lime-rich current builds mossy travertine cascades (bukovi) and lush river islands (ade) all the way through Bihać.'],
    ['Kapetanova Kula', 'Standing right beside the old town walls, Captain\'s Tower is one of Bihać\'s oldest medieval landmarks. According to local lore, it once sheltered King Béla IV in 1242, and today it houses the Una-Sana Canton museum.'],
    ['Fethija Mosque', 'Originally built in 1266 as the Gothic Church of St. Anthony of Padua and converted into a mosque in 1592, Fethija is the only Gothic-style mosque in Bosnia and Herzegovina, keeping its pointed lancet windows and stone rose window.'],
    ['Japodes Stilt Houses', 'More than two thousand years ago, the ancient Illyrian Japodes tribe built entire villages of wooden stilt houses (sojenice) over the clear shallows of the Una around Bihać, living from river fishing, timber and pottery.'],
    ['The Una Regatta', 'Every summer, hundreds of rafts and traditional wooden Una boats (lađe) ride the foaming cascades from Martin Brod and Štrbački buk down to Bihać in one of the Balkans\' best-loved river festivals.'],
    ['Stari Grad Sokolac', 'High on a green hill south-east of Bihać rises the slender medieval watchtower of Sokolac, named after the falcon (sokol), guarding the valley approaches to Bosanska Krajina since the 14th century.'],
  ],
};
