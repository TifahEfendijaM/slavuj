// Travnik (summer): 68 learnable words + the finale word 'ljeto', plus the culture travelogue page.
// Keep this module import-free so the Bosnia map (src/maps/counts.js) stays light.
export const WORDS = {
  // Zone 1: Plava voda Spring and Riverside Cafés (9)
  plava:      { word: 'plava',      en: 'blue',                         q: 'Travnik\'s famous cold spring is named after this colour: ___ voda. Which colour is it?', choices: ['plava', 'zelena', 'žuta'] },
  bistra:     { word: 'bistra',     en: 'crystal clear (water)',        q: 'You can see every smooth stone at the bottom of the mountain spring. How is the water?', choices: ['mutna', 'bistra', 'strma'] },
  pastrmka:   { word: 'pastrmka',   en: 'trout',                        q: 'A spotted mountain river fish swimming in the cold Plava voda. Which word is it?', choices: ['pastrmka', 'labud', 'žaba'] },
  terasa:     { word: 'terasa',     en: 'terrace, waterside deck',      q: 'The wooden deck built right over the rushing blue stream for sitting and drinking coffee. Which word is it?', choices: ['terasa', 'pećina', 'kula'] },
  secija:     { word: 'sećija',     en: 'traditional cushioned bench',  q: 'A low wooden bench piled with woven cushions along the riverside café. Which word is it?', choices: ['sećija', 'ljuljačka', 'sanke'] },
  suncobran:  { word: 'suncobran',  en: 'parasol, sun umbrella',        q: 'A wide cloth shade opened over the café tables against the summer sun. Which word is it?', choices: ['kišobran', 'suncobran', 'šator'] },
  cajnik:     { word: 'čajnik',     en: 'teapot',                       q: 'Hot herbal tea is brewed and poured from this pot on the terrace table. Which word is it?', choices: ['džezva', 'čajnik', 'kanta'] },
  limunada:   { word: 'limunada',   en: 'lemonade',                     q: 'A cool yellow summer drink with fresh lemon slices on the café table. Which word is it?', choices: ['limunada', 'kahva', 'supa'] },
  konobarica: { word: 'konobarica', en: 'waitress',                     q: 'Who is bringing tea and cold lemonade out onto the riverside terrace?', choices: ['konobarica', 'slikarica', 'vrtlar'] },

  // Zone 2: Šarena džamija and Craft Arcade (11)
  sarena:     { word: 'šarena',     en: 'colourful, painted',           q: 'Travnik\'s Sulejmanija Mosque is famous for its bright floral painted walls: ___ džamija. Which word is it?', choices: ['bijela', 'šarena', 'stara'] },
  freska:     { word: 'freska',     en: 'wall painting, fresco',        q: 'Painted floral motifs and geometric panels decorating the mosque facade. Which word is it?', choices: ['freska', 'prozor', 'krov'] },
  stub:       { word: 'stub',       en: 'pillar, stone column',         q: 'Sturdy stone columns supporting the arched bazaar beneath Šarena džamija. Which word is it?', choices: ['dimnjak', 'stub', 'stepenice'] },
  sest:       { word: 'šest',       en: 'six',                          q: 'How many painted stone arches line the front arcade of the mosque bazaar?', choices: ['četiri', 'pet', 'šest'] },
  trgovina:   { word: 'trgovina',   en: 'shop, store',                  q: 'Little craft shops nestled right under the mosque\'s stone arcade. Which word is it?', choices: ['trgovina', 'bolnica', 'škola'] },
  tkanina:    { word: 'tkanina',    en: 'fabric, cloth',                q: 'Rolls of bright woven cloth displayed outside the bazaar shop. Which word is it?', choices: ['tkanina', 'kamen', 'daska'] },
  konac:      { word: 'konac',      en: 'thread',                       q: 'Colourful spools wound tightly for sewing clothes in the tailor\'s shop. Which word is it?', choices: ['konac', 'bakar', 'brašno'] },
  torba:      { word: 'torba',      en: 'bag',                          q: 'A handmade leather shoulder bag hanging in the artisan stall. Which word is it?', choices: ['vreća', 'torba', 'korpa'] },
  papuce:     { word: 'papuče',     en: 'slippers',                     q: 'Soft embroidered traditional indoor shoes lined up on the shop bench. Which word is it?', choices: ['čizme', 'papuče', 'skije'] },
  nakit:      { word: 'nakit',      en: 'jewellery',                    q: 'Shining silver bracelets and necklaces arranged on velvet in the bazaar. Which word is it?', choices: ['nakit', 'hljeb', 'novine'] },
  krojac:     { word: 'krojač',     en: 'tailor',                       q: 'Who measures cloth and sews fine vests in the bazaar arcade?', choices: ['pekar', 'krojač', 'mlinar'] },

  // Zone 3: Clock Towers, Medresa, Ivo Andrić House and Vizier Turbe (12)
  makaze:     { word: 'makaze',     en: 'scissors',                     q: 'The metal two-bladed tool on the tailor\'s table for cutting fabric. Which word is it?', choices: ['makaze', 'motika', 'sjekira'] },
  kazaljka:   { word: 'kazaljka',   en: 'clock hand',                   q: 'The long golden pointer moving round the face of Travnik\'s Sahat-kula. Which word is it?', choices: ['kazaljka', 'zvono', 'grb'] },
  broj:       { word: 'broj',       en: 'number',                       q: 'The golden numerals marking the hours around the clock tower dial. Which word is it?', choices: ['slovo', 'broj', 'boja'] },
  turbe:      { word: 'turbe',      en: 'mausoleum (Ottoman tomb)',     q: 'An open-sided domed stone pavilion sheltering the tombs of Bosnian viziers. Which word is it?', choices: ['turbe', 'han', 'sjenica'] },
  natpis:     { word: 'natpis',     en: 'inscription, plaque',          q: 'Old carved lines on a stone tablet set above the vizier pavilion. Which word is it?', choices: ['natpis', 'slika', 'karta'] },
  biblioteka: { word: 'biblioteka', en: 'library',                      q: 'The quiet stone hall of the old medresa filled with manuscripts and books. Which word is it?', choices: ['pekara', 'biblioteka', 'pijaca'] },
  knjiga:     { word: 'knjiga',     en: 'book',                         q: 'Bound pages of stories and chronicles stacked on the reading table. Which word is it?', choices: ['knjiga', 'tanjir', 'kanta'] },
  polica:     { word: 'polica',     en: 'bookshelf, shelf',             q: 'Wooden tiers lined along the library wall holding rows of books. Which word is it?', choices: ['klupa', 'polica', 'ograda'] },
  pisac:      { word: 'pisac',      en: 'writer, author',               q: 'Who sits at the wooden desk at Ivo Andrić\'s birthplace writing stories of Travnik?', choices: ['pisac', 'vozač', 'ribar'] },
  pero:       { word: 'pero',       en: 'quill pen, feather',           q: 'The white feather pen the writer dips to write on paper. Which word is it?', choices: ['pero', 'kašika', 'štap'] },
  tinta:      { word: 'tinta',      en: 'ink',                          q: 'The little glass bottle of dark blue liquid beside the writer\'s quill. Which word is it?', choices: ['mlijeko', 'tinta', 'med'] },
  pismo:      { word: 'pismo',      en: 'letter',                       q: 'A neatly folded sheet sealed with red wax on the writer\'s desk. Which word is it?', choices: ['pismo', 'karta', 'vreća'] },

  // Zone 4: Travnik Food Plaza - Ćevapi, Pita and Dining (12)
  rostilj:    { word: 'roštilj',    en: 'grill, barbecue',              q: 'Travnik\'s famous ćevapi are sizzling over this iron grate. Which word is it?', choices: ['roštilj', 'peć', 'sto'] },
  zar:        { word: 'žar',        en: 'glowing embers',               q: 'Bright orange-red hot coals glowing beneath the iron grill. Which word is it?', choices: ['snijeg', 'žar', 'led'] },
  kuhar:      { word: 'kuhar',      en: 'chef, cook',                   q: 'Who wears a tall white hat and tends the Travnik grill?', choices: ['kuhar', 'poštar', 'skijaš'] },
  kuhati:     { word: 'kuhati',     en: 'to cook',                      q: 'What is the chef doing over the steaming pot and sizzling grill?', choices: ['spavati', 'kuhati', 'plivati'] },
  tepsija:    { word: 'tepsija',    en: 'round metal baking pan',       q: 'The wide round copper-and-tin pan used to bake Bosnian pies. Which word is it?', choices: ['tepsija', 'šolja', 'čaša'] },
  pita:       { word: 'pita',       en: 'savory spiral pastry pie',     q: 'Thin rolled pastry coiled in a spiral inside the baking pan. Which word is it?', choices: ['pita', 'supa', 'salata'] },
  kajmak:     { word: 'kajmak',     en: 'rich clotted cream',           q: 'Thick creamy dairy spread served warm alongside Travnik ćevapi. Which word is it?', choices: ['šećer', 'kajmak', 'brašno'] },
  jogurt:     { word: 'jogurt',     en: 'yogurt',                       q: 'A cool white fermented milk drink poured in a glass beside pita. Which word is it?', choices: ['jogurt', 'čaj', 'kahva'] },
  paradajz:   { word: 'paradajz',   en: 'tomato',                       q: 'Ripe round red summer vegetables piled in a wooden crate by the kitchen. Which word is it?', choices: ['jabuka', 'paradajz', 'bundeva'] },
  krastavac:  { word: 'krastavac',  en: 'cucumber',                     q: 'Long crisp green summer vegetables arranged beside the tomatoes. Which word is it?', choices: ['mrkva', 'krastavac', 'kukuruz'] },
  tanjir:     { word: 'tanjir',     en: 'plate',                        q: 'The round ceramic dish set at each place on the dining table. Which word is it?', choices: ['tanjir', 'kanta', 'lonac'] },
  kasika:     { word: 'kašika',     en: 'spoon',                        q: 'The rounded metal utensil resting beside the plate for soup and yogurt. Which word is it?', choices: ['kašika', 'olovka', 'čekić'] },

  // Zone 5: Lašva River Valley and Farmstead (10)
  viljuska:   { word: 'viljuška',   en: 'fork',                         q: 'The pronged utensil laid on the left side of the dining plate. Which word is it?', choices: ['viljuška', 'metla', 'veslo'] },
  noz:        { word: 'nož',        en: 'knife',                        q: 'The table blade placed on the right side of the plate for cutting bread and cheese. Which word is it?', choices: ['nož', 'ključ', 'štap'] },
  hrast:      { word: 'hrast',      en: 'oak tree',                     q: 'A broad, sturdy Bosnian hardwood tree shading the Lašva riverbank. Which word is it?', choices: ['hrast', 'vrba', 'bor'] },
  breza:      { word: 'breza',      en: 'birch tree',                   q: 'A slender tree recognized right away by its pale white bark. Which word is it?', choices: ['lipa', 'breza', 'javor'] },
  sljunak:    { word: 'šljunak',    en: 'gravel, river pebbles',        q: 'Pale smooth river pebbles forming a shallow bar along the Lašva River. Which word is it?', choices: ['trava', 'šljunak', 'snijeg'] },
  sijeno:     { word: 'sijeno',     en: 'hay',                          q: 'Sun-dried golden grass mounded into a tall haystack on the valley meadow. Which word is it?', choices: ['sijeno', 'lišće', 'drva'] },
  guska:      { word: 'guska',      en: 'goose',                        q: 'A plump white farm bird with a long neck waddling near the Lašva bank. Which word is it?', choices: ['guska', 'vrana', 'sova'] },
  pijetao:    { word: 'pijetao',    en: 'rooster',                      q: 'The proud farm bird with a bright red comb perched by the fence at dawn. Which word is it?', choices: ['pijetao', 'golub', 'lasta'] },
  kokos:      { word: 'kokoš',      en: 'hen',                          q: 'The feathered mother bird pecking grain in the valley farmyard. Which word is it?', choices: ['kokoš', 'patka', 'roda'] },
  jaje:       { word: 'jaje',       en: 'egg',                          q: 'Smooth oval shells resting safely in a straw nest beside the hens. Which word is it?', choices: ['jaje', 'orah', 'jabuka'] },

  // Zone 6: Mount Vlašić Foothills and Shepherds (9)
  pastir:     { word: 'pastir',     en: 'shepherd',                     q: 'Who watches over the mountain sheep on the green slopes of Vlašić?', choices: ['pastir', 'kuhar', 'konobar'] },
  stap:       { word: 'štap',       en: 'shepherd staff, walking stick', q: 'The long curved wooden stick held by the shepherd on the hillside. Which word is it?', choices: ['štap', 'udica', 'gitara'] },
  stado:      { word: 'stado',      en: 'herd, flock (of sheep)',       q: 'A whole group of Vlašić mountain sheep grazing together on the slope. Which word is it?', choices: ['jato', 'stado', 'šuma'] },
  tor:        { word: 'tor',        en: 'sheepfold, fenced pen',        q: 'The rustic wooden enclosure where the shepherd gathers his sheep at dusk. Which word is it?', choices: ['tor', 'trg', 'teren'] },
  zvonce:     { word: 'zvonce',     en: 'small sheep bell',             q: 'A tiny brass bell tied at the lead sheep\'s neck so the flock can be heard. Which word is it?', choices: ['zvonce', 'sat', 'fenjer'] },
  bacva:      { word: 'bačva',      en: 'wooden barrel, cask',          q: 'A staved oak tub where famous salted Vlašić white cheese ages in brine. Which word is it?', choices: ['bačva', 'korpa', 'kanta'] },
  mlijeko:    { word: 'mlijeko',    en: 'milk',                         q: 'Fresh white sheep milk in a gleaming metal churn beside the cheese barrel. Which word is it?', choices: ['sok', 'mlijeko', 'voda'] },
  kupina:     { word: 'kupina',     en: 'blackberry',                   q: 'Dark purple-black wild berries ripening on thorny bushes along the Vlašić trail. Which word is it?', choices: ['jagoda', 'kupina', 'dunja'] },
  gljiva:     { word: 'gljiva',     en: 'mushroom',                     q: 'Spotted woodland caps sprouting in the cool shade beneath the hillside oaks. Which word is it?', choices: ['gljiva', 'cvijet', 'lala'] },

  // Zone 7: Stari Grad Travnik Fortress and Finale (5 + 1)
  muzej:      { word: 'muzej',      en: 'museum',                       q: 'The stone pavilion inside the old fortress preserving Travnik\'s centuries of history. Which word is it?', choices: ['muzej', 'apoteka', 'stanica'] },
  balkon:     { word: 'balkon',     en: 'balcony',                      q: 'The carved wooden lookout jutting from the historic Bosnian house over the valley. Which word is it?', choices: ['balkon', 'podrum', 'krov'] },
  barjak:     { word: 'barjak',     en: 'banner, ceremonial flag',      q: 'The tall crimson-and-gold pennant flying high above the fortress tower. Which word is it?', choices: ['barjak', 'ćilim', 'prostirka'] },
  vezir:      { word: 'vezir',      en: 'vizier (Ottoman governor)',    q: 'For 150 years seventy-seven Ottoman governors ruled Bosnia from Travnik. What was their title?', choices: ['vezir', 'mlinar', 'vrtlar'] },
  zidine:     { word: 'zidine',     en: 'fortress walls, ramparts',     q: 'The towering medieval stone walls of Stari Grad crowning the rocky crag above Travnik. Which word is it?', choices: ['zidine', 'cesta', 'obala'] },

  // Finale
  ljeto:      { word: 'ljeto',      en: 'summer' },
};

