// Sarajevo (autumn): 78 learnable words + the finale word 'jesen', plus the culture travelogue page.
// Keep this module import-free so the Bosnia map (src/maps/counts.js) stays light.
export const WORDS = {
  // Baščaršija square and the Sebilj (8)
  sebilj:      { word: 'sebilj',      en: 'Sebilj (wooden fountain kiosk)',     q: 'This wooden fountain kiosk gives free water in the middle of the square. Which word is it?', choices: ['kula', 'sebilj', 'kuća'] },
  trg:         { word: 'trg',         en: 'square',                             q: 'The open, paved space around the Sebilj. Which word is it?',                                 choices: ['rijeka', 'krov', 'trg'] },
  jato:        { word: 'jato',        en: 'flock',                              q: 'What do you call many pigeons together?',                                                    choices: ['jato', 'gnijezdo', 'kavez'] },
  hraniti:     { word: 'hraniti',     en: 'to feed',                            q: 'What is the girl doing for the pigeons?',                                                    choices: ['brati', 'hraniti', 'čitati'] },
  kukuruz:     { word: 'kukuruz',     en: 'corn',                               q: 'What do people buy here in little cups to feed the pigeons?',                                choices: ['šećer', 'pijesak', 'kukuruz'] },
  prodavacica: { word: 'prodavačica', en: 'seller (woman)',                     q: 'Who sells the cups of corn?',                                                                choices: ['prodavačica', 'konobarica', 'učiteljica'] },
  mesti:       { word: 'mesti',       en: 'to sweep',                           q: 'What is the shopkeeper doing with his broom?',                                               choices: ['kuhati', 'mesti', 'pjevati'] },
  zedan:       { word: 'žedan',       en: 'thirsty',                            q: 'He has walked all day and stops to drink from the Sebilj. How is he?',                       choices: ['gladan', 'bolestan', 'žedan'] },

  // The bazaar lanes (10)
  carsija:     { word: 'čaršija',     en: 'bazaar (old market streets)',        q: 'The old streets of little wooden shops. Which word is it?',                                  choices: ['čaršija', 'škola', 'bolnica'] },
  kazandzija:  { word: 'kazandžija',  en: 'coppersmith',                        q: 'Who is hammering a copper tray in this workshop?',                                           choices: ['pekar', 'kazandžija', 'konobar'] },
  bakar:       { word: 'bakar',       en: 'copper',                             q: 'These trays, pans and jugs are all made of this metal. Which word is it?',                   choices: ['drvo', 'staklo', 'bakar'] },
  pekara:      { word: 'pekara',      en: 'bakery',                             q: 'Bread is baked and sold here. Which word is it?',                                            choices: ['pekara', 'apoteka', 'pošta'] },
  somun:       { word: 'somun',       en: 'somun (round flatbread)',            q: 'The round, flat bread of Sarajevo. Which word is it?',                                       choices: ['kolač', 'somun', 'sir'] },
  nositi:      { word: 'nositi',      en: 'to carry',                           q: 'What is the boy doing with the bread?',                                                      choices: ['bacati', 'peći', 'nositi'] },
  burek:       { word: 'burek',       en: 'burek (meat pie)',                   q: 'A round pie of rolled pastry and meat. Which word is it?',                                   choices: ['burek', 'supa', 'salata'] },
  cevapi:      { word: 'ćevapi',      en: 'ćevapi (grilled meat rolls)',        q: 'Small grilled meat rolls, served in flatbread with onion. Which word is it?',                choices: ['palačinke', 'ćevapi', 'kolači'] },
  slasticarna: { word: 'slastičarna', en: 'sweet shop',                         q: 'Cakes and sweets are sold here. Which word is it?',                                          choices: ['pošta', 'apoteka', 'slastičarna'] },
  baklava:     { word: 'baklava',     en: 'baklava',                            q: 'Thin pastry, walnuts and syrup, cut into diamonds. Which word is it?',                       choices: ['baklava', 'pita', 'hljeb'] },

  // Morića han and its kahvana (6)
  han:         { word: 'han',         en: 'han (old inn round a courtyard)',    q: 'Travellers and their horses once stayed in this old inn round a courtyard. Which word is it?', choices: ['škola', 'han', 'bolnica'] },
  kahvana:     { word: 'kahvana',     en: 'traditional coffee house',           q: 'People sit here for hours over Bosnian coffee. Which word is it?',                           choices: ['škola', 'pošta', 'kahvana'] },
  konobar:     { word: 'konobar',     en: 'waiter',                             q: 'Who is carrying the coffee on a tray?',                                                      choices: ['konobar', 'vozač', 'pekar'] },
  dzezva:      { word: 'džezva',      en: 'džezva (coffee pot)',                q: 'Bosnian coffee is made and served in this little copper pot with a long handle. Which word is it?', choices: ['čaša', 'džezva', 'tanjir'] },
  kahva:       { word: 'kahva',       en: 'coffee',                             q: 'Poured from the pot into small cups without handles. What are they drinking?',               choices: ['kahva', 'čaj', 'sok'] },
  razgovarati: { word: 'razgovarati', en: 'to talk',                            q: 'One talks, the other listens. What are these two friends doing?',                            choices: ['pjevati', 'razgovarati', 'spavati'] },

  // Gazi Husrev-beg mosque and the Brusa bezistan (2)
  kupola:      { word: 'kupola',      en: 'dome',                               q: 'These round roofs top the old market hall and the mosques. Which word is it?',               choices: ['dimnjak', 'prozor', 'kupola'] },
  sadrvan:     { word: 'šadrvan',     en: 'šadrvan (mosque courtyard fountain)', q: 'The big roofed fountain in a mosque courtyard, where people wash before prayer. Which word is it?', choices: ['šadrvan', 'bunar', 'kula'] },

  // The Miljacka and its quays (14)
  voda:        { word: 'voda',        en: 'water',                              q: "What flows in the Miljacka, and from the Sebilj's spouts?",                                  choices: ['mlijeko', 'voda', 'pijesak'] },
  cuprija:     { word: 'ćuprija',     en: 'old (stone) bridge',                 q: "A bridge is a most, but Sarajevo's old stone bridges keep an older word in their names: Latinska ___. Which word is it?", choices: ['kula', 'zid', 'ćuprija'] },
  jablan:      { word: 'jablan',      en: 'poplar',                             q: 'A tall, narrow tree that turns golden in autumn. Which word is it?',                         choices: ['jablan', 'cvijet', 'stub'] },
  vijecnica:   { word: 'vijećnica',   en: 'city hall',                          q: 'The striped building by the river, the old city hall. Which word is it?',                    choices: ['škola', 'vijećnica', 'pekara'] },
  inat:        { word: 'inat',        en: 'spite, stubbornness',                q: 'Its owner agreed to move only if the house was carried across the river, brick by brick. Which word names his stubborn feeling?', choices: ['ljubav', 'strah', 'inat'] },
  kesteni:     { word: 'kesteni',     en: 'chestnuts',                          q: 'In autumn these are roasted on the street and sold in paper cones. Which word is it?',       choices: ['kesteni', 'jabuke', 'orasi'] },
  prodavac:    { word: 'prodavač',    en: 'seller (man)',                       q: 'Who is selling the roasted chestnuts?',                                                      choices: ['vozač', 'prodavač', 'kazandžija'] },
  kupovati:    { word: 'kupovati',    en: 'to buy',                             q: 'What is the boy doing at the chestnut stand?',                                               choices: ['mesti', 'spavati', 'kupovati'] },
  tramvaj:     { word: 'tramvaj',     en: 'tram',                               q: 'It runs on rails along the river and rings its bell. Which word is it?',                     choices: ['tramvaj', 'autobus', 'bicikl'] },
  vozac:       { word: 'vozač',       en: 'driver',                             q: 'Who is driving the tram?',                                                                   choices: ['konobar', 'vozač', 'prodavač'] },
  patke:       { word: 'patke',       en: 'ducks',                              q: 'Who is swimming on the Miljacka?',                                                           choices: ['mačke', 'ovce', 'patke'] },
  setati:      { word: 'šetati',      en: 'to stroll',                          q: 'What are these two doing along the river?',                                                  choices: ['šetati', 'trčati', 'sjediti'] },
  kaput:       { word: 'kaput',       en: 'coat (long)',                        q: 'What is she wearing over her clothes?',                                                      choices: ['čarape', 'kaput', 'pidžama'] },
  sal:         { word: 'šal',         en: 'scarf',                              q: 'What is wrapped around his neck?',                                                           choices: ['pojas', 'čarape', 'šal'] },

  // Back street, Ferhadija and the west end (10)
  sine:        { word: 'šine',        en: 'rails (tram tracks)',                q: 'The tram runs on these. Which word is it?',                                                  choices: ['šine', 'žice', 'cijevi'] },
  kisobran:    { word: 'kišobran',    en: 'umbrella',                           q: 'She has brought it in case it rains again. Which word is it?',                               choices: ['korpa', 'kišobran', 'metla'] },
  crkva:       { word: 'crkva',       en: 'church',                             q: 'This old Orthodox church with its bell tower. Which word is it?',                            choices: ['kuća', 'pekara', 'crkva'] },
  sinagoga:    { word: 'sinagoga',    en: 'synagogue',                          q: "Sarajevo's oldest Jewish house of prayer, founded in 1581 and now a museum. Which word is it?", choices: ['sinagoga', 'pijaca', 'škola'] },
  katedrala:   { word: 'katedrala',   en: 'cathedral',                          q: 'The big church with a round window over its door. Which word is it?',                        choices: ['džamija', 'katedrala', 'škola'] },
  dva:         { word: 'dva',         en: 'two',                                q: 'How many towers does the cathedral have?',                                                   choices: ['jedan', 'tri', 'dva'] },
  sah:         { word: 'šah',         en: 'chess',                              q: 'The game with a black and white board, played here with big pieces. Which word is it?',      choices: ['šah', 'lopta', 'karte'] },
  igrati:      { word: 'igrati',      en: 'to play',                            q: 'What are these two doing at the giant chessboard?',                                          choices: ['slikati', 'igrati', 'mesti'] },
  djed:        { word: 'djed',        en: 'grandfather, old man',               q: 'Who is sitting on the bench by the game?',                                                   choices: ['dijete', 'konobar', 'djed'] },
  novine:      { word: 'novine',      en: 'newspaper',                          q: 'What is the grandfather reading?',                                                           choices: ['novine', 'tanjir', 'olovka'] },

  // The mahala hill (19)
  brdo:        { word: 'brdo',        en: 'hill',                               q: 'The green slope that rises behind the town. Which word is it?',                              choices: ['rijeka', 'brdo', 'trg'] },
  lisce:       { word: 'lišće',       en: 'leaves',                             q: 'What has fallen from the trees and lies all over the ground?',                               choices: ['snijeg', 'cvijeće', 'lišće'] },
  mahala:      { word: 'mahala',      en: 'mahala (old neighbourhood)',         q: 'The old neighbourhood of houses climbing the hill. Which word is it?',                       choices: ['mahala', 'čaršija', 'pijaca'] },
  strma:       { word: 'strma',       en: 'steep',                              q: 'Which word describes this street climbing the hill?',                                        choices: ['ravna', 'strma', 'široka'] },
  lipa:        { word: 'lipa',        en: 'linden (lime tree)',                 q: 'This big old tree by the fountain smells sweet in summer and turns yellow in autumn. Which word is it?', choices: ['jabuka', 'trava', 'lipa'] },
  avlija:      { word: 'avlija',      en: 'courtyard (of a house)',             q: 'The walled yard of an old Sarajevo house, paved with pebbles. Which word is it?',            choices: ['avlija', 'ulica', 'pijaca'] },
  kapija:      { word: 'kapija',      en: 'gate',                               q: 'The big wooden gate in the courtyard wall. Which word is it?',                               choices: ['prozor', 'kapija', 'krov'] },
  paprike:     { word: 'paprike',     en: 'peppers',                            q: 'Red vegetables roasted in autumn to make ajvar. Which word is it?',                          choices: ['jabuke', 'krompiri', 'paprike'] },
  peci:        { word: 'peći',        en: 'to roast, to bake',                  q: 'What is she doing with the peppers?',                                                        choices: ['peći', 'brati', 'mesti'] },
  dunja:       { word: 'dunja',       en: 'quince',                             q: 'A fragrant yellow fruit, kept on windowsills in autumn. Which word is it?',                  choices: ['paradajz', 'dunja', 'krompir'] },
  grozdje:     { word: 'grožđe',      en: 'grapes',                             q: 'What is hanging from the vine over the courtyard?',                                          choices: ['hljeb', 'sir', 'grožđe'] },
  orah:        { word: 'orah',        en: 'walnut',                             q: 'This tree drops nuts in hard shells. Which word is it?',                                     choices: ['orah', 'cvijet', 'jaje'] },
  vjeverica:   { word: 'vjeverica',   en: 'squirrel',                           q: 'Who is sitting in the walnut tree with a nut?',                                              choices: ['mačka', 'vjeverica', 'golub'] },
  jabuka:      { word: 'jabuka',      en: 'apple',                              q: 'What is growing on this tree?',                                                              choices: ['banana', 'jaje', 'jabuka'] },
  merdevine:   { word: 'merdevine',   en: 'ladder',                             q: 'What is she standing on to reach the apples?',                                               choices: ['merdevine', 'stolica', 'krov'] },
  brati:       { word: 'brati',       en: 'to pick',                            q: 'What is she doing with the apples?',                                                         choices: ['peći', 'brati', 'prati'] },
  stara:       { word: 'stara',       en: 'old',                                q: 'Which word describes this house, built three hundred years ago?',                            choices: ['nova', 'brza', 'stara'] },
  nana:        { word: 'nana',        en: 'grandmother',                        q: 'Who is looking out of the window?',                                                          choices: ['nana', 'dijete', 'konobar'] },
  mace:        { word: 'mače',        en: 'kitten',                             q: 'Who is playing in the courtyard?',                                                           choices: ['konj', 'mače', 'ovca'] },

  // Žuta tabija and the Vratnik wall (5)
  bedem:       { word: 'bedem',       en: 'rampart, fortress wall',             q: 'The thick old wall of the fortress on the hill above the town. Which word is it?',           choices: ['most', 'krov', 'bedem'] },
  javor:       { word: 'javor',       en: 'maple',                              q: 'This tree has wide, pointed leaves that turn red and orange. Which word is it?',             choices: ['javor', 'cvijet', 'grm'] },
  gledati:     { word: 'gledati',     en: 'to watch, to look at',               q: 'What are these two doing on the bastion, as the sun goes down?',                             choices: ['kuhati', 'gledati', 'trčati'] },
  slikarica:   { word: 'slikarica',   en: 'painter (woman)',                    q: 'Who is painting the town from the bastion?',                                                 choices: ['konobarica', 'prodavačica', 'slikarica'] },
  zuta:        { word: 'žuta',        en: 'yellow',                             q: 'This old bastion is named after the colour of its stone, the colour of lemons. Which colour is it?', choices: ['žuta', 'crvena', 'bijela'] },

  // South bank and Trebević (4)
  bundeva:     { word: 'bundeva',     en: 'pumpkin',                            q: 'Big orange vegetables piled on the stall in autumn. Which word is it?',                      choices: ['lubenica', 'bundeva', 'krompir'] },
  zicara:      { word: 'žičara',      en: 'cable car',                          q: 'Its cabins climb the mountain on a cable. Which word is it?',                                choices: ['tramvaj', 'avion', 'žičara'] },
  suma:        { word: 'šuma',        en: 'forest',                             q: 'Many trees together on the mountain. Which word is it?',                                     choices: ['šuma', 'bašta', 'trg'] },
  planina:     { word: 'planina',     en: 'mountain',                           q: 'Trebević rises high above the city. Which word is it?',                                      choices: ['rijeka', 'planina', 'ulica'] },

  // Finale
  jesen:       { word: 'jesen',       en: 'autumn' },
};

