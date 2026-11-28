// Jajce (spring): 72 learnable words + the finale word 'proljeće', plus the culture travelogue page.
// Keep this module import-free so the Bosnia map (src/maps/counts.js) stays light.
export const WORDS = {
  // Zone 1: Pliva Waterfall and Viewpoint (9)
  slap:       { word: 'slap',       en: 'cascade, waterfall',           q: 'The Pliva River tumbles down the cliff in white foaming sheets. Which word names this cascade?', choices: ['slap', 'izvor', 'most'] },
  sedra:      { word: 'sedra',      en: 'travertine (tufa rock)',       q: 'The porous limestone rock formed by the Pliva water that builds the waterfall cliff. Which word is it?', choices: ['pijesak', 'sedra', 'bakar'] },
  duga:       { word: 'duga',       en: 'rainbow',                      q: 'A coloured arc shines in the mist rising from the waterfall. Which word is it?', choices: ['oblak', 'sunce', 'duga'] },
  kap:        { word: 'kap',        en: 'drop (of water)',              q: 'A single tiny bead of water rising in the waterfall spray. Which word is it?', choices: ['kap', 'kamen', 'grana'] },
  sjenica:    { word: 'sjenica',    en: 'gazebo, pavilion',             q: 'A small roofed wooden pavilion overlooking the waterfall. Which word is it?', choices: ['pekara', 'sjenica', 'kula'] },
  lala:       { word: 'lala',       en: 'tulip',                        q: 'A cup-shaped spring flower blooming in red and yellow beds by the viewpoint. Which word is it?', choices: ['lala', 'jabuka', 'bor'] },
  maslacak:   { word: 'maslačak',   en: 'dandelion',                    q: 'Bright yellow wildflowers scattered across the spring lawn. Which word is it?', choices: ['orah', 'maslačak', 'kukuruz'] },
  dvogled:    { word: 'dvogled',    en: 'binoculars',                   q: 'What is the visitor holding up to her eyes to see the waterfall closely?', choices: ['dvogled', 'kišobran', 'sat'] },
  ruksak:     { word: 'ruksak',     en: 'backpack',                     q: 'What is the hiker carrying on his back at the viewpoint?', choices: ['kaput', 'ruksak', 'kofer'] },

  // Zone 2: Wooden Watermills - Mlinčići (10)
  mlin:       { word: 'mlin',       en: 'watermill',                    q: 'A small wooden house on stilts over the rushing Pliva that grinds grain. Which word is it?', choices: ['mlin', 'škola', 'han'] },
  tocak:      { word: 'točak',      en: 'wheel (waterwheel)',           q: 'The wooden wheel turned by the rushing stream beside the mill. Which word is it?', choices: ['krov', 'točak', 'prozor'] },
  mlinar:     { word: 'mlinar',     en: 'miller',                       q: 'Who works at the watermill and carries sacks of freshly ground flour?', choices: ['mlinar', 'konobar', 'vozač'] },
  brasno:     { word: 'brašno',     en: 'flour',                        q: 'The fine white powder ground from grain inside the mill. Which word is it?', choices: ['šećer', 'brašno', 'pijesak'] },
  zito:       { word: 'žito',       en: 'wheat, grain',                 q: 'Golden stalks and grain brought to the watermill to be ground. Which word is it?', choices: ['trava', 'lišće', 'žito'] },
  vreca:      { word: 'vreća',      en: 'sack',                         q: 'Flour and grain are stored in these heavy cloth bags. Which word is it?', choices: ['vreća', 'čaša', 'korpa'] },
  daska:      { word: 'daska',      en: 'plank, wooden board',          q: 'Flat sawn pieces of oak stacked beside the wooden mills. Which word is it?', choices: ['stijena', 'daska', 'zid'] },
  brvno:      { word: 'brvno',      en: 'wooden footbridge',            q: 'A narrow log-and-plank footbridge laid across the mill stream. Which word is it?', choices: ['brvno', 'cesta', 'trg'] },
  brana:      { word: 'brana',      en: 'dam, weir',                    q: 'The low stone and timber barrier that guides water to the mills. Which word is it?', choices: ['kula', 'brana', 'kuća'] },
  izvor:      { word: 'izvor',      en: 'spring (water source)',        q: 'Clear cold water bubbling straight out of the mossy hillside rock. Which word is it?', choices: ['izvor', 'oblak', 'dim'] },

  // Zone 3: Pliva Lake and Spring Meadow (13)
  labud:      { word: 'labud',      en: 'swan',                         q: 'A large graceful white bird with a curved neck gliding on Pliva Lake. Which word is it?', choices: ['golub', 'labud', 'patka'] },
  zaba:       { word: 'žaba',       en: 'frog',                         q: 'The small green creature sitting on a lily pad by the shore. Which word is it?', choices: ['žaba', 'riba', 'mačka'] },
  lokvanj:    { word: 'lokvanj',    en: 'water lily',                   q: 'Round green leaves and pale blossoms floating on the calm lake. Which word is it?', choices: ['lokvanj', 'jablan', 'šuma'] },
  trska:      { word: 'trska',      en: 'reeds',                        q: 'Tall slender stalks growing in the shallow water along the lake edge. Which word is it?', choices: ['trska', 'cvijet', 'kaldrma'] },
  vrba:       { word: 'vrba',       en: 'willow tree',                  q: 'A lakeside tree whose long green branches droop toward the water. Which word is it?', choices: ['lipa', 'vrba', 'javor'] },
  pecati:     { word: 'pecati',     en: 'to fish',                      q: 'What is the man sitting on the wooden pier doing with his rod?', choices: ['plivati', 'pecati', 'spavati'] },
  udica:      { word: 'udica',      en: 'fishing rod / hook',           q: 'What is the fisherman holding out over the lake water?', choices: ['udica', 'metla', 'gitara'] },
  kanta:      { word: 'kanta',      en: 'bucket',                       q: 'The round pail sitting on the pier beside the fisherman. Which word is it?', choices: ['tanjir', 'šolja', 'kanta'] },
  livada:     { word: 'livada',     en: 'meadow',                       q: 'The wide sunny field of fresh green grass and wildflowers above the lake. Which word is it?', choices: ['livada', 'ulica', 'čaršija'] },
  djetelina:  { word: 'djetelina',  en: 'clover',                       q: 'Little three-leafed green plants growing in patches on the meadow. Which word is it?', choices: ['djetelina', 'kukuruz', 'orah'] },
  leptir:     { word: 'leptir',     en: 'butterfly',                    q: 'A bright-winged insect fluttering over the meadow flowers. Which word is it?', choices: ['ptica', 'leptir', 'riba'] },
  pcela:      { word: 'pčela',      en: 'bee',                          q: 'The small striped insect gathering nectar from the spring blossoms. Which word is it?', choices: ['pčela', 'ovca', 'pas'] },
  kosnica:    { word: 'košnica',    en: 'beehive',                      q: 'Colourful wooden boxes on the meadow where bees make honey. Which word is it?', choices: ['kuća', 'košnica', 'klupa'] },

  // Zone 4: Old Town, Orchards and Spring Market (14)
  tresnja:    { word: 'trešnja',    en: 'cherry tree',                  q: 'A fruit tree covered in soft pink spring flowers in the orchard. Which word is it?', choices: ['trešnja', 'bor', 'hrast'] },
  sljiva:     { word: 'šljiva',     en: 'plum tree',                    q: 'A Bosnian orchard tree blooming white in spring before bearing purple fruit. Which word is it?', choices: ['jablan', 'šljiva', 'lipa'] },
  behar:      { word: 'behar',      en: 'spring blossom',               q: 'The cloud of pink and white flowers covering fruit trees in spring. Which word is it?', choices: ['snijeg', 'behar', 'lišće'] },
  pupoljak:   { word: 'pupoljak',   en: 'bud',                          q: 'A tight young shoot on a branch just before it opens into a flower. Which word is it?', choices: ['pupoljak', 'kamen', 'plod'] },
  korijen:    { word: 'korijen',    en: 'root',                         q: 'The thick woody base of an old tree gripping the mossy earth. Which word is it?', choices: ['grana', 'korijen', 'krov'] },
  roda:       { word: 'roda',       en: 'stork',                        q: 'A tall white-and-black bird with long red legs returning in spring. Which word is it?', choices: ['roda', 'vrana', 'sova'] },
  gnijezdo:   { word: 'gnijezdo',   en: 'nest',                         q: 'The wide ring of twigs built atop the chimney for the stork. Which word is it?', choices: ['kavez', 'gnijezdo', 'dimnjak'] },
  lasta:      { word: 'lasta',      en: 'swallow (bird)',               q: 'Small dark swift birds with forked tails that arrive with spring. Which word is it?', choices: ['lasta', 'patka', 'labud'] },
  pijaca:     { word: 'pijaca',     en: 'open-air market',              q: 'A lively row of stalls selling fresh spring fruit and greens. Which word is it?', choices: ['pijaca', 'bolnica', 'pošta'] },
  korpa:      { word: 'korpa',      en: 'basket',                       q: 'Woven willow containers filled with fresh produce on the market stalls. Which word is it?', choices: ['vreća', 'korpa', 'kanta'] },
  jagoda:     { word: 'jagoda',     en: 'strawberry',                   q: 'Sweet red spring berries piled in baskets at the market. Which word is it?', choices: ['jagoda', 'jabuka', 'dunja'] },
  vrtlar:     { word: 'vrtlar',     en: 'gardener',                     q: 'Who tends the flower beds and young saplings in the spring garden?', choices: ['vrtlar', 'pekar', 'ribar'] },
  zalijevati: { word: 'zalijevati', en: 'to water (plants)',            q: 'What is the gardener doing with her watering can over the flowers?', choices: ['kuhati', 'zalijevati', 'čitati'] },
  motika:     { word: 'motika',     en: 'hoe',                          q: 'The long-handled garden tool used to loosen the spring soil. Which word is it?', choices: ['motika', 'čekić', 'veslo'] },

  // Zone 5: St. Luke's Bell Tower, Medvjed-kula and Catacombs (9)
  zvonik:     { word: 'zvonik',     en: 'bell tower',                   q: 'The tall medieval stone tower of St. Luke rising above old Jajce. Which word is it?', choices: ['zvonik', 'munara', 'mlin'] },
  zvono:      { word: 'zvono',      en: 'bell',                         q: 'The bronze bell hanging inside the top arch of the tower. Which word is it?', choices: ['sat', 'zvono', 'fenjer'] },
  kamen:      { word: 'kamen',      en: 'stone',                        q: 'Heavy hewn blocks that form the ancient towers and walls of Jajce. Which word is it?', choices: ['drvo', 'kamen', 'staklo'] },
  svod:       { word: 'svod',       en: 'vault, stone arch',            q: 'The curved stone archway spanning the old medieval gateway. Which word is it?', choices: ['svod', 'stepenice', 'prozor'] },
  pecina:     { word: 'pećina',     en: 'cave, rock chamber',           q: 'The underground rock-cut catacombs carved beneath the fortress hill. Which word is it?', choices: ['kuća', 'pećina', 'dvorište'] },
  svijeca:    { word: 'svijeća',    en: 'candle',                       q: 'Warm wax tapers glowing at the stone entrance to the catacombs. Which word is it?', choices: ['lampa', 'svijeća', 'zvijezda'] },
  grb:        { word: 'grb',        en: 'coat of arms',                 q: 'The medieval Bosnian shield with golden lilies carved above the gate. Which word is it?', choices: ['zastava', 'grb', 'slika'] },
  kruna:      { word: 'kruna',      en: 'crown',                        q: 'The golden royal symbol of the last Bosnian king crowned in Jajce. Which word is it?', choices: ['šešir', 'kaciga', 'kruna'] },
  prolaz:     { word: 'prolaz',     en: 'passage, archway',             q: 'The covered stone passage through the old Travnik town gate. Which word is it?', choices: ['prolaz', 'trg', 'obala'] },

  // Zone 6: Vrbas Canyon, Picnic and Hillside (14)
  kanjon:     { word: 'kanjon',     en: 'canyon',                       q: 'The deep steep-walled valley carved by the emerald Vrbas River. Which word is it?', choices: ['kanjon', 'livada', 'trg'] },
  splav:      { word: 'splav',      en: 'raft',                         q: 'A wooden craft moored on the emerald Vrbas below the waterfall. Which word is it?', choices: ['tramvaj', 'splav', 'bicikl'] },
  veslo:      { word: 'veslo',      en: 'oar, paddle',                  q: 'The long wooden blade resting across the raft for steering on the river. Which word is it?', choices: ['štap', 'veslo', 'motika'] },
  sator:      { word: 'šator',      en: 'tent',                         q: 'A bright cloth shelter pitched on the sunny river meadow. Which word is it?', choices: ['šator', 'koliba', 'sjenica'] },
  prostirka:  { word: 'prostirka',  en: 'picnic mat, blanket',          q: 'The checkered cloth spread on the grass for a spring picnic. Which word is it?', choices: ['ćilim', 'prostirka', 'zastava'] },
  gitara:     { word: 'gitara',     en: 'guitar',                       q: 'The six-stringed wooden instrument being played on the meadow. Which word is it?', choices: ['gitara', 'truba', 'bubanj'] },
  svirati:    { word: 'svirati',    en: 'to play (an instrument)',      q: 'What is the young man doing with his guitar at the picnic?', choices: ['svirati', 'trčati', 'jesti'] },
  pjevati:    { word: 'pjevati',    en: 'to sing',                      q: 'What is his friend doing along with the guitar music?', choices: ['spavati', 'pjevati', 'plivati'] },
  sok:        { word: 'sok',        en: 'juice',                        q: 'A pitcher of sweet fruit drink set out on the picnic mat. Which word is it?', choices: ['kahva', 'sok', 'supa'] },
  kolac:      { word: 'kolač',      en: 'cake',                         q: 'Slices of sweet homemade cake served at the spring picnic. Which word is it?', choices: ['hljeb', 'sir', 'kolač'] },
  koza:       { word: 'koza',       en: 'goat',                         q: 'A sure-footed horned animal nibbling spring shoots on the rocky slope. Which word is it?', choices: ['koza', 'konj', 'pas'] },
  janje:      { word: 'janje',      en: 'lamb',                         q: 'A young woolly white animal playing on the green hillside in spring. Which word is it?', choices: ['mače', 'janje', 'zec'] },
  zelena:     { word: 'zelena',     en: 'green',                        q: 'The fresh colour of spring grass and hills all around Jajce. Which colour is it?', choices: ['žuta', 'zelena', 'crvena'] },
  cetiri:     { word: 'četiri',     en: 'four',                         q: 'How many blooming cherry trees stand in a neat row beside the picnic lawn?', choices: ['dva', 'tri', 'četiri'] },

  // Zone 7: Jajce Royal Fortress and Finale (3 + 1)
  top:        { word: 'top',        en: 'cannon',                       q: 'The old iron barrel resting on the stone rampart of the fortress. Which word is it?', choices: ['top', 'zvono', 'stub'] },
  toplo:      { word: 'toplo',      en: 'warm',                         q: 'The spring sun shines gently on the bastion bench. How does the air feel?', choices: ['hladno', 'toplo', 'klizavo'] },
  tvrdjava:   { word: 'tvrđava',    en: 'fortress, citadel',            q: 'The royal stone citadel crowning the hilltop above Jajce. Which word is it?', choices: ['tvrđava', 'pekara', 'sjenica'] },

  // Finale
  proljece:   { word: 'proljeće',   en: 'spring' },
};