export const ORDER = Object.keys(WORDS);

// The travelogue page revealed after the finale.
export const CULTURE = {
  place: 'Travnik',
  subtitle: 'Bosnia and Herzegovina · the Viziers\' Town beneath Vlašić',
  facts: [
    ['The Viziers\' Town', 'From 1699 to 1850 Travnik was the seat of the Ottoman viziers of Bosnia. Seventy-seven governors ruled from its konaks, leaving behind ornate turbes, mosques and fountains across the narrow Lašva valley.'],
    ['Plava Voda', 'A crystal-clear karst spring bursting from beneath the fortress cliff at a chilly 6 to 8 degrees Celsius all summer. Wooden café terraces overhang the rushing turquoise stream where locals sip Bosnian coffee and tea.'],
    ['Šarena Džamija', 'Built in the 18th century and renewed in 1815, Sulejmanija Mosque is famous across Bosnia for its colourful floral wall paintings and for the vaulted bezistan bazaar built right into its ground floor.'],
    ['Two Clock Towers', 'Travnik is the only town in Bosnia and Herzegovina with two historic Ottoman clock towers (Sahat-kule), one in Gornja čaršija and one at Musala, both marking the hours across the valley.'],
    ['Ivo Andrić', 'Nobel Prize winning author Ivo Andrić was born in Travnik in 1892. His famous novel Bosnian Chronicle (Travnička hronika) captures life in the town during the Napoleonic era when French and Austrian consuls lived beside the vizier.'],
    ['Vlašić Cheese and Ćevapi', 'High above Travnik rises Mount Vlašić, homeland of nomadic shepherds, the shaggy Tornjak mountain dog, and famous brined white sheep cheese, paired down in town with sizzling Travnik ćevapi and warm somun.'],
  ],
};