export const ORDER = Object.keys(WORDS);

// The travelogue page revealed after the finale.
export const CULTURE = {
  place: 'Sarajevo',
  subtitle: 'Bosnia and Herzegovina · on the Miljacka',
  facts: [
    ['Baščaršija', 'The bazaar has stood since the 15th century, its lanes named after crafts: Kazandžiluk for the coppersmiths, Sarači for the saddlers, Bravadžiluk for the locksmiths. By day the wooden shop fronts fold open into benches and canopies.'],
    ['The Sebilj', 'The last of the city\'s kiosk fountains, designed by Alexander Wittek. Whoever drinks from it, they say, comes back to Sarajevo.'],
    ['Gazi Husrev-beg', 'His mosque was built in 1530/31; his endowment also built the medresa, the covered bezistan and, after his death, Morića han (1551). The six-domed Brusa bezistan was built by grand vizier Rustem-paša and named after the silk of Bursa. The Sahat-kula keeps lunar time and shows 12 at sunset.'],
    ['Where East meets West', 'A line in Ferhadija\'s paving marks where the Ottoman čaršija meets Austro-Hungarian Sarajevo; the mosque, the cathedral, the Orthodox church and the synagogue stand a few minutes apart.'],
    ['Vijećnica and Inat kuća', 'The city hall opened in 1896 and later held the National Library. It burned on the night of 25 to 26 August 1992 with most of its books and reopened in 2014. Across the river, the owner of Inat kuća agreed to make way only if his house was moved over the river, brick by brick.'],
    ['Žuta tabija', 'A bastion of the 18th-century Vratnik fortress. During Ramadan a cannon fires here at sunset to end the day\'s fast; Ramadan falls in winter for some years, so in autumn the cannon is quiet.'],
  ],
};