export const ORDER = Object.keys(WORDS);

// The travelogue page revealed after the finale.
export const CULTURE = {
  place: 'Jajce',
  subtitle: 'Bosnia and Herzegovina · where the Pliva meets the Vrbas',
  facts: [
    ['Pliva Waterfall', 'Jajce is one of the few towns in the world with a 20-metre natural waterfall right in its centre. Over millennia the lime-rich Pliva River built the porous travertine rock (sedra) that forms the cliff as it plunges into the Vrbas.'],
    ['Mlinčići (Watermills)', 'A cluster of tiny wooden watermills built on oak stilts across the travertine ledges of the Pliva. For centuries local families ground wheat and corn here using horizontal wooden wheels turned by the clear stream.'],
    ['The Royal Town', 'In the 15th century Jajce was the seat of the medieval Bosnian kings. Stjepan Tomašević, the last king of Bosnia, was crowned in St. Luke\'s church in 1461 beneath the hilltop citadel (Tvrđava).'],
    ['St. Luke\'s Bell Tower', 'Built in the 15th century in a blend of Romanesque and Gothic stone masonry, the slender square campanile still rises above the old town roofs beside the medieval walls and Medvjed-kula (Bear Tower).'],
    ['The Catacombs', 'Carved directly into the solid hillside rock below the fortress around 1400 by Grand Duke Hrvoje Vukčić Hrvatinić, the subterranean chambers hold a stone church and crypt with carved crescents and crosses.'],
    ['Behar in Spring', 'In Bosnian, behar names the fleeting burst of pink and white blossom on cherry, plum and apple trees each spring. Along the Pliva lakes and hillsides of Jajce, petals drift across the water like warm snow.'],
  ],
};
